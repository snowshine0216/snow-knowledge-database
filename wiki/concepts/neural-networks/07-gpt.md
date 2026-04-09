---
tags: [neural-networks, deep-learning, math, 3blue1brown, gpt, transformers, embeddings]
source: https://www.youtube.com/watch?v=wjZofJX0v4M
---

# Transformers — The Tech Behind LLMs

## Metadata
- Topic page: https://www.3blue1brown.com/topics/neural-networks
- Lesson page: https://www.3blue1brown.com/lessons/gpt
- Video: https://www.youtube.com/watch?v=wjZofJX0v4M
- Date: 2024-04-01

## Outline
1. [GPT Architecture Overview](wiki/concepts/neural-networks/07-gpt.md#architecture-overview)
2. [Tokenization](wiki/concepts/neural-networks/07-gpt.md#tokenization)
3. [Token Embeddings](wiki/concepts/neural-networks/07-gpt.md#token-embeddings)
4. [Positional Encoding](wiki/concepts/neural-networks/07-gpt.md#positional-encoding)
5. [Stacked Transformer Blocks](wiki/concepts/neural-networks/07-gpt.md#transformer-blocks)
6. [Unembedding and Softmax](wiki/concepts/neural-networks/07-gpt.md#unembedding-softmax)
7. [Autoregressive Generation](wiki/concepts/neural-networks/07-gpt.md#autoregressive-generation)

---

## GPT Architecture Overview

**GPT** = Generative Pre-Trained Transformer.

The full forward pass pipeline:

```
Raw text
  ↓ Tokenizer
Token sequence [t_1, t_2, ..., t_n]
  ↓ Embedding lookup + positional encoding
Embedding matrix X ∈ ℝ^{n × d_model}
  ↓ N × Transformer block (attention + MLP)
Contextualized representations
  ↓ Unembedding matrix
Logits ∈ ℝ^{n × |V|}
  ↓ Softmax
Probability distribution over next tokens
```

GPT-3 uses $d_{\text{model}} = 12288$, $N = 96$ layers, and $|V| = 50{,}257$.

---

## Tokenization

Text is split into subword tokens using **Byte Pair Encoding (BPE)** or similar algorithms. Each token $t_i$ is an integer:

$$t_i \in \{0, 1, \ldots, |V|-1\}$$

Tokenization is a deterministic preprocessing step that converts raw Unicode text into a fixed-length integer sequence that the neural network can process.

---

## Token Embeddings

Each token index is mapped to a dense vector via an **embedding matrix**:

$$\mathbf{E} \in \mathbb{R}^{|V| \times d_{\text{model}}}$$

The embedding for token $t_i$ is simply the $t_i$-th row of $\mathbf{E}$:

$$\mathbf{e}_i = \mathbf{E}[t_i] \in \mathbb{R}^{d_{\text{model}}}$$

**Geometric intuition**: embedding vectors live in a high-dimensional space where **directions** encode semantic relationships. For example:

$$\mathbf{e}_{\text{king}} - \mathbf{e}_{\text{man}} + \mathbf{e}_{\text{woman}} \approx \mathbf{e}_{\text{queen}}$$

This is not by design — it emerges from training on large text.

The embedding matrix $\mathbf{E}$ is **learned** (it is part of $\boldsymbol{\theta}$).

---

## Positional Encoding

Transformers process all tokens in parallel, so they have no inherent notion of order. **Positional encodings** inject sequence position information:

$$\mathbf{x}_i = \mathbf{e}_i + \mathbf{p}_i$$

where $\mathbf{p}_i \in \mathbb{R}^{d_{\text{model}}}$ is a positional encoding for position $i$.

**Sinusoidal** (original, fixed):

$$p_{i,2k} = \sin\!\left(\frac{i}{10000^{2k/d}}\right), \qquad p_{i,2k+1} = \cos\!\left(\frac{i}{10000^{2k/d}}\right)$$

**Learned positional embeddings** (used in GPT): $\mathbf{p}_i$ is a learned parameter vector per position — simpler and usually performs comparably.

---

## Stacked Transformer Blocks

The sequence of embeddings $\mathbf{X} \in \mathbb{R}^{n \times d_{\text{model}}}$ passes through $N$ identical transformer blocks. Each block applies:

1. **Multi-head self-attention** (Chapter 8) — lets tokens communicate with each other
2. **MLP / feedforward sublayer** (Chapter 9) — applies a per-token nonlinear transformation
3. **Residual connections** and **layer normalization** around each sublayer

With residual connections:

$$\mathbf{X} \leftarrow \mathbf{X} + \text{Attention}(\text{LayerNorm}(\mathbf{X}))$$

$$\mathbf{X} \leftarrow \mathbf{X} + \text{MLP}(\text{LayerNorm}(\mathbf{X}))$$

Residual connections allow gradients to flow through deep networks without vanishing.

---

## Unembedding and Softmax

After the final transformer block, each position's vector is projected back to vocabulary space via the **unembedding matrix** $\mathbf{U} \in \mathbb{R}^{d_{\text{model}} \times |V|}$:

$$\mathbf{z}_i = \mathbf{X}_i\, \mathbf{U} \in \mathbb{R}^{|V|}$$

These are the **logits** — unnormalized scores for each possible next token.

**Softmax** converts logits to probabilities:

$$p_{i,k} = \frac{e^{z_{i,k}}}{\displaystyle\sum_{j=1}^{|V|} e^{z_{i,j}}}$$

At inference time, only the logits at the **last** position (position $n$) are used to sample the next token.

Note: In GPT, $\mathbf{U} = \mathbf{E}^\top$ (the unembedding matrix is the transpose of the embedding matrix) — weight tying that halves the number of embedding parameters.

---

## Autoregressive Generation

To generate text:

1. Encode the prompt as tokens $[t_1, \ldots, t_n]$
2. Run the full forward pass → get probabilities for token $n+1$
3. Sample $t_{n+1} \sim p(\cdot \mid t_1, \ldots, t_n)$
4. Append $t_{n+1}$ to the context and repeat from step 2

Each forward pass costs $O(n \cdot d_{\text{model}}^2)$ — it grows with context length because attention attends to all previous tokens. This is why long-context generation is expensive.
