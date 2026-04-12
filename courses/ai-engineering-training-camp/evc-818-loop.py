#!/usr/bin/env python3
"""
evc-818-loop.py — Capture loop for u.geekbang.org/lesson/818

Records each lecture via BlackHole, transcribes with faster-whisper IN BACKGROUND
(non-blocking), saves transcript. Resume-safe via .progress.json.

ASR runs in background so recording of the next lecture starts immediately.
"""
import json, subprocess, os, sys, time, signal, re, shutil

SKILL_DIR = "/Users/xuyin/Documents/Repository/snow-knowledge-database/.agents/skills/encrypted-video-capture"
OUTPUT_DIR = "/Users/xuyin/Documents/Repository/snow-knowledge-database/courses/ai-engineering-training-camp"
LECTURE_LIST_FILE = "/tmp/evc-lectures-818.json"
COOKIE_FILE = "/tmp/evc-cookies-1775880335-11585.txt"
PROGRESS_FILE = f"{OUTPUT_DIR}/.progress.json"
LOG_FILE = "/tmp/evc-capture-818.log"
BLACKHOLE_DEVICE = 0
PLAYBACK_SPEED = 1.5
ASR_SCRIPT = "/Users/xuyin/Documents/Repository/snow-knowledge-database/.agents/skills/yt-video-summarizer/scripts/extract_video_context.py"

# Load .env
ENV_OVERRIDES = {}
env_file = f"{SKILL_DIR}/.env"
if os.path.exists(env_file):
    with open(env_file) as ef:
        for line in ef:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                ENV_OVERRIDES[k.strip()] = v.strip()

ASR_PROVIDER = ENV_OVERRIDES.get('ASR_PROVIDER', 'openai')

def log(msg):
    ts = time.strftime('%H:%M:%S')
    line = f"[{ts}] {msg}"
    print(line, flush=True)

def load_progress():
    with open(PROGRESS_FILE) as f:
        return json.load(f)

def save_progress(prog):
    tmp = PROGRESS_FILE + '.tmp'
    with open(tmp, 'w') as f:
        json.dump(prog, f, ensure_ascii=False, indent=2)
    shutil.move(tmp, PROGRESS_FILE)

def sanitize_title(raw):
    cleaned = re.sub(r'[^\w \-\u4e00-\u9fff]', '', raw, flags=re.UNICODE).strip()
    return cleaned[:80]

def to_kebab(s):
    return re.sub(r'-{2,}', '-', s.replace(' ', '-').lower())

def make_asr_env():
    env = os.environ.copy()
    env.update(ENV_OVERRIDES)
    return env

# ── Background ASR tracking ───────────────────────────────────────────────────

# pending_asr[idx] = {proc, wav_file, asr_out_dir, transcript_save, safe_title, url, retries, log_file}
pending_asr = {}

def finalize_asr_job(idx, job):
    """Process a completed ASR job. Returns True if transcript saved successfully."""
    global done_count, failed_count
    proc = job['proc']
    wav_file = job['wav_file']
    asr_out_dir = job['asr_out_dir']
    transcript_save = job['transcript_save']
    safe_title = job['safe_title']
    url = job['url']
    retries = job['retries']

    rc = proc.returncode
    if rc != 0:
        stderr = proc.stderr.read() if proc.stderr else b''
        log(f"  [asr-done] {idx} ERROR (rc={rc}): {stderr[-200:].decode(errors='replace')}")
        prog = load_progress()
        prog['lectures'][idx] = {'status': 'failed', 'title': safe_title, 'retries': retries + 1}
        save_progress(prog)
        failed_count += 1
        return False

    transcript_file = f"{asr_out_dir}/transcript.txt"
    if not os.path.exists(transcript_file):
        log(f"  [asr-done] {idx} ERROR: no transcript.txt produced")
        prog = load_progress()
        prog['lectures'][idx] = {'status': 'failed', 'title': safe_title, 'retries': retries + 1}
        save_progress(prog)
        failed_count += 1
        return False

    transcript = open(transcript_file).read().strip()
    log(f"  [asr-done] {idx} — {len(transcript)} chars")

    with open(transcript_save, 'w') as tf:
        tf.write(f"---\ntitle: {safe_title}\nsource: {url}\nidx: {idx}\n---\n\n{transcript}")
    log(f"  Saved: {transcript_save}")

    # Clean up wav and asr dir
    try: os.remove(wav_file)
    except: pass
    try: shutil.rmtree(asr_out_dir)
    except: pass

    prog = load_progress()
    prog['lectures'][idx] = {'status': 'transcribed', 'title': safe_title, 'retries': retries,
                              'transcript': transcript_save}
    save_progress(prog)
    log(f"  [transcribed] {idx}")
    done_count += 1
    return True

def flush_completed_asr():
    """Check all pending ASR jobs; finalize any that have finished."""
    completed = [idx for idx, job in pending_asr.items() if job['proc'].poll() is not None]
    for idx in completed:
        job = pending_asr.pop(idx)
        finalize_asr_job(idx, job)

