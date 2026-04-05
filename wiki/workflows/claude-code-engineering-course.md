---
tags: [claude-code, geektime, sub-agents, skills, hooks, mcp, tools, engineering]
source: https://time.geekbang.org/column/article/942422
---

# Claude Code Engineering Course

A 22-chapter GeekTime course (Claude Code 工程化实战) by Huang Jia (黄佳) that systematically teaches how to transform Claude Code from a chat-based coding assistant into a fully orchestrated AI engineering team. The course is structured around real engineering pain points rather than feature walkthroughs.

## Course Thesis

The shift from "programmer" to "geek": Claude Code democratizes engineering capability so that the bottleneck moves from writing code to orchestrating intent. The course frames this as evolving from hands-on-keyboard coding to directing an AI team -- the developer becomes a conductor, not a performer.

## Module Breakdown

### Memory (Ch 1-2)

Covers Claude Code's multi-layer memory architecture and `CLAUDE.md` as the project operating manual. Solves the cold-start problem where every new conversation begins without project context. Overlaps with the memory section in [[Claude Code Internals]].

### Sub-Agents (Ch 3-8)

The deepest module in the course. Sub-agents provide **isolation**, **constraint**, and **reuse**:

- **Isolation** -- each sub-agent owns an independent context window; noisy execution logs stay contained and only conclusions return to the main conversation
- **Constraint** -- tool permissions enforce role boundaries structurally (read-only auditors physically cannot edit files), replacing prompt-level "please don't" with system-level "you can't"
- **Reuse** -- configured once, invoked across projects

Built-in sub-agents covered: Explore (read-only search), Plan (pre-edit reasoning), General-purpose (multi-step). Custom sub-agent patterns: read-only security auditor (Ch 5), test runner and log analyzer for high-noise tasks (Ch 6), parallel exploration and pipeline orchestration (Ch 7), and Agent Teams multi-session collaboration (Ch 8).

For the extension-layer taxonomy (skills vs plugins vs subagents vs agent teams), see [[Claude Code Multi-Agent Setup]].

### Skills (Ch 9-14)

Skills are defined as **semantically-triggered capability packages** -- domain knowledge, execution steps, output templates, and constraints that load on demand into the agent's cognitive space. Two key types:

- **Reference skills** -- shape *how* work is done (API conventions, style guides); loaded automatically by semantic matching
- **Task skills** -- define *what* to do (deploy, migrate, generate report); typically triggered via slash commands

The course draws an enterprise analogy: Skills = SOPs. Just as mature organizations don't expect employees to memorize every manual, Skills let Claude load the right procedure at the right time. The dual trigger mechanism (explicit `/command` and implicit semantic match) unifies both usage patterns.

Progressive disclosure architecture (Ch 11) and Skills + SubAgent composition patterns (Ch 12) round out the module. For the broader skill orchestration philosophy, see [[Claude Code Agentic OS]].

### Hooks (Ch 15-16)

Hooks are the **middleware layer** for AI tool calls -- the only extension mechanism that can intercept and modify Claude's behavior. The course catalogs 17 hook events across three categories:

- **Control points** (PreToolUse, UserPromptSubmit, Stop) -- can block or redirect execution
- **Takeover points** (PermissionRequest) -- replace human approval with automated policy
- **Observation points** (PostToolUse, SessionStart, Notification) -- log and react but cannot undo

Four execution types ranked by power and cost: Command (deterministic shell scripts), Prompt (lightweight LLM evaluation via Haiku), Agent (sub-agent evaluation with tool access), and Remote (HTTP webhook for external services).

### MCP (Ch 17)

Frames MCP as "USB-C for AI" -- a standard protocol that turns the M x N integration problem into M + N. Claude Code acts as MCP Client; external services expose MCP Servers via JSON-RPC 2.0. The architecture mirrors Language Server Protocol (LSP) from VS Code.

### Tools Internals (Ch 18)

Five atomic operations underpin all software engineering: perceive, search, modify, execute, fetch. Claude Code's ~20 built-in tools are primitives, not specialized utilities. Complex behaviors **emerge** from LLM-driven dynamic composition of simple tools -- analogous to Unix's "do one thing well" philosophy but with adaptive, non-linear chaining.

Tool risk tiers drive the permission model: read-only tools (Read, Grep, Glob) need no approval; write tools (Edit, Write) require confirmation; execution tools (Bash) always prompt.

### Bonus: OpenClaw + OpenCode Comparison (Ch 21)

Analyzes OpenClaw's gateway-driven architecture alongside Claude Code, concluding that the core paradigm (persona + skills + memory + agent loop) is shared across modern agent systems. See [[OpenClaw Architecture]] for the deep dive.

## Key Takeaway

The course positions Claude Code's extension surface as four interlocking systems: Memory (what the agent knows), Sub-Agents (how work is delegated), Skills (what procedures exist), and Hooks (what guardrails apply). Mastering the interplay -- not any single feature -- is what turns a chat tool into a sustainable AI engineering team.
