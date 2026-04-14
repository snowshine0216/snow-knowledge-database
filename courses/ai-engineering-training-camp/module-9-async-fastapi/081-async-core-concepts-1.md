---
tags: [asyncio, async, await, coroutine, event-loop, python, concurrency, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927498
wiki: wiki/concepts/081-async-core-concepts-1.md
---

# 081: Async Programming Core Concepts and Principles Part 1

**Source:** [1核心概念与底层原理1](https://u.geekbang.org/lesson/818?article=927498)

## Outline
- [Module Overview: Why Async Programming](#module-overview-why-async-programming)
- [Processes, Threads, and Coroutines](#processes-threads-and-coroutines)
- [Evolution of Python Async: yield to async/await](#evolution-of-python-async-yield-to-asyncawait)
- [async and await Mechanics](#async-and-await-mechanics)
- [Event Loop and asyncio.run](#event-loop-and-asynciorun)
- [When to Use AsyncIO vs Threading vs Multiprocessing](#when-to-use-asyncio-vs-threading-vs-multiprocessing)
- [Async in Jupyter Notebooks](#async-in-jupyter-notebooks)
- [asyncio.gather and Task Creation](#asynciogather-and-task-creation)

---

## Module Overview: Why Async Programming

模块 9 聚焦 **Python 异步编程**，主要内容：
- `asyncio` 框架的核心概念与使用
- 异步编程 vs 多线程 vs 多进程的对比
- 在 FastAPI、LangChain、LangGraph 中如何正确使用异步编程
- 性能分析与测试方法

**目标**：在 AI 工程中，大模型框架代码之外还需要嵌入业务逻辑，如何让这些业务逻辑以异步方式运行，是本模块核心。

---

## Processes, Threads, and Coroutines

三个并发抽象层级，从重到轻：

| 层级 | 隔离性 | 内存 | 切换开销 | 切换控制 |
|------|--------|------|----------|----------|
| **进程** | 完全隔离（独立内存空间） | 独立 | 最大（需保存整套环境变量） | 操作系统 |
| **线程** | 共享进程内存 | 共享 | 中等（切换线程标志） | 操作系统（时间片） |
| **协程** | 同一线程内 | 共享 | 最小（无需内核态切换） | 程序员手动（`await` 声明） |

**类比**：进程切换如同"将直播设备全部撤走换成游戏手柄，再换回来"；线程切换只需要"切换标志位"；协程切换甚至不需要切换，只需暂停到 `await` 点。

**协程（coroutine）= 轻量级线程**，Python 使用 `async` / `await` 关键字实现。

---

## Evolution of Python Async: yield to async/await

Python 异步支持的演进历史：

```
Python 早期
└── yield（只能输出数据，无法接收）
    └── yield from（可双向传递数据，但语法怪异）
        └── 重构：asyncio.coroutine 装饰器（Python 3.4）
            └── async def / await（Python 3.5+，现代写法）
```

**各版本关键特性**：

| Python 版本 | 异步特性 |
|-------------|--------|
| 2.x | 无原生异步支持 |
| 3.4 | `asyncio.coroutine` 装饰器，`yield from` |
| 3.5 | `async def` / `await` 语法正式引入 |
| 3.6 | 异步生成器、异步推导式 |
| 3.7+ | `asyncio.run()` 正式支持，API 稳定 |

---

## async and await Mechanics

**同步 vs 异步对比**：

```python
# 同步写法（串行，总耗时 = 各任务时间之和）
def task(name, duration):
    print(f"{name} 开始")
    time.sleep(duration)  # 阻塞等待
    print(f"{name} 完成")

task("下载", 2)
task("处理", 2)
task("保存", 2)  # 总耗时 6 秒

# 异步写法（并行，总耗时 ≈ 最长任务时间）
async def task(name, duration):
    print(f"{name} 开始")
    await asyncio.sleep(duration)  # 让出控制权，不阻塞
    print(f"{name} 完成")

# 并发执行，总耗时约 2 秒
await asyncio.gather(task("下载", 2), task("处理", 2), task("保存", 2))
```

核心机制：
- `async def`：声明该函数为协程函数（可异步执行）
- `await`：遇到 IO 操作时，主动让出控制权给事件循环
- 让出后，事件循环调度其他就绪的协程运行
- IO 完成后，事件循环将控制权归还给原协程

---

## Event Loop and asyncio.run

**为什么需要事件循环**：

协程不能自己驱动自己。当遇到 `await` 交出控制权后，需要有一个"调度器"持续监听哪些协程已经就绪，并决定谁继续执行。这个调度器就是**事件循环（Event Loop）**。

```python
# 必须通过 asyncio.run() 或事件循环来驱动协程
async def main():
    await asyncio.gather(task("A"), task("B"))

# 方式一：asyncio.run（Python 3.7+，推荐）
asyncio.run(main())

# 方式二：手动获取事件循环（旧风格）
loop = asyncio.get_event_loop()
loop.run_until_complete(main())
```

**不能直接调用协程函数**：`main()` 只返回协程对象，不执行任何代码，必须传入事件循环才能运行。

---

## When to Use AsyncIO vs Threading vs Multiprocessing

**选择决策树**：

```
任务类型？
├── IO 密集型（网络请求、文件读写、数据库查询）
│   ├── 高并发 → asyncio（协程，开销最小）
│   └── 低并发 → threading（线程，代码更简单）
├── CPU 密集型（大量计算）
│   └── multiprocessing（多进程，每个进程占一个 CPU 核心）
└── 混合型（既有 IO 又有计算）
    └── ProcessPool + asyncio（多进程内跑协程）
```

**各方案开销对比**：
- 进程切换开销 >> 线程切换开销 >> 协程切换开销（约 4 倍差距）
- 协程 CPU 时间更高（几乎全在用户态干活，无内核态切换等待）
- 线程的切换时间被消耗在内核态上下文切换上

**使用限制**：
- 协程数量理论上无限制（轻量）
- 线程数量有限（系统资源限制）
- 进程数量最少，但 CPU 利用率最高（真正并行）

---

## Async in Jupyter Notebooks

在 Jupyter Notebook 中使用 `asyncio` 需要特殊处理：

```python
# Jupyter 自身维护事件循环，直接使用 asyncio.run() 会报错
# 解决方案：使用 nest_asyncio

import nest_asyncio
nest_asyncio.apply()  # 允许嵌套事件循环

# 之后可以正常使用异步代码
await main()
```

原因：Jupyter 本身是一个协程环境，有自己的事件循环。直接创建新的 `asyncio.run()` 会产生"嵌套事件循环"冲突，`nest_asyncio` 解决了这个问题。

---

## asyncio.gather and Task Creation

将协程封装为任务并并发执行：

```python
import asyncio

async def fetch_data(url):
    await asyncio.sleep(5)  # 模拟网络 IO
    return f"Data from {url}"

async def main():
    urls = ["http://a.com", "http://b.com"]

    # 方式一：asyncio.gather（推荐，简洁）
    results = await asyncio.gather(*[fetch_data(url) for url in urls])

    # 方式二：显式创建 Task
    tasks = [asyncio.create_task(fetch_data(url)) for url in urls]
    results = await asyncio.gather(*tasks)

    return results

asyncio.run(main())
```

**关键约束**：
- 异步函数必须被包含在另一个 `async` 函数中才能使用 `await`
- 所有异步代码的"入口"必须通过 `asyncio.run()` 启动
- 使用 `asyncio.sleep()` 而非 `time.sleep()`（后者会阻塞整个线程）

---

## Connections
- → [[080-log-collection-system]]
- → [[082-async-core-concepts-2]]
