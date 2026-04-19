---
tags: [rag, hallucinations, grounding, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/rrngmz/handling-hallucinations
---

## Pre-test

1. A RAG system retrieves accurate information about senior and new-customer discounts, but the LLM tells a user that a student discount also exists. At which stage of the pipeline did the error originate, and what property of LLMs makes this kind of fabrication possible even when retrieved context is correct?

2. Explain the self-consistency checking approach to hallucination detection. What is the core assumption it relies on, and why is it often impractical as a production-grade safeguard?

3. What does the ContextCite system do, and how does it differ from simply prompting the LLM to "cite your sources" at the end of each paragraph?

---

# Lecture 049: Handling Hallucinations

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/rrngmz/handling-hallucinations

## Outline

1. [Why LLMs Hallucinate](#why-llms-hallucinate)
2. [Why Hallucinations Are Especially Dangerous in RAG](#why-hallucinations-are-especially-dangerous-in-rag)
3. [Types of Hallucination](#types-of-hallucination)
4. [Grounding Responses in Retrieved Information](#grounding-responses-in-retrieved-information)
5. [Automated Citation and Source Attribution](#automated-citation-and-source-attribution)
6. [Benchmarking and Ongoing Evaluation](#benchmarking-and-ongoing-evaluation)

---

## Why LLMs Hallucinate

A language model is, at its core, a next-token prediction engine. During training it learns the statistical patterns of large text corpora, and at inference time it generates the most *probable* continuation of the tokens it has seen so far. Crucially, "probable" is not the same as "true." The model has no internal fact-checker and no direct representation of the real world — only the probability distributions it absorbed from training data. A small amount of randomness (temperature > 0) is deliberately injected into sampling so that responses feel natural rather than robotic, but this same randomness opens a door for plausible-sounding inventions.

This is the root cause of hallucinations: the model optimizes for text that *sounds right*, not text that *is* right. When a user asks a question whose answer was rare or absent in the training corpus, the model will still attempt a confident-sounding response rather than producing a low-probability hedge. The result is fabricated detail that fits the narrative context while contradicting factual reality.

Understanding this mechanism is important because it shapes the entire defensive strategy. You cannot simply "train away" hallucinations without sacrificing fluency. The safeguards must be external — grounding the model against a trusted knowledge source and then verifying that grounding was used correctly.

---

## Why Hallucinations Are Especially Dangerous in RAG

Hallucinations share three properties that make them particularly harmful in a production system. First, they are factually wrong, and incorrect information delivered to a customer or decision-maker causes real harm — a user who books based on a fabricated discount will be disappointed at checkout. Second, hallucinations are almost by definition *plausible*: a model that invents a "student discount" does so in a context where other discounts exist and the framing matches customer expectations, making the error hard to spot without independent verification. Third, even rare hallucinations erode user trust over time; once users learn that a system sometimes lies confidently, they discount all of its output.

RAG was designed specifically to address the first and third problems. By injecting retrieved passages from a trusted knowledge base into the prompt, you give the model authoritative information to reason from rather than relying solely on its trained weights. As lessons [[006-introduction-to-llms]] and [[046-prompt-engineering-building-your-augmented-prompt]] both emphasize, the quality of the retrieval pipeline and the construction of the augmented prompt are therefore not just performance concerns — they are safety concerns. A poorly constructed prompt that buries retrieved context in noise will still produce hallucinations even when the right information was technically present.

That said, RAG does not eliminate hallucinations. It reduces their frequency by providing better grounding material, but additional measures are still required to maximize trustworthiness.

---

## Types of Hallucination

Hallucinations exist on a spectrum of severity, and recognizing this spectrum helps you calibrate evaluation efforts appropriately.

At the mild end, the model may reproduce the correct general fact but misstate a specific detail. In the running example, the LLM might accurately describe the senior discount but state the discount as 5% when it is actually 10%. This is a quantitative error that, while wrong, at least points the user toward the right information category.

More serious is an error of omission or negation: the model claims that a discount does not exist when in fact it does, or omits a critical condition. These errors are harder for users to catch because they receive a confident denial rather than a suspicious-sounding claim.

Most severe is complete fabrication: inventing a discount, a product feature, a policy, or a fact that has no basis in the retrieved context or the real world whatsoever. The student-discount scenario in the lesson transcript is this third type. The retriever correctly returned information about senior and new-customer discounts; the LLM did not limit itself to those facts but extrapolated a new category, motivated by the general instruction to be helpful.

An evaluation framework must be sensitive to all three levels. A system that only catches outright inventions while missing quantitative distortions is still producing unreliable output.

---

## Grounding Responses in Retrieved Information

The most impactful lever for reducing hallucinations is also the simplest: write a system prompt that explicitly restricts the model to what the retrieved documents say. Whereas a generic helpfulness instruction ("be as helpful as possible") leaves the model free to fill gaps with its own knowledge, an instruction such as "answer only using the information in the provided context; if the context does not support an answer, say so" establishes a constraint the model will generally honor.

This is the single highest-leverage action a RAG developer can take. It transforms the default behavior from probabilistic completion to conditioned extraction. The model still generates text, but it has a strong prior that deviates from the retrieved content are disfavored by the task framing. Lesson [[046-prompt-engineering-building-your-augmented-prompt]] covers the mechanics of structuring the system prompt and injecting retrieved context; lesson 049 now explains *why* those structural choices matter for factual reliability, not just output quality.

A complementary strategy is to require the model to express uncertainty explicitly. Phrases like "the provided documents do not mention this" or "based on the context, I cannot confirm" are preferable to confident confabulation. This can be enforced through the system prompt and validated by human review or automated classifiers in the evaluation phase.

When neither a strictly constrained system prompt nor explicit uncertainty expressions are sufficient — for example, if the domain requires nuanced reasoning across multiple documents — you may need to introduce retrieval re-ranking or a two-pass architecture where a second model checks whether the first model's claims are supported by the retrieved passages. These more sophisticated pipelines build on the grounding principle but add computational cost, so the right trade-off depends on the criticality of the use case.

---

## Automated Citation and Source Attribution

A grounding instruction can reduce hallucinations, but it cannot guarantee them away. A complementary approach is to require the model to cite specific source documents for each factual claim, making it straightforward for either a human reviewer or an automated system to audit the response.

The simplest form is a prompting instruction: "For each factual claim, append a citation to the document from which it came." Models fine-tuned on citation-heavy corpora tend to follow this instruction reliably, but there is a significant risk: the model may hallucinate citations just as readily as it hallucinate facts. A fabricated discount number can be paired with a fabricated document reference that sounds plausible but does not exist.

To address this, external grounding verification systems have been developed. ContextCite, discussed in the lesson, is one such system. It works by processing the model's response sentence by sentence and attributing each sentence to one of the retrieved context documents that were included in the prompt. The attribution is computed through semantic similarity rather than model self-reporting, so it does not rely on the model's own citation behavior. Sentences that cannot be matched to any retrieved document are labeled "no source," giving the operator a clear signal that the corresponding claim requires manual verification or should be suppressed entirely.

Some implementations of ContextCite also output a numeric similarity score between each sentence and its attributed source. This score can be used as a threshold filter: responses with a high proportion of low-similarity or no-source sentences can be rejected or flagged before reaching the end user. Used in combination with the grounding system prompt from lesson [[047-prompt-engineering-advanced-techniques]], ContextCite forms a two-layer defense — the first layer prevents the model from straying from retrieved context, and the second layer detects cases where it strayed anyway.

---

## Benchmarking and Ongoing Evaluation

Because hallucination cannot be fully eliminated, it must be continuously measured. Benchmarks designed for this purpose allow developers to track hallucination rates across system changes and compare different configurations objectively.

The ALCE (Attributed and Faithful LLM Completions Evaluation) benchmark, referenced in the lesson, provides pre-assembled knowledge bases and sample questions. A RAG system generates responses for each question, and the benchmark evaluates three dimensions: fluency (how readable and grammatically coherent the output is), correctness (how factually accurate the response is relative to the ground-truth knowledge base), and citation quality (how well the citations provided by the model align with the actual supporting documents in the knowledge base).

These three metrics map directly to the three failure modes discussed earlier. A system can be fluent but incorrect, or correct but uncited, or well-cited but attributing claims to the wrong sources. Tracking all three independently is therefore more informative than any single aggregate score.

Benchmarks like ALCE do not prevent hallucinations in production — they are diagnostic tools, not runtime safeguards. Their value lies in giving development teams a reproducible, comparable signal. Before deploying a change to the retrieval strategy (for example, switching from BM25 to a dense retriever as covered in earlier modules), running the ALCE evaluation suite against both configurations tells you whether factual accuracy improved or degraded. Without such discipline it is easy to optimize for NDCG or MRR in retrieval while inadvertently making hallucinations worse in the final generated output.

Together, the three-layer strategy — grounding system prompt, automated source attribution, and benchmark-based evaluation — forms the recommended approach. None of the three layers alone is sufficient; used together they create overlapping defenses that substantially reduce the probability of a false claim reaching a user.

---

## Post-test

1. A senior engineer proposes using self-consistency checking to detect hallucinations: run the same query ten times and flag any responses that contradict each other. What is the theoretical justification for this approach, what are its two main practical weaknesses, and under what conditions (if any) would you recommend it over a knowledge-base grounding approach?

2. Your RAG chatbot's system prompt says "be helpful and accurate." After deploying, you observe that the model frequently invents product details not present in retrieved documents. Write a revised system prompt instruction (two to three sentences) that would directly address this grounding failure, and explain the behavioral mechanism through which your revision reduces hallucinations.

3. You run the ALCE benchmark on your RAG system before and after replacing the retriever. Fluency stays constant, correctness improves by 8 points, but citation quality drops by 15 points. How do you interpret this result, and what follow-up action would you take before deploying the new retriever to production?

<details><summary>Answer guide</summary>

**Pre-test answers**

1. The error originated in the LLM generation stage, not retrieval. The retriever correctly returned information about senior and new-customer discounts. However, the LLM — instructed to be "helpful" and trained on patterns where student discounts commonly appear alongside other discount types — generated the most probable continuation for a helpful customer service response. LLMs hallucinate because they optimize for probable text sequences, not factual accuracy; they have no mechanism to distinguish between "this is in the context" and "this would fit the context."

2. Self-consistency checking generates the same prompt multiple times and compares factual content across completions. The assumption is that hallucinated details are generated inconsistently (the model fabricates different numbers or names each time), while true facts from training data appear consistently. In practice it is impractical because (a) it multiplies inference cost by the number of runs (ten runs = ten times the latency/cost) and (b) a model can hallucinate the same false detail consistently if that false detail is well-represented in its training distribution. A knowledge-base grounding approach is almost always superior when a retrieval corpus is available.

3. Simply prompting the LLM to "cite your sources" relies on the model generating citations itself, which can itself hallucinate — the model invents a plausible-sounding document title that does not exist. ContextCite is an external system that uses semantic similarity between each sentence in the response and the retrieved source documents to attribute claims; it does not trust the model's self-reported citations. Sentences without supporting source documents are labeled "no source," providing a grounded audit trail that cannot be fabricated by the LLM.

---

**Post-test answers**

1. Theoretical justification: hallucinated details arise from random sampling and are therefore inconsistent across runs, while factual content from training data is stable. Practical weaknesses: (a) ten inference calls per query is prohibitively expensive at scale; (b) a consistently hallucinated "fact" (one well-anchored in training data) will appear the same across all runs and will not be flagged. Recommendation: use self-consistency only in very high-stakes, low-volume scenarios where a knowledge base is genuinely unavailable; whenever a RAG knowledge base exists, grounding against it is faster, cheaper, and more reliable.

2. Example revised instruction: "Answer only using information explicitly present in the provided context documents. If the context does not contain enough information to answer the question, respond with 'I don't have enough information to answer that based on the available documents.' Do not add details, estimates, or facts from outside the provided context." This reduces hallucinations by replacing the open-ended "be helpful" framing — which licenses the model to fill gaps — with a hard constraint that frames any invention as a violation of the task definition. The model's completion probability distribution shifts toward extraction over generation.

3. Interpretation: the new retriever is returning more relevant documents (correctness up), but those documents are either harder for the model to cite correctly, or the retriever is returning more documents that contain the right answer but are formatted in a way that confuses citation matching. A 15-point drop in citation quality is a serious trust problem even if raw factual accuracy improved. Follow-up action: investigate whether the new retriever returns longer or more numerous documents that dilute citation clarity; consider adding an explicit citation instruction or running ContextCite-style attribution on the new configuration before deployment; re-run the benchmark with the citation instruction added and verify that correctness is preserved while citation quality recovers.

</details>
