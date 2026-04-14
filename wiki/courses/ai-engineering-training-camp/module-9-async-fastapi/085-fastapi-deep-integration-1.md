---
tags: [fastapi, restful-api, pydantic, websocket, redis, caching, async, python, llm-output-validation]
source: https://u.geekbang.org/lesson/818?article=927502
---

# FastAPI Deep Integration with Async AI Services Part 1

This lecture covers FastAPI integration patterns for AI services: RESTful API design principles, Pydantic for LLM output validation, WebSocket for streaming multi-turn conversations, and Redis for caching repeated LLM responses.

## Key Concepts
- **RESTful API设计六原则**: URI资源定位、HTTP方法语义化、无状态请求、标准状态码、版本管理、安全性
- **Pydantic BaseModel**: Python最流行的数据验证库，支持类型强制、Field约束、JSON Schema生成
- **model_config = {"extra": "forbid"}**: 禁止大模型输出额外字段，防止"画蛇添足"
- **model_json_schema()**: 生成JSON Schema传入LLM提示词，约束输出格式
- **三层兜底策略**: 正则清洗格式 → JSON验证 → Python字典降级转换
- **WebSocket + FastAPI**: 支持大模型流式输出的双向实时通信
- **Redis精确缓存**: 以完整请求字符串为key，相同问题秒级响应；区别于语义相似缓存（需向量数据库）
- **httpx.Timeout**: 异步HTTP客户端的连接/读取/写入超时设置

## Key Takeaways
- Pydantic是与LLM结合最实用的工具之一，应在所有需要结构化输出的场景使用
- 工具选型原则：去除前后缀用正则，参数缺失提示用户，知识库不足返回"未找到"
- 精确缓存命中相同问题；语义缓存命中相似问题（后者需向量数据库支持）
- WebSocket实现难度低于想象，适合多轮对话场景的实时体验优化

## See Also
- [[084-parallel-mechanisms-2]]
- [[086-fastapi-deep-integration-2]]
