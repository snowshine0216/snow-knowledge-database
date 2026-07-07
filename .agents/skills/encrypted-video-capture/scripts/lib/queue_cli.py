#!/usr/bin/env python3
"""queue_cli.py — JSON front door over queue_core's pure functions.

Reads JSON on stdin, writes JSON (or a text table) on stdout. Exists so bats
can exercise the pure state machine and so shell callers can transform a queue
without embedding Python. All heavy logic stays in queue_core.

Subcommands (stdin -> stdout):
    transition <idx> <status> [reason]   queue          -> queue
    reconcile                            {queue, disk}   -> queue
    next [maxRetries]                    {queue, limits, inflight} -> actions
    build                                {meta, lectures, existing?} -> queue
    counts                               queue           -> {status: n}
    status                               queue           -> text table
"""
import json
import sys

import queue_core as qc


def render_status_table(queue):
    """Pure: format a queue as a human-readable status table + summary line."""
    header = f"# {queue.get('courseName') or queue.get('courseSlug')}  (speed {queue.get('playbackSpeed')}x)"
    rows = ["", f"{'idx':<5} {'status':<12} {'try':<4} title", "-" * 60]
    for idx, lec in sorted(queue["lectures"].items()):
        title = (lec.get("title") or "")[:40]
        rows.append(f"{idx:<5} {lec.get('status', 'pending'):<12} {lec.get('retries', 0):<4} {title}")
    tally = qc.counts(queue)
    total = sum(tally.values())
    done = tally.get("done", 0)
    summary = "  ".join(f"{k}={v}" for k, v in sorted(tally.items()))
    return "\n".join([header, *rows, "-" * 60, f"{done}/{total} done   {summary}"])


def _dispatch(cmd, argv, payload):
    if cmd == "transition":
        reason = argv[2] if len(argv) > 2 else None
        return qc.apply_transition(payload, argv[0], argv[1], reason)
    if cmd == "reconcile":
        return qc.reconcile(payload["queue"], payload["disk"])
    if cmd == "next":
        mr = int(argv[0]) if argv else 2
        return qc.select_next_actions(payload["queue"], payload["limits"],
                                      payload["inflight"], mr)
    if cmd == "build":
        return qc.build_queue(payload["meta"], payload["lectures"], payload.get("existing"))
    if cmd == "counts":
        return qc.counts(payload)
    if cmd == "status":
        return render_status_table(payload)
    raise SystemExit(f"unknown subcommand: {cmd}")


def main(argv):
    if not argv:
        raise SystemExit("usage: queue_cli.py <subcommand> [args] < payload.json")
    payload = json.load(sys.stdin)
    result = _dispatch(argv[0], argv[1:], payload)
    if isinstance(result, str):
        sys.stdout.write(result + "\n")
    else:
        json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
        sys.stdout.write("\n")


if __name__ == "__main__":
    try:
        main(sys.argv[1:])
    except (KeyError, ValueError) as exc:
        sys.stderr.write(f"ERROR: {exc}\n")
        sys.exit(1)
