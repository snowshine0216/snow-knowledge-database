---
tags: [fine-tuning, llm, prompt-engineering, rag, privacy, lamini, deeplearning-ai, pytorch, huggingface]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/ig7ql/why-finetune
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What are two key limitations of prompt engineering that fine-tuning overcomes?
2. When would you prefer fine-tuning over RAG for a production use case?
3. What analogy describes the difference between a general-purpose LLM and a fine-tuned one?

---

# Lecture 002: Why Finetune

**Source:** [Finetuning Large Language Models](https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/ig7ql/why-finetune) · DeepLearning.AI · Instructor: Sharon Zhou (Lamini)

## Outline

- [What Fine-tuning Does](#what-fine-tuning-does)
- [Fine-tuning vs. Prompt Engineering](#fine-tuning-vs-prompt-engineering)
- [Benefits of Fine-tuning Your Own LLM](#benefits-of-fine-tuning-your-own-llm)
- [Python Libraries Used in This Course](#python-libraries-used-in-this-course)
- [Lab: Fine-tuned vs. Non-fine-tuned Model Comparison](#lab-fine-tuned-vs-non-fine-tuned-model-comparison)

---

## What Fine-tuning Does

Fine-tuning takes a general-purpose model and specializes it for a specific task — the same process that transformed GPT-3 (a general LLM) into ChatGPT (a chat specialist) or GPT-4 into GitHub Copilot (a code-completion specialist). The analogy: a general-purpose LLM is like a primary care physician (PCP) — useful for broad checkups. A fine-tuned model is like a cardiologist or dermatologist — deeper expertise in a narrower domain.

Mechanically, fine-tuning exposes the model to far more task-specific data than can fit in a prompt, allowing the model to *learn* from that data rather than just read it once. It achieves three things:

- **Specialization**: upgrades the base model's expertise in your domain (e.g., dermatology symptoms → specific differential diagnosis vs. "probably acne").
- **Behavioral consistency**: base LLMs often generate unexpected completions (e.g., asked "what's your first name?" the model continues with "what's your last name?" because it's seen survey data). Fine-tuning reliably produces the desired response form.
- **Hallucination reduction**: corrects incorrect or outdated information baked into the base model's weights.

---

## Fine-tuning vs. Prompt Engineering

| | Prompt Engineering | Fine-tuning |
|---|---|---|
| Data needed to start | None | High-quality labeled pairs |
| Upfront cost | Low | Compute cost for training |
| Data capacity | Limited by context window | Effectively unlimited |
| Hallucinations | Hard to correct | Can be reduced |
| Consistency | Variable | High |
| Best for | Prototypes, generic use | Production, domain-specific |

RAG (Retrieval-Augmented Generation) is a technique that can be combined with *both* approaches — it selectively injects relevant data into the prompt. However, RAG alone can retrieve incorrect chunks and propagate errors; fine-tuning bakes the knowledge directly into the weights and remains complementary to RAG even after training.

---

## Benefits of Fine-tuning Your Own LLM

**Performance**: reduces hallucinations within your domain, increases expertise, enables reliable moderation (e.g., teaching the model to respond "I don't know about that" or redirect off-topic queries instead of making something up).

**Privacy**: fine-tuning can happen inside your own VPC or on-premise, preventing data leakage to third-party providers — critical when training on proprietary internal data accumulated over years or decades.

**Cost**: a fine-tuned *smaller* model can replace an expensive large model for high-throughput use cases. Smaller models mean lower per-request cost, better uptime control, and lower latency — for latency-sensitive applications like autocomplete, sub-200 ms response is required; GPT-4 can take 30+ seconds.

---

## Python Libraries Used in This Course

Three tiers of abstraction, all used in labs:

1. **PyTorch** (Meta) — lowest-level interface; direct control over training loops, tensors, and gradients.
2. **Hugging Face Transformers/Datasets** — higher-level; easy dataset loading (`load_dataset`) and model training utilities.
3. **Lamini** — highest-level; train a model in 3 lines of code, built on top of PyTorch and Hugging Face.

---

## Lab: Fine-tuned vs. Non-fine-tuned Model Comparison

The lab uses Lamini's hosted Llama-2 models to contrast behavior:

- **Non-fine-tuned Llama-2**: asked "Tell me how to train my dog to sit" → echoes the question back ("tell me how to train my dog to sit on command, tell me how to teach my dog to come…") because it's completing text, not answering. Asked "What do you think of Mars?" → repetitive philosophical loop ("I think it's a great planet. I think it's a good planet.").
- **Fine-tuned Llama-2 Chat**: same prompt → step-by-step training guide. Adding `[INST]`/`[/INST]` instruction tags further anchors the model and stops unwanted auto-completion. On Mars: "It's a fascinating planet that has captured the imagination of humans for centuries."

The difference is clear and immediate. ChatGPT (estimated 70B parameters) also demonstrates this — vs. the 7B Llama-2 models used in labs — showing that both fine-tuned smaller and larger models consistently outperform their non-fine-tuned equivalents on instruction-following tasks.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Using the PCP/cardiologist analogy, explain what fine-tuning does to a base LLM.
2. What are the three main benefits of fine-tuning your own LLM, and give one specific example for each?
3. In the lab demo, what did the non-fine-tuned Llama-2 do when asked "Tell me how to train my dog to sit" — and why?

> [!example]- Answer Guide
> #### Q1 — Fine-Tuning as Specialisation
> 
> A general-purpose LLM is like a PCP (good for general checkups). Fine-tuning specializes it into a domain expert like a cardiologist — able to diagnose heart problems in much greater depth because it has learned from domain-specific training data.
> 
> #### Q2 — Three Fine-Tuning Benefits
> 
> **Performance** — a dermatology-tuned model gives a specific diagnosis from symptoms instead of "probably acne."
> 
> **Privacy** — fine-tuning inside your VPC prevents data leakage to third-party APIs.
> 
> **Cost** — a fine-tuned smaller model can deliver sub-200ms autocomplete latency vs 30+ seconds for GPT-4, at lower per-request cost.
> 
> #### Q3 — Base Model Completion Behavior
> 
> It echoed the question back and generated related questions ("tell me how to teach my dog to come, how to get my dog to heel…") because the base model was trained to predict and continue text, not to answer questions — it behaved like a text completion engine, not a chat assistant.
