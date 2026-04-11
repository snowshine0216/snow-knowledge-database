---
tags: [neural-networks, backpropagation, deep-learning, pytorch, makemore, zero-to-hero, andrej-karpathy, batchnorm, gradients]
source: https://www.youtube.com/watch?v=q8SA3rM6ckI
---

# Karpathy Zero to Hero 05 — Becoming a Backprop Ninja

> **Course:** Neural Networks: Zero to Hero | **Chapter:** 5 of 7
> **Instructor:** Andrej Karpathy | **Duration:** 1:55:24 | **Date:** 2022-10-11
> **Views:** 334,936 | **Likes:** 5,535

Cross-references: [[karpathy-zero-to-hero-04-makemore-batchnorm]] · [[karpathy-zero-to-hero-build-gpt]] · [[micrograd]]

---

## Why This Lecture Exists

Before moving on to RNNs, Karpathy pauses to teach manual [[backpropagation]] at the **tensor level**. The argument: `loss.backward()` is a "leaky abstraction." You can write correct-looking neural network code that silently fails because you don't understand how gradients actually flow. This lecture removes the abstraction entirely by re-implementing the full backward pass of the 2-layer MLP + [[batch-normalization]] from the previous lecture, without ever calling `loss.backward()`.

The session proceeds through four progressive exercises that culminate in a complete training loop driven entirely by manually derived gradients.

---

## 1. Why Manual Backprop Matters

**Backprop is not magic.** Key failure modes that only surface if you misunderstand it:
- **Saturated activations / dead neurons** — gradients die inside saturated tanh/sigmoid
- **Exploding/vanishing gradients** in RNNs
- **Silent loss-clipping bugs** — a real code snippet online was trying to clip gradients but actually clipped loss values, zeroing gradients for outliers

**Historical context.** Writing backward passes by hand was standard ~10 years ago:
- 2010: Karpathy's Matlab code for Restricted Boltzmann Machines
- 2014: Karpathy's numpy code for "Fragments Embeddings" (a CLIP-like model) — full manual backward pass with gradient checker

**The gap from [[micrograd]].** [[micrograd]] operated on individual scalars. This lecture upgrades to tensor-level backprop — how real frameworks work internally.

---

## 2. Starter Code Setup

The same 2-layer MLP + [[batch-normalization]] from Lecture 4. Key differences for this exercise:

- **Expanded forward pass:** `F.cross_entropy(...)` is replaced by ~8 explicit intermediate tensors: `logits → logit_maxes → norm_logits → counts → counts_sum → counts_sum_inv → probs → logprobs → loss`. Each gets a corresponding `d`-prefixed gradient variable.
- **Non-zero bias init:** biases set to small random values (not zero) to avoid masking incorrect gradient formulas.
- **`retain_grad=True`** on all intermediate tensors — allows comparing manual gradients against `t.grad`.
- **`cmp()` utility:** checks exact equality, approximate equality, and max difference between manual and PyTorch gradients.

---

## 3. Exercise 1 — Backpropping the Atomic Compute Graph

A systematic walkthrough of every gradient, from loss back to the embedding table.

### Fundamental patterns used throughout

| Forward operation | Backward rule |
|---|---|
| `y = log(x)` element-wise | `dx = (1/x) * dy` |
| `y = exp(x)` element-wise | `dx = exp(x) * dy = y * dy` |
| `y = x**n` | `dx = n * x**(n-1) * dy` |
| `y = a * b` (broadcast `b`) | `da = b * dy`; `db = (a * dy).sum(broadcast_dims)` |
| `y = a.sum(dim)` | `da = dy.expand_as(a) * ones_like(a)` |
| `D = A @ B + C` | `dA = dD @ B.T`; `dB = A.T @ dD`; `dC = dD.sum(batch_dims)` |
| `y = tanh(x)` | `dx = (1 - tanh(x)²) * dy = (1 - y²) * dy` |

**Key duality: broadcast ↔ sum.**
Forward broadcast (replicate) → backward sum over replicated dims.
Forward sum (reduce) → backward broadcast (replicate) over reduced dims.

### All 24 gradient derivations

**`dlogprobs`:** Only `n=32` of 864 elements participate in loss.
```python
dlogprobs = torch.zeros_like(logprobs)
dlogprobs[range(n), yb] = -1.0 / n
```

**`dprobs`:** Through `log`.
```python
dprobs = (1.0 / probs) * dlogprobs
```
Intuition: low-probability correct answers get boosted gradients.

**`dcounts_sum_inv`:** `probs = counts * counts_sum_inv`; `counts_sum_inv` is broadcast `[32,1]`.
```python
dcounts_sum_inv = (counts * dprobs).sum(1, keepdim=True)
```

**`dcounts` (branch 1):** from probs multiply.
```python
dcounts = counts_sum_inv * dprobs
```

