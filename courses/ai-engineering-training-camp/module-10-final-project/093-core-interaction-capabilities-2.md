---
tags: [ai-customer-service, sse, websocket, mcp, multimodal, vector-database, model-switching, langchain, react-agent, capstone]
source: https://u.geekbang.org/lesson/818?article=930874
wiki: wiki/concepts/093-core-interaction-capabilities-2.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. SSE（Server-Sent Events）与 WebSocket 在实时推送场景中各有什么特点？你会在什么情况下选择 SSE 而不是 WebSocket？
2. 在 AI 客服系统中，若直接回答（RAG 检索）与追问建议生成（推理）响应时间差异较大，你会如何设计架构来避免用户等待过久？
3. 什么是 MCP（Model Context Protocol）？你认为将知识库系统封装为 MCP 服务器有什么优势？

---

# 093: Core Interaction Capabilities — Part 2

**Source:** [5补充核心与交互能力2](https://u.geekbang.org/lesson/818?article=930874)

## Outline
- [Suggestion Push via Async Queue](#suggestion-push-via-async-queue)
- [SSE Long-Connection Architecture](#sse-long-connection-architecture)
- [ReAct Agent for Suggestion Generation](#react-agent-for-suggestion-generation)
- [Using AI IDE to Navigate Unfamiliar Code](#using-ai-ide-to-navigate-unfamiliar-code)
- [Model Switching and Configuration](#model-switching-and-configuration)
- [MCP Server via SSE](#mcp-server-via-sse)
- [Multimodal Support — Image and Audio](#multimodal-support--image-and-audio)
- [Knowledge Base CRUD API](#knowledge-base-crud-api)
- [Docker Deployment and Health Checks](#docker-deployment-and-health-checks)
- [Connections](#connections)

---

## Suggestion Push via Async Queue

讲解了"推送建议"功能的设计动机和实现方案。

**核心问题：** 直接回答问题（RAG 检索）约两秒；而生成追问建议（ReAct 推理）需四到五秒甚至更长。若两者同时返回，会拖慢用户体验。

**解决方案：** 拆成两个接口：
- **接口 1**：直接返回问答结果（快速路径）
- **接口 2**：将建议生成任务写入异步队列（ACIO Queue），通过 WebSocket/SSE 推送到前端

不同的 `session_id` 对应独立的建议队列，队列支持 `put`（生产）和 `get`（消费）两个操作。

```python
# 生产端：将建议写入队列
queue[session_id].put(suggestions)

# 消费端：前端通过 SSE 长连接取出
suggestions = queue[session_id].get()
```

---

## SSE Long-Connection Architecture

前端使用 `useStream` 钩子建立 SSE 或 WebSocket 长连接，后端通过流式 `yield` 逐条推送事件。

前端判断四类推送事件：
1. 生成阶段数据（generation）
2. 检索阶段数据（research）
3. 反思阶段数据（reflection）
4. 最终答案（final result）

后端推送时，先 `sleep(50ms)` 确保消费端完成连接初始化，再开始推送。

```python
# 后端 SSE 推送示意
async def push_stream(session_id):
    await asyncio.sleep(0.05)  # 等待前端建立连接
    async for chunk in generate_suggestions(session_id):
        yield f"data: {chunk}\n\n"
```

建议：团队内尽量统一使用一种推送写法（WebSocket 或 SSE），避免风格混用。

---

## ReAct Agent for Suggestion Generation

建议生成使用 **ReAct Agent**（LangGraph `create_agent`，LangChain 1.0 中已将 `create_react_agent` 更名为 `create_agent`）。

```python
from langgraph.prebuilt import create_agent

agent = create_agent(
    model=get_model(),           # 当前配置的模型
    tools=[kb_search, db_lookup],
    system_prompt="""
        你是建议生成助手。
        根据原有的问题生成 3-5 个继续追问的相关问题，
        这些问题和上下文相关，助初始用户了解具体细节，
        并以开放式问题输出。
    """
)
```

生成结果通过 `queue.put()` 写入对应 `session_id` 的队列，前端异步取回。

---

## Using AI IDE to Navigate Unfamiliar Code

当团队多人协作、代码风格不统一时，可利用 AI IDE（如 Cursor、Kimi K2）进行代码溯源分析：

1. 将需要追踪的函数粘贴给大模型
2. 先请大模型解释函数功能
3. 再结合整个工作区上下文追踪完整调用链

AI IDE 工具推荐（代码理解能力）：
- 海外优先：**Google Gemini Pro**
- 国内替代：**Kimi K2**、**千问 Qianwen**（吹自带版）

---

## Model Switching and Configuration

系统通过配置化方式支持多模型切换，避免业务代码硬编码。

```python
# 支持的模型列表
SUPPORTED_MODELS = {
    "qwen-turbo":  {"temperature": 0.1},
    "qwen-plus":   {"temperature": 0.7},
    "qwen-vl-max": {"temperature": 0.7},
}

DEFAULT_MODEL = "qwen-turbo"

def get_model(model_name=None):
    name = model_name or DEFAULT_MODEL
    if name not in SUPPORTED_MODELS:
        raise ValueError(f"不支持的模型: {name}")
    params = SUPPORTED_MODELS[name]
    return ChatModel(model=name, **params)
```

模型切换接口：
- `GET /models`：列出所有支持的模型
- `POST /models/switch`：切换当前使用模型（validate 后生效）
- 切换后的模型影响 `circle`、`ReAct` 等所有下游路由

**设计原则**：默认模型选成本最低、速度最快的；备用模型成本略高但质量更好。

---

## MCP Server via SSE

将整个知识库系统打包为 MCP（Model Context Protocol）服务器，供其他 AI 客户端调用。

实现方式：使用 `FastMCP`（基于 FastAPI）通过 SSE 协议暴露工具：

```python
# mcp_server.py
from fastmcp import FastMCP

mcp = FastMCP()

@mcp.tool()
def kb_search(query: str) -> list:
    """检索知识库"""
    ...

@mcp.tool()
def order_lookup(order_id: str) -> dict:
    """查询订单"""
    ...

if __name__ == "__main__":
    mcp.run(transport="sse", port=6278)
```

调试流程：
1. 建立 SSE 长连接，获取 `session_id`
2. 在新终端通过 `curl` 向 `/message?session_id=<id>` 发送 JSON-RPC 2.0 请求

注意：`data` 字段须符合 JSON-RPC 2.0 格式（双引号转义），建议将请求体写成 `.json` 文件再通过 `--data-binary @file.json` 传入。

---

## Multimodal Support — Image and Audio

### 图片支持

当请求包含 `image` 字段时，自动切换到多模态模型：

```python
def handle_chat(request):
    need_vl = "image" in request
    model = "qwen-vl-max" if need_vl else get_current_model()
    # 调用对应模型
```

推荐模型：**千问 VL-Max**（视觉理解最强版本）

典型场景：用户上传订单截图，系统自动提取订单号并结合文字 query 作答。

### 语音支持

音频输入与文本输入的 message 格式**不同**，必须走独立的解析分支：

```python
if "audio" in request:
    # 使用 qwen-asr-flash 或 qwen-audio/omni
    result = handle_audio(request["audio"], request["query"])
else:
    result = handle_text(request)
```

推荐模型：**千问 Audio/Omni**（开源版）

---

## Knowledge Base CRUD API

支持在运行时动态增删知识库内容（无需重建索引）。

### 新增（去重）

```python
def add_unique(text, metadata):
    if not exists(text):
        vector_store.add_texts([text], metadatas=[metadata])
        return generate_id(text)  # SHA1 自动生成 ID
    return None
```

### 删除

- 基于 **内容** 匹配删除
- 基于 **ID** 精确删除（推荐）

### 接口安全

后台管理接口（增删）通过 `X-API-Key` header 验证身份，防止未授权操作：

```python
def verify_api_key(key: str):
    if key != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
```

接口示例：
- `POST /vector/items`：批量添加，返回成功 ID 列表
- `DELETE /vector/items/{id}`：按 ID 删除

---

## Docker Deployment and Health Checks

### Docker Compose 配置要点

```yaml
services:
  app:
    working_dir: /app
    volumes:
      - ./logs:/app/logs        # 日志持久化
      - ./data.db:/app/data.db  # SQLite 持久化
      - ./backups:/app/backups  # 备份文件
  redis:
    image: redis:alpine
```

若使用 PostgreSQL 替代 SQLite，需单独起一个容器。

### 健康检查

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
```

`/health` 接口汇总各子接口状态并返回平均响应时间。

### 远程日志

通过 Loki 等工具将本地日志推送到远程日志平台，便于查看趋势：

```yaml
logging:
  driver: loki
  options:
    loki-url: "https://logs.example.com"
```

---

## Connections
- → [[092-core-interaction-capabilities-1]]
- → [[094-multi-tenant-and-deployment]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 请用自己的话解释"推送建议"功能的异步队列设计方案：为什么要将问答接口和建议生成接口拆开？session_id 在其中扮演什么角色？
2. 系统的多模型切换机制是如何实现的？当请求包含图片时，系统如何自动选择合适的模型？默认模型的选型原则是什么？
3. 知识库 CRUD API 在新增内容时如何实现去重？删除接口提供了哪两种匹配方式？后台接口的安全保障机制是什么？

> [!example]- Answer Guide
> 
> #### Q1 — 异步队列与接口拆分设计
> 
> RAG 检索约两秒，ReAct 推理建议生成需四到五秒甚至更长，同时返回会拖慢用户体验。因此拆成两个接口：接口1快速返回问答结果，接口2将建议任务写入异步队列（ACIO Queue），通过 SSE/WebSocket 异步推送。不同 session_id 对应独立队列，前端通过 SSE 长连接消费，实现解耦。
> 
> #### Q2 — 多模型切换与选型原则
> 
> 多模型通过配置字典（SUPPORTED_MODELS）管理，`get_model()` 函数按名称取出对应参数实例化，避免业务代码硬编码。当请求含 `image` 字段时自动切换为 `qwen-vl-max` 多模态模型；默认模型选成本最低、速度最快的（如 `qwen-turbo`），备用模型成本略高但质量更好。
> 
> #### Q3 — 知识库去重与安全机制
> 
> 新增时先判断内容是否已存在（`exists(text)`），不重复才写入向量库并用 SHA1 自动生成 ID。删除支持基于内容匹配和基于 ID 精确删除两种方式（推荐用 ID）。后台管理接口通过校验请求头 `X-API-Key` 与 `ADMIN_API_KEY` 是否一致来防止未授权操作。
