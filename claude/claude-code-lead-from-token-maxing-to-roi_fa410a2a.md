---
tags: [claude-code, cowork, anthropic, routines, agentic-engineering, engineering-management, roi, dogfooding]
source: https://mp.weixin.qq.com/s/34YV97sB5gF-7XAvXzryXw
wiki: wiki/claude/claude-code-lead-from-token-maxing-to-roi.md
---

# Claude Code 工程一号位 Fiona Fung 给 Agent 热潮降温：从狂烧 Token 到算 ROI

## Article Info
- URL: https://mp.weixin.qq.com/s/34YV97sB5gF-7XAvXzryXw
- Platform: WeChat（InfoQ 编译，源自 Lenny's Podcast）
- Title: Claude Code 工程一号位亲自给 Agent 热潮降温：狂烧 Token 时代已过，现在该算 ROI 了
- Channel/Uploader: InfoQ（编译：冬梅）
- Publish date: 2026-06-22
- Interviewee: Fiona Fung（Anthropic Claude Code 与 Cowork 团队负责人，管理 Boris Cherny 及整个工程/PM 团队；前 Microsoft Visual Studio/TypeScript、Meta Facebook Marketplace 创始团队，25+ 年工程经历）
- Interviewer: Lenny Rachitsky（Lenny's Podcast）
- 原视频: https://www.youtube.com/watch?app=desktop&v=Ybrl4FYM57c
- Language: zh

## Executive Summary
Lenny 对话 Anthropic Claude Code/Cowork 负责人 Fiona Fung。背景事实：Anthropic 工程师人均季度代码交付量一年内涨到 **8 倍**，Boris 称“coding is solved”。Fiona 的核心观点是：当写代码不再是瓶颈，瓶颈转移到了别处——**verification（验证质量）、判断优先级、衡量真实产出、管理异步 agent、保持团队文化**。她给出多个可操作机制：用接入全 repo 的 remote Claude Code session 做团队管理回顾；用 **routines** 让 agent 每天早上自动读反馈频道、生成 PR；把“什么是好”框架化进 repo（如 content design skill）让 Claude Code review 自动校验；从 **token maxing 转向 ROI/outcome**（“不要把 motion 当成 progress”）；坚持 dogfooding 甚至先从 IC 做起。她最担心的事不是产品工程，而是高速增长中如何保住团队文化。

## Outline
1. **被 AI 浸透的软件团队** — 8 倍交付量后，瓶颈从写代码转移到验证与角色混合。
2. **新的管理与质量机制** — remote session、routines、把“good looks like”框架化进 repo、AI 做 TDD。
3. **Anthropic 招人画像** — creative builders（产品感）+ deep systems experts（深度系统）。
4. **帮中小企业落地 AI** — 用 Cowork 处理报销/菜单/定价分析，知识就是力量。
5. **下一个前沿：异步协作** — 从同步 prompt → 异步 prompt → routines 派生 agent；high agency = high accountability。
6. **从堆 Token 到算 ROI** — 拒绝 lines of code / token maxing，盯 output→outcome。
7. **亲身 dogfooding 的重要性** — anecdote 胜过 dashboard，leader 也要当用户。
8. **工程就业与教育** — 如何培养下一代工程师、double click 能力、fellowship/apprenticeship。
9. **技术领导的焦虑：文化随规模漂移** — one team mentality、公开谈“不顺利”、JIT planning。
10. **快问快答** — 书/电影/产品/座右铭/AGI 后的梦想。

## Detailed Chapter Summaries

### 1. 被 AI 浸透的软件团队
Fiona 回顾职业弧线：IBM 做 DB2（只用 Vim、终端调试）→ Microsoft Visual Studio（第一次用 IDE/调试器/断点，爱上 dogfooding，用 VS editor 构建 VS editor）→ 软件从“刻 CD 上货架”的硬 deadline 到在线发布。
- 当下的变化：**Coding 不再是瓶颈**。不只工程师，Claude Code 团队的设计师、PM 几乎所有人都在 check in code，提交者更多、角色更混、吞吐更高。
- 由此产生的新问题：如何做 **verification**，确认这些高速生成提交的东西正确且高质量。

