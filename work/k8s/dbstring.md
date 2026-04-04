---
tags: [k8s, database, postgres, connection-string, javascript, encoding]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28K8S.one%7Cdef7f01f-6a36-2748-83b6-7535570863d0%2Fdbstring%7Cd8e91fd2-5a71-1b4a-b492-44787c5fa526%2F%29
---

# DB Connection String — Handling Special Characters

When a password contains `#`, it must be encoded before embedding in a connection string.

## Method 1: encodeURIComponent

```javascript
const password = 'mypassword#123';
const encodedPassword = encodeURIComponent(password);
const dbstring = `postgres://user:${encodedPassword}@localhost:5432/mydb`;
```

`password` becomes `mypassword%23123`, which is safe to use in the connection string.

## Method 2: Regex Escape

```javascript
const password = 'mypassword#123';
const escapedPassword = password.replace(/#/g, '\\#');
const dbstring = `postgres://user:${escapedPassword}@localhost:5432/mydb`;
```

Uses regex `/#/g` to replace all `#` with `\#`.

> Note: Different database clients/drivers may handle URL encoding differently — always consult the driver docs.
