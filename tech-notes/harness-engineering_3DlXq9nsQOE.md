---
tags: [harness-engineering, prompt-engineering, context-engineering, agent, ai-engineering, openai, anthropic]
source: https://www.youtube.com/watch?v=3DlXq9nsQOE
---

# 最近爆火的 Harness Engineering 到底是个啥？一期讲透！

## Video Info
- URL: https://www.youtube.com/watch?v=3DlXq9nsQOE
- Platform: YouTube
- Title: 最近爆火的 Harness Engineering 到底是个啥？一期讲透！
- Speaker: 幻影老师
- Channel/Event: code秘密花园
- Upload date: 2026-04-02
- Duration: 18:30
- Category and tags: Science & Technology; harness engineering, agent, prompt engineering, context engineering

## Executive Summary

幻影老师系统讲解了 AI 工程领域的第三次重心迁移——Harness Engineering。核心论点是：当模型能力趋同后，Agent 能否稳定交付取决于模型之外的运行系统设计，而非提示词优化。通过自身实践案例（成功率从 70% 提升至 95%）和 Anthropic、OpenAI 的工程实践，论证了 Harness 六层架构是构建可靠 Agent 系统的关键框架。最重要的结论：AI 落地的核心挑战正从"让模型看起来更聪明"转向"让模型在真实世界里稳定工作"。

## Outline

1. **问题引入** — 为什么同样的模型，别人的 Agent 成功率高而自己的不行？
2. **亲身案例** — 不改模型不改提示词，仅改 Harness，成功率从 70% 飙升至 95%
3. **三次重心迁移** — Prompt Engineering → Context Engineering → Harness Engineering 的演进脉络
4. **Prompt Engineering 阶段** — 本质是塑造局部概率空间，擅长澄清任务但不擅长填补知识
5. **Context Engineering 阶段** — 模型必须在合适时机拿到正确信息，RAG 是典型实践
6. **Agent Skills 与渐进式披露** — 不是一次性全给，而是按需暴露信息
7. **Harness Engineering 阶段** — 当模型连续行动时，谁来监督、约束和纠偏？
8. **通俗类比** — 用"新人客户拜访"类比三者关系
9. **Harness 六层架构** — 从上下文管理到失败恢复的完整架构详解
10. **真实案例验证** — 浪潮仅改 Harness 排名从 30+ 杀入前 5
11. **Anthropic 实践** — context refit 与 Planner-Generator-Evaluator 分离
12. **OpenAI 实践** — 工程师变为环境设计者、渐进式披露、Agent 自验证
13. **总结** — 三者的关系与适用场景

## Detailed Chapter Summaries

### 1. 问题引入
> **Segment**: 0:00–1:30

以一个普遍困惑开场：为什么用同样的模型、同样的提示词，别人的 Agent 能稳定工作，自己的却频繁翻车？这不是模型的问题，而是模型之外的"系统"没有搭好。

### 2. 亲身案例：70% → 95%
> **Segment**: 1:30–3:00

幻影老师分享自身实战经验：在不更换模型、不修改提示词的前提下，仅通过改造任务拆解方式、状态管理机制、关键步骤校验和失败恢复策略，将 Agent 的任务成功率从不到 70% 提升至 95% 以上。

> 这个案例直接证明了：决定 Agent 成败的不是模型本身，而是模型运行的支撑系统。

### 3. 三次重心迁移
> **Segment**: 3:00–3:30

AI 工程的重心经历了三次迁移：
- **Prompt Engineering**：对指令的工程化
- **Context Engineering**：对输入环境的工程化
- **Harness Engineering**：对整个运行系统的工程化

三者是包含关系而非替代关系。引用 LangChain 的定义：Agent = Model + Harness，即 Agent 系统里除模型本身以外所有决定能否稳定交付的部分都算 Harness。

### 4. Prompt Engineering 阶段
> **Segment**: 3:30–5:30

