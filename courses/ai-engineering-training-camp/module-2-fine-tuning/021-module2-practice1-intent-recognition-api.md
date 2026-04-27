---
tags: [lora, fine-tuning, intent-recognition, peft, fastapi, modelscope, swift, sft]
source: https://u.geekbang.org/lesson/818?article=927823
wiki: wiki/concepts/intent-recognition-lora-fine-tuning.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. LoRA 微调与全量微调（Full Fine-tuning）的核心区别是什么？`lora_rank`（秩）越大意味着什么？
2. 意图识别模型的训练目标是什么？它是让模型"学会知识"还是"学会格式"？
3. 如果你要将一个微调后的模型部署为 REST API，大致需要哪几个步骤？

---

# 021: 模块二实践一——训练意图识别模型并部署为 API

**Source:** [模块二实践一训练一个意图识别模型并部署为 API](https://u.geekbang.org/lesson/818?article=927823)

## Outline
- [实践目标](#实践目标)
- [工具选型：Swift vs. PEFT vs. LLaMA-Factory](#工具选型swift-vs-peft-vs-llama-factory)
- [LoRA 微调关键参数](#lora-微调关键参数)
- [PEFT 训练流程（Python 脚本方式）](#peft-训练流程python-脚本方式)
- [数据集准备与预处理](#数据集准备与预处理)
- [训练配置示例](#训练配置示例)
- [模型合并与部署为 FastAPI](#模型合并与部署为-fastapi)
- [意图识别验证](#意图识别验证)
- [国内 vs. 海外工具链建议](#国内-vs-海外工具链建议)
- [Connections](#connections)

---

## 实践目标

使用 **LoRA** 微调一个**意图识别模型**，并将其部署为可访问的 REST API：

1. 在 ModelScope 平台（A10 GPU，22GB 显存）上进行 LoRA 微调
2. 基础模型：千问3 8B 或千问2.5 8B
3. 将微调后模型合并权重并部署为 FastAPI 服务

> 意图识别微调的本质：让模型学会**输出特定格式**（如 `{"intent": "退票"}`），而不是自由回答。

---

## 工具选型：Swift vs. PEFT vs. LLaMA-Factory

| 工具 | 特点 | 适用场景 |
|------|------|----------|
| **ModelScope Swift** | 命令行参数形式，依托魔搭社区，国内下载快 | 国内首选，支持中文数据集 |
| **PEFT（Hugging Face）** | Python 脚本方式，支持海外模型更好 | 海外模型/Hugging Face 数据集场景 |
| **LLaMA-Factory** | 图形化界面，操作与 Swift UI 类似 | 希望可视化操作时 |

**核心结论**：三者参数体系大同小异，理解参数含义比选工具更重要。

---

## LoRA 微调关键参数

理解参数背后的 Transformer 结构，才能有效调参：

| 参数                            | 含义                                |
| ----------------------------- | --------------------------------- |
| `target_modules`              | 微调哪些矩阵，如 `q_proj`, `v_proj`（注意力头） |
| `lora_rank` (r)               | LoRA 分解矩阵的秩，越大容量越大，显存越多           |
| `lora_alpha`                  | LoRA 缩放系数，通常设为 `2 * rank`         |
| `lora_dropout`                | 防止过拟合的 Dropout 层                  |
| `learning_rate`               | 学习率，LoRA 通常比全量微调大（如 1e-4）         |
| `num_train_epochs`            | 训练轮数（Epoch）                       |
| `per_device_train_batch_size` | 每张 GPU 的批次大小                      |
| `gradient_accumulation_steps` | 梯度累积步数，等效增大批次                     |
| `save_steps`                  | 每多少步保存一次 checkpoint               |

> [!info]+ 💡 Explanation - LoRA 参数调优深潜
>
> ### 参数建议速查
>
> | 参数 | 建议值 | 说明 |
> | :--- | :--- | :--- |
> | `target_modules` | `q_proj, v_proj`（基础）<br>`all-linear`（推荐） | 只调 Q/V 显存最省，但效果通常一般。更稳的趋势是微调所有线性层，包括 Attention 和 MLP 层，效果更接近全量微调。 |
> | `lora_rank` (`r`) | `8`, `16`, `32`, `64` | 并非越大越好。一般任务 `8-16` 够用；复杂逻辑或垂直领域任务建议 `32` 或 `64`；再大之后边际收益会递减。 |
> | `lora_dropout` | `0.05` 或 `0.1` | 用于防止过拟合。如果数据量极大（几十万条以上），可以设为 `0`。 |
>
> ### 为什么 `alpha / r` 能起到“解耦”作用？
>
> LoRA 的权重更新量来自两个低秩矩阵相乘：
>
> $$\Delta W = B \times A$$
>
> 其中 $A \in \mathbb{R}^{r \times d}$，$B \in \mathbb{R}^{d \times r}$。计算 $BA$ 的每一个元素时，本质上是在做向量内积：
>
> $$(BA)_{ij} = \sum_{k=1}^{r} B_{ik} A_{kj}$$
>
> 关键问题在这个求和符号上：如果 `r=8`，每个元素累加 8 个乘积；如果 `r=64`，每个元素累加 64 个乘积。虽然初始化时通常让 `A` 使用高斯分布、`B` 初始化为 `0`，所以初始 $\Delta W$ 为 `0`，但训练开始后 `A` 和 `B` 都会被梯度更新。如果不做缩放，更大的 `r` 会让 $\Delta W$ 的数值量级在统计上随 `r` 增大。
>
> LoRA 前向传播公式是：
>
> $$h = W_0x + \frac{\alpha}{r}(BA)x$$
>
> `alpha / r` 的核心作用是归一化 LoRA 分支的贡献：
>
> - **抵消 `r` 的影响**：除以 `r` 后，`BA` 因秩变大带来的数值增长被压回稳定范围。这样从 `r=8` 改到 `r=64` 时，LoRA 分支对主模型的整体干预强度不会突然放大。
> - **提升学习率可移植性**：如果没有缩放，针对 `r=8` 调好的学习率在 `r=64` 下可能变得过大，导致训练不稳定。有了 `alpha / r` 后，通常可以先保留原学习率，只把 `r` 当作容量参数调整。
>
> ### `alpha` 与学习率的关系
>
> `alpha` 可以理解为 LoRA 分支的“手动增益控制”。例如固定 `r=16` 时，`alpha=32` 的缩放系数是 `2`，`alpha=64` 的缩放系数是 `4`。增大 `alpha` 在效果上有点像放大学习率，但两者控制的对象不同：学习率控制所有可训练参数的更新步长，而 `alpha` 专门控制 LoRA 分支对原始权重的干预强度。
>
> 实战中可以先把 `alpha` 固定为 `2 * r`。如果 Loss 几乎不动，优先尝试增大学习率；如果任务需要更大表达容量，再增大 `r`。因为 `alpha / r` 已经稳定了数值尺度，调整 `r` 通常不需要重新搜索一整套学习率。
>
> ### 技术进阶：DoRA 的进一步解耦
>
> DoRA（Weight-Decomposed Low-Rank Adaptation）把权重拆成“大小（Magnitude）”和“方向（Direction）”，并主要对方向进行低秩微调。它比 LoRA 的 `alpha / r` 缩放更细，因为它把“改变方向”和“改变幅度”显式拆开，在极小 `r` 的情况下通常更稳定。
>
> ### Style 微调 vs. Knowledge 微调
>
> “改说话方式”和“装新知识”对权重的扰动深度完全不同。前者更像教模型换一种表达风格，后者更像让模型吸收新的领域映射关系。
>
> | 参数 | 改变对话风格（Style） | 学习垂直领域知识（Knowledge） |
> | :--- | :--- | :--- |
> | `lora_rank` (`r`) | 低：`8-16`。风格是浅层模式，不需要太多参数。 | 高：`32-128`。事实性知识需要更大的参数空间。 |
> | `lora_alpha` | `16-32`，保持在 `r` 的 `1-2` 倍即可。 | `64-256`，配合高 `r` 放大 LoRA 分支影响力。 |
> | `target_modules` | 主要线性层，如 `q_proj, v_proj`；很多风格任务只调 Attention 层就够。 | `all-linear`；必须覆盖 MLP 层，如 `down_proj`、`up_proj`、`gate_proj`。 |
> | `learning_rate` | 略高：`1e-4` 到 `2e-4`，让风格快速收敛。 | 略低：`5e-5` 到 `1e-4`，避免破坏原有推理链。 |
> | `num_train_epochs` | 少：`1-3` 轮，太多容易复读和过拟合。 | 多：`5-10` 轮，配合学习率衰减让事实反复出现。 |
>
> Attention 层更多负责序列关系和上下文选择，影响“怎么说”；MLP 层更像事实映射和模式存储的位置，影响“说什么”。所以风格任务可以从 `q_proj, v_proj` 起步，而医疗、法律、公司内部 API 等知识注入任务应优先使用 `all-linear`。
>
> 但要注意：LoRA 记事实的可靠性不如 RAG。对“准确回答专业问题”的系统，微调更适合让模型掌握术语、格式、口径和调用习惯；真正需要可追溯事实时，应把 RAG 放在主架构里。
>
> ### QA 对 vs. 长篇文档
>
> 规整 QA 对（Instruction Tuning）和长篇文档（Continued Pre-training）是两种不同的学习模式。QA 对更像刷真题，长文档更像读教材。
>
> | 维度 | 规整 QA 对（Instruction Tuning） | 长篇文档（Continued Pre-training） |
> | :--- | :--- | :--- |
> | 训练目标 | 对齐：学习如何听懂指令并按格式回答。 | 建模：学习领域语言分布和原始知识。 |
> | Loss 计算 | 通常只计算回答部分，忽略问题部分，避免模型学会“生成问题”。 | 全文本计算，每个 token 都参与预测下一个 token。 |
> | `lora_rank` (`r`) | 中等：`8-32`，重点是问答逻辑和输出风格。 | 高：`64-256`，需要更多容量吸收领域事实。 |
> | `learning_rate` | 较高：约 `1e-4`，指令模式鲜明，可以快一些。 | 较低：`1e-5` 到 `5e-5`，避免冲垮通用能力。 |
> | 序列长度 | `1024-2048` 通常覆盖大部分 QA。 | `4096+` 更合适，用于捕捉长距离依赖。 |
>
> 处理 QA 数据时，要确认训练模板会 Mask 掉问题部分，只对答案部分计算 Loss。处理长文档时，通常使用 `pretrain` 模式，并通过 Pack（打包）把多篇短文档拼成固定长度序列，中间用 `<eos>` 分隔，提高训练效率。
>
> 对公司内部 API 手册这类材料，ROI 最高的路线通常是把文档转成高质量 QA 对；如果还需要模型形成领域语言直觉，再混入少量长文档。工业实践里常见的混合策略是：QA 对为主，少量长文档补领域分布，再混入一部分通用对话数据防止能力退化。
>
> ### 回到本课：意图识别应该怎么配？
>
> 本课的意图识别任务更接近规整 QA/SFT：输入一句用户话术，输出固定意图标签。它主要学习的是“分类格式”和“标签映射”，不是让模型背新知识。因此可以从 `r=8` 或 `r=16`、`alpha=16` 或 `32`、`target_modules=q_proj,v_proj`、`lora_dropout=0.05`、`epoch=2-3` 起步。如果标签边界复杂、类别很多或表达差异很大，再考虑升到 `r=32` 并尝试 `all-linear`。

> [!question]- 📋 面试题 (Interview Follow-up)
>
> **题目 1：** 为什么 LoRA 要使用 `alpha / r` 作为缩放系数？如果去掉这个缩放，增大 `r` 可能带来什么训练问题？
>
> **题目 2：** `lora_alpha` 和 `learning_rate` 都会影响训练强度，它们的区别是什么？调参时应该如何分工？
>
> **题目 3：** 为什么学习垂直领域知识时通常建议使用 `all-linear`，而改变对话风格时可以先从 `q_proj, v_proj` 起步？
>
> **题目 4：** 规整 QA 对和长篇文档在 Loss 计算方式上有什么差异？这个差异会如何影响 LoRA 参数选择？
>
> **题目 5：** 如果公司内部 API 文档需要被模型准确回答，为什么不建议只靠 LoRA 记忆事实？更稳的架构应该是什么？

> [!example]- 💡 答案指南 (Answer Guide)
>
> **题目 1 - 引导答案思路：**
> `BA` 的每个元素是 `r` 个乘积的累加，`r` 越大，更新量的统计尺度越容易变大。`alpha / r` 用除以 `r` 的方式抵消秩增大带来的数值放大，让 LoRA 分支在不同 `r` 下保持相近的干预强度。去掉缩放后，从小 `r` 切到大 `r` 可能导致原学习率过激，训练震荡或不稳定。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 学习率控制所有可训练参数每一步更新多大；`lora_alpha` 控制 LoRA 分支最终叠加到原模型上的影响强度。实战上先把 `alpha` 固定为 `2 * r`，如果 Loss 不动优先调学习率；如果任务容量不足再调 `r`，必要时再微调 `alpha`。
>
> ---
>
> **题目 3 - 引导答案思路：**
> Attention 层偏向处理上下文关系和表达方式，适合风格、语气、格式类任务；MLP 层更像事实和模式映射的存储区域，知识注入通常需要覆盖 `gate_proj`、`up_proj`、`down_proj` 等 MLP 线性层。因此知识任务优先 `all-linear`，风格任务可以用更小范围降低显存和过拟合风险。
>
> ---
>
> **题目 4 - 引导答案思路：**
> QA/SFT 通常只对答案部分计算 Loss，目标是学会按指令输出；长篇文档训练通常对全文计算 Loss，目标是学习领域语言分布。QA 可用中等 `r` 和较高学习率快速收敛；长文档信息密度更高、序列更长，通常需要更高 `r`、更低学习率和更长上下文。
>
> ---
>
> **题目 5 - 引导答案思路：**
> LoRA 可以让模型熟悉术语、输出格式和领域表达，但把事实直接写进权重后难更新、难溯源，也容易幻觉。内部 API 文档这类强事实场景应以 RAG 为主，用检索提供最新、可追踪的上下文；微调只负责让模型理解业务话术、遵守回答格式和更好调用检索结果。

---

## PEFT 训练流程（Python 脚本方式）

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import LoraConfig, get_peft_model, TaskType
from torch.utils.data import DataLoader

# 1. 配置参数
config = {
    "batch_size": 4,
    "num_epochs": 3,
    "learning_rate": 1e-4,
    "model_name": "Qwen/Qwen2.5-7B-Instruct",
}

# 2. 加载分词器和模型
tokenizer = AutoTokenizer.from_pretrained(config["model_name"])
model = AutoModelForCausalLM.from_pretrained(
    config["model_name"],
    torch_dtype="auto",
    device_map="auto"
)

# 3. 配置 LoRA
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=8,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
)
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# 4. 加载意图识别数据集（标签映射）
# 数据格式：{"instruction": "我要退票", "output": "退票"}
# 划分训练集 / 验证集

# 5. 训练循环
# 每 save_steps 步保存 checkpoint
# 未设置早停（Early Stopping），按 epoch 自动结束
```

---

## 数据集准备与预处理

意图识别数据集格式：

```jsonl
{"instruction": "我要退票", "input": "", "output": "退票请求"}
{"instruction": "申请退款", "input": "", "output": "退款请求"}
{"instruction": "最便宜的票", "input": "", "output": "价格查询"}
{"instruction": "查询余票", "input": "", "output": "余票查询"}
```

**关键步骤**：
1. **文本分词**：按模型格式做预处理（chat template）
2. **标签映射**：将意图类别映射为 ID
3. **数据划分**：切分为训练集 + 验证集（约 8:2）

> 注：意图识别微调训练的是"回答格式"，需要大量 `{输入 → 意图标签}` 对。

---

## 训练配置示例

### Swift 命令行方式（推荐）

```bash
CUDA_VISIBLE_DEVICES=0 swift sft \
  --model_type qwen2_5-8b-instruct \
  --dataset /path/to/intent_dataset.jsonl \
  --sft_type lora \
  --lora_rank 8 \
  --lora_alpha 16 \
  --target_modules q_proj v_proj \
  --num_train_epochs 3 \
  --per_device_train_batch_size 4 \
  --gradient_accumulation_steps 4 \
  --learning_rate 1e-4 \
  --save_steps 100 \
  --output_dir /path/to/output
```

### 合并 LoRA 权重

```bash
# Swift 合并
swift merge-lora \
  --ckpt_dir /path/to/output/checkpoint-xxx \
  --merge_lora true

# PEFT 合并
from peft import PeftModel
merged = base_model.merge_and_unload()
merged.save_pretrained("/path/to/merged_model")
```

---

## 模型合并与部署为 FastAPI

```python
# app.py
from fastapi import FastAPI
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

app = FastAPI()
tokenizer = None
model = None

@app.on_event("startup")
async def load_model():
    global tokenizer, model
    tokenizer = AutoTokenizer.from_pretrained("/path/to/merged_model")
    model = AutoModelForCausalLM.from_pretrained(
        "/path/to/merged_model",
        torch_dtype="auto",
        device_map="auto"
    )

@app.get("/")
async def root():
    return {"message": "Intent Recognition API is running"}

class PredictRequest(BaseModel):
    text: str

@app.post("/predict")
async def predict(req: PredictRequest):
    inputs = tokenizer(req.text, return_tensors="pt").to(model.device)
    outputs = model.generate(**inputs, max_new_tokens=50)
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"text": req.text, "intent": result}
```

**启动服务**：
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

**测试接口**：
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "我要退票"}'

# 期望返回
{"text": "我要退票", "intent": "退票请求"}
```

访问 `http://localhost:8000/docs` 即可使用 **Swagger UI** 在线调试所有接口。

---

## 意图识别验证

微调成功的判断标准：
- ✅ 输入"我要退票" → 返回 `{"intent": "退票请求"}`
- ❌ 输入"我要退票" → 返回"退票需要以下手续……"（说明微调未成功）

### 与 Prompt Engineering 对比
| 方案 | 优点 | 缺点 |
|------|------|------|
| Few-shot Prompt | 实现简单，无需训练 | Context 越长推理越慢 |
| LoRA 微调 | 推理快，格式固定 | 需要训练数据和训练时间 |

---

## 国内 vs. 海外工具链建议

| 使用场景 | 推荐工具 |
|----------|----------|
| 国内训练 | ModelScope Swift + 魔搭社区数据集 |
| 国内数据集下载 | ModelScope（比 Hugging Face 快） |
| 海外模型（如 LLaMA） | PEFT + Hugging Face |
| 可视化操作 | LLaMA-Factory UI |

**ModelScope 常用数据集**：
- `AI-ModelScope/alpaca-gpt4-data-zh`（中文指令数据集）
- 下载比 Hugging Face 更快，格式与 Hugging Face 相同

---

## Connections
- → [[intent-recognition-lora-fine-tuning]]
- → [[lora-fine-tuning]]
- → [[model-compression-and-deployment]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释 `lora_alpha`、`lora_rank`、`target_modules` 这三个参数各自控制什么，它们之间有什么推荐的设置关系？
2. 本课中如何判断意图识别微调是否成功？LoRA 微调方案相比 Few-shot Prompt 方案有哪些优劣权衡？
3. Swift、PEFT、LLaMA-Factory 三种工具各自适合什么场景？课程给出的核心选型结论是什么？

> [!example]- Answer Guide
> 
> #### Q1 — LoRA 三参数含义与关系
> 
> `target_modules` 指定微调哪些注意力矩阵（如 `q_proj`、`v_proj`）；`lora_rank`（r）是分解矩阵的秩，越大模型容量越大但显存消耗越多；`lora_alpha` 是缩放系数，推荐设为 `2 * rank`（如 rank=8 则 alpha=16）。
> 
> #### Q2 — 微调效果判断与方案权衡
> 
> 判断标准：输入"我要退票"应返回 `{"intent": "退票请求"}` 而非自由回答；LoRA 微调的优势是推理快、输出格式固定，缺点是需要训练数据和训练时间，而 Few-shot Prompt 实现简单但上下文越长推理越慢。
> 
> #### Q3 — 三种工具选型结论
> 
> Swift 适合国内训练（命令行，依托魔搭社区）；PEFT 适合海外模型和 Hugging Face 数据集（Python 脚本）；LLaMA-Factory 适合希望可视化操作的场景；核心结论是三者参数体系大同小异，**理解参数含义比选工具更重要**。
