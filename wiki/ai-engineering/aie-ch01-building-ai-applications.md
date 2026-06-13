---
tags: [ai-engineering, foundation-models, llm, ai-stack, chip-huyen]
source: https://github.com/chiphuyen/aie-book
---

# AIE Ch.1 — Building AI Applications with Foundation Models

The opening chapter of *AI Engineering* defines the discipline that emerged once foundation models became API-accessible: the core job shifted from **training a model** to **adapting an existing one**. Full review pack with quiz: [[01-introduction-to-building-ai-applications]].

## Key Concepts

- **Terminology ladder**: language model → LLM → foundation model → AI engineering. A **language model** assigns probabilities to token sequences; **masked** LMs (bidirectional, e.g., BERT) suit understanding tasks, while **autoregressive** LMs (next-token, e.g., GPT) power generation and underlie the whole book.
- **Self-supervision** is the unlock — labels derive from the data itself ("predict the next token"), removing the manual-labeling bottleneck and enabling internet-scale training.
- **Foundation model** (vs. "LLM") emphasizes two properties that matter more than size: **general-purpose** (one model, many tasks) and increasingly **multimodal**.
- **Why now**: expanded general-purpose capability (bigger market), surging investment, and a **low barrier to entry** (build by prompting in natural language).
- **Use-case taxonomy (8 categories)**: coding, image/video, writing, education, conversational bots, information aggregation, data organization, workflow automation — each with consumer and enterprise faces.
- **Planning an application**: judge the **role of AI** — *critical* (high stakes, product fails without it) vs. *complementary*; *augment* (human in loop) vs. *automate*. This sets the risk tolerance and quality bar.

## The AI Engineering Stack (3 layers)

| Layer | Example tasks |
|---|---|
| Application development | prompt engineering, context construction, evaluation, interface |
| Model development | finetuning, dataset engineering, inference optimization |
| Infrastructure | serving, compute management, model/data stores, monitoring |

## Key Takeaways

- AI engineering differs from ML engineering: you work with models you **didn't train**, **context construction replaces feature engineering**, evaluation is harder (open-ended), and inference cost/latency are first-class.
- The "low barrier to entry" gets you a demo; the discipline is what makes it reliable — evaluation, guardrails, and monitoring remain hard.
- The three-layer stack maps cleanly onto **org design** (who owns app vs. model vs. infra). See [[ai-engineering-three-patterns]].

## See Also

- [[chip-huyen-ai-engineering-book]] (book overview hub)
- [[aie-ch02-understanding-foundation-models]] (next chapter)
- [[context-engineering]]
- [[state-of-gpt]]
