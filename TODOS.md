# TODOS

## content-summarizer

**Priority:** P2 — Refactor `geektime_course_sync.py` to call `content-summarizer` for the Cornell Notes step, so the geektime workflow also benefits from the consolidated formatter. Currently the script writes `.md` files directly with no AI summarization step.

## wiki

**Priority:** P3 — Add a git post-commit hook that auto-triggers `scripts/compile.sh` when a new file is added to `raw/`. Currently compilation is manual (`./scripts/compile.sh raw/<file>.md`). Hook would make the workflow zero-friction.

**Priority:** P3 — Add `scripts/health.sh`: weekly wiki health check that reports stale `_index.md` entries (wiki article exists but no index row), orphaned raw files (not yet compiled), and missing backlinks.

**Priority:** P4 — Migrate to vector search at ~500 articles. Consider `llm-embed` + sqlite-vec or Obsidian Smart Connections. Current index-file approach works well up to ~200 articles.

**Priority:** P3 — Install Obsidian plugins manually: **Omnisearch** (fuzzy search + REST API at `localhost:51361`), **Dataview** (SQL queries over notes), **Templater** (frontmatter templates). Obsidian Settings → Community Plugins → Browse.

## Completed

- Consolidated 4+ summarization skills into `content-summarizer` hub. **Completed:** v0.0.1.0 (2026-04-03)
- Deleted `course-chapter-summarizer` (superseded by `yt-video-summarizer` + `content-summarizer`). **Completed:** v0.0.1.0 (2026-04-03)
