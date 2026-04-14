---
tags: [multi-agent, error-handling, retry, circuit-breaker, langgraph, agent-systems, fault-tolerance]
source: https://u.geekbang.org/lesson/818?article=927468
---

# Multi-Agent System Error Handling and Recovery

Fault-tolerance patterns for production multi-agent (MaaS) systems, covering retry policies, circuit breakers, fallback strategies, and stateful agent design.

## Core Error Categories

Four failure classes arise in multi-agent systems:

1. **Network timeouts** — common when tasks are decomposed across distributed agents; must be caught and retried, never ignored.
2. **Third-party API rate limits / IP bans** — rotate API keys; client tolerance is currently high.
3. **Resource exhaustion (connection pool depletion)** — constrained hardware makes software fixes difficult; restart strategies are the primary mitigation.
4. **Transient errors** — server restarts, primary-replica failovers — handle with retry.

## Retry with Exponential Backoff

Standard configuration parameters:
- `max_attempts` — cap total retries
- `initial_delay` + `backoff_factor` — exponential growth between attempts
- `max_delay` — ceiling to prevent excessively long waits
- `retry_on` — whitelist exception types that warrant a retry

[[LangGraph]] ships a built-in `RetryPolicy` (from `langgraph.types`) attachable per node via the `retry=` parameter, supporting both regular nodes and tool nodes.

## Circuit Breaker + Fallback Stack

Once retries are exhausted, the circuit **opens** to stop futile attempts. Full resilience stack:

| Layer | Role |
|---|---|
| Retry | Handle transient, recoverable errors |
| Circuit Breaker | Halt cascading failures |
| Fallback / Degradation | Serve reduced-functionality response |
| Callback on failure | Notification or compensating action |
| Error logging | Timestamped record for post-mortem |

## Tool Loading Strategy

Provide all tools to the LLM **upfront in a single context**. The [[ReAct]] reasoning loop handles selection and sequencing internally. Use feature flags on tools for optional behavior rather than dynamic injection.

## A2A vs MCP State Model

| | MCP | A2A |
|---|---|---|
| Communication | Agent ↔ Tool | Agent ↔ Agent |
| State | Stateless per call | Session state maintained (like a cookie) |
| Business state | Developer must encode | Developer must still encode |

A2A reduces repeated round-trips for multi-step workflows but does not eliminate the need for explicit application-level state management.

## Paradigm Landscape

Two competing approaches are still evolving:
- **Multi-agent / MaaS orchestration** — specialized agents collaborate
- **Extended context window** — more information fits in a single model call

Both should be learned; no clear winner has emerged.

## Related

- [[langgraph-fundamentals]]
- [[mcp-protocol]]
- [[a2a-protocol]]
- [[react-agent-pattern]]
- [[multi-agent-architecture]]
- [[circuit-breaker-pattern]]
