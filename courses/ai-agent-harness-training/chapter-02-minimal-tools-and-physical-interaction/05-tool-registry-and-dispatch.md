---
tags: [ai-agent, harness-engineering, go, tool-registry, dispatch, function-calling]
source: https://time.geekbang.org/column/article/969870
wiki: wiki/courses/ai-agent-harness-training/chapter-02-minimal-tools-and-physical-interaction/05-tool-registry-and-dispatch.md
---

# 第 05 讲：动作延伸 — 构建强扩展性的 Tool Registry 与分发机制

**课程：** AI Agent 工程化训练营（Tony Bai）
**章节编号：** 05
**专栏章节：** 第二章 · 极简工具与物理交互（Action & Tools）

---

## Pre-Test — 带着问题进入

> [!question]- 📋 进入前自测（Pre-Test）
>
> **题目 1：** Tool Registry 在 go-tiny-claw 架构中充当什么角色？它的三个核心职责是什么？
>
> **题目 2：** `Registry.Execute` 方法在找不到工具时，以及工具执行返回 error 时，分别如何处理？为什么不能直接 panic？
>
> **题目 3：** `read_file` 工具在实现时加入了 8000 字符截断防线。这解决了什么问题？它有什么局限性？工业级替代方案是什么？

---

## 章节元信息

| 字段 | 内容 |
|------|------|
| 讲次 | 05 |
| 作者 | Tony Bai |
| 核心主题 | Tool Registry 设计、BaseTool 接口、路由分发、read_file 工具实现 |
| 新增文件 | `internal/tools/registry.go`、`internal/tools/read_file.go` |
| 修改文件 | `cmd/claw/main.go` |
| 前置知识 | 第 04 讲 Provider 适配层、schema.ToolCall / ToolResult 数据结构 |
| 后续关联 | 第 12 讲（Context Compaction）、第 14–15 讲（重试防线） |

---

## Cornell Notes

### Cue Column（关键问题 / 关键词）

- 为什么不能在 Main Loop 里 if-else 分派工具？
- Tool Registry 的三个核心职责
- `BaseTool` 接口定义了哪些方法？
- `registryImpl` 如何实现 O(1) 路由？
- 工具未找到时的错误语义：`IsError: true`
- `read_file` 的防御三件套
- 8000 字符截断的局限与工业替代方案
- `workDir` 注入的作用

---

### Notes Column（讲义核心知识点）

#### 1. 架构动机：为什么需要 Tool Registry？

Harness 理念中 **Main Loop 是"瞎子"**：它不知道 `bash` 怎么调用，也不知道 `read_file` 需要什么参数。它只负责维持上下文，并把模型输出的 JSON 字符串丢给执行层。

如果在 Main Loop 里用 `if-else` 或 `switch-case` 硬编码每个工具，面对成百上千工具时代码迅速变成不可维护的垃圾山。因此，引入 **Tool Registry** 作为核心中间件，充当 **Hub（集线器）** 与 **Router（路由器）**。

#### 2. Tool Registry 的三大核心职责

| 职责 | 英文名 | 具体行为 |
|------|--------|---------|
| 动态挂载 | Register | 引擎启动时插拔实现了 `BaseTool` 接口的 Go 结构体 |
| 描述暴露 | Expose Schema | 每次推理前把所有工具的 `ToolDefinition`（含 JSON Schema）打包给 Provider |
| 路由分发 | Dispatch & Execute | 收到 `ToolCall` → 查 map → 调对应工具 `Execute` → 返回 `ToolResult` |

解耦效果：添加新工具只需写独立文件 + `Register`，**Main Loop 零修改**。

#### 3. `BaseTool` 接口（`internal/tools/registry.go`）

```go
type BaseTool interface {
    Name() string
    Definition() schema.ToolDefinition
    Execute(ctx context.Context, args json.RawMessage) (string, error)
}
```

- `Name()` — 全局唯一名称，大模型通过此名字调用
- `Definition()` — 返回 `schema.ToolDefinition`，含 `Name`、`Description`、`InputSchema`（JSON Schema）
- `Execute()` — 接收 `json.RawMessage`（原始字节流），反序列化由各工具内部自行完成

#### 4. `Registry` 接口与 `registryImpl` 实现

```go
type Registry interface {
    Register(tool BaseTool)
    GetAvailableTools() []schema.ToolDefinition
    Execute(ctx context.Context, call schema.ToolCall) schema.ToolResult
}

type registryImpl struct {
    tools map[string]BaseTool  // Key = tool.Name()，O(1) 路由查找
}
```

**`Register` 方法行为：**
- 检测重名：若已存在，打印 Warning 日志后覆盖（不 panic，不 fatal）
- 成功挂载打印 `[Registry] 成功挂载工具: <name>`

