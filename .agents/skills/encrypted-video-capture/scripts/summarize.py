#!/usr/bin/env python3
"""summarize.py — Headless transcript -> lecture note via OpenRouter.

Turns one captured lecture transcript into a structured Simplified-Chinese
(简体字) Markdown note following content-summarizer's lecture-text template,
with the repo-mandated frontmatter (tags + source). This is what removes the
manual "summarize NNN" step from the loop; the supervisor calls it per lecture.

Usage:
  summarize.py --transcript <file> --out <file.md> --title <raw> --url <src>
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request

SKILL_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
TEMPLATE = os.path.join(SKILL_DIR, "..", "content-summarizer", "references", "template-lecture-text.md")
DEFAULT_MODEL = "openai/gpt-4o-mini"
BASE_URL = "https://openrouter.ai/api/v1/chat/completions"


def read_text(path, default=""):
    try:
        with open(path, encoding="utf-8") as fh:
            return fh.read()
    except OSError:
        return default


def build_prompt(template, transcript, title, url):
    """Compose the system+user messages for the summariser call."""
    system = (
        "You are a lecture-notes writer. Output ENTIRELY in Simplified Chinese "
        "(简体字) — never Traditional characters. Follow the given Markdown "
        "template exactly. Every bullet must be concrete: attach a specific "
        "number, named tool/command, or example. Begin the file with YAML "
        "frontmatter containing a `tags` array and the `source` URL."
    )
    user = (
        f"# Lecture title\n{title}\n\n# Source URL\n{url}\n\n"
        f"# Template to follow\n{template}\n\n"
        f"# Transcript\n{transcript}\n"
    )
    return system, user


def call_openrouter(system, user, model, timeout):
    """POST a chat completion to OpenRouter; return the message content."""
    key = os.environ.get("OPENROUTER_API_KEY")
    if not key:
        raise RuntimeError("OPENROUTER_API_KEY is not set")
    body = json.dumps({
        "model": model,
        "messages": [{"role": "system", "content": system},
                     {"role": "user", "content": user}],
        "temperature": 0.3,
    }).encode("utf-8")
    req = urllib.request.Request(BASE_URL, data=body, method="POST", headers={
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        payload = json.load(resp)
    return payload["choices"][0]["message"]["content"].strip()


def ensure_frontmatter(text, title, url):
    """Guarantee the repo-required frontmatter even if the model omitted it."""
    if text.lstrip().startswith("---"):
        return text
    front = f"---\ntags: [course, lecture]\nsource: {url}\ntitle: {title}\n---\n\n"
    return front + text


def write_note(out_path, text):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(text if text.endswith("\n") else text + "\n")


def main(argv):
    ap = argparse.ArgumentParser(description="Headless lecture summariser")
    ap.add_argument("--transcript", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--title", default="")
    ap.add_argument("--url", default="")
    ap.add_argument("--model", default=os.environ.get("OPENROUTER_SUMMARY_MODEL", DEFAULT_MODEL))
    ap.add_argument("--timeout", type=int, default=300)
    args = ap.parse_args(argv)

    if os.path.exists(args.out) and os.path.getsize(args.out) > 0:
        print(f"INFO: summary already exists, skipping: {args.out}")
        return 0

    transcript = read_text(args.transcript)
    if not transcript.strip():
        print(f"ERROR: empty transcript: {args.transcript}", file=sys.stderr)
        return 2

    template = read_text(TEMPLATE)
    system, user = build_prompt(template, transcript, args.title, args.url)
    try:
        content = call_openrouter(system, user, args.model, args.timeout)
    except (urllib.error.URLError, RuntimeError, KeyError) as exc:
        print(f"ERROR: summarisation failed: {exc}", file=sys.stderr)
        return 2

    write_note(args.out, ensure_frontmatter(content, args.title, args.url))
    print(f"INFO: wrote summary -> {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
