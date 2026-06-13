---
tags: [evaluation, model-selection, build-vs-buy, benchmarks, evaluation-pipeline, chip-huyen]
source: https://github.com/chiphuyen/aie-book
---

# AIE Ch.4 — Evaluate AI Systems

Chapter 3 gave the methods; this one turns them into **decisions** — selection criteria, model choice, and a private evaluation pipeline. Full review pack with quiz: [[04-evaluate-ai-systems]].

## Evaluation criteria

- **Domain-specific capability** — can it do *your* task?
- **Generation capability** — **factual consistency / faithfulness** (distinguish **local** faithfulness to provided context from **global** factuality in the world), **safety**, fluency, coherence.
- **Instruction-following** — obeys format/constraints (critical when the model is a pipeline component).
- **Cost and latency** — production constraints; weigh quality *against* them, never in isolation.

## Model selection

- **Build vs. buy** axes: data privacy, data lineage/IP, performance ceiling, functionality (function calling, context length), control/customizability, cost at scale, **vendor lock-in**. Self-hosted open models give control/privacy; commercial APIs give speed and a higher ceiling.
- **Public benchmarks are a coarse pre-filter, not a verdict** — they suffer **contamination** (benchmark data leaks into training) and aggregation bias (HELM, Open LLM Leaderboard). The only evaluation that counts is on **your** data.

## Design your evaluation pipeline (the deliverable)

1. **Evaluate all components *and* end-to-end** — so failures can be **localized** (a bad answer may be a retrieval miss, not a model error).
2. **Create evaluation guidelines** — define what "good" means with a rubric + examples, and **tie scores to business metrics**.
3. **Define methods and data** — pick the right method per criterion and collect **labeled, realistic, adversarial** data. Then iterate.

## Key Takeaways

- **The only benchmark that matters is yours** — a few hundred well-labeled realistic examples is one of the highest-ROI investments a team can make.
- Component evaluation is how you escape "vibes-based" prompt-tweaking debugging.
- Build-vs-buy is rarely permanent — abstract the model behind a **gateway/router** (see [[aie-ch10-architecture-user-feedback]]) to keep it reversible.

## See Also

- [[chip-huyen-ai-engineering-book]]
- [[aie-ch03-evaluation-methodology]] · [[aie-ch05-prompt-engineering]]
- [[human-in-the-loop]]