**`Execute` 方法的三步路由分发：**
1. **路由查找**：`r.tools[call.Name]` — 找不到则返回 `schema.ToolResult{IsError: true}` 并附错误文本（告知模型幻觉调用，让它在下一 Turn 自纠）
2. **执行工具**：`tool.Execute(ctx, call.Arguments)` — 把原始 JSON 字节直接传给工具
3. **封装结果**：无论成功或 error，统一封装为 `schema.ToolResult{ToolCallID, Output, IsError}`

> `IsError: true` 的语义价值：模型读到错误输出后会在下一 Turn 尝试修正参数（Self-Correction 能力），而不是简单终止。

#### 5. `read_file` 工具（`internal/tools/read_file.go`）

**结构体：**
```go
type ReadFileTool struct {
    workDir string  // 注入引擎的 WorkDir，限制操作边界
}
```

**`Definition()` 的 `InputSchema`（JSON Schema）：**
```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "要读取的文件路径，如 cmd/claw/main.go"
    }
  },
  "required": ["path"]
}
```

**`Execute()` 的四步防御链：**

| 步骤 | 行为 | 失效时 |
|------|------|--------|
| 1. 延迟解析 | `json.Unmarshal` 到 `readFileArgs{Path string}` | 返回 error → Registry 告知模型 JSON 格式错误 |
| 2. 路径拼接 | `filepath.Join(workDir, input.Path)` | （注意：生产环境需加路径穿越检测，防 `../../etc/passwd`） |
| 3. 物理 I/O | `os.Open` + `io.ReadAll` | 返回 error → Registry 告知模型文件不存在 |
| 4. 硬截断保护 | `maxLen = 8000`；超长则截断 + 附提示消息 | 防止大文件撑爆 Context 窗口 |

截断提示格式：`"…[由于内容过长，已被系统截断至前 8000 字节]…"`

#### 6. main.go 接入流程

```go
workDir, _ := os.Getwd()
llmProvider := provider.NewZhipuOpenAIProvider("glm-4.5-air")
registry := tools.NewRegistry()
registry.Register(tools.NewReadFileTool(workDir))
eng := engine.NewAgentEngine(llmProvider, registry, workDir, false)
eng.Run(ctx, "请读取 hello.txt 并总结内容")
```

**运行时日志流：**
1. `[Registry] 成功挂载工具: read_file`
2. Turn 1：模型决策调用 `read_file{"path":"hello.txt"}`
3. Registry 路由 → `ReadFileTool.Execute` → 物理 I/O → 返回 120 字节
4. Turn 2：模型读取 `ToolResult` 输出自然语言总结
5. `模型未请求调用工具，任务宣告完成`

#### 7. 硬截断的局限与工业级替代方案

**局限：** 若文件有 20000 行，模型永远看不到后半部分，导致任务必然失败。

**工业方案一：Tool Call Offloading（工具输出卸载）**
- 超过阈值时，Harness 自动把完整内容写入磁盘临时目录
- 向模型返回"头部预览 + 尾部预览 + 路径引用"的摘要消息
- 模型按需调用 `read_file('<path>')` 局部读取

**工业方案二：全局 Context Compaction（第 12 讲揭秘）**
- Main Loop 监控 Token 使用量，接近预设阈值（75%~98%）时触发 Compaction
- 对历史会话进行智能摘要，保留高价值信息（架构决策、未解决 Bug），裁剪冗余工具输出
- 使 Agent 在不丢失关键上下文的前提下持续长时运行

---

### Summary（本讲核心总结）

Tool Registry 是 Harness 的核心中间件，通过 `BaseTool` 接口约束 + `map[string]BaseTool` 实现 O(1) 路由，彻底解耦 Main Loop 与具体工具实现。`read_file` 工具展示了驾驭工程的防御底线思维：路径边界限制、参数延迟解析、错误语义化反馈、以及 8000 字符物理截断。Harness 的真谛是：**绝不把系统安全性寄希望于大模型的理智，而是在底层执行层强制兜底。**

---

## Key Takeaways

> [!info]+ 💡 Explanation — Tool Registry 解耦架构

Registry 在 Main Loop 与具体工具之间扮演绝缘层角色。Main Loop 只调用 `registry.Execute(ctx, call)`，完全不知道 `call.Name` 背后是文件读取、终端命令还是微服务 API。这种"瞎子 Main Loop + 全知 Registry"模式是 Harness 横向扩展能力的基础——新增工具不触碰任何已有代码。

**关键设计决策：**
- `BaseTool.Execute` 接收 `json.RawMessage` 而非 `map[string]interface{}`：各工具可定义强类型参数结构体，Go 编译器帮你检查字段，而不是在运行时 panic
- `ToolResult.IsError` 是 bool 而非 error interface：跨越 Go 边界向模型传递错误语义，让模型在下一 Turn 自纠，而不是让 Go 程序崩溃
- `workDir` 注入给 `ReadFileTool`：工具级别的物理边界限制，不依赖操作系统权限，避免模型越权读取系统文件

