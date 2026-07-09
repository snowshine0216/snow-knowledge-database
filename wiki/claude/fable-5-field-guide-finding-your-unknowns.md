---
tags: [claude-code, agentic-coding, prompt-engineering, unknowns, fable-5]
source: https://mp.weixin.qq.com/s/qzBYAbVxtiJnXwXKAi80xA
---
# Fable 5 Field Guide: Finding Your Unknowns

这篇 WeChat 文章转译并介绍 Claude Code 工程师 Thariq Shihipar 的《A Field Guide to Fable: Finding Your Unknowns》。它把 Fable 5 协作的核心问题定义为“地图不等于疆域”：用户给 Claude 的提示词、Skill 和上下文只是地图，真实工作发生在代码库、现实约束和组织审查里；二者之间的差距就是“未知项”。文章的实践价值在于把 agentic coding 从“写好提示词”推进到一套循环：实现前发现盲点，实现中记录偏离，实现后解释和测验，持续让模型、用户和代码库保持同步。

## Key Concepts
- **Unknown unknowns**: 用户完全没意识到的问题，例如进入陌生认证模块时不知道该问什么、什么算好、历史上踩过哪些坑；文章建议直接让 Claude 做 `blindspot pass` 并解释 `unknown unknowns`。
- **Map-territory gap**: “地图”是提示词、Skill、上下文，“疆域”是代码库和现实约束；当二者不匹配时，Claude 会按最佳猜测补齐意图，复杂任务里这种猜测会快速累积风险。
- **Blindspot pass**: 实现前的扫描动作，适合新增认证 provider、第一次做视频调色等陌生任务；用户要告诉 Claude 自己熟悉和不熟悉什么，让它帮助重写更好的任务提示。
- **Prototype before wiring**: 先用低成本 HTML 或假数据原型暴露“未知的已知”；文中示例包括仪表盘的 4 种视觉方向、未接线的编辑器工具栏、onboarding 流失的 10 个介入点。
- **One-question interview**: 让 Claude 一次只问一个问题，并优先问会改变架构设计的问题，例如数据模型、类型接口、UX 流程，而不是一次性抛出大量低价值澄清项。
- **Reference code as spec**: 当自然语言描述不够精确时，把 Claude 指向真实参考代码；文中用 `vendor/rate-limiter` Rust crate 的回退重试语义迁移到 TypeScript API 客户端作为例子。
- **Implementation notes**: 实现中维护 `implementation-notes.md` 或 `.html`，遇到边界情况导致偏离计划时，在 `Deviations` 下记录保守选择和原因，让下一轮能从真实偏差中学习。
- **Post-implementation quiz**: 实现后让 Claude 生成 HTML 报告和测验，用户必须能解释上下文、直觉和行为变化后才合并；这比只看 diff 更能捕捉既有代码路径里的隐含行为。
- **Domain judgment before generation**: Fable 发布视频案例里，作者从 Whisper、`ffmpeg`、Remotion 原型推进到调色问题，最后意识到自己缺少“什么是好调色”的判断标准，于是先让 Claude 教自己调色，而不是继续生成候选版本。

## Key Takeaways
- Fable 5 的工作质量瓶颈被描述为“澄清未知项的能力”，不是单纯的模型能力；任务越复杂，Claude 遇到未显式表达的约束越多。
- 实现前要用 `blindspot pass`、原型、反问、参考代码和实现计划，把高风险未知项提前暴露，尤其是数据模型、类型接口和 UX 流程这类返工成本高的决策。
- 实现中不能假设计划覆盖一切；`implementation-notes.md` 把边界情况、偏离原计划和保守决策记录下来，形成下一轮协作的上下文资产。
- 实现后解释文档服务于团队审查：把原型、规格、实现笔记和演示 GIF 组合成可发 Slack 的材料，可以帮助评审者确认常见失败点是否被考虑。
- 合并前测验把用户从“看过代码 diff”推到“能解释变更行为”；文章中作者只有在完美通过 Claude 生成的测验后才会合并。
- 对陌生领域，最有效的提示词可能不是“给我更多方案”，而是“先教我如何判断方案好坏”；调色案例展示了让 Claude 补齐评价语言的重要性。

## See Also
- [[how-i-make-opus-think-like-fable-5-easy-steps_XTBWVVcF3Pk]]
- [[claude-code-best-practice]]
- [[claude-code-agentic-os]]
- [[claude-code-lead-from-token-maxing-to-roi]]
- [[claude-design-just-became-unstoppable]]
