---
tags: [dify, secondary-development, plugin, mcp, external-knowledge-base, langfuse, nginx, postgresql]
source: https://u.geekbang.org/lesson/818?article=930881
wiki: wiki/courses/ai-engineering-training-camp/module-11-production/099-dify-secondary-development.md
---

# 099: Dify 二次开发实践

**Source:** [5Dify二次开发实践](https://u.geekbang.org/lesson/818?article=930881)

## Outline
- [Overview](#overview)
- [Built-in Extensions First](#built-in-extensions-first)
- [MCP Integration](#mcp-integration)
- [API-Based Invocation](#api-based-invocation)
- [External Knowledge Base](#external-knowledge-base)
- [When Secondary Development Is Needed](#when-secondary-development-is-needed)
- [Dify-Plus Reference Architecture](#dify-plus-reference-architecture)
- [Version Selection and Roadmap](#version-selection-and-roadmap)
- [Source-Code Deployment](#source-code-deployment)
- [Admin Server Architecture](#admin-server-architecture)
- [Plugin Development](#plugin-development)
- [Advanced: Reverse-Calling Dify](#advanced-reverse-calling-dify)
- [Monitoring and Observability](#monitoring-and-observability)
- [Chapter Summary](#chapter-summary)

---

## Overview

开启 Dify 二次开发前的第一个问题：这个需求是否真的需要改代码？很多开发者对 Dify 不够熟悉，只能靠"搞代码"解决，而忽略了 Dify 已经内置的扩展手段。本讲以 `dify.ai` 官方文档为线索，从**使用 → 自托管 → API → 插件**四个维度梳理哪些场景可以不动 Dify 源码，哪些需要真正的二次开发，并以 Dify-Plus 为参考架构拆解二开的典型做法。

---

## Built-in Extensions First

进入 Dify 的二开讨论前，先确认官方文档涵盖的扩展能力是否已足够：

1. **MCP（Model Context Protocol）** — 工作流内工具节点可直连外部 MCP 服务器。
2. **API 调用** — 把 Dify 整体当作黑盒，通过 HTTP API 接入到外部业务前后。
3. **外部知识库** — 用 API endpoint + API Key 接入自建或第三方向量库。
4. **插件** — 扩展模型类型或工具类型，不碰 Dify 核心代码。
5. **知识库管理 API** — 用 API 对知识库、文档、段落、模型、元数据做增删改查。

如果需求落在这五类能力内，就**不需要任何二次开发**。这是本讲第一道分流口。

---

## MCP Integration

MCP 是 Dify 工作流中最简单、管道式的扩展方式，直接映射到工具节点：

- 在"工具"中选择 **MCP**，填入外部 MCP 服务器地址与认证信息。
- 在 Chatflow 的"用户输入 → 大模型"之间插入 MCP 工具节点，完成 OS 认证、工具列表获取、工具调用。
- 插件市场或已有 MCP 服务（例如 `websearch`）可直接引入，Dify 会自动拉工具清单。

判据：**如果新能力可以用"管道"语义描述 — 输入 → 处理 → 输出 — 优先用 MCP，不要动代码。**

---

## API-Based Invocation

当需求是把 Dify 工作流当作服务，插入自己业务的前后，而中间逻辑不需要干扰时，使用 Dify 发布后的 `POST /chat-messages` 或 `POST /chat-flow`：

- 每个发布的 App 会分配唯一的 `conversation_id`，用于路由请求。
- 官方文档的 **Try it** 面板可直接生成 cURL、Python、Java 示例，大模型辅助改写即可。
- 关键参数：`conversation_id`、`user`、`response_mode`（streaming / blocking）。

这种方式下 Dify 对业务是完全黑盒，不涉及源码修改。

---

## External Knowledge Base

Dify 自带知识库在检索质量上受限 — 不支持按句检索或混合检索。好在 Dify 支持**外接知识库**，将检索层完全交给外部实现：

协议要求：
- **POST + HTTP**：外部 API 必须接收 HTTP POST。
- **Authorization 头**：`Authorization: Bearer <api-key>`，作为认证凭据。
- **请求体字段**：`knowledge_id`、`query`、`retrieval_setting`（top_k、score threshold、相关性阈值 0–1）、`metadata_condition`（含逻辑操作符 + 条件列表）。
- **探活机制**：保存外部知识库配置时，Dify 先发一次 ping — 若认证失败返回 `auths_failed`，则配置不被保存。
- **返回格式**：数组，每条含 `metadata`、`score`、`title`、`content`。

有了这套协议，外部 API 服务器只承担两件事：**格式转换** 和 **API Key 认证**。底层用 LlamaIndex、Vanna 还是自研检索，Dify 一概不管。

---

## When Secondary Development Is Needed

只有当需求落在文档和界面外时，才进入真正的二次开发 — 常见于：

- **用户额度管理**（每个用户 / Key 的 Token 消耗、日限额、月限额）
- **多租户管理**（用户间权限隔离、Agent 与知识库的可见范围）

其中**多租户本身是 Dify 商业化版本的付费功能**，不建议在社区版上重造。其余用户管理功能则可以借鉴开源项目 **Dify-Plus** 实现。

---

## Dify-Plus Reference Architecture

Dify-Plus 是开源的企业增强版，对 Dify 社区版做"**增加** 不 **修改**"的二开，从而规避商业授权风险（logo 保留、不加多租户）。它的架构图是最佳二开范本：

```
                ┌─── Web 服务器 (原生 Dify)
NGX ─── 反向代理 ─┤─── API 服务器 (原生 Dify) ─── Worker ─── PostgreSQL / Redis
                └─── /gang/admin → Admin Server (Go) ─── 直读 PostgreSQL
                      └────── Admin Web (前端)
```

核心原则：

- **不改 Dify 核心 API 代码**。增强能力全部做成旁路服务。
- **NGX 反向代理**挂一个新 location：`/gang/admin` → 301 跳转到 `admin/` 子路径，端口 8081 由 Admin Server 监听。
- **Admin Server 直读 PostgreSQL**。如果功能已有 API，就走 API；绝大部分管理功能没有 API，直接写 SQL 读取（通过 GVADB 抽象 ORM 层）。
- **PostgreSQL 仅做微量 schema 增加**，不动原有表结构。
- **前端"挖洞"**：在 Dify 原界面上加一个按钮，URL 后缀 `/gang/admin/dashboard`，点击即跳转到 Admin Web，实现无缝融合。

服务代码分区：
- `service/system/` — 系统级增强（如 PG 初始化脚本）
- `service/gaia/` — 业务级增强（如 `account.go` 中用 `SELECT id, serum FROM account WHERE ...` 做用户聚合、限额统计）

**可以不动 Dify 一行代码就交付一个功能完整的管理后台。**

---

## Version Selection and Roadmap

开始二开前先做两件事，避免无效投入：

1. **对齐 Dify-Plus 的 Dify 版本**。Dify-Plus 的 Release 页显示其基座是 **Dify 1.8.1**。用同一基座可直接复用其补丁与架构经验，不必盲从 Dify 2.0 Beta。
2. **查 Dify Roadmap**。进入 Dify 任意界面右上角都有 Roadmap 入口，功能状态分为 **Complete / In Progress / In Preview / In Plan**。

典型场景：
- 想加 MCP 支持 → 在 Roadmap 看到 **Complete**，直接升级版本即可，无需二开。
- 想加 Human-in-the-Loop → 状态为 **In Progress**，评估自己做是否比官方更快；若很快将发布，等待即可。
- 需求处在 **In Plan** 或更远 → 确认是真正的二开目标。

Dify 从 1.2.0 到 1.8.1、1.8.1 到 1.10.1 的变更日志，是最高效的能力评估来源。

---

## Source-Code Deployment

二开的第一步是搭建可编辑的源码部署环境：

- **OS 选择**：Linux 或 macOS；**不要用 Windows**（需要 WSL，相当于虚拟机，配置困难）。
- 默认的 Docker 部署方式无法热修改容器内代码，不适合二开。
- 按官方 "Local Deployment with Source Code" 文档逐步执行。

部署后的核心后端组件：

| 组件 | 角色 |
|---|---|
| API 服务器 | 前端主要调用对象，就是我们看到的 API 文档的提供方 |
| Worker | 在 API 服务器、PostgreSQL、向量数据库之间做数据同步与通信 |
| PostgreSQL | 原生持久化 |
| Redis | 会话、缓存 |
| 前端 Web | 可有可无 — 二开时通常会替换或跳转到自定义 Admin Web |

二开时只需直接对 API 服务器发请求，完全绕开原生前端。

---

## Admin Server Architecture

以 Dify-Plus 为例剖析 Admin Server 的实现：

1. **入口 NGX 配置**：核心文件是 `docker/nginx/nginx.conf` 与 `docker/nginx/conf.d/*.conf`。原生 config 只有 `/gang/api`、`/gang/file`、`/gang/mcp`；Dify-Plus 加入 `location = /gang/admin { return 301 /admin/; }` 与 `/admin/` 反代到 `:8081`。
2. **镜像拆分**：在原有 NGX / DB / 向量库 / API / Web 之外，额外打两个 Admin 镜像 — `admin-web`（前端）与 `admin-server`（Go 后端）。
3. **数据访问层**：Admin Server 通过 `GVADB` 封装 GORM（对应 Python 侧的 ORM），实现 `SELECT id FROM account` 这类查询，保持与 Dify 原表解耦。
4. **业务代码分区**：
   - `service/system/` — 基础设施（PG 初始化、Redis 连接池）
   - `service/gaia/account.go` — 用户列表、账号 Email、登录验证
   - `service/gaia/dashboard.go` — 仪表盘：对所有账号做费用一次性统计与限额排序
5. **UI 整合**：在原生 Dify Web 的右上角加一个"费用报表"按钮，URL 后缀 `/gang/admin/xxx`；点击后被 NGX 拦截转发，前端由 Admin Web 展示，数据由 Admin Server 直读 PG 返回。

关键认知：**二开对整个 Dify 代码库的实际修改极少，大部分工作量集中在 Admin Server 自身与 NGX 的挖洞。**

---

## Plugin Development

想做"增加一个新能力"这种局部扩展，**写插件往往比改源码简单**。设计者视角复用了大模型 Function Calling 的同一套思路：

**核心三件套**：

1. **Schema（YAML）** — 描述工具元数据
   - 工具唯一名称 / 作者 / 语言
   - 描述：供人查看 + 供模型理解的英文与中文双版本
   - 参数列表：名称、类型、必填 / 可选、默认值

2. **实现类** — 继承 Dify 工具基类（类似 LangChain 的 `Tool`），统一实现 `_invoke` 方法：
   ```python
   class TelegraphTool2(Tool):
       def _invoke(self, user_id, tool_parameters):
           # 与 schema 一一对应的参数
           result = do_work(tool_parameters)
           return result  # 返回类型需与 schema 声明匹配
   ```

3. **Credentials 类**（可选） — 继承抽象基类 `ToolProviderCredentialsValidation`，实现 `_validate_credentials` 方法。防止外人随意调用插件。

**插件开发流程**：

- 从 GitHub 下载 Dify 插件脚手架并初始化
- 按照文档分别开发两类插件：**模型类型**（接入新 LLM）或 **工具类型**（增加新工具）
- 官方示例 `slack-bot` 是入门范本 — 早期版本是微信、钉钉机器人，后来因版权改为 Slack

> 简单能力走 MCP，复杂能力走插件，数据聚合走 Dify-Plus 那一套 Admin Server。**真正需要改 Dify 代码的场景极少。**

---

## Advanced: Reverse-Calling Dify

Dify 插件的进阶特性：插件内部可**反向调用** Dify 的模型、工具、工作流与节点，实现"在工作流里调用自研插件，自研插件再回调 Dify 其他 LLM"的组合。

入口对象：`session.model.*`，基于当前 `conversation_id` 获取上下文。`_invoke` 里的写法不再是处理外部入参，而是：

```python
def _invoke(self, user_id, params):
    llm = session.model.llm
    response = llm.invoke(
        model_config=...,
        prompt=...,
        tools=[...],
        stream=False,
    )
    return response
```

常见组合：插件内反向调用 Dify 的另一个模型做总结，或调用另一个工作流做子任务；然后把结果回传给主工作流。Schema 和 invoke 的配对写法与普通插件一致。

---

## Monitoring and Observability

企业级 Dify 二开经常引入可观测性平台。主流选型三条路：

| 工具 | 开源 / 闭源 | 自托管 | 付费 |
|---|---|---|---|
| **LangFuse** | 开源 | 支持 | 免费版功能稍弱，有付费版 |
| **LangSmith** | 闭源 | 不支持 | 云端，需付费 |
| **Opik** | 开源 | 支持 | 免费 |

Dify 官方文档的 **使用 → 监控** 章节已提供 LangFuse / LangSmith 的内置集成入口。如果内置集成体验不好，可以通过二开把 Dify 的调用事件转发到 Opik 这类第三方，用于分析调用时间、Prompt 命中率、成本等指标。

**实践建议**：监控类需求优先走开源自托管方案（LangFuse / Opik），规避 Dify 原生前端体验问题，同时便于和公司已有监控基础设施对接。

---

## Chapter Summary

判断 Dify 二开路径的决策树：

1. **能用 MCP 吗？** — 管道式输入输出，首选，不改代码。
2. **能用 Dify API 从外部串行调用吗？** — 把 Dify 整体当服务，常见于把 Agent 嵌入业务前后流程。
3. **能用外部知识库 API 吗？** — 检索质量、检索算法自主可控，不动 Dify。
4. **是插件场景吗？** — 新工具 / 新模型，写 schema + `_invoke` + credentials 三件套。
5. **是用户、额度、管理类需求吗？** — 对照 Dify-Plus：NGX 挖洞 + Admin Server 直读 PG + 前端按钮跳转，不改 Dify API 代码。
6. **是监控、费用报表吗？** — 接 LangFuse / Opik，或参考 Dify-Plus 的 Admin Server 做聚合查询。
7. **前 6 种都不覆盖？** — 此时才真正修改 Dify 源码，且优先提 PR 给官方或等待 Roadmap。

所谓"二次开发"的核心哲学是**增加而非修改**：保持 Dify 核心代码不动，用反向代理、旁路服务、插件、API 这四种手段加需求。这种约束既降低了升级成本，也让二开项目免于陷入 Dify 官方的版本演进泥潭。
