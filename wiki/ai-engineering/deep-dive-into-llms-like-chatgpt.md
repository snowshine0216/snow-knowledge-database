---
tags: [llm, chatgpt, pretraining, tokenization, post-training, reinforcement-learning, rlhf, hallucinations, deepseek-r1, alphago, karpathy]
source: https://www.youtube.com/watch?v=7xTGNNLPyMI
---
# Deep Dive into LLMs like ChatGPT

Andrej Karpathy's 3.5-hour general-audience walkthrough of the **entire pipeline** behind ChatGPT-like models, answering "what happens when you type in the box and hit enter?" It is the comprehensive successor to his earlier [[state-of-gpt]] talk. The unifying mental model: an LLM's reply is a **"neural network simulation of a human data labeler"** following a company's labeling instructions — running a *fixed, finite amount of compute per token* — not a magical oracle. Every practical quirk (hallucination, tool use, spelling/counting failures, jagged intelligence) follows from this.

## Key Concepts
- **Three training stages**: (1) **Pre-training** — compress the filtered internet (Hugging Face FineWeb: ~44 TB / 15 trillion tokens) into a **base model**, a next-token predictor; (2) **Supervised fine-tuning (SFT)** — swap the dataset for ~1M human/assistant **conversations** to make an assistant; (3) **Reinforcement learning** — let the model discover its own solution token-sequences against verified answers.
- **Tokenization**: text → bytes → **byte-pair encoding** into ~100k symbols (GPT-4: 100,277). Models "see tokens, not characters," which is *why* spelling ("R's in strawberry") and counting fail. Fix: tell the model to "**use code**."
- **Base model = lossy compression**: the 405B-param Llama 3.1 base is "a zip file of the internet" — a stochastic autocomplete that regurgitates frequent facts and hallucinates rare ones; usable via few-shot / in-context learning.
- **Parameters vs. context window**: "**Knowledge in parameters is a vague recollection; knowledge in the context window is working memory.**" Hence paste sources into the prompt rather than trusting recall.
- **Models need tokens to think**: fixed compute per token (~100 layers) means reasoning must be **distributed across many tokens** — never demand a one-token leap.
- **Hallucination mitigations**: (1) interrogate the model and train "**I don't know**" on things it consistently gets wrong (Meta's Llama 3 factuality procedure, using an LLM judge); (2) **tool use** — special `<search_start>` / code-interpreter tokens that load results into the context window.
- **Reasoning models & RL**: DeepSeek-R1 showed **chains of thought emerge** from RL ("wait, that's an aha moment") without hardcoding — only correct answers are supplied. [[alphago]]'s "move 37" (~1-in-10,000 human probability) proves RL can **exceed human strategies**, unconstrained by imitation.
- **RLHF is "not RL"**: for unverifiable domains (jokes, poems), a **reward model** imitates human *rankings* so RL can run automatically — but the reward model is **gameable** (adversarial "the the the" scores 1.0), so it must be cropped after a few hundred updates. Real RL scales indefinitely only in **verifiable** domains (math, code, Go).
- **Jagged / Swiss-cheese intelligence**: Olympiad-level yet fails "is 9.11 > 9.9?" (Bible-verse neurons fire) — capability has unpredictable holes; always verify.

## Key Numbers

| Fact | Value |
|------|-------|
| FineWeb pretraining corpus | ~44 TB / 15 trillion tokens |
| GPT-4 tokenizer vocabulary | 100,277 symbols |
| GPT-2 (2019) | 1.6B params, 1,024 context, ~100B tokens; ~$40k then → ~$600 now |
| Llama 3.1 flagship base | 405B params, 15T tokens |
| Pre-training vs. SFT wall-clock | ~3 months vs. ~3 hours |
| Naive RLHF human ratings | 1B (1,000 × 1,000 × 1,000) → RLHF cuts to ~5,000 rankings |
| Karpathy's usage mix | ~80–90% GPT-4o; thinking models for hard math/code only |

## Key Takeaways
- Demystify the tool: you're getting a **statistical simulation of a skilled labeler**, plus emergent RL reasoning in "thinking" models (o1/o3, DeepSeek-R1) — capable in principle of an open-domain "move 37," but still primordial and strongest in verifiable domains.
- Match model tier to task: fast SFT models for knowledge/simple queries; reserve slow **thinking models** for hard reasoning.
- Push computation out of the model when correctness matters: **use code/tools** for arithmetic, counting, and spelling; **paste sources** into context instead of relying on parametric memory.
- Treat every consequential output as **unverified**: "check their work and own the product of your work — use them for inspiration and first drafts, but always verify."

## See Also
- [[state-of-gpt]] — Karpathy's earlier (Build 2023) four-stage GPT pipeline talk; this video is its expanded successor
- [[alphago]] — RL surpassing human imitation; the "move 37" precedent for LLM reasoning
- [[context-engineering]] — the discipline built on the parameters-vs-working-memory distinction
- [[llm-api-statelessness]] — why the context window is the model's only per-call memory
- [[harness-engineering]] — orchestrating reliable agent execution atop these models
