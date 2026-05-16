---
tags: [claude-code, legacy-project, testing, characterization-test, ci-cd, ai-engineering, tdd]
source: https://time.geekbang.org/column/article/978185
wiki: wiki/claude/003-build-safety-net-tests-characterization-test-to-lock-behavior.md
---

## Pre-test

*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. "Characterization Test"和普通单元测试的本质区别是什么？
2. 为什么不应该让 AI 一次性补 20 个测试？正确的节奏应该是多少？
3. CI 的价值为什么在 AI 时代被特别强调？

---

## Chapter Metadata
- Course: Claude Code 企业级老项目改造实战
- Chapter: 015 — 15｜补出一套兜底测试：让 AI 用 Characterization Test 锁住行为
- Author: Robert
- Article ID: 978185

## Cornell Notes

### Cue Column (Questions)
- 为什么老项目以前没人补测试，现在有解了？
- "该不该补"的判断标准是什么？哪三种情况必须补？
- 四个优先级如何排序？"简单 CRUD 的单元测试"排几？
- Characterization Test 的核心思想是什么？为什么叫"反直觉"？
- 两步补测试法：AI 出计划和 AI 一批一批补，各自的约束是什么？
- CI 为什么是"长期复利"？三个理由是什么？
- AI 写测试断言的最危险隐性偏差是什么？如何防止？

### Notes Column

**为什么以前没人补，现在能补了**

老项目测试匮乏是常态：不是工程师不想补，是成本太高——一个 controller 写一组测试要半天，整个项目补完一个月不够。**AI 改变了成本结构**：AI 写一组测试是分钟级，能基于现有代码反推预期行为、能跑测试看失败、能自动调整。但 AI 也会默认"大而全"——还需要控制范围和节奏。

**该不该补：三种必须补的情况**

1. 即将动手改造的接口或链路目前没测试（改完没法验证有没有改坏）
2. 改造涉及核心业务逻辑（计费、权限、数据写入）
3. 改造范围大到无法通过人工复审全覆盖

可以暂时不补的情况：改动非常小（改 log 输出、改文案）、代码已被高质量集成测试覆盖、项目即将下线或重写。

判断核心：**"够用就停"**（第 04 讲心法）——老项目改造的目标不是 80% 覆盖率，是改造路径上的关键节点都有兜底。

**优先级排序（从高到低）**

1. **改造路径上的 Characterization Test**（最高优先级）：即将改什么，就先给它加 Characterization Test 锁住当前行为。
2. **核心数据写入的集成测试**：登录、Prompt 创建、Dataset 写入这类完整链路，集成测试比单元测试值钱——HTTP → Service → DB 一条集成测试兜底顶十个单元测试。
3. **业务逻辑复杂的单元测试**：算分、状态流转、权限校验等纯逻辑，分支多，集成测试不好覆盖所有分支。
4. **简单 CRUD 的单元测试（可不补）**：getter/setter、简单 SELECT，AI 改错概率本来就低，性价比最差。

**Characterization Test：反直觉的锁行为法**

来自 Michael Feathers《Working Effectively with Legacy Code》：

- **普通测试**：测代码"应该做什么"（基于业务设计意图写断言）
- **Characterization Test**：锁住代码"**现在实际做什么**"（先跑代码记录实际行为，再把行为转成断言）

为什么老项目特别有用：老项目的"应该做什么"经常没人说得清，但"现在实际做什么"是确定的。锁住"现在"，改造后只要行为没变就放心。

**提示词关键句**：`不要凭"应该是什么"写断言，凭"实际是什么"写。`

**两步走补测试**

**Step 1 — AI 出补测试计划（产出 docs/test-plan.md）**

提示词约束：基于 `test-gaps.md` 的 P0 缺口，每批 **1-3 个**（最好 1 个），按"Characterization > 核心链路集成 > 复杂逻辑单元"的顺序排批次，简单 CRUD 不进计划。

**Step 2 — AI 一批一批补**

