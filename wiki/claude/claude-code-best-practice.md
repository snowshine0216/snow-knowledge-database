---
tags: [claude-code, best-practices, agentic-engineering, subagents, skills, commands, hooks, mcp, workflows, context-engineering]
source: https://github.com/shanraisshan/claude-code-best-practice
---

# Claude Code Best Practice

Community-maintained reference repo by Shayan Raisshan — the most comprehensive aggregation of Claude Code best practices, sourced from Boris Cherny, Thariq, Cat Wu, Lydia Hallie, and community contributors. 47k+ stars, #1 GitHub trending (Apr 2026).

The repo's organizing principle: "from vibe coding to agentic engineering." It covers every Claude Code primitive with sourced tips, working examples, and comparative workflow analysis.

## Core Abstraction Map

Three primitive types with distinct roles:

| Primitive | Location | Role |
|-----------|----------|------|
| **Subagents** | `.claude/agents/<name>.md` | Autonomous actor in isolated context — own tools, model, memory, permissions |
| **Commands** | `.claude/commands/<name>.md` | Prompt templates injected into existing context — for workflow orchestration |
| **Skills** | `.claude/skills/<name>/SKILL.md` | Configurable, preloadable knowledge — supports context forking and progressive disclosure |

**Hooks** run outside the agentic loop on specific events (PreToolUse, PostToolUse, Stop). **MCP Servers** connect Claude to external tools/APIs. **Plugins** bundle all of the above for distribution.

See [[claude-code-multi-agent-setup]] for multi-agent patterns, [[claude-code-tips-collection]] for Boris Cherny's complete tip series.

## Orchestration Pattern

The canonical pattern: **Command → Agent → Skill**

```bash
claude
/weather-orchestrator   # Command spawns agents that invoke skills
```

A command orchestrates the flow, agents handle isolated subtasks (keeping parent context clean), skills provide reusable domain knowledge with progressive disclosure.

## High-Signal Tips

### Context Management

- **Dumb zone** starts at ~40% context — keep below 30% for intelligence-sensitive work; push to 60% only on simple tasks
- **Context rot** on the 1M-context model kicks in at ~300–400k tokens
- **Rewind > correct** — double-Esc or `/rewind` before the failed attempt beats leaving corrections in context
- `/compact` with a hint beats letting autocompact fire — the model is at its least intelligent when autocompacting
- Use subagents for context isolation: tool calls, dead ends, and intermediate reads stay in the child's context

### Session Management

Every turn is a branching point — choose between: Continue / `/rewind` / `/clear` / `/compact` / Subagent based on how much context you need to carry forward.

- **New task = new session**; related tasks (e.g., writing docs for what you just built) may reuse context
- Use "summarize from here" before rewinding — handoff note from Claude to its previous self
- `/rename` sessions and `/resume` later when running multiple instances in parallel

### Skills Best Practices (from Thariq)

- **Skills are folders, not files** — use `references/`, `scripts/`, `examples/` subdirectories for progressive disclosure
- **Skill description = trigger condition**, not summary — write it for the model ("when should I fire?")
- **Gotchas section** is highest-signal content — add Claude's failure points over time
- Don't state the obvious; focus on what pushes Claude out of its default behavior
- Don't railroad with prescriptive steps — give goals and constraints

### Settings vs CLAUDE.md

- **Deterministic behaviors belong in `settings.json`** — attribution, permissions, model selection; don't put "NEVER add Co-Authored-By" in CLAUDE.md when `attribution.commit: ""` is deterministic
- CLAUDE.md: target under 200 lines per file; wrap domain-specific rules in `<important if="...">` tags to prevent ignored instructions
- `.claude/rules/*.md` auto-load like CLAUDE.md; add `paths:` frontmatter to lazy-load on file glob match only

### Hooks

- **PostToolUse** → auto-format code (handles last 10% that CI needs)
- **Stop hook** → nudge Claude to verify work or keep going at turn end
- **Permission hook** → route to Opus to scan for prompt injection, auto-approve safe commands
- Use on-demand hooks in skills: `/careful` blocks destructive commands, `/freeze` blocks edits outside a directory

### Git / PR

- Keep PRs small (Boris: p50 = 118 lines across 141 PRs, 45k lines/day)
- Always squash merge — clean linear history, easy `git bisect` and `git revert`
- Commit at least once per hour; tag `@claude` on a coworker's PR to auto-generate lint rules from review feedback

## Development Workflow Landscape

Ten major Claude Code workflow repos compared (Apr 2026 star counts):

| Repo | Stars | Distinctive Approach |
|------|-------|----------------------|
| [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) | 160k | Instinct scoring, AgentShield, 48 agents / 143 commands / 230 skills |
| [Superpowers](https://github.com/obra/superpowers) | 159k | TDD-first, Iron Laws, whole-plan review |
| [Spec Kit](https://github.com/github/spec-kit) | 89k | Spec-driven, constitution, 22+ tools |
| [gstack](https://github.com/garrytan/gstack) | 76k | Role personas, /codex review, parallel sprints, 37 skills |
| [Get Shit Done](https://github.com/gsd-build/get-shit-done) | 55k | Fresh 200k contexts, wave execution, XML plans |
| [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) | 45k | Full SDLC, agent personas, 22+ platforms |
| [OpenSpec](https://github.com/Fission-AI/OpenSpec) | 41k | Delta specs, brownfield, artifact DAG |
| [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) | 30k | Teams orchestration, tmux workers, skill auto-inject |
| [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) | 15k | Compound learning, multi-platform CLI, plugin marketplace |
| [HumanLayer](https://github.com/humanlayer/humanlayer) | 10k | RPI, context engineering, 300k+ LOC |

All converge on: **Research → Plan → Execute → Review → Ship**.

## Hot Features (2026)

- **Routines** — cloud automation on Anthropic infra, runs when machine is off
- **Ultrareview** — multi-agent PR analysis with independent verification (~$5–20/run)
- **Auto Mode** — background safety classifier replaces permission prompts (`Shift+Tab` to cycle Ask→Plan→Auto)
- **Agent SDK** — build production agents with Claude Code as a library (Python + TypeScript)
- **Ralph Wiggum Loop** — autonomous development loop for long-running tasks
- **Git Worktrees** — each agent gets an isolated working copy via `isolation: "worktree"` frontmatter

## Open Questions ("Billion-Dollar Questions")

The repo surfaces unresolved Claude Code design problems worth tracking:

1. What exactly belongs in CLAUDE.md vs rules.md vs settings.json?
2. When should you use command vs subagent vs skill vs vanilla Claude Code?
3. Can you spec a codebase, delete the code, and regenerate it exactly from specs alone?
4. Why does Claude ignore CLAUDE.md even with MUST in all caps?

## Practical Use

```
1. Read the repo like a course — learn primitives before using them
2. Clone and run /weather-orchestrator to see Command→Agent→Skill live
3. Ask Claude: "suggest best practices from shanraisshan/claude-code-best-practice for this project"
```

Related: [[claude-code-tips-collection]] · [[claude-code-multi-agent-setup]] · [[claude-code-agentic-os]] · [[45-claude-code-tips]]
