---
name: repo-analysis
description: "Analyze one or more GitHub repository links and save structured markdown reports into the matching top-level topic folder (claude/, agent-frameworks/, ai-engineering/, rag-and-knowledge/, dev-tools/, or learning-and-business/). Always use the fixed section structure: Repo Snapshot, Primary Use Cases, When To Use, Benefits, Limitations and Risks, Practical Insights."
---

# Repo Analysis Skill

## Overview

Use this skill when the user asks to analyze GitHub repositories and save results locally.

This skill is for practical positioning analysis, not full code audit.

Default analysis depth:
- README + key docs + notable repository metadata
- Do not claim code-level behavior unless verified from source files

## Inputs

Required:
- One or more GitHub repository URLs

Optional:
- Explicit target topic folder (one of the 6 listed below)
- Output language
- Analysis depth preference

## Output Location Rules

1. Save files directly under the matching top-level topic folder:
`<topic>/<repo-name>.md`

2. Classify the repo by TOPIC using the 6-folder rule from CLAUDE.md. Decision order (stop at first match):

   - **`claude/`** — Claude Code, Claude API, Anthropic tooling, Claude-specific plugins (e.g. claude-hud, auto-claude-code-research-in-sleep, last30days-skill).
   - **`agent-frameworks/`** — Agent frameworks, multi-agent orchestration, autonomous agent products (e.g. hermes-agent, ruflo, open-swe, cashclaw, agency-agents-zh).
   - **`ai-engineering/`** — Research/engineering libraries for harness, prompts, training, VLM+tool patterns — NOT tied to a single agent product.
   - **`rag-and-knowledge/`** — RAG systems, vector/vectorless retrieval, knowledge bases, second-brain systems.
   - **`dev-tools/`** — Non-Claude-specific dev/productivity tools (e.g. openbb, supermemory, metaclaw).
   - **`learning-and-business/`** — Course repos, interview prep, career/study systems, startup analyses.

3. If user provides an explicit topic folder, follow it exactly.

4. If classification is ambiguous, default to `ai-engineering/`.

5. Create missing folders automatically.

6. The same topic name is reused when compiling the wiki article via `./scripts/compile.sh <path> <topic>` — one decision determines both raw and wiki paths.

## Required Output Structure (Always)

Every generated markdown file must contain sections in this exact order:

1. `# <Repo Name> Analysis`
2. `- Repository: <url>`
3. `- Snapshot basis: <what was inspected + date>`
4. `## Repo Snapshot`
5. `## Primary Use Cases`
6. `## When To Use`
7. `## Benefits`
8. `## Limitations and Risks`
9. `## Practical Insights`

No section should be omitted.

## Workflow

1. Parse each GitHub URL and extract `<owner>/<repo>`.
2. Read repository README and key docs.
3. Identify:
- what the project is
- intended users
- deployment/ops complexity
- integration model
- key strengths and constraints
4. Write analysis using the required structure.
5. Save to the correct subfolder path.
6. Verify files exist and report created paths.

## Source-Gathering Guidance

Prefer primary repository sources:
- `README.md`
- linked docs in same repo
- release notes/changelog sections in repo docs

When README default branch URL fails, try alternatives:
- `.../main/README.md`
- `.../master/README.md`

If important information is missing, state the gap explicitly in `Limitations and Risks` or `Practical Insights`.

## Writing Rules

- Keep claims grounded in repository content.
- Use concrete "when to use" criteria (team size, maturity, infra readiness, workflow fit).
- Separate benefits from risks clearly.
- Keep insights practical and decision-oriented.
- Avoid marketing tone.

## File Naming Rules

- Filename must be the repository slug in lowercase with `.md`.
- Example:
`https://github.com/moltlaunch/cashclaw` -> `cashclaw.md`

## Quick Example

Input:
- URL: `https://github.com/moltlaunch/cashclaw`

Classification: CashClaw is an autonomous-agent product in the OpenClaw family → rule 2 → `agent-frameworks/`.

Output path:
- `agent-frameworks/cashclaw.md`

Wiki compile: `./scripts/compile.sh agent-frameworks/cashclaw.md agent-frameworks` → `wiki/agent-frameworks/cashclaw.md`.

The file must include all required sections in the exact order.
