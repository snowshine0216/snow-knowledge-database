---
tags: [nl2sql, text-to-sql, rag, llm, fine-tuning, lora, sql, vector-retrieval, database]
source: https://u.geekbang.org/lesson/818?article=927474
wiki: wiki/concepts/058-nl2sql-introduction.md
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. NL2SQL converts natural language questions into SQL queries. What do you think are the two main technical approaches used today to build NL2SQL systems?
2. What accuracy percentage would you guess a state-of-the-art NL2SQL system achieves on complex multi-table queries?
3. Before reading: why might a correct-looking SQL query like `ORDER BY risk_score DESC LIMIT 1` produce a silently wrong result in a real application?

---

# 058: NL2SQL Introduction

**Source:** [4NL2SQL简介](https://u.geekbang.org/lesson/818?article=927474)

## Outline

1. Four stages of NL2SQL development history
2. Two current technical paths: context learning vs. parameter fine-tuning
3. RAG-based tools: Vanna.ai
4. Fine-tuning-based tools: DB-GPT Hub, LLaMA Factory
5. Benchmark datasets
6. Challenges and limitations

---

## Section 1: Four Stages of NL2SQL Development

NL2SQL has evolved through four distinct stages. A survey paper covers this history in full — recommended reading for practitioners.

### Stage 1 — Rule-Based (early 2010s)
- Parses natural language for SQL keywords: `SELECT`, `FROM`, `COUNT`, etc.
- Builds a syntax tree from matched keywords (essentially a DSL)
- High accuracy when parsing existing SQL; poor at generating new SQL from open-ended questions

### Stage 2 — Neural Networks (seq2seq)
- Treated NL2SQL as a sequence-to-sequence problem using encoder-decoder architectures
- Results were poor overall

### Stage 3 — Pre-training + Fine-tuning (~2017–2019)
- Combined natural language with database schema, fed through a BERT encoder
- Performed schema linking, column selection, and SQL clause generation
- Representative datasets emerged:
  - **WikiSQL** — Wikipedia-sourced, simple single-table queries
  - **Spider** — complex multi-table queries (Spider 1.0: 2019, Spider 2.0: 2024)
- Most tutorial articles online still use this stage as their example

### Stage 4 — LLM-era (2020+)
- Current state of the field
- Two diverging paths (see Section 2)
- Previous stages no longer need to be learned for practical work

---

## Section 2: Two Current Technical Paths

### Path A — In-Context Learning (RAG-based)

Uses few-shot prompting + chain-of-thought reasoning + tool calls, submitted to a large model (e.g., GPT-4).

**Accuracy:** ~60% on multi-table queries

**Key mechanism — RAG pipeline:**
1. Pre-load the vector store with: DDL definitions, documentation, and verified correct SQL examples (question-SQL pairs)
2. At query time: retrieve relevant table DDL, docs, and similar verified SQL examples
3. Combine retrieved context + user question + system prompt → send to LLM
4. LLM generates SQL → execute query → return result
5. Human-in-the-loop labeling: mark results as correct/incorrect; accumulate correct examples back into the vector store for continuous improvement

**Representative tool:** [Vanna.ai](https://vanna.ai) — a RAG-based NL2SQL agent (open source, can be self-hosted for private company databases)

**Advantage of RAG path:** Transparent and debuggable — you can see exactly where errors occur and fix them incrementally. Instructor's preferred approach.

### Path B — Parameter Fine-tuning

Uses supervised fine-tuning (SFT), domain-specific pre-training, and reinforcement learning on top of code-capable base models.

**Base models:** Code LLaMA and similar code-generation LLMs (better SQL generation quality)

**Fine-tuning techniques:** LoRA, QLoRA

**Benchmark datasets used for fine-tuning:**
| Dataset | Year | Complexity |
|---------|------|-----------|
| WikiSQL | 2017 | Simple, single-table |
| Spider 2.0 | 2024 | Complex, multi-table |
| BIRD | 2023 | Realistic, noisy |

**Representative tools:**

1. **DB-GPT Hub** — purpose-built for text-to-SQL fine-tuning
   - Supports environment prep, data prep, and model fine-tuning
   - Installable via pip; configure training data for your domain
   - Uses Spider dataset format out of the box
   - Runs SFT training with a single command; specify GPU count and quantization bits

2. **LLaMA Factory** — general-purpose fine-tuning framework (also supports SQL)
   - Commands: `train` (fine-tuning), `chat` (inference), `export` (merge LoRA adapter into base model)
   - Optional web UI (`webui`) very similar to Dash Scope interface
   - Pre-requisite: compute resources, time, and labeled data

**Fine-tuning is no longer technically difficult** — the main bottlenecks are compute resources, training time, and quality labeled data.

---

## Section 3: Vanna.ai Deep Dive

Vanna.ai is the recommended production-ready tool for the RAG/context-learning path:

- Functions as an **agent** with: system prompt, search tools, SQL query execution tool
- Retrieves: relevant DDL, documentation, and similar verified SQL examples from vector store
- Supports human-in-the-loop: validate outputs, accumulate correct SQL back into knowledge base
- Suited for **private company databases** — the DDL, schema, docs, and correct examples are all company-specific
- The instructor demonstrated a real case: querying the patient with the highest risk value in a medical system, where using `ORDER BY ... LIMIT 1` could silently drop tied records (concurrent highest-risk patients) — highlighting why human review of generated SQL is essential

---

## Section 4: Challenges and Honest Limitations

- Single-table SQL: current state-of-the-art works reasonably well
- Multi-table SQL: much harder; ~60% accuracy with in-context learning is roughly the ceiling
- **No one in the industry claims to have solved multi-table NL2SQL at scale** — the problem remains genuinely difficult
- The hardest part is not the technology itself, but that users' questions often require **business logic** embedded in stored procedures or complex join logic that LLMs cannot reliably infer
- NL2SQL is more challenging than most other LLM applications

---

## Key Takeaways

- NL2SQL has four historical stages; only Stage 4 (LLM-era) is relevant today
- Two practical paths: **RAG (context learning)** vs. **fine-tuning (parameter optimization)**
- RAG path is more transparent and debuggable; fine-tuning requires labeled data + compute
- Vanna.ai (RAG) and DB-GPT Hub / LLaMA Factory (fine-tuning) are the main open-source tools
- Key datasets: WikiSQL, Spider 2.0 (2024), BIRD (2023)
- Human-in-the-loop validation is critical — LLM-generated SQL can have subtle correctness bugs
- Multi-table NL2SQL remains an unsolved, genuinely hard problem

## Connections

- [[rag-retrieval-augmented-generation]] — core mechanism behind Vanna.ai's NL2SQL approach
- [[lora-fine-tuning]] — LoRA/QLoRA used in the parameter fine-tuning path
- [[llm-agents]] — Vanna.ai is structured as an agent with tools
- [[vector-databases]] — stores DDL, docs, and verified SQL examples for RAG retrieval
- [[code-llm]] — code-capable LLMs (Code LLaMA) are preferred base models for fine-tuning


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain the RAG-based NL2SQL pipeline — what gets stored in the vector store, how a query flows through the system, and how accuracy improves over time.
2. Compare the two current NL2SQL technical paths. What are the key trade-offs between in-context learning and parameter fine-tuning, and which tools represent each?
3. Why does NL2SQL remain genuinely hard for multi-table queries, and what real-world factor makes it harder than most other LLM applications?

<details>
<summary>Answer Guide</summary>

1. The vector store pre-loads DDL definitions, documentation, and verified correct question-SQL pairs. At query time, relevant DDL, docs, and similar SQL examples are retrieved and combined with the user question into a prompt for the LLM, which generates SQL that is then executed. Human-in-the-loop validation marks results correct or incorrect, and correct examples accumulate back into the vector store for continuous improvement.
2. In-context learning (RAG) uses few-shot prompting with tools like Vanna.ai — transparent, debuggable, no training required, ~60% accuracy on multi-table queries. Parameter fine-tuning uses SFT/LoRA/QLoRA on code-capable base models like Code LLaMA via DB-GPT Hub or LLaMA Factory — higher potential quality but requires labeled data, compute, and training time.
3. Multi-table NL2SQL hits roughly 60% accuracy and no one in the industry claims to have solved it at scale. The core difficulty is that users' questions often require business logic embedded in stored procedures or complex joins that LLMs cannot reliably infer — as illustrated by the `ORDER BY ... LIMIT 1` example, which silently drops tied records when multiple patients share the highest risk value.

</details>
