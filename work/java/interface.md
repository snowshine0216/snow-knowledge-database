---
tags: [java, interface, default-method, implements, extends]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Java.one%7C98555e3c-6c70-2949-830f-bb86b4aea500%2FJAVA%20%E6%8E%A5%E5%8F%A3%7C7deee5d3-b57d-ad41-b876-e2f2245f4e1e%2F%29
---

# JAVA 接口 (Interface)

## 定义接口

- 使用 `interface` 而非 `class` 声明
- 接口无法被实例化（不能 `new`）
- 接口里面的方法是 `public abstract` 修饰的（可省略），有名字、参数和返回值，以分号结束
- 接口不能有实例变量；定义的变量默认是 `public static final`（可省略）

```java
public interface ExpireDateMerchandise {
    public static final int VAL_IN_INTERFACE = 999;

    boolean notExpireInDays(int days);

    Date getProducedDate();

    public abstract Date getExpireDate();
}
```

## 实现接口

- 一个类可以实现一个父类，但可以实现**多个**接口
- 实现接口必须实现接口里所有的方法

```java
public class GamePointCard extends MerchandiseV2
        implements ExpireDateMerchandise, VirtualMerchandise {
    private Date producedDate;
    private Date expirationDate;

    public boolean notExpireInDays(int days) { return daysBeforeExpire() > 0; }
    public Date getProducedDate()  { return producedDate; }
    public Date getExpireDate()    { return expirationDate; }
}
```

## 接口继承接口

- 接口可以继承多个接口，用 `extends`
- 若有重量的方法，签名相同时返回值必须完全一样，否则编译错误

```java
public interface Intf3 extends Intf1, Intf2 {
    void m();
}
```

## Java 8: default 方法

- 接口中允许有缺省实现的抽象方法（`default` 修饰，有方法体）
- 缺省方法也有 `this` 引用，指向使用接口实现的对象

```java
public interface ExpireDateMerchandise {
    default boolean notExpireInDays(int days) {
        return daysBeforeExpire() > days;
    }

    // 接口中可以有私有方法，不需要 default 修饰
    // 接口里面的私有方法，可以认为是代码直接插入到使用的地方
    private long daysBeforeExpire() {
        long expireMS = getExpireDate().getTime();
        long left = expireMS - System.currentTimeMillis();
        if (left < 0) {
            return -1;
        }
        return left / (24 * 3600 * 1000);  // 返回值是 long，由 left 类型决定
    }
}
```
