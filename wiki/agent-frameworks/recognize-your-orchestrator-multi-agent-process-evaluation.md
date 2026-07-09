---
tags: [multi-agent-systems, orchestrator, agent-evaluation, entropy-dynamics, icml-2026]
source: https://mp.weixin.qq.com/s/WHee91G1ko4FFJ9_pFp1jA
---
# Recognize Your Orchestrator: Multi-Agent 过程评估

这篇文章介绍南京大学 NLP 实验室的 ICML 2026 论文 *Recognize Your Orchestrator: An Entropy Dynamics Perspective for LLM Multi-Agent Systems*。它把 [[multi-agent-systems]] 的关键风险从“某个 Executor 是否足够强”转向“[[orchestrator]] 是否能在长链路、多工具、高噪声上下文中持续稳定调度”。文章的核心贡献有两个：一是用 [[entropy-dynamics]] 描述 Orchestrator 的调度不确定性如何演化，二是用 Inverse Workflow Generation（IWG）构造带中间检查点的可验证任务环境，从而把只看最终答案的评估推进到过程级评估。

## Key Concepts
- **[[orchestrator]]**: 多智能体系统里的全局调度者，负责理解用户目标、拆解任务、选择 Executor、读取反馈并决定下一步；文章列出的失败包括派错 Agent、误读 Executor 输出、重复循环、提前终止和异常后无法恢复。
- **[[executor-agent]]**: 执行具体任务的 Agent，例如搜索、代码、视觉、总结或检查模块；论文的判断是，系统失败往往不是 Executor 完全不可用，而是 Orchestrator 没有把 Executor 用对。
- **[[orchestrator-executor-architecture]]**: 文章讨论的主流多智能体结构，Orchestrator 像项目经理，多个 Executor 像执行专家；当工具、日志和异常反馈累积后，调度者的信息压力成为系统瓶颈。
- **[[scheduling-entropy]]**: Orchestrator “下一步应该调用谁”的选择分布；选择集中代表调度更确定，选择分散代表在多个方向之间摇摆。
- **[[mean-field-entropy-dynamics]]**: 论文提出的分析框架，用“任务推进的聚焦力”和“上下文累积的扩散力”解释调度熵是收敛还是失稳。
- **[[inverse-workflow-generation]]**: 从目标答案反向构造可执行、可验证交互环境的方法；它不替模型生成轨迹，而是让被测 Orchestrator 在带检查点的环境中自行决策。
- **[[reasoning-trap]]**: 重推理模型在调度任务中可能被自己的长思考链占用注意力预算，反而稀释用户目标、系统约束、Executor 反馈和异常信息等外部信号。
- **[[orchestrator-level-evaluation]]**: 区分于最终完成率的过程指标层，关注每一步是否成功、是否忠实使用 Executor 输出、能否处理异常，以及轨迹是否一致；文章点名 Step-SR 和 Consistency。

## Key Numbers

| Number / Label | Meaning |
|---|---|
| ICML 2026 | 文章介绍的论文会议场景 |
| `arXiv:2606.01351` | 文章给出的论文编号 |
| `NJUNLP/orchestrator_entropy` | 文章给出的项目 / 代码名 |
| 4 systems | Deep Research、Agent Coder、GUI Browser、Agentic RAG 的失败归因分析 |
| 3 IWG components | Scout Agent、Wrapper Agent、Validation Committee |
| 7 Executor Agent | 论文实验中的多智能体系统规模 |
| 2 metric levels | System-Level 与 Orchestrator-Level |
| 2 entropy forces | 任务推进的聚焦力与上下文累积的扩散力 |

## Key Takeaways
- 对 [[agent-evaluation]] 来说，只看最终答案会掩盖中间过程的真实故障；文章强调需要检查哪一步派错任务、读错反馈，或引发连锁偏差。
- 对 [[long-running-agent-harness]] 和 [[agent-frameworks]] 来说，更强 Executor、更多工具、更长上下文不一定提高系统上限；Orchestrator 能否过滤噪声并稳定调度，才决定复杂任务是否能持续推进。
- IWG 的价值在于先提供可验证环境和中间检查点，再让被测模型自然生成调度轨迹，因此可以观察偏离、震荡或坍缩何时发生。
- Reasoning Trap 提醒调度任务不能照搬封闭式推理任务的“想得越久越好”假设；在多 Agent 环境里，过长内部推理链可能挤占读取外部反馈的空间。
- System-Level 与 Orchestrator-Level 可能不同步：有的模型工作流结构接近参考路径但最终不稳，也有模型最终成功率不最高却在 Step-SR、Consistency 等过程指标上更稳定。

## See Also
- [[long-running-agent-harness]]
- [[openclaw-architecture]]
- [[harness-engineering]]
- [[agentic-rag]]
