---
tags: [hypothesis-testing, p-values, wald-test, likelihood-ratio-test, multiple-testing, permutation-tests, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 10 — Hypothesis Testing and p-values

> [!abstract]+ Chapter at a glance
>
> Hypothesis testing is the second great pillar of frequentist inference alongside confidence intervals. We partition the parameter space into a null region $\Theta_0$ and an alternative region $\Theta_1$, build a **test statistic**, and decide whether the data are surprising enough to reject $H_0$. The whole apparatus is governed by two asymmetric error probabilities: the **Type I error** (rejecting a true null) is capped by the chosen level $\alpha$, while the **Type II error** (failing to reject a false null) is what the test's **power** tries to minimise. This chapter assembles the standard toolbox — the **Wald test** off the MLE, the **likelihood ratio test** with its Wilks $\chi^2$ limit, the **Pearson $\chi^2$** goodness-of-fit test, and distribution-free **permutation tests** — and ties tests to confidence intervals via duality. It closes with the two topics most often mangled in practice: the correct (and incorrect) interpretation of **p-values**, and the **multiple testing** problem with Bonferroni and the Benjamini–Hochberg false discovery rate. Wasserman's recurring warning: a p-value is not the probability that the null is true, and "fail to reject" is not "accept."

## Core concepts

**The testing framework.** We have data $X_1,\dots,X_n$ from a model with parameter $\theta\in\Theta$. We split the parameter space $\Theta=\Theta_0\cup\Theta_1$ and form the **null hypothesis** $H_0:\theta\in\Theta_0$ against the **alternative** $H_1:\theta\in\Theta_1$. A test is defined by a **test statistic** $T$ and a **rejection region** $R$: we reject $H_0$ when $T\in R$ and retain it otherwise. A hypothesis of the form $H_0:\theta=\theta_0$ is **simple**; one like $H_0:\theta\le\theta_0$ is **composite**. The conventional asymmetry matters: $H_0$ is the "status quo" or "no effect" claim that we presume true unless the evidence is strong, so we only ever *reject* or *fail to reject* — we never *prove* $H_0$.

**Two kinds of error.** A **Type I error** occurs when we reject $H_0$ but $H_0$ is true (a false positive). A **Type II error** occurs when we fail to reject $H_0$ but $H_0$ is false (a false negative). The framework deliberately treats these asymmetrically: we hold the Type I error rate fixed at a small level and then try to make the Type II error as small as possible.

| | $H_0$ true | $H_1$ true |
|---|---|---|
| **Retain $H_0$** | correct | Type II error |
| **Reject $H_0$** | Type I error | correct (power) |

**Power function, size, and level.** The **power function** is the probability of rejection as a function of the true parameter:
$$\beta(\theta)=P_\theta(T\in R).$$
The **size** of a test is its worst-case Type I error over the null region:
$$\alpha=\sup_{\theta\in\Theta_0}\beta(\theta).$$
A test has **level** $\alpha$ if its size is at most $\alpha$. For a fixed $\theta\in\Theta_1$, $\beta(\theta)$ is the test's power at that alternative; one minus it is the Type II error there. A good test keeps $\beta(\theta)$ small on $\Theta_0$ (bounded by $\alpha$) and large on $\Theta_1$.

**Building a rejection region.** For one-sided $H_0:\theta\le\theta_0$ vs $H_1:\theta>\theta_0$, a natural test rejects when an estimator $\hat\theta$ is large: $R=\{\hat\theta>c\}$. The threshold $c$ is chosen so the size equals $\alpha$, which (for monotone power) means setting it at the boundary $\theta_0$. The art is picking the test statistic; the calibration of $c$ to hit level $\alpha$ is mechanical.

**The Wald test.** The most-used large-sample test. Let $\hat\theta$ be the MLE of a scalar $\theta$ with estimated standard error $\widehat{se}$. To test $H_0:\theta=\theta_0$ vs $H_1:\theta\ne\theta_0$, form the **Wald statistic**
$$W=\frac{\hat\theta-\theta_0}{\widehat{se}}.$$
Under $H_0$, asymptotic normality of the MLE gives $W\rightsquigarrow N(0,1)$, so the size-$\alpha$ test rejects when $|W|>z_{\alpha/2}$, where $z_{\alpha/2}$ is the upper-$\alpha/2$ standard-normal quantile (e.g. $1.96$ for $\alpha=0.05$). The power against an alternative $\theta_*$ is approximately
$$\beta(\theta_*)\approx 1-\Phi\!\left(\frac{\theta_0-\theta_*}{\widehat{se}}+z_{\alpha/2}\right)+\Phi\!\left(\frac{\theta_0-\theta_*}{\widehat{se}}-z_{\alpha/2}\right).$$

**p-values.** Reporting only "reject" or "retain" throws away information: it does not say *how much* evidence there is. The **p-value** is the smallest level $\alpha$ at which the observed data would lead to rejection. Equivalently, for a test that rejects when $T$ is large,
$$\text{p-value}=\sup_{\theta\in\Theta_0}P_\theta(T\ge t_{\text{obs}}),$$
the probability, computed *under the null*, of seeing a test statistic at least as extreme as the one observed. Small p-values are strong evidence against $H_0$. Informal scale: $<0.01$ very strong, $0.01$–$0.05$ strong, $0.05$–$0.10$ weak, $>0.1$ little to none. A key fact: if the test statistic has a continuous distribution, then **under $H_0$ the p-value is itself $\text{Uniform}(0,1)$**.

**What a p-value is NOT.** This is the single most abused quantity in statistics. The p-value is **not** $P(H_0\text{ is true}\mid\text{data})$ — that is a Bayesian posterior, not a frequentist tail probability. It is **not** the probability that the result was "due to chance." A **large p-value is not evidence for $H_0$**; it only means the data are not inconsistent with $H_0$ (the test may simply lack power). And the p-value is **not** the probability you made a Type I error. Statistical significance is not the same as scientific or practical significance: with a huge $n$ a tiny, meaningless effect can produce a microscopic p-value.

**Test–confidence-interval duality.** Tests and confidence intervals are two faces of the same object. For testing $H_0:\theta=\theta_0$ vs $H_1:\theta\ne\theta_0$ at level $\alpha$: **reject $H_0$ iff $\theta_0$ falls outside the $1-\alpha$ confidence interval** for $\theta$. Equivalently, the $1-\alpha$ CI is exactly the set of null values $\theta_0$ that the size-$\alpha$ test would *not* reject. So a confidence interval can be read as "all the parameter values consistent with the data," and a test as "is this specific value among them?" This is why reporting a CI is usually more informative than reporting a single test.

**The likelihood ratio test (LRT).** A general-purpose test that often beats Wald in finite samples. Define
$$\lambda=2\log\frac{\sup_{\theta\in\Theta}L(\theta)}{\sup_{\theta\in\Theta_0}L(\theta)}=2\log\frac{L(\hat\theta)}{L(\hat\theta_0)},$$
where $\hat\theta$ is the unrestricted MLE and $\hat\theta_0$ the MLE restricted to $\Theta_0$. Large $\lambda$ means the unrestricted model fits much better, so we reject for large $\lambda$. **Wilks' theorem**: under $H_0$ (with suitable regularity), as $n\to\infty$,
$$\lambda\rightsquigarrow\chi^2_r,$$
where $r=\dim(\Theta)-\dim(\Theta_0)$ is the number of free parameters fixed by the null. The size-$\alpha$ test rejects when $\lambda>\chi^2_{r,\alpha}$, the upper-$\alpha$ quantile of $\chi^2_r$.

**Pearson $\chi^2$ goodness-of-fit.** For categorical/multinomial data with $k$ cells, test whether the cell probabilities equal specified values $p_{01},\dots,p_{0k}$. With observed counts $O_j$ and expected counts $E_j=np_{0j}$,
$$T=\sum_{j=1}^{k}\frac{(O_j-E_j)^2}{E_j}.$$
Under $H_0$, $T\rightsquigarrow\chi^2_{k-1}$; if the null probabilities themselves depend on $d$ estimated parameters, the degrees of freedom drop to $k-1-d$. The LRT statistic for the same problem is asymptotically equivalent and has the same limiting $\chi^2$ distribution.

**The multiple testing problem.** If you run $m$ independent level-$\alpha$ tests, the chance of *at least one* false rejection inflates rapidly — with $m=20$ and $\alpha=0.05$ you expect about one false positive even if every null is true. Two remedies:
- **Bonferroni correction** controls the **family-wise error rate** (the probability of *any* Type I error) by testing each hypothesis at level $\alpha/m$ — equivalently, reject the $i$-th null when its p-value $p_i<\alpha/m$. Simple and conservative; it sacrifices power as $m$ grows.
- **Benjamini–Hochberg (BH)** controls the **false discovery rate (FDR)** — the *expected proportion of false rejections among all rejections* — which is less stringent. Sort the p-values $p_{(1)}\le\dots\le p_{(m)}$, find the largest $i$ with $p_{(i)}\le\frac{i}{m}\alpha$, and reject all hypotheses with p-value $\le p_{(i)}$. BH is far more powerful than Bonferroni when there are many true effects, which is why it dominates in genomics and large-scale screening.

**Permutation tests.** A distribution-free, often *exact* alternative for two-sample problems (e.g. testing whether two groups have the same distribution). Compute a test statistic $T$ (say the difference in means) on the original labelled data. Then repeatedly **reshuffle the group labels**, recomputing $T$ each time; under the null of exchangeability all labellings are equally likely. The permutation p-value is the fraction of relabelled statistics at least as extreme as the observed one. No parametric model and no asymptotics are required — only the assumption that, under $H_0$, the labels are exchangeable.

## Quiz

**1.** Define Type I and Type II errors and explain why the testing framework treats them asymmetrically.

> [!example]- Show answer
> A Type I error is rejecting $H_0$ when $H_0$ is true (false positive); a Type II error is failing to reject $H_0$ when $H_0$ is false (false negative). The framework is asymmetric because $H_0$ encodes the conservative "no effect / status quo" claim, and we want strong protection against falsely declaring an effect. So we fix the Type I error rate at a small level $\alpha$ (the size) and only then try to minimise the Type II error by maximising power. This is why we say "fail to reject" rather than "accept" $H_0$: retaining the null is the default, not a proof.

**2.** Write down the power function, the size, and the level of a test, and state how they relate.

> [!example]- Show answer
> The power function is $\beta(\theta)=P_\theta(\text{reject }H_0)=P_\theta(T\in R)$, the rejection probability as a function of the true $\theta$. The size is the worst-case rejection probability over the null region, $\alpha=\sup_{\theta\in\Theta_0}\beta(\theta)$. A test has level $\alpha$ if its size is $\le\alpha$. On $\Theta_0$ we want $\beta$ small (bounded by $\alpha$); on $\Theta_1$ we want $\beta$ large, since there $1-\beta(\theta)$ is the Type II error probability.

**3.** State the Wald test for $H_0:\theta=\theta_0$ vs $H_1:\theta\ne\theta_0$ and justify its rejection rule.

> [!example]- Show answer
> Let $\hat\theta$ be the MLE with estimated standard error $\widehat{se}$, and form $W=(\hat\theta-\theta_0)/\widehat{se}$. The asymptotic normality of the MLE implies that under $H_0$, $W\rightsquigarrow N(0,1)$. Therefore the size-$\alpha$ test rejects when $|W|>z_{\alpha/2}$, the upper-$\alpha/2$ normal quantile (e.g. $1.96$ at $\alpha=0.05$). The logic is that if $\theta_0$ is the true value, $\hat\theta$ should land within a couple of standard errors of it; a large standardised distance is evidence against $H_0$.

**4.** Define the p-value in two equivalent ways and give the rough scale for interpreting it.

> [!example]- Show answer
> First definition: the p-value is the smallest level $\alpha$ at which the test would reject $H_0$ given the observed data. Second (operational) definition: it is the probability, computed under $H_0$, of obtaining a test statistic at least as extreme as the one observed, $\sup_{\theta\in\Theta_0}P_\theta(T\ge t_{\text{obs}})$ for an upper-tail test. Small values are evidence against $H_0$. A rough scale: below $0.01$ is very strong evidence, $0.01$–$0.05$ strong, $0.05$–$0.10$ weak, and above $0.1$ little to none.

**5.** List three things a p-value is *not*, and explain the most common misinterpretation.

> [!example]- Show answer
> A p-value is **not** $P(H_0\text{ is true}\mid\text{data})$; it is **not** the probability the result is "due to chance"; and it is **not** the probability that you have made a Type I error. The most common error is treating the p-value as the posterior probability that the null is true — but that is a Bayesian quantity requiring a prior, whereas the p-value is a frequentist tail probability computed *assuming the null*. Relatedly, a large p-value does not support $H_0$; it merely indicates the data are not inconsistent with it, which can happen simply because the test lacks power.

**6.** State the duality between hypothesis tests and confidence intervals.

> [!example]- Show answer
> For testing $H_0:\theta=\theta_0$ vs $H_1:\theta\ne\theta_0$ at level $\alpha$, the test rejects $H_0$ if and only if $\theta_0$ lies outside the $1-\alpha$ confidence interval for $\theta$. Equivalently, the $1-\alpha$ CI is exactly the set of null values that the size-$\alpha$ test fails to reject — the "values consistent with the data." This is why a confidence interval carries more information than a bare test: it simultaneously answers the test for *every* candidate $\theta_0$.

**7.** Define the likelihood ratio statistic and state Wilks' theorem, including the degrees of freedom.

> [!example]- Show answer
> The LRT statistic is $\lambda=2\log\big(L(\hat\theta)/L(\hat\theta_0)\big)$, where $\hat\theta$ is the unrestricted MLE and $\hat\theta_0$ is the MLE restricted to $\Theta_0$. Large $\lambda$ means the full model fits substantially better, so we reject for large $\lambda$. Wilks' theorem says that under $H_0$ and regularity conditions, $\lambda\rightsquigarrow\chi^2_r$ as $n\to\infty$, where $r=\dim(\Theta)-\dim(\Theta_0)$ is the number of parameters the null constrains. The size-$\alpha$ test rejects when $\lambda$ exceeds the upper-$\alpha$ quantile $\chi^2_{r,\alpha}$.

**8.** Write down the Pearson $\chi^2$ goodness-of-fit statistic and give its limiting distribution and degrees of freedom.

> [!example]- Show answer
> With $k$ categories, observed counts $O_j$, and expected counts $E_j=np_{0j}$ under the null, the statistic is $T=\sum_{j=1}^k (O_j-E_j)^2/E_j$. Under $H_0$ it converges in distribution to $\chi^2_{k-1}$, so we reject when $T$ exceeds the upper-$\alpha$ quantile of $\chi^2_{k-1}$. If the null cell probabilities are themselves estimated from $d$ parameters, the degrees of freedom fall to $k-1-d$. The LRT for the same multinomial problem is asymptotically equivalent and shares this $\chi^2$ limit.

**9.** Explain the multiple testing problem and contrast the Bonferroni correction with the Benjamini–Hochberg procedure.

> [!example]- Show answer
> Running many tests inflates the chance of at least one false rejection: with $m$ true nulls each tested at level $\alpha$, roughly $m\alpha$ false positives are expected, so for $m=20,\alpha=0.05$ you expect about one even when nothing is real. Bonferroni controls the family-wise error rate (the probability of *any* false rejection) by testing each hypothesis at level $\alpha/m$; it is simple but conservative and loses power as $m$ grows. Benjamini–Hochberg instead controls the false discovery rate — the expected fraction of false rejections among all rejections — by sorting p-values and rejecting up to the largest $i$ with $p_{(i)}\le (i/m)\alpha$. BH is much more powerful when many alternatives are truly non-null, which is why it dominates large-scale screening.

**10.** *(Applied)* You measure systolic blood pressure for a treatment group and a control group ($n_1=40$, $n_2=42$) and want to test whether the two distributions differ, but you are unwilling to assume normality. Describe a permutation test and compute the p-value conceptually. How would you also report a result using test–CI duality?

> [!example]- Show answer
> Compute a test statistic on the observed labelling, e.g. the difference in group means $T_{\text{obs}}=\bar X_{\text{treat}}-\bar X_{\text{control}}$. Under the null of no difference, the group labels are exchangeable, so repeatedly pool all 82 values, randomly reassign 40 to "treatment" and 42 to "control," and recompute $T$ for each shuffle (or enumerate exactly if feasible). The permutation p-value is the fraction of shuffled $|T|$ values at least as large as $|T_{\text{obs}}|$ — no normality or asymptotics needed, only exchangeability. To use duality, instead form a $1-\alpha$ confidence interval for the mean difference (e.g. by bootstrap); if that interval excludes $0$, you reject the null of equal means at level $\alpha$, and the interval additionally communicates the size and direction of the effect.

## Deeper understanding (expansion)

> [!info]+ 💡 Why "fail to reject" never means "accept"
>
> The logical structure of a test is one-directional. We assume $H_0$, derive what the data should look like, and check whether reality is surprising. If it is, we reject; if it is not, we have learned only that $H_0$ *might* be true, not that it *is*. A small effect, a small sample, or a noisy measurement all produce large p-values for reasons that have nothing to do with the null being correct — they just leave the test underpowered. This is the practical content of the size/power split: the level $\alpha$ controls false rejections regardless of $n$, but the power $\beta(\theta)$ grows only as $n$ grows. The honest report of a non-significant result is "we did not detect an effect," usually accompanied by a confidence interval that shows how large an effect could still be hiding undetected. Treating $p>0.05$ as "no effect" is one of the most consequential errors in applied science.

> [!info]+ 💡 Three asymptotically equivalent tests, three personalities
>
> The Wald, likelihood-ratio, and score tests all target the same hypothesis and share the same $\chi^2$ (or normal) limiting distribution, yet they differ in finite samples and in what they require you to compute. **Wald** needs only the unrestricted MLE and its standard error — convenient, but it is not invariant to reparameterisation and can behave badly near boundaries. **LRT** requires fitting the model both with and without the constraint, but it is reparameterisation-invariant and usually the most reliable; Wilks' theorem hands you the $\chi^2_r$ reference distribution for free, with $r$ equal to the number of constraints. The **score (Rao) test** needs only the restricted fit. When they disagree noticeably, that disagreement is itself a warning that the asymptotics have not kicked in and the sample is too small to trust any of them blindly.

> [!info]+ 💡 P-values are uniform under the null — and why that matters
>
> For a continuous test statistic, the p-value is itself a random variable that is exactly $\text{Uniform}(0,1)$ when $H_0$ holds. This single fact underpins almost everything downstream. It is *why* the level is calibrated correctly: $P(\text{p-value}\le\alpha)=\alpha$ under $H_0$, so rejecting when the p-value is below $\alpha$ gives a size-$\alpha$ test. It is *why* multiple testing is dangerous: $m$ independent uniforms will, by chance, throw some values near $0$, manufacturing apparent discoveries. And it is *why* Benjamini–Hochberg works — the procedure compares the ordered uniforms against the line $(i/m)\alpha$ to separate a heavy left-tail of true signals from the uniform background of nulls. Seeing p-values as draws from $\text{Uniform}(0,1)$-under-the-null demystifies both the calibration of a single test and the correction needed for many.

## Connections

- [[09-parametric-inference]] — The MLE, its asymptotic normality, and the estimated standard error from the Fisher information are exactly the ingredients the Wald test plugs in; the likelihood that drives the LRT is the same likelihood maximised there.
- [[06-models-inference-and-learning]] — Tests, like confidence intervals and point estimates, are one of the three core inference targets introduced when the statistical model is first set up; the parameter space split $\Theta_0\cup\Theta_1$ lives inside that model.
- [[11-bayesian-inference]] — The sharpest contrast: a p-value is a frequentist tail probability under $H_0$, whereas the Bayesian computes the *posterior* probability $P(H_0\mid\text{data})$ via priors and Bayes factors. Confusing the two is the canonical p-value error.
- [[12-statistical-decision-theory]] — Type I/II errors and the power function are a decision problem in disguise; the Neyman–Pearson lemma (most powerful tests) is the decision-theoretic optimum for a fixed size.
- [[15-inference-about-independence]] — The Pearson $\chi^2$ and likelihood-ratio statistics reappear as tests of independence in contingency tables, with degrees of freedom set by the table dimensions.
- → Multiple testing and the false discovery rate scale up directly into high-dimensional screening and the statistical-machine-learning chapters, where thousands of simultaneous tests are the norm.
- ← Builds on the asymptotic theory and delta-method standard errors from [[09-parametric-inference]]; everything here presumes you can estimate $\hat\theta$ and $\widehat{se}$ first.
