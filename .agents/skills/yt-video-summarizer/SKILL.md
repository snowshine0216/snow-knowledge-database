---
name: yt-video-summarizer
description: Extract metadata and summarize content from YouTube and Bilibili links using yt-dlp. Use this skill whenever a user shares a YouTube/Bilibili URL and asks for summary, key points, transcript-based notes, or video information extraction. Prefer this skill even if the user asks only for "quick summary" because it standardizes metadata extraction, transcript handling, and anti-bot recovery.
---

# YT Video Summarizer

## Overview

Use this skill to turn a single YouTube or Bilibili URL into:
- reliable metadata (title, channel/uploader, upload date, duration, metrics)
- transcript-backed summary (when subtitles are available)
- structured key takeaways and a time-based outline

Default policy:
- Process one URL per request.
- Summary language must match the original video language.
- Never hardcode output language (for example, never default to Chinese or English).
- Determine original language in this order:
  1) `metadata_summary.json` -> `original_language`
  2) `raw_metadata.json` -> `language` / `default_audio_language`
  3) transcript language as fallback only when metadata language is missing
- Prefer transcript-based summarization; fall back to metadata-only summary when no transcript is available.
- If subtitles are unavailable, use ASR fallback.
- For Bilibili, use ASR-first workflow with browser cookies: `download audio -> ASR transcript -> transcript-based summary`.
Default ASR order is `faster-whisper` (local) then OpenAI API.

Local prerequisites for ASR fallback:
- `yt-dlp` must be installed and reachable in the current shell.
- `ffmpeg` and `ffprobe` must be installed for audio extraction/conversion.
- If `faster-whisper` was installed into a project virtualenv, activate that env before running the extractor, for example `source .venv/bin/activate`.
- On the first `faster-whisper` run, the selected model (for example `tiny` or `small`) may need to be downloaded and cached locally. If the machine cannot reach the model host, ASR will fail even when `faster-whisper` is installed.
- The extractor now auto-loads `.env` from the skill folder, so provider keys can live in `.agents/skills/yt-video-summarizer/.env`.

OpenRouter setup for `--asr-provider openai`:
- Set `OPENROUTER_API_KEY` in the skill `.env`.
- Optional: set `OPENROUTER_BASE_URL` (default `https://openrouter.ai/api/v1`).
- Optional: set `OPENROUTER_TRANSCRIPTION_MODEL` (default `openai/gpt-audio-mini`).
- Optional: set `OPENROUTER_HTTP_REFERER` and `OPENROUTER_TITLE` for OpenRouter app attribution.
- Optional: set `OPENROUTER_TRANSCRIPTION_CHUNK_SECONDS` to control chunk duration for long audio (default `600`).
- Optional: set `OPENROUTER_TRANSCRIPTION_MAX_BYTES` to control when chunking starts based on raw audio size (default `12582912`).
- When `OPENROUTER_API_KEY` is present, the script will use OpenRouter instead of the native OpenAI transcription endpoint.
- Large audio files are chunked automatically for OpenRouter requests; chunk transcripts are joined into one final transcript.

## Workflow

1. Validate input URL.
Use this skill for `youtube.com`, `youtu.be`, `bilibili.com`, `b23.tv`.

2. Run the extractor script.
```bash
python3 scripts/extract_video_context.py --url "<video_url>" --out-dir "/tmp/yt-video-summarizer"
```

2a. Bilibili standard workflow (recommended default): always pass browser cookies and ASR provider.
```bash
python3 scripts/extract_video_context.py --url "<bilibili_url>" --out-dir "/tmp/yt-video-summarizer" --cookies-from-browser chrome --asr-provider auto
```

3. If extraction fails due YouTube anti-bot checks, retry with browser cookies.
```bash
python3 scripts/extract_video_context.py --url "<video_url>" --out-dir "/tmp/yt-video-summarizer" --cookies-from-browser chrome
```

4. If no subtitles are available, allow ASR fallback (default behavior for YouTube).
```bash
python3 scripts/extract_video_context.py --url "<video_url>" --out-dir "/tmp/yt-video-summarizer" --asr-provider auto
```

4a. If local ASR is installed in a virtualenv, activate it explicitly before running the extractor.
```bash
source .venv/bin/activate
python3 scripts/extract_video_context.py --url "<video_url>" --out-dir "/tmp/yt-video-summarizer" --asr-provider faster-whisper
```

