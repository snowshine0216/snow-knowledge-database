---
tags: [rag, llm, sampling, temperature, top-p, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/8850gm/llm-sampling-strategies
---

## Pre-test

1. Top-k and top-p sampling both truncate the tail of a token probability distribution, yet they behave differently when the model is highly uncertain. Explain the key behavioral difference and why top-p is considered the more "adaptive" of the two.

2. A RAG pipeline that classifies user queries into one of five fixed categories is producing occasional off-label outputs. Which sampling parameter would most directly address this without retraining the model, and how would you configure it?

3. Suppose you set temperature to 2.5 for a factual question-answering RAG system. Describe in mechanistic terms what happens to the token probability distribution and why this setting would degrade answer quality.

---

# Lecture 043: LLM Sampling Strategies

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/8850gm/llm-sampling-strategies

## Outline

1. [The Probabilistic Nature of Token Generation](#1-the-probabilistic-nature-of-token-generation)
2. [Greedy Decoding: Determinism at a Cost](#2-greedy-decoding-determinism-at-a-cost)
3. [Temperature: Reshaping the Distribution](#3-temperature-reshaping-the-distribution)
4. [Top-k and Top-p Sampling: Tail Control](#4-top-k-and-top-p-sampling-tail-control)
5. [Token-Level Adjustments: Repetition Penalties and Logit Biasing](#5-token-level-adjustments-repetition-penalties-and-logit-biasing)
6. [Practical Guidelines for RAG Systems](#6-practical-guidelines-for-rag-systems)

---

## 1. The Probabilistic Nature of Token Generation

Every token an LLM appends to a completion is the outcome of a **weighted random draw** from a probability distribution over the entire vocabulary. This is not an implementation detail — it is the fundamental mechanism by which the model operates. Understanding this distribution, and the tools available to reshape it, is essential for anyone building production RAG systems.

As introduced in [[006-introduction-to-llms]], the model computes a score (a logit) for every token in the vocabulary at each generation step. After passing those scores through a softmax function, you obtain a probability vector that sums to 1.0. For a prompt such as "The sky is", the token *blue* might receive a probability of 0.50, *bright* might receive 0.25, and the remaining tens of thousands of tokens each receive smaller fractions. Visualising this distribution is instructive: when the curve has a sharp spike at the highest-probability token, the model is expressing high confidence. When the curve is flat, the model perceives many plausible continuations and is comparatively uncertain.

This distribution is not static. Several API parameters allow you to warp its shape before the random draw occurs, enabling you to tune the balance between predictability and creativity, precision and variety. The rest of this lesson surveys the most important of those parameters.

---

## 2. Greedy Decoding: Determinism at a Cost

The simplest possible decoding strategy is **greedy decoding**: at every step, skip the random draw entirely and select the single token with the highest probability. Greedy decoding has one valuable property — it makes the model perfectly **deterministic**. Given the same prompt and model weights, greedy decoding will always produce the same output. This makes it attractive for debugging and for tasks such as code completion, where unexpected variation is unwelcome.

The costs, however, are significant. First, the output can feel stilted or generic because the model is always chasing the most statistically average next word rather than occasionally exploring a less-expected but contextually richer option. Second, and more critically for production systems, greedy decoding creates the conditions for **repetitive loops**. Once the model has generated a sequence of tokens for which the highest-probability continuation is to repeat that same sequence, nothing in the greedy algorithm can break the cycle. The model has no look-ahead mechanism; it cannot evaluate whether the overall completion makes sense, only which single token is locally most probable.

Most LLM APIs expose greedy decoding as the limiting case of the temperature parameter: setting temperature to zero is equivalent to collapsing the distribution to a point mass on the argmax token. In practice, developers typically use greedy decoding only as a temporary diagnostic setting or for very structured tasks, and reintroduce controlled randomness for all other scenarios.

---

## 3. Temperature: Reshaping the Distribution

**Temperature** is the primary lever for controlling the breadth of the probability distribution. Building on the architecture described in [[042-transformer-architecture]], the logits computed by the final linear layer are divided by the temperature scalar before the softmax is applied. Dividing by a value less than 1 amplifies the differences between logit values, producing a sharper, more peaked distribution; dividing by a value greater than 1 compresses those differences, producing a flatter distribution.

Concretely:

- **Temperature = 1.0** — the distribution is used as-is, exactly as the model computed it. This is the default.
- **Temperature < 1.0 (e.g., 0.3–0.7)** — the distribution becomes more peaked. The highest-probability tokens dominate; lower-probability tokens are suppressed. The model becomes more conservative and focused.
- **Temperature → 0** — approaches greedy decoding. The top token receives essentially 100% probability.
- **Temperature > 1.0 (e.g., 1.1–1.3)** — the distribution flattens. Tokens that would otherwise have low probability receive a meaningfully larger share. Outputs become more varied and can sound more creative or exploratory, but at the risk of occasional semantic incoherence.
- **Temperature >> 1.0** — the distribution approaches uniformity. Nearly every token has an equal probability of being chosen, regardless of semantic fit. At this extreme, output quality degrades sharply.

An important subtlety: temperature rescales probabilities uniformly across the entire distribution. It does not remove tokens from contention — it only raises or lowers their relative probabilities. A token in the far tail of the distribution will remain unlikely at temperature 0.8, but it is not impossible. This motivates the additional tail-truncation techniques discussed in the next section.

For RAG applications, a temperature in the range of 0.6–0.9 is a sensible default for most open-ended question answering. Factual lookups warrant a lower value; generative tasks such as document drafting or paraphrasing warrant a higher one.

---

## 4. Top-k and Top-p Sampling: Tail Control

Even after calibrating temperature, the probability distribution has a long right tail populated by low-probability nonsense tokens. Two complementary techniques address this tail directly.

**Top-k sampling** restricts the random draw to the *k* tokens with the highest probability at each step. For example, setting k = 5 means the model can only choose among the five most likely tokens; all others are excluded before the draw. This is straightforward to implement and computationally cheap. The limitation is that k is a fixed count: if the model is highly confident (one token dominates) or highly uncertain (many tokens are plausible), the pool of k tokens is the same size regardless.

**Top-p sampling** (also called nucleus sampling) addresses this rigidity. Rather than a fixed count, top-p defines a probability mass threshold — say, p = 0.85. Starting from the highest-probability token and accumulating probabilities in descending order, the model includes tokens until the cumulative probability exceeds the threshold. The set of tokens meeting this criterion is called the nucleus. The random draw is then restricted to this nucleus.

The key advantage of top-p is its **adaptive pool size**. When the model is confident — a single token captures most of the probability mass — the nucleus is small, perhaps just one or two tokens, and the model behaves almost deterministically. When the model is uncertain — probabilities are spread across many tokens — the nucleus expands to include a richer set of options. This dynamic scaling makes top-p a better fit for tasks where the model's confidence varies across different parts of the completion.

In practice, top-k and top-p are often combined: set a moderately high k as an outer bound, and use top-p for the adaptive inner selection. A commonly recommended baseline is `temperature=0.8, top_p=0.9`, which produces text that avoids the extreme tails while preserving meaningful variety.

---

## 5. Token-Level Adjustments: Repetition Penalties and Logit Biasing

Beyond shaping the global distribution, two token-level controls allow targeted intervention.

**Repetition penalty** directly addresses a practical failure mode observed even with well-tuned temperature and sampling parameters: the model's tendency to echo back words or phrases it has already used. This is not a bug in the sampling logic — it reflects genuine statistical patterns in training data, where certain phrases co-occur frequently. Applying a repetition penalty decreases the logits of tokens that have already appeared in the current completion before the softmax is computed. A penalty value of 1.0 applies no change; a value of 1.2 is a moderate penalty that meaningfully reduces but does not eliminate repetition. The result is output that feels more lexically varied and natural.

**Logit biasing** is the most surgical of the available controls. It allows the developer to permanently shift the logit of any specific token by a constant offset before the softmax. A positive bias increases a token's probability of being selected; a negative bias decreases it. Two practical use cases illustrate this:

1. *Content filtering*: if a RAG system must never produce profanity, the logits of profane tokens can be set to a large negative value (in practice, negative infinity), making them impossible to select.
2. *Constrained classification*: if the RAG pipeline is a classifier that should output exactly one of five category labels, the logits of those five tokens can be boosted substantially while all other tokens are suppressed, ensuring the model's output is always drawn from the intended vocabulary.

Logit biasing is a powerful but narrow tool. It requires knowing in advance which specific tokens to target, making it most useful for tightly scoped tasks.

---

## 6. Practical Guidelines for RAG Systems

No single combination of sampling parameters is universally optimal. The right configuration depends on the task profile of your RAG application. The following principles provide a starting framework.

**Match temperature to task creativity.** For factual retrieval and question answering over a knowledge base, lower temperature (0.3–0.6) reduces the risk of hallucinated or tangential content. For generative tasks — summarisation, report drafting, paraphrasing retrieved passages — a higher temperature (0.8–1.1) can improve fluency and variety.

**Use top-p as the default tail-control mechanism.** Top-p's adaptive nucleus size is better suited to the varying uncertainty levels encountered across a long completion than a fixed top-k. A top-p of 0.9 is a reasonable default; lower values (0.7–0.8) constrain output more tightly.

**Introduce repetition penalty when output quality degrades.** A repetition penalty of 1.1–1.2 is a low-risk addition that often improves perceived quality at no cost to coherence. Reserve higher values for cases where repetition is a persistent problem.

**Reserve logit biasing for well-defined structural constraints.** Classifier outputs, required format tokens, and explicit content exclusions are appropriate targets. Avoid broad logit manipulation in open-ended generation, where it can introduce unexpected artefacts.

**A practical baseline for general-purpose RAG:** `temperature=0.8, top_p=0.9, repetition_penalty=1.2`. This combination keeps the model conservative enough for factual accuracy while avoiding pathological repetition and extreme tail tokens. Iterate from this baseline, measuring the effect of each parameter change on downstream retrieval and answer quality metrics.

Ultimately, sampling parameter tuning is an empirical discipline. Establish a representative evaluation set drawn from your target domain, define a quality metric, and treat each parameter combination as a hypothesis to test. The tools are straightforward; the discipline is systematic experimentation.

---

## Post-test

1. What is the mechanistic relationship between temperature and the token probability distribution? Specifically, how does a temperature value below 1.0 change the shape of the distribution compared to a value above 1.0?

2. Describe the difference between top-k and top-p sampling in terms of pool size behaviour when the model is highly confident versus highly uncertain.

3. A RAG system generating customer support responses frequently repeats the same phrases within a single answer. Which parameter addresses this directly, and what is the recommended starting value?

<details><summary>Answer guide</summary>

**Post-test 1.** Temperature divides the raw logits before the softmax is applied. A value below 1.0 amplifies differences between logits, sharpening the distribution so that the highest-probability tokens accumulate an even larger share of probability mass (the distribution becomes more "spiky"). A value above 1.0 compresses logit differences, flattening the distribution and redistributing probability mass more evenly across tokens, including low-probability ones. At temperature = 0, only the argmax token has non-zero probability (greedy decoding). At very high temperature, the distribution approaches uniform.

**Post-test 2.** Top-k always restricts the draw to exactly k tokens regardless of the distribution shape — the pool size is fixed. Top-p defines a cumulative probability threshold: when the model is confident (a few tokens hold most of the mass), the nucleus is small; when the model is uncertain (mass is spread across many tokens), the nucleus expands. This makes top-p adaptive and generally better-suited to completions where confidence varies across different segments.

**Post-test 3.** The **repetition penalty** parameter directly addresses repeated phrases. It works by decreasing the logits of tokens that have already appeared in the current completion before the draw occurs. A starting value of **1.2** is commonly recommended as a moderate penalty — strong enough to reduce repetition noticeably while remaining unlikely to degrade coherence.

</details>
