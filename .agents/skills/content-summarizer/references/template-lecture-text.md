# Template: lecture-text

Produce textbook-prose lecture notes with pre-test priming, rich prose sections, a post-test, and a hidden answer guide. This template targets course lectures where deep retention matters.

---

## Why This Template Exists

Passive reading builds shallow familiarity. Three interventions make notes that actually stick:

1. **Pre-test priming** — Attempting hard questions before reading triggers the "desirable difficulties" effect. Wrong answers are expected; the point is that your brain flags the gap and encodes the correct answer more deeply when it arrives in the content. Pre-test must appear *before* the content — placing it at the bottom defeats this entirely.

2. **Prose over bullets** — Bullet lists let readers skim without processing. Textbook prose forces the writer to explain *why* something is true, and forces the reader to follow an argument. The Feynman standard: could someone who has never seen this material understand the explanation without prior context?

3. **Post-test + Answer Guide** — Writing answers from memory (not re-reading) is the highest-leverage retrieval practice. The `<details>` block keeps the guide accessible without tempting passive peeking.

---

## Required Structure (EXACT ORDER)

### 1. Frontmatter

Every file must open with YAML frontmatter containing `tags` and `source`.

```markdown
---
tags: [fine-tuning, instruction-tuning, llm, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/qy4wl/instruction-finetuning
---
```

- `tags`: lowercase, hyphen-separated keywords; include platform and instructor name when relevant
- `source`: canonical URL of the original lecture or video

---

### 2. Pre-test

Three questions, intentionally difficult, placed immediately after frontmatter before any content. The italic callout explains the purpose to the reader.

```markdown
## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What is instruction fine-tuning and how does it differ from training on raw text?
2. How did Stanford's Alpaca technique generate training data without human labelers?
3. Can instruction fine-tuning teach a model to answer questions on topics *not included* in the fine-tuning dataset?

---
```

Rules for pre-test questions:
- Hard enough that a newcomer will likely answer incorrectly or incompletely
- Each question should map to a major insight covered in the content sections
- No hints or context — just the bare question
- End the pre-test block with a `---` horizontal rule

---

### 3. Main Heading

A single `#` heading identifying the lecture by number and title. Use the format `Lecture NNN: Title` where NNN is zero-padded to three digits.

```markdown
# Lecture 004: Instruction Finetuning
```

---

### 4. Source Line

One line immediately under the main heading identifying the course, URL, platform, and instructor.

```markdown
**Source:** [Finetuning Large Language Models](https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/qy4wl/instruction-finetuning) · DeepLearning.AI · Instructor: Sharon Zhou (Lamini)
```

Format: `**Source:** [Course Title](url) · Platform · Instructor: Name (Affiliation)`

---

### 5. Outline

An anchor-linked list of the content sections that follow. Use GitHub-Flavored Markdown anchor syntax: lowercase, spaces to hyphens, punctuation stripped.

```markdown
## Outline

- [What Instruction Fine-tuning Is](#what-instruction-fine-tuning-is)
- [Data Sources for Instruction Following](#data-sources-for-instruction-following)
- [Generalization: The Key Insight](#generalization-the-key-insight)
- [Fine-tuning Pipeline Overview](#fine-tuning-pipeline-overview)
- [Lab: Alpaca Dataset and Model Comparisons](#lab-alpaca-dataset-and-model-comparisons)

---
```

- 3–6 entries; one per major content section
- End with `---` horizontal rule
- Anchor text must match `## Section Heading` exactly (case-insensitive match)

---

### 6. Content Sections

3–6 `##` sections covering the lecture material. Each section:
- Opens with a `##` heading that matches the outline anchor
- Contains **textbook prose** — complete sentences organized in paragraphs, not bullet lists
- Ends with a `---` horizontal rule separating it from the next section
- May include inline math (`$x^2$`), display math (`$$...$$`), code blocks, or comparison tables when the source material requires them

**Target: 800–1500 words total across all content sections.**

Example of a well-written content section:

```markdown
## What Instruction Fine-tuning Is

Instruction fine-tuning is the specific variant of fine-tuning that **converted GPT-3 into ChatGPT**, dramatically expanding LLM adoption from a few researchers to hundreds of millions of users. Instead of training a model to predict the next token in raw text, it trains the model on **(instruction, response) pairs** — teaching it to follow user directives and behave like a chatbot.

Other fine-tuning tasks exist (reasoning, routing, code completion, agents), but instruction fine-tuning — also called instruction-tuning or instruction-following — is the dominant paradigm for modern chat interfaces.

---
```

