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
- [深解：RAG 提供知识，微调塑造行为](#深解rag-提供知识微调塑造行为)
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

## 深解：RAG 提供知识，微调塑造行为

工业界共识：**"RAG 提供知识，微调（Fine-tuning）塑造行为"**。

微调的"专业化"不是让模型记住更多事实，而是从**格式控制、领域语言感、逻辑对齐、任务效率**四个维度重塑模型的输出风格与决策方式。

> [!info]+ 💡 深解 1 — 格式与结构的"肌肉记忆" (Form & Structure)
> 
> 在专业工作流中，输出的**确定性**往往比知识广博更重要。
> 
> - **RAG/提示工程**：Prompt 里反复强调"请务必返回 JSON"，但模型仍可能偶尔吐出自然语言
> - **微调**：模型从底层概率上认为"接到这个指令，下一个 Token 必须是 `{`"——形成条件反射
> 
> **适用场景**：严格 JSON 输出、特定格式测试报告、罕见编程语言 DSL（领域专用语言）

> [!info]+ 💡 深解 2 — 激活"沉睡"的领域感 (Activating Latent Knowledge)
> 
> 大模型预训练时已经读过几乎所有公开文档，知识被埋得很深，且被通俗语言覆盖。
> 
> 微调不是教它新知识，而是**调整词权的分布**：
> 
> - "Transform"这个词——普通对话里是"转变"，但在 NLP 专家面前必须默认指向"Attention 架构"
> - 微调让模型从"通用聊天机器人"切换到"领域专家"的**语境空间**
> 
> **核心价值**：不再使用大白话，而是精准使用术语、缩写和行业黑话

> [!info]+ 💡 深解 3 — 指令遵循与工作流对齐 (Alignment & Protocol)
> 
> 真正的"专业"不仅是知道答案，而是知道**该如何处理任务**。
> 
> 通过微调，可以将特定 SOP（标准作业程序）植入模型：
> 
> - 示例：处理 Bug 报告时，模型应先分类 → 提取复现步骤 → 给出修复建议
> - 微调后无需在 Prompt 里写长篇 Few-shot 示例，模型天生懂得该岗位的办事规矩
> 
> **逻辑内化**：多步骤任务流程固化为模型的默认行为，而非每次都靠提示词驱动

> [!info]+ 💡 深解 4 — 降低推理成本与延迟 (Efficiency)
> 
> 工程化中的核心价值之一：用更短的指令（Short Prompt）达到甚至超过长指令（Long Prompt）的效果。
> 
> - **RAG 场景**：注入大量上下文导致 Token 消耗极快且延迟高
> - **微调场景**：模型已内化任务背景和输出风格，节省大量 Input Tokens
> 
> **工程意义**：对于高频调用的专业工具，Token 节省直接转化为成本和延迟优势

### RAG vs. 微调 对比

| 维度 | RAG（外部资料库） | 微调（职业培训） |
| :--- | :--- | :--- |
| **角色** | 翻阅最新行业年报的实习生 | 拥有 10 年行业经验的老兵 |
| **优势** | 记忆力无穷，永不过时，可追溯源头 | 说话利索，懂规矩，知道怎么写报告 |
| **职责** | 提供事实、数据、最新的文档信息 | 统一风格、优化逻辑、固化输出格式 |
| **解决的问题** | **"我不记得那个参数叫什么"** | **"我知道怎么把这个测试跑通"** |

> [!abstract] 一句话总结
> 
> **RAG 解决了模型的"记性"问题，微调解决了模型的"脾气"和"手艺"问题。**
> 
> 当你不再寄希望于通过微调让模型记住"昨天发生的新闻"，而是让它"像一个资深质量工程师一样思考和输出"时，微调的真正威力才真正释放。

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

以 GPT-2/BERT-Base 规模（L=1024 tokens, 12 heads, 12 layers, 1.17亿参数, float16）为例：

### 训练显存的四大组成

```
总显存 ≈ 权重 + 优化器状态 + 梯度 + 激活值
```

#### 1. 静态权重（Model Weights）
```
1.17亿参数 × 2 bytes（FP16）≈ 230 MB
```
固定不变，不随 batch_size 增长。

#### 2. 优化器状态（Adam Optimizer States）
Adam 为每个参数存储三份 FP32 数据：
- FP32 权重备份（保证精度）：4 bytes
- 一阶动量 Momentum：4 bytes
- 二阶动量 Variance：4 bytes

```
1.17亿参数 × 12 bytes ≈ 1.4 GB
```

#### 3. 梯度（Gradients）
```
1.17亿参数 × 2 bytes（FP16）≈ 230 MB
```

#### 4. 激活值（Activations）—— 显存主要变量

注意力矩阵（单层，单样本）：
```
L × L × num_heads × 2 bytes
= 1024 × 1024 × 12 × 2
≈ 24 MB（仅注意力矩阵）
```

加上 MLP 层、QKV 映射、LayerNorm 等激活值（约 3-4 倍），单层激活实际更大：
```
激活值（12层，batch=4）：
≈ 24 MB × 4（含其他激活项） × 12层 × 4（batch_size）
≈ 4.6 GB
```

#### 汇总（L=1024, batch_size=4）

| 类别 | 估算大小 | 特点 |
|------|---------|------|
| 权重 | ~0.23 GB | 固定 |
| 优化器状态（Adam） | ~1.4 GB | 固定，推理时不存在 |
| 梯度 | ~0.23 GB | 固定 |
| 激活值 | ~4-5 GB | **随 batch_size 和 L² 增长** |
| CUDA 上下文/碎片 | ~1-2 GB | 固定 |
| **总计** | **≈ 8-10 GB** | |

---

**关键结论：激活值随序列长度平方增长**

注意力矩阵是 L×L 的，序列翻倍 → 矩阵面积翻 4 倍：

| max_len | 激活值显存（相对倍数） |
|---------|----------------|
| 128 | 1× |
| 256 | 4× |
| 512 | 16× |
| 1024 | 64× |

从 512 → 1024（token 数翻倍），显存需求翻 **4 倍**，不是 2 倍！

**这就是为什么 4090（24G）比 3080（16G）贵且抢手**：16G 跑 1024 token 直接 OOM。

> [!tip] 梯度检查点（Gradient Checkpointing）
> 
> 激活值不够用时，可开启 `gradient_checkpointing=True`：不保存中间层激活，反向传播时重新计算。代价是约 **33% 更多计算**，但能把激活值显存从 O(Layers) 降到 O(√Layers)，非常适合长序列任务。

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

- **微调的核心价值是专业化，不是学新知识**——学新知识是 RAG 的职责；微调塑造行为（格式/领域语言/工作流对齐/推理效率）
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
