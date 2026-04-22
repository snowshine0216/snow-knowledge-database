---
tags: [rag, llm, model-selection, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/vvs2mn/choosing-your-llm
---

## Pre-test

1. **LLM-as-a-judge benchmarks suffer from a systematic bias. What is that bias, and what structural property of how these models were trained causes it?**

2. **A benchmark is described as "saturated." What does saturation mean technically, and why does it force the research community to continuously introduce new benchmarks?**

3. **You are building a real-time customer-support RAG system and you find that the best-performing model on MMLU is also the slowest. Which quantifiable LLM metric should dominate your decision, and why does optimising for that metric force a trade-off against another metric?**

---

# Lecture 045: Choosing Your LLM

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/vvs2mn/choosing-your-llm | DeepLearning.AI | Retrieval-Augmented Generation Course

## Outline

1. [Why LLM Selection Is a First-Class Design Decision](#1-why-llm-selection-is-a-first-class-design-decision)
2. [Quantifiable Selection Criteria](#2-quantifiable-selection-criteria)
3. [The Benchmark Landscape](#3-the-benchmark-landscape)
4. [Three Families of Benchmarks](#4-three-families-of-benchmarks)
5. [What Makes a Benchmark Trustworthy](#5-what-makes-a-benchmark-trustworthy)
6. [Benchmark Saturation and the Pace of Model Progress](#6-benchmark-saturation-and-the-pace-of-model-progress)

---

## 1. Why LLM Selection Is a First-Class Design Decision

The single generative component in a RAG pipeline is the LLM that receives a retrieved-context prompt and produces an answer, which means every weakness of that model — poor instruction-following, slow throughput, a stale knowledge cutoff, or high per-token cost — propagates directly into the user experience. Choosing the wrong model is therefore not a minor optimisation problem; it is an architectural mistake that affects speed, quality, and budget simultaneously.

What makes the decision harder is that the space of available models is enormous and rapidly changing. Providers release new checkpoints with different capability–cost trade-offs at a pace measured in months, not years. The practical implication is that model selection is not a one-time decision made at project inception; it is a recurring engineering task. Any RAG system designed with good [[042-transformer-architecture]] foundations must build in the expectation that the LLM component will be swapped out as the field progresses.

The lesson's core argument is that a structured framework — combining quantifiable metrics with principled benchmark interpretation — lets engineers make an informed choice today while designing the system to absorb future model upgrades with minimal friction.

---

## 2. Quantifiable Selection Criteria

Before evaluating subjective quality, several hard numerical properties of a model can immediately narrow the candidate set.

**Model size**, measured in billions of parameters, is the most commonly cited metric. Small models occupy the 1–10 billion parameter range; large frontier models reach 100–500 billion parameters or beyond. Larger models are *generally* more capable, but the relationship is not monotonic — a well-trained smaller model can outperform a poorly trained larger one on specific tasks. What is monotonic is cost: more parameters always require more compute to serve, so larger models are always more expensive to run.

**Cost** is expressed as a fixed price per million tokens, often with asymmetric pricing for *input tokens* and *output tokens*. In a RAG workflow, input tokens dominate because every call includes both the retrieved passages and the user query, so the input-token price deserves particular scrutiny. Newer, larger, and more capable models command higher prices, making cost a natural filter after quality requirements are established.

The **context window** sets the upper bound on how many tokens the model can process in a single forward pass, shared between the prompt (including retrieved chunks) and the generated completion. A longer context window gives more room to include more retrieved passages, which can improve answer quality in document-heavy tasks. However, a larger context window does not reduce cost — every token in the window is billed — so it increases the per-call expense when used at full capacity. This creates a direct tension: better retrieval coverage versus higher inference cost. See [[006-introduction-to-llms]] for background on how context windows are implemented at the architecture level.

**Latency and throughput**, expressed in *tokens per second*, determine whether the model fits a real-time interaction pattern. A customer-facing chatbot built on a RAG pipeline has very different latency requirements than an overnight batch-summarisation job. When real-time interaction is required, a faster and lower-latency model may be preferable even if it scores lower on quality benchmarks — meaning latency is a genuine constraint that forces a quality trade-off rather than merely a preference.

The **training cutoff date** (also called the knowledge cutoff) marks the last point in time represented in the model's training corpus. In a RAG system, retrieved documents supply much of the factual grounding, which partially compensates for a stale cutoff. However, the model still needs to reason about, synthesise, and correctly frame retrieved content within its world model. If the retrieved document refers to events, entities, or terminology that postdates the model's training, the model may misinterpret or fail to contextualise it correctly. A later cutoff is therefore preferable even in RAG deployments, particularly when the domain involves recent events.

---

## 3. The Benchmark Landscape

Once the quantifiable filters have produced a shortlist, the decision comes down to **quality** — a multidimensional property that includes logical reasoning, mathematical precision, instruction-following fidelity, factual accuracy, and the aesthetic coherence of generated text. Quality is far harder to reduce to a single number than cost or latency, and the benchmarking ecosystem that has grown up to measure it is correspondingly complex.

No single authoritative benchmark exists. Instead, practitioners navigate a wide and sometimes contradictory collection of evaluations, each probing a different aspect of model behaviour. The first step toward using benchmarks well is understanding why they disagree with each other and what each is actually measuring. This mirrors the broader lesson from [[011-evaluating-rag-pipelines]], where the same principle — no single metric captures pipeline quality — applies at the component level.

The important conceptual shift is to treat benchmark scores not as ground truth about model capability but as evidence that must be weighed in context. A model that excels on a mathematics benchmark may still produce poorly structured prose; a model that ranks highly on a human-preference leaderboard may fail on structured-output tasks required by a downstream application. Good benchmark selection means selecting evaluations that are *relevant to the actual task* rather than those that happen to be widely publicised.

---

## 4. Three Families of Benchmarks

The field has converged on three methodologically distinct approaches to model evaluation, each with different strengths and failure modes.

**Automated benchmarks** assess models on tasks that can be evaluated programmatically. The classic format is a multiple-choice test where the correct answer is known in advance and the model's response is scored by matching against the answer key. *MMLU* (Massive Multitask Language Understanding) is the canonical example: it spans 57 subjects — from STEM disciplines to law and humanities — and produces a scalar accuracy score. Other automated benchmarks test mathematical problem-solving or code generation, where the model's output can be executed and verified. The primary advantage is reproducibility and scale: thousands of questions can be scored automatically in minutes. The limitation is that multiple-choice accuracy does not capture prose quality, nuanced reasoning, or the kinds of open-ended generation that most RAG applications require.

**Human-evaluated benchmarks** address this gap by presenting pairs of anonymous model responses to human judges, who select the preferred answer. Results are aggregated using the same *ELO rating algorithm* used in competitive chess — a pairwise comparison system that produces a globally consistent ranking from many local comparisons. *LLM Arena* is the most widely cited implementation of this approach, and its leaderboard is among the benchmarks that model providers most frequently reference. Human evaluation captures dimensions of quality — tone, clarity, persuasiveness, implicit cultural context — that automated scoring cannot access. The trade-off is cost and throughput: collecting enough human judgements to produce statistically stable rankings is slow and expensive.

**LLM-as-a-judge benchmarks** use one large model to score the outputs of another. The judge model receives a test question, a reference answer, and the candidate model's response, then produces a rating or a binary correct/incorrect verdict. The resulting *win rate* — how often the evaluated model matches or exceeds the reference — can be used to rank models against each other. This approach is cheaper than human evaluation and more flexible than automated scoring. Its principal weakness is a systematic bias: judge models tend to rate outputs from their own model family more favourably. An OpenAI GPT-family judge inflates scores for other GPT-family models; a Google Gemini judge does the same for Gemini models. This happens because models are trained to produce outputs that match their own distributional preferences. The bias can be reduced through careful calibration of the judge model, but it cannot be eliminated entirely without independent validation.

---

## 5. What Makes a Benchmark Trustworthy

Not every benchmark provides equally useful signal for a given project, and understanding what separates a trustworthy benchmark from an unreliable one is essential for making good model-selection decisions.

**Relevance** is the first criterion: a benchmark must test capabilities that matter for the application. Evaluating a customer-support RAG system using a code-generation benchmark produces no actionable information, because the capability being measured does not map to the use case. Selecting relevant benchmarks requires first articulating what the RAG system actually needs to do well.

**Difficulty** determines whether a benchmark can distinguish between good and bad models. If every frontier model scores above 95% on a given benchmark, the benchmark provides no differentiating information and is effectively useless for selection. A useful benchmark should spread model scores across a meaningful range so that genuine differences in capability are visible.

**Reproducibility** means that running the same benchmark on the same model at different times produces consistent scores. High variance across runs indicates that the benchmark is noisy and that reported scores cannot be taken at face value.

**Alignment with real-world performance** is the deepest requirement and the hardest to verify. A model that achieves a high score on a programming benchmark should actually write better code in practice. The concern here is **data contamination**: because large language models are trained on datasets drawn from the open web, and benchmark questions are often published openly, it is possible that specific questions and their answers appeared in the training corpus. A model that has seen a benchmark question during training may produce the correct answer from memorisation rather than from genuine understanding, inflating its apparent capability. Identifying data contamination requires either restricting benchmarks to newly constructed questions or cross-referencing benchmark scores against independent evaluations that are unlikely to overlap with training data.

---

## 6. Benchmark Saturation and the Pace of Model Progress

Benchmark saturation is one of the most important macro-trends shaping how practitioners evaluate LLMs. When a benchmark is first introduced, average model performance is low — the questions are hard enough to produce genuine differentiation. Over a surprisingly short time, typically measured in one to three years, frontier models converge on near-perfect performance, and the benchmark ceases to differentiate between them. At that point the benchmark is *saturated*: it can confirm that a model is broadly capable but cannot help rank the best available models against each other.

The community's response to saturation is to introduce harder benchmarks, and the pattern repeats. New, harder evaluations appear; models quickly saturate them; even harder ones are needed. This cycle is not a pathology — it is evidence that models are improving faster than our ability to design sufficiently hard tests. The practical consequence for engineers is twofold. First, a benchmark that was a reliable selection signal two years ago may today be useless for differentiating frontier models — benchmark citations must always be checked against current saturation status. Second, the rapid saturation of benchmarks is itself a proxy for how quickly the capability frontier is moving: models available today are substantially more capable than models from even two years prior.

This pace of improvement has a direct implication for RAG system design. Any model chosen today — however carefully selected — is likely to be superseded within months by a model that performs better at the same or lower cost. Designing the RAG pipeline so that the LLM component is cleanly isolated and replaceable is therefore not optional architectural hygiene; it is a practical necessity. The conclusion from [[045-choosing-your-llm]] is therefore symmetric: invest effort in choosing the best available model today using the framework described above, but invest equally in designing the system so that swapping the model is a low-friction operation.

---

## Post-test

1. You are choosing between two LLMs for a RAG customer-support system. Model A scores higher on MMLU and costs twice as much per million tokens. Model B is faster but costs less. What is the correct evaluation framework for choosing between them, and what additional information do you need beyond these numbers?

2. Explain the data contamination problem in LLM benchmarking. Why does it cause models to overperform on affected benchmarks, and what does this mean for how you should interpret a provider's benchmark marketing claims?

3. Define benchmark saturation and explain why it is both a measurement problem and evidence of genuine model progress. What should a practitioner do when the benchmark they relied on for a previous model selection is now saturated?

> [!example]- Answer Guide
> 
> #### Q1 — Choosing Models for RAG Support
> 
> MMLU score and cost per token are both useful but insufficient signals. The correct framework combines quantifiable metrics (cost, latency, context window) with quality benchmarks *relevant to the customer-support use case* — which is not what MMLU measures. You need: (a) a benchmark that tests instruction-following and conversational coherence rather than broad academic knowledge; (b) latency measurements under realistic load, since customer-support is real-time; (c) a task-specific human or LLM-as-judge evaluation using representative support queries. Only after assembling these signals can cost per token be weighed against quality. The higher cost of Model A is only justified if the quality delta on the relevant benchmark is large enough to affect user satisfaction or deflection rates.
> 
> #### Q2 — Data Contamination in Benchmarking
> 
> Data contamination occurs when benchmark questions and their correct answers appear in the model's pretraining corpus. Because LLMs are trained on internet-scale datasets, openly published benchmark questions may be ingested during training. The model can then answer those questions from memorisation rather than from the general-purpose reasoning the benchmark is meant to test, producing a score that overstates its actual capability on novel problems. For practitioners, this means that benchmark scores published by providers — who have a financial incentive to report high numbers — must be treated skeptically. Indicators of likely contamination include a model that scores much higher on one benchmark than on comparable tests of the same skill, or large jumps in score on a benchmark shortly after it was widely publicised.
> 
> #### Q3 — Benchmark Saturation and Response
> 
> Saturation means that nearly all frontier models score near the maximum on the benchmark, so the benchmark no longer differentiates between high-performing and lower-performing models. It is a measurement problem because a saturated benchmark cannot help with model selection. It is simultaneously evidence of genuine progress because models had to actually improve to reach near-perfect scores — the benchmark is correctly reporting that those skills are now widespread. When a previously relied-upon benchmark is saturated, the practitioner must: (a) identify a harder replacement benchmark that tests the same skill domain at greater depth; (b) verify that the new benchmark is not itself already contaminated; (c) treat the old benchmark scores as a floor (any model worth considering should clear it) rather than a differentiator.
