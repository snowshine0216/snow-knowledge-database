---
tags: [env-setup, linux, find, shell]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Environemnt%20Setup.one%7C2bfde96d-9f56-6047-9368-2a88190c24b7%2FLinux%20-%20Find%7Cc1371de9-4c78-3942-9157-7656ba71a8c2%2F%29
---

# Linux - Find

```bash
# 1. Manual
man find

# 2. Find by name (supports wildcards)
find -name "*.txt"

# 3. Find by regex
find -regex

# 4. Find files/dirs by type and regex
find /etc -type d/f -regex .*wd

# 5. Find by access/modify/change time
find . -atime/mtime/ctime 8

# 6. File stat
stat $filename

# 7. Display output in English
LANG=c

# 8. Find files owned by root
find -user root -uid 0

# 9. Execute command on results (-exec flag)
find *txt -exec rm -v {} \;
```
