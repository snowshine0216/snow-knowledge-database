---
tags: [nl2sql, text2sql, sql-generation, fine-tuning, db-gpt, llama-factory, lora, spider-dataset]
source: https://u.geekbang.org/lesson/818?article=927476
---

# NL2SQL Deep Dive Part 2

深入讲解 NL2SQL 的微调路线，介绍 DB-GPT-Hub 和 LlamaFactory 两个微调工具的使用方法、数据集选择、参数配置，以及微调与 RAG 方案的现实对比。本讲是 AI 工程化训练营第 60 讲。

## Key Concepts

- **DB-GPT-Hub**：专为 Text2SQL 设计的微调工具，只支持 ALPACA 格式数据集，内置 Spider 数据集处理脚本，配置最简单。建议新手入门首选。
- **LlamaFactory**：通用微调工具，支持最新主流模型（含 Llama 4），提供图形化 WebUI，支持 ALPACA 和 ShareGPT 两种数据格式，适合需要灵活选模型的场景。
- **Spider 数据集**：最常用的 Text2SQL 标准测试集，包含 5600+ SQL，分 80/20 训练/测试集。微调入门首选，调通后再换自己的数据集。
- **LoRA 微调**：只更新注意力层（Q 层 + V 层）的权重，显存消耗远低于全量微调。不同模型的 Target 层名称不同（如 Qwen 用 `c_attn`，CodeLlama 用默认）。
- **QLoRA**：在 LoRA 基础上使用量化（int8/int4），进一步降低显存需求（14B 模型约 20G 显存）。
- **微调准确率上限**：Spider 数据集上 DB-GPT-Hub 微调后约 78.9%，仍有约 1/5 的 SQL 出错，不适合直接用于生产数据库写操作。
- **AI 取数数据飞轮**：用户确认正确的 SQL 回流向量数据库 → 相似问题命中历史 SQL → 准确率持续提升。
- **微调未来方向**：微调方案逐渐被 RAG + 强化学习方向替代，当前优先用 RAG（白盒、可控、更新成本低）。

## Key Takeaways

- 微调入门路径：DB-GPT-Hub + Spider 数据集 → 调通 → 换数据集/换模型
- 更换数据集时必须检查 JSON 格式（ALPACA/ShareGPT），这是最常见出错点
- 更换模型时必须修改 LoRA Target 层名称（不同模型注意力层命名不同）
- 微调效果（~78.9%）在生产环境中仍不可靠，不推荐用于多表联合查询
- 当前主流选择：RAG 优先（Vanna），微调作为补充或实验
- AI 取数最适合 NL2SQL 落地：聚焦高频常规查询，利用用户确认闭环建立数据飞轮

## See Also

- [[059-nl2sql-deep-dive-1]]
- [[061-text2sql-security]]
