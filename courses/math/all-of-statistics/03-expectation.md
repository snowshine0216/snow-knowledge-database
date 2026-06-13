---
tags: [expectation, variance, covariance, correlation, conditional-expectation, moment-generating-functions, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 3 — Expectation

> [!abstract]+ Chapter at a glance
>
> Expectation is the single number that summarizes the "center" of a random variable, and the operations built on it — variance, covariance, conditional expectation, moment generating functions — form the computational backbone of the rest of the book. This chapter develops $\mathbb{E}[X]$ as a weighted average (sum for discrete, integral for continuous), establishes **linearity** as the property that holds with no assumptions whatsoever, and then introduces the second-order tools: variance and standard deviation for spread, covariance and correlation for co-movement. The conditional-expectation machinery — treating $\mathbb{E}[Y \mid X]$ as a *random variable* and using the laws of iterated expectation and total variance — is the bridge to hierarchical models and prediction. Two themes recur and are heavily tested: **zero correlation does not imply independence**, and **linearity of expectation needs no independence, but the clean variance-of-a-sum formula does.**

## Core concepts

**Expected value.** For a discrete random variable with mass function $f$, the expectation (mean, first moment) is $\mathbb{E}[X] = \sum_x x\, f(x)$. For a continuous random variable with density $f$, $\mathbb{E}[X] = \int x\, f(x)\,dx$. We often write $\mu$ or $\mu_X$ for $\mathbb{E}[X]$. The expectation is a single number, a property of the *distribution*, not of any particular sample.

**When the mean exists.** The sum or integral defining $\mathbb{E}[X]$ must converge absolutely — $\mathbb{E}|X| < \infty$ — for the mean to be well defined. If $\int |x| f(x)\,dx = \infty$, the expectation does not exist. The canonical example is the **Cauchy distribution** with density $f(x) = \frac{1}{\pi(1+x^2)}$: the integral $\int |x| f(x)\,dx$ diverges, so a Cauchy random variable has no mean (and no variance). This is why sample averages of Cauchy data do not settle down.

**The rule of the lazy statistician.** To find the expectation of a transformed variable $Y = g(X)$, you do *not* need the distribution of $Y$; you integrate against the distribution of $X$:
$$\mathbb{E}[g(X)] = \int g(x)\, f(x)\,dx \quad \text{(or } \sum_x g(x) f(x) \text{ in the discrete case).}$$
This extends to several variables: $\mathbb{E}[g(X,Y)] = \iint g(x,y)\, f(x,y)\,dx\,dy$.

**Linearity of expectation.** For constants $a, b$ and random variables $X, Y$,
$$\mathbb{E}[aX + bY] = a\,\mathbb{E}[X] + b\,\mathbb{E}[Y].$$
This holds **without any independence assumption** — it is true even when $X$ and $Y$ are strongly dependent. More generally $\mathbb{E}\big[\sum_i a_i X_i\big] = \sum_i a_i \mathbb{E}[X_i]$. This is the most-used identity in the book.

**Variance and standard deviation.** The variance measures spread around the mean:
$$\operatorname{Var}(X) = \mathbb{E}\big[(X-\mu)^2\big] = \mathbb{E}[X^2] - (\mathbb{E}[X])^2.$$
The second form is the usual computational shortcut. The **standard deviation** is $\operatorname{sd}(X) = \sigma = \sqrt{\operatorname{Var}(X)}$, measured in the same units as $X$. Variance is always nonnegative, and equals zero only if $X$ is (essentially) constant.

**Properties of variance.** For constants $a, b$,
$$\operatorname{Var}(aX + b) = a^2 \operatorname{Var}(X).$$
Adding a constant shifts the mean but not the spread; scaling by $a$ scales the variance by $a^2$ (and the standard deviation by $|a|$).

**Covariance and correlation.** Covariance measures linear co-movement:
$$\operatorname{Cov}(X,Y) = \mathbb{E}\big[(X-\mu_X)(Y-\mu_Y)\big] = \mathbb{E}[XY] - \mathbb{E}[X]\mathbb{E}[Y].$$
The **correlation** rescales it to a unit-free number in $[-1,1]$:
$$\rho = \rho_{X,Y} = \frac{\operatorname{Cov}(X,Y)}{\sigma_X\,\sigma_Y}, \qquad -1 \le \rho \le 1.$$
$\rho = \pm 1$ exactly when $Y$ is a perfect linear function of $X$ (positive or negative slope). Correlation captures *linear* association only.

**Variance of a sum.** In general,
$$\operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) + 2\operatorname{Cov}(X,Y).$$
If $X$ and $Y$ are independent — or merely **uncorrelated** ($\operatorname{Cov} = 0$) — the cross term vanishes and $\operatorname{Var}(X+Y) = \operatorname{Var}(X) + \operatorname{Var}(Y)$. For a weighted sum, $\operatorname{Var}\big(\sum_i a_i X_i\big) = \sum_i a_i^2 \operatorname{Var}(X_i)$ when the $X_i$ are uncorrelated.

