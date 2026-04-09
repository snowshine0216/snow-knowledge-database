---
tags: [deep-learning, neural-network, multilayer-perceptron, nlp, language-model, makemore, pytorch, embeddings]
source: https://www.youtube.com/watch?v=TCH_1BHY58I
---

# Course: Building makemore Part 2: MLP

> **Instructor:** Andrej Karpathy
> **Duration:** 1 h 15 min | **Published:** 2022-09-12
> **Views:** 523,493 | **Likes:** 8,787
> **Prerequisites:** Bigram language model (makemore Part 1), basic PyTorch tensors, backpropagation (micrograd)
> **Code/Links:**
> - [makemore on GitHub](https://github.com/karpathy/makemore)
> - [Jupyter notebook](https://github.com/karpathy/nn-zero-to-hero/blob/master/lectures/makemore/makemore_part2_mlp.ipynb)
> - [Google Colab](https://colab.research.google.com/drive/1YIfmkftLrz6MPTOO9Vwqrop2Q5llHIGK?usp=sharing)
> - [Bengio et al. 2003 paper (PDF)](https://www.jmlr.org/papers/volume3/bengio03a/bengio03a.pdf)
> - [PyTorch internals blog post](http://blog.ezyang.com/2019/05/pytorch-internals/)

---

## Course Overview

We implement a character-level multilayer perceptron (MLP) language model following Bengio et al. 2003, moving beyond the bigram model from Part 1. The video covers the full pipeline: building the dataset with configurable context length, embedding characters into a learned vector space, constructing a hidden layer with tanh activation, and training with cross-entropy loss. Along the way, Karpathy introduces core ML practices — minibatch training, learning rate tuning, train/dev/test splits, and diagnosing underfitting vs. overfitting — achieving a validation loss of ~2.17, significantly beating the bigram baseline of 2.45.

---

## Module 1 — Paper Walkthrough and Dataset Construction

**Timestamps:** `00:00:00 – 00:18:34` (~18 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 1.1 | Introduction: limitations of the bigram model | 0:00:00 |
| 1.2 | Bengio et al. 2003 paper walkthrough | 0:01:48 |
| 1.3 | (Re-)building the training dataset with block size | 0:09:03 |
| 1.4 | Implementing the embedding lookup table | 0:12:19 |

### Key Concepts
- **Context length explosion**: With a bigram model, taking more context causes the count table to grow exponentially (27^n rows for n characters of context), making it impractical beyond 1-2 characters.
- **Embedding lookup table (C)**: A learnable matrix where each character (or word, in the paper) is mapped to a dense vector. For 27 characters with 2D embeddings, C is a 27x2 matrix. Indexing into C is equivalent to multiplying a one-hot vector by C.
- **Block size**: The number of previous characters used as context to predict the next one. Set to 3 in this video (predict 4th character from previous 3).
- **One-hot equivalence**: `C[5]` (direct index) produces the same result as `F.one_hot(tensor(5), 27).float() @ C` — the one-hot encoding masks out all rows except row 5.

### Learning Objectives
- [ ] Explain why bigram count tables don't scale to longer contexts
- [ ] Describe the architecture from Bengio et al. 2003 (embedding → hidden → softmax)
- [ ] Build a dataset of (context, target) pairs with configurable block size
- [ ] Understand that embedding lookup is equivalent to one-hot multiplication

---

## Module 2 — Building the MLP: Hidden Layer, Output, and Loss

**Timestamps:** `00:18:35 – 00:37:55` (~19 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 2.1 | Implementing the hidden layer + torch.Tensor internals (storage, views) | 0:18:35 |
| 2.2 | Implementing the output layer | 0:29:15 |
| 2.3 | Implementing the negative log likelihood loss | 0:29:53 |
| 2.4 | Summary of the full network | 0:32:17 |
| 2.5 | Introducing F.cross_entropy and why | 0:32:49 |

### Key Concepts
- **Concatenating embeddings via view()**: Instead of `torch.cat(torch.unbind(emb, 1), dim=1)` which allocates new memory, use `emb.view(-1, block_size * emb_dim)` — this is a zero-copy reshape that only changes tensor metadata (storage offset, strides, shape), not the underlying memory.
- **torch.Tensor internals**: Every tensor has a 1D storage in memory. `view()` manipulates shape/stride metadata without copying data, making it extremely efficient.
- **Broadcasting discipline**: When adding bias `b1` (shape 100) to `h` (shape 32x100), PyTorch broadcasts correctly — `b1` becomes 1x100, then copies vertically across all 32 rows. Always verify broadcasting dimensions.
- **F.cross_entropy advantages over manual implementation**:
  1. **Fused kernels**: Forward pass is more efficient (no intermediate tensors for exp, sum, log).
  2. **Simpler backward pass**: Analytically derived gradients are mathematically simpler (similar to how tanh backward is just `1 - t²` instead of backprop through each sub-operation).
  3. **Numerical stability**: Internally subtracts `max(logits)` before exponentiation to prevent overflow (e^100 = inf, but e^0 is fine; subtracting a constant doesn't change softmax output).

### Learning Objectives
- [ ] Use `view()` instead of `cat` to reshape embeddings for the hidden layer input
- [ ] Explain why `view()` is a zero-copy operation via tensor storage internals
- [ ] Implement the full forward pass: embedding → hidden (tanh) → logits → loss
- [ ] List three reasons to prefer `F.cross_entropy` over manual softmax + NLL

---

## Module 3 — Training: Overfitting, Minibatches, and Learning Rate Search

**Timestamps:** `00:37:56 – 00:53:19` (~15 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 3.1 | Training loop: overfitting one batch | 0:37:56 |
| 3.2 | Training on the full dataset with minibatches | 0:41:25 |
| 3.3 | Finding a good initial learning rate | 0:45:40 |

### Key Concepts
- **Overfitting a single batch**: Start by verifying the network can drive loss near zero on a tiny subset (32 examples from 5 words with 3,400 parameters). If it can't, there's a bug. Loss won't reach exactly zero because identical contexts can map to different labels (e.g., "..." → e, o, a, s).
- **Minibatch SGD**: Full-batch gradient on 228K examples is too slow. Instead, sample a random minibatch (e.g., 32 examples) per step using `torch.randint`. The gradient is noisier but the speedup vastly outweighs the noise — many approximate steps beat few exact steps.
- **Learning rate search**: Sweep learning rates exponentially from 10^(-3) to 10^0 over 1,000 steps using `torch.linspace` on the exponent. Plot loss vs. exponent to find the sweet spot — too low = barely moves, too high = loss explodes. For this model, 10^(-1) = 0.1 is a good learning rate.
- **Learning rate decay**: After training at the found learning rate for a while, reduce it (e.g., by 10x) for final convergence. This is done manually/heuristically here, not with a scheduler.

### Learning Objectives
- [ ] Verify a network works by overfitting a small batch first
- [ ] Implement minibatch training with `torch.randint` indexing
- [ ] Perform exponential learning rate sweep and read the loss-vs-LR plot
- [ ] Apply simple learning rate decay to squeeze out final performance

---

## Module 4 — Evaluation: Train/Dev/Test Splits and Scaling Experiments

**Timestamps:** `00:53:20 – 01:15:39` (~22 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 4.1 | Splitting into train/val/test and why | 0:53:20 |
| 4.2 | Experiment: larger hidden layer (300 neurons) | 1:00:49 |
| 4.3 | Visualizing 2D character embeddings | 1:05:27 |
| 4.4 | Experiment: larger embedding size (10D) | 1:07:16 |
| 4.5 | Summary of final code and conclusion | 1:11:46 |
| 4.6 | Sampling from the model | 1:13:24 |
| 4.7 | Google Colab notebook | 1:14:55 |

### Key Concepts
- **Three-way split (80/10/10)**:
  - **Training set** (~25K words): optimizes model parameters via gradient descent.
  - **Dev/validation set** (~3K words): tunes hyperparameters (hidden size, embedding dim, learning rate, etc.). You evaluate on dev frequently.
  - **Test set** (~3K words): evaluate only once at the very end to report final performance. Every time you look at test loss and adjust something, you're implicitly training on it.
- **Underfitting vs. overfitting diagnosis**: When train loss ≈ dev loss, the model is underfitting — increase capacity. When dev loss >> train loss, the model is overfitting — regularize or get more data.
- **Bottleneck identification**: Scaling the hidden layer from 100→300 neurons (3.4K→10K params) didn't help much → the 2D embedding was the bottleneck. Scaling embeddings from 2D→10D (with 200 hidden neurons, ~11K params) improved loss from ~2.23 to ~2.17.
- **Embedding visualization**: With 2D embeddings, we can scatter-plot all 27 characters. The trained embeddings show structure: vowels (a, e, i, o, u) cluster together, rare characters (q) are isolated, the special dot character is far from letters.
- **Sampling from the model**: Start with all-dots context, embed → hidden → logits → `F.softmax` → `torch.multinomial` to sample next character, shift context window, repeat until generating the stop token.

### Learning Objectives
- [ ] Implement 80/10/10 train/dev/test split and explain why each is needed
- [ ] Diagnose underfitting (train ≈ dev loss) vs. overfitting (dev >> train loss)
- [ ] Identify architecture bottlenecks by scaling components independently
- [ ] Visualize and interpret learned character embeddings
- [ ] Sample names from the trained model using softmax + multinomial

---

## Course Summary

### The 5 Big Ideas

1. **Embeddings solve the curse of dimensionality**: Instead of exponentially growing count tables, learn a dense vector for each character that captures similarity structure — similar characters get similar embeddings.
2. **Tensor views are free reshapes**: `view()` changes how a 1D memory block is interpreted as an n-dimensional tensor without copying data, making operations like concatenating embeddings essentially free.
3. **Use F.cross_entropy, not manual softmax**: It's faster (fused kernels), numerically stable (max-subtraction trick), and has a simpler backward pass.
4. **Learning rate is found, not guessed**: Sweep exponentially across orders of magnitude, plot loss vs. LR exponent, and pick the value in the "sweet spot" before the loss starts exploding.
5. **Evaluate on held-out data, not training data**: Train/dev/test splits prevent you from confusing memorization with generalization. Dev loss guides hyperparameter choices; test loss is reported once.

### Recommended Exercises

- E01: Tune hyperparameters to beat the best validation loss of 2.17
- E02: Fix the initialization — compute the expected loss for uniform predictions at init, compare to actual starting loss, and tune initialization to match
- E03: Read Bengio et al. 2003 and implement any idea from the paper
- Experiment with different block sizes (context lengths) and measure the effect on validation loss
- Try different embedding dimensions and hidden layer sizes to map the underfitting/overfitting frontier

---

## Source Notes

- **Transcript source:** `manual subtitles`
- **Cookie-auth retry:** used
- **Data gaps:** none
