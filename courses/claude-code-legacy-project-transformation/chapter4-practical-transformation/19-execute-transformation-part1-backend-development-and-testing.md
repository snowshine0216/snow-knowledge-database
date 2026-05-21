---
tags: [claude-code, legacy-project, backend-development, characterization-test, tdd, ai-engineering]
source: https://time.geekbang.org/column/article/979207
wiki: wiki/claude/003-build-safety-net-tests-characterization-test-to-lock-behavior.md
---

## Pre-test

*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 什么是 Characterization Test？为什么改造前必须先写它，而不是改造后补？
2. 让 AI 执行改造时，"顺手优化"的风险是什么？如何在提示词和 review 环节双重防御？
3. 为什么 curl 验证返回结构不能让 AI 代劳，必须人来做？

---

## Chapter Metadata
- Course: Claude Code 企业级老项目改造实战
- Chapter: 019 — 执行改造（上）：后端开发跑通测试
- Author: Robert
- Article ID: 979207

## Cornell Notes

### Cue Column (Questions)
- Characterization Test 是什么，为什么在改造前必须有？
- 改造执行的四个原则是什么？
- 七步后端改造的每步产出是什么？
- AI 最常见的两种翻车行为是什么？如何防御？
- 为什么测试数要从改造前基线计数？

### Notes Column

**改造前：锁住现有行为**

Characterization Test 不是测"代码应该做什么"，而是锁住"代码现在实际做什么"。核心场景：`diffVersions` 要复用 `getByPromptKeyAndVersion`，复用就意味着 AI 可能"顺手"改这个老方法（改返回类型、加参数、调整空值处理）。锁住现有行为后，任何意外改动都会让测试失败，立即可见。

提示词关键约束：
- "不要凭'应该是什么'写断言，凭'实际跑出来是什么'写"
- 场景覆盖：正常返回（版本存在）+ 版本不存在抛 StudioException
- 断言基于的实际值：`createTime` 由 `LocalDateTime` 经系统时区转 epoch ms；版本不存在时 errMsg == `"Prompt版本不存在: no-key@v99"`（从源码读出，不是猜的）

**四个原则**

| 原则 | 具体操作 |
|---|---|
| 小步执行 | AI 按改造点分批：P01-P03 一批、P04-P05 一批、P06 一批；每批 review + commit 后再继续 |
| 自主修复 + 3 次兜底 | 编译错误/测试失败 AI 自己修，连续 3 次同一错误必须 stop 问人 |
| 复用现有结构 | 明确要求"对齐项目现有风格"：`Result<T>` 统一返回、`StudioException` 异常体系、lombok 注解风格 |
| 补测试不到位不算完成 | 每个改造点跑完必须有对应测试，无测试的改造点不算 Done |

**七步走**

**Step 1 Characterization Test**
- 提示词：先读 `getByPromptKeyAndVersion` 实现，记录实际行为，再照实际写断言
- 产出：2 个测试，`Tests run: 2, Failures: 0`，`BUILD SUCCESS`
- 测试放在 `spring-ai-alibaba-admin-server-start` 模块（原因：`PromptVersionServiceImpl` 和 `StudioException` 都在 server-start，server-core 无法访问）

**Step 2 建 DTO（P01-P03）**
- 提示词最后一句："只做 P01-P03，做完汇报，不要继续做 P04-P05"
- Review 重点：`git status` 应只有三个新建 java 文件，任何额外改动让 AI 撤销

**Step 3 实现 Service（P04-P05）**
- 提示词明确："不要重构 `getByPromptKeyAndVersion` 任何细节，只调用它"
- 实现要点：`diffVersions` 校验 versionA == versionB → 查 promptKey 存在 → 两次 Mapper 查版本 → 内存比较三字段
- null 处理：`String sa = a != null ? a : ""`，再 `!Objects.equals(sa, sb)` 判断 changed（用标准库，不引入额外依赖）
- 完成后立即跑 Step 1 的 Characterization Test，失败就 stop

