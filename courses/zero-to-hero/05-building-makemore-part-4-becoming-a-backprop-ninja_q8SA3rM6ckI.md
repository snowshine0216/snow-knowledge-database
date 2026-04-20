---
tags:
  - neural-networks
  - backpropagation
  - deep-learning
  - pytorch
  - makemore
  - zero-to-hero
  - andrej-karpathy
  - batchnorm
  - gradients
source: https://www.youtube.com/watch?v=q8SA3rM6ckI
google-colab: https://colab.research.google.com/drive/1WV2oi2fh9XXyldh02wupFQX0wh5ZC-z-?usp=sharing
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. When you broadcast a tensor in the forward pass (replicating it across a dimension), what operation does the backward pass require over that replicated dimension?
2. For a matrix multiplication `D = A @ B`, what is the gradient formula for `dA` in terms of `dD` and `B`?
3. What is Bessel's correction, and why does it matter for variance estimation in batch normalization?

---

# Building makemore Part 4: Becoming a Backprop Ninja

> **Series**: Neural Networks: Zero to Hero · **Part 5**
> **Channel**: Andrej Karpathy · **Date**: 2022-10-11 · **Duration**: 1:55:24
> **Views**: 334,936 · **Likes**: 5,535

## Overview

This lecture is a deep dive into manually implementing the backward pass of a 2-layer MLP with [[batch-normalization]], without using PyTorch's `loss.backward()`. Karpathy argues that [[backpropagation]] is a "leaky abstraction" — it doesn't just work magically. To debug and innovate on neural networks, practitioners must understand how gradients actually flow through each computation. The session systematically derives every gradient in the network, starting from the loss and working back through cross-entropy, the second linear layer, tanh, batch norm, the first linear layer, and the embedding table lookup.

The lecture is structured around four progressive exercises. Exercise 1 involves back-propagating manually through all atomic operations of the compute graph, step by step. Exercises 2 and 3 demonstrate that by treating cross-entropy loss and batch normalization as single mathematical objects and differentiating analytically, you arrive at much shorter, more efficient backward formulas. Exercise 4 puts everything together: a complete training loop that achieves the same loss as before, but without ever calling `loss.backward()`.

A key pedagogical thread runs throughout: the mechanics of tensor-level backprop are not mysterious. By working through concrete small examples (2×2 matrices, scalar analogies), each gradient formula becomes derivable from first principles — no memorization required, just shape-matching and the chain rule.

## Key Takeaways

