#!/usr/bin/env bash
# preflight.sh — Verify all dependencies for encrypted-video-capture.
# Exits 0 on success; exits 1 with an actionable error message on any failure.
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ── 1. Lock file (stale PID check) ──────────────────────────────────────────
LOCK_FILE="/tmp/encrypted-video-capture.lock"
if [ -f "$LOCK_FILE" ]; then
  STALE_PID="$(cat "$LOCK_FILE")"
  if kill -0 "$STALE_PID" 2>/dev/null; then
    echo "ERROR: Another session is running (PID $STALE_PID). CAUSE: Lock file exists with live PID. FIX: Wait for it to finish or run: kill $STALE_PID && rm $LOCK_FILE"
    exit 1
  fi
  echo "INFO: Stale lock file found (PID $STALE_PID no longer running). Cleaning up."
  rm -f "$LOCK_FILE"
fi

# ── 2. ffmpeg / ffprobe ──────────────────────────────────────────────────────
if ! command -v ffmpeg &>/dev/null; then
  echo "ERROR: ffmpeg not found. CAUSE: ffmpeg is not installed. FIX: brew install ffmpeg"
  exit 1
fi
if ! command -v ffprobe &>/dev/null; then
  echo "ERROR: ffprobe not found. CAUSE: ffprobe is not installed (comes with ffmpeg). FIX: brew install ffmpeg"
  exit 1
fi

# ── 3. BlackHole 2ch presence ────────────────────────────────────────────────
DEVICE_LIST=$(ffmpeg -f avfoundation -list_devices true -i "" 2>&1 || true)
if ! echo "$DEVICE_LIST" | grep -qi "BlackHole"; then
  echo "ERROR: BlackHole audio device not found. CAUSE: BlackHole 2ch not installed or Audio MIDI multi-output device not configured. FIX: Follow references/setup-guide.md sections 1–3."
  exit 1
fi

# Auto-detect BlackHole device index
BLACKHOLE_IDX=$(echo "$DEVICE_LIST" | grep -i "BlackHole" | grep -oE '\[[0-9]+\]' | grep -oE '[0-9]+' | head -1)
if [ -z "$BLACKHOLE_IDX" ]; then
  echo "ERROR: Could not parse BlackHole device index from ffmpeg output. CAUSE: Unexpected ffmpeg output format. FIX: Run 'ffmpeg -f avfoundation -list_devices true -i \"\"' and set BLACKHOLE_DEVICE manually in .env."
  exit 1
fi
echo "INFO: BlackHole device index detected: $BLACKHOLE_IDX"

# ── 4. Playwright + Chromium ─────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "ERROR: node not found. CAUSE: Node.js is not installed. FIX: brew install node"
  exit 1
fi

# Check Playwright CLI is available and Chromium is installed
if ! npx playwright --version &>/dev/null; then
  echo "ERROR: Playwright not found. CAUSE: @playwright/test or playwright npm package not installed. FIX: npm install -g playwright && npx playwright install chromium"
  exit 1
fi

# ── 5. ASR provider ──────────────────────────────────────────────────────────
HAS_FW=false
# Check faster-whisper in: skill-local venv, project .venv, or system python3
for CANDIDATE_PYTHON in \
  "${SKILL_DIR}/../yt-video-summarizer/venv/bin/python" \
  "${SKILL_DIR}/../../.venv/bin/python" \
  "$(command -v python3 2>/dev/null)" \
  "$(command -v python 2>/dev/null)"; do
  if [ -n "$CANDIDATE_PYTHON" ] && [ -f "$CANDIDATE_PYTHON" ] && \
     "$CANDIDATE_PYTHON" -c "import faster_whisper" 2>/dev/null; then
    HAS_FW=true
    FASTER_WHISPER_PYTHON="$CANDIDATE_PYTHON"
    break
  fi
done

HAS_OR=false
if [ -n "${OPENROUTER_API_KEY:-}" ] || [ -n "${OPENAI_API_KEY:-}" ]; then
  HAS_OR=true
fi

if [ "$HAS_FW" = "false" ] && [ "$HAS_OR" = "false" ]; then
  echo "ERROR: No ASR provider available. CAUSE: faster-whisper venv not found and no API key set. FIX: Either activate the faster-whisper venv (see yt-video-summarizer setup) or set OPENROUTER_API_KEY in .env."
  exit 1
fi

if [ "$HAS_FW" = "true" ]; then
  echo "INFO: ASR provider: faster-whisper (local)"
else
  echo "INFO: ASR provider: API (OpenRouter/OpenAI)"
fi

# ── 6. Disk space ≥ 5 GB ─────────────────────────────────────────────────────
OUTPUT_DIR="${OUTPUT_DIR:-courses}"
mkdir -p "$OUTPUT_DIR" 2>/dev/null || true
AVAILABLE_KB=$(df -k "$OUTPUT_DIR" 2>/dev/null | awk 'NR==2 {print $4}')
REQUIRED_KB=$((5 * 1024 * 1024))  # 5 GB in KB
if [ -n "$AVAILABLE_KB" ] && [ "$AVAILABLE_KB" -lt "$REQUIRED_KB" ]; then
  AVAILABLE_GB=$(echo "$AVAILABLE_KB" | awk '{printf "%.1f", $1/1024/1024}')
  echo "ERROR: Insufficient disk space (${AVAILABLE_GB} GB available, 5 GB required). CAUSE: Output directory on a nearly-full volume. FIX: Free up disk space or set OUTPUT_DIR to a volume with more space."
  exit 1
fi

# ── 7. Output dir writable ───────────────────────────────────────────────────
if ! touch "${OUTPUT_DIR}/.preflight_write_test" 2>/dev/null; then
  echo "ERROR: Output directory '${OUTPUT_DIR}' is not writable. CAUSE: Permission denied. FIX: Check directory permissions or set OUTPUT_DIR to a writable path."
  exit 1
fi
rm -f "${OUTPUT_DIR}/.preflight_write_test"

# ── 8. 2-second test recording ───────────────────────────────────────────────
echo "INFO: Running 2-second test recording to verify BlackHole capture..."
TEST_WAV="/tmp/evc-preflight-test-$$.wav"
if ! ffmpeg -loglevel error \
     -f avfoundation -i ":${BLACKHOLE_DEVICE:-$BLACKHOLE_IDX}" \
     -c:a pcm_s16le -t 2 "$TEST_WAV" 2>/dev/null; then
  rm -f "$TEST_WAV"
  echo "ERROR: Test recording failed. CAUSE: ffmpeg could not open BlackHole device :${BLACKHOLE_DEVICE:-$BLACKHOLE_IDX}. FIX: Check macOS microphone permission for Terminal/Claude Code in System Settings → Privacy & Security → Microphone."
  exit 1
fi

# Verify WAV is non-empty (>1000 bytes means real audio data)
WAV_SIZE=$(wc -c < "$TEST_WAV" 2>/dev/null || echo 0)
rm -f "$TEST_WAV"
if [ "$WAV_SIZE" -lt 1000 ]; then
  echo "ERROR: Test recording produced an empty file. CAUSE: BlackHole not receiving audio — is system output set to Multi-Output Device? FIX: System Settings → Sound → Output → select 'Multi-Output Device', then re-run."
  exit 1
fi

echo ""
echo "✓ Preflight passed."
echo "  BlackHole device: :${BLACKHOLE_DEVICE:-$BLACKHOLE_IDX}"
echo "  ASR provider ready"
echo "  Disk space OK"
echo "  2-second test recording: OK (${WAV_SIZE} bytes)"
echo ""
echo "You're ready to capture. Run: /encrypted-video-capture <course-url>"
