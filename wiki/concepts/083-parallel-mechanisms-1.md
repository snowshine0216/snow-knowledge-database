---
tags: [asyncio, threading, multiprocessing, gil, concurrent-futures, python, numpy, concurrency, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927500
---

# Parallel Mechanisms Comparison Part 1

This lecture provides a systematic comparison of Python's parallel execution models—asyncio, threading, and multiprocessing—through the `concurrent.futures` API and live benchmarks. The centerpiece is a rigorous demonstration of the GIL (Global Interpreter Lock) proving that Python multithreading is fake parallelism for CPU-bound tasks, along with techniques to bypass the GIL using NumPy's C-extension layer. Context switch cost measurements confirm coroutines are ~4x cheaper than threads.

## Key Concepts

- **GIL（Global Interpreter Lock，全局解释器锁）**: CPython 解释器中的互斥锁，同一时刻只允许一个线程执行 Python 字节码，导致多线程无法真正并行
- **伪多线程**: Python 多线程因 GIL 限制，CPU 密集任务无法利用多核，只能交替运行
- **concurrent.futures**: Python 标准库，提供 `ThreadPoolExecutor` 和 `ProcessPoolExecutor` 的统一高级接口
- **Future 对象**: 代表异步执行结果的容器，支持回调和异常处理
- **NumPy C 扩展绕过 GIL**: NumPy 计算在 C 层级执行，不受 Python GIL 约束，可实现真正多线程并行
- **上下文切换（Context Switch）**: 从一个线程/协程切换到另一个所需的开销；协程完全在用户态，约为线程开销的 1/4
- **vmstat / top**: Linux 系统监控命令，通过 us/sy/wa/st 字段判断任务是 CPU 密集型还是 IO 密集型

## Key Takeaways

- GIL 存在于 CPython 解释器层，无法修改，造成多线程在 CPU 密集任务上无加速效果
- IO 密集型多线程有效（IO 等待时自动释放 GIL）；CPU 密集型多线程无效（需改用多进程）
- NumPy/PyTorch/TensorFlow 底层用 C/CUDA 实现，计算时绕过 GIL，可实现真正并行
- 协程切换开销约为线程的 1/4；高 CPU 时间表示程序"真正在干活"，不是性能差的信号
- 决策框架：IO 高并发→asyncio；IO 低并发→threading；CPU 计算→multiprocessing；混合→ProcessPool+asyncio
- 用 `vmstat` 或 `top` 中的 `wa`（IOWait）和 `us`（User CPU）判断瓶颈类型

## See Also

- [[082-async-core-concepts-2]]
- [[081-async-core-concepts-1]]
