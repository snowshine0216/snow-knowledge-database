---
name: book-review
description: Generate a complete chapter-by-chapter study/review pack for an entire book (summaries, quiz Q&A, expansion notes, wiki cross-links) using Claude's own training-data knowledge of the book — never web search. Use when the user asks to "summarize the book X", "book review material", "prepare review material for book Y", "book quiz", or wants self-test material for a whole book. Delegates file generation to content-summarizer's `book` content_type.
---

# Book Review

## Overview

Turns "summarize book X for review" into a full study pack: a per-book subfolder with one
detailed chapter file (summary + concepts + quiz + expansion) plus a lightweight wiki tree,
generated entirely from Claude's training-data knowledge of the book. This skill is a thin
front end — the actual file structure and dual-tree/index logic already live in
`content-summarizer`'s `book` content_type (`.agents/skills/content-summarizer/references/template-book.md`).
Do not re-implement that template here; invoke it.

## Workflow

### Step 1 — Scope

Read: book title (+ author if given) + optional target topic folder from the user's request.

If no topic folder given, classify the book's subject using the CLAUDE.md 6-folder decision
order (`claude` · `agent-frameworks` · `ai-engineering` · `rag-and-knowledge` · `dev-tools` ·
`learning-and-business`).

Derive `book_slug` (ASCII kebab-case full title) and `book_abbr` (short ASCII prefix, 3–5 chars,
e.g. `psds`, `aie`). Before finalizing `book_abbr`, check it doesn't collide with an existing
prefix: `ls wiki/<topic>/*/  | grep -oE '^[a-z]+-ch' `.

Confirm the whole plan in **one line** before doing anything else:

```
Topic: <topic> · Book: <Title> by <Author> · Output: <topic>/<book-slug>/
```

### Step 2 — Recall-only gate (hard rule, mandatory before writing anything)

- Do **not** call WebSearch, WebFetch, or any browser tool for this skill, even if you're unsure
  of a detail — unless the user's own request explicitly asks you to search. Training-data recall
  only.
- If you do not have confident knowledge of this book's actual content and chapter structure, or
  the book was plausibly published/updated after your knowledge cutoff, **stop and say so
  plainly**. Do not invent a table of contents or chapter content to fill the gap. Suggest the
  user paste the source text or point at a PDF (→ `pdf-summarizer`) instead.
- If your knowledge is real but may reflect an older edition, or a detail (a figure, an exact
  quote) is uncertain, note that honestly — this is what the template's "Source fidelity" callout
  is for. Never present a guessed figure as exact.

### Step 3 — Derive chapter list

Recall the book's actual chapter/section structure from training data (titles, order). This
becomes the `chapters[]` list (`{NN, chapter_slug, title}`) that the `book` template requires.

### Step 4 — Generate via content-summarizer

Invoke the `content-summarizer` skill with `content_type: book` and:
- `topic`, `book_slug`, `book_abbr`, `chapters[]` from Steps 1–3.
- `source`: the best known canonical URL (publisher page, O'Reilly/author site). If genuinely
  unknowable, use `source: internal` and note the gap in the Source fidelity callout — never
  fabricate a URL.

This writes, per `template-book.md`:
- `<topic>/<book-slug>/00-index.md` + one `NN-<chapter-slug>.md` per chapter (Concreteness Rule
  applies: every concept bullet and quiz answer carries the book's own specific examples, numbers,
  or named methods — not abstract restatement).
- `wiki/<topic>/<book-slug>/<book-slug>-book.md` hub + one lightweight `<book_abbr>-chNN-*.md` per
  chapter.
- `wiki/_index.md` rows (hub + per chapter).

**Always let the `book` content_type create the per-book subfolder in both trees.** Never fall
back to looping `book-chapter` per file directly into the flat topic folder — that skips the
subfolder and the dual-tree/index update, which is exactly the omission this skill exists to
prevent. Skip the single-file Wiki Compilation Post-Hook, per the template's own instruction.

### Step 5 — Wiki cross-linking (augments the base template)

The base template's per-chapter "Connections" section only links sibling chapters + the book's
own hub/wiki article. Before finalizing each `NN-<chapter-slug>.md`, also scan `wiki/_index.md`
for existing articles whose tags/topic genuinely overlap with the chapter's subject, and add one
more bullet to Connections when a real connection exists:

```markdown
- **Wider wiki**: relates to [[existing-wiki-slug]] — <one clause on the actual connection>.
```

Do not force a link if nothing genuinely connects — a missing bullet is better than a padded one.

### Step 6 — Whole-book overview augmentation (extends `00-index.md`)

The base `00-index.md` template covers chapter table + book spine + source fidelity, but this
skill's brief also requires a **who-should-read** note and a **whole-book self-test**. Append
these two sections to `00-index.md` after "The book's spine in one paragraph":

```markdown
## Who should read this

<2-3 sentences: prerequisite knowledge, who benefits most, who should skip it.>

## Self-test (whole book)

Cross-chapter questions — each one requires synthesizing across ≥2 chapters, not a single-chapter
lookup (that's what the per-chapter quizzes are for).

**1.** <question spanning multiple chapters>

> [!example]- Show answer
> <answer>

… (target 6-8 questions)
```

### Step 7 — Report

State: topic + subfolder path, chapter count, wiki files written, and any Step 2 caveats
(edition/recency/uncertain figures) surfaced during generation.

## Rules

- ASCII/English filenames only (CLAUDE.md) — transliterate/translate non-English titles before
  slugifying.
- No git commits — leave the working tree changes uncommitted.
- No `model=` pins in any generated content or instructions.
- Never invent book content, chapter structure, or figures not recalled with genuine confidence
  (Step 2). Stopping honestly beats fabricating a plausible-looking pack.
- All frontmatter must include `tags` and `source` per repo CLAUDE.md.
