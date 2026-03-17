# Vectors and Bases

## Summary
Vectors represent quantities with direction and magnitude, and they can also be viewed as points in space. A basis is a set of vectors that can generate all vectors in the space through linear combinations. Choosing a basis defines how vectors are represented by coordinates, and this directly connects to [[matrix-transformations]].

## Key Ideas
- A vector space can be described using basis vectors.
- Coordinates depend on the chosen basis.
- Different bases can represent the same vector differently.
- Basis directions often become eigenvector directions in special cases; see [[eigenvectors-and-eigenvalues]].

## Example
In 2D, the standard basis is `(1, 0)` and `(0, 1)`. The vector `(3, 2)` means `3*(1, 0) + 2*(0, 1)`. If we choose a different basis, the same geometric vector may have different coordinate values.

## Questions
- How do I test whether a set of vectors forms a valid basis?
- What makes one basis more useful than another for a problem?

## Related Notes
- [[matrix-transformations]]
- [[eigenvectors-and-eigenvalues]]

## References
- 3Blue1Brown: Essence of Linear Algebra (vectors and span episodes)
