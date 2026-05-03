---
tags: [ai-economics, token-economics, ai-infrastructure, supply-chain, anthropic, ai-business, interview, semianalysis]
source: https://mp.weixin.qq.com/s/yQ5Bbjtd4I5Iw87tEJZa6A
wiki: wiki/learning-and-business/if-you-dont-use-more-tokens-ai-race-becomes-resource-war.md
---

# 如果你不用更多Token，就永远逃不出底层：AI竞赛开始变成资源战争

## Interview Info
- URL: https://mp.weixin.qq.com/s/yQ5Bbjtd4I5Iw87tEJZa6A
- Platform: WeChat Official Account / translated podcast interview
- Title: 如果你不用更多Token，就永远逃不出底层：AI竞赛开始变成资源战争
- Account: AI前线
- Author / editor: 冬梅
- Publish time: 2026-05-02 13:31
- Original referenced source: YouTube interview with SemiAnalysis founder Dylan Patel
- Access mode: `public-rendered-via-browser`

## Executive Summary
这篇 InfoQ/AI前线整理的访谈围绕 SemiAnalysis 创始人 Dylan Patel 的一线观察展开：AI 竞争正在从“模型是否够强”转向“谁能获得、支付并高效使用更聪明的 token”。SemiAnalysis 自身的 AI token 年化开销已从几万美元级别升至 700 万美元，约为 2500 万美元薪资成本的 28%，并在芯片逆向、宏观经济建模、能源数据建模等业务中改写了生产函数。Dylan 的核心判断是，需求侧正在拉爆供给侧，模型公司、GPU、内存、CPU、台积电、ASML、PCB 材料等整个 AI 基础设施链条都会进入涨价、延长周期、预付款和资源集中阶段。访谈最后把这种资源战争延伸到机器人、幻影 GDP 和社会反弹：AI 创造的真实价值可能远超统计数据，但公众恐惧和反 AI 抗议也可能快速上升。

## Outline
1. **Token 成本从边际开销变成核心资本开支** - SemiAnalysis 的 token 支出快速涨到 700 万美元年化，并在芯片逆向、经济分析、能源建模中替代大型团队的执行力。
2. **Token 需求暴涨但供给跟不上** - Anthropic 收入从约 90 亿美元跃升到 350-400 亿美元年化，算力没有同步增长，访问权和 rate limit 变成竞争资源。
3. **Mythos、Opus 4.7 与“最聪明 token”的稀缺性** - Dylan 认为前沿模型的价值来自能力上限提升，而不是旧能力降价；Mythos 的单 token 更贵但可能整体更便宜。
4. **执行成本下降后，真正稀缺的是好问题和资源获取** - 企业胜负取决于选择正确问题、把 AI 输出转化为价值、获取资本和算力放大收益。
5. **具身智能会把 token 需求带入物理世界** - 软件世界的突破只是阶段，机器人可能在 6-18 个月内迎来样本高效学习和专业能力包。
6. **Anthropic、OpenAI、Google 的竞争被算力约束重塑** - Anthropic 领先但受限于算力，OpenAI 与 Google 更可能凭激进扩张抢到下一阶段的指数需求。
7. **供给侧瓶颈扩散到内存、台积电、CPU 和材料链** - 内存产能年增长只有 20%-30%，新增供给可能到 2027 年末或 2028 年才落地；CPU 也因 RL 环境和执行层变成低估瓶颈。
8. **幻影 GDP 与社会反弹** - AI 可能创造大量不被 GDP 捕捉的真实价值，同时因为工作替代和神秘化叙事触发反 AI 情绪。

## Detailed Chapter Summaries

### 1. Token costs became a strategic operating line
> **Segment**: article opening through "Token 成本疯涨即将超过员工薪资"

访谈开场把过去的商业约束重新排序：过去执行困难、想法便宜；现在 AI 让执行成本大幅下降，反而要求企业判断哪些想法值得消耗 token。Dylan 用 SemiAnalysis 的账本说明变化速度：去年 AI 订阅还只是几万美元量级，Opus 发布后公司推动非技术人员用 AI 写代码，到访谈时 AI 开销已达 700 万美元年化，而薪资成本约 2500 万美元。

