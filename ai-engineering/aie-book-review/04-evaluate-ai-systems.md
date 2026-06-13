---
tags: [evaluation, model-selection, build-vs-buy, benchmarks, evaluation-pipeline, chip-huyen, study-guide, quiz]
source: https://github.com/chiphuyen/aie-book
---

# Chapter 4 — Evaluate AI Systems

> [!abstract]+ Chapter at a glance
> Chapter 3 gave you the *methods*; this chapter turns them into *decisions*. It defines the **criteria** that matter for a real system (domain capability, generation quality, instruction-following, cost, latency), walks the **model selection** workflow including **build-vs-buy** and how to read **public benchmarks** skeptically, and ends with the book's most actionable deliverable: how to **design your own evaluation pipeline** with written guidelines and labeled data.

## Core concepts

**Evaluation criteria — what "good" actually means for a system**
- **Domain-specific capability** — can the model do *your* task (legal reasoning, coding in your stack, your language)? Measured with domain benchmarks and your own tests.
- **Generation capability** — qualities of the produced text:
  - **Factual consistency / faithfulness** — is the output supported by the source/context (or by reality)? Distinguish **local** faithfulness (consistent with provided context) from **global** factuality (true in the world). Verification can use NLI/entailment, AI judges, or retrieval-backed checks.
  - **Safety** — toxicity, bias, harmful content, privacy leakage.
  - Plus fluency, coherence, relevance.
- **Instruction-following capability** — does it obey the format, constraints, and intent of the prompt (e.g., "answer in JSON," "under 100 words")? A capable-but-disobedient model is hard to build on.
- **Cost and latency** — non-negotiable production constraints. The "best" model on quality may be too slow or too expensive; evaluation must weigh quality *against* cost and latency, not in isolation.

**Model selection workflow**
- It's **iterative**: filter by hard constraints → shortlist → evaluate on your task → re-evaluate as needs evolve. Two big forks:
- **Build vs. buy** (self-host open model vs. use a commercial API). Weigh axes such as: **data privacy** (does data leave your boundary?), **data lineage / IP** (training-data provenance, licensing), **performance ceiling**, **functionality** (function calling, structured output, context length), **control / customizability**, **cost** at your scale, and **vendor lock-in**.
  - Commercial APIs: fastest to start, strong models, but less control, recurring cost, privacy/lock-in concerns.
  - Open-source / self-hosted: control, privacy, no per-token vendor fee, but you own serving, ops, and the performance gap.
- **Navigating public benchmarks**:
  - Benchmarks help **filter** candidates but are **noisy and gameable**.
  - **Contamination**: benchmark data leaks into training sets → inflated scores.
  - **Benchmark selection & aggregation**: leaderboards like **HELM** and the **Open LLM Leaderboard** aggregate many benchmarks; aggregation hides task-level weaknesses and weighting is subjective.
  - Rule: use public benchmarks as a **coarse pre-filter**, never as the final word — the only evaluation that counts is on **your** data and task.

**Design your evaluation pipeline (the deliverable)**
A repeatable, three-part process:
1. **Evaluate all components and end-to-end.** A system is a pipeline (retriever, prompt, model, post-processing, etc.). Evaluate each component *and* the whole, so you can localize failures (a bad answer might be a retrieval miss, not a model error).
2. **Create evaluation guidelines.** Write down **what good means** for your task: a scoring rubric, explicit criteria, examples of good/bad outputs, and — crucially — **tie scores to business metrics** so "8/10 helpfulness" actually maps to a user/revenue outcome. The guideline is the spec that makes any method (human or AI judge) reliable.
3. **Define evaluation methods and data.** Choose methods per criterion (functional correctness, similarity, AI judge, human) and **collect labeled evaluation data** that reflects real usage — including hard and adversarial cases.
- Then **iterate**: the pipeline is a living asset you refine as you discover new failure modes.

## Quiz

**1.** Distinguish **local faithfulness** from **global factuality**, and why the difference matters for a RAG system.

