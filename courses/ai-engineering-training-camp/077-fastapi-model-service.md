---
tags: [fastapi, ollama, vllm, model-service, uvicorn, streaming, api, deployment, transformer]
source: https://u.geekbang.org/lesson/818?article=927493
wiki: wiki/concepts/077-fastapi-model-service.md
---

# 077: Building a Basic Model Service with FastAPI

**Source:** [3基于 FastAPI 构建模型基础服务](https://u.geekbang.org/lesson/818?article=927493)

## Outline
- [Module 8 Context: Developer vs SRE Responsibilities](#module-8-context-developer-vs-sre-responsibilities)
- [Why Wrap LLM Inference with FastAPI](#why-wrap-llm-inference-with-fastapi)
- [Three-Layer Architecture: LangChain / Ray / K8s](#three-layer-architecture-langchain--ray--k8s)
- [Wrapping Ollama with FastAPI](#wrapping-ollama-with-fastapi)
- [Streaming vs Non-Streaming Responses](#streaming-vs-non-streaming-responses)
- [Service Directory and Health Check](#service-directory-and-health-check)
- [Wrapping Transformer Models with FastAPI](#wrapping-transformer-models-with-fastapi)
- [Client-Side SDK Design](#client-side-sdk-design)
- [Real-World Use Case: Java Backend Integration](#real-world-use-case-java-backend-integration)
- [Connections](#connections)

---

## Module 8 Context: Developer vs SRE Responsibilities

关于「开发工程师是否需要学部署」的讨论：

**开发工程师的职责**：
- 了解如何把业务打包成 Pod
- 理解打包过程中对业务的影响
- 能提供业务视角的 K8s 配置

**SRE/DevOps 的职责**：
- K8s 底层细节（网络、存储、节点调度）
- 多节点生产集群搭建
- 监控和告警体系

类比：操作系统（SRE 负责）+ 应用软件（开发工程师负责）中间需要一个衔接层——这就是本模块要覆盖的内容。

---

## Why Wrap LLM Inference with FastAPI

典型场景（真实案例）：
- 一组 Java 后端开发者，使用 Spring AI 调用大模型
- 遇到 Spring AI 不熟悉 + 模型 API 格式不标准的问题，出现 404 错误

解决方案：用 FastAPI 在 Linux 上把大模型（VLLM/Ollama）封装成标准 HTTP 接口：

```
[Java 后端] → HTTP GET/POST → [FastAPI 包装层] → [Ollama / VLLM]
```

好处：
- Java 开发者只需请求普通 HTTP 接口，无需了解 OpenAI 格式、Stream、Message 结构
- 可以支持多种接口形式：REST、Streaming、WebSocket
- 可以统一多个模型供应商（千问、DeepSeek、OpenAI）为单一入口

---

## Three-Layer Architecture: LangChain / Ray / K8s

AI 服务化的三层架构：

```
[LangChain / LangGraph]  ← 应用层（业务逻辑）
         ↕
[Ray]                    ← 中间层（并发、任务编排）
         ↕
[Kubernetes (K8s)]       ← 基础设施层（容器编排、高可用）
```

- **Ray**：在容器之上提供原生并发语义，设置并行度为 5 自动生成 5 个并行任务
- **KubeRay**：通过 Ray 管理 Kubernetes 的中间层工具
- 各层各有擅长：K8s 重在资源调配，Ray 重在任务并发，LangGraph 重在业务流程

---

## Wrapping Ollama with FastAPI

Ollama 有两个主要接口（非标准 OpenAI 格式）：

| 接口 | 路径 | 用途 | 主要字段 |
|------|------|------|----------|
| Generate | `POST /api/generate` | 内容生成 | `prompt`, `max_tokens`, `stop` |
| Chat | `POST /api/chat` | 多轮对话 | `messages`, `system`, `context_length` |

完整封装示例：

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import httpx
from pydantic import BaseModel
from typing import Optional, List

OLLAMA_URL = "http://localhost:11434"

app = FastAPI()

class ChatRequest(BaseModel):
    model: str
    messages: List[dict]
    stream: bool = False
    context_length: Optional[int] = None

class GenerateRequest(BaseModel):
    model: str
    prompt: str
    max_tokens: Optional[int] = None
    stream: bool = False

# API 路由前缀
api_router = APIRouter(prefix="/api/v1")

@api_router.post("/chat")
async def chat(request: ChatRequest):
    if request.stream:
        async def stream_response():
            async with httpx.AsyncClient() as client:
                async with client.stream("POST", f"{OLLAMA_URL}/api/chat",
                                         json=request.dict()) as response:
                    async for chunk in response.aiter_bytes():
                        yield chunk
        return StreamingResponse(stream_response())
    else:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{OLLAMA_URL}/api/chat",
                                         json=request.dict())
        return response.json()

app.include_router(api_router)
```

Ollama 本地安装说明：
- 推荐测试模型：千问3-speed（约 3GB 内存占用）
- 服务监听端口：11434

---

## Streaming vs Non-Streaming Responses

| 场景 | 实现方式 |
|------|----------|
| 非流式 | `httpx.AsyncClient.post()` → 等待完整响应 → `response.json()` |
| 流式 | `StreamingResponse` + 异步生成器 + `client.stream()` |
| WebSocket | 使用 `websockets` 库，适合更熟悉 WebSocket 的团队 |

流式响应代码模式：
```python
from fastapi.responses import StreamingResponse

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    async def generator():
        async with httpx.AsyncClient() as client:
            async with client.stream("POST", url, json=data) as resp:
                async for chunk in resp.aiter_text():
                    yield chunk
    return StreamingResponse(generator(), media_type="text/event-stream")
```

---

## Service Directory and Health Check

生产级 FastAPI 服务必备端点：

```python
@app.get("/")
async def service_directory():
    """服务目录 — 列出所有可用接口"""
    return {
        "endpoints": {
            "chat": "POST /api/v1/chat",
            "generate": "POST /api/v1/generate",
            "health": "GET /health"
        }
    }

@app.get("/health")
async def health_check():
    """健康检查 — 供容器编排工具使用"""
    return {"status": "healthy", "service": "llm-api"}
```

**健康检查的意义**：
- K8s 和 Docker 可基于健康检查探针自动重启不健康的容器
- 可在健康检查中嵌入业务状态（如模型是否加载成功）
- 为将来扩展 MCP 接口预留扩展点

---

## Wrapping Transformer Models with FastAPI

对于非标准部署的模型（如国产显卡上使用 Transformer 库直接推理）：

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from fastapi import FastAPI

# 模型下载（首次运行）
# snpe download --model qwen-vl.chat --save-dir ./models

# 加载模型
model = AutoModelForCausalLM.from_pretrained(
    "./models/qwen-vl-chat",
    device_map="auto",  # 或 "cuda:0,1" 指定显卡
    torch_dtype=torch.float16
)
tokenizer = AutoTokenizer.from_pretrained("./models/qwen-vl-chat")

app = FastAPI()

class ChatRequest(BaseModel):
    model: str
    messages: list
    max_tokens: int = 512

@app.post("/v1/chat/completions")
async def chat(request: ChatRequest):
    # 与 OpenAI 格式兼容的接口路径
    inputs = tokenizer.apply_chat_template(request.messages, return_tensors="pt")
    outputs = model.generate(inputs, max_new_tokens=request.max_tokens)
    response = tokenizer.decode(outputs[0])
    return {"choices": [{"message": {"content": response}}]}
```

内存要求（以千问VL-Chat 为例）：
- 模型权重大小：约 9.6GB
- 推理所需显存：约 19.2GB（FP16 精度，约为权重的 2 倍）

---

## Client-Side SDK Design

除了服务端，还可以提供配套的客户端 SDK，方便其他服务调用：

```python
# client.py
import httpx
from dataclasses import dataclass
from typing import Optional

@dataclass
class ChatRequest:
    model: str
    prompt: str
    temperature: float = 0.7
    max_tokens: int = 512
    stream: bool = False

class LLMClient:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url

    async def chat(self, data: ChatRequest) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/chat",
                json=vars(data)
            )
        return response.json()

    async def generate(self, data: ChatRequest) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/generate",
                json=vars(data)
            )
        return response.json()
```

商业化方向（如 Cherry Studio 的发展路径）：
1. 对接多个模型 API（千问、DeepSeek、OpenAI）到统一入口
2. 添加用户历史记录保存（PostgreSQL）
3. 添加知识库上传（PDF、图片）
4. 添加语音功能
5. 逐步发展为完整的 LLM 客户端软件

---

## Real-World Use Case: Java Backend Integration

实际应用场景：Java 后端团队不熟悉 OpenAI SDK，使用 FastAPI 中间层解决：

```
[Spring Boot Java 后端]
    ↓ HTTP POST (标准 REST)
[FastAPI 包装层 (Python)]
    ↓ Ollama/VLLM API
[大模型服务]
```

优势：
- Java 团队只需要会调用普通 HTTP 接口
- 可以按业务需求暴露不同格式（Streaming / WebSocket / REST）
- FastAPI 层可以统一处理认证、日志、限流等横切关注点

---

## Connections
- → [[076-docker-containerization-2]]
- → [[078-kubernetes-orchestration-basics]]
