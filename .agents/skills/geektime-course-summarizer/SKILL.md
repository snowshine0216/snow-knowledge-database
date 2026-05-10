---
name: geektime-course-summarizer
description: Fetch and summarize Geektime (`time.geekbang.org`) course/article materials using browser-reused login cookies, then save chapter summaries as Markdown for review and knowledge graph ingestion. Use when a user provides Geektime article/course links and wants authenticated extraction, chapter notes, key takeaways, or course refresh materials under `courses/<english-course-name>/` (optionally grouped into chapter subfolders).
---

# Geektime Course Summarizer

## Environment Setup

Run commands from workspace root:

```bash
source .venv/bin/activate
```

Use `uv` for package management in this repo (install/sync/add), not `pip` directly.

## Workflow

1. Parse Geektime article URLs and extract article IDs.
2. Reuse browser cookies for authenticated API fetch (`serv/v1/article`).
3. Export article metadata as JSON for each chapter.
4. Invoke the `content-summarizer` skill with `content_type: "geektime-article"` for each chapter.
5. Save chapter summaries to `courses/<english-course-name>/[<chapter-subfolder>/]` via content-summarizer.

## TDD First

Before changing behavior, run tests first:

```bash
source .venv/bin/activate
python3 -m unittest .agents/skills/geektime-course-summarizer/scripts/test_geektime_course_sync.py -v
```

Then implement the smallest change and re-run the same test command.

## Quick Start

### Without chapter subfolder (flat layout)

```bash
python3 .agents/skills/geektime-course-summarizer/scripts/geektime_course_sync.py \
  --course-name-en "claude-code-engineering-practice" \
  --course-name-zh "Claude Code 工程化实战" \
  --article-url "https://time.geekbang.org/column/article/942422" \
  --output-root "courses"
```

Output:
```
metadata: courses/claude-code-engineering-practice/001-开篇词.metadata.json
Wrote: courses/claude-code-engineering-practice/README.md
```

### With chapter subfolder (multi-part course)

Use `--chapter-name-en` when a set of articles belongs to a named part/module of a larger course. This creates a subfolder `courses/<course>/<chapter>/` for metadata and summary files, and groups them under a labeled section in README.md.

```bash
python3 .agents/skills/geektime-course-summarizer/scripts/geektime_course_sync.py \
  --course-name-en "claude-code-legacy-project-transformation" \
  --course-name-zh "Claude Code 企业级老项目改造实战" \
  --chapter-name-en "chapter1-methodology-foundation" \
  --chapter-name-zh "第一部分：方法论基础" \
  --article-url "https://time.geekbang.org/column/article/974062" \
  --article-url "https://time.geekbang.org/column/article/974095" \
  --output-root "courses"
```

Output:
```
metadata: courses/claude-code-legacy-project-transformation/chapter1-methodology-foundation/001-01-老项目改造的真实链路.metadata.json
metadata: courses/claude-code-legacy-project-transformation/chapter1-methodology-foundation/002-02-Claude-Code-进来后.metadata.json
Wrote: courses/claude-code-legacy-project-transformation/README.md
```

When a later chapter set is added (e.g. `--chapter-name-en "chapter2-project-understanding"`), the script appends a new section to the existing README.md rather than overwriting it.

**Step 2 — Summarize each chapter:**

For each `metadata: <path>` line printed above, read the JSON file and invoke the
`content-summarizer` Skill with:

- `content_type`: `"geektime-article"`
- `content`: the value of the `"content"` field (plain text of the article)
- `metadata`: the full JSON object (title, source_url, article_id, chapter_title, author, course_name_en, course_name_zh, chapter_name_en, chapter_name_zh, language)
- `save_path`: `courses/<course_name_en>/[<chapter_name_en>/]<NNN>-<english-slug>.md`
  - `<NNN>` = zero-padded index from the metadata JSON filename (e.g. `001`)
  - `<english-slug>` = English translation of the article title, slugified to `[a-z0-9-]`
  - If `chapter_name_en` is set in metadata, include it as a subfolder in the path
  - ❌ Do NOT use the metadata JSON filename stem (it may be pinyin or Chinese)

Example with chapter subfolder:

```
Use the content-summarizer Skill with:
  content_type: geektime-article
  content: <article plain text from "content" field>
  metadata: <full JSON object>
  save_path: courses/claude-code-legacy-project-transformation/chapter1-methodology-foundation/001-legacy-project-handoff-and-delivery-true-workflow.md
```

## save_path derivation rule

| Condition | save_path pattern |
|---|---|
| No chapter subfolder | `courses/<course_name_en>/<NNN>-<english-slug>.md` |
| `chapter_name_en` set in metadata | `courses/<course_name_en>/<chapter_name_en>/<NNN>-<english-slug>.md` |

## Behavior Rules

- Always require or derive an English course folder name from `--course-name-en`.
- Use `--chapter-name-en` whenever the articles belong to a named part/module of a multi-part course.
- Always write one Markdown file per chapter/article in numeric order.
- Delegate all Cornell Notes formatting to content-summarizer — the extractor script only writes metadata JSON.
- Always include key takeaways and source metadata in each chapter file (enforced by content-summarizer template).
- Preserve source URL and article ID for traceability (passed in metadata JSON).
- When adding a new chapter set to an existing course, the script appends to README.md without overwriting existing chapter sections.

## Files

- Script: `scripts/geektime_course_sync.py`
- Tests: `scripts/test_geektime_course_sync.py`
- Format reference: `references/output-format.md`

## Notes

- The script reuses browser login cookies via `yt-dlp --cookies-from-browser`.
- If cookies expire, rerun; do not hardcode credentials.
- If dependencies are missing, install with `uv` while `.venv` is activated.
