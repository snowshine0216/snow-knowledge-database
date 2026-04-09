#!/usr/bin/env bash
# Test suite for scripts/health.sh
# Usage: bash scripts/health.test.sh
# Fixture-based: creates a temp wiki in $TMPDIR, runs health.sh against it.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HEALTH="$SCRIPT_DIR/health.sh"
PASS=0
FAIL=0

# ── helpers ──────────────────────────────────────────────────────────────────

make_wiki() {
  local root="$1"
  mkdir -p "$root/wiki/concepts" "$root/wiki/tools" "$root/wiki/workflows" "$root/raw"
}

make_frontmatter() {
  printf -- '---\ntags: [test, wiki]\nsource: https://example.com\n---\n'
}

make_article() {
  local path="$1"
  { make_frontmatter; echo; echo "# Title"; echo; echo "Body paragraph."; } > "$path"
}

make_index_row() {
  local file="$1" title="${2:-Title}" tags="${3:-test}" summary="${4:-A summary.}"
  echo "| [$title]($file) | $tags | $summary |"
}

make_clean_index() {
  local root="$1"; shift   # remaining args: relative wiki paths like "concepts/foo.md"
  {
    printf -- '---\ntags: [index]\nsource: internal\n---\n# Wiki Index\n\n'
    echo "| File | Tags | One-line summary |"
    echo "|------|------|-----------------|"
    for f in "$@"; do
      local base
      base=$(basename "$f" .md | sed 's/-/ /g')
      make_index_row "$f" "$base"
    done
  } > "$root/wiki/_index.md"
}

run_health() {
  local root="$1"; shift
  (cd "$root" && bash "$HEALTH" "$@" 2>&1) || true
}

run_health_exit() {
  local root="$1"; shift
  (cd "$root" && bash "$HEALTH" "$@" 2>&1); echo "EXIT:$?"
}

assert_pass() {
  local name="$1" root="$2"; shift 2
  local out exit_code
  out=$(run_health_exit "$root" "$@")
  exit_code=$(echo "$out" | grep "EXIT:" | sed 's/EXIT://')
  if [ "$exit_code" = "0" ]; then
    echo "[PASS] $name"
    PASS=$((PASS + 1))
  else
    echo "[FAIL] $name — expected exit 0, got $exit_code"
    echo "  Output: $(echo "$out" | head -10)"
    FAIL=$((FAIL + 1))
  fi
}

assert_fail() {
  local name="$1" root="$2"; shift 2
  local out exit_code
  out=$(run_health_exit "$root" "$@")
  exit_code=$(echo "$out" | grep "EXIT:" | sed 's/EXIT://')
  if [ "$exit_code" = "1" ]; then
    echo "[PASS] $name"
    PASS=$((PASS + 1))
  else
    echo "[FAIL] $name — expected exit 1, got $exit_code"
    echo "  Output: $(echo "$out" | head -10)"
    FAIL=$((FAIL + 1))
  fi
}

assert_contains() {
  local name="$1" root="$2" needle="$3"; shift 3
  local out
  out=$(run_health "$root" "$@")
  if echo "$out" | grep -qF "$needle"; then
    echo "[PASS] $name"
    PASS=$((PASS + 1))
  else
    echo "[FAIL] $name — expected output to contain: $needle"
    echo "  Output: $(echo "$out" | head -15)"
    FAIL=$((FAIL + 1))
  fi
}

assert_not_contains() {
  local name="$1" root="$2" needle="$3"; shift 3
  local out
  out=$(run_health "$root" "$@")
  if ! echo "$out" | grep -qF "$needle"; then
    echo "[PASS] $name"
    PASS=$((PASS + 1))
  else
    echo "[FAIL] $name — expected output NOT to contain: $needle"
    echo "  Output: $(echo "$out" | head -15)"
    FAIL=$((FAIL + 1))
  fi
}

# ── scenario 1: clean wiki ────────────────────────────────────────────────────

T=$(mktemp -d); trap "rm -rf $T" EXIT