> [!example]- Show answer
> **Local faithfulness** asks: is the output consistent with the **provided context** (the retrieved documents)? **Global factuality** asks: is the output **true in the real world**, regardless of context? They diverge when the context itself is wrong: a RAG answer can be perfectly *faithful* to a retrieved document that is *factually false*. For RAG you usually evaluate **faithfulness** first (did the generator stick to its sources, i.e., not hallucinate beyond them), because that's what the generator controls — and separately assess source quality for global truth. Conflating the two hides whether a failure is a retrieval problem or a generation problem.

**2.** Why must evaluation always weigh quality against cost and latency rather than maximizing quality alone?

> [!example]- Show answer
> Because cost and latency are **production constraints**, not afterthoughts. The highest-quality model may be too expensive per token at your traffic, or too slow for an interactive UX (violating a latency SLA). A slightly weaker model that's 5× cheaper and 3× faster can be the *better system choice*. Evaluation that reports only quality will pick a model you can't actually afford to ship — so the pipeline must score quality, cost, and latency **together** and choose on the trade-off, given the role of AI (Chapter 1) and your SLAs.

**3.** List four axes in the build-vs-buy decision and what each pulls toward.

> [!example]- Show answer
> Any four of: **Data privacy** — sensitive data favors **self-hosting** (data never leaves your boundary). **Data lineage / IP** — needing clean training-data provenance/licensing favors models you can vet. **Control / customizability** — deep finetuning and behavior control favor **open/self-hosted**. **Cost at scale** — high volume can favor self-hosting (no per-token vendor fee) but adds ops cost; low/spiky volume favors **APIs**. **Vendor lock-in** — wanting portability favors open models. **Performance ceiling & functionality** (function calling, long context) — often favors **commercial APIs** today. **Time-to-market / ops burden** — favors **APIs**.

**4.** Why are public benchmark scores unreliable as a final selection criterion, and how should you use them?

> [!example]- Show answer
> Two reasons: (1) **Contamination** — benchmark data frequently leaks into training corpora, so high scores can reflect **memorization** rather than ability; and (2) **aggregation/selection bias** — leaderboards combine many tasks with subjective weighting, hiding task-level weaknesses, and benchmarks may not resemble your task. Use them as a **coarse pre-filter** to build a shortlist, then make the real decision with **your own evaluation data on your own task**. Leaderboard rank is a hint, not a verdict.

**5.** What are the three steps of designing an evaluation pipeline?

> [!example]- Show answer
> (1) **Evaluate all components *and* end-to-end** — evaluate each pipeline stage (retriever, prompt, model, post-processing) plus the whole system, so failures can be localized. (2) **Create evaluation guidelines** — write down what "good" means: criteria, a scoring rubric, good/bad examples, and tie scores to **business metrics**. (3) **Define evaluation methods and data** — pick the right method per criterion and **collect labeled evaluation data** reflecting real (and adversarial) usage. Then iterate as new failure modes appear.

**6.** Why is "tie evaluation scores to business metrics" emphasized so strongly?

> [!example]- Show answer
> Because an abstract score like "7.5/10 helpfulness" is meaningless unless it predicts something you care about — user retention, task completion, support deflection, revenue. If improving your eval score doesn't move a business metric, you're optimizing a proxy that may be **disconnected from value** (or even anti-correlated, e.g., longer answers scoring higher but annoying users). Tying the rubric to business outcomes keeps the whole evaluation effort **honest and decision-relevant**, and tells you when "good enough" has actually been reached.

**7.** Why evaluate **individual components** of a system and not just the final output?

> [!example]- Show answer
> Because a wrong final answer doesn't tell you **where** it went wrong. In a RAG pipeline, a bad answer could be a **retrieval miss** (the right document was never fetched), a **prompt** problem, a **generation** error, or **post-processing**. End-to-end evaluation tells you *that* it failed; component evaluation tells you *why* and *which part to fix*. Without it you waste effort tuning the model when the real bug is in retrieval (a recurring theme in Chapter 6, where the retriever is usually the bottleneck).

**8.** *(Applied)* You must choose between a top-tier commercial API and a self-hosted open model for a healthcare app handling patient data. Walk the decision.

