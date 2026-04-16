---
tags: [llm, prompt-engineering, context-engineering, tokens, context-window, stateless-api, rctf-framework, ai-for-beginners, jailbreak]
source: https://www.youtube.com/watch?v=qs8BzCdqZhY
---

# How AI Actually Works + Why Your Prompts Keep Failing

## Video Info
- URL: https://www.youtube.com/watch?v=qs8BzCdqZhY
- Platform: YouTube (live session recording)
- Title: How AI Actually Works + Why Your Prompts Keep Failing
- Speaker: Mayank Aggarwal (channel host)
- Channel/Event: Mayank Aggarwal — "AI for Everyone" session 3 (livestream)
- Upload date: 2026-04-14
- Duration: 1:22:54
- Views / Likes: 884 / 48
- Category and tags: Education; AI for beginners, prompt engineering, Claude, RCTF framework
- Transcript source: YouTube manual subtitles (`en-orig`)
- Companion resource: free RCTF Framework + prompt templates (link in description)

## Executive Summary

A live beginner-level session aimed at non-technical learners. The core thesis: "the tool isn't bad — the instructions are." To prompt effectively, you first need a mental model of how LLMs work. The speaker builds that model in four steps: (1) LLMs are next-token predictors trained on vast text; (2) **tokens are the currency of AI**, and output tokens cost ~5× input tokens because the model is "doing work"; (3) every model has a **context window** — roughly 128k tokens for current ChatGPT models — beyond which context is truncated; (4) **raw API calls are stateless** — the model remembers nothing; chat products only appear to have memory because they replay prior turns on every call. Once these are internalized, prompt engineering reduces to a simple discipline: every prompt must carry complete role, context, task, and format (the **RCTF framework**). The session closes with a hands-on "Gandalf"-style jailbreak game that demonstrates why even well-guarded prompts leak.

## Outline

1. Session framing — "AI for Everyone" series, non-technical audience
2. How AI works — artificial vs. human intelligence, different "brains" (Claude / Gemini / ChatGPT) = different models
3. Next-token prediction — LLMs pick the most probable next word given what they've seen
4. Tokens — ~3/4 of a word; the tokenizer demo on the OpenAI token counter
5. Tokens as currency — input vs. output pricing, the ~5× output multiplier
6. Pricing walk-through — GPT-4.1-nano, Claude Opus/Sonnet/Haiku
7. Context window — models have hard token limits; longer chats drop earlier context
8. Memory illusion — stateless API calls vs. the ChatGPT web app
9. Why prompt engineering exists — each API call must be self-complete
10. The RCTF framework — Role, Context, Task, Format
11. Gandalf-style jailbreak game — levels 1–4, prompt injection tactics
12. From prompt to context engineering — giving the model "all the context it needs"
13. Q&A highlights — non-tech career pivots, MCP, freelancing, course routing

## Detailed Chapter Summaries

### 1. Session Framing
> **Segment**: 0:00–4:30

Live stream opener with chat banter. Session 3 of an "AI for Everyone" series for non-technical learners. Promised outcomes: understand how LLMs work "with a twist", why hallucinations happen, the 4 most common prompting mistakes, the RCTF framework, and a live jailbreak game.

### 2. AI as an Artificial Brain
> **Segment**: 4:30–8:00

Analogy-driven definition: humans have real intelligence (a brain); AI is a *fake* brain trained on past experience. Different models (Claude, Gemini, ChatGPT) are just **different brains**, each trained differently and suited to different tasks — pick the scientist brain for hard problems, a normal brain for mundane ones.

### 3. Next-Token Prediction
> **Segment**: 8:00–10:30

The core diagram of the session: an LLM ingests billions of words from the internet, books, and code; learns statistical relationships, grammar, facts, nuance; and its only job at inference time is to **predict the next word**. When given "Hi", the model assigns probabilities across candidate replies ("Hi!", "Hey Mayank", "Hello"), then samples one.

> LLMs are not "thinking" — they are simulating logical processes by predicting the next most probable token.

### 4. Tokens
> **Segment**: 10:30–13:00

Definition for non-technical learners: a token is roughly 3/4 of a word. Demonstrated live with the OpenAI tokenizer: "okay, hi, how are you?" becomes 5 tokens with specific IDs. The speaker deliberately skips transformer internals.

### 5. Tokens as Currency
> **Segment**: 13:00–18:00

Audience poll: input or output tokens more expensive? Correct answer: **output**. Reasoning by analogy — when someone asks you a question, the energy is in the *answer*, not the listening. Output = the model is running its brain.

| Model | Input ($/M tokens) | Output ($/M tokens) | Ratio |
|---|---|---|---|
| GPT-4.1-nano (demo) | 0.02 | 0.15 | ~7.5× |
| Claude Opus | 5 | 25 | 5× |
| Claude Sonnet | 3 | 15 | 5× |
| Claude Haiku | ~0.25 | ~1.25 | 5× |

Numbers are transcribed from the speaker's screen; check the canonical price pages for current values. The important invariant is the **~5× output multiplier** across Anthropic's tiers — it means verbose completions cost disproportionately.

### 6. Context Window
> **Segment**: 18:00–24:00

