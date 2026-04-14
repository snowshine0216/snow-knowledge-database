---
tags: [vertical-domain, ai-engineering, medical, healthcare, rag, guardrail, human-in-the-loop, multi-agent, llm]
source: https://u.geekbang.org/lesson/818?article=930879
---

# Deep Waters of Vertical Domain AI (Part 2): Healthcare

Advanced challenges in applying AI to healthcare — where "approximately correct" is unacceptable and erroneous outputs can directly harm patients.

## Key Concepts

- **数据脏 (Dirty Data / Terminology Mismatch)**: Medical data has three incompatible layers of language — patient colloquialisms, clinical written language, and medical textbook terminology. The same condition may have completely different expressions across layers, breaking standard vector retrieval.
- **本体映射 (Ontology Mapping)**: A pre-retrieval NLP layer that normalizes user input through named entity recognition (NER) to standard medical terminology before querying the knowledge base.
- **拒识系统 (Guardrail System)**: A multi-stage interception architecture that prevents the AI from generating dangerous medical advice, composed of a pre-generation guard and a post-generation validator.
- **前置护栏 (Pre-generation Guard)**: A lightweight intent classifier that detects dangerous self-diagnosis or prescription drug queries and short-circuits to a fixed disclaimer response before any LLM generation occurs.
- **后置校验 (Post-generation Validator)**: A critic agent that receives the LLM's generated output before the user does, checks for specific drug recommendations or diagnosis claims, and intercepts if found.
- **预问诊模式 (Pre-consultation Mode)**: The standard Human-in-the-loop architecture for internet hospitals — AI collects symptoms and generates structured SOAP notes, which the doctor then reviews and supplements with a final recommendation.
- **Human in the Loop**: A design pattern where AI handles data collection and structuring, but a human must confirm or approve before any high-stakes action (diagnosis, payment, prescription) is taken.

## Key Takeaways

- In high-stakes domains (law, finance, medicine), "差不多 (approximately)" means "差很多 (very far off)" — accuracy is safety-critical, not just a quality metric.
- Medical AI's core challenge is not model intelligence but **data normalization**: bridging the gap between patient language, clinical language, and reference knowledge language requires a dedicated NLP/NER pipeline.
- A two-stage guardrail (pre-generation intent filter + post-generation critic agent) is the production standard for medical AI — neither alone is sufficient.
- The pre-generation guard should use a **lightweight** classifier (not a full LLM) for latency reasons; it only needs to distinguish safe vs. dangerous query intent.
- Early streaming-output models that "stop halfway" exposed a design flaw: the guardrail should operate on the complete generated output before it ever reaches the user.
- The medical AI architecture is fundamentally a **recommendation system with human oversight**, not an autonomous decision-maker — the doctor retains final authority.
- All three vertical domains (law, finance, medicine) share the same foundation: RAG + multi-agent + tool calls + human in the loop. The domain-specific additions are what differentiate them.
- Domain experts are a prerequisite for building good vertical AI — engineering alone cannot substitute for professional knowledge of the domain's failure modes.

## See Also

- [[096-vertical-domain-deep-water-1]]
