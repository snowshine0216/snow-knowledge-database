---
tags: [dataset-engineering, data-quality, data-synthesis, distillation, model-collapse, data-processing, chip-huyen, study-guide, quiz]
source: https://github.com/chiphuyen/aie-book
---

# Chapter 8 — Dataset Engineering

> [!abstract]+ Chapter at a glance
> If finetuning (Chapter 7) amplifies your data, then the data *is* the work. This chapter covers building datasets for adaptation: the three pillars of **data curation** (quality, coverage, quantity), how to **acquire** data, **AI-powered data synthesis** and its dangers (model collapse, superficial imitation), **model distillation** as a data strategy, and the unglamorous-but-decisive **data processing** pipeline (inspect → dedup → clean/filter → format).

## Core concepts

**Data curation — the three pillars**
- **Quality** — the single biggest lever. A curated, correct, well-formatted dataset beats a much larger noisy one. Quality includes correctness, relevance, consistency, and clean formatting. **"Quality over quantity"** is the chapter's refrain.
- **Coverage (diversity)** — the data must span the **distribution of real inputs**: tasks, phrasings, edge cases, languages, difficulty. Narrow data → a model that fails outside the training distribution. Diversity is often more valuable than raw volume.
- **Quantity** — how much you need depends on the **method** (full finetuning needs more than LoRA/PEFT) and task difficulty. More data has **diminishing returns** once quality and coverage are good; there's a point where adding noisy data *hurts*.
- These trade off: you balance **quality × coverage × quantity** under budget.

**Data acquisition and annotation**
- Sources, roughly cheapest→most expensive: **public/existing datasets** → **web scraping** → **synthetic generation** → **human annotation** (highest quality, slowest, priciest).
- **Annotation** is often the bottleneck; the hard part is writing clear **annotation guidelines** (the same "define what good means" problem as evaluation, Chapter 4).
- **Augmentation vs. synthesis**: **augmentation** transforms *existing* real data (paraphrase, perturb) to expand it; **synthesis** generates *new* data (often AI-generated) from scratch or from seeds.

**Data synthesis (especially AI-powered)**
- **Why synthesize**: get more **quantity** cheaply; improve **coverage** (generate rare/edge cases, balance classes); preserve **privacy** (synthetic stand-ins for sensitive data); and **distill** a capable model's behavior into data.
- **Techniques**:
  - **Traditional** — rule-based generation, simulation, templates.
  - **AI-powered** — an LLM generates training examples. **Self-instruct / Alpaca-style**: seed with example tasks, have the model generate new **(instruction, response)** pairs; inject diversity via varied seeds and topic sampling. Pair with **data verification** (filter/validate generated examples) to keep quality up.
- **Limitations / risks**:
  - **Quality and superficial imitation** — synthetic data can copy *surface form* without the underlying competence; models trained on it may imitate style but not substance.
  - **Model collapse** — training models on **AI-generated data** across generations degrades the distribution: rare cases vanish, diversity shrinks, errors compound. Mixing in **real data** mitigates it.
  - **Obscure lineage** — synthetic data's provenance/quality is hard to audit; you may inherit the generator model's biases and errors.

