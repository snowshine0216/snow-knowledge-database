---
tags: [neural-networks, deep-learning, makemore, batch-normalization, kaiming-init, pytorch, activations, gradients, backpropagation, mlp, initialization]
source: https://www.youtube.com/watch?v=P6sfmUTpUmc
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. For a neural network classifying 27 character classes, what should the cross-entropy loss be at initialization if the model is well-calibrated?
2. What is Kaiming (He) initialization, and why would you need a different formula for tanh versus ReLU?
3. What problem does Batch Normalization solve, and at a high level, how does it solve it?

---

# Course: Building makemore Part 3 — Activations, Gradients & BatchNorm

> **Instructor:** Andrej Karpathy
> **Duration:** 1 h 55 min | **Published:** 2022-10-04
> **Views:** 487,867 | **Likes:** 8,372
> **Prerequisites:** makemore Parts 1–2 (MLP, backprop intuition), micrograd basics
> **Code/Links:** [makemore on GitHub](https://github.com/karpathy/makemore) · [Jupyter notebook](https://github.com/karpathy/nn-zero-to-hero/blob/master/lectures/makemore/makemore_part3_bn.ipynb) · [Colab](https://colab.research.google.com/drive/1H5CSy-OnisagUgDUXhHwo1ng2pjKHYSN?usp=sharing)

---

## Course Overview

This lecture stays at the MLP level — before moving to RNNs — to build deep intuition about what happens *inside* a neural network during training. Karpathy walks through the statistics of forward-pass activations and backward-pass gradients, shows what goes wrong when they are improperly scaled, and introduces the first modern normalization technique that fixed the problem at scale: **Batch Normalization** (Ioffe & Szegedy, 2015). By the end, you understand why deep networks were historically fragile, how to diagnose miscalibration with histograms and update-ratio plots, and how BatchNorm stabilizes training for arbitrarily deep architectures.

---

## Module 1 — Why Initialization Matters: Fixing the Initial Loss

**Timestamps:** `00:00:00 – 00:12:58` (~13 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 1.1 | Intro & motivation for staying at MLP level | 0:00:00 |
| 1.2 | Starter code walkthrough | 0:01:22 |
| 1.3 | Diagnosing the "hockey stick" loss curve | 0:04:19 |

### Problem
![[file-20260420095353571.png|440]]
###Key Concepts

- **Expected initial loss:** For 27 character classes with a uniform prior, the expected cross-entropy at initialization is −log(1/27) ≈ 3.29. Seeing loss = 27 at step 0 signals badly miscalibrated logits.
- **Logit explosion:** When the output weight matrix `W2` is initialized with random normal values (not scaled down), the logits take extreme values → the softmax is confidently wrong → huge initial loss → "hockey stick" training curve.
- **Fix:** Scale `W2` by a small constant (e.g. `× 0.01`) and initialize `b2 = 0`. This makes logits near zero at initialization, giving a roughly uniform output distribution.
- **`torch.no_grad` decorator:** Used on evaluation/sampling functions to tell PyTorch not to build a computational graph — more efficient when you will never call `.backward()`.

### Learning Objectives

- [ ] Compute the expected loss at initialization from first principles for any classification problem
- [ ] Identify "hockey stick" loss curves as a symptom of overconfident initialization
- [ ] Apply output-layer weight scaling to achieve the correct initial loss

---

## Module 2 — Taming Saturated Activations: Dead Neurons & Kaiming Init

**Timestamps:** `00:12:59 – 00:40:39` (~28 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 2.1 | The saturated tanh problem | 0:12:59 |
| 2.2 | Dead neurons and the vanishing gradient | 0:18:00 |
| 2.3 | Fan-in scaling: preserving standard deviation | 0:27:53 |
| 2.4 | Kaiming (He) initialization for tanh & ReLU | 0:33:00 |

### Problem: Saturated Activations
![[file-20260420095446139.png|406]]
![[file-20260420095511629.png|518]]
### Key Concepts

- **tanh saturation:** When pre-activations are too large in magnitude (e.g. ±15), `tanh` output is near ±1. Its local gradient `1 − t²` approaches 0 → **gradient is killed** during backprop for those neurons.
- **Dead neurons:** If *every* example in the dataset pushes a neuron into the flat tail of its activation, that neuron's weights never receive a gradient. It is permanently dead. Applies to tanh, sigmoid, and ReLU (which has an exactly flat region below 0).
- **Fan-in scaling:** For a weight matrix with `fan_in` inputs, multiplying weights by `1/√fan_in` preserves the standard deviation of activations across a linear layer. Without this, the Gaussian spread either explodes or shrinks as depth increases.
- **Kaiming init (He et al., 2015):** Extends fan-in scaling to nonlinear activations. The formula is:

  ```
  std = gain / √fan_in
  ```

  | Nonlinearity | Gain |
  |--- |:---:|
  | Linear | Identity | 1.0 |
  | tanh | 5/3 ≈ 1.667 |
  | ReLU | √2 ≈ 1.414 |

  The gain compensates for the contractive effect of the nonlinearity (tanh squashes tails; ReLU discards the negative half).
- **PyTorch API:** `torch.nn.init.kaiming_normal_(tensor, mode='fan_in', nonlinearity='tanh')`
### After fixing
![[file-20260420095545346.png|539]]

### Learning Objectives

- [ ] Explain why tanh saturation causes vanishing gradients, citing the local gradient formula
- [ ] Describe the conditions for a dead neuron in tanh, sigmoid, and ReLU networks
- [ ] Apply Kaiming initialization to a weight matrix by hand
- [ ] Use `plt.hist` to inspect activation and pre-activation distributions at initialization

---

## Module 3 — Batch Normalization

**Timestamps:** `00:40:40 – 01:14:09` (~33 min)

### Lessons

| #   | Title                                                 | Timestamp |
| --- | ----------------------------------------------------- | --------- |
| 3.1 | The core idea: normalize hidden states                | 0:40:40   |
| 3.2 | Scale & shift (γ and β) parameters                    | 0:49:00   |
| 3.3 | Inference: calibrating running mean & std             | 0:57:00   |
| 3.4 | BatchNorm as regularizer (batch-coupling side effect) | 1:01:00   |
| 3.5 | Summary of the BatchNorm layer                        | 1:03:07   |
| 3.6 | Real-world example: ResNet-50 walkthrough             | 1:04:50   |

### Key Concepts
![[file-20260411062510464.png|336]]

- **Core insight:** If you want roughly Gaussian pre-activations, just *normalize* them. Standardization is differentiable, so you can include it in the computational graph and backpropagate through it.

  ```python
  h_mean = h_preact.mean(0, keepdim=True)   # shape: (1, n_hidden)
  h_std  = h_preact.std(0, keepdim=True)
  h_preact_norm = (h_preact - h_mean) / h_std
  ```

- **Scale & shift (γ, β):** Normalizing to unit Gaussian is only desired *at initialization*. The network must be free to learn other distributions. Trainable parameters γ (gain) and β (bias) are initialized to 1 and 0, and learned via backprop.

  ```python
  out = bn_gain * h_preact_norm + bn_bias   # γ * x̂ + β
  ```

- **Batch coupling:** Activations for any single example now depend on *all other examples in the batch* (via the batch mean/std). This is a form of stochastic regularization — each example's hidden state is jittered by the random composition of each minibatch — acting like implicit data augmentation.

- **Inference: running stats:** At test time you cannot compute batch statistics from a single example. Solution: maintain a running exponential moving average of mean and variance during training.

  ```python
  with torch.no_grad():
      bn_mean_running = 0.999 * bn_mean_running + 0.001 * mean_i
      bn_std_running  = 0.999 * bn_std_running  + 0.001 * std_i
  ```

  At inference, use `bn_mean_running` and `bn_std_running` instead of batch statistics.

- **ε (epsilon):** A small constant (default `1e-5`) added to the denominator to prevent division by zero when batch variance = 0.

- **Bias before BatchNorm is spurious:** Any bias `b1` in a preceding linear layer is subtracted out by BatchNorm's centering step. Include only the BatchNorm bias `β` (not both).

- **Motif in deep nets:** `Linear → BatchNorm → Nonlinearity` is the canonical building block (e.g. ResNet bottleneck block). Linear layers before BatchNorm use `bias=False`.

- **PyTorch:** `torch.nn.BatchNorm1d(num_features, eps=1e-5, momentum=0.1, affine=True, track_running_stats=True)`

### Learning Objectives

- [ ] Implement BatchNorm from scratch: centering, scaling, γ/β parameters, running stats
- [ ] Explain the train/eval mode difference in BatchNorm behavior
- [ ] Identify why `bias=False` is used in linear layers preceding BatchNorm
- [ ] Recognize the Conv → BN → ReLU motif in production architectures (ResNet, etc.)

---

## Module 4 — PyTorch-ifying the Code & Diagnostic Visualizations

**Timestamps:** `01:14:10 – 01:55:57` (~42 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 4.1 | Refactoring into `Linear`, `BatchNorm1D`, `Tanh` modules | 1:18:35 |
| 4.2 | Viz #1 — Forward pass activation histograms | 1:26:51 |
| 4.3 | Viz #2 — Backward pass gradient histograms | 1:30:54 |
| 4.4 | The fully linear case: why nonlinearities are needed | 1:32:07 |
| 4.5 | Viz #3 — Weight gradient statistics | 1:36:15 |
| 4.6 | Viz #4 — Update:data ratio over time | 1:39:55 |
| 4.7 — Bringing back BatchNorm + visualizations | 1:46:04 |
| 4.8 | Final summary | 1:51:34 |

### Key Concepts

- **Module API:** Each layer is a class with `.parameters()` and a `__call__` that computes the forward pass. Setting `layer.out` on each forward pass enables easy post-hoc inspection of activations. Module `.training` flag controls train vs. eval behavior (critical for BatchNorm).

- **Viz #1 — Activation histograms (tanh layers only):**
  - Plot histogram of `layer.out` values for each tanh layer.
  - Track `% saturation` = `(|t| > 0.97).float().mean()`. Aim for ~5%.
  - With gain = 5/3 (Kaiming for tanh), standard deviation stabilizes at ~0.65 across all layers.
  - Too small a gain → activations shrink to zero. Too large → saturated.
  - ![[file-20260420095919382.png]]

- **Viz #2 — Gradient histograms:**
  - Plot histogram of `layer.out.grad` for each tanh layer.
  - Should be roughly equal magnitude across layers. Shrinking gradients = vanishing; growing = exploding.
  - ![[file-20260420095931572.png]]

- **Fully linear case insight:** A stack of linear layers (no nonlinearities) collapses to a single linear transformation in the forward pass, but has different backward-pass dynamics. The nonlinearities are essential for representational power, and the gain corrects for their contractive effect.

- **Viz #3 — Weight gradient statistics:**
  - Plot mean, std, and histograms of `.grad` for each 2D weight tensor.
  - Identifies outlier layers (e.g. the final output layer is typically a gradient outlier if initialized with a very small scale).
  - ![[file-20260420100733109.png]]

- **Viz #4 — Update:data ratio (most important diagnostic):**
  - For each parameter: `log10(lr × std(grad) / std(data))` tracked over training.
  - Target: **≈ 1e-3** (i.e. ~−3 on a log10 scale).
  - Much above −3 → updates too large (learning rate too high).
  - Much below −3 → updates too small (learning rate too low, or weights improperly scaled).
  - The final layer (if scaled down to prevent overconfident logits) will show a high ratio initially but stabilizes as training proceeds.
  - ![[file-20260420100748225.png]]

- **BatchNorm + visualizations:** With BatchNorm inserted between each linear and tanh layer, activations are *by construction* well-behaved — the histograms look good regardless of the gain setting. However, the update:data ratio still depends on the learning rate and can require retuning.

### Learning Objectives

- [ ] Write a `Linear`, `BatchNorm1D`, and `Tanh` module class with a compatible PyTorch API
- [ ] Plot and interpret forward-pass activation histograms; identify saturation problems
- [ ] Plot and interpret backward-pass gradient histograms; identify vanishing/exploding gradients
- [ ] Compute and track the update:data ratio as a learning-rate diagnostic
- [ ] Explain why BatchNorm reduces (but does not eliminate) the need for careful initialization

---

## Course Summary

### The 5 Big Ideas

1. **Loss at initialization is predictable:** Expected cross-entropy = −log(1/C). Any significant deviation signals miscalibrated logits, wasteful early training, and a hockey-stick loss curve.
2. **Tanh saturation kills gradients:** Pre-activations should be ~Gaussian at init. Use fan-in scaling and a nonlinearity-specific gain (Kaiming) to control spread across layers.
3. **Batch Normalization = differentiable standardization:** Normalize hidden states to unit Gaussian, then learn γ/β to allow the network to deviate. The side effect is implicit regularization via batch coupling.
4. **Diagnostic tooling is essential:** Activation histograms, gradient histograms, weight-gradient histograms, and update:data ratio plots are the instruments that tell you whether training is on track.
5. **Modern innovations make initialization less critical:** BatchNorm, residual connections, and better optimizers (Adam, RMSProp) are why we no longer manually tune gains for 50-layer networks.

### Recommended Exercises

- **E01:** Initialize all weights and biases to zero. Train and inspect gradients — identify which parts of the network train and why the rest don't.
- **E02:** After training an MLP with BatchNorm, "fold" the γ/β parameters into the preceding linear layer's `W` and `b` to eliminate the BatchNorm at inference time. Verify the forward pass is identical.
- Reproduce all four diagnostic plots from scratch for a 6-layer MLP with and without BatchNorm. Observe how the update:data ratio changes when you vary the learning rate by 10×.
- Try replacing tanh with ReLU and recalculate the appropriate Kaiming gain. Compare activation histograms.

---

## Source Notes

- **Transcript source:** `asr-openai` (OpenRouter audio transcription)
- **Cookie-auth retry:** used
- **Data gaps:** None — full transcript available


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why tanh saturation causes vanishing gradients, and what the Kaiming gain formula does to prevent it.
2. Describe how BatchNorm behaves differently during training versus inference, and why that difference exists.
3. What is the update:data ratio diagnostic, what is the target value, and what does a ratio far above or below that target tell you?

> [!example]- Answer Guide
> 
> #### Q1 — Tanh Saturation and Kaiming Gain
> 
> When pre-activations are large in magnitude (e.g. ±15), tanh outputs near ±1 where its local gradient `1 − t²` approaches 0, killing the gradient signal during backprop. Kaiming init uses `std = gain / √fan_in` with gain = 5/3 for tanh to compensate for tanh's contractive effect, keeping activation standard deviation stable across layers.
> 
> #### Q2 — BatchNorm Train vs Inference
> 
> During training, BatchNorm normalizes using the current minibatch's mean and std; during inference, it uses a running exponential moving average of mean and variance accumulated during training — because at test time you may have a single example with no meaningful batch statistics to compute.
> 
> #### Q3 — Update-to-Data Ratio Diagnostic
> 
> The update:data ratio is `log10(lr × std(grad) / std(data))` tracked per parameter over training; the target is approximately 1e-3 (−3 on a log10 scale). A ratio much above −3 means updates are too large (learning rate too high), and much below −3 means updates are too small (learning rate too low or weights improperly scaled).
