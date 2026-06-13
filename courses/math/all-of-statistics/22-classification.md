---
tags: [classification, bayes-classifier, lda-qda, logistic-regression, knn, cart, vc-dimension, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 22 — Classification

> [!abstract]+ Chapter at a glance
>
> Classification is the supervised problem of learning a rule $h(x)$ that predicts a *discrete* label $Y \in \{0,1,\dots,K-1\}$ from features $X \in \mathbb{R}^d$, choosing $h$ to make the error rate $R(h)=P(h(X)\neq Y)$ small. The chapter's organizing idea is that there is a single unbeatable rule — the **Bayes classifier**, which predicts the class with the largest posterior $P(Y=k\mid X=x)$ — and its error, the **Bayes risk**, is the irreducible floor no classifier can go below. Everything else in the chapter is a *strategy for approximating the Bayes rule* from data: **generative** methods (LDA, QDA, naive Bayes) model the class-conditional densities and invert with Bayes' theorem; **discriminative** methods (logistic regression) model the posterior directly; nonparametric methods (k-NN, trees) make few distributional assumptions. Because the same data both fits and scores a classifier, *training error is optimistically biased*, so the chapter pairs every method with honest error estimation (held-out test set, cross-validation) and the theory of capacity control — VC dimension and the uniform bounds that descend from the inequalities of Chapter 4. The recurring moral: you cannot beat the Bayes rule, you can only estimate it, and overfitting is what happens when your estimate chases noise — capacity control and CV are the antidote.

## Core concepts

**The classification problem and risk.** Given training data $(X_1,Y_1),\dots,(X_n,Y_n)$ i.i.d. from a joint distribution, a classifier is a map $h:\mathcal{X}\to\{0,\dots,K-1\}$. Its **true risk** (error rate) is
$$R(h) = P\big(h(X)\neq Y\big) = \mathbb{E}\big[\mathbf{1}\{h(X)\neq Y\}\big].$$
This is the expected 0–1 loss. The goal is to find $h$ with small $R(h)$, but $R$ depends on the unknown distribution, so we must estimate it. The empirical (training) risk is $\hat R_n(h)=\frac1n\sum_i \mathbf{1}\{h(X_i)\neq Y_i\}$.

**The Bayes classifier.** Write the posterior (regression function for $Y$ on $X$) as $r_k(x)=P(Y=k\mid X=x)$. The **Bayes rule** predicts the most probable class:
$$h^*(x) = \arg\max_{k} \; P(Y=k\mid X=x) = \arg\max_k \; \pi_k\, f_k(x),$$
where $\pi_k=P(Y=k)$ are the class priors and $f_k(x)$ the class-conditional densities (the second form follows from Bayes' theorem, since the denominator $f(x)$ is common to all $k$). In the two-class case $h^*(x)=1$ iff $r_1(x)>\tfrac12$. **Theorem (informal):** $h^*$ minimizes $R(h)$ over *all* possible classifiers; no rule can do better.

**Bayes risk — the irreducible floor.** $R^*=R(h^*)$ is the **Bayes risk**, the lowest error rate achievable. For two classes, $R^* = \mathbb{E}\big[\min\{r_1(X),\,1-r_1(X)\}\big]$. It is strictly positive whenever the classes overlap; the gap $R(h)-R^*$ is the **excess risk** of an estimated rule, and good methods drive it toward zero as $n\to\infty$.

**Generative vs. discriminative.** *Generative* classifiers estimate the priors $\pi_k$ and the full class-conditional densities $f_k(x)$, then plug into $\arg\max_k \hat\pi_k \hat f_k(x)$ — they model how the data were *generated*. *Discriminative* classifiers estimate the decision boundary / posterior $r_k(x)$ directly without modeling $f_k(x)$. Generative methods can be more efficient when their model is right and handle missing data gracefully; discriminative methods are more robust to misspecified class-conditionals because they only commit to the boundary.

**LDA and QDA.** Assume each class is multivariate Gaussian, $X\mid Y=k \sim N(\mu_k,\Sigma_k)$. Plugging Gaussian densities into the Bayes rule gives a **discriminant function** $\delta_k(x)=\log\pi_k + \log f_k(x)$ and the rule $\hat h(x)=\arg\max_k \delta_k(x)$.
- **QDA** (general $\Sigma_k$): $\delta_k(x)= -\tfrac12\log|\Sigma_k| - \tfrac12 (x-\mu_k)^\top \Sigma_k^{-1}(x-\mu_k) + \log\pi_k$. The boundary between classes is **quadratic** in $x$.
- **LDA** (shared $\Sigma_k=\Sigma$): the quadratic terms cancel, leaving $\delta_k(x)= x^\top\Sigma^{-1}\mu_k - \tfrac12\mu_k^\top\Sigma^{-1}\mu_k + \log\pi_k$, which is **linear** in $x$ — so the decision boundary is a hyperplane.

Parameters are estimated by sample means $\hat\mu_k$, sample covariances $\hat\Sigma_k$ (or a pooled $\hat\Sigma$ for LDA), and proportions $\hat\pi_k$. QDA is more flexible (more parameters); LDA is more parsimonious and often more stable when $n$ is small relative to $d$. **Naive Bayes** is a further simplification: assume the features are *conditionally independent* given the class, so $f_k(x)=\prod_j f_{kj}(x_j)$ — crude but surprisingly effective, especially in high dimensions.

**Logistic regression (discriminative).** Instead of modeling $f_k(x)$, model the posterior directly via the logistic link:
$$\log\frac{P(Y=1\mid X=x)}{P(Y=0\mid X=x)} = \beta_0 + \beta^\top x, \qquad r_1(x)=\frac{e^{\beta_0+\beta^\top x}}{1+e^{\beta_0+\beta^\top x}}.$$
Parameters are fit by maximum likelihood (no closed form; solved by Newton–Raphson / iteratively reweighted least squares). The resulting boundary $r_1(x)=\tfrac12$ is again **linear**. Interestingly, the *Gaussian-LDA model implies the logistic form* for the posterior, but logistic regression estimates fewer parameters and does not assume Gaussian features, making it more robust.

**k-nearest neighbors (k-NN).** A purely nonparametric rule: to classify $x$, find the $k$ training points nearest to $x$ (by Euclidean distance) and take a **majority vote** of their labels. This is a plug-in estimate of $r_k(x)$ by local averaging. The tuning parameter $k$ controls the bias–variance trade-off: small $k$ → low bias, high variance (jagged, overfit boundary, $k=1$ has zero training error); large $k$ → high bias, low variance (smooth boundary). Choose $k$ by cross-validation.

**Classification trees (CART).** Recursively partition feature space by **binary splits** on single variables ("is $X_j \le t$?"), forming a tree whose leaves are assigned the majority class. Splits are chosen to maximally reduce an **impurity** measure — the Gini index $\sum_k \hat p_k(1-\hat p_k)$ or entropy $-\sum_k \hat p_k\log\hat p_k$ — at each node. A fully grown tree overfits, so the tree is **pruned** back: grow large, then minimize a cost-complexity criterion $\hat R(T) + \alpha\,|T|$ that penalizes the number of leaves $|T|$, with $\alpha$ tuned by cross-validation. Trees are interpretable and handle mixed/nonlinear structure but are high-variance.

**Training error underestimates test error.** Because the same data chose $\hat h$ and is then scored by it, $\hat R_n(\hat h)$ is **optimistically biased** for the true risk $R(\hat h)$ — the more flexible the method, the larger the optimism (a complex rule can drive training error to zero while generalizing poorly). Honest estimates require fresh data:
- **Held-out test set**: split data into train / test; estimate $R$ on the untouched test set.
- **Cross-validation** ($K$-fold): partition into $K$ folds, train on $K-1$, validate on the held-out fold, rotate, average. Reuses data efficiently and is the standard tool for choosing tuning parameters ($k$ in k-NN, $\alpha$ in trees).

**Link to regression — plug-in classifiers.** Classification is regression with a discrete response: estimate the regression function $\hat r(x)=\hat P(Y=1\mid x)$ by any method (logistic regression, kernel/local smoothers from Ch. 20, etc.) and **threshold** it at $\tfrac12$. The quality of the plug-in classifier depends on how well $\hat r$ approximates the true $r$ — but, usefully, getting $\hat r$ only roughly right *on the correct side of $\tfrac12$* still yields good classification.

**VC theory and capacity control.** Let $\mathcal{H}$ be a class of classifiers. The **shattering** of a set of points means $\mathcal{H}$ can realize *all* $2^m$ labelings of $m$ points; the **VC dimension** $d_{VC}(\mathcal{H})$ is the size of the largest set that $\mathcal{H}$ shatters — a measure of *capacity*. The central result bounds the uniform gap between training and true error: with probability at least $1-\alpha$, for all $h\in\mathcal{H}$,
$$R(h) \le \hat R_n(h) + \sqrt{\frac{C\big(d_{VC}\log(n/d_{VC}) + \log(1/\alpha)\big)}{n}}.$$
The gap grows with VC dimension and shrinks with $n$: **more capacity ⇒ more data needed to generalize**. This is the formal justification for capacity control — restricting $\mathcal{H}$ or penalizing complexity. The bound rests on uniform/Hoeffding-style concentration, tying directly to the inequalities of Chapter 4.

**Support vector machines (briefly).** SVMs build a linear classifier by **maximizing the margin** — the distance from the separating hyperplane to the nearest training points (the *support vectors*). With a soft margin, slack variables permit some misclassification for non-separable data. The **kernel trick** replaces inner products $\langle x_i,x_j\rangle$ with a kernel $K(x_i,x_j)$, implicitly mapping features into a high-dimensional space so a *linear* boundary there is *nonlinear* in the original space — all without ever computing the map explicitly.

## Quiz

**1.** Define the true risk $R(h)$ of a classifier and explain why it cannot be computed directly from a finite sample.

> [!example]- Show answer
> The true risk is $R(h)=P(h(X)\neq Y)=\mathbb{E}[\mathbf{1}\{h(X)\neq Y\}]$, the expected 0–1 loss — the probability that the rule mislabels a fresh observation drawn from the joint distribution of $(X,Y)$. It cannot be computed directly because it is an expectation under the *unknown* population distribution. We can only estimate it: by the empirical (training) risk on the data, by a held-out test set, or by cross-validation. The training-risk estimate is biased downward, which is why fresh-data estimates are needed.

**2.** State the Bayes classifier and explain in what sense it is optimal.

> [!example]- Show answer
> The Bayes classifier predicts the class with the highest posterior probability: $h^*(x)=\arg\max_k P(Y=k\mid X=x)=\arg\max_k \pi_k f_k(x)$. In the two-class case, predict $1$ iff $P(Y=1\mid X=x)>\tfrac12$. It is optimal in the strong sense that it minimizes the true risk $R(h)$ over *all* possible classifiers — no rule, however clever, can achieve a lower error rate. It is the gold standard against which every practical method is measured, but it depends on the unknown posterior, so in practice we estimate it.

**3.** What is the Bayes risk, and why is it generally nonzero?

> [!example]- Show answer
> The Bayes risk $R^*=R(h^*)$ is the error rate of the Bayes classifier — the irreducible minimum error achievable by any rule. For two classes, $R^*=\mathbb{E}[\min\{r_1(X),1-r_1(X)\}]$ where $r_1(x)=P(Y=1\mid x)$. It is nonzero whenever the class-conditional distributions *overlap*: at points $x$ where both classes have appreciable probability, even the optimal rule must sometimes be wrong. The excess risk $R(\hat h)-R^*$ of a learned classifier measures how far estimation falls short of this floor, and consistent methods drive it to zero as $n\to\infty$.

**4.** Contrast generative and discriminative classifiers, giving an example of each.

> [!example]- Show answer
> A *generative* classifier models the full data-generating process: it estimates the priors $\pi_k$ and the class-conditional densities $f_k(x)$, then applies the Bayes rule $\arg\max_k \hat\pi_k\hat f_k(x)$. Examples: LDA, QDA, naive Bayes. A *discriminative* classifier models only the posterior $P(Y=k\mid x)$ or the decision boundary directly, without modeling $f_k(x)$. Example: logistic regression. Generative methods are more efficient when their distributional model is correct and handle missing features; discriminative methods are more robust to misspecification because they commit only to the boundary.

**5.** Derive why LDA gives a linear boundary while QDA gives a quadratic one.

> [!example]- Show answer
> Both assume $X\mid Y=k\sim N(\mu_k,\Sigma_k)$ and classify by $\arg\max_k \delta_k(x)$ with $\delta_k(x)=\log\pi_k+\log f_k(x)$. The Gaussian log-density contains a quadratic term $-\tfrac12(x-\mu_k)^\top\Sigma_k^{-1}(x-\mu_k)$. In **QDA** the covariances differ across classes, so the quadratic terms do not cancel when comparing two discriminants — the boundary $\delta_j(x)=\delta_k(x)$ is quadratic in $x$. In **LDA** all classes share one $\Sigma$; the $x^\top\Sigma^{-1}x$ term is identical across classes and cancels in the difference, leaving a function *linear* in $x$, hence a hyperplane boundary. LDA trades flexibility for parsimony and stability.

**6.** Write the logistic regression model and explain how it relates to LDA.

> [!example]- Show answer
> Logistic regression models the log-odds of the posterior linearly: $\log\frac{P(Y=1\mid x)}{P(Y=0\mid x)}=\beta_0+\beta^\top x$, equivalently $r_1(x)=\sigma(\beta_0+\beta^\top x)$ with the logistic sigmoid $\sigma$. Parameters are fit by maximum likelihood (via Newton–Raphson / IRLS, no closed form). Remarkably, the Gaussian-LDA model *implies* exactly this logistic posterior form — so LDA is a special case from the generative side. But logistic regression estimates the boundary directly and makes no Gaussian assumption on the features, so it is more robust when the class-conditionals are non-Gaussian, at the cost of discarding information when the Gaussian model is in fact correct.

**7.** How does the choice of $k$ in k-NN control the bias–variance trade-off?

> [!example]- Show answer
> k-NN classifies $x$ by majority vote among its $k$ nearest training points, a local estimate of $P(Y=1\mid x)$. Small $k$ (e.g. $k=1$) gives a very flexible, low-bias rule that follows the data closely but has high variance — the boundary is jagged and overfits ($k=1$ achieves zero training error). Large $k$ averages over many neighbors, giving low variance but high bias — the boundary is overly smooth and can blur real structure. Thus $k$ is the complexity knob; it is chosen to minimize estimated test error, typically by cross-validation.

**8.** Describe how a classification tree (CART) is grown and why pruning is necessary.

> [!example]- Show answer
> CART recursively partitions feature space with binary splits on single variables ("$X_j\le t$?"). At each node it picks the split that most reduces an impurity measure — Gini $\sum_k\hat p_k(1-\hat p_k)$ or entropy $-\sum_k\hat p_k\log\hat p_k$ — and leaves are labeled by majority class. A fully grown tree can perfectly separate the training data and therefore *overfits*: it has high variance and poor generalization. Pruning fixes this by growing a large tree and then collapsing nodes to minimize a cost-complexity criterion $\hat R(T)+\alpha|T|$, penalizing the leaf count $|T|$, with $\alpha$ (and hence tree size) selected by cross-validation.

**9.** Why does training error underestimate test error, and what is the VC bound's role?

> [!example]- Show answer
> Because the classifier is *chosen* to fit the training data, the same data that selected $\hat h$ then scores it, so $\hat R_n(\hat h)$ is optimistically biased for the true risk $R(\hat h)$ — the optimism grows with model flexibility. VC theory quantifies this: with VC dimension $d_{VC}$ measuring the capacity of the classifier class $\mathcal{H}$, a uniform bound states that with high probability $R(h)\le\hat R_n(h)+\sqrt{\tfrac{C(d_{VC}\log(n/d_{VC})+\log(1/\alpha))}{n}}$ for all $h\in\mathcal{H}$. The gap shrinks with $n$ and grows with $d_{VC}$, so higher capacity demands more data to generalize. This bound, derived from concentration inequalities, formally justifies capacity control.

**10.** *(Applied)* You must classify patients as high/low risk from 12 lab measurements with $n=200$ cases. Sketch how you would choose and validate a classifier.

> [!example]- Show answer
> First reserve an honest evaluation: hold out a test set, or use $K$-fold cross-validation given the modest $n=200$. Try several candidate methods spanning the bias–variance spectrum — LDA/QDA (cheap, stable; QDA risky with $d=12$, $n=200$ since it estimates per-class covariances), logistic regression (robust linear discriminative baseline, possibly with regularization), k-NN (tune $k$ by CV), and a pruned CART (tune $\alpha$ by CV, gains interpretability for clinicians). For each, use cross-validation to set tuning parameters and to estimate true error, *never* the training error which is optimistically biased. Compare methods on the held-out CV error, watch for class imbalance (consider sensitivity/specificity, not just overall error), and prefer the simplest model whose estimated risk is competitive — capacity control guards against overfitting with only 200 cases. Report the final model's error on the untouched test set.

**11.** *(Applied)* Your 1-nearest-neighbor classifier has 0% training error but disappointing held-out accuracy. Diagnose and propose fixes.

> [!example]- Show answer
> Zero training error with poor test accuracy is the textbook signature of **overfitting**: $1$-NN memorizes every training point (each point is its own nearest neighbor), so training error is trivially zero but the decision boundary is extremely jagged and high-variance. The training error here is a meaningless, maximally optimistic estimate of true risk. Fixes: increase $k$ (vote among more neighbors) and select $k$ by cross-validation to trade some bias for much lower variance; standardize/scale features so Euclidean distance is meaningful across the 12 measurements; consider dimensionality reduction or feature selection if some lab values are noise; and compare against lower-capacity methods (logistic regression, LDA) whose VC bound promises a smaller train–test gap at this sample size. Always judge by CV/held-out error, never training error.

## Deeper understanding (expansion)

> [!info]+ 💡 Why "you can't beat the Bayes rule" reframes the whole chapter
>
> The Bayes classifier is not an algorithm you run — it requires the unknown posterior $P(Y=k\mid x)$ — but it is the *target* of every method in the chapter. Reading the methods as estimators of $h^*$ unifies them: LDA/QDA/naive Bayes plug estimated $\hat\pi_k\hat f_k(x)$ into the Bayes form; logistic regression and k-NN estimate the posterior $r(x)$ and threshold; trees and SVMs estimate the boundary $\{x:r(x)=\tfrac12\}$ directly. This also explains the *two* sources of error in any classifier: **approximation error** (your model class may not contain $h^*$ — e.g. linear LDA cannot represent a curved optimal boundary) and **estimation error** (finite data means your fitted rule isn't even the best member of your class). The Bayes risk $R^*$ is what remains when both vanish — the noise floor set by genuine class overlap that no amount of data or cleverness removes.

> [!info]+ 💡 Capacity control as the unifying defense against overfitting
>
> Every method in this chapter has a complexity dial, and every dial is tuned the same way. k-NN has $k$ (small = complex), trees have the penalty $\alpha$ / leaf count, logistic and SVM have regularization, LDA-vs-QDA trades parameters for flexibility. VC theory explains *why* these dials matter: the train–test gap is bounded by a term that grows with capacity ($d_{VC}$) and shrinks with $n$. So the optimal complexity is not "as flexible as possible" but the sweet spot where added capacity stops buying lower bias faster than it adds variance. Cross-validation is the practical instrument that locates this sweet spot empirically without needing the (often loose) VC constants — it directly estimates the test error for each setting of the dial. The theory says *control capacity*; CV tells you *how much*.

> [!info]+ 💡 The kernel trick: linear methods reaching nonlinear boundaries
>
> SVMs maximize the margin to a linear separator, which alone seems limited. The kernel trick is the leverage: replacing inner products $\langle x_i,x_j\rangle$ with a kernel $K(x_i,x_j)=\langle\phi(x_i),\phi(x_j)\rangle$ implicitly lifts the data into a high- (even infinite-) dimensional feature space where a linear boundary corresponds to a richly nonlinear one in the original space — and the map $\phi$ is never computed explicitly. This is the same move as basis expansion in regression (Ch. 20), but done implicitly through the kernel. It dramatically raises capacity, which is exactly why the soft margin (regularization) and capacity control matter so much for SVMs: unconstrained kernel machines can shatter almost anything, so the margin is what keeps generalization honest.

## Connections

- [[12-statistical-decision-theory]] — Classification is decision theory with 0–1 loss: the Bayes classifier *is* the Bayes rule under that loss, and the Bayes risk is its minimized expected loss. ← The general $\arg\min$ over decision rules specializes here to $\arg\max_k$ over the posterior.
- [[13-linear-and-logistic-regression]] — Logistic regression is introduced as a regression tool there and reappears here as a discriminative classifier; LDA's linear discriminant mirrors linear regression's geometry. → A classifier is regression on a discrete $Y$, thresholded at $\tfrac12$.
- [[14-multivariate-models]] — LDA and QDA are direct applications of the multivariate Gaussian: the discriminant functions are just the log-densities of $N(\mu_k,\Sigma_k)$, and shared-vs-separate $\Sigma$ is what splits LDA from QDA.
- [[20-nonparametric-curve-estimation]] — k-NN, kernel classifiers, and tree-based rules are the classification counterparts of nonparametric smoothers; the same bias–variance trade-off and smoothing-parameter selection (now $k$, $\alpha$) carry over, with CV as the shared tuning device.
- [[04-inequalities]] — The VC uniform bound on the train–test gap is built from Hoeffding-/concentration-type inequalities; capacity control and generalization guarantees descend directly from those tail bounds. ← Without Chapter 4's inequalities, there is no theory of why training error controls true error.
- [[23-stochastic-processes]] — An adjacent late-text chapter; classification sits among the applied culmination of the inference machinery, with the same estimation-and-risk vocabulary applied to prediction rather than parameters.
