---
tags: [bootstrap, resampling, standard-error, confidence-intervals, monte-carlo, empirical-cdf, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 8 — The Bootstrap

> [!abstract]+ Chapter at a glance
>
> The bootstrap is a general-purpose simulation method for estimating the **sampling distribution** of a statistic $T_n = g(X_1,\dots,X_n)$ — especially its standard error and confidence intervals — in situations where a closed-form formula is hard or impossible to derive. The single governing idea is a plug-in: the true sampling distribution of $T_n$ is determined by the unknown distribution $F$ that generated the data, so we **approximate** it by drawing fresh samples from a known estimate of $F$ — the empirical CDF $\hat F_n$. Sampling from $\hat F_n$ is exactly sampling the original data points *with replacement*. From these resampled datasets we recompute the statistic many times and read off its variability directly. Two distinct errors are at play: a **statistical error** from using $\hat F_n$ instead of $F$ (controlled only by the real sample size $n$), and a **Monte-Carlo error** from using a finite number $B$ of bootstrap replications (which we can shrink to zero just by computing more). The chapter develops the bootstrap estimate of the standard error, three styles of bootstrap confidence interval (normal, pivotal, percentile), the parametric variant, and the important caveat that the bootstrap can fail for non-smooth functionals such as the maximum.

## Core concepts

**The sampling distribution and why it is hard.** A statistic $T_n = g(X_1,\dots,X_n)$ is a random variable; its distribution under repeated sampling from $F$ is the *sampling distribution*. We want functionals of it — most often $\operatorname{Var}_F(T_n)$ and hence the standard error $\operatorname{se} = \sqrt{\operatorname{Var}_F(T_n)}$. For a sample mean we have the tidy $\operatorname{se} = \sigma/\sqrt n$, but for a median, a correlation, a ratio, or an eigenvalue, the analytic formula may be intractable. The bootstrap sidesteps the algebra by simulating.

**The plug-in idea.** The variance of $T_n$ is a function of the unknown $F$. The bootstrap replaces $F$ by its estimate $\hat F_n$:
$$
\operatorname{Var}_F(T_n) \;\longrightarrow\; \operatorname{Var}_{\hat F_n}(T_n).
$$
This is exactly the plug-in principle from estimating functionals — but applied to the *whole* sampling distribution rather than to a scalar parameter.

**The empirical CDF as the resampling distribution.** The empirical CDF
$$
\hat F_n(x) = \frac1n \sum_{i=1}^n \mathbf 1(X_i \le x)
$$
puts mass $1/n$ on each observed data point. Drawing one observation from $\hat F_n$ means picking one of $X_1,\dots,X_n$ uniformly at random. Drawing a full **bootstrap sample** $X_1^*,\dots,X_n^*$ from $\hat F_n$ therefore means *sampling the data with replacement* — some points appear several times, others not at all.

**Two ways to evaluate $\operatorname{Var}_{\hat F_n}(T_n)$.** Even after the plug-in, $\operatorname{Var}_{\hat F_n}(T_n)$ usually has no closed form. So we approximate it by a second layer of simulation (Monte Carlo): draw $B$ bootstrap samples, recompute the statistic on each, and take the sample variance.

**The bootstrap algorithm for the standard error.**
1. Draw $X_1^*,\dots,X_n^*$ with replacement from the data.
2. Compute $T_{n,b}^* = g(X_1^*,\dots,X_n^*)$.
3. Repeat steps 1–2 for $b = 1,\dots,B$.
4. Estimate the variance by
$$
v_{\text{boot}} = \frac1B \sum_{b=1}^{B}\Bigl(T_{n,b}^* - \bar T^*\Bigr)^2,
\qquad \bar T^* = \frac1B\sum_{b=1}^{B} T_{n,b}^*,
$$
and report $\widehat{\operatorname{se}}_{\text{boot}} = \sqrt{v_{\text{boot}}}$.

**Two sources of error.** The bootstrap standard error carries two layers of approximation:
$$
\underbrace{\operatorname{Var}_F(T_n)}_{\text{true}}
\;\approx\;
\underbrace{\operatorname{Var}_{\hat F_n}(T_n)}_{\text{statistical error}}
\;\approx\;
\underbrace{v_{\text{boot}}}_{\text{simulation error}} .
$$
The first step has **statistical error** because $\hat F_n \ne F$; this is governed by $n$ and you cannot reduce it by computing harder. The second step has **Monte-Carlo (simulation) error** from finite $B$; it vanishes as $B \to \infty$. Take $B$ large enough that this error is negligible, then $n$ is the only real limit.

**Three bootstrap confidence intervals.** Write $\hat\theta = T_n$ for the point estimate and $\widehat{\operatorname{se}}_{\text{boot}}$ for the bootstrap standard error. Wasserman gives three intervals at level $1-\alpha$:

- **Normal interval.** Assumes $\hat\theta$ is approximately Gaussian:
$$
\hat\theta \pm z_{\alpha/2}\,\widehat{\operatorname{se}}_{\text{boot}}.
$$
Simplest, but only valid when the sampling distribution of $\hat\theta$ is roughly normal.

- **Pivotal interval.** Builds on the *pivot* $R = \hat\theta - \theta$, whose distribution $H(r) = P(R \le r)$ we estimate from the bootstrap replications. Let $\theta^*_{\beta}$ be the $\beta$ sample quantile of the $\hat\theta^*_b$. The interval is
$$
\bigl(\,2\hat\theta - \hat\theta^*_{1-\alpha/2}\,,\;\; 2\hat\theta - \hat\theta^*_{\alpha/2}\,\bigr).
$$
It does *not* assume normality and has the strongest theoretical justification of the three.

- **Percentile interval.** Just take the empirical quantiles of the bootstrap replications:
$$
\bigl(\,\hat\theta^*_{\alpha/2}\,,\;\; \hat\theta^*_{1-\alpha/2}\,\bigr).
$$
The easiest to describe and compute, but it relies on extra (often unstated) assumptions — it is exactly correct only when a monotone transformation maps $\hat\theta$ to something symmetric and normal.

**Parametric bootstrap.** When you are willing to assume a parametric model $F = f(\cdot;\theta)$, you can resample from the *fitted* model rather than from $\hat F_n$: estimate $\hat\theta$ (e.g. by MLE), then draw $X_1^*,\dots,X_n^* \sim f(\cdot;\hat\theta)$. This is the **parametric bootstrap**; the *nonparametric* bootstrap resamples from $\hat F_n$. The rest of the procedure (recompute, repeat, summarize) is identical.

**When the bootstrap fails.** The bootstrap is not universal. It relies on the statistic being a *smooth* functional of $F$ so that $\hat F_n \approx F$ propagates to $T_n$. It can fail badly for non-smooth functionals — the classic example is estimating the **maximum** $\theta = \max$ of a distribution's support, where the bootstrap distribution of $\max X_i^*$ does not converge to the right thing. Heavy-tailed distributions (e.g. infinite variance, where $\operatorname{se}$ may not even exist) and extreme-order statistics are similar danger zones.

**What the bootstrap is *not*.** Resampling does not manufacture new data or new information. It reuses the one sample you have to *gauge* how much $T_n$ would wobble across hypothetical repeated samples. $B$ is a computational dial you can turn freely; $n$ is the genuine statistical constraint. No amount of bootstrapping fixes a small or biased sample.

## Quiz

**1.** What is the central plug-in idea behind the bootstrap, and why does sampling from $\hat F_n$ amount to resampling with replacement?

> [!example]- Show answer
> The variance (and more generally the entire sampling distribution) of a statistic $T_n$ is a functional of the unknown $F$ that generated the data. The bootstrap replaces $F$ with its estimate $\hat F_n$, computing $\operatorname{Var}_{\hat F_n}(T_n)$ in place of $\operatorname{Var}_F(T_n)$. The empirical CDF $\hat F_n$ puts probability mass $1/n$ on each observed data point, so a draw from $\hat F_n$ is a uniformly-chosen one of $X_1,\dots,X_n$. Drawing a full sample of size $n$ from $\hat F_n$ therefore means selecting data points with replacement, which is precisely the bootstrap resampling step.

**2.** Write down the bootstrap estimate of the variance of $T_n$ and explain each symbol.

> [!example]- Show answer
> The estimate is $v_{\text{boot}} = \frac1B \sum_{b=1}^{B}(T_{n,b}^* - \bar T^*)^2$, where $T_{n,b}^*$ is the statistic recomputed on the $b$-th bootstrap sample, $\bar T^* = \frac1B\sum_b T_{n,b}^*$ is the average over the $B$ replications, and $B$ is the number of resamples. The bootstrap standard error is $\widehat{\operatorname{se}}_{\text{boot}} = \sqrt{v_{\text{boot}}}$. This is just the sample variance of the bootstrap replications, used as a Monte-Carlo approximation to $\operatorname{Var}_{\hat F_n}(T_n)$.

**3.** Name and contrast the two sources of error in the bootstrap standard error. Which one can you drive to zero by computing more?

> [!example]- Show answer
> The first is the **statistical error** from approximating $F$ by $\hat F_n$: even with infinite computation, $\operatorname{Var}_{\hat F_n}(T_n)$ differs from $\operatorname{Var}_F(T_n)$ because the data only describe $F$ imperfectly. This error is controlled by the sample size $n$. The second is the **Monte-Carlo (simulation) error** from using a finite number $B$ of resamples to approximate $\operatorname{Var}_{\hat F_n}(T_n)$. Only the simulation error can be made negligible by computing more (taking $B$ large); the statistical error is fixed once the data are collected.

**4.** Spell out the four steps of the bootstrap procedure for estimating a standard error.

> [!example]- Show answer
> (1) Draw a bootstrap sample $X_1^*,\dots,X_n^*$ by sampling the original data with replacement. (2) Compute the statistic on this resample, $T_{n,b}^* = g(X_1^*,\dots,X_n^*)$. (3) Repeat steps 1 and 2 for $b = 1,\dots,B$ to get $B$ bootstrap replications. (4) Compute the sample standard deviation of those replications, $\widehat{\operatorname{se}}_{\text{boot}} = \sqrt{\tfrac1B\sum_b (T_{n,b}^* - \bar T^*)^2}$. The whole scheme is a double simulation: one layer plugs in $\hat F_n$, the second layer approximates the resulting functional by Monte Carlo.

**5.** Give the three bootstrap confidence intervals (normal, pivotal, percentile) and state the assumption behind each.

> [!example]- Show answer
> The **normal** interval is $\hat\theta \pm z_{\alpha/2}\,\widehat{\operatorname{se}}_{\text{boot}}$, valid when the sampling distribution of $\hat\theta$ is approximately Gaussian. The **pivotal** interval, $(2\hat\theta - \hat\theta^*_{1-\alpha/2},\; 2\hat\theta - \hat\theta^*_{\alpha/2})$, is built from the distribution of the pivot $\hat\theta - \theta$ and needs no normality assumption. The **percentile** interval, $(\hat\theta^*_{\alpha/2},\; \hat\theta^*_{1-\alpha/2})$, simply reads off bootstrap quantiles and is exactly correct only under an extra assumption (existence of a monotone transformation making the estimator symmetric/normal). They differ in their reliance on symmetry and on how the distribution is centered.

**6.** Why is the pivotal interval considered better justified than the percentile interval?

> [!example]- Show answer
> The pivotal interval is derived from the distribution of the pivot $R = \hat\theta - \theta$, whose quantiles are estimated by the bootstrap. Inverting the pivot gives an interval whose coverage is justified by the convergence of the bootstrap distribution of $R$ to the true distribution of $R$, with no assumption of symmetry or normality of $\hat\theta$ itself. The percentile interval implicitly assumes the bootstrap distribution of $\hat\theta$ is already correctly located and symmetric (formally, that some monotone transform is normal), which often holds only approximately. When that assumption fails the percentile interval can miscover, while the pivotal interval remains theoretically grounded.

**7.** Distinguish the nonparametric bootstrap from the parametric bootstrap. When would you prefer the parametric version?

> [!example]- Show answer
> The **nonparametric** bootstrap resamples with replacement from the empirical CDF $\hat F_n$, making no assumption about the form of $F$. The **parametric** bootstrap assumes a model $f(x;\theta)$, estimates $\hat\theta$ (typically by maximum likelihood), and then simulates new datasets from $f(x;\hat\theta)$. You would prefer the parametric version when you genuinely trust the model: it injects that structural knowledge and can be more efficient and more accurate, especially in small samples or for tail behavior. The trade-off is that a wrong parametric model biases the inference, whereas the nonparametric bootstrap is more robust to model misspecification.

**8.** A student claims that taking $B = 10{,}000$ bootstrap replications instead of $B = 1{,}000$ makes the confidence interval "more statistically accurate" for the true parameter. Where is the confusion?

> [!example]- Show answer
> Increasing $B$ only reduces the **Monte-Carlo error** — the discrepancy between $v_{\text{boot}}$ and the ideal $\operatorname{Var}_{\hat F_n}(T_n)$. It does nothing about the **statistical error** of approximating $F$ by $\hat F_n$, which is fixed by the sample size $n$. Once $B$ is large enough that the simulation error is negligible, further increases buy essentially nothing. Statistical accuracy for the *true* parameter is bounded by $n$, not $B$; $B$ is just a computational knob. The bootstrap reuses the existing data and creates no new information.

**9.** Give a concrete situation where the bootstrap fails, and explain why.

> [!example]- Show answer
> Estimating the **maximum** of a distribution's support, $\theta = \sup\{x : F(x) < 1\}$, with $T_n = \max_i X_i$. The bootstrap distribution of $\max_i X_i^*$ does not converge to the correct limiting distribution because the functional is non-smooth: the maximum depends on extreme behavior of $F$ that $\hat F_n$ captures poorly. More generally, the bootstrap requires the statistic to be a *smooth* (e.g. Hadamard-differentiable) functional of $F$; extreme-order statistics, heavy-tailed distributions with infinite variance, and other non-smooth functionals are where it breaks down. In those cases the consistency that justifies the method no longer holds.

**10.** *(Applied)* You have $n = 50$ paired observations and want a 95% CI for the **sample correlation** $\hat\rho$, for which the analytic standard error is awkward. Describe exactly what you resample and outline the procedure.

> [!example]- Show answer
> Resample **pairs** $(X_i, Y_i)$ with replacement — keep each observation's two coordinates together so the dependence structure is preserved — to form a bootstrap dataset of 50 pairs. Compute $\hat\rho^*_b$ on each resample, repeat for $b = 1,\dots,B$ (e.g. $B = 2000$). For a normal interval use $\hat\rho \pm 1.96\,\widehat{\operatorname{se}}_{\text{boot}}$ with $\widehat{\operatorname{se}}_{\text{boot}}$ the sample SD of the $\hat\rho^*_b$; for a pivotal interval use $(2\hat\rho - \hat\rho^*_{0.975},\; 2\hat\rho - \hat\rho^*_{0.025})$; for a percentile interval use $(\hat\rho^*_{0.025},\; \hat\rho^*_{0.975})$. Because $\hat\rho$ is bounded in $[-1,1]$ and skewed near the boundary, the normal interval may be poor and the pivotal interval is generally preferable here.

## Deeper understanding (expansion)

> [!info]+ 💡 Why the percentile interval can be both right and wrong
>
> The percentile interval has a seductive simplicity: just read off the 2.5% and 97.5% quantiles of the bootstrap replications. Its hidden justification is a *transformation argument*. Suppose there exists a monotone increasing $\phi$ such that $\phi(\hat\theta) - \phi(\theta)$ is exactly $N(0,c^2)$ for some constant $c$. Then a percentile interval computed on the $\hat\theta^*$ scale automatically respects that transformation — you never need to know $\phi$. When such a transformation exists, the percentile interval is excellent and even *transformation-respecting* (it stays inside natural bounds like $[-1,1]$ for a correlation). When no such transformation exists — because the estimator is genuinely skewed or biased in a way no monotone reparametrization can fix — the percentile interval can be badly off-center. The pivotal interval, by contrast, works directly with $\hat\theta - \theta$ and does not lean on this transformation existing, which is why Wasserman calls it the more justified of the two.

> [!info]+ 💡 The bootstrap as a second plug-in
>
> It helps to see the bootstrap as the natural sequel to estimating functionals via plug-in. There, a scalar functional $T(F)$ is estimated by $T(\hat F_n)$. The bootstrap applies the *same move one level up*: the quantity of interest is now itself a functional of the sampling distribution of $T_n$ — for example $\operatorname{Var}_F(T_n)$ — and that sampling distribution is, in turn, a functional of $F$. Plug in $\hat F_n$ and you get $\operatorname{Var}_{\hat F_n}(T_n)$. The only new wrinkle is that this second-level functional rarely has a closed form, so we approximate it by Monte-Carlo simulation. Seen this way, the bootstrap is not a separate trick but the plug-in principle iterated, with simulation standing in for an analytic integral. This also clarifies the two-error decomposition: the plug-in introduces statistical error, the simulation introduces Monte-Carlo error.

> [!info]+ 💡 Smoothness is the load-bearing assumption
>
> The bootstrap's validity rides on a functional-delta-method style argument: if $T_n = g(\hat F_n)$ where $g$ is a *smooth* functional, then small perturbations $\hat F_n \approx F$ propagate to $g(\hat F_n) \approx g(F)$ in a controlled, asymptotically linear way, and the bootstrap distribution converges to the true sampling distribution. The means, variances, smooth functions of moments, and the median (under regularity) all qualify. The failure cases — the maximum, the minimum, other extreme quantiles, and statistics under infinite-variance laws — are precisely those where this smoothness breaks: the functional depends discontinuously on the tail of $F$, where $\hat F_n$ is a poor estimate from only a handful of extreme points. The practical lesson is to ask, before bootstrapping, whether the statistic is a smooth function of the data distribution; if it lives on the extremes, reach for specialized extreme-value or subsampling methods instead.

## Connections

- [[07-estimating-cdf-and-functionals]] — ← The bootstrap *is* the plug-in principle applied to the sampling distribution. The empirical CDF $\hat F_n$ and the plug-in estimator $T(\hat F_n)$ defined there are exactly the machinery resampling reuses; bootstrap resampling is sampling from that same $\hat F_n$.
- [[05-convergence-of-random-variables]] — ← The DKW inequality and Glivenko–Cantelli (uniform convergence $\hat F_n \to F$) underwrite the bootstrap's *statistical* validity, while the law of large numbers justifies why the *simulation* error $v_{\text{boot}} \to \operatorname{Var}_{\hat F_n}(T_n)$ as $B \to \infty$. Both convergence ideas live here.
- [[09-parametric-inference]] — → The parametric bootstrap resamples from a fitted model $f(x;\hat\theta)$, so it sits at the boundary with parametric inference; it offers a simulation-based alternative to delta-method or Fisher-information standard errors when those are awkward to derive.
- [[11-bayesian-inference]] — → A complementary philosophy for quantifying uncertainty: where the bootstrap simulates resampled *data*, Bayesian inference simulates from a *posterior*. Both produce intervals, but their interpretations (frequentist coverage vs. posterior credibility) differ.
- [[24-simulation-methods]] — → The Monte-Carlo layer of the bootstrap is exactly the simulation machinery developed there; the bootstrap is one of the most important applied instances of "estimate an intractable quantity by simulating from a known distribution."
- [[06-models-inference-and-learning]] — ← Frames the estimand $T_n$ and the notions of bias, standard error, and confidence interval that the bootstrap is built to estimate when closed forms are unavailable.
