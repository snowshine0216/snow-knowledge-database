---
tags: [claude-code, best-practices, agentic-engineering, subagents, skills, commands, hooks, mcp, workflows, context-engineering]
source: https://github.com/shanraisshan/claude-code-best-practice
---

# claude-code-best-practice Analysis

- Repository: https://github.com/shanraisshan/claude-code-best-practice
- Snapshot basis: README, repo metadata — 2026-04-22. Stars: 47,265. Forks: 4,646. Language: HTML.

## Repo Snapshot

**claude-code-best-practice** is a community-maintained reference repo by Shayan Raisshan (Pakistan), described as "from vibe coding to agentic engineering — practice makes claude perfect." It is the #3 most-starred Pakistani GitHub repository, currently #1 GitHub trending.

The repo aggregates Claude Code best practices from official Anthropic sources (Boris Cherny, Thariq, Cat Wu, Lydia Hallie) plus community contributors. It covers every major Claude Code abstraction:

- **Concepts table** — Subagents, Commands, Skills, Hooks, MCP Servers, Plugins, Settings, Status Line, Memory, Checkpointing, CLI Flags, Routines, Ultrareview, Ultraplan, Auto Mode, Agent SDK, Ralph Wiggum Loop, Computer Use, Chrome, Remote Control, Agent Teams, Scheduled Tasks, Tasks, Voice Dictation, Git Worktrees
- **Orchestration Workflow** — Command → Agent → Skill pattern with animated diagrams and working `/weather-orchestrator` example
- **Development Workflows table** — 10 major community workflow repos compared (Everything Claude Code, Superpowers, Spec Kit, gstack, GSD, BMAD-METHOD, OpenSpec, oh-my-claudecode, Compound Engineering, HumanLayer)
- **82 Tips and Tricks** — categorized by: Prompting, Planning, Context, Session, CLAUDE.md+rules, Agents, Commands, Skills, Hooks, Workflows, Advanced, Git/PR, Debugging, Utilities, Daily
- **Boris Cherny tip series** — compiled threads: 13 tips (Jan 2026), 10 tips (Feb), 12 tips (Feb), 15 tips (Mar), 6 tips (Apr)
- **Reports** — deep-dives on Agent SDK vs CLI, browser automation MCP, global vs project settings, skills in monorepos, agent memory, advanced tool use, usage/rate limits, agents vs commands vs skills, LLM degradation, harness importance
- **Videos/Podcasts** — curated list of 6 official Anthropic interviews (Boris Cherny, Cat Wu)
- **Startups displaced** — mapping of Claude features vs products they replace (Greptile, CodeRabbit, Wispr Flow, Playwright MCP, etc.)
- **Self-updating** — the repo's own workflows are Claude Code commands that regenerate the README sections automatically

## Primary Use Cases

1. **Learning Claude Code systematically** — structured coverage of every feature with best-practice pointers and official doc links
2. **Discovering community workflows** — comparative table of 10 major Claude Code workflow repos with unique attributes highlighted
3. **Finding the right tool for the right job** — tip sections distinguish when to use commands vs subagents vs skills vs hooks
4. **Staying current** — aggregates Boris Cherny/Anthropic team tips as they publish, updated with Claude Code itself
5. **Onboarding teams** — "How to Use" section suggests: read like a course → clone and experiment → ask Claude to suggest what to adopt in your project

## When To Use

- When starting with Claude Code and needing a comprehensive, cross-linked reference beyond official docs
- When evaluating which community workflow repo (Superpowers, gstack, BMAD, GSD, etc.) best fits your team's approach
- When designing a CLAUDE.md, subagent architecture, or skill taxonomy for a project
- When looking for specific tips (context management, session rewind, hook patterns) sourced to their original author
- When comparing Claude Code features against third-party tools they may replace

## Benefits

- **Authoritative sourcing** — every tip links to its original Boris/Thariq/community tweet or article; no unattributed claims
- **Comprehensive abstraction coverage** — only repo that covers all Claude Code primitives (subagents, commands, skills, hooks, MCP, plugins, settings, routines, ultrareview, ultraplan, agent teams, git worktrees) in one place
- **Comparative workflow analysis** — the development workflows table captures stars, unique badges, and agent/command/skill counts — saves hours of repo comparison
- **Self-demonstrating** — the repo itself is built with the practices it documents (commands, subagents, hooks, status line)
- **Actively maintained** — updated with Claude Code's rapid release pace (v2.1.116 as of Apr 21, 2026)
- **Ecosystem map** — the "startups displaced" section contextualizes where Claude Code sits competitively

## Limitations and Risks

- **Not a tutorial** — assumes basic Claude Code familiarity; links to docs but doesn't explain mechanics from scratch
- **Tip density** — 82 tips across 15 categories can overwhelm newcomers; no clear "start here" ordering beyond the README's 3-step how-to
- **Rapid staleness risk** — Claude Code releases weekly; some tips may lag (e.g., deprecated flags, renamed commands)
- **Community curation bias** — heavily weighted toward Boris Cherny's workflow preferences; other valid approaches underrepresented
- **HTML/badge-heavy README** — the SVG badge system makes README hard to read raw; rendered on GitHub it's polished but harder to consume offline or in tools
- **No implementation code** — most entries are links and descriptions, not drop-in `.claude/` templates (unlike Superpowers or gstack which ship ready-to-use files)
- **Pakistan-centric framing** — does not affect technical content but may seem unusual for an international reference

## Practical Insights

- **The 3-tier tip pattern** — most tips are tagged 🚫👶 ("do not babysit") to signal autonomy — a useful filter for teams calibrating how much to direct vs. trust Claude
- **Context rot threshold** — concrete numbers from Thariq: dumb zone starts at ~40% context, experienced users keep below 30%, push to 60% only on simple tasks; context rot on 1M-context model kicks in at ~300–400k tokens
- **Rewind > correct** — the repo explicitly recommends double-Esc rewinding over context-polluting correction attempts — a non-obvious workflow improvement
- **Skills are folders, not files** — a key architectural point: skills should have `references/`, `scripts/`, `examples/` subdirs for progressive disclosure, not monolithic SKILL.md files
- **Skill description as trigger** — write skill descriptions for the model ("when should I fire?"), not as human-readable summaries — changes how models decide to invoke them
- **Settings.json over CLAUDE.md for harness behavior** — deterministic behaviors (attribution, permissions, model selection) belong in `settings.json`, not CLAUDE.md where they may be ignored
- **The Billion-Dollar Questions section** — open research questions about CLAUDE.md optimization, agent vs command vs skill decision boundaries, spec-driven regeneration — useful for planning team conventions
- **Development workflow comparison** — Everything Claude Code (160k⭐) leads in raw scale; Superpowers (159k⭐) leads in TDD discipline; gstack (76k⭐) leads in role personas; GSD (55k⭐) focuses on fresh 200k contexts with wave execution
