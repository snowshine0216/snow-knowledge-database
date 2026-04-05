#!/usr/bin/env bash
# Usage: ./scripts/compile.sh raw/article.md [wiki-category]
#
# THIS SCRIPT IS A MANUAL WORKFLOW TRIGGER, NOT AUTOMATION.
# It validates inputs and prints the Claude Code instruction to run.
# The actual compilation is performed by Claude Code (read raw file → write wiki + update index).
#
# Why not automate the LLM call here?
# Because compilation requires reading the file, understanding its context,
# choosing the right wiki category, writing a synthesized article (not a copy),
# and atomically updating _index.md. That's a Claude Code task, not a bash task.
#
# Env: DEFAULT_CATEGORY=concepts  (overrides built-in default category)
set -euo pipefail

FILE="${1:-}"
# Strip trailing slash; env DEFAULT_CATEGORY overrides built-in default
CATEGORY="${2%/}"
CATEGORY="${CATEGORY:-${DEFAULT_CATEGORY:-concepts}}"

if [ -z "$FILE" ]; then
  echo "Usage: $0 <raw-article.md> [wiki-category]" >&2
  echo "  e.g.: $0 raw/llm-knowledge-bases-post.md concepts" >&2
  echo "  Categories: concepts (default), tools, workflows" >&2
  exit 1
fi

# Validate category is non-empty after stripping
if [ -z "$CATEGORY" ]; then
  echo "ERROR: wiki category cannot be empty" >&2; exit 1
fi

# Validate file exists
if [ ! -f "$FILE" ]; then
  echo "ERROR: File not found: $FILE" >&2; exit 1
fi

# Validate category does not contain path traversal
if [[ "$CATEGORY" == *..* ]] || [[ "$CATEGORY" == /* ]]; then
  echo "ERROR: Category cannot contain '..' or be an absolute path" >&2; exit 1
fi

# Validate file is under raw/ (prevent path traversal)
# Use POSIX-portable path resolution with -P to resolve symlinks (works on macOS)
_dir=$(cd -P "$(dirname "$FILE")" 2>/dev/null && pwd) || { echo "ERROR: Cannot resolve file path: $FILE" >&2; exit 1; }
_base=$(basename "$FILE")
REAL_FILE="${_dir}/${_base}"
_raw_dir=$(cd -P "raw/" 2>/dev/null && pwd) || { echo "ERROR: raw/ directory not found" >&2; exit 1; }
REAL_RAW="${_raw_dir}"
if [[ "$REAL_FILE" != "$REAL_RAW"/* ]]; then
  echo "ERROR: File must be under raw/ directory" >&2; exit 1
fi

BASENAME=$(basename "$FILE" .md)
WIKI_OUT="wiki/${CATEGORY}/${BASENAME}.md"

# Detect collisions
if [ -f "$WIKI_OUT" ]; then
  echo "WARNING: $WIKI_OUT already exists — compilation would overwrite it." >&2
  echo "Rename the raw file or pass a different category as the second argument." >&2
  exit 1
fi

echo "Ready to compile: $FILE → $WIKI_OUT"
echo ""
echo "Run this in Claude Code:"
echo "  Read $FILE, synthesize a wiki article, write to $WIKI_OUT with:"
echo "  - Proper CLAUDE.md frontmatter (tags array, source URL)"
echo "  - [[wikilinks]] for cross-references (Obsidian format, not [markdown links])"
echo "  - Then update wiki/_index.md: add one row to the table"
echo "  - Use atomic write: write to ${WIKI_OUT}.tmp first, then mv to $WIKI_OUT"
