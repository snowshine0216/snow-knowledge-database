#!/usr/bin/env bash
# stage-03-capture.sh — capture audio for a single lecture (yt-dlp or BlackHole)
# Usage: stage-03-capture.sh <idx> <course_name>
# Exit codes: 0 = success, 2 = both yt-dlp and BlackHole failed
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/paths.sh"
source "$SCRIPT_DIR/lib/progress.sh"

IDX="${1:?usage: stage-03-capture.sh <idx> <course_name>}"
COURSE_NAME="${2:?usage: stage-03-capture.sh <idx> <course_name>}"
PROGRESS_FILE="${OUTPUT_DIR:-courses}/${COURSE_NAME}/.progress.json"
AUDIO_DIR="$EVC_TMP/audio/${COURSE_NAME}"
mkdir -p "$AUDIO_DIR/asr_${IDX}"

# Extract lecture info from progress.json
LESSON=$(jq -r ".lectures[\"$IDX\"]" "$PROGRESS_FILE")
URL=$(echo "$LESSON" | jq -r '.url')
LECTURE_DURATION=$(echo "$LESSON" | jq -r '.duration // 0')

# Cookie file path (set by stage-01 or environment)
COOKIE_FILE="${COOKIE_FILE:-$EVC_TMP/cookies.json}"

# Session ID for ffmpeg/video-ended markers
SESSION_ID="${SESSION_ID:-evc-$$}"

# Mark as recording
mark_status "$IDX" "recording" "$PROGRESS_FILE"

# ---------------------------------------------------------------------------
# §7c. yt-dlp Probe (Direct Download Attempt)
# ---------------------------------------------------------------------------
YTDLP_AUDIO=""
if timeout 15s yt-dlp --simulate --cookies "$COOKIE_FILE" "$URL" 2>/dev/null; then
  # Direct download available — use it instead of BlackHole
  YTDLP_AUDIO="${AUDIO_DIR}/tmp_${IDX}.m4a"
  if yt-dlp --cookies "$COOKIE_FILE" -x --audio-format m4a \
      -o "$YTDLP_AUDIO" "$URL" 2>/dev/null; then
    echo "INFO: yt-dlp direct download succeeded for lecture $IDX."
  else
    echo "WARN: yt-dlp download failed despite successful probe — falling back to BlackHole."
    YTDLP_AUDIO=""
  fi
fi

