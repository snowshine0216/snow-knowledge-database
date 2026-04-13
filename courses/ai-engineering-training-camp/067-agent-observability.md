---
tags: [agent, observability, langsmith, langgraph, langchain, tracing, logging, metrics, llm-ops, monitoring]
source: https://u.geekbang.org/lesson/818?article=941183
wiki: wiki/concepts/067-agent-observability.md
---
# 067: Agent Observability

**Source:** [4Agent可观测性构建](https://u.geekbang.org/lesson/818?article=941183)

## Outline

1. LangSmith — setup and configuration
2. LangSmith — observability granularity controls
3. LangSmith — limitations in practice
4. LangGraph time-travel for debugging
5. Coze as a reference observability platform
6. Gemini Fullstack LangGraph Quickstart — intro and demo
7. Gemini Fullstack — installation walkthrough
8. Homework and preview of next session

---

## 1. LangSmith — Setup and Configuration

LangSmith is LangChain's hosted observability platform. It receives runtime telemetry from your LangGraph programs and displays traces, token usage, and latency in a web UI at `smith.langchain.com`.

Minimal configuration requires three environment variables:

- `LANGCHAIN_TRACING_V2=true` — enables trace uploading
- `LANGCHAIN_API_KEY=<your_key>` — authenticates to your LangSmith account (create under Settings → API Keys)
- `LANGCHAIN_PROJECT=<project_name>` — namespaces traces so different projects are separated in the UI

Once set, any LangGraph invocation running on the same machine automatically streams its trace to LangSmith. You can also embed these variables directly in your script instead of the system environment to limit which programs are traced.

**Access:** navigate to `smith.langchain.com`, log in, and select your project. The dashboard shows:
- Overall run timeline and total latency
- Per-node latency breakdown (e.g. a specific node taking 5.2 s)
- Token consumption per run
- Input/output of each node — useful for debugging unexpected results

---

## 2. LangSmith — Observability Granularity Controls

LangSmith provides three levels of tracing control:

### Level 1 — Global switch
Set/unset `LANGCHAIN_TRACING_V2` in the environment. All LangChain/LangGraph code on the machine is captured when `true`.

### Level 2 — Model-level wrapper
Import a wrapper from `langsmith.wrappers` and wrap only the LLM client (e.g. the OpenAI client). Only LLM calls are captured; the rest of the graph is ignored. Supported providers: OpenAI, Anthropic, Google Gemini. For niche providers you must emulate the OpenAI request format.

```python
from langsmith.wrappers import wrap_openai
from openai import OpenAI

client = wrap_openai(OpenAI())
```

### Level 3 — Function-level decorator
Import `traceable` from `langsmith` and decorate specific functions. Only the decorated function's execution is sent to LangSmith.

```python
from langsmith import traceable

@traceable
def run_rag_pipeline(query: str) -> str:
    ...
```

### Searchable metadata and tags
Pass `config` to `graph.invoke()` with `metadata` (dict) or `tags` (list of strings) to add searchable labels to a trace:

```python
graph.invoke(
    input,
    config={
        "metadata": {"username": user, "environment": "production"},
        "tags": ["rag", "v2"]
    }
)
```

This lets you filter traces by user, environment, version, or any custom dimension directly in the LangSmith UI.

---

## 3. LangSmith — Limitations

Two significant drawbacks for production use:

1. **Requires external network access** — all trace data is uploaded to `smith.langchain.com`. Companies with strict data-privacy policies cannot send proprietary prompts, outputs, or business logic to a third-party server.

2. **No in-place node re-run** — while you can inspect inputs/outputs per node, you cannot modify a prompt mid-graph and resume from that node locally. The Playground feature re-runs from the cloud but effectively uploads all code there. True "pause at node, edit, resume" debugging is not yet supported.

In practice, most engineers still rely on `print` statements for quick debugging when the failing node is already known.

> The instructor notes that LLM observability is an **emerging market with significant opportunity** — current tooling is immature, and building MCP-based trace collectors that work locally (without cloud upload) is a viable product direction.

---

## 4. LangGraph Time-Travel

LangGraph has a built-in capability called **time-travel** (similar to Coze and Dify) that lets you replay or resume from any checkpoint in a graph run.

Key API: `graph.get_state_history(config)` — returns a list of historical state snapshots.

```python
for state in graph.get_state_history(config):
    print(state)
    # replay or branch from any checkpoint
```

You can also resume from a specific checkpoint by passing its snapshot ID back into `graph.invoke()`. This is directly copy-pasteable from the LangGraph docs and requires no additional setup beyond a checkpointer.

---

## 5. Coze as a Reference Observability Platform

The instructor highlights Coze as a more mature reference implementation for Agent observability:

- Flame graph visualization of node execution time
- Per-node input/output inspection in the same UI
- **In-place node re-run**: select any node, modify its input, and re-execute from that point without re-running earlier nodes — the key debugging feature LangSmith lacks
- All of the above inside a local/private deployment — no cloud upload required

This combination (local deployment + per-node rerun) represents the **best-practice debugging experience** for Agent systems.

---

## 6. Gemini Fullstack LangGraph Quickstart

The instructor introduces an open-source reference project: **Gemini Fullstack LangGraph Quickstart** by a Google Gemini engineer. It demonstrates how all previously learned LangGraph capabilities compose into a complete application.

**What it implements:** a web-research + reflection loop Agent:

1. User submits a question
2. Agent decomposes the question into web search queries
3. Web results are gathered (up to 47+ sources shown in demo)
4. Reflection node assesses whether results are sufficient
5. If not, loop back to web search; otherwise proceed
6. Final answer is generated from accumulated context

**Why use it as a study project:**
- Covers LangGraph, multi-LLM switching, prompt/config/tool file organization, and the Research agent pattern
- Full-stack: React + TypeScript + Vite frontend, Python + LangGraph backend
- LangSmith Studio integration — the graph topology is auto-visualized at startup

**Stack:**
- Frontend: React + TypeScript + Vite, port 5173
- Backend: Python + LangGraph (`langgraph dev`), port 2024

---

## 7. Gemini Fullstack — Installation Walkthrough

### Prerequisites
1. **Node.js + npm** — install LTS version from nodejs.org (select correct OS and architecture)
2. **Python 3.11+**
3. **Gemini API Key** — from `aistudio.google.com` → Get API Key → create key → save as env var `GEMINI_API_KEY`

API key can also be placed in `backend/.env` (copy from `backend/.env.example`):
```
GEMINI_API_KEY=your_key_here
```

### Installation
```bash
# Backend
cd backend
pip install -e .        # reads pyproject.toml for dependencies

# Frontend
cd frontend
npm install             # reads package.json for dependencies
```

### Running

**Option A — if `make` is available (Linux/macOS):**
```bash
make dev    # runs dev-frontend and dev-backend targets from Makefile
```

**Option B — split terminals (universal):**

Terminal 1 (frontend):
```bash
cd frontend
npm run dev       # starts on port 5173
```

Terminal 2 (backend):
```bash
cd backend
langgraph dev     # starts on port 2024
```

### Code structure
```
frontend/
  src/
    main.tsx          # entry point
    App.tsx           # sets dev/prod URLs, backend port
    components/
      InputForm       # user input box
      ChatMessage     # conversation display
      Timeline        # execution step visualization
backend/
  src/agent/
    app.py            # FastAPI entry, connects frontend to graph
    graph.py          # LangGraph definition (state, nodes, edges)
    # + configuration files, prompt templates, tools
  langgraph.json      # LangGraph server config
```

> The instructor notes a version-selection tip: for small projects, use the `main` branch. For large, production-grade frameworks (e.g. Dify), prefer tagged releases (e.g. `1.9.1`) over `main` for stability.

---

## Key Takeaways

- **LangSmith** provides ready-made observability for LangGraph with minimal config (3 env vars), but is limited by cloud-only data upload and lack of in-place node debugging.
- **Three granularity levels** of tracing: global toggle → model wrapper → function decorator. Use metadata/tags to make traces searchable.
- **LangGraph time-travel** (`get_state_history`) enables checkpoint-based replay natively, without external tools.
- **Coze** demonstrates the ideal Agent debugging UX: local, per-node input editing, and in-place re-run — a feature gap that represents a market opportunity.
- **MCP-based local observability** (capturing function traces via MCP, uploading to a self-hosted server) is a viable product direction the instructor recommends exploring.
- The **Gemini Fullstack LangGraph Quickstart** is a high-quality reference for integrating LangGraph with a real frontend — covers the Research agent pattern, multi-LLM switching, and full-stack wiring.

## Connections

- [[LangSmith]] — LangChain's hosted observability and tracing platform
- [[LangGraph]] — the underlying graph execution framework being observed
- [[LangChain]] — parent ecosystem; LangSmith is its observability layer
- [[Agent Observability]] — broader concept: traces, metrics, logging for non-deterministic AI agents
- [[Time Travel Debugging]] — LangGraph's checkpoint-based state replay mechanism
- [[Coze]] — reference platform with more mature per-node debugging UX
- [[Research Agent Pattern]] — web-search + reflection loop; implemented in the Gemini Fullstack project
- [[RAG]] — retrieval-augmented generation; the Gemini Fullstack project uses web search as the retrieval layer
