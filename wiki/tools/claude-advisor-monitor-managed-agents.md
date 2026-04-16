---
tags: [claude, anthropic, advisor-strategy, monitor-tool, managed-agents, claude-code, claude-api, cost-optimization, agent-infrastructure]
source: https://www.youtube.com/watch?v=Q-QznaH1WS0
---

# New Claude Features for Developers — Advisor, Monitor, Managed Agents

## Video Info
- URL: https://www.youtube.com/watch?v=Q-QznaH1WS0
- Platform: YouTube
- Title: New Claude Features For Developers
- Speaker: Prompt Engineering channel (`@engineerprompt`)
- Upload date: 2026-04-10
- Duration: 10:26
- Views / Likes: 11,945 / 254
- Transcript source: ASR (`faster-whisper:large-v3`)
- Referenced reading: `claude.com/blog/claude-managed-agents`, `claude.com/blog/the-advisor-strategy`

## Executive Summary

Three Anthropic features, three different cost leaks between prompt demo and production. **Advisor Strategy** inverts the sub-agent pattern — a small executor (Sonnet/Haiku) drives, Opus is the shared-context reviewer. **Monitor Tool** replaces [[claude-code-internals]]' status-polling with interrupt-driven background monitoring. **Managed Agents** hosts the full [[harness-engineering]] stack (sandboxing, auth, long sessions, multi-agent coordination) so non-developers and enterprises can define outcomes and let Claude self-evaluate. Reported wins: ~2% higher multilingual SWE-bench at ~11% lower cost for Advisor; $0.08/session on top of tokens for Managed Agents.

## Outline

1. Intro — three features, three cost leaks
2. Advisor Strategy — cost motivation
3. Advisor vs. sub-agent orchestration
4. Benchmark numbers and the chart crime
5. Advisor Messages-API surface
6. Monitor Tool — the polling waste before
7. Monitor Tool — interrupt-driven after
8. Monitor Tool — opt-in activation
9. Managed Agents — why the harness is the hard part
10. Managed Agents — what Anthropic hosts
11. Managed Agents — target user and pricing
12. Closing — Metos model teaser

## Detailed Chapter Summaries

### 1. Intro — Three Features, Three Cost Leaks
> **Segment**: 0:00–0:30

Anthropic is shipping fast but focused — Advisor Strategy, Monitor Tool and Managed Agents are introduced together because they plug three different leaks in the developer stack.

### 2. Advisor Strategy — Cost Motivation
> **Segment**: 0:30–1:30

You don't need Opus intelligence on every task. Analogy: Opus is the senior / staff engineer, Sonnet or Haiku is the junior. Pair a cheap executor with a smart advisor to keep Opus-quality judgement at junior-salary cost. Sits philosophically next to [[caveman-token-saver]]'s output-compression approach — both are token-economy plays.

### 3. Advisor vs. Sub-Agent Orchestration
> **Segment**: 1:30–2:30

| Pattern | Driver | Delegation direction | Big-model role |
|---|---|---|---|
| Sub-agents | Opus (orchestrator) | Orchestrator → smaller workers | Decomposes and dispatches |
| Advisor Strategy | Sonnet / Haiku (executor) | Executor → advisor when stuck | Reviews executor trajectory, gives feedback |

The advisor has **shared context** — it reads what the executor has done so far. It does not write code; it unblocks the junior. The executor keeps all tool calls.

### 4. Benchmark Numbers and the Chart Crime
> **Segment**: 2:30–3:00

Reported on multilingual SWE-bench:

- Sonnet + Opus advisor: **~2% higher** than Sonnet alone
- **~11% cheaper** than Sonnet alone
- Haiku + Opus advisor: same shape, lower absolute baseline

> Anthropic's blog chart starts the y-axis at 72%, topping at 75%. That visually inflates the 2% delta. Read it as "real but small" — the cost (~11% down) and latency wins (Opus drops out of the main loop) are the bigger lever.

### 5. Advisor Messages-API Surface
> **Segment**: 3:00–3:30

- Exposed as a first-class primitive in the Anthropic **Messages API**.
- Config shape: main executor model + `advisor` tool pointing at Opus (e.g. `opus-4.6`) + `max_uses` cap.
- Claude Code can already approximate this via plan mode + executor swap (see [[claude-code-internals]]), but only the API surfaces the advisor as an explicit bounded tool.
- Overhead is small: advisor tokens are a minor add-on to the executor's full trajectory.

### 6. Monitor Tool — The Polling Waste Before
> **Segment**: 3:30–4:30

Pre-existing failure mode in Claude Code:

- Assigned tasks spawn subprocesses (dev server, build, long test run).
- Claude had no process-level visibility, so it repeatedly polled status.
- Each poll consumed tokens; the main loop was blocked from other work.

### 7. Monitor Tool — Interrupt-Driven After
> **Segment**: 4:30–5:30

- Claude spawns **background scripts**; the monitor watches progress, errors, and results.
- When a process finishes, the monitor sends an **interrupt** back with the output.
- Claude stops wasting cycles on polling, runs more background work in parallel, and wakes up only when something actually happens.
- Presenter's frame: these "very small features" compound — consistent with the thesis in [[45-claude-code-tips]] and [[claude-code-tips-collection]].

