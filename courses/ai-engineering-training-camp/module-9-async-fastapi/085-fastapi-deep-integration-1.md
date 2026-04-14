---
tags: [fastapi, restful-api, pydantic, websocket, redis, caching, async, python]
source: https://u.geekbang.org/lesson/818?article=927502
wiki: wiki/concepts/085-fastapi-deep-integration-1.md
---

# 085: FastAPI Deep Integration with Async AI Services Part 1

**Source:** [5FastAPI深度集成1](https://u.geekbang.org/lesson/818?article=927502)

## Outline
- [RESTful API Design Principles](#restful-api-design-principles)
- [Pydantic for Data Validation](#pydantic-for-data-validation)
- [Pydantic + LLM Output Validation](#pydantic--llm-output-validation)
- [LLM Output Cleaning Strategy](#llm-output-cleaning-strategy)
- [WebSocket Integration with FastAPI](#websocket-integration-with-fastapi)
- [Redis Async Caching Strategy](#redis-async-caching-strategy)
- [Connections](#connections)

---

## RESTful API Design Principles

FastAPI深度集成的第一步是了解RESTful API设计规范。这不是法律约束，而是大家长期实践总结的最佳经验。

**6大核心原则**：

1. **统一资源定位（URI设计）**：提前规划URI层次结构，如 `/users/{user_id}`，版本控制如 `/v1/users`

2. **HTTP方法语义化**：

| HTTP方法 | 操作 | 示例 |
|----------|------|------|
| POST | 创建资源 | `POST /users` |
| GET | 获取资源 | `GET /users` 或 `GET /users/{id}` |
| PUT | 更新资源 | `PUT /users/{id}` |
| DELETE | 删除资源 | `DELETE /users/{id}` |

3. **无状态请求**：每次请求独立携带认证信息，不依赖会话状态

4. **标准HTTP状态码**：用正确的状态码表达响应含义

5. **版本管理**：URI包含版本号（如OpenAI始终用 `/v1/`）

6. **安全性**：防跨站攻击、API文档自动生成（FastAPI自带 `/docs`）

端点测试模板（Windows PowerShell / Linux curl）：
```bash
# 获取用户列表
curl -X GET http://localhost:8000/v1/users

# 创建用户
curl -X POST http://localhost:8000/v1/users -H "Content-Type: application/json" -d '{...}'
```

---

## Pydantic for Data Validation

Pydantic是Python最常用的数据验证工具，演化路线：`Type Hint → typing.Type → Pydantic`

**核心用法**：
```python
from pydantic import BaseModel, Field

class ProductItem(BaseModel):
    model_config = {"extra": "forbid"}  # 禁止额外字段（防止大模型画蛇添足）

    name: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)        # 大于0
    stock: int = Field(..., ge=0)          # 大于等于0
    description: str = Field(default="")
```

**核心能力对比**：

| 功能 | typing.Type | Pydantic |
|------|-------------|---------|
| 类型验证 | 提示级 | 强制执行 |
| 范围约束 | 无 | Field(gt=, lt=, min_length=) |
| 序列化 | 无 | `.model_dump()`, `.model_dump_json()` |
| JSON Schema | 无 | `.model_json_schema()` |
| 数据清洗 | 无 | `strip_whitespace=True` |

---

## Pydantic + LLM Output Validation

核心思路：将Pydantic模型的JSON Schema传给大模型，要求按此格式输出。

```python
def build_prompt(product_desc: str, schema: dict) -> str:
    return f"""请严格按照以下JSON schema来输出产品信息：
{json.dumps(schema, ensure_ascii=False)}

产品描述：{product_desc}"""

# 获取schema
schema = ProductItem.model_json_schema()

# 构建提示词
prompt = build_prompt(rag_result, schema)
```

**三层兜底策略**：

1. **格式清洗**：正则去除 `\`\`\`json` 前后缀
2. **JSON验证**：`ProductItem.model_validate_json(clean_json)`
3. **字典降级**：若不是合法JSON，尝试以Python字典解析后转换

---

## LLM Output Cleaning Strategy

小参数模型（如千问Turbo）容易输出带 ` ``` ` 的JSON，需要清洗：

```python
import re

def clean_json_output(raw: str) -> str:
    # 去除 ```json ... ``` 包裹
    match = re.search(r'```(?:json)?\s*([\s\S]*?)```', raw)
    if match:
        return match.group(1).strip()
    # 去除多余花括号外内容
    match = re.search(r'\{[\s\S]*\}', raw)
    if match:
        return match.group(0)
    return raw.strip()
```

工具选型原则：不是所有问题都要用大模型解决。
- 去除前后缀 → 正则最佳
- 参数缺失 → 提示用户补充
- 知识库缺失 → 返回"未找到"

---

## WebSocket Integration with FastAPI

WebSocket适用于多轮对话实时交互场景，相比HTTP轮询更节省资源。

```python
from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()  # await切换协程
        payload = json.loads(data)
        async for chunk in stream_llm(payload["prompt"]):
            await websocket.send_text(chunk)
```

客户端连接方式：`ws://localhost:8000/ws/chat`

超时设置（防止异步通信超时）：
```python
import httpx

timeout = httpx.Timeout(
    connect=10.0,
    read=10.0,
    write=10.0,
    pool=10.0
)
```

---

## Redis Async Caching Strategy

Redis缓存适用场景：
- 热点问题（如"今天黄金价格"）
- 相同问题重复请求

**精确缓存**（当前实现）：以完整请求字符串为key，相同问题秒级响应，相似问题不命中。

**语义缓存**（未来方向）：以向量相似度匹配，可命中语义相近的问题（如Faiss/Milvus）。

```python
import redis.asyncio as redis

async def get_cached_response(key: str) -> str | None:
    r = redis.Redis(host='localhost', port=6379)
    return await r.get(key)

async def set_cached_response(key: str, value: str, ttl: int = 3600):
    r = redis.Redis(host='localhost', port=6379)
    await r.setex(key, ttl, value)
```

预告（下一讲内容）：
- asyncpg / SQLAlchemy异步数据库连接
- 令牌桶限流中间件
- LangChain异步集成注意事项

---

## Connections
- → [[084-parallel-mechanisms-2]]
- → [[086-fastapi-deep-integration-2]]