#### Company examples
- **芯片逆向工程实验室**: SemiAnalysis 在俄勒冈投入一年半建设芯片逆向实验室，使用扫描电子显微镜等高端设备。过去材料识别和有限元分析需要团队长期维护，现在一名成员花几千美元 token 做出 GPU 加速应用，部署在 CoreWeave 上，上传芯片图片即可识别铜、钽、锗、钴等材料并生成可视化结构分析。
- **宏观经济建模**: 前大型银行经济学家 Malcolm 用 AI 接入 FRED、就业报告等 API，跑回归分析研究通胀/通缩变量，还分析美国劳工统计局约 2000 项任务，判断哪些可被 AI 完成。他估算当前约 3% 的任务能由 AI 完成，并提出“幻影 GDP”概念。
- **能源市场数据产品**: 负责数据中心能源业务的 Jeremy 连续几周每天花约 6000 美元 token，用 3 周抓取美国发电厂、高压输电线路、需求侧数据，构建美国电网供需可视化。客户对比一家 100 人、做了 10 年的能源数据公司后，认为 SemiAnalysis 的某些维度已经更强。

### 2. Demand is outrunning token supply
> **Segment**: "Token 需求暴涨，但供给跟不上"

Dylan 的需求侧判断明显升级：一旦 AI 深度嵌入工作流，token 消耗不是线性订阅增长，而是指数式吞吐增长。他以 Anthropic 为例，称其年化收入从约 90 亿美元增长到 350-400 亿美元，播客发布时可能到 400-450 亿美元，但算力并没有按同等比例增长。

他进一步推算，即使 Anthropic 把所有新增算力都用于推理，并且不削减研发算力，其毛利率底线也可能在 72% 左右；现实中一部分新增算力还要继续投入 Mythos、Opus 4.7 等研发，所以真实毛利率可能更高。年初泄露融资文件显示 Anthropic 当时毛利率只有 30% 多，Dylan 由此判断需求增长速度远超供给增长速度。

#### Access becomes part of strategy
- 关键问题从“模型贵不贵”变成“有没有访问权”：是否有 Anthropic 客户经理、企业级合同、可提高的 rate limit。
- Dylan 认为 token 已经成为高度稀缺资源，不同企业每个 token 创造的价值不同；用不起前沿 token 的低价值 SaaS 公司会被挤出。
- 这不是单纯成本优化问题，而是企业能否把 token 指向最有价值任务的问题。

### 3. Mythos and Opus 4.7 reframed frontier access
> **Segment**: "Mythos 强大到让Anthropic 不敢公开"

主持人提到自己在飞机上使用模型被 rate limit 卡住，并在 Opus 4.7 发布后立刻想换用新模型。Dylan 认为这种执念很自然，因为经济价值来自能力上限，而不是旧能力变便宜。他提到自己和 Leopold 曾向 Anthropic 联合创始人争取 Mythos 访问权限，说明前沿模型访问权本身已成为稀缺资产。

Dylan 引述流出的 benchmark，认为 Mythos 可能是过去两年里最大的能力跃迁之一。文章称 Mythos 面向部分客户的价格大约是当前 token 成本的 5-10 倍，但 Dylan 认为更聪明的 token 往往能用更少 token 完成任务，因此在不少任务上整体成本反而下降。

#### L4 to L6 engineering jump
- Dylan 说 Anthropic 在 2024-2025 年的目标之一，是让模型达到 L4 软件工程师水平，Opus 4.6 基本实现。
- Mythos 的 benchmark 更接近 L6 高级工程师，且这个能力跃迁只用了约两个月。
- 这种压缩发布周期的机制不是单纯“研究人员变多”，而是 AI 降低了 implementation 门槛，让更多研究想法可以同时实现、测试、迭代。

### 4. The scarce asset moved from execution to judgment
> **Segment**: "这听起来像是一个完全不同的经济体系" through resource concentration discussion

访谈反复回到一个新生产函数：执行变容易后，企业价值由三件事决定。第一，选择正确的问题让 AI 解决；第二，把 AI 产出转化为产品或现金流；第三，获取资源，包括资本、算力和 token。Dylan 认为未来公司可能变成“token 套利”组织：token 本身强大，但收益取决于它被指向哪里。

他也强调资源集中风险。Anthropic 对 Mythos 做选择性开放，主要面向网络安全等场景；未来最强模型可能不会全面开放，而是定向分发给能支付并创造巨大价值的客户。Dylan 举了极端但现实的假设：如果 Ken Griffin 这类资本充足且关系强的玩家每年预购 100 亿美元 token，并要求新模型优先供应，就可能在市场上形成巨大优势。

#### Worker-level implication
- 低阶用法：用 AI 把 8 小时工作压缩到 1 小时，然后停下来。
- 高阶用法：仍工作 8 小时，但用 AI 让产出变成原来的 8 倍，收入可能变成 5 倍。
- Dylan 的警告是，优势窗口还没完全变成标配；如果不能使用 token、创造价值并捕获价值，未来会被资源集中甩开。

### 5. Robotics may become the next token demand wave
> **Segment**: "具身智能将成 AI 领域新的需求爆发点"

