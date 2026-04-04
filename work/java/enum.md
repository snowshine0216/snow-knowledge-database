---
tags: [java, enum, enumeration]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Java.one%7C98555e3c-6c70-2949-830f-bb86b4aea500%2FJAVA%20enum%7C5bb404c6-e846-4e40-a2e8-5103399c46f8%2F%29
---

# JAVA enum

## 定义 enum

```java
package com.geekbang.supermarket;

// 使用 enum 而非 class 声明
public enum Category {
    // 在最开始的时候以这种形式，创建所有的枚举对象（不可以重名）
    FOOD(1),
    COOK(3),
    SNACK(5),
    CLOTHES(7),
    ELECTRIC(9);

    // 可以有属性
    private int id;

    // 构造方法必须是 private（不写也是 private）
    private Category(int id) {
        this.id = id;
    }

    public int getId() { return id; }
}
```

## 使用 enum

```java
public class UseEnum {
    public static void main(String[] args) {
        // 枚举所有枚举值，查看每个实例的相关方法
        for (Category category : Category.values()) {
            System.out.println("------" + category.getId() + "------");
            System.out.println(category.ordinal());   // 序号（0-based）
            System.out.println(category.name());      // 名称字符串
            System.out.println(category.toString());
        }

        // 根据名字获取枚举
        System.out.println(Category.valueOf("FOOD"));
        System.out.println(Category.valueOf("COOK"));
    }
}
```
