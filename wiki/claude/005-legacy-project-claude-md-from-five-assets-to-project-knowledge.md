---
tags: [claude-md, legacy-projects, claude-code, project-documentation, ai-collaboration, knowledge-management]
source: https://time.geekbang.org/column/article/976338
---
# 老项目的 CLAUDE.md 怎么写：从五份资产到一份项目常识

本文是《Claude Code 企业级老项目改造实战》第 10 讲，讲解如何为接手的老项目编写 CLAUDE.md——让 AI 每次启动时就带着项目共识进来。与新项目不同，老项目的 CLAUDE.md 不能从零写，必须从已有 docs/ 资产中提炼。

## Key Concepts

- **索引 + 常识定位**：老项目 CLAUDE.md 的每一条，要么是"AI 启动就必须知道的常识"，要么是"指向 docs/ 的入口"。不满足这两条的删掉，超过 300 行就是写多了。
  - 对比新项目（规矩越多越好）：老项目塞太多会触发 Dumb Zone——AI 加载大量 context 后判断能力下降

- **五份资产是前置条件**：08 讲的架构图/模块图/依赖图 + 09 讲的接口清单/数据模型，这五份 docs/ 资产不只是给人看的笔记，更是 CLAUDE.md 能提炼的原材料；没有它们，CLAUDE.md 就是空中楼阁

- **应放入的内容**：项目定位（一句话）、核心架构（一段话 + docs/architecture.svg 链接）、关键模块（小表格，每个模块一句话职责）、关键约定（项目特有硬规则，不展开理由）、怎么跑（一句话 + docs/ 链接）、禁区、历史包袱

- **不放的内容**：完整架构细节、完整接口清单、完整数据模型（这些在 docs/ 里，用链接指向即可）、通用代码规范（阿里 Java 开发手册之类）、背景故事

- **禁区**：哪些代码/字段/接口/配置动不得，往往因为有外部依赖或对接方；例：`PromptEntity.external_key` 字段被某 SDK 客户用作缓存键，改名或删除直接报错

- **历史包袱**：项目里看起来奇怪但有历史原因的设计；例：前端某 Vue 组件在全 React 项目中是唯一例外，是早期遗留，勿"顺手重构"

- **AI 生成初稿的关键提示词技巧**：提示词中明确要求"两节空着的：禁区、历史包袱"——让 AI 留出位置但不填写，因为 AI 从代码里扫不出这些隐性约束

## Key Takeaways

- 老项目写 CLAUDE.md 的路径：先完成 05 份 docs/ 资产 → 让 AI 基于资产生成初稿（前五节）→ 自己手写禁区和历史包袱两节
- 300 行上限是核心健康指标：超过说明把详细内容塞进来了而不是索引
- 禁区和历史包袱是 AI 永远无法自动生成的两节——只有接手者亲历过或和原作者聊过才知道，是老项目 CLAUDE.md 区别于新项目的根本
- Review 三检查点：① 有无禁区/历史包袱，② 是否超 300 行，③ 是否重复了 docs/ 内容（应看到引导+链接，不是内容复制）
- 列不出禁区和历史包袱是信号：对项目理解不够深——需要和老同事聊、翻 git log 里奇怪的 commit

## See Also

- [[003-birds-eye-view-draw-architecture-module-dependency-diagrams]]
- [[004-interfaces-and-data-models-ai-generate-api-list-and-schema]]
- [[006-how-to-mine-legacy-project-skills-reusable-workflows]]
- [[claude-code-best-practice]]
- [[context-engineering]]

## Related sources

- **[12｜实操课：完整摸清一个陌生项目的全流程演示](../courses/claude-code-legacy-project-transformation/chapter2-project-understanding-and-tooling/007-hands-on-complete-legacy-project-walkthrough.md)**: 第 12 讲将第 10 讲的 CLAUDE.md 生成流程融入完整四场景实操演示（三张全景图→接口+数据模型→CLAUDE.md→第一个 SKILL），补充了"一键自主全流程"提示词设计（授权自主+委托 review+summary 替代打断+占位禁区历史包袱），以及 CLAUDE.md 在 7 份资产体系中的完整定位。See also: [[007-hands-on-complete-legacy-project-walkthrough]]
