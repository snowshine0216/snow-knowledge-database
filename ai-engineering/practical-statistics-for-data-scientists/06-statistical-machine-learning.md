---
tags: [machine-learning, knn, decision-trees, random-forest, bagging, boosting, xgboost, ensemble-methods, bruce-gedeck, study-guide, quiz]
source: https://github.com/gedeck/practical-statistics-for-data-scientists
---

# Chapter 6 — Statistical Machine Learning

> [!abstract]+ Chapter at a glance
> Where statistics turns into modern machine learning — presented as a **continuum**, not a rupture. The chapter builds from a single instance-based method (**KNN**) through **decision trees** to the **ensembles** that dominate tabular-data problems: **bagging / random forests** (parallel, variance-reducing) and **boosting / XGBoost** (sequential, bias-reducing). The throughline is **ensembling** — combining many weak learners beats one strong one — and the recurring tension is **accuracy vs. interpretability**, with overfitting controlled by the **resampling** and **regularization** ideas from earlier chapters.

## Core concepts

**K-Nearest Neighbors (KNN)**
- Classify/predict a record from its **K** closest neighbors under a **distance metric** (**Euclidean**, **Manhattan**); classification by majority vote, regression by averaging.
- **Standardization is mandatory** — distance is dominated by large-scale features unless you normalize (z-scores). The choice of **K** is a **bias–variance** knob: small K = low bias/high variance (noisy), large K = high bias/low variance (smooth).
- No training phase ("lazy"), but slow at prediction. Often used as a **feature engine**: a KNN-derived score becomes an input to another model.

**Tree models**
- **Recursive partitioning** repeatedly splits the data on the predictor/threshold that most increases **purity / homogeneity**, measured by **Gini impurity** or **entropy**. A leaf predicts the majority class (or mean).
- Trees **overfit** if grown fully, so they're controlled by **stopping rules** (min node size, max depth) and/or **pruning**.
- Strengths: highly **interpretable** (a readable set of if-then rules), handle nonlinearity and interactions automatically, need little preprocessing, and mix numeric/categorical predictors. Weakness: a single tree is **unstable** and a weak predictor — which is the motivation for ensembles.

