# Command Recipes

## Extract metadata only

```bash
yt-dlp --dump-single-json "<video_url>" | jq '{id,title,channel,upload_date,duration_string,view_count,like_count,comment_count,categories,tags}'
```

If YouTube blocks anonymous extraction:

```bash
yt-dlp --cookies-from-browser chrome --dump-single-json "<video_url>"
```

## Download subtitles only (no media)

```bash
yt-dlp --skip-download --write-subs --write-auto-subs --sub-langs all --convert-subs vtt "<video_url>"
```

## Script-based extraction

```bash
python3 scripts/extract_video_context.py --url "<video_url>" --out-dir "/tmp/yt-video-summarizer"
```

With explicit cookie browser:

```bash
python3 scripts/extract_video_context.py --url "<video_url>" --out-dir "/tmp/yt-video-summarizer" --cookies-from-browser chrome
```

## Force ASR fallback if subtitles are unavailable

```bash
python3 scripts/extract_video_context.py --url "<video_url>" --out-dir "/tmp/yt-video-summarizer" --asr-provider auto
```

Requires:
- `faster-whisper` installed for local ASR (preferred)
- or `OPENAI_API_KEY` set in environment for OpenAI ASR

## Extract focused chapter sections

```bash
python3 scripts/extract_video_context.py \
  --url "<video_url>" \
  --out-dir "/tmp/yt-video-summarizer" \
  --asr-provider auto \
  --focus-sections "image,phone,export,knowledge_graph" \
  --focus-digest-bullets 6
```

Output artifacts:
- `focused_sections.json`
- `focused_sections.md`
- `focused_section_digest.json`
- `focused_section_digest.md`
