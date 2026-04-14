---
tags: [langgraph, gemini, fullstack, agent, fastapi, react, sse, streaming, source-code-analysis, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927483
---
# Gemini Fullstack LangGraph Quickstart — 源码剖析

Google 官方发布的全栈 AI Agent 示例项目，将 LangGraph 与 React 前端整合，实现了一个深度研究（Deep Research）Agent。本文是对该项目源码的系统解析，涵盖前端架构、后端配置和 Python 模块化组织。

## 项目定位

这是一个 **Research Agent**，核心逻辑：用户提问 → Web Research（Google Search）→ 大模型反思 → 若资料不足则继续搜索 → 直至可以回答或达到最大轮次。该循环将搜索与反思的组合从单次 LLM 调用升级为可迭代的 Agent 工作流。

## 全栈架构

```
前端 (React + TypeScript + Vite + Tailwind)
    useStream Hook (@langchain/langgraph-sdk)
         ↕ SSE 实时通信
后端 (LangGraph dev server)
    ├── LangGraph 图运行时 (src/agent/graph.py)
    └── FastAPI HTTP 服务 (src/agent/app.py)
```

## 前端关键设计

- **通信层**：`@langchain/langgraph-sdk` 的 `useStream` Hook 封装了所有 SSE 细节，前端无需手写任何 HTTP/事件监听代码
- **环境切换**：开发环境连接 `:2024`，生产环境连接 `:8123`
- **Timeline 组件**：实时展示 Agent 各执行阶段（主题 + 内容），支持 Markdown 渲染

## 后端配置中枢：langgraph.json

```json
{
  "dependencies": ["."],
  "graphs": { "agent": "src/agent/graph.py:graph" },
  "http":   { "app":   "src/agent/app.py:app" }
}
```

启动命令：`langgraph dev`（自带热加载，无需 uvicorn/gunicorn）

## Python 模块化拆分

| 模块 | 职责 |
|------|------|
| `state.py` | 4 个状态类：OverallState / QueryState / SearchQuery / Reflection |
| `graph.py` | 图定义：节点 + 边 + 条件分支 |
| `tools.py` | Web Research 工具（Google Search） |
| `prompts.py` | 提示词模板 |
| `app.py` | FastAPI 路由（前端静态页面服务） |

目录下放 `__init__.py` 即成为 Python 包，模块间通过 `from agent.state import ...` 互相引用。

## 学习建议

1. 先跑起来再读代码；从前端入手是更有挑战性的路径
2. 读完后可找官方 repo 的 `good first issue` 提 PR，成为开源贡献者
3. 可在 Web Research 基础上叠加 [[RAG]]，实现搜索 + 知识库混合检索
4. 项目结构可作为自建 LangGraph 全栈应用的参考模板

## 相关资源

- 详细课程笔记：[[068-gemini-fullstack-langgraph-analysis-1]]
- 关联概念：[[LangGraph]] · [[FastAPI]] · [[SSE]] · [[React]] · [[Agent]]
