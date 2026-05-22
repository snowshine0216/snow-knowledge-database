---
tags: [agent-harness, error-recovery, go, llm-engineering, context-injection, tool-use, harness-engineering]
source: https://time.geekbang.org/column/article/978759
---

# 错误自愈：上下文感知的 Error Recovery 提示模板注入机制

Agent Harness 第14讲，介绍如何在 go-tiny-claw 引擎层实现"上下文感知错误自愈"机制——在工具调用失败时，由 Harness 拦截原始报错并注入带有具体行动指令的 Recovery Hints，引导大模型走正确的排障 SOP，而非盲目重试或放弃。

## Key Concepts

- **报错信息的不可操作性**：原始 ToolResult 错误（如 `在文件中未找到 old_text`）只陈述发生了什么，不告诉大模型下一步调用什么工具。大模型面对这类报错会走"最小阻力路径"——机械道歉放弃，或连续三次发相同的错误 `old_text` 盲目重试。这是 LLM 推理能力在无上下文支撑下的系统性短板，而非偶发 bug。

- **Recovery Hints 注入**：Harness 在工具执行失败后，于写入 session 历史之前拦截错误结果，将 `<rawError>` 替换为 `"<rawError>\n\n[系统救援指南]: <具体行动指令>"`。注入的指令使用祈使句式（"请先使用 `read_file` 重新读取"），这类系统级高权重提示使大模型的执行顺从度显著高于普通用户提示。

- **RecoveryManager**：go-tiny-claw 中负责错误分类与注入的模块（`internal/context/recovery.go`）。唯一对外方法：`AnalyzeAndInject(toolName, rawError) string`。内部用 `switch toolName + strings.Contains` 匹配已知错误模式，匹配到则返回增强报错，否则原样透传。三类覆盖：
  - `edit_file` + `old_text 未找到` → "先用 `read_file` 重新读取，注意缩进"
  - `read_file/write_file` + `no such file or directory` → "先用 `bash ls -la` 查找正确路径"
  - `bash` + 超时/`DeadlineExceeded` → "转入 `nohup ... &` 后台，不要阻塞主线程"

- **最小侵入集成**：`AgentEngine` 仅新增一个 `recovery *RecoveryManager` 字段，在 `loop.go` 工具执行后加一行 `if result.IsError { finalOutput = e.recovery.AnalyzeAndInject(...) }`。Main Loop 结构零改动，侵入性极小。

- **字符串匹配 vs 领域错误码**：本讲的 `strings.Contains` 实现是演示代码，已明确标注为生产反模式——报错文案改一个字整套机制静默失效。工业级方案：工具层抛出 POSIX 标准错误或在 Tool Registry 定义领域错误码（`ERR_EDIT_FUZZY_MATCH_FAILED`），RecoveryManager 用 `switch-case errorCode` 替代字符串匹配。

## Key Takeaways

- Recovery Hints 的本质是将工程团队沉淀的排障 SOP（"读文件→确认内容→再编辑"）编码为可注入的系统级指令，以高权重方式覆盖大模型的低效默认行为。
- 选择在 Harness 层（loop.go）而非工具层注入，原因是 Harness 有全局视角，可跨工具统一管理 Recovery 策略；工具层只感知自身错误，无法指导整体排障链。
- 验证方法：刻意构造错误陷阱（给 Agent 误导性 `old_text`），观察两轮工具日志——Turn 1 注入救援指南，Turn 2 Agent 主动 `read_file`，Turn 3 成功 `edit_file`，完成自愈闭环。
- 延伸思考（思考题）：对完全未知的复杂报错（如 CrashLoopBackOff 堆栈），可在 RecoveryManager 后台调用轻量小模型（GLM-4 Flash）将堆栈翻译成一句"人话"指南再注入主 Agent——"用 AI 治愈 AI"架构的主要 trade-off 是 +1 次 LLM RTT 的延迟与额外成本。

## See Also

- [[RecoveryManager]]
- [[harness-engineering]]
- [[001-prompt-assembly-dynamic-loading-agents-md-and-skills|第 10 讲 Prompt 组装]]
- [[004-memory-persistence-state-externalization-file-based-persistent-memory|第 13 讲 状态外部化]]
- [[openclaw-architecture]]
