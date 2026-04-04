---
tags: [collaboration, windows, microstrategy, collab-server, redis, nodejs]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Collaboration.one%7Ca2375478-5914-6b4a-9ebb-0803b779fb8a%2FWindows%7Cb1e8fe72-395f-644b-8257-6cd6e7519881%2F%29
---

# Collaboration — Windows

MicroStrategy Collaboration Server setup on Windows.

## Node.js Commands

```bat
REM Admin tool
"C:\Program Files (x86)\Common Files\MicroStrategy\nodejs\node.exe" ^
  "C:\Program Files (x86)\MicroStrategy\Collaboration Server\node_modules\mstr-collab-svc\admintool.js" ^
  "C:\Program Files (x86)\MicroStrategy\Collaboration Server\config.json"

REM Diagnose
"C:\Program Files (x86)\Common Files\MicroStrategy\nodejs\node.exe" ^
  "C:\Program Files (x86)\MicroStrategy\Collaboration Server\node_modules\mstr-collab-svc\diagnose.js" ^
  "C:\Program Files (x86)\MicroStrategy\Collaboration Server\config.json"

REM Encrypt AES key
"C:\Program Files (x86)\Common Files\MicroStrategy\nodejs\node.exe" ^
  "C:\Program Files (x86)\MicroStrategy\Collaboration Server\node_modules\mstr-collab-svc\encrypt.js" ^
  "C:\Program Files (x86)\MicroStrategy\Collaboration Server\mstr_collab_aes.key" ^
  <redacted>

REM Collab Developer
"C:\Program Files (x86)\Common Files\MicroStrategy\nodejs\node.exe" ^
  "C:\Program Files (x86)\MicroStrategy\Collaboration Server\node_modules\mstr-collab-svc\collabDeveloper.js"

REM Start server
"C:\Program Files (x86)\Common Files\MicroStrategy\nodejs\node.exe" --trace-warnings ^
  "C:\Program Files (x86)\MicroStrategy\Collaboration Server\node_modules\mstr-collab-svc\server.js" ^
  "C:\Program Files (x86)\MicroStrategy\Collaboration Server\config.json"
```

## Redis Commands (Windows)

```bat
cd "C:\Program Files (x86)\Common Files\MicroStrategy\Redis"
redis-server redis.windows.conf

REM Enter redis-cli client
redis-cli

REM Check password
config get requirepass

REM Set password
config set requirepass <redacted>
```

## Collaboration Server Redis Config

```
redis://10.250.146.36:6379
```
