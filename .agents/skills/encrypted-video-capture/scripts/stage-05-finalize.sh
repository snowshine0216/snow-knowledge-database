#!/usr/bin/env bash
# stage-05-finalize.sh — update Obsidian + wiki indexes, run wiki backfill check
# Usage: stage-05-finalize.sh <course_name>
# §8a: update courses/_index.md with wikilinks for all lesson .md files
# §8b: check wiki/courses/<course_name>/ for missing compiled articles

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/paths.sh"

COURSE_NAME="${1:?usage: stage-05-finalize.sh <course_name>}"
OUTPUT_DIR="${OUTPUT_DIR:-courses}"

echo "=== Stage 05: Finalize — ${COURSE_NAME} ==="

# ---------------------------------------------------------------------------
# §8a: Obsidian _index.md update
# Handles both module-subfoldered lessons (mindepth 2 maxdepth 2)
# and flat lessons directly under COURSE_NAME/ (maxdepth 1).
# ---------------------------------------------------------------------------
INDEX_FILE="${REPO_ROOT}/${OUTPUT_DIR}/_index.md"

if [ ! -f "$INDEX_FILE" ]; then
  printf '# Lecture Index\n\n| Lecture | Course | Date |\n|---------|--------|------|\n' > "$INDEX_FILE"
  echo "INFO: Created ${INDEX_FILE}"
fi

TODAY=$(date +%Y-%m-%d)

# Module-subfoldered lessons: courses/<course>/<module-slug>/<lesson>.md
while IFS= read -r md_file; do
  [ -f "$md_file" ] || continue
  stem=$(basename "$md_file" .md)
  module_dir=$(basename "$(dirname "$md_file")")
  # Wikilink includes module prefix: [[course/module-slug/001-slug]]
  link="${COURSE_NAME}/${module_dir}/${stem}"
  row="| [[${link}]] | ${COURSE_NAME} | ${TODAY} |"
  grep -qF "${stem}" "$INDEX_FILE" || echo "$row" >> "$INDEX_FILE"
done < <(find "${REPO_ROOT}/${OUTPUT_DIR}/${COURSE_NAME}" -mindepth 2 -maxdepth 2 -name "*.md" -not -name "_index.md" -not -name "progress.md" 2>/dev/null | sort)

# Flat lessons: courses/<course>/<lesson>.md (no subdirectory)
while IFS= read -r md_file; do
  [ -f "$md_file" ] || continue
  stem=$(basename "$md_file" .md)
  link="${COURSE_NAME}/${stem}"
  row="| [[${link}]] | ${COURSE_NAME} | ${TODAY} |"
  grep -qF "${stem}" "$INDEX_FILE" || echo "$row" >> "$INDEX_FILE"
done < <(find "${REPO_ROOT}/${OUTPUT_DIR}/${COURSE_NAME}" -maxdepth 1 -name "*.md" -not -name "_index.md" -not -name "progress.md" 2>/dev/null | sort)

echo "INFO: Updated ${INDEX_FILE}"

# ---------------------------------------------------------------------------
# §8a (cont.): Wiki _index.md update
# Mirrors the same two-pass walk for wiki/courses/<course>/
# ---------------------------------------------------------------------------
WIKI_COURSE_DIR="${REPO_ROOT}/wiki/courses/${COURSE_NAME}"
WIKI_INDEX="${WIKI_COURSE_DIR}/_index.md"

if [ -d "$WIKI_COURSE_DIR" ]; then
  if [ ! -f "$WIKI_INDEX" ]; then
    printf '# %s\n\n| # | Lesson | Status |\n|---|--------|--------|\n' "${COURSE_NAME}" > "$WIKI_INDEX"
    echo "INFO: Created ${WIKI_INDEX}"
  fi

  # Module-subfoldered wiki lessons
  while IFS= read -r md_file; do
    [ -f "$md_file" ] || continue
    stem=$(basename "$md_file" .md)
    module_dir=$(basename "$(dirname "$md_file")")
    # Extract title from frontmatter or first H1
    title=$(grep -m1 '^title:' "$md_file" 2>/dev/null | sed 's/^title:[[:space:]]*//' || true)
    if [ -z "$title" ]; then
      title=$(grep -m1 '^# ' "$md_file" 2>/dev/null | sed 's/^# //' || echo "$stem")
    fi
    # Number from filename prefix (e.g. 001)
    num=$(echo "$stem" | grep -oE '^[0-9]+' || echo "")
    # Wikilink: [[module-slug/001-slug|Lesson Title]]
    wikilink="[[${module_dir}/${stem}|${title}]]"
    row="| ${num} | ${wikilink} | ⬜ |"
    grep -qF "${stem}" "$WIKI_INDEX" || echo "$row" >> "$WIKI_INDEX"
  done < <(find "$WIKI_COURSE_DIR" -mindepth 2 -maxdepth 2 -name "*.md" -not -name "_index.md" 2>/dev/null | sort)

  # Flat wiki lessons
  while IFS= read -r md_file; do
    [ -f "$md_file" ] || continue
    stem=$(basename "$md_file" .md)
    title=$(grep -m1 '^title:' "$md_file" 2>/dev/null | sed 's/^title:[[:space:]]*//' || true)
    if [ -z "$title" ]; then
      title=$(grep -m1 '^# ' "$md_file" 2>/dev/null | sed 's/^# //' || echo "$stem")
    fi
    num=$(echo "$stem" | grep -oE '^[0-9]+' || echo "")
    wikilink="[[${stem}|${title}]]"
    row="| ${num} | ${wikilink} | ⬜ |"
    grep -qF "${stem}" "$WIKI_INDEX" || echo "$row" >> "$WIKI_INDEX"
  done < <(find "$WIKI_COURSE_DIR" -maxdepth 1 -name "*.md" -not -name "_index.md" 2>/dev/null | sort)

  echo "INFO: Updated ${WIKI_INDEX}"
else
  echo "INFO: No wiki course dir found at ${WIKI_COURSE_DIR} — skipping wiki _index.md update."
fi

# ---------------------------------------------------------------------------
# §8b: Wiki backfill check
# For each lesson .md in courses/<course>/ (recursive), check if a matching
# file exists in wiki/courses/<course>/. Print [wiki-skip] or [wiki-missing].
# ---------------------------------------------------------------------------
echo "=== Wiki backfill check ==="

while IFS= read -r md_file; do
  [ -f "$md_file" ] || continue
  stem=$(basename "$md_file" .md)

  # Check if stem appears anywhere under wiki/courses/<course>/
  if find "${REPO_ROOT}/wiki/courses/${COURSE_NAME}" -name "*${stem}*" 2>/dev/null | grep -q .; then
    echo "  [wiki-skip] ${stem} already compiled."
  else
    echo "  [wiki-missing] ${stem} — not found in wiki/courses/${COURSE_NAME}/"
  fi
done < <(find "${REPO_ROOT}/${OUTPUT_DIR}/${COURSE_NAME}" \
    \( -name "*.md" -not -name "_index.md" -not -name "progress.md" \) \
    2>/dev/null | sort)

echo "=== Stage 05 complete ==="
