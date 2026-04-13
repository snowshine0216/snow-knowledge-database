---
tags: [langchain, lcel, runnable, python, chain, operator-overloading, async, streaming]
source: https://u.geekbang.org/lesson/818?article=927450
---

# LangChain LCEL 与 Runnable 体系

LangChain Expression Language（LCEL）是 LangChain 的核心链式语法，基于 Python 操作符重载实现，让 AI 管道的构建直观且可组合。

## Key Concepts

### Pipe 操作符与魔术方法

`|` 操作符是 LCEL 的核心，底层调用 Python 的 `__or__` 魔术方法。当左侧对象未定义 `__or__` 时，Python 自动尝试右侧对象的 `__ror__`，从而允许普通函数作为链头无缝接入：

```python
chain = pre_process | prompt | model | parser
```

`|` 创建 `RunnableSequence`，数据始终从左向右流动。

### Runnable 对象体系

LangChain 中所有核心组件（`PromptTemplate`、LLM、`OutputParser`）均继承自 `Runnable`，统一暴露以下执行接口：

| 方法 | 说明 |
|------|------|
| `invoke(input)` | 同步调用，阻塞等待结果 |
| `ainvoke(input)` | 异步调用，优先 asyncio，降级多线程 |
| `stream(input)` | 同步流式输出 |
| `astream(input)` | 异步流式输出 |
| `batch(inputs)` | 批量处理，一次性提交多个输入 |

每个 `Runnable` 对象都有 `input_schema` 和 `output_schema` 属性，可用于类型检查和 API 文档生成。

### RunnableParallel

并行执行多个独立的链，结果以字典形式返回：

```python
from langchain_core.runnables import RunnableParallel

parallel = RunnableParallel({
    "summary":  summary_chain,
    "keywords": keyword_chain,
})
```

### RunnableLambda

将普通 Python 函数包装为 `Runnable`，接入 LCEL 管道：

```python
from langchain_core.runnables import RunnableLambda

chain = RunnableLambda(lambda x: x.upper()) | model
```

### RunnableBranch（条件分支）

```python
from langchain_core.runnables import RunnableBranch

branch = RunnableBranch(
    (lambda x: x["type"] == "question", qa_chain),
    default_chain,
)
```

## Key Takeaways

- LCEL 的 `|` 语法是 Python `__or__` 魔术方法的重载，本质上创建 `RunnableSequence`
- 所有 LangChain 组件都是 `Runnable` 子类，统一支持同步/异步/流式/批处理四种调用模式
- 生产环境推荐使用 `ainvoke` + `astream`，大模型调用是网络 IO，天然适合异步
- 超过两个节点且有复杂分支时，改用 [[langchain-agent-architecture|LangGraph]]
- 并行（`RunnableParallel`）和分支（`RunnableBranch`）是链之上的封装，层级不同

## See Also

- [[langchain-error-handling-patterns]] — 链的错误处理与降级策略
- [[intent-recognition-pipeline]] — 意图识别流水线，大量使用 LCEL
- [[008-langchain-core-components]] — LangChain 核心组件概述
