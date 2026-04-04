---
tags: [tech-tips, mstrbak, aws, kubernetes, backup, microstrategy]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Useful%20Tooltip.one%7C64d3c646-b079-e14a-b48a-7cab8b41e0f3%2FMstrbak%7Cf7ed0544-9379-4b41-a029-e70fd8a9932f%2F%29
---

# Mstrbak

## AWS VM

- Department path: `/opt/mstr/mstrbak`
- Check env info: `df -h`
  - If there is `efs` → enterprise
  - Otherwise → department

## Container

```bash
k exec -it mci-rewu5-dev-iserver-0 -c mstrbak-health-check -- bash
```
