---
tags: [ai-agent, harness-engineering, go, thinking, slow-reasoning, react-loop, two-stage-react, function-calling, cot]
source: https://time.geekbang.org/column/article/967578
wiki: wiki/courses/ai-agent-harness-training/chapter-01-cognition-and-core-engine/03-thinking-stage-slow-reasoning.md
---

## Pre-test
> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*
1. 为什么在 Agent 中"让我们一步步思考"这类提示词工程对工具调用场景失效？
2. Two-Stage ReAct 与普通 ReAct 的核心区别是什么？具体在代码层面如何实现？
3. `AgentEngine` 的 `EnableThinking` 字段是静态开关还是动态开关？它有什么局限性？

---

## Chapter Metadata
- Course: AI Agent工程化训练营（从0开始构建 Agent Harness）
- Chapter: 003 — 慢思考与自省：在 ReAct 循环中剥离独立的 Thinking 阶段
- Author: Tony Bai
- Date: 2026-05-04
- Article ID: 967578

---

## Cornell Notes

### Cue Column (Questions)
- What causes "impulsive" tool-calling behavior in LLMs when tools are available?
- Why does prompt-level Chain-of-Thought ("think step by step") fail in function-calling contexts?
- What is the exact Go mechanism that physically strips tools during Phase 1?
- How does `contextHistory` flow between Phase 1 and Phase 2, and why does this leverage autoregression?
- What Go struct field controls the two-stage loop, and what is its type?
- How does the upgraded `mockProvider` distinguish Thinking requests from Action requests?
- What is the limitation of the current static `EnableThinking` switch and what future chapter addresses it?

### Notes Column

#### The "Impulsive Model" Problem
When a real frontier LLM (Claude 4.x, GPT-5.x) is wired into a basic ReAct loop with tools like `edit` and `bash`, it exhibits a well-documented failure mode: **it calls tools immediately without first planning**. Given "analyze and refactor the entire order module", it may fire an `edit` call on the very first file it sees without reading anything else first.

Root cause: LLMs are architecturally "System 1" thinkers — they predict the next token auto-regressively. A standard API call gives no mechanism to "pre-plan 20 steps before generating the first token." When a Tool Schema JSON appears in the context, the model's next-token probability distribution collapses toward generating a tool-call JSON.

Industry observation: *"When tools are available, models tend to act quickly rather than think deeply."*

#### Why CoT / Prompt Engineering Fails Here
Chain-of-Thought ("Let's think step by step") works for pure text generation. In function-calling scenarios it fails because:
- The **tool Schema is present in the request context**. Regardless of system prompt instructions like "plan before calling tools," the model's token prediction sees the attractive `bash`/`edit` schemas and gravitates toward generating their JSON parameters.
- You cannot reliably constrain model behavior purely through text instructions when the architecture itself creates competing attractors.

#### Harness Engineering Solution: Mechanism Over Prompt
**Principle**: *Mechanism decides behavior* (机制决定行为). Instead of asking the model nicely to think first, the Harness **physically removes tools from Phase 1 requests**.

**Two-Stage ReAct architecture**:
- **Phase 1 (Thinking)**: Send a `Generate(ctx, contextHistory, nil)` call — `nil` tools. Model has no tool schemas visible, so it is forced to output pure-text reasoning/planning.
- **Phase 2 (Action)**: Append the Phase 1 thinking text to `contextHistory`, then send `Generate(ctx, contextHistory, availableTools)`. The model now sees its own planning trace as prior context and follows it precisely due to autoregression.

#### Go Implementation: `AgentEngine` Struct

New field added to `internal/engine/loop.go`:

```go
type AgentEngine struct {
    provider       provider.LLMProvider
    registry       tools.Registry
    WorkDir        string
    EnableThinking bool   // 慢思考模式开关
}

func NewAgentEngine(p provider.LLMProvider, r tools.Registry, workDir string, enableThinking bool) *AgentEngine {
    return &AgentEngine{
        provider:       p,
        registry:       r,
        WorkDir:        workDir,
        EnableThinking: enableThinking,
    }
}
```