4b. If `faster-whisper` reports a missing snapshot or Hub timeout, the problem is usually model download/caching rather than subtitle extraction or audio download.
- Retry after confirming outbound access to the model host.
- Consider prewarming the model with a short local transcription run.
- If local model download is impossible, report the failure clearly and fall back to `metadata-only` unless the user explicitly wants an OpenAI ASR retry.

4c. To use OpenRouter for transcription, keep the existing provider flag and configure `.env`.
```bash
python3 scripts/extract_video_context.py --url "<video_url>" --out-dir "/tmp/yt-video-summarizer" --asr-provider openai
```
- With `OPENROUTER_API_KEY` set, this path uses OpenRouter chat completions with audio input.
- Without `OPENROUTER_API_KEY`, it falls back to the native OpenAI transcription endpoint and requires `OPENAI_API_KEY`.
- For OpenRouter, long audio is split with `ffmpeg` before upload to avoid oversized single requests.

5. For chapter-targeted details (for example image/phone/export/knowledge graph), use focused extraction:
```bash
python3 scripts/extract_video_context.py --url "<video_url>" --out-dir "/tmp/yt-video-summarizer" --asr-provider auto --focus-sections "image,phone,export,knowledge_graph"
```
You can control digest size:
```bash
python3 scripts/extract_video_context.py --url "<video_url>" --out-dir "/tmp/yt-video-summarizer" --asr-provider auto --focus-sections "image,phone,export,knowledge_graph" --focus-digest-bullets 6
```

6. Read generated files:
- `metadata_summary.json` for stable metadata fields
- `metadata_summary.json` also includes `original_language`
- `transcript.txt` if subtitles were found
- `transcript.txt` may also come from ASR fallback (`asr-faster-whisper` or `asr-openai`)
- `bundle.json` for source and retry diagnostics
- `focused_sections.json` and `focused_sections.md` when `--focus-sections` is provided
- `focused_section_digest.json` and `focused_section_digest.md` for concise bullet digests per section

7. Produce the report using the exact output structure below.

8. When saving to disk, use a meaningful title-based filename (required).
- Read `recommended_summary_filename` from `metadata_summary.json`.
- Use that filename in your target folder (for example `interview-summaries/andrej-karpathy-on-code-agents-autoresearch-and-the-loopy-era-of-ai_kwSVtQ7dziU.md`).
- Never use date+id-only names like `2026-03-21_kwSVtQ7dziU.md`.

## Output Structure

Always return these sections in this order:

### Video Info
- URL
- Platform
- Title
- Original language (detected)
- Suggested summary filename (`recommended_summary_filename` from metadata when available)
- Channel/Uploader
- Upload date
- Duration
- Views / likes / comments (when available)
- Category and tags (when available)

### Key Points
- 5-10 bullets for core claims, methods, or lessons

### Timeline
- 4-8 timestamped sections when transcript timing is available
- If timestamps are unavailable, provide an "Approximate flow" list and mark it inferred

### Takeaways
- 3-5 concise, actionable conclusions

### Source Notes
- Transcript source: `manual subtitles`, `auto subtitles`, `asr-faster-whisper`, `asr-openai`, or `metadata-only`
- Mention if cookie-auth retry was used
- Mention any data gaps (missing subtitles, hidden metrics, etc.)

## Summarization Rules

- Prefer facts explicitly present in transcript or metadata.
- Do not invent claims not supported by extracted data.
- Write the full report in the original video language (unless the user explicitly asks for translation).
- If transcript exists, prioritize information density over stylistic rewriting.
- If transcript is missing, state that clearly and summarize from title/description/tags/chapters.
- Keep tone neutral and concise unless user requests a style.

## Platform Notes

- YouTube may block anonymous extraction with "Sign in to confirm you're not a bot".
Default retry browser is Chrome via `--cookies-from-browser chrome`.
- Bilibili standard policy is cookie-auth + ASR-first. Always run with `--cookies-from-browser chrome --asr-provider auto`.
- The extractor now applies cookie-auth on metadata fetch when browser cookies are provided.
- Local ASR fallback uses `faster-whisper` if installed and importable from the active Python environment.
- Bilibili videos without subtitles commonly require both `ffmpeg` and a locally cached Whisper model before transcript extraction will succeed.
- OpenAI ASR fallback requires either `OPENROUTER_API_KEY` or `OPENAI_API_KEY` in the environment.

## Quick Example

```text
User: "Summarize this video and give me key points: https://www.youtube.com/watch?v=IlNOhNeWGgY&t=32s"
Action: run extractor script, read metadata/transcript outputs, then return the 5-section report.
```
