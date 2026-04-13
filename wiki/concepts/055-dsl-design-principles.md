---
tags: [dsl, domain-specific-language, agent, langchain, workflow, ai-engineering, yaml, sql, nlp]
source: https://u.geekbang.org/lesson/818?article=927471
---

# DSL Design Principles and Application Scenarios

A **Domain-Specific Language (DSL)** is a language tailored to a particular business domain, as opposed to a General-Purpose Language (GPL). DSLs separate business logic from application architecture, enabling non-technical stakeholders to configure workflows without modifying core code.

## Two Types

- **Internal DSL** — built using the host language (e.g., Python method chains). Low development cost; users need some programming knowledge.
- **External DSL** — fully independent syntax (e.g., YAML, custom format). Business-friendly vocabulary; requires a custom parser and validator.

## Five Characteristics of a Good DSL

1. **Domain precision** — vocabulary maps directly to business concepts; no programming jargon
2. **Non-technical operability** — ops/product staff can configure it without developer help
3. **Dual-mode (visual + text)** — drag-and-drop editor *and* exportable text (YAML/JSON) for version control and portability
4. **Error feedback** — parser validates DSL before execution; surfaces errors clearly
5. **System integration** — connects cleanly to other systems via API or execution engine

## Key Application Scenarios

| Scenario | Notes |
|---|---|
| Customer service / refund workflows | Business rules editable by ops without code changes |
| Risk control flows | Dynamic rule engines with HITL checkpoints |
| Multi-Agent scheduling | DSL defines orchestration topology for MAS |
| Text-to-SQL (NL2SQL) | DSL as validation/permission layer before SQL generation |

## Text-to-SQL Maturity Warning

- Single-table queries with `SELECT/FROM/WHERE`: production-ready
- Multi-table joins: **avoid in production** — accuracy too low
- Always add: input validation → permission check → query constraints → SQL generation

## DSL vs. MCP

DSL encodes *workflow state and sequential flow*; MCP invokes *single tools*. They are complementary — not substitutes.

## Reference Implementation

[[dify-workflow-architecture]] — Dify's YAML workflow export is a near-ideal DSL pattern: visual editor ↔ YAML text ↔ API invocation.

## Related

- [[langchain-langgraph-fundamentals]]
- [[multi-agent-system-design]]
- [[text-to-sql-nl2sql]]
- [[human-in-the-loop-agent-patterns]]
