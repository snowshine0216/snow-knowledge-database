
 # Essence of Linear Algebra (Chapters 1-8)

Transcript-backed summary notes from 3Blue1Brown's first eight chapters of *Essence of Linear Algebra*.
 
## Chapter 1: Vectors
Video: https://www.youtube.com/watch?v=fNk_zzaMoSs

### Key Points
- A vector can be viewed in three compatible ways: as an arrow (physics view), an ordered list of numbers (CS view), and an abstract object defined by valid addition and scalar multiplication (math view).
- In this series, vectors are treated geometrically as arrows whose tails sit at the origin, then translated into coordinates.
- Coordinates are instructions for moving along coordinate directions; in 2D each vector maps to one ordered pair, and in 3D to one ordered triplet.
- Vector addition is built from head-to-tail composition, and scalar multiplication stretches, shrinks, or flips direction.
- These two operations, addition and scalar multiplication, are the core operations that linear algebra keeps returning to.
  ![[file-20260320124618015.png]]

## Chapter 2: Linear Combinations, Span, and Basis
Video: https://www.youtube.com/watch?v=k7RM-ot2NWY

### Key Points
- Coordinates can be interpreted as scalars that scale basis vectors, so each vector is a linear combination of basis directions.
- The standard basis (for example, i-hat and j-hat) is only one choice; changing the basis changes coordinate values while describing the same geometric vector.
- The span of a set of vectors is all vectors reachable by scaling and adding those vectors.
- In 2D, two non-collinear vectors span the whole plane; collinear vectors span only a line.
- Linearly independent vectors add new dimensions to span, while linearly dependent vectors are redundant.
- A basis is the minimal "just enough" set: linearly independent vectors that still span the space.
- ![[file-20260320133405494.png]]
![[file-20260320133513930.png]]
## Chapter 3: Linear Transformations and Matrices
Video: https://www.youtube.com/watch?v=kYB8IZa5AuE

### Key Points
- A linear transformation is a vector-to-vector function that keeps lines straight and keeps the origin fixed. Specifically, after linear transformation, line of dots remains evenly spaced.
- In geometric terms, linear transformations "move space" while preserving grid parallelism and even spacing.
- A 2D linear transformation is fully determined by where it sends i-hat and j-hat.
- A matrix stores those transformed basis vectors as columns.
- Matrix-vector multiplication is not a rule to memorize blindly; it is the linear combination of matrix columns weighted by the vector's coordinates.
- If transformed basis columns are linearly dependent, the transformation collapses 2D space onto a line.
- ![[file-20260320140234057.png]]

## Chapter 4: Matrix Multiplication as Composition
Video: https://www.youtube.com/watch?v=XkY2DOUCWMU

### Key Points
- Multiplying matrices corresponds to composing linear transformations.
- The product matrix captures the same net effect as applying one transformation and then another.
- Computation follows basis tracking: apply the right matrix first, then the left matrix, to each basis vector.
- Matrix multiplication reads right-to-left in application order, matching function composition.
- Order usually matters (`AB != BA`) because different transformation orders produce different geometric results.
- Associativity is natural geometrically: applying `A`, then `B`, then `C` is the same sequence regardless of grouping.
- ![[file-20260320171900176.png]]

## Chapter 5: Three-Dimensional Linear Transformations
Video: https://www.youtube.com/watch?v=rHLEWRxRGiM

### Key Points
- The 2D transformation intuition extends directly to 3D.
- A 3D linear transformation is determined by where i-hat, j-hat, and k-hat land.
- Those three output vectors form the columns of a 3x3 matrix.
- Applying the transformation to a vector means taking the same coordinate-weighted combination of transformed basis vectors.
- Matrix multiplication in 3D still means composition of transformations.
- This viewpoint is central in areas like computer graphics and robotics, where complex motions are built from simpler transforms.

## Chapter 6: Determinant
Video: https://www.youtube.com/watch?v=Ip3X9LOh2dk

### Key Points
- The determinant measures how a linear transformation scales size: area in 2D, volume in 3D.
- In 2D, looking at what happens to the unit square gives the global area scale factor for all regions.
- `det = 0` means space is collapsed into lower dimension (line or point in 2D; plane/line/point in 3D), so size goes to zero.
- The sign of the determinant tracks orientation: negative means orientation is flipped.
- In 3D, determinant magnitude is the volume scale of the transformed unit cube (a parallelepiped).
- For a 2x2 matrix, `ad - bc` encodes this scale-and-orientation behavior, and determinants multiply under composition: `det(AB) = det(A)det(B)`.

## Chapter 7: Inverse Matrices, Column Space, and Null Space
Video: https://www.youtube.com/watch?v=uQhTuRlWMxw

### Key Points
- A linear system `Ax = v` can be interpreted as: find the input vector that lands on `v` under transformation `A`.
- If `det(A) != 0`, the transformation is invertible and there is a unique solution found via `x = A^{-1}v`.
- The inverse transformation "undoes" `A`, and satisfies `A^{-1}A = I`.
- If `det(A) = 0`, no inverse exists because collapsed dimensions cannot be uniquely "unsquished."
- The column space is the set of all outputs (span of matrix columns), and rank is its dimension.
- The null space (kernel) is the set of inputs mapping to zero; it explains non-uniqueness and homogeneous solutions.

## Chapter 8: Nonsquare Matrices
Video: https://www.youtube.com/watch?v=v8VSDg_WQlA

### Key Points
- Nonsquare matrices represent linear transformations between different input and output dimensions.
- Columns still represent where input basis vectors land; row count still gives how many coordinates describe each output.
- A 3x2 matrix maps 2D inputs to 3D outputs, typically into a plane through the origin.
- A 2x3 matrix maps 3D inputs down into 2D, which is a dimensional squish.
- A 1x2 matrix maps 2D vectors to scalars (1D outputs), a setup tied closely to dot-product intuition.
- The same linearity rules still apply: origin fixed and evenly spaced structure preserved.
