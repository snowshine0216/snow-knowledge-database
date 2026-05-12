---
tags: [claude-code, legacy-project, rest-api, data-model, project-understanding, documentation]
source: https://time.geekbang.org/column/article/976182
wiki: wiki/ai-engineering/004-interfaces-and-data-models-ai-generate-api-list-and-schema.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 为什么接口清单和数据模型说明要放在同一讲里做，而不是分开？
2. 让 AI 梳理数据模型时，为什么要同时读 entity 类、DTO 和建表 SQL 三个来源？
3. 做完接口清单和数据模型说明之后，还有什么额外步骤是必须做的？

## Chapter Metadata
- Course: Claude Code 企业级老项目改造实战
- Chapter: 004 — 09｜接口和数据模型：让 AI 产出生成接口清单和 Schema
- Author: Robert
- Article ID: 976182

## Cornell Notes

### Cue Column (Questions)
- 接口和数据模型为什么要一起梳理？
- 接口清单的提示词关键词是什么？有哪些常见坑？
- 数据模型的提示词关键词是什么？有哪些常见坑？
- docs/ 里的五份资产各自在后续哪几讲会用到？
- 两份资产的"互相校对"是什么步骤，为什么必须做？

### Notes Column

**为什么接口和数据模型要一起梳理**

接口是"门面"，数据模型是"根基"，两者彼此绑定：
- 接口的参数和返回，90% 是数据模型的某种映射或变形（`POST /api/prompts/create` 的请求体基本是 Prompt 数据模型的子集，响应是 Prompt 的视图）
- 改造任何功能大概率要改三处：**加接口 → 改数据模型字段 → 改业务逻辑**
- 没有这两份资产，每次改造都要从零摸索

**资产 1：REST 接口清单（`docs/api-list.md`）**

提示词：
```
扫一下这个项目里所有的 Controller，给我整理一份 REST 接口清单。
每个接口列出方法（GET/POST 等）、路径、一句话说明、主要入参、返回结构。
按模块分组。保存到 docs/api-list.md。
```

关键指令说明：
- **"按模块分组"**：Spring AI Alibaba Admin 有 22 个业务模块（Prompt/Dataset/Evaluator/Experiment/Trace 等），分组后可读性远高于一百行大表
- **"一句话说明"**：强制 AI 给出人类可读的意图，而不是抄 `@Operation` 注解或方法名。`createPromptTemplate` → 一句话应该是"创建一个新的 Prompt 模板"
- **"主要入参、返回结构"**：不要展开所有字段，只要主干类型；字段细节交给数据模型文档

Spring AI Alibaba Admin 扫出 32 个 Controller，22 个业务模块，统一返回结构：
- 单对象：`Result<T> { code, message, data: T }`
- 分页：`PageResult<T>` / `PagingList<T> { total, list }`

常见坑与处理：
| 坑 | 原因 | 处理方式 |
|---|---|---|
| AI 漏扫了 Controller | 多模块项目 Controller 分散在 server-core/openapi/runtime 里 | 提示词加"项目是多模块的，每个 server 子模块下都可能有 Controller"；发现数量少时问"你扫了几个模块，有没有漏" |
| 内部接口和对外 REST 混在一起 | Spring AI Admin 里有 REST 接口也有给 SDK/Agent 用的内部接口 | 让 AI 在清单里区分"对外"和"内部"两类 |
| 返回结构写得太粗 | AI 写"返回 Prompt 对象"就完事了 | 要求至少说清楚"返回单个还是列表，有没有包装成 Result<>" |

**资产 2：数据模型说明（`docs/data-model.md` + `docs/data-model-er.svg`）**

提示词：
```
看项目的 entity 类、DTO、数据库建表 SQL，给我梳理核心数据模型。
每个模型列出字段、类型、一句话说明。标出主键、外键、枚举值。
关键模型之间的关系画一张简单的 ER 图。
保存到 docs/data-model.md 和 docs/data-model-er.svg。
```

为什么要三个来源：
- **entity 类**（Java 持久层 model）：有 `@Transient` 字段在 DB 里不存在
- **DTO**（传输层 model）：是 entity 的子集或多个 entity 的组合，不反映 DB 真实结构
- **建表 SQL / DDL**（DB 层 model）：最权威，以 DB 层为准，entity 和 DTO 作参照

三个"硬信息"：
- **主键**：每个表怎么定位一条记录
- **外键**：表之间怎么关联（包括业务代码维护的"逻辑关联"，没有 DB 约束但有 `findBy` 查询关系）
- **枚举值**：字段的取值范围（Prompt 状态、Experiment 运行状态等），改造时最容易踩坑

