#!/usr/bin/env bash
# progress.sh — .progress.json + progress.md updaters, module-slug resolver

# mark_status <idx> <status> [<progress_file>]
mark_status() {
  local idx="$1" status="$2" prog_file="${3:-$PROGRESS_FILE}"
  jq --arg idx "$idx" --arg s "$status" \
    '.lectures[$idx].status = $s' \
    "$prog_file" > "$EVC_TMP/prog.tmp"
  mv "$EVC_TMP/prog.tmp" "$prog_file"
}

# increment_retry <idx> [<progress_file>]
increment_retry() {
  local idx="$1" prog_file="${2:-$PROGRESS_FILE}"
  jq --arg idx "$idx" \
    '.lectures[$idx].retries = (.lectures[$idx].retries // 0) + 1' \
    "$prog_file" > "$EVC_TMP/prog.tmp"
  mv "$EVC_TMP/prog.tmp" "$prog_file"
}

# resolve_module_slug <idx> <progress_md_path>
resolve_module_slug() {
  local idx="$1" md_path="$2"
  [ -f "$md_path" ] || { echo ""; return 0; }
  python3 - "$md_path" "$idx" <<'PYEOF'
import re, sys, pathlib
md_path, idx = sys.argv[1:]
text = pathlib.Path(md_path).read_text()
current_module = ""
idx_re = re.compile(r'^\|\s*' + re.escape(idx) + r'\s*\|')
heading_re = re.compile(r'^##\s+(Module\s+[^|\n]+?)\s*$', re.IGNORECASE)
for line in text.splitlines():
    m = heading_re.match(line)
    if m:
        raw = m.group(1).strip()
        slug = re.sub(r'[^a-z0-9]+', '-', raw.lower()).strip('-')
        current_module = slug
        continue
    if idx_re.match(line):
        print(current_module)
        sys.exit(0)
print("")
PYEOF
}

# update_progress_md <idx> <progress_md_path> <progress_json_path>
update_progress_md() {
  local idx="$1" md_path="$2" json_path="$3"
  python3 - "$md_path" "$idx" "$json_path" <<'PYEOF'
import json, re, sys, pathlib
md_path, idx, json_path = sys.argv[1:]
md = pathlib.Path(md_path)
if not md.exists():
    print(f"WARN: {md_path} missing")
    sys.exit(0)
text = md.read_text()

out = []
current_module = ""
heading_re = re.compile(r'^##\s+(Module\s+[^|\n]+?)\s*$', re.IGNORECASE)
idx_row_re = re.compile(r'^(\|\s*' + re.escape(idx) + r'\s*\|\s*\[\[)([^\]/]+?)(\]\][^|]*\|)\s*⬜\s*pending\s*(\|)')
rows_flipped = 0
for line in text.splitlines():
    m = heading_re.match(line)
    if m:
        raw = m.group(1).strip()
        current_module = re.sub(r'[^a-z0-9]+', '-', raw.lower()).strip('-')
        out.append(line); continue
    row_m = idx_row_re.match(line)
    if row_m:
        prefix = current_module + "/" if current_module else ""
        slug = row_m.group(2)
        new_link = prefix + slug if "/" not in slug else slug
        line = f"{row_m.group(1)}{new_link}{row_m.group(3)} ✅ done {row_m.group(4)}"
        rows_flipped += 1
    out.append(line)
text = "\n".join(out)
if text and not text.endswith("\n"):
    text += "\n"

prog = json.loads(pathlib.Path(json_path).read_text())
counts = {'done': 0, 'pending': 0, 'failed': 0}
for lec in prog.get('lectures', {}).values():
    s = lec.get('status', 'pending')
    counts[s if s in counts else 'pending'] += 1
total = sum(counts.values())
summary = (
    f"- **Done:** {counts['done']} / {total}\n"
    f"- **Pending:** {counts['pending']} / {total}\n"
    f"- **Failed:** {counts['failed']} / {total}"
)
text = re.sub(
    r'- \*\*Done:\*\* \d+ / \d+\n- \*\*Pending:\*\* \d+ / \d+\n- \*\*Failed:\*\* \d+ / \d+',
    summary, text, count=1
)
md.write_text(text)
print(f"INFO: progress.md updated (rows flipped: {rows_flipped})")
PYEOF
}
