---
tags: [rag, observability, logging, monitoring, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/pp6bgx/logging-monitoring-and-observability
---

## Pre-test

1. What is a "trace" in the context of an LLM observability platform, and what information does it capture as a prompt moves through a RAG pipeline?
2. Why are LLM-specific observability platforms like Phoenix preferable to general-purpose tools like Datadog for tracking RAG evaluation metrics?
3. How does logging production traffic enable a continuous improvement flywheel for a deployed RAG system?

---

# Lecture 059: Logging, Monitoring, and Observability

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/pp6bgx/logging-monitoring-and-observability

## Outline

1. [From Metrics to Infrastructure](#from-metrics-to-infrastructure)
2. [LLM Observability Platforms](#llm-observability-platforms)
3. [Traces: Following a Prompt Through the Pipeline](#traces-following-a-prompt-through-the-pipeline)
4. [Evaluation Integration and Experimentation](#evaluation-integration-and-experimentation)
5. [Aggregate Metrics and Classical Monitoring Tools](#aggregate-metrics-and-classical-monitoring-tools)
6. [The Improvement Flywheel and Custom Datasets](#the-improvement-flywheel-and-custom-datasets)

---

## From Metrics to Infrastructure

Knowing which metrics matter is only the first half of the observability problem. The second half — and the focus of this lesson — is building the infrastructure that actually captures, stores, and surfaces that data. This distinction is important: evaluating a RAG system in isolation during development is a finite, controlled exercise, whereas observing a live system requires continuous, low-overhead instrumentation that runs alongside production traffic without degrading response times.

The challenge is that a modern RAG pipeline has many moving parts. A single user query may touch a query rewriter, an embedding model, a vector store, a re-ranker, and a language model before a response is generated. Each of those components can fail or degrade independently, and failures do not always manifest as explicit errors — they may appear as subtle drops in answer quality, increased hallucination rates, or rising latency that is hard to attribute to a specific stage. Production observability must therefore operate at multiple granularities simultaneously: coarse aggregate statistics reveal trends, while fine-grained per-request records are needed for root-cause analysis.

The problems that make production RAG challenging — scale, input unpredictability, data quality — were catalogued in [[057-what-makes-production-challenging]]. The evaluation strategies introduced in [[058-implementing-rag-evaluation-strategies]] define what to measure. This lesson closes the loop by explaining how to instrument a live system to collect those measurements continuously.

---

## LLM Observability Platforms

Because the evaluation and monitoring needs of LLM applications are distinct from those of conventional web services, a dedicated category of tooling has emerged: LLM observability platforms. These platforms are pre-built to handle the most common instrumentation tasks out of the box, including:

- **Capturing component-level and system-level metrics** — latency per pipeline stage, token counts, retrieval recall scores, and generation quality scores.
- **Logging system traffic** — storing a record of every query, the retrieved context, and the generated response so that individual interactions can be reviewed after the fact.
- **Supporting experimentation** — providing interfaces to run the same set of prompts through multiple pipeline configurations and compare results side by side.

Using a platform purpose-built for LLM observability means significantly less time designing custom logging schemas, building dashboards from scratch, or integrating disparate metrics sources. Development effort can be redirected toward analyzing the data and improving the system rather than maintaining the observability layer itself.

One prominent open-source example is **Phoenix**, built by the company Arize. Phoenix is designed specifically for evaluating and monitoring ML and LLM applications and integrates cleanly with popular RAG libraries and evaluation frameworks. The remainder of this lesson uses Phoenix as a concrete reference point, but the concepts generalize to other platforms in this category.

---

## Traces: Following a Prompt Through the Pipeline

The most fundamental observability primitive in LLM platforms is the **trace**. A trace records the complete journey of a single request through the RAG system, capturing the state of the data at each processing step. For a typical RAG pipeline a trace might record:

1. The raw text of the user's query as it arrived.
2. The rewritten or reformulated query sent to the retrieval component.
3. The ranked list of document chunks returned by the retriever, including their similarity scores.
4. The subset of chunks forwarded to the re-ranker and the re-ranked ordering.
5. The fully assembled prompt — system instructions, retrieved context, and user query — sent to the language model.
6. The final generated response.
7. **Latency at each step**, so that performance bottlenecks can be localized precisely.

This level of detail makes traces a powerful debugging tool. When a user reports a bad answer, or when an automated evaluation flags a response as a hallucination, the trace for that request pinpoints exactly where the pipeline went wrong. Did the retriever return irrelevant chunks? Did the re-ranker surface a misleading passage? Did the language model ignore the retrieved context entirely? Each hypothesis can be checked directly against the recorded trace without needing to reproduce the failure from scratch.

Tracing is valuable at every stage of the development lifecycle — not just in production. During early prototyping, traces provide intuition about how the pipeline processes different query types. During staged rollouts, traces let engineers verify that new components are behaving as expected before traffic is fully shifted. In production, traces form the audit log that makes the system accountable and debuggable at the per-request level.

---

## Evaluation Integration and Experimentation

Capturing traces is necessary but not sufficient. To know whether a trace represents a good or bad outcome, the observability platform must also run evaluations against the recorded data. Phoenix integrates directly with evaluation libraries — including the RAGAS library covered in [[058-implementing-rag-evaluation-strategies]] — making it straightforward to attach automated quality scores to every trace.

Common evaluations that can be run inline include:

- **Search relevancy** — does the retrieved context actually address the user's query?
- **Answer faithfulness** — does the generated response stay grounded in the retrieved sources, or does it introduce unsupported claims?
- **Citation accuracy** — when the model attributes a claim to a source, is that attribution correct?

With evaluation scores attached to traces, the platform can flag individual requests that fall below quality thresholds, surface patterns across many requests (e.g., retrieval relevancy is consistently low for queries about a particular topic), and generate aggregate dashboards that track quality trends over time.

The combination of traces and evaluations also enables **systematic experimentation**. Rather than guessing whether a change to the system prompt or retrieval configuration will improve quality, engineers can:

- **Run custom prompts manually** through the instrumented pipeline and inspect the trace in real time.
- **A/B test system changes** by routing a fraction of traffic through an alternative pipeline configuration and comparing evaluation scores across the two branches.

This experimental capability transforms observability from a passive monitoring activity into an active lever for improvement. Concrete questions — does adding a re-ranker improve answer faithfulness? does switching to a longer context window reduce hallucination? — can be answered with statistical evidence drawn from real traffic rather than synthetic benchmarks.

---

## Aggregate Metrics and Classical Monitoring Tools

While traces provide per-request detail, operators also need high-level aggregate views to track system health at a glance. Phoenix and similar LLM platforms support **daily or periodic reports** that summarize key metrics across all traffic processed in a given window:

- Retrieval accuracy rate across all queries.
- Fraction of responses flagged as hallucinations.
- Average and p95 end-to-end latency.
- Token consumption and associated cost.
- Error rates and timeout frequencies.

These aggregate metrics serve an early-warning function. A sudden drop in retrieval accuracy might indicate that a knowledge base update introduced documents with poor formatting. A rising hallucination rate might signal that the language model is being asked to answer questions that are not covered in the knowledge base. Trend lines over days or weeks reveal gradual drift that would be invisible in any single request's trace.

That said, LLM observability platforms do not cover every monitoring dimension. Infrastructure-level metrics — CPU and memory utilization of the vector database, GPU occupancy on the inference servers, disk I/O for document ingestion pipelines — fall outside the scope of LLM-focused tools. For these concerns, classical monitoring platforms such as **Datadog** or **Grafana** remain the right choice. A mature observability stack for a production RAG system typically combines both layers: an LLM-specific platform for quality and evaluation metrics, and a classical monitoring platform for infrastructure health. The two layers complement each other; together they provide complete coverage of the failure modes that matter in production.

---

## The Improvement Flywheel and Custom Datasets

The ultimate goal of observability is not merely visibility — it is continuous improvement. A well-instrumented RAG system creates a positive feedback loop, sometimes called an **improvement flywheel**:

1. Production traffic flows through the instrumented pipeline, generating traces and evaluation scores.
2. Low-quality traces are identified — either by automated thresholds or by manual review.
3. Engineers analyze the failing traces to diagnose the root cause: a retrieval gap, a re-ranker misconfiguration, a system prompt that generates verbose but unfaithful answers.
4. A targeted change is made to address the identified issue.
5. The change is evaluated — ideally via A/B testing on live traffic — and its impact is measured through the same traces and evaluation scores.
6. Improved performance feeds back into the system, raising the baseline quality that subsequent iterations are measured against.

A critical enabler of this flywheel is the ability to build **custom datasets** from logged production traffic. By saving a curated collection of real queries — including both typical cases and edge cases — engineers can re-run those exact prompts through a modified pipeline and observe how the change affected each case. This is far more informative than evaluating on a synthetic benchmark because the dataset reflects the actual distribution of user behavior, including the long tail of unusual queries that synthetic data rarely captures.

Custom datasets accumulated over time become a strategic asset. They encode institutional knowledge about the specific ways real users interact with the system, and they make regression testing meaningful: before shipping any change, engineers can verify that the system still handles previously problematic queries correctly. This practice closes the loop between production observation and development iteration, turning the observability infrastructure from a cost center into a direct contributor to product quality.

---

## Post-test

1. A user reports that your RAG system gave an incorrect answer to a specific query. Describe the step-by-step process you would use, with trace data, to identify which component in the pipeline was responsible for the error.
2. Explain why a production RAG system would need both an LLM observability platform (like Phoenix) and a classical monitoring tool (like Datadog or Grafana). What gap does each one fill?
3. What is the improvement flywheel, and what role do custom datasets built from production traffic play in sustaining it?

> [!example]- Answer Guide
> 
> #### Q1 — Tracing a Failure to Its Source
> 
> Retrieve the trace for the failing query. Check the retrieved chunks: were they relevant to the query? If not, the retriever is the source — inspect the query sent to the retriever (was it rewritten poorly?) and the similarity scores returned. If the chunks were relevant, check the re-ranker output: did re-ranking surface a misleading passage? If retrieval looks correct, examine the assembled prompt sent to the LLM and the final response: did the model ignore the context, hallucinate, or misattribute a claim? Latency measurements at each stage can also point to a bottleneck. The trace makes each hypothesis directly testable without reproducing the failure from scratch.
> 
> #### Q2 — Complementary Monitoring Layers
> 
> LLM observability platforms handle quality and evaluation metrics: retrieval relevancy, hallucination rate, citation accuracy, A/B experiment results — metrics that require understanding RAG pipeline semantics. Classical tools like Datadog/Grafana handle infrastructure metrics: vector database memory and CPU usage, GPU occupancy on inference servers, disk I/O, and network throughput. The LLM platform cannot monitor infrastructure health; the classical platform cannot score answer faithfulness. A production system needs both layers for complete coverage.
> 
> #### Q3 — Improvement Flywheel and Custom Datasets
> 
> The improvement flywheel is the iterative cycle where production traces reveal failures, engineers diagnose and fix root causes, the fix is validated through A/B testing on live traffic, and improved quality raises the baseline for the next iteration. Custom datasets built from logged production queries make regression testing meaningful: they represent the real distribution of user behavior — including rare edge cases — rather than a synthetic benchmark. Re-running a curated set of real queries through a modified pipeline lets engineers verify that a change improved failing cases without degrading previously passing ones.
