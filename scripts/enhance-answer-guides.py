#!/usr/bin/env python3
"""
Batch-convert <details><summary>Answer Guide</summary> blocks in all course notes
to Obsidian-native > [!example]- callout format with per-question #### headings.

Usage:
    python3 scripts/enhance-answer-guides.py [--dry-run]

Requires: ANTHROPIC_API_KEY in environment
"""

import re
import sys
import subprocess
from pathlib import Path

COURSES_ROOT = Path(__file__).parent.parent / "courses"
DRY_RUN = "--dry-run" in sys.argv

DETAILS_PATTERN = re.compile(
    r"<details>\s*<summary>(?:Answer Guide|答案指南)</summary>(.*?)</details>",
    re.DOTALL | re.IGNORECASE,
)

POST_TEST_PATTERN = re.compile(
    r"## Post-test.*?(?=\n<details>|\Z)",
    re.DOTALL,
)

SYSTEM_PROMPT = """\
You are a markdown formatter. You convert answer guides from HTML <details> blocks \
into Obsidian-native collapsible callout format.

Rules:
- Output ONLY the replacement block — no preamble, no explanation, no fences
- Start with: > [!example]- Answer Guide
- Each answer gets its own #### heading: #### Q1 — [short descriptive title]
- Every line of content must start with "> " (callout prefix)
- Blank separator lines inside the callout: just "> " (not empty)
- Tables inside the callout: each row starts with "> |"
- Math, bold, code, bullets all stay inside the callout with "> " prefix
- Preserve all content and math exactly — do not summarize or shorten
- The title after "Qn — " should be 3–6 words summarising that question's topic
- Do NOT include a trailing blank line or closing tag
"""

USER_TEMPLATE = """\
## Post-test questions (for context — use these to derive #### Qn titles)

{post_test}

## Current answer guide to reformat

{details_block}
"""


def find_files() -> list[Path]:
    return [
        p for p in COURSES_ROOT.rglob("*.md")
        if DETAILS_PATTERN.search(p.read_text(encoding="utf-8"))
    ]


def extract_post_test(text: str) -> str:
    m = POST_TEST_PATTERN.search(text)
    return m.group(0).strip() if m else ""


def reformat(post_test: str, details_block: str) -> str:
    prompt = SYSTEM_PROMPT + "\n\n" + USER_TEMPLATE.format(
        post_test=post_test,
        details_block=details_block.strip(),
    )
    result = subprocess.run(
        ["claude", "-p", prompt],
        capture_output=True, text=True, check=True,
    )
    return result.stdout.strip()


def process_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    match = DETAILS_PATTERN.search(text)
    if not match:
        return False

    post_test = extract_post_test(text)
    details_block = match.group(0)

    print(f"  reformatting {path.relative_to(COURSES_ROOT.parent)} ...", end=" ", flush=True)
    callout = reformat(post_test, details_block)

    new_text = text[: match.start()] + callout + text[match.end() :]

    if DRY_RUN:
        print("(dry-run, skipped write)")
        print("--- preview ---")
        print(callout[:400])
        print("---")
    else:
        path.write_text(new_text, encoding="utf-8")
        print("done")

    return True


def main() -> None:
    files = find_files()
    if not files:
        print("No files with <details> answer guides found.")
        return

    print(f"Found {len(files)} file(s) to enhance{' (dry-run)' if DRY_RUN else ''}:\n")
    for f in files:
        print(f"  {f.relative_to(COURSES_ROOT.parent)}")
    print()

    ok = skipped = 0
    for path in files:
        try:
            if process_file(path):
                ok += 1
        except Exception as exc:
            print(f"ERROR: {exc}")
            skipped += 1

    print(f"\nDone: {ok} enhanced, {skipped} failed.")


if __name__ == "__main__":
    main()
