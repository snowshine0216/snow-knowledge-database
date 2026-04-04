---
tags: [java, arrays, static, constructor, visibility, varargs, ternary]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Java.one%7C98555e3c-6c70-2949-830f-bb86b4aea500%2FJAVA%20%E5%85%B6%E4%BB%96%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%7Cee7a9796-337c-4148-8a8b-ab63a7af2539%2F%29
---

# JAVA 其他基本概念 (Other Basic Concepts)

## Random Number

```java
Math.random()  // 生成 0-1 之间的 double
```

## Arrays

- 数组变量 `.length` 可以获得数组的长度
- 数组创建之后，长度不可以改变

```java
// 二维数组（一位数组的自然延伸）
double[][] scores = new double[3][6];
```

## Ternary Operator

```java
double svipDiscount = (isVIP ? VIP_DISCOUNT : 1);
```

## Method Overload

- 方法名一样但是参数个数不一样
- return 的返回值可以不一样

## Static Members

- **静态变量（类变量）：** 不用 new 一个实例即可调用；可以 import 直接使用
- **静态方法（类方法）：** 不用 new 一个实例即可调用；可以 import 直接使用
- **static 代码块：** `static {}` 用来给静态变量赋值；必须先声明，再赋值

```java
static {
    BASE_DISCOUNT = 0.99;
    VIP_DISCOUNT = 0.85;
    SVIP_DISCOUNT = 0.75;
}
```

## Constructor

```java
public ClassName(args) {}  // no return
```

- 构造函数如果是 private，只有当前类可以调用，可用静态方法调用并检查输入合法性

## Visibility Modifiers

| Modifier | Scope |
|---|---|
| `public` | 全局可见 |
| (default) | 当前包可见 |
| `private` | 当前类可见 |

- 成员变量应该都声明为 `private`，通过 `public` 的 get/set 方法访问
- 非 public 的类，类名可以和文件名不一样

## Utility Methods

```java
Math.abs()
Math.round()
```

## Varargs (变长参数)

- 必须是方法参数里的最后一个；可以传或者不传

```java
public static void dyncArgs(int a, String... args) {}
```

## Object.getClass()

```java
// Object 类里的 getClass 方法，可以获得类的 Class 对象
Class clazz = m100.getClass();
```
