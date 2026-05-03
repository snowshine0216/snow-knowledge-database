---
tags: [agi, agents, ai-engineering, deepmind, gemini, scientific-ai, virtual-cells]
source: https://mp.weixin.qq.com/s/-yelssGDGS_MQIB7vBMOHA
---

# Demis Hassabis on Agents, AGI, and Virtual Cells

Demis Hassabis 的判断可以压缩成一句话：现有大模型路线没有走错，但 AGI 还缺持续学习、长程推理、有效记忆和真正创造性；Agent 是通向 AGI 的系统形态，但今天仍停留在早期产品化阶段。文章从 DeepMind 的 Atari、AlphaGo、AlphaFold 和 Gemini 路线展开，把 Agent、强化学习、多模态、端侧小模型和 AI 科学发现放进同一张图里：智能系统最终不只是聊天，而要能持续理解上下文、调用专业工具、解决现实世界与科学问题。Hassabis 的时间线是 AGI 约在 2030 年到来，因此他给创业者的建议也很直接：十年深科技项目必须假设 AGI 会在旅程中途出现。

## Key Concepts

- **Agent 是主动解决问题的系统，不只是自动化 UI**：Hassabis 把 DeepMind 的 Atari、AlphaGo、AlphaStar 都看作 Agent 系统的早期版本，只是当时被限制在游戏环境里。Gemini 的长期方向，是把这种目标驱动、规划和决策能力迁移到语言、工具和世界模型中。
- **记忆不是上下文窗口长度**：上下文窗口更像工作记忆，人类工作记忆大约只有 7 位数字，AI 虽然能有百万 token 窗口，但 100 万 token 对实时视频也只是约 20 分钟。真正的难点是筛掉错误、琐碎、过期信息，并在需要时检索正确记忆。
- **强化学习仍被低估**：文章把 AlphaGo 的搜索、规划和增强 RL 与今天的思维链推理连接起来。Hassabis 认为这些方法不是旧时代技术，而是在基础模型中以更通用形式回归。
- **小模型能力来自大模型蒸馏压力**：Google 的搜索、地图、YouTube 等十亿级产品要求极低成本、低延迟和高吞吐，因此前沿大模型能力必须快速压缩进小模型。Hassabis 的假设是，今天大模型的能力半年到一年后会在小模型上出现相似版本。
- **Agent 的短板是持续学习和可靠产品化**：Hassabis 举例说，他 17 岁写《主题公园》花了 6 个月，现在 AI 半小时能做出游戏原型；但还没人用这些工具做出卖出 1000 万份的爆款游戏，说明演示能力和真实产品能力之间还有缺口。
- **创造性是 AI 科学发现的硬门槛**：AlphaGo 第 37 手展示了超人策略搜索，但 Hassabis 更想看到系统能从高层描述发明围棋，或在只给 1901 年知识的条件下推导出 1905 年的狭义相对论和光电效应。
- **虚拟细胞是 AlphaFold 之后的长期目标**：AlphaFold 3 已经扩展到更多生物分子，Isomorphic Labs 正在推进药物发现流程。更远目标是完整细胞仿真：能扰动、观测输出、生成合成数据，并跳过大量实验步骤。
- **AGI 后的系统更像通用模型调用专业工具**：Hassabis 不认为应把所有蛋白质数据塞进 Gemini。更合理的形态是通用模型调度 AlphaFold 这类专业系统，类似工具编排而不是单体巨模。

## Key Numbers

| Number | Meaning |
|---|---|
| 2030 年左右 | Hassabis 的 AGI 时间线，也是深科技创业者需要纳入规划的中途变量。 |
| 50/50 | 他对“现有路线自然扩展到 AGI”与“仍需一两个重大突破”的概率判断。 |
| 100 万 token ≈ 20 分钟视频 | 说明长上下文不能直接解决长期记忆和生活上下文理解。 |
| 6 个月 vs 半小时 | Hassabis 当年写游戏与今天 AI 生成游戏原型的时间差。 |
| 1000 万份 | 他用作爆款游戏反证：AI 原型能力强，但产品化爆款尚未出现。 |
| 4000 万次 | Gemma 4 两周半下载量，体现开放端侧模型的战略规模。 |
| 10 年 | 完整虚拟细胞的大致时间估计。 |
| 1901 / 1905 | “爱因斯坦测试”：用历史知识截断检验系统能否真正发明新理论。 |

## Key Takeaways

- AGI 的技术缺口不只是模型更大，而是持续学习、长期记忆、推理纠错和创造性。
- Agent 是 DeepMind 长期路线的自然延伸，但当前 Agent 仍缺稳定上下文适应能力。
- 多模态 Gemini、端侧 Gemma、机器人和数字助手本质上服务于同一个方向：让模型理解真实环境并低成本运行。
- AI 科学发现最适合组合搜索空间巨大、有清晰目标函数、有数据或模拟器的领域，例如药物发现、材料科学、气候模型和数学。
- 创业者应选择十年后仍有硬约束和深价值的问题，尤其是 AI 与实体科学交叉的方向，因为它们更难被一次模型更新直接淹没。

## See Also

- [[karpathy-loopy-era-ai]]
- [[autoresearch-karpathy]]
- [[llm-api-statelessness]]
- [[vision-agent-with-segmentation-tool]]
- [[state-of-gpt]]
