---
tags: [ai-product, product-thinking, ux, error-tolerance, data-flywheel, cost-optimization, dsl, requirements-engineering]
source: https://u.geekbang.org/lesson/818?article=930877
---

# AI Product: From Functional to Actually Good

AI 产品从"能用"到"好用"的跨越，核心在于三次思维转变：从技术思维到产品思维、从确定性设计到容错设计、从一次性功能交付到数据飞轮驱动的持续优化。

## The Shell-Wrapping Trap

把 GPT API 套一层 UI 是 demo，不是产品。真正的产品思维是**价值主张**：用户想完成什么任务，AI 能否精准匹配这个任务。

衡量标准：
- 用户是谁（小白 vs 专业用户）
- 痛点是否足够痛（有它更好 vs 没它不行）
- AI 是否是最优解（规则引擎有时更便宜、更稳定）

## DSL as Requirements Anchor

使用可视化工作流（DSL，如 Dify 工作流）作为需求锚点：

- 业务方能看懂并确认逻辑
- 工程师可直接转化为状态机或规则引擎代码
- 需求变更只改 DSL 版本，不动核心代码
- 配合 Git 版本管理，让业务方在 DSL 上试错

> MVP 原则：先用 DSL 交付可视化工作流让用户确认价值，验证后再写代码。

## Designing for Probability

AI 产品的本质是概率系统，不是确定性系统。

**三层容错框架**：

### 1. 数据层 — 置信度字段

每次 AI 返回结果同时返回：
- `confidence`：0–1 置信度（来自模型对数概率或外部评估模型）
- `evidence`：支持结论的文档来源片段
- `error_code`：超时和异常信息

### 2. 交互层 — 用户感知边界

| 置信度区间 | 交互设计 |
|------------|----------|
| > 0.8 | 直接显示结果 |
| 0.5–0.8 | "仅供参考，请以官方规定为准" |
| < 0.5 | 触发人工介入或多路召回 |

其他模式：多路召回（一次生成 4 张图供用户选择）、允许用户修正、显示参考来源。

### 3. 架构层 — 降级预案

1. **静态资源降级**：API 不可用时返回预设模板或缓存答案
2. **规则引擎降级**：置信度过低时切换 if-else 规则回答
3. **混合模式降级**：小模型先出草稿，大模型异步优化后动态更新（WebSocket/轮询）

## Cost Economics

AI 项目失败的首因往往是成本核算过不了关。

**成本三问**：
1. 单次调用多少钱？
2. 用户使用频率如何？
3. 定价能否覆盖成本？

**优化路径**：
- 用户分层：免费用户用小模型（Llama 3），付费用户用 GPT-4/Claude 3
- 问题分层：简单问题走规则引擎，复杂问题才调大模型
- 模型蒸馏：用大模型标注数据微调小模型，成本可降 10 倍

## Data Flywheel

**隐式反馈钩子**收集用户行为而无需用户主动点赞：

- 正向：复制答案、分享答案、停留 >30 秒
- 负向：点击重新生成、手动修改回答、生成中关闭页面

**飞轮循环**：用户行为数据 → 微调/更新知识库 → 产品体验提升 → 用户口碑传播 → 新用户增长

**RAG 优化**：用用户点击行为动态调整文档相关性分数；优先检索用户手动上传的文档。

**护城河本质**：模型可以复制，但业务场景积累的数据飞轮无法复制。

## Related Sources

- [[courses/ai-engineering-training-camp/095-ai-product-from-functional-to-good]] — 完整课程笔记
- [[094-core-interaction-capabilities-3]] — 上一讲：核心交互能力补充
