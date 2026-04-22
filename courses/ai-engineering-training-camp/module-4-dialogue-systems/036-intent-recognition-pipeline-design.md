---
tags: [intent-recognition, slot-filling, langchain, agent, pipeline, nlp, rag, routing]
source: https://u.geekbang.org/lesson/818?article=927452
wiki: wiki/concepts/intent-recognition-pipeline.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在 Agent 架构中，意图识别属于哪个模块（Plan / Memory / Tool / Action）？该模块还包含哪些常见策略？
2. 什么是槽位填充（Slot Filling）？在"查询订单"场景中，哪些信息属于"槽位"？
3. 基于规则、基于大模型、基于向量相似度——这三种意图路由方案各有什么典型优劣？

---

# 036: 5意图识别流水线设计

**Source:** [5意图识别流水线设计](https://u.geekbang.org/lesson/818?article=927452)

## Outline
- [Agent 架构概述：Plan/Memory/Tool/Action](#agent-架构概述planmemoryToolaction)
- [意图识别的作用与边界](#意图识别的作用与边界)
- [意图识别 + 槽位填充（Slot Filling）](#意图识别--槽位填充slot-filling)
- [方案一：基于规则的意图识别](#方案一基于规则的意图识别)
- [方案二：基于大模型的意图路由](#方案二基于大模型的意图路由)
- [方案三：基于向量相似度的路由](#方案三基于向量相似度的路由)
- [多策略融合](#多策略融合)
- [常见坑与注意事项](#常见坑与注意事项)
- [Connections](#connections)

---

## Agent 架构概述：Plan/Memory/Tool/Action

意图识别是 Agent 架构中 **Plan（计划）** 阶段的第一步。完整的 Agent 包括四个模块：

| 模块 | 说明 |
|------|------|
| **Plan** | 把用户的复杂目标拆解为可执行的子任务，包含 CoT（思维链）、ToT（思维树）等策略 |
| **Memory** | 短期记忆（当前 Session 状态）+ 长期记忆（跨 Session 存档） |
| **Tool** | 加载并调用外部工具（API、数据库、搜索引擎等） |
| **Action** | 实际执行工具调用，获取结果并反馈给 Plan |

Plan 阶段的核心挑战：**知道用户想干什么**——这正是意图识别要解决的问题。

---

## 意图识别的作用与边界

意图识别并非万能，第一步要区分：

```
用户请求
  ├── AI 能处理的 → 进入意图分类 → 路由到对应 Agent
  └── AI 无法处理的 → 兜底响应 / 转人工
```

**AI 无法处理的场景示例**：
- 金融退款（必须人工审核）
- 费用争议（需要系统数据核查）
- 超出知识库范围的查询

> **原则**：先识别 AI 能做什么，再对"能做的"进行细分意图识别。不要让 AI 过度承诺用户。

---

## 意图识别 + 槽位填充（Slot Filling）

意图识别完成后，还需要**槽位填充（Slot Filling）**：提取执行意图所需的关键参数。

```
用户输入："我想查询订单 123456 的状态"
          ↓ 意图识别
        意图：query_order
          ↓ 槽位填充
        slots:
          order_id: "123456"
```

槽位填充的结果作为参数传递给后续的业务处理模块。

---

## 方案一：基于规则的意图识别

**适用场景**：电信、电商等大型企业，规则覆盖率高，响应速度快，可维护。

### 项目结构

```
project/
├── core/               # 规则引擎核心
│   ├── intent_rules.py     # 意图规则（正则 + 关键词）
│   └── slot_filler.py      # 槽位填充器
├── config/             # 业务人员可修改的配置
│   ├── keywords.yaml       # 关键词词库
│   └── patterns.yaml       # 正则表达式策略
└── main.py             # 主入口（有限状态机管理流程）
```

### 执行流程

```
用户输入
  → 文本预处理（去标点、归一化）
  → 多策略并行匹配
      ├── 正则匹配（订单号格式等精确匹配）
      ├── 关键词匹配（查订单/退款/取消等）
      └── 状态机（多轮对话状态跟踪）
  → 结果融合
  → 槽位填充
  → 输出意图 + slots
```

### 代码示例

```python
import re
from typing import Optional

# 正则匹配订单号
ORDER_ID_PATTERN = re.compile(r'\b\d{6,18}\b')
QUERY_KEYWORDS = ["查询", "查一下", "订单状态", "物流状态"]
CANCEL_KEYWORDS = ["取消", "不要了", "退款", "退订"]

def extract_intent_by_rules(user_input: str) -> dict:
    text = user_input.strip()

    # 提取订单号（正则）
    order_match = ORDER_ID_PATTERN.search(text)
    order_id: Optional[str] = order_match.group() if order_match else None

    # 判断意图（关键词）
    if any(kw in text for kw in QUERY_KEYWORDS):
        intent = "query_order"
    elif any(kw in text for kw in CANCEL_KEYWORDS):
        intent = "cancel_order"
    else:
        intent = "unknown"

    return {
        "intent": intent,
        "slots": {"order_id": order_id},
    }
```

---

## 方案二：基于大模型的意图路由

使用 LangChain 的 `LLMRouterChain` + `MultiPromptChain` 实现基于大模型的意图分类。

### 核心思路

```
用户输入 → LLM RouterChain（判断归属）
              ├── 售前 → 售前提示词模板 + 大模型 → 回答
              ├── 售后 → 售后提示词模板 + 大模型 → 回答
              └── 其他 → default chain（兜底）
```

### 代码示例

```python
from langchain.chains.router import MultiPromptChain
from langchain.chains.router.llm_router import LLMRouterChain, RouterOutputParser
from langchain.prompts import PromptTemplate
from langchain_community.chat_models import ChatTongyi

# 定义各意图的提示词
presales_template = """你是售前顾问，专门回答产品功能和价格问题。
用户问题: {input}"""

aftersales_template = """你是售后工程师，专门处理故障和使用问题。
用户问题: {input}"""

prompt_infos = [
    {"name": "presales",   "description": "售前咨询：产品功能、价格、对比",   "prompt_template": presales_template},
    {"name": "aftersales", "description": "售后支持：故障排查、退换货、投诉", "prompt_template": aftersales_template},
]

llm = ChatTongyi(model="qwen-turbo", temperature=0)  # 意图识别用低 temperature

# 构建 MultiPromptChain
chain = MultiPromptChain.from_prompts(
    llm=llm,
    prompt_infos=prompt_infos,
    verbose=True,
)

result = chain.invoke({"input": "你们的产品支持哪些功能？"})
```

> **注意**：复杂场景（超过 2 个节点、需要多轮判断）建议改用 LangGraph，LangChain 的 RouterChain 适合简单二分或三分场景。

---

## 方案三：基于向量相似度的路由

不依赖大模型生成判断，而是通过**向量相似度匹配**将用户输入路由到最近的意图类别。

### 核心思路

```
用户输入 → Embedding 模型编码
         → 在 ChromaDB 中做相似度搜索（top-k=1）
         → 取 metadata 中的分类名
         → 路由到对应 chain
```

### 代码示例

```python
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import DashScopeEmbeddings

# 定义各意图的描述文本（description 要写"能解决什么问题"，而非"覆盖所有可能输入"）
intent_descriptions = [
    {"name": "physics", "description": "解答力学、光学、热学等物理问题"},
    {"name": "math",    "description": "解答代数、微积分、概率统计等数学问题"},
]

# 构建向量数据库
embeddings = DashScopeEmbeddings()
texts = [d["description"] for d in intent_descriptions]
metadatas = [{"name": d["name"]} for d in intent_descriptions]

vectorstore = Chroma.from_texts(texts=texts, embedding=embeddings, metadatas=metadatas)

def get_relevant_chain_name(user_input: str, threshold: float = 0.7) -> str:
    """根据向量相似度获取最匹配的意图名称"""
    docs = vectorstore.similarity_search_with_score(user_input, k=1)
    if not docs:
        return "default"
    doc, score = docs[0]
    if score < threshold:
        return "default"    # 相似度不足，兜底
    return doc.metadata["name"]

# 路由执行
intent = get_relevant_chain_name("牛顿第一定律是什么")
chain = chain_router.get(intent, default_chain)
result = chain.invoke({"input": user_input})
```

**description 的写法原则**：
- 写"你的大模型**能解决**的问题"，而不是"可能属于这类的所有问题"
- 宁可覆盖少，不要过度承诺——匹配到但解决不了会产生幻觉，损害用户信任

---

## 多策略融合

规则方案和大模型方案可以结合使用：

```
用户输入
  → 规则引擎（快速、精确、可解释）
      ├── 规则命中 → 直接输出意图
      └── 规则未命中 → 大模型二次判断（slower but flexible）
                          └── 大模型也不确定 → 兜底响应
```

这种混合策略同时兼顾了**速度**（规则先行）和**覆盖率**（模型兜底）。

---

## 常见坑与注意事项

### 1. FAQ 概念模糊导致检索错误
当知识库中的问题描述过于模糊时，可以在意图识别前用 RAG 做内容增强，再判断意图。

### 2. 意图白名单防注入
意图识别结果若由大模型生成，需防止提示词注入攻击：

```python
ALLOWED_INTENTS = {"presales", "aftersales", "query_order"}

def safe_route(raw_intent: str) -> str:
    if raw_intent not in ALLOWED_INTENTS:
        return "default"   # 非预设意图一律拒绝
    return raw_intent
```

### 3. Slot 被截断
对话轮数过多或提示词过长时，大模型可能截断 slot 输出（如 18 位订单号被截短）。建议：
- 打印 slot 生成日志
- 对 slot 字段做长度校验

### 4. 兜底设计
向量路由需设置相似度阈值：

```python
if score < 0.7:
    return "对不起，您的问题超出了我的服务范围，请联系人工客服。"
```

### 5. 何时用 LangGraph 而非 LangChain RouterChain

| 场景 | 推荐方案 |
|------|---------|
| 工作流节点 ≤ 2，无复杂分支 | LangChain RouterChain |
| 节点 > 2，或有复杂条件分支 | LangGraph |
| 需要多轮状态追踪 | LangGraph |

---

## Connections
- → [[intent-recognition-pipeline]]
- → [[langchain-lcel-runnable]]
- → [[langchain-agent-architecture]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释"多策略融合"方案的执行流程，以及为什么要让规则引擎先行、大模型兜底，而不是反过来？
2. 在向量相似度路由中，为什么 description 要写"能解决的问题"而非"所有可能的输入"？相似度阈值不足时应如何处理？
3. 大模型意图识别存在提示词注入风险，课程给出的防御方案是什么？此外，槽位被截断的根本原因是什么，如何排查？

> [!example]- Answer Guide
> 
> #### Q1 — 多策略融合执行流程
> 
> 规则引擎速度快、结果精确可解释，命中直接输出意图；规则未命中再交给大模型二次判断，大模型也不确定则兜底响应。规则先行能降低延迟和成本，大模型负责覆盖长尾场景，两者互补。
> 
> #### Q2 — 向量相似度路由 description 设计
> 
> description 写"能解决的问题"是为了宁可覆盖少也不过度承诺——若匹配上但实际解决不了，大模型会产生幻觉，损害用户信任。相似度低于阈值（如 0.7）时应返回兜底响应，提示用户联系人工客服。
> 
> #### Q3 — 提示词注入防御与槽位截断排查
> 
> 防御方案是维护一个 `ALLOWED_INTENTS` 白名单，将大模型输出的意图名与白名单比对，不在名单内一律路由到 default。槽位截断的根因是对话轮数过多或提示词过长导致大模型输出被截短，排查方法是打印 slot 生成日志并对字段做长度校验。