Dylan 认为“软件奇点”只是中间阶段，因为大多数经济活动发生在物理世界。软件构建变容易后，下一步会自然扩展到机器人和具身智能。当前机器人难点主要在控制系统、微控制器、执行器和复杂动作控制，主流 vision-language-action 模型的数据效率仍然较低。

他的时间判断很激进：未来 6-18 个月内可能出现真正有意义的突破。到那时，机器人只需要几个示例就能学会叠衣服、搬东西、保持平衡等任务，并可能通过下载“能力软件包”获得擦黑板、叠衣服等专业技能。物理世界生产效率提高会继续带来通缩效应，也会继续推高 token 需求。

### 6. Scaling laws still work, but compute decides who captures demand
> **Segment**: "Anthropic 已经领先了？"

Mythos 让 Dylan 更相信规模法则仍然有效：更大模型和更多算力仍然带来能力跃迁，同时同等能力的成本持续指数下降。关键矛盾是，Anthropic 虽在 Mythos 和 Opus 4.7 上显得领先，但扩张受算力约束；OpenAI 则在 Microsoft、Oracle、SoftBank、Amazon Trainium 等方向更激进地采购资源。

Dylan 认为当前增长更像线性外推，真正的指数爆发取决于下一代模型能力跃迁。如果 OpenAI 或 Google 先达到那个层级，即便毛利率只有 50% 而不是 70% 以上，也可能吃掉几乎所有新增需求。若算力完全充足，类似 Mythos 的模型理论上可能支撑 5000 亿美元级别收入，但现实是算力严重不足。

### 7. The supply chain is repricing every physical bottleneck
> **Segment**: supply-side discussion through CPU bottleneck

供给侧的共同模式是涨价、延长交付周期、预付款和资本回报率提升。GPU 不仅价格上涨，使用寿命也被拉长：过去以为 5 年淘汰的 GPU，现在 3-4 年前的集群还在续约，甚至可能用到 7-8 年。

#### Key bottlenecks
- **内存**: 产能每年大约只能增长 20%-30%。即使 2025 年底需求信号明确并开始扩产，新增产能可能也要到 2027 年末甚至 2028 年才落地。Dylan 认为 DRAM 价格可能再翻倍甚至翻三倍。
- **台积电与逻辑芯片**: 台积电今年资本开支约 500 多亿美元，并继续上调，但晶圆厂建设需要时间。Dylan 认为如果 2028 年台积电资本开支到 1000 亿美元，上游供应链会被鞭子效应放大冲击。
- **设备和材料**: ASML 已经完全卖空；Lam Research、Applied Materials、MKSI 等设备链受益于订单外溢；更细的铜箔、玻纤、激光器等环节也在紧张。
- **CPU**: CPU 是被低估的瓶颈。强化学习需要大量环境运行和评估，AI 生成代码或内容后也要在应用环境中执行。Dylan 把 GPU/ASIC 描述为负责“思考”，CPU 负责“执行”。

### 8. Phantom GDP and public backlash
> **Segment**: final discussion

Dylan 认为最难判断的变量不是训练成本、推理成本或模型公司利润，而是 token 经济学：token 被用来做什么、创造了多少真实价值、价值如何扩散。他提出“幻影 GDP”：AI 让产出增加，同时成本下降更快，所以统计 GDP 可能低估真实价值。比如信息分析服务更便宜、更好，会让客户做出更好投资决策和竞争策略，但这些收益不一定完整进入 GDP。

访谈最后转向社会层面。Dylan 预测未来三个月可能出现大规模反 AI 抗议，因为 AI 收入增长、企业结构变化、工作替代焦虑和社交媒体动员会把恐惧集中到 AI 上。他建议 AI 行业改变沟通方式：少谈遥远未来和“改变一切”，多展示当下如何改善生活；否则公众会把 AI 公司视为神秘小圈子，正在打造可能取代自己的系统。

## Key Numbers

