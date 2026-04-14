---
tags: [kubernetes, k8s, deployment, pod, service, hpa, canary, rolling-update, minikube, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927494
---

# Kubernetes Orchestration Basics for AI Deployments

Introduction to K8s concepts from an AI developer's perspective — covering Pod, Deployment, Service, HPA, rolling updates, and canary releases for maintaining high-availability AI services.

## Key Concepts

- **Pod**: K8s 最小调度单元；比 Docker 容器略大，包含容器 + 网络命名空间 + 存储卷
- **Deployment**: 声明式管理 Pod 副本数量，自动维持期望副本数（某个 Pod 崩溃 → 自动重建），同时管理镜像版本
- **Service**: 为 Pod 组提供稳定的网络入口，屏蔽 Pod 动态调整带来的 IP 变化；支持 ClusterIP（内部）和 NodePort（外部）
- **Minikube**: 单节点 K8s 本地开发环境；AI 开发者在本机完成单节点验证，再交给 SRE 做多节点生产部署
- **Secret**: 存储 API Key 等敏感信息（base64 编码，非加密）；通过 `secretKeyRef` 注入到 Pod 环境变量
- **HPA（水平自动扩缩容）**: 根据 CPU/内存利用率自动调整 Pod 副本数（minReplicas～maxReplicas）；扩容有延迟，活动前需手动预热
- **滚动更新 (RollingUpdate)**: 逐批替换旧 Pod，保证服务不中断；可设置 `maxUnavailable`（最多不可用 Pod 数）和 `maxSurge`（最多额外 Pod 数）
- **蓝绿部署**: 准备两套完整服务，一次性切换流量；优点是旧版保留可回滚，缺点是需要 2 倍资源
- **金丝雀发布（灰度）**: 先引入少量流量（如 10%）到新版本，验证无问题后逐步扩大；名称来源于矿场用金丝雀检测毒气
- **Istio**: 服务网格工具，可实现精确的流量权重控制（90% stable + 10% canary）

## Key Takeaways

- AI 开发工程师的 K8s 职责：编写 Deployment/Service/Secret YAML，理解业务对配置的影响，其余交给 SRE
- `replicas: 3` + Deployment 是保证高可用的最简单配置
- base64 不是加密，只是编码格式变换；生产环境用 K8s Vault 管理密钥
- 三种发布策略的资源成本：滚动更新 < 金丝雀 < 蓝绿（蓝绿需要 2 倍资源）
- `kubectl rollout undo` 可一键回滚到上一个版本

## See Also

- [[077-fastapi-model-service]]
