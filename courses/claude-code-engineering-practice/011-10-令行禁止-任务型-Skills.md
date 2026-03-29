---
tags: [claude-code, geektime, ai-agents, skills, slash-commands]
source: https://time.geekbang.org/column/article/946297
---

# 10｜令行禁止：任务型 Skills （斜杠命令 /Command）实战

## 章节元数据
- 课程名（EN）: claude-code-engineering-practice
- 课程名（ZH）: Claude Code 工程化实战
- 章节: 
- 作者: 黄佳
- 文章 ID: 946297
- 来源: https://time.geekbang.org/column/article/946297

## 康奈尔笔记

### 线索栏（问题）
- 本章的核心论点是什么？
- 本章开场提出了哪些背景、问题与动机？
- “主题2”这一部分的关键观点是什么？
- “主题2”有哪些支撑证据或案例？
- “主题3”这一部分的关键观点是什么？
- “主题3”有哪些支撑证据或案例？
- “主题4”这一部分的关键观点是什么？
- “主题4”有哪些支撑证据或案例？

### 笔记栏
#### 概览
- 释题：令行禁止。虽然/command已经整合进入Skills，但“命令”对工程师来说有天然亲近感，仍值得单独一讲。在 Claude Code 里，令行禁止几乎可以直接翻译为：disable-model-invocation: true 。也就是说——没有用户触发，Claude 绝不主动执行。
- 你好，我是黄佳。
- 上一讲我们动手做了一个参考型 Skill——Claude 自动判断何时需要，按需加载知识。现在进入它的另一面：任务型 Skill（也可以称为命令型Skill吧）。
- 对于喜欢“偷懒”的程序员，创建了一个斜杠命令来取代简单工作步骤，是再自然不过的事情，比如“检查一下 git 状态，然后提交代码，消息是 “fix login bug” 这种任务，用这样一个命令，直达目标。不需要每次都解释。
- 这就是任务型 Skill 的价值：把重复的对话模式，变成可复用的快捷方式。
- 这一讲是这样安排的：我们先了解任务型 Skill 的核心机制，随后梳理动态上下文注入技巧和 Skill 内的 Hooks 功能，之后学习任务型 Skill的设计方法论和实战案例。

#### 主题2
- 原始小节标题：Skills vs Commands
- 早期，斜杠命令/Comands和Skills是两个独立组件。但在新版Claude Code中，Commands 已合并到 Skills，成为 Skills 的子集。
- 因此，在 .claude/commands/review.md 和 .claude/skills/review/SKILL.md 两个不同目录的文件，都会创建 /review。Skills 目录的额外优势是支持辅助文件目录（模板、示例、脚本等）。如果同名 Skill 和 Command 共存，Skill 优先。
- 下面的对比主要是帮助你理解历史演进和两种目录结构的差异。
- 什么时候用 Commands 目录？已有的 .claude/commands/ 文件继续有效，不需要迁移。
- 什么时候用 Skills 目录？新建命令推荐使用 Skills 目录，因为支持辅助文件和更完整的 frontmatter。

#### 主题3
- 原始小节标题：任务型 Skill 的核心机制
- 在上一讲中，我们曾经介绍过两大类型的任务，参考型和任务型。简单来说，任务型 Skill 就是设了 disable-model-invocation: true 的 Skill。
- 有两种类型的命令。内置命令是 Claude Code 自带的，用于控制会话和工具，你无法修改。 自定义命令是你创建的任务型 Skill，用于执行特定的工作流程，完全由你掌控。
- 任务型 Skill 可以放在两个目录下：
- 任务型 Skill 作用域如下：

#### 主题4
- 原始小节标题：通过 ARGUMENTS 给 Skill 传参
- 当你通过 /skill-name args 调用 Skill 时，args 会通过 $ARGUMENTS 注入到 Skill 内容中。
- 举例来说，当运行 /fix-issue 123 时，Claude 收到的内容是“Fix GitHub issue 123 following our coding standards…”。
- 注意，传参并不仅仅限于任务型Skill，但是，需要明确传参的场景，对于任务型Skill自然是显得更加常见。
- Skill 支持两种参数传递方式。
- 单参数——$ARGUMENTS 接收所有参数。
- 多参数—— $1，$2 接收位置参数：

