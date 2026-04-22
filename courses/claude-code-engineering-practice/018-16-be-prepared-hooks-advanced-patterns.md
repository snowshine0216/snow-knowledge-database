---
tags: [claude-code, geektime, ai-agents, hooks, advanced-patterns]
source: https://time.geekbang.org/column/article/954158
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在 Claude Code 的 Hooks 体系中，PreToolUse 和 PostToolUse 分别在什么时机触发？你猜"Stop Hook"会在什么时候运行？
2. 如果你希望 Claude 在完成任务后"检查没通过就继续干"，这种循环机制应该通过什么字段来控制？
3. 当主会话启动一个子代理（SubAgent）时，如果你想自动给子代理注入团队编码规范，你会在哪个事件上挂 Hook？

---

# 16｜未雨绸缪：Hooks 高级模式与工程实践

## 章节元数据
- 课程名（EN）: claude-code-engineering-practice
- 课程名（ZH）: Claude Code 工程化实战
- 章节: 
- 作者: 黄佳
- 文章 ID: 954158
- 来源: https://time.geekbang.org/column/article/954158

## 康奈尔笔记

### 线索栏（问题）
- 本章的核心论点是什么？
- 本章开场提出了哪些背景、问题与动机？
- “主题2”这一部分的关键观点是什么？
- “主题2”有哪些支撑证据或案例？
- “实战：自动测试门控”这一部分的关键观点是什么？
- “实战：自动测试门控”有哪些支撑证据或案例？
- “主题4”这一部分的关键观点是什么？
- “主题4”有哪些支撑证据或案例？

### 笔记栏
#### 概览
- 释题：未雨绸缪。从 Stop Hook 质量门控到 SubAgent 事件验收，从 frontmatter 精准配置到三维决策框架——每一步都设防，构建滴水不漏的 Hook 工程体系。
- 你好，我是黄佳。
- 上一讲我们学习了 Hooks 的基础概念——中间件本质、事件体系、配置结构，以及最常用的 PreToolUse 和 PostToolUse 两大实战。PreToolUse 在工具执行前做“入口安检”，PostToolUse 在工具执行后做“过程质检”。
- 但还有一个关键环节我们没有覆盖：Claude 做完整个任务后，谁来验收？
- 这就好比工厂的流水线：安检门（PreToolUse）检查原料是否合格，质检站（PostToolUse）检查每道工序的产出。但产品最终出厂前，还需要一道终检——确认成品整体质量达标。这道终检，就是 Stop Hook。
- 除了 Stop Hook，这一讲中我们还会介绍子代理场景下的 SubagentStart 和 SubagentStop 事件、frontmatter 内置 Hooks 的精准控制、多 Hook 链的组合模式，以及 Hook 工程设计的系统方法论。

#### 主题2
- 原始小节标题：Stop Hook——任务完成时的质量门控
- Stop Hook 在 Claude 完成响应后运行。如果说 PreToolUse 是入口安检，PostToolUse 是过程质检，那么 Stop Hook 就是出厂验收——在 Claude 宣布“我做完了”之后，再检查一遍交付物的质量。
- Stop Hook 的核心能力是让 Claude 继续工作，Stop Hook 和其他 Hook 的最大区别。这个能力来源于它的 continue 字段：
- continue: true 意味着“不要停，继续工作”。这创造了一个自动循环：Claude 认为完成了 → Stop Hook 检查 → 发现测试失败 → 把失败信息反馈给 Claude → Claude 继续修复 → 再次完成 → 再次检查……直到所有检查通过，Claude 才被允许真正停下来。
- 这种机制把质量保证从“事后检查“变成了”交付前置条件”，这样能让 Claude 不是做完了再检查，而是检查通过了才算做完。

