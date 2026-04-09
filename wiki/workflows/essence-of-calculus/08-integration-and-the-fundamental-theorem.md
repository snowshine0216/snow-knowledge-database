---
tags: [calculus, math, 3blue1brown, integral, fundamental-theorem, integration]
source: https://www.3blue1brown.com/lessons/integration
---

# Chapter 8: Integration and the Fundamental Theorem

**Source:** [Essence of Calculus – Integration](https://www.3blue1brown.com/lessons/integration)

## Outline
- [Core Idea](#core-idea)
- [Key Concepts](#key-concepts)
- [Riemann Sums and the Definite Integral](#riemann-sums-and-the-definite-integral)
- [The Fundamental Theorem of Calculus](#the-fundamental-theorem-of-calculus)
- [Antiderivatives and Indefinite Integrals](#antiderivatives-and-indefinite-integrals)
- [Key Equations](#key-equations)
- [Connections](#connections)

## Core Idea

Integration is about accumulation. When you have a continuously varying rate — velocity, power, population growth rate — and you want to find the total accumulated quantity over an interval, you integrate. The geometric picture is the area under the curve $y = f(x)$ between $x = a$ and $x = b$.

The Fundamental Theorem of Calculus (FTC) is the central insight that makes integration tractable: to find the exact accumulated total, you do not need to take the limit of infinitely many sums. Instead, it suffices to find any function $F$ whose derivative is $f$. Then the total accumulation is simply $F(b) - F(a)$. Differentiation and integration are inverse operations, and this two-way bridge between them is the core theorem of calculus.

## Key Concepts

- **Definite integral:** the exact area under $f$ from $a$ to $b$, defined as a limit of Riemann sums; denoted $\int_a^b f(x)\,dx$.
- **Riemann sum:** an approximation to the integral obtained by dividing $[a,b]$ into $n$ subintervals and summing rectangle areas $f(x_k^*)\,\Delta x$.
- **Antiderivative:** a function $F$ satisfying $F'(x) = f(x)$; also called a primitive or indefinite integral.
- **Indefinite integral:** the family of all antiderivatives, written $\int f(x)\,dx = F(x) + C$ where $C$ is an arbitrary constant.
- **FTC Part 1:** the area function $A(x) = \int_a^x f(t)\,dt$ is an antiderivative of $f$; its instantaneous rate of change equals $f(x)$.
- **FTC Part 2:** once an antiderivative $F$ is known, $\int_a^b f(x)\,dx = F(b) - F(a)$ — no sums needed.

## Riemann Sums and the Definite Integral

Divide the interval $[a, b]$ into $n$ equal strips of width $\Delta x = (b-a)/n$. In each strip $[x_{k-1}, x_k]$, pick a sample point $x_k^*$ and approximate the area of that strip as a rectangle of height $f(x_k^*)$ and width $\Delta x$:

$$\text{Approximate total area} \approx \sum_{k=1}^n f(x_k^*)\,\Delta x$$

As $n \to \infty$ (equivalently $\Delta x \to 0$), if $f$ is continuous the rectangles fill the region exactly and the sum converges to the definite integral:

$$\int_a^b f(x)\,dx = \lim_{n\to\infty}\sum_{k=1}^n f(x_k^*)\,\Delta x$$

The notation $\int_a^b f(x)\,dx$ reflects this origin: the integral sign $\int$ is an elongated $S$ for "sum," and $dx$ represents the infinitesimal width $\Delta x$ in the limit. The definite integral is a number (for fixed $a$, $b$, and $f$), not a function.

Integration is linear: for constants $c$ and integrable functions $f$, $g$:

$$\int_a^b [c\,f(x) + g(x)]\,dx = c\int_a^b f(x)\,dx + \int_a^b g(x)\,dx$$

## The Fundamental Theorem of Calculus

**FTC Part 1** defines the area function $A(x) = \int_a^x f(t)\,dt$ and asks: how fast does the accumulated area grow?

$$A(x) = \int_a^x f(t)\,dt \implies A'(x) = f(x)$$

The intuition: when $x$ increases by a tiny $dx$, the area gains a sliver of width $dx$ and height $f(x)$, so $dA \approx f(x)\,dx$, meaning $\frac{dA}{dx} = f(x)$. The rate of accumulation at any point equals the current height of the function — the slope of the area function is the function itself.

**FTC Part 2** turns this into a computational tool. Since $A(x)$ is *an* antiderivative of $f$, and any two antiderivatives differ only by a constant, any antiderivative $F$ satisfies $F(x) = A(x) + C$. Therefore:

$$\int_a^b f(x)\,dx = A(b) - A(a) = [F(b) + C] - [F(a) + C] = F(b) - F(a)$$

$$\int_a^b f(x)\,dx = F(b) - F(a), \quad \text{where } F'(x) = f(x)$$

This is the practical power of calculus: instead of computing limits of sums, find an antiderivative and evaluate it at two points.

## Antiderivatives and Indefinite Integrals

An antiderivative of $f$ is any function $F$ with $F'(x) = f(x)$. The constant of integration $C$ captures the fact that shifting a function vertically does not change its derivative:

$$\int f(x)\,dx = F(x) + C$$

Key antiderivative pairs (all verifiable by differentiating the right side):

- $\int x^n\,dx = \dfrac{x^{n+1}}{n+1} + C$ for $n \neq -1$
- $\int \frac{1}{x}\,dx = \ln|x| + C$
- $\int e^x\,dx = e^x + C$

The substitution rule is the chain rule in reverse. If $u = g(x)$, then $du = g'(x)\,dx$:

$$\int f(g(x))\,g'(x)\,dx = \int f(u)\,du$$

This converts an integral in $x$ to a (hopefully simpler) integral in $u$.

## Key Equations

| Equation | Description |
|---|---|
| $$\displaystyle\int_a^b f(x)\,dx = \lim_{n\to\infty}\sum_{k=1}^n f(x_k^*)\,\Delta x$$ | Definition of the definite integral as a limit of Riemann sums |
| $$F'(x) = f(x)$$ | Definition: $F$ is an antiderivative of $f$ |
| $$A(x)=\int_a^x f(t)\,dt \Rightarrow A'(x)=f(x)$$ | FTC Part 1: the area function is an antiderivative |
| $$\displaystyle\int_a^b f(x)\,dx = F(b)-F(a)$$ | FTC Part 2: evaluation via antiderivative — no sums needed |
| $$\int f(x)\,dx = F(x) + C$$ | Indefinite integral: the family of all antiderivatives |
| $$\displaystyle\int_a^b [c\,f + g]\,dx = c\!\int_a^b\!f\,dx + \int_a^b\!g\,dx$$ | Linearity of integration |
| $$\int f(g(x))\,g'(x)\,dx = \int f(u)\,du$$ | Substitution rule (chain rule in reverse) |

## Connections

- **Previous:** Ch 7 (Limits, L'Hôpital, and Epsilon-Delta) established the limit machinery that the Riemann sum definition relies on; without it, $\lim_{n\to\infty} \sum$ would be undefined.
- **Next:** Ch 9 (What Area Has to Do with Slope) deepens the FTC story, exploring why antiderivatives and areas are the same thing geometrically and building intuition for more complex integration scenarios.
