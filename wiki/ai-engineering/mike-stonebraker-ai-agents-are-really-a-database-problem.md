---
tags: [text-to-sql, databases, ai-agents, dbos, postgres, distributed-systems, benchmark, ai-engineering]
source: https://mp.weixin.qq.com/s/sR7X6domCisQ-fsrQkD4rA
---

# Mike Stonebraker：AI Agent 最后会变成数据库问题

这篇访谈最值得记录的地方，不是 Stonebraker 又骂了 Oracle、Google、Amazon，而是他把今天很多 AI 工程讨论重新翻译成数据库语言。对他来说，agentic AI 现在之所以看起来轻盈，是因为大量系统仍停留在 read-only 阶段：做总结、做判断、给建议、输出文本。一旦 agent 开始真正读写世界，例如转账、改库存、调度工作流、提交事务，它立刻就不再是“模型会不会推理”的问题，而是原子性、一致性、回滚、故障转移和分布式协调的问题。这个翻译非常关键，因为它决定了你到底该把精力花在更会写 prompt，还是花在 runtime、workflow、storage 和 transaction semantics 上。

Stonebraker 还给了两个非常硬的现实锚点。第一，DBOS 的逻辑并不玄学：Databricks 在调度上百万 Spark 任务时，最后让 Postgres 参与调度决策，这启发了“把 Linux 上半部分换成数据库”的研究与公司化路线。第二，公开 text-to-SQL 榜单的高分并不等于可生产。Spider / Bird 上 80% 到 85% 的成绩，在他们基于 4 个真实生产数仓做出来的 Beaver benchmark 上掉到 0%；加 RAG 只有 10%，把 `from` 和 join 条件直接喂给模型也只有 35%，而熟练工程师在澄清歧义后能到 90% 以上。原因也非常系统化：真实 SQL 经常 100 行起步，schema 充满物化视图、缩写列名和本地业务概念，这和干净 benchmark 完全不是一个问题。对做 AI agent、workflow 平台、企业数据问答的人来说，这篇访谈最实用的提醒是：别把 read-write agent 当成“更强的大模型应用”，它更像一个重新包装过的分布式数据库问题。

> [!info]+ 💡 Explanation - Why Read-Write Agents Need Transaction Semantics
> 
> Stonebraker 这篇最值得展开的一点，是他把 Agent 的难题从“模型能力”翻译成了“事务语义”。read-only Agent 出错，通常只是总结偏了、判断错了、建议需要人工复核；read-write Agent 出错，则会直接变成重复退款、库存为负、订单状态冲突、CRM 脏数据或跨系统副作用失控。问题的重心因此从 prompt quality 转移到了 state management。
> 
> 一个自动退款 Agent 就很典型。模型也许只负责理解用户意图、抽取订单号和退款原因，但真正执行时，系统还要检查订单是否满足政策、生成唯一请求 ID、调用支付渠道、更新账务和订单状态、最后再发通知。只要其中任何一步和其他步骤脱节，就会出现“钱已经退了，但内部状态没更新”或“内部标记已退款，但外部渠道其实失败了”这种半完成状态。这已经不是聊天机器人问题，而是分布式事务问题。
> 
> 所以生产级 Agent 至少要补上数据库世界早就重视的几层纪律：显式状态机与持久化检查点，用来回答“现在做到哪一步”；幂等键和去重逻辑，用来处理重试与超时；并发控制，用来避免两个 Agent 或一个人加一个 Agent 同时改同一条记录；补偿或回滚机制，用来处理跨多个系统的部分成功；以及审计日志和人工接管能力，用来回答“是谁在什么上下文下做了这次修改”。这些能力不让 Agent 更聪明，但决定了它能不能进生产。
> 
> 从这个角度看，Stonebraker 和 [[demis-hassabis-agents-agi-virtual-cells]] 其实讨论的是同一系统的两半。Hassabis 关心的是 Agent 还缺长期记忆、持续学习和推理纠错，所以“大脑”还不够成熟；Stonebraker 关心的是即使模型已经足够会想，系统仍然需要事务、一致性和故障恢复这套“后端骨架”。真正高价值的 Agent，必须同时补上这两层。

> [!info]+ 💡 Explanation - One Size Fits None vs Postgres as the Default Start
> 
> Stonebraker 这里区分的是“性能最优解”和“工程默认起点”。`One size fits none` 的意思不是通用数据库没用，而是不同 workload 在底层根本不是同一种问题：交易系统关心事务、一致性和小读写；分析系统关心列存、压缩和大扫描；向量检索关心近似最近邻索引；流处理关心持续事件和窗口计算。通用数据库能覆盖很多事，但通常不会在每一种负载上都最优。
> 
> StreamBase、Vertica、ClickHouse、Pinecone 这些例子之所以重要，是因为它们不是“更高级的数据库”，而是“按特定负载定制的数据系统”。StreamBase 这类系统为流式事件设计；Vertica 和 ClickHouse 为分析型查询和列存执行设计；Pinecone 为向量召回设计。场景一旦匹配，数据布局、索引结构和执行模型的差别，就可能直接带来 10 倍级的性能差距。
> 
> 但对大多数中早期团队来说，真正需要的往往不是单项性能冠军，而是一个事务可靠、SQL 成熟、生态完备、运维成本可控的默认底座。这就是 Stonebraker 给 Postgres 的现实定位：如果你还没到百万 TPS、PB 级数仓或极端向量检索规模，先用 Postgres 把系统做起来通常是更稳妥的工程选择。等真实瓶颈稳定出现，再引入 ClickHouse、Pinecone 或其他专用系统；过早拆成多种数据库，很多时候先遇到的是复杂度，而不是性能红利。

> [!info]+ 💡 Explanation - Hadoop vs Spanner
> 
> 这里的“Hadoop”更准确地说，是业界用来代称 Google 当年 MapReduce / GFS 那条大数据路线的说法。它擅长的是离线批处理：把大数据集切分到很多机器上，本地 map，再经过网络 shuffle 和 reduce 聚合结果。对日志分析、ETL、索引构建这类“慢慢算一个大结果”的任务很有用，但不适合承担库存、订单、账户余额这类高一致性的在线数据库职责。
> 
> Stonebraker 反感的是，业界一度把这种批处理思路和 eventual consistency 一起包装成通用答案。eventual consistency 允许多个副本暂时不一致，之后再异步收敛；这在少数容忍短时误差的系统里成立，但一碰到强约束业务状态，就会出现“东西海岸同时卖出最后一件库存”这类事故。Google 后来做 Spanner，等于承认高价值分布式系统终究还是要把强一致性、事务和提交顺序认真做回来。Hadoop 代表的是离线算大数据，Spanner 代表的是全球分布式下仍要保证数据库语义。

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