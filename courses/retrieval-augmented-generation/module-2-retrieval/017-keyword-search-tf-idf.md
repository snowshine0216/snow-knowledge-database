---
tags: [rag, retrieval, keyword-search, tf-idf, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/rrngg/keyword-search---tf-idf
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. In keyword search, two documents each contain the word "pizza" — one is a 50-word recipe, the other is a 5,000-word cookbook chapter. Why might the cookbook score misleadingly high, and how would you fix it?
2. Why does TF-IDF specifically multiply term frequency by the *inverse* of document frequency, rather than just rewarding words that appear often in a document?
3. What is an inverted index, and why is it called "inverted"?

---

# Lecture 017: Keyword Search — TF-IDF

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/rrngg/keyword-search---tf-idf) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [What Keyword Search Is](#what-keyword-search-is)
- [Sparse Vectors and the Term-Document Matrix](#sparse-vectors-and-the-term-document-matrix)
- [Scoring Documents: From Simple Counts to Term Frequency](#scoring-documents-from-simple-counts-to-term-frequency)
- [Inverse Document Frequency: Rewarding Rare Words](#inverse-document-frequency-rewarding-rare-words)
- [The TF-IDF Matrix and Retrieval](#the-tf-idf-matrix-and-retrieval)

---

## What Keyword Search Is

Keyword search is one of the oldest and most battle-tested retrieval techniques in computing. Long before neural embeddings existed, databases and search engines used keyword matching to find relevant documents, and its core principles remain highly relevant in modern RAG pipelines. Understanding keyword search well is important not just for historical context, but because its particular strengths — precision on exact terms, speed, and interpretability — complement the weaknesses of semantic search.

The central idea is straightforward: a document is likely relevant to a query if it shares many words with that query. A user asking about "making pizza without a pizza oven" is probably looking for documents that actually contain the word "pizza" or "oven," not documents that happen to be conceptually adjacent to baking. Keyword search operationalizes this intuition by treating both the query and every document in the knowledge base as a **bag of words** — a representation that discards word order entirely and only records which words are present and how often they appear.

As covered in [[015-retriever-architecture-overview]], the retriever is the component whose quality sets the ceiling on the entire RAG system's performance. Keyword search is a critical option in the retriever's toolkit, and TF-IDF is its most foundational scoring algorithm.

---

## Sparse Vectors and the Term-Document Matrix

To make keyword search computationally tractable, each document is converted into a **sparse vector**. The vector has one slot for every word in the system's vocabulary — which can easily run to tens of thousands of entries — and each slot holds a count of how many times that word appears in the document. For example, the phrase "making pizza without a pizza oven" would produce a vector in which the slot for "pizza" holds the value 2, the slots for "making," "without," "a," and "oven" each hold 1, and every other slot in the vocabulary holds 0.

Because most documents use only a small fraction of the total vocabulary, the vast majority of entries in these vectors are zero. This is why they are called sparse vectors: non-zero values are the exception, not the rule. The sparsity is not a flaw — it is a feature that makes storage and computation efficient, since systems need only track the non-zero entries.

Once a sparse vector is generated for every document in the knowledge base, all of these vectors can be arranged together into a grid called the **term-document matrix**. Each column represents a different document; each row represents a different word. The value at any given cell is the count of how often that word appears in that document. This structure is also commonly called an **inverted index** — and the name captures something important about how it is used. Normally, you think of a document and ask which words it contains. An inverted index reverses this: you start from a word and immediately find every document that contains it. This inversion makes keyword lookup extremely fast during retrieval. Crucially, the inverted index can be built once, before any queries arrive, making per-query retrieval a matter of fast lookups rather than scanning every document from scratch.

---

## Scoring Documents: From Simple Counts to Term Frequency

When a query arrives, the retriever generates a sparse vector for it just as it would for any document. Each non-zero entry in the query vector identifies a **keyword** — a word from the query that should drive document scoring. The retrieval process then becomes a scoring problem: how do we assign a relevance score to each document based on how well it matches these keywords?

The simplest approach awards each document one point for every keyword it contains. For a five-keyword query, the maximum possible score is five. Documents are then ranked by their total score and the highest-scoring ones are retrieved. This binary approach — a document either gets a point for a keyword or it does not — has an obvious shortcoming: it treats a document that contains the word "pizza" once the same as a document that contains it twenty times. Intuitively, a document saturated with a keyword is likely more relevant, and the scoring should reflect that.

A natural improvement is to award points equal to how many times each keyword appears in the document, rather than just crediting its presence. This quantity is called **term frequency (TF)**: the raw count of how often a term appears in a document. If the word "pizza" appears 10 times in one document and twice in another, the first document accumulates more points from that keyword. The retriever sums the term frequency contributions from every keyword across every document to produce a total relevance score.

Term frequency scoring introduces a new problem, however. Long documents will naturally contain more occurrences of almost any word simply because they contain more words overall. A five-thousand-word cookbook chapter might mention "pizza" a dozen times, while a focused fifty-word recipe mentions it three times, yet the recipe is almost certainly more relevant because "pizza" constitutes a far greater share of its content. To correct for this **length bias**, term frequency scores can be normalized by dividing each document's score by the total number of words in that document. This normalization levels the playing field: it rewards documents in which keywords occupy a larger fraction of the total text, rather than documents that happen to be long.

---

## Inverse Document Frequency: Rewarding Rare Words

Even with length normalization, a significant flaw remains. Normalized term frequency treats all keywords as equally valuable, but a query like "making pizza without a pizza oven" contains words of wildly different informational value. The word "a" appears in virtually every English document; its presence tells you almost nothing about relevance. The word "pizza," by contrast, appears in only a small subset of documents; its presence is a meaningful signal that a document is topically related to what the user wants. A good scoring algorithm should reward keywords whose presence is rare and informative, while discounting keywords whose presence is ubiquitous and therefore uninformative.

This is precisely what **inverse document frequency (IDF)** provides. To compute IDF for a word, you first measure its **document frequency (DF)** — the fraction of documents in the knowledge base that contain it. A common word like "the" might appear in all 100 documents in a knowledge base, giving it a DF of 100/100 = 1.0. A specialized word like "pizza" might appear in only 5 of those 100 documents, giving it a DF of 5/100 = 0.05. Because you want to reward rarity rather than commonness, you invert the fraction: IDF for "pizza" becomes 100/5 = 20, while IDF for "the" becomes 100/100 = 1.

At this point, rare words have dramatically higher IDF values than common ones, but the scale can be excessively extreme. A word that appears in just one document would receive an IDF of 100, creating an outsized influence on scoring. To compress this scale while preserving the ordering, the **logarithm** of the IDF is taken. After applying the log, rare words still receive a higher weight than common words, but the gap is moderated into a reasonable range. The result is an IDF value for every word in the vocabulary that cleanly captures how much information its presence conveys.

---

## The TF-IDF Matrix and Retrieval

With IDF values computed for every word, the final step is to combine term frequency and inverse document frequency into a single unified scoring scheme. This is done by updating the inverted index: for each word's row in the matrix, every entry (which currently holds raw term frequency counts) is multiplied by that word's IDF value. The result is a **TF-IDF matrix**, where each cell now holds the product of how often a term appears in a document (TF) and how rare that term is across the knowledge base (IDF).

Retrieval using the TF-IDF matrix follows the same basic procedure as before. For each keyword in the query, the retriever looks up that keyword's row in the matrix and awards each document the TF-IDF score found in its column. The scores from all keywords are summed to produce each document's total relevance score, and documents are ranked accordingly.

The effect of TF-IDF scoring can be seen clearly with a concrete example. For the query "making pizza without a pizza oven," a document that frequently uses the rare word "pizza" or "oven" will accumulate far more score than a document that merely contains the common words "making," "without," or "a." TF-IDF naturally de-emphasizes stop words and common filler without requiring a separate stop-word list — their low IDF values suppress their contribution to scoring automatically.

TF-IDF represents the standard baseline for keyword retrieval performance. Any more sophisticated keyword search approach should be benchmarked against it. While it has been largely superseded in modern systems by a refined variant called BM-25 — which adds further corrections for document length and term saturation — TF-IDF remains the conceptual foundation on which BM-25 is built, and understanding it deeply is prerequisite to understanding the improvements BM-25 introduces. As will be explored in [[018-keyword-search-bm25]], those refinements are incremental rather than architectural: the core insight of TF-IDF, that relevance is a product of local frequency and global rarity, carries forward unchanged.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. A retriever is scoring documents against the query "pizza oven recipe." The word "pizza" appears in 5 out of 1,000 documents; the word "the" appears in all 1,000. Without using numbers, explain how TF-IDF handles these two keywords differently and why.
2. Why does normalizing term frequency by document length improve retrieval quality, and what specific problem does it fix?
3. What is the structure of the term-document matrix, and why is this data structure also called an inverted index?

<details>
<summary>Answer Guide</summary>

1. The word "the" has a document frequency of 1.0 (it's in every document), so its IDF is log(1) = 0 or near-zero — multiplying its term frequency by this IDF value effectively suppresses its contribution to any document's score. The word "pizza" appears in only a small fraction of documents, giving it a high IDF. Any document that contains "pizza" accumulates a substantially higher score because both its raw frequency (TF) and its rarity weight (IDF) are meaningful. TF-IDF thus rewards documents that frequently use rare, topic-specific words while ignoring the presence of common words that carry no topical signal.
2. Without length normalization, long documents accumulate higher raw term frequency scores simply because they contain more words total — not because they are more relevant. A 5,000-word encyclopedia entry might mention "pizza" a dozen times while a focused 200-word recipe mentions it four times, but the recipe is far more relevant. Dividing a document's score by its total word count converts raw frequency into a proportion: documents where keywords make up a larger *share* of the text are rewarded over documents that merely happen to be long.
3. The term-document matrix is a two-dimensional grid where each row corresponds to a word in the vocabulary and each column corresponds to a document. Each cell stores the (TF or TF-IDF) value for that word in that document. It is called an inverted index because the normal indexing direction — from document to words — is reversed: instead, you start from a word and immediately look across its row to find all documents that contain it. This inversion makes per-keyword document lookup fast and enables the entire retrieval pipeline to be precomputed before any query arrives.

</details>
