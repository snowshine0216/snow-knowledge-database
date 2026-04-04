---
tags: [java, inheritance, extends, override, polymorphism, super]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Java.one%7C98555e3c-6c70-2949-830f-bb86b4aea500%2FJAVA%20%E7%BB%A7%E6%89%BF%7C8f16aa2f-f46c-8943-b0d6-29a692fbda1c%2F%29
---

# JAVA 继承 (Inheritance)

## 基本概念

```java
// 继承语法：类名后面使用 extends 加 要继承的类名
public class PhoneExtendsMerchandise extends MerchandiseV2 {
    // 给 Phone 增加新的属性
    private double screenSize;
    private double cpuHZ;
    private int memoryG;
    private int storageG;
    private String brand;
    private String os;
}
```

- **父类 (Parent Class)：** 被继承的类，例如 `MerchandiseV2`
- **子类 (Sub Class)：** 继承者，例如 `PhoneExtendsMerchandise`
- Java 只允许单继承（一个直接父类）
- 子类继承了父类所有的属性和方法
- 子类不能访问父类的 `private` 成员（属性和方法）

## Override (方法覆盖)

```java
// 通过使用和父类方法签名一样、返回值也一样的方法，让子类覆盖掉父类的方法
public String getName() {
    return this.brand + ":" + this.os + ":" + name;
}
```

**继承的终极奥义：** 子类不只是把父类的方法拿过来，还可以通过覆盖来替换其中不适合子类的方法。

> 属性是联动的，可能有特殊意义。直接给属性赋值是危险的——没办法检查新值是否有意义，也无法对修改做联动处理。

## 多态 (Polymorphism)

覆盖可以覆盖掉父类的方法，同一个方法、不同的行为 → **这就是多态！**

```java
public void describePhone() {
    describe();  // 调用 describe 时，执行子类还是父类的版本？→ 子类（多态）
    System.out.println("手机的各类属性如下：\n"
        + "品牌：" + brand + "，系统为" + os + "，硬件配置如下：\n"
        + "屏幕：" + screenSize + " 寸\n"
        + "cpu主频" + cpuHZ + " GHz\n"
        + "内存" + memoryG + " Gb\n"
        + "存储空间" + storageG + " Gb");
}
```

## super

- `super` 是子类和父类交通的桥梁，但不是父类的引用
- `super` 构造方法：当遇到继承和重载的时候，可以调用 `init` 方法
