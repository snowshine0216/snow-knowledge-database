---
tags: [tech-tips, migration, postgresql, kubernetes, pg_dump, microstrategy]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Useful%20Tooltip.one%7C64d3c646-b079-e14a-b48a-7cab8b41e0f3%2Fmigration%7C93a8902a-eb7c-4547-91b9-72e801c02003%2F%29
---

# Migration

## Dump Table from Repo DB and Copy Locally

```bash
# Exec into repo DB container
k_exec repo db

cd

# Dump specific table
pg_dump -h localhost -U mstr -t chat_message_data_file \
  --no-owner --no-acl -f mstr_library.sql mstr_library

# Copy dump file from pod to local
k cp mci-ze4yt-dev-repository-666c75bc54-mqpd5:/home/mstr/mstr_library.sql \
  ~/Downloads/mstr_library.sql
```
