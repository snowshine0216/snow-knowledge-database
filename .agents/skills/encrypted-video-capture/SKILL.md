---
name: encrypted-video-capture
description: Use when a user provides a DRM-protected or browser-only video course URL, such as Geektime, and wants per-lecture notes generated from captured playback audio.
tags: [video-capture, asr, geektime, drm, lecture-notes]
source: internal
---

# Skill: encrypted-video-capture

Capture audio from DRM-protected video courses (Geektime, corporate training, webinar
replays), transcribe via ASR, and generate structured Markdown lecture notes — one
`.md` file per lecture.

**v2** replaces per-session throwaway loop scripts with a **persistent queue** and a
single idempotent **`resume`** entrypoint. State lives in
`<repo>/tmp/evc/<course-slug>/queue.json`, is flushed on every change, and survives
reboot, `/clear`, and new sessions. There is **one** checked-in supervisor loop; never
hand-write a loop script in `/tmp` — that anti-pattern is gone.

---

## Commands

Everything runs through `scripts/evc.py`:

```bash
# 1. Enumerate the course once → writes tmp/evc/<slug>/queue.json (+ course dirs).
python3 scripts/evc.py enumerate --url <course-url> [--speed 2.0] [--asr-provider openai]

# 2. Resume: reconcile against disk, then run the pipeline to completion.
#    Idempotent — safe to run again after a crash, reboot, or /clear.
python3 scripts/evc.py resume --course <slug>

# 3. Status: print the queue as a table any time (reads queue.json, no side effects).
python3 scripts/evc.py status [--course <slug>]
```

`enumerate` prints the derived `<slug>` and the exact `resume` command to run next.
`status` with no `--course` lists every enumerated course.

Supported URLs:
```
https://time.geekbang.org/column/<id>
https://time.geekbang.org/video/<id>
https://time.geekbang.org/course/<id>
https://u.geekbang.org/lesson/<id>
https://learn.deeplearning.ai/... (adapter present)
```

---

## The persistent queue

`tmp/evc/<slug>/queue.json` (schema 3) is the single source of truth:

```jsonc
{
  "schemaVersion": 3,
  "courseSlug": "101123301-...", "courseName": "...", "courseUrl": "...",
  "playbackSpeed": 2.0, "asrProvider": "openai", "maxRetries": 2,
  "enumeratedAt": "2026-07-07T...Z",
  "lectures": {
    "001": {
      "idx": "001", "title": "课程介绍", "titleAscii": "course-introduction",
      "url": "...", "duration": 612, "module": "module-1-intro",
      "status": "pending", "retries": 0, "reason": null, "failedFrom": null,
      "artifacts": {
        "audio":      "tmp/evc/<slug>/audio/tmp_001.wav",
        "transcript": "tmp/evc/<slug>/audio/asr_001/transcript.txt",
        "summary":    "courses/<slug>/module-1-intro/001-course-introduction.md"
      }
    }
  }
}
```

Artifact paths are repo-relative so the queue stays valid across reboots and worktrees.
`playbackSpeed` and `asrProvider` are per-course overrides (defaults from `.env`).

---

## State machine

Each lecture advances through:

```
pending → recording → recorded → transcribing → transcribed → summarizing → done
                    ↘ ─────────────── failed ───────────────↙   (from any stage)
```

- Every transition is validated and flushed to `queue.json` immediately.
- `failed` records `reason`, `failedFrom` (the stage that failed), and increments
  `retries`. A failed lecture is retried in its own stage until `retries == maxRetries`.
- Only `record`, `transcribe`, `summarize` are stages; the queue tracks the in-flight
  status (`recording`/`transcribing`/`summarizing`) vs the settled status
  (`recorded`/`transcribed`/`done`) so a crash is always distinguishable from progress.

Pure state logic lives in `scripts/lib/queue_core.py` (no I/O) and is unit-tested by
`scripts/tests/queue_core.bats`.

---

## Resume & crash recovery (reconciliation)

`resume` first reconciles the queue against what is actually on disk, so it always
continues from the true state — never from a stale in-flight marker:

| On disk for a lecture | Reconciled to |
|-----------------------|---------------|
| summary `.md` exists | `done` |
| transcript exists (no summary) | `transcribed` |
| audio WAV exists non-empty (no transcript) | `recorded` |
| an in-flight status but **no** artifacts (crashed mid-stage) | reset to `pending` |
| `done` / retry-exhausted `failed` | left untouched |

So a machine reboot in the middle of recording lecture 012 resumes by re-recording 012,
while lectures already transcribed skip straight to summarizing. Reconciliation is pure
(`queue_core.reconcile`) and tested from hand-crafted disk facts.

---

## Supervisor pipeline (concurrency)

`resume` runs `scripts/supervisor.py`, the single course-parameterised loop. It pipelines
the three stages so different lectures occupy different stages at once — record lecture N
while transcribing N-1 and summarizing N-2:

