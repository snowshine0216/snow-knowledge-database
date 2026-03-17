#!/usr/bin/env python3
"""Extract metadata and transcript context from a YouTube or Bilibili URL."""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


BASE_YTDLP_FLAGS = ["--socket-timeout", "20", "--retries", "2", "--extractor-retries", "2"]
DEFAULT_SUB_LANGS = "en.*,zh.*"
DEFAULT_OPENAI_MODELS = "gpt-4o-mini-transcribe,gpt-4o-transcribe,whisper-1"
DEFAULT_FASTER_WHISPER_MODEL = "tiny"
DEFAULT_FOCUS_DIGEST_BULLETS = 5
FOCUS_SECTION_ALIASES = {
    "image": ["image", "images", "img", "picture", "pictures", "图像", "图片", "附件"],
    "phone": ["phone", "mobile", "android", "ios", "手机", "移动端"],
    "export": ["export", "导出", "output", "pandoc"],
    "knowledge_graph": ["knowledge_graph", "knowledge-graph", "knowledge graph", "graph", "知识图谱", "关系图谱"],
}


def run_cmd(cmd: List[str], timeout_seconds: int = 180) -> subprocess.CompletedProcess[str]:
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout_seconds)
    except subprocess.TimeoutExpired as exc:
        stdout_raw = exc.stdout or ""
        stderr_raw = exc.stderr or ""
        if isinstance(stdout_raw, bytes):
            stdout = stdout_raw.decode("utf-8", errors="ignore")
        else:
            stdout = stdout_raw
        if isinstance(stderr_raw, bytes):
            stderr = stderr_raw.decode("utf-8", errors="ignore")
        else:
            stderr = stderr_raw
        stderr = stderr + f"\nCommand timed out after {timeout_seconds}s"
        return subprocess.CompletedProcess(cmd, 124, stdout, stderr)


def looks_like_youtube_bot_block(output: str) -> bool:
    lowered = output.lower()
    return "sign in to confirm you" in lowered and "not a bot" in lowered


def parse_last_json_line(stdout: str) -> Dict[str, Any]:
    for line in reversed(stdout.splitlines()):
        line = line.strip()
        if not line:
            continue
        if line == "null":
            break
        try:
            return json.loads(line)
        except json.JSONDecodeError:
            continue
    raise ValueError("Could not parse JSON metadata from yt-dlp output")


def platform_from_url(url: str) -> str:
    lowered = url.lower()
    if "youtube.com" in lowered or "youtu.be" in lowered:
        return "youtube"
    if "bilibili.com" in lowered or "b23.tv" in lowered:
        return "bilibili"
    return "unknown"


def format_duration(seconds: Optional[int]) -> Optional[str]:
    if seconds is None:
        return None
    hours, rem = divmod(seconds, 3600)
    minutes, secs = divmod(rem, 60)
    if hours:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def normalize_metadata(meta: Dict[str, Any], url: str, platform: str) -> Dict[str, Any]:
    duration = meta.get("duration")
    return {
        "id": meta.get("id"),
        "platform": platform,
        "url": meta.get("webpage_url") or meta.get("original_url") or url,
        "title": meta.get("title"),
        "uploader": meta.get("uploader"),
        "channel": meta.get("channel"),
        "uploader_id": meta.get("uploader_id"),
        "upload_date": meta.get("upload_date"),
        "duration_seconds": duration,
        "duration_string": meta.get("duration_string") or format_duration(duration),
        "view_count": meta.get("view_count"),
        "like_count": meta.get("like_count"),
        "comment_count": meta.get("comment_count"),
        "availability": meta.get("availability"),
        "live_status": meta.get("live_status"),
        "categories": meta.get("categories"),
        "tags": meta.get("tags"),
        "description": meta.get("description"),
        "chapters": meta.get("chapters"),
        "thumbnail": meta.get("thumbnail"),
    }


