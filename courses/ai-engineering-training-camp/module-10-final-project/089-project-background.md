---
tags: [ai-engineering, capstone-project, customer-service, rag, langchain, product-development]
source: https://u.geekbang.org/lesson/818?article=930870
wiki: wiki/concepts/089-project-background.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在开发大模型产品时，你认为需求分析的顺序应该是"先提需求再看模型能不能做"，还是"先了解模型能力再确定需求"？为什么？
2. 如果你要用大模型开发一套全平台客服系统，你会优先搭建底层平台架构，还是先选一个典型业务场景跑通完整流程？这两种策略各有什么风险？
3. 当你向一个完全不懂技术的客户演示一套多Agent系统时，你会用什么方法帮助对方理解系统的工作原理？

---

# 089: Capstone Project Background

**Source:** [1-项目背景](https://u.geekbang.org/lesson/818?article=930870)

## Outline
- [Project Overview](#project-overview)
- [LLM Products vs Traditional Software Development](#llm-products-vs-traditional-software-development)
- [Vertical-First Development Strategy](#vertical-first-development-strategy)
- [Managing LLM Iteration Speed](#managing-llm-iteration-speed)
- [Finding Analogous Scenarios](#finding-analogous-scenarios)
- [Customer Service System Design](#customer-service-system-design)

---

## Project Overview

本讲介绍了课程实战模块的核心项目：一个集成大模型的智能客服系统。该系统计划部署在网页右下角的对话悬浮窗，将课程所学知识融合应用。

项目不仅需要考虑模型和框架的选型，还涉及需求分析、产品设计、技术选型和上线运维等全链路工程实践。

---

## LLM Products vs Traditional Software Development

大模型产品与传统后端系统开发有根本性的差别：

**传统软件开发**：
- 以稳定性和可靠性为前提，在交付前可以承诺达到几个9
- 需求驱动开发：提出需求 → 写代码满足需求

**大模型产品开发**：
- 需要先让业务场景适配模型能力，而不是模型适配需求
- 提出的需求必须是模型能干的事；模型干不了的，才回退到传统开发
- 在内部必须拆分：哪些功能可以由大模型完成，哪些要由后端系统完成

关键原则：
> 需求一定要先拆分——模型能干的给模型，模型干不了的给后端。

---

## Vertical-First Development Strategy

大模型落地的实施路径与传统前后端开发不同：

**传统思路（避免）**：
- 先搭平台，区分不同账号、确定数据库，再支配所有支持库

**推荐思路（纵向优先）**：
1. 挑选一个典型的、有代表意义的产品或业务流程
2. 先将这条业务流从入口到出口完整跑通
3. 跑通后评估难度和开发周期
4. 再在此基础上做平台化

以工程化训练营为例：先把单个训练营的课程咨询客服完整跑通，再考虑扩展到多训练营平台。

---

## Managing LLM Iteration Speed

大模型迭代速度极快，直接影响项目交付：

**典型案例**：
- 某项目开发过程中，使用大模型+OCR处理政府公文（4个多月）；交付时MinerU和PaddleOCR已大幅超越原方案，被迫追加约一个月做技术迭代
- 结果导致整体工期延期25%，严重影响盈利

**应对策略**：
- 不要贸然铺开大平台，防止无法收尾
- 挑选能从头到尾跑通的单一场景，先验证可行性
- 验证完成后，掌握难度和周期再扩大范围

---

## Finding Analogous Scenarios

当对业务领域不够熟悉时（如法律、金融、医疗），可以用类比场景快速验证：

**方法论**：
1. **使用低代码工具（Dify/Coze）做快速原型**：快速展示大模型能达到的预期效果（60分即可），让客户对齐预期
2. **寻找相似场景**：找一个双方都熟悉的类比场景做原型演示

**虚拟法庭案例**：
- 问题：虚拟法庭多Agent系统，对方律师不熟悉技术，开发方不熟悉法律
- 解决：用"狼人杀"作为类比场景
  - 工作流确定（天黑请闭眼 → 角色行动 → 结果判断）
  - 每个角色设置一个Agent
  - 用Dify工作流排列整个流程
- 结果：客户认可相似性；最大差异仅是语言风格（狼人杀口语 vs 法言法语）

**斯坦福小镇补充**：
- 斯坦福小镇并非实时系统，而是预先批量查询大模型获取所有角色行为数据后离线模拟运行

---

## Customer Service System Design

智能客服系统的设计出发点：

**为何选择对话式客服**：
- AI有局限性，不适合覆盖所有业务场景
- 传统客服系统不能完全抛弃
- 以对话为主的客服是AI能力的最佳落地场景

**第一步：了解业务背景**：
- 了解用户通常会问哪些问题
- 分析现有客服系统承担的能力
- 确定AI能替代的功能范围

**典型客服对话流程**：
1. 欢迎语 + 问候
2. 提示常见问题
3. 正式开展客服对话

---

## Connections
- → [[088-langchain-async-vector-gpu-2]]
- → [[090-project-requirements-prototype-1]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释"大模型产品开发"与"传统软件开发"在需求处理方式上的根本差异，以及课程总结的核心拆分原则是什么。
2. 课程通过一个真实项目案例说明了大模型迭代速度带来的风险——请描述该案例的经过、结果，以及由此得出的应对策略。
3. 虚拟法庭多Agent项目遇到了"双方都不熟悉对方领域"的问题，开发方是如何用类比场景方法解决的？这套方法论的两个具体步骤是什么？

> [!example]- Answer Guide
> 
> #### Q1 — LLM vs Traditional Dev Needs
> 
> 传统软件开发以需求驱动，可以事先承诺稳定性；大模型产品开发则需要先让业务场景适配模型能力，模型干不了的才回退到后端。核心原则是：需求必须先拆分——模型能干的给模型，模型干不了的给后端。
> 
> #### Q2 — Iteration Risk Real Case
> 
> 某项目用大模型+OCR处理政府公文历时4个多月，交付时MinerU和PaddleOCR已大幅超越原方案，被迫追加约一个月做技术迭代，导致整体工期延期25%。应对策略是：不贸然铺开大平台，先选单一场景跑通验证可行性，掌握难度和周期后再扩大范围。
> 
> #### Q3 — Analogy Scenario Two Steps
> 
> 开发方用"狼人杀"作为类比场景：先用Dify工作流排列整个狼人杀流程（天黑请闭眼→角色行动→结果判断），每个角色设置一个Agent，让客户认可系统结构的相似性；两套方法论步骤为：①用Dify/Coze做快速原型展示60分效果让客户对齐预期，②寻找双方都熟悉的类比场景进行演示。
