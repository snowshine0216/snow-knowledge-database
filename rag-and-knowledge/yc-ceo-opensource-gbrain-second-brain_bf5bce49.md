---
tags: [gbrain, second-brain, ai-agent, knowledge-base, mcp, memory, rag, garry-tan, yc]
source: https://mp.weixin.qq.com/s/XmPq6jrnuJT9w9capyDdIg
wiki: wiki/tools/yc-ceo-opensource-gbrain-second-brain.md
---

# YC CEO 开源第二大脑系统 GBrain：专供 OpenClaw 与 Hermes，全息记忆打造迷你 AGI

## Article Info
- URL: https://mp.weixin.qq.com/s/XmPq6jrnuJT9w9capyDdIg
- Title: YC CEO把自己第二大脑系统开源了：专供OpenClaw与Hermes，全息记忆打造迷你AGI
- Author: 你说的完全正确（YAR师）
- Account: AI寒武纪
- Publish time: 2026-04-11
- Access mode: `public`

## Executive Summary

Garry Tan（YC 总裁）开源了他自己搭建并持续使用的 AI 知识底座系统 GBrain（MIT 协议）。GBrain 的核心循环是：agent 每次回答前先读取一个可持续写入的 Markdown 知识库，对话结束后将新实体和更新写回，每轮对话都让 agent 更聪明一些。系统无需服务器即可启动（PGLite + WASM 嵌入式 Postgres），支持 CLI、MCP server、远程 MCP 三种接入方式，并内置混合检索（向量 HNSW + 关键词 tsvector + RRF 融合）。Garry 本人的部署规模已达 10,000+ Markdown 文件、3,000+ 人物档案、13 年日历数据，是目前已知开源"personal AI second brain"中规模最大、工程化最完整的实现之一。

## Outline

1. **GBrain 是什么** — 介绍 GBrain 的定位：AI agent 的持久知识底座，读取-写入循环让每次对话都有复利积累
2. **复利效应** — 描述信号→实体识别→读取→回答→写回→索引的完整循环，以及典型查询示例
3. **知识模型** — 每页"已整理事实 + 时间线"的两段结构设计
4. **搜索架构** — 多查询扩展 + HNSW 向量 + tsvector 关键词 + RRF 融合 + 四层去重
5. **无服务器起步** — PGLite 嵌入式 Postgres，规模扩展时迁移到 Supabase
6. **三种使用路径** — CLI、MCP server（30 个工具）、远程 MCP（Supabase Edge Functions）
7. **数据接入集成** — Voice/Email/X/Calendar/Meeting Sync 五种自动入库通道
8. **技能文件** — 用 Markdown 行动手册定义 agent 行为（ingest/query/maintain/enrich/briefing/migrate）

## Key Numbers

| 数值 | 含义 |
|---|---|
| 10,000+ | Garry 本人部署的 Markdown 文件数量 |
| 3,000+ | 人物档案数量（用于社交图谱交叉检索） |
| 13 年 | 日历数据积累时长 |
| 280+ | 会议记录数量 |
| 300+ | 原始想法条目 |
| 30 分钟 | 从安装到完整运行所需时间 |
| 2 秒 | PGLite 数据库初始化时间 |
| 30 个 | MCP server 暴露的工具数量 |
| 0.85 | 向量去重合并的余弦相似度阈值 |
| 60% | 结果类型多样性上限 |
| 750 MB | 7,500 页规模知识库的总存储（134MB 嵌入 + 270MB HNSW 索引） |
| $4–5 | 初始嵌入成本（OpenAI text-embedding-3-large） |
| $25/月 | Supabase Pro（8 GB，1,000+ 文件时需要） |

## Section Summaries

### 1. GBrain 是什么

GBrain 是 AI agent 的知识底座，把会议记录、邮件、推文、日历事件、语音通话、原始想法统统汇入一个可检索的知识库。

**核心循环**：
- agent 回答前：先读取知识库，带着完整上下文回答
- agent 回答后：把新信息写回知识库，同步索引供下次检索

每一轮对话都让知识库积累一层，产生复利效应。

**起步门槛极低**：
- 安装到完整运行约 30 分钟
- PGLite 初始化仅需 2 秒，无需任何服务器
- 支持 Claude Opus 4.6 和 GPT-5.4 Thinking；不适合小模型