> [!example]- Show answer
> Start with the **hard constraint: data privacy**. Patient data (PHI) usually can't leave your controlled boundary, which strongly favors **self-hosting** an open model (or a vendor with a strict BAA/private deployment). Then weigh: **performance** — is the open model good enough on your clinical tasks (test on your data)? **Cost** — at your volume, does self-hosting beat per-token API pricing once you include GPU ops? **Functionality** — do you need function calling/long context the open model may lack? **Control** — do you need to finetune on clinical data? If the open model clears the quality bar on **your** evaluation set and you can meet latency/cost with self-hosting, privacy tips it to **build**; if quality falls short and a vendor offers a compliant private deployment, **buy** the compliant option. The privacy constraint frames everything else.

**9.** What is "instruction-following capability" and why evaluate it separately from raw quality?

> [!example]- Show answer
> **Instruction-following** is whether the model **obeys the prompt's format, constraints, and intent** — "return JSON," "stay under 100 words," "only answer from the context." It's separate from quality because a model can produce *brilliant* content that **ignores your constraints**, which breaks downstream parsing and pipeline integration. For systems where the model is a **component** (its output is consumed by code or another stage), reliable instruction-following can matter more than marginal quality, because a malformed-but-smart answer still crashes the pipeline. So you measure it as its own criterion.

**10.** *(Synthesis)* Tie this chapter back to Chapter 3: how do "AI-as-a-judge" and "evaluation guidelines" reinforce each other?

> [!example]- Show answer
> Chapter 3 showed AI judges are only as reliable as their **rubric**; Chapter 4's "evaluation guidelines" *are* that rubric, written formally for your task. The guideline — criteria, examples, business-metric mapping — is precisely what you hand the judge to reduce ambiguity, position/verbosity/self-bias, and drift. Conversely, building the guideline forces you to define "good," which you then operationalize with whatever method fits (judge, functional correctness, human). So Chapter 4's pipeline is Chapter 3's methods **plus a written spec and labeled data** — the missing ingredients that make the methods trustworthy in production.

## Deeper understanding (expansion)

> [!info]+ 💡 The only benchmark that matters is yours
> The strongest practical takeaway of Chapters 3–4 is a mindset shift: **public benchmarks select candidates; your eval set makes the decision.** Frontier labs optimize against public benchmarks, and contamination means the scores partly measure memorization. Your task, your data distribution, your edge cases, and your cost/latency envelope are unique — and a model that's #1 on a leaderboard can underperform a #5 model on *your* support tickets. Building a few hundred well-labeled, realistic eval examples (including adversarial and rare cases) is one of the highest-ROI investments an AI team can make; it converts every future model/prompt change from a guess into a measurement.

> [!info]+ 💡 Component evaluation is how you escape "vibes-based" debugging
> Teams without component-level evaluation tend to debug by **staring at bad outputs and tweaking the prompt** — because the prompt is the only knob they can see. But in a multi-stage system the prompt is often innocent. Instrumenting each stage (retrieval hit rate, context relevance, format-compliance, end-to-end correctness) turns debugging from intuition into **localization**: you can say "retrieval recall is 60%, so the generator never had a chance," and fix the actual bottleneck. This is the evaluation analog of Chapter 1's "fix the problem at the right layer."

> [!info]+ 💡 Build-vs-buy is rarely permanent — design for switchability
> The decision isn't a one-time fork; models and prices change monthly, and contamination/regression can hit any provider. The pragmatic posture is to **minimize lock-in** so you can re-decide cheaply: abstract the model behind an interface (a "model gateway/router," previewed here and detailed in Chapter 10), keep your **evaluation pipeline model-agnostic**, and avoid building deep dependencies on one vendor's proprietary features unless they're essential. Then "build vs. buy" becomes a reversible, evidence-driven choice you re-run as the landscape shifts — not a bet you're stuck with.

## Connections

- **← Chapter 3** provided the evaluation methods this chapter assembles into a decision process.
- **→ Chapter 5–9** are the levers you'll choose between *based on* this evaluation (prompt, RAG, agents, finetune, optimize) — and you re-evaluate after each.
- **→ Chapter 10** implements the **model router/gateway** and **production monitoring** previewed here.
- See also: [[chip-huyen-ai-engineering-book_3abc60d3]].
