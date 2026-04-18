---
tags: [linear-algebra, math, 3blue1brown, 3d-transformations, matrices]
source: https://www.youtube.com/watch?v=v8VSDg_omAM
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. In 2D, a linear transformation is fully determined by where the two basis vectors $\hat{i}$ and $\hat{j}$ land. How many basis vectors are needed to fully determine a 3D linear transformation, and what are they?
2. A 3×3 matrix has nine entries. What geometric information do those nine entries encode about a linear transformation?
3. If you apply transformation $M_1$ first, then $M_2$, how do you write the composed transformation as a matrix product — and does the order matter?

---

# Three-Dimensional Linear Transformations

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/3d-transformations
- Video: https://www.youtube.com/watch?v=v8VSDg_omAM
- Date: 2016-08-21

## Outline
1. [From 2D to 3D](#from-2d-to-3d)
2. [The 3×3 Matrix as a Compact Record](#the-3x3-matrix-as-a-compact-record)
3. [Transforming Any Vector](#transforming-any-vector)
4. [Composition and Matrix Multiplication](#composition-and-matrix-multiplication)
5. [Geometric Examples](#geometric-examples)

---

## From 2D to 3D

The ideas established for 2D linear transformations carry over to three dimensions without any conceptual change. A linear transformation still means: grid lines remain parallel and evenly spaced, and the origin stays fixed. The only difference is that there are now three basis vectors instead of two — $\hat{i} = (1,0,0)$, $\hat{j} = (0,1,0)$, and $\hat{k} = (0,0,1)$ — and a transformation is fully determined by where those three vectors land.

Any vector $(x, y, z)$ in 3D space is a linear combination of the basis vectors:

$$\begin{bmatrix} x \\ y \\ z \end{bmatrix} = x\,\hat{i} + y\,\hat{j} + z\,\hat{k}$$

Because linearity is preserved, once you know where $\hat{i}$, $\hat{j}$, and $\hat{k}$ land, you know where every vector lands.

---

## The 3×3 Matrix as a Compact Record

A 3×3 matrix is nothing more than a compact way to record the landing spots of the three basis vectors, arranged as columns:

$$M = \begin{bmatrix} | & | & | \\ T(\hat{i}) & T(\hat{j}) & T(\hat{k}) \\ | & | & | \end{bmatrix}$$

where $T(\hat{i})$, $T(\hat{j})$, and $T(\hat{k})$ are each three-component column vectors. The nine entries of the matrix encode the complete description of the transformation — no more information is needed.

---

## Transforming Any Vector

To find where a transformation $M$ sends a vector $(x, y, z)$, scale each column by the corresponding coordinate and sum the results:

$$\begin{bmatrix} a & b & c \\ d & e & f \\ g & h & i \end{bmatrix} \begin{bmatrix} x \\ y \\ z \end{bmatrix} = x \begin{bmatrix} a \\ d \\ g \end{bmatrix} + y \begin{bmatrix} b \\ e \\ h \end{bmatrix} + z \begin{bmatrix} c \\ f \\ i \end{bmatrix}$$

This is the same column-scaling mechanic as in 2D — the extra dimension only adds one more column and one more coordinate to track. The conceptual operation is identical.

---

## Composition and Matrix Multiplication

Applying one 3D transformation and then another corresponds to multiplying their 3×3 matrices. If $M_1$ is applied first and $M_2$ second, the composed transformation is the product $M_2 M_1$:

$$(M_2 \circ M_1)(\vec{v}) = M_2\,(M_1\,\vec{v}) = (M_2 M_1)\,\vec{v}$$

The product is computed column by column: each column of $M_1$ is treated as a vector and transformed by $M_2$, producing the corresponding column of the result. Order matters — $M_2 M_1 \neq M_1 M_2$ in general, because applying rotations or shears in different sequences leads to different outcomes.

---

## Geometric Examples

Rotation about the z-axis by angle $\theta$ leaves $\hat{k}$ fixed while rotating $\hat{i}$ and $\hat{j}$ in the xy-plane, giving:

$$R_z(\theta) = \begin{bmatrix} \cos\theta & -\sin\theta & 0 \\ \sin\theta & \cos\theta & 0 \\ 0 & 0 & 1 \end{bmatrix}$$

Rotation about the x-axis by angle $\theta$ leaves $\hat{i}$ fixed while rotating $\hat{j}$ and $\hat{k}$ in the yz-plane:

$$R_x(\theta) = \begin{bmatrix} 1 & 0 & 0 \\ 0 & \cos\theta & -\sin\theta \\ 0 & \sin\theta & \cos\theta \end{bmatrix}$$

In both cases, the column encoding logic is the same: read off where each basis vector lands and write those coordinates as columns. Shear, scaling, and reflection in 3D all follow the same pattern — there is nothing fundamentally new. The same linear combination logic that works in 2D scales to three dimensions and, as will become clear later, to any number of dimensions.


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why knowing where $\hat{i}$, $\hat{j}$, and $\hat{k}$ land is sufficient to know where *every* vector in 3D space lands under a linear transformation.
2. Describe the column-scaling mechanic: given a 3×3 matrix $M$ and a vector $(x, y, z)$, explain step by step how you compute $M\mathbf{v}$ using the columns of $M$.
3. Using the rotation matrix $R_z(\theta)$ as a concrete example, explain how the "columns record where basis vectors land" principle produces that specific matrix — which column comes from which basis vector, and why?

<details>
<summary>Answer Guide</summary>

1. Any 3D vector $(x, y, z)$ is a linear combination $x\hat{i} + y\hat{j} + z\hat{k}$; linearity guarantees that the transformed vector equals $x\,T(\hat{i}) + y\,T(\hat{j}) + z\,T(\hat{k})$, so the three landing spots fully determine the output for every possible input.
2. Scale each column of $M$ by its corresponding coordinate — the first column by $x$, the second by $y$, the third by $z$ — then sum the three resulting vectors; this is the same column-scaling mechanic as in 2D with one additional column and coordinate.
3. $R_z(\theta)$ rotates $\hat{i}$ to $(\cos\theta, \sin\theta, 0)$ and $\hat{j}$ to $(-\sin\theta, \cos\theta, 0)$ in the xy-plane, while $\hat{k}$ stays fixed at $(0, 0, 1)$; writing these three landing spots as columns in order produces exactly the matrix shown.

</details>
