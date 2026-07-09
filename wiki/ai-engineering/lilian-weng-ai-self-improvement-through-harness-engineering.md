---
tags: [harness-engineering, recursive-self-improvement, ai-agents, context-engineering, agentic-workflows, lilian-weng]
source: https://mp.weixin.qq.com/s/srIrfqeCC9P9v6LmO8JY8A
---
# Lilian Weng: AI Self-Improvement Through Harness Engineering

Lilian Weng 的《Harness Engineering for Self-Improvement》把递归式自我提升（RSI）的近期路径从「模型直接改写权重」转向「模型周围的运行时系统先自我优化」。这里的 Harness 不是提示词模板，而是编排模型思考、工具调用、上下文管理、文件记忆、评估、权限和恢复的系统。文章沿着 ACE、MCE、Meta-Harness、ADAS、AFlow、STOP、Self-Harness、AlphaEvolve 和 DGM 梳理了一个趋势：越来越多的研究把上下文、工作流和 Harness 代码本身变成可搜索、可验证、可进化的对象。

## Key Concepts
- **[[harness-engineering]]**: 模型外部的运行时系统，负责工具、上下文、记忆、权限、评估和失败恢复；Claude Code 与 Codex 是文章中的关键现实信号。
- **[[recursive-self-improvement]]**: Good 1965 与 Yudkowsky 2008 的自我提升循环，在近期更可能表现为 Harness、训练流程或部署系统改进，而不只是模型权重自改写。
- **[[context-engineering]]**: ACE 把上下文变成带标识符的 playbook，MCE 把上下文管理机制本身抽象为可演化技能。
- **[[meta-harness]]**: 用一个 Harness 去优化另一个 Harness，搜索「哪些信息应被存储、检索并呈现给模型」的代码。
- **[[self-harness]]**: 用弱点挖掘、有边界提议、held-in/held-out 验证更新 Harness，避免把局部修复变成回归。
- **[[evolutionary-search]]**: AlphaEvolve、ShinkaEvolve、DGM 等方法用变异、选择、新颖性采样和元提示词演化搜索程序或 Harness 空间。

## Key Numbers
| Fact | Value |
|---|---|
| DGM on SWE-bench Verified | 20% -> 50% |
| DGM on Polyglot | 14.2% -> 30.7% |
| PaperBench | 20 篇 ICML 2024 Spotlight/Oral 论文，8316 条评分细则 |
| CORE-Bench | 90 篇论文，270 项任务 |
| RE-Bench | 7 个 ML 研究工程环境，每个最多 8 块 H100 |
| RE-Bench 人类对照 | 61 位专家，71 次 8 小时尝试；82% 非零分，24% 达到或超过强参考 |
| MLE-bench | 75 个 Kaggle 竞赛；o1-preview + AIDE 在 16.9% 达到至少铜牌 |
| KernelBench | 250 个 PyTorch GPU kernel 任务 |

## Key Takeaways
- Harness 自我提升的对象是「产生答案的机制」，包括工作流、文件记忆、权限、评估和恢复，而不是单次回答。
- 文件系统是长时程 agent 的关键记忆层；执行轨迹、失败日志和状态记录需要成为可恢复、可审计的持久产物。
- Self-Harness 的 held-in/held-out 验证是 agent 开发中的重要模式：修复反复弱点时，必须同时证明没有引入未知回归。
- 进化搜索在评估清晰的任务上最强，例如 GPU kernel、算法竞赛和 SWE-bench；开放式科学研究仍受弱评估、负面结果缺失和长期目标难度限制。
- 人类监督不会消失，而是上移到边界设计、评估设计、轨迹审计和长期价值判断。

## See Also
- [[harness-engineering]]
- [[context-engineering]]
- [[lilian-weng-be-cautious-about-scaling-law]]
- [[verification-horizon-coding-agent-rewards]]
- [[long-running-agent-harness]]
