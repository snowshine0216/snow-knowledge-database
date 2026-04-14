---
tags: [llamaindex, rag, knowledge-augmentation, vector-db, ocr, langchain, retrieval, ai-engineering, agent]
source: https://u.geekbang.org/lesson/818?article=927428
wiki: wiki/concepts/011-llamaindex-and-rag-systems.md
---

# 011: LlamaIndex 与知识增强系统

**Source:** [AI 工程化训练营 LlamaIndex 与知识增强系统](https://u.geekbang.org/lesson/818?article=927428)

## Outline
- [知识增强的本质：为什么需要 RAG](#知识增强的本质为什么需要-rag)
- [RAG vs. Tool Calling：根本区别](#rag-vs-tool-calling根本区别)
- [LlamaIndex 核心工作流](#llamaindex-核心工作流)
- [LlamaIndex 扩展能力](#llamaindex-扩展能力)
- [RAG 变形与企业实战](#rag-变形与企业实战)
- [混合检索与新型 RAG 模式](#混合检索与新型-rag-模式)

---

## 知识增强的本质：为什么需要 RAG

大模型训练完成后，参数是**静态固化**的——没有微调、没有后训练的情况下，参数不变。这意味着：模型只能依赖训练时见过的知识，对私有文档、最新信息一无所知。

**知识注入的三个时机**：

| 注入时机 | 方式 | 特点 |
|----------|------|------|
| 对话之前 | RAG（检索增强生成） | 可追溯、可更新、不改变模型参数 |
| 对话过程中 | Function Calling / Tool | 动态决策驱动 |
| 执行之后 | 结果后处理 | 适合校验/格式化 |

**RAG 的核心价值**：
- **知识可追溯**：知道注入了什么信息
- **知识可更新**：文档更新后，检索结果即时更新，无需重新训练模型
- **解耦**：知识库与模型参数分离，各自独立维护

> RAG 不能简单理解为"查向量数据库"——它是**知识增强推理**，将外部知识显式注入到生成过程中，与模型的推理能力结合产生答案。

---

## RAG vs. Tool Calling：根本区别

很多人认为"把向量数据库查询封装成一个 Tool/MCP 就等于 RAG"——这是错误的。两者工作模式根本不同：

| 维度 | RAG | Tool Calling / Agent |
|------|-----|----------------------|
| 工作模式 | 推理之前注入知识，上下文已就绪 | 推理过程中模型决策调用工具 |
| 本质 | 知识增强推理 | 决策驱动行动 |
| 模型角色 | 基于已有上下文生成答案 | 主动决策"要去查什么、做什么" |
| 类比 | 考前给复习资料，模型按材料答题 | 考试中让模型告诉你"翻书第9页" |

**考试类比**：
- **RAG**：考试前给出复习材料，模型基于复习过的材料回答（上下文已在输入中）
- **Agent**：考试时模型说"你去翻那本书的第9-10页找答案"，你翻完再回来告诉它，它再输出结论

---

## LlamaIndex 核心工作流

LlamaIndex 是一个比 LangChain 更简洁优雅的 RAG 框架，代码架构清晰，读源码是学习 RAG 底层逻辑的最佳路径。

**工作流分两个阶段**：

### 阶段一：离线索引（只需执行一次）

```python
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex

# Step 1: 加载文档（支持 txt/pdf/Word/PPT 等多种格式）
documents = SimpleDirectoryReader("./data").load_data()

# Step 2: 创建向量存储索引（embedding + 存入向量数据库）
index = VectorStoreIndex.from_documents(documents)
# 注意：索引创建后持久化存储，第二次运行直接加载，不要每次都重建
```

### 阶段二：在线查询（每次对话）

```python
# Step 3: 创建查询引擎（指定 LLM）
query_engine = index.as_query_engine(llm=llm)

# Step 4: 查询（自动检索相关片段 → 组合 → LLM 生成）
response = query_engine.query("我公司项目管理应该用什么工具？")
print(response)
```

**完整流程**：用户问题 → 向量检索最相关片段 → 片段 + 问题 → LLM → 答案

> **工程注意**：索引创建不要每次都执行，加判断条件：如果 persist 目录已存在则直接加载。

---

## LlamaIndex 扩展能力

LlamaIndex 的设计遵循**开放封闭原则**——扩展点开放，其余部分不变。

### 更换文档加载器

```python
# 默认：目录加载（多格式）
from llama_index.core import SimpleDirectoryReader

# 换成 PDF 加载器
from llama_index.readers.file import PDFReader
loader = PDFReader()
documents = loader.load_data(file="contract.pdf")

# 换成 Word 加载器（需要 pip install python-docx）
from llama_index.readers.file import DocxReader
```

**方法**：三步换加载器
1. `pip install` 对应的解析包
2. `from llama_index.readers.xxx import XxxReader`
3. 将代码中的 `SimpleDirectoryReader` 替换为新 Reader

### 更换向量数据库

```python
# 换成 FAISS（需要 pip install faiss-cpu）
from llama_index.vector_stores.faiss import FaissVectorStore

vector_store = FaissVectorStore(faiss_index=faiss_index)
storage_context = StorageContext.from_defaults(vector_store=vector_store)
index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)
```

其余代码不变——这就是好框架设计的价值。

---

## RAG 变形与企业实战

### 变形一：OCR + RAG（多模态文档）

企业中大量文档是扫描件、图片、含公章的 PDF——直接加载失败。解决方案：**OCR → 文本 → RAG**。

```
扫描件/图片 → PaddleOCR (PPOCR4) → 文字识别（含位置信息）
    ↓
识别后的文本 → 嵌入向量数据库
    ↓
用户提问 → 向量检索 → 相关文本 + 问题 → LLM → 答案
```

RAG 模式不变，只是**加载组件**从 `SimpleDirectoryReader` 换成了 OCR 识别器。

### 变形二：合同审核智能系统

**业务需求**：自动审核合同的甲方乙方、标的、付款方式、违约责任、清单价格。

**设计方法**：先拆业务，再套 RAG 模式。

**架构层次**：

```
业务流（合同审核开始 → 结束）
├── 上传合同 PDF
├── 图像增强 + OCR 识别（处理扭曲、批注、图章）
├── 内容解析与提取（甲方乙方、金额大写/小写、条款）
├── 智能比对（工商查询、金额校验、条款合规）
├── 原文高亮标注（风险位置反查）
└── 输出审核报告

存储层：
├── Elasticsearch（关键词检索：合同编号、主体信息）
├── 向量数据库（语义检索：条款相似度）
├── 关系数据库（数字计算：金额核验）
└── 知识图谱（三层数据关联映射）
```

**关键洞察**：这套系统底层仍然是 RAG——只是将文档加载、检索方式、存储后端做了定制化替换。

---

## 混合检索与新型 RAG 模式

### 为什么纯向量检索不够

合同审核实践发现：
- **语义检索（向量）**：擅长相似含义查找，但不擅长精确匹配（合同编号、金额）
- **关键词检索（ES）**：精确匹配强，但无法理解语义
- **数值计算（数据库）**：金额大小写比对、数字验证

解决方案：**混合检索** = 向量 + ES 关键词 + 数据库，通过知识图谱做关联，查询时综合重排（Rerank）。

### 新型 RAG 模式（进阶）

| 模式 | 适用场景 |
|------|----------|
| RAG + 知识图谱 | 复杂规划场景，需要实体关系推理 |
| AgentRAG | Agent 决策 + RAG 知识注入融合 |
| 管道式 RAG | 多份合同并行处理，流水线检索 |

**架构原则**：
1. 先从业务逻辑入手，画出开始节点→结束节点的流程
2. 识别哪些子任务匹配 RAG 模式，哪些匹配 Agent 模式
3. 不能匹配的继续拆分，直到可以套入现有模式
4. 发明新控制模式时，从推荐系统、知识图谱等成熟领域借鉴

---

## Connections

- → [[006-what-is-ai-engineering]]（RAG 在 AI 工程分层架构中的位置）
- → [[009-function-calling-and-mcp-basics]]（Tool Calling 与 RAG 的根本区别）
- → [[010-langchain-core-components-detailed]]（LangChain RAG 模块 vs LlamaIndex）
- → 模块 3：RAG 深入——向量数据库、切块策略、检索优化
