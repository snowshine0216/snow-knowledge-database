---
tags: [claude-code, legacy-projects, hands-on, project-understanding, ai-collaboration, prompt-engineering, skill-md, claude-md]
source: https://time.geekbang.org/column/article/976978
wiki: wiki/claude/005-legacy-project-claude-md-from-five-assets-to-project-knowledge.md
---

## Pre-test

*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 从 git clone 一个陌生项目到建立完整 AI 协作基础设施，需要产出哪几类文件？
2. 如何设计提示词让 Claude Code 自主执行一整套流程，而不是每步都来问你？
3. 在给 AI 生成 CLAUDE.md 的提示词中，"禁区"和"历史包袱"两节应该如何处理？

---

## Chapter Metadata
- Course: Claude Code 企业级老项目改造实战
- Chapter: 007 — 12｜实操课：完整摸清一个陌生项目的全流程演示
- Author: Robert
- Date: 2026-05-16
- Article ID: 976978

## Cornell Notes

### Cue Column (Questions)
- 第二部分（08-11 讲）的四个场景分别是什么，每个场景的产出是什么？
- 逐步执行和一键全流程两种方式各自的适用场景是什么？
- 设计"自主执行"提示词的四个关键原则是什么？
- 跑完全流程后，项目目录结构长什么样？

### Notes Column

**本讲定位**

第二部分的结尾实操课。前 4 讲（08-11）每一讲做一件事，本讲把四个场景在 Spring AI Alibaba Admin 上连起来跑一遍：从 git clone 到 docs/ 五份资产齐全、CLAUDE.md 写好、第一个 SKILL 装进去。提供两种执行方式：逐步执行（看清每步产出和 review 点）和一键自主全流程（AI 自主推进+最后汇报）。

**准备工作**

```bash
git clone https://github.com/alibaba/spring-ai-alibaba.git
cd spring-ai-alibaba/spring-ai-alibaba-admin
mkdir -p docs
mkdir -p .claude/skills
```

**场景一：画三张全景图（对应 08 讲）**

产出 docs/ 下的三张 SVG：

| 提示词目标 | 产出文件 | Review 重点 |
|---|---|---|
| 架构图：前端/后端/数据库/中间件分层，核心模块一句话职责，周边基础设施一个方框概括 | `docs/architecture.svg` | 前后端分离体现、OpenTelemetry trace 链路、server-start 不漏 |
| 模块依赖图：只画项目内部模块（非外部库），循环依赖红色标出 | `docs/module-deps.svg` | start 依赖 runtime 和 openapi、两者都依赖 core，方向不能倒，frontend 不出现 |
| 外部依赖图：三类（关键 Java 依赖、中间件、外部 API），不同颜色 | `docs/external-deps.svg` | MySQL、Nacos、OTel Collector 都在；外部模型 API（DashScope/OpenAI/DeepSeek）不漏 |

**场景二：梳理接口和数据模型（对应 09 讲）**

| 提示词目标 | 产出文件 | Review 重点 |
|---|---|---|
| 扫所有 Controller，按模块分组，每个接口列出方法/路径/一句话说明/主要入参/返回结构 | `docs/api-list.md` | server-core/openapi/runtime 三个模块 Controller 都扫到；对外接口和内部接口分开标注 |
| entity/DTO/SQL 三源并读，主键/外键/枚举值标出，关键模型间关系画 ER 图 | `docs/data-model.md` + `docs/data-model-er.svg` | 以 DB 层为准；entity 和 DTO 分开说；通过 findBy 反查隐式外键关系 |
| 对照两份资产互相校对，列出不一致点并修复 | 更新上述两份文件 | 最终两份资产自洽 |

跑完这两个场景，docs/ 里有五份资产：3 张 SVG + api-list.md + data-model.md（含 ER 图）。

**场景三：生成 CLAUDE.md（对应 10 讲）**

提示词要点：
```
读 docs/ 下的所有资产，给我生成一份 CLAUDE.md 初稿。
精简：项目定位、核心架构、关键模块、关键约定、怎么跑，
外加两节空着的：禁区、历史包袱。
架构图、接口清单、数据模型的详细内容不要复制进来，
用链接指向 docs/ 就好。保存到项目根目录的 CLAUDE.md。
```

产出：CLAUDE.md（前五节 AI 生成，禁区和历史包袱**留空**，写"待 Robert 补充"占位）

Review 重点：总长度不超过 300 行、没有重复 docs/ 内容（都用链接指向）、禁区和历史包袱两节有占位内容而非 AI 填写。

