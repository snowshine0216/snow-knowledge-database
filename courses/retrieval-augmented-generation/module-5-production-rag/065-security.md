---
tags: [rag, security, prompt-injection, access-control, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/rrngaa/security
---

## Pre-test

1. Why is metadata filtering alone considered insufficient as a security boundary in a multi-tenant RAG system?
2. What unique vulnerability do dense (embedding) vectors introduce even when the document chunks themselves are encrypted?
3. Under what circumstances would you consider deploying an entirely on-premises RAG system rather than using a cloud LLM provider?

---

# Lecture 065: Security

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/rrngaa/security

## Outline

1. [Why RAG Introduces Unique Security Concerns](#why-rag-introduces-unique-security-concerns)
2. [User Authentication and Role-Based Access Control](#user-authentication-and-role-based-access-control)
3. [Multi-Tenancy vs. Metadata Filtering](#multi-tenancy-vs-metadata-filtering)
4. [Data Leakage via LLM Providers](#data-leakage-via-llm-providers)
5. [Vector Database Encryption and the Dense-Vector Attack](#vector-database-encryption-and-the-dense-vector-attack)
6. [Takeaways and a Broader Security Posture](#takeaways-and-a-broader-security-posture)

---

## Why RAG Introduces Unique Security Concerns

The original motivation for building a RAG system is almost always rooted in privacy: you have proprietary, sensitive, or confidential documents that have never been published on the open web. Because a general-purpose LLM cannot have been trained on data it never saw, RAG is the mechanism that brings private knowledge into the generation pipeline at inference time. That same property — the knowledge base exists precisely because it is private — makes security a first-class design concern rather than an afterthought.

Cybersecurity is a vast, constantly evolving discipline, and no single lesson can address every possible attack surface. This lesson focuses narrowly on the threats that are *distinctive* to RAG architectures, especially the ways your knowledge base can be compromised. Each threat maps directly onto a component of the standard RAG pipeline: the retriever, the vector database, and the LLM inference call. Understanding where information flows helps you apply the right control at the right layer.

The three main leak vectors the lesson identifies are: (1) a user coercing the system through a cleverly crafted prompt, (2) the augmented prompt itself being exposed to a third-party LLM provider, and (3) an attacker gaining direct access to the vector database. Each demands a different defensive response.

---

## User Authentication and Role-Based Access Control

The most direct way a user can compromise your knowledge base is simply to ask for it. A sufficiently manipulative prompt can instruct the LLM to reproduce the retrieved chunks verbatim, effectively turning your chat interface into a full-text search over your private documents. Even without a deliberate jailbreak, a well-worded question may elicit a response that paraphrases sensitive material closely enough to expose it.

The foundational countermeasure is authentication: only allow logged-in, verified users to reach the RAG interface at all. For a corporate knowledge base this means integrating with your existing identity provider so that access to the RAG system is gated the same way access to any other internal tool is gated. This is not a RAG-specific precaution — it is basic security hygiene applied to the RAG front door.

Beyond coarse authentication, RAG systems should implement **role-based access control (RBAC)**. Different users have different permission levels: an HR associate should not be able to retrieve engineering roadmap documents; a sales representative should not be able to retrieve executive compensation data. RBAC means that when a user submits a query, the retrieval step only searches within the subset of documents that user's role is authorized to see.

Combining authentication with RBAC substantially reduces the prompt-injection threat surface. If a user cannot retrieve a document in the first place, no amount of prompt engineering can expose it through the generation layer. This is the principle of defense in depth applied to the retrieval pipeline — see also [[057-what-makes-production-challenging]] for a broader discussion of runtime failure modes.

---

## Multi-Tenancy vs. Metadata Filtering

A common implementation question is *how* to enforce RBAC at the vector database layer. Two approaches are in common use, and the lesson is direct about which one to trust for security purposes.

**Metadata filtering** attaches a permission label (e.g., `role: engineering`) to each document chunk at index time and then appends a filter clause to every query (`WHERE role IN (user.roles)`). This is simple to implement and requires no additional infrastructure. However, the lesson explicitly warns against relying on metadata filtering as a *security* mechanism. Filters are routing hints, not access-control enforcement. They are prone to misconfiguration, easy to forget when a new role is added, and in some vector database implementations the filter is evaluated after approximate nearest-neighbor candidate retrieval, which means restricted documents may briefly appear in the candidate set before being filtered out. Even well-implemented filters have edge cases under adversarial conditions.

**Multi-tenancy** — maintaining separate, physically isolated tenants in the vector database, one per permission boundary — is the recommended approach for security. Each tenant holds only the documents that role is authorized to access. A query from a user in role A is routed only to tenant A's index; tenant B's index is never touched. There is no filter that can be misconfigured because the data simply does not exist in the same namespace.

The practical trade-off is operational complexity. Multi-tenancy requires you to partition your document corpus upfront, maintain tenant mappings as your organization and its roles evolve, and potentially manage a larger number of collection namespaces in your vector store. But for sensitive data, this overhead is the cost of genuine isolation. The lesson's rule of thumb is clean: *metadata filtering is appropriate for personalization; multi-tenancy is required for security*.

---

## Data Leakage via LLM Providers

Every time a RAG system calls a cloud LLM to generate a response, the augmented prompt — which contains the retrieved chunks from your knowledge base — is transmitted to a third-party server. At that point, you have no control over what the provider does with that data. Depending on the provider's data retention and training policies, your proprietary documents could be retained in logs, used to fine-tune future models, or exposed in a future breach of the provider's infrastructure.

For many applications this is an acceptable risk. If your knowledge base contains publicly available documentation or low-sensitivity internal wikis, sending chunks to a cloud LLM is no different from sending them to any other SaaS service. But for high-sensitivity knowledge bases — legal documents, medical records, financial models, trade secrets — this risk may be intolerable.

The solution the lesson recommends is **on-premises deployment**: hosting both the LLM and the vector database on hardware you control. Open-weight models (Llama-family, Mistral, etc.) can be self-hosted, and most major vector database systems are available as self-hosted deployments. The augmented prompt never leaves your network; you control every stage of the pipeline end-to-end.

On-premises deployment introduces real costs: hardware provisioning, model serving infrastructure, ongoing maintenance, and the engineering overhead of keeping self-hosted models updated. These costs must be weighed against the sensitivity of the data. The lesson frames this as a deliberate architectural decision rather than a default: if data sovereignty is a hard requirement, on-premises is the correct answer regardless of operational cost. This connects back to the module-level discussion in [[056-module-5-introduction]] about the additional complexity that separates toy RAG prototypes from production-grade systems.

---

## Vector Database Encryption and the Dense-Vector Attack

A directly hacked database is a threat vector common to all database systems, not only vector stores. The traditional defense is encryption at rest: the database contents are stored in an encrypted form such that an attacker who gains filesystem access cannot read the data without the decryption key.

Vector databases complicate this picture in an interesting way. Approximate nearest-neighbor (ANN) search algorithms must compare query vectors against stored vectors at retrieval time, and this comparison must happen in unencrypted space — you cannot compute cosine similarity between two ciphertext blobs. This means **dense embedding vectors must be stored in memory in a decrypted state** to support search.

The text of the document chunks themselves, however, does not need to be in memory during search. Some vector database providers now support chunk-level encryption: the raw text is stored encrypted, decrypted only when building the final augmented prompt. You can also implement this yourself — encrypt chunks before indexing, store the ciphertext as a metadata payload alongside the vector, and decrypt after retrieval. This adds latency (a symmetric decrypt per retrieved chunk) and implementation complexity but provides a meaningful additional layer of protection.

The more subtle threat is a research finding: **dense vectors can be used to reconstruct the original text**. Because embedding models are trained to encode semantic meaning into geometric space, the distance structure of the vectors carries information about the underlying content. Recent research has demonstrated that under certain conditions, an attacker with access to the raw embedding vectors can recover approximations of the source text — even if the text itself was never stored in plaintext.

This is a nascent area of security research. Proposed mitigations include adding calibrated noise to stored vectors (analogous to differential privacy), applying invertibility-reducing transformations, and reducing embedding dimensionality in ways that preserve retrieval accuracy while degrading reconstruction accuracy. Each technique involves a trade-off with retrieval quality: noisier or lower-dimensional vectors tend to produce less precise search results. The lesson is careful to frame this as an emerging concern requiring awareness rather than an immediately exploitable, well-characterized attack — but it is a threat model that did not exist for traditional relational or document databases, and RAG practitioners should track its development.

---

## Takeaways and a Broader Security Posture

The lesson closes with a synthesis that is worth restating precisely. RAG systems are attractive targets because their *defining feature* is assembling private knowledge into LLM prompts. Every mechanism that makes RAG useful also creates a potential leak path. Designing a secure RAG system means tracing each of those paths and placing an appropriate control at each stage:

- **Front door:** authenticate users; do not expose the RAG interface to anonymous requests.
- **Retrieval layer:** enforce access boundaries through multi-tenancy, not metadata filters; map user roles to tenant partitions before every query.
- **Inference layer:** evaluate whether sending augmented prompts to a cloud provider is acceptable for your data sensitivity; if not, move inference on-premises.
- **Storage layer:** encrypt document chunks at rest; be aware of the dense-vector reconstruction risk and monitor ongoing research for mitigations.

None of these controls are sufficient in isolation. Security is a layered discipline, and the lesson explicitly positions this checklist as a supplement to — not a replacement for — broader cybersecurity best practices (network security, secret management, dependency auditing, incident response, etc.). The unique contribution of this lesson is to map those practices onto the specific components and data flows that are distinctive to RAG architectures.

For a production system, security considerations interact directly with the reliability and observability concerns covered in [[057-what-makes-production-challenging]] and the hallucination-mitigation strategies in [[049-handling-hallucinations]]: a system that leaks private data through a hallucinated citation is both a security failure and a quality failure simultaneously.

---

## Post-test

1. A company stores HR documents, engineering specs, and sales playbooks in a single vector database collection and uses metadata filters to enforce access by role. What specific risk does this design introduce, and what architectural change would you recommend?
2. Your RAG system uses a hosted LLM API. A compliance officer determines that no proprietary document content may leave the corporate network. What is the minimum architectural change required, and what operational trade-offs does it introduce?
3. An attacker gains read access to your vector database's storage layer. You have encrypted all document chunks at rest. Why might the attacker still be able to recover information about the original documents, and what research-stage mitigations exist?

> [!example]- Answer Guide
> 
> #### Q1 — Metadata Filter Access Control Risk
> 
> The risk is that metadata filters are an unreliable security boundary: they can be misconfigured, bypassed under adversarial prompting, or applied incorrectly by the ANN engine before candidate filtering. The recommended change is to move to multi-tenancy — partition the vector database into at least three separate tenant namespaces (HR, engineering, sales), and route each query to only the tenant(s) the user's role is authorized to access. Metadata filters remain appropriate for personalization (e.g., surfacing a user's own past documents first) but should not be the sole mechanism enforcing access control.
> 
> #### Q2 — On-Premises LLM for Data Compliance
> 
> The minimum change is to replace the hosted LLM API call with a self-hosted (on-premises) open-weight model running on infrastructure inside the corporate network. The augmented prompt — which contains retrieved chunks — would then never leave the network perimeter. Trade-offs include: hardware acquisition and provisioning costs, ongoing model maintenance and update cycles, potentially lower model capability compared to frontier cloud models, and additional engineering complexity for model serving infrastructure (load balancing, GPU memory management, autoscaling).
> 
> #### Q3 — Embedding Vector Reconstruction Risk
> 
> Dense embedding vectors must remain unencrypted in memory to support approximate nearest-neighbor search. Recent research has demonstrated that the geometric structure of embedding vectors encodes enough semantic information that it is possible, under experimental conditions, to reconstruct approximations of the original source text from the vectors alone — even when the text payload is encrypted. Research-stage mitigations include: (a) adding calibrated noise to stored vectors (differential-privacy-style obfuscation), (b) applying non-invertible transformations to the vector space that preserve distance rankings but degrade reconstruction accuracy, and (c) dimensionality reduction that retains retrieval utility while removing fine-grained semantic signal. Each technique trades some retrieval precision for reduced reconstruction risk.
