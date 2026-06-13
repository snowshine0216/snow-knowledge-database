---
tags: [monte-carlo, importance-sampling, mcmc, metropolis-hastings, gibbs-sampling, bayesian-computation, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 24 — Simulation Methods

> [!abstract]+ Chapter at a glance
>
> Most interesting statistical quantities — expectations, integrals, posterior summaries, p-values, predictive distributions — have no closed form. Simulation replaces analytic integration with *random sampling*: draw many points, then average a function of them. This chapter develops three workhorses. **Basic Monte Carlo integration** estimates $E[g(X)]$ by a sample average and is unbiased, consistent, and — crucially — has error that shrinks like $1/\sqrt{N}$ *regardless of dimension*. **Importance sampling** lets you sample from a convenient proposal $g$ and reweight back to the target $f$, with a variance that lives or dies by the proposal's match to the integrand. **Markov chain Monte Carlo (MCMC)** — Metropolis–Hastings and the Gibbs sampler — constructs a Markov chain whose *stationary distribution* is the target, so even when you cannot sample from $f$ directly (the typical Bayesian posterior), you can still generate (correlated) draws from it. The chapter leans on the convergence theory of Chapter 23 to justify MCMC and on the LLN/CLT of Chapter 5 to justify ordinary Monte Carlo.

## Core concepts

**Why simulate.** The recurring problem is computing a quantity of the form $\theta = \int g(x) f(x)\,dx = E[g(X)]$ where $X \sim f$. In low dimensions you could use numerical quadrature, but in high dimensions deterministic grids are hopeless (the curse of dimensionality), and many targets — especially Bayesian posteriors — are known only up to an unknown normalizing constant. Simulation sidesteps both problems: if you can *draw samples* from the relevant distribution, you can approximate almost any summary of it.

**Basic Monte Carlo integration.** Draw $X_1, \dots, X_N \stackrel{\text{iid}}{\sim} f$ and estimate
$$\hat\theta = \frac{1}{N}\sum_{i=1}^{N} g(X_i).$$
By the law of large numbers $\hat\theta \xrightarrow{P} \theta$ (it is *consistent*), and $E[\hat\theta] = \theta$ exactly (it is *unbiased*). The variance is $\operatorname{Var}(\hat\theta) = \sigma^2/N$ where $\sigma^2 = \operatorname{Var}(g(X))$, so the standard error is
$$\widehat{\text{se}} = \frac{s}{\sqrt{N}}, \qquad s^2 = \frac{1}{N-1}\sum_{i=1}^N\big(g(X_i) - \hat\theta\big)^2.$$
A CLT-based approximate $1-\alpha$ interval is $\hat\theta \pm z_{\alpha/2}\,\widehat{\text{se}}$. The headline fact: the error decays like $1/\sqrt{N}$ **independent of the dimension** of $X$. That rate is slow (cutting the error in half costs $4\times$ the samples) but it does *not* degrade as dimension grows — the property that makes Monte Carlo the method of choice for high-dimensional integrals.

**Computing probabilities and tail areas.** Many targets are special cases: a probability $P(X \in A)$ is just $E[\mathbf{1}_A(X)]$, so set $g = \mathbf{1}_A$ and the Monte Carlo estimate is the fraction of draws landing in $A$. A p-value, a coverage probability, an expected loss, or a predictive mean all reduce to "draw, evaluate, average."

**Importance sampling.** Sometimes sampling from $f$ is hard, or $g$ is large exactly where $f$ puts little mass (so plain Monte Carlo wastes draws). Pick a *proposal* density $g$ (often written $g$ or $h$ in the book; here call the proposal $q$ to avoid clashing with the integrand) that is easy to sample and rewrite
$$\theta = \int h(x) f(x)\,dx = \int h(x)\,\frac{f(x)}{q(x)}\,q(x)\,dx = E_q\!\left[h(X)\,\frac{f(X)}{q(X)}\right].$$
Draw $X_1,\dots,X_N \sim q$ and use
$$\hat\theta = \frac{1}{N}\sum_{i=1}^N h(X_i)\,\frac{f(X_i)}{q(X_i)}, \qquad w_i = \frac{f(X_i)}{q(X_i)}\ \text{(importance weights)}.$$
This is still unbiased, but its *variance* depends entirely on $q$. A good proposal mimics $|h(x)|f(x)$ (puts samples where the integrand is large); a bad proposal — one with lighter tails than $f$ where $h$ matters — produces a few enormous weights, huge variance, and possibly an estimator with infinite variance. **Importance sampling lives or dies by the proposal.**

**Markov chain Monte Carlo (MCMC).** When even importance sampling is impractical — e.g. a high-dimensional Bayesian posterior $f(\theta\mid \text{data})$ known only up to a constant — build a *Markov chain* $X_0, X_1, X_2, \dots$ whose **stationary distribution is the target $f$**. Run the chain a long time; after it has converged, the states $X_t$ are (correlated) draws from $f$, and time-averages $\frac{1}{N}\sum_t g(X_t)$ estimate $E_f[g(X)]$. The justification is exactly the ergodic / convergence theory of Markov chains from Chapter 23: an irreducible, aperiodic chain converges to its stationary distribution, and ergodic averages converge to expectations under that distribution.

**Metropolis–Hastings.** The general recipe to *design* such a chain. Given current state $x$, draw a candidate $x'$ from a proposal $q(x'\mid x)$, then accept the move with probability
$$r(x, x') = \min\!\left\{1,\ \frac{f(x')\,q(x \mid x')}{f(x)\,q(x' \mid x)}\right\}.$$
If accepted, the next state is $x'$; otherwise the chain *stays* at $x$. This acceptance rule forces the chain to satisfy **detailed balance** with respect to $f$, $f(x)\,P(x\to x') = f(x')\,P(x'\to x)$, which guarantees $f$ is stationary. Two practical points: (1) the **normalizing constant cancels** in the ratio $f(x')/f(x)$, so you only need the target *up to a constant* — precisely the Bayesian situation where $f(\theta\mid \text{data}) \propto \mathcal{L}(\theta)\pi(\theta)$ and the marginal likelihood is unknown. (2) When the proposal is symmetric, $q(x'\mid x) = q(x\mid x')$, the ratio simplifies to $\min\{1, f(x')/f(x)\}$ — the original *Metropolis* algorithm; a random-walk proposal $x' = x + \varepsilon$ is the standard symmetric choice.