**`dcounts_sum`:** Through `x^{-1}` power rule.
```python
dcounts_sum = (-counts_sum**-2) * dcounts_sum_inv
```

**`dcounts` (branch 2, final):** `counts_sum = counts.sum(1)` — sum forward → replicate backward.
```python
dcounts += torch.ones_like(counts) * dcounts_sum
```

**`dnorm_logits`:** Through `exp`.
```python
dnorm_logits = counts * dcounts   # counts = exp(norm_logits)
```

**`dlogits` (branch 1) + `dlogit_maxes`:** `norm_logits = logits - logit_maxes` with broadcast.
```python
dlogits = dnorm_logits.clone()
dlogit_maxes = (-dnorm_logits).sum(1, keepdim=True)
```
Note: `dlogit_maxes ≈ 0` (softmax is shift-invariant — a good sanity check).

**`dlogits` (branch 2):** Through `max` — gradient goes only to max position.
```python
dlogits += F.one_hot(logits.max(1).indices, num_classes=27) * dlogit_maxes
```

**`dh`, `dW2`, `db2`:** Through second linear layer `logits = h @ W2 + b2`.
```python
dh  = dlogits @ W2.T
dW2 = h.T @ dlogits
db2 = dlogits.sum(0)
```

**`dhpreact`:** Through `tanh`.
```python
dhpreact = (1.0 - h**2) * dh
```

**`dbngain`, `dbnraw`, `dbnbias`:** Through BatchNorm scale/shift `hpreact = bngain * bnraw + bnbias`.
```python
dbngain = (bnraw * dhpreact).sum(0, keepdim=True)
dbnraw  = bngain * dhpreact
dbnbias = dhpreact.sum(0, keepdim=True)
```

**`dbnvar_inv` → `dbnvar`:** Through inverse and power.
```python
dbnvar_inv = (bnraw * dbnraw).sum(0, keepdim=True)
dbnvar = (-0.5 * (bnvar + 1e-5)**-1.5) * dbnvar_inv
```

**`dbndiff2`:** `bnvar = bndiff2.sum(0) / (n-1)` — Bessel's correction.
```python
dbndiff2 = torch.ones_like(bndiff2) * (1.0/(n-1)) * dbnvar
```

**`dbndiff` (branch 1):** From `bnraw = bndiff * bnvar_inv`.
```python
dbndiff = bnvar_inv * dbnraw
```

**`dbndiff` (branch 2):** Through squaring `bndiff2 = bndiff**2`.
```python
dbndiff += 2.0 * bndiff * dbndiff2
```

**`dhprebn` (branch 1) + `dbnmeani`:** `bndiff = hprebn - bnmeani`.
```python
dhprebn  = dbndiff.clone()
dbnmeani = -dbndiff.sum(0, keepdim=True)
```

**`dhprebn` (branch 2):** `bnmeani = hprebn.sum(0) / n` — sum forward → replicate backward.
```python
dhprebn += torch.ones_like(hprebn) * (1.0/n) * dbnmeani
```

**`dembcat`, `dW1`, `db1`:** Through first linear layer.
```python
dembcat = dhprebn @ W1.T
dW1     = embcat.T @ dhprebn
db1     = dhprebn.sum(0)
```

**`demb`:** Through view/reshape — just reshape gradient back.
```python
demb = dembcat.view(emb.shape)
```

**`dC`:** Embedding lookup — scatter-add gradients back.
```python
dC = torch.zeros_like(C)
for k in range(Xb.shape[0]):
    for j in range(Xb.shape[1]):
        dC[Xb[k,j]] += demb[k,j]
```

All 24 gradients match PyTorch autograd exactly (max diff ≈ 0 or ~1e-9 floating-point).

---

## 4. Digression — Bessel's Correction in BatchNorm

The variance is computed as `bndiff2.sum(0) / (n-1)` rather than `/ n`.

