---
tags: [mcp, context-window, context-optimization, claude-code, ai-tools, coding-agents, session-continuity, tool-sandbox]
source: https://github.com/mksglu/context-mode
wiki: wiki/dev-tools/context-mode-mksglu.md
---

# Context Mode — MCP Context Window Optimizer (mksglu/context-mode)

## Article Info
- URL: https://github.com/mksglu/context-mode
- Title: context-mode
- Author: mksglu (maintainer)
- Publish time: Active (last commit recent as of Apr 2026)
- Access mode: `public`

## Executive Summary

Context Mode is an MCP server that attacks three simultaneous problems in AI coding agents: context window bloat (raw tool output floods context), session amnesia (the agent forgets state when the context compacts), and inefficient computation (LLM reads 50 files to count functions instead of writing a script). It provides 6 sandbox tools that intercept raw output before it enters the context window — turning a 56 KB Playwright snapshot into 299 bytes (99% reduction) — and a SQLite/FTS5 event store that rebuilds working state after compaction. Supports 12 platforms (Claude Code, Gemini CLI, VS Code Copilot, Cursor, OpenCode, KiloCode, OpenClaw, Codex CLI, Antigravity, Kiro, Zed, Pi). On hook-capable platforms, context savings reach ~98%; without hooks, ~60%.

## Outline

1. **The Problem** — three interconnected failure modes: context bloat, session amnesia, and LLM-as-data-processor anti-pattern.
2. **Sandbox Tools** — 6 MCP tools that execute code/fetch in isolated subprocesses, returning only the result.
3. **Session Continuity** — SQLite event store + FTS5 index; PreCompact snapshot + SessionStart restore cycle.
4. **Think in Code Paradigm** — LLM writes a script to extract what it needs instead of reading raw data into context.
5. **Platform Compatibility** — hook support matrix across 12 platforms; hook vs. instruction-file enforcement tradeoffs.
6. **Benchmarks** — per-scenario KB reduction numbers across 8+ real-world workloads.
7. **Privacy & Security** — local-only architecture, no telemetry; Claude Code permission rules extended into sandbox.
8. **Utility Commands** — ctx stats, ctx doctor, ctx upgrade, ctx purge, ctx insight.

## Section Summaries

### 1. The Problem

Three failure modes compound each other in long AI coding sessions:

- **Context bloat**: every MCP/Bash tool call dumps raw output into context. A Playwright DOM snapshot = 56 KB. 20 GitHub issues = 59 KB. One access log = 45 KB. After 30 minutes, 40% of context is consumed by raw tool output.
- **Session amnesia**: when context fills, the agent triggers compaction (summarization + truncation). Without session tracking, the model forgets active files, pending tasks, and prior user decisions — forcing the user to re-explain everything.
- **LLM-as-data-processor anti-pattern**: the model reads 50 files to count functions, parses CSVs line-by-line, scrapes 315 KB of HTML to find one URL. This is 10–100× more expensive than writing a 5-line script that `console.log()`s only the result.

Context Mode's thesis: "The LLM should program the analysis, not compute it."

### 2. Sandbox Tools

Six MCP tools run user code/fetches in isolated subprocesses. Raw data never enters the LLM's context window.

| Tool | Purpose |
|---|---|
| `ctx_execute` | Run a shell command; return only stdout summary |
| `ctx_batch_execute` | Run N commands in parallel; return summaries |
| `ctx_execute_file` | Run a script file; return stdout |
| `ctx_index` | Fetch a URL and index it into FTS5 — returns doc ID, not content |
| `ctx_search` | BM25 search over indexed docs — returns ranked excerpts |
| `ctx_fetch_and_index` | Fetch + index in one call |

The pattern: instead of `Bash("curl url")` dumping 60 KB into context, the agent calls `ctx_fetch_and_index(url)` and gets back a 200-byte doc ID, then queries specific facts with `ctx_search("BM25 query")`.

### 3. Session Continuity

Every tool call passes through PostToolUse hooks that write structured events to a per-project SQLite database. Events are indexed into FTS5 for BM25 retrieval.

**What gets captured (by priority tier):**

