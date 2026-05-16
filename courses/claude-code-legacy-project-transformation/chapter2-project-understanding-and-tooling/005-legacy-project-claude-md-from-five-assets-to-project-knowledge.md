---
tags: [claude-md, legacy-projects, claude-code, project-documentation, ai-collaboration, knowledge-management]
source: https://time.geekbang.org/column/article/976338
wiki: wiki/claude/005-legacy-project-claude-md-from-five-assets-to-project-knowledge.md
---

## Pre-test

*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 老项目和新项目在写 CLAUDE.md 时，最大的区别是什么？
2. CLAUDE.md 里有两节是 AI 永远无法自动生成的——你猜是哪两节？
3. 如果 CLAUDE.md 超过 300 行，这通常意味着什么问题？

---

## Chapter Metadata
- Course: Claude Code 企业级老项目改造实战
- Chapter: 005 — 10｜老项目的 CLAUDE.md 怎么写？从五份资产到一份项目常识
- Author: Robert
- Date: 2026-05-16
- Article ID: 976338

## Cornell Notes

### Cue Column (Questions)
- 老项目写 CLAUDE.md 的正确起点是什么？
- CLAUDE.md 里应该放哪些内容、不放哪些内容？
- 为什么"禁区"和"历史包袱"这两节必须手写？
- 如何用 AI 生成 CLAUDE.md 初稿并避开常见坑？
- review CLAUDE.md 的三个核心检查点是什么？

### Notes Column

**老项目 vs 新项目的根本差异**

新项目写 CLAUDE.md 不难——你是作者，代码是你写的，规矩是你定的，凭经验就能写出来。老项目不一样：你是接手者，很多设计决策背后的原因自己都没搞清楚。从零写只会产出空洞（"这是一个 Spring Boot 项目"）、错误（把猜测当成事实）、或遗漏（没写出最关键的禁区）。**老项目写 CLAUDE.md 的正确姿势不是从零写，是从已有资产里提炼。**

这也是为什么 08 讲画三张图、09 讲做两份清单。这五份资产（架构图、模块图、依赖图、接口清单、数据模型）不只是给自己看的笔记，它们是 CLAUDE.md 的前置条件。

**CLAUDE.md 的定位：索引 + 常识，不是大量约束**

老项目改造中最常见的写法错误是写得太多——把架构图内容文字重抄一遍、把接口清单全塞进去、把每张表每个字段列出来。结果 CLAUDE.md 几千行，AI 每次启动都加载大量 context，掉进 Dumb Zone。

定位原则：**每一条要么是"AI 启动就必须知道的常识"，要么是"指向 docs/ 的入口"。超过 300 行就是写多了。**

**放进来的内容**

| 条目 | 写法要求 |
|---|---|
| 项目定位 | 一句话说清楚这是什么 |
| 核心架构 | 一段话 + 指向 `docs/architecture.svg` 的链接，不文字化图的内容 |
| 关键模块 | 一个小表，每个模块一句话职责；详细依赖关系在 module-deps.svg 里 |
| 关键约定 | 硬规则（如"REST 接口统一包装 Result"）；不展开理由，直接说规则 |
| 怎么跑 | 一句话 + 指向 docs/ 运行文档的链接 |
| 禁区 | 老项目的灵魂一节（必须手写） |
| 历史包袱 | 老项目的灵魂另一节（必须手写） |

**不放的内容**：完整架构细节、完整接口清单、完整数据模型、通用代码规范（阿里 Java 开发手册之类）、背景故事。

**让 AI 帮你生成初稿**

提示词范式：
> 读 docs/ 下的所有资产，给我生成一份 CLAUDE.md 初稿。精简：项目定位、核心架构、关键模块、关键约定、怎么跑，外加两节空着的：禁区、历史包袱。架构图、接口清单、数据模型的详细内容不要复制进来，用链接指向 docs/ 就好。保存到项目根目录的 CLAUDE.md。

关键点：
- "读 docs/ 下的所有资产"——让 AI 基于已有产出提炼，不是凭空写
- "用链接指向 docs/ 就好"——防止 AI 把架构图文字化
- "两节空着的：禁区、历史包袱"——**最关键的一招**：留出位置但不让 AI 填，因为 AI 填不出真实内容

