---
tags: [intent-recognition, slot-filling, langchain, agent, pipeline, nlp, rag, routing, vector-search]
source: https://u.geekbang.org/lesson/818?article=927452
---

# 意图识别流水线设计

意图识别是 Agent Plan 阶段的核心入口，负责判断用户想要做什么，并将请求路由到正确的处理链。

## Key Concepts

### 意图识别的边界

意图识别不是"识别所有用户意图"，而是先区分 **AI 能处理 vs. AI 不能处理**：

```
用户请求
├── AI 无法处理（退款审核、费用争议等）→ 转人工 / 兜底
└── AI 可以处理 → 细分意图 → 路由到对应 Agent
```

### 意图识别 + 槽位填充（Slot Filling）

```
意图识别：query_order
槽位填充：order_id = "123456"
```

两步合一，才能完整驱动下游业务逻辑。

### 三种实现方案对比

| 方案 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| 规则引擎 | 正则 + 关键词 + 状态机 | 快速、可控、可解释 | 维护成本高，覆盖有限 |
| LLM RouterChain | 大模型生成分类标签 | 灵活，覆盖广 | 慢、成本高、有幻觉风险 |
| 向量相似度路由 | Embedding + ChromaDB 相似搜索 | 轻量、无需大模型调用 | 依赖 description 质量 |

### 方案一：规则引擎

```python
import re

ORDER_ID_PATTERN = re.compile(r'\b\d{6,18}\b')
QUERY_KEYWORDS = ["查询", "订单状态", "物流"]

def extract_intent_by_rules(text: str) -> dict:
    order_id = (m := ORDER_ID_PATTERN.search(text)) and m.group()
    if any(kw in text for kw in QUERY_KEYWORDS):
        intent = "query_order"
    else:
        intent = "unknown"
    return {"intent": intent, "slots": {"order_id": order_id}}
```

### 方案二：LLM RouterChain

```python
from langchain.chains.router import MultiPromptChain

chain = MultiPromptChain.from_prompts(
    llm=ChatTongyi(model="qwen-turbo", temperature=0),
    prompt_infos=[
        {"name": "presales",   "description": "售前咨询", "prompt_template": presales_tpl},
        {"name": "aftersales", "description": "售后支持", "prompt_template": aftersales_tpl},
    ],
)
```

> 复杂场景（超过 2 节点）推荐改用 [[langchain-lcel-runnable|LangGraph]]。

### 方案三：向量相似度路由

```python
from langchain_community.vectorstores import Chroma

vectorstore = Chroma.from_texts(
    texts=["解答物理问题", "解答数学问题"],
    metadatas=[{"name": "physics"}, {"name": "math"}],
    embedding=embeddings,
)

def route_by_similarity(user_input: str, threshold: float = 0.7) -> str:
    docs = vectorstore.similarity_search_with_score(user_input, k=1)
    doc, score = docs[0]
    return doc.metadata["name"] if score >= threshold else "default"
```

**Description 写法原则**：写"你的模型**能解决**的问题"，而非"可能属于这类的所有输入"。

### 多策略融合

```
规则引擎（fast path）
  → 命中 → 返回
  → 未命中 → LLM/向量路由（slow path）
               → 不确定 → 兜底
```

## Key Takeaways

- 意图识别的第一步是划清 AI 的能力边界，不要让 AI 过度承诺
- 规则引擎是目前电信、电商等行业的主流方案，速度快、可解释
- 向量相似度路由比 LLM RouterChain 更轻量，description 的写法决定匹配质量
- 槽位（Slot）被截断是常见问题，需要对关键字段做长度校验和日志追踪
- 意图输出建议用整数（1/2/3）而非文字，防止提示词注入，后续程序判断也更方便

## See Also

- [[langchain-lcel-runnable]] — LCEL 管道，RouterChain 的技术基础
- [[langchain-error-handling-patterns]] — 路由兜底与降级策略
- [[langchain-agent-architecture]] — Agent 完整架构（Plan/Memory/Tool/Action）
