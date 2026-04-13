---
tags: [harness-engineering, openai, codex, agent, ai-engineering, symphony, agent-native-development]
source: https://mp.weixin.qq.com/s/M46-Tw5l_jhZ8sncf_Triw
---

# OpenAI Frontier: Zero-Human-Coding Practice

OpenAI 的 Frontier Product Exploration 团队由 Ryan Lopopolo 领导，把 [[harness-engineering]] 推到了"AI 极致主义"的实践极限：一个 100 万+ 行代码的 Electron 应用，**没有一行代码人工手写**，**代码合并前没有人工 review**。这是把"agent 是队友而非副驾驶"这一假设贯彻到组织、工作流和代码库设计的真实样本。

## Key Concepts

- **Zero-human-coding constraint**：Ryan 给自己设的硬约束是不写一行代码。"如果未来要部署的企业 agent 真的能完成我的工作，那它现在就必须能完成。"头一个多月速度只有自己写代码的 1/10，但栈成型后远超任何单一工程师。
- **Bottleneck is human attention, not tokens**：模型可以并行化、token 在 OpenAI 内部无速率限制；稀缺的是必须实时在线的人类注意力。Review 移到合并之后，用抽样反推团队卡点（Ryan 自比"500 人组织的群组技术负责人"——不该陷在每个 PR 细节里）。
- **One-minute inner loop**：构建时间死守一分钟以内，超过不是 hard kill，而是**棘轮信号**：必须停下来重新拆解 build graph。一路从自定义 Makefile → Bazel → Turbo → Nx，哪个快用哪个。Token 便宜让"像修花园一样持续修剪系统"成为常态——能依赖更多稳定不变量。
- **Code is throwaway**：Symphony 的 **Rework 状态**会直接清空整个工作树和 PR 推倒重来。重要的不是"agent 怎么写出这段"，而是"为什么写出垃圾，缺哪条 guardrail"。Ryan："对'亲手写代码'这件事几乎已经没有投入感了。"
- **Skills before the concept existed**：~100 行总目录 + 约 6 个 skill 文件（`core_beliefs.md`、`tech_tracker.md`、`quality_score.md`、`spec.md`、`agent.md`、`$land` 等）。新需求**优先编码进现有 skill**，因为调整 agent 行为的成本比改"人类驾驶员"行为更低。
  - **`tech_tracker` / `quality_score` 实例**：一张 Markdown 表格作为 hook，让 Codex review 业务逻辑、对照 guardrails、列出改进 ticket。在没用 Linear 之前任务直接记 Markdown，agent 一个个销项。
  - **`$land` 实例**：完整委托——Codex 推 PR → 等人类和智能体评审 → 等 CI 绿 → 修不稳定测试 → 跟上游合并 → 解冲突 → merge queue → 进 main。"我只要把笔记本电脑开着。"
- **On-policy harness**：所有护栏都做成 Codex 已经在输出的形式（即代码），不在外面包额外 Rust 脚手架。类比 RL on-policy——不给模型进化带来摩擦。
  - **Policy 层例**：不写代码强制"等 CI 通过"，只给 `gh` CLI + 一段文本"CI 必须通过"就够了。
- **Symphony / Ghost Library**：Elixir 实现（模型自己选的，因为 GenServer + 进程监督天然给每个任务开一个"小型守护进程"护送到完成）。
  - **Spec 分发流程**：仓库脚手架抽出→Codex 草拟 Spec→tmux 团队的离线 Codex 实现→另一组 tmux+Codex 对照上游审查、修正 Spec→**Ralph Wiggum 风格**反复迭代到高保真。
  - **6 层架构**：Product Owner、Strategy、Configuration、Coordination、Execution、Integration、Observability。最难做对的是 Coordination 层。
- **Software written for models**：调低传统人类可读性，换取智能体可读性。
  - **过度设计是合理的**：7 人团队 / **500 个 NPM 包**——因为每人实际带 10–50 个 agent，必须切开空间避免互相踩。
  - **协调代价**：每天站立会开 **45 分钟**——某人 vibe 出本地 Playwright 守护进程，Ryan 完全不知情，"我只是运行 Codex，突然就更好用了"。
