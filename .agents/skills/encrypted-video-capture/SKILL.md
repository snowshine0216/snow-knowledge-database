# Skill: encrypted-video-capture

Capture audio from DRM-protected video courses (Geektime, corporate training, webinar replays), transcribe via ASR, and generate structured Markdown lecture notes — one `.md` file per lecture.

## Usage

```
/encrypted-video-capture <course-url> [--dry-run] [--resume]
```

- `--dry-run`: enumerate lectures and print total estimated recording time; exit without recording
- `--resume`: skip lectures already marked `done` in `.progress.json`; retry `failed` up to 2×

## Prerequisites

Run `./scripts/preflight.sh` before the first use. See `references/setup-guide.md` for the
BlackHole + Audio MIDI Setup steps.

---

## Orchestration Steps

When the user invokes this skill with a course URL, follow these steps exactly.

### 0. Environment Setup

Load `.env` if it exists in this skill directory:
```bash
[ -f "$(dirname "$0")/.env" ] && source "$(dirname "$0")/.env"
```

Required env vars (with defaults):
- `OUTPUT_DIR` — default: `courses/` relative to cwd
- `ASR_PROVIDER` — default: `auto`
- `BLACKHOLE_DEVICE` — auto-detected by preflight; override if needed

### 1. Lock File Check

```bash
LOCK_FILE="/tmp/encrypted-video-capture.lock"
SESSION_ID="$(date +%s)-$$"

if [ -f "$LOCK_FILE" ]; then
  STALE_PID="$(cat "$LOCK_FILE")"
  if kill -0 "$STALE_PID" 2>/dev/null; then
    echo "ERROR: Another session is running (PID $STALE_PID). CAUSE: Lock file exists with live PID. FIX: Wait for it to finish or kill PID $STALE_PID and delete $LOCK_FILE."
    exit 1
  fi
  echo "INFO: Cleaning up stale lock file (PID $STALE_PID no longer running)."
  rm -f "$LOCK_FILE"
fi
echo "$$" > "$LOCK_FILE"
```

Set up cleanup trap (runs on EXIT, SIGINT, SIGTERM):
```bash
cleanup() {
  rm -f "$LOCK_FILE"
  rm -f "/tmp/evc-cookies-${SESSION_ID}.txt"
  rm -f "/tmp/evc-ffmpeg-ready-${SESSION_ID}"
  rm -f "/tmp/evc-ffmpeg-${SESSION_ID}.pid"
  rm -f "/tmp/evc-video-ended-${SESSION_ID}"
  rm -f "/tmp/evc-prog.tmp"
}
trap cleanup EXIT INT TERM
```

### 2. Preflight

```bash
bash "$(dirname "$0")/scripts/preflight.sh" || exit 1
```

After preflight succeeds, auto-detect BlackHole device index if not set:
```bash
if [ -z "$BLACKHOLE_DEVICE" ]; then
  BLACKHOLE_DEVICE=$(ffmpeg -f avfoundation -list_devices true -i "" 2>&1 \
    | grep -i "BlackHole" | grep -oE '\[[0-9]+\]' | grep -oE '[0-9]+' | head -1)
  if [ -z "$BLACKHOLE_DEVICE" ]; then
    echo "ERROR: BlackHole device not found in ffmpeg device list. CAUSE: BlackHole 2ch not installed or Audio MIDI multi-output not configured. FIX: Follow references/setup-guide.md sections 1–3."
    exit 1
  fi
fi
```

### 3. Cookie Export

Export Chrome cookies to a temp file (600 perms):
```bash
COOKIE_FILE="/tmp/evc-cookies-${SESSION_ID}.txt"
touch "$COOKIE_FILE" && chmod 600 "$COOKIE_FILE"
yt-dlp --cookies-from-browser "${DEFAULT_BROWSER:-chrome}" --cookies "$COOKIE_FILE" \
  --skip-download "$COURSE_URL" 2>/dev/null || true
```

### 4. Lecture Enumeration (Geektime API)

