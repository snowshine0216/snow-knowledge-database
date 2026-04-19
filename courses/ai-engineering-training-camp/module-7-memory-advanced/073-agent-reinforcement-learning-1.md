---
tags: [reinforcement-learning, agent, q-learning, rlhf, llm, autonomous-learning, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927488
wiki: wiki/concepts/073-agent-reinforcement-learning-1.md
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. In reinforcement learning, what are the five core components that define how an agent learns — and what role does each play?
2. CartPole is called the "Hello World" of reinforcement learning. What do you think the agent needs to observe and control to keep a pole balanced on a moving cart?
3. RLHF (Reinforcement Learning from Human Feedback) is used to fine-tune large language models like DeepSeek. How do you think reinforcement learning principles connect to training an LLM?

---

# 073 - Agent Autonomous Learning: Reinforcement Learning (Part 1)

## Overview

This lecture introduces reinforcement learning (RL) as a third paradigm for driving Agent behavior, alongside prompt engineering and framework-based approaches (e.g., ReAct, AutoGen). The instructor motivates RL with hands-on demos and builds intuition through concrete examples before addressing how RL connects to LLM-based Agents.

## Agent Optimization Methods Recap

Three main approaches to optimizing Agent behavior:

1. **Prompt-driven** — guide the model via prompts (e.g., self-reflection, ReAct loops)
2. **Framework-driven** — AutoGen and multi-agent orchestration frameworks
3. **Reinforcement learning** — the focus of this lecture; agents learn optimal policies autonomously through reward signals

Self-reflection (introduced earlier in the course via ReAct) can also be extended to multimodal tasks: observe image query → reflect → search → verify match → loop if needed.

## What Is Reinforcement Learning?

Reinforcement learning is a learning paradigm where an Agent interacts with an **environment**, takes **actions** based on a **policy**, and receives **rewards** (or zero/negative feedback) from the environment. The policy is strengthened for actions that yield rewards.

Core loop:

```
Agent → (observes) → Environment state
Agent → (applies policy) → Action
Environment → (evaluates action) → Reward + new state
Agent → (reinforces policy if rewarded) → repeat
```

Key terms:
- **State** — current observable condition of the environment
- **Action** — what the agent does in response to state
- **Policy** — decision rule mapping states to actions
- **Reward** — signal indicating whether the action was beneficial
- **Environment** — the context in which the agent operates

No human intervention is required once the reward mechanism is defined — the agent learns autonomously.

## Demo 1: 1D Path Navigation

Setup: a linear path with 6 states (0–5). The agent starts at state 0 and must learn to move right to reach the end.

- Moving right → reward +1
- Moving left → reward ≈ 0
- Over many episodes, the agent builds a **Q-table** mapping (state, action) pairs to expected cumulative reward
- The agent converges on "always move right" as the optimal policy

This is the simplest RL example — a one-dimensional, deterministic environment with a clear reward signal.

## Demo 2: CartPole (Balancing Pole on Cart)

The CartPole problem is the "Hello World" of reinforcement learning.

**Observation space** (what the agent sees):
- Cart position
- Cart velocity
- Pole angle
- Pole angular velocity

**Action space**:
- Push cart left
- Push cart right

**Goal**: keep the pole upright for as many timesteps as possible.

### Stages of increasing sophistication demonstrated:

| Version | Strategy | Notes |
|---|---|---|
| V1 | Direct match: pole leans left → push left | Simple rule, no learning |
| V2 | Proportional: pole direction → small cart move | Slightly more nuanced |
| V3 | Aggressive: pole direction → continuous push | AI-generated logic, still heuristic |
| V4 | **Q-Learning** | True RL; builds a Q-table over training episodes |

### Q-Learning Details (V4)

- Trains over ~1900 episodes
- **Exploration rate** decays over time (epsilon-greedy): starts with random exploration, gradually shifts to exploiting the learned policy
- Q-table records optimal actions for each discretized state
- **Learning rate** and **discount factor** (γ) govern how quickly and how far-sightedly the agent updates value estimates
- After ~1900 training episodes, the agent achieves the maximum 500 steps in test runs
- The Q-table is saved and can be reloaded for continued fine-tuning

**Key insight**: as training progresses, the agent's exploration rate decreases, the Q-table stabilizes, and test performance (measured in steps survived) improves monotonically.

## Connecting RL to LLM Agents

The instructor poses the key question: *Can this self-learning capability be applied to our LLM-based Agents?*

- Yes — Microsoft has a framework called **Agent Lightning** designed for exactly this
- The same reward-driven learning loop applies: the Agent acts in an environment, receives feedback, and refines its policy
- This is the foundation for techniques like [[RLHF]] (Reinforcement Learning from Human Feedback), [[PPO]], and [[GRPO]] used to fine-tune large models like [[DeepSeek]]

## Key Takeaways

- Reinforcement learning enables Agents to learn optimal behavior **without human-labeled data** — only a reward function is needed
- The core concepts (state, action, policy, reward, environment) are universal and apply from toy problems (1D path, CartPole) to training LLMs
- Q-Learning is a foundational RL algorithm: it maintains a table of expected rewards per (state, action) pair and iteratively improves it
- Exploration vs. exploitation tradeoff (epsilon-greedy) is central to practical RL training
- [[RLHF]] and related techniques (PPO, GRPO) apply RL principles to LLM alignment and capability improvement
- Microsoft's Agent Lightning framework brings RL-based optimization to production Agent systems

## Related Concepts

- [[RLHF]]
- [[PPO]]
- [[GRPO]]
- [[DeepSeek]]
- [[Q-Learning]]
- [[ReAct]]
- [[AutoGen]]


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain the core RL loop in your own words — what does the agent observe, decide, and receive, and how does this cycle produce learning without human-labeled data?
2. Walk through the four CartPole versions (V1–V4) and explain what distinguishes Q-Learning from the earlier heuristic approaches.
3. Explain the exploration vs. exploitation tradeoff in Q-Learning: what is epsilon-greedy, how does it change over training, and why does this schedule matter?

> [!example]- Answer Guide
> #### Q1 — Core RL Loop
> 
> The agent observes the environment's current state, applies its policy to select an action, and receives a reward plus a new state from the environment — reinforcing actions that yield rewards. No human intervention is needed once the reward function is defined; the agent learns autonomously through repeated episodes.
> 
> #### Q2 — CartPole Versions: Heuristic vs Q-Learning
> 
> V1–V3 use hardcoded or AI-generated heuristics (e.g., "pole leans left → push left"), while V4 (Q-Learning) builds a Q-table mapping discretized (state, action) pairs to expected cumulative rewards through ~1900 training episodes, converging to a true optimal policy rather than hand-tuned rules.
> 
> #### Q3 — Epsilon-Greedy Exploration Schedule
> 
> Epsilon-greedy starts with high random exploration so the agent discovers diverse (state, action) outcomes, then gradually decays the exploration rate so the agent increasingly exploits its improving Q-table. This schedule is essential because pure exploitation early on would trap the agent in suboptimal policies before the Q-table is sufficiently populated.
