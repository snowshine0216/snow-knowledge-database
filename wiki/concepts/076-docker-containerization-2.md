---
tags: [docker, docker-compose, dify, containerization, deployment, open-source, image-build, flask]
source: https://u.geekbang.org/lesson/818?article=927492
---

# Docker Containerization and Image Build Workflow (Part 2)

Continuation of Docker containerization covering Dify's multi-container architecture as a production reference case, Docker Compose configuration management, and strategies for reading large open-source codebases efficiently.

## Key Concepts

- **Dify 多容器架构**: 对外只暴露 Nginx（80/443），内部通过 Docker 内部网络连接 Web 前端、FastAPI 后端、插件服务、Redis、PostgreSQL、Celery 队列和沙盒执行环境
- **Docker Compose**: 通过 YAML 配置文件管理多个容器的启动、网络和依赖关系；Dify 使用工具自动生成 compose 文件，修改时应更新 `.env.example` 再重新生成
- **端口策略**: 生产级架构只通过 Nginx 反向代理对外暴露端口，数据库和缓存服务不直接对外
- **早期版本策略**: 阅读开源代码时，先下载最早版本（如 Dify v0.2.1）——代码量小、结构扁平、易于理解；再对照最新版本了解演进
- **Dify v0.2.1 代码结构**: Flask + LangChain 直接实现，RAG 核心位于 `api/core/call/combination.py`，提示词硬编码，无过度抽象，适合学习
- **Dify v1.9.2 代码结构**: 工厂模式（Factory Pattern）分层抽象，RAG 路径需穿越 APP → Factory → Controller → Service → api/core/rag/，理解难度高
- **跟踪开源项目的方法**: 从项目 1.0 版本开始，逐个版本跟进，观察每次迭代新增的功能和实现方式（推荐 AgentScope 作为入门练习对象）

## Key Takeaways

- 指定 Docker 版本标签（v1、v2、v3...）是版本管理的最佳实践，避免使用 `latest`
- 生产部署：`docker compose up -d`，修改配置后重新 `up -d` 即可（Docker Compose 会自动增量更新）
- 读开源代码：最新版本用于了解最佳架构；最早版本用于理解核心逻辑
- `docker-compose.yaml` 的 `networks` 字段是容器间网络隔离的关键

## See Also

- [[075-docker-containerization-1]]
- [[077-fastapi-model-service]]
