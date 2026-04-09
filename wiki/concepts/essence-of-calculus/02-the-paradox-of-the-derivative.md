---
tags: [calculus, math, 3blue1brown, derivative, limits, instantaneous-rate]
source: https://www.3blue1brown.com/lessons/derivatives
---

# Chapter 2: The Paradox of the Derivative

**Source:** [The Paradox of the Derivative](https://www.3blue1brown.com/lessons/derivatives)

## Outline
- [Core Idea](wiki/concepts/essence-of-calculus/02-the-paradox-of-the-derivative.md#core-idea)
- [The Paradox](wiki/concepts/essence-of-calculus/02-the-paradox-of-the-derivative.md#the-paradox)
- [Resolution via Limits](wiki/concepts/essence-of-calculus/02-the-paradox-of-the-derivative.md#resolution-via-limits)
- [A Concrete Example: s(t) = t³](wiki/concepts/essence-of-calculus/02-the-paradox-of-the-derivative.md#a-concrete-example-st--t³)
- [Notation and Interpretation](wiki/concepts/essence-of-calculus/02-the-paradox-of-the-derivative.md#notation-and-interpretation)
- [Key Equations](wiki/concepts/essence-of-calculus/02-the-paradox-of-the-derivative.md#key-equations)
- [Connections](wiki/concepts/essence-of-calculus/02-the-paradox-of-the-derivative.md#connections)

## Core Idea

"Instantaneous velocity" sounds self-contradictory: velocity measures change over time, yet at a single instant nothing has had time to change. The resolution is the **limit**: average velocity over a shrinking time interval approaches a stable value, and that value is defined to be the instantaneous velocity. The derivative is, at heart, the local linear behavior of a function — how much the output nudges for an infinitesimally small nudge to the input.

This chapter grounds the abstract limit definition in a physical story (distance and velocity) and works through the algebra for a concrete case, $s(t) = t^3$, to show that the limit is not a circular trick but a genuinely well-defined computation.

## The Paradox

Suppose a car's position at time $t$ is $s(t)$. We define average velocity over $[t,\, t+dt]$ as:

$$
v_{\text{avg}} = \frac{s(t + dt) - s(t)}{dt}
$$

This makes sense for any finite $dt > 0$: we have two distinct positions and a real elapsed time. But "instantaneous velocity at time $t$" means we want $dt = 0$. Plugging in $dt = 0$ gives $0/0$ — undefined.

The paradox is that two different points in time are needed to talk about change, yet we want to describe change at *one* point. The concept of **limit** is invented precisely to escape this trap.

## Resolution via Limits

Rather than setting $dt = 0$ directly, we watch what the average velocity *approaches* as $dt$ gets arbitrarily small:

$$
v(t) = \lim_{dt \to 0} \frac{s(t + dt) - s(t)}{dt}
$$

As long as this ratio approaches a single finite value as $dt \to 0$ — regardless of the direction from which $dt$ approaches zero — that value is taken as the definition of instantaneous velocity. The limit sidesteps the $0/0$ problem by asking for a *trend*, not an evaluation at $0$.

In general, for any function $f$, the **derivative** at $x$ is:

$$
f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}
$$

If this limit exists, $f$ is said to be **differentiable** at $x$, and $f'(x)$ captures the slope of the tangent line to the graph of $f$ at that point. Equivalently, $f'(x)$ is the best linear approximation to $f$ near $x$:

$$
f(x + \Delta x) \approx f(x) + f'(x)\,\Delta x \quad \text{for small } \Delta x
$$

## A Concrete Example: s(t) = t³

Let $s(t) = t^3$. The average velocity over $[t,\, t+dt]$ is:

$$
\frac{s(t+dt) - s(t)}{dt} = \frac{(t+dt)^3 - t^3}{dt}
$$

Expand $(t+dt)^3$:

$$
(t+dt)^3 = t^3 + 3t^2\,dt + 3t\,(dt)^2 + (dt)^3
$$

Subtract $t^3$ and divide by $dt$:

$$
\frac{3t^2\,dt + 3t\,(dt)^2 + (dt)^3}{dt} = 3t^2 + 3t\,dt + (dt)^2
$$

As $dt \to 0$, the terms containing $dt$ vanish, leaving:

$$
s'(t) = \lim_{dt \to 0}\left(3t^2 + 3t\,dt + (dt)^2\right) = 3t^2
$$

The key insight: $dt$ does *real algebraic work* (cancels the $0$ in the denominator) before we take the limit. It is never set to zero; the limit removes it cleanly. This is why the limit definition is not circular.

## Notation and Interpretation

Three equivalent notations for the derivative of $s$ with respect to $t$:

- **Lagrange:** $s'(t)$ — compact, emphasizes it is a function of $t$
- **Leibniz:** $\dfrac{ds}{dt}$ — reads as "a tiny change in $s$ per tiny change in $t$"; ideal for the chain rule
- **Newton (dot notation):** $\dot{s}$ — common in physics for time derivatives

The Leibniz notation $ds/dt$ is especially suggestive: it looks like a ratio of infinitesimals, and while that is not literally true, the notation is consistent with how differentials combine in the chain rule and integration by substitution.

The derivative $v(t) = ds/dt$ also has a geometric meaning: it is the **slope of the tangent line** to the graph of $s$ at the point $(t,\, s(t))$.

## Key Equations

| Equation | Description |
|---|---|
| $$v_{\text{avg}} = \dfrac{s(t+dt)-s(t)}{dt}$$ | Average velocity over the interval $[t,\, t+dt]$ |
| $$f'(x) = \lim_{h\to 0}\dfrac{f(x+h)-f(x)}{h}$$ | Formal definition of the derivative |
| $$v(t) = \dfrac{ds}{dt}$$ | Velocity as the derivative of position (Leibniz notation) |
| $$\Delta s \approx f'(x)\,\Delta x$$ | Linear approximation for small $\Delta x$ |
| $$(t+dt)^3 = t^3 + 3t^2\,dt + 3t\,(dt)^2 + (dt)^3$$ | Binomial expansion used in the $t^3$ example |
| $$s'(t) = 3t^2 \text{ when } s(t)=t^3$$ | Result of applying the limit definition to $t^3$ |
| $$f(x+\Delta x) \approx f(x) + f'(x)\,\Delta x$$ | Derivative as the best local linear approximation |

## Connections

- **Previous:** Chapter 1 (The Essence of Calculus) introduced $dA/dr = 2\pi r$ informally through the ring argument; this chapter supplies the rigorous limit definition that backs that claim.
- **Next:** Chapter 3 (Derivative Formulas Through Geometry) uses geometric arguments to derive derivative rules — power rule, sine, cosine — avoiding the need to expand binomials by hand every time.
