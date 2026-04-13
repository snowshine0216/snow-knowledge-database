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
- 入口是 Codex，不是先搭环境再放 agent。先拉起 coding agent，再通过 skills 和 scripts 让它自行启动整套栈（vector → logging → metrics → API）。
- 用 MISE + Victoria Stack（Go 二进制）+ Python 胶水代码，**半个下午**搭好可观测栈。Ryan 选择高层级、快开发的工具链，能拉到本地直接跑。
- **闭环示例**：Codex 写 Grafana dashboard JSON 直接发布，并对接告警系统。告警触发时 agent 已经掌握所有上下文（仪表盘定义、监控项、代码库里哪一行日志触发警报），甚至能诊断"静默事故"——自主判断是仪表盘漏掉了监控还是底层埋点有问题，一次性修掉。"全栈工程师"式排查：从后端逻辑到前端展示。
- 推理模型 vs 4 系：过去模型必须装进预定义状态迁移的盒子，现在 harness 本身就是盒子，给路径选项 + 上下文，让模型判断。

### 6. Skills：在概念诞生之前他们已经"重新发明"了 skills
- ~100 行总目录 + 多个小 skill 文件：`core_beliefs.md`、`tech_tracker.md`、`quality_score.md`、`spec.md`、`agent.md` 等。开始做这套时 skills 这个概念都还不存在。
- `tech_tracker` / `quality_score` 是小脚手架：**一张 Markdown 表格作为 hook**，让 Codex review 应用里所有业务逻辑、对照 guardrails、再给自己列出改进 ticket。在没用 Linear 之前，任务就直接记在 Markdown，再拉一个 agent 一个个销项。
- 整个代码库实际只用约 6 个 skill；**新需求优先编码进现有 skill**，而不是新造。理由：调整 agent 行为的成本比改"人类驾驶员"行为更低。
- "模型天生渴望文字" — 把过程知识沉淀进文档。
  - **具体案例**：线上服务因漏写 timeout 触发报警 → Ryan 在 Slack `@Codex`：「我准备通过加 timeout 修这个问题，你顺便更新可靠性文档，把『所有网络调用必须设置 timeout』写进去」→ 不只是打补丁，而是把"什么是正确做法"沉淀到系统里 → 主 root agent 后续都遵守 → 还能基于这条规矩蒸馏出测试用例或训练 Code Review Agent 收紧可接受范围。

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
- Elixir 实现，由 Alex Kotliarskyi 完成。**模型自己选了 Elixir**：它的 GenServer + 进程监督机制天然适合给每个执行中的任务开一个"小型守护进程"护送到完成。Ryan 个人不会写 Elixir，但已经不重要了——"工具是否适合这份工作"才重要。
- 6 层架构：Product Owner、Strategy、Configuration、Coordination、Execution、Integration、Observability。
- **Spec 分发模型**（Twitter 上有人称之为 Ghost Libraries）：
  1. 把专有仓库的脚手架抽离到一个新仓库
  2. 让 Codex 参考老库草拟 Spec
  3. 启动一个 tmux 团队，拉起离线 Codex 根据 Spec 实现
  4. 启动另一组 tmux + Codex，对照上游源码做对标审查、修正 Spec、缩小偏差
  5. 像 **Ralph Wiggum 风格**一轮又一轮迭代，直到磨出一份高保真 Spec
- **Policy 层示例**：不需要写一堆代码保证"系统必须等 CI 通过"，只要把 `gh` CLI 给它 + 一段文本"CI 必须通过"就够了。
- **"Rework" 状态**：PR 提交并升级到人工审核时，审核成本本就该极低——行就合并，不行就让 Elixir 服务**直接清空整个工作树和 PR 推倒重来**，然后反思"为什么刚才产出的是垃圾、agent 在哪儿搞错了"，修正后再回到"进行中"状态。
- **Spec 是蓝图不是死法**：Linear/GitHub 这些工具被写进 Spec，但都是可替换的——可换成 Jira/Bitbucket。但 ID 格式、单 agent loop 逻辑必须严紧。

