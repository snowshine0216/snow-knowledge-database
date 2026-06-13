---
tags: [parametric-inference, maximum-likelihood, method-of-moments, fisher-information, delta-method, equivariance, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 9 — Parametric Inference

> [!abstract]+ Chapter at a glance
>
> Chapter 9 leaves behind the distribution-free world of Chapters 7–8 and assumes the data come from a **parametric model** $\{f(x;\theta):\theta\in\Theta\}$ indexed by a finite-dimensional parameter $\theta$. The problem of inference collapses to estimating $\theta$ (or a function $g(\theta)$) from $X_1,\dots,X_n$. Two recipes dominate: the **method of moments**, a quick consistent estimator obtained by matching sample and population moments, and **maximum likelihood**, the chapter's centerpiece. The big payoff is the asymptotic theory of the MLE: under regularity conditions it is consistent, **equivariant**, asymptotically normal, and asymptotically efficient — its variance shrinks to the inverse **Fisher information**, the smallest possible (Cramér–Rao). That single normal approximation, $\hat\theta \approx N(\theta, 1/I_n(\theta))$, is the engine for the confidence intervals and the Wald tests of Chapter 10, while **equivariance** plus the **delta method** extend everything to transformed parameters $g(\hat\theta)$.

## Core concepts

**Parametric models.** A parametric model is a set of densities $\mathfrak{F}=\{f(x;\theta):\theta\in\Theta\}$ where the parameter space $\Theta\subseteq\mathbb{R}^k$ is finite-dimensional. Inference reduces to estimating $\theta$. We often care only about a scalar function $T(\theta)=g(\theta)$ (a *parameter of interest*), treating the rest as **nuisance parameters**. Example: for $X_1,\dots,X_n\sim N(\mu,\sigma^2)$ with $\theta=(\mu,\sigma)$, we might want only $\tau=g(\theta)=\mu/\sigma$.

**Method of moments (MOM).** Equate the first $k$ sample moments to the first $k$ population moments and solve for $\theta$. Let $\alpha_j(\theta)=\mathbb{E}_\theta[X^j]$ and $\hat\alpha_j=\frac1n\sum_i X_i^j$. The MOM estimator $\hat\theta_n$ solves the system
$$
\alpha_1(\theta)=\hat\alpha_1,\quad \alpha_2(\theta)=\hat\alpha_2,\quad\dots,\quad \alpha_k(\theta)=\hat\alpha_k .
$$
It is usually easy to compute, **consistent**, and asymptotically normal — but typically *not* efficient. Example: for $\text{Bernoulli}(p)$, $\alpha_1=p$, so $\hat p=\bar X_n$. For $N(\mu,\sigma^2)$, matching the first two moments gives $\hat\mu=\bar X_n$ and $\hat\sigma^2=\frac1n\sum_i(X_i-\bar X_n)^2$.

**The likelihood and the MLE.** Given iid data the **likelihood function** is
$$
L_n(\theta)=\prod_{i=1}^n f(X_i;\theta),\qquad \ell_n(\theta)=\log L_n(\theta)=\sum_{i=1}^n \log f(X_i;\theta).
$$
$L_n$ is *not* a density in $\theta$ and need not integrate to one; only its *shape* matters. The **maximum likelihood estimator (MLE)** is
$$
\hat\theta_n=\arg\max_{\theta\in\Theta}\ell_n(\theta).
$$
Worked intuition: for $\text{Bernoulli}(p)$, $\ell_n(p)=S\log p+(n-S)\log(1-p)$ with $S=\sum X_i$; setting $\ell_n'(p)=0$ gives $\hat p=\bar X_n$. For $N(\mu,\sigma^2)$ the MLE is $\hat\mu=\bar X_n$ and $\hat\sigma^2=\frac1n\sum_i(X_i-\bar X_n)^2$ (note the divisor $n$, not $n-1$).

**Properties of the MLE.** Under regularity conditions the MLE enjoys four headline properties:
- **Consistency:** $\hat\theta_n \xrightarrow{P}\theta_\star$ (the true value).
- **Equivariance:** if $\hat\theta$ is the MLE of $\theta$, then $g(\hat\theta)$ is the MLE of $g(\theta)$ for any function $g$. (E.g. the MLE of $\sigma=\sqrt{\sigma^2}$ is $\sqrt{\hat\sigma^2}$.)
- **Asymptotic normality:** $\hat\theta_n\approx N\!\big(\theta_\star,\,1/I_n(\theta_\star)\big)$.
- **Asymptotic efficiency / optimality:** among well-behaved estimators the MLE has the *smallest* asymptotic variance, attaining the **Cramér–Rao lower bound**.

**Score function and Fisher information.** The **score** is the derivative of the log-density:
$$
s(X;\theta)=\frac{\partial \log f(X;\theta)}{\partial\theta}.
$$
A key identity is that the score has **mean zero at the truth**: $\mathbb{E}_\theta[s(X;\theta)]=0$. The **Fisher information** is the variance of the score,
$$
I(\theta)=\mathbb{V}_\theta\big[s(X;\theta)\big]=\mathbb{E}_\theta\!\Big[s(X;\theta)^2\Big]= -\,\mathbb{E}_\theta\!\left[\frac{\partial^2 \log f(X;\theta)}{\partial\theta^2}\right],
$$
and for $n$ iid observations it adds up: $I_n(\theta)=n\,I(\theta)$. Larger information means a sharper likelihood and a more precise estimator.

**Asymptotic standard error.** The normal approximation gives the estimated **standard error**
$$
\widehat{\text{se}}=\frac{1}{\sqrt{I_n(\hat\theta_n)}},
$$
and the approximate Normal-based confidence interval $\hat\theta_n\pm z_{\alpha/2}\,\widehat{\text{se}}$. This is exactly the machinery the next chapter turns into the Wald test.

**Observed vs expected information.** $I_n(\theta)=n I(\theta)$ is the **expected (Fisher) information**, an expectation taken under the model. The **observed information** $-\ell_n''(\hat\theta_n)$ uses the *actual* second derivative of the log-likelihood at the MLE. Both are valid; the observed information is often more convenient (no expectation to evaluate) and can perform better in finite samples.

**The delta method.** For a smooth scalar function $g$ with $g'(\theta)\neq0$, the transformed MLE $\tau=g(\hat\theta)$ is also asymptotically normal, and its standard error is
$$
\widehat{\text{se}}\big(g(\hat\theta)\big)=\big|g'(\hat\theta)\big|\,\widehat{\text{se}}(\hat\theta).
$$
Combined with equivariance this lets us report $g(\hat\theta)\pm z_{\alpha/2}\,\widehat{\text{se}}(g(\hat\theta))$ without re-deriving anything.

**Multiparameter models.** When $\theta=(\theta_1,\dots,\theta_k)$ is a vector, the Fisher information becomes a $k\times k$ **information matrix** $I_n(\theta)$ with entries built from second partials of $\ell_n$. The MLE is asymptotically multivariate normal with covariance
$$
\widehat{\mathbb{V}}(\hat\theta)\approx J_n=I_n(\hat\theta)^{-1},
$$
the inverse Fisher information. For a scalar function $g(\theta)$, the multiparameter delta method gives $\widehat{\text{se}}(g(\hat\theta))=\sqrt{\hat\nabla g^{\top} J_n \hat\nabla g}$, where $\hat\nabla g$ is the gradient evaluated at $\hat\theta$.

**Parametric bootstrap.** Instead of the delta method one can estimate the standard error by simulation: draw many samples of size $n$ from $f(x;\hat\theta_n)$, recompute the estimator on each, and take the sample standard deviation of the replicates. This is the **parametric bootstrap** — it samples from the *fitted model* rather than from the empirical distribution (the nonparametric bootstrap of Chapter 8).

**Sufficiency (briefly).** A statistic $T(X^n)$ is **sufficient** if the conditional distribution of the data given $T$ does not depend on $\theta$ — $T$ captures all the information about $\theta$. By the factorization theorem, $T$ is sufficient iff $f(x^n;\theta)=h(x^n)\,g(T(x^n);\theta)$. The MLE is always a function of any sufficient statistic.

## Quiz

**1.** What distinguishes a *parametric* model from a nonparametric one, and what does inference reduce to in the parametric case?

> [!example]- Show answer
> A parametric model is a family of densities $\{f(x;\theta):\theta\in\Theta\}$ indexed by a **finite-dimensional** parameter $\theta\in\Theta\subseteq\mathbb{R}^k$. Nonparametric models allow infinite-dimensional unknowns (e.g. an arbitrary CDF or density). Because the whole family is pinned down once $\theta$ is known, inference collapses to **estimating the finite-dimensional $\theta$** (or a function $g(\theta)$) from the data. We may distinguish a parameter of interest from nuisance parameters when only part of $\theta$ matters.

**2.** Describe the method of moments and write the estimating equations. What are its strengths and weaknesses?

> [!example]- Show answer
> Match the first $k$ population moments $\alpha_j(\theta)=\mathbb{E}_\theta[X^j]$ to the sample moments $\hat\alpha_j=\frac1n\sum_i X_i^j$ and solve the system $\alpha_j(\theta)=\hat\alpha_j$, $j=1,\dots,k$, for the $k$-dimensional $\theta$. Strengths: it is usually **easy to compute** in closed form, and it is consistent and asymptotically normal. Weakness: it is typically **not efficient** — its asymptotic variance is larger than the MLE's — and it can occasionally fall outside the parameter space.

**3.** Write the likelihood and log-likelihood for iid data. Why is the likelihood not a probability density in $\theta$?

> [!example]- Show answer
> For iid $X_1,\dots,X_n$, the likelihood is $L_n(\theta)=\prod_{i=1}^n f(X_i;\theta)$ and the log-likelihood is $\ell_n(\theta)=\sum_{i=1}^n\log f(X_i;\theta)$. It is viewed as a function of $\theta$ with the data held fixed. It is **not a density in $\theta$**: it need not integrate (or sum) to one over $\Theta$, and indeed $\int L_n(\theta)\,d\theta$ has no probabilistic meaning. Only the *shape* of $L_n$ matters — multiplying it by a constant that does not depend on $\theta$ leaves the MLE unchanged.

**4.** Derive (or sketch) the MLE for $\text{Bernoulli}(p)$ and state the MLE for the Normal mean and variance.

> [!example]- Show answer
> With $S=\sum_i X_i$, $\ell_n(p)=S\log p+(n-S)\log(1-p)$. Setting $\ell_n'(p)=\frac{S}{p}-\frac{n-S}{1-p}=0$ yields $\hat p=S/n=\bar X_n$. For $N(\mu,\sigma^2)$ the MLEs are $\hat\mu=\bar X_n$ and $\hat\sigma^2=\frac1n\sum_i(X_i-\bar X_n)^2$. Note the divisor is $n$, not $n-1$, so the MLE of $\sigma^2$ is slightly biased — though consistent and asymptotically optimal.

**5.** State the equivariance property of the MLE and give a concrete example of why it is useful.

> [!example]- Show answer
> **Equivariance:** if $\hat\theta$ is the MLE of $\theta$, then for any function $g$, $g(\hat\theta)$ is the MLE of $\psi=g(\theta)$. We never need to re-maximize for a transformed parameter — just plug the MLE through $g$. Example: having found the Normal MLE $\hat\sigma^2$, the MLE of the standard deviation $\sigma=\sqrt{\sigma^2}$ is simply $\sqrt{\hat\sigma^2}$, and the MLE of $\log\sigma$ is $\log\sqrt{\hat\sigma^2}$. This pairs with the delta method to deliver standard errors for the transformed quantity.

**6.** Define the score function and state two equivalent formulas for the Fisher information. What is the relation $I_n(\theta)$ vs $I(\theta)$?

> [!example]- Show answer
> The score is $s(X;\theta)=\partial\log f(X;\theta)/\partial\theta$, and crucially $\mathbb{E}_\theta[s(X;\theta)]=0$ at the true $\theta$. The Fisher information is the variance of the score: $I(\theta)=\mathbb{V}_\theta[s(X;\theta)]=\mathbb{E}_\theta[s^2]$, which under regularity equals $-\mathbb{E}_\theta\!\left[\partial^2\log f/\partial\theta^2\right]$. For $n$ iid observations the information adds: $I_n(\theta)=n\,I(\theta)$. Information measures how sharply the likelihood identifies $\theta$ — more curvature means more information.

**7.** State the asymptotic normality result for the MLE and use it to write the standard error and an approximate confidence interval.

> [!example]- Show answer
> Under regularity conditions, $\hat\theta_n\approx N\big(\theta_\star,\,1/I_n(\theta_\star)\big)$, equivalently $\sqrt{n}(\hat\theta_n-\theta_\star)\xrightarrow{d} N(0,1/I(\theta_\star))$. Plugging in the MLE gives the estimated standard error $\widehat{\text{se}}=1/\sqrt{I_n(\hat\theta_n)}$. An approximate $1-\alpha$ confidence interval is $\hat\theta_n\pm z_{\alpha/2}\,\widehat{\text{se}}$. This Normal approximation is exactly what powers the Wald confidence intervals and tests in the next chapter.

**8.** What is the difference between observed and expected (Fisher) information, and why might you prefer the observed information?

> [!example]- Show answer
> **Expected information** is $I_n(\theta)=n I(\theta)=-n\,\mathbb{E}_\theta[\partial^2\log f/\partial\theta^2]$, an expectation under the model. **Observed information** is $-\ell_n''(\hat\theta_n)$, the actual negative curvature of the log-likelihood at the MLE — no expectation required. The observed information is often easier to compute (you already differentiated $\ell_n$ to find the MLE) and tends to give better finite-sample coverage. Both are consistent estimates of $I_n(\theta_\star)$, so either yields a valid standard error.

**9.** Explain the delta method and use it to compute the standard error of $g(\hat\theta)$ for a smooth scalar $g$.

> [!example]- Show answer
> The delta method propagates asymptotic normality through a smooth function: if $\hat\theta\approx N(\theta,\,\widehat{\text{se}}^2)$ and $g$ is differentiable with $g'(\theta)\neq0$, then $g(\hat\theta)\approx N\big(g(\theta),\,[g'(\theta)]^2\widehat{\text{se}}^2\big)$. Hence $\widehat{\text{se}}(g(\hat\theta))=|g'(\hat\theta)|\,\widehat{\text{se}}(\hat\theta)$. Combined with equivariance, the point estimate $g(\hat\theta)$ and its standard error give an approximate CI $g(\hat\theta)\pm z_{\alpha/2}\,\widehat{\text{se}}(g(\hat\theta))$ without re-deriving the asymptotics. In the multiparameter case it generalizes to $\widehat{\text{se}}=\sqrt{\hat\nabla g^{\top} I_n(\hat\theta)^{-1}\hat\nabla g}$.

