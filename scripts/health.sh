#!/usr/bin/env bash
# Usage: scripts/health.sh [--fix] [--json]
# Wiki health check: validates index integrity, wikilinks, frontmatter, and more.
# Exit codes: 0 = clean or WARN-only  |  1 = at least one FAIL
# Flags:
#   --fix   auto-repair safe issues (missing index rows, update .link-baseline)
#   --json  machine-readable output for future /health API endpoint
set -euo pipefail

FIX=0; JSON=0
for arg in "$@"; do
  case "$arg" in
    --fix)  FIX=1 ;;
    --json) JSON=1 ;;
  esac
done

FAILURES=0; WARNINGS=0
JSON_CHECKS="{}"   # built up as we go

# ── guard clauses ────────────────────────────────────────────────────────────

if [ ! -d "wiki/" ]; then
  if [ "$JSON" = "1" ]; then
    echo '{"result":"skip","reason":"wiki/ not found"}'
  else
    echo "[SKIP] wiki/ not found — nothing to check"
  fi
  exit 0
fi

if [ ! -f "wiki/_index.md" ]; then
  if [ "$JSON" = "1" ]; then
    echo '{"result":"fail","reason":"wiki/_index.md not found"}'
  else
    echo "[FAIL] wiki/_index.md not found"
  fi
  exit 1
fi

SKIP_BASELINE=0
if [ ! -f "wiki/.link-baseline" ]; then
  SKIP_BASELINE=1
fi

# ── output helpers ───────────────────────────────────────────────────────────

REPORT=""
add_line() { REPORT="${REPORT}${1}"$'\n'; }

emit_pass()  { add_line "[PASS] $1"; }
emit_fail()  { add_line "[FAIL] $1"; FAILURES=$((FAILURES + 1)); }
emit_warn()  { add_line "[WARN] $1"; WARNINGS=$((WARNINGS + 1)); }
emit_skip()  { add_line "[SKIP] $1"; }

# Append a key:value pair to JSON_CHECKS string
# Usage: json_add_check key '{...}'
json_add_check() {
  local key="$1" val="$2"
  if [ "$JSON_CHECKS" = "{}" ]; then
    JSON_CHECKS="{\"$key\":$val}"
  else
    JSON_CHECKS="${JSON_CHECKS%\}},"
    JSON_CHECKS="${JSON_CHECKS}\"$key\":$val}"
  fi
}

# ── check 1: stale index entries ──────────────────────────────────────────────

STALE_ISSUES=""
STALE_COUNT=0
TOTAL_INDEX=0

# Parse table rows: skip frontmatter (---...---), heading, pipe-only lines
while IFS= read -r line; do
  # Skip non-table lines and header/separator rows
  [[ "$line" =~ ^\| ]] || continue
  [[ "$line" =~ \|[-:]+\| ]] && continue
  [[ "$line" =~ \|[[:space:]]*File[[:space:]]*\| ]] && continue

  # Extract path from first column: | [Title](path) | ... |
  path=$(echo "$line" | sed -n 's/.*\](\([^)]*\)).*/\1/p')
  [ -z "$path" ] && continue
  TOTAL_INDEX=$((TOTAL_INDEX + 1))
  if [ ! -f "wiki/$path" ]; then
    STALE_ISSUES="${STALE_ISSUES}  wiki/$path (referenced in index, file missing)\n"
    STALE_COUNT=$((STALE_COUNT + 1))
  fi
done < "wiki/_index.md"

if [ "$STALE_COUNT" = "0" ]; then
  emit_pass "Index integrity: $TOTAL_INDEX/$TOTAL_INDEX entries valid"
  json_add_check "index_integrity" "{\"status\":\"pass\",\"valid\":$TOTAL_INDEX,\"total\":$TOTAL_INDEX,\"issues\":[]}"
else
  emit_fail "Stale index entries: $STALE_COUNT (file in index but missing on disk)"
  while IFS= read -r issue; do
    [ -n "$issue" ] && add_line "  $issue"
  done < <(printf '%b' "$STALE_ISSUES")
  json_add_check "index_integrity" "{\"status\":\"fail\",\"stale\":$STALE_COUNT,\"total\":$TOTAL_INDEX}"
fi

# ── check 2: missing index entries ────────────────────────────────────────────

MISSING_ISSUES=""
MISSING_COUNT=0

