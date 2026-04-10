#!/usr/bin/env bash
# Usage: scripts/wiki-collision-check.sh <source-url> <tag1,tag2,tag3>
#
# Outputs one of:
#   SKIP                   — wiki article already exists for this source
#   ENRICH <wiki-file>     — a related article exists (>= 4 shared non-generic tags)
#   CREATE                 — no collision found, create a new wiki article
#
# Exit code is always 0 (non-fatal). Errors and warnings go to stderr.
#
# GENERIC_TAGS env var: comma-separated list of tags to exclude from ENRICH comparison.
# Default: llm,ai,rag,machine-learning
# Example: GENERIC_TAGS="llm,ai,python" scripts/wiki-collision-check.sh ...
#
# ENRICH_THRESHOLD env var: minimum shared non-generic tags to trigger ENRICH.
# Default: 4

set -uo pipefail

URL="${1:-}"
TAGS="${2:-}"

GENERIC_TAGS="${GENERIC_TAGS:-llm,ai,rag,machine-learning}"
readonly ENRICH_THRESHOLD_DEFAULT=4
ENRICH_THRESHOLD="${ENRICH_THRESHOLD:-$ENRICH_THRESHOLD_DEFAULT}"
# Validate ENRICH_THRESHOLD is a positive integer; reset to default if not.
[[ "$ENRICH_THRESHOLD" =~ ^[0-9]+$ ]] || { echo "WARNING: ENRICH_THRESHOLD='$ENRICH_THRESHOLD' is not a valid integer — using $ENRICH_THRESHOLD_DEFAULT" >&2; ENRICH_THRESHOLD=$ENRICH_THRESHOLD_DEFAULT; }

# --- Validate inputs ---

if [ -z "$URL" ]; then
  echo "WARNING: source URL is empty — defaulting to CREATE" >&2
  echo "CREATE"
  exit 0
fi

# Guard: wiki/ must exist
if [ ! -d "wiki" ]; then
  echo "CREATE"
  exit 0
fi

# --- Primary check: URL match in individual wiki file frontmatter ---
# Use -F (fixed-string) to prevent URL being interpreted as a regex.
# Use -- to prevent URL starting with '-' being treated as a flag.
matched_file=$(grep -rl -F -- "$URL" wiki/ 2>/dev/null | grep '\.md$' | head -1)
if [ -n "$matched_file" ]; then
  echo "SKIP"
  exit 0
fi

# --- Secondary check: slug match against wiki filenames ---
# Derive slug from URL: take the last path component, strip fragment/query, lowercase.
slug=$(echo "$URL" | sed 's|[?#].*||' | sed 's|/$||' | rev | cut -d'/' -f1 | rev | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
if [ -n "$slug" ]; then
  slug_match=$(find wiki/ -name "${slug}.md" 2>/dev/null | head -1)
  if [ -n "$slug_match" ]; then
    echo "SKIP"
    exit 0
  fi
fi

# --- Tertiary check: shared non-generic tag count against _index.md ---
# Only proceed if we have tags and _index.md exists.
if [ -z "$TAGS" ] || [ ! -f "wiki/_index.md" ]; then
  echo "CREATE"
  exit 0
fi

# Build set of non-generic input tags (IFS-split on comma, strip spaces).
declare -a input_tags=()
IFS=',' read -ra raw_tags <<< "$TAGS"
for t in "${raw_tags[@]}"; do
  t="${t// /}"  # strip spaces
  [ -z "$t" ] && continue
  # Skip if tag is in the generic set.
  if echo ",$GENERIC_TAGS," | grep -qF ",${t},"; then
    continue
  fi
  input_tags+=("$t")
done

if [ "${#input_tags[@]}" -eq 0 ]; then
  echo "CREATE"
  exit 0
fi

enrich_count=0
best_match=""
best_score=0

# Parse _index.md table rows: | [Title](path) | tags | summary |
# Tags column is the second pipe-delimited field.
while IFS='|' read -r _ file_col tags_col _rest; do
  # Skip header and separator rows.
  [[ "$file_col" =~ ^[[:space:]]*File[[:space:]]*$ ]] && continue
  [[ "$file_col" =~ ^[[:space:]]*-+[[:space:]]*$ ]] && continue
  [ -z "${tags_col// /}" ] && continue

  # Extract wiki file path from [Title](path) link.
  wiki_path=$(echo "$file_col" | grep -oE '\([^)]+\.md\)' | tr -d '()')
  [ -z "$wiki_path" ] && continue

  # Parse tags from the column (comma-separated, may have spaces).
  shared=0
  IFS=',' read -ra row_tags <<< "$tags_col"
  for rt in "${row_tags[@]}"; do
    rt="${rt// /}"
    [ -z "$rt" ] && continue
    # Skip generic tags in the row too.
    echo ",$GENERIC_TAGS," | grep -qF ",${rt}," && continue
    # Check if this row tag appears in our input tags.
    for it in "${input_tags[@]}"; do
      if [ "$rt" = "$it" ]; then
        shared=$((shared + 1))
        break
      fi
    done
  done

  if [ "$shared" -ge "$ENRICH_THRESHOLD" ]; then
    enrich_count=$((enrich_count + 1))
    if [ "$shared" -gt "$best_score" ]; then
      best_score="$shared"
      best_match="wiki/$wiki_path"
    fi
  fi
done < <(grep '|' wiki/_index.md)

if [ "$enrich_count" -gt 5 ]; then
  echo "WARNING: $enrich_count potential ENRICH targets found — using highest-scoring match only. Consider raising ENRICH_THRESHOLD." >&2
fi

if [ -n "$best_match" ]; then
  echo "ENRICH $best_match"
  exit 0
fi

echo "CREATE"
