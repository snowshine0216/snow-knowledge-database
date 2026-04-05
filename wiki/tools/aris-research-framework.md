---
tags: [claude-code, ai-research, automation, multi-agent, research-pipeline]
source: https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep
---

# ARIS Research Framework

ARIS (Auto-claude-code-research-in-sleep) is a workflow-first, skill-based framework for autonomous research execution. It chains idea discovery, experiment implementation, iterative review, and paper writing into an end-to-end pipeline using markdown SKILL.md components.

## What It Is

A research operating model that uses cross-model collaboration (executor + critical reviewer) to run structured ML/AI research pipelines. The framework emphasizes methodology portability -- workflow logic is plain markdown, not tied to one IDE or vendor. It works across [[Claude Code Internals|Claude Code]], Codex CLI, OpenClaw, Cursor, and other agent environments.

## Key Features

- **End-to-end research pipeline**: discovery, execution, review, and writing stages with artifact handoffs
- **Cross-model adversarial review**: fast executor + rigorous reviewer pattern catches weaknesses that self-review misses
- **Methodology portability**: markdown-centric skills work across multiple agent environments
- **Community extensions**: templates for venues, slides, posters, grant writing, and domain skills
- **Staged autonomy**: automate execution while keeping decision checkpoints for high-stakes judgments

## When to Use

- You need repeatable research operations with explicit stages, checkpoints, and artifact handoffs
- You have compute/infra for experiments and can supervise scientific validity
- You want a portable, low-lock-in approach based on plain markdown skills
- You value process rigor (citation checks, iterative review, optional human checkpoints)

## Limitations

- Generated hypotheses and narratives can still be wrong without domain-expert validation
- Compute/time cost can escalate in experiment-heavy loops if stopping criteria are weak
- Large skill ecosystems can become inconsistent without quality standards and workflow governance

## Relationship to Other Tools

ARIS pairs well with [[Claude Code Agentic OS|agentic OS]] patterns for skill orchestration and can benefit from [[Claude Code Tips Collection|Claude Code tips]] for optimizing batch workflows and plan mode usage.
