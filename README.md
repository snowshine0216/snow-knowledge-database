# snow-knowledge-database

A personal knowledge repository for curated notes, references, and study materials.

## What This Repo Contains

- Topic folders for notes (for example, `essence-of-linear-algebra/`)
- Obsidian workspace configuration in `.obsidian/`
- Practical setup guides in `docs/`
- Machine setup assets in `env-setup/`

## Documentation

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

## Suggested Structure

As this knowledge base grows, keep content organized by topic:

```text
<topic>/
  README.md or index.md
  notes.md
  resources.md
```

## Usage

- Open this repository as an Obsidian vault if you use Obsidian.
- Add new notes under topic-based folders.
- Keep operational guides and tooling instructions under `docs/`.

## Contributing (Personal Workflow)

- Use clear file and folder names.
- Keep one main subject per note.
- Prefer short sections and explicit headings for scanability.
