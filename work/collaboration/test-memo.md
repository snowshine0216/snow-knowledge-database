---
tags: [collaboration, aws, websocket, logout, debugging]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Collaboration.one%7Ca2375478-5914-6b4a-9ebb-0803b779fb8a%2FTest%20memo%7C9850c160-9914-af4c-b1c9-a39549595cab%2F%29
---

# Collaboration — Test Memo

## AWS Cluster Logout / Session Out

WebSocket logout message format observed during debugging:

```
42["logout",{"keepAuthSession":true}]
```

Parsed structure:

```json
42["logout", {"keepAuthSession": true}]
  0: "logout"
  1: {keepAuthSession: true}
       keepAuthSession: true
```
