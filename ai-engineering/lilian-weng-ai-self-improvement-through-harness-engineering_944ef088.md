---
tags: [harness-engineering, recursive-self-improvement, ai-agents, context-engineering, agentic-workflows, lilian-weng]
source: https://mp.weixin.qq.com/s/srIrfqeCC9P9v6LmO8JY8A
wiki: wiki/ai-engineering/lilian-weng-ai-self-improvement-through-harness-engineering.md
---

# 刚刚，翁荔博客又上新：通过Harness工程实现AI自我提升

## Article Info
- URL: https://mp.weixin.qq.com/s/srIrfqeCC9P9v6LmO8JY8A
- Title: 刚刚，翁荔博客又上新：通过Harness工程实现AI自我提升
- Author: 翁荔（Lilian Weng）原作；机器之心/MLNLP 社区整理翻译
- Publish time: 2026-07-08
- Access mode: `public`
- 原文博客: https://lilianweng.github.io/posts/2026-07-04-harness/

## Executive Summary
这篇文章整理翻译了 Lilian Weng 的《Harness Engineering for Self-Improvement》，核心问题是：递归式自我提升（RSI）近期更可能先发生在模型权重里，还是发生在模型外部的 Harness 里。文章把 Harness 定义为围绕基础模型的运行时系统：它决定模型如何规划、调用工具、管理上下文、保存状态、评估结果，并通过工作流或代码搜索改进自身。重点不在单个提示词技巧，而在 ACE、MCE、Meta-Harness、Self-Harness、AlphaEvolve、DGM 等工作如何把上下文、工作流、工具权限、记忆和评估变成可优化对象。最后的判断很克制：Harness 自我优化已经能在有清晰评估器的任务上前进，但弱评估、记忆生命周期、负面结果、多样性坍缩、奖励作弊和长期成功仍是核心瓶颈。

## Outline
1. **递归式自我提升与 Harness 的位置** — 从 Good 1965 和 Yudkowsky 2008 出发，说明近期 RSI 不一定先表现为模型改写权重，而可能表现为部署系统自我改进。
2. **Harness 设计模式** — 把 Harness 从「LLM + 记忆 + 工具 + 规划」扩展为工作流、评估、权限控制和持久化状态管理的运行时系统。
3. **上下文工程** — ACE、MCE 和 Meta-Harness 展示从结构化上下文、技能演化到 Harness 代码优化的演进。
4. **工作流设计** — AI Scientist、ScientistOne、Autodata、ADAS 和 AFlow 代表从专家手工流水线到自动搜索工作流的路径。
5. **自我提升型 Harness** — STOP 和 Self-Harness 把「改进器」或 Harness 自身作为优化目标，并用失败聚类、候选提议、held-in/held-out 验证控制更新。
6. **进化搜索** — Promptbreeder、GEPA、AlphaEvolve、ThetaEvolve、ShinkaEvolve、DGM 和 Hyperagents 用变异、选择和新颖性维护搜索大型程序空间。
7. **与模型权重的联合优化** — SIA 尝试让反馈智能体决定更新 Harness 还是更新模型权重，但证据仍初步。
8. **未来挑战与基准测试** — 评估者弱、记忆生命周期长、负面结果少、多样性坍缩、奖励作弊、长期目标和人类监督仍未解决；附录列出 PaperBench、CORE-Bench、ScienceAgentBench、RE-Bench、MLE-bench、KernelBench 等基准。

## Section Summaries

### 1. 递归式自我提升与 Harness 的位置
文章从 I. J. Good 1965 年对「超级智能机器」的定义讲起：如果机器能设计出更好的机器，就可能触发智能爆发。Yudkowsky 2008 年把这个反馈循环称为递归式自我提升，即 AI 使用当前智能去改进产生这种智能的认知机制本身。

在现代 AI 里，这个循环可以是模型直接改写权重，也可以是模型改进训练流程、评测流程或部署系统。翁荔特别强调「部署系统」的重要性：Claude Code 和 Codex 这类编程智能体说明，原始模型与真实任务之间的 Harness 层对最终能力有接近模型本体的影响。Harness 负责把模型的思考、工具调用、上下文、产物存储和结果评估组织成可执行系统。

