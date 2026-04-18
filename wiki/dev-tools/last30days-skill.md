---
tags: [claude-code, research-skill, trend-analysis, social-media, recency]
source: https://github.com/mvanhorn/last30days-skill
---

# Last30Days Skill

Last30Days Skill is a Python-first research skill for agent environments that aggregates recent discussions across social and web sources, synthesizing citation-backed outputs with a 30-day recency focus.

## What It Is

A reusable research context generator designed for [[Claude Code Internals|Claude Code]] and OpenClaw-style workflows. It performs multi-source discovery, normalization, scoring, deduplication, and rendering to answer "what changed recently?" questions. The architecture is documented in a formal SPEC (discovery, normalization, scoring, dedupe, rendering stages).

## Key Features

- **30-day recency window**: focused on time-sensitive signal rather than static knowledge
- **Multi-source aggregation**: social platforms and web sources with scoring and deduplication
- **Structured outputs**: compact markdown, JSON, and reusable context snippets
- **Watchlist/open variant model**: supports both targeted topic tracking and open exploration
- **Skill/plugin ecosystem compatibility**: designed for embedding into broader agent workflows

## When to Use

- Time-sensitive signal is the main requirement and you need structured recency research
- You are building periodic trend briefings for creators, operators, or AI tool users
- You want prompt and tool-practice discovery where community signal and recency matter
- You can configure API keys and tolerate multi-source data variability

## Limitations

- Output quality depends on external API access, credentials, and source availability
- Runtime can be several minutes for deeper topics, unsuitable for low-latency workflows
- Social-source noise and ranking bias can affect conclusions despite scoring pipelines
- Credential handling (X tokens, Bluesky app passwords) adds security/ops burden

## Practical Notes

Adopt with tiered execution modes: quick pass for interactive work, full pass for decision-grade briefings. Standardize per-project env management early. Use as a research substrate, then add domain validation before high-stakes decisions. Pairs well with [[Claude Code Agentic OS|agentic OS]] skill orchestration patterns and [[Vectorless RAG|vectorless RAG]] for combining recency data with structured knowledge.
