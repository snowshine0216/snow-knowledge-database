---
tags: [agent-harness, state-externalization, file-based-memory, plan-mode, checkpoint-resume, human-in-the-loop, long-term-memory, go-agent, context-management]
source: https://time.geekbang.org/column/article/978775
---

# Memory Persistence: State Externalization & File-Based Memory

In long-running agent tasks, [[ContextCompaction]] solves the short-term problem of token overflow — but it creates a deeper problem: the compressor **also destroys the model's memory of its own plans**. An agent working a multi-hour Go refactoring task will forget its global architecture decisions within dozens of turns. This lecture introduces the counterintuitive solution: abandon in-memory state machines entirely and write agent state directly to plain Markdown files.

## Key Concepts

- **Externalized State (状态外部化)**: Instead of maintaining a `type AgentState struct` in Go memory (or serializing it to Redis), the agent is prompted to write its execution state into two files in the workspace: `PLAN.md` (global architecture, constraints, design rationale) and `TODO.md` (fine-grained checklist using `- [ ] step` / `- [x] done` Markdown checkboxes). The state is inspectable by opening the file in any editor.

- **File-Based Memory**: Four structural advantages over database-backed state:
  1. **Transparency** — any human can open `TODO.md` and see exactly what the agent is doing next
  2. **Zero-cost Human-in-the-Loop** — edit `PLAN.md` directly to correct a wrong direction; the agent reads the change on the next turn automatically, no API calls needed
  3. **Natural crash recovery** — process restarts 100 times, but as long as `TODO.md` is on disk, sending "continue the task" resumes from the exact checkpoint
  4. **Memory efficiency** — long-horizon plans are not pinned in the expensive context window (where they'll be compressed anyway); a single `read_file` at turn start re-anchors the agent

- **Plan Mode (计划模式)**: An `AgentEngine` architectural switch (`PlanMode bool`). When off, the agent answers quickly with no file overhead. When on, `PromptComposer` injects a three-step mandatory workflow into the system prompt: ① `ls -la` to detect whether `PLAN.md`/`TODO.md` already exist (new task vs. checkpoint resume); ② execute one subtask then immediately `edit_file` to tick the box (batch-ticking is forbidden); ③ if confused, `read_file TODO.md` to self-rescue. This keeps simple queries fast while giving complex tasks a disciplined state management backbone.

- **Checkpoint Resume (断点续传)**: Demonstrated live in the article: agent writes `PLAN.md` and `TODO.md`, ticks several boxes, then crashes (API 400 from empty `Content` field in `assistant` message). On restart with the identical prompt, the agent runs `ls -la`, finds the files exist, reads both, and says "I see this is a checkpoint-resume task" — then continues from the first unticked `- [ ]` line. No context replay required.

- **Multi-Tiered Memory System**: Industrial agents (e.g., OpenClaw) layer four memory tiers:
  | Layer | Name | Implementation |
  |---|---|---|
  | L1 | Working Memory | `GetWorkingMemory(N)` — last N turns |
  | L2 | State Memory | `PLAN.md` + `TODO.md` — per-task |
  | L3 | Episodic Memory | `memory/2026-04-12.md` + `MEMORY.md`; auto-written before context compaction |
  | L4 | Hybrid Retrieval | `memory_search` tool; vector search + BM25; local SQLite for offline use |

- **Plan Mode vs. Thinking Phase**: Plan Mode is macro-level navigation — it prevents multi-turn strategic drift. The Thinking Phase (per-turn slow reasoning) is a micro-level scalpel — it prevents inference shortcuts within a single turn. They operate on different dimensions; removing either one produces a different failure mode.

## Key Takeaways

- Write agent state to `PLAN.md` + `TODO.md` rather than any database; the filesystem **is** the state machine
- Tick checkboxes immediately after each completed subtask — never batch-tick; the checkpoint granularity equals the tick granularity
- `PlanMode` is an explicit harness switch, not a prompt heuristic; it controls which system-prompt rules are injected
- The `assistant` `Content` field must be serialized as `""` (not omitted) when `tool_calls` are present — OpenAI-compatible endpoints like Zhipu GLM enforce this silently
- OpenClaw stores episodic memory as append-only Markdown + SQLite vector index; no external database required for hybrid semantic retrieval
- A missing `Plan Mode` produces an agent that forgets its direction; missing `Thinking Phase` produces an agent that corners itself on implementation details

## See Also

- [[filesystem-as-memory]]
- [[state-transparency]]
- [[human-in-the-loop]]
- [[context-compaction]]
- [[crash-recovery-in-agent-harness]]
- [[harness-engineering]]
