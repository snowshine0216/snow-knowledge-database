---
tags: [claude-code, geektime, ai-agents, architecture, overview]
source: https://time.geekbang.org/column/article/942438
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 你认为 Claude Code 的底层技术架构可以分为哪几个层次？请尝试列举。
2. Claude Code 的"长期记忆系统"依赖哪个核心文件来存储项目上下文？
3. 在 Claude Code 的扩展层中，Skills（技能）和 Tools（工具）有什么本质区别？

---

# 01｜登台远望：Claude Code 底层技术全景导览

## 章节元数据
- 课程名（EN）: claude-code-engineering-practice
- 课程名（ZH）: Claude Code 工程化实战
- 章节: 
- 作者: 黄佳
- 文章 ID: 942438
- 来源: https://time.geekbang.org/column/article/942438

## 康奈尔笔记

### 线索栏（问题）
- 本章的核心论点是什么？
- 本章开场提出了哪些背景、问题与动机？
- “主题2”这一部分的关键观点是什么？
- “主题2”有哪些支撑证据或案例？
- “从使用者到驾驭者”这一部分的关键观点是什么？
- “从使用者到驾驭者”有哪些支撑证据或案例？
- “主题4”这一部分的关键观点是什么？
- “主题4”有哪些支撑证据或案例？

### 笔记栏
#### 概览
- 你好，我是黄佳。让我们正式开启第一课的学习。
- 在我们的旅程正式启航之际，请你先思考第一个问题：你眼中的 Claude Code 是什么？
- 我们可能会得到很多个不同的答案：
- 一个能读懂代码的 AI 助手
- 命令行里的 ChatGPT
- 帮我写代码的工具

#### 主题2
- 原始小节标题：Claude Code 5 分钟快速上手
- 我们先花几分钟，把Claude Code用起来。第一步，在这里下载匹配你系统的Claude Code版本。
- 安装过程非常简单，跟着官方的说明就好。
- 然后进入操作系统的命令行，输入claude这个命令就可以开始对话了。
- Claude Code是付费软件，需要在Claude网站开账户。它所支持的账户类型包括：
- Claude Pro / Max / Teams / Enterprise（推荐）
- Claude Console（API 访问，需预付费）

#### 从使用者到驾驭者
- 总结一下上面的使用步骤：
- 你问，它答。就像用计算器，输入数字，得到结果。大多数人使用 Claude Code的方式，就止步于此了。
- Claude Code可以生成代码，从0开始做项目，整理文件，甚至优化你的操作系统……虽然能做到这些也已经很强大了，但这仍然只是被动使用！
- 而 Claude Code 还支持另一种模式：
- 这是主动驾驭——你设计，它执行。就像我们编写程序，程序自动运行。
- 举个例子：

#### 主题4
- 原始小节标题：Claude Code底层技术全景图
- Claude Code 的底层能力从技术上拆解可以分为四个层次：基础层、扩展层、集成层和编程接口层。
- 让我从下往上解释每一层。

#### 主题5
- 原始小节标题：基础层：Memory（记忆系统）
- 基础层也可以称为是Claude Code的长期记忆系统，它的核心文件是 CLAUDE.md。
- 比如入职一家新公司，第一天你会收到一份新员工手册，告诉你：
- 公司的代码风格是什么。
- Git 提交信息怎么写。
- 项目的架构是怎样的。
- 有哪些不能碰的“禁区”。

#### 扩展层：四大核心组件
- 这一层是 Claude Code 的能力中心，包含Commands（斜杠命令）、Skills（技能）、SubAgents（子代理）、Hooks（钩子）四个核心组件。
- 斜杠命令是Claude Code内置或用户自定义的一系列核心能力，其触发方式是用户手动输入 /command
- Commands适合标准化操作——团队统一的 commit 格式、固定的部署流程等。
- 技能则代表着AI的一系列专属能力组合，其触发方式是Claude 自动判断（语义推理）是否激活相应技能。Skills可以是Claude Code内置的，也可以由用户自己设定。
- 很多人第一次听到 Skills这个概念，都会觉得 “这不就是个高级一点的 tool 吗？Agent 直接 call tool 不就行了？”
- 我的回答是：的确像，但并不等价。原因在于Tools 是外部能力接口，Skills是模型内部的“行为模式 + 触发逻辑”。如果 Tool 是函数调用，Skill 就是把 if-else、prompt、策略和调用顺序，全部折叠进一个文档的整体封装，是对一个专有能力集的全面定义。

