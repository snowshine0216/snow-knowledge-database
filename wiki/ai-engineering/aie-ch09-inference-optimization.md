---
tags: [inference-optimization, latency, throughput, kv-cache, quantization, speculative-decoding, batching, ttft, tpot, chip-huyen]
source: https://github.com/chiphuyen/aie-book
---

# AIE Ch.9 — Inference Optimization

Making inference fast and cheap. The master mental model: **prefill is compute-bound, decode is memory-bound.** Full review pack with quiz: [[09-inference-optimization]].

## Two phases + metrics

- **Prefill** processes the whole prompt in parallel → first token; **compute-bound**.
- **Decode** generates tokens one at a time, re-reading weights + KV cache per token; **memory-bandwidth-bound** and dominates long-generation latency.
- **TTFT** (time to first token) = prefill latency; **TPOT** (time per output token) = decode speed. **Total ≈ TTFT + TPOT × output tokens.**
- **Throughput** = tokens/sec/dollar; **goodput** = throughput that meets the SLA (the metric that keeps you honest). Utilization: **MFU** (compute), **MBU** (bandwidth).
- **Tension**: batching raises throughput but can raise per-request latency → tune to the workload (online vs. offline).

## Model-level optimizations

- **Quantization** (int8/int4) — fewer bytes/weight directly speeds memory-bound decode; the most broadly applicable optimization (GPTQ, AWQ).
- **KV cache** — cache key/value tensors so decode doesn't recompute them. The single biggest decode optimization; its **cost is memory** (grows with seq_len × batch). **MQA/GQA** shrink it by sharing K/V heads; **FlashAttention** is an IO-aware exact kernel.
- **Speculative decoding** — a small **draft** model proposes tokens; the big model **verifies** them in one pass. **2–3×** speedup with the **same output distribution** (decode is memory-bound, so verifying several tokens per weight-read is nearly free).
- **Distillation** — serve a smaller student model ([[aie-ch08-dataset-engineering]]).

## Service-level optimizations

- **Continuous / in-flight batching** — evict finished sequences and admit new ones at the token level, keeping the GPU full; the key serving win.
- **Prompt caching** — reuse prefill for shared prefixes (long system prompts, RAG context).
- **Prefill–decode disaggregation** — run the two phases on resources tuned for each.

## Key Takeaways

- The bottleneck framing lets you **derive** the right optimization instead of memorizing a list.
- Inference is where the whole stack's costs come due — long RAG contexts, agent loops, and test-time compute all spend against the **inference bill**. Design with it in mind from the start.

## See Also

- [[chip-huyen-ai-engineering-book]]
- [[aie-ch08-dataset-engineering]] · [[aie-ch10-architecture-user-feedback]]
- [[llm-api-statelessness]]
