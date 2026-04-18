# Encrypted-Video-Capture Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `encrypted-video-capture` into a script-driven orchestrator, move lesson-summary format spec into `content-summarizer`, fix 6 output-quality gaps (pre-test placement, answer guide, rich prose, progress.md live updates, `/tmp` → `./tmp`, **module subfoldering**), and regenerate the 8 existing RAG lessons + finish the remaining 64 via subagents.

**Architecture:**
- Stage scripts under `scripts/stage-*.sh`, driven by `scripts/orchestrator.sh`. `SKILL.md` shrinks from 739 lines to a ~120-line declarative wrapper: describes stages + env vars + error table, delegates all bash to scripts.
- Lesson-format authority moves to `content-summarizer`'s `template-lecture-text.md` (upgraded from 50 lines to a full pedagogical spec with pre-test/outline/rich-prose/post-test+answer-guide contract).
- Per-lecture summarization is delegated to a general-purpose subagent invoked by `scripts/stage-04-summarize.sh`, which reads the template and the transcript, then writes both `courses/<course>/<module>/` and `wiki/courses/<course>/<module>/` copies + flips the progress.md row live.
- **Module subfoldering:** each lesson's module is parsed from `progress.md` (which already groups lessons under `## Module N — Title` headings during Stage 02 enumeration). Files save into `courses/<course>/<module-slug>/<idx>-<slug>.md` instead of flat `courses/<course>/<idx>-<slug>.md`. Same for `wiki/courses/` and the wiki `_index.md` link table. Wikilinks in `progress.md` are module-prefixed (e.g. `[[module-1-rag-fundamentals/001-intro]]`).

**Tech Stack:** bash (orchestrator + stages), Python 3 (progress.md updater, regex-safe row flip), jq (progress.json mutations), yt-dlp + faster-whisper (unchanged), Claude Agent tool (subagent dispatch).

---

## File Structure

**Created:**
- `.claude/skills/encrypted-video-capture/scripts/lib/paths.sh` — resolves `EVC_TMP`, `REPO_ROOT`, `COURSE_NAME` → exports shared vars
- `.claude/skills/encrypted-video-capture/scripts/lib/progress.sh` — `mark_status <idx> <status>` (updates `.progress.json`) + `update_progress_md <idx> <course_dir> <progress_json>` (flips table row + refreshes counts + rewrites wikilinks to module-prefixed form) + `resolve_module_slug <idx> <progress_md_path>` (parses `## Module N — Title` headings to find which module owns a given idx, returns kebab-case slug like `module-1-rag-fundamentals`)
- `.claude/skills/encrypted-video-capture/scripts/lib/subagent.sh` — `dispatch_writeup <idx> <transcript_path> <lesson_json> <course_name>` — prints a structured JSON envelope the orchestrator's caller parses to invoke the Agent tool
- `.claude/skills/encrypted-video-capture/scripts/stage-00-validate.sh` — URL validation (adapter resolution)
- `.claude/skills/encrypted-video-capture/scripts/stage-01-setup.sh` — env loading, lock file, preflight, cookie export, `$EVC_TMP` init
- `.claude/skills/encrypted-video-capture/scripts/stage-02-enumerate.sh` — Playwright enumeration + `.progress.json` seeding + human `progress.md` seeding
- `.claude/skills/encrypted-video-capture/scripts/stage-03-capture.sh` — per-lecture capture: yt-dlp probe → BlackHole fallback → ASR (takes single `IDX` arg)
- `.claude/skills/encrypted-video-capture/scripts/stage-04-prepare-writeup.sh` — per-lecture summary prep: reads transcript, converts T→S Chinese if needed, emits subagent-dispatch JSON envelope to stdout (takes single `IDX` arg)
- `.claude/skills/encrypted-video-capture/scripts/stage-05-finalize.sh` — Obsidian `_index.md` update + wiki backfill
- `.claude/skills/encrypted-video-capture/scripts/orchestrator.sh` — top-level driver; parses `--dry-run` / `--resume` / positional course URL; sequences stages 00→05; for stage 03+04, loops over lectures
- `.claude/skills/encrypted-video-capture/scripts/tests/test_progress_md.sh` — tests progress.md row flip + counts refresh
- `.claude/skills/encrypted-video-capture/scripts/tests/test_paths.sh` — tests `EVC_TMP` resolution in git repo vs. non-repo cwd

**Modified:**
- `.claude/skills/encrypted-video-capture/SKILL.md` — shrink from 739 → ~120 lines. Keep: URL patterns, prerequisites, env var reference, error table. Replace all bash with one-line references to stage scripts + an orchestrator invocation example.
- `.claude/skills/content-summarizer/references/template-lecture-text.md` — expand from 50 → ~150 lines. Add the full fine-tuning-course-style format contract: frontmatter, Pre-test (top), main heading + Source line, Outline, 3–6 rich-prose content sections, Post-test, collapsible `<details>` Answer Guide. Document forbidden patterns + length targets.
- `.claude/skills/content-summarizer/SKILL.md` — add a `Subagent Invocation Protocol` section explaining that `lecture-text` writeups from long courses should be dispatched to a general-purpose subagent with the template inlined in the prompt.

**Regenerated (via subagent, using new template + module subfoldering):**
- `courses/retrieval-augmented-generation/module-1-rag-fundamentals/001-a-conversation-with-andrew-ng.md`
- `courses/retrieval-augmented-generation/module-1-rag-fundamentals/002-module-1-introduction.md`
- `courses/retrieval-augmented-generation/module-1-rag-fundamentals/003-introduction-to-rag.md`
- `courses/retrieval-augmented-generation/module-1-rag-fundamentals/005-rag-architecture-overview.md`
- `courses/retrieval-augmented-generation/module-1-rag-fundamentals/009-introduction-to-information-retrieval.md`
- `courses/retrieval-augmented-generation/module-4-llms-prompt-engineering/041-module-4-introduction.md`
- `courses/retrieval-augmented-generation/module-4-llms-prompt-engineering/055-module-4-conclusion.md`
- `courses/retrieval-augmented-generation/module-5-production-rag/070-module-5-conclusion.md`
- `wiki/courses/retrieval-augmented-generation/<same 8 files under same module subfolders>` — identical copies
- The old flat-path files at `courses/retrieval-augmented-generation/NNN-*.md` and `wiki/courses/retrieval-augmented-generation/NNN-*.md` are DELETED as part of the regeneration to avoid duplicates.

**Archived (out of repo, into `./tmp/evc/`):**
- All per-session artifacts (audio, cookies, readiness markers, streaming transcripts, ASR outputs)

