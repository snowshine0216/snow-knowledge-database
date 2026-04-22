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

| 参数 | 含义 |
|------|------|
| `target_modules` | 微调哪些矩阵，如 `q_proj`, `v_proj`（注意力头）|
| `lora_rank` (r) | LoRA 分解矩阵的秩，越大容量越大，显存越多 |
| `lora_alpha` | LoRA 缩放系数，通常设为 `2 * rank` |
| `lora_dropout` | 防止过拟合的 Dropout 层 |
| `learning_rate` | 学习率，LoRA 通常比全量微调大（如 1e-4）|
| `num_train_epochs` | 训练轮数（Epoch） |
| `per_device_train_batch_size` | 每张 GPU 的批次大小 |
| `gradient_accumulation_steps` | 梯度累积步数，等效增大批次 |
| `save_steps` | 每多少步保存一次 checkpoint |

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
