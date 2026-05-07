---
tags: [agent-harness, edit-tool, fuzzy-matching, go, llm-hallucination, tool-design, harness-engineering]
source: https://time.geekbang.org/column/article/970299
wiki: wiki/courses/ai-agent-harness-training/chapter-02-minimal-tools-and-physical-interaction/07-fault-tolerance-art-fuzzy-matching-edit-tool.md
---
h h h
## Pre-test

*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 为什么不能用 `write_file` 直接让 Agent 修改一个 2000 行文件中的一个 Bug？
2. 大模型在生成 `old_text` 时最常出现什么格式幻觉？为什么会发生？
3. 当模糊匹配命中了代码文件中 3 处相似片段时，工具应该如何处理？

---

## Chapter Metadata
- Course: AI Agent工程化训练营（ai-agent-harness-training）
- Chapter: 007 — 07｜容错艺术：实现支持多级模糊匹配的稳健 Edit 工具
- Author: Tony Bai
- Date: 2026-05-06
- Article ID: 970299

## Cornell Notes

### Cue Column (Questions)
- 为什么 `write_file` 和 `bash` 都不适合做代码局部修改？
- 大模型的"缩进幻觉"是什么？如何触发 Agent 死循环？
- 多级模糊匹配链的 L1–L4 各解决什么问题？
- "唯一性校验"为何是容错安全底线？
- `lineByLineReplace` 的滑动窗口算法逻辑是什么？
- 当 L4 模糊替换时，为什么 newText 缩进可能不正确？

### Notes Column

**为什么需要专属的 edit_file 工具**

代码局部修改有两种朴素方案，都行不通：
- `write_file`：必须重写全部 2000 行，消耗大量 Token，且大模型在长文本生成中易截断或引入新错误。
- `bash`（sed/awk）：需要大模型手写多行正则，包含特殊转义字符时翻车率高达 **80%+**，极易损坏整个文件。

结论：必须在 Harness 底层提供一把"外科手术刀"—— `edit_file` 工具（path + old_text + new_text）。

**缩进幻觉（Indentation Hallucination）**

大模型输出 `old_text` 时，常因节省字数或注意力机制限制，**省略缩进**。原文有 8 个空格的代码块，模型可能返回无缩进版本。

精确 `strings.Replace` 找不到目标串 → 返回 `Error: old_text not found` → Agent 重试，依然无缩进 → **死循环**，任务失败。

**多级模糊匹配链（Chain of Responsibility，L1–L4）**

顶级引擎（Claude Code / OpenClaw）的解法：把容错做进工具底层，吸收大模型误差。

| 级别 | 策略 | 解决的问题 |
|------|------|-----------|
| L1 | 精确匹配（`strings.Count == 1`） | 最快最安全，直接替换 |
| L2 | 换行符归一化（`\r\n` → `\n`） | Windows vs Unix 换行幻觉 |
| L3 | `strings.TrimSpace` 匹配 | 代码块首尾多余空行 |
| L4 | 逐行 TrimSpace 后滑动窗口匹配 | **核心容错**：消除缩进差异 |

**唯一性安全底线**

匹配结果 `> 1` 时：**绝不替换，直接报错**，要求大模型提供更多上下文以精确定位。利用 LLM 强大的 Self-Correction 能力让模型自行纠正。

**Go 实现关键结构**

```go
// 工具定义
func (t *EditFileTool) Definition() schema.ToolDefinition {
    return schema.ToolDefinition{
        Name: "edit_file",
        Description: "对现有文件进行局部的字符串替换...",
        InputSchema: { path, old_text, new_text },
    }
}

// 四级降级算法
func fuzzyReplace(originalContent, oldText, newText string) (string, error) {
    // L1: 精确匹配
    // L2: \r\n → \n 归一化
    // L3: TrimSpace 匹配
    // L4: lineByLineReplace（滑动窗口）
}

// L4: 核心容错
func lineByLineReplace(content, oldText, newText string) (string, error) {
    // 按行切分，每行 TrimSpace 后做滑动窗口匹配
    // matchCount > 1 → 报错要求更多上下文
    // matchCount == 0 → 报错请先 read_file 确认内容
    // matchCount == 1 → 替换 [matchStart:matchEnd] 行范围
}
```

