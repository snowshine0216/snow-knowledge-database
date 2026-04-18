---
tags: [multi-agent, error-handling, retry, circuit-breaker, langgraph, agent-systems, fault-tolerance]
source: https://u.geekbang.org/lesson/818?article=927468
wiki: wiki/concepts/052-multi-agent-error-handling.md
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. In a distributed multi-agent system, what is the most common type of error you would expect to encounter, and how would you generally handle it?
2. What is a "circuit breaker" pattern, and why would you use it instead of just retrying indefinitely?
3. When a multi-agent LLM workflow requires three tools to complete a task, should you give the model all three tools at once or deliver them one at a time after each step? Why?

---

# 052: Multi-Agent System Error Handling and Recovery Mechanisms

**Source:** [8多Agent系统的异常处理与恢复机制](https://u.geekbang.org/lesson/818?article=927468)

## Outline
- [Error Categories in Multi-Agent Systems](#error-categories-in-multi-agent-systems)
- [Retry Mechanisms](#retry-mechanisms)
- [LangGraph RetryPolicy Configuration](#langgraph-retrypolicy-configuration)
- [Circuit Breaker and Fallback](#circuit-breaker-and-fallback)
- [Tool Loading Strategy](#tool-loading-strategy)
- [A2A Protocol and Stateful Agents](#a2a-protocol-and-stateful-agents)
- [Assignment: MCP-Based Multi-Agent System](#assignment-mcp-based-multi-agent-system)
- [Key Takeaways](#key-takeaways)
- [Connections](#connections)

---

## Error Categories in Multi-Agent Systems

When building multi-agent systems, several classes of errors must be anticipated and handled:

1. **Network Timeouts** — The most common error in distributed multi-agent systems. When a task is decomposed across agents, any node can time out. Python provides standard exception-handling mechanisms for network timeouts; they must not be left unhandled.

2. **Third-Party API Rate Limiting or IP Bans** — External APIs may impose rate limits or block requests. The lecturer notes that current tolerance from clients is still relatively high — informing stakeholders and rotating API keys is an acceptable remediation. Still, it should be planned for.

3. **Resource Exhaustion (Connection Pool Depletion)** — High-concurrency agents can exhaust database or network connection pools. In many production environments, hardware is pre-provisioned and scaling is difficult, so the main mitigation is a restart strategy. No elegant software-only solution exists for this category in constrained environments.

4. **Transient Errors** — Short-lived failures such as server restarts, primary-replica failovers, or cluster leader elections. These should all be addressed with **retry mechanisms** to maintain high availability.

---

## Retry Mechanisms

Retry is the primary resilience strategy for transient failures. Key design considerations:

- **Maximum retry count** — cap retries to prevent infinite loops.
- **Retry delay factor** — introduce a delay between attempts.
- **Exponential backoff** — increase the delay exponentially to avoid thundering-herd / avalanche effects when many agents simultaneously retry.
- **Maximum delay cap** — set a ceiling on how long to wait between retries to prevent excessively long waits.
- **Retry trigger conditions** — specify which exception types should trigger a retry (e.g., `ValueError`, connection errors). Not every exception warrants a retry.

Many frameworks include built-in retry support, so manual `try/except` wrapping is often unnecessary.

---

## LangGraph RetryPolicy Configuration

LangGraph provides a built-in `RetryPolicy` (imported from `langgraph.types`) that can be attached directly to graph nodes.

**Typical configuration fields:**

| Field | Purpose |
|---|---|
| `max_attempts` | Maximum number of retry attempts |
| `retry_on` | Exception types that trigger a retry (e.g., `ValueError`) |
| `backoff_factor` | Multiplier for exponential backoff delay |
| `initial_delay` | Starting delay before the first retry |
| `max_delay` | Upper bound on the retry delay |

**Attaching the policy to a node:**

```python
from langgraph.types import RetryPolicy

retry_policy = RetryPolicy(
    max_attempts=3,
    initial_delay=1.0,
    backoff_factor=2.0,
    max_delay=30.0,
    retry_on=(ValueError,),
)

# When adding a node to the graph:
graph.add_node("my_node", my_node_fn, retry=retry_policy)
```

- The `retry` parameter is available on both **regular nodes** and **tool nodes**.
- Tool nodes are a separate node type from regular nodes, but the retry configuration API is the same conceptually.

---

## Circuit Breaker and Fallback

When retries are exhausted and the operation still fails, a **circuit breaker** should be employed:

- The circuit breaker **opens** after repeated failures, stopping further futile retry attempts and preventing wasted resources.
- While the circuit is open, requests either fail fast or are routed to a **fallback/degraded path**.
- Components of a robust fault-tolerance stack:
  - **Retry** — handle transient, recoverable errors.
  - **Circuit Breaker** — halt cascading failures after retry budget is spent.
  - **Fallback / Degradation** — serve a reduced-functionality response rather than an outright failure.
  - **Callback on failure** — trigger notifications or compensating actions.
  - **Error logging with timestamps** — record failure events for post-mortem analysis.

This pattern reinforces the agent system's overall reliability and is analogous to patterns used in traditional microservices.

---

## Tool Loading Strategy

**Question from class:** When a task requires multiple tools, should all tools be provided to the LLM at once, or should they be provided one at a time after each step completes?

**Recommended approach: provide all tools upfront, in a single context.**

Rationale:
- The LLM uses a **ReAct** (Reason + Act) reasoning loop internally. It decides which tool to call next based on the result of the previous call.
- Passing all tools at the start allows the model to plan holistically. It may use a tool, or may not — the model decides.
- If flexibility is needed (e.g., optional tools), use **feature flags / toggle switches** on the tools rather than dynamically injecting tools at runtime.

**Example workflow for a deployment pipeline (three tools):**
1. Download ZIP package
2. Upload to GitLab
3. Deploy and publish

Rather than calling these as three isolated tool invocations, the recommendation is to **orchestrate them as a sequenced task pipeline**, passing the full tool list to the LLM and letting the ReAct loop manage execution order.

---

## A2A Protocol and Stateful Agents

**A2A (Agent-to-Agent) vs MCP:**

- **MCP (Model Context Protocol)** — agent-to-tool communication. Each tool call requires a discrete round trip to the MCP server; the context is re-fetched each time.
- **A2A** — agent-to-agent communication. Designed to maintain session state across turns, making it conceptually more powerful for multi-step workflows.

**State analogy:** A2A is like a browser holding a **session cookie** — once authenticated, subsequent requests carry the session state automatically. MCP without state is like re-logging in on every request.

**Important caveat:** Business-specific state (e.g., a user's refund status partway through a workflow) still must be explicitly encoded by the developer. A2A's claim to handle state "automatically" applies to protocol-level session state, not application-level business logic.

**Broader context — two competing paradigms:**
- **Multi-Agent / MaaS (Model as a Service) systems** — decompose tasks across specialized agents.
- **Extended context window approaches** — handle more information within a single large-context model call.

Neither paradigm has won definitively yet. Practitioners should develop fluency in both.

---

## Assignment: MCP-Based Multi-Agent System

**Goal:** Build a small multi-agent content pipeline using MCP protocol.

**Requirements:**
- Must use MCP protocol.
- Must use at least one MaaS framework (any framework of choice).
- Keep business logic simple — the goal is skill practice, not system complexity.

**Suggested pipeline — article writing system:**

| Agent Role | Responsibility |
|---|---|
| Research Agent | Web search for background information (via MCP search tool) |
| Writing Agent | Draft the article |
| Review Agent | Quality review of the draft |
| Polishing Agent | Refine and improve the article |

**Input:** "Write an article about [topic]."  
**Output:** A complete, polished article.

**Extension challenge:** Add retry/failure recovery support for:
- Search engine connection failures.
- LLM API communication failures during the writing step.

---

## Key Takeaways

- Multi-agent systems face four main error categories: network timeouts, API rate limits/bans, resource exhaustion, and transient errors. Each requires a different mitigation strategy.
- Retry with exponential backoff is the standard first line of defense for transient failures. LangGraph provides `RetryPolicy` to configure this declaratively per node.
- Circuit breakers prevent cascading failures once retries are exhausted; combine with fallback paths and error logging for a complete fault-tolerance stack.
- Always provide the full tool list to the LLM upfront; use the ReAct loop to let the model decide when and which tools to call.
- A2A protocol maintains session state between agent interactions (like a cookie), reducing repeated round-trips, but application-level business state must still be managed by the developer.
- Two architectural paradigms — multi-agent orchestration and extended context — are both actively evolving; practitioners should learn both.

---

## Connections

- → [[langgraph-fundamentals]]
- → [[multi-agent-architecture]]
- → [[mcp-protocol]]
- → [[a2a-protocol]]
- → [[react-agent-pattern]]
- → [[circuit-breaker-pattern]]


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain the five key design considerations for a retry mechanism, and describe how LangGraph's `RetryPolicy` maps to them in code.
2. Walk through the full fault-tolerance stack recommended in this lesson — what role does each layer (retry, circuit breaker, fallback, callback, logging) play, and in what order do they activate?
3. Explain the difference between A2A and MCP protocols using the session cookie analogy, and describe what A2A's state management does *not* handle automatically.

<details>
<summary>Answer Guide</summary>

1. The five considerations are: max retry count, retry delay factor, exponential backoff (to avoid thundering-herd), max delay cap, and specific trigger conditions (which exception types retry). In LangGraph, `RetryPolicy` fields `max_attempts`, `backoff_factor`, `initial_delay`, `max_delay`, and `retry_on` map directly to these; the policy is attached to a node via `graph.add_node("name", fn, retry=retry_policy)`.

2. Retry handles transient recoverable errors first; once the retry budget is exhausted, the circuit breaker opens to stop further futile attempts and prevent cascading failures. The fallback/degradation layer then serves a reduced-functionality response instead of a hard failure; a callback triggers notifications or compensating actions; and timestamped error logging records events for post-mortem analysis.

3. MCP is agent-to-tool communication requiring a discrete round trip to the MCP server each time — like re-logging in on every request. A2A is agent-to-agent communication that maintains protocol-level session state across turns, like a browser holding a session cookie. However, application-level business state (e.g., a user's refund status mid-workflow) must still be explicitly encoded by the developer; A2A does not manage that automatically.

</details>