**Gibbs sampling.** A special case for multivariate targets that is often easier than tuning a proposal. To sample $(X_1,\dots,X_k)\sim f$, cycle through the coordinates, drawing each from its **full conditional distribution** given the current values of all the others:
$$X_1^{(t+1)} \sim f(x_1 \mid x_2^{(t)}, \dots, x_k^{(t)}),\quad X_2^{(t+1)} \sim f(x_2 \mid x_1^{(t+1)}, x_3^{(t)}, \dots),\ \dots$$
Every Gibbs update is accepted (it is a Metropolis–Hastings step with acceptance probability $1$). Gibbs is the natural choice when the conditionals are standard distributions you can sample directly, which happens often in hierarchical Bayesian models and conjugate setups.

**Diagnostics and practice.** MCMC trades independent draws for a chain that is easy to construct but must be *checked*. Key practical issues:
- **Burn-in**: discard an initial segment so that summaries reflect the stationary distribution, not the (arbitrary) starting point.
- **Mixing / autocorrelation**: consecutive states are correlated; a slowly-mixing chain explores the space sluggishly, so effective sample size is much smaller than $N$. Trace plots and autocorrelation plots diagnose this.
- **Proposal scale / acceptance rate**: for random-walk Metropolis, too small a step gives high acceptance but tiny moves (poor mixing); too large gives many rejections (the chain gets stuck). A moderate acceptance rate balances the two.
- **Convergence**: run multiple chains from different starts and compare; no diagnostic *proves* convergence, only failure to converge.

