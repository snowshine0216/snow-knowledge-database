---
tags: [ai-engineering, llm, foundation-models, rag, agents, finetuning, evaluation, prompt-engineering, inference-optimization, dataset-engineering, chip-huyen]
source: https://github.com/chiphuyen/aie-book
---

# AI Engineering — Chip Huyen (O'Reilly 2025)

The definitive engineering guide to building production applications on top of foundation models. Written by Chip Huyen over two years and backed by 1,200+ references, the book covers the entire adaptation stack: from model selection and evaluation through prompt engineering, RAG, agents, finetuning, dataset construction, and inference optimization. Unlike tutorial books, it focuses on timeless engineering decisions ("should I finetune or RAG?", "build vs. buy?") so it doesn't go stale with API changes. The companion GitHub repo provides the table of contents, chapter summaries, a curated resource list, prompt examples, and case studies.

## Key Concepts

- **AI Engineering Stack (3 layers)**: Application (prompt engineering, RAG, agents) → Model (finetuning, evaluation) → Infrastructure (inference serving, optimization). AI engineering differs from traditional ML engineering in that context construction replaces feature engineering, and PEFT replaces full retraining.
- **Probabilistic nature**: Sampling makes LLMs non-deterministic. Temperature / top-p / top-k control randomness. Test-time compute (chain-of-thought, self-consistency) trades latency for accuracy. All evaluation pipelines must accommodate this.
- **Evaluation crisis**: Public benchmarks are contaminated (training data includes benchmark data). AI-as-a-judge scores are not comparable across different judge models and drift as models update. The only reliable signal is a private labeled evaluation pipeline built for your specific task.
- **RAG vs. Finetuning decision**: Use RAG to inject facts the model doesn't know; use finetuning to change style, behavior, or format consistency. Most production systems need both. RAG-first is the safer starting point because finetuning is expensive and locks in assumptions.
- **LoRA economics**: Low-rank adaptation reduces trainable parameters by ~99% — a 7B model is now finetuneable on a single A100 40 GB. LoRA adapters are modular: multiple adapters can be hot-swapped on one base model at serve time, enabling multi-tenant fine-tuned serving.
- **Inference optimization metrics**: TTFT (time to first token, dominated by prefilling) vs. TPOT (time per output token, dominated by decoding). Batching increases throughput but increases TTFT. KV cache is the single biggest optimization for autoregressive generation. Speculative decoding (draft model + verifier) delivers 2–3× speedup on tasks where the draft is usually right.
- **Synthetic data viability**: Self-instruct (GPT generates instruction/output pairs) works for instruction finetuning, but diversity injection (topic sampling, seed variation) is critical to avoid distribution collapse. The annotation guideline — not the generation — is the creative bottleneck.
- **Agent failure modes**: Every tool call is an attack surface. Prompt injection via retrieved web content, infinite loops, and noisy tool output are the most common failures. Sandboxing and output filtering are non-negotiable for production agents.

## Key Numbers

| Fact | Value |
|---|---|
| Book length | 150,000 words, 10 chapters |
| Reference links | 1,200+ |
| Full finetuning memory (7B, fp32) | ~112 GB GPU RAM |
| LoRA trainable parameter reduction | ~99% |
| Speculative decoding speedup | 2–3× |
| int4 quantization memory reduction | ~4× |
| Typical deduplication removal rate | 15–30% of web corpora |

## Key Takeaways

- Evaluation is the hardest unsolved problem in AI engineering — invest in a private labeled pipeline before optimizing model or prompts.
- The AI engineering stack's three-layer model maps directly to org structure: different teams own application, model, and infrastructure layers.
- Test-time compute (CoT, self-consistency) often outperforms bigger models on reasoning tasks at a fraction of the pre-training cost — a paradigm shift post-o1.
- Perplexity is underused as a data quality signal: filter both low-perplexity (repetitive/formulaic) and extremely high-perplexity (garbled) text from training corpora.
- Foundation model availability shifted AI engineering's core skill from "train a model" to "construct context" — RAG, tool use, and agent memory are the new feature engineering.

## See Also

- [[karpathy-loopy-era-ai]]
- [[state-of-gpt]]
- [[harness-engineering]]
- [[ai-engineering-three-patterns]]
- [[autoresearch-karpathy]]
