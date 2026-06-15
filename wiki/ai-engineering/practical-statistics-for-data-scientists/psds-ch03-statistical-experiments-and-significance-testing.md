---
tags: [ab-testing, hypothesis-testing, p-value, permutation-test, multiple-testing, anova, statistical-power, bruce-gedeck]
source: https://github.com/gedeck/practical-statistics-for-data-scientists
---

# PSDS Ch.3 — Statistical Experiments and Significance Testing

How to design an experiment and decide whether a result is real or noise — with resampling, not formulas, as the default way to *feel* what a significance test does. The chapter is also a sober warning about how easily significance is faked. Part of the [[practical-statistics-for-data-scientists-book]] series. Full review pack with quiz: [[03-statistical-experiments-and-significance-testing]].

## From A/B tests to p-values

- **A/B testing** — a **treatment** vs. a **control** group with **randomized** assignment of subjects, compared on a **test statistic**. The control group is what lets you attribute a difference to the treatment rather than to time, novelty, or chance.
- **Hypothesis tests** — a **null hypothesis** (the difference is chance) vs. an **alternative**; **one-way** vs. **two-way** tests. The whole apparatus exists to protect you from being fooled by random variation.
- **Resampling = the intuitive test** — a **permutation test** pools both groups, **shuffles** labels, repeatedly splits, and recomputes the difference; if the observed difference sits deep in the tail of that shuffled distribution, it's unlikely to be chance. This replaces most textbook t-/z-formulas with one mechanism.
- **Statistical significance & p-values** — the **p-value** is the probability of a result as extreme as observed *if the null were true*; **α** is the threshold. **Type 1** error = false positive, **Type 2** = false negative. The book stresses the **ASA caution**: a p-value is not the probability the result is real, and "p < 0.05" is not a verdict.

## Designing and reading experiments honestly

- **Multiple testing** — test enough hypotheses and some will look significant by pure chance (the **false discovery rate** problem). Corrections like **Bonferroni**, and awareness of researcher degrees of freedom, are essential; this is a form of **overfitting** in disguise.
- **ANOVA** — compares means across **more than two** groups by decomposing variance into between- vs. within-group (the **F-statistic**); an **omnibus** test, optionally followed by pairwise comparisons. Has a clean **permutation** analog.
- **Chi-square test** — for counts / contingency tables (independence, goodness-of-fit); **Fisher's exact test** for small cells.
- **Multi-arm bandits** — an adaptive alternative to fixed A/B tests (epsilon-greedy, Thompson sampling) that shifts traffic toward winners during the experiment.
- **Power and sample size** — decided *before* running: given an **effect size**, desired **power**, and **α**, how big a sample do you need? Underpowered tests can't detect real effects.

## Key Takeaways

- **Permutation tests make significance tangible** — if you can shuffle and recompute, you understand the p-value better than any formula gives you.
- **The more you look, the more you "find"** — multiple comparisons manufacture significance; correct for them and pre-specify your hypotheses.
- **Compute power before the experiment, not excuses after.** A significant result on a tiny effect, or a null result from an underpowered test, are both traps.

## See Also

- [[practical-statistics-for-data-scientists-book]]
- [[psds-ch02-data-and-sampling-distributions]] · [[psds-ch04-regression-and-prediction]]
