---
tags: [regression, linear-regression, least-squares, model-selection, regression-diagnostics, splines, bruce-gedeck]
source: https://github.com/gedeck/practical-statistics-for-data-scientists
---

# PSDS Ch.4 — Regression and Prediction

Regression is where statistics and predictive modeling meet. The chapter splits the goal in two — **predicting** an outcome vs. **explaining** a relationship — because the same least-squares math demands very different care depending on which you want. Part of the [[practical-statistics-for-data-scientists-book]] series. Full review pack with quiz: [[04-regression-and-prediction]].

## Fitting and assessing the model

- **Simple linear regression** — the **regression equation** fits a line by **least squares** (minimizing squared **residuals**); **fitted values** are predictions, residuals are what's left over. The slope is the modeled change in outcome per unit predictor.
- **Multiple linear regression** — many predictors at once; assess fit with **RMSE** (prediction error), **R²** (variance explained), and per-coefficient **t-statistics**. **Weighted regression** handles unequal-importance or unequal-variance records.
- **Prediction vs. explanation** — for **prediction**, accuracy on held-out data is all that matters; for **explanation**, the coefficients must be trustworthy, which is much harder.
- **Model assessment & selection** — **cross-validation** / train–test for honest error; **AIC** and **stepwise** (forward/backward) selection to trade fit against complexity; **penalized regression** (**ridge**, **lasso**) to shrink coefficients and prevent overfitting.
- **Intervals** — distinguish a **confidence interval** (uncertainty about the mean response) from a much wider **prediction interval** (uncertainty about a single new value). **Extrapolation** beyond the data range is dangerous.

## Factors, interpretation, and diagnostics

- **Factor (categorical) variables** — encoded via **dummy / one-hot** variables with a **reference** level; many-level factors need consolidation, and **ordered** factors can be treated as numeric.
- **Interpreting coefficients** — **correlated predictors** make coefficients unstable; **multicollinearity** can flip signs; **confounding variables** (an omitted cause) bias estimates; **interactions** mean one predictor's effect depends on another.
- **Regression diagnostics** — hunt for **outliers**, **influential points** (high **leverage** / **Cook's distance** / hat values), **heteroskedasticity** (non-constant residual variance), and **nonlinearity** (via **partial residual plots**). These matter intensely for explanation, far less for pure prediction.
- **Nonlinear fits** — **polynomial**, **spline**, and **GAM** (generalized additive model) regression flex the line to curved relationships without abandoning the regression frame.

## Key Takeaways

- **Decide prediction vs. explanation up front** — it changes which metrics you trust and how much you must fear multicollinearity and confounding.
- **Coefficients are not causal** and become unreliable when predictors are correlated; a great R² can still hide a misleading story.
- **Regularize and cross-validate** — ridge/lasso plus held-out evaluation are the practical defense against overfitting with many predictors.

## See Also

- [[practical-statistics-for-data-scientists-book]]
- [[psds-ch03-statistical-experiments-and-significance-testing]] · [[psds-ch05-classification]]
