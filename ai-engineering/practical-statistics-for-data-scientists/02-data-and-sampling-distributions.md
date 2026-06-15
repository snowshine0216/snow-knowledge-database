---
tags: [sampling, sampling-distribution, central-limit-theorem, bootstrap, standard-error, probability-distributions, bruce-gedeck, study-guide, quiz]
source: https://github.com/gedeck/practical-statistics-for-data-scientists
---

# Chapter 2 — Data and Sampling Distributions

> [!abstract]+ Chapter at a glance
> This is the conceptual engine of the book. A statistic (a mean, a proportion, a regression slope) computed from a **sample** is itself a random quantity — draw a different sample and you'd get a different value. The spread of those possible values is the **sampling distribution**, summarized by the **standard error** and explained by the **central limit theorem**. The **bootstrap** lets you reconstruct that distribution empirically for *any* statistic by resampling your data. The chapter also warns that **bias beats size** — a non-representative sample doesn't improve with more data — and tours the probability distributions a data scientist actually meets.

## Core concepts

**Random sampling and sample bias**
- We use a **sample** to infer about a **population**. **Random sampling** (every member equally likely) and **stratified sampling** (sample within defined strata) aim for **representativeness**.
- **Bias** is systematic error — the sample is wrong in a consistent direction. **Sample selection bias** (e.g. self-selected survey respondents) is the classic culprit.
- **Size vs. quality**: in the big-data era it's tempting to think more data fixes everything. It doesn't — **a biased sample stays biased no matter how large**. Volume helps only once representativeness is secured.

**Selection bias**
- **Selection bias** = consciously or unconsciously picking data in a way that produces a misleading result. Forms include the **vast search effect** (try enough models/variables and something looks significant by chance) and **regression to the mean** (extreme measurements tend to be followed by more average ones, faking a "treatment effect").

**Sampling distribution of a statistic**
- Distinguish the **data distribution** (spread of individual data points) from the **sampling distribution** (spread of a *statistic* over many hypothetical samples). The sampling distribution is always **tighter** and gets tighter as *n* grows.
- The **standard error** is its standard deviation: `SE = s / √n`. The **√n** means precision improves slowly — to **halve** the SE you need **4×** the data.
- The **central limit theorem (CLT)**: as *n* grows, the sampling distribution of the mean approaches a **normal** shape regardless of the population's distribution. It's why normal-based intervals work even for non-normal data — though the book notes the bootstrap makes the CLT less essential in practice.

**The bootstrap**
- **Resample with replacement** from the observed data (same size *n*), recompute the statistic, repeat thousands of times. The distribution of those recomputed values approximates the **sampling distribution** — no formula and no normality assumption required.
- Works for statistics that have **no neat formula** (medians, trimmed means, complex model parameters), underlies **bagging** in ML, and yields easy **confidence intervals**.
- Caveat: the bootstrap **doesn't create new information** — it can't rescue a sample that's too small or biased; it only quantifies the uncertainty in the data you have.

**Confidence intervals**
- An interval (e.g. **95%**) expressing the uncertainty around an estimate; the bootstrap **percentile** interval (drop the extreme 2.5% each tail) is the most intuitive construction. The confidence level is about the **procedure's** long-run coverage, not a probability about the one interval you computed.