def start_asr_background(idx, wav_file, asr_out_dir, transcript_save, safe_title, url, retries):
    """Launch faster-whisper in background. No-ops if already running for this wav."""
    check = subprocess.run(['pgrep', '-f', f'--audio-file {wav_file}'], capture_output=True)
    if check.returncode == 0:
        existing_pids = check.stdout.decode().strip()
        log(f"  [asr-skip] {idx} — ASR already running (PID {existing_pids}), skipping duplicate launch")
        return
    os.makedirs(asr_out_dir, exist_ok=True)
    asr_log = open(f'/tmp/evc-asr-{idx}.log', 'w')
    proc = subprocess.Popen(
        ['python3', ASR_SCRIPT,
         '--audio-file', wav_file,
         '--out-dir', asr_out_dir,
         '--asr-provider', ASR_PROVIDER],
        env=make_asr_env(),
        stdout=asr_log,
        stderr=subprocess.STDOUT
    )
    pending_asr[idx] = {
        'proc': proc,
        'wav_file': wav_file,
        'asr_out_dir': asr_out_dir,
        'transcript_save': transcript_save,
        'safe_title': safe_title,
        'url': url,
        'retries': retries,
        'log_file': asr_log,
    }
    log(f"  ASR started in background (PID {proc.pid})")

# ─────────────────────────────────────────────────────────────────────────────

os.makedirs(OUTPUT_DIR, exist_ok=True)
if not os.path.exists(PROGRESS_FILE):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump({"schemaVersion": 1, "lectures": {}}, f)

lectures = json.load(open(LECTURE_LIST_FILE))
log(f"=== EVC capture session started: {len(lectures)} lectures ===")

# Launch one Chrome instance with CDP — reused across all lectures
CDP_URL = "http://127.0.0.1:9222"
log("Starting Chrome with CDP...")
chrome_proc = subprocess.Popen(
    ['bash', f'{SKILL_DIR}/scripts/start-chrome-cdp.sh'],
    stdout=subprocess.PIPE, stderr=subprocess.STDOUT
)
cdp_ready = False
for line in iter(chrome_proc.stdout.readline, b''):
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
log(f"Chrome CDP ready at {CDP_URL}")

done_count = 0
failed_count = 0

