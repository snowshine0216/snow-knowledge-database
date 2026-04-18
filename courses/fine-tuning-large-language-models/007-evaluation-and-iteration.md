---
tags: [fine-tuning, evaluation, llm, benchmarks, error-analysis, deeplearning-ai, lamini]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/n87jl/evaluation-and-iteration
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. Why is evaluating LLMs harder than evaluating traditional ML classifiers?
2. What is the Open LLM Leaderboard, and which four benchmarks does it aggregate?
3. If your fine-tuned model scores lower on ARC than the base model, does that mean fine-tuning made the model worse?

---

# Lecture 007: Evaluation and Iteration

**Source:** [Finetuning Large Language Models](https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/n87jl/evaluation-and-iteration) · DeepLearning.AI · Instructor: Sharon Zhou (Lamini)

## Outline

- [Why Evaluation Is Hard](#why-evaluation-is-hard)
- [Human Evaluation](#human-evaluation)
- [Elo Comparison](#elo-comparison)
- [Open LLM Leaderboard](#open-llm-leaderboard)
- [Error Analysis](#error-analysis)
- [Lab: Running Metrics and Inspection](#lab-running-metrics-and-inspection)

---

## Why Evaluation Is Hard

LLM evaluation is notoriously difficult for two reasons:

1. **No clear metrics**: unlike classification (accuracy, F1), generative output has many valid correct answers. A metric like exact match almost always returns 0 for free-text generation.
2. **Rapid improvement**: model performance improves so fast that benchmarks struggle to keep up — a benchmark that differentiated models last year may be saturated today.

As a result, **human evaluation remains the most reliable method**: domain experts who understand the task assess the outputs directly.

---

## Human Evaluation

A good test dataset is essential to make human evaluation worthwhile. Properties:

- **High quality**: accurate, carefully reviewed examples.
- **Generalized**: covers the full range of expected inputs, not just easy cases.
- **Unseen in training**: test data must not appear in the training set.

---

## Elo Comparison

An emerging alternative is **Elo-style comparison** (borrowed from chess rankings):

- Run an A/B test (or tournament) between multiple models on the same prompts.
- Human raters (or another LLM judge) pick the better response.
- Elo scores aggregate these pairwise comparisons into a global ranking.

This avoids the need to define a single scalar metric — relative preference is easier for humans to express than absolute quality scores.

---

## Open LLM Leaderboard

Developed by **EleutherAI**, the Open LLM Leaderboard averages four academic benchmarks to rank models:

| Benchmark | What it tests |
|---|---|
| **ARC** | Grade-school science questions |
| **HellaSwag** | Common-sense reasoning |
| **MMLU** | Elementary-school subject knowledge (broad range) |
| **TruthfulQA** | Ability to avoid reproducing common online falsehoods |

These benchmarks were developed by researchers and are now used as a standard comparison suite. Notable at the time of recording: Llama-2 was performing well; "Free Willy" (fine-tuned on Llama-2 via the Orca method) was a recent high-performer.

---

## Error Analysis

**Error analysis** = categorizing errors by type and frequency, then fixing the most common and most catastrophic first.

For fine-tuning, error analysis can be done *before* fine-tuning, using the base model — this tells you what data would give the biggest lift.

Common error categories:

| Error type | Example | Fix |
|---|---|---|
| **Misspelling** | "go get your lever checked" (lever = liver) | Correct the training example |
| **Verbosity** | Answer includes unnecessary preamble | Add concise examples to training data |
| **Repetition** | "Additionally, Lamini… additionally, Lamini…" | Use stop tokens; add diverse, non-repetitive training examples |

---

## Lab: Running Metrics and Inspection

### Exact Match

The simplest metric: strip whitespace and check if predicted string == target string. Result for this task: **0 exact matches out of 10** — not surprising for a free-text generation task where many phrasings are valid.

Other metric options:
- **LLM-as-judge**: pass both outputs to another LLM and ask it to score similarity.
- **Embedding distance**: embed both strings and measure cosine distance.

The lab conclusion: for generative tasks, **manual inspection of a curated test set is significantly more effective** than any single automated metric.

### ARC Benchmark

Running ARC on the task-specific fine-tuned model:

- **Fine-tuned model score**: 0.31
- **Base Pythia-70M score (from paper)**: 0.36

The fine-tuned model scored *lower* — but this is expected and not a sign of failure. The model was fine-tuned on company Q&A data about Lamini, not grade-school science. It became better at its task and worse at an unrelated benchmark.

**Key insight**: ARC (and similar general benchmarks) only matter when comparing general-purpose models. For a task-specific fine-tuned model, the only benchmark that matters is performance on your actual task data.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. What are the three most common error categories in LLM output, and what is one fix for each?
2. Name the four benchmarks in the Open LLM Leaderboard and what each measures.
3. A fine-tuned model scores 0.31 on ARC, lower than the base model's 0.36. How do you interpret this result?

<details>
<summary>Answer Guide</summary>

1. Misspelling → fix the training example directly. Verbosity → add concise examples to the dataset. Repetition → use stop tokens explicitly and ensure training examples are diverse and non-repetitive.
2. ARC (grade-school science), HellaSwag (common-sense reasoning), MMLU (broad elementary subject knowledge), TruthfulQA (avoiding online falsehoods).
3. This does not mean fine-tuning made the model worse overall. The model was optimized for a company-specific Q&A task (Lamini documentation), not grade-school science. Task-specific fine-tuning sacrifices general benchmark performance in exchange for task performance. ARC is only meaningful for comparing general-purpose models.

</details>
