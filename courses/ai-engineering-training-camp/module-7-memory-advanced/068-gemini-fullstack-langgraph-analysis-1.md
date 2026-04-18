---
tags: [langgraph, gemini, fullstack, agent, fastapi, react, sse, streaming, source-code-analysis, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927483
wiki: wiki/concepts/068-gemini-fullstack-langgraph.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 为什么深度搜索工具（Deep Research）需要用 Agent 循环的方式实现，而不是直接单次调用大模型？
2. `langgraph.json` 这个配置文件在 LangGraph 全栈项目中可能需要声明哪些信息？
3. React 前端如何与后端 LangGraph 服务建立实时流式通信？SSE 和 WebSocket 各有什么特点？

---

# 068: Gemini Fullstack LangGraph Quickstart 源码剖析 (Part 1)

**Source:** [5Gemini-fullstack-langgraph-quickstart源码剖析1](https://u.geekbang.org/lesson/818?article=927483)

## Outline

1. 项目背景与学习目的
2. 项目整体功能：Research Agent
3. 代码阅读策略
4. 前端代码分析（React + TypeScript + Vite + Tailwind）
5. 后端配置文件分析（pyproject.toml + langgraph.json + .env）
6. Python 模块化拆分方式
7. 状态管理（state.py）

---

## 1. 项目背景与学习目的

本讲是对 **Gemini Fullstack LangGraph Quickstart** 开源项目的源码剖析。这是 Google 官方发布的一个全栈示例项目，将 LangGraph 框架与前后端整合，展示了一个完整的生产级 AI Agent 应用的组织方式。

选择该项目的原因：
- 恰好使用 LangGraph，与课程内容一致
- 包含前端（React），可以学习前后端如何协作
- 代码组织方式标准，可作为自己项目的参考模板
- 有大量二次开发的社区案例可参考（类比 Dify → Dify Plus 的关系）

---

## 2. 项目整体功能：Research Agent

该项目本质上是一个 **深度搜索（Deep Research）工具**，实现了以下循环逻辑：

```
用户提问
    ↓
Web Research（抓取网页内容）
    ↓
大模型反思（能否回答问题？）
    ├── 是 → 生成最终答案
    └── 否 → 继续 Web Research（直到达到最大轮数）
```

核心组件：
- **Web Research 工具**：抓取并处理网页内容（Google Search）
- **反思能力**：大模型 + 提示词组合，判断当前资料是否足以回答问题
- **Agent 循环**：搜索与反思形成内部循环，直至达到"顿悟时刻（Aha Moment）"

为何用 Agent 而非单次调用：单次调用大模型无法在资料不足时自我补充，而 Agent 形式可以在反思不足时回头继续搜索，循环直到满足条件。

---

## 3. 代码阅读策略

讲师推荐三种入口方式：

| 方式 | 描述 |
|------|------|
| 从熟悉处入手 | 后端开发者从 `backend/src/app.py`（FastAPI 入口）开始 |
| 从核心逻辑入手 | 直接找 `src/agent/graph.py`，按节点 → 边的顺序阅读 LangGraph 图定义 |
| 从前端入手（推荐难路径）| `index.html` → `main.tsx` → `app.tsx` → 前后端通信 → 后端处理 |

**推荐方法论：**
1. 先把程序跑起来（方便调试与观察）
2. 观察程序输出（理解执行过程）
3. 找入口，顺着请求链路追踪

---

## 4. 前端代码分析

### 技术栈
- **框架**：React（TypeScript / TSX）
- **构建工具**：Vite
- **CSS**：Tailwind CSS（原子化 CSS）
- **关键依赖**：`@langchain/langgraph-sdk`（与后端 LangGraph 服务通信）

### 文件结构与职责

| 文件 | 职责 |
|------|------|
| `index.html` | 主页入口 |
| `src/main.tsx` | 配置 React Router 和全局样式 |
| `src/app.tsx` | 核心应用组件，管理状态变量与后端通信 |
| `src/components/` | UI 组件（Welcome 页、InputForm、ChatMessage、Timeline） |

### 前后端通信机制

使用 `@langchain/langgraph-sdk` 提供的 **`useStream` Hook** 实现实时通信：

```typescript
// useStream 建立与后端 LangGraph 服务的实时连接（SSE）
const { ... } = useStream({
  apiUrl: import.meta.env.DEV ? "http://localhost:2024" : "http://localhost:8123",
  assistantId: "agent",
  messagesKey: "messages",
});
```

- 开发环境连接端口 **2024**（LangGraph dev server）
- 生产环境连接端口 **8123**
- 通信细节完全封装在 SDK 内部，前端代码看不到原始 HTTP/SSE 请求

### 核心 UI 组件

**InputForm**：用户输入表单
- 支持多行输入
- 提交时传递：用户问题 + 搜索强度 + 模型选择
- 默认模型：`gemini-2.5-flash-preview-04-17`（注意：该版本已弃用，需更新）
- 支持回车快捷键提交

**Timeline 组件**：展示 Agent 执行过程
- 实时接收后端各阶段消息（主题 + 内容）
- 支持 Markdown 渲染
- 每个执行阶段对应一个时间线条目

### 整体前端执行流程

```
用户输入问题 → handleSubmit → 展示用户消息
    → 启动空的执行状态容器
    → 后端执行各阶段 → 推送消息到前端（主题 + 内容）
    → 前端 Timeline 实时展示各阶段
    → 后端执行完成 → 流式输出最终答案
```

---

## 5. 后端配置文件分析

### pyproject.toml

由 Poetry 工具生成，定义项目依赖和元数据：
- Python 版本要求：`>=3.11, <4.20`
- 包含所有后端依赖（LangGraph、FastAPI 等）

Python 环境管理工具对比：
- `pip`：最基础，最常见
- `conda`：适合数据科学场景
- `poetry`：现代 Python 项目管理（本项目使用）

### langgraph.json（LangGraph 服务配置文件）

```json
{
  "dependencies": ["."],   // 以当前目录为根
  "graphs": {
    "agent": "src/agent/graph.py:graph"  // 图定义位置
  },
  "http": {
    "app": "src/agent/app.py:app"        // HTTP 服务入口（FastAPI）
  }
}
```

作用：告诉 LangGraph CLI 从哪里找到图定义和 HTTP 服务。

### 启动方式

```bash
langgraph dev   # 以开发模式启动（支持热加载）
```

与传统 `uvicorn` / `flask` 启动方式不同，LangGraph 自带服务器，同时托管图运行时和 HTTP 服务。

### .env 文件

- 实际文件为 `.env.example`，需复制并重命名为 `.env`
- 配置 Gemini API Key 等环境变量
- LangGraph 启动时自动读取并注入为环境变量

---

## 6. Python 模块化拆分方式

本项目展示了如何将 LangGraph 代码从单文件拆分为多模块：

**Python 包的创建方式**：
在目录下创建 `__init__.py` 空文件，该目录即成为 Python 包（package）。

**模块引用示例**：
```python
# 文件结构
# agent/
# ├── __init__.py
# ├── state.py
# ├── graph.py
# └── tools.py

# 在 graph.py 中引入 state
from agent.state import OverallState, QueryState, SearchQuery, Reflection
```

**推荐的模块拆分维度**：

| 模块 | 内容 |
|------|------|
| `state.py` | 状态定义（TypedDict / 数据结构） |
| `graph.py` | 图定义（节点、边、条件） |
| `tools.py` | 工具函数（Google Search 等） |
| `prompts.py` | 提示词模板 |
| `app.py` | FastAPI HTTP 路由（前端页面等） |
| `configuration.py` | 配置项 |

---

## 7. 状态管理（state.py）

项目定义了 4 个核心状态类：

- **OverallState**：整个图的全局状态（用户问题、搜索结果、最终答案等）
- **QueryState**：单次搜索查询的状态
- **SearchQuery**：搜索关键词结构
- **Reflection**：反思结果结构（是否足够回答问题）

这些状态在 `graph.py` 中通过 `from agent.state import ...` 引入使用。

---

## Key Takeaways

1. **LangGraph 全栈项目的标准结构**：前端（React + LangGraph SDK）+ 后端（LangGraph dev server + FastAPI），通过 SSE 流式通信。

2. **`useStream` Hook 是前后端通信的核心**：封装了所有 SSE 连接细节，前端代码极其简洁。

3. **langgraph.json 是项目的配置中枢**：声明图定义路径、HTTP 服务路径和依赖根目录。

4. **模块化拆分原则**：state / graph / tools / prompts / app 各司其职，通过 Python 包机制互相引用。

5. **开发实践建议**：
   - 先跑起来，再读代码
   - 选择难路径（从前端入手）收获更大
   - 读完代码后可尝试提 Issue / PR，甚至成为开源贡献者

6. **本项目是 RAG + Agent 的良好起点**：可在 Web Research 基础上加入 RAG，实现搜索 + 知识库的混合检索。

---

## Connections

- [[LangGraph]] - 本项目的后端核心框架
- [[React]] - 前端框架
- [[FastAPI]] - Python HTTP 服务框架
- [[SSE]] - Server-Sent Events，前后端实时通信协议
- [[Agent]] - Research Agent 的设计模式
- [[Google Search]] - 项目使用的 Web Research 工具
- [[069-gemini-fullstack-langgraph-analysis-2]] - 下一讲：继续深入剖析图节点实现


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话描述 Research Agent 的执行循环逻辑：从用户提问到生成最终答案，经历了哪些步骤？循环的退出条件是什么？
2. `useStream` Hook 在本项目前端中扮演什么角色？它封装了哪些底层细节，为什么说它让前端代码"极其简洁"？
3. `langgraph.json` 文件的结构是怎样的？它的三个关键字段分别声明了什么，启动命令与传统 uvicorn 有何不同？

<details>
<summary>答案指南</summary>

1. 用户提问后，Agent 先执行 Web Research 抓取网页内容，再由大模型反思当前资料是否足以回答问题；若足够则生成最终答案，若不够则继续搜索，循环直到达到"顿悟时刻（Aha Moment）"或最大轮数上限。Agent 形式的核心价值在于：单次调用无法在资料不足时自我补充，而循环结构可以反复搜索直至满足条件。

2. `useStream` 是 `@langchain/langgraph-sdk` 提供的 React Hook，它封装了与后端 LangGraph 服务建立 SSE 实时连接的所有细节（端口区分、HTTP 握手、流式解包），前端代码只需传入 `apiUrl`、`assistantId`、`messagesKey` 三个参数，看不到任何原始 HTTP/SSE 请求，因此代码极其简洁。

3. `langgraph.json` 包含三个关键字段：`dependencies`（声明依赖根目录为当前目录 `.`）、`graphs.agent`（声明图定义位于 `src/agent/graph.py:graph`）、`http.app`（声明 FastAPI 服务入口为 `src/agent/app.py:app`）；启动命令为 `langgraph dev`，与传统 `uvicorn` 不同，LangGraph 自带服务器同时托管图运行时和 HTTP 服务，并支持热加载。

</details>
