---
tags: [openclaw, ai-agents, architecture, system-design, fault-tolerance, agent-loop]
source: https://time.geekbang.org/column/article/954978
---

# OpenClaw Architecture

OpenClaw is an open-source, production-grade AI Agent system analyzed across a 7-chapter GeekTime series (OpenClaw 核心原理与实战) by Henry. The series dissects its five-layer onion architecture, three-tier Agent Loop, seven-level fault tolerance, and multi-platform message routing -- providing a reference blueprint for building resilient agent systems.

## Five-Layer Onion Architecture

OpenClaw follows a strict top-down layered design where each layer communicates only with its immediate neighbors through standardized interfaces:

| Layer | Responsibility |
|---|---|
| **Control Plane** | User-facing entry points (SwiftUI app, CLI, web). Handles display and command dispatch only -- zero business logic. Runs a 10-step initialization sequence on startup. |
| **Gateway** | Central traffic hub on WebSocket (port 18789). Implements a four-step challenge-response handshake against replay attacks, device-level binding, and 7-priority message routing to dispatch requests to the correct agent. |
| **Message Channels** | Adapter pattern for heterogeneous platforms (WhatsApp/Baileys, Telegram/MTProto, Discord Bot API, WeChat, Feishu, DingTalk). Each adapter converts platform-native formats into a unified `UnifiedMessage` object -- core engine never knows the message origin. |
| **Core Engines** | Four sub-systems: AgentLoop (three-layer execution), Memory Engine, Tool Registry, Plugin System. This is the "heart" of the system. |
| **Extension Layer** | 24 lifecycle hook points for third-party logic injection without modifying core code. |

The gateway is identified as OpenClaw's breakout differentiator versus tools like Claude Code or Cursor -- it unifies messaging across consumer platforms, enabling "one agent, many channels." This analysis also appears in the [[Claude Code Engineering Course]] bonus chapter.

## Three-Layer Agent Loop

The Agent Loop implements the ReAct (Reasoning and Acting) paradigm through nested layers, each owning a single concern:

### Outer Layer: `run.ts` -- Retry and Recovery

Drives a `while` loop that keeps the agent alive until the task completes or an unrecoverable error occurs. Owns the seven-level fault tolerance strategy (see below). Dynamic retry ceiling: `maxAttempts = 24 + profileCount * 8`, clamped to [32, 160].

### Middle Layer: `attempt.ts` -- Single LLM Interaction

Manages one complete LLM call cycle: sandbox resolution, tool registration, prompt construction, and 6 plugin hook points (`before_llm`, `after_tool`, etc.). Does not know about retries; simply reports success or failure upward.

### Inner Layer: Event Stream Processing

Parses the real-time SSE/streaming response from the LLM provider, dispatches tool calls, collects results, and feeds observations back into the next reasoning step. Handles streaming edge cases (partial JSON, interrupted connections).

This separation means modifying retry strategy never risks breaking event parsing, and adding a new LLM provider only requires changes in the middle layer.

## Seven-Level Fault Tolerance

The error-handling cascade follows a **cost-ascending** principle -- try the cheapest fix first, escalate only when it fails:

| Level | Strategy | Trigger | Cost |
|---|---|---|---|
| 1 | **Auth Refresh** | Expired OAuth token | Zero -- proactive refresh 5 min before expiry |
| 2 | **Context Compression** | Token limit overflow | Moderate -- older conversation details get summarized (max 3 rounds) |
| 3 | **Tool Result Truncation** | Oversized tool output after compression cap | Higher -- raw data partially discarded, head+tail preserved |
| 4 | **Profile Rotation** | Rate limit (HTTP 429) or auth failure | Resource swap -- burns alternate API key quota |
| 5 | **Model Downgrade** | Primary model unavailable | Capability loss -- falls back to smaller/cheaper model |
| 6 | **Exponential Backoff + Jitter** | Transient network errors | Time cost -- progressively longer waits with randomization |
| 7 | **Graceful Termination** | All strategies exhausted | Task failure -- saves state for potential manual retry |

## Unified Message Model

The adapter pattern is the architectural linchpin for multi-platform support. Each `ChannelAdapter` implements:

- Inbound: platform-native message to `UnifiedMessage`
- Outbound: `UnifiedMessage` to platform-native response

This information-hiding approach means the entire core engine, memory system, and plugin layer operate on a single message type regardless of whether the user is on Telegram, WhatsApp, or WeChat.

## Local-First Privacy

OpenClaw adopts a local-first data philosophy: SQLite for persistence, on-device processing by default, and explicit user consent before any cloud sync. This positions it as a privacy-conscious alternative in the agent landscape where most competitors default to cloud storage.

## Relationship to Claude Code

Both OpenClaw and [[Claude Code Internals]] share the same foundational paradigm: persona + skills + memory + agent loop. The key architectural divergence is OpenClaw's message gateway layer, which Claude Code lacks -- Claude Code operates as a local CLI/IDE tool while OpenClaw serves as a multi-platform messaging agent. The [[Claude Code Engineering Course]] bonus chapter provides a side-by-side comparison and concludes that mastering one system's core logic transfers directly to the other.
