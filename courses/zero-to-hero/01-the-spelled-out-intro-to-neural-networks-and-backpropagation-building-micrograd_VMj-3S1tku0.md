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
## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What does a derivative of a function tell you, and how would you estimate one numerically for a single-variable function?
2. In a neural network, what is the purpose of backpropagation, and which mathematical rule does it rely on?
3. What is a Multi-Layer Perceptron (MLP), and how do its layers relate to each other?
4. In micrograd's neuron formula `output = tanh(sum(w_i * x_i) + b)`, why is `tanh` applied after the weighted sum? What would happen if you removed it and left only the linear part?
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

---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain how the `Value` class in micrograd enables automatic differentiation — what fields does it track, and what role does a `_backward` closure play?
2. What is the gradient accumulation bug in micrograd, when does it occur, and how is it fixed?
3. Walk through the four steps of micrograd's gradient descent training loop and explain why zeroing gradients before each backward pass is a critical step.
4. In micrograd's neuron formula `output = tanh(sum(w_i * x_i) + b)`, explain why `tanh` is applied after the weighted sum. Cover non-linearity, output range, zero-centering, and gradient flow through Value objects.

> [!example]- Answer Guide
>
> #### Q1 — The `Value` class and automatic differentiation
>
> `Value` wraps a scalar `data` and tracks `grad` (initially 0), the producing operation (`_op`), and child nodes (`_children`). Each arithmetic operation returns a new `Value` and attaches a `_backward` closure that receives the incoming gradient and distributes it to each child via the chain rule, enabling automatic reverse-mode differentiation.
>
> #### Q2 — The gradient accumulation bug
>
> The bug occurs when the same `Value` node appears multiple times in an expression graph — each path through the graph computes a separate gradient contribution, and overwriting `.grad` with `=` discards all but the last. The fix is `+=`: every contribution accumulates so the final `.grad` is the correct total.
>
> #### Q3 — The gradient descent training loop
>
> | Step | Action | Why it matters |
> | :--- | :--- | :--- |
> | 1 | **Forward pass** | Compute predictions and loss |
> | 2 | **Zero gradients** | Reset all `.grad` to 0 — micrograd uses `+=` accumulation, so stale values from the prior step corrupt the current update |
> | 3 | **Backward pass** | `loss.backward()` fills every parameter's `.grad` via topological-sort traversal |
> | 4 | **Parameter update** | `p.data -= lr * p.grad` nudges each weight in the direction that reduces loss |
>
> #### Q4 — Why `tanh`?
>
> The formula `output = tanh(sum(w_i * x_i) + b)` is the neuron's fundamental building block. Without $\tanh$, every layer is a pure linear transformation — stacking any number of them still collapses to a single linear function, no matter the depth. $\tanh$ bends the decision boundary, giving the network the capacity to learn non-linear patterns.
>
> | Reason | What it means |
> | :--- | :--- |
> | **Non-linearity** | Enables curves, XOR, complex boundaries — linear layers always collapse to one |
> | **Bounded output** | Squashes any value to $[-1, 1]$, preventing activations from exploding across layers |
> | **Zero-centered** | Unlike Sigmoid $(0,1)$, outputs span $(-1,1)$ — gradients point both ways, avoiding zig-zag weight updates |
> | **Cheap gradient** | $\frac{d}{dx}\tanh(x) = 1 - \tanh^2(x) = 1 - y^2$ — one subtraction once the output $y$ is known |
>
> | Feature | Without $\tanh$ | With $\tanh$ |
> | :--- | :--- | :--- |
> | Complexity | Straight lines only | Non-linear patterns |
> | Output range | $(-\infty, +\infty)$ unbounded | $[-1, 1]$ bounded |
> | Stacking layers | All layers collapse to one | Each layer adds expressiveness |
> | Gradient flow | Constant | Scales with output: $1 - y^2$ |

