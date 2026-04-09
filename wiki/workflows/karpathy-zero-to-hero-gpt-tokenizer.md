---
tags: [tokenization, bpe, llm, nlp, gpt, deep-learning, andrej-karpathy, neural-networks-zero-to-hero]
source: https://www.youtube.com/watch?v=zduSFxRajkE
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

## Source Notes

- **Transcript source:** `auto subtitles` (subtitle-vtt, `zduSFxRajkE.en-orig.vtt`)
- **Cookie-auth retry:** used
- **Data gaps:** none
