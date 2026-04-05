---
tags: [claude-code, multi-agent, subagents, plugins, skills, developer-workflow]
source: https://medium.com/@bokiko/the-claude-code-setup-nobody-talks-about-from-solo-agent-to-full-dev-team-673a1d7dfc01
---

# Claude Code Multi-Agent Setup

A layered extension architecture for [[Claude Code]] that scales from solo usage to coordinated multi-agent development teams. Four extension layers stack together, each serving a distinct purpose.

## Extension Layers

| Layer | When to Use | Key Trait |
|---|---|---|
| **Skills** | "Claude should always do X" | Markdown playbooks, zero code |
| **Plugins** | "I want this tool/integration" | Bundled packages with manifests |
| **Subagents** | "Do task without polluting context" | Isolated Claude instances |
| **Agent Teams** | "Work in parallel and coordinate" | Multi-instance with lateral messaging |

## Skills

### Scope Hierarchy

Skills live at four scopes (higher scope wins on name collision):

1. **Enterprise** -- managed settings (org-wide)
2. **Personal** -- `~/.claude/skills/`
3. **Project** -- `.claude/skills/`
4. **Plugin-bundled** -- namespaced to avoid conflicts

### Two Skill Types

- **Reference skills** -- auto-loaded, add persistent knowledge (e.g., API conventions)
- **Task skills** -- invoked on demand with `/name`, use `disable-model-invocation: true` to prevent auto-trigger

### Dynamic Context Injection

The `` `!command` `` syntax executes shell commands before Claude sees the skill -- output is pre-injected, not run by the model.

### Notable Built-in Skills

| Skill | Behavior |
|---|---|
| `/simplify` | Spawns 3 parallel review agents for reuse/quality/efficiency |
| `/batch` | Orchestrates parallel codebase-wide changes in isolated worktrees |
| `/loop [interval]` | Repeated polling on a schedule |
| `/claude-api` | Loads SDK reference into context |

## Plugins

Directories with `plugin.json` manifests bundling skills + agents + hooks + MCP servers + LSP configs. Available through the official Anthropic marketplace (`/plugin`) or community marketplaces from GitHub/GitLab.

**LSP plugins** give Claude automatic diagnostics after every file edit (type errors, missing imports) -- 11 languages available from the official marketplace.

**Team distribution**: `.claude/settings.json` can specify team marketplaces so new devs get prompted to install shared plugins on project trust -- zero manual onboarding.

## Subagents

Isolated Claude instances that protect the main conversation's context window. Benefits:

- **Context preservation** -- main window stays clean
- **Tool restrictions** -- a read-only reviewer literally cannot edit files
- **Model routing** -- Haiku for cheap tasks, Opus for complex ones
- **Persistent memory** -- 3 scopes: user / project / local
- **Worktree isolation** -- separate git worktrees per agent

**Rule of thumb**: if reading more than 3 files to understand something, use a subagent.

## Agent Teams (Experimental)

Opt-in via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. Unlike subagents (which only report back to parent), teammates have:

- Lateral messaging between agents
- Shared task board for coordination
- Adversarial debugging pattern (spawn 4 teammates instructed to disprove each other's hypotheses)

### Cost and Sizing

Token usage scales linearly with team size. Start with 3-5 teammates; coordination overhead outweighs benefit beyond that. Use subagents for routine work.

### Known Limitations

- `/resume` does not restore in-process teammates
- Task status can lag
- No nested teams
- Split panes require tmux/iTerm2

## Agent Skills Open Standard

Claude Code skills follow a spec adopted by 26+ tools including Cursor, VS Code, Gemini CLI, GitHub Copilot, OpenAI Codex -- write once, use across compatible agents.

## See Also

- [[Claude Code Agentic OS]] -- system-level skill orchestration architecture
- [[Claude Code Tips Collection]] -- practical usage patterns
- [[Claude Code Language Benchmark]] -- language selection for AI-assisted coding
