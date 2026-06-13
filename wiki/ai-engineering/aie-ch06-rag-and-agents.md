---
tags: [rag, agents, retrieval, embeddings, bm25, vector-search, tools, planning, memory, chip-huyen]
source: https://github.com/chiphuyen/aie-book
---

# AIE Ch.6 — RAG and Agents

Two ways to give a model more than its prompt: feed it the right **knowledge** (RAG) and give it the ability to **act** (agents). An agent is a generalized RAG. Full review pack with quiz: [[06-rag-and-agents]].

## RAG

- **Pattern**: retrieve → augment prompt → generate. A **retriever** (indexing offline + querying online) feeds a **generator**.
- **Retrieval algorithms**:
  - **Term-based (sparse)** — BM25/TF-IDF/Elasticsearch. Fast, strong baseline; misses synonyms.
  - **Embedding-based (dense)** — vector similarity via a vector DB + **ANN**. Captures meaning; costs more.
  - **Hybrid** — BM25 recall + semantic rerank, usually best.
- **The retriever is the bottleneck** — a RAG generation error is usually a **retrieval** miss. Debug retrieval first (measure context **precision/recall**).
- **Optimization**: chunking strategy, **reranking** (cross-encoder on a shortlist), query rewriting, contextual retrieval.

## Agents

- **Agent = model + tools + planning loop.** Tools: **knowledge augmentation** (read), **capability extension** (calculator, code), and **write actions** (change state — the dangerous category).
- **Planning** is the bottleneck: decouple planning from execution, use **function calling**, add **reflection/error-correction** ([[agentic-loop-self-correction]]), and curate the toolset.
- **Failure modes**: wrong tool/args, infinite loops, over-trusting noisy tool output. Errors **compound** across long trajectories → keep plans short. See [[react-paradigm]], [[two-stage-react]].
- **Memory**: short-term (in-context) + long-term (external store the agent reads/writes). Management via FIFO, summarization, reflection-to-insights — essentially **RAG over the agent's own history**. See [[filesystem-as-memory]].

## Key Takeaways

- **RAG = knowledge, finetuning = behavior** (and most systems need both — see [[aie-ch07-finetuning]]).
- **Every tool is an attack surface** — write actions + indirect injection ([[aie-ch05-prompt-engineering]]) = real-world blast radius. Sandboxing, least privilege, and human approval are non-negotiable ([[defense-in-depth]]).

## See Also

- [[chip-huyen-ai-engineering-book]]
- [[aie-ch05-prompt-engineering]] · [[aie-ch07-finetuning]]
- [[ai-engineering-three-patterns]]
