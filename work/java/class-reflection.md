---
tags: [java, reflection, class, getclass, getfield, getmethod]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Java.one%7C98555e3c-6c70-2949-830f-bb86b4aea500%2FJAVA%20Class%EF%BC%8C%E5%8F%8D%E5%B0%84%7Cdcace783-8d0c-d344-b03b-19bf43b42079%2F%29
---

# JAVA Class，反射 (Reflection)

## Class 类

- `Class` 类是代表类的类；每个 `Class` 类的实例都代表了一个类
- `类名.class` → 代表该 class 的 instance

```java
// Object 类里的 getClass 方法，可以获得
Class clazz = m100.getClass();

System.out.println(clazz.getName());
System.out.println(clazz.getSimpleName());

// 通过一个类的 Class 实例，可以获取一个类所有的信息（成员变量、方法等）
Field countField = clazz.getField("count");
Field nameField  = clazz.getField("name");

// 变长参数的调用格式
Method equalsMethod = clazz.getMethod("equals", Object.class);
Method buyMethod    = clazz.getMethod("buy", int.class);
```

## 反射用途

2. 使用反射（reflection）访问属性
3. 使用反射访问方法
4. 使用反射访问静态方法和属性
5. 使用反射访问 `private` 的方法和属性
6. 反射是什么（运行时动态获取类信息的机制）
