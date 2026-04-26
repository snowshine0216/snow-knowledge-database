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
- 推理速度` 显著提升

### 量化类型（以 Ollama 目录为参考）
| 类型 | 说明 |
|------|------|
| Q4_K_S/M/L | 4位量化 + 聪明压缩算法，分小/中/大号 |
| Q8 | 8位量化，精度损失更小 |
| INT4 / INT8 | 标准整数量化 |

> [!info]+ 💡 Explanation - 为什么量化能最大程度保留原始模型能力
> 
> 在深度学习模型压缩的几种方案中，**量化（Quantization）**之所以被认为是最能保留原始模型能力的手段，核心在于它只改变了数据的"分辨率"，而没有破坏模型的"拓扑结构"。
> 
> #### 1. 逻辑结构的完整性（Structural Integrity）
> 与剪枝（Pruning）直接切断神经元之间的连接不同，量化**保留了网络的所有参数和连接通路**。
> 
> - **剪枝：** 类似于"删减文章的句子"，如果删错了关键句，逻辑就会断裂。剪枝改变了矩阵的稀疏性，往往需要重新设计算子才能加速，且极易导致模型在特定任务上的坍塌（Bad case）。
> - **量化：** 类似于"把高清电影压缩成标清"，虽然画质（精度）下降了，但电影的情节、人物关系、对白（模型逻辑）全部都在。神经元之间的贡献比例被大致保留，因此模型原有的推理逻辑不会发生根本性改变。
> 
> #### 2. 过参数化与鲁棒性（Over-parameterization）
> 现代大语言模型（LLM）通常是**过参数化**的。这意味着模型内部存在大量冗余，知识并非存储在某个特定参数的精确数值里，而是分布在参数的**相对分布（Distribution）**中。
> 
> 在 $FP16$（16位浮点数）中，很多权重的微小波动对最终预测结果（Softmax 后的概率分布）影响微乎其微。当我们将其压缩到 $INT8$ 甚至 $INT4$ 时，虽然单个参数的数值变了，但参数群体所代表的"决策边界"依然保持稳定。
> 
> #### 3. 权重的分布特征与线性映射
> 量化的核心公式通常是线性的：
> $$Q = \text{round}(\frac{V}{S}) + Z$$
> 其中 $V$ 是原始值，$S$ 是缩放因子（Scale），$Z$ 是偏移量（Zero-point）。
> 
> 这种映射方式能极好地保持权重之间的**相对大小关系**。在神经网络中，神经元是否激活主要取决于输入与权重的乘加和是否超过阈值。只要量化过程能保证"大权重依然是大权重，小权重依然是小权重"，模型捕捉特征的能力就能得到很大程度的保留。
> 
> #### 4. 离群值（Outliers）的针对性保护
> 早期的量化会导致性能大幅下降，但现代技术（如 **AWQ**, **GPTQ**）发现了 LLM 的一个关键特性：**模型能力高度依赖于极少数"离群"权重。**
> 
> - 在 LLM 的激活值中，通常只有 $0.1\%$ 的参数具有极大的数值，它们承载了模型大部分的逻辑判断。
> - 现代量化算法会识别这些"重要参数"，并对其进行特殊的保护（例如不量化这些参数，或使用更细粒度的缩放因子）。
> - **结论：** 只要保护好这 $1\%$ 的核心权重，剩下的 $99\%$ 即使大幅压缩精度，模型的能力（如语言理解、逻辑推理）也不会出现明显的 Bad case。
> 
> #### 5. 为什么它与 LoRA 是"绝配"？
> 
> | 特性 | 剪枝 + LoRA | 蒸馏 + LoRA | 量化 + LoRA (QLoRA) |
> | :--- | :--- | :--- | :--- |
> | **基础模型状态** | 被破坏（变稀疏） | 被替换（变小） | **原始模型（仅降权）** |
> | **合并复杂度** | 极高（需处理稀疏矩阵） | 无法合并（结构不同） | **极低（直接线性相加）** |
> | **显存占用** | 低 | 中 | **极低** |
> | **能力对齐** | 容易偏移 | 依赖教师模型质量 | **最贴近原版大模型** |
> 
> 量化之所以强大，是因为它在**大幅降低显存和带宽需求**的同时，以"牺牲精度换取速度"的方式，最大限度地尊重了原始模型的**知识分布和计算图结构**。对于需要保持原汁原味大模型能力的场景，量化是目前唯一的"无损"或"极低损耗"选择。

---

## 压缩方法对比：量化 vs. 蒸馏 vs. 知识蒸馏

| 方法       | 特点             | 适用场景                       |
| -------- | -------------- | -------------------------- |
| **量化**   | 保留原始大模型，压缩参数精度 | LoRA 微调后部署，首选方案            |
| **剪枝**   | 删除冗余参数/层       | 容易破坏模型逻辑结构，Bad case 增多，不推荐 |
| **知识蒸馏** | 大模型教小模型，输出是小模型 | 训练周期长，LoRA 场景不适用           |

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

> [!info]+ 💡 Explanation - vLLM 深度解析：PagedAttention 与 Ollama 的本质区别

> ### 一、什么是 vLLM？
> 
> **vLLM** 是专为生产环境高吞吐量设计的 LLM 推理与服务库，Ollama 则是为本地开发极致便利而生。两者定位从根本上不同。
> 
> #### 核心技术：PagedAttention
> 
> 这是 vLLM 的成名绝技。传统框架为每个请求**预分配连续显存**，导致严重的显存碎片（类似早期操作系统内存管理）。vLLM 借鉴虚拟内存分页思想，将 KV Cache 存储在**非连续的物理块**中：
> 
> - **几乎零浪费：** 显存利用率接近 100%
> - **高并发：** 省下的显存可同时服务更多请求
> - **吞吐量：** 多用户并发场景下通常比原生 HuggingFace 实现高 **10-20 倍**
> 
> ---
> 
> ### 二、vLLM vs. Ollama 深度对比
> 
> #### 技术架构差异
> 
> | 维度 | vLLM | Ollama |
> | :--- | :--- | :--- |
> | **底层实现** | Python / CUDA，直接与 GPU 通信，围绕 PagedAttention 展开 | C/C++（llama.cpp），跨平台，支持 CPU / Apple Silicon 统一内存 |
> | **硬件支持** | 主要 NVIDIA GPU（扩展中：AMD / Ascend） | 全平台：CPU、Mac M1/M2、NVIDIA、AMD |
> | **部署难度** | 中（需配置 Python 环境、CUDA 驱动） | **极低（一键安装包，类似 Docker）** |
> | **并发性能** | **极高，专为高并发高吞吐设计** | 一般，适合单人或小团队使用 |
> | **显存管理** | PagedAttention（动态分配，极致高效） | 静态分配（llama.cpp 机制） |
> | **API 兼容性** | 标准 OpenAI API 格式 | 自有 API + 兼容 OpenAI API |
> | **模型格式** | 原生 SafeTensors / 有限 GGUF 支持 | 专有 ModelFile（基于 GGUF） |
> 
> #### 核心场景定位
> 
> - **vLLM → 生产级后端：** 支持数百人同时访问的 AI 助手、Kubernetes 集群部署
> - **Ollama → 开发者本地工具：** MacBook 上快速跑 Llama 3、给本地 IDE 配私有模型
> 
> ---
> 
> ### 三、为什么生产环境选 vLLM？三大不可替代优势
> 
> **1. Prefix Caching（前缀缓存）**
> - **场景：** System Prompt 很长（复杂 Agent 规则）或用户多轮对话
> - **机制：** vLLM 检测到 Prompt 前缀相同，直接复用 KV Cache，跳过重复计算
> - **效果：** 长文本对话首字延迟（TTFT）大幅降低
> 
> **2. Chunked Prefill（分块预填充）**
> - **场景：** 用户 A 发送 10k 字长文档（Prefill 阶段），用户 B 正在生成第 50 个字（Decode 阶段）
> - **机制：** 将长文档切块穿插在生成请求中交替处理
> - **效果：** 避免长 Prefill 阻塞 Decode，服务不卡顿
> 
> **3. 动态连续批处理（Continuous Batching）**
> - **机制：** 不等所有请求结束才开始下一波；一个请求完成，新请求立即插入空位
> - **效果：** GPU 永不空转，利用率最大化
> 
> ---
> 
> ### 四、选型建议
> 
> | 场景 | 推荐工具 | 理由 |
> | :--- | :--- | :--- |
> | 本地调优 / 个人使用 | **Ollama** | 简单轻量，`OLLAMA_NUM_PARALLEL` 应付轻量并发 |
> | AI 应用开发 / 集群部署 | **vLLM** | 省显存，高负载下保持极快响应，生产首选 |

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

> [!info]+ 💡 Explanation - KV Cache 深度解析：从原理到 Anthropic 事故复盘
> 
> KV Cache 是从"实验室原型"走向"工业化部署"的第一道分水岭。Anthropic 2026 年 4 月关于 Claude Code 质量下降的事故报告，则是一堂关于"缓存失效"的惨痛教训课。
> 
> #### 一、为什么需要 KV Cache？
> 
> 在 Transformer 架构中，生成第 $N$ 个 Token 需要与前 $N-1$ 个 Token 计算注意力：
> 
> - **无缓存：** 每次都重新计算所有前置 Token 的 K/V 向量，复杂度 $O(N^2)$
> - **有缓存：** 将前 $N-1$ 个 Token 的 K/V 向量存入显存，新 Token 只需计算自身，复杂度降为 $O(N)$
> 
> **显存代价：** 对于 $L$ 层、隐藏维度 $H$ 的 FP16 模型，缓存单个 Token 约占：
> $$2 \times 2 \times L \times H \text{ bytes}$$
> 超长上下文场景下，KV Cache 往往超过模型参数本身的显存占用。
> 
> #### 二、Anthropic 事故复盘：`clear_thinking` Bug
> 
> **什么是 Harness？** 在 AI 领域，Agent Harness 是包裹模型的"操作系统"，负责拼接 System Prompt、管理历史对话、调用工具、控制 Token 限制。
> 
> **事故经过：** Anthropic 引入 `clear_thinking_20251015` 协议，本意是只在特定节点清理冗长思维链（CoT），节省 Token。但逻辑 Bug 导致 Harness 在**每一轮**都触发 `keep:1` 操作（只保留最后一个 Block）。
> 
> **双重后果：**
> - **模型变笨：** 历史记忆被物理抹除，Claude 陷入逻辑循环
> - **缓存全毁：** 每轮截断后发送的 Token 序列与上轮完全不匹配，缓存 100% 未命中
> 
> #### 三、缓存失效的根本原因：Exact Match（精确匹配）
> 
> 无论 vLLM 的 Prefix Caching 还是 Anthropic 的 API 级缓存，核心机制都是 **SHA 哈希**：
> 
> - 对 Prompt 前缀计算哈希，命中则复用，未命中则全量重算
> - **一个空格、一个换行、一个 Metadata Header 的改动 → 哈希彻底改变 → 缓存全失效**
> - Anthropic 案例中，Harness 错误修剪历史导致每轮序列都是全新的，必须重新进行昂贵的 Prefill
> 
> #### 四、如何避免缓存失效
> 
> | 策略 | 做法 |
> | :--- | :--- |
> | **前缀稳定性** | 最稳定内容（System Prompt、静态规则）放最前；最易变内容（时间戳、用户输入）放最后 |
> | **规范化** | Harness 层强制 `strip()`，统一 UTF-8 编码，消除不可见字符差异 |
> | **分层管理** | 参考 PagedAttention 分块思想：只有最后一块变了，前 $N-1$ 块依然可复用 |
> 
> **一句话总结：** KV Cache 是用空间换时间，而 Harness 的微小改动（如多了一个空格或触发了错误的修剪逻辑）会让这种交换彻底破产，导致性能和效果的"双重雪崩"。

> [!question]- 📋 面试题 - KV Cache 失效检测与工程化防护
> 
> **题目 1：** vLLM 的 Prefix Caching 依赖什么机制判断缓存命中？Harness 层的哪类改动最容易触发缓存失效？
> 
> **题目 2：** 如何通过可观测指标（Observability）自动发现生产环境中的缓存失效？请列出关键指标和检测逻辑。
> 
> **题目 3：** 设计一套自动化测试方案，要求能在 CI/CD 流程中提前捕获"Harness 修改导致 Prompt 前缀悄悄变化"这类隐性 Bug。

> [!example]- 💡 答案指南 - KV Cache 失效检测与工程化防护
> 
> **题目 1 - 引导答案思路：**
> 
> vLLM Prefix Caching 对 Prompt 前缀做 **SHA 哈希**，相同哈希直接复用 KV Block，不同则重新计算。最危险的改动类型：
> - **不可见字符变化：** 多一个空格、`\n` 变 `\r\n`、全角半角混用
> - **顺序变化：** 将 Tool 定义从 System Prompt 前移到后，哈希彻底改变
> - **动态字段侵入静态区：** 把时间戳、请求 ID 拼入 System Prompt（常见于模板 bug）
> - **修剪逻辑 Bug（如 Anthropic 案例）：** 每轮截断历史导致前缀序列永远不同
> 
> ---
> 
> **题目 2 - 引导答案思路：**
> 
> 三层可观测指标：
> 
> **服务端（vLLM Prometheus）：**
> - `vllm:num_cached_tokens` — 当前缓存总量
> - `vllm:gpu_cache_usage_gauge` — 缓存占用率
> - 通过日志的 `prefix_hit` 字段计算命中率
> 
> **客户端（API Usage 字段）：**
> ```json
> "usage": {
>   "prompt_tokens": 1000,
>   "prompt_cache_hit_tokens": 800,
>   "prompt_cache_miss_tokens": 200
> }
> ```
> $$\text{Cache Hit Rate} = \frac{\text{prompt\_cache\_hit\_tokens}}{\text{prompt\_tokens}}$$
> 
> **哨兵指标（首字延迟 TTFT）：**
> - 正常命中缓存：TTFT ≈ 100ms（$O(1)$ 读取）
> - 缓存全失效：TTFT ≈ 2000ms（$O(N)$ 重算 Prefill）
> - **自动化策略：** TTFT 突增 10x 时自动截获 Raw Prompt 并输出哈希对比报告
> 
> ---
> 
> **题目 3 - 引导答案思路：**
> 
> 三层测试套件：
> 
> **A. 单元测试：Hash 稳定性（最关键）**
> ```python
> def test_prompt_template_hash_consistency():
>     harness = PromptHarness()
>     payload1 = harness.build_payload(system_prompt, user_input="Hello")
>     payload2 = harness.build_payload(system_prompt, user_input="Hi")
>     # System Block 不受 user_input 影响，哈希必须相同
>     assert harness.get_block_hash(payload1, "system") == \
>            harness.get_block_hash(payload2, "system"), \
>            "System Prompt 发生了不可见的变更，将导致缓存失效！"
> ```
> 
> **B. 集成测试：缓存命中回归**
> - 请求 A 预热缓存 → 请求 B 复用相同前缀 → 断言 `prompt_cache_hit_tokens > 0`
> - 边界值：对话长度超 `max-model-len` 时，验证 Prefix Cache 是否仍能部分命中（滑动窗口）
> 
> **C. 性能基准测试（Pytest-Benchmark + TTFT）**
> - 建立 TTFT 基线；CI 中若 TTFT 相较基线劣化 >50%，自动生成 Raw Prompt Hash 对比报告并阻断合并
> 
> **工具链推荐：**
> - LangSmith / W&B：追踪每个请求的 Trace，记录每阶段 Hash 和 Cache Hit 状态
> - Prompt Invariant Proxy：发送前对重复前缀做 Hash 校验，Hash 抖动时报警
> - Pytest-Benchmark：建立 TTFT 性能基线，防止代码合入导致缓存机制退化

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
