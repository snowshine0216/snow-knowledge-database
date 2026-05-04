---
aliases: [Bash Tool Physical Bottom Lines, Bash Tool Guardrails]
tags: [bash-tool, guardrails, runtime-boundary-control, harness-engineering, local-agents]
source: internal
---

# Bash Tool Physical Bottom Lines

Bash Tool Physical Bottom Lines are the hard runtime limits placed around a shell-execution tool so that a powerful primitive remains usable without pretending it can be perfectly understood in advance.

In a local agent harness, a shell tool is often the most expressive capability in the system. Because of that, it also needs the clearest boundaries.

## Typical Bottom Lines

Common physical constraints include:

- command timeout
- fixed working directory
- bounded output length
- raw error return so the model can self-correct

These controls do not try to classify every command semantically. They instead constrain the execution environment and failure mode.

## Why This Beats Fragile Filtering

Static filters can miss dangerous variants while also blocking legitimate commands. Physical limits are more reliable because they operate after the command has been interpreted but before damage can spread too far:

- timeout limits hanging or runaway work
- workdir limits filesystem blast radius
- truncation limits context explosion
- error passthrough preserves the self-correction loop

## Why It Matters for Harness Design

This pattern is a concrete example of [[runtime-boundary-control]]. The model may choose the command, but the runtime still controls where it runs, how long it runs, how much output returns, and how failure is represented.

## Practical Rule

When a tool is too general to secure semantically, constrain it physically.

## See Also

- [[runtime-boundary-control]]
- [[agentic-loop-self-correction]]
- [[yolo-execution-philosophy]]
- [[06-minimal-toolset-yolo-philosophy]]