---

## Task 1: Upgrade the lecture-text template (content-summarizer)

**Files:**
- Modify: `.claude/skills/content-summarizer/references/template-lecture-text.md`

- [ ] **Step 1: Read the reference target (fine-tuning-course lesson 004)**

Run: `cat courses/fine-tuning-large-language-models/004-instruction-finetuning.md`
Expected: see pre-test at top, rich prose sections, post-test with collapsible Answer Guide.

- [ ] **Step 2: Replace template-lecture-text.md with the full spec**

Write the complete template file. It MUST include these labeled sections:
1. "Why this template exists" (priming, Feynman test, prose-over-bullets rationale)
2. "Required Structure (EXACT ORDER)" — numbered 1–8 covering frontmatter, pre-test, heading, source line, outline, content sections, post-test, answer guide — each with a rendered example
3. "Forbidden Patterns" — bulleted list (pre-test at bottom, no answer guide, bullet-only sections, markdown links instead of wikilinks, transcript verbatim, truncating)
4. "Length Targets" — table with per-section word counts (pre-test ~70, outline ~50, content 800–1500, post-test ~80, answer guide ~200)
5. "Wikilinks Usage" — examples of `[[IDX-slug]]` for intra-course links
6. "Example" — point to `courses/fine-tuning-large-language-models/004-instruction-finetuning.md`

No placeholders. Every `<section>` must have a rendered fenced example the subagent can copy structure from.

- [ ] **Step 3: Verify the template matches the reference**

Run: `diff <(grep -E "^##|^###" .claude/skills/content-summarizer/references/template-lecture-text.md) <(grep -E "^##|^###" courses/fine-tuning-large-language-models/004-instruction-finetuning.md)`
Expected: the top-level structure (Pre-test → main heading → Source → Outline → content sections → Post-test → Answer Guide) matches; deeper headings may differ.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/content-summarizer/references/template-lecture-text.md
git commit -m "content-summarizer: upgrade lecture-text template to full pedagogical spec

- Pre-test at top (priming), post-test + collapsible Answer Guide at bottom
- Rich-prose content sections (3-6), 800-1500 words per lesson
- Explicit forbidden patterns + length targets
- Reference: courses/fine-tuning-large-language-models/004-instruction-finetuning.md"
```

---

## Task 2: Add subagent-invocation protocol to content-summarizer

**Files:**
- Modify: `.claude/skills/content-summarizer/SKILL.md`

- [ ] **Step 1: Add a new section at the end of SKILL.md**

Append before the final format-templates listing:

```markdown
## Subagent Invocation Protocol (for long-form course captures)

When called from `encrypted-video-capture` to process many lectures in a single session, the caller dispatches each writeup to a general-purpose subagent instead of formatting inline. The caller's responsibility:

1. Produce a JSON envelope on stdout containing: `idx`, `title`, `source_url`, `tags`, `course_name`, `transcript_path`, `simplified_chinese` (bool), `save_paths` (array of 2 paths: courses/ + wiki/courses/).
2. Pass that envelope + the full contents of `references/template-lecture-text.md` as the subagent prompt.
3. The subagent writes IDENTICAL content to both save_paths, matching the template exactly, and returns `WROTE <idx>` on success or `FAILED <idx>: <reason>` on error.

This keeps the main session's context small even when processing 72-lesson courses, and isolates template-matching failures per-lesson.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/content-summarizer/SKILL.md
git commit -m "content-summarizer: document subagent-invocation protocol for long courses"
```

---

## Task 3: Library — paths.sh

**Files:**
- Create: `.claude/skills/encrypted-video-capture/scripts/lib/paths.sh`

- [ ] **Step 1: Write the library**

```bash
#!/usr/bin/env bash
# paths.sh — resolve project-local paths for encrypted-video-capture
# Sources/exports: REPO_ROOT, EVC_TMP, SKILL_DIR
# Never use /tmp/ for EVC artifacts — macOS clears it and long transcription jobs lose data.

set -euo pipefail

# Skill directory: two levels up from this file (scripts/lib/ → skill root)
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export SKILL_DIR

# Repo root: git toplevel, else cwd (never /tmp)
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
if [ "$REPO_ROOT" = "/tmp" ] || [ "$REPO_ROOT" = "/private/tmp" ]; then
  echo "ERROR: REPO_ROOT resolved to $REPO_ROOT (system tmp). Run from the repo." >&2
  exit 1
fi
export REPO_ROOT

# Project-local tmp (overridable)
EVC_TMP="${EVC_TMP:-$REPO_ROOT/tmp/evc}"
mkdir -p "$EVC_TMP"
export EVC_TMP

# Gitignore check (warn, don't fail)
if ! grep -qE '^/?tmp/?$' "$REPO_ROOT/.gitignore" 2>/dev/null; then
  echo "WARNING: tmp/ is not in $REPO_ROOT/.gitignore — artifacts may leak into commits." >&2
fi
```

- [ ] **Step 2: Test it**

Run: `bash -c 'source .claude/skills/encrypted-video-capture/scripts/lib/paths.sh; echo "REPO_ROOT=$REPO_ROOT"; echo "EVC_TMP=$EVC_TMP"; echo "SKILL_DIR=$SKILL_DIR"; test -d "$EVC_TMP"'`
Expected: all three paths print as absolute paths; `$EVC_TMP` directory exists; no errors.

- [ ] **Step 3: Test failure case (cwd is /tmp)**

Run: `bash -c 'cd /tmp && source ~/Documents/Repository/snow-knowledge-database/.claude/skills/encrypted-video-capture/scripts/lib/paths.sh'`
Expected: exits non-zero with "ERROR: REPO_ROOT resolved to /tmp" (no silent fallthrough).

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/encrypted-video-capture/scripts/lib/paths.sh
git commit -m "evc/scripts: add paths.sh library (EVC_TMP resolution)"
```

---

## Task 4: Library — progress.sh

**Files:**
- Create: `.claude/skills/encrypted-video-capture/scripts/lib/progress.sh`
- Test: `.claude/skills/encrypted-video-capture/scripts/tests/test_progress_md.sh`

- [ ] **Step 1: Write the failing test**

Create `scripts/tests/test_progress_md.sh`:

```bash
#!/usr/bin/env bash
# Test progress.md row flip and counts refresh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$SCRIPT_DIR/lib/progress.sh"

TMPD="$(mktemp -d)"
trap 'rm -rf "$TMPD"' EXIT

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

grep -q "001-intro.*✅ done" "$TMPD/progress.md" || { echo "FAIL: 001 row not flipped"; exit 1; }
grep -q "Done:\*\* 1 / 3" "$TMPD/progress.md" || { echo "FAIL: counts not refreshed"; exit 1; }
echo "PASS: progress.md row flip + counts refresh"
```

