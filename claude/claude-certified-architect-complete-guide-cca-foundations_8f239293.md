---
tags: [claude, certification, cca, anthropic, agentic-architecture, mcp, prompt-engineering, exam-prep]
source: https://pub.towardsai.net/claude-certified-architect-the-complete-guide-to-passing-the-cca-foundations-exam-9665ce7342a8
---

# Claude Certified Architect: The Complete Guide to Passing the CCA Foundations Exam

## Article Info
- URL: https://pub.towardsai.net/claude-certified-architect-the-complete-guide-to-passing-the-cca-foundations-exam-9665ce7342a8
- Title: Claude Certified Architect: The Complete Guide to Passing the CCA Foundations Exam
- Author: Rick Hightower
- Publish time: 2026-03-24
- Access mode: `cookie-authenticated`

## Executive Summary

Anthropic launched the Claude Certified Architect (CCA) Foundations exam on March 12, 2026 — a 301-level, proctored, 60-question certification testing production-level Claude system design. This article (1 of 8 in the series) provides a complete exam roadmap: the 5 competency domains with weights, all 6 production scenarios, 5 critical mental models, a catalog of anti-patterns the exam heavily tests, and a 4-week study plan. The core thesis is that passing requires internalized hands-on judgment — not conceptual knowledge — with programmatic enforcement, explicit context passing, and correct MCP primitive boundaries being the most heavily tested concepts.

## Outline

1. **Why the CCA Matters Right Now** — $100M partner investment signals enterprise demand; early certification carries disproportionate career value
2. **Exam Format** — 60 questions, 120 min, proctored, 720/1000 to pass, 4 of 6 scenarios drawn randomly
3. **Domain 1: Agentic Architecture and Orchestration (27%)** — Multi-agent patterns, subagent context isolation, task decomposition, escalation logic
4. **Domain 2: Claude Code Configuration and Workflows (20%)** — CLAUDE.md hierarchy, slash commands, plan mode vs. direct execution, CI/CD flags
5. **Domain 3: Prompt Engineering and Structured Output (20%)** — JSON schema enforcement via tool_choice, structured outputs API, validation-retry loops
6. **Domain 4: Tool Design and MCP Integration (18%)** — MCP primitives (tools vs. resources vs. prompts), tool descriptions as routing, 4–5 tool rule
7. **Domain 5: Context Management and Reliability (15%)** — "Lost in the middle" effect, context degradation, token economics (Caching vs. Batch vs. Real-Time)
8. **The 6 Production Scenarios** — Brief preview of all six scenarios and their primary traps
9. **Critical Mental Models** — 5 principles that separate passing from failing candidates
10. **The Anti-Pattern Catalog** — Domain-by-domain catalog of what NOT to do
11. **4-Week Study Plan** — Week-by-week breakdown with course priorities and study hour allocation
12. **Key Terminology Glossary** — Testable terms with precise definitions
13. **Preparation Resources** — Official Anthropic resources, the 8-article series, and community materials

## Section Summaries

### 1. Why the CCA Matters Right Now

Anthropic backed the certification with a **$100 million Claude Partner Network investment**. Major partners are training at scale:

| Partner | Professionals Trained/Given Access |
|---------|-----------------------------------|
| Accenture | 30,000 (dedicated Anthropic Business Group) |
| Cognizant | 350,000 associates |
| Deloitte | 470,000 associates |
| Infosys | Center of Excellence |

> "You showing up with a CCA badge while the market is still forming is a different proposition than showing up two years from now when everyone has one."

The CCA is Anthropic's first-ever certification. Additional certifications (sellers, architects, developers) are planned for later 2026. The preparation process itself closes knowledge gaps around tool design, context management, and agentic architecture that hands-on work alone doesn't reveal.

---

### 2. Exam Format

| Attribute | Detail |
|-----------|--------|
| Questions | 60 scenario-based |
| Time | 120 minutes (~2 min/question) |
| Passing score | 720/1000 |
| Proctored | Yes, cannot pause once started |
| Scenarios | 4 of 6 drawn randomly |
| External aids | None — no Claude, no docs, no tools |

Key logistics:
- Questions are paragraph-length (150–200 words), describing production scenarios with plausible distractors
- Top scorers report speed came from **recognizing trap patterns instantly**, not reading every word
- Time management: quick first pass, flag uncertain questions, return with remaining time

---

### 3. Domain 1: Agentic Architecture and Orchestration (27%)

The heaviest domain — more than a quarter of the exam.

#### Multi-Agent Patterns
- **Coordinator-subagent**: coordinator delegates tasks to specialized subagents and synthesizes results
- **Hub-and-spoke**: parallel independent tasks with no dependencies between them
- Know when each is appropriate and when each fails

#### Subagent Context Isolation (Most Heavily Tested)

