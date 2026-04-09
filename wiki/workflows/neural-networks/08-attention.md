---
tags: [neural-networks, deep-learning, math, 3blue1brown, attention, transformers]
source: https://www.youtube.com/watch?v=eMlx5fFNoYc
---

# Attention in Transformers — Step by Step

## Metadata
- Topic page: https://www.3blue1brown.com/topics/neural-networks
- Lesson page: https://www.3blue1brown.com/lessons/attention
- Video: https://www.youtube.com/watch?v=eMlx5fFNoYc
- Date: 2024-04-07

## Outline
1. [Motivation — Context-Dependent Meaning](#motivation)
2. [Query, Key, Value Projections](#qkv-projections)
3. [Attention Score Computation](#attention-scores)
4. [Softmax Normalization](#softmax-normalization)
5. [Weighted Aggregation (Value Mixing)](#value-mixing)
6. [Causal Masking](#causal-masking)
7. [Multi-Head Attention](#multi-head)
8. [Parameter Count](#parameter-count)

---

## Motivation — Context-Dependent Meaning

The word "bank" means different things in different contexts:

- "river **bank**" → geographical feature
- "**bank** account" → financial institution

After tokenization and embedding, each token starts with the **same** embedding regardless of context. Attention's job is to **update each token's embedding** by incorporating information from other tokens in the sequence, making representations context-aware.

---

## Query, Key, Value Projections

For each token $i$ with embedding $\mathbf{x}_i \in \mathbb{R}^{d_{\text{model}}}$, compute three vectors via learned linear projections:

$$\mathbf{q}_i = \mathbf{x}_i\, \mathbf{W}_Q, \quad \mathbf{k}_i = \mathbf{x}_i\, \mathbf{W}_K, \quad \mathbf{v}_i = \mathbf{x}_i\, \mathbf{W}_V$$

where:
- $\mathbf{W}_Q, \mathbf{W}_K \in \mathbb{R}^{d_{\text{model}} \times d_k}$ — query and key projection matrices
- $\mathbf{W}_V \in \mathbb{R}^{d_{\text{model}} \times d_v}$ — value projection matrix
- $d_k, d_v$: head dimension (typically $d_k = d_v = d_{\text{model}} / h$ for $h$ heads)

In matrix form over the full sequence $\mathbf{X} \in \mathbb{R}^{n \times d_{\text{model}}}$:

$$\mathbf{Q} = \mathbf{X}\, \mathbf{W}_Q, \quad \mathbf{K} = \mathbf{X}\, \mathbf{W}_K, \quad \mathbf{V} = \mathbf{X}\, \mathbf{W}_V$$

**Intuition**:
- **Query** $\mathbf{q}_i$: "What information am I looking for?"
- **Key** $\mathbf{k}_j$: "What information do I contain?"
- **Value** $\mathbf{v}_j$: "What information will I contribute?"

---

## Attention Score Computation

How relevant is token $j$ to token $i$? Compute the **dot-product similarity** between query $i$ and key $j$:

$$s_{ij} = \mathbf{q}_i \cdot \mathbf{k}_j = \mathbf{q}_i^\top \mathbf{k}_j$$

In matrix form, all pairwise scores at once:

$$\mathbf{S} = \mathbf{Q}\, \mathbf{K}^\top \in \mathbb{R}^{n \times n}$$

Entry $S_{ij}$ = how much token $i$ should attend to token $j$.

**Scaling**: to prevent dot products from growing large when $d_k$ is large (which pushes softmax into saturation), divide by $\sqrt{d_k}$:

$$\mathbf{S} = \frac{\mathbf{Q}\, \mathbf{K}^\top}{\sqrt{d_k}}$$

---

## Softmax Normalization

Convert raw scores into a probability distribution over positions using **row-wise softmax**:

$$\alpha_{ij} = \frac{e^{s_{ij}}}{\displaystyle\sum_{k=1}^{n} e^{s_{ik}}}$$

$$\mathbf{A} = \text{softmax}\!\left(\frac{\mathbf{Q}\,\mathbf{K}^\top}{\sqrt{d_k}}\right) \in \mathbb{R}^{n \times n}$$

Each row $i$ of $\mathbf{A}$ sums to 1 — it is a distribution over which tokens token $i$ attends to.

---

## Weighted Aggregation (Value Mixing)

The output for token $i$ is a weighted sum of all value vectors, weighted by the attention distribution:

$$\mathbf{o}_i = \sum_j \alpha_{ij}\, \mathbf{v}_j$$

In matrix form:

$$\mathbf{O} = \mathbf{A}\, \mathbf{V} \in \mathbb{R}^{n \times d_v}$$

**Full scaled dot-product attention formula**:

$$\text{Attention}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \text{softmax}\!\left(\frac{\mathbf{Q}\,\mathbf{K}^\top}{\sqrt{d_k}}\right) \mathbf{V}$$

The output $\mathbf{O}$ is then projected back to $d_{\text{model}}$ via an output projection $\mathbf{W}_O \in \mathbb{R}^{d_v \times d_{\text{model}}}$.

---

## Causal Masking

For autoregressive generation, token $i$ must not attend to future tokens $j > i$ (they haven't been generated yet). This is enforced with a **causal mask**:

$$\mathbf{S}_{\text{masked}} = \mathbf{S} + \mathbf{M}, \qquad M_{ij} = \begin{cases} 0 & j \leq i \\ -\infty & j > i \end{cases}$$

Adding $-\infty$ before softmax drives $e^{-\infty} = 0$, zeroing out attention to future positions.

---

## Multi-Head Attention

Instead of one attention function, run $h$ attention heads **in parallel**, each with its own $\mathbf{W}_Q^{(r)}, \mathbf{W}_K^{(r)}, \mathbf{W}_V^{(r)}$:

$$\text{head}_r = \text{Attention}\!\left(\mathbf{X}\mathbf{W}_Q^{(r)},\; \mathbf{X}\mathbf{W}_K^{(r)},\; \mathbf{X}\mathbf{W}_V^{(r)}\right)$$

Concatenate all heads and project:

$$\text{MultiHead}(\mathbf{X}) = \text{Concat}\!\left(\text{head}_1, \ldots, \text{head}_h\right) \mathbf{W}_O$$

where $\mathbf{W}_O \in \mathbb{R}^{h d_v \times d_{\text{model}}}$.

Multiple heads allow the model to attend to different aspects of context simultaneously (e.g., syntactic dependencies in one head, semantic similarity in another).

---

## Parameter Count

For one attention head with $d_k = d_v = d_{\text{model}} / h$:

| Matrix | Shape | Parameters |
|--------|-------|-----------|
| $\mathbf{W}_Q^{(r)}$ | $d_{\text{model}} \times d_k$ | $d_{\text{model}} \cdot d_k$ |
| $\mathbf{W}_K^{(r)}$ | $d_{\text{model}} \times d_k$ | $d_{\text{model}} \cdot d_k$ |
| $\mathbf{W}_V^{(r)}$ | $d_{\text{model}} \times d_v$ | $d_{\text{model}} \cdot d_v$ |

For $h$ heads plus output projection $\mathbf{W}_O$, total attention parameters per layer:

$$4 \cdot d_{\text{model}}^2 \quad \text{(when } d_k = d_v = d_{\text{model}} / h\text{)}$$