**10.** *(Applied)* You observe $X_1,\dots,X_n\sim\text{Bernoulli}(p)$ and want to estimate the log-odds $\psi=\log\frac{p}{1-p}$. Give the MLE of $\psi$ and an approximate 95% confidence interval, using equivariance and the delta method. Then describe how the parametric bootstrap would give the same standard error without calculus.

> [!example]- Show answer
> The MLE is $\hat p=\bar X_n$, with $I_n(p)=n/[p(1-p)]$, so $\widehat{\text{se}}(\hat p)=\sqrt{\hat p(1-\hat p)/n}$. By **equivariance**, the MLE of $\psi=g(p)=\log\frac{p}{1-p}$ is $\hat\psi=\log\frac{\hat p}{1-\hat p}$. Since $g'(p)=\frac{1}{p(1-p)}$, the **delta method** gives $\widehat{\text{se}}(\hat\psi)=\frac{1}{\hat p(1-\hat p)}\sqrt{\hat p(1-\hat p)/n}=\frac{1}{\sqrt{n\,\hat p(1-\hat p)}}$. A 95% CI is $\hat\psi\pm1.96\,\widehat{\text{se}}(\hat\psi)$. **Parametric bootstrap:** draw $B$ samples of size $n$ from $\text{Bernoulli}(\hat p)$, recompute $\hat\psi^{*}=\log\frac{\bar X^{*}}{1-\bar X^{*}}$ on each, and take the standard deviation of the $B$ replicates as $\widehat{\text{se}}(\hat\psi)$ — no derivatives needed.

