---
tags: [harness, agent, ai-engineering, context-engineering, evals, tool-design, llm-products]
source: https://mp.weixin.qq.com/s/x68qt7DJnEIvRD2bycHk4w
---
# Harness 思维七要点（周枫）

网易有道 CEO 周枫提出"Harness 即产品"：Agent = Model + Harness，复杂 Agent 中模型也许只完成 20% 的工作，让产品持续可靠运行的 80% 是模型之外的整层工程——上下文管理、工具、记忆、持久化状态、评测、循环控制、可观测性与权限治理。团队真正在设计和迭代的产品不是一个个功能，而是这层 Harness 本身："模型是可更换的引擎，Harness 才是你自己造的车"。

## Key Concepts

- **面向下一代模型设计**：不围着模型今天的能力打磨，赌半年后的能力。Claude Code 团队刻意放弃 type-ahead、直接押注 Agent 写全部代码，2025 年 5 月 Opus 4 发布时兑现；Boris Cherny 的两条原则——"别试图把模型框死"、"押注更通用的模型"。
- **高智能场景筛选**：优先选"资深员工才能处理的复杂任务切片"——单次任务价值最高、判断最复杂、人工成本最贵的场景，而非流量最大的场景。规则+搜索+模板能解决的问题不值得大模型产品化。
- **舍得花 token 但可核算**：单个 Agent 任务累计输入 token 数十万～数百万属正常；Harness 要让花费经济上可核算（类比增长团队的 ROI 量化），杠杆是提示词缓存、强/小模型分层路由、批处理与上下文重置。
- **上下文工程是心脏**：至少拆六层（系统规则/当前任务/检索知识/用户历史/长期偏好/工具结果），各层不同优先级、生命周期与压缩方式；目标是 Anthropic 说的"最大化达成目标的最小高信号 token 集"。见 [[context-engineering]]。
- **工具是给模型看的产品界面**：工具是"模型可消费的能力单元"——超过约 20 个工具模型易在相似工具间选错（如混淆"订单查询"与"物流查询"）；用单一职责+强 schema 小工具替代瑞士军刀式工具，参数先校验、错误直接回吐给模型修正。
- **评测驱动开发**：至少四层量化评测（最终答案质量、工具调用正确率、流程完成率、安全样本通过率）+ 边界/对抗样本 + 线上日志回灌，替代"打地鼠式"手工调优；参考 Anthropic《Demystifying Evals for AI Agents》。
- **默认单 Agent**：Cognition《Don't Build Multi-Agents》主张"写"类强一致性任务（写代码）不拆；Anthropic 实证"读"类研究任务上 orchestrator-worker 多智能体比单 Claude Opus 4 高 90.2%，但 token 消耗约 15 倍——按任务偏读/写、上下文能否共享决定是否拆分。

## Key Takeaways

- 更强的模型不会自动变成更可靠的 Agent 服务，从 demo 到产品的鸿沟始终靠 Harness 填。
- 七要点是同一工程的七个侧面：超前定位定方向、高智能场景定取舍、token 求价值、上下文是心脏、工具是手、评测是免疫系统、循环编排是骨架。
- token 优化省的是无谓浪费，高价值环节应放开手脚花——一上来最小化 token 是设错了优化目标。
- 多 Agent 争论的可操作分界线：任务偏"读"（可拆、并行收益大）还是偏"写"（需强一致性，默认单 Agent）。

## See Also

- [[harness-engineering]]
- [[context-engineering]]
- [[context-compaction]]
- [[models-will-devour-the-harness-logan-kilpatrick]]
- [[verification-horizon-coding-agent-rewards]]
