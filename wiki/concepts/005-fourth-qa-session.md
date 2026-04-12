---
tags: [agent, intent-recognition, slot-filling, human-in-the-loop, mcp, multimodal, industrial-ai, agent-evaluation]
source: https://u.geekbang.org/lesson/818?article=956016
---

# Agent 软性逻辑、槽位填充与评估框架

本文整理了 AI 工程化训练营第四次直播答疑的核心内容，以订票系统为主线，讲解大模型如何将传统编程的硬性逻辑（条件/循环/函数调用）替换为软性逻辑（意图识别/Agent Loop/MCP），以及槽位填充、Human-in-the-Loop 的实现机制与 agent 的两层评估方法。

## Key Concepts

- **软硬对照**：意图识别 = 软性 if/else；Agent Loop = 软性 while；MCP/Skills = 软性函数调用；槽位 = 函数必选参数。大模型不替代后端确定性逻辑，而是在前端加一层自然语言调度层。

- **槽位填充（Slot Filling）**：提示词驱动模型检查必填参数是否齐全；缺参数时主动追问用户；每轮对话通过上下文积累参数直到齐全，再触发后续确定性程序。无需显式状态机。

- **Human-in-the-Loop（人机协同）**：工作流在需要人工介入的节点暂停（如支付确认），LangGraph 提供声明式实现；与传统回调函数语义相同，但以图结构表达。

- **Tool Calling 演化路径**：function calling → MCP（标准化协议）→ Skills（prompt + MCP 封装）。模型能力触顶时通过外部工具补足。

- **AI 嵌入现有系统**：最低成本切入点是将 UI 交互从按钮改为自然语言输入，后端逻辑保持不变。随信任度提升再逐步扩展 agent 覆盖的中间节点。

- **Agent 评估两层**：业务层（模拟生产环境 + 真实查询，测路由准确率/工具调用成功率/错误率）优先；技术层（压测工具 + 边界条件，如上下文溢出行为）次之。

- **小模型 + 大模型协同**：工业视觉场景中 YOLO 先做初筛，大模型对视频片段做二次审核，利用时序信息区分相似外观（火焰 vs 尾灯、吸烟 vs 电焊）。

## Key Takeaways

- Agent 是对传统程序逻辑的软性替代，不是重建——先在一个节点试点，再逐步扩展
- 槽位填充靠上下文积累驱动，不需要独立状态机；Human-in-the-Loop 靠 LangGraph 节点暂停实现
- 业务评估优先于技术评估：先验证 agent 的路由和工具调用在真实业务查询下是否可接受，再做压测
- 工业 AI 的真实瓶颈往往是硬件成本而非算法——专用 AI 盒子动辄十几万，决定项目生死

## See Also

- [[ai-engineering-three-patterns]]
- [[004-third-qa-session]]
