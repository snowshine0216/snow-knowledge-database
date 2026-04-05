---
tags: [claude, certification, cca, anthropic, agentic-architecture, mcp, prompt-engineering, exam-prep]
source: https://pub.towardsai.net/claude-certified-architect-the-complete-guide-to-passing-the-cca-foundations-exam-9665ce7342a8
---

# Claude Certified Architect (CCA)

The Claude Certified Architect (CCA) Foundations exam is Anthropic's first professional certification. It is a 301-level, proctored exam testing production-level Claude system design across five competency domains.

## Exam Format

| Attribute | Detail |
|---|---|
| Questions | 60 scenario-based |
| Time | 120 minutes (~2 min/question) |
| Passing score | 720/1000 |
| Proctored | Yes, cannot pause once started |
| Scenarios | 4 of 6 drawn randomly per exam |
| External aids | None |

Questions are paragraph-length (150-200 words) with plausible distractors. Speed comes from recognizing anti-pattern traps instantly.

## The Five Domains

### Domain 1: Agentic Architecture and Orchestration (27%)

The heaviest domain. Core concepts:

- **Coordinator-subagent pattern** -- coordinator delegates to specialized subagents and synthesizes results
- **Subagent context isolation** -- subagents do NOT inherit context automatically; everything must be explicitly passed (most tested concept)
- **The 4-5 tool rule** -- Anthropic guidance: 4-5 focused tools per agent; at 18+ tools, selection reliability degrades
- **Anti-pattern**: the "super agent" with 15+ tools instead of specialized agents

### Domain 2: Claude Code Configuration and Workflows (20%)

- **CLAUDE.md hierarchy** -- project-level (`.claude/CLAUDE.md`, shared via VCS) vs. user-level (`~/.claude/CLAUDE.md`, personal)
- **Plan mode vs. direct execution** -- plan mode for complex multi-step tasks; direct for well-defined lower-risk tasks
- **CI/CD flags** -- `-p` (headless/non-interactive, mandatory for CI/CD), `--bare` (skip auto-discovery), `--output-format json`
- **Anti-pattern**: running [[Claude Code Tips Collection|Claude Code]] interactively in CI/CD without `-p`

### Domain 3: Prompt Engineering and Structured Output (20%)

Reliability hierarchy (most to least reliable):

1. `tool_choice` with input schemas
2. Structured outputs API (`client.messages.parse()` with Pydantic models)
3. Validation-retry loops
4. Few-shot prompting

**Anti-pattern**: using prompt instructions alone for JSON compliance.

### Domain 4: Tool Design and MCP Integration (18%)

Most candidates lose unexpected points here.

| MCP Primitive | Purpose | When to Use |
|---|---|---|
| **Tools** | Executable functions | Actions: querying DBs, calling APIs |
| **Resources** | Data for ingestion | Read-only context: docs, schemas |
| **Prompts** | Predefined templates | Reusable instruction patterns |

The tool-vs-resource boundary is the hardest judgment call: actions go to Tools, read-only context goes to Resources.

### Domain 5: Context Management and Reliability (15%)

- **"Lost in the middle" effect** -- content buried in the middle of the context window receives less attention; place critical info at beginning or end
- **Token economics** -- Prompt Caching (up to 90% savings, real-time) for repeated context; Batch API (50% savings, up to 24h) for offline workloads; Real-Time API for user-facing flows

## Five Critical Mental Models

1. **Programmatic enforcement > prompt-based guidance** -- prompts are guidance; code is law
2. **Subagents do not inherit context** -- blank slate on spawn
3. **Tool descriptions drive routing** -- Claude reads descriptions, not agent/tool names
4. **"Lost in the middle" is real** -- anchor critical info at beginning or end
5. **Match API to latency requirements** -- Batch for background, Caching for repeated context, Real-Time for user-facing

## Study Plan (4 Weeks, 30-37 Hours)

| Week | Focus | Key Activity |
|---|---|---|
| 1 | Foundations | Claude 101, AI Fluency -- internalize vocabulary |
| 2 | Core Skills | Building with Claude API (8-10 hrs) -- validation-retry, tool_choice, simple agent |
| 3 | Advanced Topics | MCP server, CLAUDE.md config, headless runs, custom slash commands |
| 4 | Practice | Official practice exam -- score 900+ before scheduling real exam |

## Anti-Pattern Quick Reference

| Domain | Trap | Correct Approach |
|---|---|---|
| Agentic | Super agent with 15+ tools | 4-5 tools/agent + specialized subagents |
| Agentic | Self-reported confidence for routing | Deterministic business rules |
| Claude Code | No `-p` flag in CI/CD | Always use `-p` + `--bare` |
| Prompt Eng | Prompt-only JSON enforcement | `tool_choice` / structured outputs API |
| MCP | Read-only data as a Tool | Use Resources for read-only context |
| Context | Batch API for live support | Real-Time API for user-facing workflows |

## See Also

- [[Claude Code Tips Collection]] -- practical Claude Code usage patterns
- [[Harness Engineering]] -- related engineering practices
- [[LLM Knowledge Base]] -- broader LLM architecture concepts
