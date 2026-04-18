---
tags: [memory, rag, mcp, ai-agents, personalization, typescript]
source: https://github.com/supermemoryai/supermemory
---

# Supermemory

Supermemory is a TypeScript monorepo that provides a persistent memory and context layer for AI systems through API, SDKs, MCP integrations, and end-user tooling.

## What It Is

A dedicated memory platform that combines persistent user memory, profile/context retrieval, hybrid search (memory + RAG), and connectors for external knowledge sources. It provides both a product (web app, browser extensions, plugins) and a platform layer (API, SDKs, MCP) for integrating memory capabilities into existing agent frameworks.

## Key Features

- **Persistent user memory**: longitudinal context recall across sessions
- **Hybrid search**: combines memory retrieval and RAG in a unified query layer
- **Multi-surface deployment**: API, SDKs, MCP, web app, browser extensions, and plugins
- **Framework integration**: designed for embedding into existing agent and SDK stacks
- **Knowledge connectors**: external source integration for enriching memory context

## When to Use

- You want a dedicated memory layer instead of building custom memory + RAG plumbing from scratch
- Personalization and longitudinal context are core to your AI product experience
- Your team can operate a modern TypeScript/Bun monorepo and external service integrations
- You need memory capabilities across multiple clients via MCP/plugin paths

## Limitations

- Benchmark leadership claims in docs need independent validation for your workload
- Full value may depend on adopting surrounding platform components, not only a single SDK call
- Multi-surface architecture (apps, packages, connectors) can raise integration complexity
- Data governance (retention, privacy, user-specific memory control) must be validated against compliance constraints

## Relationship to Other Approaches

Supermemory addresses the memory layer that [[Vectorless RAG|vectorless RAG]] and [[PageIndex|PageIndex]] handle for document retrieval, but focuses specifically on persistent user context rather than static document indexing. For teams building [[Claude Code Agentic OS|agentic OS]] workflows, Supermemory can serve as the personalization substrate beneath skill orchestration.

## Practical Notes

Pilot with one high-value memory flow (user preference recall + project context) and measure outcome lift before broad rollout. Define memory lifecycle policies early: what is stored, updated, forgotten, and audited. Keep an abstraction boundary in your app to avoid deep vendor lock-in. If you only need basic retrieval over static docs, a simpler RAG stack may suffice.
