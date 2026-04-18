---
tags: [elk, logstash, elasticsearch, kibana, fluentd, logging, observability, docker, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927496
wiki: wiki/concepts/080-log-collection-system.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. ELK 分别代表哪三个组件？请写出全称并简述各自的作用。
2. 为什么企业选择自建日志收集系统（如 ELK），而不是直接使用商业日志服务？
3. 在 Docker Compose 中，Logstash 和 Kibana 都依赖 Elasticsearch——你认为这是为什么？启动顺序错误会发生什么？

---

# 080: Building a Log Collection System

**Source:** [6搭建日志收集系统](https://u.geekbang.org/lesson/818?article=927496)

## Outline
- [Overview: ELK vs Commercial Solutions](#overview-elk-vs-commercial-solutions)
- [ELK Stack Architecture](#elk-stack-architecture)
- [Python Application Log Shipping](#python-application-log-shipping)
- [Logstash Configuration](#logstash-configuration)
- [Docker Compose Setup](#docker-compose-setup)
- [Kibana Dashboard and Discovery](#kibana-dashboard-and-discovery)
- [Fluentd: Alternative Log Collection](#fluentd-alternative-log-collection)
- [Choosing a Log Strategy](#choosing-a-log-strategy)

---

## Overview: ELK vs Commercial Solutions

与监控系统类似，日志收集也有两种主要路线：
- **商业方案（如 Logsmith）**：功能完善但需要付费、涉及数据上传
- **自建 ELK 技术栈**：开源免费，本质上是"把日志存到远程搜索引擎 + 可视化"

ELK 是一套成熟的技术方案，在业界被广泛使用。

---

## ELK Stack Architecture

ELK 三个字母分别代表：

| 字母 | 组件 | 端口 | 作用 |
|------|------|------|------|
| **E** | Elasticsearch | 9200 | 分布式搜索存储引擎，接收和存储日志索引 |
| **L** | Logstash | 5044 / 5959 | 日志采集器，接收应用日志并转发给 ES |
| **K** | Kibana | 5601 | 可视化界面，查询和展示日志数据 |

数据流向：`应用程序 → Logstash(5044) → Elasticsearch(9200) → Kibana(5601) 展示`

这三个组件属于同一家公司的产品线，原生兼容，开箱即用。

---

## Python Application Log Shipping

Python 标准日志库原生支持 Logstash 协议，通过 TCP 将日志推送到 Logstash：

```python
import logging
import socket
import json

# 建立 TCP 连接到 Logstash
# 连接 localhost:5044

# 日志发送逻辑示意
def send_log(level, message):
    log_entry = {
        "level": level,
        "message": message,
        "timestamp": "..."
    }
    # 通过 TCP socket 发送 JSON 格式日志
    # 重试三次以应对网络抖动

# 日志级别：INFO, WARNING, ERROR, CRITICAL
# 每条日志带有序号，便于排查乱序问题
```

关键点：
- 日志**同时**输出到本地终端和 TCP 端口（5044）
- 使用标准 JSON 格式发送
- 连接失败时进行重试（最多 3 次），避免网络抖动丢日志
- 为每条日志分配序号，方便验证日志顺序

---

## Logstash Configuration

Logstash 配置文件支持两种日志格式，监听两个端口：

```yaml
# logstash.conf 示意
input {
  tcp {
    port => 5044
    codec => json_lines  # 单行 JSON
  }
  tcp {
    port => 5959
    codec => json_multiline  # 多行 JSON
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "elk-%{+YYYY.MM.dd}"
  }
}
```

---

## Docker Compose Setup

三个组件统一用 Docker Compose 管理：

```yaml
version: '3'
services:
  elasticsearch:
    image: elasticsearch:8.x
    environment:
      - xpack.security.enabled=false  # 关闭安全认证（开发环境）
    ports:
      - "9200:9200"

  logstash:
    image: logstash:8.x
    volumes:
      - ./logstash.conf:/etc/logstash/conf.d/logstash.conf
    ports:
      - "5044:5044"
      - "5959:5959"
    depends_on:
      - elasticsearch

  kibana:
    image: kibana:8.x
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

注意事项：
- 把本地 Logstash 配置文件挂载到容器内
- Logstash 和 Kibana 都依赖 Elasticsearch 先启动
- 关闭 xpack 安全认证方便开发环境调试

---

## Kibana Dashboard and Discovery

Kibana 无需额外配置即可自动读取 Elasticsearch 数据。

**创建数据视图（Data View）**：
1. 进入 Kibana 管理界面 → 索引管理
2. 新建 Data View，起名如 `demo3`
3. 设置索引匹配模式，如 `elk-*`
4. 时间字段选择：若日志时间戳格式标准（如 ISO8601），选 `@timestamp`；否则选"不使用时间过滤"

**创建 Dashboard 可视化**：
- 支持柱状图、折线图、区域图等多种图形类型
- 可拖拽字段到 X/Y 轴进行聚合
- 典型展示：不同 `level`（INFO/ERROR/WARNING/CRITICAL）的日志数量随时间分布
- Dashboard 实时刷新，数据来自 Elasticsearch 的动态索引

**常见分析维度**：
- 不同日志级别的数量统计
- 某时段内错误和警告的爆发情况
- 特定关键词的 TOP N 分布

---

## Fluentd: Alternative Log Collection

Fluentd 是另一种日志采集方案，与 ELK 有不同的定位：

| 对比维度 | Logstash（ELK）| Fluentd |
|---------|--------------|---------|
| 采集方式 | 应用直接推送到 TCP 端口 | 基于文件监听，通过插件采集 |
| Python 集成 | 原生支持，代码嵌入 | 不直接支持 TCP 推送，需先写日志文件 |
| 配置复杂度 | 三组件需分别配置 | 单个工具，配置更简单 |
| 日志格式 | 支持 TCP/JSON 直推 | 推荐 syslog 或文件方式采集 |
| 存储目标 | Elasticsearch | Elasticsearch / 关系型数据库等 |

---

## Choosing a Log Strategy

根据日志产生方式选择技术方案：

**方案一：直接推送（ELK + Logstash TCP）**
- 适用场景：应用代码可修改，日志直接通过网络推送
- 特点：Python 日志库直接嵌入 Logstash handler，实时性好
- 典型场景：AI 服务、FastAPI 应用

**方案二：文件采集（Fluentd）**
- 适用场景：已有日志文件，不便修改应用代码
- 特点：通过插件监控日志文件变化，二次采集
- 典型场景：传统应用、第三方服务

**生产交付建议**：
- 监控 + 日志 + 容器化（Docker/K8s）是交付 AI 服务的标配三件套
- 70% 的问题在生产环境中才会暴露，监控和日志是还原问题现场的关键
- K8s 部署时建议采用灰度发布：先放 10%，无问题再逐步 30% → 50% → 全量

---

## Connections
- → [[079-monitoring-system]]
- → [[081-async-core-concepts-1]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话描述 ELK 的完整数据流——一条 Python 应用日志从产生到出现在 Kibana 图表上，经过了哪些组件、哪些端口？
2. Python 应用向 Logstash 推送日志时，为什么要加"重试三次"和"序号"两个机制？去掉其中一个会有什么后果？
3. 什么情况下应该选 Fluentd 而不是 Logstash？请用一个具体场景说明两者的核心区别。

<details>
<summary>答案指南</summary>

1. 日志从 Python 应用通过 TCP Socket 以 JSON 格式推送到 Logstash（端口 5044），Logstash 将其转发到 Elasticsearch（端口 9200）建立索引（如 `elk-YYYY.MM.dd`），Kibana（端口 5601）再从 Elasticsearch 读取数据并渲染为可视化图表。
2. 重试三次是为了应对网络抖动导致的连接失败，防止日志丢失；序号是为了验证日志是否乱序或缺失，方便问题排查。缺少重试会丢日志，缺少序号则难以发现日志顺序错乱的问题。
3. 当应用代码不可修改、只能通过已有日志文件进行采集时，选 Fluentd——它通过插件监听文件变化进行二次采集；而 Logstash 适合可在代码中嵌入 handler、能主动将日志推送到 TCP 端口的场景（如 FastAPI/AI 服务）。

</details>
