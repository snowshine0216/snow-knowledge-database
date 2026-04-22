---
tags: [rag, knowledge-graph, neo4j, multi-hop, hybrid-retrieval, entity-extraction, llm, vector-db]
source: https://u.geekbang.org/lesson/818?article=928269
wiki: wiki/courses/ai-engineering-training-camp/module-3-rag/031-rag-knowledge-graph-fusion.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 什么是"多跳推理"？为什么你认为传统向量RAG在这类场景下可能失败？
2. 知识图谱用三元组表示关系，请写出你理解的三元组基本形式，并举一个公司股权关系的例子。
3. 如果要把向量检索结果和图谱检索结果合并成一个分数排序，你会遇到什么问题？

---

# 031: RAG + Knowledge Graph 融合检索

**Source:** [模块三实践二 构建一个基于 FAISS/Milvus 的 FAQ 检索系统（第二部分）](https://u.geekbang.org/lesson/818?article=928269)

> **Note:** 本次录音仅捕获了课程的第二部分 — RAG 与知识图谱融合检索。
> 第一部分（基于 FAISS/Milvus 的 FAQ 系统）未包含在录音中。

## Outline
- [Overview](#overview)
- [Why Knowledge Graph: Multi-Hop Documents](#why-knowledge-graph-multi-hop-documents)
- [Demo Domain: Company Ownership](#demo-domain-company-ownership)
- [System Architecture](#system-architecture)
- [Entity and Relation Extraction](#entity-and-relation-extraction)
- [Three Demo Queries](#three-demo-queries)
- [Implementation: All-in-One Class](#implementation-all-in-one-class)
- [Joint Scoring Caveat](#joint-scoring-caveat)
- [Final Prompt Composition](#final-prompt-composition)
- [Build Order: RAG First, Graph Second](#build-order-rag-first-graph-second)
- [Chapter Summary](#chapter-summary)

---

## Overview

第二个练习的目标是把传统 RAG 与知识图谱融合，让大模型能够完成 **多跳推理**（multi-hop reasoning）。RAG 的向量检索擅长相似性查找，但在"实体 A 与实体 C 之间通过中间实体 B 关联"这种场景中往往断链 — 上下文被切到不同 chunk，关联关系被切碎。知识图谱通过显式的实体-关系-实体链路补足这块。

适用边界：
- 法律领域（实体多、引用多、互相嵌套）
- 公司股权 / 投资关系
- 任何"谁的客户的客户"、"A 的老板的老板"这类需要跨实体跳转的问句

> 警告：图谱构建对 token 消耗极大；非多跳场景用纯 RAG 已经足够，不要盲目引入图谱。

---

## Why Knowledge Graph: Multi-Hop Documents

多跳文档定义：从一个实体出发，沿着关系链跳到另一个实体；该实体再通过新关系跳到第三个实体；以此类推。

形式化：
```
Entity₁ ──relation₁──> Entity₂ ──relation₂──> Entity₃
```

如果我们想在 Entity₁ 与 Entity₃ 之间建立直接关联，传统 RAG 在两种情况下会失效：
1. **语义不连贯** — 两个实体的描述在文档中相距很远，向量检索无法把它们拉到同一上下文窗口。
2. **跨 chunk 切割** — RAG 切片把 A→B 与 B→C 拆到不同 chunk，检索到 chunk 1 时缺少 chunk 2 的关系信息。

知识图谱用 `(实体)-[关系]->(实体)` 三元组显式存这种跨段关系，多跳查询直接在图上做 BFS / DFS。

---

## Demo Domain: Company Ownership

为了演示多跳，老师选了"公司控股关系"这个关系密集的小图：

| 实体 | 类型 | 关系 |
|---|---|---|
| A 集团 | company | 张三任董事长 |
| B 资本 | company | 控股 A 集团；李斯创立 |
| C 基金 | company | 持有 A 集团 25%（投资）；王武管理 |
| D 科技 | company | A 集团控股 |
| E 实验 | company | A 集团控股 |
| F、G 公司 | company | D 科技控股 |

典型多跳问句：**"王武与 A 集团是什么关系？"**
- 直接关系：无（王武不直接持有 A 集团）
- 多跳路径：王武 → 管理 → C 基金 → 投资 → A 集团

向量 RAG 单独无法回答这类问题；图谱遍历可一步还原。

---

## System Architecture

最终系统是 **三路并行 + 混合融合** 的检索架构：

```
question ──┬─> 向量检索 (Faiss / Milvus)  ──┐
           ├─> 关键词检索 (jieba + metadata) ──┼─> 拼接到 prompt → LLM ──> answer
           └─> 图谱检索 (Neo4j Cypher) ─────┘
```

**基础设施依赖**：
- **Neo4j** — 图数据库；默认端口 `7687`，默认账号 `neo4j` / `password`，安装类似 MySQL（一路 Next）。
- **Faiss** 或 **Milvus** — 向量库（沿用模块三第一节的设施）。
- **jieba** — 中文分词，用于关键词索引。
- **scikit-learn / numpy** — 向量相似度与数值计算辅助。
- **独立 venv** — 因依赖较多，老师为该练习单独建了 venv，并在 `requirements.txt` 中固定全部版本。

---

## Entity and Relation Extraction

提取流程由 LLM 完成（输出 JSON 格式，便于程序消费）：

1. **实体提取**：从原始文档中识别公司名、人名等实体，附带 `type` 与 `confidence`。
   - 示例输出：`{"entity": "A 集团", "type": "company", "confidence": 0.9}`
2. **关系提取**：识别实体对之间的二元关系，存为可写入图谱的形式。
   - 老师把"控股"统一表达成 `Source --Target--> Target`：
     - `B 资本 Target A 集团`（B 控股 A）
     - `C 基金 Target A 集团`（C 投资 A）
     - `A 集团 Target D 科技`（A 控股 D）

> **限制**：LLM 对 **常见名词** 的实体与关系提取效果较好；对 **专有名词**（行业术语、生僻人名）准确率会显著下降。token 消耗也不小，规模大时需评估成本。

文档预处理时，老师故意把原本应该是 3 段的公司文档（基本信息 / 股权结构 / 控股架构）**拆成 8 段**，模拟真实场景中切片粒度过细的问题，凸显图谱对 RAG 的补足作用。

---

## Three Demo Queries

| # | 问题 | 主要靠哪一路 |
|---|---|---|
| 1 | A 集团最大的股东是谁？ | 图谱定位股东集合（B、C），向量给出 B 占 60% → B |
| 2 | B 资本控制哪些公司？ | 图谱直接关系查询 |
| 3 | A 集团有多少级控股关系？ | 图谱多跳遍历（最考验大模型综合能力） |

第 3 问的图谱推理结果：
```
Layer 0:  B 资本, C 基金 ──控股──> A 集团
Layer 1:  A 集团 ──控股──> D 科技, E 实验
Layer 2:  D 科技 ──控股──> F, G
```

向量检索难以一次性还原层级；图谱遍历轻易完成。

---

## Implementation: All-in-One Class

老师把所有功能放进一个类 / 一个文件（all-in-one）方便讲解，但建议生产环境拆分。核心函数：

| 函数 | 作用 |
|---|---|
| `clear_vector_db()` | 清空向量库 |
| `clear_graph_db()` | 清空 Neo4j |
| `clear_all()` | 同时清空向量与图 |
| `load_documents()` | 文档加载 + 切片 |
| `add_to_vector_db()` | 写入向量库 |
| `search_vector_db()` | 向量检索 |
| `extract_keywords()` | 关键词提取（jieba），用于 metadata 匹配 |
| `extract_entities()` | 从问题中提取实体（公司名、人名） |
| `graph_query_direct()` | 一跳关系查询（类似 SQL `SELECT WHERE`） |
| `graph_query_multihop()` | 多跳关系查询 |
| `joint_score()` | 混合评分（见下文 caveat） |
| `improved_multi_query_qa()` | 改进版多轮问答（RAG + 图谱） |

工作流：
1. 启动时 `clear_all()` 让数据库归零，重新建索引（演示用，生产不会这样做）。
2. 文档预处理：向量库写入 8 段；LLM 提取实体与关系，写入 Neo4j。
3. 提问时：从问题中提 entity → 三路并行检索 → 把结果拼到 prompt → LLM 出答案。

---

## Joint Scoring Caveat

老师同时实现了一个 "joint score"，把向量分与图谱分加权平均。**实战中不推荐直接用**：

- 当图谱命中分很高、向量命中分很低时，平均值反而被向量拉低，导致正确答案排名下降。
- 简单算术平均忽略了不同检索通道的可信度差异。

实践建议：
- 不强求统一分数，把三路结果分别贴到 prompt 中，让大模型自己权衡。
- 如果一定要统一打分，应该按通道权重 + 阈值过滤，而不是平均。

---

## Final Prompt Composition

最终送给 LLM 的 prompt 模板（结构化拼接）：

```
请基于以下三类参考信息回答问题：

[文档内容]
{vector_db.search(question)}

[图谱关系]
{neo4j.query(entities_in_question)}

[关键词匹配]
{keyword_search(question)}

问题：{question}
```

让大模型自行判断哪一路最相关，避免过早做硬性打分。

---

## Build Order: RAG First, Graph Second

老师强调的**实现顺序**：

1. **先把标准 RAG 跑通**（与模块三 3-1 的代码完全一致）。
2. **再在 RAG 类上叠加 Neo4j 能力** — 新增 `extract_entities`、`graph_query_*`、改进的 `improved_multi_query_qa`。
3. 不要一开始就两个一起搭 — RAG 是熟悉的，Neo4j 是新的；先打通熟悉路径，再增量引入新依赖，调试成本最低。

> 这个顺序与模块三 3-1 的设计原则一致：**功能分函数、文件分模块、增量改良，避免一次性大改**。

---

## Chapter Summary

- **何时引入知识图谱**：仅当业务真的有多跳查询、跨实体引用（法律、股权、医疗实体关系）时。
- **图谱不是银弹**：构建成本高、token 消耗大、对专有名词提取不准。
- **三路并行优于单路融合**：让大模型在 prompt 中自行权衡，避免人为打分误差。
- **实现顺序**：标准 RAG → 添加 Neo4j → 改进多轮问答；增量构建。
- **真实业务里 RAG 落地的两种典型形态**：
  1. 普通 web 服务器问答（纯向量 RAG 即可）
  2. 法律 / 风险规避（必须引入知识图谱做多跳推理）


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释，为什么"王武与A集团是什么关系"这个问题用纯向量RAG无法回答？图谱是通过什么机制解决的？
2. 本课的三路并行检索架构是哪三路？老师为什么不推荐将三路结果做joint score加权平均，而是直接拼到prompt里让LLM权衡？
3. 老师为什么强调"先把标准RAG跑通，再叠加Neo4j能力"这个实现顺序？这背后的调试逻辑是什么？

> [!example]- Answer Guide
> 
> #### Q1 — 向量RAG无法多跳推理
> 
> 王武不直接持有A集团，向量检索找不到直接语义关联；且RAG切片把"王武→管理→C基金"和"C基金→投资→A集团"切到不同chunk，单次检索无法还原完整路径。知识图谱以`(实体)-[关系]->(实体)`三元组显式存储跨段关系，多跳查询直接在图上做BFS/DFS，一次遍历即可还原完整路径。
> 
> #### Q2 — 三路并行检索架构设计
> 
> 三路为：向量检索（Faiss/Milvus）、关键词检索（jieba + metadata）、图谱检索（Neo4j Cypher）。不推荐joint score的原因是：当图谱命中分高、向量命中分低时，算术平均会被向量分拉低，导致正确答案排名下降；简单平均忽略了不同通道的可信度差异，不如把三路结果分别贴到prompt，让大模型自行判断哪一路最相关。
> 
> #### Q3 — 先RAG后Neo4j实现顺序
> 
> RAG是已熟悉的路径，Neo4j是新依赖；先打通熟悉路径确认基础功能正常，再增量引入新依赖，出问题时可以快速定位是新增部分引起的，调试成本最低。这体现了"功能分函数、增量改良、避免一次性大改"的模块化开发原则。
