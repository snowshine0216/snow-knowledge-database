---
tags: [rag, fine-tuning, model-selection, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/00uskr/rag-vs-fine-tuning
---

## Pre-test

1. What is the primary mechanism by which fine-tuning improves a language model's behavior?
   - A) Injecting new documents into the model's context window at inference time
   - B) Retraining the model on a labeled domain-specific dataset to update its internal parameters
   - C) Adding a retrieval layer in front of the model to supply relevant passages
   - D) Replacing the model's tokenizer with a domain-specific vocabulary

2. According to the current consensus in the field, which statement best distinguishes RAG from fine-tuning?
   - A) RAG is better at domain adaptation; fine-tuning is better at knowledge injection
   - B) Fine-tuning is better at knowledge injection; RAG is better at domain adaptation
   - C) RAG is better at knowledge injection; fine-tuning is better at domain adaptation
   - D) Both techniques serve identical purposes and are interchangeable

3. In an agentic RAG system, a small model is assigned the single task of deciding whether a user query needs retrieval. Which technique is most appropriate for that model?
   - A) Prompt engineering alone, because fine-tuning is too expensive
   - B) Heavy fine-tuning, because the model performs only one discrete task
   - C) RAG, because the model needs access to external knowledge
   - D) Neither; a general-purpose model should handle all routing decisions

---

# Lecture 052: RAG vs Fine-Tuning

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/00uskr/rag-vs-fine-tuning

## Outline

