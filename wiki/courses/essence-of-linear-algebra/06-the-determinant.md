---
tags: [linear-algebra, math, 3blue1brown, determinant]
source: https://www.youtube.com/watch?v=Ip3X9LOh-nE
---

# The Determinant

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/determinant
- Video: https://www.youtube.com/watch?v=Ip3X9LOh-nE
- Date: 2016-08-24

## Outline
1. [Area Scaling as the Core Intuition](wiki/courses/essence-of-linear-algebra/06-the-determinant.md#area-scaling-as-the-core-intuition)
2. [The 2×2 Determinant Formula](wiki/courses/essence-of-linear-algebra/06-the-determinant.md#the-2x2-determinant-formula)
3. [Determinant of Zero: Space Collapses](wiki/courses/essence-of-linear-algebra/06-the-determinant.md#determinant-of-zero-space-collapses)
4. [Negative Determinants: Orientation Flipping](wiki/courses/essence-of-linear-algebra/06-the-determinant.md#negative-determinants-orientation-flipping)
5. [The 3×3 Determinant and Volume](wiki/courses/essence-of-linear-algebra/06-the-determinant.md#the-3x3-determinant-and-volume)
6. [Determinants Compose Multiplicatively](wiki/courses/essence-of-linear-algebra/06-the-determinant.md#determinants-compose-multiplicatively)

---

## Area Scaling as the Core Intuition

A linear transformation stretches, squishes, and rotates space, but it does so uniformly — every region of the plane gets scaled by the same factor. That single scaling factor is the **determinant**. To find it, you only need to watch what happens to the unit square formed by $\hat{i}$ and $\hat{j}$, because whatever that square's area becomes, every other region scales by the same amount.

---

## The 2×2 Determinant Formula

For a matrix whose columns are $[a,\, c]$ and $[b,\, d]$, the determinant is:

$$\det\begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc$$

Geometrically, $a$ and $d$ describe how much $\hat{i}$ and $\hat{j}$ are stretched along their own axes, so when there is no shear ($b = c = 0$) the area of the resulting rectangle is simply $a \cdot d$. The $bc$ term then corrects for the overlap introduced by diagonal shearing: each shear direction independently reduces the net signed area, and subtracting their product recovers the exact parallelogram area.

---

## Determinant of Zero: Space Collapses

When $\det(M) = 0$ the transformation squishes the full plane onto a line or a single point, meaning information is irreversibly lost:

$$\det(M) = 0 \iff \text{columns of } M \text{ are linearly dependent}$$

The two column vectors have become parallel (one is a scalar multiple of the other), so the parallelogram they form has no area. In practice, checking whether a determinant is zero is a fast way to determine whether a system of linear equations has a unique solution: a zero determinant means the transformation is not invertible.

---

## Negative Determinants: Orientation Flipping

If the determinant is negative, the transformation has flipped the orientation of space — like turning a sheet of paper over. In 2D this means $\hat{j}$ has ended up to the right of $\hat{i}$ rather than to the left. The absolute value of the determinant still gives the area scale; the sign encodes orientation alone:

$$\det(M) < 0 \implies \text{orientation of space is reversed}$$

In 3D the same idea generalises via the right-hand rule: a negative determinant converts a right-handed coordinate system into a left-handed one.

---

## The 3×3 Determinant and Volume

In 3D, the determinant measures how a transformation scales volumes. The unit cube spanned by $\hat{i}$, $\hat{j}$, $\hat{k}$ becomes a parallelepiped whose signed volume equals the determinant:

$$\det\begin{pmatrix} a & b & c \\ d & e & f \\ g & h & i \end{pmatrix} = a(ei - fh) - b(di - fg) + c(dh - eg)$$

This cofactor expansion along the first row has alternating signs because each $2 \times 2$ minor measures the area of the face of the parallelepiped perpendicular to the corresponding basis direction, and the signs account for orientation. The formula looks complex but the underlying idea is identical to the 2D case: signed volume of the parallelepiped formed by the column vectors.

---

## Determinants Compose Multiplicatively

Applying transformation $A$ followed by transformation $B$ scales space first by $\det(A)$, then by $\det(B)$. The combined scale is therefore their product:

$$\det(AB) = \det(A)\,\det(B)$$

This is immediately intuitive: if $A$ doubles area and $B$ triples area, the composition sextuples area. The property holds for any number of composed transformations, and it means determinants convert matrix multiplication into ordinary scalar multiplication of scale factors.