- [ ] **Step 2: Run test (verify it fails — progress.sh doesn't exist yet)**

Run: `bash .claude/skills/encrypted-video-capture/scripts/tests/test_progress_md.sh`
Expected: FAIL with "No such file or directory: progress.sh".

- [ ] **Step 3: Write progress.sh (with module-slug resolver)**

```bash
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
# Reads progress.md, finds the nearest `## Module N — Title` heading that PRECEDES
# the row for $idx, and returns its kebab-case slug (e.g. "module-1-rag-fundamentals").
# If no module heading precedes the row, prints empty string (course has no modules).
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
        # Kebab-case: lowercase, replace non-alnum with -, collapse, strip
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
# Flips ⬜ pending → ✅ done, refreshes counts, AND rewrites wikilinks to be
# module-prefixed (e.g. [[001-intro]] → [[module-1-rag-fundamentals/001-intro]])
# if the lesson is in a module section.
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

# Walk lines, tracking current module. For the target idx row: flip status AND
# rewrite the wikilink to module-prefixed form (idempotent — skips if already prefixed).
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
        # Idempotent: only prefix if not already prefixed
        new_link = prefix + slug if "/" not in slug else slug
        line = f"{row_m.group(1)}{new_link}{row_m.group(3)} ✅ done {row_m.group(4)}"
        rows_flipped += 1
    out.append(line)
text = "\n".join(out)
if text and not text.endswith("\n"):
    text += "\n"

# Refresh counts
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
```

**Also update the test** (`scripts/tests/test_progress_md.sh`) to cover the module-slug rewrite: seed `progress.md` with a `## Module 1 — Foo Bar` heading before the idx row, call `update_progress_md 001 ...`, assert the wikilink becomes `[[module-1-foo-bar/001-intro]]` AND status is `✅ done`. Add a second test calling `resolve_module_slug 001 <progress.md>` and asserting it returns `module-1-foo-bar`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bash .claude/skills/encrypted-video-capture/scripts/tests/test_progress_md.sh`
Expected: PASS: progress.md row flip + counts refresh.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/encrypted-video-capture/scripts/lib/progress.sh \
        .claude/skills/encrypted-video-capture/scripts/tests/test_progress_md.sh
git commit -m "evc/scripts: add progress.sh library with live progress.md updates"
```

---

## Task 5: Library — subagent.sh

**Files:**
- Create: `.claude/skills/encrypted-video-capture/scripts/lib/subagent.sh`

- [ ] **Step 1: Write the library**

```bash
#!/usr/bin/env bash
# subagent.sh — emit Agent-tool dispatch envelope for a single lesson writeup
# The orchestrator's caller (Claude) reads this stdout and invokes the Agent tool.

# emit_writeup_envelope <idx> <title> <source_url> <transcript_path> <course_name> <save_path1> <save_path2> [<simplified_chinese>]
emit_writeup_envelope() {
  local idx="$1" title="$2" url="$3" tx="$4" course="$5" p1="$6" p2="$7"
  local lang="${8:-false}"
  local template="$SKILL_DIR/../content-summarizer/references/template-lecture-text.md"
  [ -f "$template" ] || { echo "ERROR: template missing: $template" >&2; return 1; }
  jq -n \
    --arg idx "$idx" --arg title "$title" --arg url "$url" \
    --arg tx "$tx" --arg course "$course" --arg p1 "$p1" --arg p2 "$p2" \
    --argjson lang "$lang" \
    --rawfile template "$template" \
    '{
      dispatch: "general-purpose",
      description: ("Write lesson " + $idx + " summary"),
      idx: $idx, title: $title, source_url: $url,
      course_name: $course, transcript_path: $tx,
      save_paths: [$p1, $p2],
      simplified_chinese: $lang,
      template: $template
    }'
}
```

- [ ] **Step 2: Test with a dry invocation**

Run: `bash -c 'source .claude/skills/encrypted-video-capture/scripts/lib/paths.sh; source .claude/skills/encrypted-video-capture/scripts/lib/subagent.sh; emit_writeup_envelope 001 "Test Title" "https://example.com" "/tmp/tx.txt" "test-course" "out1.md" "out2.md"' | jq -r '.template' | head -5`
Expected: First 5 lines of the lecture-text template print (proving the envelope carries the template content).

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/encrypted-video-capture/scripts/lib/subagent.sh
git commit -m "evc/scripts: add subagent.sh library (writeup envelope emitter)"
```

---

## Task 6: Stage script — stage-00-validate.sh

**Files:**
- Create: `.claude/skills/encrypted-video-capture/scripts/stage-00-validate.sh`

- [ ] **Step 1: Write it**

```bash
#!/usr/bin/env bash
# stage-00-validate.sh — URL validation (fast-fail before any I/O)
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/paths.sh"

URL="${1:?ERROR: usage: stage-00-validate.sh <course-url>}"
cd "$SKILL_DIR"
ADAPTER=$(node -e "
  import('./playwright/adapters/adapter-interface.mjs').then(m => {
    const a = m.resolveAdapter(process.argv[1]);
    if (!a) {
      console.error('ERROR: Unsupported URL: ' + process.argv[1]);
      console.error('Supported:');
      for (const p of m.supportedUrlPatterns()) console.error('  - ' + p);
      process.exit(1);
    }
    console.log(a.name);
  });
" -- "$URL")
echo "INFO: Adapter resolved: $ADAPTER"
echo "$ADAPTER"
```

- [ ] **Step 2: Test with valid URL**

Run: `bash .claude/skills/encrypted-video-capture/scripts/stage-00-validate.sh "https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/qq2xz/module-1-introduction"`
Expected: prints `deeplearning-ai`, exit 0.

- [ ] **Step 3: Test with invalid URL**

Run: `bash .claude/skills/encrypted-video-capture/scripts/stage-00-validate.sh "https://example.com/bogus"`
Expected: exits non-zero, prints "ERROR: Unsupported URL" + supported-patterns list.

- [ ] **Step 4: Commit**

---

## Task 7: Stage script — stage-01-setup.sh

**Files:**
- Create: `.claude/skills/encrypted-video-capture/scripts/stage-01-setup.sh`

- [ ] **Step 1: Write it**

