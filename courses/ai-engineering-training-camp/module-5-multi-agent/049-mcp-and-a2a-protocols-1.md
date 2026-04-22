---
tags: [mcp, model-context-protocol, a2a, agent-to-agent, function-calling, tools, resources, prompts, sse, stdio]
source: https://u.geekbang.org/lesson/818?article=927465
wiki: wiki/concepts/049-mcp-and-a2a-protocols-1.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. MCP（模型上下文协议）是什么？你认为它主要解决了 AI Agent 开发中的哪类问题？
2. 在 MCP 架构中，你认为它是两层结构（客户端/服务器）还是三层结构？每一层分别负责什么？
3. Function Calling 和 MCP 是互斥关系还是互补关系？你会在什么场景下选择其中一种？

---

# 049: MCP 与 A2A 协议详解（MCP 第一讲）

**Source:** [5MCP 与 A2A 协议详解-MCP1](https://u.geekbang.org/lesson/818?article=927465)

## Outline
- [MCP 解决的问题](#mcp-解决的问题)
- [MCP 架构：Host / Client / Server](#mcp-架构host--client--server)
- [三种原语：工具、资源、提示词](#三种原语工具资源提示词)
- [MCP 生命周期](#mcp-生命周期)
- [MCP vs Function Calling](#mcp-vs-function-calling)
- [传输类型：stdio 与 SSE](#传输类型stdio-与-sse)
- [实践：高德地图 MCP 案例](#实践高德地图-mcp-案例)
- [工程实践建议](#工程实践建议)
- [何时用单 Agent，何时用 MAS](#何时用单-agent何时用-mas)
- [Connections](#connections)

---

## MCP 解决的问题

**MCP（Model Context Protocol，模型上下文协议）** 是 Anthropic 发布的开放协议，解决两个问题：

1. **单 Agent 场景**：提升调用工具的便利性（工具调用更标准化）。
2. **多 Agent 场景**：将 Agent 本身的能力与工具解耦，避免工具与 Agent 绑定导致的维护困难和协议混乱。

**MCP 的核心价值：**
- 规范了不同 Agent 调用工具的协议（标准化）。
- 工具可发现（Discovery）、可复用、具备互操作性。

**与 A2A 的分工：**
- MCP = 大模型 Agent ↔ 工具 之间的通信规范。
- A2A = Agent ↔ Agent 之间的消息通信规范。

---

## MCP 架构：Host / Client / Server

> **常见误解：MCP 是 C/S（客户端/服务器）结构。**
> 正确理解：MCP 是 **C/H/S（客户端/主机/服务器）三层结构**。

| 角色 | 位置 | 职责 |
|------|------|------|
| **Host（主机）** | 与大模型直接交互侧 | 管理完整对话上下文；拼接 Prompt；解析模型响应；决策是否调用 MCP 服务器 |
| **Client（客户端）** | Host 与 Server 之间 | 维护与 Server 的 1:1 连接；负责协议转换（JSON-RPC）；维持心跳；状态管理 |
| **Server（服务器）** | 工具提供侧 | 实现 MCP 协议；声明可用工具/资源/提示词；无任何 AI 逻辑 |

**关键结论：**
- MCP 应用的**智能水平完全由 Host 决定**，Host 是核心。
- Client 仅做通信中间件（建立 socket 连接，处理 JSON-RPC 协议转换），几乎不包含业务逻辑。
- Server 的输出必须是**可预测、可靠的**（不含 AI 逻辑），调用多次结果相同。
- Host 与 Client 是**包含关系**（Host 内嵌 Client），不是并列关系。

**在 Cursor/Claude Desktop 等工具中：**
- Host = 集成在应用中的模型交互层。
- Client = 已集成到配置文件中（用户改 MCP 配置即是改 Client 配置）。
- Server = 用户自行启动的服务进程（如跑在 8000 端口的 Python 服务）。

---

## 三种原语：工具、资源、提示词

MCP Server 向外暴露三种能力：

### 工具（Tool）
- **定位**：执行动作的能力，具有副作用（读写均可）。
- **当前状态**：使用最广泛，几乎取代了 Resource 的用途。
- **示例**：调用高德地图 API 规划路线、查询天气。

### 资源（Resource）
- **定位**：暴露只读数据（静态/半动态），如日志文件、磁盘文件、用户配置。
- **当前状态**：实际使用较少，原因：
  - 安全性差，直接暴露有隐私风险。
  - 通过工具加一层过滤更可控。

### 提示词（Prompt）
- **定位**：服务端提供的提示词模板/剧本，供 Host 取回后按模板执行。
- **当前状态**：实际使用极少，原因：
  - 大模型数量有限，没必要把提示词放到远程。
  - 直接在本地 Host 中维护更方便。

**设计哲学（原始意图）：**
```
Resource  → 提供原料（只读数据）
Tool      → 提供干活能力（执行动作）
Prompt    → 提供思考思路（操作剧本）
```
类似 Agent 设计：资源是静态数据，工具是执行能力，提示词是指导逻辑。

**当前现状：** Resource 和 Prompt 用得很少，MCP 在实践中几乎等同于"标准化的远程工具调用协议"。

---

## MCP 生命周期

```
1. 初始化 Client（实例化）
2. Client ↔ Server 建立握手连接（激活 onmessage）
3. 进入主循环：
   Host ↔ LLM 对话
   → Host 通过 Client 发送 JSON-RPC 请求给 Server
   → Server 执行工具/查询资源
   → Server 返回结果给 Client
   → Client 翻译后交给 Host
   → Host 将结果整合到 LLM 上下文
```

**流程本质：**
- Client + Server = 纯粹的工程中间件（建立连接、协议转换）。
- Host + LLM = 真正的智能决策层。

---

## MCP vs Function Calling

| 维度 | Function Calling | MCP |
|------|-----------------|-----|
| 本质 | 大模型的**决策能力**（手的延伸） | **基础设施协议**（神经系统） |
| 作用 | 让模型根据上下文决定调用哪个工具 | 标准化工具发现、调用、安全、互操作 |
| 工具位置 | 工具定义在本地，随 LLM 调用时注入 | 工具部署在远程 Server，通过协议发现和调用 |
| 类比 | 手（直接操作） | GRPC / 神经系统（连接外部能力的通道） |
| 是否互斥 | 否，两者**互补**，可结合使用 | 同左 |

**互补使用模式（真实工程实践）：**
```
用户请求
→ Host 先查本地 Function Calling 能力
  → 有对应函数：直接调用（减少网络往返）
  → 无对应函数：通过 MCP Client 查远程 Server
    → Server 有工具：远程调用并返回结果
```

**代码层面的区别：**
- Function Calling：工具的定义、实现、调用逻辑全部在 LLM 侧代码中。
- MCP：Host 侧只需建立连接、获取工具清单，工具实现在远程 Server。

---

## 传输类型：stdio 与 SSE

MCP 支持两种主要传输方式：

| 传输类型 | 适用场景 | 特点 |
|---------|---------|------|
| **stdio（标准输入输出）** | 本地进程通信 | Client 与 Server 在同一机器，通过标准 I/O 通信 |
| **SSE（Server-Sent Events）** | 远程 HTTP 服务 | Server 暴露为 HTTP 端点，Client 通过 URL 访问 |

**SSE 配置示例（客户端）：**
```json
{
  "mcpServers": {
    "amap": {
      "url": "https://mcp.amap.com/sse?key=YOUR_KEY"
    }
  }
}
```

使用 SSE 封装的 Server 时，Client 只需配置 URL 即可连接，无需本地安装。

---

## 实践：高德地图 MCP 案例

**目标：** 制定十一武汉四天游攻略，含路线规划，生成 H5 页面展示。

**实现流程：**
1. 申请高德地图 MCP 地址和 API Key。
2. 在客户端配置 SSE URL。
3. Host 连接后自动获取高德暴露的工具清单（路线规划、POI 搜索等）。
4. 将用户需求（自然语言）交给大模型，模型查询可用工具后自动调用相关 API。
5. 汇总所有 API 返回结果，生成最终 H5 页面。

**重要认知：**
- 该方案成立的前提是：**用户需求恰好能被已有 MCP 工具覆盖**。
- 大模型不会凭空创造工具，只能组合现有能力。
- 提示词需经过特别设计以匹配工具的能力边界。
- 完整复现约需 **2-3 小时**，不是一次性即时生成。

---

## 工程实践建议

课程结合实际工程经验给出的 MCP 使用决策框架：

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| 调用公司**内部**工具/接口 | Function Calling | 内部接口极少改变，无需 C→S 网络往返；调试方便 |
| 调用**外部** API / 第三方服务 | MCP | 外部 MCP 工具由第三方维护，质量高于自己写 HTTP 工具；易替换 |

**单个 Agent 挂载工具数量：** 建议不超过 **3 个**。
- 工具相似时，模型容易选错。
- 工具过多，维护和调试困难，难以评估每个工具的实际效果。

---

## 何时用单 Agent，何时用 MAS

来自课程讲师的实战经验总结：

**用单 Agent（Single Agent）：**
- Agent 只做一个专业的事情。
- 调用工具数量少（≤3 个）。
- 不涉及跨领域系统的切换。

**用多 Agent 系统（MAS）：**
- Agent 需要做多个专业方向的事情。
- 调用的工具来自不同的业务系统（如客服系统 + 货物运单系统）。
- 工具数量超过 Agent 可有效管理的上限。

**注意：** 拆分成多 Agent 后，必须处理 Agent 间消息传递问题，复杂度显著上升。尽量保持单 Agent，实在不得已再拆分。

---

## Connections

- → [[048-agent-collaboration-frameworks-3]]
- → [[009-function-calling-and-mcp-basics]]
- → [[012-prompt-engineering-and-agent-design]]
- → [[013-multi-agent-finetuning-deployment]]
- → [[049-mcp-and-a2a-protocols-1]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释 MCP 的 Host、Client、Server 三者的职责分工，并说明为什么"应用的智能水平完全由 Host 决定"？
2. MCP 的三种原语（工具、资源、提示词）各自的设计定位是什么？为什么在实际工程中 Resource 和 Prompt 几乎不被使用，MCP 几乎等同于"标准化远程工具调用协议"？
3. 课程给出了一个工具调用的决策框架：内部接口用 Function Calling，外部 API 用 MCP，以及单 Agent 挂载工具不超过 3 个。请用自己的话解释这三条建议背后各自的原因。

> [!example]- Answer Guide
> 
> #### Q1 — Host Client Server 职责分工
> 
> Host 管理完整对话上下文、拼接 Prompt、解析模型响应并决策是否调用 MCP Server，是唯一的智能决策层；Client 只做协议转换（JSON-RPC）和连接维持，无业务逻辑；Server 实现协议并声明工具能力，不含任何 AI 逻辑，调用结果须可预测。智能水平由 Host 决定，因为只有 Host 与大模型交互并做调用决策。
> 
> #### Q2 — 三种原语设计定位
> 
> Resource 定位为只读数据暴露，Tool 定位为执行动作，Prompt 定位为服务端提示词模板。Resource 实际少用，因为直接暴露数据有隐私风险且缺乏过滤；Prompt 少用，因为大模型数量有限、本地维护更方便；Tool 几乎包揽了另两者的用途，故 MCP 实践中约等于标准化远程工具调用。
> 
> #### Q3 — 工具调用决策框架原因
> 
> 内部接口用 Function Calling，因为内部接口极少变动且无需网络往返，调试方便；外部 API 用 MCP，因为第三方维护的 MCP 工具质量高且易替换；工具不超过 3 个，因为工具过多时模型容易在相似工具间选错，且调试和评估难度显著上升。
