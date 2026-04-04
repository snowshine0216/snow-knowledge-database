---
tags: [k8s, kubernetes, kubectl, commands, aws, eks]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28K8S.one%7Cdef7f01f-6a36-2748-83b6-7535570863d0%2FCommand%7Cd5e75cee-858e-fc4a-9c63-cbe6dc164460%2F%29
---

# K8S Command

## Login

**Shippable:**
```bash
chmod 400 jk-poc2.pem
ssh ec2-user@ec2-52-220-233-94.ap-southeast-1.compute.amazonaws.com -i jk-poc2.pem
kubectl config set-context --current --namespace=mstr-env-env-0s0kud0fzb48wag8
```

```bash
kubectl config get-contexts
kubectl config set-context arn:aws:eks:ap-southeast-1:593612656025:cluster/cluster-jzcyath2quqp34zb-EKS-Cluster
```

**Set context:**
```bash
kubectl config set-context --current --namespace=mstr-env-mci-tyi1j-dev
```

## Scale

```bash
kubectl get deployments
kubectl scale --replicas=2 deployment/mci-tyi1j-dev-library
```

## Get Secrets / DB Credentials

```bash
kubectl get secret insight-service-secret -n mstr-env-env-0s0kud0fzb48wag8 -o jsonpath='{.data.insight-service-db-secret}' | base64 --decode
kubectl get secret passwords -n mstr-env-env-0s0kud0fzb48wag8 -o jsonpath='{.data.md-password}' | base64 -d
kubectl get secret passwords -o jsonpath='{.data.md-password}' | base64 --decode
kubectl get secret trust-token -o jsonpath='{.data.token}' | base64 --decode
kc get secret pa-secret -o jsonpath='{.data.pa-db-secret}' | base64 --decode
```

## Execute into Pod

```bash
kubectl exec -it task-pv-pod -namespace -- /bin/bash
kubectl exec env-0s0kud0fzb48wag8-collaboration-598f6598f7-pgtbr -c env-0s0kud0fzb48wag8-collaboration -i -t -- bash
kubectl exec env-0s0kud0fzb48wag8-insight-service-5fffbdc7f9-tfz72 -c env-0s0kud0fzb48wag8-insight-service -i -t -- bash
kubectl exec env-0s0kud0fzb48wag8-iserver-1-8f59946c5-g2pvz -c env-0s0kud0fzb48wag8-iserver-1 -i -t -- bash
```

**Exec into pods (alternative):**
```bash
k exec -ti mci-1jpe9-dev-collaboration-788bccf65-5t48d -n "mstr-env-mci-1jpe9-dev" -- sh
k get deploy mci-1jpe9-dev-collaboration -n mstr-env-mci-1jpe9-dev -o yaml > tmp.yaml
k apply -f tmp.yaml --force
```

## Check DB

```bash
psql -h env-0s0kud0fzb48wag8-postgres.cj2nhbsmztn9.ap-southeast-1.rds.amazonaws.com -U mstr_insight_service -d postgres
```

## Copy Files

```bash
scp /Users/xuyin/Documents/Repository/data-simulation2.tar.gz ec2-user@ec2-52-220-233-94.ap-southeast-1.compute.amazonaws.com:/home/ec2-user
chown 1000:1000 data-simulation2.tar.gz
kubectl cp data-simulation2.tar.gz mstr-env-env-0s0kud0fzb48wag8/env-0s0kud0fzb48wag8-insight-service-5fffbdc7f9-tfz72:/home/mstr
k cp $file $namespace/$pod_name:/opt/mstr/ContainerState
k cp mstr-env-mci-ric02-dev/mci-ric02-dev-iserver-1-56f7bd54d9-dvxzd:/opt/mstr/MicroStrategy/log/RestTrace.log RestTrace_1.log
```

## Expose Developer Service

```bash
kubectl get deployments -n mstr-env-mci-bp8bd-dev
kubectl expose deploy mci-ncvp1-stg-insight-service --name mci-ncvp1-stg-insight-service-external --type=NodePort -n mstr-env-mci-ncvp1-stg
kubectl get service mci-ncvp1-stg-insight-service-external -n mstr-env-mci-bp8bd-dev  # -> port 31910
kubectl get pods -n mstr-env-mci-bp8bd-dev
kubectl describe pod mci-ncvp1-stg-insight-service-77bc976b69-h2lwp -n mstr-env-mci-bp8bd-dev
kc expose deploy tec-l-1183620-collaboration --name tec-l-1183620-collaboration-external --type=NodePort
```

## YAML Override (keep pod alive)

```yaml
name: mci-9e6i3-dev-library
# command: ['sh', '-c', 'sleep 3600']
```
