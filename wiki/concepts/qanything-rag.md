---
tags: [qanything, rag, enterprise-rag, hybrid-retrieval, reranking, bm25, milvus, elasticsearch, netease]
source: https://u.geekbang.org/lesson/818?article=927441
---

# QAnything — 企业级 RAG 框架分析

QAnything 是网易开源的企业级 RAG 框架，以代码精简、工程实用著称，解决了普通 RAG 系统难以处理海量文本（60 万+ 节点）的核心问题。

## Key Concepts

### 系统架构

```
┌─────────────────────────────────────────────────┐
│ QAnything（Docker Compose 部署）                │
├──────────────┬──────────────┬───────────────────┤
│ Elasticsearch│  Milvus 集群  │  MySQL            │
│  BM25 关键词 │ etcd + Minio  │ 用户/密码/文本元数据│
│    检索      │  + Milvus     │                   │
├──────────────┴──────────────┴───────────────────┤
│ LLM Server | Embedding Server | PDF/OCR Server  │
├─────────────────────────────────────────────────┤
│  Sanic API（QAnything 主服务）                  │
│  核心类：LocalDocumentQA                        │
└─────────────────────────────────────────────────┘
```

### 核心创新：两段式 Rerank

解决 top-k 问题（任何固定的 k 值都无法最优）：

**第一层（绝对阈值过滤）**：丢弃相似度分值 < 0.28 的节点，去除完全不相关内容

**第二层（相对差异过滤）**：
```
差值 = (当前节点分值 - 上一节点分值) / 最高分值
若差值 > 50% → 停止添加后续节点
```

此算法无需指定 k，自动根据分值分布动态决定保留数量。

### 混合检索（Hybrid Retrieval）

```python
# 双路检索
vector_results  = milvus.query(embedding, top_k)        # 语义检索
keyword_results = elasticsearch.bm25(query_text, top_k)  # BM25 关键词检索

# 合并去重（两路可能召回相同节点）
merged = deduplicate(vector_results + keyword_results)
```

通过开关控制是否启用混合检索，纯向量检索和混合检索可按业务切换。

### 查询重写（LLM 驱动）

判断当前问题是否与历史对话语义连贯：
- **连贯**（如"那后天呢"）→ 改写为独立完整问题
- **独立**（语义无关）→ 不改写

提示词驱动的智能判断，避免无脑全量改写导致语义失真。

### 代码阅读方法论

读懂企业级 RAG 框架的通用步骤：
1. Docker entrypoint.sh → 找启动入口
2. 定位 Web 服务（监听 IP + Port）
3. 找路由注册文件（Sanic/FastAPI routes）
4. 定位核心 handler → 跳转到类定义
5. 阅读核心方法（检索 → 重排 → 生成）

### LocalRAG 仿写结构（基于 LlamaIndex）

```
FastAPI 路由层
  ├── POST /upload_data       → 文件存储
  ├── POST /create_knowledge_base → 建立索引 + 持久化
  └── GET  /chart             → RAG 对话
      └── get_model_response()
          ├── 恢复持久化索引
          ├── 粗排（top-k=20）
          ├── 精排（DashScope Rerank 模型）
          └── 流式生成（LLM stream）
```

Gradio 作为调试界面，快速暴露参数（模型选择、温度、召回数量、相似度阈值）。

## Key Takeaways

- 两段式 Rerank 是解决海量文本 top-k 问题的优雅方案，比固定 k 值更鲁棒
- 混合检索（向量 + BM25）是企业级 RAG 的标准配置，去重不可省略
- QAnything 的整个核心逻辑集中在 `LocalDocumentQA` 单个类中，架构清晰
- Rerank 模型的选择需匹配业务场景（如 DashScope rerank 对中文敏感，对代码不敏感）
- 生产级 RAG 必须考虑：Token 预算管理、连接重试、持久化存储、多路检索去重

## See Also

- [[rag-architecture]] — RAG 架构原理
- [[llamaindex-rag]] — LlamaIndex 实现细节
- [[rag-improvement-methods]] — 进阶优化方法