### 2. 复利效应与典型查询

**完整循环**：
```
信号到来（会议/邮件/推文/链接）
  → agent 识别实体（人物、公司、想法）
  → 先读取知识库
  → 带完整上下文回答
  → 把新信息写回知识库
  → 同步索引
```

没有这个循环，agent 每次从零开始；有了它，每次对话都在已有基础上累积，差距每天拉大。

**典型查询示例**（体现知识库深度）：
- "谁同时认识 Pedro 和 Diana，适合邀请一起吃晚饭？" → 在 3,000+ 人物档案构成的社交图谱里交叉检索
- "我之前怎么看待'羞耻感和创始人表现之间的关系'？" → 搜索个人思考记录，不是搜互联网
- "30 分钟后要跟 Jordan 开会，帮我准备一下" → 调取档案、共同历史、最近动态、未完事项

**起源故事**：Garry 在配置自己的 OpenClaw agent 时开始维护 Markdown 知识库，一人一页、一公司一页。随着持续写入越来越有用，一周内建起 10,000+ 文件。他的 agent 在他睡觉时也在运行——"梦境循环"扫描每次对话、补充缺失实体、修复断开引用、整合记忆，他醒来时知识库比睡前更完整。

### 3. 知识模型

每一页都遵循"已整理事实 + 时间线"的两段结构，以分隔线为界：

| 区域 | 内容 | 更新策略 |
|---|---|---|
| 分隔线**上方** | 已整理事实（curated facts）| 新证据出现时**整体重写** |
| 分隔线**下方** | 时间线（timeline）| 只**追加**，永不修改 |

> 已整理事实是答案，时间线是证据。

### 4. 搜索架构

**多查询扩展**：用 Claude Haiku 把原始问题改写成多种表达方式，同时发起多路检索。

**双路并行检索**：
- 向量搜索：HNSW 余弦相似度（捕捉语义/概念匹配）
- 关键词搜索：tsvector（精确短语匹配）

**RRF 融合排名**：Reciprocal Rank Fusion 合并两路结果。

**四层去重**：
1. 每页只保留最优分块
2. 余弦相似度 > 0.85 的合并
3. 类型多样性上限 60%
4. 每页分块数量上限

**为什么需要混合**：纯关键词会漏掉概念性匹配——例如"无视常规做法"搜不到标题叫"天才的公交车票理论"的文章，但那篇文章核心正是讲这件事。纯向量在精确短语上表现下降。RRF + 多查询扩展兼顾两者。

### 5. 无服务器起步 → 可扩展迁移

- `gbrain init`：默认使用 PGLite（WASM 运行的嵌入式 Postgres 17.5），含 pgvector、混合搜索和全部 37 个操作，无需 Supabase/Docker/连接字符串
- 规模 > 1,000 文件：`gbrain migrate --to supabase` 一键迁移
- Supabase 免费层（500 MB）不足以容纳大规模知识库；需 Pro（$25/月，8 GB）
- 7,500 页规模参考：总存储约 750 MB（嵌入 134 MB + HNSW 索引 270 MB），初始嵌入成本约 $4–5

### 6. 三种使用路径

| 路径 | 方式 | 适用场景 |
|---|---|---|
| CLI | 全局安装，`gbrain query` | 终端检索笔记 |
| MCP server | stdio 暴露 30 个工具（`get_page`, `put_page`, `search`, `query`, `add_link`, `traverse_graph`, `sync_brain` 等）| 对接 Claude Code、Cursor、Windsurf |
| 远程 MCP | 部署到 Supabase Edge Functions | 从任何设备访问，支持 Claude Desktop、Perplexity、Cowork |

MCP 配置示例：
```json
{
  "mcpServers": {
    "gbrain": {
      "command": "gbrain",
      "args": ["serve"]
    }
  }
}
```

注：ChatGPT 的 OAuth 2.1 支持尚未实现；自托管方案（Tailscale Funnel、ngrok）在文档中有说明。

### 7. 数据接入集成

agent 读取配置文件后自动向用户索取 API 密钥并完成配置：

