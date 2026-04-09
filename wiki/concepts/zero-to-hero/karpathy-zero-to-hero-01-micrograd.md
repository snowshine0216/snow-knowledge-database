---
tags: [neural-networks, backpropagation, deep-learning, python, pytorch, calculus, autograd, micrograd, andrej-karpathy, course]
source: https://www.youtube.com/watch?v=VMj-3S1tku0
---

# Course: Neural Networks & Backpropagation from Scratch — Building micrograd

> **Instructor:** Andrej Karpathy  
> **Duration:** 2 h 25 min | **Published:** 2022-08-16  
> **Views:** 3.3M | **Likes:** 67K  
> **Prerequisites:** Basic Python, vague high-school calculus recollection  
> **Repo:** [karpathy/micrograd](https://github.com/karpathy/micrograd) · [Lecture notebooks](https://github.com/karpathy/nn-zero-to-hero/tree/master/lectures/micrograd)

---

## Course Overview

This course builds a miniature automatic-differentiation engine called **micrograd** entirely from scratch in ~150 lines of Python. By the end you will understand backpropagation — the algorithm powering every modern deep-learning library — at the mathematical atom level, without any tensor abstractions getting in the way. Everything else in PyTorch or JAX is purely efficiency on top of this core idea.

---

## Module 1 — Calculus Refresher: What Is a Derivative?

**Timestamps:** `00:00:00 – 00:19:09` (~19 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 1.1 | Intro & course goals | 0:00 |
| 1.2 | micrograd overview — what it does and why it matters | 0:25 |
| 1.3 | Derivative of a function with **one** input | 8:08 |
| 1.4 | Derivative of a function with **multiple** inputs | 14:12 |

### Key Concepts
- A **derivative** measures how much the output changes when you nudge an input by a tiny `h`. Numerically: `(f(x+h) - f(x)) / h` as `h → 0`.
- With multiple inputs, each partial derivative tells you the sensitivity of the output to that specific input, *holding others fixed*.
- Intuition: derivatives are the slopes that tell you *which direction and how fast* to move each input to increase/decrease the output.

### Learning Objectives
- [ ] Compute a numerical derivative for a single-variable scalar function.
- [ ] Compute partial derivatives for a multi-variable function.
- [ ] Understand why derivatives are the key information needed for optimization.

---

## Module 2 — Building the Core `Value` Object

**Timestamps:** `00:19:09 – 00:52:52` (~34 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 2.1 | The `Value` class — wrapping scalars and recording operations | 19:09 |
| 2.2 | Visualizing the expression graph (graphviz) | 19:09 |
| 2.3 | Manual backprop example #1: simple expression | 32:10 |
| 2.4 | Preview of one optimization step | 51:10 |

### Key Concepts
- `Value` wraps a scalar `data` field and tracks `grad` (initially 0), the operation that produced it (`_op`), and its child nodes (`_children`).
- Every arithmetic operation (`+`, `*`, `**`, etc.) returns a **new** `Value` and records a `_backward` closure that knows how to route gradients back through itself.
- The expression graph is a **directed acyclic graph (DAG)** — forward pass computes outputs, backward pass propagates gradients.
- **Manual backprop**: start from output, apply `d(output)/d(node)` by hand using the chain rule, fill in `.grad` for every intermediate node.

### Learning Objectives
- [ ] Implement the `Value` class with `+` and `*` support.
- [ ] Draw and interpret an expression DAG.
- [ ] Manually compute gradients through a simple expression graph.

---

## Module 3 — Automatic Backpropagation

**Timestamps:** `00:52:52 – 01:39:31` (~47 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 3.1 | Manual backprop example #2: a neuron (weights × inputs + bias → activation) | 52:52 |
| 3.2 | Implementing `_backward` for **each operation** (+, *, tanh, etc.) | 1:09:02 |
| 3.3 | Implementing `.backward()` for a **whole expression graph** via topological sort | 1:17:32 |
| 3.4 | Bug: a node used multiple times — gradients must **accumulate** (`+=`) | 1:22:28 |
| 3.5 | Decomposing `tanh` into primitives — flexibility of the graph | 1:27:05 |
| 3.6 | Cross-check: reproducing results in **PyTorch** | 1:39:31 |

### Key Concepts
- **Chain rule**: `d(L)/d(a) = d(L)/d(b) * d(b)/d(a)` — gradients flow backwards by multiplying local derivatives.
- Each operation's `_backward` closure receives the gradient flowing *in* and distributes it to each child via the chain rule.
- A **topological sort** of the DAG ensures nodes receive their complete gradient before they propagate further back.
- **Gradient accumulation bug**: when the same `Value` appears multiple times in an expression, its `.grad` must be *added* to, not overwritten.
- `tanh` can be broken into `exp`, subtraction, division — same gradient, more granular graph. Numerically equivalent.
- PyTorch's autograd does the same thing — just over tensors (arrays of scalars) for efficiency.

### Learning Objectives
- [ ] Implement `_backward` closures for `+`, `*`, `**`, `tanh`, `/`, `exp`.
- [ ] Implement a topological-sort-based `.backward()` that traverses the full graph.
- [ ] Identify and fix the gradient-accumulation bug.
- [ ] Verify micrograd gradients against PyTorch.

---

## Module 4 — Building a Neural Network Library on Top of micrograd

**Timestamps:** `01:43:55 – 02:14:03` (~30 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 4.1 | `Neuron`, `Layer`, `MLP` classes — the full neural net library | 1:43:55 |
| 4.2 | Creating a toy dataset & writing the loss function (mean squared error) | 1:51:04 |
| 4.3 | Collecting all parameters via `.parameters()` | 1:57:56 |
| 4.4 | Gradient descent training loop — manually updating weights | 2:01:12 |

### Key Concepts
- **Neuron**: `output = tanh(sum(w_i * x_i) + b)`. Weights and bias are `Value` objects, so gradients flow through.
- **Layer**: a list of `Neuron`s applied to the same input.
- **MLP (Multi-Layer Perceptron)**: a sequence of `Layer`s — output of one feeds input of next.
- **Loss function**: measures the distance between predictions and targets. Here: `L = sum((y_pred - y_true)^2)`. Calling `L.backward()` fills `.grad` for every parameter.
- **Training loop**:
  1. **Forward pass** — compute predictions and loss.
  2. **Zero gradients** — reset all `.grad` to 0 (critical! stale gradients accumulate otherwise).
  3. **Backward pass** — `loss.backward()`.
  4. **Parameter update** — `p.data -= lr * p.grad` for every parameter.
  5. Repeat.
- **Learning rate**: step size of the update. Too large → diverges; too small → slow convergence.

### Learning Objectives
- [ ] Implement `Neuron`, `Layer`, and `MLP` classes using `Value`.
- [ ] Define a scalar loss over a batch of predictions.
- [ ] Implement a complete gradient descent training loop.
- [ ] Observe loss decreasing as the network learns.

---

## Module 5 — From micrograd to Modern Deep Learning

**Timestamps:** `02:14:03 – 02:25:52` (~12 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 5.1 | Summary: what we built & the conceptual gap to modern nets | 2:14:03 |
| 5.2 | Full micrograd source walkthrough on GitHub (engine.py + nn.py) | 2:16:46 |
| 5.3 | Diving into PyTorch internals — `tanh` backward pass in C++ | 2:21:10 |
| 5.4 | Conclusion | 2:24:39 |

### Key Concepts
- The **entire autograd engine** is ~100 lines; the neural net library on top is ~50 lines. That's it.
- **Scaling up** = packaging scalars into tensors (N-D arrays) to exploit CPU/GPU parallelism. The *math is identical* — only efficiency changes.
- PyTorch's backward passes (e.g. for `tanh`) are C++ implementations of the same chain-rule derivatives you wrote manually in micrograd.
- Next steps on the "Zero to Hero" path: move from scalar micrograd to tensor-based GPT.

### Learning Objectives
- [ ] Read and understand the complete micrograd source (~150 lines).
- [ ] Articulate the relationship between micrograd and production libraries like PyTorch.
- [ ] Know what to study next to move toward large language models.

---

## Course Summary

### The 5 Big Ideas

1. **Derivatives tell you how to improve.** A gradient of a loss w.r.t. a weight says exactly how to nudge that weight to decrease the loss.
2. **Backpropagation is chain rule on a DAG.** Build an expression graph; reverse-traverse it multiplying local derivatives — that's all backprop is.
3. **150 lines is enough.** The mathematical core of deep learning fits in one afternoon of Python coding.
4. **Tensors are a performance detail.** PyTorch and JAX apply the same math; they just batch scalars into arrays to exploit parallelism.
5. **The training loop never changes.** Forward → zero-grad → backward → update. This pattern is universal across all deep learning.

### Recommended Exercises
- Complete the [Google Colab exercise](https://colab.research.google.com/drive/1FPTx1RXtBfc4MaTkf7viZZD4U2F9gtKN?usp=sharing) linked in the description.
- Extend micrograd to support `relu`, `sigmoid`, `log` operations.
- Implement batch training (average loss over multiple examples).
- Compare your micrograd MLP to an equivalent `torch.nn.Sequential` network.

---

## Source Notes

- **Transcript source:** manual subtitles (VTT)
- **Language:** English
- **Cookie-auth retry:** used (YouTube anti-bot)
- **Data gaps:** none — full transcript and all metadata available
