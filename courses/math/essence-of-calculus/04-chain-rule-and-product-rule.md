---
tags: [calculus, math, 3blue1brown, derivative, chain-rule, product-rule]
source: https://www.3blue1brown.com/lessons/chain-rule-and-product-rule
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. If you have a product of two functions $f(x) \cdot g(x)$, what do you think the derivative looks like — does it equal $f'(x) \cdot g'(x)$, or something else?
2. For a composed function like $\sin(x^2)$, how would you guess the derivative relates to the derivatives of the outer function $\sin$ and the inner function $x^2$?
3. When you nudge the input $x$ of a rectangle with sides $f$ and $g$, how many distinct pieces does the change in area split into, and which ones do you think survive in the derivative?

---

# Chapter 4: Chain Rule and Product Rule

**Source:** [Chain Rule and Product Rule](https://www.3blue1brown.com/lessons/chain-rule-and-product-rule)

## Outline
- [Core Idea](#core-idea)
- [Product Rule via Rectangle Geometry](#product-rule-via-rectangle-geometry)
- [Chain Rule via Cascading Nudges](#chain-rule-via-cascading-nudges)
- [Worked Examples](#worked-examples)
- [Key Equations](#key-equations)
- [Connections](#connections)

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


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain the product rule using the rectangle geometry argument — where does each term in $f'g + fg'$ come from, and why is the corner piece $df\,dg$ dropped?
2. Walk through the chain rule derivation using cascading nudges: starting from a nudge $dx$, explain how $dy$ and then $dz$ arise, and why the final sensitivity $dz/dx$ is a product of two local sensitivities.
3. Differentiate $e^x \cos(x^2)$ step by step, naming which rule you apply at each stage and why.

<details>
<summary>Answer Guide</summary>

1. A rectangle with sides $f$ and $g$ grows by three pieces when $x$ is nudged: a top strip $f\,dg$, a right strip $g\,df$, and a corner square $df\,dg$. The corner is second-order (product of two tiny quantities) and vanishes in the limit, leaving $d(fg) = f\,dg + g\,df$, which divided by $dx$ gives $f'g + fg'$.
2. A nudge $dx$ propagates to $y = g(x)$ as $dy = g'(x)\,dx$, then that nudge to $y$ propagates to $z = f(y)$ as $dz = f'(y)\,dy$; substituting gives $dz = f'(g(x))\cdot g'(x)\,dx$, so $dz/dx = f'(g(x))\cdot g'(x)$ — each link in the chain contributes one multiplicative factor.
3. Apply the product rule to $e^x$ and $\cos(x^2)$: the derivative is $e^x\cos(x^2) + e^x \cdot \frac{d}{dx}\cos(x^2)$; the chain rule on the second term gives $-\sin(x^2)\cdot 2x$, yielding $e^x(\cos(x^2) - 2x\sin(x^2))$.

</details>
