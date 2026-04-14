---
tags: [intent-recognition, lora, fine-tuning, peft, fastapi, modelscope, swift, sft]
source: https://u.geekbang.org/lesson/818?article=927823
---

# 意图识别模型的 LoRA 微调与 API 部署

意图识别是 NLP 中的基础任务，用于将用户输入分类到预定义的意图类别（如"退票"、"查询余票"）。通过 LoRA 微调大语言模型来做意图识别，相比 Prompt Engineering 方式推理更快、输出格式更稳定。

## Key Concepts

- **意图识别微调的本质**：让模型学会输出**固定格式**（意图标签），而不是自由回答。训练数据为大量 `{用户输入 → 意图标签}` 对。

- **LoRA（Low-Rank Adaptation）**：通过在注意力层注入低秩矩阵（`q_proj`、`v_proj`）进行高效微调，只训练少量参数（约 1% 的模型参数）。

- **PEFT（Parameter-Efficient Fine-Tuning）**：Hugging Face 出品的微调库，LoRA 是其中最常用的方法。

- **ModelScope Swift**：阿里云出品的微调工具，以命令行参数形式运行，依托魔搭社区，国内下载模型和数据集更快。

- **LLaMA-Factory**：带图形界面的微调工具，操作与 Swift UI 类似，适合希望可视化操作的用户。

- **关键训练参数**：
  - `lora_rank`（r）：LoRA 矩阵的秩，越大容量越大但显存越多，常用 8 或 16
  - `lora_alpha`：缩放系数，通常为 `2 * rank`
  - `target_modules`：指定微调哪些矩阵层，如 `q_proj, v_proj`
  - `learning_rate`：LoRA 微调通常用 1e-4
  - `gradient_accumulation_steps`：梯度累积，等效增大 batch size

- **FastAPI 部署**：合并 LoRA 权重后，用 FastAPI 包装推理逻辑，提供 `/predict` POST 接口。内建 Swagger UI（`/docs`）支持在线调试。

- **Few-shot Prompt vs. LoRA 微调**：Prompt 越长推理越慢；LoRA 微调后推理快、格式固定，但需要训练数据和训练时间。

## Key Takeaways

- 三类工具（Swift / PEFT / LLaMA-Factory）参数体系大同小异，理解参数含义比选工具更重要
- 国内场景优先用 ModelScope Swift + 魔搭数据集；海外模型用 PEFT + Hugging Face
- 千问 8B 模型微调需约 22GB 显存（如 A10 GPU）
- 训练完成需先合并 LoRA 权重（`merge_and_unload`），再部署为推理服务
- 验证微调是否成功：输入"我要退票"应返回意图标签，而非自由回答

## See Also

- [[lora-fine-tuning]]
- [[model-compression-and-deployment]]
- [[vertical-domain-lora-finetuning]]
