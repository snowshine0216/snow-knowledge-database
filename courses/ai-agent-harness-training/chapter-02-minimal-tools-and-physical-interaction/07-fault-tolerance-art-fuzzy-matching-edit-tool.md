---
tags: [agent-harness, edit-tool, fuzzy-matching, go, llm-hallucination, tool-design, harness-engineering]
source: https://time.geekbang.org/column/article/970299
wiki: wiki/courses/ai-agent-harness-training/chapter-02-minimal-tools-and-physical-interaction/07-fault-tolerance-art-fuzzy-matching-edit-tool.md
---
## Pre-test

*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 为什么不能用 `write_file` 直接让 Agent 修改一个 2000 行文件中的一个 Bug？
2. 大模型在生成 `old_text` 时最常出现什么格式幻觉？它为什么不能被简单归结为 tokenizer 问题？
3. 为什么一个更强的模型或更好的 tokenizer，仍然不能完全替代 Harness 层的容错设计？
4. 当模糊匹配命中了代码文件中 3 处相似片段时，工具应该如何处理？

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
- 大模型的"缩进幻觉"是什么？为什么它本质上是格式保真度问题？
- 为什么不能把缩进幻觉简单归因于 tokenizer？
- 为什么模型升级和 tokenizer 改进都只能缓解问题，不能替代 Harness？
- 缩进幻觉是如何触发 Agent 死循环的？
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

在 `edit_file` 场景里，模型需要把旧代码片段尽可能原样填进 `old_text`。但它经常会出现一种典型失真：**语义保住了，格式没保住**。最常见的就是前导空格、Tab、首尾空行或换行风格被省略，其中又以“缩进丢失”最常见。

一旦 Harness 只支持精确 `strings.Replace`，问题就会立刻暴露：原文有 8 个空格的代码块，模型却返回无缩进版本，工具找不到目标串 → 返回 `Error: old_text not found` → Agent 重试时仍可能提交同样的错误片段 → **死循环**，任务失败。

所以这里的关键结论不是“提示词再写清楚一点就行”，而是：**只要编辑范式仍是字符串替换，Harness 就必须主动吸收这种格式误差。** 更底层的成因，以及为什么这不是单点 tokenizer 问题，放到后面的 Deep Dive 再展开。

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

---

## Deep Dive

