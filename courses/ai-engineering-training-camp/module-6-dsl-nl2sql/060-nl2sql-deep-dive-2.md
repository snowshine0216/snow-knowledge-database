---
tags: [nl2sql, text2sql, sql-generation, fine-tuning, db-gpt, llama-factory, lora, spider-dataset]
source: https://u.geekbang.org/lesson/818?article=927476
wiki: wiki/concepts/060-nl2sql-deep-dive-2.md
---

# 060: NL2SQL Deep Dive Part 2

**Source:** [6NL2SQL详解2](https://u.geekbang.org/lesson/818?article=927476)

## Outline
- [微调路线概述](#微调路线概述)
- [Text2SQL 微调数据集](#text2sql-微调数据集)
- [DB-GPT-Hub 微调工具](#db-gpt-hub-微调工具)
- [LlamaFactory 微调工具](#llamafactory-微调工具)
- [微调效果的现实评估](#微调效果的现实评估)
- [AI 取数场景的适用逻辑](#ai-取数场景的适用逻辑)
- [微调 vs RAG 的选择](#微调-vs-rag-的选择)
- [拓展项目建议](#拓展项目建议)

---

## 微调路线概述

NL2SQL 有两条主要技术路线：
1. **RAG（上下文学习）**：使用检索增强，无需修改模型权重，可解释，目前主流方向（详见第 059 讲 Vanna）
2. **微调（Fine-tuning）**：通过 SFT 让模型输出格式更符合 SQL 要求，需要 GPU 资源和数据集

本讲重点介绍微调路线，主要推荐两个工具：**DB-GPT-Hub** 和 **LlamaFactory**。

---

## Text2SQL 微调数据集

### 常用公开数据集

| 数据集 | 时间 | 规模 | 特点 |
|--------|------|------|------|
| Spider 2.0 | 2024-08 | ~600 个工作流，1000+ 列 | 复杂查询为主，业界标准测试集 |
| BRD-SQL | - | ~33.4 GB | 涵盖区块链、医疗、教育等领域 |

- 查找更多数据集：[Awesome Text2SQL](https://github.com/eosphoros-ai/Awesome-Text2SQL)（包含数据集时间、大小索引）
- 也可在 ModelScope 社区搜索 `Text2SQL` 获取数据集

### 自定义数据集建议

如果业务场景特殊，可以自己生成数据集。方法：
1. 从数据库的 `query log` 提取历史 SQL
2. 人工编写业务问题（Instruction）与 SQL 答案（Output）的对应关系
3. 整理成微调工具支持的格式

### 数据集格式

DB-GPT-Hub 只支持一种格式，LlamaFactory 支持两种：

**ALPACA 格式**（DB-GPT-Hub 和 LlamaFactory 均支持）：
```json
{
  "db_id": "hospital",
  "instruction": "List all doctors in cardiology department",
  "input": "",
  "output": "SELECT name FROM doctors WHERE department = 'cardiology'"
}
```

**ShareGPT 格式**（LlamaFactory 额外支持）：
```json
{
  "conversations": [
    {"from": "human", "value": "List all doctors in cardiology"},
    {"from": "gpt", "value": "SELECT name FROM doctors WHERE department = 'cardiology'"}
  ]
}
```

---

## DB-GPT-Hub 微调工具

DB-GPT-Hub 是专为 Text2SQL 设计的微调工具，配置简单。

### 安装与目录结构

```bash
pip install db-gpt-hub
git clone https://github.com/eosphoros-ai/DB-GPT-Hub
# 目录：src/dbgpt-hub-sql/dbgpt_hub_sql/
# 包含：sft_train.sh, predict.sh, merge_weights.sh
```

### 数据准备

```bash
# 进入目录，处理 Spider 数据集（80% 训练，20% 测试）
python scripts/sql_data_process.py
# 生成：train.json, dev.json
```

### 微调（SFT）

```bash
bash scripts/start_sft_train.sh \
  --data_folder ./data \
  --data_info ./data/train.json \
  --learning_rate 2e-4 \
  --per_device_train_batch_size 8
```

关键参数：
- `learning_rate`：通常 `2e-4`，可调整为 `2e-5`
- `per_device_train_batch_size`：默认 8，可改为 16
- LoRA Target：默认关注 Q 层和 V 层；若使用 Qwen 模型，Target 需改为 `c_attn`

### 推理与评估

```bash
bash scripts/start_predict.sh   # 推理
bash scripts/start_evaluate.sh  # 评估
```

也可集成 DeepSpeed 加速训练：
```bash
deepspeed scripts/start_sft_train.sh --deepspeed configs/deepspeed.json
```

### 注意事项
- 更换数据集时，**必须检查 JSON 格式是否匹配**，这是最常见的出错点
- 更换模型时，**LoRA Target 必须相应修改**（不同模型注意力层命名不同）

---

## LlamaFactory 微调工具

LlamaFactory 不是专门为 Text2SQL 设计的，但支持最新模型和图形化操作界面，适合需要灵活选择模型的场景。

### 安装

```bash
pip install llamafactory
```

### 核心优势

- **支持最新模型**：包括 Llama 4（109B/402B）、Qwen 等主流模型
- **图形化界面**：无需命令行，通过 WebUI 点击配置参数，生成 YAML 配置文件
- **显存估算表**：内置表格说明不同精度（int8/fp16）+ 不同方法（LoRA/QLoRA）+ 不同模型参数量的显存消耗

### 显存参考（QLoRA, int8）

| 模型参数量 | 显存消耗 |
|-----------|---------|
| 7B | ~8G |
| 14B | ~20G |
| 13B | ~16G |

### 数据集下载（ModelScope）

```python
import os
os.environ['MODELSCOPE_CACHE'] = '/path/to/cache'

from modelscope.msdatasets import MsDataset
ds = MsDataset.load('spider', subset_name='default', split='train')
```

### 微调流程

1. 在 WebUI 中选择模型 → 选择数据集 → 预览数据格式（ALPACA 或 ShareGPT）
2. 设置学习率、LoRA 层、训练轮次
3. 点击生成配置文件（`.yaml`）
4. 开始训练 → 查看训练曲线
5. 保存配置文件，下次直接加载

### 命令行推理与合并

```bash
# 推理
llamafactory-cli chat --config my_config.yaml

# 合并 LoRA 权重
llamafactory-cli export --config my_config.yaml
```

---

## 微调效果的现实评估

| 指标 | 数值 |
|------|------|
| 微调前基线（CodeLlama, Spider）| ~67% |
| 微调后（Spider, DB-GPT-Hub）| ~78.9% |
| 实际生产可用性 | 存疑：涉及多表联合查询时仍不可靠 |

**关键结论**：78.9% 的准确率意味着约每 5 条 SQL 就有 1 条出错，**对于生产数据库操作来说是不可接受的**，尤其是涉及写操作时会造成数据错误。

微调方案最适用的场景：
- 简单查询 + 常见聚合（AI 取数）
- 用户频繁问的重复性问题

---

## AI 取数场景的适用逻辑

最适合 NL2SQL 落地的场景是「AI 取数」：

**为什么 AI 取数准确率高？**
1. 问的问题是经常被问的（周报、月报数据、产品指标等）
2. 一旦某次 SQL 被用户确认正确，就回流向量数据库
3. 下次相同或相似问题，直接从向量库检索，大模型参考成功案例生成

**数据飞轮**：用户确认 → SQL 入向量库 → 相似问题命中率上升 → 准确率持续提高

**不适合 AI 取数的场景**：
- 用户问的是从未被问过的陌生查询
- 涉及多表联合查询且没有历史参考
- 用户描述过于模糊（超过追问成本时，不如人工写 SQL）

---

## 微调 vs RAG 的选择

| 维度 | 微调 | RAG |
|------|------|-----|
| 可解释性 | 低（黑盒） | 高（白盒，可追溯检索结果） |
| 更新成本 | 高（重新训练，小时级别） | 低（更新向量库即可） |
| 硬件需求 | 高（GPU，训练资源） | 低（推理即可） |
| 业界趋势 | 逐渐减少 | 主流方向 |
| 未来替代 | 可能被强化学习替代 | 持续优化 |

**当前建议**：优先考虑 RAG（Vanna）方式，微调作为补充。若必须微调，先用 DB-GPT-Hub + Spider 数据集跑通流程，再换数据集和模型。

---

## 拓展项目建议

基于本讲内容，以下是适合练手或毕设的项目方向：

1. **基于 LangGraph 改造 Vanna**：用 LangGraph 框架重构 Vanna 逻辑，前端保留原样，形成自己的 AI 取数工具
2. **基于 LlamaIndex + 公开数据库**：用 LlamaIndex 套用 RAG 逻辑，加上前端界面，做某个垂直行业（金融、医疗）的 AI 取数方案
3. **行业专项数据集微调**：针对特定行业（客户所在行业）自建数据集，微调模型后评估效果

---

## Connections
- → [[059-nl2sql-deep-dive-1]]
- → [[061-text2sql-security]]
