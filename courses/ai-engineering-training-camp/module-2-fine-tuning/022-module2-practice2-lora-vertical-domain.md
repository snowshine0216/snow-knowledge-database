---
tags: [lora, fine-tuning, customer-service, vertical-domain, sft, peft, fastapi, jsonl]
source: https://u.geekbang.org/lesson/818?article=927824
wiki: wiki/concepts/vertical-domain-lora-finetuning.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 垂直领域微调（如电商客服）和通用微调相比，最关键的挑战是什么？是模型选型、工具选择，还是别的因素？
2. LoRA 微调中，`lora_rank` 和 `lora_alpha` 这两个超参数大致控制什么？你猜猜它们的典型值范围。
3. 如果要把一个微调好的语言模型对外提供问答接口，你会选择哪种技术框架？为什么？

---

# 022: 模块二实践二——基于 LoRA 微调垂直领域客服问答模型

**Source:** [模块二实践二基于 LoRA 微调一个垂直领域客服问答模型](https://u.geekbang.org/lesson/818?article=927824)

## Outline
- [实践目标](#实践目标)
- [垂直领域 vs. 通用微调的区别](#垂直领域-vs-通用微调的区别)
- [数据准备：JSONL 格式](#数据准备jsonl-格式)
- [Swift SFT 训练命令](#swift-sft-训练命令)
- [PEFT 训练方式（备选）](#peft-训练方式备选)
- [模型评估（Evaluation）](#模型评估evaluation)
- [部署为 FastAPI 服务](#部署为-fastapi-服务)
- [Swagger UI 调试](#swagger-ui-调试)
- [训练时间参考](#训练时间参考)
- [Connections](#connections)

---

## 实践目标

基于 LoRA 微调一个**垂直领域客服问答模型**（如电商客服、行业知识问答），并部署为 FastAPI REST 服务：

1. 准备垂直领域 JSONL 格式问答语料
2. 使用 ModelScope Swift 或 PEFT 进行 SFT（Supervised Fine-Tuning）
3. 合并 LoRA 权重、评估模型，部署为 API 服务

---

## 垂直领域 vs. 通用微调的区别

| 方面 | 意图识别（021） | 垂直领域客服（022） |
|------|----------------|---------------------|
| 微调目标 | 输出固定格式（意图标签） | 学习领域知识和问答风格 |
| 数据格式 | `instruction → 意图标签` | `question → answer`（领域问答对） |
| 核心挑战 | 格式控制 | **语料质量和领域覆盖度** |
| 模型选型 | 千问 8B | 千问 7B / BERT / LLaMA 均可 |

> 垂直领域微调的成败关键在于**语料（Corpus）的质量和准备方式**，而非工具选择。

---

## 数据准备：JSONL 格式

### 推荐格式（SFT 通用格式）

```jsonl
{"instruction": "退款需要多少天到账？", "input": "", "output": "退款通常在3-5个工作日内到账，具体以银行处理时间为准。"}
{"instruction": "如何申请退货？", "input": "", "output": "您可以在订单详情页点击「申请退货」，填写退货原因后提交，客服会在24小时内审核。"}
{"instruction": "商品破损怎么办？", "input": "", "output": "如收到破损商品，请在签收后24小时内拍照联系客服，我们会为您安排补发或退款。"}
```

### 数据加载与划分

```python
import json
from sklearn.model_selection import train_test_split

# 加载 JSONL
def load_jsonl(path):
    with open(path, "r", encoding="utf-8") as f:
        return [json.loads(line) for line in f]

data = load_jsonl("customer_service.jsonl")

# 划分训练集 / 验证集（8:2）
train_data, val_data = train_test_split(data, test_size=0.2, random_state=42)
```

### 数据格式注意事项
- 如使用 PEFT + Hugging Face 方式，提取字段为 `text` 和 `label_text`
- 如使用 Swift 方式，直接支持 `instruction` / `input` / `output` 三段式
- 语料不同时需要做**特定的字段映射和预处理**

---

## Swift SFT 训练命令

```bash
CUDA_VISIBLE_DEVICES=0 swift sft \
  --model_type qwen2_5-7b-instruct \
  --dataset /path/to/customer_service.jsonl \
  --sft_type lora \
  --lora_rank 8 \
  --lora_alpha 16 \
  --target_modules q_proj v_proj \
  --num_train_epochs 3 \
  --per_device_train_batch_size 4 \
  --gradient_accumulation_steps 4 \
  --learning_rate 1e-4 \
  --save_steps 100 \
  --output_dir /path/to/output/customer-service-lora
```

**硬件要求**：千问 8B 模型需约 **22GB 显存**（如 A10 GPU）

### 合并 LoRA 权重

```bash
swift merge-lora \
  --model_type qwen2_5-7b-instruct \
  --ckpt_dir /path/to/output/customer-service-lora/checkpoint-xxx \
  --merge_lora true \
  --output_dir /path/to/merged/customer-service-model
```

---

## PEFT 训练方式（备选）

PEFT 方式与 Swift 功能等价，适合海外模型或 Hugging Face 数据集：

```python
from peft import LoraConfig, get_peft_model, TaskType
from transformers import TrainingArguments, Trainer

lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=8,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
)

training_args = TrainingArguments(
    output_dir="/path/to/output",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=1e-4,
    save_steps=100,
    evaluation_strategy="steps",
    eval_steps=100,
)

trainer = Trainer(
    model=get_peft_model(model, lora_config),
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
)
trainer.train()
```

---

## 模型评估（Evaluation）

训练完成后对模型进行评估：

```python
# 使用 Swift 评估
swift eval \
  --model_type qwen2_5-7b-instruct \
  --ckpt_dir /path/to/merged/customer-service-model \
  --eval_dataset /path/to/test.jsonl

# 手动评估示例
from transformers import pipeline

pipe = pipeline("text-generation", model="/path/to/merged/customer-service-model")
result = pipe("退款需要多少天？", max_new_tokens=100)
print(result[0]["generated_text"])
```

评估指标参考：
- **领域覆盖率**：测试集中能正确回答的比例
- **格式准确率**：回答是否符合客服口吻
- **Bad case 统计**：列出错误回答，分析原因

---

## 部署为 FastAPI 服务

```python
# app.py
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = FastAPI(title="Customer Service QA API")

MODEL_PATH = "/path/to/merged/customer-service-model"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    torch_dtype=torch.float16,
    device_map="auto"
)

class QuestionRequest(BaseModel):
    question: str

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/v1/ask")
async def ask(req: QuestionRequest):
    prompt = f"用户：{req.question}\n客服："
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=200,
            temperature=0.7,
            do_sample=True,
        )
    answer = tokenizer.decode(outputs[0][inputs["input_ids"].shape[1]:],
                               skip_special_tokens=True)
    return {"question": req.question, "answer": answer}
```

**启动**：
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

**项目目录结构**：
```
customer-service-qa/
├── README.md          # 训练步骤、合并、启动、测试说明
├── data/
│   └── customer_service.jsonl
├── train.py           # PEFT 训练脚本
├── merge.py           # LoRA 合并脚本
├── evaluate.py        # 模型评估脚本
└── app.py             # FastAPI 服务
```

---

## Swagger UI 调试

FastAPI 内建 Swagger UI，访问 `http://localhost:8000/docs`：

- **GET /health**：健康检查，确认服务是否在线
- **GET /knowledge/faq**：查询知识库 FAQ 列表
- **POST /api/v1/ask**：提问接口，支持在线 Try it out 测试

Swagger UI 功能：
1. 展示所有 API 端点和参数说明
2. 支持直接在页面填写参数并执行请求
3. 显示实际发送的 curl 命令和响应结果

---

## 训练时间参考

| 模型 | GPU | 数据量 | 预计训练时间 |
|------|-----|--------|-------------|
| 千问 8B | A10 (22GB) | 中等（数千条） | 25～40 分钟 |

> 建议在阿里云 ModelScope 平台租用 A10 GPU 进行训练，本地 8GB GPU 显存不足以运行 8B 模型。

---

## Connections
- → [[vertical-domain-lora-finetuning]]
- → [[lora-fine-tuning]]
- → [[intent-recognition-lora-fine-tuning]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释本课 SFT 训练命令中 `--target_modules q_proj v_proj`、`--lora_rank 8`、`--lora_alpha 16` 三个参数各自的作用，以及为什么这三个参数要组合使用。
2. 本课提到了三类模型评估指标：领域覆盖率、格式准确率、Bad case 统计。请解释每种指标衡量的是什么，以及它们分别能暴露微调中哪类问题。
3. 描述从用户发起一次 `/api/v1/ask` 请求到得到答案的完整链路，包括 prompt 的构造方式、模型推理参数（`temperature`、`max_new_tokens`）的含义，以及 tokenizer 如何从输出中截取答案部分。

> [!example]- Answer Guide
> 
> #### Q1 — LoRA 三参数作用与组合
> 
> `target_modules` 指定只对注意力层的 q_proj 和 v_proj 注入低秩矩阵，从而大幅减少可训练参数；`lora_rank=8` 决定低秩矩阵的秩（越大表达能力越强但显存消耗越高）；`lora_alpha=16` 是缩放因子，控制 LoRA 更新的幅度，三者共同决定 LoRA 适配器的容量与训练稳定性。
> 
> #### Q2 — 三类评估指标含义
> 
> 领域覆盖率衡量测试集中能正确回答的比例，暴露语料是否覆盖了业务场景；格式准确率检验回答是否符合客服口吻，暴露风格/格式对齐问题；Bad case 统计通过逐一分析错误回答找根因，是定位数据缺陷或过拟合的主要手段。
> 
> #### Q3 — 请求到答案完整链路
> 
> 请求到达后将用户问题拼接为 `"用户：{question}\n客服："` 格式的 prompt；tokenizer 编码后送入模型，`max_new_tokens=200` 限制生成长度，`temperature=0.7` 引入随机性使回答更自然；生成结束后 tokenizer 解码输出，并通过 `outputs[0][inputs["input_ids"].shape[1]:]` 截去输入部分，只返回模型新生成的答案文本。
