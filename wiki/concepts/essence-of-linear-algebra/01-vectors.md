---
tags: [linear-algebra, math, 3blue1brown, vectors]
source: https://www.youtube.com/watch?v=fNk_zzaMoSs
---

# Vectors, What Even Are They?

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/vectors
- Video: https://www.youtube.com/watch?v=fNk_zzaMoSs
- Date: 2016-08-05

## Outline
1. [Three Perspectives on Vectors](wiki/concepts/essence-of-linear-algebra/01-vectors.md#three-perspectives-on-vectors)
2. [Coordinates as Instructions from the Origin](wiki/concepts/essence-of-linear-algebra/01-vectors.md#coordinates-as-instructions-from-the-origin)
3. [Vector Addition — the Tip-to-Tail Rule](wiki/concepts/essence-of-linear-algebra/01-vectors.md#vector-addition--the-tip-to-tail-rule)
4. [Scalar Multiplication — Stretching, Shrinking, and Flipping](wiki/concepts/essence-of-linear-algebra/01-vectors.md#scalar-multiplication--stretching-shrinking-and-flipping)
5. [Why the Origin Matters](wiki/concepts/essence-of-linear-algebra/01-vectors.md#why-the-origin-matters)

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
