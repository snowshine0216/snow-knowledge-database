---
tags: [linear-algebra, math, 3blue1brown, eigenvectors, dot-product, cross-product, change-of-basis]
source: https://www.3blue1brown.com/topics/linear-algebra
---

# Essence of Linear Algebra (Chapters 9-16)

Transcript-backed summary notes from 3Blue1Brown's *Essence of Linear Algebra* chapters 9 through 16.

## Chapter 9: Dot Products and Duality
Video: https://www.youtube.com/watch?v=LyGKycYT2v0

### Key Points
- The dot product is usually introduced as coordinate-wise multiplication and sum, but its geometric meaning is projection-length times the length of the reference vector.
- Sign matters: dot products are positive for similar directions, zero for perpendicular vectors, and negative for opposite directions.
- Symmetry (`v · w = w · v`) is tied to projection geometry and scaling behavior, not just a numeric coincidence.
- A 1x2 matrix defines a linear map from 2D vectors to numbers, and this map is computationally the same form as a dot product.
- Duality viewpoint: every linear map from vectors to numbers corresponds to a unique vector such that applying the map equals taking a dot product with that vector.
- This explains why dot products are deeply linked to linear transformations, not just a standalone formula.
- The takeaway is that when you're out in the mathematical wild and you find a linear transformation to the number line, you will be able to match it to some vector, which is called the "dual vector" of the transformation, so that performing that linear transformation is the same as taking the dot product with that vector.
![[wiki/assets/essence-of-linear-algebra/chapters-9-16-key-points/file-20260321212017928.png]]
![[wiki/assets/essence-of-linear-algebra/chapters-9-16-key-points/file-20260321212041435.png]]
## Chapter 10: Cross Products
Video: https://www.youtube.com/watch?v=eu6i7WJeinw

### Key Points
- In 2D, the cross product can be viewed as the signed area of the parallelogram spanned by two vectors.
- Orientation determines sign, so order matters and swapping vectors negates the result.
- Determinants compute this signed area directly by using the two vectors as matrix columns.
- In 3D, the cross product returns a vector, not a scalar.
- The 3D cross-product vector has magnitude equal to the parallelogram area and direction perpendicular to both input vectors, chosen by the right-hand rule.
- The determinant-style computation with `i-hat`, `j-hat`, and `k-hat` is a compact symbolic method whose deeper meaning comes from duality (covered next chapter).
![[wiki/assets/essence-of-linear-algebra/chapters-9-16-key-points/file-20260329061104428.png]]
![[wiki/assets/essence-of-linear-algebra/chapters-9-16-key-points/file-20260329061112245.png]]
![[wiki/assets/essence-of-linear-algebra/chapters-9-16-key-points/file-20260329061144976.png]]

## Chapter 11: Cross Products via Linear Transformations and Duality
Video: https://www.youtube.com/watch?v=BaM7OCEm3G0

### Key Points
- The determinant trick for 3D cross products is best understood by defining a linear map that outputs signed volume.
- Fix vectors `v` and `w`, then map any vector `u` to the signed volume of the parallelepiped formed by `u`, `v`, and `w`.
- This map is linear, so by duality there exists a unique vector `p` such that `p · u` equals that signed volume for all `u`.
- Computing `p` algebraically yields the usual determinant-with-basis-symbols cross-product formula.
- Interpreting `p` geometrically shows it must be perpendicular to `v` and `w`, with magnitude equal to the area of their parallelogram.
- So the computational formula and geometric definition match because they describe the same dual vector of one linear transformation.
![[wiki/assets/essence-of-linear-algebra/chapters-9-16-key-points/file-20260329062233268.png]]

## Chapter 12: Cramer's Rule (Geometric View)
Video: https://www.youtube.com/watch?v=jBsC34PxzoM

