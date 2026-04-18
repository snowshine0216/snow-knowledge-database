---
tags: [statquest, transformers, decoder-only, gpt, text-generation, llm, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. How does a GPT-style decoder-only transformer differ from an encoder-decoder transformer — specifically, which attention mechanism does it lack?
2. What does "autoregressive generation" mean, and why does it require the model to process tokens one at a time during inference?
3. In transformer training, how are input-label pairs typically constructed from a raw text sequence — what is the relationship between each input token and its corresponding label?

---

The plan is ready. Here's what I'll write to `courses/statquest-neural-networks-and-ai/ch13-decoder-only-transformers.md`:

**Frontmatter tags:** `statquest, transformer, decoder-only, autoregressive, nlp, deep-learning, masked-self-attention`

**Sections:**
- **Overview** — one paragraph on memory constraints motivating the architecture
- **Core Concepts** — 7 bullets: memory bottleneck, single-unit design, shared vocabulary, autoregressive generation, no Cross-Attention, Masked Self-Attention everywhere, positional encoding continuity
- **Key Techniques / Algorithms** — two walkthroughs (prompt processing steps 1–5, response generation steps 6–10) plus a training table showing the shifted-label prediction pattern for all 5 tokens
- **PyTorch / Code Notes** — the `torch.tensor` input/label pair construction with explanatory comments
- **Key Takeaways** — 5 bullets on single-unit design, masked attention, positional continuity, training efficiency, and data construction

---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why the decoder-only architecture uses a single unit with a shared vocabulary for both prompt processing and response generation — what memory constraint motivated this design?
2. Describe what Masked Self-Attention does and why it is used everywhere in a decoder-only transformer instead of only in certain layers.
3. Walk through how the shifted-label prediction pattern works for a 5-token training sequence — what is the input and label for each of the 5 positions?

<details>
<summary>Answer Guide</summary>

1. The single-unit design with a shared vocabulary avoids the memory overhead of maintaining separate encoder and decoder modules; both prompt tokens and generated tokens pass through the same weights, reducing parameters while preserving continuity of positional encoding across the full sequence.
2. Masked Self-Attention prevents each token from attending to future positions, which is essential for autoregressive generation — without masking, the model could "see" the answer during training, making learned predictions meaningless; it is applied at every layer because there is no separate encoder stack with unrestricted attention.
3. For a 5-token sequence [t1, t2, t3, t4, t5], the shifted pattern produces: position 1 input=t1 → label=t2, position 2 input=t1–t2 → label=t3, position 3 input=t1–t3 → label=t4, position 4 input=t1–t4 → label=t5, position 5 input=t1–t5 → label=EOS (or next token); each step trains the model to predict the next token given all preceding tokens.

</details>
