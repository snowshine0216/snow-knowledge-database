---
tags: [k8s, kubernetes, docker, aws, ecr, harbor, nexus, image-build, k3s]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28K8S.one%7Cdef7f01f-6a36-2748-83b6-7535570863d0%2Fbuild%20self%20image%7C9bb60aee-f81a-8245-8932-017b9bc1467d%2F%29
---

# Build Self Image

Reference: https://microstrategy.atlassian.net/wiki/spaces/MCICTC/pages/3722353565/How+to+test+your+self-built+images+or+your+code+changes+in+Tanzu+mcp+or+STG+testing+cluster+mcg

## SSH / AWS Setup

```bash
ssh-copy-id -i ~/.ssh/id_ed25519 admin@10.23.35.186
aws configure
```

## S3 Backup Commands

```bash
# Download from S3
aws s3 cp s3://mci-dev-backups/mci-quyfk-dev/mci-quyfk-dev-iserver-0-2023-11-06-03_13.592720.tar.gz ./

# Upload to S3
aws s3 cp tec-l-1191974-iserver-0-2024-02-20-08_34_33.866239.tar.gz \
  s3://mci-dev-backups/mci-ze4yt-dev/tec-l-1191974-iserver.tar.gz --region us-east-1
```

## Kubectl Misc

```bash
kc logs -p         # previous container logs
kc logs --follow

kubectl get secrets -n mstr-env-mci-xxxxx-dev trust-token-v2 --template={{.data.token}} | base64 -D
kubectl -n microstrategy get secret passwords -o jsonpath='{.data.md-password}' | base64 --decode
kc get secrets trust-token-v2 --template={{.data.token}} | base64 -d

k top pods --all-namespaces
free -m | tee -a free.perf
sudo find / -name crictl 2>/dev/null

psql -U mstr_insight_service -d tec-l-1204734_insight_service -h tec-l-1204734.labs.microstrategy.com
```

## Docker Build — web-dossier

```bash
docker build \
  --build-arg APP_VERSION=11.3.1260 \
  --build-arg BASE_IMAGE=nexus.internal.microstrategy.com:49081/redhat-ubi9-minimal-jre-tomcat-node:11.3.1260 \
  -t 385824333536.dkr.ecr.us-east-1.amazonaws.com/test-image:web-dossier.email .

docker build \
  --build-arg APP_VERSION=11.3.1260 \
  --build-arg BASE_IMAGE=nexus.internal.microstrategy.com:49081/redhat-ubi9-minimal-jre-tomcat-node:11.3.1260 \
  -t local/web-dossier:pin.4 .

docker build \
  --build-arg BASE_IMAGE=nexus.internal.microstrategy.com:49081/redhat-fips-node-ubi8-minimal:11.3.1130 \
  --build-arg APP_VERSION=11.3.1160 \
  -t local/collab.ai .
```

## Docker Save / Import to k3s

```bash
docker save local/web-dossier:pin.2
docker save local/web-dossier:pin.3 | sudo /usr/local/bin/k3s ctr images import -
docker save nexus.internal.microstrategy.com:49080/web-dossier | sudo /usr/local/bin/k3s ctr images import -
```

## Patch Deployments (image replace)

```bash
k patch deploy tec-l-1183620-library -n microstrategy --type='json' \
  -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "local/web-dossier:pin.3"}]'

k patch deploy mci-ze4yt-dev-library --type='json' \
  -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "harbor.corp.microstrategy.com/mci-ecr-proxy-cache/test-image:web-dossier.ai.1"}]'

k patch deploy mci-7k9pa-dev-library --type='json' \
  -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "harbor.corp.microstrategy.com/mci-ecr-proxy-cache/web-dossier:m2021_230801-.-11.3.1130.00692"}]'

k patch deploy tec-l-1191974-library -n microstrategy --type='json' \
  -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "local/web-dossier:pin.3"}]'

k patch deploy tec-l-1183620-collaboration -n microstrategy --type='json' \
  -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "nexus.internal.microstrategy.com:49080/collabservice:m2021_2309-.-11.3.1160.00397"}]'

k patch deploy mci-de5f0-dev-library --type='json' \
  -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "harbor.corp.microstrategy.com/mci-ecr-proxy-cache/test-image:web-dossier.topics.demo"}]'
```

## ECR Push

```bash
docker logout 385824333536.dkr.ecr.us-east-1.amazonaws.com
docker tag a502d2723fab 385824333536.dkr.ecr.us-east-1.amazonaws.com/test-image:web-dossier.bot.0106.1
docker push 385824333536.dkr.ecr.us-east-1.amazonaws.com/test-image:web-dossier.email

# STG image tag pattern:
# 385824333536.dkr.ecr.us-east-1.amazonaws.com/test-image:{image_tag}
```

## Image References

