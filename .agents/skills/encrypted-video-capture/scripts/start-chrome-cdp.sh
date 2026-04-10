#!/usr/bin/env bash
# Start Chrome with an isolated profile and CDP on 127.0.0.1:9222.
# Safe to call multiple times — kills any existing automation Chrome first.

set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE_DIR="/tmp/evc-chrome-automation"
CDP_PORT=9222
PID_FILE="/tmp/evc-chrome-cdp.pid"

# Kill any previous automation Chrome
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  kill "$OLD_PID" 2>/dev/null || true
  rm -f "$PID_FILE"
fi
pkill -f "user-data-dir=${PROFILE_DIR}" 2>/dev/null || true
sleep 1

# Wipe the previous session state so Chrome starts with a fresh active tab
# rather than dormant restored-session tabs that block page.goto() calls.
rm -rf "${PROFILE_DIR}/Default/Sessions" "${PROFILE_DIR}/Default/Session Storage" \
       "${PROFILE_DIR}/SingletonLock" "${PROFILE_DIR}/SingletonSocket" 2>/dev/null || true

"$CHROME" \
  --remote-debugging-port=${CDP_PORT} \
  --user-data-dir="${PROFILE_DIR}" \
  --no-first-run \
  --no-default-browser-check \
  --disable-session-crashed-bubble \
  --disable-infobars \
  --restore-last-session=false \
  "about:blank" \
  >/tmp/evc-chrome-cdp.log 2>&1 &
CHROME_PID=$!
echo "$CHROME_PID" > "$PID_FILE"

echo "Chrome started (PID $CHROME_PID), waiting for CDP on 127.0.0.1:${CDP_PORT}..."
for i in $(seq 1 30); do
  if curl -s "http://127.0.0.1:${CDP_PORT}/json/version" > /dev/null 2>&1; then
    echo "Chrome CDP ready."
    exit 0
  fi
  sleep 1
done

echo "ERROR: Chrome did not expose CDP within 30s"
exit 1
