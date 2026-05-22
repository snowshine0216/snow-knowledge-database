---
tags: [agent-harness, error-recovery, go, llm-engineering, context-injection, tool-use, harness-engineering]
source: https://time.geekbang.org/column/article/978759
wiki: wiki/courses/ai-agent-harness-training/chapter-03-run-and-test-compile-test-build-guardrails/005-error-self-healing-context-aware-recovery-injection.md
---

## Pre-test

*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 大模型在执行工具调用失败后，为什么往往无法自行从错误中恢复？
2. Harness 引擎如何让错误信息从"冷冰冰的陈述"变成"行动指南"？
3. 在工业级实践中，字符串关键字匹配的替代方案是什么？

---

## Chapter Metadata
- Course: AI Agent Harness 训练营（从0开始构建 Agent Harness）
- Chapter: 005（课程第 14 讲）— 错误自愈：上下文感知的 Error Recovery 提示模板注入机制
- Author: Tony Bai
- Date: 2026-05-23
- Article ID: 978759

## Cornell Notes

### Cue Column (Questions)
- 为什么原始 ToolResult 错误不足以让大模型自愈？
- "报错信息的不可操作性"是什么意思？
- RecoveryManager 的职责边界是什么？
- 如何将 Recovery 机制以最小侵入方式嵌入 loop.go？
- 字符串匹配 vs 领域错误码，各自适用什么场景？
- 如何验证注入机制实际改变了大模型的行为？

### Notes Column

**问题根源：报错信息的不可操作性**

大模型面对原始错误信息时会选择"最小阻力路径"：要么机械道歉后放弃，要么连续三次生成相同的错误 `old_text` 盲目重试。这是因为原始报错（如 `在文件中未找到 old_text`）是陈述性的，没有告诉模型下一步应该执行什么工具、走什么排障 SOP。顶级 Harness（Claude Code / OpenClaw）的做法是：在返回 ToolResult 之前，先在 Harness 层做一次拦截，注入"锦囊妙计（Recovery Hints）"——把"你应该先调用 `read_file` 重新读取文件"这类具体行动指令直接写入上下文。

**架构设计：RecoveryManager**

新增 `internal/context/recovery.go`，只暴露一个方法：

```go
func (rm *RecoveryManager) AnalyzeAndInject(toolName string, rawError string) string
```

内部以 `switch toolName` + `strings.Contains` 对错误做分类，匹配到模式则返回 `"<rawError>\n\n[系统救援指南]: <hint>"`，否则原样返回。三类错误模板：

| 工具 | 错误特征（相对稳定的关键字） | 注入的行动指南 |
|---|---|---|
| `edit_file` | `在文件中未找到 old_text` | "请先用 `read_file` 重新读取文件，获取准确内容后再编辑" |
| `edit_file` | `匹配到了多处` | "在 `old_text` 中增加上下相邻几行，确保替换唯一性" |
| `read_file`/`write_file` | `no such file or directory` | "用 `bash ls -la` 或 `find . -name` 查找正确路径，不要猜" |
| `bash` | 超时/`DeadlineExceeded` | "转入后台执行（`nohup ... &`），不要阻塞主线程" |

**架构抉择：字符串匹配 vs 领域错误码**

本讲用 `strings.Contains` 是演示目的，已明确标注为生产反模式。工业级方案：
1. 工具层直接抛出 POSIX 标准错误（`no such file or directory`、`permission denied`）——这些极稳定。
2. 在 Tool Registry 层定义领域错误码（`ERR_FILE_NOT_FOUND`、`ERR_EDIT_FUZZY_MATCH_FAILED`），用 `switch-case` 替换 `strings.Contains`。

**集成：loop.go 最小改造**

`AgentEngine` 新增一个字段 `recovery *ctxpkg.RecoveryManager`，在工具执行后做拦截：

```go
finalOutput := result.Output
if result.IsError {
    finalOutput = e.recovery.AnalyzeAndInject(call.Name, result.Output)
}
observationMsgs[idx] = schema.Message{..., Content: finalOutput}
```

改动仅一行拦截逻辑，核心 loop 结构不变，侵入性极小。

**实战验证：诱发错误 → 自愈闭环**

测试场景：让 Agent 在不先读取文件的情况下直接调用 `edit_file`，且给它"误导性"的注释作为 `old_text`（与实际文件格式不符）。

