#!/usr/bin/env python3
"""Fetch Geektime articles with browser cookies and emit chapter summaries."""

from __future__ import annotations

import argparse
import html
import json
import re
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple

DEFAULT_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
)


def parse_article_id(value: str) -> int:
    value = value.strip()
    if value.isdigit():
        return int(value)
    match = re.search(r"/column/article/(\d+)", value)
    if not match:
        raise ValueError(f"Unable to parse article id from: {value}")
    return int(match.group(1))


def slugify_course_name(name: str) -> str:
    slug = name.strip().lower()
    slug = slug.replace("&", " and ")
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    if not slug:
        raise ValueError("course-name-en must contain ascii letters or numbers")
    return slug


def html_to_text(content: str) -> str:
    content = re.sub(r"<\s*br\s*/?\s*>", "\n", content, flags=re.IGNORECASE)
    content = re.sub(r"</\s*(p|h1|h2|h3|h4|li|ul|ol|blockquote)\s*>", "\n", content)
    content = re.sub(r"<[^>]+>", "", content)
    content = html.unescape(content)
    lines = [line.strip() for line in content.splitlines()]
    lines = [line for line in lines if line]
    return "\n".join(lines)


def export_cookies(browser: str, cookies_file: Path, article_url: str) -> None:
    cookies_file.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "yt-dlp",
        "--cookies-from-browser",
        browser,
        "--cookies",
        str(cookies_file),
        article_url,
    ]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(
            "Failed to export browser cookies via yt-dlp. "
            "Provide --cookies-file with a valid Netscape cookies file, "
            "or ensure the target browser profile is accessible."
        ) from exc


def fetch_article_payload(article_url: str, article_id: int, cookies_file: Path) -> Dict:
    payload = json.dumps({"id": article_id}, ensure_ascii=False)
    cmd = [
        "curl",
        "-Ls",
        "-X",
        "POST",
        "-A",
        DEFAULT_UA,
        "-H",
        "Content-Type: application/json;charset=UTF-8",
        "-e",
        article_url,
        "-b",
        str(cookies_file),
        "https://time.geekbang.org/serv/v1/article",
        "--data",
        payload,
    ]
    completed = subprocess.run(cmd, check=True, capture_output=True, text=True)
    data = json.loads(completed.stdout)
    if data.get("code") != 0:
        raise RuntimeError(f"Geektime API returned error: {data}")
    return data


def extract_summary_fields(article_data: Dict) -> Tuple[str, List[str]]:
    plain_text = html_to_text(article_data.get("article_content", ""))
    paragraphs = [line.strip() for line in plain_text.splitlines() if line.strip()]
    if not paragraphs:
        return "No content extracted.", []
    overview = paragraphs[0]
    takeaways = []
    for paragraph in paragraphs[1:]:
        if len(takeaways) >= 6:
            break
        takeaways.append(paragraph[:180])
    return overview, takeaways


def build_markdown(
    article_url: str,
    article_data: Dict,
    index: int,
    course_name_zh: str,
    course_name_en: str,
) -> str:
    title = article_data.get("article_title", f"Chapter {index}")
    chapter_title = article_data.get("chapter_title", "")
    summary = article_data.get("article_summary", "")
    author = article_data.get("author_name", "")
    article_id = article_data.get("id", "")
    overview, takeaways = extract_summary_fields(article_data)
    takeaway_block = "\n".join([f"- {item}" for item in takeaways]) or "- (Fill in manually)"
    return f"""# {title}

## Chapter Metadata
- Course (EN): {course_name_en}
- Course (ZH): {course_name_zh}
- Chapter: {chapter_title}
- Author: {author}
- Article ID: {article_id}
- Source: {article_url}

## Quick Summary
{summary or overview}

## Key Takeaways
{takeaway_block}

## Knowledge Graph Seeds
- Entities:
  - {course_name_en}
  - {chapter_title or title}
  - {author}
- Relations:
  - ({course_name_en}) -> has_chapter -> ({chapter_title or title})
  - ({chapter_title or title}) -> authored_by -> ({author})

## Notes For Review
- Validate technical claims against source text when building your graph.
- Add personal action items and project mappings in this section.
"""


def write_course_readme(course_dir: Path, course_name_en: str, course_name_zh: str, chapter_rows: List[Tuple[str, str]]) -> None:
    lines = [
        f"# {course_name_en}",
        "",
        f"- Chinese name: {course_name_zh}",
        f"- Chapters: {len(chapter_rows)}",
        "",
        "## Chapters",
    ]
    for chapter_file, chapter_title in chapter_rows:
        lines.append(f"- [{chapter_title}]({chapter_file})")
    lines.append("")
    (course_dir / "README.md").write_text("\n".join(lines), encoding="utf-8")


def run(args: argparse.Namespace) -> None:
    course_slug = slugify_course_name(args.course_name_en)
    course_dir = Path(args.output_root) / course_slug
    course_dir.mkdir(parents=True, exist_ok=True)

    chapter_rows: List[Tuple[str, str]] = []
    for idx, article_url in enumerate(args.article_url, start=1):
        article_id = parse_article_id(article_url)
        if not args.cookies_file.exists():
            export_cookies(args.browser, args.cookies_file, article_url)
        payload = fetch_article_payload(article_url, article_id, args.cookies_file)
        article_data = payload["data"]
        md = build_markdown(
            article_url=article_url,
            article_data=article_data,
            index=idx,
            course_name_zh=args.course_name_zh,
            course_name_en=args.course_name_en,
        )
        chapter_filename = f"{idx:03d}-{article_id}.md"
        chapter_title = article_data.get("article_title", chapter_filename)
        (course_dir / chapter_filename).write_text(md, encoding="utf-8")
        chapter_rows.append((chapter_filename, chapter_title))
        print(f"Wrote: {course_dir / chapter_filename}")

    write_course_readme(course_dir, args.course_name_en, args.course_name_zh, chapter_rows)
    print(f"Wrote: {course_dir / 'README.md'}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Sync Geektime articles into chapter summaries.")
    parser.add_argument("--course-name-en", required=True, help="English course name for folder naming.")
    parser.add_argument("--course-name-zh", default="", help="Original Chinese course name.")
    parser.add_argument("--article-url", action="append", required=True, help="Geektime article URL; repeat per chapter.")
    parser.add_argument("--output-root", default="courses", help="Root folder for summary output.")
    parser.add_argument("--browser", default="chrome", help="Browser name for yt-dlp cookies export.")
    parser.add_argument(
        "--cookies-file",
        type=Path,
        default=Path("/tmp/geektime_cookies.txt"),
        help="Cookies file path reused across fetch calls.",
    )
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    run(args)


if __name__ == "__main__":
    main()
