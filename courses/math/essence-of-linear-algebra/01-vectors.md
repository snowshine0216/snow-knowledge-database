---
tags: [linear-algebra, math, 3blue1brown, vectors]
source: https://www.youtube.com/watch?v=fNk_zzaMoSs
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. A physicist, a computer scientist, and a mathematician each describe what a "vector" is. What definition would you expect each to give?
2. If you add two vectors $\vec{v} = [3, 1]$ and $\vec{w} = [-1, 2]$, what is the result, and how would you show this geometrically?
3. What do you predict happens to a vector when you multiply it by $-2$?

---

# Vectors, What Even Are They?

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/vectors
- Video: https://www.youtube.com/watch?v=fNk_zzaMoSs
- Date: 2016-08-05

## Outline
1. [Three Perspectives on Vectors](#three-perspectives-on-vectors)
2. [Coordinates as Instructions from the Origin](#coordinates-as-instructions-from-the-origin)
3. [Vector Addition — the Tip-to-Tail Rule](#vector-addition--the-tip-to-tail-rule)
4. [Scalar Multiplication — Stretching, Shrinking, and Flipping](#scalar-multiplication--stretching-shrinking-and-flipping)
5. [Why the Origin Matters](#why-the-origin-matters)

---

## Three Perspectives on Vectors

The word "vector" means different things depending on which field you come from, and all three views are genuinely valid. In physics, a vector is an arrow in space: it has a specific length (magnitude) and a specific direction, and you can move it anywhere in space as long as you preserve both. In computer science, a vector is an ordered list of numbers, where the length of the list tells you how many dimensions the vector lives in. In mathematics, a vector is any abstract object that can be added to another vector and scaled by a number, provided those operations obey a fixed set of axioms — the physicist's arrow and the computer scientist's list are both special cases of this more general definition.

For the purposes of linear algebra, it helps to anchor vectors to the origin of a coordinate system and to think of them simultaneously as arrows and as lists of coordinates. This dual perspective lets you move fluidly between geometric intuition and numerical calculation throughout the subject.

---

## Coordinates as Instructions from the Origin

When a vector lives in two dimensions, it is written as a vertical pair of numbers:

$$
\vec{v} = \begin{bmatrix} x \\ y \end{bmatrix}
$$

- $x$: how far to travel along the horizontal axis from the origin
- $y$: how far to travel along the vertical axis from the origin

The pair $(x, y)$ is best read as a set of instructions: start at the origin, move $x$ units horizontally, then $y$ units vertically — the tip of the arrow lands at the resulting point. In three dimensions the same idea extends to a third coordinate $z$:

$$
\vec{v} = \begin{bmatrix} x \\ y \\ z \end{bmatrix}
$$

Each coordinate is a **scalar** that stretches or shrinks a corresponding basis direction. Because every vector is rooted at the origin, the coordinate numbers unambiguously identify both a direction and a magnitude, making the representation precise.

---

## Vector Addition — the Tip-to-Tail Rule

Adding two vectors has a clean geometric interpretation: place the tail of the second vector at the tip of the first, and draw a new arrow from the tail of the first to the tip of the second. That new arrow is the sum. This captures the physical idea of two successive displacements being combined into one.

Numerically, addition is performed component-wise — each coordinate of the result is the sum of the corresponding coordinates of the two input vectors:

$$
\vec{v} + \vec{w} = \begin{bmatrix} v_1 \\ v_2 \end{bmatrix} + \begin{bmatrix} w_1 \\ w_2 \end{bmatrix} = \begin{bmatrix} v_1 + w_1 \\ v_2 + w_2 \end{bmatrix}
$$

- $v_1, v_2$: components of the first vector
- $w_1, w_2$: components of the second vector

The geometric and numeric descriptions are equivalent: following the tip-to-tail construction produces exactly the same arrow as adding the components independently.

---

## Scalar Multiplication — Stretching, Shrinking, and Flipping

Multiplying a vector by a real number — called a **scalar** — scales the vector uniformly along its own line. If the scalar is greater than one, the vector is stretched; if it is between zero and one, the vector is squished; if it is negative, the direction of the vector is reversed and its length is scaled by the absolute value of the scalar.

$$
c \cdot \vec{v} = c \begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} cx \\ cy \end{bmatrix}
$$

- $c$: the scalar (any real number)
- $x, y$: the original components of $\vec{v}$

The word "scalar" comes directly from this scaling action. Each component is multiplied independently by the same factor $c$, so the direction is either preserved or reversed while the length changes by $|c|$. The special case $c = 0$ yields the **zero vector**, which has no length and no direction:

$$
\vec{0} = \begin{bmatrix} 0 \\ 0 \end{bmatrix}
$$

---

## Why the Origin Matters

Every vector in this framework is implicitly rooted at the origin, so the coordinate numbers serve double duty: they identify both a point in space and the arrow pointing to that point from $(0, 0)$. This dual interpretation — vector as arrow versus vector as point — is useful throughout linear algebra, and context determines which view is more helpful in a given situation.

If the root were shifted away from the origin, the clean correspondence between coordinates and directions would break down: the same pair of numbers would describe a different arrow depending on where it started. Anchoring all vectors to the origin is therefore not an arbitrary convention but a foundational design choice that makes the coordinate representation unambiguous and consistent. All of linear algebra builds on this single, fixed reference point.


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain the three perspectives on vectors in your own words, and describe how they relate to each other.
2. Explain what it means to read a 2D coordinate pair as "instructions from the origin," and why anchoring vectors to the origin is a foundational design choice rather than an arbitrary convention.
3. Describe what scalar multiplication does to a vector geometrically — covering all three cases for the value of the scalar — and explain where the word "scalar" comes from.

> [!example]- Answer Guide
> #### Q1 — Three Perspectives on Vectors
> In physics a vector is an arrow with magnitude and direction (movable in space); in CS it is an ordered list of numbers whose length indicates dimensionality; in math it is any abstract object supporting addition and scaling under fixed axioms — the first two are special cases of the third. For linear algebra, treating vectors simultaneously as arrows and coordinate lists lets you move between geometric intuition and numerical calculation.
> 
> #### Q2 — Coordinates as Instructions from Origin
> Reading $(x, y)$ as instructions means: start at the origin, move $x$ units horizontally, then $y$ units vertically — the arrow's tip lands there. Anchoring all vectors to the origin is essential because shifting the root would make the same coordinate pair describe a different arrow depending on where it started, breaking the unambiguous one-to-one link between numbers and directions.
> 
> #### Q3 — Scalar Multiplication Geometric Effect
> Multiplying by a scalar $c$ scales every component by $c$: if $|c| > 1$ the vector stretches; if $0 < |c| < 1$ it shrinks; if $c < 0$ the direction reverses and the length scales by $|c|$. The word "scalar" derives directly from this scaling action; the special case $c = 0$ yields the zero vector $\vec{0}$, which has no length or direction.
