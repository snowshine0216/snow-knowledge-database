---
tags: [mcp, agent, fastapi, langgraph, python, llm-tools, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927466
---
# MCP Protocol — Building and Connecting Servers (Part 2)

The Model Context Protocol (MCP) enables LLM agents to invoke external tools through a standardized server–client protocol. This article covers how to build MCP servers in Python using two complementary libraries, how to connect them to LangGraph agents, and how to secure them in production.

## Key Concepts

- **`fastapi-mcp`**: A library that wraps an existing FastAPI application to expose its endpoints as MCP tools. Preserves the original REST API and documentation while adding an MCP layer. Install with `pip install fastapi-mcp`; import as `fastapi_mcp`.
- **`fastmcp`**: A minimal library for building MCP servers from scratch. Uses the `@mcp.tool()` decorator to register tools, with docstrings as the tool description read by the LLM.
- **operation_id / description**: The fields the LLM uses to select which tool to call. These must be precise and human-readable — vague descriptions cause incorrect or missed tool calls.
- **SSE transport (streamable_http)**: Connect to a remote MCP server over HTTP using Server-Sent Events. Suitable for deployed services.
- **stdio transport**: Launch a local Python script as a subprocess and communicate via stdin/stdout. Suitable for local development or co-located services.
- **`MultiServerMCPClient`**: A LangGraph adapter that connects a single agent to multiple MCP servers simultaneously, each covering a different business domain.
- **Separate port deployment**: Running the MCP server on a different port from the main API allows independent security controls, authentication, and access logging.

## Key Takeaways

- Use `fastapi-mcp` when you already have a FastAPI service; use `fastmcp` for new standalone MCP servers.
- Tool descriptions (docstring, `operation_id`, parameter `description`) are the LLM's only guide to selecting tools — write them carefully.
- LangGraph's stateful conversation context enables multi-turn dialogues across multiple MCP tool calls.
- Always add authentication and access logging before exposing MCP servers in production, especially for tools with write access.
- Separate MCP endpoints from your public API using different ports and stricter network rules.

## MCP in Multi-Agent Systems (CrewAI Practice)

*Source: [Module 5 Practice — MCP-based Multi-Agent Collaboration](https://u.geekbang.org/lesson/818?article=927469)*

MCP servers can be attached directly to **CrewAI** agents alongside traditional tools. This enables a multi-agent content-generation pipeline (Research → Write → Review) where agents can call MCP-backed tools for specialized data retrieval.

### CrewAI MCP Integration

Specify MCP servers when instantiating a CrewAI `Agent`:

```python
agent = Agent(
    role="Researcher",
    tools=[SerperTool()],
    mcps=[
        {"type": "sse", "url": "https://mcp-server.example.com/sse", "api_key": "..."},
    ]
)
```

Each MCP server listed under `mcps` is available as a callable tool during that agent's task execution.

### Multi-Agent Workflow Pattern

A three-agent crew with human approval gates:

1. **Agent1 (Researcher)** — searches topic, proposes 3 research directions with outlines
2. **Human checkpoint** — user selects a direction
3. **Agent2 (Writer)** — writes each chapter; human confirms each one before proceeding
4. **Agent3 (Reviewer)** — polishes the full draft; human confirms before saving

Human-in-the-Loop is implemented as simple `input()` pauses — no special tooling required.

### Checkpoint / Resume

Long multi-agent pipelines benefit from a JSON checkpoint file to survive crashes:
- Save state (topic, completed chapters, current position) after each major step
- On restart, detect incomplete checkpoint and offer resume vs. fresh start
- Track progress by comparing completed chapter count against expected total

### Using Non-OpenAI LLMs with CrewAI

CrewAI defaults to OpenAI. To use Qwen (or any OpenAI-compatible provider):

```python
os.environ["OPENAI_API_KEY"] = qianwen_api_key
os.environ["OPENAI_API_BASE"] = "https://dashscope.aliyuncs.com/compatible-mode/v1"
llm = ChatOpenAI(model="qwen-turbo", ...)
```

## See Also

- [[mcp-protocol-intro]]
- [[langgraph-agent-patterns]]
- [[llm-tool-use]]
- [[053-mcp-multi-agent-practice]]
