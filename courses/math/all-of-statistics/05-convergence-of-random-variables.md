---
tags: [convergence, law-of-large-numbers, central-limit-theorem, delta-method, slutsky, asymptotics, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 5 — Convergence of Random Variables

> [!abstract]+ Chapter at a glance
>
> This chapter is the engine room of the whole book. Almost every later inference statement — "the estimator is consistent", "here is a 95% confidence interval", "the standard error is such-and-such" — is really a statement about what a random quantity does as the sample size $n$ grows. To make those statements precise we need to say what it means for a *sequence* of random variables $X_1, X_2, \ldots$ to "converge" to a limit. Wasserman lays out four notions of convergence (in probability, in distribution, almost surely, and in quadratic mean), sorts out which implies which, and then deploys them to prove the two crown jewels of large-sample theory: the **Law of Large Numbers** (the sample mean settles down to the true mean) and the **Central Limit Theorem** (the sample mean, suitably rescaled, looks Gaussian no matter what the population looked like). Two more tools — **Slutsky's theorem** and the **delta method** — let us push these results through arithmetic and through smooth transformations, which is exactly how confidence intervals for nonlinear quantities get built. The key tension to keep in mind throughout: convergence in distribution is a statement *only about CDFs*, so it is the weakest and most permissive notion, while almost sure and quadratic-mean convergence are genuinely about the random variables getting close.

## Core concepts

**Why we need a notion of convergence.** An estimator $\hat\theta_n$ is a function of $n$ data points, so it is a *random variable that changes with $n$* — a whole sequence $\hat\theta_1, \hat\theta_2, \ldots$. Statements like "the estimator is consistent" or "the sampling distribution is approximately normal" are claims about the asymptotic behavior of this sequence. Finite-sample exact answers are usually intractable; large-sample (asymptotic) approximations are the workaround that makes practical inference possible.

**Convergence in probability ($X_n \xrightarrow{P} X$).** $X_n$ converges in probability to $X$ if for every $\varepsilon > 0$,
$$\lim_{n\to\infty} \mathbb{P}\big(|X_n - X| > \varepsilon\big) = 0.$$
Intuition: the chance that $X_n$ differs from $X$ by more than any fixed amount goes to zero. This is the notion behind **consistency** of estimators.

**Convergence in distribution / in law ($X_n \rightsquigarrow X$).** $X_n$ converges in distribution to $X$ if
$$\lim_{n\to\infty} F_n(t) = F(t)$$
at *every continuity point $t$ of $F$*, where $F_n$ is the CDF of $X_n$ and $F$ the CDF of $X$. This says nothing about whether the actual random variables $X_n$ and $X$ are numerically close — only that their *distributions* line up. It is the weakest of the four notions. The continuity-point caveat matters: it lets discrete distributions converge to discrete limits without the jump points spoiling things.

**Almost sure convergence ($X_n \xrightarrow{\text{a.s.}} X$).** $X_n \to X$ almost surely if
$$\mathbb{P}\Big(\lim_{n\to\infty} X_n = X\Big) = 1,$$
i.e. the sample paths converge pointwise except on a set of probability zero. This is the strongest "closeness" notion in everyday use and underwrites the *Strong* Law of Large Numbers.

**Convergence in quadratic mean / $L_2$ ($X_n \xrightarrow{\text{qm}} X$).** $X_n \to X$ in quadratic mean if
$$\mathbb{E}\big[(X_n - X)^2\big] \to 0.$$
Often the cleanest to verify, because it reduces to controlling a mean and a variance: if $\mathbb{E}[X_n] \to b$ and $\mathbb{V}(X_n) \to 0$, then $X_n \xrightarrow{\text{qm}} b$.

**The implication hierarchy.** The notions are *not* equivalent; they form a one-directional ladder:
$$X_n \xrightarrow{\text{a.s.}} X \;\Longrightarrow\; X_n \xrightarrow{P} X \;\Longrightarrow\; X_n \rightsquigarrow X,$$
$$X_n \xrightarrow{\text{qm}} X \;\Longrightarrow\; X_n \xrightarrow{P} X.$$
None of the reverse implications holds in general. The one valuable partial converse: **if $X_n \rightsquigarrow c$ where $c$ is a constant, then $X_n \xrightarrow{P} c$.** Convergence in distribution to a *point mass* is as good as convergence in probability.

**Weak Law of Large Numbers (WLLN).** If $X_1, \ldots, X_n$ are iid with mean $\mu$ (and finite variance, in the easy proof), then the sample mean
$$\bar X_n = \frac{1}{n}\sum_{i=1}^n X_i \xrightarrow{P} \mu.$$
The quick proof: $\mathbb{E}[\bar X_n] = \mu$ and $\mathbb{V}(\bar X_n) = \sigma^2/n \to 0$, so $\bar X_n \xrightarrow{\text{qm}} \mu$, hence $\xrightarrow{P} \mu$; alternatively use Chebyshev's inequality directly. The **Strong Law** strengthens this to $\bar X_n \xrightarrow{\text{a.s.}} \mu$ and needs only $\mathbb{E}|X_i| < \infty$.

**Central Limit Theorem (CLT).** If $X_1, \ldots, X_n$ are iid with mean $\mu$ and finite variance $\sigma^2$, then
$$Z_n = \frac{\sqrt{n}\,(\bar X_n - \mu)}{\sigma} = \frac{\bar X_n - \mu}{\sqrt{\sigma^2/n}} \rightsquigarrow N(0,1).$$
Equivalently $\bar X_n \approx N(\mu, \sigma^2/n)$ for large $n$. The astonishing part is *universality*: the limiting shape is Gaussian **regardless of the shape of the population distribution** of the $X_i$ — skewed, bounded, discrete, whatever — as long as the variance is finite. This is the deep reason the normal distribution shows up everywhere in statistics.

**Characteristic functions and the continuity theorem (intuition).** The standard proof route uses the characteristic function $\varphi_X(t) = \mathbb{E}[e^{itX}]$, which determines the distribution uniquely. The **continuity theorem** says $X_n \rightsquigarrow X$ iff $\varphi_{X_n}(t) \to \varphi_X(t)$ for every $t$. For the CLT one Taylor-expands the characteristic function of the standardized sum and watches it converge to $e^{-t^2/2}$, the characteristic function of $N(0,1)$. You don't need the algebra for this course — just the idea that convergence of characteristic functions is convergence in distribution.

**Slutsky's theorem.** This is how you combine two sequences. If $X_n \rightsquigarrow X$ and $Y_n \xrightarrow{P} c$ (a constant), then
$$X_n + Y_n \rightsquigarrow X + c, \qquad X_n Y_n \rightsquigarrow cX.$$
Crucial caveat: it requires $Y_n$ to converge to a *constant*. In general $X_n \rightsquigarrow X$ and $Y_n \rightsquigarrow Y$ do **not** imply $X_n + Y_n \rightsquigarrow X + Y$, because convergence in distribution carries no information about the *joint* behavior of the two sequences. The classic application: replace the unknown $\sigma$ in the CLT by a consistent estimator $\hat\sigma_n \xrightarrow{P} \sigma$ and conclude $\sqrt{n}(\bar X_n - \mu)/\hat\sigma_n \rightsquigarrow N(0,1)$ — which is what justifies plugging in an estimated standard error.

**The delta method.** Asymptotic normality transfers through a smooth function. If $\sqrt{n}(\bar X_n - \mu) \rightsquigarrow N(0, \sigma^2)$ and $g$ is differentiable at $\mu$ with $g'(\mu) \neq 0$, then
$$\sqrt{n}\big(g(\bar X_n) - g(\mu)\big) \rightsquigarrow N\big(0,\; g'(\mu)^2\,\sigma^2\big).$$
The mechanism is a first-order Taylor expansion: $g(\bar X_n) \approx g(\mu) + g'(\mu)(\bar X_n - \mu)$, so to leading order $g(\bar X_n)$ is a linear function of an asymptotically normal quantity, and the variance picks up a factor $g'(\mu)^2$. The **multivariate delta method** replaces the scalar derivative by a gradient $\nabla g$ and the variance by the quadratic form $\nabla g(\mu)^{\mathsf T}\,\Sigma\,\nabla g(\mu)$, where $\Sigma$ is the asymptotic covariance matrix.

**From asymptotics to standard errors and confidence intervals.** Put the pieces together: the CLT gives $\bar X_n \approx N(\mu, \sigma^2/n)$; the estimated standard error is $\widehat{\text{se}} = \hat\sigma/\sqrt{n}$; Slutsky lets us swap $\hat\sigma$ for $\sigma$; and the result is the canonical interval
$$\bar X_n \pm z_{\alpha/2}\,\widehat{\text{se}},$$
an approximate $(1-\alpha)$ confidence interval. For a transformed quantity $g(\mu)$, the delta method supplies the standard error $|g'(\bar X_n)|\,\hat\sigma/\sqrt{n}$ and the same interval recipe applies. This is the workhorse pipeline behind most of the inference in the later chapters.

## Quiz

**1.** State the definition of convergence in probability, $X_n \xrightarrow{P} X$.

> [!example]- Show answer
> $X_n$ converges in probability to $X$ if for every $\varepsilon > 0$, $\mathbb{P}(|X_n - X| > \varepsilon) \to 0$ as $n \to \infty$. In words, the probability that $X_n$ deviates from $X$ by more than any fixed tolerance $\varepsilon$ shrinks to zero. This is the formal notion behind a *consistent* estimator. It is a statement about the random variables getting close — stronger than convergence in distribution but weaker than almost sure convergence.

**2.** Convergence in distribution is defined via CDFs at *continuity points*. Why the qualification, and what does $X_n \rightsquigarrow X$ actually assert?

> [!example]- Show answer
> $X_n \rightsquigarrow X$ means $F_n(t) \to F(t)$ at every point $t$ where the limiting CDF $F$ is continuous. The continuity restriction prevents discrete jumps from breaking the definition: a CDF can fail to converge exactly at a jump of $F$ even when the distributions clearly line up, so we simply exempt those points. Importantly, this notion says nothing about the random variables $X_n$ and $X$ being numerically close — only that their *distributions* match in the limit. That is why it is the weakest of the four convergence modes.

**3.** Write down the full implication hierarchy among the four convergence modes and note any partial converse.

> [!example]- Show answer
> Almost sure $\Rightarrow$ in probability $\Rightarrow$ in distribution; and quadratic mean $\Rightarrow$ in probability. So both almost sure and quadratic-mean convergence sit above convergence in probability, which sits above convergence in distribution. None of the reverse implications holds in general. The one useful partial converse: if $X_n \rightsquigarrow c$ for a *constant* $c$, then $X_n \xrightarrow{P} c$ — convergence in distribution to a point mass upgrades to convergence in probability.

**4.** Show that if $\mathbb{E}[X_n] \to b$ and $\mathbb{V}(X_n) \to 0$, then $X_n \xrightarrow{\text{qm}} b$, and hence $X_n \xrightarrow{P} b$.

> [!example]- Show answer
> Quadratic-mean convergence to $b$ requires $\mathbb{E}[(X_n - b)^2] \to 0$. Decompose this mean-squared error as $\mathbb{E}[(X_n - b)^2] = \mathbb{V}(X_n) + (\mathbb{E}[X_n] - b)^2$, the variance plus the squared bias. By assumption the variance term $\to 0$ and the bias $\mathbb{E}[X_n] - b \to 0$, so the squared bias $\to 0$ as well, giving $\mathbb{E}[(X_n - b)^2] \to 0$. Quadratic-mean convergence then implies convergence in probability via the hierarchy (or directly by Markov's inequality applied to $(X_n - b)^2$).

**5.** State the Weak Law of Large Numbers and give the short quadratic-mean proof for iid data with finite variance.

> [!example]- Show answer
> WLLN: if $X_1, \ldots, X_n$ are iid with mean $\mu$ and finite variance $\sigma^2$, then $\bar X_n \xrightarrow{P} \mu$. Proof: $\mathbb{E}[\bar X_n] = \mu$ exactly, and $\mathbb{V}(\bar X_n) = \sigma^2/n \to 0$. Hence by question 4, $\bar X_n \xrightarrow{\text{qm}} \mu$, and quadratic-mean convergence implies convergence in probability. (Equivalently, apply Chebyshev's inequality directly: $\mathbb{P}(|\bar X_n - \mu| > \varepsilon) \le \sigma^2/(n\varepsilon^2) \to 0$.)

**6.** How does the Strong Law of Large Numbers differ from the Weak Law, in both conclusion and assumptions?

> [!example]- Show answer
> The Strong Law concludes $\bar X_n \xrightarrow{\text{a.s.}} \mu$ — almost sure convergence — which is strictly stronger than the Weak Law's convergence in probability. Conceptually, the Strong Law guarantees that for almost every sample path the running average eventually settles to $\mu$ and stays there, not just that the probability of a large deviation shrinks at each $n$. It also requires *weaker* moment assumptions: only $\mathbb{E}|X_i| < \infty$ (a finite mean), no finite variance needed. So the Strong Law gives more for less, at the cost of a harder proof.

**7.** State the Central Limit Theorem precisely, and explain what makes it remarkable.

> [!example]- Show answer
> CLT: if $X_1, \ldots, X_n$ are iid with mean $\mu$ and finite variance $\sigma^2$, then $\sqrt{n}(\bar X_n - \mu)/\sigma \rightsquigarrow N(0,1)$, equivalently $\bar X_n \approx N(\mu, \sigma^2/n)$ for large $n$. The remarkable feature is *universality*: the limiting distribution is Gaussian regardless of the shape of the population distribution of the $X_i$ — it can be skewed, heavy in one tail, bounded, or discrete — provided only that the variance is finite. This explains why the normal distribution appears so pervasively in statistics: many quantities are effectively averages, and averages are asymptotically normal.

**8.** State Slutsky's theorem and give the standard caveat about why you cannot generally add two sequences that each converge in distribution.

> [!example]- Show answer
> Slutsky's theorem: if $X_n \rightsquigarrow X$ and $Y_n \xrightarrow{P} c$ for a constant $c$, then $X_n + Y_n \rightsquigarrow X + c$ and $X_n Y_n \rightsquigarrow cX$. The essential requirement is that $Y_n$ converge to a *constant*, not merely in distribution. In general, $X_n \rightsquigarrow X$ and $Y_n \rightsquigarrow Y$ do **not** imply $X_n + Y_n \rightsquigarrow X + Y$, because convergence in distribution carries no information about the *joint* law of the two sequences — they could be dependent in arbitrary ways. The constant-limit condition sidesteps this by pinning $Y_n$ down to a fixed value.

**9.** State the (univariate) delta method and explain where the factor $g'(\mu)^2$ comes from.

> [!example]- Show answer
> Delta method: if $\sqrt{n}(\bar X_n - \mu) \rightsquigarrow N(0, \sigma^2)$ and $g$ is differentiable at $\mu$ with $g'(\mu) \neq 0$, then $\sqrt{n}(g(\bar X_n) - g(\mu)) \rightsquigarrow N(0, g'(\mu)^2 \sigma^2)$. The factor $g'(\mu)^2$ comes from a first-order Taylor expansion: $g(\bar X_n) \approx g(\mu) + g'(\mu)(\bar X_n - \mu)$, so to leading order $g(\bar X_n) - g(\mu)$ is the linear quantity $g'(\mu)(\bar X_n - \mu)$. Scaling a normal random variable by the constant $g'(\mu)$ multiplies its variance by $g'(\mu)^2$. The multivariate version replaces $g'(\mu)$ by the gradient and the variance by $\nabla g(\mu)^{\mathsf T}\Sigma\,\nabla g(\mu)$.

**10.** *(Applied)* You observe iid data with sample mean $\bar X_n = 5.0$ and sample standard deviation $\hat\sigma = 2.0$, with $n = 100$. Construct an approximate 95% confidence interval for $\mu$, and explain which theorems each step relies on.

> [!example]- Show answer
> The CLT gives $\bar X_n \approx N(\mu, \sigma^2/n)$, so the standardized statistic $\sqrt{n}(\bar X_n - \mu)/\sigma \rightsquigarrow N(0,1)$. Since $\sigma$ is unknown, replace it by the consistent estimator $\hat\sigma \xrightarrow{P} \sigma$; Slutsky's theorem ensures $\sqrt{n}(\bar X_n - \mu)/\hat\sigma \rightsquigarrow N(0,1)$ still holds. The estimated standard error is $\widehat{\text{se}} = \hat\sigma/\sqrt{n} = 2.0/10 = 0.2$, and with $z_{0.025} \approx 1.96$ the interval is $5.0 \pm 1.96(0.2) = 5.0 \pm 0.392 \approx (4.61, 5.39)$. So: CLT supplies asymptotic normality, Slutsky justifies plugging in $\hat\sigma$, and the interval is the standard $\bar X_n \pm z_{\alpha/2}\,\widehat{\text{se}}$ recipe.

## Deeper understanding (expansion)

> [!info]+ 💡 Why "in distribution" is so much weaker than it looks
>
> Convergence in distribution is the only mode that can hold between random variables defined on *entirely different probability spaces* — because it never compares $X_n$ and $X$ as numbers, only their CDFs. A vivid illustration: let $X \sim N(0,1)$ and define $X_n = -X$ for every $n$. By symmetry $-X \sim N(0,1)$ too, so $X_n \rightsquigarrow N(0,1)$, i.e. $X_n \rightsquigarrow X$ in distribution. But $|X_n - X| = 2|X|$, which does *not* go to zero — $X_n$ never gets close to $X$. So convergence in distribution genuinely tells you nothing about closeness. This is exactly why Slutsky's theorem needs a *constant* limit: to combine sequences you need at least one of them anchored to a fixed value, since distributional limits alone don't constrain joint behavior.

> [!info]+ 💡 The CLT, the delta method, and the bootstrap as one toolkit
>
> The later inference chapters lean on a single asymptotic pipeline. The CLT produces a normal limit for the sample mean; the delta method propagates that limit through any smooth function $g$, so you get standard errors for nonlinear quantities (log-odds, ratios, correlations) almost for free. Slutsky lets you swap the true variance for an estimate without changing the limit. The catch is that the delta-method variance $g'(\mu)^2\sigma^2$ depends on the unknown $\mu$ and $\sigma$, and the normal approximation can be poor for small $n$ or strongly nonlinear $g$. The bootstrap (Chapter 8) is the computational alternative: instead of analytically computing $g'(\mu)^2\sigma^2$, it resamples the data to *estimate* the sampling distribution of $g(\bar X_n)$ directly. The delta method and the bootstrap are two routes to the same destination — analytic versus simulation-based standard errors.

> [!info]+ 💡 Consistency, asymptotic normality, and the shape of later theory
>
> Two abstract properties organize most of the estimation theory ahead. *Consistency* is convergence in probability of an estimator to the true parameter, $\hat\theta_n \xrightarrow{P} \theta$ — it is the minimal "the estimator is not systematically wrong as data accumulate" guarantee, and the LLN is its prototype. *Asymptotic normality* is the stronger statement that $\sqrt{n}(\hat\theta_n - \theta) \rightsquigarrow N(0, v)$ for some asymptotic variance $v$ — it is what makes confidence intervals and tests possible, and the CLT is its prototype. When you read later that the maximum likelihood estimator is "consistent and asymptotically normal", you are reading a direct generalization of the LLN and CLT of this chapter, with the asymptotic variance tied to the Fisher information. Convergence theory is thus the grammar in which all the inferential claims are written.

## Connections

- [[03-expectation]] — the moments that drive convergence: $\mathbb{E}[\bar X_n] = \mu$ and $\mathbb{V}(\bar X_n) = \sigma^2/n$ are computed with the expectation and variance rules from Chapter 3. ← Convergence builds directly on those moment calculations.
- [[04-inequalities]] — the *tools* of the proofs: Markov's and Chebyshev's inequalities give the one-line proof of the Weak Law, bounding deviation probabilities by variances. ← This chapter consumes those inequalities to establish the LLN.
- [[06-models-inference-and-learning]] — → the next chapter frames *what* we are estimating; consistency (convergence in probability) and asymptotic normality (the CLT) are the yardsticks by which estimators in that framework are judged.
- [[07-estimating-cdf-and-functionals]] — → the empirical CDF and plug-in functionals are shown consistent and asymptotically normal using exactly the convergence machinery and the delta method developed here.
- [[08-the-bootstrap]] — → the bootstrap is the simulation-based sibling of the delta method, estimating the sampling distribution by resampling instead of by the CLT-plus-delta-method analytics.
- [[09-parametric-inference]] — → maximum likelihood estimators are "consistent and asymptotically normal", a direct generalization of the LLN and CLT, with asymptotic variance given by the Fisher information.
