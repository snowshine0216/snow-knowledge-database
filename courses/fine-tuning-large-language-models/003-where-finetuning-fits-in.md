---
tags: [fine-tuning, pre-training, llm, the-pile, eleutherai, huggingface, lamini, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/z5zj8/where-finetuning-fits-in
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What is self-supervised learning in the context of LLM pre-training, and why is it called that?
2. How does fine-tuning differ from pre-training in terms of data volume and training objective?
3. What are the two broad categories of fine-tuning tasks, and which direction does each go in terms of input vs. output length?

---

# Lecture 003: Where Finetuning Fits In

**Source:** [Finetuning Large Language Models](https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/z5zj8/where-finetuning-fits-in) · DeepLearning.AI · Instructor: Sharon Zhou (Lamini)

## Outline

- [Pre-training: The Step Before Fine-tuning](#pre-training-the-step-before-fine-tuning)
- [The Pile Dataset](#the-pile-dataset)
- [Where Fine-tuning Fits](#where-fine-tuning-fits)
- [What Fine-tuning Accomplishes](#what-fine-tuning-accomplishes)
- [Task Taxonomy: Extract vs. Expand](#task-taxonomy-extract-vs-expand)
- [Getting Started (First-time Checklist)](#getting-started-first-time-checklist)
- [Lab: Pre-training vs. Fine-tuning Data](#lab-pre-training-vs-fine-tuning-data)

---

## Pre-training: The Step Before Fine-tuning

Pre-training is the first stage of LLM development — it happens before fine-tuning. The model starts with completely random weights (zero knowledge, zero language skill) and learns by **next-token prediction** on a massive corpus of web-scraped text.

- **Learning objective**: predict the next word/token — given "four score seven years" → predict "ago". Early in training the model outputs nonsense; after training it predicts correctly.
- **Data**: "unlabeled" because it's raw scraped text, not hand-annotated. Despite this, it goes through many cleaning steps — calling it truly unlabeled understates the curation effort.
- **Self-supervised learning**: the model supervises itself using the next token as the label. No external annotation is needed.
- **Cost**: extremely expensive and time-consuming — the model reads the equivalent of the entire internet to go from random noise to language understanding.

After pre-training, the base model can form language and reason — but behaves more like a document-completer than a chatbot. Given a geography homework list ("What's the capital of India? Kenya? France?"), it will continue the pattern with another country name rather than answering the final question.

---

## The Pile Dataset

Developed by **EleutherAI** as an open-source pre-training corpus: 22 diverse datasets scraped from the internet. Examples from The Pile:

- Lincoln's Gettysburg Address ("four score seven years")
- Caretaker recipes
- PubMed medical texts
- GitHub code (Python, XML, etc.)
- News articles (e.g., Amazon AWS announcements)

The diversity is intentional — mixing intellectual domains forces the model to develop broad knowledge and reasoning ability.

---

## Where Fine-tuning Fits

Pre-training → **base model** → Fine-tuning → **fine-tuned model** → (optional) further fine-tuning rounds.

Key differences between pre-training and fine-tuning:

| | Pre-training | Fine-tuning |
|---|---|---|
| Data volume | Massive (entire internet) | Much less (hundreds to thousands) |
| Data structure | Unlabeled / raw | Structured input-output pairs (preferred) |
| Starting weights | Random | Pre-trained base model |
| Training objective | Next token prediction | Next token prediction (same) |
| Weight updates | All weights, from scratch | All weights (unlike image fine-tuning which often freezes layers) |

Fine-tuning for LLMs updates the **entire model's weights**, not just a classification head. This is a different definition than fine-tuning in image ML (e.g., ImageNet), where you often freeze most layers.

---

## What Fine-tuning Accomplishes

Two categories:

1. **Behavior change**: teach the model to respond in a specific style or format.
   - More consistent outputs (e.g., always answer as a chatbot, not continue text).
   - Better focus and moderation.
   - Teasing out latent capabilities without heavy prompt engineering.

2. **New knowledge**: inject information not in the base model.
   - Domain-specific facts (company documentation, medical guidelines).
   - Correcting outdated or incorrect information.

Most real use cases involve **both** simultaneously.

---

## Task Taxonomy: Extract vs. Expand

All LLM fine-tuning is "text in → text out." Two directions:

| Category | Direction | Examples |
|---|---|---|
| **Extracting** | Text in → less text out (reading) | Keyword extraction, topic classification, routing to agents/APIs |
| **Expanding** | Text in → more text out (writing) | Chat, email drafting, code generation |

**Clarity is the strongest predictor of fine-tuning success**: know exactly what good, bad, and better output looks like for your specific task before you start.

---

## Getting Started (First-time Checklist)

Recommended process for a first fine-tuning project:

1. **Identify a task** by prompt engineering a large LLM (e.g., ChatGPT). Find something it does "okay but not great" — meaning it's achievable but has room for improvement.
2. **Pick one task only** — don't try to fine-tune for multiple objectives at once.
3. **Collect ~1,000 input-output pairs** for that task. The golden starting number. Pairs should be *better* than the "okay" LLM output — don't just generate them from a weaker model.
4. **Fine-tune a small LLM** on this data to get a baseline performance measurement.

---

## Lab: Pre-training vs. Fine-tuning Data

The lab contrasts two datasets side by side:

**The Pile (pre-training):**
- Streamed (too large to download): `load_dataset("EleutherAI/pile", split="train", streaming=True)`
- Examples: random forum posts ("it is done and submitted"), raw XML code, news articles, fishing charter pages. Hodgepodge of internet content.

**Lamini docs (fine-tuning):**
- Structured Q&A pairs from company FAQ and engineering documentation about Lamini.
- Loaded as a local JSON file; much smaller.

**Data formatting approaches:**

| Approach | What it looks like | When to use |
|---|---|---|
| **Concatenation** | `question + "\n" + answer` | Simplest; sometimes sufficient |
| **Prompt template** | `### Question:\n{q}\n\n### Answer:\n{a}` | Preferred; `###` markers give the model structural cues |

The `###` prefix markers serve dual purpose: they help the model identify what comes next during training, and they help you parse/strip the model's output after inference.

Data is typically stored as **JSONL** (`.jsonl`): each line is a complete JSON object. Hugging Face also supports uploading datasets to the Hub for easy reuse across notebooks.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Describe the pre-training process: what does the model start with, what does it learn to do, and why is it called self-supervised?
2. What are the two things fine-tuning can accomplish, and how do they differ?
3. What is the recommended starting quantity of training examples for a first fine-tuning project, and why does the quality of those examples matter more than just generating them from a weaker LLM?

> [!example]- Answer Guide
> #### Q1 — Pre-training: weights, task, supervision
> The model starts with completely random weights — no language, no knowledge. It learns by predicting the next token on web-scale text. It's called self-supervised because the next token in the sequence acts as its own label; no human annotation is needed.
> 
> #### Q2 — Two purposes of fine-tuning
> Behavior change: the model responds in a consistent format (chatbot style, moderation, focus) rather than continuing raw text. New knowledge: inject domain-specific or updated facts not present in the base model. Most real use cases do both.
> 
> #### Q3 — Starting quantity and data quality
> ~1,000 input-output pairs is a good starting point. Quality matters because if you generate pairs from an "okay" LLM, you bake in that model's weaknesses — the fine-tuned model can't exceed the quality of its training targets.
