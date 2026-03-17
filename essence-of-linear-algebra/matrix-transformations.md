# Matrix Transformations

## Summary
A matrix can be interpreted as a linear transformation that maps input vectors to output vectors. In this view, matrix multiplication means applying one transformation after another. This geometric interpretation helps explain why order matters in matrix multiplication and builds on ideas from [[vectors-and-bases]].

## Key Ideas
- Columns of a matrix show where basis vectors are mapped from [[vectors-and-bases]].
- Matrix multiplication composes linear transformations.
- Most linear algebra operations become clearer with geometric intuition, including [[eigenvectors-and-eigenvalues]].

## Example
If a matrix stretches vectors along the x-axis and another rotates vectors, applying stretch then rotation gives a different result from rotation then stretch. This is why `AB` and `BA` are usually different.

## Questions
- How can I quickly interpret a 2x2 matrix visually?
- Which matrix patterns correspond to rotation, scaling, and shear?

## Related Notes
- [[vectors-and-bases]]
- [[eigenvectors-and-eigenvalues]]

## References
- 3Blue1Brown: Essence of Linear Algebra (linear transformation episodes)
