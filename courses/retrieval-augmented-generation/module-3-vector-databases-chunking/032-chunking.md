---
tags: [rag, chunking, text-splitting, document-processing, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/99emtv/chunking
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. If you vectorize an entire book as a single embedding, why would search relevance be poor even though the embedding model is sophisticated?
2. What problem does chunk overlap solve, and what is the trade-off of increasing it?
3. Why might chunking at the word or single-sentence level hurt retrieval performance rather than help it?

---

# Lecture 032: Chunking

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/99emtv/chunking) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [What Chunking Is and Why It Matters](#what-chunking-is-and-why-it-matters)
- [The Information Compression Problem](#the-information-compression-problem)
- [Choosing the Right Chunk Size](#choosing-the-right-chunk-size)
- [Fixed-Size Chunking with Overlap](#fixed-size-chunking-with-overlap)
- [Recursive Character Text Splitting](#recursive-character-text-splitting)
- [Practical Guidance and Tooling](#practical-guidance-and-tooling)

---

## What Chunking Is and Why It Matters

Chunking is the practice of breaking longer text documents from your knowledge base into smaller, discrete text segments before indexing them in a vector database. It is not merely a technical convenience — it is a foundational design decision in any production RAG system, and getting it wrong degrades every other component downstream.

The motivation is threefold. First, embedding models have hard limits on the amount of text they can encode into a single vector; documents that exceed these limits cannot be ingested without truncation or chunking. Second, smaller, focused chunks produce semantically sharper embeddings — a vector that represents one paragraph captures the meaning of that paragraph much more precisely than a vector forced to summarize an entire chapter. That precision directly improves the retrieval step, which determines what context the LLM actually sees. Third, chunking controls the size of the retrieved context that gets inserted into the LLM's prompt: even if you could retrieve an entire book, doing so would rapidly exhaust the LLM's context window and introduce enormous amounts of irrelevant text alongside the handful of sentences that actually answer the user's question.

---

## The Information Compression Problem

To appreciate why chunking matters, consider the pathological case: a knowledge base of one thousand books, each indexed as a single vector. The embedding model must compress the meaning of an entire book — potentially hundreds of thousands of words spanning dozens of topics — into one fixed-size vector. The result is a kind of semantic blur. The vector can't give a sharp representation of any specific topic discussed in a particular chapter or page; instead it averages across all of them. A query about one specific argument from chapter twelve will be poorly matched against a vector that also incorporates everything in chapters one through eleven and thirteen through twenty.

Even setting aside retrieval quality, the problem compounds at generation time. If your retriever returns a whole book as the "relevant context," the LLM must process it in full. Modern context windows are large but not infinite, and filling them with entire books leaves no room for the model to reason well.

Chunking resolves this by transforming the thousand-book knowledge base into, say, one million paragraph-sized chunks. Vector databases are engineered to scale comfortably to millions of vectors, so the storage cost is tractable. The retrieval precision gain, however, is dramatic: now a query can surface the exact paragraph from chapter twelve that answers the user's question, rather than a blurry representation of the whole book.

---

## Choosing the Right Chunk Size

Chunk size sits on a continuum with failure modes at both extremes. Chunks that are too large re-introduce the averaging problem described above — a chapter-level chunk is still too coarse to represent any specific nuanced point within that chapter, and it will still consume a large portion of the LLM's context window. Chunks that are too small lose the surrounding context that gives individual words and sentences their meaning. Consider the extreme case of word-level chunking: a vector encoding a single word like "retrieval" carries almost no useful semantic signal — it could appear in a legal document, a computer science textbook, or a recipe. Even sentence-level chunking can be too fine-grained; many sentences only make sense in the context of the paragraph they belong to.

There is no universal optimal chunk size. The right value depends on the nature of your documents, the embedding model's capabilities, and the kinds of queries your system will face. However, the practical wisdom from production deployments points toward paragraph-scale chunks — large enough to carry coherent meaning, small enough to embed with precision. A common starting point is 500 characters with overlap, discussed below.

---

## Fixed-Size Chunking with Overlap

The simplest chunking strategy is fixed-size chunking: you decide in advance that every chunk will be the same number of characters, then divide the document accordingly. A document chunked at 250 characters would yield chunk 1 as characters 1–250, chunk 2 as characters 251–500, chunk 3 as characters 501–750, and so on to the end.

The obvious weakness of strict fixed-size chunking is that the split boundary has no awareness of the text's structure. It will often fall in the middle of a word, or separate two halves of a sentence that belong together. A query for the second half of that sentence will match a chunk that is missing the first half, losing the context needed to interpret it correctly.

Overlap addresses this directly. Instead of hard non-overlapping boundaries, adjacent chunks share a portion of their content. With 250-character chunks at 10% overlap, chunk 1 covers characters 1–250, chunk 2 covers 226–475, chunk 3 covers 451–700, and so on. Words that fall at the boundary of one chunk will appear near the center of an adjacent chunk, where they are surrounded by context on both sides. This significantly reduces the frequency of contextually orphaned terms.

The trade-off is redundancy: overlapping chunks mean the same text appears in multiple vectors. A higher overlap percentage improves search relevance but inflates the size of the vector database and adds vectors with partially duplicated information. In practice, overlaps in the 10–20% range represent a reasonable balance.

---

## Recursive Character Text Splitting

Fixed-size chunking is simple but ignores document structure entirely. A more adaptive strategy is recursive character text splitting, where you choose a specific character — such as the newline character that typically appears between paragraphs — as the split delimiter. This yields variable-length chunks whose boundaries align with natural document structure.

The advantage is that related ideas tend to stay together within a single chunk. Paragraphs are written as coherent units; splitting on paragraph boundaries preserves that coherence. Compared to splitting in the middle of a paragraph, this produces vectors that more accurately represent complete thoughts, which improves embedding quality.

The cost is variability. Because paragraph lengths differ, some chunks will be very large and others very small, depending entirely on where the delimiter characters fall in the source document. A very short chunk — perhaps a heading or a one-line paragraph — provides little semantic context; a very long chunk drifts back toward the averaging problem. Practitioners using this strategy often pair it with a maximum chunk size cap to prevent runaway large chunks.

Different document types benefit from different split characters. HTML documents can be split on paragraph or header tags, Python source code on function or class definition boundaries, plain text on newlines. If your knowledge base is heterogeneous — a mix of web pages, code files, and documents — you can apply different splitting strategies to each document type, calibrating the chunking logic to the structure of each source.

---

## Practical Guidance and Tooling

Both fixed-size chunking and character-based splitting are conceptually simple enough to implement from scratch. In practice, widely used libraries such as LangChain provide built-in text splitters that handle the bookkeeping for you, including overlap management and document type detection. These libraries are worth using not because the logic is difficult but because they save time and handle edge cases that a bespoke implementation might miss.

One important detail when chunking documents with metadata: each chunk should inherit the metadata of its source document, supplemented with positional information such as the chunk index or character offset. This allows downstream components to attribute retrieved chunks to their original source, which is essential for citation, debugging, and trust. Labs in this module demonstrate how to propagate metadata through the chunking process.

For a practical starting point with no domain-specific tuning, fixed-size chunks of approximately 500 characters with an overlap of 50 to 100 characters perform reliably across a wide range of use cases. When that baseline proves insufficient — perhaps because your documents have rich structure that fixed splitting destroys — more advanced chunking techniques, including semantic and hierarchical approaches, are available and covered in the next lesson.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain, without using the phrase "chunk size," why vectorizing an entire book as a single embedding produces poor search results.
2. Describe how fixed-size chunking with overlap works mechanically, and explain the specific problem it solves.
3. What is the key advantage of recursive character text splitting over strict fixed-size chunking, and what new problem does it introduce?

> [!example]- Answer Guide
> #### Q1 — Single Embedding Loses Specificity
> An embedding model must compress all the meaning of a book — dozens of topics across hundreds of pages — into a single fixed-size vector. The resulting vector cannot sharply represent any specific topic from any specific chapter; it averages over all of them. A query about one precise argument will be compared against this blurred, averaged representation, making it very unlikely to rank highly even when the book contains a perfect answer somewhere inside it.
> #### Q2 — Fixed-Size Chunking with Overlap
> Fixed-size chunking with overlap divides a document into segments of equal character length, but adjacent segments share a portion of their content rather than having hard boundaries. For example, with 250-character chunks and 10% overlap, chunk 1 spans characters 1–250, chunk 2 spans 226–475, chunk 3 spans 451–700. This ensures that words near the boundary of one chunk also appear near the center of a neighboring chunk, where they are surrounded by context. It solves the problem of words being cut off from the neighboring text that gives them meaning.
> #### Q3 — Recursive Splitting Tradeoffs
> Recursive character text splitting uses a structural delimiter — such as a newline between paragraphs — as the split point, so chunk boundaries align with natural document boundaries. Related ideas within a paragraph stay together, producing more coherent and semantically precise embeddings. The problem it introduces is variable chunk length: since paragraph lengths vary, some chunks will be very large (re-introducing the averaging problem) and others very small (losing contextual richness), making the system harder to tune than fixed-size splitting.
