#!/usr/bin/env python3
"""Fetch Geektime articles with browser cookies and export metadata JSON for content-summarizer."""

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


def html_to_text(content: str, preserve_newlines: bool = True) -> str:
    content = re.sub(r"<\s*br\s*/?\s*>", "\n", content, flags=re.IGNORECASE)
    content = re.sub(r"</\s*(p|h1|h2|h3|h4|li|ul|ol|blockquote)\s*>", "\n", content, flags=re.IGNORECASE)
    content = re.sub(r"<[^>]+>", "", content)
    content = html.unescape(content)
    if preserve_newlines:
        lines = [line.strip() for line in content.splitlines()]
        lines = [line for line in lines if line]
        return "\n".join(lines)
    return re.sub(r"\s+", " ", content).strip()


def parse_structured_notes(article_html: str) -> List[Tuple[str, List[str]]]:
    pattern = re.compile(r"<(h2|h3|p|li)\b[^>]*>(.*?)</\1>", re.IGNORECASE | re.DOTALL)
    sections: List[Tuple[str, List[str]]] = []
    current_heading = "Overview"
    current_notes: List[str] = []
    for tag, raw_body in pattern.findall(article_html):
        text = html_to_text(raw_body, preserve_newlines=False)
        if not text:
            continue
        tag = tag.lower()
        if tag in ("h2", "h3"):
            if current_notes:
                sections.append((current_heading, current_notes))
            current_heading = text
            current_notes = []
            continue
        if len(text) < 2:
            continue
        current_notes.append(text[:220])
    if current_notes:
        sections.append((current_heading, current_notes))
    return sections


def detect_language(article_data: Dict) -> str:
    title = str(article_data.get("article_title", ""))
    title_cjk = len(re.findall(r"[\u4e00-\u9fff]", title))
    if title_cjk >= 2:
        return "zh"
    sample = " ".join(
        [
            title,
            str(article_data.get("article_summary", "")),
            str(article_data.get("article_content", ""))[:2000],
        ]
    )
    cjk = len(re.findall(r"[\u4e00-\u9fff]", sample))
    alpha = len(re.findall(r"[A-Za-z]", sample))
    return "zh" if cjk >= alpha else "en"


def short_title_for_filename(title: str, lang: str, max_len: int = 18) -> str:
    title = title.strip()
    if not title:
        return "chapter"
    if lang == "zh":
        cleaned = re.sub(r"[^\u4e00-\u9fffA-Za-z0-9]+", "-", title)
        cleaned = re.sub(r"-+", "-", cleaned).strip("-")
        if not cleaned:
            return "chapter"
        return cleaned[:max_len].strip("-")
    cleaned = title.lower()
    cleaned = cleaned.replace("&", " and ")
    cleaned = re.sub(r"[^a-z0-9]+", "-", cleaned)
    cleaned = re.sub(r"-+", "-", cleaned).strip("-")
    return (cleaned[:max_len].strip("-") or "chapter")


def export_metadata(
    article_url: str,
    article_data: Dict,
    index: int,
    course_name_zh: str,
    course_name_en: str,
    out_path: Path,
) -> None:
    lang = detect_language(article_data)
    content = html_to_text(article_data.get("article_content", ""))
    metadata = {
        "title": article_data.get("article_title", f"Chapter {index}"),
        "source_url": article_url,
        "article_id": article_data.get("id", ""),
        "chapter_title": article_data.get("chapter_title", ""),
        "author": article_data.get("author_name", ""),
        "course_name_en": course_name_en,
        "course_name_zh": course_name_zh,
        "content": content,
        "language": lang,
    }
    out_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")


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
        lang = detect_language(article_data)
        chapter_title = article_data.get("article_title", f"chapter-{idx}")
        short_title = short_title_for_filename(chapter_title, lang)
        metadata_path = course_dir / f"{idx:03d}-{short_title}.metadata.json"
        export_metadata(
            article_url=article_url,
            article_data=article_data,
            index=idx,
            course_name_zh=args.course_name_zh,
            course_name_en=args.course_name_en,
            out_path=metadata_path,
        )
        chapter_rows.append((f"{idx:03d}-{short_title}.md", chapter_title))
        print(f"metadata: {metadata_path}")

    write_course_readme(course_dir, args.course_name_en, args.course_name_zh, chapter_rows)
    print(f"Wrote: {course_dir / 'README.md'}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Sync Geektime articles into metadata JSON for content-summarizer.")
    parser.add_argument("--course-name-en", required=True, help="English course name for folder naming.")
    parser.add_argument("--course-name-zh", default="", help="Original Chinese course name.")
    parser.add_argument("--article-url", action="append", required=True, help="Geektime article URL; repeat per chapter.")
    parser.add_argument("--output-root", default="courses", help="Root folder for output.")
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
