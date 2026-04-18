---
tags: [mcp, agent, fastapi, langgraph, python, llm-tools, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927466
wiki: wiki/concepts/050-mcp-protocol-part-2.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 如果你已经有一个 FastAPI 服务，想把它的接口暴露给 AI Agent 使用，你会怎么做？
2. LLM 在调用工具时，是如何"知道"应该调用哪个工具的？它依赖什么信息来做决策？
3. 在生产环境中把 MCP 服务器部署到与业务 API 不同的端口，主要是出于什么考虑？

---

# 050: MCP Protocol Deep Dive — Part 2

**Source:** [6MCP 与 A2A 协议详解-MCP2](https://u.geekbang.org/lesson/818?article=927466)

## Outline
- [Review: Cursor IDE + MCP Best Practice](#review-cursor-ide--mcp-best-practice)
- [Two Ways to Build an MCP Server](#two-ways-to-build-an-mcp-server)
- [Method 1: FastAPI + fastapi-mcp](#method-1-fastapi--fastapi-mcp)
  - [FastAPI MCP — Integrated Deployment](#fastapi-mcp--integrated-deployment)
  - [FastAPI MCP — Separate Deployment](#fastapi-mcp--separate-deployment)
  - [Client Configuration (SSE)](#client-configuration-sse)
  - [Writing Good Tool Descriptions](#writing-good-tool-descriptions)
- [Method 2: fastmcp (from-scratch)](#method-2-fastmcp-from-scratch)
- [Full Example: LangGraph + MCP (Logistics Agent)](#full-example-langgraph--mcp-logistics-agent)
  - [Server Side (fastmcp)](#server-side-fastmcp)
  - [Client Side (LangGraph + MultiServerMCPClient)](#client-side-langgraph--multiservcermcpclient)
  - [Running the Demo](#running-the-demo)
- [Security Best Practices](#security-best-practices)
- [Key Takeaways](#key-takeaways)

---

## Review: Cursor IDE + MCP Best Practice

The lecture opens by reviewing the MCP best-practice demo from the previous session, which used Cursor IDE as the agent host. The workflow illustrated:

1. User submits a travel request to the Cursor AI agent.
2. The agent decomposes the task using a large language model.
3. The agent calls registered MCP servers multiple times (attraction search, weather query, route calculation).
4. Results are aggregated into a 4-day itinerary.
5. A map UI and travel guide document are generated and deployed to a browser.

Key insight: Cursor IDE is simply a convenient agent that supports MCP. Any agent that implements the MCP client protocol can take its place.

---

## Two Ways to Build an MCP Server

When you need to **expose your own business logic as MCP**, there are two Python approaches:

| Approach | Library | Best When |
|---|---|---|
| `fastapi-mcp` | `fastapi` + `fastapi-mcp` | You already have a FastAPI service and want to add MCP on top |
| `fastmcp` | `fastmcp` (standalone) | You are starting from scratch and want minimal code |

---

## Method 1: FastAPI + fastapi-mcp

### Installation

```bash
pip install fastapi-mcp   # install name uses hyphen
```

Import name differs from install name:

```python
from fastapi import FastAPI
from fastapi_mcp import FastApiMCP   # underscore in import
```

> Note: In Python, the install package name and the import name often differ. Always check both.

### FastAPI MCP — Integrated Deployment

Wrap an existing FastAPI app with MCP in a few lines:

```python
app = FastAPI()

# ... existing routes ...

mcp = FastApiMCP(
    app,
    include_operations=["get_user_info"],  # control which endpoints are exposed
    include_schemas=True,
)
mcp.mount()   # attach MCP server to the same app

uvicorn.run(app, host="0.0.0.0", port=8000)
```

The original REST API remains intact; MCP is layered on top.

### FastAPI MCP — Separate Deployment

For production, split the API server and the MCP server onto different ports:

```python
# API app runs on port 8081
uvicorn.run(api_app, host="0.0.0.0", port=8081)

# MCP server runs on port 8000
uvicorn.run(mcp_app, host="0.0.0.0", port=8000)
```

Reasons to separate:
- The original API may have broad access rules; the MCP endpoint needs stricter controls.
- Separate ports make security policies (authentication, IP allow-lists, logging) easier to enforce.
- MCP is typically consumed by agents, not end-users.

### Client Configuration (SSE)

Clients connect to the MCP server via SSE (Server-Sent Events). Example client config:

```json
{
  "mcp_server": {
    "url": "http://127.0.0.1:8000/mcp",
    "connection_type": "sse",
    "timeout": 60
  }
}
```

The server sends a `ping` every 60 seconds; the client auto-reconnects on timeout.

### Writing Good Tool Descriptions

Poor tool descriptions cause the LLM to call the wrong tool or fail to call any. Always set:

```python
@app.get(
    "/users/{user_id}",
    operation_id="get_user_info",          # readable function name shown to LLM
    summary="获取用户信息",                  # short description
    description="根据用户ID获取用户详细信息", # long description
    response_description="用户详细信息对象",
)
async def read_user(
    user_id: int = Path(
        ...,
        description="用户唯一的数字标识，必须是正数",
        example=123,
    )
):
    ...
```

Without `operation_id`, FastAPI auto-generates ugly names like `read_user__users__user_id__get`, which confuse the LLM.

**Rule**: For every MCP-exposed endpoint, write clear `operation_id`, `description`, and parameter `description` fields. The LLM selects tools purely based on these descriptions.

### Async in Jupyter Notebooks

`asyncio.run()` does not work inside Jupyter. Add these two lines before any async code:

```python
import nest_asyncio
nest_asyncio.apply()
```

---

## Method 2: fastmcp (from-scratch)

When there is no existing FastAPI service, use `fastmcp` for minimal boilerplate:

```bash
pip install fastmcp
```

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("logistics")   # "logistics" becomes the server name shown to clients

@mcp.tool()
def get_package_status(tracking_id: str) -> dict:
    """
    根据快递单号查询包裹状态。
    tracking_id: 快递单号，字符串格式。
    """
    # implementation
    ...

mcp.run()   # defaults to http://localhost:8000
```

The docstring becomes the tool description that the LLM reads. Keep it accurate and specific.

---

## Full Example: LangGraph + MCP (Logistics Agent)

A complete demo showing an agent that answers parcel-tracking questions using three MCP tools.

### Server Side (fastmcp)

Three tools exposed:

| Tool | Parameters | Purpose |
|---|---|---|
| `get_package_status` | `tracking_id` | Return current package location and status |
| `calculate_shipping_cost` | `weight_kg`, `distance_km` | Compute shipping price |
| `estimate_arrival_time` | `distance_km` | Estimate delivery days |

All logic is hardcoded/mocked for the demo; in production you replace the body with real API calls.

### Client Side (LangGraph + MultiServerMCPClient)

LangGraph's `MultiServerMCPClient` can connect to **multiple MCP servers simultaneously**, which reflects real-world usage where different business domains live on different servers.

```python
from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient({
    "logistics": {
        "url": "http://localhost:8000/mcp",
        "transport": "streamable_http",   # SSE-based
    },
    "math": {
        "command": "python",
        "args": ["/path/to/math_server.py"],
        "transport": "stdio",             # local process, stdin/stdout
    },
})
```

Two transport modes:
- **`streamable_http` (SSE)**: connect to a remote MCP server by URL.
- **`stdio`**: launch a local Python script as a subprocess; communicate via `input()` / `print()`.

LangGraph wiring:

```python
async with client.session("logistics") as session:
    tools = await session.list_tools()
    llm_with_tools = llm.bind_tools(tools)

# Define StateGraph with agent_node + tool_node, connected by conditional edges
```

### Running the Demo

1. Start the MCP server: `python server_p24.py` (listens on port 8000).
2. Start the client agent: `python client.py`.
3. Sample dialogue:
   - "我的包裹到哪了？" → agent calls `get_package_status`, returns shipping status.
   - "我要寄5公斤的包裹，大概多少钱，多少公里？" → agent calls `calculate_shipping_cost`.
   - "大概多久能到？" → LangGraph's conversation memory retains the distance; agent calls `estimate_arrival_time`.

LangGraph's stateful conversation context allows follow-up questions (e.g., "多久能到？") without repeating parameters.

---

## Security Best Practices

When deploying MCP servers in production:

1. **Add authentication**: Even for internal MCP servers, require a token or API key. Unauthenticated MCP endpoints that expose write operations (INSERT, DELETE, file writes) are a critical risk.
2. **Add access logging**: Record which client IP and which client identifier called which tool. Essential for auditing and incident response.
3. **Separate ports / networks**: Keep MCP endpoints on a different port (and ideally a different network zone) from the public API.
4. **Read vs. write tools**: Be extra careful with tools that write to databases or filesystems. Prefer read-only tools in early deployments.

---

## Key Takeaways

- MCP servers can be built in Python using two libraries: **`fastapi-mcp`** (wrap an existing FastAPI app) or **`fastmcp`** (start from scratch).
- `fastapi-mcp` preserves your existing REST API while adding an MCP layer; use it when migrating legacy services.
- `fastmcp` produces less code and is the idiomatic choice for greenfield MCP servers.
- **Tool descriptions are critical**: the LLM chooses which tool to call based entirely on `operation_id`, `description`, and parameter descriptions — make them precise and human-readable.
- `MultiServerMCPClient` allows a single LangGraph agent to fan out across multiple MCP servers, each covering a different business domain.
- Two transport modes: **SSE/HTTP** (remote servers) and **stdio** (local subprocess).
- LangGraph's stateful memory enables multi-turn conversations that span multiple MCP tool calls.
- Always add authentication and access logging to MCP servers before production use.

---

## Connections

- → [[mcp-protocol-intro]]
- → [[langgraph-agent-patterns]]
- → [[fastapi-python-web]]
- → [[llm-tool-use]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释 `fastapi-mcp` 和 `fastmcp` 这两种构建 MCP 服务器的方式各自适合什么场景，以及核心区别是什么。
2. 在物流 Agent 示例中，`MultiServerMCPClient` 支持哪两种传输模式？分别说明它们的工作方式和适用场景。
3. 为什么说"工具描述"对 MCP 服务器至关重要？如果不设置 `operation_id` 和 `description`，会发生什么问题？

<details>
<summary>答案指南</summary>

1. `fastapi-mcp` 适合已有 FastAPI 服务的场景：通过 `FastApiMCP(app).mount()` 在原有 REST API 之上叠加 MCP 层，原接口不受影响。`fastmcp` 适合从零开始的场景，代码量更少，用装饰器 `@mcp.tool()` 直接定义工具，是新项目的惯用选择。
2. 两种传输模式：**`streamable_http`（SSE）** 通过 URL 连接远程 MCP 服务器；**`stdio`** 将本地 Python 脚本作为子进程启动，通过标准输入/输出通信。前者用于网络部署的服务，后者用于本地工具脚本。
3. LLM 完全依靠 `operation_id`、`description` 和参数 `description` 来决定调用哪个工具。若不设置 `operation_id`，FastAPI 会自动生成如 `read_user__users__user_id__get` 这样难以理解的名称，导致 LLM 无法正确选择工具甚至完全不调用。

</details>
