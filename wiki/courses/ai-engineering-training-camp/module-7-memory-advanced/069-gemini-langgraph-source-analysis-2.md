---
tags: [langgraph, gemini, multi-agent, web-research, reflection, structured-output, pydantic, workflow, debugging, fastapi]
source: https://u.geekbang.org/lesson/818?article=927484
---
# Gemini Fullstack LangGraph Quickstart 源码剖析（二）

承接 068，对 `graph.py` 之外的依赖包做源码剖析：`state / configuration / prompts / tools_and_schemas / utils`。项目是 Google 官方开源的反思型 agent 范本 — 生成查询 → 网络搜索 → 反思知识缺口 → 决定续搜或总结。**这是一套可直接抄走的 LangGraph 骨架**：节点/边/状态清晰分层，Pydantic schemas 约束结构化输出，条件边驱动反思循环。本讲同时点出作者的设计缺陷 — 模型实例化耦合在主流程里，导致切换 provider 时成本远高于预期 — 以及一系列工程化细节：超时、性能优化、上下文溢出、生产部署、Python 作为接口语言的本质。

## Key Concepts

- **项目目录分层**：`state.py`（5 种状态） / `configuration.py`（模型名 + 循环次数） / `prompts.py`（超长提示词提取为常量） / `tools_and_schemas.py`（agent 内部工具 + Pydantic schema） / `utils.py`（编程辅助，非 agent 能力） / `graph.py`（主工作流）。阅读顺序由内而外。
- **状态最小化原则**：节点只用必要的 state。`web_research` 不需要 `OverallState` 就别传；否则所有节点都会退化成"读全局、写全局"，难以调试。
- **模型分层（一好一坏）**：query generation 用 `gemini-2.0-flash` ✅；reflection 用 `gemini-2.5-flash` ❌（作者在炫技 — 反思应该用 pro）；final answer 用 `gemini-2.5-pro` ✅。替换建议：改 `configuration.py` 的 `default`，但要同时改 `graph.py` 里的硬编码 `ChatGoogleGenerativeAI`。
- **结构化输出**：`llm.with_structured_output(SearchQueryList)` 强制 LLM 按 Pydantic schema 返回。反思 schema 的经典三字段 — `is_sufficient: bool`、`knowledge_gap: str`、`follow_up_queries: list[str]` — 正是条件边决策的输入。
- **条件边三路分支**：`is_sufficient` → finalize / `research_loop_count >= max` → finalize（防无限循环）/ 其他 → 继续 `web_research`。保证终止且逻辑清晰。
- **`utils` vs `tools_and_schemas`**：前者是螺丝刀（字符串拼接、URL 缩短、消息提取），不参与 agent 内部；后者是工具库（`SearchQueryList`、`Reflection`、将来的 `ERPQuery`），agent 能调用的能力。
- **提示词提取为常量**：超 2k token 的 prompt 放到 `prompts.py` 模块级常量，`graph.py` 只 `import` 名字。**2k 以上禁止内联**。
- **LangSmith 调试仍是半成品**：最佳实践仍是在每个节点入口/出口加 `print`，用 Emoji 标记，f-string 打印变量；LangGraph dev server 保存自动热重载。
- **性能三板斧**：并发搜（follow_up_queries 并行）/ 调小反思模型参数 + 轮数 / **一次搜更多网页避免二轮**（cost for time 取代 time for quality）。
- **生产部署**：`langgraph dev` 仅限开发；生产是 Nginx（负载均衡）+ FastAPI/Uvicorn × N + LangGraph runtime。
- **Agent 超时不可靠**：agent 不知道搜索要多久；大模型超时隐性（Claude 4 Beta 队列 ~5 分钟）；只在外层 FastAPI 加计时器兜底。

## Key Takeaways

- 这套结构是**反思型 agent 的通用骨架** — 换领域、换模型、加工具都能套用，从开源项目落到自家业务的起点。
- **模型替换的真正难点在 `graph.py`**（硬编码初始化 + search client + API key 检查），不是 `configuration.py`。生产项目应做到"LLM 集中实例化、业务层仅接收注入"。
- **RAG 哲学**：别放主路径，当旁路工具箱里的一个工具 — agent 像调 function calling 一样按需调用 RAG / web search / MCP / ERP。试图"替换 RAG"（图片、知识图谱等）都是本末倒置。
- **Python 只是接口语言** — 大模型是 C++ CUDA kernel，Python 负责启动 + 路由；Spring AI (Java) / ByteDance EINO (Go) 是其他语言的等价框架。资源最丰富的是 Python 生态，仅此而已。
- Python 坑在异常报错几乎都是底层继承链 — **设计模式 + 异常捕捉必须前置投入**，否则后期 debug 成本极高。
- 学这个项目的正确姿势：跑起来 → 读懂 `graph.py` → 动手添加一个自定义节点 + 工具 + 数据流，验证能跑通。
- 搜索结果溢出用**截断**（web research 最合适）而非总结（多轮对话滑动窗口才用总结）。

## See Also

- [[068-gemini-fullstack-langgraph-analysis-1]] — 本讲的前半部分（`graph.py` 主流程剖析）
- [[langgraph-fundamentals]] — LangGraph 基础：节点/边/状态三大核心
- [[langgraph-advanced-patterns]] — 条件边、Reducer、子图、超步执行
- [[langgraph-state-control]] — 检查点、时间旅行、Human-in-the-Loop
- [[064-memory-system-vector-long-term-memory]] — 向量化长期记忆
- [[067-agent-observability]] — Agent 可观测性构建
