---
tags: [fine-tuning, evaluation, llm, benchmarks, error-analysis, deeplearning-ai, lamini]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/n87jl/evaluation-and-iteration
---

# Lesson 007 — Evaluation and Iteration

**Course:** [[_index|Finetuning Large Language Models]] · DeepLearning.AI  
**Instructor:** Sharon Zhou (Lamini)

---

## Summary

LLM evaluation is hard: no clear scalar metrics exist for generative output, and benchmarks saturate quickly. Human evaluation remains the gold standard. For task-specific fine-tuned models, general benchmarks are largely irrelevant.

---

## Why Evaluation Is Hard

1. **No clear metrics** — generative output has many valid phrasings; exact match almost always returns 0
2. **Rapid improvement** — benchmarks that differentiated models last year may be saturated today

**Human evaluation** with domain experts remains the most reliable method.

---

## Evaluation Methods

### Human Evaluation
Test set properties: high quality, generalized (covers full input range), **never seen during training**.

### Elo Comparison
A/B tournament between models on the same prompts — human raters (or an LLM judge) pick the better response. Elo scores aggregate pairwise comparisons into a global ranking. Avoids defining a single scalar metric.

### Open LLM Leaderboard (EleutherAI)
Averages four academic benchmarks:

| Benchmark | Tests |
|---|---|
| **ARC** | Grade-school science questions |
| **HellaSwag** | Common-sense reasoning |
| **MMLU** | Elementary-school subject knowledge (broad range) |
| **TruthfulQA** | Ability to avoid reproducing common online falsehoods |

> These benchmarks only matter when comparing **general-purpose** models. A task-specific fine-tuned model will (correctly) score lower on unrelated benchmarks.

---

## Error Analysis

Categorize errors by type and frequency; fix most-common and most-catastrophic first. Can be done *before* fine-tuning using the base model.

| Error type | Example | Fix |
|---|---|---|
| Misspelling | "lever" instead of "liver" | Correct the training example |
| Verbosity | Unnecessary preamble before answer | Add concise examples to training data |
| Repetition | "Additionally, Lamini… additionally, Lamini…" | Use stop tokens; add diverse training examples |

---

## Lab: Metrics and Inspection

**Exact match**: strip whitespace, compare strings → **0/10** on free-text generation. Expected — many valid phrasings exist.

**Other options:** LLM-as-judge (pass both outputs to another LLM), embedding cosine distance.

**Conclusion:** for generative tasks, **manual inspection of a curated test set** is significantly more effective than any automated metric.

**ARC benchmark result:**
- Fine-tuned Pythia-70M: **0.31** (trained on Lamini company Q&A)
- Base Pythia-70M: **0.36**

The fine-tuned model scored lower — expected, not a failure. It became better at its task (company Q&A) and worse at an unrelated benchmark (grade-school science). This is the correct trade-off.

---

## Related

[[006-training-process]] · [[008-consideration-on-getting-started-now]] · [[Open LLM Leaderboard]] · [[ARC benchmark]] · [[Elo ranking]]
