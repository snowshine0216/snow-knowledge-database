---
tags: [calculus, math, 3blue1brown, taylor-series, polynomial-approximation, series]
source: https://www.3blue1brown.com/lessons/taylor-series
---

# Chapter 11: Taylor Series

**Source:** [Essence of Calculus – Taylor series](https://www.3blue1brown.com/lessons/taylor-series)

## Outline
- [Core Idea](wiki/concepts/essence-of-calculus/11-taylor-series.md#core-idea)
- [Key Concepts](wiki/concepts/essence-of-calculus/11-taylor-series.md#key-concepts)
- [Deriving the Coefficients](wiki/concepts/essence-of-calculus/11-taylor-series.md#deriving-the-coefficients)
- [Common Series](wiki/concepts/essence-of-calculus/11-taylor-series.md#common-series)
- [Convergence and the Remainder](wiki/concepts/essence-of-calculus/11-taylor-series.md#convergence-and-the-remainder)
- [Key Equations](wiki/concepts/essence-of-calculus/11-taylor-series.md#key-equations)
- [Connections](wiki/concepts/essence-of-calculus/11-taylor-series.md#connections)

## Core Idea

A smooth function carries all of its local information in its derivatives at a single point. The Taylor series makes that information explicit by constructing a polynomial whose derivatives at $a$ match those of $f$ at $a$ exactly — to all orders. The $n$-th term is built from $f^{(n)}(a)$, the $n$-th derivative evaluated at the center, divided by $n!$ to cancel the factorial that differentiation generates.

This is not just a theoretical tool. Computers and calculators use Taylor series (or closely related Chebyshev approximations) to evaluate $\sin x$, $e^x$, and $\ln x$ for arbitrary inputs. Physicists use them constantly to linearize equations near equilibrium. The key practical insight is that near the expansion point $a$, the first few terms already give an excellent approximation, and each additional term extends the range of accuracy further.

## Key Concepts

- **Taylor series** centered at $a$: the infinite polynomial $\sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n$ whose coefficients are determined by the derivatives of $f$ at $a$.
- **Maclaurin series**: the special case $a = 0$; the most commonly encountered Taylor series ($e^x$, $\sin x$, $\cos x$, $\frac{1}{1-x}$) are all Maclaurin series.
- **Radius of convergence** $R$: the largest value such that the series converges for all $|x - a| < R$. Some series converge everywhere ($R = \infty$), others only on a finite interval.
- **Partial sum / $n$-th degree Taylor polynomial**: the finite truncation $\sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}(x-a)^k$; used as the practical approximation.
- **Lagrange remainder** $R_n(x)$: the error made by stopping at degree $n$; it quantifies how good the approximation is.

## Deriving the Coefficients

Start with the goal: find constants $c_0, c_1, c_2, \ldots$ so that the polynomial $P(x) = \sum c_n (x-a)^n$ satisfies $P^{(k)}(a) = f^{(k)}(a)$ for every $k \geq 0$.

Evaluating $P$ and its derivatives at $x = a$:

- $P(a) = c_0 \implies c_0 = f(a)$
- $P'(a) = c_1 \implies c_1 = f'(a)$
- $P''(a) = 2c_2 \implies c_2 = f''(a)/2$
- $P'''(a) = 6c_3 \implies c_3 = f'''(a)/6$

The pattern is clear: differentiating $(x-a)^n$ exactly $n$ times at $x = a$ gives $n!$, so the coefficient must divide that factorial out:

$$
c_n = \frac{f^{(n)}(a)}{n!}
$$

This is the only way to make the polynomial's $n$-th derivative match $f^{(n)}(a)$. Every Taylor coefficient is uniquely determined by the corresponding derivative of $f$.

## Common Series

The following Maclaurin series ($a = 0$) are worth memorizing; they appear constantly across mathematics, physics, and engineering.

**Exponential** (converges for all $x$):
$$
e^x = \sum_{n=0}^{\infty}\frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots
$$

**Sine** (converges for all $x$; only odd powers, alternating signs):
$$
\sin x = \sum_{n=0}^{\infty}(-1)^n\frac{x^{2n+1}}{(2n+1)!} = x - \frac{x^3}{6} + \frac{x^5}{120} - \cdots
$$

**Cosine** (converges for all $x$; only even powers, alternating signs):
$$
\cos x = \sum_{n=0}^{\infty}(-1)^n\frac{x^{2n}}{(2n)!} = 1 - \frac{x^2}{2} + \frac{x^4}{24} - \cdots
$$

**Geometric series** (converges only for $|x| < 1$):
$$
\frac{1}{1-x} = \sum_{n=0}^{\infty} x^n = 1 + x + x^2 + x^3 + \cdots
$$

The geometric series has finite radius of convergence $R = 1$ because the function $1/(1-x)$ has a singularity (pole) at $x = 1$; the series cannot converge past a singularity.

## Convergence and the Remainder

Adding more terms improves the approximation near $a$, but the series does not always converge everywhere. The **radius of convergence** $R$ determines the interval of guaranteed convergence $(a-R,\, a+R)$.

When you stop at degree $n$, the **Lagrange remainder** bounds the error:

$$
R_n(x) = \frac{f^{(n+1)}(c)}{(n+1)!}(x-a)^{n+1} \quad \text{for some } c \text{ between } a \text{ and } x
$$

This says the error is essentially the next term of the series, evaluated not at $x$ but at some intermediate point $c$. In practice you bound $|f^{(n+1)}(c)|$ by its maximum on the interval and obtain a rigorous error estimate.

For $e^x$ on $[0,1]$, for instance, $|f^{(n+1)}(c)| \leq e^1 < 3$ for all $c \in [0,1]$, so the error after $n$ terms is at most $3/(n+1)!$ — extremely small even for modest $n$.

## Key Equations

| Equation | Description |
|---|---|
| $$f(x)=\sum_{n=0}^{\infty}\dfrac{f^{(n)}(a)}{n!}(x-a)^n$$ | Full Taylor series centered at $a$ |
| $$c_n=\dfrac{f^{(n)}(a)}{n!}$$ | Formula for the $n$-th Taylor coefficient |
| $$e^x=\sum_{n=0}^{\infty}\dfrac{x^n}{n!}$$ | Maclaurin series for $e^x$ (converges everywhere) |
| $$\sin x=\sum_{n=0}^{\infty}(-1)^n\dfrac{x^{2n+1}}{(2n+1)!}$$ | Maclaurin series for $\sin x$ |
| $$\cos x=\sum_{n=0}^{\infty}(-1)^n\dfrac{x^{2n}}{(2n)!}$$ | Maclaurin series for $\cos x$ |
| $$\dfrac{1}{1-x}=\sum_{n=0}^{\infty}x^n,\quad |x|<1$$ | Geometric series (finite radius of convergence $R=1$) |
| $$R_n(x)=\dfrac{f^{(n+1)}(c)}{(n+1)!}(x-a)^{n+1}$$ | Lagrange remainder: error bound after $n$ terms |

## Connections

- **Previous:** Ch 10 (Higher-Order Derivatives) developed the machinery of $f^{(n)}(a)$ that Taylor coefficients depend on directly; concavity from $f''$ is already a first-order use of that machinery.
- **Next:** Ch 12 (Euler's Formula via Group Theory) uses the Maclaurin series for $e^x$, $\sin x$, and $\cos x$ as the key ingredient in the Taylor-series proof that $e^{i\theta} = \cos\theta + i\sin\theta$.