Use the Playwright adapter to enumerate lectures:
```bash
LECTURE_LIST=$(node "$(dirname "$0")/playwright/geektime-adapter.mjs" \
  --action enumerate \
  --url "$COURSE_URL" \
  --cookies "$COOKIE_FILE")
```

If `LECTURE_LIST` is empty or the command exits non-zero:
```
ERROR: No lectures found at <URL>. CAUSE: Geektime API returned empty list or authentication failed. FIX: Re-open Chrome, log into Geektime, and re-run. If persists, check if the course URL is a valid column/course URL.
```

Derive `COURSE_NAME` for the output directory from the course URL:
```bash
# Extract the numeric course ID from the URL (e.g., 100083501 from .../column/intro/100083501)
COURSE_ID=$(echo "$COURSE_URL" | grep -oE '[0-9]{5,}' | tail -1)
COURSE_NAME="${COURSE_ID:-unknown-course}"
mkdir -p "${OUTPUT_DIR}/${COURSE_NAME}"
```

### 5. Dry Run (if --dry-run)

Print each lecture title and index, then total estimated recording time (30 min × count):
```
Lecture 001: <title>  (~30 min)
Lecture 002: <title>  (~30 min)
...
Total: N lectures, estimated ~X hr Y min recording time.
Dry-run complete. No recording performed.
```
Exit 0.

### 6. Load / Initialize Progress

```bash
PROGRESS_FILE="${OUTPUT_DIR}/.progress.json"
if [ -f "$PROGRESS_FILE" ]; then
  SCHEMA_VERSION=$(jq -r '.schemaVersion // "missing"' "$PROGRESS_FILE")
  if [ "$SCHEMA_VERSION" != "1" ]; then
    echo "ERROR: .progress.json has schemaVersion '$SCHEMA_VERSION'. CAUSE: Stale or incompatible progress file. FIX: Delete $PROGRESS_FILE to start fresh, or migrate manually."
    exit 1
  fi
else
  echo '{"schemaVersion":1,"lectures":{}}' > "$PROGRESS_FILE"
fi
```

### 7. Per-Lecture Loop

For each lecture in `LECTURE_LIST`:

#### 7a. Sanitize Title

```bash
# Strip shell metacharacters; preserve ASCII, spaces, hyphens, and CJK range
# (python3 for Unicode-aware sanitization — macOS sed doesn't support \u escapes)
SAFE_TITLE=$(echo "$RAW_TITLE" \
  | python3 -c "import sys, re; raw=sys.stdin.read(); print(re.sub(r'[^\w \-\u4e00-\u9fff]', '', raw, flags=re.UNICODE).strip()[:80])")
# Fallback: use index if title is empty after sanitization
[ -z "$SAFE_TITLE" ] && SAFE_TITLE="lecture-${IDX}"
# Kebab-case version for use in filenames (spaces → hyphens, lowercase)
SAFE_TITLE_KEBAB=$(echo "$SAFE_TITLE" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | sed 's/-\{2,\}/-/g')
```

#### 7b. Check Progress

```bash
STATUS=$(jq -r ".lectures[\"$IDX\"].status // \"pending\"" "$PROGRESS_FILE")
RETRY_COUNT=$(jq -r ".lectures[\"$IDX\"].retries // 0" "$PROGRESS_FILE")

if [ "$STATUS" = "done" ]; then
  echo "  [skip] $IDX already done."
  continue
fi
if [ "$STATUS" = "failed" ] && [ "$RETRY_COUNT" -ge 2 ]; then
  echo "  [skip] $IDX failed $RETRY_COUNT times, skipping."
  continue
fi
```

Update progress to `recording`:
```bash
jq --arg idx "$IDX" --arg title "$SAFE_TITLE" \
  '.lectures[$idx] = {status: "recording", title: $title, retries: (.lectures[$idx].retries // 0)}' \
  "$PROGRESS_FILE" > /tmp/evc-prog.tmp && mv /tmp/evc-prog.tmp "$PROGRESS_FILE"
```

#### 7c. yt-dlp Probe (Direct Download Attempt)

