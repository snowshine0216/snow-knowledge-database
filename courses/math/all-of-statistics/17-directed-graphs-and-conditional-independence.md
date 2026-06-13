---
tags: [dag, conditional-independence, d-separation, markov-condition, colliders, graphical-models, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 17 — Directed Graphs and Conditional Independence

> [!abstract]+ Chapter at a glance
>
> A directed acyclic graph (DAG) is a compact graphical language for encoding **conditional independence** relations among a collection of random variables. Nodes are variables, directed edges denote direct dependence, and the "acyclic" requirement forbids directed cycles so that variables can be ordered by ancestry. The single most important payoff is the **Markov factorization**: the joint density splits into a product of one factor per variable, each conditioned only on that variable's *parents*. This turns an exponentially large joint distribution into a small, structured set of local conditional distributions — the source of the model's efficiency. The chapter then develops the calculus for *reading independence off the picture*: the three basic three-node structures (chain, fork, collider), the surprising asymmetry that **conditioning on a collider creates dependence** (Berkson's paradox), the general **d-separation** rule that decides whether $A \perp B \mid C$, and the notions of **faithfulness** and **Markov equivalence** that govern what a DAG can and cannot tell you about the underlying distribution. It connects directly to the causal DAGs of Chapter 16 and contrasts with the undirected graphs of Chapter 18.

## Core concepts

**DAGs as a language for independence.** A graph $G = (V, E)$ has a vertex set $V$ (one node per random variable $X_1, \dots, X_d$) and an edge set $E$. In a *directed* graph each edge is an arrow $X \to Y$; in a DAG there is no sequence of arrows that returns to its starting node. We say $X$ is a **parent** of $Y$ (and $Y$ a **child** of $X$) if $X \to Y$. The **descendants** of $X$ are all nodes reachable by following arrows out of $X$; ancestors are reached by following arrows in. The acyclicity guarantees a *topological ordering* of the nodes so that every parent precedes its children.

**The Markov condition (factorization).** A distribution is **Markov** to a DAG $G$ if its joint density factors as a product of each variable conditioned on its parents:
$$f(x_1, \dots, x_d) = \prod_{i=1}^{d} f\big(x_i \mid \text{parents}(x_i)\big).$$
This is the defining equation of the chapter. It is exactly the chain-rule factorization $f(x_1,\dots,x_d) = \prod_i f(x_i \mid x_1,\dots,x_{i-1})$ in which each conditioning set $\{x_1, \dots, x_{i-1}\}$ has been *pruned down to just the parents*. Equivalently, each variable is conditionally independent of its non-descendants given its parents.

**Why factorization buys efficiency.** A full joint over $d$ binary variables needs $2^d - 1$ free probabilities. Under a DAG where each node has at most $k$ parents, the model needs only on the order of $d \cdot 2^k$ parameters. If the graph is sparse ($k$ small), this is a dramatic reduction — a chain of $d$ binary variables needs only about $2d$ numbers instead of $2^d$. The structure *is* the parameter savings.

**The chain: $X \to Y \to Z$.** Here $Y$ mediates the dependence between $X$ and $Z$. Marginally $X$ and $Z$ are dependent, but conditioning on the middle node *blocks* the path: $X \perp Z \mid Y$. Information flows from $X$ to $Z$ only through $Y$, so once $Y$ is known, $X$ tells you nothing more about $Z$.

**The fork (common cause): $X \leftarrow Y \to Z$.** $Y$ is a shared parent of $X$ and $Z$. They are marginally dependent (both driven by $Y$), but conditioning on the common cause *removes* the dependence: $X \perp Z \mid Y$. This is the statistical signature of confounding — a spurious association that vanishes once you adjust for $Y$.

**The collider (common effect): $X \to Y \leftarrow Z$.** Here $Y$ is a "v-structure" — two arrowheads collide at $Y$. The asymmetry that organizes the whole chapter: $X$ and $Z$ are **marginally independent**, $X \perp Z$, but conditioning on the collider $Y$ (or on any *descendant* of $Y$) **creates dependence**, $X \not\perp Z \mid Y$. Colliders behave *oppositely* to chains and forks: conditioning *opens* the path rather than closing it. This is **Berkson's paradox** — selecting on a common effect induces correlation between otherwise-unrelated causes.

**D-separation.** The general algorithm for reading $A \perp B \mid C$ off any DAG. A path between a node in $A$ and a node in $B$ is **blocked** by the conditioning set $C$ if either (i) the path contains a chain $\to m \to$ or a fork $\leftarrow m \to$ whose middle node $m \in C$, or (ii) the path contains a collider $\to m \leftarrow$ such that $m \notin C$ *and no descendant of* $m$ *is in* $C$. If **every** path between $A$ and $B$ is blocked given $C$, then $A$ and $B$ are **d-separated** by $C$, written $A \perp_G B \mid C$, and the Markov condition guarantees the probabilistic statement $A \perp B \mid C$.

**Faithfulness.** A distribution is **faithful** to $G$ if the conditional independencies present in the distribution are *exactly* those implied by d-separation — no more, no fewer. Markovness gives "graph $\Rightarrow$ independence"; faithfulness adds the converse "independence $\Rightarrow$ graph," ruling out coincidental cancellations (e.g. two paths whose effects exactly offset) that hide a dependence the graph would predict.

**Markov equivalence.** Different DAGs can encode the *same* set of conditional independence relations. Two DAGs are **Markov equivalent** iff they share the same **skeleton** (the same edges, ignoring arrow direction) and the same set of **v-structures** (colliders $X \to Y \leftarrow Z$ with $X$, $Z$ non-adjacent). Consequently $X \to Y \to Z$, $X \leftarrow Y \to Z$, and $X \leftarrow Y \leftarrow Z$ all encode $X \perp Z \mid Y$ and are indistinguishable from observational data alone — but the collider $X \to Y \leftarrow Z$ stands in its own class.

**Link to causal inference.** When the DAG is interpreted *causally* (an arrow means "directly causes"), it becomes the causal DAG of Chapter 16: parents are direct causes, and the factorization supports interventions via the do-operator and back-door adjustment. The same d-separation rules that read off statistical independence also identify confounders and valid adjustment sets.

## Quiz

**1.** State the Markov factorization for a DAG and explain in one sentence why it reduces the number of parameters relative to the full joint.

> [!example]- Show answer
> The Markov condition says $f(x_1,\dots,x_d) = \prod_{i=1}^d f(x_i \mid \text{parents}(x_i))$ — each variable is conditioned only on its parents rather than on all predecessors. It reduces parameters because each local factor $f(x_i \mid \text{parents}(x_i))$ depends on only a handful of variables, so a sparse DAG with at most $k$ parents per node needs roughly $d \cdot 2^k$ numbers instead of the $2^d - 1$ a full joint over $d$ binary variables requires. The graph structure directly encodes which conditional independencies make this pruning valid.

**2.** Define parents, children, descendants, and explain the role of acyclicity.

> [!example]- Show answer
> $X$ is a **parent** of $Y$ if there is an edge $X \to Y$; then $Y$ is a **child** of $X$. The **descendants** of a node are all nodes reachable by following arrows forward out of it (children, children of children, and so on); ancestors are reached by following arrows backward. **Acyclicity** forbids any directed cycle, which guarantees a topological ordering in which every parent precedes its children. Without acyclicity the factorization $\prod_i f(x_i \mid \text{parents})$ would not correspond to a valid recursive decomposition of the joint.

**3.** In the chain $X \to Y \to Z$, what is the independence relation, and what happens when you condition on $Y$?

> [!example]- Show answer
> Marginally $X$ and $Z$ are dependent, because information flows from $X$ through $Y$ to $Z$. Conditioning on the middle node *blocks* this path: $X \perp Z \mid Y$. Intuitively, once $Y$ is known the influence of $X$ on $Z$ is fully accounted for, so $X$ carries no additional information about $Z$. This is the d-separation rule for a chain whose middle node is in the conditioning set.

**4.** In the fork $X \leftarrow Y \to Z$, why are $X$ and $Z$ dependent, and why does conditioning on $Y$ remove the dependence?

> [!example]- Show answer
> $Y$ is a common cause feeding both $X$ and $Z$, so variation in $Y$ induces a marginal association between them even though neither causes the other — a textbook confounding pattern. Conditioning on the shared parent fixes the common driver, so the remaining variation in $X$ and $Z$ is independent: $X \perp Z \mid Y$. This is exactly why adjusting for a confounder can make a spurious correlation disappear.

**5.** State the collider rule for $X \to Y \leftarrow Z$ and explain why it is the opposite of the chain and fork.

> [!example]- Show answer
> For a collider, $X$ and $Z$ are **marginally independent** ($X \perp Z$), but conditioning on the collider $Y$ — or on any descendant of $Y$ — **creates** dependence ($X \not\perp Z \mid Y$). This is the reverse of the chain and fork, where conditioning on the middle/parent *removes* dependence. The asymmetry is what makes colliders special: in a path, a collider is blocked *by default* and opened by conditioning, whereas chains and forks are open by default and blocked by conditioning.

**6.** What is Berkson's paradox, and how does it arise from conditioning on a collider?

> [!example]- Show answer
> Berkson's paradox is the induction of a (often negative) correlation between two independent causes by selecting on their common effect. If $X$ and $Z$ independently raise the chance of $Y$, then within the subset where $Y$ occurred, observing that $X$ is absent makes $Z$ more likely (since *something* must have produced $Y$). Mechanically this is conditioning on the collider $Y$ in $X \to Y \leftarrow Z$, which opens the path and creates $X \not\perp Z \mid Y$ even though $X \perp Z$ unconditionally. It is a classic source of selection bias in observational studies.

**7.** State the d-separation criterion for deciding whether $A \perp B \mid C$.

> [!example]- Show answer
> A path between $A$ and $B$ is **blocked** given $C$ if (i) it contains a chain $\to m \to$ or a fork $\leftarrow m \to$ with the middle node $m \in C$, or (ii) it contains a collider $\to m \leftarrow$ where $m \notin C$ and no descendant of $m$ is in $C$. If *every* path between $A$ and $B$ is blocked by $C$, then $A$ and $B$ are **d-separated** by $C$ and the Markov condition guarantees $A \perp B \mid C$. If even one path remains unblocked (active), d-separation fails and the variables need not be conditionally independent.

**8.** Define Markov equivalence and give the condition under which two DAGs are equivalent.

> [!example]- Show answer
> Two DAGs are **Markov equivalent** if they encode exactly the same set of conditional independence relations. The criterion is that they have the same **skeleton** (the same undirected edges, ignoring arrow direction) and the same set of **v-structures** (immoralities) — colliders $X \to Y \leftarrow Z$ whose parents $X, Z$ are non-adjacent. For example $X \to Y \to Z$, $X \leftarrow Y \to Z$, and $X \leftarrow Y \leftarrow Z$ are all equivalent (they share a skeleton and have no v-structure), so observational data cannot distinguish them.

**9.** What does the faithfulness assumption add beyond the Markov condition, and why might it fail?

> [!example]- Show answer
> The Markov condition gives only one direction: every d-separation in the graph implies a conditional independence in the distribution. **Faithfulness** adds the converse — every conditional independence in the distribution corresponds to a d-separation in the graph — so the graph's independencies are *exactly* the distribution's. It can fail when separate causal paths cancel: if a direct effect and an indirect effect of $X$ on $Z$ are equal and opposite, the marginal association is zero even though the graph leaves the path active, producing an "unfaithful" independence not predicted by d-separation.

**10.** *(Applied)* You survey hospital patients and find that among the hospitalized, a respiratory disease and a bone disease are negatively associated, even though in the general population they are unrelated. Diagram this with a DAG and explain the association.

> [!example]- Show answer
> Let $R$ = respiratory disease, $B$ = bone disease, and $H$ = hospitalization. Both diseases independently raise the chance of being hospitalized, giving the collider $R \to H \leftarrow B$, with $R \perp B$ in the population. Studying only hospitalized patients conditions on the collider $H$, opening the path and inducing $R \not\perp B \mid H$: among the hospitalized, a patient without the respiratory disease is more likely to have been admitted for the bone disease, producing the spurious negative association. This is Berkson's paradox / collider-stratification bias, and the fix is to avoid selecting the sample on the common effect.

## Deeper understanding (expansion)

> [!info]+ 💡 D-separation is just the three local rules applied along every path
>
> D-separation can look like a long list of cases, but it is really nothing more than the chain/fork/collider trichotomy applied node-by-node along each path. Walk a path from $A$ to $B$: at every intermediate node the path passes through *one* of three local shapes. A chain or fork node *blocks* the path when it is conditioned on, and *transmits* otherwise; a collider node does the reverse — it *blocks* by default and *transmits* once it (or a descendant) is conditioned on. A path is **active** (information-carrying) only if *every* node along it transmits; a single blocked node kills the whole path. $A$ and $B$ are d-separated by $C$ when *no* active path survives. Reading independence off a DAG is therefore a purely mechanical graph traversal — which is exactly why graphical models scale: the question "is $A \perp B \mid C$?" reduces to a reachability search rather than an integral.

> [!info]+ 💡 Why colliders make causal discovery possible
>
> Markov equivalence says that from observational data alone you cannot orient most edges — $X \to Y \to Z$ and $X \leftarrow Y \to Z$ are indistinguishable. The one structure that *is* identifiable is the v-structure. Because a collider $X \to Y \leftarrow Z$ produces the unique signature "$X \perp Z$ marginally but $X \not\perp Z \mid Y$," its arrow directions are forced by the data: no equivalent DAG can reverse them without changing the independence pattern. Constraint-based structure-learning algorithms exploit exactly this — they first recover the skeleton from conditional-independence tests, then orient colliders from the marginal-vs-conditional asymmetry, and finally propagate any orientations that acyclicity forces. The collider is thus not just a curiosity; it is the lever that lets data say anything at all about causal direction.

> [!info]+ 💡 The factorization as a budget on dependence
>
> It helps to read the Markov factorization as a *modeling budget*. The full chain rule $f = \prod_i f(x_i \mid x_1,\dots,x_{i-1})$ is always true but useless — it spends the entire exponential parameter budget. A DAG is a claim about which of those conditioning variables can be dropped: every variable you *omit* from a factor's conditioning set is an assertion of conditional independence, and every assertion is a saving. Sparse graphs are cheap precisely because they assert many independencies; dense graphs approach the full joint and assert few. This reframes model selection over DAGs as a bias–variance trade-off: a richer graph fits more dependence but estimates more parameters, while a sparser graph is more efficient but risks omitting a real edge. The skeleton you choose is, quite literally, the set of dependencies you are willing to pay for.

## Connections

- [[01-probability]] — DAGs are built on the chain rule and the definition of conditional independence ($A \perp B \mid C \iff f(a,b \mid c) = f(a\mid c) f(b \mid c)$); the Markov factorization is the chain rule with conditioning sets pruned to parents. ← the probability foundations make the graphical pruning meaningful.
- [[16-causal-inference]] — interpreting arrows as direct causes turns a DAG into a **causal DAG**; the same d-separation rules identify confounders and valid back-door adjustment sets. → reading this chapter first makes the do-operator and intervention calculus of Ch. 16 concrete.
- [[18-undirected-graphs]] — undirected (Markov) networks encode independence through graph separation and a clique factorization rather than parent factorization; they capture symmetric dependence but *cannot* represent v-structures the way DAGs do. → contrast directed vs. undirected separation here.
- [[19-log-linear-models]] — log-linear models give a concrete parametric realization of conditional independence for categorical data; a missing interaction term corresponds to a missing edge / a conditional-independence constraint. → the graphical structure of a log-linear model is read off exactly via these independence rules.
- [[15-inference-about-independence]] — the conditional-independence *tests* that detect edges feed directly into structure learning over DAGs. → the testing machinery becomes the input to the d-separation reasoning developed here.
