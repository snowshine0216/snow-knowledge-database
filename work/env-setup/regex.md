---
tags: [env-setup, regex, linux, shell, text-processing]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Environemnt%20Setup.one%7C2bfde96d-9f56-6047-9368-2a88190c24b7%2F%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F%7Ce4e13fd8-630d-4d4b-8d4d-6138a9819803%2F%29
---

# 正则表达式 (Regular Expressions)

## 元字符 (Meta Characters)

| 字符 | 含义 |
|---|---|
| `.` | 匹配除换行符外的任意单个字符 |
| `*` | 匹配任意一个跟在它前面的字符（零或多次）|
| `[]` | 匹配方括号中的字符类中的任意一个 |
| `^` | 匹配开头 |
| `$` | 匹配结尾 |
| `\` | 转义后面的特殊字符 |

## 通配符 vs 元字符

- 通配符: `*` `?`，shell 脚本使用
- 元字符: 文本匹配使用

## Examples

```
pass*      # 匹配 pass 和 pas
pass.*     # 匹配 pass 后面任意字符
[Hh]ello   # 匹配 Hello 或 hello
^#         # 以井号开头
\.         # 查找点（需转义）
```

让转义字符生效: 加双引号 `"\"`

## 扩展元字符 (Extended Meta Characters)

| 字符 | 含义 |
|---|---|
| `+` | 匹配前面的正则表达式至少出现一次 |
| `?` | 匹配前面的正则表达式出现零次或一次 |
| `\|` | 匹配它前面或后面的正则表达式 |
