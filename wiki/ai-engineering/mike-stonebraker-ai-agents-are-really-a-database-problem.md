---
tags: [text-to-sql, databases, ai-agents, dbos, postgres, distributed-systems, benchmark, ai-engineering]
source: https://mp.weixin.qq.com/s/sR7X6domCisQ-fsrQkD4rA
---

# Mike Stonebraker：AI Agent 最后会变成数据库问题

这篇访谈最值得记录的地方，不是 Stonebraker 又骂了 Oracle、Google、Amazon，而是他把今天很多 AI 工程讨论重新翻译成数据库语言。对他来说，agentic AI 现在之所以看起来轻盈，是因为大量系统仍停留在 read-only 阶段：做总结、做判断、给建议、输出文本。一旦 agent 开始真正读写世界，例如转账、改库存、调度工作流、提交事务，它立刻就不再是“模型会不会推理”的问题，而是原子性、一致性、回滚、故障转移和分布式协调的问题。这个翻译非常关键，因为它决定了你到底该把精力花在更会写 prompt，还是花在 runtime、workflow、storage 和 transaction semantics 上。

Stonebraker 还给了两个非常硬的现实锚点。第一，DBOS 的逻辑并不玄学：Databricks 在调度上百万 Spark 任务时，最后让 Postgres 参与调度决策，这启发了“把 Linux 上半部分换成数据库”的研究与公司化路线。第二，公开 text-to-SQL 榜单的高分并不等于可生产。Spider / Bird 上 80% 到 85% 的成绩，在他们基于 4 个真实生产数仓做出来的 Beaver benchmark 上掉到 0%；加 RAG 只有 10%，把 `from` 和 join 条件直接喂给模型也只有 35%，而熟练工程师在澄清歧义后能到 90% 以上。原因也非常系统化：真实 SQL 经常 100 行起步，schema 充满物化视图、缩写列名和本地业务概念，这和干净 benchmark 完全不是一个问题。对做 AI agent、workflow 平台、企业数据问答的人来说，这篇访谈最实用的提醒是：别把 read-write agent 当成“更强的大模型应用”，它更像一个重新包装过的分布式数据库问题。

## Key Concepts

- **Postgres as the default low-end answer**：Stonebraker 仍承认，如果你只是先把东西做起来，不追求每秒百万事务或 PB 级仓库，Postgres 依然是最稳妥起点。
- **One size fits none**：数据库性能高度依赖场景匹配。列存、流处理、向量处理之所以独立存在，是因为通用系统往往会损失一个数量级的性能。
- **GPU conflicts with indexing**：数据库一旦依赖 B 树这类索引，访问模式就会变成分支密集、指针跳转型，天然抵触 GPU 喜欢的 SIMD 路线。
- **DBOS as workflow runtime**：DBOS 想把应用状态、调度和工作流直接交给数据库承载，让事务性、持久化和 failover 成为默认属性，而不是业务代码四处补丁。
- **Beaver benchmark realism gap**：公开 text-to-SQL 榜单的问题不是“难度不够高一点”，而是 schema 干净、查询短、语义通用，和真实数仓完全不是同一类环境。
- **Read-write agents are database systems**：只要 agent 要修改真实世界状态，事务提交、回滚和一致性就会重新成为核心设计问题。

## Key Numbers

| Item | Value | Why it matters |
|---|---|---|
| Amazon databases | ~15 systems | Stonebraker 认为其中大约只有 3 种真正必要。 |
| DBOS agentic AI customers | ~2/3 | 说明数据库化 workflow 已在真实 agent 市场里找到需求。 |
| Public text-to-SQL scores | 80% - 85% | 很容易让团队误以为系统“快能上生产”。 |
| Beaver raw accuracy | 0% | 真实生产数仓的难度与公开 benchmark 完全不在一个数量级。 |
| Beaver + RAG | 10% | 检索增强不能解决 schema 与复杂查询的根本难题。 |
| Beaver + explicit joins | 35% | 即使把结构提示直接给模型，也仍远远不够。 |
| Human engineer | 90%+ | schema 理解和业务语义仍然是人类优势。 |
| Real warehouse SQL length | 100+ lines | 复杂度本身就让 benchmark 外推几乎失效。 |

## Key Takeaways

- AI agent 一旦开始写世界，就必须按数据库系统来设计，而不是只按聊天机器人来评估。
- “榜单接近可用”在企业数据系统里常常是假象，真实 schema 和真实工作负载会把很多能力直接打回原形。
- workflow runtime、数据库和 agent harness 的边界正在收缩，未来很多 AI 平台的核心竞争力会是事务性与状态管理。
- 如果团队正计划做企业级 text-to-SQL，先找真实 schema 和真实查询，不要先被 Spider/Bird 分数说服。

## See Also

- [[harness-engineering]]
- [[openai-frontier-zero-human-coding]]
- [[llm-api-statelessness]]