# Tech Notes

## 2026-03-17

- [YouTube Obsidian Video Summary (yt-dlp + ASR)](./2026-03-17-youtube-obsidian-yt-dlp-summary.md)
- Video: `https://www.youtube.com/watch?v=IlNOhNeWGgY&t=32s`
- Extractor: `yt-video-summarizer` with `--asr-provider auto --focus-sections "image,phone,export,knowledge_graph"`
- Transcript source: `asr-faster-whisper` (`faster-whisper:tiny`)
- Highlights: metadata extraction, full summary, detailed section notes, and auto-generated section digest artifacts (`focused_section_digest.json/.md`).
