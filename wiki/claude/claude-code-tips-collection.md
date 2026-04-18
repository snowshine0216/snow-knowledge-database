---
tags: [claude-code, tips, developer-workflow, worktrees, batch-processing]
source: https://alirezarezvani.medium.com/boris-chernys-claude-code-tips-are-now-a-skill-here-is-what-the-complete-collection-reveals-b410a942636b
---

# Claude Code Tips Collection

A synthesis of Boris Cherny's 42 tips across 5 threads (January-February 2026), compiled as an installable skill. The tips form a progressive stack -- later features depend on judgment built from earlier ones.

## The Tip Stack (Recommended Learning Order)

### Phase 1: Foundations (January)

- **Parallel sessions** -- run 5-10 Claude instances simultaneously for independent tasks
- **Plan mode** -- `Shift+Tab` to enter, refine the plan, then auto-accept execution
- **CLAUDE.md self-correction** -- when Claude makes a mistake, instruct it to update its own `CLAUDE.md` so the error does not recur

### Phase 2: Customization (February, Week 1)

- **Output styles** change Claude's cognitive mode:
  - `Explanatory` -- explains reasoning alongside code edits (ships reasoning with the diff)
  - `Learning` -- coaches the user instead of doing the work directly
- **Custom agents** via `.claude/agents/*.md` with constrained toolsets (e.g., `backend-reviewer`, `migration-guard`)
- **`/sandbox`** -- BashTool file/network isolation for safe experimentation
- **Default agent** configurable via `settings.json` `agent` key or `--agent` flag

### Phase 3: Worktree Isolation (February, Week 2)

```bash
claude --worktree my_feature        # isolated git worktree
claude --worktree my_feature --tmux # with tmux session
```

Enables mass parallel agents: launch 10 instances, each with its own worktree, each testing changes end-to-end, each opening a PR.

### Phase 4: Parallel Review and Batch Execution (February, Week 3)

| Command | Behavior |
|---|---|
| `/simplify` | 3 parallel agents review changed code for reuse, quality, and efficiency in one pass |
| `/batch` | Interactive planning + parallel execution across dozens of agents, each in isolated worktree, each opening a PR |

**`/batch` example**: a 14-file logging migration ran in 11 minutes; 5 of 6 PRs merged without changes.

## Dependency Chain

The tips are not a menu -- they form a dependency chain:

```
CLAUDE.md consistency
  -> Plan mode producing consistent output
    -> Shared CLAUDE.md across worktrees
      -> Worktree isolation (--worktree)
        -> /batch parallel execution
```

## Key Insights

- **Output styles are underrated**: `Explanatory` mode shifts PR review from reconstruction to decision-validation, reducing junior-engineer review overhead
- **Custom agents are a team-level pattern**: shared `.claude/agents/` configs checked into the repo benefit the whole team, not just individuals
- **`/simplify` as pre-review baseline**: catches structural issues (duplicate logic, unscalable queries) but not domain-specific concerns (API contracts, read-replica routing)
- **Cost routing**: Opus for architecture/debugging, Sonnet for monitoring/simple tasks

## Installable Skill

The compiled `boris` skill is available at `howborisusesclaudecode.com` and installs to `~/.claude/skills/boris/SKILL.md`. This is a third-party compilation, not official Anthropic documentation.

## Reported Results

Code review cycles dropped from 2-3 days to under 4 hours after implementing the January-phase tips (reported by a 7-person healthtech startup CTO).

## See Also

- [[Claude Code Multi-Agent Setup]] -- full extension layer architecture
- [[Claude Code Agentic OS]] -- system-level skill orchestration
- [[Claude Code Language Benchmark]] -- language selection for AI-assisted coding
