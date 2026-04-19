---
tags: [fine-tuning, llm, lora, peft, hardware, gpu, lamini, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/alu9a/consideration-on-getting-started-now
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What is LoRA and what problem does it solve in fine-tuning?
2. How much GPU memory does a V100 GPU (16 GB) need to *train* a 7B parameter model — is it enough?
3. What types of tasks require larger models, and why?

---

# Lecture 008: Consideration on Getting Started Now

**Source:** [Finetuning Large Language Models](https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/alu9a/consideration-on-getting-started-now) · DeepLearning.AI · Instructor: Sharon Zhou (Lamini)

## Outline

- [Practical Steps to Fine-tuning](#practical-steps-to-fine-tuning)
- [Task Complexity and Model Size](#task-complexity-and-model-size)
- [Hardware Requirements](#hardware-requirements)
- [Parameter-Efficient Fine-tuning (PEFT) and LoRA](#parameter-efficient-fine-tuning-peft-and-lora)

---

## Practical Steps to Fine-tuning

The recommended workflow for starting a fine-tuning project:

1. **Define your task** — clarify the inputs and outputs.
2. **Collect task-specific data** — structure it as input/output pairs. If data is scarce, generate synthetic examples or use prompt templates to expand the set.
3. **Start small** — fine-tune a 400M–1B parameter model first to establish a performance baseline.
4. **Vary data quantity** — experiment with different dataset sizes to understand how much data actually moves the needle.
5. **Evaluate and iterate** — collect more targeted data based on where the model falls short.
6. **Scale up** — once the smaller model is working, increase task complexity and then model size as needed.

---

## Task Complexity and Model Size

Tasks fall into two broad categories. **Reading tasks** (extraction, classification, sentiment) produce few tokens and are easier for models. **Writing tasks** (chatting, writing emails, code generation) produce many tokens and are inherently harder, requiring larger models to handle well. Combining multiple tasks in a single prompt (multi-task or agent-style requests) also increases difficulty and generally demands a larger base model.

---

## Hardware Requirements

Training is far more memory-intensive than inference because gradients and optimizer states must be stored alongside the weights. A reference table from the lesson:

| GPU | VRAM | Inference (max params) | Training (max params) |
|-----|------|------------------------|-----------------------|
| 1× V100 (AWS/cloud) | 16 GB | ~7B | ~1B |
| Larger configs | 40–80 GB+ | 13B–70B+ | 7B–13B+ |

The labs used 70M parameter models running on CPU — functional for learning but not production-grade. Starting with at least a V100-class GPU is recommended for real tasks.

---

## Parameter-Efficient Fine-tuning (PEFT) and LoRA

When full fine-tuning is too memory-expensive for large models, **PEFT** methods offer a more efficient alternative. The standout technique is **LoRA (Low-Rank Adaptation)**:

- Instead of updating all model weights, LoRA trains small **rank-decomposition matrices** inserted into selected layers. The original pre-trained weights (blue) are frozen; only the new LoRA weights (orange) are updated.
- For GPT-3, LoRA reduced the number of trainable parameters by **10,000×**, cutting GPU memory requirements by **3×**.
- Trade-off: slightly below full fine-tuning accuracy, but same inference latency (LoRA weights are merged back into the pre-trained weights at inference time).
- **Multi-tenant use case**: train separate LoRA adapters per customer on their private data, then merge the right adapter at inference time — enabling personalized models without separate full-weight copies.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Walk through the recommended 6-step practical workflow for starting a fine-tuning project.
2. Why do writing tasks require larger models than reading tasks?
3. Explain how LoRA works mechanically and what efficiency gains it achieves for GPT-3.

> [!example]- Answer Guide
> 
> #### Q1 — Six-Step Fine-Tuning Workflow
> 
> Define task → collect and structure data (generate if scarce) → fine-tune a small 400M–1B model → vary data quantity → evaluate and iterate → scale task complexity then model size.
> 
> #### Q2 — Writing vs Reading Task Size
> 
> Writing tasks produce more output tokens (chat, email, code), making the generation problem harder. More tokens means more opportunities for error, requiring larger model capacity. Reading tasks like classification produce only a few tokens.
> 
> #### Q3 — LoRA Mechanics and Efficiency
> 
> LoRA freezes the original pre-trained weights and trains small rank-decomposition matrices added to specific layers. For GPT-3 this reduced trainable parameters by 10,000×, cutting GPU memory by 3×. At inference time the LoRA weights are merged back into the base weights, so latency is unchanged.
