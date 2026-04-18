---
tags: [llamaindex, rag, python, embedding, vector-store, query-engine, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927439
wiki: wiki/concepts/llamaindex-rag.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. RAG 系统通常分为哪两个阶段？每个阶段大概做什么事情？
2. 在向量检索流程中，Embedding 模型的作用是什么？为什么要把文档转成向量？
3. LlamaIndex 和 LangChain 都是 AI 框架，你认为它们的侧重点有什么不同？

---

# 024: 使用 LlamaIndex 实现 RAG

**Source:** [2使用 LlamaIndex 实现 RAG](https://u.geekbang.org/lesson/818?article=927439)

## Outline
- [LlamaIndex 核心工作流程](#llamaindex-核心工作流程)
- [核心概念](#核心概念)
- [基础 RAG 代码实现](#基础-rag-代码实现)
- [替换 LLM：使用兼容 OpenAI 接口的模型](#替换-llm使用兼容-openai-接口的模型)
- [替换 Embedding 模型](#替换-embedding-模型)
- [框架设计思考](#框架设计思考)

---

## LlamaIndex 核心工作流程

LlamaIndex 官方文档描述的标准流程：

```
加载（Load）→ 切分为 Node（Index）→ 存储到向量库 → 查询引擎（Query Engine）→ 输出结果
```

对应到 RAG 的离线/在线双流程：
- **离线**：加载 → 切分 Node → 建立索引（Embedding + 存储）
- **在线**：用户查询 → Query Engine 检索 → 生成响应

## 核心概念

| 概念 | 说明 |
|------|------|
| **Document** | 加载后的文档对象，包含文本内容 + 元数据（文件名等） |
| **Node** | 文档切分后的单个片段，是 LlamaIndex 底层存储单元 |
| **Index** | 基于 Node 建立的可查询数据结构（如 VectorStoreIndex） |
| **Query Engine** | 接收用户查询、执行检索和生成的入口组件 |

Node 既可描述整篇文档，也可描述每个切片，是 LlamaIndex 设计中通用的容器抽象。

## 基础 RAG 代码实现

安装依赖：
```bash
pip install llama-index llama-index-core
```

基础五行代码实现完整 RAG：
```python
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex

# 1. 加载：遍历文件夹，根据文件类型自动选择 loader
documents = SimpleDirectoryReader("./data").load_data()

# 2. 索引：在内存中建立向量数据库（VectorStorage）
index = VectorStoreIndex.from_documents(documents)

# 3. 查询引擎
query_engine = index.as_query_engine()

# 4. 查询
response = query_engine.query("员工可以怎么请假？")
print(response)
```

`SimpleDirectoryReader` 支持：
- 遍历整个文件夹（自动识别文件类型）
- 指定多个文件夹（传入 list）
- 文件类型过滤与忽略配置

## 替换 LLM：使用兼容 OpenAI 接口的模型

对于国内模型（通义千问、DeepSeek 等），使用 `OpenAILike` 适配器，只需改变 Settings 配置，其余代码一字不变：

```python
from llama_index.core import Settings
from llama_index.llms.openai_like import OpenAILike

# 需要安装：pip install llama-index-llms-openai-like
Settings.llm = OpenAILike(
    model="qwen-plus",
    api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    api_key="your_dashscope_api_key",
    is_chat_model=True,
)
```

API Key 建议保存到环境变量（`DASHSCOPE_API_KEY`），不要写死在代码里。

## 替换 Embedding 模型

默认使用 OpenAI 的 Embedding，可替换为通义的 `text-embedding-v3`：

```python
from llama_index.embeddings.dashscope import DashScopeEmbedding

# 需要安装：pip install llama-index-embeddings-dashscope dashscope
Settings.embed_model = DashScopeEmbedding(
    model_name="text-embedding-v3",
    api_key="your_dashscope_api_key",
)
```

设置完成后，整个 RAG 流程的 Embedding 部分自动切换，无需改动其他代码。

## 框架设计思考

使用 LlamaIndex 框架的价值在于它已封装了各层的工程问题：

| 层次 | 自己实现需要考虑 | LlamaIndex 提供 |
|------|----------------|-----------------|
| 数据层 | 多文件类型解析、路径动态配置 | `SimpleDirectoryReader` 统一接口 |
| 索引层 | 支持不同向量数据库切换 | 可直接替换 `VectorStoreIndex` 实现 |
| 查询层 | 检索策略、多步查询 | Query Engine 及 Multi-step Query Engine |
| 工程层 | API 封装、安全、扩展性 | 提供大量 integration |

LlamaIndex vs LangChain：
- LlamaIndex：代码精简，面向 RAG 设计，适合先学理解框架内部机制
- LangChain：框架体量更大，掌握 LlamaIndex 后迁移 LangChain 只需适应语言风格

学习路径建议：先学 LlamaIndex 用法 → 读 LlamaIndex 源码 → 仿照 QAnything 用 LlamaIndex 重写企业级 RAG → 再学 LangChain。

## Connections
- → [[rag-architecture]]
- → [[llamaindex-rag]]
- → [[qanything-rag]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话描述 LlamaIndex 的 RAG 离线/在线双流程，每个阶段分别经过哪些步骤？
2. Document 和 Node 在 LlamaIndex 中分别代表什么？为什么 Node 被设计为"通用容器抽象"？
3. 如果要在 LlamaIndex 中把默认的 OpenAI LLM 和 Embedding 模型全部替换为国内模型（如通义千问 + text-embedding-v3），需要改动哪些地方？其余查询代码需要修改吗？

<details>
<summary>答案指南</summary>

1. **离线阶段**：加载文档 → 切分为 Node → 建立向量索引（Embedding + 存储到向量库）；**在线阶段**：用户查询 → Query Engine 检索相关 Node → LLM 生成最终响应。两个阶段共同构成完整 RAG 流程。
2. Document 是加载后的完整文档对象（含文本内容和文件名等元数据）；Node 是文档切分后的单个片段，也是底层存储单元。Node 既可描述整篇文档也可描述每个切片，因此被设计为通用容器抽象，统一了不同粒度的内容表示。
3. 只需修改 `Settings` 配置：用 `OpenAILike` 适配器设置 `Settings.llm`，用 `DashScopeEmbedding` 设置 `Settings.embed_model`；其余加载、索引、查询代码**一字不用改动**，这正是 LlamaIndex 全局 Settings 设计的价值。

</details>
