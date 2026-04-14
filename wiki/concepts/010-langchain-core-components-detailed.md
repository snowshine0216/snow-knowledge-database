---
tags: [langchain, langgraph, langsmith, agent, memory, rag, callback, lcel, tool-calling, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927427
---

# LangChain 六大模块深解

LangChain 围绕大模型开发构建了一套独有概念体系（LLM、PromptTemplate、Chain、Agent、Memory、Callback 等），目的是建立标准化、可复用的 AI 工程开发范式。本文梳理其六大模块的职责与协同关系，以及 LangGraph 与 LangChain 的协作模式。

## Key Concepts

- **为什么要学 LangChain 独有概念**：与 Web 框架引入路由/中间件类似，LangChain 的独有概念是为了接口统一、可组合性和快速原型。学习方式：让 AI 在不同场景不断生成示例代码，约 1–2 周熟悉。
- **Model I/O 模块**：提示词管理器（PromptTemplate）+ 语言模型（ChatOpenAI 等）+ 输出解析器。是 LangChain 与 LLM 通信的核心入口。
- **RAG 模块**：封装 retriever + RetrievalQA，一行代码完成文档检索→组合→生成全流程。
- **Storage / Memory 模块**：官方叫"存储"，实际是对话记忆。每次请求经历两次 Memory 操作：先读历史，后写本次对话。
- **Tools 模块**：用 `@tool` 装饰器定义外部工具，LangChain 自动提取函数签名作为工具 name/description。这是 LangChain 被公认"有进步"的模块。
- **Callback 模块**：控制反转（IoC）机制，分构造器回调（全生命周期）和请求回调（单次请求）。工程化最难被替代的能力——日志、监控、流式输出。注意回调地狱，用 `async/await` 扁平化。
- **LCEL 语法**：声明式 `|` 管道语法串联组件，最重要的优势是自动接入 LangSmith 追踪。
- **LangGraph 协作模式**：LangGraph 规划工作流（节点 + 边），每个节点内部用 LangChain 模块实现具体逻辑。先设计 LangGraph 状态图，再填充 LangChain 实现。

## Key Takeaways

- LangChain = 乐高积木（工具箱），LangGraph = 流程引擎；最有工程价值的是 LangGraph 的流程编排
- Callback 是最难用手写替代的模块，工程化必须掌握
- 出错时用 LangSmith 追踪完整调用链，定位到具体节点
- LCEL 的核心价值不是语法简洁，而是与 LangSmith 的自动集成
- 可以只用 LangChain 的 Tools + Callback 模块，其余自己封装——社区主流实践

## See Also

- [[008-langchain-core-components]]
- [[009-function-calling-and-mcp-basics]]

## Related sources

- **[Lecture 087: LangChain Async Development Advanced Part 1]**: 深入讲解了LangChain的异步化迁移策略。核心发现：LCEL中实现了`Runnable`接口的组件（如Chain、VectorStore）内部已自动支持异步，同步改异步只需在调用处将`invoke`改为`ainvoke`并加上`await`；批量任务可用`asyncio.gather`并发执行。同时解析了LangChain版本演进策略：0.1.x（经典）→ LangGraph（工作流）→ 1.0（高层Agent API），三层按复杂度从上向下降级。LangChain 1.0将0.x的Callback机制封装为内置中间件，大幅简化追踪配置。See also: [[087-langchain-async-vectordb-gpu-1]]
