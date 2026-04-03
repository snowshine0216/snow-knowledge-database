---
tags: [linear-algebra, math, 3blue1brown, eigenvalues, mental-math, trace, determinant]
source: https://www.youtube.com/watch?v=e50Bj7jn9IQ
---

# A Quick Trick for Computing Eigenvalues

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/quick-eigen
- Video: https://www.youtube.com/watch?v=e50Bj7jn9IQ
- Date: 2022-09-01

## Outline
1. [The Characteristic Polynomial for 2×2 Matrices](#the-characteristic-polynomial)
2. [Mean and Product as the Two Key Numbers](#mean-and-product)
3. [The Shortcut Formula](#the-shortcut-formula)
4. [Worked Examples](#worked-examples)
5. [Why This Works: Connection to Vieta's Formulas](#vietas-formulas)

---

## The Characteristic Polynomial for 2×2 Matrices

The eigenvalues of a matrix $A$ are the values $\lambda$ that satisfy $\det(A - \lambda I) = 0$. For a 2×2 matrix this condition expands into a quadratic whose coefficients are exactly the two most natural invariants of the matrix:

$$\lambda^2 - \operatorname{tr}(A)\,\lambda + \det(A) = 0$$

The trace $\operatorname{tr}(A)$ is the sum of the diagonal entries, and $\det(A)$ is the determinant. No matter what values sit in the off-diagonal positions, these two quantities are the only inputs the characteristic polynomial needs. This is always true — for any real or complex 2×2 matrix.

---

## Mean and Product as the Two Key Numbers

Vieta's formulas say that for a monic quadratic $(\lambda - \lambda_1)(\lambda - \lambda_2) = \lambda^2 - (\lambda_1 + \lambda_2)\lambda + \lambda_1\lambda_2$, the coefficient of $\lambda$ is the negative sum of the roots and the constant term is their product. Comparing with the characteristic polynomial immediately gives:

$$\lambda_1 + \lambda_2 = \operatorname{tr}(A), \qquad \lambda_1 \lambda_2 = \det(A)$$

Define $m = \operatorname{tr}(A)/2$ as the **mean** of the two eigenvalues and $p = \det(A)$ as their **product**. Two numbers whose mean and product you know are fully determined — the pair $(m, p)$ carries exactly the same information as $(\lambda_1, \lambda_2)$.

---

## The Shortcut Formula

If two numbers have mean $m$ and product $p$, they can be written as $m + d$ and $m - d$ for some offset $d$. Their product is then $(m+d)(m-d) = m^2 - d^2 = p$, so $d^2 = m^2 - p$ and $d = \sqrt{m^2 - p}$. The eigenvalues are therefore:

$$\lambda = m \pm \sqrt{m^2 - p}$$

In practice: glance at the matrix, read off the trace and determinant, halve the trace to get $m$, compute $m^2 - p$, take the square root, and add/subtract from $m$. There is no need to write out $\det(A - \lambda I)$, expand the polynomial, or factor anything. The quantity $m^2 - p$ measures how far the eigenvalues spread from their common mean — zero means a repeated eigenvalue, negative means a complex conjugate pair.

---

## Worked Examples

**Example 1** — A nearly-diagonal matrix: $A = \begin{bmatrix}3 & 1 \\ 1 & 3\end{bmatrix}$. The trace is 6 so $m = 3$; the determinant is $9 - 1 = 8$ so $p = 8$. Then $d = \sqrt{9 - 8} = 1$, giving eigenvalues $3 \pm 1 = \{4, 2\}$.

**Example 2** — A rank-deficient matrix: $A = \begin{bmatrix}2 & 1 \\ 4 & 2\end{bmatrix}$. The trace is 4 so $m = 2$; the determinant is $4 - 4 = 0$ so $p = 0$. Then $d = \sqrt{4 - 0} = 2$, giving eigenvalues $2 \pm 2 = \{4, 0\}$. The zero eigenvalue is consistent with $\det(A) = 0$, confirming the matrix is singular.

**Example 3** — A 90° rotation matrix: $A = \begin{bmatrix}0 & -1 \\ 1 & 0\end{bmatrix}$. The trace is 0 so $m = 0$; the determinant is 1 so $p = 1$. Then $d = \sqrt{0 - 1} = i$, giving eigenvalues $\pm i$. The complex result confirms that a pure rotation has no real eigenvectors — no nonzero real vector stays on its own span after a 90° turn.

**Example 4** — A symmetric matrix with spread eigenvalues: $A = \begin{bmatrix}1 & 2 \\ 2 & 1\end{bmatrix}$. The trace is 2 so $m = 1$; the determinant is $1 - 4 = -3$ so $p = -3$. Then $d = \sqrt{1 - (-3)} = \sqrt{4} = 2$, giving eigenvalues $1 \pm 2 = \{3, -1\}$.

---

## Why This Works: Connection to Vieta's Formulas

The formula $\lambda = m \pm \sqrt{m^2 - p}$ is simply the quadratic formula rewritten in terms of the mean and product of the roots rather than the usual $b$ and $c$ coefficients. The substitution $\lambda = m \pm d$ centers the quadratic at $m$ and converts it into $d^2 = m^2 - p$, which is a single arithmetic step.

More broadly, Vieta's formulas hold for any polynomial: for a degree-$n$ monic polynomial, the sum of roots equals the negative of the $x^{n-1}$ coefficient, the sum of all pairwise products equals the $x^{n-2}$ coefficient, and so on. For a 2×2 matrix, the characteristic polynomial has degree 2, so there are exactly two Vieta relations — sum and product — and those two relations happen to be the trace and determinant, the most natural scalar invariants of the matrix. The trick works precisely because the characteristic polynomial's coefficients are not arbitrary numbers but these geometrically meaningful quantities.
