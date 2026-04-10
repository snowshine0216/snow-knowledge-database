---
tags: [linear-algebra, math, 3blue1brown, cramers-rule, determinant, linear-systems]
source: https://www.youtube.com/watch?v=jBsC34PxzoM
---

# Cramer's Rule, Explained Geometrically

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/cramers-rule
- Video: https://www.youtube.com/watch?v=jBsC34PxzoM
- Date: 2016-09-30

## Outline
1. [Setting Up the Problem](wiki/courses/essence-of-linear-algebra/12-cramers-rule.md#setting-up-the-problem)
2. [Encoding Coordinates as Signed Areas](wiki/courses/essence-of-linear-algebra/12-cramers-rule.md#encoding-coordinates-as-signed-areas)
3. [How Areas Transform Under a Linear Map](wiki/courses/essence-of-linear-algebra/12-cramers-rule.md#how-areas-transform-under-a-linear-map)
4. [Deriving Cramer's Rule](wiki/courses/essence-of-linear-algebra/12-cramers-rule.md#deriving-cramers-rule)
5. [Extension to Three Dimensions and Beyond](wiki/courses/essence-of-linear-algebra/12-cramers-rule.md#extension-to-three-dimensions-and-beyond)
6. [Practical Role and Limitations](wiki/courses/essence-of-linear-algebra/12-cramers-rule.md#practical-role-and-limitations)

---

## Setting Up the Problem

The goal is to solve the system $A\mathbf{x} = \mathbf{v}$, meaning: find the input vector $\mathbf{x}$ that the matrix $A$ maps to the output vector $\mathbf{v}$. The columns of $A$ are the transformed basis vectors, so $A$ encodes a linear transformation of space.

For a unique solution to exist, $A$ must be invertible — its determinant must be non-zero. When $\det(A) = 0$, the transformation squishes space into a lower dimension and the system either has no solution or infinitely many.

---

## Encoding Coordinates as Signed Areas

Before arriving at the formula, it helps to reframe what a coordinate *is* geometrically. The $x$-coordinate of a vector $\mathbf{x}$ can be read as a signed area: the parallelogram spanned by the unit basis vector $\hat{e}_1 = (1, 0)$ and $\mathbf{x}$ has a signed area equal to the $y$-component of $\mathbf{x}$. More generally, the signed area of the parallelogram formed by $\hat{e}_1$ and $\mathbf{x}$ encodes the coordinate perpendicular to $\hat{e}_1$.

This area representation is the key that makes Cramer's rule geometric rather than merely algebraic. Each unknown $x_i$ is secretly hiding inside a signed area involving $\mathbf{x}$ and a basis vector.

---

## How Areas Transform Under a Linear Map

When a matrix $A$ is applied to all of space, every area scales by exactly $\det(A)$:

$$\text{Area}(A\mathbf{u},\, A\mathbf{w}) = |\det(A)| \cdot \text{Area}(\mathbf{u},\, \mathbf{w})$$

Now apply this to the parallelogram from the previous section. The pair $(\hat{e}_1, \mathbf{x})$ gets sent to $(A\hat{e}_1, A\mathbf{x}) = (\text{col}_1(A),\, \mathbf{v})$ under the transformation. The first vector becomes the first column of $A$; the second becomes $\mathbf{v}$, since $A\mathbf{x} = \mathbf{v}$.

The signed area of the transformed parallelogram is $\det(A_x)$, where $A_x$ denotes the matrix $A$ with its first column replaced by $\mathbf{v}$. Since areas scale by $\det(A)$, the original area — which encoded $x$ — satisfies:

$$x \cdot \det(A) = \det(A_x)$$

---

## Deriving Cramer's Rule

Dividing both sides by $\det(A)$ gives the $x$-coordinate directly:

$$x = \frac{\det(A_x)}{\det(A)}$$

The same logic applies to every other coordinate. For the $i$-th unknown, form the matrix $A_{x_i}$ by replacing the $i$-th column of $A$ with $\mathbf{v}$, and the formula is:

$$x_i = \frac{\det(A_{x_i})}{\det(A)}$$

For a concrete 2×2 system $\begin{pmatrix} a & b \\ c & d \end{pmatrix}\begin{pmatrix} x \\ y \end{pmatrix} = \begin{pmatrix} e \\ f \end{pmatrix}$, the two unknowns are:

$$x = \frac{\det\begin{pmatrix} e & b \\ f & d \end{pmatrix}}{\det\begin{pmatrix} a & b \\ c & d \end{pmatrix}}, \qquad y = \frac{\det\begin{pmatrix} a & e \\ c & f \end{pmatrix}}{\det\begin{pmatrix} a & b \\ c & d \end{pmatrix}}$$

Each numerator is the "right" determinant because it is exactly the signed area of the transformed parallelogram that encodes that coordinate. The geometry makes the choice of which column to replace feel inevitable rather than arbitrary.

---

## Extension to Three Dimensions and Beyond

In three dimensions, the area argument becomes a volume argument. The coordinate $x_i$ of the unknown vector $\mathbf{x}$ can be encoded as the signed volume of a parallelepiped spanned by the two remaining basis vectors and $\mathbf{x}$ itself. Applying $A$ scales all such volumes by $\det(A)$, and the column-replacement trick still produces the matching matrix $A_{x_i}$.

The pattern generalizes cleanly to $n$ dimensions: for a system $A\mathbf{x} = \mathbf{v}$ with $A$ an $n \times n$ invertible matrix, each unknown is given by the same ratio:

$$x_i = \frac{\det(A_{x_i})}{\det(A)}$$

where $A_{x_i}$ is formed by replacing column $i$ with $\mathbf{v}$. The signed $n$-volume interpretation persists throughout.

---

## Practical Role and Limitations

Cramer's rule is almost never used for actual numerical computation. For large systems, Gaussian elimination runs in $O(n^3)$ time, while evaluating $n$ determinants of $n \times n$ matrices is far more expensive. Cramer's rule is a theoretical tool, not a computational one.

Its value lies in providing a **closed-form expression** for each variable directly in terms of determinants. This makes it useful when reasoning about solutions symbolically — for instance, in proving that solutions vary continuously with the entries of $A$ and $\mathbf{v}$, or in deriving formulas for the inverse matrix. It also reinforces the central theme running through the entire series: determinants measure signed volume scaling, and that single idea threads through how transformations, systems of equations, and solutions are all connected.
