---
aliases: [WorkDir Constraint, Working Directory Constraint]
tags: [workdir-constraint, filesystem-safety, agent-tools, harness-engineering, local-agents]
source: internal
---

# WorkDir Constraint

WorkDir Constraint is the rule that agent actions should execute relative to an explicitly bounded working directory rather than against the whole machine by default.

This applies to both file tools and shell tools. The model may choose what to do, but the runtime still decides where those actions are allowed to land.

## Why It Matters

Without a workdir boundary, a local agent can easily drift from repository work into unintended parts of the filesystem:

- reading unrelated files
- writing outside the project tree
- running commands from the wrong location
- increasing the blast radius of mistakes

By forcing paths and commands into a known working directory, the harness narrows both damage and ambiguity.

## Typical Implementation

Common implementations include:

- joining relative file paths against a known workdir
- setting shell execution `cwd` explicitly
- rejecting path traversal that escapes the workdir root

This is a concrete example of runtime control at the resource boundary rather than symbolic intent analysis.

## Practical Rule

If an agent is supposed to work on one repo, the runtime should make leaving that repo an explicit exception, not the default.

## See Also

- [[runtime-boundary-control]]
- [[bash-tool-physical-bottom-lines]]
- [[security-theater]]
- [[06-minimal-toolset-yolo-philosophy]]
