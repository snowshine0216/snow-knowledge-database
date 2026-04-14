---
tags: [elk, logstash, elasticsearch, kibana, fluentd, logging, observability, docker, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927496
---

# Log Collection System for AI Services

This lecture covers building a structured log collection system using the ELK stack (Elasticsearch, Logstash, Kibana) and contrasts it with Fluentd as an alternative. It demonstrates how Python applications can ship logs directly over TCP to Logstash, how to set up the full stack with Docker Compose, and how to build Kibana dashboards for visualizing log-level distributions and error trends in AI service production.

## Key Concepts

- **ELK Stack**: Elasticsearch（存储）+ Logstash（采集）+ Kibana（可视化）三件套，同一公司产品，原生兼容
- **Logstash**: 日志采集和转发服务，监听 TCP 端口（5044/5959），将日志转发给 Elasticsearch
- **Elasticsearch**: 分布式搜索引擎，以索引（Index）形式存储日志，支持全文检索
- **Kibana**: Web 可视化界面，通过 Data View 和 Dashboard 展示 Elasticsearch 中的日志数据
- **Fluentd**: 替代方案，基于文件监听的日志采集，配置更简单但不直接支持 Python TCP 推送
- **Data View**: Kibana 中将 Elasticsearch 索引映射为可查询视图的配置
- **P99 延迟**: 99% 请求的响应时间，影响用户体验的核心指标（>500ms 用户可感知卡顿）

## Key Takeaways

- ELK 本质是"把本地日志存到远程搜索引擎 + 可视化"，比商业方案更灵活安全
- Python 标准 logging 库原生支持 Logstash TCP 协议，无需改变打日志习惯
- 日志应同时输出本地终端和远程 Logstash，带序号避免乱序问题
- Docker Compose 统一管理三个组件，Logstash 和 Kibana 均 depends_on Elasticsearch
- Kibana Dashboard 实时刷新，是观察 AI 服务健康状况的重要窗口
- 选择建议：可修改代码 → ELK（直接推送）；只有日志文件 → Fluentd（文件监听）
- 70% 的 AI 服务问题在生产环境中才暴露，日志是还原问题现场的关键

## See Also

- [[079-monitoring-system]]
- [[081-async-core-concepts-1]]