**Model distillation (as a data strategy)**
- Use a stronger **teacher** model to generate or label data that trains a smaller, cheaper **student** model. The student learns to approximate the teacher at a fraction of the serving cost. (Llama 3's tech report is a notable public example of large-scale synthetic/distilled data use.) Watch licensing — some providers forbid training competitors on their outputs.

**Data processing pipeline**
A practical sequence (do it in roughly this order):
1. **Inspect / explore** — actually look at the data; understand distribution, errors, and format *before* training. (The step everyone skips and regrets.)
2. **Deduplicate** — remove duplicates and near-duplicates (exact, fuzzy, semantic). Dedup typically removes a meaningful chunk (often ~15–30% of web corpora) and prevents memorization, train/test leakage, and skewed distributions.
3. **Clean and filter** — remove low-quality, toxic, irrelevant, or PII-containing data; filter by quality heuristics (including **perplexity**, Chapter 3).
4. **Format** — convert to what training expects: **tokenization** and applying the correct **chat template** / instruction format. Wrong formatting silently wrecks finetuning even with perfect content.

## Quiz

**1.** State the chapter's central principle about data and explain why it holds for finetuning specifically.

> [!example]- Show answer
> **Quality over quantity** — a smaller, clean, well-formatted, diverse dataset typically beats a much larger noisy one. It holds especially for finetuning because **finetuning amplifies the data** (Chapter 7): the model redistributes toward whatever you feed it, so noise, errors, and biases get *reinforced*, and bad formatting silently corrupts learning. Unlike pretraining (where massive scale can dilute some noise), finetuning datasets are smaller and each example has more influence — so curation, not volume, dominates the outcome.

**2.** Define the three pillars of data curation and how they trade off.

> [!example]- Show answer
> **Quality** — correctness, relevance, consistency, clean formatting (the biggest lever). **Coverage (diversity)** — spanning the real input distribution: tasks, phrasings, edge cases, difficulty, languages. **Quantity** — enough volume for the method/task, with **diminishing returns** past a point. They **trade off under budget**: you can't maximize all three, and beyond a threshold, adding **low-quality** data to boost quantity **hurts** coverage-adjusted quality. The goal is the best balance — usually prioritize quality and coverage, then add quantity only while it doesn't dilute them.

**3.** Why do you synthesize data, and what's the difference between augmentation and synthesis?

> [!example]- Show answer
> **Reasons to synthesize**: cheap **quantity**, better **coverage** (generate rare/edge cases, balance classes), **privacy** (synthetic stand-ins for sensitive data), and **distillation** (capture a strong model's behavior as data). **Augmentation** transforms **existing real** data to make more of it (paraphrasing, perturbing, back-translation) — the core signal is still real. **Synthesis** **generates new** data, often via an LLM, from seeds or scratch — the data didn't exist before. Augmentation expands a real dataset; synthesis manufactures a new one (with more risk to quality/lineage).

**4.** What is model collapse and how do you mitigate it?

> [!example]- Show answer
> **Model collapse** is the degradation that happens when models are trained on **AI-generated data** over successive generations: the distribution narrows, **rare/tail cases disappear**, diversity shrinks, and errors compound — each generation learns from the slightly-distorted output of the last until quality craters. **Mitigation**: keep **real human data in the mix** (don't train purely on synthetic), **verify and filter** synthetic data, maintain **diversity** deliberately (varied seeds, topic sampling), and limit how many generations of synthetic-on-synthetic you stack. Synthetic data is a supplement, not a replacement for real data.

**5.** What is "superficial imitation" in synthetic data, and why is it a trap?

> [!example]- Show answer
> **Superficial imitation** is when a model trained on synthetic data learns the **surface form** — the style, phrasing, structure of good answers — **without the underlying competence** that produces them. The output *looks* right (confident, well-formatted) but the reasoning or factual grounding isn't there. It's a trap because it's **hard to detect from a glance**: the model passes casual inspection while failing on substance, and naive eval (which rewards fluent-looking output) won't catch it. It's a key reason synthetic data needs **verification against real correctness**, not just plausibility.

**6.** Describe model distillation as a data strategy, including one caveat.

> [!example]- Show answer
> **Distillation** uses a stronger **teacher** model to **generate or label training data** for a smaller, cheaper **student** model, so the student approximates the teacher's behavior at far lower serving cost. It's a practical way to get a small, fast, specialized model without human-labeling everything (and it underlies a lot of modern instruction data; Llama 3's report is a public example). **Caveat**: **licensing/terms** — many commercial model providers **prohibit using their outputs to train competing models**, so distilling from a closed API can violate terms. (Plus: the student inherits the teacher's **biases and errors**.)

**7.** List the data processing pipeline steps in order and say what each prevents or enables.

> [!example]- Show answer
> (1) **Inspect/explore** — understand distribution and errors *before* training; prevents training on garbage you never looked at. (2) **Deduplicate** — removes exact/near/semantic duplicates; prevents memorization, **train/test leakage**, and skewed distributions (often removes ~15–30% of web data). (3) **Clean and filter** — drop low-quality, toxic, irrelevant, or **PII** data (quality heuristics including perplexity); raises signal and reduces harm. (4) **Format** — tokenize and apply the correct **chat template/instruction format**; ensures the model actually trains on the structure it expects. Order matters: inspect first, format last.

**8.** Why is deduplication more important than it sounds?

> [!example]- Show answer
> Duplicates and near-duplicates do three bad things: (1) they **skew the distribution** (over-represented content gets over-learned, hurting coverage); (2) they encourage **memorization** of repeated passages rather than generalization; and (3) if a duplicate spans your **train and test** splits, you get **leakage** that inflates evaluation scores (the contamination problem from Chapters 3–4, now self-inflicted). Web corpora are full of boilerplate and reposts, so dedup commonly removes a large fraction (often 15–30%). It's a cheap step with outsized impact on both quality and the trustworthiness of your eval.

**9.** Why is "format" the last step but still a make-or-break one?

> [!example]- Show answer
> **Formatting** — tokenization and applying the exact **chat template / instruction structure** the model expects (special tokens, role markers, prompt/response delimiters) — comes last because it should be applied to already-clean, deduped data. It's **make-or-break** because models are **trained on a specific template**; if your finetuning data uses the wrong template or mismatched special tokens, the model learns from a structure it won't see at inference, and finetuning **silently underperforms or breaks** even though the *content* is perfect. It's one of the most common, hardest-to-spot finetuning bugs.

**10.** *(Applied)* You're building an instruction-tuning dataset for a niche legal-summarization task with little public data. Design a data strategy using this chapter's tools and flag the risks.

> [!example]- Show answer
> **Acquire**: start from any **public** legal datasets and real documents you can license; this anchors the data in real signal. **Synthesize for coverage**: use a strong teacher model (self-instruct style) to generate **(legal text → summary)** pairs across diverse document types, jurisdictions, and difficulty — explicitly seeding for **edge cases** and varied phrasing. **Verify**: filter synthetic pairs with checks (faithfulness to source, correct legal facts), ideally with human-expert spot-checks given the domain's stakes. **Mix in real data** to avoid **model collapse** and superficial imitation. **Process**: inspect → dedup → clean (strip PII, filter low quality) → format to the model's chat template. **Risks**: superficial imitation (summaries that *look* lawyerly but are wrong), model collapse from over-relying on synthetic, **obscure lineage/bias** from the teacher, and **licensing** limits on using the teacher's outputs — plus the high cost of errors in a legal domain, which argues for human verification and tight evaluation guidelines (Chapter 4).

## Deeper understanding (expansion)

> [!info]+ 💡 Dataset engineering is the same "define what good means" problem, upstream
> Notice the rhyme across the book: **evaluation guidelines** (Chapter 4) and **annotation guidelines** (Chapter 8) are the *same skill* — precisely specifying what a good output is, with criteria and examples. That's not a coincidence: your **annotation guideline becomes your training target**, and your **evaluation guideline becomes your test**. If you can write one clearly, you can usually write the other, and they should agree. Teams that struggle to build a good dataset usually haven't actually defined the task crisply — the data problem is a **specification** problem wearing a data costume. Nail the spec, and acquisition/synthesis/verification all get tractable.

> [!info]+ 💡 The synthetic-data flywheel and its failure mode
> Synthetic data + distillation enables a powerful flywheel: a strong model generates data → trains a cheaper specialized model → which is deployed and generates more data → and so on. This is genuinely how a lot of modern small models get good. But the **failure mode is built into the flywheel**: each loop of training-on-AI-output risks **model collapse** — quietly shedding the diversity and tail behavior that made the original good. The guardrails are non-negotiable: **keep real data in the loop**, **verify** aggressively, and **measure diversity/coverage**, not just average quality. The flywheel spins up *or* spins into collapse depending entirely on whether you maintain the real-data anchor.

> [!info]+ 💡 Inspect-the-data is the cheapest high-ROI habit in the whole book
> The very first processing step — **actually look at your data** — is the one practitioners skip and the one that catches the most catastrophic, embarrassing bugs: mislabeled examples, wrong formatting, an entire category missing, PII you can't legally train on, a template mismatch, duplicates across splits. It costs an afternoon and routinely saves a wasted training run (or a model that "trained fine" but learned the wrong thing). The discipline mirrors **component evaluation** (Chapter 4): don't reason about your data in the abstract — **open it and read samples**. Almost every finetuning disaster is visible in the first 100 examples if someone bothers to look.

## Connections

- **← Chapter 7**: finetuning **amplifies** the data — this chapter is how you make that data worth amplifying.
- **← Chapters 3–4**: perplexity as a quality filter; "define what good means" reused as annotation guidelines; dedup fights the contamination/leakage problem.
- **← Chapter 2**: distillation/synthetic data connects to how foundation models are post-trained.
- **→ Chapter 10**: production **user feedback** is a renewable, real-data source that feeds dataset engineering and counteracts model collapse.
- See also: [[chip-huyen-ai-engineering-book_3abc60d3]].
