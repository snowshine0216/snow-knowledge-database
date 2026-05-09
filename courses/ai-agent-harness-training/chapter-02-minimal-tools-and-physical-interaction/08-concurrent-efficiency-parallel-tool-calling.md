---
tags: [agent-harness, parallel-tool-calling, goroutine, fork-join, concurrency, go-lang, main-loop, harness-engineering]
source: https://time.geekbang.org/column/article/973865
wiki: wiki/ai-engineering/001-concurrent-efficiency-parallel-tool-calling.md
---

## Pre-test

*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 如果大模型在同一个 Turn 中同时返回了 3 个工具调用请求，Harness 引擎应该串行还是并行执行？为什么？
2. Go 语言中，哪个标准库机制可以等待若干个并发 Goroutine 全部结束后才继续主流程？
3. 当多个 Goroutine 需要同时写入同一个切片的不同索引位置时，是否需要加锁？

---

## Chapter Metadata
- Course: AI Agent 实战训练营（从 0 开始构建 Agent Harness）
- Chapter: 001 — 08｜并发提效：如何让 Agent 在单轮中并行调用多个互相独立的工具？
- Author: Tony Bai
- Article ID: 973865

## Cornell Notes

### Cue Column (Questions)
- 什么是"Parallel Tool Calling 的独立性假设"？为什么 Harness 可以无脑并行执行同 Turn 内的多个工具？
- Fork-Join 模式如何从串行 O(N) 优化到并行 O(Max(N)) 耗时？
- 如何在没有 Mutex 锁的情况下，让多个 Goroutine 安全地聚合工具结果并保持顺序？
- 如果模型"犯傻"，在同一个 Turn 对同一文件并发读写，会发生什么？有哪些缓解策略？
- "只读并发、涉写串行"策略如何在正确性和性能间取得平衡？

### Notes Column

**串行 Main Loop 的性能瓶颈**

原始实现中，`internal/engine/loop.go` 的工具分发是一个朴素的 for 循环：

```go
for _, toolCall := range actionResp.ToolCalls {
    result := e.registry.Execute(ctx, toolCall) // 串行阻塞等待
}
```

当前沿模型（Claude 4.x Sonnet、GLM-5.x）原生支持 Parallel Tool Calling——一次 API 返回可以同时带回 4 个 `read_file` 请求——串行执行意味着等 I/O A 结束才能启动 B，白白浪费了并发能力。

---

**Parallel Tool Calling 的独立性假设**

业界顶级 Harness（OpenClaw / Claude Code 内部逻辑）的核心假设：**同一个 Turn（单次 Response）中并行下发的多个工具调用，一定互不依赖**。

原因：经过大量 RLHF 微调的大模型知道，有强先后依赖的操作必须分两个 Turn 完成——Turn 1 输出 `write_file`，等 ToolResult 回传后，Turn 2 才输出 `bash`。如果模型在同一 Turn 下发了存在依赖的工具导致报错，是模型规划失误，按 YOLO + 自纠错哲学原样回传，让模型下一轮自己修正。

→ Harness 的职责：**放开手脚，拥抱并发**。

---

**Fork-Join 重构：核心代码**

修改收敛在 `internal/engine/loop.go`，无需改动 Provider 和 Tools——解耦架构的优势。

```go
import "sync"

// 1. 预分配固定长度切片，每个 Goroutine 操作各自的 idx 坑位
observationMsgs := make([]schema.Message, len(actionResp.ToolCalls))

// 2. WaitGroup 用于 Join
var wg sync.WaitGroup

// 3. Fork：为每个 ToolCall 启动独立 Goroutine
for i, toolCall := range actionResp.ToolCalls {
    wg.Add(1)
    // 必须将 i 和 toolCall 作为参数传入，防止 Go 1.22 前的闭包捕获陷阱
    go func(idx int, call schema.ToolCall) {
        defer wg.Done()
        result := e.registry.Execute(ctx, call)
        observationMsgs[idx] = schema.Message{
            Role:       schema.RoleUser,
            Content:    result.Output,
            ToolCallID: call.ID,
        }
    }(i, toolCall)
}

// 4. Join：等待全部协程完成
wg.Wait()

// 5. 聚合：按原始顺序追加到上下文
for _, obs := range observationMsgs {
    contextHistory = append(contextHistory, obs)
}
```

