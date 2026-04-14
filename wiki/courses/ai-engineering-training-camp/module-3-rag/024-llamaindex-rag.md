---
tags: [llamaindex, rag, python, embedding, vector-store, query-engine]
source: https://u.geekbang.org/lesson/818?article=927439
---

# LlamaIndex RAG 实现

LlamaIndex 是专为 RAG 场景设计的 Python 框架，代码精简、抽象清晰，是学习 RAG 工程实现的推荐起点。

## Key Concepts

### 核心抽象

| 组件 | 说明 |
|------|------|
| `SimpleDirectoryReader` | 遍历文件夹，自动识别文件类型并加载为 Document |
| `Document` | 文本内容 + 元数据的容器 |
| `Node` | Document 切分后的片段，LlamaIndex 底层存储单元 |
| `VectorStoreIndex` | 内存向量数据库，快速原型用 |
| `QueryEngine` | 封装检索 + 生成全流程的入口 |
| `Settings` | 全局配置 LLM、Embedding 模型 |

### 五行代码实现 RAG

```python
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex

documents = SimpleDirectoryReader("./data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()
response = query_engine.query("你的问题")
```

### 替换 LLM（使用国内模型）

```python
from llama_index.core import Settings
from llama_index.llms.openai_like import OpenAILike

Settings.llm = OpenAILike(
    model="qwen-plus",
    api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
    api_key="your_key",
    is_chat_model=True,
)
```

任何兼容 OpenAI 接口的模型（通义、DeepSeek、Kimi 等）均可通过此方式接入。

### 替换 Embedding 模型

```python
from llama_index.embeddings.dashscope import DashScopeEmbedding

Settings.embed_model = DashScopeEmbedding(model_name="text-embedding-v3")
```

### 节点后处理器（Reranking）

```python
from llama_index.postprocessor import SentenceTransformerRerank

reranker = SentenceTransformerRerank(model="BAAI/bge-reranker-v2-m3", top_n=5)
nodes = reranker.postprocess_nodes(raw_nodes, query_bundle=QueryBundle(query))
```

### 持久化存储

```python
# 保存
index.storage_context.persist(persist_dir="./storage")

# 恢复
from llama_index.core import StorageContext, load_index_from_storage
storage_context = StorageContext.from_defaults(persist_dir="./storage")
index = load_index_from_storage(storage_context)
```

## Key Takeaways

- LlamaIndex 将 RAG 流程高度抽象，最简实现仅需 5 行代码
- 通过 `Settings` 统一配置 LLM 和 Embedding，无需修改业务代码
- 掌握 LlamaIndex 后迁移 LangChain 只需适应语言风格（设计逻辑相同）
- 生产级使用需额外考虑：多文件类型解析、向量库切换、Token 成本控制

## See Also

- [[rag-architecture]] — RAG 架构原理与设计模式
- [[qanything-rag]] — 企业级 RAG 框架参考实现
- [[rag-improvement-methods]] — 进阶优化方法