**Step 4 加 Controller（P06）**
- 三个入参全部 `@RequestParam @NotBlank`
- 异常走全局 `GlobalExceptionHandler`，Controller 里不 try-catch
- 实际签名：`@GetMapping("/prompt/version/diff") → Result.success(promptVersionService.diffVersions(...))`

**Step 5 补单元测试 + curl 验证**
- 单元测试覆盖 4 个场景：E01 versionA==versionB / E02 versionA 不存在 / E04 template 为 null / happy path
- `@ExtendWith(MockitoExtension.class)` + mock 两个 Mapper（`PromptVersionMapper` + `PromptMapper`）
- curl 验证**必须人来做**：重点盯 `data` 字段存在、`diffs` 下三个字段有、`changed` 是 boolean 不是 null

**Step 6 全套 mvn test**
- 命令：`mvn test -pl runtime,core,start -am -fae`
- 结果：server-core 14 个 + server-start 6 个（2 Characterization + 4 diffVersions）= 20 个，0 失败
- 验收标准：总数 = 改造前基线 + 新增，测试数不对说明有测试被意外删了

**Step 7 提交 + 文档更新**
- `docs/api-list.md`：把"开发中"改为"已上线（后端）"，校对入参和返回结构
- 注意细节：`DiffFields` 是 `PromptVersionDiffResult` 的静态内部类，不是独立顶层类；文档要反映这个嵌套结构

**两大翻车点及防御**

**翻车一：AI 顺手优化老代码**
- 每个提示词加"不要重构现有方法"
- 每步 commit 前 `git diff` 扫范围，超出的改动一律撤销
- Characterization Test 作为最后兜底：哪怕 AI 偷改了，行为变了测试就失败

**翻车二：AI 凭"应该"写测试断言**
- 提示词硬话："不要凭'应该'写，凭'实际跑出来是什么'写"
- Review 时盯断言：看到 `assertEquals(100, result.getXxx())` 就追问"100 从哪来的？"
- 测试失败时先怀疑测试写法，不要先怀疑代码

### Summary

执行改造分七步，核心是三个兜底机制：Characterization Test 锁住现有行为（改造前）、小步执行 + git diff 验证范围（改造中）、全套 mvn test 验证总量（改造后）。两大翻车点："AI 顺手优化老代码"和"AI 凭应该写测试断言"，前者靠提示词约束 + git diff 防御，后者靠提示词硬话 + review 时追问断言来源。老项目改造：慢就是快，细致的提示词和严格的 review 比返工代价小得多。

## Key Takeaways
- **Characterization Test 是改造前的必选项**：不是测"应该"，是锁住"现在实际做什么"；没有它，AI 改坏可能两周后才发现
- **小步执行的价值**：按改造点分批，每批 review + commit，出错知道是哪一步出的，回退有据
- **`git diff` 是最可靠的范围验证**：每步提交前看 diff，超出改造点范围的改动一律撤销，不管"优化"看起来多合理
- **断言来源是测试质量的核心指标**：凭"应该"写的断言测试失败时是误报，不能发现真正的行为变化
- **curl 验证不能让 AI 代劳**：序列化字段名拼错、类型异常等问题只有人眼看到 JSON 才算验证完
- **20 个测试 = 14（基线）+ 6（新增）**：总数不对就说明有测试被删，这是改造完整性的量化指标

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[Characterization-Test]]：锁住代码"现在实际做什么"的测试，改造前必写，断言来自实际运行而非猜测
- [[小步执行原则]]：按改造点分批改造，每批 review + commit，防止一口气改完后无法定位问题
- [[改造四原则]]：小步执行 + 自主修复3次兜底 + 复用现有结构 + 测试不到位不算完成
- [[断言来源审查]]：review 时盯 `assertEquals` 追问值的来源，凭"应该"写的断言无法发现真实行为变化
- [[AI顺手优化风险]]：AI 在执行改造时默认会"顺手"重构现有代码，必须提示词约束 + git diff 双重防御
- [[总测试数量基线]]：改造前后测试总数变化是完整性指标；新增测试数 = 新改造点覆盖

