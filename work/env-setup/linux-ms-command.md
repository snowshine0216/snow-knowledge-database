---
tags: [env-setup, linux, microstrategy, mstrconnectwiz, postgresql, mysql, sqlserver]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Environemnt%20Setup.one%7C2bfde96d-9f56-6047-9368-2a88190c24b7%2FLinux%20MS%20command%7C0eaa75d5-0fa6-7e49-b741-fe51e44c5e73%2F%29
---

# Linux MS Command

## MicroStrategy Paths

```
/opt/mstr/MicroStrategy/bin/mstrcfgwiz-editor
/var/opt/MicroStrategy
```

## Database Connector (mstrconnectwiz)

### PostgreSQL

```bash
sudo ./mstrconnectwiz -r POSTGRESQL ts-pgsql11-wh \
  ts-pgsql11.labs.microstrategy.com 5432 hd706979 \
  -u:hd706979 -p:<redacted>
```

### MySQL

```bash
sudo ./mstrconnectwiz -r MYSQL_CONNECTOR MD155 \
  ts-mysql56i.labs.microstrategy.com 3306 XUYIN1653356882 \
  /usr/local/lib/libmyodbc8w.so \
  -u:XUYIN1653356882 -p:<redacted>
```

### SQL Server

```bash
sudo ./mstrconnectwiz -r SQLSERVER MTRMDIWH \
  10.27.10.215 1433 MTRMDIWH \
  -u:MTRMDIWH -p:<redacted>
```