### 2. Harness 设计模式
文章把早期智能体公式「LLM + 记忆 + 工具 + 规划 + 行动」扩展为更工程化的 Harness：它还包含工作流设计、循环工程、评估、权限控制和持久化状态管理。核心类比是操作系统：Harness 应该封装复杂逻辑，同时暴露简洁接口；随着行业成熟，配置、工具接口和协议也会逐步标准化。

#### 工作流自动化
工作流让模型能在「规划 -> 执行 -> 观察/测试 -> 改进」循环中运行、测试并迭代。Karpathy 的 autoresearch 仓库被作为清晰范例；Codex 式智能体循环也说明，模型不是靠静态提示词模板运行，而是在智能体运行时里读取工具结果、分析失败轨迹并继续行动。

#### 文件系统作为持久化记忆
长时程任务会产生实验日志、代码 diff、论文摘要、错误追踪和运行轨迹，这些内容很快超过上下文窗口。文章主张 Harness 不应把一切塞进上下文，而应把丰富状态保存在文件系统中；LLM 已经擅长用 bash 读取、写入和编辑文件，因此文件是随基础模型能力一起变强的记忆介质。

#### 子智能体与后台任务
主智能体可以派生子智能体并行探索假设、跑实验或执行隔离子任务。关键不是简单并发，而是让并行性显式、可检查、可恢复：子智能体结果应保存为文件、日志和状态记录，否则只存在于短暂上下文中的输出很快会过时且难以追溯。

#### 编程智能体案例
Claude Code、Codex、OpenCode 和 Cursor 风格智能体的核心接口正在趋同：它们像人类开发者使用 IDE 一样，用工具进入代码仓库、编辑文件、运行测试、读取错误并迭代修复。文章的判断是，近期 RSI 不太可能直接从模型改权重开始，而更可能从「改进获得更好答案的机制」开始。

### 3. 上下文工程
如果把工具返回、模型输出和历史记录全部堆进上下文，长任务很快会失控。上下文工程的目标是构建结构化、简洁的上下文，并管理持久化状态；长上下文模型能力会进步，但上下文组织本身仍可能成为智能的一部分。

#### ACE：把上下文当作 playbook
Agentic Context Engineering（ACE; Zhang et al. 2025）把上下文视为持续演化的 playbook，而不是越写越长的提示词。它包含三个角色：生成器根据已有要点执行任务，反思器从成功和失败轨迹提炼洞见，策展器以「标识符 + 描述」的条目形式增量更新上下文。为避免重写时发生上下文坍缩和简短偏见，ACE 不重写整段提示词，而是用确定性逻辑合并结构化条目，并定期精炼去重。

#### MCE：分离机制与内容
Meta Context Engineering（MCE; Ye et al. 2026）进一步区分「如何管理上下文」和「上下文里有什么」。一个技能被定义为上下文函数，包含静态组件（提示词、知识库、代码库）和动态算子（搜索、筛选、过滤、格式化）。外层元智能体搜索更好的技能，内层上下文工程智能体在技能指导下为具体任务优化上下文。实现上，专属目录里的 `skill.md`、上下文文件和执行轨迹共同构成上下文函数。

#### Meta-Harness：优化存储、检索和呈现信息的代码
Meta-Harness（Lee et al. 2026）把 Harness 代码本身变成优化对象：一个编程智能体提出新 Harness，执行历史通过文件系统暴露，候选 Harness 各有目录，里面包含源代码、评分、轨迹和状态更新。它的关键转变是：一旦 Harness 设计成为可执行搜索空间，足够强的编程智能体就能使用与人类工程师相同的软件设计空间。

### 4. 工作流设计
自动化研究是工作流设计的代表场景。AI Scientist（Lu et al. 2026）覆盖提出研究想法、写代码、跑实验、分析结果、写论文和执行同行评审。ScientistOne（Meng et al. 2026）把可验证性作为核心约束，要求引用、数值、方法和结论都能追溯到证据来源，并接受证据链检查。

