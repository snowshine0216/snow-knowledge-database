---
tags: [ai-safety, reasoning-models, chain-of-thought, evaluation, activation-steering, llm]
source: https://mp.weixin.qq.com/s/xfMqWvQ8W3aOhZwNDFhMiA
---
# Reasoning Model Chain-of-Thought Risk

《Chain of Risk》这篇论文报道的核心问题是：大型推理模型暴露思考链后，最终答案安全并不代表完整生成过程安全。研究团队把推理轨迹和最终回答拆开，用 20 条安全原则和 1-5 风险等级分别评分，定义 Unsafe、Leak、Escape 三类失败模式。15 个推理模型的结果显示，推理轨迹平均风险在所有模型上都高于最终答案，尤其在违法合规、人身伤害、心理伤害等原则上更容易出现 CoT 侧泄露。

## Key Concepts
- **[[chain-of-thought-risk]]**: 危险信息可能出现在中间推理轨迹里，即使最终答案是安全拒绝。
- **[[leak-failure-mode]]**: 推理不安全、回答安全；例如最终拒绝投毒请求，但 CoT 已列出剂量、掩味和给药路径。
- **[[escape-failure-mode]]**: 推理看似安全、最终回答不安全；文章举例是游戏世界观包装的问题最终导向危险装置方案。
- **[[stage-separated-evaluation]]**: 对推理轨迹 r 与最终答案 y 分别打分，而不是只评估末端输出。
- **[[adaptive-multi-principle-steering]]**: 为 20 条原则分别学习安全/不安全激活方向，测试时只对触发原则做自适应门控。
- **[[activation-steering]]**: 白盒安全干预依赖隐藏状态访问，适用于开源模型验证，但不能直接迁移到闭源模型。

## Key Numbers
| Fact | Value |
|---|---|
| Safety principles | 20 条 |
| Risk scale | 1-5 分 |
| In-distribution eval set | 41K 条 |
| Held-out set | 2K 条 |
| ID/OOD source datasets | 7 个 ID 数据集，4 个 OOD 数据集 |
| Tested reasoning models | 15 个 |
| Human calibration | 80 个样本，1600 条原则级评分，3 名人工标注员 |
| Judge Pearson correlation | 推理 0.799；回答 0.820 |
| Human Pearson correlation | 推理 0.742；回答 0.780 |
| Cohen's kappa | 推理 0.708；回答 0.741 |
| Largest CoT-answer risk gaps | Gemini-Pro-3.1: 0.028; GPT-OSS-20B: 0.022; DeepMath-Zero-7B: 0.021; Kimi-K2.5: 0.018 |
| Best steering result | DeepSeek-R1-Qwen-7B 降低 40.8% 不安全数量，保留 97.7% 平均准确率 |

## Key Takeaways
- CoT 可见性是新的安全风险面；只读最终答案会漏掉 Leak 模式。
- Unsafe、Leak、Escape 三类失败把「推理安全」和「回答安全」拆开，能定位答案侧评测捕捉不到的问题。
- 15 个模型都表现出推理轨迹风险高于最终答案的方向性偏移，说明这不是单模型异常。
- Adaptive Multi-Principle Steering 的关键是原则级自适应门控；无差别激活 20 个安全方向会把改善幅度从 0.45 降到 0.05。
- 方法依赖白盒隐藏状态访问；对闭源推理模型，更现实的落点是日志审计、红队评测和把思考链作为单独风险面。

## See Also
- [[verification-horizon-coding-agent-rewards]]
- [[security-theater]]
- [[deep-dive-into-llms-like-chatgpt]]
- [[harness-engineering]]