三个关键工程细节：
- **闭包陷阱**：传参 `(idx int, call schema.ToolCall)` 规避了 Go 1.22 前循环变量被共享捕获的低级错误。
- **无锁设计**：预分配切片让每个 Goroutine 写入专属 idx，不需要 `sync.Mutex`，最大化多核并行效能。
- **顺序对齐**：模型期望 [ResultA, ResultB] 对应 [ToolA, ToolB]，预分配切片天然保留了原始顺序，避免乱序上下文引发模型阅读混乱。

耗时从串行 O(N) 降为 O(Max(N))——面对 I/O 密集型操作（网络抓取、编译命令）可达数量级提升。

> [!info]+ 💡 Deep Dive - 为什么这段 Go 并发代码能又快又稳
>
> **1. 闭包陷阱：为什么必须传 `(idx int, call schema.ToolCall)`**
>
> 在 Go 1.22 之前，`for range` 里的循环变量通常会被复用。若直接在 Goroutine 闭包里引用外层的 `i` 和 `toolCall`，闭包捕获到的往往不是“当前这一轮的值”，而是同一个持续被循环改写的共享变量。
>
> ```go
> for i, toolCall := range actionResp.ToolCalls {
>     go func() {
>         fmt.Println(i, toolCall.ID)
>     }()
> }
> ```
>
> 上面这种写法在 Go 1.22 前容易打印出重复的索引或最后一轮的 `toolCall`。`go func(idx int, call schema.ToolCall) { ... }(i, toolCall)` 的本质不是“参数更优雅”，而是先把当前迭代的值复制成这次调用独有的局部快照，再交给闭包使用。
>
> **2. 无锁设计：为什么 `observationMsgs[idx] = ...` 通常不需要 `sync.Mutex`**
>
> `make([]schema.Message, len(actionResp.ToolCalls))` 先一次性把底层数组分配好，每个 Goroutine 只写自己的固定坑位 `observationMsgs[idx]`。这和并发 `append` 完全不同：
>
> - `observationMsgs[idx] = ...` 只改某个确定元素。
> - `append(observationMsgs, ...)` 会修改共享的 slice header，可能改 `len`、触发扩容、搬迁底层数组。
>
> 因此这套写法成立的前提是：切片长度固定、每个 `idx` 只有一个 writer、所有读取都发生在 `wg.Wait()` 之后。满足这三个条件时，多个 Goroutine 虽然共享同一个底层数组，但写入的是不同元素，不需要再用 `Mutex` 把结果汇总阶段串行化。
>
> **3. 为什么 `append + mutex` 往往更慢**
>
> 若把结果收集写成 `results = append(results, value)`，即使你提前估好了容量，也仍然要同步保护，因为所有 Goroutine 都在竞争同一个共享切片头。`sync.Mutex` 会把这段逻辑重新串行化：
>
> - 每个 worker 都要排队进入临界区。
> - 高并发下会有锁竞争、阻塞唤醒和 cache 同步开销。
> - 一旦扩容，锁内工作会更重，后面的 Goroutine 等得更久。
>
> 预分配切片 + 按 `idx` 写入的价值，就是把“争抢同一个入口”改成“各写各的格子”，尽可能保留多核并行的收益。
>
> **4. `WaitGroup` 不只是等待，它还划定了安全读取边界**
>
> `WaitGroup` 在这里不只是 Join 工具。工程上更重要的一点是：主 Goroutine 必须在 `wg.Wait()` 返回之后再读取 `observationMsgs`。可以把它理解成“全部 worker 已经提交完结果”的同步栅栏；若在 `Wait()` 之前读取切片，就会重新引入 data race 风险。
>
> **5. 两个实践边界：`false sharing` 与 `channel` 取舍**
>
> 即便不同 Goroutine 写的是不同 `idx`，如果这些元素恰好落在同一个 CPU cache line 上，且写入非常高频，仍可能出现 `false sharing`，表现为性能下降而非结果错误。大多数 I/O 密集型工具调用里，这不是首要矛盾；但如果你在热循环里不断更新相邻槽位，就值得 profiling。
>
> 另外，预分配切片适合“任务总数已知、每个任务恰好一个结果、并且要保留原始顺序”的场景；若结果数量不固定、需要流式消费、或者要做多阶段 pipeline，`channel` 往往更自然。切片按 `idx` 写入更像“对号入座”，`channel` 更像“谁先完成谁先上报”。