setup_clean() {
  local root="$1"
  make_wiki "$root"
  make_article "$root/wiki/concepts/foo.md"
  make_article "$root/wiki/tools/bar.md"
  make_clean_index "$root" "concepts/foo.md" "tools/bar.md"
  echo "0" > "$root/wiki/.link-baseline"
}

T=$(mktemp -d)
setup_clean "$T"
assert_pass "Scenario 1: clean wiki exits 0" "$T"
assert_not_contains "Scenario 1: no FAIL on clean wiki" "$T" "[FAIL]"
rm -rf "$T"

# ── scenario 2: stale index entry ────────────────────────────────────────────

T=$(mktemp -d)
make_wiki "$T"
make_article "$T/wiki/concepts/real.md"
{
  printf -- '---\ntags: [index]\nsource: internal\n---\n# Wiki Index\n\n'
  echo "| File | Tags | One-line summary |"
  echo "|------|------|-----------------|"
  make_index_row "concepts/real.md" "real"
  make_index_row "concepts/missing.md" "missing"
} > "$T/wiki/_index.md"
echo "0" > "$T/wiki/.link-baseline"
assert_fail "Scenario 2: stale index entry exits 1" "$T"
assert_contains "Scenario 2: mentions missing file" "$T" "missing.md"
rm -rf "$T"

# ── scenario 3: missing index row ────────────────────────────────────────────

T=$(mktemp -d)
make_wiki "$T"
make_article "$T/wiki/concepts/foo.md"
make_article "$T/wiki/tools/unindexed.md"
make_clean_index "$T" "concepts/foo.md"   # unindexed.md not in index
echo "0" > "$T/wiki/.link-baseline"
assert_fail "Scenario 3: missing index row exits 1" "$T"
assert_contains "Scenario 3: mentions unindexed file" "$T" "unindexed.md"
rm -rf "$T"

# ── scenario 4: missing index row --fix ──────────────────────────────────────

T=$(mktemp -d)
make_wiki "$T"
make_article "$T/wiki/concepts/foo.md"
make_article "$T/wiki/tools/new-tool.md"
make_clean_index "$T" "concepts/foo.md"
echo "0" > "$T/wiki/.link-baseline"
(cd "$T" && bash "$HEALTH" --fix 2>&1) || true
if grep -q "new-tool.md" "$T/wiki/_index.md"; then
  echo "[PASS] Scenario 4: --fix adds missing row"
  PASS=$((PASS + 1))
else
  echo "[FAIL] Scenario 4: --fix did not add new-tool.md to _index.md"
  FAIL=$((FAIL + 1))
fi
# idempotency: run --fix again, row should not be duplicated
(cd "$T" && bash "$HEALTH" --fix 2>&1) || true
COUNT=$(grep -c "new-tool.md" "$T/wiki/_index.md" 2>/dev/null || echo "0")
if [ "$COUNT" = "1" ]; then
  echo "[PASS] Scenario 4: --fix is idempotent (no duplicate rows)"
  PASS=$((PASS + 1))
else
  echo "[FAIL] Scenario 4: --fix duplicated new-tool.md row ($COUNT occurrences)"
  FAIL=$((FAIL + 1))
fi
rm -rf "$T"

# ── scenario 5: orphaned raw file (WARN, not FAIL) ───────────────────────────

T=$(mktemp -d)
make_wiki "$T"
make_article "$T/wiki/concepts/foo.md"
make_clean_index "$T" "concepts/foo.md"
echo "0" > "$T/wiki/.link-baseline"
printf -- '---\ntags: [test]\nsource: https://example.com\n---\n\nRaw pending.\n' > "$T/raw/pending.md"
assert_pass "Scenario 5: orphaned raw is WARN (exit 0)" "$T"
assert_contains "Scenario 5: WARN for orphaned raw" "$T" "[WARN]"
assert_contains "Scenario 5: mentions pending.md" "$T" "pending.md"
rm -rf "$T"

# ── scenario 6: broken wikilink ──────────────────────────────────────────────

