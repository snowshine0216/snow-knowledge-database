---
tags: [openclaw, ai-agent, skills, automation, memory, geektime]
source: https://time.geekbang.org/course/detail/101123301-965298
wiki: wiki/concepts/012-openclaw-skills-concept.md
---

# 011 Skill 本质论：为什么说 Skills 是 AI 的岗位培训包

**Source:** [玩虾 60 讲：捕获 Agent 时代的商业红利](https://time.geekbang.org/course/detail/101123301-965298) · 极客时间

## Outline
- [Skills 是什么](#skills-是什么)
- [没有 Skills 的三大痛点](#没有-skills-的三大痛点)
- [Skills 的价值：自动化重复能力](#skills-的价值自动化重复能力)
- [安装 Skill：对话即安装](#安装-skill对话即安装)
- [实战：Agent Rich 爬取示例](#实战agent-rich-爬取示例)

---

## Skills 是什么

Skills 不是你想象的那种"又贵又复杂"的功能模块，而是：

> **直接可用的封装好的 AI 能力包**

就像给新员工一本"岗位培训手册"——装上就会，不用每次从头教。

---

## 没有 Skills 的三大痛点

| 痛点 | 描述 |
|------|------|
| **重复劳动** | 每次都要重新告诉 AI 怎么工作，像从零造脚本 |
| **忘记偏好** | 今天教会了，明天 AI 可能忘掉你的习惯和偏好 |
| **上下文负担** | 每次对话都要把大量背景信息塞进去，低效且累 |

Skills 就是解决这三个问题的核心机制。

---

## Skills 的价值：自动化重复能力

有了 Skills，AI 可以持续执行原本需要复杂脚本的任务：

**典型示例**：
- 自动抓取 Twitter/微博最新内容
- 搜索社交媒体、聚合信息
- 解析和对比内容
- 与微信等平台联动

过去：需要写复杂脚本 + 调各种 API  
现在：直接和 OpenClaw 说"帮我装一个能抓 Twitter 的 Skill"，装完即用

---

## 安装 Skill：对话即安装

OpenClaw 的 Skill 安装方式极其简单——**直接和龙虾对话**：

```
用户：帮我安装一个叫做 Agent Rich 的 Skill
龙虾：正在为您安装...（自动执行安装流程）
```

安装过程中 AI 会自主思考和执行，安装完成后提示可用。

**注意**：安装过程中可能出现询问确认的提示，按提示操作即可。

---

## 实战：Agent Rich 爬取示例

**Agent Rich** 是一个网页/社交媒体内容爬取 Skill：

安装后验证：
```
用户：搜索 Twitter 上关于 OpenClaw 的最新讨论
龙虾：（通过 Agent Rich Skill 自动搜索）返回搜索结果
```

效果：龙虾拥有了自动抓取网络内容的新能力，不需要每次手动操作。

**核心体验**：装完一个 Skill = 给 AI 注入一种新的工作能力，永久可用，无需重复配置。
