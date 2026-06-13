---
tags: [foundation-models, transformers, scaling-laws, rlhf, sampling, post-training, chip-huyen, study-guide, quiz]
source: https://github.com/chiphuyen/aie-book
---

# Chapter 2 — Understanding Foundation Models

> [!abstract]+ Chapter at a glance
> You can't make good adaptation decisions without understanding what you're adapting. This chapter opens the model: the **training data** that shapes its biases, the **transformer architecture** and how **scale** drives capability (scaling laws), the **post-training** steps (SFT + preference tuning) that turn a raw next-token predictor into a helpful assistant, and finally **sampling** — the act of generation itself, which explains why models are inconsistent and why they hallucinate.

## Core concepts

**Training data — the model is what it eats**
- Foundation models are trained on enormous web corpora (e.g., Common Crawl, often cleaned into sets like C4). Whatever is over- or under-represented in that data becomes a model bias.
- **Language distribution**: English vastly dominates the web, so models are strongest in English and weaker in low-resource languages — even "multilingual" ones.
- **Domain-specific data**: general web data underrepresents specialized domains (medicine, law, code, DNA sequences). Strong performance there needs **targeted data**, not just more general data.
- **Takeaway**: data composition is a *design choice* with downstream consequences; "scrape everything" is itself a decision with biases baked in.

**Modeling — architecture and scale**
- **The transformer** dominates. Its core is the **attention mechanism**: each token builds **query (Q)**, **key (K)**, and **value (V)** vectors; attention scores how much each token should attend to every other token (Q·K), then takes a weighted sum of values. This lets the model handle **long-range dependencies** that older seq2seq/RNN models struggled with.
- Attention's cost is **quadratic** in sequence length — the central efficiency bottleneck (revisited in Chapter 9).
- **Model size** is measured in **parameters** and training **FLOPs**; capability also depends on the **number of training tokens**.
- **Scaling laws** (Chinchilla): for a fixed compute budget there is a **compute-optimal** balance between model size and training tokens. The finding: many early models (e.g., GPT-3) were **undertrained** — too many parameters for too few tokens. The practical rule of thumb that came out of it is roughly **~20 training tokens per parameter**.
- The bottleneck on capability has been **shifting from compute to data** — we may run out of high-quality public text before we run out of compute.
- **Inverse scaling**: on some tasks, bigger models do *worse* — a reminder that scale isn't monotonic magic.

**Post-training — from raw predictor to assistant**
A pretrained model is good at **completion**, not at **conversation or instruction-following**. Two post-training stages fix this:
1. **Supervised finetuning (SFT)** — train on high-quality **(instruction, response) demonstration** pairs so the model learns to follow instructions and adopt an assistant format.
2. **Preference finetuning** — align outputs to **human preferences** (helpful, honest, harmless):
   - **RLHF**: train a **reward model** on human comparisons of outputs, then use RL (e.g., PPO) to push the model toward higher-reward responses.
   - **DPO**: a simpler, RL-free alternative that optimizes directly on preference pairs.
   - **Key insight**: human preference is too complex to capture perfectly — every alignment method is an **approximation** of a fuzzy target.

