#!/usr/bin/env python3
"""
loop.py — Shared template for encrypted-video-capture per-course loop scripts.

Per-course copies are generated from this template by the EVC skill. The only
difference between copies is the COURSE_DIR constant below.

To generate a per-course copy:
  python3 loop.py --course-dir courses/<name> [--url <course-url>]

After generation, invoke the per-course copy directly:
  python3 courses/<name>/evc-loop.py

Resume after reboot:
  python3 courses/<name>/evc-loop.py
  → re-exports cookies from Chrome (~2s)
  → reads lecture list + status from .progress.json
  → skips done lectures, resumes from first non-done lecture
"""
import argparse, json, os, re, shutil, signal, subprocess, sys, time

# ── Constants (COURSE_DIR is replaced in per-course copies) ───────────────────

COURSE_DIR = None  # REPLACED_BY_SKILL: absolute path to courses/<name>/

SKILL_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
REPO_ROOT = os.path.normpath(os.path.join(SKILL_DIR, "..", ".."))

# ── Entry point ───────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(description="EVC per-course capture loop")
    parser.add_argument("--course-dir", help="Path to courses/<name>/ directory (overrides COURSE_DIR constant)")
    parser.add_argument("--url", help="Course URL — required on first run to populate .progress.json")
    parser.add_argument("--generate", action="store_true", help="Generate a per-course copy of this script and exit")
    args = parser.parse_args()

    # Resolve course dir
    course_dir = args.course_dir or COURSE_DIR
    if course_dir is None:
        print("ERROR: No course directory specified.", file=sys.stderr)
        print("  Run: python3 loop.py --course-dir courses/<name> [--url <course-url>]", file=sys.stderr)
        sys.exit(1)

    course_dir = os.path.abspath(course_dir)
    if not os.path.isdir(course_dir):
        os.makedirs(course_dir, exist_ok=True)

    progress_file = os.path.join(course_dir, ".progress.json")

    # Generate per-course copy if requested
    if args.generate:
        generate_per_course_copy(course_dir, course_dir)
        sys.exit(0)

    # Load or initialize .progress.json
    progress = load_or_init_progress(progress_file)

    # Set courseUrl on first run if --url provided
    if args.url and not progress.get("courseUrl"):
        progress["courseUrl"] = args.url
        course_name = os.path.basename(course_dir)
        progress["courseName"] = course_name
        save_progress(progress_file, progress)
        log(f"courseUrl set to {args.url}")

    course_url = progress.get("courseUrl")
    if not course_url:
        print("ERROR: courseUrl is not set in .progress.json.", file=sys.stderr)
        print("  Run with: --url <course-url>  (e.g. https://u.geekbang.org/lesson/818)", file=sys.stderr)
        sys.exit(1)

    # Load .env overrides
    env_overrides = load_env(os.path.join(SKILL_DIR, ".env"))
    asr_provider = env_overrides.get("ASR_PROVIDER", "openai")
    asr_script = os.path.join(REPO_ROOT, ".agents/skills/yt-video-summarizer/scripts/extract_video_context.py")
    playback_speed = float(env_overrides.get("PLAYBACK_SPEED", "1.5"))
    blackhole_device = int(env_overrides.get("BLACKHOLE_DEVICE", "0"))

    # Auto-refresh cookies from Chrome on every startup
    cookie_file = f"/tmp/evc-cookies-{os.getpid()}-{int(time.time())}.txt"
    log(f"Re-exporting cookies from Chrome → {cookie_file}")
    result = subprocess.run(
        ["yt-dlp", "--cookies-from-browser", "chrome",
         "--cookies", cookie_file, "--skip-download", course_url],
        capture_output=True,
    )
    if result.returncode != 0 or not os.path.exists(cookie_file):
        log("WARNING: Cookie export failed. Proceeding without cookies (may hit auth errors).")
        log(f"  stderr: {result.stderr[-300:].decode(errors='replace')}")
        cookie_file = None

    # Build lecture list from .progress.json (ordered by key)
    lectures = build_lecture_list(progress)
    if not lectures:
        log("No lectures with URLs found in .progress.json.")
        log("Run the EVC skill to enumerate lectures into .progress.json first.")
        sys.exit(0)

    log(f"=== EVC capture session: {len(lectures)} lectures, course_dir={course_dir} ===")

    # Launch shared Chrome CDP instance
    cdp_url = "http://127.0.0.1:9222"
    log("Starting Chrome with CDP...")
    chrome_proc = subprocess.Popen(
        ["bash", os.path.join(SKILL_DIR, "scripts/start-chrome-cdp.sh")],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
    )
    cdp_ready = False
    for line in iter(chrome_proc.stdout.readline, b""):
        msg = line.decode().strip()
        log(f"  [chrome] {msg}")
        if "CDP ready" in msg or "ready" in msg.lower():
            cdp_ready = True
            break
        if "ERROR" in msg:
            log(f"ERROR: Chrome CDP failed to start: {msg}")
            sys.exit(1)
    if not cdp_ready:
        log("ERROR: Chrome CDP did not become ready")
        sys.exit(1)
    log(f"Chrome CDP ready at {cdp_url}")

    pending_asr = {}
    done_count = 0
    failed_count = 0

    for lecture in lectures:
        flush_completed_asr(pending_asr, progress_file, done_count, failed_count)

        idx = lecture["idx"]
        raw_title = lecture["title"] or f"lecture-{idx}"
        url = lecture["url"]
        duration = lecture["duration"] or 0

        safe_title = sanitize_title(raw_title)
        safe_kebab = to_kebab(safe_title) if safe_title else f"lecture-{idx}"
        out_md = os.path.join(course_dir, f"{idx}-{safe_kebab}.md")
        transcript_save = os.path.join(course_dir, f"{idx}-{safe_kebab}.transcript")

        audio_tmp_dir = f"/tmp/evc-audio/{os.path.basename(course_dir)}"
        os.makedirs(audio_tmp_dir, exist_ok=True)
        wav_file = os.path.join(audio_tmp_dir, f"tmp_{idx}.wav")
        asr_out_dir = os.path.join(audio_tmp_dir, f"asr_{idx}")
        session_id = f"evc-{os.path.basename(course_dir)}-{idx}"
        ready_file = f"/tmp/evc-ffmpeg-ready-{session_id}"
        ended_file = f"/tmp/evc-video-ended-{session_id}"

        progress = load_progress(progress_file)
        lec = progress["lectures"].get(idx, {})
        status = lec.get("status", "pending")
        retries = lec.get("retries", 0)

        if status == "done" or os.path.exists(out_md):
            log(f"  [skip] {idx} — already done")
            done_count += 1
            continue

        if os.path.exists(transcript_save):
            log(f"  [skip-transcript-ready] {idx} — transcript saved, pending summarization")
            done_count += 1
            continue

        if idx in pending_asr:
            log(f"  [skip] {idx} — ASR in progress (PID {pending_asr[idx]['proc'].pid})")
            continue

        if status == "transcribing" and os.path.exists(wav_file) and os.path.getsize(wav_file) > 100_000:
            log(f"  [resume-asr] {idx} — WAV exists ({os.path.getsize(wav_file) // 1024}KB), resuming ASR")
            start_asr_background(pending_asr, idx, wav_file, asr_out_dir, transcript_save,
                                 safe_title, url, retries, asr_script, asr_provider, env_overrides)
            continue

        if status == "failed" and retries >= 2:
            log(f"  [skip] {idx} — failed {retries}× (max retries)")
            failed_count += 1
            continue

        wall_timeout = int(duration / playback_speed) + 120 if duration > 0 else 5400
        log(f"--- [{idx}] {raw_title} | {duration}s → ~{wall_timeout // 60}min wall ---")

        progress = update_lecture(progress, idx, "recording")
        save_progress(progress_file, progress)

        for fpath in [ready_file, ended_file, wav_file]:
            try:
                os.remove(fpath)
            except OSError:
                pass

        log(f"  Starting BlackHole recording → {wav_file}")
        record_proc = subprocess.Popen(
            ["bash", os.path.join(SKILL_DIR, "scripts/record-audio.sh"),
             str(blackhole_device), wav_file, session_id],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )

        waited = 0
        while not os.path.exists(ready_file) and waited < 15:
            time.sleep(1)
            waited += 1
        if not os.path.exists(ready_file):
            log(f"  ERROR: ffmpeg did not start within 15s — skipping {idx}")
            record_proc.terminate()
            progress = load_progress(progress_file)
            progress = update_lecture(progress, idx, "failed")
            save_progress(progress_file, progress)
            failed_count += 1
            continue
        log(f"  ffmpeg ready. Launching Chrome for {url}")

        play_env = os.environ.copy()
        play_env.update(env_overrides)
        play_env["PLAYBACK_SPEED"] = str(playback_speed)
        play_env["CHROME_CDP_URL"] = cdp_url
        play_log = open(f"/tmp/evc-play-{session_id}.log", "w")
        play_args = [
            "node", os.path.join(SKILL_DIR, "playwright/runner.mjs"),
            "--action", "play",
            "--url", url,
            "--session-id", session_id,
            "--duration", str(duration),
        ]
        if cookie_file:
            play_args += ["--cookies", cookie_file]
        play_proc = subprocess.Popen(
            play_args, env=play_env, stdout=subprocess.DEVNULL, stderr=play_log,
        )

        elapsed = 0
        while not os.path.exists(ended_file) and elapsed < wall_timeout:
            if play_proc.poll() is not None:
                log(f"  Playwright exited (rc={play_proc.returncode})")
                break
            time.sleep(2)
            elapsed += 2

        if elapsed >= wall_timeout:
            log(f"  WARNING: Wall-clock timeout ({wall_timeout}s) for {idx}")

        time.sleep(3)
        try:
            record_proc.send_signal(signal.SIGINT)
            record_proc.wait(timeout=15)
        except Exception as e:
            log(f"  WARNING: record stop issue: {e}")
            record_proc.terminate()

        play_log.close()
        if play_proc.poll() is None:
            try:
                play_proc.wait(timeout=5)
            except Exception:
                play_proc.terminate()

        for fpath in [ready_file, ended_file]:
            try:
                os.remove(fpath)
            except OSError:
                pass

        if not os.path.exists(wav_file) or os.path.getsize(wav_file) < 100_000:
            log(f"  ERROR: WAV missing or tiny — skipping {idx}")
            progress = load_progress(progress_file)
            progress = update_lecture(progress, idx, "failed")
            save_progress(progress_file, progress)
            failed_count += 1
            continue

        log(f"  Recording done: {os.path.getsize(wav_file) // 1024}KB")
        check_silence(wav_file)

        progress = load_progress(progress_file)
        progress = update_lecture(progress, idx, "transcribing")
        save_progress(progress_file, progress)
        start_asr_background(pending_asr, idx, wav_file, asr_out_dir, transcript_save,
                             safe_title, url, retries, asr_script, asr_provider, env_overrides)

    # Drain remaining ASR jobs
    if pending_asr:
        log(f"=== All lectures recorded. Waiting for {len(pending_asr)} pending ASR jobs... ===")
        while pending_asr:
            flush_completed_asr(pending_asr, progress_file, done_count, failed_count)
            if pending_asr:
                log(f"  Waiting on ASR: {list(pending_asr.keys())}")
                time.sleep(30)

    log(f"=== Session complete: {done_count} done, {failed_count} failed ===")

    log("Shutting down Chrome CDP instance...")
    chrome_proc.terminate()
    try:
        chrome_proc.wait(timeout=5)
    except Exception:
        chrome_proc.kill()
    subprocess.run(["pkill", "-f", "user-data-dir=/tmp/evc-chrome-automation"], capture_output=True)
    log("Done.")

    if cookie_file and os.path.exists(cookie_file):
        try:
            os.remove(cookie_file)
        except OSError:
            pass


