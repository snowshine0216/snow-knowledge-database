---
tags: [causal-inference, counterfactuals, potential-outcomes, confounding, randomization, average-treatment-effect, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 16 — Causal Inference

> [!abstract]+ Chapter at a glance
>
> This is the chapter where the slogan "association is not causation" gets a precise mathematical meaning. The whole preceding book has been about *probabilistic association* — joint distributions, conditional expectations, regression coefficients — quantities that describe how variables move together in the data we happen to observe. Causation asks a different question: what *would happen* if we intervened and set a variable to a chosen value? Wasserman builds the answer on **counterfactuals** (potential outcomes). For a binary treatment $X \in \{0,1\}$, each unit secretly carries two numbers, $C_0$ and $C_1$ — its response if untreated and its response if treated — and we only ever see one of them. From this single idea everything follows: the *average causal effect* $\theta = E[C_1] - E[C_0]$ is the thing we want; the *association* $\alpha = E[Y\mid X=1] - E[Y\mid X=0]$ is the thing the data hand us; **confounding** is exactly the gap between them; **randomization** is the device that closes the gap by making $X$ independent of the counterfactuals; and **adjustment** (stratifying on covariates) recovers $\theta$ from observational data, but only under the strong, untestable assumption that we measured every confounder. The chapter closes by pointing at directed acyclic graphs as a richer language for the same ideas — the bridge into Chapter 17.

## Core concepts

**Association vs. causation.** Association answers "given that I *observe* $X=1$, what do I expect for $Y$?" Causation answers "if I *force* $X=1$, what happens to $Y$?" These are different questions with generally different answers. Conditioning on an observed value (seeing) is not the same as intervening (doing). The entire chapter is an apparatus for keeping these two apart and saying when they coincide.

**Potential outcomes (counterfactuals).** Introduce two random variables per unit for a binary treatment $X\in\{0,1\}$:
- $C_0$ = the response the unit *would* have if untreated,
- $C_1$ = the response the unit *would* have if treated.

These are the **counterfactuals**. The pair $(C_0, C_1)$ exists for every unit, but treatment selects which one becomes visible.

**The consistency link.** The observed outcome equals the potential outcome for the treatment actually received:
$$Y = C_X = \begin{cases} C_0 & \text{if } X = 0,\\ C_1 & \text{if } X = 1.\end{cases}$$
Equivalently $Y = X C_1 + (1-X) C_0$. This is the *only* equation tying the latent counterfactuals to observable data.

**The fundamental problem of causal inference.** For any single unit we observe exactly one of $C_0, C_1$ and never the other. The unobserved one is the **counterfactual** — the road not taken. Causal effects at the unit level can never be measured directly; we are forced to work with *averages over populations*, where the missing halves can sometimes be filled in by other units.

**Average causal effect (ATE).** The quantity of interest is the **average treatment effect**:
$$\theta = E[C_1] - E[C_0].$$
$\theta$ is a difference of two *marginal* means of counterfactuals — what the average response would be if *everyone* were treated minus what it would be if *everyone* were untreated. It does not mention $X$ at all; it is a property of the population, not of any particular assignment mechanism.

**The association.** What the data directly estimate is the **association**:
$$\alpha = E[Y \mid X = 1] - E[Y \mid X = 0].$$
Both conditional means are identifiable from observed data alone. $\alpha$ is essentially the slope you would get from a simple regression of $Y$ on $X$.

**Why $\theta \neq \alpha$ in general.** Using consistency, $E[Y\mid X=1] = E[C_1 \mid X=1]$ and $E[Y\mid X=0] = E[C_0 \mid X=0]$. So
$$\alpha = E[C_1 \mid X=1] - E[C_0 \mid X=0],$$
whereas $\theta = E[C_1] - E[C_0]$. These agree only when the *treated* group's $C_1$ behaves like the whole population's $C_1$, and likewise for $C_0$ — i.e. only when treatment carries no information about the counterfactuals. In observational data, the people who get treated are usually systematically different (sicker, richer, more motivated), so $E[C_1\mid X=1]\neq E[C_1]$ and the two quantities diverge.

**Confounding.** A **confounder** is a variable $Z$ that influences both the treatment $X$ and the outcome $Y$. A confounder induces a statistical association between $X$ and $Y$ that is *not* causal — sick patients both seek a drug *and* tend to fare worse, manufacturing a spurious correlation between the drug and bad outcomes. Confounding is precisely the mechanism that makes $\theta \neq \alpha$; "association is not causation" *is* the statement "confounders exist."

**Randomization breaks confounding.** If treatment is assigned by the flip of a (possibly biased) coin, independent of everything about the unit, then
$$X \perp\!\!\!\perp (C_0, C_1).$$
Independence makes $E[C_1 \mid X=1] = E[C_1]$ and $E[C_0 \mid X=0] = E[C_0]$, so
$$\alpha = E[C_1] - E[C_0] = \theta.$$
**In a randomized experiment, association equals causation.** This is why the randomized controlled trial is the gold standard: randomization cannot create a confounder because nothing about the unit can influence the coin.

**Adjustment / back-door identification from observational data.** When we cannot randomize, we try to *recover* $\theta$ by controlling for confounders. Suppose all confounders are collected in a measured covariate $Z$, and that *within* each level of $Z$ treatment is "as good as random" — no unmeasured confounding (also called ignorability or conditional independence: $X \perp\!\!\!\perp (C_0,C_1)\mid Z$). Then we stratify and average:
$$\theta = \sum_z \Big( E[Y\mid X=1, Z=z] - E[Y\mid X=0, Z=z] \Big)\, P(Z=z),$$
(with an integral for continuous $Z$). This is the **adjustment formula** (the "back-door" idea in graph language): compute the association inside each stratum where confounding is held fixed, then average over the population distribution of $Z$. Note we weight by the *marginal* $P(Z=z)$, not the treatment-specific distribution — a key contrast with naive subgroup comparisons.

**The catch — no unmeasured confounding.** Adjustment is honest *only if $Z$ contains every confounder*. This assumption is **untestable from the data**: there is no statistic that reveals a lurking confounder you forgot to measure. Causal conclusions from observational studies therefore always rest on a subject-matter judgment that the model is complete, which is why observational causal claims are inherently more fragile than experimental ones.

**Regression and causation.** Fitting $E[Y\mid X, Z]$ and reading off the coefficient on $X$ is just a parametric version of adjustment. The regression coefficient has a causal interpretation *only* under the same no-unmeasured-confounding assumption (plus correct functional form). A regression coefficient is a causal effect by assumption, never by computation.

**A first look at DAGs.** A **directed acyclic graph** draws an arrow $A \to B$ when $A$ is a direct cause of $B$. Confounding then becomes a *picture*: a confounder $Z$ is a node with arrows into both $X$ and $Y$, creating a "back-door path" $X \leftarrow Z \to Y$ that transmits non-causal association. Adjusting for $Z$ "blocks" that path. Graphs give a systematic calculus — covered fully in Chapter 17 — for deciding which variables to adjust for and which causal effects are identifiable.

## Quiz

**1.** State the difference between the association $\alpha$ and the causal effect $\theta$, and explain why they are generally not equal.

> [!example]- Show answer
> The association is $\alpha = E[Y\mid X=1] - E[Y\mid X=0]$, a difference of conditional means available directly from observed data. The causal effect is $\theta = E[C_1] - E[C_0]$, a difference of *marginal* means of the two counterfactuals — the population response if everyone were treated minus if everyone were untreated. Using consistency, $\alpha = E[C_1\mid X=1] - E[C_0\mid X=0]$, which equals $\theta$ only when the treated and untreated subpopulations represent the whole population's counterfactuals. In general the treated are systematically different (selection), so $\alpha$ and $\theta$ diverge. The gap between them is exactly confounding.

**2.** What are the potential outcomes $C_0$ and $C_1$, and what is the "fundamental problem of causal inference"?

> [!example]- Show answer
> For a binary treatment, $C_0$ is the response a unit would have if untreated and $C_1$ the response it would have if treated; both are defined for every unit simultaneously. The fundamental problem is that for any one unit we can observe only one of these — the unit is either treated or not — so the other potential outcome is forever counterfactual and unobserved. Unit-level causal effects $C_1 - C_0$ are therefore never directly measurable. Causal inference proceeds by working with population averages, where other units supply the missing arm. This recasts causal inference as essentially a missing-data problem.

**3.** Write down the consistency relationship linking the observed outcome $Y$ to the counterfactuals, and explain its role.

> [!example]- Show answer
> Consistency states $Y = C_X$, i.e. $Y = X C_1 + (1-X) C_0$: the observed outcome equals the potential outcome for the treatment actually received. It is the single bridge between the latent counterfactual world (where $C_0, C_1$ both exist) and the observed world (where only $Y$ and $X$ are recorded). Every identification result is derived by substituting this equation into conditional expectations — e.g. $E[Y\mid X=1] = E[C_1\mid X=1]$. Without consistency the counterfactuals would be disconnected from data and nothing could be estimated.

**4.** Define a confounder and explain precisely how confounding makes association differ from causation.

> [!example]- Show answer
> A confounder is a variable $Z$ that affects both the treatment $X$ and the outcome $Y$. Because $Z$ drives both, it induces an association between $X$ and $Y$ that flows through $Z$ rather than through any causal effect of $X$ on $Y$. Concretely it makes the treated and untreated groups differ in their baseline counterfactuals, so $E[C_1\mid X=1]\neq E[C_1]$ and $E[C_0\mid X=0]\neq E[C_0]$. That mismatch is exactly the difference $\alpha - \theta$. "Association is not causation" is the same statement as "confounders may exist."

**5.** Why does randomization guarantee that association equals causation?

> [!example]- Show answer
> Randomly assigning treatment makes $X$ independent of the potential outcomes: $X \perp\!\!\!\perp (C_0, C_1)$. Independence implies $E[C_1\mid X=1] = E[C_1]$ and $E[C_0\mid X=0] = E[C_0]$. Substituting into $\alpha = E[C_1\mid X=1] - E[C_0\mid X=0]$ gives $\alpha = E[C_1] - E[C_0] = \theta$. So in a randomized experiment the observable association is an unbiased estimate of the causal effect. Randomization works because nothing about the unit can influence the coin, so no confounder can form — even confounders nobody thought to measure.

**6.** What does the adjustment (back-door) formula say, and what assumption does it require?

> [!example]- Show answer
> The adjustment formula computes the causal effect as a covariate-weighted average of within-stratum associations:
> $$\theta = \sum_z \big(E[Y\mid X=1, Z=z] - E[Y\mid X=0, Z=z]\big) P(Z=z).$$
> Inside each level of $Z$ confounding is held fixed, so the within-stratum difference is causal; averaging over the marginal $P(Z=z)$ scales it back to the population. The crucial requirement is *no unmeasured confounding*: $Z$ must contain every variable that affects both $X$ and $Y$, equivalently $X \perp\!\!\!\perp (C_0,C_1)\mid Z$. If a confounder is omitted, the formula returns a biased number with no warning.

**7.** Why is the "no unmeasured confounding" assumption untestable, and what does that imply for observational studies?

> [!example]- Show answer
> The assumption concerns variables you did *not* measure; by definition the data contain no information about them, so no statistical test can confirm or refute their absence. Two datasets identical in everything observed can have completely different true causal effects depending on a hidden confounder. This means observational causal conclusions always rest on a subject-matter argument that the adjustment set is complete, not on the data alone. It is the central reason randomized experiments are considered stronger evidence: randomization makes the analogous assumption true by design rather than by faith.

**8.** When you fit a regression and read off the coefficient on the treatment, under what conditions can you call it a causal effect?

> [!example]- Show answer
> A regression of $Y$ on $X$ and covariates $Z$ is a parametric implementation of the adjustment formula. The coefficient on $X$ estimates a causal effect only if (a) $Z$ captures all confounders (no unmeasured confounding) and (b) the functional form of the model is correct. Under those assumptions the partial coefficient equals the within-stratum causal difference. Absent them, the coefficient is merely a descriptive measure of conditional association. In short, a regression slope is causal by assumption, never automatically by the act of fitting.

**9.** In a DAG, how does a confounder appear, and what does "adjusting" do to it?

> [!example]- Show answer
> In a directed acyclic graph an arrow $A\to B$ means $A$ is a direct cause of $B$. A confounder $Z$ shows up as a node with arrows into both the treatment and the outcome, $X \leftarrow Z \to Y$, creating a non-causal "back-door path" connecting $X$ and $Y$. This open path lets association flow that is not due to $X$ causing $Y$. Adjusting for (conditioning on) $Z$ blocks the back-door path, so the remaining association between $X$ and $Y$ reflects only the causal arrow $X\to Y$. The graph thus turns the choice of adjustment set into a path-blocking exercise, developed fully in Chapter 17.

**10.** *(Applied)* A hospital study finds patients given a new surgery have *higher* death rates than those given medication. A colleague concludes the surgery is harmful. Using the counterfactual framework, critique this and describe how you would estimate the true causal effect.

> [!example]- Show answer
> The naive comparison reports the association $\alpha = E[Y\mid X=\text{surgery}] - E[Y\mid X=\text{medication}]$, but surgery is typically reserved for the sickest patients — disease severity is a confounder driving both treatment choice and death. So the surgery group has worse baseline counterfactuals, $E[C_{\text{surgery}}\mid X=\text{surgery}] > E[C_{\text{surgery}}]$, inflating $\alpha$ above the true $\theta = E[C_1]-E[C_0]$. The gold-standard fix is a randomized trial, which makes treatment independent of severity. If only observational data exist, measure severity and other confounders $Z$ and apply the adjustment formula, comparing surgery vs. medication *within* severity strata and averaging over $P(Z)$ — valid only if no important confounder is left unmeasured.

## Deeper understanding (expansion)

> [!info]+ 💡 Causal inference is a missing-data problem in disguise
>
> The cleanest mental model for this chapter is to imagine a spreadsheet with two outcome columns, $C_0$ and $C_1$, one row per unit. The treatment $X$ acts like a redaction rule: it erases the $C_1$ entry for everyone untreated and the $C_0$ entry for everyone treated, leaving you a single visible column $Y$. Causal inference is then literally the problem of imputing the redacted cells well enough to estimate $E[C_1]-E[C_0]$. Randomization helps because it guarantees the redaction is "missing completely at random" with respect to the outcomes, so the visible treated cells are a fair sample of $C_1$ and the visible untreated cells a fair sample of $C_0$. Adjustment is the weaker "missing at random within $Z$" assumption — the cells are missing at random once you condition on the measured covariates. Seeing the whole subject as a missing-data problem demystifies why the assumptions take the form they do and why unit-level effects are unrecoverable.

> [!info]+ 💡 Why "controlling for more variables" is not always safer
>
> A natural instinct is that adjusting for *more* covariates can only help — surely no harm in conditioning on an extra variable. The potential-outcomes / DAG view shows this is false. If you adjust for a variable that lies on the causal pathway from $X$ to $Y$ (a *mediator*), you remove part of the very effect you wanted to measure, biasing $\theta$ toward zero. Worse, conditioning on a *collider* — a variable caused by both $X$ and $Y$ (or by their causes) — can *open* a spurious path and *create* association where none existed, a phenomenon invisible to anyone thinking only in terms of "add more controls." This is why Chapter 16's adjustment formula is stated specifically for *confounders*, and why Chapter 17's graphical criteria (the back-door criterion) are needed to decide the right set: the correct adjustment set is a structural question, not a "kitchen-sink" one.

> [!info]+ 💡 Seeing vs. doing: conditioning is not intervening
>
> A compact way to remember the whole chapter is the distinction between $P(Y\mid X=x)$ (conditioning — *seeing* $X=x$) and the interventional distribution often written $P(Y\mid \text{do}(X=x))$ (*doing* $X=x$). Conditioning filters the existing population to the subgroup that happens to have $X=x$, inheriting all the selection and confounding that produced that subgroup. Intervening reaches in and sets $X=x$ for everyone, severing the arrows that normally point *into* $X$. The causal effect $\theta$ is built from the do-distribution; the association $\alpha$ from the conditional. They coincide exactly when nothing points into $X$ except the experimenter's coin — i.e. under randomization — or, in observational data, when adjustment successfully mimics that severing. This "seeing vs. doing" slogan is the conceptual seed that the graphical machinery of Chapter 17 formalizes.

## Connections

- [[10-hypothesis-testing-and-p-values]] ← A randomized trial's estimate of $\theta$ is tested and given confidence intervals with exactly the inferential machinery of earlier chapters; randomization justifies the test, the test quantifies the uncertainty. → The "no unmeasured confounding" assumption, by contrast, is *not* a hypothesis any p-value can assess — a key limit of testing.
- [[13-linear-and-logistic-regression]] ← Adjustment for confounders is most often carried out by including covariates in a regression; the treatment coefficient is a parametric version of the adjustment formula. → A regression slope becomes a causal effect only under no-unmeasured-confounding plus correct functional form, so this chapter sets the conditions under which Chapter 13's coefficients may be read causally.
- [[15-inference-about-independence]] ← The independence and conditional-independence concepts ($X\perp\!\!\!\perp(C_0,C_1)$ under randomization; $X\perp\!\!\!\perp(C_0,C_1)\mid Z$ under ignorability) are the same notions tested there, now applied to counterfactuals. → Measuring association without these independences is exactly what produces confounded conclusions.
- [[17-directed-graphs-and-conditional-independence]] → This chapter ends by introducing DAGs informally; Chapter 17 develops them fully — d-separation, the back-door criterion, and the formal calculus that decides which adjustment sets identify $\theta$. The confounder-as-back-door-path picture here is the entry point. ← Chapter 17's graphical conditional-independence statements are the structural justification for the adjustment formula derived here.
- [[14-multivariate-models]] ← The joint distribution of $(X, Y, Z)$ and the conditional means used in adjustment build directly on multivariate modeling; causal inference adds the counterfactual layer on top of that probabilistic foundation.