**Sampling — how generation actually happens (and why it's weird)**
- At each step the model outputs a **probability distribution** over the whole vocabulary; generation **samples** the next token from it. Generation is **probabilistic**, not deterministic — this is the root cause of inconsistency.
- **Sampling controls**:
  - **Temperature** — scales the distribution. Low temp → sharper/more deterministic; high temp → flatter/more random/creative.
  - **Top-k** — sample only from the k most likely tokens.
  - **Top-p (nucleus)** — sample from the smallest set of tokens whose cumulative probability ≥ p.
  - **Logprobs** — the log-probabilities of tokens; useful for confidence, evaluation, and classification.
- **Test-time compute** — spend more compute at inference to get better answers: e.g., **best-of-N** sampling (generate many, pick the best), beam search, self-consistency. Trades latency/cost for quality.
- **Structured outputs** — force valid formats (JSON, a schema, an enum) via **constrained sampling** (mask out invalid tokens) or prompting + finetuning.
- **The probabilistic nature explains two failure modes**:
  - **Inconsistency** — same input, different outputs (because sampling is random).
  - **Hallucination** — confident but wrong output. Two leading hypotheses: (1) the model can't cleanly distinguish what it **knows** from what it's **generating**, and (2) **snowballing** — an early wrong token commits the model to a wrong path it then rationalizes. A contributing cause: SFT data that teaches the model to answer even when it lacks the knowledge.

## Quiz

**1.** In the attention mechanism, what are the query, key, and value vectors doing, and what problem does attention solve that older architectures struggled with?

> [!example]- Show answer
> For each token, attention computes a **query** (what this token is looking for), a **key** (what each token offers), and a **value** (the content to retrieve). The dot product of a token's query with every key gives **attention scores** (how much to attend to each other token); these weight a sum of the **values**. This lets every token directly "look at" every other token regardless of distance, solving the **long-range dependency** problem that RNN/older seq2seq models handled poorly (information had to pass step-by-step and decayed). The cost is **quadratic** attention compute in sequence length.

**2.** State the core finding of the Chinchilla scaling-law work and its practical implication.

> [!example]- Show answer
> For a **fixed compute budget**, there's a **compute-optimal trade-off** between model size (parameters) and the number of training tokens. Chinchilla showed that prior large models (like GPT-3) were **undertrained** — too many parameters relative to data — and that a smaller model trained on more tokens can beat a bigger, data-starved one. Practical rule of thumb: roughly **~20 tokens per parameter**. Implication: don't just scale parameters; scale data with it — and capability is increasingly **data-bound**, not compute-bound.

**3.** Why does a pretrained (pre-post-training) model need SFT and preference tuning before it's a usable assistant?

> [!example]- Show answer
> Pretraining optimizes for **completion** — predicting the next token of arbitrary internet text. That doesn't make a model that *follows instructions* or *converses helpfully*; ask it a question and it might continue with more questions because that's a plausible text continuation. **SFT** on (instruction, response) demonstrations teaches the instruction-following format. **Preference finetuning** (RLHF/DPO) then aligns *which* responses it favors toward human preferences — helpful, honest, harmless. Without these, you have a knowledgeable text predictor, not an assistant.

**4.** Compare RLHF and DPO at a high level.

> [!example]- Show answer
> Both align a model to **human preference data** (humans compare/rank outputs). **RLHF** does it in two stages: train a separate **reward model** to predict human preference, then use **reinforcement learning** (e.g., PPO) to optimize the LM against that reward. It's powerful but complex and unstable. **DPO (Direct Preference Optimization)** skips the explicit reward model and RL loop, optimizing the LM **directly** on preference pairs with a simpler supervised-style objective. DPO is easier and more stable to train; RLHF is the original, more flexible approach. Both are **approximations** of an inherently fuzzy human-preference target.

**5.** Explain temperature, top-k, and top-p. If you wanted *more deterministic, factual* output, how would you set them?

> [!example]- Show answer
> The model emits a probability distribution over the vocabulary each step. **Temperature** rescales it: <1 sharpens (more deterministic), >1 flattens (more random/creative). **Top-k** restricts sampling to the k highest-probability tokens. **Top-p (nucleus)** restricts to the smallest set of tokens whose cumulative probability reaches p. For deterministic/factual output, use a **low temperature** (near 0) so the model almost always takes the most likely token; top-k/top-p then matter less but you'd keep them tight. (Note: even temp 0 isn't perfectly reproducible across systems due to implementation details.)

**6.** What is "test-time compute," and give one concrete technique?

> [!example]- Show answer
> **Test-time compute** means spending **more compute at inference** (not training) to improve answer quality. Concrete technique: **best-of-N** — generate N candidate responses and select the best (e.g., by a reward model or self-consistency vote). Others: beam search, self-consistency (sample multiple chains of thought, take the majority answer). The trade-off is **latency and cost for accuracy**, and it's the paradigm behind reasoning models — sometimes "think longer" beats "use a bigger model."

**7.** Name the two failure modes that follow directly from the probabilistic nature of generation, and explain the leading hypotheses for hallucination.

> [!example]- Show answer
> (1) **Inconsistency** — identical input can yield different outputs because the next token is **sampled** from a distribution. (2) **Hallucination** — fluent, confident, but false output. Leading hypotheses: (a) the model **can't cleanly separate what it actually knows from what it is generating**, so it fills gaps with plausible-sounding text; and (b) **snowballing/self-delusion** — once an early token commits to a wrong claim, the model continues consistently with that wrong premise. A contributing factor is **SFT data that always answers**, training the model to produce an answer even when it lacks the underlying knowledge (it never learned to say "I don't know").

