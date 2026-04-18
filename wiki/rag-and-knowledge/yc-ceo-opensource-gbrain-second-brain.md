---
tags: [gbrain, second-brain, ai-agent, knowledge-base, mcp, memory, rag, garry-tan, yc]
source: https://mp.weixin.qq.com/s/XmPq6jrnuJT9w9capyDdIg
---
# GBrain：YC CEO 开源的 AI Agent 第二大脑系统

GBrain 是 Garry Tan（YC 总裁）开源的 AI agent 持久知识底座（MIT 协议）。核心机制是"读-写循环"：agent 每次回答前先读取可持续写入的 Markdown 知识库，对话结束后将新实体写回，每轮对话都让知识库积累一层。Garry 本人的部署规模已达 10,000+ Markdown 文件、3,000+ 人物档案、13 年日历数据。

## Key Concepts

- **读-写循环（复利积累）**：信号到来（会议/邮件/推文）→ agent 识别实体 → 读取知识库 → 带完整上下文回答 → 写回新信息 → 同步索引。没有这个循环 agent 每次从零开始；有了它每次对话都在已有基础上累积。Garry 的 agent 在他睡觉时跑"梦境循环"修复孤立引用、补充缺失实体。
- **两段页面结构**：每页分隔线上方是"已整理事实"（新证据出现时整体重写），下方是"时间线"（只追加、永不修改）。已整理事实 = 答案，时间线 = 证据，避免信息腐烂。
- **混合检索 + RRF 融合**：Claude Haiku 将查询扩展为多种表达方式，并行跑 HNSW 向量搜索（捕捉语义匹配，余弦相似度阈值 0.85）+ tsvector 关键词搜索（精确短语），RRF 融合排名后经四层去重（最优分块、高相似度合并、60% 类型多样性上限、页内分块上限）。
- **PGLite 嵌入式 Postgres**：`gbrain init` 使用 WASM 运行的 Postgres 17.5，含 pgvector，2 秒初始化、无需 Docker/Supabase；超过 1,000 文件时 `gbrain migrate --to supabase` 一键迁移（Pro 版 $25/月，8 GB）。
- **30 个 MCP 工具**：`gbrain serve` 通过 stdio 暴露 `get_page`、`put_page`、`search`、`traverse_graph`、`sync_brain` 等工具，供 Claude Code、Cursor、Windsurf 直连读写知识图谱；也可部署为远程 MCP（Supabase Edge Functions）从任何设备访问。
- **技能文件（Skill Files）**：agent 行为通过 Markdown 文档定义而非硬编码——ingest（导入+建交叉引用）、query（三层检索+引用来源）、maintain（健康检查：矛盾/过期/孤立页面）、briefing（每日简报：今日会议背景+活跃交易）、migrate（从 Obsidian/Notion/Logseq 迁移）。

## Key Numbers

| 数值 | 含义 |
|---|---|
| 10,000+ 文件 | Garry 本人的知识库规模（一周内建成）|
| 30 个 MCP 工具 | MCP server 暴露的工具数量 |
| 2 秒 | PGLite 数据库初始化时间 |
| 750 MB | 7,500 页知识库总存储（嵌入 134 MB + HNSW 索引 270 MB）|
| $4–5 | 初始嵌入成本（OpenAI text-embedding-3-large）|

## Key Takeaways

- "知识库的复利"比"更好的提示词"更有价值——agent 在累积知识上工作与每次从零开始，差距随时间指数级拉大
- 技能文件架构让非工程师也能调整 agent 行为（改 Markdown 即可），且可版本控制
- MCP 接口使同一个知识图谱可被 Claude Code、Cursor、Windsurf 等多个工具共享读写，打破工具间的上下文孤岛
- "梦境循环"是从"用户驱动更新"到"agent 自驱维护"的范式转变——agent 在用户不在线时自我修复和扩充知识库

## See Also

- [[mcp-protocol]]
- [[rag-retrieval-augmented-generation]]
- [[obsidian-knowledge-management]]
