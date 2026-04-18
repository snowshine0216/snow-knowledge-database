---
tags: [linear-algebra, math, 3blue1brown, matrix-multiplication, composition]
source: https://www.youtube.com/watch?v=XxiTiMy0QKU
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. When you multiply two matrices $M_2 M_1$, which transformation is applied to a vector first — $M_1$ or $M_2$?
2. Is matrix multiplication commutative? That is, does $M_1 M_2$ always equal $M_2 M_1$?
3. What information do the columns of a 2×2 matrix encode about a linear transformation?

---

# Matrix Multiplication as Composition

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/matrix-multiplication
- Video: https://www.youtube.com/watch?v=XxiTiMy0QKU
- Date: 2016-08-17

## Outline
1. [Matrices as Transformations — Recap](#matrices-as-transformations)
2. [Composing Two Transformations](#composing-two-transformations)
3. [Deriving the Product Formula](#deriving-the-product-formula)
4. [Right-to-Left Reading Order](#right-to-left-reading-order)
5. [Non-Commutativity](#non-commutativity)
6. [Associativity Is Geometrically Obvious](#associativity)

---

## Matrices as Transformations — Recap

Every matrix encodes a linear transformation of space. The columns of the matrix record where the standard basis vectors $\hat{i}$ and $\hat{j}$ land after the transformation is applied. Because any vector can be written as a linear combination of $\hat{i}$ and $\hat{j}$, knowing where those two basis vectors go is enough to determine where every vector goes:

$$\begin{bmatrix} a & b \\ c & d \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} = x \begin{bmatrix} a \\ c \end{bmatrix} + y \begin{bmatrix} b \\ d \end{bmatrix}$$

The output is simply a linear combination of the columns of the matrix, weighted by the coordinates of the input vector.

---

## Composing Two Transformations

Applying one transformation $M_1$ and then a second transformation $M_2$ is called a **composition** of the two. The end result — rotating space, then shearing it, for example — is itself a linear transformation, so it must be encodable as a single matrix. The question is: how do you compute that combined matrix directly from $M_1$ and $M_2$?

The answer follows from the same column-tracking logic. To find the composition matrix, apply $M_1$ to each basis vector to see where it first lands, then apply $M_2$ to each of those landing spots. The final positions become the columns of the product matrix $M_2 M_1$.

---

## Deriving the Product Formula

Concretely, take $M_1 = \begin{bmatrix} e & f \\ g & h \end{bmatrix}$ and $M_2 = \begin{bmatrix} a & b \\ c & d \end{bmatrix}$. Under $M_1$, the basis vector $\hat{i}$ lands at $\begin{bmatrix} e \\ g \end{bmatrix}$ and $\hat{j}$ lands at $\begin{bmatrix} f \\ h \end{bmatrix}$. Applying $M_2$ to each of those results gives the columns of the product:

$$\begin{bmatrix} a & b \\ c & d \end{bmatrix} \begin{bmatrix} e & f \\ g & h \end{bmatrix} = \begin{bmatrix} ae + bg & af + bh \\ ce + dg & cf + dh \end{bmatrix}$$

Each column of the product is obtained by multiplying $M_2$ by the corresponding column of $M_1$. In the general case, the entry in row $i$ and column $j$ of the product $AB$ is the dot product of row $i$ of $A$ with column $j$ of $B$:

$$(AB)_{ij} = \sum_{k} A_{ik} B_{kj}$$

This formula is not an arbitrary rule — every term in it traces back to the geometric question of where a basis vector ends up.

---

## Right-to-Left Reading Order

The notation $M_2 M_1$ means "apply $M_1$ first, then $M_2$." This is read right to left, directly mirroring function-composition notation: just as $f(g(x))$ applies $g$ before $f$, writing $(M_2 M_1)\mathbf{v}$ is equivalent to $M_2(M_1 \mathbf{v})$. The transformation closest to the vector acts first.

$$(M_2 M_1)\mathbf{v} = M_2(M_1 \mathbf{v})$$

The right-to-left ordering can feel counterintuitive at first, but it is a direct consequence of the function-composition analogy rather than an independent convention to memorize.

---

## Non-Commutativity

In general, reversing the order of two matrices produces a different transformation: $M_1 M_2 \neq M_2 M_1$. This is not a pathological edge case — it reflects a genuine geometric fact. Rotating 90° and then shearing space results in a different final configuration than shearing first and then rotating. The order in which you apply spatial transformations matters, so of course the matrices encoding that order must respect the same asymmetry.

$$M_1 M_2 \neq M_2 M_1 \quad \text{(in general)}$$

---

## Associativity Is Geometrically Obvious

Even though multiplication is not commutative, it is always associative: composing three transformations in a fixed sequence gives the same result regardless of which adjacent pair you combine first.

$$(M_3 M_2) M_1 = M_3 (M_2 M_1)$$

Geometrically this is trivial: you are always applying $M_1$, then $M_2$, then $M_3$ to every vector in that order. The parentheses only change the bookkeeping — which pair of matrices you multiply together on paper first — not the actual sequence of spatial transformations being performed. Associativity therefore requires no verification from a geometric standpoint, even though confirming it numerically entry by entry demands careful algebra.


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why the formula $(AB)_{ij} = \sum_k A_{ik} B_{kj}$ is not an arbitrary rule — what geometric process does it actually describe?
2. Walk through why matrix multiplication is read right-to-left, connecting it to function-composition notation and what it means for a vector being transformed.
3. Explain why matrix multiplication is associative using geometry rather than algebra — why do parentheses not matter when composing three transformations?

<details>
<summary>Answer Guide</summary>

1. Each entry traces back to tracking where a basis vector lands: $M_1$ moves $\hat{i}$ and $\hat{j}$ to new positions, then $M_2$ is applied to those landing spots — the resulting columns form the product matrix, so every term encodes a step in that geometric chain.
2. Writing $M_2 M_1 \mathbf{v}$ mirrors $f(g(x))$: the matrix closest to the vector ($M_1$) acts first, then $M_2$ acts on the result — the right-to-left order is a direct consequence of function-composition notation, not an independent convention.
3. The sequence of spatial transformations ($M_1$, then $M_2$, then $M_3$) is fixed regardless of which adjacent pair you multiply first on paper; parentheses only change the bookkeeping order, not the actual order transformations are applied to every vector.

</details>
