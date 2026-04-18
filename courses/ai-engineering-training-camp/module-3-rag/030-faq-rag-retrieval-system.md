---
tags: [rag, faiss, milvus, llamaindex, vector-db, fastapi, faq-retrieval, embedding, version-management, multi-turn-dialog]
source: https://u.geekbang.org/lesson/818?article=928268
wiki: wiki/courses/ai-engineering-training-camp/module-3-rag/030-faq-rag-retrieval-system.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. RAG 系统通常分为哪两个阶段？离线阶段和在线阶段各自负责什么？
2. 如果 FAQ 文档已经是 `Q:...\nA:...` 结构化格式，你会选择通用句子切分器还是正则表达式来切分？为什么？
3. 用 FastAPI 把向量检索服务化时，索引加载（从磁盘读入内存）应该在什么时机执行？

---

# 030: 基于 FAISS/Milvus 的 FAQ 检索系统

**Source:** [模块三实践一 构建一个基于 FAISS/Milvus 的 FAQ 检索系统](https://u.geekbang.org/lesson/818?article=928268)

## Outline
- [Overview](#overview)
- [Project Goals and Scope](#project-goals-and-scope)
- [Two-Phase RAG Architecture](#two-phase-rag-architecture)
- [configure.py: Shared Settings](#configurepy-shared-settings)
- [train.py: Offline Index Building](#trainpy-offline-index-building)
- [FAQDataLoader: Regex Over Sentence Splitter](#faqdataloader-regex-over-sentence-splitter)
- [Multi-Format Document Support](#multi-format-document-support)
- [Query Flow: Disk Load + Top-K Retrieval](#query-flow-disk-load--top-k-retrieval)
- [Full RAG Composition with Prompt](#full-rag-composition-with-prompt)
- [Multi-Turn Dialog as Short-Term Memory](#multi-turn-dialog-as-short-term-memory)
- [Knowledge Base Manager](#knowledge-base-manager)
- [FastAPI Service Wrapping](#fastapi-service-wrapping)
- [Chapter Summary](#chapter-summary)

---

## Overview

模块三的第一个综合实践：把前面几讲的 RAG 理论落到一个可上线的 FAQ 检索系统。项目使用 **LlamaIndex + FAISS/Milvus**，最终产出一个带 REST API、支持多轮对话、支持知识库管理的服务。本讲完整走通从建索引、查询、到服务化的端到端链路。

---

## Project Goals and Scope

核心功能分为三层：

1. **基础 QA**：用户提问 → 向量检索 FAQ → 匹配 top-k 条目 → LLM 回答
2. **多轮对话**：保留上一轮问答，下一轮继续时从历史中取上下文
3. **知识库管理**：动态更新、条目 CRUD、批量导入/导出、版本备份与回滚

系统对应两个主要脚本：
- `train.py` — 构建/重建向量索引（offline）
- `kb_manager.py` — 知识库管理 API（CRUD + 版本）
- 外加 FastAPI 服务把两者拼起来对外。

---

## Two-Phase RAG Architecture

RAG 工作流天然分为两阶段 — **建立索引（离线）** 与 **检索生成（在线）**。

```
┌──────────── OFFLINE ────────────┐    ┌──────────── ONLINE ─────────────┐
│  FAQ 原文档                      │    │  用户问题                        │
│    ↓ 切片                        │    │    ↓ embedding                   │
│  向量化                          │    │  向量检索 (top-k)                │
│    ↓                             │    │    ↓                             │
│  写入 FAISS / Milvus 向量库      │    │  从向量库取出相关文档切片        │
│    ↓                             │    │    ↓ 倒排重排                    │
│  持久化到磁盘 (data/face_index/) │    │  组合: 用户问题 + 文档 + 提示词  │
│                                  │    │    ↓ LLM                         │
│                                  │    │  返回答案                        │
└──────────────────────────────────┘    └──────────────────────────────────┘
```

**关键约束**：
- **索引建立极慢**，可达小时级别。**必须离线完成**，期间检索服务不可用（因为检索依赖同一向量库）。
- 在线检索路径不能包含建索引的逻辑。
- 磁盘加载索引本身也是**耗时耗 IO** 的操作 — 不能每次请求都加载，必须长驻服务。

---

## configure.py: Shared Settings

`train.py` 与 `ask` 查询共用的同一套大模型 + 向量模型 + 存储路径，统一放到 `configure.py`：

```python
class Settings:
    dashscope = DashScopeConfig(api_key=os.environ["DASHSCOPE_API_KEY"])
    embedding = EmbeddingConfig(model="text-embedding-v2", dim=512)
    vector_db_path = "data/face_index"
    faq_doc_dir    = "data/faq_documents"
    top_k = 3

settings = Settings()
```

业务代码通过 `settings.dashscope.api_key`、`settings.embedding.model` 直接取值，不重复配置。

---

## train.py: Offline Index Building

训练脚本的主逻辑：

```python
def main():
    assert os.environ.get("DASHSCOPE_API_KEY"), "Missing API key"
    assert os.path.exists(settings.faq_doc_dir), "Missing FAQ dir"

    loader = FAQDataLoader()
    system = FAQSystem(force_rebuild=True)       # True = 从零重建
    system.init(loader)
    print(f"Indexed {system.item_count} FAQ items")

main()
```

`force_rebuild` 的语义：

| 值 | 行为 | 场景 |
|---|---|---|
| `True` | 擦除索引目录 + 重建全部向量 | 文档结构变化、删除条目、首次建库 |
| `False` | 从磁盘加载已有索引，增量添加 | 日常维护：加/改单条 FAQ |

> 老师跑了两次：第一次生成 24 条；删掉一条后 `force_rebuild=True` 重跑生成 23 条。

**单一 FAQ 文件下性能尚可，但生产环境的文档较大时构建速度会慢几个数量级**，因此更要避免冷启动时重复构建。

---

## FAQDataLoader: Regex Over Sentence Splitter

内置的句子切分器（`SentenceSplitter`）会把 QA 切得稀碎。但 FAQ 文档已经是结构化 `Q:...\nA:...` 格式，**正则直接切分比句子切分更准**：

```python
QA_PATTERN = re.compile(r"Q:(.+?)A:(.+?)(?=\nQ:|\Z)", re.DOTALL)

def parse_faq(text):
    items = []
    for m in QA_PATTERN.finditer(text):
        items.append({
            "question": m.group(1).strip(),
            "answer":   m.group(2).strip(),
        })
    return items
```

每条 FAQ 变成一个 Document：

```python
documents = []
for item in items:
    doc = Document(
        text=f"{item['question']}\n{item['answer']}",
        metadata={"question": item["question"], "answer": item["answer"]},
    )
    documents.append(doc)

index = VectorStoreIndex.from_documents(documents, show_progress=True)
index.storage_context.persist(settings.vector_db_path)
```

`show_progress=True` 在构建时打印进度条，生产环境大文档构建必备。

---

## Multi-Format Document Support

FAQ 数据实际可能是多种格式：

| 扩展名 | 加载方式 | 切分器 |
|---|---|---|
| `.txt` / `.faq` | 纯文本 | 正则 Q/A |
| `.md` | Markdown | **层级切分器**（按 `##` / `###` 分节） |
| `.docx` | Word | 句子切分器 |
| `.xlsx` / `.csv` | 表格 | 按行切分 |

`FAQDataLoader` 在 `load()` 内根据扩展名走不同分支。团队实际落地时几乎总会遇到混合格式，这个结构值得抄走。

---

## Query Flow: Disk Load + Top-K Retrieval

查询路径：

```python
# 启动服务时一次性加载
storage_ctx = StorageContext.from_defaults(persist_dir=settings.vector_db_path)
index = load_index_from_storage(storage_ctx)

# 每次请求
query_engine = index.as_query_engine(similarity_top_k=settings.top_k)
response = query_engine.query("如何进行退货？")

# 打印 top-k 结果 + 相似度分
for node in response.source_nodes:
    print(f"score={node.score:.3f}: {node.node.text[:80]}")
```

- `as_query_engine(similarity_top_k=k)` — LlamaIndex 默认查询引擎，会直接调用 LLM 总结 top-k 结果
- `source_nodes` — 原始检索节点，带 `score` 相似度字段，可做倒排序

---

## Full RAG Composition with Prompt

**重点**：`as_query_engine` 已经默认拼接了提示词并调用 LLM。课件里手写一个更透明的版本：

```python
prompt = f"""请参考以下 FAQ 回答用户问题。
**如果参考内容无法回答用户问题，请直接拒绝回答，不要编造。**

[参考]
{"\n---\n".join(node.node.text for node in response.source_nodes)}

[用户问题]
{query}
"""
answer = llm.invoke(prompt)
```

关键约束句：**"如果参考内容无法回答，请拒绝回答"** — 防止大模型自由发挥，确保答案可追溯到知识库。这是 RAG 系统**可信度**的基础。

---

## Multi-Turn Dialog as Short-Term Memory

最简单的多轮：用 Python 列表存会话历史，字典条目保存角色与内容：

```python
session = {
    "id": "session-001",
    "history": [
        {"role": "user",      "content": "如何退货？"},
        {"role": "assistant", "content": "请在 7 天内..."},
        {"role": "user",      "content": "退货需要多久？"},   # 新问题
    ],
}

# 第 2 轮：把 history 全部塞到 prompt
prompt = format_history(session["history"]) + current_question
```

这种机制在 064 之后会进化为**向量化的长期记忆**；当前讲里先用最朴素的列表存储即可。

---

## Knowledge Base Manager

`kb_manager.py` 集中了所有知识库操作，对外暴露一个 `KnowledgeBaseManager` 类：

### 版本管理

```python
def backup(self):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    version_id = self.next_version()
    backup_dir = f"backup/{version_id}_{timestamp}"
    shutil.copytree(self.vector_db_path, backup_dir)
    self.update_version(version_id)
```

核心设计：**文档版本、向量库版本、索引版本一一对应**。出问题时按版本号回退到对应快照。

### FAQ CRUD

- `add_faq(question, answer, rebuild_index=True)` — 加条目；`rebuild_index` 控制是否重建
- `update_faq(id, ...)` — 更新单条
- `delete_faq(id)` — 删除单条
- `search_faq(keyword)` — 关键词模糊匹配
- `batch_import / batch_export` — CSV / JSON 批量

### 三挡重建

| `force_rebuild` 值 | 行为 |
|---|---|
| `True` | 全量重建：文档 → embedding → 新向量库 |
| `False` | 增量更新：只对新增/修改的条目做 embedding |
| `None` | 不重建：仅加载现有索引 |

参数变化决定运行时间 — 从小时级（全量）到秒级（不重建）。

---

## FastAPI Service Wrapping

把 `kb_manager.py` 和查询引擎封装成 HTTP 服务：

```python
app = FastAPI()

class AddFAQRequest(BaseModel):
    question: str
    answer: str
    rebuild_index: bool = False

kb = KnowledgeBaseManager()
faq_system = FAQSystem(force_rebuild=False)     # 启动时加载，不重建
faq_system.init()

@app.post("/v1/faq")
def add_faq(req: AddFAQRequest):
    return kb.add_faq(req.question, req.answer, rebuild_index=req.rebuild_index)

@app.put("/v1/faq/{faq_id}")
def update_faq(faq_id: str, req: AddFAQRequest):
    return kb.update_faq(faq_id, req.question, req.answer)

@app.delete("/v1/faq/{faq_id}")
def delete_faq(faq_id: str):
    return kb.delete_faq(faq_id)

@app.post("/v1/chat")
def chat(req: ChatRequest):
    history = session_store.get(req.session_id, [])
    answer = faq_system.ask(req.question, history)
    session_store.save(req.session_id, req.question, answer)
    return {"answer": answer, "session_id": req.session_id}
```

**启动时机**：`faq_system.init()` 在服务启动时跑一次，把索引从磁盘加载到内存。此后每次请求只走检索，不再加载磁盘。

**调试入口**：访问 `http://localhost:8000/docs` 打开 Swagger UI。对每个接口用 `Try it out` 验证一遍，确保通路。

**设计原则**：
- Pydantic Model 负责参数校验（缺字段直接 422，不走业务逻辑）
- 同一 URL 用不同 HTTP 方法绑定不同函数（`/v1/faq` PUT = update / DELETE = delete）
- 知识库管理 API 与问答 API 分开，前端职责清晰

---

## Chapter Summary

- **两阶段 RAG** 是铁律：建索引离线、检索生成在线，两者共用向量库但不能并发写/读。
- **冷启动代价 = 服务化的理由**：磁盘加载索引太慢 → 用 FastAPI 常驻服务，启动一次服务多次。
- **FAQ 数据优先用正则切，别用句子切分器** — 数据已结构化时，通用切分器反而破坏结构。
- **RAG 的可信度靠提示词兜底**：必须加 "参考不够就拒答" 约束，否则大模型会自由发挥。
- **知识库管理是企业级 RAG 的真正骨头**：版本管理、备份回滚、CRUD、批量导入、重建三挡一个都不能少。
- **多轮对话先用列表存**，后续课程会演进到向量化长期记忆。
- 代码组织：`configure.py` 集中配置；`data_loader.py` 封装文档加载；`kb_manager.py` 集中管理；FastAPI 层只做协议转换，业务逻辑下沉到类里。


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 本讲为什么强调"建索引必须离线完成"？如果在服务运行期间重建索引会出现什么问题？
2. `force_rebuild` 参数有三个取值（`True` / `False` / `None`），分别对应什么行为？什么场景下该用全量重建而不是增量更新？
3. RAG 的提示词里为什么要加"如果参考内容无法回答用户问题，请直接拒绝回答"这句约束？去掉会怎样？

<details>
<summary>答案指南</summary>

1. 索引建立极慢（可达小时级），且检索依赖同一向量库——若在线重建，期间检索服务不可用；此外磁盘加载本身耗时耗 IO，不能每次请求都加载，必须长驻服务。
2. `True` = 全量重建（文档→embedding→新向量库，适合文档结构变化或删除条目）；`False` = 增量更新（只对新增/修改条目做 embedding）；`None` = 不重建，仅加载现有索引。文档结构发生变化或首次建库时必须用全量重建。
3. 若不加该约束，大模型在检索内容不足时会自由发挥编造答案，导致回答无法追溯到知识库，丧失 RAG 系统可信度的基础。

</details>