> Subagents do NOT inherit context automatically. When a coordinator spawns a subagent, the subagent starts with a blank context. You must explicitly pass everything it needs.

This is counterintuitive and one of the most tested concepts on the entire exam.

#### Other Tested Topics
- **Session state management**: where state lives, preventing unbounded context growth
- **Task decomposition**: correct granularity for subtasks
- **Agentic loop design**: receive input → reason → call tools → evaluate results → decide continue/return
- **Escalation logic**: deterministic rules over model-driven escalation

#### Exam Trap
> The "super agent" anti-pattern: one agent with 15+ tools instead of 3–4 specialized agents with 4–5 tools each. When you see an answer consolidating everything into a single agent, that answer is almost always wrong.

---

### 4. Domain 2: Claude Code Configuration and Workflows (20%)

#### CLAUDE.md Hierarchy
- **Project-level** (`.claude/CLAUDE.md`): shared via version control, team standards — the "tech lead" file
- **User-level** (`~/.claude/CLAUDE.md`): personal customizations, not shared
- Exam tests which file belongs in version control

#### Plan Mode vs. Direct Execution
- **Plan mode**: complex, multi-step tasks — Claude lays out approach before touching anything
- **Direct execution**: well-defined, lower-risk tasks
- Exam tests judgment about which mode fits a given scenario

#### CI/CD Integration (Heavily Tested)
- **`-p` flag**: non-interactive/headless mode — mandatory for CI/CD pipelines
- **`--bare` flag**: skips auto-discovery, ensures reproducibility
- **`--output-format json`**: structured JSON output for pipeline parsing (text, json, stream-json modes)

> The CI/CD questions almost always have a trap answer that involves running Claude Code interactively or without the `-p` flag. If `-p` is missing from the proposed solution, that solution is wrong.

---

### 5. Domain 3: Prompt Engineering and Structured Output (20%)

Core principle: **"reliable" means programmatic enforcement, not "works most of the time."**

#### Approaches Ranked by Reliability
1. **`tool_choice` with input schemas** — programmatically constrains output format
2. **Structured outputs API** — `client.messages.parse()` with Pydantic models (beta, requires `anthropic-beta: structured-outputs-2025-11-13` header)
3. **Validation-retry loops** — validate output against schema, send error back to Claude on failure; `tool_use` stop reason signals when to inspect
4. **Few-shot prompting** — useful but not a replacement for programmatic enforcement

#### Core Anti-Pattern

> Any answer choice that says "add instructions to the system prompt" or "include more detailed formatting guidance in the prompt" as the solution to JSON compliance is almost certainly wrong. The exam consistently rewards tool_choice, structured outputs API, and validation-retry loops over prompt-only approaches.

---

### 6. Domain 4: Tool Design and MCP Integration (18%)

Community feedback: **most candidates lose the most unexpected points here.**

#### MCP Primitives (Critical Boundary)

| Primitive | Purpose | When to Use |
|-----------|---------|-------------|
| **Tools** | Executable functions | Actions: querying a DB, calling an API, writing a file |
| **Resources** | Data for ingestion | Read-only context: docs, schemas, knowledge bases |
| **Prompts** | Predefined templates | Reusable instruction patterns |

> The tool-versus-resource boundary is the hardest judgment call. Ask: does Claude need to invoke it to take an action, or does it just need the data as context? Actions → tools. Context → resources.

#### Configuration Hierarchy
- `.mcp.json` = project-level (shared via VCS) — mirrors `.claude/CLAUDE.md`
- `~/.claude.json` = user-level (personal) — mirrors `~/.claude/CLAUDE.md`

#### Tool Description as Routing
- Tool descriptions are the **primary mechanism** Claude uses to decide which tool to call
- Agent names do not matter for routing; tool names matter less than descriptions
- Write descriptions as documentation for a developer who has never seen your codebase

#### The 4–5 Tool Rule
Anthropic's official guidance: 4–5 focused tools per agent. At 18+ tools, selection reliability degrades measurably. Distribute excess tools to specialized subagents.

---

### 7. Domain 5: Context Management and Reliability (15%)

Smallest by weight, but cross-cuts every scenario — study more than 15% suggests.

#### "Lost in the Middle" Effect
Content buried in the middle of the context window receives less attention. Place critical information at the **beginning or end**. This affects production agent performance measurably, regardless of total context window size.

#### Context Degradation in Long Sessions
Mitigations: structured summaries, periodic restatement of critical facts, anchoring important information at the start.

#### Escalation Design
Deterministic rules trigger escalation — NOT model self-assessment.

#### Token Economics (Must Be Memorized)