The constructor signature adds `enableThinking bool` as the fourth parameter — a compile-time decision whether slow thinking is active for this engine instance.

#### Go Implementation: Two-Phase `Run` Loop

Inside the `for {}` loop in `Run()`:

```go
// Phase 1: nil tools → forced text reasoning
if e.EnableThinking {
    thinkResp, err := e.provider.Generate(ctx, contextHistory, nil)  // KEY: nil
    if err != nil { return fmt.Errorf("Thinking 阶段生成失败: %w", err) }
    if thinkResp.Content != "" {
        contextHistory = append(contextHistory, *thinkResp)  // append thinking trace
    }
}

// Phase 2: real tools → action guided by Phase 1 trace
actionResp, err := e.provider.Generate(ctx, contextHistory, availableTools)
```

The `nil` on the first `Generate` call is the entire mechanism. The `LLMProvider` interface signature is `Generate(ctx, msgs, tools)` — passing `nil` for tools means no `functions`/`tools` field appears in the API request body, so the model receives a plain text completion request.

The autoregression leverage: when Phase 1 outputs "I need to run `ls` first", that text is appended to `contextHistory`. In Phase 2, the model reads its own prior words and generates `{"command": "ls -la"}` — not because it was told to, but because its own previous tokens predict this continuation with near-certainty.

#### Mock Provider Upgrade (`cmd/claw/main.go`)

The mock must distinguish the two phases. The discriminator is `len(tools) == 0`:

```go
func (m *mockProvider) Generate(ctx context.Context, msgs []schema.Message, tools []schema.ToolDefinition) (*schema.Message, error) {
    if len(tools) == 0 {
        // Phase 1: return pure-text reasoning
        return &schema.Message{
            Role:    schema.RoleAssistant,
            Content: "【推理中】目标是检查文件。我需要先调用 bash 工具执行 ls 命令...",
        }, nil
    }
    // Phase 2: return ToolCall on turn 1, summary on turn 2
    m.turn++
    if m.turn == 1 {
        return &schema.Message{
            Role:      schema.RoleAssistant,
            ToolCalls: []schema.ToolCall{{ID: "call_123", Name: "bash", Arguments: []byte(`{"command": "ls -la"}`)}},
        }, nil
    }
    return &schema.Message{Role: schema.RoleAssistant, Content: "任务圆满完成！"}, nil
}
```

The mock `Registry.GetAvailableTools()` returns `[]schema.ToolDefinition{{Name: "bash"}}` so Phase 2 receives a non-nil, non-empty slice.

#### Files Modified This Chapter
| File | Change |
|---|---|
| `internal/engine/loop.go` | Add `EnableThinking bool` field; refactor `Run()` into two-phase loop |
| `cmd/claw/main.go` | Upgrade `mockProvider` to handle `nil` tools; enable `EnableThinking: true` |
| `internal/provider/interface.go` | No change |
| `internal/schema/message.go` | No change |
| `internal/tools/registry.go` | No change |

#### Limitation: Static EnableThinking
`EnableThinking` is set once at `NewAgentEngine(...)` and applies to **every turn** for the engine's lifetime. This is wasteful:
- For complex tasks (refactoring an entire module), forced thinking on turn 1 is valuable.
- For simple mid-task steps (writing one small function after the plan is clear), forcing a full Thinking phase wastes tokens and adds latency.

The solution — dynamic thinking that activates only when needed — is deferred to **Chapter 13 (Plan Mode)**, where the distinction between "slow thinking" and "Plan mode" will be explored.

### Summary
Chapter 03 diagnoses a fundamental behavioral flaw in naive ReAct loops: LLMs are architecturally biased toward immediate tool use when tools are present in the request context, and prompt-level CoT instructions cannot reliably counteract this. The Harness Engineering solution (Two-Stage ReAct) physically isolates a Thinking phase by passing `nil` tools to the first LLM call each turn, forcing pure-text planning output. That planning trace is then injected back into `contextHistory` before the Action phase call, exploiting the model's own autoregressive nature to produce accurate, plan-aligned tool invocations. The implementation requires only a single `EnableThinking bool` flag on `AgentEngine` and a `nil` argument in one `Generate` call — a minimal architectural change with a large behavioral impact.

