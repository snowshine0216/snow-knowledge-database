#!/usr/bin/env python3
"""Summarize StatQuest Neural Networks PDF chapter by chapter using the claude CLI."""

import os
import subprocess
import sys
import pdfplumber

PDF_PATH = os.path.expanduser("~/Documents/PersonalFolder/signa_6x9_fullsize_v3.3.1.pdf")
OUTPUT_DIR = "courses/statquest-neural-networks-and-ai"
SOURCE = "https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/"

# (filename, title, start_page_0indexed, end_page_0indexed, tags)
CHAPTERS = [
    (
        "ch01-fundamental-concepts",
        "Fundamental Concepts in Neural Networks and AI",
        10, 27,
        ["statquest", "neural-networks", "fundamentals", "deep-learning", "weights", "biases", "activation-functions"],
    ),
    (
        "ch02-backpropagation",
        "Optimizing Weights and Biases with Backpropagation",
        28, 77,
        ["statquest", "neural-networks", "backpropagation", "gradient-descent", "optimization", "deep-learning"],
    ),
    (
        "ch03-multiple-inputs-outputs",
        "Networks with Multiple Inputs and Outputs",
        78, 91,
        ["statquest", "neural-networks", "multi-input", "multi-output", "deep-learning"],
    ),
    (
        "ch04-argmax-softmax",
        "Simplifying Outputs with ArgMax and SoftMax",
        92, 104,
        ["statquest", "neural-networks", "softmax", "argmax", "classification", "deep-learning"],
    ),
    (
        "ch05-cross-entropy",
        "Speeding Up Training with Cross Entropy",
        105, 126,
        ["statquest", "neural-networks", "cross-entropy", "loss-function", "training", "deep-learning"],
    ),
    (
        "ch06-cnn",
        "Image Classification with Convolutional Neural Networks",
        127, 139,
        ["statquest", "cnn", "convolutional-neural-networks", "image-classification", "deep-learning"],
    ),
    (
        "ch07-rnn",
        "Stock Prediction with Recurrent Neural Networks",
        140, 159,
        ["statquest", "rnn", "recurrent-neural-networks", "sequence-modeling", "time-series", "deep-learning"],
    ),
    (
        "ch08-lstm",
        "Better Stock Prediction with Long Short-Term Memory",
        160, 177,
        ["statquest", "lstm", "long-short-term-memory", "sequence-modeling", "gating", "deep-learning"],
    ),
    (
        "ch09-word-embedding",
        "Converting Words to Numbers with Word Embedding",
        178, 189,
        ["statquest", "word-embedding", "word2vec", "nlp", "embeddings", "deep-learning"],
    ),
    (
        "ch10-seq2seq",
        "Language Translation with Seq2seq and Encoder-Decoder Models",
        190, 205,
        ["statquest", "seq2seq", "encoder-decoder", "nlp", "language-translation", "deep-learning"],
    ),
    (
        "ch11-attention",
        "Better Language Translation with Attention",
        206, 218,
        ["statquest", "attention", "attention-mechanism", "nlp", "language-translation", "deep-learning"],
    ),
    (
        "ch12-transformers",
        "Even Better Language Translation with Transformers",
        219, 259,
        ["statquest", "transformers", "self-attention", "multi-head-attention", "nlp", "deep-learning"],
    ),
    (
        "ch13-decoder-only-transformers",
        "Generating Lots of Text with Decoder-Only Transformers",
        260, 270,
        ["statquest", "transformers", "decoder-only", "gpt", "text-generation", "llm", "deep-learning"],
    ),
    (
        "ch14-encoder-only-transformers",
        "Classification and Clustering with Encoder-Only Transformers",
        271, 280,
        ["statquest", "transformers", "encoder-only", "bert", "classification", "nlp", "deep-learning"],
    ),
    (
        "appendices",
        "Appendices: Math Foundations (Derivatives, Power Rule, Chain Rule, etc.)",
        281, 362,
        ["statquest", "math", "calculus", "derivatives", "chain-rule", "linear-algebra", "deep-learning"],
    ),
]

SUMMARY_PROMPT = """\
You are summarizing a chapter from "The StatQuest Illustrated Guide to Neural Networks and AI" by Josh Starmer.

Chapter: {title}

Here is the extracted text from the chapter (note: it may contain some OCR artifacts from a visual/illustrated book):

---
{text}
---

Write a comprehensive study note in Markdown for this chapter. Structure it as follows:

## {title}

### Overview
One paragraph explaining what this chapter covers and why it matters.

### Core Concepts
Bullet points covering the key ideas, definitions, and intuitions introduced.

### Key Techniques / Algorithms
Step-by-step explanation of the main methods shown in the chapter. Include any important formulas in LaTeX (using $...$ for inline and $$...$$ for block).

### PyTorch / Code Notes
Any PyTorch or Python code patterns mentioned or demonstrated in the chapter (or note "None mentioned" if absent).

### Key Takeaways
3–5 bullet points summarizing the most important things to remember.

Keep the tone educational and concise. Avoid padding. Focus on substance over style.
"""


def extract_chapter_text(pdf_path: str, start: int, end: int) -> str:
    with pdfplumber.open(pdf_path) as pdf:
        pages_text = []
        for i in range(start, min(end + 1, len(pdf.pages))):
            text = pdf.pages[i].extract_text()
            if text:
                pages_text.append(text)
    return "\n\n".join(pages_text)


def summarize_chapter(title: str, text: str) -> str:
    prompt = SUMMARY_PROMPT.format(title=title, text=text)
    result = subprocess.run(
        ["claude", "--print", "--model", "claude-sonnet-4-6"],
        input=prompt,
        capture_output=True,
        text=True,
        check=True,
    )
    return result.stdout.strip()


def write_markdown(path: str, tags: list[str], source: str, content: str) -> None:
    tags_yaml = "[" + ", ".join(tags) + "]"
    frontmatter = f"---\ntags: {tags_yaml}\nsource: {source}\n---\n\n"
    with open(path, "w", encoding="utf-8") as f:
        f.write(frontmatter + content)


def main() -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Allow resuming: skip already-done files
    start_from = int(sys.argv[1]) if len(sys.argv) > 1 else 0

    for idx, (filename, title, start, end, tags) in enumerate(CHAPTERS):
        if idx < start_from:
            print(f"Skipping {filename} (already done)")
            continue

        output_path = os.path.join(OUTPUT_DIR, f"{filename}.md")
        if os.path.exists(output_path):
            print(f"Skipping {filename} (file exists)")
            continue

        print(f"[{idx + 1}/{len(CHAPTERS)}] Extracting: {title} (pages {start + 1}–{end + 1})")
        text = extract_chapter_text(PDF_PATH, start, end)
        print(f"  Extracted {len(text):,} chars. Summarizing...")

        summary = summarize_chapter(title, text)
        write_markdown(output_path, tags, SOURCE, summary)
        print(f"  Written: {output_path}")

    print("\nDone!")


if __name__ == "__main__":
    main()