| Category | Events | Priority |
|---|---|---|
| Files | read, edit, write, glob, grep | P1 Critical |
| Tasks | create, update, complete | P1 Critical |
| Rules | CLAUDE.md / GEMINI.md paths | P1 Critical |
| User Prompts | every message (last-prompt restore) | P1 Critical |
| Decisions | user corrections ("use X instead") | P2 High |
| Git | checkout, commit, push, status | P2 High |
| Errors | tool failures, non-zero exits | P2 High |
| MCP Tools | all mcp__* calls with counts | P3 Normal |
| Subagents | Agent tool invocations | P3 Normal |
| Intent | session mode (implement / debug / review) | P4 Low |

**Compaction survival cycle:**
```
PreCompact fires
  → Read all events from SQLite
  → Build priority-tiered XML snapshot (≤2 KB)
  → Store in session_resume table

SessionStart fires (source: "compact")
  → Retrieve snapshot
  → Write structured events file → auto-index into FTS5
  → Build Session Guide (15 categories)
  → Inject <session_knowledge> into context
  → Model continues from last user prompt
```

The 2 KB snapshot budget means lower-priority events (intent, MCP counts) are dropped first; active files, tasks, rules, and decisions are always preserved. After compaction, the model receives a **Session Guide** with: Last Request, Tasks (checkbox format), Key Decisions, Files Modified, Unresolved Errors, Git ops, Project Rules, MCP Tools Used, Subagent Tasks, Skills Used, Environment, Data References, Session Intent, User Role.

Full session continuity (all 5 hook types) is available on **Claude Code**, **Gemini CLI**, and **VS Code Copilot**. Partial on Cursor (no SessionStart), OpenCode (no SessionStart yet), Kiro (no agentSpawn yet).

### 4. Think in Code Paradigm

Core insight: the LLM's value is as a code generator, not a data processor. Instead of:
- Reading 50 files to count functions → **write a `find . | wc -l` script**
- Parsing a 85 KB CSV to find an outlier → **write a 3-line `awk` or Python script**
- Loading 315 KB of repo code to answer an architecture question → **write a grep + ast-parse script**

The `ctx_execute` tool forces this pattern by never returning raw file contents — it only returns what the script `console.log()`s. One `ctx_execute` call replaces 10 `Read` calls and saves 100× context.

### 5. Platform Compatibility

**Hook capability determines savings level:**

| Platform | Hooks | Context Saving (with hooks) | Without hooks |
|---|---|---|---|
| Claude Code | Full (auto via plugin) | ~98% | ~60% |
| Gemini CLI | Full (manual config) | ~98% | ~60% |
| VS Code Copilot | Full (manual config) | ~98% | ~60% |
| Cursor | Partial (no SessionStart) | ~98% | ~60% |
| OpenCode | Plugin (no SessionStart) | ~98% | ~60% |
| Codex CLI | Ready (hooks not dispatched yet) | ~98% (pending) | ~60% |
| Antigravity | None | — | ~60% |
| Zed | None | — | ~60% |

Hooks intercept tool calls **before** execution and can block or redirect them. Instruction files (CLAUDE.md, AGENTS.md, GEMINI.md) only guide the model via prompts — they can't block a raw `curl` call. "Without hooks, one unrouted `curl` or Playwright snapshot can dump 56 KB into context — wiping out an entire session's worth of savings."

**Claude Code install** (simplest — fully automatic):
```bash
/plugin marketplace add mksglu/context-mode
/plugin install context-mode@context-mode
# then: /context-mode:ctx-doctor to verify
```

### 6. Benchmarks

| Scenario | Raw | Context | Saved |
|---|---|---|---|
| Playwright snapshot | 56.2 KB | 299 B | 99% |
| GitHub Issues (20) | 58.9 KB | 1.1 KB | 98% |
| Access log (500 requests) | 45.1 KB | 155 B | 100% |
| Context7 React docs | 5.9 KB | 261 B | 96% |
| Analytics CSV (500 rows) | 85.5 KB | 222 B | 100% |
| Git log (153 commits) | 11.6 KB | 107 B | 99% |
| Test output (30 suites) | 6.0 KB | 337 B | 95% |
| Repo research (subagent) | 986 KB | 62 KB | 94% |

**Full session aggregate**: 315 KB raw → 5.4 KB. Session duration extends from ~30 minutes to ~3 hours.

### 7. Privacy & Security