### 2. 新的管理与质量机制
Fiona 给出她“AI-pilled 团队”的具体做法：
- **接入全 repo 的 remote Claude Code session**：能看到团队在做什么、访问 Slack 频道与各项指标。每月团队一起打开 Claude Code 回顾“上个月做了什么、发布效果、反馈频道出现了什么”——从“只用来生成 PR/修 bug”升级为“管理与对话工具”。
- 重点是“上线后表现如何、有没有引入 bug”，而非“有没有发出去”。

> “make new mistakes：犯错可以，但要犯新的错误，这样团队才是在学习。如果目标是完全不犯错，可能说明你移动得不够快。”

- **routines（一两个月前推出，彻底改变工作方式）**：把“早上喝咖啡看反馈频道找能帮忙的点”自动化。以前自己写 prompt，现在 routine 像“一个 agent 帮你生成 prompt 甚至生成 PR”——醒来就有摘要 + 可 review 的 PR。反馈来源很多：内部员工、邮件、朋友/LinkedIn/社交平台、合作伙伴。
- **把“good looks like”框架化进 repo**：去年还没有 Claude Code reviews，人类 reviewer 是大瓶颈。做法是把 spec / “什么是好”的定义放进 repo 并与代码同步更新（如最近把 **content design 做成一个 skill**），Claude 在有明确框架后非常擅长按框架验证。
- **AI 做 TDD**：TDD 在 2000 年代流行但“像先吃西兰花”。Fiona 在 Claude Code 上修的第一个 bug 就让 Claude“先写测试→确保失败→再修→让测试通过”。过去测试生成是必须支付的成本，现在可自动化，很多老原则重新有价值。

### 3. Anthropic 招人画像
Fiona 在演讲中给出两类画像：
- **deep systems experts**：刚加入 Claude Code 时团队有很强的 product generalist，但缺系统/分布式系统背景的人——这是“trust but verify”里仍需深度专业能力的地方。
- **creative builders / dreamers**：有产品感，热爱某个产品、有想法、能端到端拥有产品体验并持续看反馈迭代打磨。

#### ambition（野心）的转变
- 工程师过去对新功能第一反应是“太难了”，现在变成“这完全可能，我可以让 Claude Code 去做”——限制从“难度”变成“你能想得多大”。
- 案例：一位非移动端工程师需要把功能扩到移动端，以前会说“我不是 Android 专家做不了”，现在有 Claude 做 partner 就能推进。

#### growth mindset 与恐惧
- 适应 AI 好的人通常更愿带着好奇心进入变化、持续学习。
- 对恐惧的建议是 **lean in**：问“什么在我控制范围内？我能采取哪个行动？”，把“这件事发生在我身上”重构为“这件事是否也可能为我而发生”。
- 亲身故事：高中怕负担不起大学学费，于是去加拿大国家银行做高中生暑期柜员（最讨厌会计也报名），靠这份“生命线”收入读完书；2000 年泡沫破裂后还多做两年柜员。

> Lenny 引用：“你害怕进入的洞穴里，藏着你寻找的宝藏。”

### 4. 帮中小企业落地 AI
Fiona 童年从香港移居加拿大、和不会英语的奶奶一起；一家会讲粤语的小毛线店让奶奶找到了 knitting circle——这是她偏爱小企业的由来。
- 她用 **Cowork** 处理自己讨厌的商务差旅报销，进而想到它对小企业主很有用（朋友常坐在吧台前对着一堆账单做发票/报销）。
- 帮朋友上手 Cowork 的两个超预期发现：onboarding 暴露了好 bug；用法超出想象——开两家餐厅的朋友把杂乱文件夹（“像厨房杂物抽屉”）交给 Cowork 找菜单，还让 Claude 做**本地同类菜系定价的市场分析**，对方反馈“我刚去过西雅图那家餐厅，确实不错”。
- 传播方法：从“AI 真正改变了你哪件事”切入，去问社区/家庭/喜欢的小企业“你有没有想过 AI 也许能帮你做这件事”，否则人与人差距会越来越大。

