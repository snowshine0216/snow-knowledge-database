---
tags: [claude-code, skill-md, legacy-projects, workflow-automation, ai-collaboration, docs-sync, project-tooling]
source: https://time.geekbang.org/column/article/976622
wiki: wiki/claude/006-how-to-mine-legacy-project-skills-reusable-workflows.md
---

## Pre-test

*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 什么样的工作流程值得被写成 SKILL？你认为有什么判断标准？
2. 老项目和 SKILL 为什么被称为"天作之合"？
3. CLAUDE.md 和 SKILL.md 在 AI 协作中各自扮演什么角色？

---

## Chapter Metadata
- Course: Claude Code 企业级老项目改造实战
- Chapter: 006 — 11｜老项目的 Skill 怎么挖？把重复流程变成可复用的技能
- Author: Robert
- Date: 2026-05-16
- Article ID: 976622

## Cornell Notes

### Cue Column (Questions)
- 老项目和 SKILL 为什么是天然搭配？
- 判断一件事是否值得写成 SKILL 的三特征是什么？
- 老项目里有哪四类流程几乎家家都有、值得挖成 SKILL？
- 用 AI 挖 SKILL 的三步流程是什么？
- SKILL 和 CLAUDE.md 的分工是什么？
- SKILL 的质量如何从 60 分迭代到 90 分？

### Notes Column

**老项目和 SKILL：天作之合**

新项目不太需要 SKILL——你是作者，每件事第一次做都印象深。老项目不同：老项目的特征是"很多事情反复做了很多次，但每次都凭记忆"。改造前体检、PR 前检查、文档同步、新增接口前对齐——这些每周都在做，但因为没沉淀，每次都得重新想一遍流程，漏一步、错一步是常态。

更扎心的是：团队里每个人做法都不一样，A 提 PR 前会跑测试+格式化，B 会顺手 review changelog，相同工作过 review 的速度差三倍。原因不是能力差，是流程没标准化。SKILL 把这些流程固化成 AI 能自动执行的资产，整个团队的下限被拉到上限。

老项目是 SKILL 的富矿，因为"反复做但没沉淀"的流程多到挖不完。

**三特征判断法：值不值得写成 SKILL**

| 特征 | 含义 | 验证问题 |
|---|---|---|
| 可复制 | 同样的动作序列被反复执行 | "这个月已经做了五次"而非"偶尔做一次" |
| 可参数化 | 只有几个变量在变，骨架是同一个 | 新增接口流程：接口名/入参不同，但检查步骤相同 |
| 可自动化 | 起点清晰、终点（产出物）明确 | 不是"改着改着凭感觉做完"的事 |

三个特征同时满足才值得写。差一个都别硬写——偶尔做的事写进文档就好，流程太发散的事留在脑子里就好。

⚠️ **SKILL 的起点是"挖"，不是"设计"**：先识别"我反复在做某件事"，没有重复流程就硬写 SKILL，产出的是一堆没人用的代码。Claude Code 索引的 SKILL 过多，AI 在多个 SKILL 之间判断会混乱、互相冲突。

**老项目里四类高价值 SKILL**

1. **技术文档自动更新**：docs/ 里的接口清单、数据模型、架构图，代码每次改动都让某一份漂移，不主动同步则半年后 docs/ 没人敢相信（文档腐烂），一个 SKILL 替代每周几小时人力维护
2. **改造前体检**：动手改代码前确认当前测试是否绿、编译是否通过、依赖中间件是否连得上
3. **PR 前检查**：测试跑过、格式化过、changelog 更新、相关文档改了、找谁 review——团队有明确 checklist 的项目，零变化地反复执行
4. **新增接口前对齐**：看现有接口路径风格、统一响应格式、错误码规则，对齐完再写，否则每人加出来的接口各自为政

**建议数量**：一个老项目 5-10 个够用，甚至可能小于 3 个。控制在 5 个以内（看系统复杂度）。先挖 3 个最高频的用一个月，觉得真的有用再扩展。

**三步 AI 挖 SKILL 工作流**

**第一步：让 AI 分析项目重复流程**
```
扫一下当前项目（包括 git log、CLAUDE.md、docs/、README、CONTRIBUTING、.github/），
找出团队反复在做的操作流程。
判断标准是三特征：可复制、可参数化、可自动化。三个都满足才算值得做 SKILL 的候选。
把找到的候选列出来，每个写明：流程名、为什么是反复的、能参数化的部分是什么、
起点和终点是什么。最后给我用一个表格总结。
```
产出：5-10 项候选清单

**第二步：让 AI 出 Top 3 推荐**
```
从上面的清单里挑 3 个最高优先级的，给我做成候选 SKILL。
每个候选写：name（英文）、description、预期 steps、allowed-tools。
优先级判断标准：频率高、痛点深、自动化收益大。用表格总结。
```

