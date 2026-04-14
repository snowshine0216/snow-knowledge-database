---
tags: [ai-customer-service, sse, websocket, mcp, multimodal, vector-database, model-switching, langchain, react-agent, capstone]
source: https://u.geekbang.org/lesson/818?article=930874
---

# Core Interaction Capabilities — Part 2

AI 客服系统综合实战（第二部分），补充核心交互能力：推送建议、多模态输入、知识库动态管理、MCP 服务器暴露，以及 Docker 部署。

## Key Concepts

### 推送建议的异步解耦

直接回答（RAG）约 2 秒，ReAct 生成追问建议需 4-5 秒。若同步返回会拖慢体验，因此拆分为两个接口：快速路径立即返回答案，建议任务写入异步队列，由 SSE 推送给前端。不同 `session_id` 对应独立队列，支持 `put`/`get` 操作。

### SSE 长连接架构

前端通过 `useStream` 钩子建立 SSE 长连接；后端先 sleep 50ms 等待连接就绪，再逐条 `yield` 推送事件（检索、反思、最终答案）。建议团队统一使用一种推送写法，避免混用 WebSocket 与 SSE。

### ReAct Agent 生成建议

使用 LangGraph `create_agent`（LangChain 1.0 中对 `create_react_agent` 的新命名）构建建议生成 Agent，system prompt 要求输出 3-5 个开放式追问问题。生成结果写入对应 session 的队列，前端异步消费。

### 多模型切换

通过配置化方式管理模型列表（`SUPPORTED_MODELS` 字典，key 为模型名，value 为参数）；提供 `GET /models` 和 `POST /models/switch` 接口，切换后对所有下游路由生效。默认选成本最低速度最快的模型，备用模型质量更优。

### MCP Server（SSE 模式）

使用 FastMCP（FastAPI 扩展）将知识库工具（检索、订单查询、课程信息）暴露为 MCP SSE 服务，监听独立端口（如 6278）。客户端先建立 SSE 通道获取 `session_id`，再通过 JSON-RPC 2.0 POST 请求调用工具。

### 多模态支持

- **图片**：请求含 `image` 字段时切换 `qwen-vl-max`，典型场景为订单截图解析。
- **语音**：请求含 `audio` 字段时走独立解析分支（message 格式与文本不同），使用 `qwen-audio/omni` 模型。

### 知识库动态 CRUD

运行时动态增删向量条目，无需重建索引：
- 新增时去重检查（SHA1 自动生成 ID，可手动指定）
- 删除支持按内容或按 ID 两种方式
- 管理接口通过 `X-API-Key` header 鉴权

### Docker 部署与健康检查

Docker Compose 将日志、SQLite、备份目录挂载到宿主机 volume；`/health` 接口汇总各子接口状态；日志可通过 Loki driver 推送到远程日志平台查看趋势。

## Related Courses

- [[courses/ai-engineering-training-camp/093-core-interaction-capabilities-2]]
- [[092-core-interaction-capabilities-1]]
