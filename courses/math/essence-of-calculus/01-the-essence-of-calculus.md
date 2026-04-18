---
tags: [calculus, math, 3blue1brown, integration, differentiation, area]
source: https://www.3blue1brown.com/lessons/essence-of-calculus
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What is the formula for the area of a circle with radius $r$, and how do you think it might be derived from first principles rather than memorized?
2. What do you think a definite integral represents geometrically, and how is it related to the idea of summing many small pieces?
3. How do you think differentiation and integration are related to each other — are they independent operations, or is there a deeper connection?

---

# Chapter 1: The Essence of Calculus

**Source:** [The Essence of Calculus](https://www.3blue1brown.com/lessons/essence-of-calculus)

## Outline
- [Core Idea](#core-idea)
- [The Decomposition Principle](#the-decomposition-principle)
- [The Circle-Area Derivation](#the-circle-area-derivation)
- [From Geometry to Calculus](#from-geometry-to-calculus)
- [Key Equations](#key-equations)
- [Connections](#connections)

## Core Idea

Calculus is built on one repeated move: take a hard problem, break it into infinitely many tiny pieces that are each easy to understand, then reassemble those pieces into an exact answer. Every major technique in calculus — integrals, derivatives, the Fundamental Theorem — is a consequence of mastering this single idea.

The circle-area problem is the perfect on-ramp. We already know the formula $A = \pi r^2$, but the goal here is to *derive* it from scratch using the decomposition strategy. Doing so simultaneously invents both integration (adding tiny contributions) and differentiation (tracking how a quantity changes), and reveals that the two operations are inverse to each other.

## The Decomposition Principle

Any quantity that is "hard to measure all at once" becomes tractable when sliced into pieces that are individually simple.

- **Break:** Slice the quantity into $n$ pieces, each of width $dr$ (or $dx$, $dt$, etc.).
- **Approximate:** Within each slice, treat conditions as constant so the piece has a simple formula.
- **Sum:** Add all pieces. As the slices get thinner ($dr \to 0$), the approximation becomes exact.

This transforms a geometric or physical problem into an algebraic one. The limiting sum is what we call a **definite integral**. The Riemann sum makes the idea concrete: divide the domain $[a, b]$ into $n$ strips of width $\Delta x = (b-a)/n$, sample a height $f(x_i)$ in each strip, and sum:

$$
\sum_{i=1}^{n} f(x_i)\,\Delta x \quad \xrightarrow{n \to \infty} \quad \int_a^b f(x)\,dx
$$

The integral is not a separate invention — it is just the limit of a sum, motivated directly by the decomposition strategy. We can also think of this using the alternative notation with a change of variable index or sample point:

$$
\sum_{k=1}^n f(x_k^*)\,\Delta x \xrightarrow{\Delta x \to 0} \int_a^b f(x)\,dx
$$

where $x_k^*$ denotes an arbitrary sample point in the $k$-th subinterval.

## The Circle-Area Derivation

Unroll a disk of radius $R$ into concentric rings. A ring at radius $r$ with thickness $dr$ has:

- **Circumference:** $2\pi r$ (length of the ring if straightened into a line segment)
- **Ring area:** approximately $2\pi r \cdot dr$ (circumference times thickness)

The approximation is exact as $dr \to 0$ because the error from the curvature of the ring's ends is of order $dr^2$ and vanishes in the limit.

Line up all these rings from $r = 0$ to $r = R$: their widths $dr$ tile the $x$-axis and their heights $2\pi r$ trace a straight line. The total disk area equals the area under $y = 2\pi r$ from $0$ to $R$ — a triangle with base $R$ and height $2\pi R$:

$$
A = \tfrac{1}{2} \times R \times 2\pi R = \pi R^2
$$

This is confirmed formally by integration:

$$
\int_0^R 2\pi r\,dr = \pi R^2
$$

## From Geometry to Calculus

The ring derivation quietly introduces two foundational ideas.

**Differentiation.** Define $A(r)$ as the area of a disk of radius $r$. Adding one thin ring of width $dr$ adds area $dA \approx 2\pi r\,dr$, so the rate of growth is:

$$
\frac{dA}{dr} = 2\pi r
$$

This is a **derivative** — the instantaneous rate of change of area with respect to radius. Geometry told us the derivative of $\pi r^2$ before we ever wrote an algebraic differentiation rule.

**Integration and differentiation as inverses.** We started from the derivative $dA/dr = 2\pi r$ and recovered the original area $A(r) = \pi r^2$ by integrating. This is the embryonic form of the **Fundamental Theorem of Calculus**: knowing the rate of change, integration gives back the quantity.

$$
A(r) = \int_0^r 2\pi s\,ds = \pi r^2
$$

The same circle problem that motivated integration also delivered the first example of differentiation, and showed the two are inverses — all without yet writing a formal definition of either.

**The relationship between differentiation and integration.** More generally, this relationship holds whenever we differentiate an area function. The derivative of a quantity that accumulates via thin slices equals the "height" of each slice:

$$
\frac{d}{dr}\left(\pi r^2\right) = 2\pi r
$$

This concrete example foreshadows the Fundamental Theorem: integration and differentiation are not merely related — they are perfect inverses of each other.

## Key Equations

| Equation | Description |
|---|---|
| $$A(r) = \pi r^2$$ | Area of a disk of radius $r$ |
| $$dA \approx 2\pi r\,dr$$ | Area of a thin ring at radius $r$ with thickness $dr$ |
| $$\int_0^R 2\pi r\,dr = \pi R^2$$ | Reconstructing disk area by integrating all ring contributions |
| $$\frac{dA}{dr} = 2\pi r$$ | Derivative of disk area with respect to radius |
| $$\sum_{i=1}^{n} f(x_i)\,\Delta x \;\to\; \int_a^b f(x)\,dx$$ | Riemann sum converging to a definite integral as $n \to \infty$ |
| $$A(r) = \int_0^r 2\pi s\,ds$$ | Area as the integral of its own derivative (FTC preview) |

## Connections

- **Next:** Chapter 2 (The Paradox of the Derivative) formalizes what $dA/dr$ actually means by defining the limit $\lim_{h\to 0}[f(x+h)-f(x)]/h$, resolving the apparent paradox of measuring change at a single instant.


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain the Decomposition Principle in your own words: what are the three steps, and why does the approximation become exact as the slices get thinner?
2. Walk through the circle-area derivation using concentric rings — what is the area of a single ring at radius $r$ with thickness $dr$, and how does lining up all rings from $0$ to $R$ produce the formula $A = \pi R^2$?
3. Explain how the circle-area problem simultaneously introduces both differentiation and the Fundamental Theorem of Calculus, without ever using a formal algebraic rule.

<details>
<summary>Answer Guide</summary>

1. Break the hard quantity into $n$ thin slices of width $dr$; approximate each slice as simple (constant conditions); sum all slices. As $dr \to 0$, the curvature/error terms (of order $dr^2$) vanish, turning the Riemann sum $\sum f(x_i)\Delta x$ into the exact definite integral $\int_a^b f(x)\,dx$.
2. A ring at radius $r$ has circumference $2\pi r$, so its area is $2\pi r \cdot dr$. Lining all rings from $r=0$ to $r=R$ traces a triangle with base $R$ and height $2\pi R$; its area $\tfrac{1}{2} \times R \times 2\pi R = \pi R^2$ confirms the formula, also verified by $\int_0^R 2\pi r\,dr = \pi R^2$.
3. Adding one thin ring shows $dA/dr = 2\pi r$ — the derivative of $\pi r^2$ — purely from geometry. Recovering $A(r) = \pi r^2$ by integrating that derivative previews the Fundamental Theorem: integration and differentiation are perfect inverses, a conclusion reached before either operation was formally defined.

</details>
