---
tags: [statquest, transformers, encoder-only, bert, classification, nlp, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

# Chapter 14 — Encoder-Only Transformers (BERT)

## Overview

Encoder-only transformers keep only the encoder stack from the original Transformer architecture and discard the decoder entirely. Because the encoder applies **bidirectional self-attention** — every token attends to every other token, both left and right simultaneously — these models build rich, context-aware representations of an entire input sequence. BERT (Bidirectional Encoder Representations from Transformers) is the canonical example. Encoder-only models excel at **understanding** tasks: sentiment classification, named-entity recognition, sentence similarity, and document clustering.

---

## Core Concepts

### 1 · Bidirectional vs. Causal Attention

| Aspect | Decoder-only (GPT-style) | Encoder-only (BERT-style) |
|---|---|---|
| Attention mask | Causal (left-to-right only) | None — full bidirectional |
| Primary use | Text generation | Classification / encoding |
| Sees future tokens? | No | Yes |

Bidirectional attention means the representation of the word *"bank"* in *"river bank"* vs. *"bank account"* will be different, because both surrounding contexts are visible at every layer.

### 2 · The [CLS] Token

BERT prepends a special **[CLS]** (classification) token to every input. After all encoder layers run, the [CLS] token's final hidden state aggregates information from the full sequence via attention. This single vector is fed into a classification head for sequence-level tasks (e.g., sentiment).

### 3 · BERT Pre-training Objectives

BERT is pre-trained on two self-supervised tasks:

- **Masked Language Modeling (MLM)**: 15 % of input tokens are masked; the model predicts the original tokens. Forces bidirectional context use.
- **Next Sentence Prediction (NSP)**: Two sentences are fed as a pair; the model predicts whether sentence B follows sentence A. Teaches cross-sentence relationships.

### 4 · Attention Formula (Encoder)

Each attention head computes:

$$\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

with no causal mask applied — every query token can attend to every key token in the sequence.

### 5 · Classification Head

For sentiment classification, the [CLS] hidden state $\mathbf{h}_{[CLS]} \in \mathbb{R}^d$ is passed through a linear layer and softmax:

$$\hat{y} = \text{softmax}(W\,\mathbf{h}_{[CLS]} + b)$$

The model is **fine-tuned** end-to-end on labeled examples; the encoder weights are updated alongside the classification head.

---

## Key Techniques / Algorithms

### Sentiment Classification — Step by Step

1. Tokenize input: prepend `[CLS]`, append `[SEP]`.
2. Add positional embeddings to token embeddings.
3. Pass the sequence through $N$ encoder layers (each with multi-head bidirectional self-attention + feed-forward + layer norm).
4. Extract the `[CLS]` output vector.
5. Linear + softmax → predicted class (e.g., Positive / Negative).
6. Compute cross-entropy loss; backpropagate through all layers.

### Document Clustering Pipeline

1. Encode each document: run it through the fine-tuned (or vanilla) BERT encoder.
2. Use the `[CLS]` vector (or mean-pool all token vectors) as a fixed-length document embedding.
3. Apply a clustering algorithm (e.g., k-means) in the embedding space.
4. Documents with similar meaning cluster together, even if they share no surface words.

---

## PyTorch / Code Notes

```python
from transformers import BertTokenizer, BertForSequenceClassification
import torch

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
model     = BertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)

inputs = tokenizer("The movie was fantastic!", return_tensors="pt")
outputs = model(**inputs)          # logits shape: [1, 2]
pred = outputs.logits.argmax(-1)   # 0 = Negative, 1 = Positive
```

Key points:
- `BertForSequenceClassification` automatically attaches a linear head on top of the `[CLS]` token.
- Fine-tuning requires a labeled dataset and a standard training loop with `AdamW` optimizer.
- `bert-base-uncased` has 12 encoder layers, 768 hidden dim, 12 attention heads (~110 M parameters).

---

## Key Takeaways

1. Encoder-only transformers use **full bidirectional attention** — no causal mask — making them powerful representation models but not generative models.
2. The **[CLS] token** acts as a sequence-level summary; its final hidden state is the input to any sequence classification head.
3. BERT's pre-training (MLM + NSP) gives it strong general language understanding; **fine-tuning** on task-specific data adapts it cheaply.
4. The attention formula is identical to the original Transformer; the only architectural difference is the absence of the causal mask and the decoder stack.
5. Encoder representations enable **document clustering** without any labels — the embedding space encodes semantic similarity.

---

===PRE-TEST===
## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. Decoder-only models like GPT use causal (left-to-right) attention. What kind of attention do encoder-only models like BERT use, and why does that matter for classification tasks?
2. BERT prepends a special token to every input sequence before passing it through the encoder layers. What is that token called, and what role does it play?
3. BERT is pre-trained on self-supervised objectives before fine-tuning. Can you name at least one of those objectives and describe what the model is asked to predict?

===POST-TEST===
## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words how the [CLS] token is used to perform sentiment classification in a BERT-style encoder-only transformer. Walk through the full pipeline from raw text to predicted class.
2. What is Masked Language Modeling, why is it used during BERT pre-training, and what property of the architecture does it force the model to use?
3. How would you use a pre-trained BERT encoder — with no labeled data — to cluster a set of documents by semantic similarity? Describe the steps from document to cluster assignment.

> [!example]- Answer Guide
> #### Q1 — CLS Token Sentiment Classification Pipeline
> The input is tokenized with a `[CLS]` token prepended; after passing through all encoder layers with bidirectional self-attention, the `[CLS]` hidden state accumulates sequence-level context. That vector is fed through a linear layer and softmax to produce class probabilities; the whole model is fine-tuned end-to-end with cross-entropy loss.
> #### Q2 — Masked Language Modeling Purpose
> MLM randomly masks 15 % of input tokens and trains the model to predict the originals; because the model cannot use a causal mask, it must leverage both left and right context simultaneously, which forces the development of rich bidirectional representations.
> #### Q3 — Unsupervised Document Clustering with BERT
> Encode each document by running it through the BERT encoder and extracting the `[CLS]` vector (or mean-pooling all token vectors) as a fixed-length embedding; then apply k-means (or another clustering algorithm) in that embedding space — documents with similar meaning end up in the same cluster because semantic similarity is encoded in the distance between vectors.
===END===
