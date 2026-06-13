---
tags: [prompt-engineering, in-context-learning, chain-of-thought, prompt-injection, jailbreaking, security, chip-huyen]
source: https://github.com/chiphuyen/aie-book
---

# AIE Ch.5 — Prompt Engineering

The first and cheapest adaptation lever: change the input, not the model. Full review pack with quiz: [[05-prompt-engineering]].

## Mechanics

- **In-context learning (ICL)** — the model learns the task from the prompt at inference, no weight updates. **Zero-shot** (instructions only) vs. **few-shot** (with demonstrations).
- **System vs. user prompt** — the system prompt sets persistent role/rules and has higher priority (an **instruction hierarchy**) that matters for behavior *and* security.
- **Context length & efficiency** — the **"lost in the middle"** effect: models miss info buried mid-context. Place key content at the **start or end**.

## Best practices

1. Write **clear, explicit instructions** (task, persona, examples, format, restrictions).
2. **Provide sufficient context** (often via RAG — see [[aie-ch06-rag-and-agents]]).
3. **Decompose** complex tasks into chained subtasks (easier to get right, test, debug).
4. **Give the model time to think** — **chain-of-thought** and self-critique (test-time compute as a prompt).
5. **Treat prompts as code** — version and evaluate them.

## Defensive prompt engineering (security)

- **Prompt extraction** — attackers reveal your system prompt → **never store secrets in prompts**.
- **Jailbreaking** — bypassing safety guardrails.
- **Prompt injection** — malicious instructions enter the context; **direct** (user input) or **indirect** (hidden in retrieved docs/tool output). Especially dangerous for **agents** that take actions.
- **Defenses (layered, none foolproof)**: prompt-level (instruction hierarchy, delimiters, hardening), system-level (input/output filtering, least privilege, sandboxing, human approval), model-level (guard/classifier models). See [[defense-in-depth]].

## Key Takeaways

- The "original sin" of prompting: a prompt is one undifferentiated token stream, so **the model can't reliably tell data from instructions** — enforcement must live in **code**, not the prompt. See [[security-theater]].
- Know when prompting plateaus: missing **knowledge** → RAG; missing **ability** → tools/agents; won't hold a **format/behavior** → finetune ([[aie-ch07-finetuning]]).

## See Also

- [[chip-huyen-ai-engineering-book]]
- [[aie-ch04-evaluate-ai-systems]] · [[aie-ch06-rag-and-agents]]
- [[context-engineering]] · [[defense-in-depth]]