| API | Cost Savings | Latency | Use Case |
|-----|-------------|---------|----------|
| **Prompt Caching** | Up to 90% | Real-time | Repeated system prompts, policy docs, few-shot examples |
| **Message Batches API** | 50% | Up to 24 hrs (most < 1 hr) | Nightly audits, bulk processing, offline workloads |
| **Real-Time API** | Standard | Real-time | User-facing, blocking workflows |

> When users are actively waiting → never Batch API → answer is Prompt Caching for repeated context. When overnight processing → Batch API is almost always right.

---

### 8. The 6 Production Scenarios

Every exam draws 4 of 6 randomly — all must be prepared.

| # | Scenario | Primary Trap |
|---|----------|-------------|
| 1 | **Customer Support Resolution Agent** | Using Claude's self-reported confidence score for escalation (use programmatic rules: ticket category, dollar amount, account tier) |
| 2 | **Code Generation with Claude Code** | Believing larger context window solves attention distribution ("lost in the middle" applies regardless of size) |
| 3 | **Multi-Agent Research System** | "Super agent" with all 18 tools; forgetting subagents don't inherit coordinator context |
| 4 | **Developer Productivity Tools** | Misunderstanding plan mode vs. direct execution; wrong CLAUDE.md hierarchy |
| 5 | **Claude Code for CI/CD** | Missing `-p` flag; assuming interactive mode works in CI/CD |
| 6 | **Structured Data Extraction** | Prompt-only JSON enforcement instead of tool_choice + validation-retry |

---

### 9. Critical Mental Models

Five principles that form a coherent framework:

1. **Programmatic Enforcement > Prompt-Based Guidance** — Prompts are guidance; code is law. When a question asks how to ensure reliability, the answer involves code.
2. **Subagents Do Not Inherit Context** — Blank slate on spawn. Must explicitly pass everything needed. Counterintuitive and heavily tested.
3. **Tool Descriptions Drive Routing** — Claude reads descriptions, not agent/tool names. Write as developer documentation: specific, precise, unambiguous.
4. **"Lost in the Middle" Is Real** — Place critical info at beginning/end of context. Affects every long-context scenario.
5. **Match API to Latency Requirements** — Batch = background jobs. Real-Time = user-facing. Prompt Caching = cost optimization with real-time latency.

---

### 10. The Anti-Pattern Catalog

#### Domain 1: Agentic Architecture
- **Super agent with 15+ tools** → use 4–5 tools/agent + specialized subagents
- **Self-reported confidence for routing** → deterministic business rules (dollar amount, account tier, issue type)
- **Assuming subagents inherit context** → explicitly pass all needed context

#### Domain 2: Claude Code
- **No `-p` flag in CI/CD** → interactive mode hangs in headless environments; use `-p` + `--bare`
- **User preferences in project CLAUDE.md** → put personal config in `~/.claude/CLAUDE.md`
- **Direct execution for complex multi-file changes** → use plan mode

#### Domain 3: Prompt Engineering
- **Prompt-only JSON enforcement** → use `tool_choice` / structured outputs API
- **No validation-retry loop** → validate + retry with error context

#### Domain 4: Tool Design
- **Read-only data as a tool** → use MCP Resources for read-only, Tools for actions
- **Vague tool descriptions** → write precise descriptions stating what, when, and constraints

#### Domain 5: Context Management
- **Batch API for live support** → Real-Time API for user-facing workflows
- **Raw transcript as escalation handoff** → structured JSON summary with key fields at top
- **Critical info buried in middle of context** → anchor at beginning or end

---

### 11. 4-Week Study Plan

Assumes prior hands-on Claude experience. Add 2–4 weeks if starting from scratch.

| Week | Focus | Courses / Activities | Goal |
|------|-------|---------------------|------|
| 1 | Foundations & Mental Models | Claude 101, AI Fluency: Framework and Foundations | Internalize vocabulary: agentic loop, coordinator-subagent, context forking, stop reason, tool_choice, validation-retry loop, "lost in the middle" |
| 2 | Core Skills (Highest Investment) | Building with the Claude API (8–10 hrs) | Working code for: validation-retry loop, tool_choice-enforced structured output, simple agent with 3–4 tools |
| 3 | Advanced Topics (Domain 4 Landmine) | MCP Mastery, Claude Code in Action, Intro to Agent Skills | Working MCP server (3 tools + 1 resource), configured CLAUDE.md, Claude Code headless run, custom slash command |
| 4 | Practice & Exam Simulation | Official practice exam | Score 900+ on practice before scheduling real exam; capstone: coordinator + 2 subagents with explicit context passing |

#### Study Hours by Domain

