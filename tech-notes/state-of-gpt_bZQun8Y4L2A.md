---
tags: [llm, gpt, training, rlhf, sft, prompt-engineering, rag, fine-tuning, tool-use, karpathy, transformer]
source: https://www.youtube.com/watch?v=bZQun8Y4L2A&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=8
wiki: wiki/concepts/state-of-gpt.md
---

# State of GPT | BRK216HFS

## Video Info
- URL: https://www.youtube.com/watch?v=bZQun8Y4L2A&list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&index=8
- Platform: YouTube / Microsoft Build 2023
- Title: State of GPT | BRK216HFS
- Speaker: Andrej Karpathy
- Channel/Event: Microsoft Developer · Microsoft Build 2023
- Upload date: 2023-05-25
- Duration: 42:40
- Views / likes: 757,694 views / 17,138 likes (at extraction time)
- Category and tags: LLMs, GPT, training pipeline, RLHF, prompt engineering

## Executive Summary
Andrej Karpathy (then at OpenAI, now independent) delivers a 42-minute practitioner's overview of GPT technology at Microsoft Build 2023. The first half walks through the four-stage training pipeline — pretraining → supervised fine-tuning (SFT) → reward modeling → reinforcement learning from human feedback (RLHF) — explaining exactly what data, algorithms, and compute go into each stage. The second half reframes prompting as compensating for the cognitive gap between human brains and transformer token simulators, covering chain-of-thought, self-consistency, reflection, RAG, tools, and constraint prompting. The talk closes with concrete default recommendations: start with GPT-4 + rich prompts; optimize costs only after you've hit top performance; avoid autonomous agents for now.

## Key Numbers / Quick Facts

| Fact | Value |
|---|---|
| GPT-3 parameters | 175B |
| GPT-3 training tokens | 300B |
| LLaMA-65B parameters | 65B |
| LLaMA-65B training tokens | 1.4T |
| LLaMA-65B training cost (rough) | 2,000 GPUs, ~21 days, several $M |
| Typical vocab size | ~50,257 tokens |
| Typical context length (2023) | 2K–4K (up to 100K emerging) |
| Transformer depth | ~80 layers |
| SFT dataset size | Tens of thousands of prompt-response pairs |
| RLHF Elo leaderboard (top) | GPT-4 >> Claude > GPT-3.5 > Vicuna > Koala |

## Outline

1. **Intro** — Two-part structure: how GPT assistants are trained, then how to use them effectively.
2. **GPT Assistant Training Pipeline** — Overview of the serial four-stage recipe: pretraining → SFT → reward modeling → RL.
3. **Data Collection & Tokenization** — Internet-scale data mixtures and BPE tokenization convert raw text to token integer sequences.
4. **Pretraining: Two Example Models** — GPT-3 and LLaMA comparison; training loop mechanics with the next-token prediction objective.
5. **Base Models & Their Limitations** — Base models learn powerful general representations but complete documents, not answer questions; GPT-2 era prompting tricks.
6. **RM Dataset Collection** — Shift from demonstrations to comparisons: contractors rank multiple SFT completions for the same prompt.
7. **Reward Model Training** — Train a scalar reward predictor; use pairwise ranking loss over contractor comparisons.
8. **RL Stage & Mode Collapse** — RLHF optimizes the SFT-initialized policy against the frozen reward model; why RLHF beats SFT (compare vs. generate asymmetry).
9. **Ensemble Multiple Attempts** — LLMs can't recover from bad token samples; sample multiple times and pick the best.
10. **Ask for Reflection & System 2 Prompting** — LLMs don't self-correct by default; Chain-of-Thought, Tree of Thought, and asking for strong solutions explicitly.
11. **Tool Use, RAG & Constraint Prompting** — Offload arithmetic to calculators, stuff context into the working memory window, force output format with Guidance.
12. **Default Recommendations** — Two-phase approach: maximize performance with GPT-4 first, then optimize cost; current LLM limitations and safe deployment posture.

## Detailed Chapter Summaries

### 1. Intro
> **Segment**: 0:00–0:58

Karpathy is introduced as an AI researcher and OpenAI founding member. He outlines a two-part talk:
- **Part 1**: How to train GPT assistants (the pipeline).
- **Part 2**: How to use these assistants effectively in applications.

### 2. GPT Assistant Training Pipeline
> **Segment**: 0:58–2:04

The training recipe has **four serial stages**, each with its own dataset, algorithm (all variants of language modeling), and output model:

1. **Pretraining** → base model
2. **Supervised Fine-tuning (SFT)** → SFT model
3. **Reward Modeling (RM)** → reward model
4. **Reinforcement Learning (RL)** → RLHF model (e.g., ChatGPT)