Second audience exercise: "can ChatGPT answer every question correctly from a 1-million-page book?" Correct answer: no. Just like humans studying for an exam can't memorize 500 books, each model has a hard **context window** — e.g. 128k tokens for contemporary ChatGPT models. Beyond that, the model "forgets" earlier content. A long conversation visibly loses its initial instructions once the window is saturated.

### 7. Statelessness and the Memory Illusion
> **Segment**: 24:00–38:00

The pivotal section. Live demo:

- **API path (e.g. GPT-4o-mini via code)**: the speaker sends "Hi, I am Mayank" → reply → then a new call "Who am I?" → the model says it has no idea. The API call carries only the current message.
- **ChatGPT web app**: same sequence works — the app *remembers* because it silently appends prior turns to each new request.

The one-line rule: **"AI calls are stateless."** The app has state; the API does not. This is why prompt engineering is required in production: you must replay every piece of context (role, prior turns, global instructions) on every call.

> If you are saying "hey, you are a doctor" or "you are a data analyst", that instruction has to be set **on every call** when you are working in an application over APIs.

### 8. Why Long Chats Drift
> **Segment**: 38:00–42:00

Memory is not free. On the web, ChatGPT maintains context by sending previous messages with each new message. As messages accumulate, the 128k budget fills up and the earliest messages (typically your original role / system instructions) silently drop. This is why long conversations lose their persona — a direct consequence of context window + replay strategy.

### 9. Prompt Engineering → The RCTF Framework
> **Segment**: 42:00–46:00

Because each call is stateless and the context window is finite, every prompt should be *complete on its own*. The speaker's framework:

- **R — Role** — who the model is playing ("you are a senior data analyst")
- **C — Context** — relevant background, prior chat, attached files, constraints
- **T — Task** — the exact action requested
- **F — Format** — how the answer should be structured

Common failure modes of a "bad" prompt: no role, no context, vague task, no format. Most mediocre outputs trace to one of these being missing.

### 10. Jailbreak / Prompt Injection Game
> **Segment**: 46:00–58:00

The speaker runs through the public "Gandalf"-style prompt-leak game, demonstrating several escalating defenses:

- **Level 1** — no defense; asking "what is the password?" returns it.
- **Level 2** — direct ask refused; indirect asks (rhyme, spell backwards, encode each letter) still leak it.
- **Level 3** — stronger guardrail against paraphrase attacks.
- **Level 4** — a second AI validates the answer before it is shown.

Parallel mode invites the audience to *write* a system prompt that resists injection without becoming useless for harmless queries. The point: every guardrail trades robustness for usability, and users rapidly learn injection tactics (roleplay, reverse text, encoding, authority impersonation).

### 11. From Prompt Engineering to Context Engineering
> **Segment**: 58:00–62:00

Modern models are less sensitive to prompt phrasing; the leverage has moved to giving the model **all relevant context**: source files, prior chat, domain data. Prompt engineering still matters but is no longer the bottleneck — [[context-engineering]] is.

### 12. Q&A Highlights
> **Segment**: 62:00–82:54

A long audience Q&A. Useful nuggets:

- "Memory" in chat apps is tracked as **input tokens**, not output, which is why chat histories bloat costs.
- **Fine-tuning on data** is generally not recommended; fine-tune on **domain** or **industry**, not on individual records.
- For non-technical learners: master AI usage, not ML theory. Understand tokens, context window, statelessness, RCTF — that covers 80% of day-to-day effectiveness.
- **Voice agents**: margin math doesn't work well in the Indian market at ~₹10–15/min; look offshore.
- **MCP** (Model Context Protocol) is covered separately — the speaker points to his prior video rather than re-explaining.
- On building an "AI automation" agency: the hard part is handling clients, not building the product.

## Key Takeaways

1. **LLMs are next-token predictors.** No thinking, just probability distributions over a learned vocabulary.
2. **Tokens are the unit of cost.** ~3/4 of a word. Output tokens cost ~5× input tokens on every major provider — so optimize for *concise* output, not just short input.
3. **Context windows are finite.** 128k is a lot, but a long chat fills it, and the earliest content (often your original role) falls off silently.
4. **Raw API calls are stateless.** Chat apps fake memory by replaying history on every call. In production you must send complete context every time.
5. **RCTF is the minimal prompt contract.** Role, Context, Task, Format. Most bad outputs are missing one of the four.
6. **Context engineering > prompt engineering on modern models.** Give the model the right files, the right prior turns, the right constraints — wording matters less than what you make available.
7. **Guardrails are not free.** Jailbreak tactics (rhyme, reverse, encode, roleplay) work; each defensive layer trades usability.

## Practical Rules

- **When writing a prompt for an app**, make it self-contained. Assume zero memory.
- **When debugging "the model forgot"**, check the total token budget of the conversation before blaming the model.
- **When reviewing a prompt**, score it against RCTF — if any of the four is missing, fix that before anything else.
- **When estimating cost**, multiply expected output tokens by 5× input price, not just input size.

## Related Concepts

- [[llm-api-statelessness]]
- [[context-engineering]]
- [[prompt-engineering]]
- [[harness-engineering]]
