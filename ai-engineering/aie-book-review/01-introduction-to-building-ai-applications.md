---
tags: [ai-engineering, foundation-models, llm, ai-stack, chip-huyen, study-guide, quiz]
source: https://github.com/chiphuyen/aie-book
---

# Chapter 1 — Introduction to Building AI Applications with Foundation Models

> [!abstract]+ Chapter at a glance
> Foundation models made powerful AI available as a ready-to-use commodity (an API call), which shifted the core engineering job from *training a model from scratch* to *adapting an existing model*. This chapter defines that new discipline — **AI engineering** — traces how we got here (language model → LLM → foundation model), surveys what people actually build, and lays out the three-layer stack and how the job differs from classic ML engineering.

## Core concepts

**The terminology ladder**
- **Language model** — assigns probabilities to sequences of tokens. A **token** is the basic unit (a word, subword, or character); the set of all tokens is the **vocabulary**. Subword tokenization is the usual compromise: smaller vocab than words, more meaning-dense than characters, and it handles unseen words gracefully.
- Two flavors:
  - **Masked language model** — fills in blanks using context on *both* sides (bidirectional). Good for *non-generative* understanding tasks (classification, sentiment, NER). Example: BERT.
  - **Autoregressive language model** — predicts the *next* token given everything before it (left-to-right). This is what powers text *generation*. Example: the GPT family. **This is the kind the rest of the book is about.**
- **Self-supervision** is the unlock. Instead of needing humans to label data, the model derives its labels from the data itself ("predict the next token"). This removed the **data-labeling bottleneck** and is what allowed training to scale to internet-sized corpora.
- **LLM → foundation model** — "large" is fuzzy and only describes size. **Foundation model** (term from Stanford, 2021) captures two things that matter more: it's **general-purpose** (one model, many tasks) and increasingly **multimodal** (text + image + audio + video).
- **Foundation model → AI engineering** — the process of *building applications on top of* these models. It's a distinct discipline precisely because you typically **don't train the model**; you adapt a readily available one.

**Why AI engineering is taking off now**
1. **General-purpose capability** expanded the set of solvable tasks → far larger addressable market.
2. **Massive investment** in AI, which compounds capability.
3. **Low barrier to entry** — you can build by prompting in natural language; you no longer need ML expertise or a training cluster to get started.

**Use-case taxonomy (8 categories)**
Coding · Image/video production · Writing · Education · Conversational bots · Information aggregation · Data organization · Workflow automation. Each has a **consumer** and an **enterprise** face (e.g., conversational bots = AI companion for consumers, customer-support copilot for enterprises).

**Planning an AI application (before you build)**
- **Evaluate the use case** — is AI genuinely the right tool, and is the use case valuable enough?
- **The role of AI** — is it *critical* (the product fails without it, high stakes) or *complementary* (a nice add-on)? Is it *reactive* or *proactive*? Does it *augment* a human or *automate* the task? These dimensions set your **risk tolerance** and quality bar.
- **Set expectations** — define what "good enough" means and tie it to a metric *before* building.
- **Plan milestones and maintenance** — foundation models and APIs change under you; plan for ongoing upkeep.

**The AI engineering stack — three layers**
1. **Application development** — prompt engineering, context construction, evaluation, the AI interface. *(Closest to the user; lowest barrier to entry; where most AI engineers spend time.)*
2. **Model development** — modeling & training, dataset engineering, finetuning, inference optimization. *(Adapting/altering the model itself.)*
3. **Infrastructure** — serving, compute/resource management, model & data stores, monitoring. *(Keeps it running at scale.)*

**AI engineering vs. ML engineering**
- You mostly work with models **you didn't train** → less feature engineering / model architecture work, more **adaptation** (prompting, context, finetuning).
- **Compute and latency** become first-class concerns because the models are huge.
- **Evaluation is much harder** — outputs are open-ended, so there's often no single correct answer to check against.
- **Context construction replaces feature engineering** as the central craft of feeding the model the right information.

