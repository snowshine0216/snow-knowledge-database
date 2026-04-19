---
tags: [language-model, bigram, character-level, pytorch, neural-network, softmax, backpropagation, gradient-descent, negative-log-likelihood, makemore, zero-to-hero]
source: https://www.youtube.com/watch?v=PaCmpygFfXo
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. A bigram language model predicts the next character using how many previous characters as context? What makes this the "simplest possible" language model?
2. A neural network's final linear layer outputs logits `[3.0, 1.0, 0.5]`. What operation converts these into a valid probability distribution? Walk through the two sub-steps of that operation and explain what happens to the relative differences between values.
3. Write the NLL loss formula for $N$ training examples. Why does it include a negative sign, and what does a loss of **0** mean in concrete terms?
4. PyTorch offers both `nn.NLLLoss` and `nn.CrossEntropyLoss`. What is the key difference in what each one expects as input, and which should you prefer when training from raw logits — and why?

---

# Course: 02-build-makemore-part-1-bigram

> **Instructor:** Andrej Karpathy
> **Duration:** 1 h 57 min | **Published:** 2022-09-07
> **Views:** 1,120,197 | **Likes:** 18,673
> **Prerequisites:** Python basics; familiarity with [[01-the-spelled-out-intro-to-neural-networks-and-backpropagation-building-micrograd_VMj-3S1tku0|MicroGrad]] (autograd / backprop concepts)
> **Code/Links:** [makemore on GitHub](https://github.com/karpathy/makemore) · [Jupyter notebook](https://github.com/karpathy/nn-zero-to-hero/blob/master/lectures/makemore/makemore_part1_bigrams.ipynb)

---

## Course Overview

This lecture builds MakeMore, a character-level language model trained on 32,000 baby names to generate new name-like strings. Starting from raw data exploration, it constructs a bigram language model first by direct counting, then from scratch as a single-layer neural network optimized with gradient descent. By the end you understand how the two approaches are mathematically identical, why the neural network formulation is far more extensible, and have all the machinery needed to scale up to transformers in later videos.

---

## Module 1 — Dataset Exploration & Bigram Counting

**Timestamps:** `00:00:00 – 00:20:54` (~21 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 1.1 | Intro: what is MakeMore? | 00:00:00 |
| 1.2 | Reading and exploring names.txt | 00:03:03 |
| 1.3 | Exploring bigrams in the dataset | 00:06:24 |
| 1.4 | Counting bigrams in a Python dictionary | 00:09:24 |
| 1.5 | Counting bigrams in a 2D `torch.Tensor` | 00:12:45 |
| 1.6 | Visualizing the bigram tensor with matplotlib | 00:18:19 |

### Key Concepts

- **Character-level language model**: models sequences one character at a time; predicts the next character given the preceding context.
- **Bigram model**: uses only the single previous character as context — the simplest possible language model.
- **Special token `.`**: a single boundary token replaces both `<S>` and `<E>`; index 0, all letters at indices 1–26.
- **`torch.Tensor` for counts**: a 27×27 integer tensor `N` where `N[i, j]` = number of times character `j` follows character `i` in the corpus.
- **`stoi` / `itos` mappings**: dictionaries for character↔integer conversion; constructed with `enumerate(sorted(set(all_chars)))`.

### Learning Objectives

- [ ] Load a text dataset and extract character bigrams with Python's `zip` trick
- [ ] Build a character-to-index lookup table and populate a 2D count tensor
- [ ] Visualize a bigram frequency matrix with `matplotlib.pyplot.imshow`

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

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 2.1 | Consolidating start/end into a single `.` token | 00:20:54 |
| 2.2 | Sampling from the bigram model | 00:24:02 |
| 2.3 | Vectorized row normalization & tensor broadcasting | 00:36:17 |
| 2.4 | Loss function: negative log likelihood | 00:50:14 |
| 2.5 | Model smoothing with fake counts | 01:00:50 |

### Key Concepts

- **Probability row**: convert raw counts to probabilities by dividing each row by its sum (`p = N[ix].float() / N[ix].float().sum()`).
- **`torch.multinomial`**: samples an integer index according to a probability distribution; accepts a `Generator` for reproducibility.
- **Negative log likelihood (NLL)**: the loss for classification. `loss = -log P(correct next char)` averaged over all training examples. Lower is better; 0 is perfect.
- **Tensor broadcasting**: operating on rows or columns of a 2D tensor without an explicit loop — `N / N.sum(1, keepdim=True)` normalizes all rows at once.
- **Model smoothing**: add fake counts (e.g., `+1`) to every entry before normalizing; prevents zero-probability bigrams and avoids `-inf` log loss.

#### Deep Dive: Negative Log Likelihood (NLL)

NLL is the core loss function for classification tasks. In character prediction, the intuition is simple: **we want the model to assign as high a probability as possible to the correct next character.**

**1. The Formula**

For $N$ training examples, where $P_i$ is the model's predicted probability for the correct character at step $i$:

$$\mathcal{L} = -\frac{1}{N} \sum_{i=1}^{N} \log(P_i)$$

- $P_i \in (0, 1]$ — the probability assigned to the true label.
- $\sum$ — sums log-probabilities across all examples.
- $\frac{1}{N}$ — normalizes by dataset size so loss magnitude is independent of $N$.
- **Negative sign** — converts maximization into minimization (explained below).

**2. Why the Negative Sign?**

We want to *maximize* the likelihood of the correct answers — i.e., maximize $P_1 \times P_2 \times \cdots \times P_N$. Products of small numbers are numerically unstable (they underflow to zero), so we take $\log$ to convert products into sums.

But $\log(P)$ for $P \in (0, 1]$ is always $\leq 0$: it equals $0$ at perfect confidence and $-\infty$ as $P \to 0$. Since optimizers *minimize* by convention, we flip the sign — turning "maximize log-likelihood" into "minimize negative log-likelihood."

**3. How Loss Scales with Confidence**

| Predicted probability $P_i$ | $\log(P_i)$ | Loss $-\log(P_i)$ | Assessment |
|---|---|---|---|
| **1.0 (100%)** | 0 | **0** | Perfect — no penalty |
| **0.5 (50%)** | −0.69 | **0.69** | Acceptable |
| **0.1 (10%)** | −2.30 | **2.30** | Poor — moderate penalty |
| **0.01 (1%)** | −4.60 | **4.60** | Bad — heavy penalty |
| **0.0001** | −9.21 | **9.21** | Near-zero confidence — severe penalty |

The loss is **0** when the model is perfectly certain and **approaches infinity** as confidence in the correct answer collapses.

**4. Relationship to Cross-Entropy**

For single-label classification (one correct answer per example), NLL and cross-entropy are identical. In PyTorch:

- `nn.NLLLoss` — expects log-probabilities (i.e., output of `log_softmax`).
- `nn.CrossEntropyLoss` — expects raw logits; applies `log_softmax` internally (numerically more stable, prefer this).

**5. Expected Initial Loss**

At initialization, a random model distributes probability uniformly over all 27 characters, so each character gets $P \approx 1/27 \approx 0.037$. The expected initial NLL is:

$$-\log(1/27) \approx 3.3$$

If training brings the loss from **3.3 → 2.0**, the model has learned meaningful character-pair patterns. In code:

```python
loss = -prob.log().mean()  # prob = model's predicted P for the correct next char
```

### Learning Objectives

- [ ] Sample character sequences from a normalized bigram probability table
- [ ] Compute negative log likelihood as a scalar loss over the entire training set
- [ ] Apply additive smoothing to a bigram model and understand its effect on the distribution

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

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 3.1 | Part 2 intro: the neural network approach | 01:02:57 |
| 3.2 | Creating the bigram dataset `(Xs, Ys)` | 01:05:26 |
| 3.3 | One-hot encoding integers for neural net input | 01:10:01 |
| 3.4 | Single linear layer via matrix multiplication | 01:13:53 |
| 3.5 | Softmax: turning logits into probabilities | 01:18:46 |
| 3.6 | Summary & preview of upcoming videos | 01:26:17 |

### Key Concepts

- **One-hot encoding**: represent integer index `i` as a 27-dimensional vector of zeros with a 1 at position `i`; done with `F.one_hot(xs, num_classes=27).float()`.
- **Linear layer (no bias)**: a single weight matrix `W` of shape `(27, 27)` initialized with `torch.randn`; `logits = xenc @ W`.
- **Logits**: raw, unnormalized scores output by the network; can be any real number.
- **Softmax**: `probs = counts / counts.sum(1, keepdim=True)` where `counts = logits.exp()`. Converts logits to a valid probability distribution (positive, sums to 1).
- **`requires_grad=True`**: tells PyTorch to track operations on `W` so `.backward()` can populate `W.grad`.

#### Deep Dive: Softmax

Softmax is the final step in a classification network's forward pass. Its job: convert a vector of arbitrary real numbers (logits) into a valid probability distribution — positive values that sum to exactly 1.

**1. Why Softmax Exists**

A linear layer outputs logits: raw scores that can be any real number, positive or negative, with no constraint on their sum. They cannot be used directly as probabilities. Softmax fixes both problems in one step.

**2. The Formula**

For a logit vector $z$ with $K$ elements, the Softmax output for element $i$ is:

$$P_i = \frac{e^{z_i}}{\sum_{j=1}^{K} e^{z_j}}$$

Two operations in sequence:

1. **Exponentiation ($e^{z_i}$)**: forces all values positive; amplifies differences — a slightly larger logit becomes a disproportionately larger count ("winner-take-more").
2. **Normalization (divide by sum)**: all outputs land in $(0, 1)$ and their sum is exactly 1.

**3. Step-by-Step Example**

Logits: `[2.0, 1.0, 0.1]`

| Step | Computation | Result |
|---|---|---|
| **Exponentiate** | $[e^{2.0},\ e^{1.0},\ e^{0.1}]$ | `[7.39, 2.72, 1.11]` |
| **Sum** | $7.39 + 2.72 + 1.11$ | `11.22` |
| **Normalize** | `[7.39/11.22, 2.72/11.22, 1.11/11.22]` | **`[0.66, 0.24, 0.10]`** |

The highest logit (2.0) captures 66% of the probability mass.

**4. Key Properties**

- **Temperature sensitivity**: scaling all logits up (e.g., `[20, 10, 1]`) makes the distribution sharper — probability piles onto the top class. Scaling down makes it flatter, approaching uniform. Large weights → overconfident predictions.
- **Differentiable**: softmax has well-defined gradients everywhere, so backpropagation flows through it to update `W`.
- **Numerical stability**: $e^{z_i}$ overflows for large $z_i$. The standard fix: subtract the max first — $e^{z_i - \max(z)} / \sum_j e^{z_j - \max(z)}$ — mathematically identical but never overflows.
- **Softmax + NLL = Cross-Entropy**: `nn.CrossEntropyLoss` fuses `log_softmax` and `NLLLoss` into one stable operation. Always prefer it over computing softmax then NLL separately.

**5. Softmax in the Bigram Neural Net**

```
One-hot input → xenc @ W → Logits → Softmax → Probs → NLL Loss
```

In code:

```python
logits = xenc @ W                              # raw scores (any real number)
counts = logits.exp()                          # exponentiate → all positive
probs  = counts / counts.sum(1, keepdim=True)  # normalize → valid distribution
loss   = -probs[torch.arange(n), ys].log().mean()  # NLL over correct chars
```

### Learning Objectives

- [ ] Construct `(Xs, Ys)` integer pair datasets from raw text
- [ ] One-hot encode integer inputs and multiply through a weight matrix
- [ ] Apply softmax to obtain per-example probability distributions over the vocabulary

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

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 4.1 | Vectorized NLL loss over the full dataset | 01:35:49 |
| 4.2 | `loss.backward()` and gradient update in PyTorch | 01:38:36 |
| 4.3 | Putting it all together (full training loop) | 01:42:55 |
| 4.4 | Note 1: one-hot × W = row lookup into W | 01:47:49 |
| 4.5 | Note 2: model smoothing = regularization loss | 01:50:18 |
| 4.6 | Sampling from the trained neural net | 01:54:31 |
| 4.7 | Conclusion | 01:56:16 |

### Key Concepts

- **Vectorized loss indexing**: `probs[torch.arange(n), ys]` efficiently plucks the model's predicted probability for every correct label simultaneously.
- **Gradient descent loop**: zero gradients (`W.grad = None`) → forward pass → compute loss → `loss.backward()` → `W.data += -lr * W.grad`.
- **Counting ≡ gradient descent**: for a single-layer bigram neural net, gradient descent converges to the same `W` as the counting table. `W.exp()` is the count matrix; `W` holds log-counts.
- **One-hot × W = row selection**: multiplying a one-hot vector by `W` simply selects the row of `W` corresponding to the active index — identical to the lookup in the counting approach.
- **Regularization as smoothing**: adding `λ * (W**2).mean()` to the loss penalizes large weights, pushing predictions toward uniform — mathematically equivalent to additive count smoothing.

### Learning Objectives

- [ ] Compute the NLL loss in vectorized form using advanced PyTorch indexing
- [ ] Run a complete gradient descent loop (zero grad → forward → loss → backward → update)
- [ ] Explain why the one-hot linear model and the counting model are equivalent
- [ ] Add L2 regularization to the loss and understand its effect on learned probabilities
- [ ] Sample from the trained neural net model

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

## Course Summary

### The 5 Big Ideas

1. **Bigram as the simplest language model**: predicting only from the immediately preceding character; easy to implement by counting and normalizing a 2D array.
2. **Negative log likelihood is the right loss**: for multi-class prediction, NLL (cross-entropy) directly measures how well the model assigns probability to the true next character.
3. **Neural net = differentiable lookup table**: a one-hot input times a weight matrix is just a row selection; this realization connects gradient descent to direct counting.
4. **Softmax is the canonical output layer**: exponentiate logits → normalize → get probabilities. Used identically whether the net has one layer or a hundred.
5. **Gradient-based training is infinitely scalable**: counting works only for bigrams, but the neural net formulation extends naturally to MLPs, RNNs, and Transformers feeding arbitrary context.

### Recommended Exercises

- **E01**: Train a trigram language model (two characters → predict third) using either counting or a neural net; compare loss to the bigram baseline.
- **E02**: Split the dataset 80/10/10 (train/dev/test); train only on the training set and evaluate on dev and test to observe generalization.
- **E03**: Use the dev set to tune the smoothing strength (additive count or regularization λ); plot train vs. dev loss as smoothing varies.
- **E04**: Remove `F.one_hot` and instead directly index into rows of `W` — confirm the loss is identical.
- **E05**: Replace the manual NLL computation with `F.cross_entropy`; verify the same loss; understand why `cross_entropy` is numerically preferred.
- **E06**: Design your own follow-on exercise and complete it.

---

## Source Notes

- **Transcript source:** `asr-openai`
- **Cookie-auth retry:** used
- **Data gaps:** transcript was ASR-generated; minor transcription artifacts possible in code variable names
- **Notebook:** `build_makemore_part1.ipynb`


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why a single-layer neural network bigram model and the direct counting approach produce mathematically identical results after training converges.
2. Walk through the full gradient descent training loop for the bigram neural net — what happens at each step, and what does `W.data += -50 * W.grad` actually do to the weight matrix?
3. Explain how additive count smoothing (adding fake counts) and L2 regularization in the neural net loss are mathematically equivalent, and what effect both have on the learned probability distribution.
4. Given logits `[2.0, 1.0, 0.1]` and the correct class is index 0: (a) compute the Softmax probabilities by hand, (b) compute the NLL loss for this single example, and (c) explain why `nn.CrossEntropyLoss` produces the same result without an explicit softmax step — and why it is numerically preferred.

> [!example]- Answer Guide
> #### Q1 — Bigram Model vs Direct Counting
> 
> Multiplying a one-hot input vector by weight matrix `W` simply selects the row of `W` corresponding to the active character index — identical to the counting table lookup. After gradient descent, `W.exp()` converges to the bigram count matrix, meaning `W` holds log-counts; the two approaches are the same computation reached by different paths.
> 
> #### Q2 — Gradient Descent Training Loop Steps
> 
> The loop zeros gradients (`W.grad = None`), runs the forward pass (one-hot → `xenc @ W` → `logits.exp()` → row-normalize to `probs`), computes NLL loss via `probs[arange, ys].log().mean()`, calls `loss.backward()` to populate `W.grad` via autograd, then subtracts the scaled gradient from `W.data` — nudging weights in the direction that reduces the loss.
> 
> #### Q3 — Smoothing and L2 Regularization Equivalence
> 
> Adding `+1` fake counts before normalizing prevents zero probabilities and pulls the distribution toward uniform; adding `λ * (W**2).mean()` to the neural net loss penalizes large weights with the same effect — both regularize by discouraging extreme probability assignments and keeping predictions closer to a uniform distribution over characters.
> 
> #### Q4 — Softmax NLL and CrossEntropyLoss
> 
> **(a)** Exponentiate: `[e²·⁰, e¹·⁰, e⁰·¹] = [7.39, 2.72, 1.11]`; sum = 11.22; probabilities = **`[0.659, 0.242, 0.099]`**.
> 
> **(b)** Correct class is index 0 with $P_0 = 0.659$; NLL = $-\log(0.659) \approx$ **0.418**.
> 
> **(c)** `nn.CrossEntropyLoss` takes raw logits and internally applies `log_softmax` (computing $z_i - \log\sum_j e^{z_j}$) before taking the negative mean — mathematically equivalent but numerically stable because it avoids computing $e^{z_i}$ and then immediately taking $\log$ of it (which amplifies floating-point errors). The fused `log_softmax` operation computes the result directly without the intermediate exponentiation.