| 集成 | 用途 |
|---|---|
| Voice-to-Brain | 电话通话转知识库页面（需 Twilio + OpenAI Realtime）|
| Email-to-Brain | Gmail 邮件转实体页面 |
| X-to-Brain | 推文及提及转知识库页面 |
| Calendar-to-Brain | Google 日历转可检索的每日页面 |
| Meeting Sync | Circleback 会议记录转知识库（含参会者）|

### 8. 技能文件（Skill Files）

GBrain 的 agent 行为通过 Markdown 文档定义，而非硬编码进二进制，便于修改和扩展：

| 技能 | 职责 |
|---|---|
| ingest | 导入会议/文档/文章，更新已整理事实，追加时间线，建立交叉引用 |
| query | 三层搜索（关键词 + 向量 + 结构化），带来源引用，不知道的事直接说不知道 |
| maintain | 定期健康检查：发现矛盾内容、过期已整理事实、孤立页面、失效链接 |
| enrich | 从外部 API 补充页面内容 |
| briefing | 每日简报：今日会议参与者背景、活跃交易及截止日期、近期变化 |
| migrate | 从 Obsidian、Notion、Logseq 等迁移 |

## Key Takeaways

- **读-写循环是核心价值**：GBrain 不是静态 RAG，而是"每次对话前读、对话后写"的持续积累循环——Garry 的 agent 在他睡觉时跑"梦境循环"，修复孤立引用、补充缺失实体，他醒来知识库比睡前更完整
- **两段页面结构避免信息腐烂**：每页分隔线上方是"已整理事实"（随新证据整体重写），下方是"时间线"（只追加），使最新理解和历史证据并存、互不干扰
- **RRF 混合检索解决概念-字面 gap**：单纯关键词检索漏掉"天才的公交车票理论"，因为标题里没有"无视常规做法"这几个字；纯向量在精确短语上退化；RRF + Claude Haiku 多查询扩展兼顾两者
- **PGLite 2 秒初始化，无服务器门槛**：`gbrain init` 在本地跑嵌入式 Postgres 17.5（WASM），含 pgvector 和全部 37 个操作，1 分钟内可检索；超过 1,000 文件再用 `gbrain migrate --to supabase` 迁移
- **30 个 MCP 工具直连 Claude Code / Cursor**：`gbrain serve` 通过 stdio 暴露 `get_page`、`put_page`、`traverse_graph` 等工具，LLM 可直接读写知识图谱，无需人工中转
- **技能文件 = agent 的行动手册**：ingest/query/maintain/enrich/briefing/migrate 都是 Markdown 文档，可直接修改 agent 行为，而非重新编译代码
- **规模扩展有定量参考**：7,500 页 ≈ 750 MB（嵌入 134 MB + HNSW 索引 270 MB），初始嵌入 $4–5；Supabase Pro $25/月支撑 8 GB，适合 Garry 级别的 10,000+ 文件规模

## Insights

- **"知识库的复利"比"更好的提示词"更有价值**：Garry 的结论是，agent 每次从零开始和在累积知识基础上工作，差距随时间指数级扩大——这是对"one-shot prompt engineering"范式的直接挑战
- **技能文件架构是一种新的 agent 编程范式**：把 agent 行为写在 Markdown 里（而非硬编码）意味着非工程师也能调整 agent 行为，且可版本控制；这与 GBrain 知识库本身也用 Markdown 存储一脉相承
- **MCP 成为知识图谱的标准接口**：暴露 30 个 MCP 工具让 Claude Code、Cursor、Windsurf 等任意 LLM 工具都能读写同一个知识库，实现跨工具的知识共享，而非每个工具各自维护上下文
- **"梦境循环"暗示 agent 自主维护的方向**：后台定时跑 maintain/enrich 技能，让知识库在用户不在线时自我修复和扩充——这是从"用户驱动更新"到"agent 自驱维护"的范式转变

## Caveats

- 文章为二手报道（微信公众号转述），部分技术细节（如 GPT-5.4 Thinking 的支持情况）需以 GitHub 仓库为准
- 初始嵌入成本 $4–5 基于 OpenAI text-embedding-3-large，若改用其他 embedding 模型成本会有差异
- Supabase 免费层（500 MB）在大规模使用时不足，需升级到 Pro（$25/月）

## Sources

- https://mp.weixin.qq.com/s/XmPq6jrnuJT9w9capyDdIg
- https://github.com/garrytan/gbrain
