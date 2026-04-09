---
tags: [calculus, math, 3blue1brown, derivative, power-rule, trigonometry]
source: https://www.3blue1brown.com/lessons/derivatives-power-rule
---

# Chapter 3: Derivative Formulas Through Geometry

**Source:** [Derivative Formulas Through Geometry](https://www.3blue1brown.com/lessons/derivatives-power-rule)

## Outline
- [Core Idea](#core-idea)
- [Power Rule via Areas and Volumes](#power-rule-via-areas-and-volumes)
- [Trig Derivatives via the Unit Circle](#trig-derivatives-via-the-unit-circle)
- [Extending the Power Rule](#extending-the-power-rule)
- [Key Equations](#key-equations)
- [Connections](#connections)

## Core Idea

Derivative rules look like arbitrary formulas when handed down as facts to memorize. But each rule has a geometric story that makes it *inevitable*. For the power rule, the story is about how areas and volumes change when a side length grows by a tiny $dx$. For trig functions, the story is about a point moving along the unit circle.

Understanding the geometric origin of these rules means you can reconstruct them from first principles rather than relying on memory — and it builds the spatial intuition needed for harder problems later.

## Power Rule via Areas and Volumes

**Case $x^2$: think of a square.**

Draw a square with side length $x$. Its area is $x^2$. Now increase the side by a tiny amount $dx$. The new area is $(x+dx)^2$. The *change* in area is:

$$
d(x^2) = (x+dx)^2 - x^2 = 2x\,dx + (dx)^2
$$

Geometrically, this is two thin rectangular strips along two sides (each of length $x$ and width $dx$) plus a tiny corner square of area $(dx)^2$. In the limit, the corner is negligible ($dx^2 \to 0$) and only the two strips survive:

$$
\frac{d(x^2)}{dx} = 2x
$$

**Case $x^3$: think of a cube.**

A cube of side $x$ has volume $x^3$. Growing the side by $dx$ adds three face slabs, each of area $x^2$ and thickness $dx$, plus smaller edge and corner pieces that are of order $dx^2$ or higher:

$$
d(x^3) = 3x^2\,dx + \text{(higher-order terms)}
$$

As $dx \to 0$, only the three face slabs matter:

$$
\frac{d(x^3)}{dx} = 3x^2
$$

**General pattern.** For any positive integer $n$, increasing $x$ by $dx$ in an $n$-dimensional "hypercube" $x^n$ contributes $n$ face slabs each of size $x^{n-1}$ times $dx$, with all other pieces being higher order. This gives:

$$
\frac{d}{dx}x^n = nx^{n-1}
$$

The pattern extends beyond integers: it holds for any real exponent $n$, including negative and fractional ones (verified via the limit definition or implicit differentiation):

$$
\frac{d}{dx}x^{-1} = -x^{-2}, \qquad \frac{d}{dx}x^{1/2} = \tfrac{1}{2}x^{-1/2}
$$

## Trig Derivatives via the Unit Circle

Consider a point $P = (\cos\theta,\, \sin\theta)$ moving along the unit circle. When the angle increases by a tiny $d\theta$, the point moves by a tiny arc of length $d\theta$ (since the circle has radius 1).

Crucially, the direction of motion is **perpendicular to the radius** at $P$, because the tangent to a circle is always perpendicular to the radius. The radius at angle $\theta$ points in the direction $(\cos\theta,\, \sin\theta)$, so the perpendicular direction is $(-\sin\theta,\, \cos\theta)$.

The displacement vector is therefore:

$$
dP = d\theta \cdot (-\sin\theta,\, \cos\theta)
$$

Reading off the two components:

$$
d(\cos\theta) = -\sin\theta\,d\theta \implies \frac{d}{d\theta}\cos\theta = -\sin\theta
$$

$$
d(\sin\theta) = \cos\theta\,d\theta \implies \frac{d}{d\theta}\sin\theta = \cos\theta
$$

Both derivatives follow from one geometric picture, with no algebraic manipulation needed. The auxiliary limit $\lim_{h\to 0}\frac{\sin h}{h} = 1$ (which can be verified by comparing arc length to chord length for small angles) confirms this result algebraically:

$$
\lim_{h\to 0}\frac{\sin h}{h}=1, \qquad \lim_{h\to 0}\frac{\cos h - 1}{h}=0
$$

The second limit ($(\cos h - 1)/h \to 0$) reflects the fact that the cosine curve is flat at the top: it changes at second order, not first order, near $h = 0$.

## Extending the Power Rule

A few important extensions:

- **Linearity:** the derivative distributes over sums and scalar multiples, so $\frac{d}{dx}(af + bg) = af' + bg'$.
- **Negative exponents:** $\frac{d}{dx}x^{-n} = -nx^{-n-1}$ (verified by the limit definition or by writing $x^{-n} = 1/x^n$ and using the quotient rule).
- **Fractional exponents:** $\frac{d}{dx}x^{p/q} = \frac{p}{q}x^{p/q - 1}$ (verified via implicit differentiation of $y^q = x^p$).

In all cases, the *form* $nx^{n-1}$ is preserved — only the exponent changes. This uniformity is itself a geometric fact: scaling any smooth $n$-dimensional object by $(1 + \epsilon)$ increases its "$n$-volume" by approximately $n\epsilon$ to first order.

## Key Equations

| Equation | Description |
|---|---|
| $$d(x^2) = 2x\,dx + (dx)^2$$ | Change in square area; the $(dx)^2$ corner vanishes |
| $$\dfrac{d}{dx}x^2 = 2x$$ | Power rule for $n=2$, derived from two thin strips |
| $$\dfrac{d}{dx}x^3 = 3x^2$$ | Power rule for $n=3$, derived from three face slabs |
| $$\dfrac{d}{dx}x^n = nx^{n-1}$$ | General power rule for any real $n$ |
| $$\dfrac{d}{dx}x^{-1} = -x^{-2}$$ | Power rule applied to a negative exponent |
| $$\dfrac{d}{dx}x^{1/2} = \tfrac{1}{2}x^{-1/2}$$ | Power rule applied to a fractional exponent |
| $$\dfrac{d}{d\theta}\sin\theta = \cos\theta$$ | Trig derivative from unit-circle geometry |
| $$\dfrac{d}{d\theta}\cos\theta = -\sin\theta$$ | Trig derivative: radius perpendicular to motion |
| $$\lim_{h\to 0}\dfrac{\sin h}{h}=1$$ | Key limit confirming the sine derivative algebraically |
| $$\lim_{h\to 0}\dfrac{\cos h - 1}{h}=0$$ | Cosine changes at second order near $0$, not first |

## Connections

- **Previous:** Chapter 2 (The Paradox of the Derivative) established the limit definition $f'(x) = \lim_{h\to 0}[f(x+h)-f(x)]/h$, which this chapter applies geometrically to avoid algebra-heavy expansions.
- **Next:** Chapter 4 (Chain Rule and Product Rule) shows how to differentiate *combinations* of functions — products $f \cdot g$ and compositions $f(g(x))$ — using the same small-nudge bookkeeping.