| Number | Context | Why it matters |
|---|---|---|
| 700 万美元 | SemiAnalysis 当前 AI token 年化开销 | AI 从工具订阅变成战略性运营支出 |
| 2500 万美元 | SemiAnalysis 薪资成本 | token 支出已超过薪资成本的 25% |
| 5-15 人 | Dylan 对单人借助 AI 替代工作量的估计 | 企业将重新评估招聘、裁员和 AI 投入 |
| 2000 项任务 | Malcolm 分析的 BLS 任务数量 | AI 可替代性被量化为任务级评估 |
| 3% | Malcolm 当前估算可由 AI 完成的 BLS 任务比例 | 说明自动化还早期，但测量体系已经建立 |
| 每天 6000 美元 | Jeremy 构建能源模型时的 token 消耗 | 高强度 token 投入能在 3 周内重建数据产品原型 |
| 3 周 | 美国电网供需可视化初版完成时间 | 对比 100 人团队、10 年公司的产品积累 |
| 90 亿美元 -> 350-400 亿美元 | Dylan 描述的 Anthropic 年化收入跃升 | 需求增长远超算力供给增长 |
| 72% | Dylan 推算的 Anthropic 毛利率底线 | 高毛利来自 token 稀缺和需求强度 |
| 5-10 倍 | Mythos 对部分客户的 token 价格倍数 | 前沿能力可能更贵但单位任务更省 |
| 6-18 个月 | Dylan 对机器人突破窗口的判断 | token 需求可能从软件扩散到物理世界 |
| 20%-30% | 内存产能年增长上限 | 解释 DRAM 紧缺为何难以快速缓解 |
| 2027 年末 / 2028 年 | 新内存产能可能真正落地的时间 | 供给响应周期远慢于 AI 需求扩张 |
| 500 多亿美元 | 台积电当前年度资本开支量级 | 逻辑芯片扩产已经进入极高资本强度 |
| 1000 亿美元 | Dylan 提到的台积电 2028 年资本开支可能性 | 上游设备材料链会承受更强鞭子效应 |

## Playbook

### Treat token budget as growth capital
- **Key idea**: token 不是“软件订阅费”，而是可购买执行力的资本预算。
- **Why it matters**: SemiAnalysis 700 万美元 token 开销对应的是芯片逆向、经济建模、能源数据等新产品能力，而不是单纯员工效率工具。
- **How to apply**: 对每个 AI 项目记录 token 消耗、产出资产、收入或节省的人力，并把高 ROI 用例升级为正式工作流。

### Move from time compression to output expansion
- **Key idea**: 用 AI 把 8 小时压成 1 小时只是低阶套利，真正机会是 8 小时产出 8 倍结果。
- **Why it matters**: Dylan 判断窗口期尚未完全变成 table stakes，创业者、自由职业者、多项目操盘者更容易捕获额外价值。
- **How to apply**: 把 AI 用在能产生复利资产的任务上，如数据集、研究体系、自动化工具、客户可见产品，而不是只用于邮件和总结。

### Secure access before optimization
- **Key idea**: 前沿模型的瓶颈先是访问权，再是成本优化。
- **Why it matters**: Dylan 建议有预算的企业签 Anthropic 企业合同、按 token 付费、提升 rate limit，而不是依赖普通订阅。
- **How to apply**: 对关键 AI 工作流建立供应商访问计划：企业合同、rate limit、备用模型、任务分级和最强模型的使用准入。

### Watch physical bottlenecks, not only model releases
- **Key idea**: AI 需求会反向重估 GPU、内存、CPU、台积电、ASML、铜箔、玻纤等实体环节。
- **Why it matters**: 内存产能年增 20%-30%，新增供给可能到 2027/2028 年才落地，供需错配会持续影响模型价格和可用性。
- **How to apply**: 分析 AI 公司时，把模型能力、算力采购、供应链交付周期、硬件折旧寿命放在同一张成本与产能表里。

### Communicate present value, not only future shock
- **Key idea**: AI 行业如果只谈“改变一切”，会放大公众恐惧。
- **Why it matters**: Dylan 预测反 AI 情绪会随着收入增长、组织重构和工作替代焦虑快速升温。
- **How to apply**: 对外叙事优先展示当下改善生活和工作质量的具体案例，同时诚实解释工作流变化和再培训路径。

## Key Quotes

| Quote | Speaker | Context |
|-------|---------|---------|
| "想法变得廉价而且泛滥，执行却变得极其容易。" | 主持人 | 开场定义生产函数反转 |
| "现在一年大概花 700 万美元在 AI 上。" | Dylan Patel | SemiAnalysis 的 token 支出变化 |
| "真正重要的，不是你用不用这些模型，而是你有没有访问权。" | Dylan Patel | 讨论 Anthropic 企业合同和 rate limit |
| "单位 token 更聪明。" | Dylan Patel | 解释 Mythos 单价更高但任务成本可能更低 |
| "你能不能执行不再重要。" | Dylan Patel | 概括执行成本下降后的价值转移 |
| "整个供应链都在涨价 + 延长周期 + 预付款。" | Dylan Patel | 总结供给侧现实 |
| "少谈未来，多讲当下。" | Dylan Patel | 对 AI 行业公众沟通的建议 |

## Source Notes
- Transcript source: WeChat article rendered with headless Chromium via `wechat-article-summarizer`.
- Source language: Chinese translation / edited transcript.
- Data gaps: exact podcast timestamps, YouTube metadata, and original English transcript were not extracted; segment labels preserve the article's visible structure rather than exact audio timestamps.
- Caveat: model names and revenue numbers are claims in the extracted article/interview and were not independently verified here.

