---
tags: [k8s, kubernetes, kubectl, aws, eks, environment]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28K8S.one%7Cdef7f01f-6a36-2748-83b6-7535570863d0%2FCommand%20-%20env-3y8trubr21gv12bi%7Ca681fdf4-f741-a845-b2c8-76e3afc4a768%2F%29
---

# Command - env-3y8trubr21gv12bi (env-4kgdmumv41cceaik)

## Login

```bash
chmod 400 jk-poc2.pem
ssh ec2-user@ec2-52-220-233-94.ap-southeast-1.compute.amazonaws.com -i jk-poc2.pem
kubectl config set-context --current --namespace=mstr-env-env-4kgdmumv41cceaik
kubectl config get-contexts
kubectl config set-context arn:aws:eks:ap-southeast-1:593612656025:cluster/cluster-jzcyath2quqp34zb-EKS-Cluster
```

## Get Secrets

```bash
kubectl get secret insight-service-secret -n mstr-env-env-4kgdmumv41cceaik -o jsonpath='{.data.insight-service-db-secret}' | base64 --decode
kubectl get secret passwords -n mstr-env-env-4kgdmumv41cceaik -o jsonpath='{.data.md-password}' | base64 --decode
```

## Execute into Pod

```bash
kubectl exec env-4kgdmumv41cceaik-collaboration-6c95447b69-s2698 -c env-4kgdmumv41cceaik-collaboration -i -t -- bash
kubectl exec mci-ncvp1-stg-insight-service-77bc976b69-f5548 -c mstr-env-mci-ncvp1-stg -i -t -- bash
kubectl exec env-4kgdmumv41cceaik-iserver-1-7d4d77657b-dxfhq -c env-4kgdmumv41cceaik-iserver-1 -i -t -- bash
kubectl exec -i -t -n mstr-env-mci-ncvp1-stg mci-ncvp1-stg-insight-service-77bc976b69-h2lwp -c mci-ncvp1-stg-insight-service -- sh -c "clear; (bash || ash || sh)"
```

## Check DB

```bash
psql -h env-4kgdmumv41cceaik-postgres.cj2nhbsmztn9.ap-southeast-1.rds.amazonaws.com -U mstr_insight_service -d postgres
```

## Copy Files

```bash
scp /Users/xuyin/Documents/Repository/data-simulation2.tar.gz ec2-user@ec2-52-220-233-94.ap-southeast-1.compute.amazonaws.com:/home/ec2-user
chown 1000:1000 data-simulation2.tar.gz
kubectl cp data-simulation2.tar.gz mstr-env-env-4kgdmumv41cceaik/env-4kgdmumv41cceaik-insight-service-5f6f459f67-dmwr5:/home/mstr
```

## Expose Developer Service

```bash
kubectl get deployments -n mstr-env-mci-bp8bd-dev
kubectl expose deploy mci-bp8bd-dev-repository --name mci-bp8bd-dev-repository-external --type=NodePort -n mstr-env-mci-bp8bd-dev
kubectl get service mci-bp8bd-dev-repository-external -n mstr-env-mci-bp8bd-dev  # -> port 32276
kubectl get pods -n mstr-env-mci-bp8bd-dev
kubectl describe pod mci-bp8bd-dev-repository-545765dc8-h7mpg -n mstr-env-mci-bp8bd-dev
# Node IPs: 10.23.49.05: 32276  |  10.23.49.61: 30194 (credentials in OneNote)
```

## Copy MSIReg / IntelligenceServer

```bash
k cp 1.xml mstr-env-mci-k91ey-dev/mci-k91ey-dev-iserver-1-775cb4565d-vl4nd:/opt/mstr/MicroStrategy/bin
k cp mstr-env-mci-k91ey-dev/mci-k91ey-dev-iserver-1-775cb4565d-vl4nd:/opt/mstr/MicroStrategy/MSIReg.reg $PWD
k cp mstr-env-mci-k91ey-dev/mci-k91ey-dev-iserver-1-775cb4565d-vl4nd:/opt/mstr/MicroStrategy/MSIReg.reg $PWD/MSIReg.reg
k cp MSIReg.reg mstr-env-mci-k91ey-dev/mci-k91ey-dev-iserver-1-775cb4565d-vl4nd:/opt/mstr/MicroStrategy/

./mstrctl -s IntelligenceServer ssc < 1.xml
./mstrctl -s IntelligenceServer stop
./mstrctl -s IntelligenceServer start
```
