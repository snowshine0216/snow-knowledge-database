---
tags: [reinforcement-learning, agent, q-learning, rlhf, llm, autonomous-learning, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927488
---

# Agent Autonomous Learning: Reinforcement Learning (Part 1)

Reinforcement learning (RL) is a learning paradigm where an Agent interacts with an **environment**, selects **actions** based on a **policy**, and receives **rewards** from the environment. The agent autonomously refines its policy to maximize cumulative reward — no labeled training data or human intervention required once the reward function is defined.

## Core Loop

```
Agent → observe environment state
Agent → apply policy → take action
Environment → return reward + new state
Agent → reinforce policy for rewarded actions
repeat
```

## Key Terms

- **State** — current observable snapshot of the environment
- **Action** — what the agent does given a state
- **Policy** — decision rule mapping states to actions
- **Reward** — scalar signal indicating action quality
- **Environment** — the context providing state transitions and rewards

## Q-Learning

A foundational RL algorithm that maintains a **Q-table**: a lookup from (state, action) pairs to expected cumulative reward. Update rule uses a learning rate and discount factor (γ). Training uses **epsilon-greedy exploration**: high randomness early on, decaying toward exploitation of the learned policy.

Classic demo: **CartPole** — keep a pole balanced on a moving cart by pushing left/right. After ~1900 training episodes with Q-learning, the agent reliably achieves the 500-step maximum.

## RL for Agent Optimization

Three paradigms for driving LLM-based Agents:

1. Prompt engineering (ReAct, self-reflection)
2. Orchestration frameworks (AutoGen, multi-agent)
3. **Reinforcement learning** — agents learn optimal behavior from reward signals

Microsoft's **Agent Lightning** framework applies RL to production Agent systems. The same principles underpin [[RLHF]], [[PPO]], and [[GRPO]] used for LLM fine-tuning (e.g., [[DeepSeek]]).

## Related

- [[RLHF]]
- [[PPO]]
- [[GRPO]]
- [[DeepSeek]]
- [[Q-Learning]]
- [[ReAct]]
- [[AutoGen]]
