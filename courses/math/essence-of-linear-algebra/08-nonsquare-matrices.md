---
tags: [linear-algebra, math, 3blue1brown, nonsquare-matrices, dimensions, linear-transformations]
source: https://www.youtube.com/watch?v=v8VSDg_WQlA
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. For a matrix with 3 rows and 2 columns, what are the dimensions of its input space and output space?
2. What do you think happens to information when a transformation maps a higher-dimensional space into a lower-dimensional one?
3. How do you think a 1×2 matrix — one row, two columns — relates to an operation you already know from vector arithmetic?

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


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words how the shape of an $m \times n$ matrix tells you both the input dimension and the output dimension — and why each part of the shape encodes what it does.
2. Describe what happens geometrically when a 2×3 matrix transforms 3D space into 2D. Where does the "lost" dimension go, and what does that imply about the null space?
3. Explain why a 1×2 matrix acting on a 2D vector is equivalent to computing a dot product, and what geometric condition the linearity requirement imposes on this mapping.

> [!example]- Answer Guide
> #### Q1 — Matrix Shape Encodes Dimensions
> The number of **columns** equals the dimension of the input space (how many basis vectors the input has); the number of **rows** equals the dimension of the output space (how many coordinates are needed to describe where each basis vector lands). So an $m \times n$ matrix maps $\mathbb{R}^n \to \mathbb{R}^m$.
> 
> #### Q2 — 2×3 Matrix Geometric Collapse
> A 2×3 matrix squashes all of 3D space onto a 2D plane, necessarily collapsing at least one dimension of information — vectors that differ only in the lost direction map to the same output point. This means the null space is at least one-dimensional.
> 
> #### Q3 — 1×2 Matrix as Dot Product
> A 1×2 matrix has one row with two entries, and multiplying it by a 2D vector computes exactly the dot product of that row with the vector. The linearity condition requires that evenly-spaced points in the 2D plane map to evenly-spaced points on the number line — which is precisely what projecting the plane onto a single axis does.
