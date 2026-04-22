---
tags: [qanything, rag, enterprise-rag, hybrid-retrieval, reranking, bm25, elasticsearch, milvus, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927442
wiki: wiki/concepts/qanything-rag.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在 RAG 系统中，"top-k 问题"是什么？为什么 k 值既不能太大也不能太小？
2. BM25 关键词检索与向量检索各有什么优势？为什么企业级 RAG 要将两者结合使用？
3. HyDE（Hypothetical Document Embeddings）的核心思路是什么？它解决了什么检索场景下的问题？

---

# 026: 完整的 RAG 分析-QAnything（二）

**Source:** [4完整的 RAG 分析-QAnything2](https://u.geekbang.org/lesson/818?article=927442)

## Outline
- [问题改写策略回顾](#问题改写策略回顾)
- [HyDE 假设文档方法](#hyde-假设文档方法)
- [为什么选择 QAnything 作为分析对象](#为什么选择-qanything-作为分析对象)
- [QAnything 系统架构](#qanything-系统架构)
- [QAnything 代码阅读方法论](#qanything-代码阅读方法论)
- [混合检索机制](#混合检索机制)
- [两段式 Rerank 算法](#两段式-rerank-算法)
- [查询重写与上下文管理](#查询重写与上下文管理)
- [Token 成本控制](#token-成本控制)

---

## 问题改写策略回顾

问题改写的前提：只针对用户**经常**提出的、问法比较固定的问题进行改写，是一种事后找补的做法，而非预测性的优化。

四种改写方式：
1. **角色补充**：将用户身份（如"开发工程师"）融入问题（"开发工程师的注意事项有哪些"）
2. **扩写细化**：将模糊问题拆解为多个具体子问题
3. **反问澄清**：让用户补充信息（"你想问哪个岗位的职责"）
4. **步骤拆分（Multi-step）**：将复杂问题分解为多个单步查询，由 LlamaIndex 的 `SubQuestionQueryEngine` 自动完成

改写后务必进行**评测**（自我评估 + 基于反馈的评估），确认改写是否真的提升了回答质量，不能无脑全量改写。

## HyDE 假设文档方法

HyDE（Hypothetical Document Embeddings）流程：
```
用户问题 → 大模型生成假想答案（不参考知识库）→ 用假想答案检索真实文档 → 基于真实文档生成最终回答
```

适用场景：用户问题描述极其模糊，无法直接检索到相关文档时。LlamaIndex 已内置此检索策略。

## 为什么选择 QAnything 作为分析对象

QAnything 是网易开源的企业级 RAG 框架，选择它作为学习对象的原因：
1. **代码量少**：比 Dify、RAGflow 等框架代码更短小精悍，适合阅读
2. **企业级设计**：包含真实生产环境中的常见设计决策（不是玩具代码）
3. **解决了 top-k 问题**：创新的两段式过滤算法
4. **混合检索**：向量 + 关键词双路检索
5. **基于 LangChain 实现**：可以仿照用 LlamaIndex 改写，加深理解

## QAnything 系统架构

QAnything 通过 Docker Compose 部署，核心组件：

```
┌─────────────────────────────────────────────────┐
│ QAnything Docker Compose                        │
├──────────────┬──────────────┬───────────────────┤
│ Elasticsearch│  Milvus 集群  │  MySQL            │
│ (关键词检索) │  etcd + Minio │  (用户/密码/文本) │
│              │  + Milvus     │                   │
│              │ (向量数据库)  │                   │
├──────────────┴──────────────┴───────────────────┤
│  LLM Server        Embedding Server             │
│  PDF Server        OCR Server                   │
│  File Add Server                                │
├─────────────────────────────────────────────────┤
│  QAnything Main (Sanic API / FastAPI)           │
│  • /qanything/api/local_doc_qa                  │
│  • 知识库管理 API                               │
│  • 文件上传 API                                 │
└─────────────────────────────────────────────────┘
```

关键技术选型：
- **Elasticsearch**：关键词检索（BM25）
- **Milvus**：向量数据库（Minio + etcd + Milvus 三件套组成）
- **MySQL**：关系型存储（用户账户、文本元数据）
- **Sanic**：异步 Python Web 框架（提供 RESTful API）

## QAnything 代码阅读方法论

读懂陌生企业级代码的通用步骤：

```
1. 找 Docker 入口文件（entrypoint.sh）
      ↓
2. 定位 Web 服务启动脚本（找监听的 IP + Port + API 前缀）
      ↓
3. 找 Sanic/FastAPI 路由注册文件
      ↓
4. 定位核心业务 handler（如 local_document_chart）
      ↓
5. 跟踪 handler 到类定义（LocalDocumentQA 类）
      ↓
6. 阅读类的核心方法（get_source, rerank, generate）
```

此方法同样适用于 Dify、RAGflow、扣子等框架。

## 混合检索机制

QAnything 的 `get_source` 方法实现混合检索：

```python
# 伪代码
if hybrid_retrieval:
    # 双路检索
    vector_results = milvus.query(query_embedding, top_k)   # 向量检索
    keyword_results = elasticsearch.bm25(query_text, top_k) # 关键词检索（BM25）
    
    # 合并去重
    merged = deduplicate(vector_results + keyword_results)
    return merged
else:
    return milvus.query(query_embedding, top_k)  # 仅向量检索
```

关键工程点：
- 两路检索结果**必须去重**（同一 Node 可能被两路都召回）
- 通过**开关控制**是否启用混合检索（业务层可配置）
- 合并后结果进入下一阶段重排

## 两段式 Rerank 算法

这是 QAnything 最核心的创新——用于解决**top-k 问题**（无法确定 k 值的最优大小）。

**问题背景**：当知识库规模达到 60 万+ 节点时，无论 k 取多少都效果不好：
- k 太小 → 遗漏信息
- k 太大 → 引入大量无关噪声

**两段式过滤算法**：

```
第一层（绝对阈值过滤）：
  丢弃相似度分值 < 0.28 的节点（经验值，基于业务调整）
  → 去除完全不相关的内容

第二层（相对差异过滤）：
  计算 (当前分值 - 上一个分值) / 最高分值
  若差值 > 50%，停止添加后续节点
  → 去除质量明显下降的内容
  
  示例：
  节点分值: [0.85, 0.72, 0.45]
  第一层：0.45 < 0.28? 否，保留
  第二层：(0.85 - 0.72) / 0.85 = 15.3% < 50%，继续
           (0.72 - 0.45) / 0.85 = 31.8% < 50%，继续
  
  节点分值: [0.85, 0.45, 0.30]
  第二层：(0.85 - 0.45) / 0.85 = 47% < 50%，继续
           (0.45 - 0.30) / 0.85 = 17.6% < 50%，继续
  
  节点分值: [0.85, 0.30]
  第二层：(0.85 - 0.30) / 0.85 = 64.7% > 50%，停止
```

这样无需指定 k 值，自动根据质量分布决定保留数量。

## 查询重写与上下文管理

QAnything 的问题改写逻辑（LLM 驱动）：

```python
# 提示词逻辑（伪代码）
# 系统提示：判断当前问题是否与历史对话语义连贯
# - 若连贯（如"那后天呢"接在天气查询后）→ 改写为独立完整的问题
# - 若独立（如"北京哪里适合放风筝"在天气对话后）→ 不改写

history = get_conversation_history()
current_query = get_current_input()
rewritten_query = llm.rewrite_if_needed(history, current_query)
```

连贯性判断示例：
- 用户："北京明天出门需要带伞吗？" → AI 回答：不需要
- 用户："那后天呢？" → **需要改写** → "北京后天出门需要带伞吗？"
- 用户："北京哪里适合放风筝？" → **不改写**（语义独立）

## Token 成本控制

面向海量知识库的 token 预算管理：

```
最大可用上下文 = 总窗口大小 - 预留输出 token - 安全边界 - 历史对话 token - 系统提示词 token
```

- 对历史对话 token 数量进行检查和截断
- 建议将日志级别设为 `INFO`（默认 `ERROR`），才能看到每次查询的 token 使用明细

## Connections
- → [[qanything-rag]]
- → [[rag-architecture]]
- → [[llamaindex-rag]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话描述 QAnything 的两段式 Rerank 算法——第一层和第二层分别过滤什么，各用什么阈值判断，最终如何做到不需要预设 k 值？
2. QAnything 的混合检索如何将 Elasticsearch 和 Milvus 的结果合并？合并时必须处理哪个工程问题？
3. QAnything 的查询改写逻辑是如何判断"是否需要改写"的？请用具体对话示例说明"需要改写"和"不改写"两种情况的区别。

> [!example]- Answer Guide
> 
> #### Q1 — Two-Stage Rerank Algorithm
> 
> 第一层用绝对阈值（0.28）丢弃相似度过低的节点；第二层计算相邻节点分值差除以最高分，若差值超过 50% 则停止添加后续节点，从而根据质量分布自动决定保留数量，无需人工指定 k。
> 
> #### Q2 — Hybrid Retrieval Deduplication
> 
> `get_source` 方法同时向 Milvus 发起向量查询、向 Elasticsearch 发起 BM25 查询，将两路结果合并后必须**去重**——同一节点可能被两路同时召回，去重后再进入 Rerank 阶段。
> 
> #### Q3 — Query Rewrite Decision Logic
> 
> LLM 判断当前问题与历史对话是否语义连贯：若连贯（如"那后天呢"紧接天气查询），则改写为独立完整的问题；若语义独立（如天气对话后突然问"北京哪里放风筝"），则不改写，直接使用原始问题检索。
