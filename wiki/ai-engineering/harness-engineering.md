---
tags: [harness-engineering, prompt-engineering, context-engineering, agent, ai-engineering]
source: https://www.youtube.com/watch?v=3DlXq9nsQOE
---

# Harness Engineering

Harness Engineering is the third major paradigm shift in AI engineering, following [[prompt-engineering]] and [[context-engineering]]. It addresses the problem of making models perform reliably during sustained, real-world execution -- not just produce good single-turn outputs.

## Relationship to Prior Paradigms

The three paradigms form a containment hierarchy, not a replacement chain:

| Paradigm | Focus | Analogy |
|---|---|---|
| Prompt Engineering | Shaping the instruction space | Sales script |
| Context Engineering | Providing the right information at the right time | Background briefing materials |
| Harness Engineering | Supervising, constraining, and correcting execution | Checklist + real-time reporting + acceptance criteria |

## Definition

LangChain defines the relationship as: **Agent = Model + Harness**. Everything in an agent system besides the model itself -- orchestration, tooling, validation, recovery -- is the harness.

## Six-Layer Architecture

A mature harness consists of six layers:

1. **Context Management** -- role definitions, information pruning, structured organization
2. **Tool System** -- which tools are available, when to invoke them, how results feed back
3. **Execution Orchestration** -- goal comprehension, information gathering, analysis, generation, verification, correction
4. **Memory and State** -- separated into task state, intermediate results, and long-term memory
5. **Evaluation and Observability** -- output acceptance, automated testing, logging/metrics, error attribution
6. **Constraint Validation and Failure Recovery** -- guardrails, checkpoints, retry/rollback mechanisms

## Key Practices

### Progressive Disclosure (Agent Skills)

Context windows are scarce resources. Rather than loading all information upfront, use progressive disclosure: expose information on-demand, layered, and at the right moment. This is the principle behind [[LLM Knowledge Base]] agent skills -- a directory page plus sub-documents loaded as needed, replacing monolithic prompt files.

### Separation of Production and Evaluation

The agent that produces output and the agent that evaluates it should be independent roles. Self-evaluation tends to be optimistically biased. Anthropic uses a **Planner-Generator-Evaluator** triangle for this separation.

### Context Refit

For long-running tasks, rather than compressing an increasingly noisy context window, launch a fresh agent with a clean context to continue the work. This addresses "context anxiety" -- the failure mode where agents rush or terminate prematurely as context grows.

## Demonstrated Impact

- One practitioner reported agent success rates jumping from under 70% to over 95% by restructuring task decomposition, state management, checkpoint validation, and failure recovery -- without changing the model or prompts.
- In competitive benchmarks, teams that invested in harness design (not model tuning) saw dramatic ranking improvements.

## Core Insight

When an agent fails, the fix is almost never "make it try harder." The fix is identifying which structural capability is missing -- supervision, state tracking, validation, recovery -- and engineering it into the harness. The challenge in AI deployment is shifting from "making models appear smart" to "making models work reliably in the real world."

See also: [[long-running-agent-harness]]
