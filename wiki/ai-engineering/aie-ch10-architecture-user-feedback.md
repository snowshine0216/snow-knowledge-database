---
tags: [architecture, guardrails, model-router, gateway, caching, monitoring, user-feedback, feedback-loops, chip-huyen]
source: https://github.com/chiphuyen/aie-book
---

# AIE Ch.10 — Architecture and User Feedback

The closing chapter assembles everything into a production architecture and the feedback loop that keeps it improving. Full review pack with quiz: [[10-architecture-and-user-feedback]].

## Architecture as a complexity ladder

Start from a bare model call and add components **only as the problem demands**:

1. **Enhance context** — RAG / tools ([[aie-ch06-rag-and-agents]]).
2. **Guardrails** — **input** (PII leakage, injection defense) and **output** (failures, unsafe/low-quality content). See [[defense-in-depth]].
3. **Model router + gateway** — **router** sends each query to the right/cheapest capable model; **gateway** centralizes auth, rate limiting, fallback, logging, and **vendor abstraction** (the anti-lock-in mechanism from [[aie-ch04-evaluate-ai-systems]]).
4. **Caches** — **exact/prompt cache** (identical/shared prefixes) and **semantic cache** (embedding-similar queries — powerful but risks wrong-but-similar hits; tune the threshold).
5. **Agent patterns** — added **last**: highest capability, highest operational/security cost.

**Monitoring & observability** wrap it all — **metrics, logs, traces**. Traces localize failures across the multi-component pipeline (the production form of component evaluation). A lightweight **judge model** on live output detects quality regressions.

## User feedback — the renewable fuel

- **Why special**: proprietary, continuous, real-world — it powers the improvement flywheel and counters [[aie-ch08-dataset-engineering|model collapse]].
- **Explicit** (thumbs/ratings) — clear but sparse and extreme-biased.
- **Implicit / conversational signals** — abundant but noisy: **regeneration**, **early termination**, **error correction**, edits, session length.
- **Design**: leverage standardized in-UX signals; tune **friction** (too much → no feedback, too little → noisy).
- **Traps**: **degenerate feedback loops** (model output shapes its own next training data → self-narrowing) and **bias** (vocal/extreme users). Counter with diverse/real data, exploration, and distribution-shift monitoring. See [[human-in-the-loop]].

## Key Takeaways

- **Climb the complexity ladder only as far as you must** — the most common production failure is over-engineering (an agent where context + a guardrail would do).
- **User feedback is the moat and the trap** — uniquely yours, but a model-collapse machine if optimized blindly.
- The book is a **closed loop**: build on a foundation model → adapt → evaluate → serve efficiently → collect feedback → improve data/model → repeat.

## See Also

- [[chip-huyen-ai-engineering-book]]
- [[aie-ch09-inference-optimization]] · [[aie-ch01-building-ai-applications]]
- [[ai-engineering-three-patterns]] · [[human-in-the-loop]] · [[context-compaction]]