常见坑与处理：
| 坑 | 原因 | 处理方式 |
|---|---|---|
| 只看 entity，忽略建表 SQL | AI 默认从 Java 层入手 | 明确说"以 DB 层为准，entity 和 DTO 作参照" |
| entity 和 DTO 混成一份说明 | 两种 model 职责不同（持久层 vs 传输层） | 让 AI 分开，entity 一份、DTO 一份 |
| ER 图里漏掉逻辑关联 | 只看 DDL，没有 DB 外键约束的逻辑关联被忽略 | 让 AI 也扫代码里的 `findBy` 查询方法，把隐式关系补上 |

**五份资产的完整视图与使用场景**

```
docs/
├── architecture.svg      ← 架构图（08讲）
├── module-deps.svg       ← 模块图（08讲）
├── external-deps.svg     ← 依赖图（08讲）
├── api-list.md           ← 接口清单（09讲）
└── data-model.md         ← 数据模型说明（09讲）
    data-model-er.svg     ← 数据模型 ER 图（09讲）
```

| 后续讲次 | 用到的资产 | 用途 |
|---|---|---|
| 10 讲（CLAUDE.md） | 全部五份 | 引用进 CLAUDE.md，让 AI 每次启动能快速定位项目门面和根基 |
| 13 讲（编译运行） | external-deps.svg | 对照依赖图确认中间件是否都启动 |
| 14 讲（建护栏） | api-list.md + data-model.md | 决定哪些接口加集成测试、哪些表加 characterization test |
| 第四部分（需求改造） | api-list.md + data-model.md | 选一个接口改时，先翻清单看当前状态、再翻数据模型看字段关系 |

**两份资产的互相校对（必须步骤）**

接口清单和数据模型应该自洽：接口清单里返回 `PromptTemplate`，数据模型里一定要有 `PromptTemplate` 实体。AI 梳理时经常出现不自洽（保留了旧类名 vs. 用了 refactor 后的新名字）。

校对提示词：
```
对照 docs/api-list.md 和 docs/data-model.md，看接口里提到的每个实体
在数据模型里是不是都有定义。有不一致的地方列出来。
```

AI 扫一遍列出不一致点 → 你验证 → AI 修正。修正后的两份资产才是可信的。这个"互相校对"动作在 11 讲 SKILL.md 里会固化成可复用模板，防止资产之间随时间慢慢漂移。

### Summary

梳理接口和数据模型是八步心法第五步，产出两份紧密关联的资产：REST 接口清单（让 AI 扫所有 Controller，按模块分组，一句话说明+主要入参返回）和数据模型说明（综合 entity/DTO/DDL 三源，标出主键/外键/枚举值，附 ER 图）。配合第八讲的三张图，docs/ 里共有五份资产，构成整个第二部分的核心输出，供后续 CLAUDE.md 写作、护栏建立和真实改造直接引用。做完两份资产必须互相校对一次，确保接口里提到的实体在数据模型中都能找到。

## Key Numbers / Quick Facts

| 数据 | 含义 |
|---|---|
| 32 个 Controller | Spring AI Alibaba Admin 扫描结果 |
| 22 个业务模块 | 按模块分组后的 API 目录数 |
| 3 个数据源 | entity 类 + DTO + 建表 SQL，梳理数据模型时必须同时读 |
| 5 份 docs/ 资产 | 3 张图（08讲）+ 接口清单 + 数据模型说明（09讲）|
| 1 次互相校对 | 两份资产完成后的必须步骤 |

## Key Takeaways
- 接口是"对外契约"，数据模型是"内部骨骼"，两者 90% 互相映射，必须配套梳理才能真正看清项目形状
- 接口清单关键词：按模块分组 + 一句话说明 + 主要入参返回（不展开字段细节）；多模块项目要加"每个 server 子模块都可能有 Controller"
- 数据模型关键词：三源并读（entity/DTO/DDL）+ 标主键/外键/枚举 + 逻辑关联（`findBy` 方法）+ 双产出（md 文档 + ER 图）
- 五份 docs/ 资产不是摆设，每一讲都有明确引用场景；10 讲写 CLAUDE.md 是第一次全部用到
- **互相校对是必须步骤**：接口里提到的实体在数据模型里要能找到，反过来也一样；不校对就是两份资产慢慢漂移

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[接口清单]]：扫所有 Controller 产出的 REST 接口目录，按模块分组，每接口含方法/路径/一句话说明/主要入参返回，存为 `docs/api-list.md`
- [[数据模型说明]]：综合 entity/DTO/DDL 三源梳理的核心数据结构，标出主键/外键/枚举值，附 ER 图，存为 `docs/data-model.md` + `docs/data-model-er.svg`
- [[资产自洽性校对]]：接口清单和数据模型完成后互相对照，确保接口提到的实体在数据模型中都有定义，防止两份资产慢慢漂移
- [[五份docs资产]]：三张图（architecture/module-deps/external-deps）+ 接口清单 + 数据模型说明，第二部分的完整输出集合
- [[三源并读]]：梳理数据模型时必须同时读 entity 类（Java 持久层）、DTO（传输层）、建表 SQL（DB 层），以 DB 层为准

