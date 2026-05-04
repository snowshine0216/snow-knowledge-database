---
aliases: [Defense in Depth, 纵深防御]
tags: [defense-in-depth, agent-safety, runtime-boundary-control, harness-engineering, layered-defense]
source: internal
---

# Defense in Depth

Defense in Depth is the practice of stacking multiple independent protections so that failure of one safeguard does not expose the whole system.

In agent harnesses, this matters because no single control is reliable enough on its own. A prompt rule can be ignored, a blacklist can be bypassed, and a reviewer can miss a risk. Robust systems therefore combine several layers that fail differently.

## Typical Agent Layers

Examples often include:

- working-directory boundaries
- time and budget limits
- output truncation
- approval or escalation gates
- rollback and recovery mechanisms

The goal is not to make any one layer perfect. The goal is to keep a mistake from turning into an unconstrained failure.

## Why It Matters

This is the practical answer to security theater. Instead of pretending one filter can understand every dangerous action, a harness spreads responsibility across multiple boundaries that operate at different points in execution.

## Practical Rule

If the system depends on exactly one safeguard to stay safe, it does not have defense in depth.

## See Also

- [[runtime-boundary-control]]
- [[security-theater]]
- [[workdir-constraint]]
- [[bash-tool-physical-bottom-lines]]
