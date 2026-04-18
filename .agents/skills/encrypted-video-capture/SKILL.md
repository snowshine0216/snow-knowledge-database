---
tags: [video-capture, asr, geektime, drm, lecture-notes]
source: internal
---

# Skill: encrypted-video-capture

Capture audio from DRM-protected video courses (Geektime, corporate training, webinar replays), transcribe via ASR, and generate structured Markdown lecture notes — one `.md` file per lecture.

## Usage

```
/encrypted-video-capture <course-url> [--dry-run] [--resume]
```

- `--dry-run`: enumerate lectures and print total estimated recording time; exit without recording
- `--resume`: skip lectures already marked `done` in `.progress.json`; retry `failed` up to 2×

Supported URLs:
```
https://time.geekbang.org/column/<id>
https://time.geekbang.org/video/<id>
https://time.geekbang.org/course/<id>
https://u.geekbang.org/lesson/<id>
```

## Prerequisites

Run `./scripts/preflight.sh` before the first use. See `references/setup-guide.md` for the
BlackHole + Audio MIDI Setup steps.

---

## Orchestration Steps

When the user invokes this skill with a course URL, follow these steps exactly.

### 0. URL Validation (fast-fail before any I/O)

Validate the URL immediately — before cookie export, before preflight, before anything else:
```bash
ADAPTER_CHECK=$(node -e "
  import('./playwright/adapters/adapter-interface.mjs').then(m => {
    const a = m.resolveAdapter(process.argv[1]);
    if (!a) {
      console.error('ERROR: Unsupported URL: ' + process.argv[1]);
      console.error('Supported platforms:');
      for (const p of m.supportedUrlPatterns()) console.error('  - ' + p);
      process.exit(1);
    }
    console.log(a.name);
  });
" -- "$COURSE_URL" 2>&1)
ADAPTER_EXIT=$?
if [ $ADAPTER_EXIT -ne 0 ]; then
  echo "$ADAPTER_CHECK"
  exit 1
fi
ADAPTER_NAME="$ADAPTER_CHECK"
echo "INFO: Adapter resolved: $ADAPTER_NAME"
```

### 0b. Environment Setup

Load `.env` if it exists in this skill directory:
```bash
[ -f "$(dirname "$0")/.env" ] && source "$(dirname "$0")/.env"
```

Required env vars (with defaults):
- `OUTPUT_DIR` — default: `courses/` relative to cwd
- `ASR_PROVIDER` — default: `openai` (uses OpenRouter when `OPENROUTER_API_KEY` is set, mirrors yt-video-summarizer)
- `BLACKHOLE_DEVICE` — auto-detected by preflight; override if needed
- `EVC_TMP` — default: `./tmp/evc` relative to cwd (project-local, persistent across reboots). **Never use `/tmp/`** — macOS clears `/tmp/` aggressively, and extended transcription jobs lose their audio mid-flight.

### 0c. Resolve Project-Local TMP Directory

All per-session artifacts (audio files, cookies, readiness markers, streaming transcripts) MUST live under `$EVC_TMP` — a project-relative directory, not the system `/tmp/`. `/tmp/` is ephemeral on macOS (cleared on reboot and periodically by the OS) and has caused data loss across long-running transcription jobs.

```bash
# Resolve project root (fallback to cwd if not in a git repo)
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
EVC_TMP="${EVC_TMP:-$REPO_ROOT/tmp/evc}"
mkdir -p "$EVC_TMP"
echo "INFO: EVC_TMP=$EVC_TMP"
# Ensure ./tmp/ is gitignored so artifacts don't leak into commits
if ! grep -qE '^/?tmp/?$' "$REPO_ROOT/.gitignore" 2>/dev/null; then
  echo "WARNING: tmp/ is not in $REPO_ROOT/.gitignore — consider adding it."
fi
```

OpenRouter transcription setup (same as yt-video-summarizer):
- `OPENROUTER_API_KEY` — required for OpenRouter ASR path
- `OPENROUTER_BASE_URL` — optional, default `https://openrouter.ai/api/v1`
- `OPENROUTER_TRANSCRIPTION_MODEL` — optional, default `openai/gpt-audio-mini`
- `OPENROUTER_TRANSCRIPTION_CHUNK_SECONDS` — optional, default `600`
- `OPENROUTER_TRANSCRIPTION_MAX_BYTES` — optional, default `12582912`

