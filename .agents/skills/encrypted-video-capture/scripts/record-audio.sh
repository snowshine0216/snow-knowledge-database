#!/usr/bin/env bash
# record-audio.sh — Record system audio via BlackHole into a WAV file.
#
# Usage: record-audio.sh <blackhole-device-idx> <output-wav> <session-id>
#
# Writes /tmp/evc-ffmpeg-ready-<session-id> after the first audio frame is
# captured, signalling the orchestrator that it's safe to start playback.
# Writes /tmp/evc-ffmpeg-<session-id>.pid with the ffmpeg PID.
# On SIGINT: flushes ffmpeg buffers, exits cleanly, removes PID file.

set -euo pipefail

DEVICE_IDX="${1:?Usage: record-audio.sh <device-idx> <output-wav> <session-id>}"
OUTPUT_WAV="${2:?}"
SESSION_ID="${3:?}"

READY_FILE="/tmp/evc-ffmpeg-ready-${SESSION_ID}"
PID_FILE="/tmp/evc-ffmpeg-${SESSION_ID}.pid"

cleanup() {
  rm -f "$PID_FILE"
}
trap cleanup EXIT

# Start ffmpeg. We use a pipe to detect the first audio frame.
# The "-progress pipe:2" flag emits progress events to stderr once
# recording begins. We watch for "out_time" which appears after the first chunk.
ffmpeg \
  -loglevel warning \
  -f avfoundation \
  -i ":${DEVICE_IDX}" \
  -c:a pcm_s16le \
  -ar 16000 \
  -ac 1 \
  -progress pipe:2 \
  "$OUTPUT_WAV" \
  2> >(
    while IFS= read -r line; do
      # Write ready signal on first progress event (first audio frame committed)
      if [[ "$line" == out_time=* ]] && [ ! -f "$READY_FILE" ]; then
        touch "$READY_FILE"
      fi
    done
  ) &

FFMPEG_PID=$!
echo "$FFMPEG_PID" > "$PID_FILE"

# Wait for ffmpeg; it exits on SIGINT (sent by orchestrator after video ends)
wait "$FFMPEG_PID" || true
