---
tags: [prometheus, grafana, monitoring, observability, ollama, docker, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927495
wiki: wiki/concepts/079-monitoring-system.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 你认为 Prometheus 相比商业监控方案（如 Loki 系列）有哪些主要优势？
2. 在 Docker 容器内部，如果想访问宿主机上运行的服务，应该使用什么地址？`127.0.0.1` 还是其他地址？
3. Grafana、Prometheus、Exporter 三个组件各自承担什么职责？它们之间的数据流向是怎样的？

---

# 079: Building a Monitoring System for AI Services

**Source:** [5搭建监控系统](https://u.geekbang.org/lesson/818?article=927495)

## Outline
- [Why Prometheus Over Commercial Solutions](#why-prometheus-over-commercial-solutions)
- [Monitoring Architecture Overview](#monitoring-architecture-overview)
- [Ollama Exporter Deep Dive](#ollama-exporter-deep-dive)
- [Docker Networking for Exporter](#docker-networking-for-exporter)
- [Prometheus Configuration](#prometheus-configuration)
- [Grafana Dashboard Setup](#grafana-dashboard-setup)
- [Production Monitoring Considerations](#production-monitoring-considerations)

---

## Why Prometheus Over Commercial Solutions

在构建 AI 服务监控系统时，有两种主要选择：
- **商业方案（如 Logsmith/Loki 系列）**：需要把数据上传到外部网络，配置繁琐，数据量大时需要付费，且存在安全隐患
- **自建 Prometheus**：开源免费，数据留在本地，被几乎所有容器和框架原生支持，生态丰富

在工程实践中，生产环境更多采用 Prometheus 自建方案。

---

## Monitoring Architecture Overview

监控系统由三个核心组件构成：

| 组件 | 作用 |
|------|------|
| **Ollama Exporter** | 采集 Ollama 运行状态，暴露 metrics 端点 |
| **Prometheus** | 监控框架，定期拉取 Exporter 数据并存储 |
| **Grafana** | 可视化展示层，渲染 Dashboard |

数据流向：`Ollama 实例 → Exporter 采集 → Prometheus 存储 → Grafana 展示`

Prometheus 本身是一个监控框架，通过各种 **Exporter 插件**对目标进行采集：
- 监控 Ollama → 使用 `ollama-exporter`
- 监控 vLLM / SGLang → 使用对应的开源 Exporter
- 几乎所有流行服务都有开源 Exporter 可直接使用

---

## Ollama Exporter Deep Dive

Ollama Exporter 是用 **FastAPI** 编写的 Python 服务，核心逻辑：

1. 连接 Ollama 实例（默认端口 `11434`）
2. 定义需要采集的变量（metrics 指标）
3. 请求 Ollama 的指定状态 URL
4. 将采集结果通过 `/metrics` 端点对外暴露（端口 `8000`）

```python
# Exporter 核心逻辑（概念示意）
# 1. 指定 Ollama 主机和端口
OLLAMA_HOST = "host.docker.internal"  # 从容器访问宿主机
OLLAMA_PORT = 11434

# 2. 定义 metrics 变量
# 3. 定期请求 Ollama 状态，写入 Prometheus 格式
# 4. 通过 /metrics 端点暴露，FastAPI 发布
```

可以通过访问 `http://localhost:8000/metrics` 实时查看采集结果，监控 CPU 占用率等指标随模型推理负载的变化。

---

## Docker Networking for Exporter

这是实际部署时最容易踩坑的地方。Docker 网络有三种访问方向：

| 方向 | 地址 | 说明 |
|------|------|------|
| 容器 → 容器 | `127.0.0.1` | 同一桥接网络，直接互通 |
| 宿主机 → 容器 | `127.0.0.1` | 宿主机可通过本地地址访问容器端口 |
| **容器 → 宿主机** | `host.docker.internal` | 不能用 `127.0.0.1`，会找到容器自身 |

**本课场景**：Ollama 运行在 Windows 宿主机，Exporter 运行在 Docker 容器内。属于"容器 → 宿主机"方向，因此必须使用 `host.docker.internal` 而非 `127.0.0.1`。

```bash
# 运行 Exporter 容器时正确设置
docker run -e OLLAMA_HOST=host.docker.internal ollama-exporter
```

---

## Prometheus Configuration

修改 `prometheus.yaml` 配置文件，添加 Ollama Exporter 的抓取目标：

```yaml
# prometheus.yaml 关键片段
scrape_configs:
  - job_name: 'ollama'
    static_configs:
      - targets: ['localhost:18000']  # Ollama Exporter 端口
```

当 Prometheus 和 Ollama Exporter 都在同一 Docker 环境时，使用 `localhost` 即可互通。

构建流程：
1. 构建 ollama-exporter 镜像
2. 启动 ollama-exporter 容器
3. 修改 `prometheus.yaml` 添加抓取配置
4. 启动 Prometheus 容器
5. 启动 Grafana 容器（无需额外配置，默认连接本机 Prometheus）

---

## Grafana Dashboard Setup

Grafana 开箱即用，默认连接本机 Prometheus 数据源。

**导入官方 Dashboard**：
1. 在右上角点击"导入 Dashboard"
2. 上传官方提供的 `dashboard.json`
3. 即可看到 Ollama 运行状态的可视化面板

Dashboard 可展示内容：
- 容器运行状态
- Ollama metrics（token 生成速率、请求数等）
- CPU / GPU 占用率（需额外配置性能采集）

可设置每 5 秒自动刷新，实时观察负载变化。若需要压测，可在多个终端同时发送请求来模拟并发场景。

---

## Production Monitoring Considerations

在工程交付实践中，监控系统通常需要覆盖以下指标：

**性能指标**：
- 每分钟 token 处理次数（吞吐量）
- 并发请求数
- CPU / 内存 / GPU 使用率

**业务指标**：
- 不同业务接口的调用次数
- 请求路径是否经过 RAG / 知识图谱
- 内部错误报警

**常见问题排查**：
- 效果下降 → 检查 GPU 是否不足（推理能力下降）
- 效果不好 → 检查请求是否绕过了 RAG 直接打到大模型
- 客户反馈与实际情况不符 → 通过监控还原操作现场

对于生产环境，vLLM 和 SGLang 使用更广泛（标准 OpenAI 兼容接口），Ollama 更适合本地开发测试（接口非标准）。

---

## Connections
- → [[078-kubernetes-orchestration-basics]]
- → [[080-log-collection-system]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释：为什么在本课场景中，Ollama Exporter 必须用 `host.docker.internal` 而不能用 `127.0.0.1` 连接 Ollama？
2. 描述这套监控系统的完整搭建流程（从构建镜像到看到 Dashboard），以及各步骤的顺序依赖关系。
3. 在生产环境中，监控系统如何帮助排查"模型效果下降"和"客户反馈与实际不符"这两类问题？具体看哪些指标？

> [!example]- Answer Guide
> 
> #### Q1 — 容器访问宿主机网络
> 
> Ollama 运行在 Windows 宿主机，Exporter 运行在 Docker 容器内，属于"容器 → 宿主机"访问方向。在这个方向下，`127.0.0.1` 会指向容器自身而非宿主机，必须使用 `host.docker.internal` 才能正确访问宿主机上的 Ollama（默认端口 11434）。
> 
> #### Q2 — 监控系统完整搭建流程
> 
> 流程依次为：构建 ollama-exporter 镜像 → 启动 exporter 容器 → 修改 `prometheus.yaml` 添加抓取配置（targets 指向 exporter 端口）→ 启动 Prometheus 容器 → 启动 Grafana 容器；Grafana 默认连接本机 Prometheus，无需额外配置，最后导入 `dashboard.json` 即可可视化。
> 
> #### Q3 — 生产环境排查指标定位
> 
> 效果下降时检查 GPU 使用率是否不足（推理能力下降）；客户反馈与实际不符时，通过监控查看请求路径——确认请求是否绕过了 RAG/知识图谱直接打到大模型，从而还原操作现场定位根因。
