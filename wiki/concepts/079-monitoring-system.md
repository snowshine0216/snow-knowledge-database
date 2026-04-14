---
tags: [prometheus, grafana, monitoring, observability, ollama, docker, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927495
---

# Monitoring System for AI Services

This lecture covers building a self-hosted monitoring system for AI inference services using the Prometheus + Grafana stack, with Ollama as the target service. It explains the three-component architecture (Exporter → Prometheus → Grafana), Docker networking pitfalls when running exporters in containers, and production monitoring metrics for AI service delivery.

## Key Concepts

- **Prometheus**: 开源监控框架，通过拉取（pull）模式采集 Exporter 暴露的 metrics 数据并存储
- **Exporter**: 采集特定服务运行状态的插件/脚本，将数据格式化为 Prometheus 格式并暴露 HTTP 端点
- **Grafana**: 可视化展示层，从 Prometheus 读取数据渲染为 Dashboard 图表
- **Ollama Exporter**: 基于 FastAPI 开发的 Python 服务，采集 Ollama 实例运行状态（CPU、token 速率等）
- **host.docker.internal**: 容器访问宿主机的特殊域名（区别于 `127.0.0.1` 会指向容器自身）
- **Dashboard JSON**: Grafana 官方提供的仪表盘配置文件，可一键导入预设监控视图

## Key Takeaways

- 生产环境不使用商业监控（安全 + 成本），选择 Prometheus 自建
- 监控三件套：Exporter 采集 → Prometheus 存储 → Grafana 展示
- 容器内的 Exporter 访问宿主机 Ollama 时，必须用 `host.docker.internal` 而非 `127.0.0.1`
- 几乎所有主流 AI 推理服务（vLLM、SGLang）都有开源 Exporter
- AI 服务交付的标配：容器化（Docker/K8s）+ 监控（Prometheus/Grafana）+ 日志（ELK）
- K8s 生产发布建议灰度：10% → 30% → 50% → 100%，利用滚动更新能力

## See Also

- [[080-log-collection-system]]
- [[067-agent-observability]]
