#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/paths.sh"
source "$SCRIPT_DIR/lib/progress.sh"
source "$SCRIPT_DIR/lib/subagent.sh"

IDX="${1:?usage: stage-04-prepare-writeup.sh <idx> <course_name>}"
COURSE_NAME="${2:?usage: ... <course_name>}"
PROGRESS_FILE="${OUTPUT_DIR:-courses}/${COURSE_NAME}/.progress.json"

mark_status "$IDX" "summarizing" "$PROGRESS_FILE"

LESSON=$(jq -r ".lectures[\"$IDX\"]" "$PROGRESS_FILE")
TITLE=$(echo "$LESSON" | jq -r '.title')
URL=$(echo "$LESSON" | jq -r '.url')
SLUG=$(echo "$TITLE" | python3 -c "import sys,re; t=sys.stdin.read().strip().lower(); print(re.sub(r'[^a-z0-9]+','-',t).strip('-')[:80])")
TX_ORIG="$EVC_TMP/audio/${COURSE_NAME}/asr_${IDX}/transcript.txt"

# Chinese conversion if applicable
TX="$TX_ORIG"
SIMPLIFIED=false
if head -c 4000 "$TX_ORIG" | python3 -c "import sys,re; sys.exit(0 if re.search(r'[\u4e00-\u9fff]', sys.stdin.read()) else 1)"; then
  if command -v opencc >/dev/null 2>&1; then
    CONV="$EVC_TMP/audio/${COURSE_NAME}/asr_${IDX}/transcript-simplified.txt"
    opencc -c t2s -i "$TX_ORIG" -o "$CONV"
    TX="$CONV"
  else
    SIMPLIFIED=true
  fi
fi

# Resolve module subfolder from progress.md
PROGRESS_MD="${OUTPUT_DIR:-courses}/${COURSE_NAME}/progress.md"
MODULE_SLUG=$(resolve_module_slug "$IDX" "$PROGRESS_MD")
if [ -n "$MODULE_SLUG" ]; then
  MODULE_PREFIX="${MODULE_SLUG}/"
  mkdir -p "${OUTPUT_DIR:-courses}/${COURSE_NAME}/${MODULE_SLUG}"
  mkdir -p "wiki/courses/${COURSE_NAME}/${MODULE_SLUG}"
else
  MODULE_PREFIX=""
fi

P1="${OUTPUT_DIR:-courses}/${COURSE_NAME}/${MODULE_PREFIX}${IDX}-${SLUG}.md"
P2="wiki/courses/${COURSE_NAME}/${MODULE_PREFIX}${IDX}-${SLUG}.md"

emit_writeup_envelope "$IDX" "$TITLE" "$URL" "$TX" "$COURSE_NAME" "$P1" "$P2" "$SIMPLIFIED"
