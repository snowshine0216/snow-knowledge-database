---
tags: [inference-optimization, latency, throughput, kv-cache, quantization, speculative-decoding, batching, ttft, tpot, chip-huyen, study-guide, quiz]
source: https://github.com/chiphuyen/aie-book
---

# Chapter 9 — Inference Optimization

> [!abstract]+ Chapter at a glance
> A great model nobody can afford or wait for isn't a product. This chapter is about making inference **fast and cheap**: the metrics that define "fast" (**TTFT**, **TPOT**, throughput), the bottleneck that shapes everything (**memory-bound** decoding), and the optimization toolkit at the **model level** (quantization, distillation, attention tricks like the **KV cache**, **speculative decoding**) and the **service level** (**batching**, **prompt caching**, prefill/decode disaggregation).

## Core concepts

**The two phases of inference (this is the key mental model)**
- **Prefill** — process the entire input prompt in **parallel** to produce the first token. It's **compute-bound** (lots of matrix math at once).
- **Decode** — generate output tokens **one at a time**, autoregressively. Each step is **memory-bound** (you re-read the whole model's weights + KV cache to produce one token; little compute per byte moved). Decoding dominates latency for long generations.
- This split explains nearly every optimization: prefill is about **throughput/compute**, decode is about **memory bandwidth**.

**Metrics**
- **TTFT (Time To First Token)** — latency until the first token appears = **prefill** latency. Governs *perceived* responsiveness.
- **TPOT (Time Per Output Token)** — time per subsequent token = **decode** speed (a.k.a. inter-token latency). Governs how fast the answer streams.
- **Total latency** ≈ TTFT + (TPOT × number of output tokens).
- **Throughput** — total tokens/second across all users (and tokens-per-dollar) — the **cost** axis.
- **Goodput** — throughput that **meets the SLA** (requests served within latency targets), not just raw throughput.
- **Utilization**: **MFU** (Model FLOPs Utilization) and **MBU** (Model Bandwidth Utilization) — how well you're using the hardware's compute vs. memory bandwidth.

**The core tension: latency vs. throughput**
- **Batching** more requests raises **throughput** (and tokens/dollar) but can **raise TTFT/latency** for individual users. You tune toward **user-facing latency SLAs** vs. **batch-job economics** depending on the workload (online vs. offline).

**Hardware**
- **AI accelerators** (GPUs/TPUs) have three relevant properties: **compute** (FLOPs), **memory capacity**, and **memory bandwidth**. Because decoding is memory-bound, **bandwidth and memory capacity** often matter more than peak FLOPs for LLM serving.

**Model-level optimizations**
- **Quantization** — lower-precision weights/activations (int8, int4) → less memory and faster memory movement → directly helps memory-bound decode. The most broadly applicable single optimization. Methods: GPTQ, AWQ (post-training).
- **Distillation** — train a smaller, faster **student** model (Chapter 8) that's cheaper to serve.
- **Attention/architecture optimizations**:
  - **KV cache** — cache the **key/value** tensors computed for previous tokens so each new decode step doesn't recompute them; turns repeated O(n²) work into incremental work. **The single most important decode optimization** — but it **consumes a lot of memory** that grows with sequence length × batch.
  - **Multi-Query / Grouped-Query Attention (MQA/GQA)** — share K/V heads across query heads → **much smaller KV cache** (key reason long-context serving is feasible).
  - **Sparse / local attention** and **FlashAttention** — reduce attention's compute/memory cost (FlashAttention is an IO-aware exact-attention kernel).
- **Decoding optimizations**:
  - **Speculative decoding** — a small, fast **draft** model proposes several tokens; the big model **verifies** them in one forward pass, accepting the correct prefix. **2–3× speedup** when the draft is often right (e.g., code) — same output distribution, just faster.
  - **Parallel decoding / inference with reference / prompt caching** — other ways to avoid redundant generation/computation.

**Service-level optimizations**
- **Batching**:
  - **Static batching** — fixed batches; simple but wastes capacity when requests finish at different times.
  - **Dynamic batching** — group requests within a time window.
  - **Continuous / in-flight batching** — add and evict requests **at the token level** as sequences finish, keeping the GPU full. The big serving win for LLMs.
- **Prompt caching** — cache results for repeated/shared prompt prefixes (e.g., a long shared system prompt) so you don't recompute prefill every request. Huge for chat with long fixed preambles and for RAG.
- **Prefill–decode disaggregation** — run the compute-bound prefill and memory-bound decode on **separate** resources tuned for each, instead of contending on one.

## Quiz

**1.** Distinguish the prefill and decode phases, and state which is compute-bound vs. memory-bound and why.

> [!example]- Show answer
> **Prefill** processes the whole input prompt **in parallel** to produce the first output token — it's **compute-bound** because it does a large batch of matrix math at once, using the GPU's FLOPs heavily. **Decode** generates output tokens **one at a time**; each step must **re-read the model weights (and KV cache) from memory** to produce a single token, doing little compute per byte moved — so it's **memory-bandwidth-bound**. This distinction is the master key: prefill optimizations target compute/throughput, decode optimizations target memory bandwidth (KV cache, quantization, MQA/GQA).

**2.** Define TTFT and TPOT, map each to a phase, and write total latency in terms of them.

> [!example]- Show answer
> **TTFT (Time To First Token)** = latency until the first token = **prefill** latency; it drives *perceived* responsiveness. **TPOT (Time Per Output Token)** = time for each subsequent token = **decode** speed (inter-token latency); it drives how fast the answer streams. **Total latency ≈ TTFT + TPOT × (number of output tokens).** A chat UX optimizes TTFT (feel snappy) and acceptable TPOT (smooth streaming); a long-generation job is dominated by TPOT × length.

**3.** Explain the latency-vs-throughput tradeoff in batching and how you'd resolve it for (a) an interactive chatbot and (b) an overnight batch job.

> [!example]- Show answer
> **Batching** processes multiple requests together, which raises **throughput** and **tokens-per-dollar** (better hardware utilization) but can **increase per-request latency/TTFT** (a request may wait for a batch to fill, and shares compute). **(a) Interactive chatbot** — prioritize **low latency**: small/continuous batches, optimize TTFT, accept lower throughput per dollar to meet the SLA (track **goodput**, not raw throughput). **(b) Overnight batch job** — no human waiting, so prioritize **throughput/cost**: large batches, maximize tokens-per-dollar, latency is irrelevant. Same model, opposite tuning, driven by whether a user is waiting.

**4.** What is the KV cache, what does it optimize, and what's its main cost?

> [!example]- Show answer
> During decoding, attention needs the **key (K)** and **value (V)** tensors of all previous tokens. The **KV cache** stores them so each new token's step only computes K/V for the **new** token and reuses the cached rest — turning repeated O(n²) recomputation into incremental O(n) work per step. It's the **single most important decode optimization**. **Main cost: memory.** The cache size grows with **layers × heads × head_dim × sequence_length × batch_size**, so for long contexts and large batches it can consume more memory than the model weights — which is exactly what **MQA/GQA** (sharing K/V heads) and paged/efficient KV-cache management exist to tame.

**5.** How does speculative decoding speed up generation without changing the output?

> [!example]- Show answer
> A small, fast **draft model** proposes the next several tokens cheaply. The large **target model** then **verifies all of them in a single forward pass** (verification is parallel, like prefill) and **accepts the longest correct prefix**, rejecting from the first mismatch. Because one expensive forward pass can confirm multiple tokens when the draft guesses right, you get **2–3× speedup** on predictable text (e.g., code, formulaic output). Crucially, the acceptance test guarantees the **same output distribution** as the target model alone — it's a pure latency win, not a quality trade. It helps because decode is memory-bound: you were re-reading the big model's weights per token anyway, so verifying several tokens per read is nearly free.

**6.** Why does quantization help inference, and how does it connect to the memory-bound nature of decoding?

> [!example]- Show answer
> **Quantization** stores weights (and sometimes activations) in **fewer bits** (int8, int4), shrinking the model's memory footprint ~2–4×. Since **decoding is memory-bandwidth-bound** — the bottleneck is *moving the weights from memory* to compute one token — fewer bytes per weight means **less data to move per token**, so decode runs faster *and* fits in less memory (enabling bigger models/batches/longer KV cache on the same GPU). It's the most broadly applicable optimization because it attacks the actual bottleneck (bandwidth) with usually-acceptable quality loss (methods: GPTQ, AWQ).

**7.** What is continuous (in-flight) batching and why is it better than static batching for LLM serving?

> [!example]- Show answer
> In LLM serving, requests have **wildly different output lengths**, so they finish at different times. **Static batching** fixes the batch and waits for the **slowest** sequence — finished sequences' slots sit idle, wasting GPU. **Continuous / in-flight batching** operates at the **token level**: as soon as a sequence completes, it's **evicted** and a **new** request takes its slot, keeping the GPU continuously full. This dramatically improves **utilization and throughput** without forcing all requests to start/stop together — it's the central serving-level optimization for production LLM inference.

**8.** What is prompt caching and when does it pay off the most?

> [!example]- Show answer
> **Prompt caching** stores the computed prefill state (KV) for a **shared prompt prefix** so it isn't recomputed on every request. It pays off most when **many requests share a long, fixed prefix**: a lengthy **system prompt**, few-shot examples, or a large **RAG context/document** reused across turns of a conversation. Instead of re-running prefill over those identical thousands of tokens each call, you reuse the cache and only process the new suffix — cutting **TTFT and cost** substantially. The bigger and more-shared the prefix, the bigger the win.

**9.** Why might memory bandwidth and capacity matter more than peak FLOPs when choosing hardware for LLM serving?

> [!example]- Show answer
> Because **decoding — the dominant phase for most generation — is memory-bound, not compute-bound.** Each decode step re-reads the model weights and KV cache from memory to emit one token, so the limiting resource is **memory bandwidth** (how fast you can move those bytes) and **memory capacity** (whether the weights + KV cache + batch even fit). A GPU with huge FLOPs but limited bandwidth/capacity will sit underutilized during decode (low **MBU**). So for LLM inference you often optimize for bandwidth and VRAM over raw compute — the opposite of compute-bound training intuition.

**10.** *(Applied)* A RAG chat product has a 4,000-token shared system+context prefix, needs snappy responses, and serves many concurrent users on limited GPUs. Which optimizations apply and why?

> [!example]- Show answer
> Several stack cleanly. **Prompt caching** — the 4,000-token prefix is shared/repeated, so cache its prefill to slash **TTFT** and cost (biggest single win here). **Continuous/in-flight batching** — many concurrent users with varied output lengths → keep GPUs full, maximizing throughput on limited hardware. **Quantization (int8/int4)** — shrink the model so more fits per GPU (bigger batches, longer KV cache) and speed memory-bound decode. **MQA/GQA + efficient KV-cache management** — long contexts make the KV cache heavy; smaller K/V footprint enables more concurrent sequences. **Speculative decoding** — optional extra TPOT win if a good draft model is available. Tune batching toward the **latency SLA** (track **goodput**), since users are waiting. Net: prompt caching + continuous batching + quantization address the exact bottlenecks (shared prefix, concurrency, memory-bound decode).

## Deeper understanding (expansion)

> [!info]+ 💡 "Prefill is compute-bound, decode is memory-bound" explains the entire toolkit
> If you remember one thing from this chapter, make it this. Almost every optimization is just an answer to *which bottleneck am I hitting?* **Decode is memory-bound** → so we attack bytes-moved-per-token: **quantization** (fewer bits per weight), **KV cache** (don't recompute), **MQA/GQA** (smaller cache), **speculative decoding** (more tokens per weight-read). **Prefill is compute-bound** → so we batch and parallelize it, and **cache** it when shared (prompt caching). Even **prefill/decode disaggregation** falls out: the two phases stress different resources, so stop making them fight over one GPU. Once you internalize the bottleneck framing, you can *derive* the right optimization for a workload instead of memorizing a list.

> [!info]+ 💡 Goodput, not throughput — the metric that keeps you honest
> It's easy to optimize the wrong number. Raw **throughput** (tokens/sec) looks great when you crank up batch size — but if half those requests blew past their latency SLA, you shipped a worse product while the dashboard turned green. **Goodput** — throughput *that meets the SLA* — is the metric that aligns the optimization with the user experience. This mirrors a theme from Chapters 3–4: optimize a number tied to the actual outcome, not a convenient proxy. When tuning batching, watch goodput; it's the inference analog of "tie evaluation to business metrics."

> [!info]+ 💡 Inference optimization is where the whole stack's costs come due
> This chapter feels like systems trivia until you connect it to the rest of the book. **Long contexts** (RAG, Chapter 6) and **long agent trajectories** (Chapter 6) inflate the **KV cache** and decode time — your retrieval/agent design directly sets your inference bill. **Finetuning vs. a bigger model** (Chapter 7) is partly an inference-cost decision: a small finetuned model can be far cheaper to serve. **Test-time compute** (Chapter 2) — reasoning, best-of-N — is literally "spend more decode to get quality," which this chapter prices out. So inference optimization isn't a separate concern bolted on at the end; it's the **budget constraint** that every earlier architectural choice spends against. The best AI engineers design with the inference bill in mind from the start.

## Connections

- **← Chapter 2**: attention's quadratic cost and sampling are the things being optimized; test-time compute is priced here.
- **← Chapter 6**: long RAG contexts and agent loops drive KV-cache size and decode latency.
- **← Chapters 7–8**: quantization (also a finetuning topic) and distillation (a data/model strategy) reappear as serving optimizations.
- **→ Chapter 10**: caching, routing, and latency reduction are part of the production architecture.
- See also: [[chip-huyen-ai-engineering-book_3abc60d3]].
