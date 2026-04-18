---
tags: [calculus, math, 3blue1brown, derivative, implicit-differentiation, chain-rule]
source: https://www.3blue1brown.com/lessons/implicit-differentiation
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. The unit circle is defined by $x^2 + y^2 = 1$. If you wanted to find the slope of the tangent line at a point without solving for $y$ explicitly, how would you approach it?
2. When you differentiate $y^2$ with respect to $x$ (where $y$ depends on $x$), what rule do you need to apply, and what extra factor appears?
3. What do you think the general formula for $dy/dx$ on a curve $F(x, y) = 0$ might look like — what partial derivatives would be involved?

---

# Chapter 6: Implicit Differentiation

**Source:** [Essence of Calculus – Implicit Differentiation](https://www.3blue1brown.com/lessons/implicit-differentiation)

## Outline
- [Core Idea](#core-idea)
- [Key Concepts](#key-concepts)
- [Why the Chain Rule Creates dy/dx](#why-the-chain-rule-creates-dydx)
- [Worked Examples](#worked-examples)
- [The General Formula](#the-general-formula)
- [Key Equations](#key-equations)
- [Connections](#connections)

## Core Idea

Many curves in the plane are not graphs of explicit functions $y = f(x)$ — they are defined instead by a constraint $F(x, y) = 0$ that both variables satisfy simultaneously. The unit circle $x^2 + y^2 = 1$ is the classic example: solving for $y$ requires choosing a branch ($\pm\sqrt{1-x^2}$) and the formula breaks down at the endpoints. Implicit differentiation sidesteps this by differentiating the constraint equation directly with respect to $x$, treating $y$ as an unknown function of $x$ throughout.

The payoff is a general technique for finding $dy/dx$ anywhere on a curve without ever needing an explicit formula for $y$. The only price is that the result expresses $dy/dx$ in terms of both $x$ and $y$ — which is fine, because a point on the curve specifies both coordinates anyway.

## Key Concepts

- **Implicit curve:** a curve defined by $F(x, y) = 0$ rather than $y = f(x)$.
- **Implicit differentiation:** differentiate both sides of the constraint with respect to $x$, applying the chain rule to every term involving $y$.
- **$dy/dx$ as unknown:** treat $\frac{dy}{dx}$ as an unknown and solve for it algebraically after differentiating.
- **Local explicit function:** near any smooth point of the curve where $\partial F/\partial y \neq 0$, the implicit function theorem guarantees $y$ is locally a function of $x$ — so $dy/dx$ exists there.

## Why the Chain Rule Creates dy/dx

When you differentiate a $y$-expression with respect to $x$, you are computing $\frac{d}{dx}[\text{function of }y]$. Because $y$ is itself a function of $x$, the chain rule inserts a factor of $\frac{dy}{dx}$:

$$\frac{d}{dx}[y^n] = n\,y^{n-1}\cdot\frac{dy}{dx}$$

This is exactly the power rule applied to $y$, multiplied by the inner derivative $\frac{dy}{dx}$. Without this step, we would be treating $y$ as a constant, which it is not.

Similarly:

$$\frac{d}{dx}[\sin y] = \cos y \cdot \frac{dy}{dx}$$
$$\frac{d}{dx}[e^y] = e^y \cdot \frac{dy}{dx}$$

The rule is always: differentiate the expression with respect to $y$ as you normally would, then multiply by $\frac{dy}{dx}$.

## Worked Examples

**Unit circle** $x^2 + y^2 = 1$

Differentiate both sides with respect to $x$:

$$2x + 2y\frac{dy}{dx} = 0$$

Solve for $\frac{dy}{dx}$:

$$\frac{dy}{dx} = -\frac{x}{y}$$

At the point $(1/\sqrt{2},\, 1/\sqrt{2})$, this gives slope $-1$, which matches the tangent to a circle at a 45° point.

**Cubic constraint** $x^2 + y^3 = 5$

Differentiate both sides:

$$2x + 3y^2\frac{dy}{dx} = 0$$

$$\frac{dy}{dx} = -\frac{2x}{3y^2}$$

**Mixed term** $xy = 1$ (a hyperbola)

Using the product rule on the left side:

$$y + x\frac{dy}{dx} = 0 \implies \frac{dy}{dx} = -\frac{y}{x}$$

Since $y = 1/x$ on this curve, the result $-y/x = -1/x^2$ matches the explicit derivative.

## The General Formula

For any smooth curve $F(x, y) = 0$, differentiating both sides with respect to $x$ and applying the chain rule to the $y$-dependence gives:

$$\frac{\partial F}{\partial x} + \frac{\partial F}{\partial y}\cdot\frac{dy}{dx} = 0$$

Solving for $\frac{dy}{dx}$:

$$\frac{dy}{dx} = -\frac{\partial F/\partial x}{\partial F/\partial y}$$

This is the general implicit differentiation formula. It requires $\partial F/\partial y \neq 0$ at the point of interest; if that partial derivative is zero, the curve may have a vertical tangent or a singular point there.

## Key Equations

| Equation | Description |
|---|---|
| $$\dfrac{d}{dx}y^n = n\,y^{n-1}\dfrac{dy}{dx}$$ | Power rule on $y$-terms: chain rule inserts $dy/dx$ |
| $$\dfrac{d}{dx}y^2 = 2y\,\dfrac{dy}{dx}$$ | The most common case ($n=2$), used in circle/ellipse problems |
| $$x^2+y^2=1 \Rightarrow 2x+2y\dfrac{dy}{dx}=0 \Rightarrow \dfrac{dy}{dx}=-\dfrac{x}{y}$$ | Full implicit differentiation of the unit circle |
| $$x^2+y^3=5 \Rightarrow \dfrac{dy}{dx}=-\dfrac{2x}{3y^2}$$ | Cubic constraint example |
| $$\dfrac{\partial F}{\partial x} + \dfrac{\partial F}{\partial y}\cdot\dfrac{dy}{dx} = 0$$ | General formula for differentiating $F(x,y)=0$ |
| $$\dfrac{dy}{dx} = -\dfrac{\partial F/\partial x}{\partial F/\partial y}$$ | Solved form; requires $\partial F/\partial y \neq 0$ |
| $$\dfrac{d}{dx}[\sin y] = \cos y\cdot\dfrac{dy}{dx}$$ | Chain rule on a trigonometric $y$-term |

## Connections

- **Previous:** Ch 5 (Why e Is Special) used implicit differentiation to derive $\frac{d}{dx}\ln x = 1/x$ from $e^y = x$ — a direct application of the same technique.
- **Next:** Ch 7 (Limits, L'Hôpital, and Epsilon-Delta) formalizes the limit foundations that justify all the derivative rules used here.


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why differentiating a $y$-term with respect to $x$ always produces a factor of $dy/dx$, and walk through what happens when you differentiate $y^3$.
2. Carry out implicit differentiation on $x^2 + y^2 = 1$ from scratch — show each step — and explain what the resulting slope formula $dy/dx = -x/y$ tells you geometrically.
3. State and explain the general implicit differentiation formula for $F(x, y) = 0$, including the condition under which it breaks down and what that condition means geometrically.

<details>
<summary>Answer Guide</summary>

1. Because $y$ is a function of $x$, the chain rule requires multiplying by the inner derivative $dy/dx$ whenever you differentiate a $y$-expression; for $y^3$, the power rule gives $3y^2$ and the chain rule appends $dy/dx$, yielding $3y^2 \cdot dy/dx$.
2. Differentiating both sides gives $2x + 2y\,dy/dx = 0$, which solves to $dy/dx = -x/y$; geometrically this means the tangent at any circle point is perpendicular to the radius, since the radius has slope $y/x$ and the tangent has slope $-x/y$.
3. The formula is $dy/dx = -(\partial F/\partial x)/(\partial F/\partial y)$; it breaks down when $\partial F/\partial y = 0$, which signals a vertical tangent or a singular point on the curve where $y$ is no longer locally a function of $x$.

</details>
