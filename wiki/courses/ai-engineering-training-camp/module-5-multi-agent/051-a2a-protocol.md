---
tags: [a2a, agent-to-agent, multi-agent, protocol, mcp, llm, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927467
---

# A2A (Agent-to-Agent) Protocol

**A2A** is Google's open protocol for standardized communication between agents built on different frameworks and LLMs. It is the agent-to-agent counterpart to [[mcp-protocol]], which handles agent-to-tool communication.

## Core Idea

A2A is like a **USB standard for agents**: any two compliant agents can communicate regardless of their internal implementation (LangGraph, CrewAI, AutoGen, Google ADK, etc.) or underlying LLM (Gemini, GPT-4, Qianwen, etc.).

> MCP is for Tools. A2A is for Agents.

## Key Concepts

### Agent Card
A publicly accessible JSON file at `/.well-known/agent.json` that declares an agent's identity and capabilities — its name, description, skills, endpoint URLs, and authentication requirements. This is the discovery mechanism that lets agents find and understand each other.

### Task
The unit of work in an A2A session. Each task has a unique ID for tracking multi-turn conversation state.

### Message
The communication envelope between agents. Carries typed **parts** (text, data, multimodal) and a role field (`user` or `agent`). A2A manages context/state automatically across turns — no manual stitching.

### Artifact
The final output of a completed task, returned to the end user (distinct from Messages, which are intermediate).

## MCP vs A2A

| | MCP | A2A |
|---|---|---|
| Connects | Agent → Tool | Agent → Agent |
| State | Stateless | Stateful (multi-turn) |
| Discovery | Tool list from server | Agent Card at `/.well-known/agent.json` |
| Both sides autonomous? | No (tool is passive) | Yes (both expose Agent Cards) |

## When to Use A2A

Use A2A only when **all three** apply:
1. Agents are built with **different frameworks**
2. Agents run on **different hosts/machines**
3. The interaction requires **multi-turn dialogue with state management**

Otherwise: use same-framework primitives (same framework), or wrap the remote agent as an MCP tool (single-call, cross-host).

## Current Limitations

- Protocol released in 2025; still maturing (SDK structure already changed once)
- Authentication is basic HTTP-level only — keep A2A endpoints internal, not public-facing
- Single-agent demos show little benefit; value emerges at genuine cross-framework, cross-host boundaries

## See Also

- [[mcp-protocol]] — agent-to-tool protocol, stateless counterpart
- [[multi-agent-systems]] — architectural patterns for multiple agents
- [[langgraph]] — graph-based agent framework with native A2A support in official examples
- [[google-adk]] — Google's Agent Development Kit, used in A2A multi-agent host examples