```bash
YTDLP_AUDIO=""
if yt-dlp --simulate --cookies "$COOKIE_FILE" "$LECTURE_URL" 2>/dev/null; then
  # Direct download available — use it instead of BlackHole
  YTDLP_AUDIO="${OUTPUT_DIR}/tmp_${IDX}.m4a"
  yt-dlp --cookies "$COOKIE_FILE" -x --audio-format m4a \
    -o "$YTDLP_AUDIO" "$LECTURE_URL" 2>/dev/null && \
    echo "INFO: yt-dlp direct download succeeded for lecture $IDX."
fi
```

Timeout the probe after 15 seconds (use `timeout 15s yt-dlp --simulate ...`).

#### 7d. BlackHole Recording (if yt-dlp probe failed)

If `YTDLP_AUDIO` is still empty:

Start recording in background:
```bash
WAV_FILE="${OUTPUT_DIR}/tmp_${IDX}.wav"
bash "$(dirname "$0")/scripts/record-audio.sh" \
  "$BLACKHOLE_DEVICE" "$WAV_FILE" "$SESSION_ID" &
RECORD_PID=$!
```

Wait for the ffmpeg ready signal (max 15s):
```bash
READY_FILE="/tmp/evc-ffmpeg-ready-${SESSION_ID}"
WAIT=0
until [ -f "$READY_FILE" ] || [ $WAIT -ge 15 ]; do sleep 1; WAIT=$((WAIT+1)); done
if [ ! -f "$READY_FILE" ]; then
  echo "ERROR: ffmpeg did not start recording within 15s. CAUSE: BlackHole device index wrong or ffmpeg crash. FIX: Verify BLACKHOLE_DEVICE index with: ffmpeg -f avfoundation -list_devices true -i \"\""
  kill $RECORD_PID 2>/dev/null; continue
fi
```

Start Playwright — navigate to lecture and click play:
```bash
node "$(dirname "$0")/playwright/geektime-adapter.mjs" \
  --action play \
  --url "$LECTURE_URL" \
  --cookies "$COOKIE_FILE" \
  --session-id "$SESSION_ID" \
  --duration "${LECTURE_DURATION:-0}"
```

Wait for video-ended marker (poll 1s; max 90 min):
```bash
ENDED_FILE="/tmp/evc-video-ended-${SESSION_ID}"
ELAPSED=0
until [ -f "$ENDED_FILE" ] || [ $ELAPSED -ge 5400 ]; do
  sleep 1; ELAPSED=$((ELAPSED+1))
done
```

Stop recording (3s buffer after video ends, then SIGINT):
```bash
sleep 3
kill -INT $RECORD_PID 2>/dev/null
wait $RECORD_PID 2>/dev/null
rm -f "$READY_FILE" "$ENDED_FILE"
```

Set audio file:
```bash
AUDIO_FILE="$WAV_FILE"
```

#### 7e. Silence Detection

```bash
SILENCE_RATIO=$(ffmpeg -i "$AUDIO_FILE" -af silencedetect=noise=-35dB:d=2 \
  -f null - 2>&1 \
  | awk '/silence_duration/ {sum+=$NF; count++} END {print (count>0) ? sum : 0}')
DURATION=$(ffprobe -v quiet -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE")
RATIO=$(echo "$SILENCE_RATIO $DURATION" | awk '{if($2>0) print $1/$2; else print 0}')
OVER_THRESHOLD=$(echo "$RATIO" | awk '{print ($1 > 0.80) ? "yes" : "no"}')

if [ "$OVER_THRESHOLD" = "yes" ]; then
  echo "WARNING: Lecture $IDX audio is >80% silence (ratio=$RATIO). CAUSE: BlackHole may not be the system audio output, or video was muted. FIX: Open System Settings → Sound → Output → select 'Multi-Output Device'. Then re-run with --resume."
fi
```

#### 7f. ASR Transcription

