---
tags: [empirical-cdf, glivenko-cantelli, dkw-inequality, plug-in-estimator, statistical-functionals, influence-function, nonparametric, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 7 — Estimating the CDF and Statistical Functionals

> [!abstract]+ Chapter at a glance
>
> This is the chapter where nonparametric inference gets off the ground. With a sample $X_1,\dots,X_n \sim F$ and **no model** for $F$, what can we estimate? The answer starts with $F$ itself: the **empirical distribution function** $\hat F_n$ is the obvious nonparametric estimate, and it is astonishingly good — unbiased at every point, converging uniformly to the truth (Glivenko–Cantelli), and surrounded by an explicit confidence band thanks to the DKW inequality. Once we can estimate $F$, we can estimate **any** quantity that is a function of $F$. Such a quantity $T(F)$ — the mean, variance, median, quantiles, correlation, skewness — is called a **statistical functional**, and the **plug-in principle** says: estimate it by $T(\hat F_n)$, just substituting $\hat F_n$ for $F$. The **influence function** tells us how wiggling one data point perturbs the estimate, and from it we read off standard errors and asymptotic normality. The plug-in principle is the spine of nonparametric statistics and the conceptual launchpad for the bootstrap in the next chapter.

## Core concepts

**The empirical distribution function (eCDF).** Given i.i.d. $X_1,\dots,X_n \sim F$, define
$$
\hat F_n(x) = \frac{1}{n}\sum_{i=1}^n I(X_i \le x),
$$
where $I(\cdot)$ is the indicator. $\hat F_n(x)$ is just the fraction of observations $\le x$. As a function of $x$ it is a **valid CDF in its own right**: a right-continuous step function, starting at $0$, ending at $1$, non-decreasing, jumping by $1/n$ at each observed value (by $k/n$ if a value is repeated $k$ times). It puts mass $1/n$ on each data point and zero mass everywhere else.

**Pointwise distribution of $\hat F_n(x)$.** Fix $x$. Then $n\hat F_n(x) = \sum_i I(X_i \le x)$ is $\text{Binomial}(n, F(x))$, because each indicator is Bernoulli with success probability $P(X_i \le x) = F(x)$. From this everything follows:
- **Unbiased:** $\mathbb{E}[\hat F_n(x)] = F(x)$.
- **Variance:** $\operatorname{Var}(\hat F_n(x)) = \dfrac{F(x)\,(1 - F(x))}{n} \to 0$.
- **MSE:** $\text{mse} = \dfrac{F(x)(1-F(x))}{n} \to 0$, so $\hat F_n(x) \xrightarrow{P} F(x)$ (pointwise consistency), and by the CLT it is asymptotically normal at each $x$.

**Glivenko–Cantelli theorem.** Pointwise convergence is good, but the eCDF does much better: it converges to $F$ **uniformly** in $x$,
$$
\sup_x \bigl|\hat F_n(x) - F(x)\bigr| \xrightarrow{\text{a.s.}} 0.
$$
This is sometimes called *the fundamental theorem of statistics*: the data, through $\hat F_n$, recover the entire distribution arbitrarily well as $n$ grows — no assumptions on $F$ required.

**Dvoretzky–Kiefer–Wolfowitz (DKW) inequality.** Glivenko–Cantelli says the sup-distance vanishes; DKW gives a **finite-sample, distribution-free** bound on how fast:
$$
P\!\left(\sup_x \bigl|\hat F_n(x) - F(x)\bigr| > \epsilon \right) \le 2\,e^{-2 n \epsilon^2}.
$$
The bound holds for **every** $F$ and every $n$ — a remarkable uniform-in-$F$ guarantee.

**Nonparametric confidence band for $F$.** Invert DKW. Set $2e^{-2n\epsilon_n^2} = \alpha$, giving
$$
\epsilon_n = \sqrt{\frac{1}{2n}\log\frac{2}{\alpha}}.
$$
Then define $L(x) = \max\{\hat F_n(x) - \epsilon_n,\,0\}$ and $U(x) = \min\{\hat F_n(x) + \epsilon_n,\,1\}$. The band $\bigl(L(x), U(x)\bigr)$ is a **simultaneous** $1-\alpha$ confidence band: $P\bigl(L(x) \le F(x) \le U(x) \ \text{for all } x\bigr) \ge 1-\alpha$. It traps the *whole curve* at once, not just $F$ at a single point.

**Statistical functionals.** A **statistical functional** $T(F)$ is any quantity computed from the distribution — a map from CDFs to numbers. Examples:
- Mean: $\mu = T(F) = \int x\,dF(x)$.
- Variance: $\sigma^2 = \int (x - \mu)^2\,dF(x)$.
- Median: $m = F^{-1}(1/2)$; more generally quantiles $F^{-1}(p)$.
- Correlation, skewness, $P(X > c)$, etc.

**The plug-in estimator.** The **plug-in principle** estimates $T(F)$ by
$$
\hat\theta = T(\hat F_n),
$$
literally substituting the empirical CDF for the unknown $F$. Because $\hat F_n$ puts mass $1/n$ at each data point, plug-in estimators are typically sample-analogues of population quantities.

**Linear functionals.** A functional of the form $T(F) = \int a(x)\,dF(x)$ is **linear** in $F$. Its plug-in estimator collapses into a simple average:
$$
T(\hat F_n) = \int a(x)\,d\hat F_n(x) = \frac{1}{n}\sum_{i=1}^n a(X_i).
$$
So the plug-in mean is $\bar X_n$, the plug-in $P(X>c)$ is the sample proportion exceeding $c$, and so on. Many functionals are linear or built from linear pieces, which makes plug-in estimation concrete.

**The influence function.** The **influence function** $L_F(x)$ measures the sensitivity of $T$ to a tiny contamination of $F$ by a point mass at $x$ (a Gâteaux-type derivative). For a linear functional $T(F)=\int a\,dF$, the influence function is just $L_F(x) = a(x) - T(F)$ (centered). The key payoffs:
- The **asymptotic variance** of $T(\hat F_n)$ is $\tau^2/n$ where $\tau^2 = \int L_F(x)^2\,dF(x)$.
- The **estimated standard error** is $\widehat{\text{se}} = \hat\tau/\sqrt{n}$, with $\hat\tau^2 = \frac{1}{n}\sum_i \hat L^2(X_i)$ (plug $\hat F_n$ into $L_F$).
- **Asymptotic normality:** under regularity, $\dfrac{T(\hat F_n) - T(F)}{\widehat{\text{se}}} \rightsquigarrow N(0,1)$, giving Wald-type CIs $T(\hat F_n) \pm z_{\alpha/2}\,\widehat{\text{se}}$.

**Worked plug-in examples.**
- **Mean:** $T(F)=\int x\,dF \Rightarrow T(\hat F_n) = \frac1n\sum_i X_i = \bar X_n$. Influence function $L_F(x)=x-\mu$, so $\tau^2 = \sigma^2$ and $\widehat{\text{se}} = S/\sqrt n$.
- **Variance:** $T(F)=\int(x-\mu)^2 dF \Rightarrow T(\hat F_n) = \frac1n\sum_i (X_i - \bar X_n)^2$ — the plug-in variance with divisor $n$ (not $n-1$), i.e. it is slightly biased.
- **Median:** $T(\hat F_n) = \hat F_n^{-1}(1/2)$ = the sample median.
- **Skewness:** $\kappa = \dfrac{\int (x-\mu)^3 dF}{\sigma^3}$; plug-in replaces each population moment with its sample analogue.
- **Correlation:** for bivariate $(X,Y)$, the plug-in estimator of $\rho$ is the sample correlation coefficient $\hat\rho$; its standard error is found via the influence function (or, more easily in practice, the bootstrap).

**Why this chapter matters.** The plug-in principle reduces "estimate any feature of the distribution" to "compute that feature of $\hat F_n$." Standard errors come from the influence function — but for many functionals the influence function is awkward, and that is exactly the gap the **bootstrap** (Chapter 8) fills by simulating from $\hat F_n$.

## Quiz

**1.** Write down the definition of the empirical distribution function and describe its shape as a function of $x$.

> [!example]- Show answer
> The eCDF is $\hat F_n(x) = \frac{1}{n}\sum_{i=1}^n I(X_i \le x)$, the fraction of sample points $\le x$. As a function of $x$ it is a right-continuous, non-decreasing step function that starts at $0$ (left of the smallest data point) and rises to $1$ (right of the largest). It jumps by $1/n$ at each observation, or by $k/n$ at a value repeated $k$ times. It is itself a legitimate CDF — the CDF of the discrete distribution that places mass $1/n$ on each observed value.

**2.** Show that $\hat F_n(x)$ is unbiased for $F(x)$ and give its variance.

> [!example]- Show answer
> Fix $x$. Each $I(X_i \le x)$ is Bernoulli with success probability $P(X_i \le x) = F(x)$, so $n\hat F_n(x) \sim \text{Binomial}(n, F(x))$. Hence $\mathbb{E}[\hat F_n(x)] = \frac{1}{n}\cdot nF(x) = F(x)$, i.e. it is exactly unbiased at every $x$ and every $n$. The variance is $\operatorname{Var}(\hat F_n(x)) = \frac{1}{n^2}\cdot nF(x)(1-F(x)) = \frac{F(x)(1-F(x))}{n}$, which goes to $0$, so $\hat F_n(x)$ is consistent pointwise.

**3.** State the Glivenko–Cantelli theorem and explain why it is called "the fundamental theorem of statistics."

> [!example]- Show answer
> Glivenko–Cantelli states that $\sup_x |\hat F_n(x) - F(x)| \xrightarrow{\text{a.s.}} 0$ as $n \to \infty$ — the eCDF converges to the true CDF **uniformly** over all $x$, not merely at each point separately. It is called the fundamental theorem of statistics because it guarantees that the sample, through $\hat F_n$, can recover the *entire* underlying distribution to arbitrary accuracy as data accumulate, with **no assumptions** on the form of $F$. It is the formal justification that learning the distribution from data is possible in the nonparametric setting.

**4.** What is the DKW inequality, and what makes it more useful than Glivenko–Cantelli alone?

> [!example]- Show answer
> The Dvoretzky–Kiefer–Wolfowitz inequality bounds the tail of the sup-distance: $P\bigl(\sup_x |\hat F_n(x) - F(x)| > \epsilon\bigr) \le 2e^{-2n\epsilon^2}$. Where Glivenko–Cantelli is an asymptotic, qualitative statement (the distance vanishes), DKW is a **finite-sample, quantitative** bound that holds for every $n$ and, crucially, for **every** $F$ (it is distribution-free). That uniformity in $F$ is what lets us turn it into an honest confidence band without knowing or assuming anything about $F$.

**5.** Using DKW, construct a $1-\alpha$ simultaneous confidence band for $F$.

> [!example]- Show answer
> Choose $\epsilon_n$ so the DKW bound equals $\alpha$: solving $2e^{-2n\epsilon_n^2} = \alpha$ gives $\epsilon_n = \sqrt{\frac{1}{2n}\log\frac{2}{\alpha}}$. Then set $L(x) = \max\{\hat F_n(x) - \epsilon_n, 0\}$ and $U(x) = \min\{\hat F_n(x) + \epsilon_n, 1\}$ (clipped to $[0,1]$). The band $(L(x), U(x))$ satisfies $P\bigl(L(x) \le F(x) \le U(x)\ \text{for all }x\bigr) \ge 1-\alpha$. Because the bound is on the *supremum* deviation, the coverage is **simultaneous** across all $x$ — the whole curve is trapped at once, not just one point.

**6.** Define a statistical functional and give four examples.

> [!example]- Show answer
> A statistical functional $T(F)$ is any quantity that is a function of the distribution $F$ — a map sending a CDF to a real number (or vector). Examples: the mean $T(F)=\int x\,dF(x)$; the variance $T(F)=\int (x-\mu)^2\,dF(x)$; the median $T(F)=F^{-1}(1/2)$ (and more generally quantiles $F^{-1}(p)$); and the correlation between two components of a bivariate distribution. Skewness, kurtosis, and tail probabilities $P(X>c)$ are also functionals. The point is that almost every "feature of the population" we care about is some $T(F)$.

**7.** State the plug-in principle and explain how it simplifies for a linear functional.

> [!example]- Show answer
> The plug-in principle estimates a functional $T(F)$ by $T(\hat F_n)$ — substitute the empirical CDF $\hat F_n$ for the unknown $F$ and compute the same functional. For a **linear** functional $T(F) = \int a(x)\,dF(x)$, plugging in $\hat F_n$ (which puts mass $1/n$ at each $X_i$) turns the integral into a sum: $T(\hat F_n) = \int a(x)\,d\hat F_n(x) = \frac{1}{n}\sum_{i=1}^n a(X_i)$. So plug-in estimators of linear functionals are just **sample averages** of $a(X_i)$ — e.g. the plug-in mean is $\bar X_n$ and the plug-in $P(X>c)$ is the sample proportion above $c$.

**8.** What is the influence function, and how do you use it to get a standard error?

> [!example]- Show answer
> The influence function $L_F(x)$ measures how much the functional $T$ changes when the distribution $F$ is contaminated by a tiny point mass at $x$ — essentially the derivative of $T$ in the direction of a Dirac at $x$. For a linear functional it is $L_F(x) = a(x) - T(F)$. The asymptotic variance of the plug-in estimator is $\tau^2/n$ with $\tau^2 = \int L_F(x)^2\,dF(x)$, so the **estimated standard error** is $\widehat{\text{se}} = \hat\tau/\sqrt n$, where $\hat\tau^2 = \frac{1}{n}\sum_i \hat L^2(X_i)$ is obtained by plugging $\hat F_n$ into the influence function. Under regularity, $T(\hat F_n)$ is asymptotically normal, giving Wald CIs $T(\hat F_n) \pm z_{\alpha/2}\,\widehat{\text{se}}$.

**9.** Derive the plug-in estimators of the mean and the variance, and comment on the variance estimator's bias.

> [!example]- Show answer
> For the mean, $T(F)=\int x\,dF$ is linear, so $T(\hat F_n) = \frac1n\sum_i X_i = \bar X_n$. For the variance, $T(F)=\int (x-\mu)^2\,dF$; substituting $\hat F_n$ (with $\mu$ replaced by $\bar X_n$) gives $T(\hat F_n) = \frac1n\sum_i (X_i - \bar X_n)^2$. Note the divisor is $n$, not $n-1$, so the plug-in variance is **slightly biased** downward (its expectation is $\frac{n-1}{n}\sigma^2$). This is a generic feature of plug-in: it is consistent but not always exactly unbiased; the bias here is $O(1/n)$ and vanishes asymptotically.

**10.** *(Applied)* You have $n = 100$ i.i.d. observations and want a $95\%$ confidence band for the whole CDF. Compute the band half-width $\epsilon_n$ and describe how you would also report a plug-in estimate and CI for the population median.

> [!example]- Show answer
> With $\alpha = 0.05$ and $n=100$: $\epsilon_n = \sqrt{\frac{1}{2\cdot 100}\log\frac{2}{0.05}} = \sqrt{\frac{1}{200}\log 40} = \sqrt{\frac{3.689}{200}} \approx \sqrt{0.01844} \approx 0.136$. So plot $\hat F_n(x)$ and shade $\pm 0.136$ (clipped to $[0,1]$) for a simultaneous $95\%$ band. For the median, the plug-in estimate is the sample median $\hat m = \hat F_n^{-1}(1/2)$; for a CI you can either use the influence-function standard error, or — much more conveniently for a quantile — read it off the confidence band by intersecting the horizontal line at $0.5$ with $L(x)$ and $U(x)$, or simply bootstrap (Ch. 8). The numbers above are illustrative; the structure is what matters.

## Deeper understanding (expansion)

> [!info]+ 💡 Why uniform convergence (Glivenko–Cantelli) is the right notion
>
> Pointwise convergence $\hat F_n(x) \to F(x)$ for each fixed $x$ is weaker than it looks: a sequence of functions can converge at every point yet still misbehave *as functions* — e.g. spikes that move around. For statistics we usually want guarantees about $F$ **as a whole curve**: confidence bands, quantile estimates, functionals defined by integrating against $dF$. Uniform convergence, $\sup_x|\hat F_n - F| \to 0$, is exactly the strength needed to control all of those simultaneously. The miracle of Glivenko–Cantelli is that the *same* simple estimator $\hat F_n$ that is good pointwise is automatically good uniformly — and DKW even tells us the rate, $O_P(1/\sqrt n)$ in sup-norm, with explicit constants. This pair (qualitative GC + quantitative DKW) is what makes the eCDF the canonical nonparametric estimate.

> [!info]+ 💡 The plug-in principle as a unifying recipe
>
> Almost every estimator you have already met is secretly a plug-in estimator. The sample mean, sample variance, sample correlation, sample quantiles, the empirical CDF itself — all are $T(\hat F_n)$ for the corresponding functional $T$. This reframing has two big payoffs. First, it gives a *single* derivation of consistency: since $\hat F_n \to F$ and most functionals of interest are continuous (in the right sense), $T(\hat F_n) \to T(F)$ by a continuous-mapping argument. Second, it gives a *single* recipe for standard errors via the influence function: differentiate $T$ once, evaluate at $\hat F_n$, and divide by $\sqrt n$. The catch is that the influence-function calculation can be messy for complicated $T$ (correlations, ratios, smooth functions of several moments). That difficulty is precisely the motivation for the bootstrap, which approximates the sampling distribution of $T(\hat F_n)$ by resampling from $\hat F_n$ — sidestepping the analytical derivative entirely.

> [!info]+ 💡 Nonparametric does not mean assumption-free
>
> It is tempting to read "nonparametric" as "no assumptions." But the eCDF results lean on i.i.d. sampling from a *fixed* $F$, and the influence-function standard errors and asymptotic-normality statements carry their own regularity conditions (the functional must be smooth enough — Hadamard/Gâteaux differentiable — for the linearization to be valid). The honest reading is: nonparametric methods drop assumptions about the *parametric form* of $F$, trading the strong-but-fragile efficiency of a correct parametric model for robustness against model misspecification. That trade is the through-line of the whole nonparametric strand of the book: you pay in variance and in needing larger $n$, and you buy protection against being catastrophically wrong about the shape of the distribution.

## Connections

- [[02-random-variables]] — $F$, its inverse $F^{-1}$ (quantiles), and the CDF properties (right-continuity, monotonicity) defined there are exactly the structure $\hat F_n$ imitates. ← The eCDF is the empirical counterpart of the population CDF from Chapter 2.
- [[05-convergence-of-random-variables]] — Glivenko–Cantelli is a uniform strong law; DKW is a concentration/large-deviation bound; pointwise consistency and asymptotic normality of $\hat F_n(x)$ are direct LLN/CLT applications. ← This chapter is convergence theory put to work.
- [[06-models-inference-and-learning]] — Chapter 6 framed parametric vs. nonparametric inference, bias, variance, MSE, standard error, and confidence sets. → Here those abstractions become the eCDF (MSE $= F(1-F)/n$), the DKW band (a confidence set for an infinite-dimensional parameter $F$), and plug-in point estimates with influence-function standard errors.
- [[08-the-bootstrap]] — The next chapter operationalizes the plug-in idea: to approximate the sampling distribution of $T(\hat F_n)$, *resample* from $\hat F_n$. → The bootstrap is "plug-in for the whole sampling distribution," and it rescues standard-error estimation when the influence function is intractable.
- [[09-parametric-inference]] — The contrast piece: instead of $T(\hat F_n)$ with a fully nonparametric $\hat F_n$, parametric inference assumes $F = F_\theta$ and estimates the finite-dimensional $\theta$ (MLE, Fisher information, the delta method). → Read Chapters 7–9 together as the nonparametric / resampling / parametric trio for estimating functionals and their uncertainty.
