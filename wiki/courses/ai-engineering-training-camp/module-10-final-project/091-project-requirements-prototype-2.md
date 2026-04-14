---
tags: [ai-engineering, langgraph, routing, intent-recognition, mvp, langchain, langsmith, performance]
source: https://u.geekbang.org/lesson/818?article=930872
---

# Project Requirements and Prototype Design: Part 2

This lecture covers the technical implementation details of the MVP: why LangGraph is used instead of pure LangChain for multi-agent routing, how intent recognition works, the component testing strategy, and performance monitoring with LangSmith.

## Key Concepts

- **LangChain 1.0的工具优先原则**: 在LangChain 1.0中，子Agent、RAG检索等都通过工具（Tool）方式调用，导致多层Agent嵌套时代码极难维护
- **LangGraph解决多层路由**: 当父调子、子调孙的嵌套超过两层时，改用底层LangGraph来实现路由节点，代码更清晰
- **弱模型开发原则**: 开发阶段用参数量小的弱模型（如Qwen Turbo），以恶劣条件检验提示词质量；交付时换强模型（70B/DeepSeek等）对业务兜底
- **串行 vs 并行路由**: 单一意图走串行路由（意图识别→单一路径）；复合意图（如退货+退款同时需物流+财务）走并行路由
- **双次模型调用优化**: 订单查询走两次模型（意图识别+结果翻译）导致4秒延迟；优化为工具返回后直接在提示词中翻译，减为约2秒
- **LangSmith可观测性**: 通过LangSmith追踪完整调用链路，定位性能瓶颈和RAG检索质量

## Key Takeaways

- LangChain 1.0解决不了的问题，用其底层LangGraph；LangGraph解决不了，用LangChain 0.x
- 意图识别的关键在提示词工程，而非框架使用
- MVP开发前逐一测试各组件（模型调用、RAG、路由、意图识别、外部接口），确保每个部分独立可用再组合
- 关键词优先路由（人工>订单>知识库）比意图识别快且稳定，适合作为第一层过滤
- SQLite仅用于演示，生产环境向量数据库推荐放GPU节点，关系数据库用PostgreSQL
- LangSmith环境变量一旦配置，LangChain和LangGraph自动继承追踪

## See Also

- [[090-project-requirements-prototype-1]]
- [[092-core-interaction-capabilities-1]]
- [[langgraph-fundamentals]]
- [[intent-recognition-pipeline]]
- [[rag-architecture]]
