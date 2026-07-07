"""queue_core.py — Pure state-machine logic for the EVC persistent queue.

No I/O, no mutation of inputs. Every function takes data and returns new data.
The impure edges (file reads/writes, disk probing, subprocess launches) live in
queue_io.py, evc.py, and supervisor.py. This module is unit-tested via bats
through the queue_cli.py JSON front door.

State machine (per lecture):
    pending -> recording -> recorded -> transcribing -> transcribed
            -> summarizing -> done              (+ failed from any stage)
"""

SCHEMA_VERSION = 3

# Linear rank of every non-failed status; used to compare progress.
RANK = {
    "pending": 0, "recording": 1, "recorded": 2, "transcribing": 3,
    "transcribed": 4, "summarizing": 5, "done": 6,
}

# Legal forward edges plus retry re-entry out of `failed`.
VALID_TRANSITIONS = {
    "pending": {"recording", "failed"},
    "recording": {"recorded", "failed"},
    "recorded": {"transcribing", "failed"},
    "transcribing": {"transcribed", "failed"},
    "transcribed": {"summarizing", "failed"},
    "summarizing": {"done", "failed"},
    "failed": {"recording", "transcribing", "summarizing"},
    "done": set(),
}

# Which pipeline stage a status belongs to.
STAGE_OF_STATUS = {
    "pending": "record", "recording": "record",
    "recorded": "transcribe", "transcribing": "transcribe",
    "transcribed": "summarize", "summarizing": "summarize",
}

# The stable status a stage consumes as input.
STABLE_FOR = {"record": "pending", "transcribe": "recorded", "summarize": "transcribed"}

TERMINAL = {"done", "failed"}


def is_valid_transition(cur, nxt):
    """True if `cur -> nxt` is a legal state-machine edge."""
    return nxt in VALID_TRANSITIONS.get(cur, set())


def apply_transition(queue, idx, new_status, reason=None):
    """Return a new queue with lecture `idx` moved to `new_status`.

    Raises KeyError for an unknown lecture and ValueError for an illegal edge.
    On `failed`, records reason + failing stage and increments the retry count.
    """
    lectures = queue["lectures"]
    if idx not in lectures:
        raise KeyError(f"unknown lecture: {idx}")
    lec = lectures[idx]
    cur = lec.get("status", "pending")
    if not is_valid_transition(cur, new_status):
        raise ValueError(f"illegal transition {cur} -> {new_status} for {idx}")
    updated = _entry_after_transition(lec, cur, new_status, reason)
    return {**queue, "lectures": {**lectures, idx: updated}}


def _entry_after_transition(lec, cur, new_status, reason):
    """Pure per-lecture update for a legal transition."""
    if new_status == "failed":
        return {**lec, "status": "failed", "reason": reason,
                "failedFrom": STAGE_OF_STATUS[cur],
                "retries": lec.get("retries", 0) + 1}
    return {**lec, "status": new_status, "reason": None}


def reconcile(queue, disk_facts):
    """Return a new queue whose non-terminal lectures agree with disk artifacts.

    disk_facts maps idx -> {"audio": bool, "transcript": bool, "summary": bool}.
    Fast-forwards to the furthest present artifact and resets crashed in-flight
    lectures whose artifacts are missing back to the stage they must redo.
    """
    lectures = queue["lectures"]
    reconciled = {
        idx: _reconcile_lecture(lec, disk_facts.get(idx, {}))
        for idx, lec in lectures.items()
    }
    return {**queue, "lectures": reconciled}


def _reconcile_lecture(lec, facts):
    """Pure per-lecture reconciliation against disk facts."""
    cur = lec.get("status", "pending")
    if cur in TERMINAL:
        return lec
    target = _artifact_status(facts) or "pending"
    return lec if target == cur else {**lec, "status": target}


def _artifact_status(facts):
    """Highest completed status implied by present artifacts, else None."""
    if facts.get("summary"):
        return "done"
    if facts.get("transcript"):
        return "transcribed"
    if facts.get("audio"):
        return "recorded"
    return None


def select_next_actions(queue, limits, inflight, max_retries=2):
    """Return the list of {idx, stage} to start now, respecting stage limits.

    A lecture already running in any stage is never double-scheduled. `record`
    is naturally serial via limits={"record": 1}. Failed lectures are re-picked
    for their failing stage while retries remain.
    """
    lects = _sorted_lectures(queue)
    busy = _all_inflight(inflight)
    actions = []
    for stage in ("record", "transcribe", "summarize"):
        capacity = limits.get(stage, 1) - len(inflight.get(stage, []))
        for idx, lec in lects:
            if capacity <= 0:
                break
            if idx in busy or any(a["idx"] == idx for a in actions):
                continue
            if _stage_ready(lec, stage, max_retries):
                actions.append({"idx": idx, "stage": stage})
                capacity -= 1
    return actions


def _stage_ready(lec, stage, max_retries):
    """True if the lecture is waiting to enter `stage` (fresh or retry)."""
    st = lec.get("status")
    if st == STABLE_FOR[stage]:
        return True
    return (st == "failed" and lec.get("failedFrom") == stage
            and lec.get("retries", 0) < max_retries)


def _all_inflight(inflight):
    return {idx for idxs in inflight.values() for idx in idxs}


def _sorted_lectures(queue):
    return sorted(queue["lectures"].items(), key=lambda kv: kv[0])


def counts(queue):
    """Tally lectures by status."""
    tally = {}
    for lec in queue["lectures"].values():
        st = lec.get("status", "pending")
        tally[st] = tally.get(st, 0) + 1
    return tally


def build_queue(meta, lectures, existing=None):
    """Assemble a queue from course meta + enumerated lecture dicts.

    Preserves status/retries/reason/failedFrom for any idx already in `existing`
    so re-enumeration is idempotent. Caller supplies fully-formed lecture dicts
    (idx, title, titleAscii, url, duration, module, artifacts).
    """
    prior = (existing or {}).get("lectures", {})
    entries = {lec["idx"]: _merge_entry(lec, prior.get(lec["idx"])) for lec in lectures}
    return {
        "schemaVersion": SCHEMA_VERSION,
        "courseSlug": meta["courseSlug"],
        "courseName": meta.get("courseName"),
        "courseUrl": meta.get("courseUrl"),
        "playbackSpeed": meta.get("playbackSpeed", 2.0),
        "asrProvider": meta.get("asrProvider", "openai"),
        "maxRetries": meta.get("maxRetries", 2),
        "enumeratedAt": meta.get("enumeratedAt"),
        "lectures": entries,
    }


def _merge_entry(lec, prior):
    """New lecture entry, carrying forward prior progress when present."""
    base = {**lec, "status": "pending", "retries": 0, "reason": None, "failedFrom": None}
    if not prior:
        return base
    keep = {k: prior[k] for k in ("status", "retries", "reason", "failedFrom") if k in prior}
    return {**base, **keep}
