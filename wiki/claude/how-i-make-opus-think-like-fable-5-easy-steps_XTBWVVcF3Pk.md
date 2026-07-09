---
tags: [claude, opus, fable, claude-code, model-routing, ai-agents, skills, prompt-engineering]
source: https://www.youtube.com/watch?v=XTBWVVcF3Pk
---
# How I Make Opus Think Like Fable

Nate Herk's short YouTube talk argues that access to [[Fable]] is not the durable advantage; the reusable advantage is the process users extract from it. After spending a few thousand dollars testing Fable 5, Opus, Sonnet, and [[Claude Code]] dynamic workflows, he says all-Fable agent teams often produced similar results to Fable-orchestrated Opus or Sonnet teams while costing far more. His practical answer is to turn Fable's planning and verification habits into a reusable [[Claude skills|skill]], then combine that skill with a [[model-routing]] table that sends work to Opus, Sonnet, Haiku, Codex, or open-source models according to cost, intelligence, and taste.

## Key Concepts
- **[[Process extraction]]**: Instead of only saving a good Fable deliverable, ask Fable or Opus to analyze why it worked: what it scoped, how it checked evidence, what it verified, and which reasoning habits can be converted into a skill file.
- **[[Fable mode]] skill**: Nate describes a reusable skill for Opus 4.8 with five gates: scoping, evidence, attacking, verifying, and reporting. The point is to make cheaper or more available models follow Fable-like working discipline.
- **[[Evidence before reasoning]]**: One extracted habit is to verify whether files, facts, and assumptions actually exist before building a plan on top of them. This aligns with [[context-engineering]] and [[verification-loop]] practices already used in Claude Code workflows.
- **[[Effort levels]]**: Model choice and effort setting are separate knobs. Nate argues extra-high or max effort can overthink, cost more, and produce worse results than a high-effort setting on some tasks.
- **[[Model routing]]**: A routing table scores available models by cost, intelligence, and taste. In Nate's example, an Opus orchestrator with cheaper Haiku scouts was roughly three times cheaper while producing the same result.
- **[[Process ownership]]**: Hosted model access can change, but local skill files, routing rules, verification checklists, and local-model experiments stay under the user's control.

## Key Numbers
| Fact | Value |
|---|---|
| Fable usage credits spent | A few thousand dollars |
| Fable-mode gates | 5: scoping, evidence, attacking, verifying, reporting |
| Routing dimensions named | Cost, intelligence, taste |
| Example cheaper run | About 3x cheaper with Haiku scouts |
| Video length | 9:59 |

## Key Takeaways
- Treat frontier models as teachers and orchestrators, not only as expensive execution engines.
- Preserve the model's working discipline by converting strong outputs and sessions into reusable skill files.
- Route by task: use expensive models for judgment, scoping, and taste; use cheaper models for bounded execution and scouting.
- Tune effort levels empirically because maximum effort can add cost and second-guessing without improving quality.
- The strategic asset is the system around the model: prompts, skills, routing tables, verification loops, and local fallbacks.

## See Also
- [[claude-code-internals]]
- [[claude-merges-80-percent-code-close-the-loop]]
- [[i-asked-claude-code-to-make-me-as-much-money-as-possible_iTY8Q449YNQ]]
- [[context-engineering]]
- [[harness-engineering]]
