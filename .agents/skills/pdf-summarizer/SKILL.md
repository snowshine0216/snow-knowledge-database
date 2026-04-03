---
name: pdf-summarizer
description: |
  Summarize PDF files (textbooks, technical books, papers) into structured markdown notes.
  Supports single chapters (interactive) and full books (batch mode).
  Handles visual/illustrated PDFs by falling back to Claude's PDF vision for sparse chapters.
  Use when the user provides a PDF path and asks for a summary, notes, or study guide.
---

# PDF Summarizer

## Overview

Summarizes PDF books and papers chapter by chapter into structured markdown notes,
saved to the repo. Integrates with `content-summarizer` using the `book-chapter` format.

**Two modes:**
- **Interactive** (≤ 20 pages total, or a single chapter): Claude reads the PDF directly. No script needed.
- **Batch** (full book, multiple chapters): runs `extract_pdf_context.py`, reads `bundle.json`, invokes `content-summarizer` per chapter.

## Workflow

### Interactive mode (single chapter or small PDF)

Use when the user wants to summarize one chapter or a small section.

1. Read the PDF page range directly:
   ```
   Read tool: <pdf_path>, pages: "<start>-<end>"
   ```
   Example: `pages: "11-27"` for chapter 1 of the StatQuest book.

2. Invoke `content-summarizer` with:
   - `content_type`: `book-chapter` (technical textbook with equations/code) or `article` (general PDF)
   - `content`: extracted text from the Read tool
   - `metadata`:
     - `title`: chapter title
     - `source_url`: canonical URL of the book/paper
     - `chapter_num`: chapter number (if applicable)
     - `book_title`: name of the book
   - `save_path`: target `.md` file path

### Batch mode (full book)

Use when the user wants to summarize an entire book unattended.

**Step 1: Extract chapter text**

```bash
python3 .agents/skills/pdf-summarizer/scripts/extract_pdf_context.py \
  --pdf-path "<path_to_pdf>" \
  --source-url "<canonical_url>" \
  --out-dir /tmp/pdf-summarizer \
  [--chapters-json "<path_to_chapters.json>"]
```

If the PDF has no embedded TOC (common for print-format books), the script will
exit with an error and ask for `--chapters-json`. Create a chapters JSON file:

```json
[
  {
    "filename": "ch01-fundamentals",
    "title": "Fundamental Concepts",
    "start_page": 10,
    "end_page": 27,
    "tags": ["neural-networks", "fundamentals"]
  }
]
```

Pages are 0-indexed (page 1 of the PDF = `start_page: 0`).

**Step 2: Read bundle.json**

```
Read: /tmp/pdf-summarizer/bundle.json
```

Check each chapter's `is_sparse` flag. Sparse chapters had little extractable text
(< 50 chars/page average) — usually illustrated pages with minimal text content.

**Step 3: For each chapter**

For chapters where `is_sparse: false`:
- Use `text` from bundle.json as the `content`

For chapters where `is_sparse: true` (visual/illustrated pages):
- Read the PDF pages directly via the Read tool for visual context:
  ```
  Read tool: <pdf_path>, pages: "<start_page+1>-<end_page+1>"
  ```
  (Pages are 1-indexed in the Read tool, 0-indexed in bundle.json)
- Combine any extracted text from bundle.json with visual context from Read
- Note in the output: "This chapter is primarily visual/diagrammatic."

Then invoke `content-summarizer` with:
- `content_type`: `book-chapter`
- `content`: chapter text (+ visual context for sparse chapters)
- `metadata`:
  - `title`: from bundle.json chapter `title`
  - `source_url`: from bundle.json `source_url`
  - `chapter_num`: derived from `filename` (e.g., `ch01-...` → Chapter 1)
  - `book_title`: from user's request
- `save_path`: `<output_directory>/<filename>.md`

**Pre-write check:** Before writing each file, check if it exists. If it does, skip it (resume support).

## Determining content_type

- Technical book with equations and/or code examples → `book-chapter`
- Academic paper, general article → `article`
- Prose-heavy textbook without code → `lecture-text`

## Dependencies

- `pdfplumber` (already installed in this repo's environment)
- Python 3.10+ (for `list[dict] | None` type hints)

```bash
pip3 install pdfplumber
```

## Example: StatQuest Neural Networks book

**Batch mode with manual chapters (no embedded TOC):**

```bash
python3 .agents/skills/pdf-summarizer/scripts/extract_pdf_context.py \
  --pdf-path ~/Documents/PersonalFolder/signa_6x9_fullsize_v3.3.1.pdf \
  --source-url "https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/" \
  --out-dir /tmp/statquest-extract \
  --chapters-json .agents/skills/pdf-summarizer/examples/statquest-chapters.json
```

Then process each chapter in bundle.json into `courses/statquest-neural-networks-and-ai/`.

## Notes

- `scripts/summarize_statquest.py` is deprecated — use this skill instead.
- The sparse threshold (50 chars/page) is a starting point. Adjust if needed.
- Vision fallback quality depends on the book. For very diagram-heavy books,
  the summary may note: "This chapter is primarily visual" — this is correct behavior,
  not a bug.
