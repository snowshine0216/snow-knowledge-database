# TODOS — encrypted-video-capture

## P1 (deferred from v1, required for multi-platform support)

### generic-adapter.mjs (v2)

The plan included a generic URL-list fallback adapter for platforms beyond Geektime.
Deferred from v1 scope after plan audit (user decision: ship Geektime first, validate,
then extend).

**What it needs:**
- Accept `--url <lecture-url> --duration <sec>` for arbitrary video pages
- No API enumeration — caller provides the URL + expected duration
- Same 5-tier video-end detection from `utils.mjs` (already done)
- Same ffmpeg ready-signal handshake (already done)
- Suggested file: `playwright/generic-adapter.mjs`

**Unblock condition:** Geektime adapter validated on a real course end-to-end.

---

## P2 (quality improvements)

- Playback speed control (1.5x/2x) — reduces recording time 33-50%
- Streaming ASR preview — transcription chunks appear during recording (v2 pipeline)
- Obsidian `_index.md` auto-update after course completion
- Multi-platform adapter beyond Geektime (depends on P1 above)

---

## Notes

- Shell-side IPC path constants (`/tmp/evc-ffmpeg-ready-<id>` etc.) are still
  inline in `record-audio.sh`. JS side centralized in `pathConstants.mjs` (v1).
  Unify in v2 if a shared config approach becomes available.
