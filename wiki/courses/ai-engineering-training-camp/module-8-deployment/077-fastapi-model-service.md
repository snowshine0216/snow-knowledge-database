---
tags: [fastapi, ollama, vllm, model-service, uvicorn, streaming, api, deployment, transformer]
source: https://u.geekbang.org/lesson/818?article=927493
---

# Building a Basic Model Service with FastAPI

Practical guide to wrapping LLM inference (Ollama, VLLM, Transformer models) with FastAPI to expose standardized HTTP interfaces for AI model services.

## Key Concepts

- **模型服务封装动机**: AI 开发工程师与 SRE 之间存在业务视角的空白——开发者了解业务需求，运维了解基础设施，FastAPI 层是衔接两者的桥梁
- **三层 AI 服务架构**: LangChain/LangGraph（应用层）→ Ray（中间并发层）→ K8s（基础设施层）；KubeRay 是结合两者的工具
- **Ollama 接口**: 非标准 OpenAI 格式，有两个接口：Generate（使用 `prompt` 字段，适合内容生成）和 Chat（使用 `messages` 字段，适合多轮对话）
- **流式 vs 非流式**: 非流式使用 `httpx.AsyncClient.post()` + `response.json()`；流式使用 `StreamingResponse` + 异步生成器 + `client.stream()`
- **健康检查端点**: `/health` 接口供 K8s 探针使用，自动重启不健康容器；可嵌入业务状态检查
- **Transformer 推理封装**: 对于非标准部署的模型，使用 `transformers` 库加载 + FastAPI 封装成 `/v1/chat/completions` 兼容 OpenAI 的接口
- **Pydantic 数据验证**: 使用 `BaseModel` 定义请求/响应数据模型，FastAPI 自动完成类型校验和文档生成
- **统一模型网关**: 一个 FastAPI 服务对接多个模型供应商（千问、DeepSeek、OpenAI），前端选择模型，是 Cherry Studio 等工具的早期形态

## Key Takeaways

- FastAPI + Uvicorn + Pydantic 是构建 AI 模型服务的三件套
- 将模型服务包装为标准 HTTP 接口可以让 Java/.NET 等非 Python 团队轻松接入
- 健康检查是容器化部署的必备端点，不可省略
- 内存估算规则：模型权重 GB × 2 ≈ 推理所需显存（FP16 精度）
- 服务目录（`GET /`）返回所有可用接口列表，方便扩展和文档化

## See Also

- [[076-docker-containerization-2]]
- [[078-kubernetes-orchestration-basics]]
