---
tags: [claude-code, academic-research, skill, multi-agent, paper-writing, citation-verification, open-source]
source: https://mp.weixin.qq.com/s/4xSJH3YT94JQguY-mvf_Wg
wiki: wiki/claude/claude-code-academic-research-pipeline.md
---

# 6.4k Stars！用 Claude Code 写论文的全套流水线：ARS 开源项目

## Article Info
- URL: https://mp.weixin.qq.com/s/4xSJH3YT94JQguY-mvf_Wg
- Title: 6.4kStars！用ClaudeCode写论文的全套流水线，有人打包开源了
- Author: 听雨（来源：量子位），转载自公众号：机器学习算法与自然语言处理
- Publish time: 2026-05-18
- Access mode: `cookie-authenticated`

## Executive Summary

academic-research-skills（ARS）是台湾开发者 Edward Cheng-I Wu（吴政宜）开源的 Claude Code 技能包，在 GitHub 上获得 6.4k Stars。ARS 把学术论文的完整生命周期——文献调研、论文写作、同行评审、流程编排——封装为 4 个 Claude Code Skill，各由专门的多 Agent 团队驱动。其核心设计哲学是**系统性防止 AI 搞砸学术研究**，通过引用核验（Semantic Scholar API）、完整性闸门（来自 Nature 的 7 条失败模式检查清单）、反谄媚协议和三层数据隔离，解决 AI 写论文最常见的幻觉引用、统计错误和讨好行为问题。安装只需两行命令，完整跑完 10 个阶段成本约 4~6 美元，推荐配合 Claude Opus 4.7 Max 订阅计划使用。

## Outline

1. **项目概览** — ARS 是什么，6.4k Stars 背景
2. **四个 Skill 架构** — Deep Research、Academic Paper、Academic Paper Reviewer、Academic Pipeline 的分工和规模
3. **底层设计亮点** — 引用核验、完整性闸门、反谄媚协议、三层数据隔离、诚实文档化
4. **如何安装** — 两行命令安装，以及 Claude.ai 无 Code 轻量版选项
5. **成本参考** — Token 消耗、Max 订阅计划建议

## Section Summaries

### 1. 项目概览

- 项目名：`academic-research-skills`（ARS），GitHub 地址：github.com/Imbad0202/academic-research-skills
- 作者：Edward Cheng-I Wu（吴政宜），来自中国台湾，头像为顶着猫猫的男生
- 从 2026 年 2 月上线至 5 月，commit 次数超过 300 次，持续迭代
- 解决的核心问题：不只是"用 AI 写论文"，而是**让整个流程变得系统且可靠**

### 2. 四个 Skill 架构

#### Deep Research — 13 个 Agent 的研究团队

| Agent 角色 | 职责 |
|---|---|
| 文献溯源 Agent | 调用 Semantic Scholar API 验证每篇引用的真实性 |
| 苏格拉底导师 Agent | 通过对话引导研究者理清研究问题和思路 |
| 魔鬼代言人（DA）Agent | 专门挑刺，防止研究者在早期陷入思维定式 |

覆盖内容：文献调研、研究问题构建、方法论设计、PRISMA 系统性综述

#### Academic Paper — 12 个 Agent 的写作团队

- 全流程：大纲设计 → 论证构建 → 草稿撰写 → 双语摘要生成 → 图表可视化 → 引用格式转换
- **风格校准**：AI 学习作者过往作品的写作风格，让输出更像自己写的
- 输出格式：Markdown、DOCX、LaTeX，可编译成 APA 7.0 或 IEEE 格式 PDF

#### Academic Paper Reviewer — 7 个 Agent 的审稿团队

- 模拟真实学术期刊评审：主编（EIC）带领 3 位领域审稿人 + 1 个魔鬼代言人
- 多维度打分：方法论、学科视角、跨学科价值等
- 量化评分标准：
  - ≥80 分：接受
  - 65–79 分：小修
  - 50–64 分：大修
  - <50 分：拒稿
- 输出：详细修改路线图，告诉作者下一步该做什么

#### Academic Pipeline — 流程编排器，10 个阶段

阶段序列：研究 → 写作 → 完整性检查（Stage 2.5）→ 同行评审 → 修订 → 完整性检查（Stage 4.5）→ 最终检查 → 发表准备 → 流程总结

**关键设计**：可在任意阶段插入——已有初稿可从 Stage 2.5 开始；收到审稿意见可从 Stage 4 切入。

### 3. 底层设计亮点：系统性防止 AI 搞砸学术研究

#### 引用核验

- 使用 **Semantic Scholar API** 验证每篇文献存在性
- 不只查标题是否正确，而是用 **Levenshtein 相似度算法**做模糊匹配，阈值 ≥0.70 才通过
- 防止的不只是"编造不存在文章"，还包括"标题相似但作者年份全错"和"DOI 真实但内容对不上"等隐蔽情况

#### 完整性闸门

- Stage 2.5 和 Stage 4.5 各有一道**不可跳过的完整性闸门**
- 运行来自 **2026 年 Nature 论文**（全自主 AI 科研研究）总结的 7 种 AI 翻车模式检查清单：覆盖引用幻觉、数据捏造、方法论造假等
- 规则：Stage 2.5 标记为 SUSPECTED 的问题，必须在 Stage 4.5 变为 CLEAR，或由人工手动覆盖并留下记录
- 实测：在一篇真实论文中抓到 **15 个伪造引用和 3 个统计错误**

#### 反谄媚协议

