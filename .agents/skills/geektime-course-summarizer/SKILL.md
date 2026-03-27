---
name: geektime-course-summarizer
description: Fetch and summarize Geektime (`time.geekbang.org`) course/article materials using browser-reused login cookies, then save chapter summaries as Markdown for review and knowledge graph ingestion. Use when a user provides Geektime article/course links and wants authenticated extraction, chapter notes, key takeaways, or course refresh materials under `courses/<english-course-name>/`.
---

# Geektime Course Summarizer

## Workflow

1. Parse Geektime article URLs and extract article IDs.
2. Reuse browser cookies for authenticated API fetch (`serv/v1/article`).
3. Convert article HTML to plain text and generate concise chapter summaries.
4. Save outputs to `courses/<english-course-name>/` with one chapter file per article.

## TDD First

Before changing behavior, run tests first:

```bash
python3 -m unittest .agents/skills/geektime-course-summarizer/scripts/test_geektime_course_sync.py -v
```

Then implement the smallest change and re-run the same test command.

## Quick Start

Run:

```bash
python3 .agents/skills/geektime-course-summarizer/scripts/geektime_course_sync.py \
  --course-name-en "claude-code-engineering-practice" \
  --course-name-zh "Claude Code 工程化实战" \
  --article-url "https://time.geekbang.org/column/article/942422" \
  --output-root "courses"
```

Expected output:

- `courses/claude-code-engineering-practice/README.md`
- `courses/claude-code-engineering-practice/001-942422.md`

## Behavior Rules

- Always require or derive an English course folder name from `--course-name-en`.
- Always write one Markdown file per chapter/article in numeric order.
- Always include key takeaways and source metadata in each chapter file.
- Preserve source URL and article ID for traceability.

## Files

- Script: `scripts/geektime_course_sync.py`
- Tests: `scripts/test_geektime_course_sync.py`
- Format reference: `references/output-format.md`

## Notes

- The script reuses browser login cookies via `yt-dlp --cookies-from-browser`.
- If cookies expire, rerun; do not hardcode credentials.
