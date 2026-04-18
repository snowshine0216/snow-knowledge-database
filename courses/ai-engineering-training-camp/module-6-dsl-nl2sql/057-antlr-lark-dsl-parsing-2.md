---
tags: [dsl, antlr, lark, ast, agent, langgraph, llm, workflow, mcp, prompt-engineering]
source: https://u.geekbang.org/lesson/818?article=927473
wiki: wiki/concepts/057-antlr-lark-dsl-parsing-2.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在将大模型（LLM）与DSL结合生成结构化内容时，为什么通常建议使用"模板填充变量"的方式，而不是让大模型直接生成完整的DSL字符串？
2. 如果一个生产级系统需要在不重启服务的情况下更新工作流规则，你认为大概需要哪些机制来实现"热更新"？
3. 在多Agent协作场景中，各Agent之间如何共享和传递任务状态或指令？DSL在其中可能扮演什么角色？

---

# 057: ANTLR与Lark 解析 DSL 语法 (Part 2)

**Source:** [3使用 ANTLR与Lark 解析 DSL 语法2](https://u.geekbang.org/lesson/818?article=927473)

## Outline

1. DSL与智能体组合的应用场景
2. AIPPT案例：DSL + 大模型 + 模板的商业模式
3. 模板方式生成DSL的原因（防幻觉）
4. 多Agent协作与DSL共享
5. Coffee DSL进阶演示：提示词提取 + 模板填充 + 语法验证
6. DSL高级技巧：动态生成、参数注入、热更新（不停机更新）、版本控制
7. 行业展望：DeFi二次开发、AI编程Agent、LangGraph方向

---

## Section 1: DSL与智能体组合的应用场景

本讲延续上一节的Coffee DSL示例，介绍DSL与Agent/LangGraph结合的多种应用场景：

- **意图识别工作流**：接收DSL + 用户指令 → 生成新版本DSL → 验证 → 应用新规则。使用自然语言修改工作流内容，是DSL的最大价值。
- **DSL封装为Tool或MCP**：将DSL能力放入Agent的tool中，或封装为MCP工具。当DSL过长导致大模型出现幻觉时，使用 prompt template + DSL 的组合方式提升生成准确度。
- **多Agent DSL共享**：在咖啡店数字员工团队场景中，DSL以字符串形式在多个Agent间传递，分别由取单Agent、咖啡师Agent、仓储Agent、服务员Agent协作完成任务。

## Section 2: AIPPT案例分析

AIPPT是典型的"DSL + 大模型 + 模板"商业模式：

1. 用户输入主题、页数、文本量、配图量、语言受众场景等参数
2. 大模型生成结构化JSON（DSL格式），包含页面标识（如`Normal`、`head`/`body`等）
3. 系统根据选定的PPT模板，将JSON内容填充到对应模板位置（标题页、正文页、结尾页）
4. 最终渲染输出PPT

讲师使用豆包演示：让大模型生成"OpenAI Agent介绍"5页PPT的JSON结构，然后套模板输出。

**为何使用模板而非直接生成？** 不同于AIPPT必须套模板保证样式，讲师用模板的原因是**防止大模型幻觉**——将常用变量抽出，通过对话填充；无对话时用默认值填充，提升稳定性。

## Section 3: Coffee DSL进阶演示

在`coffee.py`基础上升级，演示完整的"提示词提取 → 模板填充 → 语法验证 → 执行"流程：

**提示词设计要点：**
- 设定角色（大模型视自身为参考文档/说明书）
- 定义槽位（slot）：水温、加热时间、萃取强度
- 为每个槽位预设范围和默认值（防止用户随意输入）
- 识别关键词并填充到对应槽位
- 以JSON格式输出

**执行流程（`demo.py`）：**
1. 用户输入自然语言请求
2. LLM通过提示词提取JSON参数
3. 将JSON与`coffee.tpl`模板组合（变量填充）
4. 验证填充后DSL的语法合法性
5. 通过验证后才交给"咖啡机"执行

**安全性说明：** 讲师举例工业设备（6米高、20吨重的起重机）：若不做验证就执行，错误指令可能导致严重安全事故。验证步骤是生产级系统的必须项，与Agent玩具项目不同。

## Section 4: DSL高级技巧

**1. 动态生成（Dynamic Generation）**
- 基于统一模板 + 不同用户参数生成个性化DSL
- 以用户名作为 thread ID，与 LangGraph 结合（用户A低温慢萃，用户B高温快萃）

**2. 参数注入（Parameter Injection）**
- 防止温度等参数被硬编码写死
- 运行时通过注入器动态传入参数

**3. 热更新/不停机更新（Hot Reload）**
- 传统方式：改DSL → 重启服务 → 加载文件
- 热更新方式：使用Manager管理器 + 线程阻塞机制
  - 设计 `load_workflow()` 函数：加载DSL → 解析为AST → 重新初始化LangGraph app → 覆盖原有工作流变量
  - 支持自动触发（监听文件变更）和手动触发（Web接口发送`reload`指令）
  - 手动流程：Web界面上传规则 → 验证 → 入库 → 调用reload → 重新读取DB → 覆盖变量
  - 实际案例：客户要求Web界面操作 + 权限控制 + 版本回滚（改数据库 → 重新加载 → 出错回滚到上一版本）

**4. 版本控制（Version Control）**
- DSL入库时记录版本
- 提供回滚到指定版本的接口
- 解决操作责任归属问题（谁操作谁负责）

## Section 5: 行业展望与就业方向

讲师认为当前AI工程领域有两大就业热点：

**1. DeFi（Dify）二次开发**
- 工作流开发将在下半年及明年上半年非常火热
- 大量投资涌入工作流开发，Dify 和 Coze 是当前最成熟的平台
- 计划在课程中加入 Dify 二开内容

**2. AI编程 + LangGraph**
- 让普通人通过无代码工作流参与 Agent 开发
- 工程师则更精细地控制 Agent 组件（记忆、工具、ReAct、MCP、LangGraph）

**两种范式对比：**
| 路径 | 适合人群 | 特点 |
|------|----------|------|
| 无代码工作流（Dify/Coze） | 非技术用户 | 门槛低，固化业务逻辑 |
| AI编程 + LangGraph | 研发工程师 | 更灵活，精细控制组件 |

**关于LLM自研的建议：** 不建议企业自研基础模型。以某银行案例为例：投入数亿自研微调模型，效果仍不如 Qwen 2.5，最终放弃自研。建议聚焦 Agent 组件的深度开发，包括：记忆组件、工具组件、ReAct思考组件、MCP通信、LangGraph工作流。

**未来展望（上下文工程）：**
- Agent形式：ReAct + MCP工具调用 + 长期记忆（Homing Loop中断后恢复）
- 上下文工程：System Prompt + User Prompt + 工具执行结果的综合利用
- 多Agent系统（Multi-Agent System/MAS）是对业务的拆解，非根本性变革（"毛毛虫加火箭"vs"化蛹成蝶"）

## Key Takeaways

1. **DSL生产化三层防护**：提示词级验证（槽位范围限定）→ 模板填充 → 语法验证，三层保障才能执行。
2. **防幻觉核心策略**：使用模板+变量注入，让大模型只填充关键变量而非生成完整DSL，大幅提升稳定性。
3. **热更新设计模式**：`load_workflow()` + Manager管理器 + 数据库版本控制，是生产级DSL系统的标准配置。
4. **多Agent DSL传递**：DSL以字符串形式在Agent间流转，是构建协作型AI系统的有效模式。
5. **工程师定位**：不是追求模型性能，而是深耕Agent组件的设计与组合能力。

## Connections

- [[056-antlr-lark-dsl-parsing-1]] — 上一讲：ANTLR/Lark 基础语法解析
- [[langgraph]] — LangGraph工作流框架，本讲热更新和多Agent场景的核心
- [[mcp]] — Model Context Protocol，DSL可封装为MCP工具
- [[prompt-engineering]] — 提示词工程：槽位设计、范围限定、JSON输出格式
- [[react-agent]] — ReAct推理模式，讲师推荐的核心Agent架构
- [[dify]] — Dify工作流平台，讲师预告的二次开发方向


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 本讲提出了DSL生产化的"三层防护"机制，请用自己的话解释这三层分别是什么、每层解决了什么问题。
2. 解释"热更新（Hot Reload）"的完整设计模式：从用户在Web界面上传新规则，到工作流实际更新，中间经历了哪些步骤？`load_workflow()` 函数的作用是什么？
3. 讲师对"企业是否应该自研基础大模型"持什么立场？他用什么案例支撑这个观点，并建议工程师将精力聚焦在哪些具体方向上？

<details>
<summary>答案指南</summary>

1. 三层防护依次为：①提示词级验证（槽位范围限定，防止用户随意输入）→ ②模板填充（将提取的JSON参数注入模板，得到合法DSL结构）→ ③语法验证（用ANTLR/Lark解析验证DSL合法性，通过后才执行）。每层各自拦截不同类型的错误，缺一不可，类比工业设备的安全联锁。
2. 热更新流程：Web界面上传规则 → 验证 → 入库（数据库记录版本）→ 调用reload接口 → `load_workflow()` 重新读取DB → 解析为AST → 重新初始化LangGraph app → 用新工作流变量覆盖旧变量，全程无需重启服务。`load_workflow()` 是核心函数，负责将DSL从存储层转化为可运行的LangGraph工作流对象。
3. 讲师明确不建议企业自研基础模型，以某银行为例：投入数亿元自研微调模型，效果仍不如开源的Qwen 2.5，最终放弃。他建议工程师聚焦Agent组件的深度开发，具体包括：记忆组件、工具组件、ReAct思考组件、MCP通信协议和LangGraph工作流设计。

</details>
