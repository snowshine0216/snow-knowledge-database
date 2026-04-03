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

See: `references/template-lecture-video.md`

### lecture-text

See: `references/template-lecture-text.md`

### interview

See: `references/template-interview.md`

### talk

See: `references/template-talk.md`

### article

See: `references/template-article.md`

### geektime-article

See: `references/template-geektime-article.md`

---

## Rules

- All output files **must** have frontmatter with `tags` and `source` fields.
- Use `recommended_summary_filename` from metadata when available; otherwise derive per filename convention above.
- Write in the original content language unless the user requests translation.
- Do not invent facts not present in the extracted content.
- If transcript is unavailable, state that clearly and summarize from title/description/chapters/metadata only.
