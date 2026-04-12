---
tags: [fine-tuning, data-engineering, docker, dvc, tokenizer, environment-management, production, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927433
---

# 微调工程准备与数据工程基础

模块二开篇：从工程化视角梳理微调/量化/蒸馏的本质区别，聚焦上线前"保命三件事"——Docker 环境一致性、Tokenizer 一致性验证、DVC 数据版本控制——并介绍用工程免疫报告在部署前自动化验证。

## Key Concepts

- **微调 vs 量化 vs 蒸馏**：微调调参数行为；量化降参数精度（缩体积加速推理）；蒸馏将大模型知识迁移到小模型。三者操作对象不同，不可混淆。
- **微调后效果变差是常态**：关键在于建立快速定位机制——环境问题、Tokenizer 问题、数据集变化是三大根因。
- **保命三件事**：(1) Docker 锁死 Python 版本和依赖，保证任何机器 100% 复现；(2) 验证 Tokenizer 一致性（BPE 用于 GPT 系列，WordPiece 用于 BERT 系列，混用导致模型表现断崖）；(3) DVC 给数据集打版本指纹，防止数据工程师"顺手更新"破坏实验复现性。
- **DVC（Data Version Control）**：数据的 Git，`dvc add` → `git commit` → `dvc push`，用 MD5/SHA 指纹确保不同环境数据完全相同。
- **工程免疫报告**：上线前自动化脚本验证三件事全部通过（`docker build` 成功 + tokenizer 输出一致 + 数据指纹匹配），通过才允许部署。
- **数据版本冻结原则**：微调工程师需要固定数据版本（单变量原则），而数据工程师默认追求实时性——这是团队协作中的认知冲突，DVC 是唯一出路。

## Key Takeaways

- Tokenizer 错配是"隐形炸弹"：训练和推理必须用同一个 tokenizer，BPE/WordPiece 混用后损失难以追踪
- 环境问题 > 算法问题：大量"模型效果差"的根因是非技术的环境/数据问题
- DVC 对团队微调是基础设施，不是可选项——没有它就无法复现实验
- 工程免疫报告写成自动化脚本，而非人工 checklist

## See Also

- [[013-multi-agent-finetuning-deployment]]