> [!info]+ 💡 Explanation - 缩进幻觉为什么顽固存在，以及为什么单靠更强模型还不够
>
> **1. 缩进幻觉到底是什么**
>
> 在 `edit_file` 场景里，模型需要把文件中的一段旧代码原样放进 `old_text`。问题在于：模型经常能保留语义，却保不住格式，尤其是每行前面的空格、Tab、首尾空行和换行风格。最典型的情况就是原文件里明明有 8 个空格缩进，模型返回的 `old_text` 却变成了无缩进版本。
>
> 这不是“模型看不懂代码”，而是“模型把缩进当成了低信息密度的表面细节”。从语义角度看，`if` 块里的两行语句即使去掉前导空格，人类仍能猜到它原本属于哪个代码块；但对字符串替换工具来说，少 1 个空格都意味着匹配失败。
>
> **2. 为什么它会发生：不是单一 tokenizer 问题，而是生成机制的综合结果**
>
> 它和 tokenizer 有关系，但**不是主要由 tokenizer 单独引发的**。更准确地说，它是以下几类因素叠加后的结果：
>
> - **生成目标的偏差**：LLM 的目标是预测“下一个最可能的 token”，而不是保证“每个字符严格复现”。缩进在统计上常被视为可压缩、可忽略的表层模式。
> - **注意力预算有限**：长代码片段里，模型会优先关注函数名、条件、变量、控制流，而不是连续 4 个、8 个、12 个空格这样的弱语义信号。
> - **训练语料的习惯**：互联网上大量代码解释、博客和问答会省略部分缩进或把代码改写成更短的示例，模型因此学会了“语义近似即可”。
> - **tokenizer 只放大，不决定问题**：如果某种 tokenizer 让连续空格的编码更粗糙，问题可能更明显；但即便 tokenizer 能稳定编码缩进，模型在生成时仍然可能选择省略这些 token。
>
> 所以更准确的判断是：**缩进幻觉本质上是生成模型对格式保真度不足的问题，tokenizer 只是影响严重程度，不是根因。**
>
> **3. 它是如何把 Agent 拖进死循环的**
>
> 如果 Harness 只有精确匹配逻辑，死循环通常按下面的路径发生：
>
> 1. Agent 调用 `edit_file(path, old_text, new_text)`。
> 2. `old_text` 因为缩进幻觉少了前导空格。
> 3. 工具执行精确匹配，返回 `old_text not found`。
> 4. Agent 认为自己只是“定位错了”或“上下文不够”，于是重试。
> 5. 由于模型内部表征没有改变，它第二次、第三次仍可能输出同样的无缩进片段。
> 6. Harness 继续精确匹配失败，于是进入 repeated failure loop。
>
> 这里的关键不是“模型笨”，而是**错误反馈太弱**。如果系统只返回一个抽象错误，模型并不会自动意识到“真正的问题是我漏掉了 8 个空格”。这就是为什么很多 Agent 会在 `old_text not found` 和再次提交几乎相同 `old_text` 之间来回打转。
>
> **4. 更强的模型有没有帮助？有，但通常只是缓解，不是根治**
>
> 模型能力提升当然有帮助。更强的模型通常具备：
>
> - 更好的长上下文保持能力；
> - 更强的格式遵循能力；
> - 更高的自我纠错概率；
> - 在 diff、patch、代码编辑任务上的专门微调。
>
> 这些改进会显著降低缩进幻觉的发生率，但很难把它降到工程上可接受的“绝对零”。原因很简单：只要模型输出的是**近似最优 token 序列**，而不是**结构化、可验证的精确编辑动作**，它就始终可能在某次生成里把缩进、换行、引号甚至逗号这种“表面低权重信号”处理错。
>
> **5. tokenizer 改进有没有帮助？也有，但作用通常比模型改进更有限**
>
> 更适合代码的 tokenizer 可以提升缩进、换行和常见语法模式的表达效率，也能减少某些边界切分带来的噪音；但它依然无法保证模型在生成时“必须保留所有空白字符”。
>
> 换句话说：
>
> - **更好的 tokenizer** 可以让模型“更容易学会格式”；
> - **更好的模型/微调** 可以让模型“更经常正确输出格式”；
> - **但 Harness 才能让系统在模型偶尔出错时仍然可靠工作。**
>
> 这是三层不同的问题：表示、生成、系统鲁棒性。前两层可以降噪，最后一层才负责兜底。
>
> **6. 那是不是必须依赖 Harness 工程？在今天的 Agent 系统里，基本是的**
>
> 只要你的编辑接口还是 `old_text -> new_text` 的字符串替换范式，就必须假设模型会偶尔犯格式错误。这个时候，如果没有 Harness 侧的容错设计，系统可靠性会直接绑定在单次生成质量上，整体成功率会很脆弱。
>
> 这也是为什么成熟 Agent 框架不把希望寄托在“模型下一版会更聪明”上，而是把稳定性建在工具层：
>
> - L1 精确匹配处理理想情况；
> - L2/L3 处理换行和首尾空白这类轻度格式偏差；
> - L4 逐行 `TrimSpace` + 滑动窗口处理缩进幻觉；
> - 唯一性校验保证“宁可不改，也不能改错”。
>
> 这就是 Harness 工程的核心观念：**不要求模型永远正确，而要求系统在模型不完全正确时依然可用。**
>
> **7. 未来有没有可能减少对 Harness 的依赖？有，但前提是编辑表示本身升级**
>
> 如果未来系统从字符串替换转向更结构化的编辑方式，例如 AST-level edit、基于语法树的 patch、带位置锚点的 diff schema，缩进幻觉会大幅减弱，因为模型输出的就不再是“逐字符精确复现的 old_text”，而是“对某个结构节点进行修改”的意图。
>
> 但在当前主流 Agent 工作流中，只要还在大量使用字符串匹配式编辑工具，**Harness 的容错层就不是可选优化，而是可靠性的必要组成部分。**