**Execute 流程**：读文件 → `fuzzyReplace` → 写回磁盘。报错原因（如"匹配到 N 处"）原样返回给大模型。

**实战验证**：在 `server.go` 中放置含 4 空格缩进的代码，Agent 输出无缩进 `old_text`，L4 算法无感命中，完美替换。

**遗留问题（思考题）**：L4 替换后，`newText` 的缩进可能与原代码不匹配（基础缩进前缀未对齐）。解法方向：提取匹配块第一行的"基础缩进前缀（Base Indentation）"，自动补齐到 `newText` 每一行前面。

### Summary

本讲以"为什么 write_file 和 bash 都不够用"开场，引出大模型的缩进幻觉问题，随后设计了 L1→L4 四级模糊匹配降级管线：精确匹配→换行符归一化→TrimSpace→逐行去缩进滑动窗口。同时以"匹配到多处必须拒绝"作为唯一性安全底线，将错误信息直接丢回给大模型触发自我纠错。这套容错架构是 Harness 工程的核心哲学：在底层工具中吸收 LLM 的误差，让 Agent 层感知不到"低级错误"的存在。

## Key Takeaways

- **write_file 重写整文件**的代价：LLM 生成 2000 行时易截断且昂贵；`bash` 写正则翻车率高达 80%+。`edit_file`（old_text → new_text 替换）是正确抽象。
- **缩进幻觉是大模型的顽固缺陷**：精确匹配时直接失败会让 Agent 陷入死循环；工具层必须主动容错，而不是把误差暴露给 Agent。
- **四级降级管线**：L1 精确 → L2 CRLF归一化 → L3 TrimSpace → L4 逐行去缩进滑动窗口，每级只处理上一级处理不了的特定幻觉场景。
- **唯一性安全底线不可妥协**：模糊匹配到多处时宁可报错，也不盲目替换，利用 LLM 的 Self-Correction 能力让它提供更多上下文。
- **报错语言决定纠错效率**：将"匹配到 N 处，请提供更多上下文"这类具体报错原样返回，LLM 能立刻理解并改正，比模糊 Error 快得多。
- **L4 的未解缺陷**：基础缩进未自动对齐 newText，是下一步改进方向（提取首匹配行缩进前缀并注入 newText 每行）。

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[EditFileTool]]：go-tiny-claw 第七讲新增工具，接受 `path/old_text/new_text`，内置四级模糊容错，避免 Agent 因格式幻觉死循环。
- [[缩进幻觉]]：LLM 在生成多行代码的 old_text 时，因注意力机制或节省字数省略原始缩进，导致精确匹配失败。
- [[多级模糊匹配链]]：L1 精确 → L2 CRLF归一化 → L3 TrimSpace → L4 逐行去缩进，Chain of Responsibility 模式，每级降级处理一类幻觉。
- [[fuzzyReplace]]：驱动四级降级链的核心函数，返回替换后内容或具体报错原因。
- [[lineByLineReplace]]：L4 级别算法，按行切分 + TrimSpace 后做滑动窗口匹配，唯一性校验后执行替换。
- [[唯一性安全底线]]：matchCount > 1 时拒绝替换并报错，防止模糊匹配误改相似代码块。
- [[Self-Correction]]：LLM 接到具体报错后自我纠错的能力，是 Harness 设计中"报错原样返回"策略的理论依据。
- [[降级管线]]：Degradation Pipeline，在底层工具内吸收 LLM 误差的容错架构模式。

