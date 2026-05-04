---
aliases: [Atomic File Overwrite, Full File Overwrite]
tags: [atomic-file-overwrite, write-file, code-editing, agent-tools, harness-engineering]
source: internal
---

# Atomic File Overwrite

Atomic File Overwrite is the file-writing pattern where a tool replaces the entire contents of a target file in one operation instead of applying a local patch.

For agents, this is the natural complement to a local edit primitive like [[fuzzy-edit-tool]]. One tool is optimized for total replacement; the other is optimized for surgical modification.

## When It Works Well

Full overwrite is usually appropriate when:

- creating a new file
- regenerating a small derived file
- replacing a file whose structure has changed completely

In these cases, a whole-file write is simpler than coordinating many tiny edits.

## Where It Fails

Atomic overwrite becomes costly or risky when applied to large existing files:

- token cost rises because the model may need to reproduce the whole file
- unrelated content can drift accidentally
- review quality drops because the diff becomes much larger than the intended change

That is why robust agent toolsets usually keep both full overwrite and partial edit primitives.

## Practical Rule

Use full overwrite for creation or deliberate regeneration. Use local edit tools when most of the file should remain unchanged.

## See Also

- [[fuzzy-edit-tool]]
- [[turing-complete-toolset]]
- [[context-bloat-and-attention-dilution]]
- [[06-minimal-toolset-yolo-philosophy]]
