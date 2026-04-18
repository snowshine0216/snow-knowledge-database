---
tags: [tool-calling, hot-reload, langgraph, importlib, watchdog, caching, retry, plugin-system]
source: https://u.geekbang.org/lesson/818?article=927458
wiki: wiki/concepts/042-tool-calling-engine-hot-reload.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 如果你需要在 Python 程序运行时动态加载一个 `.py` 文件（不通过 `import` 语句），你会用哪个标准库？它的核心 API 大概是什么？
2. 当多个客户需要使用不同的工具集时，你会如何设计目录结构来隔离各客户的专属工具，同时复用通用工具？
3. 对于频繁调用大模型 API 时可能出现的网络波动失败，你能想到哪些处理策略？

---

# 042: 工具调用引擎设计与热更新机制

**Source:** [11工具调用引擎设计热更新机制](https://u.geekbang.org/lesson/818?article=927458)

## Outline
- [动态工具加载：importlib 机制](#dynamic-tool-loading)
- [按客户隔离的工具目录结构](#per-customer-tool-isolation)
- [热更新：WatchDog 文件监控](#hot-reload-with-watchdog)
- [重试机制：tenacity 装饰器](#retry-with-tenacity)
- [结果缓存：Redis + Hash 去重](#result-caching-with-redis)
- [反思工作流：生成-评估-改进循环](#reflection-workflow)
- [项目代码结构规范](#project-structure)
- [Connections](#connections)

---

## Dynamic Tool Loading

在 LangGraph 中，工具（tool/插件）通常在启动时静态导入。但实际业务中，我们希望运行时按需加载工具，无需重启服务。Python 的 `importlib` 模块（对应 ASR 转写中的"ImportLab"）支持动态模块加载：

```python
import importlib
import importlib.util
import os

def load_tools_from_dir(tool_dir: str) -> dict:
    """从指定目录动态加载所有 .py 工具模块"""
    tools = {}
    if not os.path.exists(tool_dir):
        return tools
    for fname in os.listdir(tool_dir):
        if fname.endswith(".py"):
            module_name = fname[:-3]  # 去掉 .py
            spec = importlib.util.spec_from_file_location(
                module_name,
                os.path.join(tool_dir, fname)
            )
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            tools[module_name] = module
    return tools
```

**关键点：**
- `importlib.util.spec_from_file_location`：根据文件路径加载模块，不依赖 Python 包路径
- 工具放在指定文件夹（如 `tools/`）；程序运行时发现、加载、注册
- 加载完成后通过 `dict.update()` 合并到 LangGraph 工具列表

## Per-Customer Tool Isolation

不同客户使用不同的工具集。目录结构设计：

```
tools/
  math.py          ← 通用工具
  test.py          ← 通用工具
custom/
  customer_a/
    promo.py       ← 客户 A 专属
  customer_b/
    discount.py    ← 客户 B 专属
```

加载逻辑：先加载客户专属目录（优先级高），再加载通用 `tools/` 目录，通过 `update` 合并：

```python
def load_customer_tools(customer_id: str) -> dict:
    tools = {}
    # 1. 通用工具
    tools.update(load_tools_from_dir("tools/"))
    # 2. 客户专属工具（覆盖同名通用工具）
    custom_path = f"custom/{customer_id}"
    tools.update(load_tools_from_dir(custom_path))
    return tools
```

这样客户专属工具排在前面，实现覆盖或扩展。

## Hot Reload with WatchDog

WatchDog 是 Python 的文件系统监控库，可以监听目录变化，在工具文件被修改时自动触发重新加载：

```python
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import importlib

class ToolReloadHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith(".py"):
            # 触发 importlib reload
            module_name = extract_module_name(event.src_path)
            if module_name in sys.modules:
                importlib.reload(sys.modules[module_name])

observer = Observer()
observer.schedule(ToolReloadHandler(), path="tools/", recursive=True)
observer.start()
```

**效果：** 工具代码一旦保存修改，LangGraph agent 自动加载新版本，无需重启进程。这是热更新（hot reload）的核心机制。

## Retry with Tenacity

网络调用（如调用大模型）可能因网络波动失败。`tenacity` 库提供声明式重试装饰器：

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),       # 最多重试 3 次
    wait=wait_exponential(min=1, max=10)  # 指数退避，避免雪崩
)
def call_llm(prompt: str) -> str:
    # 调用大模型 API
    return llm.invoke(prompt)
```

**参数说明：**
- `stop_after_attempt(n)`：最多重试 n 次后停止，抛出最后一次异常
- `wait_exponential`：重试间隔按指数增长（1s → 2s → 4s…），防止并发重试打垮下游

## Result Caching with Redis

对相同查询（如同一订单号）的多次请求，可以通过 Redis 缓存避免重复调用大模型：

```python
import redis
import hashlib
import json

r = redis.Redis()
CACHE_TTL = 300  # 5 分钟

def cached_query(user_input: str) -> str:
    key = hashlib.md5(user_input.encode()).hexdigest()
    cached = r.get(key)
    if cached:
        return cached.decode()
    result = call_llm(user_input)
    r.setex(key, CACHE_TTL, result)
    return result
```

**缓存策略：**
- 基于输入的 MD5 hash 作为 key，完全相同的输入命中缓存
- TTL 设置为 300 秒（5 分钟）：订单状态可能更新，不应永久缓存
- 适合预制问题（如固定格式订单号查询）；自然语言变体问句仍走大模型

**注意：** 缓存命中要求输入完全相同（exact match），相似但不完全相同的问题不会命中。

## Reflection Workflow

课程演示了一个"生成 → 评估 → 反思 → 改进"的代码生成工作流，手工实现 ReAct 的反思步骤：

```
用户需求
  ↓
理解需求 → 评估复杂度
  ↓
生成代码
  ↓
代码评估（打分，满分10分）
  ├── 分数 ≥ 8（及格）→ END（输出最终代码）
  └── 分数 < 8（不及格）→ 反思改进 → 重新生成 → 再次评估
                                        ↑______________|（循环，直到及格或超过最大次数）
```

**节点设计原则：**
- 把 ReAct 的步骤拆分到不同 LangGraph 节点
- 每个节点职责单一（生成 / 评估 / 反思）
- 通过条件边（conditional edge）控制流转方向

## Project Structure

LangGraph 项目推荐的文件组织结构：

```
project/
  models.py    ← 数据格式、TypedDict、State 定义（Pydantic/dataclass）
  nodes.py     ← 各节点函数（add_node / add_edge）
  utils.py     ← 纯函数工具（无副作用）
  config.py    ← 配置（API key、模型名等）
  main.py      ← 图的构建、编译、运行入口
  tools/       ← 动态工具目录
  custom/      ← 按客户分组的专属工具
```

**设计原则：**
- `models.py` 定义 State 字典，各节点函数签名以 State 为参数
- `nodes.py` 中的函数保持纯函数风格（输入 State → 输出新 State）
- 副作用（数据库、API 调用）隔离在节点函数内，不散落在工具/utils

## Connections
- → [[langgraph-state-machine]]
- → [[042-tool-calling-engine-hot-reload]]
- → [[008-langchain-core-components]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释 `importlib.util.spec_from_file_location` 和 WatchDog 在热更新机制中各自扮演什么角色？两者如何配合实现"文件保存即生效"？
2. Redis 缓存策略中，为什么用 MD5 hash 作为缓存 key，TTL 为何设为 300 秒而不是永久缓存？这种缓存对"相似但不完全相同"的问题有何局限？
3. 反思工作流（Reflection Workflow）的循环逻辑是什么？分数阈值（8 分）和条件边（conditional edge）在 LangGraph 中如何共同控制流转方向？

<details>
<summary>答案指南</summary>

1. `importlib.util.spec_from_file_location` 根据文件路径动态加载模块（无需依赖 Python 包路径），实现运行时发现工具；WatchDog 监听目录文件变化，一旦 `.py` 文件被修改就触发 `importlib.reload()`，两者结合实现"保存即自动加载新版本，无需重启进程"。
2. MD5 hash 将用户输入转为固定长度 key，完全相同的输入才命中缓存；TTL 设 300 秒是因为订单状态可能更新，不适合永久缓存；缓存为 exact match，自然语言表达略有差异的同义问句不会命中，仍会调用大模型。
3. 工作流为"生成代码 → 评估打分（满分10分）→ 分数 ≥ 8 则输出（END），分数 < 8 则反思改进后重新生成"的循环；LangGraph 通过条件边（conditional edge）读取评估分数，决定走向 END 节点还是反思节点，每个节点职责单一，通过条件边控制流转。

</details>
