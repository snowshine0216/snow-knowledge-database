---
tags: [langchain, async, lcel, runnable, callback, langgraph, langsmith, python, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927504
wiki: wiki/concepts/087-langchain-async-vectordb-gpu-1.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在 LangChain 中，如果想把一个同步的 `chain.invoke()` 调用改成异步，你认为需要修改哪些地方？
2. `asyncio.gather()` 在并发执行多个 LLM 请求时有什么优势？与串行执行相比，性能差异大概是多少？
3. 你觉得 LangSmith 这类链路追踪工具，底层是通过什么机制来监听每个链组件的执行状态的？

---

# 087: LangChain Async Development Advanced — Vector DB and GPU Part 1

**Source:** [7LangChain异步开发进阶向量数据库与GPU1](https://u.geekbang.org/lesson/818?article=927504)

## Outline
- [LangChain Version Strategy](#langchain-version-strategy)
- [Sync to Async Migration: LCEL Runnable Interface](#sync-to-async-migration-lcel-runnable-interface)
- [Async Concurrent Execution with LangChain](#async-concurrent-execution-with-langchain)
- [Wrapping Sync Chains as Async](#wrapping-sync-chains-as-async)
- [LangChain Callback Mechanism](#langchain-callback-mechanism)
- [LangSmith Tracing Integration](#langsmith-tracing-integration)
- [LangChain 1.0 Middleware vs Callbacks](#langchain-10-middleware-vs-callbacks)

---

## LangChain Version Strategy

LangChain版本差异巨大，需明确区分：

| 版本 | 层次 | 特点 |
|------|------|------|
| LangChain 0.1.x | 底层 | 经典链式API，LCEL |
| LangGraph | 中间层 | 工作流图，条件分支 |
| LangChain 1.0 | 高层 | 基于LangGraph封装，更简洁的Agent API |

**版本选择建议**：
- 维护中的旧项目（0.1.x）：**不要升级**，差异太大
- 新项目：直接使用 LangChain 1.0
- 复杂工作流（需要条件跳转、循环）：使用 LangGraph
- 超复杂场景 LangGraph 解决不了：回退到经典 LangChain 0.x（LangChain 1.x Classic模式）

---

## Sync to Async Migration: LCEL Runnable Interface

**关键规则**：凡是实现了 `Runnable` 接口的组件，内部已自动支持异步，不需要手动加 `a` 前缀。

同步 → 异步改造只需两步：
1. 在函数定义前加 `async`
2. 调用处加 `await`，`invoke` 改为 `ainvoke`

```python
# 同步写法
result = chain.invoke({"input": "你好"})

# 异步写法（仅改这两处）
result = await chain.ainvoke({"input": "你好"})
```

**为什么LCEL链不需要加 `a`**：
```python
# 这条链不需要改，因为所有 Runnable 组件内部已支持异步
chain = prompt | llm | output_parser  # Runnable 接口保证异步支持
result = await chain.ainvoke(input)   # 只有调用处加 await
```

对比 0.x 中 `stream` → `astream`，`call` → `acall`，1.0 中统一为 `invoke` → `ainvoke`。

---

## Async Concurrent Execution with LangChain

**批量数据清洗场景**：同时发起多个LLM请求，使用 `asyncio.gather` 并发执行。

```python
import asyncio

async def process_batch(items: list[str]) -> list[str]:
    tasks = [chain.ainvoke({"input": item}) for item in items]
    results = await asyncio.gather(*tasks)
    return results
```

一次性发起5个任务示例：
```python
chains = [make_chain() for _ in range(5)]
results = await asyncio.gather(*[c.ainvoke(input) for c in chains])
```

串行 vs 并行性能差异显著：5个请求并行执行时间 ≈ 1个请求时间，而串行需要5倍时间。

---

## Wrapping Sync Chains as Async

如果已有同步函数不想修改，可以在外面做异步封装，而不破坏原函数：

```python
# 原有同步函数（不修改）
def make_chain():
    return prompt | llm | output_parser

# 异步封装（不改原函数）
async def async_make_chain(input_data):
    chain = make_chain()
    return await chain.ainvoke(input_data)  # Runnable支持ainvoke

# 并发执行
results = await asyncio.gather(*[async_make_chain(item) for item in items])
```

好处：原函数的测试不受影响，迁移风险低。

---

## LangChain Callback Mechanism

回调机制允许监听LangChain链的完整生命周期，最初为 LangSmith 设计。

**4个核心回调点**：

| 回调函数 | 触发时机 |
|---------|---------|
| `on_chain_start` | 链开始执行 |
| `on_chain_end` | 链执行完成 |
| `on_llm_start` | 大模型开始推理 |
| `on_llm_end` | 大模型返回结果 |

（另有 `on_tool_start/end`、`on_agent_action/finish`）

```python
from langchain.callbacks.base import AsyncCallbackHandler
import time

class TimingCallback(AsyncCallbackHandler):
    def __init__(self):
        self.times = {}

    async def on_chain_start(self, serialized, inputs, **kwargs):
        self.times["chain_start"] = time.time()

    async def on_chain_end(self, outputs, **kwargs):
        elapsed = time.time() - self.times["chain_start"]
        print(f"Chain completed in {elapsed:.2f}s")

    async def on_llm_start(self, serialized, prompts, **kwargs):
        self.times["llm_start"] = time.time()

    async def on_llm_end(self, response, **kwargs):
        elapsed = time.time() - self.times["llm_start"]
        print(f"LLM completed in {elapsed:.2f}s")
```

挂载方式：
```python
callback = TimingCallback()
result = await chain.ainvoke(input, config={"callbacks": [callback]})
```

---

## LangSmith Tracing Integration

LangSmith 就是基于回调机制构建的可视化追踪平台，展示：
- 整个链的开始/结束时间
- 每个组件（Prompt、LLM、OutputParser）的耗时
- 每步的 input/output 内容

意义：可基于回调机制自建类似 LangSmith 的监控系统，向 webhook 推送事件，或集成到自有平台。

---

## LangChain 1.0 Middleware vs Callbacks

LangChain 1.0 的最大变化：将回调机制标准化为**中间件**：

| 特性 | LangChain 0.x | LangChain 1.0 |
|------|---------------|---------------|
| 生命周期钩子 | 手动实现 Callback 类 | 内置中间件 |
| 挂载方式 | `config={"callbacks": [...]}` | `add_middleware(...)` |
| 可用钩子 | 手动定义 | `before_agent`, `after_model` 等内置 |

1.0 已将之前需要自己写的 Callback 封装进框架，写业务逻辑更简洁。如果1.0 不够，降级到 LangGraph；LangGraph 不够，再降级到 Classic LangChain 0.x。

---

## Connections
- → [[086-fastapi-deep-integration-2]]
- → [[088-langchain-async-vectordb-gpu-2]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 请用自己的话解释：为什么 LCEL 链（如 `prompt | llm | output_parser`）在改造为异步时，不需要修改链的构建代码，只需修改调用处？
2. 描述 LangChain 回调机制的4个核心回调点及各自触发时机，并说明如何将自定义回调挂载到链的执行中。
3. LangChain 1.0 与 0.x 在版本选择策略上有何不同？什么场景该用 LangGraph，什么时候应该回退到 Classic 0.x？

<details>
<summary>答案指南</summary>

1. 凡是实现了 `Runnable` 接口的组件，内部已自动支持异步；链的构建本身不涉及执行，只有调用处需要加 `async`/`await`，将 `invoke` 改为 `ainvoke`。
2. 四个核心回调点：`on_chain_start`（链开始执行）、`on_chain_end`（链执行完成）、`on_llm_start`（大模型开始推理）、`on_llm_end`（大模型返回结果）；挂载方式为 `await chain.ainvoke(input, config={"callbacks": [callback]})`。
3. 维护中的旧项目（0.1.x）不要升级；新项目直接用 LangChain 1.0；需要条件跳转/循环的复杂工作流用 LangGraph；LangGraph 解决不了的超复杂场景才回退到 Classic LangChain 0.x。

</details>
