# Template: book

For summarizing an **entire** technical / non-fiction book (multi-chapter) into a dedicated,
cross-linked knowledge **subfolder** — NOT a single chapter. For one chapter, use `book-chapter`.

**Canonical worked example in this repo** (mirror its structure and depth):
- Detailed packs → `ai-engineering/practical-statistics-for-data-scientists/`
- Wiki articles → `wiki/ai-engineering/practical-statistics-for-data-scientists/`
- Sibling precedent (different naming) → `ai-engineering/aie-book-review/` + `wiki/ai-engineering/aie-ch*.md`

## What this template produces

Two parallel trees, both inside a **per-book subfolder** named `<book-slug>` (always create the
subfolder — never write book files loose into the topic folder):

1. **Detailed review-pack tree** (raw content, top-level) → `<topic>/<book-slug>/`
   - `00-index.md` — review-pack index (chapter table + how-to-use + book spine + fidelity note)
   - `NN-<chapter-slug>.md` — one **detailed** study pack per chapter (`01-…`, `02-…`)
2. **Wiki tree** (compiled, cross-linked) → `wiki/<topic>/<book-slug>/`
   - `<book-slug>-book.md` — book **hub** page
   - `<book-abbr>-chNN-<chapter-slug>.md` — one **lightweight** article per chapter

## Inputs / parameters

- `topic` — one of the 6 topic folders (`claude` · `agent-frameworks` · `ai-engineering` ·
  `rag-and-knowledge` · `dev-tools` · `learning-and-business`), chosen ONCE via the CLAUDE.md
  decision order. The SAME topic is used for both trees.
- `book_slug` — full ASCII-kebab book title, e.g. `practical-statistics-for-data-scientists`.
- `book_abbr` — short ASCII prefix for wiki chapter files, e.g. `psds`. Used ONLY for the wiki
  per-chapter filenames so they're easy to disambiguate in the flat Obsidian namespace.
- `source` — canonical URL (official site or companion code repo).
- `chapters[]` — ordered list of `{ NN, chapter_slug, title }` (NN = zero-padded `01`, `02`, …).

> Filenames must be ASCII only (CLAUDE.md). For Chinese-language books, translate the title to
> English then slugify — never pinyin, never raw Chinese.

---

## File 1 — Detailed `00-index.md`  (`<topic>/<book-slug>/00-index.md`)

```markdown
---
tags: [<topic-tags>, <author-slug>, study-guide, review, quiz]
source: <canonical_url>
---

# <Book Title> (<Authors>) — Chapter Review Pack

Self-study materials for *<Book Title>*, <edition/year>. One file per chapter. Each file has:

1. **Chapter at a glance** — a one-paragraph anchor.
2. **Core concepts** — the reviewable substance, organized for re-reading.
3. **Quiz** — questions with collapsible answers (`> [!example]- Show answer`). Read, think, *then* expand.
4. **Deeper understanding (expansion)** — analogies, trade-offs, "why does this matter."
5. **Connections** — how the chapter links to the rest of the book.

> [!tip] How to use this pack
> Cover the answers, attempt every question, then reveal. Anything you miss → re-read that bullet
> in **Core concepts**. Re-test after a day for spacing. Expansion sections are the second pass.

## Chapters

| # | Chapter | File |
|---|---|---|
| 1 | <Chapter 1 Title> | [[01-<chapter-1-slug>]] |
| 2 | <Chapter 2 Title> | [[02-<chapter-2-slug>]] |
| … | … | … |

## The book's spine in one paragraph

<2–4 sentences: the book's throughline and how the chapters build on each other.>

> [!note] Source fidelity
> Grounded in the book's actual arguments and structure. Concepts and relationships are reliable;
> a few precise illustrative figures may differ from the printed page, and anything extrapolated is
> marked in the expansion sections. Companion code: <repo url>. Lightweight summaries: [[<book-slug>-book]].
```

---

## File 2 — Detailed per-chapter pack  (`<topic>/<book-slug>/NN-<chapter-slug>.md`)

This is the heavyweight file. **Match the depth of the PSDS example** — ~10 quiz questions, real
worked reasoning in answers, 2–3 expansion callouts.

```markdown
---
tags: [<chapter-tags>, <author-slug>, study-guide, quiz]
source: <canonical_url>
---

# Chapter N — <Chapter Title>

> [!abstract]+ Chapter at a glance
> <One paragraph: what the chapter covers, its central idea, and why it matters.>

## Core concepts

**<Sub-topic A>**
- **<term>** — <definition + intuition, with the book's specifics>.
- …

**<Sub-topic B>**
- …

## Quiz

**1.** <conceptual question>

> [!example]- Show answer
> <Full-sentence answer that actually teaches — not a one-liner.>

**2.** <question>

> [!example]- Show answer
> <answer>

… (target ~10 questions; mark application questions `*(Applied)*`; the last 1–2 should be applied)

## Deeper understanding (expansion)

> [!info]+ 💡 <punchy title of an insight that goes a step beyond the book>
> <2–5 sentences of synthesis, trade-off analysis, or a sharper mental model.>

> [!info]+ 💡 <second insight>
> <…>

## Connections

- **→ Chapter N+1** <one line on the conceptual bridge forward>.
- **← Chapter N−1** <one line on what it built on>.
- Lightweight summary: [[<book-abbr>-chNN-<chapter-slug>]] · book hub: [[<book-slug>-book]].
```

