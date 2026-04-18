---
tags: [fine-tuning, llm, lora, peft, hardware, gpu, lamini, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/alu9a/consideration-on-getting-started-now
---

# Lesson 008 — Considerations on Getting Started Now

**Course:** [[_index|Finetuning Large Language Models]] · DeepLearning.AI  
**Instructor:** Sharon Zhou (Lamini)

---

## Summary

Practical workflow for launching a fine-tuning project, hardware requirements, task-complexity guidance, and [[LoRA]] as a memory-efficient alternative to full fine-tuning.

---

## Practical 6-Step Workflow

1. **Define task** — clarify inputs and outputs
2. **Collect data** — structure as input/output pairs; generate synthetic if scarce
3. **Start small** — fine-tune a **400M–1B parameter** model first for a cheap baseline
4. **Vary data quantity** — experiment to understand how much data moves the needle
5. **Evaluate and iterate** — collect more targeted data based on failures
6. **Scale up** — increase task complexity, then model size as needed

---

## Task Complexity and Model Size

| Task type | Output tokens | Model size needed |
|---|---|---|
| Reading (extraction, classification, sentiment) | Few | Smaller model sufficient |
| Writing (chat, email, code generation) | Many | Larger model required |
| Multi-task / agent-style | Variable | Largest models |

Writing tasks are harder because more output tokens = more opportunities for error.

---

## Hardware Requirements

Training stores gradients + optimizer states alongside weights — far more memory-intensive than inference.

| GPU | VRAM | Inference (max) | Training (max) |
|---|---|---|---|
| 1× V100 (AWS/cloud) | 16 GB | ~7B params | ~1B params |
| Larger configs | 40–80 GB+ | 13B–70B+ | 7B–13B+ |

Labs use Pythia-70M on CPU — functional for learning but not production-grade. A V100 is the practical minimum for real tasks.

---

## LoRA — Low-Rank Adaptation

When full fine-tuning is too memory-expensive, [[PEFT]] methods offer an efficient alternative. **LoRA** is the dominant technique:

### How LoRA Works
- Freeze original pre-trained weights
- Insert small **rank-decomposition matrices** into selected layers
- Only train the new low-rank matrices (~0.01% of parameters)
- At inference time, merge LoRA weights back into pre-trained weights → **zero added latency**

### LoRA Efficiency (GPT-3)
| Metric | Full fine-tuning | LoRA |
|---|---|---|
| Trainable parameters | All ~175B | ~17.5M (10,000× fewer) |
| GPU memory | Baseline | ~3× reduction |
| Inference latency | Baseline | Same (weights merged) |
| Accuracy | Higher | Slightly below full |

### Multi-tenant Use Case
Train separate LoRA adapters per customer on their private data → merge the right adapter at inference → personalized models without separate full-weight copies.

---

## Related

[[007-evaluation-and-iteration]] · [[009-conclusion]] · [[LoRA]] · [[PEFT]] · [[Parameter-efficient fine-tuning]] · [[GPU memory]]