Update progress to `transcribing`:
```bash
jq --arg idx "$IDX" '.lectures[$idx].status = "transcribing"' \
  "$PROGRESS_FILE" > /tmp/evc-prog.tmp && mv /tmp/evc-prog.tmp "$PROGRESS_FILE"
```

Run ASR via the modified extract_video_context.py:
```bash
ASR_OUT_DIR="${OUTPUT_DIR}/tmp_asr_${IDX}"
python "$(dirname "$0")/../../yt-video-summarizer/scripts/extract_video_context.py" \
  --audio-file "$AUDIO_FILE" \
  --out-dir "$ASR_OUT_DIR" \
  --asr-provider "${ASR_PROVIDER:-auto}"
```

If the command fails:
```
ERROR: ASR transcription failed for lecture <IDX>. CAUSE: faster-whisper venv missing or OPENROUTER_API_KEY not set. FIX: Activate the faster-whisper venv or set OPENROUTER_API_KEY in .env.
```
Mark progress `failed`, increment retry count, continue.

#### 7g. Summarize

Update progress to `summarizing`:
```bash
jq --arg idx "$IDX" '.lectures[$idx].status = "summarizing"' \
  "$PROGRESS_FILE" > /tmp/evc-prog.tmp && mv /tmp/evc-prog.tmp "$PROGRESS_FILE"
```

Read transcript:
```bash
TRANSCRIPT=$(cat "${ASR_OUT_DIR}/transcript.txt" 2>/dev/null || echo "")
```

Invoke content-summarizer with `content_type=lecture-text`:

Build metadata JSON safely (avoids injection if LECTURE_URL contains quotes):
```bash
METADATA_JSON=$(jq -n \
  --arg title "$SAFE_TITLE" \
  --arg source "$LECTURE_URL" \
  --arg num "$IDX" \
  '{"title":$title,"source":$source,"lecture_number":$num}')
```

Use the Skill tool to invoke `content-summarizer` with:
- `content_type`: `lecture-text`
- `content`: the transcript text
- `metadata`: `$METADATA_JSON` (the JSON string built above)
- `save_path`: `${OUTPUT_DIR}/${COURSE_NAME}/${IDX}-${SAFE_TITLE_KEBAB}.md`

#### 7h. Cleanup Temp Files

```bash
rm -f "$AUDIO_FILE" "${AUDIO_FILE%.wav}.m4a"
rm -rf "$ASR_OUT_DIR"
```

Update progress to `done`:
```bash
jq --arg idx "$IDX" '.lectures[$idx].status = "done"' \
  "$PROGRESS_FILE" > /tmp/evc-prog.tmp && mv /tmp/evc-prog.tmp "$PROGRESS_FILE"
echo "  [done] $IDX — ${OUTPUT_DIR}/${COURSE_NAME}/${IDX}-${SAFE_TITLE_KEBAB}.md"
```

### 8. Course Complete

```
Course complete: N lectures processed.
  Done:   X
  Failed: Y (run with --resume to retry)
Output: ${OUTPUT_DIR}/<COURSE_NAME>/
```

---

## Error Reference

| Error | Cause | Fix |
|-------|-------|-----|
| `ERROR: Another session is running (PID N)` | Lock file with live PID | Wait or kill the PID and delete `/tmp/encrypted-video-capture.lock` |
| `ERROR: BlackHole device not found` | BlackHole not installed or multi-output not configured | Follow setup-guide.md §1–3 |
| `ERROR: No lectures found at <URL>` | API auth failure or wrong URL | Re-login to Geektime in Chrome, retry |
| `ERROR: ffmpeg did not start recording within 15s` | Wrong BLACKHOLE_DEVICE index | Verify with `ffmpeg -f avfoundation -list_devices true -i ""` |
| `ERROR: ASR transcription failed` | faster-whisper venv missing or API key not set | Activate venv or set `OPENROUTER_API_KEY` |
| `WARNING: >80% silence` | Multi-Output Device not selected as system output | System Settings → Sound → Output → Multi-Output Device |
| `ERROR: .progress.json has schemaVersion 'X'` | Stale progress file from older version | Delete `.progress.json` to start fresh |
