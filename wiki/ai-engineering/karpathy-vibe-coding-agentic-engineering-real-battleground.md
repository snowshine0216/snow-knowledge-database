---
tags: [andrej-karpathy, vibe-coding, agentic-engineering, software-3-0, llm, verification, ai-engineering]
source: https://mp.weixin.qq.com/s/_-ZnhjKQLmN86H1QWGl1RA
---

# Karpathy：Vibe Coding 抬高地板，真正难点是 Agentic Engineering

这篇文章整理了 Andrej Karpathy 在 AI Ascent 2026 上对过去一年 coding agent 变化的判断。最核心的区分是：vibe coding 只是把“更多人能做出软件”的门槛拉低，而 agentic engineering 是另一门更严格的学科，它要求你在继续保持专业质量标准的同时，用 agent 获得数量级加速。Karpathy 用几个非常具体的例子把这件事讲透了。Software 3.0 指向一种新范式：提示词和上下文正在取代过去大量脚本、安装器和应用胶水。MenuGen 的案例更进一步说明，很多旧范式里的中间应用层会被模型直接吞掉。与此同时，模型能力仍然高度“锯齿状”：它可以重构 10 万行代码、发现零日漏洞，却可能在 50 米洗车店这种常识问题上回答得很怪。Karpathy 用“可验证性”解释这种结构性不均衡，也因此把真正昂贵的人类技能重新定义为 taste、judgment、oversight 和理解力。你可以把部分思考外包给 agent，但你不能把理解外包出去，因为仍然需要有人知道系统为什么值得做、抽象是否正确、风险边界在哪里，以及哪些基础设施需要被重新设计成真正的 agent-native 形态。

## Key Concepts

- **Software 3.0**：从写代码到写数据，再到写提示词。Karpathy 认为上下文窗口里的内容已经开始承担过去 shell 脚本、安装逻辑和部分应用层的职责。
- **Trust threshold**：真正的变化不是“模型偶尔能写出好代码”，而是它在 2025 年底左右频繁跨过了“可以默认先信它”的阈值，这才让 vibe coding 成为稳定工作方式。
- **Verifiability drives jaggedness**：模型在代码和数学上特别强，不一定因为“更聪明”，而是因为这些任务更容易获得强化学习奖励；在不可验证领域，能力仍会非常不均匀。
- **Vibe coding vs agentic engineering**：前者抬高所有人的下限，后者解决的是如何在不引入安全漏洞和质量衰退的前提下组织 agent 加速。
- **Ghost model of LLMs**：LLM 不是有内在动机的动物，而是被召唤出来的统计性系统。这个心智模型能防止使用者把它人格化，从而高估某些“激励”手段的作用。
- **Understanding stays human**：API 细节、库函数差异可以外包，但对数据模型、内存语义、产品目标和系统抽象的理解，仍是人类不可替代的位置。

## Key Takeaways

- 今年最值得重视的变化不是“人人都会 vibe coding 了”，而是工程问题开始从“怎么写出来”迁移到“怎么维持质量边界”。
- 很多软件层中间件会被模型直接吞掉，所以开发者工具的真正护城河会越来越偏向 harness、workflow 和 judgement，而不是单点生成能力。
- 如果一个任务不能被明确验证，别对 agent 盲目乐观；先问可验证性，往往比先问模型参数更重要。
- 最稳定的人类位置不是键盘手，而是导演、审核者和抽象设计者。

## See Also

- [[karpathy-loopy-era-ai]]
- [[harness-engineering]]
- [[openai-frontier-zero-human-coding]]