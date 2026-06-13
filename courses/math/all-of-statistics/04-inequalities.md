---
tags: [probability-inequalities, markov, chebyshev, hoeffding, jensen, cauchy-schwarz, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 4 — Inequalities

> [!abstract]+ Chapter at a glance
>
> Inequalities are the workhorses of probability theory: they let you *bound* a probability or an expectation when you cannot — or do not want to — compute it exactly. This short but pivotal chapter assembles the toolkit that powers nearly everything later in the book. Markov's and Chebyshev's inequalities bound tail probabilities using only a mean (and, for Chebyshev, a variance), with no knowledge of the full distribution. Hoeffding's inequality trades the mild assumption of *boundedness* for a dramatically tighter *exponential* tail bound on the sample mean — the engine behind distribution-free confidence intervals and sample-size calculations. Mill's inequality sharpens the Gaussian tail. Cauchy–Schwarz and Jensen's inequality are expectation inequalities that recur whenever we manipulate moments. The recurring theme: with weaker assumptions you get weaker (polynomial) bounds; with stronger assumptions (boundedness, Gaussianity) you get stronger (exponential) bounds. These tools are exactly what we need to prove the Weak Law of Large Numbers and, more generally, consistency of estimators.

## Core concepts

**Why inequalities matter.** Often we want to bound $P(X \ge t)$ or $P(|X-\mu| \ge t)$ without knowing the distribution of $X$. Inequalities give us bounds that hold *uniformly* over wide classes of distributions. They are the primary device for (i) proving convergence results like the law of large numbers, (ii) establishing consistency of estimators, and (iii) computing how large a sample size $n$ must be so an estimate is accurate with high probability.

**Markov's inequality.** If $X$ is a *nonnegative* random variable with finite mean, then for any $t > 0$,
$$P(X \ge t) \le \frac{E[X]}{t}.$$
This is the most basic tail bound. It requires only nonnegativity and the existence of a mean — nothing about variance or shape. Every other inequality in this chapter can be seen as Markov applied to a cleverly chosen function of $X$.

**Chebyshev's inequality.** If $X$ has mean $\mu$ and finite variance $\sigma^2$, then for any $t > 0$,
$$P(|X - \mu| \ge t) \le \frac{\sigma^2}{t^2}.$$
Equivalently, in $k$-standard-deviation form (set $t = k\sigma$),
$$P(|X - \mu| \ge k\sigma) \le \frac{1}{k^2}.$$
So at least $1 - 1/k^2$ of the probability mass lies within $k$ standard deviations of the mean — e.g. at most $1/4$ beyond $2\sigma$, at most $1/9$ beyond $3\sigma$. Chebyshev *follows from* Markov: apply Markov to the nonnegative variable $(X-\mu)^2$ at level $t^2$, since $P(|X-\mu| \ge t) = P((X-\mu)^2 \ge t^2) \le E[(X-\mu)^2]/t^2 = \sigma^2/t^2$.

**Chebyshev proves the Weak Law of Large Numbers.** Let $X_1,\dots,X_n$ be iid with mean $\mu$ and variance $\sigma^2$, and $\bar X_n$ the sample mean. Then $E[\bar X_n] = \mu$ and $\mathrm{Var}(\bar X_n) = \sigma^2/n$. Chebyshev gives
$$P(|\bar X_n - \mu| \ge \epsilon) \le \frac{\sigma^2}{n\epsilon^2} \to 0 \quad \text{as } n \to \infty.$$
This shows $\bar X_n \xrightarrow{P} \mu$ — convergence in probability — which is precisely the WLLN. The bound also gives a (loose) sample size: $n \ge \sigma^2/(\epsilon^2\delta)$ suffices to make the probability at most $\delta$.

**Hoeffding's inequality.** Suppose $X_1,\dots,X_n$ are independent with $E[X_i] = \mu$ and $a_i \le X_i \le b_i$ (bounded). Then for any $\epsilon > 0$,
$$P(|\bar X_n - \mu| \ge \epsilon) \le 2\exp\!\left(-\frac{2n^2\epsilon^2}{\sum_{i=1}^n (b_i-a_i)^2}\right).$$
In the common case where every $X_i \in [a,b]$, the bound becomes $2\exp\!\big(-2n\epsilon^2/(b-a)^2\big)$; for $X_i \in [0,1]$ it is simply $2e^{-2n\epsilon^2}$. The key feature is *exponential* decay in $n$ — distribution-free, requiring only independence and boundedness, not normality.

**Hoeffding's lemma.** The exponential bound is built from a bound on the moment generating function. If $a \le X \le b$ and $E[X]=0$, then for any $s>0$,
$$E[e^{sX}] \le \exp\!\left(\frac{s^2(b-a)^2}{8}\right).$$
Combining this lemma with Markov applied to $e^{s\sum X_i}$ (the "Chernoff" trick) and then optimizing over $s$ yields the exponential tail bound — this is why bounded variables give exponential rather than polynomial control.

**Exponential beats polynomial.** Chebyshev bounds the deviation probability by something proportional to $1/(n\epsilon^2)$ — polynomial decay. Hoeffding bounds it by $2e^{-2n\epsilon^2}$ — exponential decay. For moderate $n$ the difference is enormous: to make a tail probability $\le \delta$, Chebyshev needs $n \propto 1/\delta$ while Hoeffding needs only $n \propto \log(1/\delta)$. Boundedness is the price; the payoff is far tighter bounds and far smaller required sample sizes.

**Mill's inequality.** For a standard Normal $Z \sim N(0,1)$, the upper tail satisfies
$$P(|Z| > t) \le \sqrt{\frac{2}{\pi}} \, \frac{e^{-t^2/2}}{t}.$$
This is a sharp Gaussian tail bound — much tighter than what Chebyshev or even generic Hoeffding-style reasoning would give for a Normal — and it captures the characteristic $e^{-t^2/2}$ decay of the Gaussian tail.

**Cauchy–Schwarz inequality.** For random variables $X$ and $Y$ with finite second moments,
$$|E[XY]| \le \sqrt{E[X^2]\,E[Y^2]}.$$
Applied to centered variables this yields $|\mathrm{Cov}(X,Y)| \le \sqrt{\mathrm{Var}(X)\,\mathrm{Var}(Y)}$, i.e. the correlation $\rho$ satisfies $|\rho| \le 1$.

**Jensen's inequality.** If $g$ is *convex*, then
$$E[g(X)] \ge g(E[X]),$$
and the inequality reverses for *concave* $g$. Useful consequences:
- $g(x)=x^2$ convex $\Rightarrow E[X^2] \ge (E[X])^2$ (which restates $\mathrm{Var}(X) \ge 0$).
- $g(x)=1/x$ convex on $(0,\infty)$ $\Rightarrow E[1/X] \ge 1/E[X]$ for positive $X$.
- $g(x)=\log x$ concave $\Rightarrow E[\log X] \le \log E[X]$; equivalently $g=\exp$ convex $\Rightarrow E[e^X]\ge e^{E[X]}$.

**Confidence intervals via Hoeffding.** Because Hoeffding's bound is distribution-free, it directly produces a finite-sample confidence interval. For $X_i \in [0,1]$, setting $2e^{-2n\epsilon^2} = \alpha$ gives $\epsilon_n = \sqrt{\tfrac{1}{2n}\log(2/\alpha)}$, and $[\bar X_n - \epsilon_n,\ \bar X_n + \epsilon_n]$ is a $1-\alpha$ confidence interval for $\mu$ — valid for *every* $n$, with no normal approximation.

**Sample size from a tail bound.** To guarantee $P(|\bar X_n - \mu| > \epsilon) \le \delta$: Chebyshev requires $n \ge \sigma^2/(\epsilon^2\delta)$; Hoeffding (for $X_i\in[0,1]$) requires only $n \ge \tfrac{1}{2\epsilon^2}\log(2/\delta)$. The logarithmic dependence on $\delta$ is the practical advantage of the exponential bound.

## Quiz

**1.** State Markov's inequality and the conditions under which it applies.

> [!example]- Show answer
> Markov's inequality states that for a *nonnegative* random variable $X$ with finite mean and any $t>0$, $P(X \ge t) \le E[X]/t$. The only requirements are that $X \ge 0$ and that $E[X]$ exists. No assumption about the variance, higher moments, or the shape of the distribution is needed. It is the foundational tail bound from which Chebyshev's and Hoeffding's inequalities are both derived. Because it uses so little information, it is correspondingly loose, but it always holds.

**2.** Derive Chebyshev's inequality from Markov's inequality.

> [!example]- Show answer
> Let $X$ have mean $\mu$ and variance $\sigma^2$. The event $\{|X-\mu| \ge t\}$ is identical to $\{(X-\mu)^2 \ge t^2\}$. Now $(X-\mu)^2$ is nonnegative, so Markov's inequality at level $t^2$ gives $P((X-\mu)^2 \ge t^2) \le E[(X-\mu)^2]/t^2$. Since $E[(X-\mu)^2] = \sigma^2$ by definition of variance, we obtain $P(|X-\mu| \ge t) \le \sigma^2/t^2$, which is Chebyshev's inequality. This shows Chebyshev is just Markov applied to the squared deviation.

**3.** In $k$-standard-deviation form, what fraction of probability mass must lie within 2 and within 3 standard deviations of the mean, according to Chebyshev?

> [!example]- Show answer
> Chebyshev in the form $P(|X-\mu| \ge k\sigma) \le 1/k^2$ bounds the mass in the tails. For $k=2$, at most $1/4 = 25\%$ of the mass lies beyond $2\sigma$, so at least $75\%$ lies within $2\sigma$. For $k=3$, at most $1/9 \approx 11\%$ lies beyond $3\sigma$, so at least about $89\%$ lies within $3\sigma$. These bounds hold for *any* distribution with finite variance, which is why they are weaker than the much tighter Normal-specific figures (95% within $2\sigma$, etc.).

**4.** Show how Chebyshev's inequality proves the Weak Law of Large Numbers.

> [!example]- Show answer
> For iid $X_1,\dots,X_n$ with mean $\mu$ and variance $\sigma^2$, the sample mean satisfies $E[\bar X_n]=\mu$ and $\mathrm{Var}(\bar X_n)=\sigma^2/n$. Applying Chebyshev to $\bar X_n$ gives $P(|\bar X_n - \mu| \ge \epsilon) \le \sigma^2/(n\epsilon^2)$. For any fixed $\epsilon>0$, the right side tends to $0$ as $n\to\infty$. Hence $\bar X_n \xrightarrow{P} \mu$, which is exactly the statement of the Weak Law of Large Numbers — convergence of the sample mean to the true mean in probability.

**5.** State Hoeffding's inequality for iid variables bounded in $[a,b]$ and identify what assumption it requires.

> [!example]- Show answer
> If $X_1,\dots,X_n$ are independent with mean $\mu$ and each $X_i \in [a,b]$, then $P(|\bar X_n - \mu| \ge \epsilon) \le 2\exp\!\big(-2n\epsilon^2/(b-a)^2\big)$. The crucial assumption is *boundedness*: each variable must lie in a known finite interval. No assumption about the variance or the specific distribution is needed beyond independence and bounded range. The payoff for boundedness is that the bound decays *exponentially* in $n$, far faster than Chebyshev's polynomial $1/n$ rate.

**6.** Why is Hoeffding's exponential bound so much stronger than Chebyshev's, and what is the cost?

> [!example]- Show answer
> Chebyshev bounds the deviation probability by roughly $\sigma^2/(n\epsilon^2)$, which decays only *polynomially* (like $1/n$). Hoeffding bounds it by $2e^{-2n\epsilon^2}$, which decays *exponentially* in $n$. To drive a tail probability below $\delta$, Chebyshev needs $n$ proportional to $1/\delta$, whereas Hoeffding needs $n$ proportional to only $\log(1/\delta)$ — vastly smaller. The cost is the boundedness assumption: Hoeffding requires the $X_i$ to lie in a known finite interval, whereas Chebyshev needs only a finite variance.

**7.** What does Hoeffding's lemma say, and what role does it play in proving Hoeffding's inequality?

> [!example]- Show answer
> Hoeffding's lemma bounds the moment generating function of a bounded, mean-zero variable: if $a \le X \le b$ and $E[X]=0$, then $E[e^{sX}] \le \exp(s^2(b-a)^2/8)$ for all $s$. It plays the central role: one applies Markov's inequality to $e^{s\sum_i(X_i-\mu)}$ (the Chernoff bounding method), uses independence to factor the MGF into a product, bounds each factor with the lemma, and then optimizes over $s$. The optimization of the resulting Gaussian-like MGF bound is exactly what produces the $e^{-2n\epsilon^2/(b-a)^2}$ exponential tail.

**8.** State Mill's inequality and explain what it bounds.

> [!example]- Show answer
> Mill's inequality bounds the tail of a standard Normal $Z \sim N(0,1)$: $P(|Z| > t) \le \sqrt{2/\pi}\,\, e^{-t^2/2}/t$. It is a *sharp* Gaussian upper-tail bound, capturing the characteristic $e^{-t^2/2}$ decay of the Normal tail and the additional $1/t$ factor. It is much tighter for the Normal than the generic bounds (Chebyshev, or even raw Hoeffding-style reasoning) because it exploits the exact Gaussian form. It is useful whenever one needs a clean analytic handle on how fast Normal tails vanish.

**9.** State Jensen's inequality and use it to explain why $E[X^2] \ge (E[X])^2$ and $E[1/X] \ge 1/E[X]$ (for positive $X$).

> [!example]- Show answer
> Jensen's inequality says that for a convex function $g$, $E[g(X)] \ge g(E[X])$ (the inequality reverses for concave $g$). Taking $g(x)=x^2$, which is convex, gives $E[X^2] \ge (E[X])^2$; this simply restates that $\mathrm{Var}(X) = E[X^2]-(E[X])^2 \ge 0$. Taking $g(x)=1/x$, which is convex on $(0,\infty)$, gives $E[1/X] \ge 1/E[X]$ for positive $X$. Conversely, $\log$ is concave, so $E[\log X] \le \log E[X]$. Jensen thus formalizes how averaging interacts with curvature.

**10.** *(Applied)* You observe iid $X_1,\dots,X_n$ with each $X_i \in [0,1]$ and want a $95\%$ confidence interval for $\mu = E[X_i]$. Use Hoeffding to derive its half-width, and find the $n$ needed for half-width $0.05$.

> [!example]- Show answer
> For $X_i \in [0,1]$, Hoeffding gives $P(|\bar X_n - \mu| \ge \epsilon) \le 2e^{-2n\epsilon^2}$. Set $2e^{-2n\epsilon_n^2} = \alpha$ with $\alpha = 0.05$ and solve for the half-width: $\epsilon_n = \sqrt{\tfrac{1}{2n}\log(2/\alpha)}$. The interval $[\bar X_n - \epsilon_n,\ \bar X_n + \epsilon_n]$ is then a $95\%$ confidence interval, valid for every $n$ without any normal approximation. To force $\epsilon_n \le 0.05$, invert to get $n \ge \tfrac{1}{2(0.05)^2}\log(2/0.05) = \tfrac{1}{0.005}\log(40) \approx 200 \times 3.69 \approx 738$. So roughly $n \approx 740$ observations suffice.

## Deeper understanding (expansion)

> [!info]+ 💡 One inequality, many faces: everything is Markov in disguise
>
> A surprising amount of this chapter collapses to a single idea: apply Markov's inequality to a well-chosen nonnegative transform of $X$. Chebyshev is Markov applied to $(X-\mu)^2$. More generally, applying Markov to $(X-\mu)^{2k}$ gives bounds that improve with higher moments. Applying Markov to $e^{sX}$ — the *Chernoff method* — and then optimizing over $s$ is precisely how Hoeffding's exponential bound (and many concentration inequalities) are obtained. The lesson: the *shape* of the transform you feed into Markov controls how tight the resulting bound is. A polynomial transform yields polynomial decay (Chebyshev); an exponential transform yields exponential decay (Hoeffding/Chernoff). Recognizing this unifying structure makes the whole inequality toolkit feel like one technique rather than a list to memorize.

> [!info]+ 💡 Why bounded support buys you exponential concentration
>
> Chebyshev only needs a variance, but it pays for that generality with a weak $1/n$ rate — because a finite-variance distribution can still have fat tails that put non-trivial mass far from the mean. Hoeffding assumes each variable lives in a *bounded* interval $[a,b]$. Boundedness rules out fat tails entirely: no single observation can drag the sample mean far, so large deviations require many observations to conspire, an event whose probability decays exponentially. Hoeffding's lemma quantifies this by showing a bounded variable's MGF is dominated by that of a Gaussian with variance $(b-a)^2/4$ — bounded variables are "sub-Gaussian." This is the conceptual bridge to the entire field of concentration of measure, where assumptions like boundedness, sub-Gaussianity, or bounded differences each unlock exponential tail control.

> [!info]+ 💡 Jensen, the bias of plug-in estimators, and the log-likelihood
>
> Jensen's inequality is not just an algebraic curiosity; it explains real statistical phenomena. Because $g(x)=x^2$ is convex, $E[X^2] > (E[X])^2$ whenever $X$ has nonzero spread — which is exactly why the naive plug-in $(\bar X)^2$ is a *biased* estimator of $E[X^2]$. Because $1/x$ is convex, $E[1/\bar X] \ne 1/\mu$, so ratio and rate estimators carry Jensen bias. And in likelihood theory, the concavity of $\log$ via Jensen is what guarantees that the Kullback–Leibler divergence $E[\log(p/q)] \ge 0$ — the cornerstone that makes maximum-likelihood estimation consistent and that underpins the EM algorithm's monotonic ascent. Knowing the direction Jensen pushes ($\ge$ for convex, $\le$ for concave) lets you predict the sign of these biases before doing any computation.

## Connections

- [[03-expectation]] ← Inequalities are stated entirely in the language of expectation and variance from the previous chapter: Markov uses $E[X]$, Chebyshev uses $\sigma^2 = E[(X-\mu)^2]$, and Cauchy–Schwarz/Jensen are pure expectation inequalities. Master $E[\cdot]$ and $\mathrm{Var}(\cdot)$ there before relying on the bounds here.
- [[05-convergence-of-random-variables]] → Chebyshev's bound *is* the proof engine for convergence in probability and the Weak Law of Large Numbers, the central topics of the next chapter; Hoeffding strengthens these into finite-sample (non-asymptotic) statements.
- [[06-models-inference-and-learning]] → These inequalities are the mathematical justification for *consistency* of estimators and for distribution-free confidence intervals introduced when statistical inference begins; the sample-size-from-a-tail-bound idea recurs throughout inference.
- [[22-classification]] → Hoeffding's inequality and the sub-Gaussian / concentration ideas seeded here generalize (via uniform bounds and VC theory) into the generalization-error guarantees that bound test error in classification and statistical learning.
- [[07-estimating-cdf-and-functionals]] → The empirical CDF's uniform convergence (the DKW inequality) is a direct descendant of the Hoeffding-style exponential concentration developed in this chapter.
