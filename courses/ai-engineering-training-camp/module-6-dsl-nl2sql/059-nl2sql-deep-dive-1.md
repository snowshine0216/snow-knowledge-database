---
tags: [nl2sql, text2sql, sql-generation, rag, fine-tuning, vanna, llm]
source: https://u.geekbang.org/lesson/818?article=927475
wiki: wiki/concepts/059-nl2sql-deep-dive-1.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 你认为目前业界最先进的 NL2SQL 方案在标准数据集上的准确率大约能达到多少？为什么这个上限难以突破？
2. 将自然语言转换成 SQL 时，用户表达的哪类歧义会让大模型最难处理？请举一个例子。
3. 如果让你设计一个 Text2SQL 系统，你会选择 RAG（检索增强）还是模型微调方案？理由是什么？

---

# 059: NL2SQL Deep Dive Part 1

**Source:** [5NL2SQL详解1](https://u.geekbang.org/lesson/818?article=927475)

## Outline
- [NL2SQL 与 Text2SQL 的概念区分](#nl2sql-与-text2sql-的概念区分)
- [NL2SQL 的行业现状与挑战](#nl2sql-的行业现状与挑战)
- [SQL 复杂度与适用场景](#sql-复杂度与适用场景)
- [自然语言歧义问题](#自然语言歧义问题)
- [NL2SQL 发展阶段](#nl2sql-发展阶段)
- [基于上下文学习的方案：Vanna](#基于上下文学习的方案vanna)
- [Vanna 的使用方式](#vanna-的使用方式)
- [Vanna 的架构设计](#vanna-的架构设计)
- [从产品设计角度看 Text2SQL](#从产品设计角度看-text2sql)

---

## NL2SQL 与 Text2SQL 的概念区分

NL2SQL 是一个更大的概念，泛指所有自然语言（包括语音、手写等形式）转为 SQL 的场景。Text2SQL 则专指基于文本对话的方式将自然语言转换成 SQL，范围更窄。本课程中两个词等同使用，均指 Text2SQL。

NL2SQL 也属于 DSL（领域特定语言）转换的一部分，SQL 就是一种领域特定语言。

---

## NL2SQL 的行业现状与挑战

NL2SQL 在业界至今没有公认做得很好的解决方案，主要原因：

1. **语料难以积累**：用户很少反复问相同的问题，常见查询已经被开发者用代码实现了，剩下需要 Text2SQL 处理的往往是低频、复杂的查询，缺乏训练数据。
2. **SQL 语法严格**：生成的 SQL 必须通过语法校验器，一旦出错需要打回大模型重新生成。
3. **准确率上限低**：目前业界最先进的方案在 Spider 数据集上的准确率约 60%~70%，几乎没有任何厂商敢承诺超过 80%。

两大解决路径：
- **基于 RAG 的方式**（上下文学习）
- **基于微调（Fine-tuning）的方式**

---

## SQL 复杂度与适用场景

| SQL 类型 | AI 适用性 | 说明 |
|----------|-----------|------|
| 简单查询（SELECT … WHERE）| 非常适合 | 直接生成效果好，准确率高 |
| 聚合查询（COUNT, AVG, GROUP BY）| 较适合，需兜底 | AI 容易丢掉括号、分号等符号，需先做语法校验 |
| 多表联合查询（JOIN）| 不推荐 | 准确率低于 70%，约每 3 次出 1 次错误，不可靠 |

**多表联合查询的问题**：
- 大模型容易使用"倒排序取第一"替代 `MAX()`，逻辑不等价
- 用户问题模糊时，大模型无法准确识别要用哪些表和字段
- 一旦 RAG 召回不准确，多表联合查询百分之百出错

---

## 自然语言歧义问题

Text2SQL 面临三类用户语言歧义：

### 1. 词汇歧义（Lexical Ambiguity）
例：「患者使用了阿斯匹林」—— 阿斯匹林是药品本身，还是含阿斯匹林成分的制剂？类似「苹果」可以指水果或苹果公司。**处理方式：反问用户澄清。**

### 2. 句法歧义（Syntactic Ambiguity）
例：「通知家属和患者检查结果」—— 是通知家属关于患者的结果，还是同时通知家属和患者？**处理方式：给用户提供是/否选项追问。**

### 3. 语义欠指定（Semantic Under-specification）
例：「这个药的效果比较好」—— 好在哪？疗效？适应症？人群？上下文可能被截断或总结，大模型未必能关联。**处理方式：要求用户补全比较维度。**

---

## NL2SQL 发展阶段

NL2SQL 技术经历四个阶段：

| 阶段 | 特点 | 准确率（Spider） |
|------|------|-----------------|
| 基于规则方法 | 正则表达式匹配，适合安全过滤 | 极低 |
| 基于注意力机制 | 编码器/解码器 + 上下文 | ~20% |
| 基于预训练微调 | 大规模语料 + SFT | ~50% |
| 当代大模型时代（GPT-4/5, Claude） | in-context learning + 微调 | 60%~70% |

预测：2025 年底约 80% 的数据分析可通过自然语言完成。

**学习建议**：通过阅读相关论文了解发展史，避免重复踩已被研究证伪的路径。

---

## 基于上下文学习的方案：Vanna

Vanna 是一个基于 RAG 思路实现 NL2SQL 的开源框架，核心逻辑：

```
用户问题 → 检索（表结构 + 历史问答对 + 文档）→ Prompt 组合 → 大模型生成 SQL → 语法校验 → 执行数据库 → 返回结果
```

Vanna 的三类训练数据（存入向量数据库）：
1. **DDL**：数据库表结构（CREATE TABLE 语句）
2. **SQL 示例**：历史成功执行的 SQL 及对应问题
3. **文档**：业务说明、字段定义等文本

---

## Vanna 的使用方式

### 命令行使用

```python
from vanna.openai.openai_chat import OpenAI_Chat
from vanna.chromadb.chromadb_vector import ChromaDB_VectorStore

class MyVanna(ChromaDB_VectorStore, OpenAI_Chat):
    def __init__(self, config=None):
        ChromaDB_VectorStore.__init__(self, config=config)
        OpenAI_Chat.__init__(self, config=config)

vn = MyVanna(config={'api_key': '...', 'model': 'gpt-4'})
vn.connect_to_sqlite('chinook.sqlite')

# 训练：导入表结构
df_ddl = vn.run_sql("SELECT type, sql FROM sqlite_master WHERE sql IS NOT NULL")
for ddl in df_ddl['sql'].to_list():
    vn.train(ddl=ddl)

# 训练：添加示例 SQL
vn.train(sql="SELECT * FROM customers LIMIT 10")

# 提问
result = vn.ask("What are the top 10 customers by sales?")
```

### Web 界面使用（Flask）

```python
from vanna.flask import VannaFlaskApp
app = VannaFlaskApp(vn)
app.run()
```

- 支持在 Web 界面中管理 Training Data（DDL、文档、SQL）
- 支持对话历史查看
- 支持结果人工确认后自动入库向量数据库（用于下次更准确的召回）
- 支持语音、图表等输出形式

---

## Vanna 的架构设计

Vanna 支持灵活替换大模型和向量数据库：

| 组合 | 初始化方式 |
|------|-----------|
| OpenAI + ChromaDB | `class MyVanna(ChromaDB_VectorStore, OpenAI_Chat)` |
| Ollama（本地）+ 其他向量DB | `class MyVanna(OtherVectorDB, OllamaChat)` |

Vanna 的设计亮点：
- 在文档中直接提供各种大模型 + 向量数据库组合的初始化代码
- 目录结构扁平，不同数据库（Oracle、SQLite、PostgreSQL）、不同模型均放在同级目录
- 通过多继承 Mixin 方式灵活组合能力

---

## 从产品设计角度看 Text2SQL

对比 LangGraph 原生 Agent 与成熟产品 ChatDB 的差距，需要自己补充的功能：

| 功能 | LangGraph 原生 | 需要自己实现 |
|------|----------------|-------------|
| 表结构获取 | 每次运行时从数据库提取 | 持久化到向量数据库 |
| 用户认证 | 无 | 需自行添加 |
| Web 服务器 | 无 | 需包装 Flask/Streamlit |
| 对话历史持久化 | 存内存，不持久 | 存到数据库（Redis） |
| 图表样式 | 无 | 自行实现 |
| 纠错机制 | 无 | 语法校验 + 重试 |
| 模型切换 | 无 | 前端选择 + 配置化 |

**建议**：先研究 Vanna 源码，再基于 LangGraph 和 Vanna 做二次开发，实现企业级 AI 取数工具。

---

## Connections
- → [[058-nl2sql-introduction]]
- → [[060-nl2sql-deep-dive-2]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释自然语言歧义的三种类型，并为每种类型给出本课提到的具体例子和对应的处理方式。
2. Vanna 框架的核心工作流程是什么？它向向量数据库中存入哪三类训练数据，各自的作用是什么？
3. 为什么课程建议对多表联合查询（JOIN）不推荐直接使用 AI 生成 SQL？结合准确率数据和大模型的具体失误模式来解释。

<details>
<summary>答案指南</summary>

1. 三种歧义：**词汇歧义**——同一词有多种指代（如"阿斯匹林"指药品还是制剂），需反问用户澄清；**句法歧义**——句子结构可多种解读（如"通知家属和患者"的对象不明），需给用户提供是/否选项追问；**语义欠指定**——表达缺乏比较基准（如"效果比较好"未指明维度），需要求用户补全比较维度。
2. Vanna 的工作流程为：用户问题 → 检索（表结构 + 历史问答对 + 文档）→ 组合 Prompt → 大模型生成 SQL → 语法校验 → 执行数据库 → 返回结果。三类训练数据：**DDL**（CREATE TABLE 语句，描述表结构）、**SQL 示例**（历史成功执行的 SQL 及对应问题）、**文档**（业务说明与字段定义文本）。
3. 多表联合查询的准确率低于 70%，约每 3 次出 1 次错误。大模型常犯的失误包括：用"倒排序取第一"替代 `MAX()`（逻辑不等价）、用户问题模糊时无法准确识别该关联哪些表和字段，且一旦 RAG 召回不准确，多表联合查询几乎百分之百出错。

</details>
