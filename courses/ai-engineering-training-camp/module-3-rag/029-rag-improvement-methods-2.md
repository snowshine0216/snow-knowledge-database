---
tags: [rag, rag-improvement, llamaindex, index, ai-engineering]
source: https://u.geekbang.org/lesson/818?article=927445
wiki: wiki/concepts/rag-improvement-methods.md
---

## Pre-test

> *阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 在 LlamaIndex 中，`VectorStoreIndex` 的基本作用是什么？你认为"在 index 后面添加新代码"可能指的是哪类扩展操作？
2. RAG 系统中的"节点后处理器（Node Postprocessors）"是什么？它在检索流程的哪个环节发挥作用？
3. 如果你想在现有向量索引之上自定义检索逻辑，你会如何思考这个扩展点的设计？

---

# 029: 提升 RAG 效果的一些方法（二）

**Source:** [7提升 RAG 效果的一些方法2](https://u.geekbang.org/lesson/818?article=927445)

## Outline
- [本节概述](#本节概述)
- [可用内容](#可用内容)

---

## 本节概述

> **注意**：本 transcript 不完整，ASR 仅捕获约 12 行代码演示片段。以下根据可用内容整理。

本节继续"提升 RAG 效果"主题，属于代码实操课。

## 可用内容

根据捕获的 12 行 transcript，本节为代码演示：

```
这个代码就在我的区域里
就在这里
因为这个代码我就不来不及把它去切了
我还要去找那个代码
然后它就就在我们的index
在index后面我们再去加一个新的代码
然后我们就从index里面显示
```

**关键信息**：
- 在 `index` 之后添加新代码，扩展索引功能
- 代码演示模式，讲师在 IDE 中直接展示

**课程标题所涉及的内容**（基于系列上下文推断）：
- 在 LlamaIndex 的 `VectorStoreIndex` 基础上，演示如何扩展或组合不同的索引类型
- 可能涉及：节点后处理器（Node Postprocessors）、自定义检索器等实现

由于 transcript 内容过于简短，无法重建完整技术内容。建议结合 028 的笔记和前序课程的代码示例进行学习。

## Connections
- → [[rag-improvement-methods]]
- → [[rag-architecture]]
- → [[llamaindex-rag]]


---

## Post-test

> *关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 本节课的核心操作模式是什么？讲师如何在 `index` 基础上演示功能扩展？
2. 根据课程系列上下文推断，本节可能涉及哪两类 LlamaIndex 扩展机制？请用自己的话解释它们各自的用途。
3. 本节 transcript 内容不完整对学习有何影响？课程建议你如何补全这部分知识？

> [!example]- Answer Guide
> 
> #### Q1 — 核心操作模式与功能扩展
> 
> 本节为代码演示课，讲师直接在 IDE 中展示，核心操作是在已有 `index` 对象之后追加新代码，以扩展索引功能。
> 
> #### Q2 — 两类 LlamaIndex 扩展机制
> 
> 推断涉及"节点后处理器（Node Postprocessors）"和"自定义检索器"，前者用于对检索结果进行过滤或重排，后者允许定制检索逻辑以超越默认向量相似度搜索。
> 
> #### Q3 — Transcript 不完整的学习影响
> 
> 由于 ASR 仅捕获约 12 行片段，技术细节无法完整重建；课程建议结合 028 笔记和前序课程的代码示例共同学习。
