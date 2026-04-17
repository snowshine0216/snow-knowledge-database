---
tags: [autoresearch, andrej-karpathy, ai-agents, recursive-self-improvement, claude-code, codex, prompt-engineering, mlops, automation, david-ondrej]
source: https://www.youtube.com/watch?v=uBWuKh1nZ2Y
wiki: wiki/concepts/autoresearch-karpathy.md
---

# The Only AutoResearch Tutorial You'll Ever Need

## Video Info
- URL: https://www.youtube.com/watch?v=uBWuKh1nZ2Y
- Platform: YouTube
- Title: The only AutoResearch tutorial you'll ever need
- Speaker: David Ondrej (founder, New Society / Vectal AI)
- Channel: David Ondrej (@DavidOndrej)
- Upload date: 2026-03-27
- Duration: 19:52
- Views / likes / comments: 163,742 views / 6,385 likes / 151 comments (at extraction time)
- Category and tags: Education; AI, AI Agents, AGI, OpenAI, Autoresearch, andrej karpathy
- Project: AutoResearch by Andrej Karpathy — https://github.com/agent0ai/agent-zero (note: the speaker's stated repo; verify against Karpathy's actual project before using)

## Executive Summary

David Ondrej walks through Andrej Karpathy's open-source **AutoResearch** project: an AI agent that runs an autonomous experiment loop on a single goal — propose hypothesis → modify one file → train for ~5 minutes → evaluate against a fixed metric → `git commit` if better, `git reset` if worse → repeat. The architecture is **three files**: `program.md` (human-written goals/rules), `train.py` (the only file the agent may edit), and `prepare.py` (the metric/eval — agent absolutely cannot touch, otherwise it would cheat the eval). Karpathy used it to optimize a GPT-2 training script; Ondrej's deeper claim is that the same loop generalizes to **anything with a measurable outcome** — trading (Sharpe ratio), marketing copy (conversions), code performance, system-prompt tuning. He demos building an AutoResearch loop with Claude Code + Codex CLI to optimize a portfolio website's load time, taking it from **50 ms → 25 ms in ~4 minutes** with no human in the loop. Karpathy's vision: a SETI@home-style distributed AI-research network — and the speaker frames "knowing what to measure" as the next millionaire-making skill.

## Outline

1. **What is AutoResearch?** — Karpathy's open-source project; AI agent that runs experiments autonomously and self-improves on a measurable metric.
2. **Who is Andrej Karpathy?** — OpenAI co-founder, Tesla Autopilot lead, coined "vibe coding"; AutoResearch is his latest open-source contribution.
3. **The core loop** — hypothesis → modify → train ~5 min → eval → commit or reset → repeat; ~100 experiments overnight.
4. **Why one fixed time budget per experiment** — the only way to keep ideas comparable; agent can't "win" by training longer.
5. **Generalization beyond ML** — recursive self-improvement for *anything* measurable; the bottleneck shifts from execution to choosing the right metric.
6. **Three-file architecture** — `program.md` (goals), `train.py` (editable), `prepare.py` (metric, off-limits).
7. **Sponsor** — Oxylabs MCP for live web data (skipped from summary).
8. **Use cases** — trading (Sharpe ratio), marketing (Eric Seu: 30 → 36k experiments/year), code optimization, fine-tuning local models, prompt engineering.
9. **Three success conditions** — clear metric + automated eval + one editable file; counterexamples (brand design, UX, subjective pricing).
10. **Karpathy's SETI@home vision** — distributed AI research across millions of agents.
11. **Build-along: optimize a website's load time** — Claude Code + Codex CLI + Puppeteer benchmark; portfolio site goes 50 ms → 25 ms.

## Detailed Chapter Summaries

### 1. What is AutoResearch?
> **Segment**: 00:00-00:50

Open-source project by Andrej Karpathy that "lets AI improve itself autonomously." An AI agent runs experiments automatically, keeps what works, throws away what doesn't. Ondrej promises three things: how it actually works, how to use it in your own life/business, and how to build your first loop.

### 2. Who is Andrej Karpathy
> **Segment**: 00:50-01:40

Quick credentials pass: one of the most legendary AI researchers, **OpenAI co-founder**, **lead behind Tesla Autopilot**, coined the term **"vibe coding,"** big open-source contributor, born in Czechoslovakia. AutoResearch is "one of his contributions" — the focus of this video.