### 5. 下一个前沿：AI 驱动的异步协作
Fiona 认为下一个前沿是 **async（异步工作）**，抽象层级不断上抬：
- 同步写一个 prompt 等结果 → 异步启动几个 prompt → **设置 routine 让它替你生成 prompts 并派生不同 agents**。
- 过去自动化靠 cron job；现在 routine 会看反馈、发现 bug 或 polish fixes 就启动 agent 去处理，醒来已有 PR 可 review。

#### high agency = high accountability
- 团队重视 agency（每个人都能对问题有自己的想法去解决），但必须配对 **high accountability**：你要解决的问题是什么、假设是什么。两者是同一枚硬币两面。

### 6. 从堆 Token 到算 ROI（风向变了）
Fiona 复盘工程生产力指标的演化与陷阱：lines of code → significant lines of code →（框架更新后代码反而变少）→ PR 落地时间……
- 核心判据：**output 是否真的导向 outcome**。

> “不要把 motion 当成 progress。token maxing 有点像过去看代码行数——看起来动作很多，但它是否真的让你想要的最终结果变好？”

- 方法：先 zoom out 问“我们要解决什么问题、怎么衡量它有没有被解决”，再围绕它做，而不是只盯生产力指标。
- 补充建议：对资深工程师做 **listening tour**（哪些有效/无效/怎么更好），有时比 dashboard 更能激发想法。
- 好指标要能持续 **hill climb**，但要不断问“它还服务你的目标吗”。Facebook Marketplace 早期反例：盯“卖家数量”，但某地区卖家少却有 **power sellers**，用户其实能找到想要的东西——真正目标是“帮人找到需要的东西”。
- 工程经理的新 baseline：大多数 commit 由 Claude 辅助；工程师要强化 **product sense** 成为更强的 product engineer；跨职能 blocker 减少（模型增强了工程师原本不具备的能力）。边界双向模糊：工程师更产品化，其他角色更工程化。

### 7. 亲身试用自家产品的重要性（dogfooding）
Fiona 把 dogfooding 视为“保持产品脉搏”的方式，源自 Visual Studio。
- Facebook Marketplace 案例：离开团队后想卖 MacBook Air，一挂上去就遇到一种以前没发现的新型诈骗——再次证明“用户会用你没想到的方式使用产品”。
- VR/AR 团队案例：她不往代码库提交（怕搞坏 OS），但能稳定复现“奇怪的地面高度问题”，把 dogfooding 时间用于检查体验质量，成为有意义的贡献方式；团队也会感谢 leader 真在用产品。
- 智利增长案例：Marketplace 进拉美在智利效果差，三人带一堆 Android 手机实地，一开机发现**当地 LTE 比美国慢很多，feed 在低速下加载差**——这是巨大增长阻碍。
- 引用 Jeff Bezos：数据与具体个案冲突时，更相信个案。

### 8. 工程就业与教育，未来何去何从
Fiona 坦言“如何培养下一代工程师”是她心里的大问题。
- 担忧：新人可能跳过亲手理解架构/内存分配的阶段，但 **double click（深入理解你依赖的那一层）** 仍重要——真正改进产品/系统的机会往往来自理解更底层。
- 设想：软件工程教育也许会更像 **fellowship / apprenticeship**，把多年踩坑经验压缩传给下一代 builder（现有 internship 多是三个月小项目）。
- 抽象层观点：从二进制→汇编→高级语言，现在也许进入 prompt、Claude thinking message 这类新抽象层；未来更重要的问题是“你要解决什么有意思的问题、构建什么体验、它是否真的产生共鸣/足够好”。
- 案例：她一位用打孔卡起步的前 manager，如今一直给她发“用 Claude Code 做了什么”。
- 对模型能力的指数低估：第一次用 Sonnet 3.5/3.6 做 side project 时还会犯错，抵触者会说“你看它就是不行”，但要经常回头看“以前没跑通、现在可能已成新能力”的事。

