---
tags: [java, polymorphism, overload, override, static-polymorphism, dynamic-polymorphism]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Java.one%7C98555e3c-6c70-2949-830f-bb86b4aea500%2FJAVA%20%E5%A4%9A%E6%80%81%E6%9B%B4%E5%A4%9A%E8%AF%AD%E6%B3%95%E7%82%B9%7C897dfb4c-4387-db44-9d80-8962c33c5329%2F%29
---

# JAVA 多态更多语法点 (Polymorphism — More Details)

## 静态多态：重载 (Static Polymorphism — Overload)

**总结：** 调用的方法和参数实际指向的对象无关，只和引用本身的类型相关。

- 编译期间就可以明确知道哪个方法会被调用
- 如果有多种可能，则会有编译错误
- 如果没有类型完全匹配的候选，则根据类型的继承关系向下撸，找到最贴近参数类型的那个方法
- 无论是静态方法还是成员方法，重载寻找方法的顺序是一样的

```java
merchandiseTest.testMerchandiseOverload();
merchandiseTest.testMerchandiseOverload(m);         // 引用类型决定调用哪个重载
merchandiseTest.testMerchandiseOverload((String) null);  // 显式转型决定
```

## 动态多态：覆盖 (Dynamic Polymorphism — Override)

**重点：** 多态的核心问题就是——要调用哪类的哪个方法，这个方法用到的数据（`this` 引用）是谁（实际引用指向的对象）