T=$(mktemp -d)
make_wiki "$T"
{ make_frontmatter; echo; echo "# Foo"; echo; echo "See [[nonexistent-article]] here."; } > "$T/wiki/concepts/foo.md"
make_clean_index "$T" "concepts/foo.md"
echo "0" > "$T/wiki/.link-baseline"
assert_fail "Scenario 6: broken wikilink exits 1" "$T"
assert_contains "Scenario 6: mentions broken target" "$T" "nonexistent-article"
rm -rf "$T"

# ── scenario 7: space-containing wikilink resolves correctly ─────────────────

T=$(mktemp -d)
make_wiki "$T"
{ make_frontmatter; echo; echo "# Target"; echo; echo "Body."; } > "$T/wiki/concepts/diffusion-models.md"
{ make_frontmatter; echo; echo "# Linker"; echo; echo "See [[diffusion models]] for details."; } > "$T/wiki/concepts/linker.md"
make_clean_index "$T" "concepts/diffusion-models.md" "concepts/linker.md"
echo "0" > "$T/wiki/.link-baseline"
assert_pass "Scenario 7: space wikilink resolves to hyphenated file (exit 0)" "$T"
assert_not_contains "Scenario 7: no false positive for space link" "$T" "[FAIL]"
rm -rf "$T"

# ── scenario 8: multi-wikilink line (greedy regex regression) ────────────────

T=$(mktemp -d)
make_wiki "$T"
make_article "$T/wiki/concepts/foo.md"
make_article "$T/wiki/concepts/bar.md"
{ make_frontmatter; echo; echo "# Linker"; echo; echo "See [[foo]] and [[bar]] for details."; } > "$T/wiki/concepts/linker.md"
make_clean_index "$T" "concepts/foo.md" "concepts/bar.md" "concepts/linker.md"
echo "0" > "$T/wiki/.link-baseline"
assert_pass "Scenario 8: multi-wikilink line no false positive (exit 0)" "$T"
assert_not_contains "Scenario 8: no FAIL for valid multi-wikilink line" "$T" "[FAIL]"
rm -rf "$T"

# ── scenario 9: bad frontmatter — missing tags ────────────────────────────────

T=$(mktemp -d)
make_wiki "$T"
{ printf -- '---\nsource: https://example.com\n---\n\n# No Tags\n\nBody.\n'; } > "$T/wiki/concepts/notags.md"
make_clean_index "$T" "concepts/notags.md"
echo "0" > "$T/wiki/.link-baseline"
assert_fail "Scenario 9: missing tags exits 1" "$T"
assert_contains "Scenario 9: mentions notags.md" "$T" "notags.md"
rm -rf "$T"

# ── scenario 10: bad frontmatter — tags not array ────────────────────────────

T=$(mktemp -d)
make_wiki "$T"
{ printf -- '---\ntags: foo\nsource: https://example.com\n---\n\n# String Tags\n\nBody.\n'; } > "$T/wiki/concepts/stringtags.md"
make_clean_index "$T" "concepts/stringtags.md"
echo "0" > "$T/wiki/.link-baseline"
assert_fail "Scenario 10: tags not array exits 1" "$T"
rm -rf "$T"

# ── scenario 11: bad frontmatter — missing source ────────────────────────────

T=$(mktemp -d)
make_wiki "$T"
{ printf -- '---\ntags: [test]\n---\n\n# No Source\n\nBody.\n'; } > "$T/wiki/concepts/nosource.md"
make_clean_index "$T" "concepts/nosource.md"
echo "0" > "$T/wiki/.link-baseline"
assert_fail "Scenario 11: missing source exits 1" "$T"
rm -rf "$T"

# ── scenario 12: link-baseline drift (WARN) ──────────────────────────────────

T=$(mktemp -d)
make_wiki "$T"
# wiki has 0 links, baseline is 200
make_article "$T/wiki/concepts/foo.md"
make_clean_index "$T" "concepts/foo.md"
echo "200" > "$T/wiki/.link-baseline"
assert_pass "Scenario 12: link drift is WARN (exit 0)" "$T"
assert_contains "Scenario 12: WARN for link drift" "$T" "[WARN]"
assert_contains "Scenario 12: mentions baseline" "$T" "baseline"
rm -rf "$T"

# ── scenario 13: link-baseline drift --fix (count >= baseline) ───────────────

