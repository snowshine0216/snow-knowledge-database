---
tags: [langchain, langgraph, langsmith, agent, memory, rag, callback, lcel, tool-calling, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927427
wiki: wiki/concepts/010-langchain-core-components-detailed.md
---

# 010: LangChain 核心组件详解

**Source:** [AI 工程化训练营 LangChain 核心组件详解](https://u.geekbang.org/lesson/818?article=927427)

## Outline
- [为什么 LangChain 要构建独有概念](#为什么-langchain-要构建独有概念)
- [LangChain 核心概念（8 个）](#langchain-核心概念8-个)
- [LangChain 六大模块](#langchain-六大模块)
- [LangGraph 与 LangChain 的协作模式](#langgraph-与-langchain-的协作模式)
- [工程化建议与学习路径](#工程化建议与学习路径)

---

## 为什么 LangChain 要构建独有概念

LangChain 引入大量"独有概念"的根本目的是：**建立结构化、标准化、可复用的开发体系**。这是所有试图解决领域特定问题的框架都会经历的路径。

类比传统互联网框架：当我们使用 Web 框架（如 Express、Spring）时，路由、中间件、请求/响应对象都是该框架独有的概念，用多了才会习以为然。LangChain 面对大模型的特殊问题（多模型切换、提示词管理、工具调用、有状态对话），同样构建了自己的一套抽象，核心目的是：

- **接口统一**：对不同 LLM 提供商（OpenAI、Anthropic、Claude 等）暴露一致的调用接口
- **可组合性**：通过 LCEL 管道语法 `|`，将各组件串联成可执行流程
- **快速原型**：在 AI 开发中快速搭建、调试 prototype

> 社区最大的吐槽是文档混乱（v0.1 → v0.3 反复重构），引入了概念但未能及时清理旧 API。v0.3 起有所改观。
> 建议学习方式：让 AI 在不同场景下不断生成 LangChain 代码示例，反复接触相同概念，约 1–2 周即可熟悉。

---

## LangChain 核心概念（8 个）

LangChain 官方定义了 8 个核心概念，是理解所有模块的基础：

| 概念 | 含义 |
|------|------|
| **LLM** | 与大模型通信、生成文本的组件（核心 I/O 接口） |
| **Prompt Template** | 提示词模板，使用 `{variable}` 占位符动态插值，类似 Python f-string |
| **Chain** | 将多个步骤组合成可执行流程；通过 LCEL `\|` 管道符串联组件 |
| **Agent** | 包含工具调用、记忆访问的代理，在 LangChain 语境中特指"能调用工具的链" |
| **Memory（Storage）** | 对话记忆；官方名叫 Storage，实际功能是 Memory |
| **RAG 工具** | 文档加载、文本分割、Embedding、向量存储等检索工具 |
| **Callback** | 回调机制，用于日志、监控、调试（构造器回调 / 请求回调两种） |
| **LCEL** | LangChain Expression Language，声明式函数式语法，支持 LangSmith 自动追踪 |

```python
# Prompt Template 示例
from langchain.prompts import PromptTemplate

template = PromptTemplate(
    template="请用{language}回答：{question}"
)
# {language} 和 {question} 由调用方传入

# LCEL 链示例（| 管道语法）
chain = prompt | llm | output_parser
response = chain.invoke({"language": "中文", "question": "什么是 RAG？"})
```

---

## LangChain 六大模块

### 模块 1：Model I/O

**目标**：封装与大模型的输入输出交互，包含三个子组件：

- **提示词管理器**（Prompt Manager）：使用 `PromptTemplate` 动态构造提示词
- **语言模型**（Language Model）：`ChatOpenAI`、`ChatAnthropic` 等，统一接口调用不同 LLM
- **输出解析器**（Output Parser）：将模型输出转换为结构化数据（JSON、列表、Pydantic 等）

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

llm = ChatOpenAI(model="gpt-4o")
response = llm.invoke([HumanMessage(content="你好")])
print(response.content)
```

---

### 模块 2：RAG

**目标**：让 LangChain 支持检索增强生成（Retrieval-Augmented Generation）。核心组件：

- `retriever`：向量数据库检索器
- `RetrievalQA`：封装好的问答链，自动执行检索 → 组合 → 生成

```python
from langchain.chains import RetrievalQA

qa = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever
)
result = qa.run("什么是 LangChain？")
```

RAG 模块会在后续知识嵌入专题中深入讲解。

---

### 模块 3：Storage（Memory）

**目标**：保存运行期间的对话历史，实现多轮对话记忆。

官方叫"存储（Storage）"，实际干的是"记忆（Memory）"的事——名不符实，但必须掌握。

工作流程（两次 Memory 交互）：

```
用户输入
  → 从 Memory 读取历史（第一次交互）
  → 历史 + 用户输入 → LLM 处理
  → 输出前写入 Memory（第二次交互）
  → 返回结果
```

每次请求经历两次 Memory 操作：**先读取历史，再写入本次对话**。

---

### 模块 4：Tools

**目标**：允许 LangChain Agent 调用外部工具（搜索、数据库、API 等）。

使用 `@tool` 装饰器定义工具，LangChain 会自动提取函数签名和 docstring 作为工具的 name 和 description：

```python
from langchain.tools import tool

@tool
def search_wiki(query: str) -> str:
    """用来搜索 Wikipedia 上的信息"""
    return wikipedia.search(query)
```

工具调用模块是 LangChain 被公认为"有进步"的部分，也是很多开发者在不使用完整 LangChain 时会单独抽取复用的模块。

---

### 模块 5：Callback

**目标**：在特定操作（模型调用、API 请求、工具执行）发生时执行预定义处理逻辑——LangChain 工程化最重要的模块之一。

两种实现方式：

| 类型 | 作用域 | 典型用途 |
|------|--------|----------|
| **构造器回调**（Constructor Callback） | 全生命周期 | 日志记录、监控指标、全局追踪 |
| **请求回调**（Request Callback） | 单次请求 | 实时流式输出到 WebSocket、单请求审计 |

```python
# 请求回调示例：流式输出
from langchain.callbacks import StreamingStdOutCallbackHandler

llm = ChatOpenAI(
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)
```

Callback 是**控制反转**（IoC）编程模式。使用注意：
- 多层回调嵌套容易产生"回调地狱"（Callback Hell）
- 解决方案：Promise/Future 扁平化 或 Python `async/await` 异步写法

> 实践中，Model I/O / RAG / Tools / LCEL 可以不用 LangChain 手写；但 Callback 的工程化能力（日志、监控、流式）是最难被替代的。

---

### 模块 6：LCEL（LangChain Expression Language）

**目标**：声明式函数式语法，用 `|` 管道符将组件串联成链。

```python
chain = prompt | llm | output_parser
```

官方声称的优势：简洁、易维护、支持流式输出。实际最重要的优势：**自动接入 LangSmith 追踪**，无需额外配置即可在 LangSmith 上看到完整调用链路。

---

## LangGraph 与 LangChain 的协作模式

LangGraph 解决了 LangChain 无法处理的**有状态、有循环**工作流，是现在最有工程价值的部分。

**协作模式**：

```
LangGraph（规划层）
├── 定义节点（Node）和边（Edge）—— 规划整体工作流
└── 每个节点内部 → LangChain 核心组件实现具体逻辑
```

- **LangGraph 节点**：可以嵌入任意 LangChain 模块（LLM 调用、RAG 检索、Memory 读写、Tool 调用）
- **LangGraph 边**：控制流转——条件边（if/else 分支）、循环边（Evaluator-Optimizer 模式）

**开发流程建议**：
1. 先用 LangGraph 设计整体工作流（状态图、节点、边）
2. 再在每个节点内用 LangChain 实现具体功能
3. 出问题时 LangSmith 追踪调用链，定位到具体节点

---

## 工程化建议与学习路径

**LangChain 的工程化价值**：乐高式开发——提供标准积木块，降低工程难度。核心价值不在于替换手写代码，而在于**提供参照物和标准接口**。

实践中更多人是：理解 LangChain 核心模块 → 参照其设计自行封装更轻量的实现。

**学习建议**：

1. 利用 AI 在不同工作场景下生成 LangChain 示例代码，反复接触 LLM / PromptTemplate / Chain / Agent / Memory 这些概念，约 1–2 周熟悉
2. 优先掌握 Callback 模块（工程化核心）和 LCEL 语法（LangSmith 集成）
3. LangGraph 的流程编排优先于 LangChain 细节，先设计工作流再填充实现
4. 阅读源码推荐：`05.py`（LangChain 工具调用）和 `06.py`（LangGraph 状态图）

**LangChain 生态全图**：

```
LangSmith（可观测性）
    ↕ 追踪
LangGraph（工作流编排）
    ↕ 节点实现
LangChain（工具箱）
├── Model I/O → 调用 LLM
├── RAG → 检索增强
├── Memory → 对话记忆
├── Tools → 工具调用
├── Callback → 监控追踪
└── LCEL → 链式语法
```

---

## Connections

- → [[008-langchain-core-components]]（LangChain vs. LangGraph 对比与 AutoGen 演示）
- → [[009-function-calling-and-mcp-basics]]（Tool Calling 原理，LangChain Tools 模块的底层机制）
- → 模块 3：知识嵌入与 RAG — LangChain RAG 模块深入
