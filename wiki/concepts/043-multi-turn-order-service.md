---
tags: [langgraph, multi-turn-dialog, order-service, rag, asr, ocr, sqlite, memory, slot-filling]
source: https://u.geekbang.org/lesson/818?article=937025
---

# 多轮对话订单查询客服：LangGraph 实践

本文总结用 [[008-langchain-core-components|LangGraph]] 构建多轮对话智能客服的关键工程模式，涵盖短期记忆、SQLite 持久化、RAG 集成、ASR/OCR 多模态输入和渐进式 Mock 开发策略。

## Key Concepts

### 多轮对话：Thread ID + MemorySaver

LangGraph 通过 `thread_id` 标识会话，相同 `thread_id` 的请求共享对话历史。`MemorySaver` 存储状态于内存（开发用），生产环境替换为 `SqliteSaver` 或 `PostgresSaver`。

### Slot Filling（订单号追问）

当用户未提供订单号时，chatbot 节点通过 LLM 识别意图并追问；收到订单号后继续执行查询工具。这是多轮对话的核心价值：不要求用户一次性提供完整信息。

### RAG 集成

使用 `create_retriever_tool` 将向量数据库封装为 LangGraph 工具节点。先 mock 返回固定结果，验证工作流正确后再接入真实向量库，避免多模块同时调试时难以定位问题。

### 多模态输入（ASR + OCR）

语音和图片输入最终转换为文字订单号后，流程与纯文字输入完全一致：

```
语音文件 → ASR（千问 qwen3-asr-flash）→ 订单号文字
图片文件 → OCR（千问 qwen-vl-max）→ 订单号文字
                                         ↓
                               LangGraph 工作流
```

推荐用 HTTP POST 封装 API 调用（而非 dashscope SDK），可复用为 MCP 工具。

### Mock 驱动开发

多模块系统中，用 mock 函数（`return "ORDER_001"`）占位，逐层替换真实实现。每次只引入一个变量，保证调试时能明确定位失败原因。

### LangChain 1.0 迁移

旧版 `langchain.chains` → 新版 `langchain-classic.chains`；`create_react_agent` → `create_agent`；Python 最低版本升至 3.10。

## Key Takeaways

- **Thread ID 是多轮对话的关键**：相同 thread_id = 同一会话，不同 thread_id = 独立会话
- **先 Mock 再真实**：工作流验证与业务模块验证分离，大幅降低调试复杂度
- **输入节点做格式归一**：`input_process` 节点将语音/图片/文字统一转为标准文字，后续节点无需感知输入类型
- **MemorySaver → SqliteSaver**：开发与生产只替换 checkpointer，工作流代码不变

## See Also

- [[042-tool-calling-engine-hot-reload]] — 工具动态加载与热更新，与本实践的工具调用机制互补
- [[044-pluggable-intent-hot-reload]] — 在本实践基础上增加意图节点的动态插拔能力
- [[011-llamaindex-and-rag-systems]] — RAG 系统基础，本实践的向量检索组件