**驾驭工程底线思维：**
大模型是"冲动且无知"的——它不知道文件有多大，也不关心 Token 成本。所有可能导致 OOM 或超支的风险，**必须在工具执行层被死死按住**，不能依赖模型的"理智"。

---

## Knowledge Graph Seeds

- `BaseTool` 接口 → implements → `ReadFileTool`
- `registryImpl.tools` → `map[string]BaseTool` → O(1) dispatch
- `Registry.Execute` → receives `schema.ToolCall` → returns `schema.ToolResult`
- `ToolResult.IsError = true` → triggers → Model Self-Correction in next Turn
- `ReadFileTool.workDir` → constrains → physical I/O boundary
- Hard Truncation (8000 bytes) → prevents → Context explosion / Token OOM
- Tool Call Offloading → industrial upgrade → Hard Truncation
- Context Compaction → Chapter 12 → global-level OOM defense
- `json.RawMessage` args → deferred deserialization → each tool owns its type contract
- Tool Registry → decouples → Main Loop from concrete tool implementations

---

## Notes For Review

- `BaseTool` 接口三方法：`Name() string` / `Definition() schema.ToolDefinition` / `Execute(ctx, json.RawMessage) (string, error)`
- `registryImpl` 内部结构：`tools map[string]BaseTool`，`NewRegistry()` 返回 `Registry` 接口（而非 `*registryImpl`），符合依赖倒置原则
- 路由查找失败的返回值：`schema.ToolResult{ToolCallID: call.ID, Output: errMsg, IsError: true}`（不 panic，让模型感知幻觉调用）
- `readFileArgs` 是工具内部私有结构体，外部不可见（小写包内可见）
- 截断常量 `const maxLen = 8000`（字节，不是字符数）
- 思考题隐含知识：无限制的 Self-Correction 重试 → 潜在死循环 + 成本失控；解决方案在第 14–15 讲揭晓

---

## Post-Test — 学完后验收

> [!question]- 📋 面试题（Post-Test）
>
> **题目 1：** 请解释 `Registry` 接口与 `registryImpl` 结构体的关系，以及为什么 `NewRegistry()` 返回接口类型而非具体类型。
>
> **题目 2：** 当 `Registry.Execute` 接收到一个模型返回的 `ToolCall`，但 `call.Name` 在注册表中不存在时，代码是如何处理的？这种处理方式对大模型 Self-Correction 有什么意义？
>
> **题目 3：** `read_file` 的 8000 字符截断方案在工业级场景下的核心局限是什么？请描述 Tool Call Offloading 机制的工作方式，以及它如何同时保留模型的决策依据又避免 Context 爆炸。

> [!example]- 💡 答案指南（Answer Guide）
>
> **题目 1 - 引导答案思路：**
> `Registry` 是行为接口，`registryImpl` 是其私有实现（小写，包外不可见）。`NewRegistry()` 返回 `Registry` 接口而非 `*registryImpl`，遵循"依赖倒置原则"——调用方（Main Loop、main.go）只依赖接口行为，不依赖具体实现。未来可替换为带缓存、带并发锁、带监控埋点的新实现，调用方零修改。这也是 Go 语言 interface-oriented design 的标准实践。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 查找失败时，`Execute` 立即构造并返回 `schema.ToolResult{ToolCallID: call.ID, Output: "Error: 系统中不存在名为 'xxx' 的工具", IsError: true}`，不 panic 也不 fatal。
> Self-Correction 意义：大模型会把 `ToolResult.Output` 拼入下一 Turn 的 context（标记为 tool role 消息）。模型读到"工具不存在"后，会分析自己是否写错了工具名，尝试在下一 Turn 调用正确的工具或给出更换策略。这正是模型的 Self-Correction 能力——但章节也指出其局限：无防线时可能无限重试导致成本失控，第 14–15 讲引入重试计数器等工业防线。
>
> ---
>
> **题目 3 - 引导答案思路：**
> 核心局限：硬截断使模型永远看不到超过 8000 字节的部分，对于 20000 行的核心业务类，任务必然失败。
> Tool Call Offloading：当文件输出超过阈值时，Harness 自动将完整内容写入磁盘临时目录；向模型返回的 ToolResult 不含完整内容，而是"头部预览 + 尾部预览 + 临时文件路径"的摘要消息，例如"文件过长（共 5000 行，已卸载至 /tmp/xxxx），以下为首尾预览"。模型拿到路径后，可按需调用 `read_file('<path>')` 局部读取感兴趣的部分，实现精准 I/O，既不撑爆 Context 窗口，又保留了完整信息的获取路径。
