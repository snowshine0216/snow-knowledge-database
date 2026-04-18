---
tags: [linear-algebra, math, 3blue1brown, span, basis-vectors, linear-combinations]
source: https://www.youtube.com/watch?v=k7RM-ot2NWY
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. In the standard 2D coordinate system, what are the two standard basis vectors $\hat{i}$ and $\hat{j}$, and what do the coordinates of a vector like $(3, -2)$ actually represent?
2. If you take two vectors $\vec{v}$ and $\vec{w}$ and form every possible combination $a\vec{v} + b\vec{w}$ for all real $a$ and $b$, what do you get — and does your answer change if the two vectors happen to point in the same direction?
3. What does it mean for a set of vectors to be "linearly independent," and why would adding a redundant vector to a set matter?

---

# Linear Combinations, Span, and Basis Vectors

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/span
- Video: https://www.youtube.com/watch?v=k7RM-ot2NWY
- Date: 2016-08-09

## Outline
1. [Coordinates as Scalars on Basis Vectors](#coordinates-as-scalars-on-basis-vectors)
2. [Linear Combinations](#linear-combinations)
3. [The Span of a Set of Vectors](#the-span-of-a-set-of-vectors)
4. [Collinear Vectors and Redundancy](#collinear-vectors-and-redundancy)
5. [Linear Dependence vs. Linear Independence](#linear-dependence-vs-linear-independence)
6. [Basis Vectors and the Definition of a Basis](#basis-vectors-and-the-definition-of-a-basis)

---

## Coordinates as Scalars on Basis Vectors

In the standard 2D coordinate system there are two special unit vectors: $\hat{i}$ (i-hat) pointing in the positive x-direction and $\hat{j}$ (j-hat) pointing in the positive y-direction.

$$
\hat{i} = \begin{bmatrix} 1 \\ 0 \end{bmatrix}, \quad \hat{j} = \begin{bmatrix} 0 \\ 1 \end{bmatrix}
$$

The coordinates of any vector are really scaling instructions applied to these two basis vectors. The vector $(3, -2)$, for example, means: scale $\hat{i}$ by 3 and scale $\hat{j}$ by $-2$, then add the results.

$$
\vec{v} = x\,\hat{i} + y\,\hat{j} = x\begin{bmatrix} 1 \\ 0 \end{bmatrix} + y\begin{bmatrix} 0 \\ 1 \end{bmatrix} = \begin{bmatrix} x \\ y \end{bmatrix}
$$

- $x, y$: scalar coordinates, acting as multipliers on the respective basis vectors
- $\hat{i}, \hat{j}$: standard basis vectors defining the axes of the coordinate system

This reframing reveals that every pair of numbers in 2D is secretly a description of a linear combination of the two basis vectors.

---

## Linear Combinations

A linear combination of two vectors $\vec{v}$ and $\vec{w}$ is any vector of the form $a\,\vec{v} + b\,\vec{w}$, where $a$ and $b$ are freely chosen scalars.

$$
a\,\vec{v} + b\,\vec{w}
$$

- $\vec{v}, \vec{w}$: the two vectors being combined
- $a, b \in \mathbb{R}$: scalar multipliers, ranging freely over all real numbers

By varying both scalars across all real numbers, the resulting set of vectors can be the entire plane or some restricted subset of it, depending on the geometry of $\vec{v}$ and $\vec{w}$. The word "linear" reflects the fact that if one scalar is fixed while the other varies, the tip of the resulting vector traces a straight line through space.

---

## The Span of a Set of Vectors

The span of vectors $\vec{v}$ and $\vec{w}$ is the set of all vectors reachable by taking their linear combinations — every possible output of $a\,\vec{v} + b\,\vec{w}$ as $a$ and $b$ range over all real numbers.

$$
\text{Span}(\vec{v},\, \vec{w}) = \{ a\,\vec{v} + b\,\vec{w} \mid a, b \in \mathbb{R} \}
$$

- $a, b \in \mathbb{R}$: scalars ranging over all real numbers

For most pairs of 2D vectors the span is the entire 2D plane — the two vectors together cover all of 2D space. In 3D, however, the span of two non-collinear vectors is only a flat plane slicing through the origin, not the full 3D space. Adding a third vector that does not lie in that plane extends the span to all of $\mathbb{R}^3$.

---

## Collinear Vectors and Redundancy

When two vectors point in the same direction — or exactly opposite directions — they are said to be collinear. Scaling one is equivalent to scaling the other, so the second vector contributes no new reach. The span collapses from a plane down to a single line through the origin.

$$
\vec{w} = c\,\vec{v} \quad \text{for some scalar } c \in \mathbb{R}
$$

- $c$: the scalar that expresses $\vec{w}$ entirely in terms of $\vec{v}$

Adding further vectors that all lie along the same line continues to contribute nothing new to the span. This redundancy is the geometric intuition behind the algebraic concept of linear dependence.

---

## Linear Dependence vs. Linear Independence

A set of vectors is **linearly dependent** if at least one vector in the set can be expressed as a linear combination of the others — it is redundant in the sense that removing it does not shrink the span. A set is **linearly independent** if no vector can be written as a combination of the rest; each one genuinely adds a new direction.

In 2D, two vectors are linearly dependent exactly when they are collinear: one is a scalar multiple of the other, and their span is only a line rather than the full plane. In 3D, three vectors are linearly dependent when the third lies in the plane already spanned by the first two. Linear independence is the condition that guarantees each vector stretches the reachable space as far as possible.

---

## Basis Vectors and the Definition of a Basis

The **basis** of a vector space is a set of linearly independent vectors whose span equals the full space. These two requirements — independence and spanning — are both necessary. Independence ensures no vector is redundant; spanning ensures no direction in the space is missed.

The standard basis in 2D is $\{\hat{i},\, \hat{j}\}$, the two unit vectors along the x- and y-axes, but any two linearly independent vectors can serve as a basis for 2D space. Choosing a different basis changes the coordinate numbers used to describe a vector even though the underlying geometric object does not change. The basis is the implicit scaffolding behind every coordinate system: the numbers we call "coordinates" are always scalar multipliers relative to some chosen basis.


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why the coordinates of any 2D vector are really "scaling instructions" — what exactly are they scaling, and how does that connect to the formula $\vec{v} = x\hat{i} + y\hat{j}$?
2. Describe what happens to the span of two vectors when they are collinear, and explain the geometric reason why the second vector contributes nothing new to the reachable set.
3. A basis requires two properties simultaneously. Name both, explain what each one prevents if it were missing, and give an example of a valid basis for 2D space other than $\{\hat{i}, \hat{j}\}$.

<details>
<summary>Answer Guide</summary>

1. The coordinates $x$ and $y$ are scalar multipliers applied to $\hat{i}$ and $\hat{j}$ respectively; the vector $(3, -2)$ means scale $\hat{i}$ by 3 and $\hat{j}$ by $-2$ then add the results, so every pair of coordinates is secretly a description of a linear combination of the two basis vectors.
2. When two vectors are collinear ($\vec{w} = c\vec{v}$), scaling one is equivalent to scaling the other, so no new direction is reachable; the span collapses from the full plane down to a single line through the origin.
3. A basis must be **linearly independent** (no vector is a redundant combination of the others, so no direction is wasted) and **spanning** (every direction in the space is reachable); without independence you have redundancy, without spanning you miss directions — any two non-collinear 2D vectors, such as $\{(1,1),(1,-1)\}$, form a valid basis.

</details>