## Deeper understanding (expansion)

> [!info]+ 💡 Why the MLE is asymptotically optimal — the Cramér–Rao floor
>
> The Cramér–Rao inequality says that for any *unbiased* estimator $\tilde\theta$, $\mathbb{V}(\tilde\theta)\geq 1/I_n(\theta)$. The remarkable fact about the MLE is that, *asymptotically*, it **attains** this floor: its limiting variance is exactly $1/I_n(\theta)$. No other regular estimator can do better in large samples, which is what "asymptotically efficient" means. Intuitively, the score $s(X;\theta)$ has mean zero and variance $I(\theta)$; the MLE solves $\sum_i s(X_i;\hat\theta)=0$, and a one-term Taylor expansion of this estimating equation around the truth shows $\sqrt{n}(\hat\theta-\theta)\approx \frac{1}{I(\theta)}\cdot\frac{1}{\sqrt n}\sum_i s(X_i;\theta)$, a sample average of mean-zero terms — so the CLT delivers $N(0,1/I(\theta))$. The information sits in the denominator: a sharply curved log-likelihood (large $I$) pins down $\theta$ tightly.

> [!info]+ 💡 Equivariance + delta method = a transformation toolkit
>
> These two properties form a tidy division of labor. **Equivariance** answers "what is the point estimate of $g(\theta)$?" — just push $\hat\theta$ through $g$, no re-maximization. The **delta method** answers "how uncertain is it?" — scale the standard error by $|g'(\hat\theta)|$. Together they let you move freely between parameterizations: estimate $p$, then report the odds, the log-odds, the relative risk, or any smooth transform, each with a valid interval. A caveat: the delta-method Normal approximation lives in the original scale, so for bounded parameters it is often more accurate to build the interval on a transformed (unbounded) scale — e.g. construct a symmetric interval for $\log\sigma$ or for the log-odds, then exponentiate back. The parametric bootstrap is the assumption-light alternative when $g'$ is awkward or the linearization is poor.