1. [What Is Fine-Tuning?](#what-is-fine-tuning)
2. [How Supervised Fine-Tuning Works](#how-supervised-fine-tuning-works)
3. [What Fine-Tuning Changes — and What It Does Not](#what-fine-tuning-changes-and-what-it-does-not)
4. [RAG vs Fine-Tuning: Choosing the Right Tool](#rag-vs-fine-tuning-choosing-the-right-tool)
5. [Using RAG and Fine-Tuning Together](#using-rag-and-fine-tuning-together)
6. [Practical Guidance for RAG Builders](#practical-guidance-for-rag-builders)

---

## What Is Fine-Tuning?

When you first build a [[003-introduction-to-rag]] pipeline, you typically wire together an off-the-shelf large language model with a retrieval layer. That design handles many use cases well, but it is not the only lever available for improving model quality. Fine-tuning is a complementary technique that modifies the model itself rather than the context supplied to it.

At its core, fine-tuning means retraining an existing language model on a new dataset so that the model's internal weights are updated. Unlike prompt engineering or retrieval augmentation — both of which leave the model's parameters completely unchanged — fine-tuning reshapes how the model processes language at a fundamental level. The result is a model that has been specialized, often dramatically, for a particular domain or task.

Consider a general-purpose [[006-introduction-to-llms]] deployed in a healthcare setting. Ask it about a triad of symptoms — joint pain, skin rash, and sun sensitivity — and it may produce a generically worded answer that lacks clinical specificity. The model has never been optimized for medical language. After fine-tuning on a large corpus of medical questions and authoritative answers, the same underlying architecture can respond with greater accuracy, appropriate clinical vocabulary, and a tone suited to the domain. The model does not simply retrieve medical facts; it has internalized the style and reasoning patterns of medical discourse.

---

## How Supervised Fine-Tuning Works

The standard technique is called **supervised fine-tuning (SFT)**. The word "supervised" signals that training relies on a labeled dataset: each example pairs an input (an instruction or a question) with a ground-truth output (the ideal answer). This is distinct from self-supervised pretraining, where the model learns by predicting the next token over massive unlabeled text. In SFT the signal is explicit — each training example tells the model exactly what the correct response looks like.

**Instruction fine-tuning** is a particularly important variant. Here the dataset is formatted as instruction–response pairs. For each pair the model receives the instruction, generates a response, and the training loop measures how far that response deviates from the ground-truth answer. The deviation is converted into a gradient that nudges the model's weights in the direction of the correct answer. Repeat this process over thousands or millions of examples and the model converges on behavior that is well-aligned with the target domain.

The procedure is mechanically similar to the original pretraining of the model; the key difference is scale and data source. Pretraining uses internet-scale corpora covering virtually every topic; fine-tuning uses a curated, domain-specific dataset that is orders of magnitude smaller but far more targeted. The resulting model inherits the broad linguistic competence of pretraining while gaining specialized expertise from fine-tuning.

---

## What Fine-Tuning Changes — and What It Does Not

Understanding the limits of fine-tuning is as important as understanding its capabilities. The most common misconception is that fine-tuning is a reliable way to teach a model new factual information. In practice, fine-tuning has a much stronger effect on **how** the model responds than on **what** it knows.

Fine-tuning primarily shapes:

- **Output style and register** — the vocabulary, formality, and tone the model adopts
- **Response structure** — whether answers are bulleted, narrative, concise, or detailed
- **Task behavior** — how the model interprets instructions and what kind of reasoning it applies

Fine-tuning has a weaker and less predictable effect on the factual content stored in the model's weights. If you need the model to know about a document that did not exist during training, fine-tuning is an unreliable mechanism for injecting that knowledge. RAG remains the right tool for that problem because it supplies the information directly in the prompt at inference time.

There is also a well-documented **negative transfer** risk. Because fine-tuning optimizes the model for one domain, it can inadvertently degrade performance on other domains. The gradient updates that improve medical question answering may reduce accuracy on legal or coding tasks. This trade-off is acceptable whenever the model will exclusively operate within the fine-tuned domain, but it is a real cost to weigh before committing to fine-tuning a general-purpose model.

---

## RAG vs Fine-Tuning: Choosing the Right Tool

The field has converged on a clear heuristic for choosing between the two approaches:

| Need | Best approach |
|---|---|
| The model must access new or frequently updated information | RAG — inject it at inference time |
| The model must specialize in a particular domain or task style | Fine-tuning — update the model's weights |
| The model performs one discrete subtask in a larger pipeline | Fine-tuning — heavy specialization of a small model |
| The system must handle diverse topics | RAG — preserve the model's breadth |

**RAG excels at knowledge injection.** As discussed in [[003-introduction-to-rag]], retrieval augmentation places relevant documents directly in the prompt. The model does not need to memorize the information because it is supplied fresh at every query. This makes RAG ideal for dynamic knowledge bases — product catalogs, legal precedents, recent news — where the facts change more quickly than you could realistically retrain a model.

**Fine-tuning excels at domain adaptation.** When the task is highly specialized and relatively stable — generating medical diagnoses, summarizing legal briefs, classifying support tickets — fine-tuning reshapes the model's behavior so that it consistently adopts the appropriate style and reasoning patterns. The model does not need to be reminded how to respond each time; the behavior is baked in.

A practical example: in an [[051-agentic-rag]] system a small, lightweight model might be assigned the single responsibility of routing queries — deciding whether a given prompt requires retrieval from a vector database or can be answered directly. Because this model will never perform any other task, you can fine-tune it aggressively on routing examples without worrying about negative transfer. The result is a highly efficient router that outperforms a general-purpose model on its narrow job while consuming far fewer resources.

---

## Using RAG and Fine-Tuning Together

The framing of RAG versus fine-tuning as competing alternatives is misleading. They address different problems and therefore combine naturally. Several hybrid strategies are worth knowing:

**Fine-tune the generator for RAG-style inputs.** The standard LLM in your RAG pipeline was pretrained on text that does not look like a bundle of retrieved passages concatenated before a question. You can fine-tune it specifically on examples of (retrieved context + question → answer) pairs, teaching it to synthesize information from retrieved documents more reliably. The model becomes a specialist in its role within the RAG architecture rather than a generalist being repurposed.

**Fine-tune the retriever.** The embedding model that converts queries and documents into vectors can itself be fine-tuned on domain-specific relevance signals. This improves retrieval quality without changing the generator at all.

**Fine-tune task-specific agents in a multi-agent RAG system.** As described in [[051-agentic-rag]], complex RAG pipelines often include multiple specialized agents — a router, a summarizer, a critic, a synthesizer. Each agent can be a small fine-tuned model rather than a large general-purpose one, reducing latency and cost while improving per-task accuracy.

The combination of RAG and fine-tuning is therefore not additive but multiplicative: RAG ensures the model always has access to current, accurate information, while fine-tuning ensures the model knows how to use that information correctly within the target domain.

---

## Practical Guidance for RAG Builders

For practitioners building RAG systems today, the following decision framework applies:

1. **Start with RAG and a general-purpose model.** This is the fastest path to a working system. Retrieval handles knowledge gaps; prompt engineering handles style.

2. **Add fine-tuning when you hit a ceiling on domain-specific behavior.** If evaluation consistently shows that the model's responses are stylistically wrong — wrong vocabulary, wrong structure, wrong reasoning patterns — and retrieval alone cannot fix it, fine-tuning the generator is the next lever to pull.

3. **Use pre-tuned models from public repositories before training from scratch.** Many organizations publish fine-tuned models on platforms like Hugging Face. A model already fine-tuned for your domain can be deployed immediately and may be sufficient without any additional training.

4. **Fine-tune small models for discrete agentic subtasks.** Routers, classifiers, and extractors that perform a single well-defined function are ideal candidates for aggressive fine-tuning. They require far less compute than fine-tuning a large generator and deliver disproportionate reliability gains.

5. **Monitor for negative transfer.** After fine-tuning, test the model on out-of-domain queries it was previously handling well. If performance drops significantly on tasks outside the fine-tuned domain, decide whether to accept the trade-off or maintain a separate general-purpose model for those cases.

Fine-tuning is a deep discipline with its own best practices around dataset construction, hyperparameter selection, and evaluation. This lesson provides the conceptual map; a dedicated fine-tuning course is the right next step for practitioners who want to go deeper.

---

## Post-test

1. A startup is building a customer support chatbot for a fast-growing e-commerce platform. Their product catalog changes daily and support agents frequently reference order-specific data. Which approach is most appropriate for ensuring the chatbot has accurate, up-to-date information?
   - A) Fine-tune the model on historical support transcripts and redeploy monthly
   - B) Use RAG to retrieve current product and order data at inference time
   - C) Increase the model's context window so it can hold the entire catalog
   - D) Use instruction fine-tuning on a synthetic catalog dataset

2. After fine-tuning a general-purpose LLM on a legal document summarization dataset, a team notices that the model now performs poorly on general coding questions it previously handled well. What phenomenon explains this observation?
   - A) Catastrophic retrieval — the retriever is returning legal documents for coding queries
   - B) Negative transfer — fine-tuning optimized the model for legal tasks and degraded performance on unrelated domains
   - C) Context overflow — the legal training data is consuming too many tokens
   - D) Tokenizer drift — legal vocabulary has overwritten the model's code tokens

