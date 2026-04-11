---
tags: [fine-tuning, lora, intent-recognition, latency, langchain, observability, langchain-migration, agent]
source: https://u.geekbang.org/lesson/818?article=939542
---

# AI 工程化实战问答：微调、延迟与 LangChain 迁移

本文整理了 AI 工程化训练营第二次直播答疑的核心内容，涵盖 LoRA 微调数据要求、意图识别延迟的量化分析方法、LangSmith/LangFuse 可观测性接入、以及 LangChain 0.x 到 1.0 的版本迁移策略。

## Key Concepts

- **LoRA 数据量阈值**：单类别建议 1000 条以上；多类别（如 4 类）每类约 500 条，保持均匀分布；数据分布不均时通过加权损失函数缓解，相当于少数类重复训练多次。

- **意图覆盖多样性**：同一意图下的语料必须覆盖同义词、口语表达、错别字、缩写等多样化写法（如"查订单"→"帮我看看我的订单""1234567 咋样了"），否则模型泛化能力不足。

- **延迟拆解公式**：端到端延迟 = 网络 RTT（50–200 ms）+ 排队（0–800 ms）+ 意图识别（~1 s，约 100 tokens @ 30–100 tok/s）+ 工作流提示词（~2 s，>200 tokens）+ TTFT。总计 2～3 秒属正常范围。

- **深度思考关闭**：Qwen3-Max 和 Claude 默认开启思考模式（Sync），对简单分类任务是不必要开销。Qwen 系列需在 API 参数中设 `enable_thinking: "force"` 才可关闭；在 system prompt 中写 `no-sync` 无效。

- **早停法（Early Stopping）**：每 50–100 步在验证集上评估 F1；连续 2–3 次无提升则停止训练。先用 10% 数据跑 100 步观察 loss 曲线，再决定全量训练步数。

- **LangChain 版本架构**：LangChain 1.0 基于 LangGraph 0.x 重构，与旧版不兼容。旧版 API 通过 `langchain.classic` 兼容包继续使用。架构层级：LangChain 1.0 → LangGraph 1.0 → LangGraph Agents（deep agents，最高层抽象）。

- **LangSmith / LangFuse**：LangChain 链路追踪工具，可可视化每个节点耗时，定位串行瓶颈。LangFuse 完全开源，适合自建。

## Key Takeaways

- 微调效果差时优先检查数据质量（覆盖多样性、样本均衡、贴近真实场景、脱敏），而非堆参数
- 端到端延迟优化：关深度思考 > 缩短提示词 > 串改并 > 合并 LLM 调用次数
- LangChain 语言无关：Python 概念可直接迁移到 LangChain4j（Java）或 TypeScript 版本，无需切换语言
- 迁移路径从 Changelog → 1.0.0 查 migration guide；旧版导入改前缀 `langchain.classic` 即可兼容

## See Also

- [[ai-engineering-three-patterns]]
- [[lora-fine-tuning]]

## Related sources

- **[002-first-qa-session]**: 第一次直播答疑补充了意图识别、RAG 和 Agent 场景的**模型选型对比**（BGE-M3 vs Jina Embedding、BERT-Chinese 系列、70B Agent 模型），以及 **LangSmith vs LangFuse 企业交付分层策略**（开发用 LangSmith、生产用 LangFuse），还有 **RAG 与文件上下文方式的架构对比**和**ML/深度学习与大模型的分工**这两个本篇未涉及的维度。See also: [[002-first-qa-session]]
