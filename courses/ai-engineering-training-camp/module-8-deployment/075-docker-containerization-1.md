---
tags: [docker, containerization, fastapi, langgraph, uvicorn, deployment, python, web-framework]
source: https://u.geekbang.org/lesson/818?article=927491
wiki: wiki/concepts/075-docker-containerization-1.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 为什么 AI 模型的 Python 环境打包交付会遇到困难？你认为 Docker 能解决哪些问题？
2. FastAPI 和 Flask 都是 Python Web 框架，你认为两者最本质的区别是什么？
3. 如果 FastAPI 本身是异步框架，为什么还需要 Uvicorn？它在整个服务中扮演什么角色？

---

# 075: Docker Containerization and Image Build Workflow (Part 1)

**Source:** [1Docker 容器化打包与镜像构建流程1](https://u.geekbang.org/lesson/818?article=927491)

## Outline
- [Module 8 Overview — Deployment and Serviceization](#module-8-overview--deployment-and-serviceization)
- [Why Docker for AI Model Delivery](#why-docker-for-ai-model-delivery)
- [Three Key Challenges](#three-key-challenges)
- [FastAPI vs Flask](#fastapi-vs-flask)
- [Uvicorn — The Async Runtime Container](#uvicorn--the-async-runtime-container)
- [FastAPI Code Structure](#fastapi-code-structure)
- [Running FastAPI — Two Methods](#running-fastapi--two-methods)
- [Wrapping LangGraph with FastAPI](#wrapping-langgraph-with-fastapi)
- [Code Modularization Best Practices](#code-modularization-best-practices)
- [Error Debugging Approach](#error-debugging-approach)
- [Connections](#connections)

---

## Module 8 Overview — Deployment and Serviceization

模块 8 关于「模型的部署和服务化」，分为五个部分：
1. **Docker** — 容器化打包
2. **Kubernetes (K8s)** — 容器编排
3. **FastAPI** — 模型基础服务构建
4. **RAID** — 底层框架
5. **认知与监控** — 日志收集与监控系统

本讲（模块 8 第一讲）主要讲解 Docker 和 FastAPI 的基础。

---

## Why Docker for AI Model Delivery

AI 模型工具（如 LangGraph 工作流）的交付场景与传统 Java 程序不同：
- 没有成熟的从开发→测试→正式环境的统一标准方法论
- 大部分开发者使用 LangGraph 等 Python 框架开发，但交付给客户时面临环境不一致问题
- Python 加密方案（PYC、PYT 格式）存在兼容性问题；PyInstaller 打包体积膨胀（几百KB → 几十MB）

**Docker 的优势**：
- 开发与测试环境一致
- 交付时处于加密状态（可在容器内再加一层加密）
- 可实现 FastAPI 与 LangGraph 的分离部署，依赖关系更清晰
- 支持 CI/CD 流程

典型交付架构（模仿 Dify）：

```
[Nginx] ← 对外唯一入口（暴露 80/443）
   ↓
[Web 前端] [FastAPI 后端] [插件服务]
   ↓
[Redis 缓存] [PostgreSQL 数据库] [Celery 队列]
```

---

## Three Key Challenges

课程提到的三个主要「坑」：

| 编号 | 问题 | 解决方案 |
|------|------|----------|
| 1 | LangGraph 需要以 Web 形式发布出去 | 使用 FastAPI 封装 LangGraph |
| 2 | Web 框架需要有异步并发处理能力 | FastAPI + Uvicorn 组合 |
| 3 | 容器间网络隔离（Redis/PostgreSQL 不暴露到外部） | Docker 内部网络 + 只暴露必要端口 |

---

## FastAPI vs Flask

| 特性 | FastAPI | Flask |
|------|---------|-------|
| 设计初衷 | 原生支持 REST API 开发 | Web 页面模板开发 |
| 异步支持 | 原生异步（async/await） | 需要打补丁才支持 |
| MCP 扩展 | `pip install fastapi-mcp` | `flask_mcp` 补丁方式 |
| 推荐场景 | AI 模型服务、REST API | 已有 Flask 经验的开发者可继续使用 |

建议新项目使用 FastAPI：
```python
from fastapi import FastAPI

app = FastAPI()

@app.post("/run")
async def run_workflow(data: dict):
    result = graph.invoke({"input": data["user_input"]})
    return {"output": result}
```

---

## Uvicorn — The Async Runtime Container

FastAPI 本身是异步原生框架，但**单独运行时是阻塞的**（同步处理请求）。需要配合 **Uvicorn（ASGI 服务器）** 才能真正异步处理并发请求。

类比：
- FastAPI ≈ Spring Web 框架
- Uvicorn ≈ Tomcat 容器

```bash
# 开发模式（热重载）
uvicorn main:app --reload

# 生产模式
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Python 异步编程注意事项：
- Python 3.6 以下不支持 async/await
- 3.7+ 加入异步支持，但需要在函数前加 `async` 关键字（语法上不优雅，历史原因）
- FastAPI 函数一律建议加 `async`，配合 Uvicorn 才能真正异步

---

## FastAPI Code Structure

典型的 FastAPI 应用结构：

```python
from fastapi import FastAPI
from typing import Dict, Any

app = FastAPI()

# GET 请求 — 健康检查
@app.get("/health")
async def health_check() -> Dict[str, Any]:
    return {"status": "ok"}

# POST 请求 — 业务接口
@app.post("/run")
async def run(data: dict) -> Dict[str, Any]:
    # 处理逻辑
    result = workflow.invoke(data)
    return {"success": True, "result": result, "input_length": len(str(data))}
```

关键语法点：
- `@app.post("/run")` — 装饰器绑定 URL + HTTP 方法
- `-> Dict[str, Any]` — Python 类型注解，指定返回类型
- `async def` — 标记为异步函数，配合 Uvicorn 实现并发

FastAPI 内置 **Swagger UI**，访问 `/docs` 可直接在浏览器中调试接口（tryout → execute）。

---

## Running FastAPI — Two Methods

**方法一（开发调试）**：
```bash
uvicorn main:app --reload
```

**方法二（独立模块运行）**：
```python
# main.py
import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info")
```

```bash
python main.py
```

`if __name__ == "__main__"` 的作用：
- 直接运行 `python main.py` 时执行
- 被其他模块 `import` 时不执行（避免意外启动服务）

---

## Wrapping LangGraph with FastAPI

将 LangGraph 工作流封装成 REST API 的典型结构：

```python
# workflow.py — LangGraph 工作流
from langgraph.graph import StateGraph

graph = StateGraph(...)
# ... 添加节点和边
compiled_graph = graph.compile()

# main.py — FastAPI 封装
from fastapi import FastAPI
import uvicorn
from workflow import compiled_graph

app = FastAPI()

@app.post("/run")
async def run_workflow(data: dict):
    result = await compiled_graph.ainvoke(data)
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
```

---

## Code Modularization Best Practices

随着项目复杂度增加，推荐将代码拆分为多个模块：

```
project/
├── main.py          # 主入口：只保留核心流程
├── workflow.py      # LangGraph 工作流定义
├── agent/
│   └── qa_agent.py  # Agent 封装（含工具、链、图）
├── tools/           # 工具函数
└── config.py        # 配置文件（API Key、模型参数等）
```

配置管理示例：
```python
# config.py
from pydantic import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    model_name: str = "gpt-4"
    base_url: str = "https://api.openai.com/v1"

settings = Settings()
```

---

## Error Debugging Approach

定位错误的三步法：
1. **看上面**：找到第一行报错的位置（哪个文件哪一行）
2. **看下面**：找到错误信息的最末尾（真正的根因）
3. **跳过中间**：中间的调用栈一般不需要关注

常见错误：模块未找到（`ModuleNotFoundError`）
- 原因：多进程模式下模块路径不正确
- 解决：检查 `from workflow import graph` 等导入语句，确认包结构正确

**推荐做法**：直接把错误信息粘贴给大模型（如 Claude/GPT），让它提供解决思路，效率更高。

---

## Connections
- → [[agent-reinforcement-learning-2]]
- → [[076-docker-containerization-2]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 课程提到 Python 加密方案（PYC/PYT）和 PyInstaller 都有缺陷，Docker 如何解决 LangGraph 工作流的交付问题？请用自己的话说明 Docker 的优势。
2. 课程用 Spring/Tomcat 类比 FastAPI/Uvicorn。请解释这个类比的含义——FastAPI 单独运行时为何是「阻塞的」，Uvicorn 具体做了什么？
3. 将 LangGraph 封装成 FastAPI 服务时，课程推荐的模块拆分结构是怎样的？`if __name__ == "__main__"` 在这个架构中有什么具体作用？

<details>
<summary>答案指南</summary>

1. Python 打包方案存在兼容性问题（PYC/PYT）或体积膨胀（PyInstaller 几百KB→几十MB）；Docker 能保证开发与测试环境一致、交付时处于加密状态、支持 FastAPI 与 LangGraph 分离部署，并天然融入 CI/CD 流程。
2. FastAPI 本身是异步原生框架，但单独运行时只能同步处理请求（阻塞）；Uvicorn 是 ASGI 服务器，相当于 Tomcat 容器，负责接收并发连接并将请求分发给 FastAPI 的 async 函数，真正实现并发处理。
3. 推荐拆分为 `main.py`（核心流程入口）、`workflow.py`（LangGraph 图定义）、`agent/`（Agent 封装）、`tools/`、`config.py`；`if __name__ == "__main__"` 确保直接运行 `python main.py` 时才启动服务，被其他模块 import 时不会意外触发 uvicorn 启动。

</details>
