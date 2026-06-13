---
tags: [log-linear-models, contingency-tables, conditional-independence, graphical-models, categorical-data, deviance, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 19 — Log-Linear Models

> [!abstract]+ Chapter at a glance
>
> A log-linear model is an ANOVA-style decomposition for the **logarithm of expected cell counts** in a multi-way contingency table of discrete variables. We write $\log p$ (or $\log m$, the expected count) as a sum of a grand mean, **main effects** for each variable, and **interaction terms** for pairs, triples, and higher-order combinations, all subject to identifiability constraints. The payoff is interpretive: **setting an interaction term to zero encodes a conditional-independence statement**. That turns the qualitative question "which categorical variables are (conditionally) independent?" into the concrete, fittable question "which interaction parameters are zero?". This is exactly the parametric companion to the undirected graphs of Chapter 18 — a missing edge in the graph corresponds to a missing interaction in the model. The chapter covers the parameterization, hierarchical and graphical model classes, maximum-likelihood fitting (closed-form or via iterative proportional fitting), model selection by deviance/$G^2$ with AIC/BIC, and the link to logistic regression when one variable is singled out as a response.

## Core concepts

**The data: multi-way contingency tables.** Suppose we observe $n$ i.i.d. draws of a vector of discrete random variables $X = (X_1, \dots, X_m)$, each taking finitely many levels. Cross-classifying the observations produces a contingency table with a count $C_{i_1 \dots i_m}$ in each cell. The cell counts follow a **multinomial** distribution with cell probabilities $p_{i_1 \dots i_m}$. Under an alternative (and often equivalent for inference) sampling scheme, the counts are treated as independent **Poisson** variables with means $m_{i_1 \dots i_m} = n\, p_{i_1 \dots i_m}$. The Poisson/multinomial connection is what makes "log-linear" natural.

**The log-linear idea.** Instead of modeling cell probabilities directly, we model their logarithm as a linear combination of effects. For a two-way table with row variable $X$ (levels $i$) and column variable $Y$ (levels $j$):
$$
\log p_{ij} = \beta_0 + \beta_1^X(i) + \beta_2^Y(j) + \beta_{12}^{XY}(i,j).
$$
Here $\beta_0$ is a normalizing grand mean, $\beta_1^X(i)$ and $\beta_2^Y(j)$ are **main effects** (how the marginal of $X$ and of $Y$ tilt the cell), and $\beta_{12}^{XY}(i,j)$ is the **interaction** capturing dependence between $X$ and $Y$. This mirrors the two-way ANOVA decomposition, but for log-probabilities rather than means of a continuous response.

**Identifiability constraints.** The parameters are over-specified, so we impose constraints. A common choice is the **corner / baseline** constraint (set the effect to zero whenever an index equals a reference level), or the **sum-to-zero** constraint $\sum_i \beta_1^X(i) = 0$, $\sum_j \beta_2^Y(j) = 0$, and $\sum_i \beta_{12}^{XY}(i,j) = \sum_j \beta_{12}^{XY}(i,j) = 0$. Either choice removes the redundancy without changing the fitted probabilities; only the parameter *labels* change.

**The key interpretive result: zero interaction ⇔ independence.** In the two-way model, $X$ and $Y$ are independent **iff** the interaction term vanishes:
$$
\beta_{12}^{XY}(i,j) = 0 \ \text{for all } i,j \quad\Longleftrightarrow\quad p_{ij} = p_{i\cdot}\, p_{\cdot j} \quad\Longleftrightarrow\quad X \perp Y.
$$
With no interaction, $\log p_{ij}$ separates into a part depending only on $i$ plus a part depending only on $j$, which is exactly factorization of the joint into marginals. This is the engine of the whole chapter: **dependence structure is read off from which interaction parameters are nonzero.**

**Higher-way tables and conditional independence.** For three variables $X, Y, Z$, the **saturated** model includes all terms up to the three-way interaction:
$$
\log p_{ijk} = \beta_0 + \beta_1^X + \beta_2^Y + \beta_3^Z + \beta_{12}^{XY} + \beta_{13}^{XZ} + \beta_{23}^{YZ} + \beta_{123}^{XYZ}
$$
(arguments suppressed). Dropping terms encodes independence statements. For example, omitting $\beta_{23}^{YZ}$ **and** $\beta_{123}^{XYZ}$ means $Y$ and $Z$ are independent given $X$, written $Y \perp Z \mid X$. Omitting the three-way term but keeping all pairwise terms gives the **no-three-way-interaction** model (homogeneous association), which has no simple closed-form fit. The map from "missing interaction terms" to "conditional independence relations" is the heart of log-linear modeling.

**Hierarchical models.** A log-linear model is **hierarchical** if, whenever it includes a particular interaction term, it also includes all lower-order terms involving subsets of those variables. So including $\beta_{123}^{XYZ}$ forces inclusion of $\beta_{12}^{XY}, \beta_{13}^{XZ}, \beta_{23}^{YZ}$ and all main effects. Hierarchical models are the default class: they are interpretable, closed under the natural operations, and can be named compactly by their **maximal interaction terms** (generators) — e.g. the model $[XY][Z]$ has generators $\{X,Y\}$ and $\{Z\}$, meaning $Z$ is independent of $(X,Y)$.

**Graphical log-linear models.** A **graphical** log-linear model is a special hierarchical model defined by an undirected graph $G$ on the variables: include an interaction term for a set of variables **iff** those variables form a clique (are all mutually adjacent) in $G$. The defining property is that the model's conditional-independence relations are exactly the pairwise Markov relations of $G$:
$$
\text{edge } (j,k) \text{ absent in } G \quad\Longleftrightarrow\quad \beta \text{-terms containing both } X_j, X_k \text{ are zero} \quad\Longleftrightarrow\quad X_j \perp X_k \mid \text{rest}.
$$
Thus **a missing edge ⇔ a missing pairwise (and higher) interaction**. Graphical models are a subclass of hierarchical models; the no-three-way-interaction model is hierarchical but *not* graphical (its three cliques would force the three-way term back in).

**Maximum-likelihood fitting.** Under the Poisson or multinomial likelihood, the MLEs of the log-linear parameters are found by maximizing the log-likelihood. The model is a generalized linear model with a log link, so the likelihood is **concave** and the MLE is unique (when it exists). For **decomposable** models the fitted expected counts have closed-form expressions as products and ratios of observed margins. When no closed form exists (e.g. no-three-way-interaction), one uses **iterative proportional fitting (IPF)**: repeatedly rescale the current fitted table so that each margin specified by the model's sufficient statistics matches the observed margin, cycling until convergence. The model's **sufficient statistics are exactly the marginal tables corresponding to its generators**.

**Model selection: deviance / $G^2$, AIC, BIC.** Competing log-linear models are compared by goodness-of-fit. The **deviance** (likelihood-ratio statistic) compares a fitted model against the saturated model:
$$
G^2 = 2 \sum_{\text{cells}} C \,\log\!\frac{C}{\hat m},
$$
where $C$ is the observed count and $\hat m$ the fitted expected count. Under the null that the smaller model holds, $G^2$ is approximately $\chi^2$ with degrees of freedom equal to the number of dropped parameters. Nested models are compared by the difference of their $G^2$ values. To trade fit against complexity across non-nested candidates, use **AIC** $= G^2 + 2k$ or **BIC** $= G^2 + k\log n$, where $k$ is the number of free parameters; BIC penalizes complexity more heavily and tends to select sparser graphs.

**Link to logistic regression.** If we single out one variable as a **response** $Y$ and condition on the others as predictors, the log-linear model for the joint distribution induces a **logistic regression** for $Y$ given the predictors. Concretely, the interaction terms involving $Y$ become the regression coefficients, and the terms not involving $Y$ drop out of the conditional. So logistic regression is a log-linear model with one variable distinguished as the outcome — the two are different views of the same exponential-family machinery.

## Quiz

**1.** What does a log-linear model take the logarithm of, and why is "linear" in the name?

> [!example]- Show answer
> A log-linear model expresses the **logarithm of the expected cell count** $m_{ij\ldots}$ (equivalently the log cell probability $\log p_{ij\ldots}$) as a **linear combination** of effect parameters — a grand mean, main effects, and interaction terms. It is "log-linear" because on the log scale the model is linear in the parameters, exactly like a linear/ANOVA model but applied to log-probabilities of a multinomial/Poisson table rather than to a continuous mean. The log link also keeps fitted probabilities positive automatically.

**2.** Write the saturated two-way log-linear model and identify each term.

> [!example]- Show answer
> $\log p_{ij} = \beta_0 + \beta_1^X(i) + \beta_2^Y(j) + \beta_{12}^{XY}(i,j)$. Here $\beta_0$ is the grand-mean / normalizing constant; $\beta_1^X(i)$ is the **main effect** of row variable $X$ at level $i$; $\beta_2^Y(j)$ is the main effect of column variable $Y$ at level $j$; and $\beta_{12}^{XY}(i,j)$ is the **interaction** term encoding the association between $X$ and $Y$. With all four sets of terms present the model is saturated — it has as many free parameters as cells and fits the table exactly.

**3.** Why do we need identifiability constraints, and name two common ones.

> [!example]- Show answer
> Without constraints the parameterization is **over-specified**: many different parameter vectors give the same fitted probabilities, so the parameters are not uniquely determined. Two standard fixes are the **sum-to-zero constraint** ($\sum_i \beta_1^X(i)=0$, and each interaction sums to zero over every index) and the **corner/baseline constraint** (set effects to zero whenever an index is at a reference level). Both remove the redundancy and leave the fitted cell probabilities unchanged; only the interpretation of the parameter values shifts.

**4.** State precisely the link between a zero interaction term and independence in a two-way table.

> [!example]- Show answer
> In the two-way model, $X \perp Y$ **if and only if** the interaction term is identically zero: $\beta_{12}^{XY}(i,j)=0$ for all $i,j$. When the interaction vanishes, $\log p_{ij}$ splits into a function of $i$ alone plus a function of $j$ alone, so $p_{ij}$ factors as $p_{i\cdot}\,p_{\cdot j}$ — the definition of independence. This is the foundational interpretive fact of the chapter: **dependence lives entirely in the interaction parameters.**

**5.** In a three-way table, which terms must be dropped to encode $Y \perp Z \mid X$?

> [!example]- Show answer
> You drop the **$Y$–$Z$ pairwise interaction $\beta_{23}^{YZ}$ and the three-way interaction $\beta_{123}^{XYZ}$**, keeping the $XY$ and $XZ$ interactions and all main effects. With those two terms gone, no surviving term contains both $Y$ and $Z$, so once you condition on $X$ the log-probability separates into a $Y$-part and a $Z$-part — i.e. $Y$ and $Z$ are conditionally independent given $X$. The hierarchical generator notation for this model is $[XY][XZ]$.

**6.** Define a hierarchical log-linear model and explain the generator notation.

> [!example]- Show answer
> A model is **hierarchical** if including any interaction term forces inclusion of all lower-order terms among subsets of those variables — e.g. having $\beta_{123}^{XYZ}$ requires all three pairwise terms and all main effects. Because of this nesting, a hierarchical model is fully specified by its **maximal interaction terms (generators)**. The notation $[XY][Z]$, for instance, lists the generators $\{X,Y\}$ and $\{Z\}$: it includes the $XY$ interaction and all its sub-terms, but $Z$ appears only as a main effect, meaning $Z \perp (X,Y)$.

**7.** What makes a log-linear model *graphical*, and how does it relate to undirected graphs?

> [!example]- Show answer
> A hierarchical model is **graphical** if it is defined by an undirected graph $G$ in which an interaction term is included **exactly when** its variables form a **clique** in $G$. Equivalently, a **missing edge** between $X_j$ and $X_k$ corresponds to all interaction terms containing both being zero, which is the conditional independence $X_j \perp X_k \mid \text{rest}$. So graphical log-linear models are the parametric realization of Chapter 18's undirected graphical models for categorical data — the graph's edges and the model's interactions carry the same information.

**8.** How does the no-three-way-interaction model show that not every hierarchical model is graphical?

> [!example]- Show answer
> The **no-three-way-interaction** (homogeneous association) model $[XY][XZ][YZ]$ keeps all three pairwise interactions but omits the three-way term. It is hierarchical (every included term has its sub-terms present). But the corresponding graph — with all three edges present — has $\{X,Y,Z\}$ as a clique, and a *graphical* model on that graph would be forced to include the three-way interaction. Since this model deliberately excludes it, it cannot be graphical. Hence **graphical ⊊ hierarchical**, and this model is the classic counterexample; it also has no closed-form MLE and must be fit by IPF.

**9.** What is the deviance $G^2$, and how is it used to compare nested log-linear models?

> [!example]- Show answer
> The deviance is the likelihood-ratio goodness-of-fit statistic $G^2 = 2\sum_{\text{cells}} C\log(C/\hat m)$, comparing observed counts $C$ to the model's fitted counts $\hat m$ (relative to the saturated model). Under the hypothesis that the smaller model is correct, $G^2$ is approximately $\chi^2$ with degrees of freedom equal to the number of parameters dropped. To compare two **nested** models, take the difference of their deviances and refer it to a $\chi^2$ with df equal to the difference in free parameters; a small, non-significant difference says the simpler model fits adequately.

**10.** Explain how logistic regression arises as a log-linear model. *(Applied)*

> [!example]- Show answer
> Take a joint log-linear model over several categorical variables and **single out one variable $Y$ as the response**, conditioning on the rest as predictors. Forming $\log\{p(Y=1\mid x)/p(Y=0\mid x)\}$, every term *not* involving $Y$ cancels, and the terms involving $Y$ (its main effect and its interactions with the predictors) become the **logistic-regression intercept and slope coefficients**. So logistic regression is exactly a log-linear model with one variable designated as the outcome — useful in practice when you care about predicting $Y$ rather than modeling the full joint table. It also means software for one can often be repurposed for the other.

**11.** You have a 4-way table of survey items and want to learn which pairs are conditionally independent. Outline a model-selection workflow. *(Applied)*

> [!example]- Show answer
> Fit a family of **graphical (or hierarchical) log-linear models**, since each missing edge is a conditional-independence claim. Start from the saturated model and search over candidate graphs by adding/removing edges (forward, backward, or stepwise), fitting each by maximum likelihood — closed-form for decomposable models, **IPF** otherwise. Score candidates with **AIC** ($G^2 + 2k$) or **BIC** ($G^2 + k\log n$) to balance fit against the number of parameters $k$; BIC favors sparser graphs. Read the conditional-independence structure off the edges of the selected graph: a missing edge between two items means they are independent given the rest. Validate with deviance tests on the final nested comparisons and check fitted vs. observed margins.

## Deeper understanding (expansion)

> [!info]+ 💡 Why log-linear models are the parametric face of undirected graphs
>
> Chapter 18 defines undirected graphical models abstractly through the **global/local/pairwise Markov properties**: a missing edge means conditional independence given everything else, and the joint factorizes over the cliques of the graph (Hammersley–Clifford). For **discrete** data, the Hammersley–Clifford factorization over cliques is *precisely* a log-linear expansion: the clique potentials become the interaction terms, and "factorizes over cliques" becomes "includes an interaction term for each clique." So a graphical log-linear model is not merely *analogous* to an undirected graph — it is the **same object written in coordinates**. This is why Chapter 19 reads as the computational, fittable sequel to Chapter 18: the graph tells you the independence structure, and the log-linear parameterization lets you estimate it from data, test edges, and select structure with concrete likelihood-based criteria.

> [!info]+ 💡 Decomposable models, closed forms, and why IPF exists
>
> A graph is **decomposable** (chordal/triangulated) when its cliques can be ordered to satisfy the running-intersection property. For decomposable log-linear models, the MLE of each expected cell count has an explicit **product-of-margins-over-product-of-separators** formula — no iteration needed, just multiply the observed clique margins and divide by the separator margins. This is the categorical analogue of the closed-form covariance estimates for decomposable Gaussian graphical models. When the graph is **not** decomposable (the no-three-way-interaction model is the canonical example), the margin constraints can all be satisfied simultaneously but no closed form exists, so you must iterate. **Iterative proportional fitting** does exactly this: it repeatedly rescales the working table so each generator's margin matches the data, cycling through generators until the fitted table stops changing. Because the log-likelihood is concave and the sufficient statistics are the generator margins, IPF is guaranteed to converge to the unique MLE.

> [!info]+ 💡 Hierarchy, sufficient statistics, and what you actually need to estimate
>
> The hierarchy principle is not just bookkeeping — it reflects what is **estimable and interpretable**. The sufficient statistics of a hierarchical log-linear model are exactly the **marginal tables indexed by its generators**; the data enter the likelihood only through those margins. Including a high-order interaction without its lower-order relatives would make the high-order parameter depend on the (arbitrary) coding of the lower terms, destroying interpretability and the clean margin-matching of MLE. Reading a hierarchical model through its generators tells you immediately which margins you need (for fitting) and which conditional independences hold (for interpretation): $[XY][XZ]$, for instance, needs only the $XY$ and $XZ$ two-way margins and encodes $Y \perp Z \mid X$. This is the same "sufficient statistics = relevant margins" logic that underlies exponential families throughout the book.

## Connections

- [[18-undirected-graphs]] — **← prerequisite and twin.** Chapter 18 gives the abstract undirected graphical model (Markov properties, clique factorization, Hammersley–Clifford); this chapter is its concrete discrete-data parameterization. A missing edge there ⇔ a missing interaction here.
- [[15-inference-about-independence]] — **← foundation.** The two-way independence test ($\chi^2$ / $G^2$ on a contingency table) is the simplest log-linear model selection problem: testing whether the single interaction term is zero. → Log-linear models generalize that one independence test to many variables and conditional independence.
- [[14-multivariate-models]] — **← parallel structure.** The multivariate-normal / Gaussian-graphical machinery (where a zero in the inverse covariance ⇔ conditional independence) is the continuous analogue; log-linear models are the categorical counterpart, with interactions playing the role of precision-matrix entries.
- [[13-linear-and-logistic-regression]] — **→ specialization.** Singling out one variable as the response turns a log-linear model into a **logistic regression**; the interaction terms involving the response become the regression coefficients. Logistic regression is a log-linear model with a distinguished outcome.
- Methodologically connects forward to **structure learning / model selection** via AIC, BIC, and deviance — the same penalized-likelihood ideas used to choose graphs in neural-net and high-dimensional graphical-model settings.