## Quiz

**1.** What is the key architectural and use-case difference between a *masked* language model and an *autoregressive* language model? Which one underlies tools like ChatGPT, and why?

> [!example]- Show answer
> A **masked LM** predicts a hidden token using context from **both sides** (bidirectional) — great for *understanding* tasks like classification, sentiment, and NER (e.g., BERT). An **autoregressive LM** predicts the **next** token from left-to-right context only, which is what you need to *generate* text one token at a time. ChatGPT-style tools are autoregressive because generation is inherently a "produce the next token, append, repeat" process — you can't generate left-to-right with a model that needs the right-hand context to exist already.

**2.** Define self-supervision and explain why it was the pivotal enabler for modern language models.

> [!example]- Show answer
> **Self-supervision** means the training labels are derived from the input data itself rather than supplied by human annotators — e.g., "given these tokens, predict the next one." The label is just the next token already present in the text. This matters because the old bottleneck on scale was **manual labeling**: supervised learning needs expensive labeled datasets. Self-supervision removed that ceiling, letting models train on internet-scale unlabeled text and absorb broad knowledge — which is what made today's general-purpose capability possible.

**3.** Why does the book prefer the term *foundation model* over *large language model*?

> [!example]- Show answer
> "Large" only describes **size**, which is vague and not the point. **Foundation model** captures the two properties that actually matter: (1) it is **general-purpose** — one model adaptable to many downstream tasks (the "foundation" you build on), and (2) it is increasingly **multimodal** — not limited to language but spanning images, audio, and video. The term (coined at Stanford, 2021) reframes these models as a *base layer* for applications rather than just a big text predictor.

**4.** Give the three reasons Huyen offers for why AI engineering is emerging as a discipline *now*.

> [!example]- Show answer
> (1) **Expanded general-purpose capability** — foundation models can do far more tasks, dramatically enlarging the market for AI products. (2) **Surging investment** in AI, which accelerates capability. (3) **A low barrier to entry** — you can build useful things by prompting in natural language, without ML training expertise or a GPU cluster. Together these pulled application-building away from ML researchers and toward general software engineers.

**5.** Name the three layers of the AI engineering stack and give one concrete task that lives in each.

> [!example]- Show answer
> (1) **Application development** — e.g., writing and versioning prompts, constructing context (RAG), building the chat interface, evaluating outputs. (2) **Model development** — e.g., finetuning a model with LoRA, building a finetuning dataset, optimizing inference. (3) **Infrastructure** — e.g., serving the model behind an API, managing GPU compute, monitoring latency and quality in production. The application layer has the lowest barrier to entry and is where most AI engineers concentrate.

**6.** State two ways AI engineering differs from traditional ML engineering, beyond "the models are bigger."

> [!example]- Show answer
> Any two of: (a) You typically work with models you **didn't train**, so the job centers on **adaptation** (prompting, context, finetuning) rather than model architecture and feature engineering. (b) **Evaluation is much harder** because outputs are open-ended and often have no single ground-truth answer. (c) **Context construction replaces feature engineering** as the core craft. (d) **Inference compute and latency** are first-class constraints because the models are enormous and run on expensive accelerators.

**7.** *(Applied)* Your team is deciding whether AI should play a **critical** vs. a **complementary** role in a new feature. Why does this distinction shape the rest of your engineering plan?

> [!example]- Show answer
> If AI is **critical**, the product *fails* when the model fails — stakes are high, so you need a much stronger quality bar, rigorous evaluation, guardrails, fallback paths, and possibly a human in the loop. If AI is **complementary** (a helpful extra on top of a product that works without it), you can tolerate more error, ship faster, and treat the model's output as a suggestion. The distinction sets your **risk tolerance**, which cascades into how much you invest in evaluation, monitoring, and safety — and even whether the use case is worth doing with current model reliability at all.

**8.** Why is "context construction" called the new "feature engineering"?

