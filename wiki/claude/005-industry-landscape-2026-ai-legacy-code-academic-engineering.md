---
tags: [claude-code, legacy-code, ai-engineering, industry-landscape, characterization-test, comprehension-debt, brownfield-tax]
source: https://time.geekbang.org/column/article/975267
---
# 业界在做什么？2026 年 AI + 老项目改造的学术与工程全景

来自课程《Claude Code 企业级老项目改造实战》第 05 讲（作者：Robert）。本讲扫描了 2025-2026 年学术、大厂、咨询、开源四路实践，提炼出三个债和一个殊途同归的骨架，并揭示 2004 年经典著作为何在 AI 时代复兴。

## Key Concepts

- **Comprehension Debt（理解债）**：Google Addy Osmani 提出——AI 写代码的速度远超人的理解速度。Anthropic 52 人随机对照实验：AI 辅助组代码理解得分比对照组低 **17%**，debugging 维度差距最大。CLAUDE.md/SKILL.md 是对抗理解债的核心工具。
- **Brownfield Tax（棕地税）**：FIU 研究，老项目向 AI 征收的五种"税"：①Dumb Zone（context > 40% 输出质量下降）②Cross-session Forgetting（新对话前次教的全忘）③Context-blind suggestions（AI 给出不兼容历史的现代建议）④Translation Tax（senior 工程师纠正 AI naive 建议反而变慢）⑤Context Overflow（老项目代码分散几十文件，全喂爆 context 不喂全看不见）。
- **Verification Debt（验证债）**：Sonar 2026 调查——42% 代码 AI 生成，96% 不完全信任 AI，只有 48% 每次认真 review。Veracode 2025：**45%** 的 AI 生成代码引入安全漏洞。Ox Security 命名"Army of Juniors"：AI 功能性极高但系统性缺乏架构判断力。
- **Chain of Understanding（ICPC 2026）**：访谈 8 位代码审计专家，共同规律：**全局理解 → 局部理解 → 关系理解**，螺旋上升。基于此的工具 CodeMap 让用户对 LLM 的依赖降低 **79%**。对应本课第二部分"了解项目"的 Context Map 方法。
- **Characterization Test**：Michael Feathers 2004 年定义，AI 时代重新成刚需。测试代码"现在实际做什么"而非"应该做什么"——把会失败的断言改成与真实行为一致，锁定行为基线，防止 AI 改造引入**沉默的行为偏移**（silent behavioral drift）。Augment Code 推荐先 Characterization Test 锁行为 → Seam 做隔离 → Refactor。
- **Seam**：程序里能改变行为但不需要在该位置编辑代码的地方。制造方式：直接 new 的依赖抽成可覆写方法、硬编码配置抽成注入、静态调用换成接口。有 Seam 的代码 AI 改造爆炸半径可预测。

## Key Takeaways

- 三个债的本质是同一件事：AI 产出速度跑在前面，人的理解和验证追不上，老项目放大差距。模型越强产出越快差距越大——解法是给人配上追得上的方法论，不是等更弱的模型。
- 四路殊途同归：学术（ICPC 2026）、大厂（Anthropic Starter Kit 三阶段：分析→迁移→验证）、咨询（Thoughtworks Multi-pass Enrichment，时间节省 66%）、开源（Aider 永远可回滚、Cline 透明执行）都收敛到"理解→改造→验证"骨架。
- Cleveroad 三个失败模式：①试图一次性改造整个系统 ②改造过程丢失嵌入的业务逻辑 ③技能鸿沟无法独立跨越。核心判断：架构决策和监管背景是"只存在于领域专家脑子里"的知识，AI 无法从代码里推断。
- Feathers 2004 复兴：老项目问题和 AI 改造问题本质相同——"如何改动一个你不完全理解的系统"。Characterization Tests 和 Seam 是两个最被低估的实践。

## Key Numbers / Quick Facts

| 数据点 | 数值 | 来源 |
|---|---|---|
| AI 辅助组代码理解得分下降 | 17% | Anthropic 52 人 RCT |
| AI 生成代码引入安全漏洞 | 45% | Veracode 2025 |
| 开发者不完全信任 AI 输出 | 96% | Sonar 2026 |
| CodeMap 降低 LLM 依赖 | 79% | ICPC 2026 论文 |
| AI+知识图谱 vs 传统节省时间 | 66% | Thoughtworks CodeConcise |
| Brownfield Dumb Zone 阈值 | > 40% context | FIU 研究 |

## See Also

- [[003-understanding-constraints-verification-three-layer-control]]
- [[claude-code-best-practice]]
- [[working-effectively-with-legacy-code]]
- [[harness-engineering]]
