---
tags: [langchain, memory, context-window, session, redis, agent, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927453
---

# LangChain Memory Management

LangChain 提供了多层次的记忆管理机制，让 agent 在单次会话内维持上下文一致性，并在跨会话时保留用户偏好。记忆本质上是动态积累的对话信息，与静态知识库（向量库、数据库）形成互补。

## Key Concepts

- **ConversationBufferMemory**: 全量缓冲记忆，将所有对话历史保存在内存中，通过 `memory_key` 注入 prompt 模板。简单但不限制长度，长对话会超出 context window
- **ConversationBufferWindowMemory**: 滑动窗口记忆，设置 `k` 参数只保留最近 k 轮对话，超出丢弃最早的，有效控制 token 消耗
- **RedisChatMessageHistory**: 将对话历史持久化到 Redis，实现跨进程重启的会话延续，接口与内存版完全一致
- **Mem0**: 专为 AI agent 设计的跨会话长期记忆库（`pip install mem0ai`），支持 `add`、`search` 操作，通过 `user_id` 隔离不同用户的记忆空间
- **Session ID 策略**: 用 `f"{timestamp}:{user_id}"` 复合键同时区分用户身份和会话时段，Mem0 本身不区分 session，需要工程层模拟
- **记忆巩固**: 对话超过阈值轮次后，将短期记忆压缩摘要写入长期存储（Redis/MySQL），实现从短期到长期的转化
- **记忆遗忘**: 通过覆盖写入或衰减权重清理过期/无关记忆，防止不同场景的记忆相互干扰

## Key Takeaways

- 记忆 vs 知识库：知识库是静态的（预先存入），记忆是随对话动态积累的
- 生产建议：只做添加和搜索，不做删除；编码时保留对话角色（human/ai）和时序信息
- 多用户隔离：session_id 必须唯一，推荐时间戳加用户 ID 的复合形式
- context window 是短期记忆的物理限制，超限前必须用摘要或截断策略压缩
- Mem0 的核心价值是与 LangChain 的无缝集成，适合需要跨会话个性化的产品场景

## See Also

- [[langchain-agent-react-tool-use]]
