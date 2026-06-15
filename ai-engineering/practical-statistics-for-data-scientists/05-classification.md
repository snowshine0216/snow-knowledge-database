---
tags: [classification, naive-bayes, discriminant-analysis, logistic-regression, confusion-matrix, roc-auc, imbalanced-data, bruce-gedeck, study-guide, quiz]
source: https://github.com/gedeck/practical-statistics-for-data-scientists
---

# Chapter 5 — Classification

> [!abstract]+ Chapter at a glance
> Predicting a **category** instead of a number. The chapter introduces four classical classifiers — **naive Bayes**, **discriminant analysis (LDA)**, and especially **logistic regression** — and then spends its sharpest pages on the two things that actually trip practitioners up: **how to score a classifier** (the confusion matrix and its metrics, ROC/AUC) and **what to do when one class is rare** (the imbalanced-data problem and its remedies). Most classifiers output a **probability**, and the choice of **threshold** turns that probability into a decision — a choice driven by the relative cost of each error.

## Core concepts

**Naive Bayes**
- Uses **conditional probability** via Bayes' rule to compute the **posterior probability** of each class given the predictors, under the "naive" assumption that predictors are **independent given the class**. Naturally suited to **categorical** predictors, very fast, and surprisingly competitive despite the unrealistic independence assumption (e.g. classic spam filtering).

**Discriminant analysis (LDA)**
- **Linear discriminant analysis** uses the predictors' **covariance structure** and **Fisher's linear discriminant** to find the linear combination that best **separates** the classes. Older and more assumption-heavy (assumes roughly normal predictors with shared covariance), but fast and the conceptual ancestor of separation-based classification.

**Logistic regression**
- The workhorse. A **generalized linear model (GLM)** that models the **log-odds (logit)** of the outcome as a linear function of the predictors, mapped to a probability by the **logistic** function. Fit by **maximum likelihood** (not least squares). Coefficients exponentiate into interpretable **odds ratios** ("each unit of X multiplies the odds by e^b"). It's like linear regression, but the output is a well-behaved probability in (0, 1).

**Evaluating classification models**
- The **confusion matrix** cross-tabs predicted vs. actual into **true/false positives** and **true/false negatives** — the source of every metric.
- **Accuracy** = fraction correct, but it's **misleading under class imbalance**.
- **Precision** = of predicted positives, how many are truly positive. **Recall (sensitivity)** = of actual positives, how many you caught. **Specificity** = of actual negatives, how many you correctly rejected. The right balance depends on which error costs more.
- **ROC curve** plots recall vs. false-positive rate as the threshold sweeps; **AUC** (area under it) summarizes ranking quality independent of any single threshold. **Lift** measures how much better than random your model targets the positives.

**The rare-class / imbalanced-data problem**
- When positives are rare (fraud, disease, churn, defaults), a model can score **99% accuracy by always predicting "negative"** and be useless. You must optimize precision/recall and AUC, not accuracy, and tune the decision threshold to the business cost.
- **Rebalancing strategies**: **undersampling** the majority class, **oversampling** the minority, **up/down weighting** records, generating synthetic minority examples with **SMOTE**, and **cost-based classification** that bakes asymmetric error costs into the objective.

## Quiz

**1.** What is the "naive" assumption in **naive Bayes**, and why does the method work well despite it being usually false?

> [!example]- Show answer
> The naive assumption is that the predictors are **conditionally independent given the class** — e.g. that the words in an email are independent of each other once you know it's spam. This is almost never literally true (words are correlated). It works anyway because, for **classification**, you don't need accurate probabilities — you need the **right class to win**. Even when the independence assumption distorts the absolute posterior probabilities, it often preserves their **ranking**, so the argmax (chosen class) is still correct. Combined with its speed and tiny data requirements, that makes naive Bayes a strong, cheap baseline.

**2.** How does **logistic regression** differ from linear regression, and what makes its output suitable for classification?

