---
tags: [autoresearch, andrej-karpathy, ai-agents, recursive-self-improvement, claude-code, codex, prompt-engineering, mlops, automation, david-ondrej]
source: https://www.youtube.com/watch?v=uBWuKh1nZ2Y
---
# AutoResearch (Karpathy's Autonomous Experiment Loop)

**AutoResearch** is Andrej Karpathy's open-source pattern for an AI agent that autonomously runs experiments on a single goal: propose hypothesis → modify one file → train for ~5 minutes → evaluate against a fixed metric → `git commit` if better, `git reset` if worse → repeat. The architecture is just **three files**, with one strict invariant: the agent can edit `train.py` but **cannot touch `prepare.py`** (the metric script) — otherwise it would rewrite the eval to fake results. Karpathy used the loop to optimize a GPT-2 training script after months of manual tuning. The deeper claim, walked through by David Ondrej in his tutorial: the same loop generalizes to **anything with a measurable outcome** — trading (Sharpe ratio), marketing copy (conversions), code performance, system-prompt tuning. Live demo took a portfolio site from **50 ms → 25 ms in ~4 minutes** with no human in the loop.

## Key Concepts

- **Three-file architecture**:
  - `program.md` — human-written goals, constraints, rules. Set once; never edited by the agent.
  - `train.py` — the *one* file the agent may modify. Can be code, config, a prompt, a math equation — anything you want to optimize.
  - `prepare.py` — the metric/eval script. **Agent absolutely cannot touch this.** This is what makes self-improvement actually self-improvement and not self-deception.
- **The loop**: hypothesis → modify → train ~5 min → eval → commit-or-revert → repeat. ~100 experiments per overnight run at that budget.
- **Fixed time budget per experiment**: the only way to keep ideas comparable. Otherwise the agent "wins" by training longer rather than smarter.
- **Three success conditions** (all required): (1) clear scalar metric, (2) fully automated evaluation (no human in the loop), (3) exactly one editable file.
- **Where it fails**: brand design, UX, taste-driven pricing — anything where "better" is subjective. Pricing *can* work with high-traffic A/B tests, but for most businesses the loop is too slow or the metric too vague.
- **The metric-picking bottleneck**: when execution becomes free, leverage shifts to *what to measure and what constraints to set*. Ondrej calls this "the skill that is going to make millionaires in the future."
- **Recursive self-improvement framing**: Karpathy predicts all frontier labs will eventually run some form of AutoResearch — "the final boss battle." The irony: OpenAI/Anthropic/Gemini spend tens of millions on researchers building this, while Karpathy open-sourced it.

## Use Cases (Beyond ML Training)

| Domain | What the agent edits | Metric |
|---|---|---|
| **Trading** | Buy/sell rules in `train.py` | Sharpe ratio over historical market data |
| **Marketing** | Email/ad/landing copy | Conversion rate; Eric Seu predicts 30 → 36k experiments/year (≈100/day) |
| **Code optimization** | Codebase performance hot path | Latency, throughput, binary size |
| **Local LLM fine-tuning** | Open-source model weights/config | On-device benchmark scores (laptop, phone) |
| **Prompt engineering** | System prompt phrasing/language/level | Agent task success rate; Harrison Chase: "Agents mess up because they don't have the right context" |

## Key Numbers

| Number | What it measures |
|---|---|
| 3 files | `program.md`, `train.py`, `prepare.py` |
| 1 file | The agent may edit exactly one |
| ~5 min / ~100 | Karpathy's per-experiment budget / overnight experiment count |
| 50 → 25 ms | Demo portfolio-site load time before/after the loop |
| ~4 min | How long the live demo took to halve baseline |
| 30 → 36,000/yr | Eric Seu's prediction for marketing-team experiment volume |

## Key Takeaways

- **The loop, not the model, is the optimizer.** Discipline of bounded hypothesis → eval → keep-or-revert run hundreds of times beats a smarter single-shot model.
- **Lock the metric file.** If the agent can edit the eval, it will fake the results — silently. This is the one invariant that makes the whole pattern work.
- **Equal time budgets keep ideas comparable.** Otherwise the agent gains by training longer, not smarter.
- **Picking the metric is the new bottleneck.** "If you give it a bad metric, it will very confidently optimize the wrong thing." Audit `prepare.py` before every run.
- **Two-agent setup**: in Ondrej's demo, Claude Code (Opus, fast mode) drives the experiment loop while Codex CLI writes the eval harness — different agents for different cognitive tasks.
- **Generalize past ML.** Karpathy: "Any metric you care about that is reasonably efficient to evaluate can be auto-researched." If you can score it, you can auto-research it.

## See Also
- [[karpathy-loopy-era-ai]] — Karpathy's broader framing of the "loopy era" of AI (parallelism, memory, jagged capabilities) where AutoResearch is one concrete pattern.
- [[harness-engineering]] — the third paradigm shift toward orchestrating reliable agent execution; AutoResearch is a minimal harness.
- [[long-running-agent-harness]] — Anthropic's blueprint for multi-hour agent tasks; AutoResearch is exactly such a task structured around `git commit`/`git reset` checkpoints.
- [[openai-frontier-zero-human-coding]] — Symphony's worktree-reset pattern is the same idea applied to code: revert when the agent produces garbage.
