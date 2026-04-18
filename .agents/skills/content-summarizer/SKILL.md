---
name: content-summarizer
description: Consolidated formatting skill for all content types. Called by yt-video-summarizer, medium-member-summarizer, and geektime-course-summarizer after extraction. Receives content_type + extracted content + metadata from calling skill context. Applies the appropriate format template and writes the .md file.
---

# Content Summarizer

## Overview

This skill is invoked by extraction skills after they have gathered transcript/text and metadata.
It applies the correct format template based on `content_type` and writes the output `.md` file.

## Input (from calling skill context)

- `content_type`: `lecture-video` | `lecture-text` | `interview` | `talk` | `article` | `geektime-article` | `book-chapter`
- `content`: full transcript or article text
- `metadata`: title, source URL, date, author/channel/uploader, duration, etc.
- `save_path`: full target path including filename

## Pre-Write Check (required)

Before writing any file, run:

```bash
test -f "<save_path>"
```

If the file exists, print:

```
File already exists: <save_path> — skipping
```

Then **halt**. Do NOT proceed to write.

If `content_type` is `article` and the `sources/` directory does not exist at the repo root, create it:

```bash
mkdir -p sources
```

## Filename Convention

- **Video types** (`lecture-video`, `interview`, `talk`): use `recommended_summary_filename` from `metadata_summary.json`.
- **Article types** (`article`, `lecture-text`): `{kebab-title}_{hash8}.md` where `hash8` = first 8 chars of SHA-256 of the canonical URL. If in a course sequence, use `{NNN}-{kebab-title}.md` instead (NNN = zero-padded index).
- **geektime-article**: `{NNN}-{article-id}.md` (positional, per existing pattern).
- Filenames must be ASCII only.

## Frontmatter (all types)

```yaml
---
tags: [tag1, tag2, ...]
source: <canonical_url>
---
```

## Language Rule

Template structural labels (section headers, table column names like "Key Points", "Timeline") stay in **English**. The **content** within those sections follows the original source language. Do not translate content unless the user explicitly requests it.

## Concreteness Rule (mandatory for all templates)

Bullets must be self-contained and **specific**. A summary that only states the abstract claim ("don't put agents in small boxes", "code is throwaway") is a failure mode — it forces the reader back to the source and erases the reasoning that makes the claim memorable.

For every non-trivial claim in the summary, attach at least one of:
- a **concrete story / anecdote** from the source ("线上服务漏写 timeout 触发报警 → Slack `@Codex` 让它顺手更新可靠性文档")
- a **specific number / unit / threshold** ("60-second build cap", "500 NPM packages for a 7-person team", "$2-3k token spend per person per day")
- a **named tool / file / command** ("`prettier --silent`", "`gh pr view --web`", "`core_beliefs.md`", "Victoria Stack + MISE")
- a **counterexample** the speaker rejected ("the team built a Next.js trace viewer in an afternoon — but it was the wrong move; just hand the tar to Codex directly")
- a **mechanism** ("Symphony's Rework state clears the worktree and PR, then asks why the agent produced garbage")

If the source contains a vivid example for a claim and you omit it, the summary is wrong. Prefer 8 well-grounded bullets to 16 abstract ones. When in doubt, include the example.

For long-form sources (interviews, talks, deep articles), include a **Key Numbers / Quick Facts table** when the source contains ≥5 quantitative facts. It is the single highest-ROI section for future recall.

---

## Format Templates

### lecture-video

See: `references/template-lecture-video.md`

### lecture-text

See: `references/template-lecture-text.md`

### interview

See: `references/template-interview.md`

### talk

See: `references/template-talk.md`

### article

See: `references/template-article.md`

### geektime-article

See: `references/template-geektime-article.md`

### book-chapter

Structured study notes for technical book chapters with equations and code.