---

## Key Takeaways
- LLMs are architecturally "System 1" (fast, instinctive) — passing tool schemas in a request context biases next-token prediction toward tool-call JSON, bypassing deliberate reasoning.
- Prompt instructions ("think before acting") are insufficient because the **tool schema presence itself** is a structural attractor stronger than text instructions.
- Two-Stage ReAct separates "谋" (planning) from "动" (action) via physical API-call isolation: Phase 1 sends `Generate(ctx, msgs, nil)`, Phase 2 sends `Generate(ctx, msgs, availableTools)`.
- The `nil` tools argument to `Generate` is the entire mechanism — no new interfaces or message types required, just a parameter change.
- Autoregression is the amplifier: the model's Phase 1 self-narrative becomes a "planning commitment" that the Phase 2 completion follows naturally.
- `EnableThinking bool` on `AgentEngine` is a **static, global** switch — it cannot adapt per-turn based on task complexity. Chapter 13 (Plan Mode) will address dynamic activation.
- The `LLMProvider` interface `Generate(ctx, msgs, tools)` was deliberately designed pure (no side effects, no hidden state) — this made adding the two-phase logic trivially cheap.

---

## Knowledge Graph Seeds

### 1. 本讲核心节点

- [[two-stage-react|Two-Stage ReAct]] — 将 [[react-paradigm|ReAct 循环]] 拆分为独立 Thinking Phase 与 Action Phase 的双阶段架构，物理隔离规划与执行
- [[thinking-phase|Thinking Phase]] — Phase 1：以 `nil` tools 调用 `Generate`，强制 LLM 输出纯文本推理规划，不允许工具调用
- [[action-phase|Action Phase]] — Phase 2：携带完整 `availableTools` 调用 `Generate`，由 Phase 1 的规划迹引导工具选择
- AgentEngine — Agent 核心执行引擎结构体，新增 `EnableThinking bool` 字段控制双阶段行为
- EnableThinking — `AgentEngine` 上的静态布尔开关，决定是否启用 [[thinking-phase|Thinking Phase]]；当前为全局生效，不支持按 turn 动态调整
- contextHistory — 跨 Phase 传递的消息历史切片；Thinking Trace 以 `RoleAssistant` 纯文本消息追加其中，成为 Phase 2 的先验上下文
- LLMProvider — 定义 `Generate(ctx, msgs, tools)` 的纯函数接口；`tools` 传 `nil` 即触发无工具文本生成模式
- autoregression — LLM 自回归生成机制；Phase 1 写入 contextHistory 的规划文本会以极高概率引导 Phase 2 产出与之一致的工具调用
- [[impulsive-model-problem|Impulsive Model Problem]] — 工具 Schema 出现在上下文时，LLM next-token 概率向工具调用 JSON 坍塌，表现为跳过规划直接行动的结构性缺陷
- [[mechanism-over-prompt|Mechanism over Prompt]] — 「机制决定行为」原则：通过物理剥离工具（`nil` 参数）而非提示词约束来改变模型行为
- mockProvider — 测试用虚拟 Provider，以 `len(tools)==0` 区分 Thinking/Action 两阶段，返回不同类型的响应

### 2. 课程内导航链接

- [[01-architecture-evolution-from-framework-to-harness|第 01 讲 架构演进]] — Agent Harness 与传统 Framework 的架构差异
- [[02-main-loop-react-cycle|第 02 讲 Main Loop]] — [[react-paradigm|Basic ReAct]] 循环实现，是本讲 Two-Stage 升级的基础
- [[04-provider-interface-claude-openai-adapter|第 04 讲 Provider 适配器]] — LLMProvider 接口的真实后端实现，Thinking Phase 依赖该接口的 `nil` tools 语义
- [[05-tool-registry-and-dispatch|第 05 讲 Tool Registry]] — `availableTools` 的注册与分发机制，Action Phase 的工具来源
- [[06-minimal-toolset-yolo-philosophy|第 06 讲 最简工具集]] — [[yolo-execution-philosophy|YOLO 哲学]] 下最小化工具集的设计，影响 Phase 2 可用 Schema 的范围

