---
tags: [ai-engineering, langgraph, routing, intent-recognition, mvp, fastapi, langchain, rag]
source: https://u.geekbang.org/lesson/818?article=930872
wiki: wiki/concepts/091-project-requirements-prototype-2.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在多Agent系统中，如果一个父Agent需要调用多层嵌套的子Agent（父→子→孙），用纯框架代码实现会遇到什么工程挑战？
2. 在客服系统中做意图识别路由，你认为"关键词匹配"和"大模型分类"各有什么优缺点？
3. 当一个接口需要调用两次大模型才能返回结果，你会想到哪些方法来减少响应时间？

---

# 091: Project Requirements and Prototype Design Part 2

**Source:** [3-项目需求与原型设计2](https://u.geekbang.org/lesson/818?article=930872)

## Outline
- [LangChain 1.0 Multi-Agent Architecture](#langchain-10-multi-agent-architecture)
- [Why LangGraph Instead of Pure LangChain](#why-langgraph-instead-of-pure-langchain)
- [Intent Recognition Design](#intent-recognition-design)
- [MVP Component Testing Strategy](#mvp-component-testing-strategy)
- [MVP App Implementation](#mvp-app-implementation)
- [Routing Logic and Workflow Design](#routing-logic-and-workflow-design)
- [Performance Monitoring with LangSmith](#performance-monitoring-with-langsmith)

---

## LangChain 1.0 Multi-Agent Architecture

LangChain 1.0文档中，Agent和子Agent的调用方式：

**核心发现**：在LangChain 1.0中，一切皆工具（Tool-first）：
- 子Agent被封装成函数，函数作为工具被父Agent调用
- RAG检索也是调用工具（fetchurl等）
- 多Agent层次：controller agent → tool agent1/agent2

```python
# LangChain 1.0 multi-agent调用方式
subagent1 = create_agent(...)
# 将subagent1.invoke封装为工具
tool = create_tool(subagent1.invoke)
# 父agent通过工具调用子agent
controller_agent = create_agent(tools=[tool])
```

---

## Why LangGraph Instead of Pure LangChain

使用纯LangChain 1.0写路由时遇到的问题：

**问题**：父调子、子调孙（多层嵌套Agent），代码不优雅，改起来极难：
- 工作流 → 副Agent → 子Agent → 孙Agent
- 需要层层封装成工具，维护成本极高

**解决方案**：改用LangGraph
- LangChain 1.0底层基于LangGraph构建
- 解决问题的层次：
  1. LangChain 1.0能解决 → 用LangChain 1.0
  2. LangChain 1.0解决不了 → 用其底层LangGraph
  3. LangGraph解决不了 → 用LangChain 0.x更底层版本

**实践**：路由层（Root节点）改用LangGraph实现，更清晰：

```python
# LangGraph路由节点
graph.add_node("start", ...)
graph.add_node("route", decide_route)  # 路由判断
graph.add_node("retrieve", rag_retrieve)  # RAG检索
graph.add_node("order", order_handler)  # 订单查询
graph.add_node("direct", direct_answer)  # 直接回答

# 边
graph.add_edge("start", "route")
graph.add_conditional_edges("route", ...)
```

---

## Intent Recognition Design

意图识别是MVP的核心能力，考验的是提示词工程而非框架使用。

**提示词设计原则**：
```
分析用户查询的意图，返回以下之一：
- retrieve：需要检索知识库
- tool：需要调用工具（订单查询等）
- direct：直接回答
```

**为什么用较差的模型（Qwen Turbo）做开发测试**：
1. 参数量小，响应速度快
2. 模型不够聪明 → 提示词稍有模糊就报错 → 恶劣环境检验提示词质量
3. 开发用弱模型测试，交付时换强模型（70B、DeepSeek等）→ 对业务额外兜底

---

## MVP Component Testing Strategy

MVP开发前，需要逐一测试各组件能力：

| 测试序号 | 测试内容 | 说明 |
|---------|---------|------|
| 1 | 模型调用 + 工具调用能力 | LangChain 1.0新版本兼容性 |
| 2 | RAG能力（rag_tree + rag_ask） | FAISS检索 + 大模型回答 |
| 3 | 路由能力 | LangGraph条件边路由 |
| 4 | 意图识别能力 | 提示词 + 模型分类 |
| 5 | 外部接口能力 | FastAPI封装后的HTTP请求测试 |

**测试外部接口（ask接口）的提示词**：
```python
system_prompt = """
你是一个严谨的客服。
必须依照参考资料的content字段进行检索回答。
一定要先检索工具，再返回结果。
可以轻度改写，但不能改变含义。
"""
```

**测试环境准备**：
```
目录结构：
├── request/     # 测试请求脚本
├── docs/        # 知识库文档
├── tests/       # 单元测试
├── db/          # 数据库文件夹
├── logs/        # 日志存放
```

---

## MVP App Implementation

MVP版本（V1）的核心App实现要点：

```python
@app.post("/chat")
async def chat(request: ChatRequest):
    start_time = time.time()
    
    # 通过session_id区分不同用户
    session_id = request.headers.get("X-Request-Id")
    
    # 调用LangGraph工作流
    result = await graph.ainvoke(...)
    
    # 意图分类路由
    if intent == "order":
        return order_result
    elif intent == "human":
        return handoff_result
    elif intent == "kb":
        return rag_result
    
    # 记录请求时间
    elapsed = time.time() - start_time
    logger.info(f"Request took {elapsed*1000:.0f}ms")
    
    return result
```

**健康检查接口**（`/health`）：
- 目的1：监控响应情况（最小/最大请求时间）
- 目的2：Docker容器健康检查复用
- 显示：当前使用的模型名称、向量数据库状态、订单数据库状态

---

## Routing Logic and Workflow Design

**串行路由 vs 并行路由**：

| 类型 | 适用场景 | 当前实现 |
|-----|---------|---------|
| 串行路由 | 用户意图单一、每次只走一条路径 | 是 |
| 并行路由 | 复合意图（如：退货+退款需同时走物流+财务） | 否（V2考虑） |

**关键词优先路由逻辑**：
```python
# 优先级：人工 > 订单 > 知识库
if "人工" in query:
    return "human"  # 最高优先级
elif "订单" in query or "支付" in query or "退款" in query:
    return "order"
elif "课程" in query or "收钱" in query or "新手" in query:
    return "kb"
else:
    return "direct"
```

**意图识别补充**：基于大模型分类，比关键词匹配更灵活但更慢。

**直接订单查询接口**（绕过大模型）：
```
GET /api/orders/{order_id}
```
- 直接返回JSON，不走自然语言处理
- 避免两次大模型调用的性能损耗
- 适合已知订单号的直接查询

**性能瓶颈分析**：
- 订单查询走两次大模型（意图识别 + 结果翻译成自然语言）→ 4秒以上
- 优化方法：工具返回结果时，直接在提示词中让模型一次完成翻译 → 减少一次模型调用，时间减半至约2秒

---

## Performance Monitoring with LangSmith

**配置LangSmith监控**：
```bash
# .env配置
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=edu_agent
LANGCHAIN_API_KEY=<your_key>
```

**LangSmith能看到的信息**：
- 每次请求的完整调用链
- 各节点的耗时（可视化）
- RAG检索的文档内容和切块大小
- 模型推理时间
- 整体性能瓶颈定位

**实测性能数据**：
- 转人工（无大模型）：< 500ms ✓
- RAG检索 + 回答：约2000-3000ms
- 订单查询（两次模型）：约4000ms

**使用SQLite的注意事项**：
- SQLite速度非常慢，仅用于开发/演示
- 生产环境推荐：向量数据库放GPU节点，关系数据库用PostgreSQL/MySQL

---

## Connections
- → [[090-project-requirements-prototype-1]]
- → [[092-core-interaction-capabilities-1]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释：为什么多层嵌套Agent场景下要从纯LangChain 1.0切换到LangGraph？LangChain 1.0的"一切皆工具"模式在这里具体造成了什么问题？
2. 本课用较弱的模型（Qwen Turbo）做开发测试，而不是直接用强模型，这背后的逻辑是什么？它如何帮助提升最终系统质量？
3. 订单查询接口的性能瓶颈是什么？课程提出的优化方案是怎么把4秒压缩到约2秒的？

<details>
<summary>答案指南</summary>

1. LangChain 1.0要求将子Agent封装成函数再封装成工具才能被父Agent调用，多层嵌套时需要层层封装，代码不优雅且维护成本极高。LangGraph是LangChain 1.0的底层实现，用节点+条件边表达路由逻辑，比层层工具封装更清晰，因此路由层（Root节点）改用LangGraph实现。

2. 弱模型参数量小、响应快，且"不够聪明"——提示词稍有模糊就会报错或输出错误分类，相当于在恶劣环境中强制检验提示词质量。开发阶段用弱模型把提示词打磨清晰后，交付时换成强模型（70B、DeepSeek等），强模型能对边界情况额外兜底，系统整体更健壮。

3. 瓶颈在于订单查询需要两次大模型调用：第一次意图识别，第二次将工具返回结果翻译成自然语言，合计约4秒。优化方案是：在工具调用的提示词中直接让模型一次性完成结果翻译，合并两次调用为一次，响应时间减半至约2秒。

</details>
