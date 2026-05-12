---
tags: [claude-code, mermaid, architecture-diagram, legacy-project, project-understanding, visualization]
source: https://time.geekbang.org/column/article/975832
wiki: wiki/claude/002-installing-diagram-tools-mermaid-skill-for-claude-code.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 了解老项目时为什么需要三张图而不是一张架构图？三张图各自回答什么问题？
2. 画依赖图时，提示词应该让 AI 读哪三个文件？为什么这三个文件各自有用？
3. 如果你画出来的模块依赖图非常混乱，有循环依赖，这说明什么问题？应该怎么处理？

## Chapter Metadata
- Course: Claude Code 企业级老项目改造实战
- Chapter: 003 — 08｜俯视项目全景：用提示词画出架构图、模块图、依赖图
- Author: Robert
- Article ID: 975832

## Cornell Notes

### Cue Column (Questions)
- 为什么要三张图而不是一张图？
- 架构图/模块图/依赖图各自回答什么问题，解决什么实际痛点？
- 每张图的推荐提示词是什么？有哪些关键指令？
- 每张图的 review 重点是什么？
- 如果画不出整齐的图意味着什么？

### Notes Column

**实操准备**

```bash
git clone https://github.com/alibaba/spring-ai-alibaba.git
cd spring-ai-alibaba/spring-ai-alibaba-admin
```

约定：本部分所有产出（图、文档、学习笔记）统一放入 `docs/` 目录，这是贯穿整个课程的固定规范。这一讲画的三张图是 `docs/` 的第一批资产。

**为什么需要三张图（不是一张）**

每张图从不同粒度俯视同一个项目，三张不重复：

| 图名 | 俯视层次 | 回答的问题 | 解决的痛点 |
|---|---|---|---|
| 架构图 | 系统级 | 这个项目长什么样？各部分怎么协作？ | 你和 AI 对项目的基线认知不同步，改造时 AI 反复猜；架构图锚定共同认知 |
| 模块图 | 代码级 | 仓库内部怎么组织？谁依赖谁？ | 不知道改动辐射范围，改 server-core 会不会波及 server-runtime？有图一眼就清楚 |
| 依赖图 | 生态级 | 项目靠什么外部能力活着？ | 不知道命门在哪：升级 Spring AI 版本会不会炸？Nacos 连不上整个应用还能不能起？ |

额外价值：三张图是第 10 讲 CLAUDE.md 的前置资产，写 CLAUDE.md 时直接引用。

**第一张：架构图**

提示词：
```
读一下这个项目的 README 和顶层目录，给我画一张架构图。
前端、后端、数据库、中间件分层画，核心模块写一句话职责。
周边基础设施（日志、监控、配置）用一个方框概括就行，不用展开。
保存到 docs/architecture.svg。
```

关键指令说明：
- **"分层画"**：Spring AI Alibaba Admin 是前后端分离，不说分层 AI 会把所有东西堆一起
- **"核心模块写一句话职责"**：默认 AI 只写模块名，方框里只有一个词，看不出 server-core 是干什么的
- **"周边基础设施用方框概括"**：防止 AI 展开日志/监控/配置中心，让主干被淹没

Spring AI Alibaba Admin 架构：React 前端（管理界面）→ Java 后端（4个 server 子模块）→ MySQL + Nacos → 外部模型 API（DashScope/OpenAI/DeepSeek）

Review 检查清单：
- ☐ 核心模块是不是都在（尤其 4 个 server 子模块）
- ☐ 前后端边界是不是画对了（frontend 应该是独立工程，通过 HTTP 调后端）
- ☐ OpenTelemetry trace 链路有没有体现（trace → OTel Collector → 存储）
- ☐ 数据流向是否真实

常见坑：① frontend 被画成跟后端并列的小方框而不是展开的前端工程 ② OpenTelemetry 漏掉 ③ 一次画完是幻觉，说"放大 Server 层把四个子模块的调用关系画细一点"继续迭代

**第二张：模块图（内部模块依赖图）**

提示词：
```
看一下项目的 pom.xml，画一张内部模块依赖图。
只画项目自己的模块，外部库不画。有循环依赖用红色标出来。
保存到 docs/module-deps.svg。
```