Note the characteristics:
- Opens with the most important claim, not background
- Bold on the key concept; italics on technical terms
- Short follow-up paragraph adds scope and context
- No trailing bullet list to summarize what was just said

---

### 7. Post-test

Three retrieval questions placed after all content sections. The italic callout instructs the reader to close the file before answering.

```markdown
## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. What made GPT-3 become ChatGPT, mechanically — what changed in the training process?
2. Explain how Stanford Alpaca generated instruction fine-tuning data without relying on human annotators.
3. Why can instruction fine-tuning enable a model to answer questions on code even if no code examples were in the fine-tuning dataset?
```

Post-test questions should:
- Rephrase the pre-test questions (same concepts, different wording) so the reader cannot pattern-match
- Require explanation, not just recall of a label
- Be answerable purely from the content sections — no outside knowledge needed

---

### 8. Answer Guide

A `<details>` collapsible block immediately after the post-test. The summary label must read exactly `Answer Guide`.

```markdown
<details>
<summary>Answer Guide</summary>

1. GPT-3 was trained to predict the next token in raw text. ChatGPT was further trained (instruction fine-tuned) on (instruction, response) pairs, teaching it to answer user directives rather than just continue text. This behavior change — not new knowledge — is what made it feel qualitatively different.
2. Stanford's Alpaca technique used ChatGPT itself as a labeler: given a prompt template, ChatGPT generated thousands of (instruction, response) pairs automatically, bypassing the need for expensive human annotation.
3. The model already learned code during pre-training on internet text. Instruction fine-tuning teaches *how to answer questions* as a general behavior — this generalizes across all the model's pre-existing knowledge, including code, even without code examples in the fine-tuning set.

</details>
```

Each answer should:
- Be 2–4 complete sentences — enough to demonstrate understanding, not exhaustive
- Match the explanation depth in the content section it draws from
- Use the Feynman standard: explain *why*, not just *what*

---

## Forbidden Patterns

- **Pre-test at the bottom** — defeats priming entirely; pre-test must appear before the `# Lecture` heading and all content
- **No answer guide** — retrieval practice without feedback is incomplete; always include the `<details>` block
- **Bullet-only sections** — content sections must be prose paragraphs; bullets are only acceptable for short enumerations embedded within a prose paragraph, never as the primary structure of a section
- **Markdown links for intra-course references** — use `[[IDX-slug]]` wikilinks, not `[text](relative-path.md)`, so Obsidian graph view connects lectures correctly
- **Verbatim transcript copy** — paraphrase and synthesize; direct transcript paste is not a note
- **Truncating content** — every significant concept from the source must appear; do not drop sections because the note is getting long

---

## Length Targets

| Section | Target |
|---|---|
| Pre-test | ~70 words (3 questions + callout) |
| Outline | ~50 words (3–6 anchor links) |
| Content sections total | 800–1500 words |
| Post-test | ~80 words (3 questions + callout) |
| Answer Guide | ~200 words (3 answers, 2–4 sentences each) |

Total file length: typically 1200–2000 words excluding frontmatter.

---

## Wikilinks Usage

Use `[[IDX-slug]]` syntax for all cross-references to other lectures in the same course. Never use relative Markdown links for intra-course navigation.

```markdown
As covered in [[003-where-fine-tuning-fits-in]], the base model provides
the pre-trained knowledge that instruction fine-tuning builds on.

The next lecture, [[005-training-process]], walks through the full
data prep → training → evaluation loop in code.
```

The slug format is `NNN-kebab-case-title` matching the filename of the target note (without `.md`). This enables Obsidian's graph view to draw edges between lectures automatically.

---

## Example

The canonical reference for this template is:

`courses/fine-tuning-large-language-models/004-instruction-finetuning.md`

Read that file before producing output. When in doubt about prose density, section depth, or answer guide length, match that file exactly.

---

## Rules

- Prose over bullets for main content — textbook style, complete sentences.
- Each equation inline with its variable legend and interpretation.
- Preserve all formulas from the source exactly — do not simplify or rewrite.
- Section anchors must match headings (lowercase, hyphens for spaces).
- `---` horizontal rules between all `##` sections.
- No "Key Takeaways" or "Essence" sections — insight belongs in the section where it appears.
- Pre-test appears before the `# Lecture` heading; post-test appears after the last content section.
- The `<details>` Answer Guide must follow the post-test with no intervening content.
- Wikilinks (`[[slug]]`) for intra-course cross-references; never relative Markdown links.
- Filename format: `NNN-kebab-case-title.md` (ASCII only, no Chinese characters).
