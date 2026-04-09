# snow-knowledge-database

A personal knowledge repository for curated notes, references, and study materials.

## What This Repo Contains

- `raw/` — raw source intake (articles, posts, transcripts clipped with frontmatter)
- `wiki/` — LLM-compiled knowledge layer (`_index.md` master index + `concepts/`, `tools/`, `workflows/`)
- `scripts/` — CLI tools: `search.sh` (keyword search) and `compile.sh` (raw→wiki trigger)
- `_templates/` — Templater templates for consistent frontmatter on new notes
- Topic folders for notes (for example, `essence-of-linear-algebra/`)
- Obsidian workspace configuration in `.obsidian/`
- Practical setup guides in `docs/`
- Machine setup assets in `env-setup/`

## Live Site

The wiki is deployed to Vercel at **https://snow-knowledge-database.vercel.app/**

It's a Next.js 16 App Router site in `site/` — SSG-generated, auto-deploys on push to `main`. Every `wiki/` article becomes a page at `/wiki/<slug>`. Includes wikilink rendering, KaTeX math, hover previews, FlexSearch, and tag pages.

- Dark mode: follows system preference, with a manual sun/moon toggle in the header
- Cmd+K command palette: lazy-loaded FlexSearch over all wiki articles
- Typography: Geist Sans (body) + Geist Mono (code) via `next/font`

## Wiki Workflow

```bash
# Search the knowledge base
./scripts/search.sh "rag retrieval"

# Compile a raw source into the wiki
./scripts/compile.sh raw/article.md          # → follow printed Claude Code instruction
./scripts/compile.sh raw/article.md tools    # → compile to wiki/tools/
```

See [wiki/_index.md](wiki/_index.md) for the full article index.

## Documentation

- [Wiki index](wiki/_index.md) — compiled knowledge base (LLM reads this first)
- [Documentation index](docs/README.md)
- [yt-dlp setup on macOS](docs/yt-dlp-setup.md)
- [macOS environment setup](env-setup/README.md)
- [YouTube/Bilibili video summarizer](.agents/skills/yt-video-summarizer/SKILL.md)
- [Medium article summarizer](.agents/skills/medium-member-summarizer/SKILL.md)
- [Content summarizer (formatting hub)](.agents/skills/content-summarizer/SKILL.md) — shared output templates for all content types

## Environment Setup

For a full macOS setup, use the repo bootstrap script:

```bash
chmod +x env-setup/macos-setup.sh
./env-setup/macos-setup.sh
```

This installs the main toolchain used by this repo:

- `python3`
- `yt-dlp`
- `ffmpeg` and `ffprobe`
- `jq`
- `nvm` and the current Node.js LTS
- Codex CLI
- optional `faster-whisper` for local ASR in the YouTube summarizer skill

If you want to skip local ASR and rely on subtitles or API-based transcription fallback:

```bash
INSTALL_LOCAL_ASR=0 ./env-setup/macos-setup.sh
```

### Video Summarizer Env Notes

The `yt-video-summarizer` skill expects the following runtime tools to be available in your shell:

- `yt-dlp`
- `ffmpeg`
- `ffprobe`
- `python3`

If `faster-whisper` is installed into the repo virtualenv, activate it before running the extractor:

```bash
source .venv/bin/activate
python3 .agents/skills/yt-video-summarizer/scripts/extract_video_context.py --help
```

The extractor auto-loads a skill-local env file from `.agents/skills/yt-video-summarizer/.env`. Put ASR provider keys there when needed:

- `OPENROUTER_API_KEY` for OpenRouter-backed transcription
- `OPENROUTER_BASE_URL` to override the default API base URL
- `OPENROUTER_TRANSCRIPTION_MODEL` to override the default transcription model
- `OPENROUTER_HTTP_REFERER` and `OPENROUTER_TITLE` for OpenRouter attribution headers
- `OPENROUTER_TRANSCRIPTION_CHUNK_SECONDS` and `OPENROUTER_TRANSCRIPTION_MAX_BYTES` for long-audio chunking
- `OPENAI_API_KEY` if you want native OpenAI transcription fallback instead of OpenRouter

YouTube retries use `--cookies-from-browser chrome` by default, so Chrome should be installed if you want cookie-auth retry behavior out of the box.

Quick verification:

```bash
python3 --version
yt-dlp --version
ffmpeg -version
ffprobe -version
python3 .agents/skills/yt-video-summarizer/scripts/extract_video_context.py --help
```

## Structure

```text
raw/          ← intake: clip sources here (frontmatter required: tags, source)
wiki/
  _index.md   ← master index (LLM reads this first)
  concepts/   ← compiled concept articles
  tools/      ← tool notes
  workflows/  ← process descriptions
site/         ← Next.js wiki website (deployed to Vercel)
scripts/
  search.sh   ← keyword search over wiki/ + raw/
  compile.sh  ← trigger: raw → wiki compile instruction
_templates/   ← Templater templates for consistent frontmatter
<topic>/      ← existing topic folders (unchanged)
```

## Usage

- Open this repository as an Obsidian vault if you use Obsidian.
- Clip new sources to `raw/` with required frontmatter (`tags`, `source`).
- Run `./scripts/compile.sh raw/<file>.md` to compile to wiki/.
- Run `./scripts/search.sh "query"` for keyword search.
- Keep operational guides and tooling instructions under `docs/`.

## Contributing (Personal Workflow)

- Use clear file and folder names.
- Keep one main subject per note.
- Prefer short sections and explicit headings for scanability.
