#!/usr/bin/env bash
# Record and summarize all lectures for AI Engineering Training Camp (class-818)
# Usage: bash record-all.sh [--resume]
# Output goes to: courses/ai-engineering-training-camp/<section>/

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

COURSE_URL="https://u.geekbang.org/lesson/818"
OUTPUT_BASE="courses/ai-engineering-training-camp"
PROGRESS_FILE="${OUTPUT_BASE}/.progress.json"
SKILL_DIR=".claude/skills/encrypted-video-capture"
SESSION_ID="$(date +%s)-$$"
COOKIE_FILE="/tmp/evc-cookies-${SESSION_ID}.txt"
LOCK_FILE="/tmp/encrypted-video-capture.lock"
BLACKHOLE_DEVICE=0
PLAYBACK_SPEED="${PLAYBACK_SPEED:-1.5}"
source "${SKILL_DIR}/.env" 2>/dev/null || true

cleanup() {
  rm -f "$LOCK_FILE"
  rm -f "$COOKIE_FILE"
  rm -f "/tmp/evc-ffmpeg-ready-${SESSION_ID}"
  rm -f "/tmp/evc-ffmpeg-${SESSION_ID}.pid"
  rm -f "/tmp/evc-video-ended-${SESSION_ID}"
  rm -f "/tmp/evc-prog.tmp"
}
trap cleanup EXIT INT TERM

# Lock check
if [ -f "$LOCK_FILE" ]; then
  STALE_PID="$(cat "$LOCK_FILE")"
  if kill -0 "$STALE_PID" 2>/dev/null; then
    echo "ERROR: Another session running (PID $STALE_PID). Kill it first."
    exit 1
  fi
  rm -f "$LOCK_FILE"
fi
echo "$$" > "$LOCK_FILE"

