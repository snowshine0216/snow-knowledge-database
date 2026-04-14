---
tags: [asyncio, await, awaitable, magic-methods, event-loop, python, bytecode, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927499
---

# Async Programming Core Concepts Part 2

This lecture goes deeper into asyncio internals, explaining the Awaitable protocol through `__await__` magic methods, manually driving coroutine execution with `next()` to reveal the event loop's mechanism, and examining Python bytecode (`YIELD_VALUE`) to understand how `await` works at the interpreter level. It also presents performance benchmarking results comparing sync, async, threading, and multiprocessing approaches with key metrics for evaluating AI service throughput.

## Key Concepts

- **Awaitable 协议**: 实现了 `__await__` 方法的对象均可被 `await`，包括协程、Task、Future 和自定义类
- **魔术方法（Magic Methods / Dunder Methods）**: Python 中以双下划线开头和结尾的特殊方法，如 `__init__`、`__await__`、`__iter__`
- **`__await__`**: 使自定义类可被 `await` 的魔术方法，返回迭代器；遇到 `yield` 时交出控制权
- **YIELD_VALUE**: asyncio 在字节码层面的核心指令，`await` 最终编译为此指令
- **dis 模块**: Python 标准库，反汇编函数/协程为字节码，用于深入理解执行机制
- **StopIteration**: 协程执行完毕时抛出的异常，事件循环以此判断协程结束
- **吞吐率（QPS）**: 单位时间处理请求数，决定服务器成本
- **P99 延迟**: 99% 请求响应时间，>500ms 用户可感知卡顿

## Key Takeaways

- 任何实现了 `__await__` 的类都是 Awaitable，可与 async/await 无缝集成
- 事件循环本质是不断调用 `next()` 推进协程，直到抛出 `StopIteration`
- Python 3.4～3.7 各版本异步 API 差异显著，维护老项目需了解历史版本特性
- 实测：异步 IO 和多线程在中等并发下吞吐率相近；高并发下 asyncio 优势更大
- 协程上下文切换开销约为线程的 1/4（无内核态进入）
- AI 服务性能测试核心指标：吞吐率（QPS）+ P99 延迟

## See Also

- [[081-async-core-concepts-1]]
- [[083-parallel-mechanisms-1]]
