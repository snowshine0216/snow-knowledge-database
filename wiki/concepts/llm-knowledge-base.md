---
tags: [llm, knowledge-base, rag, obsidian, wiki, personal-knowledge-management, search]
source: https://x.com/karpathy/status/1909054449100034467
---

# LLM Knowledge Base

A workflow for building a personal wiki where LLMs act as librarian and compiler: raw sources go in, synthesized knowledge comes out, and Q&A runs against the compiled wiki.

## Core Idea

The LLM is not a search engine — it's a compiler. You feed it raw, noisy sources (articles, PDFs, transcripts) and it produces clean, cross-linked wiki articles with [[Obsidian]] `[[wikilinks]]`. The result is a knowledge base that is both human-readable and LLM-queryable.

## Workflow

```
raw/ (intake)  →  compile (LLM)  →  wiki/ (compiled)  →  Q&A / outputs
```

1. **Clip** raw sources into `raw/` with frontmatter (`tags`, `source`)
2. **Compile**: run `scripts/compile.sh raw/<article>.md` → Claude reads + synthesizes → writes to `wiki/<category>/<article>.md` + updates `wiki/_index.md`
3. **Search**: `scripts/search.sh "query"` → returns matching files → LLM reads and answers
4. **Output**: slides, diagrams, reports → filed back into `wiki/workflows/` or `wiki/concepts/`

## The Index File Trick

`wiki/_index.md` is a markdown table with one row per article: file path, tags, one-line summary. The LLM reads this first on every query, then fetches only the relevant files. At ~50-200 articles, this fits in context and eliminates the need for vector search.

```markdown
| File | Tags | One-line summary |
|------|------|-----------------|
| concepts/rag.md | rag, retrieval | Dense vs sparse retrieval tradeoffs |
```

See also: [[vectorless-rag]] for why this beats vector DBs at personal-wiki scale.

## Why Not Vector RAG?

At personal-wiki scale (~100-200 articles), the index file trick outperforms vector search:
- No infra dependency (no ChromaDB, no embeddings pipeline)
- LLM understands semantic relationships better than cosine similarity
- Index maintenance is the LLM's job — it updates `_index.md` on every compile
- Context windows are large enough to hold the full index

Migrate to vector search at ~500+ articles (see [[Obsidian Smart Connections]] or `llm-embed` + sqlite-vec).

## Search Layer

Two tools, different use cases:

| Tool | When to use | Requires |
|------|-------------|---------|
| `scripts/search.sh` | LLM queries, terminal search, Obsidian closed | ripgrep (or find+grep fallback) |
| [[Omnisearch]] REST API (`localhost:51361`) | Interactive search, Obsidian open | Obsidian running |

`search.sh` is primary. Omnisearch is an enhancement.

## Obsidian as Frontend

[[Obsidian]] provides the human interface:
- **Graph view**: visualizes cross-links between articles (requires `[[wikilinks]]` format — NOT `[markdown links]`)
- **[[Dataview]]**: SQL-like queries over the wiki (`TABLE tags FROM "wiki" SORT file.mtime DESC`)
- **[[Templater]]**: ensures every new file gets required frontmatter (`tags`, `source`)
- **[[Omnisearch]]**: fuzzy full-text search with REST API at `localhost:51361`

## Frontmatter Contract

Every file in the repo must have:

```yaml
---
tags: [tag1, tag2]
source: https://original-url  # or "internal" for generated files
---
```

This is enforced by CLAUDE.md. Without it, Dataview queries and tag-based search break.

## Wikilinks vs Markdown Links

Always use `[[wikilinks]]`, never `[text](path)`:

| Format | Backlinks | Graph view | Obsidian navigation |
|--------|-----------|------------|---------------------|
| `[[wikilinks]]` | Yes | Yes | Yes |
| `[text](path)` | No | No | Partial |

## Known Failure Modes

- **`_index.md` drift**: LLM writes wiki article but fails to update index. Fix: make index update the explicit final step in every compile instruction.
- **Pipe characters in summaries**: breaks the markdown table. Avoid `|` in one-liner summaries.
- **Category mismatch**: article compiled to wrong subdirectory. Fix: pass explicit category as second arg to `compile.sh`.

## Tools

- [[scripts/compile.sh]] — validates input, prints Claude Code compile instruction
- [[scripts/search.sh]] — keyword search over wiki/ and raw/
- [[Obsidian]] — vault viewer, graph, Dataview queries
- [[Omnisearch]] — fuzzy search + REST API

## Scale Guide

| Articles | Approach |
|----------|---------|
| < 50 | Pass full wiki in context, no search needed |
| 50-200 | Index file trick (`_index.md`) |
| 200-500 | Index file + category-scoped search |
| 500+ | Vector search (Obsidian Smart Connections, `llm-embed` + sqlite-vec) |
