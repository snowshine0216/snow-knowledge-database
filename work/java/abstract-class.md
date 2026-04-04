---
tags: [java, abstract-class, abstract-method, inheritance, polymorphism]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Java.one%7C98555e3c-6c70-2949-830f-bb86b4aea500%2FJAVA%20%E6%8A%BD%E8%B1%A1%E7%B1%BB%7C39f95d1f-cf92-fa4f-bf1a-25647b72deda%2F%29
---

# JAVA 抽象类 (Abstract Class)

## 定义抽象类

- 使用 `abstract` 修饰符修饰类
- 抽象类**不能被实例化**（不能 `new`）
- 抽象类可以包含抽象方法（只有声明，没有方法体）
- 抽象类可以包含普通方法（有方法体）
- 子类必须实现所有抽象方法，否则子类也必须声明为 `abstract`

```java
public abstract class AbstractExpireDateMerchandise
        extends MerchandiseV2 implements ExpireDateMerchandise {

    private Date producedDate;
    private Date expirationDate;

    public AbstractExpireDateMerchandise(String name, String id,
            int count, double soldPrice, double purchasePrice,
            Date producedDate, Date expirationDate) {
        super(name, id, count, soldPrice, purchasePrice);
        this.producedDate = producedDate;
        this.expirationDate = expirationDate;
    }

    @Override
    public boolean notExpireInDays(int days) {
        return daysBeforeExpire() > days;
    }

    @Override
    public Date getProducedDate() { return producedDate; }

    @Override
    public Date getExpireDate() { return expirationDate; }

    @Override
    public double leftDatePercentage() {
        long total = expirationDate.getTime() - producedDate.getTime();
        long left = expirationDate.getTime() - System.currentTimeMillis();
        return (double) left / total;
    }

    // 抽象方法：子类必须实现；可以是 protected
    protected abstract void test();

    private long daysBeforeExpire() {
        long expireMS = expirationDate.getTime();
        long left = expireMS - System.currentTimeMillis();
        if (left < 0) {
            return -1;
        }
        return left / (24 * 3600 * 1000);
    }
}
```

## 实现抽象类

- 具体子类 `extends` 抽象类，并实现所有抽象方法

```java
public class GamePointCard extends AbstractExpireDateMerchandise
        implements VirtualMerchandise {

    public GamePointCard(String name, String id, int count,
            double soldPrice, double purchasePrice,
            Date producedDate, Date expirationDate) {
        super(name, id, count, soldPrice, purchasePrice, producedDate, expirationDate);
    }

    @Override
    protected void test() {
        System.out.println("GamePointCard test");
    }
}
```

## 抽象类 vs 接口

| | 抽象类 | 接口 |
|---|---|---|
| 实例化 | 不可以 | 不可以 |
| 继承/实现 | `extends`（单继承） | `implements`（多实现） |
| 构造方法 | 有 | 无 |
| 成员变量 | 普通成员变量 | 只有 `public static final` |
| 方法 | 抽象方法 + 普通方法 | 抽象方法 + `default` 方法 |
| 使用场景 | 共享代码 + 模板方法 | 定义规范/契约 |