> [!example]- Show answer
> In classic ML, you hand-craft **features** — the structured inputs that determine what the model can learn from. With foundation models you don't redesign inputs into features; instead you decide **what information to place in the model's context window** (instructions, examples, retrieved documents, tool outputs). Getting the right, relevant, well-formatted context into the prompt is now the highest-leverage way to control output quality — which is exactly the role feature engineering played before. Both are "shape the input so the model can succeed."

**9.** A founder says, "We'll just call the API, so there's basically no engineering left to do." Where does this view break down?

> [!example]- Show answer
> The API call is the *easy* part. Real engineering remains in: **evaluation** (how do you know the open-ended output is good?), **context construction / RAG** (feeding the model the right knowledge), **latency and cost** management at scale, **guardrails and safety**, **prompt versioning and iteration**, and **monitoring** for quality regressions as the underlying model changes under you. The low barrier to entry gets you a demo; the discipline of AI engineering is what gets you a reliable product. (This tension — easy to start, hard to make reliable — is a recurring theme of the whole book.)

**10.** *(Applied)* Walk through how you'd evaluate whether a proposed AI feature is a *good fit* before writing any code.

> [!example]- Show answer
> (1) **Is AI the right tool?** — does the task need the open-ended, generative capability foundation models provide, or would a cheaper deterministic approach work? (2) **What's the role of AI?** — critical vs. complementary, automate vs. augment, reactive vs. proactive → sets the quality bar and risk tolerance. (3) **Define "good enough"** — pick a success metric and threshold *now*, tied to a business outcome. (4) **Estimate feasibility** — can current models hit that bar, and at acceptable cost/latency? (5) **Plan milestones and maintenance** — because models and APIs drift, budget for ongoing evaluation and upkeep. If the use case can't clear these, it's better to know before building.

## Deeper understanding (expansion)

> [!info]+ 💡 The supervision bottleneck — why self-supervision is the whole ballgame
> Before self-supervision, the scaling story stalled on **labels**, not compute or model size. Every additional capability needed more human-labeled examples, and humans are slow and expensive. Self-supervision changed the unit economics: the "label" is free because it's already in the text (the next token). This is why the field's progress suddenly tracked *data and compute scale* rather than *annotation budgets* — and it's the deep reason "just throw more data at it" became a viable strategy. Keep this in mind for Chapter 8 (Dataset Engineering): even there, the expensive part is still human-labeled *instruction* and *preference* data, because those genuinely can't be self-supervised.

> [!info]+ 💡 The stack maps to org design
> The three layers aren't just conceptual — they often map to **who owns what**. The application layer tends to be owned by product/AI engineers close to the user; model development by an ML/research-leaning team; infrastructure by platform/SRE. When a project stalls, it's frequently because a problem at one layer (say, latency in infra) is being "fixed" at the wrong layer (prompt tweaks in app). Knowing which layer a problem actually lives in is a practical debugging heuristic the book sets up here and pays off in Chapter 9 (inference) and Chapter 10 (architecture).

> [!info]+ 💡 "Augment vs. automate" is a product decision disguised as a technical one
> Whether the AI *augments* a human (suggests, drafts, assists — human stays in the loop) or *automates* (acts on its own) is usually framed as a capability question ("is the model good enough to automate?"). But it's really a **risk and UX** decision. Augmentation keeps a human as the error filter, so you can ship with a weaker model; automation removes that filter, so the same model now needs far higher reliability and guardrails. A pragmatic path many products take: ship as augmentation first, collect feedback (Chapter 10), and graduate specific high-confidence flows to automation once evaluation proves they're safe.

## Connections

- **→ Chapter 2** opens up the foundation model itself — how the autoregressive model from this chapter is actually trained, scaled, and made to follow instructions.
- **→ Chapters 3–4** tackle the "evaluation is harder" claim head-on: it's the book's recurring hard problem.
- **→ Chapter 10** returns to this chapter's stack and planning ideas at full production scale (architecture + feedback loops).
- See also the repo summary: [[chip-huyen-ai-engineering-book_3abc60d3]].