> [!example]- Show answer
> Linear regression predicts an unbounded numeric value via least squares; **logistic regression** predicts the **log-odds** of a class as a linear function of the predictors and maps it through the **logistic (sigmoid)** function to a probability in **(0, 1)**, fit by **maximum likelihood**. That bounded, probabilistic output is exactly what classification needs — you get `P(class=1)` rather than a raw number that could be −3 or 50. It's a **GLM**, and its coefficients become interpretable **odds ratios**, keeping much of linear regression's transparency.

**3.** Interpret a logistic-regression coefficient as an **odds ratio**.

> [!example]- Show answer
> If a predictor has coefficient `b` (on the log-odds scale), then **e^b** is the **odds ratio**: a one-unit increase in that predictor **multiplies the odds** of the positive class by e^b, holding others fixed. E.g. b = 0.7 → e^0.7 ≈ 2.0, so each unit roughly **doubles the odds**. b = 0 → odds ratio 1 → no effect. This multiplicative-on-odds interpretation (not on probability) is the standard way to read and communicate logistic models.

**4.** Build the **confusion matrix** and define precision, recall, and specificity from it.

> [!example]- Show answer
> The confusion matrix has four cells: **TP** (predicted +, actually +), **FP** (predicted +, actually −), **FN** (predicted −, actually +), **TN** (predicted −, actually −). From these: **Precision = TP/(TP+FP)** — trustworthiness of positive predictions. **Recall / sensitivity = TP/(TP+FN)** — coverage of actual positives. **Specificity = TN/(TN+FP)** — coverage of actual negatives. Accuracy = (TP+TN)/all. Precision and recall trade off as you move the threshold, and which you favor depends on whether false positives or false negatives are costlier.

**5.** Why is **accuracy** a dangerous metric for a fraud detector where 0.5% of transactions are fraud?

> [!example]- Show answer
> Because a trivial model that **labels everything "not fraud"** achieves **99.5% accuracy** while catching **zero** fraud — high accuracy, zero value. With severe imbalance, accuracy is dominated by the majority class and rewards ignoring the rare class you actually care about. You must instead look at **recall** (what fraction of fraud you catch), **precision** (how many flagged transactions are really fraud), and **AUC** (threshold-independent ranking quality), and then set the **threshold** by the relative cost of a missed fraud vs. a false alarm.

**6.** What does the **ROC curve** show, and what does **AUC** summarize?

> [!example]- Show answer
> The **ROC curve** plots the **true-positive rate (recall)** against the **false-positive rate (1 − specificity)** as you sweep the classification **threshold** from strict to lenient. It visualizes the full trade-off rather than committing to one operating point. **AUC** (area under the ROC curve) collapses that curve into one number measuring how well the model **ranks** positives above negatives, **independent of threshold**: 0.5 = random, 1.0 = perfect separation. AUC is the go-to single metric for comparing classifiers on imbalanced data because it doesn't depend on where you happen to set the cutoff.

**7.** Name four strategies for an **imbalanced** training set and the idea behind each.

> [!example]- Show answer
> (1) **Undersampling** — discard majority-class examples so the classes are more balanced (risks throwing away information). (2) **Oversampling** — duplicate or resample minority examples to raise their weight (risks overfitting the copies). (3) **SMOTE** — generate **synthetic** minority examples by interpolating between real ones, adding variety rather than exact copies. (4) **Cost-based classification / weighting** — leave the data alone but make minority-class errors **cost more** in the loss, so the model attends to them. All aim to stop the model from optimizing the majority class into irrelevance.

**8.** What is the role of the **decision threshold**, and why is 0.5 not sacred?

> [!example]- Show answer
> A probabilistic classifier outputs `P(positive)`; the **threshold** converts that to a yes/no decision. The default **0.5** assumes false positives and false negatives are **equally costly and classes are balanced** — rarely true. Lowering the threshold catches more positives (↑recall, ↓precision); raising it makes positive calls more trustworthy (↑precision, ↓recall). You should set it from the **cost matrix**: for cancer screening you'd lower it (missing a case is catastrophic); for a spam filter that risks deleting real mail you'd raise it. Tuning the threshold is often more impactful than swapping models.