# ── Helpers ───────────────────────────────────────────────────────────────────


def log(msg):
    ts = time.strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def load_env(env_path):
    overrides = {}
    if not os.path.exists(env_path):
        return overrides
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                overrides[k.strip()] = v.strip()
    return overrides


def load_progress(progress_file):
    with open(progress_file) as f:
        return json.load(f)


def load_or_init_progress(progress_file):
    if not os.path.exists(progress_file):
        data = {"schemaVersion": 2, "courseUrl": None, "courseName": None, "enumeratedAt": None, "lectures": {}}
        save_progress(progress_file, data)
        return data
    return load_progress(progress_file)


def save_progress(progress_file, progress):
    tmp = progress_file + ".tmp"
    with open(tmp, "w") as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)
    shutil.move(tmp, progress_file)


def update_lecture(progress, idx, status):
    """Return new progress with lecture status updated; preserves existing fields."""
    existing = progress["lectures"].get(idx, {"status": "pending", "retries": 0})
    retries = (existing.get("retries", 0) + 1) if status == "failed" else existing.get("retries", 0)
    return {
        **progress,
        "lectures": {**progress["lectures"], idx: {**existing, "status": status, "retries": retries}},
    }


def build_lecture_list(progress):
    """Return list of lecture dicts (idx, title, url, duration) from .progress.json, sorted by key."""
    result = []
    for idx in sorted(progress.get("lectures", {}).keys()):
        entry = progress["lectures"][idx]
        url = entry.get("url")
        if not url:
            continue
        result.append({
            "idx": idx,
            "title": entry.get("title") or f"lecture-{idx}",
            "url": url,
            "duration": entry.get("duration") or 0,
        })
    return result