Prompt Engineering 的本质是塑造局部概率空间——通过指令让模型在正确的方向上生成内容。它擅长澄清任务（"你是一个...请按照...格式回答"），但不擅长填补模型本身缺失的知识。

> 当任务需要的不仅仅是"说得对"，还需要"做得对"时，Prompt Engineering 就触及了它的天花板。

### 5. Context Engineering 阶段
> **Segment**: 5:30–7:30

Context Engineering 解决的核心问题是：模型必须在合适的时机拿到正确的信息。RAG（Retrieval-Augmented Generation）是这个阶段的典型实践——通过检索外部知识来补充模型的上下文窗口。

关键洞察：上下文窗口是稀缺资源，信息不是越多越好。

### 6. Agent Skills 与渐进式披露
> **Segment**: 7:30–8:30

Agent Skills 本质上是 Context Engineering 的高级实践。核心策略是**渐进式披露**（Progressive Disclosure）：不是把所有信息一次性塞给模型，而是按需、分层、在正确时机暴露信息。

> OpenAI 的实践案例：Agent 字典从一个巨型文件改为"目录页 + 子文档按需加载"的结构。

### 7. Harness Engineering 阶段
> **Segment**: 8:30–9:00

当模型从单次问答进化到连续行动的 Agent 时，新的问题出现了：谁来监督、约束和纠偏？Harness Engineering 回答的就是这个问题——它关注的是模型在真实执行中能不能持续做对。

### 8. 通俗类比：新人客户拜访
> **Segment**: 9:00–10:00

用"派新人去拜访客户"做类比，将三者的关系讲得通俗易懂：

| 层次 | 类比 | 作用 |
|------|------|------|
| Prompt | 话术脚本 | 教新人怎么说 |
| Context | 客户资料包 | 给新人看什么 |
| Harness | Checklist + 实时汇报 + 验收机制 | 确保新人做对 |

### 9. Harness 六层架构
> **Segment**: 10:00–12:40

一个成熟的 Harness 系统分为六层：

#### 第一层：上下文管理（10:10）
角色定义、信息裁剪、结构化组织。决定模型"看到什么"。

#### 第二层：工具系统（10:50）
给什么工具、何时调用、结果如何回喂。决定模型"能做什么"。

#### 第三层：执行编排（11:20）
理解目标 → 补信息 → 分析 → 生成 → 检查 → 修正。决定模型"按什么顺序做"。

#### 第四层：记忆与状态（11:50）
三类分离：任务状态 / 中间结果 / 长期记忆。决定模型"记住什么"。

#### 第五层：评估与观测（12:10）
输出验收、自动测试、日志指标、错误归因。决定"做得好不好"。

#### 第六层：约束校验与失败恢复（12:40）
约束规则 + 校验机制 + 重试/回滚策略。决定"做错了怎么办"。

### 10. 真实案例验证
> **Segment**: 13:00–13:20

浪潮团队在 Agent 竞赛中，仅通过改造 Harness（不换模型），排名从 30+ 名杀入前 5。进一步验证了 Harness 对 Agent 系统可靠性的决定性作用。

### 11. Anthropic 实践
> **Segment**: 13:20–15:00

Anthropic 在生产 Agent 中的两个关键实践：

#### Context Refit
针对长程任务的"上下文焦虑"问题，Anthropic 的方案不是压缩上下文，而是启动一个全新的干净 Agent 接力执行——称为 context refit。

#### 生产与验收分离
采用 Planner → Generator → Evaluator 三角色分工：
- **Planner**：拆解任务、制定计划
- **Generator**：执行生成
- **Evaluator**：独立验收评估

> 干活的 Agent 和评估的 Agent 应该是独立的角色，避免自评偏乐观。

### 12. OpenAI 实践
> **Segment**: 15:00–17:00

OpenAI 的三个关键工程实践：

#### 工程师角色转变
工程师的角色从写代码变为**设计环境**——拆解任务、补充缺失能力、建立反馈链路。