> **8. 为什么一些框架从 unified diff 转向 search-replace blocks**
>
> Aider 发布过专门 benchmark，结论不是 patch 没价值，而是 **unified diff 作为 LLM 的直接输出格式过于脆弱**。问题不只在“改错内容”，更在“补丁语法本身就很容易非法”。常见失败包括：hunk 头行数与正文不一致、上下文行丢失前导空格、行号 off-by-one、context 空白不精确、尾换行标记遗漏，以及 CRLF/LF 混用。这类错误会导致 `git apply` 在真正执行编辑前就直接拒绝补丁。
>
> 这说明 unified diff 给模型额外增加了一层“结构性元数据维护”负担：它不仅要表达改动意图，还要同时正确维护 hunk 行号、行数、前导空格、换行标记等低语义高约束格式。对人类或工具自动生成来说这些约束不是问题，但对 LLM 来说却是高频失败源。相比之下，search-replace blocks 让模型只负责输出“找什么、换成什么”，把定位、模糊匹配、唯一性校验、缩进修复和最终验证重新交还给 Harness。这与本讲的核心原则是一致的：**不要让模型维护本应由工具自动维护的结构性元数据；让模型表达最小必要意图，让工具层负责把事情做稳。**
>
> 因此，更合理的工程分层通常是：LLM 主输出格式优先选择 search-replace blocks；Patch/Unified diff 更适合作为内部中间表示、人类审阅产物，或在模型外由工具自动生成；而真正的可靠性，仍然来自 Harness 的容错、唯一性安全底线、基础缩进对齐和语法验证。

### Summary

本讲以"为什么 write_file 和 bash 都不够用"开场，引出大模型的缩进幻觉问题，随后设计了 L1→L4 四级模糊匹配降级管线：精确匹配→换行符归一化→TrimSpace→逐行去缩进滑动窗口。同时以"匹配到多处必须拒绝"作为唯一性安全底线，将错误信息直接丢回给大模型触发自我纠错。Deep Dive 进一步澄清：缩进幻觉不是单点 tokenizer 缺陷，而是生成目标、注意力分配与训练语料共同作用的结果；更强模型与更好的 tokenizer 只能降低出错概率，真正把系统成功率拉稳的仍是 Harness 底层的容错与约束机制。进一步结合 Aider 的 benchmark 可见：unified diff 对 LLM 额外引入了 hunk 头、前导空格、行号和换行标记等结构性失败面，因此 search-replace blocks 往往比 unified diff 更适合作为模型主输出格式，而 patch 更适合做内部中间表示或审阅产物。

## Key Takeaways

