---
tags: [python, conda, virtual-environment, api-key-security, llm-invocation, function-calling, tool-calling, mcp]
source: https://u.geekbang.org/lesson/818?article=927424
wiki: wiki/concepts/007-llm-invocation-and-function-calling-basics.md
---

# 007: 大模型调用与函数调用基础

**Source:** [AI 工程化训练营 大模型调用与函数调用基础](https://u.geekbang.org/lesson/818?article=927424)

## Outline
- [Python 虚拟环境配置](#python-虚拟环境配置)
- [API Key 安全管理](#api-key-安全管理)
- [大模型调用的三种方式](#大模型调用的三种方式)
- [Function Calling 原理与设计哲学](#function-calling-原理与设计哲学)
- [硬编码逻辑 vs. Function Calling 对比](#硬编码逻辑-vs-function-calling-对比)

---

## Python 虚拟环境配置

AI 项目必须使用虚拟环境，原因是 AI 框架版本迭代极快，A 依赖于 B、B 依赖于 C，其中任何一个版本变化都可能打断整个工具链。**进入已有环境不要尝试升级 Python 版本**——"它现在能活着，你就让它好好活着，不要给它动手术"。

**推荐工具：Conda / MiniConda**

```bash
# 创建虚拟环境（指定 Python 版本）
conda create -n myenv python=3.12

# 激活环境
conda activate myenv

# 查看所有环境及路径
conda env list

# 导出依赖（用于迁移/复现）
pip freeze > requirements.txt

# 在新环境还原依赖
pip install -r requirements.txt
```

- Python 版本建议：**3.12**（包支持广、稳定）；不要再往更高升级
- 公司限制 Conda 时可用 venv 或其他方案（课程提供了 Windows/Linux/macOS 三平台文档）
- 虚拟环境的文件夹可以直接备份/迁移——重装系统时直接"烤出去"即可

**IDE 中切换虚拟环境**：在右下角点击 Python 版本选择对应 Conda 环境，即可切换语法检查和运行时。注意：复杂 f-string 语法可能导致 IDE 误报"语法错误"，不影响实际运行，做参考即可。

---

## API Key 安全管理

API Key 泄漏风险极高——直接 hard-code 进源码或打包时带上 `.env` 文件是常见事故。

**最佳实践：使用 `python-dotenv` 加载 `.env` 文件**

```bash
# .env 文件（放在工作目录之外，或加入 .gitignore）
OPENAI_API_KEY=sk-xxxx
```

```python
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
```

**安全注意事项**：
- `.env` 文件放在项目目录**之外**，避免被打包
- 或直接配置在系统环境变量（避免 `.env` 随代码传播；缺点是污染全局环境）
- 加入 `.gitignore` 防止上传到 Git
- **面试题**：`.env` 中的 `KEY` 与系统环境变量中同名 `KEY` 冲突时，`load_dotenv()` 默认**不覆盖**已有环境变量（加 `override=True` 才覆盖）

**API Key 工程化设计**（设计 API 平台时的参考）：
- 创建时设置**总额度限制**（防滥用）
- 设置**过期时间**
- 设置**开关**（泄漏时可立即禁用而不影响其他 Key）
- Key 创建后不允许修改（防止管理账号泄漏连带 Key）

---

## 大模型调用的三种方式

**1. OpenAI 官方 API 方式**
直接使用 `openai` 库调用，随版本升级 API 有变化，历史代码可能调用失败。

**2. SDK 方式（厂商自有 SDK）**
各大模型厂商（如百炼）提供自己的 SDK，封装了与 OpenAI 兼容但不受其版本影响的调用方式。适合长期维护的生产环境。

**3. HTTP 方式（最通用）**
用标准 HTTP POST 请求封装 `/v1/chat/completions`，屏蔽各厂商 SDK 差异。示例：

```python
def query(user_prompt: str) -> str:
    resp = requests.post(
        f"{base_url}/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={"model": model, "messages": [{"role": "user", "content": user_prompt}]}
    )
    return resp.json()["choices"][0]["message"]["content"]
```

封装为统一 `query()` 函数后，底层切换模型或厂商时上层代码无需改动。封装完后可让 AI 自动生成单元测试（中规中矩，可参考）。

---

## Function Calling 原理与设计哲学

Function Calling（也叫 Tool Calling）是大模型工程化的核心机制，不是所有模型都原生支持，部分模型通过 Prompt 模拟实现。

**工作流程（两步，非一次完成）**：

```
用户请求 → 模型判断是否需要工具
    ↓ (有工具可用)
返回 tool_call JSON（不是答案！）
    ↓
客户端执行工具函数
    ↓
将执行结果追加到消息历史
    ↓
再次请求模型 → 得到最终答案
```

**关键设计理解**：
- 模型输出的是 **tool_call JSON**，不是直接执行工具。**工具在客户端执行，不在模型端**。
- 为什么两步？解耦"要不要查"（模型负责）和"具体怎么查"（function 负责）——这是 Function Calling 最大的工程化价值：**模型与业务逻辑解耦**。
- Tool Call 与 Response 是两次独立交互，agent loop 的本质就是这个循环。

**思考题（留到讲 MCP 时对比）**：
- Function Calling 在客户端执行，MCP 在哪一端执行？两者设计有什么不同？
- 为什么使用 JSON Schema 描述工具？能用其他格式吗？

**工具定义示例**（查询销售数据库）：

```json
{
  "type": "function",
  "function": {
    "name": "query_sales_db",
    "description": "查询销售数据库，返回销售量最高的产品",
    "parameters": {
      "type": "object",
      "properties": {
        "top_n": {"type": "integer", "description": "返回前N个产品"},
        "metric": {"type": "string", "description": "排序指标：revenue|quantity"}
      },
      "required": ["top_n"]
    }
  }
}
```

---

## 硬编码逻辑 vs. Function Calling 对比

以"查询上海昨天天气"为例：

| 维度 | 硬编码（if/else + SQL） | Function Calling |
|------|------------------------|-----------------|
| 控制流 | 静态固定 | 模型动态决策 |
| 扩展性 | 改需求必须改代码 | 只需增加/修改工具定义 |
| 用户意图理解 | 仅匹配关键词 | 语义理解，灵活 |
| 错误处理 | 手动 if-else | 支持 fallback、重试、验证 |
| 维护成本 | 随功能增长线性增加 | 工具增量添加，逻辑稳定 |

Function Calling 的本质贡献是让模型只负责"要不要查/调用"的决策，具体实现完全交给独立的函数——**模型与实现彻底解耦**。

---

## Connections

- → [[006-what-is-ai-engineering]]（分层架构：Function Calling 在第 4/5 层，MCP 在第 3 层）
- → 模块 2 周日课：Function Calling 深入 + MCP 核心流程与场景对比
