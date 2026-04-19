---
tags: [linear-algebra, math, 3blue1brown, eigenvectors, eigenvalues, diagonalization]
source: https://www.youtube.com/watch?v=PFDu9oVAE-g
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What do you think makes a vector "special" under a linear transformation — what property distinguishes an eigenvector from any other vector?
2. If you wanted to find the eigenvalues of a 2×2 matrix, what equation or condition do you think you'd need to solve?
3. What does it mean to "diagonalize" a matrix, and why might that be useful?

---

# Eigenvectors and Eigenvalues

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/eigenvalues
- Video: https://www.youtube.com/watch?v=PFDu9oVAE-g
- Date: 2016-10-12

## Outline
1. [Vectors That Stay on Their Span](#vectors-that-stay-on-their-span)
2. [The Defining Equation](#the-defining-equation)
3. [Finding Eigenvalues — The Characteristic Polynomial](#finding-eigenvalues--the-characteristic-polynomial)
4. [Finding Eigenvectors — The Null Space](#finding-eigenvectors--the-null-space)
5. [Special Cases and Geometric Intuition](#special-cases-and-geometric-intuition)
6. [Diagonalization](#diagonalization)

---

## Vectors That Stay on Their Span

When a matrix $A$ acts on a vector $\mathbf{v}$, the typical result points in a completely different direction — vectors rotate, shear, or stretch away from their original line. But certain special vectors are different: the transformation merely scales them, leaving them on the same line through the origin. These are **eigenvectors**, and the scale factor applied to each one is its corresponding **eigenvalue**.

A concrete example makes the idea tangible. Consider a 3D rotation: almost every vector gets swept sideways, but the axis of rotation itself is unchanged — it sits there with eigenvalue $\lambda = 1$, because rotating around an axis doesn't move the axis. For a 2D shear that pushes points horizontally, vectors along the $x$-axis stay exactly on the $x$-axis; they are the only eigenvectors of that transformation.

---

## The Defining Equation

Formally, a nonzero vector $\mathbf{v}$ is an eigenvector of matrix $A$ with eigenvalue $\lambda$ if applying $A$ to $\mathbf{v}$ produces the same result as scaling $\mathbf{v}$ by the scalar $\lambda$:

$$A\mathbf{v} = \lambda\mathbf{v}$$

The eigenvalue $\lambda$ is just a number — it can be positive (stretch), between 0 and 1 (squish), negative (flip and scale), or zero (collapse to the origin). What makes the equation non-trivial is that it must hold for a nonzero vector, which forces a very specific relationship between $A$ and $\lambda$.

---

## Finding Eigenvalues — The Characteristic Polynomial

To find which values of $\lambda$ actually satisfy the eigenvector equation, rearrange so the right-hand side becomes zero. Since $\lambda\mathbf{v} = \lambda I \mathbf{v}$, subtracting gives $(A - \lambda I)\mathbf{v} = \mathbf{0}$. For a nonzero $\mathbf{v}$ to satisfy this, the matrix $(A - \lambda I)$ must be singular — it must squish space into a lower dimension — which happens precisely when its determinant is zero:

$$\det(A - \lambda I) = 0$$

This is the **characteristic equation**. Expanding the determinant yields a polynomial in $\lambda$ called the **characteristic polynomial**. For a $2 \times 2$ matrix with entries $a, b, c, d$:

$$\det\begin{pmatrix} a - \lambda & b \\ c & d - \lambda \end{pmatrix} = (a - \lambda)(d - \lambda) - bc = 0$$

This is a degree-2 polynomial in $\lambda$, and its roots are the eigenvalues. For an $n \times n$ matrix the characteristic polynomial has degree $n$, so there are up to $n$ eigenvalues counted with multiplicity. Some of those roots may be complex even when $A$ has real entries — a rotation by 90°, for instance, has no real eigenvalues at all because no nonzero real vector stays on its span under that transformation.

---

## Finding Eigenvectors — The Null Space

Once an eigenvalue $\lambda$ is known, the corresponding eigenvectors are all nonzero solutions to $(A - \lambda I)\mathbf{v} = \mathbf{0}$. This is simply finding the **null space** (kernel) of the matrix $(A - \lambda I)$. Because $\det(A - \lambda I) = 0$, the matrix is singular and the null space is guaranteed to be nontrivial — at least a line's worth of solutions exists.

The set of all eigenvectors for a given $\lambda$, together with the zero vector, forms a subspace called the **eigenspace** of $\lambda$. When an eigenvalue appears as a repeated root of the characteristic polynomial — algebraic multiplicity greater than one — the eigenspace may still have lower dimension than that multiplicity. This gap between algebraic and geometric multiplicity is precisely what can prevent a matrix from being diagonalizable.

---

## Special Cases and Geometric Intuition

Several standard transformations sharpen intuition. A pure rotation in 2D has no real eigenvectors, because every nonzero vector is swept off its span; the characteristic polynomial has only complex roots. A uniform scaling $cI$ does the opposite: every nonzero vector is an eigenvector with eigenvalue $c$, since $cI \cdot \mathbf{v} = c\mathbf{v}$ for all $\mathbf{v}$. A horizontal shear has only vectors along the $x$-axis as eigenvectors, all with $\lambda = 1$.

Projection onto a line provides a clean two-eigenvalue example: vectors on the line are unchanged ($\lambda = 1$), while vectors perpendicular to the line are annihilated ($\lambda = 0$). Reflection across a line is similar: vectors on the line have $\lambda = 1$, and vectors perpendicular to the line are flipped to give $\lambda = -1$.

---

## Diagonalization

If an $n \times n$ matrix $A$ has $n$ linearly independent eigenvectors $\mathbf{v}_1, \dots, \mathbf{v}_n$ with corresponding eigenvalues $\lambda_1, \dots, \lambda_n$, then $A$ can be **diagonalized**:

$$A = PDP^{-1}$$

where $P$ is the matrix whose columns are the eigenvectors and $D$ is the diagonal matrix of eigenvalues. Geometrically, $P^{-1}$ changes coordinates into the eigenvector basis, $D$ applies the transformation as pure scaling in that basis, and $P$ changes back to the original basis.

Diagonalization makes repeated application of the transformation dramatically simpler. Raising both sides to the $k$-th power gives $A^k = PD^kP^{-1}$, and raising a diagonal matrix to a power just raises each diagonal entry independently — far cheaper than multiplying $A$ by itself $k$ times.

A matrix is diagonalizable when it has enough linearly independent eigenvectors to fill the whole space. Having $n$ distinct eigenvalues guarantees this, since eigenvectors from distinct eigenvalues are always linearly independent. Repeated eigenvalues require checking whether each eigenspace has full dimension equal to the eigenvalue's algebraic multiplicity; if any eigenspace falls short, the matrix is not diagonalizable over the reals, though it may still admit a Jordan normal form decomposition.


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why the condition $\det(A - \lambda I) = 0$ must hold for eigenvalues to exist, and what would go wrong if it didn't.
2. Walk through the geometric intuition of what happens to eigenvectors during a 3D rotation, a 2D horizontal shear, and a projection onto a line — what are the eigenvalues in each case?
3. Explain what diagonalization ($A = PDP^{-1}$) means geometrically, and why it makes computing $A^k$ so much cheaper than repeated matrix multiplication.

> [!example]- Answer Guide
> #### Q1 — Determinant Condition for Eigenvalues
> For a nonzero eigenvector $\mathbf{v}$ to satisfy $(A - \lambda I)\mathbf{v} = \mathbf{0}$, the matrix $(A - \lambda I)$ must be singular — it must collapse space to a lower dimension — which happens precisely when its determinant is zero. If the determinant were nonzero, the matrix would be invertible and the only solution would be $\mathbf{v} = \mathbf{0}$, violating the requirement that eigenvectors be nonzero.
> #### Q2 — Eigenvectors Under Geometric Transformations
> In a 3D rotation, the rotation axis is unchanged with $\lambda = 1$; in a 2D horizontal shear, only vectors along the $x$-axis are eigenvectors with $\lambda = 1$; for projection onto a line, vectors on the line have $\lambda = 1$ and vectors perpendicular to the line are annihilated with $\lambda = 0$.
> #### Q3 — Diagonalization Geometry and Powers
> Geometrically, $P^{-1}$ changes coordinates into the eigenvector basis, $D$ applies the transformation as pure scaling in that basis, and $P$ converts back — making $A^k = PD^kP^{-1}$, where $D^k$ is computed by simply raising each diagonal entry independently, far cheaper than multiplying $A$ by itself $k$ times.