Autodata（Kulikov et al. 2026）把一个数据科学家角色拆成出题者、弱解题者、强解题者和验证者/评判者，用于生成强模型能解而弱模型不能解的合成训练和评估数据。但文章指出，若合成任务只用来微调弱解题者而不迭代改进强模型本身，这更像间接蒸馏，RSI 意味较弱。

工作流空间太大，不能只靠专家手工设计。ADAS（Hu et al. 2025）把智能体设计表述为元智能体搜索：从 CoT、自我修正等简单工作流初始化档案库，元智能体参考已有方案生成新工作流的高层描述并实现为代码，再经两轮自我修正检查新颖性，评估成功后加入档案库。AFlow（Zhang et al. 2025）把工作流表示为图，节点是 LLM 调用，边是代码逻辑，并用 MCTS 在候选树上搜索；问答、代码和数学任务实验显示它优于手工工作流和 ADAS。

### 5. 自我提升型 Harness
文章强调 Harness 本质上是代码：提示词、工具调用、子智能体、控制流、记忆和工作流逻辑都由代码规定。如果 LLM 能优化执行智能体所依赖的代码，它能触及的设计空间远大于手写提示词。

Self-Taught Optimizer（STOP; Zelikman et al. 2023）是递归式脚手架改进的早期例子。STOP 的目标不是直接改进某个方案，而是改进「改进器」本身。实验中，改进器发现了遗传算法、任务分解、多臂老虎机式提示选择、模拟退火、温度调节、集束/树搜索等策略。一个重要警告是：GPT-4 能通过迭代提升下游平均表现，但 GPT-3.5 和 Mixtral 等较弱模型反而变差，说明递归结构不够，基础模型必须足够强。

Self-Harness（Zhang et al. 2026）使用「弱点挖掘 -> 有边界的 Harness 提议 -> 验证」循环更新 Harness。弱点挖掘阶段会聚类失败案例，并要求记录终端验证原因、相关智能体行为的因果状态和执行轨迹暴露的抽象机制。提议阶段只允许在有边界的可编辑部分内修改，并提供当前 Harness、验证过的失败模式、应保留行为和历史尝试摘要。验证阶段在 held-in 数据上检查弱点是否修复，在 held-out 数据上检查是否引入未知回归；只有两者都没有回归的候选方案才被接受。Terminal-Bench-2 上的实验覆盖 MiniMax M2.5、Qwen3.5-35B-A3B 和 GLM-5，展示了模型特异性 Harness 指令可以提升 held-out 通过率。

文章也提出安全担忧：如果允许程序编辑操作系统层面的内容，抽象边界会被打破；可编辑范围、权限控制和安全层应当独立存在于自改进循环之外。

### 6. 进化搜索
进化搜索适合搜索空间巨大、梯度不可得、但评估相对容易的场景，Harness 搜索正符合这些条件。Promptbreeder（Fernando et al. 2023）不仅进化任务提示词，也进化用于变异提示词的「变异提示词」。GEPA（Agrawal et al. 2025）则用自然语言反思试错轨迹，提出新的提示词更新。

AlphaEvolve（Novikov et al. 2025）维护候选程序池，让冻结权重的 LLM 生成改进 diff。提示词包括父代程序、结果、指令和元信息；需要进化的区域用 `EVOLVE-BLOCK-START` 与 `EVOLVE-BLOCK-END` 标注；元提示词也会与解程序一起演化。消融实验显示，进化流程、上下文、元提示词、全文件级进化和更强 LLM 都各有价值。

ShinkaEvolve（Lange et al. 2025）增加三个组件以提高采样效率：平衡表现排名和子代数量的父代采样策略、基于 embedding 余弦相似度的代码新颖性拒绝采样、记录成功模式的元便签本。Darwin Gödel Machine（DGM; Zhang et al. 2025）则明确让 LLM 编程智能体修改自己的 Harness 代码库。以 Claude 3.5 Sonnet 和简单初始 Harness 为基础，DGM 在 SWE-bench Verified 从 20% 提升到 50%，在 Polyglot 从 14.2% 提升到 30.7%。

