---
tags: [claude-code, legacy-code, ai-reliability, three-layer-control, software-engineering, harness-engineering]
source: https://time.geekbang.org/column/article/974663
---
# 理解、约束、验证：让 AI 可信的三层控制

来自课程《Claude Code 企业级老项目改造实战》第 03 讲（作者：Robert）。本讲提炼了人机协作中让 AI 可信的核心方法论骨架：三层控制——理解、约束、验证。

## Key Concepts

- **三层控制（Three-Layer Control）**：整门课方法论骨架，由理解层、约束层、验证层组成，依次解决"AI 看不见完整项目"、"AI 自作主张"、"AI 产出不可信"三个核心问题。
- **理解层**：把代码里找不到的项目知识（隐性约定、架构全景、风险地带）整理成 `ARCHITECTURE.md` 和 `CLAUDE.md`，让 AI 在每次会话时自动加载完整上下文。不做这步，后面两层都是空中楼阁。
- **约束层（Harness Engineering）**：两种形式——静态约束（写进 `CLAUDE.md`/`SKILL.md`，写一次长期复用，例如"只动你要改的文件，不要顺手重构其他文件"）+ 动态约束（每次提示词里的即时指令，例如"有不确定的地方停下来问我，不要猜"）。Anthropic 官方称之为 **Harness Engineering（马具工程）**。
- **验证层**：独立于 AI 产出的安全网，包含四类工具：改造前写集成测试锁住当前行为、Characterization Test 记录老代码"实际做什么"的基线、从攻击者视角独立 review、curl 核对接口改前改后响应。验证是**动手前就建好的安全网**，不是事后补票。
- **Characterization Test**：测试代码"现在实际做什么"而非"应该做什么"——把老代码放进测试框架，写一条已知会失败的断言，让失败告诉你真实行为，再把断言改成和真实行为一致。不保证代码"正确"，只保证改前改后行为一致，是应对老项目不确定性的核心验证工具。
- **三层正循环**：理解决定约束（模块关系清楚了才能写"这模块不能依赖那模块"的规则）→ 约束决定验证（约束里写了"响应格式不能变"，验证才会关注格式）→ 验证反哺理解（验证暴露边角场景问题 → 回补到 CLAUDE.md）。转几圈后 AI 从"看起来能用"变成"真的可信"。

## Key Takeaways

- 三层不是顺序流程，是每次人机协作时同时在转的骨架。回答 AI 一句问题、在提示词里加一条指令、补一个测试 case，都是在同时给三层添砖加瓦。
- 稳定用 AI 的工程师每次协作都在给三层投资；混乱用 AI 的工程师每次从零开始，用完就扔。
- CLAUDE.md 同时承担理解层（架构全景、隐性约定）和静态约束层（行为规则）的作用，是老项目改造最重要的单一文件。
- Characterization Test 出自 Michael Feathers 2004 年著作，在 AI 时代重新成为刚需，因为 AI 改代码速度远超人工 review 速度，必须有机械的、可回归的行为基线。
- "AI 产出看起来没问题"不等于能用——AI 生成代码的能力强，但对代码正确性的判断能力弱，边界条件和并发场景很容易漏掉。

## Key Numbers / Quick Facts

| 工具 | 用途 |
|---|---|
| `ARCHITECTURE.md` | 项目架构全景（理解层产出） |
| `CLAUDE.md` | 项目级上下文 + 静态约束规则（理解层 + 约束层） |
| `SKILL.md` | 专项技能文件，固化特定改造流程的静态约束 |
| Characterization Test | 老代码行为基线锁定（验证层核心工具） |

## See Also

- [[claude-code-best-practice]]
- [[harness-engineering]]
- [[working-effectively-with-legacy-code]]
- [[001-legacy-project-handoff-and-delivery-true-workflow]]