def vtt_to_text(raw: str) -> str:
    cleaned_lines: List[str] = []
    tag_pattern = re.compile(r"<[^>]+>")
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("WEBVTT") or line.startswith("Kind:") or line.startswith("Language:"):
            continue
        if line.startswith("NOTE"):
            continue
        if "-->" in line:
            continue
        if re.fullmatch(r"\d+", line):
            continue
        line = tag_pattern.sub("", line)
        line = html.unescape(line)
        if cleaned_lines and cleaned_lines[-1] == line:
            continue
        cleaned_lines.append(line)
    return "\n".join(cleaned_lines)


def select_subtitle_file(out_dir: Path) -> Optional[Path]:
    candidates = sorted(
        (p for p in out_dir.glob("*.vtt") if p.is_file()),
        key=lambda p: p.stat().st_size,
        reverse=True,
    )
    if not candidates:
        return None
    return candidates[0]


def select_audio_file(out_dir: Path) -> Optional[Path]:
    exts = {".mp3", ".m4a", ".webm", ".opus", ".aac", ".wav"}
    candidates = sorted(
        (p for p in out_dir.iterdir() if p.is_file() and p.suffix.lower() in exts),
        key=lambda p: p.stat().st_size,
        reverse=True,
    )
    if not candidates:
        return None
    return candidates[0]


def normalize_focus_section(raw: str) -> Optional[str]:
    token = raw.strip().lower().replace("-", "_").replace(" ", "_")
    if token in FOCUS_SECTION_ALIASES:
        return token
    for key, aliases in FOCUS_SECTION_ALIASES.items():
        if token == key:
            return key
        for alias in aliases:
            alias_token = alias.lower().replace("-", "_").replace(" ", "_")
            if token == alias_token:
                return key
    return None


def parse_focus_sections(raw: str) -> List[str]:
    if not raw.strip():
        return []
    ordered: List[str] = []
    for part in raw.split(","):
        key = normalize_focus_section(part)
        if key and key not in ordered:
            ordered.append(key)
    return ordered


def chapter_matches_section(title: str, section: str) -> bool:
    lowered = title.lower()
    for alias in FOCUS_SECTION_ALIASES.get(section, []):
        if alias.lower() in lowered:
            return True
    return False


def find_section_chapter(chapters: List[Dict[str, Any]], section: str) -> Optional[Dict[str, Any]]:
    for chapter in chapters:
        title = str(chapter.get("title") or "")
        if title and chapter_matches_section(title, section):
            return chapter
    return None


def load_timestamped_segments(path: Optional[Path]) -> List[Dict[str, Any]]:
    if not path or not path.exists():
        return []
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    raw_segments = payload.get("segments")
    if not isinstance(raw_segments, list):
        return []
    normalized: List[Dict[str, Any]] = []
    for seg in raw_segments:
        if not isinstance(seg, dict):
            continue
        text = str(seg.get("text") or "").strip()
        if not text:
            continue
        start = seg.get("start")
        if start is None:
            start = seg.get("start_time")
        end = seg.get("end")
        if end is None:
            end = seg.get("end_time")
        try:
            start_f = float(start)
        except (TypeError, ValueError):
            continue
        end_f: Optional[float]
        try:
            end_f = float(end) if end is not None else None
        except (TypeError, ValueError):
            end_f = None
        normalized.append({"start": start_f, "end": end_f, "text": text})
    return normalized


def format_mmss(seconds: Optional[float]) -> str:
    if seconds is None:
        return "unknown"
    total = int(seconds)
    mm, ss = divmod(total, 60)
    hh, mm = divmod(mm, 60)
    if hh:
        return f"{hh:02d}:{mm:02d}:{ss:02d}"
    return f"{mm:02d}:{ss:02d}"


