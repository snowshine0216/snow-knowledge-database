---
tags: [claude, anthropic, advisor-strategy, monitor-tool, managed-agents, claude-code, claude-api, cost-optimization, agent-infrastructure, opus, sonnet, haiku]
source: https://www.youtube.com/watch?v=Q-QznaH1WS0
---

# New Claude Features For Developers — Advisor, Monitor, Managed Agents

## Video Info
- URL: https://www.youtube.com/watch?v=Q-QznaH1WS0
- Platform: YouTube
- Title: New Claude Features For Developers
- Speaker: Prompt Engineering channel (`@engineerprompt`)
- Channel/Event: Prompt Engineering
- Upload date: 2026-04-10
- Duration: 10:26
- Views / Likes / Comments: 11,945 / 254 / 14
- Category and tags: Science & Technology; prompt engineering, LLMs, AI, GPT-4, fine-tuning LLMs
- Transcript source: ASR (`faster-whisper:large-v3`) — no manual or original-language auto-captions available
- Referenced reading: `claude.com/blog/claude-managed-agents`, `claude.com/blog/the-advisor-strategy`, `x.com/noahzweben/status/2042332268450963774`

## Executive Summary

Anthropic shipped three developer-facing features that target three different money leaks between "prompt demo" and "production agent": **Advisor Strategy** (per-token cost), **Monitor Tool** (wasted tokens inside Claude Code's agent loop), and **Managed Agents** (harness infrastructure cost). Advisor Strategy inverts the sub-agent pattern — a small, cheap executor (Sonnet or Haiku) does the bulk of the work and escalates to Opus only when stuck, with Opus acting as a shared-context reviewer that gives feedback without writing code. Monitor Tool replaces Claude Code's status-polling inside background subprocesses with an interrupt-driven callback, saving tokens and unlocking parallel long-running work. Managed Agents hosts the production harness — sandboxing, auth, tool execution, long sessions, multi-agent coordination — so non-developers and enterprises can define outcomes and let Claude self-evaluate without owning the infrastructure. Reported wins: ~2% higher multilingual SWE-bench vs. Sonnet alone at ~11% lower cost for Advisor, and $0.08 per session on top of standard tokens for Managed Agents.

## Outline

1. Intro — three features, three cost leaks
2. Advisor Strategy — the cost motivation
3. Advisor vs. sub-agent orchestration
4. Benchmark numbers and the chart-crime warning
5. Advisor Messages-API surface
6. Monitor Tool — the polling waste before
7. Monitor Tool — interrupt-driven monitoring after
8. Monitor Tool — opt-in activation and value
9. Managed Agents — why the harness is the hard part
10. Managed Agents — what Anthropic is hosting
11. Managed Agents — target user, pricing, Karpathy-style auto-loop
12. Closing — Metos model teaser and sign-off

## Detailed Chapter Summaries

### 1. Intro — Three Features, Three Cost Leaks
> **Segment**: 0:00–0:30

The presenter opens with the pacing observation that Anthropic is releasing "at an extremely fast pace," but frames these three as focused and purposeful. Advisor Strategy, Monitor Tool, and Managed Agents are introduced together because they compose into the developer stack: what each one is, why you should use it, and how they combine.

### 2. Advisor Strategy — Cost Motivation
> **Segment**: 0:30–1:30

The framing: cost is the critical factor when building with Claude, and you don't need Opus-level intelligence for every task. Analogy — Opus is the senior / staff engineer, Sonnet or Haiku is the junior engineer actually implementing the feature. Pair a cheap executor with a smart advisor and you keep Opus-quality judgement at junior-salary cost.

### 3. Advisor vs. Sub-Agent Orchestration
> **Segment**: 1:30–2:30

Important distinction from the sub-agent pattern, because it sounds similar on first read:

| Pattern | Driver | Delegation direction | Big model's role |
|---|---|---|---|
| Sub-agents | Opus (orchestrator) | Orchestrator → smaller workers | Decomposes the task and dispatches |
| Advisor Strategy | Sonnet / Haiku (executor) | Executor → advisor when stuck | Reviews executor's trajectory and gives feedback |

Key property: the advisor has **shared context** with the executor — it can read what the executor has done so far and give informed feedback. It does not write code; it acts like a senior engineer unblocking a junior. The executor makes all the tool calls and produces the actual code.

### 4. Benchmark Numbers and the Chart-Crime Warning
> **Segment**: 2:30–3:00

Reported benchmark on multilingual SWE-bench:

- **Sonnet + Opus-as-advisor**: ~2% higher score than Sonnet alone.
- **Cost**: ~11% lower than Sonnet alone (because advisor invocations consume only a few Opus tokens compared to a full Opus executor trajectory).
- **Haiku + Opus-as-advisor**: same shape, lower quality baseline — gains still visible but smaller.

> The chart in Anthropic's blog starts the y-axis at 72% and tops at 75%, which visually inflates the 2% delta. Real the chart as "win is real but small"; the bigger levers are cost (~11% down) and latency (Opus is slower than Sonnet/Haiku, so dropping Opus from the main loop speeds things up).

### 5. Advisor Messages-API Surface
> **Segment**: 3:00–3:30

Availability and wiring:

- Exposed as a first-class primitive in the **Anthropic Messages API**.
- Configuration shape: define the main model (executor), attach an `advisor` tool pointing at Opus (e.g. `opus-4.6`), and set `max_uses` capping how many times the executor may consult the advisor.
- In **Claude Code** you can already approximate this today via plan mode + switching the executor, but only the API surfaces it as an explicit, bounded tool call.
- Cost overhead is small: the executor consumes the bulk of tokens; the advisor's Opus tokens are a minor addition on top of running the executor alone.

### 6. Monitor Tool — The Polling Waste Before
> **Segment**: 3:30–4:30

Pre-existing failure mode in Claude Code:

- When Claude Code is assigned a task, it spawns subprocesses (dev server, build, long test run).
- These subprocesses ran without Claude having process-level insight.
- Claude had to repeatedly poll status ("is it done? is it done?") — consuming tokens on every check and blocking the main agent loop from doing other work.

### 7. Monitor Tool — Interrupt-Driven Monitoring After
> **Segment**: 4:30–5:30

What the monitor tool changes:

- Claude creates **background scripts** that run alongside the agent.
- The monitor watches each background process — progress, errors, final results.
- When a process completes, the monitor sends an **interrupt** back to Claude Code telling it the process is done and handing over the output.
- Net effect: Claude stops wasting cycles on status polling, can run more background processes in parallel, and only wakes up when something actually happens.

Presenter's framing: it is exactly these "very small features" — not the headline models — that make Claude Code feel materially better than competing coding assistants.

### 8. Monitor Tool — Opt-in Activation
> **Segment**: 5:30–6:30

Important usability caveat:

- The monitor tool is **not invoked by default**.
- You must explicitly prompt Claude Code to use it.
- Example prompt from the video: *"start my dev server and use the monitor tool to observe it for errors."*
- Recommendation: add the monitor-tool mention to any prompt template that launches dev servers, builds, or long-running tests.

### 9. Managed Agents — Why the Harness Is the Hard Part
> **Segment**: 6:30–7:30

Observation about shipping agents to production:

> Building the core logic of the agent is usually the easiest part. The harness around the agent — infrastructure, permissions, logging, authentication — is what actually becomes the issue.

That harness is why prototype-to-production for agents has historically been expensive. Managed Agents is Anthropic's response: take over the grunt engineering so teams can focus on agent behaviour and outcomes.

### 10. Managed Agents — What Anthropic Is Hosting
> **Segment**: 7:30–8:30

Components that ship with Managed Agents:

- **Production-grade agents** with secure sandboxing, authentication, and tool execution handled server-side.
- **Long-running sessions** that can operate autonomously for hours; progress and outputs persist through client disconnection.
- **Multi-agent coordination** — an agent can spin up and direct other agents to parallelize complex work.
- **Trusted governance** as the connective layer wrapping the above.

You define the core functionality: what the agent should do, what harness shape it runs in, which tools it can call, whether it needs a sandbox. Anthropic runs it on their infrastructure.

### 11. Managed Agents — Target User and Pricing
> **Segment**: 8:30–9:30

Target profile and workflow:

- **Primary audience**: enterprises and **non-developers** who want agents in production without owning harness infrastructure.
- **User-level workflow**: define outcomes and success criteria; Claude self-evaluates and iterates until the criteria are met. Presenter compares this to Karpathy's "auto-research" framing, where the model chooses its own hyperparameters against the objective.
- **Strategic fit**: aligns with Anthropic's enterprise focus — making shipping agents approachable without a platform team.
- **Pricing**:
  - Standard token prices apply per model used.
  - **$0.08 per session** for active runtime on top.
  - Presenter's read: the session fee is negligible next to token cost.
- Detailed notebooks are published by the Anthropic team; presenter offers to make a dedicated deep-dive video if requested.

### 12. Closing — Metos Model Teaser and Sign-off
> **Segment**: 9:30–10:26

Brief pointer to Anthropic's recently-released **Metos** model in preview — a separate topic the presenter calls "very interesting" but notes needs to reach general availability before a proper assessment. Invites viewers to request a follow-up video on Metos, closes with sign-off.

## Key Takeaways

1. **Three leaks, three plugs.** Advisor reduces per-token spend, Monitor reduces wasted tokens inside the Claude Code loop, Managed Agents reduces the infrastructure-to-ship spend — a coherent cost story across the developer stack.
2. **Advisor Strategy is the pragmatic middle ground.** Between "one big model" and full orchestrator/sub-agent decomposition, it pushes the bulk to the cheapest capable model and pays for Opus only on hard sub-steps.
3. **Read the chart carefully.** The 2% benchmark delta is real but small because the y-axis starts at 72%; the cost (~11% down) and latency wins are the bigger lever.
4. **Monitor Tool is a pure efficiency primitive.** Opt into it in prompts that spawn background processes — you gain parallelism and drop polling overhead for free.
5. **Managed Agents is a buy-vs-build decision for the harness.** Worth it when you need sandboxed, long-running, multi-agent execution in production and don't want to own sandboxing / auth / logging / state.
6. **Non-developers are now in scope.** Outcome-driven, self-evaluating agents mean the audience is no longer only platform teams — enterprises and business users can ship production agents with this surface.
7. **Three features, one thesis.** Small, focused primitives compound; Claude Code's advantage is the accumulation of these low-level efficiency wins, not a single headline capability.

## Practical Pattern

Adoption checklist for a team already building on Claude:

```
1. Advisor Strategy
   - Audit pipelines where Opus is the executor.
   - Swap to Sonnet (or Haiku) as executor + Opus as advisor.
   - Set max_uses conservatively; measure cost and quality deltas.

2. Monitor Tool
   - Update Claude Code prompt templates that spawn background work
     (dev server, builds, long test runs) to explicitly name the monitor tool.
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
- Channel: Prompt Engineering — https://www.youtube.com/@engineerprompt
- Video source: https://www.youtube.com/watch?v=Q-QznaH1WS0

## Related Concepts

- [[claude-code-internals]]
- [[45-claude-code-tips]]
- [[claude-code-tips-collection]]
- [[harness-engineering]]
- [[long-running-agent-harness]]
- [[master-claude-session-1]]
- [[claude-certified-architect]]
- [[anthropic-dispatch]]
