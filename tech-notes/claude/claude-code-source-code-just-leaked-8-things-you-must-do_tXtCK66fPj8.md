---
tags: [claude-code, source-code, tips, slash-commands, memory, permissions, mcp, multi-agent]
source: https://www.youtube.com/watch?v=tXtCK66fPj8
---

# Course: Claude Code Source Code Just Leaked — 8 Things You Must Do

> **Instructor:** Nate Herk | AI Automation
> **Duration:** 12 min 51 s | **Published:** 2026-04-01
> **Views:** 113,554 | **Likes:** 4,156
> **Prerequisites:** Basic familiarity with Claude Code CLI
> **Code/Links:** Free resource guide in Skool community (link in description)

---

## Course Overview

Anthropic accidentally published an NPM package containing a source-map file that pointed to readable TypeScript source for Claude Code. A security researcher found it and the full source (2,000 files, 500k+ lines) was mirrored on GitHub within hours. This video distills 8 practical insights from the codebase that change how you should use Claude Code — from hidden commands and the memory system to permissions, multi-agent architecture, and unreleased features.

---

## Module 1 — What Claude Code Actually Is

**Timestamps:** `0:00 – 2:40` (~2 min 40 s)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 1.1 | The Leak — how it happened | 0:00 |
| 1.2 | It's not a chatbot — it's an agent runtime | 1:41 |

### Key Concepts
- **Source-map leak**: Anthropic published an NPM package with a source-map pointing to readable TypeScript. A researcher followed the breadcrumbs; the full codebase was mirrored publicly within hours. Anthropic still owns copyright and has issued DMCA takedowns.
- **Agent runtime, not chatbot**: Claude Code is built with Bun, TypeScript, and React. It contains a tool system, command system, memory system, permission engine, task manager, multi-agent coordinator, and MCP client/server — all wired into one execution pipeline.
- **Execution flow**: Input → CLI parser → query engine → LLM API call → tool execution loop → terminal render.
- **Fun detail**: The spinner has 187 verbs including "boondoggling", "discombobulating", and "moonwalking".

### Learning Objectives
- [ ] Understand that Claude Code is a full agent runtime, not a terminal chatbot
- [ ] Recognize that most users only leverage ~10% of its capabilities

---

## Module 2 — Commands & Memory System

**Timestamps:** `2:40 – 6:03` (~3 min 23 s)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 2.1 | The ~85 slash commands you're ignoring | 2:40 |
| 2.2 | The memory system and CLAUDE.md | 4:43 |

### Key Concepts
- **Essential slash commands**:
  - `/init` — generates a `CLAUDE.md` file as the project's operating manual
  - `/plan` — enters planning mode; maps the approach before editing files (saves tokens)
  - `/compact [prompt]` — compresses conversation history; optionally keep specific context
  - `/review` and `/security review` — structured code review workflows (first-class, not afterthought)
  - `/context` — manage which files are loaded (every file costs tokens)
  - `/cost` — shows actual session spend
  - `/resume` and `/summary` — pick up where you left off between sessions
- **CLAUDE.md as operating context**: Not documentation — it's the "onboarding document" for Claude Code. Best practice: keep it short, opinionated, and operational (decision rules, constraints, conventions).
  - Example entries: "Use TypeScript strict mode always", "Tests go next to source files", "Never modify DB schema without migrations", "Use PNPM not npm"
- **Memory layers**: User-level memory, extracted memories, team memory synchronization. Persistent across project, user, and session contexts.
- **Highest leverage action**: Update your `CLAUDE.md` today — it's injected every session before every chat.

### Learning Objectives
- [ ] Use `/plan`, `/compact`, `/context`, `/cost`, `/resume` in daily workflow
- [ ] Write a short, opinionated `CLAUDE.md` with decision rules and constraints
- [ ] Understand multi-layer memory: project, user, and session levels

---

## Module 3 — Permissions & Multi-Agent Architecture

**Timestamps:** `6:03 – 8:20` (~2 min 17 s)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 3.1 | Permissions are why it feels slow | 6:03 |
| 3.2 | Built for multi-agent work | 7:10 |

### Key Concepts
- **Permission system modes**: Default (asks about everything), plan mode, bypass/auto modes.
- **Wildcard permissions**: Set rules like "allow all git commands" or "allow all file edits in `src/`". Configure in `settings.json` or `settings.local.json` at global, user, or project level. Highest ROI change for recurring workflows.
- **Multi-agent coordinator**: Source reveals a full coordinator subsystem — agent tools, team tools, task system for background and parallel work. One agent explores the codebase, another implements changes, another validates tests.
- **Decomposition over monoliths**: Instead of one massive prompt ("refactor this module, update tests, fix docs"), break work into sequential or parallel steps. Let Claude Code decompose and distribute work.

