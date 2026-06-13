---
tags: [rag, agents, retrieval, embeddings, bm25, vector-search, tools, planning, memory, chip-huyen, study-guide, quiz]
source: https://github.com/chiphuyen/aie-book
---

# Chapter 6 — RAG and Agents

> [!abstract]+ Chapter at a glance
> Two ways to give a model more than its prompt: feed it the right **knowledge** (RAG) and give it the ability to **act** (agents). RAG retrieves relevant information and adds it to the context; its quality is gated by the **retriever**, not the generator. Agents generalize this — a model that **plans**, **uses tools**, and **acts in a loop**. The chapter covers retrieval algorithms (term-based vs. embedding-based) and optimization, then agent design (tools, planning, reflection), failure modes, and **memory**.

## Core concepts

### RAG (Retrieval-Augmented Generation)
- **Why**: inject knowledge the model lacks (private, recent, or too large for the context window) without finetuning. **Pattern**: **retrieve → augment the prompt → generate.**
- **Architecture**: a **retriever** (with two jobs: **indexing** documents offline, and **querying**/retrieving at run time) feeds context to a **generator** (the LLM).
- **Retrieval algorithms**:
  - **Term-based (sparse / lexical)** — match on keywords. **TF-IDF**, **BM25** (the strong classic baseline), Elasticsearch. Fast, cheap, interpretable, no training; struggles with **synonyms/paraphrase** (vocabulary mismatch).
  - **Embedding-based (dense / semantic)** — embed query and documents into vectors; retrieve by **vector similarity** (cosine). Needs a **vector database** and **approximate nearest neighbor (ANN)** search to scale. Captures **meaning/paraphrase**; costs more (embedding + index) and depends on embedding quality.
  - **Hybrid** — combine term-based + embedding-based (e.g., BM25 recall then semantic rerank) for the best of both.
- **Evaluating retrieval**: borrow IR metrics — **precision**, **recall**, plus **context precision/recall** (is the retrieved context relevant and complete?). Remember: the retriever is usually the **bottleneck** — a generation error is often really a retrieval miss.
- **Optimizing retrieval**:
  - **Chunking strategy** — chunk size/overlap trades off precision vs. context completeness; a key tuning knob.
  - **Reranking** — a **cross-encoder** re-scores the top candidates for relevance (more accurate, more expensive — so applied only to a shortlist).
  - **Query rewriting / expansion** — reformulate the user query to retrieve better.
  - **Contextual retrieval** — augment chunks with extra context (metadata, summaries, surrounding doc context) so isolated chunks remain meaningful.
- **RAG beyond text** — multimodal RAG (images) and **tabular/structured** data (text-to-SQL as retrieval).

### Agents
- **Definition**: an **agent** = a model + **tools** + a **planning/control loop** that lets it perceive an environment and **act** on it to accomplish a goal. Agents are a **generalization of RAG**: RAG is an agent whose only tool is "retrieve."
- **Tools** extend the model three ways:
  - **Knowledge augmentation** — retrievers, search, DB queries (read-only context).
  - **Capability extension** — calculator, code interpreter, translators — fix inherent model weaknesses.
  - **Write actions** — tools that **change state** (send email, place order, update DB). Powerful and dangerous; the security stakes jump (injection → real-world side effects).
- **Planning** is the agent's hard part and main bottleneck:
  - **Decouple planning from execution** — generate a plan, optionally validate it, then execute (cheaper and safer than acting greedily).
  - **Plan generation & tool/function calling** — the model decides which tool to call with which arguments (structured output, Chapter 2).
  - **Reflection & error correction** — the agent critiques its own progress/results and revises (self-correction); a major reliability lever.
  - **Tool selection** — too many tools confuse the model; curate the toolset.
- **Agent failure modes & evaluation**:
  - **Planning failures** — wrong tool, wrong arguments, invalid plans, **infinite loops**, failure to stop.
  - **Tool failures** — bad tool output, or the agent over-trusting noisy/erroneous tool results.
  - **Efficiency** — too many steps/tokens/cost; evaluate steps and cost, not just final success.
  - Compounding: each step has an error rate, so **errors multiply over a long trajectory** — short, well-scoped plans are more reliable.

