---
tags: [reinforcement-learning, agent, rlhf, ppo, dpo, agent-lightning, autonomous-learning, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927489
wiki: wiki/concepts/073-agent-reinforcement-learning-1.md
---

# 074: Agent Autonomous Learning — Reinforcement Learning (Part 2)

**Source:** [11Agent自主学习-强化学习2](https://u.geekbang.org/lesson/818?article=927489)

## Outline
- [Background: RL for Agent Optimization](#background-rl-for-agent-optimization)
- [Agent Lightning Framework](#agent-lightning-framework)
- [How Agent Lightning Works](#how-agent-lightning-works)
- [Reward Mechanism and MDP](#reward-mechanism-and-mdp)
- [APO Algorithm — Prompt Optimization](#apo-algorithm--prompt-optimization)
- [Search Optimization Example (SearchR1)](#search-optimization-example-searchr1)
- [Training Loop Details](#training-loop-details)
- [Practical Constraints and Future Outlook](#practical-constraints-and-future-outlook)
- [Connections](#connections)

---

## Background: RL for Agent Optimization

在大模型后训练阶段，DeepSeek R1 和 Keyme 1.5 使用了 DPO 和 PPO 的方式通过强化学习进行优化，消除了对特定任务标注数据集的需求。这种方式对于普通应用层开发者来说直接使用的机会不多，但同样的思路可以被引入到 Agent 层面。

Agent 在运行过程中常见问题：
- 提示词词不达意
- RAG 检索结果质量不稳定
- 工具调用效果难以自动优化

传统解法是人工反馈（如 Wander 项目），通过人工标注哪条结果"好"或"不好"来优化提示词。Agent Lightning 的目标是把"人"替换成自动化的强化学习算法。

---

## Agent Lightning Framework

**Agent Lightning** 是微软发布的强化学习框架，目标是以「零代码入侵」方式对 Agent 的提示词和响应效果进行自动优化。

核心特点：
- 兼容任何 Python 代码 + OpenAI 兼容 API 格式
- 不需要修改现有 Agent 框架（LangChain、LangGraph 等）
- 封装了多种强化学习算法（APO、分层 RL 等）
- 框架内部既扮演 **Server 端**（强化学习训练），又扮演 **Client 端**（OpenAI 兼容接口代理）

架构示意：
```
Client (LangChain/AutoChain)
    → 请求 Agent Lightning (Client 代理层)
        → 转发给大模型 + 在对话前后做强化学习处理
    ← 返回优化后的结果
```

集成方式极其简单——将原来的 `openai.AsyncOpenAI(...)` 替换为 Agent Lightning 的异步封装即可：

```python
# 原来
from openai import AsyncOpenAI
client = AsyncOpenAI(...)

# 使用 Agent Lightning 后
from agent_lightning import AsyncOpenAI  # 替换导入
client = AsyncOpenAI(...)  # 其余代码不变
```

---

## How Agent Lightning Works

以「预定会议室」为典型示例：
- **任务输入**：给四个人在上午10点预定一个带白板的会议室
- **Agent 执行**：调用工具查询房间可用性，返回最佳房间 ID（如 A103）
- **评分器函数**：从 0 到 1 对返回结果打分（1 表示完美匹配需求）
- **奖励机制**：高分结果保留为下次训练的参考，低分结果触发提示词改进

---

## Reward Mechanism and MDP

奖励机制基于**马尔科夫决策过程（MDP）**：

| 组件 | Agent Lightning 中的对应 |
|------|--------------------------|
| State（状态） | 当前的用户请求 + 对话历史 |
| Action（动作） | 大模型生成的回复/工具调用 |
| Reward（奖励） | 评分器函数返回的 0~1 数值 |
| Policy（策略） | 当前的提示词模板 |

奖励分值越接近 1，当前提示词越优，算法将其作为下一轮改进的基础。相比人工 RLHF：
- 人工 RLHF：人为给 yes/no 反馈
- Agent Lightning：算法给 0~1 连续值，自动迭代

较好的思考结果还可存入向量数据库，供后续 RAG 检索复用。

---

## APO Algorithm — Prompt Optimization

**APO（Automatic Prompt Optimization）** 是 Agent Lightning 提供的一个典型算法样例，专门用于自动优化提示词模板。

运行循环（Loop）：

```
1. 算法 → Agent：生成新的提示词模板 (program template)
2. Agent → Trainer：使用新提示词执行任务 (rollout)
3. Trainer → 算法：汇报执行结果 + 奖励分值
4. 算法：基于 reward 和 span 生成下一轮优化的提示词
```

代码示例（APO 样例）：
```python
# 初始化提示词
initial_prompt = "你是一个会议室预订助手..."

# 评分器
def scorer(result: str, expected: str) -> float:
    return 1.0 if expected in result else 0.0

# 运行 APO 优化
apo.run(agent=book_room_agent, scorer=scorer, rounds=50)
```

执行后，提示词模板自动从初始版本迭代到更优版本，无需人工干预。

---

## Search Optimization Example (SearchR1)

Agent Lightning 的另一个样例是 **SearchR1**，用于优化 RAG 检索中的查询语句生成：

流程：
1. 基于 VKE 数据集，下载 training/test 数据（约 8GB）
2. 启动 LangGraph 检索工作流（128 个 worker 节点）
3. 执行 `train.sh` 进行强化学习训练
4. 比较训练前后的搜索衡量指标（有显著提升）

**硬件要求**：至少 40GB 显存（8 GPU）。本地环境通常无法运行完整训练，这是目前的核心瓶颈。

---

## Training Loop Details

Agent Lightning 完整训练循环的三个核心步骤：

1. **Step 1 - 算法 → Agent**：基于上一轮奖励，生成改进后的提示词模板，挑选任务给 Trainer
2. **Step 2 - Agent → Trainer**：Agent 使用新提示词执行 rollout，Trainer 捕获所有 span，计算奖励，将 `(span, reward)` 发回算法
3. **Step 3 - 算法学习**：基于 span 和 reward，算法生成新的提示词模板，进入下一轮

对比 VANA（人工 RLHF）：
- VANA：人工标注"这个提示词好"，存储后下次参考
- Agent Lightning：算法自动完成相同流程，并给出 0~1 连续评分

---

## Practical Constraints and Future Outlook

当前限制：
- 需要 40GB+ 显存才能完整运行
- 训练速度慢，算力消耗大
- 期待未来出现资源消耗更小的强化学习框架

未来三大预测方向（模块 7 总结）：
1. **RL 优化 Agent**：自动替代人工提示词打标，工具调用、记忆、SQL 生成等都可用 RL 自动优化
2. **边缘计算小模型**：模型剪枝量化与蒸馏，减小模型体积以适配边缘设备
3. **多模态检索**：图文混合的 RAG 能力

对开发者的建议：
- 不深入算法方向的同学：了解"RL 可以优化提示词和思考链"即可
- 关注算法方向的同学：提前学习强化学习概念和相关论文

---

## Connections
- → [[agent-reinforcement-learning-1]]
- → [[075-docker-containerization-1]]
