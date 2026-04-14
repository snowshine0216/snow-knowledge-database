---
tags: [ai-ethics, data-compliance, governance, privacy, fairness, security, llm]
source: https://u.geekbang.org/lesson/818?article=930880
---

# AI Ethics, Data Compliance, and Governance

AI 产品的"生命线"——在法律、技术与社会三个维度上持续运营 AI 系统，核心涵盖公平性、隐私保护、安全防御与合规治理。

## Core Concepts

### Fairness and Bias
历史数据中的偏差会被模型学习并放大，典型场景：
- 贷款/简历审核中对特定性别、族裔的系统性歧视
- 缺失代表性样本导致特定群体评分偏低（如个人创业经历）

量化方案：设置保护群体通过率阈值（如低于 0.28 触发告警），驱动人工复核。

### Privacy Protection Pipeline
PII / PHI 的管道式脱敏是目前唯一成熟方案：

```
用户输入 → 实体识别（姓名/电话/身份证/医疗记录）→ 替换/遮蔽 → 传入大模型
```

性能瓶颈通过 GPU 并行多管道解决。数据不足时引入合成数据（Faker 库 / 生成模型）补充，尤其适用于医疗场景。

### Differential Privacy
在训练数据中加入可量化噪音，防止单条记录被逆向还原。代表工具：TensorFlow Privacy。核心权衡：噪音多 → 准确度下降；噪音少 → 隐私保护不足，需结合业务场景确定 ε 值。

### Federated Learning & Homomorphic Encryption
数据不能离开本地时的方案：
- **联邦学习**：各边缘节点本地训练，仅上传梯度到中央聚合服务器
- **同态加密**：在加密状态下计算，聚合方无法看到明文

当前工程难度极高，主要挑战在通信效率和端到端加密。

### Model Risk Management (MRM)
持续监控三类信号：
- **数据漂移**：输入分布偏移
- **概念漂移**：标签分布偏移
- **异常值**：极端输入可能是攻击信号

### Explainability (Prompt-based)
满足 GDPR 解释权等监管要求的工程实践：

```
请用50字以内解释为什么拒绝这笔贷款申请，并引用检索到的三个关键事实。
```

决策 + 可追溯事实 → 写入日志 → 供监管机构审查。推理模型可直接暴露推理链条进一步增强可解释性。

### Machine Unlearning (Right to Be Forgotten)
用户行使被遗忘权时，需从知识库删除对应数据，且不得影响模型对其他数据的表现。目前业界无成熟方案。

### Security Defense
提示词注入攻击的演进与应对：

| 阶段 | 攻击手法 | 防御 |
|------|----------|------|
| 初代 | 直接注入指令 | 关键词过滤 |
| 进化 | Base64 编码绕过 | 关键词过滤失效 |
| 当前 | 逻辑漏洞利用 | 安全小模型（Guard Model）|

**安全小模型**：在主 Agent 前部署，实时审查输入/输出是否符合安全规范，是当前最佳实践。

### Continuous Governance Framework
AI Dashboard 持续监测：安全注入率、输出概率分布、决策溯源查询。**模型卡片（Model Card）**记录训练数据概况、预期用途、已知风险与限制。

## Key Principles

1. 数据既是训练原料，也可能是法律负债
2. 隐私保护需覆盖完整数据生命周期，而非一次性操作
3. 合规工具不只是高端技术——提示词工程可直接满足大量监管需求
4. AI 工程师核心竞争力：产品思维 + 工程化能力 + 数据治理 + 合规水平

## Related Notes
- [[097-vertical-domain-deep-water-2]] — 垂直领域深水区系列前篇
