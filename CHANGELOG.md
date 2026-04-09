# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1.0] - 2026-04-09

### Added
- **Dark mode** with system preference detection. Toggle sun/moon icon in the header. All pages and components now use CSS custom properties so the theme switches instantly without a flash. Dark theme is on by default; light mode is available via the toggle or `prefers-color-scheme: light`.
- **Cmd+K command palette** (also Ctrl+K). Opens a full-screen overlay with instant search across all 44 articles. Lazy-loads the FlexSearch index on first open so it adds zero weight to every page load. Navigate with `↑↓`, open with `↵`, close with `Esc`.
- **Geist font** (Vercel's type system). Geist Sans replaces Georgia for body text; Geist Mono replaces the system monospace for code. Both served via `next/font` with automatic subsetting.
- **Unit test suite** (16 tests, vitest). Covers `normalize()` (5 cases including CJK passthrough), `readArticle()` (frontmatter, H1 fallback, excerpt clipping), `buildWikiIndex()` (backlink computation, slug normalization), and `remarkWikilinks` (pipe syntax, broken links → Wikipedia, CJK targets). Run with `npm test`.
- `lib/client-search.ts`: shared search module used by both the Cmd+K palette and the `/search` page. Exposes `ensureIndex()`, `clientSearch()`, and `getAllDocs()` with typed `SearchResult` interface.
- `⌘K` keyboard hint badge in the header Search nav link for discoverability.

### Changed
- Header extracted from `layout.tsx` into `components/Header.tsx` — cleaner separation and client-side-only theme logic stays out of the server layout.
- All 17 color-affected files migrated from hardcoded Tailwind gray classes and hex literals to CSS variable tokens (`--color-bg`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-accent-bg/text`, `--color-wikilink`, `--color-tag-bg/text`, `--color-surface`).
- Search index fetch in `client-search.ts` now validates HTTP status before parsing JSON; failed initializations reset the promise so the index can recover on retry.

## [0.1.0.3] - 2026-04-09

### Fixed
- Broken wikilinks (concepts not yet in the wiki, like `[[integrals]]`) now redirect to Wikipedia search instead of showing a 404 page. Links open in a new tab and display a small ↗ indicator.
- Hyphenated slug forms (e.g. `[[gradient-descent]]`) now search Wikipedia for "gradient descent" instead of the literal hyphenated string.

## [0.1.0.2] - 2026-04-09

### Changed
- Corrected P2 `content-summarizer` todo description: the issue is duplicated template logic in `geektime_course_sync.py`, not a missing summarization step.
- Clarified P3 wiki post-commit hook todo: `compile.sh` is a validation wrapper that prints Claude Code instructions and cannot be called standalone by a hook; a watcher invoking Claude Code is needed.
- Added current article count (~45 across 3 categories) to the `scripts/health.sh` todo for context.
- Marked Obsidian plugins (Omnisearch, Dataview, Templater) as completed.

## [0.1.0.1] - 2026-04-09

### Fixed
- Vercel deployment now correctly resolves to the `site/` subdirectory. Add `vercel.json` with `rootDirectory: "site"` so Vercel detects Next.js and runs `next build` from the right place instead of serving a 404.

## [0.1.0.0] - 2026-04-09

### Added
- `site/` — full Wikipedia-style wiki website built with Next.js 16 App Router, SSG-deployed to Vercel.
- 3-column layout (category nav / article body / TOC + related articles), Wikipedia-inspired visual design with `@tailwindcss/typography` and `prose max-w-[720px]`.
- `[[wikilink]]` rendering: custom remark plugin resolves wikilinks to `/wiki/<slug>`, marks broken links with red `wikilink-broken` CSS class, supports `[[target|display]]` pipe syntax.
- KaTeX math rendering via `remark-math` + `rehype-katex` for LaTeX in articles (`$...$` inline, `$$...$$` block).
- Hover preview tooltips: 250ms show delay, 150ms dismiss delay, viewport-edge collision detection, loaded from `public/preview-data.json`.
- FlexSearch client-side search at `/search` — lazy-loaded (not bundled on every page). Root layout `SearchBar` is a lightweight dumb input.
- Tag pages at `/wiki/tags/[tag]` listing all articles for a topic.
- `scripts/gen-previews.js` prebuild script generates `public/preview-data.json` before `next build`.
- `scripts/lint-content.js` broken-link baseline check — fails build if broken wikilink count exceeds `wiki/.link-baseline` (baseline: 55).
- Singleton cache in `lib/content.ts` prevents N×44 filesystem scans across SSG parallel workers.
- Slug = filename rule (never title-derived) for CJK-safe URLs (`agency-agents-zh` → `/wiki/agency-agents-zh`).
- `wiki/.link-baseline` tracking file for broken link count enforcement.

### Fixed
- ISSUE-001 (QA): Raw `$...$` LaTeX was rendering as plain text — added `remark-math` + `rehype-katex` to unified pipeline.
- ESLint: removed unused `searchParams` prop from `app/wiki/page.tsx`.

## [0.0.2.0] - 2026-04-05

### Added
- `wiki/` compiled knowledge layer: `_index.md` master index table (LLM reads first for navigation), `concepts/`, `tools/`, `workflows/` category directories.
- `scripts/search.sh`: keyword search over `wiki/` and `raw/` with ripgrep primary and macOS BSD grep fallback via `find -print0 | xargs -0`. Supports `RESULTS_PER_FILE` and `MAX_FILES` env vars. Exits 0 on no match (clean LLM tool behavior).
- `scripts/compile.sh`: manual workflow trigger that validates raw article path (POSIX-portable symlink-safe resolution), blocks category path traversal (`../`), detects output collisions, and prints Claude Code compile instruction. Supports `DEFAULT_CATEGORY` env override.
- `raw/llm-knowledge-bases-post.md`: Karpathy's LLM knowledge base workflow post saved with required frontmatter.
- `wiki/concepts/llm-knowledge-base.md`: compiled wiki article with workflow diagram, index file trick explanation, scale guide (50/200/500 article thresholds), and known failure modes.
- `_templates/raw-article.md` and `_templates/wiki-article.md`: Templater templates for consistent frontmatter on new notes.
- Wiki workflow documentation added to `CLAUDE.md`: clip → compile → search loop, wikilinks requirement, index sync reminder.

## [0.0.1.0] - 2026-04-03

### Added
- New `content-summarizer` skill: consolidated formatting hub for all content types (`lecture-video`, `lecture-text`, `interview`, `talk`, `article`, `geektime-article`). All format templates live here — one place to update when output format needs to change.
- `geektime-article` (Cornell Notes) template included in `content-summarizer` for future web-based geektime article processing.

### Changed
- `yt-video-summarizer`: replaced hardcoded output structure with a `content_type` decision tree and explicit handoff to `content-summarizer`. Callers now classify video type (interview/lecture-video/talk) before invoking the formatter.
- `medium-member-summarizer`: replaced hardcoded output structure with `content_type` detection (article vs. lecture-text) and explicit handoff to `content-summarizer`.

### Removed
- `course-chapter-summarizer`: functionality fully covered by `yt-video-summarizer` + `content-summarizer` with `content_type=lecture-video` or `lecture-text`. Zero external references confirmed before deletion.