**三个常见坑**
1. AI 会把 architecture.svg 的内容文字化塞进"核心架构"——直接说"压成一句话+链接"
2. "关键约定"容易写通用规范而非项目特有硬规则——让 AI 从代码风格反推真实约定
3. AI 可能把留空节也填上——直接说"禁区和历史包袱这两节留给我自己写，别帮我猜"

**禁区和历史包袱：必须手写的两节**

这两节的信息不在代码里、不在 docs/ 里、只在你脑子里（或者通过踩坑才知道）。

*禁区示例*：
- `PromptEntity` 的 `external_key` 字段：某 SDK 客户依赖此字段做缓存键，删掉或改名会直接报错
- `POST /api/prompts/search` 接口路径：曾公开给社区，更改路径会造成外部调用失败

*历史包袱示例*：
- 前端 `PromptTemplate.vue` 用 Vue 而非 React，是早期遗留；整个 admin 其他地方都用 React，勿"顺手重构"统一
- `LegacyEvaluatorAdapter` 是 v0.x 时代的兼容层，v1.0 之后新代码一律走 `EvaluatorV1`

这两节每一条都是 AI 永远猜不出来的东西——只有接手者亲历过或和原作者聊过才知道。写得深不深，决定了这份 CLAUDE.md 有没有用。

**三个 review 检查点**

1. 有没有禁区和历史包袱——没有就是漏了，每个老项目都有
2. 是不是太长——超过 300 行就是塞了太多详细内容
3. 有没有重复 docs/——应该看到"核心架构"里是引导（一句话+链接），不是替代（文字化描述每个模块）

### Summary

老项目写 CLAUDE.md 的正确路径：先完成 08-09 讲的五份 docs/ 资产，再让 AI 基于这些资产提炼索引 + 常识，前五节 AI 生成，禁区和历史包袱两节自己手写。CLAUDE.md 定位是索引 + 常识而非大量约束，超过 300 行就是写多了。写得好不好，就看禁区和历史包袱两节有多深——这两节只有接手者自己能写，是老项目 CLAUDE.md 区别于新项目的根本所在。

## Key Takeaways
- **老项目写 CLAUDE.md 的起点是已有的 docs/ 资产，不是从零写**——没有架构图、接口清单等五份资产，CLAUDE.md 就是空中楼阁
- **CLAUDE.md 定位是索引 + 常识**，超过 300 行是信号：塞了太多详细内容，应该下放到 docs/ 用链接指向
- **"禁区"和"历史包袱"两节必须手写**——AI 填不出真实内容；这两节是老项目 CLAUDE.md 的灵魂，具体到字段名、接口路径、遗留技术栈
- **三个常见坑**：AI 文字化架构图、关键约定写通用规范而非项目特有、AI 自动填空留空节——每个都有明确的对策提示词
- **三个 review 检查点**：有无禁区/历史包袱、是否超 300 行、是否重复了 docs/ 内容
- **列不出禁区和历史包袱是一个信号**：对这个项目的理解还不够深，需要继续挖——和老同事聊、翻 git log 里奇怪的 commit

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[CLAUDE.md]]：Claude Code 项目启动时自动读取的配置文件，定义 AI 协作的常识与约束
- [[索引加常识模式]]：老项目 CLAUDE.md 的定位原则——每条内容要么是必须知道的常识，要么是指向 docs/ 的入口
- [[禁区]]：CLAUDE.md 中必须手写的一节，记录哪些代码/字段/配置动不得，是 AI 改造的安全边界
- [[历史包袱]]：CLAUDE.md 中必须手写的一节，解释项目里看起来奇怪但有原因的遗留设计
- [[Dumb-Zone]]：AI 加载过多 context 后判断能力下降的状态；CLAUDE.md 写太长会触发此问题
- [[docs-assets-five-pack]]：架构图、模块图、依赖图、接口清单、数据模型——CLAUDE.md 的前置条件
- [[三点review检查法]]：检查 CLAUDE.md 质量的三个核心检查点