**第三步：生成完整 SKILL.md**
```
基于上面的候选，给我生成完整的 SKILL.md。要求：
- 名字 docs-auto-sync
- description 写清楚什么场景触发、产出是什么
- steps 清晰可执行
- allowed-tools 限制到最小
- 重要：只汇报不一致的地方，不要自动改文件，让人决定怎么处理
保存到 .claude/skills/docs-auto-sync/SKILL.md。
```

**docs-auto-sync SKILL 结构示例**：对照 Controller/Entity/SQL 与 docs/api-list.md、docs/data-model.md 做交叉比对，输出差异报告，**不自动修改任何文件**。输出含：新增接口、已删接口、路径/方法变更、字段增删、类型变更。allowed-tools 限为 `Read`、`Bash`（仅用于 find/grep），不使用 `Write`/`Edit`。

**SKILL 测试三动作（写完必做）**

1. 说一句应该匹配的话（如"我刚改完一批 Controller，帮我看看文档还对不对得上"）——AI 应自动加载并按步骤跑
2. 说一句故意不匹配的话（如"帮我检查一下这段代码"）——SKILL 不应该被加载，否则 description 太宽泛
3. 真跑一次，看输出是否按步骤、是否列出具体不一致点、有没有自作主张改文件

**CLAUDE.md 与 SKILL 的分工**

| 维度 | CLAUDE.md | SKILL |
|---|---|---|
| 本质 | 静态知识（这是什么项目） | 动态能力（怎么做特定的事） |
| 内容 | 项目常识、禁区、历史包袱 | 操作流程、步骤序列、产出物 |
| 启动时机 | 每次 Claude Code 启动都读取 | 由特定场景触发加载 |
| 写法 | AI 生成初稿 + 手写禁区/历史包袱 | AI 挖掘候选 + AI 生成 SKILL.md |

一起看才完整：CLAUDE.md 告诉 AI 这是什么项目，SKILL 告诉 AI 怎么做特定的事。

**SKILL 质量迭代路径**

- **60 分**：AI 帮你生成的第一版，能跑、能解决一个具体痛点就够了
- **70-80 分**：手动补充 1-2 小时——调 description 让触发更精准、改 steps 按团队真实流程、收紧 allowed-tools 避免越权
- **90 分**：用一个月在每次实际触发中打磨——发现误触发就收紧、发现漏触发就扩展、发现步骤不对就调整

SKILL 是养出来的，不是设计出来的。追求"第一版就完美"是常见陷阱。

### Summary

老项目是 SKILL 的富矿，因为"反复做但没沉淀"的流程随处可见。用三特征判断法（可复制、可参数化、可自动化）筛选候选场景，再通过三步 AI 工作流（分析项目→Top3 推荐→生成 SKILL.md）快速产出第一个 SKILL。控制总量在 5 个以内，以 60 分起步逐步养到 90 分。CLAUDE.md（静态知识）+ SKILL（动态能力）共同构成老项目的 AI 协作基础设施。

## Key Takeaways
- **老项目是 SKILL 富矿**：因为"反复做但没沉淀"的流程多；SKILL 把团队的操作下限拉到上限，解决流程没标准化导致的效率差异
- **三特征判断法决定写不写**：可复制（这个月已做五次）+ 可参数化（骨架相同、变量不同）+ 可自动化（起点/终点清晰）——三个同时满足才写
- **SKILL 写得太多反而有害**：Claude Code 索引过多 SKILL 会让 AI 在多个 SKILL 间判断混乱；先写 3 个、控制在 5 以内
- **三步 AI 挖掘流程**：让 AI 扫项目找候选清单 → 让 AI 出 Top 3 推荐 → 选一个让 AI 生成完整 SKILL.md；比手动想快十倍
- **docs-auto-sync 是最高价值首选 SKILL**：解决文档腐烂（代码改了但 docs/ 没跟上），频率最高、痛点最深、自动化收益最大
- **CLAUDE.md vs SKILL 分工**：静态知识（项目是什么）vs 动态能力（怎么做特定事）——两者互补，缺一不可
- **60 分起步，养到 90 分**：不追求第一版完美；SKILL 是养出来的，在实际触发中迭代比一次写好更有效

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[SKILL.md]]：Claude Code 的可复用操作流程文件，存放于 `.claude/skills/` 目录，由特定场景触发自动加载
- [[三特征判断法]]：判断一件事是否值得写成 SKILL 的标准：可复制 + 可参数化 + 可自动化，三个同时满足才写
- [[docs-auto-sync]]：技术文档自动更新 SKILL，对照代码与 docs/ 做交叉比对并输出差异报告，不自动修改文件
- [[文档腐烂]]：代码持续变更但 docs/ 未同步，最终让文档失去可信度的老项目通病
- [[AI协作基础设施]]：docs/ 五份资产 + CLAUDE.md（静态知识）+ SKILL 集合（动态能力）组成的老项目 AI 改造基础
- [[SKILL质量迭代路径]]：60 分起步（AI 生成）→ 70-80 分（手工微调）→ 90 分（实际使用中打磨）

