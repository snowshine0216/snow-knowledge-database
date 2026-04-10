---
tags: [calculus, math, 3blue1brown, derivative, implicit-differentiation, chain-rule]
source: https://www.3blue1brown.com/lessons/implicit-differentiation
---

# Chapter 6: Implicit Differentiation

**Source:** [Essence of Calculus – Implicit Differentiation](https://www.3blue1brown.com/lessons/implicit-differentiation)

## Outline
- [Core Idea](wiki/courses/essence-of-calculus/06-implicit-differentiation.md#core-idea)
- [Key Concepts](wiki/courses/essence-of-calculus/06-implicit-differentiation.md#key-concepts)
- [Why the Chain Rule Creates dy/dx](wiki/courses/essence-of-calculus/06-implicit-differentiation.md#why-the-chain-rule-creates-dydx)
- [Worked Examples](wiki/courses/essence-of-calculus/06-implicit-differentiation.md#worked-examples)
- [The General Formula](wiki/courses/essence-of-calculus/06-implicit-differentiation.md#the-general-formula)
- [Key Equations](wiki/courses/essence-of-calculus/06-implicit-differentiation.md#key-equations)
- [Connections](wiki/courses/essence-of-calculus/06-implicit-differentiation.md#connections)

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
