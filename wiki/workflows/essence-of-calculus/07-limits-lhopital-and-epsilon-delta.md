---
tags: [calculus, math, 3blue1brown, limits, lhopital, epsilon-delta]
source: https://www.3blue1brown.com/lessons/limits
---

# Chapter 7: Limits, L'Hôpital, and Epsilon-Delta

**Source:** [Essence of Calculus – Limits](https://www.3blue1brown.com/lessons/limits) · [L'Hôpital's Rule](https://www.3blue1brown.com/lessons/l-hopitals-rule) · [Epsilon-Delta](https://www.3blue1brown.com/lessons/epsilon-delta)

## Outline
- [Core Idea](#core-idea)
- [Key Concepts](#key-concepts)
- [The Epsilon-Delta Definition](#the-epsilon-delta-definition)
- [L'Hôpital's Rule](#lhôpitals-rule)
- [One-Sided Limits and Continuity](#one-sided-limits-and-continuity)
- [Key Equations](#key-equations)
- [Connections](#connections)

## Core Idea

Throughout the earlier chapters, derivatives were computed as limits of difference quotients — but the word "limit" itself was used informally. This chapter makes it precise. The core question is: what does it mean for a function to "approach" a value $L$ as $x$ approaches $a$, especially when the function may not even be defined at $x = a$?

The epsilon-delta definition answers this by converting a vague geometric intuition into a rigorous challenge-and-response game: for any output precision $\varepsilon$ you demand, there must exist an input precision $\delta$ that guarantees it. L'Hôpital's rule then applies this machinery to resolve indeterminate forms like $0/0$, where both numerator and denominator vanish and direct substitution gives no information.

## Key Concepts

- **Limit:** $\lim_{x \to a} f(x) = L$ means $f(x)$ can be made arbitrarily close to $L$ by taking $x$ sufficiently close (but not equal) to $a$.
- **Indeterminate form:** an expression like $0/0$ or $\infty/\infty$ where the value cannot be determined from the limiting behavior of numerator and denominator alone.
- **One-sided limit:** $\lim_{x \to a^+} f(x)$ (from the right) or $\lim_{x \to a^-} f(x)$ (from the left); the two-sided limit exists only if both one-sided limits exist and are equal.
- **Continuity:** $f$ is continuous at $a$ if $\lim_{x \to a} f(x) = f(a)$ — the limit exists, equals the function value, and the function is defined there.
- **L'Hôpital's rule:** when $f(a) = g(a) = 0$ (or both $\pm\infty$), the ratio $f/g$ near $a$ is governed by the ratio of their derivatives.

## The Epsilon-Delta Definition

The formal definition removes all ambiguity from "getting close":

$$\lim_{x \to a} f(x) = L \iff \forall\,\varepsilon > 0,\ \exists\,\delta > 0 : 0 < |x - a| < \delta \Rightarrow |f(x) - L| < \varepsilon$$

Think of it as a two-player game:
1. An adversary names any output tolerance $\varepsilon > 0$ (how close to $L$ the output must stay).
2. You must respond with an input tolerance $\delta > 0$ (how close to $a$ you will keep $x$).
3. You win if every $x$ within $\delta$ of $a$ (excluding $a$ itself) maps to an output within $\varepsilon$ of $L$.

If you can always win — for every possible $\varepsilon$ — then the limit is $L$.

Two subtleties are worth noting. First, $x = a$ is explicitly excluded ($0 < |x - a|$): the limit concerns the behavior *near* $a$, not *at* $a$, so $f$ need not even be defined at $a$. Second, $\delta$ is allowed to depend on $\varepsilon$ — smaller output tolerance may require tighter input control.

A classic example: $\lim_{x \to 0}\frac{\sin x}{x} = 1$. Direct substitution gives $0/0$, but the epsilon-delta (or geometric squeeze) argument confirms the limit is $1$.

$$\lim_{x \to 0}\frac{\sin x}{x} = 1$$

## L'Hôpital's Rule

When both $f(a) = 0$ and $g(a) = 0$, the ratio $f(x)/g(x)$ near $a$ is a $0/0$ indeterminate form. The key insight: since both functions are zero at $a$, near $a$ each function behaves approximately like its own linearization:

$$f(x) \approx f'(a)(x - a), \qquad g(x) \approx g'(a)(x - a)$$

Dividing, the $(x - a)$ factors cancel:

$$\frac{f(x)}{g(x)} \approx \frac{f'(a)(x-a)}{g'(a)(x-a)} = \frac{f'(a)}{g'(a)}$$

This is the geometric soul of L'Hôpital's rule: instead of comparing the sizes of $f$ and $g$ at $a$ (both are zero, so that gives nothing), compare how quickly each *runs away from zero* — that is, their derivatives. The faster one "wins" the ratio.

Formally:

$$\lim_{x \to a}\frac{f(x)}{g(x)} = \lim_{x \to a}\frac{f'(x)}{g'(x)} \quad \text{provided } f(a)=g(a)=0 \text{ (or both } \pm\infty\text{) and the right side exists}$$

The rule can be applied repeatedly if the ratio remains $0/0$ after one step. It also works for $x \to \infty$.

**Example:** $\lim_{x \to 0}\frac{\sin x}{x}$. Apply L'Hôpital: $\frac{\cos x}{1}\big|_{x=0} = 1$. Confirms the squeeze-theorem result.

## One-Sided Limits and Continuity

One-sided limits approach $a$ from only one direction:

$$\lim_{x \to a^+} f(x) = L_+ \qquad \text{(right-hand limit)}$$
$$\lim_{x \to a^-} f(x) = L_- \qquad \text{(left-hand limit)}$$

The two-sided limit $\lim_{x \to a} f(x)$ exists if and only if $L_+ = L_-$.

Continuity at $a$ requires three things simultaneously: $f(a)$ is defined, $\lim_{x \to a} f(x)$ exists, and they are equal:

$$f \text{ continuous at } a \iff \lim_{x \to a} f(x) = f(a)$$

The squeeze theorem is another tool for evaluating limits without direct substitution: if $g(x) \leq f(x) \leq h(x)$ near $a$ and $\lim_{x \to a} g(x) = \lim_{x \to a} h(x) = L$, then:

$$\lim_{x \to a} f(x) = L$$

## Key Equations

| Equation | Description |
|---|---|
| $$\lim_{x\to a}f(x)=L$$ | Notation for the limit of $f(x)$ as $x$ approaches $a$ |
| $$\forall\,\varepsilon>0,\ \exists\,\delta>0:\ 0<|x-a|<\delta \Rightarrow |f(x)-L|<\varepsilon$$ | Epsilon-delta definition: the rigorous meaning of a limit |
| $$\lim_{x\to a}\dfrac{f(x)}{g(x)}=\lim_{x\to a}\dfrac{f'(x)}{g'(x)}$$ | L'Hôpital's rule for $0/0$ or $\infty/\infty$ forms |
| $$\lim_{x \to 0}\dfrac{\sin x}{x} = 1$$ | Canonical example resolved by L'Hôpital or the squeeze theorem |
| $$\lim_{x\to a^{\pm}} f(x)$$ | One-sided limits (from right $+$ or left $-$) |
| $$f \text{ continuous at } a \iff \lim_{x\to a}f(x)=f(a)$$ | Definition of continuity at a point |
| $$g \leq f \leq h,\ \lim g = \lim h = L \Rightarrow \lim f = L$$ | Squeeze theorem for trapping a limit |

## Connections

- **Previous:** Ch 6 (Implicit Differentiation) used derivatives freely; this chapter provides the limit foundations that make those derivative rules logically justified.
- **Next:** Ch 8 (Integration and the Fundamental Theorem) uses limits again — the definite integral is defined as a limit of Riemann sums — and the FTC connects that back to derivatives.
