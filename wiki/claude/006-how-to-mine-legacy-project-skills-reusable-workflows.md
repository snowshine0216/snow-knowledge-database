---
tags: [claude-code, skill-md, legacy-projects, workflow-automation, ai-collaboration, docs-sync, project-tooling]
source: https://time.geekbang.org/column/article/976622
---
# 老项目的 Skill 怎么挖：把重复流程变成可复用技能

本文是《Claude Code 企业级老项目改造实战》第 11 讲，讲解如何从老项目里识别和挖掘重复流程，将其写成 Claude Code 的 SKILL.md 文件，从生产者视角构建团队的 AI 协作动态能力。

## Key Concepts

- **三特征判断法**：判断一件事是否值得写成 SKILL 的三个标准：① 可复制（这个月已做五次而非偶尔一次）；② 可参数化（骨架相同、只有几个变量在变，如新增接口流程中具体接口名不同但检查步骤相同）；③ 可自动化（起点清晰、产出物明确）。三个同时满足才写。

- **老项目是 SKILL 富矿**：老项目的特征是"反复做但没沉淀"——改造前体检、PR 前检查、文档同步每周都在做，但没有标准化，不同团队成员做法各异，过 review 的速度差三倍。SKILL 将团队操作下限拉到上限。

- **四类高价值 SKILL**：① 技术文档自动更新（解决文档腐烂）；② 改造前体检（测试绿/编译通过/中间件连接检查）；③ PR 前检查（测试+格式化+changelog+文档+reviewer）；④ 新增接口前对齐（看现有路径风格/响应格式/错误码规则）

- **docs-auto-sync**：最高价值首选 SKILL。对照 Controller/Entity/SQL 代码与 docs/api-list.md、docs/data-model.md 做交叉比对，输出差异报告（新增接口、已删接口、字段增删、类型变更等），**不自动修改任何文件**。allowed-tools 严格限为 `Read` + `Bash`（仅 find/grep）。核心设计原则：只汇报，让人决定如何处理。

- **三步 AI 挖掘工作流**：① 让 AI 扫项目（git log、CLAUDE.md、docs/、README、CONTRIBUTING）找候选清单（5-10 项）；② 让 AI 按"频率高+痛点深+自动化收益大"出 Top 3 推荐；③ 选一个让 AI 生成完整 SKILL.md 并保存到 `.claude/skills/<name>/SKILL.md`

- **SKILL 质量迭代路径**：60 分起步（AI 初版，能跑解决一个痛点）→ 70-80 分（手工 1-2 小时调 description/steps/allowed-tools）→ 90 分（用一个月在实际触发中打磨）。SKILL 是养出来的，不是设计出来的。

- **CLAUDE.md vs SKILL 分工**：CLAUDE.md 是静态知识（项目是什么、禁区约定），每次启动都读取；SKILL 是动态能力（怎么做特定事），由场景触发加载。两者互补构成 AI 协作基础设施。

## Key Takeaways

- SKILL 控制数量很重要：Claude Code 索引过多 SKILL 会让 AI 在多个之间判断混乱，互相冲突——先写 3 个最高频的用一个月，控制在 5 以内
- SKILL 测试三动作缺一不可：说匹配句（应加载）→ 说不匹配句（不应加载）→ 真跑一次（验产出）；不验证的 SKILL 等于没写
- SKILL 的起点是"识别反复在做什么"，不是"研究 YAML 格式"——先找场景、再写 SKILL，而不是为了写 SKILL 而写
- "场景驱动用工具"是核心思维：不是因为"要学 SKILL"才写 SKILL，是因为"我有这个问题"才用 SKILL

## See Also

- [[005-legacy-project-claude-md-from-five-assets-to-project-knowledge]]
- [[002-installing-diagram-tools-mermaid-skill-for-claude-code]]
- [[claude-code-best-practice]]
- [[workflow-automation]]