### 10. 软件得写给模型看
- 调低对"传统人类可读性"的追求，换取更极致的智能体可读性。
- 5 人团队 / 500 个 NPM 包，"过度设计"的架构，因为每人实际带 10–50 个 agent，必须切开空间避免互相踩。
- "代码就是上下文"、"代码就是提示词" — X/Y/Z 目录的包结构、语言、模式都统一，才能产生杠杆。

### 11. 依赖内部化（Vendoring Everything）
- 同意 Bret Taylor（OpenAI 董事长，听完 Ryan 的播客后真的参与讨论）"软件依赖会消失"。
- 几千行的依赖一个下午就可以内部化。**关键 trick**：你压根不需要里面大部分内容——内部化时把通用但和你无关的部分全剥掉，只留真正需要的，专注解决具体问题。
- **真实案例**：MCP / Playwright 改造。Ryan 不喜欢 MCP 因为 harness 会强行注入 token、干扰自动压缩、agent 可能忘记怎么用工具。他在 Playwright 里其实只用 ~3 种调用。后来"团队某人 vibe 了一个本地守护进程启动 Playwright + 极简命令行工具驱动"——Ryan 完全不知道这件事发生了，他只是运行 Codex，"突然就能用了，而且更好用"。
- Codex Security 可以低摩擦审查内部化的依赖，比给上游提 PR → 等发布 → 拉回 → 验证传递依赖兼容快得多。
- 边界：像 Linux/MySQL/Datadog/Temporal 这种规模和"很多双眼一起看"的安全性（"开源安全最好的消毒剂是放在阳光下"）还是不一样。

### 12. CLI 优于 GUI for Agent
- "CLI 最大的好处是省 token，而且容易被进一步改造成更省 token 的形式。"Ryan 现在和 GitHub Web UI 唯一的互动是 `gh pr view --web` 扫一眼然后 "行，发吧"。
- **prettier `--silent`**：agent 不关心每个文件是不是"已经格式化过了"，它只需要知道：格式化好了还是没好，再决定要不要写入。
- **pnpm `--recursive` 包装**：原始递归输出是"一座文字大山"，绝大部分是无关紧要的成功记录。Frontier 在外面再封装一层脚本，只过滤出核心信息（异常 / 失败）。
- 类比 Buildkite/Jenkins：开发效能团队把异常从日志海洋里提出来置顶——CLI 工具应该原生这么做。
- **反例（"过度服务人类反而是错的"）**：内部用户性能问题 → tar 包 trace → 值班工程师和 Codex 一下午做了一个超漂亮的 Next.js 本地 trace 可视化工具——但这工具完全没必要。"你直接启动 Codex，把 tar 包丢给它问同样的问题，马上就能得到答案。"硬把工程师拽在链路里就是错的。
- **把不文本化的东西转成文本**：agent 不会"看到一个红框"，它在 latent space 里理解概念。UI → 图像栅格化 → OCR → 喂给 agent，比让 agent 直接"看"更可靠。两种方法可以同时做。

### 13. Skill Distillation（技能蒸馏）
- **个人级**：把自己的 Codex 会话日志直接丢回 Codex，问"你觉得我怎样才能把这个工具用得更好？"内部表情包：「你直接 Codex 一下就好了」。
- **团队级**：整个团队的会话日志统一进 blob storage，每天跑 agent 分析"团队还能在哪里做得更好？这些经验该怎么写回仓库？" → 每个人免费吃到他人的经验红利。
- PR 评论 = 反馈信号 = 当前代码偏离"好的标准"。构建失败 = 信号 = 某个时刻 agent 缺了上下文。全部吸收回仓库。
- "每一次报错都在提醒：agent 写出的代码与某个尚未被显性化的非功能性需求发生了错位。"
- **"递归"应用案例**：Ryan 在 Twitter 上看到很多人直接把他的 Harness Engineering 文章链接丢给 o1/Codex 说"把我的 repo 变成这样" — 效果"好得离谱"。

