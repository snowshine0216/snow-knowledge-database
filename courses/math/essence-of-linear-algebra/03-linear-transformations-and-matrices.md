---
tags: [linear-algebra, math, 3blue1brown, linear-transformations, matrices]
source: https://www.youtube.com/watch?v=kYB8IZa7TZ0
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What two geometric properties must hold for a transformation to be considered "linear"?
2. If you know where the basis vectors $\hat{i}$ and $\hat{j}$ land under a transformation, what can you determine about the transformation?
3. What do the columns of a 2×2 matrix represent geometrically?

---

# Linear Transformations and Matrices

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/linear-transformations
- Video: https://www.youtube.com/watch?v=kYB8IZa7TZ0
- Date: 2016-08-14

## Outline
1. [What Makes a Transformation Linear](#what-makes-a-transformation-linear)
2. [Basis Vectors Determine Everything](#basis-vectors-determine-everything)
3. [Matrices as Packaged Transformations](#matrices-as-packaged-transformations)
4. [Matrix-Vector Multiplication as a Column Combination](#matrix-vector-multiplication-as-a-column-combination)
5. [Special Cases and Geometric Intuition](#special-cases-and-geometric-intuition)
6. [Generalization to Higher Dimensions](#generalization-to-higher-dimensions)

---

## What Makes a Transformation Linear

A transformation is a function that takes an input vector and returns an output vector. The most useful way to think about it is not as a formula but as a movement: the transformation simultaneously relocates every point in space, turning each input vector into an output vector. Thinking of the entire plane "flowing" to a new configuration makes the geometry concrete.

Not every such movement qualifies as linear. Two constraints pin down exactly what linearity means. First, the origin must stay fixed — it cannot move. Second, all straight, evenly-spaced grid lines must remain straight and evenly-spaced after the transformation. The grid may rotate, shear, or scale, but it must not bend or warp. Formally, linearity is captured by the two rules:

$$T(\vec{u} + \vec{v}) = T(\vec{u}) + T(\vec{v}) \qquad T(c\vec{v}) = c\,T(\vec{v})$$

The first says that adding vectors before or after the transformation gives the same result. The second says scaling a vector before or after gives the same result. Together they guarantee that the transformation respects the linear structure of the space.

---

## Basis Vectors Determine Everything

Once you accept that grid lines stay straight and the origin stays fixed, something powerful follows. Any vector $\vec{v}$ in 2D can be written as a linear combination of the standard basis vectors $\hat{i} = (1,0)$ and $\hat{j} = (0,1)$:

$$\vec{v} = x\hat{i} + y\hat{j}$$

Because the transformation preserves addition and scalar multiplication, knowing where $\hat{i}$ and $\hat{j}$ land is sufficient to determine where every other vector lands:

$$T(\vec{v}) = x\,T(\hat{i}) + y\,T(\hat{j})$$

This is the most powerful consequence of linearity. A transformation that acts on infinitely many vectors is completely encoded by just two output vectors — the images of the two basis vectors. Everything else follows automatically from those two pieces of information.

---

## Matrices as Packaged Transformations

Since $T(\hat{i})$ and $T(\hat{j})$ tell us everything, it is natural to record them side by side. That is exactly what a matrix is: the two transformed basis vectors stored as columns.

$$M = \begin{bmatrix} a & b \\ c & d \end{bmatrix}$$

Here column 1, $(a, c)$, is where $\hat{i}$ lands, and column 2, $(b, d)$, is where $\hat{j}$ lands. Reading a matrix is therefore reading a transformation: the left column says "i-hat goes here," the right column says "j-hat goes here." Different matrices encode different geometric actions — rotations, reflections, shears, scalings, and projections all have their own characteristic column patterns.

---

## Matrix-Vector Multiplication as a Column Combination

Applying the matrix $M$ to a vector $(x, y)$ follows directly from the basis-vector formula. Substitute $T(\hat{i})$ and $T(\hat{j})$ with the matrix columns and you get a weighted sum of those columns:

$$\begin{bmatrix} a & b \\ c & d \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} = x \begin{bmatrix} a \\ c \end{bmatrix} + y \begin{bmatrix} b \\ d \end{bmatrix} = \begin{bmatrix} ax + by \\ cx + dy \end{bmatrix}$$

The row-times-column algorithm produces the same numbers, but it obscures what is happening geometrically. The column-combination view is more illuminating: scale the first column by $x$, scale the second column by $y$, and add. The result is the unique vector that linearity demands the transformation send $(x, y)$ to.

---

## Special Cases and Geometric Intuition

Two concrete examples build intuition for reading matrices as transformations.

A $90°$ counter-clockwise rotation sends $\hat{i}$ to $(0, 1)$ and $\hat{j}$ to $(-1, 0)$. Packing those destinations into columns gives the rotation matrix:

$$R_{90} = \begin{bmatrix} 0 & -1 \\ 1 & 0 \end{bmatrix}$$

A horizontal shear leaves $\hat{i}$ at $(1, 0)$ but tips $\hat{j}$ over to $(1, 1)$, producing:

$$S = \begin{bmatrix} 1 & 1 \\ 0 & 1 \end{bmatrix}$$

A degenerate but instructive case arises when the two transformed basis vectors land on the same line and are therefore linearly dependent. In that situation the matrix squishes all of 2D space onto a single line — the transformation collapses a dimension and is not invertible.

---

## Generalization to Higher Dimensions

Everything above extends cleanly to $n$ dimensions. In 3D, three basis vectors $\hat{i}$, $\hat{j}$, and $\hat{k}$ determine the transformation, and their images become the three columns of a $3 \times 3$ matrix. Matrix-vector multiplication is still a weighted sum of columns, weighted by the vector's three coordinates. The formula, the geometric interpretation, and the column-reading habit all carry over without modification. This scalability is why matrices are the universal language of linear transformations across computer graphics, physics simulations, data science, and virtually every area of applied mathematics.


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why knowing only the images of $\hat{i}$ and $\hat{j}$ is enough to determine where *every* vector in 2D space lands under a linear transformation.
2. Describe what matrix-vector multiplication is doing geometrically, using the column-combination view rather than the row-times-column algorithm.
3. Walk through the 90° counter-clockwise rotation matrix — where do $\hat{i}$ and $\hat{j}$ land, and what matrix does that produce? What happens geometrically when both basis vectors land on the same line?

> [!example]- Answer Guide
> #### Q1 — Basis Vectors Encode Full Transformation
> Any vector $\vec{v} = x\hat{i} + y\hat{j}$ can be written as a linear combination of the basis vectors. Because linearity preserves addition and scalar multiplication, $T(\vec{v}) = x\,T(\hat{i}) + y\,T(\hat{j})$ — so the two output basis vectors fully encode the entire transformation.
> #### Q2 — Column-Combination View of Multiplication
> Multiplying a matrix by $(x, y)$ scales the first column by $x$ and the second column by $y$, then adds the results; the row-times-column algorithm gives the same numbers but hides this geometric meaning.
> #### Q3 — 90° Rotation and Linear Dependence
> A 90° CCW rotation sends $\hat{i} \to (0,1)$ and $\hat{j} \to (-1,0)$, yielding $R_{90} = \begin{bmatrix}0 & -1 \\ 1 & 0\end{bmatrix}$; when both transformed basis vectors land on the same line (linearly dependent), the matrix collapses all of 2D space onto a single line and is not invertible.
