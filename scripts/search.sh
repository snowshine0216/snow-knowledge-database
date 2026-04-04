#!/usr/bin/env bash
# Usage: ./scripts/search.sh "query terms"
# Searches wiki/ and raw/ directories, returns file paths + matching lines
# Env: RESULTS_PER_FILE=20  (lines of context per file, default 20)
#      MAX_FILES=50          (max files to show results for, default 50)
# Exit codes: 0 = success (including no matches), 1 = usage error
set -euo pipefail

QUERY="${1:-}"
if [ -z "$QUERY" ]; then echo "Usage: $0 'query terms'" >&2 && exit 1; fi

# Warn but continue if wiki/ doesn't exist yet
if [ ! -d "wiki/" ]; then
  echo "NOTE: wiki/ directory not found — run setup first" >&2
fi

echo "=== Index matches ==="
if [ -f "wiki/_index.md" ]; then
  if command -v rg >/dev/null 2>&1; then
    rg -i "$QUERY" wiki/_index.md --color never 2>/dev/null || true
  else
    grep -i "$QUERY" wiki/_index.md 2>/dev/null || true
  fi
fi

echo ""
echo "=== Content matches ==="
# Use rg (correct flag: -g glob, not --include); fall back to find+grep for macOS BSD grep
if command -v rg >/dev/null 2>&1; then
  rg -i -l "$QUERY" wiki/ raw/ -g '*.md' --color never 2>/dev/null || true
else
  # macOS BSD grep does not support --include; use find + xargs instead
  find wiki/ raw/ -name "*.md" -type f -print0 2>/dev/null | xargs -0 grep -l -i "$QUERY" 2>/dev/null || true
fi | head -"${MAX_FILES:-50}" | while IFS= read -r f; do
  echo "FILE: $f"
  if command -v rg >/dev/null 2>&1; then
    rg -i -C 2 "$QUERY" "$f" --color never 2>/dev/null | head -"${RESULTS_PER_FILE:-20}"
  else
    grep -i -A 2 "$QUERY" "$f" 2>/dev/null | head -"${RESULTS_PER_FILE:-20}"
  fi
  echo "---"
done
# Always exits 0 — no matches is a clean result, not an error
