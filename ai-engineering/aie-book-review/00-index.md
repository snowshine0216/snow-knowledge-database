---
tags: [ai-engineering, llm, foundation-models, chip-huyen, study-guide, review, quiz]
source: https://github.com/chiphuyen/aie-book
---

# AI Engineering (Chip Huyen) — Chapter Review Pack

Self-study materials for *AI Engineering* by Chip Huyen (O'Reilly, 2025). One file per chapter. Each file has:

1. **Chapter at a glance** — a one-paragraph anchor.
2. **Core concepts** — the reviewable substance, organized for re-reading.
3. **Quiz** — questions with collapsible answers (`> [!example]- Show answer`). Read the question, think, *then* expand. This is active recall — resist peeking.
4. **Deeper understanding (expansion)** — analogies, trade-offs, and "why does this matter" that go a step beyond the book.
5. **Connections** — how the chapter links to the rest of the book.

> [!tip] How to use this pack
> Cover the answers, attempt every question out loud or on paper, then reveal. Anything you miss → re-read that bullet in **Core concepts**. Re-test after a day for spacing. The expansion sections are for the second pass, once recall is solid.

## Chapters

| # | Chapter | File |
|---|---|---|
| 1 | Introduction to Building AI Applications with Foundation Models | [[01-introduction-to-building-ai-applications]] |
| 2 | Understanding Foundation Models | [[02-understanding-foundation-models]] |
| 3 | Evaluation Methodology | [[03-evaluation-methodology]] |
| 4 | Evaluate AI Systems | [[04-evaluate-ai-systems]] |
| 5 | Prompt Engineering | [[05-prompt-engineering]] |
| 6 | RAG and Agents | [[06-rag-and-agents]] |
| 7 | Finetuning | [[07-finetuning]] |
| 8 | Dataset Engineering | [[08-dataset-engineering]] |
| 9 | Inference Optimization | [[09-inference-optimization]] |
| 10 | AI Engineering Architecture and User Feedback | [[10-architecture-and-user-feedback]] |

## The book's spine in one paragraph

Foundation models turned AI from *"train a model"* into *"adapt a model."* The book walks the adaptation stack roughly in order of how much you change the model: **prompt engineering** (change the input) → **RAG** (change the context) → **agents** (change what the model can do) → **finetuning** (change the weights) → **dataset engineering** (change the training data) → **inference optimization** (change how it runs). Threaded through all of it is **evaluation** (Chapters 3–4), which Huyen treats as the hardest and most under-invested problem in the whole discipline. Chapters 1–2 set up *what foundation models are*; Chapter 10 zooms back out to *the full production architecture and the feedback loop that keeps it alive.*

> [!note] Source fidelity
> Grounded in the book's actual arguments and the repo summary in [[chip-huyen-ai-engineering-book_3abc60d3]]. Concepts and structure are reliable; a few precise figures (exact GPU memory, specific benchmark numbers) are illustrative and may differ slightly from the printed page. Anything extrapolated beyond the book is marked in expansion sections.
