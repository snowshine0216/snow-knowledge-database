#!/usr/bin/env bash
# stage-02-enumerate.sh — Playwright enumeration + progress seeding
# Usage: stage-02-enumerate.sh <course-url> <cookie-file>
#
# Outputs (stdout, one per line):
#   COURSE_NAME=<kebab-case-name>
#   LECTURES_ENUMERATED=<count>
#
# Side-effects:
#   courses/<COURSE_NAME>/                     — output dir created
#   courses/<COURSE_NAME>/.progress.json       — schemaVersion 2
#   courses/<COURSE_NAME>/progress.md          — human-readable table
#   wiki/courses/<COURSE_NAME>/_index.md       — wiki index stub
#   courses/<COURSE_NAME>/<module-slug>/       — per-module subdirs
#   wiki/courses/<COURSE_NAME>/<module-slug>/  — per-module wiki subdirs

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=lib/paths.sh
source "$SCRIPT_DIR/lib/paths.sh"

# ── Args ────────────────────────────────────────────────────────────────────
COURSE_URL="${1:?usage: stage-02-enumerate.sh <course-url> <cookie-file>}"
COOKIE_FILE="${2:?usage: stage-02-enumerate.sh <course-url> <cookie-file>}"

[ -f "$COOKIE_FILE" ] || { echo "ERROR: COOKIE_FILE not found: $COOKIE_FILE" >&2; exit 1; }

OUTPUT_DIR="$REPO_ROOT/courses"
mkdir -p "$OUTPUT_DIR"

# ── Step 4: Playwright enumeration ──────────────────────────────────────────
echo "INFO: Enumerating lectures at $COURSE_URL ..." >&2
LECTURE_LIST=$(cd "$SKILL_DIR" && node playwright/runner.mjs \
  --action enumerate \
  --url "$COURSE_URL" \
  --cookies "$COOKIE_FILE")

if [ -z "$LECTURE_LIST" ] || [ "$LECTURE_LIST" = "[]" ]; then
  echo "ERROR: No lectures found at $COURSE_URL. CAUSE: Adapter returned empty list or authentication failed. FIX: Re-open Chrome, log into the platform, and re-run." >&2
  exit 1
fi

# ── Derive COURSE_NAME ───────────────────────────────────────────────────────
COURSE_ID=$(echo "$COURSE_URL" | grep -oE '[0-9]{5,}' | tail -1)
COURSE_TITLE=$(echo "$LECTURE_LIST" | jq -r '.[0].course_title // ""' 2>/dev/null)

if [ -n "$COURSE_TITLE" ]; then
  # Sanitize CJK + ASCII, kebab-case, max 60 chars; prefix with ID for uniqueness
  COURSE_TITLE_SLUG=$(echo "$COURSE_TITLE" \
    | python3 -c "import sys, re; raw=sys.stdin.read().strip(); print(re.sub(r'[^\w \-\u4e00-\u9fff]', '', raw, flags=re.UNICODE).strip()[:60])" \
    | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | sed 's/-\{2,\}/-/g')
  COURSE_NAME="${COURSE_ID}-${COURSE_TITLE_SLUG}"
else
  COURSE_NAME="${COURSE_ID:-unknown-course}"
fi

COURSE_DIR="${OUTPUT_DIR}/${COURSE_NAME}"
mkdir -p "$COURSE_DIR"

echo "INFO: Course name: $COURSE_NAME" >&2

# ── Step 6: Seed .progress.json (schemaVersion 2) ───────────────────────────
PROGRESS_FILE="${COURSE_DIR}/.progress.json"

if [ ! -f "$PROGRESS_FILE" ]; then
  echo '{"schemaVersion":2,"courseUrl":null,"courseName":null,"enumeratedAt":null,"lectures":{}}' > "$PROGRESS_FILE"
fi

python3 - "$PROGRESS_FILE" "$LECTURE_LIST" "$COURSE_URL" "$COURSE_NAME" <<'PYEOF'
import json, sys, datetime, shutil
progress_file, lecture_list_json, course_url, course_name = sys.argv[1:]
with open(progress_file) as f:
    prog = json.load(f)
lectures = json.loads(lecture_list_json)
prog['schemaVersion'] = 2
prog['courseUrl'] = course_url
prog['courseName'] = course_name
prog['enumeratedAt'] = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
for lec in lectures:
    idx = str(lec['idx'])
    existing = prog['lectures'].get(idx, {})
    prog['lectures'][idx] = {
        'title': lec.get('title') or existing.get('title'),
        'url': lec.get('url') or existing.get('url'),
        'duration': lec.get('duration') or existing.get('duration'),
        'module_title': lec.get('module_title') or existing.get('module_title'),
        'status': existing.get('status', 'pending'),
        'retries': existing.get('retries', 0),
    }
tmp = progress_file + '.tmp'
with open(tmp, 'w') as f:
    json.dump(prog, f, ensure_ascii=False, indent=2)
shutil.move(tmp, progress_file)
print(f'INFO: Wrote {len(lectures)} lectures to {progress_file}', file=__import__("sys").stderr)
PYEOF

LECTURE_COUNT=$(echo "$LECTURE_LIST" | jq 'length')