文章指出，这类方法在评估清晰的领域效果好，例如矩阵乘法、GPU 内核优化、算法竞赛和数据中心调度；但在评估慢、模糊、依赖启发式判断的领域会遇到困难。

### 7. 与模型权重的联合优化
Harness 演化改变的是模型周围的非参数系统，而完全意义上的自我提升也可能更新模型权重。SIA（Hebbar et al. 2026）尝试把 Harness 改进和参数更新纳入同一循环：元智能体提出初始 Harness，任务专属智能体执行任务，反馈智能体根据近期轨迹决定下一步更新 Harness 还是模型权重。

文章认为方向有趣但证据初步。一个问题是实验中任务专属智能体使用的 gpt-oss-120b 弱于元智能体和反馈智能体使用的 Claude Sonnet 4.6，基线也偏弱，导致横向比较不够干净。训练稳定性和 Goodhart effect 仍是未解决问题。

### 8. 未来挑战与基准测试
文章对自动化研究保持清醒：产出论文不等同于科学发现。Trehan & Chopra（2026）用 read_file、write_file、llm_search、list_files 四个基础工具测试 LLM 从研究想法到论文的能力，三个领域各包含 45 到 50 篇种子文献，最终只有四个想法进入完整流水线，只有一个完整执行成论文。观察到的六类失败包括：训练数据默认设定偏向、执行压力下实现偏移、记忆和上下文退化、过度乐观、领域智能不足、科学品味不足。

文章列出七个瓶颈：

- **弱且模糊的评估者**：自我提升循环最适合客观、快速、可测的任务；研究品味、新颖性和长期科学价值难以衡量。
- **上下文与记忆生命周期**：自主智能体的记忆会持续增长，Harness 必须管理记忆，而不是只依赖长上下文。
- **负面结果**：训练数据和文献都偏成功案例，系统需要保存失败尝试，因为失败能缩小任务搜索空间。
- **多样性坍缩**：进化式和强化学习式循环会利用已知高回报模式，开放式研究尤其需要防止种群坍缩。
- **奖励作弊**：单元测试、评判模型和基准分数都可能被过拟合或利用漏洞。
- **长期成功**：编程智能体能完成眼前任务，但很难用短期沙盒奖励捕捉可维护性、职责边界、迁移成本、向后兼容性和未来调试负担。
- **人类角色**：人类应在技术栈中上移，在正确时机和正确抽象层级提供监督，而不是被排除在循环之外。

附录列出多组基准：PaperBench、CORE-Bench、ScienceAgentBench、RE-Bench、MLE-bench 和 KernelBench，用于衡量论文复现、计算可复现性、科学发现、真实 ML 研究工程、Kaggle 式机器学习工程和 GPU kernel 生成。

## Key Numbers
| 项目 | 数值 |
|---|---|
| Lil'Log 上一次更新间隔 | 之前断更 13 个月；本次距上一篇《谨慎对待 Scaling Law》不到 10 天 |
| RSI 概念脉络 | Good 1965；Yudkowsky 2008 |
| Trehan & Chopra 种子文献 | 3 个领域，每个领域 45-50 篇 |
| Trehan & Chopra 完整流水线 | 4 个想法进入完整流水线；1 个完整执行成论文 |
| DGM on SWE-bench Verified | 20% -> 50% |
| DGM on Polyglot | 14.2% -> 30.7% |
| PaperBench | 复现 20 篇 ICML 2024 Spotlight/Oral 论文；8316 条评分细则 |
| PaperBench 当时最佳模型 | Claude 3.5 Sonnet 约 21%，未超过机器学习博士水平 |
| CORE-Bench | 90 篇论文，270 项任务；最难任务上 GPT-4o/GPT-4o-mini 仅 21% 准确率 |
| ScienceAgentBench | 44 篇同行评审出版物，102 项任务 |
| RE-Bench | 7 个开放式 ML 研究工程环境；每个环境最多 8 块 H100 GPU |
| RE-Bench 人类数据 | 61 位专家，71 次尝试，每次 8 小时 |
| RE-Bench 人类表现 | 82% 尝试取得非零分；24% 达到或超过强参考方案 |
| RE-Bench 时间预算现象 | 2 小时预算下最佳 AI 得分为人类 4 倍；8 小时和 32 小时下人类反超 |
| MLE-bench | 75 个 Kaggle 竞赛；o1-preview + AIDE 在 16.9% 竞赛达到至少铜牌 |
| KernelBench | 250 个 PyTorch 任务，指标为 fast_p |

