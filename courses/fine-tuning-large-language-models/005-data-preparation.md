---
tags: [fine-tuning, data-preparation, tokenization, huggingface, llm, deeplearning-ai, lamini]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/d1ha8/data-preparation
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. Why does a tokenizer need to match the specific model it's used with?
2. What are padding and truncation used for during tokenization, and when would you truncate from the left vs. the right?
3. What is the priority ranking for data quality, diversity, real-vs-generated, and quantity?

---

# Lecture 005: Data Preparation

**Source:** [Finetuning Large Language Models](https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/d1ha8/data-preparation) · DeepLearning.AI · Instructor: Sharon Zhou (Lamini)

## Outline

- [Data Best Practices](#data-best-practices)
- [Steps to Prepare Data](#steps-to-prepare-data)
- [Tokenization](#tokenization)
- [Padding and Truncation](#padding-and-truncation)
- [Lab: Tokenizing a Dataset with Hugging Face](#lab-tokenizing-a-dataset-with-hugging-face)

---

## Data Best Practices

Four properties of good fine-tuning data, in priority order:

1. **Quality** (most important): high-quality input-output pairs. Garbage in → garbage out. Low-quality training data produces low-quality and inconsistent model behavior.
2. **Diversity**: varied inputs and outputs across your use case's range. Uniform data causes the model to memorize and repeat the same patterns rather than generalize.
3. **Real data** (preferred over generated when possible): generated data carries statistical patterns that detectors can identify, and training on synthetic patterns reinforces those same patterns without introducing new ways of framing things. Real data from your actual domain is especially valuable for writing tasks.
4. **Quantity** (least critical): because pre-training has already given the model a vast knowledge base starting point, fine-tuning needs far less data than training from scratch. Quality dominates quantity.

---

## Steps to Prepare Data

The four-step data prep pipeline:

1. **Collect instruction-response pairs** — gather your (input, output) examples from real sources or generate them via prompt templates / LLM distillation.
2. **Concatenate and apply a prompt template** — combine inputs and outputs into the format expected by the model (e.g., `[INST] {instruction} [/INST] {response}`).
3. **Tokenize** — convert text into integer token IDs using the model's tokenizer; apply padding and truncation to normalize sequence lengths.
4. **Split into train and test sets** — a typical 90/10 split; shuffle to randomize order.

---

## Tokenization

Tokenization converts text into integer sequences that the model operates on. Tokens are not words — they are based on the *frequency of character-cluster occurrences* in the training corpus. Example: the token `278` maps to the suffix `ING` (common across all gerunds: "fine-tuning", "tokenizing"). When you decode token `278` back through the same tokenizer, it returns `ING`.

**Critical rule**: a tokenizer is tied to a specific model — it was trained alongside it. Using the wrong tokenizer for a model causes it to receive unexpected token-ID mappings and produce garbage. Hugging Face's `AutoTokenizer` solves this automatically: pass the model name and it loads the correct tokenizer.

```python
from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained("EleutherAI/pythia-70m")
tokens = tokenizer("Hi, how are you?")  # returns {"input_ids": [...], "attention_mask": [...]}
text = tokenizer.decode(tokens["input_ids"])  # → "Hi, how are you?"
```

---

## Padding and Truncation

Models require fixed-size tensors — all sequences in a batch must be the same length. Two strategies handle variable-length text:

**Padding**: shorter sequences are padded with a special token (typically `0`, also used as the end-of-sentence token) to match the longest sequence in the batch.

```python
tokenizer(["Hi, how are you?", "I'm good.", "Yes."], padding=True)
# "Yes." → [token_yes, 0, 0, 0, 0, 0, ...]
```

**Truncation**: sequences longer than the model's maximum context length are cut. Default truncation is from the right. For prompts where critical context is on the right (e.g., the answer portion), set `truncation_side="left"` to preserve the response.

In practice, both are used together:
```python
tokenizer(text, padding=True, truncation=True, max_length=max_len)
```

---

## Lab: Tokenizing a Dataset with Hugging Face

The lab tokenizes the Lamini Q&A dataset (a company-specific instruction dataset) using the 70M-parameter Pythia model. The `tokenize_function` computes the minimum of the model's max context length and the actual token count, then re-tokenizes with truncation at that length. The full dataset is processed using Hugging Face's `.map()` function with `batch_size=1` and `drop_last_batch=True` (to handle edge-case batch sizes). After adding a `labels` column (required by Hugging Face for training), a `train_test_split(test_size=0.1, shuffle=True)` produces the final datasets.

Three bonus datasets in the lab for experimentation: Taylor Swift Q&A, BTS Q&A, and open-source LLM Q&A — all available on Hugging Face.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Rank the four data quality properties in order of importance and explain why quantity ranks last.
2. Why must the tokenizer match the model, and what Hugging Face class handles this automatically?
3. When should you truncate from the left rather than the right, and why?

<details>
<summary>Answer Guide</summary>

1. Quality > Diversity > Real data > Quantity. Quantity ranks last because the base model already learned from trillions of tokens during pre-training — fine-tuning needs to adjust behavior, not rebuild knowledge from scratch. A small, high-quality dataset outperforms a large, noisy one.
2. Each tokenizer assigns its own integer IDs to character clusters based on the frequency patterns of the text it was trained on. If you use a different tokenizer, the model receives the wrong integer mappings and produces nonsense. `AutoTokenizer.from_pretrained(model_name)` automatically loads the tokenizer that matches the model.
3. Truncate from the left when the important content is on the right side of the sequence — for example, when the instruction is long but the answer/response portion (which the model must learn to produce) is on the right. Truncating from the right would discard the target output.

</details>
