---
tags: [linear-regression, logistic-regression, least-squares, model-selection, bias-variance, glm, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 13 — Linear and Logistic Regression

> [!abstract]+ Chapter at a glance
>
> Regression studies how the conditional mean of a response $Y$ changes with predictors $X$, written $r(x)=\mathbb{E}(Y\mid X=x)$. This chapter takes the *parametric* route: assume $r(x)$ is linear in unknown coefficients and estimate them. We start with **simple linear regression** (one predictor), derive the **least squares** estimates in closed form, study their sampling properties (unbiasedness, standard errors, the Gauss–Markov optimality result), and distinguish a confidence interval for the *mean response* from a wider *prediction interval* for a new observation. We then move to **multiple regression** in matrix form, where $\hat\beta=(X^TX)^{-1}X^Ty$ and the hat matrix $H$ projects $y$ onto the column space of the design. The hardest practical problem is **model selection**: which predictors to include. Including too few induces bias; too many inflates variance and overfits, so maximizing $R^2$ is the wrong objective. We meet penalized scores — Mallows $C_p$, AIC, BIC, adjusted $R^2$ — and cross-validation, plus the difference between best-subset and stepwise search. Finally **logistic regression** handles a binary $Y$ by modeling the log-odds linearly and fitting by maximum likelihood, serving as the GLM bridge from regression to classification. Two unifying ideas: under Gaussian errors least squares *is* the MLE, and model selection is the bias–variance trade-off made operational.

## Core concepts

**The regression function.** The object of interest is the conditional mean $r(x)=\mathbb{E}(Y\mid X=x)$. Regression makes assumptions about the *form* of $r$; here we assume it is linear. $Y$ is the **response** (outcome, dependent variable), $X$ the **covariate** (feature, predictor, independent variable).

**The simple linear model.** For data $(X_1,Y_1),\dots,(X_n,Y_n)$,
$$Y_i = \beta_0 + \beta_1 X_i + \epsilon_i,\qquad \mathbb{E}(\epsilon_i\mid X_i)=0,\quad \mathbb{V}(\epsilon_i\mid X_i)=\sigma^2.$$
$\beta_0$ is the **intercept**, $\beta_1$ the **slope**. The errors are mean-zero given $X$; the model does *not* require Gaussian errors for least squares to be sensible, but normality is convenient for exact inference.

**Least squares estimates.** Choose $\hat\beta_0,\hat\beta_1$ to minimize the residual sum of squares
$$\text{RSS}=\sum_{i=1}^n \big(Y_i-(\hat\beta_0+\hat\beta_1 X_i)\big)^2.$$
Setting the partial derivatives to zero gives the closed-form solution
$$\hat\beta_1=\frac{\sum_i (X_i-\bar X)(Y_i-\bar Y)}{\sum_i (X_i-\bar X)^2}=\frac{\widehat{\text{Cov}}(X,Y)}{\widehat{\mathbb{V}}(X)},\qquad \hat\beta_0=\bar Y-\hat\beta_1\bar X.$$
The fitted values are $\hat Y_i=\hat\beta_0+\hat\beta_1 X_i$ and the **residuals** are $\hat\epsilon_i=Y_i-\hat Y_i$. The fitted line passes through $(\bar X,\bar Y)$ and the residuals sum to zero (when an intercept is included).

**Properties of the LS estimators.** Conditional on the $X_i$ and under the model, the estimators are **unbiased**: $\mathbb{E}(\hat\beta_j)=\beta_j$. Their variances are
$$\mathbb{V}(\hat\beta_1)=\frac{\sigma^2}{\sum_i (X_i-\bar X)^2},$$
so more spread-out predictors give a more precisely estimated slope. The **Gauss–Markov theorem** says that among all *linear unbiased* estimators, least squares has the smallest variance — it is the **Best Linear Unbiased Estimator (BLUE)** — and this holds without assuming normality, only the mean/variance conditions.

**Estimating the error variance.** An unbiased estimate of $\sigma^2$ divides the RSS by the residual degrees of freedom:
$$\hat\sigma^2=\frac{1}{n-2}\sum_{i=1}^n \hat\epsilon_i^2$$
for simple regression (subtract one df per estimated coefficient). The **standard error** $\widehat{\text{se}}(\hat\beta_j)$ replaces $\sigma$ by $\hat\sigma$ in the variance formula.

**Inference for coefficients.** Under normal errors, $(\hat\beta_j-\beta_j)/\widehat{\text{se}}(\hat\beta_j)$ has a $t$-distribution with $n-2$ df (approximately normal for large $n$). A $1-\alpha$ confidence interval is $\hat\beta_j\pm z_{\alpha/2}\,\widehat{\text{se}}(\hat\beta_j)$ (Wald). To test $H_0:\beta_1=0$ (no linear association), use the Wald statistic $W=\hat\beta_1/\widehat{\text{se}}(\hat\beta_1)$ and reject when $|W|>z_{\alpha/2}$.

**Confidence vs prediction intervals.** Two different questions at a new $x_*$. A **confidence interval for the mean response** $r(x_*)=\beta_0+\beta_1 x_*$ accounts only for uncertainty in $\hat\beta$. A **prediction interval for a new observation** $Y_*$ must also include the irreducible noise $\sigma^2$, so it is **strictly wider**: roughly $\widehat{\mathbb{V}}(\hat r(x_*))$ versus $\hat\sigma^2+\widehat{\mathbb{V}}(\hat r(x_*))$. The prediction interval does not shrink to zero even as $n\to\infty$.

**Goodness of fit: $R^2$ and RSS.** Decompose total variation as $\text{TSS}=\sum_i (Y_i-\bar Y)^2 = \text{RSS}+\text{regression SS}$. Then
$$R^2 = 1-\frac{\text{RSS}}{\text{TSS}},$$
the fraction of variance "explained." $R^2\in[0,1]$, but it is monotone non-decreasing in the number of predictors, so it cannot by itself decide how many predictors to keep.

**Multiple linear regression (matrix form).** Stack predictors into an $n\times k$ **design matrix** $X$ (first column ones for the intercept) and responses into $y$. The model is $Y=X\beta+\epsilon$ and
$$\hat\beta=(X^TX)^{-1}X^Ty.$$
Fitted values are $\hat y=X\hat\beta=Hy$ where the **hat matrix**
$$H=X(X^TX)^{-1}X^T$$
is the orthogonal projection onto the column space of $X$. $H$ is symmetric and idempotent ($H^2=H$); $\text{trace}(H)=k$ equals the number of parameters, and the residual variance estimate is $\hat\sigma^2=\text{RSS}/(n-k)$.

**Model selection and bias–variance.** Let $S$ index a subset of predictors. Using **too few** predictors biases predictions (omits real structure); using **too many** inflates variance and **overfits** the training data. The prediction risk decomposes into bias$^2$ + variance, and the goal is to minimize estimated risk, *not* training RSS. Maximizing $R^2$ (or minimizing training RSS) always favors the largest model, so it overfits.

**Selection criteria.** Penalize complexity instead. With $|S|$ predictors:
$$C_p = \frac{\text{RSS}_S}{\hat\sigma^2}+2|S|-n \quad\text{(Mallows)},\qquad \text{AIC}=-2\,\ell_S+2|S|,\qquad \text{BIC}=-2\,\ell_S+|S|\log n.$$
$C_p$ estimates prediction risk; AIC and $C_p$ are asymptotically equivalent for Gaussian models. **BIC** penalizes more heavily ($\log n>2$ for $n>7$), tends to pick smaller models, and is **consistent** for the true model when it lies in the candidate set. **Adjusted $R^2$** corrects $R^2$ for the number of predictors so it can decrease when a useless variable is added.

**Cross-validation.** Estimate prediction risk directly by splitting data: **leave-one-out CV** refits the model $n$ times, each omitting one point, and averages the squared prediction errors; $K$-fold CV partitions into $K$ blocks. For linear models, LOOCV has a shortcut using the hat-matrix leverages $H_{ii}$ (no actual refitting needed). CV makes few modeling assumptions and is the most general selection tool.

**Search strategy.** **Best-subset** evaluates all $2^k$ models — exact but exponential, infeasible for large $k$. **Stepwise** (forward, backward, or both) is a greedy heuristic adding/removing one predictor at a time; cheap but not guaranteed to find the global optimum.

**Logistic regression.** For binary $Y\in\{0,1\}$ with $p(x)=\mathbb{P}(Y=1\mid X=x)$, linear regression is inappropriate (predictions escape $[0,1]$). Model the **log-odds (logit)** linearly:
$$\text{logit}(p(x))=\log\frac{p(x)}{1-p(x)}=\beta_0+\beta_1 x,\qquad p(x)=\frac{e^{\beta_0+\beta_1 x}}{1+e^{\beta_0+\beta_1 x}}.$$
There is no closed form; fit by **maximum likelihood** (the log-likelihood is concave, solved numerically by Newton–Raphson / IRLS). Each $\beta_j$ is the change in **log-odds** per unit of $x_j$, so $e^{\beta_j}$ is an **odds ratio**. Logistic regression is the canonical **generalized linear model** with the Bernoulli family and logit link, and it is the natural bridge to classification.

## Quiz

**1.** What is the regression function $r(x)$, and what does the simple linear model assume about it?

> [!example]- Show answer
> The regression function is the conditional mean $r(x)=\mathbb{E}(Y\mid X=x)$ — the average response among units with covariate value $x$. The simple linear model assumes this function is *linear* in the parameters: $r(x)=\beta_0+\beta_1 x$, with the observed $Y_i$ scattered around the line by mean-zero errors $\epsilon_i$. So we are modeling the conditional mean, not the individual $Y$ values, which retain irreducible noise $\sigma^2$. Linearity is an assumption about form, distinct from the noise distribution.

**2.** Derive (or state) the closed-form least squares estimates and explain what objective they minimize.

> [!example]- Show answer
> Least squares minimizes the residual sum of squares $\text{RSS}=\sum_i (Y_i-\hat\beta_0-\hat\beta_1 X_i)^2$. Setting the two partial derivatives to zero gives the normal equations, whose solution is $\hat\beta_1=\widehat{\text{Cov}}(X,Y)/\widehat{\mathbb{V}}(X)=\sum_i(X_i-\bar X)(Y_i-\bar Y)/\sum_i(X_i-\bar X)^2$ and $\hat\beta_0=\bar Y-\hat\beta_1\bar X$. The slope is the empirical covariance of $X$ and $Y$ divided by the variance of $X$; the intercept makes the line pass through $(\bar X,\bar Y)$. No distributional assumption is needed to write these down.

**3.** State the Gauss–Markov theorem. What is it claiming, and what assumptions does it require?

> [!example]- Show answer
> Among all estimators that are *linear* in $Y$ and *unbiased* for $\beta$, the least squares estimator has the smallest variance — it is the Best Linear Unbiased Estimator (BLUE). It requires only that the errors have mean zero, constant variance $\sigma^2$, and are uncorrelated; it does **not** require normality. The theorem does not say LS is best among *all* unbiased estimators or *all* estimators — a biased or nonlinear estimator (e.g. ridge, or the MLE under non-Gaussian noise) can sometimes beat it on mean squared error.

**4.** Why do we divide the RSS by $n-2$ (simple) or $n-k$ (multiple) when estimating $\sigma^2$?

> [!example]- Show answer
> The residuals are constrained because we estimated coefficients from the same data: fitting $k$ parameters removes $k$ degrees of freedom, so only $n-k$ independent pieces of information remain to estimate the noise. Dividing the RSS by $n-k$ rather than $n$ corrects the downward bias that would otherwise arise — residuals are "too small" because the fitted surface is pulled toward the data. The result $\hat\sigma^2=\text{RSS}/(n-k)$ is unbiased for $\sigma^2$ under the model. For simple regression $k=2$ (intercept and slope), giving the $n-2$ divisor.

**5.** Distinguish a confidence interval for the mean response from a prediction interval for a new observation. Which is wider and why?

> [!example]- Show answer
> A confidence interval for the mean response targets $r(x_*)=\beta_0+\beta_1 x_*$ and reflects only uncertainty in the estimated coefficients $\hat\beta$. A prediction interval targets a *new* random observation $Y_*=r(x_*)+\epsilon_*$, so it must additionally absorb the irreducible noise variance $\sigma^2$. The prediction interval is therefore always wider — roughly $\hat\sigma^2$ wider in variance. Crucially, as $n\to\infty$ the confidence interval shrinks toward zero width, but the prediction interval converges to a fixed width governed by $\sigma$, because individual outcomes are never perfectly predictable.

**6.** What is $R^2$, and why is maximizing it a bad way to choose how many predictors to include?

> [!example]- Show answer
> $R^2=1-\text{RSS}/\text{TSS}$ is the fraction of the response's total variation explained by the fitted model, lying in $[0,1]$. Adding any predictor — even pure noise — can only decrease (or leave unchanged) the training RSS, so $R^2$ is monotone non-decreasing in model size. Maximizing it therefore always selects the largest model and rewards overfitting, since it measures fit to the *training* data rather than predictive risk on new data. Penalized criteria (adjusted $R^2$, $C_p$, AIC, BIC) or cross-validation are needed instead.

**7.** Write the multiple regression estimator in matrix form and explain the hat matrix $H=X(X^TX)^{-1}X^T$.

> [!example]- Show answer
> With design matrix $X$ and response vector $y$, the least squares estimate is $\hat\beta=(X^TX)^{-1}X^Ty$, and the fitted values are $\hat y=X\hat\beta=Hy$ where $H=X(X^TX)^{-1}X^T$. $H$ is the orthogonal projection ("hat") matrix onto the column space of $X$; it is symmetric and idempotent ($H^2=H$). Its trace equals the number of parameters $k$, and its diagonal entries $H_{ii}$ (leverages) measure how much each point pulls its own fitted value. The residual vector is $(I-H)y$, also a projection (onto the orthogonal complement).

**8.** Explain the bias–variance trade-off in choosing predictors, and name three criteria that operationalize it.

> [!example]- Show answer
> Including too *few* predictors omits real structure, biasing predictions; including too *many* lets the model chase noise, inflating variance and overfitting. Prediction risk decomposes as bias$^2$ + variance, and good model selection minimizes their sum, not the training error. Three operational criteria: Mallows' $C_p=\text{RSS}_S/\hat\sigma^2+2|S|-n$ (an unbiased risk estimate), AIC $=-2\ell+2|S|$, and BIC $=-2\ell+|S|\log n$. All add a complexity penalty so that adding a useless predictor is no longer "free." Cross-validation estimates the same risk directly without these formulas.

**9.** How does BIC differ from AIC/$C_p$ in behavior, and when would you prefer each?

> [!example]- Show answer
> BIC uses a $\log n$ penalty per parameter while AIC and $C_p$ use a constant penalty of $2$; since $\log n>2$ for $n>7$, BIC penalizes complexity more heavily and tends to choose smaller models. BIC is *consistent*: if the true model is among the candidates, BIC selects it with probability $\to 1$ as $n\to\infty$. AIC/$C_p$ are not consistent (they can overfit asymptotically) but often give better predictive accuracy in finite samples and when no candidate is exactly true. Prefer BIC when the goal is identifying the correct sparse model; prefer AIC/CV when the goal is minimizing prediction error.

**10.** *(Applied)* In logistic regression for a binary outcome, you fit $\text{logit}(p)=\beta_0+\beta_1 x$ and obtain $\hat\beta_1=0.7$. How do you interpret this, how was the model fit, and why not use ordinary least squares on the 0/1 response?

> [!example]- Show answer
> The coefficient acts on the log-odds: a one-unit increase in $x$ raises the log-odds of $Y=1$ by $0.7$, equivalently multiplying the odds by $e^{0.7}\approx 2.0$ (the odds roughly double). The model is fit by **maximum likelihood** under a Bernoulli likelihood — there is no closed form, so it is solved numerically (Newton–Raphson / iteratively reweighted least squares); the log-likelihood is concave so the optimum is unique. Ordinary least squares on the raw 0/1 response is inappropriate because the linear predictor is unbounded and would produce fitted probabilities outside $[0,1]$, and the constant-variance assumption fails for binary data. The logit link constrains $p(x)\in(0,1)$ and makes logistic regression a generalized linear model and a natural classifier (predict $\hat Y=1$ when $\hat p(x)>0.5$).

## Deeper understanding (expansion)

> [!info]+ 💡 Why least squares equals maximum likelihood under Gaussian errors
>
> If we strengthen the model to $\epsilon_i\sim N(0,\sigma^2)$ independently, then $Y_i\sim N(\beta_0+\beta_1 X_i,\sigma^2)$. The log-likelihood is $\ell(\beta)=-\tfrac{1}{2\sigma^2}\sum_i(Y_i-\beta_0-\beta_1 X_i)^2 + \text{const}$. Maximizing $\ell$ over $\beta$ is exactly *minimizing* the residual sum of squares — so the MLE of $\beta$ coincides with the least squares estimate. This explains why all the MLE machinery from Chapter 9 (asymptotic normality, the Fisher-information-based standard errors, Wald tests) applies directly to regression coefficients, and it is why least squares is the "right" estimator precisely when noise is Gaussian. Under non-Gaussian noise, least squares remains BLUE (Gauss–Markov) but is no longer the MLE, and a likelihood tailored to the true error distribution can do better. This MLE viewpoint also unifies linear regression with logistic regression: both are maximum likelihood under a chosen response distribution (Normal vs Bernoulli), differing only in the likelihood and link function.

> [!info]+ 💡 Model selection is risk estimation in disguise
>
> Every selection criterion is an attempt to estimate the *prediction risk* $R=\mathbb{E}(Y_*-\hat r(x_*))^2$ — the expected squared error on a fresh observation — without access to fresh data. Training RSS is a biased (optimistically low) estimate of this risk because the model was tuned on the same points; the optimism grows with the number of parameters. $C_p$ literally adds back an estimate of that optimism ($2|S|\hat\sigma^2$), AIC does the same in log-likelihood units, and BIC swaps the constant for $\log n$ to approximate a Bayesian posterior over models. Cross-validation sidesteps the formulas entirely by simulating out-of-sample prediction through data splitting, which is why it needs almost no distributional assumptions and generalizes to logistic regression and nonparametric methods alike. Seen this way, "which predictors?" is never about fit — it is always about honestly estimating future error, and the penalty terms are bias corrections for the dishonesty of training error.

> [!info]+ 💡 Logistic regression as the GLM bridge to classification
>
> Logistic regression sits at the junction between regression and classification. As a *generalized linear model* it keeps the linear predictor $\eta=\beta^T x$ but passes it through the logistic link so the output is a probability $p(x)=1/(1+e^{-\eta})$. Because it outputs calibrated probabilities (not just labels), it supports the same coefficient-level inference as linear regression — Wald intervals, deviance tests — while also yielding a decision rule (threshold $\hat p$ at $0.5$, or another cutoff to trade off error types). This makes it the workhorse baseline of Chapter 22's classification: it is the discriminative cousin of LDA, often competitive with far more complex methods, and the natural first model whenever the response is a yes/no label. Multiclass extensions (multinomial / softmax regression) generalize the same idea. The throughline of the chapter — linear predictor + likelihood + link — is exactly what lets one framework serve continuous, binary, and count responses.

## Connections

- ← [[06-models-inference-and-learning]] — frames regression as estimating the conditional mean $r(x)=\mathbb{E}(Y\mid X)$ and introduces the parametric-vs-nonparametric distinction that this chapter resolves on the parametric side.
- ← [[09-parametric-inference]] — supplies the MLE, Fisher information, Wald tests, and the bias–variance decomposition that underwrite both least squares (= Gaussian MLE) and logistic regression (Bernoulli MLE), including the standard errors used for coefficient confidence intervals.
- → [[14-multivariate-models]] — the multivariate normal and covariance structure generalize the design-matrix algebra here; multiple regression is essentially conditioning a joint Gaussian, linking $\hat\beta=(X^TX)^{-1}X^Ty$ to conditional-mean formulas.
- → [[20-nonparametric-curve-estimation]] — drops the linearity assumption entirely, estimating $r(x)$ with kernels and local polynomials; the bias–variance trade-off met here in *model selection* reappears there as *bandwidth selection*, with cross-validation as the shared tuning tool.
- → [[22-classification]] — logistic regression is the entry point: this chapter's GLM/log-odds machinery becomes a discriminative classifier, compared there against LDA, trees, and nearest-neighbor methods, and evaluated by misclassification risk rather than squared error.
- → [[17-directed-graphs-and-conditional-independence]] — the conditional-mean and conditional-independence ideas extend to networks of variables, where regressions become local building blocks of a larger model.
