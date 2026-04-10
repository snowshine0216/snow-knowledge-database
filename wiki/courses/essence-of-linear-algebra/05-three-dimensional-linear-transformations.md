---
tags: [linear-algebra, math, 3blue1brown, 3d-transformations, matrices]
source: https://www.youtube.com/watch?v=v8VSDg_omAM
---

# Three-Dimensional Linear Transformations

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/3d-transformations
- Video: https://www.youtube.com/watch?v=v8VSDg_omAM
- Date: 2016-08-21

## Outline
1. [From 2D to 3D](wiki/courses/essence-of-linear-algebra/05-three-dimensional-linear-transformations.md#from-2d-to-3d)
2. [The 3×3 Matrix as a Compact Record](wiki/courses/essence-of-linear-algebra/05-three-dimensional-linear-transformations.md#the-3x3-matrix-as-a-compact-record)
3. [Transforming Any Vector](wiki/courses/essence-of-linear-algebra/05-three-dimensional-linear-transformations.md#transforming-any-vector)
4. [Composition and Matrix Multiplication](wiki/courses/essence-of-linear-algebra/05-three-dimensional-linear-transformations.md#composition-and-matrix-multiplication)
5. [Geometric Examples](wiki/courses/essence-of-linear-algebra/05-three-dimensional-linear-transformations.md#geometric-examples)

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
