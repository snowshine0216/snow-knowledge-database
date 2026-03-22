#!/usr/bin/env python3
"""Extract Medium article content using browser-cookie authenticated access.

This script:
1) Exports cookies from a local browser via yt-dlp.
2) Sends an impersonated browser request with curl_cffi.
3) Parses Medium APOLLO_STATE payload.
4) Writes normalized markdown + metadata artifacts.
"""

import argparse
import datetime as dt
import http.cookiejar
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse

try:
    from curl_cffi import requests as cffi_requests
except Exception as exc:
    print(
        "ERROR: curl_cffi is required. Install with: "
        "python3 -m pip install --user curl_cffi",
        file=sys.stderr,
    )
    raise


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract full Medium article text with browser cookies."
    )
    parser.add_argument("--url", required=True, help="Medium article URL")
    parser.add_argument(
        "--out-dir",
        default="/tmp/medium-member-summarizer",
        help="Output directory",
    )
    parser.add_argument(
        "--cookies-from-browser",
        default="chrome",
        help="Browser name for yt-dlp cookie export (default: chrome)",
    )
    parser.add_argument(
        "--impersonate",
        default="chrome136",
        help="curl_cffi impersonation profile (default: chrome136)",
    )
    parser.add_argument(
        "--timeout-seconds",
        type=int,
        default=90,
        help="HTTP timeout in seconds",
    )
    return parser.parse_args()


