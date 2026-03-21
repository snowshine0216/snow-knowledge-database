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
- Match summary language to the video language when detectable.
- Prefer transcript-based summarization; fall back to metadata-only summary when no transcript is available.
- If subtitles are unavailable, use ASR fallback.
Default ASR order is `faster-whisper` (local) then OpenAI API.

## Workflow

1. Validate input URL.
Use this skill for `youtube.com`, `youtu.be`, `bilibili.com`, `b23.tv`.

2. Run the extractor script.
```bash
python3 scripts/extract_video_context.py --url "<video_url>" --out-dir "/tmp/yt-video-summarizer"
```

3. If extraction fails due YouTube anti-bot checks, retry with browser cookies.
```bash
python3 scripts/extract_video_context.py --url "<video_url>" --out-dir "/tmp/yt-video-summarizer" --cookies-from-browser chrome
```

4. If no subtitles are available, allow ASR fallback (default behavior).
```bash
python3 scripts/extract_video_context.py --url "<video_url>" --out-dir "/tmp/yt-video-summarizer" --asr-provider auto
```

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
- If transcript exists, prioritize information density over stylistic rewriting.
- If transcript is missing, state that clearly and summarize from title/description/tags/chapters.
- Keep tone neutral and concise unless user requests a style.

## Platform Notes

- YouTube may block anonymous extraction with "Sign in to confirm you're not a bot".
Default retry browser is Chrome via `--cookies-from-browser chrome`.
- Bilibili extraction usually works without cookies; still use the same script for consistency.
- Local ASR fallback uses `faster-whisper` if installed.
- OpenAI ASR fallback requires `OPENAI_API_KEY` in the environment.

## Quick Example

```text
User: "Summarize this video and give me key points: https://www.youtube.com/watch?v=IlNOhNeWGgY&t=32s"
Action: run extractor script, read metadata/transcript outputs, then return the 5-section report.
```
