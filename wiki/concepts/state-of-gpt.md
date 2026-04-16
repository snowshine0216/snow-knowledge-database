---
tags: [llm, gpt, training, rlhf, sft, prompt-engineering, rag, fine-tuning, tool-use, karpathy, transformer]
source: https://www.youtube.com/watch?v=bZQun8Y4L2A&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=8
---
# State of GPT

A 42-minute talk by Andrej Karpathy at Microsoft Build 2023 (May 25) covering the four-stage GPT assistant training pipeline and a set of prompt engineering techniques framed through the lens of human vs. LLM cognition. The talk is split into two halves: (1) how GPT assistants are trained, and (2) how to deploy them effectively.

## Key Concepts

### The Four-Stage Training Pipeline

- **Pretraining** (99% of compute): train on internet-scale token sequences (CommonCrawl, GitHub, Wikipedia, Books) using next-token prediction. LLaMA-65B trained on 1.4T tokens with 2,000 GPUs for ~21 days at ~$M cost — more powerful than GPT-3's 175B params despite having fewer parameters, because it trained ~4.7× longer.
- **Supervised Fine-tuning (SFT)**: swap internet documents for tens-of-thousands of human-written (prompt, ideal response) pairs and continue language modeling. Produces a working assistant but with lower ceiling than RLHF.
- **Reward Modeling (RM)**: collect comparison data — multiple SFT completions for the same prompt, ranked by contractors — then train a scalar reward predictor on pairwise ranking loss.
- **RLHF (RL stage)**: use the frozen RM to score completions from the evolving policy; upweight tokens that scored high, downweight tokens that scored low. ChatGPT is an RLHF model; Vicuna-13B is SFT.

### Why RLHF Beats SFT

The core insight is an **asymmetry**: judging quality is easier than producing it. A contractor asked to write a haiku about a paper clip may write poorly, but can reliably rank five haiku samples. Comparisons extract more accurate human signal than demonstrations. Trade-off: RLHF reduces output diversity (loses entropy) — base models remain better for "generate N more things like these" tasks (e.g., Pokémon names).

### LLMs as Token Simulators

Karpathy frames the second half of the talk as "making up for the cognitive gap between human brains and LLM brains." Key differences:
- LLMs allocate **equal compute per token** (roughly ~80 transformer layers) — they cannot do more work for harder tokens.
- They **cannot backtrack**: once a bad token is sampled, the model continues down that path.
- They **don't self-check** unless prompted — they imitate, they don't aim to succeed.
- Their **working memory is the context window**: anything loaded there is instantly accessible via self-attention; anything outside is gone.

### Prompt Engineering Techniques

- **Chain-of-Thought**: "Let's work this out step-by-step to be sure we have the right answer" spreads reasoning over many tokens AND conditions on success — outperforms plain "let's think step-by-step."
- **Self-consistency / multiple sampling**: sample several completions, take the majority vote or pick via reward model — compensates for the LLM's inability to backtrack from lucky/unlucky samples.
- **Reflection prompting**: explicitly ask "did you meet the assignment?" — GPT-4 knows when it failed, it just won't revisit without being asked.
- **Tree of Thought** (2023 paper): maintain multiple reasoning branches simultaneously, score and prune like Monte Carlo Tree Search. Analogous to AlphaGo's policy + MCTS. Requires Python glue code orchestrating multiple prompt calls.
- **Ask for expertise**: "You are a leading expert, IQ 120" prevents the model from hedging on low-quality training examples. Don't ask for "IQ 400" — may exit the data distribution.

### RAG and Tool Use

- **RAG recipe**: chunk documents → embed → store in vector DB → at query time, retrieve top-k chunks → inject into context → generate. Context window = working memory; stuffing relevant docs in works better than relying on parametric memory.
- **Tools**: LLMs don't know what they don't know — explicitly tell them "use the calculator for large-number arithmetic; here's the syntax." LlamaIndex connects many data sources to LLMs.
- **Constraint prompting**: tools like Guidance (Microsoft) clamp token probabilities to enforce valid JSON output, letting the model only fill in variable slots.

## Key Takeaways

- Pretraining is 99% of the compute; fine-tuning stages are cheap in comparison.
- Model power correlates with training tokens, not just parameter count (LLaMA-65B > GPT-3 175B).
- RLHF > SFT because comparing is cognitively easier than generating.
- Every prompt engineering technique compensates for a specific cognitive gap: CoT for insufficient per-token compute, self-consistency for no-backtrack, RAG for parametric memory limits.
- Default 2023 recommendation: GPT-4 + rich prompts + RAG first; optimize cost second; avoid rolling your own RLHF.
- Deploy LLMs as co-pilots with human oversight, not autonomous agents.

## See Also

- [[llm-api-statelessness]]
- [[master-claude-session-1]]
