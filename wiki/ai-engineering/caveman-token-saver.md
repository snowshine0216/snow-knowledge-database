---
tags: [claude-code, token-optimization, caveman, codex, prompt-compression]
source: https://zhuanlan.zhihu.com/p/2025171957528698973
---

# Caveman Token Saver

Output token compression plugin for [[Claude Code Internals|Claude Code]] and Codex. Forces the model to respond in terse, "caveman" style — stripping filler while preserving all technical content (code, paths, URLs, commands, tables).

## How It Works

Caveman injects a system-level style constraint: **fewer words, same correctness**. Natural language gets compressed; structured content stays untouched.

Three compression tiers:

| Mode      | Strategy                         | Typical savings |
| --------- | -------------------------------- | --------------- |
| **Lite**  | Strip pleasantries, keep grammar | Low             |
| **Full**  | Drop articles, keyword fragments | ~65% avg        |
| **Ultra** | Maximum compression, telegraphic | Up to 87%       |

## Key Numbers

- Output token reduction: 22%–87% across 10 real tasks, **65% average**
- Memory file compression: ~45% input token savings per session
- Academic backing: a March 2025 paper shows conciseness constraints boost LLM accuracy by **26 percentage points**

## What Gets Preserved

Code blocks, URLs, file paths, shell commands, headings, tables, dates, version numbers — all technical artifacts pass through unchanged. Only natural language prose is compressed.

## Install

```bash
npx skills add JuliusBrussee/caveman
```

## Limitations

- Only affects **output tokens** — thinking/reasoning tokens are unaffected
- Savings vary widely by task type (22%–87% range)
- Community debate on whether compression degrades nuanced explanations

## Context

Created by Julius Brussee (19, Leiden University, Data Science & AI). Gained 4.1K GitHub stars in 3 days. Related to broader [[Harness Engineering]] trend of controlling agent output behavior via system prompts and [[Claude Code Agentic OS|skill plugins]].