### 9. 技术领导的焦虑之源：团队文化随规模扩张
最让 Fiona 睡不着的是**如何保持 Claude Code/Cowork 团队的文化**——one team mentality；文化是活的、体现在如何对待与支持彼此。
- 担心增长中是否能保留多元视角、健康开放的争论、以及“接近终点线时回头看队友需不需要帮助”。
- 噩梦场景：问 manager“情况怎么样”，对方说“一切都很好”，但她知道有问题——“像那个 meme：房间着火了，狗还坐着喝咖啡说 this is fine”。所以反复强调要公开谈“什么不顺利”才有机会解决。
- 借 Airbnb 经验（Lenny）：创始人自上而下持续强调文化与价值观；Sheryl Sandberg 的建议——高速增长带来的文化挑战是“你想要拥有的问题”。

#### 杀掉不再服务你的流程 + JIT planning
- 团队文化明确“允许杀掉不再服务我们的流程”：挑一个你讨厌/噪音大/成本高/很手动的流程，问“它还在实现原本目的吗”。
- 规划演化为 **JIT planning（just-in-time）**：六个月太长；现在用一个小 spreadsheet 列本月优先级、每周 check-in 确认是否仍是本月优先级；大约每六个月把团队聚在一起启动一些主题（themes），但保持对现实变化的感知。

### 10. 快问快答
- **书**：玛格丽特·阿特伍德、村上春树；每年至少重读一次《小王子》。
- **电影**：手机里常存《天使爱美丽》《千与千寻》《风之谷》（Nausicaä 的领导方式影响其领导原则）。Lenny 玩笑：两本顶级管理书是《High Output Management》和《风之谷》。
- **产品**：Whidbey Island 本地小企业 **Sweet Sisters Body Care** 有机洗护（曾因普通洗发水化学成分过敏长痛疹，换用后好转）。
- **座右铭**：工作 “keep it simple”；生活 “in a world where you can be anything, be kind”（疫情期间为和养老院奶奶 FaceTime 临时改了重视的 one-on-one，对方一个小善意意义很大）。
- **AGI 后的梦想**：开一家以奶奶名字命名的毛线店、创造社区，让 Cowork 把杂事自动化。

## Playbook

### 写代码不再是瓶颈——把重心移到 verification
- **Key idea**：人均季度交付量涨到 8 倍后，稀缺的不是写代码，而是验证质量、判优先级、衡量真实产出。
- **Why it matters**：提交者更多、角色更混（设计师/PM 也 check in code），低质量产出会被高吞吐放大。
- **How to apply**：把“什么是好（good looks like）”的 spec 放进 repo 并与代码同步更新（如把 content design 做成 skill），让 Claude Code review 自动校验；重要/需深度专业的区域仍保留人类 review。

### 用 routines 把管理动作异步化
- **Key idea**：从“同步写 prompt 等结果”升级到“routine 替你生成 prompt 并派生 agent”，醒来即有摘要 + 可 review 的 PR。
- **Why it matters**：管理者每天的固定动作（看反馈频道、看谁被卡住、找 polish fixes）可被自动化，抽象层上抬一层。
- **How to apply**：给一个接入全 repo + Slack 的 remote Claude Code session 设 routine 持续关注反馈频道；验证机制可靠后给它更多自主权（“go for it”）。注意代价：异步任务多→context switching 负担上升，需重新 block focus time（Fiona 也未解决）。

### 从 token maxing 转向 ROI / outcome
- **Key idea**：“不要把 motion 当成 progress”——工具使用量只是 action，不等于最终结果变好。
- **Why it matters**：lines of code、token 消耗都是“动作多”的虚假指标（迁移库/更新框架会让代码量误导判断）。
- **How to apply**：先问“要解决什么问题、怎么衡量解决”；好指标要能 hill climb 但要持续问“它还服务目标吗”（参考 Marketplace 从“卖家数量”转向“power sellers / 用户能否找到想要的东西”）。

