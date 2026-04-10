---
tags: [calculus, math, 3blue1brown, derivative, chain-rule, product-rule]
source: https://www.3blue1brown.com/lessons/chain-rule-and-product-rule
---

# Chapter 4: Chain Rule and Product Rule

**Source:** [Chain Rule and Product Rule](https://www.3blue1brown.com/lessons/chain-rule-and-product-rule)

## Outline
- [Core Idea](wiki/courses/essence-of-calculus/04-chain-rule-and-product-rule.md#core-idea)
- [Product Rule via Rectangle Geometry](wiki/courses/essence-of-calculus/04-chain-rule-and-product-rule.md#product-rule-via-rectangle-geometry)
- [Chain Rule via Cascading Nudges](wiki/courses/essence-of-calculus/04-chain-rule-and-product-rule.md#chain-rule-via-cascading-nudges)
- [Worked Examples](wiki/courses/essence-of-calculus/04-chain-rule-and-product-rule.md#worked-examples)
- [Key Equations](wiki/courses/essence-of-calculus/04-chain-rule-and-product-rule.md#key-equations)
- [Connections](wiki/courses/essence-of-calculus/04-chain-rule-and-product-rule.md#connections)

## Core Idea

The product rule and chain rule are not arbitrary formulas — they are bookkeeping devices that track how a small input nudge propagates through a mathematical structure. Both rules emerge naturally from the same small-nudge reasoning used to derive the power rule and trig derivatives.

- **Product rule:** if you nudge $x$, both $f$ and $g$ respond; the total change in $f \cdot g$ is $f$ times $g$'s change plus $g$ times $f$'s change.
- **Chain rule:** if $y$ depends on $x$ and $z$ depends on $y$, a nudge to $x$ is amplified (or shrunk) at each link of the chain; the total sensitivity is the product of the sensitivities at each link.

Both rules generalize immediately to longer chains and products of many functions.

## Product Rule via Rectangle Geometry

Picture a rectangle with width $f$ and height $g$. Its area is $A = f \cdot g$.

Now nudge the input $x$ by $dx$. The width grows to $f + df$ and the height grows to $g + dg$. The new area is:

$$
(f + df)(g + dg) = fg + f\,dg + g\,df + df\,dg
$$

The increase in area consists of three pieces:
- $f\,dg$: a horizontal strip at the top (full width $f$, height $dg$)
- $g\,df$: a vertical strip on the right (full height $g$, width $df$)
- $df\,dg$: a tiny corner square, which is second-order in the nudges

In the limit, $df\,dg$ is negligible compared to the two strips:

$$
d(fg) \approx f\,dg + g\,df
$$

Dividing by $dx$:

$$
\frac{d}{dx}(f(x)\,g(x)) = f(x)\,g'(x) + g(x)\,f'(x)
$$

The geometric picture makes the formula memorable: the two "main" rectangles that grow when one side changes, with the corner piece too small to matter.

## Chain Rule via Cascading Nudges

Suppose two functions are composed: first apply $g$ to $x$ to get $y = g(x)$, then apply $f$ to $y$ to get $z = f(y) = f(g(x))$.

A nudge $dx$ to $x$ causes a nudge to $y$:

$$
dy = g'(x)\,dx
$$

That nudge to $y$ in turn causes a nudge to $z$:

$$
dz = f'(y)\,dy = f'(g(x))\,g'(x)\,dx
$$

The total sensitivity $dz/dx$ is therefore the product of the two local sensitivities:

$$
\frac{dz}{dx} = \frac{dz}{dy} \cdot \frac{dy}{dx}
$$

In function notation:

$$
\frac{d}{dx}f(g(x)) = f'(g(x))\cdot g'(x)
$$

The Leibniz form $dz/dx = (dz/dy)(dy/dx)$ is especially intuitive: it looks like the $dy$'s cancel, and while that is not literally true (they are not fractions), the metaphor is a reliable guide. The chain rule extends to longer compositions: if $w = f(g(h(x)))$, then:

$$
\frac{dw}{dx} = f'(g(h(x)))\cdot g'(h(x))\cdot h'(x)
$$

Each link in the chain contributes one multiplicative factor.

## Worked Examples

**Product rule example: $x^2 \sin x$**

Let $f(x) = x^2$ and $g(x) = \sin x$. Then $f'(x) = 2x$ and $g'(x) = \cos x$:

$$
\frac{d}{dx}(x^2 \sin x) = 2x \sin x + x^2 \cos x
$$

**Chain rule example: $\sin(x^2)$**

The outer function is $f(y) = \sin y$ and the inner function is $g(x) = x^2$. Then $f'(y) = \cos y$ and $g'(x) = 2x$:

$$
\frac{d}{dx}\sin(x^2) = \cos(x^2) \cdot 2x
$$

Reading this aloud: "derivative of the outside, leave the inside alone, times derivative of the inside."

**Chain rule example: $(3x^2 + 5)^4$**

Outer: $f(y) = y^4$, inner: $g(x) = 3x^2 + 5$. Then $f'(y) = 4y^3$ and $g'(x) = 6x$:

$$
\frac{d}{dx}(3x^2+5)^4 = 4(3x^2+5)^3 \cdot 6x = 24x(3x^2+5)^3
$$

**Combining both rules: $e^x \cos(x^2)$**

Product rule on $e^x$ and $\cos(x^2)$, with chain rule needed for $\cos(x^2)$:

$$
\frac{d}{dx}\left(e^x \cos(x^2)\right) = e^x \cos(x^2) + e^x \cdot (-\sin(x^2)) \cdot 2x
= e^x\bigl(\cos(x^2) - 2x\sin(x^2)\bigr)
$$

## Key Equations

| Equation | Description |
|---|---|
| $$(f+df)(g+dg) = fg + f\,dg + g\,df + df\,dg$$ | Rectangle area after nudging both sides |
| $$d(fg) \approx f\,dg + g\,df$$ | Differential form of the product rule (corner $df\,dg$ dropped) |
| $$\dfrac{d}{dx}(fg) = f'g + fg'$$ | Product rule in standard notation |
| $$\dfrac{dz}{dx} = \dfrac{dz}{dy}\cdot\dfrac{dy}{dx}$$ | Chain rule in Leibniz notation |
| $$\dfrac{d}{dx}f(g(x)) = f'(g(x))\cdot g'(x)$$ | Chain rule in function notation |
| $$\dfrac{d}{dx}\sin(x^2) = \cos(x^2)\cdot 2x$$ | Worked example of the chain rule |
| $$\dfrac{d}{dx}(x^2\sin x) = 2x\sin x + x^2\cos x$$ | Worked example of the product rule |
| $$\dfrac{dw}{dx} = f'(g(h(x)))\cdot g'(h(x))\cdot h'(x)$$ | Chain rule extended to three nested functions |

## Connections

- **Previous:** Chapter 3 (Derivative Formulas Through Geometry) derived the basic building blocks — power rule and trig derivatives — that appear as the $f'$ and $g'$ factors in these rules.
- **Next:** Chapter 5 (Why e is Special) introduces the exponential function $e^x$ and shows why it is its own derivative, a property that makes the chain rule especially clean when exponentials appear in compositions.
