---
tags: [claude-code, legacy-project, environment-setup, testing, characterization-test, ci-cd, ai-engineering, prompt-engineering]
source: https://time.geekbang.org/column/article/978235
wiki: wiki/claude/003-build-safety-net-tests-characterization-test-to-lock-behavior.md
---

## Pre-test

*阅读前尝试回答以下问题。答错完全正确——预测试能让大脑在接触正确答案时编码得更深。*

1. 把第 13-15 讲的所有步骤压成一条"一键全跑"提示词，最重要的关键约束是哪几条？为什么不能省略？
2. 整套护栏建立完成后，项目中应该增加哪些文件？按类型分别列举。
3. 为什么"让 Claude Code 自主推进"的提示词里，要专门把"测试断言凭实际不凭应该"单独列出来？

---

## Chapter Metadata
- Course: Claude Code 企业级老项目改造实战
- Chapter: 016 — 16｜实操课：给一个老项目建立完整改造前护栏的全流程演示
- Author: Robert
- Article ID: 978235

## Cornell Notes

### Cue Column (Questions)
- 四个场景分别是什么？各自产出什么？
- "一键全跑"提示词里，哪几条约束必须硬编进去？
- 为什么一键提示词里"测试断言凭实际不凭应该"要单独列出？
- 自主原则是什么？AI 不确定时该怎么处理？
- 第三部分结束后，项目中应有哪些资产？分哪几类？

### Notes Column

**实操课定位**

本讲把第 13-15 讲的所有提示词在 Spring AI Alibaba Admin 上串起来完整跑一遍。这是一节视频演示课，提示词都在文中，可以打开 Claude Code 照着跑。

**四个场景**

| 场景 | 对应讲次 | 核心产出 |
|---|---|---|
| 让 AI 当你的环境工程师 | 第 13 讲 | `env-checklist.md`、安装脚本、启停脚本、`startup-log.md`、`smoke-test-result.md` |
| 摸清测试现状 | 第 14 讲 | `critical-paths.md`、`test-status.md`、`test-gaps.md` |
| 补出兜底测试 | 第 15 讲 | `test-plan.md`、每批补出的 P0 测试 |
| 让 CI 当你的兜底护栏 | 第 15 讲后半 | `.github/workflows/test.yml` |

**一键全跑：让 Claude Code 自主执行**

四个场景一个个跑是为了理解每一步。真正上手后可以把所有步骤压成一条提示词，让 Claude Code 自主跑完——"粘贴完等 Claude Code 自己跑，你去吃个午饭，回来就齐了"（预计 1-2 小时）。

一键提示词的核心设计原则：

**必须硬编进去的约束**：
1. `每批 1-3 个（最好 1 个）`：防止 AI 贪快批量补，破坏可信性
2. `自主修复原则（连续 3 次同错才停）`：防死循环，同时给 AI 足够自主空间
3. `测试断言凭实际不凭应该`：这是 Characterization Test 的灵魂，AI 默认按业务直觉补断言，这条必须显式禁止
4. `所有步骤跑完生成 summary.md`：把"AI 不确定的地方"集中暴露，特别是测试断言的可信度

**自主原则的设计**：有判断不清的地方，AI 先做合理选择并在 summary 里标记，而非打断用户来问。只有连续 3 次同一错误才停下汇报。

**最终项目结构**

第三部分跑完，spring-ai-alibaba-admin 中新增：

```
.claude/skills/
  docs-auto-sync/SKILL.md        ← 第 11 讲
  env-bootstrap/SKILL.md         ← 第 13 讲新增

.github/workflows/
  test.yml                       ← CI 护栏

scripts/
  install-deps.sh                ← 一次性安装
  install-log.md                 ← 安装踩坑日志
  deps-start.sh                  ← 每天用
  deps-stop.sh                   ← 每天用
  deps-status.sh                 ← 每天用

docker-compose.dev.yml           ← Docker 备选

docs/
  env-checklist.md               ← 第 13 讲
  startup-log.md                 ← 第 13 讲
  smoke-test-result.md           ← 第 13 讲
  setup-guide.md                 ← 第 13 讲
  critical-paths.md              ← 第 14 讲
  test-status.md                 ← 第 14 讲
  test-gaps.md                   ← 第 14 讲
  test-plan.md                   ← 第 15 讲

src/test/                        ← P0 测试已补
```

**第三部分总结**

第二部分 + 第三部分合起来一句话：**理解了项目（脑图）→ 跑通了项目（环境）→ 护住了项目（测试 + CI）**。三件事做完，才有资格谈改造。

第四部分将正式开始真实需求改造——从一个模糊的业务需求出发，让 AI 拆出可直接指导开发的技术文档。

**关键提示词节选（一键全跑版）**

一键提示词整体结构：第一步环境搭建 → 第二步测试摸底 → 第三步补 P0 测试 → 第四步 CI 集成。自主原则贯穿全程，summary.md 汇总不确定点，特别标出"测试是否都凭实际行为写的"。

### Summary

本讲是第三部分的收尾实操课，把第 13-15 讲的所有提示词在真实项目上串联跑完。四个场景依次产出环境资产、测试现状文档、兜底测试、CI 护栏。一键全跑版提示词的核心约束（每批 1-3 个、3 次兜底、凭实际写断言、summary 汇总不确定点）缺一不可。第三部分结束标志：项目有 14 份 docs/ 资产、5 份 scripts/、1 份 CI workflow、2 个 SKILL——每次 push 触发 CI，改造前准备工作全部就位。

