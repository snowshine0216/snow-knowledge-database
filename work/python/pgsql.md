---
tags: [python, postgresql, psycopg2, linux, pip]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Python.one%7C150076f6-e0f4-ad48-9fad-d7db39c39038%2Fpgsql%7Cbc22c6f9-2a8f-8847-a631-990db1dcae4e%2F%29
---

# pgsql — Python psycopg2 Setup

Reference: https://blog.csdn.net/somenzz/article/details/120793030

## Install psycopg2-binary (v2.9.3)

Use `psycopg2-binary` to avoid needing to compile from source:

```bash
# Install system dependencies first (CentOS/RHEL)
yum install postgresql postgresql-devel python-devel python3-devel

# Install psycopg2 via pip
pip3 install psycopg2
```

> `psycopg2-binary` bundles all native libraries so no system PostgreSQL headers are needed.