**Why n-1 (Bessel's correction)?**
- The sample mean `mu` is estimated from the same batch — this introduces a systematic underestimation of variance.
- Dividing by `n-1` corrects for this bias, giving an unbiased estimate.

**PyTorch BatchNorm1d inconsistency (considered a bug by Karpathy):**
- Training: uses biased variance (`/ n`), per the original [[batch-normalization]] paper.
- Inference (running stats): uses unbiased variance (`/ n-1`).
- This train/test mismatch is subtle and not documented clearly. For large batch sizes the effect is negligible; for small batches it can matter.

Karpathy prefers consistent `n-1` at both train and test time. `torch.var` defaults to unbiased (`unbiased=True`).

---

## 5. Exercise 2 — Analytical Cross-Entropy + Softmax Gradient

Instead of 8 atomic backward steps through the loss, derive `dlogits` directly with math.

**Derivation for a single example:**
- `p_i = exp(l_i) / sum_j exp(l_j)`
- `L = -log(p_y)` where `y` is the correct class
- Result: `dL/dl_i = p_i - 1_{i==y}`

**Implementation (3 lines):**
```python
dlogits = F.softmax(logits, dim=1)
dlogits[range(n), yb] -= 1
dlogits /= n
```

**Intuition:** Push probabilities toward zero for every class proportional to current assigned probability, except the correct class which gets a push upward. Forces sum to zero across classes. A strongly mispredicted example gets a large correction signal.

**Result:** Max diff from PyTorch ≈ 5e-9 (pure floating-point noise).

---

## 6. Exercise 3 — Analytical Batch Norm Backward Pass

Derive `dhprebn` directly without traversing all 6 batchnorm intermediate variables.

**Challenge:** `mu` and `sigma²` are computed from the same batch as the inputs, creating a "closed loop." Each `x_i` influences all outputs `x_hat_j` through the shared statistics.

**Formula (from the original BatchNorm paper, Appendix):**

```python
# dhpreact_no_gamma = bngain * dhpreact  (= dL/dx_hat_i)
dhprebn = (1.0/(n-1)) * bnvar_inv * (
    (n-1) * dhpreact_no_gamma
    - dhpreact_no_gamma.sum(0, keepdim=True)
    - bnraw * (dhpreact_no_gamma * bnraw).sum(0, keepdim=True)
)
```

This handles all 64 hidden neurons in parallel (column-wise operations). Max diff from PyTorch ≈ 1e-9.

---

## 7. Exercise 4 — Full Manual Training Loop

Replace `loss.backward()` with all manual gradients assembled in sequence:

```python
with torch.no_grad():
    # 1. Cross-entropy + softmax (2 lines after softmax)
    dlogits = F.softmax(logits, dim=1); dlogits[range(n), yb] -= 1; dlogits /= n
    # 2. Second linear layer
    dh = dlogits @ W2.T; dW2 = h.T @ dlogits; db2 = dlogits.sum(0)
    # 3. tanh
    dhpreact = (1.0 - h**2) * dh
    # 4. BatchNorm scale/shift
    dbngain = (bnraw * dhpreact).sum(0, keepdim=True)
    dbnraw  = bngain * dhpreact
    dbnbias = dhpreact.sum(0, keepdim=True)
    # 5. BatchNorm analytical backward
    dhpreact_no_gamma = bngain * dhpreact
    dhprebn = (1.0/(n-1)) * bnvar_inv * (
        (n-1)*dhpreact_no_gamma
        - dhpreact_no_gamma.sum(0, keepdim=True)
        - bnraw * (dhpreact_no_gamma * bnraw).sum(0, keepdim=True)
    )
    # 6. First linear layer
    dembcat = dhprebn @ W1.T; dW1 = embcat.T @ dhprebn; db1 = dhprebn.sum(0)
    # 7. View reshape
    demb = dembcat.view(emb.shape)
    # 8. Embedding lookup
    dC = torch.zeros_like(C)
    for k in range(Xb.shape[0]):
        for j in range(Xb.shape[1]):
            dC[Xb[k,j]] += demb[k,j]
    # Parameter update
    for p, grad in zip(parameters, grads):
        p.data += -lr * grad
```

**Result:** Same validation loss as before. Same quality of generated names. No `loss.backward()` anywhere.

---

## Key Concepts

### Backprop as Leaky Abstraction
PyTorch autograd works, but when training breaks — saturated neurons, dead gradients, subtle bugs — you need to understand gradient flow. This lecture provides that foundation.

### Shape-Based Reasoning (no memorization)
For any `D = A @ B + C`: `dA = dD @ B.T`, `dB = A.T @ dD`, `dC = dD.sum(batch_dims)`. You derive this by matching shapes, not by memorizing formulas.

### Broadcast ↔ Sum Duality
The single most useful pattern: forward broadcast → backward sum; forward sum → backward broadcast. Appears in every layer.

### Softmax + CE Gradient = Probabilities minus 1
```
dlogits[i] = softmax(logits)[i] - 1_{i == true_class}
```
Elegant, efficient, interpretable as a push-pull force.

---

## Resources

- [Jupyter notebook](https://github.com/karpathy/nn-zero-to-hero/blob/master/lectures/makemore/makemore_part4_backprop.ipynb)
- [Colab exercise](https://colab.research.google.com/drive/1WV2oi2fh9XXyldh02wupFQX0wh5ZC-z-)
- [Blog: Yes you should understand backprop](https://karpathy.medium.com/yes-you-should-understand-backprop-e2f06eab496b)
- [BatchNorm paper](https://arxiv.org/abs/1502.03167)
- [Bessel's Correction](http://math.oxford.emory.edu/site/math117/besselCorrection/)
