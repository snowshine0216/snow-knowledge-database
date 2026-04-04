---
tags: [collaboration, configuration, redis, microstrategy, collab-server]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Collaboration.one%7Ca2375478-5914-6b4a-9ebb-0803b779fb8a%2Fconfiguration%7C437e5e6b-55c9-924b-9f6a-a3e5c88da1c5%2F%29
---

# Collaboration — Configuration

Sample `config.json` fields for the Collaboration Server:

```json
{
  "redisServerUrl": "redis://10.197.105.45:6379",
  "redisServerPwd": "<redacted>",
  "logging": true,
  "loggingOptions": {},
  "disableAudit": false,
  "notificationBaseUrl": "https://tec-l-1183510.labs.microstrategy.com/MicroStrategyLibrary"
}
```
