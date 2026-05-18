---
tags: [claude-code, bun, zig, rust, rewrite, agentic-coding, anthropic, memory-leak, javascript-runtime]
source: https://mp.weixin.qq.com/s/S8KqmMHktGe_jV8osXQwlw
wiki: wiki/claude/bun-rewrite-zig-to-rust-with-claude-code.md
---

# 6 天、96 万行 AI 代码、直接合并：Claude Code 被 Bun 内存泄漏拖垮，Bun 让 Claude 亲手重写了自己

## Article Info
- URL: https://mp.weixin.qq.com/s/S8KqmMHktGe_jV8osXQwlw
- Title: 6 天、96 万行AI代码、直接合并！Claude Code 被 Bun 的内存泄漏拖垮，Bun 让 Claude 亲手重写了自己
- Author: Tina（编译），公众号：AI前线
- Publish time: 2026-05-16
- Access mode: `cookie-authenticated`

## Executive Summary

2026 年 5 月，Bun（JavaScript runtime）创始人 Jarred Sumner 宣布用 Claude Code Agent 在 **6 天内将 96 万行 Zig 代码重写为 Rust**，并在 Linux x64 glibc 环境下通过了现有测试套件的 99.8%，随即直接合并。这次重写的直接导火索是 **Bun 的内存泄漏问题严重影响了 Claude Code 的稳定性**——由于 Anthropic 于 2025 年 12 月收购 Bun 并将其深度嵌入 Claude Code，Bun 的 WebKit Malloc 分配器泄漏导致 Claude Code 主进程 RSS 内存在 3 小时内从 1.7GB 增长到 14GB 以上。围绕这次重写，社区争议焦点集中于：13,000 个 unsafe 调用（对比 uv 的 73 个）、AI 审查 AI 合并的流程可信度，以及这是否标志着"AI 大规模重写软件"时代的到来。

## Outline

1. **事件经过** — 从 Jarred 的一条推文到 96 万行 PR 合并，六天进展时间线
2. **问题根源：Bun 的内存泄漏坑了 Claude Code** — Anthropic 收购 Bun 的背景，以及内存泄漏问题的规模和社区反应
3. **Zig 与 Bun 的哲学决裂** — Zig 社区的 no-AI policy 与 Anthropic AI 编程浪潮的根本冲突
4. **重写争议** — unsafe 调用数量、"vibecoded disaster"批评、流程可信度
5. **AI 重写软件的大趋势** — Cloudflare、Ladybird 等同期案例，Jarred 的预言

## Key Numbers

| 数字 | 含义 |
|---|---|
| 6 天 | Zig→Rust 完整重写耗时 |
| 96 万行 | 涉及的代码行数（变更量）|
| 99.8% | Linux x64 glibc 环境下通过的现有测试套件比例 |
| 4,000 次 | Commit 数量（5 月 7 日时） |
| 3 个 | 合并时仅剩的编译错误数 |
| 13,000 个 | Bun Rust 版本中的 unsafe 调用数量（合并时）|
| 73 个 | uv（对比项目）中的 unsafe 调用数量 |
| ~180 倍 | Bun vs uv 的 unsafe 调用数量差距 |
| 1.7GB → 14GB+ | Claude Code 主进程 3 小时 RSS 内存增长范围 |
| 23GB | 另一 Issue 中 Claude Code 进程 14 小时后的虚拟内存占用 |
| 143.8% | 对应的 CPU 占用（系统完全卡死）|
| 1,700 / 4,700 | Node.js / Bun 各自的 GitHub open issues 数量 |
| 3 周 | Jarred 当年手工移植 esbuild 的时间（对比 6 天）|

## Section Summaries

### 1. 事件经过：六天时间线

**5 月 3 日**：Jarred Sumner 在 GitHub 创建 `claude/phase-a-port` 分支，包含一份 **576 行的 PORTING.md 迁移指南**，把任务拆成 Phase A（逐文件忠实保留 Zig 逻辑，不要求能编译）和 Phase B（逐 crate 解决编译和运行）。文档细到规定：禁止使用 tokio/rayon/hyper/futures、禁止 async fn、unsafe 必须写明 SAFETY 注释、遇到不确定逻辑宁可留 TODO 也不让 AI 猜测。

**5 月 7 日**：涉及约 4,000 次 commit、96 万行代码，仅剩 **3 个编译错误**。Rust 版本已能显示 help menu，bun run 和 package.json scripts 跑起来，意味着 JSON parser、AST、logger、module resolver、文件系统遍历等基础能力都已迁移。

