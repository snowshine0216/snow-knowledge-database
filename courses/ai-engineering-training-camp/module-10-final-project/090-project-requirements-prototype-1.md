---
tags: [ai-engineering, product-requirements, prototype, rag, langchain, customer-service, fastapi]
source: https://u.geekbang.org/lesson/818?article=930871
wiki: wiki/concepts/090-project-requirements-prototype-1.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在客服AI系统中，哪类问题适合交给AI处理，哪类问题应该转给人工？你凭直觉如何区分？
2. RAG（检索增强生成）和 Tool Calling（工具调用）各自适合解决什么类型的用户需求？
3. 你认为一个生产级客服AI系统，首次响应时间应控制在多少毫秒以内才算达标？

---

# 090: Project Requirements and Prototype Design Part 1

**Source:** [2-项目需求与原型设计1](https://u.geekbang.org/lesson/818?article=930871)

## Outline
- [Core Requirements Analysis](#core-requirements-analysis)
- [User Scenario Definition](#user-scenario-definition)
- [Functional Requirements Breakdown](#functional-requirements-breakdown)
- [Technical Stack and Architecture](#technical-stack-and-architecture)
- [Key Interface Design](#key-interface-design)
- [Non-Functional Requirements](#non-functional-requirements)
- [Development Process: Validate First, Platform Later](#development-process-validate-first-platform-later)

---

## Core Requirements Analysis

在正式开发前，需要与甲方当面沟通，对齐核心痛点（文档不一定准确）。

**客服AI的核心痛点**：
- 高峰期人工回答不过来，希望AI处理重复性、非关键性问题
- 重要程度低 + 重复率高的问题适合AI处理（如课程咨询、常见问题）
- 重要程度高的问题（如卡丢失、费用错误）应转人工

**AI能提升的价值**：
- 降低客服人力成本
- 处理重复性高、非致命性的问题咨询
- 24小时响应

---

## User Scenario Definition

通过分析，归纳出两类核心能力需求：

### 1. 课程咨询（RAG）
- 用户希望了解课程大纲，对大纲模糊处进行解释
- 技术实现：RAG（知识库检索增强）

### 2. 订单查询（Tool Calling）
- 查询订单进度、开课时间、费用疑问、退款申请
- 技术实现：MCP / Function Calling 调用数据库API

### 3. 学习支持和政策咨询
- 可放入人格知识库
- 通过意图识别区分课程咨询与学习知识问题

**总结**：两个最核心的能力 = **RAG** + **工具调用（Tool Calling）**

### 安全和异常场景
- 查询订单时需要账号信息：敏感信息（身份证、密码）不能出现在日志中
- 知识盲区时直接转人工（兜底策略）：分散时人工可以处理，集中高峰时AI兜底

---

## Functional Requirements Breakdown

结合需求，具体功能模块设计：

| 功能模块 | 说明 | 技术方案 |
|---------|------|---------|
| 课程咨询 | 基于知识库回答课程相关问题 | RAG |
| 订单查询 | 查询订单状态、金额、退款 | Tool Calling / MCP |
| 学习支持 | 技术问题支持 | 知识库 + 意图识别 |
| 政策咨询 | 平台政策相关问题 | RAG |
| 转人工 | 知识盲区或用户要求时转接 | Handoff机制 |

**开发路线**：
1. 先跑通课程咨询（RAG）这一条完整线
2. 在此基础上补充订单查询
3. 再补充其他能力

---

## Technical Stack and Architecture

```
技术选型：
- 框架：LangChain 1.0（升级自0.x版本）
- 向量数据库：FAISS
- 路由模块：LangChain内置路由（多Agent create_agent方式）
- 后端：FastAPI
- 安全中间件：LangChain安全增强中间件
- 知识库热更新：支持（不重建索引直接更新内容）
- 日志记录：记录未解决的问题，用于改进
```

**RAG扩展（Suggest模式）**：
- 用户问答后提供相关延伸建议（使用RAG recommend方式）
- 例：用到了Llama Index，可建议追问版本、具体用途等

**架构图（简化）**：
```
用户请求 → FastAPI → LangGraph工作流
                        ├── 意图识别
                        ├── RAG（FAISS向量库）
                        ├── Tool Calling（订单数据库）
                        └── Handoff（转人工）
```

---

## Key Interface Design

两个最关键的接口：

### RAG接口
- 输入：用户问题（text）
- 输出：基于知识库的回答（text）+ 参考来源

### 工具调用接口（订单查询）
- 输入：用户意图 + 账号信息（加密）
- 输出：订单数据（JSON）

**接口细节**：
- 敏感信息脱敏处理（不写入日志）
- 标准HTTP接口供前端/移动端调用

---

## Non-Functional Requirements

| 指标 | 目标值 | 说明 |
|-----|-------|-----|
| 响应时间 | P95 < 500ms | 首个字的响应时间（非完整响应） |
| 并发能力 | 500+ QPS | 单节点可支持；压力主要在大模型机器 |
| 准确率 | ≥ 92% | 基于覆盖主要常见问题的知识库 |
| 验收准确率 | ≥ 90% | 稍宽于内部指标 |
| 工具调用成功率 | 100% | 订单查询等固定业务不能出错 |
| 敏感信息拦截率 | 100% | 使用现有过滤工具 |

**注意事项**：
- P95 500ms是首次响应时间，整体响应完成通常需2000-4000ms
- 准确率大部分时候是"拍脑袋"定的，因为无法预知所有可能的用户问题
- 验收往往是一次性的，所以验收标准比内部目标宽松

**主要性能瓶颈**：
- 向量数据库检索（推荐放GPU）
- 大模型推理

---

## Development Process: Validate First, Platform Later

**推荐开发流程**：
```
1. 用Dify/Coze快速搭原型 → 与甲方对齐效果和预期
2. 技术选型验证（LangChain 1.0新版本功能测试）
3. 环境搭建：conda虚拟环境 python 3.1x
   conda create -n edu_agent python=3.1x
   conda activate edu_agent
4. 开发V1 MVP版本（完整跑通核心流程）
5. 与客户确认后拿第一期款
6. 推送远程仓库，按版本迭代（V2、V3）
```

**版本规划**：
- **V1 (MVP)**：健康检查 + RAG课程咨询 + 订单查询 + 转人工接口
- **V2**：开场白 + 快捷指令 + 对话历史 + 推荐建议 + 多模态支持 + 知识库管理
- **V3**：多租户 + 平台化

---

## Connections
- → [[089-project-background]]
- → [[091-project-requirements-prototype-2]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释：为什么该客服AI的核心技术方案选择"RAG + Tool Calling"组合，而不是只用其中一种？每种技术分别解决了什么场景？
2. 该系统的非功能性指标中，P95响应时间目标是多少？为什么准确率指标在实践中往往是"拍脑袋"定的，而验收标准又比内部目标宽松？
3. 推荐开发流程中，为什么要先用 Dify/Coze 搭原型再做 LangChain 技术开发？这背后体现了什么产品验证思路？

> [!example]- Answer Guide
>
> #### Q1 — RAG vs Tool Calling 组合原因
>
> RAG 用于课程咨询——根据知识库回答大纲解读、政策等非结构化问题；Tool Calling 用于订单查询——调用数据库API获取订单状态、退款等结构化数据。两类需求的信息来源和检索方式完全不同，必须组合使用。
>
> #### Q2 — P95响应时间与准确率指标
>
> P95首次响应时间目标为 < 500ms（整体完成约需2000–4000ms）；准确率（≥92%）无法精确测量因为无法预知所有用户问题，只能估算；验收标准（≥90%）比内部目标宽松，因为验收通常是一次性的，需留有余地。
>
> #### Q3 — 原型优先验证思路
>
> 先用 Dify/Coze 快速搭原型是为了与甲方对齐效果和预期，避免用 LangChain 精细开发后需求方向错误；体现的是"先验证、后平台化"的开发思路——在核心路线（RAG课程咨询）跑通并客户确认后，再逐步扩展技术能力和版本迭代。
