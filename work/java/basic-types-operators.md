---
tags: [java, data-types, operators, bit-operations, type-conversion]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Java.one%7C98555e3c-6c70-2949-830f-bb86b4aea500%2FJava%20%E5%9F%BA%E6%9C%AC%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B%E5%92%8C%E8%BF%90%E7%AE%97%E7%AC%A6%7C2a693dfd-87a7-f243-b62e-eda4f16c37ee%2F%29
---

# Java 基本数据类型和运算符 (Basic Data Types and Operators)

## Bits and Bytes

- 一个二进制的位叫做一个 bit；网络带宽中的单位都是 bit
- 八个二进制的位组成一个 byte；硬盘等存储的单位都是 byte
- byte 是计算机中最基本的衡量存储的单位，对外使用时不用 bit 划分存储

## Primitive Types

| Type | Size | Range |
|---|---|---|
| `byte` | 1 byte | -128 ~ 127 |
| `short` | 2 bytes | -32768 ~ 32767 |
| `int` | 4 bytes | -2147483648 ~ 2147483647 (default integer) |
| `long` | 8 bytes | -9223372036854774808 ~ 9223372036854774807 |
| `float` | 4 bytes | ±3.4×10³⁸ (single precision) |
| `double` | 8 bytes | double the precision of float (default float) |
| `boolean` | 1 byte | true / false |
| `char` | 2 bytes | unsigned Unicode character |

## Operator Precedence

```
()
!
*, /, %
+, -
>, >=, <, <=
==
!=
&, &&, |, ||
=
```

## Bit Shift Operators

- `>>` : 符号位不动，其余位右移，正数补0，负数补1（带符号右移）
- `>>>` : 符号位一起右移，左边补0（无符号右移）
- `<<` : 左移，右边补0
- `>>` 右移 = 除以2；`<<` 左移 = 乘以2

取模运算符：`%`（取余数）

## Automatic Type Conversion

- 自动类型转换：不会出现问题的类型转换（低精度 → 高精度）
- 可发生在算数运算和赋值
- **数值精度顺序：** `double > float > long > int > short > byte`
- `char` 可以转换为 `int`，但不能转为 `short`（因为 char 是无符号数，值域超出 short）

## Increment Operators

- `a++` → 先用 a 的值，再自增
- `++a` → 先自增，再给 a 赋值