**The payoff.** MCMC is what makes modern Bayesian inference (Chapter 11) computationally feasible: posterior means, credible intervals, marginal posteriors, and predictive distributions all become "run the chain, then average / take quantiles of the draws."

## Quiz

**1.** What general quantity is Monte Carlo integration designed to approximate, and what is the basic estimator?

> [!example]- Show answer
> It approximates an expectation / integral $\theta = E[g(X)] = \int g(x) f(x)\,dx$, where $X \sim f$. The basic estimator draws $X_1,\dots,X_N \stackrel{\text{iid}}{\sim} f$ and forms the sample average $\hat\theta = \frac{1}{N}\sum_{i=1}^N g(X_i)$. Because probabilities and many summaries are themselves expectations (e.g. $P(X\in A) = E[\mathbf{1}_A(X)]$), this one device covers a wide range of targets. The whole point is that you only need the ability to *sample* from $f$ and to *evaluate* $g$.

**2.** Show that $\hat\theta$ is unbiased and consistent, and state its standard error.

> [!example]- Show answer
> Unbiasedness: $E[\hat\theta] = \frac{1}{N}\sum_i E[g(X_i)] = E[g(X)] = \theta$ exactly, for any $N$. Consistency: by the law of large numbers $\hat\theta \xrightarrow{P} \theta$ as $N\to\infty$. Its variance is $\sigma^2/N$ with $\sigma^2 = \operatorname{Var}(g(X))$, so the standard error is $\widehat{\text{se}} = s/\sqrt{N}$, where $s^2$ is the sample variance of the $g(X_i)$. This also gives an immediate CLT-based interval $\hat\theta \pm z_{\alpha/2}\widehat{\text{se}}$.

**3.** Monte Carlo error decays like $1/\sqrt{N}$. Why is the dimension-independence of this rate so important?

> [!example]- Show answer
> The standard error is $\sigma/\sqrt{N}$, which contains no factor depending on the dimension $d$ of $X$. Deterministic numerical integration (grids/quadrature) suffers the curse of dimensionality: the work to maintain a fixed accuracy grows exponentially in $d$. Monte Carlo's $1/\sqrt{N}$ rate is *slow* in $N$ (halving the error needs four times as many samples) but it does not deteriorate as $d$ grows. That is exactly why simulation is the default tool for high-dimensional integrals, which are ubiquitous in Bayesian inference.

**4.** Derive the importance sampling estimator and explain when you would use it.

> [!example]- Show answer
> Write $\theta = \int h(x) f(x)\,dx = \int h(x)\frac{f(x)}{q(x)} q(x)\,dx = E_q[h(X) f(X)/q(X)]$, where $q$ is a proposal you *can* sample. Drawing $X_i \sim q$ gives $\hat\theta = \frac{1}{N}\sum_i h(X_i) w_i$ with importance weights $w_i = f(X_i)/q(X_i)$. You use it when sampling directly from $f$ is hard, or when $h$ is concentrated where $f$ has little mass so plain Monte Carlo wastes draws. The trick is to redirect samples toward the important region and correct the bias with the weights.

**5.** Why can a poor importance-sampling proposal be disastrous, and what makes a good one?

> [!example]- Show answer
> The estimator's variance depends on the weights $w_i = f(X_i)/q(X_i)$. If $q$ has lighter tails than $f$ in regions where $h\cdot f$ is large, occasional samples get enormous weights, producing huge — possibly infinite — variance and an unreliable estimate dominated by a few points. A good proposal mimics $|h(x)|f(x)$: it places samples where the integrand is large and keeps the weights roughly bounded. The slogan is "importance sampling lives or dies by the proposal."

**6.** What is the central idea of MCMC, and which earlier chapter justifies it?

