# Output Format

Write chapter summaries to:

`courses/<english-course-name>/`

Required files:

- `README.md` for course index and chapter links
- One chapter file per article: `NNN-<article-id>.md`

Each chapter file must contain:

1. `## Chapter Metadata`
2. `## Cornell Notes`
3. `## Key Takeaways`
4. `## Knowledge Graph Seeds`
5. `## Notes For Review`

Cornell section must contain:

- `### Cue Column (Questions)`
- `### Notes Column`
- `### Summary`

Knowledge graph seed block should include:

- Candidate entities (course, chapter, author, concepts)
- Candidate relations in `(A) -> relation -> (B)` form