- **record** is serial (`limit 1`) — BlackHole is one shared audio device.
- **transcribe** and **summarize** run as background subprocesses.
- The next action is chosen purely (`queue_core.select_next_actions`); the supervisor only
  launches processes and records outcomes. No per-lecture prompts.

Stage wiring (`scripts/lib/stages.py`):
- record → `scripts/record_lecture.py` → `record-audio.sh` (ffmpeg/BlackHole) + `playwright/runner.mjs` (CDP playback)
- transcribe → `yt-video-summarizer/scripts/extract_video_context.py` (OpenRouter primary, faster-whisper large-v3 fallback)
- summarize → `scripts/summarize.py` (headless OpenRouter → 简体字 note via content-summarizer's lecture template)

---

## Browser rules

- **Reuse existing profile cookies**: `stages.export_cookies` runs
  `yt-dlp --cookies-from-browser chrome` and the cookies are injected into the automation
  context. The real Chrome profile is never launched directly (that would fight the user's
  running browser / risk their session).
- **Never killed between lectures**: Chrome CDP is launched once at the start of `resume`
  and kept alive across the whole loop (`start-chrome-cdp.sh` + CDP keep-alive in
  `runner.mjs`). The tab is brought to front on each play.
- **URL validated before recording**: `resume` checks the course URL loads (guards the
  historic `/` vs `-` malformed-URL bug) and aborts before any recording if it 4xx/5xxs.
- **Crash recovery**: if CDP goes away mid-loop the supervisor relaunches Chrome
  (`ensure_chrome`); a lecture whose record subprocess fails is marked `failed` and
  re-picked once more while `retries < maxRetries`.

---

## Audio / ASR

BlackHole 2ch is **mandatory** for encrypted content and is never skipped. Audio is
written to `tmp/evc/<slug>/audio/`. Transcription uses OpenRouter as the primary path
(same pattern as `yt-video-summarizer`), with faster-whisper large-v3 as the local
fallback (`ASR_PROVIDER`). Playback speed defaults to `2.0`, per-course configurable.

---

## Output

- Meaningful lecture names: filenames are ASCII slugs (`<idx>-<title-ascii>.md`, per repo
  CLAUDE.md); the note's H1/frontmatter title is translated/transliterated by the
  summariser.
- Chinese output is Simplified (简体字).
- Summaries follow `content-summarizer` conventions and land in module subfolders under
  `courses/<slug>/`.

---

## Prerequisites

Run `./scripts/preflight.sh` first. See `references/setup-guide.md` for BlackHole +
Audio MIDI Setup steps.

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `BLACKHOLE_DEVICE` | auto-detected | avfoundation device index for BlackHole 2ch |
| `ASR_PROVIDER` | `openai` | `openai` routes to OpenRouter (primary); `faster-whisper` local fallback |
| `PLAYBACK_SPEED` | `2.0` | Browser playback speed (clamped 1.0–2.0); per-course override in queue.json |
| `OPENROUTER_API_KEY` | _(required)_ | OpenRouter key — ASR primary path + `summarize.py` |
| `OPENROUTER_SUMMARY_MODEL` | `openai/gpt-4o-mini` | Model used by `summarize.py` |
| `OPENAI_API_KEY` | _(optional)_ | Alternative ASR fallback |

Durable artifacts (queue, audio, transcripts, cookies) live under `<repo>/tmp/evc/`
(gitignored). Only transient ffmpeg/video-ended IPC flags use `/tmp` (recreated per
lecture, matching `playwright/pathConstants.mjs`).

---

## Manual summary override (optional)

The supervisor summarises headlessly so `resume` needs no per-lecture input. If you want
Claude-quality summaries instead, run `resume`, let it fill transcripts, then for any
`transcribed` lecture write the note yourself following `content-summarizer` — the lecture
is picked up as `done` on the next reconcile (its `summary` artifact now exists).

---

## Error Reference

| Error | Cause | Fix |
|-------|-------|-----|
| `ERROR: Unsupported URL: <url>` | URL matches no adapter | Use a supported URL (see above) |
| `ERROR: course URL failed to load (...)` | Malformed/expired URL | Re-check the URL; re-login in Chrome |
| `ERROR: no queue for '<slug>'` | `resume` before `enumerate` | Run `enumerate --url <course-url>` first |
| `ERROR: ffmpeg did not start within 15s` | Wrong `BLACKHOLE_DEVICE` | `ffmpeg -f avfoundation -list_devices true -i ""` |
| `ERROR: summarisation failed` | `OPENROUTER_API_KEY` unset | Set it in `.env` |
| record `failed`, retries climbing | BlackHole not the system output | System Settings → Sound → Output → Multi-Output Device |
| Chrome CDP did not become ready | Chrome not installed / port busy | Check `/tmp/evc-chrome-cdp.log`; free port 9222 |
