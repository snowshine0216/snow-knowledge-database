# Template: article

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

## Executive Summary
A 3–5 sentence paragraph capturing the article's core thesis, the most important
conclusion, and who should care. Write it so a reader can decide in 15 seconds
whether to read further.

## Outline
Numbered list of every major section in the article, preserving the author's
original structure. Each entry is one line: section number + title + one-sentence
description of what it covers.

1. **<Section Title>** — <one-sentence description>
2. **<Section Title>** — <one-sentence description>
...

## Section Summaries

### 1. <Section Title>
Structured summary of this section. Include:
- The section's core argument or purpose
- Key facts, data points, or claims (with numbers where present)
- Sub-sections as `####` headings when the original has clear sub-topics
- Direct quotes (`> blockquote`) for critical statements worth preserving verbatim
- Tables for structured data (comparisons, lists of items with attributes)

Repeat for each section. Never squash multiple sections into one — preserve the
article's own structure so the reader can navigate by section.

### 2. <Section Title>
...

## Key Takeaways
- <concrete finding or claim — 5-10 bullets, each self-contained>
- ...

## Insights
- <engineering implication, decision tradeoff, or non-obvious pattern — 3-6 bullets>
- ...

## Caveats
- <benchmark or methodology limits>
- <data-access limitations if extraction was partial>

## Sources
- <original article URL>
- <primary referenced sources linked inside the article>
```

## Rules
- **Never squash sections**: every major section in the original article gets its own
  `### N. <Title>` block under Section Summaries. If the original has sub-sections,
  represent them as `####` headings within that block.
- **Preserve structure**: the Outline and Section Summaries must mirror the article's
  own heading hierarchy. Do not reorganize or merge.
- **Include data**: numbers, percentages, benchmarks, and concrete claims go into
  Section Summaries, not just Key Takeaways.
- **Concreteness rule (see SKILL.md)**: every Key Takeaway and Insight bullet
  must carry a concrete anchor — a number, a named tool/file, a one-line story,
  or a counterexample. Abstract claims like "X matters" or "be careful with Y"
  without a specific anchor are a failure. If the source has ≥5 quantitative
  facts, add a `## Key Numbers` table before Key Takeaways.
- **Quote sparingly**: use blockquotes only for statements that are both important and
  lose meaning when paraphrased.
- **Executive Summary comes first**: it is the entry point; write it after reading the
  full article so it reflects the complete picture.
