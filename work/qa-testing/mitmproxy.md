---
tags: [qa-testing, mitmproxy, proxy, http-intercept, testing]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28%E6%B5%8B%E8%AF%95%E5%BC%80%E5%8F%91.one%7Ce7610782-a763-4548-9d63-3961b0f35d65%2Fmitmproxy%7Cf78cbc44-a0dc-3445-a6a9-10addebbe20c%2F%29
---

# mitmproxy

## Route Traffic Through Proxy

```bash
curl --proxy http://127.0.0.1:8080 "http://"
```

## Intercept Mode (`:set intercept`)

```
:set intercept ' '
```

| Filter | Meaning |
|---|---|
| `~u <regex>` | Only intercept specific URLs |
| `~q` | Only intercept requests (not responses) |
| `~u /Dunedin &~q` | URL + request filter combined |

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `a` | Continue without modify |
| `X` | Cancel request |
| `Focus → enter → e` | Select field to modify |
| `enter → esc` | Confirm modification |
| `q → go back → a` | Resume |
| `r` (focus) | Replay request |
