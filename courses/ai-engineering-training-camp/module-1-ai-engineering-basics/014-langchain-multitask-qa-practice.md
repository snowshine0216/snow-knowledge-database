---
tags: [langchain, agent, tool-calling, redis, caching, pydantic, python-engineering, practice, ai-engineering, function-calling]
source: https://u.geekbang.org/lesson/818?article=927431
wiki: wiki/concepts/014-langchain-multitask-qa-practice.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在 Python 项目中，`venv` 虚拟环境的主要作用是什么？为什么建议每个项目独立一个虚拟环境？
2. 在基于 LangChain 构建 Agent 时，大模型如何"知道"应该调用哪个工具？它依据什么信息做出选择？
3. Redis 缓存在 API 调用场景中的核心价值是什么？天气查询这类场景为什么特别适合缓存？

---

# 014: 基于 LangChain 构建多任务问答助手（Project 1 实战）

**Source:** [AI 工程化训练营 模块一实践 基于 LangChain 构建一个多任务问答助手](https://u.geekbang.org/lesson/818?article=927431)

## Outline
- [项目目标与设计原则](#项目目标与设计原则)
- [Python 工程化要素](#python-工程化要素)
- [项目结构](#项目结构)
- [核心代码：QA Agent](#核心代码qa-agent)
- [工具实现：天气 + 搜索](#工具实现天气--搜索)
- [生产级扩展能力](#生产级扩展能力)
- [Key Takeaways](#key-takeaways)

---

## 项目目标与设计原则

**Project 1** 的目标：用 LangChain 构建一个支持两种工具调用的多任务问答助手：
1. **查天气**（高德地图 Weather API）
2. **搜索最新新闻**（Tavily 搜索引擎）

**核心练习点**：
- 套用框架（LangChain LCEL）vs. 直接调用大模型调用工具的难度差异
- 工具调用过程中如何定位错误（打印 `used_tools` 追踪调用链）
- 缓存 API 结果降低请求成本（Redis 缓存 24 小时）
- 错误处理（外部 API 超限、失效场景）

> **参考答案原则**：这是参考实现，不是标准答案。可以用 LangChain、LlamaIndex 甚至裸 Python 实现，只要至少调用两个工具完成多任务问答即可。

---

## Python 工程化要素

### 1. 虚拟环境（venv）

每个项目独立的 Python 环境，避免包版本冲突：

```bash
# 检查 Python 版本（框架对版本有范围要求，避免用 3.13）
python --version

# 创建虚拟环境
python -m venv venv

# 激活（macOS/Linux）
source venv/Scripts/activate

# 激活后安装依赖
pip install -r requirements.txt

# 更新 pip（本地 pip 版本经常落后于 PyPI）
pip install --upgrade pip
```

### 2. requirements.txt

维护包和版本，保证项目可迁移：

```bash
# 方式一：开发前写好需要的包和版本
# 方式二：开发完后导出当前环境
pip freeze > requirements.txt
```

**规则**：每次新增依赖后运行 `pip freeze` 更新文件，保证移交他人时环境一致。

### 3. .env 文件

存储 API Key 和配置，**绝对不提交到 Git**：

```bash
# .env（真实值，加入 .gitignore）
OPENAI_API_KEY=sk-...
GAODE_API_KEY=...
TAVILY_API_KEY=...
REDIS_URL=redis://localhost:6379
LANGSMITH_API_KEY=...
LOG_LEVEL=INFO

# .env.example（模板，可提交到 Git，告知协作者需要配置哪些变量）
OPENAI_API_KEY=
GAODE_API_KEY=
TAVILY_API_KEY=
```

程序启动时通过 `python-dotenv` 加载 `.env` 到环境变量。

### 4. README / 项目说明文档

**建议命名**：`project-structure.md`（避免用 `README.md` 被覆盖）

内容框架（可让大模型基于 requirements.txt 生成初稿）：
- 项目功能概述（包含哪些工具/功能）
- 技术栈与版本（框架、主要依赖）
- 文件结构说明（每个文件/目录的作用）
- 快速上手步骤（clone → venv → .env → `python main.py`）
- 单元测试运行方式
- 数据流程图
- API Key 申请说明

---

## 项目结构

```
project1/
├── main.py                   # 入口：对话循环，调用 QA Agent
├── agents/
│   ├── __init__.py
│   └── qa.py                 # QAAgent 类：LangChain LCEL 链
├── tools/
│   ├── __init__.py
│   ├── weather.py            # 高德天气工具（城市名→编码→API 调用）
│   └── search.py             # Tavily 搜索工具
├── config/
│   └── settings.py           # 配置加载（.env → 环境变量）
├── call/
│   └── logging.py            # 日志配置（模块化）
├── requirements.txt
├── .env                      # 不提交 Git
├── .env.example              # 提交 Git
├── .gitignore
└── project-structure.md
```

**包（Package）与库（Module）**：
- `agents/`、`tools/` 等文件夹 = **包**（Python 3 无需 `__init__.py`，但建议保留以兼容旧版）
- `qa.py`、`weather.py` 等 `.py` 文件 = **模块（库）**
- `from agents.qa import create_qa_agent` → 从包中导入模块中的函数/类

---

## 核心代码：QA Agent

```python
# agents/qa.py
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import RedisChatMessageHistory
from tools.weather import get_weather_tool
from tools.search import get_search_tool
from config.settings import settings

class QAAgent:
    def __init__(self):
        # 初始化工具列表
        self.tools = self._create_tools()

        # 初始化大模型（绑定工具）
        llm = ChatOpenAI(
            model=settings.MODEL_NAME,
            temperature=0
        ).bind_tools(self.tools)

        # 定义 Prompt（包含 MessagesPlaceholder 支持历史）
        prompt = ChatPromptTemplate.from_messages([
            ("system", "你是一个多任务问答助手，可以查询天气和搜索最新新闻。"),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])

        # 创建 Agent 和 Executor
        agent = create_tool_calling_agent(llm, self.tools, prompt)
        self.agent_executor = AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=True,              # 打印工具调用过程
            return_intermediate_steps=True  # 返回 used_tools
        )

        # 包装历史管理（Redis 持久化）
        self.agent_with_history = RunnableWithMessageHistory(
            self.agent_executor,
            lambda session_id: RedisChatMessageHistory(
                session_id=session_id,
                url=settings.REDIS_URL
            ),
            input_messages_key="input",
            history_messages_key="chat_history"
        )

    def _create_tools(self):
        return [get_weather_tool(), get_search_tool()]

    def chat(self, user_input: str, session_id: str) -> dict:
        import time
        start = time.time()
        result = self.agent_with_history.invoke(
            {"input": user_input},
            config={"configurable": {"session_id": session_id}}
        )
        elapsed = time.time() - start

        # 提取使用的工具名称
        used_tools = [
            step[0].tool for step in result.get("intermediate_steps", [])
        ]
        return {
            "answer": result["output"],
            "used_tools": used_tools,
            "elapsed_ms": round(elapsed * 1000)
        }


def create_qa_agent() -> QAAgent:
    """工厂函数，便于 main.py 导入"""
    return QAAgent()
```

```python
# main.py
from agents.qa import create_qa_agent
from config.settings import settings
import threading

def welcome():
    print("欢迎使用多任务问答助手！支持功能：")
    print("  1. 查询城市天气（例：北京今天天气怎么样？）")
    print("  2. 搜索最新新闻（例：今天有什么财经新闻？）")
    print("  3. 通用问答（例：什么是大模型？）")
    print("输入 'exit' 退出\n")

def run_session(session_id: str):
    agent = create_qa_agent()
    chat_history = []

    while True:
        user_input = input("你: ").strip()
        if user_input.lower() == "exit":
            break
        if not user_input:
            continue

        print("助手正在思考...")
        result = agent.chat(user_input, session_id)
        print(f"助手: {result['answer']}")
        print(f"[使用工具: {result['used_tools']} | 耗时: {result['elapsed_ms']}ms]\n")

if __name__ == "__main__":
    if not settings.validate():
        print("配置错误，请检查 .env 文件")
        exit(1)
    welcome()
    # 每个用户独立 Session ID → 独立线程，画像不互相污染
    run_session(session_id="user-001")
```

---

## 工具实现：天气 + 搜索

### 天气工具（高德 API）

```python
# tools/weather.py
import requests
from langchain.tools import tool
from config.settings import settings

# 城市名称 → 城市编码（从高德城市列表文件中查找）
def _get_city_code(city_name: str) -> str:
    # 加载本地 city_list.csv，查找 city_name 对应的 adcode
    ...

@tool
def get_weather(city_name: str) -> str:
    """查询指定城市的天气。输入城市名称（如：北京、上海、广州）。"""
    city_code = _get_city_code(city_name)
    url = f"https://restapi.amap.com/v3/weather/weatherInfo"
    params = {
        "city": city_code,
        "key": settings.GAODE_API_KEY,
        "extensions": "base"
    }
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    # 格式化输出（原始 JSON 对问答不友好）
    lives = data["lives"][0]
    return f"{city_name}天气：{lives['weather']}，温度 {lives['temperature']}°C，风向 {lives['winddirection']}，湿度 {lives['humidity']}%"

def get_weather_tool():
    return get_weather
```

### 搜索工具（Tavily）

```python
# tools/search.py
from langchain_community.tools import TavilySearchResults

def get_search_tool():
    return TavilySearchResults(max_results=3)
```

**工具调用决策因素**：
- `system prompt` 的描述（引导模型选择工具）
- `@tool` 装饰器的函数 docstring（工具描述）
- 两者共同决定大模型是否、何时调用某个工具

---

## 生产级扩展能力

### Redis 缓存 API 结果

```python
# 在天气工具中加入缓存
import redis
import json

redis_client = redis.from_url(settings.REDIS_URL)
CACHE_TTL = 86400  # 24 小时

def get_weather_cached(city_name: str) -> str:
    cache_key = f"weather:{city_name}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)  # 缓存命中，跳过 API 调用
    result = _fetch_weather_from_api(city_name)
    redis_client.setex(cache_key, CACHE_TTL, json.dumps(result))
    return result
```

**缓存的意义**：相同城市同一天多次查询，第二次起直接返回，速度提升明显（可通过 `elapsed_ms` 对比验证）。

### Pydantic 类型验证

```python
from pydantic import BaseModel, validator

class WeatherRequest(BaseModel):
    city_name: str
    # 避免调用方误传 List[str] 而非 str
```

Python 是动态类型语言，函数参数在运行时不自动验证类型。Pydantic 在类型提示基础上加入运行时验证，防止类型错误传入导致的难以定位的 Bug。

### 多用户线程隔离

```python
# 不同用户使用不同线程 + 不同 session_id，画像不污染
import threading

def handle_user(session_id: str):
    run_session(session_id)

t1 = threading.Thread(target=handle_user, args=("user-001",))
t2 = threading.Thread(target=handle_user, args=("user-002",))
```

---

## Key Takeaways

- **工程化 ≠ 写更多代码**：把同一功能拆到多个文件是为了可迁移、可维护，与单文件实现能力完全相同
- **venv + requirements.txt + .env** 是 Python 项目交付的三件套，缺一不可
- **工具调用追踪**：`return_intermediate_steps=True` + 打印 `used_tools` 是调试工具选择逻辑的核心手段
- **缓存 API 结果**：天气/新闻等有时效性但变化不频繁的数据，Redis 缓存 24 小时可大幅降低 API 调用成本
- **LangGraph 与历史管理**：LangChain 的 `RedisChatMessageHistory` 需要手动维护；下一模块的 LangGraph 原生处理历史，无需额外开发
- **不同用户用不同 Session ID**：共用 Session ID 会导致用户画像污染（经典 Debug 案例）

---

## Connections

- → [[010-langchain-core-components-detailed]]（LCEL 链式语法、`@tool` 装饰器、Memory 模块）
- → [[012-prompt-engineering-and-agent-design]]（三层记忆系统、Session ID 隔离原则）
- → [[015-multi-agent-customer-service-practice]]（Project 2：同样模式扩展到多 Agent 协同）


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 请用自己的话解释 `return_intermediate_steps=True` 和 `used_tools` 在调试中的具体作用，以及为什么打印它能帮助定位工具选择问题？
2. 为什么不同用户必须使用不同的 `session_id`？如果两个用户共用同一个 `session_id` 会发生什么？
3. 本项目中 Redis 缓存是怎么工作的？请描述天气数据从"第一次请求"到"缓存命中"的完整流程，包括缓存键的设计和 TTL 的意义。

> [!example]- Answer Guide
> 
> #### Q1 — 调试工具选择问题
> 
> `return_intermediate_steps=True` 让 AgentExecutor 返回每一步的工具调用记录，从 `result["intermediate_steps"]` 中提取 `step[0].tool` 即可得到 `used_tools` 列表；通过打印它，可以直接看到模型选了哪个工具（或没选工具），从而判断是 system prompt 描述不清还是 `@tool` docstring 不准确导致的错误选择。
> 
> #### Q2 — 多用户 session_id 隔离
> 
> `RedisChatMessageHistory` 以 `session_id` 为 key 存储对话历史；若两个用户共用同一 session_id，他们的历史消息会合并在一起，导致模型把 A 用户的上下文带入对 B 用户的回答，即"画像污染"，是经典的多用户 Debug 案例。
> 
> #### Q3 — Redis 缓存完整流程
> 
> 每次查询天气前，先用 `f"weather:{city_name}"` 构造缓存键去 Redis 查找；若命中（`cached` 非空）则直接 `json.loads` 返回，跳过 API 调用；若未命中则调用高德 API 获取结果，再用 `redis_client.setex(key, 86400, json.dumps(result))` 写入缓存并设置 24 小时 TTL，使相同城市当天的后续请求全部从缓存响应，可通过 `elapsed_ms` 对比验证速度提升。
