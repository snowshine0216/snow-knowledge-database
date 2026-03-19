# Tech Notes

## 2026-03-19

- [Anthropic Dispatch / OpenClaw Notes](anthropic-dispatch-openclaw-notes.md)
- Video: `https://www.youtube.com/watch?v=1_VlT1vhN04`
- Tooling: `yt-video-summarizer` workflow with direct `yt-dlp` cookie-authenticated metadata/subtitle extraction
- Transcript source: `auto subtitles` (`en`)
- Highlights: remote Claude desktop control via phone, security and product limitations, and the video's `OpenClaw` framing.

## 2026-03-17

- [YouTube Obsidian Video Summary (yt-dlp + ASR)](obsidian-usage.md)
- Video: `https://www.youtube.com/watch?v=IlNOhNeWGgY&t=32s`
- Extractor: `yt-video-summarizer` with `--asr-provider auto --focus-sections "image,phone,export,knowledge_graph"`
- Transcript source: `asr-faster-whisper` (`faster-whisper:tiny`)
- Highlights: metadata extraction, full summary, detailed section notes, and auto-generated section digest artifacts (`focused_section_digest.json/.md`).

- [Claude Code Skills Agentic OS - Detailed How-To Notes](claude-code-agentic-os-howto.md)
- Video: `https://www.youtube.com/watch?v=5AfSB0sWihw`
- Extractor: `yt-video-summarizer` with subtitle extraction (`subtitle-vtt`)
- Transcript source: `subtitle-vtt` (`zh-Hans`), cookie retry used
- Highlights: architecture breakdown, workflow timeline, and implementation-focused "how-to" guide for shared context, memory, self-maintenance, and skill orchestration.
