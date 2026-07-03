#!/usr/bin/env bash
# fetch-wechat.sh — resolve a Node >= 18 and run the Playwright WeChat fetcher.
# Usage: scripts/fetch-wechat.sh <wechat_url> [out_dir]
# Env:   WECHAT_HEADFUL=1  -> visible window for manual CAPTCHA/login solving
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
URL="${1:?usage: fetch-wechat.sh <wechat_url> [out_dir]}"
OUT="${2:-/tmp/wechat-article-summarizer}"

major() { "$1" -e 'process.stdout.write(String(process.versions.node.split(".")[0]))' 2>/dev/null || echo 0; }

# Find a Node >= 18: prefer PATH node, else newest nvm-installed node.
NODE_BIN=""
if command -v node >/dev/null 2>&1 && [ "$(major node)" -ge 18 ]; then
  NODE_BIN="$(command -v node)"
else
  for d in $(ls -1d "$HOME"/.nvm/versions/node/v* 2>/dev/null | sort -V -r); do
    if [ -x "$d/bin/node" ] && [ "$(major "$d/bin/node")" -ge 18 ]; then
      NODE_BIN="$d/bin/node"; break
    fi
  done
fi

if [ -z "$NODE_BIN" ]; then
  echo "ERROR: no Node.js >= 18 found (Playwright requires it). Install one via nvm." >&2
  exit 1
fi

if [ ! -d "$SKILL_DIR/node_modules/playwright" ]; then
  echo "ERROR: playwright not installed. Run: (cd \"$SKILL_DIR\" && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install)" >&2
  exit 1
fi

cd "$SKILL_DIR"
exec "$NODE_BIN" scripts/fetch-wechat.mjs "$URL" "$OUT"
