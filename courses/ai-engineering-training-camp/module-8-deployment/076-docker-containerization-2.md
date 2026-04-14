---
tags: [docker, docker-compose, dify, containerization, deployment, open-source, image-build]
source: https://u.geekbang.org/lesson/818?article=927492
wiki: wiki/concepts/076-docker-containerization-2.md
---

# 076: Docker Containerization and Image Build Workflow (Part 2)

**Source:** [2Docker 容器化打包与镜像构建流程2](https://u.geekbang.org/lesson/818?article=927492)

## Outline
- [Dify Architecture as a Reference Case](#dify-architecture-as-a-reference-case)
- [Dify Docker Structure Deep Dive](#dify-docker-structure-deep-dive)
- [Managing Docker Compose Configuration](#managing-docker-compose-configuration)
- [Reading Open Source Code — Early Version Strategy](#reading-open-source-code--early-version-strategy)
- [Dify v0.2.1 vs v1.9.2 Code Comparison](#dify-v021-vs-v192-code-comparison)
- [Dify RAG Core Code Path](#dify-rag-core-code-path)
- [Docker Compose Deployment Flow](#docker-compose-deployment-flow)
- [Connections](#connections)

---

## Dify Architecture as a Reference Case

Dify 是一个典型的多容器 AI 应用部署案例，以它为参考可以学习生产级 Docker 架构设计。

Dify 对外暴露端口策略：
- **80 / 443**：Nginx 反向代理，对外唯一入口
  - 请求 `/` → Web 前端（5001）
  - 请求 `/-api` 或 `/-v1` → FastAPI 后端（5001）
  - 请求插件 → 插件服务（5002）

内部服务网络（不对外暴露）：
```
[Nginx:80/443]
    ↓
[Web 前端] [API 后端] [插件服务]
    ↓           ↓
[Redis 缓存] [Celery Worker/Beat 队列] [PostgreSQL sqldb]
    ↓
[沙盒（安全代码执行）] [SSRF 代理（跨域）]
```

设计要点：
- 对外只暴露 Nginx 端口，内部服务通过 Docker 内部网络通信
- 代码执行使用单独沙盒镜像（安全隔离）
- 文件保存到本地磁盘，权限和会话通过 Celery 队列持久化到 PostgreSQL

---

## Dify Docker Structure Deep Dive

Dify Docker Compose 中的关键服务映射：

| 服务名 | 角色 | 外部端口 |
|--------|------|----------|
| nginx | 反向代理入口 | 80, 443 |
| web | 前端（React） | 仅内部 |
| api | FastAPI 后端 | 仅内部（5001）|
| plugin-daemon | 插件服务 | 仅内部（5002）|
| worker / worker-beat | Celery 异步队列 | 仅内部 |
| redis | 缓存 | 仅内部 |
| db | PostgreSQL | 仅内部 |
| sandbox | 安全代码执行 | 仅内部 |

---

## Managing Docker Compose Configuration

Dify 的 Docker Compose 文件是**用工具自动生成的**（`GenerateDockerCompose`），不应直接手动编辑。

正确的修改流程：
1. 更新 `.env.example` → 添加新的环境变量（如第三方 API Key）
2. 执行 `GenerateDockerCompose` → 自动重新生成 `docker-compose.yaml`
3. 修改镜像特定配置 → 在 `generate_helper_merge_yaml_files` 等配置源文件中修改

快速部署命令：
```bash
# 进入 Docker 目录
cd docker/

# 复制并配置环境变量
cp .env.example .env
vim .env  # 填入 API Key 等配置

# 启动所有服务（后台运行）
docker compose up -d
```

---

## Reading Open Source Code — Early Version Strategy

阅读大型开源项目（如 Dify）代码的建议策略：

**不推荐**：直接阅读最新版本（v1.9.2）
- 代码量极大，模块分层复杂
- 功能藏在 Factory 工厂模式中，难以快速定位
- 调试和修改时跳转层数多（APP → Factory → Controller → Service → API Code）

**推荐**：先下载最早版本（v0.2.1），再对照最新版本

早期版本优势：
- 代码量小，结构扁平
- Flask + LangChain 直接实现，没有过度抽象
- RAG 核心逻辑直接在 `call/combination.py` 中可见
- Agent、Chain、Embedding、Memory 等全在同一层级

对应于自己的开发项目：
- **想深入研究某个框架**：从最早 release 版本开始，跟着版本迭代
- **最佳学习案例**：AgentScope（代码量极少，刚 1.0，脉络清晰）

---

## Dify v0.2.1 vs v1.9.2 Code Comparison

| 维度 | v0.2.1（早期版） | v1.9.2（最新版） |
|------|-----------------|-----------------|
| Web 框架 | Flask | FastAPI（部分保留 Flask） |
| 入口文件 | `api/app.py`（Flask CreateApp） | `api/app.py`（Factory 模式） |
| 路由定义 | 直接在 app.py 可见 | 通过 Factories/Blueprint 间接注册 |
| RAG 位置 | `api/core/call/combination.py` | `api/core/rag/...` 深层嵌套 |
| 查找难度 | 低，跳转 2-3 次即可找到 | 高，需要跳转 5-6 次 |

早期版 RAG 核心代码结构（v0.2.1）：
```python
# api/core/call/combination.py
# 无过度抽象，直接包含：
# - 大模型调用
# - 提示词获取（硬编码在代码中）
# - 对话历史访问
# - Splitter（文本分割）
# - Rerun 逻辑
# - Embedding 模型
```

---

## Dify RAG Core Code Path

在 Dify 最新版中定位 RAG 功能的路径（适合代码阅读和二次开发参考）：

```
api/app.py
  → app_factory.py (CreateApp)
    → register_blueprints(app)
      → api/controllers/ (Blueprint Controllers)
        → api/services/ (Service 层)
          → api/core/rag/ (RAG 核心)
            → retrieval/ (检索逻辑)
            → splitter/ (文本分割)
            → models/ (数据模型)
```

快速定位方法：
1. 按照 API 命名规则在 `api/controllers/` 中找到对应 controller
2. 从 controller 跳转到 service
3. 在 service 中找到 `api/core/rag/` 的调用入口
4. 进入 RAG 核心查看具体实现

---

## Docker Compose Deployment Flow

完整的 Docker Compose 部署流程：

```bash
# 1. 构建单个镜像
docker build -t my-service:v1 .

# 2. 编写 docker-compose.yaml
# 包含所有服务定义、网络配置、端口映射

# 3. 启动所有服务
docker compose up -d

# 4. 查看服务状态
docker compose ps

# 5. 查看日志
docker compose logs -f api

# 6. 停止服务
docker compose down
```

`docker-compose.yaml` 关键配置项：

```yaml
services:
  api:
    image: my-api:v1
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    networks:
      - internal
    depends_on:
      - redis
      - db

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    networks:
      - internal

networks:
  internal:
    driver: bridge
```

---

## Connections
- → [[075-docker-containerization-1]]
- → [[077-fastapi-model-service]]
