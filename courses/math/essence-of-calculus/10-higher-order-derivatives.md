---
tags: [calculus, math, 3blue1brown, derivative, higher-order-derivatives, concavity]
source: https://www.3blue1brown.com/lessons/higher-order-derivatives
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. In physics, what is the name for the third derivative of position with respect to time, and what does it intuitively represent?
2. What does it mean geometrically when the second derivative of a function is positive at a point?
3. If $f''(c) = 0$, can you conclude that $c$ is an inflection point? Why or why not?

---

# Chapter 10: Higher-Order Derivatives

**Source:** [Essence of Calculus – Higher-order derivatives](https://www.3blue1brown.com/lessons/higher-order-derivatives)

## Outline
- [Core Idea](#core-idea)
- [Key Concepts](#key-concepts)
- [Notation](#notation)
- [Physics: The Derivative Chain](#physics-the-derivative-chain)
- [Jerk and Why It Matters](#jerk-and-why-it-matters)
- [Concavity and Inflection Points](#concavity-and-inflection-points)
- [Key Equations](#key-equations)
- [Connections](#connections)

## Core Idea

Applying the derivative operator more than once produces higher-order derivatives that reveal progressively finer information about a function's local shape. The first derivative tells you whether the function is rising or falling and how fast. The second derivative tells you whether that rate of change is itself speeding up or slowing down — in geometric terms, whether the curve bends upward or downward. Higher derivatives capture subtler geometric and physical phenomena.

In physics this hierarchy has concrete names: position, velocity, acceleration, jerk, snap, crackle, pop. Each level is the rate of change of the previous one. Engineers and designers care deeply about the third derivative (jerk) because it determines how smoothly a force ramps up — the difference between a comfortable elevator ride and one that throws you off balance.

## Key Concepts

- **Second derivative** $f''(x)$: the derivative of $f'(x)$; measures how the rate of change is itself changing.
- **$n$-th derivative** $f^{(n)}(x)$: the result of differentiating $f$ exactly $n$ times.
- **Concavity**: the qualitative shape of the curve — concave up (bowl-shaped) when $f'' > 0$, concave down (hill-shaped) when $f'' < 0$.
- **Inflection point**: a point where concavity switches; $f''$ changes sign there, and $f''(c) = 0$ is a necessary (but not sufficient) condition.
- **Curvature**: how sharply a curve bends at a point; related to but not equal to $f''$; formally given by the curvature formula $\kappa$.

## Notation

Two notations coexist and it is useful to know both:

**Prime notation** is compact and is preferred for low orders:
$$
f'(x),\quad f''(x),\quad f'''(x),\quad f^{(4)}(x),\quad \ldots,\quad f^{(n)}(x)
$$

**Leibniz notation** makes the order explicit and is preferred in physics and differential equations:
$$
\frac{df}{dx},\quad \frac{d^2f}{dx^2},\quad \frac{d^3f}{dx^3},\quad \ldots,\quad \frac{d^n f}{dx^n}
$$

The Leibniz form $d^n f / dx^n$ is read "the $n$-th derivative of $f$ with respect to $x$." The superscript on $d^n$ counts how many times the differentiation operator is applied; it is not an exponent on the variable.

The defining recursive relationship is:

$$
f^{(n)}(x) = \frac{d}{dx}\,f^{(n-1)}(x)
$$

## Physics: The Derivative Chain

If $s(t)$ is the position of an object at time $t$, each successive derivative has a physical name:

| Derivative | Symbol | Name | Meaning |
|---|---|---|---|
| $s(t)$ | $s$ | Position | where the object is |
| $s'(t)$ | $v$ | Velocity | rate of change of position |
| $s''(t)$ | $a$ | Acceleration | rate of change of velocity |
| $s'''(t)$ | $j$ | Jerk | rate of change of acceleration |
| $s^{(4)}(t)$ | — | Snap (Jounce) | rate of change of jerk |
| $s^{(5)}(t)$ | — | Crackle | rate of change of snap |
| $s^{(6)}(t)$ | — | Pop | rate of change of crackle |

The names Snap, Crackle, and Pop are genuine physics terminology, borrowed from a breakfast cereal advertisement. They appear in aerospace and control engineering where very high-order smoothness constraints matter.

$$
v = s', \quad a = s'' = \frac{d^2s}{dt^2}, \quad j = s''' = \frac{d^3s}{dt^3}
$$

## Jerk and Why It Matters

The word "jerk" in everyday English means a sudden, sharp pull or lurch — and that intuition maps directly onto the mathematical definition.

**If jerk $= 0$:** acceleration is constant. Imagine holding your foot perfectly steady on a car's gas pedal: you feel a uniform push-back into your seat. The force on you is not changing.

**If jerk $\neq 0$:** acceleration is varying. Imagine a shaky foot on the pedal: the push-back fluctuates in strength. That fluctuating force is what passengers perceive as discomfort or instability — the physical sensation of jerk.

Two real-world examples make this vivid:

1. **Elevator design.** A poorly designed elevator that switches acceleration on and off instantly produces a large jerk — passengers feel a sharp lurch. A well-engineered elevator ramps acceleration up and down smoothly, keeping the third derivative small. The riders feel the change but it feels gradual and comfortable.

2. **Two-stage rocket.** When the first-stage fuel runs out and the second stage has not yet ignited, acceleration drops suddenly from a large positive value toward zero. That abrupt change means jerk is very large at that instant — a rapid change in the net force acting on the rocket and its payload.

The underlying physics is Newton's second law $F = ma$. If $a$ is changing, so is $F$. Jerk therefore measures how fast the net force on an object is changing:

$$
j = \frac{da}{dt} = \frac{d^3s}{dt^3} \implies \frac{dF}{dt} = m\,j
$$

## Concavity and Inflection Points

The second derivative gives the curve its local shape:

- $f''(x) > 0$: the slope $f'$ is increasing, so the curve bends upward — **concave up** (like the inside of a bowl).
- $f''(x) < 0$: the slope $f'$ is decreasing, so the curve bends downward — **concave down** (like the top of a hill).

An **inflection point** occurs where concavity reverses. A necessary condition is:

$$
f''(c) = 0 \quad \text{(necessary but not sufficient for an inflection point)}
$$

The condition is not sufficient because $f''$ could touch zero and bounce back without changing sign (as $f(x) = x^4$ does at $x=0$). You must verify that $f''$ actually changes sign across $c$.

Curvature $\kappa$ is a refined measure of bending that does not depend on the parametrization:

$$
\kappa = \frac{|f''(x)|}{\left(1 + [f'(x)]^2\right)^{3/2}}
$$

When the curve is nearly flat ($f' \approx 0$), curvature reduces to $|f''|$, so the second derivative is a good proxy for curvature in that regime.

## Key Equations

| Equation | Description |
|---|---|
| $$f^{(n)}(x)=\dfrac{d^n f}{dx^n}$$ | $n$-th derivative in both notations |
| $$f^{(n)}(x)=\dfrac{d}{dx}f^{(n-1)}(x)$$ | Recursive definition: each derivative is the derivative of the previous |
| $$v=s',\quad a=s'',\quad j=s'''$$ | Physics chain: velocity, acceleration, jerk |
| $$\dfrac{dF}{dt}=m\,j$$ | Jerk measures rate of change of force (Newton's second law) |
| $$f''(x)>0 \Rightarrow \text{concave up},\quad f''(x)<0 \Rightarrow \text{concave down}$$ | Sign of second derivative determines concavity |
| $$f''(c)=0$$ | Necessary condition for an inflection point at $c$ |
| $$\kappa=\dfrac{|f''(x)|}{\left(1+[f'(x)]^2\right)^{3/2}}$$ | Curvature of a plane curve |

## Connections

- **Previous:** Ch 9 (What Area Has to Do with Slope) established differentiation and integration as inverses; the accumulation function $A$ satisfies $A' = f$, which is itself a first-derivative relationship — higher-order derivatives extend this language.
- **Next:** Ch 11 (Taylor Series) makes essential use of all higher-order derivatives at a single point to build polynomial approximations; the coefficients $f^{(n)}(a)/n!$ encode the full local shape of the function.


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why engineers care about the third derivative (jerk) when designing elevators or rockets — what physical quantity is jerk actually measuring, and how does Newton's second law connect to it?
2. Walk through the full physics derivative chain from position to pop, naming each level and explaining what each one measures relative to the one before it.
3. Explain why $f''(c) = 0$ is necessary but not sufficient for an inflection point, and give the additional condition that must be verified.

> [!example]- Answer Guide
> #### Q1 — Jerk and Newton's Second Law
> Jerk measures how fast acceleration is changing, and since $F = ma$, a changing acceleration means a changing force — $dF/dt = mj$. An elevator that ramps acceleration gradually (small jerk) feels smooth; one that switches instantly (large jerk) produces a sharp lurch passengers feel as discomfort.
> 
> #### Q2 — Position-to-Pop Derivative Chain
> Position $s$ → velocity $s'$ (rate of change of position) → acceleration $s''$ (rate of change of velocity) → jerk $s'''$ (rate of change of acceleration) → snap $s^{(4)}$ → crackle $s^{(5)}$ → pop $s^{(6)}$; each level is the derivative of the previous one.
> 
> #### Q3 — Inflection Point Sufficiency Condition
> $f''$ could equal zero and then bounce back to the same sign without ever changing sign — as with $f(x) = x^4$ at $x = 0$. To confirm an inflection point you must verify that $f''$ actually changes sign across $c$, not merely touches zero.
