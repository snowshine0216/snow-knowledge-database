---
tags: [claude, claude-code, anthropic, tips, medium, developer-workflow]
source: https://alirezarezvani.medium.com/boris-chernys-claude-code-tips-are-now-a-skill-here-is-what-the-complete-collection-reveals-b410a942636b
---

## Article Info
- **URL:** https://alirezarezvani.medium.com/boris-chernys-claude-code-tips-are-now-a-skill-here-is-what-the-complete-collection-reveals-b410a942636b
- **Title:** Boris Cherny's Claude Code Tips Are Now a Skill. Here Is What the Complete Collection Reveals.
- **Author:** Reza Rezvani (CTO, healthtech startup)
- **Published:** 2026-03-22
- **Access mode:** cookie-authenticated

---

## Key Takeaways
- Boris Cherny published **42 tips across 5 threads** (January–February 2026). A compiled `boris` skill is installable at `~/.claude/skills/boris/SKILL.md` via `howborisusesclaudecode.com`
- **Parts 1–2 (January)** were widely covered: parallel sessions (5–10 Claude instances), Plan mode (Shift+Tab → refine → auto-accept), CLAUDE.md self-correction ("update your CLAUDE.md so you don't make that mistake again")
- **Part 3 (Feb 11)** — customization layer: output styles change Claude's *cognitive mode* (`Explanatory` = explains reasoning while editing; `Learning` = coaches instead of does); custom agents via `.claude/agents/*.md` with constrained toolsets; `/sandbox` for BashTool file/network isolation; default agent set via `settings.json` `agent` key or `--agent` flag
- **Part 4 (Feb 20)** — native `--worktree` flag: `claude --worktree my_feature` gives each Claude instance its own isolated git worktree + optional `--tmux` session; enables mass parallel agents: *"launch 10 parallel agents with worktree isolation, each tests its changes end to end, then puts up a PR"*
- **Part 5 (Feb 27)** — `/simplify`: parallel agents review changed code for reuse/quality/efficiency in one pass, appended to normal prompts. `/batch`: interactive planning + parallel execution across dozens of agents, each in isolated worktree, each opening a PR — 14-file logging migration ran in 11 min, 5/6 PRs merged without changes
- Author's result: code review cycles dropped from 2–3 days to under 4 hours after implementing January tips
- **The tips form a stack, not a menu**: `/batch` requires worktrees; worktrees require shared CLAUDE.md; CLAUDE.md requires plan mode producing consistent output

## Insights
- **Output styles are underrated**: `Explanatory` mode ships reasoning with the code diff, shifting PR review from reconstruction to decision-validation — meaningfully reduces junior-engineer review overhead
- **Custom agents with constrained permissions** (`backend-reviewer`, `migration-guard`) are a team-level pattern, not individual — worth investing in shared `.claude/agents/` configs checked into the repo
- **`/simplify` as pre-review baseline**: catches structural issues (duplicate logic, unscalable queries) before human review; does *not* catch domain-specific concerns (API contracts, read-replica routing)
- **Recommended learning order**: implement in the order Boris released (Jan → Feb) because Feb features require judgment built from Jan experience — skipping ahead causes cognitive overhead that negates the gains
- **Cost routing**: Boris uses Opus 4.5 for everything; production teams on budget should route monitoring/simple tasks to Sonnet and reserve Opus for architecture/debugging

## Caveats
- Author is CTO of a 7-person healthtech startup — production context is real but small-team; large-org applicability may differ
- `/batch` tested only on a 14-file migration, not a large codebase migration — 5/6 success rate on small scope may not extrapolate
- Worktree migration from multiple git checkouts has friction; budget deliberate team alignment time before first parallel agent job
- Spinner verbs and keybindings in Part 3 are cosmetic — worth 5 min, no more
- The boris skill itself (`howborisusesclaudecode.com`) is a third-party compilation by @CarolinaCherry, not official Anthropic documentation

## Sources
- Original: https://alirezarezvani.medium.com/boris-chernys-claude-code-tips-are-now-a-skill-here-is-what-the-complete-collection-reveals-b410a942636b
- Boris Cherny skill installer: https://howborisusesclaudecode.com/api/install
- Related article (same author): "Your CLAUDE.md Is Probably Wrong: 7 Mistakes Boris Cherny Never Makes" — https://alirezarezvani.medium.com
