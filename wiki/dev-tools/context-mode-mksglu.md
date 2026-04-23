---
tags: [mcp, context-window, context-optimization, claude-code, ai-tools, coding-agents, session-continuity, tool-sandbox]
source: https://github.com/mksglu/context-mode
---

# Context Mode — MCP Context Window Optimizer

An MCP server that attacks three simultaneous failure modes in AI coding sessions: context window bloat (raw tool output floods context), session amnesia (agent forgets state when context compacts), and the LLM-as-data-processor anti-pattern (agent reads 50 files to count functions instead of writing a script). Context Mode intercepts tool calls via hooks before they reach the LLM's context window, runs them in isolated sandbox subprocesses, and returns only structured result summaries. Over a full session, 315 KB of raw output compresses to 5.4 KB — extending a ~30-minute session to ~3 hours. Supports 12 platforms including Claude Code, Gemini CLI, VS Code Copilot, Cursor, OpenCode, and Codex CLI. Reached Hacker News #1 with 570+ points.

## Key Concepts

- **Sandbox tools (6)**: `ctx_execute`, `ctx_batch_execute`, `ctx_execute_file`, `ctx_index`, `ctx_search`, `ctx_fetch_and_index`. Each intercepts a tool call, runs it in a subprocess, and returns only the result — never the raw data. A 56 KB Playwright snapshot becomes 299 bytes (99% reduction); a 985 KB repo research subagent becomes 62 KB (94% saved).
- **Think in Code paradigm**: mandatory design principle across all 12 platforms. The LLM writes a 5-line script that `console.log()`s only what it needs, then calls `ctx_execute`. One script replaces 10 `Read` calls and saves 100× context. Treating the LLM as a code generator, not a data processor.
- **Session continuity**: every tool call passes through PostToolUse hooks writing structured events (files, tasks, rules, git ops, errors, user decisions) to SQLite with FTS5 indexing. When context compacts, PreCompact builds a ≤2 KB priority-tiered XML snapshot; SessionStart restores a 15-category Session Guide injected into context. The model continues from the last user prompt with full working state intact.
- **Compaction snapshot priority tiers**: P1 (active files, tasks, CLAUDE.md paths, last user prompt) → P4 (session intent, MCP tool counts). When the 2 KB budget is tight, P4 events are dropped first; critical state is always preserved.
- **Hook vs. instruction-file enforcement**: hooks intercept and can block tool calls programmatically (~98% savings). Instruction files (CLAUDE.md, AGENTS.md) guide via prompt only (~60% savings). "One unrouted `curl` can dump 56 KB into context — wiping out an entire session's worth of savings."
- **Security model**: Claude Code's `settings.json` deny rules (`Bash(sudo *)`) automatically extend into the sandbox tools. Chained commands (`cmd1 && cmd2`) are split and each checked independently. Zero setup required if no permissions are configured.
- **Local-first architecture**: no telemetry, no cloud sync, no account. All SQLite data lives in the home directory. "Context optimization should happen at the source, not in a dashboard behind a per-seat subscription."

## Key Numbers

| Fact | Value |
|---|---|
| Platforms supported | 12 |
| Context saving (with hooks) | ~98% |
| Context saving (without hooks) | ~60% |
| Full session aggregate | 315 KB → 5.4 KB |
| Session duration extension | ~30 min → ~3 hours |
| Playwright snapshot | 56.2 KB → 299 B (99%) |
| Compaction snapshot budget | ≤2 KB XML |
| HN reception | #1, 570+ points |

## Platform Hook Support

| Platform | Full Session Continuity | Hook Types |
|---|---|---|
| Claude Code | Yes (auto via plugin) | 5/5 (PreToolUse, PostToolUse, UserPromptSubmit, PreCompact, SessionStart) |
| Gemini CLI | High | 4/5 (missing UserPromptSubmit) |
| VS Code Copilot | High | 4/5 |
| Cursor | Partial | 2/5 (no SessionStart — Cursor validator rejects it) |
| Codex CLI | Pending | Hooks ready but dispatch not yet enabled upstream |
| Zed / Antigravity | None | No hook support in current release |

## Key Takeaways

- Claude Code install is zero-config via plugin marketplace (`/plugin marketplace add mksglu/context-mode`); all hooks register automatically with no file side-effects on the project tree.
- The FTS5/BM25 retrieval layer for session events is a micro-RAG system — instead of dumping full session history into context at compaction, it retrieves only relevant events.
- The 2 KB compaction snapshot budget forces explicit priority triage (P1→P4) — a design pattern applicable to any system that must survive context pressure.
- ELv2 license: source-available, free to use/fork/modify, but cannot be offered as a competing hosted/managed SaaS.

## See Also

- [[supermemory]]
- [[metaclaw]]
- [[llm-api-statelessness]]
- [[caveman-token-saver]]
