---
tags: [claude-code, mermaid, diagram, skill, visualization, legacy-project]
source: https://time.geekbang.org/column/article/975826
wiki: wiki/claude/002-installing-diagram-tools-mermaid-skill-for-claude-code.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. Claude Code 出厂时能直接生成架构图的 PNG 文件吗？如果不能，通常怎么扩展这个能力？
2. 老项目改造过程中最常用的四类图分别是什么？各自回答什么问题？
3. 为什么说"AI 画的图一定有错"？这对你的工作流意味着什么？

## Chapter Metadata
- Course: Claude Code 企业级老项目改造实战
- Chapter: 002 — 07｜安装画图工具：给 Claude Code 装上画图 Skill
- Author: Robert
- Article ID: 975826

## Cornell Notes

### Cue Column (Questions)
- Claude Code 的 SKILL 机制是什么？与 npm package 有什么类比？
- claude-mermaid 的完整安装步骤是什么，缺哪一步会失败？
- 四类必备图各自适合画什么，推荐的提示词模式是什么？
- 让图"好看"的三个细节是什么？
- AI 画图的硬性约束是什么，工程师必须做什么？

### Notes Column

**SKILL 生态：Claude Code 的扩展机制**

Claude Code 启动时扫描两个目录，加载所有 SKILL：
- `~/.claude/skills/`（全局 SKILL，所有项目共用）
- `.claude/skills/`（项目级 SKILL，当前项目专用）

一个 SKILL 的结构：
```
my-skill/
  SKILL.md        # 告诉 Claude Code 这个 SKILL 干什么、什么时候用
  references/     # 可选：参考文档、辅助脚本
```

安装方式两种：
- **Plugin marketplace**：`/plugin marketplace add <github-repo>` + `/plugin install` — 自动处理依赖和 MCP Server，最省事
- **手动 clone**：`git clone` 到 skills/ 目录后重启，更透明，适合想查看或修改 SKILL 内容的场景

**安装 claude-mermaid（两步缺一不可）**

Step 1 — 安装渲染程序（真正干活的 Node 程序）：
```bash
npm install -g claude-mermaid   # Node 版本需要 20+，先 node -v 确认
```

Step 2 — 在 Claude Code 里安装 Plugin（SKILL 定义 + MCP 配置）：
```
/plugin marketplace add veelenga/claude-mermaid
/plugin install claude-mermaid@claude-mermaid
```

安装完后**完全退出 Claude Code 再重新启动**（不是 reload），让 MCP Server 起来。装好后 Claude Code 能直接输出 PNG/SVG/PDF，支持多主题、浏览器实时预览。

**四类必备图：场景 + 提示词 + 常见坑**

| 图类 | Mermaid 语法 | 回答的问题 | 使用场景 |
|---|---|---|---|
| 架构图 | `graph TD` / `graph LR` | 系统骨架是什么 | 第八步画全景、CLAUDE.md 项目架构节、改造时判断影响范围 |
| 模块依赖图 | `graph LR` / `flowchart` | 哪个模块依赖谁，改一个拖动谁 | 第八步画全景、改造前评估辐射范围 |
| 时序图 | `sequenceDiagram` | 一次调用的完整生命周期 | 梳理接口时画 API 调用链路、复现 bug、改造前后对比 |
| ER 图 | `erDiagram` | 表和表的外键关系 | 梳理数据模型、DB 相关改造、给接手同事讲数据结构 |

各类图推荐提示词：

**架构图**：
```
帮我画一张这个项目的架构图。前端、后端、数据库、外部服务分层画出来。
每个模块写名字加一句话职责。别画实现细节，服务级就够了。
保存成 ./docs/architecture.svg，dark 主题。
```
常见坑：① 分层不说 AI 会堆一团，要加 subgraph ② 周边设施（日志/监控/配置）加一句"用方框概括别展开" ③ 迭代是常态，说"把 XX 模块展开再画一张"

**模块依赖图**：
```
看一下我的 pom.xml，画一张项目内部模块之间的依赖图。
外部库不画。有循环依赖用红色标出来。
保存成 ./docs/module-deps.svg。
```
关键：强调"看 pom.xml"，AI 否则会根据模块名瞎猜依赖方向。