# ---------------------------------------------------------------------------
# §7d. BlackHole Recording (if yt-dlp probe failed)
# ---------------------------------------------------------------------------
if [ -z "$YTDLP_AUDIO" ]; then
  BLACKHOLE_DEVICE="${BLACKHOLE_DEVICE:-BlackHole 2ch}"
  PLAYBACK_SPEED="${PLAYBACK_SPEED:-2.0}"

  # Wall-clock timeout = real duration / speed (min 60s if duration unknown)
  if [ "${LECTURE_DURATION:-0}" -gt 0 ]; then
    WALL_TIMEOUT=$(echo "$LECTURE_DURATION $PLAYBACK_SPEED" | awk '{t=int($1/$2); print (t<60)?60:t}')
  else
    WALL_TIMEOUT=5400
  fi

  WAV_FILE="${AUDIO_DIR}/tmp_${IDX}.wav"

  # Start recording in background
  bash "$SCRIPT_DIR/record-audio.sh" \
    "$BLACKHOLE_DEVICE" "$WAV_FILE" "$SESSION_ID" &
  RECORD_PID=$!

  # Wait for the ffmpeg ready signal (max 15s)
  READY_FILE="$EVC_TMP/ffmpeg-ready-${SESSION_ID}"
  WAIT=0
  until [ -f "$READY_FILE" ] || [ $WAIT -ge 15 ]; do sleep 1; WAIT=$((WAIT+1)); done
  if [ ! -f "$READY_FILE" ]; then
    echo "ERROR: ffmpeg did not start recording within 15s. CAUSE: BlackHole device index wrong or ffmpeg crash. FIX: Verify BLACKHOLE_DEVICE index with: ffmpeg -f avfoundation -list_devices true -i \"\""
    kill $RECORD_PID 2>/dev/null
    exit 2
  fi

  # §7d.1. Start Streaming ASR (background)
  TRANSCRIPT_LOG="$EVC_TMP/transcript-${SESSION_ID}.jsonl"
  node "$SCRIPT_DIR/streaming-asr.mjs" \
    --wav "$WAV_FILE" \
    --session-id "$SESSION_ID" &
  ASR_STREAM_PID=$!

  # Start Playwright — navigate to lecture and click play
  ADJUSTED_DURATION=$(echo "${LECTURE_DURATION:-0} $PLAYBACK_SPEED" | awk '{print int($1/$2)}')
  PLAYBACK_SPEED="$PLAYBACK_SPEED" node "$SCRIPT_DIR/../playwright/runner.mjs" \
    --action play \
    --url "$URL" \
    --cookies "$COOKIE_FILE" \
    --session-id "$SESSION_ID" \
    --duration "$ADJUSTED_DURATION"

  # Wait for video-ended marker (poll 1s; max WALL_TIMEOUT)
  ENDED_FILE="$EVC_TMP/video-ended-${SESSION_ID}"
  ELAPSED=0
  until [ -f "$ENDED_FILE" ] || [ $ELAPSED -ge "$WALL_TIMEOUT" ]; do
    sleep 1; ELAPSED=$((ELAPSED+1))
  done

  # Stop recording (3s buffer after video ends, then SIGINT)
  sleep 3
  kill -INT $RECORD_PID 2>/dev/null
  wait $RECORD_PID 2>/dev/null
  kill "$ASR_STREAM_PID" 2>/dev/null
  wait "$ASR_STREAM_PID" 2>/dev/null
  rm -f "$READY_FILE" "$ENDED_FILE"

  AUDIO_FILE="$WAV_FILE"

  # Verify we got audio
  if [ ! -f "$AUDIO_FILE" ] || [ ! -s "$AUDIO_FILE" ]; then
    echo "ERROR: BlackHole recording produced no audio for lecture $IDX."
    exit 2
  fi
else
  AUDIO_FILE="$YTDLP_AUDIO"
  TRANSCRIPT_LOG=""
fi

# ---------------------------------------------------------------------------
# §7e. Silence Detection
# ---------------------------------------------------------------------------
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

# ---------------------------------------------------------------------------
# §7f. ASR Transcription
# ---------------------------------------------------------------------------
mark_status "$IDX" "transcribing" "$PROGRESS_FILE"

ASR_OUT_DIR="$AUDIO_DIR/asr_${IDX}"

# Check streaming ASR coverage before falling back to batch
STREAMING_TRANSCRIPT=""
if [ -n "$TRANSCRIPT_LOG" ] && [ -f "$TRANSCRIPT_LOG" ]; then
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

# If streaming coverage < 80%, fall back to batch ASR via OpenRouter
if [ -z "$STREAMING_TRANSCRIPT" ]; then
  python3 "$SCRIPT_DIR/../../yt-video-summarizer/scripts/extract_video_context.py" \
    --audio-file "$AUDIO_FILE" \
    --out-dir "$ASR_OUT_DIR" \
    --asr-provider "${ASR_PROVIDER:-openai}"
  if [ $? -ne 0 ]; then
    echo "ERROR: ASR transcription failed for lecture $IDX. CAUSE: faster-whisper venv missing or OPENROUTER_API_KEY not set. FIX: Set OPENROUTER_API_KEY in .env (mirrors yt-video-summarizer OpenRouter setup)."
    mark_status "$IDX" "failed" "$PROGRESS_FILE"
    increment_retry "$IDX" "$PROGRESS_FILE"
    exit 2
  fi
else
  # Write streaming transcript to the expected output path
  printf '%s' "$STREAMING_TRANSCRIPT" > "$ASR_OUT_DIR/transcript.txt"
fi

rm -f "$TRANSCRIPT_LOG"

mark_status "$IDX" "transcribed" "$PROGRESS_FILE"
echo "INFO: Lecture $IDX capture + transcription complete → $ASR_OUT_DIR/transcript.txt"
exit 0