### 3. 课程外与通用概念关联

- Chain-of-Thought — 提示词层面的逐步推理技术；本讲指出在 function-calling 场景中 CoT 会被工具 Schema 吸引子压制
- Kahneman System 1 / System 2 — 快思考/慢思考认知模型；本讲借此解释为什么需要 Thinking Phase
- [[react-paradigm|ReAct]] — Reason + Act 交织的 Agent 范式；[[two-stage-react|Two-Stage ReAct]] 是对原始 ReAct 的结构化拆分升级
- [[plan-mode|Plan Mode]] — 动态按需慢思考的进阶机制，解决 `EnableThinking` 静态开关的局限性，在第 13 讲展开
- function calling — LLM 工具调用协议；工具 Schema 以 JSON 注入请求上下文，是「工具饥饿」现象的根因
- [[harness-engineering|Harness Engineering]] — 以工程机制（而非 Prompt 美德）约束 AI 行为的设计哲学，本讲是其核心实践案例

### 4. 推荐关系边

- AgentEngine → contains-field → EnableThinking
- AgentEngine → executes → [[two-stage-react|Two-Stage ReAct]]
- [[two-stage-react|Two-Stage ReAct]] → phase-1-is → [[thinking-phase|Thinking Phase]]
- [[two-stage-react|Two-Stage ReAct]] → phase-2-is → [[action-phase|Action Phase]]
- [[thinking-phase|Thinking Phase]] → writes-trace-to → contextHistory
- contextHistory → conditions → [[action-phase|Action Phase]]
- [[action-phase|Action Phase]] → leverages → autoregression
- [[two-stage-react|Two-Stage ReAct]] → supersedes → [[react-paradigm|ReAct]]
- [[two-stage-react|Two-Stage ReAct]] → instantiates → [[mechanism-over-prompt|Mechanism over Prompt]]
- [[mechanism-over-prompt|Mechanism over Prompt]] → contrasts-with → Chain-of-Thought
- EnableThinking → static-limitation-foreshadows → [[plan-mode|Plan Mode]]
- LLMProvider → nil-tools-enables → [[thinking-phase|Thinking Phase]]
- mockProvider → discriminates-phase-via → LLMProvider
- [[impulsive-model-problem|Impulsive Model Problem]] → root-cause-is → autoregression
- [[impulsive-model-problem|Impulsive Model Problem]] → solved-by → [[two-stage-react|Two-Stage ReAct]]

### 5. 后续值得沉淀成卡片的主题

- [[critic-phase|Critic Phase 微循环]] — 在 Thinking Phase 与 Action Phase 之间插入第三次 `Generate` 调用，对 Phase 1 计划进行自我审计，可作为独立设计模式卡片
- [[thinking-trace-filtering-strategy|Thinking Trace 过滤策略]] — 是否在 UI 层过滤掉内部推理消息、以何种形式暴露给用户/reviewer，属于 Agent 可观测性设计话题
- [[plan-mode|动态 EnableThinking 触发条件]] — 按任务复杂度、turn 序号或工具风险等级动态决定是否启用 Thinking Phase，比静态布尔开关更精细
- [[failure-experience-distillation|失败经验沉淀机制]] — 将「方案 A 失败原因」提炼成 Critic Phase 记忆或 Few-shot 示例，形成 Agent 长期学习资产

---

