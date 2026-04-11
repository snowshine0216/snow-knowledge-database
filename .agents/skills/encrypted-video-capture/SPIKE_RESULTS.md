# Spike Results — u.geekbang.org/lesson/{id} Adapter

Blocking spikes completed before implementation. Results documented here per the
hard gate requirement in the approved plan.

## Spike 1: yt-dlp Direct Download

**Method:** Runtime probe per-lecture in SKILL.md step 7c (already present).
**Result:** Deferred to runtime — yt-dlp `--simulate` probe runs for every lecture.
If it succeeds, yt-dlp is used and BlackHole recording is skipped.
This is the existing behavior; no architectural change needed.
**Conclusion:** Not a blocker. Pipeline handles both paths.

## Spike 2: Cookie Scope for u.geekbang.org

**Method:** User direct verification (browser session).
**Result:** CONFIRMED — cookies exported via `yt-dlp --cookies-from-browser chrome`
include entries scoped to `.geekbang.org` (parent domain), which covers both
`time.geekbang.org` and `u.geekbang.org`. No separate login or interactive
Playwright auth fallback needed.
**Conclusion:** No fallback required. Cookie export works as-is.

## Spike 3: DOM / Video Element Inspection

**Method:** User direct verification (DevTools on u.geekbang.org/lesson/818).
**Result:** CONFIRMED — standard HTML5 `<video>` element is present.
waitForVideoEnd() from utils.mjs works without modification.

DOM enumeration details (used to build geekbang-u-adapter.mjs):
- Lesson list: individual lesson items are navigated via the lesson URL directly
  (the lesson ID in the URL IS the single lesson — each u.geekbang.org/lesson/{id}
  URL represents one lesson with potentially multiple video segments)
- Course title: available in page `<title>` or `<h1>`
- Video player: standard `<video>` element, play via `.play()` or play button click

**Conclusion:** No custom end-detection needed. Standard adapter play() path works.

## Risk Disposition

| Risk | Status |
|------|--------|
| Cookies scoped to time.geekbang.org only | ELIMINATED (user confirmed) |
| Non-standard video element (canvas/iframe) | ELIMINATED (user confirmed) |
| yt-dlp direct download availability | HANDLED at runtime (per-lecture probe) |
| Virtualized lesson list | N/A — lesson URL = single lesson, no list scraping |
| API route for enumerate | N/A — DOM enumerate or direct navigation used |

## Implementation Decision

Given the above:
- `geekbang-u-adapter.mjs` `enumerate()`: navigates to the URL, extracts the lesson
  title from the page `<title>`/`<h1>`, returns a single-item lecture list.
  (u.geekbang.org/lesson/{id} is a single lesson, not a multi-lesson course listing.)
- `play()`: navigate, click play, `waitForVideoEnd()` — no localStorage clear needed.
- `course_title`: extracted from page title or `<h1>`.
