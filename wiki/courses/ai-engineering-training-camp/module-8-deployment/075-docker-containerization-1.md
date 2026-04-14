---
tags: [docker, containerization, fastapi, langgraph, uvicorn, deployment, python, web-framework]
source: https://u.geekbang.org/lesson/818?article=927491
---

# Docker Containerization and Image Build Workflow (Part 1)

Introduction to Docker-based packaging for AI model delivery, covering the FastAPI + Uvicorn + LangGraph stack and the rationale for containerizing Python-based AI services.

## Key Concepts

- **Docker 容器化的动机**: Python AI 工具（LangGraph 工作流等）交付时面临环境不一致、加密困难等问题；Docker 镜像实现开发测试环境统一，交付时保持加密状态
- **FastAPI**: Python 原生异步 REST API 框架，替代 Flask 作为 AI 模型服务的 Web 层；使用装饰器绑定 URL 和 HTTP 方法（`@app.post("/run")`）
- **Flask vs FastAPI**: Flask 为网页模板开发设计，REST API 支持需要打补丁；FastAPI 原生面向 REST API，推荐新项目使用
- **Uvicorn (ASGI)**: FastAPI 的异步运行容器，类比 Tomcat 之于 Spring；FastAPI 单独运行时是阻塞的，需要配合 Uvicorn 才能真正并发处理请求
- **三大部署挑战**: LangGraph 需要 Web 化发布 / 框架需要并发能力 / 容器间网络隔离（Redis、PostgreSQL 不对外暴露）
- **Python async/await**: Python 3.7+ 才加入异步支持，语法上通过 `async def` 前缀标记异步函数；配合 Uvicorn 使用才生效
- **Swagger UI**: FastAPI 内置 `/docs` 接口调试页面，无需额外安装工具
- **代码模块化**: 建议将配置（config.py）、LangGraph（workflow.py）、Agent（agent/）、工具（tools/）与主入口（main.py）分离

## Key Takeaways

- FastAPI + Uvicorn 是 AI 服务化的标准 Python Web 栈
- Docker 是 AI 工具交付的首选方式，解决环境一致性和代码保护问题
- `if __name__ == "__main__"` 模式确保 Python 文件可作为独立程序运行，也可被其他模块 import
- 调试错误时：看上面（哪里报错）→ 看下面（根因）→ 跳过中间（调用栈）
- 模型服务架构：FastAPI（Web 层）+ LangGraph（业务逻辑层）+ Uvicorn（运行容器）三者分离

## See Also

- [[076-docker-containerization-2]]
- [[077-fastapi-model-service]]
- [[agent-reinforcement-learning-2]]
