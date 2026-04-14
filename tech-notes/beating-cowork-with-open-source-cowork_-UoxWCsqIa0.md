---
tags: [eigent, camel-ai, multi-agent, open-source, cowork, mcp, agent-framework, agentic-ai, dag, browser-automation]
source: https://www.youtube.com/watch?v=-UoxWCsqIa0
wiki: wiki/concepts/beating-cowork-with-open-source-cowork_-UoxWCsqIa0.md
---

# Course: Beating Cowork with Open Source Cowork

> **Instructor:** Sam Witteveen
> **Duration:** 14 min 31 sec | **Published:** 2026-01-21
> **Views:** 12,936 | **Likes:** 452
> **Prerequisites:** Basic familiarity with LLM agents; awareness of Claude/Cowork
> **Code/Links:** [GitHub — eigent-ai/eigent](https://github.com/eigent-ai/eigent) · [Eigent AI](https://www.eigent.ai/) · [Docs](https://docs.eigent.ai/get_started/welcome) · [Architecture Blog](https://www.eigent.ai/blog/run-enterprise-agents-with-eigent-and-gemini-3-pro) · [Founder Twitter](https://x.com/guohao_li)

---

## Course Overview

When Anthropic released Claude Cowork, startup Eigent.AI made the radical decision to kill their commercial product and immediately open-source everything under Apache 2. This video walks through the story behind that pivot and dissects the technical architecture of what is now **open-source Cowork** — a three-tier Electron + FastAPI + Camel AI multi-agent desktop app. The target audience is developers interested in multi-agent system design patterns and startups navigating big-company competition.

---

## Module 1 — The Open Source Pivot Story

**Timestamps:** `0:00 – 5:23` (~5 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 1.1 | Intro — Anthropic releases Cowork | 0:00 |
| 1.2 | Eigent AI's radical response | 1:50 |
| 1.3 | Camel AI background | 4:06 |

### Key Concepts

- **Eigent AI**: A multi-agent desktop application built by Guohao Li (founder of Camel AI) that ran proprietary multi-agent workflows — repositioned as open-source Cowork after Anthropic's launch.
- **Camel AI**: The underlying agent research framework, started ~3 years ago during early Llama-1 days. Unlike LangChain or ADK, it was designed for scaling to up to 1 million simultaneous agents to study emergent behavior and scaling laws for agents.
- **Open-source pivot**: Guohao's tweet announcing the decision got 1.7 million views. The domain `open-work.ai` was bought immediately; the repo was open-sourced with an Apache 2 license within days.
- **Motivation**: Competing on marketing against Anthropic was not viable; the real asset was years of multi-agent architecture research that others could build on.

### Learning Objectives

- [ ] Understand why Eigent chose open-sourcing over pivoting to a different market
- [ ] Know what Camel AI is and how it differs from LangChain/ADK

---

## Module 2 — The Product: Three-Tier Architecture

**Timestamps:** `5:23 – 7:58` (~2 min 35 sec)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 2.1 | Open Source Cowork Desktop — GitHub walkthrough | 5:23 |
| 2.2 | Eigent AI + Gemini 3 Pro collaboration | 7:11 |

### Key Concepts

- **Three-tier architecture**:
  1. **Front end** — React Electron desktop app (works on Mac and Windows)
  2. **Agent backend** — FastAPI service that orchestrates execution and maintains agent state
  3. **Workforce** — actual agents built on the Camel AI multi-agent core
- **Model-agnostic design**: built primarily for frontier models (Gemini 3 Pro, etc.) but engineered from the start to eventually run on local models (Qwen4, Gemma 4) — a deliberate architectural choice by Guohao, not an afterthought.
- **Collaborations**: partnerships with Gemini team, Minimax, ZAI, and Moonshot (Kimi K2); XAI also reached out after the open-source announcement.
- **Business model**: not selling to developers. Revenue comes from enterprise-specific versions of the multi-agent system; open-sourcing serves as a talent magnet for agent builders.

### Learning Objectives

- [ ] Describe the three tiers of the Eigent architecture and what each does
- [ ] Explain the local-first long-term goal and why it was designed that way from day one

---

## Module 3 — Multi-Agent Architecture Deep Dive

**Timestamps:** `7:58 – 12:57` (~5 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 3.1 | Camel AI Workforce Architecture | 7:58 |
| 3.2 | Browser Automation Architecture | 10:19 |

### Key Concepts

- **Task decomposition**: a coordinator agent breaks an incoming task into subtasks placed on a dependency graph — the same pattern seen in Manus and traced back to Microsoft's Magentic-One paper.
- **DAG execution**: a directed acyclic graph (DAG) enables subtasks to run in **parallel** rather than sequentially; each node's result is stored as a dependency for downstream nodes.
- **Task channel**: acts as a queue that assigns each ready subtask to a capable specialized agent.
- **Four prebuilt specialized agents**:
  1. **Developer agent** — code execution, file system access (e.g., `ls` desktop → create folders → categorize files by content)
  2. **Browser agent** — web search, RAG information retrieval
  3. **Document processing agent** — writing and editing
  4. **Multimodal agent** — images, audio, other non-text modalities
- **Browser automation**: custom Playwright-based tool suite (not vanilla Playwright) with tools for navigation, information retrieval, browser interaction — deployed in an enterprise demo using Salesforce via Gemini 3.
- **MCP support**: the system is wired to work with Model Context Protocol tools out of the box.

### Learning Objectives

- [ ] Explain how DAG-based task execution enables parallelism and dependency tracking
- [ ] List the four specialized agents and their primary responsibilities
- [ ] Describe how the browser automation layer differs from using raw Playwright

---

## Module 4 — Getting Started & Contribution

**Timestamps:** `12:57 – 14:31` (~1 min 30 sec)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 4.1 | Eigent Documentation | 12:57 |

### Key Concepts

- **Documentation entry point**: `docs.eigent.ai` outlines all parts and capabilities; source code is the next step for understanding specific internals.
- **Apache 2 license**: full commercial and modification rights — prompts, Electron setup, backend are all readable and reusable.
- **Active development**: the team is still contributing; external PRs are welcome with the goal of community-built customized systems.
- **How to contribute**: fork the repo, explore the source, leave a GitHub star.

### Learning Objectives

- [ ] Know where to start when reading the Eigent codebase
- [ ] Understand the license implications for building on top of Eigent

---

## Course Summary

### The 4 Big Ideas

1. **Open-sourcing as a competitive response**: when a large player ships a product in your space, giving away everything you built — Apache 2 — can generate more attention (1.7M tweet views, XAI outreach) than any marketing spend.
2. **DAG-based multi-agent execution**: parallel subtask execution via a directed acyclic graph + coordinator is now a standard architectural pattern (Magentic-One → Manus → Eigent); understanding it is table stakes for agent system design.
3. **Specialized agents beat generalist agents**: four purpose-built agents (developer, browser, document, multimodal) outperform a single agent because each can be given the right tools, prompts, and capabilities for its domain.
4. **Local-first as a design principle**: architecting for local model execution from day one — even while using GPT/Gemini today — means the system won't require a rewrite when Qwen4/Gemma4-class local models arrive.

### Key Numbers / Quick Facts

| Fact | Value |
|------|-------|
| Tweet views after open-source announcement | 1.7 million |
| Video views at time of recording | 12,936 |
| Video duration | 14 min 31 sec |
| Apache 2 license | Yes (full commercial use) |
| Number of prebuilt specialized agents | 4 |
| Max concurrent agents Camel AI is designed to test | ~1 million |
| Camel AI founding era | ~3 years before this video (early Llama-1 days) |

### Recommended Exercises

- Clone `github.com/eigent-ai/eigent`, run it locally with your own API key, and try the "organize my desktop" developer-agent prompt.
- Read the Camel AI Workforce Architecture section of `eigent.ai/blog/run-enterprise-agents-with-eigent-and-gemini-3-pro` to understand the DAG patterns before reading the source code.
- Map the four agents to a concrete task you care about — identify which subtasks would go to which agent.

---

## Source Notes

- **Transcript source:** `subtitle-vtt` (manual/auto YouTube subtitles)
- **Cookie-auth retry:** used (proxy `10.27.7.110:8080` required for network access)
- **Data gaps:** none — full transcript available
