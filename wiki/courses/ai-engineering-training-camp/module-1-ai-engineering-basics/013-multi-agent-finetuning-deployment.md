---
tags: [multi-agent, autogen, langchain, fine-tuning, lora, rag, deployment, security, production, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927430
---

# 多 Agent 协作、LoRA 微调与生产部署

本文覆盖 AI 工程化的三个进阶主题：多 Agent 协作模式（Group Chat 与 Debate）、微调选型决策（RAG vs. LoRA）、以及生产级部署架构（安全防护、向量数据库选型、全链路追踪）。

## Key Concepts

- **多 Agent 拆分原则**：单个 Agent 功能交织时拆分，但不要过度——类比微服务，拆多了维护成本指数增长。核心动因是数据库权限隔离，典型架构：Plan Agent → 专职 Agent × N → Summary Agent。
- **Group Chat（群体协商）**：多 Agent 轮流发言，分阶段推进（陈述→举证→决策）。不要把大任务一次丢给 Group Chat，先按阶段拆分，每阶段内再轮流。适合开放性协商问题（纠纷判责、方案设计）。
- **Debate（对抗辩论）**：正方/反方 Agent 逻辑交锋，输出置信度分值，高分自动处理、中分人工复核、低分跳过。适合高质量判断（商标侵权、法律分析）。
- **LangChain vs. AutoGen**：LangChain = 单 Agent 工具箱（RAG/Memory/Tools）；AutoGen = 多 Agent 协调器（Group Chat/Debate/通信机制）。配合使用：AutoGen 管框架，LangChain 实现每个 Agent。
- **微调真正目的**：定制输出风格（固定格式/去掉多余标记）和专业表达方式（像医生/律师说话）。学习新知识是 RAG 的职责，不是微调的；知识频繁更新、大量非结构化文档、需要溯源时选 RAG。
- **LoRA 原理**：冻结原始权重 W（D×D），只训练两个小矩阵 A（R×D）和 B（D×R），还原出增量 ΔW。可插拔（加上/拿掉），满意后合并。是工业级微调首选：训练快、效果好。
- **向量数据库选型**：优先用 PostgreSQL+pgvector、Redis 等成熟系统，而非 Milvus/FAISS 等专用 DB——遇到缓存雪崩等问题时成熟系统有解。
- **三层防注入**：输入层（正则+语义分析）→ 上下文隔离（System Prompt 不可被覆盖）→ 输出层（关键字+规则引擎+小模型语义验证）。

## Key Takeaways

- Group Chat 和 Debate 来自组织学和辩论学，不需要自己发明，直接借用成熟设计
- RAG 白盒、可溯源是生产环境的核心优势；微调失败难以回退，非必要不上
- LoRA 是工业级微调的事实标准，其他方法了解即可
- 全链路追踪（LangSmith）是 MTTR 优化的核心工具，生产必备
- Agent 必须设 `max_turns` 防死循环，超出后降级到规则引擎

## See Also

- [[012-prompt-engineering-and-agent-design]]
- [[008-langchain-core-components]]
- [[011-llamaindex-and-rag-systems]]