观测到的行为链：
1. Turn 1 — Agent 直接调 `edit_file`，因 `old_text` 不匹配报错
2. RecoveryManager 捕获报错，注入"请先用 `read_file` 重新读取"指令
3. Turn 2 — Agent 看到系统级指令，改为先调 `read_file`，获取准确内容
4. Turn 3 — 用正确内容发起 `edit_file`，成功完成修改

大模型从"盲目重试"变为"读取-验证-修改"的正确排障 SOP，证明注入机制生效。

### Summary

本讲在 go-tiny-claw 的 Harness 层引入了"上下文感知错误自愈"机制：通过 `RecoveryManager` 拦截工具报错，将生硬的原始错误注入带有具体行动指令的"锦囊妙计"，引导大模型执行正确的排障 SOP（如先调 `read_file` 再编辑）而非盲目重试或放弃。核心改动仅 loop.go 的一行拦截逻辑，架构上化被动为主动。生产落地时须将脆弱的字符串匹配升级为领域错误码 + switch-case 方案。

## Key Takeaways

- **原始报错是陈述，不是指令**：大模型拿到 `在文件中未找到 old_text` 后会走最小阻力路径（放弃或盲目重试），因为没有人告诉它应该调 `read_file`。Recovery Hints 的作用是直接写死行动指令，劫持模型的决策。
- **RecoveryManager 只做一件事**：`AnalyzeAndInject(toolName, rawError) string`——接收原始报错，返回拼接了系统指南的增强版报错，或原样返回。职责单一，测试简单。
- **loop.go 改动极小**：在工具执行结果写入 session 历史前，一行 `if result.IsError` 拦截，调用 `AnalyzeAndInject`。核心循环结构零改动——这正是"Harness 层注入"优于"工具层注入"的工程价值。
- **字符串匹配是演示代码，生产必须升级**：中文报错字符串改一个字整套机制就失效。正确做法：工具层抛出稳定的 POSIX 标准错误 + Tool Registry 层定义领域错误码，用 `switch-case errorCode` 替换 `strings.Contains`。
- **Recovery Hints 是沉淀过的排障 SOP**：锦囊里的话术不是随意写的——"先用 `bash ls` 查路径""转 `nohup &` 后台"——这些是工程团队积累的最佳实践，通过 Recovery 机制以"系统级高优指令"形式传递给模型，执行顺从度大幅上升。
- **验证方法：刻意构造错误陷阱**：在 `main.go` 里直接给 Agent 误导性 `old_text`，观察两轮工具调用日志——Turn 1 报错注入，Turn 2 主动 `read_file`，Turn 3 成功 `edit_file`。这是验证注入机制真实有效的最直接方法。

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[RecoveryManager]]：go-tiny-claw 的错误自愈模块，持有 `AnalyzeAndInject` 方法，按工具名 + 错误关键字分类注入 Recovery Hints
- [[Recovery Hints]]：注入到 ToolResult 中的行动指南字符串，格式为 `"<rawError>\n\n[系统救援指南]: <hint>"`，内容是具体的工具调用建议
- [[报错信息不可操作性]]：大模型面对原始错误时走"最小阻力路径"的根因，即错误仅陈述事实而不指向下一步行动
- [[领域错误码]]：工业级替代字符串匹配的方案，在 Tool Registry 层定义 `ERR_FILE_NOT_FOUND` 等类型安全的错误标识，供 RecoveryManager 做 switch-case 分类
- [[POSIX 标准错误]]：`no such file or directory`、`permission denied` 等来自底层 OS / C API 的稳定错误字符串，是字符串匹配中相对可靠的少数例外
- [[AnalyzeAndInject]]：RecoveryManager 暴露的唯一方法，纯函数签名 `(toolName, rawError) → string`，可独立单测
- [[系统级指令]]：注入到上下文中的高权重提示，带有"请先使用 XXX 工具"的祈使句式，大模型对系统级指令的顺从度显著高于用户提示

### 2. 课程内导航链接
- [[001-prompt-assembly-dynamic-loading-agents-md-and-skills|第 10 讲 Prompt 组装与动态加载]]：解释 `PromptComposer` 如何构建系统提示，Recovery Hints 注入的目标上下文正由此生成
- [[002-session-isolation-and-working-memory|第 11 讲 Session 隔离与工作内存]]：Recovery Hints 作为 ToolResult 被 `session.Append` 追加到工作内存，理解 session 结构才能明白注入点
- [[003-context-compaction-staged-degradation-strategy|第 12 讲 上下文压缩与阶梯降级]]：Compactor 压缩历史时不区分正常 ToolResult 与含 Recovery Hints 的报错，注入内容同样受压缩策略影响
- [[004-memory-persistence-state-externalization-file-based-persistent-memory|第 13 讲 状态外部化与文件持久化记忆]]：PLAN.md + TODO.md 提供宏观导航，本讲 Recovery 提供微观容错——两者共同支撑 Agent 完成长程任务