Spring AI Alibaba Admin 正确的依赖方向：
```
server-start → server-runtime → server-core
server-start → server-openapi → server-core
```
（server-start 是 entry point/main 函数所在，依赖所有其他模块）

Review 检查清单：
- ☐ server-start 模块是否在图中（AI 容易把 entry point 当"运行时概念"而非代码模块漏掉）
- ☐ 依赖方向是否正确（core ← runtime/openapi ← start，不能反过来）
- ☐ frontend 是否被错误地画进来（frontend 是独立 React 工程，通过 HTTP 调后端，不通过 Maven 依赖）
- ☐ 有没有循环依赖需要作为真实架构问题记录

**第三张：依赖图（外部依赖图）**

提示词：
```
综合看 pom.xml、application.yml 和 README，帮我梳理这个项目
对外依赖了什么，分成三类：关键 Java 依赖、中间件、外部 API。
画出来，每类用不同颜色。保存到 docs/external-deps.svg。
```

三类来源与内容（Spring AI Alibaba Admin）：
- **关键 Java 依赖**（来自 pom.xml）：Spring AI、Spring Boot Actuator、Micrometer 等
- **中间件**（来自 application.yml + docker-compose）：MySQL、Nacos、OTel Collector
- **外部 API**（来自 README Configure Your API Keys 节）：DashScope、OpenAI、DeepSeek 等模型提供商

Review 检查清单：
- ☐ 三类是不是都有（Java 依赖 + 中间件 + 外部 API）
- ☐ 中间件是否全（AI 可能不知道要读 application.yml，第一版只有 Java 依赖 → 让它读 application-*.yml 补）
- ☐ 外部模型 API 是否列出（它们在 pom.xml 里没有，在 README 的 API Keys 配置节里才有）
- ☐ 没有把 Spring Boot 几百个 transitive 依赖全画进来（提示词里强调"关键"两字就是为了这个）

**画不出整齐的图意味着什么**

如果画到一半发现某张图特别难画，通常不是技能问题，是项目本身的架构问题：
- 循环依赖 → 真实的架构问题
- 模块职责不清 → 真实的架构问题
- 外部依赖一团乱麻 → 真实的架构问题

"画不出整齐的图"本身是一个重要信号，是诊断结果，不是失败。

**Review 和存档的核心原则**

画完不是终点，`review → 修正 → 定稿存 docs/` 才算完成。定稿后三张图是你和 AI 的共同记忆：
- 10 讲写 CLAUDE.md 会直接引用
- 后续每一讲改造时都可能翻出来对照
- 图画扎实，后续所有课程都轻松；图画草率，后续每次改造 AI 都在重新猜

### Summary

第八步心法的第四步"画项目全景"需要三张图而非一张：架构图（系统级）锚定共同认知防止改造跑偏，模块图（代码级）暴露依赖关系让影响范围一眼可见，依赖图（生态级）揭示项目命门帮助评估升级/迁移风险。在 Spring AI Alibaba Admin 上实操三张图，每张都有对应的提示词关键词、review 清单和常见坑。图画不出来整齐是架构问题的诊断信号，不是技能失败。

## Key Takeaways
- 三张图三个粒度：架构图（系统级）→ 模块图（代码级）→ 依赖图（生态级），缺任何一张都有盲区
- 架构图关键词"分层"+ "一句话职责"；模块图关键词"读 pom.xml"+ "只画内部模块"；依赖图关键词"三类分开画"+ "读 application.yml"
- Spring AI Alibaba Admin 正确模块依赖方向：`server-start → runtime/openapi → core`，方向画反是错误
- **画不出整齐的图 = 架构问题的诊断信号**，不是技能问题——循环依赖、模块职责不清是真实存在的架构债务
- 所有产出存 `docs/`，三张图是 CLAUDE.md 的前置资产，定稿一次后续直接复用

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[架构图]]：系统级俯视，mermaid `graph TD/LR`，前后端/数据库/中间件分层；锚定工程师与 AI 的共同认知基线
- [[模块依赖图]]：代码级俯视，有向图展示项目内部模块依赖关系；循环依赖用红色标出
- [[外部依赖图]]：生态级俯视，三类分组（关键 Java 依赖/中间件/外部 API），每类不同颜色
- [[Spring AI Alibaba Admin]]：本课程示范项目，4 个 server 子模块（core/runtime/openapi/start）+ React frontend + MySQL + Nacos + OTel
- [[docs目录规范]]：本课程约定所有产出图、文档、笔记统一存入 `docs/`，贯穿整个第二部分
- [[项目全景图]]：三张图的组合——架构图 + 模块依赖图 + 外部依赖图，对应八步心法第四步

