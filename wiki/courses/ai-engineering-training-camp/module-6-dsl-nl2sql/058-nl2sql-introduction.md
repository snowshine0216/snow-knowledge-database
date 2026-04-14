---
tags: [nl2sql, text-to-sql, rag, llm, fine-tuning, lora, sql, vector-retrieval, database]
source: https://u.geekbang.org/lesson/818?article=927474
---
# NL2SQL Introduction

NL2SQL (Natural Language to SQL) converts natural language questions into executable SQL queries. It has evolved through four stages and currently splits into two practical paths.

## Four Development Stages

| Stage | Era | Method | Notes |
|-------|-----|--------|-------|
| 1 | Early 2010s | Rule-based | Parse SQL keywords, build syntax tree; high accuracy for fixed queries |
| 2 | Mid 2010s | Neural seq2seq | Encoder-decoder; poor results |
| 3 | 2017–2019 | BERT pre-training + fine-tuning | Schema linking, column selection, SQL generation |
| 4 | 2020+ | LLM-era | Current state of the art; two diverging paths |

Only Stage 4 is relevant for practical work today. Most online tutorials still demonstrate Stage 3 (BERT fine-tuning).

## Two Current Paths

### Path A — In-Context Learning (RAG-based)

Uses few-shot prompting + chain-of-thought + tool calls with a large model.

**Accuracy:** ~60% on multi-table queries (current ceiling)

**Pipeline:**
1. Pre-load vector store: DDL definitions, documentation, verified SQL examples
2. Query time: retrieve relevant table DDL + docs + similar verified SQL
3. Combine with user question → LLM generates SQL → execute → return result
4. Human-in-the-loop: validate results, accumulate correct SQL back into knowledge base

**Representative tool:** [[vanna-ai]] — open-source RAG-based NL2SQL agent; self-hostable for private databases

**Advantage:** Transparent and debuggable; you can see exactly where errors occur.

### Path B — Parameter Fine-tuning

SFT + reinforcement learning on top of code-capable LLMs.

**Base models:** Code LLaMA and similar (better SQL generation quality)
**Techniques:** LoRA, QLoRA

**Benchmark datasets:**
- **WikiSQL** (2017) — simple single-table queries
- **Spider 2.0** (2024) — complex multi-table queries
- **BIRD** (2023) — realistic, noisy queries

**Tools:**
- **DB-GPT Hub** — purpose-built text-to-SQL fine-tuning; pip-installable; Spider dataset format
- **LLaMA Factory** — general fine-tuning framework; supports merge (LoRA → base model), web UI

## Key Practical Points

- **Human validation is critical:** LLM-generated SQL can have subtle bugs (e.g., `ORDER BY ... LIMIT 1` silently drops tied records)
- **Multi-table NL2SQL remains unsolved** at scale — no one in the industry has cracked it reliably
- The hardest challenge is business logic embedded in stored procedures or complex joins that LLMs can't infer
- Fine-tuning is no longer technically hard — the bottleneck is compute, time, and labeled data
- RAG path is more transparent and recommended for production use

## Related Concepts

- [[rag-retrieval-augmented-generation]]
- [[lora-fine-tuning]]
- [[llm-agents]]
- [[vector-databases]]
- [[code-llm]]
