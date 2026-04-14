#!/bin/bash
# Reorg helper: move flat NNN-*.md files under courses/ai-engineering-training-camp/
# and wiki/concepts/ into their module-X-* subfolders.
# Safe to run multiple times (idempotent — skips files already under a subfolder).
set -u

module_for() {
  local idx=$((10#$1))
  if   (( idx >= 1  && idx <= 5  )); then echo "livestreams"
  elif (( idx >= 6  && idx <= 15 )); then echo "module-1-ai-engineering-basics"
  elif (( idx >= 16 && idx <= 22 )); then echo "module-2-fine-tuning"
  elif (( idx >= 23 && idx <= 31 )); then echo "module-3-rag"
  elif (( idx >= 32 && idx <= 44 )); then echo "module-4-dialogue-systems"
  elif (( idx >= 45 && idx <= 54 )); then echo "module-5-multi-agent"
  elif (( idx >= 55 && idx <= 63 )); then echo "module-6-dsl-nl2sql"
  elif (( idx >= 64 && idx <= 74 )); then echo "module-7-memory-advanced"
  elif (( idx >= 75 && idx <= 80 )); then echo "module-8-deployment"
  elif (( idx >= 81 && idx <= 88 )); then echo "module-9-async-fastapi"
  elif (( idx >= 89 && idx <= 94 )); then echo "module-10-final-project"
  elif (( idx >= 95 && idx <= 99 )); then echo "module-11-production"
  fi
}

reorg_dir() {
  local src="$1" moved=0
  for f in "$src"/*.md; do
    [ -f "$f" ] || continue
    local fn=$(basename "$f")
    local idx=$(echo "$fn" | grep -oE '^[0-9]{3}' | head -1)
    [ -z "$idx" ] && continue
    local mod=$(module_for "$idx")
    [ -z "$mod" ] && { echo "NO MODULE: $fn [idx=$idx]"; continue; }
    mkdir -p "$src/$mod"
    local dest="$src/$mod/$fn"
    if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
      git mv "$f" "$dest" && moved=$((moved+1))
    else
      mv "$f" "$dest" && moved=$((moved+1))
    fi
  done
  echo "  $src: moved $moved"
}

echo "Reorganizing courses/ai-engineering-training-camp ..."
reorg_dir "courses/ai-engineering-training-camp"

echo "Reorganizing wiki/concepts (numbered files only) ..."
# Move numbered wiki files to wiki/courses/ai-engineering-training-camp/module-*/
for f in wiki/concepts/*.md; do
  [ -f "$f" ] || continue
  fn=$(basename "$f")
  idx=$(echo "$fn" | grep -oE '^[0-9]{3}' | head -1)
  [ -z "$idx" ] && continue
  mod=$(module_for "$idx")
  [ -z "$mod" ] && continue
  dest_dir="wiki/courses/ai-engineering-training-camp/$mod"
  mkdir -p "$dest_dir"
  if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
    git mv "$f" "$dest_dir/$fn"
  else
    mv "$f" "$dest_dir/$fn"
  fi
done

echo "Done."
