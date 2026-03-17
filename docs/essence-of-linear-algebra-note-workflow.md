# Essence of Linear Algebra Note Workflow

A practical example for creating, organizing, and maintaining notes for the `essence-of-linear-algebra` topic folder.

## Scope

- How to structure notes for one learning topic in this repository.
- How to keep notes easy to review in Obsidian.
- This does not cover full course planning or spaced-repetition tooling.

## Prerequisites

- This repository cloned locally.
- A markdown editor (Obsidian recommended).

## Steps

1. Create a topic index file at `essence-of-linear-algebra/README.md`.
2. Add one note per concept, such as:
   - `vectors-and-bases.md`
   - `matrix-transformations.md`
   - `eigenvectors-and-eigenvalues.md`
3. Use the note format below for each concept:

```md
# <Concept Name>

## Summary
2-4 sentences describing the concept.

## Key Ideas
- Idea 1
- Idea 2

## Example
A worked example in your own words.

## Questions
- What is still unclear?
- What should be reviewed again?

## References
- Video timestamp / article URL / textbook section
```

4. Link concept notes from `essence-of-linear-algebra/README.md` so the folder has a clear entry point.
5. After each study session, update only the affected concept note and add one question in its `Questions` section.

## Verification

- `essence-of-linear-algebra/README.md` exists and links to all concept notes.
- Each concept note includes: `Summary`, `Key Ideas`, `Example`, `Questions`, and `References`.
- Notes are readable in Obsidian with working internal links.

## Troubleshooting

- Folder has too many mixed concepts:
  split large notes into smaller concept-focused files.
- Notes feel hard to review:
  shorten summaries and ensure each note has one concrete example.

## References

- [3Blue1Brown - Essence of linear algebra](https://www.3blue1brown.com/topics/linear-algebra)
- [Documentation template](./_template.md)
