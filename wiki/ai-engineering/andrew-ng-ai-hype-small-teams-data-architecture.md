---
tags: [andrew-ng, ai-agents, product-management-bottleneck, enterprise-ai, data-architecture, coding-agents, vendor-lock-in, langchain]
source: https://mp.weixin.qq.com/s/OyBxKybz-YDBOqw0AUadhA
---
# 吴恩达戳破 AI 幻象：10 人小队 + Agent 重做数据架构

吴恩达在 LangChain Interrupt 大会与 Harrison Chase 对谈。他先泼冷水：过去一年**热度与炒作超出预期**，“工作岗位末日”叙事被过度关注但他不认为会真发生；真正快于预期的是**编程智能体**（六个月前几乎只用 Claude Code，现在混用 Codex、Gemini CLI、OpenCode，甚至在手机上写代码）。核心论点是“产品管理瓶颈”的升级版，并把企业 agent 的关键基础落到**非结构化数据架构重构**。数据架构观点与 [[mike-stonebraker-ai-agents-are-really-a-database-problem]] 高度共振。

## Key Concepts
- **产品管理瓶颈扩散**：写软件快 10–100 倍后，瓶颈不只是“决定做什么”，**营销/法务/设计/合规都会变成瓶颈**——“三个月构建 + 一周法务签字”可接受，但“一天构建 + 一周签字”里法务就是阻碍。
- **1–10 人通才小队**：高上下文、高授权工程师 + 一组宽护栏，借鸽巢原理（5 种职能 2 个人 → 每人多角色）让 AI 起草营销文案、服务条款初稿，再交专业人员把关。“用 AI 时我仍不是好营销人员，只是没那么差。”
- **乐高积木 + Context Hub**：掌握足够多 AI/非 AI 构建模块的人能组合式（指数式）快速拼系统；难点是新模块太新（模型曾不知 nano-banana 存在/如何调其 API），用“面向 agent 的 Stack Overflow” Context Hub 给 agent 喂最新 API/SDK 文档。
- **追增长而非只降本**：降本有上限，增长几乎无天花板。贷款承销案例——只自动化“审批一小时”是点状提效；重构整条流程推出“**10 分钟获批**”产品才是转型，但需自上而下的权限改变营销/数据/尽调/执行协同。
- **选择权优先，警惕供应商锁定**：没人确定一年后最强模型/编程 agent 是谁；他个人“无论折扣多大几乎从不签超一年合约”，优先用供应商中立的 **LangSmith**，并支持开放权重模型。
- **先做数据战略再构建 Agent**：AI 现在能处理非结构化数据（文本/PDF/图片/音频/视频），但企业数据碎片化、权限为人而非 agent 设计、治理/可观测性不足；预测未来几年出现数千万至数亿美元级数据架构重构。
- **NoSQL 加速迭代**：快速原型时用 MongoDB“读取时处理 schema”而非写入时固定，避免“想加字段就重构整库”；超大规模生产再回到关系型/可扩展方案。

## Key Numbers
| 数字 / 事实 | 含义 |
|---|---|
| 10–100 倍 | 写软件提速幅度，瓶颈扩散到所有环节 |
| 1–10 人 | 越来越多组建的通才高授权小团队规模 |
| 10 分钟 | 流程重构后的“获批”贷款产品目标（vs 等人一周） |
| 300+ 个 | 某金融机构一次发来评估的 AI 想法数量 |
| 6–9 个月 | 开放权重模型落后前沿模型的差距 |
| 数千万–数亿美元 | 预测的企业数据架构重构项目规模 |
| 20–30% | 供应商折扣，条件是签三年合约（他几乎不签超一年） |

## Key Takeaways
- 软件构建提速会把瓶颈推给营销、法务、设计、合规——组建能跨角色的通才小队来吸收这些瓶颈。
- 自下而上“百花齐放”只带来点状提效，必须配自上而下的流程重构才能创造增长；优先追增长（无天花板）而非降本（有上限）。
- 把选择权当一等公民：不签长约、用供应商中立工具、支持开放权重模型。
- 企业 agent 的真正前置工作是非结构化数据架构重构，而非直接堆 agent。

## See Also
- [[mike-stonebraker-ai-agents-are-really-a-database-problem]]
- [[harness-engineering]]
- [[claude-code-founder-programming-solved-harness-decline]]
- [[models-will-devour-the-harness-logan-kilpatrick]]
