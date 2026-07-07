"""supervisor.py — The one checked-in, course-parameterised capture loop.

Reconciles the queue against disk, then pipelines the three stages concurrently:
record lecture N while transcribing N-1 and summarising N-2. Never prompts per
lecture, never rewrites itself per session, and survives reboot because every
state change is flushed to queue.json immediately. Pure scheduling decisions
come from queue_core; this file only launches processes and records outcomes.
"""
import os
import time

import queue_core as qc
import queue_io as qio
import stages

IN_PROGRESS = {"record": "recording", "transcribe": "transcribing", "summarize": "summarizing"}
COMPLETE = {"record": "recorded", "transcribe": "transcribed", "summarize": "done"}
ARTIFACT_OF = {"record": "audio", "transcribe": "transcript", "summarize": "summary"}
LIMITS = {"record": 1, "transcribe": 1, "summarize": 1}


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def _inflight_idxs(inflight):
    return {stage: list(procs) for stage, procs in inflight.items()}


def _max_retries(queue):
    return queue.get("maxRetries", 2)


def _all_terminal(queue, inflight):
    if any(inflight.values()):
        return False
    mr = _max_retries(queue)
    for lec in queue["lectures"].values():
        st = lec.get("status")
        if st == "done":
            continue
        if st == "failed" and lec.get("retries", 0) >= mr:
            continue
        return False
    return True


def _start_actions(queue, path, ctx, inflight):
    """Transition + launch every action the scheduler picked; flush each time."""
    actions = qc.select_next_actions(queue, LIMITS, _inflight_idxs(inflight), _max_retries(queue))
    for act in actions:
        idx, stage = act["idx"], act["stage"]
        queue = qc.apply_transition(queue, idx, IN_PROGRESS[stage])
        qio.save_queue(path, queue)
        inflight[stage][idx] = stages.LAUNCHERS[stage](ctx, queue["lectures"][idx])
        log(f"start {stage} {idx}")
    return queue


def _reap(queue, path, ctx, inflight):
    """Collect finished subprocesses and record success/failure; flush each."""
    for stage, procs in inflight.items():
        for idx in [i for i, p in procs.items() if p.poll() is not None]:
            proc = procs.pop(idx)
            ok = proc.returncode == 0 and qio.has_artifact(
                ctx["repo_root"], queue["lectures"][idx], ARTIFACT_OF[stage])
            if ok:
                queue = qc.apply_transition(queue, idx, COMPLETE[stage])
                log(f"done {stage} {idx}")
            else:
                queue = qc.apply_transition(queue, idx, "failed", f"{stage} rc={proc.returncode}")
                log(f"FAIL {stage} {idx} rc={proc.returncode}")
            qio.save_queue(path, queue)
    return queue


def _build_ctx(repo_root, skill_dir, queue, slug, cookie_file):
    asr = os.path.join(repo_root, ".agents/skills/yt-video-summarizer/scripts/extract_video_context.py")
    return {
        "repo_root": repo_root, "skill_dir": skill_dir, "slug": slug,
        "queue_dir": qio.queue_dir(repo_root, slug), "cdp_url": "http://127.0.0.1:9222",
        "speed": queue.get("playbackSpeed", 2.0), "device": os.environ.get("BLACKHOLE_DEVICE", "0"),
        "asr_provider": queue.get("asrProvider", "openai"), "asr_script": asr,
        "cookie_file": cookie_file,
    }


def run(repo_root, skill_dir, slug):
    """Idempotent resume: reconcile from disk, then drive the pipeline to done."""
    path = qio.queue_path(repo_root, slug)
    queue = qio.load_queue(path)
    queue = qc.reconcile(queue, qio.gather_disk_facts(queue, repo_root))
    qio.save_queue(path, queue)
    log(f"resumed {slug}: {qc.counts(queue)}")

    ok, detail = stages.validate_url_loads(queue["courseUrl"])
    if not ok:
        log(f"ERROR: course URL failed to load ({detail}): {queue['courseUrl']}")
        return 1

    cookie_file = stages.export_cookies(queue["courseUrl"],
                                        os.path.join(qio.queue_dir(repo_root, slug), "cookies.txt"))
    ctx = _build_ctx(repo_root, skill_dir, queue, slug, cookie_file)
    chrome = stages.start_chrome(skill_dir, ctx["cdp_url"])
    inflight = {stage: {} for stage in LIMITS}
    try:
        while not _all_terminal(queue, inflight):
            chrome = stages.ensure_chrome(chrome, skill_dir, ctx["cdp_url"])
            queue = _start_actions(queue, path, ctx, inflight)
            queue = _reap(queue, path, ctx, inflight)
            time.sleep(2)
    finally:
        stages.stop_chrome(chrome)
    log(f"finished {slug}: {qc.counts(queue)}")
    return 0
