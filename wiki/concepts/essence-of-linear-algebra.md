---
tags: [linear-algebra, math, 3blue1brown, vectors, matrices, transformations, eigenvectors]
source: https://www.3blue1brown.com/topics/linear-algebra
---

# Essence of Linear Algebra

A consolidated reference for 3Blue1Brown's 16-chapter *Essence of Linear Algebra* series, which reframes the subject around geometric intuition -- what matrices *do* to space -- rather than computational recipes.

## Vectors: Three Compatible Views

A vector can be understood as an arrow with magnitude and direction (physics), an ordered list of numbers (computer science), or any abstract object supporting addition and scalar multiplication that satisfies a set of axioms (mathematics). For this series, vectors are arrows rooted at the origin whose coordinates serve as construction instructions: move along each basis direction by the corresponding amount.

The two foundational operations -- **vector addition** (tip-to-tail) and **scalar multiplication** (stretching, shrinking, or flipping) -- are the primitives that all of linear algebra builds on.

## Span, Basis, and Linear Independence

A **linear combination** scales and adds vectors. The **span** of a set of vectors is every vector reachable through linear combinations. Two non-collinear 2D vectors span the entire plane; collinear vectors span only a line. **Linearly independent** vectors each contribute a genuinely new direction, and a **basis** is the minimal independent set that still spans the whole space.

## Linear Transformations as Matrix Actions

A [[linear transformation]] is a function that keeps grid lines parallel, evenly spaced, and the origin fixed. In 2D it is fully determined by where the two basis vectors $\hat{i}$ and $\hat{j}$ land -- those destinations become the columns of a matrix. Matrix-vector multiplication is then the linear combination of those columns weighted by the input coordinates, not an arbitrary formula to memorize.

**Matrix multiplication is composition.** Applying transformation $A$ then $B$ is equivalent to the single matrix $BA$. Order matters ($AB \neq BA$ in general) because different transformation sequences produce different geometric outcomes. Associativity holds because the sequence of operations is unchanged by grouping.

## Three-Dimensional Transformations

The 2D intuition extends directly: a 3D transformation is determined by where $\hat{i}$, $\hat{j}$, and $\hat{k}$ land, giving a $3 \times 3$ matrix. This viewpoint is central to computer graphics and robotics, where complex motions decompose into chains of simpler transforms.

## The Determinant: Measuring Scale and Orientation

The **determinant** quantifies how a transformation scales area (2D) or volume (3D). A determinant of zero means space collapses to a lower dimension. A negative determinant signals an orientation flip. Determinants multiply under composition: $\det(AB) = \det(A)\det(B)$.

## Inverse, Column Space, and Null Space

A linear system $A\vec{x} = \vec{v}$ asks: which input lands on $\vec{v}$ under transformation $A$? If $\det(A) \neq 0$, the transformation is invertible and $\vec{x} = A^{-1}\vec{v}$ is the unique solution. The **column space** (span of the columns) is the set of all reachable outputs, and its dimension is the **rank**. The **null space** (kernel) contains all inputs that map to zero, explaining non-uniqueness when the determinant vanishes.

## Nonsquare Matrices

Nonsquare matrices map between different dimensions. A $3 \times 2$ matrix embeds 2D into 3D (typically onto a plane through the origin); a $2 \times 3$ matrix projects 3D down to 2D. A $1 \times 2$ matrix maps 2D vectors to scalars -- a setup that connects directly to [[dot products]].

## Dot Products and Duality

The dot product $\vec{v} \cdot \vec{w}$ computes projection-length times reference-vector length. The key insight is **duality**: every linear map from vectors to a number corresponds to a unique "dual vector" such that applying the map equals dotting with that vector. This is why dot products are deeply linked to [[linear transformations]], not just a standalone formula.

## Cross Products

In 2D, the cross product is the signed area of the parallelogram spanned by two vectors (computed via a determinant). In 3D, it produces a vector perpendicular to both inputs with magnitude equal to that parallelogram area. The deeper explanation uses duality: the cross product is the dual vector of the linear map that outputs signed volume of the parallelepiped formed with a third vector.

## Cramer's Rule

Cramer's rule solves $A\vec{x} = \vec{b}$ by replacing columns of $A$ with $\vec{b}$ and computing determinant ratios. The geometric meaning: coordinates of the unknown vector correspond to signed area/volume ratios that scale uniformly by $\det(A)$ under the transformation.

## Change of Basis

Coordinates depend on basis choice -- different bases are different "languages" for the same vectors. A change-of-basis matrix translates between languages, and the conjugation form $A^{-1}MA$ expresses a transformation as seen from a different coordinate system.

## Eigenvectors and Eigenvalues

**Eigenvectors** are the special directions that remain on their own span under a transformation -- they only get stretched or flipped, not rotated. The stretch factor is the **eigenvalue**. Solving $\det(A - \lambda I) = 0$ finds the eigenvalues; the null space of $A - \lambda I$ gives the corresponding eigenvectors. When enough eigenvectors span the space, using them as basis **diagonalizes** the matrix, making powers and compositions trivial.

For $2 \times 2$ matrices, a quick trick: eigenvalues are $m \pm \sqrt{m^2 - p}$ where $m$ is half the trace and $p$ is the determinant.

## Abstract Vector Spaces

The series closes by generalizing: vectors need not be arrows or number lists. Any objects with valid addition and scalar multiplication (including function spaces and polynomials) qualify. Even the derivative operator can be represented as a matrix. The axioms of a vector space act as an interface -- if a new system satisfies them, all of linear algebra's results transfer automatically.

## Series Arc

| Chapters | Theme |
|----------|-------|
| 1-2 | Vectors, span, basis, linear independence |
| 3-5 | Transformations, matrices, composition, 3D |
| 6-8 | Determinants, inverses, column/null space, nonsquare matrices |
| 9-11 | Dot products, cross products, duality |
| 12-13 | Cramer's rule, change of basis |
| 14-15 | Eigenvectors, eigenvalues, diagonalization |
| 16 | Abstract vector spaces |
