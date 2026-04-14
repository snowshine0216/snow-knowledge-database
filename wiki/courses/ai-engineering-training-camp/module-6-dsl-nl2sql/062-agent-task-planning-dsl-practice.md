---
tags: [dsl, agent, task-planning, langgraph, low-code, workflow, yaml, python]
source: https://u.geekbang.org/lesson/818?article=941178
---
# Agent Task Planning DSL — Design and Implementation

A practical implementation of a Domain-Specific Language (DSL) for orchestrating [[langgraph]] agent workflows, serving as the structured intermediate layer between natural language / low-code UIs and execution engines.

## Core Idea

Low-code platforms cannot directly drive execution frameworks like LangGraph. A **YAML-based DSL** acts as the stable intermediate representation:

```
Natural Language / Drag-Drop UI
        ↓ (LLM or UI serializer)
     YAML DSL
        ↓ (DSL engine)
  LangGraph Workflow
        ↓
    Execution
```

## Architecture: Configuration-Driven Design

Three modules with clear separation of concerns:

| Module | Role |
|---|---|
| `dsl_parser.py` | Load YAML → validate → return Python dict |
| `graph_builder.py` | Dict → LangGraph StateGraph (nodes + edges + conditional edges) |
| `main.py` | Minimal orchestration: build → compile → invoke |

The execution engine stays stable; business logic (prompt flow, tool order, transitions) lives entirely in the YAML config.

## LangGraph Build Sequence

1. `StateGraph()` → instantiate `workflow`
2. `workflow.add_node(...)` × N
3. `workflow.add_edge(...)` × M
4. `workflow.add_conditional_edges(...)` × K — maps YAML `condition/then/else` blocks
5. `workflow.compile()`
6. `workflow.invoke(input)`

## Validation Philosophy

Parse-time validation catches all errors **before** execution begins. Mid-execution failures cause dirty state that is hard to recover. Required fields checked: `graph`, `state`, `nodes`, `start`.

## Engineering Value

- Decouples volatile business logic from stable execution infrastructure
- Editing YAML is safer than modifying Python code for workflow changes
- This is the internal pattern behind "generate app from conversation" platforms (Dify, Coze, Doubao)
- The DSL layer enables workflow **persistence** (stored YAML) and **portability**

## Industry Context

2024–2025 trend: drag-and-drop workflow builders are being replaced by natural language → DSL → app pipelines. The output is no longer just data or files — it is a running application.

## Related

- [[langgraph]] — target execution framework
- [[low-code-agent-orchestration]]
- [[yaml-dsl-workflow]]
- [[configuration-driven-design]]
- [[agent-task-planning]]
