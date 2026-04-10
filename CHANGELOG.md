# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0.1] - 2026-04-11

### Changed
- **yt-video-summarizer defaults to faster-whisper large-v3.** ASR commands now use `${ASR_PROVIDER:-faster-whisper}` and `${FASTER_WHISPER_MODEL:-large-v3}` instead of hardcoded `--asr-provider auto`, matching the `.env`-driven pattern from encrypted-video-capture. A new `.env.example` documents all configurable variables (`ASR_PROVIDER`, `FASTER_WHISPER_MODEL`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `DEFAULT_BROWSER`).

## [0.3.0.0] - 2026-04-10

### Added
- **Streaming ASR preview for encrypted-video-capture.** A new `streaming-asr.mjs` script runs in parallel with BlackHole recording, tailing the growing WAV file in 10-second chunks (320 KB at 16 kHz/mono/16-bit). Each chunk is wrapped in a minimal WAV header in-memory and sent to the ASR API, producing JSONL transcript entries with timestamps. If streaming coverage reaches 80% of the final WAV duration, the streaming transcript is used directly — skipping the batch transcription step and delivering a preview mid-lecture.
- **Playback speed control for encrypted-video-capture.** Set `PLAYBACK_SPEED=1.5` (or any value 1.0–2.0) in `.env` to record at faster than real-time. The adapter sets `video.playbackRate` after clicking play, re-pins it every 5 seconds to prevent player resets, and adjusts all wall-clock timeouts accordingly (`WALL_TIMEOUT = LECTURE_DURATION / PLAYBACK_SPEED`).
- **Obsidian `_index.md` auto-update** (Step 8a). After all lectures in a course are processed, `encrypted-video-capture` scans the output directory and appends a wikilink row per lecture to `_index.md`. Idempotent — existing rows are not duplicated.
- **Wiki backfill check** (Step 8b). After course completion, any lecture `.md` file not yet compiled to `wiki/` runs through `wiki-collision-check.sh` → `compile.sh`. Skips lectures already handled by the content-summarizer post-hook.

### Changed
- **geektime-course-summarizer delegates to content-summarizer.** The extractor script (`geektime_course_sync.py`) no longer builds Cornell Notes markdown inline. Instead it writes a `metadata_summary.json` per chapter (title, source URL, article ID, chapter title, author, course names, plain-text content, language). Claude then invokes the `content-summarizer` skill with `content_type: geektime-article` — the same delegation pattern used by `yt-video-summarizer`. This removes ~250 lines of duplicated template logic and ensures all sources produce consistent note formatting.
- **`html_to_text` and `strip_html_tags` merged** into a single `html_to_text(content, preserve_newlines=True)`. Pass `preserve_newlines=False` to get the collapsed-whitespace behavior previously only available via `strip_html_tags`.

## [0.2.2.0] - 2026-04-10

### Changed
- **Wiki reorganization: courses get their own category.** All 7 multi-chapter course directories (Karpathy Zero to Hero, 3Blue1Brown Essence of Calculus, 3Blue1Brown Essence of Linear Algebra, 3Blue1Brown Neural Networks, StatQuest Neural Networks, Claude Code Engineering, GeekTime OpenClaw Agent) moved from `wiki/concepts/` to a new `wiki/courses/` category. Standalone concept articles remain in `wiki/concepts/`. The site now surfaces courses under their own nav category.

## [0.2.1.0] - 2026-04-10

### Added
- **Auto-wiki post-hook in content-summarizer.** Summarizing a YouTube video, Medium article, or PDF now automatically produces both the detailed summary file and a wiki article. No second manual compile step needed. The post-hook runs collision detection, synthesizes a scaled wiki article, and updates `wiki/_index.md` atomically.
- **`scripts/wiki-collision-check.sh`** — deterministic bash collision detector. Takes a source URL and comma-separated tags, returns `CREATE`, `ENRICH <file>`, or `SKIP`. Primary check greps individual wiki file frontmatter for the source URL (not `_index.md`); secondary checks slug existence; tertiary checks tag overlap (≥4 non-generic shared tags). Configurable via `GENERIC_TAGS` and `ENRICH_THRESHOLD` env vars.
- **`scripts/backfill-wiki.sh`** — discovery script that scans `courses/`, `interview-summarizes/`, `tech-notes/`, `repo-analysis/`, and `sources/` for summarized files not yet compiled to `wiki/`. Prints a numbered list and per-file Claude Code instructions for batch compilation.
- **Wiki workflow documented in `CLAUDE.md`** — three new lines describing auto-compilation, collision detection, and backfill.

