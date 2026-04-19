---
tags: [rag, llm, large-language-models, transformers, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/ccw96/introduction-to-llms
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. An LLM produces different outputs each time you run the same prompt. What is the mathematical mechanism responsible for this non-determinism?
2. Why does asking an LLM about your company's private internal documents cause it to hallucinate rather than simply say "I don't know"?
3. If longer prompts are more expensive to process, why does a RAG system still inject retrieved documents into the prompt rather than simply asking the LLM to recall the information from memory?

---

# Lecture 006: Introduction to LLMs

**Source:** [Retrieval Augmented Generation](https://learn.deeplearning.ai/courses/retrieval-augmented-generation/lesson/ccw96/introduction-to-llms) · DeepLearning.AI · Instructors: Zain Hassan, Andrew Ng

## Outline

- [LLMs as Probabilistic Text Completion](#llms-as-probabilistic-text-completion)
- [Tokens: The Unit of Language](#tokens-the-unit-of-language)
- [How Completions Are Generated: One Token at a Time](#how-completions-are-generated-one-token-at-a-time)
- [Training: Where Knowledge and Style Come From](#training-where-knowledge-and-style-come-from)
- [Hallucinations and the Grounding Problem](#hallucinations-and-the-grounding-problem)
- [Context Windows, Cost, and the Role of RAG](#context-windows-cost-and-the-role-of-rag)

---

## LLMs as Probabilistic Text Completion

Large language models are sometimes jokingly called "fancy autocomplete" — and that description is more accurate than it sounds. At their core, all LLMs do is predict which word should come next in a sequence of text. Given the incomplete phrase *"What a beautiful day, the sun is…"*, both a human reader and a well-trained LLM would agree that the most natural completion is *shining*. Alternatives like *rising* or *out* are plausible. *Exploding* is grammatically valid but probabilistically absurd.

This is the key conceptual point: an LLM does not evaluate whether a completion is *true*; it evaluates whether it is *probable*. Under the hood, the model maintains a mathematical representation of language — a neural network with billions of numerical parameters — that encodes which words tend to co-occur, in what order they typically appear, and what they mean in context. When asked to continue a phrase, the model consults this representation to decide what text would naturally follow. The result is a system that produces fluent, coherent language without any direct mechanism for verifying factual accuracy.

The original piece of text supplied to the model is called the **prompt**. The text the model generates in response is called the **completion**. These two terms — prompt and completion — define the fundamental interface of every LLM, from the simplest text continuation to the most sophisticated chatbot interaction.

---

## Tokens: The Unit of Language

LLMs do not operate directly on words. Instead, they work with **tokens** — a more flexible unit that can represent a whole word, a fragment of a compound word, or a punctuation mark. A simple word like *London* or *door* typically maps to a single token. A longer compound word like *programmatically* or *unhappy* is usually split across multiple tokens. Punctuation characters — periods, commas, question marks — may each receive their own token as well.

The reason for this design is practical flexibility. If the model's vocabulary contained only whole words, it would need a separate entry for every conceivable word in every language, an infeasible vocabulary size. By working with sub-word pieces, the model can construct any word by assembling shorter units it already knows, without pre-assigning a token to every possible compound. Most modern LLMs maintain total vocabularies of somewhere between 10,000 and 100,000 tokens — large enough to cover common words and fragments, small enough to be computationally tractable.

This distinction matters for understanding LLM costs and limits. When practitioners talk about prompt length, context window size, or compute cost, they are always counting tokens — not words or characters. A rough rule of thumb is that one token corresponds to approximately three-quarters of an English word, though this ratio varies by language and content type.

---

## How Completions Are Generated: One Token at a Time

The process by which an LLM generates a completion is **autoregressive**: the model produces one token at a time, and each new token is chosen in the context of all tokens that came before it. To understand what this means in practice, consider how the model extends the prompt *"What a beautiful day, the sun is…"*

Before selecting the first new token, the LLM performs a computationally intensive scan over every token in the current input, building a rich representation of how the words relate to each other and what the phrase as a whole means. It then evaluates every token in its vocabulary — potentially tens or hundreds of thousands — and assigns each one a probability of being a good continuation. The result is a **probability distribution** over the entire vocabulary: *shining* might receive 80% probability, *rising* 12%, *warming* 6%, and every other token some tiny fraction of the remaining probability mass.

Critically, the model does not always pick the highest-probability token. Instead, it **randomly samples** from this distribution. This is what makes LLMs non-deterministic: even with an identical prompt and an identical model, the random sampling step means the model may choose *shining* most of the time but occasionally choose *rising* or, very rarely, *warming*. The same prompt run one hundred times may yield one hundred slightly different completions.

Once the first new token is chosen — say, *shining* — the model appends it to the existing sequence and repeats the entire process to choose the next token. Now the input includes *shining*, which shifts the probability distribution for the following token. Words like *in*, *the*, and *sky* become highly probable because they make sense following *shining*. Had the model initially chosen *warming* instead, the next most-probable tokens would shift as well — perhaps toward *our* and *faces*. This **auto-regressive** or self-influencing property ensures coherence: tokens chosen late in a completion naturally fit the direction established by tokens chosen earlier.

The combined effect of randomness and auto-regression explains why running the same prompt through an LLM multiple times produces varied but coherent outputs. It also explains why small perturbations in early token choices can steer a completion in meaningfully different directions.

---

## Training: Where Knowledge and Style Come From

An LLM's ability to make sensible token predictions comes entirely from its **training** — the process of exposing a neural network to enormous quantities of text and tuning its internal parameters to predict which token comes next.

Before training, a freshly initialized model has billions of numerical parameters set to arbitrary or random values; it produces gibberish. During training, the model is presented with incomplete snippets from the training corpus and asked to predict the next token. Its prediction is compared against the actual token that appeared in the original text, and the parameters are nudged — via gradient descent — to make that correct prediction slightly more probable in the future. Repeat this process across trillions of examples, and the model's parameters gradually converge toward a representation of language that captures vocabulary, grammar, factual associations, and even stylistic patterns.

Most large language models today are trained on trillions of tokens of text drawn predominantly from the public internet — web pages, books, code repositories, scientific papers, and more. The resulting models are remarkably broad: they can generate text in academic prose or casual slang, discuss chemistry or poetry, write Python code or legal contracts, because examples of all of these styles and subjects were present in the training data. The model learns the patterns of *how* each type of text is structured and *what* kinds of information it contains.

The crucial implication is that the model's knowledge is entirely determined by what it was trained on. Facts, styles, and relationships that never appeared in the training data simply do not exist in the model's parameters. There is no mechanism for the model to consult an external source during generation — it draws exclusively from the statistical patterns frozen into its weights at the end of training.

---

## Hallucinations and the Grounding Problem

The most consequential limitation that follows directly from how LLMs are trained is the tendency toward **hallucination** — producing responses that sound authoritative and fluent but contain fabricated or incorrect information.

It is important to understand what hallucination actually is mechanically, because the term implies a kind of psychological malfunction that does not accurately describe what is happening. An LLM is not "lying" and it is not "confused" in any human sense. It is doing exactly what it was designed to do: generating probable sequences of tokens. The problem arises when the model is asked about information it was never trained on. Private company documents, unpublished research, yesterday's news, a specific user's personal data — none of these appeared in the training corpus, so the model has no representation of them in its weights. Yet the model still receives a well-formed question and is still designed to produce a plausible-sounding completion. Absent the correct information, it generates text that has the *form* of a correct answer — confident, fluent, specific — while the *content* is fabricated from patterns superficially similar to the question.

This is not a bug in the software sense. LLMs are explicitly optimized to produce *probable* text, not *truthful* text. When the training data is of high quality and sufficiently broad, the model's sense of "probable" aligns closely with what humans would call "true." When the relevant information is absent from training, that alignment breaks down. The model's only failure mode, from its own perspective, is generating improbable sequences — and it will work hard to avoid that, even if it means confabulating plausible-sounding content.

The grounding problem — ensuring that the LLM's responses are anchored in accurate, relevant information — is precisely the problem that RAG is designed to solve. As described in [[003-introduction-to-rag]], a retriever locates relevant documents and injects them into the prompt before the LLM generates its response. The LLM is excellent at reading, synthesizing, and reasoning over text provided in the prompt context window, even if that text was never part of its training data. The retrieved documents *ground* the model's responses in accurate source material rather than leaving it to rely on potentially absent or imperfect parametric memory.

---

## Context Windows, Cost, and the Role of RAG

If injecting information into the prompt is the solution to hallucination, an obvious question arises: why not inject *everything* — every document that might possibly be relevant? Two interconnected constraints prevent this.

The first constraint is **computational cost**. Before generating each new token, the LLM performs a complex attention operation over every token already in the input sequence, including the entire prompt. The cost of this operation scales superlinearly with prompt length: doubling the prompt more than doubles the compute required. Longer prompts are not just slower — they are meaningfully more expensive to run, which matters at production scale.

The second constraint is the **context window** — the maximum number of tokens an LLM can process in a single forward pass. This is a hard architectural limit, not a soft guideline. Older models have context windows of only a few thousand tokens; more recent models can process hundreds of thousands or even millions. But even the largest context windows are finite, and they fill up quickly when documents are injected.

These two constraints define the practical challenge for the retriever component of a RAG system. Adding more context initially improves answer quality by providing more relevant information, but it simultaneously increases cost. Eventually, injecting additional documents provides diminishing returns or even degrades quality as the model struggles to attend to signal buried in noise. And at the extreme end, the context window fills entirely and further injection becomes impossible.

The art of building effective RAG systems is therefore not just "retrieve and inject" but "retrieve the *right* information and inject it efficiently." The retriever's job is to identify the small subset of documents that are genuinely most relevant to the specific query — reducing both the volume of context injected and the chance that irrelevant text distracts the model. This is why retrieval quality is the single most important variable in RAG system performance. Even a highly capable LLM cannot compensate for a retriever that returns the wrong documents.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Describe the token-by-token generation process, including what makes it non-deterministic and why that non-determinism also produces coherent completions.
2. An LLM confidently gives you a detailed but entirely fabricated answer about your company's Q3 internal sales report. Explain mechanically why this happened — without using the word "bug."
3. Why can't you solve the hallucination problem by simply injecting every document you have into the prompt, and what does this imply about the role of the retriever in a RAG system?

<details>
<summary>Answer Guide</summary>

1. The LLM generates one token at a time. For each new token, it scans all preceding tokens to build a contextual representation, then computes a probability distribution over its entire vocabulary. It samples randomly from that distribution — not always picking the highest-probability token — which is why identical prompts produce different outputs. Coherence is preserved because each new token is sampled in the context of all previously generated tokens (auto-regression), so later choices naturally follow from earlier ones.

2. The model has no knowledge of the internal sales report because that document was never in its training data. Its weights contain no representation of that information. When asked about it, the model still receives a well-formed question and is still optimized to generate probable text. Without the correct information, it generates a completion that has the *form* of a confident, specific answer — because that is what usually follows such a question in text the model has seen — while the content is confabulated from similar patterns. The model is functioning as designed; it is simply designed to produce probable text, not truthful text.

3. Injecting all documents fails for two reasons: computational cost (longer prompts require more compute per token generated) and the finite context window (a hard architectural limit on total input length). Even before hitting the window limit, irrelevant context degrades answer quality by burying the relevant signal. This means the retriever must do real work — selecting only the most relevant documents for each specific query — rather than simply passing everything through. Retriever quality therefore sets the ceiling on overall RAG system performance.

</details>