> [!info]+ 💡 Method of moments vs maximum likelihood — speed vs efficiency
>
> Why keep the method of moments around when the MLE is optimal? Three reasons. First, MOM estimates are usually available in **closed form**, while the MLE may require numerical optimization. Second, a MOM estimate makes an excellent **starting value** for a Newton–Raphson iteration toward the MLE. Third, MOM needs only that moments exist and is robust to mild model misspecification of higher-order structure. The cost is **efficiency**: MOM generally has a larger asymptotic variance, so for the same precision you need more data. In well-specified parametric problems the MLE is the gold standard; MOM is the fast, dependable scaffolding around it.

## Connections

- [[03-expectation]] — population moments $\alpha_j(\theta)=\mathbb{E}_\theta[X^j]$ are expectations; the method of moments is built directly on them, and the score identity $\mathbb{E}_\theta[s]=0$ is an expectation result. ← expectation supplies the moments this chapter matches.
- [[05-convergence-of-random-variables]] — consistency ($\xrightarrow{P}$) and asymptotic normality ($\xrightarrow{d}$) of the MLE are applications of the LLN, CLT, and the delta method developed earlier. ← convergence tools justify every "$\approx N$" statement here.
- [[06-models-inference-and-learning]] — Chapter 6 set up estimators, bias, standard error, and the parametric-vs-nonparametric split; this chapter specializes that framework to parametric estimation. ← the general estimation vocabulary; → this chapter is its parametric instantiation.
- [[08-the-bootstrap]] — the parametric bootstrap here samples from the *fitted* model $f(x;\hat\theta)$, the parametric cousin of Chapter 8's nonparametric resampling from the empirical CDF. → an alternative to the delta method for standard errors.
- [[10-hypothesis-testing-and-p-values]] — the MLE's asymptotic normality and Fisher-information standard error are the direct inputs to the **Wald test** and Normal-based confidence intervals. → this chapter's $N(\theta,1/I_n)$ result is the engine of the next.
- [[12-statistical-decision-theory]] — efficiency and the Cramér–Rao bound connect to risk, admissibility, and optimality; the MLE's minimum asymptotic variance is a decision-theoretic optimality statement. → information and efficiency reappear as risk bounds.
