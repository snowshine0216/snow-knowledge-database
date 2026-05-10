---
tags: [claude-code, legacy-code, ai-collaboration, project-handoff, software-engineering]
source: https://time.geekbang.org/column/article/974062
---
# 老项目改造的真实链路：从接手到交付，人到底做了什么？

来自课程《Claude Code 企业级老项目改造实战》第 01 讲（作者：Robert）。本文提炼了人接手老项目的九步完整链路，以及 AI 进入后各步骤的分工逻辑。

## Key Concepts

- **九步改造链路**：找人聊 → 翻资料 → 浏览代码结构 → 搭环境跑起来 → curl 访接口 → 带疑点深挖 → 画核心链路 → 小步改造 → 验收。AI 没有推翻这条链路，只是改变了每步的人机分工比例。
- **70/30 原则**：前六步"了解"占 70% 时间，后三步"改造"占 30%——与"拿到项目马上写代码"的直觉相反。稳定的工程师反而在理解上花更多时间。
- **隐性约定问题**：代码里存在大量无法从代码推断的历史决策，例如 `// 不要删，某某对接方需要`。这类知识 AI 看不见，必须靠"找人聊"步骤从人脑中提取。
- **上下文缺失陷阱**：大多数人用 Claude Code 用得不顺，根源是跳过前六步直接让 AI 改代码——传递给 AI 的上下文是空的，AI 给出的方案脱离项目实际，上线炸了还误以为是"AI 不靠谱"。
- **冷启动飞轮**：前期理解阶段（可能长达一两周）感觉无产出，但是后续复利的基础。第一个改造任务两三天，第二个一天，第三个几小时。核心心法：**熬过冷启动**。

## Key Takeaways

- AI 能把读 README、画架构图（Mermaid）、梳理接口清单压缩到分钟级，但"某某对接方是谁"、"这段逻辑删了会出什么事"永远需要人去追。
- 传统九步链路中，前六步（了解）与后三步（改造）的比例是 70:30；AI 时代这个比例仍然成立，只是每步的执行速度被 AI 加速了。
- 工程师把前六步做完并整理成文档后再交给 Claude Code，AI 的表现会"完全不同"——它会基于真实上下文做判断，而不是按通用最佳实践乱改。
- "熬过冷启动"是老项目改造的核心心法，冷启动期的投入以复利形式在后续改造任务中回报。

## Key Numbers / Quick Facts

| 数据点 | 数值 |
|---|---|
| 理解阶段占总改造时间 | 70% |
| 改造阶段占总改造时间 | 30% |
| 冷启动持续时间（典型） | 一天到两周 |
| 飞轮建立后第 3 个任务耗时 | 几小时 |

## See Also

- [[claude-code-best-practice]]
- [[claude-code-internals]]
- [[harness-engineering]]

## Related sources

- **[Claude Code 进来后：哪一步变了，哪一步没变？](courses/claude-code-legacy-project-transformation/002-what-changed-and-unchanged-when-claude-code-enters.md)**: 第 02 讲将九步链路细化为三档分工模型（AI 做 80%/50%/20%）并提出"20% 盲区法则"——AI 覆盖不了的那 20%（隐性约定、上线决策）若不主动补等于 0，20% 盲区经常制造 100% 的事故。See also: [[002-what-changed-and-unchanged-when-claude-code-enters]]
