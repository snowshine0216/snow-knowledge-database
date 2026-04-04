---
tags: [java, string-builder, mutable-string, chaining]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Java.one%7C98555e3c-6c70-2949-830f-bb86b4aea500%2FJAVA%20String%20Builder%7Cadc19ef5-2a40-ec43-ad7c-9d716c85901a%2F%29
---

# JAVA String Builder

- `StringBuilder` 是可变的（String 是不可变的）
- 支持方法链（fluent/chaining），面向 `this` 自引用

```java
StringBuilder strBuilder = new StringBuilder();

long longVal = 123456789;

// 链式 append
strBuilder.append(true).append("abc").append(longVal);

strBuilder.toString();            // "trueabc123456789"
strBuilder.reverse().toString();  // reversed
strBuilder.reverse().toString();  // back to original

strBuilder.delete(0, 4).toString();             // delete chars [0, 4)
strBuilder.insert(3, "LLLL").toString();        // insert at offset 3
```
