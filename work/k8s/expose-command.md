---
tags: [k8s, kubernetes, kubectl, expose, nodeport]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28K8S.one%7Cdef7f01f-6a36-2748-83b6-7535570863d0%2FExpose%20command%7Ca2012608-695c-bb4d-9b26-a6ad3eb0a25e%2F%29
---

# Expose Command

```bash
k expose sts mci-ze4yt-dev-iserver --name mci-ze4yt-dev-iserver-external --type=NodePort --port=30084 --target-port=34952 -n <namespace>

k expose sts mci-ze4yt-dev-iserver --name mci-ze4yt-dev-iserver-external --type=NodePort --port=30085 --target-port=34962 -n <namespace>
```
