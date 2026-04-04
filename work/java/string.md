---
tags: [java, string, string-methods, api]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Java.one%7C98555e3c-6c70-2949-830f-bb86b4aea500%2FJAVA%20String%7Ccd554b24-de8a-b04d-933c-2a1dcf5641a6%2F%29
---

# JAVA String

## Common String Methods

```java
String content = "0123456789ABCDefgh";

// length() 是个方法，不是属性
content.length();

// toUpperCase / toLowerCase 生成新的 String 对象，content 本身不变
content.toUpperCase();
content.toLowerCase();

// 字符访问
content.charAt(1);
// content.charAt(99);  // throws StringIndexOutOfBoundsException

// 子串
content.substring(5);      // from index 5 to end
content.substring(1, 5);   // from index 1 to 4
```

```java
String content = "Orange_Apple_Banana";

// 转为字符数组并遍历
char[] chars = content.toCharArray();
for (int i = 0; i < chars.length; i++) {
    System.out.println(chars[i]);
}

// 按分隔符拆分
String[] s = content.split("_");
for (int i = 0; i < s.length; i++) {
    System.out.println(s[i]);
}

// indexOf / lastIndexOf
int indexOf = content.indexOf('_');
content.substring(indexOf + 1, content.length());

int lastIndexOf = content.lastIndexOf("_");
content.substring(0, lastIndexOf);
```

```java
// 检索
content.contains("apple");       // false (case-sensitive)
content.contains("Apple");       // true
content.startsWith("Orange");
content.endsWith("Banana");

// 相等比较 — 一定要用 equals，不能用 ==
String content2 = "Orange_Apple_Banana";
String content3 = "orange_Apple_Banana";
content.equals(content2);            // true
content.equals(content3);            // false
content.equalsIgnoreCase(content3);  // true
```
