#!/usr/bin/env bash
# Record and transcribe a single lecture for AI Engineering Training Camp
# Usage: bash record-one.sh <IDX> <URL> <DURATION_SEC> <SAFE_TITLE>
# Outputs transcript to /tmp/evc-audio/class-818/transcript_<IDX>.txt

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

IDX="$1"
LECTURE_URL="$2"
LECTURE_DURATION="${3:-0}"
SAFE_TITLE="${4:-lecture-${IDX}}"

SKILL_DIR=".claude/skills/encrypted-video-capture"
SESSION_ID="$(date +%s)-$$"
COOKIE_FILE="/tmp/evc-cookies-${SESSION_ID}.txt"
BLACKHOLE_DEVICE=0
PLAYBACK_SPEED="${PLAYBACK_SPEED:-1.5}"
source "${SKILL_DIR}/.env" 2>/dev/null || true

AUDIO_TMP_DIR="/tmp/evc-audio/class-818"
mkdir -p "$AUDIO_TMP_DIR"
WAV_FILE="${AUDIO_TMP_DIR}/tmp_${IDX}.wav"
ASR_OUT_DIR="${AUDIO_TMP_DIR}/asr_${IDX}"

cleanup() {
  rm -f "$COOKIE_FILE"
  rm -f "/tmp/evc-ffmpeg-ready-${SESSION_ID}"
  rm -f "/tmp/evc-video-ended-${SESSION_ID}"
}
trap cleanup EXIT INT TERM

# Export cookies
touch "$COOKIE_FILE" && chmod 600 "$COOKIE_FILE"
yt-dlp --cookies-from-browser chrome --cookies "$COOKIE_FILE" "https://u.geekbang.org" 2>/dev/null || true
echo "INFO: Cookies exported"

# Wall timeout
WALL_TIMEOUT=5400
if [ "${LECTURE_DURATION}" -gt 0 ]; then
  WALL_TIMEOUT=$(echo "$LECTURE_DURATION $PLAYBACK_SPEED" | awk '{t=int($1/$2)+180; print (t<180)?180:t}')
fi
echo "INFO: Wall timeout: ${WALL_TIMEOUT}s for duration=${LECTURE_DURATION}s at ${PLAYBACK_SPEED}x"

# Start recording
READY_FILE="/tmp/evc-ffmpeg-ready-${SESSION_ID}"
ENDED_FILE="/tmp/evc-video-ended-${SESSION_ID}"
rm -f "$READY_FILE" "$ENDED_FILE" "$WAV_FILE"

bash "${SKILL_DIR}/scripts/record-audio.sh" "$BLACKHOLE_DEVICE" "$WAV_FILE" "$SESSION_ID" &
RECORD_PID=$!

# Wait for ffmpeg ready (max 15s)
WAIT=0
until [ -f "$READY_FILE" ] || [ $WAIT -ge 15 ]; do sleep 1; WAIT=$((WAIT+1)); done
if [ ! -f "$READY_FILE" ]; then
  echo "ERROR: ffmpeg not ready within 15s"
  kill $RECORD_PID 2>/dev/null
  exit 1
fi
echo "INFO: Recording started (PID $RECORD_PID)"

# Start Playwright playback
ADJUSTED_DURATION=$(echo "${LECTURE_DURATION} $PLAYBACK_SPEED" | awk '{print int($1/$2)}')
echo "INFO: Launching Playwright (adjusted duration: ${ADJUSTED_DURATION}s)..."
PLAYBACK_SPEED="$PLAYBACK_SPEED" node "${SKILL_DIR}/playwright/runner.mjs" \
  --action play \
  --url "$LECTURE_URL" \
  --cookies "$COOKIE_FILE" \
  --session-id "$SESSION_ID" \
  --duration "$ADJUSTED_DURATION" 2>&1 | grep -E "(INFO|WARN|ERROR|ended)" || true

# Wait for video end
ELAPSED=0
until [ -f "$ENDED_FILE" ] || [ $ELAPSED -ge "$WALL_TIMEOUT" ]; do
  sleep 5; ELAPSED=$((ELAPSED+5))
  echo "  ... waiting for video end (${ELAPSED}/${WALL_TIMEOUT}s)"
done

if [ -f "$ENDED_FILE" ]; then
  echo "INFO: Video ended signal received at ${ELAPSED}s"
else
  echo "WARN: Wall timeout reached at ${ELAPSED}s"
fi

sleep 3
kill -INT $RECORD_PID 2>/dev/null
wait $RECORD_PID 2>/dev/null
rm -f "$READY_FILE" "$ENDED_FILE"

# Verify recording
if [ ! -f "$WAV_FILE" ] || [ ! -s "$WAV_FILE" ]; then
  echo "ERROR: WAV file missing or empty: $WAV_FILE"
  exit 1
fi
WAV_SIZE=$(wc -c < "$WAV_FILE" | tr -d ' ')
WAV_DURATION=$(ffprobe -v quiet -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$WAV_FILE" 2>/dev/null || echo "?")
echo "INFO: WAV recorded: ${WAV_SIZE} bytes, duration=${WAV_DURATION}s"

# Silence check
SILENCE_RATIO=$(ffmpeg -i "$WAV_FILE" -af silencedetect=noise=-35dB:d=2 \
  -f null - 2>&1 | awk '/silence_duration/ {sum+=$NF} END {print sum+0}')
if [ -n "$WAV_DURATION" ] && [ "$WAV_DURATION" != "?" ]; then
  OVER=$(echo "$SILENCE_RATIO $WAV_DURATION" | awk '{if($2>0 && ($1/$2)>0.80) print "yes"; else print "no"}')
  if [ "$OVER" = "yes" ]; then
    echo "WARNING: Audio is >80% silence. Check System Settings → Sound → Output → Multi-Output Device"
  fi
fi

# ASR transcription
rm -rf "$ASR_OUT_DIR" && mkdir -p "$ASR_OUT_DIR"
echo "INFO: Starting ASR transcription..."
python3 "${SKILL_DIR}/../../yt-video-summarizer/scripts/extract_video_context.py" \
  --audio-file "$WAV_FILE" \
  --out-dir "$ASR_OUT_DIR" \
  --asr-provider "faster-whisper" 2>&1

if [ ! -f "${ASR_OUT_DIR}/transcript.txt" ]; then
  echo "ERROR: Transcription failed - no transcript.txt"
  exit 1
fi

TRANSCRIPT_CHARS=$(wc -c < "${ASR_OUT_DIR}/transcript.txt" | tr -d ' ')
echo "INFO: Transcription complete: ${TRANSCRIPT_CHARS} chars"

# Copy transcript to session location
cp "${ASR_OUT_DIR}/transcript.txt" "${AUDIO_TMP_DIR}/transcript_${IDX}.txt"
rm -f "$WAV_FILE"
rm -rf "$ASR_OUT_DIR"

echo "SUCCESS: Transcript ready at ${AUDIO_TMP_DIR}/transcript_${IDX}.txt"
