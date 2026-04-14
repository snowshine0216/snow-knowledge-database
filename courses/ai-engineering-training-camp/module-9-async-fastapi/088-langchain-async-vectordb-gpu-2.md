---
tags: [langchain, langgraph, async, timeout, retry, faiss, gpu, cuda, vector-database, pytest, python]
source: https://u.geekbang.org/lesson/818?article=927505
wiki: wiki/concepts/088-langchain-async-vectordb-gpu-2.md
---

# 088: LangChain Async Development Advanced — Vector DB and GPU Part 2

**Source:** [8LangChain异步开发进阶向量数据库与GPU2](https://u.geekbang.org/lesson/818?article=927505)

## Outline
- [LangGraph Async Workflow Nodes](#langgraph-async-workflow-nodes)
- [Timeout Decorator for Async Nodes](#timeout-decorator-for-async-nodes)
- [Retry Mechanism with Exponential Backoff](#retry-mechanism-with-exponential-backoff)
- [Pytest for Async Timeout and Retry Testing](#pytest-for-async-timeout-and-retry-testing)
- [Faiss Vector Database: CPU vs GPU](#faiss-vector-database-cpu-vs-gpu)
- [GPU Availability Detection and Graceful Degradation](#gpu-availability-detection-and-graceful-degradation)
- [Module 9 Summary](#module-9-summary)

---

## LangGraph Async Workflow Nodes

LangGraph工作流支持异步化，但异步节点容易出现**超时**问题（比同步更难定位）。解决方案：给异步节点包裹超时装饰器，明确捕获 `TimeoutError`。

```python
import asyncio
from langgraph.graph import StateGraph

async def get_weather_node(state):
    await asyncio.sleep(3)  # 模拟慢速外部服务
    return {"weather": "sunny"}

# 构建图
builder = StateGraph(dict)
builder.add_node("get_weather", get_weather_node)
graph = builder.compile()

# 带超时的调用
try:
    result = await asyncio.wait_for(graph.ainvoke({}), timeout=5.0)
except asyncio.TimeoutError:
    print("Workflow timed out")
```

---

## Timeout Decorator for Async Nodes

为不同节点设置个性化超时时间的装饰器方案：

```python
import asyncio
import functools

# 超时配置表
TIMEOUT_CONFIG = {
    "get_weather": 2.0,   # 天气节点2秒超时
    "default": 5.0,        # 默认5秒超时
}

def with_timeout(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        node_name = func.__name__
        timeout = TIMEOUT_CONFIG.get(node_name, TIMEOUT_CONFIG["default"])
        try:
            return await asyncio.wait_for(func(*args, **kwargs), timeout=timeout)
        except asyncio.TimeoutError:
            raise TimeoutError(f"操作超时（节点: {node_name}, 超时时间: {timeout}秒）")
    return wrapper

@with_timeout
async def get_weather(state):
    await asyncio.sleep(3)  # 会超时
    return {"weather": "sunny"}
```

**注意**：装饰的是异步函数，所以装饰器内部必须也是 `async`，且用 `await` 调用。节点名称匹配的是函数名，不是LangGraph中的节点注册名。

---

## Retry Mechanism with Exponential Backoff

超时后应自动重试，而不是直接失败。重试配置：

```python
from dataclasses import dataclass
import random

@dataclass
class RetryConfig:
    max_attempts: int = 3       # 最大尝试次数
    base_delay: float = 2.0     # 基础延迟（秒）
    max_delay: float = 30.0     # 最大延迟上限
    use_exponential: bool = True # 使用指数退避
    use_jitter: bool = True      # 使用抖动（防止惊群效应）
    retryable_exceptions: tuple = (TimeoutError,)
```

**指数退避 + 抖动**（防止所有请求同时重试压垮服务器）：

```python
def calculate_delay(attempt: int, config: RetryConfig) -> float:
    if config.use_exponential:
        delay = config.base_delay * (2 ** attempt)
    else:
        delay = config.base_delay

    # 抖动：在 0.8~1.2 倍范围内随机
    if config.use_jitter:
        delay *= random.uniform(0.8, 1.2)

    # 限制最大延迟
    return min(delay, config.max_delay)
```

**两层装饰器叠加**（超时保护 + 自动重试）：

```python
@with_retry(RetryConfig(max_attempts=3, base_delay=2.0))
@with_timeout
async def get_weather(state):
    ...
```

叠加顺序重要：先超时保护（内层），再重试（外层），确保每次尝试都有独立的超时时限。

---

## Pytest for Async Timeout and Retry Testing

使用 `pytest-asyncio` 测试异步函数：

```python
import pytest
import importlib
import sys

# 处理含中文或数字开头的模块名
loader = importlib.machinery.SourceFileLoader('retry_module', './088-retry.py')
module = loader.load_module()

@pytest.mark.asyncio
async def test_timeout_then_retry():
    """第一次超时，第二次成功"""
    result = await module.get_weather({"attempt": 0})
    assert result is not None
    assert "weather" in result

@pytest.mark.asyncio
async def test_immediate_timeout():
    """直接超时，不重试"""
    with pytest.raises(TimeoutError):
        await asyncio.wait_for(module.slow_node({}), timeout=1.0)
```

**断言 vs 异常**：

| 特性 | `assert` | `raise/try-except` |
|------|----------|-------------------|
| 用途 | 仅测试代码 | 生产代码 |
| 可关闭 | 是（优化模式） | 否 |
| 语义 | "这不可能发生" | "捕获并处理错误" |

断言只用于测试，不写入正式业务逻辑（因为CPython/PyPy可以在运行时关闭断言）。

---

## Faiss Vector Database: CPU vs GPU

向量相似度检索是异步解决不了的性能瓶颈 — 它是**计算密集型**，而非IO密集型。

**Faiss** 支持两种索引：

| 模式 | 特点 | 适用场景 |
|------|------|---------|
| CPU IndexFlatIP | 单线程串行 | 开发测试、无GPU环境 |
| GPU IndexFlatIP | 数千并行CUDA核 | 生产环境，大规模检索 |

性能对比：
- CPU：几百次/秒，延时较高
- GPU：数万次/秒，延时极低

**GPU加速仅对向量相似度计算有效**，其他操作（如数据导入）不一定受益。

---

## GPU Availability Detection and Graceful Degradation

```python
import faiss
import subprocess

def detect_gpu() -> int:
    """返回可用GPU数量，0表示仅CPU"""
    try:
        # 先尝试NVIDIA-SMI
        subprocess.run(["nvidia-smi"], check=True, capture_output=True)
        return faiss.get_num_gpus()
    except Exception:
        return 0

def build_faiss_index(dimension: int):
    """自动降级：优先GPU，不支持则回退CPU"""
    ngpus = detect_gpu()

    cpu_index = faiss.IndexFlatIP(dimension)

    if ngpus > 0:
        try:
            res = faiss.StandardGpuResources()
            gpu_index = faiss.index_cpu_to_gpu(res, 0, cpu_index)
            print(f"Using GPU index (GPUs available: {ngpus})")
            return gpu_index
        except Exception as e:
            print(f"GPU init failed, falling back to CPU: {e}")

    print("Using CPU index")
    return cpu_index
```

判断GPU是否可用的通用方法：执行 `nvidia-smi`，成功则GPU可用，报错则回退CPU。

---

## Module 9 Summary

第九章（模块9）完整内容总结：

1. **基础**：Python异步编程原理，asyncio、async/await语法
2. **对比**：协程 vs 多线程 vs 多进程的选择策略
3. **性能工具**：cProfile（开发）和 py-spy（生产）
4. **混合架构**：进程池 + 协程工厂模式处理混合任务
5. **Web集成**：FastAPI RESTful设计、Pydantic验证、WebSocket
6. **存储集成**：asyncpg、SQLAlchemy异步ORM、Redis缓存、令牌桶限流
7. **LangChain异步**：LCEL Runnable接口同步改异步、批量并发
8. **回调与追踪**：Callback机制、LangSmith、LangChain 1.0中间件
9. **LangGraph**：异步节点超时控制、指数退避重试
10. **向量数据库**：Faiss GPU加速与自动降级

核心结论：**异步（async/await）解决IO密集型并发；GPU解决计算密集型（向量检索）性能**。两者互补，而非互替。

---

## Connections
- → [[087-langchain-async-vectordb-gpu-1]]
- → [[089-module-10-start]]