- **write_file 重写整文件**的代价：LLM 生成 2000 行时易截断且昂贵；`bash` 写正则翻车率高达 80%+。`edit_file`（old_text → new_text 替换）是正确抽象。
- **缩进幻觉的本质是“语义保住了，格式没保住”**：模型往往知道要改哪段代码，却会把前导空格、空行或换行风格当成低权重细节省略掉。
- **这不是单一 tokenizer 问题**：tokenizer 会影响严重程度，但根因是生成目标、注意力预算和训练语料共同导致的格式保真度不足。
- **无容错时会触发 Agent 死循环**：`old_text not found` 这种抽象报错不足以让模型意识到自己漏了缩进，于是它会反复提交几乎相同的错误片段。
- **四级降级管线**：L1 精确 → L2 CRLF归一化 → L3 TrimSpace → L4 逐行去缩进滑动窗口，每级只处理上一级处理不了的特定幻觉场景。
- **唯一性安全底线不可妥协**：模糊匹配到多处时宁可报错，也不盲目替换，利用 LLM 的 Self-Correction 能力让它提供更多上下文。
- **报错语言决定纠错效率**：将"匹配到 N 处，请提供更多上下文"这类具体报错原样返回，LLM 能立刻理解并改正，比模糊 Error 快得多。
- **模型升级和 tokenizer 改进只能缓解，不能替代 Harness**：前两者负责降噪，真正负责把系统变可靠的是工具层容错、唯一性校验和错误反馈设计。
- **L4 的未解缺陷**：基础缩进未自动对齐 newText，是下一步改进方向（提取首匹配行缩进前缀并注入 newText 每行）。
- **unified diff 不是最优的 LLM 主输出格式**：Aider 的 benchmark 表明，许多失败不是“改错了内容”，而是 hunk 头、前导空格、行号、尾换行标记和 CRLF/LF 等补丁语法本身不合法；因此 search-replace blocks 更符合 LLM 的能力边界，而 patch 更适合做工具内部或审阅层表示。

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[EditFileTool]]：go-tiny-claw 第七讲新增工具，接受 `path/old_text/new_text`，内置四级模糊容错，避免 Agent 因格式幻觉死循环。
- [[缩进幻觉]]：LLM 在生成多行代码的 old_text 时，因注意力机制或节省字数省略原始缩进，导致精确匹配失败。
- [[格式保真度]]：代码编辑任务中对空格、Tab、换行、空行等表面格式的精确保留能力；语义对了但格式错了，字符串替换依然会失败。
- [[多级模糊匹配链]]：L1 精确 → L2 CRLF归一化 → L3 TrimSpace → L4 逐行去缩进，Chain of Responsibility 模式，每级降级处理一类幻觉。
- [[fuzzyReplace]]：驱动四级降级链的核心函数，返回替换后内容或具体报错原因。
- [[lineByLineReplace]]：L4 级别算法，按行切分 + TrimSpace 后做滑动窗口匹配，唯一性校验后执行替换。
- [[唯一性安全底线]]：matchCount > 1 时拒绝替换并报错，防止模糊匹配误改相似代码块。
- [[Self-Correction]]：LLM 接到具体报错后自我纠错的能力，是 Harness 设计中"报错原样返回"策略的理论依据。
- [[字符串替换式编辑]]：以 `old_text -> new_text` 为中心的编辑范式，实现简单但对格式保真度极其敏感。
- [[错误反馈设计]]：将"old_text not found"、"匹配到 N 处"等失败原因具体返回给模型，以提高下一轮修正成功率的工程设计。
- [[结构化编辑]]：AST-level edit、syntax-aware patch、带位置锚点的 diff schema 等更高层编辑表示，用结构约束替代逐字符匹配。
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
- [[tokenizer]]：影响空格、换行等格式模式的表示效率，但不是缩进幻觉的唯一根因。
- [[格式保真度]]：代码编辑场景里比自然语言生成更关键的质量维度，直接决定字符串匹配是否成立。
- [[字符串替换式编辑]]：当前多数 edit tool 的默认工作模型，简单实用，但天然脆弱。
- [[结构化编辑]]：降低对 `old_text` 精确复现依赖的未来方向，更适合高可靠代码修改。
- [[错误反馈设计]]：决定模型能否把失败原因转化为下一轮有效修正，是 Self-Correction 是否生效的前提。
- [[tool-design]]：edit_file 的 JSON Schema 设计（path/old_text/new_text）是 Tool Design 中"最小可用接口"原则的体现。

### 4. 推荐关系边（可直接扩成独立卡片）
- [[EditFileTool]] → implements → [[降级管线]]
- [[fuzzyReplace]] → composed-of → [[lineByLineReplace]]
- [[缩进幻觉]] → prevents → [[精确匹配]]
- [[缩进幻觉]] → degrades → [[格式保真度]]
- [[tokenizer]] → influences → [[格式保真度]]
- [[字符串替换式编辑]] → depends-on → [[格式保真度]]
- [[唯一性安全底线]] → constrains → [[多级模糊匹配链]]
- [[Self-Correction]] → enables → [[唯一性安全底线]]
- [[错误反馈设计]] → amplifies → [[Self-Correction]]
- [[EditFileTool]] → extends → [[Tool Registry]]
- [[降级管线]] → centers-on → [[缩进幻觉]]
- [[结构化编辑]] → mitigates → [[缩进幻觉]]

