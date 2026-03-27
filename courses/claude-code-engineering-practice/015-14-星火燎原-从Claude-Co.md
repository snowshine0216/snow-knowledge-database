# 14｜星火燎原：从Claude Code到行业开放标准

## 章节元数据
- 课程名（EN）: claude-code-engineering-practice
- 课程名（ZH）: Claude Code 工程化实战
- 章节: 
- 作者: 黄佳
- 文章 ID: 952321
- 来源: https://time.geekbang.org/column/article/952321

## 康奈尔笔记

### 线索栏（问题）
- 本章的核心论点是什么？
- 本章开场提出了哪些背景、问题与动机？
- “谁在用：四层采纳矩阵”这一部分的关键观点是什么？
- “谁在用：四层采纳矩阵”有哪些支撑证据或案例？
- “主题3”这一部分的关键观点是什么？
- “主题3”有哪些支撑证据或案例？
- “主题4”这一部分的关键观点是什么？
- “主题4”有哪些支撑证据或案例？

### 笔记栏
#### 概览
- 释题：星火燎原。一个 Markdown 文件格式，用百天时间从一个产品特性变成行业开放标准。这不是偶然——它揭示了 AI Agent 生态中，什么样的机制能活下来，什么样的知识能跨越边界。
- 你好，我是黄佳。前面几讲，我们从结构设计、渐进式披露到高级模式，把 Skills 的工程能力掰开揉碎讲了个透。
- 但如果我们只停留在“怎么写好一个 SKILL.md”，就会错过一个更大的故事。
- 2025 年 10 月，Anthropic 在 Claude Code 里上线了 Skills。那时候没人觉得这是什么大事——不过是一个 Markdown 文件里写写指令嘛。
- 2026 年 2 月，27+ Agent 平台原生支持这个格式。52,000+ Skills 被注册。Top Skills 单个安装量突破 180,000。
- 从一个产品特性到行业开放标准，Skills只用了不到百天。

#### 谁在用：四层采纳矩阵
- 知道了时间线，接下来看采纳范围。截至2026年为止的 27+ 平台并不是简单的堆砌数字，它们呈现出清晰的分层结构。
- 当 OpenAI 的 Codex CLI 和 Google 的 Antigravity 都支持你的格式时，这已经不是“一家公司的功能”了——它是事实标准。
- 与此同时，Anthropic 还在 claude.com/connectors 上线了 Skills 目录，第三方合作伙伴发布了官方 Skill 包：
- 企业级管理方面，Anthropic 的 Team/Enterprise 计划支持管理员集中配置 Skills——控制哪些 Skills 可用，同时让员工自定义自己的工作流。

#### 主题3
- 原始小节标题：Skills 出圈的三个本质属性
- 刚刚我们了解了“发生了什么”，更重要的问题是“为什么”。为什么是 Skills 出圈，而不是 SubAgents、不是 Hooks、不是 Plugins？
- 答案藏在 Skills 的三个本质属性里。
- 第一，声明式（Declarative）。 Skills 的载体是纯 Markdown 文件——YAML frontmatter 加 Markdown 正文。没有编程语言，没有 import/require，没有编译和构建步骤。这意味着什么？任何能读 Markdown 的系统都能理解一个 Skill。不需要 Python 运行时，不需要 Node.js 环境。Claude 能读，GPT 能读，Gemini 也能读——因为它们都能读 Mar
- 如果 Skills 是用 Python 类定义的（像 LangChain 的 Tool），那每个平台都需要一个 Python 运行时、兼容的 SDK、和特定的加载逻辑。切换平台就等于重写代码。
- 第二，自包含（Self-contained）。 一个 Skill 就是一个文件夹。它不依赖任何外部注册中心，不需要在某个平台注册，不需要安装特定的 runtime，不需要配置 API key，不需要连接外部服务。复制这个文件夹到任何支持 Skills 的 Agent 环境，它就能工作。这就是为什么 Git 是 Skills 的天然分发渠道——git clone 就是“安装”。
- 第三，知识本位（Knowledge-centric）。Skills 的价值不在格式——格式只是Markdown；不在工具——工具是 Agent 自带的；不在运行时——运行时是 Agent 平台提供的。价值在内容本身，在“怎么做某件事”的知识，在可操作的领域智慧。一份好的“如何做代码审查”的 SOP，不管是 Claude 读还是 GPT 读还是 Gemini 读，知识本身都是有价值的。

