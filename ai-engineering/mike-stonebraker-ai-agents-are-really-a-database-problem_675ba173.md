---
tags: [text-to-sql, databases, ai-agents, dbos, postgres, distributed-systems, benchmark, ai-engineering]
source: https://mp.weixin.qq.com/s/sR7X6domCisQ-fsrQkD4rA
wiki: wiki/ai-engineering/mike-stonebraker-ai-agents-are-really-a-database-problem.md
---

# “我可能不再建议学计算机”！图灵奖得主炮轰半个行业，并断言：AI Agent最后全是数据库问题

## Article Info
- URL: https://mp.weixin.qq.com/s/sR7X6domCisQ-fsrQkD4rA
- Title: “我可能不再建议学计算机”！图灵奖得主炮轰半个行业，并断言：AI Agent最后全是数据库问题
- Author: Tina
- Account: InfoQ
- Publish time: 2026-04-30 13:39
- Access mode: public

## Executive Summary
这篇 InfoQ 访谈整理把数据库领域传奇人物 Mike Stonebraker 的核心判断压得非常集中：AI agent 一旦从只读走向读写，本质上就会重新掉回事务、一致性、原子性这些数据库老问题；text-to-SQL 在真实生产数据仓库上离可用还差得极远；而过去二十年数据库行业里很多被包装成“新范式”的东西，其实只是系统约束没有被认真面对。Stonebraker 一路从 Ingres 和 Postgres 的历史，讲到对 Oracle 销售方式、Google MapReduce / eventual consistency、AWS 数据库产品线膨胀的批评，再讲到 DBOS 如何试图把操作系统和工作流状态直接放进数据库里。对 AI 工程师来说，这篇访谈最有价值的部分有两处：一是他用 Beaver benchmark 把真实 world text-to-SQL 的问题打回原形，二是他把 read-write agent 明确翻译成“分布式数据库事务”问题，这个翻译比大多数 agent 口号更落地。

## Outline
1. **Postgres：最好用的起点，不是终点** — 回顾 Ingres / Postgres 的起源，并解释为什么数据库系统必须围绕具体场景可扩展。
2. **索引一出现，GPU 就很难发挥作用** — 解释为什么数据库查询中的索引访问模式天然抵触 SIMD / GPU 加速。
3. **Google 是选错了方向，Amazon 是选太多方向** — 批评 MapReduce、eventual consistency 和数据库产品线膨胀带来的系统性问题。
4. **把 Linux 上半部分，换成数据库** — 介绍 DBOS 如何把应用状态、调度和工作流直接交给数据库来承载。
5. **在真实数据仓库里，LLM 写 SQL 的准确率是 0%** — 用 Beaver benchmark 拆穿公开 text-to-SQL 榜单与真实生产环境之间的落差。
6. **计算机科学，可能不再是增长型行业** — 给出他对职业选择、研究方向和热情的看法。

## Section Summaries

### 1. Postgres：最好用的起点，不是终点

#### Ingres 的起点与商业化
- Stonebraker 回忆，1971 年他在伯克利被 Gene Wong 带进数据库领域，背景是 Codd 关系模型论文发表后的第二年。
- 他们在 1972 年开始做 Ingres，Stonebraker 在 1976 年靠这个项目拿到 tenure。
- 伯克利版 Ingres 一度被约 100 所大学使用，但 Arizona State University 想拿它管理 4 万名学生时，项目因为 Unix 上没有 COBOL 而失败，这逼得他们意识到必须创业、把系统迁移到真正被企业接受的操作系统与支持体系里。

#### Oracle 为什么赢了
- 他对 Oracle 的评价非常尖锐：Larry Ellison 会把“未来会有的功能”包装成“现在已经有的能力”卖给客户。
- 访谈里举的例子是 referential integrity。Ingres 已经实现了，而 Oracle 的手册只是先写两页定义，最后再写一句“尚未实现”。
- 在 Stonebraker 看来，这种“让第一批客户帮你 debug”的销售方式技术上不正当，但商业上非常有效。

#### Postgres 的设计动机
- Postgres 最核心的设计不是“另一个关系库”，而是可扩展类型系统。
- 两个具体失败案例逼出了这个方向：一是 GIS 需要点、线、多边形，Ingres 的标准类型不够；二是债券交易里的“债券时间”要求一个月固定按 30 天计息，而不是公历日期减法。
- 他认为数据库必须允许用户把领域语义直接塞进系统，而不是每次都被迫把数据拿到应用层重算。

