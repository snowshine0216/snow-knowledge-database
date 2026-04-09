---
tags: [claude-code, token-optimization, caveman, codex, prompt-compression]
source: https://zhuanlan.zhihu.com/p/2025171957528698973
---

# 省Token神器Caveman

一个名为 **caveman（山顶洞人）** 的GitHub项目在短短3天内获得4.1K星。由19岁开发者Julius Brussee创建的插件专为Claude Code/Codex设计，旨在让AI"像山顶洞人一样说话"——即言简意赅地表达。

## 核心原理

"啰嗦并不总是更好，有时字数少=更正确"。通过减少不必要的自然语言表述，在完全保留技术准确性的前提下，大幅减少输出Token的使用。

## 性能数据

- **输出Token节省：** 初步测试显示约75%的压缩率
- **实际测试范围：** 10个真实任务的Token节省幅度为22%-87%，平均达65%
- **配套工具：** 可压缩用户记忆文件，每次会话输入Token减少约45%
- **学术支持：** 2025年3月论文显示，简洁性约束使大模型准确率提升26个百分点

## 压缩模式

- **Lite模式：** 删除客套话，保留基本语法
- **Full模式：** 标准版，省略冠词，关键词片段表达
- **Ultra模式：** 极致压缩，能省则省

## 保留内容

代码块、URL、文件路径、命令、标题、表格、日期、版本号等技术内容完全保持原样，仅压缩自然语言文本。

## 开发者背景

Julius Brussee，19岁，莱顿大学一年级学生（数据科学与AI专业）。创办过Revu Labs、Stacklink、Pitchr等公司。

## 安装方式

```
npx skills add JuliusBrussee/caveman
```

## 社区反馈

项目引发讨论，部分批评指出仅影响输出Token，思考Token不受影响。作者回应称"降本只是附带好处"，承诺进行更精确的基准测试。