### 2. 课程内导航链接
- [[001-eight-step-method-for-understanding-legacy-projects|第 06 讲 八步心法]]：本讲实操八步心法的第四步"画项目全景"
- [[002-installing-diagram-tools-mermaid-skill-for-claude-code|第 07 讲 安装画图工具]]：本讲依赖上一讲装好的 claude-mermaid 画图能力
- [[004-interfaces-and-data-models-ai-generate-api-list-and-schema|第 09 讲 接口和数据模型]]：下一讲继续深入第五步，产出接口清单和数据模型说明

### 3. 课程外与通用概念关联
- [[mermaid]]：三张图全部使用 mermaid 语法，graph TD/LR/erDiagram/sequenceDiagram
- [[claude-code]]：实操工具，通过 claude-mermaid SKILL 直接输出 SVG
- [[harness-engineering]]：三张图最终写入 [[CLAUDE.md]]，成为 AI 辅助改造的上下文资产

### 4. 推荐关系边
- [[架构图]] → enables → [[CLAUDE.md]]
- [[模块依赖图]] → enables → [[CLAUDE.md]]
- [[外部依赖图]] → enables → [[CLAUDE.md]]
- [[项目全景图]] → composed-of → [[架构图]]
- [[项目全景图]] → composed-of → [[模块依赖图]]
- [[项目全景图]] → composed-of → [[外部依赖图]]
- [[Spring AI Alibaba Admin]] → implements → [[项目全景图]]
- [[模块依赖图]] → prevents → [[改动辐射范围盲区]]

### 5. 后续值得沉淀成卡片的主题
- [[Spring AI Alibaba Admin]]
- [[docs目录规范]]
- [[外部依赖图]]
- [[循环依赖]]

## Notes For Review
- 10 讲写 CLAUDE.md 时会引用这三张图，注意对应关系
- 依赖图三类（Java 依赖/中间件/外部 API）的来源文件不同：pom.xml / application.yml / README

---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 架构图、模块依赖图、外部依赖图分别回答什么问题？各自解决改造中的什么痛点？
2. Spring AI Alibaba Admin 正确的模块依赖方向是什么？画反了会有什么后果？
3. 如果外部依赖图第一版画出来只有 Java 依赖、没有中间件，你应该怎么处理？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> 架构图回答"系统骨架长什么样"，解决的是"你和 AI 对项目认知不同步"的问题——没有共同基线，每次让 AI 改造它都要重新猜系统形态。模块依赖图回答"改一个模块会拖动谁"，解决的是"辐射范围不可见"问题——想改 server-core 必须知道谁依赖它。外部依赖图回答"项目的命门在哪"，解决的是"升级/迁移成本未知"问题——Nacos 连不上应用能不能起、升级 Spring AI 版本会不会炸。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 正确方向：`server-start → server-runtime → server-core` 和 `server-start → server-openapi → server-core`，即 start 依赖 runtime 和 openapi，runtime 和 openapi 都依赖 core。如果画反（比如 core 依赖 runtime），说明图是错的，是对项目结构的错误理解——这会导致 CLAUDE.md 里写入错误的架构描述，后续 AI 改造时依据错误上下文行动，可能改错位置。
>
> ---
>
> **题目 3 - 引导答案思路：**
> 这是 AI 没有读对来源文件。中间件信息不在 pom.xml 里，在 `application.yml` 和 `application-*.yml` 里（数据库连接配置、Nacos 地址等），以及 `docker-compose.yml` 里。应该直接告诉 AI："去读 application.yml 和 application-*.yml，看项目连了什么中间件"，让它迭代出包含中间件的新版本。
