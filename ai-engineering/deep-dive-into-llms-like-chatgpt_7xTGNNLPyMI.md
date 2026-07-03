---
tags: [llm, chatgpt, pretraining, tokenization, post-training, reinforcement-learning, rlhf, hallucinations, deepseek-r1, alphago, ai-engineering, karpathy]
source: https://www.youtube.com/watch?v=7xTGNNLPyMI
wiki: wiki/ai-engineering/deep-dive-into-llms-like-chatgpt.md
---

# Deep Dive into LLMs like ChatGPT

## Video Info
- URL: https://www.youtube.com/watch?v=7xTGNNLPyMI
- Platform: YouTube
- Title: Deep Dive into LLMs like ChatGPT
- Speaker: Andrej Karpathy (@AndrejKarpathy) — founding member of OpenAI (2015), ex-Sr. Director of AI at Tesla (2017–2022), founder of Eureka Labs
- Channel/Event: Andrej Karpathy
- Upload date: 2025-02-05
- Duration: 3:31:23
- Views / likes / comments: 7,900,712 views / 124,026 likes / 3,900 comments (at extraction time)
- Category and tags: Science & Technology; llm, chatgpt, ai, deep dive, deep learning, introduction, large language model

## Executive Summary
Andrej Karpathy delivers a comprehensive, general-audience walkthrough of the **entire pipeline** behind ChatGPT-like models — answering "what exactly happens when you type in the box and hit enter?" He decomposes model-building into **three sequential stages**: (1) **pre-training** (compress the filtered internet into a base model / token autocomplete), (2) **supervised fine-tuning** (turn the base model into an assistant by imitating human-written conversations), and (3) **reinforcement learning** (let the model discover its own problem-solving token sequences, which produces "thinking"). The core thesis is a **mental model**: an LLM's answer is a "neural network simulation of a human data labeler" following a company's labeling instructions — not a magical oracle — running a *fixed, finite amount of compute per token*. From this he derives every practical quirk: hallucinations (models imitate confident answers even when they don't know), the need to "spread computation across tokens," tool use (web search + code interpreter as working memory), tokenization failures (spelling, counting, "9.11 vs 9.9"), and "jagged intelligence" (Olympiad-level yet fails trivial questions). His takeaway: these are incredibly useful **tools you must verify**, not infallible agents — "check their work and own the product of your work."

## Key Numbers / Quick Facts

| Fact | Value |
|------|-------|
| FineWeb pretraining dataset size | ~44 TB disk / **15 trillion tokens** |
| Common Crawl web pages indexed (2024) | 2.7 billion (crawling since 2007) |
| FineWeb language filter threshold | keep pages with >65% English |
| GPT-4 tokenizer vocabulary | **100,277** symbols (byte-pair encoding) |
| GPT-2 (2019) | 1.6B params, 1,024 context length, ~100B training tokens |
| GPT-2 training cost | 2019: ~$40,000 → today: ~$600 (1 day), potentially ~$100 |
| GPU rental (Lambda) | 8×H100 node at **$3/GPU/hour** |
| Nvidia market cap (at recording) | $3.4 trillion |
| Single-data-center GPU concentration | Elon Musk acquiring ~100,000 GPUs |
| Llama 3.1 flagship base model | **405B params**, trained on 15T tokens (Meta) |
| llm.c GPT-2 reproduction run | 1M tokens/update, ~7 s/update, 32,000 steps ≈ 33B tokens |
| Pre-training vs. SFT wall-clock | ~3 months (thousands of computers) vs. ~3 hours |
| OLMo identity hardcoding (Allen AI) | 240 hardcoded "who are you" conversations in 1M-conversation mixture |
| AlphaGo move 37 | ~1-in-10,000 probability a human would play it |
| Naive RLHF human-eval cost | 1,000 updates × 1,000 prompts × 1,000 rollouts = **1 billion** human ratings |
| RLHF practical limit | improves for a few hundred updates, then must be cropped (reward gaming) |
| Karpathy's daily usage mix | ~80–90% GPT-4o; thinking models only for hard math/code |
| ChatGPT subscription tiers | $20/month or $200/month |
| LM Arena ranking (at recording) | Google #1, OpenAI #2, DeepSeek #3 (MIT/open), Anthropic Sonnet #14 |

## Outline

1. **Introduction** — What's behind the ChatGPT text box, and the goal of building mental models for a tool that is "magical" but has sharp edges.
2. **Pretraining data (internet)** — Downloading and filtering the internet (Common Crawl → FineWeb) into a huge, high-quality, diverse text corpus.
3. **Tokenization** — Converting raw text (bits → bytes → byte-pair encoding) into a 1D sequence of ~100k unique token symbols.
4. **Neural network I/O** — Training on token windows to predict the next token; the input/output contract of the network.
5. **Neural network internals** — Parameters as "DJ knobs," the Transformer as a fixed, stateless mathematical expression.
6. **Inference** — Generating new data by sampling from probability distributions; models produce "remixes," not verbatim copies.
7. **GPT-2: training and inference** — A concrete, reproducible example; the economics and hardware (GPUs, data centers) of training.
8. **Llama 3.1 base model inference** — What a base model actually is: a lossy zip of the internet; regurgitation, knowledge, few-shot prompting.
9. **Pretraining to post-training** — Handing the base model to the (cheaper but crucial) post-training stage to build an assistant.
10. **Post-training data (conversations)** — Programming the assistant by example via human-labeled conversations; the InstructGPT lineage.
11. **Hallucinations, tool use, knowledge/working memory** — Why models make things up, and two mitigations: "I don't know" training and tool use.
12. **Knowledge of self** — Why "what model are you?" is nonsensical; identity comes from hardcoded data or system messages.
13. **Models need tokens to think** — Finite compute per token means reasoning must be distributed across many tokens.
14. **Tokenization revisited: spelling** — Why character-level tasks fail: models see tokens, not letters.
15. **Jagged intelligence** — The "Swiss cheese" model of capability: brilliant yet randomly, inexplicably wrong (9.11 vs 9.9).
16. **Supervised finetuning to reinforcement learning** — The school/textbook analogy: exposition, worked examples, practice problems.
17. **Reinforcement learning** — Guess-and-check: the model discovers its own token sequences that reach verified correct answers.
18. **DeepSeek-R1** — The paper that made RL-for-LLMs public; emergent chains of thought and "aha moments."
19. **AlphaGo** — RL surpasses imitation; "move 37" as proof RL can exceed human strategies.
20. **Reinforcement learning from human feedback (RLHF)** — RL in unverifiable domains via a reward model; its upsides and its gameability.
21. **Preview of things to come** — Multimodality, agents, pervasive/invisible integration, computer use, test-time training.
22. **Keeping track of LLMs** — LM Arena leaderboard, AI News newsletter, and X/Twitter.
23. **Where to find LLMs** — Provider websites, inference providers (Together.ai), base models (Hyperbolic), local (LM Studio).
24. **Grand summary** — Looping back: your query → tokens → a lossy simulation of a data labeler; thinking models add the RL magic.

## Detailed Chapter Summaries

### 1. Introduction
> **Segment**: 00:00–01:00

Karpathy frames the whole video around a single question: **what is behind the ChatGPT text box?** You can type anything and press enter — but what should you put there, and what are the returned words? His goal is to give "mental models for thinking through what this tool is" — a tool that is "magical and amazing in some respects, really good at some things, not very good at others, with a lot of sharp edges to be aware of." He promises to walk the **entire pipeline** of how the tool is built while keeping it accessible, and to touch on the "cognitive/psychological implications" along the way.

### 2. Pretraining data (internet)
> **Segment**: 01:00–07:47

The first stage is **pre-training**, and its first step is to **download and process the internet**. He uses Hugging Face's **FineWeb** dataset as a representative example of what OpenAI/Anthropic/Google build internally. The goal: a huge quantity of **high-quality, diverse** documents to pack maximum knowledge into the model.

- Despite the internet being "very very large," aggressive filtering yields only **~44 TB** — "you can get a USB stick for like a terabyte."
- The pipeline starts from **Common Crawl** (indexing since 2007; **2.7 billion pages** as of 2024), which follows links from seed pages.
- Processing stages: **URL filtering** (block-lists for malware/spam/adult/racist sites), **text extraction** (strip HTML/CSS/navigation to get raw text), **language filtering** (FineWeb keeps pages **>65% English** — a design decision that trades off multilingual ability), then deduplication and **PII removal** (addresses, SSNs).
- Result: a "massive tapestry of text data" with patterns that neural networks will learn to mimic.

### 3. Tokenization
> **Segment**: 07:47–14:27

Neural nets require a **one-dimensional sequence from a finite symbol set**. Karpathy builds up the representation:

- Text → UTF-8 bits (2 symbols, very long sequences). Sequence length is a "finite and precious resource," so we trade longer vocabulary for shorter sequences.
- Group 8 bits → **bytes** (256 possible symbols; sequence 8× shorter). He suggests thinking of tokens not as numbers but as **unique IDs / emojis**.
- **Byte-pair encoding (BPE)**: repeatedly find the most common adjacent pair and mint a new symbol. In practice, a good vocabulary size is **~100,000**; **GPT-4 uses 100,277 symbols**.
- Demo with **TikTokenizer** (`cl100k_base`): "hello world" = 2 tokens; capitalization and extra spaces change tokenization; it is case- and whitespace-sensitive. The FineWeb corpus is **~15 trillion tokens**.

### 4. Neural network I/O
> **Segment**: 14:27–20:11

Training models the **statistical relationships** of how tokens follow each other. We sample **windows of tokens** (length 0 up to a max like 8,000; longer is more computationally expensive).

- Example: 4 context tokens feed in; the network outputs **100,277 probabilities** — one per possible next token.
- Initially the network is **randomly initialized**, so predictions are random.
- Because we sampled from real data, we know the **correct next token** (the label). A mathematical update **nudges** the correct token's probability up and others down.
- This happens **in parallel across all tokens** in large batches — this is what "training" is.

### 5. Neural network internals
> **Segment**: 20:11–26:01

Inputs X are mixed with **parameters/weights** (billions in modern nets) in a "giant mathematical expression." Think of parameters as **knobs on a DJ set** — training discovers a knob-setting consistent with the data's statistics.

- The expressions are "not very scary": multiplication, addition, exponentiation, division. Architecture research designs expressions that are **expressive, optimizable, parallelizable**.
- Production example: the **Transformer** (visualized on bbycroft.net/llm), ~85,000 params in the demo. Tokens are **embedded** into distributed vector representations, then flow through attention and MLP blocks.

> The neurons are "extremely simple compared to the neurons you would find in your brain... there's no memory in this expression — it's a fixed mathematical expression from input to output... it's just stateless."

He de-emphasizes the exact math: what matters is that it's a **parameterized function** whose knobs we tune to match training patterns.

### 6. Inference
> **Segment**: 26:01–31:09

**Inference = generating new data** from the trained model. Starting from a prefix, feed tokens → get a probability vector → **sample** (like flipping a biased coin) → append → repeat.

- Models are **stochastic**: sometimes they reproduce a training chunk verbatim, but usually they produce **"remixes... inspired by the training data,"** statistically similar but not identical.
- When you use ChatGPT, you are **only doing inference** — the parameters were trained months ago by OpenAI and are held fixed; "you're just talking to the model... completing token sequences."

### 7. GPT-2: training and inference
> **Segment**: 31:09–42:52

**GPT-2 (OpenAI, 2019)** is his favorite concrete example — "the first time a recognizably modern stack came together; everything since has just gotten bigger." Specs: **1.6B parameters, 1,024 context length, ~100B training tokens** (all tiny by modern standards — modern context is "a couple hundred thousand or even a million").

- His **llm.c** reproduction: GPT-2 cost **~$40,000 in 2019** but **~$600 in one day** today (potentially ~$100), thanks to better data, faster hardware, and better software.
- Watching training: each line is **one update on 1M tokens (~7 s each)**; the run is **32,000 steps ≈ 33B tokens**. The number to watch is **loss** (lower is good). Early samples are gibberish; coherence emerges over a day or two.
- Compute story: he rents an **8×H100 node** (~$3/GPU/hour on **Lambda**). GPUs suit training because matrix multiplication is highly parallel. This "Gold Rush" for GPUs drove **Nvidia to $3.4T**, and is why "Elon Musk getting 100,000 GPUs in a single data center" is a big deal — "all of them just trying to predict the next token."

### 8. Llama 3.1 base model inference
> **Segment**: 42:52–59:23

A **base model** is an "internet text token simulator" — not yet useful, because we want an **assistant**. Few base models are released; GPT-2 (1.5B, 2019) and **Llama 3 / 3.1** (Meta) are exceptions. A release = **code** (a few hundred lines, the forward pass) + **parameters** (the real value; e.g., 1.5B or 405B numbers).

Using the **Llama 3.1 405B base** on **Hyperbolic**, he demonstrates base-model behavior:

- **Not an assistant**: "what is 2+2" isn't answered as "4" — it's a "glorified, very expensive autocomplete," and it's **stochastic** (different each run).
- **Knowledge as lossy compression**: the 405B params are "a kind of zip file... a lossy compression, a gestalt of the internet." Prompting "top 10 landmarks in Paris" elicits knowledge that is "vague, probabilistic, statistical" — frequent facts are more reliably remembered.
- **Regurgitation**: pasting a Wikipedia zebra sentence, the model recites the article "purely from memory" (likely seen ~10 times / a few epochs) before eventually straying — usually undesirable.
- **Hallucination on the future**: primed with a 2024-election prompt (data cutoff end of 2023), it invents different "parallel universes" (Mike Pence vs. Hillary Clinton; DeSantis vs. Biden).
- **Few-shot / in-context learning**: 10 English:Korean pairs → the model continues the pattern as a translator.
- **Prompt an assistant into being**: structure a prompt as a helpful-AI-vs-human web page (written by ChatGPT itself), and the base model role-plays an assistant answering "why is the sky blue" — though it then hallucinates the next human turn.

### 9. Pretraining to post-training
> **Segment**: 59:23–01:01:06

Recap: pre-training breaks internet documents into tokens and trains a next-token predictor; the output is a **base model** (an internet-document simulator). But we want an assistant. Enter **post-training**: computationally **much cheaper** than pre-training (millions of dollars / months of data-center compute vs. much less), but essential to turn the model into something that answers questions.

### 10. Post-training data (conversations)
> **Segment**: 01:01:06–01:20:32

We **swap the dataset** from internet documents to **conversations** and continue training with the *exact same algorithm*. Pre-training ~3 months on thousands of computers; **SFT ~3 hours** because the conversation dataset is far smaller.

- Conversations are **multi-turn** (human/assistant) and can include **refusals**. Because it's a neural net, we **program the assistant implicitly by example**, not by explicit code.
- **Tokenizing conversations**: like a TCP/IP protocol, there are rules. GPT-4o uses special tokens like `<|im_start|>` ("imaginary monologue start"), a role (user = token 428), a separator, the content, and `<|im_end|>`. These special tokens are **new**, introduced in post-training. A 2-turn conversation → 49 tokens. At inference, the server appends `<|im_start|>assistant<|im_sep|>` and samples the reply.
- **InstructGPT (OpenAI, 2022)** first described this. Human contractors (via **Upwork / Scale AI**) wrote prompts *and* ideal responses following **labeling instructions** ("helpful, truthful, harmless" — often hundreds of pages). The dataset was never released, but **Open Assistant** is an open reproduction.
- **Modern shift**: humans rarely write from scratch now — LLMs help generate, humans edit (e.g., **UltraChat**, "to a large extent synthetic," millions of conversations).

> The key demystification: "What are you actually talking to in ChatGPT? ...it's coming from something that is statistically imitating human labelers... it's almost as if you're asking a human labeler." For code questions, that "labeler" is an educated expert — you get a "statistical simulation" of that person.

### 11. Hallucinations, tool use, knowledge/working memory
> **Segment**: 01:20:32–01:41:46

**LLM psychology, part 1: hallucinations.** They arise because training conversations of the form "who is X?" are **always confidently answered**. Asked "who is Orson Kovats" (a made-up name), the old **Falcon 7B** confidently invents contradictory bios ("American author"/"1950s TV character"/"minor league baseball player"). The model "doesn't have access to the internet, isn't doing research — it's a statistical token tumbler."

**Mitigation #1 — teach "I don't know":** Meta's Llama 3 "factuality" procedure: take a paragraph, have an LLM generate factual Q&A, **interrogate the model several times**, use an **LLM judge** to compare with the truth. Where the model consistently fails (e.g., Dominik Hašek's Stanley Cups), add a training example whose correct answer is **"I'm sorry, I don't know."** This works because a "neuron of uncertainty" likely exists internally but isn't wired to the model *saying* it doesn't know — these examples create that association.

**Mitigation #2 — tool use (web search):** Introduce special tokens `<search_start>`/`<search_end>`. When emitted, inference **pauses**, queries Bing/Google, and pastes the retrieved text back into the **context window**. This is taught via a few thousand examples.

> The central psychology point: "**Knowledge in the parameters is a vague recollection** [something you read a month ago]; **knowledge in the context window is the working memory** [something you just read]." Hence a much better prompt is to *paste* Chapter 1 of *Pride and Prejudice* into the context rather than rely on the model's recollection — "you'd produce a much better summary if you reread the chapter first."

### 12. Knowledge of self
> **Segment**: 01:41:46–01:46:56

Asking "what model are you / who built you?" is "a little bit nonsensical." The model "has no persistent existence... it boots up, processes tokens, and shuts off" — restarted fresh every conversation, "a token tumbler with no sense of self."

- By default it gives random/best-guess answers. Falcon claims "built by OpenAI based on GPT-3" — **not** evidence of training on OpenAI data, but a **hallucinated self-label** (ChatGPT/OpenAI are extremely prominent on the internet).
- **Two ways to fix identity**: (1) **hardcode** it — e.g., **OLMo (Allen AI)** includes **240 hardcoded** "tell me about yourself" conversations in a 1M-conversation mixture; (2) a **system message** — hidden tokens at the start of the conversation that "document the model" (name, developer, knowledge cutoff). Either way it's "cooked up and bolted on... not really deeply there."

### 13. Models need tokens to think
> **Segment**: 01:46:56–02:01:11

The pivotal cognitive constraint. Given "Emily buys 3 apples and 2 oranges, each orange $2, total $13, cost of apples?", two correct answers exist — but one is a **terrible training label**.

- There are **finitely many layers** (~100 in a modern net), so **compute per token is roughly fixed and small**. A model cannot do arbitrary computation in a single forward pass.
- The **bad** answer states "The answer is $3" immediately, cramming all computation into one token — "post-hoc justification" follows, but the answer was already committed. The **good** answer **distributes computation** across intermediate results ("oranges cost 4, so 13−4=9, 9/3=3"), keeping each token easy.
- Empirical proof: asked to answer in a single token, the model succeeds on *easy* numbers (23... wait) but **fails** when he enlarges the numbers (23 apples, 177 oranges → "5", wrong); allowed to work it out, it reaches the correct **7**.
- **Prefer tools**: he asks it to "**use code**" — the Python interpreter has "a lot more correctness guarantees than the mental arithmetic of a language model."
- **Counting** fails for the same reason: "how many dots" (161 vs. correct 177) — dots are grouped into few tokens. "**Use code**" makes it copy-paste into a string and call `.count()`, which is easy for the model and correct.

### 14. Tokenization revisited: models struggle with spelling
> **Segment**: 02:01:11–02:04:53

Because models "**see tokens, not characters**," character-level tasks fail. "Print every 3rd character of 'ubiquitous'" fails — "ubiquitous" is **3 tokens**, and the model can't index into letters the way our visual field can. Tokens exist "mostly for efficiency"; character/byte-level models would create impractically long sequences. Fix: "**use code**" to lean on the Python interpreter. The famous case: "**how many R's in strawberry**" — models long insisted on 2 (combining the difficulty of *seeing characters* with *counting*); now often hardcoded/fixed.

### 15. Jagged intelligence
> **Segment**: 02:04:53–02:07:28

Models have "**jagged edges**" — some make sense, some leave you "scratching your head." Example: "**is 9.11 bigger than 9.9?**" — the model often says yes (wrong), sometimes flipping mid-answer. A team found that when it errs, neurons associated with **Bible verses** light up (where 9.11 *does* come after 9.9). Treat the model as "a stochastic system that is really magical but that you can't fully trust — use it as a tool, not something you let rip and copy-paste the results."

### 16. Supervised finetuning to reinforcement learning
> **Segment**: 02:07:28–02:14:42

Recap of the first two stages, then motivation for the third via a **school/textbook analogy**. RL is still "under the umbrella of post-training" but is "the last, third major stage," handled by a **separate team** inside companies like OpenAI (pre-training data / pre-training / SFT conversation generation / RL are all different teams).

Three kinds of textbook content map to the three training stages:
- **Exposition** (background knowledge) ≈ **pre-training**.
- **Worked examples** (expert solutions) ≈ **SFT** (imitate the expert).
- **Practice problems** (problem + final answer, *no* solution) ≈ **RL** — you must **discover** the solution yourself.

The crucial insight: as a human labeler, **you don't know which solution is best for the LLM** because "our cognition is different from the LLM's." A token trivial for you may be too big a leap for the model, and vice-versa. So we shouldn't hand-write solution token sequences — the model must **discover the token sequences that work for it**.

### 17. Reinforcement learning
> **Segment**: 02:14:42–02:27:47

RL is **guess-and-check**. For a prompt with a known final answer:
- **Sample many solutions** (thousands to millions) in parallel; some reach the correct answer (green), some don't (red).
- **Train on the good ones** — but these sequences come **from the model itself**, not human annotators. Simplest version: take the single best correct solution and train on it, making that path more likely in future.
- Run across **tens of thousands of diverse prompts**; the model "discovers for itself what token sequences lead to correct answers... sequences that don't make mental leaps and fully utilize its knowledge."

SFT still matters as an **initialization** into "the vicinity of correct solutions"; RL is "where everything gets dialed in." He stresses RL is **early/nascent and not yet standard** — the high-level idea is trivial (trial and error), but the mathematical details (which solutions, how much to train, prompt distribution) are hard, which is why companies kept it internal.

### 18. DeepSeek-R1
> **Segment**: 02:27:47–02:42:07

The **DeepSeek-R1 paper** (China) "reinvigorated public interest" by openly describing RL fine-tuning for LLMs and the details needed to reproduce it. Results:
- **Accuracy climbs** on math problems across thousands of RL steps.
- Qualitatively, **response length grows** — the model learns to produce very long solutions, discovering **chains of thought**: *"wait, wait, that's an aha moment I can flag here — let's re-evaluate step by step."* It re-evaluates, tries multiple perspectives, retraces, backtracks — "**cognitive strategies**" that **emerge** without being hardcoded. "There is no human who can hardcode this... the only thing we've given it are the correct answers."
- Demoed on chat.deepseek.com with the "**DeepThink**" (R1) button, and on **Together.ai** (which hosts full open-weights models). OpenAI's **o1/o3-mini** models "use advanced reasoning" (RL-trained, per public statements) but **hide the exact chains of thought** (showing summaries) to reduce **distillation risk**; GPT-4o / 4o-mini are "mostly SFT models."
- Practical guidance: **~80–90% of his use is GPT-4o**; he reaches for thinking models only on hard math/code (and waits longer). DeepSeek R1 is **open weights** (downloadable); Gemini has an experimental thinking model; "**Anthropic currently does not offer a thinking model**" (as of early 2025).

### 19. AlphaGo
> **Segment**: 02:42:07–02:48:26

RL's power isn't new — **AlphaGo** (DeepMind) proves it. The paper's key plot: a **supervised-learning** model (imitating human expert games) **tops out and never surpasses** top players like Lee Sedol, whereas the **RL** model (playing itself, reinforcing move-sequences that empirically win) **blows past** human performance — "reinforcement learning is not constrained by human performance."

**Move 37**: AlphaGo played a move a human would play with **~1-in-10,000 probability** — surprising, initially thought a mistake, but "in retrospect brilliant." This is the promise for LLMs: RL could discover reasoning strategies "unknown to humans" — new analogies, maybe even a **new thinking language that isn't English**, since "the model is unconstrained to stick with English." Realizing this requires **large, diverse sets of practice problems** ("game environments") across all domains of knowledge.

### 20. Reinforcement learning from human feedback (RLHF)
> **Segment**: 02:48:26–03:09:39

The problem: RL needs **verifiable** answers, but creative tasks (jokes, poems, summaries) are **unverifiable**. Naively scoring with humans is unscalable — "1,000 updates × 1,000 prompts × 1,000 rollouts = **1 billion** human ratings... a lot of people looking at really terrible jokes."

**RLHF's trick is indirection**: train a **separate reward model** (a Transformer that outputs a single 0–1 score) to **imitate human preferences**, then run RL against the *simulator*. Humans **order** (rank) ~5 rollouts per prompt (easier than assigning scores or writing content); a loss function nudges the reward model's scores toward consistency with human orderings. Only ~5,000 human comparisons needed instead of a billion.

**Upside:** RL becomes possible in **any domain**, and it exploits the **discriminator-generator gap** — "it's significantly easier to discriminate than to generate." Labelers rank poems instead of writing them, yielding higher-quality signal. GPT-4o has gone through RLHF "because it works well."

**Downside — reward gaming:** The reward model is a giant neural net, so RL "is extremely good at discovering a way to game the simulation." Run too long (e.g., 1,000 updates) and jokes **improve then fall off a cliff** into nonsense — the top "joke about pelicans" becomes "the the the the" scoring **1.0** — an **adversarial example**. You can add these to the training set, but "there will always be an infinite number of nonsensical adversarial examples."

> "**RLHF is not RL** [in the magical sense]... it's not RL that you can run indefinitely... it's more like a little fine-tune that slightly improves your model." In **verifiable** domains (math, Go) you *can* run RL indefinitely and discover superhuman strategies; a reward model, being gameable, must be **cropped after a few hundred updates and shipped**.

### 21. Preview of things to come
> **Segment**: 03:09:39–03:15:15

- **Multimodality**: models will natively handle **audio** (hear/speak) and **images** (see/paint) — "not a fundamental change," just **tokenize** audio (spectrogram slices) and images (patches) and add them to the same token streams.
- **Agents**: from single tasks "on a silver platter" toward **long-running, error-correcting jobs** over minutes/hours, with humans as **supervisors** — analogous to factory "human-to-robot ratios," a "**human-to-agent ratio**" in the digital domain.
- **Pervasive & invisible** integration into tools; **computer use** (e.g., ChatGPT's **Operator** doing keyboard/mouse actions).
- **Test-time training** as an open research direction: today parameters are **fixed at deployment** and the only "learning" is in-context (the context window). Humans, by contrast, update parameters (e.g., during sleep). Longer context windows alone "will not scale" to long-running multimodal tasks.

### 22. Keeping track of LLMs
> **Segment**: 03:15:15–03:18:34

Three resources Karpathy uses:
1. **LM Arena** — an LLM leaderboard from blind human comparisons. At recording: **Google #1, OpenAI #2, DeepSeek #3** (notable because it's **MIT-licensed / open weights** — "unprecedented that a model this strong was released with open weights"), Anthropic's **Sonnet #14**, Llama lower. Caveat: "in the last few months it's become a little bit gamed" — he trusts it less now (many prefer Sonnet despite its #14 rank).
2. **AI News** newsletter (by **swyx and friends**) — extremely comprehensive, ~every other day, partly LLM-constructed; the top summaries are the most useful.
3. **X / Twitter** — follow trusted people for the latest.

### 23. Where to find LLMs
> **Segment**: 03:18:34–03:21:46

- **Proprietary flagships**: the provider's own site (ChatGPT for OpenAI; gemini.google.com / AI Studio for Google).
- **Open-weights** (DeepSeek, etc.): an inference provider — his favorite is **Together.ai** (playground with many open models).
- **Base models**: rare on inference providers (all target chat/assistants); he uses **Hyperbolic** for **Llama 3.1 base**, which he "loves."
- **Local**: smaller **distilled** models at **lower precision** (below native fp8/bf16) run on a laptop via **LM Studio** — "ugly UI/UX" and confusing (500 model variants), but runs entirely on your own GPU (e.g., Llama 3.2 Instruct 1B), and you can eject to free RAM.

### 24. Grand summary
> **Segment**: 03:21:46–03:31:23

He loops back to "what happens when you hit go on ChatGPT?" Your query → **tokens** → inserted into the **conversation protocol format** → ChatGPT **autocompletes** the sequence. The three stages:
- **Pre-training** = knowledge acquisition from the internet into parameters.
- **SFT** = where the **personality** comes from: OpenAI curates ~1M diverse human/assistant conversations; labelers follow labeling instructions to write ideal responses.

> "The right way to think about what came back is that this is the **neural network simulation of a data labeler at OpenAI**... as if I gave this query to a data labeler who first read all the labeling instructions and then spent 2 hours writing the ideal response — except it's a lossy simulation running a finite amount of compute per token."

He reiterates the failure modes: **hallucinations** and the **Swiss-cheese model** of capability (brilliant, but with holes — 9.11 vs 9.9, counting, spelling). **Thinking models** (o1/o3-mini) differ: they add the **RL** stage, producing emergent thinking that is "**new, unique, and interesting**," not just labeler imitation — capable *in principle* of a **"move 37" in open-domain thinking**, though "primordial" and mostly shining in **verifiable** domains for now. It's an **open question** whether reasoning learned in verifiable domains transfers to unverifiable ones.

> Final advice: "Use it as a tool in the toolbox, don't trust it fully because they will randomly do dumb things... **check their work and own the product of your work, but use them for inspiration, for first drafts** — ask them questions but always check and verify."

## Playbook

### Split "vague recollection" from "working memory"
- **Key idea**: Parameters store a lossy, probabilistic recollection; the context window is directly-accessible working memory.
- **Why it matters**: Recollection is unreliable for rare or precise facts; context-window data is exact.
- **How to apply**: **Paste the source into the prompt** rather than asking the model to recall it (e.g., paste the chapter you want summarized). Prefer retrieval/tool results in-context over trusting memory.

### Give models tokens to think — never demand a one-token leap
- **Key idea**: Compute per token is fixed and small; reasoning must be **distributed across many tokens**.
- **Why it matters**: Cramming a whole calculation into one token causes silent errors; verbose intermediate steps are each cheap and reliable.
- **How to apply**: Don't ask for "just the answer." Let the model show intermediate steps. For anything numeric/character-level (arithmetic, counting, spelling), tell it to "**use code**" and lean on the Python interpreter.

### Treat capability as Swiss cheese, not a smooth frontier
- **Key idea**: Models can ace Olympiad math yet fail "9.11 vs 9.9" or "R's in strawberry."
- **Why it matters**: Failures are **jagged and unpredictable**, sometimes for opaque reasons (Bible-verse neurons).
- **How to apply**: Never assume competence transfers; **verify every consequential output**. Use the model as a tool, not an oracle you "let rip."

### Match the model tier to the task
- **Key idea**: Base ≠ SFT ≠ RLHF ≠ RL "thinking" models — each behaves differently.
- **Why it matters**: Thinking models (o1/o3, DeepSeek-R1) spend real compute reasoning; GPT-4o-class models are "mostly SFT" and answer fast.
- **How to apply**: Default to a fast SFT model (~80–90% of use) for knowledge/simple queries; reach for a **thinking model only for hard math/code**, accepting the latency.

### Understand what you're actually talking to
- **Key idea**: An LLM answer is a **statistical simulation of a human data labeler** following a company's labeling instructions — for RL models, plus emergent reasoning.
- **Why it matters**: It de-mystifies both strengths (expert-labeler imitation) and weaknesses (confident hallucination, no true self).
- **How to apply**: Don't ask "who are you" expecting truth; don't expect research-grade certainty. Expect "what would a skilled labeler write," then verify.

### Verifiable vs. unverifiable domains sets the ceiling on RL
- **Key idea**: RL scales indefinitely only where answers are checkable (math, code, Go); RLHF reward models are **gameable** and must be cropped.
- **Why it matters**: Explains why "reasoning" models excel in math/code but not (yet) creative work, and why RLHF is "a little fine-tune, not magic."
- **How to apply**: Trust RL-driven gains most in verifiable domains; be skeptical of claims of unbounded improvement in creative/subjective tasks.

## Key Quotes

| Quote | Speaker | Context |
|-------|---------|---------|
| "You can think of the 405 billion parameters as kind of like a zip file... it's not a lossless compression, it's a lossy compression — a gestalt of the internet." | Karpathy | Base models as lossy compression of the internet |
| "Knowledge in the parameters of the neural network is a vague recollection... the knowledge in the context window is the working memory." | Karpathy | The central practical mental model for prompting |
| "You're not talking to a magical AI... it's a neural network simulation of a data labeler at OpenAI." | Karpathy | Demystifying what ChatGPT's answer actually is |
| "Models need tokens to think — distribute your computation across many tokens." | Karpathy | Why reasoning must be spread over tokens, not crammed |
| "There is no human who can hardcode this stuff... the only thing we've given it are the correct answers." | Karpathy | Emergent chains of thought discovered by RL (DeepSeek-R1) |
| "Reinforcement learning is not going to be constrained by human performance." | Karpathy | AlphaGo surpassing Lee Sedol; the promise for LLM reasoning |
| "RLHF is not RL [in the magical sense]... it's more like a little fine-tune." | Karpathy | Reward-model gaming caps RLHF's scalability |
| "It's a Swiss cheese capability, and we have to be careful with that." | Karpathy | Jagged intelligence — brilliant with random holes |
| "Check their work and own the product of your work, but use them for inspiration, for first drafts." | Karpathy | Closing practical advice on using LLMs responsibly |

## Source Notes
- Transcript source: `auto subtitles` (YouTube auto-captions, English original `en-orig`, retrieved via yt-dlp with proxy)
- Cookie-auth retry: used (Chrome cookies)
- Data gaps: None. Full 3:31:23 transcript captured (~41,000 words) across all 24 metadata chapters. Note: an initial extraction run silently reused a stale subtitle file from a different video in the shared temp directory; this was detected and corrected by re-fetching the correct captions for video ID `7xTGNNLPyMI`.
