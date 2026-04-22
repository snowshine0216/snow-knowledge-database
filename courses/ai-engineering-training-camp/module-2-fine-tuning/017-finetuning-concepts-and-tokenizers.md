---
tags: [fine-tuning, tokenizer, transformer, lora, peft, vram, gpu, bpe, wordpiece, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927433
wiki: wiki/concepts/017-finetuning-concepts-and-tokenizers.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. BPE（字节对编码）和 WordPiece 是两种主流 Tokenizer 算法——你知道它们分别被哪些大模型系列使用吗？
2. LoRA 是一种参数高效微调方法——你能猜出它为什么能大幅减少微调所需显存吗？它的核心思路是什么？
3. 如果把模型训练时的最大序列长度（max_len）从 512 增加到 1024（翻倍），你估计显存需求会增加多少倍——2 倍、4 倍，还是更多？

---

# 017: 微调基础概念与 Tokenizer 深解

**Source:** [AI 工程化训练营 模块二 2 微调相关的基础概念与 tokenizers 解析](https://u.geekbang.org/lesson/818?article=927434)

## Outline
- [微调的六大核心价值](#微调的六大核心价值)
- [微调的五种类型](#微调的五种类型)
- [Transformer 结构简述](#transformer-结构简述)
- [Tokenizer 深解：子词切分](#tokenizer-深解子词切分)
- [显存计算公式](#显存计算公式)
- [关键超参数：max_lens 与 batch_size](#关键超参数max_lens-与-batch_size)
- [微调前的 Tokenizer 评估流程](#微调前的-tokenizer-评估流程)
- [Key Takeaways](#key-takeaways)

---

## 微调的六大核心价值

用这六个维度决策"要不要微调"：

| # | 价值 | 说明 | 典型场景 |
|---|------|------|---------|
| 1 | **提升任务性能** | 使模型在专业领域更准确，避免重复提问和幻觉 | 医疗诊断、法律条文、金融计算 |
| 2 | **降低数据和训练成本** | 相比从零预训练，微调只需少量标注数据 | 替代大厂预训练的高成本方案 |
| 3 | **领域适配** | 让模型回答制造、医疗、金融等专业问题 | 垂直行业 AI 助手 |
| 4 | **个性化与定制** | 特定唤醒词、意图识别、设备控制等个性化行为 | 小度音箱、智能机器人 |
| 5 | **模型对齐（RLHF）** | 减少偏见、提升安全性，输出更符合人类价值观 | 心理健康类 AI、老龄化服务 |
| 6 | **推动轻量化部署** | 结合量化/LoRA，让模型能在消费级 GPU 上运行 | 本地部署、边缘推理 |

**商业思维**：为什么医疗/法律/金融做微调而非客服？因为前者的专业人员工资高，用微调模型替代一位律师，一年省下的费用远超微调成本。

---

## 微调的五种类型

### 1. 全量微调（Full Fine-tuning）

更新模型的**全部参数**。训练成本最高，需要大量数据和算力。

- **适合**：有充足数据、追求极致性能、任务复杂度高
- **不适合**：中小型公司（算力和数据门槛极高）

### 2. 参数高效微调（PEFT）

核心思路：模型参数矩阵中存在大量冗余，不需要全部更新——只更新 **<1%~3% 的参数**就能达到类似效果。

| PEFT 方法 | 原理 | 说明 |
|----------|------|------|
| **LoRA** | 低秩矩阵分解（A×B 替代 ΔW） | 工业首选，20G 显存可跑 |
| **Adapter** | 在模型层间插入小型神经网络模块 | 可插拔，性能略低于 LoRA |
| **BitFit** | 只调整模型的偏置（bias）参数 | 最轻量，效果有限 |

**实用性**：PEFT 把微调所需显存从"百 G 以上"降到"企业级 GPU 20G 以上可跑"，是当前主流选择。

### 3. 提示微调（Prompt Tuning）

通过精心设计的提示词引导模型输出，**不改变模型任何参数**。

- 严格来说也是微调的一种
- 受限于模型对提示词的敏感度——不同模型、不同发布日期对同一提示词的响应不同
- 性能不如全量微调，但成本最低

### 4. 指令级微调（Instruction Fine-tuning）

用 **（指令，输入，输出）三元组** 训练模型更好地遵循人类指令：

```
指令：将下面的句子翻译成英文
输入：今天天气真好
输出：The weather is really nice today
```

本质是提升模型的指令跟随能力和人类对齐能力。

### 5. 迁移学习（Transfer Learning）

用大模型的回答结果来训练小模型，让小模型模仿大模型的回答风格。适合小样本任务和数据不足场景。

---

## Transformer 结构简述

```
输入文本（我有一只猫）
    ↓
Tokenizer（分词 → Token IDs）
    ↓
Embedding 层（Token ID → 向量）+ 位置编码
    ↓
Encoder（6×Block：Multi-Head Attention + FFN）
    ↓
Decoder（6×Block：Masked Attention + Cross-Attention + FFN）
    ↓
输出预测（I have a cat）
```

**GPT-2 vs BERT 架构差异**：

| 模型 | 架构 | 注意力方向 | 典型用途 |
|------|------|-----------|---------|
| GPT 系列 | **仅 Decoder** | 单向（只看上文） | 文本生成 |
| BERT 系列 | **仅 Encoder** | 双向（上下文都看） | 文本分类、理解 |
| T5/原始 Transformer | Encoder + Decoder | 双向+单向 | 翻译、摘要 |

微调时调整的就是这些层中的参数——LoRA 在注意力层的 Q/V 矩阵上插入低秩适配层。

---

## Tokenizer 深解：子词切分

### 三种切分粒度对比

| 方式 | 示例（hello） | 问题 |
|------|-------------|------|
| **字符级** | h, e, l, l, o | 注意力分散到单个字母，语义捕捉差 |
| **单词级** | hello | 词表膨胀严重，罕见词无法处理 |
| **子词级**（实际使用）| hel, lo 或 lov, ##ing | 平衡词表大小和语义完整性 |

### 主流大模型的 Tokenizer 类型

| Tokenizer | 代表模型 | 词表特点 |
|-----------|---------|---------|
| **BPE**（Byte Pair Encoding）| GPT 系列（GPT-2/3/4）、LLaMA | 词表较大，支持多语言 |
| **WordPiece** | BERT 系列、Google T5 | 词表相对较小 |

**混用的代价**：用 BPE 模型训练的数据，推理时换成 WordPiece → Token 数量骤变 → 模型表现断崖式下滑。

### 为什么 Token 数量影响显存

不同模型对同一句话切出的 Token 数量不同 → Token 数越多 → 注意力矩阵越大 → 显存需求越高。

---

## 显存计算公式

以 GPT-2（L=1024 tokens, 12 heads, 12 layers, float16）为例推导：

```
注意力矩阵（单层，单样本）：
= L × L × num_heads × 2 bytes
= 1024 × 1024 × 12 × 2
≈ 240 MB

× 12 层 = 2.88 GB（注意力矩阵）
× batch_size=4 = 11.5 GB
+ 模型权重（1.17亿参数 × 2bytes ≈ 230 MB）
+ 优化器状态（≈ 920 MB）
≈ 13.5~15 GB 总显存
```

**关键结论：显存增长是平方关系**

| max_len | 显存（相对倍数） |
|---------|----------------|
| 128 | 1× |
| 256 | 4× |
| 512 | 16× |
| 1024 | 64× |

从 512 → 1024（token 数翻倍），显存需求翻 **4 倍**，不是 2 倍！

**这就是为什么 4090（24G）比 3080（16G）贵且抢手**：16G 跑 1024 token 直接 OOM。

---

## 关键超参数：max_lens 与 batch_size

**显存主要消耗公式**：

```
显存 ∝ max_lens² × batch_size
```

| 参数 | 作用 | 设太大 | 设太小 |
|------|------|--------|--------|
| **max_lens**（最大序列长度）| 控制每个样本最大 token 数 | OOM | 文本截断，信息丢失，效果变差 |
| **batch_size**（批次大小）| 一次处理的样本数 | OOM | 梯度不稳定，训练慢 |

**16G 显存的经验值**：
- `max_lens = 512`
- `batch_size = 8`

### 减少 OOM 的技巧

```python
training_args = TrainingArguments(
    max_seq_length=512,          # 1. 截断序列长度
    per_device_train_batch_size=8,  # 2. 控制 batch_size
    gradient_checkpointing=True, # 3. 梯度检查点（时间换空间）
    fp16=True,                   # 4. 混合精度训练（AMP）
    # gradient_accumulation_steps=4  # 5. 梯度累积（模拟大 batch）
)
```

---

## 微调前的 Tokenizer 评估流程

**在正式微调前，先做这个评估，避免训练中途 OOM**：

```python
from transformers import AutoTokenizer
import json, statistics

# 1. 加载目标模型的 tokenizer
tokenizer = AutoTokenizer.from_pretrained("your-target-model")

# 2. 从数据集抽取 50-100 条样本
with open("data/train.jsonl") as f:
    samples = [json.loads(line) for line in f][:100]

# 3. 统计 token 长度分布
lengths = [len(tokenizer.encode(s["input"] + s["output"])) for s in samples]
print(f"平均长度: {statistics.mean(lengths):.0f}")
print(f"最大长度: {max(lengths)}")
print(f"P95 长度: {sorted(lengths)[int(0.95*len(lengths))]}")

# 4. 根据 P95 设置 max_lens（给一点余量）
# 规则：max_lens 设置为 P95 的 1.2 倍，且不超过显存能承受的上限
recommended_max_lens = min(int(sorted(lengths)[int(0.95*len(lengths))] * 1.2), 512)
print(f"建议 max_lens: {recommended_max_lens}")
```

**为什么要做这步**：
- 不同模型对同一段文本切出的 token 数差异很大（BPE vs WordPiece）
- 肉眼看到"200 字的文章"无法判断会变成多少 token
- 提前评估避免训练几小时后 OOM

---

## Key Takeaways

- **微调的核心价值是专业化，不是学新知识**——学新知识是 RAG 的职责
- **PEFT（尤其 LoRA）是工业主流**：20G 显存可跑，成本比全量微调低 100 倍以上
- **提示词调整也算微调**：不要局限于"改参数"这一种理解
- **Tokenizer 必须训练和推理一致**：BPE（GPT 系）和 WordPiece（BERT 系）不可混用
- **显存增长是平方关系**：序列长度翻倍 = 显存需求翻 4 倍，不是 2 倍
- **两个关键超参数**：`max_lens` 和 `batch_size`，显存 ∝ max_lens² × batch_size
- **微调前必做 Tokenizer 评估**：抽 50-100 条样本，看平均/最大 token 长度，确定 `max_lens` 安全值

---

## Connections

- → [[016-engineering-prep-and-data-engineering]]（工程准备三件事，包括 Tokenizer 一致性验证）
- → [[013-multi-agent-finetuning-deployment]]（LoRA 原理：冻结 W，训练 A×B 低秩矩阵）
- → 下一讲：LoRA 超参数调优与实际微调演示（百链平台）


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释"序列长度翻倍，显存需求翻 4 倍"背后的数学原因——为什么是平方关系而非线性关系？
2. 微调训练和推理时为什么必须使用同一种 Tokenizer？如果训练用 BPE、推理换成 WordPiece，会发生什么，为什么？
3. 微调前做 Tokenizer 评估时，为什么要看 P95 长度而不是平均长度，`max_lens` 又应该怎么根据 P95 来设置？

> [!example]- Answer Guide
> 
> #### Q1 — 注意力矩阵平方增长原因
> 
> 注意力矩阵的大小是 L×L（序列长度的平方），序列从 512 → 1024 时，矩阵从 512² 增长到 1024²，增长了 4 倍；显存增长公式为 `max_lens² × batch_size`，是平方而非线性关系。
> 
> #### Q2 — 训练推理必须同一 Tokenizer
> 
> BPE 和 WordPiece 对同一文本切出的 Token 数量差异很大；训练与推理使用不同 Tokenizer 会导致 Token 数骤变，注意力矩阵维度不匹配，模型表现断崖式下滑。
> 
> #### Q3 — P95 长度设置 max_lens
> 
> 平均长度会被短样本拉低，导致 `max_lens` 设置偏小而截断大量长样本；P95 代表 95% 的样本都能完整容纳，建议将 `max_lens` 设为 P95 的 1.2 倍并不超过显存上限（16G 显存经验值为 512）。
