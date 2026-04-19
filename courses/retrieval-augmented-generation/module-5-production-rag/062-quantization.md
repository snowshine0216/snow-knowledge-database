---
tags: [rag, quantization, optimization, production, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/zzktiz/quantization
---

## Pre-test

1. A standard 768-dimensional embedding vector uses 32-bit floats. Approximately how much memory does a single such vector consume, and what is the primary motivation for reducing it?
2. What distinguishes 8-bit integer quantization from 1-bit (binary) quantization in terms of information retained per dimension?
3. What is a Matryoshka embedding model, and why might you choose to use only the first 100 dimensions of a 1000-dimension Matryoshka vector?

---

# Lecture 062: Quantization

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/zzktiz/quantization

## Outline

1. [The Cost-Speed-Quality Triangle](#cost-speed-quality-triangle)
2. [What Quantization Is: The Image Compression Analogy](#what-quantization-is)
3. [LLM Weight Quantization](#llm-weight-quantization)
4. [Embedding Vector Quantization: 8-Bit Integer](#embedding-vector-quantization)
5. [Binary Quantization and Rescoring](#binary-quantization-and-rescoring)
6. [Matryoshka Embedding Models](#matryoshka-embedding-models)

---

## Cost-Speed-Quality Triangle

Once you can evaluate a RAG system and experiment with different configurations — as explored in [[057-what-makes-production-challenging]] and the surrounding lessons — you face a set of trade-offs that appear in nearly every production software project: **cost, speed, and quality**. Improving one dimension often comes at the expense of another. Quantization is one of the most powerful levers available for simultaneously reducing cost and improving speed, usually at only a modest reduction in quality.

This lesson introduces quantization as a concept that applies to two distinct components of a RAG pipeline:

- **LLMs**: the large language model that generates the final answer.
- **Embedding models**: the model that turns text into dense vector representations used for retrieval.

Both components are memory-intensive and computationally expensive in their default forms. Quantization addresses both.

---

## What Quantization Is: The Image Compression Analogy

Quantization is, at its core, **lossy compression** applied to numerical data. To make the concept intuitive, consider image compression.

A high-quality photograph stored in 24-bit color uses 24 bits per pixel to represent the full range of colors. If you compress it to 12-bit color, the image is immediately half the size; at 6-bit color it is one-quarter the original size. The trade-off is visible color artifacts — the compressed image is a less faithful representation of the original. Whether that loss matters depends on the use case.

Quantization applies the same logic to the floating-point numbers that make up model weights and embedding vectors. The default precision for many values is 32-bit or 16-bit floating-point. Quantization replaces those values with lower-precision representations — 8-bit integers, 4-bit integers, or even 1-bit binary values — and accepts a small degradation in representational fidelity in exchange for large reductions in memory and compute.

The key insight is that **most of the precision in a 32-bit float is unnecessary for many ML tasks**. The important structure in the data survives at much lower bit-depths, just as a compressed image often remains recognizable at a fraction of its original size.

---

## LLM Weight Quantization

The parameters of a typical language model are stored as 16-bit floating-point numbers. Modern LLMs range from roughly one billion to over a trillion parameters, so the memory footprint is enormous. A 7-billion-parameter model in 16-bit precision requires approximately 14 GB of GPU memory just to hold the weights, before accounting for activations and KV cache.

**8-bit and 4-bit quantization** compress those 16-bit weights down to 8 or 4 bits respectively:

| Precision | Relative memory | Typical quality drop |
|-----------|----------------|----------------------|
| 16-bit (baseline) | 1x | — |
| 8-bit | 0.5x | Minor |
| 4-bit | 0.25x | Small to moderate |

The quality reductions are often surprisingly small when measured on standard benchmarks. This matters for [[057-what-makes-production-challenging]] because the cost of running an LLM is dominated by GPU memory: a model that fits on one GPU instead of two cuts infrastructure costs roughly in half, and a quantized model can often generate tokens faster because less data needs to move through memory buses.

Most LLM providers and model hubs (Hugging Face, Ollama, etc.) distribute official 8-bit and 4-bit quantized checkpoints alongside their full-precision base models. For the majority of RAG use cases, starting with a quantized LLM is a straightforward win.

---

## Embedding Vector Quantization: 8-Bit Integer

Embedding quantization targets the dense vectors produced by embedding models, which are stored in a vector database and loaded into RAM for similarity search. A standard 768-dimensional vector uses 768 × 32-bit = 3,072 bytes (approximately 3 KB). At a million vectors that is already 3 GB; at a billion vectors it becomes 3 TB — far beyond what can be kept in fast RAM.

**Integer quantization** replaces each 32-bit float in the vector with an 8-bit integer, immediately reducing vector size to one-quarter. The conversion procedure is straightforward:

1. Scan all vectors in the corpus and record the **minimum** and **maximum** value observed at each dimension.
2. Divide the resulting range at that dimension into **256 equally spaced buckets** (since 8 bits can represent 256 distinct values: 0–255).
3. Assign each original float the bucket index it falls into.
4. Store only the bucket index (8 bits) plus two small metadata scalars per dimension — the minimum value and the bucket width — which allow approximate reconstruction of the original float.

The resulting vectors are one-quarter the size and substantially faster to compare: integer arithmetic is cheaper than floating-point arithmetic on most hardware. Empirical benchmarks show that **Recall@K drops by only a few percentage points** with 8-bit quantization, making it a reliable optimization for production retrieval systems. This connects directly to the evaluation metrics introduced in [[042-transformer-architecture]] and the retrieval quality discussions elsewhere in the course.

---

## Binary Quantization and Rescoring

Taking quantization further, **1-bit (binary) quantization** compresses each dimension to a single bit: `1` if the original float was positive, `0` if it was negative. This achieves a 32x reduction in vector size (from 32 bits per dimension to 1 bit per dimension) and enables extremely fast retrieval using bitwise operations (popcount, Hamming distance).

The cost is meaningful: at 1-bit resolution you lose all magnitude information and retain only the sign of each dimension. Retrieval quality can drop noticeably compared to full-precision search.

The standard mitigation is a **two-stage retrieval pipeline**:

1. **First pass**: use the 1-bit quantized vectors for rapid candidate retrieval over the full corpus. This is cheap and fast because the vectors are tiny and comparisons reduce to bitwise operations.
2. **Reranking pass**: for the top-N candidates returned by the first pass, load their full 32-bit vectors (or an 8-bit intermediate) from slower, cheaper storage and rescore them with higher-precision similarity. The final ranked list benefits from full-resolution comparisons.

This pattern mirrors the reranking approaches discussed elsewhere in the course: coarse fast retrieval narrows the candidate set, and an expensive but accurate scorer refines the ranking over only a small subset.

---

## Matryoshka Embedding Models

A structurally different approach to vector compression is the **Matryoshka Representation Learning** (MRL) model, named after the Russian nesting doll. These embedding models are trained with a special objective that sorts the dimensions of the output vector by information density: earlier dimensions contain more statistical variance (more information) and later dimensions contain progressively less.

In a conventional embedding model, all 768 (or 1024, or 1536) dimensions carry roughly equal amounts of information. There is no principled way to drop, say, the last 500 dimensions without unpredictable quality loss. Matryoshka training breaks this symmetry deliberately.

With a Matryoshka model you can:

- **Truncate permanently**: use only the first 100 dimensions instead of 1000, saving 90% of storage and compute while retaining as much information as possible under that constraint.
- **Two-stage retrieval**: perform first-pass retrieval with the first 100 dimensions (fast, cheap, in hot memory), then pull the full 1000-dimension vector for the top-N results and rescore. The full vector can live in slower, cheaper storage because it is accessed only for a small fraction of queries.

This flexibility makes Matryoshka models especially well-suited to **dynamic production environments** where you want to tune the latency-quality trade-off at query time, or where memory budgets change as the corpus grows. The model trains once; you adjust the dimensionality cut-off at inference time without retraining.

---

## Post-test

1. A colleague proposes storing all embedding vectors at 4-bit precision to maximize memory savings. What trade-offs should you discuss, and what alternative approach might give comparable savings with better retrieval quality?
2. Walk through the integer quantization procedure for a single dimension. If the observed minimum is -1.2 and the maximum is 2.4, what is the bucket width? Which bucket index would the value 0.6 map to?
3. You have a Matryoshka embedding model with 1024 dimensions. Describe a production retrieval architecture that uses this model to minimize RAM cost while maintaining high final-answer quality.

<details><summary>Answer guide</summary>

**Post-test Q1 — 4-bit quantization trade-offs**
4-bit quantization achieves a 4x reduction in vector size (vs. 8x for binary) but introduces more quantization error than 8-bit, potentially causing a noticeable Recall@K drop depending on the corpus and model. Better alternatives to discuss: (a) 8-bit integer quantization, which gives a 4x reduction with minimal quality loss; (b) a two-stage pipeline where 1-bit or 4-bit vectors are used for fast first-pass retrieval and full-precision vectors rescore the top-N candidates — this achieves the speed/memory benefits of aggressive quantization while preserving final ranking quality.

**Post-test Q2 — Integer quantization arithmetic**
Range = 2.4 − (−1.2) = 3.6. Bucket width = 3.6 / 256 ≈ 0.01406 per bucket. For value 0.6: offset from minimum = 0.6 − (−1.2) = 1.8. Bucket index = floor(1.8 / 0.01406) ≈ floor(128.0) = 128. (Exact result is 128, which maps to the midpoint of the range as expected for a symmetric distribution.)

**Post-test Q3 — Matryoshka production architecture**
Keep the first 128 dimensions (or another small prefix) in fast RAM as the "hot index." Keep the full 1024-dimension vectors in cheaper, slower storage (disk-backed memory map or a second-tier vector store). At query time: (1) embed the query and take only its first 128 dimensions; (2) run ANN search over the 128-dim hot index to retrieve the top-200 candidates; (3) load the full 1024-dim vectors for those 200 candidates from cold storage; (4) rescore by exact cosine similarity with the full query vector; (5) return the top-K reranked results. This minimizes the RAM footprint of the primary index while keeping retrieval quality close to full-precision.

</details>
