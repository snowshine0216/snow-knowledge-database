---
tags: [k8s, kubernetes, postgres, migration, database, pg_dump]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28K8S.one%7Cdef7f01f-6a36-2748-83b6-7535570863d0%2FSpike%20migration%7C92dd4bfc-3202-7c4d-8416-0df7d7a208de%2F%29
---

# Spike Migration

## Backup Phase

1. Scale 0
2. Patch + sleep
3. `pg_dumpall > /var/lib/postgresql/data/backup.sql`
4. Copy out to vra
5. Remove all data 下的文件: `rm -rf *`

## Restore Phase

1. Replace pg16 image (`385824333536.dkr.ecr.us-east-1.amazonaws.com/test-image:pg.snowtest16`)
2. Copy back to pg pod
3. Remove sleep
4. `psql -f backup.sql mstr`
