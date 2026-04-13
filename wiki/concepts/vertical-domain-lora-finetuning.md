---
tags: [lora, fine-tuning, vertical-domain, customer-service, sft, peft, jsonl, fastapi]
source: https://u.geekbang.org/lesson/818?article=927824
---

# 垂直领域 LoRA 微调（客服问答模型）

垂直领域微调是将通用大语言模型适配到特定行业或业务场景（如电商客服、医疗、法律）的关键技术。与意图识别微调不同，垂直领域微调的核心挑战在于**语料质量**和**领域知识覆盖度**，而非格式控制。

## Key Concepts

- **垂直领域微调**：让模型学习特定领域的问答风格、术语和知识，输出符合业务规范的回答（如客服口吻、专业术语）。

- **SFT（Supervised Fine-Tuning）**：有监督微调，使用 `{问题 → 标准答案}` 对训练，是垂直领域微调的标准方法。

- **JSONL 语料格式**：最通用的训练数据格式，每行一个 JSON 对象：
  ```jsonl
  {"instruction": "退款需要多少天？", "input": "", "output": "3-5个工作日"}
  ```

- **语料准备关键点**：
  - 不同工具对字段名称要求不同（Swift 用 `instruction/output`，PEFT 可能用 `text/label_text`）
  - 需要根据工具做特定字段映射
  - 语料质量直接决定微调效果，数量不够可用 GPT-4 扩充

- **模型选型灵活性**：垂直领域微调可替换基础模型（千问、BERT、LLaMA 均可），主要目的是熟悉微调流程。

- **FastAPI 封装**：训练完成后用 FastAPI 提供 REST 接口，内建 Swagger UI（`/docs`）方便调试。

- **项目结构规范**：建议维护 README.md 记录训练步骤、合并命令、启动方法和测试方法，便于团队复现。

- **训练时间**：千问 8B 在 A10（22GB）上训练中等规模数据集约需 25-40 分钟。

## Key Takeaways

- 垂直领域微调 vs. 意图识别微调的核心区别：前者靠语料质量，后者靠格式控制
- PEFT 方式与 Swift 功能等价，二者可互换；Swift 更适合国内环境，PEFT 更适合海外模型
- 数据准备是最费时的步骤，需要按照工具要求做字段映射和格式转换
- 部署链路：训练 → 合并 LoRA → 评估 → FastAPI 服务 → Swagger UI 测试
- 8B 模型建议在云端 GPU（22GB）训练，本地 8GB 显存不足

## See Also

- [[intent-recognition-lora-fine-tuning]]
- [[lora-fine-tuning]]
- [[model-compression-and-deployment]]
