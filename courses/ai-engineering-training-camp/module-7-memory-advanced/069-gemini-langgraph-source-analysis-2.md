---
tags: [langgraph, gemini, multi-agent, web-research, reflection, structured-output, pydantic, workflow, debugging, fastapi]
source: https://u.geekbang.org/lesson/818?article=927484
wiki: wiki/courses/ai-engineering-training-camp/module-7-memory-advanced/069-gemini-langgraph-source-analysis-2.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. LangGraph 中多个节点共享数据时，应该让所有节点都传递同一个全局状态对象，还是让每个节点只获取它需要的最小状态？为什么？
2. 在反思型 agent 的 Pydantic 结构化输出中，你认为"反思"结果应该包含哪些字段才能驱动"继续搜索还是终止"的决策？
3. 当需要把 LangGraph 项目的模型提供商从 Google Gemini 替换成 DeepSeek 时，你认为最主要的改动会在哪个文件——配置文件还是主工作流文件？

---

# 069: Gemini Fullstack LangGraph Quickstart 源码剖析（二）

**Source:** [6 Gemini-fullstack-langgraph-quickstart 源码剖析 2](https://u.geekbang.org/lesson/818?article=927484)

## Outline
- [Overview](#overview)
- [Project Layout](#project-layout)
- [state.py: Five Node States](#statepy-five-node-states)
- [configuration.py: Model Tiering](#configurationpy-model-tiering)
- [prompts.py: Extract Don't Inline](#promptspy-extract-dont-inline)
- [utils.py vs tools_and_schemas.py](#utilspy-vs-tools_and_schemaspy)
- [Structured Output with Pydantic](#structured-output-with-pydantic)
- [graph.py: The Full Workflow](#graphpy-the-full-workflow)
- [Conditional Edges and Reflection](#conditional-edges-and-reflection)
- [Debugging LangGraph](#debugging-langgraph)
- [Swapping the Model Provider](#swapping-the-model-provider)
- [Timeout, Performance, and Overflow](#timeout-performance-and-overflow)
- [Production Deployment](#production-deployment)
- [Aside: RAG Philosophy](#aside-rag-philosophy)
- [Python is an Interface Language](#python-is-an-interface-language)
- [Chapter Summary](#chapter-summary)

---

## Overview

Google 官方开源项目 **`gemini-fullstack-langgraph-quickstart`** 是学习 LangGraph 的最佳反思型 agent 范本：生成查询 → 网络搜索 → 反思知识缺口 → 决定是否再搜 → 最终总结。本讲续接 068 对主文件 `graph.py` 以外的依赖包进行源码剖析，回答六个核心问题：状态如何设计、配置如何分层、提示词如何组织、工具如何分类、结构化输出如何约束、调试如何进行。最后结合工程化视角讲如何替换模型、处理超时、拓展成生产架构。

---

## Project Layout

```
agent/
├── __init__.py
├── state.py                 # 5 种节点间状态定义
├── configuration.py         # 模型名、次数等全局配置
├── prompts.py               # 所有长提示词集中放
├── tools_and_schemas.py     # Pydantic schemas 约束结构化输出
├── utils.py                 # 外部辅助工具（字符串处理、URL 缩短）
├── tools.py                 # agent-internal 工具（节点调用的）
└── graph.py                 # 主工作流
```

**阅读顺序**：`state.py` → `configuration.py` → `prompts.py` → `tools_and_schemas.py` → `utils.py` → `graph.py`。依赖由内而外，先看基础再看组装。

---

## state.py: Five Node States

LangGraph 节点通过**共享状态**通信。项目定义了 5 种状态：

| State | 作用 |
|---|---|
| `OverallState` | 全局变量（用户问题、搜索结果、最终答案等，所有节点都能读写） |
| `ReflectionState` | 反思节点的局部状态 |
| `QueryState` | 查询生成节点的局部状态 |
| `GenerationState` | 生成节点的局部状态 |
| `SearchState` | 搜索节点的局部状态 |

**设计原则**：节点**优先使用最小状态**。只有当节点需要读取/修改全局变量时才传 `OverallState`；纯局部计算传更窄的 state（例如 `web_research` 只需要搜索相关字段）。这是 LangGraph 的一个常见最佳实践，避免所有节点都膨胀成"读全局、写全局"。

---

## configuration.py: Model Tiering

```python
class Configuration(BaseModel):
    query_generator_model: str = Field(
        default="gemini-2.0-flash",
        metadata={"description": "Fast model for query generation"},
    )
    reflection_model: str = Field(default="gemini-2.5-flash")
    answer_model: str = Field(default="gemini-2.5-pro")
    number_of_initial_queries: int = 3
    max_research_loops: int = 2
```

**三种模型分工 — 一个好一个坏**：

| 阶段 | 原配置 | 合理配置 | 评价 |
|---|---|---|---|
| Query generation | 2.0 flash | 2.0 flash | ✅ 快速即可 |
| Web research | 2.0 flash | 2.0 flash | ✅ |
| Reflection | 2.5 **flash** | 2.5 **pro** | ❌ 反思需要推理深度，作者在"炫技" |
| Final answer | 2.5 pro | 2.5 pro | ✅ |

**替换建议**：只想跑通直接改 `default` 字段。想改成 DeepSeek / Qwen，需要**同时改 `graph.py` 里的 `ChatGoogleGenerativeAI` 引用** — 作者把模型实例化穿插在主流程里，耦合较深。

---

## prompts.py: Extract Don't Inline

项目的所有提示词（每个 ~2k+ tokens）都提取为模块级常量：

```python
# prompts.py
QUERY_GENERATION_PROMPT = """You are a search query generator..."""
WEB_RESEARCH_PROMPT     = """Analyze the following search results..."""
REFLECTION_PROMPT       = """Evaluate whether the information..."""
ANSWER_PROMPT           = """Synthesize a final answer..."""
```

```python
# graph.py
from agent.prompts import QUERY_GENERATION_PROMPT, REFLECTION_PROMPT, ...
```

**为什么必须这样做**：
- 把超长字符串塞到工作流代码里会让节点函数难以阅读
- 同一 prompt 可能被多个节点引用，extract 成常量避免复制粘贴
- 调整 prompt 时只改一个文件，不用翻工作流

老师特别强调这是最佳实践之一 — 课程里有同学之前提过"长 prompt + 工作流混搭，文件超 2k 行后就没法看"，这就是给出的答案。

---

## utils.py vs tools_and_schemas.py

**两个"工具文件"职能完全不同**，容易混淆：

| 文件 | 参与 agent 内部？ | 示例 |
|---|---|---|
| `utils.py` | ❌ 辅助工具 | `extract_research_topic_from_messages()`<br>`resolve_url()`（短 URL 映射）<br>字符串拼接、消息提取等 |
| `tools_and_schemas.py` | ✅ agent 内部工具 | `SearchQueryList`（结构化输出 schema）<br>`Reflection`（反思 schema）<br>未来的 `ERPQuery` 等自定义工具 |

**类比**：`utils` 是螺丝刀（编程辅助）；`tools` 是工具库（agent 能调用的能力）。

添加新 agent 工具（比如 ERP 查询）的步骤：

```python
# tools_and_schemas.py
class ERPQuery(BaseModel):
    query: str
    def invoke(self): return 1   # 占位实现

# graph.py
from agent.tools_and_schemas import ERPQuery, SearchQueryList, Reflection
```

---

## Structured Output with Pydantic

项目用 Pydantic + `with_structured_output` 强制 LLM 按 schema 输出：

```python
class SearchQueryList(BaseModel):
    queries: list[str]

class Reflection(BaseModel):
    is_sufficient: bool
    knowledge_gap: str
    follow_up_queries: list[str]
```

在 `graph.py`：

```python
structured_llm = llm.with_structured_output(SearchQueryList)
result = structured_llm.invoke(prompt)
print(result.queries)   # 拿到 list[str]
```

Prompt 里会配合写一段"请按以下 JSON 格式输出"的约束，Pydantic 解析失败时自动抛错或重试。

**反思 schema 的字段设计值得抄**：
- `is_sufficient: bool` — 是/否继续搜索，驱动条件边
- `knowledge_gap: str` — 还缺什么，记录在 state 里供下一轮用
- `follow_up_queries: list[str]` — 下一轮搜啥，直接给 web_research 节点喂

---

## graph.py: The Full Workflow

```python
builder = StateGraph(OverallState, config_schema=Configuration)

builder.add_node("generate_query",     generate_query)
builder.add_node("web_research",       web_research)
builder.add_node("reflection",         reflection)
builder.add_node("finalize_answer",    finalize_answer)

builder.add_edge(START, "generate_query")
builder.add_conditional_edges("generate_query", continue_to_web_research)
builder.add_edge("web_research", "reflection")
builder.add_conditional_edges("reflection", evaluate_research)
builder.add_edge("finalize_answer", END)

graph = builder.compile()
```

节点 + 边 + 状态 = 完整 LangGraph 模板。**这是所有反思型 agent 的骨架**，无论换什么领域都能套用。

---

## Conditional Edges and Reflection

条件边 `evaluate_research` 是整个反思循环的核心：

```python
def evaluate_research(state: ReflectionState, config: RunnableConfig):
    cfg = Configuration.from_runnable_config(config)
    if state["is_sufficient"]:
        return "finalize_answer"
    if state["research_loop_count"] >= cfg.max_research_loops:
        return "finalize_answer"
    return "web_research"      # 继续搜索
```

三路分支：
1. 知识缺口满足 → 进入总结
2. 超过最大循环次数 → 强制总结（防止无限循环）
3. 都不满足 → 回到 `web_research`，用新的 `follow_up_queries` 继续搜

---

## Debugging LangGraph

LangSmith 的单步调试**仍是半成品**：只能一层一层点开看节点输出，不支持断点式单步。当前最靠谱的工具是 **`print`**：

```python
def generate_query(state, config):
    print(f"🔵 start generate_query | state={state}")
    result = ...
    print(f"🟢 end   generate_query | result={result}")
    return {"search_query": result.queries}
```

建议：
- 每个节点入口 + 出口各一个 print
- 用特殊符号（Emoji / `====`）标记，方便和日志区分
- f-string 打印变量值
- 修改后**保存即自动热重载**（LangGraph dev server 特性）

条件边同理，在 `evaluate_research` 前后加 print 看状态流转。

---

## Swapping the Model Provider

### 配置层替换

`configuration.py` 改 `default` 字段即可切到另一家 Gemini 模型。

### 主流程层替换

`graph.py` 有大量直接引用 Google SDK 的代码：
```python
from langchain_google_genai import ChatGoogleGenerativeAI
from google import genai
llm = ChatGoogleGenerativeAI(model=cfg.reflection_model, ...)
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
```

**迁移到 DeepSeek/Qwen 的步骤**：
1. 删掉 Google/Gemini 的特有初始化
2. 删掉 `if not GEMINI_API_KEY: raise` 的检查
3. 替换为 OpenAI 兼容的 `ChatOpenAI(base_url=..., api_key=...)`
4. 把搜索部分（`genai.Client` 调 Google Search）替换成自建搜索或 Tavily

**根本不便利性**：作者把"初始化 + 配置 + 业务流程"糅在一起，暴露了设计缺陷 — 生产项目应把 LLM 实例化集中到一处，业务层只接受注入。

---

## Timeout, Performance, and Overflow

### 超时策略

- **Agent 侧很少做超时**：agent 不知道搜索要多久，盲目设置超时会误杀正常慢请求
- **大模型侧的隐性超时**：Claude 4 Beta 有队列排队机制，默认 5 分钟；自建 vLLM 要看队列
- **实际做法**：在**外层请求**（FastAPI 层）加计时器，过长就抛异常 — 让用户感知而非内部死锁

### 性能优化三板斧

| 瓶颈 | 调整方向 |
|---|---|
| 搜索速度 | 并发搜索（把 `follow_up_queries` 并行发出），成本换时间 |
| 反思耗时 | 减小模型参数 / 减少反思轮数（调 `max_research_loops` 或提示词） |
| 重复搜索 | 第一次就搜更多网页，减少反思触发的二轮/三轮 |

**Cost for time**：
- 第一次搜 10 个网页 vs 搜 3 个然后再反思再搜 7 个，前者可能一次性完成总耗时更短
- 反思迭代的时间成本 > 前置扩容搜索的成本

### 搜索结果过长处理

当 `web_research` 拿到的结果超过 LLM 上下文窗口时：

1. **截断（推荐 for web research）** — 按句子边界保留最新/最相关部分
2. **分段总结再拼接** — 每网页单独过一次 LLM 总结，然后 join。成本更高，不太用于搜索，常用于**多轮对话的滑动窗口记忆**

老师原项目实际**没做任何溢出处理** — 需要自己加。

---

## Production Deployment

### 开发环境

```bash
langgraph dev   # 起内置 web 服务器 + 读取 langgraph.json
```

不需要额外写 FastAPI；LangGraph dev server 已内置。

### 生产环境

```
Client → Nginx（负载均衡） → FastAPI + Uvicorn × N 台 → LangGraph runtime
```

- **Nginx** 做前置负载均衡，避免并发把 Uvicorn 打死
- **FastAPI + Uvicorn**：多 worker 模式
- **LangGraph** 作为核心 runtime 跑节点工作流

**不要直接 `langgraph dev` 上生产** — 它只支持单机、单进程、无并发控制。

---

## Aside: RAG Philosophy

学员问"图片取代 RAG 行不行？" 老师给了一个非主流但很有道理的回答：

- **RAG 本身就不是最优解**，只是"目前最好的可白盒检索" — 为了可观测性，我们接受了不紧密的结合
- **不要把 RAG 放在主路径**（query → RAG → answer），这是常见错误
- **正确姿势：RAG 作为旁路工具**，由 agent 决定何时调用 — 类似 function calling
- 其他手段（图片、知识图谱、MCP、web search）也都是旁路工具
- 谁的准确性高、对当前问题合适，agent 就选谁

**关键点**：不要试图"替换" RAG，要把它从主路径挪到工具箱里。

---

## Python is an Interface Language

学员问"大模型是 Python 写的吗？为啥服务器也用 Python？"

**大模型不是 Python 写的** — Python 只是接口：

- 大模型权重文件 → C++ 写的 CUDA kernel → GPU 推理
- Python 只负责**启动、参数传递、请求路由**
- 启动慢（加载模型到 GPU），运行时 Python 开销忽略不计

**类比**：Windows `.exe` 看起来是一个文件，真正干活的是 `.dll`（C++ 写的）。Linux 对应 `.so`，`.elf` 只是壳。

**框架生态**：
- LangChain / LangGraph → Python（资源最丰富）
- Spring AI → Java
- **ByteDance EINO** → Go
- 各家都有自己的 Agent 框架，不限于 Python

### Python 的"坑在哪里"

- 语法简单、类型宽松 → 入门曲线极平滑
- 异常报错几乎都是底层继承链 → **难以精确定位**，必须自己做结构化 try/except
- Web 框架报错特别难读
- 难点集中在后期的：**设计模式 / 异常体系 / 类抽象**

---

## Chapter Summary

- LangGraph 项目的标准目录结构：`state / configuration / prompts / tools_and_schemas / utils / graph`，分层清晰，每层职责单一。
- **状态最小化原则**：节点只用需要的 state，不要无脑传 `OverallState`。
- **提示词提取为模块常量** — 超过 2k token 的 prompt 必须拆文件。
- **`utils.py` 与 `tools.py` 职能不同**：前者是编程辅助，后者是 agent 能力。
- **结构化输出用 Pydantic schema**：`is_sufficient / knowledge_gap / follow_up_queries` 是反思型 agent 的经典模式。
- **条件边三路分支**：知识满足 / 超最大循环 / 继续搜 — 保证终止。
- **最佳调试仍然是 print + 热重载**，LangSmith 调试仍不成熟。
- **替换模型的真正难点**在 `graph.py` 的硬编码引用，不是 `configuration.py`。
- **超时几乎不做**，优化方向是并发搜 + 前置扩容搜索（成本换时间）。
- **生产部署 = Nginx + FastAPI/Uvicorn × N + LangGraph runtime**。
- **RAG 哲学**：别放主路径，当工具箱里的一个工具。
- **Python 只是接口**：大模型是 C++ CUDA kernel；Spring AI / EINO 是其他语言的替代。


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释 `utils.py` 和 `tools_and_schemas.py` 的本质区别，并各举一个具体例子说明它们分别适合放什么内容。
2. `evaluate_research` 条件边有三条分支路径，请逐一说明每条路径的触发条件以及它通向哪个节点，并解释为什么必须有"超过最大循环次数"这一路。
3. 本课提出"RAG 不应放在主路径，而应作为旁路工具"。用自己的话解释这个观点的含义，并说明"主路径"和"旁路工具"这两种架构在实际使用方式上有何不同。

<details>
<summary>答案指南</summary>

1. `utils.py` 是纯编程辅助工具（不参与 agent 内部），例如 `resolve_url()` 做短链映射、`extract_research_topic_from_messages()` 提取字符串；`tools_and_schemas.py` 是 agent 能调用的能力（Pydantic schema 约束结构化输出），例如 `SearchQueryList`、`Reflection`，未来的 `ERPQuery` 也放这里。两者的核心区分：是否作为 agent 内部工具被节点直接调用。
2. 三条分支：① `is_sufficient == True` → 进入 `finalize_answer`（知识已足够）；② `research_loop_count >= max_research_loops` → 强制进入 `finalize_answer`（防止无限循环）；③ 两者都不满足 → 回到 `web_research` 用新的 `follow_up_queries` 继续搜索。必须有第二条是因为 LLM 的反思结果不一定可靠，需要硬性终止条件保证工作流必然结束。
3. "主路径"指 query → RAG → answer 的固定流程，RAG 始终被调用；"旁路工具"指 RAG 只是 agent 工具箱里的一个选项，由 agent 根据问题决定是否调用，和 web search、知识图谱等并列。本课的核心观点是：RAG 只是目前最好的可白盒检索手段，不应成为强制执行的唯一主路径，agent 应该能自主选择最适合当前问题的检索方式。

</details>
