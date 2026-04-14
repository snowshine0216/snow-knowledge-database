---
tags: [multi-tenancy, customer-service, ai-agent, rag, mcp, performance-testing, deployment, feishu, langgraph]
source: https://u.geekbang.org/lesson/818?article=930875
wiki: wiki/concepts/094-core-interaction-capabilities-3.md
---

# 094: Supplementing Core Interaction Capabilities Part 3

**Source:** [6补充核心交互能力3](https://u.geekbang.org/lesson/818?article=930875)

## Outline
- [Multi-Tenancy Architecture](#multi-tenancy-architecture)
- [True vs Pseudo Isolation](#true-vs-pseudo-isolation)
- [Tenant-Aware Knowledge and Order Queries](#tenant-aware-knowledge-and-order-queries)
- [Web and Mobile Frontend Development](#web-and-mobile-frontend-development)
- [Chrome MCP Server for AI-Assisted Frontend Dev](#chrome-mcp-server-for-ai-assisted-frontend-dev)
- [Unimplemented Features Left as Exercises](#unimplemented-features-left-as-exercises)
- [Documentation and Delivery Artifacts](#documentation-and-delivery-artifacts)
- [Performance Testing and Bottleneck Analysis](#performance-testing-and-bottleneck-analysis)
- [Third-Party Channel Integration (Feishu, DingTalk)](#third-party-channel-integration-feishu-dingtalk)
- [AI Landscape Trends and Closing Thoughts](#ai-landscape-trends-and-closing-thoughts)

---

## Multi-Tenancy Architecture

多租户（Multi-Tenancy）实现思路：

- 不同租户请求不同的知识库（Face Index）和不同的数据库（Database）
- 在前端请求时通过 `Tenant-ID` 请求头（Header）来区分租户
- 推送到远程仓库后，按 `tenant/t1/`, `tenant/t2/` 等目录结构管理租户数据

```
tenant/
  t1/
    db/       ← PostgreSQL 独立 database
    face_index/  ← 向量数据库独立 index
  t2/
    db/
    face_index/
```

---

## True vs Pseudo Isolation

两种隔离方式对比：

| 方式 | 数据库 | 向量库 | 安全性 | 成本 |
|------|--------|--------|--------|------|
| **真隔离**（真多租户） | 不同的 database（逻辑或物理隔离） | 不同的 Face Index | 高 | 高 |
| **假隔离**（伪多租户） | 同一张表加 `tenant_id` 字段 | metadata 中加 `tenant_id`，检索后过滤 | 中 | 低 |

- 真隔离适合给不同公司提供产品（如 Dify、Coze 的企业级方案）
- 假隔离适合内部项目或偷懒场景
- 前后端通过公私钥加密确保数据安全

---

## Tenant-Aware Knowledge and Order Queries

实现租户感知的请求流程：

1. 前端请求时在 Header 中携带 `Tenant-ID`
2. 后端判断是否存在 `Tenant-ID`：
   - 无 → 走 Default 知识库
   - 有 → 根据 Tenant-ID 确定对应目录路径
3. 知识库查询路径变为 `tenant/{id}/face_index`
4. 数据库查询连接对应的 `tenant/{id}/db`
5. Query 结合历史 + Tenant ID 一起送入检索流程

```python
# 伪代码：假隔离的向量检索过滤
results = vector_store.query(query, k=5)
filtered = [r for r in results if r.metadata["tenant_id"] == request_tenant_id]
```

---

## Web and Mobile Frontend Development

前端开发策略：

- **Web 前端**：放在 `frontend/` 目录，基于 Google 外部设施的模板实现
  - 功能：智能对话、知识库管理、订单查询、租户管理
  - 运行：`npm install && npm run dev`，端口 5173
- **移动端**：放在 `mobile/` 目录，参考 frontend 实现
  - 运行：`npm run web`
  - 跨域问题通过本地代理（proxy）解决，301 端口转发到 8000 端口后端

---

## Chrome MCP Server for AI-Assisted Frontend Dev

用大模型辅助开发前端的"偷懒"方法：

**步骤一**：从 GitHub 下载 Chrome MCP Server 扩展并解压

**步骤二**：在 Chrome → 扩展管理 → 加载未打包的扩展，安装扩展程序

**步骤三**：在 Claude / Cursor 的 MCP 设置中添加：
```json
{
  "mcpServers": {
    "chrome": {
      "url": "127.0.0.1:12306-mcp"
    }
  }
}
```

效果：大模型可以直接读取浏览器页面的 HTML、控制台错误、样式信息，无需开发者手动 F12 调试。这项能力会持续普及，显著降低前端开发门槛。

---

## Unimplemented Features Left as Exercises

以下功能尚未在前端实现，留给学员练习：

1. **推送建议**（Proactive Suggestions）：在前端添加主动推送的消息建议
2. **快捷指令**（Quick Commands）：在对话框打开时展示常用指令按钮
3. **开场白**（Welcome Message）：对话初始化时的问候语

建议：使用大模型直接在前端代码上补充这三个功能。

---

## Documentation and Delivery Artifacts

项目交付所需文档（建议用大模型生成初稿，人工审查）：

| 文档 | 内容 |
|------|------|
| **架构设计文档** | 系统架构图（使用 mermaid.live 画流程图）、技术选型、设计原则 |
| **部署说明文档** | 环境配置、启动步骤、Docker 使用说明 |
| **API 文档** | 接口列表、参数说明、请求示例 |
| **性能测试报告** | 由第三方测试团队生成，含容量规划、负载规划、瓶颈分析 |

大模型使用建议：
- 有代码兜底时：让大模型参考代码生成文档，人工再修改
- 无代码兜底时：人工先写，再让大模型润色
- "掐住两头"原则：固定输入（函数签名）和输出（格式），让大模型填充中间部分

---

## Performance Testing and Bottleneck Analysis

压测方法与瓶颈处理：

- 工具：Locust 进行 HTTP 负载测试
- 入口：以 FastAPI 接口作为压测入口
- 指标：整体延迟 + 错误率

瓶颈类型与解决方案：

| 瓶颈 | 原因 | 解决方案 |
|------|------|----------|
| CPU 瓶颈 | FastAPI 并发不足 | 前置 Nginx 做负载均衡，分发到多个 FastAPI 实例 |
| 网络瓶颈 | 调用在线大模型延迟 | 评估 API 调用链路 |
| GPU 瓶颈 | 本地大模型 | 扩容 GPU 资源 |

AI 专项测试：
- 召回率（Recall）测试：核心路径先跑通，再逐步扩展场景
- 准确率（Precision）测试：选5-6个核心场景作为验收依据
- 推荐使用 RAG 透明的方式交付，便于针对性优化

QPS 理解差异：
- 客户理解的 QPS = 并发客服人数（如20人）
- 实际 QPS = 真实终端用户咨询量（受促销活动影响波动较大）

---

## Third-Party Channel Integration (Feishu, DingTalk)

使用 `wechat-chatgpt` / `微差` 等开源中转工具接入第三方渠道：

**安装步骤**：
```bash
git clone <wechat-chatgpt repo>
pip install -r requirements.txt
pip install -r requirements-optional.txt  # 支持飞书/钉钉等
cp config-template.json config.json
```

**config.json 关键配置**：
```json
{
  "model": "gpt-4o-mini",
  "api_key": "your-key",
  "base_url": "your-base-url",
  "proxy": "your-proxy",
  "channel_type": "feishu"
}
```

**接入自己的智能客服系统**：
1. 在 config.py 中找到飞书/钉钉配置，填写 App ID、Token、Bot Name
2. 将请求地址从 GPT 官方改为自己的 edu-agent 服务地址
3. 中转程序按 OpenAI 格式转发请求，接收响应后返回给飞书

支持渠道：飞书、钉钉、企业微信、个人微信公众号

注意：需要公网域名 + 公网 IP 才能运行（本地无法测试 Webhook 回调）

---

## AI Landscape Trends and Closing Thoughts

技术演进趋势展望：

- **当前**：RAG 知识库已从主流方案变成 Agent 工具链中的一个工具
- **近期**：提示词（Prompt）将成为可复用技能（Skill）
- **未来**：提示词 + 工具 + 技能 → 合并为统一的上下文能力层

国产化合规建议（快速通过安全审查）：
1. **工具国产化**：Redis → 国产替代，PostgreSQL → 国产替代
2. **模型本地化**：使用千问开源版 或 DeepSeek-70B
3. **硬件国产化**：使用国产 GPU 部署
4. **数据不出境**：本地部署确保数据安全

项目总结：
- 所有功能（知识库、订单、租户、多渠道）是课程各阶段的整合
- 工作中酌情选用，不需要全部功能都用上
- 合理的工作流：意图识别 → 路由分发（知识库/订单/人工） → handoff 兜底

---

## Connections
- → [[093-core-interaction-capabilities-2]]
- → [[095-project-delivery-and-review]]