for lecture in lectures:
    # Flush any completed background ASR jobs before each recording
    flush_completed_asr()

    idx = lecture['idx']
    raw_title = lecture['title']
    url = lecture['url']
    duration = lecture['duration']

    safe_title = sanitize_title(raw_title)
    safe_kebab = to_kebab(safe_title) if safe_title else f"lecture-{idx}"
    out_md = f"{OUTPUT_DIR}/{idx}-{safe_kebab}.md"
    transcript_save = f"{OUTPUT_DIR}/{idx}-{safe_kebab}.transcript"
    audio_tmp_dir = f"/tmp/evc-audio/ai-engineering-training-camp"
    os.makedirs(audio_tmp_dir, exist_ok=True)
    wav_file = f"{audio_tmp_dir}/tmp_{idx}.wav"
    asr_out_dir = f"{audio_tmp_dir}/asr_{idx}"
    session_id = f"evc818-{idx}"
    ready_file = f"/tmp/evc-ffmpeg-ready-{session_id}"
    ended_file = f"/tmp/evc-video-ended-{session_id}"

    prog = load_progress()
    lec_prog = prog['lectures'].get(idx, {})
    status = lec_prog.get('status', 'pending')
    retries = lec_prog.get('retries', 0)

    # Skip if already done
    if status == 'done' or os.path.exists(out_md):
        log(f"  [skip] {idx} — already done (.md exists)")
        done_count += 1
        continue

    # Skip if transcript already saved
    if status == 'transcribed' or os.path.exists(transcript_save):
        log(f"  [skip-transcribed] {idx} — transcript ready, awaiting summarization")
        done_count += 1
        continue

    # Skip if ASR already running in background for this idx
    if idx in pending_asr:
        log(f"  [skip] {idx} — ASR in progress (PID {pending_asr[idx]['proc'].pid})")
        continue

    # If WAV exists from a previous interrupted run, resume ASR instead of re-recording
    if status == 'transcribing' and os.path.exists(wav_file) and os.path.getsize(wav_file) > 100000:
        log(f"  [resume-asr] {idx} — WAV exists ({os.path.getsize(wav_file)//1024}KB), resuming ASR")
        start_asr_background(idx, wav_file, asr_out_dir, transcript_save, safe_title, url, retries)
        continue

    if status == 'failed' and retries >= 2:
        log(f"  [skip] {idx} — failed {retries}× (max retries)")
        failed_count += 1
        continue

    wall_timeout = int(duration / PLAYBACK_SPEED) + 120 if duration > 0 else 5400
    log(f"--- [{idx}] {raw_title} | {duration}s → ~{wall_timeout//60}min wall ---")

    # Mark as recording
    prog['lectures'][idx] = {'status': 'recording', 'title': safe_title, 'retries': retries}
    save_progress(prog)

    # Clean up stale markers and old wav
    for fpath in [ready_file, ended_file, wav_file]:
        try: os.remove(fpath)
        except: pass

    # Start ffmpeg recording via BlackHole
    log(f"  Starting BlackHole recording → {wav_file}")
    record_proc = subprocess.Popen(
        ['bash', f'{SKILL_DIR}/scripts/record-audio.sh', str(BLACKHOLE_DEVICE), wav_file, session_id],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )

    # Wait for ffmpeg ready signal (max 15s)
    waited = 0
    while not os.path.exists(ready_file) and waited < 15:
        time.sleep(1)
        waited += 1
    if not os.path.exists(ready_file):
        log(f"  ERROR: ffmpeg did not start within 15s — skipping {idx}")
        record_proc.terminate()
        prog = load_progress()
        prog['lectures'][idx] = {'status': 'failed', 'title': safe_title, 'retries': retries + 1}
        save_progress(prog)
        failed_count += 1
        continue
    log(f"  ffmpeg ready. Launching Chrome for {url}")

    # Launch Playwright
    play_env = os.environ.copy()
    play_env.update(ENV_OVERRIDES)
    play_env['PLAYBACK_SPEED'] = str(PLAYBACK_SPEED)
    play_env['CHROME_CDP_URL'] = CDP_URL
    play_log = open(f'/tmp/evc-play-{session_id}.log', 'w')
    play_proc = subprocess.Popen(
        ['node', f'{SKILL_DIR}/playwright/runner.mjs',
         '--action', 'play',
         '--url', url,
         '--cookies', COOKIE_FILE,
         '--session-id', session_id,
         '--duration', str(duration)],
        env=play_env,
        stdout=subprocess.DEVNULL,
        stderr=play_log
    )

    # Wait for video-ended marker or wall timeout
    elapsed = 0
    while not os.path.exists(ended_file) and elapsed < wall_timeout:
        if play_proc.poll() is not None:
            log(f"  Playwright exited (rc={play_proc.returncode})")
            break
        time.sleep(2)
        elapsed += 2

    if elapsed >= wall_timeout:
        log(f"  WARNING: Wall-clock timeout ({wall_timeout}s) for {idx}")

    # Stop recording (3s buffer)
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

    # Clean up marker files
    for fpath in [ready_file, ended_file]:
        try: os.remove(fpath)
        except: pass

    # Check wav
    if not os.path.exists(wav_file) or os.path.getsize(wav_file) < 100000:
        log(f"  ERROR: WAV missing or tiny — skipping {idx}")
        prog = load_progress()
        prog['lectures'][idx] = {'status': 'failed', 'title': safe_title, 'retries': retries + 1}
        save_progress(prog)
        failed_count += 1
        continue

    wav_size = os.path.getsize(wav_file)
    log(f"  Recording done: {wav_size//1024}KB")

    # Silence detection
    try:
        sil = subprocess.run(
            ['ffmpeg', '-i', wav_file, '-af', 'silencedetect=noise=-35dB:d=2', '-f', 'null', '-'],
            capture_output=True, text=True
        )
        sil_secs = sum(float(m) for m in re.findall(r'silence_duration: ([\d.]+)', sil.stderr))
        dur_r = subprocess.run(
            ['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
             '-of', 'default=noprint_wrappers=1:nokey=1', wav_file],
            capture_output=True, text=True
        )
        total_dur = float(dur_r.stdout.strip() or 0)
        ratio = sil_secs / total_dur if total_dur > 0 else 0
        if ratio > 0.80:
            log(f"  WARNING: {ratio:.0%} silence — check Multi-Output Device in System Settings")
        else:
            log(f"  Audio OK: {ratio:.0%} silence, {total_dur:.0f}s")
    except Exception as e:
        log(f"  WARNING: silence check failed: {e}")

    # Start ASR in background — don't block, continue to next lecture
    prog = load_progress()
    prog['lectures'][idx]['status'] = 'transcribing'
    save_progress(prog)
    start_asr_background(idx, wav_file, asr_out_dir, transcript_save, safe_title, url, retries)
    # Loop immediately continues to record next lecture

# ── Drain remaining ASR jobs ──────────────────────────────────────────────────
if pending_asr:
    log(f"=== All lectures recorded. Waiting for {len(pending_asr)} pending ASR jobs... ===")
    while pending_asr:
        flush_completed_asr()
        if pending_asr:
            remaining = list(pending_asr.keys())
            log(f"  Waiting on ASR: {remaining}")
            time.sleep(30)

log(f"=== Session complete: {done_count} transcribed, {failed_count} failed ===")

# Shut down the shared Chrome instance
log("Shutting down Chrome CDP instance...")
chrome_proc.terminate()
try: chrome_proc.wait(timeout=5)
except: chrome_proc.kill()
subprocess.run(['pkill', '-f', 'user-data-dir=/tmp/evc-chrome-automation'], capture_output=True)
log("Chrome shut down.")