**Mean and variance of the sample mean.** Let $X_1,\dots,X_n$ be iid with mean $\mu$ and variance $\sigma^2$, and $\bar X_n = \frac1n \sum_i X_i$. Then
$$\mathbb{E}[\bar X_n] = \mu, \qquad \operatorname{Var}(\bar X_n) = \frac{\sigma^2}{n}.$$
The sample mean is *unbiased* for $\mu$, and its spread shrinks like $1/n$ — the engine behind the law of large numbers.

**Independence vs. uncorrelated.** Independence $\Rightarrow$ $\operatorname{Cov}(X,Y) = 0$ (uncorrelated), but **the converse is false**. Two variables can have zero covariance yet be strongly dependent (e.g. $X \sim N(0,1)$ and $Y = X^2$: $\operatorname{Cov}(X,Y) = 0$, but $Y$ is a deterministic function of $X$). Zero correlation only rules out *linear* dependence.

**Conditional expectation.** $\mathbb{E}[Y \mid X = x] = \int y\, f(y \mid x)\,dy$ is a number for each fixed $x$. Letting $x$ vary, $\mathbb{E}[Y \mid X]$ is itself a **random variable** — a function of $X$. This is the key conceptual shift of the chapter.

**Law of iterated (total) expectation.**
$$\mathbb{E}\big[\mathbb{E}[Y \mid X]\big] = \mathbb{E}[Y].$$
Averaging the conditional mean over the distribution of $X$ recovers the unconditional mean. Practically: condition on whatever makes the inner expectation easy, then average out.

**Law of total variance.**
$$\operatorname{Var}(Y) = \underbrace{\mathbb{E}\big[\operatorname{Var}(Y \mid X)\big]}_{\text{within-group}} + \underbrace{\operatorname{Var}\big(\mathbb{E}[Y \mid X]\big)}_{\text{between-group}}.$$
Total variability decomposes into the average of conditional variances plus the variance of the conditional means.

**Moment generating functions.** The MGF is $M_X(t) = \mathbb{E}[e^{tX}]$, defined where the expectation is finite. Three uses:
- **Generate moments:** $M_X^{(k)}(0) = \mathbb{E}[X^k]$, so differentiating and setting $t=0$ peels off moments.
- **Uniqueness:** if $M_X(t) = M_Y(t)$ on an open interval around $0$, then $X$ and $Y$ have the *same distribution* — MGFs determine distributions.
- **Sums of independents:** if $X_1,\dots,X_n$ are independent and $S = \sum_i X_i$, then $M_S(t) = \prod_i M_{X_i}(t)$, turning convolutions into products.

## Quiz

**1.** What does it mean to say the Cauchy distribution "has no mean," and why does this happen?

> [!example]- Show answer
> The expectation $\mathbb{E}[X] = \int x f(x)\,dx$ is only defined when $\int |x| f(x)\,dx < \infty$. For the Cauchy density $f(x) = \frac{1}{\pi(1+x^2)}$, the integrand $|x|/(1+x^2)$ behaves like $1/|x|$ for large $|x|$, so the integral diverges. The mean is therefore *undefined*, not zero, even though the density is symmetric about $0$. As a consequence, sample averages of Cauchy data do not converge to any limit — the law of large numbers fails because its hypothesis ($\mathbb{E}|X|<\infty$) is violated.

**2.** State the rule of the lazy statistician and explain why it is convenient.

> [!example]- Show answer
> It says $\mathbb{E}[g(X)] = \int g(x) f_X(x)\,dx$ — you compute the expectation of $g(X)$ by integrating $g$ against the density of $X$, with no need to first derive the density of the new variable $Y = g(X)$. The convenience is exactly that: finding the distribution of a transformation can be hard (Jacobians, non-monotone $g$), but its expectation is a single integral against the *known* density. The same idea extends to functions of several variables, $\mathbb{E}[g(X,Y)] = \iint g(x,y) f(x,y)\,dx\,dy$.

