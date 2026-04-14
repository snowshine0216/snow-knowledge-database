---
tags: [mcp, multi-agent, crewai, langgraph, human-in-the-loop, ai-engineering, python, llm]
source: https://u.geekbang.org/lesson/818?article=927469
wiki: wiki/concepts/050-mcp-protocol-part-2.md
---

# 053: 模块五实践一 — 开发一个基于 MCP 协议的多 Agent 协作系统

**Source:** [模块五实践一开发一个基于 MCP 协议的多 Agent 协作系统](https://u.geekbang.org/lesson/818?article=927469)

## Outline
- [Problem Statement](#problem-statement)
- [Framework Selection](#framework-selection)
- [System Design: Multi-Agent Workflow](#system-design-multi-agent-workflow)
- [Agent Definitions (CrewAI)](#agent-definitions-crewai)
- [Human-in-the-Loop Mechanism](#human-in-the-loop-mechanism)
- [Checkpoint & Resume System](#checkpoint--resume-system)
- [MCP Integration](#mcp-integration)
- [Code Architecture](#code-architecture)
- [LLM Adapter: Qwen via OpenAI-Compatible API](#llm-adapter-qwen-via-openai-compatible-api)
- [Key Development Tips](#key-development-tips)
- [Key Takeaways](#key-takeaways)
- [Connections](#connections)

---

## Problem Statement

The practice task for Module 5 is to build a **MCP-based multi-agent collaboration system**. Given a user input like "Write an article about AI agents," the system should use multiple specialized agents to collaboratively complete: **Research → Writing → Review/Polishing**.

Three core questions to address when designing a multi-agent system:
1. **Ordering**: In what sequence do agents execute?
2. **Message passing**: How do agents share state/results with each other?
3. **Human intervention**: Are there decision points that require human confirmation?

---

## Framework Selection

The instructor evaluated several frameworks:

| Framework | Verdict | Reason |
|---|---|---|
| LangGraph | Rejected | Requires complex state management (Redis, gRPC), sub-graphs — self-inflicted complexity for this use case |
| AutoGen | Rejected | Not the right fit for this sequential pipeline with no heavy agent interaction requirements |
| **CrewAI** | **Selected** | Active community, clean YAML-based agent/task definitions, native MCP integration support |

**CrewAI** is the framework of choice for this practice project.

---

## System Design: Multi-Agent Workflow

The overall flow is a sequential pipeline with human approval gates after each major stage:

```
Human (input topic + requirements)
    ↓
Agent1 (Xiaomei) — Research & Search
    ↓
Human (choose research direction / outline)
    ↓
Agent2 (Xiaoqing) — Write Chapter 1
    ↓
Human (confirm or revise)
    ↓
Agent2 — Write Chapter 2
    ↓
Human (confirm or revise)
    ↓
... (repeat per chapter) ...
    ↓
Agent3 (Xiaoyin) — Review & Polish final draft
    ↓
Human (confirm save / request chapter revision / exit)
    ↓
Save final article
```

Three agents, each with a distinct role:
- **Agent1 (Xiaomei)**: Course/topic researcher — searches for material, proposes 3 research directions with outlines
- **Agent2 (Xiaoqing)**: Content writer — writes each chapter in sequence based on user-confirmed outline
- **Agent3 (Xiaoyin)**: Reviewer/editor — audits and polishes the full draft, outputs final version

---

## Agent Definitions (CrewAI)

CrewAI uses YAML configuration files to define agents and tasks:

**`agents.yaml`** — defines each agent's role, goal, and backstory:
```yaml
# Example structure
research_agent:
  role: Course Researcher (Xiaomei)
  goal: Search topic and propose 3 course directions with outlines
  backstory: Expert researcher who can use search tools
  tools: [Serper]

writing_agent:
  role: Course Writer (Xiaoqing)
  goal: Write course chapter content
  backstory: Professional content creator

review_agent:
  role: Course Reviewer (Xiaoyin)
  goal: Audit and polish the complete course content
  backstory: Senior editor and quality reviewer
```

**`tasks.yaml`** — maps tasks to agents and specifies expected outputs:
```yaml
research_task:
  description: Research the topic and propose directions
  expected_output: 3 course directions with chapter outlines (JSON format)
  agent: research_agent

writing_task:
  description: Write a single chapter based on confirmed outline
  expected_output: Full chapter content
  agent: writing_agent

review_task:
  description: Review all chapters and produce final polished draft
  expected_output: Final article saved to file
  agent: review_agent
```

Instructor preference: avoid the `@agent` / `@task` decorator pattern from official docs; instead instantiate agents/tasks directly in a class — cleaner and more explicit.

---

## Human-in-the-Loop Mechanism

Human approval gates are implemented as simple `input()` pauses in the Python code:

1. **After research**: User selects one of 3 proposed research directions (e.g., input `2` for Direction 2)
2. **After outline generation**: User confirms outline or requests regeneration with different requirements
3. **After each chapter**: User confirms chapter content or asks for revision
4. **After review**: User chooses to save, revise a specific chapter, or exit

This is a manual `Human in the Loop` — no special framework magic, just well-placed `input()` prompts that pause the agent pipeline.

---

## Checkpoint & Resume System

Because the full pipeline is long-running, the system implements a **checkpoint file** (`cursor_checkpoint.json`) to allow resume after crashes:

**Checkpoint operations**:
- `_save_checkpoint()` — saves current state (topic, requirements, completed chapters, current position) as JSON
- `_load_checkpoint()` — reads existing checkpoint on startup
- `_clear_checkpoint()` — deletes checkpoint on successful completion

**Startup logic**:
```python
# On startup:
# 1. Check if checkpoint file exists and is incomplete
# 2. Ask user: resume (y) or start fresh (n)?
# 3. If resume: load topic, requirements, completed chapters, and continue
# 4. If fresh: collect new topic/requirements, save checkpoint, begin research
```

Progress is tracked by comparing the number of completed chapters vs. the expected total. If the count is less than expected, the run was interrupted and can be resumed from where it left off.

---

## MCP Integration

CrewAI supports MCP servers natively — specify them when instantiating an agent:

```python
agent = Agent(
    role="Researcher",
    tools=[SerperTool()],
    mcps=[
        {"type": "sse", "url": "https://mcp-server.example.com/sse", "api_key": "..."},
        # Additional MCP endpoints (finance, biomedical, education, etc.)
    ]
)
```

In the demo, two MCP servers (financial data, biomedical) were specified but failed to connect due to missing API keys. The primary search tool used was **Serper** (Google search API). The MCP configuration was shown for demonstration purposes — connecting real MCP servers simply requires valid credentials.

---

## Code Architecture

The system is organized as a single Python class `CourseMakerSystem` with internal (underscore-prefixed) helper methods:

```
project/
├── src/
│   └── course_maker.py       # Main class
├── config/
│   ├── agents.yaml           # Agent definitions
│   └── tasks.yaml            # Task definitions
├── main.py                   # Entry point
└── cursor_checkpoint.json    # Runtime checkpoint (auto-managed)
```

**Class structure** (`CourseMakerSystem`):

```python
class CourseMakerSystem:
    def __init__(self):
        self._load_config()        # Load YAML configs
        self._init_llm()           # Initialize LLM
        self._create_agents()      # Instantiate CrewAI agents
        self._load_checkpoint()    # Load resume state if any

    def run(self):
        # 1. Resume or start fresh
        # 2. _run_research() → human selects direction
        # 3. _save_checkpoint()
        # 4. _run_outline() → human confirms outline
        # 5. Loop: _run_chapter(i) → human confirms each chapter
        # 6. _run_review() → human confirms final
        # 7. Save article

    def _load_config(self): ...
    def _init_llm(self): ...
    def _create_agents(self): ...
    def _create_tasks(self): ...
    def _extract_outline_json(self, text): ...  # Parse LLM JSON output
    def _save_checkpoint(self, state): ...
    def _load_checkpoint(self): ...
    def _clear_checkpoint(self): ...
    def _run_research(self): ...
    def _run_outline(self, direction): ...
    def _run_chapter(self, chapter_info): ...
    def _run_review(self, all_chapters): ...
```

The underscore prefix convention signals that these are internal methods, not part of the public API — a Python idiom for encapsulation.

---

## LLM Adapter: Qwen via OpenAI-Compatible API

CrewAI defaults to OpenAI. To use **Qwen (Tongyi)**, the instructor wraps it to look like OpenAI:

```python
def _init_llm(self):
    # Set env vars so CrewAI treats Qwen as OpenAI
    os.environ["OPENAI_API_KEY"] = self.config["qianwen_api_key"]
    os.environ["OPENAI_API_BASE"] = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    return ChatOpenAI(
        model=self.config["model_name"],  # e.g., "qwen-turbo"
        base_url=os.environ["OPENAI_API_BASE"],
        api_key=os.environ["OPENAI_API_KEY"],
        temperature=0.7,
        streaming=True,
    )
```

This avoids modifying CrewAI internals — the framework sees a standard `ChatOpenAI` instance pointed at the Qwen DashScope endpoint.

---

## Key Development Tips

1. **Read framework docs before coding**: Study the CrewAI quickstart to understand the expected file structure (YAML configs, agent patterns) before writing any code.

2. **Write scaffolding yourself, delegate logic to LLM**: Write the class skeleton and function signatures by hand. Let the LLM fill in internal logic. This avoids the 80% failure rate of asking LLM to generate entire framework code from scratch.

3. **Avoid decorator pattern for better readability**: CrewAI's official `@agent`/`@task` decorators work but can be less clear than direct instantiation in a class.

4. **One-shot prompting for boilerplate**: Paste official docs into the LLM and ask it to generate initialization code based on the pattern shown — this works well for framework boilerplate.

5. **Checkpoint early and often**: Long-running pipelines will crash. Design checkpoint save/load from the start, not as an afterthought.

6. **Validate LLM output format**: Always parse and validate JSON output from agents before passing it to the next stage. A format error in the outline will break all downstream chapter generation.

---

## Key Takeaways

- A multi-agent system for document generation (research → write → review) maps naturally to a sequential CrewAI crew with three specialized agents
- **Human-in-the-Loop** is implemented simply as `input()` pauses at key decision points — no special tooling needed
- **Checkpoint/resume** is essential for long-running multi-step pipelines and is easy to implement as a JSON file
- **CrewAI + MCP**: agents can be equipped with MCP server tools (SSE endpoints) alongside traditional tools; simply list them in the agent's `mcps` parameter
- **Qwen as OpenAI drop-in**: any OpenAI-compatible LLM can be used with CrewAI by pointing `OPENAI_API_BASE` to the alternative provider and wrapping with `ChatOpenAI`
- Write framework scaffolding manually; use LLM to fill in logic — this produces more stable code than fully LLM-generated implementations
- YAML-based agent/task definitions keep agent configuration declarative and separate from execution logic

---

## Connections

- → [[crewai-framework]]
- → [[mcp-model-context-protocol]]
- → [[human-in-the-loop]]
- → [[langgraph-multi-agent]]
- → [[llm-tool-calling]]
- → [[deep-research-pattern]]
