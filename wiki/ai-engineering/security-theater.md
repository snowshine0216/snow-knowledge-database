---
aliases: [Security Theater, 安全剧场]
tags: [security-theater, agent-safety, guardrails, harness-engineering, local-agents]
source: internal
---

# Security Theater

Security Theater is the appearance of safety without a corresponding reduction in real risk.

In agent systems, this usually means adding controls that look strict in demos or code review but are easy to bypass in practice. Typical examples include brittle keyword blacklists, shallow regex filters, or symbolic approvals that do not actually constrain the tool or resource boundary where damage occurs.

## Why It Matters for Agents

Agents with code execution or shell access can often route around superficial checks:

- split a blocked command into variables
- write a small script first, then execute it
- use an equivalent command path the blacklist did not anticipate

That means the runtime may feel protected while the real action surface remains open.

## What Real Safety Looks Like Instead

For local harnesses, stronger protection usually comes from physical or runtime boundaries such as:

- constrained working directories
- time and budget limits
- output truncation
- rollback or recovery mechanisms

These do not try to predict every dangerous string. They control the environment where risky actions happen.

## Practical Rule

If a safety mechanism is easier to bypass than to maintain, it is probably security theater.

## See Also

- [[yolo-execution-philosophy]]
- [[runtime-boundary-control]]
- [[human-in-the-loop]]
- [[06-minimal-toolset-yolo-philosophy]]
