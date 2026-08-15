---
tags: [claude-code, boris-cherny, harness, claude-md, skills, hooks, model-elicitation]
source: https://mp.weixin.qq.com/s/MEUMv2mJGNcS-rGl48f5FA
---

# Claude Code之父：每半年清空一次 CLAUDE.md、Skills 和 Hooks

InfoQ 对 Boris Cherny 播客的译文提出一个模型升级期的工作方法：不要把 `CLAUDE.md`、Skills、Hooks、系统提示词和 Harness 当作永久资产，而是先删除、让新模型在真实任务中运行，再根据反复出现的失败逐项加回。文中称 Claude Code 团队在 Opus 5 发布后删除超过 **80%** 的系统提示词；核心并非追求“无提示词”，而是用消融实验保留仍有因果价值的最小约束。

## Key Concepts
- **消融式配置迁移**：每代模型先清空系统提示词，再逐行恢复，观察每项对任务表现的影响；这把提示词从积累物变成可验证假设。
- **经验驱动的 Harness**：只在真实代码库中观察到同一种失败反复发生时，才补充一条指令、一个 Skill 或一个 MCP；避免预先规定所有步骤。
- **验证环境优先**：Electron→Swift 实验不是靠复杂提示词，而是把 macOS Runner、双版本运行、截图、逐像素比较和进度记录连成反馈闭环。
- **评测也会过期**：访谈称评测通常只能跨 **1–3 代模型**；模型做满后，须按新的困难和真实失败重新设计。可对照 [[claude-merges-80-percent-code-close-the-loop]]。
- **模型能力缺口**：模型已有能力却没有产品释放为 product overhang；产品设计错误地限制能力为 hobbling。Claude Code 早期给予代码写入和终端权限，是原文用来说明这对概念的例子。
- **两类智能体编排**：Dynamic Workflows 面向阶段化复杂任务，可按批次启动验证/总结智能体；Loops/Routines 面向死代码扫描、测试补全等重复维护动作，文中称每日约 **20–30** 个例程。

## Key Numbers
| 指标 | 文中表述 |
|---|---|
| 系统提示词删除比例 | 超过 80% |
| Bun Zig→Rust 重写 | 11 天、超过 10 万行代码 |
| Electron→Swift 实验 | 约 14–15 天，尚未结束 |
| 评测寿命 | 约 1–3 代模型 |
| 清理实验开关的阈值 | 覆盖 100% 用户 |

## Key Takeaways
- 每次升级模型后，先减再加；长期指令应由可复现失败而不是习惯证明。
- 给模型的任务应明确目标、约束和退出标准，同时提供测试、截图或真实环境操作等验证路径。
- 不要把“编程已解决”外推到所有领域：文中仍把分布式系统、深层系统代码与像素级 UI 验证列为困难边界。
- 自动维护先从低风险、可验证、可审查的例程起步；更多智能体不自动等于更可信交付。

## See Also
- [[claude-code-founder-programming-solved-harness-decline]]
- [[claude-merges-80-percent-code-close-the-loop]]
- [[bun-rewrite-zig-to-rust-with-claude-code]]
- [[claude-code-best-practice]]
