---
tags: [multi-agent, autogen, customer-service, fastapi, retry, slot-filling, langchain, practice, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927432
wiki: wiki/concepts/015-multi-agent-customer-service-practice.md
---

# 015: 多 Agent 协同客服系统（Project 2 实战）

**Source:** [AI 工程化训练营 Project 2 多 Agent 协同客服系统](https://u.geekbang.org/lesson/818?article=927432)

## Outline
- [项目结构](#项目结构)
- [五个 Agent 角色设计](#五个-agent-角色设计)
- [AutoGen GroupChat 核心代码](#autogen-groupchat-核心代码)
- [指数退避重试装饰器](#指数退避重试装饰器)
- [现场排查的 Bug](#现场排查的-bug)
- [Key Takeaways](#key-takeaways)

---

## 项目结构

```
project2/
├── main.py                  # 入口：初始化 AutoGen GroupChat，启动对话
├── config/
│   └── settings.py          # 全局配置（重试参数、LLM config、API base URL）
├── call/
│   └── logging.py           # 日志工具（全链路追踪）
├── server/
│   └── mock_server.py       # FastAPI 模拟外部 API（订单服务、物流服务）
├── client/
│   └── api_client.py        # 调用外部 API 的客户端（含 retry 装饰器）
└── retry.py                 # 指数退避重试装饰器
```

FastAPI 模拟服务器作为外部 API 的替身，提供：
- `GET /orders/{order_id}` → 返回订单状态
- `GET /logistics/{order_id}` → 返回物流信息

---

## 五个 Agent 角色设计

| Agent | 职责 | 核心能力 |
|-------|------|---------|
| **customer_reception** | 接待用户，提取订单号 | 槽位填充（提取 `order_id`）|
| **order_agent** | 查询订单状态 | Function Calling → 订单 API |
| **logistics_agent** | 查询物流信息 | Function Calling → 物流 API |
| **manager** | 汇总结果，生成最终回复 | 整合多方信息 → 输出给用户 |
| **user_proxy** | 代理用户发起对话 | `initiate_chat()` 入口 |

**槽位填充示例**：`customer_reception` 的 system prompt 包含"从用户消息中提取订单号"的指令。当用户说"我订单为啥没发货"时，Agent 自动追问并填充 `order_id` 槽位后才进入后续流程。

---

## AutoGen GroupChat 核心代码

```python
import autogen

# LLM 配置
llm_config = {
    "config_list": [{"model": "gpt-4", "api_key": settings.OPENAI_API_KEY}],
    "temperature": 0
}

# 定义五个 Agent
reception = autogen.AssistantAgent(
    name="customer_reception",
    system_message="你是客服接待，负责从用户消息中提取订单号。...",
    llm_config=llm_config
)
order_agent = autogen.AssistantAgent(
    name="order_agent",
    system_message="你是订单查询专员，使用工具查询订单状态。",
    llm_config=llm_config
)
logistics_agent = autogen.AssistantAgent(
    name="logistics_agent",
    system_message="你是物流查询专员，使用工具查询物流信息。",
    llm_config=llm_config
)
manager_agent = autogen.AssistantAgent(
    name="manager",
    system_message="你是客服经理，汇总订单和物流信息后给出最终答复。",
    llm_config=llm_config
)
user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",   # 自动化运行，不需人工介入
    max_consecutive_auto_reply=10
)

# 创建 GroupChat
group_chat = autogen.GroupChat(
    agents=[reception, order_agent, logistics_agent, manager_agent, user_proxy],
    messages=[],
    max_round=12    # 防死循环
)

# 创建 GroupChatManager（协调者）
chat_manager = autogen.GroupChatManager(
    groupchat=group_chat,
    llm_config=llm_config
)

# 启动对话
user_proxy.initiate_chat(
    chat_manager,
    message="我订单为啥没发货"
)
```

**关键点**：
- `GroupChat` 持有所有 Agent 和消息历史
- `GroupChatManager` 是真正的调度者，决定下一个发言的 Agent
- `max_round` 是防死循环的硬限制（等同于 `max_turns`）
- 非 AutoGen 场景下多 Agent 通信需使用 **A2A 协议**（Agent-to-Agent）

---

## 指数退避重试装饰器

```python
# retry.py
import time
import random
import functools
from requests.exceptions import RequestException

def retry(min_wait=1, max_wait=60, max_retries=3):
    """
    指数退避重试装饰器。
    参数可在调用时覆盖，也可从 config/settings 读取默认值。
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            wait_time = min_wait
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except RequestException as e:
                    retries += 1
                    if retries >= max_retries:
                        raise
                    # 指数退避 + 随机抖动（防止惊群效应）
                    jitter = random.uniform(0, wait_time * 0.1)
                    sleep_time = min(wait_time + jitter, max_wait)
                    time.sleep(sleep_time)
                    wait_time = min(wait_time * 2, max_wait)
        return wrapper
    return decorator
```

**使用方式**：

```python
# api_client.py
from retry import retry
from config import settings

@retry(
    min_wait=settings.RETRY_MIN_WAIT,
    max_wait=settings.RETRY_MAX_WAIT,
    max_retries=settings.RETRY_MAX_RETRIES
)
def get_order(order_id: str) -> dict:
    response = requests.get(f"{settings.ORDER_API_BASE}/orders/{order_id}")
    response.raise_for_status()
    return response.json()
```

**设计要点**：
- 参数通过 `config/settings` 集中管理，不硬编码
- 随机抖动（jitter）防止多个 Agent 同时重试时的惊群效应
- `max_retries` 后抛出异常而非静默失败

---

## 现场排查的 Bug

**现象**：物流查询失败时重试逻辑未触发，HTTP 500 直接抛出。

**根因**：物流模块的重试装饰器捕获的异常类型有误：

```python
# ❌ 错误：只捕获 RequestException，未处理 HTTP 状态错误
except RequestException as e:
    ...

# ✅ 正确：还需捕获 HTTPError（raise_for_status() 抛出的异常）
except (RequestException, requests.exceptions.HTTPError) as e:
    ...
```

`raise_for_status()` 抛出的是 `HTTPError`（`RequestException` 的子类），但在某些版本或写法下，如果异常继承链不完整，`except RequestException` 不一定能捕获到。**最佳实践**：显式列出所有预期异常类型，或直接捕获 `Exception` 后检查类型。

---

## Key Takeaways

- AutoGen GroupChat 的核心是 `GroupChatManager` 自动调度——不需要手动写 Agent 路由逻辑
- 槽位填充（Slot Filling）是多 Agent 系统的入口质量保障：接待 Agent 必须完成槽位填充才能触发后续专职 Agent
- 指数退避 + 随机抖动是生产级重试的标准实现；参数必须集中配置，不要硬编码
- `max_round` / `max_turns` 是防止 Agent 死循环的必要硬限制
- 重试逻辑 Bug 往往来自异常类型不匹配——现场 Debug 时要追踪完整的异常继承链

---

## Connections

- → [[013-multi-agent-finetuning-deployment]]（GroupChat/Debate 协作模式的理论基础）
- → [[012-prompt-engineering-and-agent-design]]（槽位填充的设计原则）
- → [[009-function-calling-and-mcp-basics]]（Agent 调用外部 API 的底层机制）
