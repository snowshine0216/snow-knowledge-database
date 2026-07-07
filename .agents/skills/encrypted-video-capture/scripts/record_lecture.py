#!/usr/bin/env python3
"""record_lecture.py — Capture BlackHole audio for ONE lecture, then exit.

The supervisor runs this as a subprocess so recording lecture N can overlap
transcribing N-1 and summarising N-2. It wires together the two working pieces
kept from v1: record-audio.sh (ffmpeg on BlackHole) and playwright/runner.mjs
(CDP playback). Durable WAV lands under repo tmp/evc; only the transient
ready/ended IPC flags live in /tmp, matching playwright/pathConstants.mjs.

Exit codes: 0 = non-empty WAV produced, 2 = ffmpeg/playback failure.
"""
import argparse
import os
import signal
import subprocess
import sys
import time

MIN_WAV_BYTES = 100_000


def wait_for(path, timeout, poll=1.0):
    waited = 0.0
    while waited < timeout:
        if os.path.exists(path):
            return True
        time.sleep(poll)
        waited += poll
    return False


def remove_quiet(*paths):
    for path in paths:
        try:
            os.remove(path)
        except OSError:
            pass


def start_recorder(skill_dir, device, wav, session_id):
    return subprocess.Popen(
        ["bash", os.path.join(skill_dir, "scripts", "record-audio.sh"), str(device), wav, session_id],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )


def start_playback(skill_dir, args, session_id, env):
    cmd = ["node", os.path.join(skill_dir, "playwright", "runner.mjs"),
           "--action", "play", "--url", args.url,
           "--session-id", session_id, "--duration", str(args.duration)]
    if args.cookies:
        cmd += ["--cookies", args.cookies]
    log = open(f"/tmp/evc-play-{session_id}.log", "w")
    return subprocess.Popen(cmd, env=env, stdout=subprocess.DEVNULL, stderr=log), log


def playback_env(cdp_url, speed):
    env = os.environ.copy()
    env["CHROME_CDP_URL"] = cdp_url
    env["PLAYBACK_SPEED"] = str(speed)
    return env


def stop_recorder(proc):
    try:
        proc.send_signal(signal.SIGINT)
        proc.wait(timeout=15)
    except Exception:
        proc.terminate()


def main(argv):
    ap = argparse.ArgumentParser(description="Record one lecture")
    ap.add_argument("--idx", required=True)
    ap.add_argument("--url", required=True)
    ap.add_argument("--duration", type=int, default=0)
    ap.add_argument("--wav", required=True)
    ap.add_argument("--session-id", required=True)
    ap.add_argument("--cdp-url", required=True)
    ap.add_argument("--cookies", default="")
    ap.add_argument("--speed", type=float, default=2.0)
    ap.add_argument("--device", default=os.environ.get("BLACKHOLE_DEVICE", "0"))
    ap.add_argument("--skill-dir", required=True)
    args = ap.parse_args(argv)

    ready = f"/tmp/evc-ffmpeg-ready-{args.session_id}"
    ended = f"/tmp/evc-video-ended-{args.session_id}"
    os.makedirs(os.path.dirname(args.wav), exist_ok=True)
    remove_quiet(ready, ended, args.wav)

    recorder = start_recorder(args.skill_dir, args.device, args.wav, args.session_id)
    if not wait_for(ready, 15):
        recorder.terminate()
        print(f"ERROR: ffmpeg did not start within 15s for {args.idx}", file=sys.stderr)
        return 2

    env = playback_env(args.cdp_url, args.speed)
    play, log = start_playback(args.skill_dir, args, args.session_id, env)

    wall = int(args.duration / args.speed) + 120 if args.duration > 0 else 5400
    elapsed = 0
    while not os.path.exists(ended) and elapsed < wall:
        if play.poll() is not None:
            break
        time.sleep(2)
        elapsed += 2

    time.sleep(3)
    stop_recorder(recorder)
    log.close()
    if play.poll() is None:
        play.terminate()
    remove_quiet(ready, ended)

    if not os.path.exists(args.wav) or os.path.getsize(args.wav) < MIN_WAV_BYTES:
        print(f"ERROR: WAV missing or too small for {args.idx}", file=sys.stderr)
        return 2
    print(f"INFO: recorded {args.idx} -> {args.wav} ({os.path.getsize(args.wav) // 1024}KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
