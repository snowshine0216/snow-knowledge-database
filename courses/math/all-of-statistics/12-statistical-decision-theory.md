---
tags: [decision-theory, risk-function, bayes-estimator, minimax, admissibility, stein-paradox, loss-function, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 12 — Statistical Decision Theory

> [!abstract]+ Chapter at a glance
>
> Decision theory is the unifying framework for *comparing* statistical procedures. Earlier chapters produced many estimators — MLE, method of moments, Bayes, plug-in — but never gave a principled way to say which is "better." This chapter supplies that calculus. An estimator becomes a **decision rule** $\hat\theta = \delta(X)$; a **loss function** $L(\theta,\hat\theta)$ measures the cost of guessing $\hat\theta$ when the truth is $\theta$; and the **risk function** $R(\theta,\hat\theta) = \mathbb{E}_\theta[L(\theta,\hat\theta)]$ summarizes expected loss as a function of the unknown parameter. The central difficulty is that risk functions for two competing estimators usually *cross* — neither dominates everywhere — so there is no uniformly best estimator. We rescue comparability by collapsing the risk function to a single number two ways: averaging it against a prior (the **Bayes risk**, minimized by the Bayes estimator) or taking its worst case (the **minimax risk**, minimized by the minimax rule). Along the way we meet **admissibility**, the deep link between Bayes and minimax rules, and **Stein's paradox** — the shocking fact that in three or more dimensions the sample mean is inadmissible.

## Core concepts

**Decision rules and the setup.** An estimator is just a function of the data, $\hat\theta = \delta(X)$, also called a *decision rule*. Decision theory abstracts away "estimation" and asks, for any action we might take based on data, how costly that action is when the true state of nature is $\theta$. This abstraction is what lets us treat point estimation, interval estimation, and hypothesis testing under one roof.

**Loss functions.** A *loss function* $L(\theta, \hat\theta)$ quantifies the penalty for the discrepancy between $\hat\theta$ and $\theta$. Common choices:

- **Squared error loss**: $L(\theta,\hat\theta) = (\theta - \hat\theta)^2$ — by far the most used, mathematically convenient, penalizes large errors heavily.
- **Absolute error loss**: $L(\theta,\hat\theta) = |\theta - \hat\theta|$ — more robust to outliers, linear penalty.
- **$L_p$ loss**: $L(\theta,\hat\theta) = |\theta - \hat\theta|^p$ — a family generalizing the two above.
- **Zero–one loss**: $L(\theta,\hat\theta) = 0$ if $\hat\theta = \theta$ and $1$ otherwise — natural for discrete/classification problems.
- **Kullback–Leibler loss**: $L(\theta,\hat\theta) = \int \log\!\big(p(x;\theta)/p(x;\hat\theta)\big)\, p(x;\theta)\, dx$ — measures discrepancy between the true and estimated *distributions*.

The choice of loss is a modeling decision, not a mathematical given, and the "best" estimator can depend on it.

**The risk function.** The *risk* is the expected loss,
$$R(\theta, \hat\theta) = \mathbb{E}_\theta\big[L(\theta,\hat\theta)\big] = \int L(\theta, \delta(x))\, p(x;\theta)\, dx,$$
viewed as a function of the true (unknown) $\theta$. The expectation is over the data $X \sim p(\cdot;\theta)$ with $\theta$ held fixed; $\hat\theta = \delta(X)$ is random, $\theta$ is not. Risk is the fundamental object we compare estimators by.

**Risk = MSE = bias² + variance (squared-error loss).** Under squared error loss the risk is exactly the mean squared error, which decomposes as
$$R(\theta,\hat\theta) = \mathbb{E}_\theta[(\hat\theta-\theta)^2] = \underbrace{\big(\mathbb{E}_\theta[\hat\theta]-\theta\big)^2}_{\text{bias}^2} + \underbrace{\mathbb{V}_\theta(\hat\theta)}_{\text{variance}}.$$
This connects decision theory back to the bias–variance trade-off already seen in estimation.

**Risk functions cross — no uniformly best estimator.** Plot $R(\theta,\hat\theta)$ against $\theta$ for two estimators and the curves typically intersect: estimator A wins for some $\theta$, estimator B for others. We say $\hat\theta_1$ *dominates* $\hat\theta_2$ if $R(\theta,\hat\theta_1) \le R(\theta,\hat\theta_2)$ for all $\theta$ with strict inequality somewhere. Most pairs of sensible estimators do **not** dominate one another, so there is no estimator with uniformly smallest risk. This impossibility is the motivation for the rest of the chapter: we need a *one-number summary* of the risk curve.

**Bayes risk and the Bayes estimator.** Given a prior $f(\theta)$, average the risk against it:
$$r(f, \hat\theta) = \int R(\theta, \hat\theta)\, f(\theta)\, d\theta.$$
This is the *Bayes risk*. The estimator minimizing $r(f,\hat\theta)$ is the *Bayes estimator* (Bayes rule). A key computational fact: minimizing the Bayes risk is equivalent to minimizing, for each $x$, the **posterior expected loss**
$$\int L(\theta, \hat\theta)\, f(\theta \mid x)\, d\theta,$$
where $f(\theta\mid x)$ is the posterior. So the Bayes rule is found pointwise, $x$ by $x$.

**Which Bayes estimator for which loss.** Minimizing posterior expected loss yields familiar summaries of the posterior:

- **Squared error** $\Rightarrow$ posterior **mean**, $\hat\theta = \mathbb{E}[\theta\mid x]$.
- **Absolute error** $\Rightarrow$ posterior **median**.
- **Zero–one loss** $\Rightarrow$ posterior **mode** (the MAP estimate).

**Minimax rules.** Instead of averaging the risk curve, take its *worst case*. The minimax estimator minimizes the maximum risk:
$$\hat\theta_{\text{minimax}} = \arg\min_{\hat\theta}\ \sup_\theta R(\theta, \hat\theta).$$
Minimax is the conservative, "protect against the worst $\theta$" criterion; Bayes is the "average over a prior" criterion. The minimax risk is $\inf_{\hat\theta}\sup_\theta R(\theta,\hat\theta)$.

**Admissibility.** An estimator $\hat\theta$ is **inadmissible** if some other estimator dominates it (risk $\le$ everywhere, $<$ somewhere); otherwise it is **admissible**. Admissibility is a weak, almost minimal requirement — an inadmissible estimator can be uniformly improved, so it should never be used. But admissibility alone does not single out a good estimator: silly estimators (e.g. the constant $\hat\theta \equiv c$) can be admissible because nothing beats them *at* $\theta = c$.

**The Bayes–minimax connection.** The two summaries are deeply linked:

- If a Bayes rule has **constant risk** (risk that does not depend on $\theta$), then it is **minimax**.
- More generally, minimax rules arise as Bayes rules against a **least-favorable prior** — the prior that makes the problem hardest. The least-favorable prior is the one maximizing the Bayes risk of its own Bayes rule.
- A unique Bayes rule is admissible. This bridges the average-case and worst-case worlds and is the standard route to *proving* an estimator is minimax.

**Stein's paradox / the James–Stein estimator.** Consider estimating the mean vector $\theta = (\theta_1,\dots,\theta_d)$ of a multivariate normal $X \sim N(\theta, I)$ under total squared error loss $\sum_i(\hat\theta_i - \theta_i)^2$. The obvious estimator is the data itself, $\hat\theta = X$ (the MLE / sample mean). Astonishingly, for **dimension $d \ge 3$** this estimator is **inadmissible**: the **James–Stein shrinkage estimator**, which pulls $X$ toward the origin by a data-dependent factor, has *strictly smaller risk for every $\theta$*. Shrinkage borrows strength across coordinates even when they are independent. For $d = 1$ and $d = 2$ the sample mean is admissible; the phenomenon switches on at three dimensions. Stein's paradox is the headline demonstration that "obvious" estimators can be provably improvable, and that admissibility is a subtle, dimension-dependent property.

**The takeaway.** Decision theory turns the vague question "which estimator is better?" into a precise one. The answer depends on (a) the loss function you adopt and (b) how you collapse the risk function into a single number — average against a prior (Bayes) or guard against the worst case (minimax). Different choices legitimately give different "best" estimators.

## Quiz

**1.** In decision-theoretic language, what is an estimator, and what is the difference between a loss function and a risk function?

> [!example]- Show answer
> An estimator is a **decision rule** $\hat\theta = \delta(X)$ — any function of the data. The **loss function** $L(\theta,\hat\theta)$ is the cost of reporting $\hat\theta$ when the truth is $\theta$; it is a deterministic function of two arguments and involves no expectation. The **risk function** $R(\theta,\hat\theta) = \mathbb{E}_\theta[L(\theta,\hat\theta)]$ is the *expected* loss, averaging over the randomness of the data $X \sim p(\cdot;\theta)$ with $\theta$ held fixed. So loss is per-outcome; risk is the average loss for a given $\theta$, viewed as a function of $\theta$.

**2.** Under squared error loss, show how the risk decomposes, and name the two pieces.

> [!example]- Show answer
> Under squared error loss the risk equals the mean squared error, which decomposes as $R(\theta,\hat\theta) = \mathbb{E}_\theta[(\hat\theta-\theta)^2] = \text{bias}^2 + \text{variance}$, where $\text{bias} = \mathbb{E}_\theta[\hat\theta] - \theta$ and the variance is $\mathbb{V}_\theta(\hat\theta)$. The derivation adds and subtracts $\mathbb{E}_\theta[\hat\theta]$ inside the square and expands; the cross term vanishes. This is exactly the bias–variance trade-off, now seen as a special case of risk.

**3.** Why is there generally no "uniformly best" estimator? What does it mean for one estimator to *dominate* another?

> [!example]- Show answer
> For two competing estimators, the risk curves $R(\theta,\hat\theta)$ plotted against $\theta$ usually **cross**: one estimator is better for some values of $\theta$ and worse for others. So no single estimator achieves the smallest risk for *every* $\theta$. We say $\hat\theta_1$ **dominates** $\hat\theta_2$ if $R(\theta,\hat\theta_1) \le R(\theta,\hat\theta_2)$ for all $\theta$, with strict inequality for at least one $\theta$. Domination is rare among sensible estimators, which is why we need one-number summaries (Bayes risk, minimax risk) to compare them.

**4.** Define the Bayes risk. How is finding the Bayes estimator related to the posterior?

> [!example]- Show answer
> The **Bayes risk** of $\hat\theta$ under prior $f$ is the prior-averaged risk, $r(f,\hat\theta) = \int R(\theta,\hat\theta) f(\theta)\, d\theta$. The **Bayes estimator** minimizes this quantity. A central simplification: minimizing the Bayes risk is equivalent to minimizing, separately for each observed $x$, the **posterior expected loss** $\int L(\theta,\hat\theta) f(\theta\mid x)\, d\theta$. So the Bayes rule can be computed pointwise from the posterior $f(\theta\mid x)$ rather than by a global optimization over decision rules.

**5.** For squared error, absolute error, and zero–one loss, which posterior summary is the Bayes estimator in each case?

> [!example]- Show answer
> Minimizing the posterior expected loss gives a familiar posterior summary for each loss. **Squared error** $\to$ the posterior **mean** $\mathbb{E}[\theta\mid x]$ (minimizing expected squared deviation is achieved at the mean). **Absolute error** $\to$ the posterior **median** (the minimizer of expected absolute deviation). **Zero–one loss** $\to$ the posterior **mode**, i.e. the MAP estimate. These mirror the corresponding facts about minimizing expected loss for an ordinary random variable.

**6.** Define the minimax estimator. How does the minimax criterion differ in spirit from the Bayes criterion?

> [!example]- Show answer
> The **minimax estimator** minimizes the worst-case risk: $\hat\theta_{\text{minimax}} = \arg\min_{\hat\theta} \sup_\theta R(\theta,\hat\theta)$. It collapses the risk curve to a single number by taking its *maximum* over $\theta$. In spirit, minimax is **conservative / pessimistic**: it protects against the least favorable value of $\theta$, caring only about the worst point on the risk curve. The Bayes criterion instead **averages** the risk curve against a prior $f$, so it weights values of $\theta$ by how plausible the prior deems them. Both are legitimate one-number summaries that can favor different estimators.

**7.** Define admissibility. Why is admissibility a necessary but far from sufficient condition for an estimator to be good?

> [!example]- Show answer
> An estimator is **inadmissible** if some other estimator dominates it — has risk $\le$ everywhere and strictly smaller somewhere — and **admissible** otherwise. Admissibility is **necessary** because an inadmissible estimator can be uniformly improved, so there is never a reason to use it. But it is **not sufficient**: many bad estimators are admissible. The classic example is a constant estimator $\hat\theta \equiv c$, which is admissible because no other rule can beat it *at* $\theta = c$ (its risk there is zero), even though it ignores the data entirely. So admissibility weeds out the obviously dominated, nothing more.

**8.** State the connection between Bayes rules and minimax rules. How is this used to prove an estimator is minimax?

> [!example]- Show answer
> The key bridge: a **Bayes rule with constant risk** (risk that does not depend on $\theta$) is **minimax**. More generally, minimax rules are Bayes rules against a **least-favorable prior** — the prior that maximizes the Bayes risk, making the problem hardest. To prove a given estimator is minimax, one common strategy is to exhibit a prior for which the estimator is the Bayes rule and verify its risk is constant in $\theta$; then it automatically attains the minimax value. A unique Bayes rule is also admissible, linking the average-case and worst-case theories.

**9.** Explain Stein's paradox. For what dimension does it kick in, and what does it say about the sample mean?

> [!example]- Show answer
> Stein's paradox concerns estimating the mean vector $\theta$ of $X \sim N(\theta, I)$ in $d$ dimensions under total squared error loss. The natural estimator $\hat\theta = X$ (the MLE / sample mean) is **inadmissible whenever $d \ge 3$**: the **James–Stein** shrinkage estimator, which pulls $X$ toward the origin by a data-dependent factor, has strictly smaller risk for *every* $\theta$. For $d = 1$ or $d = 2$ the sample mean is admissible, so the effect switches on exactly at three dimensions. The paradox is that shrinkage helps even though the coordinates are independent — it "borrows strength" across them — overturning the intuition that the obvious estimator is best.

**10.** *(Applied)* You compare two estimators of a normal mean: the MLE $\bar X$ and a shrinkage estimator $\hat\theta = c\bar X$ with $0 < c < 1$, under squared error loss. Sketch how their risk functions behave and explain when each is preferred and why no clear winner exists.

> [!example]- Show answer
> Write the risk as bias² + variance. The MLE $\bar X$ is unbiased, so its risk is constant in $\theta$, equal to the variance $\sigma^2/n$ — a flat horizontal line. The shrinkage estimator $c\bar X$ has variance $c^2\sigma^2/n$ (smaller, since $c<1$) but bias $(c-1)\theta$, so its risk is $c^2\sigma^2/n + (c-1)^2\theta^2$ — a **parabola in $\theta$** that is low near $\theta = 0$ and rises without bound as $|\theta|$ grows. The two curves **cross**: shrinkage wins for $\theta$ near 0 (variance reduction dominates) and the MLE wins for large $|\theta|$ (where shrinkage bias explodes). Because the risk curves intersect, neither dominates — exactly the no-uniformly-best situation that forces us to pick a one-number summary (Bayes vs minimax) to declare a winner.

**11.** *(Applied)* A medical decision system estimates a disease-severity parameter; under-estimating severity is far costlier than over-estimating. How would you encode this in decision-theoretic terms, and how does it change the resulting estimator relative to squared error loss?

> [!example]- Show answer
> Encode the asymmetry directly in the **loss function**: use an *asymmetric* loss that penalizes under-estimates ($\hat\theta < \theta$) more heavily than over-estimates, rather than the symmetric squared error $(\theta-\hat\theta)^2$. For example a piecewise or weighted-quadratic loss with a larger coefficient on the under-estimation branch. The Bayes estimator then minimizes the *posterior expected* asymmetric loss, which pushes the estimate **upward** relative to the posterior mean — the optimal point shifts toward over-estimation to avoid the expensive under-estimation tail. This illustrates the chapter's core message: the "best" estimator is not absolute; it is determined by the loss you choose, and changing the loss changes the answer in a principled, computable way.

## Deeper understanding (expansion)

> [!info]+ 💡 Why averaging and worst-casing are the only two honest moves
>
> Once you accept that risk functions cross, you must reduce a whole *function* of $\theta$ to a single comparable number. There are essentially two principled ways to do this, and they correspond to two philosophies. **Averaging** the risk against a prior gives the Bayes risk — this requires you to commit to a weighting $f(\theta)$ over which $\theta$ values matter, importing subjective or external information. **Worst-casing** via the supremum gives the minimax risk — this requires no prior but is pessimistic, optimizing entirely for the single hardest $\theta$, which may be implausible in practice. The two are not adversaries: the minimax solution is the Bayes solution for the *least-favorable prior*, the prior under which the worst case is, in an averaged sense, forced. So minimax can be read as "Bayes with the most cautious prior nature could choose." Understanding this duality is what lets you move fluently between frequentist (minimax, admissibility) and Bayesian (posterior expected loss) vocabularies — they are two coordinate systems on the same risk surface.

> [!info]+ 💡 What Stein's paradox is really telling us
>
> The shock of Stein's paradox is not a computational trick — it is that *admissibility is genuinely dimension-dependent and counterintuitive*. The sample mean is the MLE, it is unbiased, it is minimax, and it is the obvious answer; yet in $d \ge 3$ it is uniformly beaten by a biased shrinkage estimator. The deep lesson is that **pooling information across nominally unrelated problems pays off**: even when the $d$ coordinates are independent $N(\theta_i,1)$ variables, estimating them *jointly* under total squared error lets you trade a little bias for a large variance reduction, and the geometry of high dimensions guarantees a net win. This is the theoretical ancestor of modern **regularization and shrinkage** — ridge regression, hierarchical/empirical Bayes, James–Stein-style estimators throughout statistics and machine learning. Whenever you add a penalty term to "shrink" parameters, you are exploiting the same phenomenon Stein discovered. It also warns against treating "obvious" or "unbiased" as synonyms for "good."

> [!info]+ 💡 Loss is a modeling choice, not a mathematical default
>
> Beginners reach for squared error loss reflexively because it is differentiable and yields the posterior mean. But the choice of loss is a *substantive decision* about what kinds of mistakes hurt. Squared error punishes large errors quadratically and treats over- and under-estimation symmetrically; absolute error is more robust to outliers and yields the posterior median; zero–one loss cares only about exact correctness and yields the mode/MAP; Kullback–Leibler loss measures discrepancy between whole *distributions* rather than parameter values, which is the right currency when the downstream use is predictive or generative. In applied work the loss should come from the decision context — the asymmetric medical example above is the rule, not the exception. The same data and model can yield materially different "optimal" estimators under different losses, so naming your loss explicitly is part of doing the statistics honestly.

## Connections

- [[03-expectation]] — the **risk function** is an expectation of the loss, $R(\theta,\hat\theta)=\mathbb{E}_\theta[L(\theta,\hat\theta)]$, and the Bayes/minimax summaries are further integrals (averaging) and suprema over those expectations. → Decision theory is built entirely on the expectation machinery developed there; the bias–variance decomposition is a direct application of $\mathbb{E}$ and $\mathbb{V}$.
- [[06-models-inference-and-learning]] — that chapter introduces estimators and the bias–variance trade-off informally. → Decision theory formalizes "which estimator is better?" by recasting estimators as decision rules and comparing their risk; ← the MSE decomposition seen here is the squared-error risk.
- [[09-parametric-inference]] — the **MLE** is one decision rule among many. → Decision theory evaluates the MLE on the same footing as Bayes and shrinkage estimators, and reveals (via Stein's paradox) that the MLE can be inadmissible. ← provides the estimators this chapter scores.
- [[11-bayesian-inference]] — the **Bayes estimator** is defined here as the minimizer of posterior expected loss; ← the posterior mean, median, and mode all reappear as Bayes rules under squared, absolute, and zero–one loss respectively. → the Bayes–minimax duality and least-favorable priors connect Bayesian computation to frequentist worst-case guarantees.
- [[22-classification]] — classification uses **zero–one loss**, whose risk is the misclassification probability, and the **Bayes classifier** is the rule that minimizes risk (posterior-mode decision). → this chapter supplies the loss/risk vocabulary that defines optimality for classifiers; ← Bayes risk there is the irreducible error rate.
