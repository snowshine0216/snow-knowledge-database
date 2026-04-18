---
tags: [calculus, math, 3blue1brown, integral, derivative, fundamental-theorem]
source: https://www.3blue1brown.com/lessons/area-and-slope
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. In your own words, what do you think the "Fundamental Theorem of Calculus" connects — and why would that connection be surprising?
2. If you nudge the upper limit of an integral $\int_a^x f(t)\,dt$ by a tiny amount $dx$, what shape does the extra area added look like, and what determines its size?
3. What does it mean for two mathematical operations to be "inverses" of each other? Give an example from arithmetic or algebra before reading.

---

# Chapter 9: What Area Has to Do with Slope

**Source:** [Essence of Calculus – What area has to do with slope](https://www.3blue1brown.com/lessons/area-and-slope)

## Outline
- [Core Idea](#core-idea)
- [Key Concepts](#key-concepts)
- [The Thin-Sliver Argument](#the-thin-sliver-argument)
- [The Mean Value Insight](#the-mean-value-insight)
- [Key Equations](#key-equations)
- [Connections](#connections)

## Core Idea

Slope (derivative) and accumulated area (integral) look completely unrelated at first glance — one is about instantaneous rate of change, the other is about summing infinitely many infinitesimal pieces. Yet the Fundamental Theorem of Calculus reveals they are exact inverses of each other. If $A(x)$ measures the area accumulated under a curve $f$ from some fixed starting point $a$ up to $x$, then the rate at which that area is growing at any $x$ is precisely the height of the curve at that $x$: $A'(x) = f(x)$.

Define the accumulation function explicitly:

$$
A(x) = \int_a^x f(t)\,dt
$$

This function measures total signed area from the starting point $a$ to any position $x$ along the domain.

This is not a computational coincidence. It has a clean geometric explanation: a tiny nudge $dx$ to the upper limit adds a thin rectangular sliver of area whose width is $dx$ and whose height is (approximately) $f(x)$. Dividing the area gained by the width of the nudge gives back $f(x)$ exactly in the limit. The local average rate of change always equals the overall rate — a principle that runs throughout calculus.

## Key Concepts

- **Definite integral** $\int_a^b f(x)\,dx$: the signed area between the graph of $f$ and the $x$-axis from $a$ to $b$, defined as the limit of Riemann sums.
- **Accumulation function** $A(x) = \int_a^x f(t)\,dt$: treats the upper limit as a variable; $A$ is itself a function of $x$.
- **Antiderivative**: any function $F$ such that $F'(x) = f(x)$; the Fundamental Theorem states $A(x)$ is one such antiderivative.
- **Fundamental Theorem of Calculus (Part 1)**: differentiation and integration are inverse operations — $\frac{d}{dx}\int_a^x f(t)\,dt = f(x)$.
- **Fundamental Theorem of Calculus (Part 2)**: a definite integral can be evaluated via any antiderivative — $\int_a^b f(x)\,dx = F(b) - F(a)$.
- **Average value of a function**: the integral of $f$ over $[a,b]$ divided by the interval length, analogous to averaging a finite list of numbers.

## The Thin-Sliver Argument

The core geometric proof of Part 1 runs as follows. Define $A(x) = \int_a^x f(t)\,dt$. Ask: how does $A$ change when we nudge the upper limit from $x$ to $x + dx$?

The extra area gained is a sliver under the curve from $x$ to $x+dx$. For small $dx$ this sliver is very nearly a rectangle of height $f(x)$ and width $dx$:

$$
A(x + dx) - A(x) \approx f(x) \cdot dx
$$

Dividing both sides by $dx$ and taking the limit:

$$
A'(x) = \lim_{dx \to 0} \frac{A(x+dx) - A(x)}{dx} = f(x)
$$

So the slope of the accumulation function at $x$ is the height of the original function at $x$. Area and slope are inverses of each other because of this telescoping sliver geometry.

Part 2 follows immediately: since $A'(x) = f(x)$ and any antiderivative $F$ differs from $A$ only by a constant, the Fundamental Theorem Part 2 states:

$$
\int_a^b f(x)\,dx = F(b) - F(a)
$$

where $F$ is any antiderivative of $f$. This says a definite integral can always be evaluated by finding an antiderivative and computing the difference of its values at the endpoints.

## The Mean Value Insight

There is a deeper philosophical point here, translating the Chinese insight directly: "The local average rate of change must equal the overall rate of change." The most direct form of this is sometimes written as:

$$
\frac{d}{dx}\left(\int_a^x f(t)\,dt\right) = f(x)
$$

This emphasizes that differentiation and integration are true inverse operations — taking the derivative of an integral recovers the original function.

More precisely, the average value of $f$ over $[a,b]$ — computed as a continuous analog of averaging — equals the net change in any antiderivative divided by the interval length:

$$
\text{average value of } f = \frac{1}{b-a}\int_a^b f(x)\,dx = \frac{F(b)-F(a)}{b-a}
$$

The **Mean Value Theorem for Integrals** makes this concrete: if $f$ is continuous on $[a,b]$, there exists at least one point $c \in [a,b]$ where the function actually attains its average value:

$$
\int_a^b f(x)\,dx = f(c)\cdot(b-a) \quad \text{for some } c \in [a,b]
$$

Geometrically this says there is always a rectangle with the same base $[a,b]$ and some height $f(c)$ that has exactly the same area as the region under the curve. The average is not just an abstraction — it is a real, attained value.

## Key Equations

| Equation | Description |
|---|---|
| $$A(x)=\int_a^x f(t)\,dt$$ | Accumulation function with variable upper limit |
| $$A'(x)=f(x)$$ | Fundamental Theorem Part 1: slope of area equals curve height |
| $$\dfrac{d}{dx}\left(\int_a^x f(t)\,dt\right)=f(x)$$ | Leibniz-notation form of FTC Part 1 |
| $$\int_a^b f(x)\,dx = F(b)-F(a)$$ | Fundamental Theorem Part 2: evaluate via antiderivative |
| $$A(x+dx)-A(x)\approx f(x)\cdot dx$$ | Thin-sliver approximation driving the geometric proof |
| $$A'(x)=\lim_{dx\to 0}\dfrac{A(x+dx)-A(x)}{dx}=f(x)$$ | Derivative definition applied to the sliver argument |
| $$\dfrac{1}{b-a}\int_a^b f(x)\,dx$$ | Average value of $f$ over $[a,b]$ |
| $$\int_a^b f(x)\,dx=f(c)\cdot(b-a)$$ | Mean Value Theorem for Integrals: $c$ exists in $[a,b]$ |

## Connections

- **Previous:** Ch 8 (Integrals) introduced Riemann sums and the definite integral as accumulated area; this chapter reveals why differentiation undoes integration.
- **Next:** Ch 10 (Higher-Order Derivatives) pushes differentiation further — applying the derivative operator repeatedly — building on the idea that $A'(x) = f(x)$ is just one instance of the derivative as a tool for measuring change.


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain the thin-sliver argument in your own words: why does $A'(x) = f(x)$, and what geometric picture justifies it?
2. State both parts of the Fundamental Theorem of Calculus and explain what each part actually *lets you do* — don't just quote the formula.
3. What does the Mean Value Theorem for Integrals guarantee, and what is its geometric interpretation in terms of rectangles?

<details>
<summary>Answer Guide</summary>

1. Nudging the upper limit from $x$ to $x+dx$ adds a sliver of area approximately equal to $f(x)\cdot dx$; dividing by $dx$ and taking the limit gives $A'(x) = f(x)$ — the slope of the accumulation function equals the height of the original curve at that point.
2. Part 1 ($\frac{d}{dx}\int_a^x f(t)\,dt = f(x)$) says differentiation undoes integration, recovering the original function; Part 2 ($\int_a^b f(x)\,dx = F(b)-F(a)$) says you can evaluate any definite integral by finding an antiderivative and subtracting its endpoint values.
3. For a continuous $f$ on $[a,b]$, there exists at least one point $c \in [a,b]$ where $f(c) \cdot (b-a) = \int_a^b f(x)\,dx$ — geometrically, there is always a rectangle with base $[a,b]$ and height $f(c)$ whose area exactly equals the area under the curve.

</details>
