---
tags: [rag, retrieval, embedding, vector-store, reranking, chunking, query-expansion, hyde, llm]
source: https://u.geekbang.org/lesson/818?article=927438
---

# RAG 架构（Retrieval-Augmented Generation）

RAG 是一种将传统信息检索技术与大模型生成能力结合的**处理方法（解决方案）**，核心目标是通过外部知识增强大模型的回答准确性，消除幻觉。

## Key Concepts

### 为什么需要 RAG

大模型产生幻觉的根本原因：训练数据过时或不足、领域知识缺失、模糊输入导致语义冲突。RAG 通过在提示词中注入检索到的相关文档片段，让模型"有据可依"，而非凭空生成。

长上下文（如 128K token 窗口）无法替代 RAG 的原因：
- **注意力稀释**：文档过长时模型错过关键答案
- **语义冲突**：不同文档间矛盾内容无法自动辨别权威性

### 双流程架构

```
离线索引流程（Offline Indexing Pipeline）
原始文档 → 解析（PDF/Word/图片）→ 分块（Chunking）→ 嵌入（Embedding）→ 存入向量库

在线查询流程（Online Query Pipeline）
用户问题 → [检索前优化] → 向量/关键词检索 → [重排序] → 提示词组合 → LLM 生成 → 输出
```

### 五阶段框架

1. **加载（Loading）**：多格式文件解析，附加元数据（文件名、时间、溯源 URL）
2. **索引（Indexing）**：分块 + 嵌入 + 存储（向量库或原文库）
3. **检索（Retrieval）**：向量检索（语义相似度）+ 关键词检索（BM25）
4. **重排（Reranking）**：交叉编码器模型对召回结果精排
5. **生成（Generation）**：片段 + 问题 + 提示词模板 → LLM 输出

### 检索前优化技术

| 技术 | 说明 |
|------|------|
| 问题改写 | 补充用户角色、扩写、反问澄清 |
| HyDE | 先生成假想答案再检索，适合极模糊问题 |
| Multi-step Query | 复杂问题拆解为多个子查询 |
| 意图识别 | RAG 路由分发（Agentic RAG） |

### RAG 演进路径

```
提示词工程 → 朴素 RAG → 进阶 RAG → 模块化 RAG → Agentic RAG
```

### RAG 评估指标

**检索评估**：精确率、召回率、F1、MRR（平均倒数排名）、MAP、NDCG

**生成评估**：
- 上下文相关性：检索内容与问题是否相关
- 答案忠实性：回答是否基于检索内容（而非幻觉）
- 答案相关性：最终回答是否切题

## Key Takeaways

- RAG 的本质是在提示词中插入参考信息，不是一个具体框架，而是一种解决方案
- 分块是 RAG 的必要条件：若不分块，直接把整个文档送入大模型即可，无需 RAG
- 两路检索（向量 + 关键词）是生产级 RAG 的标准配置
- 问题改写只针对检索过程，不影响生成时传给 LLM 的原始问题语义
- RAG 评估中，大模型自动评估准确率目前仍低（约 40-79%），建议人工评估

## See Also

- [[llamaindex-rag]] — LlamaIndex 框架实现 RAG 的具体方式
- [[qanything-rag]] — 网易 QAnything 企业级 RAG 框架分析
- [[rag-improvement-methods]] — 提升 RAG 效果的进阶方法
