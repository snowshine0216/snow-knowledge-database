---
tags: [sampling, sampling-distribution, central-limit-theorem, bootstrap, standard-error, probability-distributions, bruce-gedeck]
source: https://github.com/gedeck/practical-statistics-for-data-scientists
---

# PSDS Ch.2 — Data and Sampling Distributions

The conceptual heart of the book: a statistic computed from a sample is itself random, and understanding *that* randomness — its spread and shape — is what makes inference possible. The bootstrap turns the idea into a tool you can apply to anything. Part of the [[practical-statistics-for-data-scientists-book]] series. Full review pack with quiz: [[02-data-and-sampling-distributions]].

## Sampling, bias, and the distribution of a statistic

- **Sample vs. population** — we infer about a population from a **random sample**. **Simple random** and **stratified** sampling aim for representativeness; the enemy is **bias**.
- **Sample bias beats sample size** — a biased sample doesn't get better with more data. **Selection bias** (self-selection, the **vast search effect** of trying many things, **regression to the mean**) is the subtle killer; bigger data is only better if it's representative.
- **Two distributions, don't confuse them** — the **data distribution** (spread of individual values) vs. the **sampling distribution** (spread of a *statistic* over many samples). The latter is always tighter.
- **Standard error** — the spread of the sampling distribution: `SE = s / √n`. The **√n** is why halving the error costs **4×** the data.
- **Central Limit Theorem** — for large n the sampling distribution of the mean is approximately **normal**, regardless of the population's shape. Practically important less for the formula than for justifying normal-based intervals.

## The bootstrap, and distributions worth knowing

- **The bootstrap** — resample the data **with replacement** (same size n), recompute the statistic, repeat thousands of times. The spread of those values *is* the sampling distribution — no formula or normality assumption needed. Underlies **bagging**. It does **not** create new information or fix a too-small sample.
- **Confidence intervals** — express estimate uncertainty; the bootstrap percentile interval (e.g. 2.5th–97.5th) is the most intuitive construction.
- **Normal distribution** — standard normal, **z-scores**, and **QQ-plots** to check normality. Real data is often **long-tailed** (high **skewness** / **kurtosis**), so don't assume normality casually.
- **The workhorse distributions** — **t** (small-sample means, degrees of freedom), **binomial** (counts of successes), **chi-square** (count/contingency tests), **F** (variance ratios / ANOVA), and **Poisson / exponential / Weibull** (rare-event rates, waiting times, failure analysis).

## Key Takeaways

- **The sampling distribution is the bridge** from a single sample to a statement about the world. Standard error and the CLT describe it analytically; the bootstrap reproduces it empirically.
- **Representativeness, not volume, is what matters** — guard against selection bias before you celebrate a big dataset.
- The bootstrap is the most transferable idea in the book: when no formula exists for your statistic's standard error, resample.

## See Also

- [[practical-statistics-for-data-scientists-book]]
- [[psds-ch01-exploratory-data-analysis]] · [[psds-ch03-statistical-experiments-and-significance-testing]]