def build_focus_sections(
    sections: List[str],
    chapters: List[Dict[str, Any]],
    segments: List[Dict[str, Any]],
    max_chars: int,
) -> Dict[str, Any]:
    items: List[Dict[str, Any]] = []
    for section in sections:
        chapter = find_section_chapter(chapters, section)
        if not chapter:
            items.append(
                {
                    "section": section,
                    "found": False,
                    "note": "No matching chapter title found for this section",
                }
            )
            continue

        start = chapter.get("start_time")
        end = chapter.get("end_time")
        try:
            start_f = float(start)
        except (TypeError, ValueError):
            start_f = None
        try:
            end_f = float(end) if end is not None else None
        except (TypeError, ValueError):
            end_f = None

        selected: List[Dict[str, Any]] = []
        if start_f is not None:
            for seg in segments:
                s_start = float(seg.get("start", -1))
                if s_start < start_f:
                    continue
                if end_f is not None and s_start >= end_f:
                    continue
                selected.append(seg)

        joined = " ".join(seg["text"] for seg in selected).strip()
        excerpt = joined[:max_chars]
        sample_segments = [str(seg.get("text") or "").strip() for seg in selected[:24]]
        sample_segments = [seg for seg in sample_segments if seg]
        items.append(
            {
                "section": section,
                "found": True,
                "chapter_title": chapter.get("title"),
                "start_time": start_f,
                "end_time": end_f,
                "start_label": format_mmss(start_f),
                "end_label": format_mmss(end_f),
                "segment_count": len(selected),
                "excerpt": excerpt,
                "excerpt_truncated": len(joined) > len(excerpt),
                "sample_segments": sample_segments,
            }
        )

    return {"requested_sections": sections, "items": items}


def render_focus_sections_markdown(payload: Dict[str, Any]) -> str:
    lines = ["# Focused Sections", ""]
    for item in payload.get("items", []):
        section = item.get("section", "unknown")
        lines.append(f"## {section}")
        if not item.get("found"):
            lines.append(f"- Status: not found")
            lines.append(f"- Note: {item.get('note')}")
            lines.append("")
            continue
        lines.append(f"- Chapter: {item.get('chapter_title')}")
        lines.append(f"- Time range: {item.get('start_label')} - {item.get('end_label')}")
        lines.append(f"- Segment count: {item.get('segment_count')}")
        excerpt = str(item.get("excerpt") or "").strip()
        if excerpt:
            lines.append("")
            lines.append(excerpt)
            lines.append("")
        else:
            lines.append("- Excerpt: unavailable (no timestamped transcript segments)")
            lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def normalize_digest_line(text: str, max_chars: int = 220) -> str:
    line = re.sub(r"\s+", " ", text).strip()
    line = line.strip("-")
    if len(line) > max_chars:
        line = line[:max_chars].rstrip() + "..."
    return line


def candidate_to_digest_fragments(
    candidate: str,
    max_chars: int = 180,
    max_tokens: int = 18,
) -> List[str]:
    base = re.sub(r"\s+", " ", candidate).strip()
    if not base:
        return []

    parts = re.split(r"[。！？!?；;]\s*|，\s*|,\s*", base)
    fragments: List[str] = []
    for part in parts:
        line = normalize_digest_line(part, max_chars=max_chars)
        if len(line) >= 12:
            fragments.append(line)

    if len(fragments) >= 2:
        return fragments

    tokens = base.split(" ")
    if len(tokens) > max_tokens:
        chunks: List[str] = []
        for idx in range(0, len(tokens), max_tokens):
            chunk = " ".join(tokens[idx : idx + max_tokens])
            line = normalize_digest_line(chunk, max_chars=max_chars)
            if len(line) >= 12:
                chunks.append(line)
        if chunks:
            return chunks

    char_chunks: List[str] = []
    if len(base) > max_chars:
        for idx in range(0, len(base), max_chars):
            chunk = base[idx : idx + max_chars]
            line = normalize_digest_line(chunk, max_chars=max_chars)
            if len(line) >= 12:
                char_chunks.append(line)
        if char_chunks:
            return char_chunks

    single = normalize_digest_line(base, max_chars=max_chars)
    return [single] if len(single) >= 12 else []