- **Reverse the setup**：入口是 Codex，不是先搭环境再放 agent。先拉 coding agent，再通过 skills/scripts 让它自行决定是否启动可观测栈（MISE + Victoria Stack + Python 胶水，半个下午搭好）。
- **Closed-loop observability 实例**：Codex 写 Grafana dashboard JSON 直接发布并对接告警——告警触发时它已经有完整上下文（仪表盘、监控项、触发警报的那一行日志）；甚至能诊断"静默事故"，自主判断是仪表盘漏掉监控还是埋点有问题，一次性修掉。
- **Agent's right to refuse**：早期问题是写代码的 Codex 太容易被 reviewer agent "欺负"，互相说话不收敛。解法：reviewer 偏向"尽快合并"、不提高于 P2 的问题；author 可暂缓或异议。**P0 = 合进去系统立马炸；P2 = 很好。**核心：不给 agent 拒绝权它就会陷入死脑筋惯性、机械执行不合理指令。
- **Knowledge codification 实例**：线上服务漏写 timeout 触发报警 → Slack `@Codex` "加 timeout 修复并把'所有网络调用必须设 timeout'写进可靠性文档" → 不只是补丁，而是把过程知识沉淀成系统的一部分；后续可蒸馏成测试用例或 Code Review Agent 的规范。
- **Skill distillation**：
  - 个人级：把自己的会话日志丢回 Codex 问"我怎样能把这工具用得更好"。
  - 团队级：所有日志进 blob storage，每天跑 agent 分析团队短板并写回仓库——"每个人免费吃到他人经验红利"。
  - 递归级：很多人直接把 Ryan 的 Harness Engineering 文章丢给 o1/Codex 说"把我的 repo 变成这样"——效果"好得离谱"。
- **Dependency vendoring**：几千行的依赖一个下午就内部化，剥掉无关部分。**MCP/Playwright 案例**：Ryan 实际只用 ~3 种 Playwright 调用，但 MCP 强行注入 token 干扰自动压缩——团队 vibe 一个本地守护进程 + 极简 CLI 解决。Codex Security 低摩擦审查。边界：Linux/MySQL/Datadog/Temporal 这种"很多双眼一起看"的安全性不一样。
- **CLI > GUI for agent**：省 token、容易再改造。`prettier --silent` / `pnpm --recursive` 包装脚本只过滤异常 / `gh pr view --web`。**反例**：值班工程师和 Codex 一下午做了个超漂亮的 tar→trace 可视化 Next.js 工具——结果完全没必要，"直接把 tar 包丢给 Codex 问问题，5 分钟得答案"。硬把工程师拽在链路里就是错的。
- **不要把 agent 关进太小的盒子**：agent 应对所在领域有完整可访问性。"它甚至能给自己创建 ticket：'以后请继续帮我创建 ticket'。"

## Key Numbers

| 维度 | 数字 |
|---|---|
| 团队规模 | 3 → 7 人 |
| 代码量 | 100 万+ 行（Electron 单体 app） |
| 仓库结构 | ~500 NPM 包 |
| 人均 PR/天 | 5.2 之前 ~3.5 → 5.2 之后 5–10 |
| 每日 token 消耗 | > 10 亿 / 人 (~$2k–3k 成本) |
| 构建时间上限 | 60 秒 |
| 实际用到的 skill | ~6 个 |
| 站立会时长 | 45 分钟 |

## Key Takeaways

- 当 agent 失败时，问题几乎从来不在提示词；要问的是缺哪种能力、哪类上下文、哪层结构。
- "代码就是上下文，代码就是提示词" — 让代码、流程、目录结构、语言、模式都统一，才能产生 agent 杠杆。
- 软件开发的瓶颈正在从"模型多聪明"转移到"系统多容易让 agent 走对路"。盯住每一个 agent 错误——它在告诉你某个非功能性需求还未被显性化。
- 工具链应优化为对 agent 友好（CLI、安静输出、`--silent`、栅格化 + OCR），而不是对人类可读。
- 永远不要和模型对赌：harness 必须能兼容模型每一次进化。
- 模型的当前边界：**全新产品想法→可玩原型** 和 **最棘手的乱糟糟重构**（如拆分单体）依然需要人深度介入。

## See Also

- [[harness-engineering]] — paradigm 概念定义
- [[long-running-agent-harness]]
- [[openai-frontier-harness-zero-human-coding_b99ff06d|InfoQ 完整访谈整理]]
