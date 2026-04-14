---
tags: [langchain, lcel, runnable, python, chain, async, streaming, operator-overloading]
source: https://u.geekbang.org/lesson/818?article=927450
wiki: wiki/concepts/langchain-lcel-runnable.md
---

# 034: 3LangChain链的解析1

**Source:** [3LangChain链的解析1](https://u.geekbang.org/lesson/818?article=927450)

## Outline
- [LCEL 核心语法：| 操作符与魔术方法](#lcel-核心语法pipe-操作符与魔术方法)
- [Runnable 对象体系](#runnable-对象体系)
- [invoke / ainvoke / stream / batch](#invoke--ainvoke--stream--batch)
- [RunnableParallel 与分支](#runnableparallel-与分支)
- [RunnableLambda](#runnablelambda)
- [错误处理与容错机制](#错误处理与容错机制)
- [标签与元数据](#标签与元数据)
- [最佳实践](#最佳实践)
- [Connections](#connections)

---

## LCEL 核心语法：pipe 操作符与魔术方法

LangChain Expression Language（LCEL）的核心语法依赖 Python 的**操作符重载**机制。`|` 符号实质上调用的是对象的 `__or__` 魔术方法（dunder method）。

```python
# | 操作符底层等价于：
a | b  ↔  a.__or__(b)
```

当左侧对象未定义 `__or__` 时，Python 会自动尝试右侧对象的 `__ror__`（reverse or），从而允许自定义的预处理函数作为链头，而无需手动实现 `__or__`：

```python
# pre_process 是普通函数，没有 __or__，
# prompt 定义了 __ror__，自动完成连接
chain = pre_process | prompt | model | parser
```

**数据流始终从左向右执行**，即使是通过 `__ror__` 连接的节点也不例外。

### 链的本质

`|` 操作符创建的是 `RunnableSequence`，将多个组件串联，数据依次从左侧流向右侧。等价写法：

```python
# LCEL 写法
chain = prompt | model | parser

# 等价的显式 RunnableSequence 写法
from langchain_core.runnables import RunnableSequence
chain = RunnableSequence(first=prompt, last=RunnableSequence(first=model, last=parser))
```

---

## Runnable 对象体系

LangChain 中所有常用组件（`PromptTemplate`、LLM、OutputParser）都是 `Runnable` 的子类：

```
BasePromptTemplate  ──────────────────┐
BaseLLM / BaseChatModel ──────────────┤──> 均继承 Runnable
BaseOutputParser ────────────────────-┘
```

每个 `Runnable` 对象都暴露两个 schema 属性，可用于类型检查和 API 文档生成：

```python
chain.input_schema.schema()   # 查看输入类型结构
chain.output_schema.schema()  # 查看输出类型结构
```

`Runnable` 基类实现了所有运行方式的核心逻辑：同步调用、异步调用、批处理、流式输出、并行等均通过它来扩展。

---

## invoke / ainvoke / stream / batch

### 同步调用

```python
result = chain.invoke({"input": "你好"})
```

### 异步调用（ainvoke）

`ainvoke` 是 `invoke` 的非阻塞版本，优先使用 `asyncio`；若异步不可用则降级为多线程：

```python
import asyncio

async def main():
    result = await chain.ainvoke({"input": "你好"})

asyncio.run(main())
```

**推荐场景**：存在网络 IO 阻塞（如调用远程大模型 API）时使用异步，多用户并发场景性能提升显著。

### 流式输出（stream / astream）

```python
# 同步流式
for chunk in chain.stream({"input": "你好"}):
    print(chunk, end="", flush=True)

# 异步流式
async for chunk in chain.astream({"input": "你好"}):
    print(chunk, end="", flush=True)
```

底层使用 Python 的异步生成器（async generator）实现。`astream` 实质上封装了 `ainvoke`。

### 批处理（batch）

```python
inputs = [
    {"input": "报告A"},
    {"input": "合同B"},
    {"input": "邮件C"},
]
results = chain.batch(inputs)
```

适合需要批量处理大量文档的场景，避免逐条请求的开销。

---

## RunnableParallel 与分支

当需要**并行执行多个链**（而不是顺序执行链中的单个步骤）时，使用 `RunnableParallel`：

```python
from langchain_core.runnables import RunnableParallel

parallel_chain = RunnableParallel({
    "summary": summary_chain,
    "keywords": keyword_chain,
    "sentiment": sentiment_chain,
})

result = parallel_chain.invoke({"input": "这段文本需要同时分析"})
# result = {"summary": ..., "keywords": ..., "sentiment": ...}
```

### 条件分支

```python
from langchain_core.runnables import RunnableBranch

branch = RunnableBranch(
    (lambda x: x["type"] == "question", qa_chain),
    (lambda x: x["type"] == "summary", summary_chain),
    default_chain,
)
```

**注意**：并行和分支操作与普通链方法不同，它们在链之上增加了一层封装，属于不同的抽象层级。复杂的多层分支建议改用 LangGraph。

---

## RunnableLambda

将普通 Python 函数包装为 `Runnable` 对象，使其可以无缝插入 LCEL 链中：

```python
from langchain_core.runnables import RunnableLambda

def pre_process(text: str) -> str:
    return text.upper()

# 包装为 Runnable
runnable_pre = RunnableLambda(pre_process)

chain = runnable_pre | model
result = chain.invoke("hello world")
```

---

## 错误处理与容错机制

### Fallback（回退）

当主模型失败时，自动切换到备用模型：

```python
primary_model = ChatTongyi(model="qwen-max")
fallback_model = ChatTongyi(model="qwen-plus")

# 为主模型设置 fallback
robust_model = primary_model.with_fallbacks([fallback_model])

chain = prompt | robust_model | parser
```

### 重试（RunnableRetry）

```python
chain_with_retry = chain.with_retry(
    retry_if_exception_type=(Exception,),
    stop_after_attempt=3,
)
```

### 超时控制

```python
chain_with_timeout = chain.with_config({"run_name": "my_chain", "timeout": 30})
```

### 多层降级（Python try/except 模式）

```python
def process_with_fallback(user_input: dict) -> str:
    try:
        # 第一层：主模型
        return primary_chain.invoke(user_input)
    except Exception as e:
        logger.warning(f"主模型失败: {e}")
        try:
            # 第二层：备用模型
            return fallback_chain.invoke(user_input)
        except Exception as e2:
            logger.error(f"备用模型失败: {e2}")
            # 第三层：兜底响应
            return "当前系统繁忙，请联系人工客服。"
```

**指数退避（Exponential Backoff）**可通过装饰器实现，第一次重试等待 1 秒，第二次 2 秒，第三次 4 秒。

---

## 标签与元数据

### 添加标签（with_tags）

标签仅对开发者可见，不影响业务数据：

```python
chain_with_tag = chain.with_config(tags=["production", "v2"])
```

**类比**：给书加了书签，书签与书的内容无关。

### 添加元数据（with_config）

元数据会混入业务数据的 metadata 层，业务系统可见：

```python
chain_with_meta = chain.with_config(
    metadata={"version": "2.0", "environment": "prod"}
)
```

**类比**：在目录页备注了一笔，目录是书本内容的一部分。

> 建议优先使用标签而非元数据，避免破坏原始数据的完整性。

---

## 最佳实践

1. **明确类型定义**：在定义链时标注 `input_schema` 类型，程序扩大后便于排查问题。
2. **谨慎使用并行**：并行执行难以排查问题，且前后有依赖关系的链不能并行。
3. **添加错误处理**：生产环境至少要有主模型 → 备用模型 → 简单响应三层降级。
4. **使用异步**：大模型调用天然是网络 IO，优先使用 `ainvoke` / `astream`。
5. **何时用 LangGraph**：超过两个节点、且工作流中需要条件判断或多层分支时，改用 LangGraph。

---

## Connections
- → [[langchain-lcel-runnable]]
- → [[langchain-agent-architecture]]
