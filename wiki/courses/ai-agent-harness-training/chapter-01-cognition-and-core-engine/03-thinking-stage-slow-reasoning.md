---
tags: [ai-agent, harness-engineering, go, thinking, slow-reasoning, react-loop, two-stage-react, function-calling, cot]
source: https://time.geekbang.org/column/article/967578
---

# Two-Stage ReAct: Separating the Thinking Phase in a Go Agent Harness

When frontier LLMs are connected to a basic ReAct loop with tools like `bash` and `edit`, they exhibit a well-documented failure mode: they fire tool calls immediately without any prior planning. This chapter diagnoses that failure as an architectural inevitability — the presence of tool schemas in the API request context creates a token-prediction attractor stronger than any prompt instruction — and introduces the Harness Engineering solution: **Two-Stage ReAct**, which physically isolates a Thinking phase by stripping tools from the first LLM call each turn.

## Key Concepts

- **System 1 / System 2 (Kahneman)**: LLMs are architecturally "System 1" — they predict the next token auto-regressively without the ability to pre-plan before generating. Tool schemas in context reinforce this by making tool-call JSON the high-probability continuation.
- **Impulsive model behavior**: When `availableTools` is non-nil in a request, LLMs tend to generate tool-call JSON immediately, bypassing deliberate planning. Prompt-level CoT instructions ("think step by step") cannot reliably counteract this structural attractor.
- **Two-Stage ReAct**: A Harness Engineering pattern that splits each ReAct turn into two sequential LLM calls: Phase 1 (Thinking, `tools=nil`) and Phase 2 (Action, `tools=availableTools`).
- **Phase 1 — Thinking**: `e.provider.Generate(ctx, contextHistory, nil)`. The `nil` tools argument means no `functions`/`tools` field appears in the API request body. The model is forced to output pure-text reasoning/planning as its only option.
- **Phase 2 — Action**: `e.provider.Generate(ctx, contextHistory, availableTools)`. The Phase 1 thinking trace has been appended to `contextHistory` before this call. The model's autoregressive nature causes it to follow its own prior planning text and produce accurate, on-plan tool invocations.
- **Autoregression leverage**: Because the model's Phase 1 self-narrative is in `contextHistory` when Phase 2 executes, the model's continuation of that text naturally produces the tool call it planned — without hallucination or drift.
- **`AgentEngine.EnableThinking bool`**: A static field set at construction time (`NewAgentEngine(..., enableThinking bool)`). When `true`, every turn goes through Phase 1 before Phase 2. This is a global switch, not a per-turn decision.
- **Harness Engineering principle — mechanism over prompt**: *机制决定行为* — architectural constraints enforced at the code layer are more reliable than natural-language instructions in the prompt.
- **Static switch limitation**: `EnableThinking=true` applies unconditionally to all turns. For complex opening tasks it adds value; for simple mid-task steps it wastes tokens and adds latency. Dynamic activation is addressed in Chapter 13 (Plan Mode).

## Key Takeaways

- The single code change enabling Two-Stage ReAct is passing `nil` as the third argument to `LLMProvider.Generate` during Phase 1 — no new types, interfaces, or message roles needed.
- The `LLMProvider` interface `Generate(ctx, msgs, tools)` was designed pure and side-effect-free; this made the two-phase refactor trivially cheap.
- Mock providers should discriminate Phase 1 vs Phase 2 via `len(tools) == 0`: return pure-text content for Phase 1, return `ToolCalls` for Phase 2.
- The Phase 1 thinking trace should be appended to `contextHistory` as a `RoleAssistant` message before Phase 2 is called.
- The 思考题 (reflection exercise) asks whether a "self-audit micro-loop" can be inserted between Phase 1 and Phase 2 to validate or critique the generated plan before acting on it.

## See Also

- [[architecture-evolution-from-framework-to-harness]]
- [[harness-engineering]]
- [[go-tiny-claw-main-loop]]
- [[react-agent-loop]]
