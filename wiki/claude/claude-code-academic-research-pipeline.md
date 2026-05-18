---
tags: [claude-code, academic-research, skill, multi-agent, paper-writing, citation-verification, open-source]
source: https://mp.weixin.qq.com/s/4xSJH3YT94JQguY-mvf_Wg
---

# ARS：用 Claude Code 写论文的全套多 Agent 流水线

academic-research-skills（ARS）是台湾开发者 Edward Cheng-I Wu 开源的 Claude Code Skill 包（GitHub 6.4k Stars），将学术论文完整生命周期封装为 4 个 Skill：Deep Research（13 个 Agent）、Academic Paper（12 个 Agent）、Academic Paper Reviewer（7 个 Agent）和 Academic Pipeline（10 阶段编排器）。设计哲学是**系统性防止 AI 搞砸学术研究**，而非单纯加速写作。

## Key Concepts

- **四 Skill 架构**：Deep Research 负责文献调研和苏格拉底式问题构建；Academic Paper 负责写作（风格校准学习作者过往作品，输出 Markdown/DOCX/LaTeX/PDF）；Reviewer 模拟期刊评审（0~100 量化评分：≥80 接受，65~79 小修，50~64 大修，<50 拒稿）；Pipeline 为 10 阶段编排器，可从任意阶段插入（已有初稿从 Stage 2.5 开始，有审稿意见从 Stage 4 开始）。

- **引用核验机制**：每篇文献过 Semantic Scholar API 存在性确认 + Levenshtein 相似度算法模糊匹配，阈值 ≥0.70 才通过——防止的不只是"编造文章"，还包括"标题相似但作者年份全错"的隐蔽幻觉。实测一篇真实论文中抓到 **15 个伪造引用 + 3 个统计错误**。

- **完整性闸门（不可跳过）**：Stage 2.5 和 4.5 运行来自 **2026 年 Nature 论文**总结的 7 种 AI 翻车模式检查清单（覆盖引用幻觉、数据捏造、方法论造假）。Stage 2.5 标记 SUSPECTED 的问题必须在 4.5 变为 CLEAR，或由人工手动覆盖并留下记录。

- **反谄媚协议**：魔鬼代言人（DA）Agent 的反驳评分 1~5，**低于 4 分写作团队不允许承认**；攻击强度在整个修订过程中必须保持（类比软件工程的"不引入新 Bug"原则，防止审稿人在作者修订后突然变温柔）。

- **三层数据隔离**：Layer 1（原始输入，默认不可信）→ Layer 2（通过验证的产物）→ Layer 3（评分标准/金标数据，**永远不进入写作 AI 上下文**）。灵感来自 Anthropic w2s-researcher 研究：AI 读取标签数据时可能优化表面特征而非真正泛化，解法是结构隔离而非提示词。

- **诚实文档化**：每个产物附带 `repro_lock` 文件，包含强制声明："LLM 输出不是字节级可复现的，模型提供商会更新权重而不改模型 ID——这只是配置文档，不是重放保证。"

## Key Takeaways

- 两行命令安装，完整 10 阶段流水线成本约 **4~6 美元**（1.5 万字论文，使用 Opus 4.7 + Max 订阅）
- 无 Claude Code 用户可上传 SKILL.md 到 claude.ai 项目知识库轻量体验，但不支持多 Agent 并行
- "AI 是副驾驶，不是飞行员"——所有闸门留有人工覆盖接口，Stage 2.5 的 SUSPECTED 必须人工确认才能继续

## See Also

- [[anthropic-ai-native-startup-playbook]]
- [[bun-rewrite-zig-to-rust-with-claude-code]]
