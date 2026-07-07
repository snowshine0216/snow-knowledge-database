#!/usr/bin/env python3
"""evc.py — Single entrypoint for encrypted-video-capture v2.

    evc.py enumerate --url <course-url>   Build/refresh the persistent queue.
    evc.py resume     --course <slug>      Reconcile + run the pipeline to done.
    evc.py status    [--course <slug>]     Print the queue as a table.

`resume` is idempotent: it survives reboot, /clear, and new sessions because all
state lives in <repo>/tmp/evc/<slug>/queue.json and every change is flushed as it
happens. There is no per-session loop script to hand-write.
"""
import argparse
import datetime
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "lib"))

import queue_core as qc          # noqa: E402
import queue_io as qio           # noqa: E402
import queue_cli                 # noqa: E402
import stages                    # noqa: E402
import supervisor                # noqa: E402


def repo_root():
    out = subprocess.run(["git", "rev-parse", "--show-toplevel"],
                         capture_output=True, text=True, cwd=HERE)
    return out.stdout.strip() if out.returncode == 0 else os.getcwd()


def skill_dir():
    return os.path.normpath(os.path.join(HERE, ".."))


def _now():
    return datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")


def _run_enumerate(sdir, url, cookie):
    cmd = ["node", os.path.join(sdir, "playwright", "runner.mjs"),
           "--action", "enumerate", "--url", url]
    if cookie:
        cmd += ["--cookies", cookie]
    out = subprocess.run(cmd, cwd=sdir, capture_output=True, text=True)
    if out.returncode != 0:
        raise SystemExit(f"ERROR: enumerate failed: {out.stderr.strip()[-400:]}")
    return json.loads(out.stdout)


def _derive_slug(url, raw):
    ids = re.findall(r"\d{5,}", url)
    cid = ids[-1] if ids else "course"
    tslug = qio.slugify_ascii(raw[0].get("course_title", "") if raw else "", "")
    return f"{cid}-{tslug}" if tslug else cid


def _make_output_dirs(root, slug, entries):
    for module in {e["module"] for e in entries if e["module"]} or {""}:
        os.makedirs(os.path.join(root, qio.COURSES_ROOT, slug, module), exist_ok=True)


def cmd_enumerate(args):
    root, sdir = repo_root(), skill_dir()
    cookie = os.path.join(root, qio.QUEUE_ROOT, ".enum-cookies.txt")
    os.makedirs(os.path.dirname(cookie), exist_ok=True)
    cookie = stages.export_cookies(args.url, cookie) or ""
    raw = _run_enumerate(sdir, args.url, cookie)
    slug = _derive_slug(args.url, raw)
    meta = {"courseSlug": slug, "courseName": slug, "courseUrl": args.url,
            "playbackSpeed": args.speed, "asrProvider": args.asr_provider,
            "maxRetries": args.max_retries, "enumeratedAt": _now()}
    entries = qio.build_lecture_entries(slug, slug, raw)
    path = qio.queue_path(root, slug)
    existing = qio.load_queue(path) if os.path.exists(path) else None
    queue = qc.build_queue(meta, entries, existing)
    _make_output_dirs(root, slug, entries)
    qio.save_queue(path, queue)
    print(f"enumerated {len(entries)} lectures for '{slug}' -> {path}")
    print(f"next: python3 {os.path.join('scripts', 'evc.py')} resume --course {slug}")
    return 0


def cmd_resume(args):
    root = repo_root()
    slug = args.course or _slug_from_url(root, args.url)
    if not os.path.exists(qio.queue_path(root, slug)):
        raise SystemExit(f"ERROR: no queue for '{slug}'. Run enumerate first.")
    return supervisor.run(root, skill_dir(), slug)


def _slug_from_url(root, url):
    if not url:
        raise SystemExit("ERROR: pass --course <slug> or --url <course-url>")
    return _derive_slug(url, [])


def cmd_status(args):
    root = repo_root()
    slugs = [args.course] if args.course else _all_slugs(root)
    if not slugs:
        print("no courses enumerated yet")
        return 0
    shown = 0
    for slug in slugs:
        path = qio.queue_path(root, slug)
        if os.path.exists(path):
            print(queue_cli.render_status_table(qio.load_queue(path)))
            print()
            shown += 1
    if not shown:
        print(f"no queue found for '{args.course}' — run enumerate first")
    return 0


def _all_slugs(root):
    base = os.path.join(root, qio.QUEUE_ROOT)
    if not os.path.isdir(base):
        return []
    return sorted(d for d in os.listdir(base)
                  if os.path.exists(qio.queue_path(root, d)))


def main(argv):
    ap = argparse.ArgumentParser(prog="evc.py")
    sub = ap.add_subparsers(dest="cmd", required=True)
    en = sub.add_parser("enumerate")
    en.add_argument("--url", required=True)
    en.add_argument("--speed", type=float, default=2.0)
    en.add_argument("--asr-provider", default="openai")
    en.add_argument("--max-retries", type=int, default=2)
    en.set_defaults(fn=cmd_enumerate)
    rs = sub.add_parser("resume")
    rs.add_argument("--course")
    rs.add_argument("--url")
    rs.set_defaults(fn=cmd_resume)
    st = sub.add_parser("status")
    st.add_argument("--course")
    st.set_defaults(fn=cmd_status)
    args = ap.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
