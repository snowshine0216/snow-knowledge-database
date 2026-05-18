---
tags: [claude-code, bun, zig, rust, rewrite, agentic-coding, anthropic, memory-leak, javascript-runtime]
source: https://mp.weixin.qq.com/s/S8KqmMHktGe_jV8osXQwlw
---

# Bun：Claude Code 驱动的 6 天 Zig→Rust 重写

2026 年 5 月，Bun 创始人 Jarred Sumner 用 Claude Code Agent 在 **6 天内将 96 万行 Zig 代码重写为 Rust**，并在 Linux x64 glibc 环境下通过现有测试套件的 **99.8%**，随即直接合并。直接导火索是：Bun 的 WebKit Malloc 分配器内存泄漏导致 Claude Code 主进程 RSS 在 3 小时内从 1.7GB 涨到 14GB+，而 Anthropic 于 2025 年 12 月收购 Bun 后，这成了 Anthropic 自己的稳定性问题。

## Key Concepts

- **PORTING.md（576 行）是 AI 大规模迁移的关键护栏**：规定禁用库（tokio/rayon/hyper/futures）、禁止 async fn、unsafe 必须写 SAFETY 注释、不确定逻辑留 TODO 而非让 AI 猜测。Phase A（逐文件忠实翻译，不要求编译）→ Phase B（逐 crate 解决编译和运行）的两阶段拆分让任务变得可执行。

- **99.8% 测试通过 vs 13,000 个 unsafe**：合并时 Linux 平台 99.8% 测试通过是最强合并理由，但 13,000 个 unsafe 调用（对比 uv 的 73 个，差约 180 倍）是最大质量存疑点。Jarred 辩护：Bun 需要大量 C/C++ FFI 互操作，这种对比不完全公平。

- **Zig no-AI policy vs Anthropic AI 浪潮的哲学碰撞**：Zig 社区严格封禁 AI 生成代码（Loris Cro 认为 LLM 贡献产生"幻觉 PR"和"无法维护的万行提交"），而 Bun 团队用 Claude Agent 把 Zig 代码大规模迁移出 Zig——两种软件工程哲学的正面碰撞。

- **Bun 内存泄漏的规模**：Issue #33453 记录 3 小时内 RSS 从 1.7GB → 14GB+；Issue #11377 记录 14 小时后 23GB 虚拟内存 + 143.8% CPU（系统卡死）。Bun 在此期间 GitHub open issues 约 4,700 个，而 Node.js 仅约 1,700 个。

- **"AI 写、AI 审、AI 合"的流程争议**：社区批评者指出此次重写缺乏独立人工代码审查，"vibecoded disaster"成为关键词；Jarred 否认 Anthropic 施压，称决策完全自主。

- **速度对比**：6 天（Claude Agent，96 万行）vs 3 周（Jarred 当年手工移植 esbuild）——速度提升 3.5 倍左右，但缺少独立审查。

## Key Takeaways

- 规格文档（PORTING.md）的约束细节直接决定 AI Agent 输出质量：禁用库列表 + 注释规范 + TODO 原则 = 可预测的迁移结果
- 测试套件通过率是"AI 大规模重写"目前唯一客观质量锚点，但测试覆盖率本身是否足够没有人审计
- Jarred 的预言："未来开源软件可能变成'禁止人类贡献代码'——人类负责讨论优先级，LLM 负责写代码、提 PR、处理反馈"

## See Also

- [[anthropic-ai-native-startup-playbook]]
- [[claude-code-academic-research-pipeline]]