## [0.2.0.0] - 2026-04-10

### Added
- **`encrypted-video-capture` skill**: capture audio from DRM-protected video courses (Geektime, corporate training, webinar replays) via BlackHole + ffmpeg system audio recording. Playwright automation handles Geektime login, lecture enumeration, and 5-tier video-end detection. Transcribes each lecture via the existing ASR pipeline (faster-whisper / OpenRouter / OpenAI) and generates structured `.md` notes per lecture via content-summarizer.
- **`--audio-file` flag for `extract_video_context.py`**: pass a local WAV/audio file path to bypass yt-dlp URL fetching and call ASR directly. Enables the encrypted-video-capture pipeline to reuse the existing transcription stack without any platform-specific logic.
- **`preflight.sh`**: validates all dependencies (BlackHole 2ch, ffmpeg, Playwright, ASR provider, disk space) and runs a 2-second test recording to confirm audio capture works before the first lecture.
- **`setup-guide.md`**: numbered 8-section setup checklist covering BlackHole install, Audio MIDI multi-output configuration, macOS microphone permission, device index verification, and ASR provider setup — with a verified expected preflight output for sanity-checking.

### Changed
- `extract_video_context.py` `--url` argument is now optional when `--audio-file` is provided; passing neither exits with a clear error.

## [0.1.2.1] - 2026-04-09

### Fixed
- **Wiki category subfolders now appear on Vercel.** Articles nested inside category subdirectories (e.g. `wiki/concepts/claude-code-engineering/`, `wiki/concepts/essence-of-calculus/`) were invisible because the content loader only scanned top-level files. Replaced the flat `readdirSync` with a recursive `walkMdFiles()` walker in both `site/lib/content.ts` and `site/scripts/gen-previews.js`. Visiting `/wiki?category=concepts` now shows all ~100 articles instead of ~16.

## [0.1.2.0] - 2026-04-09

### Fixed
- **Markdown tables** now render as HTML `<table>` elements. Previously, pipe-separated table syntax (`| Column | ... |`) appeared as raw text. Added `remark-gfm` to the markdown pipeline.
- **Wiki images** (`![[filename.png]]`) now render as `<img>` elements. Previously they appeared as broken link text. The `remarkWikilinks` plugin now detects Obsidian-style image syntax and emits `<img src="/wiki-assets/{category}/{slug}/{filename}">` nodes.

### Added
- **`/wiki-assets` route handler** (`app/wiki-assets/[category]/[slug]/[file]/route.ts`): serves image files from `wiki/{category}/assets/{slug}/` with correct `Content-Type` headers, path-traversal protection, and extension allowlisting.

## [0.1.1.1] - 2026-04-09

### Added
- `scripts/health.sh`: wiki integrity validator — the third leg of the scripts/ tripod (compile writes, search reads, health validates). Eight checks: stale index entries, missing index rows, orphaned raw files, duplicate slugs, broken wikilinks, frontmatter validation, link-baseline drift, and empty files. Supports `--fix` (auto-repairs missing index rows, updates link baseline), `--json` (machine-readable output for a future /health API), and pre-commit hook mode. Runs in <3s at current scale (~44 articles).
- `scripts/health.test.sh`: fixture-based bash test suite covering all 40 scenarios including edge cases: greedy regex regression, pipe-syntax wikilinks (`[[Title|Display]]`), space-containing wikilinks, `--fix` idempotency, `--json` validity, WARN vs FAIL exit codes, and guard clauses for missing wiki/, missing _index.md, and missing .link-baseline.

### Changed
- `wiki/.link-baseline` updated to 151 (reflects actual wikilink count after wiki growth from 55 at initial measurement).
- Marked `scripts/health.sh` P3 todo as completed in TODOS.md.

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
