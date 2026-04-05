---
tags: [harness-engineering, ai-agents, long-running-agents, anthropic, evaluation]
source: https://www.youtube.com/watch?v=9d5bzxVsocw
---

# Long-Running Agent Harness

A long-running agent harness is the orchestration layer that enables AI agents to execute complex, multi-hour tasks reliably. Anthropic's blueprint for this pattern treats [[harness-engineering]] as a first-class engineering concern rather than an optional wrapper.

## Failure Modes

Two recurring failures plague long-running agents:

### Context Anxiety

As context grows during extended tasks, agents begin to rush, cut corners, or terminate prematurely. The context window becomes a source of pressure rather than a resource.

**Mitigation strategies:**
- Context refit -- spin up a fresh agent with a clean context to continue the work
- Context compaction -- summarize and compress prior context (viable with sufficiently capable models)

### Weak Self-Evaluation

Agents overrate their own output. Self-assessment tends to be shallow and overly lenient, leading to premature declarations of completion.

**Mitigation:** Separate the generator and evaluator into independent roles.

## Adversarial Evaluation Architecture

Anthropic's core design pattern uses role separation:

| Role | Responsibility |
|---|---|
| **Planner** | Decomposes the task into manageable units |
| **Generator** | Produces the actual output |
| **Evaluator** | Critiques output against explicit quality criteria |

### Evaluator Design Requirements

- Evaluators must interact with artifacts (e.g., via [[Playwright]] MCP), not just read static output
- Evaluator quality requires iterative refinement -- early versions tend to be shallow and lenient
- For subjective outputs (e.g., UI), define explicit grading dimensions: design quality, originality, craft/technical execution, functionality

### When to Use Evaluators

Evaluator overhead should be applied selectively:
- **High value:** Tasks that push model limits, subjective quality assessment, novel domains
- **Low value:** Routine, in-distribution work where the model performs reliably without supervision

## Experimental Results

### Frontend Museum Site

Iterative feedback rounds between generator and evaluator produced measurable quality gains over successive cycles.

### 2D Retro Game

The full planner+generator+evaluator harness produced a functional, playable game. A cheaper solo run produced output that looked acceptable but was not truly playable -- illustrating the gap between surface quality and real functionality.

### DAW (Digital Audio Workstation)

A long-running build loop delivered useful software in a single extended flow. Runtime was approximately 4 hours at roughly $125 -- demonstrating feasibility with notable cost tradeoffs.

## Harness Evolution

A critical insight: as models improve, some orchestration assumptions become obsolete. After upgrading to a more capable model, Anthropic simplified their harness by removing sprint-level contract negotiation and context resets, relying instead on context compaction.

**Principle:** Continuously re-evaluate harness complexity. Remove layers that the model no longer needs. The harness should evolve alongside model capabilities, not accumulate indefinitely.

See also: [[harness-engineering]], [[LLM Knowledge Base]]
