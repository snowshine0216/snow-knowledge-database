---
tags: [statquest, word-embedding, word2vec, nlp, embeddings, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. Why can't neural networks directly use raw word tokens (like strings) as input — what numeric representation is typically used as a starting point?
2. What problem does a word embedding solve compared to one-hot encoding when you have a vocabulary of 50,000 words?
3. What do you think the difference is between CBOW (Continuous Bag of Words) and Skip-Gram training strategies in Word2Vec?

---

The plan is ready. It will create `courses/statquest-neural-networks-and-ai/ch09-word-embedding.md` with:

- **Frontmatter**: `tags` + `source` per CLAUDE.md requirements
- **Overview**: Why embeddings exist and what the chapter covers
- **Core Concepts**: One-hot encoding, embedding tables, multi-dimensional embeddings, training signal
- **Key Techniques**: Network architecture with LaTeX equations for forward pass and cross-entropy loss; CBOW, Skip-Gram, and Negative Sampling explained step by step
- **PyTorch Notes**: The full `nn.Linear`-based Lightning module from the chapter + `nn.Embedding.from_pretrained()`
- **Key Takeaways**: 5 bullets on the most important ideas

---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain what an embedding table is and how a one-hot vector is used to look up a word's embedding — describe the matrix mechanics step by step.
2. Walk through how Word2Vec's Skip-Gram method generates a training signal: what is the input, what is the prediction target, and what loss function is used?
3. Explain Negative Sampling: why is it needed, and how does it change the training objective compared to full softmax over the entire vocabulary?

> [!example]- Answer Guide
> 
> #### Q1 — Embedding table matrix mechanics
> 
> An embedding table is a weight matrix of shape `[vocab_size × embedding_dim]`; multiplying a one-hot vector by this matrix selects (looks up) the row corresponding to that word, producing a dense low-dimensional vector — equivalent to an `nn.Embedding` lookup in PyTorch.
> 
> #### Q2 — Skip-Gram training signal walkthrough
> 
> Skip-Gram takes a center word as input and tries to predict its surrounding context words; the network is trained with cross-entropy loss, and the learned input weights become the word embeddings used downstream.
> 
> #### Q3 — Negative Sampling vs full softmax
> 
> Full softmax over a large vocabulary is computationally expensive; Negative Sampling replaces it by training a binary classifier — the model learns to distinguish the true context word from a small set of randomly sampled "noise" words, making training feasible at scale.
