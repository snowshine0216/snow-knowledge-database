# Template: lecture-text

Produce textbook-prose notes with inline equations and section anchors.

```markdown
---
tags: [tag1, tag2, ...]
source: <url>
---

# Chapter N: <Title>   (or # <Title> if no chapter number)

**Source:** [Title](url)

## Outline
- [Section Name](#section-anchor)
- ...

---

## Section Name

Textbook prose paragraph. Inline math: $x^2 + y^2 = r^2$.

$$
\int_a^b f(x)\,dx
$$

- $x$: variable definition
- ...

---

## Key Equations  (include for math-heavy content)

| Equation | Description |
|---|---|
| $$...$$ | ... |

## Connections  (optional: links to next/prior chapter)
```

## Rules

- Prose over bullets for main content — textbook style, complete sentences.
- Each equation inline with its variable legend and interpretation.
- Preserve all formulas from the source exactly — do not simplify or rewrite.
- Section anchors must match headings (lowercase, hyphens for spaces).
- `---` horizontal rules between all `##` sections.
- No "Key Takeaways" or "Essence" sections — insight belongs in the section where it appears.
