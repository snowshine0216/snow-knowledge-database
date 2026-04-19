---
tags: [a2a, agent-to-agent, multi-agent, protocol, mcp, llm, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927467
wiki: wiki/concepts/051-a2a-protocol.md
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. MCP (Model Context Protocol) and A2A (Agent-to-Agent) are both inter-agent protocols — what do you think is the key difference in what each one connects?
2. If you were designing a standard for agents to discover each other's capabilities across different networks, where and in what format would you publish that capability information?
3. When two AI agents built on different frameworks (e.g., LangGraph and CrewAI) need to collaborate across separate servers, what challenges would they face without a shared protocol?

---

# 051: A2A (Agent-to-Agent) Protocol Deep Dive

**Source:** [7MCP 与 A2A 协议详解-A2A](https://u.geekbang.org/lesson/818?article=927467)

## Outline
- [MCP vs A2A: Positioning](#mcp-vs-a2a-positioning)
- [What is A2A?](#what-is-a2a)
- [The Four Required Capabilities](#the-four-required-capabilities)
- [Three Core Components](#three-core-components)
- [Three Secondary Components](#three-secondary-components)
- [MCP vs A2A Comparison](#mcp-vs-a2a-comparison)
- [Demo: Running A2A Examples](#demo-running-a2a-examples)
- [When to Use A2A](#when-to-use-a2a)
- [Key Takeaways](#key-takeaways)
- [Connections](#connections)

---

## MCP vs A2A: Positioning

The two protocols serve fundamentally different purposes:

| Protocol | Purpose |
|---|---|
| **MCP** | Agent → Tool (connect an agent to tools: APIs, resources, prompts) |
| **A2A** | Agent → Agent (connect an agent to another agent) |

**Decision rule:**
- Connecting to a tool → use MCP
- Connecting two agents → use A2A

---

## What is A2A?

A2A (Agent-to-Agent) is an **open protocol released by Google** that enables agents built with different frameworks and different underlying LLMs to communicate in a standardized way.

Key properties of A2A:
- **Framework-agnostic**: no requirements on which agent framework is used (LangGraph, AutoGen, CrewAI, Google ADK, etc.)
- **Model-agnostic**: no requirements on which LLM provider is used (Gemini, Qianwen, OpenAI, etc.)
- **Open standard**: published as a specification anyone can implement

**Analogy — USB interface**: Just as USB lets any compliant device (keyboard, mouse, printer, camera, another computer) plug into any compliant host, A2A lets any compliant agent connect to any other compliant agent regardless of internal implementation.

A2A does **not** handle agent implementation logic — it only handles **inter-agent communication**. The same is true of MCP: MCP handles agent-to-tool communication only, not the tool's internal logic.

---

## The Four Required Capabilities

For A2A to achieve its goal of universal agent interoperability, it must provide four capabilities:

### 1. Discovery (Agent Card)
Agents need to discover each other's capabilities before communicating. This is solved by the **Agent Card**:
- A publicly accessible JSON file hosted at `/.well-known/agent.json` on the A2A server
- Contains: agent name, description, skills, endpoint URLs, authentication methods
- Analogous to USB device descriptors — the device tells the host what it is and what it can do

### 2. Task Management (Task)
A task represents a concrete unit of work. Tasks:
- Have a unique identifier enabling multi-turn tracking across the conversation
- Support both short-lived and long-lived interactions
- Enable state management throughout the conversation lifecycle

### 3. Collaboration / Context Passing (Message)
The message is the communication object between client and agent (or agent and agent):
- Two roles: `user` (human) and `agent` (another agent)
- Carries **parts** — the payload of a message — supporting: plain text, partial text, structured data, multimodal content
- Enables multi-turn dialogue with automatic context/state management (no manual context stitching)

### 4. Human-in-the-Loop (Negotiation)
A2A supports negotiating the format and structure of returned results to align with user expectations. This is still an emerging capability in practice.

---

## Three Core Components

These three are **required** for any A2A implementation:

### Agent Card
- Defined at server startup
- Exposes: name, description, skills list, authentication requirements
- Example structure (from official A2A simple demo):
  ```python
  # Server defines AgentCard with name, description, and skills
  agent_card = AgentCard(
      name="...",
      description="...",
      skills=[AgentSkill(id="hello-world", name="Hello World", ...)],
      url="http://localhost:10001",
  )
  ```

### Task
- Represents a single work unit in an ongoing interaction
- Provides the unique ID for tracking conversation state across turns
- Equivalent to a "session" scoped to one agentic job

### Message
- The envelope for in-flight communication between agents
- Role field: `user` or `agent`
- Parts field: typed payload (text, data, multimodal)

---

## Three Secondary Components

These are optional / emerging:

| Component | Purpose |
|---|---|
| **Artifact** | The final output returned to the user after task completion (as opposed to Message, which is intermediate) |
| **Push Notice** | Server-sent notifications to the client |
| **Streaming** | Whether the agent supports streaming output |

In practice, most current A2A usage only requires the three core components.

---

## MCP vs A2A Comparison

| Dimension | MCP | A2A |
|---|---|---|
| **Purpose** | Agent → Tool | Agent → Agent |
| **Statefulness** | Stateless (single call → return) | Stateful (multi-turn, session managed) |
| **Participants** | Agent + Tool (tool is passive) | Two autonomous agents (both expose Agent Cards) |
| **Context management** | Caller manages manually | A2A protocol manages automatically |
| **Capability discovery** | Tool list via MCP server | Agent Card at `/.well-known/agent.json` |

**Both agents must expose an Agent Card** for bidirectional A2A communication. If only one side exposes a card, communication is one-directional only.

---

## Demo: Running A2A Examples

### Environment Setup
```bash
# Python >= 3.12 required
python --version

# Install uv (Python package + env manager)
pip install uv

# Create virtual environment pinned to Python 3.13
uv venv --python 3.13 a2a
source a2a/bin/activate
```

### Official A2A Simple Examples
Repository: `google-a2a/a2a-simple` on GitHub

Structure (Python):
```
simple/python/agents/
  crewai/       # CrewAI-based image generation agent (port 10000)
  langgraph/    # LangGraph-based currency conversion agent (port 10001)
  ...
hosts/
  a2a-ui/       # Visual browser UI for connecting to A2A agents
  multiagent/   # Multi-agent host that registers multiple A2A agents
```

### Running the CrewAI Agent (port 10000)
```bash
cd simple/python/agents/crewai
export GOOGLE_API_KEY=<your-key>
uv run .
# Agent card available at: http://localhost:10000/.well-known/agent.json
```

### Running the LangGraph Agent (port 10001)
```bash
cd simple/python/agents/langgraph
uv run app
# Agent card available at: http://localhost:10001/.well-known/agent.json
```

### Running the Visual UI (port 8000)
```bash
cd hosts/a2a-ui
uv pip install -r requirements.txt
uv run . --port 8000
# Open browser at http://localhost:8000
# Enter any A2A agent URL to discover its capabilities and chat
```

### How the Demo Works
1. UI (itself an A2A agent) fetches the target agent's Agent Card
2. UI now knows the remote agent's skills
3. User sends a message; UI routes it to the correct agent based on skill match
4. Remote agent executes the task (e.g., currency conversion via LangGraph + Gemini API)
5. Result returned as an Artifact back through the message queue

### Wrapping an Existing Agent with A2A
Adding A2A support to a LangGraph agent requires only:
1. Define `AgentCard` + `AgentSkill`
2. Wrap execution logic in a `RequestHandler`
3. Start the A2A server and register card + handler

The agent's internal logic (graph, tools, LLM calls) is unchanged — A2A is an outer wrapper layer.

---

## When to Use A2A

Use A2A when **all three conditions are met**:

1. **Heterogeneous frameworks**: agents are built with different frameworks (LangGraph on one side, CrewAI or AutoGen on the other)
2. **Different hosts**: agents are deployed on separate machines/processes (not the same in-process runtime)
3. **Multi-turn with state**: the interaction requires multiple exchanges and session state management

**Do NOT use A2A when:**
- Both agents use the same framework → use that framework's native inter-agent communication (shared memory, graph edges, variables)
- Single-call / stateless interaction → wrap the remote agent as an MCP tool instead
- Same process or same host → use direct function calls or framework primitives

**Security note**: A2A's current authentication is basic HTTP-level only — not sufficient against malicious external callers. Keep A2A endpoints **internal** (intranet / private network) for now.

### Decision Tree
```
Cross-framework? Separate hosts?
  ├── No  → use same-framework primitives (LangGraph nodes, etc.)
  └── Yes
        Multi-turn + state needed?
          ├── No  → wrap as MCP tool
          └── Yes → use A2A
```

### Special Case: Same Framework, Multiple Projects, Complex Interaction
If you have two projects both using e.g. CrewAI that need complex bidirectional interaction:
- Build a **third agent** that treats both as tools
- Implement the complex orchestration logic in the third agent

---

## Key Takeaways

- A2A is Google's open protocol for **agent-to-agent** communication; MCP is for **agent-to-tool** communication — they are complementary, not competing
- A2A is a **communication standard**, not an agent implementation framework; it does not replace LangGraph, AutoGen, CrewAI etc.
- The **Agent Card** (`/.well-known/agent.json`) is the fundamental discovery mechanism — without it, agents cannot find each other
- A2A is **stateful** by design, handling multi-turn dialogue and session management automatically
- The protocol is **young (released 2025)** and still maturing; the SDK structure has already changed (simple examples separated into their own repo)
- For most current multi-agent work within a single framework/host, A2A adds overhead with little benefit — use it only at cross-framework, cross-host boundaries
- Current A2A authentication is basic; do not expose A2A endpoints publicly

---

## Connections
- → [[mcp-protocol]]
- → [[multi-agent-systems]]
- → [[langgraph]]
- → [[crewai]]
- → [[google-adk]]


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words what an Agent Card is, where it lives, and why it is the foundational piece of A2A communication.
2. Walk through the decision tree for choosing between same-framework primitives, MCP, and A2A — what three conditions must all be true before you reach for A2A?
3. Explain why A2A is described as "stateful" while MCP is "stateless," and what practical problem that statefulness solves for multi-agent systems.

> [!example]- Answer Guide
> 
> #### Q1 — Agent Card: Purpose and Location
> 
> The Agent Card is a publicly accessible JSON file hosted at `/.well-known/agent.json` on each A2A server; it contains the agent's name, description, skills, endpoint URLs, and authentication methods. It is foundational because without it, other agents have no way to discover what a remote agent can do before initiating communication.
> 
> #### Q2 — Choosing Between Primitives, MCP, A2A
> 
> All three conditions must hold: agents are built on **heterogeneous frameworks**, deployed on **separate hosts/processes**, and the interaction requires **multi-turn dialogue with session state**. If any condition is false — same framework, stateless single call, or same host — use framework primitives, direct function calls, or wrap the remote agent as an MCP tool instead.
> 
> #### Q3 — A2A Stateful vs MCP Stateless
> 
> MCP is stateless: each tool call is a single request–response with no memory of previous exchanges, and the calling agent must manage context manually. A2A is stateful: the Task object carries a unique ID across turns and the protocol automatically manages session context, enabling multi-turn conversations without the client stitching together history by hand.
