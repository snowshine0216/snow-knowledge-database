#!/usr/bin/env python3
"""Extract PDF chapter text and output bundle.json for the pdf-summarizer skill.

Usage:
    python3 extract_pdf_context.py \
        --pdf-path ~/Documents/PersonalFolder/book.pdf \
        --source-url https://example.com/book \
        --out-dir /tmp/pdf-summarizer \
        [--chapters-json chapters.json]

If --chapters-json is not provided, the script attempts to detect chapters from
the PDF's embedded TOC/outline. If no TOC is found, the script exits with an
error and asks the user to supply --chapters-json.

Chapters JSON format:
    [
        {
            "filename": "ch01-intro",
            "title": "Introduction",
            "start_page": 10,
            "end_page": 27,
            "tags": ["ml", "intro"]
        },
        ...
    ]
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any

import pdfplumber

SPARSE_THRESHOLD_DEFAULT = 50.0  # chars per page


# ---------------------------------------------------------------------------
# Pure functions
# ---------------------------------------------------------------------------

def compute_text_density(text: str, page_count: int) -> float:
    """Return average characters per page. Returns 0.0 for zero pages."""
    if page_count == 0:
        return 0.0
    return len(text) / page_count


def is_sparse_chapter(density: float, threshold: float = SPARSE_THRESHOLD_DEFAULT) -> bool:
    """Return True if the chapter's text density is below the threshold."""
    return density < threshold


def extract_chapter_text(pdf: Any, start: int, end: int) -> str:
    """Extract and join text from pages [start, end] (inclusive, 0-indexed).

    Pure function: accepts an already-opened pdfplumber PDF object.
    Returns empty string if all pages produce no extractable text.
    """
    pages_text = []
    for i in range(start, min(end + 1, len(pdf.pages))):
        text = pdf.pages[i].extract_text()
        if text:
            pages_text.append(text)
    return "\n\n".join(pages_text)


def detect_chapters_from_toc(pdf: Any) -> list[dict] | None:
    """Detect chapters from the PDF's embedded TOC/outline.

    Returns a list of chapter dicts on success, or None if no TOC is found.
    Never returns an empty list — that would be indistinguishable from failure.
    """
    try:
        toc = pdf.doc.get_toc()
    except (AttributeError, Exception):
        return None

    if not toc:
        return None

    # Filter to top-level entries only (level == 1)
    top_level = [entry for entry in toc if entry[0] == 1]
    if not top_level:
        return None

    total_pages = len(pdf.pages)
    chapters = []
    for i, (_, title, page_1indexed) in enumerate(top_level):
        start = page_1indexed - 1  # convert to 0-indexed
        # End = one page before next chapter, or last page of PDF
        if i + 1 < len(top_level):
            end = top_level[i + 1][2] - 2  # 0-indexed, exclusive of next start
        else:
            end = total_pages - 1

        chapters.append({
            "filename": f"ch{i + 1:02d}-{_slugify(title)}",
            "title": title,
            "start_page": max(0, start),
            "end_page": min(end, total_pages - 1),
            "tags": [],
        })

    return chapters if chapters else None


def _slugify(text: str) -> str:
    """Convert a title to a filename-safe slug."""
    import re
    slug = text.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")[:60]


def load_chapters_json(path: str) -> list[dict]:
    """Load chapter definitions from a JSON file.

    Exits with an error message if the file is missing or contains invalid JSON.
    """
    json_path = Path(path)
    if not json_path.exists():
        print(f"ERROR: --chapters-json file not found: {path}", file=sys.stderr)
        sys.exit(1)

    try:
        return json.loads(json_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"ERROR: --chapters-json contains invalid JSON: {exc}", file=sys.stderr)
        sys.exit(1)


def write_bundle_json(data: dict, out_dir: str) -> None:
    """Write the bundle dict to <out_dir>/bundle.json, creating dirs as needed."""
    out_path = Path(out_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    (out_path / "bundle.json").write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


# ---------------------------------------------------------------------------
# I/O boundary — effects live here
# ---------------------------------------------------------------------------

def _process_chapters(
    pdf: Any,
    chapters: list[dict],
    pdf_path: str,
    source_url: str,
) -> dict:
    """Extract text for each chapter and build the bundle dict."""
    results = []
    for ch in chapters:
        start = ch["start_page"]
        end = ch["end_page"]
        page_count = end - start + 1

        text = extract_chapter_text(pdf, start, end)
        density = compute_text_density(text, page_count)
        sparse = is_sparse_chapter(density)

        results.append({
            "filename": ch["filename"],
            "title": ch["title"],
            "start_page": start,
            "end_page": end,
            "tags": ch.get("tags", []),
            "text": text,
            "char_count": len(text),
            "chars_per_page": round(density, 2),
            "is_sparse": sparse,
        })

        status = "SPARSE (vision fallback needed)" if sparse else f"{len(text):,} chars"
        print(f"  [{ch['filename']}] pages {start + 1}-{end + 1}: {status}")

    return {
        "pdf_path": pdf_path,
        "source_url": source_url,
        "chapters": results,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract PDF chapters to bundle.json")
    parser.add_argument("--pdf-path", required=True, help="Path to the PDF file")
    parser.add_argument("--source-url", default="", help="Canonical source URL for the PDF")
    parser.add_argument("--out-dir", required=True, help="Output directory for bundle.json")
    parser.add_argument(
        "--chapters-json",
        default=None,
        help="JSON file defining chapter page ranges (required if PDF has no embedded TOC)",
    )
    args = parser.parse_args()

    pdf_path = str(Path(args.pdf_path).expanduser())
    if not Path(pdf_path).exists():
        print(f"ERROR: PDF not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Opening: {pdf_path}")

    try:
        with pdfplumber.open(pdf_path) as pdf:
            # Determine chapter list
            if args.chapters_json:
                chapters = load_chapters_json(args.chapters_json)
                print(f"Loaded {len(chapters)} chapters from {args.chapters_json}")
            else:
                chapters = detect_chapters_from_toc(pdf)
                if chapters is None:
                    print(
                        "ERROR: No embedded TOC found in this PDF.\n"
                        "Please provide chapter page ranges via --chapters-json.\n"
                        "See the script docstring for the expected format.",
                        file=sys.stderr,
                    )
                    sys.exit(1)
                print(f"Detected {len(chapters)} chapters from PDF TOC")

            print(f"Extracting {len(chapters)} chapters...")
            bundle = _process_chapters(pdf, chapters, pdf_path, args.source_url)

    except Exception as exc:
        print(f"ERROR: Could not open PDF: {exc}", file=sys.stderr)
        sys.exit(1)

    write_bundle_json(bundle, args.out_dir)
    sparse_count = sum(1 for ch in bundle["chapters"] if ch["is_sparse"])
    print(f"\nDone. bundle.json written to: {args.out_dir}")
    if sparse_count:
        print(
            f"WARNING: {sparse_count} chapter(s) are sparse (visual/illustrated pages). "
            "The pdf-summarizer skill will use Claude's PDF vision for these chapters."
        )


if __name__ == "__main__":
    main()
