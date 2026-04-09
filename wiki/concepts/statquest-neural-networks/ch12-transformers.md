---
tags: [statquest, transformers, self-attention, multi-head-attention, nlp, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

Plan mode is active and the write was blocked. Since you asked me to write the study note directly, here it is as output:

---

```markdown
---
tags: [transformer, attention, self-attention, positional-encoding, encoder-decoder, nlp, neural-networks, deep-learning, statquest]
source: https://www.amazon.com/StatQuest-Illustrated-Guide-Neural-Networks/dp/B0CHL8BSZJ
---

# Chapter 12: Even Better Language Translation with Transformers

**Source:** *The StatQuest Illustrated Guide to Neural Networks and AI* — Josh Starmer

## Outline
- [Motivation: Why Replace LSTMs?](#motivation-why-replace-lstms)
- [Positional Encoding](#positional-encoding)
- [Self-Attention](#self-attention)
- [Encoder Architecture](#encoder-architecture)
- [Decoder Architecture](#decoder-architecture)
- [Training with Teacher Forcing and Masked Self-Attention](#training-with-teacher-forcing-and-masked-self-attention)
- [Optional Enhancements](#optional-enhancements)
- [Key Equations](#key-equations)
- [PyTorch Implementation Notes](#pytorch-implementation-notes)

---

## Motivation: Why Replace LSTMs?

LSTM-based Encoder-Decoder models with Attention work well but process tokens **sequentially** — each token must wait for the previous one's Long-Term and Short-Term Memory values before it can be encoded. Training on large corpora (e.g., all of Wikipedia) is therefore impractically slow.

Transformers replace LSTMs with more elaborate Attention mechanisms plus **Positional Encoding**. Because Transformers carry no sequential hidden state, all token computations during training can be performed **in parallel**, enabling training on vastly larger datasets. This parallelism is the core reason Transformer-based models (including LLMs) now dominate NLP and AI.

The three essential ingredients: **Word Embedding**, **Positional Encoding**, and **Attention**.

---

## Positional Encoding

Word Embedding alone discards word order. Consider "Squatch eats pizza" vs. "Pizza eats Squatch" — same words, opposite meanings. Positional Encoding restores this information.

The original Transformer uses **alternating Sine and Cosine functions** of increasing period to assign a position vector to each token. For token at position $p$ and embedding dimension $i$:

$$
PE_{(p,\,2i)} = \sin\!\left(\frac{p}{10000^{2i/d}}\right), \quad
PE_{(p,\,2i+1)} = \cos\!\left(\frac{p}{10000^{2i/d}}\right)
$$

- $d$: total number of embedding dimensions per token
- $i$: dimension index (0-indexed pairs)

Using sinusoids rather than raw integers keeps position values bounded in $[-1, 1]$, preventing magnitude explosion as sequence length grows.

The positional values are **added** to the Word Embedding values element-wise:

$$
\mathbf{x}_p = \text{WordEmbed}(\text{token}_p) + \text{PE}(p)
$$

All tokens can have their Positional Encoding computed simultaneously — no sequential dependency.

---

## Self-Attention

Self-Attention lets every token "look at" every other token in the same sequence to build contextual representations. For example, in *"The pizza came out of the oven, and it tasted good,"* Self-Attention should learn that *it* is more related to *pizza* than to *oven*.

### Query, Key, and Value

For each token representation $\mathbf{x}$, three vectors are computed using learned weight matrices $W^Q$, $W^K$, $W^V$:

$$
\mathbf{q} = W^Q \mathbf{x}, \quad \mathbf{k} = W^K \mathbf{x}, \quad \mathbf{v} = W^V \mathbf{x}
$$

The terminology comes from databases: the **Query** is the question asked, the **Keys** are the index of items in the database, and the **Values** are what is returned on a match.

### Similarity: Scaled Dot Product

$$
\text{scaled similarity} = \frac{\mathbf{q} \cdot \mathbf{k}}{\sqrt{d_k}}
$$

Dividing by $\sqrt{d_k}$ prevents very large dot products from saturating SoftMax gradients.

### Attention Weights via SoftMax

$$
\alpha_{A,j} = \frac{\exp(\mathbf{q}_A \cdot \mathbf{k}_j / \sqrt{d_k})}{\sum_{j'} \exp(\mathbf{q}_A \cdot \mathbf{k}_{j'} / \sqrt{d_k})}
$$

These weights sum to 1 and represent the percentage contribution of token $j$ to the encoding of token $A$.

### Self-Attention Output

$$
\text{SelfAttn}(A) = \sum_{j} \alpha_{A,j}\, \mathbf{v}_j
$$

Each token's output blends information from every other token in proportion to relevance.

---

## Encoder Architecture

The Encoder processes all input tokens in parallel:

1. **Word Embedding** — map each token to a dense vector.
2. **Positional Encoding** — add position vectors element-wise.
3. **Self-Attention** — compute Q, K, V; produce Self-Attention outputs.
4. **Residual Connections** — add the pre-Attention values back: $\mathbf{h} = \text{SelfAttn}(\mathbf{x}) + \mathbf{x}$. This lets the Attention layer focus purely on *relationships* without also needing to preserve positional/embedding information.
5. *(Optional)* **Layer Normalization** — standardize (subtract mean, divide by std) after each sub-layer.
6. *(Optional)* **Feed-Forward Layer** — a per-token fully-connected network (one hidden layer with ReLU) applied identically at each position.
7. *(Optional)* **Stacking** — repeat the block $N$ times.

The Encoder final outputs — one vector per input token — are passed to the Decoder.

---

## Decoder Architecture

### 1. Masked Self-Attention

Self-Attention over the Decoder's own tokens, with a mask preventing any token from attending to future positions. During training this is applied statically to the full target sequence; each position can only see itself and earlier positions.

### 2. Encoder-Decoder Attention

Query is derived from the current Decoder state; Keys and Values come from the Encoder's final outputs. No masking needed — the Encoder output is fully determined.

$$
\text{CrossAttn output} = \sum_{j} \alpha_j^{\text{cross}}\, \mathbf{v}_j^{\text{enc}}
$$

### 3. Output Projection

After a Residual Connection, a Fully Connected Layer maps to vocabulary-sized logits, then SoftMax produces a probability distribution. Decoding continues until `<EOS>` is emitted.

---

## Training with Teacher Forcing and Masked Self-Attention

During training the correct target sequence is known. **Teacher Forcing** feeds the ground-truth target tokens as Decoder inputs (shifted right, with `<EOS>` as the initial token). This eliminates sequential dependency in the Decoder:

| Step | What happens in parallel |
|------|--------------------------|
| Word Embedding | Encoder and Decoder simultaneously |
| Positional Encoding | All positions at once |
| Q / K / V projections | All tokens, both sides |
| Encoder Self-Attention | Each token attends to all others |
| Decoder Masked Self-Attention | Each token attends only to itself and prior tokens |
| Encoder-Decoder Attention | All Decoder positions cross-attend to Encoder |
| Output projection | All output logits at once |

Cross-Entropy loss is computed over all output positions at once, and backpropagation updates all weights in a single pass.

---

## Optional Enhancements

### Layer Normalization

$$
\hat{x}_i = \frac{x_i - \mu}{\sigma}
$$

Applied after each sub-layer. Stabilises training on large models.

### Multi-Head Attention

Run $h$ independent Attention heads in parallel, each with its own $W^Q, W^K, W^V$. Concatenate outputs, then project back:

$$
\text{MultiHead}(\mathbf{x}) = \text{Concat}(\text{head}_1, \dots, \text{head}_h)\, W^O
$$

The original Transformer used $h = 8$. Multi-Head Attention lets each head specialize in different types of relationships (syntax, coreference, semantics, etc.).

### Feed-Forward Layers

A two-layer fully-connected network (ReLU hidden layer) per position, after the Attention + Residual block. The original used 2,048 hidden units.

### Stacking Sub-units

Encoder and Decoder blocks can each be stacked $N$ times. The original Transformer used $N = 6$. Stacking increases capacity at the cost of compute.

---

## Key Equations

| Equation | Description |
|---|---|
| $\mathbf{x}_p = \text{Embed}(t_p) + PE(p)$ | Word Embedding + Positional Encoding |
| $\mathbf{q} = W^Q\mathbf{x},\; \mathbf{k} = W^K\mathbf{x},\; \mathbf{v} = W^V\mathbf{x}$ | Q / K / V projections |
| $$\text{Attention} = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$$ | Scaled Dot-Product Attention (matrix form) |
| $\mathbf{h} = \text{Attn}(\mathbf{x}) + \mathbf{x}$ | Residual Connection |
| $$\hat{x}_i = \frac{x_i - \mu}{\sigma}$$ | Layer Normalization |
| $$\text{MultiHead} = \text{Concat}(\text{head}_1, \dots, \text{head}_h)\, W^O$$ | Multi-Head Attention output |

---

## PyTorch Implementation Notes

The chapter outlines a class-based PyTorch Lightning implementation:

```python
# Positional Encoding — custom nn.Module (sine/cosine formula)
class PositionEncoding(nn.Module): ...

# Unified Attention class handles all three types:
#   - Self-Attention (Encoder)
#   - Masked Self-Attention (Decoder, blocks future positions)
#   - Encoder-Decoder Attention (cross-attention)
class Attention(nn.Module): ...

# Encoder: Embedding + PositionEncoding + Attention + Residual Connections
class Encoder(nn.Module): ...

# Decoder: Embedding + PositionEncoding + Masked Self-Attention
#          + Encoder-Decoder Attention + Residual Connections + FC output
class Decoder(nn.Module): ...

# Top-level Encoder-Decoder Transformer
class Transformer(L.LightningModule): ...
```

`nn.Embedding` is used directly for Word Embedding. The single `Attention` class is reused for all three attention types, differentiated by a masking flag and which inputs supply the Keys/Values.
```

---

If you'd like me to save this to `courses/statquest-neural-networks-and-ai/ch12-transformers.md`, just approve the file write or exit plan mode first.