手写禁区和历史包袱：没思路就先列一两条暂时占位，改造中踩到坑了再补。

**场景四：挖出第一个 SKILL（对应 11 讲）**

三步走（提示词 8→9→10）：

1. AI 扫项目找候选清单（扫 git log、CLAUDE.md、docs/、README、CONTRIBUTING、.github/）
2. AI 出 Top 3 推荐（按频率高+痛点深+自动化收益大排序）
3. 生成 docs-auto-sync 完整 SKILL.md（只读不写、步骤清晰、不自动修正、只报告），保存到 `.claude/skills/docs-auto-sync/SKILL.md`

完全退出 Claude Code 再重新启动让 SKILL 生效，然后用匹配句测试触发（"我刚改完一批 Controller，帮我看看文档还对不对得上"）。

**一键自主全流程提示词（核心设计）**

四个设计原则：

| 原则 | 提示词中的体现 | 目的 |
|---|---|---|
| 明确授权自主 | "整个过程你自主推进，不要每一步都问我" | 避免 AI 频繁确认打断节奏 |
| 把 review 责任交给 AI | "每一步跑完自己 review 输出质量，不合格自己重跑" | 让 AI 对产出负责而非做完就丢 |
| 用 summary 替代中途打断 | "有判断不清的地方先做合理选择，在最后 summary 里标记" | 你花 5 分钟读 summary 做决策，比中间被打断十次效率高 |
| 占位禁区和历史包袱 | "禁区和历史包袱两节留空，写'待 Robert 补充'占位" | 避免 AI 瞎编这两节 |

等待时间约 15-30 分钟（取决于模型速度和项目大小）。

**跑完全流程的产出目录结构**

```
spring-ai-alibaba-admin/
├── CLAUDE.md                          ← 项目常识 + 禁区(占位) + 历史包袱(占位)
├── .claude/skills/
│   └── docs-auto-sync/
│       └── SKILL.md                   ← 第一个自己挖的 SKILL
└── docs/
    ├── architecture.svg               ← 架构图
    ├── module-deps.svg                ← 模块依赖图
    ├── external-deps.svg              ← 外部依赖图
    ├── api-list.md                    ← REST 接口清单
    ├── data-model.md                  ← 数据模型说明
    └── data-model-er.svg              ← ER 图
```

7 份资产构成老项目的完整 AI 协作基础设施。第三部分（13 讲起）将进入编译+测试+护栏阶段。

### Summary

本讲是第二部分（08-11 讲）的实操合集，提供 10 个提示词模板将四个场景（三张全景图→接口+数据模型→CLAUDE.md→第一个 SKILL）在 Spring AI Alibaba Admin 上串起来跑一遍。核心产出是 7 份资产：3 张 SVG + 2 份 docs/ 文档 + CLAUDE.md + docs-auto-sync SKILL。自主全流程提示词的设计原则：明确授权自主+把 review 责任交给 AI+用 summary 替代中途打断+禁区历史包袱占位。理解了项目还不够，下一步是能跑起来、能验证、能兜底（第三部分）。

## Key Takeaways
- **7 份资产是 AI 协作基础设施的完整形态**：architecture.svg + module-deps.svg + external-deps.svg + api-list.md + data-model.md + data-model-er.svg + CLAUDE.md + SKILL；缺任何一份都是不完整的
- **逐步执行适合学习**，一键自主适合实际项目——学习时每步 review 产出质量，正式项目上直接用自主全流程提示词
- **"不要每一步都问我"是关键句**：明确授权 AI 自主决策，否则 AI 默认频繁确认，15-30 分钟的流程可能拖到几小时
- **校对步骤不可跳过**：api-list.md 和 data-model.md 必须互相校对（"对照两份资产，列出不一致点并修复，直到自洽"）——两份资产对不上，后续的 docs-auto-sync SKILL 就没有可靠的对比基准
- **SKILL 测试必须完全退出 Claude Code 再重启**：SKILL 是在 Claude Code 启动时索引的，不重启则新装的 SKILL 不会被识别
- **禁区和历史包袱占位比 AI 自动填写更安全**：占位符提醒人工补充，AI 自动填写会产生貌似合理但实际错误的内容

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[AI协作基础设施-七份资产]]：三张 SVG 架构图 + api-list.md + data-model.md + ER 图 + CLAUDE.md + docs-auto-sync SKILL，老项目改造完整基础设施
- [[自主执行提示词设计]]：授权自主 + 委托 review + summary 替代打断 + 占位禁区/历史包袱，让 AI 自主推进 15-30 分钟流程的四原则
- [[两份资产校对]]：api-list.md 与 data-model.md 互相校对直到自洽，是 docs-auto-sync SKILL 可靠运行的前置条件
- [[SKILL触发测试三动作]]：说匹配句→说不匹配句→真跑一次，验证 SKILL 是否正确触发和产出