### Memory
- **Why**: the context window is finite; agents and long conversations need to persist and recall information beyond it.
- **Two systems**: **internal / short-term** (what's in the current context) and **external / long-term** (a store the agent reads from and writes to — vector DB, files, KV store).
- **Memory management**: strategies to decide what to keep, drop, or compress — **FIFO** (drop oldest), **redundancy removal/summarization**, and **reflection** to distill raw history into durable **insights**. Memory is essentially RAG pointed at the agent's own history.

## Quiz

**1.** Describe the RAG pattern and the retriever's two distinct jobs.

> [!example]- Show answer
> RAG = **retrieve relevant information → augment the prompt with it → generate** the answer conditioned on that context. The **retriever** has two jobs: (1) **indexing** — process and store documents offline (chunk, embed, build the index) so they're searchable; and (2) **querying/retrieval** — at run time, take the user query and fetch the most relevant chunks to inject into the prompt. The generator (LLM) then produces the answer. Separating indexing (offline, batch) from querying (online, latency-sensitive) is important for both performance and how you optimize each.

**2.** Compare term-based and embedding-based retrieval. When does each win?

> [!example]- Show answer
> **Term-based (sparse)** — e.g., **BM25**/TF-IDF/Elasticsearch — matches keywords. Fast, cheap, interpretable, needs no training, and is a **strong baseline**; it wins on exact-term, jargon, code, and keyword-heavy queries. Its weakness is **vocabulary mismatch** — it misses synonyms/paraphrase. **Embedding-based (dense)** embeds query and docs and retrieves by **vector similarity** (needs a vector DB + ANN). It captures **semantic meaning/paraphrase**, winning when wording differs from the source; costs more and depends on embedding quality. In practice, **hybrid** (BM25 for recall + semantic rerank) often beats either alone.

**3.** Why is the retriever, not the generator, usually the RAG bottleneck — and what's the practical consequence?

> [!example]- Show answer
> A capable generator can only answer well if it's **given the right context**. If retrieval fails to surface the relevant chunk (low recall) or surfaces noise (low precision), the generator either hallucinates or answers from irrelevant text — no amount of prompt tweaking fixes a missing document. **Consequence**: when RAG gives a wrong answer, **debug retrieval first** (measure context precision/recall), not the prompt or model. Most RAG quality gains come from better chunking, reranking, query rewriting, and hybrid search — i.e., improving what reaches the generator.

**4.** What is reranking and why apply it only to a shortlist?

> [!example]- Show answer
> **Reranking** re-scores candidate chunks for relevance using a more accurate but more expensive model — typically a **cross-encoder** that jointly reads the query and each candidate (unlike the bi-encoder/ANN first stage that embeds them separately). Because cross-encoders are **costly per pair**, you can't run them over the whole corpus; instead you use cheap first-stage retrieval (BM25/ANN) to get a **shortlist** (say top 50–100), then rerank just those down to the top few. This two-stage "**retrieve then rerank**" gets near cross-encoder accuracy at near first-stage cost.

**5.** In what sense is an agent a generalization of RAG?

> [!example]- Show answer
> RAG is the special case of an agent whose **only tool is "retrieve"** and whose loop is a single step (retrieve once, then generate). A general **agent** has **multiple tools** (search, calculator, code, write-actions), can **plan** a multi-step sequence, **act** on an environment, observe results, **reflect**, and loop until the goal is met. Both share the core idea — augment the model with external information/capability — but the agent adds **planning, iteration, and action**. Seeing it this way means the retrieval lessons (precision/recall, the retriever-is-the-bottleneck) carry straight over to an agent's tool use.

**6.** What are the three categories of tools, and which one raises the security stakes the most?

> [!example]- Show answer
> (1) **Knowledge augmentation** — read-only information tools (retrievers, web search, DB queries). (2) **Capability extension** — fix model weaknesses (calculator, code interpreter, translator). (3) **Write actions** — tools that **change external state** (send email, place an order, modify a database). **Write actions raise the stakes the most**: combined with prompt/indirect injection (Chapter 5), a hijacked agent can cause **real-world side effects** — exfiltrating data, making unauthorized transactions. That's why write-action tools need least privilege, sandboxing, validation, and often human approval.

**7.** Why does an agent's reliability degrade as its plan gets longer, and what mitigates it?

> [!example]- Show answer
> Each step has some probability of error (wrong tool, bad arguments, misread tool output), and errors **compound multiplicatively** across a trajectory — a 90%-per-step success rate over 10 steps is only ~35% end-to-end. Long plans also risk **infinite loops** and drift. **Mitigations**: keep plans **short and well-scoped**, **decouple planning from execution** (validate the plan before acting), add **reflection/error-correction** so the agent catches and fixes mistakes mid-run, **curate the toolset** to reduce wrong-tool errors, and **evaluate steps/efficiency** (not just final success) to catch degradation.

**8.** What is reflection in an agent, and why is it a major reliability lever?

> [!example]- Show answer
> **Reflection** is the agent **critiquing its own progress or outputs** — checking whether a tool result makes sense, whether it's on track toward the goal, or whether the answer is correct — and then **revising** its plan or response. It's a reliability lever because it inserts a **self-correction step** that catches errors (bad tool output, flawed reasoning, wrong sub-results) before they propagate through the rest of a multi-step trajectory, where they'd otherwise compound. It's the agent-loop version of "give the model time to think / self-critique" from Chapter 5, and it trades extra compute for substantially higher success rates.

**9.** Describe agent memory: the two systems and one management strategy.

> [!example]- Show answer
> Because the context window is finite, agents need **memory** beyond it. **Internal / short-term memory** = what's currently in the context (the live conversation/scratchpad). **External / long-term memory** = a persistent store (vector DB, files, key-value store) the agent **writes to and retrieves from** across turns/sessions. A **management strategy** decides what to retain/drop/compress: e.g., **FIFO** (evict oldest), **redundancy removal / summarization** (compress repetitive history), or **reflection** (distill raw history into durable **insights**). Long-term memory is essentially **RAG over the agent's own history**.

**10.** *(Applied)* Your RAG bot returns confident but wrong answers on ~20% of queries. Give a systematic debugging plan.

> [!example]- Show answer
> Treat it as **component evaluation** (Chapter 4). (1) **Measure retrieval** on the failing queries: was the correct chunk retrieved at all (**recall**)? Was the context relevant (**precision**)? If the right chunk never appears, it's a **retrieval** problem, not generation. (2) If retrieval misses: tune **chunking** (size/overlap), add **hybrid search** (BM25 + embeddings) and **reranking**, try **query rewriting**, and consider **contextual retrieval** so chunks aren't stranded without context. (3) If the right chunk *is* retrieved but the answer is still wrong: it's a **generation/faithfulness** problem — tighten the prompt to **answer only from context**, add CoT, and check the **generator's faithfulness** (Chapter 4). (4) Re-evaluate on a labeled set after each change so you know which fix moved the needle. Most likely culprit first: retrieval.

## Deeper understanding (expansion)

> [!info]+ 💡 RAG vs. finetuning: knowledge vs. behavior
> A question that recurs across Chapters 6–7: when something's missing, do you **retrieve** it or **finetune** it in? The clean heuristic: **RAG for knowledge, finetuning for behavior.** If the model lacks **facts** (private docs, recent events, long-tail data), RAG injects them at run time — and you can update the knowledge by updating the index, no retraining. If the model lacks a **skill, format, tone, or behavior** that won't stick via prompting, finetuning changes the weights. They're **complementary, not rival**: most serious systems finetune for reliable behavior/format *and* use RAG for fresh, specific knowledge. Reach for RAG first when the gap is "it doesn't *know* X."

> [!info]+ 💡 The retriever-is-the-bottleneck principle generalizes to all of agents
> "A RAG generation error is usually a retrieval error" is a special case of a broader truth: in any augmented system, the model is **only as good as the context and tools it's given**. For agents, the analog is "a reasoning failure is often a **tool/observation** failure" — the agent got bad data from a tool, or the wrong tool was available. This reframes a lot of agent debugging away from "the model is dumb" toward "the model was set up to fail": curate tools, validate tool outputs, and measure the quality of what each step *feeds* the model. Garbage context in, garbage action out.

> [!info]+ 💡 Every tool is an attack surface — agents weaponize Chapter 5's injection risk
> RAG already ingests untrusted external text (retrieved docs can carry **indirect injection**). Agents make this far more dangerous by adding **write actions**: a poisoned document or web page doesn't just corrupt an answer, it can drive the agent to **do something irreversible**. The design consequence is to treat the agent boundary like any security boundary: **least-privilege** tools (scoped, rate-limited, with validation), **sandboxing** for code/external calls, **human-in-the-loop approval** for high-impact actions, and **output filtering**. Capability and risk scale together — the more an agent can *do*, the more rigor its tooling needs. This is the single biggest reason production agents lag the demos.

## Connections

- **← Chapter 5**: RAG is "provide sufficient context" automated; agents inherit and amplify injection risk.
- **← Chapter 3**: retrieval reuses **embeddings** and IR metrics (precision/recall).
- **→ Chapter 7**: the RAG-vs-finetuning decision; when behavior (not knowledge) is the gap.
- **→ Chapter 9**: long agent trajectories and large contexts make **inference cost/latency** and **KV cache** central.
- **→ Chapter 10**: agents are the most complex production architecture pattern, needing guardrails and monitoring.
- See also: [[chip-huyen-ai-engineering-book_3abc60d3]].
