---
tags: [dsl, antlr, lark, ast, agent, langgraph, llm, workflow, mcp, prompt-engineering]
source: https://u.geekbang.org/lesson/818?article=927473
---
# DSL生产化：模板填充、热更新与多Agent协作

本文总结 AI工程训练营第057讲的核心内容，延续上一讲的 Coffee DSL 示例，聚焦 DSL 在生产环境中的工程实践。

## 核心问题：如何防止大模型生成DSL时出现幻觉？

**策略：模板 + 变量注入**

不让大模型直接生成完整 DSL，而是：
1. 预先定义 DSL 模板（`.tpl`文件），将可变部分设为占位变量
2. 用提示词引导大模型从用户输入中提取关键参数（槽位），输出 JSON
3. 将 JSON 参数填充到模板对应位置
4. 对填充后的 DSL 做语法验证，通过后才执行

典型商业案例：[[aippt]] 正是这一模式——大模型生成结构化 JSON，套入 PPT 模板渲染输出。

## 三层安全防护

| 层级 | 手段 | 说明 |
|------|------|------|
| 提示词层 | 槽位范围限定 + 默认值 | 防止用户输入超出业务合理范围 |
| 模板层 | 模板填充 + 变量替换 | 确保结构合法，大模型只填变量 |
| 语法层 | DSL 语法验证（Lark/ANTLR） | 验证通过才允许执行 |

生产级系统必须三层全部通过，区别于玩具级 Agent 项目。

## DSL热更新（不停机更新）

传统方式改完 DSL 需重启服务。生产系统可实现热更新：

```
load_workflow():
  读取DSL文件/DB → 解析为AST → 重新初始化LangGraph app → 覆盖workflow变量
```

- **自动触发**：监听文件/DB变更
- **手动触发**：Web 接口发送 `reload` 指令
- **版本回滚**：DSL 入库时记录版本，出错可回滚到指定版本

## 多Agent场景中的DSL传递

DSL 以字符串形式在多个 Agent 间流转，每个 Agent 读取共享 DSL 并执行各自职责：

```
顾客订单 → 取单Agent → 咖啡师Agent（DSL解析冲泡方式）
                              ↓ 原料不足
                        仓储Agent（补充原料）
                              ↓
                        服务员Agent（通知顾客）
```

## 行业方向

讲师判断近期两大就业热点：
1. **[[dify]] 二次开发** — 工作流开发需求持续增长，Dify/Coze 是主流平台
2. **AI编程 + [[langgraph]]** — 工程师深耕 Agent 组件（记忆、工具、[[react-agent]]、[[mcp]]）

不建议企业自研基础模型（某银行案例：数亿投入微调效果不如 Qwen 2.5）。

## 关联概念

- [[056-antlr-lark-dsl-parsing-1]] — 基础：ANTLR/Lark 语法解析入门
- [[langgraph]] — 工作流框架，热更新和多Agent的运行容器
- [[mcp]] — DSL 可封装为 MCP 工具暴露给 Agent
- [[react-agent]] — 讲师推荐的核心 Agent 推理模式
- [[prompt-engineering]] — 槽位设计是提示词工程的核心应用