- **No telemetry, no cloud sync, no account required.** All data stays in local SQLite (`~/.config/context-mode/` or similar).
- **Architecture**: MCP protocol layer → sandbox subprocess → result summary only → LLM context. Raw data never touches the model's input.
- **Security model**: Claude Code's `settings.json` permission rules (`deny: ["Bash(sudo *)"]`) are automatically enforced inside all 3 sandbox execution tools. Chained commands (`cmd1 && cmd2`) are split and each part checked independently.
- **License**: Elastic License v2 (ELv2). Source-available; cannot be offered as competing hosted SaaS.

### 8. Utility Commands

In-session (type in chat; LLM calls MCP tool automatically):
- `ctx stats` — per-tool context savings, call counts, savings ratio
- `ctx doctor` — diagnose runtimes, hooks, FTS5, SQLite, versions
- `ctx upgrade` — pull latest from GitHub, rebuild, migrate cache, fix hooks
- `ctx purge` — delete all indexed content from knowledge base
- `ctx insight` — personal analytics dashboard (opens local web UI, 15+ metrics)

Claude Code also registers slash command variants: `/context-mode:ctx-stats`, etc.

## Key Numbers / Quick Facts

| Fact | Value |
|---|---|
| Platforms supported | 12 |
| Context saving (with hooks) | ~98% |
| Context saving (without hooks) | ~60% |
| Full session aggregate: raw → compressed | 315 KB → 5.4 KB |
| Session duration extension | ~30 min → ~3 hours |
| Playwright snapshot reduction | 56.2 KB → 299 B (99%) |
| Compaction snapshot budget | ≤2 KB XML |
| Session Guide categories | 15 |
| Hacker News reception | #1, 570+ points |
| Claimed user base organizations | Microsoft, Google, Meta, Amazon, NVIDIA, ByteDance, Stripe, Datadog, Salesforce, GitHub |

## Key Takeaways

- **98% context reduction is achievable via sandbox routing** — the mechanism is simple: intercept tool calls via hooks, run in subprocess, return only the result summary. Without hooks, instruction-file enforcement only achieves ~60%.
- **Session continuity is the bigger unsolved problem**: context bloat is annoying but recoverable; losing task state mid-session (active files, pending tasks, user decisions) costs 10-15 minutes of re-prompting per compaction event.
- **The "think in code" paradigm is a mandatory discipline**: treating the LLM as a data processor (reading raw files, computing aggregates) is 10–100× less efficient than having it write a 5-line script and calling `ctx_execute`.
- **Hook capability varies dramatically across platforms**: Claude Code has full hook support (5 hook types); Cursor is missing SessionStart; Zed/Antigravity have no hooks at all. Platform choice has direct impact on session quality.
- **Claude Code install is zero-config** via the plugin marketplace (`/plugin marketplace add mksglu/context-mode`); all hooks are registered automatically with no project file pollution.
- **Security model is additive, not replacement**: existing Claude Code permission rules (`deny: ["Bash(sudo *)"]`) automatically extend into the sandbox execution tools — no new configuration needed.
- **Local-first architecture is a deliberate design choice**: "Context optimization should happen at the source, not in a dashboard behind a per-seat subscription."

## Insights

- The FTS5/BM25 retrieval layer for session events is a micro-RAG system: instead of dumping the entire session history into context at compaction, it retrieves only relevant events — elegant and scalable.
- The 2 KB compaction snapshot budget forces an explicit priority triage (P1→P4 event tiers) — this is itself a useful design pattern for any system that needs to survive context pressure.
- Supporting 12 platforms from one codebase required an adapter pattern: each platform gets a thin adapter (`claude-code`, `gemini-cli`, `opencode`, etc.) that maps to the same MCP server + hook infrastructure.
- The "routing instructions written to project dir" behavior was removed after community feedback (git tree pollution) — hooks now inject routing at runtime with no file side-effects.

## Caveats

- Codex CLI hook dispatch is `Stage::UnderDevelopment` — hook scripts are ready but not yet dispatched upstream ([openai/codex#16685](https://github.com/openai/codex/issues/16685)).
- Cursor's SessionStart hook is documented but currently rejected by Cursor's validator — session restore after compaction is unavailable on Cursor.
- ELv2 license prohibits offering context-mode as a hosted/managed service — relevant for teams building internal AI platforms.
- Benchmark numbers are for single scenarios; real-world savings depend on project size and tool call mix.

## Sources

- https://github.com/mksglu/context-mode
- https://news.ycombinator.com/item?id=47193064 (Hacker News #1, 570+ points)
- https://www.npmjs.com/package/context-mode
