---
tags: [agent, multimodal, rpa, pyautogui, automation, llm, workflow, tool-use]
source: https://u.geekbang.org/lesson/818?article=927486
wiki: wiki/concepts/071-agent-multimodal-reasoning.md
---
# 071: Agent in Multimodal Reasoning — Typical Scenarios

**Source:** [8Agent在多模态推理任务中的典型场景](https://u.geekbang.org/lesson/818?article=927486)

## Outline

This lecture covers three Agent application scenarios in multimodal reasoning tasks. Lecture 071 focuses primarily on the **third scenario: RPA (Robotic Process Automation)** — combining GUI automation tools with large language models to create powerful agentic workflows.

1. Scene 1 (recap): Text → Image retrieval
2. Scene 2 (recap): Image → Text interpretation
3. Scene 3 (main focus): RPA — GUI/web automation integrated with LLMs

---

## Section 1: Why RPA as an Agent Tool

The instructor argues RPA is a near-term, highly practical direction for Agent tooling for two reasons:

1. **AI coding lowers the barrier** — programs are increasingly easy to write, so the bottleneck shifts to connecting programs with existing external tools rather than building from scratch
2. **LLM + RPA = complementary pairing** — LLMs provide intelligence; RPA provides the dexterous, local GUI/web interaction capability that LLMs lack natively

The evolution of LLM application patterns described:
- RAG (was mainstream)
- Agent (emerging)
- ReAct-style reasoning with tool calls
- Memory within Agents
- Multi-agent systems
- **Deep business integration via tool invocation (RPA represents this layer)**

---

## Section 2: PyAutoGUI — Simple GUI Automation

**PyAutoGUI** is a Python library for basic mouse/keyboard automation:

- Get screen size and mouse coordinates
- Move mouse to specified coordinates (`moveTo`)
- Single-click, double-click, right-click
- Find and click UI elements by image matching
- Scroll the mouse wheel
- Type text or press specific keys

**Limitation:** PyAutoGUI operates at raw coordinate level. It simulates user input (mouse position + keyboard) without understanding web page structure. This makes it brittle for web automation — requiring precise coordinates for every interaction.

**Integration pattern with LLM:**
1. Perform action (click, type, etc.) via PyAutoGUI
2. Take screenshot of current screen state
3. Send screenshot to multimodal LLM
4. LLM interprets result and decides next action
5. Drive PyAutoGUI for next step

This creates a vision-feedback loop: `Action → Screenshot → LLM Analysis → Next Action`.

---

## Section 3: 引刀 (Yindao) — Higher-Level RPA Tool

**引刀** (Yindao) is a Windows RPA application that abstracts web page interactions above raw coordinates:

- Visual workflow builder (drag-and-drop, serial flow steps)
- Captures web page elements (Ctrl+Shift+Click to capture DOM elements)
- Supports PC and mobile automation
- Abstracts common operations: open browser, fill forms, click buttons, download files
- Built-in support for Excel/spreadsheet operations and custom instructions
- Can automate platforms: Douyin (TikTok backend), Pinduoduo, Jingdong, etc.

**Key advantage over PyAutoGUI:** Works with web element selectors (like Selenium) rather than pixel coordinates, making workflows more robust.

**Built-in AI integration:**
- Can invoke LLMs directly for summarization, translation, analysis, and form filling
- Accepts the previous step's output object as input to the LLM call
- Can pass dynamic image paths to multimodal LLMs
- LLM result is embedded back into the workflow

**Limitation noted:** Using built-in AI requires topping up credits; the instructor prefers calling an external self-hosted LLM (Dify) instead.

---

## Section 4: Connecting RPA to External LLMs via HTTP

The instructor demonstrates connecting 引刀 to a self-hosted **Dify** workflow via HTTP API:

### Connection parameters needed:
- **URL**: `http://<server>/v1/workflows/run` (for workflow) or `/v1/chat-messages` (for chat)
- **Auth**: API key in `Authorization: Bearer <key>` header
- **Content-Type**: `application/json`
- **Method**: HTTP POST
- **Body**: JSON with input variables

### Implementation in 引刀's Python module:
```python
# 引刀 Python module boilerplate (keep default format)
import requests, json

def run(variable):
    url = "http://<dify-server>/v1/workflows/run"
    headers = {
        "Authorization": "Bearer <api-key>",
        "Content-Type": "application/json"
    }
    data = {"inputs": {"a": variable}, "response_mode": "blocking", "user": "rpa-client"}
    response = requests.post(url, headers=headers, json=data)
    return response.json()
```

- For cloud endpoints: configure a proxy in the request
- For local endpoints: direct `requests.post` without proxy
- The `requests` package must be installed via 引刀's Python package manager

### Two integration modes:

**Mode A — RPA calls Dify as a sub-workflow:**
```
引刀 workflow → HTTP POST → Dify workflow → result returned → continue 引刀 workflow
```

**Mode B — Dify calls RPA as a polling service:**
```
User message (e.g., Douyin inquiry) → external service → forward to RPA → RPA processes → return result to external service
```

Mode B is particularly powerful: the RPA tool acts as a client that periodically fetches tasks from an external service, processes them (e.g., look up product info, fill forms), then returns results.

---

## Section 5: Positioning RPA in the Agent Ecosystem

| Tool | Abstraction Level | Strength |
|------|------------------|----------|
| PyAutoGUI | Raw coordinates | Simple, zero-setup |
| 引刀 / RPA tools | Web element selectors + visual workflow | Richer, handles real web apps |
| MCP tools | Programmatic APIs | Developer-facing, code-first |
| Function calling / tool use | LLM-native | Tightly integrated with reasoning |

RPA occupies a practical middle ground:
- More accessible than raw MCP server development
- Richer ecosystem (pre-built connectors for major Chinese platforms) than DIY function-calling
- Enables non-programmers to build automation workflows visually

The instructor positions RPA as **the outer extension layer of LLM capability** — handling local GUI interactions and web automation that LLMs cannot do natively.

---

## Key Takeaways

1. **Three multimodal Agent scenarios**: text→image search, image→text interpretation, RPA automation
2. **PyAutoGUI** provides simple keyboard/mouse automation; pair with screenshot + LLM for a vision-feedback loop
3. **Higher-level RPA tools** (like 引刀) abstract web elements, making automation more robust than coordinate-based approaches
4. **LLMs integrate with RPA via HTTP API** — either the RPA calls an LLM workflow, or an LLM workflow calls the RPA as an external service
5. **Dify** serves as the LLM orchestration backend; `requests.post` with JSON body connects RPA to any LLM API endpoint
6. **Evolution path**: RAG → Agent → ReAct → Memory → Multi-agent → **Deep tool/RPA integration**
7. RPA is positioned as more accessible than MCP for business workflow automation, especially for Chinese SaaS platforms

---

## Connections

- [[dify-workflow]] — self-hosted LLM workflow platform used as the AI backend
- [[react-agent-pattern]] — reasoning loop that drives tool selection
- [[multi-agent-systems]] — the broader architecture that RPA tool-use feeds into
- [[mcp-tool-protocol]] — alternative/complementary tool invocation standard
- [[pyautogui]] — Python GUI automation library covered in this lecture
- [[langchain-agents]] — related agent framework context from earlier lectures
