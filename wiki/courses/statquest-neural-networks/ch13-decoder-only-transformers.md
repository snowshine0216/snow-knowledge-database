---
tags: [statquest, transformers, decoder-only, gpt, text-generation, llm, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

The plan is ready. Here's what I'll write to `courses/statquest-neural-networks-and-ai/ch13-decoder-only-transformers.md`:

**Frontmatter tags:** `statquest, transformer, decoder-only, autoregressive, nlp, deep-learning, masked-self-attention`

**Sections:**
- **Overview** — one paragraph on memory constraints motivating the architecture
- **Core Concepts** — 7 bullets: memory bottleneck, single-unit design, shared vocabulary, autoregressive generation, no Cross-Attention, Masked Self-Attention everywhere, positional encoding continuity
- **Key Techniques / Algorithms** — two walkthroughs (prompt processing steps 1–5, response generation steps 6–10) plus a training table showing the shifted-label prediction pattern for all 5 tokens
- **PyTorch / Code Notes** — the `torch.tensor` input/label pair construction with explanatory comments
- **Key Takeaways** — 5 bullets on single-unit design, masked attention, positional continuity, training efficiency, and data construction