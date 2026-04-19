---
tags: [rag, prompt-engineering, augmented-prompt, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/77dr2c/prompt-engineering-building-your-augmented-prompt
---

## Pre-test

1. The OpenAI messages format uses three distinct role types. What is the precise purpose of each role, and why does separating them into distinct fields matter for multi-turn conversation management rather than just concatenating all text together?

2. A RAG system retrieves the top-k chunks and injects them into the prompt. Describe two specific instructions you might place in the system prompt (not the user turn) to control how the LLM should *use* those chunks — and explain why putting this guidance in the system prompt rather than the user turn produces more consistent behavior across all queries.

3. A prompt template for a RAG chatbot has four slots: system prompt, conversation history, retrieved context, and latest user query. If you can only keep three due to a context-window limit, which slot would you drop first and why — and what degradation in output quality would you accept as a consequence?

---

# Lecture 046: Prompt Engineering — Building Your Augmented Prompt

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/77dr2c/prompt-engineering-building-your-augmented-prompt

## Outline

1. [What Is Prompt Engineering?](#what-is-prompt-engineering)
2. [The OpenAI Messages Format](#the-openai-messages-format)
3. [Chat Templates and How LLMs Process Messages](#chat-templates-and-how-llms-process-messages)
4. [Writing an Effective System Prompt](#writing-an-effective-system-prompt)
5. [Building the Augmented Prompt with a Template](#building-the-augmented-prompt-with-a-template)
6. [Putting It All Together](#putting-it-all-together)

---

## What Is Prompt Engineering?

Prompt engineering is an umbrella term for a collection of techniques that consistently lead to higher-quality outputs from large language models. Rather than a single trick, it encompasses decisions about structure, tone, instruction placement, role assignment, context ordering, and iterative refinement. For a RAG system the stakes are particularly high: the LLM is the final link in a pipeline that already invested significant effort in chunking, embedding, and retrieval. A poorly written prompt can squander the quality of those upstream steps.

The core insight behind prompt engineering is that LLMs are sensitive to *how* information is presented, not just *what* information is present. Two prompts that contain identical facts but differ in structure or role assignment can produce dramatically different responses. Understanding the mechanisms the model uses to parse input — especially the messages format — is therefore the foundation for everything else in this lesson.

This lesson connects directly to the broader system design explored in [[003-introduction-to-rag]] and the model characteristics introduced in [[006-introduction-to-llms]]. Retrieval provides the raw material; prompt engineering shapes how the model uses it.

---

## The OpenAI Messages Format

The most widely adopted convention for structuring prompts is the OpenAI messages format. It represents a prompt not as a single string but as an ordered list of message objects, each carrying two fields:

- **`content`** — the text of the message.
- **`role`** — one of `system`, `user`, or `assistant`.

This three-way role distinction maps neatly onto the three parties involved in a conversation:

| Role | Who it represents | Typical content |
|---|---|---|
| `system` | The developer or application | High-level behavioral instructions, persona definition, ground rules |
| `user` | The human end-user | Queries, follow-up questions, requests |
| `assistant` | The LLM itself | Previously generated responses being replayed into context |

The structure matters beyond mere aesthetics. LLMs are fine-tuned to treat `system` messages with higher authority than `user` messages, making the system role the right place for instructions that must be respected consistently. Separating roles also enables precise manipulation of multi-turn conversations: to give the model "memory" of prior turns you simply append previous `user` / `assistant` pairs to the list before submitting the next query. The model has no persistent memory of its own; the entire conversation history is reconstructed and submitted as a fresh payload on every call.

This stateless architecture means that prompt size grows with conversation length, which has real cost and latency implications for production RAG systems. Deciding how many prior turns to include is an engineering trade-off discussed later in the course.

---

## Chat Templates and How LLMs Process Messages

Under the hood, the JSON messages list cannot be fed directly into a transformer — the model expects a single token sequence. A **chat template** serialises the structured messages into that sequence by wrapping each message in special delimiter tags such as `<|im_start|>`, `<|im_end|>`, or pipe-separated markers like `[INST]` / `[/INST]` depending on the model family.

These tags are not arbitrary: they were present in the training data used during instruction fine-tuning. The model learned to treat content between those tags as belonging to a particular role, which is how it knows to follow system-level instructions or understand that an `assistant` block represents its own prior words. Using a mismatched template for a given model — or constructing prompts without any template — degrades performance because the model receives signals it was not trained to interpret correctly.

For practitioners the practical implication is simple: use the chat template bundled with the model or use a framework (such as the `apply_chat_template` helper in Hugging Face `transformers`, or the API clients of hosted providers) that applies it automatically. Manual string concatenation invites subtle bugs that are hard to diagnose. See [[043-llm-sampling-strategies]] for related discussion of how model internals affect output behaviour.

---

## Writing an Effective System Prompt

The system prompt is the single most powerful lever available to a RAG application developer. It is injected on every call and frames how the model should interpret *all* subsequent context. Investing time in a well-crafted system prompt pays compound returns across every query the system ever handles.

A real-world example from a popular LLM chatbot illustrates how rich system prompts can be. Several notable patterns emerge from examining it:

**Temporal grounding.** The prompt explicitly states the model's knowledge cutoff date and the current date. This helps the model calibrate whether its parametric knowledge is likely to be stale and nudges it toward relying on retrieved documents rather than memorised facts — exactly what a RAG system wants.

**Procedural guidance.** Instructions like "reason through answers step by step" prompt the model to engage in chain-of-thought reasoning, which reliably improves accuracy on multi-step or ambiguous questions.

**Tone and format.** Directives such as "respond in markdown" or "be concise" shape the surface form of every response without requiring the user to repeat preferences in every query.

**Persona.** Characterising the model as "intellectually curious" and "enjoys engaging in discussion" gives it a consistent personality that users experience as coherent across interactions.

**Safety rails.** Instructions not to assist with certain categories of requests establish boundaries that are harder to override than per-turn reminders.

For a RAG application specifically, the system prompt is also the natural home for retrieval-related instructions:

- *"Use only the provided documents to answer the question. If the answer is not contained in the documents, say so."*
- *"Cite the source document title at the end of each factual claim."*
- *"If the retrieved documents appear irrelevant, tell the user you could not find relevant information."*

These instructions are more effective in the system prompt than in the user turn because the model treats system content as standing policy rather than a one-off request from a user who might be trying to jailbreak it.

---

## Building the Augmented Prompt with a Template

Once you have a clear system prompt, the next step is assembling the full augmented prompt — the complete payload submitted to the LLM that combines static instructions with dynamically retrieved content. A **prompt template** imposes a consistent structure on this assembly process and makes systematic experimentation feasible.

A typical RAG prompt template has four named slots, filled in this order:

1. **System prompt** — fixed per deployment (or per user tier); provides behavioral ground rules and retrieval instructions.
2. **Conversation history** — a replay of prior `user` / `assistant` turns, included when the application supports multi-turn dialogue. Limited by context-window budget.
3. **Retrieved context** — the top-k chunks returned by the retriever, usually accompanied by a brief framing instruction such as "Use the following documents to answer the question below."
4. **Latest user query** — the current question or request that the model should respond to.

The slot ordering is deliberate. Placing the system prompt first ensures the model processes its behavioral instructions before anything else. Conversation history comes next to establish conversational continuity. Retrieved context immediately precedes the user query so that the relevant information is "fresh" when the model processes the question — a positioning effect sometimes called **recency bias exploitation**, analogous to the well-known finding that models attend more strongly to content near the end of the context window.

The value of a template is operational, not just stylistic. Because each slot is independently configurable, you can run controlled experiments: change only the number of retrieved chunks (slot 3) while holding everything else constant, and measure whether answer quality improves. Or swap in a different system prompt (slot 1) and compare tone and faithfulness scores. Without a template, these variables are entangled and hard to isolate.

---

## Putting It All Together

A complete augmented prompt for a RAG chatbot might be visualised as:

```
[system]
You are a helpful research assistant. Answer questions using only the provided documents.
Cite sources. If the answer is not in the documents, say "I don't have that information."
Today's date is {date}.

[user]
What is the capital of France?

[assistant]
The capital of France is Paris.

[user]
What economic policies does the current French government support?

[system / context injection — sometimes modelled as a user turn]
RETRIEVED DOCUMENTS:
[Doc 1] ...
[Doc 2] ...
[Doc 3] ...

[user]
{latest_user_query}
```

The precise mechanics of where to inject retrieved documents — as a separate `system` message, as a prefix inside the final `user` message, or as a standalone injection between history and query — vary by framework and model. What matters is consistency: whatever structure you choose should be applied uniformly across all queries so the model learns to expect it.

This lesson establishes the foundation on which advanced prompting techniques are built. The structure described here — system prompt, history, retrieved context, user query — is the baseline that subsequent lessons will extend with strategies like chain-of-thought prompting, few-shot examples, and output format constraints. See [[041-module-4-introduction]] for the module overview and [[045-choosing-your-llm]] for guidance on how LLM selection interacts with prompt design decisions.

---

## Post-test

1. What are the three role values in the OpenAI messages format, and what does each one represent?

2. Why is the system prompt the preferred location for RAG-specific instructions such as "use only the retrieved documents to answer", rather than including those instructions in the user message?

3. List the four typical slots of a RAG prompt template in the order they are usually assembled, and briefly state the purpose of each slot.

<details><summary>Answer guide</summary>

**Post-test 1.** The three roles are `system` (developer-provided behavioral instructions and ground rules), `user` (messages sent by the human end-user), and `assistant` (responses previously generated by the LLM, replayed to give the model conversation context).

**Post-test 2.** The model is fine-tuned to treat `system` messages as standing policy with higher authority than `user` messages. Placing retrieval instructions in the system prompt means they apply consistently to every query without any risk of the user overriding them or the instruction being diluted by conversational context. User-turn instructions are treated more like one-off requests and are easier to ignore or override.

**Post-test 3.** The four slots in order are: (1) **System prompt** — high-level behavioral instructions and retrieval policies applied on every call; (2) **Conversation history** — replayed prior `user`/`assistant` turns to simulate memory in a stateless model; (3) **Retrieved context** — the top-k chunks from the retriever, framed with instructions on how to use them; (4) **Latest user query** — the current question the model must answer. This ordering places the freshest, most relevant content (context + query) closest to the point of generation.

</details>
