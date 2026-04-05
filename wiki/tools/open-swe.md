---
tags: [ai-agents, coding-agent, langgraph, software-engineering, github, slack]
source: https://github.com/langchain-ai/open-swe
---

# Open SWE

Open SWE is an open-source framework from LangChain for building internal coding agents triggered from Slack, Linear, and GitHub. It turns issue/comment events into code changes and draft PRs using isolated sandbox execution.

## What It Is

A self-hosted coding-agent service built on LangGraph + Deep Agents. The architecture separates invocation, sandboxing, agent loop, tooling, and middleware into distinct layers. It supports multi-surface triggering (chat, ticketing, code review) and provides explicit customization points for sandbox backends, model routing, tool registries, prompts, and middleware policies.

## Key Features

- **Multi-surface triggers**: Slack, Linear, and GitHub events as entry points
- **Isolated sandboxes**: parallel agent tasks with reduced host-side blast radius
- **Customizable layers**: swap sandbox providers, models, tools, triggers, and prompts via documented choke points
- **Safety middleware**: `open_pr_if_needed` fallback and configurable policy enforcement
- **LangSmith integration**: observability and tracing for agent runs

## When to Use

- You want a self-hosted internal coding-agent framework with explicit architecture and extension points
- Your team needs multi-surface triggering instead of a single UI entry point
- You can support integration complexity (GitHub App, webhooks, sandbox provider credentials, LangSmith)
- You are building for medium-to-large engineering organizations with existing internal processes

## Limitations

- Setup overhead is non-trivial: OAuth, app permissions, secrets, webhooks, sandbox quotas, deployment
- Hosted integrations and sandbox providers introduce vendor dependence and infrastructure cost
- Security posture depends on correct environment hardening and allowed-org/user mappings
- Quality control remains partly prompt-driven; production-grade governance may need extra CI/review gates

## Relationship to Other Approaches

Open SWE takes a different approach from [[Claude Code Agentic OS|agentic OS]] patterns. Where agentic OS focuses on skill orchestration within a single agent runtime, Open SWE provides a full service layer for triggering and managing coding agents across engineering systems. For teams focused on [[Harness Engineering|harness engineering]], Open SWE's middleware layer offers a practical example of policy enforcement at the agent boundary.
