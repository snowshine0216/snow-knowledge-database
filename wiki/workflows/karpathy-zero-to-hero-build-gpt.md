---
tags: [gpt, transformers, self-attention, pytorch, language-model, nanoGPT, andrej-karpathy, zero-to-hero, course, rlhf]
source: https://www.youtube.com/watch?v=kCc8FmEb1nY
---

# Zero to Hero: Let's Build GPT from Scratch

Builds a GPT (decoder-only Transformer) in ~200 lines of PyTorch on tiny Shakespeare. Each component is added incrementally from a bigram baseline, matching the GPT-2/GPT-3 architecture exactly.

## Architecture Stack

```
Token Embedding + Positional Embedding
  → N × Transformer Block:
      LayerNorm → Multi-Head Self-Attention → Residual Add
      LayerNorm → FeedForward (Linear→ReLU→Linear) → Residual Add
  → LayerNorm → Linear → logits
```

Final hyperparams: `n_embd=384, n_head=6, n_layer=6, block_size=256, dropout=0.2` → ~10.7M params → val loss ≈ 1.48.

## Self-Attention: Four Versions

| Version | Mechanism | Purpose |
|---------|-----------|---------|
| v1 | For-loop averaging past tokens | Correct but O(T^2) loop |
| v2 | `torch.tril` mask + matmul | Same result, vectorized |
| v3 | Softmax over masked weights | Data-dependent weighting |
| **v4** | **Q/K/V self-attention** | Full mechanism: `softmax(QK^T/√d) @ V` |

### Q/K/V Intuition
- **Query**: "what am I looking for?"
- **Key**: "what do I contain?"
- **Value**: "what will I communicate?"
- **Scale by √head_size**: prevents softmax saturation when dot products grow large

## Transformer Components

| Component | Role |
|-----------|------|
| Multi-head attention | N parallel heads (each `d/N` dim), concatenated + projected. Each head specializes |
| FeedForward | `Linear(d, 4d) → ReLU → Linear(4d, d)` per position — "thinking time" after attention |
| Residual connections | `x = x + sublayer(x)` — gradients flow straight through addition |
| Pre-LayerNorm | Normalize across features per token (not across batch like BatchNorm) |
| Dropout (p=0.2) | After attention weights and feedforward; disabled at inference |

## Transformer Variants

| Variant | Mask | Use Case | Example |
|---------|------|----------|---------|
| Encoder-only | None (bidirectional) | Classification, embeddings | BERT |
| **Decoder-only** | **Causal (lower-triangular)** | **Generation** | **GPT** |
| Encoder-decoder | Cross-attention | Translation, summarization | T5 |

**Cross-attention**: queries from decoder, keys+values from encoder.

## ChatGPT Training Pipeline
1. **Pretraining**: next-token prediction on ~300B tokens
2. **SFT**: fine-tune on human-written prompt-completion pairs
3. **Reward model**: train on human preference rankings
4. **RLHF (PPO)**: optimize GPT against the reward model

The architecture is *identical* to this lecture — scale + data + RLHF creates ChatGPT.

## Key Insight
> Build incrementally and verify at every step. Bigram → single-head → multi-head → full transformer. Each addition is small, testable, and motivated.

## Exercises
- EX1: Combine `Head` + `MultiHeadAttention` into batched parallel heads (answer: nanoGPT)
- EX2: Train on your own dataset (try teaching addition)
- EX4: Implement one modern feature (RoPE, GQA, SwiGLU) and check val loss

## Related
- [[karpathy-zero-to-hero-03-makemore-mlp]] — prerequisite: MLP language model
- [[karpathy-zero-to-hero-gpt-tokenizer]] — companion: BPE tokenization
- [[karpathy-from-scratch-series]] — repo-level overview (micrograd, minBPE, nanoGPT)
- [[3b1b-deep-learning]] — visual intuition for attention and transformers
