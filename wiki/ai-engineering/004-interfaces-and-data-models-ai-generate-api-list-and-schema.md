---
tags: [claude-code, legacy-project, rest-api, data-model, project-understanding, documentation]
source: https://time.geekbang.org/column/article/976182
---
# AI 辅助生成接口清单和数据模型说明

接手老项目时，接口（对外契约）和数据模型（内部骨骼）是两份最关键的理解资产。它们彼此绑定：接口的参数和返回 90% 是数据模型的映射；任何功能改造几乎都要同时改接口、改数据模型字段、改业务逻辑。让 AI 扫代码自动梳理出这两份文档，再做一次互相校对，是了解老项目第五步的完整流程。

## Key Concepts

- **REST 接口清单（`docs/api-list.md`）**：让 AI 扫所有 Controller，按业务模块分组，每个接口含方法/路径/一句话说明/主要入参/返回结构。关键提示词技巧：①"按模块分组"防止百行大表；②"一句话说明"强制给出人类可读的业务意图（而不是抄方法名）；③多模块项目必须加"每个 server 子模块下都可能有 Controller"防止漏扫。Spring AI Alibaba Admin 扫出 32 个 Controller，22 个业务模块。
- **数据模型说明（`docs/data-model.md` + `docs/data-model-er.svg`）**：综合三个来源梳理核心数据结构，以 DB 层（建表 SQL/DDL）为准，entity 类和 DTO 作参照。标出主键、外键、枚举值，加 ER 图。三源分工：entity 有 Java 层 `@Transient` 字段（DB 里没有），DTO 是 entity 的子集或组合（传输层契约），DDL 是最权威的 DB 真实状态。
- **三源并读原则**：数据模型必须同时读 entity + DTO + DDL，不能只读 Java 层——JPA entity 里的 `@Transient` 字段在 DB 里不存在，DTO 字段不对应真实表，单读任一来源都会产出偏差文档。
- **隐式关联**：没有 DB 外键约束但通过业务代码维护的"逻辑关联"（如 `findByPromptId()` 之类的 JPA 查询）容易被只看 DDL 的 AI 漏掉，需要额外要求 AI 扫 `findBy` 方法。
- **资产自洽性校对（必须步骤）**：两份资产完成后对照检查——接口里提到的每个实体在数据模型里都要能找到，反之亦然。AI 梳理时经常出现旧类名 vs. 重构后新类名不一致的情况。校对提示词：`对照 docs/api-list.md 和 docs/data-model.md，列出接口里的实体在数据模型里找不到定义的情况`，AI 扫一遍 → 你验证 → AI 修正。
- **五份 docs/ 资产**：与第 08 讲的三张图（architecture.svg / module-deps.svg / external-deps.svg）合并，docs/ 里共 5 份资产，构成第 10 讲写 CLAUDE.md 的全部前置输入。

## Key Numbers / Quick Facts

| 数据 | 含义 |
|---|---|
| 32 个 Controller | Spring AI Alibaba Admin 扫描结果 |
| 22 个业务模块 | 分组后的 API 目录数 |
| 3 个数据源 | entity + DTO + DDL，数据模型梳理必须同时读 |
| 5 份 docs/ 资产 | 3 张图（08讲）+ 接口清单 + 数据模型说明（09讲）|

## Key Takeaways

- 接口和数据模型彼此绑定，任何功能改造要改三处（接口 + 数据模型 + 业务逻辑），必须配套梳理
- 接口清单的三个关键词：按模块分组、一句话说明、主要入参返回（不展开字段细节）
- 数据模型必须三源并读，以 DDL 为准；还要让 AI 扫 `findBy` 方法捕获没有 DB 约束的隐式关联
- **校对是必须步骤**，不做就是两份资产慢慢漂移，改造时无可信导航地图
- 五份 docs/ 资产（3 图 + 接口 + 数据模型）是 CLAUDE.md 的全部前置输入，后续护栏和改造直接引用

## See Also

- [[001-eight-step-method-for-understanding-legacy-projects]] — 本讲实操八步心法第五步
- [[003-birds-eye-view-draw-architecture-module-dependency-diagrams]] — 08 讲产出三张图，与本讲产出合并为五份 docs/ 资产
- [[harness-engineering]] — 五份资产最终写入 [[CLAUDE.md]]，成为 AI harness 的上下文基础
