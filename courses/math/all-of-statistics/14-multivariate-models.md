---
tags: [multivariate-normal, covariance-matrix, random-vectors, multinomial, mle, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 14 — Multivariate Models

> [!abstract]+ Chapter at a glance
>
> This chapter lifts the machinery of single random variables into vectors. The two summaries of a single variable — its mean and its variance — become a **mean vector** $\mu$ and a **covariance matrix** $\Sigma$, and the central fact is that $\Sigma$ transforms *quadratically* under linear maps: $\text{Cov}(AX) = A\Sigma A^T$. Two distributions dominate the chapter. The **multivariate normal** $N(\mu,\Sigma)$ is the multivariate workhorse precisely because it is closed under almost everything — marginals, conditionals, and linear combinations all stay normal — and because it is the one family where *uncorrelated implies independent*. The **multinomial** is the categorical-data backbone: a vector of counts over $k$ categories whose MLE is just the observed proportions, and whose large-sample behavior powers the chi-square tests of later chapters. Together they give you the geometry (elliptical contours), the algebra (matrix variances), and the inference (MLEs and their asymptotics) for working with several variables at once.

## Core concepts

**Random vectors and the mean vector.** A random vector $X = (X_1,\dots,X_d)^T$ collects $d$ random variables. Its mean is taken componentwise:
$$
\mu = E[X] = \big(E[X_1],\,\dots,\,E[X_d]\big)^T.
$$
Expectation is linear, so the mean vector inherits all the convenience of scalar expectation — it just stacks the individual means.

**The covariance matrix.** The spread of $X$ is captured by the $d\times d$ matrix
$$
\Sigma = \text{Cov}(X) = E\big[(X-\mu)(X-\mu)^T\big],
$$
whose $(j,k)$ entry is $\text{Cov}(X_j,X_k)$. The **diagonal** holds the variances $\text{Var}(X_j)=\Sigma_{jj}$; the **off-diagonal** entries hold the pairwise covariances. Two structural facts: $\Sigma$ is **symmetric** (since $\text{Cov}(X_j,X_k)=\text{Cov}(X_k,X_j)$) and **positive semidefinite** (for any vector $a$, $\text{Var}(a^TX) = a^T\Sigma a \ge 0$). Positive semidefiniteness is exactly the statement that no linear combination of the components can have negative variance.

**Linear transformations.** If $A$ is a fixed matrix (and $b$ a fixed vector), then for $Y = AX + b$:
$$
E[AX+b] = A\mu + b, \qquad \text{Cov}(AX+b) = A\,\Sigma\,A^T.
$$
The mean transforms *linearly*; the covariance transforms *quadratically* (one $A$ on each side). This single rule is the engine behind marginals (pick rows of $A$), sums (a row of ones), and standardization (multiply by $\Sigma^{-1/2}$). A useful special case: $\text{Var}(a^TX) = a^T\Sigma a$.

**The multivariate normal density.** We write $X \sim N(\mu,\Sigma)$ with $\Sigma$ positive definite. The density is
$$
f(x) = \frac{1}{(2\pi)^{d/2}\,|\Sigma|^{1/2}}\exp\!\left(-\tfrac{1}{2}(x-\mu)^T\Sigma^{-1}(x-\mu)\right).
$$
The exponent is a quadratic form in $x$; the determinant $|\Sigma|$ is the normalizing volume factor and $\Sigma^{-1}$ (the **precision matrix**) shapes the quadratic. When $d=1$ this collapses to the familiar univariate normal.

**Geometry: elliptical contours.** Level sets of the density are the sets where $(x-\mu)^T\Sigma^{-1}(x-\mu)$ is constant — these are **ellipsoids** centered at $\mu$. Their axes point along the eigenvectors of $\Sigma$ and their lengths scale with the square roots of the eigenvalues. The quadratic form $(X-\mu)^T\Sigma^{-1}(X-\mu)$ itself has a $\chi^2_d$ distribution, which is what makes elliptical confidence regions work.

**Closure properties of the MVN.** The MVN is beloved because it stays normal under the operations you care about:

- **Linear combinations are normal.** If $X\sim N(\mu,\Sigma)$ then $a^TX \sim N(a^T\mu,\;a^T\Sigma a)$, and more generally $AX \sim N(A\mu,\,A\Sigma A^T)$.
- **Every marginal is normal.** Any subvector of $X$ is itself MVN, with mean and covariance read off by deleting the irrelevant rows/columns of $\mu$ and $\Sigma$.
- **Every conditional is normal.** Partition $X=(X_a,X_b)$. Then $X_a \mid X_b = x_b$ is normal with a **conditional mean that is linear (affine) in $x_b$** and a **reduced conditional covariance** that does not depend on the value $x_b$:
$$
E[X_a\mid X_b=x_b] = \mu_a + \Sigma_{ab}\Sigma_{bb}^{-1}(x_b-\mu_b),
$$
$$
\text{Cov}(X_a\mid X_b) = \Sigma_{aa} - \Sigma_{ab}\Sigma_{bb}^{-1}\Sigma_{ba}.
$$
The conditional mean is the population regression of $X_a$ on $X_b$; the conditional covariance is *smaller* than the marginal $\Sigma_{aa}$ (conditioning removes the variation explained by $X_b$).

**Zero covariance implies independence — for the normal.** In general, $\text{Cov}(X_j,X_k)=0$ does *not* imply independence. But if $X$ is jointly MVN, then a block-diagonal $\Sigma$ (zero cross-covariances) *does* imply the corresponding blocks are independent. This is a special, defining feature of the normal — do not transplant it to other distributions.

**MLEs for the MVN.** Given i.i.d. $X_1,\dots,X_n \sim N(\mu,\Sigma)$, the maximum likelihood estimators are the natural sample analogues:
$$
\hat\mu = \bar X = \frac1n\sum_{i=1}^n X_i, \qquad
\hat\Sigma = \frac1n\sum_{i=1}^n (X_i-\bar X)(X_i-\bar X)^T.
$$
$\hat\mu$ is unbiased; the MLE $\hat\Sigma$ divides by $n$ (the unbiased sample covariance divides by $n-1$). Large-sample theory gives $\bar X \approx N(\mu,\Sigma/n)$, so $\sqrt n(\bar X - \mu)\rightsquigarrow N(0,\Sigma)$ by the multivariate CLT.

**The multinomial distribution.** Throw $n$ independent trials, each landing in one of $k$ categories with probabilities $p=(p_1,\dots,p_k)$, $\sum_j p_j=1$. The vector of counts $X=(X_1,\dots,X_k)$, $\sum_j X_j = n$, is **Multinomial**$(n,p)$ with pmf
$$
f(x) = \binom{n}{x_1\,\cdots\,x_k}\prod_{j=1}^k p_j^{x_j}.
$$
It generalizes the binomial (which is the $k=2$ case).

**Moments of the multinomial.** Each marginal count is binomial, so
$$
E[X_j] = np_j, \qquad \text{Var}(X_j) = np_j(1-p_j),
$$
$$
\text{Cov}(X_j,X_\ell) = -n\,p_j p_\ell \quad (j\ne \ell).
$$
The **negative covariance** is intuitive: the counts sum to the fixed total $n$, so more in one category means fewer available for another. The covariance matrix is therefore singular (rank $k-1$).

**MLE and asymptotics for the multinomial.** The MLE of each cell probability is the observed proportion:
$$
\hat p_j = \frac{X_j}{n}.
$$
By the CLT, $\hat p$ is asymptotically multivariate normal around $p$, and the standardized sum of squared deviations
$$
\sum_{j=1}^k \frac{(X_j - np_j)^2}{np_j} \rightsquigarrow \chi^2_{k-1}
$$
is Pearson's chi-square statistic — the workhorse for goodness-of-fit and independence tests in later chapters. The degrees of freedom are $k-1$ because the counts are constrained to sum to $n$.

## Quiz

**1.** What are the two summaries that describe a random vector, and what does each off-diagonal entry of the covariance matrix represent?

> [!example]- Show answer
> A random vector $X$ is summarized by its **mean vector** $\mu = E[X]$ (the componentwise means) and its **covariance matrix** $\Sigma = E[(X-\mu)(X-\mu)^T]$. The diagonal entries $\Sigma_{jj}$ are the variances $\text{Var}(X_j)$. The off-diagonal entry $\Sigma_{jk}$ is the covariance $\text{Cov}(X_j,X_k)$ between the $j$-th and $k$-th components, measuring how they co-vary. Together $\mu$ and $\Sigma$ are the multivariate analogues of the scalar mean and variance.

**2.** Why is the covariance matrix always symmetric and positive semidefinite?

> [!example]- Show answer
> It is **symmetric** because $\text{Cov}(X_j,X_k)=\text{Cov}(X_k,X_j)$, so $\Sigma_{jk}=\Sigma_{kj}$. It is **positive semidefinite** because for any fixed vector $a$, the scalar $a^TX$ is an ordinary random variable with $\text{Var}(a^TX)=a^T\Sigma a$, and a variance can never be negative, so $a^T\Sigma a\ge 0$ for all $a$. Positive semidefiniteness is exactly the requirement that no linear combination of the components has negative variance. (It is positive *definite* when no linear combination is degenerate/constant.)

**3.** How do the mean and covariance of $X$ change under a linear transformation $Y=AX+b$? Why is the rule for covariance "quadratic"?

> [!example]- Show answer
> The mean transforms linearly: $E[AX+b]=A\mu+b$. The covariance transforms quadratically: $\text{Cov}(AX+b)=A\Sigma A^T$ (the additive constant $b$ drops out, since shifting does not change spread). It is "quadratic" because $A$ appears twice — once on each side of $\Sigma$ — mirroring how scalar variance scales by $a^2$ under $Y=aX+b$. A handy special case is $\text{Var}(a^TX)=a^T\Sigma a$.

**4.** Write the multivariate normal density and explain the role of $|\Sigma|$ and $\Sigma^{-1}$.

> [!example]- Show answer
> For $X\sim N(\mu,\Sigma)$ in $d$ dimensions, $f(x)=(2\pi)^{-d/2}|\Sigma|^{-1/2}\exp\!\big(-\tfrac12(x-\mu)^T\Sigma^{-1}(x-\mu)\big)$. The determinant $|\Sigma|$ is the normalizing volume factor that keeps the density integrating to one (larger spread spreads probability over more volume). The inverse $\Sigma^{-1}$, the **precision matrix**, shapes the quadratic form in the exponent and controls how quickly the density falls off in each direction. The exponent is a quadratic form, which is why the level sets are ellipsoids.

**5.** State the three closure properties of the MVN under marginalization, conditioning, and linear combination.

> [!example]- Show answer
> (i) **Linear combinations stay normal**: $AX\sim N(A\mu, A\Sigma A^T)$, so in particular any single linear combination $a^TX$ is univariate normal. (ii) **Every marginal is normal**: any subvector is MVN, with mean and covariance obtained by deleting the irrelevant entries of $\mu$ and $\Sigma$. (iii) **Every conditional is normal**: $X_a\mid X_b=x_b$ is MVN with a mean affine in $x_b$ and a covariance that is reduced and free of $x_b$. These closures are why the MVN is the multivariate workhorse.

**6.** For a partitioned MVN, give the conditional mean and conditional covariance of $X_a$ given $X_b=x_b$. What is notable about each?

> [!example]- Show answer
> $E[X_a\mid X_b=x_b]=\mu_a+\Sigma_{ab}\Sigma_{bb}^{-1}(x_b-\mu_b)$ and $\text{Cov}(X_a\mid X_b)=\Sigma_{aa}-\Sigma_{ab}\Sigma_{bb}^{-1}\Sigma_{ba}$. The conditional mean is **linear (affine) in $x_b$** — it is exactly the population regression of $X_a$ on $X_b$, with $\Sigma_{ab}\Sigma_{bb}^{-1}$ playing the role of regression coefficients. The conditional covariance is **reduced** (subtracting the variation explained by $X_b$) and, remarkably, **does not depend on the observed value $x_b$**. This is the algebraic basis of Gaussian regression and Kalman filtering.

**7.** It is often said that "zero correlation does not imply independence." When *does* it, and why is that case special?

> [!example]- Show answer
> In general, two variables can have $\text{Cov}=0$ yet be dependent (covariance only measures linear association). The exception is the **jointly multivariate normal** case: if $X$ is MVN and two blocks have zero cross-covariance (block-diagonal $\Sigma$), then those blocks are genuinely **independent**. This works because the MVN density factors when $\Sigma$ is block-diagonal. It is a special property of the normal and must not be assumed for other distributions — even normal *marginals* are not enough; the variables must be *jointly* normal.

**8.** Give the MLEs of $\mu$ and $\Sigma$ for i.i.d. MVN data, and describe the large-sample behavior of $\hat\mu$.

> [!example]- Show answer
> $\hat\mu=\bar X=\frac1n\sum_i X_i$ (the sample mean vector) and $\hat\Sigma=\frac1n\sum_i(X_i-\bar X)(X_i-\bar X)^T$ (the sample covariance, dividing by $n$ for the MLE; divide by $n-1$ for the unbiased version). $\hat\mu$ is unbiased and, by the multivariate CLT, $\sqrt n(\bar X-\mu)\rightsquigarrow N(0,\Sigma)$, equivalently $\bar X\approx N(\mu,\Sigma/n)$ in large samples. This asymptotic normality underlies multivariate confidence ellipsoids.

**9.** Describe the multinomial model, give its MLE, and explain why the covariance between two different cell counts is negative.

> [!example]- Show answer
> In $n$ independent trials each lands in one of $k$ categories with probabilities $p_1,\dots,p_k$; the counts $X=(X_1,\dots,X_k)$ are Multinomial$(n,p)$ with $\sum_j X_j=n$. The MLE of each cell probability is the observed proportion $\hat p_j=X_j/n$. Each $X_j$ is marginally binomial with $E[X_j]=np_j$ and $\text{Var}(X_j)=np_j(1-p_j)$. The cross-term is $\text{Cov}(X_j,X_\ell)=-np_jp_\ell<0$ because the total is fixed at $n$: a trial counted in category $j$ cannot also be counted in $\ell$, so the counts compete for the same fixed budget, forcing negative dependence.

**10.** *(Applied)* A survey records the count of respondents choosing each of 4 product options out of $n=500$. How would you estimate the choice probabilities, attach an approximate uncertainty, and test whether the four options are equally preferred?

> [!example]- Show answer
> Treat the counts as Multinomial$(500,p)$ with $k=4$. Estimate each probability by $\hat p_j=X_j/500$. An approximate standard error for each is $\widehat{\text{se}}(\hat p_j)=\sqrt{\hat p_j(1-\hat p_j)/500}$, from the binomial marginal (remember the cells are negatively correlated if you compare them). To test "equally preferred," set the null $p_j=1/4$ for all $j$ and compute Pearson's statistic $\sum_{j=1}^4 (X_j-500\cdot\tfrac14)^2/(500\cdot\tfrac14)$, comparing it to a $\chi^2_{k-1}=\chi^2_3$ distribution; a large value rejects equal preference. This is the multinomial-to-chi-square pipeline used throughout categorical inference.

## Deeper understanding (expansion)

> [!info]+ 💡 Why the conditional covariance shrinks and ignores the conditioning value
>
> The Gaussian conditional covariance $\Sigma_{aa}-\Sigma_{ab}\Sigma_{bb}^{-1}\Sigma_{ba}$ is the **Schur complement** of $\Sigma_{bb}$ in $\Sigma$. Two facts make it special. First, it is always *no larger* than the marginal $\Sigma_{aa}$ (in the positive-semidefinite ordering): knowing $X_b$ can only reduce our uncertainty about $X_a$, never increase it. Second, it does **not** depend on the observed value $x_b$ — the spread of $X_a$ around its (shifting) conditional mean is the same whether $X_b$ landed high or low. This homoskedasticity-and-linearity package is unique to the normal and is exactly what makes Gaussian linear models, the Kalman filter, and Gaussian-process regression have closed-form updates rather than requiring numerical integration.

> [!info]+ 💡 The multinomial covariance is singular — and that is the point
>
> Because the counts obey $\sum_j X_j = n$, the random vector lives on a $(k-1)$-dimensional affine slice, not the full $k$-dimensional space. Its covariance matrix $\Sigma_{jj}=np_j(1-p_j)$, $\Sigma_{j\ell}=-np_jp_\ell$ is therefore **rank-deficient** (singular): the vector of all ones is in its null space, since $\sum_\ell \Sigma_{j\ell}=0$. This is why the chi-square approximation has $k-1$ degrees of freedom rather than $k$ — one degree is consumed by the sum constraint. When you build tests, always count the free dimensions, not the nominal number of categories; over-counting degrees of freedom is a classic error in goodness-of-fit work.

> [!info]+ 💡 Mahalanobis distance: the natural ruler in MVN space
>
> The quadratic form in the MVN exponent, $D^2 = (x-\mu)^T\Sigma^{-1}(x-\mu)$, is the squared **Mahalanobis distance** — distance measured in units that account for both the scale and the correlations of the data. Under $X\sim N(\mu,\Sigma)$, $D^2\sim\chi^2_d$, so a $1-\alpha$ confidence ellipsoid for $\mu$ is exactly the set where $D^2\le \chi^2_{d,\,1-\alpha}$. This is the multivariate generalization of "within $z$ standard deviations." It reappears as the discriminant in Gaussian classification: comparing Mahalanobis distances to each class mean (with that class's $\Sigma$) is what linear and quadratic discriminant analysis do under the hood.

## Connections

- [[02-random-variables]] — the multivariate normal and multinomial are the headline *joint* distributions; this chapter realizes the random-vector machinery introduced there. ← joint pmfs/pdfs and the notion of a random vector come from there; → here they get concrete mean-vector and covariance-matrix summaries.
- [[03-expectation]] — $\mu=E[X]$ and $\Sigma=\text{Cov}(X)$ are vector/matrix expectations. ← linearity of expectation and the scalar variance/covariance definitions; → generalized to $E[AX]=A\mu$ and $\text{Cov}(AX)=A\Sigma A^T$.
- [[09-parametric-inference]] — the MLEs $\hat\mu=\bar X$, $\hat\Sigma$, and $\hat p_j=X_j/n$ are worked examples of maximum likelihood. ← MLE theory and asymptotic normality; → applied to the MVN and multinomial parameters with multivariate CLT behavior.
- [[13-linear-and-logistic-regression]] — the Gaussian conditional mean $E[X_a\mid X_b]=\mu_a+\Sigma_{ab}\Sigma_{bb}^{-1}(x_b-\mu_b)$ *is* a population regression. ← regression as conditional expectation; → here it falls out in closed form from joint normality, explaining why Gaussian assumptions yield linear regression.
- [[15-inference-about-independence]] — the multinomial counts and the $\chi^2_{k-1}$ approximation are the engine for contingency-table and independence testing. → this chapter supplies the distributional backbone those tests rely on.
- [[22-classification]] — Mahalanobis distance and the MVN density drive linear/quadratic discriminant analysis. → estimating class-conditional $N(\mu_c,\Sigma_c)$ and comparing densities is direct multivariate-model application.
- [[16-causal-inference]] — covariance structure and conditional independence among variables set up the language used to reason about confounding and adjustment. → block-diagonal $\Sigma$ and conditional normals foreshadow conditional-independence assumptions.
