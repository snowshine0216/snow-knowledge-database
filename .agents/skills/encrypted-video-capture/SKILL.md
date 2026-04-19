---
tags: [video-capture, asr, geektime, drm, lecture-notes]
source: internal
---

# Skill: encrypted-video-capture

Capture audio from DRM-protected video courses (Geektime, corporate training, webinar replays), transcribe via ASR, and generate structured Markdown lecture notes — one `.md` file per lecture.

## Usage

```
/encrypted-video-capture <course-url> [--dry-run] [--resume]
```

- `--dry-run`: enumerate lectures and print total estimated recording time; exit without recording
- `--resume`: skip lectures already marked `done` in `.progress.json`; retry `failed` up to 2×

Supported URLs:
```
https://time.geekbang.org/column/<id>
https://time.geekbang.org/video/<id>
https://time.geekbang.org/course/<id>
https://u.geekbang.org/lesson/<id>
```

---

## Prerequisites

Run `./scripts/preflight.sh` first. See `references/setup-guide.md` for BlackHole + Audio MIDI Setup steps.

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `OUTPUT_DIR` | `courses/` (relative to cwd) | Root directory for course output files |
| `ASR_PROVIDER` | `openai` | ASR backend; uses OpenRouter when `OPENROUTER_API_KEY` is set |
| `BLACKHOLE_DEVICE` | auto-detected | avfoundation device index for BlackHole 2ch; override if detection fails |
| `EVC_TMP` | `./tmp/evc` (relative to cwd) | Project-local temp dir for audio, cookies, markers (never use `/tmp/`) |
| `PLAYBACK_SPEED` | `2.0` | Browser playback speed (clamped to 1.0–2.0) |
| `DEFAULT_BROWSER` | `chrome` | Browser for `yt-dlp --cookies-from-browser` |
| `OPENROUTER_API_KEY` | _(required for OpenRouter path)_ | API key for OpenRouter transcription |
| `OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1` | OpenRouter API base URL |
| `OPENROUTER_TRANSCRIPTION_MODEL` | `openai/gpt-audio-mini` | Model used for batch ASR via OpenRouter |
| `OPENROUTER_TRANSCRIPTION_CHUNK_SECONDS` | `600` | Audio chunk size in seconds for OpenRouter ASR |
| `OPENROUTER_TRANSCRIPTION_MAX_BYTES` | `12582912` | Max bytes per chunk sent to OpenRouter |

---

## Orchestration

This skill delegates to `scripts/orchestrator.sh`, which drives 6 stages:

| Stage | Script | Purpose |
|-------|--------|---------|
| 00 | `stage-00-validate.sh <url>` | Resolve URL to an adapter |
| 01 | `stage-01-setup.sh <url>` | Preflight, lock, cookies, BlackHole detect |
| 02 | `stage-02-enumerate.sh <url> <cookies>` | Enumerate lectures → `.progress.json` + `progress.md` |
| 03 | `stage-03-capture.sh <idx> <course>` | yt-dlp probe → BlackHole → ASR |
| 04 | `stage-04-prepare-writeup.sh <idx> <course>` | Emit subagent-dispatch envelope |
| 05 | `stage-05-finalize.sh <course>` | Obsidian index + wiki backfill |

### Subagent Dispatch (per lecture)

When the orchestrator emits `DISPATCH_WRITEUP <idx>` followed by a JSON envelope, the calling Claude session MUST:
1. Parse the JSON envelope (from stdout between `DISPATCH_WRITEUP <idx>` and `END_DISPATCH_WRITEUP <idx>`)
2. Invoke the `Agent` tool with `subagent_type: "general-purpose"` and a prompt constructed from:
   - `template` field (full `template-lecture-text.md` content)
   - Lesson metadata (`idx`, `title`, `source_url`, `course_name`)
   - `transcript_path` (absolute path to read)
   - `save_paths` (2 paths: courses/ + wiki/courses/ — write IDENTICAL content to both)
   - `simplified_chinese` flag (if true, instruct the agent to output in Simplified Chinese)
3. After the subagent returns `WROTE <idx>`, call:
   - `source scripts/lib/progress.sh; mark_status "$idx" done`
   - `source scripts/lib/progress.sh; update_progress_md "$idx" courses/<course>/progress.md courses/<course>/.progress.json`

---

## Error Reference

| Error | Cause | Fix |
|-------|-------|-----|
| `ERROR: Unsupported URL: <url>` | URL does not match any registered adapter | Use a supported URL format (see Supported URLs above) |
| `ERROR: Another session is running (PID N)` | Lock file with live PID | Wait or kill the PID and delete `$EVC_TMP/encrypted-video-capture.lock` |
| `ERROR: BlackHole device not found` | BlackHole not installed or multi-output not configured | Follow setup-guide.md §1–3 |
| `ERROR: No lectures found at <URL>` | Adapter returned empty list or auth failed | Re-login to the platform in Chrome, retry |
| `ERROR: ffmpeg did not start recording within 15s` | Wrong BLACKHOLE_DEVICE index | Verify with `ffmpeg -f avfoundation -list_devices true -i ""` |
| `ERROR: ASR transcription failed` | `OPENROUTER_API_KEY` not set or network error | Set `OPENROUTER_API_KEY` in `.env`; mirrors yt-video-summarizer OpenRouter setup |
| `INFO: opencc not found` | opencc not installed | `pip install opencc-python-reimplemented` or `brew install opencc`; content-summarizer hint used as fallback |
| `WARNING: >80% silence` | Multi-Output Device not selected as system output | System Settings → Sound → Output → Multi-Output Device |
| `ERROR: .progress.json has schemaVersion 'X'` | Stale or unrecognized schema (v1 is auto-migrated; others are fatal) | Delete `.progress.json` to start fresh |
| `ERROR: courseUrl is not set` | First loop.py run on a v1-migrated file without `--url` | Run `python3 courses/<name>/evc-loop.py --url <course-url>` |
| `WARNING: Cookie export failed` | Chrome not running or yt-dlp not in PATH | Start Chrome, then retry |
