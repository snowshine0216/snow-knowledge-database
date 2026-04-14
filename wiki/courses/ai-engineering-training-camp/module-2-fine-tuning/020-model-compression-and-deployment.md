---
tags: [model-compression, quantization, vllm, deployment, ab-testing, lora, inference-serving]
source: https://u.geekbang.org/lesson/818?article=927436
---

# 模型压缩与生产部署

将微调后的大语言模型从实验室推向生产环境，需要解决两个核心问题：**运行效率**（显存不足、延迟过高）和**上线可靠性**（灰度发布、快速回退）。模型压缩（主要是量化）和 vLLM 推理服务是当前最成熟的解决方案组合。

## Key Concepts

- **量化（Quantization）**：将模型参数从 FP32/FP16 压缩为 INT8/INT4，在轻微精度损失下大幅降低显存占用和推理延迟。类比视频压缩中的"降低颜色深度"——不删内容，用更少资源表达相似效果。

- **为什么不直接用小模型**：小模型能力上限（"智商"）不足，大模型压缩是"瘦身不减脂"——保留大模型能力，获得小模型的运行效率。

- **量化方法**：
  - **INT4**：7B 模型从 14GB 压缩至约 4.7GB，推理最快
  - **INT8**：精度损失更小，显存约 8GB
  - **AWQ / BNB（BitsAndBytes）**：常用量化算法；Swift 工具链当前推荐 BNB

- **LoRA 合并（Merge）**：量化前必须先将 LoRA 适配器权重合并回基础模型，量化工具不直接支持 LoRA 格式。

- **vLLM**：当前生产推理服务事实标准，支持 KV Cache、Chunked Prefill、量化加载等优化。

- **KV Cache**：缓存多轮对话中的 System Prompt 和历史消息 Key/Value，避免重复计算，类似 MySQL + Redis 缓存层。

- **Chunked Prefill**：超长 Prompt 自动分块处理，防止单次解码阻塞请求队列。

- **Ollama**：仅适合本地开发调试，不支持监控、热更新、健康检查，不用于生产。

- **FastAPI**：推理服务不应直接对外暴露，需用 FastAPI 包装，提供健康检查、路由管理和 Swagger UI。

- **A/B Test + 灰度发布**：新模型先向少量用户开放，监控转化率和 Bad case，确认无异常后全量上线。

- **快速回退**：出现问题先通过 Nginx 流量切换回旧模型，再排查原因，不要试图在生产环境直接修复。

## Key Takeaways

- LoRA 微调 + INT4 量化是最常用的生产部署组合，可将 7B 模型从 14GB 压缩至 4-5GB
- 量化工具链（Swift + BNB）与推理框架（vLLM）之间存在兼容性问题，生产中需验证
- 生产环境推理服务部署架构：`Nginx → FastAPI → vLLM`，Ollama 仅用于开发环境
- vLLM 原生不支持热更新，需借助 Nginx 实现蓝绿部署（先启新实例 → 健康检查通过 → 切流量 → 下线旧实例）
- 上线决策应以业务指标（用户满意度、Bad case 解决率）为准，而非模型内部指标（Loss/准确率）
- 微调平台可用 AI 辅助生成（FastAPI + Gradio），但需人工审核关键业务逻辑

## See Also

- [[lora-fine-tuning]]
- [[intent-recognition-lora-fine-tuning]]
- [[vertical-domain-lora-finetuning]]
