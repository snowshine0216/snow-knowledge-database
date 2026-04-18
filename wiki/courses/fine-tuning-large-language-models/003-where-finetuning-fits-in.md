---
tags: [fine-tuning, pre-training, llm, the-pile, eleutherai, huggingface, lamini, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/z5zj8/where-finetuning-fits-in
---

# Lesson 003 — Where Finetuning Fits In

**Course:** [[_index|Finetuning Large Language Models]] · DeepLearning.AI  
**Instructor:** Sharon Zhou (Lamini)

---

## Summary

Pre-training creates a base model from scratch via next-token prediction on web-scale text. Fine-tuning starts from that base model and continues training on a much smaller, structured dataset.

---

## Pre-training

- **Starts with:** completely random weights
- **Objective:** predict next token — self-supervised (no human labels needed)
- **Data:** massive web-scraped corpus (e.g., [[The Pile]] by EleutherAI — 22 diverse datasets)
- **Cost:** extremely expensive; equivalent to reading the entire internet
- **Result:** a base model that can form language but behaves like a document-completer, not a chatbot

### The Pile Dataset
Developed by **EleutherAI**. 22 datasets: Gettysburg Address text, recipes, PubMed medical papers, GitHub code, news articles. Diversity forces broad knowledge and reasoning.

---

## Pre-training vs. Fine-tuning

| | Pre-training | Fine-tuning |
|---|---|---|
| Data volume | Massive (internet-scale) | Small (hundreds–thousands) |
| Data structure | Raw/unlabeled | Structured input-output pairs |
| Starting weights | Random | Pre-trained base model |
| Weight updates | All weights from scratch | All weights (full fine-tune) |
| Objective | Next-token prediction | Next-token prediction (same) |

> Fine-tuning for LLMs updates **all** model weights — unlike image fine-tuning which often freezes most layers.

---

## What Fine-tuning Accomplishes

1. **Behavior change** — consistent response format, moderation, focus, teasing out latent capabilities
2. **New knowledge** — domain-specific facts, corrections to outdated base model information

Most real use cases involve both simultaneously.

---

## Task Taxonomy

| Category | Direction | Examples |
|---|---|---|
| **Extracting** | Text → less text (reading) | Keyword extraction, classification, routing |
| **Expanding** | Text → more text (writing) | Chat, email drafting, code generation |

**Clarity is the strongest predictor of fine-tuning success** — know what good/bad/better output looks like before starting.

---

## First-time Checklist

1. Identify a task via prompting a large LLM — find something it does "okay but not great"
2. Pick **one** task only
3. Collect ~1,000 input-output pairs (better than the "okay" LLM's output quality)
4. Fine-tune a small model to establish a baseline

---

## Data Formats

| Format | Example | When to use |
|---|---|---|
| Concatenation | `question + "\n" + answer` | Simplest |
| Prompt template | `### Question:\n{q}\n\n### Answer:\n{a}` | Preferred; structural cues |

Store data as **JSONL** (one JSON object per line).

---

## Related

[[002-why-finetune]] · [[004-instruction-finetuning]] · [[005-data-preparation]] · [[The Pile]] · [[EleutherAI]]
