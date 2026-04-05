# Template: interview

For 2-person conversations, podcasts, and structured interviews.

```markdown
---
tags: [tag1, tag2, ...]
source: <video_url>
---

# <Title>

## Video Info
- URL: <video_url>
- Platform: YouTube | Bilibili | Podcast
- Title: <title>
- Channel/Uploader: <channel>
- Upload date: <YYYY-MM-DD>
- Duration: <H:MM:SS>
- Views / likes / comments: <N> views / <N> likes / <N> comments (at extraction time)
- Category and tags: <category>; <tags>

## Executive Summary
3–5 sentences: who is talking, the core thesis or arc of the conversation, and the
most important conclusion. Write it so a reader can decide in 15 seconds whether
to read further.

## Outline
Numbered list of every major topic/chapter in the interview, preserving
chronological flow. Each entry: number + topic title + one-sentence description.

1. **<Topic Title>** — <one-sentence description>
2. **<Topic Title>** — <one-sentence description>
...

## Detailed Chapter Summaries

### 1. <Topic Title>
> **Segment**: <HH:MM>-<HH:MM> (or [SN] anchor if ASR-based)

Structured summary of this chapter/segment. Include:
- The core argument or question being explored
- Key claims, anecdotes, data points
- Sub-topics as `####` headings when the segment covers multiple ideas
- Direct quotes (`> blockquote`) for critical or memorable statements
- Tables for structured comparisons or lists

#### <Sub-topic if applicable>
- Detail...

### 2. <Topic Title>
> **Segment**: <HH:MM>-<HH:MM>

...

(Repeat for every major segment. Never merge segments.)

## Playbook

Thematic distillation of the interview's actionable ideas, organized by theme
rather than chronology. Each theme is a heading with 2–4 bullet points explaining
the key idea, why it matters, and how to apply it. This section answers:
"If I could only remember 5 things from this interview, what should they be?"

### <Theme 1>
- **Key idea**: <one-sentence statement>
- **Why it matters**: <context or implication>
- **How to apply**: <concrete action or mental model>

### <Theme 2>
- **Key idea**: ...
- **Why it matters**: ...
- **How to apply**: ...

...

## Key Quotes

| Quote | Speaker | Context |
|-------|---------|---------|
| "<verbatim quote>" | <speaker> | <brief context> |
| ... | ... | ... |

## Source Notes
- Transcript source: `manual subtitles` | `auto subtitles` | `asr-faster-whisper` | `asr-openai` | `metadata-only`
- Cookie-auth retry: used / not used
- Data gaps: <none, or describe missing data>
```

## Rules
- **Never merge segments**: every major topic shift gets its own `### N.` block.
  Follow the interview's chronological flow in Detailed Chapter Summaries.
- **Playbook is thematic, not chronological**: reorganize insights by theme so the
  reader gets a usable mental model, not a timeline rehash.
- **Quote table**: select 5–10 most important quotes. Include speaker attribution.
- **Preserve the speaker's voice**: use blockquotes for distinctive or memorable
  phrasing. Do not flatten colorful language into generic summary prose.
- **Sub-sections within chapters**: if a single segment covers 2+ distinct ideas,
  break them into `####` sub-headings (like the zhang-xuefeng example style).