Contents: load `.env` if present, create lock file at `$EVC_TMP/evc.lock` (not `/tmp/`), run preflight, detect BLACKHOLE_DEVICE, export cookies to `$EVC_TMP/cookies-$SESSION_ID.txt`. Set trap to clean lock on exit.

```bash
#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/paths.sh"

COURSE_URL="${1:?usage: stage-01-setup.sh <course-url>}"
SESSION_ID="${SESSION_ID:-$(date +%s)-$$}"
export SESSION_ID

[ -f "$SKILL_DIR/.env" ] && source "$SKILL_DIR/.env"

LOCK_FILE="$EVC_TMP/evc.lock"
if [ -f "$LOCK_FILE" ]; then
  STALE=$(cat "$LOCK_FILE")
  if kill -0 "$STALE" 2>/dev/null; then
    echo "ERROR: PID $STALE still running" >&2; exit 1
  fi
  rm -f "$LOCK_FILE"
fi
echo "$$" > "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT INT TERM

bash "$SKILL_DIR/scripts/preflight.sh" || exit 1

if [ -z "${BLACKHOLE_DEVICE:-}" ]; then
  BLACKHOLE_DEVICE=$(ffmpeg -f avfoundation -list_devices true -i "" 2>&1 \
    | grep -i "BlackHole" | grep -oE '\[[0-9]+\]' | grep -oE '[0-9]+' | head -1)
fi
echo "BLACKHOLE_DEVICE=$BLACKHOLE_DEVICE"

COOKIE_FILE="$EVC_TMP/cookies-${SESSION_ID}.txt"
touch "$COOKIE_FILE"; chmod 600 "$COOKIE_FILE"
yt-dlp --cookies-from-browser "${DEFAULT_BROWSER:-chrome}" --cookies "$COOKIE_FILE" \
  --skip-download "$COURSE_URL" 2>/dev/null || echo "WARN: cookie export failed (may be OK for public courses)"
echo "COOKIE_FILE=$COOKIE_FILE"
echo "SESSION_ID=$SESSION_ID"
```

- [ ] **Step 2: Test (dry)**

Run: `bash .claude/skills/encrypted-video-capture/scripts/stage-01-setup.sh "https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/qq2xz/module-1-introduction"`
Expected: prints `BLACKHOLE_DEVICE=<n>`, `COOKIE_FILE=./tmp/evc/cookies-*.txt`, `SESSION_ID=<stamp>`. Lock file exists during run, removed after.

- [ ] **Step 3: Commit**

---

## Task 8: Stage script — stage-02-enumerate.sh

**Files:**
- Create: `.claude/skills/encrypted-video-capture/scripts/stage-02-enumerate.sh`

- [ ] **Step 1: Write it**

Invokes `playwright/runner.mjs --action enumerate`, derives `COURSE_NAME`, seeds `.progress.json` (schemaVersion 2), seeds human `progress.md` with per-module tables using the fine-tuning-course style (`| NNN | [[<module-slug>/<lesson-slug>]] | ⬜ pending |`), and `wiki/courses/<COURSE_NAME>/_index.md` with module-prefixed wikilinks.

Full contents per the existing SKILL.md §4, §6, §8a — extracted verbatim, refactored to use `$EVC_TMP` + `$COOKIE_FILE` env, PLUS module-subfoldering logic:

**Module detection:** the Playwright adapter's enumerate output includes `module_title` per lesson (or parse lesson-title prefixes like "Module N introduction" / "Module N conclusion" as fallback). Group consecutive lessons with the same `module_title` under one `## Module N — Title` heading in `progress.md`. Kebab-case the module title for the folder slug.

**Module folder creation:** after enumeration, for every distinct module slug, create both:
- `${OUTPUT_DIR}/${COURSE_NAME}/<module-slug>/`
- `wiki/courses/${COURSE_NAME}/<module-slug>/`

So module folders exist before any lesson writeup attempts to save into them.

**Progress.md wikilinks:** seed rows with module-prefixed wikilinks from the start (`[[module-1-rag-fundamentals/001-a-conversation-with-andrew-ng]]`), not flat. If a lesson has no module (rare — e.g. standalone intro/conclusion lessons outside any module section), use a flat wikilink.

Key addition: `progress.md` must include the "Summary" block that `progress.sh:update_progress_md` knows how to refresh:

```markdown
- **Done:** 0 / N
- **Pending:** N / N
- **Failed:** 0 / N
```

- [ ] **Step 2: Test with the RAG course URL**

Run: `cd snow-knowledge-database && EVC_TMP=./tmp/evc bash .claude/skills/encrypted-video-capture/scripts/stage-02-enumerate.sh "https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/qq2xz/module-1-introduction" "./tmp/evc/cookies-test.txt"`
Expected:
- creates `courses/retrieval-augmented-generation/{progress.md,.progress.json}` + `wiki/courses/retrieval-augmented-generation/_index.md`
- creates 5 module subfolders in BOTH `courses/retrieval-augmented-generation/` AND `wiki/courses/retrieval-augmented-generation/`: `module-1-rag-fundamentals/`, `module-2-retrieval/`, `module-3-vector-databases-chunking/`, `module-4-llms-prompt-engineering/`, `module-5-production-rag/`
- progress.md wikilinks are module-prefixed, e.g. `| 001 | [[module-1-rag-fundamentals/001-a-conversation-with-andrew-ng]] | ⬜ pending |`
- prints `COURSE_NAME=retrieval-augmented-generation` + `LECTURES_ENUMERATED=72`

- [ ] **Step 3: Commit**

---

## Task 9: Stage script — stage-03-capture.sh

**Files:**
- Create: `.claude/skills/encrypted-video-capture/scripts/stage-03-capture.sh`

- [ ] **Step 1: Write it**

Takes `<IDX>` arg. Reads `.progress.json` for URL + duration. yt-dlp probe (15s timeout); if direct download works, saves to `$EVC_TMP/audio/<course>/tmp_<idx>.m4a` + runs ASR to `$EVC_TMP/audio/<course>/asr_<idx>/transcript.txt`. If yt-dlp fails, falls back to BlackHole recording + streaming ASR. Updates progress status `pending → recording → transcribing → transcribed`.

Extracted from existing SKILL.md §7c + §7d + §7d.1 + §7e + §7f, refactored to source `lib/paths.sh` + `lib/progress.sh` and emit exit code 0 on success, 2 if yt-dlp + BlackHole both fail.

- [ ] **Step 2: Test capturing lesson 003**

Run: `bash .claude/skills/encrypted-video-capture/scripts/stage-03-capture.sh 003 retrieval-augmented-generation`
Expected: `$EVC_TMP/audio/retrieval-augmented-generation/asr_003/transcript.txt` exists with >1KB. Progress status: `transcribed`.