#### 主题4
- 原始小节标题：为什么 SubAgents 不能出圈
- 理解了 Skills 为什么能出圈，再看 SubAgents 为什么不能——两者的对比揭示了一个深层的架构原理。
- 根本原因在于：Skills 封装的是知识（Knowledge），SubAgents 封装的是行为（Behavior）。
- 用一个简单的类比来说：Skills 像一本烹饪书，不管你用什么厨房（Claude / GPT / Gemini），只要能读懂食谱，就能做菜，换厨房带上书就行；SubAgents 像一位厨师，厨师的技能绑定在人身上，你不能把“厨师”复制到另一家餐厅的系统里，你能做的是给新厨师一本食谱。
- 如果把 Claude Code 的所有机制排列起来看可移植性，规律非常清晰。
- 越接近“纯知识”的机制越容易跨平台，越接近“运行时行为”的机制越绑定平台。Skills 是最纯粹的知识封装，所以它出圈了。

#### 主题5
- 原始小节标题：Agentic AI Foundation——AI 时代的 W3C
- Skills 出圈的背后，是一个更大的行业趋势：Agent 标准化运动。
- 2025 年 12 月 9 日，Anthropic、OpenAI 和 Block（原 Square）在 Linux Foundation 下联合成立了 Agentic AI Foundation (AAIF)。如果你熟悉 Web 标准的历史，这就是 AI 时代的 W3C——让不同厂商的 Agent 能用同一套标准互操作。
- AAIF 有三大创始项目，每个解决 Agent 生态的一个核心问题。
- Agent Skills 不是 AAIF 的三大创始项目之一——它是 Anthropic 在 AAIF 成立 9 天后独立发布的开放标准。但它与 AAIF 生态密切关联。
- MCP 提供工具能力，Skills 提供使用知识——Agent 同时需要两者。goose 原生支持加载 Agent Skills。AGENTS.md 是项目的通用规则和指南，Skills 是特定领域的专业知识——前者是常驻全局上下文（push），后者是按需加载领域知识（pull）。
- 这里有一个关键发现：AGENTS.md 与 Skills 的关系，完美映射到我们讲过的 CLAUDE.md 与 Skills 的关系（参考第 9 讲）。

#### 主题6
- 原始小节标题：skills.sh——Skills 的 npm
- 有了标准，自然就需要分发机制。2026 年 1 月 20 日，Vercel 推出了 skills.sh——Agent Skills 的包管理器和目录服务。如果 Agent Skills 是“代码包”，那 skills.sh 就是“npm”。
- 生态数据如下表所示：
- skills.sh 的核心理念是把 Agent 推理与执行分离——给 Agent 一组预定义的、可审计的命令，而不是让它动态生成 shell 逻辑。
- 如果你在本课程中创建了有价值的 Skill，你可以通过 skills.sh 发布到全球生态。你在课程项目中创建的 .claude/skills/api-generating/SKILL.md，任何人都可以通过 npx skills add your-username/api-generating 安装使用。你学到的 Skill 工程能力不仅在 Claude Code 中有用——它是跨平台的、行业标准级别的能力。

