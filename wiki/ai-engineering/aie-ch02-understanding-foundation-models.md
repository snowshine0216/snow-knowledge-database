---
tags: [foundation-models, transformers, scaling-laws, rlhf, sampling, post-training, chip-huyen]
source: https://github.com/chiphuyen/aie-book
---

# AIE Ch.2 — Understanding Foundation Models

You can't make good adaptation decisions without understanding what you're adapting. This chapter opens the model: training data, architecture and scale, post-training, and sampling. Full review pack with quiz: [[02-understanding-foundation-models]].

## Key Concepts

- **Training data shapes the model** — "the model is what it eats." English dominates the web, so even multilingual models are weaker in low-resource languages; specialist domains need targeted data.
- **Transformer + attention** — each token forms **query/key/value** vectors; attention scores (Q·K) weight a sum of values, solving long-range dependencies. Cost is **quadratic** in sequence length (the central inference bottleneck, see [[aie-ch09-inference-optimization]]).
- **Scaling laws (Chinchilla)** — for a fixed compute budget there's a **compute-optimal** balance of parameters vs. training tokens (~20 tokens/param rule of thumb). Many early models were **undertrained**; capability is increasingly **data-bound**.
- **Post-training** turns a raw next-token predictor into an assistant:
  - **SFT** on (instruction, response) demonstrations teaches instruction-following.
  - **Preference finetuning** aligns to human preference — **RLHF** (reward model + RL) or the simpler RL-free **DPO**. Alignment is always an **approximation** of a fuzzy target.
- **Sampling** — the model outputs a probability distribution; generation **samples** from it. Controls: **temperature** (randomness), **top-k**, **top-p (nucleus)**. **Test-time compute** (best-of-N, chain-of-thought, self-consistency) trades latency for accuracy. **Structured outputs** via constrained decoding force valid JSON/schemas.

## Why models are inconsistent and hallucinate

- **Inconsistency** is intrinsic: same input, different sampled output.
- **Hallucination** hypotheses: the model can't cleanly separate what it **knows** from what it **generates**, and **snowballing** (an early wrong token commits it to a wrong path). SFT that "always answers" teaches it not to say *I don't know*.

## Key Takeaways

- The single load-bearing mental model for the whole book: **the model proposes a distribution; sampling picks from it.** This explains evaluation (perplexity/logprobs), test-time reasoning, and inference tricks like speculative decoding.
- Creativity and hallucination are the **same dial** seen from two sides — both come from sampling less-likely tokens.

## See Also

- [[chip-huyen-ai-engineering-book]]
- [[aie-ch01-building-ai-applications]] · [[aie-ch03-evaluation-methodology]]
- [[state-of-gpt]]
- [[adaptive-reasoning]]
