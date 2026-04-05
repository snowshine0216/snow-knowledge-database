---
tags: [harness-engineering, prompt-engineering, context-engineering, agent, ai-engineering, openai, anthropic]
source: https://www.youtube.com/watch?v=3DlXq9nsQOE
---

# Talk Summary: 最近爆火的 Harness Engineering 到底是个啥？一期讲透！

## Speaker Info
- Name/Handle: 幻影老师 (code秘密花园)
- Event/Venue: YouTube — code秘密花园
- Date: 2026-04-02
- Duration: 18:30

## Key Points
- Harness Engineering 是 AI 工程领域继 Prompt Engineering、Context Engineering 之后的第三次重心迁移，解决的是"模型在真实执行中能不能持续做对"的问题
- 三者是包含关系而非替代关系：Prompt 是对指令的工程化，Context 是对输入环境的工程化，Harness 是对整个运行系统的工程化
- LangChain 的定义：Agent = Model + Harness，即 Agent 系统里除模型本身以外所有决定能否稳定交付的部分都算 Harness
- 一个成熟的 Harness 分为六层：上下文管理、工具系统、执行编排、记忆与状态、评估与观测、约束校验与失败恢复
- 作者亲身案例：同样的模型和提示词，仅通过改造任务拆解、状态管理、关键步骤校验和失败恢复机制，Agent 成功率从不到 70% 提升至 95% 以上
- Anthropic 实践：针对"上下文焦虑"问题采用 context refit（换一个干净的新 Agent 接力），而非仅压缩上下文；生产与验收分离（Planner → Generator → Evaluator 三角色分工）
- OpenAI 实践：工程师角色从写代码变为设计环境（拆解任务、补充缺失能力、建立反馈链路）；采用渐进式披露（Agent 字典从巨型文件改为目录页 + 子文档按需加载）；Agent 不仅写代码还自己验证（接浏览器截图 + 日志监控 + 独立隔离环境）
- Agent Skills 本质上是 Context Engineering 的高级实践——渐进式披露，按需、分层、在正确时机给模型信息
- AI 落地的核心挑战正在从"让模型看起来更聪明"转向"让模型在真实世界里稳定工作"

## Timeline
| Timestamp | Topic |
|---|---|
| 0:00 | 引入：为什么同样的模型，别人的 Agent 成功率高而自己的不行？ |
| 1:30 | 个人案例：不改模型不改提示词，仅改 Harness 成功率从 70% → 95% |
| 3:00 | 三次重心迁移：Prompt Engineering → Context Engineering → Harness Engineering |
| 3:30 | Prompt Engineering 阶段：本质是塑造局部概率空间，擅长澄清任务但不擅长填补知识 |
| 5:30 | Context Engineering 阶段：模型必须在合适时机拿到正确信息，RAG 是典型实践 |
| 7:30 | Agent Skills 与渐进式披露：不是一次性全给，而是按需暴露 |
| 8:30 | Harness Engineering 阶段：当模型连续行动时，谁来监督、约束和纠偏？ |
| 9:00 | 通俗类比：新人客户拜访——Prompt 是话术、Context 是资料、Harness 是 Checklist + 实时汇报 + 验收机制 |
| 10:00 | Harness 六层架构详解 |
| 10:10 | 第一层：上下文管理（角色定义、信息裁剪、结构化组织） |
| 10:50 | 第二层：工具系统（给什么工具、何时调用、结果如何回喂） |
| 11:20 | 第三层：执行编排（理解目标 → 补信息 → 分析 → 生成 → 检查 → 修正） |
| 11:50 | 第四层：记忆与状态（任务状态 / 中间结果 / 长期记忆三类分离） |
| 12:10 | 第五层：评估与观测（输出验收、自动测试、日志指标、错误归因） |
| 12:40 | 第六层：约束校验与失败恢复（约束 + 校验 + 重试回滚） |
| 13:00 | 真实案例：浪潮仅改 Harness 排名从 30+ 杀入前 5 |
| 13:20 | Anthropic 实践：context refit 与 Planner-Generator-Evaluator 分离 |
| 15:00 | OpenAI 实践：工程师变为环境设计者、渐进式披露、Agent 自验证 |
| 17:00 | 总结：三者的关系与适用场景 |

## Takeaways
- 当 Agent 出了问题，修复方案几乎从来不是"让它更努力"，而是确定它缺了什么结构性能力——这是 Harness 思维的核心
- 上下文窗口是稀缺资源，信息不是越多越好：采用渐进式披露策略，按需、分层、在正确时机提供信息
- 生产与验收必须分离：干活的 Agent 和评估的 Agent 应该是独立的角色，避免自评偏乐观
- 对于长程任务的上下文焦虑问题，可以考虑 context refit（启动干净新 Agent 接力）而非仅压缩上下文
- 成熟 Harness 的六层架构（上下文 → 工具 → 编排 → 状态 → 评估 → 恢复）是构建可靠 Agent 系统的参考框架
- 把高级工程师的经验编码为系统规则并返回给 Agent，形成可持续运行的自动治理系统

## Source Notes
- Transcript source: `asr-openai` (OpenRouter: openai/gpt-audio-mini, chunked)
- Cookie-auth retry: used
- Data gaps: 无章节标记（chapters: null），时间线为根据内容推断的近似值
