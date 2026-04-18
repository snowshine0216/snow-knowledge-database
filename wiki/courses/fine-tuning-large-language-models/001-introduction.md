---
tags: [fine-tuning, llm, instruction-tuning, lamini, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/ep67b/introduction
---

# Lesson 001 — Introduction

**Course:** [[_index|Finetuning Large Language Models]] · DeepLearning.AI  
**Instructor:** Sharon Zhou (Lamini)

---

## Summary

Fine-tuning takes an existing pre-trained LLM and continues training it on a smaller, task-specific dataset. It sits between [[prompt engineering]] and training from scratch — cheaper than pre-training while more powerful than prompting alone.

---

## Core Concepts

### Why Fine-tune?
Prompting works for clearly-specified tasks but struggles to produce reliable **behavioral consistency** and stylistic control. Fine-tuning solves both by training the model on domain data rather than injecting it via the context window.

### Fine-tuning vs. Prompting vs. RAG
| Approach | Where knowledge lives | Cost |
|---|---|---|
| Prompting | Context window (ephemeral) | None |
| [[RAG]] | Retrieved at inference time | Low |
| Fine-tuning | Baked into weights | Compute |

All three are complementary and can be combined.

### Instruction Fine-tuning
The technique that transformed **GPT-3 → ChatGPT**. Instead of next-token prediction on raw text, the model is trained on (instruction, response) pairs — teaching it to follow natural-language directives. See [[004-instruction-finetuning]].

### Course Roadmap
1. What fine-tuning is and when to use it
2. How it fits in the LLM training pipeline
3. Instruction fine-tuning mechanics
4. Hands-on: [[005-data-preparation]], [[006-training-process]], [[007-evaluation-and-iteration]]

---

## Related

[[002-why-finetune]] · [[003-where-finetuning-fits-in]] · [[004-instruction-finetuning]]
