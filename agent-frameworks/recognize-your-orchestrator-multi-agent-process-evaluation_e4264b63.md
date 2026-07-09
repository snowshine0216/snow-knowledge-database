---
tags: [multi-agent-systems, orchestrator, agent-evaluation, entropy-dynamics, icml-2026]
source: https://mp.weixin.qq.com/s/WHee91G1ko4FFJ9_pFp1jA
wiki: wiki/agent-frameworks/recognize-your-orchestrator-multi-agent-process-evaluation.md
---

# ICML 2026: 如何对 Multi-Agent 系统进行过程评估？重新认识多智能体系统中的 Orchestrator

## Article Info
- URL: https://mp.weixin.qq.com/s/WHee91G1ko4FFJ9_pFp1jA
- Title: ICML 2026｜如何对Multi-Agent系统进行过程评估？重新认识多智能体系统中的Orchestrator
- Author: Junze Zhu, Weihao Chen, Xuanwang Zhang, Zhen Wu, Xinyu Dai; article account: 机器之心
- Publish time: 2026-07-06
- Access mode: `public`

## Executive Summary
这篇文章介绍南京大学 NLP 实验室的 ICML 2026 论文 *Recognize Your Orchestrator: An Entropy Dynamics Perspective for LLM Multi-Agent Systems*，核心观点是：多智能体系统失败往往不是单个 Executor 不会做事，而是 Orchestrator 在长链路、多工具、高噪声上下文中逐渐失去调度控制。论文用 Mean-Field Entropy Dynamics 描述 Orchestrator 的不确定性如何随任务推进和上下文累积而变化，并提出 Inverse Workflow Generation（IWG）来构造带中间检查点的可验证任务环境。文章最有价值的提醒是：强模型、长推理链、更多工具并不自动带来更稳的多智能体协作；真正需要评估的是调度过程本身，包括每一步选择、反馈读取、异常恢复和轨迹一致性。

## Outline
1. **文章开场与论文信息** — 介绍论文标题、作者、机构、会议、arXiv 编号和项目代码，并提出多智能体系统是否真正会协作的问题。
2. **多智能体系统的瓶颈：Orchestrator 的脆弱性** — 将失败归因从单个 Executor 能力转向 Orchestrator 的全局调度稳定性。
3. **用“调度熵”观察系统如何失序** — 用调度分布的不确定性刻画 Orchestrator 在任务推进和上下文扩散之间的动态变化。
4. **IWG：让过程变得可检查** — 说明传统 benchmark 只看最终答案的局限，并介绍从目标答案反向构造可验证工作流环境的方法。
5. **模型强，不等于会做 Orchestrator** — 通过 7 个 Executor Agent 的系统实验区分 System-Level 与 Orchestrator-Level 指标。
6. **Reasoning Trap：想得越多，不一定调度越稳** — 解释为什么过长推理链可能挤占对外部反馈的注意力预算，导致调度效率和步骤成功率下降。
7. **写在最后** — 总结未来多智能体系统的关键问题是识别、度量并约束负责全局调度的 Orchestrator。

## Section Summaries

### 1. 文章开场与论文信息
文章先给出作者背景：南京大学人工智能学院博士生朱俊泽为第一作者，助理教授吴震为通讯作者，戴新宇教授为合作者。文章讨论的论文是 *Recognize Your Orchestrator: An Entropy Dynamics Perspective for LLM Multi-Agent Systems*，会议为 ICML 2026，论文编号为 `arXiv:2606.01351`，项目 / 代码名为 `NJUNLP/orchestrator_entropy`。

作者把当下多智能体系统描述为一支分工协作的 AI 团队：有的 Agent 找资料，有的编程，有的调用工具，有的检查结果。问题在于，系统架构和执行日志越来越复杂后，表面上的分工并不等于真正稳定协作；这引出文章的主问题：多智能体系统真正的瓶颈是否在负责指挥所有 Agent 的 Orchestrator。

### 2. 多智能体系统的瓶颈：Orchestrator 的脆弱性
文章将 Orchestrator 类比为项目经理：它需要理解用户目标、拆解任务、选择合适的 Executor、读取反馈，并决定下一步动作。Executor Agent 执行具体任务，Orchestrator 负责让这些具体能力组合成可完成任务的工作流。

当任务链路变长，工具调用、历史日志、异常反馈和中间结论都会进入上下文，Orchestrator 面临的信息压力迅速上升。文章列举的失败形态包括：派错 Agent、误读 Executor 输出、陷入重复循环、提前终止任务、遇到错误反馈后无法恢复。这里的失败不是“某个工具完全不可用”，而是“调度者没有把工具用对”。

