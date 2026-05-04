---
tags: [ai-agent, harness-engineering, go, react-loop, main-loop, agent-engine, context-history, tool-dispatch]
source: https://time.geekbang.org/column/article/967512
---

# Chapter 02: 核心心脏 — 手写 Agent 的 Main Loop

Chapter 02 of the AI Agent Harness Training course implements the beating heart of `go-tiny-claw`: a `for {}` ReAct loop inside `AgentEngine.Run()` that drives the full Reason → Act → Observe cycle. The chapter defines four tightly scoped modules — `schema` (unified data types), `provider` (LLM interface), `tools` (registry interface), and `engine` (Main Loop) — and validates the loop using mock stubs, demonstrating two complete Turns without touching any real LLM or tool implementation.

## Key Concepts

- **ReAct paradigm**: Proposed in ICLR 2023 (Shunyu Yao et al.), interleaves Thought, Action, and Observation in a loop. Resolves the weakness of pure CoT (can't interact with external world) and pure Acting (no state tracking). Mapped directly to the `for {}` loop in `loop.go`.
- **`AgentEngine`**: Core struct in `internal/engine/loop.go` holding a `provider.LLMProvider` interface, a `tools.Registry` interface, and a `WorkDir string` physical boundary. Constructed via `NewAgentEngine(p, r, workDir)`.
- **`schema.Message`**: Unified message type with `Role` (system/user/assistant), `Content string`, `ToolCalls []ToolCall` (populated when assistant requests tools), and `ToolCallID string` (must be set on Observation messages to link them to their originating ToolCall).
- **`schema.ToolCall`**: Contains `ID`, `Name` (e.g. "bash"), and `Arguments json.RawMessage` — raw bytes deliberately left unparsed by the engine, delegating parse responsibility to the executing tool for maximum decoupling.
- **`schema.ToolResult`**: Contains `ToolCallID`, `Output string`, and `IsError bool` (reserved for future error-recovery / self-healing harness logic).
- **`contextHistory []schema.Message`**: The sole memory carrier of the agent session. Grows each Turn by appending the assistant's response and each tool Observation. Never truncated in this chapter (Context Compaction covered later).
- **Loop exit condition**: `len(responseMsg.ToolCalls) == 0` — when the model returns pure text with no tool requests, the engine breaks the loop and returns.
- **WorkDir physical boundary**: Explicit field on `AgentEngine` limiting the agent's operating scope to a specific project directory, following OpenClaw's design philosophy — an agent must behave like a normal developer, not a global ghost.
- **No max_turns hardcap**: Industrial harnesses (Claude Code, OpenClaw) avoid hard step limits; they rely on Context Compaction and System Reminders for loop safety, unlike toy frameworks (max_turns=10).

## Key Takeaways
- `ToolCallID` is the critical link between an Action and its Observation — omitting it breaks the LLM's reasoning chain.
- `json.RawMessage` for `ToolCall.Arguments` means the engine never couples to any tool's parameter schema — pure separation of concerns.
- Observation messages are appended as `RoleUser`, keeping the three-role (system/user/assistant) conversation format intact.
- The loop is deliberately branchless inside — no business logic, no routing — the model alone decides the execution path.
- Serial tool execution is the current design; parallel execution via Goroutine + WaitGroup is the Chapter 08 topic.

## See Also
- [[01-architecture-evolution-from-framework-to-harness]]
- [[harness-engineering]]
- [[main-loop-vs-dag]]
- [[react-paradigm]]
