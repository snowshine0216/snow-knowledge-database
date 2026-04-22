---
tags: [model-evaluation, model-compression, quantization, vllm, deployment, ab-testing, lora, fine-tuning]
source: https://u.geekbang.org/lesson/818?article=927436
wiki: wiki/concepts/model-compression-and-deployment.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 你认为模型上线的决策依据应该是模型内部指标（如 Loss、准确率）还是业务指标？为什么？
2. 量化（Quantization）是什么意思？把 FP16 模型量化成 INT4 大概会节省多少显存？
3. vLLM、Ollama、SGLang 这三种推理部署工具，你认为哪个更适合生产环境？为什么？

---

# 020: 模型评估与上线决策·压缩部署项目实践

**Source:** [5模型评估与上线决策压缩部署项目实践](https://u.geekbang.org/lesson/818?article=927436)

## Outline
- [模型评估与上线决策](#模型评估与上线决策)
- [模型压缩：为什么需要压缩](#模型压缩为什么需要压缩)
- [量化详解](#量化详解)
- [压缩方法对比：量化 vs. 蒸馏 vs. 知识蒸馏](#压缩方法对比量化-vs-蒸馏-vs-知识蒸馏)
- [量化工具与操作步骤](#量化工具与操作步骤)
- [推理部署：Ollama vs. vLLM vs. SGLang](#推理部署ollama-vs-vllm-vs-sglang)
- [vLLM 核心优化参数](#vllm-核心优化参数)
- [热更新与蓝绿部署](#热更新与蓝绿部署)
- [FastAPI 包装推理服务](#fastapi-包装推理服务)
- [微调平台设计思路](#微调平台设计思路)
- [Connections](#connections)

---

## 模型评估与上线决策

上线决策的核心不是模型内部指标（如 Loss、准确率），而是**业务指标**：

1. **用户满意度**：上线后用户体验是否改善
2. **Bad case 解决率**：旧问题是否修复（如重复推荐、无关回答）
3. **投诉率变化**：是否新增用户投诉

### A/B Test 流程
- 将模型部署到 Prometheus 监控，观察端侧转化率
- 转化率持续下降时通过 Slack 告警，触发**一键切换回旧模型**
- 快速回退原则：出现问题先回退，再排查，再重新上线

### 灰度发布
- 先向少量用户开放新模型，观察反馈
- 确认无异常后全量放开
- 流量切换通过 Nginx → vLLM 实现

---

## 模型压缩：为什么需要压缩

### 两大核心痛点
| 痛点 | 说明 |
|------|------|
| 显存不足 | 7B FP16 模型约需 14GB 显存，普通 GPU 跑不动 |
| 推理延迟高 | 7B FP16 推理延迟约 300ms，用户体验差 |

### 为什么不直接用小模型？
- **小模型** = 学的东西少，智商（能力上限）不足
- **大模型压缩** = 保留大模型的能力，同时获得小模型的运行效率
- 类比：瘦身但不减脑，减脂但保留智识

典型场景：用小模型微调丝扣语句生成，效果始终不好；换稍大模型量化后微调，效果明显提升。

---

## 量化详解

### 核心思想
量化 ≈ 视频转码中的**降低颜色深度**：
- 原始模型参数：FP32（32位浮点）或 FP16（16位浮点）
- 量化后：INT8（8位整数）或 INT4（4位整数）
- 做法：把浮点数（如 0.78）映射到整数范围，等比放大以保留相对精度

**量化不是删除内容，而是用更少资源表达相似效果。**

### 量化效果
- 轻微精度下降（类似 32 位色降至 8 位色，肉眼几乎不可见）
- 显存大幅降低：7B 模型 FP16 约 14GB → INT4 约 4.7GB
- 推理速度显著提升

### 量化类型（以 Ollama 目录为参考）
| 类型 | 说明 |
|------|------|
| Q4_K_S/M/L | 4位量化 + 聪明压缩算法，分小/中/大号 |
| Q8 | 8位量化，精度损失更小 |
| INT4 / INT8 | 标准整数量化 |

---

## 压缩方法对比：量化 vs. 蒸馏 vs. 知识蒸馏

| 方法 | 特点 | 适用场景 |
|------|------|----------|
| **量化** | 保留原始大模型，压缩参数精度 | LoRA 微调后部署，首选方案 |
| **剪枝（简直）** | 删除冗余参数/层 | 容易破坏模型逻辑结构，Bad case 增多，不推荐 |
| **知识蒸馏** | 大模型教小模型，输出是小模型 | 训练周期长，LoRA 场景不适用 |

> 结论：LoRA 微调 + 量化组合是最实用的生产方案。

---

## 量化工具与操作步骤

### ModelScope Swift 量化流程

**Step 1：合并 LoRA 权重**（量化前必须先合并）
```bash
# Swift 进行量化时不支持直接处理 LoRA 适配器，需先合并
swift merge-lora \
  --model_type qwen2_5-7b-instruct \
  --ckpt_dir /path/to/lora/checkpoint \
  --merge_lora true
# 输出：merged_model/ 约 15GB（包含 SafeTensor 格式）
```

**Step 2：量化合并后的模型**
```bash
# 使用 BNB（BitsAndBytes）算法进行 INT4/INT8 量化
# 注意：Swift 官方支持 AWQ，但新版千问不支持，改用 BNB
swift export \
  --model_type qwen2_5-7b-instruct \
  --ckpt_dir /path/to/merged_model \
  --quant_bits 4 \
  --quant_method bnb \
  --output_dir /path/to/qwen2.5-7b-instruct-bnb
```

**Step 3：使用量化模型推理**
```bash
swift infer \
  --model_type qwen2_5-7b-instruct \
  --ckpt_dir /path/to/qwen2.5-7b-instruct-bnb
```

> **注意**：BNB 量化后的模型在 vLLM 中兼容性不完美（当前工具链限制）。更换量化工具（如 llama.cpp 的 GGUF 格式）可解决此问题。

---

## 推理部署：Ollama vs. vLLM vs. SGLang

| 工具 | 适用场景 | 不足 |
|------|----------|------|
| **Ollama** | 本地开发、调试、演示 | 无监控、无热更新、无健康检查，不适合生产 |
| **vLLM** | 生产环境标准，当前主流 | 功能仍不完善，格式兼容性问题多 |
| **SGLang** | 生产环境备选，与 vLLM 不相上下 | 同样处于早期阶段 |

**生产环境推荐方案**：`Nginx → FastAPI 包装层 → vLLM`

---

## vLLM 核心优化参数

### 1. CUDA 量化（节省显存）
vLLM 支持 ExLlama 格式量化，可将 7B 模型压缩至约 4GB：
```bash
python -m vllm.entrypoints.openai.api_server \
  --model /path/to/model \
  --quantization awq \
  --max-model-len 4096
```

### 2. Chunked Prefill（分块预填充）
避免超长 Prompt 阻塞解码请求，自动对长 Prompt 分块处理（类似 HTTP 分块传输）：
```bash
--enable-chunked-prefill
```

### 3. KV Cache（键值缓存）
多轮对话中，System Prompt 和历史消息无需重复计算：
- 原理：将已处理的 Token KV 值缓存，第二轮对话直接读取
- 效果：类似 MySQL 前加 Redis，显著降低延迟
```bash
--enable-prefix-caching
```

### 4. 并发配置（Ollama）
```bash
export OLLAMA_NUM_PARALLEL=4  # 设置并发数
# 重启 Ollama 生效
```

---

## 热更新与蓝绿部署

vLLM **原生不支持热更新**，需借助 Nginx 负载均衡实现：

```
流程：
1. 启动新模型实例（新版本）
2. 等待新实例通过健康检查 /health
3. Nginx 将流量切换到新实例
4. 旧实例上现有请求处理完毕后下线
```

```python
# FastAPI 健康检查端点
from fastapi import FastAPI
app = FastAPI()

@app.get("/health")
async def health_check():
    return {"status": "ok", "model": "qwen2.5-7b-instruct"}

@app.post("/predict")
async def predict(request: dict):
    # 调用 vLLM 推理
    ...
```

---

## FastAPI 包装推理服务

推理服务不应直接暴露给外部，需通过 FastAPI 包装：

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class PredictRequest(BaseModel):
    text: str
    model: str = "qwen2.5-7b-instruct"

@app.get("/")
async def root():
    return {"message": "LLM Inference Service"}

@app.post("/predict")
async def predict(req: PredictRequest):
    # 调用底层 vLLM/Ollama 服务
    result = call_llm(req.text, req.model)
    return {"text": req.text, "intent": result}
```

**FastAPI 内建 Swagger UI** 访问路径：`http://localhost:8000/docs`
- 支持在线测试所有 API 端点
- 自动生成 API 文档

---

## 微调平台设计思路

将微调工具链封装成 Web 平台（AI 辅助生成代码）：

```
功能模块：
GET  /          → 主页
POST /data/upload  → 数据上传（训练数据 → training_data/）
GET  /finetune  → 微调参数填写页
POST /finetune  → 触发微调训练，实时收集日志绘图
GET  /merge     → 权重合并页
POST /merge     → 执行 LoRA 合并
GET  /quantize  → 量化页
POST /quantize  → 执行 BNB/AWQ 量化
```

代码生成流程（TDD 驱动）：
1. 告诉 LLM 需要的功能列表
2. LLM 先生成项目需求文档
3. 基于需求生成单元测试
4. 基于需求 + 测试生成实现代码

> 注：AI 生成的代码结构清晰，但细节不可靠，需人工审核关键逻辑。

---

## Connections
- → [[model-compression-and-deployment]]
- → [[lora-fine-tuning]]
- → [[vllm-inference-serving]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释为什么"LoRA 微调 + 量化"是生产环境的首选方案，而不是剪枝或知识蒸馏？
2. vLLM 的 KV Cache（键值缓存）和 Chunked Prefill（分块预填充）分别解决了什么问题？请各用一个类比说明。
3. vLLM 原生不支持热更新，实际生产中如何通过 Nginx 实现蓝绿部署？请描述完整流程。

> [!example]- Answer Guide
> 
> #### Q1 — LoRA + 量化为何优于剪枝蒸馏
> 
> 剪枝容易破坏模型逻辑结构、导致 Bad case 增多；知识蒸馏训练周期长且输出是全新小模型，不适合 LoRA 场景。量化保留原始大模型能力，仅压缩参数精度，与 LoRA 合并后直接可用，是最实用的组合。
> 
> #### Q2 — KV Cache 与 Chunked Prefill 类比
> 
> KV Cache 将 System Prompt 和历史消息的 Token KV 值缓存，多轮对话中无需重复计算（类似 MySQL 前加 Redis）；Chunked Prefill 将超长 Prompt 自动分块处理，避免阻塞解码请求（类似 HTTP 分块传输）。
> 
> #### Q3 — Nginx 蓝绿部署完整流程
> 
> 先启动新模型实例，等新实例通过 `/health` 健康检查后，由 Nginx 将流量切换到新实例，旧实例处理完当前请求后再下线——实现零停机切换。