def export_cookies(url: str, browser: str, cookie_file: Path) -> Tuple[int, str, str]:
    cmd = [
        "yt-dlp",
        "--cookies-from-browser",
        browser,
        "--cookies",
        str(cookie_file),
        "--skip-download",
        url,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    return proc.returncode, proc.stdout, proc.stderr


def load_relevant_cookies(cookie_file: Path, url: str) -> Dict[str, str]:
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    host_parts = host.split(".")
    root_domain = ".".join(host_parts[-2:]) if len(host_parts) >= 2 else host

    jar = http.cookiejar.MozillaCookieJar(str(cookie_file))
    jar.load(ignore_discard=True, ignore_expires=True)

    loaded = {}
    for cookie in jar:
        domain = cookie.domain.lower().lstrip(".")
        if (
            domain == host
            or domain.endswith("." + host)
            or domain == root_domain
            or domain.endswith("." + root_domain)
            or domain.endswith(".medium.com")
        ):
            loaded[f"{cookie.domain}|{cookie.path}|{cookie.name}"] = cookie.value
    return loaded


def fetch_html(
    url: str,
    cookies: Dict[str, str],
    impersonate: str,
    timeout_seconds: int,
) -> str:
    session = cffi_requests.Session(impersonate=impersonate)
    for key, value in cookies.items():
        domain, path, name = key.split("|", 2)
        session.cookies.set(name, value, domain=domain, path=path)
    response = session.get(url, timeout=timeout_seconds)
    response.raise_for_status()
    return response.text


def extract_apollo_state(html: str) -> dict:
    match = re.search(
        r"window\.__APOLLO_STATE__\s*=\s*(\{.*?\})</script><script",
        html,
        re.S,
    )
    if not match:
        raise RuntimeError("Could not find window.__APOLLO_STATE__ payload")
    return json.loads(match.group(1))


def choose_post(apollo_state: dict) -> Tuple[str, dict]:
    post_items = [
        (key, value)
        for key, value in apollo_state.items()
        if key.startswith("Post:") and isinstance(value, dict)
    ]
    if not post_items:
        raise RuntimeError("No Post:* objects found in APOLLO state")

    # Prefer posts that have content() and title
    scored = []
    for key, value in post_items:
        content_keys = [k for k in value.keys() if k.startswith("content(")]
        score = 0
        if content_keys:
            score += 10
        if value.get("title"):
            score += 5
        if value.get("isPublished") is True:
            score += 2
        scored.append((score, key, value))
    scored.sort(reverse=True)
    _, best_key, best_post = scored[0]
    return best_key, best_post


def extract_article_markdown(apollo_state: dict, post: dict) -> str:
    content_keys = [k for k in post.keys() if k.startswith("content(")]
    if not content_keys:
        raise RuntimeError("Post has no content(...) key")

    content_obj = post[content_keys[0]]
    body = content_obj.get("bodyModel", {})
    paragraphs = body.get("paragraphs", [])

    lines: List[str] = []
    ordered_idx = 0

    for ref_item in paragraphs:
        ref = ref_item.get("__ref")
        if not ref:
            continue
        para = apollo_state.get(ref, {})
        text = (para.get("text") or "").strip()
        para_type = para.get("type")
        if not text:
            continue

        if para_type in {"H1", "H2", "H3", "H4"}:
            lines.append("")
            lines.append(f"## {text}")
            ordered_idx = 0
        elif para_type == "OLI":
            ordered_idx += 1
            lines.append(f"{ordered_idx}. {text}")
        elif para_type == "ULI":
            lines.append(f"- {text}")
        elif para_type == "BQ":
            lines.append(f"> {text}")
            ordered_idx = 0
        elif para_type in {"IMG", "IFRAME"}:
            continue
        else:
            lines.append(text)
            ordered_idx = 0

    return "\n".join(lines).strip() + "\n"


def to_iso_from_millis(ms_value: Optional[int]) -> Optional[str]:
    if ms_value is None:
        return None
    try:
        return dt.datetime.fromtimestamp(ms_value / 1000, tz=dt.timezone.utc).isoformat()
    except Exception:
        return None


def find_author(apollo_state: dict, post: dict) -> Tuple[Optional[str], Optional[str]]:
    creator_ref = post.get("creator", {})
    creator_id = creator_ref.get("__ref") if isinstance(creator_ref, dict) else None
    creator = apollo_state.get(creator_id, {}) if creator_id else {}
    return creator.get("name"), creator.get("username")


def main() -> int:
    args = parse_args()
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    bundle = {
        "url": args.url,
        "cookies_from_browser": args.cookies_from_browser,
        "impersonate": args.impersonate,
        "steps": {},
    }

    with tempfile.TemporaryDirectory(prefix="medium-cookies-") as tmp_dir:
        cookie_file = Path(tmp_dir) / "cookies.txt"
        rc, stdout, stderr = export_cookies(
            args.url, args.cookies_from_browser, cookie_file
        )
        bundle["steps"]["cookie_export"] = {
            "returncode": rc,
            "stdout_tail": stdout[-8000:],
            "stderr_tail": stderr[-8000:],
            "cookie_file_exists": cookie_file.exists(),
        }

        if not cookie_file.exists():
            raise RuntimeError("Cookie export failed: cookies file not created")

        cookies = load_relevant_cookies(cookie_file, args.url)
        bundle["steps"]["cookie_filter"] = {"cookie_count": len(cookies)}

        html = fetch_html(
            args.url,
            cookies,
            impersonate=args.impersonate,
            timeout_seconds=args.timeout_seconds,
        )
        raw_path = out_dir / "raw_article.html"
        raw_path.write_text(html, encoding="utf-8")

    regwall_marker = "Create an account to read the full story" in html
    challenge_marker = "Performing security verification" in html

    apollo_state = extract_apollo_state(html)
    post_key, post = choose_post(apollo_state)
    markdown = extract_article_markdown(apollo_state, post)
    (out_dir / "article_extracted.md").write_text(markdown, encoding="utf-8")

    author_name, author_username = find_author(apollo_state, post)
    metadata = {
        "url": args.url,
        "post_key": post_key,
        "title": post.get("title"),
        "subtitle": ((post.get("previewContent") or {}).get("subtitle")),
        "author_name": author_name,
        "author_username": author_username,
        "published_at_iso": to_iso_from_millis(post.get("firstPublishedAt")),
        "latest_published_at_iso": to_iso_from_millis(post.get("latestPublishedAt")),
        "reading_time_minutes": post.get("readingTime"),
        "word_count": post.get("wordCount"),
        "is_locked": post.get("isLocked"),
        "visibility": post.get("visibility"),
        "is_limited_state": post.get("isLimitedState"),
        "regwall_marker_found": regwall_marker,
        "security_challenge_marker_found": challenge_marker,
    }
    (out_dir / "metadata_summary.json").write_text(
        json.dumps(metadata, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    bundle["steps"]["content_parse"] = {
        "title": metadata["title"],
        "article_chars": len(markdown),
        "regwall_marker_found": regwall_marker,
        "security_challenge_marker_found": challenge_marker,
    }
    (out_dir / "bundle.json").write_text(
        json.dumps(bundle, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    print(f"Saved: {out_dir / 'metadata_summary.json'}")
    print(f"Saved: {out_dir / 'article_extracted.md'}")
    print(f"Saved: {out_dir / 'bundle.json'}")
    print(f"Saved: {out_dir / 'raw_article.html'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
