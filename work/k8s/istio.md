---
tags: [k8s, kubernetes, istio, service-mesh, proxy, logs]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28K8S.one%7Cdef7f01f-6a36-2748-83b6-7535570863d0%2FIstio%7C4f7b4e0f-37a9-4245-a81e-f88d2920ab82%2F%29
---

# Istio

Reference: https://www.freecodecamp.org/news/learn-istio-manage-microservices/

## Check Proxy Config

```bash
istioctl pc all deploy/sa-webapp -o json | \
  grep log_format -A 2 | tail -n 2
```

## View Istio Proxy Logs

```bash
kubectl logs deploy/sa-webapp -c istio-proxy | tail -n 1
```
