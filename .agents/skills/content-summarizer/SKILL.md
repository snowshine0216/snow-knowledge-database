---
name: content-summarizer
description: Consolidated formatting skill for all content types. Called by yt-video-summarizer, medium-member-summarizer, and geektime-course-summarizer after extraction. Receives content_type + extracted content + metadata from calling skill context. Applies the appropriate format template and writes the .md file.
---

# Content Summarizer

## Overview

This skill is invoked by extraction skills after they have gathered transcript/text and metadata.
It applies the correct format template based on `content_type` and writes the output `.md` file.

## Input (from calling skill context)

- `content_type`: `lecture-video` | `lecture-text` | `interview` | `talk` | `article` | `geektime-article`
- `content`: full transcript or article text
- `metadata`: title, source URL, date, author/channel/uploader, duration, etc.
- `save_path`: full target path including filename

## Pre-Write Check (required)

Before writing any file, run:

```bash
test -f "<save_path>"
```

If the file exists, print:

```
File already exists: <save_path> — skipping
```

Then **halt**. Do NOT proceed to write.

If `content_type` is `article` and the `sources/` directory does not exist at the repo root, create it:

```bash
mkdir -p sources
```

## Filename Convention

- **Video types** (`lecture-video`, `interview`, `talk`): use `recommended_summary_filename` from `metadata_summary.json`.
- **Article types** (`article`, `lecture-text`): `{kebab-title}_{hash8}.md` where `hash8` = first 8 chars of SHA-256 of the canonical URL. If in a course sequence, use `{NNN}-{kebab-title}.md` instead (NNN = zero-padded index).
- **geektime-article**: `{NNN}-{article-id}.md` (positional, per existing pattern).
- Filenames must be ASCII only.

## Frontmatter (all types)

```yaml
---
tags: [tag1, tag2, ...]
source: <canonical_url>
---
```

## Language Rule

Template structural labels (section headers, table column names like "Key Points", "Timeline") stay in **English**. The **content** within those sections follows the original source language. Do not translate content unless the user explicitly requests it.

---

## Format Templates

### lecture-video

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

**Grouping chapters into modules:**
- Use video chapters from metadata as raw input.
- Group consecutive chapters into **3–6 thematic modules** — don't create one module per chapter.
- Name each module to describe *what conceptual territory* it covers ("Building Self-Attention", not "Section 3").
- Module timestamp range = first chapter start → last chapter end in the group.

---

### lecture-text

Produce textbook-prose notes with inline equations and section anchors.

```markdown
---
tags: [tag1, tag2, ...]
source: <url>
---

# Chapter N: <Title>   (or # <Title> if no chapter number)

**Source:** [Title](url)

## Outline
- [Section Name](#section-anchor)
- ...

---

## Section Name

Textbook prose paragraph. Inline math: $x^2 + y^2 = r^2$.

$$
\int_a^b f(x)\,dx
$$

- $x$: variable definition
- ...

---

## Key Equations  (include for math-heavy content)

| Equation | Description |
|---|---|
| $$...$$ | ... |

## Connections  (optional: links to next/prior chapter)
```

**Rules for `lecture-text`:**
- Prose over bullets for main content — textbook style, complete sentences.
- Each equation inline with its variable legend and interpretation.
- Preserve all formulas from the source exactly — do not simplify or rewrite.
- Section anchors must match headings (lowercase, hyphens for spaces).
- `---` horizontal rules between all `##` sections.
- No "Key Takeaways" or "Essence" sections — insight belongs in the section where it appears.

---

### interview

For 2-person conversations, podcasts, and structured interviews.

```markdown
---
tags: [tag1, tag2, ...]
source: <video_url>
---

# Interview Summary: <Title>

## Video Info
- URL: <video_url>
- Platform: YouTube
- Title: <title>
- Channel/Uploader: <channel>
- Upload date: <YYYY-MM-DD>
- Duration: <H:MM:SS>
- Views / likes / comments: <N> views / <N> likes / <N> comments (at extraction time)
- Category and tags: <category>; <tags>

## Key Points
- <concrete finding or claim from the interview>
- ...

## Timeline
- <HH:MM>-<HH:MM> <topic or segment description>
- ...

## Takeaways
- <actionable insight>
- ...

## Source Notes
- Transcript source: `manual subtitles` | `auto subtitles` | `asr-faster-whisper` | `asr-openai` | `metadata-only`
- Cookie-auth retry: used / not used
- Data gaps: <none, or describe missing data>
```

---

### talk

For solo conference talks and standalone presentations (not conversational, not course modules).

```markdown
---
tags: [tag1, tag2, ...]
source: <video_url>
---

# Talk Summary: <Title>

## Speaker Info
- Name/Handle: <name>
- Event/Venue: <event or channel>
- Date: <YYYY-MM-DD>
- Duration: <H:MM:SS>

## Key Points
- <concrete finding or claim>
- ...

## Timeline
| Timestamp | Topic |
|---|---|
| 0:00 | <topic> |
| ... | ... |

## Takeaways
- <actionable insight>
- ...

## Source Notes
- Transcript source: `manual subtitles` | `auto subtitles` | `asr-faster-whisper` | `asr-openai` | `metadata-only`
- Cookie-auth retry: used / not used
- Data gaps: <none, or describe missing data>
```

---

### article

For general articles, blog posts, and news.

```markdown
---
tags: [tag1, tag2, ...]
source: <article_url>
---

# <Title>

## Article Info
- URL: <article_url>
- Title: <title>
- Author: <author>
- Publish time: <date>
- Access mode: `cookie-authenticated` | `public`

## Key Takeaways
- <concrete finding — 5-10 bullets>
- ...

## Insights
- <engineering implication or decision tradeoff — 3-6 bullets>
- ...

## Caveats
- <benchmark or methodology limits>
- <data-access limitations if extraction was partial>

## Sources
- <original article URL>
- <primary referenced sources linked inside the article>
```

---

### geektime-article

Cornell Notes format for Geektime articles and similar structured educational text.

```markdown
---
tags: [tag1, tag2, ...]
source: <article_url>
---

## Chapter Metadata
- Course: <course name>
- Chapter: <NNN> — <article title>
- Author: <author>
- Date: <YYYY-MM-DD>
- Article ID: <id>

## Cornell Notes

### Cue Column (Questions)
- <question that the notes answer>
- ...

### Notes Column
<detailed notes from the article content>

### Summary
<2–4 sentence synthesis of the chapter>

## Key Takeaways
- <concrete actionable finding>
- ...

## Knowledge Graph Seeds

**Entities:**
- (Course: <course name>)
- (Chapter: <chapter title>)
- (Author: <author>)
- (Concept: <key concept>)

**Relations:**
- (Course: <course>) -> contains -> (Chapter: <chapter>)
- (Chapter: <chapter>) -> covers -> (Concept: <concept>)

## Notes For Review
- <open questions or things to revisit>
```

---

## Rules

- All output files **must** have frontmatter with `tags` and `source` fields.
- Use `recommended_summary_filename` from metadata when available; otherwise derive per filename convention above.
- Write in the original content language unless the user requests translation.
- Do not invent facts not present in the extracted content.
- If transcript is unavailable, state that clearly and summarize from title/description/chapters/metadata only.
