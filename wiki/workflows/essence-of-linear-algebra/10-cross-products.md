---
tags: [linear-algebra, math, 3blue1brown, cross-product, determinant, duality]
source: https://www.youtube.com/watch?v=eu6i7WJeinw
---

# Cross Products

## Metadata
- Topic page: https://www.3blue1brown.com/topics/linear-algebra
- Lesson page: https://www.3blue1brown.com/lessons/cross-products
- Video: https://www.youtube.com/watch?v=eu6i7WJeinw
- Date: 2016-09-15

## Outline
1. [The 2D Warmup: Signed Area](#the-2d-warmup-signed-area)
2. [The 3D Cross Product](#the-3d-cross-product)
3. [Right-Hand Rule](#right-hand-rule)
4. [Computing via the Determinant](#computing-via-the-determinant)
5. [Geometric Interpretation](#geometric-interpretation)
6. [Why the Formula Gives a Perpendicular Vector](#why-the-formula-gives-a-perpendicular-vector)
7. [Connection to Duality](#connection-to-duality)

---

## The 2D Warmup: Signed Area

Before introducing the full 3D operation, it helps to consider two 2D vectors $\mathbf{v} = (v_1, v_2)$ and $\mathbf{w} = (w_1, w_2)$. Their "2D cross product" is simply the determinant of the $2 \times 2$ matrix formed by placing those vectors as columns:

$$\mathbf{v} \times \mathbf{w} = \det\begin{pmatrix} v_1 & w_1 \\ v_2 & w_2 \end{pmatrix} = v_1 w_2 - v_2 w_1$$

This scalar equals the signed area of the parallelogram spanned by $\mathbf{v}$ and $\mathbf{w}$. It is positive when $\mathbf{w}$ lies counterclockwise from $\mathbf{v}$, and negative when $\mathbf{w}$ lies clockwise. The 2D case produces a single number, not a vector — which is why it is sometimes called a pseudo-cross-product. The sign encodes the relative orientation of the two vectors, a theme that carries directly into 3D.

---

## The 3D Cross Product

Given two vectors $\mathbf{v}$ and $\mathbf{w}$ in 3D space, their cross product $\mathbf{v} \times \mathbf{w}$ is a new **3D vector** — no longer a scalar. That resulting vector is perpendicular to both $\mathbf{v}$ and $\mathbf{w}$:

$$\mathbf{v} \times \mathbf{w} \perp \mathbf{v}, \qquad \mathbf{v} \times \mathbf{w} \perp \mathbf{w}$$

Its magnitude equals the area of the parallelogram spanned by $\mathbf{v}$ and $\mathbf{w}$:

$$\|\mathbf{v} \times \mathbf{w}\| = \|\mathbf{v}\| \cdot \|\mathbf{w}\| \cdot \sin\theta$$

where $\theta$ is the angle between the two vectors. Order matters: swapping the inputs flips the direction of the output, so the cross product is anti-commutative:

$$\mathbf{v} \times \mathbf{w} = -(\mathbf{w} \times \mathbf{v})$$

---

## Right-Hand Rule

To determine which of the two possible perpendicular directions the cross product points, use the right-hand rule: point the fingers of your right hand along $\mathbf{v}$, curl them toward $\mathbf{w}$, and your thumb indicates the direction of $\mathbf{v} \times \mathbf{w}$. This convention ties the cross product to the standard right-handed orientation of 3D space. As a consequence, the standard basis vectors satisfy $\hat{\imath} \times \hat{\jmath} = \hat{k}$, $\hat{\jmath} \times \hat{k} = \hat{\imath}$, and $\hat{k} \times \hat{\imath} = \hat{\jmath}$.

---

## Computing via the Determinant

To compute the cross product in coordinates, write a symbolic $3 \times 3$ matrix whose top row holds the basis vectors $\hat{\imath}$, $\hat{\jmath}$, $\hat{k}$, second row holds $\mathbf{v}$, and third row holds $\mathbf{w}$. Expanding the determinant along the top row yields:

$$\mathbf{v} \times \mathbf{w} = \det\begin{pmatrix} \hat{\imath} & \hat{\jmath} & \hat{k} \\ v_1 & v_2 & v_3 \\ w_1 & w_2 & w_3 \end{pmatrix} = \begin{pmatrix} v_2 w_3 - v_3 w_2 \\ v_3 w_1 - v_1 w_3 \\ v_1 w_2 - v_2 w_1 \end{pmatrix}$$

This is technically a notational trick — a determinant normally outputs a scalar, but here the "entries" in the top row are vectors rather than numbers, so the result is a vector whose components come from the three $2 \times 2$ sub-determinants. In practice it is one of the most reliable ways to remember and compute the cross product without memorizing the component formula directly.

---

## Geometric Interpretation

The magnitude $\|\mathbf{v} \times \mathbf{w}\|$ equals the area of the parallelogram with sides $\mathbf{v}$ and $\mathbf{w}$. This connects directly to the determinant's role in measuring area scaling: the $3 \times 3$ determinant used to compute the cross product encodes a 2D area embedded in 3D space.

When $\mathbf{v}$ and $\mathbf{w}$ are parallel ($\theta = 0°$ or $180°$), the parallelogram collapses and the cross product is the zero vector. When they are perpendicular ($\theta = 90°$), the sine factor equals 1 and the magnitude simplifies to $\|\mathbf{v}\| \cdot \|\mathbf{w}\|$ — their areas multiply cleanly with no angular penalty.

---

## Why the Formula Gives a Perpendicular Vector

The formal justification for why the determinant mnemonic produces a vector perpendicular to both inputs comes from thinking about what the determinant is actually computing. Consider treating the top row not as fixed basis vectors but as a variable vector $\mathbf{x} = (x, y, z)$. The determinant then becomes a function of $\mathbf{x}$:

$$f(\mathbf{x}) = \det\begin{pmatrix} x & v_1 & w_1 \\ y & v_2 & w_2 \\ z & v_3 & w_3 \end{pmatrix}$$

This function measures the signed volume of the parallelepiped with edges $\mathbf{x}$, $\mathbf{v}$, and $\mathbf{w}$, and it is linear in $\mathbf{x}$. By the duality principle, every linear function from 3D space to the real line can be represented as a dot product with some fixed vector $\mathbf{p}$:

$$f(\mathbf{x}) = \mathbf{p} \cdot \mathbf{x}$$

For $f(\mathbf{p}) = \mathbf{p} \cdot \mathbf{p}$ to be consistent with $f$ measuring volume, $\mathbf{p}$ must be perpendicular to both $\mathbf{v}$ and $\mathbf{w}$ — because sliding $\mathbf{x}$ along either $\mathbf{v}$ or $\mathbf{w}$ collapses the parallelepiped to zero volume. That vector $\mathbf{p}$ is exactly $\mathbf{v} \times \mathbf{w}$.

---

## Connection to Duality

The deeper reason the cross product formula works is the duality between linear maps and vectors established in the previous chapter. There exists a linear transformation $T$ such that:

$$T(\mathbf{x}) = \det\begin{pmatrix} x_1 & v_1 & w_1 \\ x_2 & v_2 & w_2 \\ x_3 & v_3 & w_3 \end{pmatrix}$$

This is a linear function from $\mathbb{R}^3$ to $\mathbb{R}$, so by duality it corresponds to a unique vector — the one that replicates $T$ via the dot product. The cross product $\mathbf{v} \times \mathbf{w}$ is that dual vector:

$$(\mathbf{v} \times \mathbf{w}) \cdot \mathbf{x} = \det\begin{pmatrix} x_1 & v_1 & w_1 \\ x_2 & v_2 & w_2 \\ x_3 & v_3 & w_3 \end{pmatrix}$$

This is not a coincidence or a mnemonic — it is a consequence of the structure of linear algebra. The cross product is the dual vector of the volume-measuring linear map defined by $\mathbf{v}$ and $\mathbf{w}$. The entire computation, including the component formula, follows inevitably from this one fact.
