---
tags: [linear-algebra, math, 3blue1brown, abstract-vector-spaces, axioms, functions, vector-spaces, linear-transformations]
source: https://www.youtube.com/watch?v=TgKwz5Ikpc8
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. How many axioms does a formal vector space require, and can you name at least three of them?
2. Could a set of functions (e.g., all functions from ℝ to ℝ) ever qualify as a vector space? Why or why not?
3. The derivative operator d/dx takes a function and returns another function — does that make it a linear transformation? What properties would it need to satisfy?

---

# Abstract Vector Spaces

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/abstract-vector-spaces
- Video: https://www.youtube.com/watch?v=TgKwz5Ikpc8
- Date: 2016-10-21

## Outline
1. [The Trouble with Defining "Vector"](#the-trouble-with-defining-vector)
2. [The Eight Vector Space Axioms](#the-eight-vector-space-axioms)
3. [Functions as Vectors](#functions-as-vectors)
4. [The Derivative as a Linear Transformation](#the-derivative-as-a-linear-transformation)
5. [Polynomials as a Vector Space and the Derivative Matrix](#polynomials-as-a-vector-space-and-the-derivative-matrix)
6. [Why Abstraction Matters](#why-abstraction-matters)

---

## The Trouble with Defining "Vector"

Throughout the series, vectors have been presented as arrows rooted at the origin, described by lists of coordinates. But the real power of linear algebra does not come from arrows — it comes from the *rules* those arrows obey. The coordinate representation is just one convenient model. The question is: what minimal set of rules must a collection of objects satisfy to earn the name "vector space"?

---

## The Eight Vector Space Axioms

A vector space is a set V together with two operations — addition and scalar multiplication — satisfying eight axioms for all **u**, **v**, **w** in V and all scalars c, d in the field (typically the reals).

Closure requires that the operations stay inside the space: **u** + **v** ∈ V and c · **v** ∈ V. Addition must be commutative, **u** + **v** = **v** + **u**, and associative, (**u** + **v**) + **w** = **u** + (**v** + **w**). There must exist a zero element **0** such that **v** + **0** = **v**, and every element must have an additive inverse −**v** with **v** + (−**v**) = **0**. Finally, scalar multiplication must distribute over both vector addition and scalar addition:

$$c(\mathbf{u} + \mathbf{v}) = c\mathbf{u} + c\mathbf{v}, \qquad (c + d)\mathbf{v} = c\mathbf{v} + d\mathbf{v}$$

These eight rules are not arbitrary. They are precisely the properties that make the full toolkit of linear algebra — span, basis, linear independence, dimension, linear transformations — well-defined and useful.

---

## Functions as Vectors

Functions from the reals to the reals form a valid vector space. The two operations are defined pointwise: the sum of f and g is the function whose output at any input x is (f + g)(x) = f(x) + g(x), and scaling f by a scalar c gives (c · f)(x) = c · f(x). The zero vector in this space is the function that is identically zero everywhere.

Every one of the eight axioms is satisfied. Therefore, functions *are* vectors, and any concept defined purely from those axioms — span, basis, linear independence, dimension — applies to functions just as well as to arrows. The abstract framework does not merely describe a new example; it grants every theorem about vector spaces to functions for free.

---

## The Derivative as a Linear Transformation

A linear transformation is any map L between vector spaces satisfying additivity and scaling. For functions, the derivative operator d/dx is a linear transformation because it satisfies both:

$$\frac{d}{dx}(f + g) = \frac{df}{dx} + \frac{dg}{dx}, \qquad \frac{d}{dx}(c \cdot f) = c \cdot \frac{df}{dx}$$

These are familiar calculus rules, but viewed through the lens of linear algebra they reveal that differentiation is just another linear map — no different in kind from a rotation or projection. All theorems about linear transformations, including null spaces, column spaces, and the rank-nullity theorem, apply directly to d/dx.

---

## Polynomials as a Vector Space and the Derivative Matrix

The vector space of polynomials of degree at most n has a natural basis: the monomials {1, x, x², x³, …, xⁿ}. Every polynomial is a linear combination of these basis elements, so the space is finite-dimensional with dimension n + 1.

With this basis chosen, the derivative operator can be represented as a matrix. Applying d/dx to each basis element gives d/dx(1) = 0, d/dx(x) = 1, d/dx(x²) = 2x, d/dx(x³) = 3x², and writing the image of each basis vector as a column yields the derivative matrix for degree up to 3:

$$\left[\frac{d}{dx}\right] = \begin{bmatrix} 0 & 1 & 0 & 0 \\ 0 & 0 & 2 & 0 \\ 0 & 0 & 0 & 3 \\ 0 & 0 & 0 & 0 \end{bmatrix}$$

where the basis is ordered as (1, x, x², x³). Multiplying a polynomial's coordinate vector by this matrix is exactly the same as differentiating that polynomial. Calculus operations and matrix operations are expressions of the same underlying structure.

---

## Why Abstraction Matters

Because the definitions of linear independence, span, basis, linear transformation, null space, and eigenvector are all derived purely from the eight axioms, every theorem proved using those definitions automatically holds in *any* vector space — functions, polynomials, matrices, solutions to differential equations, and beyond.

Two consequences follow immediately. The null space of d/dx is the set of functions whose derivative is zero, namely the constant functions — a one-dimensional subspace, exactly as predicted by the rank-nullity theorem. And the language of eigenfunctions, functions f satisfying d/dx(f) = λf, mirrors the language of eigenvectors with identical theory; the solutions are f(x) = e^(λx):

$$\frac{d}{dx} f = \lambda f \implies f(x) = e^{\lambda x}$$

The point is not that arrows and functions are secretly the same thing. The point is that by identifying a common abstract structure, you do the intellectual work once and apply it everywhere. That is what abstraction is for.


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why functions from ℝ to ℝ qualify as a valid vector space. What are the two operations, and what serves as the zero vector?
2. Write out the derivative matrix for polynomials of degree ≤ 3 and explain how each column is constructed from the monomial basis {1, x, x², x³}.
3. What does it mean that the null space of d/dx is the constant functions, and which general linear algebra theorem predicts the existence and dimension of that null space?

> [!example]- Answer Guide
> #### Q1 — Functions as a Vector Space
> Functions form a vector space under pointwise addition — (f+g)(x) = f(x)+g(x) — and pointwise scalar multiplication — (c·f)(x) = c·f(x); the zero vector is the function identically equal to zero everywhere. All eight axioms are satisfied under these definitions.
> >
> #### Q2 — Derivative Matrix Column Construction
> Each column is the coordinate representation of d/dx applied to the corresponding basis element: d/dx(1)=0, d/dx(x)=1, d/dx(x²)=2x, d/dx(x³)=3x², giving the matrix with entries 1, 2, 3 on the superdiagonal and zeros elsewhere.
> >
> #### Q3 — Null Space and Rank-Nullity
> The null space of d/dx is the set of functions with zero derivative, which are exactly the constant functions — a one-dimensional subspace. This is predicted by the rank-nullity theorem, which applies to d/dx because it is a linear transformation and all theorems about linear maps hold in any vector space satisfying the eight axioms.