- [ ] **Step 3: Commit**

---

## Task 10: Stage script — stage-04-prepare-writeup.sh

**Files:**
- Create: `.claude/skills/encrypted-video-capture/scripts/stage-04-prepare-writeup.sh`

- [ ] **Step 1: Write it**

Takes `<IDX> <COURSE_NAME>`. Reads transcript, checks for Chinese, runs opencc if available (or sets `simplified_chinese: true`), then calls `emit_writeup_envelope` from `lib/subagent.sh` to print the JSON dispatch envelope on stdout. The orchestrator's caller (Claude main session) reads that JSON and invokes the Agent tool.

```bash
#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/paths.sh"
source "$SCRIPT_DIR/lib/progress.sh"
source "$SCRIPT_DIR/lib/subagent.sh"

IDX="${1:?usage: stage-04-prepare-writeup.sh <idx> <course_name>}"
COURSE_NAME="${2:?usage: ... <course_name>}"
PROGRESS_FILE="${OUTPUT_DIR:-courses}/${COURSE_NAME}/.progress.json"

mark_status "$IDX" "summarizing" "$PROGRESS_FILE"

LESSON=$(jq -r ".lectures[\"$IDX\"]" "$PROGRESS_FILE")
TITLE=$(echo "$LESSON" | jq -r '.title')
URL=$(echo "$LESSON" | jq -r '.url')
SLUG=$(echo "$TITLE" | python3 -c "import sys,re; t=sys.stdin.read().strip().lower(); print(re.sub(r'[^a-z0-9]+','-',t).strip('-')[:80])")
TX_ORIG="$EVC_TMP/audio/${COURSE_NAME}/asr_${IDX}/transcript.txt"

# Chinese conversion if applicable
TX="$TX_ORIG"
SIMPLIFIED=false
if head -c 4000 "$TX_ORIG" | python3 -c "import sys,re; sys.exit(0 if re.search(r'[\u4e00-\u9fff]', sys.stdin.read()) else 1)"; then
  if command -v opencc >/dev/null 2>&1; then
    CONV="$EVC_TMP/audio/${COURSE_NAME}/asr_${IDX}/transcript-simplified.txt"
    opencc -c t2s -i "$TX_ORIG" -o "$CONV"
    TX="$CONV"
  else
    SIMPLIFIED=true
  fi
fi

# Resolve module subfolder from progress.md (empty string → save flat)
PROGRESS_MD="${OUTPUT_DIR:-courses}/${COURSE_NAME}/progress.md"
MODULE_SLUG=$(resolve_module_slug "$IDX" "$PROGRESS_MD")
if [ -n "$MODULE_SLUG" ]; then
  MODULE_PREFIX="${MODULE_SLUG}/"
  mkdir -p "${OUTPUT_DIR:-courses}/${COURSE_NAME}/${MODULE_SLUG}"
  mkdir -p "wiki/courses/${COURSE_NAME}/${MODULE_SLUG}"
else
  MODULE_PREFIX=""
fi

P1="${OUTPUT_DIR:-courses}/${COURSE_NAME}/${MODULE_PREFIX}${IDX}-${SLUG}.md"
P2="wiki/courses/${COURSE_NAME}/${MODULE_PREFIX}${IDX}-${SLUG}.md"

emit_writeup_envelope "$IDX" "$TITLE" "$URL" "$TX" "$COURSE_NAME" "$P1" "$P2" "$SIMPLIFIED"
```

- [ ] **Step 2: Test with a known-done transcript**

Run: `OUTPUT_DIR=courses bash .claude/skills/encrypted-video-capture/scripts/stage-04-prepare-writeup.sh 003 retrieval-augmented-generation | jq '.idx, .save_paths'`
Expected: prints `"003"` and save_paths array of 2 module-prefixed paths like:
```
["courses/retrieval-augmented-generation/module-1-rag-fundamentals/003-introduction-to-rag.md",
 "wiki/courses/retrieval-augmented-generation/module-1-rag-fundamentals/003-introduction-to-rag.md"]
```
The module subfolders must already exist (created by `stage-02-enumerate.sh` or on-demand by `resolve_module_slug` block above).

- [ ] **Step 3: Commit**

---

## Task 11: Stage script — stage-05-finalize.sh

**Files:**
- Create: `.claude/skills/encrypted-video-capture/scripts/stage-05-finalize.sh`

- [ ] **Step 1: Write it**

Extracts SKILL.md §8a (Obsidian index update) + §8b (wiki backfill check) verbatim, refactored into a script taking `<COURSE_NAME>` as arg, PLUS module-prefixed link rewriting:

**Obsidian `_index.md` update** — instead of flat `| [[course/filename_stem]] |`, use `| [[course/module-slug/filename_stem]] |`. For each `.md` file in `${OUTPUT_DIR}/${COURSE_NAME}/<module-slug>/`, emit a row with the module prefix. Walk recursively: `find "${OUTPUT_DIR}/${COURSE_NAME}" -mindepth 2 -maxdepth 2 -name "*.md"` gives module-subfoldered lessons; `find "${OUTPUT_DIR}/${COURSE_NAME}" -maxdepth 1 -name "*.md" -not -name "progress.md"` catches any flat lessons (no module).

**Wiki `_index.md` update** — rewrite the per-lesson link table in `wiki/courses/${COURSE_NAME}/_index.md` so every link is module-prefixed. The "Modules" section at the top of that file (with `[[Module 1 — Title]]` pointing to module headings) stays as-is. Example row:
```
| 001 | [[module-1-rag-fundamentals/001-a-conversation-with-andrew-ng\|A conversation with Andrew Ng]] | ⬜ |
```

**Wiki backfill** — iterate with `find ... -mindepth 2 -maxdepth 2 -name "*.md"` to cover module subfolders.

- [ ] **Step 2: Test**

Run: `OUTPUT_DIR=courses bash .claude/skills/encrypted-video-capture/scripts/stage-05-finalize.sh retrieval-augmented-generation`
Expected:
- `courses/_index.md` has 72 rows, each with `[[retrieval-augmented-generation/module-N-...../NNN-...]]` module-prefixed wikilink
- `wiki/courses/retrieval-augmented-generation/_index.md` lesson table is updated with module-prefixed links
- prints `[wiki-skip]` for lessons already compiled

- [ ] **Step 3: Commit**

---

## Task 12: orchestrator.sh

**Files:**
- Create: `.claude/skills/encrypted-video-capture/scripts/orchestrator.sh`

