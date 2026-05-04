---
aliases: [Human-in-the-loop, Human-in-the-Loop]
tags: [human-in-the-loop, agent-safety, approval, escalation, harness-engineering]
source: internal
---

# Human-in-the-Loop

Human-in-the-Loop is the design pattern where an agent must pause, escalate, or request confirmation before taking certain actions. It is not a sign that the system is incomplete; it is a deliberate boundary between model autonomy and human accountability.

## What It Is For

Use human review when the cost of a wrong action is high enough that autonomous execution is no longer acceptable. Typical cases include:

- destructive file or database operations
- production changes
- security-sensitive actions
- ambiguous business decisions
- any step where recovery is expensive or irreversible

In a mature [[harness-engineering]] system, human-in-the-loop is usually implemented as a runtime policy rather than scattered ad hoc prompts.

## Common Patterns

### Approval Gate

The agent proposes an action, shows the rationale or diff, and waits for explicit approval.

### Exception Queue

Only abnormal, high-risk, or low-confidence cases are escalated. Routine work continues automatically.

### Checkpoint Review

The system runs autonomously until it hits a predefined boundary, then asks a human to validate before continuing.

## What It Should Not Become

Human-in-the-loop is not an excuse for weak runtime controls. If a system relies entirely on manual review because it lacks guardrails, budgets, or rollback paths, it is using humans as a patch for poor engineering.

Likewise, inserting approval on every trivial step destroys the speed benefit of agents. The real goal is selective escalation: autonomous where safe, supervised where expensive.

## Practical Rule

Escalate on risk, not on discomfort. If the action is reversible and well-bounded, let the harness manage it. If the action is irreversible, costly, or policy-sensitive, route it through a human.

## See Also

- [[harness-engineering]]
- [[agentic-loop-self-correction]]
- [[long-running-agent-harness]]