论文对 Deep Research、Agent Coder、GUI Browser 和 Agentic RAG 四类典型多智能体系统做失败归因分析，结论是 Orchestrator 在四类场景中都承担主要失败责任。因此，评估重点应该从“单个 Agent 是否足够强”转向“调度过程是否稳定”。

### 3. 用“调度熵”观察系统如何失序
文章把 Orchestrator 每一步的核心决策抽象成一个问题：下一步应该调用谁？如果 Orchestrator 很确定，选择会集中在少数合适 Agent 上；如果它不确定，选择会在多个方向之间摇摆。这个调度分布的分散程度就是论文关注的“调度熵”。

文章用两股力量解释调度熵的变化：

- **任务推进带来的聚焦力**：随着任务逐渐被解决，系统应该越来越清楚下一步做什么，不确定性下降，调度行为更稳定。
- **上下文累积带来的扩散力**：每轮工具调用、历史日志、异常反馈和中间结论都会进入上下文，信息越堆越多，噪声也增加，调度者可能被历史信息淹没。

论文提出的 Mean-Field Entropy Dynamics 框架用熵动力学刻画这两股力量：任务解决带来“聚焦”，上下文累积带来“扩散”，两者共同决定系统逐步收敛还是走向失稳。这个视角不只看最终答案，而是观察多智能体系统内部的不确定性如何随时间演化。

### 4. IWG：让过程变得可检查
传统 benchmark 往往只给初始问题和最终答案。对多智能体系统来说，这相当于只知道项目最后是否成功，却不知道中间哪一步派错任务、读错反馈，或哪个节点引发后续连锁偏差。

为了解决高质量智能体工作流轨迹缺少检查锚点的问题，论文提出 Inverse Workflow Generation（IWG）。IWG 的核心不是从问题正向采集轨迹，而是从目标答案出发，反向构造一个可执行、可验证的交互环境。文章列出 IWG 的三个组件：

- **Scout Agent**：从最终答案倒推必要的中间任务，形成能力感知的任务标记。
- **Wrapper Agent**：把抽象任务落地为具体环境状态和工具反馈，同时避免直接泄露答案。
- **Validation Committee**：通过多层验证确保任务可解、路径一致、事实可靠。

IWG 不生成 Orchestrator 的执行轨迹；它构造的是带中间检查点的任务环境。真正的调度轨迹仍由被测模型在该环境中自行生成。这样研究者就可以观察 Orchestrator 每一步如何决策，以及它何时开始偏离、震荡或坍缩。

### 5. 模型强，不等于会做 Orchestrator
论文搭建了一个包含 7 个 Executor Agent 的多智能体系统，让不同大模型担任 Orchestrator，负责任务分解、执行器选择、反馈读取和异常处理。文章强调，论文没有把实验简化成模型排行榜，而是同时看两个层面：

- **System-Level**：整个系统最终是否完成任务。
- **Orchestrator-Level**：调度者每一步是否成功，是否忠实利用执行器输出，能否处理异常，以及整体轨迹是否保持一致。

实验显示，System-Level 与 Orchestrator-Level 并不总是同步。有些模型生成的工作流结构接近参考路径，但最终任务完成并不稳定；也有些模型最终成功率未必最高，却在 Step-SR、Consistency 等过程指标上更稳。这说明 Orchestrator 能力不能等同于单轮推理能力，也不能只用最终答案衡量。

从熵动力学角度看，不同模型有不同调度风格。有些模型初始探索幅度大、路径切换频繁，能够快速展开候选方案，但更容易在后续步骤中失去稳定性；另一些模型调度更稳、熵增长更慢，更适合在长程任务中维持一致性。

### 6. Reasoning Trap：想得越多，不一定调度越稳
文章认为最反直觉的发现之一是：重推理模型在多智能体调度场景中未必更占优势。封闭式推理任务里，更长思考链通常意味着更充分推理；但 Orchestrator 每一步都需要读取用户目标、系统约束、历史执行日志、多个 Executor 反馈和异常信息。

如果模型在这些外部信号之外继续生成大量内部思考，有限的注意力预算可能被自我生成内容挤占，导致外部关键信号被稀释。论文称这种现象为 Reasoning Trap：模型不是不会推理，而是被自己的推理链压缩了观察外部环境的空间。

文章称，论文比较不同推理深度设置后发现，抑制过度思考反而让模型在调度效率和步骤成功率上更稳。适合做 Orchestrator 的模型，不一定是“想得最长”的模型，而是能在复杂上下文中快速过滤噪声、理解反馈，并稳定决定下一步行动的模型。

