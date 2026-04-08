---
tags: [multilayer-perceptron, embeddings, language-model, makemore, pytorch, deep-learning, andrej-karpathy, zero-to-hero, course]
source: https://www.youtube.com/watch?v=TCH_1BHY58I
---

# Zero to Hero 03: MLP Language Model (makemore Part 2)

Implements a character-level MLP following Bengio et al. 2003, moving beyond bigrams to multi-character context. Introduces embeddings, minibatch training, learning rate search, and train/dev/test evaluation.

## Architecture (Bengio et al. 2003)

```
Context (3 chars) → Embedding lookup C[27×d]
  → Concatenate via view() (zero-copy reshape)
  → Hidden layer (tanh activation)
  → Output logits → F.cross_entropy → loss
```

## Core Concepts

### Embeddings Solve Exponential Scaling
- Bigram count table: 27^n rows for n chars of context — impractical beyond 1-2
- **Embedding table C**: learnable 27×d matrix; similar chars get similar vectors
- `C[i]` ≡ `F.one_hot(i, 27).float() @ C` — lookup = one-hot multiplication

### Tensor Internals
- **`view()` is free**: changes shape/stride metadata on the same 1D storage — no data copy
- Use `emb.view(-1, block_size * emb_dim)` instead of `torch.cat(torch.unbind(...))` 

### Why `F.cross_entropy` Over Manual Softmax
1. **Fused kernels** — no intermediate tensors
2. **Numerical stability** — subtracts `max(logits)` internally to prevent overflow
3. **Simpler backward** — analytically derived gradients

## Training Practices

| Practice | How |
|----------|-----|
| Overfit one batch first | 32 examples, verify loss → ~0. If it can't, there's a bug |
| Minibatch SGD | `torch.randint` to sample 32 examples per step; noisier but much faster |
| LR search | Sweep 10^(-3) to 10^0 exponentially over 1K steps; plot loss vs exponent |
| LR decay | After main training, reduce LR by 10× for final convergence |
| 80/10/10 split | Train optimizes params, dev tunes hyperparams, test evaluates once at end |

## Diagnosing Under/Overfitting
- **Train ≈ dev loss** → underfitting → increase capacity
- **Dev >> train loss** → overfitting → regularize or get more data
- **Bottleneck identification**: scaling hidden 100→300 neurons didn't help; scaling embeddings 2D→10D dropped loss from 2.23→2.17

## Embedding Visualization
With 2D embeddings, scatter-plotting reveals structure: vowels cluster, rare chars (q) isolate, boundary token (`.`) separates from letters.

## Results
- Bigram baseline: loss ~2.45
- MLP (10D embeddings, 200 hidden): val loss ~2.17

## Related
- [[karpathy-zero-to-hero-02-makemore-bigrams]] — prerequisite: bigram model
- [[karpathy-zero-to-hero-build-gpt]] — later: full Transformer from scratch
- [[karpathy-from-scratch-series]] — repo-level overview
