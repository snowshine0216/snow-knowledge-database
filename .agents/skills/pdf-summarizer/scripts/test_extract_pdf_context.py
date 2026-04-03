"""Tests for extract_pdf_context.py — written before implementation (TDD)."""

import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch, call

import pytest

sys.path.insert(0, str(Path(__file__).parent))
from extract_pdf_context import (
    compute_text_density,
    detect_chapters_from_toc,
    extract_chapter_text,
    is_sparse_chapter,
    load_chapters_json,
    write_bundle_json,
)


# ---------------------------------------------------------------------------
# compute_text_density
# ---------------------------------------------------------------------------

def test_compute_text_density_empty_text():
    assert compute_text_density("", 5) == 0.0


def test_compute_text_density_known_input():
    assert compute_text_density("a" * 100, 4) == 25.0


def test_compute_text_density_returns_float():
    result = compute_text_density("hello", 1)
    assert isinstance(result, float)


def test_compute_text_density_zero_pages_returns_zero():
    assert compute_text_density("some text", 0) == 0.0


# ---------------------------------------------------------------------------
# is_sparse_chapter
# ---------------------------------------------------------------------------

def test_is_sparse_chapter_below_threshold():
    assert is_sparse_chapter(30.0, threshold=50.0) is True


def test_is_sparse_chapter_above_threshold():
    assert is_sparse_chapter(100.0, threshold=50.0) is False


def test_is_sparse_chapter_at_threshold_not_sparse():
    assert is_sparse_chapter(50.0, threshold=50.0) is False


def test_is_sparse_chapter_uses_default_threshold():
    # default threshold = 50 chars/page
    assert is_sparse_chapter(49.9) is True
    assert is_sparse_chapter(50.0) is False


# ---------------------------------------------------------------------------
# extract_chapter_text
# ---------------------------------------------------------------------------

def _make_mock_pdf(pages_text: list[str | None]) -> MagicMock:
    """Build a mock pdfplumber PDF with the given per-page text values."""
    mock_pdf = MagicMock()
    mock_pages = []
    for text in pages_text:
        page = MagicMock()
        page.extract_text.return_value = text
        mock_pages.append(page)
    mock_pdf.pages = mock_pages
    return mock_pdf


def test_extract_chapter_text_returns_combined_text():
    mock_pdf = _make_mock_pdf(["page one", "page two", "page three"])
    result = extract_chapter_text(mock_pdf, start=0, end=2)
    assert "page one" in result
    assert "page two" in result
    assert "page three" in result


def test_extract_chapter_text_empty_pages_returns_empty_string():
    mock_pdf = _make_mock_pdf([None, None, None])
    result = extract_chapter_text(mock_pdf, start=0, end=2)
    assert result == ""


def test_extract_chapter_text_skips_none_pages():
    mock_pdf = _make_mock_pdf(["text", None, "more text"])
    result = extract_chapter_text(mock_pdf, start=0, end=2)
    assert "text" in result
    assert "more text" in result


def test_extract_chapter_text_single_page():
    mock_pdf = _make_mock_pdf(["only page"])
    result = extract_chapter_text(mock_pdf, start=0, end=0)
    assert result == "only page"


def test_extract_chapter_text_end_clamped_to_pdf_length():
    mock_pdf = _make_mock_pdf(["p1", "p2"])
    # end=99 but only 2 pages exist — should not raise
    result = extract_chapter_text(mock_pdf, start=0, end=99)
    assert "p1" in result
    assert "p2" in result


# ---------------------------------------------------------------------------
# detect_chapters_from_toc
# ---------------------------------------------------------------------------

def test_detect_chapters_from_toc_returns_none_when_no_outline():
    mock_pdf = MagicMock()
    mock_pdf.doc.get_toc.return_value = []
    result = detect_chapters_from_toc(mock_pdf)
    assert result is None


def test_detect_chapters_from_toc_returns_chapters_when_outline_present():
    mock_pdf = MagicMock()
    mock_pdf.doc.get_toc.return_value = [
        [1, "Chapter 1", 10],
        [1, "Chapter 2", 30],
    ]
    mock_pdf.pages = [MagicMock()] * 50
    result = detect_chapters_from_toc(mock_pdf)
    assert result is not None
    assert len(result) == 2
    assert result[0]["title"] == "Chapter 1"
    assert result[0]["start_page"] == 9  # 0-indexed


def test_detect_chapters_from_toc_returns_none_when_toc_unavailable():
    mock_pdf = MagicMock()
    mock_pdf.doc.get_toc.side_effect = AttributeError("no toc")
    result = detect_chapters_from_toc(mock_pdf)
    assert result is None


# ---------------------------------------------------------------------------
# load_chapters_json
# ---------------------------------------------------------------------------

def test_load_chapters_json_valid_file(tmp_path):
    chapters = [{"filename": "ch01", "title": "Intro", "start_page": 0, "end_page": 10, "tags": []}]
    json_file = tmp_path / "chapters.json"
    json_file.write_text(json.dumps(chapters))
    result = load_chapters_json(str(json_file))
    assert len(result) == 1
    assert result[0]["title"] == "Intro"


def test_load_chapters_json_invalid_json_raises(tmp_path):
    bad_file = tmp_path / "bad.json"
    bad_file.write_text("not json {{{")
    with pytest.raises(SystemExit):
        load_chapters_json(str(bad_file))


def test_load_chapters_json_missing_file_raises():
    with pytest.raises(SystemExit):
        load_chapters_json("/nonexistent/path/chapters.json")


# ---------------------------------------------------------------------------
# write_bundle_json
# ---------------------------------------------------------------------------

def test_write_bundle_json_creates_file(tmp_path):
    chapters_data = {
        "pdf_path": "/some/book.pdf",
        "source_url": "https://example.com",
        "chapters": [
            {
                "filename": "ch01",
                "title": "Intro",
                "start_page": 0,
                "end_page": 10,
                "tags": ["ml"],
                "text": "some text",
                "char_count": 9,
                "chars_per_page": 0.82,
                "is_sparse": False,
            }
        ],
    }
    write_bundle_json(chapters_data, str(tmp_path))
    bundle_path = tmp_path / "bundle.json"
    assert bundle_path.exists()
    loaded = json.loads(bundle_path.read_text())
    assert loaded["chapters"][0]["title"] == "Intro"


def test_write_bundle_json_creates_output_dir(tmp_path):
    new_dir = tmp_path / "subdir" / "output"
    write_bundle_json({"pdf_path": "", "source_url": "", "chapters": []}, str(new_dir))
    assert (new_dir / "bundle.json").exists()
