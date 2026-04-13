---
tags: [harness-engineering, openai, codex, agent, ai-engineering, symphony, frontier, agent-native-development]
source: https://mp.weixin.qq.com/s/M46-Tw5l_jhZ8sncf_Triw
wiki: wiki/concepts/openai-frontier-zero-human-coding.md
---

# OpenAI 把工程师经验"蒸馏"进 skill：百万行代码、零人工编码与零人工审核

**Source:** InfoQ 翻译整理 · 作者 褚杏娟 · 2026-04-13
**Original podcast:** [Latent Space / AI Engineer with Ryan Lopopolo](https://www.youtube.com/watch?v=CeOXx-XTYek)
**Speakers:** Ryan Lopopolo（OpenAI Frontier Product Exploration）, swyx, Vibhu

## Overview

Ryan Lopopolo 来自 OpenAI 新成立的 Frontier 团队，他们维护着一个 100 万+ 行代码的代码库，**没有一行是人工手写的**，而且代码合并前**不再有人工 review**。Ryan 给自己设的硬约束是"不写一行代码"，逼着 agent 必须从头到尾完成所有事情。Token 在 OpenAI 内部没有速率限制，他们把这件事推到了一个"AI 极致主义"的状态：每天用超过 10 亿 tokens 在他眼里几乎是默认。这场对话系统化地揭开了 Harness Engineering 在 OpenAI 内部的真实运作方式。

## Key Points

### 1. "零人工写码"作为方法论起点
- Ryan 一开始就刻意不写任何代码，因为如果未来要部署进企业的 agent 真的能完成他的工作，那它现在就必须能完成他的工作。
- 头一个多月速度只有他正常写代码的十分之一，但随后构建栈成型，**生产力远超任何单一工程师**。
- 每个工程师每天的产出从 5.2 之前的 ~3.5 PR/天，5.2 之后跳到 5–10 PR/天。

### 2. 模型搞不定时，问题不在提示词
- Codex Mini 早期版本反而是好约束：它做不出来时，团队不去"换提示词"或"再努力一点"，而是问：缺的是哪种能力、哪类上下文、哪层结构？
- 形成的心法：拆任务、深入做出更小的基础组件、再组装回去。

### 3. 一分钟构建上限（Inner Loop）
- 5.3 引入 background shell 后模型变得没耐心，团队把整个构建系统重做，**死守一分钟以内**。
- 一路从自定义 Makefile → Bazel → Turbo → Nx，哪个快用哪个。
- 一分钟不是 hard kill，而是**棘轮信号**：超过就必须停下来重新拆解构建图谱。Electron 单体应用，构建超过 1 分钟就重做。
- "token 太便宜，模型可以疯狂并行，所以可以像修花园一样持续修剪系统。"

### 4. 人成了瓶颈：合并后 Review
- 三个人，一百万行代码，上千个 PR。
- 现在 **大部分人工 code review 发生在合并之后**。"模型可以极容易并行化，真正稀缺的是必须实时在线的人类注意力。"
- 抽样代码样本来反推团队卡点，从细节中抽离去看更高维度。

### 5. 可观测性优先：把模型从盒子里放出来
- 入口是 Codex，不是先搭环境再放 agent。先拉起 coding agent，再通过 skills 和 scripts 让它自行启动整套栈。
- 用 MISE + Victoria Stack（vector / logging / metrics / API）+ Python 胶水代码，半个下午搭好可观测栈。
- 推理模型 vs 4 系：过去模型必须装进预定义状态迁移的盒子，现在 harness 本身就是盒子，给路径选项 + 上下文，让模型判断。

### 6. Skills：在概念诞生之前他们已经"重新发明"了 skills
- ~100 行总目录 + 多个小 skill 文件：`core_beliefs.md`、`tech_tracker.md`、`quality_score.md`、`spec.md`、`agent.md` 等。
- `tech_tracker` / `quality_score` 是小脚手架：Markdown 表格作为 hook，让 Codex review 业务逻辑、对照 guardrails、列出改进 ticket。
- 整个代码库实际只用约 6 个 skill；**新需求优先编码进现有 skill**，而不是新造。
- "模型天生渴望文字" — 把过程知识沉淀进文档（如线上事故修复时同步更新可靠性文档"所有网络调用必须设 timeout"）。

### 7. Code Review Agent 与"反驳权"
- 本地 Codex CLI 写改动 → 推 PR → review agent 自动评论 → 写代码的 Codex 必须确认并回应。
- 早期问题：写代码的 Codex 太容易被 reviewer agent "欺负"，互相说话不收敛。
- 解法：双方 prompt 都加可选空间。Reviewer 偏向"尽快合并"、不提出高于 P2 的问题。
- **必须给 agent "拒绝"的权力**，否则它会陷入死脑筋的惯性。
- P0 = 合并后系统立马炸，P2 = 很好。

### 8. `$land` Skill：完整委托
- Codex 引导自己：推 PR → 等人类和智能体评审 → 等 CI 绿 → 修不稳定测试 → 跟上游分支合并 → 解冲突 → merge queue → 修不稳定性 → 进入 main。
- "我现在根本不需要操心，只要把笔记本电脑开着。"

### 9. Symphony：Ghost Library
- Elixir 实现，由 Alex Kotliarskyi 完成。模型自己选了 Elixir，因为 GenServer + 进程监督天然适合 agent 任务编排。
- 6 层架构：Product Owner、Strategy、Configuration、Coordination、Execution、Integration、Observability。
- **Spec 分发模型**（Twitter 上有人称之为 Ghost Libraries）：分享专有仓库的脚手架抽离 → Codex 草拟 Spec → tmux 团队的离线 Codex 实现 → 另一组 Codex 对照上游审查、修正 Spec → 反复迭代直到高保真。
- "Rework"状态：PR 升级到人工审核时，行就合并、不行就清空工作树和 PR 推倒重来。

### 10. 软件得写给模型看
- 调低对"传统人类可读性"的追求，换取更极致的智能体可读性。
- 5 人团队 / 500 个 NPM 包，"过度设计"的架构，因为每人实际带 10–50 个 agent，必须切开空间避免互相踩。
- "代码就是上下文"、"代码就是提示词" — X/Y/Z 目录的包结构、语言、模式都统一，才能产生杠杆。

### 11. 依赖内部化（Vendoring Everything）
- 同意 Bret Taylor "软件依赖会消失"。
- 几千行的依赖一个下午就可以内部化，剥掉无关部分。
- Codex Security 可以低摩擦审查内部化的依赖，比给上游提 PR 等发布快得多。
- 边界：像 Linux/MySQL/Datadog/Temporal 这种规模和"很多双眼一起看"的安全性还是不一样。

### 12. CLI 优于 GUI for Agent
- "CLI 最大的好处是省 token，而且容易被进一步改造成更省 token 的形式。"
- 给 prettier 加 `--silent`：agent 不关心每个文件是否已格式化，只关心结果。
- pnpm `--recursive` 输出"文字大山"，外面包一层脚本只过滤核心信息。
- 把不文本化的东西转成文本：UI 用 OCR 栅格化喂给 agent。

### 13. Skill Distillation（技能蒸馏）
- 把会话日志丢回 Codex 问"你觉得怎样能把这工具用得更好？"
- 整个团队的日志放进 blob storage，每天跑 agent 分析"团队还能在哪里做得更好"，写回仓库 → 每个人免费吃到他人的经验。
- PR 评论、构建失败 = 反馈信号 = 缺失的 guardrail，全部吸收回仓库。
- "每一次报错都在提醒：agent 写出的代码与某个尚未被显性化的非功能性需求发生了错位。"

### 14. 不要把 Agent 关进太小的盒子
- Agent 应对所在领域有完整可访问性。
- 它甚至可以给自己创建 ticket："以后请继续帮我创建 ticket"。
- 核心是上下文 + 工具。

### 15. On-Policy Harness
- 所有护栏都做成 Codex 已经在输出的形式（即代码），不在 Codex 外面包额外 Rust 脚手架限制输出。
- 类比 RL：on-policy harness 处在分布之内，不会给模型继续进化带来摩擦。

### 16. 模型边界（5.4 时点）
- 还做不到：从全新产品想法直接一枪到底跑通原型；最棘手的乱糟糟重构。
- 复杂度从"低复杂度任务"扩展到"低复杂度 + 大任务"并行（一个月内的进步）。
- "永远不要和模型对赌。"

### 17. 公司上下文 + 文化即 Skill
- `core_beliefs.md`：团队成员、产品、终端客户、试点客户、12 个月愿景。
- 甚至有 skill 教 agent 怎么生成"高糊表情包"、怎么融入 Slack 公司文化。
- 5.4 在幽默感上明显接近"我自己"。

## Key Quotes

- "如果你现在每天还不用超过十亿 tokens，那几乎都快算得上'失职'了。"
- "代码是可抛弃的。"
- "模型本质上是可以被极其容易地并行化的。真正稀缺的，是人类注意力。"
- "我们的入口就是 Codex。"
- "模型天生就渴望文字。"
- "永远不要和模型对赌。"
- "归根到底，这一切都是文本。我的工作就是想办法把文本从一个 agent 引到另一个 agent。"
- "就像我说的，这个模型和我是'同构'的。"

## Frontier 平台（产品方向）

- Frontier = 企业级 AI 平台，让企业大规模、可治理、安全地部署 agent。
- 核心组件预期：Agents SDK、Shell tool、Codex Harness（带文件附件 + 容器）、GPT-OSS safeguard model。
- 服务对象：高效使用 agent 的员工 + IT/GRC/治理团队/AI 创新办公室/安全团队（对部署和合规负责的人）。
- 数据 agent 是案例：Frontier 让数据本体对 agent 可访问，理解仓库里到底有什么。

## See Also

- [[harness-engineering]] — paradigm 概念定义
- [[long-running-agent-harness]]
- [[openai-frontier-zero-human-coding]] — 本文的 wiki concept 抽取
