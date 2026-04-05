---
name: wiki-manager
description: "Batch-index folders of markdown/text materials into the Obsidian wiki, and search the wiki to answer knowledge queries. Use this skill whenever the user wants to: index a folder into wiki, compile multiple files to wiki, bulk import notes, search the wiki for a topic, look up what we know about X, or find wiki articles. Also triggers for 'add these to the knowledge base', 'what do we have on [topic]', 'search wiki for [query]'. Even if the user doesn't say 'wiki' explicitly — if they point at a folder of notes and want them organized, or ask a knowledge question that the wiki might answer, use this skill."
---

# Wiki Manager

Two modes: **Index** (batch-compile a folder into wiki) and **Search** (find and return wiki content).

## How the Wiki Works

The knowledge base follows a `raw/ -> compile -> wiki/` pipeline:

- `raw/` holds source material with frontmatter (`tags`, `source`)
- Compilation synthesizes raw content into clean wiki articles in `wiki/<category>/`
- `wiki/_index.md` is a markdown table that indexes all articles (file, tags, one-line summary)
- Articles use `[[wikilinks]]` for Obsidian cross-references (never `[markdown links]`)
- Categories: `concepts/` (ideas, patterns), `tools/` (software, libraries), `workflows/` (processes, how-tos)

## Mode 1: Index (Batch Compile)

Trigger: user provides a folder path and wants its contents added to the wiki.

### Steps

1. **Scan the folder** recursively for `.md` files (also handle `.txt` by treating them as markdown). Report what you found:
   ```
   Found 12 files in tech-notes/:
   - tech-notes/harness-engineering.md
   - tech-notes/rag/chunking-strategies.md
   ...
   ```

2. **For each file**, determine:
   - Whether it already has frontmatter (`tags`, `source`). If not, infer tags from content and set `source: internal` (or extract a URL if one appears in the content).
   - The appropriate wiki category (`concepts`, `tools`, or `workflows`) based on content.
   - A slug for the output filename (lowercase, hyphenated, derived from the title or filename).

3. **Check for collisions** against existing `wiki/_index.md` entries. Skip files that are already indexed (match by source URL or similar title). Report skipped files.

4. **Compile each file** — this is the core step:
   - Read the source file
   - Synthesize a wiki article: extract the durable knowledge, add structure, cross-reference with `[[wikilinks]]` to existing wiki articles where relevant
   - Write to `wiki/<category>/<slug>.md` with proper frontmatter
   - The wiki article should be a synthesis, not a copy — distill the key ideas

5. **Update `wiki/_index.md`** — append one row per new article to the table:
   ```
   | [Article Title](category/slug.md) | tag1, tag2 | One-line summary |
   ```

6. **Report results**:
   ```
   Indexed 10/12 files:
   - wiki/concepts/harness-engineering.md (new)
   - wiki/concepts/chunking-strategies.md (new)
   Skipped 2 (already indexed):
   - llm-knowledge-base (exists)
   ...
   ```

### Compilation Guidelines

- Keep wiki articles concise (200-800 words). The goal is durable reference material, not a copy of the source.
- Use `[[wikilinks]]` to cross-reference other wiki articles. Check `_index.md` for existing articles to link to.
- Every wiki file must have frontmatter: `tags` (array) and `source` (URL or `internal`).
- Preserve the most valuable content: key insights, practical examples, decision criteria, tradeoffs.
- Use headers, tables, and code blocks for scannability.
- Strip temporal language ("recently", "this week") — wiki articles should be timeless.

### Handling Large Batches

For folders with many files (>10), process in batches to avoid context overflow:
- Process 5-8 files at a time
- Update `_index.md` after each batch
- Report progress between batches

## Mode 2: Search

Trigger: user asks a knowledge question or wants to find wiki content.

### Steps

1. **Search the index first** — read `wiki/_index.md` and scan for relevant entries by matching tags and summaries against the query.

2. **Search content** — use `scripts/search.sh "<query>"` or grep wiki/ and raw/ for keyword matches. This catches articles the index scan might miss.

3. **Read matching articles** — fetch the full content of the top matches (up to 3-5 most relevant files).

4. **Synthesize an answer** — combine information from the matched articles into a direct answer. Always cite which wiki articles the information came from:
   ```
   Based on wiki/concepts/harness-engineering.md:
   [answer content]

   Related: wiki/concepts/testing-patterns.md also covers...
   ```

5. **If no matches found** — check `raw/` for uncompiled sources that might be relevant. If found, offer to compile them first. If nothing found anywhere, say so clearly.

### Search Tips

- For broad topics, start with the index (`_index.md`) — it's designed for this
- For specific terms or phrases, grep the content directly
- Always check both `wiki/` and `raw/` — some content may not be compiled yet
- If the query spans multiple articles, synthesize across them rather than dumping raw content

## Examples

**Index example:**
```
User: index the tech-notes folder into wiki
Action: scan tech-notes/, compile each .md file, update _index.md
```

**Search example:**
```
User: what do we know about harness engineering?
Action: search _index.md + grep wiki/ for "harness" → read matches → synthesize answer
```

**Mixed example:**
```
User: add everything in courses/ml/ to the wiki, then tell me what we have on transformers
Action: index courses/ml/ first, then search for "transformers"
```