### 2. 课程内导航链接
- [[003-birds-eye-view-draw-architecture-module-dependency-diagrams|第 08 讲 俯视项目全景]]：本讲场景一的来源，三张 SVG 全景图的提示词和 review 要点
- [[004-interfaces-and-data-models-ai-generate-api-list-and-schema|第 09 讲 接口和数据模型]]：本讲场景二的来源，api-list.md + data-model.md + ER 图的产出流程
- [[005-legacy-project-claude-md-from-five-assets-to-project-knowledge|第 10 讲 老项目的 CLAUDE.md 怎么写]]：本讲场景三的来源，CLAUDE.md 生成提示词和占位策略
- [[006-how-to-mine-legacy-project-skills-reusable-workflows|第 11 讲 老项目的 Skill 怎么挖]]：本讲场景四的来源，三步 AI 挖掘工作流和 docs-auto-sync 设计

### 3. 课程外与通用概念关联
- [[claude-code]]：本讲全部操作在 Claude Code 中执行，SKILL 需要完全退出后重启才能被索引生效
- [[prompt-engineering]]：一键自主全流程提示词是本讲的核心工程化产出，体现了授权/委托/summary 设计模式

### 4. 推荐关系边
- [[两份资产校对]] → enables → [[docs-auto-sync]]
- [[自主执行提示词设计]] → enables → [[AI协作基础设施-七份资产]]
- [[AI协作基础设施-七份资产]] → composed-of → [[SKILL.md]]
- [[AI协作基础设施-七份资产]] → composed-of → [[CLAUDE.md]]
- [[SKILL触发测试三动作]] → validates → [[docs-auto-sync]]

### 5. 后续值得沉淀成卡片的主题
- [[自主执行提示词设计]]
- [[AI协作基础设施-七份资产]]
- [[两份资产校对]]

## Notes For Review
- Spring AI Alibaba Admin 用于课程演示，提示词可直接复制使用但 review 重点需根据实际项目调整
- "完全退出 Claude Code 再重启"这个步骤容易被忽略——SKILL 在启动时索引，不重启则新装 SKILL 无效
- 一键全流程等待 15-30 分钟是正常的，不要在等待中途打断 AI；summary 里会标注需要人工确认的决策点

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 跑完第二部分完整流程后，项目目录里会有哪几类文件？每类各几份？
2. 设计"一键自主全流程"提示词的四个关键原则是什么？为什么各自重要？
3. 为什么 api-list.md 和 data-model.md 必须做互相校对，这一步和后续的 SKILL 有什么关系？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> 三类、共 7 份（外加一个 SKILL 目录）：① docs/ 下 5 份——architecture.svg（架构图）、module-deps.svg（模块依赖图）、external-deps.svg（外部依赖图）、api-list.md（接口清单）、data-model.md + data-model-er.svg（数据模型+ER图，合计 2 个文件）；② 项目根目录 1 份——CLAUDE.md；③ .claude/skills/ 下 1 个 SKILL 目录——docs-auto-sync/SKILL.md。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 四个原则：① 明确授权自主（"不要每一步都问我"）——否则 AI 默认频繁确认，一个 15 分钟的流程可能拖到几小时；② 把 review 责任交给 AI（"每一步跑完自己 review，不合格自己重跑"）——让 AI 对产出负责而不是做完就丢给人；③ 用 summary 替代中途打断（"有不确定的地方先做合理选择，最后在 summary 里标记"）——你花 5 分钟读 summary 做决策，效率远高于被打断 10 次；④ 占位禁区和历史包袱（"留空写'待 Robert 补充'"）——避免 AI 瞎编这两节产出看起来合理但实际错误的内容。
>
> ---
>
> **题目 3 - 引导答案思路：**
> api-list.md 和 data-model.md 分别从 Controller 和 Entity/SQL 两个维度梳理项目，但两者存在交叉——接口里引用的实体在数据模型里是否有定义？字段名是否对上？如果两份资产对不上，意味着有一份是错的（或者代码本身有问题）。校对并修复到自洽，才能保证 docs/ 资产的可信度。而 docs-auto-sync SKILL 正是以这两份文档作为"正确基准"，用代码实际状态与它们对比来发现漂移——如果基准本身不准确，SKILL 的输出就没有意义。
