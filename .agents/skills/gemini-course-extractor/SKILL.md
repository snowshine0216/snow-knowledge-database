---
name: gemini-course-extractor
description: Extract a Gemini conversation (gemini.google.com/app/<id>) using the Chrome MCP with your existing session cookies, then summarize it as a pre-test / post-test course recap file saved to courses/<target-dir>/<slug>.md. Use this skill whenever the user provides a Gemini conversation URL and wants it turned into a structured learning document.
---

# Gemini Course Extractor

## Overview

This skill extracts the content of a Gemini conversation from the browser (using your active Google session — no login required) and formats it as a structured course recap file with pre-test and post-test questions, suitable for spaced repetition and memory refreshing.

## Usage

```
/gemini-course-extractor <gemini-url> [target-course-dir]
```

Examples:
```
/gemini-course-extractor https://gemini.google.com/app/20ee9086e135744c courses/zero-to-hero
/gemini-course-extractor https://gemini.google.com/app/abcdef123456 courses/agentic-ai
```

If `target-course-dir` is omitted, infer from the conversation content (topic tags → matching course directory).

---

## Step-by-Step Workflow

### Step 1 — Get a Chrome tab

```
Use: mcp__Claude_in_Chrome__tabs_context_mcp (createIfEmpty: true)
```

Save the `tabId` for all subsequent steps.

### Step 2 — Navigate to the Gemini URL

```
Use: mcp__Claude_in_Chrome__navigate
  tabId: <tabId>
  url: <gemini-url>
```

This reuses your existing Google session cookies. No sign-in is needed.

### Step 3 — Extract the conversation text

```
Use: mcp__Claude_in_Chrome__get_page_text
  tabId: <tabId>
```

If the page text is empty or shows a login prompt, instruct the user to open the Gemini URL manually in Chrome first, then re-run the skill.

If the conversation is very long and `get_page_text` truncates it, use `javascript_tool` to extract more:

```javascript
// Fallback: extract all model-turn text nodes
Array.from(document.querySelectorAll('model-response, .response-container, .model-response-text'))
  .map(el => el.innerText)
  .join('\n\n---\n\n')
```

### Step 4 — Determine output path

1. If `target-course-dir` was provided, use it directly.
2. Otherwise, scan `courses/` for the best-match directory based on conversation topics.
3. Generate a slug from the conversation's dominant topic (ASCII only, kebab-case, max 60 chars).
4. Full save path: `<target-course-dir>/<slug>.md`

Check for collision:
```bash
test -f "<save_path>" && echo "EXISTS"
```
If file exists, abort and tell the user.

### Step 5 — Classify content type

Determine from the conversation:
- Is it primarily **conceptual Q&A** (explanations, derivations)? → type `lecture-text`
- Is it primarily **architecture/system design**? → type `lecture-text`
- Is it primarily **debugging / code walkthrough**? → type `lecture-text`

All Gemini conversations map to `lecture-text`.

### Step 6 — Generate the output file

Write `<save_path>` following the **Course Output Rule** from the content-summarizer skill:

#### Frontmatter
```yaml
---
tags: [tag1, tag2, ...]   # derived from conversation topics
source: <gemini-url>
---
```

#### Pre-test (immediately after frontmatter)
```markdown
## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. [cold question — answerable from title/tags alone]
2. [cold question]
3. [cold question]
```

For English-dominant conversations, use English instruction:
> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

#### Main body
Structure the content using these sections (adapt as needed):

```markdown
# <Conversation Title>

> **Source**: Gemini 对话 · <topic summary>
> **Topics**: <comma-separated key topics>

## Overview
One paragraph summarizing what the conversation covers and why it matters.

## Part N — <Topic Name>

### N.1 <Subtopic>
- bullet with **concrete detail** (formula / tool / example / number)

## Key Takeaways
- <3–7 most important bullets — each self-contained and specific>
```

**Concreteness rule**: every non-trivial claim must attach a specific formula, tool name, number, anecdote, or counterexample. A bullet that only states the abstract claim ("use small model as judge") is a failure — attach the why and how ("deploy GPT-3.5 / Llama-3-8B as Judge LLM to compare API raw output vs agent answer, catching faithfulness violations; costs ~10× less than letting the main model self-verify").

#### Post-test (at end of file)
```markdown
---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. [retrieval question — explain in own words, no yes/no]
2. [retrieval question]
3. [retrieval question]

> [!example]- 答案指南
>
> #### Q1 — [question title]
>
> [1–2 sentence answer drawn from file content]
>
> #### Q2 — [question title]
>
> [1–2 sentence answer]
>
> #### Q3 — [question title]
>
> [1–2 sentence answer]
```

For English-dominant conversations, use English instruction text and change the callout label to `> [!example]- Answer Guide`.

#### Question generation rules
- **Language**: match the dominant language of the conversation body.
- **Pre-test**: 3 questions answerable from general knowledge + title/tags. Expect wrong answers — the goal is encoding priming.
- **Post-test**: 3 Feynman-technique questions — "explain in your own words", "derive the formula", "describe the tradeoff". No lookup or yes/no questions.
- **Specificity**: questions must name actual concepts, formulas, or patterns from this specific conversation — not generic study questions.

### Step 7 — Write the file

```
Use: Write tool
  file_path: <save_path>
  content: <full markdown>
```

### Step 8 — Report to user

Print a confirmation:
```
✅ Wrote: <save_path>
Topics: <tags>
Pre-test: 3 questions
Post-test: 3 questions + answer guide
```

---

## Error Handling

| Situation | Action |
|---|---|
| Page shows login / empty content | Ask user to open the Gemini URL in Chrome first, then re-run |
| File already exists | Abort — print "File already exists: <path> — skipping" |
| No target-course-dir given and no matching course found | Save to `courses/gemini-reviews/<slug>.md`, create dir if needed |
| Conversation is too short (< 200 words) | Still process, but add a note in the Overview: "Short conversation — partial coverage." |

---

## Notes

- This skill uses your **existing** Chrome browser session. It does NOT log in, click anything, or handle authentication — it just reads what's already on screen.
- If the Gemini conversation has multiple topics from different courses, create one file and classify by the dominant topic.
- Do NOT translate content — write in the language the conversation was conducted in.
- Follow CLAUDE.md filename conventions: ASCII-only, kebab-case.
