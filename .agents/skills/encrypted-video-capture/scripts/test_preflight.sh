#!/usr/bin/env bats
# test_preflight.sh — Bats tests for preflight.sh
# Run with: bats scripts/test_preflight.sh
#
# Strategy: Each test gets a fresh stub directory placed at the front of PATH.
# The controlled PATH (stubs:/usr/bin:/bin) excludes homebrew/nvm so that
# removing a stub reliably simulates "command not found".

SCRIPT_DIR="$(cd "$(dirname "$BATS_TEST_FILENAME")" && pwd)"
PREFLIGHT="$SCRIPT_DIR/preflight.sh"
LOCK_FILE="/tmp/encrypted-video-capture.lock"

# ── Global setup/teardown ─────────────────────────────────────────────────────

setup_file() {
  export OUT_DIR
  OUT_DIR="$(mktemp -d)"
}

teardown_file() {
  rm -rf "${OUT_DIR:-}"
  rm -f "$LOCK_FILE"
}

# ── Per-test setup/teardown ───────────────────────────────────────────────────

setup() {
  STUBS="$(mktemp -d)"
  _make_happy_stubs
  rm -f "$LOCK_FILE"
}

teardown() {
  rm -rf "${STUBS:-}"
}

# ── Stub helpers ──────────────────────────────────────────────────────────────

# Populate $STUBS with a full "happy path" set of stub commands.
_make_happy_stubs() {
  # ffmpeg: list_devices shows BlackHole [0]; test recording writes 2000 bytes
  cat > "$STUBS/ffmpeg" << 'EOF'
#!/usr/bin/env bash
if [[ "$*" == *"list_devices"* ]]; then
  echo "[AVFoundation indev] AVFoundation audio devices:"
  echo "[AVFoundation indev] [0] BlackHole 2ch"
  exit 0
elif [[ "$*" == *"-t 2"* ]]; then
  for arg in "$@"; do WAV_OUT="$arg"; done
  dd if=/dev/urandom bs=2000 count=1 > "$WAV_OUT" 2>/dev/null
  exit 0
fi
exit 0
EOF
  chmod +x "$STUBS/ffmpeg"

  printf '#!/usr/bin/env bash\nexit 0\n'              > "$STUBS/ffprobe"; chmod +x "$STUBS/ffprobe"
  printf '#!/usr/bin/env bash\nexit 0\n'              > "$STUBS/node";   chmod +x "$STUBS/node"
  printf '#!/usr/bin/env bash\necho "1.0.0"\nexit 0\n' > "$STUBS/npx";   chmod +x "$STUBS/npx"
}

# Run preflight with the controlled stub PATH + any extra env=value pairs.
# Sets bats $status and $output.
_run_preflight() {
  run env \
    PATH="$STUBS:/usr/bin:/bin" \
    OUTPUT_DIR="$OUT_DIR" \
    BLACKHOLE_DEVICE="" \
    "$@" \
    bash "$PREFLIGHT"
}

# ── Tests ─────────────────────────────────────────────────────────────────────

@test "happy path: exits 0 and prints success banner" {
  _run_preflight OPENROUTER_API_KEY=test-key
  [ "$status" -eq 0 ]
  [[ "$output" == *"Preflight passed"* ]]
}

@test "happy path: auto-detects BlackHole device index 0" {
  _run_preflight OPENROUTER_API_KEY=test-key
  [ "$status" -eq 0 ]
  [[ "$output" == *"BlackHole device index detected: 0"* ]]
}

@test "happy path: reports API ASR provider when only API key set" {
  _run_preflight OPENROUTER_API_KEY=test-key
  [ "$status" -eq 0 ]
  [[ "$output" == *"ASR provider: API"* ]]
}

@test "missing ffmpeg: exits 1 with actionable error" {
  rm -f "$STUBS/ffmpeg"
  _run_preflight OPENROUTER_API_KEY=test-key
  [ "$status" -eq 1 ]
  [[ "$output" == *"ffmpeg not found"* ]]
  [[ "$output" == *"FIX:"* ]]
}

@test "missing ffprobe: exits 1 with actionable error" {
  rm -f "$STUBS/ffprobe"
  _run_preflight OPENROUTER_API_KEY=test-key
  [ "$status" -eq 1 ]
  [[ "$output" == *"ffprobe not found"* ]]
  [[ "$output" == *"FIX:"* ]]
}

@test "BlackHole not found in device list: exits 1 with actionable error" {
  cat > "$STUBS/ffmpeg" << 'EOF'
#!/usr/bin/env bash
if [[ "$*" == *"list_devices"* ]]; then
  echo "[AVFoundation indev] [0] Built-in Microphone"
  exit 0
fi
for arg in "$@"; do WAV_OUT="$arg"; done
dd if=/dev/urandom bs=2000 count=1 > "$WAV_OUT" 2>/dev/null
exit 0
EOF
  chmod +x "$STUBS/ffmpeg"
  _run_preflight OPENROUTER_API_KEY=test-key
  [ "$status" -eq 1 ]
  [[ "$output" == *"BlackHole audio device not found"* ]]
  [[ "$output" == *"FIX:"* ]]
}

