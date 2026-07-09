---
tags: [claude, opus, fable, claude-code, model-routing, ai-agents, skills, prompt-engineering]
source: https://www.youtube.com/watch?v=XTBWVVcF3Pk
wiki: wiki/claude/how-i-make-opus-think-like-fable-5-easy-steps_XTBWVVcF3Pk.md
---

# How I Make Opus Think Like Fable (5 easy steps)

## Video Info
- URL: https://www.youtube.com/watch?v=XTBWVVcF3Pk
- Platform: YouTube
- Title: How I Make Opus Think Like Fable (5 easy steps)
- Speaker: Nate Herk
- Channel/Event: Nate Herk | AI Automation
- Upload date: 2026-07-07
- Duration: 9:59
- Views / likes / comments: 56,976 views / 2,131 likes / 104 comments (at extraction time)
- Category and tags: Film & Animation; no uploader tags exposed in metadata

## Executive Summary
Nate Herk argues that the durable advantage is not temporary access to a frontier model like Fable 5, but the operating process users extract from it. After spending "a few thousand dollars" testing Fable 5, Opus, Sonnet, and Claude Code dynamic workflows, he concludes that strong orchestration plus cheaper worker models can often produce similar results for far lower cost. His proposed workflow is to analyze excellent Fable outputs, convert the reasoning habits into a reusable "Fable mode" skill, and pair that skill with a simple routing table for Opus, Sonnet, Haiku, Codex, or open-source models. The practical takeaway is model access may change, but teams can still own their prompts, skills, verification loops, routing rules, and local-model options.

## Key Numbers / Quick Facts
| Fact | What it means in the talk |
|---|---|
| A few thousand dollars | Nate says he spent this amount in usage credits experimenting with Fable 5. |
| 5 gates | The proposed "Fable mode" skill has scoping, evidence, attacking, verifying, and reporting gates. |
| 3 model tiers in one routing test | His Opus orchestrator delegated work to Sonnet, Opus, and Haiku worker variants. |
| About 3x cheaper | The Opus-orchestrated run with Haiku scouts was described as roughly three times cheaper with the same result. |
| Fable 5 low vs Opus 4.8 high | He cites a release-blog chart where these effort settings looked close in quality/cost tradeoff. |
| 9:59 | Short, tactical solo explainer rather than a course module. |

## Outline
1. **The Model Isn't the Moat** - Nate frames model access as less important than instruction quality, systems, and execution loops.
2. **Turning Opus Into Fable** - He proposes treating Fable like a senior teacher whose process can be packaged for other models.
3. **Leaked Fable System Prompt** - He extracts operating habits from leaked system-prompt guidance, including verification and effort calibration.
4. **Effort Levels** - He argues users should tune effort levels because higher effort can overthink and cost more.
5. **Building the Fable Mode Skill** - He describes turning Fable's reasoning habits into a reusable skill with five gates.
6. **Model Routing Table** - He suggests routing tasks by cost, intelligence, and taste so cheaper models do work they can handle.
7. **Final Thoughts** - He closes by arguing users do not own hosted models, but they can own their processes and systems.

## Detailed Chapter Summaries

### 1. The Model Isn't the Moat
> **Segment**: 00:00-01:15

Nate opens by saying Fable 5 is powerful, but the model itself is not the lasting advantage. He uses two examples to make the point concrete:

- A beginner using Fable 5 would still likely be outbuilt by someone like Andrej Karpathy using Sonnet 3.7, because instruction quality, workflow design, and feedback loops matter more than raw model rank.
- In Claude Code dynamic workflows, he compared runs where Fable orchestrated Fable sub-agents against runs where Fable orchestrated Opus or Sonnet sub-agents. He says the results were "about the same" while all-Fable runs cost exponentially more.

The chapter's thesis is that users cannot preserve the hosted model's intelligence, but they can preserve and reuse the process that made it effective.

### 2. Turning Opus Into Fable
> **Segment**: 01:15-02:33

The first step is to stop treating Fable as a pure workhorse and start treating it like a teacher or senior engineer. Nate's analogy is operational: Fable should package its planning, checking, and taste so less expensive models can execute with similar habits.

This reframes model routing as a cost-quality balancing problem. A task may require some intelligence for planning, but not necessarily the most expensive model for every execution step. The durable skill is learning which model and which effort setting are enough for a given job.

He also describes using Fable like a co-founder or officer in his company: let it inspect setups, improve skills, and transfer its practices to the "junior engineers" that will take over execution.

### 3. Leaked Fable System Prompt
> **Segment**: 02:33-03:18

Nate says he and Fable reviewed leaked Fable 5 system prompts and pulled out habits worth copying into other workflows. The examples are all about disciplined uncertainty management:

- Memory is not enough: partial recognition from training should not be treated as current knowledge.
- Presence should be verified: a prompt implying a file exists does not mean the file is actually present.
- Ambiguity should not always block action: the model is encouraged to address the ambiguous query first, then ask at most one clarifying question.
- Reporting should stay grounded: acknowledge what went wrong, stay on the problem, and maintain self-respect.

The broader pattern is evidence-first execution. Before the model reasons or reports success, it checks whether the thing it is relying on actually exists.

### 4. Effort Levels
> **Segment**: 03:18-04:25

