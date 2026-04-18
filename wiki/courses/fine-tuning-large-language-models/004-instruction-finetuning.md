---
tags: [fine-tuning, instruction-tuning, llm, alpaca, huggingface, chatgpt, lamini, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/qy4wl/instruction-finetuning
---

# Lesson 004 — Instruction Finetuning

**Course:** [[_index|Finetuning Large Language Models]] · DeepLearning.AI  
**Instructor:** Sharon Zhou (Lamini)

---

## Summary

Instruction fine-tuning is the specific variant that **converted GPT-3 into ChatGPT**, expanding LLM adoption from researchers to hundreds of millions of users. It trains the model on **(instruction, response) pairs** instead of raw text — teaching it to follow user directives.

---

## How It Works

Instead of predicting the next token in raw text, the model learns from labeled pairs:

```
Input:  "Tell me how to train my dog to sit"
Output: "Start by holding a treat close to your dog's nose..."
```

This is **not** new knowledge — it's a **behavior change**. The model already knows the facts from pre-training; instruction tuning teaches it *how to respond*.

---

## Data Sources

- **Existing datasets** — FAQs, customer support conversations, Slack threads
- **Prompt templates** — convert documents (READMEs, docs) into Q&A pairs via LLM batch processing
- **[[Alpaca]] technique** (Stanford) — use ChatGPT as a self-distillation labeler to generate thousands of (instruction, response) pairs without human annotators

### Alpaca Template Structure
Two variants:
1. Instructions with extra context/input: `instruction + input → response`
2. Open-ended instructions (no input): `instruction → response`

Template ends with `"Response:"` — model learns to fill in the answer. Data stored as JSONL.

---

## The Generalization Insight

A key finding from the ChatGPT paper: instruction fine-tuning **generalizes to behaviors not in the training set**. The fine-tuning dataset contained no code examples (too expensive to generate), yet the resulting model could answer code questions — because the base model already knew code from pre-training, and instruction tuning taught the *response behavior* that then generalized across all pre-existing knowledge.

> Instruction fine-tuning teaches **response format**, not **what the model knows**.

---

## Pipeline

```
Data prep → Training → Evaluation → repeat
```

Data prep is the most task-specific stage. Training and evaluation are largely uniform across fine-tuning types.

---

## Lab: Model Comparisons

| Model | Prompt: "Tell me how to train my dog to sit" | Result |
|---|---|---|
| Llama-2 7B (base) | Same prompt → echoes/continues text | ❌ No question-answering |
| Llama-2 7B Chat (instruction-tuned) | Step-by-step training guide | ✅ |
| ChatGPT (~70B, instruction-tuned) | Detailed guide | ✅✅ |
| Pythia-70M (after fine-tuning on Lamini data) | "Yes, Lamini can generate technical documentation…" | ✅ |

---

## Related

[[001-introduction]] · [[003-where-finetuning-fits-in]] · [[005-data-preparation]] · [[Alpaca dataset]] · [[Stanford Alpaca]] · [[ChatGPT]]