```markdown
---
tags: [tag1, tag2, ...]
source: <canonical_url>
---

# <Chapter Title>

**Source:** [Book Title](url) · Chapter N

## Overview
One paragraph explaining what this chapter covers and why it matters.

## Core Concepts
- **<concept>**: <definition and intuition>
- ...

## Key Techniques / Algorithms
Step-by-step explanation with formulas in LaTeX ($inline$, $$block$$).
Include variable legend and worked numerical examples where present.

## Code Notes
PyTorch/Python patterns mentioned (or "None mentioned" if absent).

## Key Equations

| Equation | Description |
|---|---|
| $$...$$ | ... |

## Key Takeaways
- <3–5 bullets: most important things to remember>
```

Rules for `book-chapter`:
- Include worked examples from the source (do not invent examples)
- Equations must be exact — do not simplify or rewrite
- Code Notes section: present only; don't fabricate code
- If chapter is primarily visual with minimal text, state clearly: "This chapter is primarily visual/diagrammatic. Available text content summarized below." then summarize what IS available

---

## Course Output Rule

When `save_path` starts with `courses/`, the output file **must** include pre-test and post-test sections generated **alongside** the main content (not as a post-processing step).

This applies to every `content_type` written to `courses/`: `lecture-video`, `lecture-text`, `geektime-article`, `book-chapter`, and any other type whose `save_path` is under `courses/`.

### Pre-test — insert immediately after the YAML frontmatter block, before all other content

```markdown
## Pre-test

> *[instruction line — see language rule below]*

1. [question]
2. [question]
3. [question]
```

- **English files**: `*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*`
- **Chinese files**: `*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*`

### Post-test — append at the very end of the file, after all content

```markdown
---

## Post-test

> *[instruction line — see language rule below]*

1. [retrieval question]
2. [retrieval question]
3. [retrieval question]

<details>
<summary>[Answer Guide / 答案指南]</summary>

1. [brief answer]
2. [brief answer]
3. [brief answer]

</details>
```

- **English files**: `*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*`
- **Chinese files**: `*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*`

### Question generation rules

- **Language**: match the dominant language of the file body (Chinese content → Chinese questions and headings; English content → English)
- **Pre-test questions**: 3 questions the reader can attempt cold from general knowledge + the title/tags. Wrong answers are expected and welcome — their purpose is encoding priming, not testing prior knowledge.
- **Post-test questions**: 3 retrieval questions requiring the reader to explain in their own words (Feynman technique). Avoid yes/no or lookup-style questions. Target the lesson's most important concepts.
- **Answer Guide**: 1–2 sentences per answer, drawn strictly from the file's content. Do not invent.
- **Specificity**: questions must name the actual concepts, algorithms, tools, or formulas from this specific lesson — not generic study questions.

---

## Rules

- All output files **must** have frontmatter with `tags` and `source` fields.
- Use `recommended_summary_filename` from metadata when available; otherwise derive per filename convention above.
- Write in the original content language unless the user requests translation.
- Do not invent facts not present in the extracted content.
- If transcript is unavailable, state that clearly and summarize from title/description/chapters/metadata only.

---

## Wiki Compilation Post-Hook

After the detailed file is written successfully, run this post-hook to create or update a wiki article. **The detailed file is always preserved regardless of wiki outcome.**

### Step 1 — Guard

```bash
test -f "scripts/wiki-collision-check.sh"
```

If the script is missing, print:
```
Wiki post-hook: scripts/wiki-collision-check.sh not found — skipping
```
Then add `wiki: failed` to the detailed file's frontmatter and stop. Do not treat this as an error.

### Step 2 — Prepare inputs

- **Source URL**: use the `source` frontmatter value from the detailed file.
- **Tags string**: convert the `tags` YAML array to comma-separated, no spaces.
  - Example: `tags: [rag, llm, retrieval]` → `"rag,llm,retrieval"`
- **Slug derivation**: take the detailed file's stem, strip a trailing `_[a-f0-9]{8}` hash suffix if present, use the result as the wiki article slug.
  - Example: `my-article_abc12345.md` → slug `my-article`
  - Example: `karpathy-loopy-era-ai.md` → slug `karpathy-loopy-era-ai` (no change)

### Step 3 — Run collision check

```bash
scripts/wiki-collision-check.sh "<source-url>" "<tags-string>"
```

Capture the output and branch on the first word.

### Step 4 — Branch on result

#### If `CREATE`

