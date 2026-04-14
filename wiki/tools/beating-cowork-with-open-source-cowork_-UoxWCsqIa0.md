---
tags: [eigent, camel-ai, multi-agent, open-source, cowork, mcp, agent-framework, agentic-ai, dag, browser-automation]
source: https://www.youtube.com/watch?v=-UoxWCsqIa0
---

# Eigent AI: Open-Source Cowork and the DAG Multi-Agent Architecture

When Anthropic released Claude Cowork in January 2026, startup Eigent.AI (founded by Guohao Li, who also created the Camel AI framework) made an immediate radical choice: rather than compete, they open-sourced their entire product under Apache 2 and rebranded it as `open-work.ai`. The announcement tweet reached 1.7 million views and drew outreach from XAI — converting a competitive threat into a community moment.

The result is a fully open, three-tier multi-agent desktop application:
- **Electron front end** — cross-platform (Mac/Windows) React desktop shell
- **FastAPI agent backend** — orchestrates execution and maintains agent state
- **Camel AI workforce** — the actual agents, built on the Camel AI multi-agent core

## Key Concepts

- **Camel AI**: Guohao's earlier research framework, built to test multi-agent architectures at extreme scale (up to ~1 million concurrent agents) and study emergent behavior and agent scaling laws. Unlike LangChain or ADK, it was never intended as a developer productivity tool — it was a research platform for coordination, role-playing, and instruction generation between agents.
- **DAG-based task execution**: the coordinator agent decomposes an incoming task into subtasks, places them on a directed acyclic graph (DAG), and runs independent nodes in parallel. Results are stored as dependencies for downstream nodes. This pattern originates in Microsoft's Magentic-One paper and is now standard in top-tier agent systems (Manus, etc.).
- **Four specialized agents**: instead of one generalist, Eigent uses four purpose-built workers:
  1. **Developer agent** — file system access + code execution (demo: "organize my desktop" → `ls` → create folders → categorize files, including processing images to determine their folder)
  2. **Browser agent** — web search and RAG-based information retrieval
  3. **Document agent** — writing and editing tasks
  4. **Multimodal agent** — images, audio, and non-text modalities
- **Custom Playwright browser automation**: not vanilla Playwright — a purpose-built tool suite for navigation, retrieval, and interaction, demonstrated with Salesforce enterprise tasks via Gemini 3 Pro.
- **MCP integration**: the system connects to Model Context Protocol tools out of the box.
- **Local-first design intent**: Guohao architected the system from day one to eventually run on local models (Qwen4, Gemma 4) rather than being locked to frontier APIs — a deliberate choice, not a future migration.

## Key Takeaways

- Open-sourcing (Apache 2, full prompts + source) as a competitive response can outperform marketing: 1.7M views and enterprise inbound beats any startup ad budget against Anthropic.
- The DAG + coordinator + specialized-worker architecture is now the canonical pattern for capable agent systems — understanding it is table stakes for agent builders.
- Camel AI's research roots (multi-agent scaling, emergent behavior, role-playing coordination) are directly embedded in Eigent's architecture; it is not a thin wrapper on a general framework.
- The business model is inverted: open source builds community; revenue comes from enterprise-specific deployments and hiring agent builders, not developer tooling sales.
- Fully runnable today with your own API keys: clone `github.com/eigent-ai/eigent`, check the docs at `docs.eigent.ai`.

## Key Numbers

| Fact | Value |
|------|-------|
| Tweet views after open-source | 1.7 million |
| License | Apache 2 |
| Max agents Camel AI tests | ~1 million concurrent |
| Specialized agent types | 4 |
| Video duration | 14 min 31 sec |

## See Also

- [[multi-agent-systems]]
- [[camel-ai]]
- [[model-context-protocol]]
