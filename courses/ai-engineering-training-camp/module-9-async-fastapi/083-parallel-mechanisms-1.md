---
tags: [asyncio, threading, multiprocessing, gil, concurrent-futures, python, concurrency, numpy, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927500
wiki: wiki/concepts/083-parallel-mechanisms-1.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. Python 的 GIL（全局解释器锁）是什么？你认为它为什么会存在，对多线程有什么影响？
2. `ThreadPoolExecutor` 和 `ProcessPoolExecutor` 分别适合什么类型的任务？请各举一个例子。
3. 协程（asyncio）和线程在上下文切换上有什么本质区别？你认为哪个更"轻量"？

---

# 083: Parallel Mechanisms Comparison and Analysis Part 1

**Source:** [3并行机制对比分析1](https://u.geekbang.org/lesson/818?article=927500)

## Outline
- [Overview: concurrent.futures API](#overview-concurrentfutures-api)
- [ThreadPoolExecutor and ProcessPoolExecutor](#threadpoolexecutor-and-processpoolexecutor)
- [GIL: The Global Interpreter Lock](#gil-the-global-interpreter-lock)
- [Proving GIL with Code: IO vs CPU Benchmarks](#proving-gil-with-code-io-vs-cpu-benchmarks)
- [GIL Release Conditions](#gil-release-conditions)
- [Bypassing GIL with NumPy](#bypassing-gil-with-numpy)
- [Context Switch Cost: Coroutines vs Threads](#context-switch-cost-coroutines-vs-threads)
- [Decision Guide: Which Parallel Model to Use](#decision-guide-which-parallel-model-to-use)

---

## Overview: concurrent.futures API

`concurrent.futures` 是 Python 标准库中专门用于并行执行的高级接口，将多线程和多进程抽象为统一的 `Executor` 接口：

```python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

# 统一接口：线程池和进程池使用方式完全相同
with ThreadPoolExecutor(max_workers=3) as executor:
    futures = [executor.submit(io_task, i) for i in range(5)]

with ProcessPoolExecutor() as executor:  # 默认按 CPU 核数创建进程
    futures = [executor.submit(cpu_task, i) for i in range(5)]
```

**特性**：
- 统一的 `Future` 对象作为异步执行结果
- 支持 `callback`（完成回调）
- 支持异常处理
- 编写难度比裸 `asyncio` 更低

**推荐原则**：尽量使用框架（FastAPI、LangChain）而非手写线程/进程管理；框架已内置并行处理，手写容易踩坑。

---

## ThreadPoolExecutor and ProcessPoolExecutor

两种 Executor 的适用场景：

| 类型 | 适用任务 | 示例 |
|------|---------|------|
| `ThreadPoolExecutor` | IO 密集型 | 网络请求、文件读写、数据库查询 |
| `ProcessPoolExecutor` | CPU 密集型 | 大数运算、图像处理、数据转换 |

```python
import concurrent.futures
import math

def cpu_intensive(n):
    """CPU 密集型：计算大数平方根"""
    return sum(math.sqrt(i) for i in range(n))

def io_simulated(delay):
    """IO 密集型：模拟网络等待"""
    import time
    time.sleep(delay)
    return f"IO 完成，等待 {delay}s"

# 线程池处理 IO 任务
with ThreadPoolExecutor(max_workers=3) as executor:
    io_futures = [executor.submit(io_simulated, 1) for _ in range(5)]
    io_results = [f.result() for f in concurrent.futures.as_completed(io_futures)]

# 进程池处理 CPU 任务
with ProcessPoolExecutor() as executor:
    cpu_futures = [executor.submit(cpu_intensive, 1_000_000) for _ in range(4)]
    cpu_results = [f.result() for f in concurrent.futures.as_completed(cpu_futures)]
```

---

## GIL: The Global Interpreter Lock

**GIL（Global Interpreter Lock，全局解释器锁）** 是 Python 最被诟病的特性之一，存在于 CPython 解释器中。

**产生原因**：
- Python 引入多线程时，为了保护**引用计数器**（内存管理）
- 引入 GIL 使解释器底层实现更简单（单线程写法）
- 代价：**多线程无法真正并行**

**直接后果**：
- Python 多线程是**伪多线程**——可以并发，但不能真正并行
- 同一时刻只有一个线程持有 GIL，其他线程等待
- 对 IO 密集型任务影响小（IO 等待时释放 GIL）
- 对 CPU 密集型任务影响大（计算时不释放 GIL）

```
线程1 [运行] ─── IO 等待（释放 GIL）───────── [恢复运行]
线程2          [争抢 GIL，获得] ─── [运行] ─── [IO 等待，释放]
线程3                                          [争抢 GIL，获得] ─── [运行]
```

GIL 在 Python 解释器层级，**不可修改**。

---

## Proving GIL with Code: IO vs CPU Benchmarks

实验验证 GIL 对多线程的影响：

```python
import threading
import time
import math

NUM_THREADS = 3

def io_task():
    time.sleep(1)  # IO 密集：释放 GIL

def cpu_task():
    sum(math.sqrt(i) for i in range(100_000))  # CPU 密集：持有 GIL

# 测试 IO 密集型多线程
start = time.time()
threads = [threading.Thread(target=io_task) for _ in range(NUM_THREADS)]
for t in threads: t.start()
for t in threads: t.join()
io_time = time.time() - start
# 理想：1 秒（三线程并行 Sleep）
# 实际：约 1 秒 ✓（IO 任务释放 GIL，真正并发）

# 测试 CPU 密集型多线程
start = time.time()
threads = [threading.Thread(target=cpu_task) for _ in range(NUM_THREADS)]
for t in threads: t.start()
for t in threads: t.join()
cpu_time = time.time() - start
# 理想：0.09 秒（三线程并行计算）
# 实际：约 0.27 秒 ✗（GIL 导致串行执行，无加速）
```

**结论**：
- IO 密集型 → 多线程**有效**（加速比约等于线程数）
- CPU 密集型 → 多线程**无效**（GIL 阻止真正并行）

---

## GIL Release Conditions

GIL 在以下情况会**自动释放**（允许线程切换）：

| 触发条件 | 说明 |
|---------|------|
| `time.sleep()` | 睡眠时释放，其他线程可运行 |
| `socket.recv()` | 网络接收数据时释放 |
| 文件读写（I/O syscall）| 系统调用时释放 |
| 系统级 `wait_pid` | 等待子进程时释放 |
| `asyncio.sleep()` | 异步睡眠（最常见） |
| 时间片耗尽 | 运行超过一定时间自动释放（每隔 ~5ms 或 100 字节码指令） |

注意：在 CPU 密集计算中加 `time.sleep()` 可以触发线程切换，但并不能加速——只是让 GIL 切换，不是真正并行。

---

## Bypassing GIL with NumPy

**绕过 GIL 的条件**：使用 C 扩展库，在 C 层级执行计算（不受 Python GIL 影响）。

典型例子：**NumPy**（底层 C 实现）

```python
import numpy as np
import threading
import math

def pure_python_task(n):
    """纯 Python 计算，受 GIL 限制"""
    return sum(math.sqrt(a**2 + b**2) for a, b in zip(range(n), range(n)))

def numpy_task(n):
    """NumPy 计算，在 C 层执行，绕过 GIL"""
    a = np.arange(n, dtype=np.float64)
    b = np.arange(n, dtype=np.float64)
    return np.sqrt(a**2 + b**2).sum()

# 对比单线程性能
# NumPy 单线程：约 0.09s
# 纯 Python 单线程：约 0.19s（约 2x 差距）

# 对比 4 线程并行
# NumPy 4线程：约 0.16s（接近线性加速，加速比 ~2.0）
# 纯 Python 4线程：约 0.74s（GIL 限制，加速比 ~1.04）
```

**结论**：
- NumPy 等 C 扩展库在 C 层级执行，完全绕过 GIL
- 多线程 + NumPy 可以实现真正的 CPU 并行
- 对于 AI/ML 工作负载，PyTorch / TensorFlow 同理（C++/CUDA 层执行）

**局限**：仅限于数值计算场景；爬虫、数据处理等"业务逻辑"无法绕过。

---

## Context Switch Cost: Coroutines vs Threads

实测协程 vs 线程的上下文切换开销：

```python
# 实验结论（基准测试）
# 协程上下文切换次数 ≈ 线程切换次数 × 4
# 协程单次切换开销 ≈ 线程单次切换开销 / 4

# 解释：
# - 线程切换需进入内核态（kernel mode），有等待时间
# - 协程切换完全在用户态（user mode），直接调度

# 协程 CPU 时间比较高 ≠ 性能差
# 高 CPU 时间 = 大部分时间在真正干活（用户态 CPU）
# 线程 CPU 时间偏低 = 时间被消耗在内核态上下文切换等待
```

**常见表述**："协程的开销是线程的 1/4"即来源于此——4 倍的切换次数、4 倍的切换效率。

---

## Decision Guide: Which Parallel Model to Use

完整决策路径：

```
任务类型判断（通过 Linux top/vmstat 命令）
├── CPU 使用率（us）高 → CPU 密集型
│   ├── 纯计算（可用 NumPy/PyTorch）→ threading + NumPy（绕 GIL）
│   └── 纯 Python 计算 → multiprocessing（多进程）
├── IOWait（wa）高 → IO 密集型
│   ├── 高并发（1000+ QPS）→ asyncio（协程）
│   └── 低并发（<100 QPS）→ threading（线程，更简单）
└── 混合型（CPU + IO）→ ProcessPool + asyncio
    每个进程内跑事件循环，IO 用协程，计算用进程
```

**Linux 监控命令参考**：
- `vmstat`：查看 CPU us/sy/id/wa 分布
- `top`：实时查看进程 CPU 用量
  - `us`：用户态 CPU（程序在计算）
  - `sy`：内核态 CPU（系统调用/进程切换）
  - `wa`：IO 等待时间
  - `st`：Stolen CPU（云主机虚拟化抢占）

**云主机注意事项**：若发现 `st`（Stolen）较高，需关注云主机实际可用 CPU 资源，避免误判为应用层问题。

---

## Connections
- → [[082-async-core-concepts-2]]
- → [[084-parallel-mechanisms-2]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用实验数据解释为什么"Python 多线程对 IO 密集型有效，对 CPU 密集型无效"——具体说明基准测试中 3 线程跑 `time.sleep(1)` 和跑数学计算的实际耗时结果及原因。
2. NumPy 为什么能绕过 GIL 实现真正的多线程并行？这个能力有什么局限性，哪些场景无法受益？
3. 根据本课的决策路径，如果 `vmstat` 显示 `wa`（IO 等待）很高且并发量超过 1000 QPS，应该选择哪种并行模型？如果是纯 Python CPU 计算且无法用 NumPy，又该选哪种？

<details>
<summary>答案指南</summary>

1. IO 密集型（`time.sleep(1)`）：3 线程实际耗时约 1 秒，接近理想值——因为 IO 等待时线程会释放 GIL，其他线程可同时运行。CPU 密集型（大数求平方根）：3 线程实际耗时约 0.27 秒，是单线程的 3 倍而非 1/3——GIL 强制线程串行执行，完全没有加速效果。
2. NumPy 底层用 C 实现，计算在 C 层级执行，不受 Python GIL 管辖；4 线程跑 NumPy 加速比约 2.0，而纯 Python 4 线程加速比仅约 1.04。局限：只对数值计算有效，爬虫、业务逻辑等纯 Python 代码无法绕过 GIL。
3. 高并发 IO 密集型（`wa` 高、QPS > 1000）应选 `asyncio` 协程；纯 Python CPU 密集型应选 `multiprocessing` 多进程，因为多进程每个进程有独立 GIL，才能真正并行计算。

</details>
