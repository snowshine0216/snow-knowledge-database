---
tags: [langchain, memory, context-window, agent, session, redis, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927453
wiki: wiki/concepts/langchain-memory-management.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在对话式 AI 应用中，"短期记忆"和"长期记忆"分别指什么？它们的主要区别是什么？
2. 当多轮对话历史超出 LLM 的 context window 限制时，你会用什么策略来处理？
3. 如果要让 AI 助手在用户关闭页面后再次打开时仍能"记住"之前的对话，你认为需要哪些技术支持？

---

# 037: 上下文理解与记忆管理

**Source:** [6上下文理解与记忆管理](https://u.geekbang.org/lesson/818?article=927453)

## Outline
- [记忆的本质与分类](#记忆的本质与分类)
- [记忆的核心操作](#记忆的核心操作)
- [LangChain 内置记忆模块](#langchain-内置记忆模块)
- [Window Buffer Memory：限定轮次](#window-buffer-memory限定轮次)
- [Redis 持久化会话记忆](#redis-持久化会话记忆)
- [Mem0：跨会话长期记忆](#mem0跨会话长期记忆)
- [多用户会话隔离策略](#多用户会话隔离策略)
- [小结](#小结)

---

## 记忆的本质与分类

**记忆 vs 知识库**：知识库是静态存储（向量库、知识图谱、数据库），而记忆是随对话过程动态积累的上下文信息。记忆的核心目标有两个：
1. 关闭页面再打开时，仍能延续上一轮对话（会话持久化）
2. 长文对话时避免前后矛盾，保持行动一致性

**按存储时间划分**：
- **短期记忆**：当前 session 内的对话历史，受限于 context window 长度，需要用滑动窗口或压缩策略防止溢出
- **长期记忆**：跨 session 保留，通常存入 Redis / 数据库，让模型记住用户的个人习惯和偏好

**按内容性质划分**：
- **情景记忆（Episodic）**：过去发生的具体经历，如"用户惯用中文、常聊 AI 工程话题"
- **语义记忆（Semantic）**：抽象知识，如领域概念、技能
- **程序性记忆（Procedural）**：不可言说的执行方式，模型能使用但无法复述

## 记忆的核心操作

```
编码 → 存储 → 提取（回忆）→ 巩固 / 遗忘
```

| 操作 | 说明 |
|------|------|
| **编码** | 将对话文本按顺序结构化（human / ai 交替格式），便于后续检索 |
| **存储** | 写入内存 buffer 或外部存储（Redis、MySQL） |
| **提取** | 语义检索或精确匹配，结果过长时需二次摘要再注入 context |
| **巩固** | 对话超过阈值轮次后，将短期记忆压缩存入长期存储 |
| **遗忘** | 覆盖写入或随时间衰减降低重要性权重，防止记忆混乱 |

## LangChain 内置记忆模块

### ConversationBufferMemory（全量缓冲记忆）

将所有历史对话保存在内存中，通过 `memory_key` 变量注入 prompt 模板。

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

memory = ConversationBufferMemory(memory_key="chat_history")
chain = ConversationChain(
    llm=llm,
    prompt=prompt,
    memory=memory,
    verbose=True
)

chain.predict(input="你好！")
chain.predict(input="今天怎么样？")
```

**优点**：简单直接，不丢失任何历史信息  
**缺点**：对话越长内存占用越大，最终会超出 context window 限制

## Window Buffer Memory：限定轮次

`ConversationBufferWindowMemory` 设置固定滑动窗口，只保留最近 `k` 轮对话，超出则丢弃最早的。

```python
from langchain.memory import ConversationBufferWindowMemory

memory = ConversationBufferWindowMemory(k=2)  # 只保留最近 2 轮
chain = ConversationChain(llm=llm, memory=memory)

chain.predict(input="我是张先生")  # 轮1
chain.predict(input="今天天气如何？")  # 轮2
chain.predict(input="推荐一家餐厅？")  # 轮3
chain.predict(input="你还记得我的名字吗？")  # 轮4 → 已忘记轮1
```

**适用场景**：需要控制 token 成本、对话早期内容不重要的场景

## Redis 持久化会话记忆

使用 `RedisChatMessageHistory` 替换内存缓冲，语法上只是换一个类名，其余链式调用完全相同。

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory
from langchain.memory import ConversationBufferMemory

history = RedisChatMessageHistory(
    url="redis://localhost:6379",
    session_id=session_id
)

memory = ConversationBufferMemory(
    chat_memory=history,
    memory_key="chat_history",
    return_messages=True
)
```

**要点**：`session_id` 是区分不同会话的唯一键，生产中通常用 `f"{user_id}:{timestamp}"` 组合保证唯一性。

## Mem0：跨会话长期记忆

[Mem0](https://github.com/mem0ai/mem0) 是专为 AI agent 设计的记忆库，安装包名为 `mem0ai`。

```python
from mem0 import Memory

# 初始化（支持配置向量后端、LLM 等）
memory = Memory()

# 添加记忆（必须指定 user_id）
memory.add(
    messages=[{"role": "user", "content": "我要从北京寄一个笔记本到上海"}],
    user_id="id123"
)

# 检索记忆
results = memory.search(query="用户寄送信息", user_id="id123")
```

**核心优势**：与 LangChain 集成简洁，支持跨会话持久化，通过 `user_id` 隔离不同用户的记忆空间。

## 多用户会话隔离策略

Mem0 本身没有 session 概念，实际工程中通过复合 key 模拟：

```python
import time

def get_session_id(user_id: str) -> str:
    """生成复合 session ID：时间戳 + 用户 ID"""
    return f"{int(time.time())}:{user_id}"

# 新会话每次生成不同 session_id
session_id = get_session_id("user_zhang")

# 存储时用 session_id 作为 user_id 参数
memory.add(messages=..., user_id=session_id)
```

这样既保留了用户身份（前缀匹配），又区分了不同会话时段。

**生产建议**：
1. 只做 **添加** 和 **搜索**，不做删除（防止意外丢失关键记忆）
2. 对 Redis / MySQL 做初始化连接检查，封装成独立模块
3. 区分对话角色（human / ai）与对话 session

## 小结

| 记忆类型 | 工具 | 场景 |
|---------|------|------|
| 全量缓冲 | `ConversationBufferMemory` | 短对话，预算充足 |
| 滑动窗口 | `ConversationBufferWindowMemory` | 需控制 token，早期历史不重要 |
| Redis 持久化 | `RedisChatMessageHistory` | 跨重启保留会话 |
| 跨会话长期 | `Mem0` | 个性化助手，用户画像积累 |

下一讲将介绍 **ReAct 模式**（Reasoning + Acting），将记忆能力与工具调用整合进 agent 工作循环。

## Connections
- → [[langchain-memory-management]]
- → [[langchain-agent-react-tool-use]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释 `ConversationBufferWindowMemory` 的滑动窗口机制，以及它相比 `ConversationBufferMemory` 在使用场景和代价上的取舍是什么？
2. 如何用 `RedisChatMessageHistory` 实现跨重启的会话持久化？生产环境中 `session_id` 应如何设计，才能同时区分不同用户和同一用户的不同会话时段？
3. Mem0 的核心优势是什么？在多用户场景下，如何通过复合 key 策略弥补它"没有 session 概念"的局限？

<details>
<summary>答案指南</summary>

1. `ConversationBufferWindowMemory` 只保留最近 `k` 轮对话，超出后丢弃最早的轮次，从而控制 token 成本；代价是早期对话内容（如用户姓名）会被遗忘，适用于早期历史不重要的场景。`ConversationBufferMemory` 保留全量历史，简单但会随对话增长最终超出 context window 限制。
2. 将 `RedisChatMessageHistory` 传入 `ConversationBufferMemory` 的 `chat_memory` 参数即可替换内存缓冲，其余链式调用不变；生产中 `session_id` 通常用 `f"{user_id}:{timestamp}"` 组合，前缀保留用户身份，时间戳区分不同会话时段。
3. Mem0 专为 AI agent 设计，通过 `user_id` 隔离不同用户的记忆空间，支持跨会话长期持久化，适合个性化助手积累用户画像；由于它本身没有 session 概念，工程上用时间戳与 user_id 拼接的复合 key 作为 `user_id` 参数传入，来模拟多会话隔离。

</details>