### 3. 课程外与通用概念关联
- [[harness-engineering]]：本讲是 Harness 防御体系的典型实现——错误拦截与上下文注入是 Harness 与裸 LLM API 调用的核心差异之一
- [[openclaw-architecture]]：OpenClaw 作为顶级 Harness 的代表之一，本讲明确引用其错误注入实践作为设计参考
- [[tool-use-patterns]]：Recovery 机制建立在工具调用失败的标准化 `IsError` 标志之上，依赖 Tool Registry 的一致结果结构

### 4. 推荐关系边（可直接扩成独立卡片）
- [[RecoveryManager]] → implements → [[报错信息不可操作性]]（通过行动指南克服）
- [[Recovery Hints]] → enables → [[错误自愈闭环]]（Turn 1 报错 → Turn 2 read_file → Turn 3 成功编辑）
- [[领域错误码]] → replaces → [[字符串关键字匹配]]（生产级升级路径）
- [[RecoveryManager]] → extends → [[AgentEngine]]（以字段注入方式集成，最小侵入）
- [[系统级指令]] → constrains → [[大模型决策路径]]（高权重提示覆盖模型的最小阻力路径）
- [[Recovery Hints]] → composed-of → [[排障 SOP]]（将工程团队积累的最佳实践编码为可注入的模板）

### 5. 后续值得沉淀成卡片的主题
- [[Recovery Hints]]
- [[报错信息不可操作性]]
- [[领域错误码]]
- [[错误自愈闭环]]
- [[系统级指令]]

## Notes For Review
- 思考题：对于完全未知的复杂报错（如 CrashLoopBackOff），能否在 RecoveryManager 内部调用一个轻量小模型（GLM-4 Flash）把长篇堆栈翻译成一句"人话"，再注入给主 Agent？这是"用 AI 治愈 AI"架构——延迟（+1 次 LLM RTT）和成本是主要 trade-off，优点是不需要预置模板、可泛化到未知错误类型。
- 本讲实现的字符串匹配版 RecoveryManager 在个人项目中验证机制可行，但企业落地前必须重构为领域错误码 + switch-case。
- 下一讲预告：防死循环的 System Reminders 机制——通过计算工具调用轨迹哈希指纹，在失控边缘强行踩刹车。

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 解释"报错信息的不可操作性"是什么意思，以及 Recovery Hints 如何从根本上解决这个问题。
2. RecoveryManager 在 loop.go 中的注入点在哪里？为什么选择在这里注入而不是在工具层内部？
3. 本讲用字符串匹配实现错误分类，为什么这在生产中是反模式？工业级替代方案是什么？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> "不可操作性"指原始报错（如 `在文件中未找到 old_text`）只陈述发生了什么，不告诉大模型下一步应该做什么。模型面对这种报错会走"最小阻力路径"：要么放弃，要么盲目重复同样的错误行为。Recovery Hints 通过在 Harness 层拦截报错并追加具体的祈使指令（如"请先用 `read_file` 重新读取文件"），将陈述性错误转化为行动指南，从架构层强制引导模型走正确的排障 SOP。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 注入点在 `loop.go` 的工具执行结果写入 session 历史之前：`if result.IsError { finalOutput = e.recovery.AnalyzeAndInject(...) }`。选择 Harness 层而非工具层的原因：工具层只感知自身的错误类型，无法知道整体 Agent 排障 SOP；Harness 层有全局视角，可以跨工具统一管理 Recovery 策略，且改动最小（一行拦截代码，不破坏 loop 结构）。
>
> ---
>
> **题目 3 - 引导答案思路：**
> 字符串匹配依赖报错文本的具体措辞，中间件或工具版本升级后报错文案一旦改变，整套匹配逻辑静默失效（Flaky 反模式）。工业级方案：底层工具统一抛出稳定的 POSIX 标准错误（`no such file or directory`）或由 Tool Registry 定义的领域错误码（`ERR_EDIT_FUZZY_MATCH_FAILED`），RecoveryManager 用 `switch-case errorCode` 替代 `strings.Contains`，类型安全且重构友好。