## Notes For Review
- How does the `schema.Message` struct represent the Thinking Trace — is it `RoleAssistant` with only `Content` set and no `ToolCalls`? (From the code, yes — `thinkResp.Content != ""` check confirms it's a pure-text assistant message.)
- In real production: should Thinking Trace messages be filtered out before sending to the end user's UI? (The article raises this as the Chapter 03 思考题 — the internal trace may be verbose and expose implementation details.)
- The 思考题 asks about inserting a "self-audit micro-loop" between Phase 1 and Phase 2. What would that look like? (A third `Generate` call that critiques the Phase 1 plan before Phase 2 executes it?)
- What happens to token cost with `EnableThinking=true` on every single turn of a 50-turn session?

---

## Deep Dive

> [!info]+ 💡 Explanation - 从“工具饥饿”到“透明思考”：慢思考为什么是当前 Agent Harness 的必要机制
>
> ### 1. 为什么大模型在看到工具后会“渴望”使用工具
>
> 这背后不是简单的“模型不够听话”，而是**自回归生成机制**与**训练对齐方式**共同塑造出来的结构性倾向。模型的工作方式是预测下一个 token，而不是在输出第一个字之前先做几十步静态预演；当工具的 JSON Schema 被直接放进上下文时，这些结构化模式会变成非常强的“下一 token 吸引子”。
>
> - **概率坍塌与捷径吸引**：工具调用通常是最短路径，模型会迅速把概率质量压向工具调用 JSON，而不是继续输出长篇规划文字。
> - **训练后的行动偏好**：现代模型在 instruction tuning 和 tool-use alignment 里被反复奖励“直接帮用户做事”，因此一旦它意识到自己“可以动手”，就会优先表现成一个高效执行者。
> - **缺少先验预演能力**：没有额外机制时，模型很难在生成第一个 token 前完成完整沙盘推演；它更像先伸手拿工具，再边做边想。
>
> 这正是 Two-Stage ReAct 要解决的本质问题：不是再写一句“请先思考”，而是**物理上让第一阶段根本看不到工具**，从机制层面切断那条最强的冲动路径。
>
> ### 2. 如果用户已经在 Prompt 里给了详细方案，慢思考会不会冲突
>
> 会有代价，但不必然是坏事。若用户已经把步骤拆得很细，Thinking Phase 可能重复这些内容，带来额外 token 成本，也可能因为上下文过长出现某种**路径依赖或锚定效应**：模型一边受用户方案约束，一边又生成自己的内部计划，两者若存在微小偏差，就可能互相拉扯。
>
> 但在成熟的 Harness 里，这个阶段更像一次**内部规范化**。用户给出的往往是面向人的自然语言方案，而 Thinking Phase 会把它转写成更适合模型下一步工具调用的内部指令。也就是说，它不是单纯“再说一遍”，而是在做一次从外部描述到内部执行语言的对齐。
>
> 因此，冲突的关键不在于“有没有 Thinking Phase”，而在于它是不是**全局静态开启**。Chapter 03 的 `EnableThinking` 只有布尔开关，所以所有 turn 都被一视同仁地慢思考；真正更优的方向，是后续章节会讨论的**动态按需思考**。
>
> ### 3. 两阶段慢思考会不会成为未来更强模型的枷锁
>
> 有这个可能，但更准确地说，它会从“强约束”演化成“高风险场景下的护栏”。如果未来模型本身已经拥有更强的原生慢思考能力，始终强制执行 Phase 1 / Phase 2 拆分，确实可能带来额外延迟、token 消耗，以及对灵活性的限制。
>
> 不过 Two-Stage ReAct 的价值并不只在“让模型多想一会儿”，更在于它提供了一个**工程上的物理拦截点**：
>
> - 在“想完”与“动手”之间插入**人工审批**。
> - 把模型的意图显式暴露出来，提升**可观测性与可审计性**。
> - 在涉及高风险工具时，保留**确定性的安全边界**。
>
> 所以未来更像是这样一条演进路径：简单任务走快思考，复杂任务或危险工具调用时，Harness 再强制打开慢思考。那时它不再是无处不在的枷锁，而是像自动驾驶里的物理刹车一样，平时不用，但必须存在。
>
> ### 4. 我们更该信任模型自律，还是信任框架约束
>
> 在当前阶段，工业系统仍然必须首先信任**框架约束**。原因很直接：模型再强，也仍可能在工具可用时产生冲动式调用，而工业级 Agent 更关心确定性、可重复性和可拦截性。像 `availableTools = nil` 这种机制的价值，在于它把“先想后做”从提示词美德变成了系统约束。
>
> 从长期看，随着模型原生推理、自主算力分配和内生 Chain-of-Thought 能力增强，我们会逐步把更多控制权移交给模型自律，让模型自己决定何时快、何时慢。但即使那一天到来，Harness 也不会消失，它只会收缩为更高层的**边界定义器**和**熔断器**：平时放权，关键时刻介入。
>
> ### 5. 为什么 QE 视角通常更偏好“透明思考”，而不是只看最终结果
>
> 对质量工程而言，Thinking Trace 本质上就是一份白盒测试日志。只看最后结果，等于只知道“测试过了”；看思考过程，才能判断它是不是沿着正确、稳健、可复用的路径走到那个结果。比如模型若先说“我要跑测试建立基线，再决定是否修改实现”，这通常说明它具备了稳定的工程习惯；如果它在思考里暴露出“我准备直接删目录或跳过验证”的倾向，人类就能在 Action Phase 之前提前拦截。
>
> 但透明不等于把全部自言自语原样扔进 PR。原始思考日志往往信噪比极低，会压垮 reviewer 的注意力。更高效的做法是把过程**蒸馏成摘要**：
>
> - **Problem Identified**：根因是什么。
> - **Action Taken**：做了哪些关键修改。
> - **Verification**：跑了哪些验证，结果如何。
> - **Thinking Trace (Collapsible)**：原始日志以折叠形式保留，仅供需要时审计。
>
> 这样既保留透明度，又不会把 Code Review 变成阅读几千字思维流的耐力赛。
>
> ### 6. 失败尝试为什么不只是 token 消耗，而是长期资产
>
> 优秀 Agent 的标准不是“从不犯错”，而是能识别方案 A 的局部最优、解释它为什么失败，然后及时切到方案 B。这个能力意味着它不只是任务执行者，更开始具备元认知和自省能力。
>
> 对 Harness 来说，这类失败经验完全可以被沉淀为 [[failure-experience-distillation|长期学习资产]]：当工具调用报错或方案验证失败时，系统不必立刻判定任务失败，而是可以强制进入一个 **[[critic-phase|Critic Phase]]**，让模型分析失败原因、调整计划，并把“方案 A 为何不通”的结论提炼成可复用知识。下次遇到类似任务，Agent 就能把这份避坑经验作为先验约束加载进 Thinking Phase。
>
> 从这个角度看，多出来的 token 并不只是成本，而是在购买未来更少踩坑、更少人工返工、更短审查路径的概率。对于高价值工程任务，这种投入往往是划算的。

---

## Interview Follow-up

> [!question]- 📋 面试题 (Interview Follow-up)
>
> **题目 1：** 为什么在请求里已经包含工具 Schema 时，单靠提示词写“先思考再行动”通常压不过模型的工具调用冲动？请从自回归生成和对齐训练两个角度解释。
>
> **题目 2：** 如果用户已经在 Prompt 中给出了详细方案，Two-Stage ReAct 的 Thinking Phase 为什么仍可能有价值？它同时会引入哪些代价或风险？
>
> **题目 3：** 为什么说两阶段慢思考未来更可能从“枷锁”演变成“护栏”？请结合人工审批、可观测性和高风险工具约束回答。
>
> **题目 4：** 站在 Principal QE 的视角，为什么更偏好看到 Agent 的透明思考过程，而不是只看最终修复结果？这种透明度应该如何进入 PR 或 Code Review 流程？
>
> **题目 5：** 一个优秀 Agent 在方案 A 失败后转向方案 B，为什么这不只是“多花了一些 token”，而是可以沉淀成系统级资产？

---

> [!example]- 💡 答案指南 (Answer Guide)
>
> **题目 1 - 引导答案思路：**
> 关键在于工具 Schema 不是普通文本，而是强结构化模式；在自回归生成里，它会把“下一个 token”概率强烈拉向工具调用 JSON。再叠加对齐训练里对“高效执行”和“主动使用工具”的奖励，模型就更容易直接行动，而不是继续输出长篇规划。于是 prompt 里的“先想想”属于软约束，`Generate(..., nil)` 这种物理剥离工具才是硬约束。
>
> ---
>
> **题目 2 - 引导答案思路：**
> Thinking Phase 仍可能有价值，因为它能把用户面向人的自然语言计划转写成模型自己更容易执行的内部步骤，相当于做一次内部规范化和二次校验。它的代价是会增加 token 与时延，还可能在用户方案和模型内部计划不完全一致时引入锚定效应或路径依赖。也正因为如此，静态 `EnableThinking` 只是过渡解，真正理想的是按任务复杂度动态触发。
>
> ---
>
> **题目 3 - 引导答案思路：**
> 当模型原生推理能力更强后，所有 turn 都强制拆成两阶段会显得臃肿，所以它可能不再适合作为全局默认机制；但它依然保留工程价值，因为“想完再动手”之间的那道边界本身就是人工审批、审计追踪和安全拦截的插槽。未来它更像是只在高风险工具、复杂任务或需要外部审批时才拉起的护栏，而不是时时刻刻都套在模型身上的枷锁。
>
> ---
>
> **题目 4 - 引导答案思路：**
> QE 关注的不只是结果对不对，还关心推理路径是不是稳健、可解释、可复现，所以透明思考过程相当于白盒测试日志。它能帮助人类提前发现危险计划、验证模型是否真正理解上下文，并为 Prompt 或 Harness 调优提供依据。但这份透明度不该以“原始思维流全文粘贴”的形式出现，最佳实践是把根因、动作和验证结果压缩成 Summary，把完整 trace 作为可折叠审计附件保留。
>
> ---
>
> **题目 5 - 引导答案思路：**
> 方案 A 失败后切换到方案 B，说明 Agent 具备了识别局部最优、复盘失败原因并重新规划的能力，这本身就是更高阶的工程素质。若 Harness 能把“为什么 A 不通”提炼进 [[failure-experience-distillation|失败案例库、经验库]] 或 Critic Phase 记忆中，未来类似任务就能直接避开同类坑。这样，多花出去的 token 实际上换来了更少的返工、更短的 review 路径和更高的长期 ROI。

---

## Post-test
> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*
1. 用一句话解释为什么在有工具 Schema 的 API 请求中，提示词层面的 "先思考再行动" 指令会失效。
2. Two-Stage ReAct 的 Phase 1 在 Go 代码层面，与 Phase 2 的唯一区别是什么？写出具体的 `Generate` 调用差异。
3. 当前实现的 `EnableThinking` 有什么局限性，预计在哪一讲得到解决？

> [!example]- 💡 答案指南 (Answer Guide)
>
> #### Q1 — 工具 Schema 为什么压过提示词指令
>
> 工具 Schema 作为 JSON 出现在上下文中，会形成比文本指令更强的“下一个 token 吸引子”。模型的预测概率会迅速向工具调用 JSON 坍塌，因此单靠“先思考再行动”这类文字约束，无法抗衡结构性的概率偏置。
>
> #### Q2 — Phase 1 与 Phase 2 的唯一代码差别
>
> Phase 1 调用 `e.provider.Generate(ctx, contextHistory, nil)`，第三参数为 `nil`，也就是完全不传工具；Phase 2 调用 `e.provider.Generate(ctx, contextHistory, availableTools)`，第三参数为完整工具切片。只差一个参数，但请求体结构已经从“纯文本生成”变成了“可工具调用生成”。
>
> #### Q3 — `EnableThinking` 的局限性
>
> `EnableThinking` 是在 `NewAgentEngine(...)` 时一次性设定的静态全局开关，对所有 turn 无差别生效。复杂任务开局时它很有价值，但任务中后期的简单执行步骤也会被迫经历一次完整慢思考，造成额外 token 和时延；文章明确指出这一问题会在 **第 13 讲（Plan Mode）**中进一步解决。