## Key Takeaways
- Harness 是模型外部的运行时系统，不只是提示词模板；它把工具调用、上下文、文件状态、评估、权限和恢复机制组织成可迭代的软件系统。
- 近期 RSI 更可能从 Harness 侧发生，而不是模型一开始就直接改写权重；Claude Code 和 Codex 式编程智能体已经证明部署系统对最终能力的影响很大。
- 文件系统是长时程智能体的关键记忆介质：实验日志、代码 diff、错误追踪和历史轨迹应成为可恢复、可审计的文件，而不是短暂上下文里的文本。
- ACE 用「标识符 + 描述」的结构化 playbook 防止上下文坍缩；MCE 把上下文管理机制变成可演化技能；Meta-Harness 进一步搜索决定信息存储、检索和呈现的代码。
- 工作流搜索正在从专家手写走向算法化：ADAS 用元智能体生成并评估工作流，AFlow 用 MCTS 搜索图结构工作流，在问答、代码和数学任务上优于手工方案与 ADAS。
- Self-Harness 的安全设计重点是有边界修改和 held-in/held-out 回归测试；否则 Harness 自编辑很容易越过权限边界或奖励作弊。
- DGM 的量化结果很强：固定 Claude 3.5 Sonnet 与简单初始 Harness，SWE-bench Verified 从 20% 到 50%，Polyglot 从 14.2% 到 30.7%，说明代码级 Harness 进化能产生实质收益。
- 自动化研究的核心瓶颈不是「能不能写论文」，而是评估弱、记忆退化、负面结果缺失、科学品味不足和长期目标无法被短期奖励捕捉。

## Insights
- Harness 自我提升的真正对象不是单次答案，而是「产生答案的机制」；这比优化提示词更接近软件工程里的运行时、测试、状态管理和权限设计。
- 文件系统记忆与执行轨迹审计是自改进循环的基础设施：如果失败只留在对话里，就无法聚类、回归测试或形成下一代 Harness 的训练信号。
- 评估器是 RSI 的瓶颈。矩阵乘法、GPU kernel、算法竞赛这类任务适合进化搜索，是因为适应度容易量化；开放式科学问题难得多。
- Self-Harness 的 held-in/held-out 验证思路值得迁移到日常 agent 开发：修一个反复弱点之前，先定义「修复集」和「不回归集」，否则改动容易变成局部过拟合。
- 人类监督不会消失，而是上移：从直接执行任务转向定义边界、审计轨迹、设计评估、判断长期维护成本和科学价值。

## Caveats
- 本文为机器之心/MLNLP 对 Lilian Weng 原博客的中文整理翻译，精确措辞、公式和图示应以原博客为准。
- 提取文本中多处图、公式和框架图仅保留标题或文字说明，本文不补写图片中未提取出的细节。
- 若干 2026 年论文和基准结果按原文列示，未在本次处理里独立复核论文版本。
- 原文末尾含技术交流群邀请等公众号附属内容，未纳入技术总结。

## Sources
- https://mp.weixin.qq.com/s/srIrfqeCC9P9v6LmO8JY8A
- https://lilianweng.github.io/posts/2026-07-04-harness/
- 主要引用文献：Good 1965; Yudkowsky 2008; Zhang et al. 2025/2026; Ye et al. 2026; Lee et al. 2026; Lu et al. 2026; Meng et al. 2026; Kulikov et al. 2026; Hu et al. 2025; Zelikman et al. 2023; Novikov et al. 2025; Lange et al. 2025; Hebbar et al. 2026; Trehan & Chopra 2026
