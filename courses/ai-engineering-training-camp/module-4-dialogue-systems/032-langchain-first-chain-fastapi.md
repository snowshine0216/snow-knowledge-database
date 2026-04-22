---
tags: [langchain, lcel, dialogue-system, fastapi, prompt-template, output-parser, langserve, deepseek, tongyi]
source: https://u.geekbang.org/lesson/818?article=927448
wiki: wiki/courses/ai-engineering-training-camp/module-4-dialogue-systems/032-langchain-first-chain-fastapi.md
---

# 032: 构建第一个对话链与 FastAPI 封装

**Source:** [1 构建第一个对话链与FastAPI封装](https://u.geekbang.org/lesson/818?article=927448)

## Outline
- [Overview](#overview)
- [Three-Layer Dialogue Architecture](#three-layer-dialogue-architecture)
- [Happy-Path Simplification](#happy-path-simplification)
- [LangChain Ecosystem Install](#langchain-ecosystem-install)
- [Language Models: LLM vs ChatModel](#language-models-llm-vs-chatmodel)
- [Prompt Templates](#prompt-templates)
- [Output Parsers](#output-parsers)
- [LCEL: The Pipe Operator](#lcel-the-pipe-operator)
- [Worked Example: Shopping List Generator](#worked-example-shopping-list-generator)
- [Multi-Variable Chains](#multi-variable-chains)
- [FastAPI Service Wrapping](#fastapi-service-wrapping)
- [Chapter Summary](#chapter-summary)

---

## Overview

模块 4 切换到 **LangChain** 框架来搭建智能对话系统。前三个模块分别覆盖架构 / 微调理论 / RAG；本模块聚焦 Agent，涉及意图识别（从 Desktop 换到 HuggingFace PEFT）、多轮对话管理、状态追踪、工具调用、记忆与流程决策，以及多模态数据处理。核心目标是让学员能够把 LangChain 从"一堆看不懂的类"升格成"随手就能用的工具"。

本讲作为模块 4 的开篇，从零开始搭一个最简单的对话链 (Chain) 并用 FastAPI 封装对外。

---

## Three-Layer Dialogue Architecture

一个真正可上线的智能对话系统不是"大模型 + 一个 UI"，而是分为三层：

```
┌───────────────────────── 前端接入层 ─────────────────────────┐
│  Web / Mobile / WeChat / Feishu  → 统一输入格式 (类 OpenAI)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌───────────────────── 对话引擎层 (Agent) ────────────────────┐
│  NLU (多模态预处理 → 意图提取 → 关键信息/槽位)              │
│    ↓                                                         │
│  DM  对话管理 (决定下一步：追问 / 调用工具 / 回答)           │
│    ↓                                                         │
│  DST 对话状态追踪 (记住当前进度，跨会话恢复)                 │
│    ↓                                                         │
│  Agent 执行 (工具调用 / 记忆读写 / 大模型推理)               │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────── 后台业务层 ────────────────────────┐
│  API 网关 → 订单 / CRM / 发票 / 用户中心 / 消息队列         │
└─────────────────────────────────────────────────────────────┘
```

**关键设计点**：
- **统一输入格式沿用 OpenAI 标准**。GPT、Qwen、DeepSeek 都已适配；未来标准之争大概率在 OpenAI 与 Anthropic 之间；"老三老四"的私有协议会被淘汰。企业在这层的抽象预算值得投入。
- NLU 阶段对于语音/图片输入要先走多模态理解，再进入意图提取。
- DST 允许用户离开后第二天回来继续 — 不要重复提问已获取的槽位。

---

## Happy-Path Simplification

完整的三层架构很庞大，初学者直接对照它起手必定崩溃。本讲采用**乐观路径（Happy Path）**方法：

假设用户意图单一（查订单）、订单号必填且一次到位、工具调用必成功。跳过所有异常分支后，最小对话系统就是 `提示词 → 大模型 → 结果`，这正对应 LangChain 的"对话链（Chain）"抽象。

先把 happy path 跑通再逐步加异常分支、槽位校验、DM 追问、DST 持久化 — 这是本模块的整体节奏。

---

## LangChain Ecosystem Install

LangChain 1.0 alpha 已发布，即将 GA。生态包分为**核心**与**扩展**两类：

| 包 | 作用 | 安装 |
|---|---|---|
| `langchain` | 核心运行时 | `pip install langchain` 或 `conda install -c conda-forge langchain` |
| `langserve` | 自动生成 REST API 服务（开发环境方便；生产仍建议用 Uvicorn/Gunicorn） | `pip install "langserve[all]"` |
| `langsmith` | 观测平台（调用链追踪、评测） | `pip install -U langsmith` |
| `langgraph` | 复杂工作流编排，缓解 LangChain 代码量爆炸 | `pip install -U langgraph` |
| `langchain-deepseek` | DeepSeek 模型集成，省去 base_url / API key 样板代码 | `pip install langchain-deepseek` |
| `langchain-community` | 大量外部资源集成（如 Tongyi/Qwen、Moonshot 等） | `pip install langchain-community` |
| `python-dotenv` | 从 `.env` 读取密钥，生产环境强烈建议 | `pip install python-dotenv` |

> 国内大模型基本全部适配 OpenAI 协议，所以 OpenAI 事实上成为 **"默认标准"**。直接安装对应集成包（如 `langchain-deepseek`）比手工改 base_url 省事得多；未来标准若迁移到 Anthropic，这些集成也会最快跟上。

---

## Language Models: LLM vs ChatModel

LangChain 的 Chain 由三类组件组成：**语言模型 / 提示词模板 / 输出解析器**。其中语言模型又分两种：

| 类型 | 输入 | 输出 | 适用场景 |
|---|---|---|---|
| `LLM` | `str` | `str` | 极简对话，无消息角色语义 |
| `ChatModel` | `List[BaseMessage]` | `BaseMessage` | 需要多角色（system/human/ai）的场景 |

**`BaseMessage` 的六种内置角色**：

- `HumanMessage` — 用户输入
- `AIMessage` — 模型回答
- `SystemMessage` — 系统预设（角色设定）
- `FunctionMessage` — 函数调用结果
- `ToolMessage` — 第三方工具调用结果
- `ChatMessage` — 自定义角色

两种模型的调用接口**完全一致** — 都用 `.invoke()`，也都支持直接调用对象（`model("你好")`）。

**示例（Tongyi via LLM 接口）**：
```python
from langchain_community.llms import Tongyi
llm = Tongyi()
llm.invoke("你好")  # 返回 str
```

**示例（DeepSeek via ChatModel 接口）**：
```python
from langchain_deepseek import ChatDeepSeek
chat = ChatDeepSeek(model="deepseek-chat")
chat.invoke("你好")  # 返回 BaseMessage
```

> 两者都会从环境变量读取 API key（Tongyi 用 `DASHSCOPE_API_KEY`，DeepSeek 用 `DEEPSEEK_API_KEY`）。

---

## Prompt Templates

### 基本模板

```python
from langchain.prompts import PromptTemplate
prompt = PromptTemplate.from_template("Hello, I am {mono_name}")
prompt.format(mono_name="ChatBot")
```

### 多角色模板

```python
from langchain.prompts import ChatPromptTemplate
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个叫 {assistant_name} 的 AI 助手"),
    ("human", "我叫 {user_name}，问题是 {question}"),
])
```

格式化后返回 `List[BaseMessage]`，而不是字符串。

### 强制参数

通过 `input_variables=[...]` 显式声明哪些变量是必填：

```python
PromptTemplate(
    template="写一篇关于 {topic} 的文章，等级为 {level}，风格为 {style}",
    input_variables=["topic", "level", "style"],
)
```

### 模板语法风格

默认 `{var}` 语法、`template_format="f-string"`、`template_format="jinja2"`（Python Flask 开发者的习惯）。按熟悉度选，功能等价。

### 条件逻辑

模板本身支持 `{% if %}` 这类逻辑。**老师建议不要使用** — 现代大模型用自然语言描述逻辑已经足够，复杂分支交给工作流 (LangGraph) 而不是模板语法。

---

## Output Parsers

把 `BaseMessage` 转成下游 Python 代码可直接消费的类型（列表、字典、JSON、Pydantic 模型、SQL、XML…）。

### 内置常用解析器

- **`CommaSeparatedListOutputParser`** — 把 `"苹果,香蕉,橙子"` 按默认逗号拆成 `["苹果", "香蕉", "橙子"]`。
- **`PydanticOutputParser`** — 带类型校验的结构化解析。
- **自定义解析器** — 继承 `BaseOutputParser` 实现 `parse()` 方法。

### 解析器的三种职责

1. **格式化输出** — `BaseMessage` → `str` / `dict` / `list`
2. **类型转换** — 输出到 Python 原生类型
3. **校验与重试** — 当解析失败时触发重试（而不是抛异常）

---

## LCEL: The Pipe Operator

**LangChain Expression Language (LCEL)** 用 `|` 把三个组件串起来：

```python
chain = prompt | llm | parser
chain.invoke({"topic": "水果"})
```

等价于手动：
```python
msg    = llm.invoke(prompt.format(topic="水果"))
result = parser.parse(msg)
```

但 LCEL 免去了中间变量，并在组件间**自动做类型转换**（`BaseMessage` 自动适配下游 parser 等）。

### LCEL 的核心优势

- **更清晰的读写体验** — 一眼看出"提示词 → 模型 → 解析器"的流动。
- **组件间类型自动匹配** — 调用者无需手动管理 `.content` / `.messages` 之类的细节。
- **原生支持并行、流式、中间结果缓存**（后续课程演示）。
- **内置调试支持** — 与 LangSmith 无缝联动。

### LCEL 的"概念叛逆"

LangChain 有意把**聊天模型**称作"大模型"、**提示词模板**称作"提示词"、**解析器**称作"输出处理"。老师把这个类比成"新浪微博"占领 "微博" 这个词 — 腾讯/搜狐后来只能叫腾讯微博/搜狐微博。理解 LangChain 第一步：**忘掉普遍的直觉，接受它重新定义的概念**。

---

## Worked Example: Shopping List Generator

简化版"营养餐购物清单生成器"：

```python
from langchain.output_parsers import CommaSeparatedListOutputParser
from langchain_community.llms import Tongyi
from langchain.prompts import PromptTemplate

parser = CommaSeparatedListOutputParser()
llm    = Tongyi()
prompt = PromptTemplate(
    template="请列出五个和 {category} 相关的 {meal} 购物清单食材",
    input_variables=["category"],
    partial_variables={"meal": "早餐"},   # partial 固定部分参数
)

shopping_chain = prompt | llm | parser
shop_list = {}
for meal in ["早餐", "午餐", "晚餐"]:
    shop_list[meal] = shopping_chain.invoke({"category": "营养餐", "meal": meal})
```

要点：
- `partial_variables` 锁定不常变的变量（`meal` 早午晚切换），业务方只填 `category`。
- 用 `for` 循环便利多个输入，一次循环一次 `invoke`。

> 真实营养餐逻辑还缺三层业务判断：
> 1. 与昨日菜单不重复
> 2. 符合营养学约束
> 3. 满足热量摄取 — 属于业务领域，不展开。

---

## Multi-Variable Chains

如果需要不只是循环一个变量，而是**多场景多变量**（早餐→食材 / 办公室→办公用品 / 旅行→必备品 / 健身→器材 / 学习→工具），只需把模板与 `input_variables` 扩到两个：

```python
prompt = PromptTemplate(
    template="列出五个和 {scene} 相关的 {object_kind} 对象，格式：{format_hint}",
    input_variables=["scene", "object_kind"],
    partial_variables={"format_hint": "逗号分隔"},
)
chain = prompt | llm | parser
```

调用时两个 key 都必填：
```python
chain.invoke({"scene": "早餐", "object_kind": "食材"})
chain.invoke({"scene": "办公室", "object_kind": "办公用品"})
```

---

## FastAPI Service Wrapping

对话链搭好之后，需要对外暴露 HTTP 接口。FastAPI 封装的骨架：

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatService:
    def __init__(self):
        self.llm    = ChatDeepSeek(model="deepseek-chat")
        self.prompt = ChatPromptTemplate.from_messages([...])
        self.parser = StrOutputParser()
        self.chain  = self.prompt | self.llm | self.parser  # 注意 self.chain！
        self.sessions = {}

    def chat(self, session_id: str, user_message: str) -> str:
        history = self.sessions.get(session_id, [])
        reply = self.chain.invoke({"history": history, "input": user_message})
        history.append(("human", user_message))
        history.append(("ai", reply))
        self.sessions[session_id] = history
        return reply

service = ChatService()

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    reply = service.chat(req.session_id, req.message)
    return {"reply": reply, "session_id": req.session_id}
```

踩坑注意：

- **`self.chain` 而不是 `chain`** — 放进类里之后必须用 `self`。Java/Go/C++ 转过来的同学最容易忘。
- **session 管理**先用最简单的内存 dict；下一讲（033）会替换成 Redis。
- **返回 JSON**，前端按 JSON 展示，不要返回 `BaseMessage` 对象。

老师已把完整代码放在课件，建议学员自行 run 一次，重点理解 **"会话管理为什么需要显式存储历史"** — 这是后续所有多轮对话讨论的起点。

---

## Chapter Summary

- 智能对话系统 = 前端接入 + 对话引擎 (NLU/DM/DST/Agent) + 后台业务；不是单纯大模型调用。
- **Happy Path 起手**：忽略异常先跑通最简单的 `prompt → llm → parser`，再迭代加异常/槽位/DST。
- LangChain 生态多包：`langchain` 核心 + `langserve`/`langsmith`/`langgraph`/`langchain-community`/`langchain-<model>` 集成；都要 `-U` 升级到 1.0 alpha。
- **LLM vs ChatModel**：一个吃字符串一个吃消息列表；都统一用 `.invoke()`。
- **三件套**：PromptTemplate / ChatModel / OutputParser，由 LCEL 的 `|` 串起来，类型自动匹配。
- LCEL 的红利：读写清晰、自动类型匹配、原生并行与流式支持、内置调试。
- **FastAPI 封装**：把 Chain 塞进类的 `__init__`，注意 `self.chain`；session 先用内存 dict，后续课程替换为 Redis。
- 本讲是模块 4 的 **Hello World**，后续加意图识别、状态机、工具调用、记忆、Agent 组合能力都建立在这条链之上。

---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在 LangChain 中，`LLM` 类型和 `ChatModel` 类型的输入输出有什么本质区别？
2. 一个完整的工业级智能对话系统通常分为哪几个核心层次？每层负责什么？
3. LCEL（LangChain Expression Language）使用什么操作符来连接提示词模板、语言模型和输出解析器？

---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用费曼方法解释：LCEL 的 `|` 管道操作符具体做了什么工作，以及它为什么比手动依次调用三个组件更好？
2. 在 FastAPI 封装对话链时，为什么把 chain 放进类里后必须写成 `self.chain`？为什么大模型需要显式存储对话历史，而不能自己"记住"上轮内容？
3. `OutputParser` 有哪三种职责？`CommaSeparatedListOutputParser` 具体是如何处理模型输出的？

> [!example]- Answer Guide
> 
> #### Q1 — LCEL Pipe Operator Mechanics
> 
> LCEL 的 `|` 将 PromptTemplate、ChatModel、OutputParser 串成一条链，调用 `chain.invoke()` 时自动完成"格式化提示词 → 调用模型 → 解析输出"的全流程，并在组件间自动做类型转换（如 BaseMessage 自动适配下游 parser），无需手动管理中间变量；额外红利包括读写清晰、原生支持并行/流式/缓存、内置 LangSmith 调试。
> 
> #### Q2 — self.chain and Conversation History
> 
> 将 Chain 构建在类的 `__init__` 中后它成为实例属性，必须通过 `self.chain` 引用，否则方法内找不到该变量；大模型每次调用都是无状态的，必须把每轮 human/ai 消息显式追加到 history 列表并以 session_id 为键存入 dict，下次对话时才能恢复上下文。
> 
> #### Q3 — OutputParser Roles and CSV Parser
> 
> OutputParser 的三种职责为：格式化输出（BaseMessage → str/dict/list）、类型转换（Python 原生类型）、校验与重试（解析失败自动重试而非抛异常）；`CommaSeparatedListOutputParser` 将模型返回的逗号分隔字符串（如 `"苹果,香蕉,橙子"`）直接拆分为 Python 列表 `["苹果", "香蕉", "橙子"]`。
