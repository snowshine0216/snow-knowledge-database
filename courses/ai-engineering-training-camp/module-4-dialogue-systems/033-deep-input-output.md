---
tags: [langchain, prompt-template, custom-llm, vllm, output-parser, pydantic, validator, lcel]
source: https://u.geekbang.org/lesson/818?article=927449
wiki: wiki/courses/ai-engineering-training-camp/module-4-dialogue-systems/032-langchain-first-chain-fastapi.md
---

# 033: 深入输入与输出

**Source:** [2 深入输入输出](https://u.geekbang.org/lesson/818?article=927449)

## Outline
- [Overview](#overview)
- [Homework Recap from 032](#homework-recap-from-032)
- [Why Static PromptTemplate Is Not Enough](#why-static-prompttemplate-is-not-enough)
- [Three Demo Layers: Simple, Custom, ESC](#three-demo-layers-simple-custom-esc)
- [PersonInfo Data Class with Validators](#personinfo-data-class-with-validators)
- [Dynamic Template Composition](#dynamic-template-composition)
- [System vs User Prompt Separation](#system-vs-user-prompt-separation)
- [Saving Templates to JSON](#saving-templates-to-json)
- [Custom LLM Wrappers for Self-Hosted vLLM](#custom-llm-wrappers-for-self-hosted-vllm)
- [Preset Parameter Profiles](#preset-parameter-profiles)
- [Custom Output Parsers](#custom-output-parsers)
- [Chapter Summary](#chapter-summary)

---

## Overview

本讲深入 LangChain 的三件套 — **提示词 / 大模型 / 输出解析器** — 并对每一件做"自定义化"：

1. 从基础 `PromptTemplate` 升级到**动态、可扩展、带验证**的自定义模板
2. 从直接用 OpenAI / DeepSeek / Tongyi 升级到**自建 vLLM 私有化部署**的封装接口
3. 从内置 `JsonOutputParser` 升级到**带正则抽取 + 兜底处理**的自定义解析器

三部分共同回答一个企业级问题：**当官方组件"刚好够用但总差一口气"时，如何低成本地把它们包薄一层，让业务代码不再为细节流血。**

---

## Homework Recap from 032

老师建议在进入新内容前先动手完成三个 032 的练习：

1. **幻影语生成器** — 用户输入"法外狂徒"，系统回答"你好张三，欢迎使用智能客服"。用 `PromptTemplate` + LCEL 实现最短链。
2. **多变量链** — 组合多个输入字段。
3. **FastAPI 封装** — 把 Chain 用 FastAPI 暴露为 HTTP 接口，顺手测试传电量参数是否能被 LangChain 调用。虽然还是同步模式，后续会加异步。

实际写一遍比读十遍都有用。

---

## Why Static PromptTemplate Is Not Enough

`PromptTemplate.from_template("Hello {name}")` 只能替换固定变量 — 它是**静态模板**。企业场景会遇到三个痛点：

1. **动态组合** — 同一模板在"职业生涯规划 / 技能评估 / 转岗建议"场景下，需要的提示词段落不一样。
2. **输入校验** — `age` 必须在 0–150，`email` 必须合法，`base_url` 必须能访问。
3. **扩展性** — 保存与加载模板、版本化、热更新。

LangChain 的模板**支持 `{% if %}` 条件逻辑**，但老师明确建议 **不要使用** — 语法太简陋、关键字匹配容易失误。正确做法：**把条件逻辑提取到 Python 代码**，让模板本身保持"纯字符串组装"。

---

## Three Demo Layers: Simple, Custom, ESC

课件的 `P11/` 文件夹放了三个实现，建议按难度阅读：

| 文件 | 作用 | 阅读顺序 |
|---|---|---|
| `simple_demo.py` | 最精简逻辑，方便一眼看懂概念 | 先读 |
| `custom_prompt.py` | 展示关键自定义实现（类结构、装饰器、format 方法） | 再读 |
| `esc_template.py` | 生产级完整版：带 `try/except`、严格格式校验、保存/加载 JSON、版本字段 | 对照参考 |

**三者逻辑完全一致**，差别在于健壮性与工程化。日常开发参考 `custom_prompt.py`，上生产用 `esc_template.py`。

---

## PersonInfo Data Class with Validators

自定义模板的输入是一个数据类（相当于 DB Model 的内存形式）：

```python
from pydantic import BaseModel, validator

class PersonInfo(BaseModel):
    analysis_type: str = "basic"   # 默认基础分析
    name: str
    age: int
    profession: str
    skills: list[str]
    years_of_experience: int
    location: str

    @validator("age")
    def validate_age(cls, v):
        if v < 0 or v > 150:
            raise ValueError("age must be between 0 and 150")
        return v
```

要点：

- **`analysis_type` 有默认值**，实现"分析类型不传也能跑"。
- **`@validator("age")`** — Pydantic 装饰器，在构造时自动校验。抛 `ValueError` 会被 Pydantic 自动包装成 `ValidationError`。
- **`@property`** — 把方法伪装成属性，调用时不用加括号；内部可以执行复杂逻辑但外部使用像普通字段。

---

## Dynamic Template Composition

模板分 7 段（示例化编号）：

1. 角色设定
2. 输入字段要求
3. 职业生涯分析指令
4. 技能评估指令
5. 转岗建议指令
6. 输出格式要求（固定）
7. 兜底提示（固定）

根据 `analysis_type` 动态拼接：

| `analysis_type` | 实际组合段落 |
|---|---|
| `basic` | 1 + 2 + 6 + 7 |
| `career` | 1 + 2 + 3 + 4 + 6 + 7 |
| `skill` | 1 + 2 + 3 + 4 + 6 + 7 |
| `comprehensive` | 1 + 2 + 3 + 4 + 5 + 6 + 7 |

```python
class PersonPromptTemplate:
    def format(self, **kwargs) -> str:
        info = PersonInfo(**kwargs)
        sections = [SEC_ROLE, SEC_INPUT_REQ]
        if info.analysis_type in ("career", "skill", "comprehensive"):
            sections.extend([SEC_CAREER, SEC_SKILL])
        if info.analysis_type == "comprehensive":
            sections.append(SEC_TRANSITION)
        sections.extend([SEC_OUTPUT, SEC_FALLBACK])
        return "\n\n".join(sections).format(**info.dict())
```

**实战好处**：业务端只需要传 `{"analysis_type": "career", "name": "张三", ...}`，不需要动一行代码。

---

## System vs User Prompt Separation

学员提的好问题："这些模板是 prompt 还是 program？" — 老师画了一个清晰的二分：

```
System Prompt   (固定部分 + 动态选择的模板组合)
    ├─ 对 user prompt 的要求（需要姓名/年龄/技能等）
    └─ 对模型的作答格式要求（固定）

User Prompt     (用户提交的原始个人信息 + 分析类型选择)
    ├─ 姓名: 张三
    ├─ 年龄: 28
    ├─ 技能: [Python, ...]
    └─ type: "career"            ← 下拉列表选择
```

**设计原则**：
- 用户**从不手写完整的 system prompt** — 不现实。
- 用户通过 **下拉列表选择 `type`**（`career` / `skill` / `comprehensive`），只填自己的数据。
- `type` 作为参数影响 system prompt 的组合结构。
- 如果用户输入不完整，system prompt 可以反问（甚至拒答）。

这就是**系统侧的"模板" + 用户侧的"数据"** 的严格分离。模板工作属于后端开发；用户只需填空。

---

## Saving Templates to JSON

高频使用的模板（例如"职业生涯规划"这套）应保存到 JSON 文件，避免每次都走 if/else 判断：

```python
template.save_to_file("career_prompt.json")
reloaded = PersonPromptTemplate.from_config("career_prompt.json")
```

优点：
- **版本化** — 提示词变更可走 Git diff
- **热加载** — 运行时加载新模板，无需重启服务
- **AB 测试** — 不同版本并存

JSON 字段示例：`template_version`、`prompt_type`、`language`、`created_at`、`sections[]`。

---

## Custom LLM Wrappers for Self-Hosted vLLM

生产环境大模型常常**私有化部署**（vLLM 是最常见的选择），不是 OpenAI / DeepSeek / Tongyi 云端 API。LangChain 需要一个自定义 Wrapper：

```python
class CustomVLLMWrapper(LLM):
    model_name: str
    base_url: str
    temperature: float = 0.7
    max_tokens: int = 2048
    # ... 其他参数
```

参数按职能分类：

| 类别 | 参数 | 作用 |
|---|---|---|
| **基础** | `model_name`, `base_url`, `api_key` | 最小可运行配置 |
| **采样** | `temperature`, `top_p`, `top_k` | 控制随机性与核采样 |
| **生成** | `max_tokens`, `min_tokens`, `stop` | 长度控制与停止词 |
| **惩罚** | `repetition_penalty`, `frequency_penalty`, `presence_penalty` | 抑制重复（早期文章生成常用） |
| **高级采样** | `num_beams`, `length_penalty`, `no_repeat_ngram_size` | beam search / 束搜索策略 |
| **流式** | `stream` | 流式输出 |
| **校验** | validators on temperature (0–2), top_p (0–1) 等 | 防止用户传出格式 |

**版本兼容提醒**：`langchain >= 0.3` + `vllm >= 0.6`。版本错配时容易出现奇葩 bug 且很难调试，**每个项目用独立虚拟环境**是唯一的防御。

---

## Preset Parameter Profiles

vLLM 参数太多，逐个记不住也不实用。老师预设了 5 种组合配置：

| Profile | 场景 | 特征 |
|---|---|---|
| 保守型 (Conservative) | 要求准确、低随机 | `temperature=0.2`, `top_p=0.7` |
| **平衡型 (Balanced)** | 最常用 | `temperature=0.7`, `top_p=0.9` |
| 创意型 (Creative) | 文案、故事 | `temperature=1.1`, `top_p=0.95` |
| 精确型 (Precise) | 代码、数据抽取 | `temperature=0.1`, `top_p=0.5` |
| 多样型 (Diverse) | 贪心 + 遍历取中间值 | 特殊采样算法 |

调用时：
```python
llm = CustomVLLMWrapper(base_url=URL, preset="balanced")
```

**其他参数保持默认不变**，业务代码只关心 preset 一个字段。很多团队卡在"每次都要查参数表"的问题上，这一层封装直接消除。

---

## Custom Output Parsers

输入输出三件套的第三件。主要场景：**LLM 输出 "类 JSON" 但不是合法 JSON**，下游代码解析失败。

**链式处理 demo 流程**：

```
用户原始信息
    ↓
PromptTemplate 格式化 → Qwen 大模型
    ↓                     ↓
   生成"类 JSON"          ↓
    ↓                     ↓
ProjectPassser.parse() ← 正则提取 `\{.*\}` → 返回真正的 JSON
```

自定义解析器的核心是 `parse()` 方法：

```python
import re, json

class ProjectPasser(BaseOutputParser):
    def parse(self, text: str) -> dict:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise OutputParserException("No JSON block found")
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError as e:
            raise OutputParserException(f"Invalid JSON: {e}")
```

**内置解析器回顾**：

| 解析器 | 目标 |
|---|---|
| `StrOutputParser` | 字符串 |
| `CommaSeparatedListOutputParser` | 列表 |
| `JsonOutputParser` | JSON |
| `PydanticOutputParser` | Pydantic 模型（带校验） |
| `DatetimeOutputParser` | 日期时间 |
| `XMLOutputParser` | XML |

**更优的替代方案**：如果 LLM 总是输出"类 JSON"而不是合法 JSON，**微调模型直接产出合法 JSON 是根治方案**，自定义解析器只是临时补救。

---

## Chapter Summary

- **三件套深入** — 每一件都能且应当被"自定义化"：`PromptTemplate` → 带动态组合 + Pydantic 验证的类；`LLM` → 自建 vLLM Wrapper；`OutputParser` → 自定义 parse() + 正则兜底。
- **不要用 `{% if %}` 模板逻辑** — 提取到 Python 代码更清晰更可维护。
- **三层实现渐进**：simple_demo 学概念；custom 学核心；esc 作生产参考；日常修改以 custom 为起点。
- **System Prompt vs User Prompt** — 模板是 system 侧的系统工作；用户永远填数据 + 选 type。
- **preset 是 vLLM 参数的救命稻草** — 保守/平衡/创意/精确/多样五挡；业务代码只关心 preset 字段。
- **类 JSON → 合法 JSON** 的正则抽取是所有生产项目都会遇到的问题；终极方案是微调。
- 版本兼容坑仍然是 LangChain 生态的主要负担；**项目间严格隔离虚拟环境**是唯一的防御。
- 下一讲（034）会进入 LangChain 链的源码解析，帮助理解以上"封装"为什么能正确工作。
