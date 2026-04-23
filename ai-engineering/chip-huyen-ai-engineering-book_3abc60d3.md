---
tags: [ai-engineering, llm, foundation-models, rag, agents, finetuning, evaluation, prompt-engineering, inference-optimization, dataset-engineering, chip-huyen]
source: https://github.com/chiphuyen/aie-book
wiki: wiki/ai-engineering/chip-huyen-ai-engineering-book.md
---

# AI Engineering — Chip Huyen (O'Reilly 2025)

## Article Info
- URL: https://github.com/chiphuyen/aie-book
- Title: AI Engineering (book + companion repo)
- Author: Chip Huyen
- Publish time: 2025
- Access mode: `public`

## Executive Summary

*AI Engineering* (O'Reilly, 2025) is Chip Huyen's 10-chapter, 150,000-word systematic guide to building production applications on top of foundation models. It covers the full stack from model selection and evaluation through prompt engineering, RAG, agents, finetuning, dataset construction, and inference optimization — always from the "how do I make the right engineering decision?" angle rather than tool tutorials. The companion repo supplies the table of contents, chapter summaries, a 1,200+ reference curated reading list, prompt examples, and case studies. It is the definitive bridge between traditional ML engineering (covered in Huyen's earlier *Designing ML Systems*) and the foundation-model era.

## Outline

1. **Introduction to Building AI Applications with Foundation Models** — covers the rise of AI engineering, common use cases across 8 categories, the AI engineering stack, and the differences from traditional ML engineering.
2. **Understanding Foundation Models** — training data, transformer architecture, model size/scaling laws, post-training (SFT + RLHF), sampling strategies, test-time compute, structured outputs, and the probabilistic nature of LLMs.
3. **Evaluation Methodology** — language modeling metrics (perplexity, cross-entropy), exact evaluation (functional correctness, similarity scores), AI-as-a-judge, and comparative/preference evaluation.
4. **Evaluate AI Systems** — model selection criteria, build vs. buy decision framework, public benchmarks, and how to design a full evaluation pipeline.
5. **Prompt Engineering** — in-context learning, few-shot prompting, system/user prompts, best practices, defensive prompt engineering (prompt injection, jailbreaking, information extraction).
6. **RAG and Agents** — RAG architecture, term-based vs. embedding-based retrieval, retrieval optimization, agents as generalized RAG, planning/reflection, agent failure modes, and memory systems.
7. **Finetuning** — when to finetune vs. RAG, memory bottlenecks, PEFT/LoRA, quantization, model merging, multi-task finetuning, hyperparameter tactics.
8. **Dataset Engineering** — data quality/coverage/quantity, data acquisition, AI-powered data synthesis, instruction data generation, model distillation, data processing pipeline.
9. **Inference Optimization** — TTFT vs. TPOT metrics, prefilling vs. decoding phases, latency/throughput tradeoffs, AI hardware overview, batching, quantization for inference, KV cache, speculative decoding.
10. **AI Engineering Architecture and User Feedback** — system architecture patterns, feedback loops, monitoring, and continuous improvement.

## Section Summaries

### 1. Introduction to Building AI Applications with Foundation Models

The chapter frames AI engineering as the discipline that emerged when foundation models became accessible APIs. Key transitions:
- Language models → LLMs (self-supervised pre-training on internet scale).
- LLMs → foundation models (multimodal, general-purpose).
- Foundation models → AI engineering (adapting to specific tasks without retraining from scratch).

**Use case taxonomy (Table 1-3):**

| Category | Consumer Examples | Enterprise Examples |
|---|---|---|
| Coding | Coding assistance | Coding |
| Image/Video | Photo editing, design | Ad generation, presentations |
| Writing | Email, social media | Copywriting, reports |
| Education | Tutoring, essay grading | Employee onboarding |
| Conversational Bots | General chatbot, AI companion | Customer support, product copilots |
| Information Aggregation | Summarization | Market research |
| Data Organization | Image search | Knowledge management |
| Workflow Automation | Travel planning | Data extraction, lead generation |

The **AI engineering stack** has three layers: application (prompt engineering, RAG, agents), model (finetuning, evaluation), and infrastructure (inference optimization, serving). AI engineering differs from ML engineering primarily in that context construction replaces feature engineering, and parameter-efficient finetuning replaces full retraining.

### 2. Understanding Foundation Models

- **Training data**: scale beats curation for general capability, but domain-specific tasks (medical, legal, low-resource languages) require targeted datasets.
- **Transformer architecture**: attention mechanism solves the long-range dependency problem; quadratic attention cost is its main bottleneck.
- **Scaling laws**: the Chinchilla paper shows the optimal compute split is ~50% parameters / 50% tokens — earlier models (GPT-3) were undertrained relative to their size.
- **Post-training**: SFT teaches instruction-following; RLHF/DPO aligns outputs to human preferences. Human preference is too complex for any single formula — every RLHF system is an approximation.
- **Sampling**: temperature, top-p, top-k control randomness. Test-time compute (chain-of-thought, self-consistency) trades latency for accuracy. Structured outputs (constrained decoding) force valid JSON/schemas.

### 3. Evaluation Methodology

- **Perplexity**: exponential of cross-entropy loss; lower = more confident, but not always better for task performance. Useful for filtering training data and detecting distribution shift.
- **Exact evaluation**: functional correctness (code passes tests), BLEU/ROUGE (ngram overlap), BERTScore (embedding similarity). All have blind spots for open-ended tasks.
- **AI-as-a-judge**: single-answer grading or pairwise comparison. Cost-effective and scalable. Key limitation: judge scores from different models are not directly comparable; judges drift as they're updated.
- **Comparative evaluation (ELO)**: pairs models head-to-head on the same prompt; avoids calibration across absolute score scales. Expensive to collect at scale. Powers Chatbot Arena.

### 4. Evaluate AI Systems

- **Evaluation criteria**: domain-specific capability, generation capability (fluency, coherence, faithfulness, safety), instruction-following, cost, latency.
- **Build vs. buy (7 axes)**: data privacy, data lineage, performance, functionality, control, cost, vendor lock-in.
- **Public benchmarks are contaminated**: most benchmark data appears in foundation model training sets; treat leaderboard rankings as a coarse filter, not ground truth.
- **Private evaluation pipeline (3 steps)**: (1) evaluate all components individually; (2) write an evaluation guideline; (3) define evaluation methods and collect labeled data.

### 5. Prompt Engineering

- **Best practices**: explicit instructions + examples + relevant context. Chain-of-thought ("think step by step") consistently improves complex reasoning. Organize and version prompts as code.
- **Defensive prompt engineering**: proprietary prompts can be extracted via prompt injection. Defenses include: input/output filtering, instruction hierarchy (system > user), prompt hardening. No defense is foolproof — security is a cat-and-mouse game.
- **Prompt injection attack surface**: indirect injection (via retrieved documents), direct injection (user input), multi-modal injection (malicious text embedded in images).

### 6. RAG and Agents

- **RAG two-step**: retrieve → generate. Quality bottleneck is the retriever, not the generator.
- **Retrieval options**: BM25/Elasticsearch (term-based, fast, strong baseline) vs. embedding-based (semantic, more powerful, needs vector index). Hybrid = both.
- **Retrieval optimization**: chunking strategy, re-ranking (cross-encoder), query expansion, hypothetical document embeddings (HyDE).
- **Agents**: agent = model + tools + planning loop. Planning quality is the bottleneck; reflection (self-critique) and memory (episodic + semantic) improve reliability.
- **Agent failure modes**: infinite loops, over-reliance on noisy tool output, security risks from tool use (prompt injection via web content). Rigorous sandboxing and output filtering are non-negotiable.

### 7. Finetuning

- **When to finetune**: when prompt engineering has plateaued, when you need consistent format/style, when latency and cost of long prompts become prohibitive.
- **When NOT to finetune**: if you lack high-quality data, if RAG can supply the missing knowledge, if you're early in iteration (finetuning locks in assumptions).
- **Memory bottleneck math**: full finetuning of a 7B model needs ~112 GB GPU RAM (params + gradients + optimizer states at fp32). PEFT/LoRA reduces trainable parameters by 99%, cutting this to ~14 GB.
- **LoRA**: low-rank factorization of weight updates — instead of updating W (d×d), update A (d×r) and B (r×d) where r ≪ d. Modular: multiple LoRA adapters can be hot-swapped on a base model at serve time.
- **Model merging**: combine LoRA adapters or full checkpoints into one model via TIES, DARE, or linear interpolation. Useful for multi-task models and on-device deployment.

### 8. Dataset Engineering

- **Quality > quantity**: a curated 10K dataset often beats a noisy 1M dataset. Deduplication, filtering, and diversity matter more than raw scale.
- **Data acquisition hierarchy**: public datasets → web scraping → synthetic generation → human annotation (most expensive).
- **AI-powered data synthesis**: Alpaca-style self-instruct (GPT generates instruction/output pairs) works but introduces distribution collapse; diversity injection via seed tasks and topic sampling is critical.
- **Model distillation as data**: use a larger teacher model to label or generate training data for a smaller student model. Llama 3's synthetic data section in the tech report is the best public reference.
- **Data processing pipeline**: inspect → deduplicate → clean/filter → format. Deduplication removes ~15-30% of web corpora.

### 9. Inference Optimization

- **Key metrics**: TTFT (time to first token) = prefilling latency; TPOT (time per output token) = decoding latency; throughput = tokens/sec/dollar.
- **Latency vs. throughput tradeoff**: batching increases throughput but increases TTFT. Pick based on user-facing SLA vs. batch job economics.
- **KV cache**: caches key/value tensors for the prompt so decoding doesn't recompute them. Biggest single optimization for autoregressive generation. Memory cost = 2 × layers × heads × head_dim × seq_len × batch × 2 bytes (fp16).
- **Speculative decoding**: draft model generates n tokens speculatively; main model verifies in one forward pass. 2–3× speedup for tasks where draft is often right (e.g., code completion).
- **Quantization (int8/int4)**: 4-bit quantization cuts memory ~4×; quality degradation is acceptable for most tasks. GPTQ, AWQ are leading post-training quantization methods.

### 10. AI Engineering Architecture and User Feedback

- **Feedback loops**: explicit (thumbs up/down), implicit (engagement, session length, follow-up questions). Implicit signals are abundant but noisy.
- **Model as evaluator in production**: score live outputs with a lightweight judge model; alert when score distribution shifts (quality regression detection).
- **Architecture patterns**: monolithic prompting → modular pipelines → agents. Each step increases capability and operational complexity. Match architecture to actual task complexity.

## Key Numbers / Quick Facts

| Fact | Value |
|---|---|
| Book length | 150,000 words, 10 chapters |
| Reference links in book | 1,200+ |
| Generative AI repos tracked by author | 1,000+ |
| Full finetuning memory (7B model, fp32) | ~112 GB GPU RAM |
| LoRA reduction in trainable params | ~99% |
| Typical deduplication removal rate | 15–30% of web corpora |
| Speculative decoding speedup | 2–3× |
| int4 quantization memory reduction | ~4× |

## Key Takeaways

- **Foundation models shifted AI from "build a model" to "adapt a model"** — the core engineering skill is context construction (prompt + RAG + tool output), not feature engineering.
- **Evaluation is the hardest unsolved problem** — public benchmarks are contaminated, AI judges drift with model updates, and no absolute score is stable across judges. Build a private evaluation pipeline with labeled data before optimizing anything.
- **RAG vs. finetuning is not a binary choice**: use RAG to inject facts the model doesn't know; finetune to change behavior/style. Most production systems need both.
- **LoRA changed the finetuning economics**: 7B model finetunable on a single A100 (40 GB) with r=16, enabling teams without GPU clusters to adapt frontier-class models.
- **Agent reliability is gated by planning quality and tooling safety**: every tool call is an attack surface; sandboxing and output filtering are required, not optional.
- **Synthetic data is now viable for instruction finetuning**, but quality verification is manual and hard to automate — the creative bottleneck is annotation guidelines, not generation.
- **Test-time compute (chain-of-thought, self-consistency) outperforms bigger models on reasoning tasks** at a fraction of the pre-training cost — a paradigm shift post-o1.
- **The book explicitly scopes out tool tutorials**: content focuses on timeless fundamentals (scaling laws, attention, perplexity interpretation) so it doesn't go stale with API changes.

## Insights

- The AI engineering stack's three-layer model (application / model / infrastructure) maps cleanly to which team owns each component — useful for org design.
- Perplexity is underused as a data quality signal: low-perplexity text (repetitive, formulaic) and extremely high-perplexity text (garbled) are both worth filtering from pre-training corpora.
- Comparative evaluation (ELO) avoids absolute score calibration but is expensive to collect and hard to reproduce — best used as a product-level signal, not a development-cycle metric.
- The LoRA modularity property (multiple adapters, same base) is the key architectural enabler for multi-tenant fine-tuned model serving — one base model, N customer adapters.
- Chip explicitly positions AIE as a companion to *Designing ML Systems* (DMLS): AIE = foundation model stack; DMLS = tabular/feature-based stack. Real production systems often need both.

## Caveats

- The companion repo contains summaries and resources but NOT the book text — full content requires purchasing the O'Reilly edition.
- Some resource links (especially papers cited in Chapter 2 resources) may have moved or updated since the repo was last committed.
- The book was written over 2024; specific benchmark numbers (e.g., ELO scores from Chatbot Arena) will have shifted.

## Sources

- https://github.com/chiphuyen/aie-book
- https://amzn.to/49j1cGS (Amazon)
- https://huyenchip.com/llama-police (1000+ generative AI repos tracker)
- https://arxiv.org/abs/2203.15556 (Chinchilla scaling law)
- https://arxiv.org/abs/2407.21783 (Llama 3 tech report)
