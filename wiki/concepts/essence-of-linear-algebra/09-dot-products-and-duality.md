---
tags: [linear-algebra, math, 3blue1brown, dot-product, duality]
source: https://www.youtube.com/watch?v=LyGKycYT2v0
---

# Dot Products and Duality

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/dot-products
- Video: https://www.youtube.com/watch?v=LyGKycYT2v0
- Date: 2016-09-10

## Outline
1. [Algebraic Definition](wiki/concepts/essence-of-linear-algebra/09-dot-products-and-duality.md#algebraic-definition)
2. [Geometric Interpretation via Projection](wiki/concepts/essence-of-linear-algebra/09-dot-products-and-duality.md#geometric-interpretation)
3. [Why the Symmetry Is Not a Coincidence](wiki/concepts/essence-of-linear-algebra/09-dot-products-and-duality.md#symmetry)
4. [Linear Maps to the Number Line](wiki/concepts/essence-of-linear-algebra/09-dot-products-and-duality.md#linear-maps)
5. [Duality — Vectors and Linear Maps Are the Same Thing](wiki/concepts/essence-of-linear-algebra/09-dot-products-and-duality.md#duality)

---

## Algebraic Definition

The dot product of two vectors is computed by pairing up their coordinates, multiplying each pair, and summing the results. For two vectors $\mathbf{v} = (v_1, v_2)$ and $\mathbf{w} = (w_1, w_2)$:

$$\mathbf{v} \cdot \mathbf{w} = v_1 w_1 + v_2 w_2$$

and in $n$ dimensions:

$$\mathbf{v} \cdot \mathbf{w} = v_1 w_1 + v_2 w_2 + \cdots + v_n w_n$$

The result is a single scalar, not a vector. The operation is also symmetric — $\mathbf{v} \cdot \mathbf{w} = \mathbf{w} \cdot \mathbf{v}$ — a fact that looks like a trivial consequence of commutativity of multiplication, but turns out to have a much deeper geometric reason.

---

## Geometric Interpretation via Projection

Geometrically, the dot product equals the length of the projection of $\mathbf{w}$ onto the line through $\mathbf{v}$, multiplied by the length of $\mathbf{v}$:

$$\mathbf{v} \cdot \mathbf{w} = \|\mathbf{v}\| \cdot \|\mathbf{w}\| \cos\theta$$

where $\theta$ is the angle between the two vectors.

This immediately explains the sign: if the vectors point in roughly the same direction ($\theta < 90°$) the dot product is positive; if they are perpendicular ($\theta = 90°$) it is zero; if they point in roughly opposite directions ($\theta > 90°$) it is negative. The dot product therefore encodes both the relative lengths of the two vectors and the angle between them in a single number.

---

## Why the Symmetry Is Not a Coincidence

The algebraic symmetry $\mathbf{v} \cdot \mathbf{w} = \mathbf{w} \cdot \mathbf{v}$ corresponds geometrically to the fact that projecting $\mathbf{w}$ onto $\mathbf{v}$ and scaling by $\|\mathbf{v}\|$ gives exactly the same number as projecting $\mathbf{v}$ onto $\mathbf{w}$ and scaling by $\|\mathbf{w}\|$:

$$\|\mathbf{v}\| \cdot \operatorname{proj}_{\mathbf{v}}(\mathbf{w}) = \|\mathbf{w}\| \cdot \operatorname{proj}_{\mathbf{w}}(\mathbf{v})$$

When the two vectors have equal length the picture is symmetric — neither vector is special — so the two projections are trivially equal. For unequal lengths, a scaling argument preserves the equality: if you scale one vector by some constant $c$, both sides of the equation scale by the same factor $c$, so the equality is maintained. The symmetry is therefore a structural fact about the geometry, not an algebraic accident.

---

## Linear Maps to the Number Line

Consider any function that takes a 2D vector as input and outputs a single number, and that respects the two properties of linearity: it maps sums to sums, and it scales with its input. Such a function is a linear map from 2D space to 1D space (the number line). Any linear map of this kind can be encoded as a $1 \times 2$ matrix — a row vector $\begin{bmatrix} u_1 & u_2 \end{bmatrix}$ — and applying the map to a column vector is just matrix-vector multiplication:

$$\begin{bmatrix} u_1 & u_2 \end{bmatrix} \begin{bmatrix} v_1 \\ v_2 \end{bmatrix} = u_1 v_1 + u_2 v_2$$

To find this matrix concretely for a geometric transformation, track where the two basis vectors $\hat{\imath}$ and $\hat{\jmath}$ land on the number line — those two numbers become the entries of the row matrix.

---

## Duality — Vectors and Linear Maps Are the Same Thing

Start with a unit vector $\hat{\mathbf{u}}$ pointing in some direction in the plane, and define a geometric transformation: project any input vector onto the line through $\hat{\mathbf{u}}$. By the symmetry of projection, $\hat{\imath}$ (the x basis vector) projected onto $\hat{\mathbf{u}}$ lands at $\hat{u}_x$ (the x-component of $\hat{\mathbf{u}}$), and $\hat{\jmath}$ lands at $\hat{u}_y$. The $1 \times 2$ matrix encoding this transformation is therefore $\begin{bmatrix} \hat{u}_x & \hat{u}_y \end{bmatrix}$ — exactly the coordinates of $\hat{\mathbf{u}}$ written as a row. Applying it to any vector $\mathbf{v}$ gives:

$$\begin{bmatrix} \hat{u}_x & \hat{u}_y \end{bmatrix} \begin{bmatrix} v_x \\ v_y \end{bmatrix} = \hat{u}_x v_x + \hat{u}_y v_y = \hat{\mathbf{u}} \cdot \mathbf{v}$$

Matrix-vector multiplication with a row vector is identical to a dot product. For a non-unit vector $\mathbf{u}$ the same logic applies with a scaling factor, confirming that the dot product $\mathbf{u} \cdot \mathbf{v}$ always equals the action of the row matrix $\begin{bmatrix} u_1 & u_2 \end{bmatrix}$ on $\mathbf{v}$.

This is **duality**: every vector in $\mathbb{R}^n$ corresponds naturally to a unique linear map from $\mathbb{R}^n$ to $\mathbb{R}$, and vice versa. For any such linear map $L$ there exists a unique vector $\mathbf{u}$ such that:

$$L(\mathbf{v}) = \mathbf{u} \cdot \mathbf{v} \quad \text{for all } \mathbf{v} \in \mathbb{R}^n$$

Vectors and linear maps to the scalar field are two different faces of the same mathematical object. The dot product is the bridge between them, and whenever you see a $1 \times n$ row matrix acting on a column vector you can always think of it as a vector tipped on its side.
