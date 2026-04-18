---
tags: [fastapi, asyncpg, sqlalchemy, orm, redis, rate-limiting, token-bucket, async, postgresql, middleware]
source: https://u.geekbang.org/lesson/818?article=927503
wiki: wiki/concepts/086-fastapi-deep-integration-2.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 令牌桶（Token Bucket）限流算法是如何工作的？它与漏桶算法有什么区别？
2. 在异步 Python 项目中，为什么不能将 `psycopg2` 与 `asyncpg` 混用？
3. SQLAlchemy ORM 的核心价值是什么？用 ORM 写数据库操作相比原生 SQL 有什么好处？

---

# 086: FastAPI Deep Integration Part 2

**Source:** [6FastAPI深度集成2](https://u.geekbang.org/lesson/818?article=927503)

## Outline
- [Async Database Access Overview](#async-database-access-overview)
- [asyncpg: Native Async PostgreSQL](#asyncpg-native-async-postgresql)
- [SQLAlchemy ORM for Database Abstraction](#sqlalchemy-orm-for-database-abstraction)
- [Environment Configuration Management](#environment-configuration-management)
- [Exception Handling Strategy: Fail Fast](#exception-handling-strategy-fail-fast)
- [Middleware: Token Bucket Rate Limiting](#middleware-token-bucket-rate-limiting)
- [Async Redis Caching Integration](#async-redis-caching-integration)

---

## Async Database Access Overview

异步编程最大的优势就在IO密集型场景，数据库、文件、网络都是典型IO。两种PostgreSQL异步连接方案：

| 方案 | 库 | 适用场景 |
|------|-----|---------|
| 原生异步 | `asyncpg` | 高吞吐批量写入、简单SQL |
| ORM异步 | `SQLAlchemy 2.0` | 复杂建模、事务、跨库迁移 |

注意：同步库（`psycopg2`）与异步库（`asyncpg`）不能混用，API不同。

---

## asyncpg: Native Async PostgreSQL

```python
import asyncpg

async def connect_db():
    conn = await asyncpg.connect(
        host='localhost',
        port=5432,
        user='postgres',
        password='postgres',
        database='mydb'
    )
    try:
        rows = await conn.fetch('SELECT * FROM users LIMIT 5')
        for row in rows:
            print(dict(row))
    except Exception as e:
        raise  # 业务逻辑中可以捕获
    finally:
        await conn.close()  # 必须释放连接
```

**快速报错原则**：连接数据库时不加 `try/except`，连接失败直接报错，人工介入修复，避免掩盖根本问题。业务逻辑执行时再加异常捕获。

---

## SQLAlchemy ORM for Database Abstraction

ORM的核心价值：**数据库无关性**。将SQL语句写成Python声明式代码，切换数据库只需更换驱动，Python代码基本不变。

```python
# 传统SQL
SELECT * FROM users WHERE id = 1

# SQLAlchemy ORM
session.scalars(select(User).where(User.id == 1))
```

数据模型声明：
```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer

class Base(DeclarativeBase):
    pass

class UserAccount(Base):
    __tablename__ = "user_account"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    address: Mapped[str] = mapped_column(String(200))
```

**异步引擎创建**：
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine("postgresql+asyncpg://user:pass@localhost/db")
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession)
```

使用 `async with` 管理连接（对应文件操作中的 `with open()`）：
```python
async with engine.connect() as conn:
    result = await conn.execute(text("SELECT version()"))
    print(result.fetchone())
# 自动关闭
```

加 `try/finally` 的原因：`async with` 本身只保证正常退出时关闭，加 `try/finally` 确保任何情况下都能关闭。

---

## Environment Configuration Management

开发/生产环境分离配置（前端开发模式的最佳实践迁移到后端）：

```python
import os

ENV = os.getenv("APP_ENV", "development")

if ENV == "development":
    DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost/dev_db"
else:
    DATABASE_URL = os.getenv("DATABASE_URL")  # 生产环境从环境变量读取
```

好处：
- 数据库密码不上传到代码仓库
- DevOps只需设置环境变量，无需修改代码
- 开发和生产环境隔离

---

## Exception Handling Strategy: Fail Fast

Python的"快速报错"理念与Java等语言不同：

**连接阶段**（不捕获异常）：
```python
# 连接失败 → 直接暴露 → 人工介入修复
conn = await asyncpg.connect(...)  # 无 try/except
```

**业务执行阶段**（捕获并处理）：
```python
try:
    result = await conn.fetch(query)
except Exception as e:
    logger.error(f"Query failed: {e}")
    raise BusinessException("数据库查询失败，请重试")
finally:
    await conn.close()
```

**文件操作**（打开时也需捕获，因为权限不足时业务可重试）：
```python
try:
    async with aiofiles.open(path, 'r') as f:
        content = await f.read()
except PermissionError:
    # 记录日志，稍后重试
    pass
```

---

## Middleware: Token Bucket Rate Limiting

令牌桶算法是最精确的限流方案：
- 定时往桶里投放令牌（如每秒10个）
- 所有请求先申请令牌
- 拿到令牌才能继续，否则返回 `429 Too Many Requests`

```python
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware

class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, rate_per_second: int = 10):
        super().__init__(app)
        self.rate = rate_per_second
        self.tokens = rate_per_second
        # 令牌桶逻辑...

app = FastAPI()
app.add_middleware(RateLimiterMiddleware, rate_per_second=10)
```

效果：前10次返回200，第11次及以后返回429"请求过于频繁"。

令牌桶 vs 漏桶：令牌桶允许突发流量（桶满了才拒绝），漏桶匀速处理。AI服务推荐令牌桶，允许小幅突发。

---

## Async Redis Caching Integration

Redis异步缓存完整流程：

```python
import redis.asyncio as aioredis
import hashlib

redis_client = aioredis.Redis(host='localhost', port=6379, decode_responses=True)

async def cached_llm_call(prompt: str) -> str:
    cache_key = hashlib.md5(prompt.encode()).hexdigest()

    # 尝试命中缓存
    cached = await redis_client.get(cache_key)
    if cached:
        return cached  # from cache

    # 调用大模型
    result = await call_llm(prompt)

    # 写入缓存（TTL 1小时）
    await redis_client.setex(cache_key, 3600, result)
    return result
```

两种缓存策略对比：

| 策略 | 命中条件 | 实现复杂度 | 推荐工具 |
|------|---------|-----------|---------|
| 精确匹配 | 完全相同的字符串 | 低 | Redis |
| 语义匹配 | 语义相似的问题 | 高 | Faiss + Redis |

---

## Connections
- → [[085-fastapi-deep-integration-1]]
- → [[087-langchain-async-vectordb-gpu-1]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释"快速报错（Fail Fast）"原则：在数据库连接阶段和业务执行阶段，为什么要采取不同的异常处理策略？
2. 请描述 Redis 精确匹配缓存的完整流程，以及用 `hashlib.md5` 生成缓存键的作用是什么？
3. SQLAlchemy 异步引擎为什么推荐用 `async with` 管理连接，同时还要加 `try/finally`？两者各自保证什么？

<details>
<summary>答案指南</summary>

1. 连接阶段不捕获异常，连接失败直接暴露让人工介入，避免掩盖根本问题；业务执行阶段加 `try/except/finally`，捕获查询异常并抛出业务异常，`finally` 确保连接被释放。
2. 先用 `hashlib.md5(prompt.encode()).hexdigest()` 将 prompt 转为固定长度的缓存键，查询 Redis 命中则直接返回；未命中则调用大模型，再用 `setex` 写入缓存并设置 TTL（1小时）。md5 的作用是将任意长度的 prompt 映射为固定的短键，适合做 Redis key。
3. `async with` 保证正常退出时自动关闭连接；加 `try/finally` 是因为异常路径下 `async with` 不足以保证关闭，`finally` 确保任何情况（包括异常）下连接都能被释放。

</details>
