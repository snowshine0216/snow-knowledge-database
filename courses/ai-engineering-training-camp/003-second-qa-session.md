---
tags: [fine-tuning, lora, intent-recognition, latency, langchain, observability, langchain-migration, agent]
source: https://u.geekbang.org/lesson/818?article=939542
wiki: wiki/concepts/003-second-qa-session.md
---

# 003: 第二次直播答疑

**Source:** [AI 工程化训练营 第二次直播答疑](https://u.geekbang.org/lesson/818?article=939542)

## Outline
- [LoRA 微调数据集要求](#lora-微调数据集要求)
- [意图识别延迟分析](#意图识别延迟分析)
- [可观测性与调优策略](#可观测性与调优策略)
- [LoRA 训练步数与早停法](#lora-训练步数与早停法)
- [LangChain 版本迁移：0.x → 1.0](#langchain-版本迁移0x--10)
- [编程语言选择：Java / TypeScript vs Python](#编程语言选择java--typescript-vs-python)

---

## LoRA 微调数据集要求

微调意图识别模型时，数据集质量直接决定最终效果。**单类别数据量**建议达到 1000 条以上；若存在多个类别（如四个意图类），每个类别应尽量保持在 500 条左右，避免模型向多数类偏移。若真实数据分布极度不均，可通过加权损失函数缓解——实质上相当于让少数类样本重复训练多次。

数据质量方面有三个关键要素。第一，**意图覆盖多样性**：同一意图下应包含同义词、口语表达、错别字、缩写等多样化写法。例如"查订单"这一意图，语料中应同时包含"我的订单在哪""帮我查订单""帮我看看我的订单""1234567 到了没"等表达，否则模型泛化能力不足。第二，**贴近真实场景**：训练数据应接近用户真实输入的口语状态，而非书面整理版本，否则会导致真实场景分类准确率下降。第三，**用户信息脱敏**：上线前必须对训练数据中的用户身份信息、真实对话内容做脱敏处理，防止个人隐私泄露。

---

## 意图识别延迟分析

当工作流由意图识别（提示词方式）+ 大模型调用两个步骤串联时，端到端延迟 2～3 秒属于正常范围。以 Qwen3-Max 为例，其 token 输出速率约为 30～100 tokens/秒，延迟来源可分解如下：

- **网络往返（RTT）**：50～200 ms
- **模型排队（高峰期）**：100～800 ms
- **意图识别阶段**：提示词通常超过 100 tokens，在 30～100 tokens/s 的输出速率下约消耗 1 秒
- **工作流大模型调用**：若提示词超过 200 tokens，约再消耗 2 秒
- **TTFT（首字节延迟，Time to First Token）**：额外感知延迟，并非线性 token 计算的一部分

微调方式比提示词方式快，原因在于微调后每次请求不需要携带系统提示词，而提示词方式每次都将系统提示和用户问题一并送入模型，输入 token 越多、上下文历史越长，响应越慢。若提示词仅几十个 token 且业务可接受，推荐优先使用提示词方式——白盒、易迭代，出问题直接改提示词即可。

---

## 可观测性与调优策略

仅凭 Postman 观察请求只能看到"进"和"出"，无法定位卡点。建议接入 **LangSmith**（LangChain 官方维护版，含企业授权）或 **LangFuse**（完全开源）进行链路追踪，可清晰看到每个节点的耗时分布。若不使用 LangChain 框架，最简单的方法是在代码中逐节点打印日志。

定位卡点后的调优方向：

1. **关闭不必要的深度思考（Thinking/Sync）**：Qwen3 和 Claude 默认开启思考模式，即使在系统提示词中加 `no-sync` 也不一定生效。Qwen 系列必须在模型配置参数中将思考方式设为 `force: "disabled"`；Claude 系列通过 API 参数 `enable_thinking: false` 控制。对于意图识别等简单分类任务，思考模式是不必要的开销。

2. **缩短工作流提示词**：上下文越长，输出越慢，应精简提示词、减少冗余说明。

3. **串行改并行**：梳理工作流中哪些节点存在数据依赖、哪些可以并发执行，将串行调用改为并行可显著降低总延迟。

4. **合并大模型调用次数**：若条件允许，将意图识别与回答合并为一次大模型调用，或用正则/NLP 规则代替意图识别，仅保留一次大模型调用，是降延迟最有效的手段。

5. **使用更小的意图识别模型**：意图识别属于简单分类任务，3B～4B 规模的模型已足够，不要使用最新最大的模型。0.5B 以下模型分类效果差，同样不可用。工作流后续的业务理解环节则应使用能力更强的模型（如 Qwen3-Plus/Max）。

---

## LoRA 训练步数与早停法

训练步数没有固定公式，核心方法是**早停法（Early Stopping）**：每隔 50～100 步在验证集上评估 F1，若连续 2～3 次不再提升则立即停止，以防过拟合。数据集按 80/20 划分训练集和验证集。

在跑全量数据前，建议先做**小规模实验**：取 10% 数据跑 100 步，观察 loss 曲线下降趋势。若 loss 在第 50 步左右就几乎不变，说明全量训练时步数应相应放大；若训练 loss 持续下降而验证 loss 上升，则为过拟合（步数过多）；若训练 loss 完全不下降，通常是学习率过低或数据质量有问题。初始 epoch（一炮齿）建议设为 3，不确定参数时可参考云平台（如阿里云百炼）的 SFT LoRA 默认值作为起点，再根据实验结果逐步调整。

微调本质上是黑盒调参——没有一套能预测结果的方程式，而是多次实验→观察结果→反推问题→调整参数的迭代过程。

---

## LangChain 版本迁移：0.x → 1.0

LangChain 生态的版本关系较为复杂。旧版本（0.2/0.3）的 `langchain` 库与新版 1.0 不兼容，但 **langchain-classic** 保留了旧版 API，可在 1.0 环境中继续使用：

```
# 旧版导入方式
from langchain.retrievers import ...

# 1.0 兼容方式
from langchain.classic.retrievers import ...
```

架构演进关系：**LangChain 0.x + LangGraph 0.x** → **LangChain 1.0**（基于 LangGraph 0.x 重构）→ **LangGraph 1.0** → **LangGraph Agents（deep agents）**（更高层抽象）。选型建议如下：

- 需要开发一次性 Agent（智能体）→ LangChain 1.0
- 需要开发复杂工作流 → LangGraph 1.0
- 需要更高层抽象、仅靠提示词驱动 → LangGraph Agents / deep agents

迁移细节可查阅官方文档的 **Changelog → 1.0.0** 节，其中包含 LangChain 迁移指南和 LangGraph 迁移指南。旧版中广泛使用的 `create_react_agent` 预构建 Agent 在 1.0 中已移至 `langchain.agents`，需注意导入路径变更。

---

## 编程语言选择：Java / TypeScript vs Python

LangChain 框架的核心抽象（Agent、Module、Message、Tool、Short-term Memory Stream）在 Python、TypeScript 和 Java 版本中是完全一致的，因此学习 Python 版本的概念可以直接迁移。Java 开发者可使用 **LangChain4j** 或 **Spring AI**，它们的组件（memory、model params、tool、agent）与 Python 版本一一对应。现有 Java 积累无需抛弃，核心是理解框架的拆解方式和业务对接模式，而非纠结编程语言本身。