> [!question]- 📋 Deep Dive Follow-up
>
> **题目 1：** 为什么 `go func() { fmt.Println(i) }()` 在 Go 1.22 前可能打印出一串重复值，而 `go func(i int) { fmt.Println(i) }(i)` 不会？
> 
> **题目 2：** 为什么 `results[idx] = value` 通常不需要加锁，而 `append(results, value)` 通常需要同步保护？
>
> **题目 3：** 在什么场景下，你应该从“预分配切片 + 固定 idx 写入”切换到 `channel` 聚合？

> [!example]- 💡 Deep Dive Answer Guide
>
> **题目 1 - 引导答案思路：**
> Go 1.22 前 `for range` 的循环变量容易被闭包共享捕获。直接引用 `i` 时，多个 Goroutine 看到的可能是同一个被循环反复更新的变量；把 `i` 作为参数传入，相当于在启动 Goroutine 前先复制出当前迭代的快照，每个 Goroutine 拿到的是自己的局部副本。
>
> ---
>
> **题目 2 - 引导答案思路：**
> `results[idx] = value` 只写一个确定元素，前提是切片已预分配、每个索引只有一个 writer、主线程在 `wg.Wait()` 后才读取结果，因此不需要用 `Mutex` 串行化。`append(results, value)` 则会竞争共享的 slice header，可能同时修改 `len`、触发扩容和底层数组搬迁，所以必须显式同步。
>
> ---
>
> **题目 3 - 引导答案思路：**
> 当结果数量不固定、需要谁先完成谁先消费、要构建多阶段 pipeline，或者生产者与消费者之间需要天然背压时，`channel` 更合适。若任务总数固定、每个任务对应一个结果、并且模型需要按原始 ToolCall 顺序回看结果，则预分配切片更简单高效。

---

**数据竞争风险与缓解策略（思维实验）**

若模型"犯傻"，在同一 Turn 同时发起 `edit_file` 和 `read_file` 针对同一文件：

*方案 A — 细粒度文件路径锁（RWMutex）*：在 Registry 层用 `sync.Map` 为每个文件路径维护独立 `RWMutex`。读操作取 `RLock`（允许多读并发），写操作取 `Lock`（完全排他）。但 RWMutex 只保证单次 I/O 的原子性，无法解决跨操作的 TOCTOU（Time of Check to Time of Use）问题——"读-决策-写"序列之间窗口期内数据仍可被并发写入篡改。

*方案 B — 只读并发、涉写串行*：由 Harness 引擎在分发 ToolCall 批次时检查：**若本批次全为只读工具，启用并发 Goroutine；若存在任何写操作，退化为顺序执行**。以极低实现复杂度在绝大多数场景同时保证性能与正确性。

实战说明：本讲重构代码坚持独立性假设，测试用例均使用安全的独立并发读。生产部署若需完整竞争保护，需自行在 `tools` 包补齐文件路径 RWMutex 并评估批次级调度策略。

---

**实测验证**

在工作区创建 a.txt、b.txt、c.txt 三个文件，对大模型下达"同时读取三个文件"指令。终端输出可见三个 Goroutine（Go-0、Go-1、Go-2）**在同一毫秒时间戳内**交错打印——GLM-4.5-air + 慢思考模式下，Turn 1 规划阶段统筹发出 3 个 `read_file` 请求，并发执行总耗时等于最慢单文件读取时间。