Simplified Chinese output:
- Install `opencc-python-reimplemented` (`pip install opencc-python-reimplemented`) or the native `opencc` CLI for automatic Traditional→Simplified conversion.
- Without opencc, the `output_language: simplified_chinese` metadata hint instructs content-summarizer to output in Simplified Chinese.

### 1. Lock File Check

```bash
LOCK_FILE="$EVC_TMP/encrypted-video-capture.lock"
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
  rm -f "$EVC_TMP/cookies-${SESSION_ID}.txt"
  rm -f "$EVC_TMP/ffmpeg-ready-${SESSION_ID}"
  rm -f "$EVC_TMP/ffmpeg-${SESSION_ID}.pid"
  rm -f "$EVC_TMP/video-ended-${SESSION_ID}"
  rm -f "$EVC_TMP/prog.tmp"
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
COOKIE_FILE="$EVC_TMP/cookies-${SESSION_ID}.txt"
touch "$COOKIE_FILE" && chmod 600 "$COOKIE_FILE"
yt-dlp --cookies-from-browser "${DEFAULT_BROWSER:-chrome}" --cookies "$COOKIE_FILE" \
  --skip-download "$COURSE_URL" 2>/dev/null || true
```

### 4. Lecture Enumeration

Use the platform-agnostic runner to enumerate lectures (dispatches to the correct adapter automatically):
```bash
LECTURE_LIST=$(node "$(dirname "$0")/playwright/runner.mjs" \
  --action enumerate \
  --url "$COURSE_URL" \
  --cookies "$COOKIE_FILE")
```

If `LECTURE_LIST` is empty or the command exits non-zero:
```
ERROR: No lectures found at <URL>. CAUSE: Adapter returned empty list or authentication failed. FIX: Re-open Chrome, log into the platform, and re-run. If persists, verify the URL is a supported format (see Supported URLs above).
```

Derive `COURSE_NAME` for the output directory from the enumeration result and course URL:
```bash
# Prefer the course title returned by the adapter; fall back to numeric ID
COURSE_ID=$(echo "$COURSE_URL" | grep -oE '[0-9]{5,}' | tail -1)
COURSE_TITLE=$(echo "$LECTURE_LIST" | jq -r '.[0].course_title // ""' 2>/dev/null)
if [ -n "$COURSE_TITLE" ]; then
  # Sanitize CJK + ASCII, kebab-case, max 60 chars; prefix with ID for uniqueness
  COURSE_TITLE_SLUG=$(echo "$COURSE_TITLE" \
    | python3 -c "import sys, re; raw=sys.stdin.read().strip(); print(re.sub(r'[^\w \-\u4e00-\u9fff]', '', raw, flags=re.UNICODE).strip()[:60])" \
    | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | sed 's/-\{2,\}/-/g')
  COURSE_NAME="${COURSE_ID}-${COURSE_TITLE_SLUG}"
else
  COURSE_NAME="${COURSE_ID:-unknown-course}"
fi
mkdir -p "${OUTPUT_DIR}/${COURSE_NAME}"
```

Write lecture metadata into `.progress.json` (schemaVersion 2). This persists the lecture list across reboots — resuming never requires re-enumeration:
```bash
PROGRESS_FILE="${OUTPUT_DIR}/${COURSE_NAME}/.progress.json"
python3 - <<'EOF'
import json, sys, datetime, shutil
progress_file, lecture_list_json, course_url, course_name = sys.argv[1:]
with open(progress_file) as f:
    prog = json.load(f)
lectures = json.loads(lecture_list_json)
prog['schemaVersion'] = 2
prog['courseUrl'] = course_url
prog['courseName'] = course_name
prog['enumeratedAt'] = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
for lec in lectures:
    idx = str(lec['idx'])
    existing = prog['lectures'].get(idx, {})
    prog['lectures'][idx] = {
        'title': lec.get('title') or existing.get('title'),
        'url': lec.get('url') or existing.get('url'),
        'duration': lec.get('duration') or existing.get('duration'),
        'status': existing.get('status', 'pending'),
        'retries': existing.get('retries', 0),
    }
tmp = progress_file + '.tmp'
with open(tmp, 'w') as f:
    json.dump(prog, f, ensure_ascii=False, indent=2)
shutil.move(tmp, progress_file)
print(f'INFO: Wrote {len(lectures)} lectures to {progress_file}')
EOF
python3 - "$PROGRESS_FILE" "$LECTURE_LIST" "$COURSE_URL" "$COURSE_NAME"
```