#### 实战：自动测试门控
- 这是 Stop Hook 最经典的应用——Claude 完成任务后自动运行测试，测试不通过就不让停。
- 为什么要在 Stop 时运行测试而不是在每次文件修改后？因为一个功能的实现通常涉及多个文件的修改。中间状态的测试必然会失败——你改了接口但还没改实现，测试当然过不了。只有在 Claude 认为“全部完成”的时刻，再运行测试才有意义。
- 实战项目位于 hooks/run-tests.sh：
- 让我们逐段解析这个脚本的工作流程。
- 项目类型检测：脚本通过检查特征文件来判断项目类型—— package.json 意味着 Node.js，pyproject.toml 意味着 Python，go.mod 意味着 Go，Cargo.toml 意味着 Rust。这种“约定优于配置”的检测方式让脚本能在不同类型的项目中通用，无需额外配置。
- 容错处理：grep -q '"test"' package.json 先检查 package.json 中是否有 test 脚本。如果项目根本没有配置测试命令，脚本不会报错，而是报告 “No test script found” 并放行。没有测试不等于测试失败——你不能因为项目还没写测试就阻止 Claude 完成工作。

#### 主题4
- 原始小节标题：用 Prompt 类型实现更灵活的 Stop Hook
- Shell 脚本适合检查客观事实——测试通不通过、文件存不存在。但有时候你需要检查更“主观”的东西，包括代码风格是否合理？功能实现是否完整？有没有遗漏边界情况？这些判断需要“理解力”，不是模式匹配能解决的。
- 这时可以用 Prompt 类型的 Stop Hook，让一个小型 LLM（通常是 Haiku）担任代码审查员：
- 这相当于在 Claude 完成工作后，让另一个 AI 做 code review。两个 AI 的视角不同——主 Claude 相当于作者，Prompt Hook 的 Haiku 担任审查者。审查者往往能发现作者忽略的问题，因为它没有“我刚写的代码当然是对的”这种认知偏见。
- 当然，Prompt 类型的可靠性低于 Command 类型。LLM 可能漏检，也可能误报。但作为测试门控（Command 类型）之外的第二层防线，它能覆盖一些脚本无法检查的维度。

#### 主题5
- 原始小节标题：防止 Stop Hook 死循环：stop_hook_active
- Stop Hook 的 continue: true 很强大，但也有风险——如果 Claude 一直修不好，就会进入死循环：测试失败 → Claude 修复 → 测试还是失败 → Claude 再修 → 还是失败……如此无限循环。
- 所幸官方提供了一个安全字段 stop_hook_active：当 Claude 因为 Stop Hook 而继续工作时，下一次 Stop 事件的输入中 stop_hook_active 会被设为 true。你的脚本应该检查这个字段来避免死循环：
- 这个模式允许 Claude 重试一次——第一次 Stop 时检查测试，如果失败就让 Claude 继续修复；第二次 Stop 时，stop_hook_active 为 true，无论测试是否通过都让 Claude 停下来。 16-1

#### 主题6
- 原始小节标题：子代理事件——SubagentStart 与 SubagentStop
- 在第 3-8 讲中，我们学习了子代理的各种使用模式。现在我们从 Hook 的角度来看子代理——如何在子代理启动和完成时自动执行检查？
- 这两个事件把 Hooks 和 SubAgents 两大机制连接了起来，让你能在子代理的“入口”和“出口“自动插入逻辑。

#### 主题7
- 原始小节标题：SubagentStart：为子代理注入上下文
- SubagentStart 在子代理被启动时触发。它的 matcher 匹配的是子代理类型名，而不是工具名。
- SubagentStart 接收的输入数据包含子代理的标识信息。
- SubagentStart 不能阻止子代理启动（这是设计决策——启动子代理是主会话的明确意图，不应该被 Hook 否决），但可以通过 additionalContext 向子代理注入上下文信息。
- 这个能力的价值在于自动化上下文注入。比如你有一个 code-reviewer 子代理，每次启动时都需要知道团队的编码规范。
- 如果没有 SubagentStart Hook，你得在每次调用子代理时手动提醒它“请遵循 camelCase 命名规范“。有了 Hook，这个提醒将自动发生。
- 这样，每次 code-reviewer 子代理启动时，都会自动收到团队编码规范——不需要在每次调用时手动提醒，不需要把规范写到子代理的 prompt 里（那样会占用子代理的上下文空间）。

