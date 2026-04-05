---
tags: [ai-agents, prompt-library, multi-agent, localization, chinese-market]
source: https://github.com/jnMetaCode/agency-agents-zh
---

# Agency Agents ZH

Agency Agents ZH is a Chinese community edition of the agency-agents prompt library, containing 186 role-specialized AI agent personas with install/convert scripts for multiple agent IDEs and CLIs.

## What It Is

A large, structured catalog of role-specific AI agent prompts covering engineering, marketing, legal, HR, sales, and more. The project goes beyond direct translation of the upstream library by including China-market originals tailored for platforms like Xiaohongshu, Douyin, WeChat, Bilibili, and domestic e-commerce contexts. It includes installation and format conversion automation for tools like [[Claude Code Internals|Claude Code]], Cursor, OpenClaw, and Codex.

## Key Features

- **186 role-specialized personas** with clear specialization and scenario framing
- **China-market localization** with platform-native tactics and terminology
- **Multi-tool interoperability** via install/convert scripts for multiple agent IDEs
- **Orchestration support** through Agency Orchestrator YAML workflows for [[Claude Code Multi-Agent Setup|multi-agent]] pipelines

## When to Use

- You need broad role coverage quickly and prefer ready-made role cards over writing prompts from scratch
- Your team works in Chinese business contexts and needs localized platform tactics
- You operate across multiple AI tools and benefit from format conversion automation
- You are building [[Claude Code Agentic OS|agentic OS]] workflows and need a foundational prompt content layer

## Limitations

- Quality variance is inevitable at catalog scale; some personas need heavy editing before production use
- Prompt library alone does not guarantee execution quality, observability, or safety controls
- Ongoing maintenance required to prevent drift in platform tactics and policy-sensitive workflows
- Role over-fragmentation can increase coordination overhead without strong orchestration discipline