### 3. The core loop
> **Segment**: 01:40-03:15

Origin story: Karpathy had a **GPT-2 training script he'd been hand-optimizing for many months**. He realized — *why am I doing this manually? Just have an AI agent run different experiments in a loop.*

The core idea: **give AI one file, one metric, and let it run hundreds or thousands of experiments by itself while you sleep.**

The loop visualized:
1. Agent forms a **hypothesis**
2. **Modifies the code** (`train.py`)
3. **Trains for ~5 minutes**
4. **Runs the evaluation** (`prepare.py`)
5. If better → **git commit** to history
6. If worse → **git reset** and try again
7. Repeat as many times as your token budget allows

> "If you start it right before going to bed, it can run roughly **100 experiments overnight**."

### 4. Why one fixed time budget per experiment
> **Segment**: 03:15-04:00

The fixed time budget makes every experiment comparable. The hiring analogy: *"If one applicant has 7 days and another has 7 minutes, the 7-days one will obviously do better on average."*

> "The agent can't cheat just by training longer or by training better ideas. **Only the raw idea wins with the same time allocated.**"

### 5. Generalization beyond ML
> **Segment**: 04:00-05:30

The big claim: AutoResearch is not about ML training — it's a **recursive self-improving loop for anything measurable**.

> "Soon enough, the execution of any work or task will become basically free. However, what will become valuable is **knowing what to measure**, picking the right metric, and setting the right constraints. **This is the skill that is going to make millionaires in the future.**"

Also framed as **the clearest example of what AI agents actually look like in practice — not chatbots, but real autonomous loops doing meaningful work.** Karpathy's prediction: all LLM frontier labs will eventually run some form of AutoResearch — *"this is the final boss battle"* of recursive self-improvement.

The irony Ondrej flags: "OpenAI, Anthropic, Gemini are spending tens of millions on researchers all trying to build this — yet Karpathy made it completely open source."

### 6. The three-file architecture
> **Segment**: 05:30-06:30

The non-negotiable structure:

| File | Role | Mutability |
|---|---|---|
| `program.md` | Human-written goals, constraints, rules for the agent | Set once by human; never changed |
| `train.py` | The single file the agent can modify (code, config, prompt, math equation, "literally anything you want to optimize") | **Editable by agent** |
| `prepare.py` | Metric and evaluation script | **Agent cannot touch — ever.** Otherwise it would rewrite the scoring function to fake results. |

> "Basically, the `prepare.py` file defines what better means. Now, of course, if you set the wrong metric, you'll get the wrong results."

Ondrej notes: "Several tech billionaires are going crazy over this — Shopify CEO, Stripe CEO" — because they realize the loop generalizes far beyond ML.

### 7. Sponsor — Oxylabs (skipped)
> **Segment**: 06:30-08:00

Web scraper API + MCP for Cursor / Claude Code / N8N. Not relevant to AutoResearch core; skipped.

### 8. Use cases
> **Segment**: 08:00-12:00

> "Any metric you care about that is reasonably efficient to evaluate can be auto-researched. So you need one file to edit, one scalar metric, and a time-box loop. **If you can score it, you can auto-research it.**" — Karpathy

#### Trading
- Agent tweaks buy/sell rules
- Tries strategies on years of market data
- Scores by **Sharpe ratio** (returns vs. risk)
- "Hundreds of different trading strategies to see which has the best returns"

#### Marketing
- Email copy, ad creatives, landing pages, headlines, thumbnails, YouTube titles — automated A/B testing
- **Eric Seu quote**: "Most marketing teams run 30 experiments per year. The next generation will run **36,000 — roughly 100 per day.**"
- Loop: agent modifies copy → measures conversions → keeps or discards

#### Code optimization
- Point AutoResearch at any codebase: *"make it faster"*
- Also being used to **fine-tune open-source AI models for local execution** (laptop, phone)
- Speaker's prediction: "Sonnet 4.6 quality models runnable on iPhones in three or four months."

#### Prompt engineering
- Tune system instructions for AI agents
- Try different phrasings, languages (English vs. Polish vs. Czech vs. German), reading levels (beginner / college / PhD) to find what works best
- Cites **Harrison Chase (LangChain founder)**: *"Agents mess up because they don't have the right context."* System prompts are part of that context.