## Key Takeaways

- **四场景顺序不能乱**：环境搭建 → 测试摸底 → 补测试 → CI 集成，后一场景依赖前一场景的产出（`test-gaps.md` 是补测试的输入，`docker-compose.dev.yml` 是 CI 中间件启动的依据）。
- **一键提示词必须硬编约束**：AI 执行长流程会"贪快"——不写"每批 1-3 个"，AI 一口气补 20 个；不写"3 次兜底"，AI 死循环；不写"凭实际写断言"，AI 用业务直觉瞎补。
- **summary.md 是人工 review 的聚焦点**：让 AI 把所有不确定的决策集中在最后汇报，而非边跑边打断，特别是测试断言可信度。
- **第三部分结束 = 改造前护栏就位**：2 个 SKILL + CI 护栏 + 14 份 docs/ + 5 份 scripts/ ——每次 push 自动测试，第四部分可以安全开始动手改造。
- **全部提示词拿来即用**：第三部分的所有提示词改改项目名就能在任何老项目跑，这是本部分的最高设计目标。

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[一键全跑提示词]]：把第 13-15 讲四个场景压成一条提示词，包含所有关键约束（每批 1-3 个、3 次兜底、凭实际写断言）
- [[summary-md]]：一键全跑完成后生成的汇总文件，集中暴露 AI 判断不确定的地方，特别标出测试断言可信度
- [[改造前护栏]]：第三部分完成的最终状态——2 个 SKILL + CI 护栏 + 14 份 docs/ + 5 份 scripts/，每次 push 自动测试
- [[四场景串联]]：环境搭建（13讲）→ 测试摸底（14讲）→ 补测试（15讲）→ CI集成（15讲后半）的完整顺序

### 2. 课程内导航链接
- [[001-let-ai-be-your-environment-engineer|第 13 讲 让 AI 当你的环境工程师]]：场景一，产出环境资产和 env-bootstrap SKILL
- [[002-understand-existing-tests-runnable-and-coverage|第 14 讲 摸清现有测试]]：场景二，产出 critical-paths/test-status/test-gaps 三份文档
- [[003-build-safety-net-tests-characterization-test-to-lock-behavior|第 15 讲 补出兜底测试]]：场景三+四，补 P0 测试并配 CI 护栏
- [[005-industry-landscape-2026-ai-legacy-code-academic-engineering|第 05 讲 业界全景]]：第三部分方法论的理论根基（验证债、Characterization Test）

### 3. 课程外与通用概念关联
- [[prompt-engineering]]：一键提示词的约束设计是高阶提示词工程范例——硬编约束、自主原则、汇报节点三要素
- [[ci-cd]]：CI 护栏作为长期自动化执行层，是本讲四个场景的最终收口

### 4. 推荐关系边
- [[一键全跑提示词]] → composed-of → [[四场景串联]]
- [[改造前护栏]] → composed-of → [[CI护栏]]
- [[summary-md]] → protects → [[AI断言偏差]]
- [[四场景串联]] → enables → [[改造前护栏]]

### 5. 后续值得沉淀成卡片的主题
- [[一键全跑提示词]]
- [[改造前护栏]]
- [[summary-md]]

## Notes For Review
- "1-2 小时"是一键全跑的预估时间（环境搭建快、补测试慢，主要耗时在补测试和等 mvn 编译）
- 第四部分将开始真实需求改造：从模糊业务需求 → AI 拆出技术文档 → 逐步实现

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 四个场景之间存在依赖关系，能不能调换顺序？举一个具体的依赖关系为例。
2. 一键全跑提示词里必须硬编哪四条约束？每条防止什么问题？
3. 第三部分结束后，项目中应有多少份 docs/ 资产？列举其中第 13-15 讲新增的部分。

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> 不能调换顺序，存在明确依赖链。具体例子：①补测试（场景三）依赖测试摸底（场景二）产出的 `test-gaps.md`，没有 `test-gaps.md` 就不知道 P0 要补什么。②CI 集成（场景四）依赖 `docker-compose.dev.yml`（场景一产出），CI workflow 需要用它启动中间件跑集成测试。③测试摸底的 `mvn test`（场景二 Step 3）需要环境跑通（场景一），否则跑不起来。
>
> ---
>
> **题目 2 - 引导答案思路：**
> ①`每批 1-3 个（最好 1 个）`——防止 AI 一次性补 20 个，失败的无法判断对错，整批不可信。②`自主修复原则（连续 3 次同错才停下汇报）`——防止 AI 陷入死循环，同时给 AI 足够空间自主排错不打断用户。③`测试断言凭实际不凭应该`——防止 AI 用业务直觉写断言，导致断言一跑就失败被误判为代码 bug。④`所有步骤跑完生成 summary.md`——把 AI 判断不确定的地方集中暴露，让人工 review 聚焦而非边跑边打断。
>
> ---
>
> **题目 3 - 引导答案思路：**
> docs/ 共 14 份资产（包含第 08-09 讲的 5 份原有资产）。第 13-15 讲新增 9 份：`env-checklist.md`（13讲）、`startup-log.md`（13讲）、`smoke-test-result.md`（13讲）、`setup-guide.md`（13讲）、`critical-paths.md`（14讲）、`test-status.md`（14讲）、`test-gaps.md`（14讲）、`test-plan.md`（15讲）。另有 scripts/ 5 份脚本、CI workflow 1 份、2 个 SKILL 新增。