提示词约束：按 `test-plan.md` 第 1 批执行，Characterization Test 必须"先跑代码记录实际行为，再把行为转成断言"，集成测试用 `SpringBootTest` 起完整 context，补完跑 `mvn test` 确保都通过。

**Review 最关键的检查**：断言是不是基于"实际是什么"而非"AI 觉得应该是什么"。AI 常用业务直觉补断言（读完代码猜业务意图，按"应该"写断言），老项目里这些断言一跑就失败——让你以为代码有 bug，实际是测试错了。

每批 review 通过再开下一批，从第 2 批起参考前一批的测试风格保持一致。

**最大的坑：不要让 AI 一口气补**

让 AI 一次性补 20 个测试，跑下来一半失败一半通过——无法判断哪些测试是对的、哪些是 AI 瞎写的。整批不可信，等于白做。

正确节奏：**每批 1-3 个，跑通 review 通过再下一批**。慢，但每批都是可信资产。

**配 CI：测试不持续跑等于白补**

三个理由说明 AI 时代 CI 价值特别高：

1. **CI 配置高度标准化**：触发条件、JDK 版本、`mvn test`、测试报告——AI 写这种标准配置文件特别准，30 秒搞定你自己查文档查半天的工作。
2. **CI 是长期复利**：花 30 分钟让 AI 写好 CI 配置，未来每次 push/PR 自动跑一遍——一年下来运行上千次，一次性投入换永久自动检查。
3. **强制比自觉可靠十倍**：deadline 紧时自觉跑测试是第一个被牺牲的，CI 失败 block merge，没人能跳过。

**CI 配置两步走**：让 AI 先扫项目当前 CI 状态（有无 `.github/workflows/`、`.gitlab-ci.yml`、`Jenkinsfile`）→ 再写完整 workflow（触发条件、JDK 版本对齐 `pom.xml`、中间件用 `docker-compose.dev.yml` 起来、`mvn clean test`、测试报告到 artifact 区、Maven 依赖缓存）。

### Summary

本讲回答了三个问题：该不该补（按改造路径判断，三种必须补的情况）、要补哪些（Characterization Test > 核心链路集成 > 复杂逻辑单元 > 简单 CRUD 可不补）、怎么补（AI 出计划 → 一批一批补 + 配 CI 持续护栏）。两个关键约束："不要大而全"（数量上限）和"不要一口气"（分批 review）。Characterization Test 的灵魂是凭"实际是什么"写断言，而非 AI 业务直觉补断言。

## Key Takeaways

- **Characterization Test 是反直觉的**：不测"应该做什么"，而是先跑代码记录实际行为，再锁住这个行为——老项目的"应该"经常无从判断，但"实际"是确定的。
- **测试优先级四层**：Characterization Test（改造路径上）> 核心链路集成测试 > 复杂逻辑单元测试 > 简单 CRUD（可不补）。
- **每批 1-3 个，跑通才下一批**：一次性补 20 个，失败的无法判断对错，整批不可信；分批每批都是可信资产。
- **AI 写断言最危险的偏差**：用业务直觉补断言（按"应该"而非"实际"）——导致断言一跑代码就失败，误判为代码有 bug。提示词必须强制写："凭实际是什么，不凭应该是什么"。
- **CI 是长期复利**：30 分钟一次性投入，换一年上千次自动检查；强制 > 自觉，期望所有人自觉跑测试不可持续。
- **AI 写 CI 配置特别准**：标准化程度高，30 秒搞定人工查文档半天的工作，且 JDK 版本要对齐 `pom.xml`。

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[Characterization-Test]]：锁住代码"现在实际做什么"（而非"应该做什么"）的测试方法；来自 Michael Feathers《Working Effectively with Legacy Code》；关键：先跑代码记录实际行为，再转成断言
- [[test-plan]]：补测试计划文档（`docs/test-plan.md`），将 P0 缺口拆成每批 1-3 个批次，按价值优先级排序
- [[CI护栏]]：CI workflow 配置（`.github/workflows/test.yml`），每次 push/PR 自动跑 `mvn clean test`，失败 block merge
- [[补测试两步法]]：Step 1 AI 出 `test-plan.md` → Step 2 一批一批补，每批 1-3 个，跑通 review 通过再下一批
- [[AI断言偏差]]：AI 用业务直觉按"应该"写断言（而非跑代码记录"实际"）的隐性偏差，是 Characterization Test 最常见翻车点

