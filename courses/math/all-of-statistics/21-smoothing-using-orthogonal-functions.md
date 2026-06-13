---
tags: [orthogonal-functions, wavelets, density-estimation, regression, thresholding, shrinkage, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 21 — Smoothing Using Orthogonal Functions

> [!abstract]+ Chapter at a glance
>
> Chapter 20 smoothed curves *in the data domain* — kernels and local polynomials centered on the design points. This chapter smooths the same curves *in the coefficient domain*. The idea is to expand the unknown function $f$ in an **orthonormal basis** $\{\phi_j\}$, so that $f(x)=\sum_j \theta_j\phi_j(x)$, and then estimate the sequence of coefficients $\theta_j$ instead of the function itself. The payoff is conceptual unity: each $\theta_j$ is an inner product $\int f\phi_j$, and for both density and regression it can be estimated by an essentially unbiased sample average. Curve estimation thus collapses into the **normal means problem** — estimating a long vector of means from noisy observations. **Smoothing** becomes a decision about that vector: keep only the first $J$ coefficients (truncation, where $J$ plays the bandwidth's role), or shrink/threshold the noisy high-frequency coefficients toward zero. The bias–variance trade-off reappears as a trade-off in $J$, and we choose $J$ (or a threshold) by estimating the risk. Finally, **wavelet** bases localize in both position and frequency, so coefficient *thresholding* buys **spatial adaptivity** — fitting functions that are smooth in some regions and jagged in others, which a single global bandwidth cannot do.

## Core concepts

**Orthonormal bases.** A set of functions $\{\phi_0,\phi_1,\dots\}$ on an interval (say $[0,1]$) is orthonormal with respect to the inner product $\langle f,g\rangle=\int f(x)g(x)\,dx$ if $\int \phi_i\phi_j = 1$ when $i=j$ and $0$ otherwise. The basis is *complete* if any square-integrable $f\in L^2$ can be written as $f(x)=\sum_{j=0}^\infty \theta_j\phi_j(x)$. The **cosine basis** $\phi_0(x)=1$, $\phi_j(x)=\sqrt{2}\cos(\pi j x)$ for $j\ge 1$ is the running example; the Legendre polynomials and the **Fourier basis** are other standard choices. Orthonormality is what makes everything downstream simple.

**Coefficients are inner products.** Because the basis is orthonormal, the expansion coefficient is just a projection:
$$\theta_j=\langle f,\phi_j\rangle=\int_0^1 f(x)\,\phi_j(x)\,dx.$$
So the unknown function is fully described by the *sequence* $\theta=(\theta_0,\theta_1,\dots)$. Smoothness of $f$ translates into rapid decay of $\theta_j$ as $j\to\infty$: smooth functions have small high-frequency coefficients, rough functions do not. This decay is exactly what makes truncation a sensible smoother.

**Parseval's relation.** Orthonormality gives
$$\int_0^1 f(x)^2\,dx=\sum_{j=0}^\infty \theta_j^2,\qquad \int (f-g)^2 = \sum_j (\theta_j-\beta_j)^2.$$
The squared-error loss between two functions equals the squared $\ell_2$ distance between their coefficient vectors. This is the bridge that turns function estimation into a problem about sequences of numbers, and it is why integrated risk can be computed coefficient-by-coefficient.

**Unbiased estimation of density coefficients.** Suppose $X_1,\dots,X_n$ are i.i.d. with density $f$ on $[0,1]$. Then $\theta_j=\int f\phi_j = \mathbb{E}[\phi_j(X)]$, so the natural estimator is a plain sample average:
$$\hat\theta_j=\frac1n\sum_{i=1}^n \phi_j(X_i).$$
This is *unbiased*: $\mathbb{E}[\hat\theta_j]=\theta_j$, and $\mathrm{Var}(\hat\theta_j)=\sigma_j^2/n$ with $\sigma_j^2=\mathrm{Var}(\phi_j(X))$. Density estimation has become estimating the mean of $\phi_j(X)$ for each $j$ — a sequence of one-dimensional mean estimation problems.

**Coefficients for regression.** In the equally-spaced regression model $Y_i=r(x_i)+\sigma\epsilon_i$ with $x_i=i/n$, the analogous estimator of $\theta_j=\int r\phi_j$ is
$$\hat\theta_j=\frac1n\sum_{i=1}^n Y_i\,\phi_j(x_i),$$
which is (approximately) unbiased and behaves like $\theta_j$ plus Gaussian noise of variance $\sim \sigma^2/n$. So both problems reduce to the canonical **normal means** model: observe $Z_j=\theta_j+\sqrt{\tfrac{1}{n}}\,\eta_j$ and try to recover the $\theta_j$.

**Smoothing = truncation at $J$.** The simplest estimator keeps the first $J+1$ coefficients and discards the rest:
$$\hat f_J(x)=\sum_{j=0}^{J}\hat\theta_j\,\phi_j(x).$$
Here $J$ is the **smoothing parameter** and plays exactly the role the bandwidth $h$ played in Chapter 20: small $J$ (large $h$) = heavy smoothing; large $J$ (small $h$) = light smoothing. Dropping high-frequency terms is dropping fast-oscillating components — the coefficient-domain version of averaging over a window.

**The bias–variance trade-off in $J$.** Using Parseval, the integrated risk of the truncation estimator splits cleanly:
$$R(J)=\underbrace{\sum_{j>J}\theta_j^2}_{\text{bias}^2}+\underbrace{\sum_{j=0}^{J}\frac{\sigma_j^2}{n}}_{\text{variance}}.$$
The first term is the squared bias from the discarded tail; it *decreases* as $J$ grows. The second is the accumulated variance of the kept estimates; it *increases* (roughly linearly) with $J$. Too few terms → bias (real structure is thrown away); too many → variance (noise is fit). The optimal $J^*$ balances the two.

**Choosing $J$ by estimating the risk.** We cannot compute $R(J)$ because the $\theta_j$ are unknown, but we can form an **unbiased risk estimate**. Since $\mathbb{E}[\hat\theta_j^2]=\theta_j^2+\sigma_j^2/n$, the quantity $\hat\theta_j^2-\hat\sigma_j^2/n$ unbiasedly estimates $\theta_j^2$, leading to an estimate $\hat R(J)$ whose minimizer gives a data-driven $\hat J$. Equivalently, **leave-one-out cross-validation** estimates the prediction risk and selects $J$. This mirrors choosing the bandwidth by CV in the previous chapter.

**Shrinkage versus truncation.** Truncation is the special "keep-or-kill" rule: multiply each $\hat\theta_j$ by a weight $w_j\in\{0,1\}$. More generally a **shrinkage** estimator uses smooth weights $w_j\in[0,1]$, $\hat f(x)=\sum_j w_j\hat\theta_j\phi_j(x)$. Because high-frequency $\hat\theta_j$ are mostly noise, shrinking them toward $0$ reduces variance at a small bias cost. This is the curve-estimation face of the **James–Stein / shrinkage** phenomenon from decision theory.

**Wavelets and double localization.** The cosine/Fourier basis is localized in *frequency* but global in *space* — every basis function spans the whole interval, so adjusting one coefficient changes the fit everywhere. **Wavelets** $\psi_{jk}(x)=2^{j/2}\psi(2^j x-k)$ are built from a mother wavelet $\psi$ by dilation ($j$, scale/frequency) and translation ($k$, position). Each wavelet is localized in *both* position and frequency, so the coefficients describe local detail at each scale.

**Thresholding wavelet coefficients.** With wavelets, smoothing is done by **thresholding** rather than truncation: estimate all coefficients $\hat\theta_{jk}$, then zero out the small ones. **Hard thresholding** keeps $\hat\theta_{jk}$ if $|\hat\theta_{jk}|>\lambda$ and sets it to $0$ otherwise; **soft thresholding** additionally shrinks the survivors toward $0$ by $\lambda$:
$$\hat\theta_{jk}^{\text{soft}}=\operatorname{sign}(\hat\theta_{jk})\big(|\hat\theta_{jk}|-\lambda\big)_+.$$
A common universal choice is $\lambda=\hat\sigma\sqrt{2\log n}$ (illustrative). Because a few large coefficients can sit at *any* location and scale, thresholding keeps exactly the locally-important detail and discards the rest.

**Spatial adaptivity.** The decisive advantage of wavelet thresholding is **adaptivity**: it can simultaneously fit a function that is very smooth in one region and full of bumps, jumps, or spikes in another. A single global bandwidth/$J$ is forced to compromise — smooth enough to suppress noise in flat regions over-smooths the spikes, and vice versa. Wavelet thresholding allocates "resolution" locally, so it tracks features of widely varying smoothness in one pass.

## Quiz

**1.** What does it mean for $\{\phi_j\}$ to be an orthonormal basis, and how is the coefficient $\theta_j$ obtained from $f$?

> [!example]- Show answer
> Orthonormality means $\int \phi_i\phi_j = 1$ if $i=j$ and $0$ otherwise, under the inner product $\langle f,g\rangle=\int f g$. If the basis is also complete, any $f\in L^2$ expands as $f=\sum_j\theta_j\phi_j$. Because of orthonormality, each coefficient is just the projection $\theta_j=\langle f,\phi_j\rangle=\int f(x)\phi_j(x)\,dx$. So the function is equivalently described by the sequence $\theta=(\theta_0,\theta_1,\dots)$. The cosine basis $\{1,\sqrt2\cos(\pi j x)\}$ is the chapter's working example.

**2.** State Parseval's relation and explain why it is the key that turns function estimation into a problem about sequences.

> [!example]- Show answer
> Parseval says $\int f^2 = \sum_j \theta_j^2$ and, applied to a difference, $\int (f-g)^2 = \sum_j(\theta_j-\beta_j)^2$. So the integrated squared-error loss between two functions equals the ordinary squared $\ell_2$ distance between their coefficient vectors. This means estimating $f$ in $L^2$ is *exactly* estimating the infinite vector $\theta$ under squared error. Integrated risk therefore decomposes coefficient-by-coefficient, which is what makes the bias–variance bookkeeping in $J$ tractable.

**3.** For density estimation, why is $\hat\theta_j=\frac1n\sum_i\phi_j(X_i)$ an unbiased estimator of $\theta_j$, and what is its variance?

> [!example]- Show answer
> Because $\theta_j=\int f\phi_j=\mathbb{E}[\phi_j(X)]$ when $X$ has density $f$. A sample mean of $\phi_j(X_i)$ is therefore unbiased for that expectation: $\mathbb{E}[\hat\theta_j]=\theta_j$. Its variance is $\mathrm{Var}(\hat\theta_j)=\sigma_j^2/n$ where $\sigma_j^2=\mathrm{Var}(\phi_j(X))=\int\phi_j^2 f-\theta_j^2$. Density estimation has thus become a sequence of one-dimensional mean-estimation problems, one per basis function.

**4.** How is the coefficient estimator constructed in equally-spaced regression, and what canonical statistical model does the resulting problem reduce to?

> [!example]- Show answer
> With $Y_i=r(x_i)+\sigma\epsilon_i$ and $x_i=i/n$, use $\hat\theta_j=\frac1n\sum_i Y_i\phi_j(x_i)$, which approximates $\int r\phi_j=\theta_j$ and is (approximately) unbiased. The estimate equals $\theta_j$ plus Gaussian noise of variance $\approx\sigma^2/n$. So we observe $Z_j=\theta_j+(\text{noise})$ for each $j$ — the **normal means** model. Both density and regression smoothing thereby reduce to estimating a vector of means from independent noisy observations.

**5.** Write the truncation estimator and explain in what precise sense $J$ "is" the bandwidth.

> [!example]- Show answer
> The truncation (orthogonal series) estimator is $\hat f_J(x)=\sum_{j=0}^{J}\hat\theta_j\phi_j(x)$, keeping the first $J+1$ coefficients and discarding the rest. $J$ is the smoothing parameter: small $J$ throws away high-frequency terms and gives a very smooth fit (like a large bandwidth $h$); large $J$ retains fast-oscillating components and follows the data closely (like a small $h$). Discarding high-frequency basis functions is the coefficient-domain analogue of averaging within a window, so $J$ and $h$ are two parameterizations of the same smoothing dial.

**6.** Decompose the integrated risk of the truncation estimator into bias and variance as functions of $J$, and describe how each behaves.

> [!example]- Show answer
> By Parseval, $R(J)=\sum_{j>J}\theta_j^2 + \sum_{j=0}^{J}\sigma_j^2/n$. The first term is the squared bias from the *discarded tail* and decreases as $J$ grows (fewer real coefficients are omitted). The second is the accumulated *variance* of the kept estimates and increases roughly linearly in $J$ (each retained noisy coefficient adds about $\sigma_j^2/n$). Too small $J$ → bias dominates (genuine structure lost); too large $J$ → variance dominates (noise fit). The optimal $J^*$ balances the falling bias against the rising variance.

**7.** We cannot evaluate $R(J)$ directly. How do we choose $J$ from the data?

> [!example]- Show answer
> Form an **unbiased risk estimate**. Since $\mathbb{E}[\hat\theta_j^2]=\theta_j^2+\sigma_j^2/n$, the quantity $\hat\theta_j^2-\hat\sigma_j^2/n$ unbiasedly estimates $\theta_j^2$, which yields an estimable $\hat R(J)$; pick $\hat J=\arg\min_J \hat R(J)$. Equivalently, leave-one-out cross-validation estimates the prediction risk and selects $J$. This is the orthogonal-series counterpart of choosing the kernel bandwidth by CV in Chapter 20.

**8.** What is the difference between truncation and shrinkage, and why is shrinking high-frequency coefficients a good idea?

> [!example]- Show answer
> Both write the estimate as $\sum_j w_j\hat\theta_j\phi_j$. Truncation uses hard weights $w_j\in\{0,1\}$ (keep the first $J$, kill the rest). Shrinkage uses soft weights $w_j\in[0,1]$ that taper the coefficients smoothly toward $0$. Because high-frequency $\hat\theta_j$ have small true signal but full variance $\sigma_j^2/n$, they are mostly noise; pulling them toward $0$ cuts variance with little added bias. This is the curve-estimation version of the shrinkage/James–Stein effect from decision theory — biased-but-lower-risk estimation of many means.

**9.** What do wavelets provide that the cosine/Fourier basis does not, and how are wavelet smoothers fit?

> [!example]- Show answer
> Cosine/Fourier basis functions are localized in frequency but global in space — each spans the whole interval, so one coefficient affects the fit everywhere. Wavelets $\psi_{jk}(x)=2^{j/2}\psi(2^jx-k)$ are localized in *both* position ($k$) and scale/frequency ($j$), so their coefficients capture local detail. Wavelet smoothers estimate all $\hat\theta_{jk}$ and then **threshold**: hard thresholding zeros coefficients with $|\hat\theta_{jk}|\le\lambda$; soft thresholding also shrinks survivors by $\lambda$ via $\operatorname{sign}(\hat\theta_{jk})(|\hat\theta_{jk}|-\lambda)_+$. A typical universal threshold is $\lambda=\hat\sigma\sqrt{2\log n}$.

**10.** *(Applied)* You estimate a regression function that is nearly flat on the left half of $[0,1]$ but has a sharp spike near $x=0.8$. Contrast what a single-bandwidth cosine-series truncation and a thresholded wavelet estimator will do, and say which you'd prefer and why.

> [!example]- Show answer
> A cosine-series truncation has one global $J$. Choosing $J$ small enough to suppress noise on the flat left half will smear and under-fit the spike; choosing $J$ large enough to resolve the spike injects high-frequency wiggles into the flat region. There is no global $J$ that handles both — it must compromise. Wavelet thresholding is **spatially adaptive**: large coefficients localized near $x=0.8$ at fine scales survive the threshold and reconstruct the spike, while coefficients over the flat region are small, get thresholded to $0$, and stay smooth. I'd prefer the thresholded wavelet estimator because the function's smoothness varies across the domain, exactly the regime where adaptivity wins. *(Applied)*

## Deeper understanding (expansion)

> [!info]+ 💡 The unifying idea: smoothing is what you do to a sequence of means
>
> The whole chapter rests on one reduction. By projecting $f$ onto an orthonormal basis, both density estimation and regression become "observe $\hat\theta_j\approx\theta_j+\text{noise}$, recover $\theta$." Parseval then makes integrated $L^2$ risk identical to $\ell_2$ risk on the coefficient vector. Once you are in this **normal means** world, *every* smoothing method is a rule for combining the noisy $\hat\theta_j$: keep the first $J$ (truncation), taper them (shrinkage), or keep only the big ones (thresholding). Kernel smoothing from Chapter 20 also has an implicit coefficient interpretation — it down-weights high frequencies. The coefficient view does not change *what* we estimate, but it makes the bias–variance trade-off transparent and connects curve estimation to decision-theoretic shrinkage.

> [!info]+ 💡 Why thresholds beat bandwidths for inhomogeneous functions
>
> A bandwidth (or a truncation $J$) imposes one resolution everywhere. That is optimal only if the function's smoothness is roughly constant across the domain. Real signals — images, spectra, financial series — are often piecewise smooth with localized features. Wavelet coefficients sort the signal by *both* scale and location, so a function's local roughness shows up as a few large coefficients in the relevant location/scale cells, while smooth regions produce coefficients that are essentially noise. **Thresholding** is therefore a per-location, per-scale keep/kill decision: it spends resolution only where the data demand it. Theory (Donoho–Johnstone) shows thresholded wavelet estimators achieve near-optimal rates over rich classes of inhomogeneous functions that no fixed-bandwidth method can match — adaptivity for (almost) free, at the cost of one $\log n$ factor.

> [!info]+ 💡 The bet on coefficient decay
>
> Truncation and shrinkage are only sensible because *smooth functions have rapidly decaying coefficients*. If $\theta_j$ decayed slowly, truncating at any feasible $J$ would leave large bias $\sum_{j>J}\theta_j^2$, and shrinkage toward $0$ would be wrong. The smoothness assumption — formalized as the coefficient vector lying in a **Sobolev** or Besov ball — is what guarantees the discarded tail is small and the high-frequency $\hat\theta_j$ are mostly noise. So choosing a basis is implicitly choosing a notion of smoothness: the cosine basis suits globally smooth functions, wavelets suit functions whose smoothness varies in space. The estimator inherits good risk only on the function class its basis is matched to.

## Connections

- [[20-nonparametric-curve-estimation]] — the *same* density/regression targets and the *same* bias–variance trade-off as the previous chapter, re-derived in the coefficient domain. → Truncation level $J$ is the orthogonal-series re-parameterization of the kernel bandwidth $h$; both are chosen by cross-validation or an unbiased risk estimate. ← The integrated-risk decomposition here is the Parseval transform of the integrated MSE there.
- [[12-statistical-decision-theory]] — → Estimating the coefficient vector under squared error *is* the **normal means** decision problem; shrinkage and thresholding are exactly the (James–Stein-style) biased estimators that beat the raw $\hat\theta_j$ in risk. ← Risk, admissibility, and minimaxity from decision theory provide the language for "why shrink," and for the optimality claims behind wavelet thresholding.
- [[05-convergence-of-random-variables]] — ← The unbiasedness $\mathbb{E}[\hat\theta_j]=\theta_j$ plus variance $\sigma_j^2/n$ gives consistency of each coefficient estimate via the law of large numbers, and the normal-means approximation $\hat\theta_j\approx\theta_j+N(0,\sigma^2/n)$ rests on the central limit theorem. → These limit tools justify the asymptotic risk and rate-of-convergence statements used to compare $J$ and threshold choices.
- [[06-models-inference-and-learning]] — ← Series/wavelet estimators are the canonical **nonparametric** models: an infinite parameter $\theta$ with a complexity dial ($J$ or $\lambda$) controlling the effective dimension, illustrating the bias–variance and regularization themes of statistical learning.