### 8. Monitor Tool — Opt-In Activation
> **Segment**: 5:30–6:30

- Not invoked by default. Prompt must explicitly name it.
- Example: *"start my dev server and use the monitor tool to observe it for errors."*
- Operational tip: bake the monitor-tool mention into prompt templates that spawn servers / builds / long tests. The [[claude-hud]] plugin surfaces tool invocation in the status bar so you can verify it actually fired.

### 9. Managed Agents — Why the Harness Is the Hard Part
> **Segment**: 6:30–7:30

> Building the core logic is usually the easiest part. The harness — infrastructure, permissions, logging, authentication — is what actually becomes the issue.

This is the exact pain [[harness-engineering]] formalises as a six-layer architecture. Managed Agents is Anthropic's managed answer for that layer.

### 10. Managed Agents — What Anthropic Is Hosting
> **Segment**: 7:30–8:30

- **Production-grade agents**: secure sandboxing, authentication, tool execution handled server-side.
- **Long-running sessions**: hours-long autonomous operation, progress + outputs persist through disconnects — overlapping the territory [[long-running-agent-harness]] documents.
- **Multi-agent coordination**: agents can spin up and direct other agents for parallel work.
- **Trusted governance** wraps all of the above.

Users define the agent's core functionality, harness shape, tool set, and sandbox needs; Anthropic runs it on their infrastructure.

### 11. Managed Agents — Target User and Pricing
> **Segment**: 8:30–9:30

- **Primary audience**: enterprises and **non-developers** (shares the "define outcomes, let Claude iterate" framing of [[master-claude-session-1]]).
- **Workflow**: define outcomes + success criteria; Claude self-evaluates and iterates until the criteria are met — Karpathy-style "auto-research".
- **Strategic fit**: aligns with Anthropic's enterprise focus.
- **Pricing**: standard token prices + **$0.08 per session** for active runtime — negligible next to token cost.
- Detailed starter notebooks are published by the Anthropic team.

### 12. Closing — Metos Model Teaser
> **Segment**: 9:30–10:26

Brief pointer to the recently-released **Metos** model in preview — described as "very interesting" but needing GA before a proper read. Sign-off invites follow-up requests.

## Key Takeaways

1. **Three leaks, three plugs.** Advisor cuts per-token cost, Monitor cuts wasted tokens inside the Claude Code loop, Managed Agents cuts infrastructure-to-ship cost.
2. **Advisor Strategy is the pragmatic middle ground.** Push bulk to the cheapest capable model, pay Opus only on hard sub-steps.
3. **Read the chart skeptically.** 2% delta is real but small — the cost and latency wins are the lever.
4. **Monitor Tool is a pure efficiency primitive.** Opt into it in prompts that spawn background work; polling becomes interrupts.
5. **Managed Agents is a buy-vs-build decision for the harness.** Justified when you need sandboxed, long-running, multi-agent execution in production.
6. **Non-developers are now in scope** — outcome-driven, self-evaluating agents widen the audience past platform teams.

## Practical Pattern

```
1. Advisor Strategy
   - Audit pipelines where Opus is the executor.
   - Swap to Sonnet (or Haiku) as executor + Opus as advisor.
   - Set max_uses conservatively; measure cost/quality deltas.

2. Monitor Tool
   - Update Claude Code prompt templates that spawn background work.
   - Expect: fewer status-check tokens, more parallel background tasks.

3. Managed Agents
   - Prototype core agent logic locally first.
   - Port to Managed Agents when production needs hit:
       * long-running sessions
       * multi-agent coordination
       * sandbox / auth / tool execution
   - Budget standard tokens + $0.08 per session active runtime.
```

Rule of thumb: don't pay for Opus-as-executor when Opus-as-advisor will do; don't pay for polling when interrupts will do; don't pay to build harness when the harness is available as a service.

## Resources

- Anthropic blog — Managed Agents: https://claude.com/blog/claude-managed-agents
- Anthropic blog — The Advisor Strategy: https://claude.com/blog/the-advisor-strategy
- Supporting post: https://x.com/noahzweben/status/2042332268450963774
- Channel: https://www.youtube.com/@engineerprompt
- Video: https://www.youtube.com/watch?v=Q-QznaH1WS0

## See Also

- [[claude-code-internals]] — Claude Code's agent runtime where advisor-like patterns are already approximable
- [[45-claude-code-tips]] — 45 operational tips aligned with the "small features compound" thesis
- [[claude-code-tips-collection]] — Boris Cherny's tips on plan mode, worktrees, batch workflows
- [[harness-engineering]] — the six-layer harness Managed Agents now hosts for you
- [[long-running-agent-harness]] — Anthropic's blueprint for multi-hour agent tasks that Managed Agents productises
- [[master-claude-session-1]] — non-developer intro that shares Managed Agents' outcome-driven framing
- [[claude-certified-architect]] — CCA Foundations covering MCP / tools / sandboxing primitives
- [[claude-hud]] — status-bar plugin useful for verifying the monitor tool actually fires
- [[caveman-token-saver]] — complementary token-economy angle on the same cost problem
- [[anthropic-dispatch]] — phone-to-desktop remote control layer, complementary production surface
