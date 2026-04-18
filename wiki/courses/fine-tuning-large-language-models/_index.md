---
tags: [fine-tuning, llm, instruction-tuning, training, evaluation, lora, deeplearning-ai, lamini, huggingface, pytorch]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models
---

# Finetuning Large Language Models

DeepLearning.AI short course by Sharon Zhou (Lamini). Covers the complete fine-tuning pipeline — from motivation through data preparation, training, and evaluation — with hands-on Python labs using PyTorch, Hugging Face, and Lamini.

**Instructor:** Sharon Zhou (Lamini)  
**Platform:** DeepLearning.AI  
**Prerequisites:** Python; basic ML training loop familiarity

---

## Lessons

| # | Title | Status |
|---|-------|--------|
| 001 | [[001-introduction\|Introduction]] | ✅ |
| 002 | [[002-why-finetune\|Why Finetune]] | ✅ |
| 003 | [[003-where-finetuning-fits-in\|Where Finetuning Fits In]] | ✅ |
| 004 | [[004-instruction-finetuning\|Instruction Finetuning]] | ✅ |
| 005 | [[005-data-preparation\|Data Preparation]] | ✅ |
| 006 | [[006-training-process\|Training Process]] | ✅ |
| 007 | [[007-evaluation-and-iteration\|Evaluation and Iteration]] | ✅ |
| 008 | [[008-consideration-on-getting-started-now\|Considerations on Getting Started Now]] | ✅ |
| 009 | [[009-conclusion\|Conclusion]] | ✅ |

---

## Key Topics

- [[Instruction fine-tuning]] · [[GPT-3 to ChatGPT]] · [[Fine-tuning vs prompt engineering]]
- [[Pre-training vs fine-tuning]] · [[The Pile dataset]] · [[Self-supervised learning]]
- [[Alpaca dataset]] · [[Synthetic data generation]] · [[Instruction-response pairs]]
- [[Tokenization]] · [[Padding and truncation]] · [[AutoTokenizer]]
- [[Training loop]] · [[Hyperparameters]] · [[PyTorch training]]
- [[LLM evaluation]] · [[Open LLM Leaderboard]] · [[ARC benchmark]] · [[Error analysis]]
- [[LoRA]] · [[PEFT]] · [[Parameter-efficient fine-tuning]] · [[GPU memory requirements]]

---

## Pipeline Summary

```
Data Preparation → Training → Evaluation
     ↑                              |
     └──────── iterate ─────────────┘
```

Three abstraction levels: **PyTorch** (full loop) → **Hugging Face Trainer** → **Lamini** (3 lines).
