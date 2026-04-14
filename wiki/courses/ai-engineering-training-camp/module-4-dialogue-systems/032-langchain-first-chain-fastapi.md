---
tags: [langchain, lcel, dialogue-system, fastapi, prompt-template, output-parser, langserve, deepseek, tongyi]
source: https://u.geekbang.org/lesson/818?article=927448
---
# 构建第一个 LangChain 对话链与 FastAPI 封装

模块 4 开篇：从最小可运行的 `prompt | llm | parser` 出发构建对话系统。核心观点 — 真正能上线的对话系统是**前端接入 + 对话引擎（NLU/DM/DST/Agent）+ 后台业务**的三层架构，但起手阶段必须用 Happy Path 简化：忽略所有异常，假设用户一次性提供所有槽位、工具调用不失败，这样只剩下 LangChain 的 Chain 抽象本身。先在这条最短路径上把 LCEL 语法、`BaseMessage` 的六种角色、自动类型匹配、FastAPI 封装全部打通；后续课程再增量引入意图识别、槽位追问、DST、工具调用、记忆。

## Key Concepts

- **三层对话架构**：前端接入层（Web/Mobile/WeChat/Feishu，统一为类 OpenAI 格式）→ 对话引擎层（NLU 提意图 + 抽槽位 → DM 决定下一步 → DST 跨会话追踪 → Agent 执行）→ 后台业务层（API 网关 / 订单 / CRM / 消息队列）。企业在前端 → 对话引擎的统一协议层值得长期投入，OpenAI 协议已成事实标准。
- **LangChain Chain 三件套**：`PromptTemplate` / Language Model / `OutputParser`，用 LCEL 的 `|` 串成 Chain。组件间类型自动匹配（`BaseMessage` → `str` → `list`）。
- **LLM vs ChatModel**：前者吃 `str`、吐 `str`（最简单）；后者吃 `List[BaseMessage]`、吐 `BaseMessage`。两者都用 `.invoke()` 统一入口。`BaseMessage` 有六种内置角色 — HumanMessage、AIMessage、SystemMessage、FunctionMessage、ToolMessage、ChatMessage（自定义）。
- **LangChain 术语"叛逆"**：它把"聊天模型"叫"大模型"、"提示词模板"叫"提示词"、"解析器"叫"输出处理" — 类比新浪微博占领"微博"词；理解 LangChain 第一步是接受它重新定义概念。
- **生态包**：`langchain` 核心、`langserve`（dev 环境 REST API）、`langsmith`（观测）、`langgraph`（工作流）、`langchain-<model>`（DeepSeek、Tongyi via langchain-community）、`python-dotenv`（密钥管理）。1.0 alpha 已出，生产建议 `-U` 升级。
- **LCEL 的红利**：清晰读写 + 自动类型匹配 + 原生并行与流式 + 内置调试。比手写 `llm.invoke(prompt.format(...))` + `parser.parse(...)` 更短且可扩展。
- **Partial Variables**：`PromptTemplate(partial_variables={"meal": "早餐"})` 锁定部分参数，业务方只填剩余字段。多变量模板用 `input_variables=[...]` 强制必填。
- **FastAPI 封装陷阱**：把 Chain 放进类的 `__init__` 后必须用 `self.chain` 调用（Java/Go/C++ 转 Python 最容易忘）；session 先用内存 dict，下一讲会替换为 Redis。
- **禁用模板内条件逻辑**：现代大模型用自然语言描述逻辑已经足够；复杂分支交给 LangGraph 工作流，别在 PromptTemplate 里写 `{% if %}`。

## Key Takeaways

- 从 Happy Path 起手 — 忽略异常，3 行代码跑通 `prompt | llm | parser`；再迭代加槽位、追问、状态追踪。
- `invoke()` 是 LangChain 所有组件的**通用执行入口**，可以直接调用 Chain，也可以调用链内任意单个组件。
- 想切换模型 provider，直接 `pip install langchain-<vendor>` + 实例化即可，base_url 无需手写。
- 国内大模型几乎全部适配 OpenAI 协议，OpenAI 已成事实标准；未来可能被 Anthropic 协议挑战，前端接入层的统一抽象是长期收益的地方。
- OutputParser 不只是格式化 — 它还承担**类型转换 + 校验 + 失败重试**，生产必备。
- session 管理是多轮对话一切讨论的起点：必须显式存历史，无论是内存 dict 还是 Redis。
- LangChain 代码量会随着 agent 复杂度暴涨，这是后续课程要引入 LangGraph 的直接原因。

## See Also

- [[008-langchain-core-components]] — LangChain 基础组件：三大模块、LangGraph 差异、AutoGen 对比
- [[010-langchain-core-components-detailed]] — 六大模块深解：Model I/O / Memory / Tools / Callback / LCEL / RAG
- [[langchain-lcel-runnable]] — LCEL `|` 管道语义与 Runnable 体系
- [[langchain-memory-management]] — Memory 机制与 Redis 持久化
- [[034-langchain-chain-analysis-1]] — LangChain 链源码解析 (Part 1)

## Related sources

- **[033 深入输入输出]**：032 搭了 Hello-World 级别的 `prompt | llm | parser` 链，033 把三件套每一件都做了"自定义化"升级。新增内容：**自定义 PromptTemplate**（动态段落组合 + Pydantic `@validator` 字段校验 + JSON 保存/热加载，替代 `{% if %}` 模板逻辑）；**System vs User Prompt 严格分离**（系统侧是模板工作，用户只填数据 + 选 `type`）；**自建 vLLM Wrapper**（参数按基础/采样/惩罚/流式分类 + 保守/平衡/创意/精确/多样五种 preset，彻底规避业务代码里的参数表）；**自定义 OutputParser**（正则提取"类 JSON"→ 合法 JSON 的兜底方案，以及"微调模型直接产合法 JSON"的根治建议）。See also: [[033-deep-input-output]]
