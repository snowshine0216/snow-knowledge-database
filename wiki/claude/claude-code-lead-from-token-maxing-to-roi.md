---
tags: [claude-code, cowork, anthropic, routines, agentic-engineering, engineering-management, roi, dogfooding]
source: https://mp.weixin.qq.com/s/34YV97sB5gF-7XAvXzryXw
---
# Claude Code 工程一号位 Fiona Fung：从狂烧 Token 到算 ROI

Anthropic Claude Code 与 Cowork 团队负责人 Fiona Fung（管理 Boris Cherny 及整个工程/PM 团队，前 Microsoft Visual Studio、Meta Facebook Marketplace）在 Lenny's Podcast 的对谈。背景事实：Anthropic 工程师人均季度代码交付量一年内涨到 **8 倍**，Boris 称“coding is solved”。核心论点：当写代码不再是瓶颈，瓶颈转移到**验证质量（verification）、判断优先级、衡量真实产出、管理异步 agent、保持团队文化**。这与 [[claude-code-founder-programming-solved-harness-decline]] 同源（同一团队的另一视角）。

## Key Concepts
- **瓶颈转移**：设计师、PM 也在 check in code，提交者更多、角色更混、吞吐更高；新难题是如何 verification——确认高速提交的东西正确且高质量。
- **把“good looks like”框架化进 repo**：把 spec / 质量定义放进 repo 并与代码同步更新（如把 content design 做成一个 **skill**），Claude Code review 在有明确框架后非常擅长按框架自动校验；重要/需深度专业区域仍保留人类 review。
- **routines（异步工作的抽象上抬）**：从“同步写 prompt 等结果”→“异步启动几个 prompt”→“设 routine 让 agent 每天早上自动读反馈频道、生成 prompt 甚至派生 agent 生成 PR”，醒来即有摘要 + 可 review 的 PR。代价：context switching 负担上升，需重新 block focus time（她也未解决）。
- **从 token maxing 到 ROI**：拒绝把 lines of code / token 消耗当 throughput（迁移库/更新框架会让代码量误导）。核心判据是 **output 是否真的导向 outcome**——“不要把 motion 当成 progress”。
- **high agency = high accountability**：给团队自由发挥的同时，必须锁定“你要解决什么问题、假设是什么”，二者是一枚硬币两面。
- **dogfooding 与个案优先**：从亲自当用户遇到的小问题获得的洞察常胜过 dashboard（数据与个案冲突时更信个案）；leader 即使不提交代码也用 dogfooding 时间检查端到端体验。
- **AI 做 TDD**：让 Claude“先写测试→确保失败→再修→通过”，把过去“必须支付的测试成本”自动化，老原则重新有价值。
- **JIT planning + 杀掉过时流程**：六个月 roadmap 太长；改用小 spreadsheet 列本月优先级 + 每周 check-in，明确允许砍掉不再服务团队的流程。

## Key Numbers
| 数字 / 事实 | 含义 |
|---|---|
| 8 倍 | Anthropic 工程师人均季度代码交付量一年增长 |
| 25+ 年 | Fiona 工程从业年限（IBM→MS→Meta→Anthropic） |
| 一两个月前 | routines 推出时间，“彻底改变工作方式” |
| 3 人 | 智利 Marketplace 实地研究小队（带一堆 Android 手机，发现低速 LTE 拖垮 feed） |
| 20 个 agents | 并行时“无穷无尽的检查与 review、要记住每个上下文” |

## Key Takeaways
- 写代码不再稀缺——把工程重心移到 verification，并把“什么是好”框架化进 repo 交给 Claude Code review 自动校验。
- 用 routines 把管理动作（看反馈频道、找 polish fixes、生成 PR）异步化；验证机制可靠后再逐步给 agent 更多自主权。
- 用 outcome 而非工具使用量衡量 ROI；好指标要能 hill climb，但持续问“它还服务目标吗”（Marketplace 从“卖家数量”转向“power sellers”）。
- 最大的非技术风险是高速增长中的文化漂移——公开谈“什么不顺利”才有机会解决，警惕“一切都很好”式汇报。

## See Also
- [[claude-code-founder-programming-solved-harness-decline]]
- [[claude-merges-80-percent-code-close-the-loop]]
- [[anthropic-internal-100-prototypes-mythos-model-skills]]
- [[anthropic-ai-native-startup-playbook]]
- [[models-will-devour-the-harness-logan-kilpatrick]]