**思考题（留存）**：若要为 50 个并发网络请求引入全局最大并发数控制（Semaphore），Go 语言的带缓冲 Channel 是最自然的实现——`sem := make(chan struct{}, maxConcurrency)`，Goroutine 进入前 `sem <- struct{}{}`，退出时 `<-sem`，WaitGroup 聚合能力保持不变。

### Summary

本讲将 go-tiny-claw 的 Main Loop 工具分发从串行升级为 Fork-Join 并发模型。核心依据是"Parallel Tool Calling 独立性假设"——同 Turn 内多工具互不依赖，Harness 无需协调顺序。实现上以预分配切片取代 Mutex 锁，每个 Goroutine 写入专属索引，WaitGroup 聚合，结果顺序与模型原始意图严格对齐。同时通过思维实验探讨了数据竞争的两种缓解方案：文件路径 RWMutex 和"只读并发、涉写串行"批次策略，后者以更低复杂度覆盖绝大多数生产场景。

## Key Takeaways
- **独立性假设是并发的理论基础**：大模型在同 Turn 内并发下发工具，保证它们互相独立——若有依赖则分 Turn 处理。Harness 可无条件并行，错误原样回传让模型自纠错。
- **预分配切片 = 无锁 + 有序**：`make([]schema.Message, len(toolCalls))` 让每个 Goroutine 写入固定 idx，消除 Mutex 开销的同时天然保留结果顺序——比 append 加锁更快、更简洁。
- **闭包传参规避 Go 历史陷阱**：`go func(idx int, call schema.ToolCall)` 而非直接使用循环变量，防止 Go 1.22 前所有 Goroutine 捕获同一变量值。
- **RWMutex 是必要非充分条件**：它保证单次 I/O 原子性，但无法解决 TOCTOU——"读-决策-写"跨操作序列的一致性需要更高层的顺序约束。
- **"只读并发、涉写串行"是实用首选**：引擎层检查批次是否全为只读，是/否分别对应并发/顺序——极低复杂度覆盖绝大多数场景的性能与正确性需求。
- **解耦架构使改动范围极小**：所有核心改造收敛在 `internal/engine/loop.go`，Provider 和 Tools 层零修改——这是前几讲解耦设计的直接红利。

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[Parallel-Tool-Calling]]：大模型在同一 Turn 的单次 Response 中同时返回多个 ToolCall，要求 Harness 并行分发执行。
- [[Independence-Assumption]]：Harness 引擎假设同 Turn 多工具互不依赖，依据是大模型 RLHF 训练保证有依赖的操作分 Turn 下发。
- [[Fork-Join-Pattern]]：并发工程模式——Fork 启动多个 Goroutine 并行工作，Join 用 [[WaitGroup]] 阻塞聚合，总耗时为 O(Max(N))。
- [[WaitGroup]]：`sync.WaitGroup` Go 标准库并发原语，`Add/Done/Wait` 三件套实现 Fork-Join 的 Join 阶段。
- [[Pre-allocated-Slice]]：预先分配固定长度切片，各 Goroutine 写入专属索引，无需 Mutex 即可保证线程安全和结果有序。
- [[Data-Race]]：并发写同一内存区域引发的竞争条件；本讲通过预分配切片在引擎层规避，文件层面的竞争需额外 RWMutex 保护。
- [[TOCTOU]]：Time of Check to Time of Use——"读-决策-写"跨操作序列窗口期内数据被并发改写，RWMutex 无法解决此问题。
- [[Read-Write-Segregation]]：只读并发、涉写串行——引擎层批次级调度策略，以低复杂度平衡性能与正确性。
- [[YOLO-Philosophy]]：全权信任 + 自纠错——工具执行结果原样回传，让模型在下一 Turn 自行修正规划错误。
- [[AgentEngine]]：go-tiny-claw 的核心控制器，持有 [[LLMProvider]] 和 [[Registry]] 接口，本讲重构其 `Run` 方法的工具分发逻辑。

