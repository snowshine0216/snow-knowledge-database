---
tags: [statistics, probability, inference, wasserman, all-of-statistics, study-guide, review, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# All of Statistics (Larry Wasserman) — Chapter Review Pack

Self-study materials for *All of Statistics: A Concise Course in Statistical Inference* by Larry Wasserman (Springer, 2004). One file per chapter. Each file has:

1. **Chapter at a glance** — a one-paragraph anchor.
2. **Core concepts** — the reviewable substance, organized for re-reading.
3. **Quiz** — questions with collapsible answers (`> [!example]- Show answer`). Read the question, think, *then* expand. This is active recall — resist peeking.
4. **Deeper understanding (expansion)** — intuition, trade-offs, and "why does this matter" that go a step beyond the terse textbook.
5. **Connections** — how the chapter links to the rest of the book.

> [!tip] How to use this pack
> Cover the answers, attempt every question out loud or on paper, then reveal. Anything you miss → re-read that bullet in **Core concepts**. Re-test after a day for spacing. The expansion sections are for the second pass, once recall is solid. Wasserman is deliberately terse — these notes restore the intuition the book leaves to the reader.

## Chapters

### Part I — Probability

| # | Chapter | File |
|---|---|---|
| 1 | Probability | [[01-probability]] |
| 2 | Random Variables | [[02-random-variables]] |
| 3 | Expectation | [[03-expectation]] |
| 4 | Inequalities | [[04-inequalities]] |
| 5 | Convergence of Random Variables | [[05-convergence-of-random-variables]] |

### Part II — Statistical Inference

| # | Chapter | File |
|---|---|---|
| 6 | Models, Statistical Inference and Learning | [[06-models-inference-and-learning]] |
| 7 | Estimating the CDF and Statistical Functionals | [[07-estimating-cdf-and-functionals]] |
| 8 | The Bootstrap | [[08-the-bootstrap]] |
| 9 | Parametric Inference | [[09-parametric-inference]] |
| 10 | Hypothesis Testing and p-values | [[10-hypothesis-testing-and-p-values]] |
| 11 | Bayesian Inference | [[11-bayesian-inference]] |
| 12 | Statistical Decision Theory | [[12-statistical-decision-theory]] |

### Part III — Statistical Models and Methods

| # | Chapter | File |
|---|---|---|
| 13 | Linear and Logistic Regression | [[13-linear-and-logistic-regression]] |
| 14 | Multivariate Models | [[14-multivariate-models]] |
| 15 | Inference about Independence | [[15-inference-about-independence]] |
| 16 | Causal Inference | [[16-causal-inference]] |
| 17 | Directed Graphs and Conditional Independence | [[17-directed-graphs-and-conditional-independence]] |
| 18 | Undirected Graphs | [[18-undirected-graphs]] |
| 19 | Log-Linear Models | [[19-log-linear-models]] |
| 20 | Nonparametric Curve Estimation | [[20-nonparametric-curve-estimation]] |
| 21 | Smoothing Using Orthogonal Functions | [[21-smoothing-using-orthogonal-functions]] |
| 22 | Classification | [[22-classification]] |
| 23 | Probability Redux: Stochastic Processes | [[23-stochastic-processes]] |
| 24 | Simulation Methods | [[24-simulation-methods]] |

## The book's spine in one paragraph

The book's promise is in the title: a fast, rigorous, *broad* tour that gives people from CS and ML the statistical foundations without a two-year detour. It runs in three movements. **Part I (Probability)** builds the mathematical language of uncertainty — sample spaces, random variables, expectation, the inequalities that bound tail behavior, and the limit theorems (LLN, CLT) that make large-sample statistics possible. **Part II (Statistical Inference)** reverses the arrow: given *data*, what can we say about the *model that generated it*? It covers the empirical CDF and the bootstrap, maximum likelihood and the delta method, hypothesis testing and p-values, and the Bayesian and decision-theoretic alternatives — laying both the frequentist and Bayesian foundations side by side. **Part III (Models and Methods)** spends that machinery on the workhorses of applied statistics and ML: regression and classification, multivariate and graphical models, causal inference, nonparametric curve/density estimation, stochastic processes, and the simulation methods (Monte Carlo, MCMC) that make modern Bayesian computation feasible.

> [!note] Source fidelity
> Grounded in the book's actual structure and arguments, reconstructed from training knowledge of Wasserman's text. Concepts, definitions, and chapter organization are reliable. A few precise constants and worked numbers are **illustrative** and may differ slightly from the printed page (Wasserman's exact notation, theorem numbering, and example data are not reproduced verbatim). Anything extrapolated beyond the book is flagged in the expansion sections. Treat this as a recall scaffold, not a citation source — verify exact statements against the book when precision matters.
