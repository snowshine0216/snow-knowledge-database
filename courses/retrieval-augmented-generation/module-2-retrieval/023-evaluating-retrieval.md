---
tags: [rag, retrieval, evaluation, metrics, precision, recall, map, mrr, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/558u1/evaluating-retrieval
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. A retriever returns 20 documents for a query, and 10 of them are relevant. The knowledge base contains 25 relevant documents total. Without calculating, which metric — precision or recall — would you expect to be higher, and why?
2. What does "Precision at 5" (P@5) mean, and why would you report P@5 instead of overall precision?
3. Mean Reciprocal Rank (MRR) is described as "specialized." What specific aspect of retriever behavior does it measure that Recall and MAP do not capture as directly?

---

# Lecture 023: Evaluating Retrieval

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/558u1/evaluating-retrieval) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [Why Retrieval Quality Measurement Matters](#why-retrieval-quality-measurement-matters)
- [The Three Ingredients of Every Retrieval Metric](#the-three-ingredients-of-every-retrieval-metric)
- [Precision and Recall](#precision-and-recall)
- [Top-K Standardization and the Precision–Recall Trade-off](#top-k-standardization-and-the-precisionrecall-trade-off)
- [Mean Average Precision (MAP@K)](#mean-average-precision-mapk)
- [Mean Reciprocal Rank (MRR)](#mean-reciprocal-rank-mrr)
- [Using the Metrics Together](#using-the-metrics-together)

---

## Why Retrieval Quality Measurement Matters

Once a retriever is up and running, knowing whether it actually works requires more than an intuitive sense that results "seem reasonable." Like any software component, it needs to be measured objectively. Retrievers can be evaluated along many dimensions — latency, throughput, and resource consumption among them — but the metric that ultimately determines a RAG system's usefulness is **search quality**: is the retriever actually returning relevant documents?

Measuring search quality serves two distinct purposes. During development, it allows systematic comparison between different retriever configurations — for instance, how changing the balance between semantic and keyword search in a hybrid retriever affects the documents that get returned. In production, it enables ongoing monitoring so that degradation can be detected before it visibly harms user-facing answers. Both uses depend on having a formal, reproducible scoring system rather than ad hoc spot-checks. The metrics described in this lesson are exactly that scoring system.

---

## The Three Ingredients of Every Retrieval Metric

All standard retrieval quality metrics share a common set of inputs. The first is the **prompt** (or query) being evaluated. This matters because a retriever that performs well on some queries may perform poorly on others; measuring across a representative sample of prompts gives a more honest picture of real-world behavior than any single query.

The second ingredient is the **ranked list of documents** the retriever returns for that prompt. Most retrievers do not simply return a bag of documents — they impose an ordering, placing documents they consider most relevant at the top. Many metrics exploit this ordering, penalizing retrievers that bury the most relevant documents deep in the list.

The third ingredient is the **ground truth** — a pre-compiled list of all documents in the knowledge base that are actually relevant to the prompt. This is the answer key. Without it, there is no way to judge whether the retrieved documents are correct. Assembling ground truth is the most labor-intensive step in building a retrieval evaluation pipeline, but it is indispensable: a retriever cannot be graded without knowing what the correct answers look like.

---

## Precision and Recall

The two most fundamental retrieval metrics are **precision** and **recall**, and understanding the difference between them is central to interpreting all the more sophisticated metrics that build on them.

**Precision** measures how trustworthy the retrieved results are. It is calculated by dividing the number of *relevant* documents in the retrieved set by the *total* number of documents retrieved:

$$\text{Precision} = \frac{\text{relevant documents retrieved}}{\text{total documents retrieved}}$$

A precision of 1.0 means every returned document is relevant; a precision of 0.5 means half of the returned documents are irrelevant noise. Precision penalizes a retriever for returning documents that should not be there.

**Recall** measures how comprehensive the retriever is. It is calculated by dividing the number of relevant documents retrieved by the *total* number of relevant documents that exist in the knowledge base:

$$\text{Recall} = \frac{\text{relevant documents retrieved}}{\text{total relevant documents in knowledge base}}$$

A recall of 1.0 means the retriever found every relevant document in the knowledge base; a recall of 0.5 means it missed half of them. Recall penalizes a retriever for leaving relevant documents unfound.

A worked example makes the distinction concrete. Suppose a knowledge base contains 10 documents that are relevant to a particular prompt (established by hand-labeling). On the first run, the retriever returns 12 documents, 8 of which are relevant. Precision is 8/12 ≈ 67%, and recall is 8/10 = 80%. On an adjusted second run, the retriever returns 15 documents, 9 of which are relevant. Precision drops to 9/15 = 60%, while recall rises to 9/10 = 90%. The adjustment caused the retriever to cast a wider net — finding one more relevant document, but also pulling in three more irrelevant ones. This example illustrates the fundamental tension: widening the retrieval window tends to improve recall at the cost of precision. The only way to achieve both simultaneously is to rank relevant documents most highly *and* return only those documents — a demanding standard rarely fully met in practice.

---

## Top-K Standardization and the Precision–Recall Trade-off

Because precision and recall both depend on how many documents the retriever returns, comparing scores across different retriever configurations is only meaningful when the number of returned documents is held constant. The standard solution is to evaluate metrics at a fixed cutoff **K**, considering only the top-K documents the retriever ranked most highly.

**Precision at K** (P@K) and **Recall at K** (R@K) are therefore more precise versions of the raw metrics. For a ranked list of retrieved documents, P@5 is the fraction of the top 5 documents that are relevant, while P@10 is the fraction among the top 10. Using the same ranked list, if 2 of the top 5 are relevant then P@5 = 40%; if 6 of the top 10 are relevant then P@10 = 60%. If there are 8 relevant documents in the knowledge base, R@10 = 6/8 = 75%.

The choice of K reflects a design decision about how stringent the evaluation should be. Metrics at very low K (K=1, K=2, K=5) set strict standards — they measure whether the retriever places relevant documents *immediately* at the top of the ranking, which is important when downstream systems only consume the first few results. Metrics at moderate K (K=5 to K=15) provide a more holistic view of overall retriever quality, capturing whether the system is broadly finding relevant material even if not always ranking it first. Choosing K depends on how many retrieved documents the downstream LLM will actually use.

---

## Mean Average Precision (MAP@K)

Precision at K and Recall at K treat the top-K documents as an unordered set — they do not reward a retriever for placing relevant documents nearer the top of its ranking. **Mean Average Precision at K** (MAP@K) fills this gap by measuring the average precision at each rank position where a relevant document appears, rewarding retrievers that consistently surface relevant documents earlier.

To understand MAP@K, first consider **Average Precision at K** (AP@K) for a single query. The procedure is: list the top-K retrieved documents in rank order, then compute Precision at every rank position *k* from 1 to K. Next, sum those precision values *only for the rows that contain a relevant document* — positions with irrelevant documents do not contribute. Finally, divide that sum by the number of relevant documents found in the top K.

For a concrete example, consider the top 6 retrieved documents where the relevant ones appear at ranks 1, 4, and 5. The precision values at those three ranks are P@1 = 1/1 = 1.0, P@4 = 2/4 = 0.5, and P@5 = 3/5 = 0.6. The sum is 2.1, divided by 3 relevant documents, giving AP@6 = 0.7.

Why does MAP reward early ranking? If an irrelevant document appears at rank 2, it pushes all subsequent relevant documents down by one position. That reduces the precision value calculated at each of those later ranks, shrinking their contribution to the average. A retriever that consistently places relevant documents high in its ranking will produce high AP scores; one that mixes in irrelevant results near the top will be penalized.

**Mean Average Precision** is simply the arithmetic mean of AP@K values calculated across many different prompts. It summarizes what a "typical" query experience looks like — a high MAP indicates that the retriever is placing the relevant documents it finds near the top of its ranking, consistently, across the full distribution of queries the system receives.

---

## Mean Reciprocal Rank (MRR)

**Reciprocal Rank** is a simpler but highly focused metric that asks a single question: *where does the first relevant document appear in the ranking?* If the first relevant document is at rank 1, the reciprocal rank is 1/1 = 1.0. If it is at rank 2, the reciprocal rank is 1/2 = 0.5. If it is at rank 4, it is 1/4 = 0.25. The further down the list the first relevant document appears, the worse the score.

**Mean Reciprocal Rank** (MRR) aggregates reciprocal rank scores across multiple queries. If four searches return their first relevant document at ranks 1, 3, 6, and 2 respectively, the reciprocal ranks are 1.0, 1/3 ≈ 0.333, 1/6 ≈ 0.167, and 0.5. The mean of those four values is (1.0 + 0.333 + 0.167 + 0.5) / 4 = 0.5. An MRR of 0.5 means that, on average, the first relevant result appears around rank 2.

MRR is a specialized metric in the sense that it focuses exclusively on the very top of the ranking and entirely ignores what happens below the first relevant result. This makes it most valuable in scenarios where surfacing *at least one* highly-ranked relevant document is the primary success criterion — such as a question-answering system where the LLM is only shown the single top result. Systems that score well on MRR but poorly on Recall may be good at finding one relevant document while missing many others; recognizing this asymmetry matters when interpreting the metric.

---

## Using the Metrics Together

No single metric tells the complete story about retriever quality, and practitioners typically use a combination to get a rounded assessment.

**Recall at K** is the most foundational and widely cited metric. It captures the core purpose of a retriever — finding relevant documents — and it is the natural starting point for any evaluation. A retriever with poor recall is failing at its primary job regardless of how well it ranks what it does find.

**Precision and MAP** build on the recall foundation. Precision tells you whether the retriever is cluttering its results with irrelevant documents; MAP goes further by assessing whether the relevant documents it does retrieve are being ranked near the top. A retriever might have high recall but low precision (returning everything including a lot of noise) or high recall and high MAP (returning mostly relevant documents in well-ordered positions).

**MRR** is a targeted complement. When the downstream system — typically the LLM consuming the retrieved context — is particularly sensitive to whether the single most relevant document appears immediately at the top, MRR quantifies exactly that concern.

Together these metrics support both development iteration and production monitoring. Changing the weighting of semantic versus keyword search in a hybrid retriever, as covered in [[015-retriever-architecture-overview]], will shift precision and recall in ways that are only visible through systematic measurement. Running the same query set before and after a configuration change, then comparing the metric scores, transforms what would otherwise be a subjective judgment into an evidence-based decision. The practical cost is that assembling ground truth — the hand-labeled list of relevant documents for each sample query — is time-consuming. The return on that investment is a monitoring system that works both during development and after the system is in production.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. A retriever returns 15 documents for a query, 9 of which are relevant. The knowledge base has 10 relevant documents total. Calculate both precision and recall, and explain in one sentence what each number tells you about this retriever's behavior.
2. Explain, in plain terms, what MAP@K measures that Precision@K does not — and why the distinction matters for a ranked retrieval system.
3. Describe MRR in your own words: what does it measure, when is it the right metric to use, and what would a high MRR score fail to tell you?

> [!example]- Answer Guide
> #### Q1 — Precision and Recall Calculation
> 
> Precision = 9/15 = 60%: of the 15 documents returned, 40% are irrelevant noise — the retriever is not very trustworthy in the sense that many of its results should not be there. Recall = 9/10 = 90%: the retriever found 9 of the 10 documents that actually matter — it is highly comprehensive. Together the numbers tell you the retriever casts a wide, mostly successful net but includes a fair amount of irrelevant material alongside the good results.
> 
> #### Q2 — MAP@K vs Precision@K
> 
> Precision@K treats the top-K documents as an unordered set and only asks "how many are relevant?" MAP@K also asks "where in the ranking do the relevant documents appear?" by averaging precision values at each rank position where a relevant document is found. In a ranked retrieval system this distinction is crucial: a retriever that buries relevant documents at ranks 9 and 10 of a top-10 list scores the same Precision@10 as one that surfaces them at ranks 1 and 2, but receives a much lower MAP score. MAP rewards systems that surface the right documents *early*.
> 
> #### Q3 — MRR Meaning and Limits
> 
> MRR measures the position of the *first* relevant document across multiple queries — specifically, it averages the reciprocal of that rank position. It is the right metric when users or downstream systems (like a single-result QA system) need at least one relevant document as high in the ranking as possible. A high MRR score would fail to tell you whether the retriever is finding *all* (or even most) of the relevant documents in the knowledge base — a system could score perfectly on MRR by always returning one correct result while missing nine others, something only Recall would expose.
