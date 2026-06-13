---
tags: [nonparametric, density-estimation, kernel-density, bandwidth, bias-variance, cross-validation, curse-of-dimensionality, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 20 — Nonparametric Curve Estimation

> [!abstract]+ Chapter at a glance
>
> This chapter tackles the problem of estimating an unknown function — either a probability **density** $f$ or a **regression** function $r(x)=\mathbb{E}[Y\mid X=x]$ — **without** committing to a parametric family. The whole subject is governed by a single tension: a **smoothing parameter** (the bin width of a histogram, or the **bandwidth** $h$ of a kernel) acts as a *bias–variance dial*. Crank it small and the estimate hugs the data — low bias but high variance, wiggly and noisy. Crank it large and the estimate flattens out — low variance but high bias, oversmoothed. The art is choosing $h$ to balance the two, which we formalize through **risk** (integrated mean squared error) and solve in practice with **cross-validation**. Two recurring lessons emerge: nonparametric estimators converge at rates *slower* than the parametric $n^{-1}$ (the optimal MISE scales like $n^{-4/5}$ in one dimension — the unavoidable price of refusing parametric assumptions), and these methods **collapse in high dimensions** because the sample size needed grows exponentially — the **curse of dimensionality**.

## Core concepts

**The smoothing problem.** We want to estimate a function — a density $f$ or a regression curve $r$ — assuming only that it is *smooth* (e.g. has some bounded derivatives), not that it belongs to a finite-dimensional family. Smoothness is what makes the problem tractable: it lets us borrow information from nearby points. How much we borrow is controlled by a smoothing parameter.

**The bias–variance trade-off is the whole game.** Every nonparametric estimator $\hat f$ of a function has a pointwise mean squared error decomposing as
$$\mathrm{MSE}(x) = \underbrace{\big(\mathbb{E}[\hat f(x)] - f(x)\big)^2}_{\text{bias}^2} + \underbrace{\mathrm{Var}(\hat f(x))}_{\text{variance}}.$$
The smoothing parameter trades these against each other: **small** $h$ → small bias, large variance (undersmoothed, wiggly); **large** $h$ → large bias, small variance (oversmoothed, washed out). We want the $h$ that minimizes their sum.

**Risk = integrated MSE.** To judge a curve globally rather than at one point we integrate:
$$R(\hat f, f) = \int \mathrm{MSE}(x)\,dx = \int \mathrm{bias}^2(x)\,dx + \int \mathrm{Var}(\hat f(x))\,dx.$$
This is the **integrated mean squared error** (IMSE, also called MISE — mean integrated squared error). It is the standard yardstick for comparing density and regression estimators.

**Histograms — the simplest density estimator.** Partition the line into bins of width $h$; on bin $B_j$ the estimate is constant,
$$\hat f(x) = \frac{\hat p_j}{h}, \qquad \hat p_j = \frac{\text{(number of observations in } B_j)}{n},$$
where $\hat p_j$ is the fraction of data falling in $B_j$. The bin width $h$ is the smoothing parameter. The risk of a histogram is approximately of the form (constant involving $\int (f')^2$) $\times h^2$ for the bias part plus (constant)$/(nh)$ for the variance part. Minimizing over $h$ gives an optimal bin width $h_* \sim n^{-1/3}$ and optimal risk $\sim n^{-2/3}$ — histograms are crude because of the discontinuities they impose.

**Kernel density estimators (KDE).** Replace the blocky histogram with a smooth sum of bumps centered at the data:
$$\hat f(x) = \frac{1}{nh}\sum_{i=1}^{n} K\!\left(\frac{x - X_i}{h}\right),$$
where the **kernel** $K$ is a smooth, symmetric weight function integrating to 1 (e.g. the Gaussian $\tfrac{1}{\sqrt{2\pi}}e^{-u^2/2}$, or the Epanechnikov kernel). Each observation contributes a little bump of width $\sim h$; the estimate is their average.

**The bandwidth matters far more than the kernel.** A central practical message: the choice of $K$ has only a minor effect on the estimator's risk (different reasonable kernels give nearly the same answer), whereas the choice of the **bandwidth** $h$ is decisive. Almost all of the statistical risk is controlled by $h$. So spend your effort choosing $h$ well, not agonizing over $K$.

**Optimal bandwidth and the $n^{-4/5}$ rate.** Expanding the IMSE for a kernel estimator, the squared-bias term behaves like $\sim h^4 \int (f'')^2$ and the variance term like $\sim 1/(nh)$. Setting the derivative to zero:
$$h_* \sim n^{-1/5}, \qquad R(\hat f_{h_*}, f) \sim n^{-4/5}.$$
This $n^{-4/5}$ rate is **slower** than the parametric $n^{-1}$ — and that gap is the *price of nonparametrics*. Refusing to assume a parametric form costs you statistical efficiency; you pay it in a slower convergence rate. The optimal $h_*$ depends on the unknown $\int (f'')^2$, so it cannot be computed directly — hence cross-validation.

**Choosing $h$ by cross-validation.** Because the optimal bandwidth depends on the unknown $f$, we estimate the risk from data and minimize that estimate. The integrated squared error satisfies
$$\int (\hat f - f)^2 = \int \hat f^2 - 2\int \hat f f + \int f^2,$$
and since $\int f^2$ doesn't depend on $h$, we minimize a **cross-validation score** that unbiasedly estimates $\int \hat f^2 - 2\int \hat f f$. The leave-one-out form uses $\hat f_{(-i)}$, the estimate built without observation $i$:
$$\hat J(h) = \int \hat f^2 \,dx - \frac{2}{n}\sum_{i=1}^{n} \hat f_{(-i)}(X_i).$$
We pick $\hat h = \arg\min_h \hat J(h)$. This lets the data choose the bias–variance balance automatically.

**Curse of dimensionality.** In $d$ dimensions the kernel estimator generalizes, but the optimal risk degrades to $\sim n^{-4/(4+d)}$. To keep the same accuracy the required sample size grows **exponentially** in $d$. Intuitively, in high dimensions data are sparse — almost every point is far from every other — so local averaging has almost no neighbors to average over. Kernel and local-averaging methods therefore become essentially useless for large $d$ without further structure.

**Nonparametric regression by local averaging.** For estimating $r(x)=\mathbb{E}[Y\mid X=x]$ from pairs $(X_i, Y_i)$, the idea is to average the $Y_i$ for $X_i$ near $x$. The **Nadaraya–Watson kernel estimator** is the kernel-weighted average
$$\hat r(x) = \frac{\sum_{i=1}^{n} K\!\left(\frac{x-X_i}{h}\right) Y_i}{\sum_{i=1}^{n} K\!\left(\frac{x-X_i}{h}\right)} = \sum_{i=1}^{n} w_i(x)\, Y_i,$$
where the weights $w_i(x)$ sum to one and concentrate on observations whose $X_i$ are within roughly $h$ of $x$. Same bias–variance story, same $h$-as-dial, same cross-validation for choosing $h$.

**Confidence bands.** One can place approximate variability bands around $\hat r$ (or $\hat f$). A subtlety the chapter stresses: because the estimator is biased, the band is really a band for the *smoothed* version $\mathbb{E}[\hat r]$ rather than for $r$ itself — honest bands must account for bias, which is hard since the bias depends on unknown derivatives.

## Quiz

**1.** State the bias–variance trade-off as it applies to choosing a bandwidth $h$, and describe what the estimate looks like at the two extremes.

> [!example]- Show answer
> The MSE of a curve estimate at a point splits into squared bias plus variance, and the bandwidth $h$ trades one for the other. A **small** $h$ makes the estimate track the data closely: low bias but high variance, producing a **wiggly, undersmoothed** curve that chases noise. A **large** $h$ averages over a wide window: low variance but high bias, producing an **oversmoothed, flattened** curve that washes out real features. The optimal $h$ minimizes the sum, balancing the two. This trade-off is the central organizing idea of the entire chapter.

**2.** Write the histogram density estimator and identify its smoothing parameter. Roughly how does its optimal risk scale with $n$?

> [!example]- Show answer
> Partition the line into bins of width $h$; on the bin containing $x$ the estimate is $\hat f(x) = \hat p_j / h$, where $\hat p_j$ is the fraction of observations in that bin. The **bin width $h$** is the smoothing parameter — narrow bins are wiggly (high variance), wide bins are blocky and biased. Balancing bias $\sim h^2$ against variance $\sim 1/(nh)$ gives an optimal $h_* \sim n^{-1/3}$ and optimal risk $\sim n^{-2/3}$. The histogram converges more slowly than a kernel estimator because its piecewise-constant form imposes large discontinuity bias.

**3.** Write the kernel density estimator and explain the role of $K$ and of $h$.

> [!example]- Show answer
> The kernel density estimator is
> $$\hat f(x) = \frac{1}{nh}\sum_{i=1}^{n} K\!\left(\frac{x - X_i}{h}\right),$$
> a sum of smooth bumps, one centered at each data point. The **kernel** $K$ is a symmetric, non-negative weight function integrating to one (e.g. Gaussian or Epanechnikov) — it sets the *shape* of each bump. The **bandwidth** $h$ sets the *width* of each bump and hence the degree of smoothing. The estimate is just the average of all the bumps.

**4.** Why does Wasserman emphasize that the bandwidth matters much more than the kernel?

> [!example]- Show answer
> Analysis of the risk shows that the choice of kernel $K$ affects the IMSE only through a small constant factor — any reasonable smooth kernel gives nearly identical performance. The **bandwidth $h$**, by contrast, controls the dominant bias and variance terms and so determines the rate and quality of the estimate. Practically this means you should not fuss over which kernel to use, but you must choose $h$ carefully (e.g. by cross-validation). Getting $h$ wrong gives a useless estimate; getting $K$ wrong barely matters.

**5.** Derive (heuristically) the optimal bandwidth scaling $h_* \sim n^{-1/5}$ and the resulting risk $\sim n^{-4/5}$ for a kernel density estimator.

> [!example]- Show answer
> Expanding the IMSE, the integrated squared bias behaves like $A h^4$ (with $A \propto \int (f'')^2$) and the integrated variance like $B/(nh)$. The risk is then $\approx A h^4 + B/(nh)$. Differentiating with respect to $h$ and setting to zero gives $4 A h^3 = B/(n h^2)$, i.e. $h^5 \propto 1/n$, so $h_* \sim n^{-1/5}$. Plugging back, both terms become $\sim n^{-4/5}$, so the optimal risk is $\sim n^{-4/5}$. This rate is slower than the parametric $n^{-1}$, the unavoidable cost of nonparametric estimation.

**6.** Why can't we just compute the optimal bandwidth $h_*$ directly?

> [!example]- Show answer
> The optimal bandwidth depends on $\int (f'')^2\,dx$ — a functional of the *unknown* density we are trying to estimate. Since $f$ (and hence $f''$) is unknown, $h_*$ is not directly computable; estimating $f''$ is even harder than estimating $f$ itself. This circularity is exactly why we turn to data-driven selection methods like cross-validation, which estimate the risk directly and minimize it over $h$ without needing $\int (f'')^2$.

**7.** Explain the leave-one-out cross-validation score for choosing the bandwidth of a density estimator. Why does the $\int f^2$ term not appear?

> [!example]- Show answer
> The integrated squared error is $\int(\hat f - f)^2 = \int \hat f^2 - 2\int \hat f f + \int f^2$. We choose $h$ to minimize this, but $\int f^2$ is a constant independent of $h$, so it can be dropped — minimizing the rest gives the same $\hat h$. We then estimate the remaining pieces: $\int \hat f^2$ is computable from the estimate, and $\int \hat f f = \mathbb{E}[\hat f(X)]$ is estimated by the leave-one-out average $\frac1n \sum_i \hat f_{(-i)}(X_i)$. This yields the CV score
> $$\hat J(h) = \int \hat f^2 - \frac{2}{n}\sum_i \hat f_{(-i)}(X_i),$$
> and we set $\hat h = \arg\min_h \hat J(h)$. Leave-one-out prevents the estimate from cheating by using $X_i$ to predict its own density.

**8.** What is the curse of dimensionality, and how does it show up in the risk of a kernel estimator?

> [!example]- Show answer
> In $d$ dimensions the optimal kernel-estimator risk degrades from $n^{-4/5}$ to $n^{-4/(4+d)}$. As $d$ grows the exponent shrinks toward 0, so convergence becomes catastrophically slow; equivalently, the sample size needed to reach a fixed accuracy grows **exponentially** in $d$. The cause is sparsity: in high dimensions data points are almost all far apart, so a local neighborhood around $x$ contains very few observations to average. Local-averaging methods therefore fail in high dimensions unless extra structure (additivity, low-dimensional manifolds) is imposed.

**9.** Write the Nadaraya–Watson kernel regression estimator and explain how it estimates $r(x)=\mathbb{E}[Y\mid X=x]$.

> [!example]- Show answer
> The Nadaraya–Watson estimator is a kernel-weighted local average of the responses:
> $$\hat r(x) = \frac{\sum_i K\!\left(\frac{x-X_i}{h}\right) Y_i}{\sum_i K\!\left(\frac{x-X_i}{h}\right)} = \sum_i w_i(x) Y_i,$$
> where the weights $w_i(x)$ are non-negative, sum to one, and put most mass on observations whose $X_i$ lie within roughly $h$ of $x$. It estimates $r(x)$ by averaging the $Y_i$ of nearby points, since $r(x)$ is the mean of $Y$ given $X=x$. The bandwidth $h$ controls the same bias–variance trade-off as in density estimation, and is again chosen by cross-validation.

**10.** *(Applied)* You fit a kernel density estimate to a sample and the CV-chosen curve looks suspiciously bumpy with many small modes. Diagnose what is likely happening and what you would do.

> [!example]- Show answer
> The bumpiness suggests the bandwidth is too **small** — the estimate is undersmoothed, so it has high variance and treats noise as structure (each spurious mode is roughly a single data point's bump). It is possible CV picked a small $h$ because CV scores can be noisy or have multiple local minima, especially with clustered or rounded data. I would inspect the CV-score curve over $h$ for a more stable minimum, try a modestly larger $h$ and compare, check for discretization/rounding artifacts in the data, and overlay several bandwidths to see which features persist (real modes survive moderate smoothing; noise modes vanish). Reporting a small range of $h$ rather than a single point is good practice.

**11.** *(Applied)* You have $n = 500$ observations in $d = 10$ dimensions and want a kernel density estimate. Is this a good idea? Justify quantitatively and suggest alternatives.

> [!example]- Show answer
> No — this is squarely in curse-of-dimensionality territory. The optimal kernel risk scales as $n^{-4/(4+d)} = 500^{-4/14} \approx 500^{-0.29}$, barely better than $\sim 0.16$, and that bound assumes the *optimal* bandwidth; in practice with $d=10$ almost every neighborhood is empty, so the estimate is dominated by variance and essentially meaningless. To match the accuracy a 1-D estimate gets from a few hundred points, you'd need an astronomically larger sample. Better options: impose structure (an **additive** model $f = \prod f_j$ or additive regression, $r(x)=\sum_j r_j(x_j)$), reduce dimension first (PCA, feature selection), or use a parametric/semiparametric model. The honest conclusion is that unrestricted nonparametric estimation in $d=10$ with 500 points is not feasible.

## Deeper understanding (expansion)

> [!info]+ 💡 Why nonparametric rates are inherently slower than parametric
>
> In a correctly specified parametric model the MLE achieves risk $\sim 1/n$: every observation sharpens a finite set of parameters, so information accumulates at the full rate. In nonparametrics you are estimating an *infinite-dimensional* object, and you can only borrow strength from observations within a bandwidth $h$ of the point of interest — effectively $\sim nh$ "local" observations. To control bias you must shrink $h$ as $n$ grows, so the effective local sample size $nh \sim n^{4/5}$ grows *sub-linearly*. That is precisely why the variance term, $\sim 1/(nh)$, and hence the whole risk, can only reach $\sim n^{-4/5}$ rather than $n^{-1}$. The slower rate is not a defect of any particular estimator; under minimal smoothness assumptions it is **minimax optimal** — no estimator can do essentially better. The lesson: assumptions buy speed. Parametric assumptions, when true, are enormously efficient; when false, they bias you. Nonparametrics trades efficiency for robustness to misspecification.

> [!info]+ 💡 Cross-validation as risk estimation, not model selection folklore
>
> It is tempting to view cross-validation as a heuristic, but here it has a precise meaning: it is an (approximately) **unbiased estimator of the integrated risk** as a function of $h$. The leave-one-out trick — predicting $X_i$'s density (or $Y_i$'s value) with an estimate built *without* $X_i$ — is what makes the cross term $\int \hat f f = \mathbb{E}[\hat f(X)]$ estimable without bias; using the full-sample $\hat f$ would let each point inflate its own estimate and systematically favor tiny bandwidths. Because $\int f^2$ drops out (it's constant in $h$), minimizing the CV score is equivalent to minimizing true risk up to that constant. Caveats worth remembering: the CV curve can be noisy and multimodal, so the selected $\hat h$ has variance; and CV optimizes *global* integrated risk, which may under- or over-smooth in regions where the curve's behavior differs from average. Still, CV is the workhorse precisely because it sidesteps the unknown $\int(f'')^2$ that blocks direct computation of $h_*$.

> [!info]+ 💡 Bias, honest confidence bands, and the undercoverage trap
>
> A genuinely subtle point: a confidence band built from the variance of $\hat f$ (or $\hat r$) is centered on $\mathbb{E}[\hat f]$, the **smoothed** version of the true function, not on $f$ itself. The gap between them is the bias, which at the optimal bandwidth is of the *same order* as the standard error — so ignoring bias gives bands that systematically miss $f$, especially at peaks and troughs where $|f''|$ is large. Honest bands must inflate to cover the bias, but the bias depends on unknown derivatives, creating a chicken-and-egg problem. Common pragmatic fixes are **undersmoothing** (use a slightly smaller $h$ so bias is negligible relative to variance, at the cost of a noisier center) or explicitly estimating and correcting the bias. The takeaway: in nonparametric estimation, bias is not a nuisance you can wave away — it is comparable to the noise and must be confronted to make valid inferential statements.

## Connections

- [[07-estimating-cdf-and-functionals]] — ← The empirical CDF and plug-in functionals estimate a *distribution function* nonparametrically without smoothing; this chapter takes the next step to estimating the *density* (the derivative of $F$), which **requires** smoothing because differentiation amplifies noise. The empirical CDF converges at the fast $n^{-1}$-flavored rate; the density it implies needs a bandwidth and pays the $n^{-4/5}$ price.
- [[13-linear-and-logistic-regression]] — ← Parametric regression assumes a fixed functional form ($r(x)=\beta_0+\beta_1 x$) and gets the efficient $n^{-1}$ rate when the form is correct. → Nonparametric regression (Nadaraya–Watson local averaging) drops that assumption, gaining robustness to misspecification but inheriting the slower nonparametric rate and the bandwidth-selection problem. The two are endpoints of a bias–variance spectrum.
- [[21-smoothing-using-orthogonal-functions]] — → An alternative route to the same goal: instead of local kernel weighting, expand $f$ or $r$ in an orthogonal basis (e.g. Fourier, wavelets) and smooth by *truncating or shrinking coefficients*. The number of retained terms plays the role of the bandwidth $h$ — the same bias–variance dial in a different coordinate system.
- [[22-classification]] — → Classification estimates $\mathbb{E}[Y\mid X=x]$ for a binary $Y$, so kernel regression and density estimation feed directly into nonparametric classifiers (kernel/plug-in rules, $k$-nearest-neighbors); the curse of dimensionality that plagues kernel estimation here is exactly what motivates structured and margin-based classifiers in high dimensions.
- [[17-directed-graphs-and-conditional-independence]] — ← Like graphical models, nonparametric curve estimation is a tool for capturing structure with minimal assumptions; both confront how quickly flexibility becomes infeasible as dimension grows, motivating additive and conditional-independence structure to beat the curse.
