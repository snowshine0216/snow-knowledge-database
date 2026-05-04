---
tags: [ai-agent, harness-engineering, go, tool-registry, dispatch, function-calling]
source: https://time.geekbang.org/column/article/969870
---

# Chapter 05: Tool Registry 与分发机制

## Overview

在 go-tiny-claw 的 Harness 架构中，**Tool Registry** 是连接大模型意图（JSON ToolCall）与 Go 函数（物理执行）的核心中间件。它充当 Hub + Router 角色，实现三大职责：动态挂载工具（Register）、向大模型暴露工具 Schema（Expose Schema）、以及按名称路由并执行工具调用（Dispatch & Execute）。通过 `BaseTool` 接口约束和 `map[string]BaseTool` 的 O(1) 路由查找，Registry 彻底解耦了 Main Loop 与具体工具实现——新增工具只需写独立文件并调用 `Register`，核心引擎零修改。本讲还实现了第一个物理工具 `read_file`，展示了 Harness 底线防御思维：workDir 边界限制、参数延迟解析、错误语义化反馈，以及 8000 字节硬截断防止 Context 爆炸。

---

## Key Concepts

### BaseTool 接口（`internal/tools/registry.go`）

所有工具必须实现的三方法接口：

- `Name() string` — 全局唯一名称，大模型通过此名字发起 ToolCall
- `Definition() schema.ToolDefinition` — 返回工具描述和 InputSchema（JSON Schema），供 Provider 提交给大模型
- `Execute(ctx context.Context, args json.RawMessage) (string, error)` — 接收原始 JSON 字节流，反序列化和执行由各工具内部自行处理

接收 `json.RawMessage` 而非 `map[string]interface{}` 的设计允许各工具定义私有强类型参数结构体（如 `readFileArgs{Path string}`），Go 编译器负责字段检查。

### Registry 接口与 registryImpl

```go
type registryImpl struct {
    tools map[string]BaseTool  // O(1) 路由，Key = tool.Name()
}
```

`NewRegistry()` 返回 `Registry` 接口（不暴露具体类型），遵循依赖倒置原则，调用方只依赖接口行为。

**Execute 三步分发流：**
1. `r.tools[call.Name]` 查找 → 未找到则返回 `ToolResult{IsError: true}`（让模型感知幻觉调用并自纠）
2. `tool.Execute(ctx, call.Arguments)` 执行 → 物理 I/O 发生在此
3. 封装为 `schema.ToolResult{ToolCallID, Output, IsError}` 返回 Main Loop

### ReadFileTool 的四步防御链

`ReadFileTool` 将引擎 `workDir` 注入为物理边界：

| 步骤 | 防御内容 |
|------|---------|
| 延迟解析 | `json.Unmarshal` 到 `readFileArgs`，失败则报参数格式错误给模型 |
| 路径拼接 | `filepath.Join(workDir, input.Path)`，限制操作在工作区内 |
| 物理 I/O | `os.Open` + `io.ReadAll`，失败则报文件不存在给模型 |
| 硬截断 | `maxLen = 8000` 字节，超长则截断并附提示，防止 Token OOM |

### ToolResult.IsError 与模型 Self-Correction

`IsError: true` 不是 Go 的 error，而是向大模型传递的语义标志。模型在下一 Turn 读到错误输出后会尝试修正参数重试（Self-Correction）。无防线时此机制可能导致无限重试 + 成本失控，第 14–15 讲将引入重试计数器等工业防线。

### 硬截断的局限与工业升级路径

- **硬截断**（本讲）：`maxLen = 8000` 字节，简单有效但对超大文件任务必然失败
- **Tool Call Offloading**：超过阈值时将完整内容卸载到磁盘，向模型返回"头尾预览 + 路径引用"，让模型按需局部读取
- **全局 Context Compaction**（第 12 讲）：Main Loop 监控 Token 使用率，接近阈值时对历史会话智能摘要，裁剪冗余工具输出，保留高价值决策信息

---

## Key Takeaways

- **Main Loop 是"瞎子"**：它不知道任何工具的实现细节，只把 JSON ToolCall 丢给 Registry，由 Registry 路由分发
- **接口约束 = 工具契约**：`BaseTool` 接口强制每个工具必须清晰描述自己的能力（`Definition()`），这是大模型准确调用的前提
- **`map[string]BaseTool` 实现 O(1) 路由**：工具名是 key，注册即可用，无需改动任何已有代码
- **错误语义化而非 panic**：工具执行失败时返回 `ToolResult{IsError: true}`，让模型在下一 Turn 自纠，而不是让 Go 程序崩溃
- **底线防御思维**：绝不把系统安全性寄希望于大模型的理智，截断、边界限制、参数校验都在工具层强制执行

---

## See Also

- [[wiki/courses/ai-agent-harness-training/chapter-04-provider-adapter/04-provider-adapter-and-adaptive-reasoning]] — Provider 适配层，为 Registry 提供 LLM 大脑
- [[wiki/courses/ai-agent-harness-training/chapter-06-minimal-toolset/06-minimal-toolset-and-yolo-mode]] — 极简工具集法则与 YOLO 模式，讨论工具数量哲学
- [[agent-frameworks/go-tiny-claw-harness-architecture]] — go-tiny-claw 整体架构概览
