---
tags: [rag, prompt-engineering, chain-of-thought, few-shot, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/jjf7di/prompt-engineering-advanced-techniques
---

## Pre-test

1. **In the context of in-context learning, what is the meaningful difference between injecting hard-coded examples into a prompt versus retrieving examples dynamically from a vector database, and when does each approach make more sense?**

2. **Chain-of-thought prompting provides a "scratch pad" for the model to reason before producing a final answer. What systemic debugging benefit does this visible reasoning provide, and how does it relate to the concept of reasoning tokens in purpose-built reasoning models?**

3. **Multi-turn conversations can rapidly exhaust a context window. Describe two distinct strategies that fall under "context pruning," and explain why RAG-retrieved chunks warrant special treatment in multi-turn settings.**

---

# Lecture 047: Prompt Engineering — Advanced Techniques

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/jjf7di/prompt-engineering-advanced-techniques | DeepLearning.AI | Retrieval-Augmented Generation Course

## Outline

1. [From Basic Templates to Advanced Techniques](#1-from-basic-templates-to-advanced-techniques)
2. [In-Context Learning: Few-Shot and One-Shot](#2-in-context-learning-few-shot-and-one-shot)
3. [Chain-of-Thought and Step-by-Step Reasoning](#3-chain-of-thought-and-step-by-step-reasoning)
4. [Reasoning Models and Their Distinct Prompting Requirements](#4-reasoning-models-and-their-distinct-prompting-requirements)
5. [Context Window Management](#5-context-window-management)
6. [When to Apply Advanced Techniques](#6-when-to-apply-advanced-techniques)

---

## 1. From Basic Templates to Advanced Techniques

A well-structured prompt template is the foundation of any RAG system, but a minimal template — a system prompt, placeholder slots for retrieved chunks, and a user query — is often only the starting point. Once the basic machinery is working, practitioners commonly reach for a family of more sophisticated techniques designed to steer the model toward higher-quality outputs. Understanding these techniques requires recognising that they all operate on the same underlying principle: rather than leaving the model to make its own implicit decisions about tone, structure, or reasoning strategy, explicit prompt engineering encodes those expectations directly into the prompt itself.

The techniques covered in this lesson fall into two broad categories. The first category uses examples to teach the model a desired output style or format; the second category instructs the model to reason explicitly before committing to an answer. Both categories add tokens to the prompt and therefore have direct cost and latency implications, which is why the lesson treats context window management as an inseparable companion topic rather than an afterthought. Connecting this to the broader pipeline, the retrieved chunks discussed in [[041-module-4-introduction]] form only one component of the prompt; advanced techniques add further structural layers on top of those chunks.

---

## 2. In-Context Learning: Few-Shot and One-Shot

In-context learning refers to the practice of embedding illustrative examples of desired input–output pairs directly inside the prompt. The underlying intuition is that language models, which were trained on vast corpora of human-produced text, are highly sensitive to the implicit "genre" of a document. By surrounding the actual query with high-quality examples of what a good answer looks like, the engineer signals to the model precisely what register, format, and level of detail it should adopt. This is analogous to the way RAG itself grounds the model on domain-specific facts by injecting retrieved text — except that instead of grounding factual content, in-context examples ground stylistic and structural behaviour.

When a prompt includes multiple such examples, the technique is called few-shot learning. When it includes exactly one example, it is called one-shot learning. Zero-shot learning, by contrast, provides no examples at all, relying entirely on instructions written in natural language. The choice between these variants involves a trade-off: more examples generally produce more consistent behaviour, but they also consume more of the available context window and increase the per-call cost.

There are two practical implementations. The simpler approach is to hard-code a fixed set of examples into the prompt template. This is appropriate when the desired output style is stable across all queries — for instance, a customer-service bot that should always respond with a greeting, a short resolution, and a closing offer of further help. The second approach combines in-context learning with RAG by indexing high-quality past conversations into the vector database alongside domain documents. When a new query arrives, the retrieval step fetches not only relevant factual passages but also semantically similar past exchanges, which are then injected as dynamic few-shot examples. This approach allows the examples to adapt to the topic of each new query, so a question about returns might surface different exemplar conversations than a question about shipping times. The dynamic version is more powerful but also more complex to manage, because the quality of the examples in the index directly affects the quality of the downstream responses.

---

## 3. Chain-of-Thought and Step-by-Step Reasoning

A second family of advanced techniques encourages the model to make its reasoning visible before producing a final answer. The simplest version is a direct instruction in the system prompt: "think step by step before answering" or "think aloud before giving your final response." The effect is to give the language model a kind of scratch pad — a region of the output where it can plan, consider alternatives, and identify potential errors before committing to a conclusion. Because language models generate each token conditioned on all previous tokens, a model that first writes out coherent reasoning is conditioning its final answer on a richer set of intermediate conclusions, which tends to reduce factual errors and logical inconsistencies.

A more structured instantiation of this idea is chain-of-thought prompting. Here the prompt explicitly defines a thinking region, sometimes delimited by special tags such as `<scratchpad>` markers, within which the model is permitted — and expected — to reason freely without that content being treated as part of the final answer delivered to the user. The model first generates the steps needed to approach a problem, executes those steps in its reasoning trace, and then produces a synthesised final answer. For tasks that require multiple inferential steps — comparing retrieved documents, resolving apparent contradictions in sources, or computing answers based on numeric information in retrieved text — chain-of-thought prompting can substantially increase accuracy.

One important engineering benefit is debuggability. When a RAG system produces a wrong answer, diagnosing the root cause without visible reasoning is difficult: was the retriever at fault, or did the model misinterpret a correct passage? When chain-of-thought is in use, the visible reasoning trace makes it possible to identify exactly where the model's logic diverged from the correct path, which in turn guides remediation. This connects directly to the evaluation practices introduced in [[009-evaluating-a-rag-pipeline]], where distinguishing retrieval errors from generation errors is a core challenge.

---

## 4. Reasoning Models and Their Distinct Prompting Requirements

The success of explicit reasoning techniques has influenced model design itself. A growing class of language models — collectively called reasoning models — is trained specifically to perform multi-step reasoning internally before producing a response. Under the hood, these models generate a stream of reasoning tokens that serve a function analogous to the chain-of-thought scratch pad, considering alternative paths, planning ahead, and checking intermediate conclusions. They then emit response tokens containing only the final answer intended for the end user. Some providers expose the reasoning tokens in the API response; others return only the response tokens.

Reasoning models excel at tasks with demanding logical structure: multi-step mathematics, code generation, complex planning workflows, and puzzles. In the RAG context, they are particularly valuable for assessing whether a retrieved passage is truly relevant to the user's question — a subtler task than it appears — and for synthesising answers when multiple retrieved chunks must be combined and weighted against one another. The tradeoff is cost and latency. Reasoning tokens are billed at the same rate as response tokens, and they can be voluminous, making reasoning models appreciably more expensive and slower than their non-reasoning counterparts. Whether the accuracy gain justifies the cost is an application-specific decision; a high-stakes compliance question may warrant the investment, while a simple factual lookup may not.

Crucially, the prompting conventions that work well with standard language models often work poorly with reasoning models. Explicit chain-of-thought instructions are redundant and can interfere with the model's own internal reasoning process. In-context learning examples may be counterproductive because the model tends to blend the example responses into its answer for the current question rather than treating them as pure stylistic guides. Reasoning models respond better to clear, specific goal statements and precise format specifications. High-level principles — what to include, what to avoid, what output structure to follow — are appropriate, but detailed reasoning instructions should be omitted. In practice this means that upgrading from a standard model to a reasoning model may require a meaningful revision of the prompt template, not merely a model identifier change. See the [[045-choosing-your-llm]] discussion on model selection criteria for the broader cost–capability evaluation framework within which reasoning models sit.

---

## 5. Context Window Management

Every advanced prompt engineering technique increases the number of tokens either in the prompt itself or in the generated output, or both. In-context learning examples add tokens to the prompt. Chain-of-thought scratch pads add tokens to the completion. Reasoning model traces, even when partially hidden, occupy context. In a single-turn interaction this may be manageable, but in multi-turn conversations the problem compounds quickly because the full history of previous messages must be included in each new prompt, as described in [[042-transformer-architecture]].

The family of strategies for addressing this problem is collectively called context pruning. The simplest form is a sliding window: rather than preserving the entire conversation history, the system retains only the last N turns — for example, the five most recent user messages and the corresponding model responses. This is cheap to implement and sufficient for many applications where each question is relatively self-contained. When deeper conversational continuity is required, a more sophisticated approach uses a secondary LLM call to summarise older portions of the history, reducing their token count while preserving the key points. The summarised version replaces the raw transcript in the prompt, so the model retains contextual awareness without proportionate context-window consumption.

Two additional pruning considerations apply specifically to advanced techniques. When reasoning models are used in multi-turn conversations, the reasoning tokens from previous turns should be discarded from the history; only the final response tokens are needed to maintain conversational coherence, and carrying forward reasoning traces wastes context space without providing useful signal. In RAG systems specifically, only the chunks retrieved to answer the most recent user question should be included in the prompt; chunks retrieved to answer earlier questions in the conversation are typically irrelevant to the current query and should be dropped. Following these principles keeps the effective token budget available for what actually matters: the current query, its retrieved context, and enough conversational history to maintain continuity.

For applications where context depth is genuinely required — for example, a research assistant that must hold hundreds of exchanged messages in scope — switching to a model with a longer context window is an option. However, a longer context window does not eliminate the cost and latency implications of long prompts. Even on models with 100,000-token or million-token context windows, including unnecessary content is wasteful and slows inference, so thoughtful context management remains important regardless of window size.

---

## 6. When to Apply Advanced Techniques

Advanced prompt engineering techniques are valuable tools, but they are not universally necessary and they are never free. The lesson's guiding advice is to add them only when there is clear evidence that the simpler approach is insufficient. A well-crafted system prompt together with a clean basic template will satisfy many RAG applications completely, and a complex prompt that includes chain-of-thought instructions and dynamic few-shot examples may consume twice the token budget to produce answers only marginally better than the simple version.

The practical workflow this implies is iterative. Begin with the simplest prompt structure that could plausibly work. Evaluate its output against representative queries — both successfully answered ones and failure cases. If the failures share a diagnostic pattern — inconsistent tone, incorrect reasoning steps, poor format compliance — select the technique most likely to address that pattern and add it in isolation. Measure again. If the technique provides measurable improvement, keep it; if it does not, remove it. This experimental attitude is especially important because prompt engineering has the character of an art as much as a science: the same technique may produce very different results across different models, different retrieval configurations, and different domains.

The lesson closes with a reminder that the field changes rapidly. New models and new prompting conventions are released frequently, and providers typically publish guidance on how their specific models respond to different prompting approaches. Treating that provider documentation as a first-class engineering input — rather than relying on general intuitions that may not transfer across model families — is a habit worth developing as RAG systems mature from prototypes into production deployments. The skills explored across Module 4, from understanding the [[042-transformer-architecture]] and [[043-llm-sampling-strategies]] that shape model behaviour, through [[045-choosing-your-llm]] model selection, to these advanced prompting strategies, together form a coherent toolkit for the generation half of the RAG pipeline.

---

## Post-test

1. **You are building a legal document Q&A system. Users complain that the system sometimes gives answers that are logically inconsistent across multiple retrieved clauses. Which advanced prompting technique would most directly address this problem, and what is the mechanism by which it helps?**

2. **Your team proposes switching the RAG system from a standard instruction-tuned model to a reasoning model. A colleague argues you can reuse the existing prompt template unchanged. Is this correct? Explain the specific ways in which prompting conventions for reasoning models differ from those for standard models.**

3. **A multi-turn RAG chatbot is hitting context-window limits after roughly 15 conversation turns. Describe a two-stage context pruning strategy that preserves both conversational continuity and accurate factual grounding for the current question, specifying what should be kept, summarised, and discarded.**

> [!example]- Answer Guide
> 
> #### Q1 — Chain-of-Thought for Multi-Clause Legal Reasoning
> 
> Chain-of-thought prompting is the most direct solution. By instructing the model to work through the logical relationships between retrieved clauses step by step before issuing a final answer, the technique forces the model to surface and resolve apparent contradictions during the reasoning trace rather than eliding them in a single-pass response. The mechanism is that the model's final answer is conditioned on its intermediate conclusions, so a coherent reasoning trace produces a more internally consistent answer. The visible trace also allows engineers to identify exactly which clause comparison caused incorrect reasoning, enabling targeted debugging rather than guesswork.
> 
> #### Q2 — Prompt Template Reuse with Reasoning Models
> 
> The colleague is incorrect. Reasoning models differ in two significant ways. First, chain-of-thought instructions are redundant and potentially disruptive because the model already performs internal step-by-step reasoning by design; adding explicit "think step by step" instructions may conflict with the model's built-in reasoning process. Second, in-context learning examples work differently with reasoning models, which tend to blend example responses into the current answer rather than treating them as style guides, potentially degrading output quality. The prompt should instead be revised to provide specific goal statements, precise format specifications, and high-level guiding principles — omitting both chain-of-thought instructions and example-heavy in-context learning patterns. The prompt template thus requires meaningful revision, not just a model identifier change.
> 
> #### Q3 — Two-Stage Pruning for Multi-Turn RAG
> 
> Stage one addresses conversational history: retain the last five to ten turns as verbatim text for close continuity, and use a secondary LLM call to summarise all older turns into a compact paragraph that preserves key facts and decisions without the full transcript. This keeps the history footprint bounded as the conversation grows. Stage two addresses retrieved context: include only the chunks retrieved for the most recent user question, discarding chunks retrieved for all previous questions, which are typically irrelevant to the current query. If a reasoning model is in use, reasoning tokens from all previous turns should also be dropped from the history, retaining only the final response tokens. The net effect is a prompt of roughly constant size regardless of conversation length, with sufficient context for both factual accuracy and conversational coherence.