### 5. Dry Run (if --dry-run)

Print adapter name, then each lecture title and index, then total estimated recording time (30 min × count):
```
Adapter: <adapter-name> (<course-url>)
Lecture 001: <title>  (~30 min)
Lecture 002: <title>  (~30 min)
...
Total: N lectures, estimated ~X hr Y min recording time.
Dry-run complete. No recording performed.
```
Exit 0.

### 6. Load / Initialize Progress

`PROGRESS_FILE` is set in Step 4 as `${OUTPUT_DIR}/${COURSE_NAME}/.progress.json`. Load it (or initialize) and handle v1→v2 migration:

```bash
if [ -f "$PROGRESS_FILE" ]; then
  SCHEMA_VERSION=$(jq -r '.schemaVersion // "missing"' "$PROGRESS_FILE")
  if [ "$SCHEMA_VERSION" = "1" ]; then
    # Auto-migrate v1 → v2 in-place. url/duration fields will be null until Step 4 enumeration runs.
    python3 - <<'EOF'
import json, shutil, sys
progress_file = sys.argv[1]
with open(progress_file) as f:
    data = json.load(f)
migrated = {
    'schemaVersion': 2,
    'courseUrl': None,
    'courseName': None,
    'enumeratedAt': None,
    'lectures': {},
}
for idx, entry in data.get('lectures', {}).items():
    status = 'done' if entry.get('status') == 'transcribed' else entry.get('status', 'pending')
    migrated['lectures'][idx] = {
        'title': entry.get('title'),
        'url': None,
        'duration': None,
        'status': status,
        'retries': entry.get('retries', 0),
    }
tmp = progress_file + '.tmp'
with open(tmp, 'w') as f:
    json.dump(migrated, f, ensure_ascii=False, indent=2)
shutil.move(tmp, progress_file)
print(f'INFO: Migrated {progress_file} from schemaVersion 1 → 2')
EOF
    python3 - "$PROGRESS_FILE"
  elif [ "$SCHEMA_VERSION" != "2" ]; then
    echo "ERROR: .progress.json has schemaVersion '$SCHEMA_VERSION'. CAUSE: Stale or incompatible progress file. FIX: Delete $PROGRESS_FILE to start fresh."
    exit 1
  fi
else
  echo '{"schemaVersion":2,"courseUrl":null,"courseName":null,"enumeratedAt":null,"lectures":{}}' > "$PROGRESS_FILE"
fi
```

### 6b. Generate Per-Course Loop Script

Generate `courses/<name>/evc-loop.py` from the shared template if it doesn't exist yet. This script is what you run to resume captures after a reboot — no Claude session required:

```bash
LOOP_SCRIPT="${OUTPUT_DIR}/${COURSE_NAME}/evc-loop.py"
if [ ! -f "$LOOP_SCRIPT" ]; then
  python3 "$(dirname "$0")/scripts/loop.py" \
    --course-dir "${OUTPUT_DIR}/${COURSE_NAME}" \
    --generate
  echo "INFO: Loop script generated: ${LOOP_SCRIPT}"
  echo "INFO: After this session, resume anytime with:"
  echo "      python3 ${LOOP_SCRIPT}"
fi
```

The generated script has `COURSE_DIR` hardcoded. It reads `courseUrl` + lecture list from `.progress.json` and auto-refreshes cookies from Chrome on every startup. To update it after a template change, delete and re-run.

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
  "$PROGRESS_FILE" > $EVC_TMP/prog.tmp && mv $EVC_TMP/prog.tmp "$PROGRESS_FILE"