- [ ] **Step 1: Write it**

```bash
#!/usr/bin/env bash
# orchestrator.sh — drive encrypted-video-capture pipeline
# Usage: orchestrator.sh <course-url> [--dry-run] [--resume]
# Emits writeup-dispatch JSON envelopes on stdout for the caller (Claude session) to invoke Agent tool.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/paths.sh"

COURSE_URL="${1:?usage: orchestrator.sh <url> [--dry-run] [--resume]}"
shift
DRY_RUN=false; RESUME=false
for arg; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --resume)  RESUME=true ;;
    *) echo "ERROR: unknown arg: $arg" >&2; exit 1 ;;
  esac
done

# Stage 00: validate
ADAPTER=$(bash "$SCRIPT_DIR/stage-00-validate.sh" "$COURSE_URL")

# Stage 01: setup (exports SESSION_ID, COOKIE_FILE, BLACKHOLE_DEVICE)
eval "$(bash "$SCRIPT_DIR/stage-01-setup.sh" "$COURSE_URL" | grep -E '^(SESSION_ID|COOKIE_FILE|BLACKHOLE_DEVICE)=')"
export SESSION_ID COOKIE_FILE BLACKHOLE_DEVICE

# Stage 02: enumerate
eval "$(bash "$SCRIPT_DIR/stage-02-enumerate.sh" "$COURSE_URL" "$COOKIE_FILE" | grep -E '^(COURSE_NAME|LECTURES_ENUMERATED)=')"
export COURSE_NAME
PROGRESS_FILE="${OUTPUT_DIR:-courses}/${COURSE_NAME}/.progress.json"

if $DRY_RUN; then
  echo "Dry-run complete. $LECTURES_ENUMERATED lectures enumerated to $PROGRESS_FILE."
  exit 0
fi

# Stage 03 + 04 per lecture
for IDX in $(jq -r '.lectures | keys[]' "$PROGRESS_FILE" | sort); do
  STATUS=$(jq -r ".lectures[\"$IDX\"].status" "$PROGRESS_FILE")
  if $RESUME && [ "$STATUS" = "done" ]; then
    echo "  [skip] $IDX done"
    continue
  fi

  bash "$SCRIPT_DIR/stage-03-capture.sh" "$IDX" "$COURSE_NAME" || {
    echo "  [fail] $IDX capture failed"
    continue
  }

  # Emit writeup envelope — orchestrator caller invokes Agent tool + waits
  echo "DISPATCH_WRITEUP $IDX"
  bash "$SCRIPT_DIR/stage-04-prepare-writeup.sh" "$IDX" "$COURSE_NAME"
  echo "END_DISPATCH_WRITEUP $IDX"
  # Caller inspects the dispatch envelope, runs Agent, then calls:
  #   scripts/lib/progress.sh mark_status done
  #   scripts/lib/progress.sh update_progress_md
done

# Stage 05: finalize
bash "$SCRIPT_DIR/stage-05-finalize.sh" "$COURSE_NAME"
echo "Course complete: $COURSE_NAME"
```

- [ ] **Step 2: Test with --dry-run**

Run: `bash .claude/skills/encrypted-video-capture/scripts/orchestrator.sh "https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/qq2xz/module-1-introduction" --dry-run`
Expected: stages 00-02 run, prints `Dry-run complete. 72 lectures enumerated.`, exit 0.

- [ ] **Step 3: Make all stages executable**

Run: `chmod +x .claude/skills/encrypted-video-capture/scripts/*.sh .claude/skills/encrypted-video-capture/scripts/lib/*.sh`

- [ ] **Step 4: Commit**

---

## Task 13: Shrink SKILL.md to declarative wrapper

**Files:**
- Modify: `.claude/skills/encrypted-video-capture/SKILL.md`

- [ ] **Step 1: Rewrite SKILL.md from ~739 lines to ~120 lines**

The new SKILL.md only contains:

1. Frontmatter (unchanged)
2. 1-sentence purpose + usage line (unchanged)
3. Supported URLs list (unchanged)
4. Prerequisites — 1 line: "Run `./scripts/preflight.sh` first."
5. Environment Variables — table only (name, default, purpose)
6. Orchestration — 1 section; enumerate the stages; point at `scripts/orchestrator.sh`:

```markdown
## Orchestration

This skill delegates to `scripts/orchestrator.sh`, which drives 6 stages:

| Stage | Script | Purpose |
|------|--------|---------|
| 00   | `stage-00-validate.sh <url>` | Resolve URL to an adapter |
| 01   | `stage-01-setup.sh <url>` | Preflight, lock, cookies, BlackHole detect |
| 02   | `stage-02-enumerate.sh <url> <cookies>` | Enumerate lectures → `.progress.json` + `progress.md` |
| 03   | `stage-03-capture.sh <idx> <course>` | yt-dlp probe → BlackHole → ASR |
| 04   | `stage-04-prepare-writeup.sh <idx> <course>` | Emit subagent-dispatch envelope |
| 05   | `stage-05-finalize.sh <course>` | Obsidian index + wiki backfill |

### Subagent Dispatch (per lecture)

When the orchestrator emits `DISPATCH_WRITEUP <idx>` followed by a JSON envelope, the calling Claude session MUST:
1. Parse the JSON envelope (from stdout between `DISPATCH_WRITEUP <idx>` and `END_DISPATCH_WRITEUP <idx>`)
2. Invoke the `Agent` tool with `subagent_type: "general-purpose"` and a prompt constructed from:
   - `template` field (full `template-lecture-text.md` content)
   - Lesson metadata (`idx`, `title`, `source_url`, `course_name`)
   - `transcript_path` (absolute path to read)
   - `save_paths` (2 paths: courses/ + wiki/courses/ — write IDENTICAL content to both)
   - `simplified_chinese` flag (if true, instruct the agent to output in Simplified Chinese)
3. After the subagent returns `WROTE <idx>`, call:
   - `source scripts/lib/progress.sh; mark_status "$idx" done`
   - `source scripts/lib/progress.sh; update_progress_md "$idx" courses/<course>/progress.md courses/<course>/.progress.json`
```

7. Error Reference — table (unchanged structure; update paths to `$EVC_TMP/` throughout)

Delete all embedded bash blocks. The skill becomes ~120 lines of declarative reference.

- [ ] **Step 2: Verify line count**

Run: `wc -l .claude/skills/encrypted-video-capture/SKILL.md`
Expected: ≤150 lines (target ~120).

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/encrypted-video-capture/SKILL.md
git commit -m "evc: slim SKILL.md from 739→~120 lines, delegate to orchestrator.sh

