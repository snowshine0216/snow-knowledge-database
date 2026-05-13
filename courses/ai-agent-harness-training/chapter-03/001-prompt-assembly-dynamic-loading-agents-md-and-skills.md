---
tags: [context-engineering, prompt-engineering, agent-harness, go, agent-skills, agents-md, prompt-composer, progressive-disclosure, harness-engineering]
source: https://time.geekbang.org/column/article/975209
wiki: wiki/courses/ai-agent-harness-training/chapter-03/001-prompt-assembly-dynamic-loading-agents-md-and-skills.md
---

## Pre-test

*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 如果把所有项目规范（架构、Git 流程、数据库命名）全塞进 System Prompt 一个字符串里，会有什么问题？
2. AGENTS.md 文件应该由谁来维护？它和代码引擎是什么关系？
3. Agent Skills 规范中的 SKILL.md 文件必须包含哪两个 YAML 字段？

## Chapter Metadata
- Course: AI Agent 实战训练营
- Chapter: 010 — 提示词组装：告别面条代码，动态加载 AGENTS.md 与外挂 Skills
- Author: Tony Bai
- Date: 2026-05-13
- Article ID: 975209

## Cornell Notes

### Cue Column (Questions)
- 什么是"面条提示词"？它带来哪两类危害？
- 工业级 Harness 中 System Prompt 的正确定位是什么？
- OpenClaw 分层加载策略的三层是什么？每层的职责边界在哪里？
- Agent Skills 规范（agentskills.io）定义了怎样的目录和文件结构？
- go-tiny-claw 的 PromptComposer 如何将三层内容拼装为一条 schema.Message？
- SkillLoader 如何在不引入第三方库的前提下解析 SKILL.md 的 YAML Frontmatter？
- "渐进式暴露（Progressive Disclosure）"在 Skills 加载上的具体含义是什么？
- 当前 Eager Loading 的代价是什么？懒加载的设计方向是什么？

### Notes Column

#### 1. 面条提示词反模式与 Context Bloat

go-tiny-claw 原始 System Prompt 只有一行硬编码："You are go-tiny-claw, an expert coding assistant..."。当团队想让 Agent 遵守"必须用 Gin 框架""git commit 必须加 feat: 前缀"等规范时，很多开发者会把所有规则一股脑追加到这个字符串里，形成**面条提示词（Spaghetti Prompt）**。

危害有两类：
1. **Token 浪费**：不相关的 500-Token Git 规范在用户只问天气时也会全量发送，白白消耗 API 费用。
2. **注意力稀释**：冗余信息挤压模型对关键指令的注意力带宽，在真正重要的地方产生幻觉。

#### 2. System Prompt = 操作系统内核

工业级 Harness 工程中，System Prompt 不是"文本常量"，而是**大模型运行时的操作系统内核（Kernel）**：它需要根据运行时环境动态编译（Compile）和动态链接（Dynamic Link）不同的知识模块。

#### 3. 三层分层加载策略（OpenClaw 哲学）

| 层级 | 内容 | 维护者 | Token 预算 |
|---|---|---|---|
| Minimal Core（极简内核） | 基础身份认知、交互红线 | 引擎开发者（硬编码） | < 1 000 Tokens |
| AGENTS.md（工作区守则） | 当前项目架构规范、禁忌事项 | 人类工程师（本地文件） | 按需 |
| Skills（技能外挂） | 特定领域 SOP 知识包 | 技能库维护者（.claw/skills/） | 按需 |

关键原则：**知识与状态外部化**——极易变化的业务规范不写进代码引擎，由人类以文件形式在工作区维护。

#### 4. Agent Skills 规范（agentskills.io）

Anthropic 推出的开放轻量规范。核心结构：

```
my-skill/
├── SKILL.md   ← 必填：YAML Frontmatter + Markdown 指令正文
├── scripts/   ← 选填：可执行脚本
├── references/ ← 选填：参考文档
└── assets/    ← 选填：模板/静态资源
```

SKILL.md 必须以 YAML Frontmatter 开头，两个必需字段：
- `name`：技能名称
- `description`：触发条件描述（大模型用它判断是否激活该技能）

