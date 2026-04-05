---
tags: [claude-code, observability, developer-tools, plugin, statusline]
source: https://github.com/jarrodwatts/claude-hud
---

# Claude HUD

Claude HUD is a [[Claude Code Internals|Claude Code]] plugin that provides real-time session visibility in the terminal status line, surfacing context usage, tool activity, subagent progress, todo tracking, and plan usage indicators.

## What It Is

A focused observability layer for Claude Code sessions (v1.0.80+). Instead of opening separate dashboards, engineers get immediate operational awareness directly in the terminal where work is happening. The plugin shows near-real-time context usage with high-token breakdowns, concurrent tool calls, subagent activity, and plan usage limits for Pro/Max/Team accounts.

## Key Features

- **Context usage monitoring**: real-time context window consumption with high-token breakdowns
- **Tool and subagent tracking**: live signals on concurrent tool calls and [[Claude Code Multi-Agent Setup|subagent]] activity
- **Plan usage limits**: monitors Pro/Max/Team account throttling thresholds
- **Configurable presets**: Essential, Detailed, and custom layout/color/threshold overrides
- **Enterprise-ready**: proxy support, timeout configuration, multi-profile credential handling

## When to Use

- Your team runs significant workflows in Claude Code and needs in-terminal observability
- You regularly run multi-step agentic flows and need live progress signals
- You want minimal operational overhead with plugin-based install and config
- You need to prevent context-window surprises during long sessions

## Limitations

- Scope is intentionally narrow: visibility only, not task orchestration or autonomous execution
- Usage-limit display depends on account type and may be unavailable in API/Bedrock setups
- Linux installation may require `TMPDIR` workaround
- Terminal width constraints can limit output density for highly active sessions
- Frequent upstream Claude Code changes can introduce compatibility churn

## Practical Notes

Start with the Essential preset, then enable `showTools`/`showAgents`/`showTodos` for users who need deeper telemetry. For enterprise networks, pre-document proxy and timeout environment variables. Pin plugin versions in teams with rapid iteration cadence.
