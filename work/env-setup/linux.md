---
tags: [linux, env-setup, java, redis, lsof, shell]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Environemnt%20Setup.one%7C2bfde96d-9f56-6047-9368-2a88190c24b7%2FLinux%7C75fd704c-b2a0-204b-8e57-860f2bf46be6%2F%29
---

# Linux Setup Notes

## Java

```bash
update-alternatives --config java
```

## Port Check

```bash
sudo lsof -i tcp:7777
```

## Redis

```bash
./opt/mstr/MicroStrategy/install/Redis/bin/redis-server redis.conf &
```

## SCP Download

```bash
sudo scp admin@10.23.39.188:/usr/local/insightengine_00816/nohup.out /Users/xuyin/Downloads
```

## Command History

```bash
history | less
```

## Reference

- Linux Shell: https://pdf.ceshiren.com/geektime/shell/LinuxShell.html
- tec-l-1308077 — server at 10.23.33.67 (credentials in OneNote: `newman1#123`)
