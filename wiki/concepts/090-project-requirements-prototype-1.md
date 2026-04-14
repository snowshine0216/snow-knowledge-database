---
tags: [ai-engineering, product-requirements, prototype, rag, tool-calling, fastapi, customer-service]
source: https://u.geekbang.org/lesson/818?article=930871
---

# Project Requirements and Prototype Design: Part 1

This lecture covers the detailed requirements analysis and prototype design for the AI customer service system. It walks through how to identify the two core technical pillars (RAG + Tool Calling), define non-functional requirements, and plan iterative versions from MVP to platform.

## Key Concepts

- **核心需求归纳**: 智能客服的所有功能最终归结为两类：RAG（知识库检索回答）和工具调用（订单查询等数据库操作）
- **意图分类路由**: 用户请求通过意图识别分发到RAG检索、工具调用或直接回答三条路径
- **非功能性需求**: 响应时间（P95首字符<500ms）、并发能力、准确率（≥92%）、工具调用成功率（100%）、敏感信息拦截（100%）
- **验收标准设计**: 验收标准比内部目标稍宽松（如内部500ms，验收800ms），因验收往往是一次性的
- **准确率的现实**: AI客服准确率大多"拍脑袋"定，因无法穷举所有用户可能的问题，知识盲区用人工兜底
- **版本迭代规划**: V1 MVP→V2单用户增强→V3多租户平台化

## Key Takeaways

- 客服AI的两个核心能力：RAG（课程咨询）+ Tool Calling（订单查询），其余都是这两者的组合和扩展
- 与甲方当面沟通痛点，不能完全依赖文档——甲方文档不一定准确
- 快速原型（Dify/Coze）先与客户对齐能力范围，再开始正式开发，避免中途方向偏差
- 非功能性需求的P95响应时间指的是"首字符出现时间"，不是完整回答时间
- 性能瓶颈主要在大模型推理和向量数据库，可通过GPU加速向量检索改善
- 先跑通课程咨询这一条完整线，再补充订单查询，逐步扩展

## See Also

- [[089-project-background]]
- [[091-project-requirements-prototype-2]]
- [[rag-architecture]]
- [[intent-recognition-pipeline]]
