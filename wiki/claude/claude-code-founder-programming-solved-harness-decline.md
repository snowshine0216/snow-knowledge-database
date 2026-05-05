---
tags: [claude-code, anthropic, boris-cherny, ai-engineering, harness, agentic-workflow, loop, routines, swe-automation]
source: https://mp.weixin.qq.com/s/-RmZAqKSM7wFxQFG0ix33Q
---

# Claude Code创始人：编程已经解决了，Harness重要性持续降低

Boris Cherny（Claude Code创始人）在AI Ascent 2026上接受红杉资本Lauren Reeder专访，披露了2026年至今他本人零手写代码、每天合并数十乃至150个PR的工作现实。文章涵盖Claude Code的诞生背景、当前工作流、未来团队形态、SaaS护城河重排序，以及Claude Code自身演进的反直觉判断：随着模型能力增强，产品层（harness）的必要性将持续下降，Claude Code目标是"只有100行代码"。

## Key Concepts

- **Product Overhang（产品溢出）**：Boris核心判断框架——模型能力已超出现有产品的释放边界，大量潜力被白白浪费。2024年底Anthropic Labs据此孵化了Claude Code、MCP协议和桌面应用。产品在前六个月被显式设计为"无PMF"，因为目标是为下一代模型建产品。

- **Loop**：Claude Code最新一等功能——用cron调度定时重复的Agent任务，频率任设（每分钟、每5分钟、每天）。Boris当前同时跑数十个Loop：监控PR状态自动rebase、修复flaky CI、每30分钟从Twitter抓Claude Code反馈并聚类推送给他。Anthropic同步发布的[[routines]]将同一模式迁移到服务端，关机任务照跑。

- **Harness天花板**：当前Claude Code的安全机制（防prompt注入、命令静态校验、权限模式、人工审批）被Boris明确定性为模型能力不足时的临时补丁，而非永久架构。目标是随着模型判断可靠性提升，这些机制逐渐退出，代码库收缩到100行。

- **Opus 4拐点**：Claude Code发布前六个月Boris自己完成的AI代码比例约10%，发布后增长也不成指数；真正的使用量陡升发生在Opus 4发布的5月，此后每次迭代（4.5→4.6→4.7）都带来一次折弯。

- **印刷术类比**：印刷术前欧洲识字率约10%，发明后50年出版文字量超过此前1000年总和，书价下降近百倍，数百年后识字率升至70%。Boris认为软件门槛下降会走同一路径但快得多——写代码将降至"发短信"级别，但专业工程师像专业作家一样仍将存在。

- **全科型人才**：Claude Code团队的PM、设计师、财务、数据科学家都在写代码；最好的会计软件未来的作者很可能是精通会计业务的人，因为"业务知识才是难点，写代码已经是容易的部分"。

- **Agent间Slack通信**：Anthropic内部不同人的Claude实例通过Slack互相发消息——一个人的Agent遇到问题会自动给另一个人的Agent发消息确认信息。这是多Agent协作的低成本集成方案，可直接复用。

## Key Takeaways

- Boris 2026年至今零手写代码，每日平均合并数十PR、状态好时150个；同时有数百Agent运行，每晚数千个做异步任务
- 规划视野仅为一周到六个月；"等下一个模型"是应对当前边界场景的合理工程决策，而非回避
- 护城河重排：切换成本和流程壁垒因AI削弱（Opus 4.7持续迭代能力尤其加速流程壁垒瓦解），网络效应和规模经济不变；未来十年创业公司数量预测×10
- Anthropic内部领先来自组织渗透深度（全公司无手写代码、Claude实例通过Slack通信），而非更早访问到未发布模型版本
- 下一步公开功能：Loop一等功能化、Claude Design成熟、computer use进化、接下来几周新功能上线（截至2026-05-06）

## See Also

- [[claude-code-internals]]
- [[claude-code-best-practice]]
- [[claude-advisor-monitor-managed-agents]]
- [[claude-code-agentic-os]]
- [[long-running-agent-harness]]