for dir in concepts tools workflows; do
  [ -d "wiki/$dir" ] || continue
  for f in wiki/$dir/*.md; do
    [ -e "$f" ] || continue
    [ -d "$f" ] && continue
    [ "$(basename "$f")" = "_index.md" ] && continue
    rel="${f#wiki/}"   # e.g. concepts/foo.md
    if ! grep -qF "($rel)" "wiki/_index.md" 2>/dev/null; then
      MISSING_ISSUES="${MISSING_ISSUES}$f\n"
      MISSING_COUNT=$((MISSING_COUNT + 1))
    fi
  done
done

if [ "$MISSING_COUNT" = "0" ]; then
  emit_pass "No missing index entries"
  json_add_check "missing_entries" "{\"status\":\"pass\",\"count\":0}"
else
  emit_fail "Missing index entries: $MISSING_COUNT (wiki file exists but no index row)"
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    add_line "  $f"
    if [ "$FIX" = "1" ]; then
      rel="${f#wiki/}"
      # Only add if not already present (idempotency)
      if ! grep -qF "($rel)" "wiki/_index.md" 2>/dev/null; then
        title=$(basename "$f" .md | sed 's/-/ /g')
        tags=$(grep '^tags:' "$f" 2>/dev/null | sed 's/tags: //' | tr -d '[]' || true)
        tags="${tags:-todo}"
        summary=$(awk '/^---/{f=!f;next} !f && /^[^#]/ && NF {print; exit}' "$f" 2>/dev/null || true)
        summary="${summary:-TODO: add summary}"
        echo "| [$title]($rel) | $tags | $summary |" >> "wiki/_index.md"
        add_line "  → [FIXED] Added index row for $rel"
      fi
    fi
  done < <(printf '%b' "$MISSING_ISSUES")
  json_add_check "missing_entries" "{\"status\":\"fail\",\"count\":$MISSING_COUNT}"
fi

# ── check 3: orphaned raw files ───────────────────────────────────────────────

ORPHAN_RAW=""
ORPHAN_COUNT=0

if [ -d "raw/" ]; then
  for f in raw/*.md; do
    [ -e "$f" ] || continue
    base=$(basename "$f" .md)
    found=0
    for dir in concepts tools workflows; do
      [ -f "wiki/$dir/$base.md" ] && found=1 && break
    done
    if [ "$found" = "0" ]; then
      ORPHAN_RAW="${ORPHAN_RAW}$(basename "$f")\n"
      ORPHAN_COUNT=$((ORPHAN_COUNT + 1))
    fi
  done
fi

if [ "$ORPHAN_COUNT" = "0" ]; then
  json_add_check "orphaned_raw" "{\"status\":\"pass\",\"files\":[]}"
else
  while IFS= read -r rawfile; do
    [ -z "$rawfile" ] && continue
    emit_warn "Orphaned raw: $rawfile — add to TODOS.md if not tracked"
  done < <(printf '%b' "$ORPHAN_RAW")
  json_add_check "orphaned_raw" "{\"status\":\"warn\",\"count\":$ORPHAN_COUNT}"
fi

# ── check 4: duplicate slug detection ────────────────────────────────────────

DUP_ISSUES=""
DUP_COUNT=0
SEEN_SLUGS=""
SKIP_WIKILINKS=0

for dir in concepts tools workflows; do
  [ -d "wiki/$dir" ] || continue
  for f in wiki/$dir/*.md; do
    [ -e "$f" ] || continue
    [ -d "$f" ] && continue
    slug=$(basename "$f" .md)
    # Check if slug already seen
    if echo "$SEEN_SLUGS" | grep -qx "$slug" 2>/dev/null; then
      DUP_ISSUES="${DUP_ISSUES}  $slug (duplicate across category dirs)\n"
      DUP_COUNT=$((DUP_COUNT + 1))
    else
      SEEN_SLUGS="${SEEN_SLUGS}${slug}"$'\n'
    fi
  done
done

if [ "$DUP_COUNT" = "0" ]; then
  emit_pass "No duplicate slugs"
  json_add_check "duplicate_slugs" "{\"status\":\"pass\"}"
else
  emit_fail "Duplicate slugs: $DUP_COUNT"
  while IFS= read -r issue; do
    [ -n "$issue" ] && add_line "  $issue"
  done < <(printf '%b' "$DUP_ISSUES")
  json_add_check "duplicate_slugs" "{\"status\":\"fail\",\"count\":$DUP_COUNT}"
  SKIP_WIKILINKS=1
fi

# ── check 5: broken wikilinks ────────────────────────────────────────────────

if [ "$SKIP_WIKILINKS" = "1" ]; then
  emit_skip "Wikilink check skipped — resolve duplicate slugs first"
  json_add_check "broken_wikilinks" "{\"status\":\"skipped\",\"reason\":\"duplicate slugs\"}"
else
  WIKILINK_ISSUES=""
  WIKILINK_COUNT=0
  # Use non-greedy pattern to avoid matching [[foo]] and [[bar]] as one link
  while IFS= read -r line; do
    # line format: filename:link
    filepath=$(echo "$line" | cut -d: -f1)
    link=$(echo "$line" | cut -d: -f2- | tr -d '[]')
    # Strip pipe alias: [[Target|Display]] → use only "Target"
    link="${link%%|*}"
    # Normalize: spaces → hyphens, lowercase
    normalized=$(echo "$link" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
    # Check if target exists anywhere in wiki/ (case-insensitive on macOS HFS+)
    found=0
    for dir in concepts tools workflows; do
      [ -f "wiki/$dir/${normalized}.md" ] && found=1 && break
      # Also try exact name (already lowercase)
      [ -f "wiki/$dir/${link}.md" ] && found=1 && break
    done
    if [ "$found" = "0" ]; then
      WIKILINK_ISSUES="${WIKILINK_ISSUES}  $filepath — [[$link]] (not found)\n"
      WIKILINK_COUNT=$((WIKILINK_COUNT + 1))
    fi
  done < <(grep -roE '\[\[[^]]*\]\]' wiki/ 2>/dev/null | sed 's|:\[\[|:|; s|\]\]$||' || true)

  if [ "$WIKILINK_COUNT" = "0" ]; then
    emit_pass "No broken wikilinks"
    json_add_check "broken_wikilinks" "{\"status\":\"pass\",\"count\":0}"
  else
    emit_fail "Broken wikilinks: $WIKILINK_COUNT"
    while IFS= read -r issue; do
      [ -n "$issue" ] && add_line "  $issue"
    done < <(printf '%b' "$WIKILINK_ISSUES")
    json_add_check "broken_wikilinks" "{\"status\":\"fail\",\"count\":$WIKILINK_COUNT}"
  fi
fi

# ── check 6: frontmatter validation ──────────────────────────────────────────

FM_ISSUES=""
FM_COUNT=0
FM_TOTAL=0

check_frontmatter() {
  local f="$1"
  FM_TOTAL=$((FM_TOTAL + 1))
  local has_fm has_tags has_source
  has_fm=0; has_tags=0; has_source=0

  # Must start with ---
  head -1 "$f" | grep -q '^---' && has_fm=1

  # Must have tags: [ (inline array)
  grep -q '^tags: \[' "$f" 2>/dev/null && has_tags=1

  # Must have non-empty source:
  if grep -q '^source:' "$f" 2>/dev/null; then
    local src
    src=$(grep '^source:' "$f" | head -1 | sed 's/^source:[[:space:]]*//')
    [ -n "$src" ] && has_source=1
  fi

  if [ "$has_fm" = "0" ] || [ "$has_tags" = "0" ] || [ "$has_source" = "0" ]; then
    FM_ISSUES="${FM_ISSUES}  $f (fm=$has_fm tags=$has_tags source=$has_source)\n"
    FM_COUNT=$((FM_COUNT + 1))
  fi
}

