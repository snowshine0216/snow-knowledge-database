---
tags: [k8s, kubernetes, kubectl, patch, docker, nexus, image]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28K8S.one%7Cdef7f01f-6a36-2748-83b6-7535570863d0%2Fpatch%7C92af1ead-cc89-b64c-8097-2d29bff7625e%2F%29
---

# K8S Patch Commands

## Patch Image (replace container image)

```bash
k patch deploy tec-l-1183510-library -n microstrategy --type='json' \
  -p='[{"op": "replace", "path": "/spec/template/spec/containers/initContainers/2/image", "value": "nexus.internal.microstrategy.com:49080/web-dossier:m2021-.-11.3.1160.01268"}]'

k patch deploy tec-l-1183620-library -n microstrategy --type='json' \
  -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "local/web-dossier:0906.1"}]'

k patch deploy tec-l-1183510-collaboration -n microstrategy --type='json' \
  -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "nexus.internal.microstrategy.com:49080/collabservice:m2021-.-11.3.1160.00299"}]'

k patch sts tec-l-1183510-iserver -n microstrategy --type='json' \
  -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "nexus.internal.microstrategy.com:49080/iserver:m2021-.-11.3.1160.00330"}]'
```

**JSON path for container image:**
```
/items/0/spec/template/spec/containers/0/image
```

## Image Reference

Schema:
```json
{
  "web-dossier": "string",
  "collabservice": "string",
  "insight-service": "string",
  "iserver": "string"
}
```

Example values:
```json
{
  "web-dossier": "nexus.internal.microstrategy.com:49080/web-dossier:m2021-.-11.3.1160.01268",
  "collabservice": "nexus.internal.microstrategy.com:49080/collabservice:m2021-.-11.3.1160.00299",
  "insight-service": "nexus.internal.microstrategy.com:49080/insight-service:m2021-.-11.3.1160.00118",
  "iserver": "nexus.internal.microstrategy.com:49080/iserver:m2021-.-11.3.1160.00330"
}
```