### 2. 课程内导航链接
- [[005-legacy-project-claude-md-from-five-assets-to-project-knowledge|第 10 讲 老项目的 CLAUDE.md 怎么写]]：与本讲对称——CLAUDE.md 是静态知识（项目是什么），SKILL 是动态能力（怎么做），两者共同构成 AI 协作基础设施
- [[002-installing-diagram-tools-mermaid-skill-for-claude-code|第 07 讲 安装画图工具]]：该讲是消费者视角（装别人写的 SKILL），本讲是生产者视角（从老项目挖出自己的 SKILL）
- [[004-interfaces-and-data-models-ai-generate-api-list-and-schema|第 09 讲 接口和数据模型]]：产出接口清单和数据模型，是 docs-auto-sync SKILL 的对比基准文档
- [[007-hands-on-complete-legacy-project-walkthrough|第 12 讲 实操课完整演示]]：将包含完整 SKILL 挖掘的三步流程演示

### 3. 课程外与通用概念关联
- [[claude-code]]：SKILL 是 Claude Code 扩展 AI 能力的核心机制，存储于 `.claude/skills/` 目录
- [[workflow-automation]]：SKILL 本质是将人工操作流程自动化为 AI 可执行的有序步骤
- [[knowledge-management]]：SKILL 解决的是程序性知识（怎么做）的显式化沉淀问题，而 CLAUDE.md 解决陈述性知识（是什么）的显式化

### 4. 推荐关系边
- [[三特征判断法]] → governs → [[SKILL.md]]
- [[文档腐烂]] → motivates → [[docs-auto-sync]]
- [[docs-auto-sync]] → prevents → [[文档腐烂]]
- [[CLAUDE.md]] → complements → [[SKILL.md]]
- [[AI协作基础设施]] → composed-of → [[SKILL.md]]
- [[SKILL质量迭代路径]] → specializes → [[SKILL.md]]

### 5. 后续值得沉淀成卡片的主题
- [[三特征判断法]]
- [[文档腐烂]]
- [[docs-auto-sync]]
- [[AI协作基础设施]]

## Notes For Review
- docs-auto-sync 的 allowed-tools 严格限制为 Read + Bash（只用于 find/grep）——不使用 Write/Edit，这是"只汇报不修改"原则的工具层保障
- 本讲强调"在事上练"（引用王兴的话）——不是因为"要学 SKILL"才写 SKILL，是因为"我有这个问题"才用 SKILL，场景驱动工具

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 判断一件事值不值得写成 SKILL 的三个特征是什么？分别用一句话解释。
2. docs-auto-sync SKILL 的核心设计原则是什么？为什么不让 AI 自动修改文件？
3. CLAUDE.md 和 SKILL 在 AI 协作中各自扮演什么角色？为什么说两者缺一不可？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> 三特征：① 可复制——同样的动作序列被反复执行，这个月已做五次而非偶尔一次；② 可参数化——只有几个变量在变，骨架是同一个（如新增接口流程中接口名不同但检查步骤相同）；③ 可自动化——起点清晰、终点（产出物）明确，不是那种"改着改着凭感觉做完了"的事。三个同时满足才值得写。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 核心设计原则是"只汇报不修改"——SKILL 输出差异报告，由人决定如何处理，不自动改文件。原因：① 差异可能是已知的设计决策（如某字段有意和文档不同）；② 让人做最终决策避免 AI 越权操作；③ 也体现了 03 讲"约束层"的思想——AI 的行动边界需要人来控制。allowed-tools 严格限制为 Read + Bash（只用于 find/grep），不包含 Write/Edit。
>
> ---
>
> **题目 3 - 引导答案思路：**
> CLAUDE.md 是静态知识——项目每次启动都读取，告诉 AI 这是什么项目、核心架构、禁区约定。SKILL 是动态能力——由特定场景触发，告诉 AI 怎么做特定的事（如文档同步、PR 检查）。两者互补：CLAUDE.md 的"禁区"防止 AI 改错地方，SKILL 的"步骤"指导 AI 按标准流程行动；只有 CLAUDE.md 没有 SKILL，重复流程还得靠人手动执行；只有 SKILL 没有 CLAUDE.md，AI 不了解项目背景容易误操作。