- [[backpropagation]] is a leaky abstraction: bugs in real code often stem from misunderstanding how gradients flow (e.g., clipping loss vs. clipping gradients).
- Manually writing the backward pass was standard practice ~10 years ago (Matlab era, Karpathy's own 2014 numpy code). Understanding it makes you a better neural network debugger.
- Every tensor's gradient has the same shape as the tensor itself. This constraint alone often determines the correct backward formula.
- Broadcasting in the forward pass (variable reuse / replication) corresponds to a **sum** in the backward pass over the replicated dimension. Conversely, a **sum** in the forward pass becomes a **replication/broadcast** in the backward pass.
- For matrix multiplication `D = A @ B + C`, the gradients are: `dA = dD @ B.T`, `dB = A.T @ dD`, `dC = dD.sum(0)`. You don't need to memorize these — just match shapes.
- The analytical gradient of cross-entropy + softmax is elegantly simple: `dlogits = softmax(logits)`, then subtract 1 at the correct class index, then divide by batch size. This is much more efficient than back-propagating through every atomic step.
- The [[batch-normalization]] backward pass can be derived analytically into a single formula, avoiding the expensive traversal of all intermediate steps.
- Bessel's correction (dividing by `n-1` instead of `n` for variance) is important for unbiased variance estimation. The original BatchNorm paper and PyTorch's `BatchNorm1d` have a subtle train/test mismatch on this that Karpathy considers a bug.

## Chapters

### 1. Intro: Why You Should Care & Fun History (0:00:00)

**Backprop as a leaky abstraction.** The motivation is Karpathy's blog post ["Yes you should understand backprop"](https://karpathy.medium.com/yes-you-should-understand-backprop-e2f06eab496b). The core argument: even though PyTorch provides autograd, not understanding its internals leads to subtle, hard-to-debug failures:

- **Saturated activations / dead neurons** — if you don't understand gradient flow you won't know why training stalls.
- **Exploding/vanishing gradients** in RNNs.
- **Subtle bugs in loss clipping** — a real code snippet found online was trying to clip gradients but actually clipped the loss values, silently zeroing gradients on outliers. The author did not understand backprop.

**Historical context.** Writing backward passes by hand was standard ~10 years ago in deep learning:
- 2006 Hinton/Salakhutdinov paper on Restricted Boltzmann Machines, implemented in Matlab.
- Karpathy's own 2010 Matlab code for training RBMs on CPUs.
- Karpathy's 2014 numpy/python code for the "Fragments Embeddings" paper (a CLIP-like model aligning images and text at the object/sentence-fragment level). That code explicitly computed the backward pass manually and used a gradient checker for correctness.

**The gap between [[micrograd]] and tensors.** The series previously built [[micrograd]], an autograd engine over individual scalars. This lecture upgrades to tensor-level backprop, which is what real frameworks do. The goal: "emerge stronger."

### 2. Starter Code (0:07:26)

The starter notebook continues the 2-layer MLP with [[batch-normalization]] from the previous lecture. Key design choices that differ from before:

- **Expanded forward pass**: instead of `F.cross_entropy(...)`, the loss is broken into many intermediate named tensors (`logits`, `logit_maxes`, `norm_logits`, `counts`, `counts_sum`, `counts_sum_inv`, `probs`, `logprobs`, `loss`). Each of these will get a corresponding gradient variable prefixed with `d`.
- **Non-zero initialization of biases**: biases are set to small random numbers (not zero) to avoid masking incorrect gradient implementations. Zero initialization can simplify gradients in misleading ways.
- **A bias `b1` is kept even though batch norm follows it** (normally redundant) — to verify the gradient for a spurious parameter is still computed correctly.
- **`retain_grad=True`** is set on all intermediate tensors so PyTorch keeps their `.grad` after `loss.backward()`, enabling comparison against manual computations.
- A utility function `cmp(label, dt, t)` is introduced: it checks whether the manually computed gradient `dt` matches `t.grad` (both exactly and approximately, and reports the max difference).

**Four exercises** are previewed:
1. Back-propagate through all atomic operations one by one.
2. Analytically derive and implement `dlogits` directly from the cross-entropy + softmax formula.
3. Analytically derive and implement `dhprebn` directly from the batch norm formula.
4. Assemble everything into a complete training loop without `loss.backward()`.

### 3. Exercise 1: Backpropping the Atomic Compute Graph (0:13:01)

This section is the heart of the lecture — a systematic walkthrough of every gradient, proceeding backward through the compute graph.

#### `dlogprobs` — gradient of loss w.r.t. log probabilities

`logprobs` has shape `[32, 27]`. Only 32 of its 864 elements participate in the loss (one per example, selected by `yb`). The loss is: `loss = -logprobs[range(n), yb].mean()`.

Differentiating: elements not selected have gradient 0. Selected elements have gradient `-1/n`. Implementation:

```python
dlogprobs = torch.zeros_like(logprobs)
dlogprobs[range(n), yb] = -1.0 / n
```

#### `dprobs` — gradient through `log`

`logprobs = log(probs)` element-wise. Local derivative of `log(x)` is `1/x`. By chain rule:

```python
dprobs = (1.0 / probs) * dlogprobs
```

Intuition: examples where the model assigns low probability get their gradient boosted (small denominator).

#### `dcounts_sum_inv` — gradient through element-wise multiply with broadcast

`probs = counts * counts_sum_inv`. `counts` is `[32,27]`, `counts_sum_inv` is `[32,1]` (broadcast). The backward pass through the multiplication gives the local derivative `counts`, but since `counts_sum_inv` is broadcast (replicated 27 times), the gradient must be summed over the replicated dimension:

```python
dcounts_sum_inv = (counts * dprobs).sum(1, keepdim=True)
```

#### `dcounts` (first contribution) — from `probs` branch

```python
dcounts = counts_sum_inv * dprobs
```

Note: `dcounts` is incomplete here. `counts_sum` also depends on `counts`, creating a second branch. `+=` will be used later.

#### `dcounts_sum` — gradient through `x^{-1}`

`counts_sum_inv = counts_sum ** -1`. Power rule: local derivative is `-1 * counts_sum^{-2}`:

```python
dcounts_sum = (-counts_sum**-2) * dcounts_sum_inv
```

#### `dcounts` (second contribution, final) — from `counts_sum` branch

`counts_sum = counts.sum(1, keepdim=True)` — a sum over rows. Backward of sum = broadcast (replicate) the upstream gradient:

```python
dcounts += torch.ones_like(counts) * dcounts_sum
```

(The `torch.ones_like` achieves broadcasting. `+=` adds the second branch contribution.)

#### `dnorm_logits` — backward through `exp`

`counts = norm_logits.exp()`. Local derivative of `exp(x)` is `exp(x) = counts` itself:

```python
dnorm_logits = counts * dcounts
```

#### `dlogit_maxes` and `dlogits` (first branch) — backward through subtraction with broadcast

`norm_logits = logits - logit_maxes`. `logit_maxes` is `[32,1]` (broadcast). For the subtraction:

```python
dlogits = dnorm_logits.clone()
dlogit_maxes = (-dnorm_logits).sum(1, keepdim=True)
```

**Interesting observation**: `logit_maxes` are subtracted for numerical stability. Since changing them does not affect probabilities (softmax is shift-invariant), the gradient `dlogit_maxes` should be near zero — and it is (values ~1e-9), confirming the math is consistent.

#### `dlogits` (second branch) — backward through `max`

`logit_maxes = logits.max(1).values`. The gradient flows back only to the position of the max in each row (all others get 0). Using `F.one_hot`:

```python
dlogits += F.one_hot(logits.max(1).indices, num_classes=27) * dlogit_maxes
```

#### `dh`, `dW2`, `db2` — backward through second linear layer

`logits = h @ W2 + b2`. Shapes: `h=[32,64]`, `W2=[64,27]`, `b2=[27]`. The key insight: you don't need to memorize matrix gradient formulas. Just match shapes:

- `dh` must be `[32,64]` → only way from `[32,27]` and `[64,27]` is `dlogits @ W2.T`
- `dW2` must be `[64,27]` → only way from `[32,64]` and `[32,27]` is `h.T @ dlogits`
- `db2` must be `[27]` → sum over the batch dimension: `dlogits.sum(0)`

```python
dh = dlogits @ W2.T
dW2 = h.T @ dlogits
db2 = dlogits.sum(0)
```

#### `dhpreact` — backward through `tanh`

`h = tanh(hpreact)`. If `a = tanh(z)`, then `da/dz = 1 - a^2`. This is expressed in terms of the **output** `a`, not input `z`:

```python
dhpreact = (1.0 - h**2) * dh
```

#### `dbngain`, `dbnbias`, `dbnraw` — backward through BatchNorm scale/shift

`hpreact = bngain * bnraw + bnbias`. `bngain` and `bnbias` are `[1,64]`, `bnraw` is `[32,64]`:

```python
dbngain = (bnraw * dhpreact).sum(0, keepdim=True)
dbnraw   = bngain * dhpreact
dbnbias  = dhpreact.sum(0, keepdim=True)
```

Broadcasting requires summing over the batch dimension for `dbngain` and `dbnbias`.

#### `dbnvar_inv` — backward through `(bnvar + eps)^{-0.5}`

```python
dbnvar_inv = (bnraw * dbnraw).sum(0, keepdim=True)
```

Then backward through the power: `bnvar_inv = (bnvar + 1e-5)**-0.5`:

```python
dbnvar = (-0.5 * (bnvar + 1e-5)**-1.5) * dbnvar_inv
```

#### `dbndiff2` — backward through variance sum (with Bessel's correction)

`bnvar = bndiff2.sum(0, keepdim=True) / (n-1)`. A sum in forward = replication in backward:

```python
dbndiff2 = torch.ones_like(bndiff2) * (1.0/(n-1)) * dbnvar
```

#### `dbndiff` (second branch) — backward through squaring

`bndiff2 = bndiff**2`. Local derivative is `2*bndiff`:

```python
dbndiff += 2.0 * bndiff * dbndiff2
```

(`+=` because the first branch from `bnraw = bndiff * bnvar_inv` was already computed.)

#### `dbnmeani` and `dbndiff` (first branch) — backward through mean subtraction

`bndiff = hprebn - bnmeani`. `bnmeani` is `[1,64]` (broadcast). The gradient for `hprebn` copies directly; gradient for `bnmeani` gets a sum:

```python
dhprebn = dbndiff.clone()
dbnmeani = -dbndiff.sum(0, keepdim=True)
```

#### `dhprebn` (second branch) — backward through mean computation

`bnmeani = hprebn.mean(0, keepdim=True)` = `hprebn.sum(0, keepdim=True) / n`. A sum in forward = replication/broadcast in backward, scaled by `1/n`:

```python
dhprebn += torch.ones_like(hprebn) * (1.0/n) * dbnmeani
```

#### `demb`, `dW1`, `db1` — backward through first linear layer

`hprebn = embcat @ W1 + b1`. Shapes: `embcat=[32,30]`, `W1=[30,64]`, `b1=[64]`. Same shape-matching approach:

```python
dembcat = dhprebn @ W1.T
dW1     = embcat.T @ dhprebn
db1     = dhprebn.sum(0)
```

#### `demb` — backward through view/reshape

`embcat = emb.view(emb.shape[0], -1)`. View is just a re-interpretation of the underlying data, so backprop just reshapes `dembcat` back:

```python
demb = dembcat.view(emb.shape)
```

#### `dC` — backward through embedding table lookup

`emb = C[Xb]`. This is an indexing operation: each row of `C` at the index given by `Xb` is placed into `emb`. Backward: scatter gradients back by accumulating (since the same row of `C` can be looked up multiple times):

```python
dC = torch.zeros_like(C)
for k in range(Xb.shape[0]):
    for j in range(Xb.shape[1]):
        ix = Xb[k, j]
        dC[ix] += demb[k, j]
```

All gradients verified to match PyTorch's `autograd` exactly (or within floating-point tolerance ~1e-9).

### 4. Brief Digression: Bessel's Correction in BatchNorm (1:05:17)

In the variance computation, the code divides by `n-1` rather than `n`:

```python
bnvar = bndiff2.sum(0, keepdim=True) / (n-1)   # Bessel's correction
```

**Why this matters:**

- **Biased estimator** (divide by `n`): underestimates true population variance for small samples. This is what the original [[batch-normalization]] paper uses during training.
- **Unbiased estimator** (divide by `n-1`, Bessel's correction): corrects for the fact that the sample mean is estimated from the same data, leading to systematic underestimation.

**The PyTorch BatchNorm1d bug.** The original paper and PyTorch's `BatchNorm1d` use the biased version (`/n`) at training time but switch to the unbiased version (`/n-1`) when computing the running statistics for inference. This creates a **train/test discrepancy**. Karpathy considers this a design bug. He prefers using the unbiased version (`n-1`) consistently at both train and test time.

**Practical implication.** For large mini-batch sizes this discrepancy is negligible. For small mini-batches it can matter. PyTorch's `BatchNorm` does not expose a keyword argument to control this behavior, so most practitioners unknowingly have this inconsistency.

**PyTorch `torch.var` default.** `torch.var` is unbiased by default (`unbiased=True`), though the docs do not clearly state this.

### 5. Exercise 2: Cross Entropy Loss Backward Pass (1:26:31)

Instead of back-propagating through the ~8 atomic steps of the loss (logit_maxes, norm_logits, counts, probs, logprobs, ...), we derive the gradient of cross-entropy+softmax analytically.

**Setup (single example).** Loss is:

```
loss = -log(p_y)    where p_i = exp(l_i) / sum_j exp(l_j)
```

We want `dL/dl_i` for each logit `l_i`. Two cases arise:

- **Case `i != y`** (incorrect class): `dL/dl_i = p_i`
- **Case `i == y`** (correct class): `dL/dl_i = p_y - 1`

This simplifies to: `dL/dl_i = p_i - 1_{i==y}`, where the indicator subtracts 1 only at the correct class.

**Batch implementation:**

```python
dlogits = F.softmax(logits, dim=1)
dlogits[range(n), yb] -= 1
dlogits /= n
```

**Result**: Max difference from PyTorch's autograd is ~5e-9 (floating-point precision only).

**Intuition.** The gradient has a beautiful interpretation: for each example, the probabilities represent a "push-pull" force. We pull down the probabilities of incorrect classes and push up the probability of the correct class, with the total force summing to zero. The magnitude of the push/pull is proportional to how wrong the prediction currently is. A confidently mispredicted example gets a strong correction signal.

### 6. Exercise 3: Batch Norm Layer Backward Pass (1:36:37)

Similarly, instead of the step-by-step backward through all 6 batch-norm intermediate variables, we derive a single analytical formula for `dhprebn` given `dhpreact`.

**Problem statement.** In the BatchNorm paper notation: input `x` (= `hprebn`), output `y` (= `hpreact`), with `y_i = gamma * x_hat_i + beta`. We want `dL/dx_i` given all `dL/dy_i`.

**Derivation (pen and paper, 4 steps):**

1. `dL/dx_hat_i = dL/dy_i * gamma`   (trivial, from scale)
2. `dL/d(sigma^2) = sum_i [ dL/dx_hat_i * (x_i - mu) * (-0.5) * (sigma^2 + eps)^{-3/2} ]`
   - Note: `sigma^2` is a scalar with fan-out to all `x_hat_i`, so gradients sum over all `i`.
3. `dL/d(mu) = sum_i [ dL/dx_hat_i * (-1/sqrt(sigma^2 + eps)) ]`
   - The term through `sigma^2` vanishes when `mu` is the true batch mean (a special property that cancels).
4. `dL/dx_i = dL/dx_hat_i * (1/sqrt(sigma^2+eps))  +  dL/d(sigma^2) * 2(x_i - mu)/(n-1)  +  dL/d(mu) * (1/n)`

After substituting and simplifying, using `x_hat` values from the forward pass:

```python
dhprebn = (1.0/(n-1)) * bnvar_inv * (
    (n-1) * dhpreact_no_gamma
    - dhpreact_no_gamma.sum(0, keepdim=True)
    - bnraw * (dhpreact_no_gamma * bnraw).sum(0, keepdim=True)
)
```

where `dhpreact_no_gamma = bngain * dhpreact` (the `dL/dx_hat` term).

**Key challenge in implementation.** The formula is for a single neuron. In the actual network there are 64 neurons in the hidden layer. The implementation must handle all 64 neurons in parallel (across columns), with sums broadcasting correctly. Getting the shapes right is non-trivial.

**Result**: Max difference from PyTorch ~1e-9.

### 7. Exercise 4: Putting It All Together (1:50:02)

The network is re-initialized from scratch. The training loop replaces `loss.backward()` with the manual backward pass assembled from Exercises 1-3:

1. **Cross-entropy backward** (2-line analytical formula) → `dlogits`
2. **Second linear layer backward** (3 lines, shape-matching matmuls) → `dh`, `dW2`, `db2`
3. **tanh backward** (1 line) → `dhpreact`
4. **BatchNorm scale/shift backward** (3 lines) → `dbngain`, `dbnbias`, `dbnraw`
5. **BatchNorm analytical backward** (1 complex line) → `dhprebn`
6. **First linear layer backward** (3 lines) → `dembcat`, `dW1`, `db1`
7. **View backward** (1 line) → `demb`
8. **Embedding lookup backward** (for loop) → `dC`

Total backward pass: ~20 lines of Python.

The gradients are verified against PyTorch's autograd — they match to within ~1e-9. After confirming correctness, `loss.backward()` is commented out. The parameter update uses the manually computed gradients directly:

```python
for p, grad in zip(parameters, grads):
    p.data += -lr * grad
```

The entire block is wrapped in `torch.no_grad()` to tell PyTorch no backward pass is needed, making the computation more efficient.

**Result**: After training, the model achieves the same validation loss and produces the same quality of generated names as before. The backward pass is gone — replaced by first-principles calculus.

### 8. Outro (1:54:24)

Karpathy summarizes what was accomplished: a complete neural network trained from scratch without calling `loss.backward()`. Key reflections:

- Each layer's backward pass is only 2-3 lines of code.
- The batch normalization backward is the hardest, but still derivable analytically.
- In practice, you would use PyTorch autograd, but now you have genuine intuition for what it is doing.
- Visualizing gradient flow through networks (as "push-pull forces on probabilities") is a powerful mental model.
- Next lecture: Recurrent Neural Networks (RNNs), LSTMs, and more complex architectures.

## Core Concepts Explained

### [[backpropagation]] as a Leaky Abstraction

PyTorch's `loss.backward()` is convenient but hides the mechanics of gradient computation. When things go wrong (training instability, dead neurons, slow convergence), you need to understand *why* gradients flow the way they do. Treating backprop as a black box makes debugging almost impossible. This lecture removes the abstraction entirely.

### Chain Rule on Tensors

The chain rule for scalars (`dL/dx = dL/dy * dy/dx`) extends directly to tensors. For each operation in the compute graph:

1. Identify the **local derivative** (how this operation's output depends on its input).
2. Multiply by the **upstream gradient** (chain rule).
3. If the input was **broadcast** (reused), **sum** gradients over the replicated dimension.

### Shape-Based Reasoning for Matrix Gradients

For `D = A @ B + C`:
- `dA` must have shape `A.shape` — the only valid matmul of `dD` and `B` with the right shape is `dD @ B.T`.
- `dB` must have shape `B.shape` — it is `A.T @ dD`.
- `dC` must have shape `C.shape` — sum `dD` over any extra (batch) dimensions.

This reasoning replaces the need to memorize formulas.

### Broadcast = Sum in Backward; Sum = Broadcast in Backward

This duality is the most useful pattern for implementing correct tensor gradients:
- **Forward broadcast** (a tensor is replicated to match another's shape) → **backward sum** over the replicated dimension.
- **Forward sum** (a tensor is reduced over a dimension) → **backward broadcast/replicate** the gradient over that dimension.

### Softmax + Cross-Entropy Gradient

The combined gradient has a beautiful form:

```
dlogits[i] = softmax(logits)[i] - 1_{i == true_class}
```

This can be interpreted as: "reduce the probability of every class proportional to how much the model currently assigns to it, except for the true class which gets a unit push up." The gradient sums to zero across classes.

### [[batch-normalization]] Backward Pass

The analytical backward pass is significantly more complex than other layers because `mu` and `sigma^2` are computed *from the same batch*, creating a "closed loop" in the compute graph. Each input `x_i` influences all outputs `x_hat_j` through the shared statistics. The full formula accounts for three paths: through `x_hat_i` directly, through `sigma^2`, and through `mu`.

## Code Snippets

### Manual dlogprobs (Exercise 1)
```python
dlogprobs = torch.zeros_like(logprobs)
dlogprobs[range(n), yb] = -1.0 / n
```

### dprobs through log
```python
dprobs = (1.0 / probs) * dlogprobs
```

### Backward through matrix multiply (second linear layer)
```python
dh    = dlogits @ W2.T
dW2   = h.T @ dlogits
db2   = dlogits.sum(0)
```

### Backward through tanh
```python
dhpreact = (1.0 - h**2) * dh
```

### Analytical cross-entropy + softmax gradient (Exercise 2)
```python
dlogits = F.softmax(logits, dim=1)
dlogits[range(n), yb] -= 1
dlogits /= n
```

### Embedding table backward
```python
dC = torch.zeros_like(C)
for k in range(Xb.shape[0]):
    for j in range(Xb.shape[1]):
        ix = Xb[k, j]
        dC[ix] += demb[k, j]
```

### Analytical batch norm backward (Exercise 3)
```python
# dhpreact_no_gamma = bngain * dhpreact  (i.e., dL/dx_hat)
dhprebn = (1.0/(n-1)) * bnvar_inv * (
    (n-1) * dhpreact_no_gamma
    - dhpreact_no_gamma.sum(0, keepdim=True)
    - bnraw * (dhpreact_no_gamma * bnraw).sum(0, keepdim=True)
)
```

### Full manual training step (Exercise 4 outline)
```python
with torch.no_grad():
    # forward pass (fully expanded)
    # ... logits, loss computed explicitly ...

    # backward pass (manual)
    dlogits = F.softmax(logits, dim=1); dlogits[range(n), yb] -= 1; dlogits /= n
    dh    = dlogits @ W2.T;  dW2 = h.T @ dlogits;   db2 = dlogits.sum(0)
    dhpreact = (1.0 - h**2) * dh
    # ... batchnorm backward ...
    dembcat = dhprebn @ W1.T;  dW1 = embcat.T @ dhprebn;  db1 = dhprebn.sum(0)
    demb = dembcat.view(emb.shape)
    # ... embedding lookup backward ...

    # parameter update
    for p, grad in zip(parameters, grads):
        p.data += -lr * grad
```

## Resources

- [Jupyter notebook](https://github.com/karpathy/nn-zero-to-hero/blob/master/lectures/makemore/makemore_part4_backprop.ipynb)
- [Colab exercise](https://colab.research.google.com/drive/1WV2oi2fh9XXyldh02wupFQX0wh5ZC-z-)
- [Blog post: Yes you should understand backprop](https://karpathy.medium.com/yes-you-should-understand-backprop-e2f06eab496b)
- [BatchNorm paper](https://arxiv.org/abs/1502.03167)


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why Karpathy calls backpropagation a "leaky abstraction," and give a concrete example of a real-world bug this causes.
2. Describe the elegant analytical gradient formula for cross-entropy + softmax, and explain intuitively what it means for how the network corrects its predictions.
3. Explain the duality between broadcast and sum in tensor backpropagation — both directions — and why this single pattern is enough to derive most backward pass formulas correctly.

> [!example]- Answer Guide
> #### Q1 — Backprop as Leaky Abstraction
> 
> Backprop is a leaky abstraction because not understanding its internals leads to silent, hard-to-debug failures — for example, a real code snippet found online was trying to clip gradients but was actually clipping the loss values, which silently zeroed gradients on outliers because the author did not understand how gradients flow through the loss computation.
> 
> #### Q2 — Softmax Cross-Entropy Gradient Formula
> 
> The analytical gradient is `dlogits[i] = softmax(logits)[i] - 1_{i == true_class}`, divided by batch size. Intuitively, it pushes down the probability of every class proportional to how much probability mass the model currently assigns to it, while simultaneously pushing up the true class by 1 — the total force sums to zero across all classes, and the magnitude of correction is proportional to how wrong the prediction currently is.
> 
> #### Q3 — Broadcast-Sum Duality in Backprop
> 
> A forward broadcast (tensor replicated to match another's shape) requires summing gradients over the replicated dimension in the backward pass; conversely, a forward sum (reducing over a dimension) requires broadcasting/replicating the gradient over that dimension in the backward pass. This duality alone — combined with shape-matching — is sufficient to correctly derive gradient formulas for operations like batch norm, matrix multiply, and embedding lookups without memorizing any formulas.