### Key Points
- A linear system `Ax = b` asks for the input vector that maps to known output `b` under transformation `A`.
- Cramer's rule is not the fastest solver (Gaussian elimination is better), but it reveals strong geometric structure.
- Coordinates of the unknown vector can be interpreted as signed areas/volumes built with basis vectors.
- Under linear transformation, all such areas/volumes scale by the same factor: `det(A)`.
- Replacing one column of `A` with `b` creates a determinant that captures the transformed area/volume corresponding to one coordinate.
- Dividing those altered determinants by `det(A)` yields each coordinate of the solution vector.
- Orthonormal transformations. These are the ones which leave all the basis vectors perpendicular to each other with unit lengths.
![[wiki/assets/essence-of-linear-algebra/chapters-9-16-key-points/file-20260322170021261.png|472]]
![[wiki/assets/essence-of-linear-algebra/chapters-9-16-key-points/file-20260329063709631.png|463]]
![[wiki/assets/essence-of-linear-algebra/chapters-9-16-key-points/file-20260329064112238.png|687]]

## Chapter 13: Change of Basis
Video: https://www.youtube.com/watch?v=P2LTAUO1TdA

### Key Points
- Coordinates depend on basis choice; different bases are different "languages" describing the same vectors.
- A matrix with columns equal to another basis (written in your coordinates) converts vectors from that basis-language into your coordinate language.
- The inverse matrix performs the reverse translation.
- Matrix-vector multiplication here is exactly the "scale basis vectors and add" process.
- Transformations also change representation with basis changes, not just vectors.
- The conjugation form `A^{-1}MA` (or equivalent basis-change sandwich) expresses the same transformation as seen in a different coordinate system.
- ![[wiki/assets/essence-of-linear-algebra/chapters-9-16-key-points/file-20260329064718591.png]]
![[wiki/assets/essence-of-linear-algebra/chapters-9-16-key-points/file-20260323064703477.png|697]]
![[wiki/assets/essence-of-linear-algebra/chapters-9-16-key-points/file-20260324062046575.png]]
![[wiki/assets/essence-of-linear-algebra/chapters-9-16-key-points/file-20260323065250197.png]]
## Chapter 14: Eigenvectors and Eigenvalues
Video: https://www.youtube.com/watch?v=PFDu9oVAE-g

### Key Points
- Eigenvectors are directions that remain on their own span under a linear transformation.
- Eigenvalues are the stretch/squish factors on those special directions (including possible sign flips).
- Solving `Av = lambda v` is equivalent to finding `lambda` values where `det(A - lambda I) = 0`.
- Each valid `lambda` gives vectors in the null space of `A - lambda I`, which are corresponding eigenvectors.
- Some transformations have no real eigenvectors (for example, pure 2D rotation by 90 degrees).
- If enough eigenvectors span the space, using them as basis (an eigenbasis) diagonalizes the matrix and makes repeated powers/compositions much easier.
- 
![[wiki/assets/essence-of-linear-algebra/chapters-9-16-key-points/file-20260323213345109.png]]

## Chapter 15: Quick Trick for 2x2 Eigenvalues
Video: https://www.youtube.com/watch?v=e50Bj7jn9IQ

### Key Points
- For 2x2 matrices, eigenvalues can be found quickly from trace and determinant without fully expanding the characteristic polynomial each time.
- The mean of eigenvalues is half the trace.
- The product of eigenvalues is the determinant.
- If two numbers have mean `m` and product `p`, they are `m ± sqrt(m^2 - p)`.
- Combining these gives a fast mental workflow for 2x2 eigenvalues.
- This framing is also a meaningful reinterpretation of quadratic-root solving, with quantities tied directly to matrix invariants.
![[wiki/assets/essence-of-linear-algebra/chapters-9-16-key-points/file-20260329105639142.png]]

## Chapter 16: Abstract Vector Spaces
Video: https://www.youtube.com/watch?v=TgKwz5Ikpc8

### Key Points
- Vectors are not limited to arrows or coordinate lists; many mathematical objects (including functions) can be vector-like.
- What matters is having valid operations of addition and scalar multiplication.
- Linear transformations are best defined abstractly by additivity and scaling properties.
- Function spaces (for example, polynomials) can be treated with basis coordinates, and even operators like derivatives can be represented as matrices.
- This unifies familiar geometric linear algebra with broader settings like function analysis.
- Axioms for vector spaces are an interface: if a new object system satisfies them, linear algebra results apply there too.
