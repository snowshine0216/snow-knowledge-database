---
tags: [fine-tuning, data-engineering, docker, dvc, tokenizer, environment-management, production, ai-engineering, lora]
source: https://u.geekbang.org/lesson/818?article=927433
wiki: wiki/concepts/016-engineering-prep-and-data-engineering.md
---

# 016: 工程准备与数据工程基础（模块二）

**Source:** [AI 工程化训练营 模块二 1 工程准备与数据工程基础](https://u.geekbang.org/lesson/818?article=927433)

## Outline
- [模块二定位：理论 + 工程](#模块二定位理论--工程)
- [微调 / 量化 / 蒸馏的本质区别](#微调--量化--蒸馏的本质区别)
- [微调工程化的全流程视角](#微调工程化的全流程视角)
- [保命三件事（工程环境准备）](#保命三件事工程环境准备)
- [工程免疫报告](#工程免疫报告)
- [数据工程基础](#数据工程基础)
- [Key Takeaways](#key-takeaways)

---

## 模块二定位：理论 + 工程

模块二是整个课程中理论密度最高的章节，覆盖：
- NLP 基础概念（复习）
- Transformer 模型结构
- LoRA 数学原理（矩阵分解）
- 模型评估与上线决策
- 模型压缩与部署

**工程化视角的特点**：不深入暂时用不到的科研细节（例如各种 tokenizer 变体的论文来源），而是聚焦"掌握这个能让我少踩哪些坑"。

---

## 微调 / 量化 / 蒸馏的本质区别

这三个概念经常被混淆，根本原因是对它们各自的工作原理不清楚：

| 概念 | 本质操作 | 一句话总结 |
|------|---------|-----------|
| **微调（Fine-tuning）** | 调整模型的**部分参数** | 改变模型的行为方式 |
| **量化（Quantization）** | 降低模型参数的**精度**（如 FP32→INT8） | 缩小模型体积、加快推理，精度略降 |
| **蒸馏（Distillation）** | 让小模型（学生）**模仿**大模型（教师）的输出 | 迁移大模型的"知识"到小模型 |

**记忆口诀**：微调改行为、量化改精度、蒸馏传知识。

---

## 微调工程化的全流程视角

很多人对微调的认知停在"跑起来就行"：

```
❌ 只关注：数据准备 → 跑 LoRA 工具 → 合并模型 → 部署
✅ 完整视角：
   环境一致性 → 数据版本控制 → 微调训练 → 模型评估 → 上线决策 → 部署压缩
```

**"微调后比调之前还差"是常态**——这不是失败，是微调的正常现象。真正的挑战在于：
1. 如何快速定位问题（工程环境/数据/超参数）
2. 如何建立反馈渠道（用户反馈 → 问题追踪 → 迭代改进）

---

## 保命三件事（工程环境准备）

在工程化微调项目中，以下三个非技术问题是最常见的上线灾难来源：

### 第一件：环境一致性 → Docker

**问题**：我本机能跑，同事/生产环境跑不通（Python 3.8 → 3.10 版本差异、依赖版本冲突）。

**解决方案**：用 Docker 锁死环境。

```dockerfile
# Dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

CMD ["python", "main.py"]
```

```bash
# 所有人统一用这个命令构建
docker build -t finetune-project .
docker run --gpus all finetune-project
```

**验证原则**：`docker build` 成功 → 环境一致；失败 → 环境有问题，**先解决环境再谈微调效果**。

### 第二件：Tokenizer 一致性

**问题**：训练时用了 A 分词器，推理时用了 B 分词器 → 模型表现断崖式下滑。

**常见陷阱**：

| 模型系列 | Tokenizer 类型 | 误用后果 |
|---------|---------------|---------|
| GPT 系列（GPT-2/3/4） | **BPE**（Byte Pair Encoding）| 用了 WordPiece → Token 数量暴增，成本飙升 |
| BERT 系列 | **WordPiece** | 用了 BPE → 语义切分不同，模型表现异常 |

**验证脚本**：

```python
# 验证训练环境和推理环境的 tokenizer 产出相同的 token
from transformers import AutoTokenizer

test_text = "捞子要退票"  # 方言测试样本
tokenizer = AutoTokenizer.from_pretrained("model_path")
tokens = tokenizer.encode(test_text)
print(f"Token IDs: {tokens}")  # 两个环境必须输出相同结果
```

### 第三件：数据集版本控制（DVC）

**问题**：数据工程师"顺手更新"了数据库，导致同一份代码在测试环境和生产环境表现不一致（"模型明明跑好了，上线就变差了"）。

**核心认知冲突**：
- 数据工程师视角：数据要**实时最新**
- 微调工程师视角：训练/测试/生产必须用**同一份数据**，只有一个变量

**解决方案：DVC（Data Version Control）**

DVC 是数据领域的 Git——用 Git 管代码，用 DVC 管数据：

```bash
# 安装
pip install dvc

# 将数据集纳入 DVC 管理
dvc add data/train.jsonl
git add data/train.jsonl.dvc .gitignore
git commit -m "Add training dataset"

# 推送数据到远程存储
dvc push

# 其他人/环境拉取同一份数据
git pull
dvc pull
```

**数据指纹验证**：

```bash
# MD5 指纹，确保不同环境数据完全相同
md5sum data/train.jsonl
# 训练环境输出：abc123... 
# 生产环境必须也是：abc123...
```

---

## 工程免疫报告

在微调模型上线前，用脚本自动生成"工程免疫报告"，验证三件事全部通过：

```python
# immune_check.py
import subprocess, hashlib, os

def check_environment():
    """验证 Docker 构建成功"""
    result = subprocess.run(["docker", "build", "-t", "finetune-test", "."],
                            capture_output=True)
    return result.returncode == 0

def check_tokenizer(model_path: str, test_text: str = "捞子要退票") -> bool:
    """验证 tokenizer 与训练时一致"""
    from transformers import AutoTokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    tokens = tokenizer.encode(test_text)
    expected = [1, 13297, 99, ...]  # 训练时记录的标准 token IDs
    return tokens == expected

def check_data_fingerprint(data_path: str, expected_md5: str) -> bool:
    """验证数据集未被篡改"""
    with open(data_path, "rb") as f:
        actual_md5 = hashlib.md5(f.read()).hexdigest()
    return actual_md5 == expected_md5

# 全部通过才允许上线
assert check_environment(), "❌ 环境不一致"
assert check_tokenizer("./model"), "❌ Tokenizer 不一致"
assert check_data_fingerprint("data/train.jsonl", "abc123..."), "❌ 数据集被修改"
print("✅ 工程免疫报告通过，允许上线")
```

---

## 数据工程基础

### 数据质量检查

在开始微调前，先做基本数据健康检查：

```python
import json

def check_data_quality(data_path: str):
    issues = []
    with open(data_path) as f:
        for i, line in enumerate(f):
            sample = json.loads(line)
            # 检查空文本
            if not sample.get("input", "").strip():
                issues.append(f"Line {i}: 空 input")
            # 检查空标签
            if not sample.get("output", "").strip():
                issues.append(f"Line {i}: 空 output")
    # 检查样本量
    if i < 100:
        issues.append(f"样本量不足：{i} 条（建议至少 100 条）")
    return issues
```

### DVC 工作流（团队协作）

```
原始数据（.jsonl）
    ↓ dvc add
DVC 管理（.jsonl.dvc 追踪文件）
    ↓ git commit
Git 版本化（代码 + 数据引用）
    ↓ dvc push / git push
远程存储（S3/OSS） + 代码仓库
    ↓ git pull + dvc pull
任何成员/环境还原完全相同的数据
```

**对数据变更的正确态度**：
- 需要更新数据 → 创建新的数据版本（`v2`），不覆盖旧版本
- 旧的实验/测试结果永远可以用旧版本数据复现
- 如果怀疑模型效果变差是因为数据变了 → `git log` + `dvc checkout` 一键还原

---

## Key Takeaways

- **微调 ≠ 量化 ≠ 蒸馏**：三者操作对象不同，搞清楚原理才不会踩概念坑
- **"微调后效果更差"是常态**，关键是建立快速定位和迭代的能力
- **保命三件事**：Docker 锁环境 + 验证 Tokenizer 一致性 + DVC 管数据——哪件没做，上线就有大概率出问题
- **Tokenizer 错配是隐形炸弹**：BPE（GPT 系列）vs WordPiece（BERT 系列）不可混用，训练和推理必须用同一个
- **DVC = 数据的 Git**：数据工程师的"及时更新"和微调工程师的"版本冻结"是认知冲突，DVC 是唯一出路
- **工程免疫报告**：上线前自动化验证三件事，写成脚本而非人工检查

---

## Connections

- → [[013-multi-agent-finetuning-deployment]]（LoRA 原理、微调目的，本讲的理论背景）
- → 016 下半部分：Tokenizer 深解与 LoRA 超参数（下周三继续）
- → 模块二后续：模型评估、压缩与部署

---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 微调（Fine-tuning）、量化（Quantization）、蒸馏（Distillation）三者的本质操作分别是什么？你能用一句话区分它们吗？
2. 在多人协作的 AI 工程项目中，"我本机能跑，但同事/生产环境跑不通"是哪类问题？你认为最常见的根因是什么？
3. GPT 系列模型使用 BPE 分词，BERT 系列使用 WordPiece 分词。如果训练时用了其中一种，推理时换成另一种，你预测会发生什么？

---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释"保命三件事"——Docker、Tokenizer 一致性验证、DVC——各自针对的是什么工程风险，为什么缺一不可？
2. 课程说"微调后效果比调之前还差是常态"。请解释这句话的深层含义，以及微调工程师应如何建立快速定位和迭代的能力？
3. DVC 被称为"数据的 Git"。请解释数据工程师与微调工程师在数据更新上存在的"认知冲突"是什么，DVC 的工作流如何化解这个冲突？

<details>
<summary>答案指南</summary>

1. Docker 解决环境不一致（Python 版本/依赖冲突），用 `docker build` 锁死运行环境；Tokenizer 一致性验证确保训练和推理使用同一个分词器（BPE/WordPiece 错配会导致模型表现断崖式下滑）；DVC 保证不同环境使用完全相同的数据集（用 MD5 指纹验证），防止数据被"顺手更新"后无法复现训练结果。三件事任何一件缺失，上线都有大概率出问题。
2. 微调是在有限数据上调整部分参数，容易过拟合或破坏原有泛化能力，因此效果退步是正常现象而非失败信号。真正的挑战在于：建立快速定位问题（工程环境/数据/超参数）的能力，以及通过用户反馈→问题追踪→迭代改进的反馈渠道持续优化，而不是把"跑起来"当作终点。
3. 数据工程师认为数据应"实时最新"，而微调工程师要求训练/测试/生产必须使用同一份数据（只有一个变量）。DVC 通过 `dvc add` 将数据纳入版本管理、`dvc push/pull` 同步到远程存储，使任何成员都能用 `git pull + dvc pull` 还原完全相同的数据；需要更新数据时创建新版本而非覆盖，旧实验永远可用 `dvc checkout` 一键复现。

</details>
