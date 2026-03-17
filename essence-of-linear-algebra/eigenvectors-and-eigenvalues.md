# Eigenvectors and Eigenvalues

## Summary
Eigenvectors are special vectors that keep their direction under a transformation, changing only by a scalar factor. That factor is the eigenvalue. They capture the dominant directional behavior of a matrix and are central in many applications, especially when studying [[matrix-transformations]].

## Key Ideas
- For an eigenvector `v`, a matrix `A` satisfies `Av = lambda*v`.
- Eigenvalues describe scaling along eigenvector directions.
- Not every matrix has a full set of linearly independent eigenvectors, even though the underlying vectors come from spaces defined in [[vectors-and-bases]].

## Example
For a diagonal matrix `[[2, 0], [0, 3]]`, the x-axis and y-axis directions are eigenvectors. Vectors along x are scaled by `2`, and vectors along y are scaled by `3`.

## Questions
- Why do some matrices fail to have enough eigenvectors to diagonalize?
- How do eigenvalues relate to long-term dynamics in repeated transformations?

## Related Notes
- [[matrix-transformations]]
- [[vectors-and-bases]]

## References
- 3Blue1Brown: Essence of Linear Algebra (eigenvectors and eigenvalues episodes)
