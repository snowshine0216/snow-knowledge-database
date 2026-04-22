---
tags: [langgraph, multi-turn-dialog, order-service, rag, asr, ocr, sqlite, memory, slot-filling]
source: https://u.geekbang.org/lesson/818?article=937025
wiki: wiki/concepts/043-multi-turn-order-service.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在多轮对话系统中，如何让 AI 记住同一用户在不同轮次中说过的内容？你认为需要什么机制来区分"这轮对话"和"上一轮对话"？
2. "slot filling（槽位填充）"在订单查询客服场景中是什么意思？如果用户没有提供订单号，系统应该怎么做？
3. 如果要在 LangGraph 智能体中集成 RAG 向量检索，你认为检索器需要以什么形式接入才能被 agent 按需调用？

---

# 043: 模块四实践一——设计支持多轮对话的订单查询客服流程

**Source:** [模块四实践一设计一个支持多轮对话的订单查询客服流程](https://u.geekbang.org/lesson/818?article=937025)

## Outline
- [项目目标与适用场景](#project-goals)
- [技术选型与文档驱动开发](#tech-selection)
- [多轮对话：短期记忆与 Thread ID](#multi-turn-memory)
- [对话持久化：SQLite Checkpointer](#conversation-persistence)
- [RAG 集成：向量检索工具](#rag-integration)
- [多模态输入：ASR 语音识别](#asr-integration)
- [多模态输入：OCR 图像识别](#ocr-integration)
- [LangGraph 工作流设计](#langgraph-workflow)
- [Mock 驱动的渐进式开发策略](#mock-driven-development)
- [LangChain 0.x → 1.0 迁移指南](#migration-guide)
- [Connections](#connections)

---

## Project Goals

本项目是 AI 工程训练营模块四的实践一，目标是用 LangGraph 构建一个支持多轮对话的智能客服系统，核心能力：

- **多轮对话**：记住历史，追问缺失的订单号（slot filling）
- **RAG 检索**：基于向量数据库查询订单/物流/退款相关信息
- **持久化存储**：对话历史保存到 SQLite，重启不丢失
- **多模态输入**（扩展）：支持语音（ASR）和图片（OCR）输入订单号

**适用场景扩展：** 本项目的客服流程框架同样适用于医疗分诊系统、售前咨询、自动购物推荐等任何"理解用户意图 → 做出正确响应"的场景。

## Tech Selection

正确的开发起点是文档驱动：先识别需求涉及的技术，再查对应官方文档，避免盲目选框架。

1. **多轮对话** → 查 LangGraph 文档中的"短期记忆"（Short-term Memory）
2. **持久化存储** → 查 LangGraph 的 Checkpointer 文档（SQLite/Postgres/MongoDB）
3. **RAG 检索** → 查 LangGraph 智能体 RAG 文档，使用 `create_retriever_tool`
4. **ASR/OCR** → 查模型平台（如通义千问百链平台）的语音/视觉模型 API

**建议：** 阅读文档时通读后再跳转链接，避免在链接迷宫中迷失。

## Multi-Turn Memory

LangGraph 通过 **Memory + Thread ID** 实现多轮对话：

```python
from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()  # 开发/测试用内存存储

graph = builder.compile(checkpointer=checkpointer)

# 相同 thread_id = 同一对话会话，历史消息共享
config = {"configurable": {"thread_id": "user_123_session_1"}}
result = graph.invoke({"messages": [HumanMessage("查订单")]}, config=config)
```

**核心原理：**
- `MemorySaver`：将 agent 状态存在进程内存中（仅适合开发）
- `thread_id`：标识一次对话会话，相同 thread_id 的请求共享对话历史
- 生产环境用 SQLite/Postgres Checkpointer 替换 MemorySaver

## Conversation Persistence

生产环境对话历史持久化到 SQLite：

```python
from langgraph.checkpoint.sqlite import SqliteSaver

# 创建 SQLite 存储
conn = sqlite3.connect("conversations.db", check_same_thread=False)
checkpointer = SqliteSaver(conn)

graph = builder.compile(checkpointer=checkpointer)
```

LangGraph 使用数据库的两种方式：
1. **工具方式**：通过 agent 调用数据库查询工具（适合业务数据查询）
2. **Checkpointer 方式**：将 State（对话历史）序列化存入数据库（适合持久化多轮上下文）

多轮对话持久化使用第 2 种方式。

## RAG Integration

集成向量检索工具，供 chatbot 节点按需调用：

```python
from langchain.tools.retriever import create_retriever_tool

# 构建向量数据库（订单/物流/退款知识库）
vectorstore = Chroma.from_documents(documents, embedding)
retriever = vectorstore.as_retriever()

# 包装成 LangGraph 工具
rag_tool = create_retriever_tool(
    retriever,
    name="order_knowledge_search",
    description="查询订单、物流、退款相关政策和状态"
)
```

**开发建议：** 先 mock RAG 结果，确认工作流正常后再接入真实向量数据库。这样可以明确区分工作流错误 vs RAG 召回质量问题。

## ASR Integration

语音转文字（ASR）集成通义千问 ASR Flash 模型，推荐使用 HTTP POST 方式封装（避免额外依赖 `dashscope` SDK）：

```python
import requests

def transcribe_audio(audio_url: str, api_key: str) -> str:
    """调用千问 ASR Flash 将音频转换为文字"""
    resp = requests.post(
        "https://dashscope.aliyuncs.com/api/v1/services/audio/asr/transcription",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "model": "qwen3-asr-flash",
            "input": {"audio_url": audio_url}
        }
    )
    return resp.json()["output"]["text"]
```

**为什么用 HTTP 而不是 SDK？**
- 不引入额外依赖
- 可封装为 MCP 工具供其他 agent 复用
- 避免不同 SDK 版本兼容问题

## OCR Integration

图像订单号提取，使用通义千问 VL-MAX 多模态模型：

```python
def extract_order_from_image(image_url: str, api_key: str) -> str:
    """从图片中提取订单号"""
    resp = requests.post(
        "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "model": "qwen-vl-max",
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": image_url}},
                    {"type": "text", "text": "请提取图片中的订单号，只返回数字"}
                ]
            }]
        }
    )
    return resp.json()["choices"][0]["message"]["content"]
```

## LangGraph Workflow

完整工作流节点设计：

```
START
  ↓
input_process（判断输入类型）
  ├── .wav/.mp3 → ASR → 文字订单号
  ├── .jpg/.png → OCR → 文字订单号
  └── 文字 → 直接传递
  ↓
chatbot（LLM 对话节点）
  ├── 有订单号 → 调用 query_order 工具
  ├── 无订单号 → 追问（slot filling）
  └── 其他问题 → 直接回复
  ↓
tools（工具执行节点，条件边）
  └── → chatbot（结果返回）
  ↓
END
```

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class OrderState(TypedDict):
    messages: list
    order_id: str | None

builder = StateGraph(OrderState)
builder.add_node("input_process", input_process_node)
builder.add_node("chatbot", chatbot_node)
builder.add_node("tools", tool_node)

builder.set_entry_point("input_process")
builder.add_edge("input_process", "chatbot")
builder.add_conditional_edges(
    "chatbot",
    should_use_tool,  # 判断是否需要调用工具
    {"use_tool": "tools", "end": END}
)
builder.add_edge("tools", "chatbot")

graph = builder.compile(checkpointer=checkpointer)
```

## Mock-Driven Development

推荐渐进式开发策略：用 mock 函数占位，逐步替换为真实实现：

```python
def process_audio(audio_url: str) -> str:
    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key:
        raise ValueError("缺少 DASHSCOPE_API_KEY")
    # TODO: 真实 ASR 调用（暂时注释）
    # return call_asr_api(audio_url, api_key)
    return "ORDER_20240101_001"  # mock 返回固定订单号
```

**为什么先 mock？** 多模块集成时，失败原因可能来自：工作流逻辑错误、RAG 召回质量差、ASR 识别失败、API key 问题…先 mock 隔离变量，确认工作流正确后再逐步打开各模块。

## Migration Guide

LangChain 0.x → 1.0 / LangGraph 0.3 → 1.0 迁移要点：

| 项目 | 旧版（0.x）| 新版（1.0）|
|---|---|---|
| 导入路径 | `from langchain.chains import LLMChain` | `from langchain_classic.chains import LLMChain` |
| ReAct agent | `create_react_agent` | `create_agent` |
| 提示词参数 | `prompt=...` | `system_prompt=...` |
| Python 最低版本 | 3.9 | 3.10+（3.9 已 drop）|

**快速迁移：** 将旧代码中的 `langchain` 替换为 `langchain-classic`，安装 `pip install langchain-classic`。

## Connections
- → [[043-multi-turn-order-service]]
- → [[008-langchain-core-components]]
- → [[011-llamaindex-and-rag-systems]]
- → [[042-tool-calling-engine-hot-reload]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 请解释 LangGraph 中 `thread_id` 的作用，以及 `MemorySaver` 和 `SqliteSaver` 分别适用于什么环境，两者的核心区别是什么？
2. 本项目为什么推荐用 HTTP POST 方式封装 ASR/OCR 调用，而不是直接使用 `dashscope` SDK？请用自己的话说出至少两个理由。
3. 什么是"Mock 驱动的渐进式开发策略"？在多模块集成时为什么要先用 mock 占位，而不是直接接入真实 API？

> [!example]- Answer Guide
> 
> #### Q1 — thread_id 与 MemorySaver vs SqliteSaver
> 
> `thread_id` 标识一次对话会话，相同 `thread_id` 的请求共享对话历史；`MemorySaver` 将状态存在进程内存中，仅适合开发/测试；`SqliteSaver` 将对话历史持久化到 SQLite 数据库，重启后不丢失，适合生产环境。
> 
> #### Q2 — HTTP 封装 ASR/OCR 的理由
> 
> 使用 HTTP 方式可以避免引入额外的 `dashscope` SDK 依赖、可将其封装为 MCP 工具供其他 agent 复用，同时避免不同 SDK 版本之间的兼容性问题。
> 
> #### Q3 — Mock 驱动渐进式开发策略
> 
> Mock 驱动策略是先用固定返回值的占位函数代替真实 API 调用，确认整体工作流逻辑正确后再逐步替换为真实实现；这样做的目的是隔离变量——多模块集成失败时，原因可能来自工作流逻辑、RAG 召回质量、ASR 识别或 API key 等多处，先 mock 可以快速定位问题来源。
