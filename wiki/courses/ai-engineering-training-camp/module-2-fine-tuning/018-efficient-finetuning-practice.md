---
tags: [lora, fine-tuning, peft, modelscope, swift, transformer, embedding, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927434
---

# 高效微调实践：LoRA 原理与 Swift 实战

Transformer 关键模块精解（Embedding 冻结策略、位置编码、QKV 注意力、残差连接）→ LoRA 低秩分解数学原理 → ModelScope Swift 框架实战（自我认知微调、意图识别微调），附微调工具对比。

## Key Concepts

- **Embedding 层冻结**：Embedding 约占模型参数量 30%，微调时冻结（`requires_grad=False`）以保留预训练语义空间，只对上层或适配层更新。
- **残差连接防梯度消失**：`output = x + F(x)` 为梯度提供直通路径；梯度范数 <0.1 表示梯度消失，>5 表示梯度爆炸，是微调效果差时的首要诊断点。
- **LoRA 低秩矩阵分解**：冻结原始权重 W（D×D），插入两个小矩阵 A（D×R）和 B（R×D），ΔW = B×A；R≪D 使参数量从 D² 降到 2DR，仅更新约 1.56% 的参数。LoRA 作用于注意力层的 Q 和 V 矩阵。
- **ModelScope Swift**：国内可访问的微调框架，支持 LoRA/QLoRA，封装了数据准备→训练→合并→推理的完整流程；内置自我认知数据集模板（model_type 设置模型知道自己叫什么）。
- **意图识别微调**：将票务系统意图（如"退票"/"改签"）作为分类标签，构造问答对进行 SFT 训练；微调后模型可直接从用户自然语言中识别意图标签，无需额外分类器。
- **微调工具对比**：Swift（国内易访问）、LLaMA-Factory（功能全面）、Unsloth（速度快 2×）、HuggingFace PEFT（官方标准）——根据显卡和访问网络选择。

## Key Takeaways

- LoRA 的 rank R 是核心超参：R 越大参数越多效果越好，但显存消耗越高；工程默认 R=8 或 R=16
- 微调失败首先检查梯度范数（梯度消失/爆炸），其次看 loss 曲线是否下降
- Swift 的自我认知微调只需几十条数据，训练 10 分钟，适合快速验证微调环境是否正常
- Embedding 层参数量巨大但通常冻结，理解这一点能解释为什么 LoRA 只作用在注意力层

## See Also

- [[017-finetuning-concepts-and-tokenizers]]
- [[013-multi-agent-finetuning-deployment]]
- [[016-engineering-prep-and-data-engineering]]
