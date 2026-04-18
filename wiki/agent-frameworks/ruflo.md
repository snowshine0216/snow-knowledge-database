---
tags: [ai-agents, orchestration, mcp, multi-agent, typescript]
source: https://github.com/ruvnet/ruflo
---

# Ruflo

Ruflo is a TypeScript-based AI agent orchestration platform (rebranded from Claude Flow) focused on multi-agent coordination through CLI and MCP integration.

## What It Is

A comprehensive orchestration runtime for coordinated multi-agent software workflows. The platform includes agent orchestration, memory management, security controls, hooks, plugin infrastructure, and many agent/tool abstractions. It targets Claude Code and Codex environments and supports advanced agentic patterns including swarm topologies, tool orchestration, and policy/security layers.

## Key Features

- **Multi-agent coordination**: routing, memory, and consensus patterns for agent teams
- **CLI + MCP integration**: native tooling for [[Claude Code Internals|Claude Code]] and Codex environments
- **Plugin/hooks infrastructure**: extensible orchestration with custom middleware
- **Security focus**: dedicated security scripts and explicit security controls in releases
- **Broad feature surface**: orchestration, memory, agents, and tools in one project

## When to Use

- You need a broad orchestration runtime rather than a lightweight single-agent helper
- Your team can manage Node.js/TypeScript operational complexity and wants deep agent behavior control
- You are building internal developer tooling, workflow automation, or agent infrastructure
- You need advanced patterns like swarm topologies or policy-driven agent coordination

## Limitations

- Very wide scope increases onboarding cost and makes selective adoption harder
- README positioning is ambitious; some claims may require independent benchmarking
- Large numbers of tools/agents create governance and reliability overhead without policy constraints
- Open issue volume is non-trivial -- validate trends affecting your specific path before adoption

## Relationship to Other Approaches

Ruflo occupies a similar space to [[Claude Code Multi-Agent Setup|multi-agent setup]] patterns but provides a more opinionated, platform-level approach. Where multi-agent setup describes extension layers for Claude Code, Ruflo bundles orchestration, memory, and security into a single runtime. For teams exploring [[Harness Engineering|harness engineering]], Ruflo's middleware and policy layers offer practical orchestration primitives.

## Practical Notes

Start with a narrow pilot: one workflow, limited agent roles, and explicit success metrics (latency, accuracy, failure recovery). Treat this as an orchestration platform decision, not a package drop-in. Run a security and operability checkpoint before full rollout. If your requirement is only "add one skill to one assistant," this is likely heavier than necessary.
