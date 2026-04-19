---
tags: [rag, retrieval, semantic-search, embedding-models, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/00us3/semantic-search---embedding-model-deepdive
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. An embedding model places "good morning" and "hello" close together in vector space, but "good morning" and "that's a noisy trombone" far apart. What training technique produces this behavior, and what data does it require?
2. If you trained the same embedding model twice from scratch — same data, different random starting weights — would the resulting vector spaces be identical, meaningfully similar, or completely different? Why does this matter in practice?
3. Why do embedding models use hundreds or even thousands of dimensions, rather than, say, three dimensions?

---

# Lecture 020: Semantic Search — Embedding Model Deepdive

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/00us3/semantic-search---embedding-model-deepdive) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [The Job of an Embedding Model](#the-job-of-an-embedding-model)
- [Positive and Negative Pairs: The Training Signal](#positive-and-negative-pairs-the-training-signal)
- [Contrastive Training: How the Model Learns](#contrastive-training-how-the-model-learns)
- [What the Trained Vector Space Actually Means](#what-the-trained-vector-space-actually-means)
- [Practical Implications for RAG Systems](#practical-implications-for-rag-systems)

---

## The Job of an Embedding Model

An embedding model's job can be stated in a single sentence: it must map similar text to nearby points in vector space, and dissimilar text to distant points. That description sounds almost trivial until you ask a more uncomfortable question — how could a computer possibly understand what "similar meaning" means? Meaning is not printed on the surface of words. The sentence "he could smell the roses" and the phrase "a field of fragrant flowers" share no words at all, yet any human reader immediately recognizes them as describing the same kind of experience. Achieving this computationally is a genuinely sophisticated feat, and understanding how embedding models accomplish it illuminates both their power and their constraints.

The output of an embedding model is a **dense vector** — a list of floating-point numbers, typically hundreds or thousands of values long. Each piece of text, regardless of its length, gets compressed into one such vector. Once embedded, the geometric distance between two vectors encodes the semantic relationship between the corresponding texts. Text pairs that share meaning cluster together; text pairs with nothing in common scatter apart. This is the representation that makes semantic search possible: instead of matching keywords, the retriever compares vector positions and retrieves the nearest neighbors to the query vector.

---

## Positive and Negative Pairs: The Training Signal

Training an embedding model requires a large collection of **example pairs**, each labeled as either a positive pair or a negative pair. A positive pair consists of two pieces of text that carry similar meaning — "good morning" and "hello," for instance, or "he could smell the roses" and "a field of fragrant flowers." A negative pair consists of two pieces of text with dissimilar meanings — "good morning" and "that's a noisy trombone" belong in no shared semantic category and should be pushed apart in the vector space.

Compiling these pairs is the first major challenge of embedding model training. In practice, collections number in the multi-millions — a single word or phrase may appear in many different pairs, each one capturing a different facet of its meaning. The phrase "good morning" might form a positive pair with "hello," a positive pair with "a pleasant greeting," and a negative pair with dozens of unrelated phrases. The sheer breadth of these examples is what allows the model to learn nuanced semantic relationships rather than shallow lexical associations.

This framing — the world described as a collection of positive and negative constraints — is what makes training tractable. The model does not need a symbolic definition of meaning, or a hand-crafted ontology of concepts. It only needs to know, for millions of example pairs, whether two pieces of text should end up near or far. The semantic structure of language emerges from satisfying all of those constraints simultaneously.

---

## Contrastive Training: How the Model Learns

At the very beginning of training, the embedding model is initialized with random parameters. Every piece of text it encounters gets mapped to an essentially random vector. These initial vectors carry no semantic information whatsoever — querying a retriever backed by a freshly initialized model would return gibberish. The useful structure must be learned from data.

The learning algorithm works through a process called **contrastive training**. After the model embeds a batch of example pairs, it evaluates its own performance by asking: did I place the positive pairs close together, and the negative pairs far apart? The contrast between the two kinds of pairs is the training signal — hence the name. Based on how well it did, the model updates its internal parameters using an optimization algorithm designed to pull positive pairs closer and push negative pairs farther. The model then sees another batch, evaluates again, updates again, and repeats this cycle many thousands of times.

To make the dynamics concrete, consider a single anchor phrase — "he could smell the roses." During training this anchor is paired with a positive example, "a field of fragrant flowers," and a negative example, "a lion roared majestically." At initialization, all three phrases are scattered at random positions. The training process gradually pulls the anchor toward the positive example and pushes it away from the negative. But the anchor is not the only thing moving — every phrase in the training corpus is simultaneously being pulled and pushed in many directions by all the pairs that include it. "A field of fragrant flowers" might be the positive for "he could smell the roses" but the negative for some completely unrelated phrase, so its final location in the vector space is the outcome of hundreds or thousands of competing pressures.

This is why embedding models require so many dimensions. In three-dimensional space, there simply isn't enough room to satisfy millions of push-and-pull constraints without forcing unrelated concepts into the same neighborhood. High-dimensional space — vectors of 768, 1024, or even more values — gives the optimization algorithm enormous freedom to find a geometry where every constraint is approximately satisfied simultaneously. The dimensionality is not chosen for interpretability; it is chosen to give the model enough degrees of freedom to encode the full complexity of language.

---

## What the Trained Vector Space Actually Means

After many rounds of contrastive training, the vector space acquires a rich semantic structure. Similar concepts cluster together: words and phrases about flowers end up near other flower-related text; words about lions cluster elsewhere; music terminology occupies yet another region. The **location** of these clusters is not meaningful in any absolute sense — it was determined partly by the random initialization and partly by the order in which training examples were presented. What matters is the **relative geometry**: that concepts within a cluster are near each other, and concepts in distant clusters are far apart.

This has an important practical implication. If you trained the same model twice on the same data but with different random initializations, you would get two vector spaces with identical semantic structure but at completely different absolute positions. The "flowers cluster" would form in both runs, but it might be at opposite corners of the vector space. This means that **vectors from different models are fundamentally incomparable**, even if both models were trained on identical data. Comparing a vector from Model A with a vector from Model B measures nothing meaningful — the coordinate systems are different. In practice this rule extends to any difference between models: different training data, different dimensionality, different architecture. Only vectors produced by the same model can be legitimately compared.

A second implication is that the vector space is abstract and somewhat arbitrary. Before training, a region of space has no meaning; after training, it has meaning only because a cluster of semantically related concepts happened to converge there. There is nothing inherent about that region — it is simply where that cluster settled during training. This abstraction is precisely what makes the representation powerful: the model is not forced to align meaning with any human-defined coordinate system, so it can discover the most useful geometric arrangement on its own.

---

## Practical Implications for RAG Systems

You do not need to train an embedding model to build a RAG system. High-quality pre-trained embedding models are freely available, and they generalize remarkably well across domains — the semantic structure they learned from broad internet text transfers usefully to specialized corpora like legal documents, medical literature, or code. Understanding the training process matters not because you will replicate it, but because it shapes how you reason about the vectors the model produces and how you use them correctly.

The single most important operational rule is the one already stated: **never mix vectors from different embedding models**. If you switch embedding models mid-project — to upgrade to a better model, to reduce latency, or to change dimensionality — you must re-embed your entire knowledge base from scratch. Comparing old vectors against new ones will produce retrieval results that appear plausible but are semantically meaningless. This is a silent failure mode: the system will not crash, it will just return wrong documents.

The practical workflow for building a retriever, which the next lesson covers in depth, is straightforward once this constraint is respected. You choose an embedding model and commit to it. You embed every document in your knowledge base using that model. At query time, you embed the user's query using the same model, then find the nearest document vectors using a distance metric. The geometry of the trained vector space ensures that nearest neighbors in vector space correspond to the most semantically relevant documents — which is exactly the retrieval behavior a RAG system needs. As introduced in [[003-introduction-to-rag]], the quality of this retrieval step directly sets the ceiling on what the downstream LLM can accomplish.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Describe contrastive training in your own words: what data does it require, what does the model evaluate, and how does it update itself?
2. You train the same embedding model twice on identical data but with different random seeds. Are the two resulting vector spaces identical, equivalent in structure, or completely unrelated? What does your answer imply about comparing vectors across different models?
3. Why do production embedding models use hundreds or thousands of dimensions instead of a small number like three?

<details>
<summary>Answer Guide</summary>

1. Contrastive training requires a large dataset of positive pairs (semantically similar texts) and negative pairs (semantically dissimilar texts). After embedding a batch of pairs, the model evaluates how well it placed positive pairs close together and negative pairs far apart. It then updates its parameters using an optimization algorithm that pulls positive pairs toward each other and pushes negative pairs further apart. This cycle repeats thousands of times until the vector space reflects the semantic structure of the training data.

2. The two vector spaces will have identical semantic structure — the same concepts will cluster together — but the clusters will sit at different absolute positions in the space because of different random initializations. This makes the two spaces incompatible for direct comparison. The implication is broad: you can only meaningfully compare vectors produced by the exact same model. Any difference in training data, architecture, dimensionality, or random initialization produces a geometrically incompatible vector space, and mixing vectors across models produces meaningless results.

3. In low-dimensional space, it is geometrically impossible to simultaneously satisfy millions of push-and-pull constraints without unrelated concepts being forced into the same neighborhoods. High-dimensional space gives the optimization algorithm enough degrees of freedom to find a geometry where all constraints are approximately satisfied at once. The dimensionality is chosen to give the model capacity to encode the full nuanced complexity of language, not for interpretability.

</details>
