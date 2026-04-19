---
tags: [agentic-ai, deeplearning-ai, course, evaluation, debugging, problem-solving, iteration]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/ldf4ci/how-to-address-problems-you-identify
---

## Pre-test

1. When a non-LM component like a RAG retrieval system is underperforming, what are the two primary categories of intervention available to you, and what distinguishes them?

2. Why does Andrew Ng recommend exhausting prompting and model-swapping strategies before attempting fine-tuning for an LM-based component in an agentic workflow?

3. How does developing a personal set of evaluations and reading published prompts from respected open-source projects help a practitioner hone model-selection intuition over time?

---

# Lecture 032: How to Address Problems You Identify

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/ldf4ci/how-to-address-problems-you-identify) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [Improving Non-LM Components](#improving-non-lm-components)
- [Improving LM-Based Components](#improving-lm-based-components)
- [Honing Model-Selection Intuition](#honing-model-selection-intuition)
- [Optimizing for Cost and Latency](#optimizing-for-cost-and-latency)

---

## Improving Non-LM Components

An agentic workflow typically contains a mixture of component types, and the strategies for improving them differ substantially depending on whether a component is LM-based or not. Non-LM components include web search engines, text retrieval systems used in retrieval-augmented generation (RAG), code execution environments, and standalone machine learning models trained for specific tasks such as speech recognition or object detection.

These non-LM components usually expose a set of tunable parameters or hyperparameters. A web search component might let you control the number of results returned or the date range considered. A RAG retrieval component offers levers such as the similarity threshold — which determines how close a chunk of text must be to the query before it is surfaced — and the chunk size, which governs how finely source documents are divided before embedding. A person-detection model might expose a detection threshold that trades off false positives against false negatives.

Beyond parameter tuning, you can also replace the component outright. Swapping in a different RAG provider, a different search engine backend, or a different pre-trained model is a straightforward experiment that can yield meaningful performance gains. Because non-LM components are so diverse in function, the improvement techniques are correspondingly varied and must be matched carefully to what each component actually does.

---

## Improving LM-Based Components

When a component that uses a large language model is the source of degraded performance, several intervention strategies are available, roughly ordered by increasing complexity and cost.

**Prompt improvement** is typically the first lever to reach for. This means adding more explicit instructions that clarify what the model should do and, just as importantly, what it should not do. Few-shot prompting — supplying one or more concrete input-output examples directly in the prompt — is a well-established technique that gives the model a pattern to follow and often yields a measurable improvement without any change to the underlying model.

**Swapping the model** is a second option that is often underestimated in its simplicity. Tools such as AI Suite make it straightforward to route the same prompt to a different LM, so you can compare outputs across multiple providers and use your evaluations to select the one that performs best on your specific task.

**Task decomposition** is appropriate when a single LM step is trying to do too much. If a prompt bundles many complex instructions into one call, the model may fail to follow all of them reliably. Breaking the work into a sequence of smaller steps — or separating a generation step from a subsequent reflection or verification step — distributes the cognitive load across multiple calls and can raise overall accuracy substantially.

**Fine-tuning** is a powerful but expensive option reserved for situations where all other approaches have been exhausted. Fine-tuning requires labeled data, significant engineering effort, and ongoing maintenance. The payoff can be large: when you are already at 90–95% performance through prompting alone and need to close the remaining gap, fine-tuning a custom model on task-specific data is often the only path to the final few percentage points. Because of this cost profile, fine-tuning is most appropriate for mature applications that have already demonstrated production value.

To illustrate the difference between models, consider a task where an LM must identify and redact personally identifiable information (PII) from customer call summaries. A smaller open-weight model might partially complete the task but fail to follow all the output-format instructions — listing PII separately, then attempting a redaction, then returning an unexpected second list, while also missing some items such as the customer's name. A larger, more capable frontier model given the same prompt is far more likely to correctly identify all PII categories and return a cleanly formatted, fully redacted text. The difference reflects the well-documented pattern that frontier models are significantly stronger at precise instruction-following, while smaller models often handle simple factual questions adequately but struggle with multi-step or format-sensitive instructions.

---

## Honing Model-Selection Intuition

Choosing the right LM for a component is partly an empirical question answered by evals, but experienced practitioners also develop strong prior intuitions that make them more efficient. Building those intuitions requires deliberate practice.

One approach is to actively experiment with new model releases as they appear, probing both closed-weight proprietary models and open-weight alternatives with a consistent set of test queries. Maintaining a personal evaluation suite — a small battery of prompts that cover different task types — lets you calibrate each new model against your internal benchmark and accumulate a comparative sense of where different models excel.

Reading other practitioners' prompts is equally valuable. Published prompts in blog posts, research papers, and open-source packages reveal the conventions and phrasing patterns that experienced engineers use to elicit reliable behavior from specific models. Downloading and reading through a respected open-source project's prompt templates can be one of the highest-return learning activities available, because it exposes you to real-world production prompts rather than toy examples.

Integrating multiple models into your own agentic workflows and examining traces or component-wise evals gives you direct evidence of which models handle which task types well. Over time this builds intuition not only about quality but also about the price-speed tradeoffs that matter when deploying at scale. Using a library like AI Suite, which makes model substitution a one-line change, lowers the friction of these experiments enough that routine exploration becomes sustainable.

---

## Optimizing for Cost and Latency

Once output quality is satisfactory, a production deployment typically surfaces two additional concerns: how fast the workflow runs and how much it costs per run. During early development, quality is almost always the primary objective, and it makes sense to use the best available models even if they are expensive or slow. As the system matures and enters production, the balance shifts and it becomes worthwhile to profile where time and money are being spent.

The techniques for cost and latency optimization are distinct from quality optimization and will be covered in the following lesson.

---

## Post-test

1. You are building an agentic workflow that uses a RAG retrieval step. Evaluations show that the retrieval component is returning too many irrelevant chunks. Without replacing the underlying search engine, what specific parameter would you adjust, and in which direction?

2. A single LM call in your pipeline must validate format compliance, extract key entities, and generate a summary — and it is producing inconsistent results. Which improvement strategy from this lesson directly addresses this problem, and what does it involve?

3. Andrew Ng describes a pattern where larger frontier models outperform smaller ones on PII redaction. What general capability difference explains this, and why does it matter when selecting an LM for instruction-following tasks?

<details><summary>Answer Guide</summary>

**Post-test Q1:** You would increase the similarity threshold of the RAG retrieval component. A higher threshold means the system only returns chunks that are more closely matched to the query, reducing irrelevant results at the cost of potentially missing some relevant ones. Chunk size is a secondary lever — smaller chunks can also improve precision.

**Post-test Q2:** Task decomposition. Instead of combining all three tasks — format validation, entity extraction, and summarization — into one prompt, you split the work into two or three sequential LM calls, each focused on a single well-defined subtask. This distributes the instruction load and gives each step a higher chance of being executed correctly.

**Post-test Q3:** Larger frontier models are substantially better at instruction-following — adhering to output format specifications, honoring constraints, and executing multi-step instructions without omission or deviation. Smaller models tend to handle simple factual recall adequately but struggle when a prompt requires precise adherence to a complex set of behavioral rules. For instruction-sensitive tasks like PII redaction, where missing even one data element is a failure, this capability gap makes model size and family a critical selection criterion.

</details>
