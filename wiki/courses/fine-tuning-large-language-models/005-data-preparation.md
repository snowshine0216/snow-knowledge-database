---
tags: [fine-tuning, data-preparation, tokenization, huggingface, llm, deeplearning-ai, lamini]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/d1ha8/data-preparation
---

# Lesson 005 — Data Preparation

**Course:** [[_index|Finetuning Large Language Models]] · DeepLearning.AI  
**Instructor:** Sharon Zhou (Lamini)

---

## Summary

Four data quality properties in priority order, plus the full tokenization pipeline for preparing fine-tuning datasets.

---

## Data Quality Hierarchy

1. **Quality** _(most important)_ — high-quality input-output pairs; garbage in → garbage out
2. **Diversity** — varied inputs/outputs across your task range; uniform data causes memorization not generalization
3. **Real data** _(preferred over generated)_ — synthetic data carries statistical patterns detectors can identify; real domain data is especially valuable for writing tasks
4. **Quantity** _(least critical)_ — pre-training already gave the model a vast knowledge base; fine-tuning adjusts behavior, not rebuilds knowledge from scratch

---

## Data Prep Pipeline

1. Collect instruction-response pairs
2. Concatenate + apply prompt template (e.g., `[INST] {instruction} [/INST] {response}`)
3. [[Tokenization|Tokenize]] — convert text to integer token IDs
4. Split into train/test (90/10, shuffled)

---

## Tokenization

Tokens are **not** words — they are character clusters based on frequency in the training corpus. Example: token `278` = `ING` (suffix common across all gerunds).

**Critical rule:** a tokenizer is tied to a specific model. Using the wrong tokenizer gives the model unexpected integer mappings → garbage output.

```python
from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained("EleutherAI/pythia-70m")
tokens = tokenizer("Hi, how are you?")   # {"input_ids": [...], "attention_mask": [...]}
text   = tokenizer.decode(tokens["input_ids"])  # → "Hi, how are you?"
```

`AutoTokenizer.from_pretrained(model_name)` automatically loads the correct tokenizer for the model.

---

## Padding and Truncation

Models require fixed-size tensors — all sequences in a batch must be the same length.

**Padding** — shorter sequences padded with a special token (`0`, also the EOS token):
```python
tokenizer(["Hi, how are you?", "I'm good.", "Yes."], padding=True)
# "Yes." → [token_yes, 0, 0, 0, 0, 0, ...]
```

**Truncation** — sequences exceeding max context length are cut. Default: truncate from the **right**.

> Truncate from the **left** when the response is on the right side of the sequence — preserves the output the model must learn to produce.

```python
tokenizer(text, padding=True, truncation=True, max_length=max_len)
```

---

## Lab: Lamini Q&A Dataset (Pythia-70M)

- Dataset: Lamini Q&A (company-specific instruction data)
- Model: EleutherAI Pythia-70M
- Key steps: `tokenize_function` → `.map(batch_size=1, drop_last_batch=True)` → add `labels` column → `train_test_split(test_size=0.1, shuffle=True)`

Bonus datasets on Hugging Face: Taylor Swift Q&A, BTS Q&A, open-source LLM Q&A.

---

## Related

[[004-instruction-finetuning]] · [[006-training-process]] · [[Tokenization]] · [[AutoTokenizer]] · [[Hugging Face]]
