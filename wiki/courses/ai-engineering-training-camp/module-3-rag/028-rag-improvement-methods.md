---
tags: [rag, rag-improvement, chunking, hybrid-retrieval, reranking, query-rewriting, self-rag]
source: https://u.geekbang.org/lesson/818?article=927444
---

# RAG 效果提升方法

提升 RAG 系统效果的常用方法，每种方法可独立应用，组合使用效果更佳。

## Key Concepts

### 1. 高级分块策略（Advanced Chunking）

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| 固定大小分块 | 按 token 数切分 | 简单文档，快速原型 |
| 语义分块 | 按语义边界切分（段落、标题） | 结构化文档 |
| 层级分块（父子关系） | 小块存索引，大块提供上下文 | 需要兼顾精度与上下文 |
| 文件级索引 | 以文件为单位，返回最相关文件 | 文档分类/路由场景 |

父子关系索引示例：
```
父块（大段落）→ 用于提供生成上下文
子块（小句子）→ 用于精确检索
切片元数据中保存父文件名，实现父子关联
```

### 2. 混合检索（Hybrid Retrieval）

结合向量检索和 BM25 关键词检索：

```
向量检索（Semantic）：捕获语义相似度，适合模糊查询
BM25 关键词检索：精确匹配实体/专有名词
混合后去重，两路互补
```

实现关键点：
- 两路结果必须去重
- 通过开关控制是否启用（按业务需求）
- 合并后进入 Rerank 阶段

### 3. 重排序（Reranking）

两阶段检索策略：
- **粗排（Bi-Encoder）**：向量相似度，速度快，top-k 粗筛（如 k=20）
- **精排（Cross-Encoder Reranker）**：输入 query + chunk 的 token 拼接，更精准但慢

代表性 Rerank 模型：
- `BAAI/bge-reranker-v2-m3`：中英文均衡
- `DashScope rerank`：对中文更敏感，适合中文文档

QAnything 两段式 Rerank（见 [[qanything-rag]]）解决了固定 top-k 的局限性。

### 4. 查询改写（Query Rewriting）

四种改写策略：
1. **角色补充**：嵌入用户身份信息
2. **扩写细化**：模糊问题 → 具体子问题
3. **多步分解**：复杂问题 → 多个独立查询
4. **HyDE**：生成假想答案后检索真实文档

注意：改写只用于检索阶段，生成阶段必须保留用户原始问题语义。

### 5. Self-RAG 模式

让模型自我判断是否需要检索：
- 若问题在模型知识范围内 → 直接回答
- 若需要外部知识 → 触发检索
- 对生成结果进行自我评估，必要时重新检索

### 6. 文档解析质量提升

RAG 效果差的根源常在于文档解析质量低：
- Word：正确提取正文（排除页眉页脚）
- PDF：OCR 或多模态模型处理扫描件
- 图片：多模态模型提取文字信息
- 表格：结构化解析后转为文本

## Key Takeaways

- RAG 效果优化应从数据质量（文档解析、分块）开始，而非直接调参
- 混合检索（向量 + BM25）是最具性价比的单项改进
- Reranker 模型选型需匹配文档语言和内容类型
- 查询改写有副作用，必须配合评测，不能无脑全量开启
- Self-RAG 增加了系统复杂度，适合对准确性要求极高的场景

## See Also

- [[rag-architecture]] — RAG 基础架构
- [[qanything-rag]] — 企业级 RAG 工程实践（两段式 Rerank）
- [[llamaindex-rag]] — LlamaIndex 实现参考