#### 主题7
- 原始小节标题：Push vs Pull 大辩论：AGENTS.md vs Skills
- 有了行业标准和分发机制，一个自然的问题浮出水面：既然 AGENTS.md（Push）和 Skills（Pull）是互补的，那什么时候该用哪个？
- 2026 年 2 月 2 日，Vercel 发布了一篇引发广泛讨论的博文——AGENTS.md outperforms skills in our agent evals。他们对 Build、Lint、Test 三类任务做了严格的对照实验。
- 表面结论是，一个静态 Markdown 文件打败了按需检索的 Skill 系统。但这个结论需要更深层的分析。
- 这个权衡，你在第 9 讲就学过了——CLAUDE.md vs Skills 就是同一个 Push vs Pull 的设计决策。如下图所示。
- Vercel 的测试场景是 Build / Lint / Test——这些是每个项目都需要的高频操作。对于高频操作，Push 模型当然更好：把构建指南放在 AGENTS.md 里，Agent 每次都能看到。
- 但如果你的场景是 15 个不同领域的 Skills（安全审查、API 文档、数据分析、性能优化……），每次只需要其中 1-2 个，全部 Push 进上下文等于 120KB+ 的 token 消耗。那 Pull 模型就是唯一可行的选择。

#### 主题8
- 原始小节标题：企业本体论升维：从内部 SOP 到行业标准协议
- 在第 9 讲中，我们建立了一个企业本体论映射：Skills 等于企业的 SOP / 操作手册。这个映射在企业内部是准确的——Skills 就是一家企业的标准操作程序，指导内部员工（Agent）如何执行特定任务。
- 但 Skills 出圈后，这个映射需要升维。
- 如果把这个升维后的映射完整展开，会形成一幅更完整的对照图。
- 这个升维对你作为 AI 工程师有三个实际意义。
- 第一，学一次，到处用。你在 Claude Code 中精心设计的 Skill——精准的 description、合理的分层、强约束措辞——可以直接用在 Cursor、Copilot、Codex CLI 中。因为它就是一个符合行业标准的 Markdown 文件。
- 第二，你的 Skill 工程能力是行业级能力。学会如何设计好的 SKILL.md不再是“如何用好 Claude Code”的必要条件，而是“如何为 AI Agent 生态编写标准化知识包”的问题。这就像 2015 年学 REST API 设计——不是学某个框架，而是学行业通用技能。

### 总结
从一个产品特性到行业开放标准，Skills只用了不到百天，为什么偏偏是 Skills 能出圈，这对 AI 工程师又意味着什么。

## 关键要点
- 释题：星火燎原。一个 Markdown 文件格式，用百天时间从一个产品特性变成行业开放标准。这不是偶然——它揭示了 AI Agent 生态中，什么样的机制能活下来，什么样的知识能跨越边界。
- 谁在用：四层采纳矩阵：知道了时间线，接下来看采纳范围。截至2026年为止的 27+ 平台并不是简单的堆砌数字，它们呈现出清晰的分层结构。
- 主题3：刚刚我们了解了“发生了什么”，更重要的问题是“为什么”。为什么是 Skills 出圈，而不是 SubAgents、不是 Hooks、不是 Plugins？
- 主题4：理解了 Skills 为什么能出圈，再看 SubAgents 为什么不能——两者的对比揭示了一个深层的架构原理。
- 主题5：Skills 出圈的背后，是一个更大的行业趋势：Agent 标准化运动。
- 主题6：有了标准，自然就需要分发机制。2026 年 1 月 20 日，Vercel 推出了 skills.sh——Agent Skills 的包管理器和目录服务。如果 Agent Skills 是“代码包”，那 skills.sh 就是“npm”。

## 知识图谱种子
- 实体:
  - claude-code-engineering-practice
  - 14｜星火燎原：从Claude Code到行业开放标准
  - 黄佳
- 关系:
  - (claude-code-engineering-practice) -> 包含章节 -> (14｜星火燎原：从Claude Code到行业开放标准)
  - (14｜星火燎原：从Claude Code到行业开放标准) -> 作者 -> (黄佳)

## 复习备注
- 构建知识图谱前，先复核关键论断与原文的一致性。
- 在此补充你的行动项、实践映射和复盘结论。