3. In a multi-agent RAG pipeline, a small 1B-parameter model is dedicated solely to classifying whether an incoming query should trigger retrieval. A large 70B-parameter general-purpose model handles final answer generation. Which statement about this design is most accurate?
   - A) The 70B model should handle routing too, since it has more knowledge
   - B) The 1B model is a poor choice for routing because small models cannot be reliably fine-tuned
   - C) Heavy fine-tuning of the 1B router is justified because its single-task scope makes negative transfer irrelevant
   - D) RAG should be applied to the 1B router so it can look up routing rules dynamically

> [!example]- Answer Guide
> 
> #### Q1 — RAG vs Fine-Tuning for Fresh Data
> 
> **B** — Product catalog and order data change daily, making fine-tuning impractical as a freshness mechanism. RAG injects current information at inference time, which is exactly the right tool for dynamic, frequently updated knowledge. Monthly redeployment (A) cannot keep pace with daily changes.
> 
> #### Q2 — Negative Transfer After Fine-Tuning
> 
> **B** — This is negative transfer: the gradient updates that improved legal summarization also modified weights that were useful for coding. Fine-tuning optimizes only for the target domain, and those optimizations can reduce performance elsewhere. This is a known trade-off, acceptable only when the model's deployment scope is limited to the fine-tuned domain.
> 
> #### Q3 — Fine-Tuning Small Routing Models
> 
> **C** — Because the 1B model's only job is routing (a single, discrete task), there is no other domain to regress on. Heavy fine-tuning is not only acceptable but recommended: a small, heavily fine-tuned router is efficient, fast, and more reliable for its specific job than a large general-purpose model. Options A and D add unnecessary complexity; B is incorrect because small models can be reliably fine-tuned for narrow tasks.
