#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$SCRIPT_DIR/lib/progress.sh"
TMPD="$(mktemp -d)"
trap 'rm -rf "$TMPD"' EXIT

# Setup: EVC_TMP needs to exist for mark_status temp files
export EVC_TMP="$TMPD"

cat > "$TMPD/.progress.json" <<'JSON'
{"schemaVersion":2,"lectures":{"001":{"status":"done"},"002":{"status":"pending"},"003":{"status":"pending"}}}
JSON

cat > "$TMPD/progress.md" <<'MD'
# Test Course

| 001 | [[001-intro]] | ⬜ pending |
| 002 | [[002-chapter]] | ⬜ pending |
| 003 | [[003-summary]] | ⬜ pending |

- **Done:** 0 / 3
- **Pending:** 3 / 3
- **Failed:** 0 / 3
MD

update_progress_md "001" "$TMPD/progress.md" "$TMPD/.progress.json"

grep -q "001-intro.*✅ done" "$TMPD/progress.md" || { echo "FAIL: 001 row not flipped to done"; exit 1; }
grep -q "Done:\*\* 1 / 3" "$TMPD/progress.md" || { echo "FAIL: counts not refreshed"; exit 1; }
echo "PASS A: progress.md row flip + counts refresh"

# New tmpdir for scenario B
TMPD2="$(mktemp -d)"
trap 'rm -rf "$TMPD2"' EXIT

export EVC_TMP="$TMPD2"

cat > "$TMPD2/.progress.json" <<'JSON'
{"schemaVersion":2,"lectures":{"001":{"status":"pending"},"002":{"status":"pending"}}}
JSON

cat > "$TMPD2/progress.md" <<'MD'
# Test Course B

## Module 1 — Foo Bar

| 001 | [[001-intro]] | ⬜ pending |

## Module 2 — Baz Qux

| 002 | [[002-chapter]] | ⬜ pending |

- **Done:** 0 / 2
- **Pending:** 2 / 2
- **Failed:** 0 / 2
MD

# Test resolve_module_slug
MODULE=$(resolve_module_slug "001" "$TMPD2/progress.md")
[ "$MODULE" = "module-1-foo-bar" ] || { echo "FAIL: resolve_module_slug returned '$MODULE' (expected 'module-1-foo-bar')"; exit 1; }
echo "PASS B1: resolve_module_slug returns correct slug"

# Test update_progress_md rewrites wikilink to module-prefixed form
update_progress_md "001" "$TMPD2/progress.md" "$TMPD2/.progress.json"
grep -q "\[\[module-1-foo-bar/001-intro\]\]" "$TMPD2/progress.md" || { echo "FAIL: wikilink not module-prefixed"; exit 1; }
grep -q "✅ done" "$TMPD2/progress.md" || { echo "FAIL: status not flipped to done"; exit 1; }
echo "PASS B2: module-prefixed wikilink rewrite works"

echo "ALL TESTS PASSED"