**3.** Why does linearity of expectation, $\mathbb{E}[X+Y] = \mathbb{E}[X] + \mathbb{E}[Y]$, hold even when $X$ and $Y$ are dependent?

> [!example]- Show answer
> Linearity follows directly from the linearity of sums and integrals applied to the *joint* distribution: $\mathbb{E}[X+Y] = \iint (x+y) f(x,y)\,dx\,dy = \iint x f\,dx\,dy + \iint y f\,dx\,dy = \mathbb{E}[X] + \mathbb{E}[Y]$. Nowhere does this require $f(x,y)$ to factor as $f_X(x)f_Y(y)$. Independence is needed for *multiplicative* facts like $\mathbb{E}[XY] = \mathbb{E}[X]\mathbb{E}[Y]$, not for additive ones. This is what makes linearity so powerful: it applies to highly correlated sums (e.g. counting via indicator variables) with zero extra assumptions.

**4.** Give the two formulas for variance and explain when you would use the second.

> [!example]- Show answer
> By definition $\operatorname{Var}(X) = \mathbb{E}[(X-\mu)^2]$, the mean squared deviation from the mean. Expanding the square and using linearity gives the computational form $\operatorname{Var}(X) = \mathbb{E}[X^2] - (\mathbb{E}[X])^2$. The second form is what you use in practice: you compute the first two raw moments $\mathbb{E}[X]$ and $\mathbb{E}[X^2]$ from the density and subtract. It avoids re-centering the variable and is the standard route for distributions whose moments have closed forms.

**5.** How do $\operatorname{Var}(aX+b)$ and $\operatorname{sd}(aX+b)$ depend on $a$ and $b$?

> [!example]- Show answer
> Variance ignores the additive shift and squares the multiplicative scale: $\operatorname{Var}(aX+b) = a^2\operatorname{Var}(X)$. The constant $b$ moves the whole distribution but does not change its spread, so it drops out. The standard deviation is $\operatorname{sd}(aX+b) = |a|\,\operatorname{sd}(X)$ — note the absolute value, since standard deviation must be nonnegative even if $a<0$. This is exactly why standardizing via $Z = (X-\mu)/\sigma$ yields a variable with mean $0$ and variance $1$.

**6.** Two random variables have correlation $\rho = 0$. Can you conclude they are independent? Justify.

> [!example]- Show answer
> No. Zero correlation only means zero *linear* association: $\operatorname{Cov}(X,Y) = 0$. Independence is strictly stronger and implies zero covariance, but not the reverse. The standard counterexample is $X \sim N(0,1)$ and $Y = X^2$. By symmetry $\mathbb{E}[X] = \mathbb{E}[X^3] = 0$, so $\operatorname{Cov}(X,Y) = \mathbb{E}[X^3] - \mathbb{E}[X]\mathbb{E}[X^2] = 0$, yet $Y$ is completely determined by $X$. The lone exception: for *jointly normal* variables, zero correlation does imply independence.

**7.** Derive $\operatorname{Var}(X+Y)$ in general and state when the cross term disappears.

> [!example]- Show answer
> Writing $\mu_X, \mu_Y$ for the means, $\operatorname{Var}(X+Y) = \mathbb{E}[((X-\mu_X)+(Y-\mu_Y))^2]$. Expanding the square gives $\mathbb{E}[(X-\mu_X)^2] + \mathbb{E}[(Y-\mu_Y)^2] + 2\mathbb{E}[(X-\mu_X)(Y-\mu_Y)]$, i.e. $\operatorname{Var}(X) + \operatorname{Var}(Y) + 2\operatorname{Cov}(X,Y)$. The cross term $2\operatorname{Cov}(X,Y)$ vanishes precisely when $X$ and $Y$ are uncorrelated — which independence guarantees but does not require. So for independent or merely uncorrelated variables, variances simply add.

**8.** For iid $X_1,\dots,X_n$ with mean $\mu$ and variance $\sigma^2$, find $\mathbb{E}[\bar X_n]$ and $\operatorname{Var}(\bar X_n)$. What is the practical message?

