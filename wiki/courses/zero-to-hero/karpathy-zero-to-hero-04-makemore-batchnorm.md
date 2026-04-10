---
tags: [neural-networks, deep-learning, makemore, batch-normalization, kaiming-init, pytorch, activations, gradients, initialization, zero-to-hero]
source: https://www.youtube.com/watch?v=P6sfmUTpUmc
---

# Karpathy Zero to Hero 04 — Activations, Gradients & BatchNorm

> **Course:** Neural Networks: Zero to Hero | **Chapter:** 4 of 6
> **Instructor:** Andrej Karpathy | **Duration:** ~1h 55min

Cross-references: [[karpathy-zero-to-hero-03-makemore-mlp]] · [[karpathy-zero-to-hero-build-gpt]]

---

## Why This Lecture Exists

Before moving to RNNs, Karpathy stays at the MLP level to build intuition about what happens *inside* a network during training — specifically why deep networks were historically fragile and how **Batch Normalization** (2015) solved it.

---

## 1. Initialization: The Hockey Stick Problem

**Expected loss at initialization:** −log(1/C), where C = number of classes. For 27 characters: −log(1/27) ≈ **3.29**. Seeing loss = 27 means badly miscalibrated logits.

**Cause:** Output weight matrix `W2` initialized with full-scale random values → extreme logits → softmax is confidently wrong → huge loss → "hockey stick" curve that wastes early training.

**Fix:** Scale `W2 × 0.01` and set `b2 = 0`. This makes the initial output distribution roughly uniform.

---

## 2. Saturated Activations & Kaiming Init

**tanh saturation:** Pre-activations with large magnitude (e.g. ±15) push `tanh` output near ±1, where the local gradient `1 − t²` ≈ 0. Gradients are killed.

**Dead neurons:** If every example saturates a neuron, its weights never receive a gradient — permanently dead. Applies to tanh, sigmoid, and ReLU.

**Fan-in scaling:** Multiplying weights by `1/√fan_in` preserves activation standard deviation across layers. Without it, spread explodes or vanishes with depth.

**Kaiming init (He et al., 2015):**
```
std = gain / √fan_in
```

| Nonlinearity | Gain |
|---|---|
| Linear | 1.0 |
| tanh | 5/3 ≈ 1.667 |
| ReLU | √2 ≈ 1.414 |

The gain compensates for the contractive effect of each nonlinearity. PyTorch: `torch.nn.init.kaiming_normal_(tensor, nonlinearity='tanh')`.

---

## 3. Batch Normalization

**Core insight:** If you want Gaussian pre-activations, just *normalize* them. Standardization is differentiable — include it in the graph and backpropagate through it.

```python
h_mean = h_preact.mean(0, keepdim=True)
h_std  = h_preact.std(0, keepdim=True)
h_preact_norm = (h_preact - h_mean) / (h_std + 1e-5)
out = bn_gain * h_preact_norm + bn_bias   # γx̂ + β
```

**Key properties:**

| Property | Detail |
|---|---|
| γ / β parameters | Initialized to 1 / 0; learned — lets network deviate from unit Gaussian |
| Batch coupling | Each example's hidden state depends on all other examples in the batch → implicit regularization |
| Inference | Use running EMA of mean/var (momentum ≈ 0.001); cannot compute batch stats from a single example |
| Bias before BN | Spurious — BN's centering subtracts it out. Use `bias=False` in preceding linear layers |
| Canonical motif | `Linear (bias=False) → BatchNorm → Nonlinearity` |

PyTorch: `torch.nn.BatchNorm1d(num_features, eps=1e-5, momentum=0.1)`

---

## 4. Diagnostic Visualizations

Four plots for monitoring training health:

### Viz 1 — Forward activation histograms (tanh layers)
- Plot `layer.out` distribution per layer
- Track `% saturation` = `(|t| > 0.97).mean()` — aim for ~5%
- With Kaiming gain=5/3, std should stabilize ~0.65 across layers

### Viz 2 — Backward gradient histograms
- Plot `layer.out.grad` per tanh layer
- Should be roughly equal magnitude — shrinking = vanishing, growing = exploding

### Viz 3 — Weight gradient statistics
- Plot mean/std/histogram of `.grad` for each weight tensor
- Identifies outlier layers (e.g. output layer if scaled down)

### Viz 4 — Update:data ratio (most important)
```
log10(lr × std(grad) / std(data))
```
- **Target: ≈ −3** (i.e. 1e-3 ratio)
- Above −3 → LR too high; below −3 → LR too low or weights improperly scaled
- Track this over training to diagnose LR without grid search

---

## 5. Building Module Classes

Each layer is a class with `.parameters()`, `__call__` for forward pass, and a `.training` flag:

```python
class Linear:
    def __init__(self, fan_in, fan_out, bias=True):
        self.weight = torch.randn(fan_in, fan_out) / fan_in**0.5
        self.bias = torch.zeros(fan_out) if bias else None
    def __call__(self, x):
        self.out = x @ self.weight
        if self.bias is not None: self.out += self.bias
        return self.out
    def parameters(self): return [self.weight] + ([self.bias] if self.bias else [])
```

Setting `layer.out` enables post-hoc inspection of activations for all four diagnostic plots.

---

## 5 Big Ideas

1. **Loss at init is predictable:** Any deviation from −log(1/C) wastes training
2. **Tanh saturation kills gradients:** Use fan-in scaling + Kaiming gain
3. **BatchNorm = differentiable standardization:** Normalize, then let γ/β learn the right distribution
4. **Diagnostic tooling is essential:** You can't fix what you can't see
5. **Modern innovations reduce the need for careful init:** BatchNorm + residual connections + Adam are why 50-layer networks train without manual gain tuning

---

## Recommended Exercises

- **E01:** Init all weights/biases to zero. Identify which parts train and why the rest don't.
- **E02:** After training with BatchNorm, "fold" γ/β into the preceding linear layer's W/b — verify the forward pass is identical.
- Reproduce all four diagnostic plots for a 6-layer MLP with/without BatchNorm. Vary LR by 10× and observe the update:data ratio.
