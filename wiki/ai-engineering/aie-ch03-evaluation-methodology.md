---
tags: [evaluation, perplexity, cross-entropy, ai-as-judge, elo, metrics, chip-huyen]
source: https://github.com/chiphuyen/aie-book
---

# AIE Ch.3 — Evaluation Methodology

Evaluation is the book's recurring hard problem. This chapter builds the toolbox, moving from intrinsic automatic metrics to methods that handle open-ended output. Full review pack with quiz: [[03-evaluation-methodology]].

## The evaluation ladder (scalability ↔ fidelity)

- **Language-modeling metrics** — **cross-entropy** and **perplexity** (= exp of cross-entropy), interpreted as the model's **effective branching factor**. Good for **data-quality filtering** and **contamination detection**; *not* a measure of task quality. Undefined for APIs that hide logprobs.
- **Exact evaluation**:
  - **Functional correctness** — does the output *work*? (code passes tests, math equals solution). The gold standard when definable.
  - **Similarity to reference** — **exact match**, **lexical** (BLEU/ROUGE, n-gram overlap, blind to paraphrase), **semantic** (BERTScore / embedding cosine, captures meaning). All break when a good answer simply differs from the reference.
- **AI-as-a-judge** — a model scores outputs against a rubric. Scalable and flexible for open-ended tasks, but biased: **inconsistency, criteria ambiguity, self-bias, position bias, verbosity bias**, plus **drift** and cross-judge non-comparability. The **rubric is the spec** — reliability is gated by it.
- **Comparative evaluation** — rank models head-to-head ("A beat B") and aggregate with **Elo** (powers Chatbot Arena). Avoids absolute-score calibration but is expensive, hard to reproduce, and only **relative**.

## Key Takeaways

- **Evaluate over multiple runs**: generation and the judge are both samplers, so a single-run score is one draw from a distribution. Report mean *and* variance.
- **The judge can't be stronger than its rubric** — front-load criteria, prefer binary/pairwise over holistic scores, decompose ("faithful? y/n").
- A mature strategy **layers** cheap automatic metrics, model judges, and a small **human-labeled anchor** that calibrates everything.

## See Also

- [[chip-huyen-ai-engineering-book]]
- [[aie-ch02-understanding-foundation-models]] · [[aie-ch04-evaluate-ai-systems]]
- [[human-in-the-loop]]
