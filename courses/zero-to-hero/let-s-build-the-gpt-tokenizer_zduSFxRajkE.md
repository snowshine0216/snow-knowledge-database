---
tags: [tokenization, bpe, llm, nlp, gpt, deep-learning, andrej-karpathy, neural-networks-zero-to-hero]
source: https://www.youtube.com/watch?v=zduSFxRajkE
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. Byte Pair Encoding (BPE) is the tokenization algorithm used in GPT models. Without looking anything up, describe in one or two sentences how you think BPE works — what does it start with, and what does it do iteratively?
2. GPT models are known to struggle with spelling, counting characters, and arithmetic. What do you think causes these failures — is it a model architecture issue, a training data issue, or something else?
3. If you wanted a tokenizer vocabulary that covers all possible text, why might you *not* just use all ~150,000 Unicode code points as your vocabulary directly?

---

# Course: Let's build the GPT Tokenizer

> **Instructor:** Andrej Karpathy
> **Duration:** 2 h 13 min | **Published:** 2024-02-20
> **Views:** 1,062,214 | **Likes:** 26,846
> **Prerequisites:** Basic Python; familiarity with the Transformer architecture (watching "Let's build GPT from scratch" first is recommended)
> **Code/Links:** [Google Colab](https://colab.research.google.com/drive/1y0KnCFZvGVf_odSfcNAws6kcDD7HsI0L?usp=sharing) · [minBPE GitHub](https://github.com/karpathy/minbpe) · [Exercise guide](https://github.com/karpathy/minbpe/blob/master/exercise.md)

---

## Course Overview

Tokenization is the translation layer between raw text and the integer sequences that feed into language models. This lecture builds a complete BPE tokenizer from scratch in a Jupyter notebook — covering the core algorithm, encode/decode, regex pre-splitting, special tokens, and the production libraries (tiktoken, SentencePiece) used by real LLMs. Karpathy frames tokenization as the hidden cause of many well-known LLM quirks (poor spelling, arithmetic errors, non-English degradation) and finishes by revisiting each quirk with a mechanistic explanation.

---

## Module 1 — Why Tokenization Matters

**Timestamps:** `00:00:00 – 00:14:56` (~15 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 1.1 | Intro: what tokenization is and why it's unpleasant | 0:00:00 |
| 1.2 | Live demo: tiktokenizer web UI, GPT-2 vs GPT-4 tokenizer | 0:05:50 |

### Key Concepts
- **Token**: the atomic unit of an LLM; everything in a language model is measured in tokens — training data, context window, output budget.
- **Tokenization problems**: poor spelling and character-level tasks, degraded non-English languages (more tokens per sentence → hits context limit faster), GPT-2 struggles with Python indentation (each space is its own token), "SolidGoldMagikarp"-style glitch tokens.
- **Vocabulary size trade-off**: GPT-2 uses ~50,257 tokens; GPT-4 uses ~100,277. Larger vocabulary → shorter sequences, but bigger embedding and output softmax layers. A sweet spot exists around 32K–100K.
- **GPT-4 Python improvement**: the cl100k_base tokenizer deliberately groups multiple spaces (e.g. four spaces → one token), compressing Python indentation and allowing more code context.

### Learning Objectives
- [ ] Explain why the same concept (e.g. "egg") can map to different tokens depending on capitalization or context.
- [ ] Describe how non-English text gets bloated in token count compared to English.
- [ ] Articulate the trade-off between vocabulary size and sequence length.

---

## Module 2 — Text Representations: Unicode and UTF-8

**Timestamps:** `00:14:56 – 00:27:02` (~12 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 2.1 | Strings in Python: Unicode code points, `ord()` | 0:14:56 |
| 2.2 | UTF-8, UTF-16, UTF-32 encodings | 0:18:15 |
| 2.3 | Daydream: deleting tokenization entirely | 0:22:47 |
| 2.4 | Byte Pair Encoding algorithm walkthrough | 0:23:50 |

### Key Concepts
- **Unicode code points**: ~150,000 characters as of Unicode 15.1; accessed in Python via `ord(char)` / `chr(code_point)`. Too unstable and large to use directly as a vocabulary.
- **UTF-8**: variable-length encoding (1–4 bytes per code point), backwards-compatible with ASCII, most widely used on the internet. A naive UTF-8 vocabulary has only 256 tokens — sequences become very long.
- **Tokenization-free LLMs**: research direction (e.g. MegaByte) that feeds raw bytes into hierarchical Transformers; not yet proven at scale.
- **BPE core idea**: start with 256 byte tokens; iteratively find the most frequent consecutive pair, mint a new token ID for it, replace all occurrences, repeat. Each round compresses the sequence slightly and grows the vocabulary by one.

### Code Examples

**UTF-8 Encoding Basics:**
```python
# Convert text to UTF-8 bytes
text = "U n i c o d e ! 👍"
tokens = text.encode("utf-8")  # bytes object
tokens_list = list(map(int, tokens))  # convert to list of integers

print(f"Text: {text}")
print(f"Tokens: {tokens_list}")
print(f"Length: {len(text)} chars, {len(tokens_list)} bytes")
```

**Unicode Code Points:**
```python
# Access Unicode code points via ord()
text_korean = "민영재요 😀 (hello in Korean!)"
code_points = [ord(c) for c in text_korean]
print(code_points)
# Output: [51116, 50689, 51020, 50957, 32, 128512, 32, 40, 104, 101, 108, 108, 111, ...]
```

### Learning Objectives
- [ ] Use Python's `str.encode('utf-8')` and `bytes.decode('utf-8')` correctly.
- [ ] Explain why UTF-8 is preferred over UTF-16/UTF-32 for tokenization.
- [ ] Describe the BPE algorithm in terms of pair frequency counting and merging.

---

## Module 3 — Building a BPE Tokenizer from Scratch

**Timestamps:** `00:27:02 – 00:57:36` (~30 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 3.1 | `get_stats()`: count consecutive byte pairs | 0:27:02 |
| 3.2 | `merge()`: replace a pair with a new token ID | 0:30:36 |
| 3.3 | Training loop, vocabulary size hyperparameter, compression ratio | 0:34:58 |
| 3.4 | Tokenizer/LLM diagram: completely separate preprocessing stage | 0:39:20 |
| 3.5 | `decode()`: token IDs → Python string | 0:42:47 |
| 3.6 | `encode()`: Python string → token IDs | 0:48:21 |

### Key Concepts
- **`get_stats(ids)`**: iterates consecutive pairs in a list of integers, returns a `{pair: count}` dict. Use `max(stats, key=stats.get)` to find the top pair.
- **`merge(ids, pair, idx)`**: single left-to-right pass, replaces every non-overlapping occurrence of `pair` with `idx`. Edge case: don't read past the last element.
- **Merges dict**: `{(child1, child2): new_token_id}`. Iteration order matters (Python 3.7+ guarantees dict insertion order). After 20 merges on a blog post, compression ratio ≈ 1.27×.
- **Tokenizer is a separate stage**: trained once on its own corpus, produces a `vocab` (id→bytes) and `merges` (pair→id); the LLM then trains on the tokenized token stream.
- **`decode(ids)`**: build a `vocab` dict (0–255 = raw bytes, then each merge = parent bytes concatenated), look up each id, concatenate bytes, call `bytes.decode('utf-8', errors='replace')` to handle invalid UTF-8.
- **`encode(text)`**: convert string to UTF-8 bytes, greedily find and apply the merge with the lowest assigned id (earliest merge wins) until no more merges apply.

### Code Examples

**Finding Most Frequent Pair:**
```python
def get_stats(ids):
    """Count consecutive pairs in a list of integers."""
    stats = {}
    for pair in zip(ids, ids[1:]):
        stats[pair] = stats.get(pair, 0) + 1
    return stats

# Find the most frequent pair
stats = get_stats([5, 6, 6, 7, 9, 1])
top_pair = max(stats, key=stats.get)
print(top_pair)  # (6, 6) or similar
```

**Merging Pairs:**
```python
def merge(ids, pair, idx):
    """Replace all consecutive occurrences of pair with idx."""
    newids = []
    i = 0
    while i < len(ids):
        if i < len(ids) - 1 and ids[i] == pair[0] and ids[i+1] == pair[1]:
            newids.append(idx)
            i += 2
        else:
            newids.append(ids[i])
            i += 1
    return newids

# Example: merge the pair (6, 7) with new token 99
result = merge([5, 6, 6, 7, 9, 1], (6, 7), 99)
print(result)  # [5, 6, 99, 9, 1]
```

**Building Vocabulary and Training Loop:**
```python
# Initialize with 256 byte tokens + target vocabulary size
vocab_size = 276  # 256 bytes + 20 merges
ids = list(text.encode("utf-8"))
merges = {}

for i in range(vocab_size - 256):
    stats = get_stats(ids)
    pair = max(stats, key=stats.get)
    idx = 256 + i
    ids = merge(ids, pair, idx)
    merges[pair] = idx
    print(f"Merge {i}: {pair} -> {idx}")

# Compression ratio
print(f"Compression ratio: {len(text.encode('utf-8')) / len(ids):.2f}X")
```

**Decoding (IDs → Text):**
```python
def decode(ids):
    """Convert token IDs back to text."""
    # Build vocabulary: first 256 are raw bytes, rest are merged tokens
    vocab = {idx: bytes([idx]) for idx in range(256)}
    for (p0, p1), idx in merges.items():
        vocab[idx] = vocab[p0] + vocab[p1]
    
    # Convert IDs to bytes and decode
    tokens_b = b"".join(vocab[idx] for idx in ids)
    return tokens_b.decode("utf-8", errors="replace")

decoded = decode([256, 100, 101])  # Example
print(decoded)
```

**Encoding (Text → IDs):**
```python
def encode(text):
    """Convert text to token IDs using learned merges."""
    tokens = list(text.encode("utf-8"))
    
    while len(tokens) >= 2:
        stats = get_stats(tokens)
        # Use earliest merge (lowest id), not most frequent
        pair = min(stats, key=lambda p: merges.get(p, float("inf")))
        
        if pair not in merges:
            break  # No more merges possible
        
        idx = merges[pair]
        tokens = merge(tokens, pair, idx)
    
    return tokens

result = encode("hello")
print(result)  # List of token IDs
```

### Learning Objectives
- [ ] Implement `get_stats()`, `merge()`, and a BPE training loop from scratch.
- [ ] Implement `decode()` and handle the invalid-UTF-8 edge case.
- [ ] Implement `encode()` using the greedy lowest-rank merge strategy.
- [ ] Explain why the tokenizer is trained independently from the LLM.

---

## Module 4 — Production Tokenizers: Regex, tiktoken, Special Tokens

**Timestamps:** `00:57:36 – 01:28:42` (~31 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 4.1 | Regex pre-splitting to prevent bad cross-category merges | 0:57:36 |
| 4.2 | tiktoken library intro, GPT-2 vs GPT-4 regex differences | 1:11:38 |
| 4.3 | GPT-2 `encoder.py` walkthrough | 1:14:59 |
| 4.4 | Special tokens: `<\|endoftext\|>`, FIM, chat tokens | 1:18:26 |
| 4.5 | minbpe exercise: build your own GPT-4 tokenizer | 1:25:28 |

### Key Concepts
- **Regex pre-split**: before BPE, split input into non-mergeable chunks using `re.findall(pattern, text)`. Chunks are tokenized independently and results concatenated. This prevents "dog!" and "dog." from merging with punctuation.
- **GPT-2 pattern**: uses `regex` (not stdlib `re`) to split on contractions (`'s`, `'t`), optional-space + letters, optional-space + digits, optional-space + non-whitespace, and whitespace.
- **GPT-4 (cl100k_base) pattern**: updated regex that groups whitespace more aggressively and is case-insensitive; supports Unicode category matching.
- **Special tokens**: handled outside BPE. `<|endoftext|>` (ID 50256 in GPT-2) delimits documents. GPT-4 adds FIM tokens (`<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>`) and a `<|endofprompt|>` token. Chat fine-tuning adds many more (`<|im_start|>`, `<|im_end|>`, etc.).
- **Model surgery for special tokens**: adding a special token requires resizing both the embedding matrix (add rows) and the final linear projection (add columns). New rows/columns are initialized with small random values; typically only these new parameters are trained initially.

### Code Examples

**GPT-2 Regex Pre-splitting:**
```python
import regex as re

# GPT-2 tokenization pattern
gpt2pat = re.compile(r"""'s|'t|'re|'ve|'m|'ll|'d|\p{L}+|\p{N}+|[^\s\p{L}\p{N}]|[\s]""")

# Apply regex to split text into chunks
text = "Hello've world123 how's are you!!?"
chunks = re.findall(gpt2pat, text)
print(chunks)
# Output: ['Hello', "'ve", ' world', '123', ' how', "'s", ' are', ' you', '!!?']
```

**Using tiktoken (GPT-4 cl100k_base):**
```python
import tiktoken

# Load GPT-4 tokenizer
enc = tiktoken.get_encoding("cl100k_base")

# Encode text to token IDs
text = "민영재요 😀 (hello in Korean!)"
tokens = enc.encode(text)
print(tokens)
# Output: [31495, 230, 75265, 243, 92245, 62904, 233, 320, 15339, 304, 16526, 16715]

# Decode back to text (roundtrip)
decoded = enc.decode(tokens)
assert decoded == text  # Verify roundtrip works
print(f"Roundtrip successful: {decoded == text}")
```

**Loading GPT-2 Vocabulary Files:**
```python
import json

# Load pre-trained GPT-2 encoder
with open('encoder.json', 'r') as f:
    encoder = json.load(f)  # Maps token string to ID

with open('vocab.bpe', 'r', encoding="utf-8") as f:
    bpe_data = f.read()
    bpe_merges = [tuple(merge_str.split()) for merge_str in bpe_data.split('\n')[1:-1]]
    merges = {tuple(map(int, merge)): i for i, merge in enumerate(bpe_merges)}

# Now use encoder and merges for encoding/decoding
special_tokens = {"<|endoftext|>": 50256}
```

### Learning Objectives
- [ ] Explain why regex pre-splitting prevents cross-category merges.
- [ ] Describe the difference between GPT-2 and GPT-4 tokenizer patterns.
- [ ] Add a special token to an existing tokenizer and describe the required model surgery.
- [ ] Use the minbpe exercise to implement a GPT-4-compatible tokenizer.

---

## Module 5 — SentencePiece, Vocabulary Design, and Advanced Topics

**Timestamps:** `01:28:42 – 02:13:34` (~45 min)

### Lessons

| # | Title | Timestamp |
|---|-------|-----------|
| 5.1 | SentencePiece library: BPE on code points, byte fallback | 1:28:42 |
| 5.2 | Setting vocabulary size, revisiting the GPT transformer | 1:43:27 |
| 5.3 | Adding tokens to pretrained models, prompt compression (gist tokens) | 1:48:11 |
| 5.4 | Multimodal tokenization: images, video, audio via vector quantization | 1:49:58 |
| 5.5 | Revisiting and explaining LLM quirks via tokenization | 1:51:41 |
| 5.6 | Final recommendations | 2:10:20 |

### Key Concepts
- **SentencePiece vs tiktoken**: SentencePiece runs BPE directly on Unicode code points (not UTF-8 bytes), falls back to individual bytes for rare code points via `byte_fallback`. Karpathy considers tiktoken cleaner. SentencePiece can both train and infer; tiktoken is inference-only.
- **Vocabulary size**: empirical hyperparameter. State-of-the-art models typically land in the 32K–100K range. Llama 2 uses 32K; GPT-4 uses ~100K.
- **Gist tokens (prompt compression)**: new learnable tokens trained by distillation to compress a long prompt into a few token embeddings. Rest of model frozen; only token embeddings trained.
- **Multimodal tokenization**: images/video/audio are chunked into discrete tokens via vector quantization (e.g. VQ-VAE for images, Sora's video patches). The Transformer sees them exactly like text tokens.
- **LLM quirk explanations**:
  - *Spelling failures*: long tokens like `DefaultStyle` are single tokens; the model has no character-level view inside them.
  - *Arithmetic errors*: multi-digit numbers split arbitrarily into tokens; the model must compose across token boundaries.
  - *Non-English degradation*: more tokens per sentence → shorter effective context.
  - *GPT-2 Python weakness*: each space was its own token, bloating indented code.
  - *SolidGoldMagikarp*: a token that appeared in vocabulary training but had near-zero occurrence in LLM training → undefined embedding → bizarre behavior.
  - *YAML preferred over JSON*: YAML is more token-efficient for structured data in many tokenizers.
  - *Trailing whitespace warnings*: a tokenization artifact; whitespace changes token boundaries.

### Code Examples

**SentencePiece Training (Conceptual):**
```python
# SentencePiece operates on Unicode code points, not UTF-8 bytes
# Key difference: BPE on code points + byte_fallback for rare chars

# Example: Train SentencePiece on a text file
# import sentencepiece as spm
# spm.SentencePieceTrainer.train(
#     input='corpus.txt',
#     model_prefix='m',
#     vocab_size=32000,
#     character_coverage=0.9995,  # Handle 99.95% of chars directly
#     model_type='bpe'
# )
# sp = spm.SentencePieceProcessor()
# sp.Load('m.model')
# tokens = sp.EncodeAsIds('hello world')
```

**Using Tiktoken for GPT-4:**
```python
import tiktoken

# GPT-4 tokenizer comparison with GPT-2
enc_gpt4 = tiktoken.get_encoding("cl100k_base")
enc_gpt2 = tiktoken.get_encoding("gpt2")

text = "Hello world! This is a test."

tokens_gpt4 = enc_gpt4.encode(text)
tokens_gpt2 = enc_gpt2.encode(text)

print(f"GPT-4 tokens ({len(tokens_gpt4)}): {tokens_gpt4}")
print(f"GPT-2 tokens ({len(tokens_gpt2)}): {tokens_gpt2}")
# GPT-4 uses fewer tokens due to larger vocab and smarter grouping
```

**Measuring Compression Ratio:**
```python
def compression_ratio(text, tokenizer):
    """Calculate how much a tokenizer compresses text."""
    tokens = tokenizer.encode(text)
    original_bytes = len(text.encode("utf-8"))
    num_tokens = len(tokens)
    return original_bytes / num_tokens

text = "U n i c o d e ! 👍"
ratio = len(text.encode("utf-8")) / len(enc_gpt4.encode(text))
print(f"Compression ratio: {ratio:.2f}X")
```

**minBPE Exercise (GPT-4 Compatible Tokenizer):**
```python
# Exercise: Implement a tokenizer that matches GPT-4's cl100k_base
# Key steps:
# 1. Implement get_stats() to count pair frequencies
# 2. Implement merge() to replace pairs with new token IDs
# 3. Train BPE loop with regex pre-splitting
# 4. Implement encode() using greedy lowest-rank merge
# 5. Implement decode() building vocab and decoding bytes
# 6. Verify roundtrip: encode(text) then decode == original text

# Example verification:
assert enc_gpt4.decode(enc_gpt4.encode(text)) == text
print("✓ Roundtrip successful")
```

### Learning Objectives
- [ ] Compare SentencePiece and tiktoken tokenization strategies at the code-point level.
- [ ] Choose a reasonable vocabulary size for a new LLM and justify the trade-off.
- [ ] Explain the root cause of at least five common LLM quirks in terms of tokenization.
- [ ] Describe how multimodal inputs are tokenized and fed into a standard Transformer.

---

## Course Summary

### The 6 Big Ideas

1. **Tokens are the atom of LLMs**: every capability and limitation of the model is shaped by how text is chunked into tokens; tokenization is not a footnote, it's the foundation.
2. **BPE compresses byte sequences iteratively**: start with 256 byte tokens, find the most frequent pair, mint a new token, repeat — producing a tunable compression of the training corpus.
3. **Tokenizer and LLM are separate**: the tokenizer has its own training set and training phase; the LLM only ever sees token IDs, never raw text.
4. **Regex pre-splitting enforces semantic boundaries**: top-down rules prevent letters, numbers, and punctuation from merging across categories — improving tokenizer quality for code and multilingual text.
5. **Special tokens extend the vocabulary with structured meaning**: they bypass BPE entirely and require model surgery (embedding resize) to add after the fact.
6. **Most LLM oddities trace back to tokenization**: spelling, arithmetic, language balance, whitespace sensitivity, and glitch tokens are all tokenization artifacts, not model intelligence failures.

### Recommended Exercises
- Follow the four-step minbpe exercise (`exercise.md`) to implement a GPT-4-compatible tokenizer from scratch.
- Train a tokenizer on a different corpus (e.g. code-heavy or multilingual) and compare the resulting merge order to GPT-4's.
- Experiment with different vocabulary sizes (256, 1000, 32000) and measure compression ratio vs. downstream sequence length.
- Add a custom special token to minbpe and verify encode/decode roundtrip.

---

## Quick Code Reference

### Essential Functions

| Function | Purpose | Key Pattern |
|----------|---------|-------------|
| `get_stats()` | Count pair frequencies | `{(a, b): count}` dict |
| `merge()` | Replace pair with token ID | Left-to-right scan, skip merged pairs |
| `encode()` | Text → token IDs | Greedy: `min(stats, key=lambda p: merges.get(p, inf))` |
| `decode()` | Token IDs → text | Build vocab, concatenate bytes, decode UTF-8 |

### Core Algorithm Pattern
```
1. Start with bytes: tokens = list(text.encode("utf-8"))
2. Loop until done:
   a. stats = get_stats(tokens)  # Count pairs
   b. pair = max(stats, key=stats.get)  # Most frequent
   c. tokens = merge(tokens, pair, new_id)
   d. Record merges[(a, b)] = new_id
3. For inference, apply merges in order (lowest ID first)
```

### Regex Pre-split Pattern
```python
# Split text into chunks, process each independently
chunks = re.findall(pattern, text)
token_ids = []
for chunk in chunks:
    token_ids.extend(encode(chunk))
```

### Production Libraries
- **tiktoken** (OpenAI): Fast, pre-trained for GPT-2/GPT-4, inference-only
- **SentencePiece** (Google): Can train & infer, BPE on code points, byte fallback
- **minbpe** (Karpathy): Educational, shows full implementation details

### Common Token IDs
| Model | Special Token | ID |
|-------|---------------|----|
| GPT-2 | `<\|endoftext\|>` | 50256 |
| GPT-4 | `<\|endoftext\|>` | 100257 |
| GPT-4 | `<\|fim_prefix\|>` | (varies) |

### Validation Checklist
- ✅ Roundtrip: `decode(encode(text)) == text`
- ✅ Consistency: Same text always encodes to same IDs
- ✅ Compression: ~1.2–1.5× reduction in sequence length
- ✅ Regex splitting: No cross-category merges (letters+punctuation)

---

## Source Notes

- **Transcript source:** `auto subtitles` (subtitle-vtt, `zduSFxRajkE.en-orig.vtt`)
- **Cookie-auth retry:** used
- **Data gaps:** none


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Walk through the BPE training loop from scratch: starting point, what `get_stats()` returns, what `merge()` does, and how the `merges` dict is built across iterations.
2. Explain why the `encode()` function uses a "greedy lowest-rank merge" strategy — what would go wrong if you picked the *most frequent* pair instead of the *earliest-assigned* pair?
3. Pick any three of the following LLM quirks and explain their root cause in terms of tokenization: spelling failures, arithmetic errors, non-English degradation, SolidGoldMagikarp glitch tokens, YAML preferred over JSON, GPT-2 Python indentation weakness.

> [!example]- Answer Guide
> 
> #### Q1 — BPE Training Loop From Scratch
> 
> BPE starts with 256 byte tokens (raw UTF-8 bytes). Each iteration calls `get_stats()` to build a `{pair: count}` dict over the current token list, selects the most frequent pair via `max(stats, key=stats.get)`, calls `merge()` to replace every non-overlapping occurrence of that pair with a new integer ID, and records `(child1, child2) → new_id` in the `merges` dict. This repeats until the target vocabulary size is reached; after 20 merges on a blog post the compression ratio is roughly 1.27×.
> 
> #### Q2 — Encode Greedy Lowest-Rank Merge
> 
> `encode()` must reproduce the *exact same merges in the exact same order* as training — so it applies the merge with the lowest assigned ID first (earliest merge = most frequent pair from training time). Using frequency at inference time would be wrong because the current input's pair frequencies differ from the training corpus, producing inconsistent token boundaries and breaking the encode/decode roundtrip.
> 
> #### Q3 — LLM Quirks Tokenization Root Causes
> 
> - **Spelling failures**: tokens like `DefaultStyle` are single atoms — the model has no character-level view inside them, so it cannot spell or count characters.
> - **Arithmetic errors**: multi-digit numbers are split arbitrarily across token boundaries, forcing the model to compose digit values it has never seen aligned that way.
> - **Non-English degradation**: non-English text requires more tokens per sentence, consuming context window faster and effectively shrinking the model's useful memory.
> - **SolidGoldMagikarp**: the token appeared in tokenizer vocabulary training data but had near-zero occurrence in LLM training, leaving its embedding essentially undefined and triggering bizarre behavior.
> - **YAML over JSON**: YAML's syntax is more token-efficient in common tokenizers — the same structured data encodes to fewer tokens, making YAML cheaper in context budget.