### 5. 后续值得沉淀成卡片的主题
- [[缩进幻觉]]
- [[格式保真度]]
- [[降级管线]]
- [[唯一性安全底线]]
- [[字符串替换式编辑]]
- [[结构化编辑]]
- [[错误反馈设计]]
- [[基础缩进前缀对齐]]

## Notes For Review
- 思考题：如何在 `lineByLineReplace` 中提取匹配块第一行的基础缩进前缀，并自动补齐到 `newText` 每一行？
- 下一讲预告：用 Goroutine + WaitGroup 实现 Main Loop 工具执行的并发化，解决 Parallel Tool Calling 的串行瓶颈。

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 请解释多级模糊匹配链的 L1 到 L4 各处理什么场景，以及"唯一性安全底线"在哪一级生效？
2. 什么是"缩进幻觉"？为什么它不应被简单归结为 tokenizer 单点问题？
3. 大模型发生"缩进幻觉"后，一个没有容错机制的 Harness 会发生什么？go-tiny-claw 的 edit_file 如何打破这个死循环？
4. 为什么更强的模型或更好的 tokenizer 只能缓解这个问题，而不能完全替代 Harness 工程？
5. `lineByLineReplace` 函数为什么在 matchCount == 1 时仍然存在缩进问题？解法思路是什么？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> L1 精确匹配（`strings.Count == 1` 直接替换）；L2 CRLF→LF 换行符归一化（解决 Windows/Unix 差异）；L3 `TrimSpace` 去首尾空行；L4 按行切分 + 每行 TrimSpace 后滑动窗口匹配（消除缩进差异）。唯一性检验（matchCount > 1 → 报错）在每个级别都生效——L1 通过 `strings.Count`，L4 通过滑动窗口计数，不是仅在某一级。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 缩进幻觉指的是：模型在生成 `old_text` 这类多行代码片段时，经常保住语义却丢掉前导空格、Tab、首尾空行或换行风格，导致字符串级匹配失败。它和 tokenizer 有关，但不能简化为 tokenizer 缺陷；更根本的原因是 LLM 的生成目标不是逐字符精确复现，加上注意力预算有限、训练语料常把格式细节弱化，最终形成了格式保真度不足。
>
> ---
>
> **题目 3 - 引导答案思路：**
> 无容错时：精确匹配失败 → 返回 `Error: old_text not found` → Agent 在下一 Turn 重试，依然无缩进 → 再次失败 → 死循环，任务永远无法完成。go-tiny-claw 的解法：L4 逐行 TrimSpace 后匹配，在不要求缩进精确的前提下找到目标块；匹配成功则替换，匹配不到则报出"请先 read_file 确认内容"的具体提示，帮助 LLM 自我纠错而非无限重试。
>
> ---
>
> **题目 4 - 引导答案思路：**
> 更强模型会提升长上下文保持、格式遵循和自我纠错能力，更好的 tokenizer 也会改善代码格式模式的表达效率，但两者都只能降低出错概率，不能保证 100% 精确编辑。因为只要输出仍是近似最优 token 序列而不是结构化、可验证的编辑动作，格式细节就仍可能出错。所以可靠性必须由 Harness 兜底，用多级匹配、唯一性校验和明确报错把系统拉稳。
>
> ---
>
> **题目 5 - 引导答案思路：**
> `lineByLineReplace` 在替换时直接插入未处理的 `newText`，而目标块原来可能有 12 个空格的基础缩进，`newText` 只有 4 个空格，结果代码格式错乱。解法：匹配到目标行时，读取第一行的前导空白作为"基础缩进前缀"，然后对 `newText` 按行拆分，在每行前面统一补上该前缀，最后再拼接回文件。