#### 主题5
- 原始小节标题：! `command` 动态上下文注入
- 下面我们讲一讲任务型Skill的动态上下文注入。
- 首先我们说，Skills中那么多文字和信息，其实归根结底还是Prompt，需要Claude Code（工具）发给Claude或者GLM/Qwen等模型来处理。而模型启动时并不知道和当前技能相关的上下文，这一功能刚好可以解决该问题。
- 啥意思？且听我慢慢道来。
- 当用户输入 /pr-create "Add auth" 时，模型收到的只是 Prompt 文本。它不知道：
- 当前在哪个分支
- 有哪些 commit 待合并

#### 主题6
- 原始小节标题：Skill 内的 Hooks
- 下面我们再来看看 Hooks 在任务型 Skill 中的作用。
- 任务型 Skill 执行的是有“副作用”(side-effect）的操作——提交代码、部署应用、修改文件。这类操作需要自动化的安全网。
- Hooks 配置很简单，只需要在 frontmatter 的 hooks 字段中定义：
- Skill 内的 Hooks 不是一条一条平铺写的，而是按“事件 → 匹配规则 → 要执行的命令列表”一层一层包起来。也就是一个三层树形结构，而不是一行一个 Hook —— 这是为了支持多事件 × 多工具 × 多动作的组合扩展，我们后续Hook章节再详述。
- Skill 中常用 Hook 模式如下。
- Skill Hooks与全局 Hooks 的区别如下。

#### 主题7
- 原始小节标题：任务型 Skill 设计方法论
- 设计一个任务型 Skill 时，我给你提供一个七步设计清单，引导你按顺序回答后面的问题。
- 任务型 Skill的几个重要设计原则如下：
- 单一职责原则：一个命令做一件事。
- 清晰命名原则：从命令名就能知道它做什么。
- 有意义的参数提示：让使用者了解如何传参。
- 权限最小化原则：严格控制每个任务的权限边界。

#### 实战项目：团队标准命令集
- 现在让我们创建一套真正实用的团队命令。
- 课程示例路径：我目前是把这一部分的示例文件放在 Repo的 05-Commands/projects/ 下，你可以尝试着把这些斜杠命令迁移到Skills目录。 项目结构如下。
- Skills 目录名即命令名。包括简单的查询类命令（git:status、git:log）以及包含动作的命令建议。建议你把它们迁移到 Skills 目录以获得 disable-model-invocation 等高级能力。
- 命令一：智能提交 /commit
- .claude/skills/committing/SKILL.md（或 .claude/commands/commit.md）：
- 使用方式如下：

### 总结
这一讲是这样安排的：我们先了解任务型 Skill 的核心机制，随后梳理动态上下文注入技巧和 Skill 内的 Hooks功能，之后学习任务型 Skill的设计方法论和实战案例。

## 关键要点
- 释题：令行禁止。虽然/command已经整合进入Skills，但“命令”对工程师来说有天然亲近感，仍值得单独一讲。在 Claude Code 里，令行禁止几乎可以直接翻译为：disable-model-invocation: true 。也就是说——没有用户触发，Claude 绝不主动执行。
- 主题2：早期，斜杠命令/Comands和Skills是两个独立组件。但在新版Claude Code中，Commands 已合并到 Skills，成为 Skills 的子集。
- 主题3：在上一讲中，我们曾经介绍过两大类型的任务，参考型和任务型。简单来说，任务型 Skill 就是设了 disable-model-invocation: true 的 Skill。
- 主题4：当你通过 /skill-name args 调用 Skill 时，args 会通过 $ARGUMENTS 注入到 Skill 内容中。
- 主题5：下面我们讲一讲任务型Skill的动态上下文注入。
- 主题6：下面我们再来看看 Hooks 在任务型 Skill 中的作用。

## 知识图谱种子
- 实体:
  - claude-code-engineering-practice
  - 10｜令行禁止：任务型 Skills （斜杠命令 /Command）实战
  - 黄佳
- 关系:
  - (claude-code-engineering-practice) -> 包含章节 -> (10｜令行禁止：任务型 Skills （斜杠命令 /Command）实战)
  - (10｜令行禁止：任务型 Skills （斜杠命令 /Command）实战) -> 作者 -> (黄佳)

## 复习备注
- 构建知识图谱前，先复核关键论断与原文的一致性。
- 在此补充你的行动项、实践映射和复盘结论。
