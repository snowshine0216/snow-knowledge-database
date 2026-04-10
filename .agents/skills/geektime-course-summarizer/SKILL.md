---
name: geektime-course-summarizer
description: Fetch and summarize Geektime (`time.geekbang.org`) course/article materials using browser-reused login cookies, then save chapter summaries as Markdown for review and knowledge graph ingestion. Use when a user provides Geektime article/course links and wants authenticated extraction, chapter notes, key takeaways, or course refresh materials under `courses/<english-course-name>/`.
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
5. Save chapter summaries to `courses/<english-course-name>/` via content-summarizer.

## TDD First

Before changing behavior, run tests first:

```bash
source .venv/bin/activate
python3 -m unittest .agents/skills/geektime-course-summarizer/scripts/test_geektime_course_sync.py -v
```

Then implement the smallest change and re-run the same test command.

## Quick Start

**Step 1 — Extract metadata:**

```bash
source .venv/bin/activate
python3 .agents/skills/geektime-course-summarizer/scripts/geektime_course_sync.py \
  --course-name-en "claude-code-engineering-practice" \
  --course-name-zh "Claude Code 工程化实战" \
  --article-url "https://time.geekbang.org/column/article/942422" \
  --output-root "courses"
```

The script prints one `metadata: <path>` line per chapter, e.g.:

```
metadata: courses/claude-code-engineering-practice/001-开篇词.metadata.json
Wrote: courses/claude-code-engineering-practice/README.md
```

**Step 2 — Summarize each chapter:**

For each `metadata: <path>` line printed above, read the JSON file and invoke the
`content-summarizer` Skill with:

- `content_type`: `"geektime-article"`
- `content`: the value of the `"content"` field (plain text of the article)
- `metadata`: the full JSON object (title, source_url, article_id, chapter_title, author, course_name_en, course_name_zh, language)
- `save_path`: `courses/<course_name_en>/<NNN>-<english-slug>.md`
  - `<NNN>` = zero-padded index from the metadata JSON filename (e.g. `001`)
  - `<english-slug>` = English translation of `chapter_title`, slugified to `[a-z0-9-]`
  - If `chapter_title` is already English, just slugify it. If Chinese, translate to English first, then slugify.
  - ❌ Do NOT use the metadata JSON filename stem (it may be pinyin or Chinese)

Example invocation pattern (same as yt-video-summarizer delegation):

```
Use the content-summarizer Skill with:
  content_type: geektime-article
  content: <article plain text from "content" field>
  metadata: <full JSON object>
  save_path: courses/claude-code-engineering-practice/001-course-introduction.md
```

## Behavior Rules

- Always require or derive an English course folder name from `--course-name-en`.
- Always write one Markdown file per chapter/article in numeric order.
- Delegate all Cornell Notes formatting to content-summarizer — the extractor script only writes metadata JSON.
- Always include key takeaways and source metadata in each chapter file (enforced by content-summarizer template).
- Preserve source URL and article ID for traceability (passed in metadata JSON).

## Files

- Script: `scripts/geektime_course_sync.py`
- Tests: `scripts/test_geektime_course_sync.py`
- Format reference: `references/output-format.md`

## Notes

- The script reuses browser login cookies via `yt-dlp --cookies-from-browser`.
- If cookies expire, rerun; do not hardcode credentials.
- If dependencies are missing, install with `uv` while `.venv` is activated.
