---
tags: [language-model, bigram, character-level, pytorch, neural-network, softmax, backpropagation, gradient-descent, negative-log-likelihood, makemore, zero-to-hero]
source: https://www.youtube.com/watch?v=PaCmpygFfXo
---

# Course: The spelled-out intro to language modeling: building makemore

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

### Learning Objectives

- [ ] Sample character sequences from a normalized bigram probability table
- [ ] Compute negative log likelihood as a scalar loss over the entire training set
- [ ] Apply additive smoothing to a bigram model and understand its effect on the distribution

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

### Learning Objectives

- [ ] Construct `(Xs, Ys)` integer pair datasets from raw text
- [ ] One-hot encode integer inputs and multiply through a weight matrix
- [ ] Apply softmax to obtain per-example probability distributions over the vocabulary

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