**Callout rules (Obsidian):** `> [!abstract]+` (expanded), `> [!example]-` (collapsed answers),
`> [!info]+` (expanded expansions). NEVER use `<details>`/`<summary>` HTML.

---

## File 3 — Wiki hub  (`wiki/<topic>/<book-slug>/<book-slug>-book.md`)

```markdown
---
tags: [<topic-tags>, <author-slug>]
source: <canonical_url>
---

# <Book Title> — <Authors> (<Publisher, Year>)

<One-paragraph overview of the whole book: scope, angle, what makes it worth reading.>

## Key Concepts
- **<book-wide concept>** — <self-contained definition>.
- … (6–9 bullets spanning the whole book)

## Rules of Thumb   ← optional; include if the book has ≥5 memorable quantitative rules
| Idea | Quick form |
|---|---|
| … | … |

## Key Takeaways
- <book-level takeaway>.
- …

## Chapter Deep-Dives
Per-chapter wiki articles (concepts):

- [[<book-abbr>-ch01-<chapter-1-slug>]] — <≤6-word gloss>
- [[<book-abbr>-ch02-<chapter-2-slug>]] — <gloss>
- …

## See Also
- [[<related-existing-wiki-slug>]]
```

---

## File 4 — Wiki per-chapter article  (`wiki/<topic>/<book-slug>/<book-abbr>-chNN-<chapter-slug>.md`)

Lightweight (~2–3 KB). Concepts only — the depth lives in the detailed pack.

```markdown
---
tags: [<chapter-tags>, <author-slug>]
source: <canonical_url>
---

# <BOOK-ABBR> Ch.N — <Chapter Title>

<1–2 sentence intro.> Part of the [[<book-slug>-book]] series. Full review pack with quiz: [[NN-<chapter-slug>]].

## Key Concepts   ← or a custom thematic `##` section; bold the key terms
- **<term>** — <concise definition>.
- …

## Key Takeaways
- <2–3 load-bearing takeaways>.

## See Also
- [[<book-slug>-book]]
- [[<book-abbr>-ch(N-1)-…]] · [[<book-abbr>-ch(N+1)-…]]
```

---

## Cross-linking (all by Obsidian basename — works across subfolders)

- Wiki chapter intro → its detailed pack: `Full review pack with quiz: [[NN-<chapter-slug>]].`
- Wiki chapter + hub use `[[<book-slug>-book]]` for the hub.
- Detailed pack Connections → wiki summary `[[<book-abbr>-chNN-<chapter-slug>]]` + hub `[[<book-slug>-book]]`.
- Detailed `00-index` chapter table → `[[NN-<chapter-slug>]]`.
- Use `[[wikilinks]]` everywhere — NEVER `[markdown links]` inside article bodies.

## Index update (`wiki/_index.md`) — wiki tree only

Add to the `## <Topic>` table (matching `topic`):
- **One hub row**: `| [<Book Title> — <Authors> (Year)](<topic>/<book-slug>/<book-slug>-book.md) | <tags> | <one-line summary> |`
- **One row per chapter**: `| [<BOOK-ABBR> Ch.N — <Title>](<topic>/<book-slug>/<book-abbr>-chNN-<chapter-slug>.md) | <tags> | <one-line summary> |`

Do **NOT** add the detailed review-pack files (`<topic>/<book-slug>/NN-*.md`) to `wiki/_index.md` —
they are indexed by their own `00-index.md`, mirroring the `aie-book-review/` precedent.

## Pre-write & ordering

1. Decide `topic`, `book_slug`, `book_abbr` once.
2. `mkdir -p "<topic>/<book-slug>"` and `mkdir -p "wiki/<topic>/<book-slug>"`.
3. Run the SKILL.md Pre-Write Check on every target path; skip any that already exist.
4. Write detailed `00-index.md` + all `NN-*.md`, then wiki hub + all `<book-abbr>-chNN-*.md`.
5. Update `wiki/_index.md` (hub row + chapter rows).
6. **SKIP the single-file Wiki Compilation Post-Hook** — the `book` type writes both trees and the
   index itself; the post-hook assumes one detailed file → one wiki article and would misfire here.

## Rules

- **Always create the per-book subfolder** in both trees. Never write book files loose in `<topic>/`.
- **Pick the topic ONCE** — raw subfolder `<topic>/<book-slug>/` and wiki subfolder
  `wiki/<topic>/<book-slug>/` must use the same `<topic>`.
- **Depth**: detailed packs match the PSDS example (~10 quiz Q with full answers, 2–3 expansions);
  wiki articles stay lightweight (Key Concepts → Key Takeaways → See Also).
- **Concreteness rule (SKILL.md) applies** — every Core-concept bullet and quiz answer carries the
  book's actual specifics (numbers, named methods, worked reasoning), not abstract restatements.
- **Source fidelity**: when summarizing from model knowledge rather than the live text, say so in the
  `00-index` fidelity note and flag any extrapolation in expansion callouts. Do not invent figures.
- **ASCII filenames only**; Chinese titles → translate → slugify.
- Equations exact (LaTeX `$inline$` / `$$block$$`); include worked examples from the book, never invented.
```