### 2. 课程内导航链接
- [[001-eight-step-method-for-understanding-legacy-projects|第 06 讲 八步心法]]：本讲实操第五步"梳理接口和数据模型"
- [[002-installing-diagram-tools-mermaid-skill-for-claude-code|第 07 讲 安装画图工具]]：ER 图使用 mermaid erDiagram 语法，依赖装好的 claude-mermaid
- [[003-birds-eye-view-draw-architecture-module-dependency-diagrams|第 08 讲 俯视项目全景]]：本讲产出的两份资产与 08 讲的三张图共同构成 docs/ 五份资产

### 3. 课程外与通用概念关联
- [[claude-code]]：实操工具，扫描 Controller 和 entity 代码，产出接口清单和数据模型说明
- [[mermaid]]：ER 图使用 mermaid `erDiagram` 语法产出
- [[characterization-test]]：14 讲建护栏时，接口清单决定哪些接口加集成测试，数据模型决定哪些表加 characterization test

### 4. 推荐关系边
- [[接口清单]] → enables → [[CLAUDE.md]]
- [[数据模型说明]] → enables → [[CLAUDE.md]]
- [[接口清单]] → constrains → [[数据模型说明]]
- [[资产自洽性校对]] → protects → [[接口清单]]
- [[资产自洽性校对]] → protects → [[数据模型说明]]
- [[三源并读]] → enables → [[数据模型说明]]
- [[五份docs资产]] → composed-of → [[接口清单]]
- [[五份docs资产]] → composed-of → [[数据模型说明]]
- [[五份docs资产]] → enables → [[改造导航]]

### 5. 后续值得沉淀成卡片的主题
- [[接口清单]]
- [[数据模型说明]]
- [[资产自洽性校对]]
- [[三源并读]]
- [[五份docs资产]]

## Notes For Review
- 11 讲会把"两份资产互相校对"固化成 SKILL.md 的可复用模板，到时回来对照
- Spring AI Alibaba Admin 共 32 个 Controller，22 个业务模块——实操时可以验证 AI 有没有漏扫

---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 梳理接口清单时，"按模块分组"和"一句话说明"这两个要求解决的是什么具体问题？
2. 梳理数据模型时为什么要同时读三个来源（entity/DTO/DDL）？三者各自有什么信息另外两个没有？
3. 两份资产做完之后必须做哪个额外步骤？如果不做会有什么后果？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> "按模块分组"解决的是可读性问题：32 个接口一张大表根本没法看，按 Prompt/Dataset/Evaluator 等 22 个业务模块分组后，找某类接口直接定位到对应模块。"一句话说明"解决的是意图可读性问题：接口名 `createPromptTemplate` 是开发视角，非开发同事或接手新人根本不知道它的业务含义；一句话说明强制 AI 给出"创建一个新的 Prompt 模板"这种人类可读的描述。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 三个来源各有独特信息：**entity 类**有 Java 层的 `@Transient` 字段（只在内存里用，DB 里没有），以及 JPA 注解能看出对象关系；**DTO** 反映了传输层的契约，可能是 entity 的子集或多个 entity 的组合，不直接对应 DB 表；**建表 SQL/DDL** 是最权威的数据库真实状态，包括真实字段类型、约束、索引、DB 外键。以 DB 层为准，另外两者作参照，才能得到"和 DB 实际一致"的数据模型说明。
>
> ---
>
> **题目 3 - 引导答案思路：**
> 必须做的步骤是"两份资产互相校对"：对照接口清单和数据模型说明，检查接口里提到的每个实体在数据模型中是否都有定义，反之亦然。不做的后果：AI 在梳理接口时可能保留旧类名，梳理数据模型时用了 refactor 后的新类名，两份资产慢慢出现命名不一致——等到改造时发现接口里说的 `PromptTemplate` 和数据模型里的 `Prompt` 是不是同一个东西，就要花时间回溯。不自洽的资产是负债，校对后的资产才是可信的导航地图。
