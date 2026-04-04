---
tags: [tech-tips, postgresql, pg_dump, pg_restore, database, migration]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Useful%20Tooltip.one%7C64d3c646-b079-e14a-b48a-7cab8b41e0f3%2FPgsql%7Ca9db0e58-74dd-9241-9db2-143db1af0216%2F%29
---

# PostgreSQL Tips

## Dump / Restore

```bash
# Dump specific table (data only)
pg_dump -U mstr -h localhost -d platform_analytics_wh \
  -t agg_fact_access_transactions \
  --data-only --column-inserts > restore_pa.sql

# Restore from SQL
psql -U mstr -h localhost -d platform_analytics_wh -f restore_pa.sql

# Dump full DB
export PGPASSWORD='<redacted>'
pg_dump -U mstr -d poc_metadata -Fc -b -v -f /home/mstr/poc_metadata.dump

# Restore
pg_restore -U postgres -d poc_metadata_restore -v /home/user/backups/poc_metadata.dump
```

## Restore with New DB

```bash
createdb -U your_username -h your_host poc_metadata_restore
export PGPASSWORD='<redacted>'
pg_restore -U postgres -d poc_metadata_restore -v /home/user/backups/poc_metadata.dump
```

## DBMigrator

```bash
java -cp DBMigrator.jar com.microstrategy.db.utils.DBMigrate \
  -f platform_analytics \
  -m PLATFORM_ANALYTICS \
  -d jdbc:postgresql://10.23.49.195:32034/platform_analytics_wh \
  -u mstr_pa \
  -p <redacted> \
  restore
```

## Terminate Connections

```sql
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'platform_analytics_wh'
  AND pid <> pg_backend_pid();
```

## Create Database

```sql
CREATE DATABASE platform_analytics_wh
  WITH OWNER = mstr
  TEMPLATE = template0
  ENCODING = 'UTF8'
  LC_COLLATE = 'en_US.UTF-8'
  LC_CTYPE = 'en_US.UTF-8'
  CONNECTION LIMIT = -1;

GRANT ALL PRIVILEGES ON DATABASE platform_analytics_wh TO mstr;
GRANT CONNECT ON DATABASE platform_analytics_wh TO mstr_pa;
GRANT CONNECT ON DATABASE platform_analytics_wh TO mstr_pa_application;
```

## Docker PostgreSQL

```bash
# Restore SQL
docker exec -it qanalyst-db-1 psql -U xuyin1740473708 -d xuyin1740473708 \
  -f /tmp/xuyin1740473708-backup.sql

# Dump
docker exec qanalyst-db-1 pg_dump -U xuyin1740473708 -d xuyin1740473708 \
  -Fc -b -v -f /tmp/backup1.dump
```