### 2. 课程内导航链接
- [[01-architecture-evolution-from-framework-to-harness|第 01 讲 架构演进：Framework vs Harness]]：建立"工具在 Harness 底层吸收误差"的整体理念，本讲是其具体落地。
- [[02-main-loop-react-cycle|第 02 讲 核心心脏：Main Loop]]：Edit 工具的调用发生在 ReAct 循环的工具执行阶段，唯一性报错会触发下一 Turn 的 Self-Correction。
- [[03-thinking-stage-slow-reasoning|第 03 讲 慢思考与自省]]：本讲测试时**关闭**慢思考，因为代码替换是确定性任务，Thinking Phase 反而增加延迟。
- [[04-provider-interface-claude-openai-adapter|第 04 讲 Provider 接口]]：`edit_file` 通过 Provider 接口兼容不同 LLM，缩进幻觉的严重程度因模型而异。
- [[05-tool-registry-and-dispatch|第 05 讲 Tool Registry 与分发]]：EditFileTool 通过 `registry.Register` 挂载，遵循相同的 `Name/Definition/Execute` 接口。
- [[06-minimal-toolset-yolo-philosophy|第 06 讲 极简工具集法则]]：bash + read/write_file 是极简底层；edit_file 是在此基础上为 LLM 格式缺陷专门添加的"上层容错层"。

### 3. 课程外与通用概念关联
- [[harness-engineering]]：Harness 工程核心原则之一——工具层吸收 LLM 误差，Agent 层不感知低级错误。
- [[chain-of-responsibility]]：经典设计模式，本讲多级匹配链的结构原型。
- [[llm-hallucination]]：缩进幻觉是代码生成场景下 LLM 幻觉的典型表现。
- [[tool-design]]：edit_file 的 JSON Schema 设计（path/old_text/new_text）是 Tool Design 中"最小可用接口"原则的体现。

### 4. 推荐关系边（可直接扩成独立卡片）
- [[EditFileTool]] → implements → [[降级管线]]
- [[fuzzyReplace]] → composed-of → [[lineByLineReplace]]
- [[缩进幻觉]] → prevents → [[精确匹配]]
- [[唯一性安全底线]] → constrains → [[多级模糊匹配链]]
- [[Self-Correction]] → enables → [[唯一性安全底线]]
- [[EditFileTool]] → extends → [[Tool Registry]]
- [[降级管线]] → centers-on → [[缩进幻觉]]

### 5. 后续值得沉淀成卡片的主题
- [[缩进幻觉]]
- [[降级管线]]
- [[唯一性安全底线]]
- [[基础缩进前缀对齐]]

## Notes For Review
- 思考题：如何在 `lineByLineReplace` 中提取匹配块第一行的基础缩进前缀，并自动补齐到 `newText` 每一行？
- 下一讲预告：用 Goroutine + WaitGroup 实现 Main Loop 工具执行的并发化，解决 Parallel Tool Calling 的串行瓶颈。

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 请解释多级模糊匹配链的 L1 到 L4 各处理什么场景，以及"唯一性安全底线"在哪一级生效？
2. 大模型发生"缩进幻觉"后，一个没有容错机制的 Harness 会发生什么？go-tiny-claw 的 edit_file 如何打破这个死循环？
3. `lineByLineReplace` 函数为什么在 matchCount == 1 时仍然存在缩进问题？解法思路是什么？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> L1 精确匹配（`strings.Count == 1` 直接替换）；L2 CRLF→LF 换行符归一化（解决 Windows/Unix 差异）；L3 `TrimSpace` 去首尾空行；L4 按行切分 + 每行 TrimSpace 后滑动窗口匹配（消除缩进差异）。唯一性检验（matchCount > 1 → 报错）在每个级别都生效——L1 通过 `strings.Count`，L4 通过滑动窗口计数，不是仅在某一级。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 无容错时：精确匹配失败 → 返回 `Error: old_text not found` → Agent 在下一 Turn 重试，依然无缩进 → 再次失败 → 死循环，任务永远无法完成。go-tiny-claw 的解法：L4 逐行 TrimSpace 后匹配，在不要求缩进精确的前提下找到目标块；匹配成功则替换，匹配不到则报出"请先 read_file 确认内容"的具体提示，帮助 LLM 自我纠错而非无限重试。
>
> ---
>
> **题目 3 - 引导答案思路：**
> `lineByLineReplace` 在替换时直接插入未处理的 `newText`，而目标块原来可能有 12 个空格的基础缩进，`newText` 只有 4 个空格，结果代码格式错乱。解法：匹配到目标行时，读取第一行的前导空白作为"基础缩进前缀"，然后对 `newText` 按行拆分，在每行前面统一补上该前缀，最后再拼接回文件。
