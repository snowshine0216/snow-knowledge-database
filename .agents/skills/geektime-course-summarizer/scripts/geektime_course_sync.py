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


def strip_html_tags(content: str) -> str:
    text = re.sub(r"<\s*br\s*/?\s*>", "\n", content, flags=re.IGNORECASE)
    text = re.sub(r"</\s*(p|h1|h2|h3|h4|li|ul|ol|blockquote)\s*>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_structured_notes(article_html: str) -> List[Tuple[str, List[str]]]:
    pattern = re.compile(r"<(h2|h3|p|li)\b[^>]*>(.*?)</\1>", re.IGNORECASE | re.DOTALL)
    sections: List[Tuple[str, List[str]]] = []
    current_heading = "Overview"
    current_notes: List[str] = []
    for tag, raw_body in pattern.findall(article_html):
        text = strip_html_tags(raw_body)
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


def i18n_pack(lang: str) -> Dict[str, str]:
    if lang == "zh":
        return {
            "meta": "章节元数据",
            "cornell": "康奈尔笔记",
            "cue": "线索栏（问题）",
            "notes": "笔记栏",
            "summary": "总结",
            "takeaways": "关键要点",
            "kg": "知识图谱种子",
            "review": "复习备注",
            "course_en": "课程名（EN）",
            "course_zh": "课程名（ZH）",
            "chapter": "章节",
            "author": "作者",
            "article_id": "文章 ID",
            "source": "来源",
            "entities": "实体",
            "relations": "关系",
            "review_1": "构建知识图谱前，先复核关键论断与原文的一致性。",
            "review_2": "在此补充你的行动项、实践映射和复盘结论。",
            "cue_thesis": "本章的核心论点是什么？",
            "cue_overview_evidence": "本章开场提出了哪些背景、问题与动机？",
            "cue_point": "“{heading}”这一部分的关键观点是什么？",
            "cue_evidence": "“{heading}”有哪些支撑证据或案例？",
            "rel_has_chapter": "包含章节",
            "rel_authored_by": "作者",
        }
    return {
        "meta": "Chapter Metadata",
        "cornell": "Cornell Notes",
        "cue": "Cue Column (Questions)",
        "notes": "Notes Column",
        "summary": "Summary",
        "takeaways": "Key Takeaways",
        "kg": "Knowledge Graph Seeds",
        "review": "Notes For Review",
        "course_en": "Course (EN)",
        "course_zh": "Course (ZH)",
        "chapter": "Chapter",
        "author": "Author",
        "article_id": "Article ID",
        "source": "Source",
        "entities": "Entities",
        "relations": "Relations",
        "review_1": "Validate technical claims against source text when building your graph.",
        "review_2": "Add personal action items and project mappings in this section.",
        "cue_thesis": "What is the central thesis of this chapter?",
        "cue_overview_evidence": "What background and motivation are introduced at the start?",
        "cue_point": "What is the key point of '{heading}'?",
        "cue_evidence": "What evidence supports '{heading}'?",
        "rel_has_chapter": "has_chapter",
        "rel_authored_by": "authored_by",
    }


def localize_heading(heading: str, lang: str) -> str:
    if lang == "zh" and heading.strip().lower() == "overview":
        return "概览"
    return heading


def heading_contains_chinese(text: str) -> bool:
    return bool(re.search(r"[\u4e00-\u9fff]", text))


def display_heading(heading: str, lang: str, index: int) -> str:
    localized = localize_heading(heading, lang)
    if lang == "zh" and (not heading_contains_chinese(localized) or re.search(r"[A-Za-z]", localized)):
        return f"主题{index}"
    return localized


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


def build_cornell_components(article_data: Dict) -> Tuple[List[str], List[Tuple[str, List[str]]], str, List[str]]:
    article_html = article_data.get("article_content", "")
    sections = parse_structured_notes(article_html)
    if not sections:
        text = html_to_text(article_html)
        fallback = [line for line in text.splitlines() if line.strip()][:8]
        sections = [("Overview", fallback)] if fallback else [("Overview", ["No content extracted."])]

    lang = detect_language(article_data)
    tx = i18n_pack(lang)
    cues: List[str] = []
    for i, (heading, notes) in enumerate(sections[:6], start=1):
        heading_label = display_heading(heading, lang, i)
        if heading.lower() == "overview":
            cues.append(tx["cue_thesis"])
            if notes:
                cues.append(tx["cue_overview_evidence"])
        else:
            cues.append(tx["cue_point"].format(heading=heading_label))
        if notes and heading.lower() != "overview":
            cues.append(tx["cue_evidence"].format(heading=heading_label))
    cues = cues[:8]

    flattened_notes: List[str] = []
    for _, notes in sections:
        for note in notes:
            if note not in flattened_notes:
                flattened_notes.append(note)
            if len(flattened_notes) >= 30:
                break
        if len(flattened_notes) >= 30:
            break

    summary_seed = article_data.get("article_summary", "").strip()
    if not summary_seed:
        summary_seed = flattened_notes[0] if flattened_notes else "No summary available."
    summary_tail = " ".join(flattened_notes[1:4]).strip()
    summary = (summary_seed + (" " + summary_tail if summary_tail else "")).strip()[:500]

    takeaways: List[str] = []
    for i, (heading, notes) in enumerate(sections, start=1):
        if heading.lower() != "overview":
            heading_label = display_heading(heading, lang, i)
            if lang == "zh":
                takeaways.append(f"{heading_label}：{notes[0] if notes else '请回看该小节原文。'}")
            else:
                takeaways.append(f"{heading_label}: {notes[0] if notes else 'Review chapter details.'}")
        else:
            if notes:
                takeaways.append(notes[0])
        if len(takeaways) >= 6:
            break
    if not takeaways:
        takeaways = ["Review source chapter and add manual takeaways."]
    return cues, sections, summary, takeaways


def build_markdown(
    article_url: str,
    article_data: Dict,
    index: int,
    course_name_zh: str,
    course_name_en: str,
) -> str:
    lang = detect_language(article_data)
    tx = i18n_pack(lang)
    title = article_data.get("article_title", f"Chapter {index}")
    chapter_title = article_data.get("chapter_title", "")
    summary = article_data.get("article_summary", "")
    author = article_data.get("author_name", "")
    article_id = article_data.get("id", "")
    cues, sections, generated_summary, takeaways = build_cornell_components(article_data)
    cue_block = "\n".join([f"- {q}" for q in cues]) or f"- {tx['cue_thesis']}"
    notes_lines: List[str] = []
    for i, (heading, notes) in enumerate(sections[:8], start=1):
        heading_label = display_heading(heading, lang, i)
        notes_lines.append(f"#### {heading_label}")
        if lang == "zh" and heading_label.startswith("主题") and heading.strip():
            notes_lines.append(f"- 原始小节标题：{heading}")
        for note in notes[:6]:
            notes_lines.append(f"- {note}")
        notes_lines.append("")
    notes_block = "\n".join(notes_lines).strip()
    takeaway_block = "\n".join([f"- {item}" for item in takeaways]) or "- (Fill in manually)"
    return f"""# {title}

## {tx["meta"]}
- {tx["course_en"]}: {course_name_en}
- {tx["course_zh"]}: {course_name_zh}
- {tx["chapter"]}: {chapter_title}
- {tx["author"]}: {author}
- {tx["article_id"]}: {article_id}
- {tx["source"]}: {article_url}

## {tx["cornell"]}

### {tx["cue"]}
{cue_block}

### {tx["notes"]}
{notes_block}

### {tx["summary"]}
{summary or generated_summary}

## {tx["takeaways"]}
{takeaway_block}

## {tx["kg"]}
- {tx["entities"]}:
  - {course_name_en}
  - {chapter_title or title}
  - {author}
- {tx["relations"]}:
  - ({course_name_en}) -> {tx["rel_has_chapter"]} -> ({chapter_title or title})
  - ({chapter_title or title}) -> {tx["rel_authored_by"]} -> ({author})

## {tx["review"]}
- {tx["review_1"]}
- {tx["review_2"]}
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
        lang = detect_language(article_data)
        md = build_markdown(
            article_url=article_url,
            article_data=article_data,
            index=idx,
            course_name_zh=args.course_name_zh,
            course_name_en=args.course_name_en,
        )
        chapter_title = article_data.get("article_title", f"chapter-{idx}")
        short_title = short_title_for_filename(chapter_title, lang)
        chapter_filename = f"{idx:03d}-{short_title}.md"
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
