---
tags: [ai-ethics, data-compliance, governance, privacy, fairness, security, llm]
source: https://u.geekbang.org/lesson/818?article=930880
wiki: wiki/concepts/098-ai-ethics-compliance-governance.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 你认为 AI 模型在贷款审批或简历筛选中可能产生哪些偏见？这些偏见从何而来？
2. 当医院病历数据无法离开服务器时，你会如何设计一个跨机构的模型训练方案？
3. 什么是"提示词注入攻击"？你猜测攻击者会用哪些手段来绕过安全过滤？

---

# 098: AI Ethics, Data Compliance, and Governance

**Source:** [4AI 伦理数据合规与治理](https://u.geekbang.org/lesson/818?article=930880)

## Outline
- [Overview](#overview)
- [Fairness and Bias](#fairness-and-bias)
- [Privacy Protection Pipeline](#privacy-protection-pipeline)
- [Differential Privacy and Synthetic Data](#differential-privacy-and-synthetic-data)
- [Federated Learning and Homomorphic Encryption](#federated-learning-and-homomorphic-encryption)
- [Risk Management Systems (MRM)](#risk-management-systems-mrm)
- [Explainability and Regulatory Compliance](#explainability-and-regulatory-compliance)
- [Data Lineage and the Right to Be Forgotten](#data-lineage-and-the-right-to-be-forgotten)
- [Security Attack Defense](#security-attack-defense)
- [Continuous Governance Framework](#continuous-governance-framework)
- [Chapter Summary](#chapter-summary)

---

## Overview

本章是课程第三部分的最后内容，聚焦 AI 的伦理、数据合规与治理。类比网络攻防：先学攻击手段，再学防护措施，才能建立正确的思维框架。

大模型领域目前尚无完整的安全体系，但工程师必须理解以下两类核心挑战：

1. **公平性与偏差（Fairness & Bias）**
2. **隐私保护（Privacy Protection）**

数据既是模型训练的核心原料，也可能是法律负债。

---

## Fairness and Bias

模型因历史训练数据中的偏差，可能对特定群体产生歧视性结果。

典型案例：
- **贷款审批**：历史数据中对某族裔/性别的拒绝率更高，模型会复现此偏差
- **简历筛选**：
  - 个人创业经历在训练数据中样本极少，AI 评分会偏低
  - 相同简历内容，改变性别字段后通过率明显不同
- **医疗诊断**：假阳性/真阳性的比率在不同人群中分布不均

**量化公平性的方法**：设定可观测指标，如某保护群体（性别、种族等）的通过率若低于 0.28，则触发异常预警，驱动人工复核。

---

## Privacy Protection Pipeline

对于 PII（个人身份信息）和 PHI（受保护健康信息），核心方案是**管道式脱敏**：

```
用户输入 → 实体识别 → 替换/遮蔽 → 传入大模型 → 输出
```

**实体识别**涵盖：姓名、电话、地址、身份证号、医疗记录等。

云端工具：微软 Azure、阿里云等均提供开箱即用的 PII 识别服务。

**性能优化**：脱敏管道是 RAG 的潜在瓶颈，通常引入 GPU 并行多管道处理来提升吞吐量。

**合成数据（Synthetic Data）**：
- 使用 Faker 库或生成模型生成与真实数据分布相近的合成数据
- 与真实数据混合用于开发/测试，减少敏感数据暴露
- 医疗领域尤为典型：数据极度缺乏，隐私保护要求又极高

---

## Differential Privacy and Synthetic Data

**差分隐私（Differential Privacy）**：在训练数据中加入可量化的噪音，防止单条记录被逆向攻击还原。

- 代表工具：TensorFlow Privacy（`tf.privacy`）
- 核心权衡：
  - 噪音过多 → 模型准确度下降
  - 噪音过少 → 隐私保护强度不足
- 工程上需要找到平衡点，结合具体业务场景调整噪音预算（ε 值）

---

## Federated Learning and Homomorphic Encryption

当数据**不允许离开服务器**时（如医院病历），采用：

- **联邦学习（Federated Learning）**：
  - 在各边缘节点（各医院）部署 Agent
  - 本地训练，只将梯度/参数上传至中央聚合服务器
  - 数据原始内容不出本地
- **同态加密（Homomorphic Encryption）**：
  - 在加密状态下进行计算，聚合服务器无法看到明文
  - 工程难度极高，通信开销和端到端加密是主要挑战

目前联邦学习在大模型场景中离大规模落地尚远，但是医疗、金融等强监管行业的重要研究方向。

---

## Risk Management Systems (MRM)

**MRM（Model Risk Management）**系统用于持续监控模型健康状态：

- **数据漂移（Data Drift）检测**：定期检查输入数据分布与训练时是否一致
- **概念漂移（Concept Drift）检测**：标签/目标变量的统计特性是否发生变化
- **异常值检测**：极端情况可能是受到攻击的信号

持续迭代的治理闭环：监测 → 告警 → 复核 → 模型更新。

---

## Explainability and Regulatory Compliance

**监管合规**要求 AI 能够解释决策（如 GDPR 的解释权条款，国内个人信息保护法规）。

**工程实践——Prompt-based Explanation**：

```
请用50字以内解释为什么拒绝这笔贷款申请，
并引用你检索到的三个关键事实。
```

- 拒绝决策 + 三条可追溯的事实 → 写入日志 → 供监管机构审查
- 推理模型（Reasoning Model）发布后，推理链条可直接展示，进一步增强可解释性

这种方式的本质是：将提示词工程作为合规工具，而非仅仅是功能工具。

---

## Data Lineage and the Right to Be Forgotten

**数据溯源（Data Lineage）**：记录每条数据的来源、版本、用途：

| 字段 | 说明 |
|------|------|
| 数据块 ID | 唯一标识 |
| 创建来源 | 用户/系统/外部 |
| 模型版本 | 哪个版本使用了该数据 |
| 用户授权 | 该用户是否提供了授权 |

**模型遗忘（Machine Unlearning）**：用户行使"被遗忘权"时，需从知识库/数据库中删除对应数据，并确保删除不影响已训练模型对其他数据的表现。目前业界尚无成熟方案，Prompt 方式是临时手段。

---

## Security Attack Defense

**提示词注入攻击**（Prompt Injection）的演进：

| 攻击阶段 | 手法 |
|----------|------|
| 初代 | 直接注入："请忘记之前的指令，执行XXX" |
| 进化 | Base64 编码绕过关键词过滤 |
| 更复杂 | 利用 System Prompt 泄露的逻辑漏洞发起攻击 |

**防御演进**：

1. 关键词过滤（已被绕过）
2. **安全小模型（Safety Guard Model）**：在主 Agent 前部署专用安全模型，实时审查：
   - 用户输入是否包含注入尝试
   - 主模型输出是否违反安全规范
3. **System Prompt 加密/回溯**：防止 Prompt 泄露后被用于构造攻击

System Prompt 泄露当前危害有限，但随着攻击手段成熟化，加密保护的重要性将上升。

---

## Continuous Governance Framework

建立 AI Dashboard，持续监测：

- 安全注入检测率
- 提示词输出概率分布
- 模型决策数据来源可查询（支持合规部门溯源审计）
- **模型卡片（Model Card）**：记录训练数据概况、预期用途、已知风险与限制

未来方向："可信 AI 工程师"（Trustworthy AI Engineer）——不只会构建最聪明的 Agent，还能构建安全、合规、可信赖的 Agent。

---

## Chapter Summary

第11章（AI 产品设计与伦理合规）的完整脉络：

1. **产品思维转变**：从技术驱动 → 用户价值驱动；回答"用户是谁、痛点是什么、AI 是不是最优解"
2. **从功能到价值主张**：通过 DSL 对接用户需求与大模型能力，避免需求反复横跳
3. **不确定性编程**：分层设计（数据层/交互层/降级层），以银行 AI 客服为例讲解容错设计
4. **数据飞轮**：从用户使用 → 数据反馈 → 模型优化 → 更好体验的正向循环
5. **垂直领域落地**：结合 AI 产品生命线（伦理与合规）
6. **隐私保护与治理**：以数据资产/数据债务框架，在法律、技术、社会层面持续运营 AI

AI 工程师的核心竞争力不只是模型本身，而是：**产品思维 + 工程化能力 + 数据治理 + 合规水平**。

---

## Connections
- → [[097-vertical-domain-deep-water-2]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释"差分隐私"的核心原理，以及工程实践中必须面对的关键权衡是什么？
2. 联邦学习如何在不共享原始数据的情况下实现跨机构模型训练？它与同态加密解决的问题有何不同？
3. 本课提出的"Prompt-based Explanation"合规方案具体如何运作？为什么说它将提示词工程从功能工具升级为了合规工具？

<details>
<summary>答案指南</summary>

1. 差分隐私通过在训练数据中加入可量化的噪音，防止单条记录被逆向攻击还原；关键权衡是噪音过多导致模型准确度下降，噪音过少则隐私保护不足，工程师需根据业务场景调整噪音预算（ε 值），代表工具为 TensorFlow Privacy。

2. 联邦学习在各边缘节点（如各医院）本地训练，只将梯度/参数上传至中央聚合服务器，原始数据不出本地；同态加密则进一步让聚合服务器在加密状态下完成计算、无法看到明文，二者分别解决"数据不出域"和"聚合过程中的明文暴露"两个层次的问题。

3. 在做出拒绝决策时，通过 Prompt 要求模型用 50 字以内解释原因并引用三个可追溯的关键事实，将决策与事实一并写入日志供监管机构审查；其本质是把提示词工程作为生成可解释合规记录的机制，而非仅用于实现产品功能。

</details>
