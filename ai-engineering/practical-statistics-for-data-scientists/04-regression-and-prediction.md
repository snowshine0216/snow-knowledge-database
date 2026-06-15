---
tags: [regression, linear-regression, least-squares, model-selection, regression-diagnostics, splines, bruce-gedeck, study-guide, quiz]
source: https://github.com/gedeck/practical-statistics-for-data-scientists
---

# Chapter 4 — Regression and Prediction

> [!abstract]+ Chapter at a glance
> Regression is where statistics meets predictive modeling. The chapter fits lines by **least squares**, scales up to **multiple regression**, and insists on one distinction throughout: are you using the model to **predict** an outcome (only out-of-sample accuracy matters) or to **explain** a relationship (the coefficients must be trustworthy)? It covers honest model assessment (**cross-validation**, AIC, **ridge/lasso**), how to handle **categorical predictors**, the traps in **interpreting coefficients** (multicollinearity, confounding, interactions), and **diagnostics** for outliers, influential points, heteroskedasticity, and nonlinearity — finishing with **splines/GAMs** for curved relationships.

## Core concepts

**Simple linear regression**
- The **regression equation** fits a straight line `Y = b₀ + b₁X` by **least squares** — minimizing the sum of squared **residuals** (the gaps between actual and **fitted values**). The slope `b₁` is the estimated change in `Y` per unit `X`.
- Regression vs. correlation: correlation measures strength of association symmetrically; regression gives a **directional, predictive** equation.

