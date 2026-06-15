---
tags: [ab-testing, hypothesis-testing, p-value, permutation-test, multiple-testing, anova, statistical-power, bruce-gedeck, study-guide, quiz]
source: https://github.com/gedeck/practical-statistics-for-data-scientists
---

# Chapter 3 — Statistical Experiments and Significance Testing

> [!abstract]+ Chapter at a glance
> How do you decide whether an observed difference is **real** or just noise? This chapter covers the design of experiments (**A/B tests**, control groups, randomization) and the logic of significance testing (**null hypothesis**, **p-values**, **Type 1/2 errors**). Its signature move is to teach significance through **resampling — permutation tests** — so the p-value becomes something you can *see* rather than a formula you trust on faith. It also delivers a hard warning: with enough comparisons, significance is cheap (**multiple testing / false discovery rate**), and **power and sample size** must be settled *before* you run.

## Core concepts

**A/B testing**
- A controlled experiment with two groups: a **treatment** group (gets the new thing) and a **control** group (gets the existing/standard thing), with subjects assigned by **randomization**. A **test statistic** (conversion rate, revenue per user, etc.) measures the effect.
- The **control group** is what lets you attribute a difference to the treatment rather than to time, seasonality, novelty, or other confounders. Without it, you're guessing.

**Hypothesis tests**
- The **null hypothesis (H₀)**: the observed effect is due to **chance** (the groups are really the same). The **alternative hypothesis**: the effect is real. Tests are **one-way** (directional) or **two-way** (any difference).
- The whole apparatus exists for one purpose: to protect you from being **fooled by random variation** — humans systematically underestimate how much pattern pure chance produces.