### 9. Three success conditions and where it fails
> **Segment**: 12:00-13:30

The loop only works if **all three** hold:
1. **Clear metric** — one scalar, one direction
2. **Automated evaluation** — no human in the loop, or it can't run while you sleep
3. **Exactly one file** the agent can change — "not two, not zero, one file"

Where it fails:
- **Brand design, UX, pricing** — anything where "better" is subjective
- Pricing *can* succeed if you have enough traffic to A/B test cash collected, but for most businesses it's too slow
- "If you give it a bad metric, it will very confidently optimize the wrong thing"

### 10. Karpathy's SETI@home vision
> **Segment**: 13:30-14:30

In the early 2000s, **SETI@home** let anyone donate spare compute to search for alien life. Karpathy wants the same model for AI research: **millions of AI agents distributed across thousands of computers, with directable research allocation.**

### 11. Build-along: optimize a website's load time
> **Segment**: 14:30-19:52

Hands-on demo with **Claude Code (Opus 4.6, fast mode)** + **Codex CLI (GPT-4.6, high reasoning)** to build an AutoResearch loop that optimizes a portfolio website.

#### Setup
1. **Clone Karpathy's AutoResearch repo** into `/original` folder for reference (asks Claude Code in dangerous-skip-permissions mode to do this)
2. **Build target site** in `/website`: Claude Code generates a deliberately old-school Express + static-files portfolio for "Alex Morgan, expert designer" — looks "like 10-15 years ago in high school."
3. **Build the eval harness** in `/website` via **Codex CLI**: a `benchmark.mjs` that uses **Puppeteer** to measure page load time locally.

#### Adapt program.md
Have Claude Code read Karpathy's original `program.md` and rewrite it for the website-speed objective — produces 128 lines of project-specific instructions. Speaker's pitch: "Feel free to steal this for whatever you want — any business / marketing / make-money use case where there's a clear metric."

#### Run the loop
- **Baseline benchmark**: median load time **~50 ms**, recorded in `results.tsv`, committed as baseline
- Instruction to Claude Code: *"Read program.md, run baseline benchmark first, record results.tsv, then begin the experiment loop. Do not stop or ask me anything. Just keep running experiments automatically."*

#### Live results
- First experiment: slightly worse → "looks like noise. Let me re-run to confirm. Still worse. Following protocol — revert."
- Soon after: **33 ms** → 34% improvement in <1 minute
- Then: **28 ms** → another 15% improvement in 2-3 minutes
- By the end of the segment: **25 ms** in ~4 minutes — **half of baseline**

> "I'm not doing anything. My hands are up. Even if I was doing this manually — first, I'd need to be a solid front-end developer. Second, I couldn't do it so quickly. Even if you are a great front-end developer, you're still not going to beat an AI agent that can generate hundreds of tokens per second."

## Playbook

### The optimizer is the loop, not the AI
- **Key idea**: AutoResearch's value isn't a smarter model — it's the discipline of hypothesis → bounded experiment → eval → commit-or-revert, run hundreds of times.
- **Why it matters**: ~100 overnight experiments compound into changes a human couldn't ship in weeks. The Ondrej demo went 50 ms → 25 ms in 4 minutes.
- **How to apply**: structure any optimization problem as one editable file, one scalar metric, one fixed time budget per trial, then let the agent loop with `git commit` / `git reset` as the keep/discard mechanism.

### Lock the metric file
- **Key idea**: `prepare.py` is sacred — if the agent can edit the eval, it will rewrite the scoring function and fake the results.
- **Why it matters**: this is the *one* invariant that makes autonomous self-improvement actually self-improvement and not self-deception.
- **How to apply**: physically (or by `program.md` rules) prohibit the agent from touching the metric script. Audit the eval before every run, since "if you give it a bad metric, it will very confidently optimize the wrong thing."

### Equal time budgets keep ideas comparable
- **Key idea**: a fixed per-experiment time box is the only way the comparison is about *the idea*, not about how long it ran.
- **Why it matters**: the agent could otherwise "win" by training longer rather than training smarter.
- **How to apply**: pick a budget that's small enough to allow ~100 trials per overnight run (Karpathy used ~5 min for GPT-2 training).