#### One size fits none
- Stonebraker 重申他著名的 “one size fits none” 判断：通用数据库通常都不是性能最优解。
- 他用 StreamBase、Vertica、ClickHouse、Pinecone 等例子说明，只要数据库没有为你的场景设计，性能损失往往就是一个数量级。
- 但他也给 Postgres 一个很现实的位置：如果你只是先把东西做起来，不是 100 万 TPS，也不是 PB 级数据仓库，那么默认选 Postgres 仍然非常合理。

### 2. 索引一出现，GPU 就很难发挥作用
- Stonebraker 的核心理由很简单：GPU 擅长 SIMD，而索引访问恰恰是高度分支化、指针跳转式的内存访问。
- 他用 B 树查工资的例子说明这一点：先看根节点，再沿着指针下钻 3 到 4 次，每次都是依赖上一步结果的确定性访问，几乎不适合并行。
- 除了访问模式不匹配，他还提醒了另一个经典系统问题：如果 GPU 只是挂在 CPU 旁边，CPU 与 GPU 之间的总线本身就可能成为瓶颈。
- 当主持人追问 Ingres 里最难写的部分时，他给出的答案直到今天也没变：查询优化器，原因很简单，“因为它真的难”。

### 3. Google 是选错了方向，Amazon 是选太多方向

#### MapReduce 与 eventual consistency
- Stonebraker 对 2000 年代 Google 路线的批评非常明确：Hadoop 效率低得离谱，而 eventual consistency 只适用于极少数场景，却被当成普适原则推销出去。
- 他用东西海岸库存同步的例子解释 eventual consistency 的真实代价：如果西海岸和东海岸同时卖出最后一件商品，异步收敛会让库存掉到 -1，最终就会有一位顾客拿不到货。
- 在他看来，Google 后来做 Spanner，其实等于承认了事务和一致性问题绕不过去。

#### Amazon 的产品线问题
- 他大约三年前去 Amazon 演讲时，当面指出对方同时支持约 15 种数据库，实际需要的大概只有 3 种。
- 他的批评不是“多样化不好”，而是许多数据库功能重叠、性能不占优、市场规模又不足以覆盖维护成本。
- 图数据库是他点名的一类：如果你喜欢图的用户界面，可以在关系数据库之上提供那层模型，但这不代表底层一定该是一套独立图数据库。

### 4. 把 Linux 上半部分，换成数据库

#### 从 Databricks 调度器到 DBOS
- DBOS 的起点来自 Matei Zaharia 的一个观察：Databricks 同时调度上百万 Spark 任务时，操作系统领域的调度器撑不住，最后他们把调度数据放进 Postgres，让一个数据库应用来决定“下一个跑谁”。
- 这让 Stonebraker 团队意识到，操作系统大量工作本质上就是大规模状态管理，而这本来就是数据库擅长的事情。

#### 产品形态
- 他们最初的研究目标很激进：至少把 Linux 的上半部分换成数据库式实现。
- 后来公司化时，风投对“替代 Linux”并不买账，但对把数据库能力直接嵌进编程环境非常感兴趣，于是 DBOS 以 TypeScript、Java、Go、Python 四套无缝接口切入。
- 在 DBOS 的 workflow 模型里，每个小步骤都是事务性的，整个 workflow 是持久化的，而且理论上还能做成整体原子提交。

#### 为什么 agentic AI 会把需求推向数据库
- Stonebraker 说，当前大多数 agentic AI 还停留在 read-only 阶段，例如预测客户质量、输出建议，结果交给人类处理。
- 但只要 agent 进入 read-write 世界，例如把我账户里的 100 美元转到你账户里，问题立刻就变成事务提交、回滚与一致性问题。
- 这也是他判断 DBOS 市场会继续增长的原因：当前大概三分之二客户已经在做 agentic AI，而越往后，真正高价值的应用越不可能只读不写。

