---
tags: [llm, api, stateless, context-window, prompt-engineering, context-engineering, chat-apps]
source: https://www.youtube.com/watch?v=qs8BzCdqZhY
---

# LLM API Statelessness

**LLM API calls are stateless.** Each request to a hosted model carries only the messages sent in that request — the model retains nothing between calls. What looks like "memory" in chat products (ChatGPT, Claude.ai) is a client-side illusion: the app replays prior turns on every new call. Understanding this distinction is the single most useful mental model for [[prompt-engineering]] and agent work.

## The Core Rule

```
┌──────────────┐   request N   ┌──────────────┐
│ client / app │──────────────▶│ hosted model │
│ (has state)  │◀──────────────│  (no state)  │
└──────────────┘   response N  └──────────────┘
```

The model sees exactly what the client sends. If the client does not include turn N-1, the model does not know turn N-1 existed.

## Where the Illusion Comes From

Chat UIs maintain a per-conversation transcript. On every new user message, they:

1. Gather the relevant earlier turns (sometimes all, sometimes pruned)
2. Concatenate them with the new message
3. Send the entire bundle as one request
4. Render only the model's latest reply

The model sees the full bundle for one call and then forgets it. The *application* is what remembers.

## Consequences

### 1. Every prompt must be self-complete in production

When calling the API directly, every call must carry:

- **Role** — who the model is playing
- **Context** — prior turns, attached data, constraints
- **Task** — the specific action requested
- **Format** — how to structure the answer

This is the [[rctf-framework]] — the minimal contract that survives statelessness.

### 2. Long chats drift because context windows are finite

Every model has a hard context budget (commonly 128k–200k tokens). As chats grow, the client's replay bundle eventually approaches the limit and earlier turns — often your original system instructions — silently drop. The model then "forgets" its persona. This is a **consequence of replay + window limits**, not a model regression.

### 3. "Memory" is input tokens, not output

Replayed history is billed as *input* tokens. Long chats are expensive even if the model's replies are short, because every new turn re-sends the whole history at input price.

### 4. Agents must manage state explicitly

Multi-step agents cannot rely on the model to track progress across calls. State — task list, intermediate results, observations — lives in an external store (a database, a scratchpad file, a message list) and gets serialized back into each call. This is the boundary where stateless API calls meet [[harness-engineering]].

## What This Rules Out

- Storing secrets in "the conversation" expecting them to persist — they won't survive a fresh call.
- Assuming the model "remembers" a correction from earlier unless the correction is replayed.
- Treating system prompts as permanent — they are replayed on every call or they disappear.
- Expecting two different chat sessions to share any knowledge.

## What This Rules In

- Deterministic behavior from identical prompts — if you send the same bundle twice, you get the same distribution of outputs (up to sampling).
- Clean composition — every call is a pure function of its input; easy to test, replay, log, and cache.
- Transparent cost accounting — every token in, every token out, billed per call.

## Practical Rule

> When debugging "the model forgot X" or "the model is ignoring the role", stop asking *why the model forgot*. Start asking: **what did we actually send in this call?** In 95% of cases X is missing from the bundle — either never included, or pruned by the window.

## Relation to Related Concepts

- [[prompt-engineering]] — the reason prompt engineering exists at all. If calls were stateful, you would not need to resend role/context every time.
- [[context-engineering]] — the discipline of deciding *what* to put into the stateless bundle so the model has the right evidence.
- [[harness-engineering]] — the orchestration layer that decides how to assemble, prune, and replay state across multiple stateless calls.

## See Also

- [[context-engineering]]
- [[prompt-engineering]]
- [[harness-engineering]]