def sanitize_title(raw):
    cleaned = re.sub(r"[^\w \-\u4e00-\u9fff]", "", raw, flags=re.UNICODE).strip()
    return cleaned[:80]


def to_kebab(s):
    return re.sub(r"-{2,}", "-", s.replace(" ", "-").lower())


def check_silence(wav_file):
    try:
        sil = subprocess.run(
            ["ffmpeg", "-i", wav_file, "-af", "silencedetect=noise=-35dB:d=2", "-f", "null", "-"],
            capture_output=True, text=True,
        )
        sil_secs = sum(float(m) for m in re.findall(r"silence_duration: ([\d.]+)", sil.stderr))
        dur_r = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", wav_file],
            capture_output=True, text=True,
        )
        total_dur = float(dur_r.stdout.strip() or 0)
        ratio = sil_secs / total_dur if total_dur > 0 else 0
        if ratio > 0.80:
            log(f"  WARNING: {ratio:.0%} silence — check Multi-Output Device in System Settings")
        else:
            log(f"  Audio OK: {ratio:.0%} silence, {total_dur:.0f}s")
    except Exception as e:
        log(f"  WARNING: silence check failed: {e}")


def start_asr_background(pending_asr, idx, wav_file, asr_out_dir, transcript_save,
                         safe_title, url, retries, asr_script, asr_provider, env_overrides):
    check = subprocess.run(["pgrep", "-f", f"--audio-file {wav_file}"], capture_output=True)
    if check.returncode == 0:
        log(f"  [asr-skip] {idx} — ASR already running, skipping duplicate launch")
        return
    os.makedirs(asr_out_dir, exist_ok=True)
    asr_log = open(f"/tmp/evc-asr-{idx}.log", "w")
    env = os.environ.copy()
    env.update(env_overrides)
    proc = subprocess.Popen(
        ["python3", asr_script,
         "--audio-file", wav_file,
         "--out-dir", asr_out_dir,
         "--asr-provider", asr_provider],
        env=env, stdout=asr_log, stderr=subprocess.STDOUT,
    )
    pending_asr[idx] = {
        "proc": proc, "wav_file": wav_file, "asr_out_dir": asr_out_dir,
        "transcript_save": transcript_save, "safe_title": safe_title,
        "url": url, "retries": retries, "log_file": asr_log,
    }
    log(f"  ASR started in background (PID {proc.pid})")