> [!info]+ 💡 Explanation - Why Agent Execution Turns Into Transaction Design
> 
> 这段话最容易被轻描淡写地读过去，但它其实是整篇访谈的主轴。Stonebraker 不是在说“数据库很重要”这种空话，而是在做一个系统翻译：当 Agent 只是 read-only 时，失败通常还是认知层面的，例如总结不准、判断偏了、建议需要人工复核；当 Agent 进入 read-write 世界，失败就会变成真实系统事故，例如重复退款、库存变负、订单状态冲突、CRM 脏写、外部接口副作用失控。问题的重心因此从 prompt quality 转移到了 transaction semantics。
> 
> 一个自动退款 Agent 就足够说明这一点。模型也许只负责理解用户意图、抽取订单号和退款原因，但真正执行时，系统还要检查退款政策、生成唯一请求 ID、调用外部支付渠道、更新内部账务和订单状态、最后再发送通知。只要任一步和其他步骤脱节，就会出现半完成状态：外部已经退款，但内部系统没有记账；内部标记已退款，但支付渠道其实失败；系统超时重试后又重复退了一次。到这里，问题已经不是“模型会不会思考”，而是“系统有没有原子性、一致性、幂等和故障恢复”。
> 
> 这也是为什么生产级 Agent 至少要补上几类数据库世界的纪律：显式状态机与持久化检查点，用来回答“现在做到哪一步”；幂等键和去重逻辑，用来处理超时与重试；并发控制，用来避免两个 Agent 或一个人加一个 Agent 同时改同一条记录；补偿或回滚机制，用来处理跨多个系统的部分成功；以及审计日志和人工接管能力，用来回答“谁在什么上下文下改了什么”。这些东西不会让 Agent 看起来更聪明，但决定了它能不能真正进生产。
> 
> 从这个角度看，Stonebraker 对 Agent 的判断和 [[demis-hassabis-agents-agi-virtual-cells]] 里 Hassabis 的判断刚好互补。Hassabis 关注的是持续学习、长期记忆和推理纠错，所以 Agent 的“大脑”还不够成熟；Stonebraker 关注的是事务、一致性和状态管理，所以 Agent 的“后端骨架”还不能省略。真正高价值的 Agent，需要同时解决这两层问题。

### 5. 在真实数据仓库里，LLM 写 SQL 的准确率是 0%

#### 公开 benchmark 与真实环境的断层
- Stonebraker 说，他们过去三年一直在研究 text-to-SQL，并在 4 个真实生产数据仓库上构造了 benchmark。
- 公开榜单上，Spider、Bird 这类 benchmark 的最好系统已经能到 80% 甚至 85% 准确率，看起来像是“快能上生产了”。
- 但他们自己的结果完全不同：原始准确率是 0%，加上 RAG 后是 10%，把 `from` 子句和 join 条件直接喂给模型，也只有 35%。
- 他给出的人类基准则是：只要先把自然语言歧义澄清，一个懂 SQL、看得懂 schema 的工程师准确率能到 90% 以上。

| Setting | Accuracy |
|---|---|
| Spider / Bird 最佳系统 | 80% - 85% |
| Beaver 原始测试 | 0% |
| Beaver + RAG | 10% |
| Beaver + from / join hints | 35% |
| 熟练人类工程师 | 90%+ |

#### 为什么会差这么多
- 第一，真实数据仓库的数据不在模型训练语料里，而很多业务概念又非常本地化，例如 MIT 的 “J-term”。
- 第二，真实 SQL 的复杂度完全不是一个量级：公开 benchmark 可能只是 10 到 20 行，而真实数据仓库的 SQL 经常是 100 行起步。
- 第三，真实 schema 一团乱麻：物化视图大量冗余，列名充满缩写和下划线，根本不像 Spider 那样干净直观。

#### Beaver 与他偏好的系统路线
- 他们把匿名化后的真实 benchmark 公开成 Beaver，意图很明确：如果谁觉得自己真的解决了 text-to-SQL，就来跑一个更像现实世界的 benchmark。
- Stonebraker 认为，真正可行的路线不是让 LLM 直接在多个异构结构化源上自由拼接，而是先把检索结果拆成更简单、显式包含 `from` 和 join 条件的片段。
- 更进一步，SQL、CAD、法规文本这些异构数据最好尽量都转成表，再用近似查询优化器的方式做 join。
- 慕尼黑交通部门的例子很具体：同一个投诉答复流程需要联结电车时刻表、信号灯时序、路口 CAD、联邦法规和市级法规，Stonebraker 的解法依旧是“尽可能表化”。

### 6. 计算机科学，可能不再是增长型行业
- 访谈结尾最出圈的一句是：如果今天重新开始，他不确定还会不会建议 18 岁的人去学计算机。
- 他认为医疗保健、建筑和维修类工作更安全，而很多传统计算机岗位的增长前景没过去那么确定。
- 对已在科研路径上的人，他给的建议仍很老派但很有操作性：先去拿最有声望的职位，找一个愿意带你的导师，再挑一个不随大流的方向。
- 至于“追随热情，钱会自己解决”，他说自己并不完全相信这句话，但仍认为至少不要把一生花在完全没有热情的谋生手段上。