两阶段加载模型：
- **Discovery 阶段**（引擎启动时）：只解析 YAML 头部，将 name + description 告知大模型
- **Activation 阶段**（大模型判定需要时）：加载完整 Markdown 正文（Body）

本讲实现中，为保持架构极简，使用 Eager Loading（全量加载），但严格遵循目录和文件规范，为后续懒加载打基础。

#### 5. go-tiny-claw 实现：PromptComposer + SkillLoader

**新增目录结构：**
```
internal/context/
├── skill.go    ← SkillLoader：遍历 .claw/skills/，手写轻量 YAML 解析器
└── composer.go ← PromptComposer：Build() 方法拼装三层内容
```

**SkillLoader 解析逻辑（skill.go）：**
- 遍历 `.claw/skills/` 目录，寻找名为 `SKILL.md` 的文件
- 用字符串切割解析 YAML Frontmatter（`strings.SplitN(content, "---", 3)`），提取 `name` 和 `description`
- 不引入第三方 YAML 库，保持零依赖

**PromptComposer.Build() 拼装顺序（composer.go）：**
1. 极简内核字符串（硬编码，6 条核心纪律 + 身份声明）
2. 读取 `<workDir>/AGENTS.md` 文件内容（若存在则注入，不存在则跳过）
3. 调用 `skillLoader.LoadAll()` 追加 Skills 块

返回一条 `schema.Message{Role: schema.RoleSystem, Content: ...}`

**注入 Main Loop（loop.go）：**
```go
// 一行替换全部硬编码面条提示词
systemMsg := e.composer.Build()
contextHistory := []schema.Message{systemMsg, {Role: schema.RoleUser, Content: userPrompt}}
```

**TerminalReporter（terminal_reporter.go）：**
- 实现第 09 讲定义的 `Reporter` 接口（`OnThinking` / `OnToolCall` / `OnToolResult` / `OnMessage`）
- 用于本地 CLI 调试，打印 🤔 / 🛠️ / ✅ / ❌ 图标和截断后的参数

#### 6. 实战验证结果

测试场景：在 workspace/ 目录下放置 AGENTS.md（要求返回 JSON + 中文错误）和 `.claw/skills/git-workflow/SKILL.md`（要求 commit message 以 Emoji 开头），然后让 Agent "写一个 HTTP ping 接口并提交代码"。

Agent 自动：
- 返回 `{"code": 200, "message": "pong"}` JSON 格式（来自 AGENTS.md 约束）
- commit message 为 `🚀 feat: 添加 HTTP ping 接口`（来自 Skills 约束）
- **go-tiny-claw 的 Go 源码中没有写任何关于 git commit 或 JSON 格式的规则代码**

这就是**状态与知识外部化**的降维打击力量。

#### 7. 当前瓶颈与思考题

- **Eager Loading 的代价**：50 个高阶技能包 → 开局消耗几万 Token
- **思考题**：设计 `read_skill` 工具，实现 Progressive Disclosure 懒加载：
  - Discovery：System Prompt 只注入 YAML 元数据（name + description）
  - Activation：大模型判定需要时主动调用 `read_skill` 工具，按需加载 Body

### Summary

本讲正式进入上下文工程体系（Context Engineering）模块，核心观点是：**System Prompt 是操作系统内核，必须模块化动态编译，而非硬编码字符串**。go-tiny-claw 实现了三层分层加载架构（Minimal Core + AGENTS.md + Agent Skills），将业务规范彻底外部化到工作区文件，使引擎代码与规范知识解耦。标准化的 Agent Skills 规范（SKILL.md = YAML Frontmatter + Markdown 指令）为后续渐进式暴露的懒加载架构奠定了基础；当前实现仍为 Eager Loading，多技能场景下的 Token 爆炸问题是下一步要解决的挑战。

