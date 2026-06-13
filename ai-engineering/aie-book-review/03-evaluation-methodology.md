---
tags: [evaluation, perplexity, cross-entropy, ai-as-judge, elo, metrics, chip-huyen, study-guide, quiz]
source: https://github.com/chiphuyen/aie-book
---

# Chapter 3 — Evaluation Methodology

> [!abstract]+ Chapter at a glance
> Evaluation is the book's recurring hard problem, and this chapter builds the toolbox. It moves from the most intrinsic, automatic signals (**language-modeling metrics** like perplexity) to **exact evaluation** (functional correctness and similarity to references), then to the two methods that handle open-ended output: **AI-as-a-judge** (a model scores outputs) and **comparative evaluation** (models ranked head-to-head via Elo). Each method has distinct blind spots; the craft is knowing which to use where.

## Core concepts

**Why evaluating foundation models is hard**
- Outputs are **open-ended** — there's usually no single correct answer to diff against.
- Models are **general-purpose**, so no single benchmark covers what you care about.
- The most capable models are the hardest to evaluate (you may lack a stronger reference to judge them).
- Public benchmarks get **contaminated** (leak into training data), so high scores can be memorization.

**Language-modeling metrics (intrinsic, automatic)**
- **Cross-entropy** — measures how surprised the model is by the true next token; lower = better fit to the data.
- **Perplexity** = exponential of cross-entropy. Intuition: the model's **effective branching factor** — roughly "how many equally-likely tokens is it choosing among." Lower perplexity = more confident/predictive.
- Variants for fair cross-tokenizer comparison: **bits-per-character (BPC)** and **bits-per-byte (BPB)**.
- **What perplexity is good for**: a proxy for fit, **data-quality filtering**, and **detecting anomalies/contamination** (text the model has seen has suspiciously low perplexity).
- **What it is NOT**: a reliable measure of *task* quality. Lower perplexity ≠ more helpful, correct, or aligned. Post-trained models often have *higher* perplexity on raw text than base models, yet are far more useful.
- Perplexity is **undefined/unavailable** for models behind APIs that don't expose logprobs.

**Exact evaluation (objective, automatic)**
- **Functional correctness** — does the output *do the job*? Code passes unit tests; a math answer equals the solution; a SQL query returns the right rows. The gold standard when you can define it.
- **Similarity to reference data** — compare output against one or more reference answers:
  - **Exact match** — brittle; only works for closed-form answers.
  - **Lexical similarity** — n-gram overlap: **BLEU**, **ROUGE**, METEOR, edit distance. Cheap but blind to paraphrase and meaning.
  - **Semantic similarity** — compare **embeddings** (e.g., **BERTScore**, cosine similarity of sentence embeddings). Captures meaning/paraphrase, but depends on the embedding model's quality.
- All reference-based metrics share a fatal limit for open-ended tasks: a great answer that differs from the reference scores poorly.
- **Embeddings primer**: dense vectors where semantic similarity ≈ geometric closeness; the foundation for both semantic-similarity metrics and embedding-based retrieval (Chapter 6).

**AI as a judge (model-based, scalable)**
- **What**: prompt a (usually strong) model to score or critique outputs against criteria. **Why**: fast, cheap, flexible, scales to open-ended tasks where references don't exist.
- **How**: give the judge clear criteria and a rubric; ask for a **pointwise score**, a **pass/fail**, or a **pairwise preference** (which of A/B is better). Pairwise tends to be more reliable than absolute scores.
- **Limitations / biases**:
  - **Inconsistency** — the judge is itself a probabilistic model; scores vary run to run.
  - **Criteria ambiguity** — vague rubrics → unreliable scores; the rubric *is* the spec.
  - **Self-bias** — judges favor outputs from the same model/family.
  - **Position bias** — in pairwise, a tendency to favor the first (or a particular) position.
  - **Verbosity bias** — judges over-reward longer answers.
  - **Non-comparability & drift** — scores from different judges aren't on the same scale, and a judge's scores shift when the judge model is updated.
- **Mitigations**: tight rubrics, swap A/B positions and average, use multiple judges, calibrate against human labels.