## Key Numbers

| Item | Value | Why it matters |
|---|---|---|
| Ingres 开始时间 | 1972 | 说明他谈的很多判断来自 50 年级别的一线数据库经验。 |
| Tenure 时间 | 1976 | Ingres 直接决定了他早期学术生涯。 |
| Arizona State 数据规模 | 40,000 students | 真实商业化压力来自可用性与生态，而不只是学术原型能否跑起来。 |
| 伯克利版 Ingres 采用规模 | ~100 universities | 说明 Ingres 在学界曾经非常成功，但仍不足以直接进入企业。 |
| Amazon 支持的数据库数 | ~15 systems | Stonebraker 认为其中大约只有 3 种真正必要。 |
| DBOS 客户中 agentic AI 占比 | ~2/3 | 说明 read-write workflow 需求已经在真实市场里出现。 |
| 公开 text-to-SQL 榜单 | 80% - 85% | 公开 benchmark 给人的可生产错觉非常强。 |
| Beaver 原始准确率 | 0% | 真实数据仓库环境下的断层远超直觉。 |
| Beaver + RAG | 10% | 仅靠检索补充并不能解决根本问题。 |
| Beaver + from / join hints | 35% | 即使把关键结构信息显式喂给模型，距离生产仍很远。 |
| 熟练工程师准确率 | 90%+ | 人类在真实 schema 理解上的优势仍然巨大。 |
| 真实 SQL 复杂度 | 100+ lines | 这是公开 benchmark 和生产环境差距的关键原因之一。 |
| 慕尼黑交通团队规模 | 6 full-time staff | 小团队也有强烈动力把跨源查询自动化。 |

## Key Takeaways
- Stonebraker 对 agentic AI 的最核心翻译是：只要系统要读又要写，它最后就会掉回事务、提交、回滚和一致性这些数据库老问题。
- Postgres 的历史价值不只是“一个成功开源项目”，而是它把 GIS、债券时间这类真实业务语义转进数据库内核，证明数据库必须围绕具体场景扩展。
- 他对 Google 的批评并非反大厂姿态，而是一个系统工程师的老判断：MapReduce 和 eventual consistency 在很多场景里都是用效率或正确性换来错误的抽象。
- 他对 Amazon 的批评也很直接：产品线过多不是繁荣，而可能是对重叠能力和维护成本的不负责任。
- DBOS 的逻辑很值得 AI 工程师重视，因为它把 workflow、持久化和事务性当作应用运行时的默认属性，而不是业务代码里到处手写补丁。
- text-to-SQL 的最大问题不是模型“差最后一点”，而是公开 benchmark 和真实生产 schema 根本不是一个难度等级。
- Beaver benchmark 给出的 0% / 10% / 35% 对比，是这篇访谈里最硬的现实提醒：如果没有真实数据、真实 schema 和真实工作负载，榜单分数几乎没有意义。
- 他对职业选择的悲观判断虽然刺耳，但本质还是在强调：真正难被替代的是懂系统约束、能选对方向、愿意在非主流问题上深挖的人。

## Insights
- 这篇访谈把“数据库知识会不会在 agent 时代过时”反过来回答成了“agent 时代更像数据库问题”，这是非常重要的范式修正。
- Stonebraker 对 Beaver 的设计揭示了一个常见工程错误：把在干净 benchmark 上的高分，误判成可直接迁移到脏数据仓库的产品能力。
- 从 DBOS 角度看，workflow engine、runtime 和数据库的边界正在收缩，未来很多“应用框架”可能会内建事务性与持久化语义。
- 他不断用具体反例反 hype：库存负数、债券时间、MIT J-term、100 行 SQL，这些例子比抽象口号更能说明系统世界的真实阻力在哪里。

## Caveats
- 这是 InfoQ 对长访谈的中文整理稿，文字中保留了较强编辑风格和标题党包装，原始英文访谈语气可能更克制。
- Stonebraker 的判断带有强烈个人立场，例如对 Oracle、Google、AWS 的批评都非常直接，阅读时应把“观点强度”和“事实锚点”分开看。
- WeChat 页面提取后正文被压成连续文本，但编号结构和关键数据点仍然完整可辨。

## Sources
- https://mp.weixin.qq.com/s/sR7X6domCisQ-fsrQkD4rA
- https://www.youtube.com/watch?v=YPObBOwIrHk