**8.** Why are even "multilingual" foundation models typically weaker in low-resource languages?

> [!example]- Show answer
> Because capability tracks **training-data representation**, and the web is overwhelmingly **English** (plus a handful of other high-resource languages). A low-resource language simply has far fewer tokens in the corpus, so the model sees less of it and learns it less well — fewer examples of grammar, idiom, and domain knowledge. "Multilingual" means it *covers* the language, not that it's *equally good* at it. Fixing this requires deliberately sourcing targeted data, not just scaling general web scraping.

**9.** What are structured outputs and what are two ways to obtain them?

> [!example]- Show answer
> **Structured outputs** constrain generation to a valid format — JSON, a specific schema, an enum, or syntactically valid code — so downstream systems can parse the result reliably. Two approaches: (1) **Constrained / guided sampling** — at each step, **mask out tokens** that would violate the format so only valid continuations are sampled (guarantees validity). (2) **Prompting and/or finetuning** — instruct or train the model to emit the format; cheaper to set up but not guaranteed, so you still validate/repair. Structured output is what makes models usable as components in larger pipelines and agents.

**10.** *(Synthesis)* A teammate says, "Let's just raise temperature to make the model more creative for our brainstorming feature." What trade-off should you flag, and how does this connect to hallucination?

> [!example]- Show answer
> Higher temperature **flattens** the distribution, so the model samples lower-probability tokens more often — genuinely more diverse/creative, but also more likely to wander into **incoherent or false** content. For brainstorming (where novelty is the goal and accuracy matters less) that's an acceptable trade; for anything factual it raises **hallucination and inconsistency** risk. The deeper point: creativity and hallucination are the *same dial* viewed from two sides — both come from the model committing to less-likely continuations. The right setting depends entirely on whether the task rewards novelty or correctness.

## Deeper understanding (expansion)

> [!info]+ 💡 "The model is what it eats" — why data composition is an architectural decision
> It's tempting to treat training data as a commodity ("just scrape the web"). But every inclusion/exclusion is a design choice that shows up as a capability or a bias: English dominance → weak low-resource languages; web text → underrepresented specialist domains; forum/Reddit-heavy corpora → particular tones and failure modes. When you later evaluate a model (Chapters 3–4) or decide whether to finetune (Chapter 7), you're often really compensating for what the *training data* did or didn't contain. Reading a model card's data description tells you where it will be strong and weak before you run a single test.

> [!info]+ 💡 Alignment is approximation — and that's permanent
> The book's framing that "human preference is too complex for any single formula" is worth internalizing: RLHF and DPO don't *solve* alignment, they **approximate a moving, fuzzy target**. This has practical consequences. It's why models can be simultaneously over-cautious (refusing benign requests) and exploitable (jailbroken) — the approximation has gaps in both directions. It's why alignment behavior drifts between model versions. And it's why you can't outsource your safety story entirely to the base model's alignment; you need your own guardrails (Chapter 10). Treat the model's "values" as an imperfect statistical artifact, not a reliable contract.

> [!info]+ 💡 Sampling unifies three things the book keeps coming back to
> Once you see generation as **sampling from a distribution**, several later topics click into place. **Evaluation** (Ch 3): logprobs/perplexity are just reading that distribution. **Inconsistency in testing** (Ch 3–4): same prompt, different sample → you must evaluate over multiple runs, not one. **Inference optimization** (Ch 9): speculative decoding works by having a small model *guess the sample* and a big model verify it. **Reasoning** (test-time compute): sample many paths, aggregate. The single mental model — "the model proposes a distribution; sampling picks from it" — is the load-bearing idea of the whole book.

## Connections

- **← Chapter 1** introduced the autoregressive model and tokens; this chapter explains how it's trained and how it generates.
- **→ Chapter 3** turns the sampling/logprob machinery into evaluation metrics (perplexity, cross-entropy).
- **→ Chapter 5** (prompt engineering) and **→ Chapter 7** (finetuning) are the two main levers for steering the post-trained model further.
- **→ Chapter 9** revisits attention's quadratic cost and the KV cache as the central inference-optimization targets.
- See also: [[chip-huyen-ai-engineering-book_3abc60d3]].
