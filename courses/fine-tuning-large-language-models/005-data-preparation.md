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
```

**Tokenize single text:**
```python
text = "Hi, how are you?"
encoded_text = tokenizer(text)["input_ids"]
# Output: [12764, 13, 849, 403, 368, 32]

decoded_text = tokenizer.decode(encoded_text)
# Output: "Hi, how are you?"
```

**Tokenize multiple texts at once:**
```python
list_texts = ["Hi, how are you?", "I'm good", "Yes"]
encoded_texts = tokenizer(list_texts)
print(encoded_texts["input_ids"])
# Output: [[12764, 13, 849, 403, 368, 32], [42, 1353, 1175], [4374]]
```

---

## Padding and Truncation

Models require fixed-size tensors — all sequences in a batch must be the same length. Two strategies handle variable-length text:

**Padding**: shorter sequences are padded with a special token (typically `0`, also used as the end-of-sentence token) to match the longest sequence in the batch.

```python
tokenizer.pad_token = tokenizer.eos_token 
list_texts = ["Hi, how are you?", "I'm good", "Yes"]
encoded_texts_longest = tokenizer(list_texts, padding=True)
print(encoded_texts_longest["input_ids"])
# Output: [[12764, 13, 849, 403, 368, 32], [42, 1353, 1175, 0, 0, 0], [4374, 0, 0, 0, 0, 0]]
```

**Truncation**: sequences longer than the model's maximum context length are cut. Default truncation is from the right. For prompts where critical context is on the right (e.g., the answer portion), set `truncation_side="left"` to preserve the response.

```python
# Truncate from the right (default)
encoded_texts_truncation = tokenizer(list_texts, max_length=3, truncation=True)
print(encoded_texts_truncation["input_ids"])
# Output: [[12764, 13, 849], [42, 1353, 1175], [4374]]

# Truncate from the left to preserve answer portion
tokenizer.truncation_side = "left"
encoded_texts_truncation_left = tokenizer(list_texts, max_length=3, truncation=True)
print(encoded_texts_truncation_left["input_ids"])
# Output: [[403, 368, 32], [42, 1353, 1175], [4374]]
```

In practice, both are used together:
```python
encoded_texts_both = tokenizer(list_texts, max_length=3, truncation=True, padding=True)
print(encoded_texts_both["input_ids"])
# Output: [[403, 368, 32], [42, 1353, 1175], [4374, 0, 0]]
```

---

## Lab: Tokenizing a Dataset with Hugging Face

The lab tokenizes the Lamini Q&A dataset (a company-specific instruction dataset) using the 70M-parameter Pythia model. The `tokenize_function` computes the minimum of the model's max context length and the actual token count, then re-tokenizes with truncation at that length.

**Define the tokenization function:**
```python
def tokenize_function(examples):
    if "question" in examples and "answer" in examples:
      text = examples["question"][0] + examples["answer"][0]
    elif "input" in examples and "output" in examples:
      text = examples["input"][0] + examples["output"][0]
    else:
      text = examples["text"][0]

    tokenizer.pad_token = tokenizer.eos_token
    tokenized_inputs = tokenizer(
        text,
        return_tensors="np",
        padding=True,
    )

    max_length = min(
        tokenized_inputs["input_ids"].shape[1],
        2048
    )
    tokenizer.truncation_side = "left"
    tokenized_inputs = tokenizer(
        text,
        return_tensors="np",
        truncation=True,
        max_length=max_length
    )

    return tokenized_inputs
```

**Load dataset and apply tokenization:**
```python
import datasets

finetuning_dataset_loaded = datasets.load_dataset("kotzeje/lamini_docs.jsonl", split="train")

tokenized_dataset = finetuning_dataset_loaded.map(
    tokenize_function,
    batched=True,
    batch_size=1,
    drop_last_batch=True
)

print(tokenized_dataset)
# Output: Dataset({
#     features: ['question', 'answer', 'input_ids', 'attention_mask'],
#     num_rows: 1400
# })
```

**Add labels and split into train/test:**
```python
tokenized_dataset = tokenized_dataset.add_column("labels", tokenized_dataset["input_ids"])

split_dataset = tokenized_dataset.train_test_split(test_size=0.1, shuffle=True, seed=123)
print(split_dataset)
# Output: DatasetDict({
#     train: Dataset({
#         features: ['question', 'answer', 'input_ids', 'attention_mask', 'labels'],
#         num_rows: 1260
#     })
#     test: Dataset({
#         features: ['question', 'answer', 'input_ids', 'attention_mask', 'labels'],
#         num_rows: 140
#     })
# })
```

**Bonus datasets for experimentation:**
```python
taylor_swift_dataset = "lamini/taylor_swift"
bts_dataset = "lamini/bts"
open_llms = "lamini/open_llms"
```

The full dataset is processed using Hugging Face's `.map()` function with `batch_size=1` and `drop_last_batch=True` (to handle edge-case batch sizes). After adding a `labels` column (required by Hugging Face for training), a `train_test_split(test_size=0.1, shuffle=True)` produces the final datasets.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Rank the four data quality properties in order of importance and explain why quantity ranks last.
2. Why must the tokenizer match the model, and what Hugging Face class handles this automatically?
3. When should you truncate from the left rather than the right, and why?

> [!example]- Answer Guide
> 
> #### Q1 — Data Quality Priority Ranking
> 
> Quality > Diversity > Real data > Quantity. Quantity ranks last because the base model already learned from trillions of tokens during pre-training — fine-tuning needs to adjust behavior, not rebuild knowledge from scratch. A small, high-quality dataset outperforms a large, noisy one.
> 
> #### Q2 — Tokenizer Must Match Model
> 
> Each tokenizer assigns its own integer IDs to character clusters based on the frequency patterns of the text it was trained on. If you use a different tokenizer, the model receives the wrong integer mappings and produces nonsense. `AutoTokenizer.from_pretrained(model_name)` automatically loads the tokenizer that matches the model.
> 
> #### Q3 — Truncate Left vs Right
> 
> Truncate from the left when the important content is on the right side of the sequence — for example, when the instruction is long but the answer/response portion (which the model must learn to produce) is on the right. Truncating from the right would discard the target output.
