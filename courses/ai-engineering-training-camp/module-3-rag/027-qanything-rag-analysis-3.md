---
tags: [qanything, rag, fastapi, gradio, llamaindex, reranking, local-rag, python, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927443
wiki: wiki/concepts/qanything-rag.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. RAG系统中"粗排"和"精排"分别指什么？你能描述它们在检索流程中的作用吗？
2. FastAPI 和 Flask 作为 Python Web 框架，各自的典型用途和主要区别是什么？
3. 在向量相似度检索中，如果一个文档分块里同时包含代码和中文说明，检索结果会受到什么影响？

---

# 027: 完整的 RAG 分析-QAnything（三）

**Source:** [5完整的 RAG 分析-QAnything3](https://u.geekbang.org/lesson/818?article=927443)

## Outline
- [课程形式：模仿式学习](#课程形式模仿式学习)
- [仿照 QAnything 实现 LocalRAG](#仿照-qanything-实现-localrag)
- [FastAPI Web 服务框架](#fastapi-web-服务框架)
- [Gradio 调试界面](#gradio-调试界面)
- [文件上传与知识库创建](#文件上传与知识库创建)
- [完整 RAG 对话流程实现](#完整-rag-对话流程实现)
- [Rerank 模型的作用与实践](#rerank-模型的作用与实践)

---

## 课程形式：模仿式学习

本节以"模仿编程"（Code Imitation）为主：仿照阿里云开源的 LocalRAG 项目（基于 LlamaIndex），在理解 QAnything 设计思路后，用 LlamaIndex 替代 LangChain 重新实现一个本地 RAG 系统。

模仿原则：尽量模仿得像，才能真正理解设计决策。

## 仿照 QAnything 实现 LocalRAG

项目环境准备：
```bash
# 创建 Python 3.10 虚拟环境
conda create -n LocalRAG python=3.10

# 安装依赖（使用最新版本）
pip install llama-index llama-index-core fastapi uvicorn gradio dashscope
```

三大核心功能模块：
1. **文件上传**（`/upload_data`）
2. **创建知识库**（`/create_knowledge_base`）
3. **RAG 对话**（`/chart`）

## FastAPI Web 服务框架

Python 常见 Web 框架对比：

| 框架 | 特点 | 典型用途 |
|------|------|----------|
| FastAPI | 纯 API，高性能，异步 | RESTful API 服务 |
| Flask | API + 模板渲染 | 小型全栈应用 |
| Sanic | 异步（类似 FastAPI） | QAnything 使用 |

所有框架的统一模式：
```python
app = FastAPI()                   # 1. 实例化
@app.get("/url")                  # 2. 绑定 URL + HTTP 方法
async def handler():              # 3. 绑定处理函数
    return ...

uvicorn.run(app, host="0.0.0.0", port=8080)  # 4. 启动
```

三个核心路由绑定：
```python
app = FastAPI()

@app.get("/")        # 主页
@app.post("/upload_data")          # 文件上传
@app.post("/create_knowledge_base") # 创建知识库
@app.get("/chart")                 # RAG 对话
```

## Gradio 调试界面

Gradio 是快速构建 Python 机器学习 Demo 界面的工具，广泛用于 Hugging Face 模型展示、Stable Diffusion 等：

```python
import gradio as gr

# 与 FastAPI 结合
# Gradio 提供可视化界面，FastAPI 提供 REST API
# 快速暴露参数，便于调试
```

界面中可视化调试参数：
- 选择 LLM 模型和 Embedding 模型
- 调整温度（temperature）
- 设置携带对话轮数
- 设置 RAG 召回片段数量
- 设置相似度阈值

## 文件上传与知识库创建

文件上传流程：
```
POST /upload_data
  → 支持格式：PDF、DOC、TXT
  → 非结构化数据 / 结构化数据分类上传
  → 文件存储到 ./file/{category}/ 目录
  → 返回上传成功确认
```

创建知识库流程：
```python
def create_knowledge_base(category: str, kb_name: str):
    # 1. 读取指定 category 文件夹下的所有文档
    documents = SimpleDirectoryReader(f"./file/{category}").load_data()
    
    # 2. 封装为 LlamaIndex Document
    # 3. 使用 VectorStoreIndex 建立索引
    index = VectorStoreIndex.from_documents(documents)
    
    # 4. 持久化存储（避免重启后索引丢失）
    index.storage_context.persist(persist_dir=f"./vector/{kb_name}")
    
    # 知识库 = 权限分类，同一知识库可支持多个文档类目
```

持久化存储后，向量以 JSON 格式存在 `./vector/` 目录下，重启后从磁盘恢复，无需重新索引。

## 完整 RAG 对话流程实现

`get_model_response` 函数实现完整流程（模仿 QAnything 的 `LocalDocumentQA.get_source`）：

```python
async def get_model_response(history, kb_name, model, temperature, top_k, threshold, uploaded_file):
    # 1. 获取用户最新输入
    current_query = history[-1][0]
    
    # 2. 处理多模态文件（临时文件夹，定期清理）
    if uploaded_file:
        temp_index = build_temp_index(uploaded_file)
    
    # 3. 从持久化存储恢复索引
    storage_context = StorageContext.from_defaults(persist_dir=f"./vector/{kb_name}")
    index = load_index_from_storage(storage_context)
    
    # 4. 粗排检索（top-k = 20）
    retriever = index.as_retriever(similarity_top_k=20)
    raw_nodes = retriever.retrieve(current_query)
    
    # 5. 精排：使用 Rerank 模型（DashScope rerank）
    reranker = SentenceTransformerRerank(
        model="BAAI/bge-reranker-v2-m3",  # 或 DashScope rerank
        top_n=5
    )
    reranked_nodes = reranker.postprocess_nodes(raw_nodes, query_bundle=QueryBundle(current_query))
    
    # 6. 构建提示词，调用 LLM 生成回答（流式输出）
    response = llm.stream_complete(build_prompt(current_query, reranked_nodes, history))
    
    return response
```

这是一个管道过滤器（Pipeline Filter）模式：输入 → 粗排 → 精排 → 生成。

## Rerank 模型的作用与实践

**为什么需要 Rerank？**

当召回片段中混有不相关内容时（例如代码注释和源代码放在同一分块），第一轮向量相似度排序会被干扰：
- 代码片段降低了整体的语义相似度得分
- 真正需要的中文说明文档被排到后面

Rerank 模型的特点：
- 是一个专门训练的交叉编码器（Cross-Encoder）
- DashScope 的 rerank 模型对中文文本更敏感，对代码不敏感
- 能识别出哪个片段是用户真正需要的内容

**降级策略**：若 Rerank 模型不可用，直接跳过第二阶段精排，退化为第一轮 top-k 排序。

**trunk vs node 区别**：
- `Node`：LlamaIndex 底层存储数据结构
- `Chunk/Trunk`：业务语义层面，文档切分后的一个片段

两者本质相同，只是描述层次不同。

## Connections
- → [[qanything-rag]]
- → [[rag-architecture]]
- → [[llamaindex-rag]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话描述本课 `get_model_response` 函数实现的完整 RAG 对话流程，从用户输入到生成回答，经历了哪六个关键步骤？
2. Rerank 模型解决了什么具体问题？为什么代码和中文文档混合在同一分块时，单靠向量相似度排序会产生偏差？
3. 本课的知识库是如何创建并持久化的？重启服务后，索引如何从磁盘恢复而无需重新建立？

<details>
<summary>答案指南</summary>

1. 共六步：① 获取用户最新输入；② 处理临时上传文件（可选）；③ 从磁盘恢复持久化索引（`StorageContext.from_defaults`）；④ 粗排检索（`similarity_top_k=20`）；⑤ Rerank 精排（Cross-Encoder，`top_n=5`）；⑥ 构建提示词调用 LLM 流式生成回答。整体是管道过滤器（Pipeline Filter）模式。
2. 代码片段会拉低整个分块的语义相似度得分，导致真正需要的中文说明文档被排到后面。Rerank 模型是专门训练的交叉编码器，DashScope rerank 对中文敏感、对代码不敏感，能重新识别出用户真正需要的片段；若不可用则降级为第一轮 top-k 结果。
3. 调用 `VectorStoreIndex.from_documents()` 建立索引后，用 `index.storage_context.persist(persist_dir=./vector/{kb_name})` 将向量以 JSON 格式写入磁盘；重启后通过 `StorageContext.from_defaults(persist_dir=...)` 加上 `load_index_from_storage()` 即可从磁盘恢复，无需重新索引。

</details>