### high agency 必须配 high accountability
- **Key idea**：给团队自由去发挥（agency），同时要求“你要解决什么问题、假设是什么”（accountability）。
- **Why it matters**：只有 agency 会失焦，只有 accountability 会扼杀主动性。
- **How to apply**：把二者当作一枚硬币两面，在分配宽护栏（wide guardrails）的同时锁定问题定义与假设。

### leader 也要 dogfooding，相信具体个案
- **Key idea**：从亲自当用户遇到的小问题里获得的洞察，常胜过 dashboard（数据与个案冲突时更信个案）。
- **Why it matters**：用户会以你没想到的方式（好/坏）使用产品（Marketplace 新型诈骗、智利低速 LTE feed）。
- **How to apply**：即使不提交代码，也用 dogfooding 时间检查端到端体验；产品难以自用时就去见客户、建立快速反馈循环。

### 杀掉不再服务你的流程
- **Key idea**：明确允许团队砍掉过时流程；规划改为 JIT monthly planning。
- **Why it matters**：领域变化太快，六个月 roadmap 三个月后就没人参考了。
- **How to apply**：挑一个你讨厌/手动/噪音大的流程问“它还实现原本目的吗”；用小 spreadsheet 列本月优先级 + 每周 check-in，每半年聚团队启动 themes。

## Key Numbers

| 数字 / 事实 | 含义 |
|---|---|
| 8 倍 | Anthropic 工程师人均季度代码交付量一年内的增长 |
| 25+ 年 | Fiona 的工程从业年限（IBM→Microsoft→Meta→Anthropic） |
| 11 年 | Visual Studio 是其职业生涯前 11 年最重要的部分 |
| 一两个月前 | routines 推出时间，被她称为“彻底改变工作方式” |
| 3 人 | 智利 Marketplace 实地研究小队规模（带一堆 Android 手机） |
| 20 个 agents | 同时运行时“无穷无尽的检查与 review、要记住每个上下文” |
| 1 个月 / 每周 | JIT planning：月度优先级 + 每周 check-in；六个月被认为太长 |
| 3–6.7（约6个月） | 她六个月前几乎只用 Claude Code，后混用——（注：此为文中“六个月前”时间锚点） |

## Key Quotes

| Quote | Speaker | Context |
|-------|---------|---------|
| “coding is solved。” | Boris Cherny（Fiona 转述） | 写代码不再是瓶颈的背景 |
| “make new mistakes：犯错可以，但要犯新的错误。” | Fiona | 鼓励快速移动与学习 |
| “不要把 motion 当成 progress。” | Fiona | 从 token maxing 转向 outcome |
| “output 是否真的导向 outcome。” | Fiona | 衡量工程 ROI 的核心判据 |
| “high agency 必须对应 high accountability。” | Fiona | 团队自由与负责的平衡 |
| “用户会用你没预料到的方式使用你的产品，不管是好的还是坏的。” | Fiona | dogfooding 的价值 |
| “房间着火了，狗还坐着喝咖啡说 this is fine。” | Fiona | 对“一切都很好”式汇报的噩梦 |
| “in a world where you can be anything, be kind。” | Fiona | 生活座右铭 |

## Source Notes
- Transcript source: WeChat 全文（headless Chromium 渲染提取，正文约 23.1K 字符，未触发 CAPTCHA）
- 内容为 InfoQ 对 Lenny's Podcast 的中文编译；原视频 https://www.youtube.com/watch?app=desktop&v=Ybrl4FYM57c
- 文章为对话体、无时间戳，故 Detailed Chapter Summaries 按主题分段、不含时间码。
- Cookie-auth retry: 未使用
- Data gaps: 引用为中译版，非英文原话逐字。
