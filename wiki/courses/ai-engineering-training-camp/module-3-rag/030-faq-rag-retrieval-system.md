---
tags: [rag, faiss, milvus, llamaindex, vector-db, fastapi, faq-retrieval, embedding, version-management, multi-turn-dialog]
source: https://u.geekbang.org/lesson/818?article=928268
---
# FAISS/Milvus FAQ 检索系统

模块三第一个综合实践 — 把 RAG 从概念落到能上线的 FAQ 服务。使用 LlamaIndex + FAISS/Milvus + FastAPI 搭三层能力：**基础 QA** → **多轮对话** → **知识库管理（CRUD + 版本）**。核心工程约束是"**两阶段 RAG**" — 建索引是离线、耗时小时级；查询是在线、基于已加载索引；两者共用向量库但不能并发读写。每次启动磁盘加载索引代价高，所以系统化部署时必须长驻服务，不走命令行每次重加载的冷启动路径。

## Key Concepts

- **两阶段 RAG 铁律**：建索引（offline，文档 → 切片 → embedding → 写 FAISS/Milvus → 持久化）与检索生成（online，用户问题 → embedding → 向量检索 top-k → 拼提示词 → LLM）严格分离。建索引期间查询不可用。
- **`force_rebuild` 三挡**：`True` 全量重建 → 文档结构变化/首次建库；`False` 增量更新 → 日常加改单条 FAQ；`None` 不重建 → 仅加载索引（运行时间从小时级到秒级）。
- **正则切分优于句子切分**：FAQ 已结构化为 `Q:...\nA:...`，用 `re.compile(r"Q:(.+?)A:(.+?)(?=\nQ:|\Z)", re.DOTALL)` 比 `SentenceSplitter` 准得多。通用切分器碰到已结构化文档反而破坏结构。
- **可信度约束**：提示词必须加"如果参考内容无法回答，请拒绝回答，不要编造"。这是 RAG 产品化的底线 — 防止大模型基于训练数据自由发挥，让所有答案可追溯到知识库。
- **多格式支持**：`.txt/.faq` 用正则 Q/A；`.md` 用层级切分器（`##` / `###`）；`.docx` 用句子切分器；`.xlsx/.csv` 按行切分。`FAQDataLoader.load()` 按扩展名分支。
- **多轮对话 = 短期记忆**：Python list 存 `{"role", "content"}` 条目；第 2 轮时把 history 全部拼到 prompt。后续课程演进到向量化长期记忆。
- **知识库管理（`kb_manager.py`）**：版本管理（时间戳 + version_id 快照到 `backup/`）、FAQ CRUD（add/update/delete/search/batch）、重建三挡、回滚能力。
- **服务化部署**：FastAPI + Pydantic model 做参数校验 + Swagger UI（`/docs`）自动测试；启动时 `faq_system.init()` 一次性加载索引到内存；不同 HTTP 方法绑定不同函数（同一 URL PUT=update / DELETE=delete）。
- **配置集中化**：`configure.py` 保存 API key、embedding model、vector DB 路径、top_k — 业务代码通过 `settings.xxx.yyy` 直接取，不重复配置。

## Key Takeaways

- RAG 的工程化难度 **80% 在索引 + 知识库管理**，不在检索本身。检索调 `as_query_engine` 一行代码就够了。
- **冷启动代价决定了服务化的必要性** — 命令行跑一次就退出的做法在生产不可行。
- RAG 产品化的**可信度 = 提示词约束 + 拒答机制**。没有这个约束，RAG 就退化成带搜索的自由发挥大模型。
- FAQ 数据已经是结构化时，**用正则别用句子切分器** — 这是个反直觉但高 ROI 的选择。
- 版本管理要**文档版本、向量库版本、索引版本一一对应** — 任何一个脱节都会让回滚变成灾难。
- 三挡重建机制让"常规运维"与"大变更"都有合适的路径 — 小时级的全量重建只在必要时触发。
- FastAPI 层只做协议转换，业务逻辑下沉到 `KnowledgeBaseManager` 类里 — 方便命令行和 HTTP 共享实现。

## See Also

- [[023-rag-deconstruction]] — RAG 基础架构与五阶段框架
- [[024-llamaindex-rag-implementation]] — LlamaIndex 五行 RAG
- [[028-rag-improvement-methods-1]] — RAG 效果提升方法（一）
- [[029-rag-improvement-methods-2]] — RAG 效果提升方法（二）
- [[031-rag-knowledge-graph-fusion]] — RAG + 知识图谱融合（模块三实践二）
