---
tags: [linear-algebra, math, 3blue1brown, change-of-basis, coordinate-systems]
source: https://www.youtube.com/watch?v=P2LTAUO1TdA
---

# Change of Basis

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/change-of-basis
- Video: https://www.youtube.com/watch?v=P2LTAUO1TdA
- Date: 2016-10-09

## Outline
1. [The Problem of Multiple Coordinate Systems](wiki/courses/essence-of-linear-algebra/13-change-of-basis.md#the-problem-of-multiple-coordinate-systems)
2. [The Basis Matrix and Translating Into Our Language](wiki/courses/essence-of-linear-algebra/13-change-of-basis.md#the-basis-matrix-and-translating-into-our-language)
3. [Translating Back with the Inverse](wiki/courses/essence-of-linear-algebra/13-change-of-basis.md#translating-back-with-the-inverse)
4. [Transforming Transformations — The Conjugation Formula](wiki/courses/essence-of-linear-algebra/13-change-of-basis.md#transforming-transformations-the-conjugation-formula)
5. [Why Conjugation Preserves Geometric Meaning](wiki/courses/essence-of-linear-algebra/13-change-of-basis.md#why-conjugation-preserves-geometric-meaning)
6. [Connection to Eigenvectors and Diagonalization](wiki/courses/essence-of-linear-algebra/13-change-of-basis.md#connection-to-eigenvectors-and-diagonalization)

---

## The Problem of Multiple Coordinate Systems

By default, we describe vectors using the standard basis: $\hat{\imath} = (1, 0)$ and $\hat{\jmath} = (0, 1)$. When we write a vector like $(3, -2)$, the two numbers implicitly mean "scale $\hat{\imath}$ by 3 and $\hat{\jmath}$ by −2." The numbers are not the vector — they are a description of the vector relative to a chosen reference frame.

Another observer — call her Jennifer — may use a completely different pair of basis vectors to describe the same geometric space. Her basis vectors $\mathbf{b}_1$ and $\mathbf{b}_2$ are, from our perspective, something like $(2, 1)$ and $(-1, 1)$: linearly independent but not aligned with our axes. A vector Jennifer calls $(1, 0)$ — meaning one unit along her first basis direction — is the very same arrow we would call $(2, 1)$.

The core challenge is translation: given a description in one coordinate language, how do you express the same geometric object in another?

---

## The Basis Matrix and Translating Into Our Language

Jennifer's basis vectors, written out in our coordinate system, form the columns of a matrix $A$. If Jennifer describes a vector with coordinates $(a, b)$ in her system, multiplying by $A$ converts it into our language:

$$v_{\text{ours}} = A \, v_{\text{jennifer}}$$

where $v_{\text{jennifer}} = (a, b)^\top$. This works because Jennifer's coordinates are just scalar weights on her basis vectors, and $A$'s columns are precisely those basis vectors expressed in our terms. The matrix $A$ is the dictionary from Jennifer's language into ours.

---

## Translating Back with the Inverse

To go in the opposite direction — given a vector in our coordinates, find the numbers Jennifer would use to describe it — apply $A^{-1}$:

$$v_{\text{jennifer}} = A^{-1} v_{\text{ours}}$$

This inverse exists exactly when Jennifer's basis vectors are linearly independent, which is the definition of a valid basis. As a concrete example, the vector we call $(3, 2)$ becomes $A^{-1}(3, 2)^\top$ in Jennifer's coordinates: the inverse undoes the column-combination that $A$ performs.

---

## Transforming Transformations — The Conjugation Formula

Suppose we have a linear transformation $M$ — a rotation, shear, or anything else — whose matrix is expressed in our coordinate system. Jennifer wants to represent this same geometric action, but entirely in her coordinate language. The translation happens in three steps: convert Jennifer's input vector into our language by multiplying by $A$, apply the transformation $M$, then convert the result back into Jennifer's language by multiplying by $A^{-1}$. Chaining these three operations gives the **conjugation formula**:

$$M_{\text{jennifer}} = A^{-1} M A$$

Reading right to left: $A$ brings a vector from Jennifer's basis into ours, $M$ applies the transformation, and $A^{-1}$ carries the result back into Jennifer's basis. The matrix $A^{-1}MA$ represents exactly the same geometric transformation as $M$ — it is simply written in a different coordinate language.

---

## Why Conjugation Preserves Geometric Meaning

Two matrices related by this conjugation relationship, $M$ and $A^{-1}MA$, are called **similar matrices**. They are two numerical descriptions of the same underlying linear transformation, one in our basis and one in Jennifer's. Because the geometry is identical, any property that is intrinsic to the transformation — rather than to the particular coordinate representation — must be the same for both. The eigenvalues, the determinant, and the trace are all preserved under change of basis. Conjugation reshuffles the numbers but leaves the essence of the transformation untouched.

---

## Connection to Eigenvectors and Diagonalization

The most powerful application of change of basis is **diagonalization**. When a transformation $M$ has enough linearly independent eigenvectors, those eigenvectors form a natural coordinate system in which $M$ acts as pure scaling along each axis. If the columns of $A$ are the eigenvectors of $M$ with corresponding eigenvalues $\lambda_1, \lambda_2, \ldots$, then:

$$A^{-1} M A = \begin{pmatrix} \lambda_1 & 0 \\ 0 & \lambda_2 \end{pmatrix}$$

In the eigenbasis, the transformation is diagonal — the simplest possible description. This is why eigenvectors matter: they reveal the coordinate system in which a transformation reduces to nothing more than stretching or compressing along independent directions. Computing powers, exponentials, or any repeated application of $M$ becomes straightforward once the matrix is diagonal, because diagonal matrices compose trivially.