T=$(mktemp -d)
make_wiki "$T"
{ make_frontmatter; echo; echo "# Foo"; echo; echo "See [[bar]]."; } > "$T/wiki/concepts/foo.md"
make_article "$T/wiki/concepts/bar.md"
make_clean_index "$T" "concepts/foo.md" "concepts/bar.md"
echo "0" > "$T/wiki/.link-baseline"   # current=1, baseline=0, count > baseline
(cd "$T" && bash "$HEALTH" --fix 2>&1) || true
BASELINE_VAL=$(cat "$T/wiki/.link-baseline")
if [ "$BASELINE_VAL" = "1" ]; then
  echo "[PASS] Scenario 13: --fix updates .link-baseline when count >= baseline"
  PASS=$((PASS + 1))
else
  echo "[FAIL] Scenario 13: expected .link-baseline=1, got $BASELINE_VAL"
  FAIL=$((FAIL + 1))
fi
rm -rf "$T"

# ── scenario 14: link-baseline --fix no-op when count < baseline ─────────────

T=$(mktemp -d)
make_wiki "$T"
make_article "$T/wiki/concepts/foo.md"
make_clean_index "$T" "concepts/foo.md"
echo "200" > "$T/wiki/.link-baseline"  # current=0, baseline=200 — don't update
(cd "$T" && bash "$HEALTH" --fix 2>&1) || true
BASELINE_VAL=$(cat "$T/wiki/.link-baseline")
if [ "$BASELINE_VAL" = "200" ]; then
  echo "[PASS] Scenario 14: --fix does not update .link-baseline when count < baseline"
  PASS=$((PASS + 1))
else
  echo "[FAIL] Scenario 14: expected .link-baseline=200 (no-op), got $BASELINE_VAL"
  FAIL=$((FAIL + 1))
fi
rm -rf "$T"

# ── scenario 15: duplicate slug ───────────────────────────────────────────────

T=$(mktemp -d)
make_wiki "$T"
make_article "$T/wiki/concepts/tool.md"
make_article "$T/wiki/tools/tool.md"
make_clean_index "$T" "concepts/tool.md" "tools/tool.md"
echo "0" > "$T/wiki/.link-baseline"
assert_fail "Scenario 15: duplicate slug exits 1" "$T"
assert_contains "Scenario 15: mentions duplicate slug" "$T" "tool"
rm -rf "$T"

# ── scenario 16: empty file (frontmatter only) ────────────────────────────────

T=$(mktemp -d)
make_wiki "$T"
printf -- '---\ntags: [test]\nsource: https://example.com\n---\n' > "$T/wiki/concepts/empty.md"
make_clean_index "$T" "concepts/empty.md"
echo "0" > "$T/wiki/.link-baseline"
assert_fail "Scenario 16: empty file (frontmatter only) exits 1" "$T"
assert_contains "Scenario 16: mentions empty.md" "$T" "empty.md"
rm -rf "$T"

# ── scenario 17: --json is valid JSON ────────────────────────────────────────

T=$(mktemp -d)
setup_clean "$T"
JSON_OUT=$(cd "$T" && bash "$HEALTH" --json 2>&1) || true
if echo "$JSON_OUT" | python3 -m json.tool > /dev/null 2>&1; then
  echo "[PASS] Scenario 17: --json output is valid JSON"
  PASS=$((PASS + 1))
else
  echo "[FAIL] Scenario 17: --json output is not valid JSON"
  echo "  Output: $(echo "$JSON_OUT" | head -10)"
  FAIL=$((FAIL + 1))
fi
rm -rf "$T"

# ── scenario 18: --json contains all 8 check keys ────────────────────────────

T=$(mktemp -d)
setup_clean "$T"
JSON_OUT=$(cd "$T" && bash "$HEALTH" --json 2>&1) || true
ALL_KEYS=1
for key in index_integrity orphaned_raw broken_wikilinks frontmatter link_baseline duplicate_slugs empty_files; do
  if ! echo "$JSON_OUT" | grep -q "\"$key\""; then
    echo "[FAIL] Scenario 18: --json missing key: $key"
    FAIL=$((FAIL + 1))
    ALL_KEYS=0
  fi