def build_focus_digest(payload: Dict[str, Any], bullet_limit: int) -> Dict[str, Any]:
    items: List[Dict[str, Any]] = []
    for item in payload.get("items", []):
        section = str(item.get("section") or "unknown")
        found = bool(item.get("found"))
        if not found:
            items.append(
                {
                    "section": section,
                    "found": False,
                    "note": item.get("note") or "No section data found",
                    "bullets": [],
                }
            )
            continue

        raw_candidates: List[str] = []
        for seg in item.get("sample_segments") or []:
            raw_candidates.append(str(seg))
        excerpt = str(item.get("excerpt") or "")
        if excerpt:
            raw_candidates.extend(re.split(r"[。！？!?]\s*|\.\s+|\n+", excerpt))

        bullets: List[str] = []
        for candidate in raw_candidates:
            for line in candidate_to_digest_fragments(candidate):
                duplicate = False
                for existing in bullets:
                    if line in existing or existing in line:
                        duplicate = True
                        break
                if duplicate:
                    continue
                bullets.append(line)
                if len(bullets) >= bullet_limit:
                    break
            if len(bullets) >= bullet_limit:
                break

        if not bullets and excerpt:
            fallback = normalize_digest_line(excerpt)
            if fallback:
                bullets.append(fallback)

        items.append(
            {
                "section": section,
                "found": True,
                "chapter_title": item.get("chapter_title"),
                "start_label": item.get("start_label"),
                "end_label": item.get("end_label"),
                "segment_count": item.get("segment_count"),
                "bullets": bullets,
            }
        )
    return {"items": items}


def render_focus_digest_markdown(payload: Dict[str, Any]) -> str:
    lines = ["# Focused Section Digest", ""]
    for item in payload.get("items", []):
        section = item.get("section", "unknown")
        lines.append(f"## {section}")
        if not item.get("found"):
            lines.append("- Status: not found")
            lines.append(f"- Note: {item.get('note')}")
            lines.append("")
            continue
        lines.append(f"- Chapter: {item.get('chapter_title')}")
        lines.append(f"- Time range: {item.get('start_label')} - {item.get('end_label')}")
        lines.append(f"- Segment count: {item.get('segment_count')}")
        bullets = item.get("bullets") or []
        if bullets:
            lines.append("- Key details:")
            for bullet in bullets:
                lines.append(f"  - {bullet}")
        else:
            lines.append("- Key details: unavailable")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def dump_metadata(url: str, cookies_browser: Optional[str]) -> Tuple[Dict[str, Any], bool]:
    base_cmd = ["yt-dlp", *BASE_YTDLP_FLAGS, "--dump-single-json", url]
    proc = run_cmd(base_cmd)
    combined = f"{proc.stdout}\n{proc.stderr}"
    used_cookies = False

    if proc.returncode != 0 and cookies_browser and looks_like_youtube_bot_block(combined):
        retry_cmd = [
            "yt-dlp",
            *BASE_YTDLP_FLAGS,
            "--cookies-from-browser",
            cookies_browser,
            "--dump-single-json",
            url,
        ]
        proc = run_cmd(retry_cmd)
        combined = f"{proc.stdout}\n{proc.stderr}"
        used_cookies = True

    if proc.returncode != 0:
        raise RuntimeError(combined.strip() or "yt-dlp metadata extraction failed")

    return parse_last_json_line(proc.stdout), used_cookies


def download_audio(
    url: str,
    out_dir: Path,
    cookies_browser: Optional[str],
    used_cookies: bool,
) -> Tuple[Optional[Path], bool]:
    audio_cmd = [
        "yt-dlp",
        *BASE_YTDLP_FLAGS,
        "--no-playlist",
        "--format",
        "ba/b",
        "--extract-audio",
        "--audio-format",
        "mp3",
        "--output",
        str(out_dir / "%(id)s.%(ext)s"),
        url,
    ]
    if used_cookies and cookies_browser:
        audio_cmd[1:1] = ["--cookies-from-browser", cookies_browser]
    proc = run_cmd(audio_cmd, timeout_seconds=420)
    if proc.returncode == 0:
        return select_audio_file(out_dir), used_cookies

    combined = f"{proc.stdout}\n{proc.stderr}"
    if (not used_cookies) and cookies_browser and looks_like_youtube_bot_block(combined):
        retry_cmd = audio_cmd[:]
        retry_cmd[1:1] = ["--cookies-from-browser", cookies_browser]
        retry_proc = run_cmd(retry_cmd, timeout_seconds=420)
        if retry_proc.returncode == 0:
            return select_audio_file(out_dir), True

    return None, used_cookies