@test "missing node: exits 1 with actionable error" {
  rm -f "$STUBS/node"
  _run_preflight OPENROUTER_API_KEY=test-key
  [ "$status" -eq 1 ]
  [[ "$output" == *"node not found"* ]]
  [[ "$output" == *"FIX:"* ]]
}

@test "Playwright not installed: exits 1 with actionable error" {
  # node exists but require('playwright') and require('@playwright/test') both fail
  printf '#!/usr/bin/env bash\nexit 1\n' > "$STUBS/node"
  chmod +x "$STUBS/node"
  _run_preflight OPENROUTER_API_KEY=test-key
  [ "$status" -eq 1 ]
  [[ "$output" == *"Playwright not found"* ]]
  [[ "$output" == *"FIX:"* ]]
}

@test "no ASR provider (no API key, no venv): exits 1 with actionable error" {
  _run_preflight   # no OPENROUTER_API_KEY, no OPENAI_API_KEY, no venv
  [ "$status" -eq 1 ]
  [[ "$output" == *"No ASR provider available"* ]]
  [[ "$output" == *"FIX:"* ]]
}

@test "OPENAI_API_KEY also satisfies ASR requirement" {
  _run_preflight OPENAI_API_KEY=test-key
  [ "$status" -eq 0 ]
  [[ "$output" == *"ASR provider: API"* ]]
}

@test "stale lock file (dead PID): cleaned up and preflight proceeds" {
  echo "99999999" > "$LOCK_FILE"
  _run_preflight OPENROUTER_API_KEY=test-key
  [ "$status" -eq 0 ]
  [[ "$output" == *"Stale lock file found"* ]]
  [ ! -f "$LOCK_FILE" ]
}

@test "live lock file (current PID): exits 1 with error" {
  echo "$$" > "$LOCK_FILE"
  _run_preflight OPENROUTER_API_KEY=test-key
  [ "$status" -eq 1 ]
  [[ "$output" == *"Another session is running"* ]]
}

@test "test recording fails (ffmpeg exits 1): exits 1 with actionable error" {
  cat > "$STUBS/ffmpeg" << 'EOF'
#!/usr/bin/env bash
if [[ "$*" == *"list_devices"* ]]; then
  echo "[AVFoundation indev] [0] BlackHole 2ch"
  exit 0
fi
exit 1  # simulate device permission denied
EOF
  chmod +x "$STUBS/ffmpeg"
  _run_preflight OPENROUTER_API_KEY=test-key
  [ "$status" -eq 1 ]
  [[ "$output" == *"Test recording failed"* ]]
  [[ "$output" == *"FIX:"* ]]
}

@test "test recording produces empty WAV (<1000 bytes): exits 1 with actionable error" {
  cat > "$STUBS/ffmpeg" << 'EOF'
#!/usr/bin/env bash
if [[ "$*" == *"list_devices"* ]]; then
  echo "[AVFoundation indev] [0] BlackHole 2ch"
  exit 0
fi
# Write only 4 bytes — simulates silent/misconfigured audio
for arg in "$@"; do WAV_OUT="$arg"; done
printf '\x00\x00\x00\x00' > "$WAV_OUT"
exit 0
EOF
  chmod +x "$STUBS/ffmpeg"
  _run_preflight OPENROUTER_API_KEY=test-key
  [ "$status" -eq 1 ]
  [[ "$output" == *"Test recording produced an empty file"* ]]
  [[ "$output" == *"FIX:"* ]]
}

@test "output dir not writable: exits 1 with actionable error" {
  RO_DIR="$(mktemp -d)"
  chmod 555 "$RO_DIR"
  run env \
    PATH="$STUBS:/usr/bin:/bin" \
    OUTPUT_DIR="$RO_DIR" \
    BLACKHOLE_DEVICE="" \
    OPENROUTER_API_KEY=test-key \
    bash "$PREFLIGHT"
  chmod 755 "$RO_DIR"; rm -rf "$RO_DIR"
  [ "$status" -eq 1 ]
  [[ "$output" == *"not writable"* ]]
  [[ "$output" == *"FIX:"* ]]
}

@test "faster-whisper venv satisfies ASR requirement without API key" {
  SKILL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
  YT_PYTHON="$SKILL_ROOT/../../yt-video-summarizer/venv/bin/python"
  if [ ! -f "$YT_PYTHON" ] || ! "$YT_PYTHON" -c "import faster_whisper" 2>/dev/null; then
    skip "faster-whisper venv not installed in this environment"
  fi
  _run_preflight   # no API key — venv should satisfy requirement
  [ "$status" -eq 0 ]
  [[ "$output" == *"faster-whisper (local)"* ]]
}