done
if [ "$ALL_KEYS" = "1" ]; then
  echo "[PASS] Scenario 18: --json contains all 7 check keys"
  PASS=$((PASS + 1))
fi
rm -rf "$T"

# ── scenario 19: FAIL + WARN combination ─────────────────────────────────────

T=$(mktemp -d)
make_wiki "$T"
{ make_frontmatter; echo; echo "# Foo"; echo; echo "See [[nowhere]]."; } > "$T/wiki/concepts/foo.md"
make_clean_index "$T" "concepts/foo.md"
echo "0" > "$T/wiki/.link-baseline"
printf -- '---\ntags: [test]\nsource: https://example.com\n---\n\nRaw file.\n' > "$T/raw/orphan.md"
OUT=$(run_health_exit "$T")
EXIT_CODE=$(echo "$OUT" | grep "EXIT:" | sed 's/EXIT://')
HAS_FAIL=$(echo "$OUT" | grep -c "\[FAIL\]" 2>/dev/null || echo "0")
HAS_WARN=$(echo "$OUT" | grep -c "\[WARN\]" 2>/dev/null || echo "0")
if [ "$EXIT_CODE" = "1" ] && [ "$HAS_FAIL" -gt 0 ] && [ "$HAS_WARN" -gt 0 ]; then
  echo "[PASS] Scenario 19: FAIL+WARN combination: exit 1, both present"
  PASS=$((PASS + 1))
else
  echo "[FAIL] Scenario 19: exit=$EXIT_CODE, FAILs=$HAS_FAIL, WARNs=$HAS_WARN"
  FAIL=$((FAIL + 1))
fi
rm -rf "$T"

# ── scenario 20: WARN only → exit 0 ──────────────────────────────────────────

T=$(mktemp -d)
make_wiki "$T"
make_article "$T/wiki/concepts/foo.md"
make_clean_index "$T" "concepts/foo.md"
echo "0" > "$T/wiki/.link-baseline"
printf -- '---\ntags: [test]\nsource: https://example.com\n---\n\nRaw only.\n' > "$T/raw/orphan.md"
assert_pass "Scenario 20: WARN only exits 0" "$T"
assert_contains "Scenario 20: WARN present" "$T" "[WARN]"
assert_not_contains "Scenario 20: no FAIL" "$T" "[FAIL]"
rm -rf "$T"

# ── edge: empty wiki directory ────────────────────────────────────────────────

T=$(mktemp -d)
mkdir -p "$T/wiki/concepts" "$T/wiki/tools" "$T/wiki/workflows"
{
  printf -- '---\ntags: [index]\nsource: internal\n---\n# Wiki Index\n\n'
  echo "| File | Tags | One-line summary |"
  echo "|------|------|-----------------|"
} > "$T/wiki/_index.md"
assert_pass "Edge: empty wiki exits 0 gracefully" "$T"
rm -rf "$T"

# ── edge: wiki/ missing → exit 0 ─────────────────────────────────────────────

T=$(mktemp -d)
(cd "$T" && bash "$HEALTH" 2>&1); EC=$?
if [ "$EC" = "0" ]; then
  echo "[PASS] Edge: missing wiki/ exits 0 gracefully"
  PASS=$((PASS + 1))
else
  echo "[FAIL] Edge: missing wiki/ exited $EC (expected 0)"
  FAIL=$((FAIL + 1))
fi
rm -rf "$T"

# ── edge: .link-baseline missing → skip baseline check ───────────────────────

T=$(mktemp -d)
make_wiki "$T"
make_article "$T/wiki/concepts/foo.md"
make_clean_index "$T" "concepts/foo.md"
# no .link-baseline file
assert_pass "Edge: missing .link-baseline skips check (exit 0)" "$T"
assert_contains "Edge: .link-baseline missing note" "$T" "link-baseline"
rm -rf "$T"

# ── results ──────────────────────────────────────────────────────────────────

echo ""
echo "================================"
echo "Results: $PASS passed, $FAIL failed"
echo "================================"
[ "$FAIL" = "0" ] && exit 0 || exit 1
