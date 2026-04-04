---
tags: [java, flow-control, if-else, for-loop, while, switch, break, continue]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Java.one%7C98555e3c-6c70-2949-830f-bb86b4aea500%2FJAVA%20%E6%B5%81%E7%A8%8B%E6%8E%A7%E5%88%B6%7C2cf3dd42-eaf3-5d4c-a3e6-4d209abf8f11%2F%29
---

# JAVA 流程控制 (Flow Control)

## if-else

如果 if 或者 else 的语句块只有一个语句，可以省略大括号。

```java
if (boolean 值)
    if 语句块
else
    else 语句块
```

## for Loop

```java
for (初始语句; 循环体条件表达式; 循环体后语句) {
    // for 循环体
}
```

**Enhanced for (for-each):**

```java
for (MerchandiseV2 m : all) {
    if (m.getPurchasePrice() > maxPurchasePrice) {
        maxPurchasePrice = m.getPurchasePrice();
    }
}
```

> 只循环遍历，不赋值，不跳跃访问，不需要知道当前元素是第几个时使用

## 结束循环 (break)

- `break` 语句可以结束循环
- 在求整除程序中使用 break 提前结束循环

## 跳过不符合条件的循环 (continue)

- `continue` 语句可以结束当次循环的执行，开始下一次循环体的执行

## while Loop

```java
while (条件表达式) {
    // while 循环体
}
```

## do-while Loop

- 循环体至少执行一次

```java
do {
    // while 循环体
} while (条件表达式);
```

## switch 语句

```java
switch (用于比较的 int 值) {
    case 目标值1:          // 对应一个 if else
        匹配后可以执行的语句
    case 目标值2:          // 不可以与别的 case 字句重复
        匹配后可以执行的语句
    default:              // 对应最后的 else，可选
        default 语句
}
```
