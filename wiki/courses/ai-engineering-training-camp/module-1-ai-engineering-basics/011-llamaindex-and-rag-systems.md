---
tags: [llamaindex, rag, knowledge-augmentation, vector-db, ocr, retrieval, ai-engineering, agent]
source: https://u.geekbang.org/lesson/818?article=927428
---

# LlamaIndex 与 RAG 知识增强系统

RAG（检索增强生成）的本质是**知识增强推理**——在模型推理前将外部知识显式注入到上下文，而非要求模型自己调用工具去查。LlamaIndex 是目前最优雅的 RAG 框架，代码设计清晰，适合学习 RAG 底层原理。

## Key Concepts

- **知识增强 vs. Tool Calling**：RAG 在推理前注入上下文（考前复习），Tool Calling 是推理中模型决策调用（考试中翻书）。两者根本区别在于模型的工作时机和角色。
- **RAG 核心价值**：知识可追溯、可更新；解耦模型参数与知识库；突破参数静态性。
- **LlamaIndex 两阶段**：离线索引（`SimpleDirectoryReader` → `VectorStoreIndex`，只做一次）+ 在线查询（`as_query_engine().query()`，每次查询）。
- **扩展性设计**：更换加载器（`PDFReader`/`DocxReader`）或向量数据库（FAISS）只需替换对应组件，其余代码不变——优秀框架设计范例。
- **OCR + RAG**：扫描件/图片先经 PaddleOCR 识别为文本，再走标准 RAG 流程——模式不变，组件替换。
- **混合检索**：纯向量检索不足以满足企业场景（合同编号需精确匹配、金额需数值比对）→ 向量 + ES 关键词 + 关系数据库 + 知识图谱三层融合，查询时 Rerank 聚合。
- **企业 RAG 架构原则**：先拆业务流（开始→结束节点），识别哪些子任务匹配 RAG/Agent 模式，再套框架，无法匹配的继续拆。

## Key Takeaways

- LlamaIndex 代码比 LangChain 优雅得多，通读核心代码是掌握 RAG 原理的最佳方式
- 索引创建（parse + embed）只做一次，查询时直接加载已有索引
- 向量检索≠RAG，RAG 是一套完整的知识注入+推理范式，向量只是检索手段之一
- 企业复杂场景必然需要混合检索：语义（向量）+ 精确（ES）+ 数值（DB）
- RAG 的"变形"本质不变：只替换加载和检索组件，推理+生成逻辑保持不动

## See Also

- [[009-function-calling-and-mcp-basics]]
- [[010-langchain-core-components-detailed]]
- [[006-what-is-ai-engineering]]
