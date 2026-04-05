---
tags: [claude-code, source-code, agent-runtime, slash-commands, memory, permissions, mcp, multi-agent]
source: https://www.youtube.com/watch?v=tXtCK66fPj8
---

# Claude Code Internals

Claude Code is a full **agent runtime**, not a terminal chatbot. Built with Bun, TypeScript, and React, it contains a tool system, command system, memory system, permission engine, task manager, multi-agent coordinator, and MCP client/server -- all wired into one execution pipeline.

**Execution flow**: Input --> CLI parser --> query engine --> LLM API call --> tool execution loop --> terminal render.

## Slash Commands

Claude Code exposes approximately 85 slash commands. The highest-impact ones:

| Command | Purpose |
|---|---|
| `/init` | Generate a `CLAUDE.md` file as the project operating manual |
| `/plan` | Enter planning mode -- map the approach before editing files (saves tokens) |
| `/compact [prompt]` | Compress conversation history; optionally retain specific context |
| `/review` | Structured code review workflow |
| `/security review` | Security-focused code review |
| `/context` | Manage which files are loaded (every file costs tokens) |
| `/cost` | Show actual session spend |
| `/resume` | Pick up where you left off between sessions |
| `/summary` | Summarize current session for later resumption |

## The Memory System

Claude Code has a multi-layer memory architecture:

- **Project-level** -- `CLAUDE.md` in the project root, injected every session before every interaction
- **User-level** -- `~/.claude/CLAUDE.md`, personal preferences not shared with team
- **Session-level** -- extracted memories, conversation context
- **Team synchronization** -- shared memory across collaborators

### CLAUDE.md Best Practices

`CLAUDE.md` is not documentation -- it is **operating context**. Keep it short, opinionated, and operational:

- Decision rules: "Use TypeScript strict mode always"
- Constraints: "Never modify DB schema without migrations"
- Conventions: "Tests go next to source files", "Use PNPM not npm"

This is the single highest-leverage configuration for [[Claude Code Tips Collection|Claude Code]] productivity.

## Permission System

The permission system has multiple modes: default (asks about everything), plan mode, and bypass/auto modes.

**Wildcard permissions** are the highest-ROI change for recurring workflows. Configure in `settings.json` or `settings.local.json`:

- "Allow all git commands"
- "Allow all file edits in `src/`"
- Configurable at global, user, or project level

## Multi-Agent Architecture

The source reveals a full **coordinator subsystem** with agent tools, team tools, and a task system for background and parallel work. The architecture supports:

- One agent explores the codebase while another implements changes and another validates tests
- Sequential or parallel task decomposition
- Sub-agent model overrides for different task types

**Best practice**: decompose work into phases (search --> plan --> execute --> verify) rather than sending monolithic prompts.

## Extension Layer

Claude Code functions as both an **MCP client and MCP server**. The extension model includes:

- **MCP integrations** -- connect to databases, APIs, internal tools, documentation systems
- **Skills and plugins** -- repeatable workflows and domain-specific extensions
- **Custom capabilities** that compound over time

### Internal Feature Flags

The source checks for `userType = "ant"` (Anthropic internal). Gated features include:

- Voice mode
- "Chyros" (internal system)
- Daemon mode
- Coordinator mode

These flags are roadmap signals -- features ship publicly after internal validation.

## The 7 Habits of Top Users

1. **Treat CLAUDE.md as a force multiplier** -- short, opinionated, updated regularly
2. **Learn the command service** -- `/plan`, `/compact`, `/context`, `/review`, `/cost`, `/resume`
3. **Configure permissions** -- wildcard rules for daily workflows
4. **Decompose, don't monolith** -- search --> plan --> execute --> verify
5. **Manage context like money** -- `/compact` for long conversations, `/context` to control loaded files
6. **Connect things to it** -- MCP servers, CLIs, plugins, skills
7. **Treat it like infrastructure** -- model routing, sub-agent overrides, backend routing (AWS Bedrock, Google Vertex)

The core insight: top users design a better **operating environment** for Claude Code rather than writing better prompts.

## See Also

- [[Claude Code Tips Collection]] -- curated usage tips and patterns
- [[Claude Certified Architect]] -- certification covering Claude Code in production
- [[Harness Engineering]] -- engineering workflow practices
