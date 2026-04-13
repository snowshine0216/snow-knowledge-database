---
tags: [lora, fine-tuning, llm, peft, modelscope, swift, transformer, embedding]
source: https://u.geekbang.org/lesson/818?article=927434
wiki: wiki/concepts/018-efficient-finetuning-practice.md
---

# 018: 高效微调实践

**Source:** [3高效微调实践](https://u.geekbang.org/lesson/818?article=927434)

## Outline
- [Embedding 层与参数冻结](#embedding-层与参数冻结)
- [位置编码](#位置编码)
- [Transformer 核心：Attention 与残差连接](#transformer-核心attention-与残差连接)
- [LoRA 原理：低秩矩阵分解](#lora-原理低秩矩阵分解)
- [LoRA 参数量对比](#lora-参数量对比)
- [实战：ModelScope Swift 框架微调](#实战modelscope-swift-框架微调)
- [自我认知微调实战](#自我认知微调实战)
- [意图识别微调](#意图识别微调)
- [微调工具对比](#微调工具对比)
- [Connections](#connections)

---

## Embedding 层与参数冻结

Embedding 层的作用是将每个 Token ID 映射为对应的语义向量（与 RAG 中的向量含义相同——语义相近的词，向量距离更近）。典型示例：国王 − 男人 + 女人 ≈ 皇后。

**关键事实**：Embedding 层约占模型总参数量的 **30%**，是"大胖子"参数块。

因此在微调时，直接更新 Embedding 代价极高。常见策略是**选择性冻结**：

- 冻结 Embedding 层（`requires_grad=False`），保留预训练时建立的语义空间不变。
- 在上层添加特定任务的层或适配器，完成微调。
- 仅针对少量特定 Token 或领域专有词汇做局部更新（例如医疗领域罕见术语）。

---

## 位置编码

Transformer 原始的位置编码使用正弦/余弦函数：

```
PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```

- 奇数维度用余弦，偶数维度用正弦，天然支持并行计算。
- 每个词拥有唯一的正弦/余弦曲线组合，以"信号"角度表示位置。

BERT 等现代模型使用**可学习位置编码**（Learnable Positional Encoding）：

- 维护一张位置表，每个位置对应一个可训练向量。
- 能捕获离散和非周期的位置关系，实践效果优于固定正弦编码。

---

## Transformer 核心：Attention 与残差连接

**QKV 注意力机制**：每个输入 Token 被映射为 Query、Key、Value 三个向量，通过 Softmax 计算注意力分布矩阵。微调实践中最重要的是 Q 和 V。

**残差连接（Residual Connection）**的意义：

- 在反向传播时，梯度经过多层叠加会发生指数级衰减，导致底层参数几乎不更新（**梯度消失**问题）。
- 残差路径相当于"电梯"，计算 `output = x + F(x)`，使梯度始终保留一条直通通道（至少保证梯度 ≥ 1），从而缓解梯度消失。
- 微调效果不佳时，梯度消失往往是原因之一。

**诊断指标**：
- 梯度范数 > 5：梯度爆炸
- 梯度范数 < 0.1：梯度消失

---

## LoRA 原理：低秩矩阵分解

LoRA（Low-Rank Adaptation）是当前工程实践的最优微调方案，具备以下优势：
- 显存占用极低（约为全量微调的 1%）
- 推理延迟几乎为零
- 支持多任务快速切换
- 可与预训练权重分开存储，灵活装卸

**核心思想**：不直接更新预训练权重矩阵 `W`，而是为其添加一个低秩旁路矩阵 `ΔW`：

```
W' = W + ΔW = W + A × B
```

其中：
- `W` 冻结，维度为 `d × d`（例如 1024×1024）
- `A` 的维度为 `d × r`（例如 1024×8）
- `B` 的维度为 `r × d`（例如 8×1024）
- `r` 为秩（rank），通常取 **8**，实践效果最佳

**矩阵示例（r=2，W 为 4×4）**：

```
W（冻结）:         A（训练）:    B（训练）:
1  2  3  4        0.1 0.2      0.1 0.2 0.3 0.4
5  6  7  8    +   0.3 0.4  ×   0.5 0.6 0.7 0.8
9  10 11 12       0.5 0.6
13 14 15 16       0.7 0.8
```

LoRA 作用于 Transformer 的 **Feed-Forward 层** 以及 Self-Attention 的 **Q、V 矩阵**。

---

## LoRA 参数量对比

以 `d = 1024`，`r = 8` 为例：

| 方式 | 参数量 | 比例 |
|------|--------|------|
| 全量微调 | 1024 × 1024 = **1,048,576** | 100% |
| LoRA (r=8) | 1024×8 + 8×1024 = **16,384** | **约 1.56%** |

结论：LoRA 约只需更新原始参数的 **1~2%**，显存节省 **90% 以上**。

---

## 实战：ModelScope Swift 框架微调

**Swift**（ModelScope Swift）是 ModelScope 社区出品的大模型训练框架，对 Hugging Face PEFT 进行了封装，提供：
1. 命令行接口（`swift sft ...`）
2. Python 库接口（`from swift import ...`）
3. Web UI（`swift webui`）——带中文参数说明，适合初学者

**计算资源选项**：
- ModelScope 社区免费 GPU（新用户约 36 小时）
- AutoDL 按需算力租用
- Google AI Studio（Colab）

**微调命令示例**（自我认知）：

```bash
swift sft \
  --model_type qwen2_5-7b-instruct \
  --dataset self-cognition#500 \
  --train_type lora \
  --model_author <你的名字> \
  --model_name <你的模型名>
```

参数说明：
- `#500`：取数据集前 500 条，不足则循环补足
- `--train_type lora`：使用 LoRA 微调
- 输出目录：`output/<时间戳>/checkpoint-<步数>/`

---

## 自我认知微调实战

**目标**：让模型在回答"你是谁"时输出自定义身份，而非默认的"我是千问 2.5"。

**数据集格式**（JSONL）：

```json
{"instruction": "你是谁？", "output": "我是 Jarvis，由 <作者> 训练的人工智能助手。"}
```

数据来源：Swift 内置自我认知数据集（约 1500 条），以 `{{model_name}}`、`{{model_author}}` 作为变量占位符自动替换。

**训练过程观测指标**：

| 指标 | 正常范围 | 异常含义 |
|------|----------|----------|
| Loss（训练） | 逐渐下降 | 持续上升 = 训练失败 |
| Loss（验证） | 随训练下降 | 先降后升 = 欠拟合；持续下降后稳定 = 正常 |
| Token ACC | 0.6–0.8 | 超出范围需关注 |
| 学习率 | 逐步线性衰减 | 静止不变 = 参数设置问题 |
| 梯度范数 | 0.5–0.7 | >5 爆炸，<0.1 消失 |

**Checkpoint 策略**：
- 每隔 N 步（建议 50 步）保存一个检查点
- 训练结束后选取验证集 Loss 最低的检查点（`best_model_checkpoint`）
- `last` checkpoint 不一定是最优，优先用 `best`

**推理命令**（交互模式）：

```bash
swift infer \
  --model_type qwen2_5-7b-instruct \
  --adapters output/<时间戳>/checkpoint-94 \
  --stream true \
  --max_new_tokens 2048
```

注意：LoRA adapters 和基础模型**分开存储**，推理时动态加载（约增加 5–10% 延迟）。

---

## 意图识别微调

**目标**：训练模型将自然语言指令映射为结构化的 IoT 控制命令（例如"灯光有点暗"→调节灯光亮度）。

**训练数据格式**（JSONL，三元组结构）：

```json
{
  "system": "你是一个语音控制机器人",
  "user": "灯光有点暗",
  "assistant": "{\"action\": \"adjust_light\", \"value\": \"brighter\"}"
}
```

**实验对比**：
- 未微调：模型会对"灯光暗"进行解释，不执行指令
- 微调后：直接输出执行动作

**数据量建议**：意图明确的任务，约 **1000 条**训练数据即可获得较好效果（1500 条更稳健）；数据过少（如 100 条）容易出现欠拟合。

---

## 微调工具对比

| 工具 | 特点 | 适用场景 |
|------|------|----------|
| PEFT（Hugging Face） | 底层库，灵活但参数多 | 深度定制、研究 |
| ModelScope Swift | 封装 PEFT，中文友好，Web UI | 工程实践、初学者 |
| 百炼平台（阿里云） | 全托管平台，可视化 | 快速验证，无需自备 GPU |

**LoRA 合并与不合并的选择**：

| 模式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 分离模式（Adapter） | 灵活切换任务，存储小 | 推理额外 5–10% 延迟 | 开发阶段、多任务 |
| 合并模式（Merge） | 推理无额外开销，部署简单 | 失去快速切换能力 | 生产部署、边缘设备 |

合并命令（Swift）：

```bash
swift export \
  --model_type qwen2_5-7b-instruct \
  --adapters output/<时间戳>/checkpoint-94 \
  --merge_lora true
```

合并后可使用 vLLM 等高性能推理框架直接加载（Swift 训练的 LoRA checkpoints 格式 vLLM 不直接支持，必须先合并）。

**实验管理建议**：
- 记录每次实验的关键参数（学习率、rank、epoch 等）及对应的业务指标
- 保存每次实验的 Loss 曲线图（存储于 `output/<时间戳>/images/`）
- 用业务语言向利益相关方汇报（如"方言识别率从 58% 提升至 82%"）

---

## Connections
- → [[017-finetuning-concepts-and-tokenizers]]
- → [[019-experiment-management-hyperparameter-optimization]]
