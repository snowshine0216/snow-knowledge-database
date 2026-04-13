---
tags: [dsl, parser, execution-engine, hot-reload, fastapi, langgraph, workflow, caching, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=941179
---
# DSL Parser and Execution Engine with Dynamic Hot-Reload

A practice project (Module 6, Lecture 2) that upgrades a standalone DSL-execution script into a persistent FastAPI service supporting **hot-reload** — updating workflow definitions without restarting the server.

## Core Pattern

Hot-reload is implemented via **hash-based change detection**: on each incoming request, the server computes the DSL file's hash and compares it to the cached value. A mismatch triggers a recompile of the [[langgraph]] execution graph; a match serves from cache. No filesystem watcher is required.

## Four-Layer Architecture

| Layer | Role |
|---|---|
| Access (FastAPI) | Validates requests, dispatches tasks |
| Management (`WorkflowManager`) | DSL loading, cache, hot-reload logic |
| Execution (`GraphBuilder`) | Compiles DSL → LangGraph graph |
| Data (SQLite / file) | Persists DSL files and execution traces |

## Caching

Parsing DSL into a graph is treated as an expensive operation. Results are held in an in-memory cache; a **lock** prevents concurrent rebuild races during invalidation. Cache must be explicitly cleared after a DSL update for the new graph to take effect.

## Observability

`logger.py` writes to two SQLite tables:
- `trace` — workflow-level: input, output, latency, status
- `event` — node-level: per-node input, output, errors

This enables post-hoc debugging of distributed workflow execution.

## Design Philosophy

Separating **DSL parsing** from **execution** allows independent team ownership of each layer — the core [[ai-middleware-platform]] pattern this project prototypes.

## Related

- [[062-dsl-workflow-graph-builder]] — 6-1 script-mode predecessor
- [[langgraph]] — execution engine
- [[fastapi]] — service layer
- [[hot-reload-patterns]] — hash-based change detection
