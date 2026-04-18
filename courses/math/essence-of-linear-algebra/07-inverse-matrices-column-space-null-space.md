---
tags: [linear-algebra, math, 3blue1brown, inverse-matrix, column-space, null-space, rank]
source: https://www.youtube.com/watch?v=uQhTuRlWMxw
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. If a matrix transformation "squishes" 3D space down to a 2D plane, what do you think happens to the inverse of that matrix — does it exist, and why or why not?
2. What do you think the "column space" of a matrix represents geometrically — where do you think its name comes from?
3. If a 3×3 matrix has rank 1, how many dimensions would you guess the null space has, and what shape would that be?

---

# Inverse Matrices, Column Space, and Null Space

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/inverse-matrices
- Video: https://www.youtube.com/watch?v=uQhTuRlWMxw
- Date: 2016-08-28

## Outline
1. [Linear Systems as Transformation Problems](#linear-systems-as-transformation-problems)
2. [The Inverse Matrix and Undoing Transformations](#the-inverse-matrix-and-undoing-transformations)
3. [Rank — The Dimension of the Output Space](#rank--the-dimension-of-the-output-space)
4. [Column Space — Where Vectors Can Land](#column-space--where-vectors-can-land)
5. [Null Space — Vectors That Land on the Origin](#null-space--vectors-that-land-on-the-origin)
6. [The Rank-Nullity Theorem](#the-rank-nullity-theorem)

---

## Linear Systems as Transformation Problems

A system of linear equations can always be written in matrix form as $A\vec{x} = \vec{v}$, where $A$ is the transformation matrix, $\vec{x}$ is the unknown input vector, and $\vec{v}$ is the known output vector. The question shifts from "solve this system of equations" to "find the input vector $\vec{x}$ that lands on $\vec{v}$ after applying transformation $A$."

This geometric reframing unifies all linear systems. Rather than manipulating rows of numbers, we ask: what vector gets sent to $\vec{v}$ by the transformation $A$?

---

## The Inverse Matrix and Undoing Transformations

If the transformation $A$ does not squish space into a lower dimension — that is, $\det(A) \neq 0$ — then there exists a unique inverse transformation $A^{-1}$ that undoes $A$. Applying $A^{-1}$ to both sides of $A\vec{x} = \vec{v}$ gives $A^{-1}A\vec{x} = A^{-1}\vec{v}$. Since $A^{-1}A$ is the identity transformation (doing nothing), this simplifies to $\vec{x} = A^{-1}\vec{v}$.

Geometrically, $A^{-1}$ plays $A$ in reverse. If $A$ rotates space 90 degrees counterclockwise, then $A^{-1}$ rotates 90 degrees clockwise. If $A$ applies a shear, $A^{-1}$ applies the opposite shear.

The condition for the inverse to exist is simply $\det(A) \neq 0$. When $\det(A) = 0$, the transformation squishes space into a lower dimension and cannot be reversed — you cannot "un-squish" a plane into a volume.

---

## Rank — The Dimension of the Output Space

The **rank** of a matrix is the number of dimensions in the output of the transformation, formally the dimension of the column space: $\text{rank}(A) = \dim(\text{col}(A))$.

A $2 \times 2$ matrix has rank 2 if it maps the plane to the full plane (full rank), rank 1 if it squishes the plane to a line, and rank 0 if it collapses everything to the origin. A $3 \times 3$ matrix has rank 3 for full 3D output, rank 2 if it squishes to a plane, and rank 1 if it squishes to a line.

A matrix is called **full rank** when its rank equals the number of columns, meaning the transformation preserves the full dimensionality of the input space.

---

## Column Space — Where Vectors Can Land

The **column space** of a matrix $A$ is the set of all possible output vectors — equivalently, all linear combinations of the columns of $A$: $\text{col}(A) = \{ A\vec{x} \mid \vec{x} \in \mathbb{R}^n \}$. The columns of $A$ represent where the basis vectors land after the transformation, so the column space is the span of those landing vectors.

For the system $A\vec{x} = \vec{v}$ to have a solution, $\vec{v}$ must lie in the column space of $A$. If $\vec{v}$ is outside the column space, no input vector maps to it and the system is inconsistent. When $A$ has full rank, the column space is all of $\mathbb{R}^m$ and every $\vec{v}$ has at least one corresponding $\vec{x}$.

The column space also gives the geometric meaning of rank: rank is the dimension of the column space.

---

## Null Space — Vectors That Land on the Origin

When a transformation squishes space into fewer dimensions, an entire set of input vectors collapses to the zero vector. This set is called the **null space** (or kernel) of $A$: $\text{null}(A) = \{ \vec{x} \mid A\vec{x} = \vec{0} \}$.

For a full-rank transformation ($\det(A) \neq 0$), the only vector that lands on the origin is the zero vector itself. For a rank-2 transformation of 3D space whose output is a plane, the null space is a line — all vectors along that line get squished to the origin. For a rank-1 transformation of 3D space whose output is a line, the null space is a plane.

The null space is always a subspace: it contains the zero vector and is closed under addition and scalar multiplication. When solving $A\vec{x} = \vec{v}$ and a particular solution $\vec{x}_0$ exists, the full solution set is $\vec{x} = \vec{x}_0 + \vec{n}$ for any $\vec{n} \in \text{null}(A)$. The null space describes the freedom in the solution — how many ways there are to reach the same output.

---

## The Rank-Nullity Theorem

For an $m \times n$ matrix $A$, the rank and the dimension of the null space satisfy $\text{rank}(A) + \dim(\text{null}(A)) = n$, where $n$ is the number of columns (the dimension of the input space).

This is a conservation law for dimensions: whatever dimensionality is preserved in the output must have been "taken away" from the null space. A $3 \times 3$ matrix of rank 1 has a null space of dimension 2 (a plane), since $1 + 2 = 3$. A $3 \times 3$ matrix of rank 2 has a null space of dimension 1 (a line), since $2 + 1 = 3$.


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why $\det(A) \neq 0$ is the condition for $A^{-1}$ to exist, using the geometric idea of squishing space.
2. Describe what the column space tells you about whether the system $A\vec{x} = \vec{v}$ has a solution, and what it means when $A$ is full rank.
3. State the Rank-Nullity Theorem and explain it as a "conservation law" — what is being conserved, and walk through a concrete 3×3 example.

<details>
<summary>Answer Guide</summary>

1. When $\det(A) = 0$, the transformation squishes space into a lower dimension (e.g., a plane collapses to a line); you cannot "un-squish" a lower-dimensional output back to the original, so no inverse exists. When $\det(A) \neq 0$, the transformation is reversible and $A^{-1}$ plays $A$ in reverse (e.g., a 90° CCW rotation is undone by a 90° CW rotation).
2. For $A\vec{x} = \vec{v}$ to have a solution, $\vec{v}$ must lie in the column space of $A$ (the set of all possible outputs); if $\vec{v}$ is outside it, the system is inconsistent. When $A$ is full rank, the column space spans all of $\mathbb{R}^m$, so every $\vec{v}$ is reachable.
3. The Rank-Nullity Theorem states $\text{rank}(A) + \dim(\text{null}(A)) = n$ (number of columns): dimensions preserved in the output plus dimensions collapsed to zero must sum to the input dimension. For a $3 \times 3$ matrix of rank 2, the null space has dimension 1 (a line), since $2 + 1 = 3$.

</details>
