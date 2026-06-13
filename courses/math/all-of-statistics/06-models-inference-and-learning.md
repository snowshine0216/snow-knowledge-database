---
tags: [statistical-inference, point-estimation, bias-variance, confidence-intervals, frequentist, parametric-models, nonparametric-models, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 6 — Models, Statistical Inference and Learning

> [!abstract]+ Chapter at a glance
>
> This is the pivot chapter of *All of Statistics*: probability gave us the forward map (a known distribution generates random data), and now we run the map backwards. The core problem of **statistical inference** is: given data $X_1,\dots,X_n \sim F$ drawn iid from an *unknown* distribution $F$, what can we say about $F$ — or about some feature $\theta = T(F)$ of it? Wasserman frames the whole enterprise around three nested ideas: a **statistical model** (the set of distributions we entertain), the **parameter** we want to learn, and the **inference task** (estimation, confidence sets, or hypothesis testing). He distinguishes parametric from nonparametric models, defines the key quality measures of an estimator — bias, standard error, and mean squared error — and lays out the bias–variance decomposition that recurs throughout the book. The chapter also fixes the *correct* frequentist reading of a confidence interval (a perennial source of confusion) and sketches the frequentist-vs-Bayesian split that later chapters develop. Finally it translates the statistics vocabulary into the machine-learning vocabulary, so that "supervised learning," "classification," and "regression" become special cases of inference.

## Core concepts

**The inference problem.** We observe $X_1, \dots, X_n$ drawn iid from some distribution $F$. We do *not* know $F$. **Statistical inference** (a.k.a. "learning") is the process of using the data to infer $F$, or to infer some quantity $\theta = T(F)$ — a *functional* of the distribution such as the mean, variance, median, or a regression coefficient. Inference inverts the logic of probability: probability reasons from a known $F$ to the behavior of the data; inference reasons from the data to a possibly-unknown $F$.

**Statistical models.** A statistical model $\mathfrak{F}$ is a *set* of distributions (or densities, or regression functions). It encodes our assumptions about where the truth might live. Inference is only ever as good as the model: we estimate $\theta$ *under the assumption* that the true $F \in \mathfrak{F}$.

**Parametric models.** A model is **parametric** if it can be indexed by a *finite-dimensional* parameter. Example:
$$\mathfrak{F} = \Big\{\, f(x;\mu,\sigma) = \tfrac{1}{\sigma\sqrt{2\pi}}\,e^{-(x-\mu)^2/(2\sigma^2)} \;:\; \mu \in \mathbb{R},\ \sigma > 0 \,\Big\}.$$
Here the parameter is $\theta = (\mu,\sigma) \in \Theta \subset \mathbb{R}^2$, the **parameter space**. In general a parametric model is $\mathfrak{F} = \{ f(x;\theta) : \theta \in \Theta \}$ with $\Theta \subseteq \mathbb{R}^k$ for some finite $k$.

**Nonparametric models.** A model is **nonparametric** if it *cannot* be parametrized by a finite-dimensional parameter — the model is "infinite-dimensional." Example: $\mathfrak{F}_{\text{ALL}}$, the set of *all* CDFs; or the set of all CDFs whose density exists; or the set of all densities with bounded second derivative. Nonparametric models make weaker assumptions and so are more robust, at the cost of needing more data and giving less precise answers.

**Parameter of interest vs nuisance parameter.** Often only one component of $\theta$ is of interest. If we want $\theta = \mu$ in $N(\mu,\sigma^2)$ but don't care about $\sigma$, then $\sigma$ is a **nuisance parameter**. More generally the target is a functional $T(F)$; e.g. the mean is $T(F) = \int x\, dF(x)$.

**The three inference tasks.** Wasserman organizes inference into:
- **Point estimation** — a single best guess $\hat\theta_n$ of $\theta$.
- **Confidence sets** — an interval (or region) $C_n$ that traps $\theta$ with a stated coverage.
- **Hypothesis testing** — deciding between a default hypothesis $H_0$ and an alternative $H_1$.

**Point estimators are random.** A point estimator is any function of the data:
$$\hat\theta_n = g(X_1, \dots, X_n).$$
Because the data are random, $\hat\theta_n$ is itself a **random variable**. Its distribution (induced by the randomness of the sample) is the **sampling distribution**. Everything we say about an estimator's quality is a statement about this sampling distribution. We distinguish the fixed unknown *true* value $\theta$ from the random *estimator* $\hat\theta_n$.

**Bias.** The **bias** of an estimator is how far its average lands from the truth:
$$\operatorname{bias}(\hat\theta_n) = \mathbb{E}_\theta[\hat\theta_n] - \theta.$$
An estimator is **unbiased** if $\operatorname{bias}(\hat\theta_n) = 0$ for all $\theta$. Unbiasedness sounds desirable but is *not* sacred — biased estimators are often better overall (see MSE).

**Standard error.** The **standard error** is the standard deviation of the sampling distribution:
$$\operatorname{se} = \operatorname{se}(\hat\theta_n) = \sqrt{\operatorname{Var}(\hat\theta_n)}.$$
The se often itself depends on unknown quantities and must be estimated, giving the **estimated standard error** $\widehat{\operatorname{se}}$.

**Mean squared error and its decomposition.** The **MSE** measures average squared distance from the truth:
$$\operatorname{MSE} = \mathbb{E}_\theta\big[(\hat\theta_n - \theta)^2\big] = \operatorname{bias}^2(\hat\theta_n) + \operatorname{Var}(\hat\theta_n).$$
This identity — the **bias–variance decomposition** — is one of the most important formulas in the book. It says total error splits cleanly into a systematic part (bias²) and a noise part (variance). Trading a little bias for a large variance reduction can lower MSE — the **bias–variance trade-off**.

**Consistency.** An estimator is **consistent** if it converges in probability to the truth as the sample grows:
$$\hat\theta_n \xrightarrow{\ P\ } \theta.$$
A useful sufficient condition: if $\operatorname{bias} \to 0$ *and* $\operatorname{se} \to 0$, then $\operatorname{MSE} \to 0$, which implies convergence in quadratic mean and hence consistency.

**Asymptotic normality.** Many estimators satisfy
$$\frac{\hat\theta_n - \theta}{\widehat{\operatorname{se}}} \ \rightsquigarrow\ N(0,1),$$
i.e. they are **asymptotically Normal**. This is what makes large-sample confidence intervals and tests routine.

**Wald confidence interval.** When $\hat\theta_n$ is asymptotically Normal, a **$1-\alpha$ confidence interval** is
$$C_n = \hat\theta_n \pm z_{\alpha/2}\,\widehat{\operatorname{se}},$$
where $z_{\alpha/2}$ is the upper $\alpha/2$ quantile of $N(0,1)$ (e.g. $z_{0.025} \approx 1.96$ for 95% coverage). This is a **Wald-type** interval.

**The correct interpretation of a confidence interval.** A $1-\alpha$ confidence interval $C_n$ satisfies
$$\mathbb{P}_\theta(\theta \in C_n) \ge 1 - \alpha \quad \text{for all } \theta.$$
The probability statement is about the *random interval* $C_n$, not about the fixed $\theta$. Read correctly: *if we repeat the whole experiment many times, about $(1-\alpha)$ of the constructed intervals will contain the true $\theta$.* It is **wrong** to say "$\theta$ lies in this particular interval with probability $1-\alpha$" — once the data are observed, the interval is fixed and $\theta$ either is or isn't inside it; there is no probability left. The coverage is a property of the *procedure*, evaluated *before* seeing the data.

**Frequentist vs Bayesian — a first contrast.** In **frequentist** inference $\theta$ is a fixed unknown constant and probability statements are about the data/procedure (over hypothetical repetitions). In **Bayesian** inference $\theta$ is treated as a random variable with a **prior** distribution, and inference produces a **posterior** $p(\theta \mid \text{data})$; a Bayesian "credible interval" *does* admit the statement "$\theta$ is in this interval with probability $1-\alpha$ (given the prior)." The two answers can coincide or diverge; Chapters 11–12 develop the comparison.

**The statistics ↔ machine-learning dictionary.** Wasserman explicitly maps the vocabularies so the rest of the book reads either way:
- estimation / learning, with $\hat\theta_n$ a *learned* quantity;
- classifier / hypothesis or prediction rule;
- supervised learning ≈ regression / classification (predict $Y$ from $X$);
- features / covariates ≈ predictors;
- the bias–variance trade-off is the same object in both fields (over- vs under-fitting).

## Quiz

**1.** State the core problem of statistical inference and explain how it inverts the logic of probability theory.

> [!example]- Show answer
> The core problem: given iid data $X_1,\dots,X_n \sim F$ with $F$ *unknown*, use the data to infer $F$ or some functional $\theta = T(F)$. Probability reasons *forward* — from a fully specified $F$ it predicts the random behavior of the data. Inference reasons *backward* — it starts from observed data and reasons about the $F$ (or feature of $F$) that could have generated it. So probability is the deductive direction and inference (learning) is the inductive direction. Inference is always conducted *relative to a model* $\mathfrak{F}$, the set of candidate distributions assumed to contain the truth.

**2.** Define a statistical model and explain the difference between parametric and nonparametric models, with one example of each.

> [!example]- Show answer
> A statistical model $\mathfrak{F}$ is a *set of distributions* (or densities, or regression functions) that we assume contains the true $F$. A model is **parametric** if it can be indexed by a finite-dimensional parameter $\theta \in \Theta \subseteq \mathbb{R}^k$ — e.g. $\{N(\mu,\sigma^2): \mu \in \mathbb{R}, \sigma>0\}$, indexed by two numbers. A model is **nonparametric** if no finite-dimensional parameter suffices (it is infinite-dimensional) — e.g. the set of *all* CDFs, or all CDFs admitting a density. Parametric models give precise answers under strong assumptions; nonparametric models are robust but demand more data.

**3.** What does it mean to call $\theta$ a "functional" of $F$? Give two examples.

> [!example]- Show answer
> Saying $\theta = T(F)$ means $\theta$ is a feature of the *whole distribution*, computed by applying a map $T$ to $F$. Examples: the mean $T(F) = \int x\, dF(x)$; the variance $T(F) = \int (x-\mu)^2\, dF(x)$; the median $T(F) = F^{-1}(1/2)$; or the value of the CDF at a point, $T(F) = F(c)$. Framing the target as a functional is what lets the same inference machinery cover means, quantiles, regression coefficients, and more, in both parametric and nonparametric settings.

**4.** A point estimator is "a function of the data." Why does this make $\hat\theta_n$ a random variable, and what is its "sampling distribution"?

> [!example]- Show answer
> An estimator is $\hat\theta_n = g(X_1,\dots,X_n)$, a deterministic function of the sample. But the sample itself is random (a fresh draw would give different values), so feeding randomness through $g$ produces a random output: $\hat\theta_n$ is a random variable. Its distribution — induced by the randomness of $X_1,\dots,X_n$ — is the **sampling distribution**. All quality measures (bias, standard error, MSE) are properties of this sampling distribution, not of any single observed value.

**5.** Define bias and standard error. Is an unbiased estimator always preferable?

> [!example]- Show answer
> Bias is $\operatorname{bias}(\hat\theta_n) = \mathbb{E}_\theta[\hat\theta_n] - \theta$: the gap between the estimator's average and the truth. Standard error is $\operatorname{se} = \sqrt{\operatorname{Var}(\hat\theta_n)}$: the standard deviation of the sampling distribution, a measure of spread. No — unbiasedness is *not* always preferable. Because total error is $\operatorname{MSE} = \operatorname{bias}^2 + \operatorname{Var}$, a slightly biased estimator with much smaller variance can have a lower MSE than an unbiased one. Insisting on zero bias can actually hurt.

**6.** Derive the bias–variance decomposition $\operatorname{MSE} = \operatorname{bias}^2 + \operatorname{Var}$ and explain why it matters.

> [!example]- Show answer
> Write $\operatorname{MSE} = \mathbb{E}[(\hat\theta_n - \theta)^2]$. Let $b = \mathbb{E}[\hat\theta_n] - \theta = \operatorname{bias}$. Add and subtract $\mathbb{E}[\hat\theta_n]$: $\hat\theta_n - \theta = (\hat\theta_n - \mathbb{E}[\hat\theta_n]) + b$. Squaring and taking expectation, the cross term $2b\,\mathbb{E}[\hat\theta_n - \mathbb{E}[\hat\theta_n]] = 0$, leaving $\operatorname{MSE} = \operatorname{Var}(\hat\theta_n) + b^2 = \operatorname{Var} + \operatorname{bias}^2$. It matters because it splits total error into a systematic part and a noise part, exposing the **bias–variance trade-off**: methods that reduce variance (smoothing, regularizing) typically add bias, and the best estimator balances the two.

**7.** Define consistency, and state a simple sufficient condition for it in terms of bias and standard error.

> [!example]- Show answer
> An estimator is **consistent** if $\hat\theta_n \xrightarrow{P} \theta$ as $n \to \infty$ — it converges in probability to the true value. A convenient sufficient condition: if both $\operatorname{bias}(\hat\theta_n) \to 0$ and $\operatorname{se}(\hat\theta_n) \to 0$, then $\operatorname{MSE} \to 0$, which is convergence in quadratic mean, which implies convergence in probability. So "bias vanishes and variance vanishes" ⟹ consistency. Consistency is a minimal sanity check: more data should pin the answer down.

**8.** Write down the Wald confidence interval and state the *correct* frequentist interpretation of "95% confidence."

> [!example]- Show answer
> For an asymptotically Normal estimator the Wald $1-\alpha$ interval is $C_n = \hat\theta_n \pm z_{\alpha/2}\,\widehat{\operatorname{se}}$, with $z_{0.025} \approx 1.96$ for 95%. Correct interpretation: the *interval* $C_n$ is random; over repeated sampling, about 95% of such intervals will contain the fixed true $\theta$, i.e. $\mathbb{P}_\theta(\theta \in C_n) \ge 1-\alpha$ for all $\theta$. It is the *procedure* that has 95% coverage. It is wrong to say a *particular* observed interval contains $\theta$ "with probability 0.95" — once computed, the interval is fixed and either does or does not contain $\theta$.

**9.** Contrast the frequentist and Bayesian treatments of the unknown parameter $\theta$. Which framework licenses the statement "$\theta$ is in this interval with probability $1-\alpha$"?

> [!example]- Show answer
> In the **frequentist** view, $\theta$ is a fixed unknown constant; randomness lives in the data, so probability statements describe the procedure over hypothetical repetitions. In the **Bayesian** view, $\theta$ is itself a random variable with a **prior**; combining prior and likelihood yields a **posterior** $p(\theta \mid \text{data})$. A Bayesian **credible interval** integrates the posterior to $1-\alpha$, so the statement "$\theta$ is in this interval with probability $1-\alpha$" is legitimate *Bayesianly* (conditional on the prior). The frequentist confidence interval does *not* license that statement; its $1-\alpha$ refers to long-run coverage of the random interval.

**10.** *(Applied)* You estimate a population mean from $n=400$ observations and get $\hat\theta_n = 50$ with estimated standard error $\widehat{\operatorname{se}} = 2$. Construct a 95% confidence interval, interpret it correctly, and say what happens to its width if you quadruple the sample to $n = 1600$ (assuming the same underlying spread).

> [!example]- Show answer
> The 95% Wald interval is $50 \pm 1.96 \times 2 = 50 \pm 3.92 = (46.08,\, 53.92)$. Correct reading: this *procedure* produces intervals that cover the true mean about 95% of the time over repeated sampling — not that there is a 0.95 probability the true mean lies in $(46.08, 53.92)$. For a sample mean, $\operatorname{se} \propto 1/\sqrt{n}$, so quadrupling $n$ (from 400 to 1600) halves the standard error to $\widehat{\operatorname{se}} \approx 1$, halving the half-width to about $1.96$ and giving roughly $(48.04, 51.96)$. Width shrinks by a factor of 2, illustrating the $\sqrt{n}$ rule.

## Deeper understanding (expansion)

> [!info]+ 💡 Why "unbiased" is a trap, and how the trade-off plays out
>
> The fixation on unbiasedness is one of the most consequential mistakes in applied statistics. Because $\operatorname{MSE} = \operatorname{bias}^2 + \operatorname{Var}$, what matters is total error, not its decomposition. A textbook illustration: estimating the variance, the unbiased estimator divides by $n-1$, but the maximum-likelihood (biased) estimator divides by $n$ and can have smaller MSE. The same logic justifies *shrinkage* and *regularization* across the book and across machine learning — ridge regression, James–Stein estimators, kernel smoothing all deliberately introduce bias to buy a large variance reduction. The bias–variance trade-off reappears as overfitting (low bias, high variance) vs underfitting (high bias, low variance) in Chapters on regression and classification. Whenever you tune a smoothing bandwidth, a penalty strength, or a model's complexity, you are sliding along this trade-off curve, trying to minimize MSE rather than purify bias.

> [!info]+ 💡 The confidence-interval misinterpretation, dissected
>
> The single most common error in reading statistics is treating a *computed* confidence interval as a probability statement about $\theta$. The cleanest way to internalize the fix: the probability lives in the interval's *endpoints*, which are random functions of the data, **before** you look at the data. The guarantee $\mathbb{P}_\theta(\theta \in C_n) \ge 1-\alpha$ is a statement about the random interval $C_n$ for *every* fixed $\theta$. Once you observe data and compute, say, $(46.08, 53.92)$, the randomness is spent — $\theta$ is a constant and is either inside or outside, full stop; there is no "0.95" left to assign. Confidence is a property of the *method's long-run behavior*, like a factory's defect rate, not a belief about one realized interval. The Bayesian credible interval is precisely the object that *does* support the natural-language reading, but only because it injects a prior and conditions on the data — a genuinely different inferential stance, not a reinterpretation of the same number.

> [!info]+ 💡 One vocabulary, two tribes: statistics and machine learning
>
> Wasserman wrote *All of Statistics* partly to give computer scientists a bridge into statistical theory, and this chapter's dictionary is that bridge. "Learning" is just inference; a "classifier" is a prediction rule; "supervised learning" is regression or classification ($Y$ from covariates $X$); "features" are covariates; "weights" are parameters $\theta$. Crucially, the *concepts* transfer, not just the words: an ML practitioner worrying about generalization error is worrying about MSE/risk; cross-validation is estimating risk; the bias–variance trade-off underlies the choice of model capacity. Reading the rest of the book, you can mentally translate either direction — the estimation theory in Chapter 9, the decision theory in Chapter 12, and the nonparametric methods later are all directly about building reliable predictive systems.

## Connections

- [[05-convergence-of-random-variables]] — ← supplies the limit tools this chapter *uses*: convergence in probability defines **consistency** ($\hat\theta_n \xrightarrow{P} \theta$), and convergence in distribution (the CLT) underwrites the **asymptotic normality** that makes Wald intervals work.
- [[07-estimating-cdf-and-functionals]] — → the first concrete nonparametric instance of this chapter's program: estimate the functional $T(F)$ via the empirical CDF (plug-in principle), with the bootstrap supplying standard errors and confidence intervals.
- [[09-parametric-inference]] — → the parametric branch: maximum likelihood as the workhorse point estimator, the Fisher-information formula for $\operatorname{se}$, and the delta method, all turning this chapter's abstractions into recipes.
- [[10-hypothesis-testing-and-p-values]] — → develops the third inference task (testing) in full, including the duality between confidence intervals and tests sketched here.
- [[11-bayesian-inference]] — → fleshes out the Bayesian alternative previewed here: priors, posteriors, and credible intervals, and exactly where they agree with or diverge from frequentist answers.
- [[12-statistical-decision-theory]] — → generalizes bias, variance, and MSE into *risk* under a loss function, formalizing the bias–variance trade-off and the comparison of estimators (admissibility, minimax, Bayes risk).
- The bias–variance decomposition introduced here ← is the same object that governs model complexity in later regression and classification chapters; ← consistency and asymptotic normality lean entirely on [[05-convergence-of-random-variables]].