def transcribe_with_openai(
    audio_path: Path,
    model_candidates: List[str],
    timeout_seconds: int = 600,
) -> Tuple[str, Optional[List[Dict[str, Any]]], str]:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    errors: List[str] = []
    for model in model_candidates:
        cmd = [
            "curl",
            "-sS",
            "https://api.openai.com/v1/audio/transcriptions",
            "-H",
            f"Authorization: Bearer {api_key}",
            "-F",
            f"file=@{audio_path}",
            "-F",
            f"model={model}",
            "-F",
            "response_format=verbose_json",
        ]
        proc = run_cmd(cmd, timeout_seconds=timeout_seconds)
        if proc.returncode != 0:
            errors.append(f"{model}: curl exit {proc.returncode}")
            continue
        try:
            payload = json.loads(proc.stdout)
        except json.JSONDecodeError:
            errors.append(f"{model}: invalid JSON")
            continue

        if isinstance(payload, dict) and "error" in payload:
            err = payload.get("error", {})
            msg = err.get("message") if isinstance(err, dict) else str(err)
            errors.append(f"{model}: {msg}")
            continue

        text = ""
        segments: Optional[List[Dict[str, Any]]] = None
        if isinstance(payload, dict):
            text = (payload.get("text") or "").strip()
            seg = payload.get("segments")
            if isinstance(seg, list):
                segments = seg
        if text:
            return text, segments, model
        errors.append(f"{model}: no text in response")

    raise RuntimeError("OpenAI transcription failed: " + " | ".join(errors))


def transcribe_with_faster_whisper(
    audio_path: Path,
    model_name: str,
) -> Tuple[str, Optional[List[Dict[str, Any]]], str]:
    try:
        from faster_whisper import WhisperModel
    except Exception as exc:
        raise RuntimeError(f"faster-whisper import failed: {exc}") from exc

    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments_iter, _info = model.transcribe(str(audio_path), vad_filter=True, beam_size=5)
    segments: List[Dict[str, Any]] = []
    texts: List[str] = []
    for seg in segments_iter:
        text = (seg.text or "").strip()
        if not text:
            continue
        texts.append(text)
        segments.append(
            {
                "start": float(seg.start),
                "end": float(seg.end),
                "text": text,
            }
        )
    transcript = "\n".join(texts).strip()
    if not transcript:
        raise RuntimeError("faster-whisper produced empty transcript")
    return transcript, segments, f"faster-whisper:{model_name}"


def fetch_subtitles(
    url: str,
    out_dir: Path,
    cookies_browser: Optional[str],
    used_cookies: bool,
    sub_langs: str,
) -> bool:
    subtitle_cmd = [
        "yt-dlp",
        *BASE_YTDLP_FLAGS,
        "--skip-download",
        "--write-subs",
        "--write-auto-subs",
        "--sub-langs",
        sub_langs,
        "--convert-subs",
        "vtt",
        "--output",
        str(out_dir / "%(id)s.%(ext)s"),
        url,
    ]
    if used_cookies and cookies_browser:
        subtitle_cmd[1:1] = ["--cookies-from-browser", cookies_browser]
    proc = run_cmd(subtitle_cmd, timeout_seconds=360)
    if proc.returncode == 0:
        return used_cookies

    combined = f"{proc.stdout}\n{proc.stderr}"
    if (not used_cookies) and cookies_browser and looks_like_youtube_bot_block(combined):
        retry_cmd = subtitle_cmd[:]
        retry_cmd[1:1] = ["--cookies-from-browser", cookies_browser]
        retry_proc = run_cmd(retry_cmd, timeout_seconds=360)
        if retry_proc.returncode == 0:
            return True
    return used_cookies


