---
tags: [fine-tuning, tokenizer, transformer, lora, peft, vram, gpu, bpe, wordpiece, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927434
---

# 微调基础概念与 Tokenizer 深解

从工程视角系统梳理大模型微调的五种类型（全量/PEFT/提示/指令/迁移）和六大核心价值，深入讲解 Tokenizer 子词切分机制，推导 VRAM 与序列长度的平方关系，给出 max_lens/batch_size 的实际选取策略。

## Key Concepts

- **微调五种类型**：全量微调（更新所有参数，成本最高）；PEFT（<1% 参数更新，LoRA/Adapter/BitFit，20G 显存可跑）；提示微调（不改参数，成本最低）；指令微调（指令-输入-输出三元组训练指令跟随）；迁移学习（大模型答案训练小模型）。
- **微调六大价值**：提升任务性能（医疗/法律/金融专业化）、降低训练成本（vs 预训练）、领域适配、个性化定制、模型对齐（RLHF 安全性）、轻量化部署。
- **Tokenizer 子词切分**：大模型实际使用子词级切分（非字符级/单词级）。BPE 用于 GPT 系列，WordPiece 用于 BERT/T5 系列；混用导致 token 数骤变，模型表现断崖。
- **VRAM 平方关系**：注意力矩阵的显存 ∝ max_lens² × batch_size × num_heads × float16_bytes。序列长度翻倍 = 显存需求翻 4 倍（512→1024 = ×4，不是 ×2）。
- **16G GPU 经验值**：max_lens=512, batch_size=8。减少 OOM 三板斧：降 max_lens、梯度检查点（gradient_checkpointing=True）、混合精度（fp16=True）。
- **微调前 Tokenizer 评估**：抽 50-100 条训练样本，用目标模型 tokenizer 统计 token 长度 P95，再设 max_lens，避免训练中途 OOM。

## Key Takeaways

- PEFT（LoRA 为代表）是工业主流，无需百卡集群，企业级 GPU 即可微调
- Tokenizer 必须训练和推理一致；BPE/WordPiece 不可混用
- 显存增长是平方关系，对 max_lens 的敏感度远超直觉
- 微调前做 Tokenizer 评估是低成本防 OOM 的最佳实践

## See Also

- [[016-engineering-prep-and-data-engineering]]
- [[013-multi-agent-finetuning-deployment]]
