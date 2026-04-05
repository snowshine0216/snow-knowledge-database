---
tags: [calculus, math, 3blue1brown, derivatives, integrals, taylor-series, euler]
source: https://www.3blue1brown.com/topics/calculus
---

# Essence of Calculus

A consolidated reference for 3Blue1Brown's 12-chapter *Essence of Calculus* series, which builds the subject from geometric intuition rather than formal definitions.

## The Central Move

Calculus rests on a single strategy: take a hard problem, decompose it into infinitely many tiny pieces that are each trivially simple, then reassemble those pieces into an exact answer. Every technique in the subject -- [[integrals]], [[derivatives]], the Fundamental Theorem -- is a variation on this decomposition-and-reassembly pattern.

The series opens with a circle-area derivation that simultaneously invents integration (summing thin rings) and differentiation (tracking how area grows with radius), revealing from the start that the two operations are inverses.

## Derivatives: Measuring Local Change

A derivative answers "how much does the output nudge when the input nudges?" The formal definition resolves an apparent paradox: instantaneous velocity sounds contradictory because velocity requires a time interval, yet the limit of average velocity over a shrinking interval converges to a well-defined number.

$$\frac{df}{dx} = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$

Derivative formulas (power rule, trig derivatives) emerge from geometric reasoning rather than algebraic tricks. The **product rule** tracks how a rectangle's area changes when both sides nudge, and the **chain rule** tracks how nudges cascade through composed functions -- each link in the chain multiplies sensitivities.

**Implicit differentiation** extends the same nudge-tracking to curves defined by constraints like $x^2 + y^2 = 1$, where $y$ cannot be cleanly isolated as a function of $x$.

## The Special Role of e

Every exponential $a^x$ has the property that its derivative is proportional to itself. The base $e \approx 2.71828$ is the unique base where the proportionality constant equals 1, making $\frac{d}{dx}e^x = e^x$. This self-referential growth is why $e$ appears naturally in compound interest, population dynamics, and radioactive decay.

## Limits and Rigor

The epsilon-delta definition converts the informal idea of "approaching a value" into a precise challenge-and-response game: for any desired output precision $\varepsilon$, there must exist an input precision $\delta$ that guarantees it. This machinery underpins every limit in the series and enables **L'Hopital's rule** for resolving indeterminate forms like $0/0$.

## Integration and the Fundamental Theorem

Integration is accumulation. The definite integral $\int_a^b f(x)\,dx$ is defined as the limit of [[Riemann sums]] -- rectangles whose widths shrink to zero. The Fundamental Theorem of Calculus (FTC) is the bridge:

- **FTC Part 1:** The area function $A(x) = \int_a^x f(t)\,dt$ satisfies $A'(x) = f(x)$ -- the rate of area accumulation equals the curve's height.
- **FTC Part 2:** If $F'(x) = f(x)$, then $\int_a^b f(x)\,dx = F(b) - F(a)$ -- no infinite sums needed.

The deeper geometric insight (Chapter 9) is that slope and area are exact inverses: knowing one recovers the other.

## Higher-Order Derivatives

Applying the derivative repeatedly reveals finer structure. The second derivative measures concavity (is the curve bending up or down?). In physics, position differentiates to velocity, then acceleration, then jerk -- the smoothness of force onset that determines ride comfort. These higher derivatives feed directly into [[Taylor series]].

## Taylor Series: Local Polynomial Portraits

A smooth function's entire local behavior is encoded in its derivatives at a single point. The Taylor series reconstructs the function as an infinite polynomial:

$$f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n$$

Key Maclaurin series ($a = 0$) worth internalizing: $e^x$, $\sin x$, $\cos x$, and $\frac{1}{1-x}$. The radius of convergence determines how far from the center the series remains valid, and the Lagrange remainder bounds truncation error.

## Euler's Formula: The Grand Unification

The series culminates with $e^{i\theta} = \cos\theta + i\sin\theta$, which unifies exponential growth and rotation in the complex plane. The structural explanation is that the exponential map is a group homomorphism from $(\mathbb{R}, +)$ to the unit circle under multiplication. The special case $e^{i\pi} = -1$ links five fundamental constants. Practically, Euler's formula converts trigonometric identities into algebra and underpins [[Fourier analysis]].

## Series Arc

| Chapters | Theme |
|----------|-------|
| 1-3 | Decomposition, derivatives from geometry, derivative formulas |
| 4-6 | Composition rules (product, chain), $e$, implicit differentiation |
| 7 | Limits and epsilon-delta rigor |
| 8-9 | Integration and the Fundamental Theorem |
| 10-11 | Higher-order derivatives and Taylor series |
| 12 | Euler's formula via group theory |
