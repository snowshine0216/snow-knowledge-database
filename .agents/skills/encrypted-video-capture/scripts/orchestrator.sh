#!/usr/bin/env bash
# orchestrator.sh — drive encrypted-video-capture pipeline
# Usage: orchestrator.sh <course-url> [--dry-run] [--resume]
# Emits writeup-dispatch JSON envelopes on stdout for the caller (Claude session) to invoke Agent tool.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/paths.sh"

COURSE_URL="${1:?usage: orchestrator.sh <url> [--dry-run] [--resume]}"
shift
DRY_RUN=false; RESUME=false
for arg; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --resume)  RESUME=true ;;
    *) echo "ERROR: unknown arg: $arg" >&2; exit 1 ;;
  esac
done

# Stage 00: validate
ADAPTER=$(bash "$SCRIPT_DIR/stage-00-validate.sh" "$COURSE_URL")

# Stage 01: setup (exports SESSION_ID, COOKIE_FILE, BLACKHOLE_DEVICE)
eval "$(bash "$SCRIPT_DIR/stage-01-setup.sh" "$COURSE_URL" | grep -E '^(SESSION_ID|COOKIE_FILE|BLACKHOLE_DEVICE)=')"
export SESSION_ID COOKIE_FILE BLACKHOLE_DEVICE

# Stage 02: enumerate
eval "$(bash "$SCRIPT_DIR/stage-02-enumerate.sh" "$COURSE_URL" "$COOKIE_FILE" | grep -E '^(COURSE_NAME|LECTURES_ENUMERATED)=')"
export COURSE_NAME
PROGRESS_FILE="${OUTPUT_DIR:-courses}/${COURSE_NAME}/.progress.json"

if $DRY_RUN; then
  echo "Dry-run complete. $LECTURES_ENUMERATED lectures enumerated to $PROGRESS_FILE."
  exit 0
fi

# Stage 03 + 04 per lecture
for IDX in $(jq -r '.lectures | keys[]' "$PROGRESS_FILE" | sort); do
  STATUS=$(jq -r ".lectures[\"$IDX\"].status" "$PROGRESS_FILE")
  if $RESUME && [ "$STATUS" = "done" ]; then
    echo "  [skip] $IDX done"
    continue
  fi

  bash "$SCRIPT_DIR/stage-03-capture.sh" "$IDX" "$COURSE_NAME" || {
    echo "  [fail] $IDX capture failed"
    continue
  }

  # Emit writeup envelope — orchestrator caller invokes Agent tool + waits
  echo "DISPATCH_WRITEUP $IDX"
  bash "$SCRIPT_DIR/stage-04-prepare-writeup.sh" "$IDX" "$COURSE_NAME"
  echo "END_DISPATCH_WRITEUP $IDX"
done

# Stage 05: finalize
bash "$SCRIPT_DIR/stage-05-finalize.sh" "$COURSE_NAME"
echo "Course complete: $COURSE_NAME"
