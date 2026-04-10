# TODOS

## content-summarizer

**Priority:** P2 — Refactor `geektime_course_sync.py` to delegate Cornell Notes formatting to `content-summarizer`, eliminating duplicated template logic. The script currently builds markdown inline via `build_cornell_components()` + `build_markdown()` instead of calling the consolidated formatter like `yt-video-summarizer` and `medium-member-summarizer` do.

## wiki

~~**Priority:** P3 — Add a git post-commit hook (or `fswatch`-based watcher) that detects new files in `raw/` and invokes Claude Code to run the full compile pipeline. Current workflow is fully manual.~~ **Completed:** v0.1.3.0 (2026-04-10) — superseded by content-summarizer Wiki Compilation Post-Hook, which auto-compiles wiki articles after every summarization without requiring a git hook.

~~**Priority:** P3 — Add `scripts/health.sh`: wiki health check that reports stale `_index.md` entries (wiki article exists but no index row), orphaned raw files (not yet compiled), and missing backlinks. Currently at ~45 articles across 3 categories (concepts/tools/workflows).~~ **Completed:** v0.1.0.3 (2026-04-09)

**Priority:** P4 — Migrate to vector search at ~500 articles. Consider `llm-embed` + sqlite-vec or Obsidian Smart Connections. Current index-file approach works well up to ~200 articles.

~~**Priority:** P3 — Install Obsidian plugins manually: **Omnisearch** (fuzzy search + REST API at `localhost:51361`), **Dataview** (SQL queries over notes), **Templater** (frontmatter templates). Obsidian Settings → Community Plugins → Browse.~~ **Completed:** 2026-04-09

## site (wiki website — deferred from v0.1.0.0)

~~**Priority:** P2 — Deploy to Vercel. Connect repo, set root directory = `site/`, framework preset = Next.js. Git push to main → auto-deploy. (See plan step 9.)~~ **Completed:** v0.1.0.1 (2026-04-09)

~~**Priority:** P3 — Add Cmd+K overlay search (Phase 2 enhancement). Current `/search` page is sufficient at 44 articles but the overlay pattern scales better as the wiki grows.~~ **Completed:** v0.1.1.0 (2026-04-09)

~~**Priority:** P3 — Add unit tests for `lib/content.ts` (slug normalization, backlink computation) and `lib/wikilinks.ts` (pipe syntax, broken link detection). Test runner TBD (vitest recommended for Next.js).~~ **Completed:** v0.1.1.0 (2026-04-09)

**Priority:** P3 — Add `scripts/setup-hooks.sh`: one-time script that installs `scripts/health.sh` as a git pre-commit hook (symlinks or copies to `.git/hooks/pre-commit`). Useful when working across multiple machines. Depends on: `scripts/health.sh` shipped and working first.

**Priority:** P3 — Add `/api/health` endpoint at `site/app/api/health/route.ts` that shells out to `scripts/health.sh --json` and exposes wiki health as a JSON API. Enables a future dashboard page showing index integrity, broken link count, frontmatter coverage. Depends on: `scripts/health.sh --json` working correctly. Consider bundling with the P4 AI Q&A endpoint work.

**Priority:** P4 — Auto-publish pipeline: Obsidian plugin or post-commit hook that runs `scripts/compile.sh` on save, then pushes to git to trigger Vercel redeploy.

~~**Priority:** P4 — Dark mode toggle. Currently hardcoded light theme.~~ **Completed:** v0.1.1.0 (2026-04-09)

**Priority:** P4 — Knowledge graph visualization (D3.js force-directed, nodes = articles, edges = wikilinks). Deferred from Approach C.

**Priority:** P4 — AI Q&A / RAG endpoint at `site/app/api/`. Stub exists via Next.js App Router. Full implementation requires embedding pipeline + vector store.

## Completed

- Consolidated 4+ summarization skills into `content-summarizer` hub. **Completed:** v0.0.1.0 (2026-04-03)
- Deleted `course-chapter-summarizer` (superseded by `yt-video-summarizer` + `content-summarizer`). **Completed:** v0.0.1.0 (2026-04-03)
- Built Wikipedia-style wiki website (`site/`) with SSG, wikilinks, KaTeX, hover previews, FlexSearch, tag pages. **Completed:** v0.1.0.0 (2026-04-09)