**9.** *(Applied)* For a medical screening test, would you optimize for **precision** or **recall**? Explain the cost reasoning.

> [!example]- Show answer
> Optimize for **recall (sensitivity)**. A **false negative** — telling a sick patient they're healthy — can be fatal, whereas a **false positive** leads to a follow-up test, which is unpleasant and costly but recoverable. So you accept lower precision (more false alarms) to ensure you **catch nearly all true cases**, i.e. set a **low threshold**. The general principle: optimize the metric tied to the **error you can least afford**. (A second-stage confirmatory test then restores precision — the classic screen-then-confirm pipeline.)

**10.** *(Applied)* Your churn model has 0.92 accuracy but the business says it's useless. Only 8% of customers churn. Diagnose and propose a path.

> [!example]- Show answer
> The 0.92 accuracy is an illusion of imbalance: predicting **"won't churn" for everyone** already scores 0.92, so the model may be catching almost no actual churners (near-zero **recall**). Diagnose by pulling the **confusion matrix** and computing **recall/precision** and **AUC** — these will expose the failure that accuracy hides. Path forward: (1) evaluate and select models on **AUC / recall**, not accuracy; (2) **rebalance** training (SMOTE, class weights) or use **cost-sensitive** learning so churners aren't ignored; (3) **tune the threshold** to the business cost of a missed churner vs. a wasted retention offer; (4) report **lift** to show how much better than random the model targets likely churners for intervention.

## Deeper understanding (expansion)

> [!info]+ 💡 Classification is really two decisions: rank, then cut
> It clarifies everything to see a classifier as doing two separable jobs. First it **ranks** records by estimated probability — that's the model's intrinsic skill, measured threshold-free by **AUC**. Then a **threshold** cuts the ranking into positive/negative — that's a **business** decision, set by the cost of each error type. Conflating them causes endless confusion ("the model is bad" when really the threshold is wrong, or "0.5 is the rule" when the costs are wildly asymmetric). Separating them tells you what to fix: a low AUC means get a better model; a good AUC with bad real-world outcomes means move the threshold. Most classification disappointments are threshold problems wearing a model-quality mask.

> [!info]+ 💡 The rare-class problem is why metric choice is a moral/economic act
> Imbalanced data exposes that "which metric" is never neutral — it encodes what you've decided matters. Accuracy implicitly says all errors are equal and the common case dominates; precision says false alarms are expensive; recall says misses are. In fraud, disease, churn, and safety, the **rare** event is precisely the one with the highest stakes, so optimizing accuracy literally optimizes for ignoring it. The remedies (rebalancing, cost weighting, threshold tuning) are all ways of **forcing the model to value the rare class as much as the business does**. Choosing the metric is choosing the objective; doing it carelessly ships a model that's technically accurate and practically harmful.

> [!info]+ 💡 Why logistic regression refuses to die
> Despite trees, boosting, and neural nets, logistic regression remains the default first classifier — and the expansion is worth making explicit. It produces **calibrated probabilities** (not just labels), so its scores feed naturally into thresholds, expected-value calculations, and downstream decisions. Its **odds-ratio coefficients are interpretable and auditable**, which matters in regulated domains (credit, healthcare) where "why was I rejected?" must be answerable. It's **fast, stable, hard to overfit** with regularization, and a strong baseline that more complex models must beat to justify their opacity. The lesson the book quietly teaches: reach for interpretability and calibration first, and only pay the complexity/opacity tax of Chapter 6's ensembles when the accuracy gain is real and worth it.

## Connections

- **← Chapter 4** is the direct parent: **logistic regression** is linear regression's GLM cousin for categorical outcomes, sharing coefficient interpretation and regularization.
- **← Chapter 3** supplies the cost-of-errors thinking (Type 1/2) that reappears as precision/recall and threshold choice.
- **→ Chapter 6** offers **trees and ensembles** as more flexible classifiers, evaluated with the *same* confusion-matrix/AUC toolkit from this chapter.
- Lightweight summary: [[psds-ch05-classification]] · book hub: [[practical-statistics-for-data-scientists-book]].
