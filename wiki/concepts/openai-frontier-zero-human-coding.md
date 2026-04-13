---
tags: [harness-engineering, openai, codex, agent, ai-engineering, symphony, agent-native-development]
source: https://mp.weixin.qq.com/s/M46-Tw5l_jhZ8sncf_Triw
---

# OpenAI Frontier: Zero-Human-Coding Practice

OpenAI 的 Frontier Product Exploration 团队由 Ryan Lopopolo 领导，把 [[harness-engineering]] 推到了"AI 极致主义"的实践极限：一个 100 万+ 行代码的 Electron 应用，**没有一行代码人工手写**，**代码合并前没有人工 review**。这是把"agent 是队友而非副驾驶"这一假设贯彻到组织、工作流和代码库设计的真实样本。

## Key Concepts

- **Zero-human-coding constraint**：Ryan 给自己设的硬约束是不写一行代码。如果未来要部署的企业 agent 真的能完成他的工作，那它现在就必须能完成。约束反过来逼出方法论。
- **Bottleneck is human attention, not tokens**：模型可以并行化，token 在 OpenAI 内部没有速率限制；真正稀缺的是必须实时在线的人类注意力。所以 review 移到合并之后、用抽样反推团队卡点。
- **One-minute inner loop**：构建时间死守一分钟以内，超过就重新拆解构建图谱。一路从 Makefile → Bazel → Turbo → Nx，哪个快用哪个。Token 便宜让"持续修剪系统"成为常态。
- **Code is throwaway**：Symphony 的"Rework"状态会清空工作树和 PR 推倒重来。重要的不是"agent 怎么写出这段"，而是"为什么写出垃圾，缺哪条 guardrail"。
- **Skills before the concept existed**：~100 行总目录 + 6 个左右的小 skill 文件（`core_beliefs.md`、`tech_tracker.md`、`quality_score.md`、`spec.md`、`agent.md`、`$land`）。新需求**优先编码进现有 skill**，而不是新造。
- **On-policy harness**：所有护栏都做成 Codex 已经在输出的形式（即代码），不在外面包额外 Rust 脚手架。类比 RL on-policy，不给模型进化带来摩擦。
- **Symphony / Ghost Library**：Elixir 实现（模型自己选的，因为 GenServer 适合任务编排）。Spec 分发模型 — 把仓库脚手架抽出 → Codex 草拟 Spec → tmux 团队的离线 Codex 实现 → 另一组 Codex 对照上游审查、修正 Spec → 反复迭代。
- **Software written for models**：调低对"传统人类可读性"的追求，换取智能体可读性。5 人团队 / 500 个 NPM 包的"过度设计"是合理的，因为每人实际带 10–50 个 agent，必须切开空间。
- **Reverse the setup**：入口是 Codex，不是先搭环境再放 agent。先拉起 coding agent，再通过 skills/scripts 让它自行决定是否启动可观测栈。
- **Agent's right to refuse**：必须给 agent 拒绝/反驳 reviewer 的权力，否则它会陷入死脑筋的惯性。
- **Skill distillation**：团队的 Codex 会话日志统一进 blob storage，每天跑 agent 分析"团队还能在哪里做得更好"，写回仓库 — 每个人免费吃到他人的经验。
- **Dependency vendoring**：几千行的依赖一个下午就内部化，剥掉无关部分，Codex Security 低摩擦审查。代码产出成本归零时，"依赖内部化"门槛极低。

## Key Takeaways

- 当 agent 失败时，问题几乎从来不在提示词；要问的是缺哪种能力、哪类上下文、哪层结构。
- "代码就是上下文，代码就是提示词" — 让代码、流程、目录结构、语言、模式都统一，才能产生 agent 杠杆。
- 软件开发的瓶颈正在从"模型多聪明"转移到"系统多容易让 agent 走对路"。盯住每一个 agent 错误，因为它在告诉你某个非功能性需求还未被显性化。
- 工具链应优化为对 agent 友好（CLI、安静输出、`--silent`、栅格化 + OCR），而不是对人类可读。
- 永远不要和模型对赌：harness 必须能兼容模型每一次进化。

## See Also

- [[harness-engineering]] — paradigm 概念定义
- [[long-running-agent-harness]]
- [[openai-frontier-harness-zero-human-coding_b99ff06d|InfoQ 完整访谈整理]]
