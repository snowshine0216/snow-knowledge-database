---
tags: [agent, observability, langsmith, langgraph, langchain, tracing, logging, metrics, llm-ops, monitoring]
source: https://u.geekbang.org/lesson/818?article=941183
---

# Agent Observability

Observability for LLM-based Agent systems encompasses **tracing** (recording the execution path through a graph), **logging** (capturing node inputs and outputs), and **metrics** (latency, token consumption). Because Agents are non-deterministic and multi-step, standard application monitoring tools fall short — you need per-node visibility.

## LangSmith

[[LangSmith]] is LangChain's hosted observability platform. Configure with three environment variables:

```
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=<key>
LANGCHAIN_PROJECT=<project>
```

Three levels of tracing granularity:

1. **Global** — the env var toggle captures all LangChain/LangGraph code on the machine
2. **Model-level** — `wrap_openai(client)` captures only LLM API calls
3. **Function-level** — `@traceable` decorator captures a specific function

Add `metadata` (dict) or `tags` (list) to `graph.invoke(config=...)` to make traces searchable by user, environment, or version.

**Limitations:** data is uploaded to `smith.langchain.com` (privacy concern for companies); no in-place node re-run — you cannot pause mid-graph, edit a prompt, and resume locally.

## LangGraph Time-Travel

[[LangGraph]] provides native checkpoint-based replay:

```python
for state in graph.get_state_history(config):
    # inspect or branch from any prior state
```

Resume from a specific checkpoint by passing its snapshot ID back to `graph.invoke()`.

## Reference: Coze Debugging UX

[[Coze]] demonstrates the ideal Agent debugging experience:
- Flame graph for node latency
- Per-node input/output inspection
- **In-place node re-run**: edit input at any node, re-execute from that point — the key capability LangSmith lacks

This pattern (local deployment + per-node rerun) is the best-practice target for Agent observability tooling.

## Market Opportunity

Current LLM observability tooling is immature. A local-first approach using [[MCP]] to capture function traces and send them to a self-hosted server (avoiding cloud data upload) is a viable product direction.

## Gemini Fullstack LangGraph Quickstart

A Google-authored open-source reference project that integrates LangGraph with a full-stack application:

- **Pattern:** Research Agent — query → web search → reflection → loop or answer
- **Stack:** React + TypeScript + Vite (frontend), Python + LangGraph (backend)
- **Purpose:** shows how LangGraph, multi-LLM switching, prompt/config/tool organization, and the Research pattern compose into a real application

Installation: Node.js + npm, Python 3.11+, Gemini API key (`GEMINI_API_KEY`). Run frontend on port 5173 (`npm run dev`), backend on port 2024 (`langgraph dev`).

## Related Concepts

- [[LangSmith]] — hosted tracing platform
- [[LangGraph]] — graph execution framework with built-in time-travel
- [[LangChain]] — parent ecosystem
- [[Coze]] — reference observability UX
- [[Research Agent Pattern]] — web search + reflection loop
- [[RAG]] — retrieval-augmented generation; web search is the retrieval layer in the reference project