def flush_completed_asr(pending_asr, progress_file, done_count, failed_count):
    completed = [idx for idx, job in pending_asr.items() if job["proc"].poll() is not None]
    for idx in completed:
        job = pending_asr.pop(idx)
        finalize_asr_job(idx, job, progress_file, done_count, failed_count)


def finalize_asr_job(idx, job, progress_file, done_count, failed_count):
    proc = job["proc"]
    wav_file = job["wav_file"]
    asr_out_dir = job["asr_out_dir"]
    transcript_save = job["transcript_save"]
    safe_title = job["safe_title"]
    url = job["url"]
    retries = job["retries"]

    if proc.returncode != 0:
        stderr = proc.stderr.read() if proc.stderr else b""
        log(f"  [asr-done] {idx} ERROR (rc={proc.returncode}): {stderr[-200:].decode(errors='replace')}")
        progress = load_progress(progress_file)
        progress = update_lecture(progress, idx, "failed")
        save_progress(progress_file, progress)
        failed_count += 1
        return

    transcript_file = os.path.join(asr_out_dir, "transcript.txt")
    if not os.path.exists(transcript_file):
        log(f"  [asr-done] {idx} ERROR: no transcript.txt produced")
        progress = load_progress(progress_file)
        progress = update_lecture(progress, idx, "failed")
        save_progress(progress_file, progress)
        failed_count += 1
        return

    transcript = open(transcript_file).read().strip()
    log(f"  [asr-done] {idx} — {len(transcript)} chars")

    with open(transcript_save, "w") as tf:
        tf.write(f"---\ntitle: {safe_title}\nsource: {url}\nidx: {idx}\n---\n\n{transcript}")
    log(f"  Saved: {transcript_save}")

    try:
        os.remove(wav_file)
    except OSError:
        pass
    try:
        shutil.rmtree(asr_out_dir)
    except OSError:
        pass

    progress = load_progress(progress_file)
    progress = update_lecture(progress, idx, "done")
    save_progress(progress_file, progress)
    log(f"  [done] {idx}")
    done_count += 1


def generate_per_course_copy(course_dir, script_dest):
    """Generate a per-course copy of this template with COURSE_DIR hardcoded."""
    template_path = os.path.abspath(__file__)
    with open(template_path) as f:
        source = f.read()

    abs_course_dir = os.path.abspath(course_dir)
    # Replace the COURSE_DIR = None placeholder
    patched = source.replace(
        'COURSE_DIR = None  # REPLACED_BY_SKILL: absolute path to courses/<name>/',
        f'COURSE_DIR = "{abs_course_dir}"  # auto-generated by EVC skill',
    )

    out_path = os.path.join(abs_course_dir, "evc-loop.py")
    with open(out_path, "w") as f:
        f.write(patched)
    os.chmod(out_path, 0o755)
    log(f"Generated per-course copy: {out_path}")
    log(f"Run with: python3 {out_path}")


if __name__ == "__main__":
    main()
