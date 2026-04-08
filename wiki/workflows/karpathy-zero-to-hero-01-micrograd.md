---
tags: [neural-networks, backpropagation, autograd, micrograd, pytorch, andrej-karpathy, zero-to-hero, course]
source: https://www.youtube.com/watch?v=VMj-3S1tku0
---

# Zero to Hero 01: Neural Networks & Backpropagation (micrograd)

Karpathy builds **micrograd**, a ~150-line autograd engine, from scratch. The entire mathematical core of deep learning — backpropagation — is demystified at the scalar level.

## Architecture

```
Value(data, grad, _backward, _children, _op)
  ↓
Expression DAG (directed acyclic graph)
  ↓
Topological sort → reverse traversal → chain rule
  ↓
Neuron → Layer → MLP (neural net library in ~50 lines)
```

## Core Mechanics

### The `Value` Object
- Wraps a scalar `data`, tracks `grad` (initially 0), the producing operation `_op`, and child nodes `_children`
- Every arithmetic op (`+`, `*`, `**`, `tanh`) returns a **new** `Value` with a `_backward` closure encoding the local chain rule

### Backpropagation
- **Chain rule on a DAG**: `d(L)/d(a) = d(L)/d(b) * d(b)/d(a)` — gradients flow backwards multiplying local derivatives
- **Topological sort** ensures each node receives its full gradient before propagating further
- **Gradient accumulation bug**: when a `Value` appears multiple times, `.grad` must be `+=`, not overwritten

### Training Loop (universal pattern)
1. Forward pass — compute predictions and loss
2. Zero gradients — reset all `.grad` to 0
3. Backward pass — `loss.backward()`
4. Parameter update — `p.data -= lr * p.grad`

## Key Insights

| Insight | Detail |
|---------|--------|
| 150 lines is enough | The autograd engine + neural net library fits in one file |
| Tensors are a performance detail | PyTorch/JAX apply identical math, just batched into arrays |
| Training loop never changes | Forward → zero-grad → backward → update is universal |
| PyTorch backward = same chain rule | e.g. `tanh` backward in C++ is `1 - t**2`, same derivative you'd compute by hand |

## Exercises
- Extend micrograd with `relu`, `sigmoid`, `log` operations
- Implement batch training (average loss over multiple examples)
- Compare micrograd MLP to equivalent `torch.nn.Sequential`

## Related
- [[karpathy-from-scratch-series]] — repo-level overview of micrograd, minBPE, nanoGPT
- [[karpathy-zero-to-hero-02-makemore-bigrams]] — next lecture: character-level language modeling
- [[essence-of-calculus]] — derivative intuition prerequisite
