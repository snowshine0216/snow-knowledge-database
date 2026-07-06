# Content Ingestion SOP

One-page operator map for routing a source to the right skill and verifying it
landed correctly. For skill internals, read the skill's own `SKILL.md` —
this page does not duplicate them.

## 1. Source type -> spoke skill

| Source | Skill | Notes |
|---|---|---|
| `mp.weixin.qq.com` | `wechat-article-summarizer` | Headless Playwright bypasses the CAPTCHA gate. |
| `youtube.com` / `youtu.be` / `bilibili.com` | `yt-video-summarizer` | Bilibili is ASR-first (audio -> transcript) with browser cookies. |
| `time.geekbang.org` | `geektime-course-summarizer` | Course content defaults to dual-path save: `courses/<course>/<chapter>/...` AND `wiki/courses/...` (see content-summarizer's subagent envelope, `save_paths`). |
| Medium (incl. custom domains) | `medium-member-summarizer` | Needs browser-cookie auth for member-only articles. |
| Local PDF | `pdf-summarizer` | Chapter mode (interactive) or whole-book batch mode. |
| Book from training data (no source file) | `book-review` | Recall-only, never web search. Delegates file writing to `content-summarizer`'s `book` content_type. |

All spokes hand off extracted content + metadata to `content-summarizer`, which
applies the format template and writes the `.md` file (see its `SKILL.md`).

## 2. Invariant contract (every ingestion must satisfy)

- **Frontmatter** on every generated file: `tags: [..]` (array) and
  `source: <canonical_url>` (or `internal` for wiki-manager-indexed notes).
- **ASCII/English filenames only** — no Chinese characters or Unicode.
  Translate Chinese titles to English before slugifying; never use pinyin.
- **Raw topic folder + wiki compile + `_index.md` update**: the raw file lands
  in one of the 6 top-level topic folders (`claude/`, `agent-frameworks/`,
  `ai-engineering/`, `rag-and-knowledge/`, `dev-tools/`, `learning-and-business/`)
  chosen once and reused for both trees; `content-summarizer`'s Wiki
  Compilation Post-Hook (or `wiki-manager` for batch folders) writes the
  compiled article to `wiki/<topic>/` and adds a row to `wiki/_index.md`.
  Verify the new row exists after every compile — it is the one step that
  silently no-ops on failure (see `wiki: failed` frontmatter marker).

## 3. Environment notes (no secret values here)

- **YouTube proxy**: the extractor auto-reads `YT_PROXY` from
  `.agents/skills/yt-video-summarizer/.env` (copy `.env.example` to `.env` in
  that skill folder to set it, plus `ASR_PROVIDER` / `FASTER_WHISPER_MODEL` /
  `OPENROUTER_API_KEY`). Bilibili does not use this proxy path.
- **WeChat**: needs headless Playwright (Chromium). Already bundled in
  `.agents/skills/wechat-article-summarizer/node_modules/`; Chromium itself is
  shared from `~/Library/Caches/ms-playwright/`. Only re-run
  `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install` in that skill folder if
  `node_modules/` is missing (fresh clone).
- **GeekTime / Medium**: both reuse your logged-in Chrome session via
  `yt-dlp --cookies-from-browser chrome` — no secret file, just stay logged
  into the site in that Chrome profile. If extraction starts failing, log in
  again in Chrome and rerun; do not hardcode credentials anywhere.

## 4. Failure playbook

- **CAPTCHA / verification page (WeChat, exit code 3, `isCaptcha: true`)**:
  re-run the spoke with `WECHAT_HEADFUL=1`, solve the check in the visible
  window; the script waits up to 120s and re-extracts automatically.
- **Cookies expired (GeekTime/Medium auth failures)**: log back into the site
  in Chrome, then just re-run the spoke skill — no code change needed.
- **Killed background/batch render mid-run** (e.g. `encrypted-video-capture`
  processing a multi-lecture course): re-run with `--resume` — it skips
  lectures already marked `done` in `.progress.json` and retries `failed`
  lectures up to 2x. Safe to resume per-URL rather than restarting the batch.
- **Wiki post-hook reports `FAILED` or file has `wiki: failed`**: the detailed
  file is always preserved regardless. Search summaries for `wiki: failed`,
  re-read the file, and re-run the post-hook steps manually.
