---
tags: [python, async, concurrency, multiprocessing, coroutine, performance-profiling, cprofile, pyspy]
source: https://u.geekbang.org/lesson/818?article=927501
wiki: wiki/concepts/084-parallel-mechanisms-2.md
---

# 084: Python Parallel Mechanisms Comparison Analysis Part 2

**Source:** [4并行机制对比分析2](https://u.geekbang.org/lesson/818?article=927501)

## Outline
- [Review: Async vs Multithreading vs Multiprocessing](#review-async-vs-multithreading-vs-multiprocessing)
- [Performance Profiling Tools Overview](#performance-profiling-tools-overview)
- [cProfile: Deep Profiling](#cprofile-deep-profiling)
- [py-spy: Lightweight Production Profiling](#py-spy-lightweight-production-profiling)
- [Flame Graphs](#flame-graphs)
- [Mixed Workload: Process Pool + Coroutine Hybrid](#mixed-workload-process-pool--coroutine-hybrid)
- [Factory Pattern for Task Dispatch](#factory-pattern-for-task-dispatch)
- [Optimization Strategy](#optimization-strategy)

---

## Review: Async vs Multithreading vs Multiprocessing

模块9的核心主题是Python异步编程与大模型结合时的注意事项：

- **协程（asyncio）**：在同一线程内通过事件循环调度多个任务，切换效率最高
- **多线程**：受GIL限制，CPython中多线程不是真正并行；适用于IO密集型（低并发）
- **多进程**：可真正并行，适用于CPU密集型任务

核心经验规则：

| 任务类型 | 推荐方案 |
|----------|----------|
| CPU密集型（纯计算） | 多进程 |
| IO密集型（低并发） | 多线程 |
| IO密集型（高并发） | asyncio协程 |
| 混合型 | 多进程 + 协程组合 |

---

## Performance Profiling Tools Overview

实际工作中很少遇到纯CPU密集或纯IO密集的场景，往往是**混合型**。需要性能测量工具确认瓶颈位置。

Python两大性能分析工具：

- **cProfile**：侵入式，适合开发期深度分析，性能损耗约10%
- **py-spy**：无侵入式，适合生产环境实时监控，支持容器内进程

---

## cProfile: Deep Profiling

**核心能力**：热点函数识别（找出累计耗时最长的函数）

关键原则：优化影响最大的那段代码，而非最容易优化的。类比：北京飞硅谷的航班时间，而非两端的打车时间。

```python
import cProfile

class AsyncProfiler:
    def __init__(self):
        self.profiler = cProfile.Profile()

    def enable(self):
        self.profiler.enable()

    def disable(self):
        self.profiler.disable()
```

使用方式：
1. 开启 `profiler.enable()`
2. 连续执行3次任务（去头去尾取平均）
3. 关闭 `profiler.disable()`
4. 输出热点函数列表，按耗时降序排列

**注意**：cProfile有约10%性能损耗，只能在开发环境使用，不能用于生产。

---

## py-spy: Lightweight Production Profiling

**特点**：无侵入式，可附加到正在运行的进程，支持容器环境

安装：`pip install py-spy`

常用命令：
```bash
# 实时top视图（类似linux top）
py-spy top --pid <PID>

# 生成火焰图
py-spy record -o profile.svg --pid <PID>
```

适合场景：生产环境中想知道哪些函数占用CPU最多，不需要重启服务。

---

## Flame Graphs

火焰图解读规则：
- **越靠上**的函数运行时间越长
- **颜色越深**的函数CPU开销越大
- 框架代码（如asyncio事件循环）占大头说明业务性能良好

两个工具对比：

| 特性 | cProfile | py-spy |
|------|----------|--------|
| 侵入性 | 高（~10%损耗） | 无侵入 |
| 适用环境 | 开发 | 生产 |
| 火焰图 | 需配合matplotlib | 原生支持 |
| 容器支持 | 否 | 是 |

---

## Mixed Workload: Process Pool + Coroutine Hybrid

真实业务往往同时包含计算任务（CPU密集）和网络请求（IO密集）。解决方案：**进程池 + 协程组合**。

模拟场景：
- **爬虫任务** → IO密集 → 协程处理
- **斐波那契计算** → CPU密集 → 多进程处理

示例结构（P21系列代码拆分为多个模块）：
- `factory.py` — 进程工厂和任务注册
- `schedule.py` — 任务调度（IO用协程，CPU用进程池）
- `processor.py` — IO处理器和CPU处理器实现
- `strategies.py` — HTTP请求、文件处理、计算策略

Windows注意事项：多进程需使用 `spawn` 方式启动，需在 `if __name__ == '__main__':` 中调用。

---

## Factory Pattern for Task Dispatch

```python
# schedule.py 核心逻辑
async def process_task(task):
    task_type = get_task_type(task)
    if task_type == "io":
        return await io_processor.process(task)
    elif task_type == "cpu":
        return cpu_processor.process(task)  # 提交到进程池
```

进程池创建（基于 `concurrent.futures.ProcessPoolExecutor`）：
```python
from concurrent.futures import ProcessPoolExecutor

executor = ProcessPoolExecutor(max_workers=4)
```

协程调度器负责：将不同类型的任务路由到对应的处理器，实现进程池和协程的协作。

---

## Optimization Strategy

发现大模型应用慢的两种典型场景：

1. **模型思考过程无反馈**：用户看不到进展，体感很慢
   - 解决：提前给用户中间状态反馈

2. **工具调用过程无反馈**：大模型调用工具时用户端无任何响应
   - 解决：告知用户正在调用哪些工具

性能阈值参考：
- \>500ms：用户开始有感知
- \>5s：用户明显感受到缓慢

优化路径（使用py-spy定位）：IO瓶颈 → 定位是Redis、MySQL还是文件 → 查找慢查询 → 检查索引。

---

## Connections
- → [[083-parallel-mechanisms-1]]
- → [[085-fastapi-deep-integration-1]]
