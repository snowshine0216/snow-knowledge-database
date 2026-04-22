---
tags: [openclaw, clawhub, skills, marketplace, search-strategy, quality-filter, geektime]
source: https://time.geekbang.org/course/detail/101123301-965425
wiki: wiki/concepts/013-openclaw-clawhub.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. ClawHub 是什么平台？你猜它和 OpenClaw 是什么关系？
2. 如果你想在技能市场里搜索"帮我配图"这类需求，你会直接输入中文业务描述吗？为什么？
3. 面对一个有上万个应用的市场，你会用哪些指标来判断一个陌生应用是否值得安装？

---

# 012 玩转 ClawHub：在 1.3 万个技能市场中精准寻宝

**Source:** [玩虾 60 讲：捕获 Agent 时代的商业红利](https://time.geekbang.org/course/detail/101123301-965425) · 极客时间

## Outline
- [ClawHub 是什么](013-12玩转-clawhub-在13万个技能市场中精准寻宝.md#clawhub-是什么)
- [质量问题：13000+ Skills 中的水分](013-12玩转-clawhub-在13万个技能市场中精准寻宝.md#质量问题13000-skills-中的水分)
- [搜索策略：业务语言 → 技术语言](013-12玩转-clawhub-在13万个技能市场中精准寻宝.md#搜索策略业务语言--技术语言)
- [质量信号：如何快速筛选好 Skill](013-12玩转-clawhub-在13万个技能市场中精准寻宝.md#质量信号如何快速筛选好-skill)
- [实战演示](013-12玩转-clawhub-在13万个技能市场中精准寻宝.md#实战演示)

---

## ClawHub 是什么

ClawHub（clawhub.ai）是 OpenClaw 官方的 Skills 应用市场，相当于 OpenClaw 生态的"应用商店"。

> **核心定位**：一站式获取、安装、管理 Skills 的官方平台

截至目前，ClawHub 上已有超过 **1.3 万个 Skills**，涵盖内容抓取、信息聚合、自动化工作流等各类场景。

---

## 质量问题：13000+ Skills 中的水分

数量多并不代表质量高。ClawHub 上的 Skills 质量良莠不齐：

| 分类 | 占比 | 特征 |
|------|------|------|
| **优质 Skills** | 约 20% | 功能明确、维护活跃、文档完善 |
| **低质/重复** | 约 60%+ | 大量同名 Skill 重复发布，功能无差异 |
| **恶意/垃圾** | 少量但存在 | 可能含有害指令或无实际功能 |

**结论**：不能无脑安装，需要主动筛选。

---

## 搜索策略：业务语言 → 技术语言

ClawHub 的搜索引擎基于技术标签体系——开发者用技术术语描述，而不是用户的业务用语。

**核心原则**：把你的业务需求"翻译"成技术开发者会用的描述。

| 业务需求（用户语言）| 搜索词（开发者语言）|
|---|---|
| 帮我配图 | `image generation` |
| 抓取社交媒体 | `scraper` / `social media scraper` |
| 总结文章 | `summarizer` |
| 分析数据 | `data analysis` |

**操作路径**：
1. 打开 clawhub.ai 搜索框
2. 输入技术术语（英文效果更好）
3. 按星数/下载量排序
4. 选择排名靠前、更新活跃的 Skill

---

## 质量信号：如何快速筛选好 Skill

在搜索结果中，以下指标是可信度的代理：

- **Stars 数**：社区认可度，例如 `summarizer` 类 Skill 排名第一的有 1.4K stars
- **Downloads（下载量）**：7.4K 下载 > 1.4K 下载
- **更新时间**：优先选择近期有维护的 Skill
- **描述完整性**：有 README、使用示例的更可靠

> **经验法则**：Stars + Downloads 双高 = 优先考虑；两项都低 = 谨慎安装

---

## 实战演示

**场景 1：搜索社交媒体抓取 Skill**
```
搜索词：scraper
结果：大量社交媒体抓取相关 Skill
筛选：选择 stars 最高的 scraper Skill
安装：直接在 OpenClaw 中说"帮我安装 [Skill名称]"
```

**场景 2：搜索内容总结 Skill**
```
搜索词：summarizer
结果：找到 1.4K stars 的 summarizer Skill
对比：7.4K downloads 的另一个版本更受欢迎
决策：优先安装 downloads 最高的版本
```

**核心体验**：用正确的技术关键词，5 分钟内就能找到并安装适合自己业务的 Skill。


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释"业务语言 → 技术语言"这一搜索策略的核心逻辑，并举一个课程中的具体例子。
2. ClawHub 上 1.3 万个 Skills 的质量分布是怎样的？为什么说"不能无脑安装"？
3. 在筛选 Skill 时，Stars 和 Downloads 这两个指标分别代表什么？课程给出的经验法则是什么？

> [!example]- Answer Guide
> 
> #### Q1 — 业务语言翻译为技术搜索词
> 
> ClawHub 的搜索基于开发者的技术标签体系，用户需要将业务需求"翻译"成技术术语，例如"帮我配图"应搜索 `image generation`，"抓取社交媒体"应搜索 `scraper`，英文效果更好。
> 
> #### Q2 — ClawHub Skills 质量分布
> 
> 约 20% 为功能明确、维护活跃的优质 Skills，60% 以上是重复发布的低质 Skill，少量存在恶意或垃圾内容，因此需要主动筛选而非随意安装。
> 
> #### Q3 — Stars 与 Downloads 筛选指标
> 
> Stars 代表社区认可度，Downloads 代表实际使用量；经验法则为"Stars + Downloads 双高优先考虑，两项都低则谨慎安装"。
