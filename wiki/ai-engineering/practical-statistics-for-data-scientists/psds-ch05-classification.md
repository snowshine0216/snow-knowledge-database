---
tags: [classification, naive-bayes, discriminant-analysis, logistic-regression, confusion-matrix, roc-auc, imbalanced-data, bruce-gedeck]
source: https://github.com/gedeck/practical-statistics-for-data-scientists
---

# PSDS Ch.5 — Classification

Predicting a category instead of a number. The chapter walks four classical classifiers and then spends its sharpest pages on the two things that actually trip practitioners up: **how to score a classifier** and **what to do when one class is rare**. Part of the [[practical-statistics-for-data-scientists-book]] series. Full review pack with quiz: [[05-classification]].

## The classifiers

- **Naive Bayes** — applies **conditional / posterior probability** with a (naive) assumption that predictors are independent given the class. Natural for categorical predictors and very fast; surprisingly competitive despite the unrealistic assumption.
- **Discriminant analysis (LDA)** — uses the predictors' **covariance structure** and **Fisher's linear discriminant** to find the direction that best separates classes. Older, but still useful and the conceptual root of dimension-aware classification.
- **Logistic regression** — the workhorse. Models the **log-odds (logit)** of the outcome as linear in the predictors (a **GLM**), fit by **maximum likelihood**; coefficients become interpretable **odds ratios**. Like linear regression, but for a probability.

## Scoring models and the rare-class problem

- **Confusion matrix** — the source of every metric: true/false positives and negatives. **Accuracy** is the naive summary and is **misleading under imbalance**.
- **Precision, recall (sensitivity), specificity** — precision = of predicted positives, how many are right; recall = of actual positives, how many you caught. The right trade-off depends on the cost of each error type.
- **ROC curve & AUC** — sweep the classification threshold to trade recall against false positives; **AUC** summarizes ranking quality independent of threshold. **Lift** measures improvement over random targeting.
- **Imbalanced data** — when positives are rare (fraud, disease, churn), accuracy is worthless. Fixes: **undersampling** the majority, **oversampling** the minority, **up/down weighting**, **SMOTE** (synthesize new minority examples), and **cost-based** classification that bakes error costs into the objective.

## Key Takeaways

- **Logistic regression is the default classifier** — interpretable via odds ratios, well-calibrated, and a strong baseline before reaching for trees or boosting.
- **Accuracy is a trap under imbalance.** Choose precision/recall and AUC, set the threshold to match real error costs, not the default 0.5.
- **Rebalance deliberately** — under/oversampling, SMOTE, or cost weighting; pick based on which error actually hurts the business.

## See Also

- [[practical-statistics-for-data-scientists-book]]
- [[psds-ch04-regression-and-prediction]] · [[psds-ch06-statistical-machine-learning]]
