---
tags: [bayesian-inference, prior, posterior, credible-interval, conjugate-prior, jeffreys-prior, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 11 — Bayesian Inference

> [!abstract]+ Chapter at a glance
>
> Chapter 11 introduces the *other* major paradigm of statistical inference. Where the frequentist treats the parameter $\theta$ as a fixed-but-unknown constant and lets the data be random, the Bayesian flips the picture: probability encodes **degree of belief**, and $\theta$ is treated as a **random variable** with its own distribution. The whole machinery is one equation — Bayes' theorem — combining a **prior** $f(\theta)$ (what you believe before seeing data) with the **likelihood** $\mathcal{L}(\theta)$ (what the data say) to produce the **posterior** $f(\theta\mid \text{data})$ (what you believe after). Everything else — point estimates, credible intervals, prediction — is read off the posterior. Wasserman presents this even-handedly: Bayesian and frequentist methods answer *different questions* and carry *different guarantees*, and the two agree in large samples (Bernstein–von Mises) but can diverge sharply in small samples where the prior matters. The chapter stresses the conceptual gap between **credible** and **confidence** intervals, the convenience and danger of various priors, and how simulation summarizes posteriors with no closed form — setting up MCMC in Chapter 24.

## Core concepts

**The Bayesian philosophy.** Probability is interpreted as a *degree of belief*, not a long-run frequency. Consequently the unknown parameter $\theta$ is itself a random variable: before seeing data we describe our uncertainty about $\theta$ with a prior distribution $f(\theta)$. This is the fundamental break from the frequentist view of Chapters 6–10, where $\theta$ is a fixed constant and only the data $X_1,\dots,X_n$ are random.

**The three ingredients and Bayes' theorem.** Bayesian inference is mechanical once three objects are specified:

- **Prior** $f(\theta)$ — belief about $\theta$ before data.
- **Likelihood** $\mathcal{L}(\theta) = f(\text{data}\mid\theta) = \prod_{i=1}^n f(x_i\mid\theta)$ — the model evaluated at the observed data, viewed as a function of $\theta$.
- **Posterior** $f(\theta\mid\text{data})$ — belief about $\theta$ after data.

They combine by Bayes' theorem:
$$
f(\theta\mid x_1,\dots,x_n) = \frac{\mathcal{L}(\theta)\, f(\theta)}{\int \mathcal{L}(\theta)\, f(\theta)\, d\theta} \;\propto\; \mathcal{L}(\theta)\, f(\theta).
$$
The denominator $c = \int \mathcal{L}(\theta) f(\theta)\, d\theta$ is the **normalizing constant**, also called the **marginal likelihood** or **evidence**. It does not depend on $\theta$, so for inference about $\theta$ we usually work with the unnormalized form *posterior $\propto$ likelihood $\times$ prior* and recover $c$ only if needed.

**Bayesian point estimation.** A single summary of the posterior. Common choices:

- **Posterior mean** $\bar\theta = \mathbb{E}[\theta\mid\text{data}] = \int \theta\, f(\theta\mid\text{data})\, d\theta$.
- **Posterior median** — the 0.5 quantile of the posterior.
- **Posterior mode / MAP** (maximum a posteriori) — $\arg\max_\theta f(\theta\mid\text{data})$. With a flat prior the MAP coincides with the MLE.

**Bayesian interval estimation: credible intervals.** Find $a,b$ with $\int_a^b f(\theta\mid\text{data})\, d\theta = 1-\alpha$. Then $C=(a,b)$ is a $1-\alpha$ **posterior (credible) interval**, and the Bayesian may legitimately say
$$
P(\theta \in C \mid \text{data}) = 1-\alpha.
$$
This is a probability statement *about $\theta$*, conditional on the observed data. A frequentist confidence interval makes no such statement: there $\theta$ is fixed, the *interval* is random, and $1-\alpha$ is the long-run coverage over repeated samples. The interpretations genuinely differ.

**Conjugate priors.** A prior is **conjugate** to a likelihood if the posterior belongs to the same family as the prior. Conjugacy makes the update a closed-form parameter change instead of an integral. Canonical pairs:

- **Beta–Bernoulli/Binomial.** Prior $p \sim \text{Beta}(\alpha,\beta)$, data $\sum x_i = s$ successes in $n$ trials $\Rightarrow$ posterior $p\mid\text{data}\sim \text{Beta}(\alpha+s,\ \beta+n-s)$. The posterior mean $\frac{\alpha+s}{\alpha+\beta+n}$ is a weighted average of the prior mean and the sample proportion.
- **Normal–Normal (for the mean).** Data $X_i\sim N(\theta,\sigma^2)$ with $\sigma^2$ known and prior $\theta\sim N(a,b^2)$ $\Rightarrow$ posterior is again Normal, with mean a precision-weighted average of the prior mean $a$ and the sample mean $\bar X$.
- **Gamma–Poisson.** Prior $\lambda\sim\text{Gamma}(\alpha,\beta)$, Poisson counts $\Rightarrow$ posterior $\lambda\mid\text{data}\sim\text{Gamma}\!\big(\alpha+\sum x_i,\ \beta+n\big)$.

**Flat, improper, and noninformative priors.** To "let the data speak," one may use a flat prior $f(\theta)\propto 1$. If $\theta$ ranges over an unbounded set this prior does not integrate to one — it is **improper**. An improper prior can still yield a *proper* posterior, but not always; if $\int \mathcal{L}(\theta)\, d\theta = \infty$ the posterior is undefined and inference is nonsense. A subtler danger is **non-invariance**: a flat prior on $\theta$ is *not* flat on a nonlinear reparameterization $\psi = g(\theta)$, so "noninformative" is not a coordinate-free notion.

**The Jeffreys prior.** A principled noninformative prior defined via the Fisher information $I(\theta)$:
$$
f(\theta) \;\propto\; \sqrt{I(\theta)}.
$$
Its key property is **transformation invariance**: applying Jeffreys' rule in any parameterization gives mutually consistent priors, fixing the non-invariance defect of the flat prior. For a Binomial proportion the Jeffreys prior is $\text{Beta}(1/2,1/2)$.

**Large-sample agreement (Bernstein–von Mises).** As $n\to\infty$ the prior is overwhelmed by the likelihood and washes out. The posterior becomes approximately Normal, centered at the MLE $\hat\theta$ with spread given by the estimated standard error:
$$
\theta \mid \text{data} \;\approx\; N\!\big(\hat\theta,\ \widehat{\operatorname{se}}^{\,2}\big).
$$
Consequently a $1-\alpha$ credible interval and the corresponding Wald confidence interval nearly coincide in large samples — Bayesian and frequentist answers converge numerically even though their interpretations remain distinct.

**Simulation to summarize the posterior.** When the posterior has no closed form, draw $\theta^{(1)},\dots,\theta^{(B)} \sim f(\theta\mid\text{data})$ and approximate any quantity by its Monte Carlo average: the posterior mean by $\frac1B\sum \theta^{(b)}$, credible intervals by sample quantiles, and the posterior of a function $\tau=g(\theta)$ by $\{g(\theta^{(b)})\}$. This is exactly the strategy Chapter 24 (MCMC) industrializes.

**Multiparameter models and marginalization.** With $\theta=(\theta_1,\dots,\theta_k)$ the posterior is joint, $f(\theta\mid\text{data})$. Inference about one component requires **marginalizing** out the rest, $f(\theta_1\mid\text{data}) = \int f(\theta\mid\text{data})\, d\theta_2\cdots d\theta_k$. Marginalization is automatic and natural with posterior samples — just look at the coordinate of interest — which is a genuine practical advantage of the simulation approach over analytic integration.

**Wasserman's critique.** The book refuses to crown a winner. Frequentist methods give guarantees that hold *for every fixed $\theta$* over repeated sampling (coverage, error rates); Bayesian methods give coherent probability statements *conditional on the data and the prior*. They answer different questions. The choice depends on whether you want long-run frequency guarantees or a probabilistic description of belief — and on whether you can defend your prior.

## Quiz

**1.** In one sentence, what is the single most important philosophical difference between the Bayesian and frequentist treatments of a parameter $\theta$?

> [!example]- Show answer
> In the frequentist framework $\theta$ is a fixed, unknown constant and only the data are random, whereas in the Bayesian framework $\theta$ is treated as a random variable with a probability distribution describing one's degree of belief. This single move — putting a distribution on $\theta$ — is what makes a prior, a posterior, and direct probability statements about $\theta$ meaningful. Everything else in the chapter follows from it.

**2.** Write Bayes' theorem for the posterior and name each of the three components plus the normalizing constant.

> [!example]- Show answer
> $f(\theta\mid\text{data}) = \dfrac{\mathcal{L}(\theta)\,f(\theta)}{\int \mathcal{L}(\theta)\,f(\theta)\,d\theta} \propto \mathcal{L}(\theta)\,f(\theta)$. Here $f(\theta)$ is the **prior** (belief before data), $\mathcal{L}(\theta)=f(\text{data}\mid\theta)$ is the **likelihood** (the model at the observed data as a function of $\theta$), and $f(\theta\mid\text{data})$ is the **posterior** (belief after data). The denominator $\int \mathcal{L}(\theta)f(\theta)\,d\theta$ is the **normalizing constant** (marginal likelihood / evidence); it is free of $\theta$, which is why the proportionality form suffices for inference about $\theta$.

**3.** Why can we usually ignore the normalizing constant during inference, and when do we actually need it?

> [!example]- Show answer
> The normalizing constant $c=\int\mathcal{L}(\theta)f(\theta)\,d\theta$ does not depend on $\theta$, so it only rescales the posterior to integrate to one; the *shape* of the posterior — and hence the mode, relative probabilities, and conjugate-update structure — is captured by the unnormalized product $\mathcal{L}(\theta)f(\theta)$. We need $c$ explicitly when we want a properly normalized density, a posterior mean by direct integration, or model comparison via the marginal likelihood (Bayes factors). Simulation methods are popular precisely because they sample from the posterior without ever computing $c$.

**4.** List the three standard Bayesian point estimates and state when the posterior mode equals the MLE.

> [!example]- Show answer
> The **posterior mean** $\mathbb{E}[\theta\mid\text{data}]$, the **posterior median** (0.5 quantile), and the **posterior mode / MAP** ($\arg\max f(\theta\mid\text{data})$). The MAP coincides with the maximum likelihood estimate when the prior is flat (constant in $\theta$), because then maximizing $\mathcal{L}(\theta)f(\theta)$ is the same as maximizing $\mathcal{L}(\theta)$. For symmetric, unimodal posteriors (e.g. Normal) the mean, median, and mode all agree.

**5.** Define a $1-\alpha$ credible interval and contrast its interpretation with a frequentist confidence interval.

> [!example]- Show answer
> A $1-\alpha$ credible interval is a region $C=(a,b)$ with posterior probability $\int_a^b f(\theta\mid\text{data})\,d\theta = 1-\alpha$, licensing the statement $P(\theta\in C\mid\text{data})=1-\alpha$ — a probability about $\theta$ given the data. A frequentist confidence interval cannot say this: there $\theta$ is fixed and the *interval* is the random object, so $1-\alpha$ is the long-run fraction of such intervals (over repeated samples) that trap the true $\theta$, not the probability that this particular interval contains it. Same numbers can carry completely different meanings.

**6.** What is a conjugate prior, and why is conjugacy convenient? Give the Beta–Binomial update.

> [!example]- Show answer
> A prior is conjugate to a likelihood when the resulting posterior lies in the same parametric family as the prior, turning the Bayes update into a simple change of parameters rather than an integral. For a Binomial likelihood with $s$ successes in $n$ trials and a $\text{Beta}(\alpha,\beta)$ prior on $p$, the posterior is $\text{Beta}(\alpha+s,\ \beta+n-s)$. The convenience is closed-form everything — the posterior mean $\frac{\alpha+s}{\alpha+\beta+n}$, credible intervals, and predictions are immediate, and the prior parameters read naturally as "pseudo-counts."

**7.** What is an improper prior, and what are the two principal dangers of flat / noninformative priors?

> [!example]- Show answer
> An improper prior is one that does not integrate to a finite value (e.g. $f(\theta)\propto 1$ on the whole real line), so it is not a genuine probability density. The first danger is **impropriety of the posterior**: an improper prior may yield a posterior that also fails to integrate, making inference meaningless — this must be checked. The second is **non-invariance**: a prior that is flat in $\theta$ is generally *not* flat in a nonlinear reparameterization $\psi=g(\theta)$, so "noninformative" depends on the arbitrary choice of coordinates.

**8.** Define the Jeffreys prior and explain the property that motivates it.

> [!example]- Show answer
> The Jeffreys prior is $f(\theta)\propto\sqrt{I(\theta)}$, where $I(\theta)$ is the Fisher information. Its defining virtue is **transformation invariance**: if you derive the Jeffreys prior for $\theta$ and then change variables to $\psi=g(\theta)$, you get exactly the Jeffreys prior for $\psi$ — the rule commutes with reparameterization. This repairs the non-invariance defect of the flat prior and gives a coordinate-free notion of "noninformative." For a Binomial proportion it is the $\text{Beta}(1/2,1/2)$ prior.

**9.** State the large-sample (Bernstein–von Mises) result and its consequence for credible vs confidence intervals.

> [!example]- Show answer
> As $n\to\infty$ the likelihood dominates the prior, the prior washes out, and the posterior is approximately Normal centered at the MLE: $\theta\mid\text{data}\approx N(\hat\theta,\ \widehat{\operatorname{se}}^{\,2})$. Consequently a $1-\alpha$ Bayesian credible interval and the corresponding Wald confidence interval become numerically nearly identical. So in large samples Bayesian and frequentist *numbers* agree even though their *interpretations* (belief about $\theta$ vs long-run coverage) remain conceptually distinct; the divergence that matters is in small samples, where the prior still drives the answer.

**10.** *(Applied)* You observe $7$ successes in $n=10$ Bernoulli trials and want the posterior for the success probability $p$ under a $\text{Beta}(1,1)$ (uniform) prior. Give the posterior, its mean and MAP, and explain how prior choice would shift the answer in this small sample. *(Applied)*

> [!example]- Show answer
> With a $\text{Beta}(1,1)$ prior the posterior is $\text{Beta}(1+7,\ 1+3)=\text{Beta}(8,4)$. The posterior mean is $\frac{8}{8+4}=\frac{2}{3}\approx 0.667$, and the MAP (mode of $\text{Beta}(8,4)$) is $\frac{8-1}{8+4-2}=\frac{7}{10}=0.70$, matching the MLE because the uniform prior is flat. A $95\%$ equal-tailed credible interval would come from the Beta quantiles (roughly $0.39$ to $0.89$, illustrative). With only $n=10$ the prior bites: a skeptical $\text{Beta}(10,10)$ prior would pull the posterior mean toward $0.5$ (to $\frac{17}{30}\approx 0.57$), whereas the uninformative prior leaves the data nearly untouched — exactly the small-sample prior-sensitivity the chapter warns about.

## Deeper understanding (expansion)

> [!info]+ 💡 Why "$P(\theta\in C)=1-\alpha$" is allowed for Bayesians but forbidden for frequentists
>
> The sentence "there's a 95% probability the parameter lies in this interval" is the single most common misreading of a frequentist confidence interval — and it's *correct* for a Bayesian credible interval. The difference is entirely about *what is random*. For the frequentist, $\theta$ is a fixed number with no distribution, so $P(\theta\in C)$ is either $0$ or $1$ for the realized interval; the only legitimate probability statement is about the procedure across hypothetical repetitions ("$95\%$ of intervals built this way cover $\theta$"). For the Bayesian, $\theta$ genuinely has a (posterior) distribution, so integrating that distribution over $C$ yields a real probability conditional on the data you actually saw. Neither is "wrong" — they are answers to different questions, and Wasserman is careful to keep them apart rather than declare a victor.

> [!info]+ 💡 Conjugate priors as pseudo-data, and when the convenience runs out
>
> Conjugate updates have a beautiful interpretation: the prior acts like *imaginary data you already saw*. A $\text{Beta}(\alpha,\beta)$ prior behaves like having previously observed $\alpha-1$ successes and $\beta-1$ failures; a $\text{Gamma}(\alpha,\beta)$ Poisson prior like $\alpha$ prior events over $\beta$ units of exposure. The posterior simply adds the real counts to the pseudo-counts, which is why the posterior mean is always a weighted average of prior mean and data, with weight shifting toward the data as $n$ grows. The catch is that conjugacy is a *mathematical convenience*, not a statement that the prior is correct — and most realistic models (logistic regression, hierarchical models, anything with a nontrivial likelihood) have **no** conjugate prior. That is precisely where simulation and MCMC (Chapter 24) take over, sampling from a posterior we can only write up to its normalizing constant.

> [!info]+ 💡 The prior washes out — but read the fine print
>
> Bernstein–von Mises is reassuring: with enough data any reasonable prior is swamped by the likelihood and the posterior collapses onto a Normal around the MLE, so Bayesians and frequentists shake hands. But the result carries conditions that matter in practice. It needs a *fixed-dimension*, well-behaved model and a prior that assigns positive density near the truth — a prior that puts zero mass on the true value can never recover, no matter how much data arrives. And in high-dimensional or small-$n$ regimes the asymptotics simply haven't kicked in, so the prior still drives the answer. The honest takeaway: agreement is an asymptotic luxury; in the small-sample, many-parameter problems where inference is hardest, the choice of prior is a real modeling decision you must defend, not an afterthought you can wave away as "noninformative."

## Connections

- [[01-probability]] — Bayes' theorem is just conditional probability from Chapter 1 applied with $\theta$ as a random variable; the prior $\to$ posterior update is the same conditioning machinery. ← all of Bayesian inference rests on this foundation.
- [[06-models-inference-and-learning]] — establishes the parametric model $f(x\mid\theta)$ and the frequentist/Bayesian split. → Chapter 11 takes the Bayesian fork and runs the inference forward.
- [[09-parametric-inference]] — supplies the **likelihood** $\mathcal{L}(\theta)$, the **MLE** $\hat\theta$, **Fisher information** $I(\theta)$, and the standard error. → the likelihood feeds Bayes' theorem, $I(\theta)$ defines the Jeffreys prior, and the MLE is the large-sample center of the posterior.
- [[10-hypothesis-testing-and-p-values]] — frequentist testing and confidence intervals; ← contrast the $p$-value and confidence interval against the Bayesian credible interval and posterior probability, which answer a different question.
- [[12-statistical-decision-theory]] — → Bayesian point estimates are exactly the **Bayes rules** that minimize posterior expected loss (mean for squared error, median for absolute error); decision theory unifies the two paradigms through risk.
- [[24-simulation-methods]] — → when the posterior has no closed form, MCMC samples from it to compute posterior means, credible intervals, and marginals; Chapter 11 motivates the need, Chapter 24 builds the engine.