for dir in concepts tools workflows; do
  [ -d "wiki/$dir" ] || continue
  for f in wiki/$dir/*.md; do
    [ -e "$f" ] || continue
    [ -d "$f" ] && continue
    check_frontmatter "$f"
  done
done

if [ -d "raw/" ]; then
  for f in raw/*.md; do
    [ -e "$f" ] || continue
    check_frontmatter "$f"
  done
fi

if [ "$FM_COUNT" = "0" ]; then
  emit_pass "Frontmatter: $FM_TOTAL/$FM_TOTAL files valid"
  json_add_check "frontmatter" "{\"status\":\"pass\",\"valid\":$FM_TOTAL,\"total\":$FM_TOTAL}"
else
  emit_fail "Frontmatter errors: $FM_COUNT/$FM_TOTAL files invalid"
  while IFS= read -r issue; do
    [ -n "$issue" ] && add_line "  $issue"
  done < <(printf '%b' "$FM_ISSUES")
  json_add_check "frontmatter" "{\"status\":\"fail\",\"valid\":$((FM_TOTAL - FM_COUNT)),\"total\":$FM_TOTAL}"
fi

# ── check 7: link-baseline drift ─────────────────────────────────────────────

if [ "$SKIP_BASELINE" = "1" ]; then
  emit_skip "link-baseline check skipped — wiki/.link-baseline not found (run --fix to initialize)"
  json_add_check "link_baseline" "{\"status\":\"skipped\",\"reason\":\".link-baseline not found\"}"
else
  CURRENT_LINKS=$( { grep -roE '\[\[[^]]*\]\]' wiki/ 2>/dev/null || true; } | wc -l | tr -d '[:space:]')
  BASELINE=$(cat "wiki/.link-baseline" | tr -d '[:space:]')
  if [ "$CURRENT_LINKS" -lt "$BASELINE" ] 2>/dev/null; then
    emit_warn "Link-baseline drift: $CURRENT_LINKS links (baseline: $BASELINE) — links were removed"
    json_add_check "link_baseline" "{\"status\":\"warn\",\"current\":$CURRENT_LINKS,\"baseline\":$BASELINE}"
    if [ "$FIX" = "1" ]; then
      add_line "  → [SKIP] --fix cannot update baseline when count < baseline (investigate manually)"
    fi
  else
    emit_pass "Link baseline: $CURRENT_LINKS links (baseline: $BASELINE)"
    json_add_check "link_baseline" "{\"status\":\"pass\",\"current\":$CURRENT_LINKS,\"baseline\":$BASELINE}"
    if [ "$FIX" = "1" ] && [ "$CURRENT_LINKS" -gt "$BASELINE" ] 2>/dev/null; then
      echo "$CURRENT_LINKS" > "wiki/.link-baseline"
      add_line "  → [FIXED] Updated .link-baseline to $CURRENT_LINKS"
    fi
  fi
fi

# ── check 8: empty file check ────────────────────────────────────────────────

EMPTY_ISSUES=""
EMPTY_COUNT=0

for dir in concepts tools workflows; do
  [ -d "wiki/$dir" ] || continue
  for f in wiki/$dir/*.md; do
    [ -e "$f" ] || continue
    [ -d "$f" ] && continue
    # Check for content beyond frontmatter (more than just --- blocks)
    has_body=$(awk '
      BEGIN{in_fm=0; found=0}
      /^---/{in_fm=!in_fm; next}
      !in_fm && /[^[:space:]]/{found=1; exit}
      END{print found}
    ' "$f" 2>/dev/null || echo "0")
    if [ "$has_body" = "0" ]; then
      EMPTY_ISSUES="${EMPTY_ISSUES}  $f\n"
      EMPTY_COUNT=$((EMPTY_COUNT + 1))
    fi
  done
done

if [ "$EMPTY_COUNT" = "0" ]; then
  emit_pass "No empty files"
  json_add_check "empty_files" "{\"status\":\"pass\"}"
else
  emit_fail "Empty files (frontmatter only): $EMPTY_COUNT"
  while IFS= read -r issue; do
    [ -n "$issue" ] && add_line "  $issue"
  done < <(printf '%b' "$EMPTY_ISSUES")
  json_add_check "empty_files" "{\"status\":\"fail\",\"count\":$EMPTY_COUNT}"
fi

# ── output ───────────────────────────────────────────────────────────────────

if [ "$JSON" = "1" ]; then
  RESULT="pass"
  [ "$FAILURES" -gt 0 ] && RESULT="fail"
  [ "$FAILURES" = "0" ] && [ "$WARNINGS" -gt 0 ] && RESULT="warn"
  TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u +%Y-%m-%dT%H:%M:%SZ)
  printf '{"timestamp":"%s","checks":%s,"result":"%s","failures":%d,"warnings":%d}\n' \
    "$TIMESTAMP" "$JSON_CHECKS" "$RESULT" "$FAILURES" "$WARNINGS"
else
  echo "WIKI HEALTH CHECK"
  echo "================="
  printf '%s' "$REPORT"
  echo ""
  if [ "$FAILURES" = "0" ] && [ "$WARNINGS" = "0" ]; then
    echo "Result: all checks pass"
  elif [ "$FAILURES" = "0" ]; then
    echo "Result: 0 failures, $WARNINGS warning(s)"
  else
    echo "Result: $FAILURES failure(s), $WARNINGS warning(s)"
  fi
fi

[ "$FAILURES" = "0" ] && exit 0 || exit 1
