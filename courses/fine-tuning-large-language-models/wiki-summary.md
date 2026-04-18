---
tags: [fine-tuning, llm, instruction-tuning, training, evaluation, lora, deeplearning-ai, lamini, huggingface, pytorch]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models
---

# Finetuning Large Language Models — Course Wiki

**Course:** [Finetuning Large Language Models](https://learn.deeplearning.ai/courses/finetuning-large-language-models)  
**Instructor:** Sharon Zhou (Lamini) · DeepLearning.AI  
**Lessons:** 9 video lessons + 1 quiz  
**Models used in labs:** Pythia-70M (CPU, for speed), Pythia-410M (Lamini cloud), Llama-2-7B, GPT-3/ChatGPT comparisons

---

## What Fine-tuning Is

Fine-tuning takes a pre-trained base LLM and further trains it on a smaller, task-specific dataset to improve performance on a target task. It is not training from scratch — the base model already knows language and broad world knowledge. Fine-tuning adjusts behavior, style, and domain knowledge.

**Key conversion**: Instruction fine-tuning is what turned GPT-3 into ChatGPT — the same technique that expanded LLM adoption from researchers to hundreds of millions of users.

---

## Why Fine-tune vs. Prompt Engineering

| | Prompt engineering | Fine-tuning |
|---|---|---|
| Setup | Zero code | Requires training pipeline |
| Performance ceiling | Limited by context window | Can exceed GPT-4 on specific tasks |
| Data privacy | Prompts sent to API | Model stays on-premises |
| Inference cost | Higher (more tokens) | Lower (shorter prompts work) |
| Moderation | Hard to enforce | Baked into training data |

Fine-tuning wins when you need consistent, reliable, privacy-safe, or cost-efficient behavior at scale. Prompt engineering is sufficient for exploration or one-off tasks.

---

## The Pre-training → Fine-tuning Pipeline

```
Random weights
    ↓ Pre-training (next-token prediction on web-scale data, e.g. The Pile)
Base model (knows language + world knowledge)
    ↓ Fine-tuning (same objective, much less data, structured input-output pairs)
Fine-tuned model (task-specific behavior + new knowledge)
    ↓ (optional) Further fine-tuning rounds
```

**The Pile** (EleutherAI): 22 diverse internet datasets used as a pre-training corpus in the labs — includes code, medical text, news, Gettysburg Address, and more.

---

## Data Best Practices (Priority Order)

1. **Quality** — high-quality input-output pairs; garbage in → garbage out
2. **Diversity** — varied inputs across your task's range; uniform data causes memorization
3. **Real data** — preferred over synthetic; generated data reinforces statistical patterns from its generator
4. **Quantity** — least critical; the base model already knows the world; ~1,000 examples is a practical starting point

### Instruction Fine-tuning Data Sources

- Existing FAQs, customer support threads, Slack conversations
- **Alpaca technique** (Stanford): use ChatGPT itself to generate (instruction, response) pairs via prompt templates — self-distillation, no human annotators needed
- Prompt templates with structural markers (`### Question:`, `### Answer:`) help the model learn structure and enable output parsing

### Tokenization

- Tokenizer must match the model (e.g., `AutoTokenizer.from_pretrained("EleutherAI/pythia-70m")`)
- Tokens ≠ words — based on character-cluster frequency (e.g., token `278` → `ING`)
- **Padding**: add `0` tokens to match batch length; **Truncation**: cut to model max length
- Truncate from the left when the answer/response is on the right and must be preserved

---

## Training Process

**4-step loop (PyTorch level):**
1. Forward pass: feed batch → get predictions
2. Loss: compare predictions to target labels
3. Backpropagation: compute gradients
4. Optimizer step: update weights to reduce loss

**Key hyperparameters**: learning rate, learning rate scheduler, optimizer params (momentum, weight decay), max steps, batch size, number of epochs.

**3 abstraction levels:**

| Level | Library | Code |
|---|---|---|
| Low-level | PyTorch | Full training loop, manual backprop |
| Mid-level | Hugging Face `Trainer` | Pass model, data, `TrainingArguments` |
| High-level | Lamini `llm.train()` | 3 lines: load model → load data → `model.train()` |

**Moderation via training data**: include (off-topic question → "Let's keep the discussion relevant to X") pairs in the dataset. The course lab used 37 such examples; the model learns to redirect without explicit rule-based logic.

---

## Evaluation

LLM evaluation is hard: no clear scalar metrics, many valid correct answers for generative tasks, benchmarks go stale quickly. **Human evaluation on a curated test set is the most reliable method.**

### Evaluation Methods

| Method | Notes |
|---|---|
| Exact match | Almost always 0 for free-text; useful only for extraction tasks |
| LLM-as-judge | Use another LLM to score output quality |
| Embedding distance | Embed both answers, measure cosine similarity |
| Elo comparison | Pairwise human preference ranking (like chess); used for model tournaments |
| **Manual inspection** | Most effective in practice; curate a small, high-quality test set |

### Open LLM Leaderboard Benchmarks (EleutherAI)

| Benchmark | Tests |
|---|---|
| ARC | Grade-school science |
| HellaSwag | Common-sense reasoning |
| MMLU | Broad elementary subject knowledge |
| TruthfulQA | Avoiding online falsehoods |

**Caveat**: a task-specific fine-tuned model typically scores *lower* on ARC than its base model (the course lab: 0.31 vs base 0.36). This is expected — the model traded general science knowledge for Lamini Q&A performance. Academic benchmarks only matter for comparing general-purpose models.

### Error Analysis

Can be done on the base model *before* fine-tuning to identify what data gives the biggest lift:

- **Misspelling**: fix in training data directly
- **Verbosity**: add concise examples
- **Repetition**: use stop tokens; ensure training data is diverse

---

## Getting Started

### Recommended First-timer Steps

1. Prompt-engineer a large LLM (ChatGPT) to identify a task it does "okay but not great"
2. Pick one task only
3. Collect ~1,000 input-output pairs (better quality than the "okay" baseline)
4. Fine-tune a small model to measure the performance delta

### Task Complexity vs. Model Size

| Task complexity | Recommended model size |
|---|---|
| Simple (classification, extraction) | 1–7B parameters |
| Moderate | 7–13B parameters |
| Complex reasoning | 70B+ parameters |

### Hardware Requirements

| GPU | VRAM | Capability |
|---|---|---|
| V100 16GB | 16 GB | Inference up to 7B; training up to 1B |
| A100 40GB | 40 GB | Inference up to 70B; training up to 7B |
| A100 80GB | 80 GB | Training up to 70B |

### LoRA (Low-Rank Adaptation)

A parameter-efficient fine-tuning technique that reduces trainable parameters by ~10,000× and memory by ~3× compared to full fine-tuning. Instead of updating the full weight matrix W, it learns two small low-rank matrices A and B such that ΔW = A·B. Enables fine-tuning 70B models on a single GPU; the adapter weights can be merged back into the base model at inference.

---

## Lesson Index

| File | Lesson |
|---|---|
| [001-introduction.md](001-introduction.md) | Introduction — what fine-tuning is, course roadmap |
| [002-why-finetune.md](002-why-finetune.md) | Why fine-tune — vs prompting, benefits, lab demo |
| [003-where-finetuning-fits-in.md](003-where-finetuning-fits-in.md) | Pre-training, The Pile, task taxonomy, data formatting |
| [004-instruction-finetuning.md](004-instruction-finetuning.md) | GPT-3→ChatGPT, Alpaca, generalization insight |
| [005-data-preparation.md](005-data-preparation.md) | Data quality ranking, tokenization, padding/truncation |
| [006-training-process.md](006-training-process.md) | Training loop, hyperparameters, 3 abstraction levels, moderation |
| [007-evaluation-and-iteration.md](007-evaluation-and-iteration.md) | Evaluation methods, benchmarks, error analysis |
| [008-consideration-on-getting-started-now.md](008-consideration-on-getting-started-now.md) | Task/model sizing, hardware table, LoRA |
| [009-conclusion.md](009-conclusion.md) | Course summary and next steps |
