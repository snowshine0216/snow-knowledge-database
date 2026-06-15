---
tags: [machine-learning, knn, decision-trees, random-forest, bagging, boosting, xgboost, ensemble-methods, bruce-gedeck]
source: https://github.com/gedeck/practical-statistics-for-data-scientists
---

# PSDS Ch.6 — Statistical Machine Learning

Where statistics turns into modern ML — but presented as a continuum, not a rupture. The chapter builds from a single instance-based method through trees to the ensembles (random forests, boosting) that dominate tabular-data competitions, trading interpretability for accuracy at each step. Part of the [[practical-statistics-for-data-scientists-book]] series. Full review pack with quiz: [[06-statistical-machine-learning]].

## From instances to trees

- **K-Nearest Neighbors (KNN)** — classify/predict a record by its **K** closest neighbors under a **distance metric** (Euclidean, Manhattan). Requires **standardization** (otherwise large-scale features dominate distance); choice of **K** trades bias vs. variance. Simple, no training, but slow at predict time — and a useful **feature engine** (KNN scores feed other models).
- **Tree models** — **recursive partitioning** splits the data to maximize **purity / homogeneity** (lowest **Gini impurity** or **entropy**), then **prunes** to avoid overfitting. Single trees are highly interpretable (a readable set of rules) but unstable and weak predictors — which is exactly why they're combined.

## Ensembles: the accuracy engines

- **Bagging & random forest** — train many trees on **bootstrap** samples and average them. The **random forest** adds per-split feature randomness (**mtry**) to decorrelate trees, gives a free **out-of-bag (OOB)** error estimate, and ranks **variable importance**. Robust and low-tuning.
- **Boosting** — build trees **sequentially**, each correcting the previous one's errors: **AdaBoost** → **gradient boosting** → **XGBoost**. Far more accurate but more prone to overfitting, so it needs **regularization** (shrinkage, ridge/lasso-style **λ/α** penalties, subsampling) and careful **cross-validated** hyperparameter tuning.

## Key Takeaways

- **The unifying idea is ensembling — the "wisdom of crowds."** Many weak, decorrelated learners beat one strong one; random forests average them, boosting stacks them.
- **Random forest is the great default**: strong accuracy, OOB error for free, minimal tuning, and built-in variable importance.
- **Boosting wins leaderboards but bites back** — its power comes with overfitting risk, so regularization and cross-validation are non-negotiable.
- Every method here standardizes/scales and resamples — the **statistical foundations from earlier chapters carry straight through** into ML.

## See Also

- [[practical-statistics-for-data-scientists-book]]
- [[psds-ch05-classification]] · [[psds-ch07-unsupervised-learning]]
