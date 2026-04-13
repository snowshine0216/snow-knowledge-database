---
tags: [agent, multimodal, rpa, pyautogui, automation, llm, workflow, tool-use]
source: https://u.geekbang.org/lesson/818?article=927486
---
# Agent in Multimodal Reasoning — Typical Scenarios

Three typical Agent scenarios for multimodal reasoning tasks, with deep focus on RPA (Robotic Process Automation) as a practical extension of LLM tool-use capability.

## Three Multimodal Agent Scenarios

1. **Text → Image retrieval** — search for images based on text queries
2. **Image → Text interpretation** — parse/explain text content within images (OCR-driven)
3. **RPA automation** — GUI/web automation integrated with LLMs for end-to-end workflows

## RPA as an Agent Tool Layer

RPA is positioned as the **outer extension layer** of LLM capability — handling local GUI interactions and web automation that LLMs cannot perform natively. Two tools are introduced:

### PyAutoGUI (simple)
Python library for raw mouse/keyboard control. Operates at pixel-coordinate level:
- Move mouse, click (single/double/right), scroll
- Find UI elements by image matching
- Type text or press keyboard shortcuts

**Vision-feedback loop pattern:**
`PyAutoGUI action → screenshot → multimodal LLM analysis → decide next action → repeat`

### 引刀 (Yindao) — higher-level RPA
Windows RPA application with drag-and-drop workflow builder:
- Works with web element selectors (not raw coordinates) — more robust
- Supports PC and mobile automation
- Built-in connectors for Chinese platforms (Douyin, Pinduoduo, JD, etc.)
- Can invoke LLMs directly or delegate to an external Dify workflow via HTTP

## Connecting RPA to LLMs via HTTP

The recommended pattern: connect 引刀 to a self-hosted [[dify-workflow]] using HTTP POST.

```python
# 引刀 Python module
import requests, json

def run(variable):
    url = "http://<dify-server>/v1/workflows/run"
    headers = {
        "Authorization": "Bearer <api-key>",
        "Content-Type": "application/json"
    }
    data = {"inputs": {"query": variable}, "response_mode": "blocking", "user": "rpa"}
    return requests.post(url, headers=headers, json=data).json()
```

### Two integration modes

| Mode | Direction | Use case |
|------|-----------|----------|
| A — RPA calls Dify | RPA → HTTP POST → Dify → result | RPA workflow needs LLM reasoning mid-flow |
| B — Dify calls RPA | External service → RPA → process → return | LLM dispatches tasks to local GUI automation |

## Positioning in Agent Ecosystem

| Layer | Tool | Abstraction |
|-------|------|-------------|
| Raw automation | PyAutoGUI | Pixel coordinates |
| Web automation | 引刀 / RPA tools | DOM element selectors |
| API-first tools | [[mcp-tool-protocol]] | Programmatic APIs |
| LLM-native | Function calling | Reasoning-integrated |

RPA fills the gap between raw scripting and MCP — more accessible to non-programmers, richer in pre-built connectors for real-world platforms.

## Evolution Path of LLM Applications

RAG → Agent → [[react-agent-pattern]] reasoning → Memory → [[multi-agent-systems]] → **Deep business tool integration (RPA)**

## Related

- [[dify-workflow]] — LLM orchestration backend used as the AI layer
- [[react-agent-pattern]] — reasoning loop driving tool selection
- [[multi-agent-systems]] — broader architecture context
- [[mcp-tool-protocol]] — alternative tool invocation standard
- [[langchain-agents]] — related agent framework
