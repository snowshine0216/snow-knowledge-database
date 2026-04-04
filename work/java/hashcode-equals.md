---
tags: [java, hashcode, equals, tostring, object-methods]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Java.one%7C98555e3c-6c70-2949-830f-bb86b4aea500%2FJAVA%20hashCode%20and%20equals%2C%20toString%7C5c96f1c6-acbf-5c46-8064-7bb0649e81f5%2F%29
---

# JAVA hashCode and equals, toString

1. IDE 可以自动生成
2. `hashCode` → 一个表示对象的特征值的 int 整数
3. `equals` → 用来判断两个对象从逻辑上是否相等（`==`：2个引用是不是指向同一个对象）

## 覆盖规则

- `equals` 返回 `true`，`hashCode` 也必须一样
- `equals` 不同，`hashCode` 尽量不一样

```java
@Override
public boolean equals(Object o) {
    if (o == this) return true;
    if (!(o instanceof MerchandiseV2)) return false;
    MerchandiseV2 that = (MerchandiseV2) o;
    return getCount() == that.getCount() &&
        Double.compare(that.getSoldPrice(), getSoldPrice()) == 0 &&
        Double.compare(that.getPurchasePrice(), getPurchasePrice()) == 0 &&
        getName().equals(that.getName()) &&
        getId().equals(that.getId());
}

public int hashCode() {
    return Objects.hash(getName(), getId(), getCount(), getSoldPrice(), getPurchasePrice());
}
```

## String 的 == vs equals

- 当两个 String 内容一样时，引用地址也是一样的（因为 String 不可变，Java 会复用第一个引用）
- 注意：当 String 特别长时，Java 仍然会创建一个新的引用
- 一定要用 `equals` 比较内容，不要用 `==`

## toString

- 对象的描述（IDE 可以自动生成）
