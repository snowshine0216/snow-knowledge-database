"""stages.py — Impure stage runners for the supervisor.

Owns the Chrome-CDP lifecycle (launch once, keep alive, relaunch on crash),
cookie reuse from the real Chrome profile, course-URL validation, and the three
per-lecture subprocess launchers (record / transcribe / summarise). The
supervisor decides *what* to run; this module knows *how* to run it.
"""
import os
import subprocess
import time
import urllib.error
import urllib.request

_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/537.36 Chrome/125 Safari/537.36"


def _log_file(ctx, name):
    logs = os.path.join(ctx["queue_dir"], "logs")
    os.makedirs(logs, exist_ok=True)
    return open(os.path.join(logs, name), "w")


def chrome_alive(cdp_url):
    """True if the long-running Chrome still answers CDP."""
    try:
        with urllib.request.urlopen(f"{cdp_url}/json/version", timeout=3) as resp:
            return resp.status == 200
    except (urllib.error.URLError, OSError):
        return False


def start_chrome(skill_dir, cdp_url, timeout=35):
    """Launch the CDP Chrome once; reuses real-profile cookies via injection."""
    proc = subprocess.Popen(
        ["bash", os.path.join(skill_dir, "scripts", "start-chrome-cdp.sh")],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    waited = 0
    while waited < timeout:
        if chrome_alive(cdp_url):
            return proc
        time.sleep(1)
        waited += 1
    raise RuntimeError("Chrome CDP did not become ready")


def ensure_chrome(proc, skill_dir, cdp_url):
    """Return a live Chrome process, relaunching if CDP has gone away."""
    if chrome_alive(cdp_url):
        return proc
    if proc:
        proc.terminate()
    return start_chrome(skill_dir, cdp_url)


def stop_chrome(proc):
    if not proc:
        return
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except Exception:
        proc.kill()
    subprocess.run(["pkill", "-f", "user-data-dir=/tmp/evc-chrome-automation"],
                   capture_output=True)


def export_cookies(course_url, dest):
    """Reuse existing Chrome profile cookies by exporting them with yt-dlp."""
    result = subprocess.run(
        ["yt-dlp", "--cookies-from-browser", "chrome", "--cookies", dest,
         "--skip-download", course_url],
        capture_output=True,
    )
    return dest if result.returncode == 0 and os.path.exists(dest) else None


def validate_url_loads(url, timeout=15):
    """Catch malformed course URLs (e.g. '/' vs '-') before any recording."""
    if not url.startswith(("http://", "https://")):
        return False, "not an http(s) URL"
    req = urllib.request.Request(url, headers={"User-Agent": _UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return (resp.status < 400), f"HTTP {resp.status}"
    except urllib.error.HTTPError as exc:
        return (exc.code < 400), f"HTTP {exc.code}"
    except (urllib.error.URLError, OSError) as exc:
        return False, str(exc)


def _resolve(ctx, rel):
    return os.path.join(ctx["repo_root"], rel)


def start_record(ctx, lec):
    idx = lec["idx"]
    cmd = ["python3", os.path.join(ctx["skill_dir"], "scripts", "record_lecture.py"),
           "--idx", idx, "--url", lec["url"], "--duration", str(lec.get("duration", 0)),
           "--wav", _resolve(ctx, lec["artifacts"]["audio"]),
           "--session-id", f"evc-{ctx['slug']}-{idx}", "--cdp-url", ctx["cdp_url"],
           "--speed", str(ctx["speed"]), "--device", str(ctx["device"]),
           "--skill-dir", ctx["skill_dir"]]
    if ctx.get("cookie_file"):
        cmd += ["--cookies", ctx["cookie_file"]]
    return subprocess.Popen(cmd, stdout=_log_file(ctx, f"record-{idx}.log"),
                            stderr=subprocess.STDOUT)


def start_transcribe(ctx, lec):
    idx = lec["idx"]
    out_dir = os.path.dirname(_resolve(ctx, lec["artifacts"]["transcript"]))
    os.makedirs(out_dir, exist_ok=True)
    cmd = ["python3", ctx["asr_script"], "--audio-file", _resolve(ctx, lec["artifacts"]["audio"]),
           "--out-dir", out_dir, "--asr-provider", ctx["asr_provider"]]
    return subprocess.Popen(cmd, stdout=_log_file(ctx, f"transcribe-{idx}.log"),
                            stderr=subprocess.STDOUT)


def start_summarize(ctx, lec):
    idx = lec["idx"]
    out = _resolve(ctx, lec["artifacts"]["summary"])
    os.makedirs(os.path.dirname(out), exist_ok=True)
    cmd = ["python3", os.path.join(ctx["skill_dir"], "scripts", "summarize.py"),
           "--transcript", _resolve(ctx, lec["artifacts"]["transcript"]), "--out", out,
           "--title", lec.get("title", ""), "--url", lec.get("url", "")]
    return subprocess.Popen(cmd, stdout=_log_file(ctx, f"summarize-{idx}.log"),
                            stderr=subprocess.STDOUT)


LAUNCHERS = {"record": start_record, "transcribe": start_transcribe, "summarize": start_summarize}
