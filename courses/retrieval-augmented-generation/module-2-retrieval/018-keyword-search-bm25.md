---
tags: [rag, retrieval, keyword-search, bm25, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/66p34/keyword-search---bm25
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. TF-IDF and BM25 both score keywords in documents — what specific weakness of TF-IDF does BM25 fix regarding documents that repeat a keyword many times?
2. What is "document length normalization" and why does BM25 apply it more gently than TF-IDF?
3. BM25 has two tunable hyperparameters. What aspects of scoring do they control, and why does tunability matter in a production retriever?

---

# Lecture 018: Keyword Search — BM25

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/66p34/keyword-search---bm25) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [From TF-IDF to BM25: What Changed and Why](#from-tf-idf-to-bm25-what-changed-and-why)
- [Term Frequency Saturation](#term-frequency-saturation)
- [Document Length Normalization](#document-length-normalization)
- [Tunable Hyperparameters](#tunable-hyperparameters)
- [Keyword Search in Practice: Strengths and Limits](#keyword-search-in-practice-strengths-and-limits)

---

## From TF-IDF to BM25: What Changed and Why

Best Matching 25, universally shortened to **BM25**, is the keyword search algorithm that powers the majority of modern retrieval systems. Its unusual name reflects its origins: it was the twenty-fifth scoring function in a series proposed by its inventors during a period of systematic research into probabilistic retrieval models. That lineage — decades of iteration — is part of why BM25 has remained the industry default. It is not a clever theoretical construction from first principles; it is an algorithm that survived the empirical gauntlet of many variants.

BM25 shares its skeleton with TF-IDF, the classic keyword scoring algorithm introduced in [[015-retriever-architecture-overview]]. Both approaches work by generating a relevance score for each keyword in a query against a particular document, then summing those scores to produce a total relevance score for the document. That total score is used to rank documents in response to a query. As with TF-IDF, both the query and every document in the knowledge base are represented as **sparse vectors** — high-dimensional vectors in which each dimension corresponds to a word in the system's vocabulary, and the value at each dimension reflects how important that word is in the given text. Most dimensions are zero because any single piece of text uses only a small fraction of all possible words.

The formula underlying BM25 builds on TF-IDF's core logic but introduces two structural improvements that address real failure modes. These improvements — term frequency saturation and gentler document length normalization — make BM25 substantially more accurate in practice without meaningfully increasing computational cost. Understanding each improvement separately is the clearest path to understanding why BM25 has endured.

---

## Term Frequency Saturation

The most important improvement BM25 makes over TF-IDF is how it handles repeated keywords within a single document. TF-IDF's term frequency component is roughly linear: a document that contains the keyword "database" ten times receives roughly twice the raw term-frequency score of one that contains it five times. The intuition behind this is sound — more occurrences suggest greater relevance — but the linear relationship breaks down at higher counts. A technical manual that mentions "database" forty times is not twice as relevant as one that mentions it twenty times. The extra occurrences are redundant signal; the document has already demonstrated that it is heavily focused on databases.

BM25 corrects this through a mechanism called **term frequency saturation**. Instead of a linear relationship between keyword count and score contribution, BM25 uses a formula in which the score contribution increases rapidly with the first few occurrences but flattens asymptotically as the count grows. The first occurrence of a keyword has substantial impact; the fifth occurrence adds much less; the fifteenth occurrence adds almost nothing. The score approaches a ceiling — it saturates — rather than climbing indefinitely. This better matches human intuition about relevance: the presence of a keyword matters, and moderate repetition confirms relevance, but extreme repetition beyond a threshold does not meaningfully increase how relevant the document is.

The practical effect is that BM25 is less susceptible to keyword stuffing — documents that pad their content with repeated instances of high-value terms to inflate their scores. In TF-IDF, a document that artificially repeats a keyword a hundred times can dominate the ranking. BM25's saturation behavior means that advantage disappears after the first handful of repetitions, leaving the comparison between documents on more substantive grounds.

---

## Document Length Normalization

Both TF-IDF and BM25 penalize long documents. The reasoning is straightforward: a very long document — a 200-page technical specification, for example — will naturally contain many keywords purely by virtue of its length. If keyword counts are compared directly, length always favors longer documents, even when shorter ones are more focused and relevant. Some form of normalization relative to document length is therefore essential.

TF-IDF handles this through a direct normalization that divides by a measure of document length. The consequence is that every additional word a document contains adds a fixed incremental penalty to its score. For moderately long documents this is appropriate, but for very long documents the accumulated penalty becomes severe. A long document that repeatedly and consistently discusses a keyword — a document that is genuinely and exhaustively relevant — can be discounted so heavily that it falls below shorter, less thorough documents in the ranking. This is an over-correction.

BM25 applies what the field calls **document length normalization with diminishing penalties**. As a document grows longer, each additional word contributes a progressively smaller additional penalty. The first words added beyond the average document length impose the steepest penalty; further growth has diminishing marginal impact on the score. The result is that very long documents are still penalized relative to short ones — as they should be, to counter the natural frequency advantage length confers — but the penalty no longer spirals into arbitrary discounting. A long, focused document that truly covers a topic in depth can still score highly, because the diminishing normalization allows its high keyword frequency to overcome the length penalty. Short, tightly written documents are still favored for efficiency, but length alone no longer disqualifies a document from ranking well.

---

## Tunable Hyperparameters

A distinctive feature of BM25 relative to TF-IDF is that it exposes **two tunable hyperparameters** that directly control the degree of term frequency saturation and the aggressiveness of document length normalization. These parameters allow the scoring behavior to be adjusted to fit the specific statistical characteristics of a knowledge base.

The first hyperparameter controls how quickly the term frequency contribution saturates. At one extreme, a very low value causes rapid saturation — the second occurrence of a keyword adds almost nothing beyond the first. At the other extreme, a high value delays saturation, behaving more like TF-IDF's near-linear scaling. The optimal value depends on how repetitive the documents in the knowledge base are and what repetition actually signals about relevance in that domain. A knowledge base of short product descriptions behaves differently from a corpus of lengthy research papers.

The second hyperparameter controls the degree to which document length is penalized. Setting it to zero removes length normalization entirely, making BM25 behave as if all documents were the same length. A high value applies strong length normalization, heavily discounting longer documents. In practice, the optimal value depends on how variable document lengths are in the knowledge base and whether length variation is meaningful signal or noise.

In a production retriever, these hyperparameters are tuned empirically — adjusted by evaluating retrieval quality against a labeled set of queries and documents, then selecting the combination that best maximizes retrieval accuracy on the knowledge base at hand. This tunability is one of BM25's practical advantages: it is not a one-size-fits-all formula, but a flexible framework that can be calibrated to the specific data distribution it will operate on.

---

## Keyword Search in Practice: Strengths and Limits

BM25 has been the standard keyword search algorithm in production retrieval systems for decades because it strikes an exceptionally good balance between complexity and performance. Its computational cost is roughly equivalent to TF-IDF — both operate on sparse vectors, which are cheap to compute and compare — but its retrieval accuracy on real-world data is substantially better, owing to the saturation and normalization improvements described above.

The primary strength of keyword search as a class of algorithms is its simplicity and reliability. Keyword-based retrieval ensures that retrieved documents will contain words from the user's query. This is particularly valuable in domains where users are expected to use precise technical terminology: product names, medical codes, legal citations, software library names. When a user queries for a specific function name or product identifier, keyword search will find documents containing that exact string with high reliability. In these cases, BM25 can perform competitively with or even surpass more sophisticated retrieval methods, because the user's vocabulary and the document vocabulary naturally align.

BM25 is also frequently used as a competitive baseline for evaluating more advanced retrieval techniques. A well-tuned BM25 retriever sets a performance floor that is often surprisingly difficult to beat, which is why it remains the default choice in many production systems and why retrieval research papers routinely compare against it.

The fundamental limitation of keyword search is its dependence on vocabulary overlap. BM25 can only find a document if the user's query contains words that actually appear in that document. If a user asks about "ways to speed up slow queries" while the relevant document discusses "database query optimization techniques," keyword search may fail to surface the match — the concepts are equivalent, but the words are different. This mismatch between user vocabulary and document vocabulary is the central weakness that **semantic search** addresses, as covered in the next lecture. For queries where conceptual similarity matters more than exact word matching, keyword search alone is insufficient, and hybrid approaches that combine BM25 with semantic retrieval become necessary.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain what term frequency saturation means in BM25 and why it produces better rankings than TF-IDF's linear term frequency scoring.
2. Why does BM25 use diminishing document length penalties rather than the direct normalization used in TF-IDF? What failure mode does this fix?
3. Name the two tunable hyperparameters in BM25, describe what each controls, and explain why tunability is a meaningful practical advantage over TF-IDF.

> [!example]- Answer Guide
>
> #### Q1 — Term Frequency Saturation in BM25
>
> Term frequency saturation means that BM25's score contribution from a keyword grows quickly with the first few occurrences but flattens asymptotically as the count increases, approaching a ceiling rather than rising indefinitely. TF-IDF scores keyword counts nearly linearly, so a document with forty mentions of a term scores roughly twice as high as one with twenty — even though the extra repetition adds no real relevance signal. BM25's saturation prevents this runaway reward for repetition, making rankings more accurate and less exploitable by keyword stuffing.
>
> #### Q2 — Diminishing Length Penalties
>
> TF-IDF applies a fixed per-word penalty as documents grow longer, which means very long documents accumulate heavy discounts regardless of how focused and relevant they are. This over-corrects: a genuinely exhaustive reference document that covers a topic in depth gets buried under shorter, shallower results. BM25's diminishing length penalties impose steep discounts for the first growth beyond average length but smaller marginal penalties as length continues to increase. This allows long, keyword-dense, genuinely relevant documents to still rank highly, while still protecting against short-document disadvantage due to raw count differences.
>
> #### Q3 — Two Tunable Hyperparameters
>
> The first hyperparameter controls the rate of term frequency saturation — how quickly the score contribution from repeated keywords flattens. The second controls the strength of document length normalization — how aggressively longer documents are penalized relative to shorter ones. TF-IDF has no equivalent knobs; its scoring behavior is fixed. BM25's tunability matters because different knowledge bases have different statistical profiles: a corpus of terse product descriptions behaves very differently from a corpus of lengthy technical papers, and the optimal scoring balance differs accordingly. Empirical tuning on a labeled evaluation set allows BM25 to be calibrated to the specific data at hand.