**Normal distribution and friends**
- **Normal (Gaussian)** distribution, the **standard normal** (z-scores), and the **QQ-plot** to check normality visually. Data is less normal than people assume.
- **Long-tailed distributions** — real-world data often has heavy tails (high **skewness**/**kurtosis**); **black swan** extreme events are more common than a normal model predicts.

**The other workhorse distributions**
- **Student's t** — sampling distribution of the mean for **small samples**; governed by **degrees of freedom**.
- **Binomial** — number of successes in *n* yes/no **trials** with probability *p*.
- **Chi-square** — for **count** data and contingency-table/goodness-of-fit tests.
- **F** — ratio of variances; underlies **ANOVA**.
- **Poisson / exponential / Weibull** — events over time: **Poisson** counts events in an interval (rate **λ**), **exponential** models the **time between** events, and **Weibull** generalizes it for changing failure rates (reliability/lifetime analysis).

## Quiz

**1.** A startup boasts it analyzed **50 million** users' behavior, so its conclusions must be solid. Where's the flaw?

> [!example]- Show answer
> **Size doesn't cure bias.** If those 50M users are unrepresentative of the population the company wants to generalize to (e.g. only engaged power-users, only one region, only people who opted in), the conclusions are systematically wrong — and a huge *n* just makes the biased estimate **more precisely wrong**, narrowing the confidence interval around the wrong value. Representativeness (random/stratified sampling, understanding who's missing) matters more than raw volume. Big data earns trust only after you've ruled out selection bias.

**2.** Carefully distinguish the **data distribution** from the **sampling distribution**.

> [!example]- Show answer
> The **data distribution** is the spread of the **individual data points** themselves (e.g. the histogram of all customers' ages). The **sampling distribution** is the spread of a **summary statistic** (e.g. the *mean* age) computed over many hypothetical samples of size *n*. The sampling distribution is always **narrower** than the data distribution and **narrows further as n grows** (by 1/√n), because averaging cancels out individual variation. Confusing the two leads people to think a large sample makes individual predictions precise — it makes the *estimate of the average* precise.

**3.** Define **standard error** and explain the practical consequence of its √n form.

> [!example]- Show answer
> The **standard error** is the standard deviation of a statistic's sampling distribution — how much your estimate would bounce around across repeated samples: `SE = s/√n`. The **√n** in the denominator means precision has **diminishing returns**: going from 100 to 400 samples halves the SE, but going from 400 to 800 only cuts it by ~30%. Practically, doubling precision costs **4× the data** — a key budgeting fact for experiments and a reason huge samples aren't always worth it.

**4.** Explain the **bootstrap** procedure and what makes it so broadly useful.

> [!example]- Show answer
> **Bootstrap**: from your *n* observed values, draw a resample of size *n* **with replacement** (so some points repeat, others are omitted), compute your statistic, and repeat thousands of times. The collection of statistics approximates its **sampling distribution**, giving you a standard error or confidence interval **without any formula or distributional assumption**. It's broadly useful because it works for statistics that have no clean analytic SE (median, trimmed mean, correlation, arbitrary model outputs) and because the same resampling idea generalizes to **bagging** in machine learning.

**5.** What can the bootstrap *not* do?

> [!example]- Show answer
> It **cannot manufacture information that isn't in the sample.** If the sample is **too small**, the bootstrap faithfully reproduces a too-small sample's limitations — it quantifies uncertainty but can't shrink it below what the data supports. If the sample is **biased**, every resample inherits that bias, so the bootstrap gives a confident interval around the wrong value. The bootstrap estimates **variability**, not **representativeness**; getting a good sample is still your job.

**6.** State the **central limit theorem** and why the book says it matters *less* than classical courses imply.

> [!example]- Show answer
> The **CLT**: as sample size grows, the sampling distribution of the mean (and many other statistics) tends toward a **normal** distribution no matter the shape of the underlying population. Classically this is the justification for normal-based t-tests and confidence intervals. The book downplays it because in practice you can just **bootstrap** the sampling distribution directly — you don't need the CLT's normal approximation to build an interval, and the bootstrap doesn't break when n is modest or the statistic is exotic. The CLT remains good intuition, but it's no longer a practical necessity.

**7.** Why do data scientists need to worry about **long-tailed** distributions?

> [!example]- Show answer
> Many real-world quantities — incomes, city sizes, request latencies, financial returns, file sizes — are **heavy-tailed**: extreme values occur far more often than a normal distribution predicts. If you assume normality, you'll **underestimate the frequency and impact of extremes** ("black swans"), mis-set thresholds, and report misleading means/SDs. Practically: check tails with a **QQ-plot**, prefer **robust** summaries (median/IQR), and consider transforms (log) before applying normal-theory methods.

**8.** Match each to its job: **binomial**, **Poisson**, **exponential**, **t**.

> [!example]- Show answer
> **Binomial** — counts of successes over a fixed number of independent yes/no trials (e.g. clicks out of impressions). **Poisson** — counts of events in a fixed interval of time/space given an average rate λ (e.g. support tickets per hour). **Exponential** — the **time between** consecutive Poisson events (e.g. seconds between arrivals). **Student's t** — the sampling distribution of a mean for **small samples**, slightly heavier-tailed than the normal and parameterized by degrees of freedom. Binomial/Poisson/exponential model the *data-generating process*; the t models the *estimate's uncertainty*.

**9.** *(Applied)* You measured a **median** session length and need a confidence interval, but there's no tidy formula for the SE of a median. What do you do?

> [!example]- Show answer
> **Bootstrap it.** Resample your session lengths with replacement (same n) thousands of times, compute the **median** of each resample, and take the **2.5th and 97.5th percentiles** of those medians as a 95% confidence interval. This sidesteps the missing formula entirely and naturally handles the skew typical of session-length data. (This is exactly the situation the bootstrap was made for — a robust statistic with no clean analytic standard error.)

**10.** *(Applied)* An ops team notices that branches with the **worst** error rates last month improved this month even with no intervention, and credits a new dashboard. Statistically, what's the likely explanation?

> [!example]- Show answer
> **Regression to the mean** — a form of selection bias. By selecting the *most extreme* performers, you're partly selecting for **bad luck** that month; extreme measurements are typically followed by more average ones simply because the extremity was partly random, regardless of any intervention. The dashboard may have done nothing. To actually attribute the improvement you'd need a **control group** (branches with similar bad rates that *didn't* get the dashboard) and a randomized comparison — which is exactly the experiment design Chapter 3 sets up.

## Deeper understanding (expansion)

> [!info]+ 💡 The one mental model: data → sample → statistic → sampling distribution
> If you internalize a single picture from this book, make it this chain. The world has a **population** you can't see; you draw a **sample**; you compute a **statistic**; and because the sample was random, that statistic lands somewhere in a **sampling distribution**. Every inferential tool — standard errors, confidence intervals, p-values, hypothesis tests — is just a way of describing or interrogating that last distribution. The bootstrap is special because it makes the abstract distribution **physically reproducible** on your laptop: you literally generate the "other samples you might have drawn." Once you see inference as "describe the sampling distribution," the rest of the book stops being a bag of tricks and becomes one idea applied repeatedly.

> [!info]+ 💡 Bias and variance are different enemies — and bias is the scarier one
> Standard error (variance) is **visible and shrinkable**: collect more data and it goes down predictably. **Bias** is invisible in the data itself — no amount of internal analysis reveals that your sample systematically excludes a group — and it **doesn't shrink with n**. That asymmetry is why the chapter spends as much energy on selection bias as on the bootstrap. A precise estimate (tiny SE) of a biased quantity is a trap: the narrow confidence interval radiates false confidence. The discipline is to spend skepticism on *how the sample was collected* before celebrating *how much* you collected.

> [!info]+ 💡 Why the √n curve quietly governs experiment budgets
> The 1/√n decay of the standard error is one of the most consequential facts for anyone running experiments or A/B tests. It means statistical precision is **expensive at the margin**: the first thousand samples buy a lot of certainty; the next ten thousand buy a little. This shapes real decisions — when to stop an experiment, whether a tiny effect is even detectable at a feasible sample size (Chapter 3's power analysis), and why chasing ever-smaller effects requires disproportionately huge samples. It's also why **reducing variance by design** (stratification, paired comparisons, better measurement) often beats brute-force sample collection.

## Connections

- **→ Chapter 3** puts the sampling distribution to work: hypothesis tests ask "could this result have come from the null's sampling distribution by chance?" and **permutation tests** build that distribution by resampling, just like the bootstrap.
- **→ Chapter 6** reuses the bootstrap directly as the **bagging** that powers random forests.
- **← Chapter 1** supplied the data distributions and robust summaries this chapter samples from.
- Lightweight summary: [[psds-ch02-data-and-sampling-distributions]] · book hub: [[practical-statistics-for-data-scientists-book]].