```
harbor.corp.microstrategy.com/mci-ecr-proxy-cache/test-image:collab.topics.demo
harbor.corp.microstrategy.com/mci-ecr-proxy-cache/test-image:web-dossier.haschange
harbor.corp.microstrategy.com/mci-ecr-proxy-cache/web-dossier:m2021_230801-.-11.3.1130.00692
harbor.corp.microstrategy.com/mci-ecr-proxy-cache/web-dossier:m2021_2309-.-11.3.1160.01850
nexus.internal.microstrategy.com:49080/web-dossier:m2021_2309-.-11.3.1160.01800
harbor.corp.microstrategy.com/mci-ecr-proxy-cache/collabservice:m2021_2309-.-11.3.1160.00399
collabservice:m2021_2309-.-11.3.1160.00397
```

## Local Docker Services

```bash
# Logservice (OPENAI_API_KEY from env/secret)
docker build -t localhost:5000/logservice:0617.1 .
docker run -e OPENAI_API_KEY=<redacted> -d --name=logservice4.2 -p 8090:8090 logservice:4.2

# Codeana
docker build -t codeana:1.1 .
docker run -d -v ~/.azure/:/root/.azure --name=codeana1.1 -p 5000:5000 codeana:1.1

# Code-diff (git credentials from env)
docker run -d -p 8085:8085 --restart=always \
  -v /home/admin/.ssh/id_rsa:/root/.ssh/id_rsa \
  -e JAVA_OPTS="... -Dgit.userName=xuyin@microstrategy.com -Dgit.password=<redacted> ..." \
  --name code-diff rayduan/code-diff:v1

# Precise
docker build -t localhost:5000/precise:0621.1 .
docker run -d -v /home/admin/jacoco:/root/jacoco -p 8070:8070 --name=precise1.1 localhost:5000/precise:0622.1

# Envmanage
docker build -t local/envmanagev4:0927.1 .
docker run -d --name=envmanagev5.12 \
  -v /home/admin/.ssh/id_rsa:/root/.ssh/id_rsa \
  -v /home/admin/projects/crt:/root/crt \
  -p 8073:8090 --restart=always local/envmanagev5:1013.1
run_env envmangev5.13 local/envmanagev5:1014.1

# iServer
docker build -f Dockerfile.snow -t local/iserver:1120.2 .

# Logservice with volume
docker run -d -v /home/admin/.azure/:/root/.azure -v /home/admin/data:/app/data \
  --name=logservice0625.1 -p 8091:8090 localhost:5000/logservice:0625.1
```

## Jupyter

```bash
nohup jupyter notebook --allow-root > jupyter.log 2>&1 &
```

## k3s Image Management

```bash
sudo /usr/local/bin/k3s ctr images rm docker.io/local/web-dossier:pin
sudo /usr/local/bin/k3s ctr images list

# Export/import chatbot image
sudo /usr/local/bin/k3s ctr images export chatbot.tar \
  docker.io/nexus.internal.microstrategy.com:49080/web-dossier:jenkins-ai-chatbot-.-m2021-.-stage-0-system-premerge-test-130
docker load -i chatbot.tar
```

## crictl Setup (k3s)

```bash
sudo find / -name crictl 2>/dev/null
CRICTL_PATH=$(find /var/lib/rancher/k3s/data -name crictl)
ln -s /var/lib/rancher/k3s/data/<ID>/bin/crictl /usr/local/bin/crictl
export PATH=$PATH:/var/lib/rancher/k3s/data/<ID>/bin
crictl rmi --prune
```

## AI Service Config Secret

```bash
# Get
kubectl get secret ai-service-config -n microstrategy -o=jsonpath='{.data.aiConfig.json}' | base64 --decode

# Update
newEncodedData=$(base64 < new-aiConfig.json)
kubectl patch secret ai-service-config -n microstrategy --type=json \
  -p='[{"op": "replace", "path": "/data/aiConfig\.json", "value": "$(newEncodedData)"}]'

# Verify
kubectl get secret ai-service-config -o=jsonpath='{.data.aiConfig\.json}' | base64 --decode
```

## Docker Registry (local)

```bash
docker tag <local_image> localhost:5000/<registry_image>:<tag>
docker push localhost:5000/<registry_image>:<tag>
docker pull localhost:5000/<registry_image>:<tag>
```

## Azure CLI

```bash
az account show
az login --allow-no-subscriptions --tenant MICROSTRATEGY.onmicrosoft.com
```

## Misc

```bash
# Delete all collaboration pods
kc get po | grep collaboration | awk '{print $1}' | xargs kubectl -n microstrategy delete po

# Get image for specific pod
k get po {pod_name} -n microstrategy -o yaml | grep image
kc get po tec-l-1215339-mobile-54fd9557fb-rvzxv -o yaml | grep image

# Save image to tar
docker save -o /path/to/output.tar image_name:tag
```

> Note: TH5233, I9246 — Jira ticket references. Restart count article: https://zhuanlan.zhihu.com/p/494370957
