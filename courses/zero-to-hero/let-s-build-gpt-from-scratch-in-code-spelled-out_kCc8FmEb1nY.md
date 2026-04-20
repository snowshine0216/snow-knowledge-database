---
tags: [neural-networks, deep-learning, gpt, transformers, self-attention, pytorch, language-model, andrej-karpathy, course, nanoGPT, rlhf]
source: https://www.youtube.com/watch?v=kCc8FmEb1nY
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. In self-attention, what do Q, K, and V stand for, and what role does each play in computing the output?
2. What is the key architectural difference between an encoder-only transformer (like BERT) and a decoder-only transformer (like GPT)?
3. Why do deep neural networks use residual (skip) connections — what problem do they solve?

---

# Course: Let's Build GPT — From Scratch, in Code, Spelled Out

> **Instructor:** Andrej Karpathy
> **Duration:** 1 h 56 min | **Published:** 2023-01-17
> **Views:** 7.0M | **Likes:** 155K
> **Prerequisites:** Basic Python, PyTorch `nn`, autoregressive language modeling (makemore series)
> **Code:** [ng-video-lecture](https://github.com/karpathy/ng-video-lecture) · [nanoGPT](https://github.com/karpathy/nanoGPT) · [Google Colab](https://colab.research.google.com/drive/1JMLa53HDuA-i7ZBmqV7ZnA3c_fvtXnx-?usp=sharing)

---

## Course Overview

This lecture builds a **Generatively Pretrained Transformer (GPT)** from scratch in ~200 lines of PyTorch, following the "Attention Is All You Need" paper and matching OpenAI's GPT-2/GPT-3 architecture. Starting from the simplest possible character-level language model (bigram), each component of self-attention and the transformer block is added one at a time, explained, and verified before moving on. By the end the model trains on tiny Shakespeare and produces coherent text. The same architecture, scaled up, is nanoGPT — and the same principles underlie ChatGPT.

---

## Module 1 — Setup: Data, Tokenization & the Baseline Problem

**Timestamps:** `00:00:00 – 00:22:11` (~22 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 1.1 | Intro: ChatGPT, Transformers, nanoGPT, Shakespeare | 0:00 |
| 1.2 | Reading and exploring the data | 7:52 |
| 1.3 | Tokenization, train/val split | 9:28 |
| 1.4 | Data loader: batches of chunks of data | 14:27 |

### Key Concepts
- A **language model** predicts the probability of the next token given prior context — GPT is just a very deep, well-trained version of this.
- **Character-level tokenization**: 65 unique characters in tiny Shakespeare; each character gets an integer ID. `encode` → `decode` are inverse functions.
- **Train/val split**: 90 % training, 10 % validation. Validation loss detects overfitting.
- **Data loader (`get_batch`)**: samples random offsets of length `block_size`; inputs `x` and targets `y` are offset by 1 — every position in the chunk is a training example predicting its successor.
- **Block size = context window**: how many prior tokens the model can look at when predicting the next one.

### Learning Objectives
- [ ] Encode a text corpus into integer tokens and reconstruct it exactly.
- [ ] Split a dataset into train/val and explain why.
- [ ] Write `get_batch` to produce `(x, y)` pairs of shape `(B, T)`.

---

## Module 2 — Baseline: Bigram Language Model

**Timestamps:** `00:22:11 – 00:42:13` (~20 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 2.1 | Simplest baseline: bigram model, loss, generation | 22:11 |
| 2.2 | Training the bigram model | 34:53 |
| 2.3 | Port code to a script | 38:00 |

### Key Concepts
- **Bigram model**: an `nn.Embedding(vocab_size, vocab_size)` table — each token directly looks up logits for the next token. Zero context beyond the immediately preceding character.
- **Cross-entropy loss**: measures how surprised the model is at the true next token. Starting loss ~2.5 bits; random baseline for 65 tokens = ln(65) ≈ 4.17.
- **Autoregressive generation**: sample token → append to context → sample again. Loops until desired length.
- **AdamW optimizer**: used throughout; more stable than plain SGD for transformer training.
- After training the bigram model, val loss ≈ 2.5 — readable but nonsensical. This is the floor without context.
```python
import torch
import torch.nn as nn
from torch.nn import functional as F
torch.manual_seed(1337)
class BigramLanguageModel(nn.Module):
	def __init__(self, vocab_size):
		super().__init__()
		# each token directly reads off the logits for the next token from a lookup table
		self.token_embedding_table = nn.Embedding(vocab_size, vocab_size)
	def forward(self, idx, targets=None):
		# idx and targets are both (B,T) tensor of integers
		logits = self.token_embedding_table(idx) # (B,T,C)
		if targets is None:
			loss = None
		else:
			B, T, C = logits.shape
			logits = logits.view(B*T, C)
			targets = targets.view(B*T)
			loss = F.cross_entropy(logits, targets)
		return logits, loss

	def generate(self, idx, max_new_tokens):
		# idx is (B, T) array of indices in the current context
		for _ in range(max_new_tokens):
		# get the predictions
			logits, loss = self(idx)		
			# focus only on the last time step		
			logits = logits[:, -1, :] # becomes (B, C)		
			# apply softmax to get probabilities	
			probs = F.softmax(logits, dim=-1) # (B, C)	
			# sample from the distribution	
			idx_next = torch.multinomial(probs, num_samples=1) # (B, 1)	
			# append sampled index to the running sequence	
			idx = torch.cat((idx, idx_next), dim=1) # (B, T+1)
		return idx

m = BigramLanguageModel(vocab_size)
logits, loss = m(xb, yb)
print(logits.shape)
print(loss)
print(decode(m.generate(idx = torch.zeros((1, 1), dtype=torch.long), max_new_tokens=100)[0].tolist()))
```

### Learning Objectives
- [ ] Implement `BigramLanguageModel` with an embedding table, forward pass, and generation loop.
- [ ] Compute cross-entropy loss and run a training loop.
- [ ] Observe that without context, generated text is random-looking but letter-frequency-correct.

---

## Module 3 — Building Self-Attention (v1 → v4)

**Timestamps:** `00:42:13 – 01:19:11` (~37 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 3.1 | v1: averaging past context with for loops | 42:13 |
| 3.2 | The trick: matrix multiply as weighted aggregation | 47:11 |
| 3.3 | v2: using matrix multiply (`torch.tril`) | 51:54 |
| 3.4 | v3: adding softmax weighting | 54:42 |
| 3.5 | Positional encoding | 1:00:18 |
| 3.6 | **v4 (crux): full Q/K/V self-attention** | 1:02:00 |
| 3.7 | Note 1: attention as communication | 1:11:38 |
| 3.8 | Note 2: no notion of space — operates over sets | 1:12:46 |
| 3.9 | Note 3: no communication across batch dimension | 1:13:40 |
| 3.10 | Note 4: encoder vs. decoder blocks | 1:14:14 |
| 3.11 | Note 5: self-attention vs. cross-attention | 1:15:39 |
| 3.12 | Note 6: "scaled" attention — why divide by √head_size | 1:16:56 |

### Key Concepts
- **v1 (for loop)**: each position averages all prior token embeddings. Correct semantics, O(T²) loop.
```python
# We want x[b,t] = mean_{i<=t} x[b,i]
xbow = torch.zeros((B,T,C))
for b in range(B):
	for t in range(T):
		xprev = x[b,:t+1] # (t,C)
		xbow[b,t] = torch.mean(xprev, 0)
```
- **v2 (matrix multiply)**: `torch.tril` mask + divide by row sums gives the same average in one matmul — the key efficiency insight.
```python
# version 2: using matrix multiply for a weighted aggregation
wei = torch.tril(torch.ones(T, T))
wei = wei / wei.sum(1, keepdim=True)
xbow2 = wei @ x # (B, T, T) @ (B, T, C) ----> (B, T, C)
torch.allclose(xbow, xbow2)
```
- **v3 (softmax)**: replace uniform average with learned weights via `softmax(masked_fill(-inf))`. Sets up data-dependent weighting.
```python
# version 3: use Softmax
tril = torch.tril(torch.ones(T, T))
wei = torch.zeros((T,T))
wei = wei.masked_fill(tril == 0, float('-inf'))
wei = F.softmax(wei, dim=-1)
xbow3 = wei @ x
torch.allclose(xbow, xbow3)
```
- **v4 (full self-attention)**:
  - Each token emits a **query** ("what am I looking for?"), a **key** ("what do I contain?"), and a **value** ("what will I communicate?").
  - Attention weights = `softmax(Q @ Kᵀ / √head_size)` with future masked to `-inf`.
  - Output = `weights @ V` — a data-dependent weighted sum of values.
```python
# version 4: self-attention!
torch.manual_seed(1337)
B,T,C = 4,8,32 # batch, time, channels
x = torch.randn(B,T,C)
# let's see a single Head perform self-attention
head_size = 16
key = nn.Linear(C, head_size, bias=False)
query = nn.Linear(C, head_size, bias=False)
value = nn.Linear(C, head_size, bias=False)
k = key(x) # (B, T, 16)
q = query(x) # (B, T, 16)
wei = q @ k.transpose(-2, -1) # (B, T, 16) @ (B, 16, T) ---> (B, T, T)
tril = torch.tril(torch.ones(T, T))
#wei = torch.zeros((T,T))
wei = wei.masked_fill(tril == 0, float('-inf'))
wei = F.softmax(wei, dim=-1)
v = value(x)
out = wei @ v
#out = wei @ x
out.shape
```
- **Positional encoding**: token embeddings + positional embeddings (also learned `nn.Embedding`). Without this, attention is position-invariant.
- **Decoder block** (this video): lower-triangular mask prevents future leakage. **Encoder block** (BERT): no mask — every token sees every other.
- **Cross-attention** (T5): queries from decoder, keys+values from encoder — how the decoder consults encoded input.
- **Why scale by √head_size**: when `head_size` is large, Q·K dot products grow in variance, pushing softmax into saturation (near-one-hot). Dividing by √head_size normalises variance to ~1.

### Learning Objectives
- [ ] Implement all four versions of the attention computation, verifying output shape at each step.
- [ ] Explain why masking with `-inf` before softmax is equivalent to "not attending to future tokens."
- [ ] Implement the `Head` class with `query`, `key`, `value` linear layers and the scaled dot-product.
- [ ] Articulate the difference between encoder and decoder attention blocks.

---

## Module 4 — Building the Full Transformer

**Timestamps:** `01:19:11 – 01:42:39` (~23 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 4.1 | Single self-attention head in the network | 1:19:11 |
| 4.2 | Multi-headed self-attention | 1:21:59 |
| 4.3 | Feedforward layers of the transformer block | 1:24:25 |
| 4.4 | Residual connections | 1:26:48 |
| 4.5 | LayerNorm (vs. BatchNorm) | 1:32:51 |
| 4.6 | Scaling up + dropout | 1:37:49 |

### Key Concepts
- **Multi-head attention**: run `n_head` independent `Head`s in parallel, each with dimension `head_size = n_embd / n_head`; concatenate outputs, then project back to `n_embd` via a linear layer. Each head can specialize in different relational patterns.
- **Feedforward block**: `Linear(n_embd, 4*n_embd) → ReLU → Linear(4*n_embd, n_embd)`. Applied independently at every position — "thinking time" after information has been gathered by attention.
- **Transformer `Block`**: `x = x + MultiHeadAttention(LayerNorm(x))` then `x = x + FeedForward(LayerNorm(x))`. The two sub-layers (attention + FF) each have their own LayerNorm and residual.
- **Residual connections**: `x = x + sublayer(x)`. Gradients flow straight through the addition, allowing deep stacks to train. Each block adds a small incremental update to the "residual stream."
- **LayerNorm vs. BatchNorm**: BatchNorm normalises across the batch dimension; LayerNorm normalises across the feature dimension per token — no batch-size dependency, stable for sequences.
- **Pre-LN convention** (used here): `LayerNorm → sublayer → add`. More stable than original "post-LN" in the "Attention Is All You Need" paper.
- **Dropout** (p=0.2): applied after attention weights and after feedforward; disabled at inference. Regularises large models.
- **Scaled-up hyperparameters**: `n_embd=384, n_head=6, n_layer=6, block_size=256, dropout=0.2` → ~10.7M parameters → val loss ≈ 1.48 on tiny Shakespeare.

### Learning Objectives
- [ ] Implement `MultiHeadAttention` by running `n_head` parallel `Head` instances and concatenating.
- [ ] Implement the `FeedForward` and `Block` classes with pre-LN residual connections.
- [ ] Stack N `Block`s, train, and observe val loss drop as depth increases.
- [ ] Add dropout and verify it improves generalization at larger model sizes.

---

## Module 5 — Transformer Landscape, nanoGPT & ChatGPT

**Timestamps:** `01:42:39 – 01:54:32` (~12 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 5.1 | Encoder vs. decoder vs. encoder-decoder Transformers | 1:42:39 |
| 5.2 | nanoGPT: batched multi-head attention walkthrough | 1:46:22 |
| 5.3 | Back to ChatGPT: pretraining, SFT, RLHF | 1:48:53 |
| 5.4 | Conclusions & suggested exercises | 1:54:32 |

### Key Concepts
- **Transformer variants**:
  - Encoder-only (BERT): bidirectional, no causal mask — good for classification and embeddings.
  - Decoder-only (GPT): causal mask — good for generation.
  - Encoder-decoder (T5, original seq2seq): cross-attention connects them — good for translation/summarization.
- **nanoGPT optimization**: instead of `n_head` separate `Head` modules, combine all heads into a single batched matmul treating `n_head` as an extra batch dimension. Identical math, ~3× faster.
- **ChatGPT training pipeline**:
  1. **Pretraining**: GPT-3 trained on ~300B tokens of internet text via next-token prediction.
  2. **SFT** (Supervised Fine-Tuning): fine-tune on human-written prompt–completion pairs.
  3. **Reward model**: train a classifier on human preference data (which completion is better?).
  4. **RLHF** (PPO): use the reward model to further fine-tune GPT to produce preferred outputs.
- The architecture in this lecture is *identical* to GPT-2/GPT-3 — scale + data + RLHF is what creates ChatGPT behavior.

### Learning Objectives
- [ ] Explain when to use encoder-only vs. decoder-only vs. encoder-decoder architectures.
- [ ] Describe how the batched multi-head attention in nanoGPT differs from the tutorial implementation.
- [ ] Outline the four-stage ChatGPT training pipeline and what each stage contributes.

---

## Course Summary

### The 5 Big Ideas

1. **A language model is just next-token prediction.** Everything — GPT-2, GPT-3, ChatGPT — is built on predicting which token comes next, trained over trillions of examples.
2. **Self-attention is a data-dependent weighted average.** Q, K, V matrices let each token decide *which* other tokens to aggregate. The mask enforces causality.
3. **Build incrementally and verify at every step.** Bigram → single-head → multi-head → full transformer. Each addition is small, testable, and motivated.
4. **Residual + LayerNorm unlock depth.** Without skip connections gradients vanish; without per-token normalisation training is unstable. These are non-negotiable.
5. **Scale is the only remaining gap.** The architecture here and GPT-3 are the same — only parameter count, data volume, and RLHF finetuning differ.

### Recommended Exercises (from video)
- **EX1**: Combine `Head` and `MultiHeadAttention` into one class that processes all heads in parallel as a batch dimension (answer in nanoGPT).
- **EX2**: Train on your own dataset. Try teaching the model addition (`a+b=c`) — predict digits right-to-left.
- **EX3**: Find a large dataset where train/val gap is near zero, pretrain, then fine-tune on tiny Shakespeare with a lower LR. Does pretraining help?
- **EX4**: Read a recent Transformer paper, implement one new feature (e.g. RoPE, GQA, SwiGLU), and check if validation loss improves.

---

## Source Notes

- **Transcript source:** `asr-openai` (OpenRouter/GPT audio transcription of the full 1h56m video)
- **Cookie-auth retry:** used (YouTube anti-bot)
- **Data gaps:** none — full transcript and chapter metadata available


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Walk through the four versions of self-attention Karpathy builds in this lecture — what changes at each step, and what problem does each change solve?
2. Describe the full transformer `Block` as implemented here: which sub-layers does it contain, in what order, and how are LayerNorm and residual connections applied?
3. Outline the four-stage ChatGPT training pipeline and explain what each stage contributes to the model's final behavior.

> [!example]- Answer Guide
> #### Q1 — Four versions of self-attention
> 
> v1 uses a for loop to average all prior token embeddings (correct semantics, slow); v2 replaces it with a masked matrix multiply using `torch.tril` for the same result in one matmul; v3 adds softmax so weights are learned and non-uniform rather than flat averages; v4 introduces Q/K/V linear projections so each token queries specific information via scaled dot-product attention (`softmax(Q @ Kᵀ / √head_size) @ V`).
> 
> #### Q2 — Transformer Block sub-layers
> 
> The Block applies two sub-layers in sequence, each using pre-LN residual: `x = x + MultiHeadAttention(LayerNorm(x))` then `x = x + FeedForward(LayerNorm(x))`. LayerNorm normalizes across the feature dimension per token (not across the batch), and residual connections let gradients bypass each sublayer so deep stacks can train without vanishing.
> 
> #### Q3 — ChatGPT four-stage pipeline
> 
> (1) **Pretraining**: GPT-3 trained on ~300B tokens via next-token prediction; (2) **SFT**: fine-tune on human-written prompt–completion pairs; (3) **Reward model**: trained on human preference data (which completion is better?); (4) **RLHF (PPO)**: use the reward model to further fine-tune GPT toward preferred outputs — scale + data + these last three stages are what separates ChatGPT from the base architecture.