> "This is not to scale because [pretraining] is where all of the computational work basically happens — 99 percent of the training compute time."

The last three stages are fine-tuning stages requiring only a small number of GPUs and hours or days.

### 3. Data Collection & Tokenization
> **Segment**: 2:04–3:23

**Data mixture** (e.g., from Meta's LLaMA paper): CommonCrawl, C4, GitHub, Wikipedia, Books, arXiv, Stack Exchange — mixed and sampled in specific proportions.

**Tokenization**: Raw text is converted to integer sequences via an algorithm like Byte Pair Encoding (BPE), which iteratively merges text chunks into tokens. A vocabulary of ~50,257 tokens produces integer sequences that feed into the transformer.

### 4. Pretraining: Two Example Models
> **Segment**: 3:23–8:13

#### Key hyperparameters

| Model | Params | Tokens | GPUs | Time | Cost |
|---|---|---|---|---|---|
| GPT-3 | 175B | 300B | — | — | — |
| LLaMA-65B | 65B | 1.4T | 2,000 | ~21 days | ~$M |

> "You shouldn't judge the power of a model by the number of parameters that it contains."

LLaMA-65B outperforms GPT-3 despite fewer parameters because it trained on 1.4T vs. 300B tokens.

#### Training loop
- Pack tokenized documents into batches of shape `[B, T]` (batch size × context length), delimited with `<|endoftext|>` tokens.
- For each position, feed all preceding tokens into the transformer; predict the next token distribution over vocab (50,257 entries).
- Use cross-entropy loss at every position; this supervision signal updates all transformer weights.
- Repeat across many batches until the loss curve converges.

#### Concrete example
The New York Times trained a small GPT on Shakespeare. At random initialization: incoherent outputs. After extended training: coherent, stylistically consistent samples — the model learned word placement, punctuation, and sentence structure through next-token prediction alone.

### 5. Base Models & Their Limitations
> **Segment**: 8:13–13:24

#### Downstream fine-tuning (GPT-1 era)
Pretraining produces models with powerful general representations. A sentiment classifier that previously required a dedicated NLP model can now be built with only a few labeled examples fine-tuned on top of a pretrained transformer.

#### Few-shot prompting (GPT-2 era)
Instead of fine-tuning, "trick" the model by constructing a fake document (e.g., Q, A, Q, A, Q — then leave Q for the model to complete). This "few-shot prompt" technique launched the era of prompting over fine-tuning.

#### Base model vs. assistant model
| | Base model | Assistant model |
|---|---|---|
| Goal | Complete documents | Answer questions helpfully |
| Prompt `"Write a poem about bread and cheese"` | Returns more questions (continues the "document") | Writes the poem |
| Best use case | Generate N more things like N examples (e.g., Pokémon names) | General assistants |

Available base models (2023): GPT-3 as "Davinci" via API, GPT-2 weights on GitHub, LLaMA series (best open, not commercially licensed).

### 6. RM Dataset Collection
> **Segment**: 13:24–14:05

For reward modeling, data collection shifts from **demonstrations** to **comparisons**:
- Same prompt given to the SFT model → generate 3+ completions.
- Human contractors **rank** the completions.
- These rankings form pairs used as training signal (e.g., completion A > completion B > completion C).
- Note: ranking is hard — some comparisons take contractors hours per prompt.

### 7. Reward Model Training
> **Segment**: 14:05–18:47

The reward model is trained to output a **scalar reward** for any (prompt, completion) pair:

1. Append a special `[REWARD]` token at the end of each completion.
2. Supervise only at that token — predict a quality score.
3. For each group of completions for a prompt, enforce that higher-ranked completions receive higher scores via a ranking-consistent loss.

Result: a model that can score any completion for any prompt — enabling the RL stage.

### 8. RL Stage, Why RLHF > SFT, and Mode Collapse
> **Segment**: 18:47–25:50

#### RLHF RL loop
- Initialize RL policy from SFT model.
- For each prompt, sample completions from the current policy.
- Score completions using the **frozen** reward model.
- Update policy weights to increase probability of high-reward completions (language modeling loss weighted by reward).
- Repeat over many batches.

ChatGPT = RLHF model. Vicuna-13B = SFT model.

#### Why RLHF works better than SFT

The key is **asymmetry between comparing and generating**:
> "Imagine being a contractor trying to write a nice haiku for a paper clip. You might not be very good at that, but if I give you a few examples of haikus you might be able to appreciate some a lot more than others. Judging which one is good is a much easier task."

Comparisons allow humans to express judgment more accurately than demonstrations, creating a better training signal.

#### RLHF trade-off: entropy loss
RLHF models produce **more peaked, less diverse** outputs than base models. For tasks that require diversity (e.g., "generate N more things like these"), a base model is preferable. Karpathy demos this with a few-shot Pokémon name generation prompt — the base model generates many diverse fictitious names.

#### 2023 Elo leaderboard (Berkeley)
1. GPT-4 (RLHF) — by far the best
2. Claude (RLHF)
3. GPT-3.5 (RLHF)
4. Vicuna-13B (SFT)
5. Koala (SFT)

### 9. Ensemble Multiple Attempts
> **Segment**: 25:50–26:47

LLMs are **token simulators**: each token is sampled independently with roughly equal compute per step. If the model samples a bad token, it cannot backtrack — it's stuck continuing a suboptimal path.

**Fix**: sample multiple completions, then select the best via:
- Majority vote (for classification/factual tasks)
- Self-consistency: pick the answer that appears most often across completions
- Reward model scoring: use the trained RM to pick the best completion

> "Unlike you, they cannot recover from [a bad token]. They are stuck with every single token they sample and so they will continue the sequence, even if they know this sequence is not going to work out."

### 10. Ask for Reflection & System 2 Prompting
> **Segment**: 26:47–32:13

#### LLMs don't self-check by default
> "You have to make up for that in your prompts. If you don't ask it to check, it's not going to check by itself — it's just a token simulator."

Example: ask GPT-4 to write a non-rhyming poem → it rhymes anyway. Ask "did you meet the assignment?" → GPT-4 correctly identifies the failure and offers to retry. But it won't do this unprompted.

#### Chain-of-Thought (CoT)
- Spread reasoning across more tokens: "Let's think step-by-step" forces the model to show its work.
- Better: **"Let's work this out in a step-by-step way to be sure we have the right answer"** — explicitly conditions on success, preventing the model from hedging probability mass on low-quality solutions.

#### Ask for expertise explicitly
> "Feel free to ask for a strong solution. Say something like, 'you are a leading expert on this topic, pretend you have IQ 120.'"

But don't overclaim: "IQ 400" may be out of distribution or land in sci-fi roleplay territory.

#### System 1 vs. System 2 analogy
- **System 1** (fast, automatic) = LLM sampling tokens
- **System 2** (slow, deliberate) = needs to be recreated via prompting

#### Tree of Thought (2023 paper)
Maintain multiple completion branches simultaneously, score each branch along the way, prune and expand like Monte Carlo Tree Search. Karpathy draws the parallel to **AlphaGo**: policy (LLM) + MCTS (Tree of Thought) = stronger reasoning. Requires Python glue code orchestrating multiple prompt calls in a loop, not a single prompt.

AutoGPT (inspirational but not production-ready): LLM maintains a task list and recursively breaks down tasks.

ReAct (paper): structures completions as **thought → action → observation** rollouts, with tool calls embedded in the action step.

### 11. Tool Use, RAG & Constraint Prompting
> **Segment**: 32:13–37:15

#### Why LLMs need tools
LLMs don't know what they don't know — they'll attempt mental arithmetic they can't do reliably. Explicitly instruct them:
> "You are not very good at mental arithmetic. Whenever you need to do very large number addition, use this calculator. Here's how you use it..."

Tools to offload: calculators, code interpreters, search engines.

#### Retrieval-Augmented Generation (RAG)
The context window is the model's **working memory**. Load it with relevant data → the model can directly attend to it.

Recipe:
1. Chunk documents into passages.
2. Embed all chunks into a vector store (e.g., LlamaIndex).
3. At query time: embed the query → retrieve top-k similar chunks → inject into the prompt → generate.

> "Transformers definitely want to [look things up]. You have some memory over how some documentation works but it's much better to look it up."

#### Constraint prompting
Tools like **Guidance** (from Microsoft) enforce output format by manipulating token probabilities: clamp certain positions to fixed tokens (e.g., JSON structure), let the model only fill in variable slots. Guarantees valid structured output.

#### Fine-tuning guidance
- **LoRA** (Low-Rank Adaptation): train only small, sparse adapters on top of a frozen base model; much cheaper and accessible.
- **SFT**: achievable but slower iteration cycle; requires data contractors or synthetic pipelines.
- **RLHF**: "very much research territory" — unstable, hard to reproduce, not beginner-friendly. Karpathy advises against rolling your own.

### 12. Default Recommendations
> **Segment**: 37:15–42:40

#### Two-phase approach

**Phase 1: Maximize performance**
- Use GPT-4 (far ahead of alternatives as of mid-2023)
- Write detailed prompts with full task context and instructions ("what would you tell a contractor who can't email you back?")
- Add relevant context via RAG
- Use few-shot examples ("show, don't just tell")
- Experiment with tools/plugins to offload LLM-hard tasks
- Consider chains, reflection loops, and multiple samples

**Phase 2: Optimize cost**
- Try lower-capacity models (GPT-3.5 etc.)
- Shorten prompts
- Explore fine-tuning with SFT (not RLHF unless you have research resources)

#### Current LLM limitations
- Bias, hallucination, reasoning errors
- Knowledge cutoff (Sep 2021 at time of talk)
- Susceptible to prompt injection, jailbreaks, data poisoning
- Struggle with entire classes of tasks

#### Deployment posture
> "Use LLMs in low-stakes applications. Combine them always with human oversight. Use them as a source of inspiration and suggestions — think co-pilots, instead of completely autonomous agents performing tasks somewhere."

## Playbook

### Understand the Training Stack Before Deploying
- **Key idea**: GPT assistants are built through 4 serial stages — pretraining handles 99% of compute; RLHF is what makes the model helpful.
- **Why it matters**: The training stage determines what the model "is" — base vs. SFT vs. RLHF models have fundamentally different behavior profiles.
- **How to apply**: Recognize that ChatGPT/GPT-4 = RLHF models; Vicuna/Koala = SFT models; GPT-3 "Davinci" = base model. Don't use a base model for interactive assistants — it completes documents, not queries.

### Treat LLMs as Token Simulators, Not Reasoners
- **Key idea**: Transformers allocate roughly equal compute per token, have ~80 reasoning layers, and cannot backtrack from a bad sample.
- **Why it matters**: Asking a single-token answer to a multi-step reasoning question will fail — there's insufficient compute per token to solve it.
- **How to apply**: Use CoT ("let's work this out step-by-step"), sample multiple completions, and let the model show its work across many tokens before outputting the final answer.

### Recreate System 2 Thinking via Prompting
- **Key idea**: LLMs default to fast System 1 (token sampling); deliberate System 2 reasoning must be orchestrated via prompts + Python glue code.
- **Why it matters**: Techniques like Tree of Thought, ReAct, and self-consistency can dramatically improve accuracy on hard tasks.
- **How to apply**: Don't just write a single prompt — design a loop. Sample multiple branches, score them (with the RM or via GPT-4 critique), and keep the best. Think AlphaGo policy + MCTS.

### Ask for What You Actually Want
- **Key idea**: LLMs imitate training data, which contains both low-quality and high-quality solutions. They don't default to the best unless you ask.
- **Why it matters**: "Let's think step-by-step to be sure we have the right answer" outperforms "let's think step-by-step" because it explicitly conditions on success.
- **How to apply**: Say "you are a leading expert," "IQ 120," "let's make sure we get the right answer." Also explicitly prompt for reflection: "did you meet the assignment? If not, revise."

### RAG > Bigger Model for Knowledge Tasks
- **Key idea**: The context window is the model's working memory — stuffing relevant docs into it is more reliable than hoping parametric memory is accurate.
- **Why it matters**: LLMs have knowledge cutoffs and can hallucinate; retrieved ground truth in-context is immediately accessible via self-attention.
- **How to apply**: For any knowledge-intensive task, embed your documents (LlamaIndex, etc.), retrieve top-k chunks at query time, inject into the prompt before generating.

## Key Quotes

| Quote | Speaker | Context |
|---|---|---|
| "This is 99 percent of the training compute time and also flops." | Andrej Karpathy | On the pretraining stage vs. fine-tuning stages |
| "You shouldn't judge the power of a model by the number of parameters it contains." | Andrej Karpathy | Comparing LLaMA-65B (stronger) vs. GPT-3 175B |
| "These transformers need tokens to think." | Andrej Karpathy | Explaining why Chain-of-Thought works |
| "LLMs don't want to succeed, they want to imitate. You want to succeed, and you should ask for it." | Andrej Karpathy | On conditioning prompts for high quality |
| "Unlike you, they cannot recover from [a bad token]. They are stuck with every single token they sample." | Andrej Karpathy | Motivating self-consistency and multiple sampling |
| "If you don't ask it to check, it's not going to check by itself — it's just a token simulator." | Andrej Karpathy | On the need for reflection prompts |
| "Think co-pilots, instead of completely autonomous agents performing a task somewhere." | Andrej Karpathy | Recommended deployment posture for 2023 |
| "You have some memory over how some documentation works but it's much better to look it up." | Andrej Karpathy | Making the case for RAG over parametric memory |

## Source Notes
- Transcript source: `subtitle-vtt` (en-US, manual captions from `bZQun8Y4L2A.en-US.vtt`)
- Cookie-auth retry: used (via proxy, YouTube default path)
- Data gaps: playlist-level metadata extracted instead of single-video metadata by extractor; video metadata recovered from playlist `entries` in `raw_metadata.json`. All chapter timestamps sourced from there.
