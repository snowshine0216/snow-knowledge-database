---
tags: [neural-networks, wavenet, pytorch, makemore, zero-to-hero, andrej-karpathy, convolutional, deep-learning, batchnorm, language-model]
source: https://www.youtube.com/watch?v=t3YJ5hKiMQ0
---

# Karpathy Zero to Hero 06 — Building a WaveNet

> **Course:** Neural Networks: Zero to Hero | **Chapter:** 6 of 8
> **Instructor:** Andrej Karpathy | **Duration:** 56:21 | **Date:** 2022-11-21
> **Views:** 268,815 | **Likes:** 4,553

Cross-references: [[karpathy-zero-to-hero-05-makemore-backprop-ninja]] · [[karpathy-zero-to-hero-build-gpt]] · [[wavenet]]

---

## Why This Lecture Exists

The flat 2-layer MLP from Part 3 crushes all context characters into a single hidden layer immediately — this "squashes information too fast." WaveNet (DeepMind, 2016) solves this with a **hierarchical tree-like fusion**: bigrams first, then 4-grams, then 8-grams, getting progressively deeper. This lecture implements that architecture for the character-level makemore model, refactors the codebase to closely mirror `torch.nn`, and fixes a subtle `BatchNorm1D` bug that surfaces when activations become 3D.

---

## 1. Codebase Refactorings

Before building WaveNet, the code is substantially cleaned up:

- **Embedding + FlattenConsecutive modules**: the embedding table and reshape operation become first-class module classes with `forward()` and `parameters()`.
- **Sequential container**: wraps a list of layers and eliminates manual forward-pass loops. The training step becomes `logits = model(xB)`.
- **Smoothed loss curve**: `lossi` list is reshaped to `(steps//1000, 1000)` and row-averaged for a clean plot.
- **`torch.nn` parity**: every custom class (`Linear`, `BatchNorm1D`, `Tanh`, `Embedding`, `FlattenConsecutive`, `Sequential`) mirrors the API of its `torch.nn` counterpart.

---

## 2. WaveNet Architecture

The key idea: instead of flattening all 8 context characters into one long vector, use `FlattenConsecutive(n=2)` to group consecutive pairs, then process each pair with a shared linear layer.

**FlattenConsecutive** reshapes `(B, T, C)` → `(B, T//2, 2C)` using `x.view(B, T//2, 2*C)`. PyTorch's memory layout ensures consecutive embeddings are correctly packed. This is mathematically equivalent to explicit even/odd indexing + `torch.cat`, but cheaper.

**3-layer hierarchy** (block_size=8, embed_dim=10, hidden=68):

```
Input (B, 8)
→ Embedding        → (B, 8, 10)
→ FlattenConsec(2) → (B, 4, 20)  [fuse pairs]
→ Linear+BN+Tanh   → (B, 4, 68)
→ FlattenConsec(2) → (B, 2, 136) [fuse bigrams into 4-grams]
→ Linear+BN+Tanh   → (B, 2, 68)
→ FlattenConsec(2) → (B, 136)    [fuse to 8-gram]
→ Linear+BN+Tanh   → (B, 68)
→ Linear           → (B, 27)     logits
```

---

## 3. The BatchNorm1D Bug with 3D Inputs

When activations become 3D `(B, T, C)`, the existing `BatchNorm1D` reduces only over `dim=0`, producing running stats of shape `(1, T, C)` — i.e., separate statistics per sequence position. This is wrong; all `B×T` positions should contribute to a single set of `C` channel statistics.

**Fix:**
```python
dim = 0 if x.ndim == 2 else (0, 1)
xmean = x.mean(dim, keepdim=True)   # → (1,1,C)
xvar  = x.var(dim, keepdim=True)
```

Note: PyTorch's `BatchNorm1d` uses `(N, C, L)` layout (channel-second), so it reduces over dims `(0, 2)`. Karpathy's custom layers use channel-last `(N, L, C)`, so the fix above is the correct one for this codebase.

---

## 4. Convolutions as Efficient WaveNet

The lecture closes with a preview of why WaveNet uses **dilated causal convolutions**:

- The current implementation calls the model once per sequence position (8 separate forward passes for one word).
- A convolution *slides* the same filter bank over all positions simultaneously, reusing intermediate activations at shared tree nodes.
- Dilation doubles the effective receptive field at each layer without increasing kernel size.

This is a **pure efficiency win** — the model's mathematical function is identical to the current hierarchical implementation.

---

## Key Takeaways

- **Hierarchical fusion** with `FlattenConsecutive` enables progressively deeper context integration without exploding parameter count.
- **BatchNorm must reduce over all batch-like dimensions**: for 3D inputs `(B, T, C)`, reduce over `(0, 1)` not just `0`.
- **PyTorch's `@` operator supports batched matmul**: `(B, T, C) @ (C, D)` → `(B, T, D)` with no loops needed.
- **Convolutions are syntactic sugar** for the same hierarchical forward pass — just faster via kernel reuse.
- After fixing the batchnorm bug and scaling up (76K params), validation loss drops from 2.10 → **1.993**.

## See Also

- [[karpathy-zero-to-hero-04-makemore-batchnorm]] — BatchNorm fundamentals from Part 4
- [[karpathy-zero-to-hero-05-makemore-backprop-ninja]] — manual backprop through BatchNorm
- [[karpathy-zero-to-hero-build-gpt]] — next major architecture: Transformers
