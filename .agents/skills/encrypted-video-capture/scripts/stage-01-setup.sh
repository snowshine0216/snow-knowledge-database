#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/paths.sh"

COURSE_URL="${1:?usage: stage-01-setup.sh <course-url>}"
SESSION_ID="${SESSION_ID:-$(date +%s)-$$}"
export SESSION_ID

[ -f "$SKILL_DIR/.env" ] && source "$SKILL_DIR/.env"

LOCK_FILE="$EVC_TMP/evc.lock"
if [ -f "$LOCK_FILE" ]; then
  STALE=$(cat "$LOCK_FILE")
  if kill -0 "$STALE" 2>/dev/null; then
    echo "ERROR: PID $STALE still running" >&2; exit 1
  fi
  rm -f "$LOCK_FILE"
fi
echo "$$" > "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT INT TERM

bash "$SKILL_DIR/scripts/preflight.sh" || exit 1

if [ -z "${BLACKHOLE_DEVICE:-}" ]; then
  BLACKHOLE_DEVICE=$(ffmpeg -f avfoundation -list_devices true -i "" 2>&1 \
    | grep -i "BlackHole" | grep -oE '\[[0-9]+\]' | grep -oE '[0-9]+' | head -1)
fi
echo "BLACKHOLE_DEVICE=$BLACKHOLE_DEVICE"

COOKIE_FILE="$EVC_TMP/cookies-${SESSION_ID}.txt"
touch "$COOKIE_FILE"; chmod 600 "$COOKIE_FILE"
yt-dlp --cookies-from-browser "${DEFAULT_BROWSER:-chrome}" --cookies "$COOKIE_FILE" \
  --skip-download "$COURSE_URL" 2>/dev/null || echo "WARN: cookie export failed (may be OK for public courses)"
echo "COOKIE_FILE=$COOKIE_FILE"
echo "SESSION_ID=$SESSION_ID"
