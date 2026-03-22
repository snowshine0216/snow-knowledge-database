---
name: repo-analysis
description: "Analyze one or more GitHub repository links and save structured markdown reports into `repo-analysis/<subfolder>/`. Always use the fixed section structure: Repo Snapshot, Primary Use Cases, When To Use, Benefits, Limitations and Risks, Practical Insights."
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
- Target subfolder mapping under `repo-analysis/` (for example `openclaw-related`, `agent-playbooks`, `coding`)
- Output language
- Analysis depth preference

## Output Location Rules

1. Always save files under:
`repo-analysis/<subfolder>/<repo-name>.md`

2. If user provides explicit mapping, follow it exactly.

3. If user does not provide a subfolder, default to:
`repo-analysis/general/`

4. Create missing folders automatically.

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
- Subfolder: `openclaw-related`

Output path:
- `repo-analysis/openclaw-related/cashclaw.md`

The file must include all required sections in the exact order.
