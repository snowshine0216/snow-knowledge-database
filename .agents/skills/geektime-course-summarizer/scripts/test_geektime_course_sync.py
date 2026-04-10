#!/usr/bin/env python3

import json
import tempfile
import unittest
from pathlib import Path

from geektime_course_sync import (
    detect_language,
    export_metadata,
    html_to_text,
    parse_structured_notes,
    parse_article_id,
    short_title_for_filename,
    slugify_course_name,
)


class GeektimeCourseSyncTests(unittest.TestCase):
    def test_parse_article_id_from_url(self) -> None:
        self.assertEqual(parse_article_id("https://time.geekbang.org/column/article/942422"), 942422)

    def test_parse_article_id_from_plain_id(self) -> None:
        self.assertEqual(parse_article_id("942422"), 942422)

    def test_parse_article_id_raises_on_invalid(self) -> None:
        with self.assertRaises(ValueError):
            parse_article_id("https://example.com/not-an-article")

    def test_slugify_course_name(self) -> None:
        self.assertEqual(slugify_course_name("Claude Code Engineering Practice"), "claude-code-engineering-practice")

    def test_slugify_course_name_raises_on_empty(self) -> None:
        with self.assertRaises(ValueError):
            slugify_course_name("!@#$%")

    def test_html_to_text_preserve_newlines(self) -> None:
        source = "<p>Hello</p><p>World &amp; Beyond</p>"
        self.assertEqual(html_to_text(source), "Hello\nWorld & Beyond")

    def test_html_to_text_collapses_whitespace(self) -> None:
        source = "<p>Hello</p>   <p>World</p>"
        result = html_to_text(source, preserve_newlines=False)
        self.assertNotIn("\n", result)
        self.assertIn("Hello", result)
        self.assertIn("World", result)

    def test_parse_structured_notes(self) -> None:
        source = "<h2>Section A</h2><p>Point 1</p><li>Point 2</li><h2>Section B</h2><p>Point 3</p>"
        sections = parse_structured_notes(source)
        self.assertEqual(sections[0][0], "Section A")
        self.assertIn("Point 1", sections[0][1][0])
        self.assertEqual(sections[1][0], "Section B")

    def test_detect_language_zh(self) -> None:
        article_data = {"article_title": "开篇词", "article_summary": "这是中文摘要"}
        self.assertEqual(detect_language(article_data), "zh")

    def test_detect_language_en(self) -> None:
        article_data = {
            "article_title": "Introduction to Machine Learning",
            "article_summary": "This chapter covers the basics of machine learning algorithms.",
            "article_content": "<p>We will explore supervised and unsupervised learning methods.</p>",
        }
        self.assertEqual(detect_language(article_data), "en")

    def test_short_title_for_filename_zh(self) -> None:
        title = "开篇词｜共生而非替代：极客和 AI 的共舞"
        short = short_title_for_filename(title, "zh")
        self.assertTrue(short.startswith("开篇词"))
        self.assertNotIn("｜", short)

    def test_short_title_for_filename_empty(self) -> None:
        self.assertEqual(short_title_for_filename("", "zh"), "chapter")
        self.assertEqual(short_title_for_filename("", "en"), "chapter")

    def test_export_metadata_required_fields(self) -> None:
        article_data = {
            "article_title": "开篇词",
            "chapter_title": "开篇词",
            "article_summary": "这是摘要",
            "author_name": "黄佳",
            "id": 942422,
            "article_content": "<p>第一段</p><p>第二段</p>",
        }
        with tempfile.TemporaryDirectory() as tmp:
            out_path = Path(tmp) / "001-meta.json"
            export_metadata(
                article_url="https://time.geekbang.org/column/article/942422",
                article_data=article_data,
                index=1,
                course_name_zh="Claude Code 工程化实战",
                course_name_en="claude-code-engineering-practice",
                out_path=out_path,
            )
            data = json.loads(out_path.read_text(encoding="utf-8"))
        required_keys = {"title", "source_url", "article_id", "chapter_title", "author", "course_name_en", "course_name_zh", "content", "language"}
        self.assertEqual(required_keys, set(data.keys()))
        self.assertEqual(data["title"], "开篇词")
        self.assertEqual(data["source_url"], "https://time.geekbang.org/column/article/942422")
        self.assertEqual(data["article_id"], 942422)
        self.assertEqual(data["language"], "zh")
        self.assertIn("第一段", data["content"])

    def test_export_metadata_missing_fields_use_defaults(self) -> None:
        article_data = {}  # all fields missing
        with tempfile.TemporaryDirectory() as tmp:
            out_path = Path(tmp) / "001-meta.json"
            export_metadata(
                article_url="https://time.geekbang.org/column/article/1",
                article_data=article_data,
                index=1,
                course_name_zh="",
                course_name_en="test-course",
                out_path=out_path,
            )
            data = json.loads(out_path.read_text(encoding="utf-8"))
        self.assertEqual(data["title"], "Chapter 1")
        self.assertEqual(data["article_id"], "")
        self.assertEqual(data["author"], "")
        self.assertEqual(data["content"], "")

    def test_export_metadata_language_defaults_to_zh_on_empty(self) -> None:
        article_data = {"article_title": "", "article_summary": "", "article_content": ""}
        with tempfile.TemporaryDirectory() as tmp:
            out_path = Path(tmp) / "001-meta.json"
            export_metadata(
                article_url="https://time.geekbang.org/column/article/1",
                article_data=article_data,
                index=1,
                course_name_zh="",
                course_name_en="test-course",
                out_path=out_path,
            )
            data = json.loads(out_path.read_text(encoding="utf-8"))
        # empty content has 0 CJK and 0 alpha → cjk >= alpha → "zh"
        self.assertEqual(data["language"], "zh")

    def test_build_markdown_not_importable(self) -> None:
        import geektime_course_sync as m
        self.assertFalse(hasattr(m, "build_markdown"), "build_markdown must be removed")


if __name__ == "__main__":
    unittest.main()
