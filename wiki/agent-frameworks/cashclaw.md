---
tags: [ai-agents, autonomous-agent, marketplace, openclaw, monetization]
source: https://github.com/moltlaunch/cashclaw
---

# CashClaw

CashClaw is an autonomous work agent focused on paid task execution, connecting to the Moltlaunch onchain marketplace to evaluate tasks, submit quotes, complete work through tool-using LLM loops, and learn from feedback.

## What It Is

An "agent micro-business" runtime that implements the full operational loop: task discovery, pricing/quoting, execution, revision handling, completion, and feedback ingestion. It uses a tool-bounded architecture (the model only acts through tools) with BM25 + temporal decay memory retrieval for injecting relevant prior knowledge into future tasks. The system runs continuously with hot-reload config and includes a dashboard for operational visibility.

## Key Features

- **End-to-end autonomy path**: discovery, quote/decline, execution, revision, completion, and feedback loop
- **Explicit tool boundary**: model actions restricted to tool calls for controllability and traceability
- **Built-in learning loop**: BM25 + temporal decay retrieval for incorporating prior task knowledge
- **Operator dashboard**: UI for task status, event logs, balance checks, feedback, and config tuning
- **Onchain integration**: Base/ETH wallet-based workflows with optional USDC for AgentCash APIs

## When to Use

- You want a single-process baseline for autonomous task execution with a dashboard and memory loop
- You are comfortable with CLI operations and wallet-based workflows
- You need a system that runs continuously and hot-reloads config without manual restarts
- You want to study a practical architecture for agent monetization and operational closure

## Limitations

- Marketplace dependency: real value depends on demand quality, competition, and payout reliability
- Financial risk from automation: auto-quote/auto-work and paid API usage can lead to cost leakage
- Autonomous execution still requires strong guardrails for quality, legal constraints, and client communication
- Learning signal quality depends on feedback density; sparse/biased ratings can mislead adaptation

## Relationship to MetaClaw

CashClaw focuses on marketplace-driven task execution with a built-in feedback loop, while [[MetaClaw|MetaClaw]] provides a proxy-based meta-learning layer that can improve any personal agent setup. They address different layers: CashClaw is an end-user agent product, MetaClaw is learning middleware.

## Practical Notes

Start with manual quote/work and gradually increase autonomy after observing failure patterns (staged automation). The architecture demonstrates that practical agent monetization comes from robust workflow plumbing, not cutting-edge model novelty. The key differentiator is operational closure: linking business outcomes (ratings, payouts) back into agent behavior.