#### 主题8
- 原始小节标题：SubagentStop：验证子代理的工作成果
- SubagentStop 在子代理完成工作后触发。它的决策控制和 Stop 事件完全一致——可以阻止子代理停止，强制它继续工作。
- SubagentStop 的输入数据有一个独特的字段，agent_transcript_path。
- 注意两个 transcript path 的区别，transcript_path 是主会话的对话记录，agent_transcript_path 是子代理自己的对话记录。这意味着你的 Hook 脚本可以读取子代理的完整对话历史来判断质量——不是只看最终结果，而是能看到子代理是怎么得出结论的。 SubagentStop 的决策控制和 Stop 事件一样，可以用 decision: "block" 阻止子代理完成，强制它继续工作。

### 总结
Claude 做完整个任务后，谁来验收？这一讲，我们将步步为营，把整个 Hook 体系的高级武器库全部打通。

## 关键要点
- 释题：未雨绸缪。从 Stop Hook 质量门控到 SubAgent 事件验收，从 frontmatter 精准配置到三维决策框架——每一步都设防，构建滴水不漏的 Hook 工程体系。
- 主题2：Stop Hook 在 Claude 完成响应后运行。如果说 PreToolUse 是入口安检，PostToolUse 是过程质检，那么 Stop Hook 就是出厂验收——在 Claude 宣布“我做完了”之后，再检查一遍交付物的质量。
- 实战：自动测试门控：这是 Stop Hook 最经典的应用——Claude 完成任务后自动运行测试，测试不通过就不让停。
- 主题4：Shell 脚本适合检查客观事实——测试通不通过、文件存不存在。但有时候你需要检查更“主观”的东西，包括代码风格是否合理？功能实现是否完整？有没有遗漏边界情况？这些判断需要“理解力”，不是模式匹配能解决的。
- 主题5：Stop Hook 的 continue: true 很强大，但也有风险——如果 Claude 一直修不好，就会进入死循环：测试失败 → Claude 修复 → 测试还是失败 → Claude 再修 → 还是失败……如此无限循环。
- 主题6：在第 3-8 讲中，我们学习了子代理的各种使用模式。现在我们从 Hook 的角度来看子代理——如何在子代理启动和完成时自动执行检查？

## 知识图谱种子
- 实体:
  - claude-code-engineering-practice
  - 16｜未雨绸缪：Hooks 高级模式与工程实践
  - 黄佳
- 关系:
  - (claude-code-engineering-practice) -> 包含章节 -> (16｜未雨绸缪：Hooks 高级模式与工程实践)
  - (16｜未雨绸缪：Hooks 高级模式与工程实践) -> 作者 -> (黄佳)

## 复习备注
- 构建知识图谱前，先复核关键论断与原文的一致性。
- 在此补充你的行动项、实践映射和复盘结论。


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释 Stop Hook 的 `continue: true` 是如何把"事后检查"变成"交付前置条件"的，并描述整个自动循环的运作过程。
2. 为什么自动测试门控选择在 Stop 时运行测试，而不是每次文件修改后就运行？`stop_hook_active` 字段又是如何打破潜在死循环的？
3. SubagentStart 和 SubagentStop 各自能做什么、不能做什么？`agent_transcript_path` 字段相比 `transcript_path` 有什么独特价值？

> [!example]- Answer Guide
> 
> #### Q1 — Stop Hook 交付前置条件循环
> 
> Stop Hook 在 Claude 宣布"完成"后运行，通过 `continue: true` 将失败信息反馈给 Claude 让其继续修复，形成"完成→检查→发现问题→继续修复→再完成→再检查"的循环，直到检查通过才真正停止——检查通过变成了停止的必要条件，而非完成后的可选步骤。
> 
> #### Q2 — 测试门控与死循环防护
> 
> 一个功能通常涉及多文件修改，中间状态必然触发测试失败，只有 Claude 认为"全部完成"时测试才有意义；`stop_hook_active` 在 Claude 因 Stop Hook 而继续工作后第二次触发 Stop 时被设为 `true`，脚本检测到此字段后无论测试是否通过都强制放行，从而保证最多重试一次、避免无限死循环。
> 
> #### Q3 — SubagentStart Stop 能力对比
> 
> SubagentStart 可以通过 `additionalContext` 向子代理注入上下文（如编码规范），但不能阻止子代理启动；SubagentStop 可以用 `decision: "block"` 阻止子代理完成并强制其继续工作；`agent_transcript_path` 记录的是子代理自己的完整对话历史，让 Hook 脚本能看到子代理"如何推导出结论"，而非仅看最终结果。
