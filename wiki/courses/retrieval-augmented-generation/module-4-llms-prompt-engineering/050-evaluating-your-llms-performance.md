---
tags: [rag, evaluation, llm-as-judge, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/66p3pm/evaluating-your-llms-performance
---

## Pre-test

1. **In a RAG pipeline, the LLM and the retriever each have a distinct responsibility. What specific failure modes belong exclusively to the LLM layer, and why does conflating LLM failures with retriever failures waste engineering effort?**

2. **The Ragas "response relevancy" metric does not directly check factual accuracy. Describe precisely how the metric is computed and explain what property of a response it actually quantifies.**

3. **LLM-as-judge evaluation and user-satisfaction A/B testing measure LLM performance at different system levels. In what scenario is each approach the better choice, and what are the blind spots of each?**

---

# Lecture 050: Evaluating Your LLM's Performance

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/66p3pm/evaluating-your-llms-performance | DeepLearning.AI | Retrieval-Augmented Generation Course

## Outline

1. [Scoping the LLM's Role Before Evaluating It](#1-scoping-the-llms-role-before-evaluating-it)
2. [Why Subjective Quality Requires LLM-as-Judge Evaluation](#2-why-subjective-quality-requires-llm-as-judge-evaluation)
3. [Response Relevancy: Measuring Prompt Alignment](#3-response-relevancy-measuring-prompt-alignment)
4. [Faithfulness: Measuring Grounding in Retrieved Evidence](#4-faithfulness-measuring-grounding-in-retrieved-evidence)
5. [Other Ragas Metrics and Their Common Pattern](#5-other-ragas-metrics-and-their-common-pattern)
6. [System-Level Signals: A/B Testing User Satisfaction](#6-system-level-signals-ab-testing-user-satisfaction)

---

## 1. Scoping the LLM's Role Before Evaluating It

A RAG system is a pipeline of at least two distinct components — a retriever and a generator — and diagnosing performance problems requires attributing failures to the right component. The retriever's job is to surface relevant documents from the knowledge base; the LLM's job is to consume those documents alongside the user's query and construct a high-quality response. These are separate responsibilities, and they call for separate evaluation strategies.

This separation matters practically because the two components fail in different ways. A retriever fails when it returns documents that are off-topic, incomplete, or ranked poorly — the kinds of problems addressed in [[023-evaluating-retrieval]]. An LLM fails when it ignores clearly relevant retrieved content, fabricates claims that are not supported by the retrieved context, drifts away from the user's original question, or gets distracted by irrelevant passages that happened to appear in the retrieved set.

If you skip this scoping step and apply a single aggregate metric to the whole system, you risk drawing the wrong remediation conclusion. Suppose overall user satisfaction drops after a knowledge-base update. Without isolated metrics, you might spend days rewriting your [[046-prompt-engineering-building-your-augmented-prompt]] when the actual problem is that the new documents are poorly chunked and the retriever is returning lower-quality context. Conversely, if your retriever is performing well and the problem is genuinely with generation quality, then debugging the retrieval pipeline wastes equivalent effort in the other direction.

The practical starting assumption — and the one this lesson builds its evaluation framework on — is that the retriever is operating reasonably well. It will return mostly relevant information, possibly polluted by a small number of irrelevant documents. Given this assumption, the LLM must do four things: answer the user's question, incorporate relevant retrieved information, cite sources appropriately, and resist being misled by whatever irrelevant passages are present. Each of these behaviours is a candidate dimension for evaluation.

---

## 2. Why Subjective Quality Requires LLM-as-Judge Evaluation

Most retriever metrics are computable with straightforward information-retrieval statistics: precision at k, recall at k, mean reciprocal rank, and related quantities all reduce to counting whether known-relevant documents appear in the retrieved set. These computations are deterministic, cheap, and require no inference calls beyond the retriever itself.

LLM generation quality does not share this property. Consider two responses to the same query: one is verbose but technically accurate and cites every relevant source; the other is concise, equally accurate, and cites only the most authoritative source. Which is better? The answer depends on the use case, the audience, and the implicit expectations embedded in the system prompt — none of which collapse neatly into a single scalar metric derived from exact string matching.

The subjectivity of generation quality means that automated evaluation of LLM outputs almost always requires another LLM to act as judge. This is the "LLM-as-judge" pattern: a separate, typically larger or differently prompted model receives the original query, the retrieved context, and the generated response, then scores or characterises the response along one or more quality dimensions. The judge model's evaluation carries the flexibility needed to handle the range of valid responses that could reasonably answer a given query.

The practical consequence is that LLM-specific evaluation is more expensive than retrieval evaluation — it multiplies inference calls — and it inherits the judge model's own biases and limitations. A judge model trained to prefer verbose academic prose will systematically downrate terse but equally correct answers. This is why, as the lesson emphasises, real evaluation pipelines should combine automated LLM-as-judge metrics with periodic human review, and why libraries like Ragas provide transparent, reproducible implementations of specific judge-based metrics rather than black-box scores. See [[006-introduction-to-llms]] for background on why LLM outputs are probabilistic and difficult to canonicalise.

---

## 3. Response Relevancy: Measuring Prompt Alignment

The **response relevancy** metric in the Ragas library measures whether the generated response is actually addressing the user's original question, independent of whether the response is factually accurate. It is important to keep this distinction clear: a response can be highly relevant (it answers exactly what was asked) while still being factually wrong, or it can be factually correct while being largely irrelevant (it answers a slightly different question than the one posed).

The computation proceeds in four steps:

1. The RAG system's generated response is passed to a separate LLM (the judge). The judge is prompted to produce several candidate questions — typically three to five — that it believes could have naturally led to that response.

2. Both the original user query and each of these reconstructed candidate queries are embedded into dense semantic vectors using an embedding model.

3. The cosine similarity between the original query vector and each candidate query vector is computed. Because cosine similarity is symmetric and unit-normalised, it measures the angular distance in semantic space between the original intent and the inferred intents.

4. The cosine similarity scores across all candidate queries are averaged to yield the final response relevancy score for that example.

The intuition behind the reverse-engineering approach is elegant: if a response genuinely answers the user's question, then a model reasoning backwards from the response should be able to reconstruct questions that closely resemble the original. If the response drifted off-topic, the reconstructed questions will point in a different semantic direction, and the cosine similarities will be low.

Note what this metric does *not* catch: a high response relevancy score does not indicate that the answer is grounded in the retrieved documents, that the facts stated are accurate, or that the response properly cites its sources. It only confirms that the LLM stayed on-topic with respect to the user's intent. A response that confidently and on-topic hallucinates an entirely fabricated answer would score well on response relevancy. This is why response relevancy must be used in combination with faithfulness and other complementary metrics.

---

## 4. Faithfulness: Measuring Grounding in Retrieved Evidence

Where response relevancy focuses on the relationship between the response and the user's query, **faithfulness** focuses on the relationship between the response and the retrieved context. It answers the question: how much of what the LLM claims is actually supported by the documents that were retrieved?

Ragas computes faithfulness in two LLM-assisted stages:

1. A judge LLM reads the generated response and identifies all discrete factual claims — atomic statements that could each be independently verified. For example, a response that says "The Eiffel Tower was built in 1889 and stands 330 metres tall" contains two claims: a construction date and a height.

2. For each identified claim, a second judge call determines whether that claim is *entailed by* or *contradicted by or absent from* the retrieved documents. A claim is considered supported if at least one retrieved passage provides evidence for it.

The faithfulness score is the fraction of identified claims that are supported by the retrieved context. A score of 1.0 means every factual assertion in the response can be traced back to a retrieved document. A score of 0.5 means half the claims have no grounding in the retrieval set.

Low faithfulness has a specific diagnosis: the LLM is generating content from its parametric memory rather than from the retrieved context. In a RAG system, this is almost always undesirable. The entire point of the retrieval augmentation is to ground the LLM's responses in up-to-date, domain-specific documents rather than in potentially stale or domain-inappropriate pre-training knowledge. See [[043-llm-sampling-strategies]] for how sampling temperature can influence the degree to which an LLM adheres to or departs from its input context.

A combination of high response relevancy and high faithfulness gives you a response that both answers the question and backs its claims with retrieved evidence — which is the quality target for most RAG applications.

---

## 5. Other Ragas Metrics and Their Common Pattern

Beyond response relevancy and faithfulness, the Ragas library provides additional metrics that evaluate other LLM-specific behaviours. One notable example is **noise sensitivity**, which measures how much the LLM's response quality degrades when the retrieved set contains irrelevant or misleading documents mixed in with relevant ones. This tests the robustness of the LLM's ability to discriminate between useful and distracting context — a capability that [[047-prompt-engineering-advanced-techniques]] can influence through careful prompt construction.

Another metric concerns **citation accuracy**: given that the system prompt instructs the LLM to cite specific retrieved sources, does the LLM correctly attribute information to the right documents rather than confusing or fabricating citations?

Despite their differences, these metrics share a common architectural pattern: at some point in the evaluation process, one or more LLM calls are required to interpret, classify, or score the generated output. In some metrics, ground-truth reference answers are also needed — correct answers against which the generated response can be compared semantically. This reliance on LLM calls and sometimes reference data reflects the fundamental complexity of evaluating natural-language generation: the output space is too large and too semantically rich for purely symbolic comparison methods.

The implication for practitioners is that running a full Ragas evaluation suite is not free. Each evaluation call incurs API costs proportional to the length of the documents and responses being judged. This cost should be factored into the evaluation budget, and metrics should be prioritised based on which failure mode is most consequential for the specific application.

---

## 6. System-Level Signals: A/B Testing User Satisfaction

The metrics described above are all *component-level* evaluations: they take individual (query, retrieval, response) triples and score the LLM's output on specific quality dimensions. This is valuable for diagnosing what the LLM is doing wrong in controlled experiments. But there is a complementary approach that operates at the level of the entire deployed system: collecting user satisfaction signals and attributing changes in those signals to specific changes in LLM configuration.

The classic implementation uses a binary feedback mechanism — thumbs up or thumbs down — that users can apply to any response. This produces a satisfaction rate (fraction of responses marked positively) that aggregates across all queries over a time window. The key technique for using this signal to evaluate LLM-specific changes is **A/B testing with isolated variables**: change exactly one LLM-related setting — the system prompt, the model version, the sampling temperature, or the context window strategy — while holding all retrieval and infrastructure settings constant. Route some fraction of traffic to the variant configuration. After a statistically significant number of interactions, compare satisfaction rates between the control and variant groups.

Any difference in satisfaction rates can then be attributed to the LLM change, because the retriever, the data pipeline, and every other component are identical between the two groups. This is the system-level analog of the component-level evaluation: instead of judging individual responses with an LLM judge, you judge aggregate behaviour with human feedback.

The limitation of this approach is latency: it requires accumulating real user interactions over time, which means it cannot produce a signal in minutes the way an automated Ragas evaluation can. It is also sensitive to confounds — if user behaviour shifts for external reasons during the A/B test period, the satisfaction signal will be noisy. But its advantage is that it captures what users *actually* care about, not what a judge LLM is prompted to care about, making it the highest-validity signal available for deployed systems.

The lesson's recommendation is to combine both paradigms: use automated LLM-as-judge metrics from libraries like Ragas to iterate quickly during development, and use user-satisfaction A/B testing in production to validate that development-time improvements translate into real-world quality gains.

---

## Post-test

1. **The response relevancy metric uses cosine similarity between the original user query and LLM-reconstructed queries derived from the generated response. Why is reverse-engineering the query from the response — rather than directly comparing the response to the query — a more reliable signal of prompt alignment?**

2. **A RAG system has a faithfulness score of 0.4 on a test set. What are the two most likely root causes of this low score, and what changes to the system would address each cause?**

3. **You are evaluating whether to switch from model A to model B in your production RAG system. You run Ragas metrics on a held-out test set and model B scores higher on response relevancy and faithfulness. Your manager asks whether you should immediately deploy model B. What additional evaluation step should you complete first, and what could Ragas metrics miss that this step would catch?**

<details><summary>Answer guide</summary>

**Post-test 1:** Direct comparison of a response to a query is difficult because valid responses can differ substantially in form from the query — a query is typically a short natural-language question while a response is a longer, structured answer. Comparing them as text strings or even semantic vectors produces a low similarity score even for perfect responses, because the linguistic form is so different. The reverse-engineering approach sidesteps this by generating reconstructed questions in the same short-question form as the original, making the semantic comparison fair. If the response genuinely addressed the query, the reverse-engineering process should converge on questions semantically close to the original; if the response drifted, it will converge on different questions, lowering the score.

**Post-test 2:** A faithfulness score of 0.4 means 60% of the LLM's factual claims are not supported by the retrieved context. Root cause 1: the LLM is "hallucinating" from its parametric memory — it has relevant pre-training knowledge about the topic and inserts it into the response rather than restricting itself to retrieved evidence. Fix: strengthen the system prompt to explicitly instruct the LLM to only state information present in the retrieved documents, and potentially lower temperature to reduce generative creativity. Root cause 2: the retriever is returning largely irrelevant documents, so the LLM has so little useful context that it is forced to generate from memory. Fix: diagnose and improve retrieval quality using metrics from [[023-evaluating-retrieval]] — improving recall and precision of the retriever will give the LLM better grounding material.

**Post-test 3:** Before deploying model B in production, run a controlled A/B test with real users. Ragas metrics evaluate individual response quality on a held-out test set, but they can miss several real-world factors: (a) the test set may not be representative of the actual query distribution in production; (b) the LLM judge used by Ragas has its own biases and may systematically favour certain response styles that users dislike; (c) latency differences between models A and B are not captured by quality metrics but directly affect user satisfaction; (d) edge cases unique to the production environment — unusual queries, adversarial inputs, language diversity — may not appear in the test set. The A/B test subjects both models to the same real traffic and measures aggregate user satisfaction directly, providing the highest-validity signal before a full deployment decision.

</details>
