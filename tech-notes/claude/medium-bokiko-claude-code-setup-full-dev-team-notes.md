# The Claude Code Setup Nobody Talks About: From Solo Agent to Full Dev Team

## Article Info
- **URL**: https://medium.com/@bokiko/the-claude-code-setup-nobody-talks-about-from-solo-agent-to-full-dev-team-673a1d7dfc01
- **Title**: The Claude Code Setup Nobody Talks About: From Solo Agent to Full Dev Team
- **Author**: Bokiko (@bokiko)
- **Published**: 2026-03-10
- **Reading time**: ~15 min (~3,651 words)
- **Access mode**: cookie-authenticated (public article)

---

## Key Takeaways

- **Four extension layers stack together**: Skills (markdown playbooks), Plugins (bundled packages), Subagents (isolated Claude instances), Agent Teams (coordinating multi-instance crews) — each serves a distinct purpose and they compose.
- **Decision tree**: "Claude should always do X" → Skill | "I want this tool/integration" → Plugin | "Do task without polluting context" → Subagent | "Work in parallel and coordinate" → Agent Team.
- **Skills live at four scopes**: enterprise (`managed settings`), personal (`~/.claude/skills/`), project (`.claude/skills/`), plugin-bundled. Higher scope wins on name collision; plugin skills are namespaced to avoid conflicts.
- **Two skill types**: *Reference skills* (auto-loaded, add persistent knowledge like API conventions) vs. *Task skills* (invoked on demand with `/name`, use `disable-model-invocation: true` to prevent auto-trigger).
- **Dynamic context injection** (`!`backtick`command`backtick` syntax`): shell commands execute before Claude sees the skill — output is pre-injected, not run by the model.
- **Bundled skills worth knowing**: `/simplify` (spawns 3 parallel review agents), `/batch` (orchestrates parallel codebase-wide changes in isolated worktrees), `/loop [interval]` (repeated polling), `/claude-api` (loads SDK reference).
- **Plugins** are directories with `plugin.json` manifests bundling skills + agents + hooks + MCP servers + LSP configs. Official Anthropic marketplace available via `/plugin`; community marketplaces addable from GitHub/GitLab.
- **LSP plugins** give Claude automatic diagnostics after every file edit (type errors, missing imports) — 11 languages available from the official marketplace.
- **Subagent benefits**: context preservation (main window stays clean), tool restrictions (read-only reviewer literally can't edit), model routing (Haiku for cheap, Opus for complex), persistent memory (3 scopes: user/project/local), worktree isolation.
- **Agent teams** (experimental, opt-in via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`): teammates have lateral messaging + shared task board — unlike subagents which only report back to parent.

---

## Insights

- **Context window as precious real estate**: the article frames the main conversation as something to protect. Subagents are the mechanism — "every time you read more than 3 files to understand something, you should be using a subagent."
- **Skills as institutional memory**: the real value isn't automation, it's encoding team conventions so they never need to be re-explained. A `conventions` skill auto-loaded per-project eliminates the constant "remind Claude how we do things" friction.
- **Adversarial agent teams for debugging**: spawning 4 teammates instructed to *disprove each other's* hypotheses fights anchoring bias — surviving hypothesis is more reliable than a single agent stopping at first plausible explanation.
- **Cost calculus for agent teams**: token usage scales linearly with team size. Recommended starting point is 3–5 teammates; coordination overhead outweighs benefit beyond that. Subagents are more cost-effective for routine work.
- **Agent Skills open standard**: Claude Code skills follow a spec adopted by 26+ tools (Cursor, VS Code, Gemini CLI, GitHub Copilot, OpenAI Codex, etc.) — write once, use across compatible agents.
- **Team plugin distribution**: `.claude/settings.json` can specify team marketplaces so new devs get prompted to install shared plugins on project trust — zero manual onboarding.

---

## Caveats

- Article targets **Claude Code v2.1.x (March 2026)** — features like agent teams, LSP plugins, and the plugin marketplace may differ in earlier versions.
- **Agent teams are experimental** with known limitations: `/resume` doesn't restore in-process teammates, task status can lag, shutdown is slow, no nested teams, split panes require tmux/iTerm2.
- Plugin/marketplace details (specific plugin names like `github@claude-plugins-official`, `typescript-lsp@claude-plugins-official`) should be verified against live docs — availability may change.
- The article is opinionated ("If you don't have at least 5 custom skills, you're doing manual labor") — mileage varies by use case.

---

## Sources

- Original: https://medium.com/@bokiko/the-claude-code-setup-nobody-talks-about-from-solo-agent-to-full-dev-team-673a1d7dfc01
- Referenced (linked inside article, URLs not extracted): Official Skills Docs, Subagents Guide, Creating Plugins, Plugin Marketplace, Agent Teams (Experimental), Agent Skills Open Standard, Example Skills — all at `code.claude.com/docs`