Was: monolithic skill with all bash inline.
Now: declarative wrapper over scripts/orchestrator.sh with 6 stages.
Subagent dispatch protocol documented for per-lecture writeups."
```

---

## Task 14: Regenerate the 8 existing RAG lesson files via subagents

**Files:**
- Modify (overwrite): 8 files in `courses/retrieval-augmented-generation/` and matching files in `wiki/courses/retrieval-augmented-generation/`

Each regeneration is an independent subagent dispatch. Use `superpowers:dispatching-parallel-agents` to run up to 4 in parallel.

- [ ] **Step 1: Ensure transcripts are preserved**

The 8 existing .md files each contain the transcript embedded in the old "Overview" section. The subagent can extract source info (URL, title) from the frontmatter, but needs the transcript. Since the original `/tmp/evc-audio/` was wiped, we need to re-download audio for these 8 lessons first.

Run: `bash scripts/stage-03-capture.sh 001 retrieval-augmented-generation` (and 002, 003, 005, 009, 041, 055, 070).
Expected: `$EVC_TMP/audio/retrieval-augmented-generation/asr_XXX/transcript.txt` exists for each.

- [ ] **Step 2: Delete the old flat-path files before regeneration**

The 8 files currently live at `courses/retrieval-augmented-generation/NNN-*.md` (flat) and `wiki/courses/retrieval-augmented-generation/NNN-*.md` (flat). They must be removed so the new module-subfoldered versions don't collide/duplicate.

Run:
```bash
rm courses/retrieval-augmented-generation/001-a-conversation-with-andrew-ng.md \
   courses/retrieval-augmented-generation/002-module-1-introduction.md \
   courses/retrieval-augmented-generation/003-introduction-to-rag.md \
   courses/retrieval-augmented-generation/005-rag-architecture-overview.md \
   courses/retrieval-augmented-generation/009-introduction-to-information-retrieval.md \
   courses/retrieval-augmented-generation/041-module-4-introduction.md \
   courses/retrieval-augmented-generation/055-module-4-conclusion.md \
   courses/retrieval-augmented-generation/070-module-5-conclusion.md
rm wiki/courses/retrieval-augmented-generation/001-a-conversation-with-andrew-ng.md \
   wiki/courses/retrieval-augmented-generation/002-module-1-introduction.md \
   wiki/courses/retrieval-augmented-generation/003-introduction-to-rag.md \
   wiki/courses/retrieval-augmented-generation/005-rag-architecture-overview.md \
   wiki/courses/retrieval-augmented-generation/009-introduction-to-information-retrieval.md \
   wiki/courses/retrieval-augmented-generation/041-module-4-introduction.md \
   wiki/courses/retrieval-augmented-generation/055-module-4-conclusion.md \
   wiki/courses/retrieval-augmented-generation/070-module-5-conclusion.md
```

Expected: `git status` shows 16 deletions.

- [ ] **Step 3: Ensure module subfolders exist**

Run `stage-02-enumerate.sh` in --refresh mode (idempotent) or manually create:
```bash
for m in module-1-rag-fundamentals module-2-retrieval module-3-vector-databases-chunking module-4-llms-prompt-engineering module-5-production-rag; do
  mkdir -p courses/retrieval-augmented-generation/$m wiki/courses/retrieval-augmented-generation/$m
done
```

- [ ] **Step 4: Dispatch 4 subagents in parallel (batch 1: 001, 002, 003, 005)**

For each IDX, run `stage-04-prepare-writeup.sh` to get the envelope (which now has module-prefixed save_paths), then invoke Agent tool with:
- `subagent_type: "general-purpose"`
- `description: "Regenerate RAG lesson <idx>"`
- `prompt`: the full template + metadata + "WRITE NEW FILES at the two paths in save_paths (module-subfoldered). Read transcript at <path> and write identical content to both."

Expected: each subagent returns `WROTE <idx>`; files land at `courses/retrieval-augmented-generation/module-1-rag-fundamentals/NNN-slug.md`.

- [ ] **Step 5: Verify the regenerated 001 file is in the module folder**

Run: `test -f courses/retrieval-augmented-generation/module-1-rag-fundamentals/001-a-conversation-with-andrew-ng.md && head -20 "$_"`
Expected: file exists in module subfolder; first 5 lines are `---\ntags:...\nsource:...\n---\n\n## Pre-test`.

- [ ] **Step 6: Verify the answer guide + prose exists**

Run: `grep -A2 "summary>Answer Guide" courses/retrieval-augmented-generation/module-1-rag-fundamentals/001-a-conversation-with-andrew-ng.md`
Expected: `<details>` block with numbered answers follows.

Run: `wc -w courses/retrieval-augmented-generation/module-1-rag-fundamentals/001-a-conversation-with-andrew-ng.md`
Expected: ≥ 800 words (rich prose, not bullet outline).

- [ ] **Step 7: Dispatch batch 2 (009, 041, 055, 070)**

Same process. 009 lands in `module-1-rag-fundamentals/`, 041 + 055 in `module-4-llms-prompt-engineering/`, 070 in `module-5-production-rag/`.

- [ ] **Step 8: Verify progress.md flipped all 8 rows + counts + module-prefixed wikilinks**

Run: `grep -c "✅ done" courses/retrieval-augmented-generation/progress.md`
Expected: 8.

Run: `grep -c "module-.*-.*/001" courses/retrieval-augmented-generation/progress.md`
Expected: 1 (the 001 row is now module-prefixed).

- [ ] **Step 9: Commit**

```bash
git add courses/retrieval-augmented-generation/module-*/*.md \
        wiki/courses/retrieval-augmented-generation/module-*/*.md \
        courses/retrieval-augmented-generation/progress.md \
        courses/retrieval-augmented-generation/.progress.json
git add -u courses/retrieval-augmented-generation/*.md wiki/courses/retrieval-augmented-generation/*.md
git commit -m "rag-course: regenerate 8 lessons with pre-test+answer-guide+module subfoldering

Matches new template-lecture-text.md spec. Previous versions had:
- Pre-test buried at bottom (no priming effect)
- No collapsed answer guide (no Feynman test)
- Bullet-only outlines instead of rich prose
- Flat paths (no module grouping)

New: lessons live under courses/<course>/<module-slug>/<idx>-<slug>.md
matching the module structure captured in progress.md."
```

---

## Task 15: Resume transcription pipeline for remaining 64 lessons

**Files:** No new files — data-only task using the new orchestrator.

- [ ] **Step 1: Run orchestrator in --resume mode**

