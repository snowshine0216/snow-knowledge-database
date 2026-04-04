---
tags: [java, instanceof, access-control, visibility, final, protected]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Java.one%7C98555e3c-6c70-2949-830f-bb86b4aea500%2FJAVA%20instanceof%20%EF%BC%8C%20%E8%AE%BF%E9%97%AE%E6%8E%A7%E5%88%B6%EF%BC%8C%E4%BF%AE%E9%A5%B0%E7%AC%A6%7Cc5c3a54e-4206-834a-ae4d-c9f0a89e9f40%2F%29
---

# JAVA instanceof，访问控制，修饰符

## instanceof

- 可以判断一个引用指向的对象是否某一个类型或者其子类型
- 是则返回 `true`，否则返回 `false`
- 如果引用是 `null`，则肯定返回 `false`

```java
for (int i = 0; i < merchandiseCounts; i++) {
    MerchandiseV2 m = superMarket.getMerchandiseOf(i);
    if (m instanceof Phone) {
        // 先判断，再强制类型转换，比较安全
        Phone ph = (Phone) m;
        System.out.println(ph.getBrand());
    }
}
```

## 访问控制 (Access Control)

`protected` 可见性 = default + 对子类可见；覆盖不能让可见性更低（default 比 protected 低，不可以）

| | 类内部 | 本包 | 子类 | 外部包 |
|---|---|---|---|---|
| `private` | ✓ | | | |
| (default) | ✓ | ✓ | | |
| `protected` | ✓ | ✓ | ✓ | |
| `public` | ✓ | ✓ | ✓ | ✓ |

## final 修饰符

| 修饰对象 | 效果 |
|---|---|
| 类 | 不可被继承 |
| 方法 | 不可被子类继承（覆盖） |
| 变量 | 不可被赋值 |
| 成员变量 | 可以在构造方法里赋值（或直接初始化），只能赋值一次，且必须赋值 |
| 形参 | 形参只能在函数被调用时赋值，不能在函数体里赋值 |
| 引用 | 不能指向新的引用，但可以给引用的属性赋值 |

- 声明时可以赋值，其他时间不能再赋值
- `final` 不能用来修饰构造方法
