---
tags: [prompt-engineering, agent, slot-filling, intent-recognition, memory, state-machine, dialogue-design, langchain, jinja2, error-handling]
source: https://u.geekbang.org/lesson/818?article=927429
wiki: wiki/concepts/012-prompt-engineering-and-agent-design.md
---

# 012: Prompt Engineering 高阶技巧与 Agent 设计

**Source:** [AI 工程化训练营 Prompt Engineering 高阶技巧与 Agent 设计](https://u.geekbang.org/lesson/818?article=927429)

## Outline
- [控制层：Prompt 在架构中的位置](#控制层prompt-在架构中的位置)
- [Prompt 高阶能力](#prompt-高阶能力)
- [Prompt 模板工程（Jinja2）](#prompt-模板工程jinja2)
- [生产级 Prompt 案例：客服 Agent](#生产级-prompt-案例客服-agent)
- [Agent 设计：对话状态机](#agent-设计对话状态机)
- [三层记忆系统](#三层记忆系统)
- [多轮对话核心设计：IR + SF](#多轮对话核心设计ir--sf)
- [生产级错误处理：四级降级策略](#生产级错误处理四级降级策略)

---

## 控制层：Prompt 在架构中的位置

AI 工程化的能力层次：

```
能力层（Function Calling）
    ↓
工具层（LangChain/LangGraph 框架）
    ↓
数据层（RAG / LlamaIndex）
    ↓
控制层（Prompt + Agent）  ← 本讲
```

Prompt 是贯穿所有层级的核心控制手段。调用工具、驱动 RAG、控制 Agent 行为，底层都依赖 Prompt 来触发和协调。

---

## Prompt 高阶能力

### 1. 思维链（Chain of Thought）

- 英文 `Let's think step by step` 能有效触发模型思考；中文版"让我们一步一步来"效果不稳定（模型有时会解析这句话本身而非执行思考动作）
- 推理模型（o1/o3/DeepSeek-R1）默认启用思维链，无需手动触发
- **前沿未解问题**：模型的"思考过程"是否真的与答案相关？研究发现有些情况下思考过程与最终结论完全无关联——模型可能在"假装思考"

### 2. 假设问题法（反向验证）

当不确定模型是否在幻觉时，将同一问题从多个角度反复提问：

```
法国的首都是哪里？
哪里是法国的首都？
巴黎是不是法国的首都？
```

多角度相同结论 → 可信度更高。用于 RAG 答案验证和 Agent 自我校验。

### 3. Prompt 安全

- **Safety Prompt（系统提示词防注入）**：在 system prompt 中写明禁止规则（"只回答以下规定的问题"）。成本最低，能防范大量攻击，但无法 100% 阻止所有提示词注入和提权
- **后置过滤（Post-generation Guard）**：在模型返回结果后，基于关键字或语义过滤器进行二次检查——即大模型输出一半时的"内容不安全"截断就是这种机制
- **两者结合**是当前最佳实践，无完美方案

### 4. 动态 Prompt 模板

使用 Python 字典模拟 switch/case，根据用户意图动态选择对应 Prompt：

```python
TEMPLATES = {
    "order_query": "你是订单查询助手，请从以下对话中提取...",
    "after_sales":  "你是售后助手，请根据以下信息处理退换货...",
    "product_info": "你是产品介绍助手，请回答以下问题...",
}

def get_template(intent: str) -> str:
    return TEMPLATES.get(intent, TEMPLATES["product_info"])
```

---

## Prompt 模板工程（Jinja2）

LangChain 的 `PromptTemplate` 功能有限且版本混乱。生产环境推荐使用 Python 原生模板框架 **Jinja2**：

```python
from jinja2 import Template

prompt_template = Template("""
你是一位{{ role }}助手。
用户问题：{{ query }}
{% if product_info %}
产品信息：{{ product_info }}
{% endif %}
请按以下步骤回答：...
""")

prompt = prompt_template.render(
    role="客服",
    query=user_input,
    product_info=product_data  # 可选，为空时该段落不渲染
)
```

Jinja2 支持：变量插值 `{{ var }}`、条件判断 `{% if %}`、循环 `{% for %}`、模板继承——比 LangChain PromptTemplate 更符合工程习惯。

---

## 生产级 Prompt 案例：客服 Agent

早期（多 Agent 框架不成熟时）将意图识别 + 工具调用全写入单一 Prompt 的实践：

```
角色定义：你是一位智能客服助手，请严格按以下步骤执行。

步骤一：意图识别
- 正则预过滤：若用户输入包含 [违禁词列表]，直接拒绝，不进入后续流程
- 判断意图类别：订单查询 / 售后 / 产品咨询 / 其他（转人工）

步骤二：参数提取（仅适用于订单查询意图）
- 从用户输入中提取以下字段，输出 JSON：
  {"order_id": "", "query_type": ""}
- 若必要参数缺失，追问用户补充

步骤三：工具调用
- 使用 Function Calling 调用订单查询接口
- 输出格式：JSON
```

**后续演进**：工作流平台（Coze/Dify）成熟后，将三步骤拆为独立节点，确保每个 Prompt 精准触发，防止流程被跳过（如用户说"直接到第三步"）。

---

## Agent 设计：对话状态机

### Agent 本质定义

不是"有记忆、有规划、能调工具"这些散装特性，而是：

> **在开放语义空间中，通过结构化协议和可控状态流，实现可追踪、可恢复、可中断的交互能力。**

### 对话状态机（FSM）

LangGraph、Coze、Dify、Regflow 等所有工作流工具的底层技术支柱都是**有向无环图（DAG）+ 对话状态机**。

**设计要素**：

| 要素 | 说明 |
|------|------|
| 开始节点 | 对话入口，接收用户输入 |
| 结束节点 | 对话出口，返回最终结果 |
| 中间节点 | 各功能单元（意图识别、槽位填充、工具调用…） |
| 状态变量 | 节点间传递的数据（订单 ID、城市名、意图类别…） |
| 单向流转 | 基于大模型特点，默认从前向后流转 |

**可移植性对比**：
- **LangGraph**：代码形式，可导出、可版本控制、可迁移 ✅
- **Coze**：拖拽式，无法导出为标准格式，不可迁移 ❌
- **Dify**：支持导出为 DSL 格式，可迁移 ✅

---

## 三层记忆系统

Agent 记忆按延迟和持久性分三层，对应认知科学中的记忆结构：

| 层级 | 名称 | 存储位置 | 内容 | 特点 |
|------|------|----------|------|------|
| L1 | Working Memory | 上下文窗口（Context） | 当前对话历史 | 延迟最低；对话结束即释放 |
| L2 | Session Memory | Redis / DynamoDB | Session ID + 用户画像 | 跨设备可用；会话级持久化 |
| L3 | Long-term Memory | 向量 DB + 结构化 DB | 用户偏好 + 历史行为 | 跨会话持久；实现个性化推荐 |

**实现细节**：
- **Working Memory**：每次请求携带上一轮的问题和答案，无需额外存储
- **Session Memory**：用 Session ID 绑定用户画像，同一 Session 中用户偏好逐步精准化。注意：**不要多人混用同一 Session ID**，否则用户画像相互污染
- **Long-term Memory**：`CLAUDE.md` 等 Markdown 偏好文件就是一种向 Agent 注入长期记忆的方式

**调试案例**：客户反馈 Agent "时好时坏"，排查后发现是多人共用同一 Session ID，导致用户画像被稀释（孩子问作业 + 成人问工作，画像混乱）。解决：Session ID 与 Trace ID 绑定，追踪每次对话质量。

---

## 多轮对话核心设计：IR + SF

### IR（Intent Recognition，意图识别）

1. 提前梳理用户可能问的所有问题，分类标注
2. **只接管能处理的意图**；涉及钱款/退款/投诉 → 直接转人工（AI 强行接管所有问题会惹怒用户）
3. 用提示词将用户自然语言转换为结构化意图标签

### SF（Slot Filling，槽位填充）

从用户输入中提取关键参数，设计三类属性：

| 槽位类型 | 说明 | 处理方式 |
|----------|------|----------|
| **必填槽（Required）** | 必须有才能继续流程 | 为空时追问用户 |
| **可选槽（Optional）** | 有了更好，没有也能继续 | 不追问，提供默认值 |
| **依赖槽（Dependent）** | 解锁条件满足后才激活 | 前置槽填充后才推送 |

**槽位依赖链示例**（机票订购）：

```
确认出发城市（必填）
    → 确认到达城市（必填）
        → 确认航班时间（必填）
            → 解锁：推荐目的地酒店（依赖槽）
                → 解锁：推荐目的地旅游套餐（依赖槽）
```

**异常情况处理**：
- 必填槽为空 → 追问用户
- 槽位值偏离正常范围（如"北京飞天津"选飞机）→ 反问确认
- 方言/语音识别偏差 → 兜底澄清（"您确认是从北京飞往天津吗？"）

---

## 生产级错误处理：四级降级策略

生产环境 Agent 必须设计容错机制，按以下顺序依次降级：

```
Level 1: 重试（Retry）
    └─ 指数退避（Exponential Backoff）
    └─ 工具超时 → 提示用户等待

Level 2: 降级模型（Model Degradation）
    └─ 高延迟模型 → 切换低延迟模型
    └─ 保持智能，牺牲质量

Level 3: 规则引擎（Rule Engine Fallback）
    └─ 模型完全失效 → 规则匹配
    └─ 不够智能，但保证任务完成

Level 4: 转人工（Human Handoff）
    └─ 最后兜底
    └─ 必须设计：不接受无限等待
```

**设计原则**：保障服务连续性——用户必须能把任务做完，即使最终是人工完成。AI 客服不能无限"保持"。

---

## Connections

- → [[006-what-is-ai-engineering]]（控制层在 AI 工程化分层架构中的位置）
- → [[009-function-calling-and-mcp-basics]]（Prompt 驱动工具调用的底层机制）
- → [[011-llamaindex-and-rag-systems]]（Prompt 驱动 RAG 检索的控制层）
- → 模块 4：Multi-Agent 设计与协同