def write_json(path: Path, payload: Dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", required=True, help="Video URL (YouTube/Bilibili)")
    parser.add_argument("--out-dir", required=True, help="Output directory")
    parser.add_argument(
        "--cookies-from-browser",
        default="chrome",
        help="Browser for yt-dlp cookie retry (default: chrome)",
    )
    parser.add_argument(
        "--metadata-only",
        action="store_true",
        help="Skip subtitle fetch and transcript extraction",
    )
    parser.add_argument(
        "--sub-langs",
        default=DEFAULT_SUB_LANGS,
        help=f"Subtitle language selector passed to yt-dlp (default: {DEFAULT_SUB_LANGS})",
    )
    parser.add_argument(
        "--asr-provider",
        choices=["off", "auto", "openai", "faster-whisper"],
        default="auto",
        help="Fallback ASR provider when subtitles are unavailable (default: auto)",
    )
    parser.add_argument(
        "--openai-models",
        default=DEFAULT_OPENAI_MODELS,
        help=f"Comma-separated OpenAI transcription models (default: {DEFAULT_OPENAI_MODELS})",
    )
    parser.add_argument(
        "--faster-whisper-model",
        default=DEFAULT_FASTER_WHISPER_MODEL,
        help=f"faster-whisper model name (default: {DEFAULT_FASTER_WHISPER_MODEL})",
    )
    parser.add_argument(
        "--focus-sections",
        default="",
        help="Comma-separated sections for chapter-range extraction (e.g. image,phone,export,knowledge_graph)",
    )
    parser.add_argument(
        "--focus-max-chars",
        type=int,
        default=3000,
        help="Max characters per focused-section excerpt (default: 3000)",
    )
    parser.add_argument(
        "--focus-digest-bullets",
        type=int,
        default=DEFAULT_FOCUS_DIGEST_BULLETS,
        help=f"Max bullets per focused section digest (default: {DEFAULT_FOCUS_DIGEST_BULLETS})",
    )
    args = parser.parse_args()

    out_dir = Path(args.out_dir).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    platform = platform_from_url(args.url)

    try:
        raw_meta, used_cookies = dump_metadata(args.url, args.cookies_from_browser)
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        return 1

    raw_metadata_path = out_dir / "raw_metadata.json"
    metadata_summary_path = out_dir / "metadata_summary.json"
    transcript_path = out_dir / "transcript.txt"
    transcript_meta_path = out_dir / "transcript_meta.json"
    bundle_path = out_dir / "bundle.json"

    write_json(raw_metadata_path, raw_meta)
    summary = normalize_metadata(raw_meta, args.url, platform)
    write_json(metadata_summary_path, summary)

    transcript_source = "metadata-only"
    subtitle_file: Optional[Path] = None
    audio_file: Optional[Path] = None
    asr_model_used: Optional[str] = None
    asr_error: Optional[str] = None
    asr_segments_path: Optional[Path] = None
    transcript_chars = 0
    transcript_lines = 0

    if not args.metadata_only:
        used_cookies = fetch_subtitles(
            args.url,
            out_dir,
            args.cookies_from_browser,
            used_cookies,
            args.sub_langs,
        )
        subtitle_file = select_subtitle_file(out_dir)
        if subtitle_file:
            raw_vtt = subtitle_file.read_text(encoding="utf-8", errors="ignore")
            transcript = vtt_to_text(raw_vtt).strip()
            if transcript:
                transcript_path.write_text(transcript + "\n", encoding="utf-8")
                transcript_chars = len(transcript)
                transcript_lines = len(transcript.splitlines())
                transcript_source = "subtitle-vtt"
            else:
                transcript_source = "metadata-only"

    should_try_asr = (not args.metadata_only) and transcript_source == "metadata-only" and args.asr_provider != "off"
    if should_try_asr:
        audio_file, used_cookies = download_audio(args.url, out_dir, args.cookies_from_browser, used_cookies)
        if audio_file:
            asr_errors: List[str] = []

            if args.asr_provider in {"auto", "faster-whisper"}:
                try:
                    transcript, segments, asr_model_used = transcribe_with_faster_whisper(
                        audio_file, args.faster_whisper_model
                    )
                    transcript = transcript.strip()
                    transcript_path.write_text(transcript + "\n", encoding="utf-8")
                    transcript_chars = len(transcript)
                    transcript_lines = len(transcript.splitlines())
                    transcript_source = "asr-faster-whisper"
                    if segments:
                        asr_segments_path = out_dir / "asr_segments.json"
                        write_json(asr_segments_path, {"segments": segments})
                except Exception as exc:
                    asr_errors.append(f"faster-whisper: {exc}")

            if transcript_source == "metadata-only" and args.asr_provider in {"auto", "openai"}:
                try:
                    model_candidates = [m.strip() for m in args.openai_models.split(",") if m.strip()]
                    transcript, segments, asr_model_used = transcribe_with_openai(audio_file, model_candidates)
                    transcript = transcript.strip()
                    transcript_path.write_text(transcript + "\n", encoding="utf-8")
                    transcript_chars = len(transcript)
                    transcript_lines = len(transcript.splitlines())
                    transcript_source = "asr-openai"
                    if segments:
                        asr_segments_path = out_dir / "asr_segments.json"
                        write_json(asr_segments_path, {"segments": segments})
                except Exception as exc:
                    asr_errors.append(f"openai: {exc}")

            if asr_errors and transcript_source == "metadata-only":
                asr_error = " | ".join(asr_errors)

    transcript_meta = {
        "source": transcript_source,
        "source_file": str(subtitle_file) if subtitle_file else None,
        "audio_file": str(audio_file) if audio_file else None,
        "asr_model_used": asr_model_used,
        "asr_error": asr_error,
        "line_count": transcript_lines,
        "char_count": transcript_chars,
    }
    write_json(transcript_meta_path, transcript_meta)

    focus_sections = parse_focus_sections(args.focus_sections)
    focused_sections_json_path: Optional[Path] = None
    focused_sections_md_path: Optional[Path] = None
    focused_section_digest_json_path: Optional[Path] = None
    focused_section_digest_md_path: Optional[Path] = None
    if focus_sections:
        chapters = summary.get("chapters") if isinstance(summary.get("chapters"), list) else []
        segments = load_timestamped_segments(asr_segments_path)
        focused_payload = build_focus_sections(focus_sections, chapters, segments, args.focus_max_chars)
        focused_sections_json_path = out_dir / "focused_sections.json"
        focused_sections_md_path = out_dir / "focused_sections.md"
        write_json(focused_sections_json_path, focused_payload)
        focused_sections_md_path.write_text(render_focus_sections_markdown(focused_payload), encoding="utf-8")
        focused_digest_payload = build_focus_digest(focused_payload, max(1, args.focus_digest_bullets))
        focused_section_digest_json_path = out_dir / "focused_section_digest.json"
        focused_section_digest_md_path = out_dir / "focused_section_digest.md"
        write_json(focused_section_digest_json_path, focused_digest_payload)
        focused_section_digest_md_path.write_text(
            render_focus_digest_markdown(focused_digest_payload), encoding="utf-8"
        )

    bundle = {
        "url": args.url,
        "platform": platform,
        "used_cookie_retry": used_cookies,
        "metadata_path": str(metadata_summary_path),
        "raw_metadata_path": str(raw_metadata_path),
        "transcript_path": str(transcript_path if transcript_path.exists() else ""),
        "transcript_meta_path": str(transcript_meta_path),
        "transcript_source": transcript_source,
        "subtitle_file": str(subtitle_file) if subtitle_file else None,
        "audio_file": str(audio_file) if audio_file else None,
        "asr_provider": args.asr_provider,
        "asr_model_used": asr_model_used,
        "asr_error": asr_error,
        "asr_segments_path": str(asr_segments_path) if asr_segments_path else None,
        "focus_sections_requested": focus_sections,
        "focused_sections_json_path": str(focused_sections_json_path) if focused_sections_json_path else None,
        "focused_sections_md_path": str(focused_sections_md_path) if focused_sections_md_path else None,
        "focused_section_digest_json_path": (
            str(focused_section_digest_json_path) if focused_section_digest_json_path else None
        ),
        "focused_section_digest_md_path": (
            str(focused_section_digest_md_path) if focused_section_digest_md_path else None
        ),
    }
    write_json(bundle_path, bundle)

    print(json.dumps(bundle, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