### 14. 不要把 Agent 关进太小的盒子
- Agent 应对所在领域有完整可访问性。
- 它甚至可以给自己创建 ticket："以后请继续帮我创建 ticket"。
- 核心是上下文 + 工具。

### 15. On-Policy Harness
- 所有护栏都做成 Codex 已经在输出的形式（即代码），不在 Codex 外面包额外 Rust 脚手架限制输出。
- 类比 RL：on-policy harness 处在分布之内，不会给模型继续进化带来摩擦。

### 16. 模型边界（5.4 时点）
- 还做不到：从全新产品想法直接一枪到底跑通原型（mock → 真能玩的产品，没有现成页面参考）；最棘手的乱糟糟重构（拆分单体架构）—— 这两类是 Ryan 最频繁打断、亲自介入的地方。
- 复杂度从"低复杂度任务"扩展到"低复杂度 + 大任务"并行（一个月内的进步）。
- 5.4 是首个真正把 Codex 级编码能力 + 通用推理 + computer use + 视觉合到同一模型里的版本。Codex 直接写了 OpenAI 关于 5.4 的那篇博客文章。
- **关于 Spark（小快模型）**：Ryan 还没完全想明白怎么用——把它当超高推理模型用时，它在写出第一行代码前已经先跑完三轮压缩。但对 lint 规则生成、文档更新、快速原型很合适（Frontier 已有完善的 ESLint 基础设施，Spark 在"拿反馈→转 lint 规则"这件事上特别强）。
- "永远不要和模型对赌。"做的所有事必须能兼容模型每一次进化。

### 17. 公司上下文 + 文化即 Skill
- `core_beliefs.md`：团队成员、产品、终端客户、试点客户、12 个月愿景。**全是 agent 必需的上下文**——直接影响构建什么样的软件。
- 甚至有 skill 教 agent **怎么正确生成"高糊表情包"**、怎么融入 Slack 公司文化。Codex 现在能用 Slack ChatGPT app，可以让 agent 替自己整活儿。"幽默感也是上下文的一部分。"
- 5.4 在幽默感上明显接近"我自己"。

### 18. 多人 + 多智能体的协调成本
- 团队每天站立会开 **45 分钟**——必须把当前状态扩散给所有人，因为每个人完全不知道彼此的 agent 在做什么（参考前面 Playwright 例子）。
- 仓库结构 ~500 个 NPM 包对 7 人团队过度设计——但每人实际带 10–50 agent 时就合理了。"切开空间避免互相踩。"
- 大量使用 git worktree（Cursor 团队想干掉 worktree 因为 merge conflict，Ryan 不在乎："模型解 merge conflict 非常擅长，而且代码反正可抛弃"）。
- 大量使用 Slack 派发 Codex 做动作型/弹性修复/知识同步——成本极低。

### 19. 数据 Agent 案例
- Frontier 内部 data agent：让公司数据本体对 agent 可访问，让它理解仓库里到底有什么。
- "Active user"定义：公司里五个数据科学家定义出的"黄金标准"。
- 涉及内部政治：贡献怎么算（市场部 vs 销售加起来超过 100%）——agent 必须先理解 revenue/客户分层/产品线，才能做"不只会写代码"的工作。

## 实际数字一览

| 维度 | 数字 |
|---|---|
| 团队规模 | 3 人起步 → 7 人 |
| 代码量 | 100 万+ 行 |
| 仓库结构 | ~500 NPM 包 |
| 人均 PR/天 | 5.2 之前 ~3.5 → 5.2 之后 5–10 |
| 每日 token 消耗 | > 10 亿 / 人 |
| 估算 token 成本 | ~$2k–3k / 人 / 天 |
| 构建时间上限 | 60 秒 |
| 代码库实际用到的 skill | ~6 个 |
| 主目录长度 | ~100 行 |
| 站立会时长 | 45 分钟 |

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