## Key Takeaways
- **System Prompt 是内核，不是常量**：工业级 Harness 把 System Prompt 视为运行时动态链接的 Kernel，同一套引擎代码在不同工作区中展现出完全不同的"规矩感"
- **三层外部化**：Minimal Core（< 1000 Tokens 硬编码）→ AGENTS.md（项目规范，人类维护）→ Skills（领域 SOP，按需加载）；层层解耦，各司其职
- **AGENTS.md 零代码切换项目规范**：只需在工作区根目录放一个 AGENTS.md，Agent 就能"入乡随俗"——测试中 Agent 自动遵守 JSON 格式和中文错误要求，源码无任何相关代码
- **SKILL.md 两字段触发**：`name` + `description` 是 Agent Skills 规范的最小必需元数据；description 是大模型判断是否激活技能的唯一依据
- **Progressive Disclosure 两阶段**：Discovery 只给 YAML 头（省 Token），Activation 才给 Markdown Body（精准加载）；本讲实现了目录规范，懒加载逻辑留待后续
- **测试验证：无代码规则，全靠外部文件**：Agent 自动产出 `🚀 feat: 添加 HTTP ping 接口`，来自 `.claw/skills/git-workflow/SKILL.md` 的约束，不是引擎代码写死的
- **下一站危机**：50 个技能包的 Eager Loading → 开局几万 Token；同时随着长程对话积累，Context Window 终将被撑爆 → 下两讲解决 Session 隔离与 Context Compactor

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[Prompt-Composer]]：提示词动态组装器，go-tiny-claw 的 `internal/context/composer.go`，`Build()` 方法按序拼装 [[Minimal-Core]]、[[AGENTS-md]]、[[Agent-Skills]]，返回 `schema.Message{Role: RoleSystem}`
- [[AGENTS-md]]：工作区守则文件，项目根目录下由人类维护，声明架构规范与禁忌，实现状态外部化；引擎读取后注入 System Prompt
- [[Agent-Skills]]：Anthropic 推出的开放技能规范（agentskills.io），每个技能 = 独立目录 + [[SKILL-md]]，支持 Discovery / Activation 两阶段加载
- [[SKILL-md]]：技能描述文件，YAML Frontmatter（`name` + `description`）+ Markdown 指令正文；`description` 是大模型激活技能的判断依据
- [[Spaghetti-Prompt]]：面条提示词反模式，将所有规范硬编码为一个字符串，导致 [[Context-Bloat]]；本讲 [[Prompt-Composer]] 直接替代它
- [[Context-Engineering]]：上下文工程体系，专栏第三大模块；核心哲学：状态与知识外部化、按需动态加载
- [[Minimal-Core]]：极简内核，< 1 000 Tokens，只硬编码最基础的身份认知与红线纪律；[[Prompt-Composer]] 三层中最底层
- [[Progressive-Disclosure]]：渐进式暴露，[[Agent-Skills]] 加载的核心优化策略：Discovery 只给元数据，Activation 才加载全文
- [[SkillLoader]]：Go 实现的 `.claw/skills/` 目录扫描器，手写轻量 YAML 解析器（无第三方依赖），解析 [[SKILL-md]] 的 Frontmatter

### 2. 课程内导航链接
- [[02-main-loop-react-cycle|第 02 讲 Main Loop ReAct 循环]]：[[Prompt-Composer]] 的 `Build()` 在 Main Loop 的第一轮 Turn 时被调用，`systemMsg` 成为 `contextHistory` 的第一条消息
- [[04-provider-interface-claude-openai-adapter|第 04 讲 Provider 适配层]]：[[Prompt-Composer]] 生成的 System Message 通过 Provider 接口发送给 LLM；Provider 层不感知 Prompt 内容，职责解耦
- [[05-tool-registry-and-dispatch|第 05 讲 Tool Registry 与分发]]：Tool Registry 负责"工具能力"，[[Agent-Skills]] 负责"领域知识 SOP"，两者都是 Agent 能力的模块化载体，但机制不同
- [[09-feishu-integration-connect-go-tiny-claw-to-feishu-bot-event-stream|第 09 讲 飞书集成]]：第 09 讲抽象出 `Reporter` 接口；本讲新增 `TerminalReporter` 实现，用于本地 CLI 测试 [[Prompt-Composer]] 效果

