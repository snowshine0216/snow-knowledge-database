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

4. Produce a summary report using the output structure below.

## Output Structure

Always return these sections in this order:

### Article Info
- URL
- Title
- Author
- Publish time
- Access mode (`cookie-authenticated` or fallback)

### Key Takeaways
- 5-10 bullets with concrete findings

### Insights
- 3-6 bullets on engineering implications and decision tradeoffs

### Caveats
- Benchmark or methodology limits
- Data-access limitations if extraction was partial

### Sources
- Original Medium URL
- Primary referenced sources linked inside the article (if any)

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
