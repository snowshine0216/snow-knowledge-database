---
tags: [language-model, bigram, character-level, pytorch, neural-network, softmax, backpropagation, gradient-descent, negative-log-likelihood, makemore, zero-to-hero]
source: https://www.youtube.com/watch?v=PaCmpygFfXo
---

# The spelled-out intro to language modeling: building makemore

> **Instructor:** Andrej Karpathy
> **Duration:** 1 h 57 min | **Published:** 2022-09-07
> **Prerequisites:** Python basics; familiarity with [[karpathy-zero-to-hero-01-micrograd|MicroGrad]] (autograd / backprop concepts)
> **Code/Links:** [makemore on GitHub](https://github.com/karpathy/makemore) · [Jupyter notebook](https://github.com/karpathy/nn-zero-to-hero/blob/master/lectures/makemore/makemore_part1_bigrams.ipynb)
> **Series:** [[karpathy-zero-to-hero-01-micrograd|← Part 1: Micrograd]] | [[karpathy-zero-to-hero-03-makemore-mlp|Part 3: MLP →]]

---

## Overview

This lecture builds MakeMore, a character-level language model trained on 32,000 baby names to generate new name-like strings. Starting from raw data exploration, it constructs a bigram language model first by direct counting, then from scratch as a single-layer neural network optimized with gradient descent. By the end you understand how the two approaches are mathematically identical, why the neural network formulation is far more extensible, and have all the machinery needed to scale up to transformers in later videos.

---

## Module 1 — Dataset Exploration & Bigram Counting

**Timestamps:** `00:00:00 – 00:20:54` (~21 min)

### Key Concepts

- **Character-level language model**: models sequences one character at a time; predicts the next character given the preceding context.
- **Bigram model**: uses only the single previous character as context — the simplest possible language model.
- **Special token `.`**: a single boundary token replaces both `<S>` and `<E>`; index 0, all letters at indices 1–26.
- **`torch.Tensor` for counts**: a 27×27 integer tensor `N` where `N[i, j]` = number of times character `j` follows character `i` in the corpus.
- **`stoi` / `itos` mappings**: dictionaries for character↔integer conversion; constructed with `enumerate(sorted(set(all_chars)))`.

### Scripts

```python
# read data and count bigrams in a Python dictionary
with open('names.txt', 'r') as f:
    words = f.read().splitlines()

b = {}
for w in words:
    chs = ['.'] + list(w) + ['.']
    for ch1, ch2 in zip(chs, chs[1:]):
        bigram = (ch1, ch2)
        b[bigram] = b.get(bigram, 0) + 1

# build stoi / itos lookup tables
chars = sorted(list(set(''.join(words))))
stoi = {s: i+1 for i, s in enumerate(chars)}
stoi['.'] = 0
itos = {i: s for s, i in stoi.items()}

# build 27×27 count tensor N
import torch
N = torch.zeros((27, 27), dtype=torch.int32)

for w in words:
    chs = ['.'] + list(w) + ['.']
    for ch1, ch2 in zip(chs, chs[1:]):
        ix1 = stoi[ch1]
        ix2 = stoi[ch2]
        N[ix1, ix2] += 1

# visualize the bigram counts as a heatmap
from matplotlib import pyplot as plt
%matplotlib inline

plt.figure(figsize=(16, 16))
plt.imshow(N, cmap='Blues')
for i in range(N.shape[0]):
    for j in range(N.shape[1]):
        plt.text(j, i, itos[i] + itos[j], ha="center", va="bottom", color="gray")
        plt.text(j, i, N[i, j].item(), ha="center", va="top", color="gray")
plt.axis('off')
```

---

## Module 2 — Probabilistic Sampling & Loss Evaluation

**Timestamps:** `00:20:54 – 01:02:57` (~42 min)

### Key Concepts

- **Probability row**: convert raw counts to probabilities by dividing each row by its sum (`p = N[ix].float() / N[ix].float().sum()`).
- **`torch.multinomial`**: samples an integer index according to a probability distribution; accepts a `Generator` for reproducibility.
- **Negative log likelihood (NLL)**: the loss for classification. `loss = -log P(correct next char)` averaged over all training examples. Lower is better; 0 is perfect.
- **Tensor broadcasting**: operating on rows or columns of a 2D tensor without an explicit loop — `N / N.sum(1, keepdim=True)` normalizes all rows at once.
- **Model smoothing**: add fake counts (e.g., `+1`) to every entry before normalizing; prevents zero-probability bigrams and avoids `-inf` log loss.

### Scripts

```python
# normalize rows to get probability table (with +1 smoothing to avoid zero probs)
P = (N + 1).float()
P /= P.sum(1, keepdim=True)  # in-place row normalization; no new memory allocated

# sample the next character for each row
g = torch.Generator().manual_seed(2147483647)
ix = torch.multinomial(P, num_samples=1, replacement=True, generator=g)
for i in range(ix.shape[0]):
    print(f'the selected char after {itos[i]} is {itos[ix[i].item()]}')

# generate names by sampling character-by-character
g = torch.Generator().manual_seed(2147483647)
for _ in range(100):
    ix = 0
    out = []
    while True:
        p = P[ix]
        ix = torch.multinomial(p, num_samples=1, replacement=True, generator=g).item()
        out.append(itos[ix])
        if ix == 0:
            break
    print(''.join(out))

# compute negative log likelihood loss over the full dataset
# GOAL: maximize likelihood ≡ maximize log-likelihood ≡ minimize NLL
log_likelihood = 0.0
n = 0
for w in words:
    chs = ['.'] + list(w) + ['.']
    for ch1, ch2 in zip(chs, chs[1:]):
        ix1 = stoi[ch1]
        ix2 = stoi[ch2]
        prob = P[ix1, ix2]
        logprob = torch.log(prob)
        print(f'{ch1}{ch2}: {prob:.4f} {logprob:.4f}')
        log_likelihood += logprob
        n += 1

print(f'log likelihood: {log_likelihood:.4f}')
nll = -log_likelihood / n  # normalized negative log likelihood
print(f'nll: {nll:.4f}')
```

---

## Module 3 — Neural Network Forward Pass

**Timestamps:** `01:02:57 – 01:26:17` (~23 min)

### Key Concepts

- **One-hot encoding**: represent integer index `i` as a 27-dimensional vector of zeros with a 1 at position `i`; done with `F.one_hot(xs, num_classes=27).float()`.
- **Linear layer (no bias)**: a single weight matrix `W` of shape `(27, 27)` initialized with `torch.randn`; `logits = xenc @ W`.
- **Logits**: raw, unnormalized scores output by the network; can be any real number.
- **Softmax**: `probs = counts / counts.sum(1, keepdim=True)` where `counts = logits.exp()`. Converts logits to a valid probability distribution (positive, sums to 1).
- **`requires_grad=True`**: tells PyTorch to track operations on `W` so `.backward()` can populate `W.grad`.

### Scripts

```python
# create the training set of bigram (input, target) pairs
xs, ys = [], []
for w in words:
    chs = ['.'] + list(w) + ['.']
    for ch1, ch2 in zip(chs, chs[1:]):
        ix1 = stoi[ch1]
        ix2 = stoi[ch2]
        xs.append(ix1)
        ys.append(ix2)
xs = torch.tensor(xs)
ys = torch.tensor(ys)
print(xs.shape, ys.shape)

# forward pass: one-hot encode → linear layer → softmax
from torch.nn import functional as F
xenc = F.one_hot(xs, num_classes=27).float()  # (N, 27) one-hot input
W = torch.randn((27, 27), generator=g, requires_grad=True)
logits = xenc @ W                              # (N, 27) raw scores

# softmax: exponentiate then normalize each row
counts = logits.exp()
probs = counts / counts.sum(1, keepdim=True)   # (N, 27) probability distribution
print(probs.shape)
```

---

## Module 4 — Training Loop: Backward Pass & Optimization

**Timestamps:** `01:26:17 – 01:56:16` (~30 min)

### Key Concepts

- **Vectorized loss indexing**: `probs[torch.arange(n), ys]` efficiently plucks the model's predicted probability for every correct label simultaneously.
- **Gradient descent loop**: zero gradients (`W.grad = None`) → forward pass → compute loss → `loss.backward()` → `W.data += -lr * W.grad`.
- **Counting ≡ gradient descent**: for a single-layer bigram neural net, gradient descent converges to the same `W` as the counting table. `W.exp()` is the count matrix; `W` holds log-counts.
- **One-hot × W = row selection**: multiplying a one-hot vector by `W` simply selects the row of `W` corresponding to the active index — identical to the lookup in the counting approach.
- **Regularization as smoothing**: adding `λ * (W**2).mean()` to the loss penalizes large weights, pushing predictions toward uniform — mathematically equivalent to additive count smoothing.

### Scripts

```python
# vectorized NLL loss: pluck the probability of the correct label for each example
loss = -probs[torch.arange(228146), ys].log().mean()
print(loss)

# full training loop: 200 gradient descent steps
xenc = F.one_hot(xs, num_classes=27).float()
W = torch.randn((27, 27), generator=g, requires_grad=True)
for _ in range(200):
    # forward pass
    logits = xenc @ W
    counts = logits.exp()
    probs = counts / counts.sum(1, keepdim=True)
    loss = -probs[torch.arange(probs.shape[0]), ys].log().mean()

    # backward pass
    W.grad = None        # zero the gradients (equivalent to optimizer.zero_grad())
    loss.backward()      # compute all gradients via autograd

    # gradient descent update
    W.data += -50 * W.grad
    print(loss.item())

# sample names from the trained neural net model
g = torch.Generator().manual_seed(2147483647)
for _ in range(5):
    ix = 0
    out = []
    while True:
        xenc = F.one_hot(torch.tensor([ix]), num_classes=27).float()
        logits = xenc @ W
        counts = logits.exp()
        p = counts / counts.sum(1, keepdim=True)
        ix = torch.multinomial(p, num_samples=1, replacement=True, generator=g).item()
        out.append(itos[ix])
        if ix == 0:
            break
    print(''.join(out))
```

---

## The 5 Big Ideas

1. **Bigram as the simplest language model**: predicting only from the immediately preceding character; easy to implement by counting and normalizing a 2D array.
2. **Negative log likelihood is the right loss**: for multi-class prediction, NLL (cross-entropy) directly measures how well the model assigns probability to the true next character.
3. **Neural net = differentiable lookup table**: a one-hot input times a weight matrix is just a row selection; this realization connects gradient descent to direct counting.
4. **Softmax is the canonical output layer**: exponentiate logits → normalize → get probabilities. Used identically whether the net has one layer or a hundred.
5. **Gradient-based training is infinitely scalable**: counting works only for bigrams, but the neural net formulation extends naturally to [[karpathy-zero-to-hero-03-makemore-mlp|MLPs]], RNNs, and Transformers feeding arbitrary context.

## Related

- [[karpathy-zero-to-hero-01-micrograd|Part 1: Micrograd — autograd from scratch]]
- [[karpathy-zero-to-hero-03-makemore-mlp|Part 3: MLP — embeddings and multi-layer networks]]
- [[karpathy-zero-to-hero-04-makemore-batchnorm|Part 4: BatchNorm — activations and gradients]]
