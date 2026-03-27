#!/usr/bin/env python3

import unittest

from geektime_course_sync import (
    build_markdown,
    html_to_text,
    parse_article_id,
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

    def test_build_markdown_contains_required_sections(self) -> None:
        article_data = {
            "article_title": "开篇词",
            "chapter_title": "开篇词",
            "article_summary": "summary",
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
        self.assertIn("## Quick Summary", markdown)
        self.assertIn("## Key Takeaways", markdown)
        self.assertIn("## Knowledge Graph Seeds", markdown)
        self.assertIn("942422", markdown)


if __name__ == "__main__":
    unittest.main()
