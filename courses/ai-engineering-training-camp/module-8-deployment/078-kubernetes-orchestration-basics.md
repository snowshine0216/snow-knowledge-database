---
tags: [kubernetes, k8s, deployment, pod, service, hpa, canary, rolling-update, minikube, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927494
wiki: wiki/concepts/078-kubernetes-orchestration-basics.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. Kubernetes 中的 Pod 和 Docker 容器有什么区别？Pod 是 K8s 的最小调度单元，它比单个容器多了哪些东西？
2. HPA（Horizontal Pod Autoscaler）是做什么用的？你认为它会根据哪些指标来自动扩缩容？
3. 金丝雀发布（Canary Release）和滚动更新（Rolling Update）有什么不同？各自适合什么场景？

---

# 078: Kubernetes Orchestration Basics for AI Deployments

**Source:** [4熟悉 Kubernetes 编排基础](https://u.geekbang.org/lesson/818?article=927494)

## Outline
- [AI Engineer's Scope for K8s](#ai-engineers-scope-for-k8s)
- [K8s vs Ray — Two Extension Paths](#k8s-vs-ray--two-extension-paths)
- [Core K8s Concepts: Pod, Deployment, Service](#core-k8s-concepts-pod-deployment-service)
- [Local Development with Minikube](#local-development-with-minikube)
- [Deploying a FastAPI Service on K8s](#deploying-a-fastapi-service-on-k8s)
- [Secret Management — API Keys](#secret-management--api-keys)
- [HPA — Horizontal Pod Autoscaler](#hpa--horizontal-pod-autoscaler)
- [Rolling Updates and Rollback](#rolling-updates-and-rollback)
- [Canary Release and Istio Traffic Control](#canary-release-and-istio-traffic-control)
- [Connections](#connections)

---

## AI Engineer's Scope for K8s

学习 K8s 的目标定位（对 AI 开发工程师）：
- **不需要**：从零搭建 K8s 集群（需要大量 Linux/网络知识）
- **不需要**：K8s 底层细节配置（交给 SRE/DevOps）
- **需要**：了解 K8s 能提供哪些业务能力
- **需要**：能把业务打包成 Pod，理解打包对业务的影响
- **需要**：能编写 Deployment/Service/Secret 配置文件，交给运维执行

K8s 对 AI 开发的核心价值：
1. **高可用**：自动维持副本数量，容器崩溃自动重启
2. **版本管理**：支持声明式更新，镜像版本可控
3. **滚动更新**：零停机发布新版本
4. **资源编排**：灵活调度 GPU/CPU/内存资源

---

## K8s vs Ray — Two Extension Paths

从 Docker 容器出发的两个扩展方向：

```
[Docker 容器]
    ↓ 路径一            ↓ 路径二
[Kubernetes (K8s)]    [Ray（任务并发框架）]
   重在资源调配         重在任务并发语义
   容器编排和管理       天然支持 parallel=5 等并发原语
   底层基础设施         应用层抽象
```

**KubeRay**：用 Ray 管理 Kubernetes，结合两者优势，是 AI 工作负载的推荐方案。

---

## Core K8s Concepts: Pod, Deployment, Service

### Pod

K8s 的最小调度单元（比 Docker 容器略大）：

| 组件 | 说明 |
|------|------|
| Container | 实际运行程序的 Docker 容器 |
| Network Namespace | Pod 独立的网络命名空间 |
| Storage Volume | Pod 挂载的存储卷 |

类比：Docker 容器是一个进程，Pod 是进程 + 网络 + 存储的组合单元。

### Deployment

管理 Pod 副本数量的控制器，实现**声明式管理**：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lanchain-deployment
spec:
  replicas: 3          # 期望副本数
  selector:
    matchLabels:
      app: lanchain-service
  template:
    spec:
      containers:
      - name: lanchain
        image: lanchain-service:v1
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "1"
            memory: "1Gi"
```

Deployment 的作用：
- 维持 Pod 副本数量（某个 Pod 崩溃 → 自动重新创建）
- 管理镜像版本（版本升级 / 回滚）
- 支持滚动更新策略

### Service

为 Pod 组提供稳定的网络访问入口（屏蔽 Pod 动态调整带来的 IP 变化）：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: lanchain-service
spec:
  selector:
    app: lanchain-service
  ports:
  - port: 80          # 外部访问端口
    targetPort: 8000   # Pod 内部端口
  type: ClusterIP
```

用户请求 Service 的 80 端口 → K8s 负载均衡 → 路由到三个副本中的 8000 端口（可配置轮询或最近优先）。

---

## Local Development with Minikube

Minikube 是单节点 K8s 环境，适合本地开发和测试：

```bash
# 安装（以 Windows 为例）
# 下载 minikube.exe 放到 C:\minikube\
# 添加到 PATH 环境变量

# 启动（使用阿里云镜像，解决国内访问限制）
minikube start --image-mirror-country=cn \
               --registry-mirror=https://registry.cn-hangzhou.aliyuncs.com

# 查看状态
minikube status

# 切换到 Minikube 的 Docker 环境
eval $(minikube docker-env)

# 停止
minikube stop
```

注意：Minikube 有自己独立的 Docker daemon，需要切换环境才能让 K8s 使用本地构建的镜像：
```bash
# Windows PowerShell
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

---

## Deploying a FastAPI Service on K8s

完整的 7 步部署流程：

```bash
# Step 1: 切换到 Minikube Docker 环境
eval $(minikube docker-env)

# Step 2: 构建 Docker 镜像
docker build -t lanchain-service:v1 .

# Step 3: 创建 Secret（存储 API Key）
kubectl apply -f secret.yaml

# Step 4: 创建 Deployment
kubectl apply -f deployment.yaml

# Step 5: 创建 Service
kubectl apply -f service.yaml

# Step 6: 查看 Pod 状态
kubectl get pods
# NAME                                  READY   STATUS    RESTARTS   AGE
# lanchain-deployment-xxx-yyy           1/1     Running   0          30s  (×3)

# Step 7: 访问服务
minikube service lanchain-service --url
# 返回可访问的本机 URL，如 http://127.0.0.1:32144
```

---

## Secret Management — API Keys

不应将 API Key 明文写在 Deployment YAML 中，使用 K8s Secret 管理：

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: lanchain-secrets
type: Opaque
data:
  DASHSCOPE_API_KEY: <base64-encoded-api-key>
```

base64 编码：
```bash
echo -n "sk-xxxxxxxxxxxx" | base64
# 输出：c2steHh4eHh4eHh4eHh4
```

注意：base64 **不是加密算法**，只是编码格式变换，可以轻松还原。生产环境应使用 K8s Vault 或云厂商密钥管理服务。

在 Deployment 中引用 Secret：
```yaml
env:
- name: DASHSCOPE_API_KEY
  valueFrom:
    secretKeyRef:
      name: lanchain-secrets
      key: DASHSCOPE_API_KEY
```

---

## HPA — Horizontal Pod Autoscaler

HPA 根据 CPU / 内存 / 自定义指标自动扩缩容：

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: lanchain-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: lanchain-deployment
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60   # 扩容观察窗口
    scaleDown:
      stabilizationWindowSeconds: 300  # 缩容观察窗口
```

```bash
# 应用 HPA
kubectl apply -f hpa.yaml

# 查看 HPA 状态
kubectl get hpa
# NAME            REFERENCE                     TARGETS       MINPODS   MAXPODS   REPLICAS
# lanchain-hpa    Deployment/lanchain-service   45%/70%       1         10        3
```

注意事项：
- 扩容有延迟，建议在大流量活动前**预热**（手动提前扩容）
- 缩容观察窗口应比扩容更长，避免抖动

---

## Rolling Updates and Rollback

滚动更新（零停机发布）配置：

```yaml
# deployment.yaml（新增 strategy 字段）
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1    # 最多允许 1 个 Pod 不可用
      maxSurge: 1          # 最多额外创建 1 个 Pod
  template:
    spec:
      containers:
      - name: lanchain
        image: lanchain-service:v3   # 从 v1 改为 v3 触发更新
```

```bash
# 应用更新
kubectl apply -f deployment.yaml

# 查看更新状态
kubectl rollout status deployment/lanchain-deployment

# 查看更新历史
kubectl rollout history deployment/lanchain-deployment

# 回滚到上一个版本
kubectl rollout undo deployment/lanchain-deployment

# 回滚到指定版本
kubectl rollout undo deployment/lanchain-deployment --to-revision=2
```

滚动更新的缺点：
- 新版本 Bug 可能在验证期间没有被检测到
- 全部更新完后才发现问题，此时所有实例都是有问题的版本

---

## Canary Release and Istio Traffic Control

蓝绿部署 vs 金丝雀（灰度）发布：

| 策略 | 做法 | 优点 | 缺点 |
|------|------|------|------|
| 蓝绿部署 | 准备两套完整服务，流量一次性切换 | 旧版本完整保留，可快速回滚 | 需要 2 倍资源 |
| 金丝雀发布 | 先引入 10-30% 流量到新版本，逐步扩大 | 资源利用率高，风险可控 | 新旧版本并存，逻辑复杂 |
| 滚动更新 | 逐批替换旧实例 | 资源利用率高 | 回滚窗口短，验证难 |

金丝雀发布名称来源：矿场开工前放入金丝雀检测有无毒气，金丝雀对毒气敏感，用作"预警器"。

使用 **Istio** 实现流量权重控制：

```yaml
# virtualservice.yaml（Istio）
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: lanchain-vs
spec:
  http:
  - route:
    - destination:
        host: lanchain-stable
        subset: stable
      weight: 90
    - destination:
        host: lanchain-canary
        subset: canary
      weight: 10   # 10% 流量到新版本
```

Istio 的作用：在滚动升级期间控制流量权重，防止不稳定的新实例接收过多请求。

---

## Connections
- → [[077-fastapi-model-service]]
- → [[079-monitoring-system]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 用自己的话解释 Pod、Deployment、Service 三者的关系和各自的职责，并说明为什么需要 Service 来屏蔽 Pod 的 IP 变化。
2. 为什么不能把 API Key 明文写在 Deployment YAML 中？K8s Secret 用 base64 编码存储密钥，这样做安全吗？生产环境应该怎么办？
3. 蓝绿部署、金丝雀发布、滚动更新三种策略分别有什么优缺点？金丝雀发布名称的来源是什么，这个比喻如何体现其设计思想？

> [!example]- Answer Guide
> 
> #### Q1 — Pod / Deployment / Service 关系
> 
> Pod 是 K8s 最小调度单元，包含容器、网络命名空间和存储卷；Deployment 是控制器，声明式地维持 Pod 副本数量并管理镜像版本；Service 为一组 Pod 提供稳定的网络入口，当 Pod 因崩溃重建导致 IP 变化时，用户始终通过 Service 的固定端口（如 80）访问，K8s 负责负载均衡到后端 Pod 的 8000 端口。
> 
> #### Q2 — API Key 明文与 Secret 安全
> 
> 明文写入 YAML 会将密钥暴露在版本控制和日志中；base64 只是编码格式变换而非加密，可以轻松还原（`echo -n "..." | base64`），因此 K8s Secret 本身并不安全；生产环境应使用 K8s Vault 或云厂商密钥管理服务。
> 
> #### Q3 — 三种发布策略对比
> 
> 蓝绿部署保留两套完整服务、切换快但需要 2 倍资源；金丝雀发布只引入 10–30% 流量到新版本，资源利用率高、风险可控，但新旧版本并存逻辑复杂；滚动更新逐批替换实例、资源利用率高，但回滚窗口短、验证难。金丝雀名称来自矿场用金丝雀检测毒气的做法——金丝雀对毒气敏感，先于人类预警，类比新版本先承接少量流量以检测潜在问题。