### 2. 课程内导航链接
- [[001-from-requirements-to-transformation-plan-let-ai-think-it-through|第 18 讲 从需求文档到改造方案]]：本讲执行的输入来源，P01-P06 改造点来自方案文档
- [[003-build-safety-net-tests-characterization-test-to-lock-behavior|第 15 讲 Characterization Test]]：本讲 Step 1 的理论基础，这一讲是第一次在真实改造中落地
- [[003-execute-transformation-part2-frontend-development-and-api-integration|第 20 讲 执行改造下]]：本讲后端改造完成后，前端改造的上游
- [[001-legacy-project-handoff-and-delivery-true-workflow|第 01 讲 改造真实链路]]：宏观流程，本讲对应"执行后端改造"阶段

### 3. 课程外与通用概念关联
- [[test-driven-development]]：Characterization Test 是 TDD 在遗留代码场景的特殊形式，先写测试再改代码
- [[ai-as-researcher-human-as-decision-maker]]：AI 执行 7 步，人 review 每步范围和断言来源，分工明确

### 4. 推荐关系边
- [[Characterization-Test]] → protects → [[现有行为]]
- [[小步执行原则]] → enables → [[精确故障定位]]
- [[改造四原则]] → constrains → [[AI执行改造]]
- [[断言来源审查]] → prevents → [[假通过测试]]
- [[AI顺手优化风险]] → governed-by → [[git-diff范围验证]]

### 5. 后续值得沉淀成卡片的主题
- [[Characterization-Test]]
- [[小步执行原则]]
- [[断言来源审查]]
- [[AI顺手优化风险]]

## Notes For Review
- Step 5 中"mock PromptVersionMapper 和 PromptMapper 两个"——如何确认 diffVersions 实现里调用了哪些 Mapper，需要读实现代码？
- 3 次兜底机制是否需要在 CLAUDE.md 里写为项目级约束，还是每次提示词里手动加？

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. Characterization Test 的断言应该怎么写？为什么不能"凭直觉"写断言？用具体案例说明。
2. 执行改造的四个原则是什么？"小步执行"具体指什么操作，为什么不让 AI 一口气改完 P01-P06？
3. 为什么改造完后要验证"总测试数 = 改造前基线 + 新增"？如果数字对不上说明什么？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> 断言必须基于"实际跑出来的值"：先读实现代码，记录它实际做的事，再照实际写断言。案例中 `createTime` 的断言值来自"LocalDateTime 经系统时区转 epoch ms"的实际计算，errMsg 的格式来自"从源码读出的字符串模板 `Prompt版本不存在: no-key@v99`"。凭直觉写断言的风险：AI 可能写 `assertNotNull(result)` 但实际业务数据可能返回 null，测试就失败但不是因为改造破坏了行为，而是测试本身写错了——这样的测试失败是噪音，真正的行为变化反而没被检测到。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 四原则：（1）小步执行——按改造点分批，P01-P03 一批、P04-P05 一批、P06 一批，每批 review + commit 再继续；（2）自主修复 + 3 次兜底——AI 自己修错误，连续 3 次同一错误 stop 问人；（3）复用现有结构——对齐项目风格（Result<T>、StudioException、lombok）；（4）测试不到位不算完成。不让 AI 一口气改完的原因：出错时不知道是哪一步出的，回退也困难；分步改每步有 git commit，出错精确定位到哪批改造点。
>
> ---
>
> **题目 3 - 引导答案思路：**
> 总测试数是改造完整性的量化指标：改造前基线 14 个（server-core），新增 6 个（2 个 Characterization Test + 4 个 diffVersions 单元测试），合计应为 20。数字对不上的含义：如果少了，说明有测试被意外删掉或 skip 了（AI 可能在修编译错误时删了测试）；如果多了，说明 AI 可能重复生成了测试或改了现有测试文件。两种情况都需要 git diff 查明原因。