**Multiple linear regression**
- Many predictors at once. Assess fit with **RMSE** (root-mean-square error — typical prediction error in the outcome's units), **R²** (fraction of variance explained), and per-coefficient **t-statistics**/p-values. **Weighted regression** down-weights less reliable or less relevant records.

**Prediction vs. explanation (the central split)**
- For **prediction**, all that matters is **accuracy on unseen data**; a "wrong" but stable model can predict well. For **explanation**, the coefficients must reflect real relationships, which demands far more care about multicollinearity, confounding, and assumptions.

**Assessing and selecting the model**
- **Cross-validation** / train–test split for honest error estimates (in-sample R² is optimistic).
- **Model selection**: **AIC** (penalizes complexity), **stepwise** (forward/backward) selection — but stepwise risks overfitting via repeated testing.
- **Penalized / regularized regression**: **ridge** (L2, shrinks coefficients) and **lasso** (L1, shrinks *and* zeros out predictors → automatic selection). Defends against overfitting and multicollinearity.

**Prediction intervals**
- A **confidence interval** quantifies uncertainty about the **mean** response; a **prediction interval** (much wider) quantifies uncertainty about a **single new** value and includes the irreducible noise. **Extrapolation** beyond the training range is unreliable.

**Factor (categorical) variables**
- Encoded as **dummy / one-hot** indicators with one **reference** level held out (to avoid perfect collinearity). Many-level factors may need consolidation or other encodings; **ordered factors** can sometimes be treated as numeric.

**Interpreting the regression equation**
- **Correlated predictors** make individual coefficients unstable and hard to interpret. **Multicollinearity** (near-redundant predictors) can blow up or flip coefficient signs. **Confounding variables** (an important omitted predictor) bias the coefficients you *did* include. **Interactions** mean the effect of one predictor depends on the level of another (a term beyond the **main effects**).

**Regression diagnostics**
- **Outliers** (large residuals), **influential observations** (high **leverage** / **hat values**, big **Cook's distance** — points that visibly move the fit), **heteroskedasticity** (residual variance changing across the range, which invalidates standard errors), and **nonlinearity** (curved structure missed by a line). **Partial residual plots** reveal a predictor's true shape after accounting for the others.

**Nonlinear and flexible fits**
- **Polynomial** regression, **splines** (piecewise polynomials joined smoothly — flexible without global wiggle), and **generalized additive models (GAMs)** that let each predictor have its own smooth shape while keeping the additive, interpretable structure.

## Quiz

**1.** Explain **least squares** and what a **residual** is.

> [!example]- Show answer
> **Least squares** chooses the line (or hyperplane) that **minimizes the sum of squared residuals**, where a **residual** is the vertical gap between an actual observed `Y` and the model's **fitted value** Ŷ for that record. Squaring penalizes large misses heavily and yields a unique, closed-form solution. The result is the line that, on average, sits as close to the points as possible in the squared-error sense — which also makes it sensitive to outliers (a single far point, squared, can swing the line).

**2.** Why is the **prediction vs. explanation** distinction the most important idea in the chapter?

> [!example]- Show answer
> Because it changes what "a good model" means and which dangers you must fear. For **prediction**, you judge the model purely on **out-of-sample accuracy** (RMSE on held-out data); you can tolerate correlated predictors and uninterpretable coefficients as long as it generalizes. For **explanation**, you're making **claims about relationships** ("each extra bedroom adds \$X"), so **multicollinearity, confounding, and omitted variables** can make individual coefficients meaningless even when overall fit is great. The same least-squares fit serves both goals but is evaluated and trusted completely differently.

**3.** What do **RMSE** and **R²** each tell you, and why isn't a high in-sample R² enough?

> [!example]- Show answer
> **RMSE** is the typical size of the prediction error in the **outcome's own units** — directly interpretable ("off by ~\$15k on average"). **R²** is the **fraction of variance explained** (0–1), a unitless goodness-of-fit. A high **in-sample** R² isn't enough because you can always raise it by adding predictors, even useless ones — that's **overfitting**, fitting noise. The honest signal is performance on **held-out / cross-validated** data; a model with great training R² and poor test RMSE has memorized, not learned.

**4.** Compare **ridge** and **lasso** regression. When does lasso's behavior matter most?

> [!example]- Show answer
> Both add a penalty on coefficient size to combat overfitting and multicollinearity. **Ridge (L2)** shrinks all coefficients toward zero but rarely makes them exactly zero — good when many predictors each contribute a little. **Lasso (L1)** shrinks *and* drives some coefficients **exactly to zero**, performing automatic **variable selection** → a sparser, more interpretable model. Lasso matters most when you have **many predictors and suspect only a few matter**, or you want the model to pick the important variables for you. (Elastic net blends both.)

**5.** Distinguish a **confidence interval** from a **prediction interval** for a regression estimate.

> [!example]- Show answer
> A **confidence interval** captures uncertainty about the **average** response at a given X — how well you've pinned down the regression line itself. A **prediction interval** captures uncertainty about a **single new observation** at that X, and is **much wider** because it adds the **irreducible scatter** of individual points around the line. Confusing them badly understates risk: "we're 95% sure the average house at these specs is worth \$400–420k" is very different from "we're 95% sure *this* house will sell for \$320–500k." Decisions about individual cases need the prediction interval.

**6.** How are **factor variables** encoded, and why is one level dropped?

> [!example]- Show answer
> A categorical factor with *k* levels is turned into **dummy / one-hot** indicator columns, but only **k − 1** of them are kept; one level becomes the **reference**. If you included all *k* dummies plus an intercept, they'd sum to a constant and be **perfectly collinear** (the "dummy variable trap"), making the model unidentifiable. With a reference level, each coefficient reads as the effect **relative to that baseline** (e.g. "region B vs. region A"). Many-level factors (like ZIP code) often need consolidation or alternative encodings to stay manageable.

**7.** What is **multicollinearity**, and how does it sabotage *explanation* but not necessarily *prediction*?

> [!example]- Show answer
> **Multicollinearity** is when predictors are highly correlated with each other, so the model can't tell apart their individual contributions. This makes coefficient estimates **unstable** — large standard errors, signs that flip with small data changes — which wrecks **explanation** (you can't trust "the effect of X₁ holding X₂ fixed" when X₁ and X₂ move together). But for **prediction**, the model's overall output can still be accurate, because the correlated predictors jointly carry the signal even if their split is arbitrary. This is exactly why the prediction/explanation distinction is load-bearing.

**8.** What is a **confounding variable**, and what's its consequence?

> [!example]- Show answer
> A **confounder** is an important variable that influences the outcome and is correlated with your predictors but is **omitted** from the model. Its consequence is **biased coefficients**: the included predictors absorb the confounder's effect, producing misleading or even reversed relationships (the classic "ice cream sales cause drownings" — temperature is the confounder). For explanation, leaving out a confounder invalidates causal-sounding claims; the defense is domain knowledge to include the right controls (or a randomized experiment, Chapter 3, which breaks confounding by design).

**9.** *(Applied)* A single luxury mansion sits in your house-price dataset. How would you tell whether it's distorting the regression, and what would you do?

> [!example]- Show answer
> Run **regression diagnostics**: check its **residual** (is it a large outlier?), its **leverage / hat value** (is it extreme in the predictors?), and especially **Cook's distance** (does removing it visibly move the coefficients — i.e. is it *influential*?). A point can be an outlier without being influential, or influential without a huge residual; Cook's distance combines both. If it's genuinely influential, options are: fit the model **with and without it** and report the sensitivity, use a **robust regression**, **transform** the outcome (e.g. log price) to compress the tail, or segment the model so luxury homes aren't forced onto the same line as typical ones.

**10.** *(Applied)* A linear model systematically under-predicts at low and high values of a predictor and over-predicts in the middle. Diagnose and fix.

> [!example]- Show answer
> The pattern (a U-shaped trend in the residuals vs. that predictor) signals **nonlinearity** — the true relationship is curved, but you fit a straight line. Diagnose with a **partial residual plot** for that predictor, which shows its shape after accounting for the others. Fixes, in increasing flexibility: add a **polynomial term** (e.g. X²), use a **spline** to fit a smooth piecewise curve, or move to a **GAM** so that predictor gets its own smooth function while the model stays additive and interpretable. Also check whether a **transform** (log) linearizes it. Refit and confirm the residual pattern is gone.

## Deeper understanding (expansion)

> [!info]+ 💡 "All models are wrong" cuts differently for prediction vs. explanation
> The same fitted equation can be an excellent **predictor** and a terrible **explanation** simultaneously, and that's not a contradiction. A predictive model is judged by a single external number — held-out error — and is allowed to be a black box of correlated, uninterpretable terms as long as that number is good. An explanatory model makes a **causal-flavored claim about each coefficient**, which can be sabotaged by multicollinearity, confounding, or an omitted interaction even when overall fit is superb. Most real-world arguments about regression ("but the sign is wrong!", "that variable shouldn't matter!") evaporate once you ask which job the model is doing. Decide that *first*; it tells you which diagnostics you're even allowed to ignore.

> [!info]+ 💡 Regularization is the bridge from statistics to machine learning
> Ridge and lasso look like minor statistical tweaks, but they're the conceptual hinge of the book. They reframe model fitting as a **bias–variance trade-off**: accept a little bias (shrunken coefficients) to cut variance (overfitting) and improve generalization. That is *exactly* the logic that governs every method in Chapters 5–6 — the tree depth you allow, the number of trees you bag, the learning rate in boosting. Lasso's automatic variable selection also previews the feature-selection pressure that ensembles handle implicitly. If Chapter 2's bootstrap is the inferential bridge to ML, regularized regression is the *modeling* bridge.

> [!info]+ 💡 Diagnostics are where regression stays honest
> It's easy to fit a regression and read off coefficients; the discipline is in the residuals. Heteroskedasticity quietly invalidates your standard errors (so the p-values you'd cite are wrong), influential points let a single record dictate the slope, and unexamined nonlinearity bakes systematic error into every prediction. None of these show up in R² — a model can have a respectable R² and be diagnostically broken. The habit that separates a careful analyst from a naive one is **plotting residuals** (against fitted values and against each predictor) every single time, and treating any structure there as a problem to solve, not noise to ignore.

## Connections

- **← Chapter 1** introduced **correlation** and scatterplots; regression turns that association into a predictive equation.
- **← Chapter 3** supplies the **t-statistics/p-values** attached to each coefficient — and the multiple-testing caution that makes stepwise selection risky.
- **→ Chapter 5** swaps the numeric outcome for a categorical one; **logistic regression** is the direct generalization of this chapter's machinery.
- **→ Chapter 6** replaces the single global equation with **trees and ensembles** when relationships are too complex/nonlinear to specify by hand.
- Lightweight summary: [[psds-ch04-regression-and-prediction]] · book hub: [[practical-statistics-for-data-scientists-book]].