# Section mapping function
get_section() {
  local idx="$1"
  local n=$((10#$idx))
  if   [ $n -le 5 ];  then echo "livestreams"
  elif [ $n -le 15 ]; then echo "module-1-ai-engineering-basics"
  elif [ $n -le 22 ]; then echo "module-2-fine-tuning"
  elif [ $n -le 31 ]; then echo "module-3-rag"
  elif [ $n -le 44 ]; then echo "module-4-dialogue-systems"
  elif [ $n -le 54 ]; then echo "module-5-multi-agent"
  elif [ $n -le 63 ]; then echo "module-6-dsl-nl2sql"
  elif [ $n -le 74 ]; then echo "module-7-memory-advanced"
  elif [ $n -le 80 ]; then echo "module-8-deployment"
  elif [ $n -le 88 ]; then echo "module-9-async-fastapi"
  elif [ $n -le 94 ]; then echo "module-10-final-project"
  else                     echo "module-11-production"
  fi
}

# Export cookies
touch "$COOKIE_FILE" && chmod 600 "$COOKIE_FILE"
yt-dlp --cookies-from-browser chrome --cookies "$COOKIE_FILE" "https://u.geekbang.org" 2>/dev/null || true

# Enumerate lectures
echo "INFO: Enumerating lectures..."
LECTURE_LIST=$(node "${SKILL_DIR}/playwright/runner.mjs" \
  --action enumerate \
  --url "$COURSE_URL" \
  --cookies "$COOKIE_FILE" 2>/dev/null)

TOTAL=$(echo "$LECTURE_LIST" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d))")
echo "INFO: Found $TOTAL lectures."

# Process each lecture
DONE=0; FAILED=0
for row in $(echo "$LECTURE_LIST" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for item in data:
    print(item['idx'] + '|' + item['title'].replace('|','').replace('\n','') + '|' + item['url'] + '|' + str(item.get('duration',0)))
"); do
  IDX=$(echo "$row" | cut -d'|' -f1)
  RAW_TITLE=$(echo "$row" | cut -d'|' -f2)
  LECTURE_URL=$(echo "$row" | cut -d'|' -f3)
  LECTURE_DURATION=$(echo "$row" | cut -d'|' -f4)

  # Check progress
  STATUS=$(python3 -c "
import json, sys
try:
  d = json.load(open('${PROGRESS_FILE}'))
  print(d['lectures'].get('${IDX}', {}).get('status', 'pending'))
except: print('pending')
")
  RETRY_COUNT=$(python3 -c "
import json, sys
try:
  d = json.load(open('${PROGRESS_FILE}'))
  print(d['lectures'].get('${IDX}', {}).get('retries', 0))
except: print(0)
")

  if [ "$STATUS" = "done" ]; then
    echo "  [skip] $IDX already done."
    DONE=$((DONE+1))
    continue
  fi
  if [ "$STATUS" = "failed" ] && [ "$RETRY_COUNT" -ge 2 ]; then
    echo "  [skip] $IDX failed $RETRY_COUNT times."
    FAILED=$((FAILED+1))
    continue
  fi

  # Sanitize title
  SAFE_TITLE=$(echo "$RAW_TITLE" | python3 -c "import sys, re; raw=sys.stdin.read(); print(re.sub(r'[^\w \-\u4e00-\u9fff]', '', raw, flags=re.UNICODE).strip()[:80])")
  [ -z "$SAFE_TITLE" ] && SAFE_TITLE="lecture-${IDX}"
  SAFE_TITLE_KEBAB=$(echo "$SAFE_TITLE" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | sed 's/-\{2,\}/-/g')

  SECTION=$(get_section "$IDX")
  SAVE_PATH="${OUTPUT_BASE}/${SECTION}/${IDX}-${SAFE_TITLE_KEBAB}.md"

  echo ""
  echo "=== [$IDX/$TOTAL] $SAFE_TITLE → $SECTION ==="

  # Update progress to recording
  python3 -c "
import json
with open('${PROGRESS_FILE}') as f: d=json.load(f)
d['lectures']['${IDX}'] = {'status': 'recording', 'title': '${SAFE_TITLE}', 'retries': int('${RETRY_COUNT}')}
with open('${PROGRESS_FILE}', 'w') as f: json.dump(d, f, ensure_ascii=False, indent=2)
"

  AUDIO_TMP_DIR="/tmp/evc-audio/class-818"
  mkdir -p "$AUDIO_TMP_DIR"

  # BlackHole recording
  WALL_TIMEOUT=5400
  if [ "${LECTURE_DURATION:-0}" -gt 0 ]; then
    WALL_TIMEOUT=$(echo "$LECTURE_DURATION $PLAYBACK_SPEED" | awk '{t=int($1/$2)+120; print (t<120)?120:t}')
  fi

  WAV_FILE="${AUDIO_TMP_DIR}/tmp_${IDX}.wav"
  rm -f "$WAV_FILE"

  # Start recording
  READY_FILE="/tmp/evc-ffmpeg-ready-${SESSION_ID}"
  ENDED_FILE="/tmp/evc-video-ended-${SESSION_ID}"
  rm -f "$READY_FILE" "$ENDED_FILE"

  bash "${SKILL_DIR}/scripts/record-audio.sh" "$BLACKHOLE_DEVICE" "$WAV_FILE" "$SESSION_ID" &
  RECORD_PID=$!

  # Wait for ffmpeg ready (max 15s)
  WAIT=0
  until [ -f "$READY_FILE" ] || [ $WAIT -ge 15 ]; do sleep 1; WAIT=$((WAIT+1)); done
  if [ ! -f "$READY_FILE" ]; then
    echo "ERROR: ffmpeg not ready within 15s for $IDX"
    kill $RECORD_PID 2>/dev/null
    python3 -c "
import json
with open('${PROGRESS_FILE}') as f: d=json.load(f)
d['lectures']['${IDX}']['status'] = 'failed'
d['lectures']['${IDX}']['retries'] = int('${RETRY_COUNT}') + 1
with open('${PROGRESS_FILE}', 'w') as f: json.dump(d, f, ensure_ascii=False, indent=2)
"
    FAILED=$((FAILED+1))
    continue
  fi
  echo "  [recording] ffmpeg ready, launching Playwright..."

  # Start Playwright playback
  ADJUSTED_DURATION=$(echo "${LECTURE_DURATION:-0} $PLAYBACK_SPEED" | awk '{print int($1/$2)}')
  PLAYBACK_SPEED="$PLAYBACK_SPEED" node "${SKILL_DIR}/playwright/runner.mjs" \
    --action play \
    --url "$LECTURE_URL" \
    --cookies "$COOKIE_FILE" \
    --session-id "$SESSION_ID" \
    --duration "$ADJUSTED_DURATION" 2>&1 | grep -v "^$" || true

  # Wait for video end
  ELAPSED=0
  until [ -f "$ENDED_FILE" ] || [ $ELAPSED -ge "$WALL_TIMEOUT" ]; do
    sleep 1; ELAPSED=$((ELAPSED+1))
  done
  if [ -f "$ENDED_FILE" ]; then
    echo "  [recording] Video ended signal received after ${ELAPSED}s"
  else
    echo "  [recording] Wall timeout reached after ${ELAPSED}s"
  fi

  sleep 3
  kill -INT $RECORD_PID 2>/dev/null
  wait $RECORD_PID 2>/dev/null
  rm -f "$READY_FILE" "$ENDED_FILE"

  if [ ! -f "$WAV_FILE" ] || [ ! -s "$WAV_FILE" ]; then
    echo "ERROR: WAV file missing or empty for $IDX"
    python3 -c "
import json
with open('${PROGRESS_FILE}') as f: d=json.load(f)
d['lectures']['${IDX}']['status'] = 'failed'
d['lectures']['${IDX}']['retries'] = int('${RETRY_COUNT}') + 1
with open('${PROGRESS_FILE}', 'w') as f: json.dump(d, f, ensure_ascii=False, indent=2)
"
    FAILED=$((FAILED+1))
    continue
  fi

  WAV_SIZE=$(wc -c < "$WAV_FILE" | tr -d ' ')
  echo "  [recorded] ${WAV_SIZE} bytes"

  # Update to transcribing
  python3 -c "
import json
with open('${PROGRESS_FILE}') as f: d=json.load(f)
d['lectures']['${IDX}']['status'] = 'transcribing'
with open('${PROGRESS_FILE}', 'w') as f: json.dump(d, f, ensure_ascii=False, indent=2)
"

  # ASR transcription
  ASR_OUT_DIR="${AUDIO_TMP_DIR}/asr_${IDX}"
  rm -rf "$ASR_OUT_DIR" && mkdir -p "$ASR_OUT_DIR"
  echo "  [transcribing] Running ASR..."

  python3 "${SKILL_DIR}/../../yt-video-summarizer/scripts/extract_video_context.py" \
    --audio-file "$WAV_FILE" \
    --out-dir "$ASR_OUT_DIR" \
    --asr-provider "faster-whisper" 2>&1 | tail -5

  if [ ! -f "${ASR_OUT_DIR}/transcript.txt" ]; then
    echo "ERROR: Transcription failed for $IDX"
    python3 -c "
import json
with open('${PROGRESS_FILE}') as f: d=json.load(f)
d['lectures']['${IDX}']['status'] = 'failed'
d['lectures']['${IDX}']['retries'] = int('${RETRY_COUNT}') + 1
with open('${PROGRESS_FILE}', 'w') as f: json.dump(d, f, ensure_ascii=False, indent=2)
"
    FAILED=$((FAILED+1))
    continue
  fi

  TRANSCRIPT=$(cat "${ASR_OUT_DIR}/transcript.txt")
  echo "  [transcribed] $(wc -c <<< "$TRANSCRIPT") chars"

  # Update to summarizing
  python3 -c "
import json
with open('${PROGRESS_FILE}') as f: d=json.load(f)
d['lectures']['${IDX}']['status'] = 'summarizing'
with open('${PROGRESS_FILE}', 'w') as f: json.dump(d, f, ensure_ascii=False, indent=2)
"

  # Save transcript for content-summarizer invocation
  echo "$TRANSCRIPT" > "${AUDIO_TMP_DIR}/transcript_${IDX}.txt"
  echo "$LECTURE_URL" > "${AUDIO_TMP_DIR}/meta_${IDX}_url.txt"
  echo "$SAFE_TITLE" > "${AUDIO_TMP_DIR}/meta_${IDX}_title.txt"
  echo "$IDX" > "${AUDIO_TMP_DIR}/meta_${IDX}_idx.txt"
  echo "$SAVE_PATH" > "${AUDIO_TMP_DIR}/meta_${IDX}_savepath.txt"

  echo "  [ready-for-summary] Transcript saved to ${AUDIO_TMP_DIR}/transcript_${IDX}.txt"
  echo "  SAVE_PATH: $SAVE_PATH"
  echo "  ACTION_NEEDED: Invoke content-summarizer for lecture $IDX"

  # Cleanup WAV after successful transcription
  rm -f "$WAV_FILE"
  rm -rf "$ASR_OUT_DIR"

done

echo ""
echo "=== Recording pass complete ==="
echo "Done: $DONE | Failed: $FAILED"
