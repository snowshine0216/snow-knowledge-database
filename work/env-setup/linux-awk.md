---
tags: [env-setup, linux, awk, shell, text-processing]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Environemnt%20Setup.one%7C2bfde96d-9f56-6047-9368-2a88190c24b7%2FLinux%20-%20awk%7C9d4e0c20-960e-5d4b-b9b3-d78d3f69c7a5%2F%29
---

# Linux - awk

## 1. 字段引用和分离

- 记录: 每行
- 字段: 使用空格和制表符分隔开的单词
- 可以自己制定分隔的字段

## 2. 引用

```bash
# $1 $2 ... $n 表示每一个字段
awk '{print $1, $2, $3}' filename

# 使用 -F 改变字段分隔符
awk -F ',' '{print $1, $2, $3}' filename

# 分隔符可以使用正则表达式
# 输出以menu开头的整行
awk '/^menu/ {print $0}' /boot/grub2/grub.cfg

# 输出以单引号为分隔符的第二个字段
awk -F '"' '/^menu/ {print $2}' /boot/grub2/grub.cfg

# 输出带序号
awk -F '"' '/^menu/ {print x++,$2}' /boot/grub2/grub.cfg
```

## 3. 表达式

### 赋值操作符

```awk
var1 = "name"
var2 = "hello world"
var3 = $1       # 第一个字段
# Also: ++, --, +=, -=, *=, /=, %=, ^=
```

### 算数操作符

```
+ - * / % ^
```

### 系统变量

```bash
# FS/OFS: 输入/输出字段分隔符
head -5 /etc/passwd | awk -F ":" '{print $1}'
head -5 /etc/passwd | awk 'BEGIN{FS=":"} {print $1, $2}'
head -5 /etc/passwd | awk 'BEGIN{FS=":"; OFS="-"} {print $1,$2}'

# RS: 记录分隔符
head -5 /etc/passwd | awk 'BEGIN{RS=";"} {print $0}'

# NR/FNR: 行数
head -5 /etc/passwd | awk '{print NR, $0}'
awk '{print FNR, $0}' /etc/hosts /etc/hosts

# NF: 字段数量，$NF = 最后一个字段
head -5 /etc/passwd | awk 'BEGIN{FS=":"}{print NF}'
head -5 /etc/passwd | awk 'BEGIN{FS=":"}{print $NF}'
```

### 关系操作符

```
< <> <= >= == != ~ (匹配正则表达式) !~
```

### 布尔操作符

```
&& || !
```

## 4. 判断和循环

```bash
# if
awk '{if($2>=80) print $1}' b.txt
awk '{if($2>=80) {print $1; print $2}}' b.txt

# while
# while(表达式) awk 语句

# do-while
# do{awk 语句} while (表达式)

# for
head -1 b.txt | awk '{for(c=2;c<=NF;c++) print $c}'
```