```

#### 7c. yt-dlp Probe (Direct Download Attempt)

```bash
AUDIO_TMP_DIR="$EVC_TMP/audio/${COURSE_NAME}"
mkdir -p "$AUDIO_TMP_DIR"
YTDLP_AUDIO=""
if timeout 15s yt-dlp --simulate --cookies "$COOKIE_FILE" "$LECTURE_URL" 2>/dev/null; then
  # Direct download available — use it instead of BlackHole
  YTDLP_AUDIO="${AUDIO_TMP_DIR}/tmp_${IDX}.m4a"
  yt-dlp --cookies "$COOKIE_FILE" -x --audio-format m4a \
    -o "$YTDLP_AUDIO" "$LECTURE_URL" 2>/dev/null && \
    echo "INFO: yt-dlp direct download succeeded for lecture $IDX."
fi
```

Timeout the probe after 15 seconds (use `timeout 15s yt-dlp --simulate ...`).

#### 7d. BlackHole Recording (if yt-dlp probe failed)

If `YTDLP_AUDIO` is still empty:

Parse playback speed (clamp to [1.0, 2.0]):
```bash
PLAYBACK_SPEED="${PLAYBACK_SPEED:-2.0}"
# Wall-clock timeout = real duration / speed (min 60s if duration unknown)
if [ "${LECTURE_DURATION:-0}" -gt 0 ]; then
  WALL_TIMEOUT=$(echo "$LECTURE_DURATION $PLAYBACK_SPEED" | awk '{t=int($1/$2); print (t<60)?60:t}')
else
  WALL_TIMEOUT=5400
fi
```

Start recording in background. Audio is stored under `$EVC_TMP/audio/<COURSE_NAME>/` so temp files never land in the output repo:
```bash
AUDIO_TMP_DIR="$EVC_TMP/audio/${COURSE_NAME}"
mkdir -p "$AUDIO_TMP_DIR"
WAV_FILE="${AUDIO_TMP_DIR}/tmp_${IDX}.wav"
bash "$(dirname "$0")/scripts/record-audio.sh" \
  "$BLACKHOLE_DEVICE" "$WAV_FILE" "$SESSION_ID" &
RECORD_PID=$!
```

Wait for the ffmpeg ready signal (max 15s):
```bash
READY_FILE="$EVC_TMP/ffmpeg-ready-${SESSION_ID}"
WAIT=0
until [ -f "$READY_FILE" ] || [ $WAIT -ge 15 ]; do sleep 1; WAIT=$((WAIT+1)); done
if [ ! -f "$READY_FILE" ]; then
  echo "ERROR: ffmpeg did not start recording within 15s. CAUSE: BlackHole device index wrong or ffmpeg crash. FIX: Verify BLACKHOLE_DEVICE index with: ffmpeg -f avfoundation -list_devices true -i \"\""
  kill $RECORD_PID 2>/dev/null; continue
fi
```

#### 7d.1. Start Streaming ASR (background)

Start the streaming ASR preview in background immediately after ffmpeg is ready.
It tails the growing WAV independently and writes JSONL chunks to a session log.

```bash
TRANSCRIPT_LOG="$EVC_TMP/transcript-${SESSION_ID}.jsonl"
node "$(dirname "$0")/scripts/streaming-asr.mjs" \
  --wav "$WAV_FILE" \
  --session-id "$SESSION_ID" &
ASR_STREAM_PID=$!
```

Start Playwright — navigate to lecture and click play (pass adjusted duration for timeout):
```bash
ADJUSTED_DURATION=$(echo "${LECTURE_DURATION:-0} $PLAYBACK_SPEED" | awk '{print int($1/$2)}')
PLAYBACK_SPEED="$PLAYBACK_SPEED" node "$(dirname "$0")/playwright/runner.mjs" \
  --action play \
  --url "$LECTURE_URL" \
  --cookies "$COOKIE_FILE" \
  --session-id "$SESSION_ID" \
  --duration "$ADJUSTED_DURATION"
```

Wait for video-ended marker (poll 1s; max WALL_TIMEOUT):
```bash
ENDED_FILE="$EVC_TMP/video-ended-${SESSION_ID}"
ELAPSED=0
until [ -f "$ENDED_FILE" ] || [ $ELAPSED -ge "$WALL_TIMEOUT" ]; do
  sleep 1; ELAPSED=$((ELAPSED+1))