Run: `bash .claude/skills/encrypted-video-capture/scripts/orchestrator.sh "https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/qq2xz/module-1-introduction" --resume > $EVC_TMP/orchestrator.log 2>&1 &`
Expected: orchestrator starts; logs show lessons 004, 006, 007, 008, 010–040, 042–054, 056–069, 071, 072 being captured.

- [ ] **Step 2: Tail the log and process dispatch envelopes as they come in**

For each `DISPATCH_WRITEUP <idx>` / `END_DISPATCH_WRITEUP <idx>` block in the log, invoke an Agent subagent with the envelope + template. Process up to 4 in parallel using `superpowers:dispatching-parallel-agents`.

Expected: as each lesson's subagent returns, the orchestrator's next lesson starts capturing (pipelined).

- [ ] **Step 3: Verify all 72 marked done**

Run: `jq '[.lectures[] | select(.status == "done")] | length' courses/retrieval-augmented-generation/.progress.json`
Expected: `72`.

- [ ] **Step 4: Verify progress.md counts**

Run: `grep -E "^- \*\*" courses/retrieval-augmented-generation/progress.md`
Expected: `Done: 72/72`, `Pending: 0/72`, `Failed: 0/72`.

- [ ] **Step 5: Commit in batches**

After every ~10 lessons, commit:
```bash
git add courses/retrieval-augmented-generation/*.md wiki/courses/retrieval-augmented-generation/*.md \
        courses/retrieval-augmented-generation/{progress.md,.progress.json}
git commit -m "rag-course: lessons NNN-MMM (subagent-summarized)"
```

---

## Task 16: Final validation pass

**Files:** No writes — validation only.

- [ ] **Step 1: Spot-check 3 random lessons for template compliance AND module placement**

Pick 3 indices (one per expected module), verify each has:
- Correct module subfolder (017 → module-2-retrieval, 033 → module-3-vector-databases-chunking, 062 → module-5-production-rag)
- Pre-test at top
- Outline with anchor links
- 3–6 content sections with prose (not just bullets)
- Post-test
- `<details>Answer Guide</details>`
- 800+ words of content

Run: `for i in 017 033 062; do find courses/retrieval-augmented-generation -name "${i}-*.md" -exec wc -w {} \;; done`
Expected: each file exists under a module subfolder AND has ≥800 words.

Run: `for i in 017 033 062; do find courses/retrieval-augmented-generation -name "${i}-*.md" -exec dirname {} \;; done`
Expected: each dirname ends with the correct module slug (`module-2-retrieval`, `module-3-vector-databases-chunking`, `module-5-production-rag`).

- [ ] **Step 2: Verify no /tmp references remain in active artifacts**

Run: `grep -rn "/tmp/evc" .claude/skills/encrypted-video-capture/scripts/ .claude/skills/encrypted-video-capture/SKILL.md`
Expected: no matches.

- [ ] **Step 3: Verify `./tmp/` is gitignored and contains audio**

Run: `git check-ignore tmp/evc && du -sh tmp/evc/`
Expected: path ignored; tmp/evc/ has ~MBs of audio (still there from the run).

- [ ] **Step 4: Verify zero flat lesson files remain at course root**

Run: `find courses/retrieval-augmented-generation -maxdepth 1 -name "[0-9][0-9][0-9]-*.md" | wc -l`
Expected: `0` (every lesson is in a module subfolder).

Run: `find courses/retrieval-augmented-generation -mindepth 2 -maxdepth 2 -name "[0-9][0-9][0-9]-*.md" | wc -l`
Expected: `72`.

- [ ] **Step 5: Verify wiki _index.md uses module-prefixed links**

Run: `grep -c "\[\[module-" wiki/courses/retrieval-augmented-generation/_index.md`
Expected: ≥72 (one per lesson row; Modules section headings at top may or may not use module prefix depending on their format).

- [ ] **Step 6: Run orchestrator --dry-run one final time**

Run: `bash .claude/skills/encrypted-video-capture/scripts/orchestrator.sh "https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/qq2xz/module-1-introduction" --dry-run`
Expected: prints `Dry-run complete. 72 lectures enumerated.`, exit 0.

- [ ] **Step 5: Final commit**

```bash
git add docs/superpowers/plans/2026-04-19-evc-refactor.md
git commit -m "docs: archive implementation plan for evc refactor"
```

---

## Self-Review Check

**Spec coverage:**
- ✅ Enhance content-summarizer for lesson writeup → Tasks 1, 2
- ✅ SKILL.md script-driven (scripts folder + orchestrator.sh) → Tasks 3–13
- ✅ Fix pre-test placement at top → Task 1 (template), Task 14 (regen)
- ✅ Add collapsed answer guide → Task 1, Task 14
- ✅ Rich prose not outline → Task 1 (forbidden patterns), Task 14 (regen)
- ✅ Update progress.md after each lesson → Task 4 (progress.sh), Task 12 (orchestrator loop), Task 15 (resume)
- ✅ `./tmp/` not `/tmp/` → Task 3 (paths.sh), Task 13 (SKILL.md cleanup)
- ✅ Subagent per lesson writeup → Task 5 (subagent.sh), Task 12 (orchestrator dispatch protocol), Task 14, Task 15
- ✅ **Module subfoldering** → Task 4 (`resolve_module_slug` + module-prefixed wikilinks in `update_progress_md`), Task 8 (stage-02 creates module dirs + seeds module-prefixed wikilinks), Task 10 (stage-04 prepends module slug to save_paths), Task 11 (stage-05 `_index.md` uses module-prefixed links + recursive walk), Task 14 (regen into module folders + delete flat duplicates), Task 16 Steps 1/4/5 (validation asserts zero flat files + 72 module-subfoldered + wiki links prefixed)

**Placeholder scan:**
- No TBDs, no "implement later", no "similar to Task N without showing the code"
- Task 8 (`stage-02-enumerate.sh`) says "extracted verbatim from existing SKILL.md §4, §6, §8a — refactored" — this is a legitimate delta reference since the source exists; the executor can copy the blocks.

**Type consistency:**
- `mark_status` signature consistent: `mark_status <idx> <status> [<progress_file>]`
- `update_progress_md` signature consistent: `update_progress_md <idx> <md_path> <json_path>`
- `emit_writeup_envelope` 8-arg signature used identically in `stage-04-prepare-writeup.sh`
- `$EVC_TMP` paths consistent across all libs + stages
- Orchestrator `DISPATCH_WRITEUP <idx>` / `END_DISPATCH_WRITEUP <idx>` sentinels matched in Task 12 and Task 15
