---
tags: [tokenization, bpe, llm, gpt, tiktoken, sentencepiece, andrej-karpathy, zero-to-hero, course]
source: https://www.youtube.com/watch?v=zduSFxRajkE
---

# Zero to Hero: Let's Build the GPT Tokenizer

Builds a complete BPE tokenizer from scratch and explains why tokenization is the hidden root cause of most LLM quirks — spelling failures, arithmetic errors, non-English degradation, and glitch tokens.

## BPE Algorithm

```
Start: 256 byte tokens (raw UTF-8 bytes)
Loop:
  1. Count all consecutive pairs → find most frequent
  2. Mint new token ID for that pair
  3. Replace all occurrences in the sequence
  4. Repeat until desired vocab size
Result: merges dict {(child1, child2): new_id}
```

### Core Functions
- **`get_stats(ids)`**: count consecutive pairs → `{pair: count}` dict
- **`merge(ids, pair, idx)`**: single left-to-right pass replacing `pair` with `idx`
- **`encode(text)`**: UTF-8 bytes → greedily apply lowest-rank merge until none remain
- **`decode(ids)`**: look up bytes for each id → concatenate → `bytes.decode('utf-8', errors='replace')`

## Tokenizer vs LLM: Separate Systems

The tokenizer is trained **independently** on its own corpus, producing `vocab` + `merges`. The LLM only sees token IDs, never raw text.

## Production Tokenizers

| Feature | GPT-2 | GPT-4 (cl100k_base) |
|---------|-------|---------------------|
| Vocab size | ~50,257 | ~100,277 |
| Regex pre-split | Basic (contractions, letters, digits) | Aggressive whitespace grouping, case-insensitive |
| Python handling | Each space = own token (bloated) | Multiple spaces → one token (compressed) |
| Library | tiktoken | tiktoken |

### Regex Pre-Splitting
Split input into chunks before BPE to prevent cross-category merges (e.g. "dog" + "!" staying separate). Chunks are tokenized independently.

### Special Tokens
- Bypass BPE entirely; handled by string matching before tokenization
- `<|endoftext|>` (GPT-2: ID 50256), FIM tokens, chat tokens (`<|im_start|>`, `<|im_end|>`)
- **Model surgery required**: resize embedding matrix (new rows) + final projection (new columns)

## SentencePiece vs tiktoken

| Aspect | SentencePiece | tiktoken |
|--------|--------------|----------|
| Operates on | Unicode code points | UTF-8 bytes |
| Rare chars | `byte_fallback` to individual bytes | Native (starts from bytes) |
| Can train? | Yes | No (inference only) |
| Karpathy's view | More complex | Cleaner design |

## LLM Quirks Explained by Tokenization

| Quirk | Root Cause |
|-------|-----------|
| Can't spell "DefaultStyle" | Single token — no character-level view inside |
| Arithmetic errors | Multi-digit numbers split arbitrarily across tokens |
| Non-English degradation | More tokens per sentence → shorter effective context |
| GPT-2 bad at Python | Each space = separate token, bloating indented code |
| SolidGoldMagikarp | Token in vocab training but near-zero in LLM training → undefined embedding |
| YAML > JSON for prompts | YAML is more token-efficient in most tokenizers |

## Vocab Size Trade-off
Larger vocab → shorter sequences (good) but bigger embedding/softmax layers (expensive). Sweet spot: **32K–100K** tokens.

## Related
- [[karpathy-zero-to-hero-build-gpt]] — companion: building the Transformer that consumes tokens
- [[karpathy-from-scratch-series]] — includes minBPE repo overview
