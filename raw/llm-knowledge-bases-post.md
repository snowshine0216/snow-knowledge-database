---
tags: [llm, knowledge-base, obsidian, wiki, rag, personal-knowledge-management]
source: https://x.com/karpathy/status/1909054449100034467
---

# LLM Knowledge Bases (Karpathy)

*Post by Andrej Karpathy, April 2025*

---

I've been using LLMs as a personal knowledge base and the workflow has gotten pretty good. Sharing what works.

**The basic setup:**

You have a `raw/` folder where you dump everything — articles you clip, PDFs, notes, transcripts. The LLM reads from `raw/` and compiles synthesized wiki articles into a `wiki/` folder. Then you Q&A against the wiki.

The key insight: the LLM isn't just copying the raw source. It's synthesizing, cross-referencing, extracting the durable knowledge and leaving behind the noise. A 10,000 word article becomes a tight 500 word wiki entry with [[wikilinks]] to related concepts.

**Why this beats RAG for personal use:**

I thought I had to reach for fancy RAG — embeddings, vector DBs, semantic search. Turns out at ~100-200 articles, the LLM has been pretty good at auto-maintaining index files. You give it a `_index.md` with one-liner summaries of each article, it reads that first, then pulls the relevant files. Context window is big enough now that this just works.

The index file is the whole trick. Keep it as a markdown table:

```
| File | Tags | One-line summary |
|------|------|-----------------|
| concepts/rag.md | rag, retrieval | Dense vs sparse retrieval, when to use each |
| tools/obsidian.md | obsidian, pkm | Obsidian setup for LLM-assisted note-taking |
```

LLM reads this first, then fetches what it needs. No vector DB required.

**The compilation step:**

This is where the value is created. When a new raw article comes in, you trigger a compile:

1. LLM reads the raw source
2. Writes a synthesized wiki article with proper cross-references ([[wikilinks]], not markdown links — this matters for Obsidian graph view)
3. Updates `_index.md` with a new row
4. The wiki article is now part of the knowledge base, searchable and cross-linked

You can automate the trigger (git hook when raw/ changes) or do it manually. Manual is fine when you're learning the workflow.

**Outputs beyond text:**

The LLM isn't limited to writing wiki articles. It can:
- Generate slides from the compiled wiki
- Create diagrams (Mermaid, SVG) of concept relationships
- Produce structured JSON for downstream tooling
- Write analysis reports

These outputs go back into `wiki/workflows/` or `wiki/concepts/` — the wiki becomes a living output layer, not just notes.

**What to use for search:**

Two layers:
1. `scripts/search.sh` — CLI ripgrep search over wiki/ and raw/. Works without Obsidian open. This is the primary LLM search tool.
2. Omnisearch plugin (Obsidian) — fuzzy full-text search for humans. Exposes REST API at `localhost:51361` so LLM can call it when Obsidian is open.

**Obsidian as the viewer:**

Obsidian is perfect for this because:
- Graph view shows cross-links between wiki articles (requires `[[wikilinks]]` format)
- Dataview plugin lets you query the wiki like a database: `TABLE tags, file.mtime FROM "wiki" SORT file.mtime DESC`
- Templater ensures every new file has the required frontmatter

**The frontmatter contract:**

Every file needs:
```yaml
---
tags: [tag1, tag2]
source: https://original-url
---
```

This is the metadata layer that makes search, filtering, and provenance tracking work.

**Scale:**

- ~50 articles: fits easily in context, no search needed, just pass the whole wiki
- ~100-200 articles: index file trick works well
- ~500+ articles: probably time for vector search (Obsidian Smart Connections, or `llm-embed` + sqlite-vec)

**What breaks:**

- `_index.md` drift: if the LLM writes a wiki article but fails to update the index, search quality degrades. Mitigation: make index update the final explicit step in every compile instruction.
- Pipe characters in summaries: breaks the markdown table. Avoid `|` in one-liner summaries.
- Wikilinks vs markdown links: if you use `[text](path)` instead of `[[wikilinks]]`, Obsidian backlinks and graph view break. Always use `[[wikilinks]]`.

**Bottom line:**

The complexity of "personal RAG" is massively overstated. Raw folder + LLM compiler + index file + keyword search gets you 90% of the way there in an afternoon. The LLM is the librarian. Let it do the work.