**Comparative evaluation (ranking, preference-based)**
- **Pointwise** (score each model alone) vs. **comparative** (compare two models on the *same* prompt and record which wins).
- Comparative avoids the hard problem of **calibrating an absolute score scale** — you only need "A beat B."
- **Elo** ratings (borrowed from chess) convert many pairwise results into a ranking; this powers **Chatbot Arena / LMArena**.
- **Challenges**: expensive to collect at scale; results can be hard to reproduce; rankings are *relative* (they tell you A>B, not whether either is good enough for *your* task); susceptible to who's voting and on what prompts.
- **Best used as** a coarse, product-level signal of relative quality — not as a development-loop metric or a substitute for your own task-specific evaluation.

## Quiz

**1.** Define perplexity in terms of cross-entropy, and give the intuitive "branching factor" interpretation.

> [!example]- Show answer
> **Perplexity = exp(cross-entropy)**, where cross-entropy measures the model's average surprise at the true next token. Intuitively, perplexity is the model's **effective branching factor** — approximately how many equally likely tokens it's choosing among at each step. A perplexity of 10 means the model is about as uncertain as if it were picking uniformly among 10 options. **Lower is more confident/predictive.** It's an *exponential* of the average per-token loss, which is why it's reported instead of raw cross-entropy — it's more interpretable.

**2.** Give two legitimate uses of perplexity and one thing it should *not* be used for.

> [!example]- Show answer
> **Good uses**: (1) **Data-quality filtering** — flag training examples with anomalously high perplexity (garbled) or suspiciously low perplexity (boilerplate/duplicate). (2) **Contamination/anomaly detection** — text the model was trained on shows unusually low perplexity, useful for spotting benchmark leakage or memorized data. **Should NOT be used for**: judging **task quality / helpfulness**. Lower perplexity doesn't mean more correct, helpful, or aligned — post-trained assistant models often have *higher* perplexity on raw text yet are much more useful.

**3.** What is "functional correctness," and why is it the gold standard when available?

> [!example]- Show answer
> **Functional correctness** checks whether the output **actually accomplishes the task** rather than how it reads: code that **passes unit tests**, a math answer that equals the known solution, a SQL query returning the correct rows. It's the gold standard because it's **objective and automatic** and measures the thing you actually care about (does it work?), sidestepping the open-endedness problem entirely. The catch: it only applies when you can *define* and *automatically check* "works" — many tasks (summarization, chat) have no such checkable spec.

**4.** Contrast lexical and semantic similarity metrics. Give an example of each and a failure case.

> [!example]- Show answer
> **Lexical similarity** measures surface n-gram overlap with a reference — e.g., **BLEU**, **ROUGE**, edit distance. Cheap, but it **fails on paraphrase**: "The cat sat on the mat" vs. "On the mat, a cat was sitting" scores low despite identical meaning. **Semantic similarity** compares **embeddings** of output and reference — e.g., **BERTScore** or cosine similarity of sentence vectors — capturing meaning beyond exact words. Its failure case: it **inherits the embedding model's blind spots** (and can rate a fluent-but-wrong answer as "similar enough"). Both still break when a *good* answer simply differs from the reference.

**5.** Why is AI-as-a-judge so popular despite being unreliable, and what is the single most important thing you control to make it work?

> [!example]- Show answer
> It's popular because it's the only **scalable, flexible** way to evaluate **open-ended** outputs where no reference exists — it's far cheaper and faster than human evaluation and works across arbitrary criteria. The single most important lever is the **rubric/criteria**: the judge's reliability is gated by how clearly you define what "good" means. A vague prompt ("rate this 1–10") yields noisy, drifting scores; a precise rubric with explicit criteria and examples yields far more consistent judgments. The rubric *is* the evaluation spec.

**6.** List three biases of AI judges and a mitigation for each.

> [!example]- Show answer
> (1) **Position bias** (favoring the first option in pairwise) → **swap A/B order and average** both runs. (2) **Verbosity bias** (over-rewarding longer answers) → instruct the judge to ignore length / penalize padding, or control for length. (3) **Self-bias** (favoring its own model family) → use a **different** judge model, or an ensemble of judges. (Bonus: **inconsistency** → average multiple judge runs; **drift** → re-validate against human labels whenever the judge model is updated.)

**7.** What problem does *comparative* evaluation solve that *pointwise* scoring struggles with?

> [!example]- Show answer
> Pointwise scoring requires placing each model on an **absolute, calibrated scale** ("this answer is a 7/10") — but those scales are unstable, judge-dependent, and not comparable across judges or model versions. **Comparative** evaluation only asks "**which of A or B is better on this prompt?**", which humans (and judges) do far more reliably than assigning absolute numbers. Aggregating many such pairwise outcomes (via **Elo**) yields a robust *relative ranking* without ever needing a calibrated absolute score.