#### 渐进式披露
Agent 字典从巨型文件改为目录页 + 子文档按需加载。不一次性灌满上下文，而是让 Agent 按需查阅。

#### Agent 自验证
Agent 不仅写代码还自己验证——接入浏览器截图 + 日志监控 + 独立隔离环境，形成完整的自动治理闭环。

### 13. 总结
> **Segment**: 17:00–18:30

三者的关系与适用场景总结。Prompt、Context、Harness 是层层包含的关系，解决的问题从"说什么"到"知道什么"再到"怎么稳定地做"。AI 落地的核心挑战正在从"让模型看起来更聪明"转向"让模型在真实世界里稳定工作"。

## Playbook

### Harness 优先思维
- **Key idea**: 当 Agent 出了问题，修复方案几乎从来不是"让它更努力"，而是确定它缺了什么结构性能力
- **Why it matters**: 同样的模型和提示词，仅改 Harness 就能将成功率从 70% 提升至 95%
- **How to apply**: 遇到 Agent 失败时，先检查六层架构中哪一层缺失，而不是调整 prompt

### 上下文是稀缺资源
- **Key idea**: 信息不是越多越好，采用渐进式披露策略，按需、分层、在正确时机提供信息
- **Why it matters**: 上下文窗口有限，信息过载反而降低模型表现
- **How to apply**: 将大文档拆为目录页 + 子文档，让 Agent 按需加载；用 Agent Skills 实现渐进式披露

### 生产与验收分离
- **Key idea**: 干活的 Agent 和评估的 Agent 应该是独立的角色
- **Why it matters**: 自评偏乐观，同一个 Agent 既生成又验收会掩盖错误
- **How to apply**: 采用 Planner-Generator-Evaluator 三角色分工，评估环节用独立 Agent

### Context Refit 策略
- **Key idea**: 对于长程任务的上下文焦虑问题，启动干净新 Agent 接力，而非仅压缩上下文
- **Why it matters**: 压缩上下文会丢失关键信息，而全新 Agent 带着精炼的任务状态重新出发更可靠
- **How to apply**: 当任务执行到上下文窗口紧张时，将当前进度和关键状态序列化，交给新 Agent 继续

### 经验编码为系统规则
- **Key idea**: 把高级工程师的经验编码为系统规则并返回给 Agent，形成可持续运行的自动治理系统
- **Why it matters**: 人的经验无法 scale，但编码为 Harness 规则后可以
- **How to apply**: 将调试中发现的失败模式转化为约束规则、校验逻辑和恢复策略，沉淀到 Harness 六层架构中

## Key Quotes

| Quote | Speaker | Context |
|-------|---------|---------|
| "同样的模型，别人的 Agent 成功率高而自己的不行——这不是模型的问题" | 幻影老师 | 开场引出 Harness 的核心问题 |
| "不改模型不改提示词，仅改 Harness，成功率从 70% → 95%" | 幻影老师 | 亲身案例证明 Harness 的决定性作用 |
| "Agent = Model + Harness" | LangChain (引用) | 定义 Harness 的范畴 |
| "上下文窗口是稀缺资源，信息不是越多越好" | 幻影老师 | 论述渐进式披露的必要性 |
| "干活的 Agent 和评估的 Agent 应该是独立的角色" | 幻影老师 | 介绍 Anthropic 的生产与验收分离实践 |
| "工程师的角色从写代码变为设计环境" | 幻影老师 | 介绍 OpenAI 对工程师角色的重新定义 |
| "AI 落地的核心挑战正在从'让模型看起来更聪明'转向'让模型在真实世界里稳定工作'" | 幻影老师 | 全篇总结性论断 |

## Source Notes
- Transcript source: `asr-openai` (OpenRouter: openai/gpt-audio-mini, chunked)
- Cookie-auth retry: used
- Data gaps: 无章节标记（chapters: null），时间线为根据内容推断的近似值