# ── Derive module groupings ──────────────────────────────────────────────────
# Emit per-module slug for each lecture index (0-based in JSON, idx field for file name)
# Output: TSV of idx<TAB>module_slug<TAB>module_title
MODULE_TSV=$(python3 - "$LECTURE_LIST" <<'PYEOF'
import json, re, sys

def slugify(s):
    s = s.strip().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

lectures = json.loads(sys.argv[1])
results = []

# Build groups: prefer explicit module_title field; fall back to pattern detection
for lec in lectures:
    idx = str(lec['idx'])
    module_title = lec.get('module_title') or ''
    if module_title:
        results.append((idx, slugify(module_title), module_title))
    else:
        # Detect from title: "Module N ..." patterns
        title = lec.get('title', '')
        m = re.match(r'(?:module|section|chapter|unit)\s*(\d+)', title, re.IGNORECASE)
        if m:
            n = m.group(1)
            # Use remainder as module title if available, else "module-N"
            rest = re.sub(r'(?:module|section|chapter|unit)\s*\d+\s*[:\-]?\s*', '', title, flags=re.IGNORECASE).strip()
            mod_label = f"module-{n}" if not rest else f"module-{n}-{slugify(rest)[:40]}"
            results.append((idx, mod_label, f"Module {n}"))
        else:
            # No module info — put everything in a flat "lectures" group
            results.append((idx, 'lectures', 'Lectures'))

for idx, slug, title in results:
    print(f"{idx}\t{slug}\t{title}")
PYEOF
)

# ── Collect unique module slugs and titles ───────────────────────────────────
# Build an ordered list of unique (slug, title) pairs
declare -A MODULE_TITLE_MAP
MODULE_ORDER=()
while IFS=$'\t' read -r _idx mod_slug mod_title; do
  if [ -z "${MODULE_TITLE_MAP[$mod_slug]+x}" ]; then
    MODULE_TITLE_MAP["$mod_slug"]="$mod_title"
    MODULE_ORDER+=("$mod_slug")
  fi
done <<< "$MODULE_TSV"

# ── Create module subdirectories ─────────────────────────────────────────────
for mod_slug in "${MODULE_ORDER[@]}"; do
  mkdir -p "${COURSE_DIR}/${mod_slug}"
  mkdir -p "$REPO_ROOT/wiki/courses/${COURSE_NAME}/${mod_slug}"
  echo "INFO: Created module dirs: $mod_slug" >&2
done

# ── Step 6 (progress.md): Seed human-readable table ─────────────────────────
PROGRESS_MD="${COURSE_DIR}/progress.md"

python3 - "$PROGRESS_MD" "$LECTURE_LIST" "$MODULE_TSV" "$COURSE_NAME" <<'PYEOF'
import json, sys, pathlib, re

md_path, lecture_list_json, module_tsv_raw, course_name = sys.argv[1:]
lectures = json.loads(lecture_list_json)

def slugify(s):
    s = s.strip().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

# Parse module TSV: idx -> (module_slug, module_title)
lec_module = {}
module_order = []
seen_modules = {}
for line in module_tsv_raw.strip().split('\n'):
    if not line:
        continue
    parts = line.split('\t')
    if len(parts) < 3:
        continue
    idx, mod_slug, mod_title = parts[0], parts[1], parts[2]
    lec_module[idx] = (mod_slug, mod_title)
    if mod_slug not in seen_modules:
        seen_modules[mod_slug] = mod_title
        module_order.append((mod_slug, mod_title))

# Group lectures by module
groups = {slug: [] for slug, _ in module_order}
for lec in lectures:
    idx = str(lec['idx'])
    mod_slug, _ = lec_module.get(idx, ('lectures', 'Lectures'))
    groups.setdefault(mod_slug, []).append(lec)

# Build the markdown
lines = [f"# Progress — {course_name}", ""]

module_num = 0
for mod_slug, mod_title in module_order:
    module_num += 1
    lines.append(f"## Module {module_num} — {mod_title}")
    lines.append("")
    lines.append("| # | Lecture | Status |")
    lines.append("|---|---------|--------|")
    for lec in groups.get(mod_slug, []):
        idx = str(lec['idx'])
        idx_padded = idx.zfill(3)
        title = lec.get('title', f'lecture-{idx}')
        slug = slugify(title)[:60]
        link_target = f"{mod_slug}/{idx_padded}-{slug}"
        lines.append(f"| {idx_padded} | [[{link_target}]] | ⬜ pending |")
    lines.append("")

total = len(lectures)
lines.append(f"- **Done:** 0 / {total}")
lines.append(f"- **Pending:** {total} / {total}")
lines.append(f"- **Failed:** 0 / {total}")
lines.append("")

pathlib.Path(md_path).write_text('\n'.join(lines), encoding='utf-8')
print(f"INFO: Seeded {md_path} ({total} lectures, {len(module_order)} modules)", file=__import__("sys").stderr)
PYEOF

# ── Step 8a: Seed wiki/courses/<COURSE_NAME>/_index.md ──────────────────────
WIKI_COURSE_DIR="$REPO_ROOT/wiki/courses/${COURSE_NAME}"
mkdir -p "$WIKI_COURSE_DIR"

WIKI_INDEX="${WIKI_COURSE_DIR}/_index.md"
if [ ! -f "$WIKI_INDEX" ]; then
  TODAY=$(date +%Y-%m-%d)
  python3 - "$WIKI_INDEX" "$COURSE_NAME" "$COURSE_URL" "$TODAY" <<'PYEOF'
import sys, pathlib
wiki_index, course_name, course_url, today = sys.argv[1:]

content = f"""---
tags: [course, encrypted-video-capture]
source: {course_url}
---

# {course_name}

> Captured with encrypted-video-capture. Lectures compiled below.

| Lecture | Module | Date |
|---------|--------|------|
"""
pathlib.Path(wiki_index).write_text(content, encoding='utf-8')
print(f"INFO: Seeded {wiki_index}", file=__import__("sys").stderr)
PYEOF
else
  echo "INFO: $WIKI_INDEX already exists — skipping seed" >&2
fi

# ── Output for parent orchestrator ──────────────────────────────────────────
echo "COURSE_NAME=${COURSE_NAME}"
echo "LECTURES_ENUMERATED=${LECTURE_COUNT}"
