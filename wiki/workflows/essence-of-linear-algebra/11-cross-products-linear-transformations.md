---
tags: [linear-algebra, math, 3blue1brown, cross-product, duality, linear-transformations]
source: https://www.youtube.com/watch?v=BaM7OCEm3G0
---

# Cross Products in the Light of Linear Transformations

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/cross-products-extended
- Video: https://www.youtube.com/watch?v=BaM7OCEm3G0
- Date: 2016-09-16

## Outline
1. [Recap — the Cross Product as Signed Area and Direction](#recap)
2. [The Determinant Function is Linear in v](#determinant-function)
3. [Duality — Every Linear Map from 3D to ℝ is a Dot Product](#duality)
4. [The Cross Product Defined Through Duality](#cross-product-via-duality)
5. [Computing the Cross Product via the Symbolic Determinant Trick](#symbolic-determinant)
6. [Why the Cross Product is Perpendicular to Both Inputs](#perpendicularity)
7. [The Broader Lesson — Duality as a Recurring Theme](#broader-lesson)

---

## Recap — the Cross Product as Signed Area and Direction

The cross product of two 3D vectors **w₁** and **w₂** produces a vector **p** = **w₁** × **w₂** that is perpendicular to both. Its magnitude equals the area of the parallelogram spanned by the two inputs, and its direction follows the right-hand rule: point the fingers of the right hand along **w₁**, curl them toward **w₂**, and the thumb points in the direction of **p**. Swapping the order of the inputs flips the sign — the cross product is anti-commutative.

This geometric picture is intuitive, but it does not explain *why* the determinant formula computes it. That explanation requires thinking about the cross product as a consequence of duality.

---

## The Determinant Function is Linear in v

Fix two vectors **w₁** and **w₂** in 3D space and define a function of a variable vector **v** = (vₓ, v_y, v_z) by slotting it into the first column of a 3×3 determinant:

$$f(\mathbf{v}) = \det\!\begin{bmatrix} v_x & w_{1x} & w_{2x} \\ v_y & w_{1y} & w_{2y} \\ v_z & w_{1z} & w_{2z} \end{bmatrix}$$

Geometrically, this determinant equals the signed volume of the parallelepiped formed by **v**, **w₁**, and **w₂**. Algebraically, because the determinant is linear in each of its columns, *f* is a linear function of **v**: f(a**v** + b**u**) = a·f(**v**) + b·f(**u**) for any scalars *a*, *b* and vectors **v**, **u**.

This linearity is the key fact. It means *f* is not some arbitrary real-valued function of **v** — it is a linear functional, and linear functionals in finite-dimensional spaces have a very special structure.

---

## Duality — Every Linear Map from 3D to ℝ is a Dot Product

There is a deep symmetry between linear transformations from 3D space to the real line and vectors in 3D space itself. Any linear function *L* : ℝ³ → ℝ can be written as a dot product with some unique vector **p**:

$$L(\mathbf{v}) = \mathbf{p} \cdot \mathbf{v}$$

To find **p**, evaluate *L* on each standard basis vector in turn — the components of **p** are simply L(**î**), L(**ĵ**), and L(**k̂**). This one-to-one correspondence between linear functionals and vectors is called **duality**, and it holds in any finite-dimensional inner product space.

The geometric intuition is that projecting onto a vector and then scaling is the most general thing a linear map from a vector space to its scalar field can do. There is no room for anything more exotic in finite dimensions.

---

## The Cross Product Defined Through Duality

Because f(**v**) = det([**v**, **w₁**, **w₂**]) is linear in **v**, the duality principle guarantees the existence of a unique vector **p** such that:

$$\mathbf{p} \cdot \mathbf{v} = \det\!\begin{bmatrix} v_x & w_{1x} & w_{2x} \\ v_y & w_{1y} & w_{2y} \\ v_z & w_{1z} & w_{2z} \end{bmatrix} \quad \text{for all } \mathbf{v}$$

That vector **p** is defined to be the cross product **w₁** × **w₂**. This is not a circular definition — it is a constructive one: the cross product is the unique vector that turns the determinant function into a dot product. All geometric properties of the cross product, including perpendicularity and the magnitude-equals-area rule, follow automatically from this definition without any coordinate-level verification.

---

## Computing the Cross Product via the Symbolic Determinant Trick

To find the components of **p** explicitly, apply the duality formula: the *i*-th component of **p** is f applied to the *i*-th standard basis vector. A compact notational shorthand achieves this in one step by placing **î**, **ĵ**, **k̂** in the first column of the determinant in place of **v**:

$$\mathbf{w_1} \times \mathbf{w_2} = \det\!\begin{bmatrix} \hat{\imath} & w_{1x} & w_{2x} \\ \hat{\jmath} & w_{1y} & w_{2y} \\ \hat{k} & w_{1z} & w_{2z} \end{bmatrix}$$

Expanding along the first column recovers the familiar component formula:

$$\mathbf{w_1} \times \mathbf{w_2} = \hat{\imath}(w_{1y}w_{2z} - w_{1z}w_{2y}) - \hat{\jmath}(w_{1x}w_{2z} - w_{1z}w_{2x}) + \hat{k}(w_{1x}w_{2y} - w_{1y}w_{2x})$$

Placing vectors in a row of a determinant alongside scalars is technically an abuse of notation, but it is a valid computational shorthand: each basis vector coefficient is precisely the value of *f* at that basis vector, which is by definition the corresponding component of the dual vector **p**.

---

## Why the Cross Product is Perpendicular to Both Inputs

The duality relation provides an immediate proof of perpendicularity that requires no component algebra. Setting **v** = **w₁**, the matrix det([**w₁**, **w₁**, **w₂**]) has two identical columns, so its determinant is zero. Therefore **p** · **w₁** = 0, meaning **p** ⊥ **w₁**. Setting **v** = **w₂** gives det([**w₂**, **w₁**, **w₂**]) = 0 by the same argument, so **p** · **w₂** = 0 and **p** ⊥ **w₂**.

Perpendicularity is not a separately checked property of the formula — it is a direct consequence of the determinant vanishing whenever two of its inputs coincide. The duality lens makes this feel inevitable rather than coincidental.

---

## The Broader Lesson — Duality as a Recurring Theme

The same principle recurs throughout mathematics: dual spaces, covariant versus contravariant tensors, the Riesz representation theorem in functional analysis, and the Hodge star operator in differential geometry all express the same fundamental idea — that a linear map from a vector space to its scalar field is equivalent to a vector in that space, once an inner product is chosen.

Recognizing the cross product as the dual vector of the determinant functional reframes the entire construction. The formula is not something to memorize; it is something to re-derive in a few lines from the definition of duality whenever needed. The deeper lesson is that many formulas that appear arbitrary at first become inevitable once the right structural lens is applied.