> [!example]- Show answer
> Instead of generating independent draws from the target $f$, MCMC constructs a *Markov chain* whose **stationary distribution is $f$**. After running long enough to converge, the chain's states are (correlated) draws from $f$, and time-averages $\frac{1}{N}\sum_t g(X_t)$ estimate $E_f[g(X)]$. The justification is the Markov-chain convergence/ergodic theory of Chapter 23: an irreducible, aperiodic chain converges to its stationary distribution and ergodic averages converge to expectations under it. MCMC thus turns a hard sampling problem into an easier chain-construction problem.

**7.** State the Metropolis–Hastings acceptance probability and explain what property it enforces.

> [!example]- Show answer
> From state $x$, propose $x' \sim q(\cdot\mid x)$ and accept with probability $r(x,x') = \min\{1,\ \frac{f(x') q(x\mid x')}{f(x) q(x'\mid x)}\}$; if rejected, the chain stays at $x$. This rule forces **detailed balance** with respect to $f$: $f(x) P(x\to x') = f(x') P(x'\to x)$. Detailed balance implies $f$ is a stationary distribution of the chain, which is what makes the long-run draws come from $f$. The proposal $q$ only governs efficiency, not correctness.

**8.** Why does Metropolis–Hastings only need the target up to a normalizing constant?

> [!example]- Show answer
> The target enters only through the ratio $f(x')/f(x)$. If $f = \tilde f / Z$ where $Z$ is an unknown constant, then $f(x')/f(x) = \tilde f(x')/\tilde f(x)$ — the $Z$ cancels. This is exactly the Bayesian situation: the posterior $f(\theta\mid\text{data}) \propto \mathcal{L}(\theta)\pi(\theta)$ is known only up to the marginal likelihood, which is itself an intractable integral. M–H lets you sample the posterior using just the (computable) product of likelihood and prior, never needing $Z$.

**9.** Describe the Gibbs sampler and when it is preferred over a tuned Metropolis–Hastings step.

> [!example]- Show answer
> The Gibbs sampler updates one coordinate at a time, drawing each from its **full conditional** $f(x_j \mid x_{-j})$ given the current values of the other coordinates, cycling through all $k$ coordinates per sweep. Each such update is a Metropolis–Hastings step with acceptance probability exactly $1$ (no rejections). It is preferred when the full conditionals are standard distributions you can sample directly — common in conjugate and hierarchical Bayesian models — because it needs no proposal tuning and never wastes proposals on rejection.

**10.** *(Applied)* You run a random-walk Metropolis chain and observe a 1% acceptance rate with a trace plot that gets stuck for long stretches. Diagnose the problem and propose fixes.

> [!example]- Show answer
> A 1% acceptance rate means almost every proposed move is rejected, so the chain sits in place — the proposal step size is too large, repeatedly jumping into low-density regions. The sticking causes high autocorrelation and a tiny effective sample size, so summaries are unreliable. Fixes: shrink the random-walk proposal scale to raise acceptance toward a moderate level (so moves are accepted but still meaningful in size), discard a burn-in segment, and run several chains from dispersed starts to check mixing and convergence. Also inspect autocorrelation plots and consider thinning or reparameterizing if mixing stays poor.

**11.** *(Applied)* You want the posterior mean and a 95% credible interval for a parameter $\theta$ in a model where the posterior is known only up to a constant. Sketch how to obtain them by simulation.

> [!example]- Show answer
> Run an MCMC sampler (Metropolis–Hastings or Gibbs) targeting $f(\theta\mid\text{data}) \propto \mathcal{L}(\theta)\pi(\theta)$ — the unknown normalizing constant is irrelevant because only ratios are used. Generate draws $\theta_1,\dots,\theta_N$, discard the burn-in, and check trace/autocorrelation plots for adequate mixing. Estimate the posterior mean by the sample average $\frac{1}{N}\sum_t \theta_t$ and the 95% credible interval by the empirical 2.5% and 97.5% quantiles of the retained draws. This is precisely how MCMC makes Bayesian inference of Chapter 11 computationally feasible for complex models.

## Deeper understanding (expansion)

> [!info]+ 💡 Why $1/\sqrt{N}$ is both a blessing and a curse
>
> The $\sigma/\sqrt{N}$ rate is the same CLT-driven rate that governs ordinary sample means — Monte Carlo *is* an application of the LLN and CLT to a synthetic sample we generate ourselves. The blessing is dimension-independence: a 100-dimensional integral and a 1-dimensional integral both converge at $1/\sqrt{N}$, whereas a deterministic grid would need exponentially many points in 100 dimensions. The curse is that $1/\sqrt{N}$ is genuinely slow — three-digit accuracy needs on the order of a million samples, and you cannot buy a faster rate without extra structure. Variance reduction techniques (importance sampling, control variates, antithetic variates) attack the constant $\sigma$, not the exponent $1/2$. So Monte Carlo wins by being *robust to dimension*, not by being *fast*.

> [!info]+ 💡 Detailed balance: the engine behind correctness
>
> The reason Metropolis–Hastings "just works" is the detailed-balance (reversibility) condition $f(x)P(x\to x') = f(x')P(x'\to x)$. Summing both sides over $x$ shows that if the chain is currently distributed as $f$, it stays distributed as $f$ — i.e. $f$ is stationary. The clever part is that the acceptance ratio $\min\{1, \frac{f(x')q(x\mid x')}{f(x)q(x'\mid x)}\}$ is engineered precisely so that the transition kernel satisfies this equation *for any* proposal $q$ (subject to mild support conditions). This is why you have enormous freedom in choosing $q$: the proposal affects only how fast the chain mixes, never which distribution it converges to. Gibbs sampling is then the special case where the proposal is the full conditional, giving acceptance probability $1$.

> [!info]+ 💡 Independent draws vs. a correlated chain — the central trade-off
>
> Basic Monte Carlo and importance sampling produce *independent* samples, so the textbook standard error $s/\sqrt{N}$ applies directly and convergence is easy to certify. MCMC produces a *correlated* sequence: consecutive states resemble each other, so $N$ MCMC draws carry less information than $N$ independent draws. The relevant currency is the *effective sample size*, which deflates $N$ by the autocorrelation. The compensating advantage is constructive: when you cannot sample $f$ at all — the normal state of affairs for a complicated posterior — MCMC still gives you a way to draw from it, paying for that power with the need to assess burn-in, mixing, and convergence. Diagnostics are not optional decoration; they are how you bound the error that independence would otherwise have handed you for free.

## Connections

- [[05-convergence-of-random-variables]] ← the LLN and CLT are what make the Monte Carlo average consistent and supply its standard error; Monte Carlo is essentially "apply asymptotics to a sample we generated ourselves."
- [[23-stochastic-processes]] ← Markov-chain stationary-distribution and ergodic-convergence theory is the formal justification for MCMC; without it, time-averages of a correlated chain would have no guaranteed limit. → simulation is where that abstract chain theory pays off operationally.
- [[11-bayesian-inference]] → MCMC is the computational engine of practical Bayesian analysis: it turns intractable posteriors (known only up to a constant) into samples you can average and take quantiles of, exactly because Metropolis–Hastings needs only $f$ up to a constant.
- [[08-the-bootstrap]] ↔ a sibling resampling idea: the bootstrap simulates *from the empirical distribution* to approximate sampling distributions, while this chapter simulates from a *model* (or posterior) to approximate integrals — both replace analytic calculation with computer-generated samples and both inherit Monte Carlo error.
- [[02-random-variables]] ← generating $X_i \sim f$ in the first place relies on transformation methods (inverse-CDF, rejection sampling) built on the distribution machinery introduced earlier.
- [[03-expectation]] ← every target here is an expectation; simulation is just a way of computing $E[g(X)]$ when the integral defining it has no closed form.