### 2. 课程内导航链接
- [[002-feishu-integration|第 09 讲 打通飞书 IM]]：下一讲将 go-tiny-claw 接入飞书事件流，本讲并发引擎是其性能基础——高并发工具执行让实时 IM 响应不卡顿。

### 3. 课程外与通用概念关联
- [[harness-engineering]]：驾驭工程——本讲是其核心议题之一，Harness 如何调度 LLM 返回的 ToolCall 是引擎设计的关键决策。
- [[openclaw-architecture]]：OpenClaw / Claude Code 内部逻辑采用相同的独立性假设作为并发基础，本讲显式引用其设计哲学。
- [[goroutine-patterns]]：Go 语言并发模式——预分配切片 + WaitGroup 是 Go 处理聚合任务的惯用实践，优于 Mutex + append。

### 4. 推荐关系边
- [[Fork-Join-Pattern]] → implements → [[Parallel-Tool-Calling]]
- [[Independence-Assumption]] → enables → [[Fork-Join-Pattern]]
- [[Pre-allocated-Slice]] → prevents → [[Data-Race]]
- [[Pre-allocated-Slice]] → extends → [[WaitGroup]]
- [[YOLO-Philosophy]] → governs → [[Independence-Assumption]]
- [[Read-Write-Segregation]] → constrains → [[Fork-Join-Pattern]]
- [[RWMutex]] → protects → [[Data-Race]]
- [[RWMutex]] → specializes → [[TOCTOU]]

### 5. 后续值得沉淀成卡片的主题
- [[Parallel-Tool-Calling]]
- [[Independence-Assumption]]
- [[Read-Write-Segregation]]
- [[TOCTOU]]
- [[Semaphore-Channel-Pattern]]

## Notes For Review
- 带缓冲 Channel 实现 Semaphore 的具体代码（思考题答案）值得单独实现验证
- 生产级 RWMutex + 批次调度的组合方案尚未在 go-tiny-claw 中实现，是后续扩展点
- GLM-4.5-air 慢思考模式下是否稳定输出并行 ToolCall 数组值得多场景测试

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 解释"Parallel Tool Calling 的独立性假设"是什么，以及大模型为何能（在大多数情况下）保证这个假设成立？
2. go-tiny-claw 重构后的并发工具分发器使用了哪个核心设计，使其在不加 Mutex 锁的情况下既保证线程安全又保证结果有序？
3. 当并发工具调用可能对同一文件同时进行读写时，文章提出了哪两种方案来规避竞争风险？各自的局限性是什么？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> 独立性假设指：同一个 Turn（单次 LLM Response）中并行下发的多个工具调用，彼此互不依赖，Harness 可以无条件并行执行。大模型经过 RLHF 训练后知道：有先后依赖的操作必须分 Turn 完成——Turn 1 先执行有前置条件的工具，等 ToolResult 回传后 Turn 2 才继续后续操作。若模型犯错，按 YOLO + 自纠错哲学把错误原样回传，模型下一轮自行修正。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 预分配固定长度切片：`observationMsgs := make([]schema.Message, len(actionResp.ToolCalls))`。每个 Goroutine 通过确定的索引 `idx` 写入各自的坑位，不同索引之间无内存竞争，因此不需要 `sync.Mutex`。WaitGroup 等待全部完成后，按切片原始顺序聚合结果——顺序与模型 ToolCall 数组严格对齐。
>
> ---
>
> **题目 3 - 引导答案思路：**
> 方案 A（RWMutex）：在 Registry 层用 `sync.Map` 为每个文件路径维护独立 `RWMutex`，读操作取 `RLock`，写操作取独占 `Lock`。局限：只保证单次 I/O 原子性，无法解决 TOCTOU——"读-决策-写"跨操作序列的窗口期内数据仍可被并发改写。方案 B（只读并发、涉写串行）：Harness 在分发批次前检查是否全为只读工具，是则并发，否则串行。局限：粒度较粗，可能在批次混合只读/写操作时不必要地降级为串行，但实现简单且覆盖绝大多数场景。