**时序图**：
```
帮我画 POST /api/prompts/create 这个接口的调用链时序图。
先去 grep 真实代码，从 Controller 一路追到 DB。
标清楚每一步是哪个类哪个方法，保存成 ./docs/sequence-create-prompt.svg。
```
关键：必须加"先 grep 真实代码"，否则 AI 根据接口名瞎猜调用链。

**ER 图**：
```
看项目里的建表 SQL（db/migration 或 resources 里），画一张 ER 图。
主键、外键、表之间的关系标清楚。保存成 ./docs/schema.svg。
```
关键：必须让它读真实 DDL 或 JPA entity，否则 AI 根据表名猜字段。

**工具策略：三层分工**

- **Mermaid（90% 场景）**：Claude Code/Cursor/GitHub/Notion/VS Code 原生支持，AI 生成能力最强，快速迭代用它
- **PlantUML（偶尔）**：需要复杂 UML（带 frame 的时序图、详细类图）时，表达力比 mermaid 强，但 AI 生成容易出错
- **DrawIO（最终交付）**：PPT、正式文档的精修图，不适合让 AI 快速生成，用 mermaid 初稿 + drawio 精修

**让图好看的三个细节**

1. **加颜色**：核心模块冷色（蓝/紫），周边模块暖色（灰/琥珀），外部系统中性色；mermaid 用 `classDef` 定义样式批量应用
2. **留白**：每个方框一行标题 + 一句话描述，细节放配套文档，图是索引不是百科
3. **固定方向**：架构图统一选 TD 或 LR，整个项目所有架构图方向不变，扫一眼就能对照

**硬守一条线：AI 画的图一定有错**

可能的错误类型：把废弃模块画成核心、漏掉重要的异步通道、把 3 个表的关系画反、把 Controller 的重载方法当成两个独立接口。AI 基于它读到的代码画图，老项目里代码之外的东西（隐性约定、历史包袱、对接方需求）它看不见。

**工作流**：AI 起稿 → 工程师 review 并修正 → 定稿存入 `docs/` → 成为 CLAUDE.md 的前置资产

### Summary

这一讲解决了第四步"画项目全景"的前置问题：让 Claude Code 真正具备画图能力。SKILL 机制是 Claude Code 的扩展点，通过装 claude-mermaid（两步缺一不可：`npm install -g claude-mermaid` + `/plugin install`），Claude Code 可以直接输出 SVG/PNG。老项目改造中最需要的四类图（架构/模块依赖/时序/ER）各有对应的提示词模式和常见坑。核心约束：AI 画的图一定有错，工程师必须 review + 修正 + 存档。

## Key Takeaways
- Claude Code 出厂无画图能力，通过 SKILL 机制扩展：`~/.claude/skills/` 或项目 `.claude/skills/`，重启即生效
- claude-mermaid 安装两步缺一不可：① `npm install -g claude-mermaid`（Node 20+）② `/plugin install claude-mermaid@claude-mermaid`，装完需完全退出重启
- 四类图各有专属提示词技巧：架构图加"分层"防堆叠，模块图加"看 pom.xml"防猜测，时序图加"grep 真实代码"防臆造，ER 图加"读 DDL/JPA entity"防字段瞎猜
- 工具三层分工：mermaid（日常迭代）→ plantuml（复杂 UML）→ drawio（最终交付精修）
- **硬约束**：AI 画的图一定有错，必须执行"AI 起稿 → 工程师 review → 修正 → 存 docs/" 三步，否则图是负债不是资产
- 图的美学三原则：颜色分层（classDef）、留白（图是索引不是百科）、固定方向（统一 TD 或 LR）

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[SKILL机制]]：Claude Code 的扩展点，通过 `~/.claude/skills/` 或 `.claude/skills/` 目录加载，每个 SKILL 是一个含 SKILL.md 的文件夹
- [[claude-mermaid]]：veelenga 开发的 MCP Server + Plugin 一体方案，让 Claude Code 能直接输出 SVG/PNG/PDF 格式的 mermaid 图表
- [[架构图]]：用 mermaid `graph TD/LR` 画系统骨架，分层展示前端/后端/数据库/中间件的调用关系
- [[模块依赖图]]：有向图，节点是项目模块，边是依赖关系；循环依赖用红色标出，改造辐射范围评估的关键工具
- [[时序图]]：mermaid `sequenceDiagram`，展示一次 API 调用从 Controller 到 DB 的完整生命周期
- [[ER图]]：mermaid `erDiagram`，展示数据表之间的主外键关系，DB 改造的必备参考
- [[AI画图工作流]]：AI 起稿 → 工程师 review 修正 → 定稿存 `docs/` → 作为 [[CLAUDE.md]] 的前置资产

