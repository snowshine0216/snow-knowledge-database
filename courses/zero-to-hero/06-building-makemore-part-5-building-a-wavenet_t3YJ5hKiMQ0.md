---
tags: [neural-networks, wavenet, pytorch, makemore, zero-to-hero, andrej-karpathy, convolutional, deep-learning, batchnorm, language-model]
source: https://www.youtube.com/watch?v=t3YJ5hKiMQ0
wiki: wiki/courses/zero-to-hero/karpathy-zero-to-hero-06-makemore-wavenet.md
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. WaveNet (DeepMind, 2016) processes audio by fusing information hierarchically across time. How do you think this differs from a flat MLP that concatenates all input context at once?
2. BatchNorm normalizes activations using batch statistics. What do you think happens if you only reduce over the batch dimension when your input tensor is 3-dimensional (batch × sequence × channel)?
3. In PyTorch, `torch.matmul` on a `(4, 4, 20)` tensor with a `(20, 200)` weight matrix — what shape do you expect the output to be, and why?

---

# Building makemore Part 5: Building a WaveNet

> **Series**: Neural Networks: Zero to Hero · **Part 6**
> **Channel**: Andrej Karpathy · **Date**: 2022-11-21 · **Duration**: 56:21
> **Views**: 268,815 · **Likes**: 4,553
> **Prerequisites**: makemore Parts 1–4 (especially Part 3: MLP and Part 4: BatchNorm)
> **Code/Links**: [GitHub notebook](https://github.com/karpathy/nn-zero-to-hero/blob/master/lectures/makemore/makemore_part5_cnn1.ipynb) · [Colab](https://colab.research.google.com/drive/1CXVEmCO_7r7WYZGb5qnjfyxTvQa13g5X?usp=sharing) · [WaveNet paper](https://arxiv.org/abs/1609.03499)

---

## Course Overview

This lecture takes the 2-layer MLP character language model from Part 3 and deepens it into a tree-structured hierarchical network that mirrors the architecture of DeepMind's WaveNet (2016). The motivation: feeding all context characters into a single hidden layer "squashes information too fast." Instead, the network should fuse characters progressively — bigrams first, then 4-grams, then 8-grams — exactly as WaveNet does with dilated causal convolutions. Along the way, the code is substantially refactored to closely mirror `torch.nn` (Embedding, Flatten, Linear, BatchNorm1D, Sequential), a `BatchNorm1D` bug with 3D tensor inputs is discovered and fixed, and the lecture closes with a preview of how convolutions efficiently implement this same hierarchical forward pass. Starting validation loss: 2.10; final: 1.993 after scaling.

---

## Module 1 — Codebase Refactoring & PyTorchification

**Timestamps:** `0:00:00 – 0:17:11` (~17 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 1.1 | Intro & series recap | 0:00:00 |
| 1.2 | Starter code walkthrough | 0:01:40 |
| 1.3 | Fix the learning rate loss plot | 0:06:56 |
| 1.4 | Pytorchifying the code: Embedding, Flatten, Sequential, fun bugs | 0:09:16 |

### Key Concepts

- **Module-ized layers**: Embedding and Flatten are promoted to first-class module objects (mirroring `nn.Embedding` and `nn.Flatten`), so all layers live in a uniform `layers` list.
- **Sequential container**: A custom `Sequential` class holds a list of layers and forwards input through them in order, mirroring `torch.nn.Sequential`. This removes the need for explicit for-loops in the training code.
- **Model object**: The network becomes a `model` module; `model.parameters()` replaces the manual list comprehension. The forward pass simplifies to `logits = model(xB)`.
- **BatchNorm training/eval state bug**: A subtle bug surfaces when `model.layers` is not re-run after code refactoring. BatchNorm in training mode with a single-example batch causes `nan` variance. Fix: always call the initialization cell before evaluation.
- **Smoothed loss plot**: `lossi` (list of floats) is reshaped to a 2D tensor and averaged per row, producing a smooth training curve instead of a noisy one.

### Learning Objectives

- [ ] Implement `Embedding`, `FlattenConsecutive`, `Linear`, `BatchNorm1D`, `Tanh`, `Sequential` as module classes with `__call__` and `parameters()`.
- [ ] Understand why `model.eval()` (setting `training=False`) is essential before inference with BatchNorm.
- [ ] Simplify a training loop to use a `Sequential` model object.

---

## Module 2 — WaveNet Architecture & Expanding the Dataset

**Timestamps:** `0:17:11 – 0:21:36` (~4 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 2.1 | WaveNet paper overview & hierarchical fusion | 0:17:11 |
| 2.2 | Bump context length: block_size 3 → 8 | 0:19:33 |
| 2.3 | Baseline with flat MLP on block_size=8 | 0:19:55 |

### Key Concepts

- **Hierarchical fusion**: Rather than concatenating all 8 input characters into one vector and feeding through a single hidden layer, WaveNet fuses pairs (bigrams → 4-grams → 8-grams) through successive layers. This is a tree-structured computation.
- **Dilated causal convolutions** (preview): The efficiency trick in the WaveNet paper. The same hierarchical computation is expressed as a sliding convolution over the input, avoiding redundant recomputation at each sequence position.
- **Baseline improvement from context length**: Simply increasing `block_size` from 3 to 8 (flat MLP) improves validation loss from 2.10 → 2.02. The hierarchical model should do better still.

### Learning Objectives

- [ ] Explain the difference between flat MLP context fusion and WaveNet-style hierarchical fusion.
- [ ] Understand why wider context with a single hidden layer is suboptimal ("squashes information too fast").

---

## Module 3 — Implementing the Hierarchical WaveNet

**Timestamps:** `0:21:36 – 0:37:41` (~16 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 3.1 | Multi-dimensional matmul in PyTorch | 0:21:36 |
| 3.2 | FlattenConsecutive: grouping pairs instead of all characters | 0:28:00 |
| 3.3 | Building the full 3-layer WaveNet with FlattenConsecutive | 0:32:00 |
| 3.4 | Shape inspection along the forward pass | 0:35:00 |

### Key Concepts

- **Multi-dimensional matmul**: `torch.matmul` (and `@`) supports inputs with more than 2 dimensions. Extra leading dimensions are treated as batch dimensions. A `(4, 4, 20) @ (20, 200)` weight matrix yields `(4, 4, 200)` — the linear layer operates on the last dimension in parallel over all leading dimensions.
- **FlattenConsecutive**: A generalized flatten layer that, given `n` consecutive elements, collapses them into the last dimension while introducing a new group dimension. Instead of flattening `(B, T, C)` to `(B, T*C)`, it yields `(B, T//n, n*C)`. This enables parallel processing of all groups via batched matmul.
  - Implementation uses `x.view(B, T//n, n*C)`. PyTorch's memory layout guarantees that consecutive elements are correctly packed.
  - Edge case: if the resulting group dimension is 1 (i.e., `T//n == 1`), squeeze it out to return a 2D tensor.
- **3-layer WaveNet architecture** (block_size=8):
  - Layer 1: `FlattenConsecutive(2)` → `(B, 4, 20)` | `Linear(20→68)` | `BatchNorm1D` | `Tanh`
  - Layer 2: `FlattenConsecutive(2)` → `(B, 2, 136)` | `Linear(136→68)` | `BatchNorm1D` | `Tanh`
  - Layer 3: `FlattenConsecutive(2)` → `(B, 68*2)` | `Linear(136→68)` | `BatchNorm1D` | `Tanh` | `Linear(68→27)`
- **First result**: Hierarchical model with 22K params gives validation loss 2.029, vs. flat MLP baseline of 2.027. Essentially identical — but a BatchNorm bug is to blame.

### Learning Objectives

- [ ] Implement `FlattenConsecutive(n)` that groups consecutive embedding vectors and flattens them in pairs.
- [ ] Trace the tensor shapes through all layers of a 3-layer WaveNet: `(B,8,10)→(B,4,20)→(B,4,68)→(B,2,136)→(B,2,68)→(B,68*2)→(B,27)`.
- [ ] Verify that `x.view(B, T//2, 2*C)` produces the same result as explicit even/odd indexing + `torch.cat`.

---

## Module 4 — Training, Debugging BatchNorm1D & Scaling Up

**Timestamps:** `0:37:41 – 0:46:58` (~9 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 4.1 | First training pass of the WaveNet | 0:37:41 |
| 4.2 | Diagnosing the BatchNorm1D bug with 3D inputs | 0:38:50 |
| 4.3 | Fix: reduce over dims `(0, 1)` not just `dim=0` | 0:43:00 |
| 4.4 | Re-train with bug fix; scale up to 76K params | 0:45:21 |

### Key Concepts

- **BatchNorm1D bug with 3D tensors**: The existing `BatchNorm1D` implementation computes `mean` and `variance` only over `dim=0` (batch dimension). When the input is `(B, T, C)` instead of `(B, C)`, it reduces over only 32 numbers per `(position, channel)` pair, producing a running mean of shape `(1, T, C)` — maintaining separate statistics per sequence position. This is wrong.
- **Fix**: Reduce over `dim=(0, 1)` when input is 3D, so that all `B×T` examples contribute to each channel's mean and variance. This gives a running mean shape of `(1, 1, C)`. Implementation:
  ```python
  dim = 0 if x.ndim == 2 else (0, 1)
  xmean = x.mean(dim, keepdim=True)
  xvar  = x.var(dim, keepdim=True)
  ```
- **PyTorch's `BatchNorm1d` convention differs**: PyTorch expects input as `(N, C)` or `(N, C, L)` — channel dimension second. Karpathy's layers use `(N, L, C)` — channel dimension last. The fix above matches the custom convention.
- **Performance after fix**: 2.029 → 2.022 (marginal but expected — larger effective sample size stabilizes variance estimates).
- **Scaling up**: Increase embedding size 10→24, hidden units proportionally → 76K params → validation loss **1.993** (below 2.0 for the first time in the series).

### Learning Objectives

- [ ] Explain why `BatchNorm1D` requires reducing over both batch and sequence dimensions when input is 3D.
- [ ] Fix the `BatchNorm1D` layer to handle 2D and 3D inputs by dynamically selecting the reduction dimensions.
- [ ] Understand the distinction between PyTorch's `(N, C, L)` channel-second convention and a channel-last `(N, L, C)` convention.

---

## Module 5 — Dilated Convolutions, torch.nn & the Deep Learning Workflow

**Timestamps:** `0:46:58 – 0:56:21` (~9 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 5.1 | Experimental harness: what's missing | 0:46:58 |
| 5.2 | WaveNet with dilated causal convolutions (preview) | 0:47:44 |
| 5.3 | Relationship to torch.nn | 0:51:34 |
| 5.4 | The development process for building deep nets | 0:52:28 |
| 5.5 | Going forward; challenge: beat 1.993 | 0:54:17 |

### Key Concepts

- **Convolutions as efficient sliding WaveNet**: The current model forward-passes a single example independently. For a word like "DeAndre" (7 letters = 8 contexts), this means 8 separate forward passes. Convolutions fold this into one operation by sliding the same filter bank (linear layer weights) over the input sequence — reusing intermediate computations at shared nodes in the tree.
- **Causal dilated convolutions**: The WaveNet paper's efficiency trick — implements the same hierarchical fusion via dilated (strided) 1D convolutions. Each dilation doubles the receptive field at each layer without increasing kernel size. Will be covered in a future lecture.
- **torch.nn equivalence**: Everything built in this series (`Linear`, `BatchNorm1D`, `Embedding`, `Flatten`, `Sequential`, `Tanh`) corresponds to layers in `torch.nn`. Having re-implemented them, Karpathy considers `torch.nn` "unlocked" and will switch to using it directly going forward.
- **Deep learning development workflow** (Karpathy's process):
  1. Spend significant time in PyTorch documentation — it is often wrong, incomplete, or unclear.
  2. Extensive tensor shape gymnastics: tracking `(N, C, L)` vs `(N, L, C)`, view/reshape, squeeze/unsqueeze.
  3. Prototype in Jupyter notebook; once shapes and logic verified, copy-paste to VS Code / repository for experiment runs.
  4. Run many experiments with a proper harness (train/val curves, hyperparameter search) — not done in this lecture, flagged as a future topic.

### Learning Objectives

- [ ] Explain conceptually how a 1D convolution implements the WaveNet forward pass more efficiently than independent per-position calls.
- [ ] Describe Karpathy's Jupyter → VS Code development workflow.
- [ ] Identify what components of the custom layer library correspond to in `torch.nn`.

---

## Course Summary

### The 5 Big Ideas

1. **Hierarchical fusion beats flat concatenation**: Fusing characters progressively (bigrams → 4-grams → 8-grams) encodes structural inductive bias and scales more naturally than a single wide hidden layer.
2. **FlattenConsecutive enables batched processing of groups**: A generalized flatten layer with `view(B, T//n, n*C)` lets the standard linear layer process all pairs/groups in parallel without loops.
3. **BatchNorm1D must reduce over all non-channel dimensions**: When the model produces 3D activations, the batch norm reduction must cover both batch and sequence dimensions — failing to do so creates spurious per-position statistics.
4. **Convolutions are just an efficient implementation**: Dilated causal convolutions don't change the model's mathematical function; they express the same hierarchical forward pass as a reusable sliding filter, saving computation via shared intermediate results.
5. **torch.nn is comprehensible**: By rebuilding it from scratch, you understand exactly what `Sequential`, `Embedding`, `BatchNorm1d`, `Flatten` do internally — and can debug them when they behave unexpectedly.

### Recommended Exercises

- Try to beat the validation loss of **1.993** by tuning the WaveNet architecture (channel sizes, depth, embedding dim, learning rate schedule).
- Test whether a single large hidden layer (flat MLP) — with the same parameter count as the hierarchical model — can match the WaveNet. If it does, the hierarchical inductive bias isn't helping.
- Read the WaveNet paper and implement the gated activation (`tanh(Wx) * sigmoid(Vx)`), residual connections, and skip connections.
- Implement the dilated causal convolution version of the same model using `torch.nn.Conv1d`.
- Set up a proper experimental harness: argument parsing, train/val logging, multiple experiment runs, hyperparameter sweep.

---

## Source Notes

- **Transcript source**: `subtitle-vtt` (original English subtitles)
- **Cookie-auth retry**: used
- **Data gaps**: none — full transcript available


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain what `FlattenConsecutive(n)` does, why `x.view(B, T//n, n*C)` is the right implementation, and what edge case requires a squeeze.
2. Describe the BatchNorm1D bug that appeared with 3D tensor inputs, why it produces wrong statistics, and exactly how the fix (`dim=(0,1)`) corrects it.
3. Explain why dilated causal convolutions are described as a more *efficient* implementation of the same WaveNet forward pass — what redundant computation do they eliminate?

<details>
<summary>Answer Guide</summary>

1. `FlattenConsecutive(n)` collapses `n` consecutive elements along the sequence dimension into the channel dimension, turning `(B, T, C)` into `(B, T//n, n*C)` so a standard linear layer can process all groups in parallel via batched matmul. When `T//n == 1`, the group dimension is squeezed out to return a 2D tensor, avoiding a degenerate leading dimension.
2. The bug: reducing only over `dim=0` when input is `(B, T, C)` computed separate mean/variance per sequence position, using only 32 numbers each — effectively treating each position as independent. The fix reduces over `dim=(0,1)`, pooling all `B×T` examples per channel so running statistics have shape `(1,1,C)` and represent the true channel-wise distribution.
3. The current model runs a full forward pass independently for each context window. For a sequence of length L there are L overlapping windows that share intermediate tree nodes — recomputing them wastefully. Dilated causal convolutions slide the same filter weights across the sequence in one operation, reusing shared intermediate activations, reducing redundant computation proportional to sequence length.

</details>
