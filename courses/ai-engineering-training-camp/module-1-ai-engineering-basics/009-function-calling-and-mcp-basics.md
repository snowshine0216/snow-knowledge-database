---
tags: [function-calling, tool-calling, mcp, agent, openai, api-design, security, langchain]
source: https://u.geekbang.org/lesson/818?article=927426
wiki: wiki/concepts/009-function-calling-and-mcp-basics.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. OpenAI 最初将工具调用能力命名为"Function Calling"，后来改名为"Tool Calling"。你认为改名的原因是什么？
2. 什么是 Agent？它与单纯的工具调用有什么本质区别？
3. Function Calling 和 MCP 都涉及工具调用，你认为它们分别解决的是哪个层面的问题？

---

# 009: Function Calling 与 MCP 基础

**Source:** [AI 工程化训练营 Function Calling 与 MCP 基础](https://u.geekbang.org/lesson/818?article=927426)

## Outline
- [Function Calling 的起源与命名演变](#function-calling-的起源与命名演变)
- [Agent 概念的诞生](#agent-概念的诞生)
- [Tool Calling 五步完整流程](#tool-calling-五步完整流程)
- [工具定义最佳实践](#工具定义最佳实践)
- [Function Calling 工程化价值](#function-calling-工程化价值)
- [Function Calling vs. MCP：定位与场景](#function-calling-vs-mcp定位与场景)

---

## Function Calling 的起源与命名演变

大模型最初只有输入和输出，能做的事情有限。OpenAI 发现这个局限后引入了"工具调用"能力，最初命名为 **Function Calling**。

但这个名字容易误解：在编程语言里"function call"意味着在内核层内部调用并返回——而大模型调用工具的实际机制恰恰相反，是模型**告诉外部（客户端）要调用什么工具**，由客户端在本地执行后再把结果送回。基于此，OpenAI 后来把它改名为 **Tool Calling（工具调用）**，更准确地反映了"客户端持有工具箱、由客户端使用工具"的语义。

> Tool Calling = Tool Calling 包含一种工具 = Function（函数）。Function Calling 是 Tool Calling 的子集。

Function Calling 正式在 **2023 年 6 月 13 日** 随 GPT-4 Turbo 引入。此前的所有模型均不支持；并行函数调用目前主要由 GPT-4o、GPT-4、GPT-3.5 支持。

---

## Agent 概念的诞生

工具调用解决了"与外部工具割裂"的问题，但调用与模型仍是两个独立环节。OpenAI 进一步思考：能否让模型完成自己的**内循环**——意图识别 → 任务规划 → 工具调用 → 结果反馈 → 再决策？

这个闭环就是 **Agent Loop**。将内循环能力集成到模型周围后，就形成了我们现在所说的 **Agent**。Agent 的能力展开：

| 能力 | 实现方式 |
|------|----------|
| 感知（输入理解） | Prompt / System Prompt |
| 记忆 | 短期：对话历史；长期：向量数据库 + MySQL/PostgreSQL |
| 任务规划与分解 | Prompt 驱动 / 推理模型 |
| 工具调用 | Function/Tool Calling |
| 远程工具调用 | MCP 协议 |

---

## Tool Calling 五步完整流程

以"查询星座今日运势"为例（OpenAI 官方示例），完整流程如下：

**第一步：定义工具并与问题一起发送给模型**

```python
tools = [{
    "type": "function",
    "function": {
        "name": "get_horoscope",
        "description": "当用户想要获取星座今日运势时调用此函数",
        "parameters": {
            "type": "object",
            "properties": {
                "sign": {
                    "type": "string",
                    "description": "星座名称，如 Aquarius、Leo 等",
                    "enum": ["Aries","Taurus","Gemini","Cancer","Leo","Virgo",
                             "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"]
                }
            },
            "required": ["sign"]
        }
    }
}]

# 把工具列表 + 用户问题一起发给模型
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "我是水瓶座，我的运势如何？"}],
    tools=tools
)
```

**第二步：接收模型的 tool_call JSON（不是答案）**

```python
# finish_reason = "tool_calls"，表示模型判断需要调用工具
# 返回内容包含 call_id、函数名、参数
tool_call = response.choices[0].message.tool_calls[0]
# tool_call.function.name == "get_horoscope"
# tool_call.function.arguments == '{"sign": "Aquarius"}'
```

**第三步：客户端本地执行工具函数**

```python
# 工具在客户端执行，不在模型端！
result = get_horoscope(sign="Aquarius")
# → "下周二你将认识一个有趣的人..."
```

**第四步：将工具结果追加到消息历史，再次请求模型**

```python
messages.append(response.choices[0].message)  # 追加 assistant 的 tool_call 消息
messages.append({
    "role": "tool",
    "tool_call_id": tool_call.id,  # 保持 ID 一致，维护时序
    "name": "get_horoscope",
    "content": result
})
final_response = client.chat.completions.create(model="gpt-4o", messages=messages)
```

**第五步：模型整合工具结果生成最终答案**

**关键理解点**：
- 模型输出的是 JSON 指令，不是执行工具
- 工具**必须在客户端执行**（安全边界在客户端）
- `tool_call_id` 用于在多工具并行调用时匹配请求与结果
- 多工具时，参数以字典（键值对）形式返回，不是列表
- `finish_reason = "tool_calls"` 是模型告诉客户端"去执行工具"的信号

> 注意：OpenAI 官方文档示例常因文档更新但 Python 库未同步而跑不通，需自行修复。

---

## 工具定义最佳实践

**1. 函数名清晰，避免缩写**
- 不用缩写（如 `gt_wthr`），使用完整有意义的名称（`get_weather`）
- 名称较长时用驼峰命名（`getWeatherForecast`）
- 函数名和 description **共同**决定模型能否正确识别并调用工具

**2. 用 enum 约束有限值参数**
当参数有固定选项时（如十二星座、T 恤尺码 S/M/L），用 `enum` 限定取值范围，避免模型随意填入错误值：
```json
"sign": {"type": "string", "enum": ["Aries", "Taurus", "Gemini", ...]}
```

**3. 已知参数不要让模型填充**
例如查询"今天"的天气，日期应由代码获取（`datetime.date.today()`），而非让模型猜测——模型填充已知参数容易出错。只让模型填写真正需要从用户输入提取的参数。

**4. 控制工具数量（< 20 个）**
函数过多会降低调用精度，官方建议单次请求工具不超过 20 个。

**5. 优先使用模型内置功能**
若模型自带 Code Interpreter、Web Search 等功能，无需再通过 Function Calling 手写实现。

**工具调试思路**：若调用链路出问题，逐步打印每个阶段的输出（工具列表发送 → tool_call JSON → 本地执行结果 → 最终消息），定位在哪个环节断了。Function Calling 是贯穿 LangChain、Agent、Multi-Agent、RAG 全程的基础机制，理解底层流程是排查上层问题的根本。

---

## Function Calling 工程化价值

**解耦**：模型只负责"要不要调用"（语义理解），开发者负责"具体怎么实现"（业务逻辑）——将智能决策与确定性执行彻底分离。

**智能调度**：通过工具的 description 和函数名，模型自动选择合适的工具，无需硬编码 if/else。

**易扩展**：新增工具只需添加一个工具定义，主流程代码不变。

**可追踪性与安全性**：调用链路完全在开发者掌控中，可加权限控制、参数校验、审计日志。

**高级工程化方向**（进阶）：
- **工具注册中心**：管理大量工具的统一注册与发现
- **参数校验**：防止注入攻击（用户传恶意参数触发 SQL/Prompt 注入）
- **自动重试**：工具调用失败时的 fallback 与重试机制
- **结果缓存**：相同工具相同参数复用缓存，避免重复查库
- **权限控制**：限制特定工具的调用权限
- **可观测性**：用 LangSmith/LangFuse 追踪工具调用日志

---

## Function Calling vs. MCP：定位与场景

**它们不是替代关系**（再次强调）：Function Calling 在应用层，MCP 在协议层，解决的是不同层面的问题。

| 维度 | Function Calling | MCP |
|------|-----------------|-----|
| 定位 | 应用层：工具执行机制 | 协议层：工具获取标准 |
| 工具来源 | 开发者自己编写 | 从 MCP 服务器动态获取 |
| 工具部署位置 | 内网，自有代码 | 外网，第三方服务 |
| 安全性 | 高（控制权在开发者） | 低（需审查第三方；可能访问本地硬盘） |
| 稳定性 | 高（内部 API 变动少） | 较低（依赖外部服务） |
| 灵活性 | 低（需手动写工具定义） | 高（无需写字典，直接从 MCP 枚举） |
| 典型用途 | 内部数据库查询、内部 API 调用 | 外部 SaaS 服务（地图、支付、搜索等） |

**MCP 安全现状**：
- 第三方 MCP 工具可能有权限访问本地硬盘
- 客户端批准机制常被"默认全部允许"绕过
- 当前的 Header 认证只验证"是否使用服务"，不验证服务器是否安全（单向认证）
- MCP 目前尚不成熟，企业生产环境中仍以 Function Calling 为主；炒概念 demo 居多

**当前最佳实践**：
- **内部 API / 数据库 / 计算**：继续用 Tool Calling（稳定、安全、可控）
- **外部 SaaS 服务**（地图、支付、内容平台）：用 MCP（灵活，无需自写工具定义）

**工作流差异**：唯一明显区别在"获取工具列表"这步——Function Calling 手写工具字典，MCP 从 MCP 服务器动态获取工具列表，其余调用逻辑基本相同。

---

## Connections

- → [[007-llm-invocation-and-function-calling-basics]]（Function Calling 基础原理）
- → [[006-what-is-ai-engineering]]（MCP 在协议层，Tool Calling 在应用层的层级解析）
- → 模块 3：LangChain 中的工具调用封装与可观测性


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话描述 Tool Calling 的五步完整流程，并解释为什么工具必须在客户端执行，而不是在模型端执行？
2. Function Calling 与 MCP 在安全性和稳定性上有何不同？分别在什么场景下应该优先选择哪种方式？
3. 定义工具时有哪些最佳实践？请解释"已知参数不要让模型填充"这条原则背后的工程原因。

<details>
<summary>答案指南</summary>

1. 模型只输出 JSON 指令（`finish_reason = "tool_calls"`）来告知客户端调用哪个工具，工具的实际执行由客户端在本地完成，结果再追加到消息历史后发回模型生成最终答案。工具在客户端执行是安全边界的核心设计——控制权始终在开发者手中。
2. Function Calling 属于应用层（安全性高、稳定、控制权在开发者，适合内部 API/数据库），MCP 属于协议层（灵活、可从服务器动态获取工具，适合外部 SaaS 服务，但存在第三方安全风险和稳定性较低的问题）。
3. 核心实践包括：函数名清晰避免缩写、用 `enum` 约束有限值参数、控制工具数量不超过 20 个。"已知参数不让模型填充"的原因是模型在填充确定性信息（如当天日期）时容易出错，应由代码直接获取，只让模型从用户输入中提取真正未知的参数。

</details>
