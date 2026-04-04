---
tags: [k8s, kubernetes, kubectl, tips, upgrade, nodes, pods]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28K8S.one%7Cdef7f01f-6a36-2748-83b6-7535570863d0%2F%E5%B0%8Ftips%7C5467b0fd-3beb-fc45-82d2-4cadbe7512c5%2F%29
---

# K8S 小Tips

## 1. Tab Completion (requires bash-completion)

```bash
head -3 /etc/profile
source <(kubectl completion bash)
source /etc/profile
```

## 2. Vim Paste Mode

```
cat .vimrc
# add: set paste
```

## 3. 删除节点 (Remove Node)

Set node to maintenance mode (drain running pods to other nodes):
```bash
kubectl drain $nodename --delete-local-data --force --ignore-daemonsets
kubectl delete node $nodename
```

## 4. 切换命名空间 (Switch Namespace)

```bash
kubectl config set-context $clustername --namespace=$name
kubectl config set-context --current --namespace=$name
```

## 5. 查看Pod状态及负载 (Pod Status & Load)

```bash
kubectl get pods -n kube-system | grep metric
kubectl top nodes
kubectl top pods -n kube-system
```

## 6. Upgrade

```bash
kubectl drain masternode --ignore-daemonsets
ssh msater nodes
sudo -l
apt install kubeadm=1.20.1-00 -y
kubeadm upgrade plan
kubeadm upgrade apply v1.20.1 --etcd-upgrade=false
apit install kubelete=1.20.1-00 kubectl=1.20.1-00 -y
systemctl restart kubelet
kubectl get node
```

## 7. Pods

```bash
# Create pods from yaml
kubectl apply -f yaml -n namespace

# Generate pod yaml quickly
kubectl run pod2 --image=nginx --image-pull-policy=IfNotPresent \
  --dry-run=client -o yaml -- sh -c "echo aa ; sleep 1000" > pod2.yaml
```