**Resampling / permutation tests**
- A **permutation test** makes significance concrete: **pool** all observations from both groups, randomly **shuffle** them back into two groups of the original sizes, recompute the difference, and repeat many times. This builds the distribution of differences **assuming the null is true** (group labels don't matter).
- If the **observed** difference sits far in the tail of that shuffled distribution, chance is an unlikely explanation. Variants: **exhaustive** (all permutations, small data) and **bootstrap** permutation (resample with replacement).

**Statistical significance and p-values**
- The **p-value** is the probability, *if the null were true*, of seeing a result **at least as extreme** as the one observed. **α** (e.g. 0.05) is the threshold you pre-commit to.
- **Type 1 error** = false positive (declare an effect that isn't there); **Type 2 error** = false negative (miss a real effect).
- The book stresses the **ASA caution**: a p-value is **not** the probability the hypothesis is true, not a measure of effect size, and "p < 0.05" is a convention, not a law of nature. Significance ≠ practical importance.

**t-tests** — the classic formula-based two-group comparison; the permutation test is its assumption-light cousin.

**Multiple testing**
- Test many hypotheses (or many variants, or many variables) and some will look "significant" purely by chance — this is **overfitting** in inferential clothing.
- The **false discovery rate** quantifies the problem; corrections like **Bonferroni** (and FDR control) tighten thresholds. The **vast search effect** from Chapter 2 returns here: data dredging finds spurious winners.

**Degrees of freedom** — a parameter (roughly, the number of values free to vary) that shapes the t, chi-square, and F distributions and corrects estimates for sample size.

**ANOVA**
- Compares means across **three or more** groups by **decomposing variance** into between-group vs. within-group, summarized by the **F-statistic**. An **omnibus** test ("are any groups different?"), optionally followed by pairwise comparisons. Has a clean **permutation** version.

**Chi-square test**
- For **count** data and **contingency tables** — tests **independence** (are two categoricals related?) or **goodness of fit**. **Fisher's exact test** handles small cell counts.

**Multi-arm bandits**
- An **adaptive** alternative to fixed A/B tests: algorithms (**epsilon-greedy**, **Thompson sampling**) shift traffic toward better-performing arms *during* the experiment, trading some statistical cleanliness for faster exploitation of winners.

**Power and sample size**
- Decided **before** running. Given a minimum **effect size** worth detecting, a desired **power** (probability of detecting a true effect, commonly 80%), and **α**, you solve for the required **sample size**. **Underpowered** tests routinely miss real effects and produce noisy, unreplicable results.

## Quiz

**1.** Why is a **control group** indispensable, even when you're confident the treatment helps?

> [!example]- Show answer
> Without a control group you can't separate the **treatment effect** from everything else that changed at the same time — seasonality, a marketing push, a holiday, general trend, or novelty. The control group experiences all those same background forces *minus* the treatment, so the **difference** between groups isolates the treatment's effect. Confidence is not evidence: countless "obvious" improvements vanish (or reverse) once a proper control reveals the baseline would have moved anyway.

**2.** Walk through a **permutation test** for the difference in conversion between two page designs.

> [!example]- Show answer
> (1) Compute the **observed** difference in conversion rate between design A and B. (2) **Pool** all sessions, ignoring which design they saw. (3) Randomly **reshuffle** the pooled sessions into two groups the same sizes as the originals and recompute the difference. (4) **Repeat** thousands of times to build the distribution of differences *under the null* (label doesn't matter). (5) The **p-value** is the fraction of shuffled differences as or more extreme than the observed one. If that fraction is tiny, the observed gap is unlikely to be chance. No t-distribution or normality assumption needed — you simulated the null directly.

**3.** Precisely define the **p-value**, and state two things it is *not*.

> [!example]- Show answer
> The **p-value** is the probability of observing a result **at least as extreme** as the one you got, **assuming the null hypothesis is true**. It is **not** (1) the probability that the null hypothesis is true (or that your effect is real) — that's a common, serious misreading; and (2) a measure of the **size or importance** of the effect — a microscopic, useless effect can be highly "significant" with a big enough sample. It only tells you how surprising the data would be in a chance-only world.

**4.** Contrast **Type 1** and **Type 2** errors and how α relates to them.

> [!example]- Show answer
> A **Type 1 error** is a **false positive**: rejecting a true null — declaring an effect that doesn't exist. Its rate is set by **α** (e.g. 0.05 means you accept a 5% false-positive rate). A **Type 2 error** is a **false negative**: failing to reject a false null — missing a real effect; its rate is **β**, and **power = 1 − β**. There's a tension: lowering α (fewer false positives) raises β (more missed effects) unless you compensate with a larger sample. Choosing α and power is choosing how you'd rather be wrong.

**5.** Why does running **20 A/B tests** at α = 0.05 invite trouble, and what fixes it?

> [!example]- Show answer
> At α = 0.05, each test has a 5% false-positive chance under the null; run 20 independent ones and the probability of **at least one** false positive is ~64% (1 − 0.95²⁰). So you'll likely "find" a significant result that's pure noise — the **multiple-testing** / **false-discovery-rate** problem. Fixes: **correct the threshold** (e.g. **Bonferroni**: divide α by the number of tests) or control the FDR directly, and **pre-register** your primary hypothesis so you're not silently testing dozens and reporting the winner. It's the same danger as overfitting: search enough and chance hands you a "result."

**6.** What does **ANOVA** do that a pile of pairwise t-tests does not?

> [!example]- Show answer
> **ANOVA** tests, in a single **omnibus** test, whether **any** of three-or-more group means differ, by decomposing total variance into **between-group** and **within-group** components (the **F-statistic** is their ratio). Doing all pairwise t-tests instead would inflate the **multiple-testing** error (many comparisons → spurious significance). ANOVA controls the overall error rate with one test; only if it's significant do you proceed to (corrected) pairwise comparisons to find *which* groups differ. There's also a permutation version that needs no normality assumption.

**7.** When is a **chi-square test** the right tool?

> [!example]- Show answer
> When you're testing relationships among **counts / categorical** data. Two main uses: (1) **independence** — given a contingency table of two categorical variables (e.g. variant × converted/not), are they associated or independent? (2) **goodness of fit** — do observed category counts match expected proportions? For **small expected cell counts**, the chi-square approximation breaks down and you use **Fisher's exact test** instead. It's the categorical analog of comparing means.

**8.** How does a **multi-arm bandit** differ from a fixed A/B test, and what's the trade-off?

> [!example]- Show answer
> A fixed **A/B test** splits traffic evenly, runs to a pre-set sample size, then decides — clean inference but slow, and it keeps sending half your traffic to the losing variant the whole time. A **multi-arm bandit** (e.g. **epsilon-greedy**, **Thompson sampling**) **adapts during the run**, continuously shifting more traffic to whichever arm is performing better. Trade-off: bandits **earn more during the experiment** and converge faster on a winner, but the adaptive allocation complicates classical significance interpretation and can under-explore. Use A/B when you need a clean, defensible inference; use bandits when ongoing reward (e.g. live ad/clickthrough optimization) matters more than a textbook p-value.

**9.** *(Applied)* A PM wants to run an A/B test "until it's significant." Why is that dangerous, and what should they do instead?

> [!example]- Show answer
> **Peeking and stopping at the first significant moment inflates the false-positive rate** — it's multiple testing across time: check often enough and the random walk of the p-value will dip below 0.05 by chance even under the null. The fix is to **compute the required sample size in advance** via a **power analysis**: decide the minimum effect size worth detecting, pick power (≈80%) and α, solve for *n*, then run to that *n* before deciding (or use a method designed for sequential testing). Pre-committing the stopping rule is what keeps the p-value honest.

**10.** *(Applied)* You must size an experiment to detect a **1%** lift in conversion. What drives the required sample size, and why might 1% be impractical?

> [!example]- Show answer
> Required *n* is driven by three things: the **effect size** you want to detect (smaller → much bigger n), the **baseline variability** of the metric, and your chosen **power** and **α**. Because precision scales as **1/√n** (Chapter 2), detecting a *tiny* effect demands a disproportionately huge sample — halving the detectable effect roughly **quadruples** the needed n. A 1% lift on a low-variance, low-baseline metric can require millions of sessions, which may exceed your traffic or run so long that the world changes underneath the test. The power analysis tells you this **before** you commit — sometimes the honest answer is "this effect isn't detectable at our scale."

## Deeper understanding (expansion)

> [!info]+ 💡 Permutation tests make the null hypothesis a thing you can build
> The reason this chapter leads with resampling isn't nostalgia — it's pedagogy that happens to also be good practice. A classical t-test hands you a p-value from a formula whose assumptions (normality, equal variance) you mostly can't see. A **permutation test** instead *constructs* the null world by hand: "if the labels truly didn't matter, here's the full range of differences I'd see." The observed difference is then just a percentile in that concrete distribution. This demystifies significance — and it's more robust, because you never assumed a distribution. Once permutation testing clicks, p-values stop being magic and become "how unusual is my result in a world where nothing is going on."

> [!info]+ 💡 The multiple-comparisons trap is overfitting wearing a lab coat
> Chapter 2's vast-search effect, this chapter's multiple testing, and Chapter 4–6's overfitting are **the same phenomenon** at different points in the pipeline: search a large enough space of hypotheses/models/variables and you'll find something that fits *this* data by luck and fails to replicate. Significance testing's defenses (Bonferroni/FDR, pre-registration) and modeling's defenses (cross-validation, regularization, holdout sets) are two dialects of one discipline: **honestly account for how many things you tried.** The villain in research scandals and broken ML models alike is almost always an uncounted search.

> [!info]+ 💡 Statistical vs. practical significance — the question p-values can't answer
> A p-value answers "is this effect distinguishable from noise?" It does **not** answer "is this effect big enough to care about?" With enough data, statistically significant but trivially small effects are everywhere — a 0.01% conversion lift can be "p < 0.001" and still not worth the engineering cost. The mature workflow reports **three** things together: the **effect size** (how big), a **confidence interval** (how precisely known), and the **p-value** (how likely under chance) — and then makes a *business* decision, not a statistical one. Treating "significant" as a synonym for "important" is the single most common way significance testing gets abused.

## Connections

- **← Chapter 2** supplies the machinery: a hypothesis test asks whether the observed statistic is plausible under the **null's sampling distribution**, and permutation/bootstrap build that distribution.
- **→ Chapter 4** carries significance into regression — each coefficient gets a **t-statistic** and p-value, with the same caveats and the same multiple-comparisons risk during variable selection.
- **→ Chapters 5–6** rely on the same **train/test discipline** to avoid the overfitting that multiple testing is an instance of.
- Lightweight summary: [[psds-ch03-statistical-experiments-and-significance-testing]] · book hub: [[practical-statistics-for-data-scientists-book]].