Nate separates two routing questions: which model should do the task, and what effort level should that model use. He cites a release-blog chart comparing Fable 5, Opus 4.8, and GPT 5.5 across quality and cost, then highlights that Fable 5 on low effort looked similar to Opus 4.8 on high effort.

The key caveat is that higher effort is not automatically better. Nate says extra-high or max effort can make both Fable and Opus run longer, cost more, second-guess themselves, and sometimes produce worse output than a high-effort setting. His practical recommendation is to test effort levels rather than leaving powerful models at default settings.

### 5. Building the Fable Mode Skill
> **Segment**: 04:25-07:30

This is the main playbook section. Nate recommends finding Fable deliverables that felt unusually good, then asking Fable or Opus to analyze what made them good:

- What did the model think about to get there?
- How did it get from prompt to output?
- What did it do to prove the result worked?
- Which habits can be extracted into a reusable skill?

He packages those habits as a "Fable mode" skill for Opus 4.8 and says it makes Opus feel elevated. The skill is built around five gates:

| Gate | Purpose |
|---|---|
| Scoping | Understand the task before doing work, including unknowns and failure modes. |
| Evidence | Check facts, files, and assumptions before reasoning from them. |
| Attacking | Think adversarially about what could go wrong. |
| Verifying | Confirm the work before declaring it done. |
| Reporting | Calibrate the final answer to what was actually proven. |

He distinguishes ordinary planning from adversarial scoping. A weak plan says "here are the steps"; a stronger plan asks what might fail, which unknowns matter, and how the workflow should be structured so cheaper worker models can execute while the stronger orchestrator keeps inspecting results and designing next steps.

### 6. Model Routing Table
> **Segment**: 07:30-09:15

Nate then adds a routing table on top of the skill. The table lists models in the user's toolkit and scores them by dimensions such as:

- Cost: cheaper models receive better cost scores.
- Intelligence: how well the model understands the user, reviews code, or handles complex reasoning.
- Taste: creativity, UI/UX judgment, or out-of-the-box design quality.

This routing table helps dynamic workflows select the right model for each subtask. Nate gives an example where Opus, equipped with the Fable-style prompt, orchestrated Sonnet, Opus, and Haiku workers. In one test, delegating to Haiku scouts was about three times cheaper while producing the same result.

The business implication is unit economics. For small teams or anyone with a monthly AI budget, good routing can deliver more work for less spend by reserving expensive models for orchestration, judgment, or high-taste tasks.

### 7. Final Thoughts
> **Segment**: 09:15-09:59

Nate closes by responding to anxiety around Fable 5 becoming unavailable or moving behind subscriptions. His larger point is that users do not own hosted frontier models, and model access can change for commercial, government, or platform reasons.

The things users can own are their systems: process documents, skill files, model-routing tables, verification methods, local hardware, and local models. He says this is why he expects to explore more local-model and process-ownership topics.

## Playbook

### Extract Process, Not Just Output
- **Key idea**: When a Fable output is unusually good, inspect the session and extract the reasoning path behind it.
- **Why it matters**: The output is a one-off artifact; the process can be reused by Opus, Sonnet, GPT, Codex, or open-source models.
- **How to apply**: Ask a stronger model to analyze the result, identify its planning and verification habits, then convert those habits into a skill file.

### Use Strong Models as Teachers and Orchestrators
- **Key idea**: Reserve the best model for judgment, scoping, adversarial review, and routing rather than every execution step.
- **Why it matters**: Nate's Claude Code workflow tests suggested Fable-orchestrated Sonnet or Opus workers could match all-Fable results at much lower cost.
- **How to apply**: Let the strongest model design the workflow and inspect outputs, then delegate narrow execution to cheaper workers.

### Tune Effort Like a Runtime Knob
- **Key idea**: Effort level is part of the routing decision, not an afterthought.
- **Why it matters**: Extra-high or max effort can increase cost, length, and overthinking without improving quality.
- **How to apply**: Test low, high, and max effort on representative tasks; record which settings work for planning, code review, UI taste, or rote execution.

### Build a Routing Table
- **Key idea**: Score models by cost, intelligence, and taste so agent teams can choose deliberately.
- **Why it matters**: The same workflow can use Opus for orchestration, Sonnet for execution, Haiku for scouting, and Codex or open-source models where they fit.
- **How to apply**: Create a small table inside the project instructions or skill that maps task types to preferred models and effort settings.

### Own the System Around the Model
- **Key idea**: Hosted model access is not durable ownership; process assets are.
- **Why it matters**: If Fable 5 moves behind a subscription or access changes, the extracted method can still survive.
- **How to apply**: Keep reusable skills, routing rules, verification checklists, and local-model experiments in your own repo.

## Key Quotes

| Quote | Speaker | Context |
|-------|---------|---------|
| "the model isn't really the moat" | Nate Herk | Opening thesis about durable advantage. |
| "keep its process" | Nate Herk | Why extracting Fable's workflow matters. |
| "teacher rather than a workhorse" | Nate Herk | How to use Fable as process-transfer infrastructure. |
| "evidence before reasoning" | Nate Herk | One of the reusable habits in the Fable-mode skill. |
| "we don't own these models" | Nate Herk | Closing argument for owning systems and methods. |

## Source Notes
- Transcript source: `subtitle-vtt` (`en-orig`)
- Cookie-auth retry: used
- Original language: en-US
- Data gaps: none material; summary is based on extracted metadata, YouTube chapters, and subtitle transcript.
