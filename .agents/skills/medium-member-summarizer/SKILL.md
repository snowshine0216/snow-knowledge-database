---
name: medium-member-summarizer
description: Extract and summarize Medium member-only articles using browser-cookie authenticated access. Use this skill whenever a user gives a Medium URL (including custom Medium domains) and asks for summary, key takeaways, notes, or insights, especially when login is required to view full content.
---

# Medium Member Summarizer

## Overview

Use this skill to summarize Medium articles that are login-gated or member-only.

Outputs:
- article metadata (title, author, publish time when available)
- extracted full text markdown (when access succeeds)
- concise structured notes (key takeaways, insights, caveats)

This skill is designed for Medium pages that need browser cookies for full access.

## Workflow

1. Run the extractor script with the target Medium URL.

```bash
python3 scripts/extract_medium_context.py \
  --url "<medium_article_url>" \
  --out-dir "/tmp/medium-member-summarizer"
```

2. If needed, explicitly choose browser and impersonation profile.

```bash
python3 scripts/extract_medium_context.py \
  --url "<medium_article_url>" \
  --out-dir "/tmp/medium-member-summarizer" \
  --cookies-from-browser chrome \
  --impersonate chrome136
```

3. Read generated files:
- `metadata_summary.json`
- `article_extracted.md`
- `bundle.json`
- `raw_article.html` (for debugging)

4. Determine `content_type`:
   - Is this a structured educational article with equations/math? → `lecture-text`
   - Is this a general article, blog post, or news? → `article`

5. Invoke the `content-summarizer` skill. Pass these fields explicitly:
   - `content_type`: [from above]
   - `title`: [from `metadata_summary.json`]
   - `source_url`: [original article URL]
   - `date`: [publish date from `metadata_summary.json`, or "unknown"]
   - `author`: [from `metadata_summary.json`]
   - `content`: [full text from `article_extracted.md`]
   - `language`: [detected from article content — use dominant script/language of the article body; pass as ISO 639-1 code if determinable, else "unknown"]
   - `target_directory`: [from user's request; default: `sources/` for article, `courses/<topic>/` for lecture-text]
   - `filename`: [for article: `{kebab-title}_{hash8}.md` where hash8 = SHA-256[:8] of URL; for lecture-text: `{NNN}-{kebab-title}.md` if in a course sequence, else `{kebab-title}.md`]

## Rules

- Do not fabricate details that are not present in extracted content.
- If extraction is partial, explicitly say it is partial.
- Prefer benchmark numbers and concrete claims over generic commentary.
- Keep summaries concise and technically actionable.

## Dependencies

- `yt-dlp` (for exporting browser cookies)
- Python package `curl_cffi` (for browser-like TLS impersonation)

If `curl_cffi` is missing:

```bash
python3 -m pip install --user curl_cffi
```
