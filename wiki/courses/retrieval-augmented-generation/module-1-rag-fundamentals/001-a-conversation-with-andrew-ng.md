---
tags: [rag, retrieval-augmented-generation, deeplearning-ai, andrew-ng, course-intro]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/rrngb/a-conversation-with-andrew-ng
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What fundamental limitation of large language models does Retrieval-Augmented Generation address, and why can't fine-tuning alone solve that problem?
2. Why would a larger LLM context window reduce the pressure on chunk-size hyperparameters in a RAG system?
3. In what specific way does agentic RAG differ from traditional RAG, and why does that difference matter for real-world reliability?

---

# Lecture 001: A Conversation with Andrew Ng

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/rrngb/a-conversation-with-andrew-ng) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [Why RAG Exists: The Core Problem](#why-rag-exists-the-core-problem)
- [What RAG Is and How It Works](#what-rag-is-and-how-it-works)
- [RAG in Industry: Scope and Verticals](#rag-in-industry-scope-and-verticals)
- [How LLM Advances Are Reshaping RAG Design](#how-llm-advances-are-reshaping-rag-design)
- [Agentic RAG: The Key Frontier](#agentic-rag-the-key-frontier)

---

## Why RAG Exists: The Core Problem

Large language models are trained on vast quantities of publicly available internet data — Common Crawl, Wikipedia, GitHub, and similar sources. This training gives them broad world knowledge and strong reasoning capabilities, but it also defines a hard boundary: anything that was not in that training corpus is invisible to the model. Private company documents, internal policy manuals, proprietary research, real-time news, and personal data all fall outside what the model learned during pre-training, and no amount of prompting can conjure facts the model was never shown.

Fine-tuning is sometimes proposed as a solution, but it is the wrong tool for this problem. Fine-tuning changes a model's behavior and style — it can teach the model to respond in a particular format, adopt a persona, or follow a domain-specific instruction pattern — but it does not reliably inject new factual knowledge that can be recalled on demand. Knowledge baked into weights during fine-tuning tends to be imprecise, difficult to update, and prone to the same hallucination failures as the base model. When the underlying facts change (a policy is updated, a product is revised, new research appears), a fine-tuned model has no mechanism to track those changes without retraining.

RAG solves this by placing the relevant information directly in the model's context window at inference time, rather than trying to encode it permanently into weights. The model receives both the user's question and the retrieved document chunks simultaneously, so it can reason over current, correct, authoritative text rather than reconstructing facts from compressed weight patterns. This architecture separates knowledge storage (the document database) from knowledge retrieval (the search system) from knowledge reasoning (the LLM), giving each component a job it is well-suited to perform.

---

## What RAG Is and How It Works

At its simplest, Retrieval-Augmented Generation is the pairing of a classical search system with a large language model. When a user asks a question, a retriever component searches a knowledge base — which might be a vector database, a full-text index, or a hybrid of both — and returns the most relevant document chunks. Those chunks are then prepended to the user's question as context, and the assembled prompt is passed to the LLM, which synthesizes the retrieved evidence into a coherent answer.

The two central components — the retriever and the LLM — each introduce their own design decisions. The retriever requires choices about how documents are chunked (how long each segment is), how those chunks are encoded (as dense vector embeddings, sparse BM25 representations, or a combination), and how many chunks to retrieve for each query. The LLM requires choices about prompt structure, how much retrieved context to include before hitting the context window limit, and how to instruct the model to prioritize retrieved evidence over its own parametric knowledge.

This course covers both components in depth: foundational retrieval concepts, production-grade RAG architectures, prompt engineering for grounded generation, evaluation methods for measuring answer quality, and monitoring strategies for catching degradation in deployed systems. The later modules extend the baseline to multimodal RAG (images and documents), reasoning models, and agentic workflows.

---

## RAG in Industry: Scope and Verticals

RAG is currently the most widely deployed class of LLM application in industry. Its dominance stems from a practical reality: most enterprise value is locked in private documents, and most enterprise questions require answers grounded in those documents rather than in general world knowledge. A customer service agent that can only draw on what GPT-4 learned from the internet is far less useful than one that can retrieve the exact product documentation, return policy, or service record relevant to the current customer's situation.

The enterprise use cases span nearly every domain. Customer-facing Q&A systems answer product questions by retrieving from technical documentation and FAQs. Internal knowledge bases allow employees to query HR policies, legal guidelines, and engineering runbooks without requiring a human intermediary. In healthcare, RAG systems enable clinicians or patients to ask questions against medical literature, clinical guidelines, or individual patient records. In education, RAG-powered tutoring systems retrieve curriculum-relevant material and construct explanations tailored to the student's current question. Financial services firms use RAG to search regulatory filings, earnings call transcripts, and internal research reports.

What unifies these cases is not the industry but the structure: there is a corpus of authoritative documents, there are users with questions about that corpus, and accuracy and grounding matter more than creative generation. This is precisely the problem RAG is engineered to solve.

---

## How LLM Advances Are Reshaping RAG Design

RAG is not a static architecture — it co-evolves with the underlying models and infrastructure. Several trends in LLM development are actively changing how RAG systems are designed and tuned.

The first trend is declining hallucination rates. As models improve at instruction following and factual grounding, the frequency with which they fabricate information when given retrieved context has decreased. This does not eliminate the need for retrieval — the model still cannot know facts it was never shown — but it does mean that a well-constructed RAG prompt is less likely to produce a confident wrong answer. Engineers can spend less of their error budget on hallucination mitigation and more on retrieval quality.

The second trend is expanding context windows. Early LLMs could process only a few hundred tokens at once, which forced RAG designers to be extremely conservative about chunk size: larger chunks meant fewer of them would fit, forcing difficult tradeoffs between breadth and depth of retrieved context. Modern models with context windows of 100,000 tokens or more relax this constraint substantially. A system that previously had to retrieve the three most relevant 200-token chunks can now retrieve dozens, covering far more of the document space and reducing the risk that the answer fell in a chunk that was not retrieved.

The third trend is agentic document extraction. Multimodal models and specialized extraction tools can now parse PDFs, slide decks, spreadsheets, and scanned documents with much higher fidelity than earlier approaches. This lowers the cost of building the knowledge base that RAG retrieves from, which was historically one of the most labor-intensive parts of deploying a RAG system.

---

## Agentic RAG: The Key Frontier

Traditional RAG systems are pipelines with fixed logic: a human engineer decides the chunk size, the number of chunks to retrieve, the retrieval method (dense, sparse, or hybrid), and the order in which results are ranked. These decisions are made once, baked into code, and applied identically to every query. This works reasonably well when queries are predictable and the knowledge base is well-structured, but it fails in two common real-world scenarios: when a single retrieval step does not find enough relevant information, and when the right retrieval strategy depends on the nature of the specific query.

Agentic RAG addresses both failure modes by allowing an LLM agent to decide what to retrieve, when to retrieve it, and how to route between multiple retrieval sources. Rather than a hard-coded pipeline, the system gives the agent a set of retrieval tools — web search, a specialized document database, a relational database, a code index — and lets it select which tools to invoke based on the query. If the first retrieval attempt does not yield sufficient evidence, the agent can recognize this and issue a follow-up retrieval with a refined query, or route to a different source entirely.

This self-correction capability is what makes agentic RAG substantially more resilient than traditional RAG. A traditional pipeline either returns insufficient context silently (producing a vague or hallucinated answer) or fails noisily. An agentic system can detect that the retrieved evidence is weak, formulate a better query, and retry — all within a single user interaction. The cost is additional latency and complexity; the benefit is a system that handles real-world messiness far more gracefully.

Zain Hassan, this course's primary instructor, brings direct expertise from his time at Weaviate, one of the leading vector database companies, where production RAG systems at scale are his professional domain. The course is designed to bring learners from the foundational mechanics of retrieval to the frontier of agentic systems, with hands-on implementation throughout.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain why fine-tuning is not the right solution to the problem that RAG solves, even though both involve modifying how an LLM behaves.
2. How does an expanding LLM context window change the design tradeoffs for a RAG system's chunk size and retrieval count?
3. Describe what an agentic RAG system can do when an initial retrieval attempt returns insufficient evidence — and why a traditional RAG pipeline cannot do the same thing.

<details>
<summary>Answer Guide</summary>

1. Fine-tuning adjusts a model's behavior and style by training on example (instruction, response) pairs — it teaches the model *how to respond*, not *what facts to know*. Facts baked into weights during fine-tuning are imprecise, hard to update, and prone to hallucination. RAG bypasses this entirely by placing current, authoritative document text directly in the context window at inference time, so the model reasons over real text rather than reconstructed memory.
2. Small context windows forced engineers to use short, tightly scoped chunks and retrieve only a handful of them, creating a hard tradeoff between breadth and depth of coverage. With windows of 100k tokens or more, a system can retrieve many more and longer chunks, substantially reducing the risk that the relevant passage was not among those retrieved. Chunk-size hyperparameter tuning becomes less critical because the window is large enough to absorb more generous chunk overlap and count.
3. An agentic RAG system gives an LLM agent access to multiple retrieval tools and lets it evaluate whether the retrieved evidence is sufficient. If the first retrieval is weak, the agent can issue a refined query, route to a different source (e.g., web search instead of the internal database), or retry with different parameters — all autonomously. A traditional RAG pipeline executes fixed retrieval logic identically for every query, with no mechanism to detect or recover from a retrieval failure.

</details>
