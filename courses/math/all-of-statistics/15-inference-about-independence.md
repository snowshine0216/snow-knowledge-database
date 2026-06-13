---
tags: [independence-testing, odds-ratio, chi-square, correlation, contingency-tables, log-linear, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 15 — Inference about Independence

> [!abstract]+ Chapter at a glance
>
> This chapter answers a single, recurring question: **are two variables independent?** The right tool depends entirely on the *type* of the two variables. For **two binary variables** arranged in a $2\times 2$ table, the natural summary is the **odds ratio** $\psi$ (and its companion the **relative risk**); independence is exactly $\psi = 1$, equivalently a **log-odds-ratio** of $0$. For **two discrete variables** in a general $I\times J$ table, we test independence by comparing observed counts to the counts *expected under independence* using **Pearson's $\chi^2$** or the **likelihood-ratio $G^2$** statistic, both with $(I-1)(J-1)$ degrees of freedom. For **two continuous variables**, the **Pearson correlation** $\rho$ measures *linear* association, and we test $H_0:\rho=0$ — but we must always remember that zero correlation does **not** imply independence. Throughout, two cautions recur: the odds ratio is invariant to which variable is treated as the "response," and **association is not causation** — a theme that sets up the causal-inference chapter that follows.

## Core concepts

**Two binary variables and the $2\times 2$ table.** Let $X$ and $Y$ each be binary, and arrange the data as a $2\times 2$ contingency table of probabilities $p_{ij} = \mathbb{P}(X=i, Y=j)$:

$$
\begin{array}{c|cc}
 & Y=0 & Y=1 \\ \hline
X=0 & p_{00} & p_{01} \\
X=1 & p_{10} & p_{11}
\end{array}
$$

(The book also indexes cells as $p_{11}, p_{12}, p_{21}, p_{22}$; the labeling is cosmetic.) The cell counts $X_{ij}$ follow a Multinomial distribution with total $n$, and $\hat p_{ij} = X_{ij}/n$.

**The odds ratio.** The **odds ratio** is

$$
\psi = \frac{p_{11}\,p_{22}}{p_{12}\,p_{21}},
$$

the ratio of the odds of $Y$ in one row to the odds of $Y$ in the other row. It is the natural independence parameter for binary data: $X \perp Y \iff \psi = 1$. The plug-in estimator is $\hat\psi = (X_{11}X_{22})/(X_{12}X_{21})$.

**The log-odds-ratio.** Because $\hat\psi$ is a ratio of products of counts, its sampling distribution is badly skewed. We work on the log scale:

$$
\gamma = \log\psi, \qquad \hat\gamma = \log\hat\psi = \log X_{11} + \log X_{22} - \log X_{12} - \log X_{21}.
$$

Here **independence $\iff \gamma = 0$**, and $\hat\gamma$ is much more nearly Normal than $\hat\psi$.

**Standard error and confidence interval (delta method).** Applying the delta method to $\hat\gamma$ gives the classic estimated standard error

$$
\widehat{\operatorname{se}}(\hat\gamma) = \sqrt{\frac{1}{X_{11}} + \frac{1}{X_{12}} + \frac{1}{X_{21}} + \frac{1}{X_{22}}}.
$$

An approximate $1-\alpha$ confidence interval for $\gamma$ is $\hat\gamma \pm z_{\alpha/2}\,\widehat{\operatorname{se}}(\hat\gamma)$; exponentiate the endpoints to get an interval for $\psi$. If the interval for $\gamma$ excludes $0$ (equivalently, the interval for $\psi$ excludes $1$), we reject independence.

**Relative risk.** When one variable is a "treatment/exposure" and the other an "outcome," the **relative risk**

$$
r = \frac{\mathbb{P}(Y=1\mid X=1)}{\mathbb{P}(Y=1\mid X=0)}
$$

compares the probability of the outcome across the two groups. Relative risk requires that we know which variable is the response and is only meaningful with prospective (cohort) sampling; the **odds ratio, by contrast, is invariant** to which margin is fixed, which is why it can be estimated even from case-control (retrospective) data.

**Two discrete variables: the $I\times J$ table.** Now let $X\in\{1,\dots,I\}$ and $Y\in\{1,\dots,J\}$. Independence means $p_{ij} = p_{i\cdot}\,p_{\cdot j}$ for all $i,j$, where $p_{i\cdot}$ and $p_{\cdot j}$ are the row and column marginals. Under $H_0$ (independence) the **expected count** in cell $(i,j)$ is

$$
E_{ij} = \frac{R_i\,C_j}{n},
$$

with $R_i = \sum_j X_{ij}$ the row total, $C_j = \sum_i X_{ij}$ the column total, and $n$ the grand total. We compare the observed counts $O_{ij} = X_{ij}$ to these.

**Pearson's $\chi^2$ statistic.**

$$
T = \sum_{i,j} \frac{(O_{ij} - E_{ij})^2}{E_{ij}} \;\xrightarrow{\;d\;}\; \chi^2_{(I-1)(J-1)} \quad\text{under } H_0 .
$$

Large $T$ is evidence against independence. The degrees of freedom $(I-1)(J-1)$ come from the number of free cell parameters minus the parameters estimated under the independence model.

**Likelihood-ratio $G^2$ statistic.** An asymptotically equivalent test uses

$$
G^2 = 2\sum_{i,j} O_{ij}\,\log\!\frac{O_{ij}}{E_{ij}} \;\xrightarrow{\;d\;}\; \chi^2_{(I-1)(J-1)} .
$$

$G^2$ is the deviance / likelihood-ratio version; both $T$ and $G^2$ share the same null distribution and usually give similar conclusions, with $T$ tending to be a bit more reliable for small expected counts.

**Two continuous variables: correlation.** For continuous $X$ and $Y$, the **Pearson correlation** $\rho = \operatorname{Corr}(X,Y) = \operatorname{Cov}(X,Y)/(\sigma_X\sigma_Y)$ measures *linear* association. The sample estimate is

$$
\hat\rho = \frac{\sum_i (X_i - \bar X)(Y_i - \bar Y)}{\sqrt{\sum_i (X_i-\bar X)^2}\,\sqrt{\sum_i (Y_i-\bar Y)^2}} .
$$

To test $H_0:\rho = 0$ we can use the **Fisher $z$-transformation**, which approximately Normalizes $\hat\rho$, or a $t$-type statistic under bivariate Normality.

**Correlation is not independence.** A crucial caveat: $\rho = 0$ does **not** imply $X\perp Y$. Correlation captures only the *linear* component of dependence; variables can be strongly (even deterministically) dependent yet uncorrelated — e.g. $Y = X^2$ with $X$ symmetric about $0$. Independence implies zero correlation, but not conversely (the converse holds only in special cases such as joint Normality). For monotone-but-nonlinear association, **rank/nonparametric correlations** such as Spearman's $\rho$ or Kendall's $\tau$ are more appropriate.

**Link to log-linear models and to causation.** All of these discrete-table methods are special cases of **log-linear models** (Chapter 19), where independence corresponds to dropping the interaction term, and the odds ratio reappears as an interaction parameter. And every result here is a statement about *association*, not *causation*: a significant $\chi^2$ or a nonzero log-odds-ratio tells us $X$ and $Y$ are dependent, never that one causes the other.

## Quiz

**1.** Define the odds ratio $\psi$ for a $2\times 2$ table and state the exact condition on $\psi$ that corresponds to independence of the two binary variables.

> [!example]- Show answer
> The odds ratio is $\psi = \dfrac{p_{11}p_{22}}{p_{12}p_{21}}$, the ratio of the odds of one outcome across the two rows. The two binary variables $X$ and $Y$ are **independent if and only if $\psi = 1$**. Equivalently, on the log scale the **log-odds-ratio** $\gamma = \log\psi$ equals $0$ under independence. So a hypothesis test of independence can be phrased as testing $H_0:\psi = 1$ or $H_0:\gamma = 0$.

**2.** Why do we usually work with the log-odds-ratio $\hat\gamma$ rather than $\hat\psi$ itself when forming confidence intervals?

> [!example]- Show answer
> The estimator $\hat\psi$ is a ratio of products of counts, so its sampling distribution is highly skewed and far from Normal, especially for moderate sample sizes. Taking logs, $\hat\gamma = \log\hat\psi$, makes the distribution much closer to Normal, so the usual $\hat\gamma \pm z_{\alpha/2}\,\widehat{\operatorname{se}}$ interval has accurate coverage. We build the interval on the log scale and then exponentiate the endpoints to get an interval for $\psi$. The null value $\gamma = 0$ is also cleaner to test than $\psi = 1$.

**3.** Write down the delta-method standard error of $\hat\gamma$ for a $2\times 2$ table and explain how to use it to test independence.

> [!example]- Show answer
> The estimated standard error is $\widehat{\operatorname{se}}(\hat\gamma) = \sqrt{\frac{1}{X_{11}} + \frac{1}{X_{12}} + \frac{1}{X_{21}} + \frac{1}{X_{22}}}$, where the $X_{ij}$ are the four observed cell counts. A Wald confidence interval is $\hat\gamma \pm z_{\alpha/2}\,\widehat{\operatorname{se}}(\hat\gamma)$. We reject independence at level $\alpha$ if this interval excludes $0$ (equivalently, if the corresponding interval for $\psi$ excludes $1$), or if $|\hat\gamma/\widehat{\operatorname{se}}(\hat\gamma)| > z_{\alpha/2}$. Note this breaks down when any cell count is $0$.

**4.** Distinguish the **relative risk** from the **odds ratio**. Why is the odds ratio often preferred in practice?

> [!example]- Show answer
> The relative risk $r = \mathbb{P}(Y=1\mid X=1)/\mathbb{P}(Y=1\mid X=0)$ compares the *probability* of the outcome between two groups, and requires that we know which variable is the response and that sampling is prospective. The odds ratio compares *odds* rather than probabilities. The odds ratio is **invariant to which margin is fixed** — it is the same whether we condition on $X$ or on $Y$ — so it can be estimated even from case-control (retrospective) studies where the relative risk is not directly identifiable. That invariance, plus its clean link to independence ($\psi=1$), makes it the natural parameter for binary data.

**5.** For a general $I\times J$ contingency table, write the expected cell counts under independence and explain where they come from.

> [!example]- Show answer
> Under independence, $p_{ij} = p_{i\cdot}\,p_{\cdot j}$, the product of the row and column marginal probabilities. Plugging in the marginal estimates $\hat p_{i\cdot} = R_i/n$ and $\hat p_{\cdot j} = C_j/n$ and multiplying by $n$ gives the **expected count** $E_{ij} = R_i C_j / n$, where $R_i$ is the $i$-th row total, $C_j$ the $j$-th column total, and $n$ the grand total. These $E_{ij}$ are the MLEs of the cell counts under the independence model, and the test compares them to the observed counts $O_{ij}$.

**6.** State Pearson's $\chi^2$ statistic for testing independence in an $I\times J$ table and give its asymptotic null distribution, including the degrees of freedom.

> [!example]- Show answer
> The statistic is $T = \sum_{i,j} (O_{ij} - E_{ij})^2 / E_{ij}$, summing over all cells, where $O_{ij}$ are observed and $E_{ij} = R_i C_j/n$ are expected-under-independence counts. Under $H_0$ (independence), $T$ converges in distribution to a $\chi^2$ with $(I-1)(J-1)$ degrees of freedom. We reject independence for large $T$, i.e. when $T$ exceeds the upper-$\alpha$ quantile $\chi^2_{(I-1)(J-1),\,\alpha}$. For a $2\times 2$ table this is $1$ degree of freedom.

**7.** Write the likelihood-ratio statistic $G^2$ for the same test and explain how it relates to Pearson's $T$.

> [!example]- Show answer
> The likelihood-ratio (deviance) statistic is $G^2 = 2\sum_{i,j} O_{ij}\log(O_{ij}/E_{ij})$. It arises from the generalized likelihood ratio test comparing the saturated model to the independence model. Like $T$, it has an asymptotic $\chi^2_{(I-1)(J-1)}$ null distribution, and the two are **asymptotically equivalent** — they agree to first order and almost always lead to the same conclusion. In finite samples they differ slightly; $G^2$ ties directly into log-linear modeling, while Pearson's $T$ is sometimes more accurate when some expected counts are small.

**8.** Why is $(I-1)(J-1)$ the correct number of degrees of freedom for these tests?

> [!example]- Show answer
> A free $I\times J$ probability table has $IJ - 1$ free parameters (cells sum to $1$). The independence model is parameterized by the row and column marginals: $I-1$ free row probabilities and $J-1$ free column probabilities, giving $(I-1) + (J-1)$ parameters. The degrees of freedom for the test equal the difference, $(IJ-1) - [(I-1)+(J-1)] = (I-1)(J-1)$. Intuitively, it counts the number of independent "interaction" constraints that independence imposes.

**9.** Explain why a Pearson correlation of zero does not imply that two continuous variables are independent. What does correlation actually measure, and what alternative might you use?

> [!example]- Show answer
> The Pearson correlation $\rho$ measures only the strength of the **linear** relationship between $X$ and $Y$. Variables can be strongly dependent yet have $\rho = 0$: a classic example is $Y = X^2$ with $X$ symmetric about $0$, where the dependence is perfect but the linear correlation vanishes. So **independence $\Rightarrow \rho = 0$, but not conversely** (the converse holds only in special cases like joint Normality). When the relationship is monotone but nonlinear, rank-based measures such as **Spearman's $\rho$** or **Kendall's $\tau$** are better, and a full independence test would need to look beyond linear association.

**10.** *(Applied)* You run a case-control study of a rare disease and exposure, obtaining the $2\times 2$ counts $X_{11}=30$, $X_{12}=10$, $X_{21}=20$, $X_{22}=40$. Estimate the odds ratio, build an approximate 95% CI for the log-odds-ratio, and state your conclusion about independence.

> [!example]- Show answer
> The estimated odds ratio is $\hat\psi = (30\times 40)/(10\times 20) = 1200/200 = 6.0$, so $\hat\gamma = \log 6 \approx 1.79$. The standard error is $\widehat{\operatorname{se}}(\hat\gamma) = \sqrt{1/30 + 1/10 + 1/20 + 1/40} = \sqrt{0.0333 + 0.10 + 0.05 + 0.025} \approx \sqrt{0.208} \approx 0.456$. A 95% CI for $\gamma$ is $1.79 \pm 1.96\times 0.456 \approx (0.90, 2.69)$, which excludes $0$; exponentiating gives a CI for $\psi$ of roughly $(2.5, 14.7)$, which excludes $1$. We therefore **reject independence** — exposure and disease are associated. Because the odds ratio is invariant to the sampling scheme, this estimate is valid even though the data come from a case-control design. (We must not, however, conclude that exposure *causes* disease.)

**11.** *(Applied)* A $3\times 4$ table of survey responses gives $\chi^2 = 21.4$. State the degrees of freedom, describe how to obtain a p-value, and note one practical check you should perform before trusting the result.

> [!example]- Show answer
> With $I=3$ rows and $J=4$ columns, the degrees of freedom are $(I-1)(J-1) = 2\times 3 = 6$. Under independence, $T \approx \chi^2_6$, so the p-value is $\mathbb{P}(\chi^2_6 > 21.4)$, which is small (around $0.0016$), giving strong evidence against independence. Before trusting the asymptotic $\chi^2$ approximation, you should **check that the expected counts $E_{ij} = R_i C_j/n$ are not too small** (a common rule of thumb is $E_{ij} \gtrsim 5$); if several cells have tiny expected counts, the $\chi^2$ approximation degrades and an exact test (e.g. Fisher's) or collapsing categories is safer.

## Deeper understanding (expansion)

> [!info]+ 💡 Why the odds ratio is the "right" independence parameter
>
> Among the three natural binary-association summaries — difference in proportions, relative risk, and odds ratio — only the odds ratio has the **margin-invariance** property: it depends on the joint distribution in a way that is unchanged whether you sample rows-fixed, columns-fixed, or total-fixed. This is exactly why epidemiologists can estimate it from case-control data, where the disease margin is fixed by design and probabilities of disease are *not* estimable. Mathematically, $\psi$ is a function of the cell probabilities that is constant on the "independence surface" $\{p_{ij} = p_{i\cdot}p_{\cdot j}\}$ precisely at the value $1$. In the log-linear framework of Chapter 19, $\gamma = \log\psi$ *is* the single interaction coefficient of the $2\times 2$ model: setting it to zero removes the $X$–$Y$ interaction term, which is independence. So "odds ratio $=1$," "log-odds-ratio $=0$," and "no interaction in the log-linear model" are three names for one fact.

> [!info]+ 💡 Pearson's $\chi^2$ as a comparison of two fitted models
>
> It is tempting to read $T = \sum (O-E)^2/E$ as an ad hoc "distance," but it is really a score-type approximation to the likelihood-ratio comparison between the **saturated model** (each cell free, fit $\hat p_{ij} = O_{ij}/n$) and the **independence model** (fit $E_{ij}/n = R_iC_j/n^2$). The deviance $G^2 = 2\sum O\log(O/E)$ is the exact log-likelihood-ratio for that comparison; a second-order Taylor expansion of $G^2$ around $O = E$ reproduces Pearson's $T$. Both therefore measure "how much worse does the independence model fit than the unrestricted model," and both inherit the $\chi^2_{(I-1)(J-1)}$ null distribution from Wilks's theorem (degrees of freedom $=$ difference in the number of free parameters). Seeing the test this way makes the generalization to richer log-linear models in Chapter 19 immediate: you just compare any two nested models by their deviances.

> [!info]+ 💡 The gap between "uncorrelated" and "independent"
>
> Independence is a statement about the *entire* joint distribution: $f_{X,Y}(x,y) = f_X(x)f_Y(y)$. Zero correlation is a statement about a *single moment*: $\mathbb{E}[(X-\mu_X)(Y-\mu_Y)] = 0$. The first implies the second, but throwing away all the higher-order structure means the converse fails badly — $Y=X^2$, points on a circle, or any symmetric nonlinear law can be uncorrelated yet dependent. This is why "test $\rho = 0$" is a test of *linear* association, not of independence, and why a non-rejection should never be reported as "the variables are independent." When you genuinely need to test independence for continuous variables, you move to rank correlations (Spearman, Kendall), to binning the data into a contingency table and applying $\chi^2$, or to modern dependence measures (e.g. distance correlation) that are zero *if and only if* independence holds.

## Connections

- [[03-expectation]] — covariance and correlation are defined through expectations; ← the population correlation $\rho = \operatorname{Cov}(X,Y)/(\sigma_X\sigma_Y)$ and the fact that independence forces $\operatorname{Cov}=0$ both come straight from the expectation machinery built there.
- [[10-hypothesis-testing-and-p-values]] — every test in this chapter is an instance of that framework; → the $\chi^2$, $G^2$, and log-odds-ratio Wald tests all reduce to "compute a statistic, compare to a reference distribution, get a p-value," and the $\chi^2$ tests are concrete uses of the likelihood-ratio / Wald machinery developed there.
- [[14-multivariate-models]] — the $2\times 2$ and $I\times J$ cell counts are Multinomial vectors; ← the delta-method standard errors and the joint asymptotics for the log-odds-ratio rest on the multivariate Multinomial/Normal theory of that chapter.
- [[16-causal-inference]] — the closing caution that **association is not causation** is the bridge forward; → a significant odds ratio or $\chi^2$ establishes dependence only, and the next chapter develops the counterfactual and intervention machinery needed to make causal claims.
- [[19-log-linear-models]] — the discrete-table tests here are special cases; → log-linear models recast independence as "no interaction term," with the log-odds-ratio reappearing as an interaction coefficient and $G^2$ generalizing to compare any nested log-linear models.
- [[11-bayesian-inference]] — for contrast, a Bayesian would place a prior on the cell probabilities (e.g. a Dirichlet) and report a posterior on $\psi$ or on the interaction parameter rather than a p-value; ← this is the alternative inferential stance to the frequentist tests used throughout this chapter.