### 2. 课程内导航链接
- [[002-understand-existing-tests-runnable-and-coverage|第 14 讲 摸清现有测试]]：产出 `test-gaps.md` P0 缺口清单，是本讲补测试的直接输入
- [[001-let-ai-be-your-environment-engineer|第 13 讲 让 AI 当你的环境工程师]]：环境跑通是集成测试（Step 2 集成测试用 SpringBootTest 起 context）的前提
- [[004-hands-on-complete-pre-transformation-guardrails-workflow|第 16 讲 实操课]]：把 13-15 讲所有提示词串起来完整跑一遍，包括 CI 跑通
- [[005-industry-landscape-2026-ai-legacy-code-academic-engineering|第 05 讲 业界全景]]：提出 Characterization Test 在 AI 时代的复兴背景

### 3. 课程外与通用概念关联
- [[characterization-test]]：Michael Feathers 原始概念；本讲在 AI 辅助下使成本从半天降为分钟级
- [[ci-cd]]：CI 集成测试护栏是软件工程标准实践，本讲聚焦在 AI 时代其配置变得更容易（AI 写 workflow）

### 4. 推荐关系边
- [[Characterization-Test]] → centers-on → [[AI断言偏差]]
- [[补测试两步法]] → implements → [[Characterization-Test]]
- [[CI护栏]] → protects → [[test-plan]]
- [[test-plan]] → centers-on → [[test-gaps]]
- [[Characterization-Test]] → enables → [[CI护栏]]

### 5. 后续值得沉淀成卡片的主题
- [[Characterization-Test]]
- [[AI断言偏差]]
- [[CI护栏]]
- [[补测试两步法]]

## Notes For Review
- "每批 1-3 个，最好 1 个"的节奏来自实际经验；复杂项目可能需要更细化到每批 1 个以保证 review 质量
- CI 的"Maven 依赖缓存"在国内项目中还需考虑镜像源问题（GitHub Actions 默认连 Maven Central 可能很慢）

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. Characterization Test 和普通单元测试的根本区别是什么？为什么老项目中"凭实际"比"凭应该"更可靠？
2. 补测试的四个优先级是什么？为什么"简单 CRUD 的单元测试"被放到最后甚至可以不补？
3. 为什么 CI 在 AI 时代的价值被特别强调？给出三个理由。

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> 普通测试测"应该做什么"（基于业务设计意图写断言）；Characterization Test 锁住"现在实际做什么"——先跑代码记录实际输入输出，再把这个行为转成断言。老项目中"应该"经常没人说得清（业务逻辑随历史演化、原始设计者离职），但"实际"是确定的。AI 容易按业务直觉用"应该"写断言，这些断言跑代码就失败，误判为代码有 bug，实际是测试写错了。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 四层优先级：①**改造路径上的 Characterization Test**（最高）——即将改的链路先锁住当前行为；②**核心数据写入的集成测试**——HTTP→Service→DB 完整链路，一条集成测试顶十个单元测试；③**业务逻辑复杂的单元测试**——算分/状态流转/权限校验，分支多需精准覆盖；④**简单 CRUD**（可不补）——AI 改 getter/setter/SELECT 出错概率本来就低，补了性价比最差。
>
> ---
>
> **题目 3 - 引导答案思路：**
> ①**配置标准化**：CI workflow 是高度重复的模板（JDK版本、触发条件、mvn test、Maven缓存），AI 30秒写完，人工查文档要半天。②**长期复利**：30分钟一次性投入，一年上千次自动运行——前期投入低，长期收益极高。③**强制 > 自觉**：靠团队自觉跑测试在deadline压力下必然失败，CI失败block merge是硬性约束，没有人能绕过。
