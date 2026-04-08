---
tags: [language-model, bigram, character-level, pytorch, softmax, negative-log-likelihood, makemore, andrej-karpathy, zero-to-hero, course]
source: https://www.youtube.com/watch?v=PaCmpygFfXo
---

# Zero to Hero 02: Language Modeling — Bigrams (makemore Part 1)

Builds a character-level language model on 32K baby names using two equivalent approaches: direct counting and a single-layer neural network. The key revelation: they converge to the same solution.

## Two Approaches, Same Result

### Approach 1: Counting
- Build a 27x27 count tensor `N[i,j]` = times char `j` follows char `i`
- Normalize rows to get probabilities: `P = N / N.sum(1, keepdim=True)`
- Sample via `torch.multinomial`

### Approach 2: Neural Network
- One-hot encode input → multiply by weight matrix `W` (27x27) → softmax → probabilities
- Train with gradient descent on negative log likelihood loss
- **Result**: `W.exp()` converges to the count matrix. `W` holds log-counts.

### Why They're Equivalent
- One-hot multiplication `x @ W` is just row selection from `W` — identical to table lookup
- Gradient descent finds the maximum likelihood solution, which is the normalized count table
- **But**: the neural net formulation scales to MLPs, RNNs, Transformers. Counting does not.

## Key Concepts

| Concept | Definition |
|---------|-----------|
| Bigram model | Predict next char from only the previous char — simplest possible LM |
| Special token `.` | Single boundary token at index 0; letters at 1-26 |
| NLL loss | `-log P(correct next char)` averaged over training set |
| Tensor broadcasting | `N / N.sum(1, keepdim=True)` normalizes all rows without loops |
| Smoothing = Regularization | Adding fake counts (+1) ≡ adding `λ*(W**2).mean()` L2 penalty |

## Practical Patterns
- **`stoi`/`itos` mappings**: `enumerate(sorted(set(chars)))` for character↔integer conversion
- **Vectorized loss indexing**: `probs[torch.arange(n), ys]` plucks correct-label probabilities efficiently
- **`requires_grad=True`**: tells PyTorch to track operations for `.backward()`

## Exercises
- E01: Train a trigram model (two chars → predict third)
- E02: Split 80/10/10 and evaluate generalization
- E05: Replace manual NLL with `F.cross_entropy`

## Related
- [[karpathy-zero-to-hero-01-micrograd]] — prerequisite: autograd and backpropagation
- [[karpathy-zero-to-hero-03-makemore-mlp]] — next: scaling beyond bigrams with an MLP
- [[karpathy-from-scratch-series]] — repo-level overview
