---
tags: [linear-algebra, math, 3blue1brown, nonsquare-matrices, dimensions, linear-transformations]
source: https://www.youtube.com/watch?v=v8VSDg_WQlA
---

# Nonsquare Matrices as Transformations Between Dimensions

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/nonsquare-matrices
- Video: https://www.youtube.com/watch?v=v8VSDg_WQlA
- Date: 2016-09-01

## Outline
1. [Extending Linear Transformations Beyond Square Matrices](#extending-linear-transformations)
2. [Reading Dimensions from a Matrix's Shape](#reading-dimensions)
3. [3×2 Matrices — Mapping 2D into 3D](#3x2-matrices)
4. [2×3 Matrices — Mapping 3D Down to 2D](#2x3-matrices)
5. [1×2 Matrices — Mapping 2D onto the Number Line](#1x2-matrices)

---

## Extending Linear Transformations

Every chapter up to this point has dealt with square matrices — 2×2 transformations mapping the 2D plane to itself, or 3×3 transformations staying inside 3D space. But nothing about the definition of a linear transformation requires the input and output to share the same number of dimensions. A transformation is linear so long as grid lines remain parallel and evenly spaced, and the origin maps to the origin. Those rules say nothing about dimensionality.

The key shift in perspective is that the input space and the output space are **separate, independent spaces** — not two different views of the same space. When a transformation moves a 2D vector into a 3D result, the 2D input plane and the 3D output space are entirely distinct objects. This separation is what makes nonsquare matrices geometrically coherent rather than just algebraically awkward.

---

## Reading Dimensions from a Matrix's Shape

The shape of a matrix is a direct geometric statement. The number of **columns** equals the number of basis vectors in the input space, which is the dimension of the input. The number of **rows** equals the number of coordinates required to describe where each basis vector lands, which is the dimension of the output.

For a general $m \times n$ matrix:

$$M \in \mathbb{R}^{m \times n} : \mathbb{R}^n \to \mathbb{R}^m$$

$n$ columns mean the input lives in $\mathbb{R}^n$; $m$ rows mean the output lives in $\mathbb{R}^m$. Reading the shape gives an immediate geometric picture of the transformation before touching any of its entries.

---

## 3×2 Matrices — Mapping 2D into 3D

A 3×2 matrix has two columns and three rows. The two columns record where $\hat{\imath}$ and $\hat{\jmath}$ — the two basis vectors of the 2D input — land in 3D space, each described by three coordinates. The transformation therefore lifts every vector from a 2D input plane into 3D space:

$$M \in \mathbb{R}^{3 \times 2} : \mathbb{R}^2 \to \mathbb{R}^3$$

A concrete example: $\hat{\imath}$ lands at $(2, -1, -2)$ and $\hat{\jmath}$ lands at $(0, 1, 1)$, giving

$$M = \begin{pmatrix} 2 & 0 \\ -1 & 1 \\ -2 & 1 \end{pmatrix}$$

The set of all output vectors — the column space of $M$ — forms a 2D plane slicing through the origin of 3D space. The transformation can still be full rank: the number of dimensions in the column space equals the number of dimensions of the input space, meaning no information collapses. The output is just embedded in a higher-dimensional ambient space.

---

## 2×3 Matrices — Mapping 3D Down to 2D

A 2×3 matrix has three columns and two rows. Three columns mean the input is 3D; two rows mean each landing spot is described by only two coordinates, so the output is 2D:

$$M \in \mathbb{R}^{2 \times 3} : \mathbb{R}^3 \to \mathbb{R}^2$$

Geometrically, the transformation squashes an entire 3D space onto a 2D plane, necessarily collapsing one dimension of information in the process. Vectors that differ only in the lost dimension get mapped to the same output point. This feels geometrically uncomfortable — and that discomfort is appropriate, because information genuinely disappears. The null space of such a matrix is at least one-dimensional.

---

## 1×2 Matrices — Mapping 2D onto the Number Line

A 1×2 matrix takes 2D vectors and outputs single numbers, i.e. elements of $\mathbb{R}^1$, the number line:

$$M \in \mathbb{R}^{1 \times 2} : \mathbb{R}^2 \to \mathbb{R}^1$$

Each of the two columns has exactly one entry, recording the scalar value where each basis vector lands. The linearity criterion — parallel, evenly-spaced grid lines mapping to evenly-spaced outputs — becomes: a line of evenly-spaced dots in the 2D plane maps to evenly-spaced dots on the number line. That is precisely what a linear function of two variables does when it projects the plane onto a single axis.

This structure has a deep connection to the dot product. A 1×2 matrix acting on a 2D vector computes exactly the dot product of the matrix's single row with that vector, which is the starting point for the duality between linear functionals and vectors explored in the next chapter.
