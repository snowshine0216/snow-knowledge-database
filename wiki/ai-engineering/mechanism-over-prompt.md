---
aliases: [Mechanism over Prompt, 机制优于提示词]
tags: [mechanism-over-prompt, prompt-engineering, runtime-design, harness-engineering, agent-control]
source: internal
---

# Mechanism over Prompt

Mechanism over Prompt is the engineering principle that behavior should be shaped by runtime structure when possible, not left to natural-language persuasion alone.

In agent systems, prompts can express intent, but they are weak as enforcement. If the runtime can cheaply remove a dangerous option, require approval, or split planning from acting, that mechanism is usually more reliable than another instruction line.

## Why It Matters

This principle is what turns agent design from hope into control. It assumes the model is useful but not self-policing, so the runtime must make the preferred behavior easier or mandatory.

## Typical Examples

- hiding tools during a planning phase
- gating risky actions behind approval
- constraining work to a bounded directory
- truncating or offloading oversized outputs

## Practical Rule

When a prompt instruction keeps failing, first ask whether the behavior should be enforced by runtime structure instead.

## See Also

- [[two-stage-react]]
- [[runtime-boundary-control]]
- [[harness-engineering]]
- [[react-paradigm]]
