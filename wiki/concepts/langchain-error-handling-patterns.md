---
tags: [langchain, chain, fallback, retry, error-handling, python, decorator, exception]
source: https://u.geekbang.org/lesson/818?article=927451
---

# LangChain 错误处理与降级模式

在生产环境中，大模型调用会因网络问题、供应商故障或超载而失败。LangChain 提供了多种容错机制，配合 Python 原生的异常处理可以构建健壮的多层降级系统。

## Key Concepts

### 多层 Fallback 降级

生产环境推荐三层降级策略：

```
第一层：主模型（高质量，如 qwen-max）
  ↓ 失败
第二层：备用模型（另一供应商或较轻量模型）
  ↓ 失败
第三层：兜底响应（硬编码，不调用任何模型）
```

使用 Python `try/except` 实现比大量 `if/else` 更简洁：

```python
try:
    return primary_chain.invoke(user_input)
except Exception as e:
    logger.warning(f"主模型失败: {e}")
    try:
        return fallback_chain.invoke(user_input)
    except Exception:
        return "系统繁忙，请联系人工客服"
```

### LangChain 内置 Fallback

```python
robust_chain = (prompt | primary_model | parser).with_fallbacks(
    [prompt | fallback_model | parser]
)
```

### 字典模拟 switch/case 路由

Python 惯用模式，将不同意图路由到不同链：

```python
chain_router = {
    "tech":    tech_prompt | model | parser,
    "billing": billing_prompt | model | parser,
}
handler = chain_router.get(intent, default_chain)
result = handler.invoke(user_input)
```

### 装饰器实现横切关注点

用装饰器给函数添加**超时**和**指数退避重试**，不修改核心业务逻辑：

```python
@timeout(seconds=30)
@exponential_backoff(max_retries=3, base_delay=1.0)
def call_model(chain, user_input):
    return chain.invoke(user_input)
# 重试等待：1s → 2s → 4s
```

### 性能统计

```python
success_rate = success_count / total_count
if success_rate < 0.8:
    trigger_alert()
```

## Key Takeaways

- 用 `try/except` 替代多层 `if/else` 处理模型失败场景，代码更线性
- 多层降级建议：主模型 → 备用模型（不同供应商）→ 硬编码兜底
- 装饰器是添加超时、重试等横切逻辑的最佳方式，保持核心函数的纯净
- Python 字典 + 函数引用可优雅实现 `switch/case` 路由，是 LangChain RouterChain 的基本原理
- 批量处理后统计成功率，成功率过低时触发告警

## See Also

- [[langchain-lcel-runnable]] — LCEL 管道与 Runnable 基础
- [[intent-recognition-pipeline]] — 意图识别中的路由与兜底设计
