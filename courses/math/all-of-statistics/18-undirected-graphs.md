---
tags: [undirected-graphs, markov-random-fields, conditional-independence, graphical-models, cliques, hammersley-clifford, markov-blanket, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 18 — Undirected Graphs

> [!abstract]+ Chapter at a glance
>
> Chapter 17 used **directed** acyclic graphs (DAGs) to encode conditional independence through the d-separation rule, with its tricky collider/v-structure behavior. This chapter introduces the complementary language: **undirected graphs**, also called **Markov random fields**, **Markov networks**, or **undirected graphical models**. Here edges are symmetric — there is no notion of parent or child — and the reading rule collapses to ordinary **graph separation**: if removing a set $C$ of nodes disconnects $A$ from $B$, then $A \perp B \mid C$. No colliders, no arrowhead bookkeeping. The chapter develops three equivalent **Markov properties** (pairwise, local, global), shows they coincide for strictly positive densities, and then states the structural payoff: the joint density **factorizes over the cliques** of the graph as a product of nonnegative potential functions (the Hammersley–Clifford theorem). It closes by contrasting the expressive power of undirected and directed graphs — neither contains the other — and sketches how to estimate an undirected graph from data, especially via log-linear models for discrete variables.

## Core concepts

**The object: an undirected graph $G = (V, E)$.** Vertices $V$ index random variables; an edge is an *unordered* pair $\{i,j\}$. Two nodes are **adjacent** (neighbors) if joined by an edge. A graph encodes a set of conditional-independence statements about the joint distribution of $(X_1, \dots, X_k)$. The whole game is translating between graph topology and independence facts.

**Separation is the reading rule.** Let $A$, $B$, $C$ be disjoint sets of vertices. We say $C$ **separates** $A$ and $B$ if every path from a node in $A$ to a node in $B$ passes through at least one node of $C$ — equivalently, deleting the vertices in $C$ leaves no path connecting $A$ to $B$. The fundamental claim is:
$$ C \text{ separates } A \text{ and } B \;\Longrightarrow\; A \perp B \mid C. $$
This is dramatically simpler than d-separation: graph separation is a purely topological notion you can check by eye, and there is no collider exception. Conditioning never *creates* dependence in an undirected graph.

**Pairwise Markov property.** The minimal way to attach independence facts to a graph: for every pair of *non-adjacent* nodes $i$ and $j$,
$$ X_i \perp X_j \;\big|\; X_{\text{rest}}, $$
where "rest" means all other variables $X_{V \setminus \{i,j\}}$. In words, a *missing edge* means those two variables are conditionally independent given everything else. The presence of an edge means "we are not asserting independence" — it does **not** force dependence.

**Local Markov property and the Markov blanket.** A node is conditionally independent of the rest of the graph given its **neighbors**:
$$ X_i \perp X_{\text{rest}} \;\big|\; X_{\text{ne}(i)}, $$
where $\text{ne}(i)$ is the neighbor set of $i$. For undirected graphs the neighbor set *is* the **Markov blanket** — the smallest set that shields $X_i$ from everything else. This is cleaner than the directed case, where the Markov blanket is "parents, children, and co-parents (parents of children)."

**Global Markov property.** The full separation statement above: *every* separation in the graph implies a conditional independence. Pairwise and local are special cases of the global property.

**The three properties coincide for positive densities.** In general, global $\Rightarrow$ local $\Rightarrow$ pairwise always holds. The reverse implications can fail for degenerate distributions, but when the joint density $f(x)$ is **strictly positive** everywhere (no forbidden configurations, $f(x) > 0$), all three Markov properties are **equivalent**. Wasserman works in this positive regime, so "the graph's independencies" is unambiguous.

**Cliques.** A **clique** is a set of vertices that are all mutually adjacent (a complete subgraph). A **maximal clique** is a clique that cannot be enlarged by adding another vertex while staying complete. Cliques are the atoms of the factorization — they replace the "node and its parents" families used in the directed factorization of Chapter 17.

**Clique factorization (Hammersley–Clifford).** For a positive density that is Markov with respect to $G$, the joint density factors as a product of nonnegative **potential** (or **clique potential**) functions $\psi_C$, one per clique $C$:
$$ f(x) \;=\; \frac{1}{Z} \prod_{C \in \mathcal{C}} \psi_C(x_C), $$
where $\mathcal{C}$ is the set of (maximal) cliques, $x_C$ restricts $x$ to the variables in clique $C$, each $\psi_C \ge 0$, and
$$ Z \;=\; \sum_{x} \prod_{C} \psi_C(x_C) \quad\text{(or an integral for continuous } x) $$
is the **normalizing constant** (the *partition function*) that makes $f$ integrate to one. Conversely, any density of this product form is Markov w.r.t. $G$. Two warnings: (1) potentials are **not** marginals or conditionals and need not be probabilities — they are just nonnegative weights; (2) the global constant $Z$ couples all the factors, which is exactly why undirected models are harder to normalize and fit than directed ones (whose factors are locally normalized conditionals that multiply to 1 automatically).

**Contrast with directed graphs.** Neither language dominates the other:
- An undirected graph **cannot** represent a pure **collider / v-structure**. The DAG $X \to Z \leftarrow Y$ says $X \perp Y$ (marginally) but $X \not\perp Y \mid Z$ — conditioning *induces* dependence. No undirected graph captures "independent unconditionally, dependent given $Z$," because separation can only *remove* dependence, never create it.
- A directed (acyclic) graph **cannot** represent certain **symmetric, cyclic** independence patterns. The classic example is four variables on a 4-cycle $X_1 - X_2 - X_3 - X_4 - X_1$ with the independencies $X_1 \perp X_3 \mid \{X_2, X_4\}$ and $X_2 \perp X_4 \mid \{X_1, X_3\}$ simultaneously; no DAG encodes exactly this set without adding an edge or a v-structure.
- The distributions representable by *both* are the **decomposable** (chordal / triangulated) graphs, where a DAG and an undirected graph encode the same independencies.

**Fitting an undirected graph from data.** Two broad strategies:
1. **Test conditional independencies** and add an edge between $i$ and $j$ whenever $X_i \not\perp X_j \mid \text{rest}$ (the pairwise rule run in reverse). Equivalently, for jointly Gaussian data, edges correspond to **nonzero entries of the inverse covariance (precision) matrix** $\Omega = \Sigma^{-1}$: $\Omega_{ij} = 0 \iff X_i \perp X_j \mid \text{rest}$.
2. For **discrete** data, fit a **log-linear model** (Chapter 19). Taking logs of the clique factorization turns the product of potentials into a *sum* of interaction terms, and the graph structure corresponds to which interaction terms are present. Model selection — deciding which edges/interactions to keep — proceeds by likelihood-ratio / deviance tests or an information criterion.

## Quiz

**1.** State the separation reading rule for an undirected graph and explain how it differs from d-separation in a directed graph.

> [!example]- Show answer
> If disjoint sets $A$, $B$, $C$ satisfy the condition that $C$ **separates** $A$ from $B$ — meaning every path from $A$ to $B$ passes through some node in $C$ — then $A \perp B \mid C$. You check it by deleting the nodes in $C$ and seeing whether any path from $A$ to $B$ survives. The key difference from d-separation is that there are **no colliders**: in an undirected graph conditioning can only *block* dependence, never create it. d-separation has the special v-structure rule where conditioning on a collider (or its descendant) *opens* a path, which has no undirected analogue.

**2.** Define the pairwise Markov property. What does a *missing* edge assert, and what does a *present* edge assert?

> [!example]- Show answer
> The pairwise Markov property says: for every pair of non-adjacent nodes $i$ and $j$, $X_i \perp X_j \mid X_{\text{rest}}$, where "rest" is all the other variables. So a **missing edge** between $i$ and $j$ is a positive claim of conditional independence given everything else. A **present edge** asserts *nothing* — it merely declines to claim independence; the two variables may or may not actually be dependent. This asymmetry (edges are permissive, missing edges are restrictive) is why sparser graphs encode stronger assumptions.

**3.** Define the local Markov property and the Markov blanket. Why is the undirected Markov blanket simpler than the directed one?

> [!example]- Show answer
> The local Markov property states $X_i \perp X_{\text{rest}} \mid X_{\text{ne}(i)}$: a node is independent of all other variables once you condition on its **neighbors** $\text{ne}(i)$. The **Markov blanket** is the minimal set that renders a node independent of everything else, and in an undirected graph it is exactly the neighbor set. This is simpler than the directed case, where the Markov blanket is the node's parents, its children, *and* its children's other parents (co-parents). The symmetry of undirected edges removes the co-parent complication.

**4.** State the three Markov properties (pairwise, local, global) and explain the relationship among them.

> [!example]- Show answer
> **Pairwise**: non-adjacent nodes are independent given the rest. **Local**: a node is independent of the rest given its neighbors. **Global**: every graph separation implies a conditional independence ($C$ separates $A,B \Rightarrow A \perp B \mid C$). In general global $\Rightarrow$ local $\Rightarrow$ pairwise always holds (global is the strongest). The reverse implications can fail for special degenerate distributions, but when the joint density is **strictly positive** ($f(x) > 0$ for all $x$) the three properties are **equivalent**, so one can speak of "the independencies of the graph" without ambiguity.

**5.** Define a clique and a maximal clique. What role do cliques play in undirected models?

> [!example]- Show answer
> A **clique** is a set of vertices that are all pairwise adjacent — a complete subgraph in which every node is connected to every other. A **maximal clique** is a clique to which no further vertex can be added while keeping it complete. Cliques are the building blocks of the factorization: the joint density is written as a product of potential functions, one per (maximal) clique. They play the role that "a node together with its parents" plays in the directed factorization of Chapter 17.

**6.** Write down the clique factorization of an undirected graphical model and explain each piece, including $Z$.

> [!example]- Show answer
> For a positive density Markov w.r.t. $G$,
> $$ f(x) = \frac{1}{Z}\prod_{C \in \mathcal{C}} \psi_C(x_C), $$
> where $\mathcal{C}$ is the set of (maximal) cliques, $\psi_C \ge 0$ is the **potential** for clique $C$, $x_C$ is the subvector of $x$ on the variables in $C$, and $Z = \sum_x \prod_C \psi_C(x_C)$ (an integral in the continuous case) is the **normalizing constant** or partition function that makes $f$ a proper density. The potentials are arbitrary nonnegative functions — they are **not** marginals or conditionals — and $Z$ globally couples them all.

**7.** What does the Hammersley–Clifford theorem assert, and why is the strict positivity of the density important?

> [!example]- Show answer
> The Hammersley–Clifford theorem establishes the equivalence between the Markov property and the clique factorization: a **strictly positive** density is Markov with respect to $G$ **if and only if** it factorizes as a product of nonnegative potentials over the cliques of $G$. So the graphical independence structure and the algebraic product structure are two views of the same thing. Strict positivity ($f(x) > 0$ everywhere) is essential because without it one can construct distributions that satisfy the pairwise/local Markov properties yet do **not** admit the clique factorization; the positivity rules out those pathological cases and makes all the Markov properties coincide.

**8.** Explain why an undirected graph cannot represent a collider (v-structure), using $X \to Z \leftarrow Y$ as the example.

> [!example]- Show answer
> The DAG $X \to Z \leftarrow Y$ encodes $X \perp Y$ marginally but $X \not\perp Y \mid Z$ — conditioning on the collider $Z$ *creates* dependence between $X$ and $Y$. In an undirected graph, separation can only ever *remove* dependence: if $X$ and $Y$ are not directly connected they would have to be independent given $Z$, and if they are connected the graph cannot say they are marginally independent. No undirected graph encodes "independent unconditionally but dependent given $Z$." This is the canonical pattern that directed graphs capture and undirected ones cannot, illustrating that neither language is strictly more expressive.

**9.** For a jointly Gaussian (multivariate normal) vector, how do you read the undirected graph off the parameters?

> [!example]- Show answer
> For a multivariate normal, the undirected graph is the **Gaussian graphical model** read from the **precision matrix** $\Omega = \Sigma^{-1}$ (the inverse covariance). There is an edge between $i$ and $j$ **iff** $\Omega_{ij} \ne 0$; equivalently $\Omega_{ij} = 0 \iff X_i \perp X_j \mid X_{\text{rest}}$. Note this is the *inverse* covariance, not the covariance: a zero in $\Sigma$ means *marginal* independence, whereas a zero in $\Omega$ means *conditional* independence given all other variables — which is precisely the missing-edge condition. So fitting the graph amounts to finding the zero pattern of the precision matrix.

**10.** *(Applied)* You have $n$ i.i.d. observations of discrete variables $(X_1,\dots,X_k)$ and want to estimate the undirected graph. Describe a workable approach and how it connects to log-linear models.

> [!example]- Show answer
> Treat the data as a $k$-way contingency table and fit a **log-linear model** (Chapter 19). Taking the log of the clique factorization turns the product of potentials into a *sum* of interaction terms, so each clique corresponds to a set of allowed interaction terms and the graph's edge set is exactly the second-order interaction structure: an edge $\{i,j\}$ is present iff the $X_iX_j$ interaction term is nonzero. Practically, you do **model selection** over which interaction terms (edges) to include — e.g. by likelihood-ratio / deviance tests comparing nested models, or by minimizing an information criterion (AIC/BIC) — fitting the multinomial counts by maximum likelihood (often via iterative proportional fitting). The selected interactions give the estimated graph; with many variables you would screen edges via conditional-independence tests to keep the search tractable.

## Deeper understanding (expansion)

> [!info]+ 💡 Why the partition function $Z$ makes undirected models harder than directed ones
>
> In a directed model the joint factorizes as $f(x) = \prod_i f(x_i \mid x_{\text{parents}(i)})$, and each factor is *already a normalized conditional density*, so the product automatically integrates to one — there is no global constant to compute, and you can read parameters and sample ancestrally one node at a time. In an undirected model the factors are unnormalized potentials, so you must divide by $Z = \sum_x \prod_C \psi_C(x_C)$, a sum over the *entire* joint configuration space. $Z$ couples every parameter to every other, which makes the log-likelihood non-trivial: maximum likelihood has no closed form in general and requires iterative methods (iterative proportional fitting for discrete tables, gradient methods more generally), each step of which needs the (intractable in large models) normalizing constant or its derivatives. This single difference — locally normalized conditionals vs. a globally normalized product of potentials — explains much of the practical gap in difficulty between Bayesian networks and Markov random fields.

> [!info]+ 💡 Separation is "monotone," and that's exactly what colliders break
>
> A clean way to see why the two graphical languages differ: in an undirected graph, adding variables to the conditioning set $C$ can only *help* separate $A$ from $B$ — once a separating set exists, enlarging it keeps the separation. Independence is, in this sense, *monotone* in the conditioning set on the "off" side. A directed collider violates exactly this intuition: $X \perp Y$ with the empty conditioning set, but conditioning on the collider $Z$ (adding to $C$) *destroys* the independence. So the undirected formalism is the right language precisely when "more conditioning never creates dependence" — physical systems, spatial lattices, image pixels, where neighbors interact symmetrically — and the directed formalism is right when you have explicit causal/generative "explaining-away" structure. Knowing which monotonicity your problem has tells you which graph to reach for.

> [!info]+ 💡 The same distribution, two graphs: decomposable models
>
> The directed and undirected worlds overlap on **decomposable** (also called **chordal** or **triangulated**) graphs — graphs with no chordless cycle of length $\ge 4$. For these, a DAG and an undirected graph can encode *exactly the same* set of independencies, and the clique factorization simplifies beautifully: the joint can be written as a ratio of clique marginals over separator marginals, so maximum likelihood has a **closed form** (no iterative fitting, no intractable $Z$). This is why so much classical contingency-table theory lives in the decomposable case. When a graph is *not* chordal — like the 4-cycle that no DAG can match — you lose the closed form and must triangulate (add fill-in edges) to do exact inference, trading a slightly denser graph for computational tractability. The chordal class is the sweet spot where the two languages, and tractable computation, all coincide.

## Connections

- ← [[17-directed-graphs-and-conditional-independence]] — the directed counterpart. Directed graphs use d-separation (with the collider exception) and factorize over **parents**; undirected graphs use plain separation and factorize over **cliques**. Read the two chapters as a matched pair: each captures independence patterns the other cannot, and they coincide on decomposable (chordal) graphs.
- → [[19-log-linear-models]] — the concrete fitting machinery for *discrete* undirected models. Log-linear models are the clique factorization written additively (log of a product of potentials), so edge selection in the graph **is** interaction-term selection in the log-linear model; this is how you estimate a Markov network for categorical data.
- → [[14-multivariate-models]] — supplies the multivariate normal whose **precision matrix** $\Sigma^{-1}$ gives the Gaussian graphical model: zeros in the inverse covariance are exactly the missing edges (conditional independencies) of the undirected graph.
- ← [[06-models-inference-and-learning]] — the parametric-model and maximum-likelihood foundations that the partition function complicates here; fitting a Markov random field is MLE where the normalizing constant $Z$ obstructs a closed-form solution.
- → [[10-hypothesis-testing-and-p-values]] and conditional-independence testing more broadly underpin the "test each edge" strategy for structure learning; deciding whether $X_i \perp X_j \mid \text{rest}$ is a hypothesis test run once per candidate edge.
