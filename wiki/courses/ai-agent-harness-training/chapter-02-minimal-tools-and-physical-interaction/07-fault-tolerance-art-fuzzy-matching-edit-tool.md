---
tags: [agent-harness, edit-tool, fuzzy-matching, go, llm-hallucination, tool-design, harness-engineering]
source: https://time.geekbang.org/column/article/970299
---

# Chapter 07: 容错艺术 — 多级模糊匹配的稳健 Edit 工具

## Overview

本讲以 2000 行 `server.go` 中修一个 Bug 的场景开篇：`write_file` 重写全文件消耗巨量 Token 且易截断；`bash` + `sed/awk` 正则在大模型手中翻车率高达 **80%+**。解法是为 LLM 提供专属"外科手术刀"—— `edit_file`（接受 `path / old_text / new_text`）。但大模型有一个顽固缺陷：**缩进幻觉**——输出 `old_text` 时常省略原始缩进，导致精确匹配失败，Agent 无限重试、陷入死循环。本讲在工具底层实现了 L1→L4 四级降级容错管线，同时以"唯一性安全底线"防止模糊匹配误改代码，将 LLM 的格式误差吸收在工具层，对 Agent 层透明。

---

## Key Concepts

### 缩进幻觉（Indentation Hallucination）

LLM 生成 `old_text` 时，为节省字数或受注意力机制限制，常省略代码的原始缩进（如将 8 个空格缩进的代码块输出为无缩进版本）。精确 `strings.Replace` 找不到目标串，Harness 返回 `Error: old_text not found`，Agent 重试仍无缩进，死循环不可自愈。

### 多级模糊匹配链（L1–L4 Degradation Pipeline）

Chain of Responsibility 模式：每级只处理上一级无法覆盖的特定幻觉类型。

| 级别 | 策略 | 解决的幻觉类型 |
|------|------|--------------|
| L1 | `strings.Count == 1` 精确匹配 | — |
| L2 | `\r\n` → `\n` 换行符归一化 | Windows vs Unix 换行差异 |
| L3 | `strings.TrimSpace` 首尾空行去除 | 代码块首尾多余空白行 |
| L4 | 逐行 `TrimSpace` + 滑动窗口匹配 | **缩进差异**（核心容错） |

### 唯一性安全底线

`matchCount > 1` 时：**拒绝替换，原样报错**（"匹配到 N 处，请提供更多上下文"），利用 LLM 的 Self-Correction 能力让模型自行增加上下文后重试。这是防止模糊匹配误改相似代码块的关键约束。

### fuzzyReplace 与 lineByLineReplace

- `fuzzyReplace`：驱动四级降级链的核心函数，任何级别匹配成功则立即返回替换结果。
- `lineByLineReplace`（L4）：将 `content` 和 `oldText` 按行切分，每行 `TrimSpace` 后做滑动窗口匹配，`matchCount == 1` 时替换 `[matchStart:matchEnd]` 行范围，插入 `newText`。

**已知局限**：L4 替换时直接插入 `newText`，不自动补齐基础缩进前缀——若目标块有 12 个空格缩进而 `newText` 只有 4 个，格式会不对齐（思考题）。

### Execute 流程设计

```
ReadFile → fuzzyReplace(originalContent, oldText, newText) → WriteFile
```

报错（如匹配失败、唯一性冲突）**原样返回字符串**而非抛 Go error，保持 Agentic Loop 不中断，让 LLM 看到具体原因后自纠错。

---

## Key Takeaways

- **write_file + bash 的双重瓶颈**：前者 Token 消耗巨大且易截断，后者正则翻车率 80%+；edit_file（old_text→new_text）是正确抽象。
- **缩进幻觉不可靠 LLM 自愈**：必须在工具底层主动容错，而非期待 Agent 每次提供完美格式。
- **四级降级管线**：L1 精确 → L2 CRLF归一化 → L3 TrimSpace → L4 逐行去缩进，每级定向处理一类幻觉。
- **唯一性底线优先于容错**：宁可报错要求更多上下文，也不盲目替换多处相似代码——利用 LLM Self-Correction 比静默猜测更安全。
- **报错语言决定纠错速度**：具体报错（"匹配到 3 处，请增加上下文"）远比模糊 Error 更易被 LLM 理解和修正。

---

## See Also

- [[06-minimal-toolset-yolo-philosophy]] — `edit` 是 4 原语工具集之一，本章补全其实现细节
- [[05-tool-registry-and-dispatch]] — EditFileTool 通过同一 Registry 接口挂载
- [[02-main-loop-react-cycle]] — 唯一性报错在 ReAct 循环的下一 Turn 触发 Self-Correction
- [[fuzzy-edit-tool]] — 多级降级 edit 原语的通用概念卡片
- [[llm-hallucination]] — 缩进幻觉是代码生成场景中 LLM 幻觉的典型表现
- [[agentic-loop-self-correction]] — 错误原样回传如何驱动 LLM 自纠错
- [[harness-engineering]] — 底层工具吸收 LLM 误差是 Harness 工程的核心原则之一