### 2. 课程内导航链接
- [[001-eight-step-method-for-understanding-legacy-projects|第 06 讲 八步心法]]：本讲是第 07 讲，为该讲的第四步"画项目全景"提供工具基础
- [[003-birds-eye-view-draw-architecture-module-dependency-diagrams|第 08 讲 俯视项目全景]]：装好画图能力后，下一讲在 Spring AI Alibaba Admin 上实际产出三张全景图
- [[004-interfaces-and-data-models-ai-generate-api-list-and-schema|第 09 讲 接口和数据模型]]：梳理接口时用时序图画 API 调用链，与本讲的时序图技巧直接关联

### 3. 课程外与通用概念关联
- [[claude-code]]：本讲所有操作的宿主工具，SKILL 机制是其核心扩展点
- [[mermaid]]：主流的文本化图表工具，Claude Code/Cursor/GitHub/Notion 原生支持，AI 生成能力最强
- [[harness-engineering]]：图表资产（docs/ 下的图）最终会写入 [[CLAUDE.md]]，成为 harness 的上下文资产

### 4. 推荐关系边
- [[claude-mermaid]] → extends → [[Claude Code]]
- [[SKILL机制]] → enables → [[claude-mermaid]]
- [[AI画图工作流]] → protects → [[架构图]]
- [[架构图]] → enables → [[CLAUDE.md]]
- [[模块依赖图]] → enables → [[CLAUDE.md]]
- [[时序图]] → enables → [[接口清单]]
- [[ER图]] → enables → [[数据模型说明]]

### 5. 后续值得沉淀成卡片的主题
- [[SKILL机制]]
- [[claude-mermaid]]
- [[AI画图工作流]]
- [[classDef]]

## Notes For Review
- 08 讲实操三张图：架构图 + 模块依赖图 + 依赖图，与本讲四类图（架构/依赖/时序/ER）的关系是：08 讲画的是前三类的交叉产物
- 11 讲会讲如何自己写 SKILL.md，本讲是"消费者"视角，11 讲是"生产者"视角

---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 安装 claude-mermaid 需要哪两步？缺少第一步会怎样？安装完成后还需要做什么才能让它生效？
2. 给时序图的提示词中，最关键的一句是什么？省掉这句会出现什么问题？
3. "AI 画的图一定有错"这个约束对你的工作流有什么具体影响？完整的图表工作流是什么？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> 两步：① `npm install -g claude-mermaid`（安装真正干渲染活的 Node 程序，需 Node 20+）② `/plugin install claude-mermaid@claude-mermaid`（在 Claude Code 里安装 SKILL 定义和 MCP 配置）。缺少第一步只装了空壳，没有渲染能力。安装完还需要**完全退出 Claude Code 再重新启动**（不是 reload），让 MCP Server 启动。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 最关键的一句是"先去 grep 真实代码"（或类似表述，要求 AI 从 Controller 一路追到 DB 读实际实现）。省掉这句，AI 会根据接口名称臆造调用链——例如接口叫 `createPromptTemplate`，AI 可能直接编一个看起来合理的调用链，但实际代码的调用方式可能完全不同，产出的时序图就是错的。
>
> ---
>
> **题目 3 - 引导答案思路：**
> 影响：不能"AI 画完就完"，必须执行 review 和修正步骤。完整工作流是：AI 基于真实代码起稿 → 工程师 review（问：核心模块是否都在？依赖方向是否正确？有没有漏掉关键链路？）→ 修正到准确 → 定稿存入 `docs/` → 成为 CLAUDE.md 和后续改造的参考资产。图修正后存档比留在脑子里可靠得多，也是八步心法"沉淀文档"原则的体现。
