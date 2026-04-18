---
tags: [langchain, chain, fallback, retry, error-handling, python, decorator, exception]
source: https://u.geekbang.org/lesson/818?article=927451
wiki: wiki/concepts/langchain-error-handling-patterns.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在生产环境中，当主模型调用失败时，你会如何设计备用方案？请描述你能想到的降级策略层次。
2. Python 中没有原生的 `switch/case` 语句（3.10 之前），你知道有哪些常见的替代写法？
3. 什么是"装饰器"（decorator）？它在 Python 中主要解决什么问题？

---

# 035: 4LangChain链的解析2

**Source:** [4LangChain链的解析2](https://u.geekbang.org/lesson/818?article=927451)

## Outline
- [如何阅读大型 LangChain 代码](#如何阅读大型-langchain-代码)
- [多层降级（Fallback）完整方案](#多层降级fallback完整方案)
- [Python try/except 替代条件判断](#python-tryexcept-替代条件判断)
- [Python 字典模拟 switch/case](#python-字典模拟-switchcase)
- [装饰器实现超时与重试](#装饰器实现超时与重试)
- [性能监控统计](#性能监控统计)
- [Connections](#connections)

---

## 如何阅读大型 LangChain 代码

面对几百行的 LangChain 代码，推荐以下阅读策略：

1. **找入口**：对于 Python AI 框架，唯一的入口通常是后端 URL 接口对应的函数。找到这个函数即找到主程序入口。
2. **看主流程**：人工编写的代码往往有清晰的主流程（初始化 → 单条处理 → 批量处理 → 统计），先理解全局再深入细节。
3. **折叠方法体**：在 IDE 中折叠各方法体，先看类的方法列表，确认各方法的职责。
4. **只读关键路径**：明确需求后只读相关的 1-2 个方法，不需要全量阅读。

### 代码架构示例（降级方案）

```python
class CustomerService:
    def __init__(self):
        self._setup_models()
        self._setup_chain()
        self._setup_fallback_system()

    def _setup_models(self):
        """配置主模型和备用模型"""
        self.primary_model = ChatTongyi(model="qwen-max")
        self.fallback_model = ChatTongyi(model="qwen-plus")

    def _setup_chain(self):
        """配置业务逻辑链"""
        self.tech_chain = tech_prompt | self.primary_model | parser

    def _setup_fallback_system(self):
        """配置容错机制"""
        # 主模型 -> 备用模型 -> 兜底响应
        ...

    def process_single(self, user_input: dict) -> str:
        """处理单条请求"""
        ...

    def process_batch(self, inputs: list) -> list:
        """批量处理"""
        ...

    def get_stats(self) -> dict:
        """统计性能指标"""
        ...
```

---

## 多层降级（Fallback）完整方案

生产环境中，模型调用失败的原因多样（供应商网络问题、模型超载等），建议设计三层降级：

```python
def process_with_multilevel_fallback(user_input: dict) -> str:
    try:
        # 第一层：主模型（如 qwen-max）
        result = primary_chain.invoke(user_input)
        success_count += 1
        return result
    except Exception as e:
        logger.warning(f"主模型 {primary_model.model_name} 失败: {e}")

    try:
        # 第二层：备用模型（如 qwen-plus，或其他供应商）
        result = (pre_prompt | fallback_model | parser).invoke(user_input)
        fallback_count += 1
        return result
    except Exception as e:
        logger.error(f"备用模型失败: {e}")

    # 第三层：兜底响应（不调用任何模型）
    error_count += 1
    return json.dumps({
        "status": "error",
        "message": "当前系统繁忙，是否需要人工协助？",
        "retry_after": 30
    }, ensure_ascii=False)
```

**两种模型配置策略**：
- 同一功能的两个不同供应商（防供应商故障）
- 一强一弱的模型（强模型首选，弱模型降级）

---

## Python try/except 替代条件判断

相比大量 `if/else` 条件分支，`try/except` 更适合**异常驱动的分支逻辑**：

```python
# ❌ 不推荐：用大量条件判断来处理各种失败情形
if model_available and not timeout and response_valid:
    ...
elif model_available and timeout:
    ...
elif not model_available:
    ...

# ✅ 推荐：让异常自然传播，用 except 捕获并处理
try:
    result = model.invoke(input)         # 任何失败都抛出异常
except TimeoutError:
    result = fallback_model.invoke(input)
except Exception as e:
    logger.error(e)
    result = "系统繁忙，请稍后再试"
```

**优点**：代码更线性，不需要预先枚举所有失败场景；异常会自动携带错误信息，便于日志记录。

---

## Python 字典模拟 switch/case

Python（3.10 之前）没有原生 `switch/case`，常用**字典 + 函数引用**的方式模拟：

```python
# 定义各分支处理函数
def handle_question(input): ...
def handle_summary(input): ...
def handle_default(input): ...

# 构建路由字典（value 是函数对象，不是调用结果）
router = {
    "question": handle_question,
    "summary":  handle_summary,
}

# 路由并执行
handler = router.get(input_type, handle_default)
result = handler(user_input)
```

在 LangChain 中，这种模式自然地扩展为**链路由**：

```python
chain_router = {
    "tech":    tech_prompt | model | parser,
    "billing": billing_prompt | model | parser,
}

selected_chain = chain_router.get(detected_intent, default_chain)
result = selected_chain.invoke(user_input)
```

---

## 装饰器实现超时与重试

**装饰器**是将函数 A 包装在函数 B 中执行的语法糖，适合在不修改核心业务逻辑的前提下添加横切关注点（超时、重试、日志等）：

```python
import functools
import time
import signal

def timeout(seconds: int):
    """超时控制装饰器"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            def handler(signum, frame):
                raise TimeoutError(f"函数执行超时（>{seconds}s）")
            signal.signal(signal.SIGALRM, handler)
            signal.alarm(seconds)
            try:
                return func(*args, **kwargs)
            finally:
                signal.alarm(0)
        return wrapper
    return decorator

def exponential_backoff(max_retries: int = 3, base_delay: float = 1.0):
    """指数退避重试装饰器"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    wait = base_delay * (2 ** attempt)   # 1s, 2s, 4s
                    logger.warning(f"第{attempt+1}次失败，{wait}s 后重试: {e}")
                    time.sleep(wait)
        return wrapper
    return decorator

# 使用装饰器
@timeout(30)
@exponential_backoff(max_retries=3)
def call_model(chain, user_input):
    return chain.invoke(user_input)
```

---

## 性能监控统计

通过计数器追踪成功率，可以在批量处理结束后评估整体链路健康状况：

```python
class CustomerService:
    def __init__(self):
        self.total_count = 0
        self.success_count = 0
        self.fallback_count = 0
        self.error_count = 0

    def process_single(self, user_input):
        self.total_count += 1
        try:
            result = primary_chain.invoke(user_input)
            self.success_count += 1
            return result
        except Exception:
            self.fallback_count += 1
            return fallback_chain.invoke(user_input)

    def get_stats(self) -> dict:
        success_rate = self.success_count / self.total_count if self.total_count else 0
        return {
            "total": self.total_count,
            "success_rate": f"{success_rate:.1%}",
            "fallback_count": self.fallback_count,
            "error_count": self.error_count,
        }
```

当成功率过低时，可以触发告警或自动切换主用模型。

---

## Connections
- → [[langchain-lcel-runnable]]
- → [[langchain-error-handling-patterns]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 本课介绍的三层降级（Fallback）方案分别是哪三层？每层的职责是什么，何时触发？
2. 用自己的话解释：为什么用 `try/except` 替代大量 `if/else` 来处理模型调用失败更合适？它带来了哪些代码质量上的优势？
3. `exponential_backoff` 装饰器中的指数退避等待时间是如何计算的？请写出前三次重试的等待时间，并解释这种设计的意图。

<details>
<summary>答案指南</summary>

1. 三层降级：第一层调用主模型（如 qwen-max），失败后第二层切换备用模型（如 qwen-plus 或其他供应商），两层均失败则第三层返回兜底响应（不调用任何模型，直接返回提示用户人工协助的 JSON）。
2. `try/except` 让代码更线性，无需预先枚举所有失败场景；异常会自动携带错误信息便于日志记录，而大量 `if/else` 需要手动判断每种失败条件，逻辑繁琐且容易遗漏。
3. 等待时间公式为 `base_delay * (2 ** attempt)`，即第 1 次失败等 1s、第 2 次等 2s、第 3 次等 4s；指数增长的设计意图是给上游服务足够的恢复时间，同时避免立即重试加重服务压力。

</details>
