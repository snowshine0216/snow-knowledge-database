---
tags: [claude-code, agentic-os, skills, automation, workflow-orchestration]
source: https://www.youtube.com/watch?v=5AfSB0sWihw
---

# Claude Code Agentic OS

An architecture pattern for composing [[Claude Code]] skills into a self-maintaining system rather than using them as isolated utilities. The core insight: individual skills are low-leverage; compounding value comes from chaining skills through shared context.

## Architecture Layers

| Layer | Purpose | Key Files |
|---|---|---|
| **Brand Context** | Shared knowledge all skills consume | `brand_voice.md`, `positioning.md`, `ideal_customer_profile.md`, `samples/` |
| **Agent Context** | Identity, preferences, and memory | `soul.md`, `user.md`, `memory.md`, `learnings.md` |
| **Self-Maintenance** | Automated sync and feedback loops | Heartbeat routine, session summarizer |
| **Skill Orchestration** | Pipeline execution across skills | Cross-skill workflows, dependency registry |

## Shared Brand Context

A foundation folder readable by every skill, containing:

- **`brand_voice.md`** -- tone, style constraints, output examples
- **`positioning.md`** -- market angle, differentiation, core messaging
- **`ideal_customer_profile.md`** -- audience traits, pain points, language patterns
- **`samples/`** -- real content examples representing the quality bar
- **`resources.md`** -- links, handles, brand assets

Populate via a structured interview workflow, then treat the resulting docs as canonical inputs for all downstream skills.

## Agent Context (Memory + Behavior)

- **`soul.md`** -- assistant identity, communication style, behavior rules
- **`user.md`** -- user preferences (concise bullets vs. long prose, etc.)
- **`memory.md`** -- durable business knowledge
- **`memories/daily/*.md`** -- short-term session continuity
- **`learnings.md`** -- explicit feedback log by skill and deliverable type

Each skill reads its own learning section before executing. Preferences persist immediately when the user corrects output style.

## Self-Maintenance Loops

### Session-Start Heartbeat

1. Scan installed skill folders
2. Compare disk state with registry/docs
3. Detect added/removed skills and update records automatically

### Session-End Summarize

1. Collect what was produced in the session
2. Capture user feedback
3. Update learning docs
4. Sync registry/documentation

These loops prevent skill ecosystem drift as complexity grows. Without them, manual synchronization becomes unsustainable.

## Skill Governance

Before creating or importing a new skill:

1. Read prefaces/metadata of all installed skills
2. Map overlaps in intent and dependencies
3. Decide whether to merge, extend, or add a distinct skill
4. Register related sub-skills/dependencies explicitly
5. Add a dedicated `learnings.md` section from day one

## Workflow Composition

The core execution pattern is pipeline, not one-shot:

1. Run research skill (collect signal, produce brief)
2. Feed brief into content/copywriting skills
3. Apply brand context during generation
4. Apply learning feedback from prior runs before final draft
5. Execute on schedule for repeatable production

**Design rule**: every workflow step consumes shared context and emits artifacts usable by the next step.

## Key Principles

- Build a context-first system before adding execution skills
- Skill quality is a function of reference data quality, not prompt wording alone
- Explicit memory and feedback loops drive cross-session improvement
- Design skills as interoperable workflow components, not standalone utilities

## See Also

- [[Claude Code Multi-Agent Setup]] -- multi-instance team orchestration
- [[Claude Code Tips Collection]] -- practical tips for effective usage
- [[Obsidian]] -- knowledge base platform compatible with this workflow
