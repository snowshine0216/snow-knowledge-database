#!/usr/bin/env python3

import unittest

from geektime_course_sync import (
    build_markdown,
    detect_language,
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

    def test_slugify_course_name(self) -> None:
        self.assertEqual(slugify_course_name("Claude Code Engineering Practice"), "claude-code-engineering-practice")

    def test_html_to_text(self) -> None:
        source = "<p>Hello</p><p>World &amp; Beyond</p>"
        self.assertEqual(html_to_text(source), "Hello\nWorld & Beyond")

    def test_parse_structured_notes(self) -> None:
        source = "<h2>Section A</h2><p>Point 1</p><li>Point 2</li><h2>Section B</h2><p>Point 3</p>"
        sections = parse_structured_notes(source)
        self.assertEqual(sections[0][0], "Section A")
        self.assertIn("Point 1", sections[0][1][0])
        self.assertEqual(sections[1][0], "Section B")

    def test_detect_language_zh(self) -> None:
        article_data = {"article_title": "开篇词", "article_summary": "这是中文摘要"}
        self.assertEqual(detect_language(article_data), "zh")

    def test_short_title_for_filename_zh(self) -> None:
        title = "开篇词｜共生而非替代：极客和 AI 的共舞"
        short = short_title_for_filename(title, "zh")
        self.assertTrue(short.startswith("开篇词"))
        self.assertNotIn("｜", short)

    def test_build_markdown_contains_required_sections(self) -> None:
        article_data = {
            "article_title": "开篇词",
            "chapter_title": "开篇词",
            "article_summary": "这是摘要",
            "author_name": "黄佳",
            "id": 942422,
            "article_content": "<p>第一段</p><p>第二段</p><p>第三段</p>",
        }
        markdown = build_markdown(
            article_url="https://time.geekbang.org/column/article/942422",
            article_data=article_data,
            index=1,
            course_name_zh="Claude Code 工程化实战",
            course_name_en="claude-code-engineering-practice",
        )
        self.assertIn("## 康奈尔笔记", markdown)
        self.assertIn("### 线索栏（问题）", markdown)
        self.assertIn("### 笔记栏", markdown)
        self.assertIn("### 总结", markdown)
        self.assertIn("## 关键要点", markdown)
        self.assertIn("## 知识图谱种子", markdown)
        self.assertIn("942422", markdown)


if __name__ == "__main__":
    unittest.main()