1. Choose the wiki category using the 6-folder topic rule from CLAUDE.md. Classify by TOPIC (what the content is *about*), not by content_type (what the source format is). The raw file's parent directory (`target_directory`) should already equal one of the 6 topic names — REUSE that same value here so the raw file and the wiki article land in matching folders. Decision order:

   1. **`claude/`** — Claude Code, Claude API, Anthropic-specific tooling, Anthropic Labs products.
   2. **`agent-frameworks/`** — Agent frameworks, multi-agent orchestration, autonomous agent products (Hermes, OpenClaw, CREAO, Eigent, Ruflo, Open SWE, CashClaw).
   3. **`ai-engineering/`** — General AI/LLM engineering: harness/prompt/context engineering, training pipelines, autoresearch loops, VLM+tool patterns.
   4. **`rag-and-knowledge/`** — RAG, vectorless retrieval, knowledge bases, second-brain systems.
   5. **`dev-tools/`** — Non-Claude-specific productivity/dev tools (Obsidian, OpenBB, Supermemory, MetaClaw, AI-tool roundups).
   6. **`learning-and-business/`** — Courses, interviews, career/education, study systems, AI startups, industry moat analysis, product strategy.

   If `target_directory` is one of the 6 names, pass it directly as the category. If `target_directory` is `courses/` or `sources/` (intake trees), apply the decision order above from scratch using tags + title.

2. Synthesize a wiki article. Length scales with source depth:
   - Source < 1 000 words → wiki article 200–300 words
   - Source 1 000–3 000 words → wiki article 300–500 words
   - Source > 3 000 words → wiki article 500–800 words

   **Concreteness still applies in the wiki article.** Each Key Concept bullet must be self-contained — the reader of the wiki should not have to open the detailed file to understand what the concept actually means in practice. Attach a specific tool, number, file name, or one-sentence anecdote inline (sub-bullet is fine). If the source has ≥5 quantitative facts, include a Key Numbers table here too.

3. Wiki article format:
   ```markdown
   ---
   tags: [tag1, tag2, ...]
   source: <same canonical URL>
   ---
   # <Title>

   <One-paragraph overview>

   ## Key Concepts
   - **<concept>**: <definition>

   ## Key Takeaways
   - <bullet>

   ## See Also
   - [[related-wiki-slug]]
   ```
   Use `[[wikilinks]]` for cross-references (Obsidian format). Do NOT use `[markdown links]`.

4. Write the article to `wiki/{category}/{slug}.md`.

5. Update `wiki/_index.md`: add one row to the appropriate `## {Category}` table:
   ```
   | [{Title}]({category}/{slug}.md) | {comma-separated tags} | {one-line summary} |
   ```

6. Add `wiki: wiki/{category}/{slug}.md` to the detailed file's frontmatter.

7. Print: `Wiki post-hook: CREATE → wiki/{category}/{slug}.md`

#### If `ENRICH <wiki-file>`

1. Read the existing wiki article at `<wiki-file>`.
2. Append a `## Related sources` section at the end of the file (create the section if it doesn't exist; if it already exists, add to it):
   ```markdown
   ## Related sources

   - **[{detailed file title}]**: <one-paragraph synthesis of what the new source adds that the existing article doesn't cover>. See also: [[{detailed-file-slug}]]
   ```
   Do NOT rewrite or modify any existing body content.
3. Add `wiki: <wiki-file>` to the detailed file's frontmatter.
4. Print: `Wiki post-hook: ENRICH → <wiki-file>`
5. Note: to revert an ENRICH, run `git checkout <wiki-file>`.

#### If `SKIP`

1. Add `wiki: <path-from-SKIP-output>` to the detailed file's frontmatter. If the SKIP output didn't include a path, add `wiki: skip`.
2. Print: `Wiki post-hook: SKIP — already compiled`

### Step 5 — On any failure

If any step above fails (write error, parse error, etc.):
- Print: `Wiki post-hook: FAILED — <reason>`
- Add `wiki: failed` to the detailed file's frontmatter.
- Continue. The detailed file is preserved.

To retry a failed compilation: search for `wiki: failed` in your summaries directory, re-read the file, and re-run the post-hook steps manually.