done
```

Stop recording (3s buffer after video ends, then SIGINT):
```bash
sleep 3
kill -INT $RECORD_PID 2>/dev/null
wait $RECORD_PID 2>/dev/null
kill "$ASR_STREAM_PID" 2>/dev/null
wait "$ASR_STREAM_PID" 2>/dev/null
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
  "$PROGRESS_FILE" > $EVC_TMP/prog.tmp && mv $EVC_TMP/prog.tmp "$PROGRESS_FILE"
```

Check streaming ASR coverage before falling back to batch:
```bash
STREAMING_TRANSCRIPT=""
if [ -f "$TRANSCRIPT_LOG" ]; then
  # Count JSONL entries and estimate coverage
  CHUNK_COUNT=$(wc -l < "$TRANSCRIPT_LOG" | tr -d ' ')
  STREAMING_SECS=$(echo "$CHUNK_COUNT" | awk '{print $1 * 10}')  # 10s per chunk
  WAV_DURATION=$(ffprobe -v quiet -show_entries format=duration \
    -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE" 2>/dev/null || echo 0)
  COVERAGE=$(echo "$STREAMING_SECS $WAV_DURATION" | \
    awk '{if($2>0) printf "%.2f", $1/$2; else print 0}')
  OVER_80=$(echo "$COVERAGE" | awk '{print ($1 >= 0.80) ? "yes" : "no"}')
  if [ "$OVER_80" = "yes" ]; then
    echo "INFO: Streaming ASR coverage ${COVERAGE} >= 0.80 — using streaming transcript."
    STREAMING_TRANSCRIPT=$(jq -r '.text' "$TRANSCRIPT_LOG" 2>/dev/null | tr '\n' ' ')
  fi
fi
```

If streaming coverage < 80%, fall back to batch ASR via OpenRouter (same path as yt-video-summarizer):
```bash
if [ -z "$STREAMING_TRANSCRIPT" ]; then
  ASR_OUT_DIR="$EVC_TMP/audio/${COURSE_NAME}/asr_${IDX}"
  # Use OpenRouter for transcription when OPENROUTER_API_KEY is set (mirrors yt-video-summarizer)
  # Set ASR_PROVIDER=openai in .env to force OpenRouter; auto falls back to faster-whisper first.
  python3 "$(dirname "$0")/../../yt-video-summarizer/scripts/extract_video_context.py" \
    --audio-file "$AUDIO_FILE" \
    --out-dir "$ASR_OUT_DIR" \
    --asr-provider "${ASR_PROVIDER:-openai}"
  if [ $? -ne 0 ]; then
    echo "ERROR: ASR transcription failed for lecture $IDX. CAUSE: faster-whisper venv missing or OPENROUTER_API_KEY not set. FIX: Set OPENROUTER_API_KEY in .env (mirrors yt-video-summarizer OpenRouter setup)."
    jq --arg idx "$IDX" \
      '.lectures[$idx].status = "failed" | .lectures[$idx].retries = (.lectures[$idx].retries // 0) + 1' \
      "$PROGRESS_FILE" > $EVC_TMP/prog.tmp && mv $EVC_TMP/prog.tmp "$PROGRESS_FILE"
    continue
  fi
fi
rm -f "$TRANSCRIPT_LOG"

#### 7g. Summarize via Subagent

Update progress to `summarizing`:
```bash
jq --arg idx "$IDX" '.lectures[$idx].status = "summarizing"' \
  "$PROGRESS_FILE" > $EVC_TMP/prog.tmp && mv $EVC_TMP/prog.tmp "$PROGRESS_FILE"
```

Read transcript (prefer streaming if available, otherwise read from ASR output dir). Also capture the path so the subagent can read it directly:
```bash
if [ -n "$STREAMING_TRANSCRIPT" ]; then
  TRANSCRIPT_FILE="$EVC_TMP/transcript-${SESSION_ID}-${IDX}.txt"
  printf '%s' "$STREAMING_TRANSCRIPT" > "$TRANSCRIPT_FILE"
else
  TRANSCRIPT_FILE="${ASR_OUT_DIR}/transcript.txt"
fi
```

Convert Traditional Chinese to Simplified Chinese (if the transcript contains Chinese characters):
```bash
HAS_CHINESE=$(head -c 4000 "$TRANSCRIPT_FILE" | python3 -c "
import sys, re
text = sys.stdin.read()
print('yes' if re.search(r'[\u4e00-\u9fff]', text) else 'no')
")
SIMPLIFIED_CHINESE_HINT=""
if [ "$HAS_CHINESE" = "yes" ] && command -v opencc >/dev/null 2>&1; then
  CONVERTED="$EVC_TMP/transcript-${SESSION_ID}-${IDX}-simplified.txt"
  opencc -c t2s -i "$TRANSCRIPT_FILE" -o "$CONVERTED"
  TRANSCRIPT_FILE="$CONVERTED"
  echo "INFO: Converted transcript from Traditional to Simplified Chinese via opencc."
elif [ "$HAS_CHINESE" = "yes" ]; then
  SIMPLIFIED_CHINESE_HINT="true"
  echo "INFO: opencc not found — passing simplified_chinese hint to the subagent."
fi
```

**Spawn a general-purpose subagent to write the lesson summary.** Each lesson writeup is delegated to an independent agent so (a) the main session doesn't bloat its context with every transcript, (b) writeups can run in parallel when multiple transcripts are ready, and (c) the agent focuses exclusively on producing high-quality, rich pedagogical notes (not just transcript dumps or bullet outlines).

Use the `Agent` tool with `subagent_type: "general-purpose"` and a self-contained prompt that includes:

1. The transcript file path (absolute)
2. Lesson metadata: index, title, source URL, tags, course name, instructor if known
3. Two target output paths: `${OUTPUT_DIR}/${COURSE_NAME}/${IDX}-${SAFE_TITLE_KEBAB}.md` (raw tree) AND `wiki/courses/${COURSE_NAME}/${IDX}-${SAFE_TITLE_KEBAB}.md` (wiki tree)
4. Simplified-Chinese hint (if `$SIMPLIFIED_CHINESE_HINT` is `true`)
5. Explicit reference to `references/lesson-writeup-template.md` — the agent MUST match this template format exactly

The subagent prompt MUST include the full template requirements inline (do not assume the agent can infer structure):

```
You are writing a high-quality lecture note from a course transcript. Read the transcript at $TRANSCRIPT_FILE and produce a Markdown file at BOTH paths listed below (they must be identical content). Follow the template in $SKILL_DIR/references/lesson-writeup-template.md exactly — especially:

REQUIRED STRUCTURE (in this exact order):
1. YAML frontmatter with `tags` (array) and `source` (URL)
2. ## Pre-test — at the TOP, BEFORE any content. Italicized priming instruction, then 3 open-ended questions. Follow with a `---` horizontal rule.
3. # Lecture ${IDX}: ${TITLE} — main heading
4. **Source:** line with linked URL, course name, platform, instructor (if known)
5. ## Outline — bulleted list of anchor links to the content sections
6. `---` horizontal rule
7. 3–6 rich content sections (## headings). Each section is paragraphs of prose (200–400 words per section typical). NEVER just bullet outlines. Use tables/code blocks where helpful. Explain mechanisms, not just names. Include concrete examples from the transcript.
8. `---` horizontal rule
9. ## Post-test — italicized "Close this file. Write or say your answers aloud from memory before revealing the guide" prompt, then 3 open-ended questions (parallel to pre-test but requiring deeper synthesis)
10. `<details><summary>Answer Guide</summary>` block with numbered, detailed answers (2–4 sentences each). Close with `</details>`.

FORBIDDEN:
- Writing just a bullet-list outline in place of prose sections
- Putting the pre-test at the bottom
- Omitting the answer guide
- Using `[markdown](links)` instead of `[[wikilinks]]` when referencing other lessons
- Truncating: aim for 800–1500 words of rich content excluding pre/post-test

After writing, also APPEND the lesson URL and slug to the progress.md update step (step 7i handles this — you do not need to modify progress.md).

SAVE TO BOTH:
  ${OUTPUT_DIR}/${COURSE_NAME}/${IDX}-${SAFE_TITLE_KEBAB}.md
  wiki/courses/${COURSE_NAME}/${IDX}-${SAFE_TITLE_KEBAB}.md

Return only: "WROTE ${IDX}" on success, or "FAILED ${IDX}: <reason>" on error.
```

Invoke the Agent tool with that prompt. Wait for it to return before proceeding to 7h.

#### 7h. Cleanup Temp Files

```bash
rm -f "$AUDIO_FILE" "${AUDIO_FILE%.m4a}.m4a" "${AUDIO_FILE%.wav}.wav"
rm -rf "$ASR_OUT_DIR"
rm -f "$EVC_TMP/transcript-${SESSION_ID}-${IDX}.txt" "$EVC_TMP/transcript-${SESSION_ID}-${IDX}-simplified.txt"
# Note: $EVC_TMP/audio/${COURSE_NAME}/ dir is intentionally left in place across
# lectures so --resume can reuse audio if recording succeeded but ASR failed.
# Full dir is removed only on explicit clean-up or after course completes successfully.
```

#### 7i. Mark Done and Update progress.md (live, per-lesson)

Update `.progress.json` to `done`:
```bash
jq --arg idx "$IDX" '.lectures[$idx].status = "done"' \
  "$PROGRESS_FILE" > $EVC_TMP/prog.tmp && mv $EVC_TMP/prog.tmp "$PROGRESS_FILE"
echo "  [done] $IDX — ${OUTPUT_DIR}/${COURSE_NAME}/${IDX}-${SAFE_TITLE_KEBAB}.md"
```

**ALSO update the human-readable `progress.md` live** (this step runs after EVERY lesson, not just at course-end). Mark the just-completed lesson's row from `⬜ pending` → `✅ done`, and refresh the summary counts at the bottom:

```bash
PROGRESS_MD="${OUTPUT_DIR}/${COURSE_NAME}/progress.md"
python3 - "$PROGRESS_MD" "$IDX" "$SAFE_TITLE_KEBAB" "$PROGRESS_FILE" <<'PYEOF'
import json, re, sys, pathlib
md_path, idx, slug, json_path = sys.argv[1:]
md = pathlib.Path(md_path)
if not md.exists():
    print(f"WARN: {md_path} missing — skipping live update")
    sys.exit(0)
text = md.read_text()
# Flip any matching row (by idx) from ⬜ pending to ✅ done
# Matches common patterns: | 001 | [[...]] | ⬜ pending |
pattern = re.compile(r'(\|\s*' + re.escape(idx) + r'\s*\|[^|]*\|)\s*⬜\s*pending\s*(\|)', re.UNICODE)
text, n = pattern.subn(r'\1 ✅ done \2', text)
# Refresh done/pending/failed counts at the bottom (driven by .progress.json)
prog = json.loads(pathlib.Path(json_path).read_text())
counts = {'done': 0, 'pending': 0, 'failed': 0}
for lec in prog.get('lectures', {}).values():
    s = lec.get('status', 'pending')
    counts[s if s in counts else 'pending'] += 1
total = sum(counts.values())
summary_block = (
    f"- **Done:** {counts['done']} / {total}\n"
    f"- **Pending:** {counts['pending']} / {total}\n"
    f"- **Failed:** {counts['failed']} / {total}"
)
text = re.sub(
    r'- \*\*Done:\*\* \d+ / \d+\n- \*\*Pending:\*\* \d+ / \d+\n- \*\*Failed:\*\* \d+ / \d+',
    summary_block, text, count=1
)
md.write_text(text)
print(f"INFO: Updated progress.md ({n} row flipped, counts refreshed)")
PYEOF
```

If `progress.md` uses a different row format (schema drift across courses), the regex substitution silently no-ops and the status-counts block still refreshes — this is intentional (idempotent, safe).

### 8. Course Complete

```
Course complete: N lectures processed.
  Done:   X
  Failed: Y (run with --resume to retry)
Output: ${OUTPUT_DIR}/<COURSE_NAME>/
```

### 8a. Obsidian Index Update

After all lectures are processed, scan `${OUTPUT_DIR}/${COURSE_NAME}/` for `.md` files (excluding `_index.md`) and append or update a row in `${OUTPUT_DIR}/_index.md`.

The index row format is:
```
| [[<COURSE_NAME>/<filename_stem>]] | <COURSE_NAME> | <date> |
```

If `_index.md` does not exist, create it with a header:
```markdown
# Lecture Index

| Lecture | Course | Date |
|---------|--------|------|
```

Then append one row per lecture file. If a row for the course already exists, skip duplicates (idempotent). Example bash snippet:

```bash
INDEX_FILE="${OUTPUT_DIR}/_index.md"
if [ ! -f "$INDEX_FILE" ]; then
  printf '# Lecture Index\n\n| Lecture | Course | Date |\n|---------|--------|------|\n' > "$INDEX_FILE"
fi
TODAY=$(date +%Y-%m-%d)
for md_file in "${OUTPUT_DIR}/${COURSE_NAME}"/*.md; do
  [ -f "$md_file" ] || continue
  stem=$(basename "$md_file" .md)
  row="| [[${COURSE_NAME}/${stem}]] | ${COURSE_NAME} | ${TODAY} |"
  grep -qF "$stem" "$INDEX_FILE" || echo "$row" >> "$INDEX_FILE"
done
echo "INFO: Updated ${INDEX_FILE}"
```

### 8b. Wiki Backfill Check

For each lecture `.md` file in `${OUTPUT_DIR}/${COURSE_NAME}/`, check whether it has already been compiled to `wiki/`. If not, run the wiki compilation pipeline as a safety net (the content-summarizer post-hook handles this automatically for new lectures; this step covers lectures summarized before the post-hook existed).

```bash
for md_file in "${OUTPUT_DIR}/${COURSE_NAME}"/*.md; do
  [ -f "$md_file" ] || continue
  stem=$(basename "$md_file" .md)
  # Skip if already in wiki/
  if ls wiki/**/*"${stem}"* 2>/dev/null | grep -q .; then
    echo "  [wiki-skip] ${stem} already compiled."
    continue
  fi
  # Run collision check
  COLLISION=$(bash "$(dirname "$0")/../../scripts/wiki-collision-check.sh" \
    "$(grep -m1 '^source:' "$md_file" | awk '{print $2}')" \
    "$(grep -m1 '^tags:' "$md_file" | sed 's/tags: //')" 2>/dev/null || echo "CREATE")
  case "$COLLISION" in
    CREATE)
      bash "$(dirname "$0")/../../scripts/compile.sh" "$md_file" && \
        echo "  [wiki-compiled] ${stem}"
      ;;
    ENRICH*)
      echo "  [wiki-enrich] ${stem} → ${COLLISION}"
      ;;
    SKIP)
      echo "  [wiki-skip] ${stem} — duplicate detected."
      ;;
  esac
done
```

---

## Error Reference

| Error | Cause | Fix |
|-------|-------|-----|
| `ERROR: Unsupported URL: <url>` | URL does not match any registered adapter | Use a supported URL format (see Supported URLs above) |
| `ERROR: Another session is running (PID N)` | Lock file with live PID | Wait or kill the PID and delete `$EVC_TMP/encrypted-video-capture.lock` |
| `ERROR: BlackHole device not found` | BlackHole not installed or multi-output not configured | Follow setup-guide.md §1–3 |
| `ERROR: No lectures found at <URL>` | Adapter returned empty list or auth failed | Re-login to the platform in Chrome, retry |
| `ERROR: ffmpeg did not start recording within 15s` | Wrong BLACKHOLE_DEVICE index | Verify with `ffmpeg -f avfoundation -list_devices true -i ""` |
| `ERROR: ASR transcription failed` | `OPENROUTER_API_KEY` not set or network error | Set `OPENROUTER_API_KEY` in `.env`; mirrors yt-video-summarizer OpenRouter setup |
| `INFO: opencc not found` | opencc not installed | `pip install opencc-python-reimplemented` or `brew install opencc`; content-summarizer hint used as fallback |
| `WARNING: >80% silence` | Multi-Output Device not selected as system output | System Settings → Sound → Output → Multi-Output Device |
| `ERROR: .progress.json has schemaVersion 'X'` | Stale or unrecognized schema (v1 is auto-migrated; others are fatal) | Delete `.progress.json` to start fresh |
| `ERROR: courseUrl is not set` | First loop.py run on a v1-migrated file without `--url` | Run `python3 courses/<name>/evc-loop.py --url <course-url>` |
| `WARNING: Cookie export failed` | Chrome not running or yt-dlp not in PATH | Start Chrome, then retry |
