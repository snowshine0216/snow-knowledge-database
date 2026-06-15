---
tags: [statistics, exploratory-data-analysis, sampling, resampling, significance-testing, regression, classification, statistical-machine-learning, unsupervised-learning, bruce-gedeck]
source: https://github.com/gedeck/practical-statistics-for-data-scientists
---

# Practical Statistics for Data Scientists — Bruce, Bruce & Gedeck (O'Reilly, 2nd ed. 2020)

The book that maps classical statistics onto the daily work of a data scientist: it keeps the ~20% of statistical ideas that actually show up in data-science practice, drops the rest, and reframes each one through a **sampling / resampling** and **predictive-modeling** lens rather than a theorem-and-proof one. Every concept comes with worked **R and Python** examples (the companion GitHub repo ships all the code and datasets). Unlike a reference textbook, it is organized around what a practitioner reaches for — EDA, sampling distributions, significance tests, regression, classification, and the statistical roots of machine learning.

## Key Concepts

- **EDA is the foundation** (Tukey): before any modeling, summarize and visualize. Prefer **robust** estimates (median, trimmed mean, IQR, MAD) because real data has outliers and long tails.
- **The sampling distribution is the central object**: a statistic computed from a sample is itself random. The **standard error** measures its spread, the **central limit theorem** explains its shape, and the **bootstrap** lets you estimate it for *any* statistic by resampling with replacement.
- **Resampling unifies inference**: **permutation tests** (for significance) and the **bootstrap** (for variability) replace most classical formula-based tests with one intuitive idea — shuffle/resample and look at the distribution.
- **Significance testing, used honestly**: p-values, α, Type 1/Type 2 errors, and especially **multiple testing / false discovery rate** — the more you test, the more "significant" noise you find. Power and sample size come *before* the experiment, not after.
- **Regression for prediction vs. explanation**: the same least-squares machinery serves two different goals, and the diagnostics (multicollinearity, confounding, influential points, heteroskedasticity) matter far more for explanation than for prediction.
- **Classification and the rare-class problem**: accuracy lies when classes are imbalanced. Use the **confusion matrix**, precision/recall, ROC/AUC, and rebalancing strategies (under/oversampling, SMOTE, cost weighting).
- **Machine learning is statistics scaled up**: KNN, trees, bagging/random forests, and boosting are presented as a continuum from the statistical methods that precede them — ensembles trade interpretability for accuracy.
- **Unsupervised learning finds structure without labels**: PCA, K-means, hierarchical, and model-based clustering, plus the often-ignored mechanics of **scaling** and **mixed/categorical** data (Gower's distance).

## Rules of Thumb

| Idea | Quick form |
|---|---|
| Standard error | `SE = s / √n` — to halve it, **quadruple** the sample |
| Bootstrap | resample **with replacement**, same n, recompute the statistic |
| 95% interval (bootstrap) | 2.5th–97.5th percentile of the resampled statistic |
| Robust spread | IQR (75th − 25th percentile) and MAD beat SD under outliers |
| Trees & impurity | split to reduce **Gini** or **entropy**; prune to avoid overfit |
| Imbalanced data | optimize precision/recall + AUC, never raw accuracy |

## Key Takeaways

- The mental model that carries the whole book: **data → sample → statistic → sampling distribution**. Almost every inferential tool is just a way of describing that last distribution, and the bootstrap/permutation makes it concrete.
- **Robust beats elegant on messy data** — medians, trimmed means, and IQR survive the outliers that wreck means and standard deviations.
- **Statistical significance ≠ practical importance**, and with enough comparisons significance is cheap. Pre-register, correct for multiplicity, and report effect sizes.
- The line between "statistics" and "machine learning" is mostly historical: the book walks you from regression to random forests to XGBoost without leaving the statistical frame.

## Chapter Deep-Dives

Per-chapter review articles (concepts):

- [[psds-ch01-exploratory-data-analysis]] — data types, location/variability, distributions, correlation
- [[psds-ch02-data-and-sampling-distributions]] — sampling, bias, CLT, bootstrap, common distributions
- [[psds-ch03-statistical-experiments-and-significance-testing]] — A/B tests, p-values, permutation, ANOVA, power
- [[psds-ch04-regression-and-prediction]] — least squares, factors, diagnostics, splines
- [[psds-ch05-classification]] — naive Bayes, LDA, logistic regression, imbalanced data
- [[psds-ch06-statistical-machine-learning]] — KNN, trees, bagging/random forest, boosting
- [[psds-ch07-unsupervised-learning]] — PCA, K-means, hierarchical, model-based clustering

## See Also

- [[chip-huyen-ai-engineering-book]] — the modeling-era companion O'Reilly title
- [[state-of-gpt]]