### 7. 写在最后
文章收束到一个系统设计判断：多智能体系统的能力上限不只取决于 Executor 是否强大，也取决于 Orchestrator 是否能在长链路、多工具、高噪声上下文中保持稳定。

Mean-Field Entropy Dynamics 为分析 Orchestrator 提供了可解释的动力学视角，IWG 为过程级评估提供了可验证数据基础。随着 Agent 系统进入更复杂任务环境，单纯堆更多工具、更长上下文或更强执行器可能不够；更关键的问题是能否识别、度量并约束真正负责全局调度的 Orchestrator。

## Key Numbers

| Number / Label | Meaning |
|---|---|
| ICML 2026 | 文章介绍的论文投稿 / 会议场景 |
| `arXiv:2606.01351` | 论文编号 |
| `NJUNLP/orchestrator_entropy` | 文章给出的项目 / 代码名 |
| 4 systems | 失败归因覆盖 Deep Research、Agent Coder、GUI Browser、Agentic RAG |
| 3 IWG components | Scout Agent、Wrapper Agent、Validation Committee |
| 7 Executor Agent | 实验搭建的多智能体系统规模 |
| 2 metric levels | System-Level 与 Orchestrator-Level |
| 2 entropy forces | 任务推进的聚焦力与上下文累积的扩散力 |

## Key Takeaways
- 多智能体系统失败常常不是 Executor 完全失效，而是 Orchestrator 派错 Agent、误读 Executor 输出、陷入循环或在异常反馈后无法恢复。
- 论文把 Deep Research、Agent Coder、GUI Browser、Agentic RAG 四类系统的主要失败责任都归到 Orchestrator，从而把评估焦点从“工具是否强”转向“调度是否稳”。
- “调度熵”把 Orchestrator 的下一步选择建模为分布：选择越集中，不确定性越低；选择越分散，说明调度者更摇摆。
- Mean-Field Entropy Dynamics 用“任务推进的聚焦力”和“上下文累积的扩散力”解释系统如何从收敛走向失稳。
- IWG 从目标答案反向构造可执行、可验证的环境，并用 Scout Agent、Wrapper Agent、Validation Committee 提供中间检查锚点。
- IWG 不替模型生成执行轨迹；被测 Orchestrator 仍必须自己在环境中决策，因此研究者能检查偏离、震荡和坍缩发生在哪一步。
- 7 个 Executor Agent 的实验把最终完成情况和过程级调度指标分开看，说明 System-Level 成功率不能替代 Step-SR、Consistency 等 Orchestrator-Level 指标。
- Reasoning Trap 指出，过长内部推理链可能挤占模型读取外部反馈的注意力预算；降低推理深度后，调度效率和步骤成功率反而更稳。

## Insights
- 对 Agent 产品评测来说，只看最终答案会掩盖真正的系统风险；应保存并评分每一步的执行器选择、反馈读取、异常恢复和轨迹一致性。
- 对 Orchestrator 设计来说，“更长上下文”是双刃剑：历史日志帮助恢复状态，但也会增加扩散力，使模型在多个可能动作之间摇摆。
- 对模型选型来说，适合单轮推理的强模型未必适合做多智能体调度中枢；需要单独评估它在长链路、多工具、高噪声环境中的稳定性。
- 对 prompt / runtime 策略来说，盲目鼓励“想得更久”可能恶化调度，因为 Reasoning Trap 的机制是内部思考压缩了外部信号的注意力空间。
- 对 benchmark 构造来说，IWG 的价值在于先构造可验证环境和中间检查点，再让被测模型自然生成轨迹，这比只采集最终答案更适合诊断多智能体系统。

## Caveats
- 这篇笔记基于 WeChat 正文文本；文章中的图 1、图 3、图 4、图 6 只提取到图注，没有提取到图表里的具体数值。
- 原文是对论文的介绍性文章，不是论文全文；实验细节、完整指标定义和具体数值需要阅读 `arXiv:2606.01351` 或项目 `NJUNLP/orchestrator_entropy`。
- 文章称论文为 ICML 2026 论文；本笔记保留原文表述，没有额外验证会议接收状态。

## Sources
- https://mp.weixin.qq.com/s/WHee91G1ko4FFJ9_pFp1jA
- Paper named in article: *Recognize Your Orchestrator: An Entropy Dynamics Perspective for LLM Multi-Agent Systems*
- Paper identifier named in article: `arXiv:2606.01351`
- Project / code named in article: `NJUNLP/orchestrator_entropy`