> [!example]- Show answer
> By linearity, $\mathbb{E}[\bar X_n] = \frac1n \sum_i \mathbb{E}[X_i] = \frac1n (n\mu) = \mu$, so the sample mean is unbiased. Because the $X_i$ are independent (hence uncorrelated), $\operatorname{Var}(\bar X_n) = \frac{1}{n^2}\sum_i \operatorname{Var}(X_i) = \frac{1}{n^2}(n\sigma^2) = \frac{\sigma^2}{n}$. The message: the sample mean is centered on the truth, and its spread shrinks like $1/n$ (its standard error like $1/\sqrt{n}$). More data means a tighter estimate — the quantitative heart of the law of large numbers.

**9.** Explain why $\mathbb{E}[Y \mid X]$ is a random variable and state the law of iterated expectation.

> [!example]- Show answer
> For each fixed value $x$, $\mathbb{E}[Y \mid X=x]$ is an ordinary number — the mean of $Y$ within that slice. But once we let the conditioning value be the random $X$ itself, the result $\mathbb{E}[Y \mid X]$ is a *function of $X$*, and a function of a random variable is a random variable; it has its own distribution, mean, and variance. The law of iterated (total) expectation says $\mathbb{E}[\mathbb{E}[Y \mid X]] = \mathbb{E}[Y]$: averaging the conditional means over $X$ recovers the overall mean. This licenses the tactic of conditioning on a convenient variable, then averaging it out.

**10.** State the law of total variance and interpret its two terms.

> [!example]- Show answer
> The law is $\operatorname{Var}(Y) = \mathbb{E}[\operatorname{Var}(Y \mid X)] + \operatorname{Var}(\mathbb{E}[Y \mid X])$. The first term, the expected conditional variance, is the *within-group* variability — how much $Y$ scatters around its mean once $X$ is known, averaged over $X$. The second term is the *between-group* variability — how much the conditional mean of $Y$ itself moves as $X$ changes. Their sum is the total variance. This decomposition is the foundation of ANOVA, mixed-effects models, and explained-vs-residual variance reasoning.

**11.** *(Applied)* A factory's daily output of defects $Y$ given a machine's hidden setting $X$ is Poisson with mean $X$, where $X \sim \text{Gamma}(\alpha, \beta)$ across machines. Use the iterated laws to find $\mathbb{E}[Y]$ and $\operatorname{Var}(Y)$ without deriving the marginal of $Y$.

> [!example]- Show answer
> For a Poisson$(X)$, both conditional mean and conditional variance equal $X$: $\mathbb{E}[Y \mid X] = X$ and $\operatorname{Var}(Y \mid X) = X$. By iterated expectation, $\mathbb{E}[Y] = \mathbb{E}[\mathbb{E}[Y\mid X]] = \mathbb{E}[X]$. By total variance, $\operatorname{Var}(Y) = \mathbb{E}[\operatorname{Var}(Y\mid X)] + \operatorname{Var}(\mathbb{E}[Y\mid X]) = \mathbb{E}[X] + \operatorname{Var}(X)$. Plugging in the Gamma moments $\mathbb{E}[X] = \alpha\beta$ and $\operatorname{Var}(X) = \alpha\beta^2$ gives $\mathbb{E}[Y] = \alpha\beta$ and $\operatorname{Var}(Y) = \alpha\beta + \alpha\beta^2$. Note $\operatorname{Var}(Y) > \mathbb{E}[Y]$ — the mixing inflates variance beyond the Poisson baseline (overdispersion).

**12.** *(Applied)* You have independent $X \sim N(\mu_1,\sigma_1^2)$ and $Y \sim N(\mu_2,\sigma_2^2)$ and want the distribution of $X+Y$. Show how MGFs deliver the answer and why the argument needs independence.

> [!example]- Show answer
> The normal MGF is $M_X(t) = \exp(\mu_1 t + \tfrac12 \sigma_1^2 t^2)$, similarly for $Y$. For *independent* variables, the MGF of the sum is the product of MGFs: $M_{X+Y}(t) = M_X(t)M_Y(t) = \exp((\mu_1+\mu_2)t + \tfrac12(\sigma_1^2+\sigma_2^2)t^2)$. That is exactly the MGF of an $N(\mu_1+\mu_2,\, \sigma_1^2+\sigma_2^2)$ variable, and by the uniqueness property the sum *is* that normal. Independence is essential: $\mathbb{E}[e^{t(X+Y)}] = \mathbb{E}[e^{tX}e^{tY}]$ only factors into $\mathbb{E}[e^{tX}]\mathbb{E}[e^{tY}]$ when $X$ and $Y$ are independent. Without it, the product rule fails.

