---
tags: [statistics, data-science, bruce-gedeck, study-guide, review, quiz]
source: https://github.com/gedeck/practical-statistics-for-data-scientists
---

# Practical Statistics for Data Scientists (Bruce, Bruce & Gedeck) — Chapter Review Pack

Self-study materials for *Practical Statistics for Data Scientists*, 2nd edition (O'Reilly, 2020). One file per chapter. Each file has:

1. **Chapter at a glance** — a one-paragraph anchor.
2. **Core concepts** — the reviewable substance, organized for re-reading.
3. **Quiz** — questions with collapsible answers (`> [!example]- Show answer`). Read the question, think, *then* expand. This is active recall — resist peeking.
4. **Deeper understanding (expansion)** — analogies, trade-offs, and "why does this matter" that go a step beyond the book.
5. **Connections** — how the chapter links to the rest of the book.

> [!tip] How to use this pack
> Cover the answers, attempt every question out loud or on paper, then reveal. Anything you miss → re-read that bullet in **Core concepts**. Re-test after a day for spacing. The expansion sections are for the second pass, once recall is solid.

## Chapters

| # | Chapter | File |
|---|---|---|
| 1 | Exploratory Data Analysis | [[01-exploratory-data-analysis]] |
| 2 | Data and Sampling Distributions | [[02-data-and-sampling-distributions]] |
| 3 | Statistical Experiments and Significance Testing | [[03-statistical-experiments-and-significance-testing]] |
| 4 | Regression and Prediction | [[04-regression-and-prediction]] |
| 5 | Classification | [[05-classification]] |
| 6 | Statistical Machine Learning | [[06-statistical-machine-learning]] |
| 7 | Unsupervised Learning | [[07-unsupervised-learning]] |

## The book's spine in one paragraph

The book keeps the slice of statistics that a data scientist actually uses and reframes it for prediction rather than proof. It starts by **looking at data** (EDA, Ch. 1), then establishes the one idea everything rests on — that a statistic computed from a sample is itself random, described by its **sampling distribution** and reproducible by the **bootstrap** (Ch. 2). That machinery powers **significance testing and experiment design** (Ch. 3, with **permutation tests** as the intuition engine). From there it turns to supervised modeling: **regression** for numeric outcomes (Ch. 4) and **classification** for categorical ones (Ch. 5, where the rare-class problem gets special attention), then scales up into **statistical machine learning** — KNN, trees, and the ensembles that dominate tabular data (Ch. 6). It closes with **unsupervised learning** — PCA and clustering — for finding structure without labels (Ch. 7). Two themes thread through all of it: **prefer robust, resampling-based methods**, and **be honest about significance**.

> [!note] Source fidelity
> Grounded in the book's actual arguments and structure (2nd edition). Concepts, methods, and the relationships between them are reliable; a few precise illustrative figures may differ slightly from the printed page, and anything extrapolated beyond the book is marked in the expansion sections. The companion R/Python code lives in the [source repo](https://github.com/gedeck/practical-statistics-for-data-scientists). Lightweight cross-linked summaries: [[practical-statistics-for-data-scientists-book]].
