---
tags: [neural-networks, backpropagation, tokenization, bpe, transformers, gpt, pytorch, andrej-karpathy, from-scratch, deep-learning]
source: https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ
---

# Karpathy "From Scratch" Series

Andrej Karpathy's three hands-on tutorials form a bottom-up learning path through the core machinery of modern language models. Each session builds a working system from zero lines of code, making the math tangible before any framework abstractions enter the picture. The progression is deliberate: backpropagation first, then tokenization, then the full [[transformers]] architecture.

## Part 1 -- micrograd: Backpropagation and Autograd (2 h 25 min)

The series begins with **micrograd**, a ~150-line automatic differentiation engine written in pure Python. The central abstraction is a `Value` object that wraps a scalar, records every arithmetic operation in a directed acyclic graph (DAG), and stores a `_backward` closure implementing the [[backpropagation]] chain rule for that operation.

Key ideas built in this session:

- **Numerical derivatives** as `(f(x+h) - f(x)) / h`, then the leap to symbolic local derivatives composed via the chain rule.
- **Topological sort** over the expression DAG so each node receives its full gradient before propagating further.
- **Gradient accumulation** -- when a value is reused in an expression, gradients must be summed (`+=`), not overwritten.
- A minimal neural network library (`Neuron`, `Layer`, `MLP`) on top of the autograd engine, plus the universal training loop: forward pass, zero gradients, backward pass, parameter update.

The punchline: PyTorch and JAX do exactly this math -- they just batch scalars into tensors for GPU parallelism.

## Part 2 -- minBPE: The GPT Tokenizer (2 h 13 min)

Tokenization is the translation layer between raw text and the integer sequences that feed into a language model. This lecture builds a complete **Byte Pair Encoding (BPE)** tokenizer from scratch.

Key ideas built in this session:

- Start with 256 raw byte tokens, then iteratively find the most frequent consecutive pair, mint a new token ID, and replace all occurrences. Each merge compresses the sequence and grows the vocabulary by one.
- **Regex pre-splitting** prevents cross-category merges (letters merging with punctuation, spaces merging with words) by chunking input before BPE runs.
- **Special tokens** (`<|endoftext|>`, FIM tokens, chat markers) bypass BPE entirely and require embedding-matrix surgery to add post-training.
- A mechanistic tour of why [[large-language-models]] struggle with spelling, arithmetic, non-English text, and Python indentation -- all traceable to tokenization artifacts.

The lecture compares the production libraries **tiktoken** (OpenAI, inference-only, UTF-8 bytes) and **SentencePiece** (Google, trains and infers, Unicode code points with byte fallback).

## Part 3 -- nanoGPT: Building GPT from Scratch (1 h 56 min)

The final tutorial assembles a full **decoder-only Transformer** in ~200 lines of PyTorch, following the "Attention Is All You Need" architecture.

Key ideas built in this session:

- **Self-attention in four versions**: naive averaging loop, matrix-multiply with `tril` mask, softmax weighting, and full Query/Key/Value scaled dot-product attention. Each version is a strict refinement of the one before.
- **Multi-head attention** runs several independent heads in parallel so different heads can specialize in different relational patterns, then concatenates and projects back.
- **Transformer block** = multi-head attention + feedforward network, each wrapped in [[layer-normalization]] and a residual connection. Residual connections let gradients flow through deep stacks; LayerNorm stabilizes training.
- **Scaling up**: with `n_embd=384, n_head=6, n_layer=6` (~10.7M parameters), the model reaches val loss ~1.48 on tiny Shakespeare and generates coherent text.
- The architecture is identical to GPT-2/GPT-3. The gap to ChatGPT is scale, data, supervised fine-tuning, and [[rlhf]].

## The Learning Progression

The three tutorials are designed to be taken in order:

1. **micrograd** teaches *why* gradients flow and *how* backpropagation works at the scalar level -- the foundation everything else rests on.
2. **minBPE** teaches *what* the model actually sees: not characters or words, but byte-pair tokens with surprising quirks that shape model behavior.
3. **nanoGPT** combines both: token embeddings feed into a Transformer whose parameters are trained via the same backpropagation algorithm built in part 1, on sequences produced by the tokenizer built in part 2.

Together they cover the full stack from raw text to trained language model, with no black boxes.

## Resources

| Tutorial | Duration | Code |
|----------|----------|------|
| micrograd | 2 h 25 min | [karpathy/micrograd](https://github.com/karpathy/micrograd) |
| GPT Tokenizer | 2 h 13 min | [karpathy/minbpe](https://github.com/karpathy/minbpe) |
| Build GPT | 1 h 56 min | [karpathy/nanoGPT](https://github.com/karpathy/nanoGPT) |
