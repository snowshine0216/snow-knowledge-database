---
tags: [rag, knowledge-graph, neo4j, multi-hop, hybrid-retrieval, entity-extraction, llm, vector-db]
source: https://u.geekbang.org/lesson/818?article=928269
---
# RAG + Knowledge Graph 融合检索

模块三第二个练习把传统 RAG 与知识图谱（Neo4j）合并成一个三路并行检索系统：向量库找相似性、关键词找精确匹配、图谱做多跳推理。当业务包含"实体 A → 中间实体 → 实体 B"这种关系链（法律、股权、医疗实体引用），单纯的向量切片会断链 — 关系信息被切到不同 chunk 后无法重建；图谱用 `(实体)-[关系]->(实体)` 三元组显式存储跨段关系，多跳查询直接在图上遍历。

> 录音注：本节录音仅捕获了课程的第二部分（RAG + KG 融合），第一部分基于 FAISS/Milvus 的 FAQ 系统未包含。

## Key Concepts

- **多跳推理（Multi-Hop Reasoning）**：从一个实体沿关系链跳到另一个实体。示例 — "王武与 A 集团是什么关系？" 答：王武 → 管理 → C 基金 → 投资 → A 集团。RAG 单靠向量相似度无法还原这条链。
- **演示数据集**：A 集团 / B 资本 / C 基金 / D 科技 / E 实验 / F / G 公司加张三、李斯、王武三位人物，密集表达控股、投资、管理三类关系。文档故意从 3 段拆成 8 段，模拟切片粒度过细的真实问题。
- **三路并行检索架构**：question → 向量检索（Faiss/Milvus）+ 关键词检索（jieba + metadata）+ 图谱检索（Neo4j Cypher），三类结果分别贴到 prompt 中让 LLM 权衡，**不强行做统一打分**。
- **基础设施**：Neo4j 默认端口 7687、账号 `neo4j`/`password`，安装如 MySQL 一路 Next；jieba 做中文分词；scikit-learn / numpy 做向量计算；老师为该练习单独建了 venv 固定全部版本。
- **实体与关系提取**：用 LLM 输出 JSON。常见名词提取较准，**专有名词准确率显著下降**，token 消耗也不小。关系统一表示为 `Source --Target--> Target`（如 `B 资本 Target A 集团` = B 控股 A），便于直接写入图谱。
- **Joint Score 的陷阱**：把向量分与图谱分加权平均会出问题 — 当图谱命中分高、向量分低时，平均分被向量拉低，正确答案排名下降。**结论：不强求统一分数，让大模型在 prompt 中自行判断。**
- **构建顺序**：先把标准 RAG 跑通（与模块三 3-1 完全一致），再叠加 Neo4j 能力（`extract_entities`、`graph_query_direct/multihop`、改进版 `improved_multi_query_qa`）。不要并行构建。

## Key Takeaways

- 知识图谱不是银弹 — **只在多跳必要时引入**。法律、股权、医疗实体关系是典型场景；普通问答用纯 RAG 即可。
- 切片粒度过细会让 RAG 失效，但图谱能补上 — 这是引入图谱最直接的收益。
- 三路并行 + LLM 自由权衡 优于硬打分融合。
- LLM 抽实体 / 关系是必经步骤，但要做好 **专有名词不准** 和 **token 高消耗** 的预期。
- 增量构建的工程节奏：RAG 先通，Neo4j 后接，调试成本最低。
- 真实业务里 RAG 的两类落地形态：普通 web 问答（纯向量）和法律风险规避（必须接图谱）。

## See Also

- [[023-rag-deconstruction]] — RAG 基础架构与五阶段框架
- [[024-llamaindex-rag-implementation]] — LlamaIndex 五行 RAG
- [[028-rag-improvement-methods-1]] — RAG 效果提升方法（一）
- [[029-rag-improvement-methods-2]] — RAG 效果提升方法（二）
- [[065-knowledge-graph-long-term-memory]] — 基于知识图谱的长期记忆管理
