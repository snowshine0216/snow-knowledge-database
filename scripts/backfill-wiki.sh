#!/usr/bin/env bash
# Usage: scripts/backfill-wiki.sh
#
# Scans content directories for .md files that have not yet been compiled to wiki/.
# For each uncompiled file, prints its path and a recommended wiki category.
# At the end, prints a Claude Code instruction for batch compilation.
#
# A file is considered "already compiled" if:
#   1. Its frontmatter contains a `wiki:` field (not "wiki: failed"), OR
#   2. Its source URL is found in an existing wiki file's frontmatter
#      (via grep -rl -F -- "<url>" wiki/)
#
# Output format:
#   Uncompiled files:
#   1. courses/some-file.md  [category: concepts]
#   2. sources/article_abc12345.md  [category: concepts]
#   ...
#
#   Run in Claude Code:
#   For each file listed above, read the file and use the content-summarizer
#   post-hook to compile a wiki article. The post-hook will handle collision
#   detection automatically.
#
# SCAN_DIRS env var: space-separated list of directories to scan.
# Default: the 6 topic folders + courses + sources (raw/intake trees)
set -uo pipefail

SCAN_DIRS="${SCAN_DIRS:-claude agent-frameworks ai-engineering rag-and-knowledge dev-tools learning-and-business courses sources}"

# --- Category mapping by directory ---
# After the flat reorg, topic folder name == wiki category name.
# courses/ and sources/ are intake/staging trees without a topic split, so
# default them to ai-engineering; the human can override per-file.
dir_to_category() {
  local dir="$1"
  case "$dir" in
    claude|agent-frameworks|ai-engineering|rag-and-knowledge|dev-tools|learning-and-business)
      echo "$dir" ;;
    courses|sources)
      echo "ai-engineering" ;;
    *)
      echo "ai-engineering" ;;
  esac
}

# --- Check if a file is already compiled ---
is_compiled() {
  local file="$1"

  # Check 1: wiki: field in frontmatter (any value except "failed")
  wiki_field=$(grep -m1 '^wiki:' "$file" 2>/dev/null || true)
  if [ -n "$wiki_field" ]; then
    # wiki: failed means it attempted but failed — treat as uncompiled
    if echo "$wiki_field" | grep -qF 'wiki: failed'; then
      return 1  # not compiled
    fi
    return 0  # compiled
  fi

  # Check 2: source URL found in existing wiki file frontmatter
  if [ -d "wiki" ]; then
    source_url=$(grep -m1 '^source:' "$file" 2>/dev/null | sed 's/^source:[[:space:]]*//' | tr -d '"' || true)
    if [ -n "$source_url" ] && [ "$source_url" != "internal" ]; then
      match=$(grep -rl -F -- "$source_url" wiki/ 2>/dev/null | grep '\.md$' | head -1)
      if [ -n "$match" ]; then
        return 0  # compiled
      fi
    fi
  fi

  return 1  # not compiled
}

# --- Main scan ---
uncompiled=()
uncompiled_categories=()

for dir in $SCAN_DIRS; do
  if [ ! -d "$dir" ]; then
    echo "WARNING: scan directory '$dir' not found — skipping" >&2
    continue
  fi
  while IFS= read -r -d '' file; do
    # Must have both tags: and source: in frontmatter (valid summarized file)
    grep -q '^tags:' "$file" 2>/dev/null || continue
    grep -q '^source:' "$file" 2>/dev/null || continue

    if ! is_compiled "$file"; then
      top_dir=$(echo "$file" | cut -d'/' -f1)
      category=$(dir_to_category "$top_dir")
      uncompiled+=("$file")
      uncompiled_categories+=("$category")
    fi
  done < <(find "$dir" -maxdepth 3 -name '*.md' -print0 2>/dev/null)
done

# --- Output ---
total="${#uncompiled[@]}"

if [ "$total" -eq 0 ]; then
  echo "All files are compiled. wiki/ is up to date."
  exit 0
fi

echo "Uncompiled files ($total found):"
echo ""
for i in "${!uncompiled[@]}"; do
  echo "  $((i+1)). ${uncompiled[$i]}  [category: ${uncompiled_categories[$i]}]"
done

echo ""
echo "Run in Claude Code:"
echo "  For each file listed above, read the file and run the Wiki Compilation"
echo "  Post-Hook from the content-summarizer skill. The post-hook handles"
echo "  collision detection automatically (CREATE / ENRICH / SKIP)."
echo ""
echo "  Quick invocation — paste this into Claude Code:"
echo ""
for i in "${!uncompiled[@]}"; do
  f="${uncompiled[$i]}"
  cat="${uncompiled_categories[$i]}"
  echo "  Read ${f}, then run the content-summarizer Wiki Compilation Post-Hook"
  echo "  to compile a wiki article to wiki/${cat}/. (File $((i+1)) of ${total})"
  echo ""
done