**5 月 9 日**：在 Linux x64 glibc 环境下通过现有测试套件的 **99.8%**。Jarred 在 X 上同时请教 Rust 社区：原 Zig 代码大量使用 tagged pointer 处理 event loop task，迁到 Rust 后如何在不引入额外开销的情况下处理 trait / 函数指针——说明底层架构仍未完全稳定。

**5 月 11 日**：Jarred 发推："如果我们合并 Rust 重写版本，这将是 Zig 的最后一个版本。"六天前他还在 Hacker News 说"这堆代码最后被全部扔掉的概率非常高"。

> 整个讨论有点反应过度了。302 条评论，全都围绕一堆根本还跑不起来的代码。——Jarred Sumner，5 月初在 Hacker News

### 2. 问题根源：Bun 的内存泄漏坑了 Claude Code

**Anthropic 收购背景**：2025 年 12 月，Anthropic 收购 Bun，定义其为"AI 驱动软件工程的重要基础设施"。Claude Code 负责人 Boris Cherney 解释选择 Bun 的理由：**Bun 启动时间约 3 毫秒，而 Python 慢约 15 倍**，对 CLI 工具意味着"丝滑响应"vs"明显卡顿"的差异。

**内存泄漏现实**：
- Issue #33453（Claude Code 仓库）：主进程 RSS 在 3 小时内从 1.7GB → 14GB+，泄漏位于 Bun runtime 的 **WebKit Malloc 分配器**，非用户空间 JavaScript 分配
- Issue #11377：运行 14 小时后，Claude Code 进程占 23GB 虚拟内存、143.8% CPU，系统完全卡死
- Bun v1.1.13（2026 年 4 月）宣称通过更换内存分配器使内存占用下降 5%，但用户反馈不买账

**社区评价**：
- 波兰公司 Rewardo CTO 对比数据：Node.js 约 1,700 个 open issues（"驱动整个互联网"）vs Bun 约 4,700 个 open issues（用户规模远小于 Node.js）
- Reddit 用户 Xtergo："Bun 的路线图看起来更像是在不断叠加新功能，而不是优先解决稳定性和 Bug 修复"

**荒诞闭环**：Claude Code 被 Bun 内存泄漏坑惨 → Anthropic 让 Claude 重写 Bun → 重写后的 Bun 继续支撑 Claude Code

### 3. Zig 与 Bun 的哲学决裂

Bun 曾是 Zig 阵营最成功的明星项目，与使用 C++ 的 Node.js、使用 Rust 的 Deno 形成鲜明对比。但 Bun 团队此前已 fork 过 Zig，引入 LLVM 并行代码生成让 debug 编译速度提升四倍，却无法 upstream 回 Zig 官方。

**根本冲突**：Zig 社区有严格的 **no-AI policy**——禁止 AI 生成 issue、PR 甚至评论。Zig 基金会成员 Loris Cro 认为 LLM 贡献只会制造"幻觉 PR""垃圾噪音"和动辄上万行无法维护的提交。而 Anthropic 恰恰是 AI coding 浪潮最激进的推动者之一，Claude Code 深度依赖 Bun runtime。

结果：一边是 Zig 社区全面封禁 AI 生成代码，另一边是 Bun 团队用 Claude Agent 大规模把 Zig 代码迁移出 Zig。

> 我真的很厌倦为内存泄漏、崩溃和稳定性问题而担忧和花费大量时间进行修复。如果编程语言能提供更强大的工具来预防这些问题，那就太好了。——Jarred Sumner，5 月 9 日

### 4. 重写争议

**unsafe 调用数量对比**（t3.gg 创始人 Theo 提出）：

| 项目 | Rust 代码量 | unsafe 调用数 |
|---|---|---|
| uv | 35 万行 | 73 个 |
| Bun Rust 版（合并时）| 68.1 万行 | >13,000 个（后降低约 2,000）|

Jarred 辩护：Bun 需要与大量底层 C/C++ 代码打交道（文件系统、网络、JavaScript 引擎集成），这种对比不完全公平。他预计 unsafe 会稳定在约 1 万个左右。

**流程批评**：
- 开发者 Aashish Ranjan Singh："UV rust 是真正的开发人员编写，每行代码都经过审查。Bun rust 由 Agents 编写，由 Agents 审核，并由 Agents 批准和合并。"
- 网友 HSVSphere："Bun 简直是一场风格灾难（vibecoded disaster）。"
- 开发者 Anthony GG 猜测 Anthropic 强迫重写，Jarred 亲自否认："没人逼我这么做。"

