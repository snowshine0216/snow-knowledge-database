---
tags: [rag, transformer, attention, llm, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/yy164k/transformer-architecture
---

## Pre-test

1. An LLM processes a prompt token-by-token in strict left-to-right order, and each token only ever looks at the tokens that came before it during the attention step. True or false — and what is the correct description of how attention actually operates?
2. The feedforward layers of a transformer are responsible for computing attention weights between tokens. What is the actual role of the feedforward sublayer, and why does it dominate the parameter count of a typical LLM?
3. Because a RAG system injects retrieved documents into the prompt before generation, the LLM is guaranteed to ground its answer in that retrieved content. What property of transformer-based generation makes this guarantee false?

---

# Lecture 042: Transformer Architecture

**Source:** https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/yy164k/transformer-architecture — DeepLearning.AI — Retrieval-Augmented Generation

## Outline

1. [Origins of the Transformer: Attention Is All You Need](#1-origins-of-the-transformer-attention-is-all-you-need)
2. [Tokenization and Initial Embeddings](#2-tokenization-and-initial-embeddings)
3. [The Attention Mechanism](#3-the-attention-mechanism)
4. [Multi-Head Attention](#4-multi-head-attention)
5. [Feedforward Layers and Iterative Refinement](#5-feedforward-layers-and-iterative-refinement)
6. [Autoregressive Generation and RAG Implications](#6-autoregressive-generation-and-rag-implications)

---

## 1. Origins of the Transformer: Attention Is All You Need

The transformer architecture is the foundation on which every modern large language model is built, and understanding it is not optional for a practitioner who wants to design capable RAG systems. The architecture was introduced in the 2017 paper *"Attention Is All You Need,"* which targeted the problem of machine translation. The original design contained two cooperating components: an **encoder** and a **decoder**. The encoder's job was to read a source-language passage — say, a paragraph of German — and construct a rich internal representation of its meaning. The decoder then consumed that representation to produce the translated output in English.

In contemporary practice, these two components have largely been separated by purpose. **Encoder-only models** — such as those used inside embedding systems — are optimized for building dense semantic representations of text rather than for generating new text. They appear in the retrieval half of a RAG pipeline (see [[006-introduction-to-llms]]). **Decoder-only models**, by contrast, are the LLMs used at the generation half: they receive a prompt and iteratively produce tokens. Most production LLMs — GPT-family models, Claude, Llama, and their relatives — are decoder-only. Understanding what happens inside that decoder is the subject of this lesson.

---

## 2. Tokenization and Initial Embeddings

Before any computation can begin, the model must convert raw text into a form it can manipulate numerically. The first step is **tokenization**: the prompt is split into discrete units called *tokens*. A token is not necessarily a whole word; common subword segmentation schemes mean that a single English word may become one, two, or several tokens depending on its frequency in the training corpus.

Each token is then mapped to a dense numeric vector called an **embedding**. This initial embedding is a *static first-guess* at the meaning of the token: every time the same token appears anywhere — regardless of context — it receives exactly the same starting vector. This is an important point to internalize, because it shows that context-sensitivity is not a property of the embedding lookup itself but must be supplied by later processing. Alongside the semantic embedding, each token is assigned a **positional encoding** that encodes its location in the sequence. Without positional information, the attention computation would treat "the dog bit the man" and "the man bit the dog" as carrying identical information — which is obviously wrong. Together, the semantic and positional vectors form the input representation that flows into the attention mechanism.

---

## 3. The Attention Mechanism

The **attention mechanism** is the step that transforms those static, context-free embeddings into context-sensitive representations. Its core operation is deceptively simple to state: every token examines every other token in the prompt and decides how much weight — how much *attention* — to assign to each of them when updating its own meaning.

Consider the sentence "the brown dog sat next to the red fox." The token *dog* does not carry a fixed, unchanging meaning in all possible contexts; its meaning is sharpened by the company it keeps. During the attention step, *dog* might assign roughly 70% of its attention weight to *brown* (because that adjective directly modifies it) and 20% to *sat* (because that verb describes its action), with the remaining 10% spread thinly across the other tokens. The result of this weighted aggregation is that *dog* now holds an updated vector that incorporates contextual information drawn from its neighbors. This process runs for every token simultaneously.

The practical implication for RAG is significant. When retrieved documents are concatenated into the prompt, the LLM's attention mechanism is precisely what allows the model to perceive the *relationship* between a question and a relevant passage several hundred tokens away. The mechanism does not merely glance at the retrieved text; it integrates it deeply with every other token in the context window.

---

## 4. Multi-Head Attention

A single pass of the attention operation would capture only one "type" of relationship between tokens. Real language is richer than that: words relate to each other along many orthogonal dimensions simultaneously — subject-predicate agreement, modifier-noun attachment, coreference, temporal proximity, and countless others. This is why transformers use **multi-head attention**, where the attention computation is run multiple times in parallel, each instance specializing in a different kind of relational signal.

To continue the earlier example, one **attention head** might specialize in the relationship between objects and their modifying descriptions, causing *fox* to attend strongly to *red*. A different head might specialize in spatial proximity, causing *fox* to attend strongly to *sat* and *next*. A third head might track subject-verb relationships. Crucially, the labels "object-description head" or "spatial-relationship head" are conceptual conveniences for teaching purposes. In reality, the relationships each head learns are **emergent from training** on massive text corpora; they are complex, entangled, and do not map neatly onto human-legible linguistic categories.

Smaller models typically employ 8 to 16 attention heads. Larger frontier models may use more than 100. The effect is multiplicative: with 100 attention heads, every token is simultaneously tracking its relationship to every other token from 100 distinct analytical perspectives. The resulting representation is extraordinarily rich, which is why LLMs exhibit such strong language understanding — and why they can meaningfully process a nuanced passage of retrieved text injected at runtime.

---

## 5. Feedforward Layers and Iterative Refinement

After the attention scores have been computed and each token's vector has been updated with contextual information, the model passes those updated vectors through a **feedforward sublayer**. If the attention mechanism is the comparatively "narrow" integration step, the feedforward sublayer is the broad, deep one: it contains the vast majority of the model's learnable parameters. Its function is to take each token's context-enriched vector and produce a further-refined representation, drawing on patterns the model internalized during training. Think of it as the step where the model applies its factual and linguistic world knowledge, encoded in billions of weight values, to deepen its understanding of what each token means in this particular context.

This single pass through attention followed by feedforward constitutes one *transformer layer*. Most LLMs stack many such layers. A given model might run these vectors through 8 to 64 layers before generation begins. At each layer, the representations become more refined: first-guess embeddings become second-guess, then third-guess, and so on, with each pass incorporating a more globally coherent understanding of the entire prompt. This iterative deepening is why LLMs can make inferences that depend on chains of reasoning spread across many parts of a long document — the architecture is built to propagate and integrate information across distance repeatedly.

The computational cost of this process is substantial. Every token must attend to every other token at every layer, meaning attention cost scales with the square of sequence length. The feedforward layers add a further parameter-linear cost on top. This is why longer prompts — such as those produced by RAG systems that inject large retrieved documents — are meaningfully more expensive to process. Understanding this cost structure is essential when designing retrieval strategies and deciding how much retrieved content to include in a prompt.

---

## 6. Autoregressive Generation and RAG Implications

Once the transformer layers have produced highly refined vector representations for all tokens in the prompt, the model transitions to generation. It computes a **probability distribution** over every token in its vocabulary — which may contain 100,000 or more entries — asking: given everything I have processed, what token is most likely to come next? Most vocabulary items receive a probability near zero; a handful of plausible continuations receive meaningfully high probabilities.

The model then **samples** one token from this distribution. Sampling rather than always picking the maximum-probability token is what gives LLMs their non-deterministic character: even with identical inputs, two runs may produce different outputs. The chosen token is appended to the prompt, and the entire process — re-tokenization, embedding, all attention and feedforward layers — repeats from the beginning on this extended sequence. This is **autoregressive generation**, and it means that early token choices cascade forward: a probabilistically unlikely but still-possible early token can steer the entire completion in an unexpected direction. Generating a full response may require hundreds or thousands of such individual steps, each incurring the full cost of a forward pass.

Three RAG-relevant lessons follow directly from this architecture. First, RAG *can* work — and works well — because the attention mechanism is exactly the right computational substrate for integrating retrieved information. The LLM does not simply read retrieved passages; it weaves them into a deeply cross-referenced understanding of the entire prompt. Second, RAG does *not* guarantee grounded outputs. Because generation is probabilistic, a model may sample tokens that contradict the retrieved evidence, particularly if the temperature parameter allows high randomness or if the retrieved information conflicts with strongly weighted training-data patterns. Controlling this — through temperature tuning, grounding prompts, and output verification — remains a necessary engineering concern (see [[041-module-4-introduction]]). Third, cost management is inseparable from context-window management: because transformer inference cost grows with prompt length, every retrieved chunk added to the context has a measurable price. Efficient RAG design requires balancing retrieval breadth against inference cost.

---

## Post-test

1. What is the difference in purpose between an encoder-only transformer model and a decoder-only transformer model, and which type is used in the generation step of a RAG pipeline?
2. Explain in your own words why multi-head attention produces richer contextual representations than single-head attention would. What is the relationship between the number of attention heads and model expressiveness?
3. Why does the autoregressive generation process mean that RAG cannot guarantee the LLM will ground its answer in retrieved documents, even when those documents are directly present in the prompt?

> [!example]- Answer Guide
> 
> #### Q1 — Encoder-only vs Decoder-only Models
> 
> Encoder-only models process an entire input sequence bidirectionally to produce dense semantic embeddings; they are used in the *retrieval* component of a RAG pipeline (e.g., to embed queries and documents for similarity search). Decoder-only models generate text autoregressively and are used in the *generation* step — they receive the augmented prompt (query + retrieved chunks) and produce the response.
> 
> #### Q2 — Multi-head Attention Expressiveness
> 
> A single attention head captures one "perspective" on inter-token relationships at a time. Multiple heads run in parallel, each learning a distinct pattern of relationships from training data (e.g., one head may track modifier-noun connections, another subject-verb agreement, another coreference). Because each head independently weights token-to-token relevance from a different learned vantage point, the concatenated output of all heads provides a multi-dimensional, richer characterization of each token's meaning than any single head could. More heads generally means more distinct relational signals, increasing the model's ability to represent nuanced linguistic and factual dependencies.
> 
> #### Q3 — Autoregressive Generation and Grounding
> 
> Generation is probabilistic: at each step the model samples from a probability distribution rather than always selecting the highest-probability token. Even if retrieved evidence strongly suggests a particular answer, there is always a non-zero probability of sampling a token inconsistent with that evidence — especially at higher temperature settings. Moreover, strongly memorized training patterns can compete with retrieved content in the distribution, sometimes winning out. This irreducible randomness means system designers must add explicit controls (e.g., low-temperature sampling, grounding instructions in the system prompt, post-generation verification) to reliably anchor outputs to retrieved information.