### Picking the metric is the new bottleneck
- **Key idea**: when execution becomes free, the leverage moves to *what to measure and what constraints to set*.
- **Why it matters**: Ondrej calls this "the skill that is going to make millionaires in the future." Eric Seu's marketing quote — 30 → 36k experiments/year — only matters if "conversion lift" is measured correctly.
- **How to apply**: before writing `prepare.py`, write down what success means in plain English, what gameable cheats exist, and what edge cases would let the agent regress on something that's not in the metric.

### Three conditions, hard fail otherwise
- **Key idea**: clear scalar metric + fully automated eval + exactly one editable file. Miss any one → the loop doesn't auto-research.
- **Why it matters**: subjective metrics (brand, UX, taste-driven pricing) silently fail; human-in-loop evals can't run overnight; multiple editable files create attribution chaos.
- **How to apply**: before kicking off an AutoResearch run, name each of the three explicitly. If "better" requires a human judgment call, redesign the loop or pick a different problem.

### Two-agent setup: builder + evaluator
- **Key idea**: Ondrej splits Claude Code (build/edit) and Codex CLI (write the eval harness) — different agents for different cognitive tasks.
- **Why it matters**: lets you pick the strongest model per role and prevents one agent from optimizing against an eval it wrote.
- **How to apply**: open two terminals — Claude Code for the experiment loop, a separate agent (Codex / another Claude Code) for the eval harness. Validate the eval before connecting them.

## Key Quotes

| Quote | Speaker | Context |
|-------|---------|---------|
| "Give AI one file, one metric, and let it run hundreds — if not thousands — of experiments by itself while you sleep." | David Ondrej (paraphrasing Karpathy) | The core idea (Ch. 3) |
| "The agent can't cheat just by training longer. Only the raw idea wins with the same time allocated." | David Ondrej | Why fixed time budgets (Ch. 4) |
| "What will become valuable is knowing what to measure, picking the right metric, and setting the right constraints. This is the skill that is going to make millionaires in the future." | David Ondrej | On generalization (Ch. 5) |
| "Any metric you care about that is reasonably efficient to evaluate can be auto-researched." | Andrej Karpathy (cited) | Generalization claim (Ch. 8) |
| "Most marketing teams run 30 experiments per year. The next generation will run 36,000 — roughly 100 per day." | Eric Seu (cited) | Marketing use case (Ch. 8) |
| "Agents mess up because they don't have the right context." | Harrison Chase (LangChain founder, cited) | Why prompt engineering benefits from AutoResearch (Ch. 8) |
| "If you give it a bad metric, it will very confidently optimize the wrong thing." | David Ondrej | Failure mode warning (Ch. 9) |
| "Even if you are a great front-end developer, you're still not going to beat an AI agent that can generate hundreds of tokens per second." | David Ondrej | After live demo: 50 ms → 25 ms in 4 min (Ch. 11) |

## Key Numbers

| Number | What it measures |
|---|---|
| 3 files | `program.md`, `train.py`, `prepare.py` (the architecture) |
| 1 file | The agent may edit exactly one — the `train.py` slot |
| ~5 min | Per-experiment time budget Karpathy used for GPT-2 |
| ~100 | Experiments per overnight run at that budget |
| 30 → 36,000 | Eric Seu's marketing-experiments/year prediction (≈100/day) |
| 50 ms → 25 ms | Portfolio-site page load time before/after Ondrej's live demo |
| ~4 min | Time the demo loop took to halve the baseline |
| 34% / 15% | First two improvement deltas (50→33 ms, then 33→28 ms) |
| 128 lines | Length of the rewritten `program.md` Claude Code generated for the demo |

## Source Notes
- Transcript source: `subtitle-vtt` (en-orig auto-generated YouTube captions; required `--sub-langs en.*,en-orig` retry — first extraction grabbed Bengali auto-translation)
- Cookie-auth retry: used (YouTube anti-bot)
- Proxy: YT_PROXY (via skill `.env`)
- Repo link in description (`github.com/agent0ai/agent-zero`) does not match a known Karpathy repo — verify before cloning. Speaker may have mis-attributed; Karpathy has discussed this experiment loop pattern in `nanochat` / GPT-2 training context.
- Data gaps: minor transcription glitches ("Andre Karpathy", "Ing", "Sonnet 4.6", "GPT-4.6", "Opus 4.6") preserved as spoken; some model names may have been mis-named in the live demo (verify "GPT-4.6" / "Opus 4.6" against actual model availability at recording time).
