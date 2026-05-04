---
aliases: [Context Bloat, Attention Dilution, Context Bloat / Attention Dilution]
tags: [context-bloat, attention-dilution, context-window, token-optimization, agents]
source: internal
---

# Context Bloat and Attention Dilution

Context Bloat is the failure mode where too much information is stuffed into the prompt bundle. Attention Dilution is the downstream effect: the model still sees the tokens, but the few facts that actually matter become less salient and easier to miss.

The two concepts usually appear together, which is why they are best treated as one engineering problem.

## Why It Happens

Agent systems keep accumulating material:

- old conversation turns
- verbose tool outputs
- repeated instructions
- oversized schemas
- retrieved documents pasted in full

The instinct is understandable: include everything so the model cannot miss anything. In practice, that often makes it miss the important things more often.

## Observable Symptoms

- the model ignores a critical recent constraint
- it repeats work that was already finished
- tool selection becomes worse as more tools are exposed
- response latency and input cost rise without better results

This is a classic consequence of poor [[context-engineering]]. The model is not simply "forgetting"; it is being asked to discriminate signal from a bloated bundle every turn.

## Engineering Implications

- More context is not always better context.
- Large prompts should be treated as a budgeted resource, not a free safety blanket.
- Inline evidence should compete for space only if it helps the next decision.

Useful responses include:

- stricter selection of retrieved material
- less repeated boilerplate
- moving bulky artifacts to file references or checkpoints
- using [[context-compaction]] instead of linear replay forever

## Practical Rule

When reliability drops as the bundle grows, suspect context bloat before blaming the model. The fix is often not a stronger prompt but a smaller, cleaner one.

## See Also

- [[context-engineering]]
- [[context-compaction]]
- [[llm-api-statelessness]]
- [[harness-engineering]]
