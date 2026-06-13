---
tags: [random-variables, cdf, pdf, pmf, distributions, transformations, independence, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 2 — Random Variables

> [!abstract]+ Chapter at a glance
>
> A random variable is the bridge between the abstract sample space of Chapter 1 and the numbers we actually compute with. Formally it is a map $X:\Omega\to\mathbb{R}$ that assigns a real number to each outcome. Once we have a random variable, its entire probabilistic behavior is captured by a single function — the cumulative distribution function (CDF) $F_X$ — from which the probability mass function (discrete case) or probability density function (continuous case) can be recovered. This chapter builds the working vocabulary: the CDF and its three defining properties; the standard families of discrete and continuous distributions; joint, marginal, and conditional distributions for several variables at once; independence and IID samples; and finally how distributions change under transformations via the CDF method and the Jacobian formula. Everything later in the book — expectation, inequalities, convergence, inference — is phrased in terms of these objects, so this is the chapter to internalize cold.

## Core concepts

**Random variable.** A random variable is a measurable map $X:\Omega\to\mathbb{R}$ assigning a real number $X(\omega)$ to each outcome $\omega$ in the sample space. "Measurable" means that for every $x$ the set $\{\omega : X(\omega)\le x\}$ is an event (has a well-defined probability). We write $P(X\in A)=P(\{\omega: X(\omega)\in A\})$ — probabilities of statements about $X$ are really probabilities of the underlying events.

**Cumulative distribution function (CDF).** The CDF is $F_X(x)=P(X\le x)$, defined for all real $x$. The CDF contains all the information about the distribution of $X$: two random variables with the same CDF have the same distribution. A function $F$ is a valid CDF if and only if it satisfies three properties:
- **Nondecreasing:** $x_1<x_2 \Rightarrow F(x_1)\le F(x_2)$.
- **Normalized limits:** $\lim_{x\to-\infty}F(x)=0$ and $\lim_{x\to+\infty}F(x)=1$.
- **Right-continuous:** $F(x)=\lim_{y\downarrow x}F(y)$ for every $x$ (the $\le$ in $P(X\le x)$ makes it right- not left-continuous).

Useful identities: $P(a<X\le b)=F(b)-F(a)$, $P(X>x)=1-F(x)$, and $P(X=x)=F(x)-F(x^-)$ (the jump at $x$), where $F(x^-)=\lim_{y\uparrow x}F(y)$.

**Discrete random variables and the PMF.** $X$ is discrete if it takes values in a countable set. Its **probability mass function** is $f_X(x)=P(X=x)$, satisfying $f_X(x)\ge 0$ and $\sum_x f_X(x)=1$. The CDF is a step function: $F_X(x)=\sum_{t\le x}f_X(t)$, with jumps of size $f_X(t)$ at each mass point.

**Continuous random variables and the PDF.** $X$ is continuous if there is a function $f_X\ge 0$, the **probability density function**, such that $F_X(x)=\int_{-\infty}^{x}f_X(t)\,dt$ and $\int_{-\infty}^{\infty}f_X(x)\,dx=1$. Then $P(a<X<b)=\int_a^b f_X(x)\,dx$, and where $F_X$ is differentiable $f_X(x)=F_X'(x)$. Two key facts: $P(X=x)=0$ for every single point, so $P(a<X<b)=P(a\le X\le b)$; and the density is **not a probability** — $f_X(x)$ can exceed 1 (e.g. a Uniform$(0,\tfrac12)$ has density 2). Only its integral over an interval is a probability.

**Quantile / inverse-CDF function.** For $p\in(0,1)$ the $p$-th quantile is $F^{-1}(p)=\inf\{x: F(x)\ge p\}$, the generalized inverse that works even when $F$ has flats or jumps. The median is $F^{-1}(1/2)$; the first and third quartiles are $F^{-1}(1/4)$ and $F^{-1}(3/4)$. The quantile function inverts the CDF and underlies inverse-transform sampling.

**Key discrete distributions.**
- **Point mass at $a$:** $X=a$ with probability 1; $F(x)=0$ for $x<a$ and $1$ for $x\ge a$.
- **Bernoulli$(p)$:** $X\in\{0,1\}$, $f(x)=p^x(1-p)^{1-x}$; a single 0/1 trial.
- **Binomial$(n,p)$:** number of successes in $n$ independent Bernoulli$(p)$ trials, $f(x)=\binom{n}{x}p^x(1-p)^{n-x}$ for $x=0,\dots,n$.
- **Geometric$(p)$:** $f(x)=p(1-p)^{x-1}$, $x=1,2,\dots$; number of trials until the first success (memoryless).
- **Poisson$(\lambda)$:** $f(x)=\dfrac{e^{-\lambda}\lambda^x}{x!}$, $x=0,1,2,\dots$; counts of rare events, the $n\to\infty,\ np\to\lambda$ limit of the Binomial.
- **Discrete Uniform** on $\{1,\dots,k\}$: $f(x)=1/k$ for each value.

**Key continuous distributions.**
- **Uniform$(a,b)$:** $f(x)=\dfrac{1}{b-a}$ on $[a,b]$; flat density.
- **Normal/Gaussian$(\mu,\sigma^2)$:** $f(x)=\dfrac{1}{\sigma\sqrt{2\pi}}\exp\!\left(-\dfrac{(x-\mu)^2}{2\sigma^2}\right)$. If $X\sim N(\mu,\sigma^2)$ then $Z=(X-\mu)/\sigma\sim N(0,1)$ is **standard normal**, whose CDF is denoted $\Phi$. Standardization lets every normal probability be read off $\Phi$.
- **Exponential$(\beta)$:** $f(x)=\dfrac{1}{\beta}e^{-x/\beta}$ for $x>0$; waiting time of a Poisson process, memoryless, a special Gamma.
- **Gamma$(\alpha,\beta)$:** $f(x)=\dfrac{1}{\beta^\alpha\Gamma(\alpha)}x^{\alpha-1}e^{-x/\beta}$, $x>0$; sums of independent Exponentials, shape $\alpha$ and scale $\beta$.
- **Beta$(\alpha,\beta)$:** $f(x)=\dfrac{\Gamma(\alpha+\beta)}{\Gamma(\alpha)\Gamma(\beta)}x^{\alpha-1}(1-x)^{\beta-1}$ on $[0,1]$; flexible distribution over a probability/proportion.
- **$t$-distribution** ($\nu$ degrees of freedom): bell-shaped, heavier tails than the normal; approaches $N(0,1)$ as $\nu\to\infty$. The Cauchy is the $t$ with $\nu=1$.
- **Cauchy:** $f(x)=\dfrac{1}{\pi(1+x^2)}$; symmetric but so heavy-tailed that it has no mean.
- **Chi-square$(p)$:** distribution of $\sum_{i=1}^{p}Z_i^2$ for independent standard normals; a Gamma$(p/2,2)$. Central to inference.

**Bivariate and joint distributions.** For two random variables, the **joint CDF** is $F_{X,Y}(x,y)=P(X\le x, Y\le y)$. In the discrete case the **joint PMF** is $f(x,y)=P(X=x,Y=y)$; in the continuous case the **joint PDF** $f(x,y)\ge 0$ satisfies $P((X,Y)\in A)=\iint_A f(x,y)\,dx\,dy$ and integrates to 1 over the plane.

**Marginal distributions.** Recover the distribution of one variable by summing/integrating out the other: $f_X(x)=\sum_y f(x,y)$ (discrete) or $f_X(x)=\int f(x,y)\,dy$ (continuous). Marginals lose all information about how $X$ and $Y$ co-vary.

**Conditional distributions.** The conditional density of $Y$ given $X=x$ is
$$f_{Y\mid X}(y\mid x)=\frac{f_{X,Y}(x,y)}{f_X(x)}\qquad\text{(for }f_X(x)>0\text{)}.$$
For fixed $x$ this is a genuine density in $y$ (nonnegative, integrates to 1). It answers "given that $X=x$, how is $Y$ distributed?" — and is the foundation for regression and Bayesian updating.

**Independence and IID.** $X$ and $Y$ are **independent** iff the joint factorizes into the product of marginals for all $x,y$:
$$f_{X,Y}(x,y)=f_X(x)\,f_Y(y)\quad\Longleftrightarrow\quad F_{X,Y}(x,y)=F_X(x)F_Y(y).$$
Equivalently $f_{Y\mid X}(y\mid x)=f_Y(y)$ — conditioning on $X$ tells you nothing about $Y$. Variables $X_1,\dots,X_n$ are **IID** (an "IID sample" or "random sample" of size $n$) if they are independent and share a common distribution $F$; this is the workhorse assumption for the rest of the book.

**Multivariate case and the multivariate normal.** All of the above extends to a random vector $X=(X_1,\dots,X_n)$ with joint CDF $F(x_1,\dots,x_n)$. A first key multivariate model is the **multivariate normal**: $X\sim N(\mu,\Sigma)$ with mean vector $\mu$ and covariance matrix $\Sigma$, density
$$f(x)=\frac{1}{(2\pi)^{n/2}|\Sigma|^{1/2}}\exp\!\left(-\tfrac{1}{2}(x-\mu)^\top\Sigma^{-1}(x-\mu)\right),$$
which couples the components through off-diagonal covariances.

**Transformations — CDF method.** To find the distribution of $Y=g(X)$, first compute the CDF directly: $F_Y(y)=P(g(X)\le y)=P(X\in\{x:g(x)\le y\})$, then differentiate to get $f_Y$. This always works and handles non-monotone $g$ by carefully tracking the preimage.

**Transformations — change of variables / Jacobian.** If $g$ is monotone (one-to-one) with inverse $x=g^{-1}(y)=h(y)$, then
$$f_Y(y)=f_X(h(y))\left|\frac{dh(y)}{dy}\right|.$$
For a one-to-one bivariate transform $(U,V)=g(X,Y)$ with inverse $(x,y)=h(u,v)$, $f_{U,V}(u,v)=f_{X,Y}(h(u,v))\,|J|$, where $J$ is the Jacobian determinant $\det\!\big(\partial(x,y)/\partial(u,v)\big)$. The absolute value of the Jacobian rescales density to keep probability mass conserved.

## Quiz

**1.** State the three properties that characterize a valid cumulative distribution function, and explain why the CDF is right-continuous rather than left-continuous.

> [!example]- Show answer
> A function $F$ is a CDF iff it is (i) nondecreasing, (ii) has limits $\lim_{x\to-\infty}F(x)=0$ and $\lim_{x\to+\infty}F(x)=1$, and (iii) is right-continuous, $F(x)=\lim_{y\downarrow x}F(y)$. Right-continuity comes directly from the definition $F(x)=P(X\le x)$ using a *closed* inequality: as $y$ decreases to $x$, the events $\{X\le y\}$ shrink down to $\{X\le x\}$, so $F(y)\downarrow F(x)$. A jump in $F$ at $x$ has size $P(X=x)=F(x)-F(x^-)$, and the function takes the *upper* value at the jump point. These three properties are not just necessary but sufficient: any such $F$ is the CDF of some random variable.

**2.** Why can a probability density function take values greater than 1, while a probability mass function cannot? Give a concrete example.

> [!example]- Show answer
> A PMF value $f(x)=P(X=x)$ *is* a probability, so it must lie in $[0,1]$ and the values sum to 1. A PDF value $f(x)$ is **not** a probability — it is a density (probability per unit length). Only the integral $\int_a^b f(x)\,dx$ is a probability, so individual density values are unconstrained above as long as the total integral is 1. For example, $X\sim\text{Uniform}(0,\tfrac12)$ has $f(x)=2$ on $(0,\tfrac12)$, which exceeds 1, yet $\int_0^{1/2}2\,dx=1$. The density can even be unbounded near a point and still be valid.

**3.** For a continuous random variable, what is $P(X=x)$ for any fixed $x$, and what consequence does this have for interval probabilities?

> [!example]- Show answer
> For a continuous random variable $P(X=x)=0$ for every single point $x$, because the CDF $F$ is continuous (no jumps) and $P(X=x)=F(x)-F(x^-)=0$. The consequence is that endpoints don't matter: $P(a<X<b)=P(a\le X\le b)=P(a\le X<b)=\int_a^b f(x)\,dx$. This is a sharp contrast with the discrete case, where individual points can carry positive mass. It does **not** mean the event $\{X=x\}$ is impossible — just that it has probability zero.

**4.** How do you recover the marginal density $f_X$ from a joint density $f_{X,Y}$, and what information is lost in doing so?

> [!example]- Show answer
> You integrate (or, in the discrete case, sum) out the other variable: $f_X(x)=\int_{-\infty}^{\infty} f_{X,Y}(x,y)\,dy$, and similarly $f_Y(y)=\int f_{X,Y}(x,y)\,dx$. The marginal is the distribution of $X$ alone, ignoring $Y$. What is lost is all information about the *dependence* between $X$ and $Y$: many different joint distributions can share the same pair of marginals. You cannot reconstruct the joint from the marginals unless you additionally assume independence, in which case $f_{X,Y}=f_X f_Y$.

**5.** Define the conditional density $f_{Y\mid X}(y\mid x)$ and explain in what sense it is a proper density.

> [!example]- Show answer
> The conditional density is $f_{Y\mid X}(y\mid x)=f_{X,Y}(x,y)/f_X(x)$, defined wherever $f_X(x)>0$. For a *fixed* value $x$, it is a proper density in the variable $y$: it is nonnegative (a ratio of nonnegatives) and integrates to 1, since $\int f_{Y\mid X}(y\mid x)\,dy=\int f_{X,Y}(x,y)\,dy / f_X(x)=f_X(x)/f_X(x)=1$. It describes the distribution of $Y$ once we have learned $X=x$. Note it is a density in $y$ but only a function (not a density) in $x$.

**6.** State the equivalent characterizations of independence for two random variables. Why is independence in terms of the joint distribution, not the marginals?

> [!example]- Show answer
> $X$ and $Y$ are independent iff any of these hold for all $x,y$: the joint density factorizes, $f_{X,Y}(x,y)=f_X(x)f_Y(y)$; the joint CDF factorizes, $F_{X,Y}(x,y)=F_X(x)F_Y(y)$; or the conditional equals the marginal, $f_{Y\mid X}(y\mid x)=f_Y(y)$. Independence is a property of the *joint* distribution because it is a statement about how the two variables behave *together* — whether knowing one shifts the distribution of the other. The marginals alone are silent about this; you can have the same marginals with or without independence.

**7.** What is the standardization of a normal random variable, and why is it useful? If $X\sim N(\mu,\sigma^2)$, express $P(X\le x)$ using the standard normal CDF $\Phi$.

> [!example]- Show answer
> Standardization replaces $X\sim N(\mu,\sigma^2)$ with $Z=(X-\mu)/\sigma$, which is standard normal $N(0,1)$. This is useful because every normal probability reduces to one about $Z$, so a single function — the standard normal CDF $\Phi$ — handles all normal distributions. Concretely, $P(X\le x)=P\!\big(Z\le (x-\mu)/\sigma\big)=\Phi\!\big((x-\mu)/\sigma\big)$. Likewise quantiles transform back via $x=\mu+\sigma z$. This is why classical tables (and software) only need the single $\Phi$ function.

**8.** Describe the CDF method and the change-of-variables (Jacobian) method for finding the distribution of $Y=g(X)$. When does each apply?

> [!example]- Show answer
> The **CDF method** writes $F_Y(y)=P(g(X)\le y)=P(X\in\{x:g(x)\le y\})$ directly in terms of $F_X$, then differentiates to get $f_Y=F_Y'$. It always works, including when $g$ is non-monotone, because you explicitly track the preimage. The **change-of-variables / Jacobian method** applies when $g$ is monotone (one-to-one) with differentiable inverse $h=g^{-1}$: then $f_Y(y)=f_X(h(y))\,|h'(y)|$. The Jacobian factor $|h'(y)|$ rescales density so total probability is conserved. For non-monotone $g$ you either fall back to the CDF method or sum the Jacobian contributions over all branches of the inverse.

**9.** The Poisson distribution arises as a limit of the Binomial. State the Poisson PMF and describe informally the regime in which Binomial$(n,p)\approx$ Poisson$(\lambda)$.

> [!example]- Show answer
> The Poisson$(\lambda)$ PMF is $f(x)=e^{-\lambda}\lambda^x/x!$ for $x=0,1,2,\dots$, with $\lambda>0$. It approximates Binomial$(n,p)$ in the regime of many trials each with small success probability: $n\to\infty$ and $p\to 0$ with the product $np\to\lambda$ held fixed. Intuitively, the Poisson counts rare events over many opportunities — e.g. the number of typos on a page, calls to a switchboard, or radioactive decays in an interval. The single parameter $\lambda$ is both the rate and (as later chapters show) the mean and variance.

**10.** *(Applied)* Let $X\sim\text{Uniform}(0,1)$ and define $Y=-\log X$ (natural log). Use the CDF method to find the density of $Y$ and identify the distribution.

> [!example]- Show answer
> For $y>0$, $F_Y(y)=P(-\log X\le y)=P(\log X\ge -y)=P(X\ge e^{-y})$. Since $X\sim\text{Uniform}(0,1)$ with $F_X(x)=x$ on $[0,1]$, this is $1-F_X(e^{-y})=1-e^{-y}$. Differentiating, $f_Y(y)=e^{-y}$ for $y>0$ (and 0 otherwise). That is the **Exponential** distribution with mean (scale) $\beta=1$, i.e. Exponential$(1)$. This is the inverse-transform construction: applying $-\log$ to a uniform yields a standard exponential, a standard way to simulate exponential waiting times.

## Deeper understanding (expansion)

> [!info]+ 💡 The CDF is the universal currency
>
> It is tempting to think of "the PMF" or "the PDF" as the fundamental object, but Wasserman builds everything on the CDF $F(x)=P(X\le x)$. The reason is unification: the CDF exists for *every* random variable — discrete, continuous, or a mixture (e.g. an insurance loss that is 0 with positive probability but otherwise continuous). Jumps in $F$ encode point masses; smooth stretches encode density. Equality of CDFs *is* the definition of "same distribution." This is also why the quantile function $F^{-1}(p)=\inf\{x:F(x)\ge x\}$ is defined as a generalized inverse rather than a literal inverse: it must cope with flat regions (gaps in the support) and jumps (atoms). When you later meet empirical CDFs, convergence in distribution, and the probability integral transform, you are repeatedly exploiting that the CDF is the one representation common to all cases.

> [!info]+ 💡 Independence is stronger than "uncorrelated," and it lives in the joint
>
> A frequent confusion is to treat independence as a property you can check from summaries of $X$ and $Y$ separately. It is not: independence is the statement that the *joint* equals the *product of marginals* at every point, $f_{X,Y}=f_Xf_Y$. Two variables can have identical marginals yet be wildly dependent — picture mass smeared along a diagonal versus spread uniformly over a square; both can have uniform marginals. Independence also implies (but is not implied by) zero covariance, a distinction that becomes sharp in later chapters: uncorrelated does not mean independent except in special cases like the joint normal. The practical upshot is that the IID assumption — independent *and* identically distributed — is a strong modeling claim about the joint law of the whole sample, and most of statistical inference quietly leans on it.

> [!info]+ 💡 Why the Jacobian shows up in transformations
>
> When you push a random variable through a function $Y=g(X)$, probability mass must be conserved but the *coordinate* stretches or compresses. The density $f_Y(y)=f_X(h(y))\,|h'(y)|$ pairs two effects: $f_X(h(y))$ asks "how much mass was at the source point," and $|h'(y)|$ corrects for how the transform stretches an infinitesimal interval $dy$ back to $dx=|h'(y)|\,dy$. The absolute value matters because density is nonnegative even when $g$ is decreasing. In the bivariate (and higher) case the single derivative becomes the Jacobian *determinant*, measuring how the transform scales infinitesimal *area* (or volume). This is the same conservation-of-mass idea that underlies the multivariate normal density's $|\Sigma|^{1/2}$ factor and the change-of-variables formula throughout statistics — getting the Jacobian wrong is one of the most common sources of error in derivations.

## Connections

- [[01-probability]] ← Chapter 1 gave us probability measures on a sample space $\Omega$; a random variable $X:\Omega\to\mathbb{R}$ is exactly the device that transports those probabilities onto the real line, and $P(X\in A)$ is shorthand for the measure of the corresponding event.
- [[03-expectation]] → Once distributions are defined here, Chapter 3 builds expectation $E[X]=\int x\,dF(x)$, variance, covariance, and conditional expectation directly on top of the PMFs, PDFs, and joint/conditional densities introduced in this chapter.
- [[04-inequalities]] → Markov, Chebyshev, and Hoeffding inequalities bound tail probabilities $P(X\ge t)$ — statements about the CDF and density objects defined here — and rely on the moments built in Chapter 3.
- [[05-convergence-of-random-variables]] → Convergence in distribution is defined as pointwise convergence of CDFs at continuity points, so the CDF machinery of this chapter is the literal stage on which the Law of Large Numbers and Central Limit Theorem are stated.
- [[09-parametric-inference]] → The named families here (Bernoulli, Binomial, Poisson, Normal, Gamma, Beta, …) become the *models* whose parameters are estimated; the IID-sample notion defined in this chapter is the standing assumption for likelihood-based inference.
- [[14-multivariate-models]] → The joint, marginal, and conditional distributions and the first look at the multivariate normal $N(\mu,\Sigma)$ here are expanded into the full treatment of multivariate models and dependence structure.