### 2. 课程内导航链接
- [[001-legacy-project-handoff-and-delivery-true-workflow|第 01 讲 老项目改造的真实链路]]：介绍从接手到交付的完整流程，是 CLAUDE.md 写作背后"接手者视角"的来源
- [[002-what-changed-and-unchanged-when-claude-code-enters|第 02 讲 Claude Code 进来后哪一步变了]]：说明 AI 介入后理解 → 改造工作流，CLAUDE.md 是 AI 理解项目的关键载体
- [[003-understanding-constraints-verification-three-layer-control|第 03 讲 理解约束验证三层控制]]：三层控制框架为 CLAUDE.md 中禁区和约定的设计提供理论依据
- [[004-ai-programming-tools-landscape-what-when-to-use|第 04 讲 AI 编程工具全景]]：武器库地图，CLAUDE.md 是其中 Claude Code 配置工具的核心
- [[003-birds-eye-view-draw-architecture-module-dependency-diagrams|第 08 讲 俯视项目全景]]：产出架构图、模块图、依赖图——CLAUDE.md 的前三份素材来源
- [[004-interfaces-and-data-models-ai-generate-api-list-and-schema|第 09 讲 接口和数据模型]]：产出接口清单和数据模型——CLAUDE.md 的后两份素材来源
- [[006-how-to-mine-legacy-project-skills-reusable-workflows|第 11 讲 老项目的 Skill 怎么挖]]：CLAUDE.md 负责静态知识，Skill 负责动态能力，两者互补
- [[007-hands-on-complete-legacy-project-walkthrough|第 12 讲 实操课完整演示]]：将 08-11 讲的提示词串起来在真实项目上跑一遍，包含完整 CLAUDE.md 生成演示

### 3. 课程外与通用概念关联
- [[claude-code]]：CLAUDE.md 是 Claude Code 项目配置的核心机制，每次启动时自动读取
- [[context-engineering]]：CLAUDE.md 的长度控制本质是 context engineering——避免 Dumb Zone，保持 AI 判断精准
- [[knowledge-management]]：禁区 + 历史包袱两节体现了知识管理的核心挑战：隐性知识的显式化

### 4. 推荐关系边
- [[docs-assets-five-pack]] → enables → [[CLAUDE.md]]
- [[CLAUDE.md]] → constrains → [[Dumb-Zone]]
- [[禁区]] → protects → [[legacy-project-safe-zones]]
- [[历史包袱]] → prevents → [[accidental-refactor]]
- [[索引加常识模式]] → specializes → [[CLAUDE.md]]

### 5. 后续值得沉淀成卡片的主题
- [[Dumb-Zone]]
- [[禁区]]
- [[历史包袱]]
- [[索引加常识模式]]

## Notes For Review
- 本讲给出的"禁区"和"历史包袱"示例是虚构的 Spring AI Alibaba Admin 场景，实际项目中这两节内容差异巨大
- CLAUDE.md 300 行上限是经验值，复杂项目可能需要微调，但原则不变：内容能下放到 docs/ 的就不要放在 CLAUDE.md 里

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 老项目写 CLAUDE.md 的正确起点是什么？为什么不能从零开始写？
2. CLAUDE.md 里哪些内容应该放、哪些不应该放？"索引 + 常识"原则的含义是什么？
3. "禁区"和"历史包袱"两节为什么必须手写，AI 为什么无法生成？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> 正确起点是已有的 docs/ 资产——架构图、模块图、依赖图、接口清单、数据模型这五份资产。不能从零写是因为老项目的接手者不是作者，很多设计决策背后的原因自己都没搞清楚，从零写只会产出空洞、错误或遗漏内容；有了五份资产作为前置条件，AI 才有东西可以提炼。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 应该放：项目定位（一句话）、核心架构（一段话+docs/链接）、关键模块（小表格）、关键约定（硬规则）、怎么跑（一句话+链接）、禁区、历史包袱。不应该放：完整架构细节、完整接口清单、完整数据模型、通用代码规范、背景故事。"索引 + 常识"原则：每一条要么是 AI 启动就必须知道的常识，要么是指向 docs/ 的入口；不满足这两条的删掉；超过 300 行就是写多了。
>
> ---
>
> **题目 3 - 引导答案思路：**
> 这两节的信息不在代码里、不在 docs/ 里、只在接手者脑子里（或通过踩坑才知道）。禁区记录哪些字段/接口/配置动不得——往往是因为有外部依赖或对接方；历史包袱解释项目里看起来奇怪但有历史原因的设计——往往只有原作者或踩过坑的人才知道。AI 即使扫遍所有代码也无法发现这些隐性约束，必须人工投入时间挖掘。
