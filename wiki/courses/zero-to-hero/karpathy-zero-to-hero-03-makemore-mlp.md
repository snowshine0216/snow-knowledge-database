---
tags: [deep-learning, neural-network, multilayer-perceptron, nlp, language-model, makemore, pytorch, embeddings]
source: https://www.youtube.com/watch?v=TCH_1BHY58I
---

# Building makemore Part 2: MLP

> **Instructor:** Andrej Karpathy
> **Duration:** 1 h 15 min | **Published:** 2022-09-12
> **Prerequisites:** [[karpathy-zero-to-hero-02-makemore-bigrams|Bigram language model]], basic PyTorch tensors, [[karpathy-zero-to-hero-01-micrograd|backpropagation]]
> **Code/Links:**
> - [makemore on GitHub](https://github.com/karpathy/makemore)
> - [Jupyter notebook](https://github.com/karpathy/nn-zero-to-hero/blob/master/lectures/makemore/makemore_part2_mlp.ipynb)
> - [Bengio et al. 2003 paper (PDF)](https://www.jmlr.org/papers/volume3/bengio03a/bengio03a.pdf)
> **Series:** [[karpathy-zero-to-hero-02-makemore-bigrams|← Part 2: Bigrams]] | [[karpathy-zero-to-hero-04-makemore-batchnorm|Part 4: BatchNorm →]]

---

## Overview

We implement a character-level multilayer perceptron (MLP) language model following Bengio et al. 2003, moving beyond the [[karpathy-zero-to-hero-02-makemore-bigrams|bigram model]]. The video covers the full pipeline: building the dataset with configurable context length, embedding characters into a learned vector space, constructing a hidden layer with tanh activation, and training with cross-entropy loss. Along the way, Karpathy introduces core ML practices — minibatch training, learning rate tuning, train/dev/test splits, and diagnosing underfitting vs. overfitting — achieving a validation loss of ~2.17, significantly beating the bigram baseline of 2.45.

---

## Module 1 — Paper Walkthrough and Dataset Construction

**Timestamps:** `00:00:00 – 00:18:34` (~18 min)

### Key Concepts
- **Context length explosion**: With a bigram model, taking more context causes the count table to grow exponentially (27^n rows for n characters of context), making it impractical beyond 1-2 characters.
- **Embedding lookup table (C)**: A learnable matrix where each character (or word, in the paper) is mapped to a dense vector. For 27 characters with 2D embeddings, C is a 27x2 matrix. Indexing into C is equivalent to multiplying a one-hot vector by C.
- **Block size**: The number of previous characters used as context to predict the next one. Set to 3 in this video (predict 4th character from previous 3).
- **One-hot equivalence**: `C[5]` (direct index) produces the same result as `F.one_hot(tensor(5), 27).float() @ C` — the one-hot encoding masks out all rows except row 5.

### Scripts

```python
import torch
import torch.nn.functional as F
import matplotlib.pyplot as plt
%matplotlib inline

# read all the words
with open('names.txt', 'r') as f:
    words = f.read().splitlines()

# build the vocabulary of characters and mappings to/from integers
chars = sorted(list(set("".join(words))))
stoi = {ch: i + 1 for i, ch in enumerate(chars)}
stoi['.'] = 0
itos = {i: ch for ch, i in stoi.items()}
print(itos)

# build the dataset with block_size=3: use 3 previous chars to predict the next
block_size = 3
X, Y = [], []
for w in words:
    context = [0] * block_size
    for ch in w + '.':
        ix = stoi[ch]
        X.append(context)
        Y.append(ix)
        context = context[1:] + [ix]  # slide the context window

X = torch.tensor(X)
Y = torch.tensor(Y)
print(X.shape)  # (228146, 3)
print(Y.shape)  # (228146,)

# initialize the embedding lookup table C: 27 chars × 2D embeddings
C = torch.randn((27, 2))
# C[5] == F.one_hot(tensor(5), 27).float() @ C  — lookup is equivalent to one-hot multiply
```

---

## Module 2 — Building the MLP: Hidden Layer, Output, and Loss

**Timestamps:** `00:18:35 – 00:37:55` (~19 min)

### Key Concepts
- **Concatenating embeddings via view()**: Instead of `torch.cat(torch.unbind(emb, 1), dim=1)` which allocates new memory, use `emb.view(-1, block_size * emb_dim)` — this is a zero-copy reshape that only changes tensor metadata (storage offset, strides, shape), not the underlying memory.
- **torch.Tensor internals**: Every tensor has a 1D storage in memory. `view()` manipulates shape/stride metadata without copying data, making it extremely efficient.
- **Broadcasting discipline**: When adding bias `b1` (shape 100) to `h` (shape 32x100), PyTorch broadcasts correctly — `b1` becomes 1x100, then copies vertically across all 32 rows. Always verify broadcasting dimensions.
- **F.cross_entropy advantages over manual implementation**:
  1. **Fused kernels**: Forward pass is more efficient (no intermediate tensors for exp, sum, log).
  2. **Simpler backward pass**: Analytically derived gradients are mathematically simpler (similar to how tanh backward is just `1 - t²` instead of backprop through each sub-operation).
  3. **Numerical stability**: Internally subtracts `max(logits)` before exponentiation to prevent overflow (e^100 = inf, but e^0 is fine; subtracting a constant doesn't change softmax output).

### Scripts

```python
# initialize all parameters (C already defined above)
W1 = torch.randn((6, 100))    # 6 = block_size * emb_dim = 3 * 2
b1 = torch.randn(100)
W2 = torch.randn((100, 27))
b2 = torch.randn(27)
parameters = [C, W1, b1, W2, b2]
for p in parameters:
    p.requires_grad = True

# full forward pass on entire dataset (slow — for illustration only)
for _ in range(1000):
    emb = C[X]                               # (228146, 3, 2) — embed all contexts
    h = torch.tanh(emb.view(-1, 6) @ W1 + b1)  # (228146, 100) — view() zero-copy reshape
    logits = h @ W2 + b2                     # (228146, 27) — output logits
    loss = F.cross_entropy(logits, Y)        # scalar loss (fused, numerically stable)
    print(loss.item())
    for p in parameters:
        p.grad = None
    loss.backward()
    for p in parameters:
        p.data -= 0.1 * p.grad

# evaluate on full dataset
emb = C[X]
h = torch.tanh(emb.view(-1, 6) @ W1 + b1)
logits = h @ W2 + b2
loss = F.cross_entropy(logits, Y)
print(loss.item())
```

---

## Module 3 — Training: Overfitting, Minibatches, and Learning Rate Search

**Timestamps:** `00:37:56 – 00:53:19` (~15 min)

### Key Concepts
- **Overfitting a single batch**: Start by verifying the network can drive loss near zero on a tiny subset. If it can't, there's a bug. Loss won't reach exactly zero because identical contexts can map to different labels (e.g., "..." → e, o, a, s).
- **Minibatch SGD**: Full-batch gradient on 228K examples is too slow. Instead, sample a random minibatch (e.g., 32 examples) per step using `torch.randint`. The gradient is noisier but the speedup vastly outweighs the noise — many approximate steps beat few exact steps.
- **Learning rate search**: Sweep learning rates exponentially from 10^(-3) to 10^0 over 1,000 steps using `torch.linspace` on the exponent. Plot loss vs. exponent to find the sweet spot — too low = barely moves, too high = loss explodes. For this model, 10^(-1) = 0.1 is a good learning rate.
- **Learning rate decay**: After training at the found learning rate for a while, reduce it (e.g., by 10x) for final convergence. Done manually/heuristically here, not with a scheduler.

### Scripts

```python
# reset parameters before LR search
W1 = torch.randn((6, 100))
b1 = torch.randn(100)
W2 = torch.randn((100, 27))
b2 = torch.randn(27)
parameters = [C, W1, b1, W2, b2]

# generate LR candidates: sweep 10^-3 to 10^0 exponentially
lre = torch.linspace(-3, 0, 1000)
lrs = 10 ** lre

# re-init with fixed seed for reproducibility
g = torch.Generator().manual_seed(2147483647)
W1 = torch.randn((6, 100), generator=g)
b1 = torch.randn(100, generator=g)
W2 = torch.randn((100, 27), generator=g)
b2 = torch.randn(27, generator=g)
parameters = [C, W1, b1, W2, b2]
for p in parameters:
    p.requires_grad = True

# LR sweep: track exponent and loss at each step
lri = []
lossi = []
for i in range(1000):
    ix = torch.randint(0, X.shape[0], (32,))
    Xb, Yb = X[ix], Y[ix]
    emb = C[Xb]
    h = torch.tanh(emb.view(-1, 6) @ W1 + b1)
    logits = h @ W2 + b2
    loss = F.cross_entropy(logits, Yb)
    for p in parameters:
        p.grad = None
    loss.backward()
    lr = lrs[i]
    for p in parameters:
        p.data -= lr * p.grad
    lri.append(lre[i])     # log10 of LR
    lossi.append(loss.item())

plt.plot(lri, lossi)
plt.show()

# train with the chosen LR=0.1 for 10k steps
for _ in range(10000):
    ix = torch.randint(0, X.shape[0], (32,))
    Xb, Yb = X[ix], Y[ix]
    emb = C[Xb]
    h = torch.tanh(emb.view(-1, 6) @ W1 + b1)
    logits = h @ W2 + b2
    loss = F.cross_entropy(logits, Yb)
    for p in parameters:
        p.grad = None
    loss.backward()
    for p in parameters:
        p.data -= 0.1 * p.grad
print(loss.item())

# learning rate decay: reduce to 0.01 in the plateau region
for _ in range(10000):
    ix = torch.randint(0, X.shape[0], (32,))
    Xb, Yb = X[ix], Y[ix]
    emb = C[Xb]
    h = torch.tanh(emb.view(-1, 6) @ W1 + b1)
    logits = h @ W2 + b2
    loss = F.cross_entropy(logits, Yb)
    for p in parameters:
        p.grad = None
    loss.backward()
    for p in parameters:
        p.data -= 0.01 * p.grad
print(loss.item())
```

---

## Module 4 — Evaluation: Train/Dev/Test Splits and Scaling Experiments

**Timestamps:** `00:53:20 – 01:15:39` (~22 min)

### Key Concepts
- **Three-way split (80/10/10)**:
  - **Training set** (~25K words): optimizes model parameters via gradient descent.
  - **Dev/validation set** (~3K words): tunes hyperparameters (hidden size, embedding dim, learning rate, etc.). You evaluate on dev frequently.
  - **Test set** (~3K words): evaluate only once at the very end. Every time you look at test loss and adjust something, you're implicitly training on it.
- **Underfitting vs. overfitting diagnosis**: When train loss ≈ dev loss, the model is underfitting — increase capacity. When dev loss >> train loss, the model is overfitting — regularize or get more data.
- **Bottleneck identification**: Scaling the hidden layer from 100→300 neurons didn't help much → the 2D embedding was the bottleneck. Scaling embeddings from 2D→10D improved loss from ~2.23 to ~2.17.
- **Embedding visualization**: With 2D embeddings, scatter-plot all 27 characters. Vowels cluster together, rare chars (q) are isolated, '.' is far from letters.
- **Sampling**: Start with all-dots context, embed → hidden → logits → `F.softmax` → `torch.multinomial` → shift window → repeat until stop token.

### Scripts

```python
# build dataset function for reuse
def build_dataset(words):
    block_size = 3
    X, Y = [], []
    for w in words:
        context = [0] * block_size
        for ch in w + '.':
            ix = stoi[ch]
            X.append(context)
            Y.append(ix)
            context = context[1:] + [ix]
    return torch.tensor(X), torch.tensor(Y)

# 80/10/10 train/dev/test split
import random
random.seed(42)
random.shuffle(words)
n1 = int(0.8 * len(words))
n2 = int(0.9 * len(words))

Xtr,  Ytr  = build_dataset(words[:n1])
Xdev, Ydev = build_dataset(words[n1:n2])
Xte,  Yte  = build_dataset(words[n2:])

# experiment 1: larger hidden layer (300 neurons)
g = torch.Generator().manual_seed(2147483647)
W1 = torch.randn((6, 300), generator=g)
b1 = torch.randn(300, generator=g)
W2 = torch.randn((300, 27), generator=g)
b2 = torch.randn(27, generator=g)
parameters = [C, W1, b1, W2, b2]
for p in parameters:
    p.requires_grad = True

stepi, lossi = [], []
for i in range(30000):
    ix = torch.randint(0, Xtr.shape[0], (32,))
    Xb, Yb = Xtr[ix], Ytr[ix]
    emb = C[Xb]
    h = torch.tanh(emb.view(-1, 6) @ W1 + b1)
    logits = h @ W2 + b2
    loss = F.cross_entropy(logits, Yb)
    for p in parameters:
        p.grad = None
    loss.backward()
    for p in parameters:
        p.data -= 0.01 * p.grad
    stepi.append(i)
    lossi.append(loss.item())

plt.plot(stepi, lossi)

# evaluate train and dev loss
emb = C[Xtr];  h = torch.tanh(emb.view(-1, 6) @ W1 + b1)
print('train:', F.cross_entropy(h @ W2 + b2, Ytr).item())
emb = C[Xdev]; h = torch.tanh(emb.view(-1, 6) @ W1 + b1)
print('dev:  ', F.cross_entropy(h @ W2 + b2, Ydev).item())

# visualize 2D character embeddings (only works for 2D C)
plt.figure(figsize=(8, 8))
plt.scatter(C[:, 0].data, C[:, 1].data, s=200)
for i in range(C.shape[0]):
    plt.text(C[i, 0].item(), C[i, 1].item(), itos[i], ha="center", va="center", color="white")
plt.grid('minor')
# closer points = characters model considers more interchangeable in this task

# experiment 2: scale to 10D embeddings + 200 hidden neurons (~11K params)
g = torch.Generator().manual_seed(2147483647)
C  = torch.randn((27, 10), generator=g)
W1 = torch.randn((30, 200), generator=g)   # 30 = block_size * 10
b1 = torch.randn(200, generator=g)
W2 = torch.randn((200, 27), generator=g)
b2 = torch.randn(27, generator=g)
parameters = [C, W1, b1, W2, b2]
for p in parameters:
    p.requires_grad = True
print(sum(p.numel() for p in parameters))  # total parameter count

stepi, lossi = [], []
for i in range(200000):
    ix = torch.randint(0, Xtr.shape[0], (32,))
    Xb, Yb = Xtr[ix], Ytr[ix]
    emb = C[Xb]
    h = torch.tanh(emb.view(-1, W1.shape[0]) @ W1 + b1)
    logits = h @ W2 + b2
    loss = F.cross_entropy(logits, Yb)
    for p in parameters:
        p.grad = None
    loss.backward()
    lr = 0.1 if i < 100000 else 0.01   # decay halfway through
    for p in parameters:
        p.data -= lr * p.grad
    stepi.append(i)
    lossi.append(loss.log10().item())   # log10 for better visualization

plt.plot(stepi, lossi)

# final train loss
emb = C[Xtr]; h = torch.tanh(emb.view(-1, W1.shape[0]) @ W1 + b1)
print('train:', F.cross_entropy(h @ W2 + b2, Ytr).item())

# sample names from the final model
g = torch.Generator().manual_seed(2147483647)
for _ in range(20):
    out = []
    context = [0] * block_size
    while True:
        emb = C[torch.tensor([context])]          # (1, block_size, emb_dim)
        h = torch.tanh(emb.view(1, -1) @ W1 + b1)  # (1, hidden_dim)
        logits = h @ W2 + b2                      # (1, 27)
        probs = F.softmax(logits, dim=-1)
        ix = torch.multinomial(probs, num_samples=1, generator=g).item()
        context = context[1:] + [ix]
        out.append(ix)
        if ix == 0:
            break
    print(''.join(itos[i] for i in out))
```

---

## The 5 Big Ideas

1. **Embeddings solve the curse of dimensionality**: Instead of exponentially growing count tables, learn a dense vector for each character that captures similarity structure — similar characters get similar embeddings.
2. **Tensor views are free reshapes**: `view()` changes how a 1D memory block is interpreted as an n-dimensional tensor without copying data, making operations like concatenating embeddings essentially free.
3. **Use F.cross_entropy, not manual softmax**: It's faster (fused kernels), numerically stable (max-subtraction trick), and has a simpler backward pass.
4. **Learning rate is found, not guessed**: Sweep exponentially across orders of magnitude, plot loss vs. LR exponent, and pick the value in the "sweet spot" before the loss starts exploding.
5. **Evaluate on held-out data, not training data**: Train/dev/test splits prevent you from confusing memorization with generalization. Dev loss guides hyperparameter choices; test loss is reported once.

## Related

- [[karpathy-zero-to-hero-02-makemore-bigrams|Part 2: Bigrams — the simplest character-level model]]
- [[karpathy-zero-to-hero-04-makemore-batchnorm|Part 4: BatchNorm — activations, gradients, and batch normalization]]
- [[karpathy-zero-to-hero-build-gpt|Let's build GPT — scaling to transformers]]
