---
tags: [probability, sample-space, kolmogorov-axioms, conditional-probability, bayes-theorem, independence, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 1 — Probability

> [!abstract]+ Chapter at a glance
> This chapter lays the measure-theoretic-flavored but accessible foundation that the entire book stands on. It defines the sample space, events as subsets of that space, and the three Kolmogorov axioms that any probability measure must satisfy. From those axioms it derives every basic property you reuse for the rest of the book (complement rule, monotonicity, inclusion-exclusion, continuity), then introduces the two great workhorses — independence and conditional probability — culminating in Bayes' theorem. Wasserman's recurring theme starts here: the *mathematics* of probability is identical whether you read $P(A)$ as a long-run frequency or as a degree of belief; the interpretive split (frequentist vs Bayesian) only matters later, in inference. Everything downstream — random variables, expectation, convergence, estimation — is built on the objects defined here.

## Core concepts

**Sample space and events.**
- The **sample space** $\Omega$ is the set of all possible outcomes of an experiment; a single outcome $\omega \in \Omega$ is a **sample point** or realization.
- An **event** $A$ is a subset of $\Omega$, i.e. $A \subseteq \Omega$. We say "$A$ occurs" when the observed outcome $\omega$ lies in $A$.
- $\Omega$ itself is the sure event; the empty set $\varnothing$ is the impossible event.
- Example: tossing a coin twice gives $\Omega = \{HH, HT, TH, TT\}$; the event "at least one head" is $A = \{HH, HT, TH\}$.

**Set operations on events.**
- **Union** $A \cup B$ = "$A$ or $B$ (or both)"; **intersection** $A \cap B$ (written $AB$) = "$A$ and $B$"; **complement** $A^c = \Omega \setminus A$ = "not $A$".
- **Difference** $A \setminus B = A \cap B^c$. Events $A$ and $B$ are **disjoint** (mutually exclusive) if $A \cap B = \varnothing$.
- A sequence $A_1, A_2, \dots$ is a **partition** of $\Omega$ if the events are pairwise disjoint and $\bigcup_i A_i = \Omega$.
- **DeMorgan's laws**: $\left(\bigcup_i A_i\right)^c = \bigcap_i A_i^c$ and $\left(\bigcap_i A_i\right)^c = \bigcup_i A_i^c$ — "the complement of a union is the intersection of complements," and vice versa.
- **Indicator function** $I_A(\omega) = 1$ if $\omega \in A$ and $0$ otherwise, a convenient bridge to expectation later.

**The Kolmogorov axioms.**
- A **probability measure** $P$ assigns to each event a real number $P(A)$ satisfying three axioms:
  1. **Nonnegativity**: $P(A) \ge 0$ for every event $A$.
  2. **Normalization**: $P(\Omega) = 1$.
  3. **Countable additivity**: if $A_1, A_2, \dots$ are pairwise disjoint, then $P\left(\bigcup_{i=1}^{\infty} A_i\right) = \sum_{i=1}^{\infty} P(A_i)$.
- Strictly, events live in a $\sigma$-field (a collection closed under complement and countable union); Wasserman keeps this light but notes its existence.

**Properties derived from the axioms.**
- $P(\varnothing) = 0$.
- **Complement rule**: $P(A^c) = 1 - P(A)$.
- **Monotonicity**: if $A \subseteq B$ then $P(A) \le P(B)$.
- $0 \le P(A) \le 1$ for every event.
- **Inclusion-exclusion** (two events): $$P(A \cup B) = P(A) + P(B) - P(A \cap B).$$
- For disjoint $A, B$ the cross term vanishes, giving $P(A \cup B) = P(A) + P(B)$.
- **Boole's inequality / union bound**: $P\left(\bigcup_i A_i\right) \le \sum_i P(A_i)$ — useful even when events overlap.

**Continuity of probability.**
- If $A_n$ is **increasing** ($A_1 \subseteq A_2 \subseteq \cdots$) with limit $A = \bigcup_n A_n$, then $P(A_n) \to P(A)$.
- If $A_n$ is **decreasing** ($A_1 \supseteq A_2 \supseteq \cdots$) with limit $A = \bigcap_n A_n$, then $P(A_n) \to P(A)$.
- This is a consequence of countable additivity and lets us pass probabilities through limits of monotone event sequences.

**Two interpretations of probability.**
- **Frequentist**: $P(A)$ is the limiting relative frequency of $A$ in an infinite sequence of identical, independent repetitions of the experiment.
- **Bayesian / degree-of-belief**: $P(A)$ measures how strongly an observer believes $A$ will occur, given current information.
- Crucial point: the *axioms and all the math are identical* under both readings. The interpretive choice has no effect in this chapter; it surfaces only when we do inference (estimation, testing, priors).

**Independent events.**
- $A$ and $B$ are **independent** ($A \perp\!\!\!\perp B$) if $$P(A \cap B) = P(A)\,P(B).$$
- Independence is a statement *about probabilities*, not about set structure — it is **not** the same as disjointness. In fact two events with positive probability that are disjoint are *necessarily dependent*, since $P(A\cap B) = 0 \neq P(A)P(B)$.
- A collection $\{A_i\}$ is **mutually (jointly) independent** if for every finite subset $\{i_1,\dots,i_k\}$, $P(A_{i_1}\cap\cdots\cap A_{i_k}) = \prod_{j} P(A_{i_j})$.
- **Pairwise independence** (every pair independent) is strictly weaker than mutual independence: pairwise independence can hold while a triple-product equality fails.

**Conditional probability.**
- For $P(B) > 0$, the probability of $A$ **given** $B$ is $$P(A \mid B) = \frac{P(A \cap B)}{P(B)}.$$
- It re-normalizes probability to the sub-universe $B$; $P(\cdot \mid B)$ is itself a valid probability measure satisfying all three axioms.
- $A \perp\!\!\!\perp B$ (with $P(B)>0$) is equivalent to $P(A \mid B) = P(A)$: knowing $B$ tells you nothing about $A$.

**Multiplication rule.**
- Rearranging the definition: $P(A \cap B) = P(A \mid B)\,P(B) = P(B \mid A)\,P(A)$.
- Chained for several events: $P(A_1 \cap \cdots \cap A_n) = P(A_1)\,P(A_2\mid A_1)\,P(A_3 \mid A_1 A_2)\cdots$.

**Law of total probability.**
- Let $A_1,\dots,A_k$ partition $\Omega$ with each $P(A_i) > 0$. For any event $B$, $$P(B) = \sum_{i=1}^{k} P(B \mid A_i)\,P(A_i).$$
- It assembles the unconditional probability of $B$ from its behavior across the cases $A_i$.

**Bayes' theorem.**
- For a partition $A_1,\dots,A_k$ and event $B$ with $P(B) > 0$, $$P(A_i \mid B) = \frac{P(B \mid A_i)\,P(A_i)}{\sum_{j} P(B \mid A_j)\,P(A_j)}.$$
- Vocabulary: $P(A_i)$ is the **prior**, $P(B \mid A_i)$ is the **likelihood**, the denominator $P(B)$ is the normalizing constant, and $P(A_i \mid B)$ is the **posterior**.
- Posterior $\propto$ likelihood $\times$ prior. In odds form, the posterior odds equal the prior odds times the likelihood ratio.

**Classic applications and the key confusion.**
- **Medical-test false positives**: even a highly accurate test can yield a low posterior probability of disease when the disease is rare, because a small prior dominates the arithmetic.
- **Monty Hall–style reasoning**: conditioning on the host's informative action changes the probabilities; intuition that ignores the conditioning fails.
- **The central trap**: $P(A \mid B) \neq P(B \mid A)$ in general (the "prosecutor's fallacy"). They are related but rescaled by the base rates $P(A)$ and $P(B)$ via Bayes' theorem.

## Quiz

**1.** What are the three Kolmogorov axioms, and which one specifically requires the events to be disjoint?

> [!example]- Show answer
> The axioms are: (i) nonnegativity, $P(A) \ge 0$ for all events $A$; (ii) normalization, $P(\Omega) = 1$; and (iii) countable additivity, $P(\bigcup_i A_i) = \sum_i P(A_i)$ for a sequence of events. Only the third axiom — countable additivity — requires the events to be **pairwise disjoint**. Without disjointness, additivity fails and you must instead use inclusion-exclusion, which subtracts off the overlap. These three axioms alone generate every other basic property of probability.

**2.** Derive the complement rule $P(A^c) = 1 - P(A)$ from the axioms.

> [!example]- Show answer
> The events $A$ and $A^c$ are disjoint, and their union is $\Omega$. By countable (here finite) additivity, $P(A) + P(A^c) = P(A \cup A^c) = P(\Omega)$. By the normalization axiom, $P(\Omega) = 1$, so $P(A) + P(A^c) = 1$, giving $P(A^c) = 1 - P(A)$. The same partition-and-add argument also yields $P(\varnothing) = 0$ by taking $A = \Omega$.

**3.** Why does inclusion-exclusion subtract $P(A \cap B)$, and what happens when $A$ and $B$ are disjoint?

> [!example]- Show answer
> When you add $P(A) + P(B)$ you count every outcome in the overlap $A \cap B$ twice — once as part of $A$ and once as part of $B$. Subtracting $P(A \cap B)$ corrects this double-count, giving $P(A \cup B) = P(A) + P(B) - P(A \cap B)$. If $A$ and $B$ are disjoint, $A \cap B = \varnothing$, so $P(A\cap B) = 0$ and the formula collapses to plain additivity $P(A\cup B) = P(A) + P(B)$. The overlap term is exactly what additivity assumes is empty.

**4.** State DeMorgan's laws for events and explain in words what each says.

> [!example]- Show answer
> The laws are $\left(\bigcup_i A_i\right)^c = \bigcap_i A_i^c$ and $\left(\bigcap_i A_i\right)^c = \bigcup_i A_i^c$. The first says the complement of "at least one event occurs" is "none of the events occurs," i.e. all complements happen simultaneously. The second says the complement of "all events occur" is "at least one fails to occur." They let you convert union statements into intersection statements (and back), which is invaluable when one form is easier to compute — e.g. computing $P(\text{at least one}) = 1 - P(\text{none})$.

**5.** Explain the difference between *disjoint* and *independent* events. Can two events with positive probability be both?

> [!example]- Show answer
> Disjoint means $A \cap B = \varnothing$ (they cannot occur together) — a statement about *sets*. Independent means $P(A \cap B) = P(A)P(B)$ (one tells you nothing about the other) — a statement about *probabilities*. They are not only different but typically incompatible: if $A$ and $B$ are disjoint, then $P(A \cap B) = 0$, but for independence with positive probabilities we would need $P(A)P(B) > 0$. So two events with $P(A) > 0$ and $P(B) > 0$ that are disjoint are necessarily **dependent** — knowing $A$ occurred guarantees $B$ did not.

**6.** What is the difference between pairwise independence and mutual independence?

> [!example]- Show answer
> Pairwise independence requires only that every *pair* of events factorizes: $P(A_i \cap A_j) = P(A_i)P(A_j)$ for all $i \neq j$. Mutual (joint) independence is stronger: *every* finite subcollection must factorize, including triples, quadruples, etc., e.g. $P(A_1 \cap A_2 \cap A_3) = P(A_1)P(A_2)P(A_3)$. Pairwise independence does not imply mutual independence — there are classic constructions (such as outcomes derived from two fair coin tosses) where all pairs are independent yet the joint triple-product equality fails.

**7.** Define conditional probability and explain why $P(\cdot \mid B)$ is itself a legitimate probability measure.

> [!example]- Show answer
> For $P(B) > 0$, $P(A \mid B) = P(A \cap B) / P(B)$; it restricts attention to the world in which $B$ has occurred and re-normalizes so that this world has total probability 1. It satisfies all three axioms: it is nonnegative (ratio of nonnegatives), it gives $P(B \mid B) = P(B \cap B)/P(B) = 1$ so the conditioning event plays the role of $\Omega$, and it is countably additive over disjoint events because the numerator inherits additivity. Hence every theorem about probability measures applies to conditional probability too.

**8.** State Bayes' theorem and identify the prior, likelihood, and posterior. Why is the denominator just the law of total probability?

> [!example]- Show answer
> For a partition $A_1,\dots,A_k$ and event $B$ with $P(B)>0$, $P(A_i \mid B) = \dfrac{P(B \mid A_i)P(A_i)}{\sum_j P(B \mid A_j)P(A_j)}$. Here $P(A_i)$ is the **prior** (belief before seeing $B$), $P(B \mid A_i)$ is the **likelihood** (how well hypothesis $A_i$ predicts the data $B$), and $P(A_i \mid B)$ is the **posterior** (updated belief). The denominator is exactly $P(B)$ expanded via the law of total probability over the partition; it is the normalizing constant that makes the posterior probabilities sum to 1.

**9.** A student says "the test is 99% accurate, so if I test positive I'm 99% likely to have the disease." Why is this reasoning flawed, and what is the confusion called?

> [!example]- Show answer
> The student conflates the **sensitivity** $P(\text{positive} \mid \text{disease}) = 0.99$ with the **posterior** $P(\text{disease} \mid \text{positive})$ — that is, confusing $P(B \mid A)$ with $P(A \mid B)$. When the disease is rare (small prior), the many false positives drawn from the large healthy population can swamp the true positives, so the posterior can be far below 99%. This is the base-rate fallacy (a form of the prosecutor's fallacy). Bayes' theorem is the correct tool: it rescales the likelihood by the prior and the overall positive rate.

**10.** *(Applied)* A disease affects 1% of a population. A test has sensitivity $P(+\mid D) = 0.99$ and false-positive rate $P(+\mid D^c) = 0.05$. If someone tests positive, what is the probability they have the disease? (Treat figures as illustrative.)

> [!example]- Show answer
> Use Bayes' theorem with prior $P(D) = 0.01$, $P(D^c) = 0.99$. The marginal positive rate is $P(+) = P(+\mid D)P(D) + P(+\mid D^c)P(D^c) = (0.99)(0.01) + (0.05)(0.99) = 0.0099 + 0.0495 = 0.0594$. Then $P(D \mid +) = \dfrac{(0.99)(0.01)}{0.0594} \approx \dfrac{0.0099}{0.0594} \approx 0.167$. So despite the "99% accurate" test, the positive person has only about a **17%** chance of being diseased — the rare base rate dominates. This is the canonical demonstration that $P(D\mid +) \ll P(+\mid D)$.

## Deeper understanding (expansion)

> [!info]+ 💡 Disjoint feels like independence but is its opposite
> Intuitively "$A$ and $B$ have nothing to do with each other" sounds like independence, and disjoint events seem to embody that — yet disjointness is the *strongest possible dependence* among positive-probability events. If $A$ and $B$ can never co-occur, then learning $A$ happened tells you with certainty that $B$ did *not*: $P(B \mid A) = 0$, the furthest thing from $P(B \mid A) = P(B)$. Independence is about the *product structure of probabilities*, disjointness about the *geometry of sets*. The only way an event can be both disjoint-from and independent-of another is if one of them has probability zero. Keeping these in separate mental compartments prevents a large fraction of beginner errors.

> [!info]+ 💡 Bayes is just "renormalize on the evidence," repeated
> Bayes' theorem looks like a formula to memorize, but it is really one move: condition on what you observed and renormalize. The likelihood $P(B \mid A_i)$ says how surprising the evidence $B$ would be under each hypothesis; the prior $P(A_i)$ says how plausible the hypothesis was beforehand; multiply them and divide by the total to get back a probability distribution over hypotheses. The "posterior odds = prior odds × likelihood ratio" form makes the update transparent: evidence shifts your odds by exactly how much better one hypothesis predicts the data than another. Every inferential method in later chapters — and all of Bayesian inference — is this same renormalization done with densities instead of discrete events.

> [!info]+ 💡 The interpretation doesn't touch the algebra
> A subtle but liberating point Wasserman stresses: whether you call $P(A)$ a long-run frequency or a personal degree of belief, the axioms, the derived theorems, and every calculation in this chapter are word-for-word identical. The two camps only diverge once we start *inferring* unknown quantities from data — frequentists treat parameters as fixed unknowns and randomness as sampling variation, while Bayesians put probability distributions on the parameters themselves. So you can master all of Chapter 1 without ever picking a side; the philosophy is a bill that comes due later, not here.

## Connections

- This chapter is the bedrock; it has no prerequisite chapter but feeds nearly everything that follows.
- → [[02-random-variables]]: events and probability measures are promoted to random variables and their distribution functions; the indicator $I_A$ is the simplest random variable.
- → [[03-expectation]]: expectation is built on the probability measure defined here; conditional probability generalizes to conditional expectation.
- → [[04-inequalities]]: Boole's union bound introduced here is the gateway to Markov, Chebyshev, and Hoeffding bounds.
- → [[05-convergence-of-random-variables]]: continuity of probability foreshadows limiting arguments and the laws of large numbers.
- → [[06-models-inference-and-learning]]: the frequentist-vs-belief distinction noted here becomes the central methodological fork.
- → [[11-bayesian-inference]]: Bayes' theorem with prior, likelihood, and posterior is the seed of the entire Bayesian-inference machinery.