| Domain | Weight | Hours | Notes |
|--------|--------|-------|-------|
| Agentic Architecture | 27% | 8–10 | Highest priority; build coordinator-subagent project |
| Claude Code Config | 20% | 6–7 | CI/CD and CLAUDE.md hierarchy heavily tested |
| Prompt Engineering | 20% | 6–7 | Build the validation-retry loop |
| Tool Design & MCP | 18% | 6–8 | **Add extra time** — harder than weight suggests |
| Context Management | 15% | 4–5 | Token economics table must be memorized |
| **Total** | 100% | **30–37** | |

---

### 12. Key Terminology Glossary

| Term | Definition |
|------|-----------|
| Agentic Loop | The cycle: receive input → reason → call tools → evaluate results → decide next step |
| Context Forking | Splitting context into separate branches for different subagents |
| Coordinator-Subagent Pattern | Coordinator delegates to specialized subagents and synthesizes results |
| Programmatic Hook | Code-level enforcement (e.g., PostToolUse) that validates/transforms tool outputs |
| Stop Reason | API signal for why generation stopped: `tool_use`, `end_turn`, `max_tokens` |
| `tool_choice` | API parameter: `auto` (model decides), `any` (must use a tool), or specific tool |
| Validation-Retry Loop | Check output against schema; on failure, send error back for correction |
| MCP Resources | Data catalogs/schemas exposed for ingestion (read-only context) |
| MCP Tools | Executable functions the model can invoke to take actions |
| MCP Prompts | Predefined instruction templates or workflows |

---

### 13. Preparation Resources

#### The 8-Article CCA Series
1. Complete Guide (this article) — exam roadmap
2. Customer Support Resolution Agent — escalation rules, compliance workflows
3. Code Generation with Claude Code — context degradation, CLAUDE.md, CI/CD
4. Structured Data Extraction — JSON schema enforcement, retry loops
5. Multi-Agent Research System — hub-and-spoke, context isolation, tool scoping
6. CI/CD Scenario — `-p`, `--bare`, structured JSON output
7. Developer Productivity — CLAUDE.md hierarchy, MCP config, team workflows
8. 60-Question Practice Exam — all 5 domains and 6 scenarios with explanations

#### Official Anthropic Resources
- Anthropic Academy: anthropic.skilljar.com (13 free courses)
- CCA Exam Guide on SlideShare
- Practice Exam via Anthropic Academy (benchmark: 900+ before live exam)

#### Official Documentation
- Claude Agent SDK, Claude Code, MCP, Advanced Tool Use, Batch Processing, Structured Outputs

---

## Key Takeaways
- CCA is a 301-level proctored exam: 60 questions, 120 min, 720/1000 to pass, no external tools — tests internalized production knowledge
- Domain 1 (Agentic Architecture, 27%) is the single heaviest domain; subagent context isolation and the super-agent anti-pattern are the top exam traps
- Programmatic enforcement (tool_choice, structured outputs API, validation-retry loops) always beats prompt-only approaches — this principle applies across Domains 1, 3, 4, and 6
- MCP tool-vs-resource boundary is the #1 source of unexpected point loss; tools = actions, resources = read-only context
- Token economics decision tree: user waiting → Prompt Caching; background jobs → Batch API; this is tested directly
- All 6 scenarios must be prepared despite only 4 appearing per exam — each has a specific "trap" answer pattern
- Early test-takers confirm: distractors are plausible, anti-pattern recognition matters as much as knowing correct patterns, 985/1000 is achievable

## Insights
- The exam's design philosophy rewards builders over readers — every study recommendation involves writing working code, not watching tutorials
- Domain 4 (18% weight) deserves 6–8 study hours despite lower weight; community feedback consistently flags it as the surprise difficulty spike
- The CLAUDE.md / `.mcp.json` hierarchy pattern appears in both Domain 2 and Domain 4 — one mental model (project = shared/VCS, user = personal) covers both
- CI/CD questions have a near-mechanical check: if `-p` flag is absent from the proposed solution, eliminate it immediately
- The 5 mental models form a coherent framework, not independent tips — they reinforce each other across all domains and scenarios

## Caveats
- Article is 1 of 8 in a series; scenario deep-dives and the 60-question practice exam are in separate articles
- Early candidate feedback is from the first 11 days post-launch (exam launched 2026-03-12) — patterns may shift as the candidate pool broadens
- The 4-week study plan assumes prior hands-on Claude experience; add 2–4 weeks if starting from scratch
- Recommended study hours (30–37 total) are the author's estimates, not official Anthropic guidance

## Sources
- https://pub.towardsai.net/claude-certified-architect-the-complete-guide-to-passing-the-cca-foundations-exam-9665ce7342a8
- Anthropic Academy: anthropic.skilljar.com (13 free courses)
- CCA Exam Guide: Official exam guide on SlideShare
- Claude Agent SDK Documentation
- Claude Code Documentation
- MCP Documentation
- Advanced Tool Use (Anthropic Engineering)
- Batch Processing Documentation
- Structured Outputs Documentation