**Bagging and the random forest**
- **Bagging** ("bootstrap aggregating") trains many trees on **bootstrap** resamples of the data and **averages** them, reducing **variance**.
- The **random forest** adds a twist: at each split it considers only a **random subset of features** (`mtry`), which **decorrelates** the trees so averaging helps more. It provides a free **out-of-bag (OOB)** error estimate (each tree validated on the rows it didn't see) and a **variable-importance** ranking. Robust and low-tuning — a great default.

**Boosting**
- Builds trees **sequentially**, each one focusing on the records the previous ensemble got **wrong**, reducing **bias**. Lineage: **AdaBoost** → **gradient boosting** → **XGBoost** (the competition-winning, highly optimized implementation).
- More accurate than random forests but **more prone to overfitting**, so it needs **regularization** — shrinkage/learning rate, tree-complexity penalties, **subsampling**, and ridge/lasso-style **λ/α** terms — tuned carefully via **cross-validation** over hyperparameters.

## Quiz

**1.** Why must you **standardize** features before KNN, and how does **K** trade bias against variance?

> [!example]- Show answer
> KNN decides "nearest" by **distance**, and an unstandardized feature with a large numeric range (e.g. income in the tens of thousands) will **dominate** the distance over a small-range feature (e.g. age), regardless of true importance. **Standardizing** (z-scores) puts features on a common scale so each contributes fairly. **K** controls smoothing: **small K** (e.g. 1) follows the data closely → **low bias, high variance** (sensitive to noise and outliers); **large K** averages over many neighbors → **high bias, low variance** (smoother, but can wash out real local structure). You tune K, usually by cross-validation.

**2.** How does a decision tree decide where to **split**, and what do Gini/entropy measure?

> [!example]- Show answer
> At each node the tree searches over predictors and thresholds for the split that most increases **purity** — making the resulting child nodes as **homogeneous** in the outcome as possible. **Gini impurity** and **entropy** both quantify how **mixed** a node's class labels are (0 = all one class, higher = more mixed); the tree picks the split that **reduces** impurity the most (greatest information gain). It repeats this **recursive partitioning** down the tree. The two metrics usually agree; the point is a measurable target for "this split separated the classes better."

**3.** A single tree is interpretable and handles nonlinearity, so why do we ensemble?

> [!example]- Show answer
> Because a single fully grown tree is a **high-variance, unstable** predictor: small changes in the data produce very different trees, and it tends to **overfit**. Its predictions are also "blocky" (piecewise-constant). **Ensembling** many trees — averaging them (bagging/forest) or stacking them (boosting) — **stabilizes** the predictions and dramatically improves accuracy, at the cost of the single tree's readability. You trade one interpretable-but-weak model for many that are jointly strong but opaque (you recover some insight via variable importance).

**4.** Explain **bagging** and what the **random forest** adds on top of it.

> [!example]- Show answer
> **Bagging** trains each tree on a **bootstrap resample** of the rows and **averages** their predictions, which reduces **variance** (averaging independent-ish errors cancels noise). The problem: trees trained on similar data are **correlated**, so averaging helps only so much. The **random forest** fixes this by also sampling a **random subset of features at each split** (`mtry`), forcing the trees to be **different** from each other. Decorrelated trees average to a bigger variance reduction. Bonus: the bootstrap leaves ~⅓ of rows out per tree, giving a free **out-of-bag** validation estimate and a **variable-importance** measure.

**5.** How does **boosting** differ fundamentally from bagging, and what does that imply about overfitting?

> [!example]- Show answer
> **Bagging/forests** build trees **independently and in parallel**, then average — they attack **variance**. **Boosting** builds trees **sequentially**, each new tree fitting the **residual errors** of the current ensemble — it attacks **bias**, progressively correcting mistakes. Because boosting keeps fitting the hardest cases, it can **chase noise and overfit** if left unchecked, whereas a random forest is hard to overfit by adding trees. So boosting demands **regularization** (learning rate, tree depth limits, subsampling, L1/L2 penalties) and careful **cross-validated** hyperparameter tuning, while forests work well almost out of the box.

**6.** What is the **out-of-bag (OOB)** estimate and why is it convenient?

> [!example]- Show answer
> Each tree in a bagged ensemble is trained on a bootstrap sample that **omits about a third** of the rows; those omitted rows are "out-of-bag" for that tree. You can predict each row using only the trees that **didn't** train on it and aggregate, yielding an honest **held-out error estimate for free** — no separate validation split or cross-validation loop needed. It's convenient because it gives random forests a built-in, low-cost generalization estimate and supports the permutation-based **variable-importance** calculation.

**7.** Name the key **hyperparameters** of a random forest vs. a gradient-boosting model and what each controls.

> [!example]- Show answer
> **Random forest**: **number of trees** (more is safe, just slower), **mtry** (features tried per split — controls decorrelation), and tree-size limits (min node size / max depth). Tuning is forgiving. **Gradient boosting / XGBoost**: **number of trees / boosting rounds**, **learning rate (shrinkage)** — small rates need more trees but generalize better, **max tree depth** (interaction complexity), **subsample / colsample** fractions, and **regularization λ/α**. Boosting's hyperparameters **interact strongly** (learning rate × n_trees especially) and overfit if mis-set, so they're tuned together by cross-validation.

**8.** What is **variable importance**, and what's a caveat in reading it?

> [!example]- Show answer
> **Variable importance** ranks predictors by how much they contribute to the ensemble's accuracy — e.g. total impurity decrease from splits on that variable, or the accuracy drop when its values are randomly **permuted** (OOB permutation importance). It's valuable for interpretation and feature selection. Caveats: importance can be **biased toward high-cardinality** or continuous variables (more split opportunities), and **correlated predictors split the credit**, so an important-but-redundant variable can look weak because its partner absorbed the importance. Treat it as a guide, not gospel — and prefer permutation importance for fairness.

**9.** *(Applied)* On a tabular business dataset, when would you reach for a **random forest** vs. **XGBoost**?

> [!example]- Show answer
> Start with a **random forest** when you want a strong baseline with **minimal tuning**, robustness to noise, a free OOB error estimate, and low overfitting risk — great for quick, reliable results and feature-importance exploration. Move to **XGBoost / gradient boosting** when you need to **squeeze out maximum accuracy** and can invest in **careful hyperparameter tuning** (learning rate, depth, regularization, early stopping) and guard against overfitting with cross-validation. Rule of thumb: random forest for a dependable default; boosting when the extra accuracy is worth the tuning effort and overfitting vigilance (which is why it dominates Kaggle-style competitions).

**10.** *(Applied)* Your boosting model scores near-perfectly on training data but poorly on the test set. What's happening and what knobs help?

> [!example]- Show answer
> Classic **overfitting** — boosting kept adding trees that fit the training **noise**, including hard/mislabeled cases, so it memorized rather than generalized. Knobs, roughly in order: **lower the learning rate** (and use **early stopping** on a validation set to cap the number of rounds), **reduce max tree depth** (simpler base learners), add **subsampling** of rows and columns per tree, and increase **L1/L2 regularization (α/λ)**. Validate every change with **cross-validation**. The goal is to bias the model slightly so its variance — the gap between train and test — collapses; this is the same bias–variance management that ridge/lasso did for regression in Chapter 4.

## Deeper understanding (expansion)

> [!info]+ 💡 Two ways to ensemble, two errors to kill
> Bagging and boosting aren't competing tricks — they target **opposite halves of the error**. Bagging (random forests) builds many **independent** trees and averages, which crushes **variance** (the instability of a single deep tree) while leaving bias roughly unchanged; that's why adding more trees never hurts. Boosting builds **dependent** trees that each fix the prior ensemble's mistakes, which drives down **bias** (systematic error) but *can* inflate variance/overfit, which is why it needs regularization and early stopping. Seen through the **bias–variance decomposition**, the whole chapter is one idea: pick your ensemble by which error dominates your problem, and you'll know whether more components makes things safer (bagging) or riskier (boosting).

> [!info]+ 💡 The "wisdom of crowds" is a statistical theorem, not a metaphor
> Why do ensembles work at all? Because the **errors of diverse, better-than-random learners partially cancel** when combined. If each tree is somewhat accurate and their mistakes are **decorrelated**, averaging pushes the aggregate toward the truth — the same math that makes a sample mean more precise than a single observation (Chapter 2's 1/√n). This is exactly why the random forest goes out of its way to *force diversity* (bootstrap rows **and** random features): correlated learners cancel little, diverse ones cancel a lot. The deep continuity of the book shows here — the bootstrap that quantified uncertainty in Chapter 2 is the very mechanism generating the diversity that makes Chapter 6's forests strong.

> [!info]+ 💡 Statistical ML is statistics with the interpretability dial turned down
> The chapter's quiet thesis is that there's **no hard border** between "statistics" and "machine learning." KNN is just local averaging; a tree is recursive stratification; a random forest is bagging is bootstrapping; boosting is iterative residual-fitting (gradient descent in function space). Each step trades **interpretability** for **accuracy and flexibility**: regression hands you coefficients you can defend; a forest hands you predictions and a rough importance ranking; boosting hands you the best number and a black box. The engineering judgment isn't "ML vs. stats" — it's **how much opacity the problem can afford**. Regulated, explanation-driven settings stay near the interpretable end; pure-accuracy, prediction-driven settings march toward boosting. Knowing the continuum lets you choose deliberately instead of by hype.

## Connections

- **← Chapter 2** provides the **bootstrap** that *is* bagging — random forests are a direct application of resampling.
- **← Chapter 4** introduced **regularization** and the **bias–variance** trade-off that governs every hyperparameter here; boosting is its most demanding case.
- **← Chapter 5** supplies the **evaluation toolkit** (confusion matrix, AUC, imbalance handling) used to judge these classifiers.
- **→ Chapter 7** drops labels entirely for **unsupervised** structure-finding, reusing the same distance/scaling concerns from KNN.
- Lightweight summary: [[psds-ch06-statistical-machine-learning]] · book hub: [[practical-statistics-for-data-scientists-book]].
