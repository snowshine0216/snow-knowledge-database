# Template: lecture-video

Produce a **module/chapter-based course notes file** — not a flat summary.

```markdown
---
tags: [tag1, tag2, ...]
source: <video_url>
---

# Course: <Title>

> **Instructor:** <name>
> **Duration:** <H h MM min> | **Published:** <YYYY-MM-DD>
> **Views:** <N> | **Likes:** <N>
> **Prerequisites:** <inferred from description/content>
> **Code/Links:** <repo, colab, slides — from description>

---

## Course Overview

<2–4 sentence paragraph: what is built, what you'll understand, what prior knowledge is assumed>

---

## Module N — <Thematic Title>

**Timestamps:** `HH:MM:SS – HH:MM:SS` (~N min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| N.1 | <lesson title> | H:MM:SS |
| N.2 | ... | ... |

### Key Concepts
- **<concept>**: <1–2 sentence explanation>
- ...

### Learning Objectives
- [ ] <concrete, verifiable skill the viewer gains>
- [ ] ...

---

[repeat Module section for each module]

---

## Course Summary

### The N Big Ideas

1. **<Idea>**: <1-sentence explanation>
...

### Recommended Exercises
- <exercise from video or natural follow-on>
...

---

## Source Notes

- **Transcript source:** `manual subtitles` | `auto subtitles` | `asr-faster-whisper` | `asr-openai` | `metadata-only`
- **Cookie-auth retry:** used / not used
- **Data gaps:** <none, or describe missing data>
```

## Grouping Chapters into Modules

- Use video chapters from metadata as raw input.
- Group consecutive chapters into **3–6 thematic modules** — don't create one module per chapter.
- Name each module to describe *what conceptual territory* it covers ("Building Self-Attention", not "Section 3").
- Module timestamp range = first chapter start → last chapter end in the group.
