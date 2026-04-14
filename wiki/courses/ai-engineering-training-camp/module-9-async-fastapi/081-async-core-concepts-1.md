---
tags: [asyncio, async, await, coroutine, event-loop, python, concurrency, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927498
---

# Async Programming Core Concepts Part 1

This lecture introduces Python's asyncio framework from first principles, tracing the evolution from `yield` to `async/await`, explaining the three-way comparison between processes, threads, and coroutines, and demonstrating how the event loop drives coroutine execution. It covers when to choose asyncio vs threading vs multiprocessing for AI engineering workloads, and handles the special case of using asyncio inside Jupyter notebooks.

## Key Concepts

- **协程（Coroutine）**: 轻量级线程，在同一线程内运行；遇到 IO 主动让出控制权，切换开销约为线程的 1/4
- **async def**: 声明函数为协程函数的关键字，使其可以被 `await` 调用
- **await**: 遇到 IO 操作时让出控制权给事件循环的关键字，等价于"主动暂停"
- **事件循环（Event Loop）**: 协程调度器，持续监听协程就绪状态并决定谁继续执行
- **asyncio.run()**: 驱动顶层协程执行的入口函数（Python 3.7+），创建并运行事件循环
- **asyncio.gather()**: 并发执行多个协程并等待所有结果的工具函数
- **nest_asyncio**: 解决 Jupyter Notebook 嵌套事件循环冲突的库

## Key Takeaways

- 协程 = 同一线程内的轻量级并发，切换完全在用户态，无内核态开销
- 进程/线程切换由 OS 时间片决定；协程切换由程序员通过 `await` 手动控制
- yield → yield from → asyncio.coroutine → async/await 是 Python 异步的历史演进路径
- 协程必须被包含在 async 函数中，并通过 `asyncio.run()` 启动
- 选择依据：IO 密集 + 高并发 → asyncio；IO 密集 + 低并发 → threading；CPU 密集 → multiprocessing
- Jupyter 中使用 asyncio 需安装并应用 nest_asyncio，否则会产生事件循环冲突

## See Also

- [[080-log-collection-system]]
- [[082-async-core-concepts-2]]
- [[083-parallel-mechanisms-1]]