- 魔鬼代言人（DA）的反驳会被评分 1~5，**低于 4 分，写作团队不允许承认**（防止 AI 为显得好合作而轻易让步）
- 攻击强度在修订过程中必须保持：如果第一轮把方法论批得很烂，修订后审稿人不能突然变温柔
- 评分轨迹被追踪，任何维度的分数下降都被标记为"回归"（类似软件工程的"不引入新 Bug 原则"）

#### 三层数据隔离

| 层级 | 内容 | 权限 |
|---|---|---|
| Layer 1 | 原始输入 | 默认不可信（可能幻觉、过时、带偏见）|
| Layer 2 | 通过完整性验证后的产物 | 可用于写作 |
| Layer 3 | 评分标准、参考答案、金标数据 | **永远不能出现在写作 AI 的上下文中** |

设计灵感来自 Anthropic 的 w2s-researcher 研究：当 AI 能读取标签数据时，可能在优化表面特征而非真正泛化；解法不是更好的提示词，而是**结构上的隔离**。

#### 诚实的文档化

- 每个产物生成 `repro_lock` 文件，记录运行时完整配置
- 文件中有强制声明：**"LLM 输出不是字节级可复现的，模型提供商会更新权重而不改模型 ID，外部 API 每天返回不同数据。这个文件只是配置文档，不是重放保证。"**

### 4. 如何安装

**Claude Code 用户**（两行命令）：

```bash
/plugin marketplace add Imbad0202/academic-research-skills
/plugin install academic-research-skills
```

验证安装：
```bash
/ars-plan
```
或测试单个子模块：
```bash
/ars-lit-review "你的研究主题"
```

**无 Claude Code 用户**：直接把 `SKILL.md` 上传到 claude.ai 项目知识库，打开浏览器即可用。注意：此方式不支持多 Agent 并行，是单 Agent 简化版，适合轻度体验。

### 5. 成本参考

| 场景 | 消耗 |
|---|---|
| 完整 10 阶段流水线 | 单次可消耗 >20 万输入 token + 10 万输出 token |
| 单个子模块 | 消耗量少得多 |
| 推荐方案 | Claude Opus 4.7 + Max 订阅计划（$100/月或$200/月）|
| 单次全程参考成本 | 约 4~6 美元（作者参考数字，1.5 万字论文）|

## Key Numbers

| 数字 | 含义 |
|---|---|
| 6,400+ | GitHub Stars（截至 2026-05-18）|
| 300+ | 从上线到 5 月的 commit 次数 |
| 13 / 12 / 7 | Deep Research / Academic Paper / Reviewer 的 Agent 数量 |
| 10 | Academic Pipeline 的阶段数 |
| ≥0.70 | Levenshtein 相似度引用核验阈值 |
| 7 | 完整性闸门检查的 Nature 论文 AI 失败模式数量 |
| 15 + 3 | 实测一篇真实论文中发现的伪造引用 + 统计错误 |
| 4~6 美元 | 完整流程单次参考成本（1.5 万字论文）|
| >20 万 | 完整流程输入 token 消耗 |

## Key Takeaways

- **ARS 的核心价值不是"让 AI 写论文"，而是"让 AI 不搞砸学术研究"**：通过引用核验（Semantic Scholar + Levenshtein ≥0.70）、不可跳过的完整性闸门（Nature 的 7 条失败模式）和反谄媚协议，系统性阻断 AI 学术写作的三大翻车点
- **三层数据隔离是防止 AI 偷看答案的结构级保障**：Layer 3（评分标准/金标数据）永远不出现在写作 AI 上下文中，灵感来自 Anthropic w2s-researcher 研究——解法是隔离，而非更好的提示词
- **实测效果**：一篇真实论文中，完整性闸门抓到 15 个伪造引用 + 3 个统计错误，说明这类防护在实际写作中必要性确实很高
- **"AI 是你的副驾驶，不是飞行员"**：手册全程保留人类在环，Stage 2.5 的 SUSPECTED 必须由人工手动覆盖才能通过，审稿评分轨迹全程追踪
- **成本与门槛**：完整流程约 4~6 美元 / 1.5 万字论文，推荐 Opus 4.7 + Max 订阅（$100~$200/月）；无 Claude Code 可上传 SKILL.md 到项目知识库轻量体验（不支持多 Agent 并行）

## Insights

- **"不可跳过"的闸门设计比"建议检查"更有效**：Stage 2.5 和 4.5 的完整性闸门是硬约束，不是建议——这体现了 AI 工具设计的一个重要原则：对于高风险操作，守护规则必须是结构性的，而非依赖用户自律
- **防谄媚机制的杠杆**：DA 反驳评分 <4 分不允许写作团队承认，这比"让 AI 更诚实"的提示词工程更可靠，因为规则本身编码在系统中，不依赖模型的内在倾向
- **ARS 的 `repro_lock` 诚实声明值得借鉴到其他 AI 工具**：明确告知用户"这不是重放保证"，而不是默默给出看起来权威的配置文档，是建立 AI 工具可信度的好实践

## Caveats

- 文章未测试 ARS 在中文写作场景下的效果，ARS 文档支持繁体中文和英文，但简体中文的适配情况不明
- 成本数字（4~6 美元）为作者参考值，随模型定价调整和文章篇幅变化
- Max 订阅计划（$100~$200/月）成本相当高；适合有科研经费可报销的学生或研究人员

## Sources

- https://mp.weixin.qq.com/s/4xSJH3YT94JQguY-mvf_Wg（本文）
- https://github.com/Imbad0202/academic-research-skills（ARS 项目）