### 3. 课程外与通用概念关联
- [[harness-engineering|Harness Engineering]]：驾驭工程，[[Context-Engineering]] 是其第三大支柱模块；[[Spaghetti-Prompt]] 是 Harness 工程明确反对的反模式
- [[openclaw-architecture|OpenClaw]]：顶级开源 Agent 引擎，[[Prompt-Composer]] 的极简三层策略直接源于 OpenClaw 哲学；后续 Context Compactor 也受其启发
- [[context-window-management|Context Window 管理]]：[[Progressive-Disclosure]] 是 Context 管理的核心手段；本讲 Eager Loading 是临时妥协，下两讲进入 Compactor 体系

### 4. 推荐关系边（可直接扩成独立卡片）
- [[Prompt-Composer]] → replaces → [[Spaghetti-Prompt]]
- [[Prompt-Composer]] → composed-of → [[Minimal-Core]]
- [[Prompt-Composer]] → composed-of → [[AGENTS-md]]
- [[Prompt-Composer]] → composed-of → [[Agent-Skills]]
- [[SkillLoader]] → implements → [[Progressive-Disclosure]]
- [[Agent-Skills]] → governed-by → [[SKILL-md]]
- [[AGENTS-md]] → enables → [[Context-Engineering]]
- [[Context-Engineering]] → prevents → [[Context-Bloat]]

### 5. 后续值得沉淀成卡片的主题
- [[Spaghetti-Prompt]]
- [[Context-Engineering]]
- [[Prompt-Composer]]
- [[AGENTS-md]]
- [[Agent-Skills]]
- [[SKILL-md]]
- [[Progressive-Disclosure]]
- [[Minimal-Core]]

## Notes For Review
- read_skill 懒加载工具的设计：如何在 Tool Registry 层面实现按需技能加载？调用时机如何与大模型推理循环协作？
- Agent Skills 规范的 `description` 字段：大模型如何在 Discovery 阶段仅凭 name + description 准确判断激活时机？需要怎样的 description 写法？
- AGENTS.md 与 .claw/skills/ 的边界：什么内容适合放 AGENTS.md（项目级规范），什么适合封装为 Skill（可复用 SOP）？

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. go-tiny-claw 的 `PromptComposer.Build()` 方法按什么顺序组装三层内容？每层的来源和作用是什么？
2. 为什么 SKILL.md 规范中的 YAML Frontmatter 对于"渐进式暴露（Progressive Disclosure）"架构至关重要？Discovery 阶段和 Activation 阶段分别加载什么？
3. 当前 SkillLoader 的 Eager Loading 实现有什么具体缺陷？你会如何设计一个 `read_skill` 工具来实现懒加载？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> `Build()` 按固定顺序拼接三层：① **Minimal Core**（硬编码字符串：身份 + 6 条红线纪律，< 1000 Tokens）→ ② **AGENTS.md**（读取 `<workDir>/AGENTS.md` 文件，若存在则追加，声明项目专属架构规范）→ ③ **Skills**（调用 `skillLoader.LoadAll()` 扫描 `.claw/skills/` 目录，追加所有 SKILL.md 解析结果）。最终返回一条 `schema.Message{Role: RoleSystem}`。
>
> ---
>
> **题目 2 - 引导答案思路：**
> YAML Frontmatter 的 `name` 和 `description` 字段是两阶段加载的分割线。**Discovery 阶段**：引擎启动时只解析并注入 YAML 元数据（`name` + `description`），Token 消耗极小，大模型凭 `description` 判断当前任务是否需要该技能。**Activation 阶段**：大模型判定需要时，才加载完整 Markdown 正文（Body）。没有 Frontmatter，就无法在"告知大模型技能存在"和"加载完整指令"之间实现解耦，两阶段加载无从实现。
>
> ---
>
> **题目 3 - 引导答案思路：**
> 当前缺陷：`LoadAll()` 在引擎启动时把所有技能正文全量拼入 System Prompt——50 个高阶技能包会在第一个 Turn 就消耗几万 Token。懒加载设计方向：① 启动时只把 `name + description` 注入 System Prompt；② 在 Tool Registry 中注册一个 `read_skill(skill_name)` 工具；③ 大模型在 Action 阶段判断需要某技能时，主动调用 `read_skill`，返回该 SKILL.md 的 Body，追加到当前 contextHistory；④ 这样每次只加载真正需要的技能全文，实现 Progressive Disclosure。