### 5. AI 重写软件的大趋势

同期案例：
- **Cloudflare**：一周内借助 AI 重新实现 Next.js API 大部分能力
- **Ladybird 浏览器**：两周内将 JavaScript 引擎从 C++ 迁移到 Rust

Jarred 的预言（5 月 3 日推文）：

> 我预计开源软件会走向完全相反的方向——未来甚至可能变成"禁止人类贡献代码"。人类依然会负责讨论问题、决定优先级，但真正写代码、提交 PR、回复和处理反馈、完成实现的工作，最终都会由 LLM 来完成。

- 速度对比：6 天（Claude Agent）vs 3 周（Jarred 当年手工移植 esbuild）
- 核心暴露的问题：缺少人类审查、unsafe 泛滥、"AI 写、AI 审、AI 合"的流程可信度

## Key Takeaways

- **Bun 内存泄漏是这次重写的直接导火索**：Claude Code 主进程因 Bun WebKit Malloc 分配器泄漏，RSS 在 3 小时内从 1.7GB 涨到 14GB+；Anthropic 收购 Bun 后这成了自己的问题，于是用 Claude 重写了 Bun
- **PORTING.md（576 行）是 AI 大规模迁移的关键护栏**：规定禁用的库（tokio/rayon/hyper/futures）、禁止 async fn、unsafe 必须写 SAFETY 注释、不确定逻辑留 TODO 而非让 AI 猜测——这份规格文档决定了 AI Agent 的执行质量
- **99.8% 测试通过是最强的合并理由**，但 13,000 个 unsafe（vs uv 的 73 个）是最大的质量存疑点；Jarred 认为对比不公平（Bun 需要大量 C/C++ 互操作），但"AI 写、AI 审、AI 合"的流程本身缺乏独立人工审查
- **Zig no-AI policy vs Anthropic AI coding 浪潮**：这次重写是两种软件工程哲学的正面碰撞，Zig 社区严格封禁 AI 生成代码，而 Bun 用 Claude 把 Zig 代码迁移出 Zig
- **6 天 vs 3 周**：Claude Agent 完成 96 万行迁移所需的时间，是 Jarred 当年手工移植 esbuild 的 1/3.5——这个速度倍数被认为将改变"我们要重写语言"这类决策的思维框架

## Insights

- **速度上天后，信任成为新瓶颈**：这次重写证明了 AI 能以人类无法企及的速度完成跨语言迁移，但"AI 写、AI 审、AI 合"的闭环让独立验证几乎不存在——测试套件通过率是目前唯一客观锚点，但测试套件本身的覆盖率是否足够没有人审计
- **PORTING.md 规格文档的质量决定 AI 迁移的输出质量**：禁用库列表、unsafe 注释要求、TODO 而非猜测——这些约束越具体，AI Agent 的输出越可预测；粗糙的规格文档将导致漂移（就像 CLAUDE.md 对 Claude Code 会话的作用）
- **Bun 的 4,700 个 open issues（vs Node.js 1,700 个）说明"快速迭代+功能优先"路线在成熟度上的代价**：这次 Rust 重写是否能解决稳定性问题，还是只是把问题换了一层语言，社区将在接下来几个月给出答案

## Caveats

- 文章发于 2026-05-16，PR 合并刚刚发生，Rust 版本在非 Linux 平台（macOS、Windows）的测试通过率未在文章中披露
- 13,000 个 unsafe 调用的质量（是否真的必要的 FFI interop 还是草率的 AI 生成）需要人工 code review 才能判断，目前缺乏独立审计
- Jarred 的"没人逼我这么做"否认了外部压力，但 Anthropic 作为股东的利益一致性（Claude Code 稳定性依赖 Bun）是合理的动机推断

## Sources

- https://mp.weixin.qq.com/s/S8KqmMHktGe_jV8osXQwlw（本文）
- https://x.com/jarredsumonner（Jarred Sumner 的 X 账号）
- https://github.com/oven-sh/bun/commit/46d3bc29f270fa881dd5730ef1549e88407701a5（Rust 重写合并 commit）
- https://github.com/anthropics/claude-code/issues/21965（相关 Issue）
- https://github.com/anthropics/claude-code/issues/11377（内存泄漏 Issue）
