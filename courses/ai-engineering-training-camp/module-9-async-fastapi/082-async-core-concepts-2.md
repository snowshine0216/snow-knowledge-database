---
tags: [asyncio, await, awaitable, magic-methods, event-loop, python, coroutine, bytecode, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927499
wiki: wiki/concepts/082-async-core-concepts-2.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在 Python 中，`await` 关键字后面能跟哪些类型的对象？你认为一个自定义类如果想支持 `await`，需要实现什么？
2. `asyncio.run()` 在底层是如何推进协程执行的？你认为事件循环是通过什么机制让协程"走走停停"的？
3. 在 IO 密集型任务中，异步协程（asyncio）和多线程（threading）的性能你认为哪个更优？差距大吗？

---

# 082: Async Programming Core Concepts and Principles Part 2

**Source:** [2核心概念与底层原理2](https://u.geekbang.org/lesson/818?article=927499)

## Outline
- [The Awaitable Protocol](#the-awaitable-protocol)
- [Magic Methods and __await__](#magic-methods-and-__await__)
- [Manual Coroutine Execution](#manual-coroutine-execution)
- [Python Bytecode and the YIELD_VALUE Instruction](#python-bytecode-and-the-yield_value-instruction)
- [Python Version Compatibility Table](#python-version-compatibility-table)
- [Performance Benchmarking: Sync vs Async vs Threading vs Multiprocessing](#performance-benchmarking-sync-vs-async-vs-threading-vs-multiprocessing)
- [Key Metrics: Throughput and P99 Latency](#key-metrics-throughput-and-p99-latency)
- [Practical Conclusions and Next Steps](#practical-conclusions-and-next-steps)

---

## The Awaitable Protocol

`await` 不仅可以用于 `asyncio` 内置对象，还可以用于**任意自定义类**，前提是该类实现了 `__await__` 魔术方法。

```python
async def main():
    # await 后可以跟：
    # 1. 协程对象（最常见）
    result = await some_async_function()

    # 2. asyncio.Task / asyncio.Future
    task = asyncio.create_task(some_async_function())
    result = await task

    # 3. 实现了 __await__ 的自定义类
    result = await MyAwaitable()
```

**判断是否可 await 的标准**：对象是否实现了 `__await__` 方法（返回迭代器）。

---

## Magic Methods and __await__

Python 类中的**魔术方法（Magic Methods / Dunder Methods）**是一类以双下划线开头和结尾的特殊方法，承担着特定的语义功能：

| 魔术方法 | 触发时机 |
|---------|--------|
| `__init__` | 类实例化时自动调用（初始化方法）|
| `__str__` | `str()` 或 `print()` 时调用 |
| `__add__` | `+` 运算符时调用 |
| `__await__` | `await` 表达式时调用 |
| `__iter__` | `for` 循环或迭代时调用 |

**自定义 Awaitable 示例**：

```python
class MyAwaitable:
    def __await__(self):
        # 返回一个迭代器
        # 遇到 yield 时交出控制权给事件循环
        print("准备让出控制权")
        yield  # 交出控制权的关键点（等价于 IO 等待）
        print("控制权归还，继续执行")
        return "完成"

async def main():
    result = await MyAwaitable()
    print(result)  # "完成"
```

实现原理：
1. `await MyAwaitable()` 自动调用 `__await__` 方法
2. `__await__` 返回迭代器
3. 遇到 `yield` 时，控制权交给事件循环
4. 事件循环调用 `next()` 恢复执行
5. 迭代器耗尽（抛出 `StopIteration`）时协程完成

---

## Manual Coroutine Execution

理解协程底层机制：手动驱动协程执行：

```python
class MyAwaitable:
    def __await__(self):
        yield  # 暂停点
        print("恢复执行")

async def main():
    obj = MyAwaitable()
    await obj

# 手动执行（等价于事件循环的行为）
coro = main()

# 将协程转为迭代器
it = coro.__await__()

# 第一次 next()：运行到第一个 yield 暂停
try:
    next(it)  # 输出：(暂停)
except StopIteration:
    pass

# 第二次 next()：从 yield 后继续执行到结束
try:
    next(it)  # 输出："恢复执行"
except StopIteration:
    pass  # 协程执行完毕

# 再次调用会抛出 StopIteration（协程已结束）
```

这揭示了 `asyncio.run()` 的本质：它就是不断调用 `next()` 推进协程执行，直到 `StopIteration`。

---

## Python Bytecode and the YIELD_VALUE Instruction

通过 `dis` 模块可以查看协程的字节码（Bytecode），了解 `await` 在解释器层面的实现：

```python
import dis

async def example():
    await asyncio.sleep(1)

dis.dis(example)
# 输出包含 YIELD_VALUE 指令
# YIELD_VALUE 的 OPARGS 参数：
# - Python 3.11 以前：表示栈深度（stack depth）
# - Python 3.12+：表示异常块深度（exception block depth）
# 用于异常处理时恢复生成器执行现场
```

**如何查找字节码文档**：
1. 访问 [docs.python.org](https://docs.python.org) 选择对应版本
2. 在标准库中搜索 `dis` 模块
3. 查找具体指令（如 `YIELD_VALUE`）的说明
4. 中文文档措辞有时不精确，建议对照英文版理解

---

## Python Version Compatibility Table

异步编程语法随 Python 版本的演进：

| Python 版本 | 关键特性 | 写法 |
|------------|--------|------|
| 2.x | 无异步支持 | — |
| 3.4 | `asyncio.coroutine` 装饰器 | `@asyncio.coroutine` + `yield from` |
| 3.5 | `async`/`await` 关键字 | `async def` + `await` |
| 3.6 | 异步生成器、异步推导式 | `async for`, `async with` |
| 3.7 | `asyncio.run()` 正式 API | `asyncio.run(main())` |
| 3.10+ | 结构化并发改进 | `asyncio.TaskGroup` |

**重要**：3.4～3.6 版本在部分企业生产环境中仍在使用，了解旧风格写法有助于维护老项目。

---

## Performance Benchmarking: Sync vs Async vs Threading vs Multiprocessing

使用 `rio_io` 基准测试库对四种并发方式进行测试，对比维度：

- 总耗时（Total Time）
- 吞吐率（QPS，requests per second）
- 平均延迟（P99 Latency）
- 内存峰值
- CPU 峰值

```python
# 测试端点（以 HTTP 请求为例）
# 1. 同步请求（requests 库）
# 2. 异步请求（aiohttp 库）
# 3. 多线程（ThreadPoolExecutor）
# 4. 多进程（ProcessPoolExecutor）

# 测试参数
MAX_REQUESTS = 100  # 总请求数
TIMEOUT = 10        # 单次超时 10 秒
CONCURRENT = 4      # 并行度 4
```

**实测结论**（中等并发负载下）：
- **异步 IO** 和**多线程**的吞吐率相差不大
- **多进程**内存占用最高，但对 IO 密集型任务无明显优势
- **协程上下文切换开销**约为线程的 **1/4**（协程约 4x 快）
- 高并发场景下 asyncio 优势更明显

---

## Key Metrics: Throughput and P99 Latency

在 IO 密集场景下，两个最重要的业务指标：

**吞吐率（QPS/Throughput）**
- 决定服务器成本
- QPS 越高 = 单机承载用户越多 = 服务器成本越低
- 直接影响 AI 服务的规模化能力

**P99 延迟（P99 Latency）**
- 影响用户体验
- 延迟 > 500ms：用户可以明显感受到卡顿
- AI 服务中，大模型推理延迟本身较高，要避免应用层额外引入延迟

**通过基准测试评估 AI 服务**：
- 测试大模型服务器在不同并发程度下的吞吐率
- 找到延迟开始显著上升的并发拐点
- 据此决定是否需要扩容或优化

---

## Practical Conclusions and Next Steps

**并发方案选择口诀**：
- IO 密集 + 高并发 → `asyncio`（协程）
- IO 密集 + 低并发 → `threading`（线程，代码更简单）
- CPU 密集 → `multiprocessing`（多进程）
- 混合场景 → `ProcessPool` + `asyncio`（进程池内跑协程）

**课后作业（概念）**：
尝试将多进程（`ProcessPoolExecutor`）和异步协程（`asyncio`）混合，根据任务类型自动路由：
- IO 类型任务 → 用协程处理
- CPU 类型任务 → 用多进程处理

这是构建通用并行处理框架的基础，类似 MapReduce 的思路。

**下一步**：
- 并行机制详细对比分析（线程池、进程池、GIL 绕过）
- asyncio 在 FastAPI / LangChain / LangGraph 中的集成
- 性能测试工具（留到下次课讲）

---

## Connections
- → [[081-async-core-concepts-1]]
- → [[083-parallel-mechanisms-1]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释 Awaitable 协议：一个自定义类要支持 `await`，需要实现什么方法？该方法内部的 `yield` 起到什么作用？
2. 手动驱动协程执行时，你会如何用 `next()` 模拟事件循环的行为？这揭示了 `asyncio.run()` 的本质是什么？
3. 根据本课的基准测试结论，IO 密集、CPU 密集、混合场景分别应选择哪种并发方案？请说明理由。

> [!example]- Answer Guide
> 
> #### Q1 — Awaitable 协议与 `__await__` 方法
> 
> 自定义类须实现 `__await__` 魔术方法并返回一个迭代器；方法内的 `yield` 是交出控制权的关键点，等价于 IO 等待时将执行权让回给事件循环，事件循环再通过 `next()` 恢复执行。
> 
> #### Q2 — 手动驱动协程与事件循环本质
> 
> 手动执行时，先调用协程的 `__await__()` 得到迭代器，再反复调用 `next()` 推进执行，直到抛出 `StopIteration` 表示协程完成；这正是 `asyncio.run()` 的本质——不断调用 `next()` 驱动协程前进。
> 
> #### Q3 — IO/CPU/混合场景并发选型
> 
> IO 密集＋高并发选 `asyncio`（协程上下文切换开销约为线程的 1/4）；IO 密集＋低并发选 `threading`（代码更简单）；CPU 密集选 `multiprocessing`（绕过 GIL）；混合场景则用进程池内跑协程（`ProcessPool` + `asyncio`）。
