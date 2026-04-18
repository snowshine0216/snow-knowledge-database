---
tags: [fine-tuning, llm, prompt-engineering, rag, privacy, lamini, deeplearning-ai, pytorch, huggingface]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/ig7ql/why-finetune
---

# Lesson 002 — Why Finetune

**Course:** [[_index|Finetuning Large Language Models]] · DeepLearning.AI  
**Instructor:** Sharon Zhou (Lamini)

---

## Summary

Fine-tuning specializes a general-purpose LLM for a specific domain — the same process that turned GPT-3 into ChatGPT and GPT-4 into GitHub Copilot.

**Analogy:** A general LLM is a primary care physician (broad coverage). A fine-tuned model is a cardiologist — deeper expertise in a narrower domain.

---

## Fine-tuning vs. Prompt Engineering

| Dimension | Prompt Engineering | Fine-tuning |
|---|---|---|
| Data needed | None | High-quality labeled pairs |
| Upfront cost | Low | Compute cost |
| Data capacity | Limited by context window | Effectively unlimited |
| Hallucination correction | Hard | Possible |
| Consistency | Variable | High |
| Best for | Prototypes | Production, domain-specific |

[[RAG]] can be combined with both approaches but doesn't bake knowledge into weights.

---

## Three Benefits

**Performance** — reduces [[hallucination]]s within your domain, increases expertise, enables reliable moderation (e.g., redirecting off-topic queries).

**Privacy** — training runs inside your own VPC or on-premise; no data leakage to third-party APIs. Critical for proprietary internal data.

**Cost** — a fine-tuned *smaller* model replaces an expensive large model for high-throughput tasks. Sub-200ms latency is achievable; GPT-4 can take 30+ seconds.

---

## Python Stack

Three abstraction levels used throughout the course:

1. **PyTorch** — lowest level; direct training loop control
2. **Hugging Face Transformers/Datasets** — `Trainer` class, `load_dataset`
3. **Lamini** — highest level; `model.train()` in 3 lines

---

## Lab Insight

Non-fine-tuned Llama-2 asked "Tell me how to train my dog to sit" → echoes the question back (it's a text completer, not a question-answerer). Fine-tuned Llama-2 Chat → step-by-step training guide. Adding `[INST]`/`[/INST]` tags anchors the model further.

---

## Related

[[001-introduction]] · [[003-where-finetuning-fits-in]] · [[004-instruction-finetuning]] · [[006-training-process]]