**8.** What is Elo used for here, and what's its biggest limitation for deciding whether to ship a model?

> [!example]- Show answer
> **Elo** converts many head-to-head win/loss results into a single rating per model, producing a leaderboard (e.g., Chatbot Arena). Its biggest limitation for a *shipping* decision: it's purely **relative** — it tells you model A beats model B *on the arena's prompt distribution and voter population*, not whether either is **good enough for your specific task**. It can also be expensive to collect, hard to reproduce, and skewed by which prompts and voters are involved. Use it as a coarse pre-filter, then run **your own task-specific evaluation**.

**9.** Why does benchmark *contamination* undermine public leaderboard scores, and how does perplexity relate?

> [!example]- Show answer
> Foundation models train on huge web scrapes that often **include the benchmark data itself**. A high score may then reflect **memorization**, not generalization — the model has effectively "seen the exam." This is why leaderboard rankings should be treated as a coarse filter, not ground truth (Chapter 4 expands this). **Perplexity connects** because contaminated/memorized text shows **anomalously low perplexity** — measuring perplexity on benchmark items is one signal for detecting whether the model has seen them.

**10.** *(Applied)* You're evaluating a summarization feature with no reference summaries. Design a pragmatic evaluation approach using this chapter's tools, and name the risks.

> [!example]- Show answer
> Since references don't exist and outputs are open-ended, lean on **AI-as-a-judge** with a **tight rubric**: define criteria (faithfulness to source, coverage of key points, conciseness, no hallucinated facts) and have a strong judge model score each criterion, ideally **pairwise** against a baseline summary. Reduce bias by **swapping positions**, using a **different judge** than the generator, and **calibrating** the judge against a small set of **human-labeled** examples. For factuality specifically, add a check that every claim is supported by the source. **Risks**: judge inconsistency/drift, verbosity and self-bias, and rubric ambiguity — so periodically re-validate against humans and evaluate over multiple runs, not a single pass.

## Deeper understanding (expansion)

> [!info]+ 💡 The evaluation ladder: automatic → reference → model → human
> The chapter is secretly organized by a trade-off between **scalability** and **fidelity**. *Language-modeling metrics* (perplexity) are fully automatic and cheap but only loosely related to task quality. *Reference-based* metrics are automatic but need gold answers and break on open-endedness. *AI-as-a-judge* scales to open-ended tasks but is biased and drifts. *Human evaluation* (and Elo from human votes) is the most faithful but the least scalable. A mature evaluation strategy uses **a layered mix**: cheap automatic metrics for fast iteration, judges for open-ended quality, and a small human-labeled set as the **anchor that calibrates everything else**. No single rung is sufficient.

> [!info]+ 💡 Why "evaluate over multiple runs" is non-negotiable
> Because generation is **sampling** (Chapter 2), the same prompt yields different outputs, and an AI judge is *also* a sampler. So any single-run score is one draw from a distribution. Treating it as the truth is like judging a model from one dice roll. Practically: run each eval item several times, report the **distribution** (mean and variance), and be suspicious of small differences. This is the single most common methodological mistake in homegrown LLM evals — comparing two prompts/models on one run each and declaring a winner inside the noise band.

> [!info]+ 💡 The judge can't be stronger than its rubric
> A recurring trap is expecting the judge model to *know* what you want. It doesn't — it executes your rubric. If your rubric says "rate helpfulness 1–10," the judge invents its own definition of helpfulness, inconsistently. The fix is to **front-load the spec**: enumerate criteria, give positive/negative examples, prefer binary or pairwise decisions over fine-grained scores, and decompose ("is it faithful? y/n", "does it cover X? y/n") rather than asking for one holistic number. This is the same lesson as prompt engineering (Chapter 5) applied to evaluation — and it's why writing good **evaluation guidelines** is the heart of Chapter 4.

## Connections

- **← Chapter 2** supplies the raw material: perplexity/cross-entropy come straight from the model's output distribution and logprobs.
- **→ Chapter 4** applies these *methods* to real decisions — model selection, build-vs-buy, and designing an end-to-end evaluation **pipeline** with guidelines.
- **→ Chapter 6** reuses **embeddings** (the basis of semantic similarity here) for retrieval.
- **→ Chapter 10** operationalizes judges in production for live quality monitoring.
- See also: [[chip-huyen-ai-engineering-book_3abc60d3]].
