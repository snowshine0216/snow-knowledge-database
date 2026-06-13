---
tags: [dataset-engineering, data-quality, data-synthesis, distillation, model-collapse, chip-huyen]
source: https://github.com/chiphuyen/aie-book
---

# AIE Ch.8 — Dataset Engineering

If finetuning amplifies your data, the data *is* the work. Full review pack with quiz: [[08-dataset-engineering]].

## Data curation — three pillars

- **Quality** — the biggest lever; a curated small set beats a noisy large one. **Quality over quantity.**
- **Coverage (diversity)** — span the real input distribution: tasks, phrasings, edge cases, difficulty.
- **Quantity** — depends on method (full FT needs more than LoRA); **diminishing returns**, and noisy volume *hurts*.

## Acquisition and synthesis

- **Acquisition hierarchy** (cheap → expensive): public datasets → web scraping → synthetic → human annotation. The hard part of annotation is writing clear **guidelines** (same skill as evaluation guidelines, [[aie-ch04-evaluate-ai-systems]]).
- **Augmentation** transforms existing real data; **synthesis** generates new data.
- **AI-powered synthesis** — self-instruct / Alpaca-style (seed → generate instruction/response pairs) with **diversity injection** and **verification**.
- **Model distillation** — a strong **teacher** generates/labels data to train a cheaper **student** (watch licensing — many APIs forbid training competitors). See [[nuwa-skill-distillation]].

## Risks

- **Model collapse** — training on AI-generated data across generations narrows the distribution and kills tail diversity. Mitigate by **keeping real data in the mix**, verifying, and preserving diversity.
- **Superficial imitation** — synthetic data copies surface form without competence (looks right, is wrong).
- **Obscure lineage** — you inherit the teacher's biases.

## Data processing pipeline

**Inspect → Deduplicate → Clean/filter → Format.** Dedup removes ~15–30% of web corpora and prevents memorization and train/test leakage. **Format last** (tokenization + correct chat template) — a template mismatch silently breaks finetuning even with perfect content.

## Key Takeaways

- **Inspect the data** is the cheapest high-ROI habit — most finetuning disasters are visible in the first 100 examples.
- The synthetic-data flywheel spins up *or* into collapse depending on whether you keep a **real-data anchor**.

## See Also

- [[chip-huyen-ai-engineering-book]]
- [[aie-ch07-finetuning]] · [[aie-ch09-inference-optimization]]
- [[failure-experience-distillation]] · [[nuwa-skill-distillation]]
