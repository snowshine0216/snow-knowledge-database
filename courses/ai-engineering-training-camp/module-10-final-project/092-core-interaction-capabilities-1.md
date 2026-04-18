---
tags: [ai-engineering, customer-service, quick-commands, session-history, redis, langgraph, greeting, mvp]
source: https://u.geekbang.org/lesson/818?article=930873
wiki: wiki/concepts/092-core-interaction-capabilities-1.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在构建客服AI系统时，如果用户打开页面不知道该问什么，你会如何设计一个"开场引导"功能？
2. Redis 存储对话历史时，如何确保不同用户的会话不会相互干扰？你会用什么数据结构和键名策略？
3. 当用户执行"重置对话"时，真删除和假删除（影子存储）的区别是什么？各自适用什么场景？

---

# 092: Core and Interaction Capabilities Part 1

**Source:** [4-补充核心与交互能力1](https://u.geekbang.org/lesson/818?article=930873)

## Outline
- [From MVP to V2: Capability Gaps](#from-mvp-to-v2-capability-gaps)
- [Multi-Person Collaboration and Version Management](#multi-person-collaboration-and-version-management)
- [Greeting (Open Scene) API](#greeting-open-scene-api)
- [Quick Commands Implementation](#quick-commands-implementation)
- [Session History with Redis](#session-history-with-redis)
- [LangGraph Thread ID for Multi-User Isolation](#langgraph-thread-id-for-multi-user-isolation)
- [Reset Session: True vs Shadow Delete](#reset-session-true-vs-shadow-delete)

---

## From MVP to V2: Capability Gaps

MVP验证通过后，需要补充缺失能力。MVP与V2的差距：

**V2新增能力清单**：
1. 开场白（Greeting）接口
2. 快捷指令（Quick Commands）
3. 对话历史记录（History）
4. 会话重置（Reset）
5. 推荐建议（Suggest）
6. 模型切换接口
7. 多模态问题支持
8. 知识库条目增加接口

**开发目标**：
- 先完成单机单用户所有功能（V2）
- 再改造为多租户形态（V3）

**版本迭代策略**：
- 生成缺失能力清单，逐项补充
- 每次补充完成后验证，保持版本可演示状态

---

## Multi-Person Collaboration and Version Management

多人协作开发时的常见问题和应对：

**团队开发挑战**：
> 一个人开发10小时 vs 十个人各开发1小时，效率不对等——有时一个人3个月能完成的事，引入10个人可能1年都干不完。

**版本管理模拟（不用GitHub演示）**：
- V1 = MVP（已验证的基础版本）
- V2 = 新增单用户增强能力（从V1拉取的分支）
- V3 = 多租户平台化

**代码理解辅助（AI能力）**：
当面对他人写的代码不理解时，使用AI辅助分析：
```
步骤：
1. 将整个项目/文档添加到对话上下文
2. 右下角引入之前的对话记录
3. 让AI结合上下文解释这段代码的具体含义（而非泛化注释）
```

**效果**：AI生成的上下文感知注释远比手写的模糊注释有价值，能说明：
- 代码的来源和方向
- 变量的具体含义（如：session_id来自前端的X-Request-Id请求头）
- 参数的修改建议（如：TTL时间在config的pend_session_message中修改）

---

## Greeting (Open Scene) API

**设计原因**：
- 用户打开客服时，如果没有引导，往往不知道该问什么
- 好的开场白能引导用户快速进入状态（类比写代码时"打开编辑器"是最难的第一步）

**接口设计**：
```python
@app.get("/greet")
async def greet(class_id: str = None):
    """
    返回欢迎语和快捷指令列表
    与chat接口分开，避免欢迎语影响正常对话流程
    """
    return {
        "message": "欢迎使用AI客服...",
        "shortcuts": [
            {"key": "/help", "desc": "查看所有支持的指令"},
            {"key": "/history", "desc": "查看历史对话"},
            {"key": "/reset", "desc": "重置对话"}
        ]
    }
```

**设计要点**：
- Greeting接口与chat接口分开（防止欢迎语出问题影响主对话）
- 支持`class_id`参数，不同课程使用不同欢迎语
- 返回格式与chat接口相同（JSON），方便前端统一处理
- 欢迎语中直接展示三个核心能力：课程咨询 / 订单查询 / 转人工

**引导用户的三种策略**：
1. **追问**：用户问题已大致匹配某类别，只是缺少关键词 → 追问细节
2. **反问**：用户问题完全模糊 → 带出选项让用户澄清
3. **假设答案**：用户给出模糊描述（如"内存大的手机"）→ 给出假设方案供确认

---

## Quick Commands Implementation

快捷指令让用户通过斜线命令快速触发功能。

**实现逻辑**：
```python
async def handle_quick_commands(query: str, session_id: str):
    # 1. 清理前后空白字符
    query = query.strip()
    
    # 2. 判断是否以斜线开头
    if not query.startswith("/"):
        return None  # 非快捷指令，走正常对话
    
    # 3. 统一转小写（处理大小写锁定的输入）
    cmd = query.lower()
    
    # 4. 使用字典映射替代多个if-else（Python推荐做法）
    command_handlers = {
        "/help": handle_help,
        "/history": handle_history,
        "/reset": handle_reset,
    }
    
    handler = command_handlers.get(cmd)
    if handler:
        return await handler(session_id)
    
    return "未知指令，输入 /help 查看支持的指令"
```

**Python字典映射 vs if-else**：
- 少量分支（< 3个）：if-else即可
- 大量分支：字典映射（key=命令名, value=函数对象）
- Python没有switch语句，推荐字典映射：

```python
# 字典映射示例（加减乘除场景）
handlers = {
    "+": add_func,
    "-": sub_func,
    "*": mul_func,
    "/": div_func,
}
result = handlers.get(operator, default_func)(a, b)
```

**支持的指令**：
| 指令 | 功能 | 返回内容 |
|-----|-----|---------|
| `/help` | 查看所有指令 | 指令列表（作为链接形式，点击即触发） |
| `/history` | 查看最近5条历史 | 最近对话记录 |
| `/reset` | 重置对话（清除历史） | 确认消息 |

---

## Session History with Redis

对话历史的存储和管理：

**设计目标**：
- 同一session_id下的问题能被记住（用户刷新页面后仍可恢复）
- 过一段时间后自动清除（避免旧对话干扰当前会话）
- 不同用户的对话不能混淆

**Redis实现**：
```python
# config.py 中的Session管理
MAX_HISTORY = 5        # 最多保留5条历史（演示用，生产建议更多）
TTL = 1800             # 30分钟过期

async def get_session_messages(session_id: str) -> list:
    """获取最近N条历史消息"""
    messages = await redis.lrange(f"session:{session_id}", 0, MAX_HISTORY - 1)
    return messages

async def add_session_message(session_id: str, message: dict):
    """添加消息到历史"""
    await redis.lpush(f"session:{session_id}", json.dumps(message))
    await redis.expire(f"session:{session_id}", TTL)

async def reset_session(session_id: str):
    """删除session历史（真删除）"""
    await redis.delete(f"session:{session_id}")
```

**history指令实现**：
```python
async def handle_history(session_id: str):
    messages = await get_session_messages(session_id)
    if not messages:
        return "暂无历史记录"
    
    result = "最近5条对话记录：\n"
    for msg in messages:
        result += f"- {msg['role']}: {msg['content']}\n"
    return result
```

---

## LangGraph Thread ID for Multi-User Isolation

LangGraph的CheckPoint机制实现多用户隔离：

**关键概念**：Thread ID ≠ 真正的多线程，是模拟隔离：
```python
# 构建LangGraph所需的config字典
config = {
    "configurable": {
        "thread_id": session_id  # 用session_id模拟线程隔离
    }
}

# 调用时传入config
result = await graph.ainvoke(state, config=config)
```

**CheckPoint存储配置**（降级策略）：
```python
def get_checkpointer():
    """
    优先使用SQLite CheckPoint，失败时降级到内存CheckPoint
    业务无感知，但后台可通过日志知晓问题
    """
    try:
        from langgraph.checkpoint.sqlite import SqliteSaver
        return SqliteSaver.from_conn_string("./checkpoints.db")
    except Exception as e:
        logger.warning(f"SQLite CheckPoint failed: {e}, using in-memory")
        from langgraph.checkpoint.memory import MemorySaver
        return MemorySaver()
```

**生产环境推荐**：CheckPoint存PostgreSQL或MySQL，不用SQLite。

---

## Reset Session: True vs Shadow Delete

**当前实现（真删除）**：
```python
# 直接删除Redis key
await redis.delete(f"session:{session_id}")
```

**合规场景（假删除/影子存储）**：

某些行业有法规要求保留聊天记录（如IM系统保留30-90天），需要双写：
```
写入策略：
┌──────────────────────────────────────────────────────────┐
│ 用户对话消息 → 同时写入两份：                              │
│   1. session:abc123 → Redis实时对话（TTL=30min）          │
│   2. shadow:abc123  → 数据库冷存储（保留90天合规归档）     │
└──────────────────────────────────────────────────────────┘

reset时：
- 删除 session:abc123（用户感知：历史清除）
- 保留 shadow:abc123（合规存档：实际未删除）
```

**安全提示**：
- 大模型的聊天记录可能被用作训练数据
- 即使在前端删除，服务器上仍有记录
- 不要在大模型对话中泄露敏感信息

---

## Connections
- → [[091-project-requirements-prototype-2]]
- → [[093-core-interaction-capabilities-2]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 解释为什么 Greeting 接口要与 chat 接口分开设计，以及它返回哪些核心内容？
2. 快捷指令的处理逻辑中，为什么推荐用 Python 字典映射替代 if-else？请用自己的话描述完整的处理流程。
3. LangGraph 的 Thread ID 在多用户隔离中起什么作用？CheckPoint 的降级策略是怎么实现的，为什么这样设计？

<details>
<summary>答案指南</summary>

1. Greeting 接口与 chat 接口分开，是为了防止欢迎语出问题时影响主对话流程；它返回欢迎语文本和快捷指令列表（如 `/help`、`/history`、`/reset`），并支持 `class_id` 参数使不同课程展示不同欢迎语。

2. 当分支数量较多时，字典映射（key=命令名, value=函数对象）比多层 if-else 更清晰；处理流程为：去除首尾空白 → 判断是否以 `/` 开头 → 转小写 → 用字典查找对应 handler → 有则执行，无则返回"未知指令"提示。

3. Thread ID 用 `session_id` 值传入 LangGraph 的 `config.configurable.thread_id`，使不同用户的图状态相互隔离（不是真正多线程，是模拟隔离）；降级策略优先尝试 SQLite CheckPoint，失败时自动回退到内存 MemorySaver，业务无感知但后台记录警告日志，生产环境推荐改用 PostgreSQL 或 MySQL。

</details>