## Deeper understanding (expansion)

> [!info]+ 💡 Indicator variables make linearity a superpower
>
> The fact that linearity of expectation needs no independence is not a technicality — it is a problem-solving engine. To count occurrences of an event across many (possibly dependent) trials, write the count as a sum of indicator variables $X = \sum_i \mathbf{1}_{A_i}$, where $\mathbf{1}_{A_i} = 1$ if event $A_i$ occurs. Then $\mathbb{E}[X] = \sum_i \mathbb{E}[\mathbf{1}_{A_i}] = \sum_i \mathbb{P}(A_i)$, regardless of how the events overlap or correlate. This computes means of complicated quantities (matches in the matching problem, fixed points of a random permutation, edges in a random graph) trivially. The contrast with variance is instructive: $\operatorname{Var}(\sum_i \mathbf{1}_{A_i})$ does require the pairwise covariances, because the cross terms no longer vanish when the indicators are dependent.

> [!info]+ 💡 MGFs as a distributional fingerprint
>
> The moment generating function does three jobs that look unrelated but share one root: $M_X(t) = \mathbb{E}[e^{tX}]$ encodes the whole distribution in one function. Differentiating $k$ times and evaluating at $0$ pulls out $\mathbb{E}[X^k]$ — because the Taylor expansion $e^{tX} = \sum_k \frac{(tX)^k}{k!}$ has the moments as coefficients. Uniqueness holds because two distributions with the same MGF on an interval around $0$ must agree everywhere — the MGF is a fingerprint. And the product rule for sums of independents converts the awkward convolution of densities into simple multiplication, which is why MGFs are the cleanest route to results like "sum of independent Poissons is Poisson" or "sum of independent normals is normal." A caveat: not every distribution has an MGF (the integral may diverge for all $t \ne 0$, as for heavy-tailed laws), which is why the characteristic function $\mathbb{E}[e^{itX}]$ — always defined — is the more general tool.

> [!info]+ 💡 Total variance and the bias–variance worldview
>
> The law of total variance, $\operatorname{Var}(Y) = \mathbb{E}[\operatorname{Var}(Y\mid X)] + \operatorname{Var}(\mathbb{E}[Y\mid X])$, is the probabilistic skeleton behind several later ideas. In prediction, the best predictor of $Y$ from $X$ in mean-squared-error terms is the conditional mean $\mathbb{E}[Y\mid X]$, and its variance is the "explained" piece; the leftover $\mathbb{E}[\operatorname{Var}(Y\mid X)]$ is irreducible noise no function of $X$ can remove. In hierarchical and random-effects models, the two terms separate variability *between* groups from variability *within* groups. The same additive decomposition reappears as the bias–variance tradeoff in statistical decision theory, where total expected loss splits into structurally distinct components you manage independently.

## Connections

- [[02-random-variables]] — expectation is defined directly from the mass/density functions and joint distributions introduced there; transformations of random variables feed into the rule of the lazy statistician. ← This chapter is the *quantitative* sequel: Chapter 2 gives the objects, Chapter 3 gives their summaries.
- [[04-inequalities]] → Markov and Chebyshev inequalities bound tail probabilities using exactly the moments $\mathbb{E}[X]$ and $\operatorname{Var}(X)$ defined here; Jensen's inequality concerns $\mathbb{E}[g(X)]$ for convex $g$. Expectation and variance are the *inputs* to every inequality in the next chapter.
- [[05-convergence-of-random-variables]] → The mean and variance of $\bar X_n$ ($\mathbb{E}[\bar X_n] = \mu$, $\operatorname{Var}(\bar X_n) = \sigma^2/n$) drive both the weak law of large numbers and the central limit theorem; MGF uniqueness is one route to proving the CLT.
- [[09-parametric-inference]] → Method-of-moments estimators equate sample moments to the expectations $\mathbb{E}[X^k]$ computed here; unbiasedness and the standard error $\sigma/\sqrt n$ of $\bar X_n$ underpin estimator evaluation.
- [[12-statistical-decision-theory]] → Risk is an expected loss $\mathbb{E}[L(\theta,\hat\theta)]$, and the bias–variance decomposition of mean squared error is a direct application of the variance and expectation algebra (especially the total-variance idea) developed in this chapter.