#### 集成层：连接外部世界
- 上面这四大核心组件之上，是集成层，负责链接外部世界。集成层包含Headless（无头模式）和MCP（Model Context Protocol）两大技术。
- 无头模式让 Claude Code 在没有人工交互的情况下运行，适合 CI/CD 集成——自动代码审查、自动修复、自动生成变更日志等。
- MCP 让 Claude 连接外部工具和服务，适合工具连接——可以把任何外部系统变成 Claude 可调用的工具。

#### 主题8
- 原始小节标题：编程接口层：Agent SDK
- 当配置式的扩展不够用时，你可以用代码来驱动 Claude。这种方式适合构建自定义 Agent——完全控制执行流程、自定义工具、复杂工作流。

### 总结
Claude Code 的真正身份是：一个可编程、可扩展、可组合的 AI Agent 框架。这一讲，我们将站在高处，俯瞰 Claude Code 的完整技术栈。

## 关键要点
- 你好，我是黄佳。让我们正式开启第一课的学习。
- 主题2：我们先花几分钟，把Claude Code用起来。第一步，在这里下载匹配你系统的Claude Code版本。
- 从使用者到驾驭者：总结一下上面的使用步骤：
- 主题4：Claude Code 的底层能力从技术上拆解可以分为四个层次：基础层、扩展层、集成层和编程接口层。
- 主题5：基础层也可以称为是Claude Code的长期记忆系统，它的核心文件是 CLAUDE.md。
- 扩展层：四大核心组件：这一层是 Claude Code 的能力中心，包含Commands（斜杠命令）、Skills（技能）、SubAgents（子代理）、Hooks（钩子）四个核心组件。

## 知识图谱种子
- 实体:
  - claude-code-engineering-practice
  - 01｜登台远望：Claude Code 底层技术全景导览
  - 黄佳
- 关系:
  - (claude-code-engineering-practice) -> 包含章节 -> (01｜登台远望：Claude Code 底层技术全景导览)
  - (01｜登台远望：Claude Code 底层技术全景导览) -> 作者 -> (黄佳)

## 复习备注
- 构建知识图谱前，先复核关键论断与原文的一致性。
- 在此补充你的行动项、实践映射和复盘结论。


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释 Claude Code 底层技术全景图的四个层次各自负责什么，并说明为什么要从"下往上"来理解这个架构。
2. 请区分"被动使用"和"主动驾驭" Claude Code 的区别，并举例说明"主动驾驭"模式下你作为设计者的角色。
3. 扩展层的四大核心组件（Commands、Skills、SubAgents、Hooks）中，Commands 和 Skills 的触发方式有何不同？为什么 Skill 不等价于一个高级 Tool？

<details>
<summary>答案指南</summary>

1. 四层从下至上依次为：基础层（Memory/CLAUDE.md，长期记忆）、扩展层（Commands/Skills/SubAgents/Hooks，能力中心）、集成层（Headless无头模式 + MCP，连接外部世界）、编程接口层（Agent SDK，代码驱动自定义 Agent）。从底层往上理解有助于看清每层如何为上层提供支撑。
2. 被动使用是"你问，它答"，如同使用计算器；主动驾驭是"你设计，它执行"，用户编写程序逻辑，Claude Code 自动运行。主动驾驭模式下，用户是架构师和流程设计者，而非单纯的提问者。
3. Commands 由用户手动输入 `/command` 触发，适合标准化操作；Skills 由 Claude 通过语义推理自动判断是否激活。Skills 不等价于 Tool，因为 Tool 是外部能力接口（函数调用），而 Skill 是把 if-else、prompt、策略和调用顺序全部封装进一个文档的整体行为模式定义。

</details>
