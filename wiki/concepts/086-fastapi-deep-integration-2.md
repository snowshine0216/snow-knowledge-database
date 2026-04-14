---
tags: [fastapi, asyncpg, sqlalchemy, orm, redis, rate-limiting, token-bucket, async, postgresql, middleware]
source: https://u.geekbang.org/lesson/818?article=927503
---

# FastAPI Deep Integration Part 2

This lecture covers async database access with asyncpg and SQLAlchemy ORM, environment-based configuration management, the "fail fast" exception handling strategy, token bucket rate limiting middleware, and async Redis caching integration.

## Key Concepts
- **asyncpg**: PostgreSQL的原生异步库，高吞吐批量写入场景首选
- **SQLAlchemy 2.0 ORM**: 声明式数据库抽象，支持跨数据库迁移（换驱动不改Python代码）
- **create_async_engine**: SQLAlchemy异步引擎，需使用 `asyncpg` 驱动
- **async with engine.connect()**: 上下文管理器确保连接自动释放
- **快速报错原则（Fail Fast）**: 连接阶段不捕获异常（连接失败直接暴露），业务执行阶段才加try/except
- **环境配置分离**: `APP_ENV=development/production` 环境变量切换数据库配置
- **令牌桶限流**: 定时投放令牌，无令牌返回HTTP 429；精确控制QPS
- **try/finally保证连接释放**: 防止数据库连接池被耗尽
- **国产化替换**: 使用ORM可以最小化数据库迁移的代码改动量

## Key Takeaways
- asyncpg适合简单SQL和高吞吐写入；SQLAlchemy适合复杂建模和跨数据库场景
- 数据库连接池设置是DBA职责，默认出厂设置面向通用场景，生产环境需调优
- 令牌桶精确控制每秒请求数，引入额外维护成本但防止下游服务被压垮
- 顺势流量（连接建立阶段）比稳定流量更危险，是中间件限流的核心防护目标

## See Also
- [[085-fastapi-deep-integration-1]]
- [[087-langchain-async-vectordb-gpu-1]]