### Learning Objectives
- [ ] Configure wildcard permissions for daily recurring workflows
- [ ] Structure requests as decomposed phases instead of monolithic prompts
- [ ] Understand the multi-agent architecture for parallel task execution

---

## Module 4 — Extensions & Unreleased Features

**Timestamps:** `8:20 – 10:22` (~2 min 2 s)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 4.1 | MCP, plugins & skills — the extension layer | 8:20 |
| 4.2 | Features we can't access yet | 9:19 |

### Key Concepts
- **MCP is baked in**: Claude Code is both an MCP client and MCP server. Connect to databases, APIs, internal tools, documentation systems — anything with an MCP server.
- **Skills & plugins layer**: Build repeatable workflows, custom capabilities, domain-specific extensions that compound over time. Claude Code becomes an integration layer, not just a coding tool.
- **Internal feature flags**: Source checks for `userType = "ant"` (Anthropic). Gated features include voice mode, a system called "Chyros", daemon mode, and coordinator mode.
- **Heavily feature-flagged**: Different users may get meaningfully different experiences depending on environment, build, or rollout group. Features shipping recently were likely built and tested internally long before public release.

### Learning Objectives
- [ ] Connect MCP servers to expand Claude Code's capabilities
- [ ] Build custom skills/plugins for repeated workflows
- [ ] Stay current on Claude Code updates — flagged features are roadmap signals

---

## Module 5 — The Top 1% System

**Timestamps:** `10:22 – 12:51` (~2 min 29 s)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 5.1 | How to actually use all of this | 10:22 |
| 5.2 | Free resource guide | 12:27 |

### Key Concepts
- **Core insight**: Top users don't just write better prompts — they design a better operating environment for Claude Code.
- **The 7 habits**:
  1. **Treat `CLAUDE.md` as a force multiplier** — short, opinionated, updated regularly, route to other files
  2. **Learn the command service** — `/plan`, `/compact`, `/context`, `/review`, `/cost`, `/resume`
  3. **Configure permissions** — wildcard rules for daily workflows; stop babysitting every action
  4. **Decompose, don't monolith** — search phase → plan phase → execute phase → verify phase
  5. **Manage context like money** — `/compact` for long conversations, `/context` to control loaded files, `/summary` + `/resume` across sessions
  6. **Connect things to it** — MCP servers, CLIs, plugins, skills; more connections = more value
  7. **Treat it like infrastructure** — model routing, sub-agent model overrides, shell behavior, privacy controls, backend routing (AWS Bedrock, Google Vertex)

### Learning Objectives
- [ ] Implement all 7 habits as a systematic Claude Code workflow
- [ ] Shift mindset from "better prompts" to "better operating environment"

---

## Course Summary

### The 8 Big Ideas

1. **It's an agent runtime, not a chatbot**: Tool system, command system, memory, permissions, task manager, multi-agent coordinator, and MCP — all under one execution pipeline.
2. **~85 slash commands exist**: `/plan`, `/compact`, `/context`, `/review`, `/cost`, `/resume` are the most impactful.
3. **CLAUDE.md is operating context**: Keep it short, opinionated, and operational — it shapes every interaction.
4. **Permissions unlock speed**: Wildcard permissions for recurring workflows are the highest ROI change.
5. **Multi-agent architecture**: Break complex work into decomposed parallel/sequential steps.
6. **MCP + skills + plugins**: Claude Code is an integration layer — connect everything to it.
7. **Feature flags gate unreleased capabilities**: Voice mode, daemon mode, coordinator mode are coming.
8. **Design the environment, not just the prompts**: Top 1% users build systems around Claude Code.

### Recommended Exercises
- Audit and rewrite your `CLAUDE.md` file today — make it short, opinionated, operational
- Run `/cost` after your next session to understand token spend
- Set up wildcard permissions in `settings.json` for git commands and src folder edits
- Connect at least one MCP server to your Claude Code setup
- Practice decomposing a complex task into search → plan → execute → verify phases

---

## Source Notes

- **Transcript source:** `manual subtitles` (en-orig VTT)
- **Cookie-auth retry:** used
- **Data gaps:** none
